/* P05 entrance plan / conceptual ramp checks; never a code-compliance check. */
'use strict';
const assert=require('node:assert/strict');
const {loadExteriorModel}=require('./lib/exterior_model.cjs');
const {model,api}=loadExteriorModel();const T=model.THREE,nodes=[];
model.building.traverse(o=>{if(o.isMesh)nodes.push(o)});
const byName=n=>nodes.filter(o=>o.name===n);
const front=byName('Approach step · P05 front'), B=byName('Approach step · P05 side B'), H=byName('Approach step · P05 side H');
assert.equal(front.length,9);assert.equal(B.length,9);assert.equal(H.length,9);
assert(!byName('Schematic approach riser — count unconfirmed').length);
for(const [list,sign,end] of [[B,-1,-.499],[H,1,-3.159]])for(let i=0;i<list.length;i++){
 const box=new T.Box3().setFromObject(list[i]),j=i+1;
 assert(Math.abs(box.max.y-(-.48-.16*j))<.001,'Return top follows inferred riser sequence');
 assert(Math.abs((sign<0?Math.abs(box.min.z):box.max.z)-(10.392+.35*j))<.001,'P05 return nosing');
 assert(Math.abs(box.max.x-end)<.001,'Return ends at drawing limit');
}
const ramp=byName('H tower ramp · compact switchback concept');assert.equal(ramp.length,1);
assert(Math.abs(new T.Box3().setFromObject(ramp[0]).max.x-5.4)<.001,'Actual ramp geometry stops at tower rear');
// Check actual ramp vertices against both modeled tower plinth bounding boxes.
const towers=byName('Tower plinth').map(o=>new T.Box3().setFromObject(o));
const pos=ramp[0].geometry.attributes.position, vertex=new T.Vector3();
for(let i=0;i<pos.count;i++){
 vertex.fromBufferAttribute(pos,i).applyMatrix4(ramp[0].matrixWorld);
 assert(!towers.some(box=>box.containsPoint(vertex)),'Ramp vertex intersects a tower plinth');
}
const height=(x,z)=>api.CHURCH_REALISM.floorHeight(x,z), near=(a,b)=>assert(Math.abs(a-b)<.002,`${a} != ${b}`);
near(height(-9.0,0),-.48);near(height(-9.4,0),-.64);near(height(-12.2,0),-1.92);
near(height(-5,-10.5),-.64);near(height(-5,10.5),-.64);
const R=api.CHURCH_ENTRANCE_APPROACH.spec.ramp, layout=api.CHURCH_ENTRANCE_APPROACH.rampLayout();
assert.equal(layout.lanes.length,5);assert(layout.lanes.every(l=>Math.abs((l.z1-l.z0)-1.4)<1e-9),'Five 1.4 m concept lanes');assert(layout.slope<1/12,'Concept slope remains shallower than 1:12');
near(height(-1.9396,10.392),-.48);near(height(R.xEnd,(layout.lanes[4].z0+layout.lanes[4].z1)/2),-2.08);
for(let i=0;i<layout.lanes.length;i++){
 const lane=layout.lanes[i], z=(lane.z0+lane.z1)/2;
 const start=lane.forward?R.xStart:R.xTurn, end=lane.forward?R.xTurn:R.xStart;
 near(height(start,z),lane.from);near(height(end,z),lane.to);
 if(i<layout.lanes.length-1){const next=layout.lanes[i+1];near(lane.to,next.from);
  const lx=lane.forward?(R.xTurn+R.xEnd)/2:(R.x+R.xStart)/2;
  near(height(lx,(lane.z1+next.z0)/2),lane.to);
 }
}
assert(api.CHURCH_ENTRANCE_APPROACH.floorHeight(5.401,14.5423)===null,'Ramp stops at tower rear');
assert.equal(byName('Ramp outside handrail · concept').length,15,'Only exterior handrail sections are modelled');
assert(byName('Ramp outside handrail post · concept').length>5,'Outside handrail posts are modelled');
const end=height(-1.9396,13.5423), next=height(-.9396,14.5423);near(end,next);
// Top faces agree with walk-height samples including all four turning landings.
const samples=[[-9.4,0],[-5,-10.5],[-5,10.5],[-1.9396,11.2],[2,14.0],[2,16.0],[2,20.5]];
for(let i=0;i<layout.lanes.length-1;i++){const lane=layout.lanes[i],next=layout.lanes[i+1];samples.push([lane.forward?(R.xTurn+R.xEnd)/2:(R.x+R.xStart)/2,(lane.z1+next.z0)/2]);}
for(const [x,z] of samples){
 const ray=new T.Raycaster(new T.Vector3(x,5,z),new T.Vector3(0,-1,0));
 const hits=ray.intersectObjects([...front,...B,...H,...ramp],false);assert(hits.length,`No approach surface at ${x},${z}`);
 near(hits[0].point.y,height(x,z));
}
console.log(JSON.stringify({status:'passed',stairReturns:18,planNosingCount:10,riserInferredM:.16,ramp:'five-run switchback / lower courtyard to forecourt concept',limits:'Church-floor connection, turn clearance, internal edge protection, rail fixing and accessibility remain unverified; no compliance claim.'}));
