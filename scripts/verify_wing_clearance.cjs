/* Geometry screening only: full fixture envelopes and sampled fan sweeps.
 * Does not approve anchors, manufacturer clearances, glare or maintenance. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {loadStudyModel}=require('./lib/study_model.cjs');
const study=loadStudyModel(),{SIM,model}=study,T=model.THREE;
const out=process.argv[2]||'review/wing-revision-2026-10-09/final-clearance';fs.mkdirSync(out,{recursive:true});
try {
 if(process.argv[3]) SIM.importLayout(JSON.parse(fs.readFileSync(process.argv[3],'utf8')).layout,{record:false});
 model.scene.updateMatrixWorld(true);
 const lights=[...SIM.fixtures.values()].filter(f=>f.item.circuit==='L8');
 const speakers=[...SIM.fixtures.values()].filter(f=>/^Wing speaker/.test(f.item.name));
 const fans=[...SIM.fixtures.values()].filter(f=>f.item.circuit==='F5');
 const legacy=process.argv.includes('--legacy-four');
 assert.equal(lights.length,legacy?8:4);assert.equal(speakers.length,legacy?4:2);assert.equal(fans.length,legacy?8:4);
 const box=f=>{const b=new T.Box3().setFromObject(f.root);assert([...b.min.toArray(),...b.max.toArray()].every(Number.isFinite),'non-finite fixture envelope '+f.item.id);return b;},bounds=b=>({minimum:b.min.toArray(),maximum:b.max.toArray()});
 const gap=(a,b)=>Math.hypot(...['x','y','z'].map(k=>Math.max(a.min[k]-b.max[k],b.min[k]-a.max[k],0)));
 const records=[],swept=new Map();
 for(const f of fans){const old=f.osc.rotation.y,union=new T.Box3();let beamMinAngle=180;
  for(let degrees=-40;degrees<=40;degrees+=5){f.osc.rotation.y=-((f.item.yaw-f.item.mountYaw)+degrees)*Math.PI/180;f.root.updateMatrixWorld(true);union.union(box(f));
   // Full visible fan mesh vertices, including guard; the blade is within it.
   f.root.traverse(m=>{const p=m.geometry?.attributes?.position;if(!m.isMesh||!p)return;const v=new T.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);
     for(const l of lights.filter(l=>Math.sign(l.item.pos[2])===Math.sign(f.item.pos[2]))){const emitter=new T.Vector3(0,-1.245,0).applyMatrix4(l.root.matrixWorld),d=v.clone().sub(emitter);const a=Math.acos(Math.max(-1,Math.min(1,-d.y/d.length())))*180/Math.PI;beamMinAngle=Math.min(beamMinAngle,a);}
    }
   });
  }
  f.osc.rotation.y=old;f.root.updateMatrixWorld(true);swept.set(f.item.id,union);
  for(const [x0,x1]of [[37.675,38.675],[42.475,43.475]]) assert(union.min.y>3.608||union.max.y<.85||union.min.x>x1||union.max.x<x0,'sampled fan envelope overlaps end-gable window opening');
  if(!legacy){
   assert(union.max.x<38.675||union.min.x>42.475,'sampled fan envelope occupies reserved saints wall strip');
   assert(union.min.x>37.135&&union.max.x<44.015,'sampled fan envelope intersects modeled wing return wall');
   assert(Math.max(Math.abs(union.min.z),Math.abs(union.max.z))<=13.099,'sampled fan body penetrates modeled gable inner face');
  }
  const floor=-.32;assert(union.min.y-floor>=2.4,'sampled visible fan envelope below existing 2.4 m project screen');
  assert(beamMinAngle>50,'sampled fan envelope enters main 100 degree task beam');
  records.push({id:f.item.id,sweptEnvelope:bounds(union),minimumAboveWingFloorM:union.min.y-floor,minimumAngleFromAnyWingReadingOpticDegrees:beamMinAngle});
 }
 const pairs=[];
 for(const l of lights)for(const other of [...speakers,...fans,...lights]){
  if(l===other||Math.sign(l.item.pos[2])!==Math.sign(other.item.pos[2]))continue;
  if(other.item.circuit==='L8'&&other.item.id<l.item.id)continue;
  const a=box(l),b=swept.get(other.item.id)||box(other),clearance=gap(a,b);
  assert(!a.intersectsBox(b),`${l.item.id}/${other.item.id}: envelope intersection`);
  pairs.push({a:l.item.id,b:other.item.id,axisAlignedEnvelopeGapM:clearance});
 }
 const fanPairs=[];
 for(let a=0;a<fans.length;a++)for(let b=a+1;b<fans.length;b++){
  if(Math.sign(fans[a].item.pos[2])!==Math.sign(fans[b].item.pos[2]))continue;
  const aa=swept.get(fans[a].item.id),bb=swept.get(fans[b].item.id);
  if(aa.intersectsBox(bb)) fs.writeFileSync(path.join(out,'rejected-overlap.json'),JSON.stringify({a:fans[a].item.id,b:fans[b].item.id,aBounds:bounds(aa),bBounds:bounds(bb),status:'REJECTED: sampled swept envelopes overlap; do not approve static layout'},null,2)+'\n');
  assert(!aa.intersectsBox(bb),`sampled fan sweep envelopes intersect: ${fans[a].item.id}/${fans[b].item.id}`);
  fanPairs.push({a:fans[a].item.id,b:fans[b].item.id,axisAlignedEnvelopeGapM:gap(aa,bb)});
 }
 const speakerChecks=[];
 for(const sp of speakers){
  const a=box(sp);
  if(!legacy)assert(a.min.x>37.135&&a.max.x<44.015,'speaker envelope intersects modeled wing return wall');
  for(const [x0,x1]of [[37.675,38.675],[42.475,43.475]]) assert(a.min.y>3.608||a.max.y<.85||a.min.x>x1||a.max.x<x0,sp.item.id+': speaker overlaps end-gable window extent');
  for(const fan of fans.filter(f=>Math.sign(f.item.pos[2])===Math.sign(sp.item.pos[2]))) assert(!a.intersectsBox(swept.get(fan.item.id)),sp.item.id+'/'+fan.item.id+': speaker intersects sampled fan sweep');
  speakerChecks.push({id:sp.item.id,mount:sp.item.mount,aimYawDegrees:sp.item.yaw,envelope:bounds(a)});
 }
 const pictures=[...SIM.fixtures.values()].filter(f=>/^D-WING-/.test(f.item.id));
 if(!legacy){assert.equal(pictures.length,4);for(const p of pictures){const b=box(p);assert(b.min.x>38.675&&b.max.x<42.475,'concept frame outside reserved strip');for(const f of fans)if(Math.sign(f.item.pos[2])===Math.sign(p.item.pos[2]))assert(!b.intersectsBox(swept.get(f.item.id)),'concept frame intersects sampled fan sweep');}}
 const report={speakerChecks,pictureEnvelopes:pictures.map(f=>({id:f.item.id,...bounds(box(f))})),status:'Software geometry screen passed; physical design remains ENGINEERING HOLD',lightEnvelopes:lights.map(f=>({id:f.item.id,...bounds(box(f))})),fans:records,fixturePairs:pairs,fanPairs,
  limits:['17 yaw samples do not prove the continuous swept envelope or installation tolerances','Full AABB separation is conservative geometry evidence, not an approved service clearance','Task beam half-angle is 50 degrees; wider field tails and decorative point light can reach fan blades, so flicker remains unverified','Roof projection supplies visualization anchor only; substrate capacity, cable/driver access and load restraint are unknown','No complete architecture, inclusive sightline or concealment approval']};
 fs.writeFileSync(path.join(out,'geometry.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({wingGeometryScreen:'passed',chandeliers:lights.length,wallFans:fans.length,wingSpeakers:speakers.length,minLightSpeakerEnvelopeGapM:Math.min(...pairs.filter(p=>p.b.startsWith('S')).map(p=>p.axisAlignedEnvelopeGapM)),minFanEnvelopeGapM:Math.min(...fanPairs.map(p=>p.axisAlignedEnvelopeGapM)),constructionApproved:false}));
}finally{study.dispose();}
