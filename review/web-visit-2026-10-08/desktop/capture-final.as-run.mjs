import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = '/Users/danghoang/Desktop/giaoxuthachbi_work';
const OUT = '/private/tmp/thachbi-visit-desktop-evidence/final';
const BASE = 'http://127.0.0.1:3132';
const require = createRequire(path.join(ROOT, 'web/package.json'));
const { chromium } = require('playwright');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const now = () => new Date().toISOString();
const result = {
  startedAt: now(), baseUrl: BASE, viewport: { width: 1440, height: 1000 },
  methodology: {
    desktopOnly: true, headedChrome: true, gpuEnabled: true,
    coldCache: 'fresh browser context, CDP Network.setCacheDisabled(true), service worker bypassed; encodedDataLength from CDP Network.loadingFinished',
    throttling: 'CDP: 10 Mbps downstream (1,250,000 B/s), 1 Mbps upstream (125,000 B/s), 100 ms RTT; low-bandwidth probe uses 1 Mbps downstream',
    frameSampling: 'requestAnimationFrame timestamps while headed tab remains foregrounded; viewpoint buttons selected at 0/15/30/45 seconds; target path lasts 60 seconds',
    soak: '10 minutes with repeated viewpoint changes and five full route exit/re-enter cycles; canvas count and JS heap sampled once per minute',
    textResize: 'Not performed; task asks normal desktop viewport and application-specific large-text behavior is not applicable to this 3D route.',
    fieldData: false,
  },
  manifest: {}, errors: [], screenshots: [], stages: [],
};
const log = async (stage, detail = {}) => {
  const item = { at: now(), stage, ...detail };
  result.stages.push(item);
  console.log(JSON.stringify(item));
  await fs.appendFile(path.join(OUT, 'progress.jsonl'), JSON.stringify(item) + '\n');
};
const hashFile = async (file) => {
  try { return sha(await fs.readFile(file)); } catch (e) { return `ERROR:${e.code || e.message}`; }
};
const sourcePaths = [
  'AGENTS.md', 'plan/phases/04-lightweight-visit.md',
  'web/package.json', 'web/package-lock.json', 'web/.next/BUILD_ID',
  'web/content/current.json', 'web/content/release.json', 'web/content/visit.json',
  'web/src/app/[locale]/(public)/visit/page.tsx', 'web/src/app/[locale]/(public)/design/page.tsx',
  'web/src/app/[locale]/(public)/page.tsx', 'web/src/app/[locale]/layout.tsx',
  'web/src/components/visit.tsx', 'web/src/components/site-shell.tsx',
  'web/src/lib/server/public-content.ts', 'web/src/lib/gallery.ts', 'web/src/lib/locales.ts',
  'web/src/lib/viewer/scene.ts', 'web/src/lib/viewer/atmosphere.ts',
  'web/src/app/globals.css', 'docs/web/publication-permission.md',
];
const sourceSnapshot = async () => {
  const map = {};
  for (const p of sourcePaths) map[p] = await hashFile(path.join(ROOT, p));
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'web/content/visit.json'), 'utf8'));
    const assetPath = path.join(ROOT, 'web/public', manifest.path.replace(/^\//, ''));
    map[manifest.path] = await hashFile(assetPath);
  } catch (e) { map.visitAsset = `ERROR:${e.message}`; }
  return map;
};
const gitInfo = () => {
  const run = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  return { head: run(['rev-parse', 'HEAD']), branch: run(['branch', '--show-current']), statusShort: run(['status', '--short']) };
};
const overflow = async (page) => page.evaluate(() => ({
  viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth,
  documentHeight: document.documentElement.scrollHeight,
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  bodyWidth: document.body.scrollWidth,
}));
const getBuildIdFromHtml = async (page, url) => {
  const response = await page.request.get(url);
  const html = await response.text();
  const candidates = [...html.matchAll(/(?:buildId|buildID|build_id)[^\w]{0,8}["']([A-Za-z0-9_-]{8,})["']/g)].map(m => m[1]);
  return { status: response.status(), htmlSha256: sha(Buffer.from(html)), buildIdCandidates: [...new Set(candidates)] };
};
const normalizeError = (e) => String(e?.message || e).slice(0, 1000);
const attachDiagnostics = (page, label) => {
  page.on('pageerror', e => result.errors.push({ kind: 'pageerror', label, message: normalizeError(e), at: now() }));
  page.on('console', m => { if (m.type() === 'error') result.errors.push({ kind: 'console', label, message: m.text().slice(0, 1000), at: now() }); });
  page.on('requestfailed', r => result.errors.push({ kind: 'requestfailed', label, url: r.url(), error: r.failure()?.errorText, at: now() }));
  page.on('response', r => { if (r.status() >= 400) result.errors.push({ kind: 'http', label, status: r.status(), url: r.url(), at: now() }); });
};
const setupNetwork = async (page, context, { cold = false, throttle = null } = {}) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  if (cold) {
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.setBypassServiceWorker', { bypass: true });
  }
  if (throttle) await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: throttle.latencyMs, downloadThroughput: throttle.downBps,
    uploadThroughput: throttle.upBps, connectionType: 'cellular3g',
  });
  const reqs = new Map();
  const done = [];
  cdp.on('Network.requestWillBeSent', e => reqs.set(e.requestId, {
    url: e.request.url, type: e.type, start: e.timestamp, wallTime: e.wallTime,
    method: e.request.method,
  }));
  cdp.on('Network.loadingFinished', e => {
    const info = reqs.get(e.requestId);
    if (info) done.push({ ...info, end: e.timestamp, encodedBytes: e.encodedDataLength });
  });
  cdp.on('Network.loadingFailed', e => {
    const info = reqs.get(e.requestId);
    if (info) done.push({ ...info, failed: true, error: e.errorText });
  });
  return { cdp, reqs, done };
};
const newBrowser = async () => chromium.launch({ channel: 'chrome', headless: false, args: ['--enable-gpu-rasterization'] });
const addShot = async (page, name, fullPage = false) => {
  const filepath = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage, animations: 'disabled' });
  result.screenshots.push({ name, path: filepath, fullPage, bytes: (await fs.stat(filepath)).size, sha256: await hashFile(filepath) });
  return filepath;
};
const readGpu = async (page) => page.evaluate(() => {
  const c = document.querySelector('canvas');
  if (!c) return null;
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) return { context: false };
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return { context: true, vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null,
    renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null,
    version: gl.getParameter(gl.VERSION), shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) };
});
const waitForControls = async (page, timeout = 90000) => {
  await page.getByRole('button', { name: 'Nave', exact: true }).waitFor({ state: 'visible', timeout });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Nave' && !b.disabled), null, { timeout });
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout });
};
const setDay = async (page, value) => {
  const select = page.locator('select:has(option[value="day"])').first();
  if (await select.count()) await select.selectOption(value);
  else {
    const maybe = page.getByLabel(/Atmosphere/i);
    if (await maybe.count()) await maybe.selectOption(value);
  }
};
const viewButton = (page, name) => page.getByRole('button', { name, exact: true });
const switchView = async (page, view) => {
  if (view === 'overhead-roof-hidden') {
    await viewButton(page, 'Overhead').click();
    const hide = page.getByRole('button', { name: /Hide roof/i });
    if (await hide.count() && await hide.isEnabled()) await hide.click();
  } else if (view === 'exterior') await viewButton(page, 'Exterior').click();
  else await viewButton(page, view === 'nave' ? 'Nave' : 'Sanctuary').click();
};
const summaryFrames = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a,b) => a-b);
  const pct = p => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
  return { samples: values.length, p50Ms: pct(.5), p95Ms: pct(.95), p99Ms: pct(.99), maxMs: sorted.at(-1),
    over33ms: values.filter(v => v > 33).length, over50ms: values.filter(v => v > 50).length };
};

let browser = null;
try {
await fs.writeFile(path.join(OUT, 'progress.jsonl'), '');
result.runtime = { node: process.version, platform: process.platform, arch: process.arch, os: os.type(), release: os.release(), hostname: os.hostname() };
result.gitBefore = gitInfo();
result.sourceHashesBefore = await sourceSnapshot();
try { result.manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'web/content/visit.json'), 'utf8')); } catch {}
result.environment = { browserVersion: null, serverPageBuildProbe: null, gpu: null };
result.buildIdContentAtStart = (await fs.readFile(path.join(ROOT,'web/.next/BUILD_ID'),'utf8')).trim();
await log('capture-start', { head: result.gitBefore.head, branch: result.gitBefore.branch, buildId: result.buildIdContentAtStart, buildIdFileSha256: result.sourceHashesBefore['web/.next/BUILD_ID'] });

browser = await newBrowser();
result.environment.browserVersion = browser.version();
const diagnostics = { staticPages: [], cold: [], interactive: null, framePath: null, soak: null, contextLoss: null, lowBandwidth: null };

// Static pages, full-page captures, diagnostics, overflow, and cold-cache initial-load accounting.
for (const [locale, route, name] of [['vi','/vi','vi-home'], ['vi','/vi/design','vi-design']]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  attachDiagnostics(page, name);
  const net = await setupNetwork(page, context, { cold: true });
  const response = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true, animations: 'disabled' });
  const shotPath = path.join(OUT, `${name}.png`);
  result.screenshots.push({ name, path: shotPath, fullPage: true, bytes: (await fs.stat(shotPath)).size, sha256: await hashFile(shotPath) });
  const modelRequestsBeforeEnter = [...net.reqs.values()].filter(r => /\/models\//.test(r.url));
  diagnostics.staticPages.push({ route, status: response?.status(), overflow: await overflow(page), screenshot: shotPath,
    canvasCount: await page.locator('canvas').count(), modelRequestsBeforeEnter: modelRequestsBeforeEnter.map(r => r.url),
    heading: await page.locator('h1').first().textContent().catch(() => null) });
  const js = net.done.filter(r => r.type === 'Script').reduce((n,r) => n + (r.encodedBytes || 0), 0);
  const total = net.done.reduce((n,r) => n + (r.encodedBytes || 0), 0);
  diagnostics.cold.push({ route, status: response?.status(), totalEncodedBytes: total, jsEncodedBytes: js,
    requestCount: net.done.length, modelRequestsBeforeEnter: modelRequestsBeforeEnter.length,
    resources: net.done.map(r => ({ url: r.url, type: r.type, encodedBytes: r.encodedBytes, failed: !!r.failed })) });
  if (route === '/vi/design') result.environment.serverPageBuildProbe = await getBuildIdFromHtml(page, BASE + route);
  await context.close();
  await log('static-page-done', { route, totalEncodedBytes: total, jsEncodedBytes: js, modelRequestsBeforeEnter: modelRequestsBeforeEnter.length });
}

// Explicit-entry 3D start, under 10 Mbps / 1 Mbps / 100 ms.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  attachDiagnostics(page, 'visit-interactive');
  const net = await setupNetwork(page, context, { cold: true, throttle: { downBps: 1250000, upBps: 125000, latencyMs: 100 } });
  await page.goto(BASE + '/en/visit', { waitUntil: 'networkidle', timeout: 60000 });
  const beforeEnter = { canvasCount: await page.locator('canvas').count(), modelRequests: [...net.reqs.values()].filter(r => /\/models\//.test(r.url)).map(r => r.url), overflow: await overflow(page) };
  await addShot(page, 'visit-before-enter');
  const clickStart = Date.now();
  const clickReqTime = performance.now();
  await page.getByRole('button', { name: 'Enter 3D', exact: true }).click();
  await waitForControls(page, 120000);
  const readyMs = Date.now() - clickStart;
  const postClick = net.done.filter(r => r.wallTime * 1000 >= clickStart);
  const modelRequests = postClick.filter(r => /\/models\//.test(r.url));
  const modelBytes = modelRequests.reduce((n,r) => n + (r.encodedBytes || 0), 0);
  const totalBytes = postClick.reduce((n,r) => n + (r.encodedBytes || 0), 0);
  diagnostics.interactive = { readyMs, beforeEnter, postClickEncodedBytes: totalBytes, modelEncodedBytes: modelBytes,
    modelRequests: modelRequests.map(r => ({ url: r.url, encodedBytes: r.encodedBytes, failed: !!r.failed })),
    allRequests: postClick.map(r => ({ url:r.url,type:r.type,encodedBytes:r.encodedBytes,failed:!!r.failed })),
    meets10MBCompressedModelBudget: modelBytes <= 10_000_000, meets12sInteractiveBudget: readyMs <= 12000,
    overflow: await overflow(page), gpu: await readGpu(page) };
  result.environment.gpu = diagnostics.interactive.gpu;
  await log('visit-interactive-ready', { readyMs, modelBytes, totalBytes, gpu: diagnostics.interactive.gpu });
  await setDay(page, 'day'); await switchView(page, 'exterior'); await addShot(page, 'exterior-day');
  await setDay(page, 'night'); await switchView(page, 'exterior'); await addShot(page, 'exterior-night');
  await setDay(page, 'day'); await switchView(page, 'nave'); await addShot(page, 'nave-day');
  await setDay(page, 'night'); await switchView(page, 'nave'); await addShot(page, 'nave-night');
  await setDay(page, 'day'); await switchView(page, 'sanctuary'); await addShot(page, 'sanctuary-day');
  await switchView(page, 'overhead-roof-hidden'); await addShot(page, 'overhead-roof-hidden');
  diagnostics.interactive.afterScreenshots = { overflow: await overflow(page), canvasCount: await page.locator('canvas').count(), gpu: await readGpu(page) };

  // Fixed 60-second RAF sample, with one viewpoint every 15 seconds.
  await switchView(page, 'exterior');
  await page.evaluate(() => { window.__visitFrameTimes = []; window.__visitLastFrame = null; window.__visitFrameStart = performance.now();
    const tick = t => { if (window.__visitLastFrame !== null) window.__visitFrameTimes.push(t - window.__visitLastFrame); window.__visitLastFrame = t; requestAnimationFrame(tick); };
    requestAnimationFrame(tick); });
  const frameStart = Date.now();
  const viewSequence = ['exterior','nave','sanctuary','overhead-roof-hidden'];
  for (let i = 0; i < 4; i++) {
    const until = frameStart + i * 15000;
    if (Date.now() < until) await page.waitForTimeout(until - Date.now());
    await switchView(page, viewSequence[i]);
  }
  if (Date.now() < frameStart + 60000) await page.waitForTimeout(frameStart + 60000 - Date.now());
  const intervals = await page.evaluate(() => window.__visitFrameTimes || []);
  diagnostics.framePath = { durationMs: Date.now() - frameStart, views: viewSequence, intervals: summaryFrames(intervals), rawIntervalsMs: intervals };
  await log('frame-path-done', diagnostics.framePath.intervals);

  // Ten-minute route/component soak. Log progress each minute; reload route in/out five times.
  const soakStart = Date.now();
  const heap = [];
  for (let minute = 0; minute <= 10; minute++) {
    if (minute > 0) {
      const target = soakStart + minute * 60000;
      if (Date.now() < target) await page.waitForTimeout(target - Date.now());
      if ([1,3,5,7,9].includes(minute)) {
        await page.goto(BASE + '/en', { waitUntil: 'domcontentloaded', timeout: 60000 });
        const gone = await page.locator('canvas').count();
        await page.goto(BASE + '/en/visit', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.getByRole('button', { name: 'Enter 3D', exact: true }).click();
        await waitForControls(page, 120000);
        diagnostics.soak = diagnostics.soak || { routeCycles: [] };
        diagnostics.soak.routeCycles.push({ cycle: diagnostics.soak.routeCycles.length + 1, canvasCountAfterExit: gone,
          canvasCountAfterReenter: await page.locator('canvas').count(), readyAt: now() });
      } else {
        await switchView(page, viewSequence[(minute % viewSequence.length)]);
      }
    }
    const item = await page.evaluate(() => ({ canvasCount: document.querySelectorAll('canvas').length,
      heapUsedBytes: performance.memory?.usedJSHeapSize ?? null, heapTotalBytes: performance.memory?.totalJSHeapSize ?? null,
      documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }));
    item.minute = minute; item.elapsedMs = Date.now() - soakStart; item.at = now(); heap.push(item);
    await log('soak-minute', item);
  }
  diagnostics.soak = { ...(diagnostics.soak || {}), durationMs: Date.now() - soakStart, samples: heap,
    canvasCounts: [...new Set(heap.map(x => x.canvasCount))], heapFirstBytes: heap.find(x => x.heapUsedBytes)?.heapUsedBytes ?? null,
    heapLastBytes: [...heap].reverse().find(x => x.heapUsedBytes)?.heapUsedBytes ?? null };

  // Context-loss and retry, only if the browser exposes the extension.
  const ctxAvail = await page.evaluate(() => {
    const c = document.querySelector('canvas'); const gl = c?.getContext('webgl2') || c?.getContext('webgl');
    return !!gl?.getExtension('WEBGL_lose_context');
  });
  diagnostics.contextLoss = { extensionAvailable: ctxAvail };
  if (ctxAvail) {
    await page.evaluate(() => { const c=document.querySelector('canvas'); const gl=c?.getContext('webgl2')||c?.getContext('webgl'); gl?.getExtension('WEBGL_lose_context')?.loseContext(); });
    await page.waitForTimeout(1500);
    diagnostics.contextLoss.retryVisible = await page.getByRole('button', { name: 'Retry', exact: true }).isVisible().catch(() => false);
    if (diagnostics.contextLoss.retryVisible) {
      await page.getByRole('button', { name: 'Retry', exact: true }).click();
      await waitForControls(page, 120000);
      diagnostics.contextLoss.retrySucceeded = true;
    } else diagnostics.contextLoss.retrySucceeded = false;
  }
  diagnostics.interactive.finalErrors = result.errors.filter(e => e.label === 'visit-interactive');
  await log('interactive-finished', { soakDurationMs: diagnostics.soak.durationMs, canvasCounts: diagnostics.soak.canvasCounts, contextLoss: diagnostics.contextLoss });
  await context.close();
}

// 1 Mbps low-bandwidth cancellation, then static gallery availability.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage(); attachDiagnostics(page, 'low-bandwidth');
  const net = await setupNetwork(page, context, { cold: true, throttle: { downBps: 125000, upBps: 125000, latencyMs: 100 } });
  await page.goto(BASE + '/en/visit', { waitUntil: 'networkidle', timeout: 90000 });
  const start = Date.now();
  await page.getByRole('button', { name: 'Enter 3D', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  const cancel = page.getByRole('button', { name: 'Cancel', exact: true });
  diagnostics.lowBandwidth = { cancelShown: await cancel.isVisible().catch(() => false), elapsedBeforeCancelMs: Date.now() - start };
  if (await cancel.isVisible().catch(() => false)) await cancel.click();
  diagnostics.lowBandwidth.canvasAfterCancel = await page.locator('canvas').count();
  const galleryLink = page.getByRole('link', { name: /Browse the design images/i });
  diagnostics.lowBandwidth.galleryLinkAvailable = await galleryLink.isVisible().catch(() => false);
  await galleryLink.click();
  diagnostics.lowBandwidth.galleryUrl = page.url();
  diagnostics.lowBandwidth.galleryHeading = await page.locator('h1').first().textContent().catch(() => null);
  diagnostics.lowBandwidth.galleryStatus = await page.evaluate(async () => (await fetch(location.href)).status);
  diagnostics.lowBandwidth.modelRequests = [...net.reqs.values()].filter(r => /\/models\//.test(r.url)).map(r => r.url);
  diagnostics.lowBandwidth.modelFinishedBytes = net.done.filter(r => /\/models\//.test(r.url)).reduce((n,r)=>n+(r.encodedBytes||0),0);
  await addShot(page, 'low-bandwidth-gallery-fallback', true);
  await context.close();
}

result.diagnostics = diagnostics;
result.sourceHashesAfter = await sourceSnapshot();
result.sourceHashesStable = JSON.stringify(result.sourceHashesBefore) === JSON.stringify(result.sourceHashesAfter);
result.gitAfter = gitInfo();
result.finishedAt = now();
result.durationMs = Date.parse(result.finishedAt) - Date.parse(result.startedAt);
result.errors = result.errors;
await fs.writeFile(path.join(OUT, 'results.json'), JSON.stringify(result, null, 2) + '\n');
await fs.writeFile(path.join(OUT, 'summary.md'), `# Desktop visit evidence\n\n- Run: ${result.startedAt} to ${result.finishedAt}\n- Branch/HEAD: \`${result.gitBefore.branch}\` / \`${result.gitBefore.head}\`\n- Build ID: \`${result.buildIdContentAtStart}\` (file SHA-256: \`${result.sourceHashesBefore['web/.next/BUILD_ID']}\`)\n- Chrome: ${result.environment.browserVersion}; ${result.runtime.os} ${result.runtime.release}; ${result.runtime.arch}\n- GPU: \`${JSON.stringify(result.environment.gpu)}\`\n- Cold initial requests: ${diagnostics.cold.map(x=>`${x.route}: ${x.totalEncodedBytes} B total, ${x.jsEncodedBytes} B JS, ${x.modelRequestsBeforeEnter} model requests before Enter`).join('; ')}\n- Explicit Enter: ${diagnostics.interactive?.readyMs} ms; model ${diagnostics.interactive?.modelEncodedBytes} B, total ${diagnostics.interactive?.postClickEncodedBytes} B. Criteria were 12 s and 10,000,000 B; failed criteria are reported as measured.\n- Frame path: ${JSON.stringify(diagnostics.framePath?.intervals)}\n- Ten-minute route soak: ${diagnostics.soak?.durationMs} ms; canvas counts ${JSON.stringify(diagnostics.soak?.canvasCounts)}; heap ${diagnostics.soak?.heapFirstBytes} → ${diagnostics.soak?.heapLastBytes} B.\n- Context loss/retry: ${JSON.stringify(diagnostics.contextLoss)}\n- 1 Mbps fallback: ${JSON.stringify(diagnostics.lowBandwidth)}\n- Horizontal overflow: ${JSON.stringify({visit: diagnostics.interactive?.overflow, gallery: diagnostics.staticPages?.map(x=>({route:x.route,overflow:x.overflow}))})}\n- Browser/runtime errors: ${result.errors.length}\n- Source hashes stable: ${result.sourceHashesStable}\n\nThis is headed desktop-browser evidence for the preview build only. It is not parish-device acceptance or field performance. LCP/CLS/INP field data were not measured.\n`);
await fs.writeFile(path.join(OUT, 'manifest.sha256'), result.screenshots.map(s=>`${s.sha256}  ${path.basename(s.path)}`).join('\n')+'\n');
console.log(JSON.stringify({done:true, durationMs:result.durationMs, errors:result.errors.length, sourceHashesStable:result.sourceHashesStable, output:OUT}));
await browser.close();
} catch (error) {
  result.fatalError = normalizeError(error);
  result.finishedAt = now();
  try { result.sourceHashesAfter = await sourceSnapshot(); result.sourceHashesStable = JSON.stringify(result.sourceHashesBefore) === JSON.stringify(result.sourceHashesAfter); } catch {}
  try { await fs.writeFile(path.join(OUT, 'results.partial.json'), JSON.stringify(result, null, 2) + '\n'); } catch {}
  console.error('CAPTURE FATAL', result.fatalError);
  throw error;
} finally {
  if (browser) await browser.close().catch(() => {});
}
