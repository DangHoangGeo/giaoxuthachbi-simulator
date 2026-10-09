/* Coordinated wing comparisons. Imports complete layouts so product/type caches
 * agree; never changes physics, criteria, seats or the saved default design. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {loadStudyModel,sources}=require('./lib/study_model.cjs');
const out=process.argv[2]||'/tmp/thachbi-wing-options';fs.mkdirSync(out,{recursive:true});
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const inputs=JSON.parse(fs.readFileSync(process.argv[3]||'review/wing-options-2026-10-09/cases.json','utf8'));
const sourceHashes=Object.fromEntries([...sources,'scripts/lib/study_model.cjs','scripts/study_wing_options.cjs','review/wing-options-2026-10-09/baseline-layout.json'].map(p=>[p,hash(p)]));
const clone=x=>JSON.parse(JSON.stringify(x));const aim=(from,to)=>({yaw:Math.atan2(to[2]-from[2],to[0]-from[0])*180/Math.PI,tilt:Math.atan2(to[1]-from[1],Math.hypot(to[0]-from[0],to[2]-from[2]))*180/Math.PI});
const study=loadStudyModel(),{SIM,model}=study;const baseline=JSON.parse(fs.readFileSync('review/wing-options-2026-10-09/baseline-layout.json','utf8'));
const patch=(items,id,p)=>{const it=items.find(i=>i.id===id);assert(it,id);Object.assign(it,p);};
(async()=>{const results=[];let expected=null;
for(const c of inputs.cases){
 SIM.importLayout(clone(baseline),{record:false});model.interior.setSeatingLayout(c.blocks||4);SIM.refreshSeating();
 SIM.state.scene=baseline.scene;
 if(c.scene)assert(SIM.applyScene(c.scene,{record:false}));const layout=clone(SIM.exportLayout());
 if(c.showWall)for(const i of layout.items.filter(i=>i.type==='fanWall'))Object.assign(i,{hidden:false,on:false});
 if(c.light){for(const i of layout.items.filter(i=>i.circuit==='L8')){
 const sign=Math.sign(i.pos[2]),front=i.name.includes('front block'),back=i.name.includes('back rows');
 if(c.light.countPerWing===2&&!back){i.hidden=true;continue;}
 const p=[front?38.94:42.22,c.light.y,sign*(c.light.countPerWing===2?10.15:back?c.light.backZ:c.light.frontZ)];
 const anchor=SIM.structureAbove(p[0],p[2],p[1]+.05);assert(anchor,'No model roof support projection');
 Object.assign(i,{type:c.light.type,mount:'pendant',pos:p,anchorY:anchor.y,yaw:0,mountYaw:0,tilt:-90,beam:c.light.beam||70,lumens:c.light.lumens,dim:c.light.dim??1,cct:2700,hidden:false,on:true});
 }}
 if(c.fans){let old=layout.items.filter(i=>/^Ceiling fan · wing/.test(i.name));
 for(const sign of [-1,1]){const existing=old.filter(i=>Math.sign(i.pos[2])===sign);
 c.fans.points.forEach((f,n)=>{const p=[f.x,f.y??c.fans.y,sign*13.06],a=aim(p,[f.targetX,.28,sign*f.targetZ]);
 const obj={type:'fanWall',mount:'wall',pos:p,anchorY:f.y??c.fans.y,mountYaw:-sign*90,...a,circuit:'F5',speed:c.fans.speed,on:true,hidden:false,oscillate:true,name:`Wing wall fan study ${sign<0?'B':'H'} ${n+1}`};
 if(n<existing.length)Object.assign(existing[n],obj);else layout.items.push({...clone(existing[0]),...obj,id:`F-WING-${sign<0?'B':'H'}-${n+1}`});
 });}
 }
 SIM.importLayout(layout,{record:false});
 for(const it of SIM.state.items)assert.equal(SIM.fixtures.get(it.id).type.id,it.type,'Fixture type must match candidate');
 const seats=clone((await study.analyse()).seats.seats),signature=seats.map(p=>[p.x,p.y,p.z,p.block,p.pew]);
 if((c.blocks||4)===4){if(!expected)expected=signature;else assert.deepEqual(signature,expected,'Receivers changed');}
 const zones={};for(const zone of ['all','wing-B','wing-H','nave']){const ss=seats.filter(p=>zone==='all'||zone==='nave'&&p.block!=='wing'||zone==='wing-B'&&p.block==='wing'&&p.z<0||zone==='wing-H'&&p.block==='wing'&&p.z>0);const metrics={};
 for(const k of ['lux','air','noise','sti']){const sorted=[...ss].sort((a,b)=>(a[k]??Infinity)-(b[k]??Infinity));metrics[k]={min:sorted[0][k],max:sorted.at(-1)[k],mean:ss.reduce((v,p)=>v+(p[k]??0),0)/ss.length,minimumSeatFloor:[sorted[0].x,sorted[0].y,sorted[0].z],maximumSeatFloor:[sorted.at(-1).x,sorted.at(-1).y,sorted.at(-1).z],worstSeatFloor:(k==='noise'?[sorted.at(-1).x,sorted.at(-1).y,sorted.at(-1).z]:[sorted[0].x,sorted[0].y,sorted[0].z]),below:ss.filter(p=>p[k]!==null&&p[k]<({lux:200,air:.3,sti:.6,noise:0}[k])).length,above:k==='air'?ss.filter(p=>p.air>.8).length:k==='lux'?ss.filter(p=>p.lux>300).length:k==='noise'?ss.filter(p=>p.noise>45).length:null};}zones[zone]={n:ss.length,...metrics};}
 const itemIds=SIM.state.items.filter(i=>i.circuit==='L8'||/^Wing wall fan study/.test(i.name)||i.type==='fanWall').map(i=>i.id);
 const result={case:c,zones,seats,checks:clone(SIM.analysis.checks),microphones:SIM.mics().map(m=>({id:m.id,position:m.pos,feedbackMarginDb:m.item.feedbackMargin})),power:SIM.powerSummary(),layout:clone(SIM.exportLayout()),equipment:SIM.state.items.filter(i=>itemIds.includes(i.id)),fanSources:SIM.fans().filter(f=>itemIds.includes(f.id))};
 results.push(result);fs.writeFileSync(path.join(out,c.id+'.json'),JSON.stringify(result,null,2)+'\n');console.log(c.id,JSON.stringify(zones['wing-B']));
}
for(const[p,v]of Object.entries(sourceHashes))assert.equal(hash(p),v,'Source changed during calculation');
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results.map(r=>({case:r.case,zones:r.zones,microphones:r.microphones,checks:r.checks})),null,2)+'\n');
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({schema:1,status:'Concept comparison; not a performance or construction approval',sources:sourceHashes,inputs,measurementPlanes:{lux:'book position from model, local floor + 0.80 m',air:'seat XZ, local floor + 0.60 m',noise:'seat XZ, local floor + 1.20 m',sti:'seat XZ, local floor + 1.20 m',summaryCoordinates:'seat floor XYZ, not measurement-plane XYZ'},criteria:{lux:200,preferredLuxUpper:300,air:[.3,.8],sti:.6,wingTestFloor:.45,feedbackDb:3,noiseDbA:45},limitations:['Unchanged empirical fan jet model; no duty curves, pressure network or time-resolved CFD','Catalogue assumptions and model geometry, no selected product or survey','Occluders do not include all displayed geometry; physical beam/blade/sightline/mount checks remain','Fan sweep averages are not guaranteed instantaneous air speed']},null,2)+'\n');study.dispose();
})().catch(e=>{console.error(e);study.dispose();process.exitCode=1;});
