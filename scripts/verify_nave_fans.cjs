/* Owner count/visibility revision; saved-layout preservation and scoped adoption. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {loadStudyModel,root,sources}=require('./lib/study_model.cjs');
const out=process.argv[2]||'review/nave-wall-fans-2026-10-09';fs.mkdirSync(out,{recursive:true});
const copy=x=>JSON.parse(JSON.stringify(x));
const study=loadStudyModel(),{SIM}=study;
try {
 const current=copy(SIM.exportLayout()),before=JSON.parse(fs.readFileSync(path.join(root,out,'before-layout.json'),'utf8'));
 const D=fs.readFileSync(path.join(root,'Thach_Bi_Viewer/simulator/design.js'),'utf8');
 const vm=require('node:vm'),sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(D,sandbox);const design=sandbox.window.CHURCH_SIM_DESIGN;
 const fans=current.items.filter(i=>i.circuit==='F2');assert.equal(fans.length,16);assert.equal(new Set(current.items.map(i=>i.id)).size,current.items.length);
 for(const side of ['B','H']){const sign=side==='B'?-1:1;const list=fans.filter(i=>Math.sign(i.pos[2])===sign);assert.equal(list.length,8);assert(list.every(i=>!i.hidden&&!i.on&&i.type==='fanNaveWall'));assert.deepEqual(list.map(i=>i.pos[0]).sort((a,b)=>a-b),[5.475,9.975,14.475,18.975,23.475,27.975,32.475,36.975]);}
 // Unrelated IDs and all governing settings survive the default addition.
 for(const old of before.items.filter(i=>i.circuit!=='F2'))assert.deepEqual(current.items.find(i=>i.id===old.id),old,old.id+' unchanged');
 const normalizedTargets=copy(current.items);
 let cases=0;
 const migrated=copy(design.upgradeNaveFans(copy(before.items),normalizedTargets));assert.equal(migrated.filter(i=>i.circuit==='F2').length,16);assert.deepEqual(migrated.slice(0,before.items.length).map(i=>i.circuit==='F2'?{...i,type:'fanWall'}:i),before.items);cases++;
 const fields={moved:i=>i.pos[0]+=.25,hidden:i=>i.hidden=true,renamed:i=>i.name='Owner fan',noted:i=>i.note='Keep owner note',retuned:i=>i.tilt+=1,deleted:(i,a)=>a.splice(a.indexOf(i),1)};
 for(const [label,change]of Object.entries(fields))for(const id of ['F244','F245']){
  const edited=copy(before.items),item=edited.find(i=>i.id===id);change(item,edited);const got=copy(design.upgradeNaveFans(edited,normalizedTargets));const side=Math.sign(item.pos[2]);assert.deepEqual(got.filter(i=>Math.sign(i.pos[2])===side),edited.filter(i=>Math.sign(i.pos[2])===side),label+id+' custom side preserved');assert.equal(got.filter(i=>i.circuit==='F2'&&Math.sign(i.pos[2])===-side).length,8);cases++;
 }
 const override=copy(before.items);override.find(i=>i.id==='F244').on=true;override.find(i=>i.id==='F244').speed=3;const got=copy(design.upgradeNaveFans(override,normalizedTargets));assert.deepEqual({...got.find(i=>i.id==='F244'),type:'fanWall'},override.find(i=>i.id==='F244'));cases++;
 const conflict=copy(before.items);conflict.push({...copy(before.items.find(i=>i.id==='F244')),id:'F-NAVE-B-3',name:'Owner custom'});const retained=copy(design.upgradeNaveFans(conflict,normalizedTargets));assert.deepEqual(retained.filter(i=>i.pos[2]<0),conflict.filter(i=>i.pos[2]<0));cases++;
 assert.deepEqual(copy(design.upgradeNaveFans(migrated,normalizedTargets)),migrated,'idempotent');cases++;
 SIM.importLayout(before,{record:false});SIM.update('F244',{on:true,speed:3,note:'Keep note',pos:[14.7,5.55,-7.07]},{record:false});const pre=copy(SIM.exportLayout());const result=SIM.adoptNaveFans('B');assert(result.backupKey);assert.equal(SIM.naveFanStatus().sides.find(i=>i.side==='B').current,true);assert.equal(SIM.item('F244').on,true);assert.equal(SIM.item('F244').speed,3);assert.equal(SIM.item('F244').note,'Keep note');
 for(const i of pre.items.filter(i=>!design.naveFanTargets(current.items,'B').some(t=>t.id===i.id)))assert.deepEqual(copy(SIM.item(i.id)),i,'adoption preserves '+i.id);
 assert(SIM.undo());assert.deepEqual(copy(SIM.exportLayout().items),pre.items,'Undo actual unrecorded preceding state');assert(SIM.redo());assert.equal(SIM.naveFanStatus().sides.find(i=>i.side==='B').current,true);const adopted=copy(SIM.exportLayout().items);assert.equal(SIM.adoptNaveFans('B').changedIds.length,0);assert.deepEqual(copy(SIM.exportLayout().items),adopted);cases+=4;
 for(const name of Object.keys(SIM.SCENES)){SIM.applyScene(name,{record:false});assert(SIM.state.items.filter(i=>i.circuit==='F2').every(i=>!i.on),name+' keeps F2 OFF');}cases+=Object.keys(SIM.SCENES).length;
 const a=SIM.typeOf({type:'fanNaveWall'}),b=SIM.typeOf({type:'fanWall'});assert.deepEqual(copy(a.fan),copy(b.fan),'ratings unchanged');
 SIM.importLayout(current,{record:false});const e=SIM.electrical.exportData();for(const fan of fans){const c=e.components.find(i=>i.id===fan.id);assert(c);assert.equal(c.circuit,'F2');const routes=e.routes.filter(r=>r.itemIds.includes(fan.id)&&['drop','local'].includes(r.role));assert(routes.length);routes.forEach(r=>assert.deepEqual(copy(r.points.at(-1)),fan.pos));}
 const hashes=Object.fromEntries([...sources,'scripts/verify_nave_fans.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({checksPassed:cases,sideFans:8,totalFans:16,newIds:fans.filter(f=>!before.items.some(i=>i.id===f.id)).map(i=>i.id),sourceHashes:hashes,ratingsUnchanged:true,counts:{modelItems:current.items.length,components:e.components.length,routes:e.routes.length},constructionApproved:false},null,2)+'\n');fs.writeFileSync(path.join(out,'current-layout.json'),JSON.stringify(current,null,2)+'\n');console.log(JSON.stringify({status:'PASS',checksPassed:cases,totalWallFans:16,modelItems:current.items.length,components:e.components.length,routes:e.routes.length}));
}finally{study.dispose()}
