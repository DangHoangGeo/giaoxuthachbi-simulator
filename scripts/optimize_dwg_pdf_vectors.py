#!/usr/bin/env python3
"""Compact repeated collinear dash segments as native PDF dash arrays.

No rasterization, thresholding, curve simplification or CAD-data change. A run is
accepted only when every dash start/end is reproduced within 0.0003 PDF points.
Other paths keep their control points/styles. Each page is rendered against the
source; a failed comparison falls back to the untouched source PDF.
"""
import argparse
import hashlib
import json
import math
import shutil
from pathlib import Path

import numpy as np
import pymupdf as fitz

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'exports/dwg-review-2026-10-26/_raw'
DEST=ROOT/'exports/23102026_vector/_vector_raw'
EPS=.0003
ALGORITHM_VERSION=2


def style(p):
    return (p.get('width'),p.get('color'),p.get('fill'),p.get('lineCap'),p.get('lineJoin'),
            p.get('dashes'),p.get('even_odd'),p.get('closePath'),p.get('fill_opacity'),p.get('stroke_opacity'))


def simple_line(p):
    return p['type']=='s' and len(p['items'])==1 and p['items'][0][0]=='l' and \
        not p.get('closePath') and p.get('stroke_opacity')==1 and \
        p.get('dashes') in (None,'[] 0') and max(p.get('lineCap') or (0,))==0


def finish(shape,p,dashes=None):
    caps=p.get('lineCap') or (0,)
    shape.finish(width=p.get('width') or 0,color=p.get('color'),fill=p.get('fill'),
                 lineCap=int(max(caps)),lineJoin=int(p.get('lineJoin') or 0),dashes=dashes or p.get('dashes'),
                 even_odd=p.get('even_odd',False),closePath=bool(p.get('closePath')),
                 fill_opacity=1 if p.get('fill_opacity') is None else p['fill_opacity'],
                 stroke_opacity=1 if p.get('stroke_opacity') is None else p['stroke_opacity'])


def replay(shape,p):
    for item in p['items']:
        if item[0]=='l': shape.draw_line(item[1],item[2])
        elif item[0]=='c': shape.draw_bezier(*item[1:])
        elif item[0]=='qu': shape.draw_quad(item[1])
        elif item[0]=='re': shape.draw_rect(item[1])
        else: raise ValueError(item[0])
    finish(shape,p)


def periodic_pattern(intervals):
    n=len(intervals)
    if n<6:
        return None
    for period in range(1,min(8,(n-1)//2)+1):
        on=[]; off=[]
        for k in range(period):
            ons=[intervals[i][1]-intervals[i][0] for i in range(k,n-1,period)]
            gaps=[intervals[i+1][0]-intervals[i][1] for i in range(k,n-1,period)]
            if not ons or not gaps:
                break
            on.append(sum(ons)/len(ons)); off.append(sum(gaps)/len(gaps))
        if len(on)!=period or min(on)<=EPS or min(off)<0:
            continue
        predicted=0.0; max_error=0.0
        for i,(a,b) in enumerate(intervals):
            end=predicted+on[i%period]
            if i==n-1 and b<=end+EPS:
                end=b  # final dash may be cut short by the source line endpoint
            max_error=max(max_error,abs(predicted-a),abs(end-b))
            predicted=end+off[i%period]
        if max_error<=EPS:
            return [v for pair in zip(on,off) for v in pair],max_error
    return None


def optimize(source,target):
    original=fitz.open(source)
    out=fitz.open()
    p0=original[0]
    page=out.new_page(width=p0.rect.width,height=p0.rect.height)
    paths=p0.get_drawings()
    shape=page.new_shape()
    i=0; run_count=0; replaced=0; operations=0; max_error=0.0
    while i<len(paths):
        p=paths[i]
        run=[]; intervals=[]
        if simple_line(p):
            a,b=p['items'][0][1:]
            length=abs(b-a)
            if length>EPS:
                ux,uy=(b.x-a.x)/length,(b.y-a.y)/length
                signature=style(p)
                j=i
                while j<min(i+2048,len(paths)) and simple_line(paths[j]) and style(paths[j])==signature:
                    s,t=paths[j]['items'][0][1:]
                    sa=(s.x-a.x)*ux+(s.y-a.y)*uy
                    sb=(t.x-a.x)*ux+(t.y-a.y)*uy
                    cross=max(abs((s.x-a.x)*uy-(s.y-a.y)*ux),abs((t.x-a.x)*uy-(t.y-a.y)*ux))
                    if cross>EPS or sb<=sa or (intervals and sa<intervals[-1][1]-EPS):
                        break
                    run.append(paths[j]); intervals.append((sa,sb)); j+=1
        pattern=periodic_pattern(intervals) if run else None
        if pattern:
            array,error=pattern
            shape.draw_line(run[0]['items'][0][1],run[-1]['items'][0][2])
            finish(shape,p,'['+' '.join(f'{v:.10f}' for v in array)+'] 0')
            max_error=max(max_error,error); run_count+=1; replaced+=len(run); i+=len(run); operations+=1
        else:
            for item in run or [p]:
                replay(shape,item); operations+=1
            i+=len(run) or 1
        if operations>=1500:
            shape.commit(); shape=page.new_shape(); operations=0
    shape.commit()
    candidate=target.with_suffix('.candidate.pdf')
    out.save(candidate,garbage=4,deflate=True,use_objstms=1)
    out.close()
    checked=fitz.open(candidate)
    a=p0.get_pixmap(matrix=fitz.Matrix(2,2),colorspace=fitz.csGRAY,alpha=False)
    b=checked[0].get_pixmap(matrix=fitz.Matrix(2,2),colorspace=fitz.csGRAY,alpha=False)
    aa=np.frombuffer(a.samples,dtype=np.uint8).astype(np.int16)
    bb=np.frombuffer(b.samples,dtype=np.uint8).astype(np.int16)
    assert aa.shape==bb.shape
    diff=np.abs(aa-bb)
    mae=float(diff.mean()); changed=float((diff>32).mean())
    accepted=mae<=.3 and changed<=.003 and candidate.stat().st_size<source.stat().st_size
    checked.close(); original.close()
    if accepted:
        candidate.replace(target)
    else:
        shutil.copy2(source,target); candidate.unlink()
    return {'algorithm_version':ALGORITHM_VERSION,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
            'output_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
            'source_bytes':source.stat().st_size,'output_bytes':target.stat().st_size,
            'source_paths':len(paths),'dash_runs':run_count,'segments_in_dash_runs':replaced,
            'max_endpoint_error_pdf_points':max_error,'mean_gray_difference_at_144dpi':mae,
            'fraction_pixels_difference_gt32':changed,'optimized':accepted,
            'fallback_original_vector':not accepted}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only',nargs='*')
    args=parser.parse_args()
    DEST.mkdir(parents=True,exist_ok=True)
    report_path=DEST/'verification.json'
    result=json.loads(report_path.read_text()) if report_path.exists() else {}
    for source in sorted(SOURCE.glob('*.pdf')):
        if args.only and source.stem not in args.only:
            continue
        target=DEST/source.name
        if target.exists() and source.stem in result and \
                result[source.stem].get('algorithm_version')==ALGORITHM_VERSION and \
                result[source.stem]['source_sha256']==hashlib.sha256(source.read_bytes()).hexdigest() and \
                result[source.stem].get('output_sha256')==hashlib.sha256(target.read_bytes()).hexdigest():
            continue
        result[source.stem]=optimize(source,target)
        report_path.write_text(json.dumps(result,indent=2)+'\n')
        r=result[source.stem]
        print(f"{source.stem}: {r['source_bytes']/1e6:.2f} -> {r['output_bytes']/1e6:.2f} MB; "
              f"dash segments {r['segments_in_dash_runs']}; MAE {r['mean_gray_difference_at_144dpi']:.4f}; accepted={r['optimized']}",flush=True)
    report_path.write_text(json.dumps(result,indent=2)+'\n')


if __name__=='__main__':
    main()
