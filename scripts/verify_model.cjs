/* Headless geometry checks. Runs the actual bundled geometry builders without
   a GPU; the browser is separately checked for rendering and interaction. */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const gradient = {addColorStop(){}};
const ctx = new Proxy({
  getImageData(){return {data:new Uint8ClampedArray(512*512*4)}} ,
  createLinearGradient(){return gradient},createRadialGradient(){return gradient},
  measureText(){return {width:120}},
}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});
const document = {getElementById(){return null},createElement(){return {width:512,height:512,getContext(){return ctx}}}};
const sandbox = {console,document,location:{search:''},URLSearchParams,Uint8ClampedArray,window:{}};
vm.createContext(sandbox);
for(const file of ['references.js','glass-art.js','realism.js','planning.js'])vm.runInContext(fs.readFileSync(path.join(root,'Thach_Bi_Viewer',file),'utf8'),sandbox);
let src=fs.readFileSync(path.join(root,'Thach_Bi_Viewer/bundle.js'),'utf8');
const begin=src.indexOf('    Us = document.getElementById("viewport"),');
const end=src.indexOf('  var ce = {};',begin);
assert(begin>0&&end>begin);
src=src.slice(0,begin)+`    ni = {capabilities:{getMaxAnisotropy:()=>8},shadowMap:{},toneMappingExposure:1};
  var ii = new Ti(), xn = new Cs(), Fp = new Cs(), X0 = new xr();
  ii.background = new De('#d9e4e9'); ii.add(xn,Fp,X0);
`+src.slice(end);
const ui=src.lastIndexOf('  z0({');
src=src.slice(0,ui)+`  window.model={THREE:Ec,building:nn,scene:ii,plinth:Ui,exterior:Os,roofs:ei,mat:ce,data:ti,batches:t_,interior:Qo};\n})();`;
vm.runInContext(src,sandbox,{timeout:60000});
const {THREE:T,building,plinth,exterior,roofs,mat,data,batches}=sandbox.window.model;
const realism=sandbox.window.CHURCH_REALISM;
const nodes=[];building.traverse(o=>nodes.push(o));
const near=(actual,expected,msg)=>assert(Math.abs(actual-expected)<.002,`${msg}: ${actual} != ${expected}`);
const bounds=o=>new T.Box3().setFromObject(o);
const dimensions=o=>bounds(o).getSize(new T.Vector3());
near(dimensions(nodes.find(o=>o.name.startsWith('Main plinth below'))).z,22.489,'Main plan width');
const wings=nodes.filter(o=>o.name.startsWith('Side projection plinth'));
near(Math.max(...wings.map(o=>bounds(o).max.z))-Math.min(...wings.map(o=>bounds(o).min.z)),28.158,'Wing plan width');
near(dimensions(nodes.find(o=>o.name.startsWith('Entrance forecourt plinth'))).z,27.254,'Front platform width');
near(data.levels.forecourt-data.levels.courtyard,1.6,'Front stage rise');
near(data.longitudinal['10']-data.longitudinal['9'],7.2,'Wing axis length');
assert.equal(nodes.filter(o=>o.name==='Side landing at −0.320 m').length,6);
assert.equal(nodes.filter(o=>o.name==='Side stair riser').length,96);
assert.equal(nodes.filter(o=>o.name==='Existing tower rear wall at axis 2').length,2);
const bays=nodes.filter(o=>o.name.startsWith('Outer veranda'));
assert.equal(bays.length,20);
for(const sign of [-1,1]) {
  const row=bays.filter(b=>Math.sign(b.position.z)===sign).sort((a,b)=>a.position.x-b.position.x);
  assert.equal(row.map(b=>b.name.endsWith(' 9–10')?'P':/ (4–5|8–9|10–11)$/.test(b.name)?'D':'W').join(','),'W,W,D,W,W,W,D,P,D,W');
}
assert.equal(nodes.filter(o=>o.name==='Tree trunk').length,16);
assert.equal(nodes.filter(o=>o.name==='Outer door fixed fanlight').length,6);
const clearBodies=nodes.filter(o=>/^(Inner|Outer) window clear glass body$/.test(o.name));
assert.equal(clearBodies.filter(o=>o.name.startsWith('Inner')).length,12);
assert.equal(clearBodies.filter(o=>o.name.startsWith('Outer')).length,28);
assert(!nodes.some(o=>/^Proposed coloured glazing|^Stained-glass window/.test(o.name)),'Full-height decorative glazing must be removed');
const innerHeads=nodes.filter(o=>o.name==='Inner window coloured oval');
assert.equal(innerHeads.length,12);
assert.equal(nodes.filter(o=>o.name==='Inner doorway coloured oval').length,6);
assert.equal(nodes.filter(o=>o.name==='Entrance door coloured oval').length,3);
const colouredHeads=nodes.filter(o=>/coloured oval$|fixed fanlight$|stained-glass fanlight$|rose-window infill$/.test(o.name));
assert.equal(colouredHeads.length,102);
for(const o of innerHeads){o.geometry.computeBoundingBox();near(o.geometry.boundingBox.min.y,3.171,'Inner oval spring');near(o.geometry.boundingBox.max.y,4.311,'Inner oval crown');}
for(const o of clearBodies){
  assert.equal(o.material,mat.glass);assert.equal(o.material.map,null);
  assert(o.material.opacity<.2,'Window bodies must stay transparent by default');
}
for(const o of colouredHeads){
  assert(o.material.map,'All curved window and door heads start coloured');
  assert(o.material.isMeshPhysicalMaterial&&o.material.bumpMap&&o.material.roughnessMap,'Glass uses physical reflections and surface maps');
  const uv=o.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)assert(uv.getX(i)>=-.001&&uv.getX(i)<=1.001&&uv.getY(i)>=-.001&&uv.getY(i)<=1.001,'Artwork UVs must fit each opening');
}
for(const kind of ['clear','stained','clear','stained']){
  realism.setGlass(kind);
  for(const o of colouredHeads)assert.equal(!!o.material.map,kind==='stained');
  for(const o of clearBodies)assert.equal(o.material.map,null,'Colour toggle never adds artwork to a window body');
}
assert(nodes.filter(o=>o.name==='Schematic bell louver').every(o=>o.material===mat.wood));
for(const x of [16.725,34.725,46.425])for(const sign of [-1,1])near(realism.floorHeight(x,sign*11.7),-.32,'Side landing navigation height');
// Both directions on the double stair must rise monotonically to the landing.
for(const direction of [1,-1]) {
  const bottom=16.725-direction*5.75;
  let previous=-2.08;
  for(let step=.05;step<4.5;step+=.15) {
    const x=bottom+direction*step,y=realism.floorHeight(x,12);
    assert(y>=previous-.001&&y-previous<.3);assert(realism.walkAllowed(x,12));previous=y;
  }
}
realism.update('walk');
for(const [s,b] of batches)if(s.userData.doorState)assert.equal(b.visible,s.userData.doorState==='open');
realism.update('explore');
for(const [s,b] of batches)if(s.userData.doorState)assert.equal(b.visible,s.userData.doorState==='closed');
realism.lighting('evening');const once=sandbox.window.model.interior.lights.map(l=>l.intensity);
realism.lighting('day');realism.lighting('evening');
assert.deepEqual(sandbox.window.model.interior.lights.map(l=>l.intensity),once);
realism.lighting('day');
const planning = sandbox.window.CHURCH_PLANNING;
const seatingGroups = [...batches.keys()].filter(g=>g.userData.seatingOption);
assert.equal(seatingGroups.length,2);
for(const layout of [2,4,2,4]) {
  const status=planning.setLayout(layout);
  assert.equal(status.pewCount,layout===2?38:100);
  assert.equal(status.pewRows,layout===2?19:25);
  assert.equal(sandbox.window.model.interior.colliders.filter(c=>c.kind==='pew'&&c.active!==false).length,status.pewCount);
  for(const group of seatingGroups){
    assert.equal(batches.get(group).visible,group.userData.seatingOption===layout);
    assert.equal(group.userData.active,group.userData.seatingOption===layout);
  }
}
assert.throws(()=>planning.setLayout(3));
const longBenches=nodes.filter(o=>o.isGroup&&o.userData.seatingLayout===2);
const columnParts=nodes.filter(o=>o.isMesh&&/^(Central column |Column base \+0.600|Carved stone pedestal cap|Timber shaft foot)/.test(o.name));
for(const pew of longBenches){
  near(pew.userData.proposedLengthM,4.65,'Long bench length');
  const box=bounds(pew);
  assert(7.25-Math.max(Math.abs(box.min.z),Math.abs(box.max.z))>=1.2,'Outer aisle must stay clear');
  assert(Math.min(Math.abs(box.min.z),Math.abs(box.max.z))>=1.2,'Centre aisle must stay clear');
  for(const column of columnParts)assert(!box.intersectsBox(bounds(column)),'Long bench must not intersect a structural column/base');
}
const allPews=nodes.filter(o=>o.isGroup&&o.userData.seatingLayout);
for(const layout of [2,4]){
  const pews=allPews.filter(o=>o.userData.seatingLayout===layout);
  for(const {bay,xs} of data.seatingStudy.additions){
    const added=pews.filter(o=>o.userData.addedRowBay===bay);
    assert.equal(added.length,layout*2,`Two complete added rows in bay ${bay}, layout ${layout}`);
    assert.deepEqual([...new Set(added.map(o=>o.position.x))].sort((a,b)=>a-b),Array.from(xs));
    const [start,end]=bay.split('–').map(axis=>data.longitudinal[axis]);
    for(const pew of added){const box=bounds(pew);assert(box.min.x>start&&box.max.x<end,'Added rows must be inside the requested bay');}
  }
  for(const pew of pews){
    const box=bounds(pew);
    for(const column of columnParts)assert(!box.intersectsBox(bounds(column)),'Pews must clear columns/bases');
    for(const aisle of data.seatingStudy.crossAisles){
      near(aisle.maxX-aisle.minX,1.2,'Door crossing width');
      assert(box.max.x<=aisle.minX+.001||box.min.x>=aisle.maxX-.001,'Door crossing geometry must stay clear');
    }
  }
  for(const collision of sandbox.window.model.interior.colliders.filter(c=>c.seatingLayout===layout))for(const aisle of data.seatingStudy.crossAisles)assert(collision.maxX<=aisle.minX+.001||collision.minX>=aisle.maxX-.001,'Door crossing collision bounds must stay clear');
  for(let i=0;i<pews.length;i++)for(let j=i+1;j<pews.length;j++)assert(!bounds(pews[i]).intersectsBox(bounds(pews[j])),'Pews must not overlap within a layout');
}

// Extract the actual model's proposed benches and ray-test its structural meshes.
// This study intentionally excludes people, liturgical furniture and decorations.
building.updateMatrixWorld(true);
const blockers=nodes.filter(o=>o.isMesh && /^(Central column |Column base \+0.600|Carved stone pedestal cap|Timber shaft foot|Sanctuary plaster pier)/.test(o.name));
const targets={altar:[44.24,1.875,0],ambo:[42.58,2.25,-2.62],crucifix:[48.01,5.2,0]};
const pewNodes=nodes.filter(o=>o.name.startsWith('Proposed pew ')&&o.isGroup);
const planPews=pewNodes.map((o,index)=>{
  const p=o.getWorldPosition(new T.Vector3()),length=o.userData.proposedLengthM;
  return {id:index+1,x:p.x,z:p.z,length,layout:o.userData.seatingLayout,block:o.userData.seatingBlock,addedRowBay:o.userData.addedRowBay||null};
}).sort((a,b)=>a.x-b.x||a.z-b.z);
const seats=planPews.flatMap(pew=>Array.from({length:Math.floor((pew.length-.075)/.55)},(_,i)=> (i-(Math.floor((pew.length-.075)/.55)-1)/2)*.55).map((offset,index)=>{
  const origin=new T.Vector3(pew.x+.045,1.15,pew.z+offset),blocked={};
  for(const [key,position] of Object.entries(targets)){
    const destination=new T.Vector3(...position),direction=destination.clone().sub(origin);
    const ray=new T.Raycaster(origin,direction.clone().normalize(),.01,direction.length()-.01);
    blocked[key]=ray.intersectObjects(blockers,false).length>0;
  }
  return {id:`${pew.id}-${index+1}`,pewId:pew.id,x:origin.x,z:origin.z,block:pew.block,layout:pew.layout,blocked};
}));
assert.equal(seats.filter(s=>s.layout===4).length,300);
assert.equal(seats.filter(s=>s.layout===2).length,304);
assert.equal(seats.filter(s=>s.block==='central'&&s.blocked.altar).length,0);
assert(seats.some(s=>s.block==='outer'&&s.blocked.altar));
const sightlineSummary=Object.fromEntries([2,4].map(blocks=>{
  const selected=seats.filter(s=>s.layout===blocks);
  return [blocks,{pewCount:planPews.filter(p=>p.layout===blocks).length,pewRows:new Set(planPews.filter(p=>p.layout===blocks).map(p=>p.x)).size,sampledSeats:selected.length,blocked:Object.fromEntries(Object.keys(targets).map(k=>[k,selected.filter(s=>s.blocked[k]).length]))}];
}));
if(process.argv.includes('--plan')){
  const planningDir=path.join(root,'Thach_Bi_Viewer/planning');fs.mkdirSync(planningDir,{recursive:true});
  const payload={revision:'2026-10-05',site:{address:'756G+GFV, Nam Đồng, Ninh Bình, Vietnam',front:'East (user confirmed; exact azimuth unmeasured)',airConditioning:false},axes:data.longitudinal,transverse:data.transverse,sideAccess:nodes.filter(o=>o.name==='Side landing at −0.320 m'||o.name==='Stone tread with projecting nosing').map(o=>{const b=bounds(o);return {kind:o.name.startsWith('Side landing')?'landing':'tread',x:b.min.x,z:b.min.z,width:b.max.x-b.min.x,depth:b.max.z-b.min.z};}),pews:planPews,seats,targets,sightlineSummary,seatingStudy:data.seatingStudy,columns:nodes.filter(o=>o.name.startsWith('Central column ')).map(o=>({name:o.name,x:o.position.x,z:o.position.z,radius:.32,baseWidth:.82})),method:'Actual THREE.Raycaster intersections against 18 main shafts, their bases/collars and sanctuary piers. One point per target, seated eye 1.15 m; excludes people and other obstructions. Positions at 0.55 m spacing within bench length minus 0.075 m end thickness: 8 per long bench or 3 per short bench. Not legal capacity.'};
  fs.writeFileSync(path.join(planningDir,'model-plan-data.js'),'window.CHURCH_PLAN_DATA = '+JSON.stringify(payload,null,2)+';\n');
}
let batchCount=0,triangles=0;
for(const b of batches.values())for(const m of b.children){batchCount++;triangles+=m.geometry.attributes.position.count/3;}
const ray=new T.Raycaster(new T.Vector3(-10,2,.5),new T.Vector3(1,0,0));
const hits=ray.intersectObjects(nodes.filter(o=>o.isMesh),false);
assert(!hits.some(h=>h.object.name==='Source-width centre entry facade'),'Facade must not fill the main door opening');
assert(hits.some(h=>h.object.name==='Open timber door leaf'&&h.point.x<3),'Closed main door must be in the entry opening');
for(const sign of [-1,1]) {
  const sideRay=new T.Raycaster(new T.Vector3(16.725,1.8,sign*18),new T.Vector3(0,0,-sign));
  assert(!sideRay.intersectObjects(bays.flatMap(g=>g.children).filter(o=>o.isMesh&&o.name==='Outer arcade wall with arched openings'),false).some(h=>Math.abs(h.point.z)>10),'Outer wall must leave side doorway clear');
}
console.log(JSON.stringify({checks:'passed',batchCount,triangles,seating:planning.state(),sightlineSummary,refinement:data.refinement},null,2));
