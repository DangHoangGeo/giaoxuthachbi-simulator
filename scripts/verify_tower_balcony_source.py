#!/usr/bin/env python3
"""Native tower parapet topology/profile audit; not a structural guard design."""
import gzip,hashlib,json,math
from pathlib import Path
from ezdxf import recover
from extract_dwg_revision import DRAWINGS,to_model
root=Path(__file__).resolve().parent.parent
x=json.loads((root/'docs/exterior-23102026/tower-balcony-witnesses.json').read_text())
assert hashlib.sha256((root/'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg').read_bytes()).hexdigest()==x['sourceDwgSha256']
doc,audit=recover.readfile(str(root/'docs/layout_design/dwg-2026-10-23/source/converted.dxf'))
assert not audit.errors and not audit.fixes and doc.header['$INSUNITS']==1
D={d['id']:d for d in DRAWINGS};seen=set();worst=0

def near(a,b):
 global worst
 worst=max(worst,abs(a-b));assert abs(a-b)<1e-7,(a,b)
def point(d,p):return [v/1000 for v in to_model(D[d],p.x,p.y)]
def edge(p,q):return tuple(sorted((tuple(round(v,7) for v in p),tuple(round(v,7) for v in q))))
for f in x['faces']:
 assert len(f['holes'])==17
 for hole in f['holes']:
  assert len(hole['points'])==len(hole['handles'])==12
  actual=[]
  for h in hole['handles']:
   e=doc.entitydb[h];assert e.dxftype()=='LINE';seen.add(h)
   actual.append(edge(point(f['drawing'],e.dxf.start),point(f['drawing'],e.dxf.end)))
  p=hole['points'];expected=[edge(p[i],p[(i+1)%12]) for i in range(12)]
  assert sorted(actual)==sorted(expected),(f['drawing'],hole['index'])
  for u,y in p:assert any(abs(u-hole['centreU']-a)<1e-7 and abs(y-b)<1e-7 for a,b in x['holePattern']['canonicalRelativePoints'])
for r in x['profileWitnesses']:
 e=doc.entitydb[r['handle']];assert e.dxftype()=='LINE';seen.add(r['handle'])
 for p,q in zip((e.dxf.start,e.dxf.end),r['points']):
  for a,b in zip(point(r['drawing'],p),q):near(a,b)
for r in x['planWitnesses']:
 e=doc.entitydb[r['handle']];seen.add(r['handle']);assert e.dxftype()=='LINE'
 for p,q in zip((e.dxf.start,e.dxf.end),r['native']['points']):
  for a,b in zip((p.x,p.y),q):near(a/1000,b/1000)
for r in x['cornerPinnacleEnvelopesE01B']:
 h=r['topWitness']['handle'];e=doc.entitydb[h];seen.add(h)
 assert e.dxftype()=='ARC'
 pts=[e.start_point,e.end_point]
 a,b=e.dxf.start_angle,e.dxf.end_angle
 if ((90-a)%360)<=((b-a)%360):pts.append(e.dxf.center+type(e.dxf.center)(0,e.dxf.radius,0))
 top=max(pts,key=lambda p:p.y);u,y=point('E01B',top);near(u,r['topWitness']['u']);near(y,r['topWitness']['y'])
# Compare the selected geometric entities with the direct DWG read as well as DXF.
# Both exports use LibreDWG: this is not an independent AutoCAD/ODA confirmation.
profile_worst=worst
native_path=root/'exports/23102026/_audit/original-dwg.json'
if native_path.exists():native=json.loads(native_path.read_text())
else:
 with gzip.open(str(native_path)+'.gz','rt',encoding='utf-8') as stream:native=json.load(stream)
assert native['HEADER']['INSUNITS']==1
wanted={int(h,16):h for h in seen}
raw={wanted[o['handle'][2]]:o for o in native['OBJECTS'] if o.get('handle',[0,0,-1])[2] in wanted}
assert set(raw)==seen
native_worst=0
for h,o in raw.items():
 e=doc.entitydb[h];assert o['entity']==e.dxftype() and o['entmode']==2
 pairs=[]
 if e.dxftype()=='LINE':pairs=[(e.dxf.start,o['start']),(e.dxf.end,o['end'])]
 else:
  pairs=[(e.dxf.center,o['center'])]
  delta=abs(e.dxf.radius-o['radius'])/1000;native_worst=max(native_worst,delta);assert delta<1e-7
  if e.dxftype()=='ARC':
   for key in ('start_angle','end_angle'):
    delta=((math.degrees(o[key])-getattr(e.dxf,key)+180)%360)-180
    assert abs(delta)<1e-8
 for point_a,point_b in pairs:
  for av,bv in zip(point_a,point_b):
   delta=abs(av-bv)/1000;native_worst=max(native_worst,delta);assert delta<1e-7
print(json.dumps({'status':'passed','source_sha256':x['sourceDwgSha256'],'unique_native_entities':len(seen),'native_dwg_and_dxf_entities_compared':len(raw),'closed_holes_per_elevation':17,'edges_per_hole':12,'verified_elevations':['E01B','E02'],'largest_profile_transcription_difference_m':profile_worst,'largest_native_dwg_dxf_difference_m':native_worst,'reader_limit':'Direct DWG JSON and DXF both use LibreDWG; independent native CAD/designer confirmation pending.','limits':'mm/m interpretation, closures, structural thickness, guarding and hidden depth remain unapproved.'},indent=2))
