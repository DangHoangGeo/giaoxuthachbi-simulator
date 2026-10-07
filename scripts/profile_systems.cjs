/* Optional browser resource/work-count check. Requires Chrome and Playwright.
 * PLAYWRIGHT_MODULE=/installed/playwright node scripts/profile_systems.cjs /tmp/report.json
 */
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=require('node:path').resolve(__dirname, '..');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true,args:['--allow-file-access-from-files']});
 try {
  const p=await b.newPage({viewport:{width:1280,height:800}});
  await p.goto('file://'+root+'/Thach_Bi_Viewer/OPEN_CHURCH.html?graphics=light');
  await p.waitForFunction(()=>window.church?.ready,null,{timeout:120000});
  await p.waitForTimeout(1500);
  const result=await p.evaluate(()=>{
   church.pause();church.goTo('nave',{instant:true});
   const S=CHURCH_SIMULATOR,E=S.electrical, layer=E.layer;
   const refs=new Map(layer.children.filter(o=>o.userData.electricalId&&!E.SOURCES[o.userData.electricalId]).map(o=>[o.userData.electricalId,o.geometry]));
   let notifications=0;const off=S.on('items',()=>notifications++);
   const items=S.state.items.filter(it=>it.circuit==='L1'&&!it.hidden);
   const update=()=>{for(const it of items)S.update(it.id,{dim:.4},{record:false});};
   const t=performance.now();if(S.batch)S.batch(update);else update();const controlsMs=performance.now()-t;off();
   const before=performance.now();E.rebuild();const routeMs=performance.now()-before;
   const replaced=layer.children.filter(o=>refs.has(o.userData.electricalId)&&o.geometry!==refs.get(o.userData.electricalId)).length;
   const fx=S.fixtures.get(items[0].id);church.renderer.render(church.scene,church.camera);
   const uses=()=>church.renderer.info.programs.reduce((sum,p)=>sum+p.usedTimes,0);
   const beforePrograms=uses();let disposed=0;
   for(let i=0;i<20;i++){fx.glowMat.addEventListener('dispose',()=>disposed++);S.update(fx.item.id,{}, {record:false,rebuild:true});church.renderer.render(church.scene,church.camera);}
   return {items:items.length,notifications,controlsMs,routeMs,replacedRouteGeometries:replaced,fixtureRebuilds:20,disposedGlowMaterials:disposed,beforeProgramUsers:beforePrograms,afterProgramUsers:uses()};
  });
  fs.writeFileSync(process.argv[2] || '/tmp/thachbi-systems-profile.json',JSON.stringify(result,null,2)+'\n');console.log(result);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
