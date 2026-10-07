/* Optional browser benchmark; no runtime dependencies are added to the viewer.
 * PLAYWRIGHT_MODULE=/installed/playwright node scripts/profile_viewer.cjs
 *   [--light] [--cpu=4] [--mode=full|auto|low] [--out=/tmp/church-profile]
 * Fresh browser storage, Chrome/actual GPU, fixed camera and keyboard walk.
 */
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const args = new Map(process.argv.slice(2).map(s => { const [k,...v]=s.replace(/^--/,'').split('=');return [k,v.join('=')||true]; }));
const root = path.resolve(__dirname,'..'), out = path.resolve(args.get('out') || '/tmp/thachbi-profile');
const url = 'file://' + path.join(root,'Thach_Bi_Viewer/OPEN_CHURCH.html') + (args.has('light') ? '?graphics=light' : '');
(async () => {
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--allow-file-access-from-files','--enable-precise-memory-info']});
  try {
    const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const started=Date.now();await page.goto(url);await page.waitForFunction(()=>window.church?.ready,null,{timeout:120000});
    const result={sourceCommit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),url,readyMs:Date.now()-started,cpuRate:Number(args.get('cpu')||1),scenarios:[],errors};
    if(result.cpuRate>1){const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:result.cpuRate});}
    await page.evaluate(mode=>{
      CHURCH_SIMULATOR.setSetting('autoQuality',false);CHURCH_PERFORMANCE.setMode(mode);
      window.profileFrames=[];window.profileShadows=0;
      const r=church.renderer,render=r.render.bind(r);
      r.render=(...a)=>{const t=performance.now();if(r.shadowMap.enabled&&r.shadowMap.needsUpdate)profileShadows++;render(...a);profileFrames.push({t,cpu:performance.now()-t});};
    },args.get('mode') || (args.has('light')?'low':'auto'));
    for(const lighting of ['day','evening']){
      await page.evaluate(l=>{church.goTo('nave',{instant:true});church.setLighting(l);},lighting);
      await page.waitForTimeout(9000);
      for(const movement of ['idle','walk']){
        if(movement==='walk')await page.keyboard.down('KeyW');
        await page.evaluate(()=>{profileFrames=[];profileShadows=0;});
        await page.waitForTimeout(5000);
        if(movement==='walk')await page.keyboard.up('KeyW');
        const data=await page.evaluate(({lighting,movement})=>{
          const r=church.renderer,gl=r.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
          const f=profileFrames,intervals=f.slice(1).map((x,i)=>x.t-f[i].t).sort((a,b)=>a-b),cpu=f.map(x=>x.cpu).sort((a,b)=>a-b);
          return {lighting,movement,frames:f.length,medianMs:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)],renderCpuMedianMs:cpu[Math.floor(cpu.length*.5)],shadowRefreshes:profileShadows,renderer:church.renderStats(),memory:r.info.memory,jsHeapBytes:performance.memory?.usedJSHeapSize,canvas:[r.domElement.width,r.domElement.height],performance:CHURCH_PERFORMANCE.stats(),lights:CHURCH_SIMULATOR.poolStats(),grid:CHURCH_SIMULATOR.persistentLighting.stats(),position:church.camera.position.toArray(),gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
        },{lighting,movement});
        result.scenarios.push(data);console.log(JSON.stringify(data));
      }
      await page.waitForTimeout(500);await page.screenshot({path:path.join(out,lighting+'.jpg'),type:'jpeg',quality:85});
    }
    // Verify explicit capture with preserveDrawingBuffer disabled.
    const png=await page.evaluate(()=>church.render());
    if(!png.startsWith('data:image/png;base64,')||png.length<10000)throw Error('Empty saved-view capture');
    fs.writeFileSync(path.join(out,'saved-view.png'),Buffer.from(png.split(',')[1],'base64'));
    // A fresh phone viewport avoids compositor remnants from desktop resizing.
    const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    phone.on('pageerror',e=>errors.push(e.message));phone.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await phone.goto(url);await phone.waitForFunction(()=>window.church?.ready,null,{timeout:120000});
    await phone.evaluate(()=>{church.goTo('nave',{instant:true});document.getElementById('discoverToggle').click();document.getElementById('mapToggle').click();});
    for(const lighting of ['day','evening']){
      await phone.evaluate(l=>church.setLighting(l),lighting);await phone.waitForTimeout(3000);
      await phone.screenshot({path:path.join(out,'phone-'+lighting+'.jpg'),type:'jpeg',quality:85});
    }
    await phone.evaluate(()=>{CHURCH_PLANNING.setLayout(2);CHURCH_SIMULATOR.setSetting('frameStyle','reference');church.setRoof(false);});await phone.waitForTimeout(1000);
    await phone.screenshot({path:path.join(out,'phone-cutaway.jpg'),type:'jpeg',quality:85});
    fs.writeFileSync(path.join(out,'profile.json'),JSON.stringify(result,null,2)+'\n');
    if(errors.length)throw Error(errors.join('\n'));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
