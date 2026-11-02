/* Check source-curve endpoints against the actual assembled tower mesh. */
'use strict';
const assert = require('node:assert/strict');
const {loadExteriorModel} = require('./lib/exterior_model.cjs');
const {model,api}=loadExteriorModel();
const T=model.THREE, meshes=[], reach=api.CHURCH_TOWERS.spec.leafStroke+.001;
model.building.traverse(o=>{if(o.isMesh&&/^Tower (front|side) spandrel spray/.test(o.name))meshes.push(o);});
assert.equal(meshes.length,2,'Front and outer-side corner ornaments each share one named mesh');
const cells=new Map(), size=.025, p=new T.Vector3();
const key=(x,y,z)=>`${x},${y},${z}`;
for(const mesh of meshes){
 const a=mesh.geometry.attributes.position;
 for(let i=0;i<a.count;i++){
  p.fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);
  const k=key(Math.floor(p.x/size),Math.floor(p.y/size),Math.floor(p.z/size));
  if(!cells.has(k))cells.set(k,[]);cells.get(k).push([p.x,p.y,p.z]);
 }
}
function nearest(x,y,z){let best=Infinity;const i=Math.floor(x/size),j=Math.floor(y/size),k=Math.floor(z/size);
 for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++)for(let c=k-1;c<=k+1;c++)
  for(const v of cells.get(key(a,b,c))||[])best=Math.min(best,Math.hypot(v[0]-x,v[1]-y,v[2]-z));
 return best;
}
let worst=0,count=0,side=0;
for(const s of [-1,1])for(const [name,e] of [['outer',1],['inner',-1]])for(const row of api.CHURCH_TOWER_SPANDREL_PROFILE[name]){
 const pts=[];
 if(row[1]==='A')for(const deg of [row[5],row[5]+row[6]]){
  const a=deg*Math.PI/180;pts.push([row[2]+row[7]*row[4]*Math.cos(a),row[3]+row[4]*Math.sin(a)]);
 }else pts.push([row[2],row[3]],[row[4],row[5]]);
 for(const [u,y] of pts){const d=nearest(-.165,y,s*10.153+s*e*u);assert(d<reach,`${s} ${name} ${row[0]}: ${d}`);worst=Math.max(worst,d);count++;
  // E02 outer side: the same pair about the side great arch centre X 2.450044, 25 mm off the wall.
  const q=nearest(2.450044195+s*e*u,y,s*12.768);assert(q<reach,`side ${s} ${name} ${row[0]}: ${q}`);worst=Math.max(worst,q);side++;}
}
console.log(JSON.stringify({status:'passed',endpointChecks:count,sideEndpointChecks:side,largestNearestSurfaceDistanceM:worst,limits:'Checks displayed contour endpoints; H E01B source curves, B repeated, E02 outer sides matched, depth conceptual.'}));
