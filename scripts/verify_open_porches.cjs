const assert=require('node:assert/strict'),{loadStudyModel}=require('./lib/study_model.cjs');
const clone=x=>JSON.parse(JSON.stringify(x)),ctx=loadStudyModel(),{SIM,model,verandaReview:V}=ctx,T=model.THREE;
try{
 const layout=clone(SIM.exportLayout()),items=layout.items,byId=new Map(items.map(it=>[it.id,it]));
 const lights=items.filter(it=>it.type==='porchFlood'),sound=items.filter(it=>it.type==='porchWallSpeaker');
 assert.equal(lights.length,54);assert.equal(sound.length,18);assert(!items.some(it=>/^Veranda (lantern|fill) ·/.test(it.name)));
 const nodes=[];model.building.updateMatrixWorld(true);model.building.traverse(o=>{if(o.isMesh)nodes.push(o)});
 const supportNodes=nodes.filter(o=>/Porch column pilaster|Inner .*wall|Inner wall/.test(o.name));
 const pairs=[];
 for(const it of [...lights,...sound]){
  const s=Math.sign(it.pos[2]),p=new T.Vector3(...it.pos),r=new T.Raycaster(p.clone().add(new T.Vector3(0,0,s*.04)),new T.Vector3(0,0,-s),0,.2);
  const support=r.intersectObjects(supportNodes,false)[0];assert(support,'A real column/wall supports '+it.id);
  const box=new T.Box3().setFromObject(SIM.fixtures.get(it.id).root);assert(box.min.y+.32>2.4,'Porch fixture clears the 2.4 m comparison screen: '+it.id);
  pairs.push({id:it.id,box});
 }
 for(let i=0;i<pairs.length;i++)for(let j=i+1;j<pairs.length;j++)assert(!pairs[i].box.intersectsBox(pairs[j].box),'Porch fitting envelope clash: '+pairs[i].id+' / '+pairs[j].id);
 const nave=items.filter(it=>/^Wall speaker · (axis|entrance hall)/.test(it.name));assert.equal(nave.length,14);
 assert(nave.every(it=>it.pos[1]===2.5),'All nave and entrance fills have 2.5 m acoustic-centre anchors');
 const bounds=nave.map(it=>new T.Box3().setFromObject(SIM.fixtures.get(it.id).root));
 const oldScope=Object.values(V.before),rest=items.filter(it=>!oldScope.some(old=>old.id===it.id)&&!it.id.startsWith('L-ARCH-')&&!it.id.startsWith('S-PORCH-'));
 const before=rest.concat(oldScope.map(it=>({...it,on:false,dim:.4,hidden:false,note:'Preserve this user note'})));
 const template=clone(SIM.exportLayout()).items;
 const after=V.upgrade(before,template),again=V.upgrade(after,template);
 assert.equal(JSON.stringify(after),JSON.stringify(again),'Scoped migration is idempotent');
 assert.equal(after.filter(it=>it.type==='porchFlood').length,54);assert.equal(after.filter(it=>it.type==='porchWallSpeaker').length,18);
 assert(after.filter(it=>it.circuit==='L4'||it.circuit==='A2').every(it=>!it.on&&it.dim===.4),'All-off and dimmer values survive new fixtures');
 const deleted=before.filter(it=>it.id!=='S279'),held=V.upgrade(deleted,template);
 assert(!held.some(it=>it.id==='S279'||it.id.startsWith('S-PORCH-B-')||it.id.startsWith('L-ARCH-B-')),'A deleted B-side fixture prevents restoration or partial side migration');
 const moved=clone(before);moved.find(it=>it.id==='S261').pos[1]=2.9;
 const custom=V.upgrade(moved,template);assert.equal(custom.find(it=>it.id==='S261').pos[1],2.9,'Moved nave speaker preserved');
 const earlier=clone(before);Object.assign(earlier.find(it=>it.id==='S273'),{pos:[2.655,3.6,-3.05],yaw:-6.476440087185079,tilt:-26.206172946093037,delayMs:95});
 const lower=V.upgrade(earlier,template).find(it=>it.id==='S273');assert.deepEqual(clone(lower.pos),[2.655,2.5,-3.05],'Earlier entrance wall default lowers without adopting a different wall X');
 const tuned=clone(before);tuned.find(it=>it.id==='S281').level=-11;
 assert.equal(V.upgrade(tuned,template).find(it=>it.id==='S281').level,-11,'Retuned porch speaker preserved');
 for(const patch of [{beam:42},{anchorY:5.2},{mountYaw:35},{shadow:true}]){
  const custom=clone(before);Object.assign(custom.find(it=>it.id==='L119'),patch);
  assert(!V.upgrade(custom,template).some(it=>it.id.startsWith('L-ARCH-B-')),'Custom light optics/anchor/bracket/shadow preserve the side');
 }
 SIM.item('S281').delayMs+=17.3;
 const original=Object.fromEntries(SIM.state.items.filter(it=>it.type==='slimColumn'||it.type==='porchWallSpeaker').map(it=>[it.id,it.delayMs]));
 SIM.alignDelays({record:false,onlyIds:['S261']});
 for(const [id,delay] of Object.entries(original))if(id!=='S261')assert.equal(SIM.item(id).delayMs,delay,'Unselected delay retained: '+id);
 console.log(JSON.stringify({checks:'passed',porchPaths:18,archWashes:36,porchSpeakers:18,naveSpeakers:14,naveLowerEdges:bounds.map(b=>b.min.y),naveUpperEdges:bounds.map(b=>b.max.y),geometry:'model-envelope screens only; fixing, product and statutory clearances remain held',migration:'idempotent; deletions, moves, tuning, mute/dim preserved; selected delay alignment'}));
}finally{ctx.dispose()}
