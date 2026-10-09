/* Actual desktop Chrome startup migration, backup, reload, UI import/undo,
 * downloads and visual evidence. Playwright owns isolated temporary storage.
 * Run: PLAYWRIGHT_MODULE=$PWD/web/node_modules/playwright HEADED=1 \
 *      node scripts/verify_wing_review_browser.cjs [evidence-directory]
 * Add --storage-only while final equipment geometry is under review.
 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { groups, edits, plain, frozenBaseline, baselinePath } = require('./verify_wing_review.cjs');
const { root, sources } = require('./lib/study_model.cjs');
const storageOnly = process.argv.includes('--storage-only');
const outputArgument = process.argv.slice(2).find(arg => !arg.startsWith('--'));
const out = outputArgument ? path.resolve(outputArgument) : path.join(root, 'review/wing-options-2026-10-09/verification/desktop');
fs.mkdirSync(out, { recursive: true });
const key = 'thachbi.simulator.v1', backupKey = key + '.before-wing-review';
const url = 'file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const fingerprintPaths = [...new Set([...sources, 'Thach_Bi_Viewer/OPEN_CHURCH.html', 'Thach_Bi_Viewer/simulator/ui.js', 'scripts/verify_wing_review.cjs', 'scripts/verify_wing_review_browser.cjs', baselinePath])];
const fingerprints = () => Object.fromEntries(fingerprintPaths.map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
// analysis.js writes a calculated feedbackMargin into microphone records after
// startup/import. It is not an editable equipment field or migration input.
const equipmentRecords = items => plain(items).map(it => { delete it.feedbackMargin; return it; });
const layoutRecord = layout => { const copy = plain(layout); delete copy.savedAt; copy.items = equipmentRecords(copy.items); return copy; };

(async () => {
  const sourceSha256 = fingerprints(), baseline = frozenBaseline(), errors = [], warnings = [], storageChecks = [], frames = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1', args: ['--allow-file-access-from-files'] });
  let currentPage;
  try {
    async function newPage(name, seed = null, denyBackup = false) {
      const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
      const page = await context.newPage(); currentPage = page;
      page.on('pageerror', error => errors.push({ name, message: error.message }));
      page.on('console', message => {
        if (message.type() === 'error') errors.push({ name, message: message.text() });
        if (message.type() === 'warning') {
          const existing = warnings.find(warning => warning.name === name && warning.message === message.text());
          if (existing) existing.count++; else warnings.push({ name, message: message.text(), count: 1 });
        }
      });
      await page.addInitScript(({ layout, storageKey, blockedBackup }) => {
        const marker = 'test.wing-review.seeded';
        if (layout && !localStorage.getItem(marker)) {
          localStorage.setItem(storageKey, JSON.stringify(layout));
          localStorage.setItem(marker, 'yes');
        }
        window.__wingMigrationCalls = [];
        let design;
        Object.defineProperty(window, 'CHURCH_SIM_DESIGN', {
          configurable: true, get() { return design; }, set(value) {
            design = value;
            const original = value.upgradeWingReview;
            value.upgradeWingReview = function(items, recommended) {
              const input = JSON.parse(JSON.stringify(items));
              const output = original(items, recommended);
              window.__wingMigrationCalls.push({ input, output: JSON.parse(JSON.stringify(output)) });
              return output;
            };
          }
        });
        if (blockedBackup) {
          const original = Storage.prototype.setItem;
          Storage.prototype.setItem = function(k, v) {
            if (k === blockedBackup) throw new Error('Controlled test: backup storage unavailable');
            return original.call(this, k, v);
          };
        }
      }, { layout: seed, storageKey: key, blockedBackup: denyBackup ? backupKey : null });
      await page.goto(url);
      await settled(page);
      await page.evaluate(() => { church.pause(); church.setLighting('day'); church.render(); });
      return { context, page };
    }
    async function settled(page) {
      await page.waitForFunction(() => window.church?.ready && window.CHURCH_SIMULATOR?.ready, null, { timeout: 180000 });
      await page.waitForFunction(() => CHURCH_SIMULATOR.analysis.results.seats && !CHURCH_SIMULATOR.analysis.busy, null, { timeout: 180000 });
    }
    async function snapshot(page) {
      return page.evaluate(({ storageKey, beforeKey }) => ({
        layout: JSON.parse(JSON.stringify(CHURCH_SIMULATOR.exportLayout())),
        revision: CHURCH_SIM_DESIGN.wingReviewRevision,
        calls: window.__wingMigrationCalls,
        backup: localStorage.getItem(beforeKey), stored: localStorage.getItem(storageKey),
        fixtureTypes: [...CHURCH_SIMULATOR.fixtures].map(([id, fixture]) => [id, fixture.type.id])
      }), { storageKey: key, beforeKey: backupKey });
    }
    function assertFixtureTypes(state, message) {
      assert.equal(state.fixtureTypes.length, state.layout.items.length, message + ': all fixtures instantiated');
      for (const [id, type] of state.fixtureTypes) assert.equal(type, state.layout.items.find(it => it.id === id).type, message + ': actual cached fixture type ' + id);
    }
    function assertStartup(state, seed, blockedSides = [], editedNaveIds = []) {
      assert.equal(state.calls.length, 1, 'one conservative startup migration');
      assert.deepEqual(equipmentRecords(state.calls[0].input), seed.items, 'startup received exact frozen/user item records');
      const backup = JSON.parse(state.backup);
      assert.deepEqual(backup.items, seed.items, 'durable browser backup precedes migration');
      assert.deepEqual(backup.customScenes, seed.customScenes, 'custom scenes retained in backup');
      assert.equal(backup.scene, seed.scene, 'scene label retained in backup');
      for (const [setting, value] of Object.entries(seed.settings)) assert.deepEqual(backup.settings[setting], value, 'backup setting retained ' + setting);
      assert.equal(state.layout.settings.wingReviewRevision, state.revision, 'revision saved after backed-up migration');
      assert.equal(state.layout.scene, seed.scene, 'migration retains user scene label');
      assert.deepEqual(state.layout.customScenes, seed.customScenes, 'migration retains user custom scenes');
      for (const [setting, value] of Object.entries(seed.settings)) assert.deepEqual(state.layout.settings[setting], value, 'migration retains user setting ' + setting);
      const blockedIds = new Set(blockedSides.flatMap(side => groups[side]));
      const reviewIds = new Set([...groups.B, ...groups.H, ...groups.nave]);
      const actualItems = equipmentRecords(state.layout.items);
      for (const item of seed.items) {
        const actual = actualItems.find(it => it.id === item.id);
        if (!reviewIds.has(item.id) || blockedIds.has(item.id) || editedNaveIds.includes(item.id)) assert.deepEqual(actual, item, 'startup exact user preservation ' + item.id);
        else if (groups.nave.includes(item.id)) assert.deepEqual(actual, { ...item, hidden: false, on: false }, 'optional concept visible but off ' + item.id);
        else {
          const raw = state.calls[0].output.find(it => it.id === item.id);
          for (const [field, value] of Object.entries(raw)) assert.deepEqual(actual[field], value, 'actual normalized migration field ' + item.id + '/' + field);
          assert.equal(actual.type, item.id.startsWith('L') ? 'chandelier6Reading' : 'fanWall');
        }
      }
      for (const side of ['B', 'H']) for (const id of groups.appended.filter(id => id.includes('-' + side + '-'))) {
        const actual = actualItems.find(it => it.id === id), existing = seed.items.find(it => it.id === id);
        if (existing) assert.deepEqual(actual, existing, 'owner reserved-ID collision survives ' + id);
        else {
          assert.equal(Boolean(actual), !blockedSides.includes(side), 'additions respect whole-wing preservation ' + id);
          if (actual) assert.equal(actual.circuit, 'F5');
        }
      }
      assert.equal(new Set(actualItems.map(it => it.id)).size, actualItems.length, 'no duplicate IDs after browser migration');
      assertFixtureTypes(state, 'startup');
    }
    async function reloadPreserved(page, before) {
      await page.reload(); await settled(page);
      const after = await snapshot(page);
      assert.equal(after.calls.length, 0, 'saved review revision prevents repeat migration on reload');
      assert.equal(after.backup, before.backup, 'original backup bytes survive reload');
      assert.deepEqual(layoutRecord(after.layout), layoutRecord(before.layout), 'exact editable layout survives reload');
      assertFixtureTypes(after, 'reload');
      return after;
    }

    const untouched = await newPage('untouched baseline', baseline);
    let state = await snapshot(untouched.page); assertStartup(state, baseline);
    fs.writeFileSync(path.join(out, 'browser-before-wing-review.json'), state.backup + '\n');
    state = await reloadPreserved(untouched.page, state);
    storageChecks.push({ name: 'untouched baseline startup and reload', migrationCount: 1, exactBackup: true, unchangedReload: true });
    await untouched.page.locator('#simulatorButton').click();
    await untouched.page.locator('#simPanel [data-tab=analysis]').click();
    const pending = untouched.page.waitForEvent('download');
    await untouched.page.locator('[data-act=export-json]').click();
    const download = await pending;
    assert.equal(download.suggestedFilename(), 'thach-bi-simulator-layout.json');
    const downloadedPath = path.join(out, 'browser-migrated-layout.json'); await download.saveAs(downloadedPath);
    const downloaded = JSON.parse(fs.readFileSync(downloadedPath, 'utf8'));
    assert.deepEqual(layoutRecord(downloaded), layoutRecord(state.layout), 'actual UI download preserves complete layout/settings/scenes');
    await untouched.page.locator('#simImportFile').setInputFiles(path.join(root, baselinePath));
    await untouched.page.waitForFunction(() => CHURCH_SIMULATOR.item('L63').type === 'projector36');
    assert.deepEqual(equipmentRecords((await snapshot(untouched.page)).layout.items), baseline.items, 'actual UI imports unchanged whole wings');
    await untouched.page.locator('#simPanel [data-act=undo]').click();
    await untouched.page.waitForFunction(() => CHURCH_SIMULATOR.item('L63').type === 'chandelier6Reading');
    assert.deepEqual(equipmentRecords((await snapshot(untouched.page)).layout.items), equipmentRecords(state.layout.items), 'actual UI undo restores migrated equipment');
    await untouched.page.locator('#simPanel [data-act=redo]').click();
    await untouched.page.waitForFunction(() => CHURCH_SIMULATOR.item('L63').type === 'projector36');
    assert.deepEqual(equipmentRecords((await snapshot(untouched.page)).layout.items), baseline.items, 'actual UI redo restores frozen baseline');
    await untouched.page.locator('#simPanel [data-act=undo]').click();
    const explicit = plain(baseline);
    edits.deleted(explicit.items, 'L63'); edits.moved(explicit.items, 'F243'); edits.annotated(explicit.items, 'F244');
    const explicitPath = path.join(out, 'browser-explicit-edited-import.json'); fs.writeFileSync(explicitPath, JSON.stringify(explicit, null, 2) + '\n');
    await untouched.page.locator('#simImportFile').setInputFiles(explicitPath);
    await untouched.page.waitForFunction(() => !CHURCH_SIMULATOR.item('L63'));
    assert.deepEqual(equipmentRecords((await snapshot(untouched.page)).layout.items), explicit.items, 'UI import preserves deletion/move/note and whole old wings');
    await untouched.page.evaluate(() => CHURCH_SIMULATOR.saveNow());
    const imported = await snapshot(untouched.page);
    await reloadPreserved(untouched.page, imported);
    storageChecks.push({ name: 'actual download, file import, undo, redo, edited import and reload', preciseEquipmentPreservation: true, originalBackupRetained: true });
    await untouched.context.close();

    const changed = plain(baseline);
    edits.renamed(changed.items, 'L63'); edits.hidden(changed.items, 'F241'); edits.deleted(changed.items, 'L68'); edits.moved(changed.items, 'F243'); edits.annotated(changed.items, 'F244');
    edits.annotated(changed.items, 'L1');
    changed.items.push({ ...plain(changed.items.find(it => it.id === 'L1')), id: 'OWNER-CUSTOM-LIGHT', name: 'Owner custom fixture', pos: [24, 4, -5.8], note: 'Keep this custom item and note.' });
    changed.customScenes.push({ name: 'Owner quiet review', items: { L1: { on: false, dim: 0.37 } } });
    const customized = await newPage('edited user layout', changed);
    const customState = await snapshot(customized.page); assertStartup(customState, changed, ['B', 'H'], ['F244']);
    await reloadPreserved(customized.page, customState);
    storageChecks.push({ name: 'saved customized whole wings and unrelated/custom/scene/notes', blockedWings: ['B', 'H'], addedWingFans: 0, unchangedReload: true });
    await customized.context.close();

    const collision = plain(baseline);
    collision.items.push({ ...plain(baseline.items.find(it => it.id === 'F244')), id: 'F-WING-B-3', name: 'Owner fan with reserved ID', pos: [12, 4, -6], note: 'This is an unrelated owner item, not a wing fan.' });
    const colliding = await newPage('reserved-ID collision', collision);
    const collisionState = await snapshot(colliding.page); assertStartup(collisionState, collision, ['B']);
    await reloadPreserved(colliding.page, collisionState);
    storageChecks.push({ name: 'reserved appended-ID collision', blockedWings: ['B'], unchangedOwnerItem: true, oppositeWingMigrated: true, unchangedReload: true });
    await colliding.context.close();

    const unavailable = await newPage('backup unavailable', baseline, true);
    const denied = await snapshot(unavailable.page);
    assert.equal(denied.calls.length, 0, 'no migration when durable backup fails');
    assert.equal(denied.backup, null, 'no partial backup claimed');
    assert.equal(denied.layout.settings.wingReviewRevision, '', 'unapplied revision remains pending');
    assert.deepEqual(equipmentRecords(denied.layout.items), baseline.items, 'backup failure preserves all equipment');
    assertFixtureTypes(denied, 'backup failure');
    assert(warnings.some(warning => warning.name === 'backup unavailable' && warning.message.includes('Controlled test: backup storage unavailable')), 'controlled backup failure is visible');
    storageChecks.push({ name: 'durable backup failure', migrationSkipped: true, fullEquipmentRetained: true, revisionPending: true });
    await unavailable.context.close();

    if (!storageOnly) {
      // Only navigation, display lighting, roof/seating and camera settings are
      // permitted in the visual phase; editable equipment is captured first.
      const visual = await newPage('desktop visual review');
      await captureDesktopViews(visual.page, frames);
      await visual.context.close();
    }
    assert.deepEqual(errors, [], 'zero console/page errors');
    assert.deepEqual(fingerprints(), sourceSha256, 'viewer source stays frozen throughout browser verification');
    fs.writeFileSync(path.join(out, storageOnly ? 'storage-results.json' : 'results.json'), JSON.stringify({
      status: 'PASS', generatedAt: new Date().toISOString(), headed: process.env.HEADED === '1', browser: browser.version(),
      storageOnly, desktopViewport: [1600, 1000], storageChecks, frames, errors, warnings, sourceSha256,
      ignoredCalculatedField: 'analysis.js feedbackMargin on microphone records only; every editable equipment field is compared.',
      limitations: ['Chrome uses isolated temporary storage, never the user browser profile.', 'Undo/redo checks cover the engine equipment history; startup migrations are restored through the retained backup/import.', 'Screenshots and software checks cannot approve capacities, mounting, glare, concealment or construction.']
    }, null, 2) + '\n');
    console.log(`PASS: actual Chrome backup/reload/download/import/undo/redo and conservative saved-layout preservation${storageOnly ? '; visual evidence deferred.' : `; ${frames.length} desktop frames.`}`);
  } catch (error) {
    fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ generatedAt: new Date().toISOString(), error: error.stack, errors, warnings, storageChecks, frames, sourceSha256 }, null, 2) + '\n');
    if (currentPage && !currentPage.isClosed()) await currentPage.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

async function captureDesktopViews(page, frames) {
  const initial = await page.evaluate(() => {
    const SIM = CHURCH_SIMULATOR;
    const snapshot = JSON.parse(JSON.stringify(SIM.exportLayout())); delete snapshot.savedAt;
    window.__wingDisplayMutations = [];
    window.__wingOriginalMethods = {};
    for (const method of ['add', 'update', 'remove', 'duplicate', 'mirror', 'repeatBays', 'undo', 'redo', 'commit', 'applyScene', 'importLayout', 'resetDesign']) {
      window.__wingOriginalMethods[method] = SIM[method];
      SIM[method] = function() { window.__wingDisplayMutations.push(method); throw new Error('Visual review must not actuate or edit equipment: ' + method); };
    }
    CHURCH_PERFORMANCE.setMode('full');
    return { layout: snapshot, electrical: SIM.electrical.exportData(), history: SIM.state.history, future: SIM.state.future,
      floor: SIM.floorY(38.66, 11.95), originalOrbitFov: church.orbitCamera.fov };
  });
  assert.equal(initial.floor, -0.32, 'wing floor uses model finished level');
  const lights = initial.layout.items.filter(it => it.type === 'chandelier6Reading'), wingFans = initial.layout.items.filter(it => it.circuit === 'F5');
  assert.deepEqual(lights.map(it => it.id).sort(), [...groups.B, ...groups.H].filter(id => id.startsWith('L')).sort(), 'eight actual proposed chandeliers');
  assert.deepEqual(wingFans.map(it => it.id).sort(), [...groups.B, ...groups.H, ...groups.appended].filter(id => id.startsWith('F')).sort(), 'eight actual wing wall fans');
  assert.equal(initial.layout.items.filter(it => it.type === 'fanCeiling' && Math.abs(it.pos[2]) > 7.25).length, 0, 'four wing roof fans absent');
  const cameraChecks = [];
  const views = [];
  for (const side of ['B', 'H']) for (const eye of [1.1, 1.2, 1.65]) for (const lighting of ['day', 'evening']) {
    const sign = side === 'B' ? -1 : 1;
    views.push({ name: `wing-${side}-eye-${eye.toFixed(2)}-four-${lighting}`, kind: 'occupant', side, eye, blocks: 4, lighting, roof: true,
      pos: [38.66, -0.32 + eye, sign * 11.95], target: [43.95, 3.1, 0] });
  }
  for (const side of ['B', 'H']) for (const lighting of ['day', 'evening']) {
    const sign = side === 'B' ? -1 : 1;
    views.push({ name: `wing-${side}-seated-two-open-${lighting}`, kind: 'occupant', side, eye: 1.2, blocks: 2, lighting, roof: false,
      pos: [38.66, 0.88, sign * 11.95], target: [43.95, 3.1, 0] });
    views.push({ name: `wing-${side}-gable-four-${lighting}`, kind: 'gable', side, eye: 1.65, blocks: 4, lighting, roof: true,
      pos: [40.575, 1.33, sign * 7.6], target: [40.575, 3.55, sign * 13.06] });
    views.push({ name: `wing-${side}-overview-two-open-${lighting}`, kind: 'overview', side, blocks: 2, lighting, roof: false,
      pos: [40.575, 5.5, sign * 6], target: [40.575, 3, sign * 11] });
  }
  const contextViews = [
    { key: 'entrance-to-sanctuary', kind: 'entrance', eye: 1.1, pos: [5.8, 1.1, 0], target: [45.8, 4.5, 0] },
    { key: 'sanctuary-to-nave', kind: 'sanctuary', eye: 1.65, pos: [45.2, 2.4, 1.8], target: [9.5, 4, 0] },
    { key: 'choir-to-sanctuary', kind: 'choir', eye: 1.2, pos: [42.49, 0.88, 11.5], target: [44.5, 3.3, 0] },
    { key: 'exterior-wing-B', kind: 'exterior', eye: 1.65, pos: [31, -0.43, -21], target: [40.575, 4, -13.249] }
  ];
  for (const view of contextViews) for (const lighting of ['day', 'evening']) views.push({ ...view, name: `${view.key}-${lighting}`, blocks: lighting === 'day' ? 4 : 2, roof: true, lighting });
  try {
    for (const [index, view] of views.entries()) {
      const state = await page.evaluate(async row => {
        document.getElementById('seating' + row.blocks).click();
        const analysisMatchesReceivers = () => {
          const SIM = CHURCH_SIMULATOR, reported = SIM.analysis.results.seats?.seats, receivers = SIM.seats();
          return !SIM.analysis.busy && reported?.length === receivers.length && receivers.every((receiver, index) =>
            Object.keys(receiver).every(field => JSON.stringify(reported[index][field]) === JSON.stringify(receiver[field])));
        };
        // Seating refresh schedules an asynchronous recompute. Await the
        // active receiver coordinates so screenshots never retain the prior
        // seating layout's KPI footer during that normal transition.
        if (!analysisMatchesReceivers()) await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => { off(); reject(new Error('Active seating analysis did not settle in 180 seconds')); }, 180000);
          const off = CHURCH_SIMULATOR.on('analysis', () => {
            if (analysisMatchesReceivers()) { clearTimeout(timeout); off(); resolve(); }
          });
        });
        church.places['wing-review-camera'] = { title: row.name, note: 'Held design review viewpoint; camera coordinates in metres.', pos: row.pos, target: row.target, interior: row.kind !== 'exterior' };
        church.goTo('wing-review-camera', { mode: 'explore', instant: true });
        church.setRoof(row.roof); church.setLighting(row.lighting);
        // goTo's normal perspective is retained for every occupant view.
        // Overview positions are only display evidence, not occupied receivers.
        await new Promise(resolve => requestAnimationFrame(resolve));
        church.render(); church.camera.updateMatrixWorld(true);
        const SIM = CHURCH_SIMULATOR, T = SIM.THREE, camera = church.camera;
        const records = SIM.state.items.filter(it => it.type === 'chandelier6Reading' || it.circuit === 'F5').map(it => {
          const fixture = SIM.fixtures.get(it.id), p = new T.Vector3(...it.pos).project(camera);
          return { id: it.id, type: fixture.type.id, pos: it.pos, visible: fixture.root.visible, projected: p.toArray(), centerInFrustum: Math.abs(p.x) < 1 && Math.abs(p.y) < 1 && p.z > -1 && p.z < 1 };
        });
        const layout = JSON.parse(JSON.stringify(SIM.exportLayout())); delete layout.savedAt;
        return { camera: camera.position.toArray(), target: church.controls.target.toArray(), fov: camera.fov,
          ui: church.uiState(), floor: SIM.floorY(row.pos[0], row.pos[2]), records, layout,
          receiverCount: SIM.seats().length, history: SIM.state.history, future: SIM.state.future,
          analysisCoordinatesMatch: analysisMatchesReceivers(), reportedBlocks: Object.keys(SIM.analysis.results.seats.blocks),
          mutations: window.__wingDisplayMutations, preview: CHURCH_PERFORMANCE.stats(), render: church.renderStats(),
          drawingBuffer: [church.renderer.domElement.width, church.renderer.domElement.height] };
      }, view);
      // OrbitControls reconstructs coordinates through spherical arithmetic;
      // permit its sub-nanometre roundoff while retaining exact intended views.
      assert(state.camera.every((value, axis) => Math.abs(value - view.pos[axis]) < 1e-10), view.name + ': actual camera coordinates within 1e-10 m roundoff');
      assert.equal(state.ui.mode, 'explore'); assert.equal(state.ui.roof, view.roof); assert.equal(state.ui.lighting, view.lighting);
      assert.equal(state.receiverCount, 368, view.name + ': entire receiver set retained');
      assert.equal(state.analysisCoordinatesMatch, true, view.name + ': settled analysis uses the actual active receiver coordinates');
      if (view.eye !== undefined) assert(Math.abs(state.camera[1] - state.floor - view.eye) < 1e-9, view.name + ': stated eye height above actual local floor');
      assert.deepEqual(state.mutations, [], view.name + ': display actions never edit or actuate equipment');
      assert.deepEqual(layoutRecord(state.layout), layoutRecord(initial.layout), view.name + ': exact editable layout/settings/scenes retained');
      assert.deepEqual(state.history, initial.history); assert.deepEqual(state.future, initial.future);
      assert.equal(state.records.filter(it => it.type === 'chandelier6Reading' && it.visible).length, 8, 'eight chandeliers remain visible in the model');
      assert.equal(state.records.filter(it => it.type === 'fanWall' && it.visible).length, 8, 'eight wall fans remain visible in the model');
      if (view.kind === 'gable') {
        const sideRecords = state.records.filter(it => it.type === 'fanWall' && Math.sign(it.pos[2]) === (view.side === 'B' ? -1 : 1));
        assert.equal(sideRecords.length, 4);
        assert(sideRecords.every(it => it.centerInFrustum), view.name + ': four actual wall-fan centers lie within camera view');
      }
      const file = `${String(index + 1).padStart(2, '0')}-${view.name}.png`;
      await page.screenshot({ path: path.join(out, file) });
      frames.push({ ...view, file, ...state });
      // Store one layout hash per frame instead of repeating the complete model.
      frames[frames.length - 1].layoutSha256 = hash(JSON.stringify(layoutRecord(state.layout)));
      delete frames[frames.length - 1].layout;
      cameraChecks.push(view.name);
    }
    const finalElectrical = await page.evaluate(() => CHURCH_SIMULATOR.electrical.exportData());
    assert.deepEqual(finalElectrical, initial.electrical, 'camera/day/evening/roof/seating actions preserve complete electrical export');
    fs.writeFileSync(path.join(out, 'visual-inventory.json'), JSON.stringify({ lights, wingFans, optionalNaveFans: initial.layout.items.filter(it => groups.nave.includes(it.id)), cameraChecks,
      scope: 'Desktop display and actual camera evidence. Mesh visibility/frustum membership is not a full occlusion or all-hidden approval.',
      preservedModelAndElectrical: true }, null, 2) + '\n');
  } finally {
    await page.evaluate(() => {
      for (const [method, original] of Object.entries(window.__wingOriginalMethods || {})) CHURCH_SIMULATOR[method] = original;
      delete church.places['wing-review-camera'];
    });
  }
}
