/* Before/after on both original seating layouts, with unchanged targets. */
const fs=require('node:fs'),path=require('node:path'),{loadStudyModel,root}=require('./lib/study_model.cjs');
(async()=>{const c=loadStudyModel(),S=c.SIM,clone=x=>JSON.parse(JSON.stringify(x)),out=path.join(root,'review/doorheads-no-sconces-2026-10-25');
try{
 const after=clone(S.exportLayout()),before=JSON.parse(fs.readFileSync(path.join(out,'baseline-layout.json'),'utf8')),results=[];
 for(const layout of [4,2])for(const [label,input] of [['before',before],['after',after]]){
  S.importLayout(clone(input),{record:false});c.planning.setLayout(layout);S.applyScene('Full service · evening',{record:false});
  const seats=(await c.analyse()).seats,group=a=>({n:a.length,min:a.reduce((n,s)=>Math.min(n,s.lux),Infinity),mean:a.reduce((n,s)=>n+s.lux,0)/a.length,pct200:100*a.filter(s=>s.lux>=200).length/a.length});
  const r={layout,label,nave:group(seats.seats.filter(s=>s.block!=='wing')),wing:group(seats.seats.filter(s=>s.block==='wing')),all:group(seats.seats),watts:S.powerSummary().total};
  results.push(r);console.log(JSON.stringify(r));
 }
 fs.writeFileSync(path.join(out,'lighting-comparison.json'),JSON.stringify({status:'CONCEPT estimates; same receivers, targets, scene and physics',results},null,2)+'\n');
}finally{c.dispose()}})().catch(e=>{console.error(e);process.exitCode=1});
