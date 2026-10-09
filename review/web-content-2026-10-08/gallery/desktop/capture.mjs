import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const repo = '/Users/danghoang/Desktop/giaoxuthachbi_work';
const web = path.join(repo, 'web');
const out = path.join(repo, 'review/web-content-2026-10-08/gallery/desktop');
const baseUrl = 'http://127.0.0.1:3130';
const expectedBuildId = '9MolEJEIEN4WJpmEQVAoD';
const nodeBin = '/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin/node';
const require = createRequire(path.join(web, 'package.json'));
const { chromium } = require('playwright');
let AxeBuilder = null;
try {
  const axeModule = require('@axe-core/playwright');
  AxeBuilder = axeModule.default || axeModule;
} catch {}

const sourceFiles = [
  'web/package.json', 'web/package-lock.json', 'web/.node-version', 'web/.next/BUILD_ID',
  'web/content/current.json', 'web/content/release.json',
  'web/src/app/[locale]/layout.tsx', 'web/src/app/[locale]/(public)/page.tsx',
  'web/src/app/[locale]/(public)/design/page.tsx', 'web/src/app/[locale]/(public)/about-this-site/page.tsx',
  'web/src/components/site-shell.tsx', 'web/src/components/gallery-card.tsx', 'web/src/app/globals.css',
  'web/src/lib/gallery.ts', 'web/src/lib/locales.ts', 'web/src/lib/server/public-content.ts',
  'web/src/lib/server/public-validation.ts', 'web/src/lib/contracts/public-content.ts', 'web/src/lib/contracts/common.ts'
];
const digestFile = async (rel) => createHash('sha256').update(await fs.readFile(path.join(repo, rel))).digest('hex');
const snapshotHashes = async () => {
  const result = {};
  for (const rel of sourceFiles) {
    try { result[rel] = await digestFile(rel); } catch { result[rel] = null; }
  }
  return result;
};
const gitHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
const gitStatus = execFileSync('git', ['status', '--short', '--branch'], { cwd: repo, encoding: 'utf8' }).trim().split(/\r?\n/);
const sourceHashesBefore = await snapshotHashes();
const localBuildId = (await fs.readFile(path.join(web, '.next/BUILD_ID'), 'utf8')).trim();
if (localBuildId !== expectedBuildId) {
  throw new Error(`Unexpected local build ID: ${localBuildId}; expected ${expectedBuildId}`);
}

const metricsInit = `(() => {
  const m = { lcp: [], cls: [], clsTotal: 0 };
  Object.defineProperty(window, '__galleryLabMetrics', { value: m, configurable: false });
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        m.lcp.push({ startTime: e.startTime, size: e.size ?? null, tag: e.element?.tagName ?? null, id: e.element?.id ?? null });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) { m.lcpObserverError = String(e); }
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        const sample = { startTime: e.startTime, value: e.value, hadRecentInput: e.hadRecentInput };
        m.cls.push(sample);
        if (!e.hadRecentInput) m.clsTotal += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) { m.clsObserverError = String(e); }
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
  return await page.evaluate(() => {
    const h1 = document.querySelector('main h1, h1');
    const main = document.querySelector('main') || document.body;
    const root = document.documentElement;
    const body = document.body;
    const rect = h1?.getBoundingClientRect();
    return {
      path: location.pathname,
      title: document.title,
      heading: h1?.textContent?.trim() || null,
      headingVisible: Boolean(h1 && rect && rect.width > 0 && rect.height > 0),
      mainTextLength: (main.innerText || '').trim().length,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      document: { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, scrollHeight: root.scrollHeight, horizontalOverflow: root.scrollWidth > root.clientWidth + 1 },
      body: { scrollWidth: body.scrollWidth, horizontalOverflow: body.scrollWidth > root.clientWidth + 1 },
      rootFontSize: getComputedStyle(root).fontSize,
      reducedMotionMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationCount: document.getAnimations().length
    };
  });
}

async function go(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(250);
  return { status: response?.status() ?? null, url: response?.url() ?? null, facts: await pageFacts(page) };
}

const results = {
  schemaVersion: 1,
  captureStartedAt: new Date().toISOString(),
  project: 'Thạch Bi web phase 02 desktop gallery, real unpublished routes',
  source: { baseUrl, branch: 'web/02-homepage', gitHead, gitStatus, expectedBuildId, localBuildId, sourceHashesBefore },
  environment: {
    runtime: { nodePath: nodeBin, nodeVersion: process.version, npmVersion: execFileSync('/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin/npm', ['--version'], { cwd: web, encoding: 'utf8' }).trim() },
    os: { platform: os.platform(), release: os.release(), version: os.version(), arch: os.arch(), hardwareModel: execFileSync('sysctl', ['-n', 'hw.model'], { encoding: 'utf8' }).trim(), cpuModel: os.cpus()[0]?.model ?? null, logicalCpuCount: os.cpus().length, macOSProductVersion: execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim() },
    browser: null,
    axeAvailable: Boolean(AxeBuilder),
    contentState: { pointerState: JSON.parse(await fs.readFile(path.join(web, 'content/current.json'), 'utf8')).state, releaseIsNull: JSON.parse(await fs.readFile(path.join(web, 'content/release.json'), 'utf8')) === null, publicDirectoryExists: await fs.access(path.join(web, 'public')).then(() => true, () => false) }
  },
  screenshots: [],
  desktopChecks: [],
  keyboardFocus: [],
  textResize: [],
  reducedMotion: [],
  performance: { profile: { downMbps: 10, upMbps: 1, rttMs: 100, cdpDownBytesPerSecond: 1250000, cdpUpBytesPerSecond: 125000, cacheDisabled: true, newContextPerSample: true, serviceWorkers: 'blocked' }, samples: [], oneMbpsDegradedReadableCheck: null, fieldMetricCaveat: 'These are lab measurements on one desktop and empty unpublished pages. No INP/field metric or real-photo budget/acceptance is claimed.' },
  stability: null
};

await fs.mkdir(path.join(out, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--no-default-browser-check', '--disable-background-networking'] });
results.environment.browser = { name: 'Google Chrome (Playwright channel chrome)', version: browser.version(), headed: true };

// Verify which production build the served HTML references when the build ID is present.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const d = diagnostics(page);
  const nav = await go(page, '/en/design');
  const html = await page.content();
  const ids = [...html.matchAll(/\/_next\/static\/([^/]+)\//g)].map(m => m[1]);
  results.source.servedBuildIdCandidates = [...new Set(ids)];
  results.source.buildIdVerifiedFromLocalNextBuild = localBuildId === expectedBuildId;
  results.source.serverProbe = { status: nav.status, route: nav.facts.path, pageErrors: d.pageErrors, httpErrors: d.httpErrors };
  await context.close();
}

const routes = ['/en/design', '/vi/design'];
const viewports = [{ width: 1440, height: 900 }, { width: 1280, height: 800 }];
for (const route of routes) {
  const locale = route.slice(1, 3);
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: locale === 'vi' ? 'vi-VN' : 'en-US', reducedMotion: 'no-preference', serviceWorkers: 'block' });
    const page = await context.newPage();
    const d = diagnostics(page);
    let nav;
    try {
      nav = await go(page, route);
      const name = `${locale}-design-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({ path: path.join(out, 'screenshots', name), type: 'png' });
      results.screenshots.push({ file: `screenshots/${name}`, route, viewport, status: nav.status });
      const record = { route, viewport, status: nav.status, facts: nav.facts, diagnostics: d, axe: null };
      if (AxeBuilder) {
        try {
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
          record.axe = { violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary?.slice(0, 300) ?? null })) })), incompleteCount: axe.incomplete.length, passesCount: axe.passes.length };
        } catch (e) { record.axe = { error: String(e) }; }
      }
      results.desktopChecks.push(record);
    } catch (e) {
      results.desktopChecks.push({ route, viewport, error: String(e), diagnostics: d });
    } finally { await context.close(); }
  }
}

// Keyboard focus sequence and a representative focused screenshot on each locale route.
for (const route of routes) {
  const locale = route.slice(1, 3);
  const viewport = { width: 1440, height: 900 };
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: locale === 'vi' ? 'vi-VN' : 'en-US', reducedMotion: 'no-preference', serviceWorkers: 'block' });
  const page = await context.newPage();
  const d = diagnostics(page);
  try {
    const nav = await go(page, route);
    const tabs = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      tabs.push(await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, role: el.getAttribute('role'), accessibleLabel: el.getAttribute('aria-label') || el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100) || null, href: el instanceof HTMLAnchorElement ? el.getAttribute('href') : null, focusVisible: el.matches(':focus-visible'), outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor, boxShadow: s.boxShadow, visibleRect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }, viewportVisible: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth };
      }));
      if (i === 0) {
        const name = `${locale}-design-keyboard-focus-1440x900.png`;
        await page.screenshot({ path: path.join(out, 'screenshots', name), type: 'png' });
        results.screenshots.push({ file: `screenshots/${name}`, route, viewport, state: 'after first Tab' });
      }
    }
    results.keyboardFocus.push({ route, viewport, status: nav.status, firstTabFocused: tabs[0], tabSequence: tabs, diagnostics: d });
  } catch (e) { results.keyboardFocus.push({ route, viewport, error: String(e), diagnostics: d }); }
  finally { await context.close(); }
}

// Desktop 200% text resize: set the document root's default font size from its computed baseline to 200%.
for (const route of routes) {
  const locale = route.slice(1, 3);
  const viewport = { width: 1440, height: 900 };
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: locale === 'vi' ? 'vi-VN' : 'en-US', serviceWorkers: 'block' });
  const page = await context.newPage();
  const d = diagnostics(page);
  try {
    const nav = await go(page, route);
    const before = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.waitForTimeout(150);
    const facts = await pageFacts(page);
    const name = `${locale}-design-text-200-percent-1440x900.png`;
    await page.screenshot({ path: path.join(out, 'screenshots', name), type: 'png' });
    results.screenshots.push({ file: `screenshots/${name}`, route, viewport, state: 'root font-size set to 200%' });
    results.textResize.push({ route, viewport, status: nav.status, method: 'Injected temporary CSS `html { font-size: 200% !important; }` after load; root computed font size is recorded before/after. This scales rem-based type and spacing, not a native Chrome UI zoom setting.', beforeRootFontSize: before, after: facts.rootFontSize, facts, diagnostics: d });
  } catch (e) { results.textResize.push({ route, viewport, error: String(e), diagnostics: d }); }
  finally { await context.close(); }
}

// Reduced-motion media preference on both locale routes.
for (const route of routes) {
  const locale = route.slice(1, 3);
  const viewport = { width: 1440, height: 900 };
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: locale === 'vi' ? 'vi-VN' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  const d = diagnostics(page);
  try {
    const nav = await go(page, route);
    const facts = await pageFacts(page);
    const name = `${locale}-design-reduced-motion-1440x900.png`;
    await page.screenshot({ path: path.join(out, 'screenshots', name), type: 'png' });
    results.screenshots.push({ file: `screenshots/${name}`, route, viewport, state: 'prefers-reduced-motion: reduce' });
    results.reducedMotion.push({ route, viewport, status: nav.status, preferenceMatched: facts.reducedMotionMatches, documentAnimations: facts.animationCount, facts, diagnostics: d });
  } catch (e) { results.reducedMotion.push({ route, viewport, error: String(e), diagnostics: d }); }
  finally { await context.close(); }
}

function collectCdp(client) {
  const requests = new Map();
  const failures = [];
  client.on('Network.requestWillBeSent', e => {
    const u = new URL(e.request.url);
    requests.set(e.requestId, { requestId: e.requestId, url: `${u.origin}${u.pathname}${u.search}`, method: e.request.method, resourceType: e.type, initiatorType: e.initiator?.type ?? null, requestTimestamp: e.timestamp, responseStatus: null, mimeType: null, encodedBodyBytes: 0, decodedBodyBytes: 0, loadingFinishedEncodedBytes: null, fromDiskCache: false, fromServiceWorker: false, failed: null });
  });
  client.on('Network.responseReceived', e => {
    const r = requests.get(e.requestId);
    if (!r) return;
    r.responseStatus = e.response.status;
    r.mimeType = e.response.mimeType;
    r.fromDiskCache = Boolean(e.response.fromDiskCache);
    r.fromServiceWorker = Boolean(e.response.fromServiceWorker);
    r.responseEncodedDataLength = e.response.encodedDataLength ?? null;
  });
  client.on('Network.dataReceived', e => {
    const r = requests.get(e.requestId);
    if (!r) return;
    r.encodedBodyBytes += e.encodedDataLength || 0;
    r.decodedBodyBytes += e.dataLength || 0;
  });
  client.on('Network.loadingFinished', e => {
    const r = requests.get(e.requestId);
    if (r) { r.loadingFinishedEncodedBytes = e.encodedDataLength; r.finishTimestamp = e.timestamp; }
  });
  client.on('Network.loadingFailed', e => {
    const r = requests.get(e.requestId);
    const item = { requestId: e.requestId, errorText: e.errorText, canceled: Boolean(e.canceled), blockedReason: e.blockedReason ?? null };
    failures.push(item);
    if (r) r.failed = item;
  });
  return { requests, failures };
}

const networkProfile = { downMbps: 10, upMbps: 1, rttMs: 100, cdpDownBytesPerSecond: 1250000, cdpUpBytesPerSecond: 125000 };
let sampleIndex = 0;
for (const route of ['/en', '/en/design']) {
  for (let run = 1; run <= 5; run++) {
    sampleIndex++;
    const viewport = { width: 1440, height: 900 };
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'en-US', reducedMotion: 'no-preference', serviceWorkers: 'block' });
    const page = await context.newPage();
    const d = diagnostics(page);
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Network.setBypassServiceWorker', { bypass: true });
    await client.send('Network.emulateNetworkConditions', { offline: false, latency: networkProfile.rttMs, downloadThroughput: networkProfile.cdpDownBytesPerSecond, uploadThroughput: networkProfile.cdpUpBytesPerSecond });
    const net = collectCdp(client);
    await context.addInitScript({ content: metricsInit });
    const started = Date.now();
    let nav = null;
    let navigationError = null;
    try {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 45000 });
      nav = { status: response?.status() ?? null, url: response?.url() ?? null };
      await page.waitForTimeout(1000);
    } catch (e) { navigationError = String(e); }
    const wallMs = Date.now() - started;
    let webMetrics = null;
    let facts = null;
    try {
      webMetrics = await page.evaluate(() => {
        const n = performance.getEntriesByType('navigation')[0];
        const fcp = performance.getEntriesByName('first-contentful-paint').map(x => x.startTime);
        const m = window.__galleryLabMetrics || { lcp: [], cls: [], clsTotal: null };
        return { navigation: n ? { type: n.type, domContentLoadedEventEnd: n.domContentLoadedEventEnd, loadEventEnd: n.loadEventEnd, responseStart: n.responseStart, transferSize: n.transferSize, encodedBodySize: n.encodedBodySize, decodedBodySize: n.decodedBodySize } : null, fcpSamplesMs: fcp, lcpSamples: m.lcp, clsSamples: m.cls, clsTotal: m.clsTotal, observerErrors: { lcp: m.lcpObserverError ?? null, cls: m.clsObserverError ?? null } };
      });
      facts = await pageFacts(page);
    } catch (e) { webMetrics = { collectionError: String(e) }; }
    const allRequests = [...net.requests.values()];
    const totalLoadingFinishedEncodedBytes = allRequests.reduce((sum, r) => sum + (r.loadingFinishedEncodedBytes || 0), 0);
    const totalEncodedBodyBytes = allRequests.reduce((sum, r) => sum + (r.encodedBodyBytes || 0), 0);
    const isJs = r => r.resourceType === 'Script' || /(?:javascript|ecmascript)/i.test(r.mimeType || '');
    const js = allRequests.filter(isJs);
    const perfRecord = {
      route, run, sampleIndex, viewport, networkProfile, freshBrowserContext: true, cacheDisabled: true, serviceWorkers: 'blocked',
      navigation: nav, navigationError, wallMs, webMetrics, facts, diagnostics: d,
      cdpBytes: {
        requestCount: allRequests.length,
        loadingFinishedEncodedBytes: totalLoadingFinishedEncodedBytes,
        dataReceivedEncodedBodyBytes: totalEncodedBodyBytes,
        javascriptRequestCount: js.length,
        javascriptLoadingFinishedEncodedBytes: js.reduce((sum, r) => sum + (r.loadingFinishedEncodedBytes || 0), 0),
        javascriptDataReceivedEncodedBodyBytes: js.reduce((sum, r) => sum + (r.encodedBodyBytes || 0), 0),
        failures: net.failures,
        rawRequests: allRequests
      }
    };
    results.performance.samples.push(perfRecord);
    await client.detach().catch(() => {});
    await context.close();
  }
}

// Degraded 1 Mbps no-JavaScript check: server-rendered text must remain readable before scripts run.
{
  const route = '/en/design';
  const viewport = { width: 1440, height: 900 };
  const lowProfile = { downMbps: 1, upMbps: 1, rttMs: 100, cdpDownBytesPerSecond: 125000, cdpUpBytesPerSecond: 125000, javaScriptEnabled: false };
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'en-US', reducedMotion: 'no-preference', serviceWorkers: 'block', javaScriptEnabled: false });
  const page = await context.newPage();
  const d = diagnostics(page);
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  await client.send('Network.setBypassServiceWorker', { bypass: true });
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: lowProfile.rttMs, downloadThroughput: lowProfile.cdpDownBytesPerSecond, uploadThroughput: lowProfile.cdpUpBytesPerSecond });
  const net = collectCdp(client);
  const started = Date.now();
  let nav = null;
  let error = null;
  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    nav = { status: response?.status() ?? null, url: response?.url() ?? null };
    await page.locator('main h1').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(300);
  } catch (e) { error = String(e); }
  const wallMs = Date.now() - started;
  let facts = null;
  try { facts = await pageFacts(page); } catch (e) { facts = { readError: String(e) }; }
  const screenshot = 'en-design-1mbps-nojs-readable.png';
  try { await page.screenshot({ path: path.join(out, 'screenshots', screenshot), type: 'png' }); results.screenshots.push({ file: `screenshots/${screenshot}`, route, viewport, state: '1 Mbps down / 1 Mbps up / 100 ms RTT; JavaScript disabled' }); } catch {}
  const allRequests = [...net.requests.values()];
  results.performance.oneMbpsDegradedReadableCheck = {
    route, viewport, profile: lowProfile, navigation: nav, error, wallMs, facts,
    readableServerRenderedContent: Boolean(nav?.status === 200 && facts?.headingVisible && facts?.mainTextLength > 0),
    diagnostics: d, cdpBytes: { requestCount: allRequests.length, loadingFinishedEncodedBytes: allRequests.reduce((s,r)=>s+(r.loadingFinishedEncodedBytes||0),0), dataReceivedEncodedBodyBytes: allRequests.reduce((s,r)=>s+(r.encodedBodyBytes||0),0), failures: net.failures, rawRequests: allRequests }
  };
  await client.detach().catch(() => {});
  await context.close();
}

await browser.close();
const sourceHashesAfter = await snapshotHashes();
const unstableSourceFiles = sourceFiles.filter(file => sourceHashesBefore[file] !== sourceHashesAfter[file]);
results.source.sourceHashesAfter = sourceHashesAfter;
results.source.hashesStableDuringCapture = unstableSourceFiles.length === 0;
results.source.unstableSourceFiles = unstableSourceFiles;
results.source.localBuildIdAfter = (await fs.readFile(path.join(web, '.next/BUILD_ID'), 'utf8')).trim();
results.source.buildIdStableDuringCapture = results.source.localBuildIdAfter === localBuildId;
results.captureFinishedAt = new Date().toISOString();
results.measurementNotes = [
  'All page captures used visible Google Chrome via Playwright channel chrome; no phone viewport/device profile was used.',
  'Performance sampling used 5 new browser contexts per route, with cache disabled and service workers blocked; CDP Network.emulateNetworkConditions used decimal Mbps converted to bytes/s and RTT as listed.',
  'LCP and CLS are raw in-page PerformanceObserver samples. Encoded byte totals are raw CDP Network.loadingFinished.encodedDataLength and Network.dataReceived.encodedDataLength aggregations, preserved per request; they are not field data.',
  'No INP was measured or inferred. These are empty unpublished routes with no cleared real photographs; no real-photo transfer budget or parish-device acceptance is claimed.',
  '200% text resize was simulated by temporary CSS setting the root font size to 200%; this is not native Chrome text-only zoom.'
];
await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify({ output: path.join(out, 'results.json'), screenshots: results.screenshots.length, perfSamples: results.performance.samples.length, serverProbe: results.source.serverProbe, buildId: results.source.localBuildId, hashesStable: results.source.hashesStableDuringCapture, axeAvailable: results.environment.axeAvailable }));
