import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const repo = '/Users/danghoang/Desktop/giaoxuthachbi_work';
const web = path.join(repo, 'web');
const out = '/private/tmp/thachbi-development-display-desktop';
const baseUrl = 'http://127.0.0.1:3130';
const expectedBuildId = 'oT1CH6lG1eRFtvqP9unlz';
const nodeBin = '/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin/node';
const require = createRequire(path.join(web, 'package.json'));
const { chromium } = require('playwright');
const AxeModule = require('@axe-core/playwright');
const AxeBuilder = AxeModule.default || AxeModule;
const sourceFiles = [
  'AGENTS.md', 'docs/web/publication-permission.md', 'docs/web/development-publication-assets.json',
  'web/package.json', 'web/package-lock.json', 'web/.node-version', 'web/.next/BUILD_ID',
  'web/content/current.json', 'web/content/release.json', 'web/src/app/globals.css',
  'web/src/app/[locale]/layout.tsx',
  'web/src/app/[locale]/(public)/page.tsx', 'web/src/app/[locale]/(public)/design/page.tsx',
  'web/src/app/[locale]/(public)/progress/page.tsx', 'web/src/app/[locale]/(public)/progress/[eventId]/page.tsx',
  'web/src/app/[locale]/(public)/about-this-site/page.tsx',
  'web/src/components/site-shell.tsx', 'web/src/components/gallery-card.tsx', 'web/src/components/event-dates.tsx',
  'web/src/components/freshness.tsx', 'web/src/lib/gallery.ts', 'web/src/lib/locales.ts',
  'web/src/lib/progress.ts', 'web/src/lib/server/public-content.ts', 'web/src/lib/server/public-validation.ts',
  'web/src/lib/server/public-version.ts', 'web/src/lib/contracts/public-content.ts', 'web/src/lib/contracts/common.ts'
];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hashSnapshot = async files => Object.fromEntries(await Promise.all(files.map(async rel => {
  try { return [rel, sha(await fs.readFile(path.join(repo, rel)))]; }
  catch { return [rel, null]; }
})));
const git = args => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const release = JSON.parse(await fs.readFile(path.join(web, 'content/release.json'), 'utf8'));
const pointer = JSON.parse(await fs.readFile(path.join(web, 'content/current.json'), 'utf8'));
const releaseAssetPaths = [...new Set(release.media.flatMap(item => item.derivatives.map(d => `web/public${d.path}`)))];
const hashFiles = [...sourceFiles, ...releaseAssetPaths];
const gitHead = git(['rev-parse', 'HEAD']);
const gitBranch = git(['branch', '--show-current']);
const gitStatusBefore = git(['status', '--short', '--branch']).split(/\r?\n/);
const sourceHashesBefore = await hashSnapshot(hashFiles);
const localBuildIdBefore = (await fs.readFile(path.join(web, '.next/BUILD_ID'), 'utf8')).trim();
if (localBuildIdBefore !== expectedBuildId) throw new Error(`Expected build ${expectedBuildId}, found local ${localBuildIdBefore}`);
if (pointer.state !== 'published' || pointer.releaseId !== 'development-content-20261008-one' || release.releaseId !== pointer.releaseId) {
  throw new Error(`Unexpected public content pointer/release: ${JSON.stringify({state:pointer.state,pointerRelease:pointer.releaseId,releaseId:release.releaseId})}`);
}
if (release.media.length !== 3 || release.events.length !== 2) throw new Error('Unexpected displayed concept/report counts');
if (!release.events.some(e => e.id === 'foundation-owner-report-2026' && e.evidence === 'owner-reported')) throw new Error('Foundation owner report missing');
if (Object.values(sourceHashesBefore).some(v => v === null)) throw new Error('A declared input source/asset is missing; refusing incomplete hashes');

const metricsInit = `(() => {
  const m = { lcp: [], cls: [], clsTotal: 0 };
  Object.defineProperty(window, '__developmentDisplayMetrics', { value: m, configurable: false });
  try { new PerformanceObserver(list => { for (const e of list.getEntries()) m.lcp.push({startTime:e.startTime,size:e.size??null,tag:e.element?.tagName??null,id:e.element?.id??null}); }).observe({type:'largest-contentful-paint',buffered:true}); }
  catch (e) { m.lcpObserverError = String(e); }
  try { new PerformanceObserver(list => { for (const e of list.getEntries()) { const x={startTime:e.startTime,value:e.value,hadRecentInput:e.hadRecentInput}; m.cls.push(x); if (!e.hadRecentInput) m.clsTotal += e.value; } }).observe({type:'layout-shift',buffered:true}); }
  catch (e) { m.clsObserverError = String(e); }
})();`;

function diagnostics(page) {
  const d = { consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [] };
  page.on('console', msg => { if (msg.type() === 'error') d.consoleErrors.push({ text: msg.text() }); });
  page.on('pageerror', err => d.pageErrors.push({ text: String(err?.stack || err) }));
  page.on('requestfailed', req => d.failedRequests.push({ url: req.url(), method: req.method(), failure: req.failure()?.errorText || null }));
  page.on('response', res => { if (res.status() >= 400) d.httpErrors.push({ url: res.url(), status: res.status() }); });
  return d;
}
async function pageFacts(page) {
  return page.evaluate(() => {
    const root=document.documentElement, body=document.body, main=document.querySelector('main')||body;
    const h1=main.querySelector('h1')||document.querySelector('h1');
    const txt=body.innerText||'';
    const lang=(root.lang||'').slice(0,2);
    const developmentText=lang==='vi'?'Đang phát triển':'In development';
    const constructionText=lang==='vi'?'Không dùng để thi công':'Not for construction';
    const banner=[...document.querySelectorAll('header p')].find(p=>p.innerText.includes(developmentText)||p.innerText.includes(constructionText));
    const br= banner?.getBoundingClientRect();
    const viewportImgs=[...main.querySelectorAll('img')].filter(img=>{const r=img.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;});
    const overflow=[...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,role:el.getAttribute('role'),id:el.id||null,className:typeof el.className==='string'?el.className.slice(0,100):null,left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};}).filter(x=>x.width>0&&(x.right>innerWidth+1||x.left< -1||x.scrollWidth>x.clientWidth+2)).slice(0,8);
    const mainText=(main.innerText||'').trim();
    const latestUpdateLink=main.querySelector('section a[href*="/progress/"]');
    const imageStats=[...main.querySelectorAll('img')].map(img=>({alt:img.alt||null,srcPath:(()=>{try{return new URL(img.currentSrc||img.src,location.href).pathname}catch{return img.src}})(),complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,loading:img.loading}));
    return {
      route:location.pathname+location.search,title:document.title,language:lang,heading:h1?.innerText?.trim()||null,
      viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      pageTextLength:mainText.length,
      latestPublishedUpdate:latestUpdateLink?{title:latestUpdateLink.innerText.trim(),href:latestUpdateLink.getAttribute('href'),context:latestUpdateLink.closest('section')?.innerText?.trim()||null}:null,
      developmentBanner:{visible:Boolean(banner&&br&&br.width>0&&br.height>0),text:banner?.innerText?.trim()||null,includesDevelopment:txt.includes(developmentText),includesNotForConstruction:txt.includes(constructionText)},
      imageCount:main.querySelectorAll('img').length,images:imageStats,visibleImageCount:viewportImgs.length,
      document:{clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,scrollHeight:root.scrollHeight,horizontalOverflow:root.scrollWidth>root.clientWidth+1},
      body:{scrollWidth:body.scrollWidth,horizontalOverflow:body.scrollWidth>root.clientWidth+1},overflowElements:overflow,
      rootFontSize:getComputedStyle(root).fontSize,reducedMotionMatches:matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  });
}
async function settle(page) {
  await page.locator('main h1').first().waitFor({state:'visible',timeout:15000});
  await page.evaluate(() => document.fonts?.ready || Promise.resolve());
  await page.waitForTimeout(250);
}
async function runAxe(page) {
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  return {violations:axe.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary?.slice(0,350)||null}))})),passesCount:axe.passes.length,incompleteCount:axe.incomplete.length,incompleteRules:axe.incomplete.map(x=>x.id)};
}
const results={
  schemaVersion:1,startedAt:new Date().toISOString(),project:'Thạch Bi development-display desktop evidence (actual local production build)',
  source:{baseUrl,gitHead,gitBranch,gitStatusBefore,expectedBuildId,localBuildIdBefore,releaseId:release.releaseId,contentPointer: pointer,sourceHashesBefore,servedBuildProbe:null,sourceHashesAfter:null,changedFilesDuringCapture:null,hashesStableDuringCapture:null,localBuildIdAfter:null,buildIdStableDuringCapture:null},
  environment:{runtime:{nodePath:nodeBin,nodeVersion:process.version,playwrightVersion:require('playwright/package.json').version,axePlaywrightDeclared:'4.13.0'},os:{platform:os.platform(),release:os.release(),version:os.version(),arch:os.arch(),hardwareModel:execFileSync('sysctl',['-n','hw.model'],{encoding:'utf8'}).trim(),cpuModel:os.cpus()[0]?.model??null,logicalCpuCount:os.cpus().length,macOSProductVersion:execFileSync('sw_vers',['-productVersion'],{encoding:'utf8'}).trim()},browser:null,axeAvailable:true},
  contentCheck:{releaseId:release.releaseId,publishedAt:release.publishedAt,sourceRevision:release.sourceRevision,concepts:release.media.map(m=>({id:m.id,caption:m.caption,category:m.category,attribution:m.attribution,derivativeCount:m.derivatives.length})),events:release.events.map(e=>({id:e.id,slug:e.slug,title:e.title,evidence:e.evidence,evidenceRef:e.evidenceRef,occurredOn:e.occurredOn,reportedAsOf:e.reportedAsOf,linkedMediaCount:e.mediaIds.length}))},
  screenshots:[],pages:[],interactionChecks:[],performance:{profile:{downMbps:10,upMbps:1,rttMs:100,cdpDownloadBytesPerSecond:1250000,cdpUploadBytesPerSecond:125000,cacheDisabled:true,freshBrowserContextPerSample:true,serviceWorkers:'blocked',samples:3},samples:[],budgetSummary:null,fieldMetricCaveat:'Desktop lab observations only. No INP/field data or actual parish device acceptance is measured or claimed.'},captureErrors:[]
};
const browser=await chromium.launch({channel:'chrome',headless:false,args:['--no-default-browser-check','--disable-background-networking']});
results.environment.browser={name:'Google Chrome (Playwright channel chrome)',version:browser.version(),headed:true};
await fs.mkdir(path.join(out,'screenshots'),{recursive:true});
async function newPage({viewport={width:1440,height:900},locale='en-US',reducedMotion='no-preference'}={}) {
  const context=await browser.newContext({viewport,deviceScaleFactor:1,locale,reducedMotion,serviceWorkers:'block'});
  const page=await context.newPage();
  const diag=diagnostics(page);
  return {context,page,diag};
}
async function saveShot(page,file,meta) {
  const target=path.join(out,'screenshots',file);
  await page.screenshot({path:target,type:'png'});
  const buf=await fs.readFile(target);
  results.screenshots.push({file:`screenshots/${file}`,sha256:sha(buf),bytes:buf.byteLength,...meta});
}
async function visitRoute(route, {viewport={width:1440,height:900},locale=route.startsWith('/vi')?'vi-VN':'en-US', axe=true, screenshotName, state='initial viewport'}={}) {
  const {context,page,diag}=await newPage({viewport,locale});
  try {
    const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:30000});
    await settle(page);
    const facts=await pageFacts(page);
    const axeResult=axe?await runAxe(page):null;
    if(screenshotName) await saveShot(page,screenshotName,{route,viewport,state,status:response?.status()??null});
    return {route,status:response?.status()??null,title:facts.title,heading:facts.heading,facts,axe:axeResult,diagnostics:diag,context,page,response};
  } catch(error) {
    results.captureErrors.push({route,viewport,state,error:String(error),diagnostics:diag});
    await context.close();
    return null;
  }
}

try {
  const routes=[
    ['/vi','vi-home'],['/en','en-home'],['/vi/design','vi-design'],['/en/design','en-design'],
    ['/en/progress','en-progress'],['/en/progress/foundation-owner-report-2026','en-foundation-detail'],['/en/about-this-site','en-about']
  ];
  for(const [route,name] of routes) {
    const record=await visitRoute(route,{screenshotName:`${name}-1440x900.png`});
    if(record) {
      const compact={...record}; delete compact.context; delete compact.page; delete compact.response;
      results.pages.push(compact);
      await record.context.close();
    }
  }

  // Supplemental full-page view of the owner-reported foundation update.
  {
    const route='/en/progress/foundation-owner-report-2026';
    const {context,page,diag}=await newPage();
    try {
      const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:30000}); await settle(page);
      await saveShot(page,'en-foundation-detail-fullpage.png',{route,viewport:{width:1440,height:900},state:'full page',status:response?.status(),fullPage:true});
      results.interactionChecks.push({kind:'foundation-detail-full-page',route,status:response?.status()??null,diagnostics:diag});
    } catch(e){results.captureErrors.push({route,state:'fullPage',error:String(e),diagnostics:diag});} finally{await context.close();}
  }

  // Gallery at requested alternate viewport and first concept enlarged in the page dialog.
  {
    const route='/en/design', viewport={width:1280,height:800};
    const {context,page,diag}=await newPage({viewport});
    try {
      const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:30000}); await settle(page);
      const facts=await pageFacts(page);
      await saveShot(page,'en-design-1280x800.png',{route,viewport,state:'initial viewport',status:response?.status()??null});
      results.interactionChecks.push({kind:'gallery-1280x800',route,status:response?.status()??null,facts,diagnostics:diag});
    } catch(e){results.captureErrors.push({route,viewport,state:'1280x800',error:String(e),diagnostics:diag});} finally{await context.close();}
  }
  {
    const route='/en/design', viewport={width:1440,height:900};
    const {context,page,diag}=await newPage({viewport});
    try {
      const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:30000}); await settle(page);
      const opener=page.locator('main figure a[aria-haspopup="dialog"]').first();
      const firstConceptBefore=await opener.getAttribute('aria-label');
      await opener.click();
      const dialog=page.locator('main dialog[open]'); await dialog.waitFor({state:'visible',timeout:5000});
      await page.locator('main dialog[open] img').waitFor({state:'visible',timeout:8000});
      await page.waitForFunction(()=>{const img=document.querySelector('main dialog[open] img');return Boolean(img&&img.complete&&img.naturalWidth>0);},undefined,{timeout:8000}).catch(()=>{});
      const modalFacts=await page.evaluate(()=>{const d=document.querySelector('main dialog[open]');const img=d?.querySelector('img');return {open:Boolean(d?.open),title:d?.querySelector('h2')?.innerText?.trim()||null,alt:img?.alt||null,imageNaturalSize:img?{width:img.naturalWidth,height:img.naturalHeight}:null,closeButtonFocused:document.activeElement===d?.querySelector('button'),dialogRect:(()=>{const r=d?.getBoundingClientRect();return r?{x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}:null})()};});
      await saveShot(page,'en-design-first-concept-enlarged-1440x900.png',{route,viewport,state:'first concept dialog open',status:response?.status()??null});
      let modalAxe=null; try{modalAxe=await runAxe(page);}catch(e){modalAxe={error:String(e)};}
      results.interactionChecks.push({kind:'first-concept-enlarged',route,status:response?.status()??null,firstConceptAriaLabel:firstConceptBefore,modalFacts,axe:modalAxe,diagnostics:diag});
    } catch(e){results.captureErrors.push({route,state:'first concept dialog',error:String(e),diagnostics:diag});} finally{await context.close();}
  }

  // Keyboard focus, 200% CSS text scaling and reduced-motion preference on the gallery.
  {
    const route='/en/design'; const {context,page,diag}=await newPage();
    try {
      const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:30000}); await settle(page);
      const tabs=[];
      for(let i=0;i<7;i++) {
        await page.keyboard.press('Tab');
        tabs.push(await page.evaluate(()=>{const el=document.activeElement,r=el?.getBoundingClientRect(),s=el?getComputedStyle(el):null;return {tag:el?.tagName||null,label:(el?.getAttribute('aria-label')||el?.innerText||el?.textContent||'').trim().replace(/\s+/g,' ').slice(0,110),href:el instanceof HTMLAnchorElement?el.getAttribute('href'):null,focusVisible:Boolean(el?.matches(':focus-visible')),outlineStyle:s?.outlineStyle||null,outlineWidth:s?.outlineWidth||null,rect:r?{x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}:null};}));
        if(i===0) await saveShot(page,'en-design-keyboard-first-focus-1440x900.png',{route,viewport:{width:1440,height:900},state:'after first Tab',status:response?.status()??null});
      }
      results.interactionChecks.push({kind:'gallery-keyboard-tab-sequence',route,status:response?.status()??null,tabs,diagnostics:diag});
    }catch(e){results.captureErrors.push({route,state:'keyboard',error:String(e),diagnostics:diag});}finally{await context.close();}
  }
  {
    const route='/en/design'; const {context,page,diag}=await newPage();
    try {
      const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:30000}); await settle(page);
      const before=await page.evaluate(()=>getComputedStyle(document.documentElement).fontSize);
      await page.addStyleTag({content:'html { font-size: 200% !important; }'}); await page.waitForTimeout(200);
      const facts=await pageFacts(page);
      await saveShot(page,'en-design-css-text-200-percent-1440x900.png',{route,viewport:{width:1440,height:900},state:'CSS root font-size 200%; not native browser zoom',status:response?.status()??null});
      results.interactionChecks.push({kind:'gallery-text-resize',route,status:response?.status()??null,method:'Temporary injected CSS: html { font-size: 200% !important; }; not native Chrome zoom or text-only zoom.',beforeRootFontSize:before,afterRootFontSize:facts.rootFontSize,facts,diagnostics:diag});
    }catch(e){results.captureErrors.push({route,state:'200% CSS text',error:String(e),diagnostics:diag});}finally{await context.close();}
  }
  {
    const route='/en/design'; const {context,page,diag}=await newPage({reducedMotion:'reduce'});
    try {
      const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:30000}); await settle(page);
      const facts=await pageFacts(page); const animationCount=await page.evaluate(()=>document.getAnimations().length);
      await saveShot(page,'en-design-reduced-motion-1440x900.png',{route,viewport:{width:1440,height:900},state:'prefers-reduced-motion: reduce',status:response?.status()??null});
      results.interactionChecks.push({kind:'gallery-reduced-motion',route,status:response?.status()??null,facts,animationCount,diagnostics:diag});
    }catch(e){results.captureErrors.push({route,state:'reduced motion',error:String(e),diagnostics:diag});}finally{await context.close();}
  }

  // Served HTML/build check: save only its SHA and parsed build-id evidence, never the HTML body.
  {
    const {context,page,diag}=await newPage();
    try {
      const response=await page.goto(`${baseUrl}/en/design`,{waitUntil:'domcontentloaded',timeout:30000});
      const html=await page.content();
      const bValues=[...html.matchAll(/(?:\\?"b\\?"|\\?"buildId\\?")\s*:\s*\\?"([A-Za-z0-9_-]{10,})/g)].map(m=>m[1]);
      const servedBuildIdCandidates=[...new Set([...bValues,...[...html.matchAll(/\/_next\/static\/([^/]+)\//g)].map(m=>m[1])])];
      results.source.servedBuildProbe={route:'/en/design',status:response?.status()??null,servedHtmlSha256:sha(Buffer.from(html)),htmlBytes:Buffer.byteLength(html),expectedBuildIdFound:html.includes(expectedBuildId),parsedBuildIdCandidates:servedBuildIdCandidates,matchesExpected:servedBuildIdCandidates.includes(expectedBuildId)||html.includes(expectedBuildId),pageErrors:diag.pageErrors,httpErrors:diag.httpErrors};
    }catch(e){results.captureErrors.push({route:'/en/design',state:'served build probe',error:String(e),diagnostics:diag});}finally{await context.close();}
  }

  // Cold-cache lab profile: 3 independent contexts, initial gallery view only, no interaction.
  for(let sampleIndex=1;sampleIndex<=3;sampleIndex++) {
    const route='/en/design', viewport={width:1440,height:900};
    const {context,page,diag}=await newPage({viewport});
    await page.addInitScript(metricsInit);
    const cdp=await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
    await cdp.send('Network.setBypassServiceWorker',{bypass:true});
    await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:1250000,uploadThroughput:125000});
    const requests=new Map(), failures=[];
    cdp.on('Network.requestWillBeSent',e=>{
      const previous=requests.get(e.requestId);
      if(previous&&e.redirectResponse) previous.redirects=(previous.redirects||[]).concat([{status:e.redirectResponse.status,url:previous.url}]);
      const u=new URL(e.request.url);
      requests.set(e.requestId,{requestId:e.requestId,url:`${u.origin}${u.pathname}${u.search}`,method:e.request.method,resourceType:e.type,initiatorType:e.initiator?.type??null,status:null,mimeType:null,fromDiskCache:false,fromServiceWorker:false,loadingFinishedEncodedBytes:null,failed:null});
    });
    cdp.on('Network.responseReceived',e=>{const r=requests.get(e.requestId);if(r)Object.assign(r,{status:e.response.status,mimeType:e.response.mimeType,fromDiskCache:Boolean(e.response.fromDiskCache),fromServiceWorker:Boolean(e.response.fromServiceWorker),responseEncodedDataLength:e.response.encodedDataLength??null});});
    cdp.on('Network.loadingFinished',e=>{const r=requests.get(e.requestId);if(r)r.loadingFinishedEncodedBytes=e.encodedDataLength;});
    cdp.on('Network.loadingFailed',e=>{const r=requests.get(e.requestId);if(r)r.failed=e.errorText;failures.push({requestId:e.requestId,errorText:e.errorText,blockedReason:e.blockedReason||null});});
    const start=Date.now(); let status=null,navError=null;
    try {
      const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'load',timeout:45000}); status=response?.status()??null;
      await settle(page);
      await page.waitForFunction(()=>{const img=[...document.querySelectorAll('main img')].find(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0;});return !img||img.complete;},undefined,{timeout:12000}).catch(()=>{});
      await page.waitForTimeout(500);
    } catch(e){navError=String(e);}
    let metrics=null,facts=null;
    try {
      metrics=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0],m=window.__developmentDisplayMetrics||{};return {navigation:n?{responseStart:n.responseStart,domContentLoadedEventEnd:n.domContentLoadedEventEnd,loadEventEnd:n.loadEventEnd,transferSize:n.transferSize,encodedBodySize:n.encodedBodySize,decodedBodySize:n.decodedBodySize}:null,lcp:m.lcp||[],clsEntries:m.cls||[],clsTotal:m.clsTotal??null,observerErrors:{lcp:m.lcpObserverError||null,cls:m.clsObserverError||null}};});
      facts=await pageFacts(page);
    }catch(e){metrics={error:String(e)};}
    const raw=[...requests.values()];
    const transferred=raw.reduce((s,r)=>s+(r.loadingFinishedEncodedBytes||0),0);
    const scripts=raw.filter(r=>r.resourceType==='Script');
    const jsBytes=scripts.reduce((s,r)=>s+(r.loadingFinishedEncodedBytes||0),0);
    results.performance.samples.push({route,sampleIndex,viewport,networkProfile:{downMbps:10,upMbps:1,rttMs:100},freshContext:true,cacheDisabled:true,serviceWorkers:'blocked',status,navigationError:navError,settleWindowMs:Date.now()-start,metrics,facts,totalRequests:raw.length,encodedResponseBytesCdp:transferred,javascriptRequests:scripts.length,javascriptEncodedResponseBytesCdp:jsBytes,externalScriptUrls:scripts.map(r=>({url:r.url,bytes:r.loadingFinishedEncodedBytes,status:r.status})),serverOrSimulatorScripts:scripts.filter(r=>/simulator|bundle\.js/.test(r.url)),failedRequests:failures,diagnostics:diag,rawRequests:raw});
    await cdp.detach().catch(()=>{}); await context.close();
  }

  results.performance.budgetSummary={
    transferBudgetBytes:1500000,javascriptBudgetBytes:200*1024,
    samples:results.performance.samples.map(s=>({sampleIndex:s.sampleIndex,status:s.status,encodedResponseBytesCdp:s.encodedResponseBytesCdp,javascriptEncodedResponseBytesCdp:s.javascriptEncodedResponseBytesCdp,lcpLast:s.metrics?.lcp?.at(-1)||null,clsTotal:s.metrics?.clsTotal??null,passedTransferBudget:(s.encodedResponseBytesCdp??Infinity)<=1500000,passedJavascriptBudget:(s.javascriptEncodedResponseBytesCdp??Infinity)<=200*1024})),
    sampleRange:{transferBytes:results.performance.samples.length?{min:Math.min(...results.performance.samples.map(s=>s.encodedResponseBytesCdp)),max:Math.max(...results.performance.samples.map(s=>s.encodedResponseBytesCdp))}:null,javascriptBytes:results.performance.samples.length?{min:Math.min(...results.performance.samples.map(s=>s.javascriptEncodedResponseBytesCdp)),max:Math.max(...results.performance.samples.map(s=>s.javascriptEncodedResponseBytesCdp))}:null},
    measurementDefinition:'CDP Network.loadingFinished.encodedDataLength summed across completed initial document/resource requests before user interaction, with a 500 ms post-load settle window. JavaScript total counts external Script resource responses; inline JS/RSC embedded in HTML is not separately attributed. These are local lab response-byte measurements, not field transfer measurements.'
  };
} finally {
  await browser.close();
}

const sourceHashesAfter=await hashSnapshot(hashFiles);
const localBuildIdAfter=(await fs.readFile(path.join(web,'.next/BUILD_ID'),'utf8')).trim();
const changedFiles=hashFiles.filter(f=>sourceHashesBefore[f]!==sourceHashesAfter[f]);
results.source.sourceHashesAfter=sourceHashesAfter;
results.source.changedFilesDuringCapture=changedFiles;
results.source.hashesStableDuringCapture=changedFiles.length===0;
results.source.localBuildIdAfter=localBuildIdAfter;
results.source.buildIdStableDuringCapture=localBuildIdBefore===localBuildIdAfter;
results.source.gitStatusAfter=git(['status','--short','--branch']).split(/\r?\n/);
results.finishedAt=new Date().toISOString();
results.measurementNotes=[
  'All screenshots use headed desktop Google Chrome at deviceScaleFactor 1; no phone viewport/device testing was run.',
  'The 200% text capture injects CSS html { font-size: 200% !important; }; it is not native browser zoom or text-only zoom.',
  'Reduced motion is Playwright context emulation of prefers-reduced-motion: reduce.',
  'The content record contains three project AI concepts and two owner-reported events; owner reports are not independently verified and no site photographs accompany them.',
  'Performance is three cold-context local lab samples under CDP 10 Mbps down / 1 Mbps up / 100 ms RTT; no INP, field metric or parish hardware acceptance is inferred.',
  'A response-byte budget is reported separately from LCP/CLS; LCP/CLS values are lab observations from this one desktop and release.'
];
await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');
const screenshotManifest=results.screenshots.map(s=>({file:s.file,sha256:s.sha256,bytes:s.bytes,route:s.route,viewport:s.viewport,state:s.state,status:s.status??null,fullPage:s.fullPage??false}));
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({schemaVersion:1,project:results.project,buildId:results.source.expectedBuildId,releaseId:results.source.releaseId,screenshots:screenshotManifest,sourceHashCount:Object.keys(sourceHashesBefore).length,sourceHashStable:results.source.hashesStableDuringCapture&&results.source.buildIdStableDuringCapture},null,2)+'\n');
const budget=results.performance.budgetSummary;
const summary=`# Desktop development-site evidence\n\n- Build: \`${results.source.expectedBuildId}\` (disk ID stable: ${results.source.buildIdStableDuringCapture}; served HTML matched ID: ${results.source.servedBuildProbe?.matchesExpected??false}). Release: \`${release.releaseId}\`; branch/HEAD: \`${gitBranch}\` / \`${gitHead.slice(0,12)}\`.\n- Headed Chrome ${results.environment.browser.version} on ${results.environment.os.macOSProductVersion} (${results.environment.os.hardwareModel}, ${results.environment.os.cpuModel}). Viewport captures: ${results.screenshots.length}.\n- Public content observed: ${release.media.length} AI-generated concepts and ${release.events.length} owner-reported construction updates. Their evidence status is recorded as owner-reported, not independently verified.\n- In-development/not-for-construction banner: ${results.pages.filter(p=>p.facts.developmentBanner.visible&&p.facts.developmentBanner.includesDevelopment&&p.facts.developmentBanner.includesNotForConstruction).length}/${results.pages.length} main route captures had the locale-specific visible banner.\n- Axe route scans: ${results.pages.filter(p=>p.axe).length}, plus one enlarged-dialog scan; violations by route: ${results.pages.map(p=>`${p.route}=${p.axe?.violations?.length??'n/a'}`).join(', ')}. Console/page/network failures and overflow facts are preserved per route in results.json. Automated axe is not a WCAG conformance claim.\n- Homepage latest-publication tie-break: “${results.pages.find(p=>p.route==='/en')?.facts.latestPublishedUpdate?.title||'unknown'}” is selected because the two reports share their published/updated timestamp; the tie-break does not claim latest physical work.\n- Cold-cache gallery samples at 10 Mbps down, 1 Mbps up, 100 ms RTT: transferred encoded response bytes ${budget.sampleRange.transferBytes.min}–${budget.sampleRange.transferBytes.max}; external JavaScript encoded response bytes ${budget.sampleRange.javascriptBytes.min}–${budget.sampleRange.javascriptBytes.max}. Per-sample LCP/CLS and budget booleans are in results.json. These are lab observations, not field data.\n- Source hashes stable: ${results.source.hashesStableDuringCapture}; local build ID stable: ${results.source.buildIdStableDuringCapture}. Changed inputs: ${JSON.stringify(results.source.changedFilesDuringCapture)}.\n- The CSS 200% capture is explicitly an injected root-font-size change, not browser zoom. Reduced-motion and enlarged-first-concept screenshots are separate states.\n\nScreenshots and exact as-run script: this directory. Full build/source hashes, diagnostics, axe findings, individual requests, measurements and content provenance: \`results.json\`.\n`;
await fs.writeFile(path.join(out,'summary.md'),summary);
console.log(JSON.stringify({output:out,screenshots:results.screenshots.length,routes:results.pages.length,axeAvailable:results.environment.axeAvailable,performanceSamples:results.performance.samples.length,buildId:results.source.expectedBuildId,servedBuildMatches:results.source.servedBuildProbe?.matchesExpected,hashesStable:results.source.hashesStableDuringCapture,buildIdStable:results.source.buildIdStableDuringCapture,captureErrors:results.captureErrors.length,transferRange:budget.sampleRange.transferBytes,javascriptRange:budget.sampleRange.javascriptBytes}));
if(results.captureErrors.length||!results.source.hashesStableDuringCapture||!results.source.buildIdStableDuringCapture||!results.source.servedBuildProbe?.matchesExpected) process.exitCode=1;
