/* Fresh default model snapshot for the Python drawing builder; never reads browser storage. */
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process');
const {loadStudyModel,sources}=require('./lib/study_model.cjs');
const study=loadStudyModel();
try {
  const E=study.SIM.electrical, full=E.exportData();
  const circuits=[...new Set(full.components.filter(c=>!c.hiddenAlternative).map(c=>c.circuit))];
  const sheets=[];
  for(const circuit of ['distribution',...circuits]) {
    E.setReviewFilter({system:circuit==='distribution'?'distribution':'all',circuit:circuit==='distribution'?'all':circuit,board:'all',item:'all'});
    sheets.push({id:circuit,label:circuit==='distribution'?'Distribution and feeders':study.SIM.CIRCUITS[circuit].label,...E.reviewExport()});
  }
  const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  const payload={schema:1,basis:'Fresh default model, not saved browser layout',gitRevision:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceFiles:Object.fromEntries([...sources,'scripts/lib/study_model.cjs'].map(p=>[p,hash(p)])),grid:study.model.data,full,sheets,steps:study.SIM.installationReview.steps,registerSystemsHash:hash('docs/electrical-grid/electrical-systems.json')};
  fs.writeFileSync(process.argv[2],JSON.stringify(payload,null,2)+'\n');
  console.log(`Exported ${full.components.filter(c=>!c.hiddenAlternative).length} installed components, ${full.routes.length} routes, ${sheets.length} drawing scopes.`);
} finally {study.dispose();}
