"""Independent, explicit cable-screen calculations. Never authorises a cable."""
from __future__ import annotations
import math
from collections import defaultdict

# Schneider EIG G20: PVC/Cu, B2, THREE loaded conductors, 30 C reference.
B2 = {1.5:15,2.5:20,4:27,6:34,10:46,16:62,25:80,35:99,50:118,70:149,95:179,120:206}
BREAKERS = [6,10,16,20,25,32,40,50,63,80,100,125,160]
RHO = 23.7  # Hot-copper comparison ohm mm2 / km, not selected cable resistance.
REACTANCE = .08  # Comparison ohm/km, not manufacturer data.

def current(watts, voltage, pf):
    if watts is None: return None
    if not all(math.isfinite(v) for v in (watts,voltage,pf)) or watts < 0 or voltage <= 0 or not 0 < pf <= 1: raise ValueError('Invalid current inputs')
    return watts / (voltage * pf)

def vd_bound(amps, metres, area):
    """Triangle bound from single-phase R/X formula; one-way length."""
    if not all(math.isfinite(v) for v in (amps,metres,area)) or amps < 0 or metres < 0 or area <= 0: raise ValueError('Invalid voltage-drop inputs')
    return 2 * amps * (RHO / area + REACTANCE) * metres / 1000

def choose_area(amps, breaker, metres, voltage_budget, factors):
    if amps is None or breaker is None: return None
    for area, base in B2.items():
        iz = base * factors
        if amps <= breaker <= iz and vd_bound(amps,metres,area) <= voltage_budget + 1e-10:
            return area
    return None

def analyse(snapshot, inputs):
    # This version deliberately cannot accept real design approvals. Refuse
    # populated fields instead of silently leaving them out of calculations.
    if inputs.get('equipment_nameplates') or inputs.get('route_approvals') or any(v is not None for k in ('supply','installation') for v in inputs[k].values()):
        raise ValueError('Confirmed inputs need an engineer-reviewed calculation revision; this comparison engine cannot consume or approve them')
    if not inputs['comparison_cases'] or len({c['id'] for c in inputs['comparison_cases']}) != len(inputs['comparison_cases']):
        raise ValueError('Missing or duplicate comparison cases')
    allowances=(inputs['quote_length_allowance_percent'],inputs['quote_termination_allowance_m_per_piece'])
    if any(not math.isfinite(v) or v<0 for v in allowances): raise ValueError('Invalid quotation allowance')
    items={i['id']:i for i in snapshot['items']}
    routes=snapshot['full']['routes']; by_route={r['id']:r for r in routes}
    if len(items)!=len(snapshot['items']) or len(by_route)!=len(routes): raise ValueError('Duplicate source ID')
    installed={c['id'] for c in snapshot['full']['components'] if not c['hiddenAlternative']}
    if any(set(r['itemIds'])-installed for r in routes): raise ValueError('Unknown route endpoint')
    for r in routes:
        if not math.isfinite(r['length']) or r['length']<0 or any(not math.isfinite(v) for p in r['points'] for v in p): raise ValueError('Invalid route geometry '+r['id'])
        if abs(sum(math.dist(a,b) for a,b in zip(r['points'],r['points'][1:]))-r['length'])>1e-6: raise ValueError('Route geometry mismatch '+r['id'])
    reserve=inputs['planning_reserve_factor']
    if not math.isfinite(reserve) or reserve<1: raise ValueError('Reserve below maximum load')
    for i in items.values():
        for key in ('maximumMainsProxyW','operatingModelW','audioRatingW'):
            v=i[key]
            if v is not None and (not math.isfinite(v) or v<0): raise ValueError('Invalid load '+i['id'])
    circuits=defaultdict(list)
    for i in items.values():
        if not i['hidden'] and i['id'] in installed: circuits[i['circuit']].append(i)
    def known_load(ids):
        return sum(items[i]['maximumMainsProxyW'] or 0 for i in sorted(set(ids)))
    def operation(ids): return sum(items[i]['operatingModelW'] for i in sorted(set(ids)))
    def source_members(source):
        return sorted({i for r in routes if r['source']==source and r['kind'] not in ('audio','mic') for i in r['itemIds']})
    feeder_members={f'feeder:{source}':source_members(source) for source in ('DB2','LC1','FC1')}
    av_members=sorted(i for i in installed if items[i]['electricalKind'] in ('passive-audio','microphone-signal'))
    feeder_members['feeder:AV1']=av_members
    records=[]
    for r in routes:
        signal=r['kind'] in ('audio','mic')
        ids=feeder_members.get(r['id'],r['itemIds'])
        audio_unknown=r['id']=='feeder:AV1' or any(items[i]['electricalKind']=='active-speaker' for i in ids)
        watts=None if signal or audio_unknown else known_load(ids)
        operating=operation(ids)
        record={
            'route_id':r['id'],'name':r['name'],'source':r['source'],'board':r['board'],'circuit':r['circuit'],
            'kind':r['kind'],'role':r['role'],'equipment_ids':list(ids),'model_segment_length_m':r['length'],
            'model_cable_length_m':0 if signal and r['role']=='trunk' else (r['length']+r.get('upstreamLength',0) if r.get('homeRun') else r['length']),
            'length_basis':'Bundle corridor only; no additional cable quantity' if signal and r['role']=='trunk' else 'Complete individual signal home run' if r.get('homeRun') else 'One modeled mains trunk/branch/local/feeder piece',
            'operating_downstream_model_w':operating,'operating_downstream_model_kwh_per_service':operating*snapshot['settings']['serviceHours']/1000,
            'catalogue_maximum_mains_proxy_w':watts,'planning_w_with_reserve':None if watts is None else watts*reserve,
            'audio_rating_w':sum(items[i]['audioRatingW'] or 0 for i in ids) if r['kind']=='audio' else None,
            'approved_cable':None,'approved_breaker_a':None,'approved_design_current_a':None,
            'fault_disconnection_check':None,'adiabatic_short_circuit_check':None,'earthing_pe_check':None,
            'manufacturer_inrush_check':None,'harmonic_neutral_check':None,'fire_performance_check':None,
            'status':'ENGINEERING HOLD','comparison_cases':[],
            'installation':r['installation'],'start_xyz_m':r['points'][0],'end_xyz_m':r['points'][-1]
        }
        record['quote_length_m']=0 if record['model_cable_length_m']==0 else record['model_cable_length_m']*(1+inputs['quote_length_allowance_percent']/100)+inputs['quote_termination_allowance_m_per_piece']
        if signal:
            record['signal_cable_requirement']='Balanced shielded microphone pair; phantom power/connector/product pending' if r['kind']=='mic' else 'Speaker cable or line-level signal cable; amplifier topology/line voltage/impedance/taps pending'
            record['audio_100v_rating_current_a']=record['audio_rating_w']/100 if record['audio_rating_w'] is not None else None
            record['audio_100v_rating_current_status']='Comparison only: all audio nameplate ratings treated as 100 V taps; actual taps/topology unknown'
        elif audio_unknown:
            record['hold_reason']='AV amplifier/mixer/DSP/receiver mains input and standby loads unknown; passive-speaker audio ratings cannot size this feed'
        else:
            record['hold_reason']='Catalogue maximum proxy only; selected products, actual supply, protection, inrush, installation, origin voltage drop and engineering approval pending'
        records.append(record)
    rows={r['route_id']:r for r in records}
    for case in inputs['comparison_cases']:
        u,pf=case['voltage_v'],case['power_factor']; factors=case['temperature_factor']*case['grouping_factor']
        if not all(math.isfinite(v) for v in (u,pf,case['temperature_factor'],case['grouping_factor'])) or u<=0 or not 0<pf<=1 or not 0<case['temperature_factor']<=1 or not 0<case['grouping_factor']<=1: raise ValueError('Invalid comparison case')
        circuit_breaker={}
        for circuit,members in circuits.items():
            load=known_load([i['id'] for i in members])*reserve
            amps=current(load,u,pf)
            circuit_breaker[circuit]=next((b for b in BREAKERS if b>=amps),None)
        # Feeders have their own protection comparison; common circuit protection
        # applies to every branch (a small branch load is not a small breaker).
        results={}
        for rec in records:
            w=rec['planning_w_with_reserve']; amps=current(w,u,pf)
            if amps is None: continue
            breaker=next((b for b in BREAKERS if b>=amps),None) if rec['role']=='feeder' else circuit_breaker[rec['circuit']]
            fan=rec['kind']=='fan'; budget_pct=1 if rec['role']=='feeder' or not fan else 2
            area=choose_area(amps,breaker,rec['model_segment_length_m'],u*budget_pct/100,factors)
            results[rec['route_id']]={
                'case_id':case['id'],'voltage_v':u,'pf':pf,'maximum_proxy_current_a':current(rec['catalogue_maximum_mains_proxy_w'],u,pf),
                'planning_current_a':amps,'comparison_breaker_a':breaker,'comparison_area_mm2':area,
                'comparison_conductors':'3 copper cores (L/N/PE), assumed single-phase; actual PE and phases pending',
                'corrected_ampacity_a':None if area is None else B2[area]*factors,
                'temperature_grouping_factor':factors,'segment_vdrop_bound_v':None if area is None else vd_bound(amps,rec['model_segment_length_m'],area),
                'allocated_segment_vdrop_percent':budget_pct,
                'path_vdrop_bound_from_db1_v':None,'path_vdrop_percent_from_db1':None,
                'whole_installation_vdrop_percent':None,'status':'CONDITIONAL SCREEN ONLY' if area else 'NO CANDIDATE IN TABLE'
            }
        for rec in records:
            result=results.get(rec['route_id'])
            if not result: continue
            upstream=[]; raw=by_route[rec['route_id']]
            if raw.get('trunkId'):
                trunk=results.get(raw['trunkId']);
                # All trunk load at every point is an explicit conservative bound.
                upstream.append(None if not trunk or trunk['comparison_area_mm2'] is None else vd_bound(trunk['planning_current_a'],raw['upstreamLength'],trunk['comparison_area_mm2']))
            if rec['source']!='DB1':
                feeder=results.get('feeder:'+rec['source']); upstream.append(None if not feeder else feeder['segment_vdrop_bound_v'])
            values=upstream+[result['segment_vdrop_bound_v']]
            path=None if any(v is None for v in values) else sum(values)
            result['path_vdrop_bound_from_db1_v']=path
            result['path_vdrop_percent_from_db1']=None if path is None else 100*path/u
            result['comparison_path_target_percent']=5 if rec['kind']=='fan' else 3
            result['comparison_path_screen']=None if path is None else 100*path/u<=result['comparison_path_target_percent']+1e-9
            rec['comparison_cases'].append(result)
    # Keep all configurations visible; no average between uncertain cases.
    for rec in records:
        rec['comparison_budget_area_mm2']=max((c['comparison_area_mm2'] for c in rec['comparison_cases'] if c['comparison_area_mm2'] is not None),default=None)
        if any(c['comparison_area_mm2'] is None for c in rec['comparison_cases']): rec['comparison_budget_area_mm2']=None
    max_known=sum(i['maximumMainsProxyW'] or 0 for i in items.values() if not i['hidden'])
    return {'schema':1,'status':'ENGINEERING HOLD / comparison sizing, not purchasing approval',
        'equipment':snapshot['items'],'routes':records,'inputs':inputs,
        'summary':{
            'equipment_items':len(items),'enclosures':len(snapshot['full']['sources']),'connected_items':len(installed),'routes':len(records),
            'model_maximum_known_mains_proxy_w':max_known,'known_proxy_with_reserve_w':max_known*reserve,
            'maximum_complete_mains_load_w':None,'av1_maximum_mains_w':None,
            'operating_model_w':snapshot['operatingSummary']['total'],
            'service_hours':snapshot['settings']['serviceHours'],
            'model_cable_centreline_m':sum(r['model_cable_length_m'] for r in records),
            'quote_cable_m':sum(r['quote_length_m'] for r in records),
            'bundle_corridors_excluded_from_cable_m':sum(r['model_segment_length_m'] for r in records if r['length_basis'].startswith('Bundle')),
            'conduit_tray_purchase_length_m':None,'approved_cable_routes':0,
            'known_proxy_supply_current_cases':[{ 'case_id':c['id'],'known_only_current_a':current(max_known*reserve,c['voltage_v'],c['power_factor'])} for c in inputs['comparison_cases']],
            'limitations':['All routes remain held; faults, PE, inrush, actual products and supply absent','AV rack/nameplate loads excluded from maximum; total is a known-subset proxy, not an upper bound of the installation','No diversity; all shown light/fan catalogue maxima included, even normally-off items','Operating estimates are traced loads, not energy consumed by the route; never sum upstream and downstream rows','No utility-to-DB1 route; total installation voltage drop cannot pass','Conduit/tray quantities require unique shared containment geometry and fill/separation design']}}
