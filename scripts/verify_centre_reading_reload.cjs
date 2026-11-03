/* Centre-head ratio and one-time migration preserve customized saved fixtures. */
'use strict';
const assert=require('node:assert/strict');
const {loadStudyModel}=require('./lib/study_model.cjs');
const clone=v=>JSON.parse(JSON.stringify(v)), key='thachbi.simulator.v1';
let s=loadStudyModel();
try {
 const current=clone(s.SIM.exportLayout()), heads=current.items.filter(it=>it.type==='readingProjector' && / · [BH] central$/.test(it.name) && Math.abs(Math.abs(it.pos[2])-.9)<.001);
 assert.equal(heads.length,14); assert(heads.every(it=>it.lumens===2800));
 const side=current.items.find(it=>it.type==='readingProjector' && it.name.includes('central · twin'));
 assert.equal(side.lumens,1500);
 assert(Math.abs(s.SIM.itemWatts(s.SIM.item(heads[0].id),true)-(2800/1500)*s.SIM.itemWatts(s.SIM.item(side.id),true))<1e-9);
 const previous=clone(current); delete previous.settings.centreReadingRevision;
 for(const h of heads) previous.items.find(it=>it.id===h.id).lumens=2300;
 const changed=previous.items.find(it=>it.id===heads[0].id); changed.lumens=1900;
 previous.items=previous.items.filter(it=>it.id!==heads[1].id); s.dispose();
 s=loadStudyModel({storageEntries:[[key,JSON.stringify(previous)]]});
 assert.equal(s.SIM.item(heads[0].id).lumens,1900,'custom output preserved');
 assert(!s.SIM.item(heads[1].id),'deleted fixture stays deleted');
 assert.equal(s.SIM.item(heads[2].id).lumens,2800,'untouched fixture updated');
 assert(s.storage.has(key+'.before-centre-reading-balance'),'backup written');
 console.log(JSON.stringify({centreReading:'passed',heads:14,outputRatio:2800/1500,customizationsPreserved:true,constructionApproved:false}));
} finally {s.dispose();}
