/* Explicit per-wing adoption in actual desktop Chrome. Isolated temporary
 * browser storage never touches the user's profile or saved layout.
 * Run: HEADED=1 node scripts/verify_wing_adoption_browser.cjs [evidence-directory]
 * PLAYWRIGHT_MODULE can override the repository's bundled Playwright path.
 * Software/visual evidence only: physical and engineering holds remain.
 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { loadStudyModel, root, sources } = require('./lib/study_model.cjs');
const { groups, plain, frozenBaseline, baselinePath } = require('./verify_wing_review.cjs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(root, 'web/node_modules/playwright'));
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'review/wing-adoption-2026-10-09');
const storageKey = 'thachbi.simulator.v1', adoptionPrefix = storageKey + '.before-wing-adoption.';
const url = pathToFileURL(path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html')).href;
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const fingerprintPaths = [...new Set([...sources, 'Thach_Bi_Viewer/OPEN_CHURCH.html', 'Thach_Bi_Viewer/simulator/ui.js', 'Thach_Bi_Viewer/simulator/simulator.css',
  'scripts/lib/study_model.cjs', 'scripts/verify_wing_review.cjs', 'scripts/verify_wing_adoption_browser.cjs', baselinePath])];
const fingerprints = () => Object.fromEntries(fingerprintPaths.map(file => [file, sha256(fs.readFileSync(path.join(root, file)))]));
// The analysis writes derived microphone feedbackMargin after calculations.
// Every editable field, all settings and custom scenes are compared exactly.
const equipmentRecords = items => plain(items).map(it => { delete it.feedbackMargin; return it; });
const layoutRecord = layout => { const copy = plain(layout); delete copy.savedAt; copy.items = equipmentRecords(copy.items); return copy; };
const sideIds = side => [...groups[side], ...groups.appended.filter(id => id.includes('-' + side + '-'))];
const allWingIds = [...sideIds('B'), ...sideIds('H')];
fs.mkdirSync(out, { recursive: true });

function weekdaySeed() {
  const study = loadStudyModel();
  try {
    const SIM = study.SIM;
    SIM.importLayout(frozenBaseline(), { record: false });
    SIM.applyScene('Weekday Mass', { record: false });
    SIM.update('L1', { note: 'Owner note outside the wing adoption scope.' }, { record: false });
    SIM.add({ ...plain(SIM.item('L1')), id: 'OWNER-CUSTOM-LIGHT', name: 'Owner custom fixture', pos: [24, 4, -5.8],
      on: false, dim: 0.37, note: 'Keep this custom ID, position, settings and note.' }, { record: false });
    SIM.state.customScenes.push({ name: 'Owner quiet review', items: { L1: { on: false, dim: 0.37 }, 'OWNER-CUSTOM-LIGHT': { on: true, dim: 0.42 } } });
    Object.assign(SIM.state.settings, { wingReviewRevision: '', maintenance: 0.77, occupancy: 0.57, tariff: 2300, autoQuality: false });
    return plain(SIM.exportLayout());
  } finally { study.dispose(); }
}

function assertCounts(state, side, current) {
  const row = state.status.sides.find(s => s.side === side);
  assert.equal(row.current, current, side + ': actual layout current status');
  assert.deepEqual(row.counts, current ? { chandeliers: 4, wallFans: 4, roofFans: 0 } : { chandeliers: 0, wallFans: 0, roofFans: 2 }, side + ': actual visible equipment counts');
  if (current) assert.deepEqual(row.mismatchingIds, [], side + ': no mismatching IDs');
  else assert(row.mismatchingIds.length > 0, side + ': preserved equipment IDs identified');
}
function assertFixturesAndRoutes(state, label) {
  assert.equal(state.fixtures.length, state.layout.items.length, label + ': one instantiated fixture per ID');
  assert.equal(new Set(state.layout.items.map(it => it.id)).size, state.layout.items.length, label + ': unique IDs');
  for (const fixture of state.fixtures) {
    const item = state.layout.items.find(it => it.id === fixture.id);
    assert.equal(fixture.type, item.type, label + ': actual cached type ' + item.id);
    assert.deepEqual(fixture.pos, item.pos, label + ': actual fixture root position ' + item.id);
  }
  for (const id of allWingIds) {
    const item = state.layout.items.find(it => it.id === id);
    if (!item || item.hidden) continue;
    const component = state.electrical.components.find(c => c.id === id);
    assert(component, label + ': actual electrical component ' + id);
    assert.equal(component.type, item.type, label + ': electrical type ' + id);
    assert.equal(component.circuit, item.circuit, label + ': electrical circuit ' + id);
    assert.deepEqual(component.position, item.pos, label + ': electrical position ' + id);
    const drops = state.electrical.routes.filter(r => ['drop', 'local'].includes(r.role) && r.itemIds.includes(id));
    assert(drops.length, label + ': electrical endpoint route ' + id);
    for (const drop of drops) {
      assert(drop.points.flat().every(Number.isFinite), label + ': finite route vertices ' + id);
      assert.deepEqual(drop.points.at(-1), item.pos, label + ': actual 2D/3D route endpoint ' + id);
    }
  }
}
function assertScope(after, before, side) {
  const replaced = new Set(sideIds(side)), prior = equipmentRecords(before.layout.items), next = equipmentRecords(after.layout.items);
  for (const item of prior.filter(it => !replaced.has(it.id))) assert.deepEqual(next.find(it => it.id === item.id), item, side + ': unrelated/custom item preserved ' + item.id);
  assert.deepEqual(next.slice(0, prior.length).map(it => it.id), prior.map(it => it.id), side + ': existing ID ordering preserved');
  assert.deepEqual(after.layout.settings, before.layout.settings, side + ': all current user settings preserved');
  assert.deepEqual(after.layout.customScenes, before.layout.customScenes, side + ': custom scenes preserved');
  assert.equal(after.layout.scene, before.layout.scene, side + ': scene label preserved');
  for (const id of groups[side].filter(id => id.startsWith('L'))) {
    const old = prior.find(it => it.id === id), item = next.find(it => it.id === id);
    assert.equal(item.type, 'chandelier6Reading', side + ': selected chandelier form ' + id);
    assert.equal(item.on, old.on, side + ': light on override retained ' + id);
    assert.equal(item.dim, old.dim, side + ': light dim override retained ' + id);
    if (old.note) assert.equal(item.note, old.note, side + ': original user note retained ' + id);
  }
  for (const id of sideIds(side).filter(id => id.startsWith('F'))) {
    const item = next.find(it => it.id === id);
    assert.equal(item.type, 'fanWall', side + ': wall-fan form ' + id);
    assert.equal(item.circuit, 'F5', side + ': held F5 group ' + id);
    assert.equal(item.on, true, side + ': Weekday held fan mode ' + id);
    assert.equal(item.speed, 1, side + ': reviewed low speed ' + id);
  }
  assert.equal(after.history.length, before.history.length + 1, side + ': one undoable transaction');
  assert.equal(after.history.at(-1).label, 'Use reviewed wing ' + side + ' lights and fans');
  assert.deepEqual(after.future, [], side + ': prior redo branch cleared');
  assertFixturesAndRoutes(after, 'adopted ' + side);
}
function assertUnchanged(after, before, label) {
  assert.deepEqual(layoutRecord(after.layout), layoutRecord(before.layout), label + ': exact editable export unchanged');
  assert.deepEqual(after.history, before.history, label + ': history unchanged');
  assert.deepEqual(after.future, before.future, label + ': redo history unchanged');
  assert.equal(after.selectedId, before.selectedId, label + ': selection unchanged');
  assertFixturesAndRoutes(after, label);
}

(async () => {
  const sourceSha256 = fingerprints(), seed = weekdaySeed(), errors = [], warnings = [], checks = [], frames = [];
  fs.writeFileSync(path.join(out, 'seed-weekday-before-wing-review.json'), JSON.stringify(seed, null, 2) + '\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1', args: ['--allow-file-access-from-files'] });
  let currentPage;
  try {
    async function settled(page) {
      await page.waitForFunction(() => window.church?.ready && window.CHURCH_SIMULATOR?.ready, null, { timeout: 180000 });
      await page.waitForFunction(() => CHURCH_SIMULATOR.analysis.results.seats && !CHURCH_SIMULATOR.analysis.busy, null, { timeout: 180000 });
    }
    async function newPage(name, layout = seed) {
      const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
      const page = await context.newPage(); currentPage = page;
      page.on('pageerror', error => errors.push({ name, message: error.message }));
      page.on('console', message => {
        if (message.type() === 'error') errors.push({ name, message: message.text() });
        if (message.type() === 'warning') {
          const old = warnings.find(w => w.name === name && w.message === message.text());
          if (old) old.count++; else warnings.push({ name, message: message.text(), count: 1 });
        }
      });
      await page.addInitScript(({ initial, key, prefix }) => {
        if (!localStorage.getItem('test.wing-adoption.seeded')) {
          localStorage.setItem(key, JSON.stringify(initial)); localStorage.setItem('test.wing-adoption.seeded', 'yes');
        }
        window.__adoptionAttempts = []; window.__wingMigrationCalls = [];
        window.__denyAdoptionBackup = false; window.__denyAdoptionSave = false;
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(k, v) {
          if (window.__denyAdoptionBackup && k.startsWith(prefix)) throw new Error('Controlled test: adoption backup storage unavailable');
          if (window.__denyAdoptionSave && k === key) throw new Error('Controlled test: adopted layout storage unavailable');
          return originalSetItem.call(this, k, v);
        };
        let design;
        Object.defineProperty(window, 'CHURCH_SIM_DESIGN', { configurable: true, get() { return design; }, set(value) {
          design = value;
          const upgrade = value.upgradeWingReview;
          value.upgradeWingReview = function(items, recommended) {
            const input = JSON.parse(JSON.stringify(items)), output = upgrade(items, recommended);
            window.__wingMigrationCalls.push({ input, output: JSON.parse(JSON.stringify(output)) });
            return output;
          };
        } });
      }, { initial: layout, key: storageKey, prefix: adoptionPrefix });
      await page.goto(url); await settled(page);
      await page.evaluate(() => {
        church.pause(); church.setLighting('day'); church.render();
        const SIM = CHURCH_SIMULATOR, adopt = SIM.adoptWingReview;
        SIM.adoptWingReview = function(side) {
          try {
            const result = adopt(side);
            window.__adoptionAttempts.push({ side, result: JSON.parse(JSON.stringify(result)) }); return result;
          } catch (error) {
            window.__adoptionAttempts.push({ side, error: error.message }); throw error;
          }
        };
      });
      // Flush normal startup save timers before testing failure atomicity.
      await page.waitForTimeout(850); await settled(page);
      return { context, page };
    }
    async function snapshot(page) {
      return page.evaluate(({ key, prefix }) => {
        const SIM = CHURCH_SIMULATOR; SIM.electrical.rebuild();
        const data = SIM.electrical.exportData(), ids = new Set(['L63','L64','L65','L66','L67','L68','L69','L70','F240','F241','F242','F243','F-WING-B-3','F-WING-B-4','F-WING-H-3','F-WING-H-4']);
        return JSON.parse(JSON.stringify({ layout: SIM.exportLayout(), status: SIM.wingReviewStatus(), history: SIM.state.history, future: SIM.state.future, selectedId: SIM.state.selectedId,
          stored: localStorage.getItem(key), migrationBackup: localStorage.getItem(key + '.before-wing-review'),
          backups: Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith(prefix)).map(k => [k, localStorage.getItem(k)])),
          attempts: window.__adoptionAttempts, migrations: window.__wingMigrationCalls,
          fixtures: [...SIM.fixtures].map(([id, fx]) => ({ id, type: fx.type.id, pos: fx.root.position.toArray(), visible: fx.root.visible })),
          electrical: { components: data.components.filter(c => ids.has(c.id)), routes: data.routes.filter(r => r.itemIds.some(id => ids.has(id))) } }));
      }, { key: storageKey, prefix: adoptionPrefix });
    }
    async function wiring(page) {
      if (!await page.locator('#simPanel').isVisible()) await page.locator('#simulatorButton').click();
      await page.locator('#simPanel [data-tab=wiring]').click();
    }
    async function adoptThroughUI(page, side, before) {
      await page.locator(`[data-act=wing-adopt][data-side=${side}]`).click();
      await page.waitForFunction(code => CHURCH_SIMULATOR.wingReviewStatus().sides.find(s => s.side === code).current, side);
      const after = await snapshot(page), attempt = after.attempts.at(-1), result = attempt.result;
      assert.equal(attempt.side, side); assert(result && result.backupKey, side + ': actual API returns durable backup key');
      assert.deepEqual([...result.changedIds].sort(), sideIds(side).sort(), side + ': explicit known-ID scope');
      assert.deepEqual(layoutRecord(JSON.parse(after.backups[result.backupKey])), layoutRecord(before.layout), side + ': durable full previous export');
      assert.equal(Object.keys(after.backups).length, Object.keys(before.backups).length + 1, side + ': separate full backup for this transaction');
      assert.deepEqual(layoutRecord(JSON.parse(after.stored)), layoutRecord(after.layout), side + ': adoption saved durably');
      assertScope(after, before, side);
      fs.writeFileSync(path.join(out, `before-adopt-${side}.json`), after.backups[result.backupKey] + '\n');
      fs.writeFileSync(path.join(out, `after-adopt-${side}.json`), JSON.stringify(after.layout, null, 2) + '\n');
      return after;
    }
    async function undoRedo(page, before, adopted, side) {
      await page.locator('#simPanel [data-act=undo]').click();
      const undone = await snapshot(page);
      assert.deepEqual(layoutRecord(undone.layout), layoutRecord(before.layout), side + ': Undo restores exact complete previous editable layout');
      assertFixturesAndRoutes(undone, 'Undo ' + side);
      await page.locator('#simPanel [data-act=redo]').click();
      const redone = await snapshot(page);
      assert.deepEqual(layoutRecord(redone.layout), layoutRecord(adopted.layout), side + ': Redo restores exact adopted editable layout');
      assert.deepEqual(redone.backups, adopted.backups, side + ': Undo/Redo retains durable backups');
      assertFixturesAndRoutes(redone, 'Redo ' + side);
      return redone;
    }
    async function capture(page, name, side, lighting, panelOpen = false) {
      const before = await snapshot(page);
      const display = await page.evaluate(async ({ side, lighting, panelOpen }) => {
        const sign = side === 'B' ? -1 : 1;
        CHURCH_SIMULATOR.ui.setOpen(panelOpen);
        if (panelOpen) CHURCH_SIMULATOR.ui.tab = 'wiring';
        CHURCH_PERFORMANCE.setMode('full'); church.pause();
        const pos = panelOpen ? [40.575, 1.33, sign * 7.6] : [40.575, 5.5, sign * 6];
        const target = panelOpen ? [40.575, 3.55, sign * 13.06] : [40.575, 3, sign * 11];
        church.places['wing-adoption-evidence'] = { title: 'Held wing equipment review', note: 'Desktop software evidence only.', pos, target, interior: true };
        church.goTo('wing-adoption-evidence', { mode: 'explore', instant: true });
        church.setRoof(panelOpen); church.setLighting(lighting);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        church.render();
        return { camera: church.camera.position.toArray(), target: church.controls.target.toArray(), ui: church.uiState(),
          drawingBuffer: [church.renderer.domElement.width, church.renderer.domElement.height],
          receiverCount: CHURCH_SIMULATOR.seats().length, status: CHURCH_SIMULATOR.wingReviewStatus() };
      }, { side, lighting, panelOpen });
      const file = name + '.png'; await page.screenshot({ path: path.join(out, file) });
      const after = await snapshot(page);
      assert.deepEqual(layoutRecord(after.layout), layoutRecord(before.layout), name + ': display retains exact editable layout');
      assert.deepEqual(after.history, before.history, name + ': display retains history');
      assert.deepEqual(after.future, before.future, name + ': display retains redo history');
      assert.equal(display.receiverCount, 368, name + ': all receivers retained');
      frames.push({ file, side, lighting, panelOpen, ...display, layoutSha256: sha256(JSON.stringify(layoutRecord(after.layout))) });
    }

    const primary = await newPage('Weekday preserved layout'), page = primary.page;
    let before = await snapshot(page);
    assert.equal(before.layout.scene, 'Weekday Mass');
    assert.equal(before.migrations.length, 1, 'one conservative startup migration attempt');
    for (const side of ['B', 'H']) for (const id of groups[side]) assert.deepEqual(equipmentRecords(before.layout.items).find(it => it.id === id), seed.items.find(it => it.id === id), 'Weekday scene alone preserves old wing equipment ' + id);
    assertCounts(before, 'B', false); assertCounts(before, 'H', false);
    assert.equal(before.layout.settings.wingReviewRevision, before.status.sourceRevision, 'saved migration history is distinct from current content');
    assertFixturesAndRoutes(before, 'retained Weekday');
    await page.locator('#simulatorButton').click();
    assert.match(await page.locator('#simBody').innerText(), /Wing B \/ H uses preserved or custom lights and fans/);
    await page.locator('[data-tab-jump=wiring]').click();
    const retainedText = await page.locator('#simBody').innerText();
    assert.match(retainedText, /Wing B · Preserved or custom/i); assert.match(retainedText, /Wing H · Preserved or custom/i);
    assert.match(retainedText, /0 chandeliers · 0 wall fans · 2 roof fans/);
    assert.match(retainedText, /Source review/); assert.match(retainedText, /history only/); assert.match(retainedText, /ENGINEERING HOLD/);
    assert.match(retainedText, /Mismatching equipment IDs: L63/);
    await capture(page, '01-retained-wiring-day', 'B', 'day', true);
    await page.evaluate(() => {
      const SIM = CHURCH_SIMULATOR;
      SIM.update('L63', { on: false, dim: 0.42, note: 'Owner B reading-light override and note.' });
      SIM.update('L67', { on: true, dim: 0.61, note: 'Owner H reading-light override and note.' });
    });
    before = await snapshot(page);
    let adopted = await adoptThroughUI(page, 'B', before);
    assertCounts(adopted, 'B', true); assertCounts(adopted, 'H', false);
    adopted = await undoRedo(page, before, adopted, 'B');
    assert.equal(await page.locator('[data-act=wing-adopt][data-side=B]').isDisabled(), true, 'current B action disabled');
    await page.evaluate(() => CHURCH_SIMULATOR.update('F240', { on: false, speed: 0 }));
    const currentBefore = await snapshot(page);
    await page.locator('[data-act=wing-adopt][data-side=B]').evaluate(el => { el.disabled = false; el.click(); });
    const currentAfter = await snapshot(page);
    assertUnchanged(currentAfter, currentBefore, 'forced current-side UI action');
    assert.deepEqual(currentAfter.attempts, currentBefore.attempts, 'forced current-side UI action never calls adoption API');
    const noOp = await page.evaluate(() => CHURCH_SIMULATOR.adoptWingReview('B'));
    assert.deepEqual(noOp.changedIds, [], 'already-current API adoption is a no-op');
    const apiNoOpAfter = await snapshot(page);
    assertUnchanged(apiNoOpAfter, currentBefore, 'already-current API adoption');
    assert.deepEqual(apiNoOpAfter.backups, currentBefore.backups, 'already-current action creates no extra backup');
    before = apiNoOpAfter;
    adopted = await adoptThroughUI(page, 'H', before);
    assertCounts(adopted, 'B', true); assertCounts(adopted, 'H', true);
    adopted = await undoRedo(page, before, adopted, 'H');
    assert.equal(await page.locator('[data-act=wing-adopt][data-side=H]').isDisabled(), true, 'current H action disabled');
    assert.equal(await page.evaluate(() => CHURCH_SIMULATOR.saveNow()), true, 'explicit saved layout succeeds');
    const saved = await snapshot(page), backupBytes = saved.backups;
    await page.reload(); await settled(page);
    const reloaded = await snapshot(page);
    assert.deepEqual(layoutRecord(reloaded.layout), layoutRecord(saved.layout), 'save/reload preserves every editable item/settings/scene');
    assert.deepEqual(reloaded.backups, backupBytes, 'full adoption backups survive reload byte-for-byte');
    assert.equal(reloaded.migrations.length, 0, 'reload never repeats migration');
    assertFixturesAndRoutes(reloaded, 'saved reload');
    await wiring(page); await page.waitForTimeout(200); await settled(page);
    for (const side of ['B', 'H']) for (const lighting of ['day', 'evening']) await capture(page, `02-adopted-wing-${side}-${lighting}`, side, lighting);
    await capture(page, '03-adopted-wiring-evening', 'H', 'evening', true);
    checks.push({ name: 'Weekday preserved layout; actual notice/Wiring counts; B/H explicit adoption; full durable backups; light/runtime/custom preservation; Undo/Redo; current-side no-op; exact save/reload',
      backupKeys: Object.keys(backupBytes), status: reloaded.status, userCustomId: 'OWNER-CUSTOM-LIGHT' });
    await primary.context.close();

    for (const failure of ['backup', 'save']) {
      const test = await newPage('controlled adoption ' + failure + ' failure'); await wiring(test.page);
      await test.page.evaluate(mode => {
        CHURCH_SIMULATOR.select('L63'); CHURCH_SIMULATOR.ui.tab = 'wiring';
        window.__denyAdoptionBackup = mode === 'backup'; window.__denyAdoptionSave = mode === 'save';
      }, failure);
      const initial = await snapshot(test.page);
      await test.page.locator('[data-act=wing-adopt][data-side=B]').click();
      const failed = await snapshot(test.page);
      assertUnchanged(failed, initial, 'controlled ' + failure + ' failure');
      assert.equal(failed.stored, initial.stored, failure + ': durable current layout bytes unchanged');
      assert(failed.attempts.at(-1).error, failure + ': adoption reports failure');
      assert.match(await test.page.locator('#toast').innerText(), /Could not apply wing B review/);
      if (failure === 'backup') assert.deepEqual(failed.backups, initial.backups, 'failed backup creates no partial record');
      else {
        assert.equal(Object.keys(failed.backups).length, Object.keys(initial.backups).length + 1, 'save rollback retains durable full backup');
        const backup = Object.values(failed.backups).at(-1);
        assert.deepEqual(layoutRecord(JSON.parse(backup)), layoutRecord(initial.layout), 'save failure retains complete recovery export');
      }
      await test.page.screenshot({ path: path.join(out, `04-${failure}-failure-wiring.png`) });
      checks.push({ name: 'Controlled ' + failure + ' failure', completeLayoutAndHistoryUnchanged: true, failureMessage: failed.attempts.at(-1).error });
      await test.context.close();
    }

    const conflictSeed = plain(seed);
    conflictSeed.items.push({ ...plain(seed.items.find(it => it.id === 'F244')), id: 'F-WING-B-3', name: 'Owner fan at reserved ID',
      pos: [12, 4, -6], hidden: false, note: 'Unrelated owner fan: never overwrite this record.' });
    const conflict = await newPage('reserved-ID conflict', conflictSeed); await wiring(conflict.page);
    const conflictBefore = await snapshot(conflict.page);
    assert.deepEqual(conflictBefore.status.sides.find(s => s.side === 'B').conflictIds, ['F-WING-B-3']);
    assert.equal(await conflict.page.locator('[data-act=wing-adopt][data-side=B]').isDisabled(), true, 'conflicting B button disabled');
    assert.equal(await conflict.page.locator('[data-act=wing-adopt][data-side=H]').isDisabled(), false, 'independent H remains available');
    assert.match(await conflict.page.locator('#simBody').innerText(), /Adoption is blocked.*F-WING-B-3/);
    await conflict.page.locator('[data-act=wing-adopt][data-side=B]').evaluate(el => { el.disabled = false; el.click(); });
    const conflictAfter = await snapshot(conflict.page);
    assertUnchanged(conflictAfter, conflictBefore, 'forced reserved-ID UI action');
    assert.deepEqual(conflictAfter.attempts, conflictBefore.attempts, 'UI blocks conflicting action before API');
    const rejected = await conflict.page.evaluate(() => { try { CHURCH_SIMULATOR.adoptWingReview('B'); return null; } catch (error) { return error.message; } });
    assert.match(rejected, /Reserved IDs/);
    const apiRejected = await snapshot(conflict.page);
    assertUnchanged(apiRejected, conflictBefore, 'reserved-ID API rejection');
    assert.deepEqual(apiRejected.backups, conflictBefore.backups, 'conflict rejection creates no backup or mutation');
    await conflict.page.screenshot({ path: path.join(out, '05-reserved-id-conflict-wiring.png') });
    checks.push({ name: 'Reserved-ID conflict blocks UI and API while H remains available', conflictingIds: ['F-WING-B-3'], completeOwnerRecordRetained: true });
    await conflict.context.close();

    assert.deepEqual(errors, [], 'zero desktop browser console/page errors');
    assert.deepEqual(fingerprints(), sourceSha256, 'all viewer/test inputs stayed frozen throughout verification');
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ status: 'PASS', generatedAt: new Date().toISOString(), browser: browser.version(), headed: process.env.HEADED === '1',
      desktopViewport: [1600, 1000], baselinePath, checks, frames, errors, warnings, sourceSha256,
      ignoredCalculatedField: 'analysis-derived microphone feedbackMargin only; all editable equipment fields/settings/custom scenes are compared.',
      limitations: ['Isolated Chrome contexts never access the user profile.', 'Screenshots show desktop GPU rendering and UI behavior, not physical concealment or commissioning measurements.',
        'Lighting/air/noise/speech, support, product data and electrical construction approvals remain on ENGINEERING HOLD. No acceptance threshold is changed.'] }, null, 2) + '\n');
    console.log(`PASS: explicit B/H wing adoption, durable full backups, preservation, Undo/Redo, reload, storage rollback and ID-conflict blocking; ${frames.length} desktop day/evening frames.`);
  } catch (error) {
    fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ generatedAt: new Date().toISOString(), error: error.stack, checks, frames, errors, warnings, sourceSha256 }, null, 2) + '\n');
    if (currentPage && !currentPage.isClosed()) await currentPage.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
