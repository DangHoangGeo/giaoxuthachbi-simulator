/* Replays the frozen preceding layout. Never overwrites the before snapshot. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {loadStudyModel,root,sources}=require('./lib/study_model.cjs');
const out=path.join(root,'review/veranda-sound-2026-10-25'),clone=x=>JSON.parse(JSON.stringify(x));
(async()=>{
 const ctx=loadStudyModel(),{SIM}=ctx;
 try{
  const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline-layout.json'),'utf8')),results=[];
  for(const tilt of [null,-8,-14,-20,-26]){
   SIM.importLayout(clone(baseline),{record:false});SIM.applyScene('Full service · evening',{record:false});
   if(tilt!==null)for(const it of SIM.state.items.filter(i=>/^Wall speaker · axis/.test(i.name)))SIM.update(it.id,{pos:[it.pos[0],2.5,it.pos[2]],tilt},{record:false});
   SIM.alignDelays({record:false});
   const r=clone((await ctx.analyse()).seats),nave=r.seats.filter(s=>s.block!=='wing'),wing=r.seats.filter(s=>s.block==='wing');
   const metric=a=>({n:a.length,minSti:Math.min(...a.map(s=>s.sti)),meanSti:a.reduce((n,s)=>n+s.sti,0)/a.length,pctGood:100*a.filter(s=>s.sti>=.6).length/a.length,minSpl:Math.min(...a.map(s=>s.spl)),maxSpl:Math.max(...a.map(s=>s.spl))});
   const record={height:tilt===null?3.45:2.5,tilt:tilt??-22,nave:metric(nave),wing:metric(wing),mics:SIM.mics().map(m=>({id:m.id,name:m.item.name,margin:m.item.feedbackMargin})),seats:r.seats};
   results.push(record);console.log(JSON.stringify({...record,seats:undefined}));
  }
  fs.writeFileSync(path.join(out,'nave-height-study.json'),JSON.stringify({status:'CONCEPT estimates; all original receivers; no physics/targets changed',sources:Object.fromEntries(sources.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')])),results},null,2)+'\n');
 }finally{ctx.dispose()}
})().catch(e=>{console.error(e);process.exitCode=1});
