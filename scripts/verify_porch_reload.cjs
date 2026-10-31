/* Synthetic saved layouts only. Exercises the actual startup transaction. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {loadStudyModel,root}=require('./lib/study_model.cjs');
const key='thachbi.simulator.v1',backup=key+'.before-open-porch-light-sound',clone=x=>JSON.parse(JSON.stringify(x));
const prior=JSON.parse(fs.readFileSync(path.join(root,'review/veranda-sound-2026-10-25/baseline-layout.json'),'utf8'));
delete prior.settings.verandaReviewRevision;
for(const it of prior.items)if(it.circuit==='L4'||it.circuit==='A2'){it.on=false;it.dim=.4;}
const contexts=[];
try{
 const current=loadStudyModel({storageEntries:[[key,JSON.stringify(prior)]]});contexts.push(current);
 assert.equal(current.SIM.item('S261').pos[1],2.5);
 assert.equal(current.SIM.state.items.filter(it=>it.type==='porchFlood').length,54);
 assert.equal(JSON.parse(current.storage.get(backup)).items.length,prior.items.length,'Full backup precedes migration');
 const saved=JSON.parse(current.storage.get(key));
 assert.equal(saved.settings.verandaReviewRevision,current.verandaReview.revision,'Marker durably saved');
 assert(saved.items.filter(it=>it.type==='porchFlood'||it.type==='porchWallSpeaker').every(it=>!it.on&&it.dim===.4),'New lights/speakers retain off/dim state');
 const deleted=clone(saved);deleted.items=deleted.items.filter(it=>it.id!=='S-PORCH-B-2P-3');
 current.dispose();
 const reload=loadStudyModel({storageEntries:[[key,JSON.stringify(deleted)]]});contexts.push(reload);
 assert(!reload.SIM.item('S-PORCH-B-2P-3'),'Deletion stays deleted after reload');reload.dispose();
 for(const reject of [(k)=>k===backup,(k,v)=>k===key&&JSON.parse(v).settings.verandaReviewRevision]){
  const blocked=loadStudyModel({storageEntries:[[key,JSON.stringify(prior)]],rejectStorage:reject});contexts.push(blocked);
  assert.equal(blocked.SIM.item('S261').pos[1],3.45,'Storage failure retains old height');
  assert.equal(blocked.SIM.state.items.filter(it=>it.type==='porchFlood').length,0,'Storage failure restores previous equipment');
  assert(!blocked.SIM.state.settings.verandaReviewRevision,'Failed migration is not marked complete');blocked.dispose();
 }
 console.log(JSON.stringify({reload:'passed',backup:'full prior layout',durableMarker:true,deletedRetained:true,backupAndSaveFailure:'rolled back'}));
}finally{for(const ctx of contexts)ctx.dispose()}
