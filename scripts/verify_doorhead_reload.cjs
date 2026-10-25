/* Synthetic storage only: actual adoption, second reload and failed save. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{loadStudyModel,root}=require('./lib/study_model.cjs');
const key='thachbi.simulator.v1',suffix=key+'.before-doorheads-no-sconces';
const previous=JSON.parse(fs.readFileSync(path.join(root,'review/doorheads-no-sconces-2026-10-25/baseline-layout.json'),'utf8'));
delete previous.settings.doorheadReviewRevision;
let c;
try{
 c=loadStudyModel({storageEntries:[[key,JSON.stringify(previous)]]});
 assert(c.storage.has(suffix),'Full backup written');assert(!c.SIM.item('L82'),'Default sconce removed');assert(c.SIM.item('L156').pos[1]<3.2,'Side sign adopts door head');
 const saved=JSON.parse(c.storage.get(key));assert.equal(saved.settings.doorheadReviewRevision,c.doorheadReview.revision);
 saved.items=saved.items.filter(it=>it.id!=='L159');c.dispose();c=null;
 c=loadStudyModel({storageEntries:[[key,JSON.stringify(saved)]]});assert(!c.SIM.item('L159'),'Deletion stays deleted');c.dispose();c=null;
 c=loadStudyModel({storageEntries:[[key,JSON.stringify(previous)]],rejectStorage:(k,v)=>k===key&&JSON.parse(v).settings.doorheadReviewRevision});
 assert(c.SIM.item('L82'),'Failed persistence restores sconce');assert.equal(c.SIM.item('L156').pos[1],4.6,'Failed persistence restores sign');assert(!c.SIM.state.settings.doorheadReviewRevision,'Failed adoption is retried later');
 console.log(JSON.stringify({reload:'passed',fullBackup:true,durableMarker:true,deletionRetained:true,failedSave:'rolled back'}));
}finally{c?.dispose()}
