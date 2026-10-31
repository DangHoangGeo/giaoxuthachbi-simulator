/* Existing receiver populations and quick modes; no target/physics changes. */
const fs=require('node:fs'),path=require('node:path');
const {loadStudyModel,root}=require('./lib/study_model.cjs');
(async()=>{
 const ctx=loadStudyModel(),{SIM}=ctx,results=[];
 try{
  for(const layout of [4,2])for(const scene of ['Full service · evening','Weekday Mass','Festival · courtyard overflow']){
   ctx.planning.setLayout(layout);SIM.applyScene(scene,{record:false});
   const seats=(await ctx.analyse()).seats.seats;
   const group=a=>({count:a.length,minSTI:Math.min(...a.map(s=>s.sti)),meanSTI:a.reduce((n,s)=>n+s.sti,0)/a.length,goodPct:100*a.filter(s=>s.sti>=.6).length/a.length,minLux:Math.min(...a.map(s=>s.lux))});
   const row={layout,scene,nave:group(seats.filter(s=>s.block!=='wing')),wing:group(seats.filter(s=>s.block==='wing')),mics:SIM.mics().map(m=>({id:m.id,margin:m.item.feedbackMargin}))};
   results.push(row);console.log(JSON.stringify(row));
  }
  fs.writeFileSync(path.join(root,'review/veranda-sound-2026-10-25/sensitivity.json'),JSON.stringify({status:'CONCEPT estimates; existing criteria and receiver grids retained',results},null,2)+'\n');
 }finally{ctx.dispose()}
})().catch(e=>{console.error(e);process.exitCode=1});
