#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const REPO = path.resolve(process.env.THACHBI_ROOT || '/Users/danghoang/Desktop/giaoxuthachbi_work');
const WEB = path.join(REPO, 'web');
const OUT = process.argv[2] && path.resolve(process.argv[2]);
if (!OUT) throw new Error('Usage: node capture.cjs NEW_OUTPUT_DIRECTORY');
if (fs.existsSync(OUT)) throw new Error(`Refusing existing output directory: ${OUT}`);
fs.mkdirSync(OUT, { recursive: true });
const webRequire = createRequire(path.join(WEB, 'package.json'));
const { chromium } = webRequire('playwright');
let AxeBuilder = null;
try { AxeBuilder = webRequire('@axe-core/playwright'); } catch {}
const baseUrl = 'http://127.0.0.1:3111';
const buildIdPath = path.join(WEB, '.next', 'BUILD_ID');
const sourceConfigFiles = [
  'package.json', 'package-lock.json', '.node-version', '.npmrc', '.env.example',
  'biome.json', 'next.config.ts', 'playwright.config.ts', 'postcss.config.mjs',
  'tsconfig.json', 'vitest.config.ts',
];
function listFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(file) : [file];
  }).sort();
}
function sourceSnapshot() {
  const files = [
    ...listFiles(path.join(WEB, 'src')),
    ...listFiles(path.join(WEB, 'scripts')),
    ...sourceConfigFiles.map((name) => path.join(WEB, name)),
  ].sort();
  return Object.fromEntries(files.map((file) => [
    path.relative(REPO, file).split(path.sep).join('/'),
    crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  ]));
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
const errors = { consoleErrors: [], pageErrors: [], requestFailures: [] };
const requests = [];
const states = [];
const axeResults = {};
const beforeHashes = sourceSnapshot();
const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
const buildStat = fs.statSync(buildIdPath);
let browser;
let context;
let page;
async function inspectAndCapture({ name, route, width, height, rootFontPx = null, keyboardFocus = false }) {
  await page.setViewportSize({ width, height });
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('main h1').waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  if (rootFontPx !== null) {
    await page.evaluate((size) => { document.documentElement.style.fontSize = `${size}px`; }, rootFontPx);
  }
  if (keyboardFocus) {
    await page.keyboard.press('Tab');
  }
  await page.waitForTimeout(250);
  const state = await page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom };
    };
    const intersectsViewport = (r) => r && r.right > 0 && r.bottom > 0 && r.x < innerWidth && r.y < innerHeight;
    const links = Array.from(document.querySelectorAll('a')).map((el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        text: (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' '),
        href: el.href,
        current: el.getAttribute('aria-current'),
        rect: rect(el),
        visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && el.getClientRects().length > 0,
        intersectsViewport: intersectsViewport(r),
      };
    });
    const focus = document.activeElement;
    const focusStyle = focus ? getComputedStyle(focus) : null;
    const brand = document.querySelector('header .mx-auto > a');
    const nav = document.querySelector('header nav');
    const br = brand?.getBoundingClientRect();
    const nr = nav?.getBoundingClientRect();
    const headerBrandNavOverlap = Boolean(br && nr && br.left < nr.right && br.right > nr.left && br.top < nr.bottom && br.bottom > nr.top);
    const main = document.querySelector('main');
    const h1 = main?.querySelector('h1');
    const rawColorSample = (el, label) => {
      if (!el) return null;
      const computed = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const backgrounds = [];
      let ancestor = el;
      let depth = 0;
      while (ancestor && depth < 6) {
        const style = getComputedStyle(ancestor);
        const backgroundColor = style.backgroundColor;
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
          backgrounds.push({ tag:ancestor.tagName, className:typeof ancestor.className === 'string' ? ancestor.className : '', backgroundColor });
        }
        ancestor = ancestor.parentElement;
        depth += 1;
      }
      return {
        label,
        tag:el.tagName,
        className:typeof el.className === 'string' ? el.className : '',
        text:(el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 180),
        foregroundColor:computed.color,
        backgroundColor:computed.backgroundColor,
        opacity:computed.opacity,
        fontSize:computed.fontSize,
        fontWeight:computed.fontWeight,
        visible:computed.display !== 'none' && computed.visibility !== 'hidden' && Number(computed.opacity) > 0 && el.getClientRects().length > 0,
        intersectsViewport:intersectsViewport(box),
        backgroundAncestors:backgrounds,
      };
    };
    const contrastRawColors = {
      documentRoot:rawColorSample(document.documentElement, 'document root'),
      body:rawColorSample(document.body, 'body'),
      headings:Array.from(document.querySelectorAll('h1,h2,h3')).map((el, index) => rawColorSample(el, `heading-${index + 1}`)),
      navigation:Array.from(nav?.querySelectorAll('a') || []).map((el, index) => rawColorSample(el, `navigation-link-${index + 1}`)),
      preview:rawColorSample(document.querySelector('header > div'), 'preview banner'),
      footer:rawColorSample(document.querySelector('footer'), 'footer'),
      footerText:Array.from(document.querySelectorAll('footer span')).map((el, index) => rawColorSample(el, `footer-text-${index + 1}`)),
      focusedElement:focus && focus !== document.body ? rawColorSample(focus, 'focused element') : null,
    };
    return {
      title: document.title,
      htmlLang: document.documentElement.lang,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      rootFontSize: getComputedStyle(document.documentElement).fontSize,
      document: { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, bodyScrollWidth: document.body.scrollWidth },
      horizontalOverflowPx: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      mainRect: rect(main),
      heading: { text: h1?.innerText || null, rect: rect(h1) },
      header: { rect: rect(document.querySelector('header')), brandRect: rect(brand), navRect: rect(nav), brandNavOverlap: headerBrandNavOverlap },
      links,
      visibleViewportLinks: links.filter((link) => link.visible && link.intersectsViewport && !link.href.includes('#main')),
      focus: focus ? {
        tag: focus.tagName,
        text: (focus.innerText || focus.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' '),
        href: focus.href || null,
        rect: rect(focus),
        outlineStyle: focusStyle?.outlineStyle,
        outlineWidth: focusStyle?.outlineWidth,
        outlineColor: focusStyle?.outlineColor,
        transform: focusStyle?.transform,
        insideViewport: Boolean(focus.getBoundingClientRect().left >= 0 && focus.getBoundingClientRect().top >= 0 && focus.getBoundingClientRect().right <= innerWidth && focus.getBoundingClientRect().bottom <= innerHeight),
      } : null,
      contrastRawColors,
      visibleButtons: Array.from(document.querySelectorAll('button, input[type=button], input[type=submit]')).filter((el) => {
        const style = getComputedStyle(el); return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
      }).map((el) => ({ text:(el.innerText || el.value || '').trim(), rect:rect(el) })),
    };
  });
  const filename = `${name}.png`;
  const screenshotPath = path.join(OUT, filename);
  await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' });
  const item = {
    name, route, screenshot: filename, screenshotBytes: fs.statSync(screenshotPath).size,
    screenshotSha256: sha256(screenshotPath), rootFontSizeAppliedPx: rootFontPx,
    keyboardFocusRequested: keyboardFocus, ...state,
  };
  states.push(item);
  return item;
}
async function main() {
  browser = await chromium.launch({ channel: 'chrome', headless: false, args: [
    '--no-first-run', '--no-default-browser-check', '--disable-sync', '--disable-background-networking', '--disable-default-apps',
  ] });
  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'Asia/Tokyo', serviceWorkers: 'block' });
  page = await context.newPage();
  page.on('console', (message) => { if (message.type() === 'error') errors.consoleErrors.push({ text: message.text(), url: message.location().url, line: message.location().lineNumber }); });
  page.on('pageerror', (error) => errors.pageErrors.push({ name: error.name, message: error.message, stack: error.stack }));
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), resourceType: request.resourceType() }));
  page.on('requestfailed', (request) => errors.requestFailures.push({ url: request.url(), method: request.method(), error: request.failure()?.errorText || 'unknown' }));

  const firstHome = await inspectAndCapture({ name:'01-vi-home-1440x900', route:'/vi', width:1440, height:900 });
  if (AxeBuilder) {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    axeResults.viHome = { available:true, violations:result.violations.map((v) => ({ id:v.id, impact:v.impact, description:v.description, help:v.help, nodes:v.nodes.map((n) => ({ target:n.target, failureSummary:n.failureSummary })) })), passes:result.passes.length, incomplete:result.incomplete.map((v) => ({ id:v.id, impact:v.impact })) };
  } else axeResults.viHome = { available:false, reason:'@axe-core/playwright could not be loaded' };
  const enHome = await inspectAndCapture({ name:'02-en-home-1440x900', route:'/en', width:1440, height:900 });
  if (AxeBuilder) {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    axeResults.enHome = { available:true, violations:result.violations.map((v) => ({ id:v.id, impact:v.impact, description:v.description, help:v.help, nodes:v.nodes.map((n) => ({ target:n.target, failureSummary:n.failureSummary })) })), passes:result.passes.length, incomplete:result.incomplete.map((v) => ({ id:v.id, impact:v.impact })) };
  } else axeResults.enHome = { available:false, reason:'@axe-core/playwright could not be loaded' };
  await inspectAndCapture({ name:'03-en-about-1440x900', route:'/en/about-this-site', width:1440, height:900 });
  await inspectAndCapture({ name:'04-vi-home-1280x800', route:'/vi', width:1280, height:800 });
  const zoomed = await inspectAndCapture({ name:'05-en-home-text-200-keyboard-focus-1440x900', route:'/en', width:1440, height:900, rootFontPx:32, keyboardFocus:true });

  const afterHashes = sourceSnapshot();
  const hashChanges = Object.keys(beforeHashes).filter((name) => beforeHashes[name] !== afterHashes[name]);
  const externalRequests = requests.filter((item) => {
    try { return new URL(item.url).origin !== baseUrl; } catch { return true; }
  });
  const checks = {
    allPagesHaveMainHeading: states.every((s) => Boolean(s.heading.text)),
    noHorizontalOverflow: states.every((s) => s.horizontalOverflowPx <= 0),
    noHeaderBrandNavOverlap: states.every((s) => !s.header.brandNavOverlap),
    navigationLinksVisible: states.every((s) => s.visibleViewportLinks.length >= 3),
    textResizeActually200Percent: zoomed.rootFontSize === '32px',
    keyboardFocusVisibleInsideViewport: Boolean(zoomed.focus && zoomed.focus.insideViewport && Number.parseFloat(zoomed.focus.outlineWidth) >= 3 && zoomed.focus.outlineStyle !== 'none'),
    noExternalPageRequests: externalRequests.length === 0,
    noConsoleErrors: errors.consoleErrors.length === 0,
    noPageErrors: errors.pageErrors.length === 0,
    noRequestFailures: errors.requestFailures.length === 0,
    sourceHashesUnchanged: hashChanges.length === 0,
  };
  const summary = {
    schemaVersion:1,
    capturedAt:new Date().toISOString(),
    repository:REPO,
    webRoot:WEB,
    serverOrigin:baseUrl,
    browser:{ channel:'chrome', product:browser.version(), headed:true, context:'fresh incognito context; no persistent profile', playwrightVersion:webRequire('playwright/package.json').version },
    host:{ platform:process.platform, architecture:process.arch, osType:os.type(), osRelease:os.release(), osVersion:typeof os.version === 'function' ? os.version() : null, nodeVersion:process.version, nodeExecutable:process.execPath },
    build:{ buildId, buildIdPath, buildIdMtime:buildStat.mtime.toISOString(), nextVersion:webRequire('next/package.json').version },
    captureProfile:{ viewportDpr:1, locales:['vi','en'], viewportStates:states.map((s) => ({ name:s.name, route:s.route, width:s.viewport.width, height:s.viewport.height, rootFontSize:s.rootFontSize, screenshot:s.screenshot })), textResize:{ method:'document.documentElement.style.fontSize = "32px"', baselineRootFontPx:16, resultingRootFontPx:32, description:'CSS root text resizing to 200%; browser zoom remains 100%.' }, keyboard:{ action:'Tab once from the page after navigation', expectedTarget:'Skip to main content link' } },
    requests:{ count:requests.length, externalCount:externalRequests.length, externalRequests, allPageRequests:requests },
    states,
    axe:axeResults,
    errors,
    sourceHashes:{ before:beforeHashes, after:afterHashes, changedPaths:hashChanges },
    checks,
    buildIdStableAtStart:true,
  };
  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT, 'browser-errors.json'), JSON.stringify(errors, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT, 'page-requests.json'), JSON.stringify(requests, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT, 'axe-results.json'), JSON.stringify(axeResults, null, 2) + '\n');
  if (Object.values(checks).some((value) => value !== true)) {
    const notPassing = Object.fromEntries(Object.entries(checks).filter(([, value]) => value !== true));
    throw new Error(`One or more evidence checks did not pass: ${JSON.stringify(notPassing)}`);
  }
  process.stdout.write(JSON.stringify({ output:OUT, checks, requestCount:requests.length, externalRequests:externalRequests.length, axeViolations:{ vi:axeResults.viHome.violations?.length ?? null, en:axeResults.enHome.violations?.length ?? null }, screenshots:states.map((s) => ({ path:s.screenshot, sha256:s.screenshotSha256 })), buildId }, null, 2) + '\n');
}
main().catch((error) => {
  fs.writeFileSync(path.join(OUT, 'run-error.json'), JSON.stringify({ name:error.name, message:error.message, stack:error.stack, partialStates:states, errors, requests }, null, 2) + '\n');
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
}).finally(async () => {
  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
});
