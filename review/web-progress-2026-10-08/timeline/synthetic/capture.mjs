import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

const repo = '/Users/danghoang/Desktop/giaoxuthachbi_work';
const out = '/private/tmp/thachbi-web03-synthetic';
const base = 'http://127.0.0.1:3120';
const require = createRequire(path.join(repo, 'web/package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const result = {
  startedAt: new Date().toISOString(),
  baseUrl: base,
  serverLog: '/private/tmp/thachbi-web03-harness-capture.log',
  runtime: { node: process.version, os: os.platform() + ' ' + os.release(), browser: browser.version(), headed: true },
  screenshots: [],
  pages: []
};
const cases = [
  { path: '/en/progress?sort=oldest', file: 'en-progress-oldest-first-viewport.png', fullPage: false },
  { path: '/vi/progress?sort=oldest', file: 'vi-progress-oldest-first-viewport.png', fullPage: false },
  { path: '/en/progress/synthetic-event-002', file: 'en-synthetic-event-002-fullpage.png', fullPage: true },
  { path: '/vi/progress/synthetic-event-003', file: 'vi-synthetic-event-003-fullpage.png', fullPage: true }
];
for (const item of cases) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: item.path.startsWith('/vi') ? 'vi-VN' : 'en-US', serviceWorkers: 'block' });
  const page = await context.newPage();
  const d = { consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [] };
  page.on('console', m => { if (m.type() === 'error') d.consoleErrors.push(m.text()); });
  page.on('pageerror', e => d.pageErrors.push(String(e?.stack || e)));
  page.on('requestfailed', req => d.failedRequests.push({ url: req.url(), failure: req.failure()?.errorText || null }));
  page.on('response', r => { if (r.status() >= 400) d.httpErrors.push({ url: r.url(), status: r.status() }); });
  let status = null;
  let navigationError = null;
  try {
    const response = await page.goto(base + item.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    status = response?.status() ?? null;
    await page.locator('main').waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(300);
    const facts = await page.evaluate(() => {
      const root = document.documentElement, body = document.body, main = document.querySelector('main') || body;
      const h1 = main.querySelector('h1') || document.querySelector('h1');
      const lines = (body.innerText || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const syntheticLines = lines.filter(s => /synthetic/i.test(s));
      return {
        pathname: location.pathname, search: location.search, title: document.title, h1: h1?.innerText?.trim() || null,
        viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
        document: { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, scrollHeight: root.scrollHeight, horizontalOverflow: root.scrollWidth > root.clientWidth },
        body: { scrollWidth: body.scrollWidth, horizontalOverflow: body.scrollWidth > root.clientWidth },
        mainTextLength: (main.innerText || '').trim().length,
        syntheticBannerLines: syntheticLines,
        syntheticBannerVisible: syntheticLines.some(s => /synthetic test build/i.test(s))
      };
    });
    const screenshot = path.join(out, 'screenshots', item.file);
    await page.screenshot({ path: screenshot, type: 'png', fullPage: item.fullPage });
    result.screenshots.push({ file: 'screenshots/' + item.file, route: item.path, viewport: { width: 1440, height: 900 }, fullPage: item.fullPage });
    result.pages.push({ route: item.path, status, facts, diagnostics: d, screenshot: 'screenshots/' + item.file });
  } catch (e) {
    navigationError = String(e);
    result.pages.push({ route: item.path, status, navigationError, diagnostics: d });
  }
  await context.close();
}
await browser.close();
result.finishedAt = new Date().toISOString();
await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ output: path.join(out, 'results.json'), pages: result.pages.map(p => ({ route: p.route, status: p.status, banner: p.facts?.syntheticBannerVisible, overflow: p.facts?.document?.horizontalOverflow, errors: p.diagnostics?.consoleErrors.length + p.diagnostics?.pageErrors.length + p.diagnostics?.failedRequests.length + p.diagnostics?.httpErrors.length })), screenshots: result.screenshots.length }));
if (result.pages.length !== 4 || result.pages.some(p => p.status !== 200 || !p.facts?.syntheticBannerVisible)) process.exitCode = 1;
