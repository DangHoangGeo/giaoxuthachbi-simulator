/* Actual fixed frames/glass and sign geometry, with synthetic saved records. */
const assert=require('node:assert/strict'),{loadStudyModel}=require('./lib/study_model.cjs');
const ctx=loadStudyModel(),{SIM,model,doorheadReview:R}=ctx,T=model.THREE,clone=x=>JSON.parse(JSON.stringify(x));
try{
 const items=clone(SIM.exportLayout()).items,signs=items.filter(i=>i.type==='exitSign'),glass=[],leaves=[];
 assert.equal(signs.length,5);assert(!items.some(i=>/^Sconce · axis/.test(i.name)),'Nave sconces above wall fans are removed');
 assert.equal(items.filter(i=>i.type==='fanNaveWall').length,16,'Wall fans retained');
 model.building.updateMatrixWorld(true);
 model.building.traverse(o=>{if(o.isMesh){if(/^(Inner doorway coloured oval|Entrance door coloured oval)$/.test(o.name))glass.push({name:o.name,box:new T.Box3().setFromObject(o)});if(/^(Exterior timber door leaf|Open timber door leaf)$/.test(o.name))leaves.push(new T.Box3().setFromObject(o));}});
 const boxes=[];
 for(const it of signs){
  const fx=SIM.fixtures.get(it.id),body=new T.Box3();let count=0;
  // The kit batches white case/clip geometry. Select actual vertices in the
  // unchanged case envelope before applying the root's world transform.
  fx.root.updateWorldMatrix(true,true);
  fx.root.traverse(o=>{const a=o.geometry?.attributes?.position;if(!o.isMesh||!a)return;for(let n=0;n<a.count;n++){
   const world=new T.Vector3().fromBufferAttribute(a,n).applyMatrix4(o.matrixWorld),p=fx.root.worldToLocal(world.clone());
   if(p.x>=-1e-6&&p.x<=.050001&&Math.abs(p.y)<=.085001&&Math.abs(p.z)<=.190001){body.expandByPoint(world);count++;}
  }});
  assert(count>=8&&Math.abs(body.max.y-body.min.y-.17)<1e-5,'Original sign-case geometry retained');
  const main=it.id==='L155',pane=glass.find(g=>main?g.name==='Entrance door coloured oval'&&Math.abs(g.box.min.z+g.box.max.z)<.1:g.name==='Inner doorway coloured oval'&&Math.abs((g.box.min.x+g.box.max.x)/2-it.pos[0])<.01&&Math.sign(g.box.min.z)===Math.sign(it.pos[2]));
  assert(pane&&body.max.y<pane.box.min.y-.01,'Case is below the coloured glass: '+it.id);
  const fixed=R.geometry(SIM);
  if(main)for(const z of [-.13,.13])assert(fixed.main.clone().expandByScalar(1e-6).containsPoint(new T.Vector3(it.pos[0]-it.params.backReach,it.pos[1]+it.params.clipRise,z)),'Clip meets the actual transom');
  else assert(fixed.bands.some(b=>b.clone().expandByScalar(1e-6).containsPoint(new T.Vector3(...it.pos))),'Case back contacts the fixed head band');
  for(const leaf of leaves)assert(!body.intersectsBox(leaf),'Case clears both modeled door-leaf states: '+it.id);
  const route=SIM.electrical.exportData().routes.find(r=>r.role==='drop'&&r.itemIds.includes(it.id));
  assert(route?.method==='door-head','Lead follows jamb and fixed header: '+it.id);
  for(const g of glass)for(let n=1;n<route.points.length;n++){
   const a=new T.Vector3(...route.points[n-1]),b=new T.Vector3(...route.points[n]);
   for(let k=0,count=Math.max(1,Math.ceil(a.distanceTo(b)/.02));k<=count;k++)assert(!g.box.clone().expandByScalar(.003).containsPoint(a.clone().lerp(b,k/count)),'Cable envelope avoids glass: '+it.id);
  }
  boxes.push({id:it.id,pos:it.pos,bottom:body.min.y,top:body.max.y,glassBottom:pane.box.min.y});
 }
 const originals=Object.values(R.before).map(it=>({...clone(it),on:false,dim:.4,note:'Synthetic user note'})),other=items.filter(it=>!R.before[it.id]);
 const before=other.concat(originals),after=R.upgrade(before,items);
 assert.equal(after.length,before.length-14);assert.equal(JSON.stringify(R.upgrade(after,items)),JSON.stringify(after),'Migration is idempotent');
 assert(after.filter(it=>it.type==='exitSign').every(it=>!it.on&&it.dim===.4&&it.note==='Synthetic user note'),'User sign switching/dimmer/note retained');
 const custom=clone(before);custom.find(it=>it.id==='L82').pos[1]=5.2;custom.find(it=>it.id==='L156').pos[0]+=.2;
 assert(R.upgrade(custom,items).some(it=>it.id==='L82'&&it.pos[1]===5.2),'Moved sconce preserved');
 assert(Math.abs(R.upgrade(custom,items).find(it=>it.id==='L156').pos[0]-16.925)<1e-10,'Moved sign preserved');
 assert(!R.upgrade(before.filter(it=>it.id!=='L159'),items).some(it=>it.id==='L159'),'Deleted sign is not recreated');
 SIM.applyScene('All off',{record:false});assert(SIM.state.items.filter(i=>i.circuit==='E1').every(i=>i.on),'All off retains maintained signs');
 assert.equal(SIM.powerSummary().total,15,'Maintained sign load remains 15 W');
 console.log(JSON.stringify({checks:'passed',removedSconces:14,maintainedSigns:5,signs:boxes,scope:'Model clearance and routing screens; products, fixings and life-safety compliance remain held'}));
}finally{ctx.dispose()}
