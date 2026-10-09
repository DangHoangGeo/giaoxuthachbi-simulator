/* Desktop-only visual evidence. Model coordinates and analysis inputs are immutable here. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2]||'/tmp/thachbi-appearance';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'chrome',headless:process.env.HEADED!=='1',args:['--allow-file-access-from-files']});try{
 const p=await b.newPage({viewport:{width:1440,height:960}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('file://'+root+'/Thach_Bi_Viewer/OPEN_CHURCH.html');await p.waitForFunction(()=>window.church?.ready,null,{timeout:180000});
 // Wait for the initial analysis to attach derived microphone margins before snapshotting.
 await p.waitForFunction(()=>CHURCH_SIMULATOR.state.items.filter(i=>CHURCH_SIM_CATALOG.byId[i.type].mic).every(i=>Number.isFinite(i.feedbackMargin)),null,{timeout:180000});
 const before=await p.evaluate(()=>{church.pause();const S=CHURCH_SIMULATOR;S.setSetting('autoQuality',false);return JSON.stringify(S.state.items);});
 const states=[];
 for(const [place,mode] of [['nave','day'],['nave','evening'],['nave','day'],['sanctuary','day'],['sanctuary','evening']]){
  states.push(await p.evaluate(({place,mode})=>{church.goTo(place,{instant:true,mode:'explore'});church.setLighting(mode);church.render();return {place,mode,exposure:church.renderer.toneMappingExposure,environmentIntensity:church.scene.environmentIntensity,wood:CHURCH_SANCTUARY.materials.wood.color.getHexString(),carve:CHURCH_SANCTUARY.materials.carve.color.getHexString()};},{place,mode}));
  await p.screenshot({path:path.join(out,`${states.length}-${place}-${mode}.png`)});
 }
 const checks=await p.evaluate(()=>{const S=CHURCH_SIMULATOR,A=S.GEO.axes;return {items:JSON.stringify(S.state.items),chandeliers:S.state.items.filter(i=>i.type.startsWith('chandelier')).map((i,n)=>{const pairs=[['4','5'],['6','7'],['8','9'],['9','10']],pair=pairs[n];return{id:i.id,position:i.pos,expectedMidpoint:(A[pair[0]]+A[pair[1]])/2,offset:i.pos[0]-(A[pair[0]]+A[pair[1]])/2};})};});
 const old=JSON.parse(before), now=JSON.parse(checks.items);const changes=now.flatMap((it,n)=>Object.keys(it).filter(k=>JSON.stringify(it[k])!==JSON.stringify(old[n][k])).map(k=>({id:it.id,key:k,before:old[n][k],after:it[k]})));assert.deepEqual(changes,[],'display does not move/switch/dim equipment');assert.deepEqual(states[0],states[2],'day/evening/day restores finish and environment');assert(checks.chandeliers.every(i=>Math.abs(i.offset)<1e-9&&i.position[2]===0));assert(states.every(s=>s.wood==='853125'&&s.carve==='8b3827'));assert.deepEqual(errors,[]);
 delete checks.items;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({states,...checks,unchangedEquipment:true,errors},null,2)+'\n');console.log('PASS: mid-bay chandeliers, stable equipment, brighter finish, day/evening/day restoration; actual desktop screenshots saved.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
