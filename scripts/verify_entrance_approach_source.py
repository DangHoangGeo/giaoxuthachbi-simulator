#!/usr/bin/env python3
"""P05 approach witnesses; local source, not a survey or construction review."""
import hashlib,json
from pathlib import Path
from ezdxf import recover
root=Path(__file__).resolve().parent.parent
src=root/'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg'
assert hashlib.sha256(src.read_bytes()).hexdigest()=='2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
doc,audit=recover.readfile(root/'docs/layout_design/dwg-2026-10-23/source/converted.dxf')
assert not audit.errors and not audit.fixes and doc.header.get('$INSUNITS')==1
checks=0; worst=0.0

def near(a,b,tol=.0015):
 global checks,worst
 d=abs(a-b);checks+=1;worst=max(worst,d);assert d<tol,(a,b,d)
def pt(p):return ((p.x-1431380)/1000,(p.y+600741.4)/1000)
def line(h,a,b):
 e=doc.entitydb[h];assert e.dxftype()=='LINE';p,q=pt(e.dxf.start),pt(e.dxf.end)
 # Ordered endpoints may be reversed.
 if abs(p[0]-a[0])+abs(p[1]-a[1])>abs(q[0]-a[0])+abs(q[1]-a[1]):p,q=q,p
 for x,y in zip((*p,*q),(*a,*b)):near(x,y)
for sign,ids in [(-1,['D7C293','D7C289','D7C28A','D7C28B','D7C28C','D7C28D','D7C28E','D7C28F','D7C290','D7C291']),(1,['D7CA3C','D7CA33','D7CA34','D7CA35','D7CA36','D7CA37','D7CA38','D7CA39','D7CA3A','D7CA3B'])]:
 for i,h in enumerate(ids):
  x=-9.219-.35*i;z=sign*(10.392+.35*i);line(h,(x,z),(x,0))
line('D7CA4E',(-.9396,15.5423),(4.8993,15.5423))
line('D7CA4F',(-2.9396,13.5423),(-2.9396,10.392))
line('D7CA66',(4.8993,15.5423),(4.8993,13.5423))
e=doc.entitydb['D7CA50'];assert e.dxftype()=='ARC'
x,z=pt(e.dxf.center);near(x,-.9396);near(z,13.5423);near(e.dxf.radius/1000,2)
print(json.dumps({'status':'passed','checks':checks,'largestResidualM':worst,'limits':'Plan witnesses only; heights, applicability of codes and construction remain on hold.'}))
