/* Desktop review navigation and real download; isolated file:// storage. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), out = process.argv[2] || '/tmp/thachbi-review-navigation';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({channel:'chrome', headless:process.env.HEADED !== '1', args:['--allow-file-access-from-files']});
  try {
    const page = await browser.newPage({viewport:{width:1600,height:1000}, acceptDownloads:true}), errors=[], frames=[];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
    await page.goto('file://'+root+'/Thach_Bi_Viewer/OPEN_CHURCH.html');
    await page.waitForFunction(()=>window.church?.ready, null, {timeout:180000});
    await page.evaluate(()=>{church.pause();church.setLighting('day');});
    const before = await page.evaluate(()=>JSON.stringify(CHURCH_SIMULATOR.electrical.exportData()));
    await page.locator('#simulatorButton').click();
    await page.locator('#simPanel [data-tab=wiring]').click();
    await page.locator('[data-act=electrical-system][data-system=lighting]').click();
    await page.locator('[data-act=electrical-mode][data-mode=systems]').click();
    async function inspectFit(name, routeId=null) {
      const state=await page.evaluate(id=>{
        const E=CHURCH_SIMULATOR.electrical, camera=church.camera;
        church.render();camera.updateMatrixWorld(true);
        const routes=id ? E.routes.filter(r=>r.id===id) : E.routes.filter(r=>E.reviewSelection().routeIds.includes(r.id));
        const points=routes.flatMap(r=>r.points.map(p=>camera.position.clone().fromArray(p).project(camera).toArray()));
        return {routes:routes.map(r=>r.id), points, mode:church.mode};
      },routeId);
      assert.equal(state.mode,'explore');assert(state.points.length);
      assert(state.points.every(p=>p.every(Number.isFinite)&&Math.abs(p[0])<1&&Math.abs(p[1])<1&&p[2]>-1&&p[2]<1),name+': every route vertex is inside actual camera frustum');
      frames.push({name,routeIds:state.routes,vertices:state.points.length});
      await page.screenshot({path:path.join(out,name+'.png')});
    }
    await inspectFit('01-lighting-fit');
    await page.locator('[data-act=electrical-isolate-item][data-id=L78]').click();
    await page.waitForFunction(()=>document.querySelector('.electrical-inspector')?.textContent.includes('L78'));
    const inspector=page.locator('.electrical-inspector');
    assert((await inspector.innerText()).includes('Engineering hold'));
    assert((await inspector.innerText()).includes('Shared route context'));
    await inspector.locator('[data-act=electrical-fit]').click();
    await inspectFit('02-chandelier-connections');
    const pending=page.waitForEvent('download');
    await inspector.locator('[data-act=electrical-review-json]').click();
    const download=await pending;
    assert.equal(download.suggestedFilename(),'thach-bi-electrical-review.json');
    const downloadPath=path.join(out,'chandelier-review.json');await download.saveAs(downloadPath);
    const exported=JSON.parse(fs.readFileSync(downloadPath,'utf8'));
    assert.deepEqual(exported,await page.evaluate(()=>CHURCH_SIMULATOR.electrical.reviewExport()));
    assert.deepEqual(exported.itemIds,['L78']);assert.equal(exported.routes.length,3);
    await inspector.locator('[data-electrical-id="feeder:LC1"]').click();
    await page.locator('[data-act=electrical-focus]').click();
    await inspectFit('03-feeder-fit','feeder:LC1');
    await page.locator('[data-act=electrical-review-reset]').click();
    await page.locator('[data-act=electrical-system][data-system=sound]').click();
    const microphone=await page.evaluate(()=>CHURCH_SIMULATOR.state.items.find(i=>!i.hidden&&CHURCH_SIM_CATALOG.byId[i.type].mic).id);
    await page.locator('[data-act=electrical-isolate-item][data-id="'+microphone+'"]').click();
    await page.waitForFunction(id=>document.querySelector('.electrical-inspector')?.textContent.includes(id),microphone);
    assert((await inspector.innerText()).includes('Microphone signal · '+microphone+' → AV1'));
    assert((await inspector.innerText()).includes('separate connections'));
    await inspector.locator('[data-act=electrical-fit]').click();
    await inspectFit('04-microphone-connections');
    await page.evaluate(()=>{church.setLighting('evening');church.render();});
    await page.screenshot({path:path.join(out,'05-evening-inspector.png')});
    await page.locator('[data-act=electrical-mode][data-mode=building]').click();
    await page.evaluate(()=>{church.goTo('nave',{instant:true});church.render();});
    await page.screenshot({path:path.join(out,'06-restored-building.png')});
    assert.equal(await page.evaluate(()=>JSON.stringify(CHURCH_SIMULATOR.electrical.exportData())),before);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({frames,downloadItems:exported.itemIds,downloadRoutes:exported.routeIds,unchangedExport:true,errors},null,2)+'\n');
    console.log('PASS: actual camera framing, connection inspector, isolated review download, microphone signal distinction and evening restoration.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
