/* Count/display revision comparison. Full unchanged receivers and fixed criteria. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {loadStudyModel,root,sources}=require('./lib/study_model.cjs');
const out='review/nave-wall-fans-2026-10-09';const clone=v=>JSON.parse(JSON.stringify(v));
const study=loadStudyModel(),{SIM}=study;
const sum=seats=>Object.fromEntries(['all','nave','wing'].map(zone=>{const list=seats.filter(s=>zone==='all'||(s.block==='wing')===(zone==='wing'));const metrics={};for(const key of ['lux','air','noise','sti','spl']){const vals=list.filter(s=>Number.isFinite(s[key]));const lo=vals.reduce((a,b)=>a[key]<b[key]?a:b),hi=vals.reduce((a,b)=>a[key]>b[key]?a:b);metrics[key]={min:lo[key],mean:vals.reduce((n,s)=>n+s[key],0)/vals.length,max:hi[key],worstPointXYZ:[lo.x,lo.y,lo.z],highestPointXYZ:[hi.x,hi.y,hi.z]};}return[zone,{count:list.length,metrics,failures:{luxBelow200:list.filter(s=>s.lux<200).length,airBelow0p3:list.filter(s=>s.air<.3).length,airAbove0p8:list.filter(s=>s.air>.8).length,noiseAbove45:list.filter(s=>s.noise>45).length,stiBelow0p6:list.filter(s=>s.sti<.6).length,splBelow68:list.filter(s=>s.spl<68).length}}]}));
(async()=>{try{
 const current=clone(SIM.exportLayout()),before=JSON.parse(fs.readFileSync(path.join(root,out,'before-layout.json'),'utf8'));const results=[];
 for(const blocks of [4,2]){
  let baseline;
  for(const mode of ['previous-six-off','current-sixteen-off','current-sixteen-low']){
   SIM.importLayout(clone(mode==='previous-six-off'?before:current),{record:false});SIM.setSetting('seating',String(blocks));
   if(mode==='current-sixteen-low')for(const item of SIM.state.items.filter(i=>i.circuit==='F2'))SIM.update(item.id,{on:true,speed:1},{record:false});
   const a=await study.analyse(),seats=clone(a.seats.seats);assert.equal(seats.length,368);
   if(mode==='previous-six-off')baseline=seats;else if(mode==='current-sixteen-off')assert.deepEqual(seats,baseline,'OFF count/display revision leaves all default seat results unchanged');
   else assert.deepEqual(seats.map(s=>s.lux),baseline.map(s=>s.lux),'fan comparison leaves light unchanged');
   const data={mode,blocks,settings:clone(SIM.state.settings),zones:sum(seats),seats,microphones:SIM.mics().map(m=>({id:m.id,feedbackMarginDb:m.item.feedbackMargin})),power:clone(SIM.powerSummary()),limitations:['Catalogue fan data and all site conditions remain unverified','Manual low speed comparison is not an approved scene','Same all368receivers and unchanged200lux/.3–.8m/s/45dBA/.60STI/68dBA criteria','Mean noise here is arithmetic; detailed receiver values are authoritative'],constructionApproved:false};
   fs.writeFileSync(path.join(root,out,`calculation-${blocks}-${mode}.json`),JSON.stringify(data,null,2)+'\n');results.push({mode,blocks,zones:data.zones,microphones:data.microphones,powerTotalW:data.power.total});console.log(JSON.stringify({mode,blocks,allFailures:data.zones.all.failures,power:data.power.total}));
  }
 }
 const sourceHashes=Object.fromEntries([...sources,__filename.replace(root+'/','')].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));fs.writeFileSync(path.join(root,out,'calculation-summary.json'),JSON.stringify({sourceHashes,results,constructionApproved:false},null,2)+'\n');
}finally{study.dispose()}})().catch(e=>{console.error(e);process.exitCode=1});
