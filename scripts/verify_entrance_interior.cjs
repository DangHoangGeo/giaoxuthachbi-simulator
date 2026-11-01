/* Entrance wall repair and retirement of the two default entrance palms. */
'use strict';
const assert=require('node:assert/strict'),{loadStudyModel}=require('./lib/study_model.cjs');
const key='thachbi.simulator.v1',copy=x=>JSON.parse(JSON.stringify(x));
let s=loadStudyModel();
try {
 const S=s.SIM, layout=copy(S.exportLayout()), get=id=>layout.items.find(it=>it.id===id);
 for(const id of ['L59','L60','L61','L62','S273','S274','L155']) assert(S.item(id).pos[0]>=5.475,`${id} is inside the entrance wall`);
 assert(!S.item('D299')&&!S.item('D305'),'entrance palms retired');
 for(const n of [2,4]) {const p=s.planning.setLayout(n);assert.equal(p.pewRows,n===2?17:23);assert.equal(p.pewCount,n===2?34:92);}
 const old=copy(layout); delete old.settings.entranceInteriorRevision;
 for(const id of ['L59','L60','L61','L62','S273','S274']) old.items.find(it=>it.id===id).pos[0]=id[0]==='S'?2.655:2.65;
 const sign=old.items.find(it=>it.id==='L155');sign.pos=[5.313,sign.pos[1],0];sign.params.backReach=.08;
 old.items.push({id:'D299',type:'palm',name:'Palm · entrance B',circuit:'DECOR',mount:'floor',pos:[6.3,0,-6.55],yaw:0});
 old.items.push({id:'D305',type:'palm',name:'Palm · entrance H',circuit:'DECOR',mount:'floor',pos:[6.3,.5,6.55],yaw:0});
 old.items.find(it=>it.id==='L60').pos[2]=-4.0; // user-moved fixture remains untouched
 const n=old.items.length;s.dispose();
 s=loadStudyModel({storageEntries:[[key,JSON.stringify(old)]]});
 assert(s.storage.has(key+'.before-entrance-interior'),'prior layout backed up');
 assert.equal(s.SIM.item('L59').pos[0],5.475); assert.equal(s.SIM.item('L60').pos[0],2.65,'custom move preserved');
 assert(s.SIM.item('L155').pos[0]>5.475);assert(!s.SIM.item('D299'));assert.equal(s.SIM.item('D305').pos[1],.5,'moved plant preserved');assert.equal(s.SIM.state.items.length,n-1);
 console.log(JSON.stringify({entranceInterior:'passed',oldLayouts:true,customMovePreserved:true,constructionApproved:false}));
}finally{s.dispose();}
