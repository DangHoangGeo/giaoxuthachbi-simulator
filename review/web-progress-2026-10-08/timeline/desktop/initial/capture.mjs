import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const repo = '/Users/danghoang/Desktop/giaoxuthachbi_work';
const web = path.join(repo, 'web');
const out = '/private/tmp/thachbi-web03-desktop';
const base = 'http://127.0.0.1:3130';
const expectedBuildId = (await fs.readFile(path.join(web, '.next/BUILD_ID'), 'utf8')).trim();
const require = createRequire(path.join(web, 'package.json'));
const { chromium } = require('playwright');
let AxeBuilder = null;
try {
  const mod = require('@axe-core/playwright');
  AxeBuilder = mod.default || mod;
} catch {}

const sourceFiles = [
  'web/package.json', 'web/package-lock.json', 'web/.node-version', 'web/.next/BUILD_ID',
  'web/content/current.json', 'web/content/release.json',
  'web/src/app/globals.css', 'web/src/app/[locale]/layout.tsx',
  'web/src/app/[locale]/(public)/progress/page.tsx',
  'web/src/app/[locale]/(public)/progress/[eventId]/page.tsx',
  'web/src/components/site-shell.tsx', 'web/src/components/event-dates.tsx',
  'web/src/components/freshness.tsx', 'web/src/lib/locales.ts', 'web/src/lib/progress.ts',
  'web/src/lib/contracts/public-history.ts', 'web/src/lib/server/public-content.ts',
  'web/src/lib/server/public-validation.ts'
];
const fileHash = async rel => createHash('sha256').update(await fs.readFile(path.join(repo, rel))).digest('hex');
const snapshot = async () => Object.fromEntries(await Promise.all(sourceFiles.map(async rel => [rel, await fileHash(rel).catch(() => null)])));
const git = args => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const sourceHashesBefore = await snapshot();
const gitHead = git(['rev-parse', 'HEAD']);
const gitBranch = git(['branch', '--show-current']);
const gitStatus = git(['status', '--short', '--branch']).split(/\r?\n/);
const buildIdBefore = (await fs.readFile(path.join(web, '.next/BUILD_ID'), 'utf8')).trim();

const result = {
  schemaVersion: 1,
  startedAt: new Date().toISOString(),
  project: 'web03 desktop progress-route evidence',
  source: { baseUrl: base, gitHead, gitBranch, gitStatus, expectedBuildId, buildIdBefore, sourceHashesBefore },
  environment: {
    node: process.version,
    platform: os.platform(), release: os.release(), arch: os.arch(), cpuModel: os.cpus()[0]?.model || null,
    logicalCpuCount: os.cpus().length,
    macOSProductVersion: (() => { try { return execFileSync('/usr/bin/sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim(); } catch { return null; } })(),
    axeAvailable: Boolean(AxeBuilder)
  },
  screenshots: [], desktopChecks: [], keyboardFocus: [], textResize: [], reducedMotion: [], noJavaScript: [],
  performance: { profile: { downMbps: 10, upMbps: 1, rttMs: 100, coldContexts: 3, cacheDisabled: true, serviceWorkers: 'blocked' }, samples: [] },
  captureErrors: []
};

const browser = await chromium.launch({ channel: 'chrome', headless: false });
result.environment.browser = { name: 'Google Chrome (Playwright channel chrome)', version: browser.version(), headed: true };

function diagnostics(page) {
  const d = { consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [] };
  page.on('console', m => { if (m.type() === 'error') d.consoleErrors.push(m.text()); });
  page.on('pageerror', e => d.pageErrors.push(String(e?.stack || e)));
  page.on('requestfailed', r => d.failedRequests.push({ url: r.url(), method: r.method(), failure: r.failure()?.errorText || null }));
  page.on('response', r => { if (r.status() >= 400) d.httpErrors.push({ url: r.url(), status: r.status() }); });
  return d;
}

async function facts(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const main = document.querySelector('main') || body;
    const heading = main.querySelector('h1') || document.querySelector('h1');
    return {
      path: location.pathname, title: document.title, language: root.lang || null,
      heading: heading?.innerText?.trim() || null, headingVisible: Boolean(heading && heading.getBoundingClientRect().width && heading.getBoundingClientRect().height),
      mainTextLength: (main.innerText || '').trim().length,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      document: { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, scrollHeight: root.scrollHeight, horizontalOverflow: root.scrollWidth > root.clientWidth },
      body: { scrollWidth: body.scrollWidth, horizontalOverflow: body.scrollWidth > root.clientWidth },
      rootFontSize: getComputedStyle(root).fontSize,
      imageCount: [...main.querySelectorAll('img')].length
    };
  });
}

async function newPage(options = {}) {
  const context = await browser.newContext({ viewport: options.viewport || { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: options.locale || 'en-US', reducedMotion: options.reducedMotion || 'no-preference', serviceWorkers: 'block', javaScriptEnabled: options.javaScriptEnabled ?? true });
  const page = await context.newPage();
  const d = diagnostics(page);
  return { context, page, d };
}

async function saveShot(page, file, metadata) {
  const full = path.join(out, 'screenshots', file);
  await page.screenshot({ path: full, type: 'png' });
  result.screenshots.push({ file: 'screenshots/' + file, ...metadata });
}

for (const locale of ['en', 'vi']) {
  const route = '/' + locale + '/progress';
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }]) {
    const { context, page, d } = await newPage({ viewport, locale: locale + '-US' });
    try {
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('main h1, main h2').first().waitFor({ state: 'visible', timeout: 12000 });
      await page.waitForTimeout(200);
      const f = await facts(page);
      const axe = AxeBuilder ? await new AxeBuilder({ page }).analyze() : null;
      result.desktopChecks.push({ route, viewport, status: response?.status() ?? null, facts: f, diagnostics: d, axe: axe ? { violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })), passesCount: axe.passes.length, incompleteCount: axe.incomplete.length } : null });
      const file = locale + '-progress-' + viewport.width + 'x' + viewport.height + '.png';
      await saveShot(page, file, { route, viewport, state: 'normal' });
    } catch (e) { result.captureErrors.push({ route, viewport, state: 'normal', error: String(e) }); }
    await context.close();
  }

  {
    const { context, page, d } = await newPage({ viewport: { width: 1440, height: 900 }, locale: locale + '-US' });
    try {
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(200);
      const tabSequence = [];
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        tabSequence.push(await page.evaluate(() => {
          const el = document.activeElement;
          const r = el?.getBoundingClientRect();
          const s = el ? getComputedStyle(el) : null;
          return { tag: el?.tagName || null, label: (el?.getAttribute('aria-label') || el?.innerText || el?.textContent || '').trim().slice(0, 120), href: el?.getAttribute('href') || null, focusVisible: Boolean(el?.matches(':focus-visible')), outlineStyle: s?.outlineStyle || null, outlineWidth: s?.outlineWidth || null, rect: r ? { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) } : null };
        }));
        if (i === 0) await saveShot(page, locale + '-progress-keyboard-focus-1440x900.png', { route, viewport: { width: 1440, height: 900 }, state: 'after first Tab' });
      }
      result.keyboardFocus.push({ route, status: response?.status() ?? null, firstTab: tabSequence[0], tabSequence, diagnostics: d });
    } catch (e) { result.captureErrors.push({ route, state: 'keyboardFocus', error: String(e) }); }
    await context.close();
  }
  {
    const { context, page, d } = await newPage({ viewport: { width: 1440, height: 900 }, locale: locale + '-US' });
    try {
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(200);
      const before = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      await page.waitForTimeout(150);
      const f = await facts(page);
      await saveShot(page, locale + '-progress-text-200-percent-css-1440x900.png', { route, viewport: { width: 1440, height: 900 }, state: 'root font-size set to 200% by CSS' });
      result.textResize.push({ route, status: response?.status() ?? null, method: 'Injected CSS html { font-size: 200% !important; }; not native browser zoom or text-only zoom.', beforeRootFontSize: before, afterRootFontSize: f.rootFontSize, facts: f, diagnostics: d });
    } catch (e) { result.captureErrors.push({ route, state: 'textResize', error: String(e) }); }
    await context.close();
  }
  {
    const { context, page, d } = await newPage({ viewport: { width: 1440, height: 900 }, locale: locale + '-US', reducedMotion: 'reduce' });
    try {
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(250);
      const preferenceMatched = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
      const documentAnimations = await page.evaluate(() => document.getAnimations().length);
      const f = await facts(page);
      await saveShot(page, locale + '-progress-reduced-motion-1440x900.png', { route, viewport: { width: 1440, height: 900 }, state: 'prefers-reduced-motion: reduce' });
      result.reducedMotion.push({ route, status: response?.status() ?? null, preferenceMatched, documentAnimations, facts: f, diagnostics: d });
    } catch (e) { result.captureErrors.push({ route, state: 'reducedMotion', error: String(e) }); }
    await context.close();
  }
  {
    const { context, page, d } = await newPage({ viewport: { width: 1440, height: 900 }, locale: locale + '-US', javaScriptEnabled: false });
    try {
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(300);
      const f = await facts(page);
      await saveShot(page, locale + '-progress-nojs-1440x900.png', { route, viewport: { width: 1440, height: 900 }, state: 'JavaScript disabled' });
      result.noJavaScript.push({ route, status: response?.status() ?? null, facts: f, readableServerRenderedContent: Boolean(f.headingVisible && f.mainTextLength > 0), diagnostics: d });
    } catch (e) { result.captureErrors.push({ route, state: 'noJavaScript', error: String(e) }); }
    await context.close();
  }
}

const initMetrics = "(() => { const m={lcp:[],cls:[],clsTotal:0}; window.__desktopMetrics=m; try { new PerformanceObserver(l=>l.getEntries().forEach(e=>m.lcp.push({startTime:e.startTime,size:e.size??null,tag:e.element?.tagName??null}))).observe({type:'largest-contentful-paint',buffered:true}); } catch(e) { m.lcpError=String(e); } try { new PerformanceObserver(l=>l.getEntries().forEach(e=>{m.cls.push({startTime:e.startTime,value:e.value,hadRecentInput:e.hadRecentInput}); if(!e.hadRecentInput)m.clsTotal+=e.value;})).observe({type:'layout-shift',buffered:true}); } catch(e) { m.clsError=String(e); } })();";
for (let sampleIndex = 1; sampleIndex <= 3; sampleIndex++) {
  const route = '/en/progress';
  const { context, page, d } = await newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  await page.addInitScript(initMetrics);
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  await client.send('Network.setBypassServiceWorker', { bypass: true });
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 1250000, uploadThroughput: 125000 });
  const requests = new Map(), failures = [];
  client.on('Network.requestWillBeSent', e => requests.set(e.requestId, { requestId: e.requestId, url: e.request.url, method: e.request.method, resourceType: e.type, requestTimestamp: e.timestamp }));
  client.on('Network.responseReceived', e => { const r = requests.get(e.requestId); if (r) Object.assign(r, { status: e.response.status, mimeType: e.response.mimeType, fromDiskCache: e.response.fromDiskCache, fromServiceWorker: e.response.fromServiceWorker }); });
  client.on('Network.dataReceived', e => { const r = requests.get(e.requestId); if (r) { r.encodedBodyBytes = (r.encodedBodyBytes || 0) + (e.encodedDataLength || 0); r.decodedBodyBytes = (r.decodedBodyBytes || 0) + (e.dataLength || 0); } });
  client.on('Network.loadingFinished', e => { const r = requests.get(e.requestId); if (r) r.loadingFinishedEncodedBytes = e.encodedDataLength; });
  client.on('Network.loadingFailed', e => failures.push({ requestId: e.requestId, errorText: e.errorText, blockedReason: e.blockedReason || null }));
  const started = Date.now();
  let status = null, navError = null;
  try {
    const response = await page.goto(base + route, { waitUntil: 'load', timeout: 30000 });
    status = response?.status() ?? null;
    await page.waitForTimeout(400);
  } catch (e) { navError = String(e); }
  let metrics = null;
  try {
    metrics = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      const m = window.__desktopMetrics || {};
      return { navigation: n ? { responseStart: n.responseStart, domContentLoadedEventEnd: n.domContentLoadedEventEnd, loadEventEnd: n.loadEventEnd, transferSize: n.transferSize, encodedBodySize: n.encodedBodySize, decodedBodySize: n.decodedBodySize } : null, lcp: m.lcp || [], cls: m.cls || [], clsTotal: m.clsTotal ?? null, observerErrors: { lcp: m.lcpError || null, cls: m.clsError || null } };
    });
  } catch (e) { metrics = { error: String(e) }; }
  const raw = [...requests.values()];
  result.performance.samples.push({
    route, sampleIndex, viewport: { width: 1440, height: 900 }, networkProfile: { downMbps: 10, upMbps: 1, rttMs: 100 },
    freshContext: true, cacheDisabled: true, serviceWorkers: 'blocked', status, navigationError: navError, wallMs: Date.now() - started,
    metrics, totalRequests: raw.length,
    loadingFinishedEncodedBytes: raw.reduce((s, r) => s + (r.loadingFinishedEncodedBytes || 0), 0),
    javascriptRequests: raw.filter(r => r.resourceType === 'Script').length,
    javascriptEncodedBytes: raw.filter(r => r.resourceType === 'Script').reduce((s, r) => s + (r.loadingFinishedEncodedBytes || 0), 0),
    requestFailures: failures, diagnostics: d, rawRequests: raw
  });
  await client.detach().catch(() => {});
  await context.close();
}

await browser.close();
const sourceHashesAfter = await snapshot();
const changedFiles = sourceFiles.filter(f => sourceHashesBefore[f] !== sourceHashesAfter[f]);
const buildIdAfter = (await fs.readFile(path.join(web, '.next/BUILD_ID'), 'utf8')).trim();
result.source.sourceHashesAfter = sourceHashesAfter;
result.source.changedFilesDuringCapture = changedFiles;
result.source.hashesStableDuringCapture = changedFiles.length === 0;
result.source.buildIdAfter = buildIdAfter;
result.source.buildIdStableDuringCapture = buildIdBefore === buildIdAfter;
result.finishedAt = new Date().toISOString();
result.measurementNotes = [
  'All screenshots were headed desktop Google Chrome; no phone/device profile was used.',
  '200% text is a temporary CSS root-font-size change, not native Chrome zoom.',
  'No-JavaScript checks record expected script failures from disabled JavaScript separately.',
  'Performance values are lab samples from one desktop and empty progress history; no INP/field performance is measured or inferred.'
];
await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ output: path.join(out, 'results.json'), screenshots: result.screenshots.length, desktopChecks: result.desktopChecks.length, performanceSamples: result.performance.samples.length, expectedBuildId, hashesStable: result.source.hashesStableDuringCapture && result.source.buildIdStableDuringCapture, captureErrors: result.captureErrors }));
if (result.captureErrors.length || changedFiles.length || buildIdBefore !== buildIdAfter) process.exitCode = 1;
