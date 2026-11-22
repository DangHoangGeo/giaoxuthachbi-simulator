/* Native-coordinate witnesses versus the actual assembled architectural meshes.
 * Millimetre bounds are software comparison limits, not construction tolerances. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {loadExteriorModel,root}=require('./lib/exterior_model.cjs');
const {model:m}=loadExteriorModel();
const T=m.THREE,nodes=[];m.building.traverse(o=>{if(o.isMesh)nodes.push(o);});
const read=n=>JSON.parse(fs.readFileSync(path.join(root,'docs/exterior-23102026',n),'utf8'));
const tw=read('tower-witnesses.json'),fr=read('front-witnesses.json'),rf=read('roofline-witnesses.json');
const F=id=>tw.features.find(r=>r.id===id);
const front=h=>fr.source_objects.find(r=>r.handle===h);
const roof=h=>rf.witnesses.find(r=>r.id===h);
const checks=[];
function near(value,expected,label,tolerance=.002){assert(Math.abs(value-expected)<tolerance,`${label}: ${value} != ${expected}`);checks.push({label,actual:value,source:expected,residual_mm:(value-expected)*1000});}
function named(name){const found=nodes.filter(o=>o.name===name);assert(found.length,'Missing '+name);return found;}
function box(list){const b=new T.Box3();list.forEach(o=>b.union(new T.Box3().setFromObject(o)));return b;}
function subset(name,predicate){const b=new T.Box3(),p=new T.Vector3();for(const o of named(name)){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);if(predicate(p))b.expandByPoint(p);}}assert(!b.isEmpty(),name);return b;}
assert(!nodes.some(o=>o.name==='Tower lower band'),'Legacy accent bands must not share the upper tower wall planes');
for(const [side,s] of [['H',1],['B',-1]])for(const stage of [2,3,4]){
  const prefix=`Tower ${side} stage ${stage} · `;
  const arch=F(`upper-${stage}-great-outer`),rose=F(`upper-${stage}-rose-outer`);
  near(box(named(prefix+'great arch ring')).max.y,arch.centreZY[1]+arch.radiusM,prefix+'native arch crown');
  const rb=box(named(prefix+'rose ring'));
  near(rb.min.y,rose.centreZY[1]-rose.radiusM,prefix+'rose bottom');
  near(rb.max.y,rose.centreZY[1]+rose.radiusM,prefix+'rose top');
  near((rb.min.z+rb.max.z)/2,s*rose.centreZY[0],prefix+'rose centre Z');
  const sill=F(`upper-${stage}-sill`),pane=box(named(prefix+'paired louvre backing'));
  near(pane.min.y,Math.min(...sill.pointsZY.map(p=>p[1])),prefix+'louvre sill');
  near(box(named(prefix+'stage base course')).max.y,pane.min.y-.008,prefix+'base course under sill');
  const window=F(`upper-${stage}-louvre-inner-H`);
  const walls=named(prefix+'wall with paired louvre apertures');
  const y=(window.centreZY[1]+pane.min.y)/2;
  const ray=new T.Raycaster(new T.Vector3(-10,y,s*window.centreZY[0]),new T.Vector3(1,0,0));
  assert.equal(ray.intersectObjects(walls,false).length,0,prefix+'source window is a real wall hole');
  ray.set(new T.Vector3(-10,y,s*arch.centreZY[0]),new T.Vector3(1,0,0));
  assert(ray.intersectObjects(walls,false).length>0,prefix+'wall between windows remains solid');
}
const other=read('tower-other-faces-witnesses.json');
let otherWallChecks=0;
for(const [side,s] of [['H',1],['B',-1]])for(const stage of [2,3,4])for(const face of ['outer','inner','rear']){
  const SP=other.upperOuterSideProfiles.find(r=>r.stage===stage), prefix=`Tower ${side} stage ${stage} ${face} · `;
  const arch=F(`upper-${stage}-great-outer`),rose=F(`upper-${stage}-rose-outer`);
  near(box(named(prefix+'great arch ring')).max.y,SP.greatSpringY+SP.greatRingsM.at(-1),prefix+'arch crown');
  const rb=box(named(prefix+'rose ring'));
  near(rb.max.y,SP.roseY+SP.roseOuterR,prefix+'rose top');
  near(box(named(prefix+'paired louvre backing')).min.y,SP.sillY,prefix+'sill');
  near(box(named(prefix+'stage base course')).max.y,SP.sillY-.008,prefix+'base course under sill');
  if(face!=='rear') near((rb.min.x+rb.max.x)/2,SP.roseX,prefix+'native X centre');
  const walls=named(prefix+'wall with paired louvre apertures'), y=(SP.sillY+SP.windowSpringY)/2;
  const ray=new T.Raycaster();
  for(const wx of SP.windowCentresX){
    if(face==='rear'){
      const U=F(`upper-${stage}-louvre-inner-H`), z=s*10.153-(wx-SP.horizontalCentreX+arch.centreZY[0]-10.153);
      ray.set(new T.Vector3(10,y,z),new T.Vector3(-1,0,0));
    }else ray.set(new T.Vector3(wx,y,face==='outer'?s*20:0),new T.Vector3(0,0,face==='outer'?-s:s));
    assert.equal(ray.intersectObjects(walls,false).length,0,prefix+'two source openings cut through wall');
    otherWallChecks++;
  }
  if(face==='rear') ray.set(new T.Vector3(10,y,s*10.153-(arch.centreZY[0]-10.153)),new T.Vector3(-1,0,0));
  else ray.set(new T.Vector3(SP.horizontalCentreX,y,face==='outer'?s*20:0),new T.Vector3(0,0,face==='outer'?-s:s));
  assert(ray.intersectObjects(walls,false).length>0,prefix+'solid central pier');
}
const SB=other.groundOuterSide;
near(box(named('Tower side great archivolt · E02')).max.y,SB.greatSpringY+SB.greatRingsM.at(-1),'Ground outer great arch source crown');
near(box(named('Tower side blind archivolt · E02')).max.y,SB.blindSpringY+SB.blindRingsM.at(-1),'Ground outer blind arch source crown (200.5 mm above front)');
near(box(named('Tower side window closed infill · E02')).min.y,SB.centralWindow.sillY,'Ground side window source sill');
for(const s of [-1,1]){
 const ray=new T.Raycaster(new T.Vector3(SB.centreX,2,s*20),new T.Vector3(0,0,-s));
 assert.equal(ray.intersectObjects(named('Tower base wall · outer side'),false).length,0,'Ground side source window is a real wall aperture');
 otherWallChecks++;
}
const dome=box(named('Tower dome · CAD profile'));
near(dome.max.y,F('lantern-plinth-bottom').pointsZY[0][1],'Dome meets source lantern base');
const cross=F('cross-top');
near(box(nodes.filter(o=>/^Tower cross/.test(o.name))).max.y,cross.centreZY[1]+cross.radiusM,'Tower trefoil actual apex');
const r=front('C49974'),rose=box(named('Central rose moulding'));
near(rose.min.y,(r.y_mm-r.r_mm)/1000,'Central facade native rose bottom');
near(rose.max.y,(r.y_mm+r.r_mm)/1000,'Central facade native rose top');
near(rose.max.z-r.r_mm/1000,0,'Central facade native rose outside radius');
near(box(named('Triple window horizontal rail · CAD')).min.y,front('C49A71').points_mm[0][1]/1000,'Triple-window native sill');
near(box(named('Triple window horizontal rail · CAD')).max.y,front('C49A53').points_mm[0][1]/1000,'Triple-window native top regular rail');
near(box(named('Triple window centre stile · CAD')).max.y,front('C49A7C').points_mm[1][1]/1000,'Triple-window centre stile at source inner arch');
near(box(named('Side bay upper wall')).max.z,7.128,'Obsolete D01 extension removed at source side-bay edge');
near(box(named('Upper storey plinth')).min.z,-7.128,'Plinth ends at source side-bay edge');
// The rebuilt tower rear pier covers the CAD side-bay end; test actual triangles at the seam.
const piers=nodes.filter(o=>o.name==='Tower stage pier shaft');assert(piers.length);
for(const s of [-1,1]){
 const ray=new T.Raycaster(new T.Vector3(3.5,13,s*7.115),new T.Vector3(1,0,0));
 assert(ray.intersectObjects(piers,false).length>0,'Source facade edge meets actual tower pier '+s);
}
for(const [part,predicate,handle] of [['rear',p=>p.x>50,'D902FD'],['wings',p=>Math.abs(p.z)>13,'DAB82A']]){
 const source=roof(handle),b=subset('Gable rose ring',predicate),y=source.elevation_m[0][1],r=source.radius/1000;
 near(b.min.y,y-r,part+' native rose bottom');near(b.max.y,y+r,part+' native rose top');
 const h=part==='rear'?'D90109':'DAB3A8',top=roof(h);
 near(subset('Gable cross',predicate).max.y,top.elevation_m[0][1]+top.radius/1000,part+' native cross apex');
}
near(box(named('Porch parapet top rail')).max.y,Math.max(...roof('D99C62').elevation_m.map(p=>p[1])),'E02 parapet top');
near(subset('Gable raking cornice',p=>p.x>50).max.y,12.471821785,'E03 native mitred cornice upper end');
near(subset('Gable raking cornice',p=>Math.abs(p.z)>13).max.y,9.829528809,'EW native mitred cornice upper end');
// Test actual solid relief at the formerly broken ends and the console-to-pier join.
{
  const ray=new T.Raycaster(new T.Vector3(),new T.Vector3(-1,0,0),0,4.8);
  const hits=(name,z,y)=>{
    ray.ray.origin.set(58,y,z);
    return ray.intersectObjects(named(name),false).some(hit=>hit.point.x>53.24);
  };
  for(const side of [-1,1]){
    for(const [z,y] of [[4.004,11.16],[3.94,10.67],[6.94,8.93],[7.07,8.42],[3.085,11.89],[3.235,11.2]])
      assert(hits('Rear gable rake cresting solid · E03',side*z,y),`E03 crest end has solid relief at Z ${side*z}, Y ${y}`);
    assert(!hits('Gable aedicule console acanthus · EW',side*2,13.668),'No unsupported EW fragment beside the E03 console');
    assert(hits('Gable aedicule console',side*1.047,13.8)&&hits('Gable aedicule pier',side*1.047,13.8),'E03 console overlaps its niche pier');
  }
}
// Review of 31 Oct 2026: front corner pier pedestal (E01B C45432..C45487, facade.csv F33–F35),
// the traced cartouche frame (C449B8, C45767..C4577C) and the lantern crown silhouette.
const H=p=>p.z>11&&p.x<2;
near(subset('Tower corner pier top band',H).max.y,1.848,'Tower pier pedestal top (F33)');
near(subset('Tower corner pier pedestal',H).min.y,.443,'Tower pier pedestal die bottom (F35)');
near(subset('Tower corner pier upper die',H).min.y,1.368,'Tower pier upper die bottom (F34)');
near(subset('Tower corner pier plinth',H).max.z-subset('Tower corner pier shaft',H).max.z,.269,'Tower pier plinth projection 13.587−13.318');
near(subset('Tower corner pier shaft',H).max.x,.495,'E02 front pier shaft back face');
const cart=subset('Tower front cartouche frame',p=>p.z>0);
near(cart.max.z-10.153,.9086,'Tower cartouche half-width',.025);near(cart.min.y,4.0353,'Tower cartouche bottom',.025);near(cart.max.y,4.9998,'Tower cartouche top',.025);
near(subset('Tower lantern acanthus crown',p=>p.z>0).max.z-10.153,.948,'Lantern crown leaf reach',.03);
// Central ground piers (owner review, 31 Oct 2026): E01B shaft Z 2.489–3.469, P05 front X 1.561, pedestal top +1.848.
{const sh=subset('Central ground pier shaft',p=>p.z>0);near(sh.min.z,2.489,'Central ground pier inner face');near(sh.max.z,3.469,'Central ground pier outer face');near(sh.min.x,1.561,'Central ground pier front (P05)');
 near(subset('Central ground pier pedestal',p=>p.z>0).min.x,1.561-.269,'Central ground pier plinth projection');
 const up=subset('Central bay pier shaft',p=>p.z>0);near((up.min.z+up.max.z)/2,(sh.min.z+sh.max.z)/2,'Ground and upper central piers share their axis');}
// ENG-043: square corner piers, E01B (t) and E02 (X) shaft faces per stage.
near(subset('Tower corner pier shaft',p=>p.z>11&&p.x>2).max.x,5.615,'E02 rear pier shaft back face (behind axis 2)');
near(subset('Tower corner pier shaft',p=>p.z>11&&p.x>2).min.x,4.405,'E02 rear pier shaft front face');
near(subset('Tower corner pier shaft',p=>p.z>0&&p.z<9&&p.x>2).max.x,5.04,'Inner rear pier stops at the tower rear wall (DERIVED)');
near(subset('Tower corner pier shaft',p=>p.z>11).max.z,13.318,'E01B ground pier outer face');
for(const [y,front,back,outer,y0,y1] of [[12,-.575,5.475,13.178,8.39,15.84],[19,-.465,5.365,13.068,15.84,23.14],[25,-.153,5.054,12.756,23.14,29.09]]){
 const sh=subset('Tower stage pier shaft',p=>p.z>11&&p.y>y0&&p.y<y1);
 near(sh.min.x,front,`E02 stage pier front face at +${y}`);near(sh.max.x,back,`E02 stage pier back face at +${y}`);near(sh.max.z,outer,`E01B stage pier outer face at +${y}`);
}
// Each capital band is a box. Recover the 32 individual boxes from the assembled
// mesh and check that every carved vertex stays close to a backed face.
{
 for(const legacy of named('Pilaster capital')){
  assert(!/^Tower (A–C|G–I) \/ 1–2$/.test(legacy.parent?.name),'Legacy tower capital can cover the replacement foliage');
 }
 const bands=[];
 const p=new T.Vector3();
 for(const node of named('Tower pier capital band')){
  const {index,attributes:{position}}=node.geometry;
  for(let i=0;i<index.count;i+=36){
   const b=new T.Box3();
   for(let k=i;k<i+36;k++) b.expandByPoint(p.fromBufferAttribute(position,index.getX(k)).applyMatrix4(node.matrixWorld));
   bands.push(b);
  }
 }
 assert.equal(bands.length,32,'Four capital bands per level per tower');
 for(const [kind,count] of [['front',16],['rear',16],['outer side',16],['inner side',16],['cheek',32]]){
  const supported=new Map();
  for(const node of named('Tower pier capital foliage · '+kind)){
   const {position}=node.geometry.attributes;
   for(let i=0;i<position.count;i++){
    p.fromBufferAttribute(position,i).applyMatrix4(node.matrixWorld);
    const b=bands.find(b=>p.y>b.min.y&&p.y<b.max.y&&(
     p.z>b.min.z&&p.z<b.max.z&&Math.min(Math.abs(p.x-b.min.x),Math.abs(p.x-b.max.x))<.015||
     p.x>b.min.x&&p.x<b.max.x&&Math.min(Math.abs(p.z-b.min.z),Math.abs(p.z-b.max.z))<.015
    ));
    assert(b,`${kind} carving hangs past its capital band at ${p.toArray()}`);
    if(!supported.has(b)) supported.set(b,new T.Box3());
    supported.get(b).expandByPoint(p);
   }
  }
  assert.equal(supported.size,count,`Capital foliage on every expected ${kind} face`);
  if(kind==='front') for(const [b,carving] of supported)
   near(carving.max.z+carving.min.z,b.max.z+b.min.z,'Centred tower front capital foliage');
 }
}
console.log(JSON.stringify({status:'passed',sourceSha256:tw.sourceSha256,checkedBounds:checks.length,
  largestBoundResidualMm:Math.max(...checks.map(r=>Math.abs(r.residual_mm))),actualWallApertureChecks:12+otherWallChecks, otherTowerFaces:18,
  checks,limits:'Source-coordinate software checks. Unseen depth, held door heads, units, orientation and construction confirmation remain open.'},null,2));
