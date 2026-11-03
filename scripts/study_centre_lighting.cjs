/* Reproducible design-development comparison; not measured photometry or approval. */
'use strict';
const {loadStudyModel}=require('./lib/study_model.cjs');
(async()=>{
 const c=loadStudyModel(), S=c.SIM;
 const middle=S.state.items.filter(it=>it.type==='readingProjector' && / · [BH] central$/.test(it.name) && Math.abs(Math.abs(it.pos[2])-.9)<.001);
 const edge=S.state.items.filter(it=>it.type==='readingProjector' && / · [BH] central · twin$/.test(it.name));
 const column=S.state.items.filter(it=>it.type==='columnUpDown');
 const stats=v=>({min:Math.min(...v),mean:v.reduce((a,b)=>a+b,0)/v.length,max:Math.max(...v)});
 try {
  for(const [name,centreLm,edgeLm,columnLm] of [['previous',2300,2300,0],['balanced',2800,1500,800],['double-trial',4600,2300,1600]]) {
   for(const it of middle) it.lumens=centreLm;
   for(const it of edge) it.lumens=edgeLm;
   for(const it of column) it.lumens=columnLm;
   const seat=(await c.analyse()).seats.seats.filter(it=>it.block==='central').map(it=>it.lux), aisle=[];
   for(const k of ['3','4','5','6','7','8']) for(const dx of [0,2.25]) aisle.push(S.analysis.pointValues(S.GEO.axes[k]+dx,0,1.2).lux);
   console.log(JSON.stringify({name,centreLm,edgeLm,columnLm,bookPlaneM:.8,centralSeats:stats(seat),aislePlaneM:1.2,aisle:stats(aisle),constructionApproved:false}));
  }
 } finally {c.dispose();}
})().catch(error=>{console.error(error);process.exitCode=1;});
