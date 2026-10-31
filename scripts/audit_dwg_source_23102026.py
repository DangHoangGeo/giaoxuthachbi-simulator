#!/usr/bin/env python3
"""Cross-check extraction against a fresh DWG decode, fresh DXF and independent arithmetic.

The two LibreDWG outputs are NOT independent CAD engines. Native AutoCAD/ODA
and the designer's dimensional/unit confirmation remain required for construction.
Raw decoder metadata is kept only in the ignored local export directory.
"""
import csv
import gc
import gzip
import hashlib
import json
import math
from collections import Counter
from collections import defaultdict
from pathlib import Path

import openpyxl
from ezdxf import recover

from extract_dwg_revision import ROOT, OUT, DRAWINGS, LEVEL, to_model, drawing_at

DEST=ROOT/'exports/23102026/_audit'
PUBLIC=ROOT/'review/dwg-vietnamese-23102026'


def read_csv(name):
    with (OUT/name).open(encoding='utf-8',newline='') as stream:
        return list(csv.DictReader(stream))


def main():
    PUBLIC.mkdir(parents=True,exist_ok=True)
    manifest=json.loads((OUT/'sheets.json').read_text())
    source=ROOT/manifest['source']['local_copy']
    digest=hashlib.sha256(source.read_bytes()).hexdigest()
    assert digest==manifest['source']['sha256']
    native_path=DEST/'original-dwg.json'
    if native_path.exists():
        native=json.loads(native_path.read_text())
    else:
        with gzip.open(str(native_path)+'.gz','rt',encoding='utf-8') as stream:
            native=json.load(stream)
    objects=native['OBJECTS']
    header={k:native['HEADER'].get(k) for k in ('INSUNITS','LUNITS','MEASUREMENT')}
    native_dims={f"{o['handle'][2]:X}":o for o in objects if str(o.get('entity','')).startswith('DIMENSION')}
    native_model_handles={f"{o['handle'][2]:X}" for o in objects if o.get('entity') and o.get('entmode')==2}
    model_boundary_handles={f"{o['handle'][2]:X}":o['entity'] for o in objects
                            if o.get('entmode')==2 and o.get('entity') in ('BLOCK','ENDBLK')}
    model_handles={h for h,o in native_dims.items() if o.get('entmode')==2}
    # Retain only the fields used for the actual audit, excluding file/editor metadata.
    wanted_types={'DIMSTYLE','BLOCK_HEADER','LINE','MTEXT','TEXT'}
    selected={o['handle'][2]:o for o in objects if (o.get('object') or o.get('entity')) in wanted_types}
    native_model_lines={f"{o['handle'][2]:X}":o for o in objects if o.get('entity')=='LINE' and o.get('entmode')==2}
    del native,objects
    gc.collect()
    if (DEST/'fresh.dxf').exists():
        doc,auditor=recover.readfile(str(DEST/'fresh.dxf'))
    else:
        with gzip.open(DEST/'fresh.dxf.gz','rb') as stream:
            doc,auditor=recover.read(stream)
    assert not auditor.errors and not auditor.fixes
    msp=doc.modelspace()
    missing_model_handles=sorted(native_model_handles-{e.dxf.handle for e in msp}-set(model_boundary_handles))
    extra_model_handles=sorted({e.dxf.handle for e in msp}-native_model_handles)
    model_inserts=len(msp.query('INSERT'))
    assert model_inserts==0,'Nested block dimensions need a separate placement audit'
    assert {e.dxf.handle for e in msp.query('DIMENSION')}==model_handles
    rows=read_csv('dimensions.csv')
    book=openpyxl.load_workbook(ROOT/'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx',data_only=False)
    saved={r[0].value:[c.value for c in r] for r in list(book['DWG dimensions'].iter_rows())[7:] if r[0].value}
    records=[]
    failures=[]
    display_differences=[]
    style_warnings=[]
    drawings={d['id']:d for d in DRAWINGS}
    for row in rows:
        ident,handle=row['id'],row['handle']
        n=native_dims[handle]
        e=doc.entitydb[handle]
        a,b=n['xline1_pt'],n['xline2_pt']
        delta=[b[i]-a[i] for i in range(3)]
        if n['entity']=='DIMENSION_LINEAR':
            rotation=n['dim_rotation']
            calculated=abs(delta[0]*math.cos(rotation)+delta[1]*math.sin(rotation))
        elif n['entity']=='DIMENSION_ALIGNED':
            calculated=math.sqrt(sum(v*v for v in delta))
        else:
            raise ValueError((ident,n['entity']))
        converted=e.get_measurement()
        cached=n['act_measurement']
        d=drawings[row['drawing']]
        endpoints=(*to_model(d,*a[:2]),*to_model(d,*b[:2]))
        endpoint_error=max(abs(float(row[k])-v) for k,v in zip(('a1','a2','b1','b2'),endpoints))
        native_dxf_error=max(abs(a[i]-e.dxf.defpoint2[i]) for i in range(3))
        native_dxf_error=max(native_dxf_error,*[abs(b[i]-e.dxf.defpoint3[i]) for i in range(3)])
        geometry_error=max(abs(calculated-converted),abs(cached-calculated))
        csv_error=abs(float(row['measured_mm'])-calculated)
        wb=saved[ident]
        excel_error=max(abs(wb[4]-float(row['measured_mm'])),*[abs(wb[i]-float(row[k])) for i,k in enumerate(('a1','a2','b1','b2'),7)])
        style=selected[n['dimstyle'][-1]]
        # Read the stored dimension block; do not regenerate text or infer its displayed number.
        cached_text=[]
        if e.dxf.get('geometry') and e.dxf.geometry in doc.blocks:
            for t in doc.blocks[e.dxf.geometry].query('TEXT MTEXT'):
                direct=selected[int(t.dxf.handle,16)]
                assert direct['text']==t.dxf.text, (ident,'native text changed during conversion')
                cached_text.append(t.plain_text() if t.dxftype()=='MTEXT' else t.dxf.text)
        numeric_text=[t.strip().replace(' ','') for t in cached_text]
        actual_printed=None
        if len(numeric_text)==1:
            try:
                actual_printed=float(numeric_text[0].replace(',','.'))
            except ValueError:
                pass
        if actual_printed is None or actual_printed!=float(row['printed_mm']):
            display_differences.append({'id':ident,'drawing':row['drawing'],'old_printed_mm':row['printed_mm'],
                                        'stored_text':cached_text,'measured':round(calculated,9)})
        assert wb[5]==actual_printed,(ident,'Excel printed number differs from native CAD label')
        if n.get('user_text','') not in ('','<>') or style.get('DIMLFAC')!=1:
            style_warnings.append(ident)
        ok=native_dxf_error<1e-7 and geometry_error<1e-6 and endpoint_error<=.050001 and csv_error<=.050001 and excel_error<1e-9
        if not ok:
            failures.append(ident)
        records.append({'ma':ident,'ban_ve':row['drawing'],'handle':handle,'kieu_dwg':n['entity'],
            'dwg_luu_so_do':round(cached,9),'tinh_lai_tu_hai_dau':round(calculated,9),'dxf_moi':round(converted,9),
            'csv_hien_tai':row['measured_mm'],'sai_so_dau_do_do_lam_tron':round(endpoint_error,9),
            'sai_so_dwg_dxf':round(native_dxf_error,9),'sai_so_tinh_lai':round(geometry_error,9),
            'sai_so_excel_csv':round(excel_error,9),'chu_so_goc_luu_trong_khoi': ' | '.join(cached_text),
            'chu_thay_the':n.get('user_text',''),'dimlfac':style.get('DIMLFAC'),
            'dimdec':style.get('DIMDEC'),'dimrnd':style.get('DIMRND'),'ket_qua':'Khớp' if ok else 'Cần đối chiếu'})
    excluded=[]
    used={r['handle'] for r in rows}
    for h in sorted(model_handles-used):
        n=native_dims[h]
        excluded.append({'handle':h,'diem_chu':n.get('text_midpt'),'so_do':n.get('act_measurement'),
                         'ly_do':'Ngoài 27 khung bản vẽ đã đăng ký'})
    grid_records=[]
    for row in read_csv('grid-check.csv'):
        d=drawings[row['drawing']]
        x0,y0,x1,y1=d['frame']
        candidates=[]
        for e in msp.query('LINE[layer=="duong tim"]'):
            a,b=e.dxf.start,e.dxf.end
            if not (x0<=a.x<=x1 and y0<=a.y<=y1) or (a-b).magnitude<3000:
                continue
            axis=None
            if abs(a.x-b.x)<1:
                axis='Z' if d['view']=='transverse' else 'X'
                value=to_model(d,a.x,a.y)[0]
            elif abs(a.y-b.y)<1 and d['view']=='plan':
                axis='Z'; value=to_model(d,a.x,a.y)[1]
            if axis==row['axis']:
                n=native_model_lines[e.dxf.handle]
                # Direct DWG line endpoints must agree before using the converted line.
                na=n.get('start',n.get('start_pt'))
                nb=n.get('end',n.get('end_pt'))
                assert na is not None and nb is not None
                assert max(abs(na[i]-a[i]) for i in range(3))<1e-7
                assert max(abs(nb[i]-b[i]) for i in range(3))<1e-7
                candidates.append((abs(value-float(row['dwg_mm'])),e.dxf.handle,value))
        best=min(candidates)
        assert best[0]<=.050001,(row,best)
        grid_records.append({'ban_ve':row['drawing'],'truc':row['axis'],'ten':row['grid'],'handle':best[1],
                             'toa_do_cad':round(best[2],9),'toa_do_csv':row['dwg_mm'],'sai_so_lam_tron':round(best[0],9)})
    # Read level labels again and locate real V-marker vertices. This deliberately
    # does not use the previous text-height * 0.48367 marker-apex approximation.
    lines=[(e.dxf.start,e.dxf.end) for e in msp.query('LINE')]
    segments=[(tuple(a[:2]) if isinstance(a,tuple) else (a.x,a.y),
               tuple(b[:2]) if isinstance(b,tuple) else (b.x,b.y)) for a,b in lines]
    for e in msp.query('LWPOLYLINE'):
        pts=list(e.get_points('xyb'))
        for a,b in zip(pts,pts[1:]+(pts[:1] if e.closed else [])):
            if abs(a[2])<1e-12:
                segments.append(((a[0],a[1]),(b[0],b[1])))
    vpoints=defaultdict(list)
    for a,b in segments:
        if .01<abs(a[0]-b[0])<1500 and .01<abs(a[1]-b[1])<1500:
            lo,hi=(a,b) if a[1]<b[1] else (b,a)
            vpoints[(round(lo[0],3),round(lo[1],3))].append((lo,hi))
    tips=[]
    for edges in vpoints.values():
        for i,(tip,a) in enumerate(edges):
            for _,b in edges[i+1:]:
                if abs(a[1]-b[1])<.01 and min(a[0],b[0])<tip[0]<max(a[0],b[0]):
                    tips.append((tip[0],tip[1],(a[1]+b[1])/2))
    bars=[(min(a.x,b.x),max(a.x,b.x),a.y) for a,b in lines
          if abs(a.y-b.y)<.5 and 150<abs(a.x-b.x)<1000]
    level_records=[]
    for e in msp.query('MTEXT'):
        txt=' '.join(e.plain_text().split()); match=LEVEL.search(txt)
        d=drawing_at(e.dxf.insert.x,e.dxf.insert.y)
        if not match or not d:
            continue
        n=selected[int(e.dxf.handle,16)]
        assert n['text']==e.dxf.text
        printed_value=(-1 if match[1]=='-' else 1)*float(match[2]+'.'+(match[3] or '0'))*1000
        x,y,h=e.dxf.insert.x,e.dxf.insert.y,e.dxf.char_height
        tip=None
        if d['view']!='plan':
            eligible=[b for b in bars if y-4*h<=b[2]<=y and b[0]<=x+2*h and b[1]>=x+.5*h]
            if eligible:
                bar=max(eligible,key=lambda b:b[2])
                hits=[p for p in tips if bar[0]<=p[0]<=bar[1] and abs(p[2]-bar[2])<1 and .1*h<bar[2]-p[1]<2*h]
                if hits:
                    tip=max(hits,key=lambda p:p[1])[1]
        level_records.append({'ban_ve':d['id'],'handle':e.dxf.handle,'nhan':txt,'so_ghi':round(printed_value),
                              'chieu_cao_chu':h,'dinh_ky_hieu':tip,'floor':d.get('floor')})
    assert Counter((r['ban_ve'],r['nhan'],r['so_ghi']) for r in level_records)==Counter((r['drawing'],r['label'],int(r['printed_mm'])) for r in read_csv('levels.csv'))
    zeros={(r['ban_ve'],r['chieu_cao_chu']):r['dinh_ky_hieu'] for r in level_records if r['so_ghi']==0 and r['dinh_ky_hieu'] is not None}
    for r in level_records:
        origin=zeros.get((r['ban_ve'],r['chieu_cao_chu']),r['floor'])
        geometric=None if r['dinh_ky_hieu'] is None or origin is None else r['dinh_ky_hieu']-origin
        r['cao_do_tu_dinh_ky_hieu']=None if geometric is None else round(geometric,6)
        r['chenh_voi_so_ghi']=None if geometric is None else round(geometric-r['so_ghi'],6)
    converter_log=(DEST/'dwg2dxf.log').read_text()
    warning_counts=Counter(line.split(':')[0] for line in converter_log.splitlines() if line.startswith(('ERROR:','Warning:')))
    report={'sha256_dwg':digest,'insunits_dwg':header['INSUNITS'],'insunits_dxf':doc.header.get('$INSUNITS'),
        'so_kich_thuoc_toan_tap_tin':len(native_dims),'so_kich_thuoc_khong_gian_mo_hinh':len(model_handles),
        'so_doi_tuong_model_dwg':len(native_model_handles),'so_doi_tuong_model_dxf':len(msp),
        'dau_cuoi_khoi_model_khong_phai_hinh_hoc':model_boundary_handles,
        'model_handle_thieu':missing_model_handles,'model_handle_them':extra_model_handles,
        'so_block_chen_trong_model':model_inserts,
        'so_doi_chieu':len(records),'so_khong_khop':len(failures),'ma_khong_khop':failures,
        'sai_so_dwg_dxf_lon_nhat':max(r['sai_so_dwg_dxf'] for r in records),
        'sai_so_tinh_lai_lon_nhat':max(r['sai_so_tinh_lai'] for r in records),
        'doi_chieu_chu_so_goc':display_differences,'ma_co_chu_thay_the_hoac_he_so_khac_1':style_warnings,
        'so_o_so_in_da_sua':len(json.loads((PUBLIC/'kiem-tra-truoc-khi-sua.json').read_text())['doi_chieu_chu_so_goc']),
        'so_nhan_cao_do_doc_truc_tiep':len(level_records),
        'so_dinh_ky_hieu_cao_do_do_bang_dinh_hinh_hoc':sum(r['cao_do_tu_dinh_ky_hieu'] is not None for r in level_records),
        'cao_do_khac_so_ghi':[r for r in level_records if r['chenh_voi_so_ghi'] is not None and abs(r['chenh_voi_so_ghi'])>1],
        'kich_thuoc_ngoai_khung':excluded,'so_duong_truc_doi_chieu':len(grid_records),
        'canh_bao_chuyen_doi':dict(warning_counts),'loi_kiem_tra_dxf':len(auditor.errors),'sua_tu_dong_dxf':len(auditor.fixes),
        'gioi_han':'Hai nhánh đọc dùng chung LibreDWG; chưa đối chiếu bằng AutoCAD/ODA hoặc người thiết kế. Đơn vị hình học mm đang suy từ chuỗi kích thước và nhãn m, khác mã INSUNITS=1 (inch, đơn vị chèn). Chưa dùng làm xác nhận thi công.'}
    inputs=[OUT/name for name in ('dimensions.csv','grid-check.csv','levels.csv','facade.csv','key-dimensions.csv',
                                  'Thach_Bi_Key_Dimensions.xlsx','sheets.json')]
    inputs.append(ROOT/'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx')
    report['dau_vao_sha256']={str(path.relative_to(ROOT)):hashlib.sha256(path.read_bytes()).hexdigest() for path in inputs}
    (PUBLIC/'kiem-tra-so-lieu.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    for name,data in [('doi-chieu-kich-thuoc.csv',records),('doi-chieu-luoi-truc.csv',grid_records),('doi-chieu-cao-do.csv',level_records)]:
        with (PUBLIC/name).open('w',encoding='utf-8',newline='') as stream:
            writer=csv.DictWriter(stream,fieldnames=list(data[0]),lineterminator='\n')
            writer.writeheader(); writer.writerows(data)
    print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)


if __name__=='__main__':
    main()
