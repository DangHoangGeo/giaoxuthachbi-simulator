/* Two opposed emitters per modeled column fixture; not selected-product photometry or approval. */
'use strict';
const assert=require('node:assert/strict');
const {loadStudyModel}=require('./lib/study_model.cjs');
const s=loadStudyModel(),{SIM,P}=s;
try {
  const items=SIM.state.items.filter(it=>it.type==='columnUpDown');
  assert.equal(items.length,14);
  assert(items.every(it=>it.circuit==='LD'&&it.mount==='wall'&&it.lumens===800&&SIM.itemWatts(it,true)===8));
  const lights=SIM.emitters();
  for (const it of items) {
    const sources=lights.filter(e=>e.id===it.id);
    assert.equal(sources.length,2,it.id);
    assert(sources.some(e=>e.dir[1]>.999)&&sources.some(e=>e.dir[1]<-.999),it.id+' emits up and down');
    assert(Math.abs(sources.reduce((a,e)=>a+e.lumens,0)-800)<1e-8,'flux is split, not duplicated');
    const sign=Math.sign(it.pos[2]), point=[it.pos[0],7.1,sign*3.28], normal=[0,0,-sign];
    assert(P.illuminance(point,normal,sources)>1,'upper column receives direct light: '+it.id);
  }
  const old=items[0]; old.on=false; assert(!SIM.emitters().some(e=>e.id===old.id),'switching removes both emitters');
  console.log(JSON.stringify({columnUpDown:'passed',fixtures:items.length,emitters:items.length*2,ratedW:items.length*8,constructionApproved:false}));
} finally {s.dispose();}
