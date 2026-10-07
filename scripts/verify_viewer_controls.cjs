/* Browser interaction/persistence check. Uses isolated Chrome storage, never the
 * user's browser profile. PLAYWRIGHT_MODULE may point to installed Playwright. */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.argv[2] || '/tmp/thachbi-controls';
// Feedback margin is a transient analysis output recomputed after reload.
const inputs = json => JSON.parse(json).map(({ feedbackMargin, ...item }) => item);
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files'] });
  try {
    fs.mkdirSync(out, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html?graphics=light'));
    await page.waitForFunction(() => window.church?.ready, null, { timeout: 120000 });
    await page.evaluate(() => {
      church.goTo('nave', { instant: true });
      window.controlEvents = 0;
      CHURCH_SIMULATOR.on('items', () => controlEvents++);
    });
    await page.locator('#ctlToggle').click();
    await page.locator('#ctl-tab-DB1').click();
    await page.evaluate(() => { controlEvents = 0; });
    await page.locator('[data-act="breaker"][data-circuit="L1"]').click();
    assert.deepEqual(await page.evaluate(() => ({ events: controlEvents, off: CHURCH_SIMULATOR.state.items.filter(it => it.circuit === 'L1' && !it.hidden).every(it => !it.on) })), { events: 1, off: true });
    await page.evaluate(() => CHURCH_SIMULATOR.undo());
    assert(await page.evaluate(() => CHURCH_SIMULATOR.state.items.filter(it => it.circuit === 'L1' && !it.hidden).every(it => it.on)));
    await page.locator('#ctl-tab-fans').click();
    await page.evaluate(() => { controlEvents = 0; });
    await page.locator('[data-act="speed"][data-circuit="F4"][data-speed="1"]').click();
    assert.deepEqual(await page.evaluate(() => ({ events: controlEvents, low: CHURCH_SIMULATOR.state.items.filter(it => it.circuit === 'F4' && !it.hidden).every(it => it.on && it.speed === 1) })), { events: 1, low: true });
    const beforeRotation = await page.evaluate(() => [...CHURCH_SIMULATOR.fixtures.values()].find(f => f.item.circuit === 'F4').rotor.rotation.x);
    await page.waitForTimeout(300);
    assert.notEqual(await page.evaluate(() => [...CHURCH_SIMULATOR.fixtures.values()].find(f => f.item.circuit === 'F4').rotor.rotation.x), beforeRotation, 'fan blades keep moving');
    await page.locator('#ctl-tab-sound').click();
    await page.evaluate(() => { controlEvents = 0; });
    await page.locator('[data-act="mute"][data-circuit="A1"]').click();
    assert.deepEqual(await page.evaluate(() => ({ events: controlEvents, muted: CHURCH_SIMULATOR.state.items.filter(it => it.circuit === 'A1' && !it.hidden).every(it => !it.on) })), { events: 1, muted: true });
    await page.locator('[data-act="fader"][data-circuit="A1"]').evaluate(node => { node.value = '-3'; node.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.screenshot({ path: path.join(out, 'sound-controls.jpg'), type: 'jpeg', quality: 85 });
    await page.evaluate(() => CHURCH_SIMULATOR.electrical.setMode('systems'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, 'systems.jpg'), type: 'jpeg', quality: 85 });
    await page.evaluate(() => CHURCH_SIMULATOR.electrical.setMode('building'));
    const saved = await page.evaluate(() => {
      const S = CHURCH_SIMULATOR;
      const item = S.state.items.find(it => it.circuit === 'L1');
      S.update(item.id, { pos: [item.pos[0] + .05, item.pos[1], item.pos[2]], dim: .63 });
      const removed = S.state.items.find(it => it.circuit === 'L5');
      S.remove(removed.id); S.saveNow();
      return { id: item.id, pos: item.pos.slice(), removed: removed.id, layout: JSON.stringify(S.exportLayout().items) };
    });
    await page.reload();
    await page.waitForFunction(() => window.church?.ready, null, { timeout: 120000 });
    const reloaded = await page.evaluate(({ id, removed }) => ({ pos: CHURCH_SIMULATOR.item(id).pos, dim: CHURCH_SIMULATOR.item(id).dim, removed: !CHURCH_SIMULATOR.item(removed), items: JSON.stringify(CHURCH_SIMULATOR.exportLayout().items) }), saved);
    assert.deepEqual(reloaded.pos, saved.pos); assert.equal(reloaded.dim, .63); assert(reloaded.removed);
    assert.deepEqual(inputs(reloaded.items), inputs(saved.layout), 'every saved input field survives reload');
    const restored = await page.evaluate(layout => {
      const S = CHURCH_SIMULATOR;
      S.importLayout({ schema: 1, items: JSON.parse(layout) });
      return JSON.stringify(S.exportLayout().items);
    }, saved.layout);
    assert.deepEqual(inputs(restored), inputs(saved.layout), 'import preserves every exported input field');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ checks: 'passed', circuitNotifications: 1, fanMotion: true, soundMute: true, savedMoveDimDeletion: true, exportImport: true, errors }, null, 2) + '\n');
    console.log('Browser controls, fan motion, systems view and persistence checks passed.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
