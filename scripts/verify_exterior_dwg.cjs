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
console.log(JSON.stringify({status:'passed',sourceSha256:tw.sourceSha256,checkedBounds:checks.length,
  largestBoundResidualMm:Math.max(...checks.map(r=>Math.abs(r.residual_mm))),actualWallApertureChecks:12+otherWallChecks, otherTowerFaces:18,
  checks,limits:'Source-coordinate software checks. Unseen depth, held door heads, units, orientation and construction confirmation remain open.'},null,2));
