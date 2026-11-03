/* Reproducible uncalibrated default seat and fan-interaction study. */
'use strict';
const {loadStudyModel}=require('./lib/study_model.cjs');
(async()=>{const c=loadStudyModel();try{const a=(await c.analyse()).seats;const groups=Object.fromEntries(['central','outer','wing'].map(block=>{const v=a.seats.filter(s=>s.block===block).map(s=>s.lux);return [block,{points:v.length,minimumLux:Math.min(...v),meanLux:v.reduce((x,y)=>x+y,0)/v.length,below200:v.filter(x=>x<200).length}]}));console.log(JSON.stringify({scenario:'default full-service four-block',bookPlaneM:.8,daylight:false,groups,fanInteractions:c.SIM.analysis.checks.filter(x=>x.title==='Light shines through fan blades'),constructionApproved:false},null,2));}finally{c.dispose()}})().catch(e=>{console.error(e);process.exitCode=1});
