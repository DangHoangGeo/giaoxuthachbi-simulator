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
for(const file of ['texture-memory.js', 'render-batches.js', 'references.js','glass-art.js','carving.js','sanctuary.js','realism.js','planning.js'])vm.runInContext(fs.readFileSync(path.join(root,'Thach_Bi_Viewer',file),'utf8'),sandbox);
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
  assert.equal(status.pewCount,layout===2?36:96);
  assert.equal(status.pewRows,layout===2?18:24);
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
    assert.equal(added.length,layout*xs.length,`Complete added rows in bay ${bay}, layout ${layout}`);
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
// Targets follow the furniture: the ambo 2.3 m in front of the altar, the corpus in its niche.
const targets={altar:[44.24,1.875,0],ambo:[41.3,2.25,-2.62],crucifix:[48.5,5.2,0]};
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
assert.equal(seats.filter(s=>s.layout===4).length,288);
assert.equal(seats.filter(s=>s.layout===2).length,288);
// The row in front of the bay 8–9 crossing is removed: at least 3.9 m stays open before the sanctuary steps (x 38.2).
assert(Math.max(...pewNodes.map(o=>bounds(o).max.x))<=34.3,'No bench stands in front of the bay 8–9 crossing');
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
for(const b of batches.values())for(const m of b.children){batchCount++;triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;}
const ray=new T.Raycaster(new T.Vector3(-10,2,.5),new T.Vector3(1,0,0));
const hits=ray.intersectObjects(nodes.filter(o=>o.isMesh),false);
assert(!hits.some(h=>h.object.name==='Source-width centre entry facade'),'Facade must not fill the main door opening');
assert(hits.some(h=>h.object.name==='Open timber door leaf'&&h.point.x<3),'Closed main door must be in the entry opening');
for(const sign of [-1,1]) {
  const sideRay=new T.Raycaster(new T.Vector3(16.725,1.8,sign*18),new T.Vector3(0,0,-sign));
  assert(!sideRay.intersectObjects(bays.flatMap(g=>g.children).filter(o=>o.isMesh&&o.name==='Outer arcade wall with arched openings'),false).some(h=>Math.abs(h.point.z)>10),'Outer wall must leave side doorway clear');
}
// Display buffers retain the full source triangle stream and original vertices.
// Verify transformed position, normal and UV against the previous expanded path.
let displayBytes=0, expandedBytes=0;
for(const [source,display] of batches){
  const parts=new Map();
  source.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)){if(!parts.has(o.material))parts.set(o.material,[]);parts.get(o.material).push(o);}});
  for(const mesh of display.children){
    const g=mesh.geometry,list=parts.get(mesh.material);let offset=0;
    assert(g.index,'display batches retain indices');
    for(const a of [...Object.values(g.attributes),g.index])displayBytes+=a.array.byteLength;
    expandedBytes+=g.index.count*32;
    for(const object of list){
      const local=object.geometry,expected=local.clone().applyMatrix4(object.matrixWorld);
      const count=local.index?.count||local.attributes.position.count;
      for(const j of new Set([0,Math.floor(count/2),count-1])){
        const a=local.index?local.index.getX(j):j,b=g.index.getX(offset+j);
        for(const name of ['position','normal','uv'])if(expected.attributes[name]){
          const x=expected.attributes[name],y=g.attributes[name];
          for(let k=0;k<x.itemSize;k++)assert(Math.abs(x.array[a*x.itemSize+k]-y.array[b*y.itemSize+k])<1e-5,`batch ${name} preserves source vertex`);
        }
      }
      expected.dispose();offset+=count;
    }
    assert.equal(g.index.count,offset,'all source triangles retained');
  }
}
assert(displayBytes<expandedBytes*.7,'indexed buffers materially reduce memory without removing triangles');
console.log(JSON.stringify({checks:'passed',batchCount,triangles,displayBytes,expandedBytes,seating:planning.state(),sightlineSummary,refinement:data.refinement},null,2));

// Sanctuary geometry regression: sheet-5 frame on the column line, shrines in its
// side arches, the timber-lined chamber behind, and clear routes through it.
assert(data.sanctuary, 'Reference sanctuary loaded');
const S=data.sanctuary, frameX=data.longitudinal['10'];
near(S.frameX,frameX,'Front frame stands on axis 10');
near(S.wingX-frameX,.2,'Shrines stand on the column line');
assert(!nodes.some(o=>o.name==='Schematic transverse tie'&&Math.abs(bounds(o).getCenter(new T.Vector3()).x-frameX)<.05),'Sheet 5: no tie beam under the lobed frame');
for(const o of nodes.filter(o=>/^Front frame (central|side) spandrel$/.test(o.name))){
  const b=bounds(o);near((b.min.x+b.max.x)/2,frameX,'Frame spandrel centred on the columns');
  assert(b.max.y<12.2&&b.max.y<S.chamber.top+2.8,'Frame spandrel stays under the roof lining');
}
assert.equal(nodes.filter(o=>o.name==='Front frame side spandrel').length,2);
for(const name of ['Central column 10/D — illustrative diameter','Central column 10/E — illustrative diameter']){
  const column=nodes.find(o=>o.name===name);assert(column,name);
  near(bounds(column).getCenter(new T.Vector3()).x,frameX,'Structural column stays on its grid');
}
// Every round column on the D/E lines is lacquered. Nave shafts (axes 3–9) are plain between a turned base on a
// panelled stone pedestal and a carved capital under the tie beam, with a junction block at beam level and a die
// under the rafter. The frame axis, which has no tie, keeps two gilded bands and a gilded capital under its die.
const shafts=nodes.filter(o=>o.isMesh&&/^Central column /.test(o.name));
assert.equal(shafts.length,18);
for(const o of shafts)assert.equal(o.material.name,'Sanctuary · oxblood lacquer',`${o.name} is lacquered`);
assert(shafts[0].material.clearcoat>.4&&shafts[0].material.map,'Lacquer is a clear coat over a faint grain');
for(const o of nodes.filter(o=>o.isMesh&&/^(Timber shaft foot|Timber capital collar|Column head \+)/.test(o.name)))assert.equal(o.material.name,'Sanctuary · oxblood lacquer',`${o.name} is lacquered`);
const part=name=>nodes.filter(o=>o.isMesh&&o.name===name),onLine=o=>near(Math.abs(o.getWorldPosition(new T.Vector3()).z),3.6,`${o.name} on the D/E line`);
const bands=part('Gilded column band'),capitals=part('Gilded column capital');
assert.equal(bands.length,4,'Gilded bands on the frame axis only');assert.equal(capitals.length,2,'Gilded capitals on the frame axis only');
for(const o of [...bands,...capitals]){onLine(o);near(bounds(o).getCenter(new T.Vector3()).x,frameX,`${o.name} on the frame axis`);}
for(const name of ['pedestal inset','capital bell','capital foliage','capital volutes','junction block','junction foliage','junction blooms and die panels']){
  const list=part(`Column carving · ${name}`);assert.equal(list.length,14,`${name} on every nave column`);
  for(const o of list){onLine(o);assert(bounds(o).getCenter(new T.Vector3()).x<frameX-5,`${name} belongs to a nave column`);}
}
for(const o of part('Column carving · capital foliage')){assert.equal(o.material.name,'Sanctuary · carved lacquered timber');assert(bounds(o).max.y<=8.59&&bounds(o).min.y>7.7,'Capital leaves stay between the neck and the tie beam');}
for(const o of part('Column carving · capital bell'))near(bounds(o).max.y,8.59,'Capital abacus meets the tie beam soffit');
for(const o of part('Column carving · junction block')){const b=bounds(o);near(b.min.y,8.59,'Junction block at the tie beam soffit');near(b.max.y,9.18,'Junction block at the tie beam top');}
for(const o of part('Timber capital collar')){const b=bounds(o);near(b.min.y,9.18,'Die stands on the beams');assert(b.max.y<9.5,'Die stays under the rafter');}
const turnedBases=part('Column carving · turned base');
assert.equal(turnedBases.length,16,'Turned base on every free-standing shaft');
for(const o of turnedBases){
  const b=bounds(o),c=b.getCenter(new T.Vector3()),framed=Math.abs(c.x-frameX)<.5;onLine(o);
  near(b.min.y,framed?.97:.78,'Turned base stands on its plinth');
  // The base stays inside the 0.84 m pedestal, so walking clearances and sightline blockers are unchanged.
  assert(b.max.x-b.min.x<=.841&&b.max.z-b.min.z<=.841&&b.max.y-b.min.y<.65,'Turned base stays within the pedestal footprint');
}
for(const o of part('Column base +0.600').filter(o=>bounds(o).getCenter(new T.Vector3()).x<frameX-5&&Math.abs(Math.abs(bounds(o).getCenter(new T.Vector3()).z)-3.6)<.01))assert.equal(o.material.name,'Proposed light sanctuary stone','Nave pedestal is pale stone');
{
  // Carving is display geometry: keep it within a budget that the batched viewer can carry.
  let triangles=0;for(const o of nodes)if(o.isMesh&&/^(Column carving|Gilded column)/.test(o.name))triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
  assert(triangles<200000,`Column ornament triangle budget: ${triangles}`);
}
// The beams and roof timbers carry the same lacquer; the nave rafters and the ridge are gilded; the lining stays ivory.
const named=name=>nodes.filter(o=>o.isMesh&&o.name===name),timber=named('Proposed underside ridge member')[0].material,lacquer=shafts[0].material;
assert.equal(timber.name,'Proposed exposed roof timber colour');
assert(timber.color.equals(lacquer.color)&&timber.map===null&&timber.bumpMap===null&&timber.roughness===lacquer.roughness,'Roof timber material has the column lacquer');
for(const [name,count] of [['Schematic transverse tie',7],['Schematic rafter; no structural design',18],['Proposed visible principal rafter below roof lining',18],['Proposed longitudinal roof purlin',6],['Proposed truss king post',7],['Proposed roof truss diagonal',14],['Timber knee brace · proposed section',36]]){
  const list=named(name);assert.equal(list.length,count,name);
  for(const o of list)assert.equal(o.material,timber,`${name} is lacquered`);
}
for(const o of named('Proposed truss connection block'))assert.equal(o.material.name,'Sanctuary · carved gilding','Truss connection block is gilded');
const rafters=named('Proposed visible principal rafter below roof lining'),rafterLines=named('Gilded rafter soffit line');
assert.equal(rafterLines.length,14,'Gilded line under each nave rafter (axes 3–9, both slopes)');
for(const line of rafterLines){
  const c=bounds(line).getCenter(new T.Vector3()),rafter=rafters.find(o=>Math.abs(o.position.x-c.x)<.01&&Math.sign(o.position.z)===Math.sign(c.z));
  assert(rafter&&c.x<frameX-.5,'Rafter line belongs to a nave rafter');
  // 0.104 m from the rafter centre line along the soffit normal: lower, and towards the nave axis.
  near(c.distanceTo(rafter.position),.104,'Rafter line lies on the soffit');assert(c.y<rafter.position.y&&Math.abs(c.z)<Math.abs(rafter.position.z),'Rafter line is on the underside');
}
const ridgeLine=named('Gilded ridge soffit line')[0],ridgeBox=bounds(named('Proposed underside ridge member')[0]);
assert(ridgeLine,'Gilded ridge line');
{const b=bounds(ridgeLine);assert(b.max.y<=ridgeBox.min.y+.003&&b.min.y>ridgeBox.min.y-.02,'Ridge line hangs under the ridge member');assert(b.min.x>5.4&&b.max.x<frameX,'Ridge line runs along the nave and stops at the frame');}
assert.equal(named('Gilded ridge boss').length,7,'A boss where each pair of nave rafters meets');
const roofLining=named('Proposed timber lining under the source roof planes')[0].material;
assert.equal(roofLining.name,'Proposed warm-ivory timber roof lining finish');assert(roofLining.color.r>.8&&roofLining.color.b>.6,'Boarded roof lining stays ivory');
// The colour toggle must bring the lacquer back, not the earlier natural grain.
realism.finish(false);realism.finish(true);
assert(timber.color.equals(lacquer.color)&&timber.map===null,'Reference palette keeps the lacquered roof timber');
assert(sandbox.window.CHURCH_SANCTUARY.naturalTimber.map,'Natural timber grain kept for the simulator tone setting');
for(const name of ['Our Lady forward wing','Saint Joseph forward wing']) {
  const wing=nodes.find(o=>o.name===name);assert(wing,name);
  const shelf=wing.children.find(o=>o.name==='Raised statue shelf above entrance');
  near(bounds(shelf).min.y,2.55,'Shelf clears service door head at 2.35 m');
  const b=bounds(wing),z=Math.abs(wing.position.z);
  assert(b.min.x<frameX&&b.max.x>frameX,'Shrine stands in the frame plane');
  // Every part of the shrine inside the frame's thickness passes under the side arch.
  const side=nodes.filter(o=>o.name==='Front frame side spandrel').find(o=>Math.sign(bounds(o).getCenter(new T.Vector3()).z)===Math.sign(wing.position.z));
  assert(Math.max(...wing.children.filter(o=>o.name==='Wing pinnacle').map(o=>bounds(o).max.y))<=S.sideArch.spring+.5,'Shrine pinnacles pass under the side arch');
  // The bay behind the shrine is closed in lacquered timber above the shelf, wall to wall and up to the roof lining.
  const fill=wing.children.find(o=>o.name==='Shrine bay fill · lacquered timber');assert(fill,'Shrine bay fill');
  const f=bounds(fill);near(f.min.y,2.85,'Bay fill stands on the shelf');
  near(Math.min(Math.abs(f.min.z),Math.abs(f.max.z)),3.75,'Bay fill meets the chamber wall');near(Math.max(Math.abs(f.min.z),Math.abs(f.max.z)),7.25,'Bay fill meets the C/G wall');
  assert(f.max.y>9.3&&f.max.y<9.6&&f.min.x>frameX+.16,'Bay fill rises to the roof lining behind the frame');
  assert.equal(fill.material.name,'Sanctuary · oxblood lacquer');
  assert(bounds(side).min.y<=S.sideArch.spring+.001,'Side arch springs above the shrine shelf');
  near(z,S.wingZ,'Shrine centred in the C–D / E–G bay');
  assert(Math.min(Math.abs(b.min.z),Math.abs(b.max.z))>=3.749&&Math.max(Math.abs(b.min.z),Math.abs(b.max.z))<=7.251,'Shrine and its returns fit between the chamber wall and the C/G wall');
  for(const base of wing.children.filter(o=>o.name==='Stone doorway base')){const c=bounds(base);assert(Math.min(Math.abs(c.min.z),Math.abs(c.max.z))>4.02&&Math.max(Math.abs(c.min.z),Math.abs(c.max.z))<6.94,'Shrine bases clear the D/E column base and the C/G pier base');}
}
const walls=nodes.filter(o=>o.name==='Chamber side wall · lacquered timber');
assert.equal(walls.length,2,'Chamber has two lined side walls');
for(const o of walls){const b=bounds(o);assert(b.min.x>=frameX+.31&&b.max.x<=data.longitudinal['11'],'Chamber wall runs from the axis-10 column back to axis 11');assert(Math.min(Math.abs(b.min.z),Math.abs(b.max.z))>=3.299,'Chamber keeps the 6.6 m clear width of the arch');}
const vault=nodes.find(o=>o.name==='Chamber vault · gilded boarding'),lining=nodes.find(o=>o.name==='Chamber back lining · lacquered timber');
assert(vault&&lining,'Chamber vault and back lining');
assert(bounds(vault).min.y>=S.centralArch.spring-.001&&bounds(vault).max.y<12.1,'Vault springs at the arch and stays under the roof');
const backWall=nodes.find(o=>o.name==='Sanctuary back wall behind the reredos');
assert(bounds(lining).max.x<=bounds(backWall).min.x+.001,'Timber lining covers the plaster back wall');
const cross=nodes.find(o=>o.name==='Proposed sanctuary crucifix upright');
const blue=nodes.find(o=>o.name==='Blue crucifix recess');
assert(bounds(cross).max.x<bounds(blue).min.x,'Crucifix sits in front of blue backing');
// Deep crucifix niche: blue wall 1.0 m behind the reredos face, cross and corpus inside it on a base,
// plaster casing clear of the service-room boards and standing through the notched ceiling.
const niche=S.niche,reveal=nodes.find(o=>o.name==='Crucifix niche reveal · lacquered timber'),casings=nodes.filter(o=>o.name==='Crucifix niche casing · plaster');
assert(reveal&&casings.length===2,'Niche reveal and casing');
near(bounds(blue).min.x,niche.backX,'Blue wall stands back in the niche');
near(bounds(reveal).min.x,niche.mouthX,'Niche opens at the reredos face');near(bounds(reveal).max.x,niche.backX,'Reveal runs back to the blue wall');
assert(niche.backX-niche.mouthX>=1,'Niche is at least 1.0 m deep');
const corpus=nodes.find(o=>o.name.startsWith('Illustrative bronze corpus'));
assert(bounds(corpus).min.x>niche.mouthX+.3&&bounds(cross).min.x>niche.mouthX+.3,'Cross and corpus stand inside the niche');
// The corpus is one carved figure hung from the crossarm (9 October 2026), not the earlier jointed proxy.
{
  const carved=nodes.filter(o=>o.isMesh&&o.name==='Illustrative corpus · carved figure'),arm=nodes.find(o=>o.name==='Proposed sanctuary crucifix crossarm'),b=bounds(corpus),a=bounds(arm),f=bounds(carved[0]);
  assert.equal(carved.length,1,'one carved corpus');
  assert(!nodes.some(o=>/^Illustrative corpus (head|torso|upper arm|forearm|hand|upper leg|lower leg)$/.test(o.name)),'jointed proxy parts removed');
  assert(carved[0].geometry.attributes.position.count/3>20000,'corpus is modelled in the round');
  assert(f.max.x<=a.min.x+.012&&f.min.x>a.min.x-.45,'corpus hangs on the face of the cross, towards the nave');
  assert(f.max.z-f.min.z>1.6&&f.max.z-f.min.z<a.max.z-a.min.z&&f.max.y-f.min.y>1.9&&f.max.y-f.min.y<2.2,'corpus span and height fit the cross');
  assert(Math.abs(f.max.y-(a.min.y+a.max.y)/2)<.12&&f.min.y>bounds(cross).min.y+.3,'hands at the crossarm, feet above the base');
  for(const [name,material] of [['Illustrative modest draped loincloth','Sanctuary · carved gilding'],['Carved corpus hair, beard and crown of thorns','Sanctuary · carved figure, darker tone'],['Crucifix nails','Sanctuary · forged iron nail'],['Crucifix title board','Sanctuary · carved gilding'],['Crucifix title · INRI','Sanctuary · gilded title board']]){
    const o=nodes.find(o=>o.name===name);assert(o&&o.material.name===material,`${name}: ${material}`);assert(bounds(o).min.x>niche.mouthX+.3&&bounds(o).max.x<bounds(blue).min.x,`${name} inside the niche`);
  }
  // Owner, 9 October 2026: the sanctuary timber is red and gold. Cross, niche boards, base and furniture take the satin red lacquer.
  for(const name of ['Proposed sanctuary crucifix upright','Proposed sanctuary crucifix crossarm','Crucifix niche reveal · lacquered timber','Outer carved canopy','Central carved timber silhouette','Crucifix base step','Proposed sloped ambo desk','Proposed sanctuary chair seat','Chair leg'])
    for(const o of nodes.filter(o=>o.isMesh&&o.name===name))assert.equal(o.material.name,'Sanctuary · oxblood lacquer, satin',`${name} is red lacquer`);
  const satin=cross.material,polished=shafts[0].material;
  assert(satin.color.r>2.2*satin.color.g&&satin.color.r>2.2*satin.color.b&&!satin.map&&satin.clearcoat<polished.clearcoat,'satin lacquer is the column red without the mirror coat');
  assert(!nodes.some(o=>o.isMesh&&o.material?.name==='Proposed dark-stained timber joinery'&&bounds(o).min.x>S.frameX-4&&bounds(o).max.x<niche.endX&&Math.abs((bounds(o).min.z+bounds(o).max.z)/2)<7.3),'no brown joinery left in the sanctuary');
}
near(Math.max(...nodes.filter(o=>o.name==='Crucifix base step').map(o=>bounds(o).max.y)),bounds(cross).min.y+.02,'Cross stands on its stepped base');
for(const name of ['Central carved timber silhouette','Reredos carved ground','Outer carved canopy','Chamber back lining · lacquered timber','Sanctuary back wall behind the reredos']){
  const hit=new T.Raycaster(new T.Vector3(47,4.5,.6),new T.Vector3(1,0,0)).intersectObject(nodes.find(o=>o.name===name),false);
  assert.equal(hit.length,0,`${name} is open for the niche`);
}
// Sanctuary relief of the approved concept: gilded scrollwork and relief as tileable finishes on plates and grounds,
// a glowing blue behind the crucifix and the statues, crocketed pinnacles, leaf crestings on the arches, a carved
// wooden corpus with a gilded cloth, and a gilded, domed tabernacle.
{
  const finish=name=>nodes.find(o=>o.isMesh&&o.material?.name===name)?.material;
  for(const name of ['Sanctuary · gilded scrollwork on lacquer','Sanctuary · gilded relief']){
    const m=finish(name);assert(m&&m.map&&m.bumpMap&&m.metalnessMap&&m.roughnessMap===m.metalnessMap,`${name} is a relief finish with gilded metal and lacquered ground`);
    assert(m.map.repeat.x>=1&&m.map.repeat.x<=3,`${name} repeats at a carved scale`);
  }
  for(const [name,count,material] of [['Central pilaster relief',12,'Sanctuary · gilded relief'],['Chamber pilaster relief',8,'Sanctuary · gilded relief'],['Wing pilaster relief',4,'Sanctuary · gilded relief'],['Shrine jamb relief',4,'Sanctuary · gilded relief'],['Shrine shelf frieze',2,'Sanctuary · gilded relief'],['Reredos frieze relief',2,'Sanctuary · gilded relief'],['Carved panel relief',11,'Sanctuary · gilded scrollwork on lacquer'],['Reredos carved ground',1,'Sanctuary · gilded scrollwork on lacquer'],['Shrine bay relief ground',2,'Sanctuary · gilded scrollwork on lacquer']]){
    const list=part(name);assert.equal(list.length,count,name);
    for(const o of list){
      assert.equal(o.material.name,material,`${name} finish`);
      // Plates carry metre-based texture coordinates, so the carving keeps one scale on every part.
      const uv=o.geometry.attributes.uv,size=dimensions(o);let span=0;for(let i=0;i<uv.count;i++)span=Math.max(span,uv.getX(i),uv.getY(i));
      assert(Math.abs(span-Math.max(size.x,size.y,size.z))<.02||name==='Reredos carved ground',`${name} is mapped in metres`);
    }
  }
  for(const o of nodes.filter(o=>/^Front frame (central|side) spandrel$/.test(o.name)))assert.equal(o.material.name,'Sanctuary · gilded scrollwork on lacquer','Front frame carries gilded scrollwork');
  for(const [name,material] of [['Blue crucifix recess','Sanctuary · blue niche'],['Wing blue niche','Sanctuary · shrine niche blue']])for(const o of part(name)){assert.equal(o.material.name,material);assert(o.material.map,`${name} has its glow`);}
  assert.equal(part('Wing blue niche').length,2);
  assert.equal(part('Carved pinnacle').length,8,'Four spires on the reredos pilasters and four on the gradine');
  assert.equal(part('Wing pinnacle').length,4);
  assert(part('Gilded leaf cresting').length>=10&&part('Gilded arch cresting').length===5,'Leaf crestings on the canopy arcs and on the three front arches and two shrine heads');
  for(const o of nodes.filter(o=>o.isMesh&&/^Illustrative corpus /.test(o.name)))assert.equal(o.material.name,'Sanctuary · carved figure, natural wood');
  const dome=part('Tabernacle dome')[0],enclosure=part('Proposed tabernacle enclosure')[0];
  assert(dome&&enclosure&&dome.material===enclosure.material&&dome.material.name==='Sanctuary · carved gilding','Tabernacle is gilded under a dome');
  near(bounds(dome).min.y,bounds(enclosure).max.y,'Dome stands on the tabernacle');
}
const casing=casings.reduce((b,o)=>b.union(bounds(o)),new T.Box3());
near(casing.max.x,niche.endX,'Casing rear face');
for(const o of nodes.filter(o=>/^(Wall enclosure · (Main|Lighting|Fans)|Cable tray|19-inch sound rack)/.test(o.name)))assert(bounds(o).max.y<casing.min.y,`Niche casing clears ${o.name}`);
const ceilings=nodes.filter(o=>o.name==='Service room ceiling');
assert.equal(ceilings.length,3,'Service room ceiling is notched round the niche');
for(const o of ceilings)assert(!bounds(o).intersectsBox(casing),'Ceiling slab does not cross the niche');
// The ambo stands well in front of the altar.
const amboFoot=nodes.find(o=>o.name==='Proposed ambo foot'),altarFoot=nodes.find(o=>o.name==='Proposed altar foot');
near(bounds(amboFoot).getCenter(new T.Vector3()).x,41.3,'Ambo position');
assert(bounds(altarFoot).min.x-bounds(amboFoot).max.x>=2,'At least 2 m between the ambo and the altar');
assert(bounds(amboFoot).min.x-39.75>=1,'Ambo stays 1 m back from the edge of the dais');
assert(!nodes.some(o=>o.name==='Statue plinth'),'Old low statue bases removed');
// Walking: the service entrances and the dais stay open, the lined walls are solid.
for(const sign of [-1,1]){
  // walkAllowed: false blocks, null leaves the decision to the base colliders.
  for(const x of [43.6,44.2,44.9,45.6,46.8])assert(realism.walkAllowed(x,sign*S.wingZ)!==false,`Service entrance route open at x ${x}`);
  assert.equal(realism.walkAllowed(44.6,sign*(S.wingZ+1.05)),false,'Shrine jamb is solid');
  assert.equal(realism.walkAllowed(46.4,sign*3.5),false,'Chamber wall is solid');
  assert(realism.walkAllowed(46.4,sign*2.9)!==false&&realism.walkAllowed(46.4,sign*4.4)!==false,'Chamber and rear passage stay walkable');
}
// Service room: one open room across the back, without inner partitions, doors or the ochre alcoves.
assert(!nodes.some(o=>/^(Service room (side wall|door)|Statue alcove)/.test(o.name)),'Service room has no inner partition, small door or alcove walls');
assert(!nodes.some(o=>o.isMesh&&/ochre/i.test(o.material?.name||'')),'No ochre alcove plaster remains');
assert.equal(nodes.filter(o=>o.name==='Service room ceiling edge beam').length,2);
for(const sign of [-1,1]){
  for(const [x,z] of [[47.6,5.5],[49.6,5.5],[51.5,5.5],[50.5,3.6],[50.5,1.5]])assert(realism.walkAllowed(x,sign*z)!==false,`Service room route open at ${x}, ${sign*z}`);
  assert.equal(realism.walkAllowed(50.8,sign*7.3),false,'C/G wall bounds the service room');
  assert.equal(realism.walkAllowed(52.9,sign*5.5),false,'Rear gable bounds the service room');
}
console.log('Sanctuary: sheet-5 frame, shrine line, chamber lining, lacquered roof timbers, door headroom, routes, open service room passed');
