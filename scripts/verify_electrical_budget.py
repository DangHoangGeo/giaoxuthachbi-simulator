#!/usr/bin/env python3
"""Independently audit held load/quantity/price exports, not construction safety."""
from __future__ import annotations
import argparse,copy,csv,hashlib,json,math,subprocess,tempfile
import sys
from pathlib import Path
from unittest.mock import patch
import pdfplumber
from pypdf import PdfReader
from electrical_review import analyse,current,vd_bound

ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads(p.read_text())
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def require(ok,message):
    if not ok:raise ValueError(message)
def close(a,b,label):require(math.isclose(a,b,rel_tol=1e-10,abs_tol=1e-7),label)
def csvrows(p):
    with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))

def audit(out):
    manifest=read(out/'manifest.json');snapshot=read(out/'load-snapshot.json')
    result=read(out/'route-load-review.json');budget=read(out/'budget-japan.json')
    require(not manifest['draft'],'Draft cannot be delivered as final')
    for group in ('sourceSha256','fontSha256','modelSourceSha256'):
        for name,h in manifest[group].items():require(digest(ROOT/name)==h,'Changed source: '+name)
    expected={'load-snapshot.json','route-load-review.json','budget-japan.json','route-load-schedule.csv','equipment-budget.csv','budget-quantity-groups.csv','open-questions.csv','thach-bi-cable-load-review-vi.pdf','thach-bi-budget-japan-vi.pdf'}
    require(set(manifest['outputSha256'])==expected,'Unexpected or missing outputs')
    for name,h in manifest['outputSha256'].items():require(digest(out/name)==h,'Changed output: '+name)
    with tempfile.TemporaryDirectory() as td:
        p=Path(td)/'fresh.json';subprocess.run(['node','scripts/export_electrical_loads.cjs',str(p)],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
        fresh=read(p)
    # A later documentation commit does not invalidate identical model inputs.
    fresh.pop('gitRevision');old=copy.deepcopy(snapshot);old.pop('gitRevision')
    require(fresh==old,'Actual model differs from delivered snapshot')
    print('PASS source/output/register hashes and fresh model equivalence')

    items={i['id']:i for i in snapshot['items']};raw={r['id']:r for r in snapshot['full']['routes']}
    rows={r['route_id']:r for r in result['routes']};require(len(rows)==len(raw) and set(rows)==set(raw),'Route identity coverage')
    installed={c['id'] for c in snapshot['full']['components'] if not c['hiddenAlternative']}
    cases={c['id']:c for c in result['inputs']['comparison_cases']};reserve=result['inputs']['planning_reserve_factor']
    table={1.5:15,2.5:20,4:27,6:34,10:46,16:62,25:80,35:99,50:118,70:149,95:179,120:206}
    known_total=sum(i['maximumMainsProxyW'] for i in items.values() if not i['hidden'] and i['maximumMainsProxyW'] is not None)
    close(known_total,result['summary']['model_maximum_known_mains_proxy_w'],'Unique maximum load')
    require(result['summary']['maximum_complete_mains_load_w'] is None and result['summary']['av1_maximum_mains_w'] is None,'Incomplete total promoted')
    cable_total=quote_total=0;pieces=0
    for id,row in rows.items():
        r=raw[id];ids=set(row['equipment_ids']);require(ids<=installed,'Unconnected endpoint')
        geom=sum(math.sqrt(sum((b[k]-a[k])**2 for k in range(3))) for a,b in zip(r['points'],r['points'][1:]))
        close(row['model_segment_length_m'],geom,'Independent geometry '+id)
        length=0 if r['kind'] in ('audio','mic') and r['role']=='trunk' else r['length']+r.get('upstreamLength',0) if r.get('homeRun') else r['length']
        close(row['model_cable_length_m'],length,'Cable ownership '+id)
        quoted=length*(1+result['inputs']['quote_length_allowance_percent']/100)+result['inputs']['quote_termination_allowance_m_per_piece'] if length else 0
        close(row['quote_length_m'],quoted,'Allowance '+id);cable_total+=length;quote_total+=quoted;pieces+=bool(length)
        if r['role']=='feeder' and id!='feeder:AV1':
            downstream={i for route in raw.values() if route['source']==id.split(':')[1] and route['kind'] not in ('audio','mic') for i in route['itemIds']}
            require(ids==downstream,'Feeder unique membership '+id)
        elif id!='feeder:AV1':require(ids==set(r['itemIds']),'Branch/trunk membership '+id)
        pending=('approved_cable','approved_breaker_a','approved_design_current_a','fault_disconnection_check','adiabatic_short_circuit_check','earthing_pe_check','manufacturer_inrush_check','harmonic_neutral_check','fire_performance_check')
        require(all(row[k] is None for k in pending),'Unverified approval '+id)
        signal=r['kind'] in ('audio','mic') or id=='feeder:AV1'
        if signal:
            require(row['catalogue_maximum_mains_proxy_w'] is None and not row['comparison_cases'],'Audio incorrectly treated as mains '+id)
            continue
        load=sum(items[i]['maximumMainsProxyW'] or 0 for i in ids)
        close(row['catalogue_maximum_mains_proxy_w'],load,'Route maximum '+id)
        close(row['planning_w_with_reserve'],load*reserve,'Reserve '+id)
        require(len(row['comparison_cases'])==len(cases),'Missing case '+id)
        for c in row['comparison_cases']:
            case=cases[c['case_id']];u=case['voltage_v'];pf=case['power_factor'];amps=load*reserve/u/pf
            close(c['planning_current_a'],amps,'Watts/PF conversion '+id)
            cb=c['comparison_breaker_a'];area=c['comparison_area_mm2'];f=case['temperature_factor']*case['grouping_factor']
            circuit_load=sum(i['maximumMainsProxyW'] or 0 for i in items.values() if i['id'] in installed and not i['hidden'] and i['circuit']==r['circuit'])
            expected_amps=amps if r['role']=='feeder' else circuit_load*reserve/u/pf
            expected_cb=next((b for b in [6,10,16,20,25,32,40,50,63,80,100,125,160] if b>=expected_amps),None)
            require(cb==expected_cb,'Shared upstream protection '+id)
            if area is None:require(c['status']=='NO CANDIDATE IN TABLE','Missing cable concealed '+id);continue
            require(amps<=cb<=table[area]*f+1e-9,'Derated overload inequality '+id)
            drop=2*amps*(23.7/area+.08)*r['length']/1000
            close(c['segment_vdrop_bound_v'],drop,'Single-phase one-way voltage drop '+id)
            limit=u*c['allocated_segment_vdrop_percent']/100
            require(drop<=limit+1e-9,'Segment voltage budget '+id)
            smaller=[a for a in table if a<area]
            if smaller:
                prev=max(smaller)
                require(cb>table[prev]*f or 2*amps*(23.7/prev+.08)*r['length']/1000>limit,'Non-minimal comparison candidate '+id)
            path=drop
            if r.get('trunkId'):
                t=next(v for v in rows[r['trunkId']]['comparison_cases'] if v['case_id']==c['case_id'])
                path+=2*t['planning_current_a']*(23.7/t['comparison_area_mm2']+.08)*r['upstreamLength']/1000
            if r['source']!='DB1':
                feeder=next(v for v in rows['feeder:'+r['source']]['comparison_cases'] if v['case_id']==c['case_id'])
                path+=feeder['segment_vdrop_bound_v']
            close(c['path_vdrop_bound_from_db1_v'],path,'Feeder/trunk/path ownership '+id)
            require(c['whole_installation_vdrop_percent'] is None,'Missing utility feed marked passing '+id)
    close(cable_total,result['summary']['model_cable_centreline_m'],'Cable total');close(quote_total,result['summary']['quote_cable_m'],'Quote total')
    print(f'PASS independent load/current/ampacity/drop/path audit: {len(rows)} routes; {pieces} cable pieces')

    equipment=csvrows(out/'equipment-budget.csv');ids=[r['id'] for r in equipment]
    require(len(ids)==len(set(ids)) and set(ids)==set(items)|set(snapshot['full']['sources']),'Equipment/enclosure coverage')
    require(all(r['quantity']=='1' and not r['selected_product'] and not r['manufacturer_nameplate_w'] and not r['approved_price_jpy'] for r in equipment),'Equipment approval/value preservation')
    require({r['route_id'] for r in csvrows(out/'route-load-schedule.csv')}==set(raw),'CSV route coverage')
    prices=read(ROOT/'docs/budget/amazon-price-references.json');refs={r['reference_id']:r for r in prices['references']}
    require(len(refs)==len(prices['references']),'Duplicate retail reference')
    mappings=budget['assumptions']['selected_price_reference_by_type'];membership=[];subtotal=0;eligible=0
    for l in budget['lines']:
        membership+=l['equipment_ids'];require(l['quantity']==len(l['equipment_ids']),'Quantity group cardinality')
        ref=refs.get(mappings.get(l['type']))
        if l['included_in_comparison_subtotal']:
            require(ref and ref['marketplace']=='amazon.co.jp' and ref['currency']=='JPY' and ref['pack_unit']=='item' and ref['pricing_scope']=='complete_assembly','Inappropriate retail price extension')
            require(l['type'] in ref['matched_type_ids'] and not l['scope'].startswith('Hidden'),'Wrong/hidden reference')
            group=[e for e in equipment if e['id'] in l['equipment_ids']]
            require(all(e['electrical_kind'] in ('passive-audio','microphone-signal','non-electrical','distribution/control') for e in group) or ref['input_voltage_220_240_compatible'] is True,'100 V/missing mains product counted')
            amount=math.ceil(l['quantity']/ref['pack_quantity'])*ref['price'];close(l['comparison_extension_jpy'],amount,'Pack extension');subtotal+=amount;eligible+=1
    require(len(membership)==len(set(membership)) and set(membership)==set(ids),'Groups duplicate/omit equipment')
    require(budget['summary']['priced_comparison_subtotal_jpy']==(subtotal if eligible else None),'Partial comparison subtotal')
    require(budget['summary']['complete_installed_project_budget_jpy'] is None and budget['summary']['complete_equipment_budget_jpy'] is None,'Incomplete budget claimed complete')
    questions=read(ROOT/'docs/engineering/questions-for-parish-and-designers.json')['questions']
    require(len({q['id'] for q in questions})==len(questions) and {q['id'] for q in questions}=={q['id'] for q in csvrows(out/'open-questions.csv')},'Question coverage')
    print(f'PASS quantities, pack/currency/exclusion rules and {len(questions)} open questions')

    texts={};page_count={}
    for name in ('thach-bi-cable-load-review-vi.pdf','thach-bi-budget-japan-vi.pdf'):
        reader=PdfReader(out/name);texts[name]='\n'.join(p.extract_text() for p in reader.pages);page_count[name]=len(reader.pages)
        require(all(abs(float(p.mediabox.width)-420*72/25.4)<1 and abs(float(p.mediabox.height)-297*72/25.4)<1 for p in reader.pages),'Not A3 landscape')
        require(all('CHƯA PHÊ DUYỆT' in p.extract_text() for p in reader.pages),'Missing printed hold')
        for q in questions:require(q['id'] in texts[name],'Printed question omitted')
        with pdfplumber.open(out/name) as pdf:
            for page in pdf.pages:
                for ch in page.chars:
                    require(ch['x0']>=0 and ch['x1']<=page.width+.1 and ch['top']>=0 and ch['bottom']<=page.height+.1,'Off-page PDF text')
                    require(ch['size']>=6.9,'Unreadable text size')
        fonts=[f.get_object() for p in reader.pages for f in p['/Resources'].get_object().get('/Font',{}).get_object().values()]
        require(any(f.get('/ToUnicode') and f.get('/FontDescriptor') and f['/FontDescriptor'].get_object().get('/FontFile2') for f in fonts),'Vietnamese font not embedded')
    for id in raw:require(id in texts['thach-bi-cable-load-review-vi.pdf'],'Unprinted route '+id)
    print('PASS all route IDs, Vietnamese glyph mapping, A3 bounds and printed holds: '+str(page_count))

    # Analytical cases and failures catch unit/factor errors, stale endpoints,
    # fake approvals and accidentally accepted NaN. No source mutation.
    close(current(2300,230,1),10,'Analytical unity PF current')
    close(current(2300,230,.5),20,'Analytical PF current')
    close(vd_bound(10,100,2.5),19.12,'Analytical 100 m single-phase drop')
    probes=[]
    for key,value in [('planning_reserve_factor',.9),('quote_length_allowance_percent',-1),('planning_reserve_factor',float('nan')),('equipment_nameplates',{'L1':{'W':20}}),('route_approvals',{'example':'approved'})]:
        changed=copy.deepcopy(result['inputs']);changed[key]=value;probes.append((snapshot,changed))
    changed=copy.deepcopy(result['inputs']);changed['supply']['voltage_v']=230;probes.append((snapshot,changed))
    changed=copy.deepcopy(result['inputs']);changed['comparison_cases'][0]['grouping_factor']=2;probes.append((snapshot,changed))
    for kind in ('duplicate','length','endpoint'):
        changed=copy.deepcopy(snapshot)
        if kind=='duplicate':changed['full']['routes'].append(changed['full']['routes'][0])
        if kind=='length':changed['full']['routes'][0]['length']+=1
        if kind=='endpoint':changed['full']['routes'][0]['itemIds']=['not-an-item']
        probes.append((changed,result['inputs']))
    for s,i in probes:
        try:analyse(s,i)
        except ValueError:pass
        else:raise ValueError('Invalid input accepted')
    print(f'PASS analytical cases and {len(probes)} invalid-input refusals')
    from build_electrical_budget import make_budget
    sample=[{'id':str(n),'type':'test','scope':'Shown model scope','electrical_kind':'passive-audio','specifications':'test','catalogue_description':None} for n in range(3)]
    price={'reference_id':'pair','matched_type_ids':['test'],'currency':'JPY','price':1000,'pack_quantity':2,'pack_unit':'item','pricing_scope':'complete_assembly','product_title':'Pair','url':'https://www.amazon.co.jp/example','input_voltage_220_240_compatible':None}
    assumptions={'selected_price_reference_by_type':{'test':'pair'}}
    pack=make_budget(sample,{'references':[price]},assumptions)
    require(pack['summary']['priced_comparison_subtotal_jpy']==2000,'Pack rounding analytical case')
    for e in sample:e['electrical_kind']='mains'
    price['input_voltage_220_240_compatible']=False
    require(make_budget(sample,{'references':[price]},assumptions)['summary']['priced_comparison_subtotal_jpy'] is None,'100 V mains erroneously budgeted')
    price['input_voltage_220_240_compatible']=True;price['pricing_scope']='body_only'
    require(make_budget(sample,{'references':[price]},assumptions)['summary']['priced_comparison_subtotal_jpy'] is None,'Body price treated as complete assembly')
    price['pricing_scope']='complete_assembly'
    for e in sample:e['scope']='Hidden alternative / excluded'
    require(make_budget(sample,{'references':[price]},assumptions)['summary']['priced_comparison_subtotal_jpy'] is None,'Hidden alternative counted')
    print('PASS independent pack rounding, 100 V/component/hidden price exclusions')
    import build_electrical_budget as builder
    with tempfile.TemporaryDirectory() as td:
        folder=Path(td)/'delivered';folder.mkdir();sentinel=folder/'manifest.json';sentinel.write_bytes(b'previous issue')
        def adapter(args,**kwargs):Path(args[-1]).write_text(json.dumps(snapshot))
        with patch.object(sys,'argv',['builder','--output',str(folder)]),patch.object(builder.subprocess,'run',side_effect=adapter),patch.object(builder,'electrical_pdf',side_effect=ValueError('Injected PDF failure')):
            try:builder.main()
            except ValueError as exc:require(str(exc)=='Injected PDF failure','Wrong failure probe')
            else:raise ValueError('Failure probe did not fail')
        require(sentinel.read_bytes()==b'previous issue' and len(list(folder.iterdir()))==1,'Failed PDF replaced previous issue')
        report=builder.Report(folder/'unused.pdf','Glyph check',snapshot['gitRevision'])
        try:report.p('\u2264')
        except ValueError:pass
        else:raise ValueError('Unsupported glyph accepted')
    print('PASS failed-PDF preservation and unsupported-glyph refusal')
    return page_count

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--output',default='output/electrical-review');args=ap.parse_args()
    audit(Path(args.output).resolve());print('All software/package checks pass. Engineering holds remain.')
