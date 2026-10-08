import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const ROOT='/Users/danghoang/Desktop/giaoxuthachbi_work';
const OUT='/private/tmp/thachbi-visit-desktop-evidence/final';
const require=createRequire(path.join(ROOT,'web/package.json'));
const {chromium}=require('playwright');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch({channel:'chrome',headless:false});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage();
const errors=[]; const failures=[]; const responses=[];
page.on('pageerror',e=>errors.push({kind:'pageerror',message:e.message}));
page.on('console',m=>{if(m.type()==='error')errors.push({kind:'console',message:m.text()})});
page.on('requestfailed',r=>errors.push({kind:'requestfailed',url:r.url(),error:r.failure()?.errorText}));
page.on('response',r=>{if(r.request().resourceType()==='image')responses.push({url:r.url(),status:r.status(),contentLength:r.headers()['content-length']??null})});
const buildId=(await fs.readFile(path.join(ROOT,'web/.next/BUILD_ID'),'utf8')).trim();
const response=await page.goto('http://127.0.0.1:3132/vi/design',{waitUntil:'networkidle',timeout:60000});
const images=page.locator('main figure img');
const count=await images.count();
const initial=await images.evaluateAll(xs=>xs.map((img,i)=>({index:i,src:img.currentSrc||img.src,complete:img.complete,naturalWidth:img.naturalWidth,loading:img.loading})));
for(let i=0;i<count;i++){
  const img=images.nth(i);
  try{
    await img.scrollIntoViewIfNeeded({timeout:15000});
    await img.evaluate(el=>el.decode());
    await page.waitForFunction(el=>el.complete&&el.naturalWidth>0,await img.elementHandle(),{timeout:30000});
  }catch(e){failures.push({index:i,src:await img.getAttribute('src'),error:String(e)});}
}
const loaded=await images.evaluateAll(xs=>xs.map((img,i)=>({index:i,src:img.currentSrc||img.src,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,loading:img.loading})));
await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
await page.waitForTimeout(500);
const screenshot=path.join(OUT,'vi-design-scrolled-all-images.png');
await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});
const png=await fs.readFile(screenshot);
const overflow=await page.evaluate(()=>({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,horizontalOverflow:document.documentElement.scrollWidth>innerWidth}));
const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\/media\//.test(r.name)).map(r=>({url:r.name,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,durationMs:r.duration,initiatorType:r.initiatorType})));
const result={capturedAt:new Date().toISOString(),route:'/vi/design',status:response?.status(),buildId,viewport:{width:1440,height:1000},method:'Separate post-soak headed Chrome context; scrolled each gallery image into view and awaited decode()/complete/naturalWidth>0, returned to top, then fullPage screenshot. These image transfers are excluded from the cold initial-load metrics.',imageCount:count,initialImages:initial,loadedImages:loaded,failures,responses,mediaResourceTransfers:resources,totalMediaTransferBytes:resources.reduce((a,r)=>a+(r.transferSize||0),0),overflow,errors,screenshot:{path:screenshot,bytes:png.length,sha256:sha(png)}};
await fs.writeFile(path.join(OUT,'vi-design-scrolled-all-images.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,imageCount:count,loaded:loaded.filter(x=>x.complete&&x.naturalWidth>0).length,failures:failures.length,transferBytes:result.totalMediaTransferBytes,screenshotSha256:result.screenshot.sha256,errors:errors.length}));
await browser.close();
