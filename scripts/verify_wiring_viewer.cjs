/* Isolated local-browser verification of wiring display, geometry reuse and
 * controls. PLAYWRIGHT_MODULE may point to the bundled Playwright installation.
 * Screenshots are design review evidence, not installation certification. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2]||'/tmp/thachbi-wiring';
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--allow-file-access-from-files']});try{
 const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('file://'+root+'/Thach_Bi_Viewer/OPEN_CHURCH.html?graphics=light');await p.waitForFunction(()=>window.church?.ready,null,{timeout:120000});
 await p.evaluate(()=>{const E=CHURCH_SIMULATOR.electrical;E.view.visible=true;E.setMode('building');church.pause();church.renderer.setPixelRatio(1);});
 for(const [name,pos,target] of [['nave-up',[27,1.65,0],[40,9.7,0]],['nave-back',[30,1.65,1],[14,9,-1]],['ambo',[38.7,2.4,-.3],[42,1.4,-2.5]],['altar',[42,2.2,2],[44.5,1.5,0]],['wing',[40.5,1.5,5.5],[40.5,7,12]],['veranda',[19,1.5,-8.5],[27,6,-9]],['service',[51,1.8,.5],[48.8,4,-2.5]],['tower-cornice',[-5,28,-10.153],[1,29.25,-10.153]]]){
  await p.evaluate(({pos,target})=>{church.places['wire-review']={title:'Wiring review',pos,target,interior:true};church.goTo('wire-review',{instant:true,mode:'explore'});church.setLighting('day');church.render();},{pos,target});await p.screenshot({path:out+'/'+name+'.jpg',quality:90});
 }
 const checks=await p.evaluate(()=>{const S=CHURCH_SIMULATOR,E=S.electrical;
  const shapes=()=>E.layer.children.filter(o=>o.userData.electricalId||o.userData.routeCover||o.name.startsWith('Cable-cover display batch')).map(o=>[o.name,o.geometry?.id]);
  const before=JSON.stringify(shapes());for(let i=0;i<8;i++)E.rebuild();const reused=before===JSON.stringify(shapes());
  const covers=E.layer.children.filter(o=>o.userData.routeCover),batches=E.layer.children.filter(o=>o.name.startsWith('Cable-cover display batch'));
  const proposedCoverCount=covers.length,batchCount=batches.filter(o=>o.visible).length,hiddenSources=covers.every(o=>!o.visible);
  const pointsBefore=JSON.stringify(E.exportData().routes.map(r=>[r.id,r.points]));
  church.setRoof(false);const roofBefore=church.uiState().roof;E.setMode('systems');const systemsCovers=batches.every(o=>!o.visible);E.setMode('building');const roofRestored=church.uiState().roof===roofBefore;church.setRoof(true);
  E.action({dataset:{act:'electrical-kind',kind:'audio'}});const audioOnly=E.layer.children.filter(o=>o.userData.electricalId&&o.geometry&&o.visible).every(o=>E.routes.some(r=>r.id===o.userData.electricalId&&['mic','audio'].includes(r.kind)));
  E.action({dataset:{act:'electrical-filter',board:'DB2'}});church.render();const emptyFilter=batches.every(o=>!o.visible);
  E.action({dataset:{act:'electrical-filter',board:'all'}});E.action({dataset:{act:'electrical-kind',kind:'all'}});
  E.select(E.routes.find(r=>r.kind==='mic'&&r.role==='drop').id);const selected=!!E.view.selected;E.view.selected=null;E.rebuild();
  E.action({dataset:{act:'electrical-visible'}});const hideWorks=!E.layer.visible;E.action({dataset:{act:'electrical-visible'}});
  return{reused,proposedCoverCount,batchCount,hiddenSources,systemsCovers,roofRestored,audioOnly,emptyFilter,selected,hideWorks,stableRoutePoints:pointsBefore===JSON.stringify(E.exportData().routes.map(r=>[r.id,r.points]))};
 });
 for(const [k,v] of Object.entries(checks))if(typeof v==='boolean')assert(v,k);assert.equal(checks.batchCount,2);
 await p.evaluate(()=>{CHURCH_SIMULATOR.electrical.setMode('building');church.places['wire-review']={title:'Wiring review',pos:[27,1.65,0],target:[40,9.7,0],interior:true};church.goTo('wire-review',{instant:true,mode:'explore'});church.setLighting('evening');church.render();});
 await p.screenshot({path:out+'/nave-evening.jpg',quality:90});
 await p.locator('#frameStyle').evaluate(e=>{e.value='reference';e.dispatchEvent(new Event('change',{bubbles:true}));});await p.evaluate(()=>church.render());await p.screenshot({path:out+'/nave-reference-frame.jpg',quality:90});await p.locator('#frameStyle').evaluate(e=>{e.value='drawn';e.dispatchEvent(new Event('change',{bubbles:true}));});
 await p.evaluate(()=>document.getElementById('seating2').click());await p.evaluate(()=>{church.goTo('nave',{instant:true});church.render();});await p.screenshot({path:out+'/nave-two-blocks.jpg',quality:90});await p.evaluate(()=>document.getElementById('seating4').click());
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{church.goTo('sanctuary',{instant:true});church.setLighting('day');church.render();});await p.screenshot({path:out+'/phone-sanctuary.jpg',quality:90});
 await p.evaluate(()=>{CHURCH_SIMULATOR.electrical.setMode('systems');church.goTo('overview',{instant:true});church.render();});await p.screenshot({path:out+'/phone-systems.jpg',quality:90});
 const info=await p.evaluate(()=>{const S=CHURCH_SIMULATOR,E=S.electrical;let bounds=[];church.scene.traverse(o=>{if(o.isMesh&&/Service room ceiling|Proposed visible principal rafter|Proposed ambo pedestal/.test(o.name)){const b=new S.THREE.Box3().setFromObject(o);bounds.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});}});return{routes:E.routes.length,covers:E.layer.children.filter(o=>o.userData.routeCover).length,methods:Object.fromEntries([...new Set(E.routes.map(r=>r.method))].map(m=>[m,E.routes.filter(r=>r.method===m).length])),bounds};});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser-checks.json',JSON.stringify({...info,checks,errors},null,2)+'\n');console.log({routes:info.routes,covers:info.covers,methods:info.methods,checks,errors});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
