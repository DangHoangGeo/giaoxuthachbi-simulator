// Focused actual-browser check of the new logical F5 review/control path.
'use strict';
const {chromium}=require(process.cwd()+'/web/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:false,args:['--allow-file-access-from-files']});
  const page=await browser.newPage({viewport:{width:1600,height:1000}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try {
    await page.goto('file://'+process.cwd()+'/Thach_Bi_Viewer/OPEN_CHURCH.html');
    await page.waitForFunction(()=>window.CHURCH_SIMULATOR?.ready && CHURCH_SIMULATOR.analysis.results.seats && !CHURCH_SIMULATOR.analysis.busy,null,{timeout:180000});
    await page.evaluate(()=>{church.pause(); CHURCH_SIMULATOR.ui.setOpen(true);CHURCH_SIMULATOR.ui.tab='wiring';});
    await page.locator('[data-act="electrical-review-circuit"]').selectOption('F5');
    const selected=await page.evaluate(()=>CHURCH_SIMULATOR.electrical.reviewSelection());
    assert.equal(selected.itemIds.length,8);
    assert(selected.sourceIds.includes('DB1') && selected.sourceIds.includes('FC1'));
    const before=await page.evaluate(()=>JSON.parse(JSON.stringify(CHURCH_SIMULATOR.state.items)));
    await page.locator('[data-act="electrical-open-controls"][data-circuit="F5"]').first().click();
    await page.locator('[data-act="speed"][data-circuit="F5"][data-speed="0"]').click();
    assert(await page.evaluate(()=>CHURCH_SIMULATOR.state.items.filter(i=>i.circuit==='F5').every(i=>!i.on)));
    await page.locator('[data-act="speed"][data-circuit="F5"][data-speed="1"]').click();
    const after=await page.evaluate(()=>JSON.parse(JSON.stringify(CHURCH_SIMULATOR.state.items)));
    assert(after.filter(i=>i.circuit==='F5').every(i=>i.on && i.speed===1));
    // Acoustic analysis writes derived feedbackMargin; it is not an editable control field.
    const stable=items=>items.map(i=>{delete i.feedbackMargin;return i;});
    assert.deepEqual(stable(after),stable(before));
    assert.deepEqual(errors,[]);
    fs.writeFileSync(__dirname+'/f5-controls.json',JSON.stringify({status:'PASS',selected,checks:['actual F5 circuit selector scopes eight wing fans','DB1 and FC1 upstream context retained','Controls F5 opens visible fan regulator','Off and Low affect only F5; original equipment state restored','zero browser errors'],limitations:['simulator operation only; no physical FC-1 hardware tested']},null,2)+'\n');
    console.log('PASS: F5 filter, DB-1/FC-1 context, Off/Low controls and exact equipment restoration');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
