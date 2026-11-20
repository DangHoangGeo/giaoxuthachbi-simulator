/* Additive one-time migration: backup, circuit scene, later deletion and failed save. */
'use strict';
const assert=require('node:assert/strict');
const {loadStudyModel}=require('./lib/study_model.cjs');
const key='thachbi.simulator.v1', suffix=key+'.before-column-up-down', clone=v=>JSON.parse(JSON.stringify(v));
let c=loadStudyModel(); const current=clone(c.SIM.exportLayout()), revision=current.settings.columnWashRevision; c.dispose();
assert.equal(revision,'2026-11-01-column-up-down-1');
const previous=()=>{const out=clone(current);out.items=out.items.filter(it=>!it.id.startsWith('L-COLUMN-'));delete out.settings.columnWashRevision;return out;};
const open=(data,rejectStorage)=>loadStudyModel({storageEntries:[[key,JSON.stringify(data)]],rejectStorage});
try {
 const before=previous(); c=open(before); assert.deepEqual(JSON.parse(c.storage.get(suffix)).items,before.items,'backup of preceding layout');
 assert.equal(c.SIM.state.items.filter(it=>it.type==='columnUpDown').length,14);
 let saved=JSON.parse(c.storage.get(key)); assert.equal(saved.settings.columnWashRevision,revision);
 saved.items=saved.items.filter(it=>it.id!=='L-COLUMN-3-B'); c.dispose(); c=open(saved);
 assert(!c.SIM.item('L-COLUMN-3-B')&&!c.storage.has(suffix),'later deletion remains deleted and migration runs once');c.dispose();
 const night=previous(); night.scene='All off'; c=open(night);
 assert(c.SIM.state.items.filter(it=>it.type==='columnUpDown').every(it=>!it.on),'all-off layout remains off'); c.dispose();
 c=open(previous(),(k,v)=>k===key&&JSON.parse(v).settings.columnWashRevision===revision);
 assert(!c.SIM.item('L-COLUMN-3-B')&&!c.SIM.state.settings.columnWashRevision,'failed save rolls back');
 console.log(JSON.stringify({columnWashReload:'passed',backup:true,deletion:true,scene:true,rollback:true}));
} finally {c?.dispose();}
