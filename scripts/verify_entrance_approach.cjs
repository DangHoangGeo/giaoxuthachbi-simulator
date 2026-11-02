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
const ramp=byName('H tower ramp · P05 footprint and proposed extension');assert.equal(ramp.length,1);
const height=(x,z)=>api.CHURCH_REALISM.floorHeight(x,z), near=(a,b)=>assert(Math.abs(a-b)<.002,`${a} != ${b}`);
near(height(-9.0,0),-.48);near(height(-9.4,0),-.64);near(height(-12.2,0),-1.92);
near(height(-5,-10.5),-.64);near(height(-5,10.5),-.64);
near(height(-1.9396,10.392),-.48);near(height(16.5101,14.5423),-2.08);
near(height(7.3,14.5423),height(8.7,14.5423));
near(height(17.5,14.5423),-2.08);
assert(api.CHURCH_ENTRANCE_APPROACH.floorHeight(3,13.65)===null,'Offset keeps the straight ramp clear of the tower plinth in plan');
assert(byName('Ramp handrail · concept').length>20 && byName('Ramp handrail post · concept').length>20,'Both proposed rails and posts are modelled');
near((height(2,14.5423)-height(4,14.5423))/2,1/12);
const end=height(-1.9396,13.5423), next=height(-.9396,14.5423);near(end,next);
// Top faces agree with walk-height samples; no unsupported claim of site accessibility.
for(const [x,z] of [[-9.4,0],[-5,-10.5],[-5,10.5],[-1.9396,11.2],[2,14.5423],[15,14.5423]]){
 const ray=new T.Raycaster(new T.Vector3(x,5,z),new T.Vector3(0,-1,0));
 const hits=ray.intersectObjects([...front,...B,...H,...ramp],false);assert(hits.length,`No approach surface at ${x},${z}`);
 near(hits[0].point.y,height(x,z));
}
console.log(JSON.stringify({status:'passed',stairReturns:18,planNosingCount:10,riserInferredM:.16,ramp:'lower courtyard to forecourt / conceptual extension',limits:'Church-floor connection, turn clearance, rail fixing and accessibility remain unverified; no compliance claim.'}));
