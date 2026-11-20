/* P05 entrance plan / short H-side ramp checks; never a code-compliance check. */
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
// Owner, 20 Nov 2026: one short ramp near the tower; the earlier five-run switchback is gone.
assert.equal(byName('H tower ramp · compact switchback concept').length,0,'No switchback ramp');
const ramp=byName('H tower ramp · short ramp near the tower');assert.equal(ramp.length,1);
const rb=new T.Box3().setFromObject(ramp[0]);
assert(Math.abs(rb.max.x-5.4)<.001,'Ramp stops at the tower rear');
assert(rb.max.z<16,'Ramp stays close to the tower (no outward switchback)');
const towers=byName('Tower plinth').map(o=>new T.Box3().setFromObject(o));
const pos=ramp[0].geometry.attributes.position, vertex=new T.Vector3();
for(let i=0;i<pos.count;i++){
 vertex.fromBufferAttribute(pos,i).applyMatrix4(ramp[0].matrixWorld);
 assert(!towers.some(box=>box.containsPoint(vertex)),'Ramp vertex intersects a tower plinth');
}
const height=(x,z)=>api.CHURCH_REALISM.floorHeight(x,z), near=(a,b)=>assert(Math.abs(a-b)<.002,`${a} != ${b}`);
near(height(-9.0,0),-.48);near(height(-9.4,0),-.64);near(height(-12.2,0),-1.92);
near(height(-5,-10.5),-.64);near(height(-5,10.5),-.64);
const R=api.CHURCH_ENTRANCE_APPROACH.spec.ramp, layout=api.CHURCH_ENTRANCE_APPROACH.rampLayout(), zm=R.z+(R.inner+R.radius)/2;
near(height(R.x-R.radius/2-R.inner/2,R.zStart),-.48);
near(height(4.7,zm),-2.08);
assert(height(0,zm)<layout.turnY&&height(0,zm)>-2.08,'Ramp descends between the turn and the tower rear');
assert(Math.abs(layout.slope-(1.6/layout.run))<1e-9&&layout.slope>0&&layout.slope<.25,'Single-run slope recorded: '+layout.slope.toFixed(3));
assert(api.CHURCH_ENTRANCE_APPROACH.floorHeight(5.401,zm)===null,'Ramp stops at tower rear');
assert.equal(byName('Ramp outside handrail · concept').length,15,'Only the outside handrail is modelled');
assert(byName('Ramp outside handrail post · concept').length>5,'Outside handrail posts are modelled');
const samples=[[-9.4,0],[-5,-10.5],[-5,10.5],[-1.9396,11.2],[0,zm],[2,zm],[4.7,zm]];
for(const [x,z] of samples){
 const ray=new T.Raycaster(new T.Vector3(x,5,z),new T.Vector3(0,-1,0));
 const hits=ray.intersectObjects([...front,...B,...H,...ramp],false);assert(hits.length,`No approach surface at ${x},${z}`);
 near(hits[0].point.y,height(x,z));
}
console.log(JSON.stringify({status:'passed',stairReturns:18,planNosingCount:10,riserInferredM:.16,ramp:'one short ramp near the H tower, P05 curve to tower rear',slope:+layout.slope.toFixed(3),limits:'Accessible access, church-floor connection, rail fixing and drainage remain open; no compliance claim.'}));
