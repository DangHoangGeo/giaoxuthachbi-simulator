/* Fresh model load classification for the independent cable/budget review.
 * Catalogue estimates are never manufacturer nameplates. No model edits. */
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {loadStudyModel,sources}=require('./lib/study_model.cjs');
const study=loadStudyModel(), hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
try {
  const {SIM,CAT}=study, full=JSON.parse(JSON.stringify(SIM.electrical.exportData()));
  assert.deepEqual(full,JSON.parse(fs.readFileSync('docs/electrical-grid/electrical-systems.json')),'Refresh matching electrical exports before calculation');
  const registered=JSON.parse(fs.readFileSync('docs/electrical-grid/categories/manifest.json'));
  assert.equal(registered.systemsHash,hash('docs/electrical-grid/electrical-systems.json'));
  assert.equal(registered.layoutHash,hash('docs/electrical-grid/equipment-layout.json'));
  for(const c of registered.categories) assert.equal(c.sha256,hash('docs/electrical-grid/categories/'+c.file),'Register modified; refresh with preservation workflow');
  const componentIds=new Set(full.components.map(c=>c.id));
  const items=SIM.state.items.map(it=>{
    const t=CAT.byId[it.type];
    const electricalKind=t.mic?'microphone-signal':t.speaker?(t.speaker.active?'active-speaker':'passive-audio'):componentIds.has(it.id)?'mains':'non-electrical';
    return {id:it.id,name:it.name,type:it.type,circuit:it.circuit,position:it.pos,hidden:!!it.hidden,on:!!it.on,
      electricalKind,product:t.name,catalogueDescription:t.desc||null,params:it.params||{},
      catalogue:JSON.parse(JSON.stringify({light:t.light,fan:t.fan,speaker:t.speaker,mic:t.mic})),
      operatingModelW:SIM.itemWatts(it),catalogueRatedProxyW:SIM.itemWatts({...it,hidden:false},true),
      nameplateInputW:null,nameplateInputA:null,
      maximumMainsProxyW:electricalKind==='mains'?SIM.itemWatts({...it,hidden:false},true):null,
      audioRatingW:t.speaker?.ratedW??null};
  });
  const data={schema:1,status:'DERIVED / CONCEPT / ENGINEERING HOLD',gitRevision:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    sourceSha256:Object.fromEntries([...sources,'scripts/lib/study_model.cjs','scripts/export_electrical_loads.cjs','docs/electrical-grid/electrical-systems.json','docs/electrical-grid/equipment-layout.json','docs/electrical-grid/categories/manifest.json'].map(p=>[p,hash(p)])),
    items,full,settings:SIM.exportLayout().settings,scene:SIM.state.scene,
    circuits:SIM.CIRCUITS,operatingSummary:SIM.powerSummary()};
  fs.writeFileSync(process.argv[2],JSON.stringify(data,null,2)+'\n');
  console.log(`Loads classified: ${items.length} items; ${full.routes.length} routes. Nameplates remain pending.`);
} finally {study.dispose();}
