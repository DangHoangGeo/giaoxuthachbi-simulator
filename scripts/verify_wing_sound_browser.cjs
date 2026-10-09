/* Held per-wing speaker and saints review in actual desktop Chrome. Playwright owns
 * isolated temporary profiles; no user browser storage is read or reset.
 * Run after source freeze: HEADED=1 node scripts/verify_wing_sound_browser.cjs
 * Ordinary file-origin artwork check: ORDINARY_FILE_ART_ONLY=1 HEADED=1
 * node scripts/verify_wing_sound_browser.cjs [separate-evidence-directory]
 * Optional first argument selects an evidence directory. PLAYWRIGHT_MODULE
 * can override the repository's bundled Playwright path.
 * Software/visual verification does not approve acoustic or physical design.
 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { loadStudyModel, root, sources } = require('./lib/study_model.cjs');
const { plain, frozenBaseline, baselinePath } = require('./verify_wing_review.cjs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(root, 'web/node_modules/playwright'));
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'review/wing-sound-2026-10-09/desktop');
const ordinaryFileArtOnly = process.env.ORDINARY_FILE_ART_ONLY === '1';
const storageKey = 'thachbi.simulator.v1', backupPrefix = storageKey + '.before-wing-sound-adoption.';
const artBackupPrefix = storageKey + '.before-wing-art-adoption.';
const url = pathToFileURL(path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html')).href;
const pair = { B: ['S275', 'S276'], H: ['S277', 'S278'] }, targetId = side => pair[side][1], retiredId = side => pair[side][0];
const soundIds = [...pair.B, ...pair.H];
const artPair = Object.fromEntries(['B','H'].map(side => [side, ['PETER','PAUL'].map(saint => `D-WING-${side}-${saint}`)]));
const artIds = [...artPair.B, ...artPair.H], artTypes = ['saintPeterPicture', 'saintPaulPicture'];
const artAssets = ['saint-peter-concept-v1.png', 'saint-paul-concept-v1.png'].map(name => 'Thach_Bi_Viewer/references/10-wing-saints/' + name);
const fields = ['type', 'circuit', 'mount', 'pos', 'yaw', 'tilt', 'mountYaw', 'anchorY', 'hidden', 'level', 'delayMs'];
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const fingerprintPaths = [...new Set([...sources, 'Thach_Bi_Viewer/OPEN_CHURCH.html', 'Thach_Bi_Viewer/simulator/ui.js', 'Thach_Bi_Viewer/simulator/simulator.css',
  ...artAssets, 'Thach_Bi_Viewer/wing-saint-textures.js', 'scripts/build_saint_textures.py', 'Thach_Bi_Viewer/references/10-wing-saints/README.md', 'Thach_Bi_Viewer/references/10-wing-saints/provenance.json',
  'scripts/lib/study_model.cjs', 'scripts/verify_wing_review.cjs', 'scripts/verify_wing_sound_browser.cjs', 'scripts/review_drawings_i18n.py', baselinePath])];
const fingerprints = () => Object.fromEntries(fingerprintPaths.map(file => [file, sha256(fs.readFileSync(path.join(root, file)))]));
const equipmentRecords = items => plain(items).map(it => { delete it.feedbackMargin; return it; });
const layoutRecord = layout => { const copy = plain(layout); delete copy.savedAt; copy.items = equipmentRecords(copy.items); return copy; };
const assertUnchangedLayout = (after, before, label) => assert.deepEqual(layoutRecord(after), layoutRecord(before), label + ': exact complete editable export');
fs.mkdirSync(out, { recursive: true });

function prepareSeeds() {
  const study = loadStudyModel();
  try {
    const SIM = study.SIM, current = plain(SIM.exportLayout());
    SIM.importLayout({ ...current, items: [...current.items.filter(it => !soundIds.includes(it.id)), ...frozenBaseline().items.filter(it => soundIds.includes(it.id))] }, { record: false });
    SIM.add({ ...plain(current.items.find(it => it.type === 'slimColumn' && !soundIds.includes(it.id))), id: 'OWNER-CUSTOM-SPEAKER', name: 'Owner custom speaker',
      pos: [26, 3.4, -7.07], on: false, level: -14, delayMs: 123, note: 'Keep this custom ID, position, on/off, gain, delay and note.' }, { record: false });
    SIM.update('L1', { note: 'Unrelated lighting note must survive speaker adoption.' }, { record: false });
    SIM.state.customScenes.push({ name: 'Owner spoken review', items: { S276: { on: false, level: -12 }, 'OWNER-CUSTOM-SPEAKER': { on: true, level: -13 } } });
    Object.assign(SIM.state.settings, { wingSoundRevision: '', mixerDb: -1, maintenance: 0.77, occupancy: 0.57, autoQuality: false });
    const untouched = plain(SIM.exportLayout()), edited = plain(untouched), deleted = plain(untouched);
    Object.assign(edited.items.find(it => it.id === 'S276'), { on: false, level: -13, note: 'Owner B speaker override and note.' });
    edited.items.find(it => it.id === 'S276').pos[0] += 0.12;
    edited.items.find(it => it.id === 'S278').delayMs += 0.25;
    edited.items.find(it => it.id === 'S278').note = 'Owner H speaker note retained verbatim.';
    deleted.items = deleted.items.filter(it => it.id !== 'S277');
    const artEdited = plain(edited);
    const peter = artEdited.items.find(it => it.id === artPair.B[0]);
    peter.pos[1] += 0.15; peter.on = false; peter.note = 'Owner picture height and note; explicit replacement must retain this note.';
    artEdited.items = artEdited.items.filter(it => it.id !== artPair.H[1]);
    const artConflict = plain(artEdited), conflictIndex = artConflict.items.findIndex(it => it.id === artPair.B[0]);
    artConflict.items[conflictIndex] = { ...plain(artConflict.items.find(it => it.id === 'L1')), id: artPair.B[0], name: 'Owner light at reserved picture ID',
      note: 'Unrelated owner light: a saints action must never overwrite this ID.' };
    return { untouched, edited, deleted, artEdited, artConflict };
  } finally { study.dispose(); }
}
function assertCounts(state, side, current, oldCount = 2) {
  const row = state.status.sides.find(s => s.side === side);
  assert.equal(row.current, current, side + ': current-content status');
  assert.deepEqual(row.counts, current ? { wallSpeakers: 1, pendantSpeakers: 0 } : { wallSpeakers: 0, pendantSpeakers: oldCount }, side + ': actual visible speaker forms');
  if (current) { assert.deepEqual(row.mismatchingIds, []); assert.deepEqual(row.obsoleteIds, []); }
}
function assertFixturesAndRoutes(state, label) {
  assert.equal(new Set(state.layout.items.map(it => it.id)).size, state.layout.items.length, label + ': unique equipment IDs');
  assert.equal(state.fixtures.length, state.layout.items.length, label + ': exactly one actual fixture per ID');
  for (const fixture of state.fixtures) {
    const item = state.layout.items.find(it => it.id === fixture.id);
    assert.equal(fixture.type, item.type, label + ': cached model type ' + item.id);
    assert.deepEqual(fixture.pos, item.pos, label + ': actual model position ' + item.id);
  }
  for (const id of soundIds) {
    const item = state.layout.items.find(it => it.id === id), component = state.electrical.components.find(c => c.id === id);
    if (!item) {
      assert(!component, label + ': retired component absent ' + id);
      assert(!state.electrical.routes.some(r => r.itemIds.includes(id)), label + ': no retired route references ' + id);
      continue;
    }
    assert(component, label + ': sound component present ' + id);
    assert.equal(component.type, item.type); assert.equal(component.circuit, item.circuit);
    assert.deepEqual(component.position, item.pos, label + ': electrical model position ' + id);
    if (item.hidden) continue;
    const drops = state.electrical.routes.filter(r => r.role === 'drop' && r.itemIds.includes(id));
    assert(drops.length, label + ': signal branch exists ' + id);
    for (const drop of drops) {
      assert.equal(drop.source, 'AV1', label + ': audio rack source ' + id);
      assert.equal(drop.kind, 'audio', label + ': signal rather than mains ' + id);
      assert.equal(drop.homeRun, true, label + ': individual home run ' + id);
      assert.deepEqual(drop.points.at(-1), item.pos, label + ': live route endpoint ' + id);
      assert(drop.points.flat().every(Number.isFinite), label + ': finite route vertices ' + id);
    }
  }
}
function assertUnchanged(after, before, label) {
  assert.deepEqual(layoutRecord(after.layout), layoutRecord(before.layout), label + ': full editable export unchanged');
  assert.deepEqual(after.history, before.history, label + ': history unchanged');
  assert.deepEqual(after.future, before.future, label + ': redo history unchanged');
  assert.equal(after.selectedId, before.selectedId, label + ': selection unchanged');
  assertFixturesAndRoutes(after, label);
}
function assertAdoption(after, before, side) {
  const prior = equipmentRecords(before.layout.items), next = equipmentRecords(after.layout.items), ids = new Set(pair[side]);
  for (const item of prior.filter(it => !ids.has(it.id))) assert.deepEqual(next.find(it => it.id === item.id), item, side + ': unrelated/custom equipment preserved ' + item.id);
  assert.deepEqual(next.map(it => it.id), prior.filter(it => it.id !== retiredId(side)).map(it => it.id), side + ': remaining stable-ID ordering preserved');
  // Missing raw source.hidden uses the simulator's false normalization default.
  const target = next.find(it => it.id === targetId(side)), old = prior.find(it => it.id === target.id), source = { hidden: false, ...after.sourceTargets[side] };
  for (const field of fields) assert.deepEqual(target[field], source[field], side + ': reviewed speaker field ' + field);
  assert.equal(target.on, old.on, side + ': retained target on/off override');
  assert.equal(target.note, old.note, side + ': retained target user note');
  assert(!next.some(it => it.id === retiredId(side)), side + ': old pendant ID retired');
  assert.deepEqual(after.layout.settings, before.layout.settings, side + ': all user settings preserved');
  assert.deepEqual(after.layout.customScenes, before.layout.customScenes, side + ': custom scenes preserved');
  assert.equal(after.layout.scene, before.layout.scene, side + ': scene label preserved');
  assert.equal(after.history.length, before.history.length + 1, side + ': one undoable transaction');
  assert.equal(after.history.at(-1).label, 'Use reviewed wing ' + side + ' speaker');
  assert.deepEqual(after.future, [], side + ': redo branch cleared');
  assertFixturesAndRoutes(after, 'adopted ' + side);
}

(async () => {
  const sourceSha256 = fingerprints(), seeds = prepareSeeds(), errors = [], warnings = [], checks = [], frames = [], routeChecks = [], artworkChecks = [];
  for (const [name, seed] of Object.entries(seeds)) fs.writeFileSync(path.join(out, `seed-${name}.json`), JSON.stringify(seed, null, 2) + '\n');
  let browser, currentPage;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1' });
    async function settled(page) {
      await page.waitForFunction(() => window.church?.ready && window.CHURCH_SIMULATOR?.ready, null, { timeout: 180000 });
      await page.waitForFunction(() => CHURCH_SIMULATOR.analysis.results.seats && !CHURCH_SIMULATOR.analysis.busy, null, { timeout: 180000 });
    }
    async function instrumentActions(page) {
      await page.evaluate(() => {
        if (window.__reviewActionsInstrumented) return;
        window.__reviewActionsInstrumented = true;
        church.pause(); church.setLighting('day'); church.render();
        const SIM = CHURCH_SIMULATOR, adopt = SIM.adoptWingSound;
        SIM.adoptWingSound = function(side) {
          try { const result = adopt(side); window.__soundAttempts.push({ side, result: JSON.parse(JSON.stringify(result)) }); return result; }
          catch (error) { window.__soundAttempts.push({ side, error: error.message }); throw error; }
        };
        const adoptArt = SIM.adoptWingArt;
        SIM.adoptWingArt = function(side) {
          try { const result = adoptArt(side); window.__artAttempts.push({ side, result: JSON.parse(JSON.stringify(result)) }); return result; }
          catch (error) { window.__artAttempts.push({ side, error: error.message }); throw error; }
        };
      });
    }
    async function newPage(name, seed = null) {
      const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } }), page = await context.newPage(); currentPage = page;
      page.on('pageerror', error => errors.push({ name, message: error.message }));
      page.on('console', message => {
        if (message.type() === 'error') errors.push({ name, message: message.text() });
        if (message.type() === 'warning') {
          const old = warnings.find(w => w.name === name && w.message === message.text());
          if (old) old.count++; else warnings.push({ name, message: message.text(), count: 1 });
        }
      });
      await page.addInitScript(({ initial, key, prefix, artPrefix }) => {
        if (!localStorage.getItem('test.wing-sound.seeded')) {
          if (initial) localStorage.setItem(key, JSON.stringify(initial)); localStorage.setItem('test.wing-sound.seeded', 'yes');
        }
        window.__soundAttempts = []; window.__soundMigrationCalls = []; window.__artAttempts = [];
        window.__denySoundBackup = false; window.__denySoundSave = false;
        window.__denyArtBackup = false; window.__denyArtSave = false;
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(k, v) {
          if (window.__denySoundBackup && k.startsWith(prefix)) throw new Error('Controlled test: speaker backup storage unavailable');
          if (window.__denySoundSave && k === key) throw new Error('Controlled test: adopted speaker layout storage unavailable');
          if (window.__denyArtBackup && k.startsWith(artPrefix)) throw new Error('Controlled test: saints backup storage unavailable');
          if (window.__denyArtSave && k === key) throw new Error('Controlled test: adopted saints layout storage unavailable');
          return originalSetItem.call(this, k, v);
        };
        let design;
        Object.defineProperty(window, 'CHURCH_SIM_DESIGN', { configurable: true, get() { return design; }, set(value) {
          design = value; const upgrade = value.upgradeWingSound;
          value.upgradeWingSound = function(items, recommended) {
            const input = JSON.parse(JSON.stringify(items)), output = upgrade(items, recommended);
            window.__soundMigrationCalls.push({ input, output: JSON.parse(JSON.stringify(output)) }); return output;
          };
        } });
      }, { initial: seed, key: storageKey, prefix: backupPrefix, artPrefix: artBackupPrefix });
      await page.goto(url); await settled(page); await instrumentActions(page);
      await page.waitForTimeout(850); await settled(page); return { context, page };
    }
    async function snapshot(page) {
      return page.evaluate(({ key, prefix, artPrefix, ids }) => {
        const SIM = CHURCH_SIMULATOR, D = CHURCH_SIM_DESIGN; SIM.electrical.rebuild();
        const data = SIM.electrical.exportData(), targets = Object.fromEntries(['B','H'].map(side => [side, D.wingSoundTargets(D.recommended(SIM.GEO, SIM), side)[0]]));
        return JSON.parse(JSON.stringify({ layout: SIM.exportLayout(), status: SIM.wingSoundStatus(), sourceTargets: targets, artStatus: SIM.wingArtStatus(),
          sourceArtTargets: Object.fromEntries(['B','H'].map(side => [side, D.wingArtTargets(D.recommended(SIM.GEO, SIM), side)])), artAttempts: window.__artAttempts,
          history: SIM.state.history, future: SIM.state.future, selectedId: SIM.state.selectedId, stored: localStorage.getItem(key),
          migrationBackup: localStorage.getItem(key + '.before-wing-sound-review'), migrations: window.__soundMigrationCalls, attempts: window.__soundAttempts,
          backups: Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith(prefix)).map(k => [k, localStorage.getItem(k)])),
          artBackups: Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith(artPrefix)).map(k => [k, localStorage.getItem(k)])),
          fixtures: [...SIM.fixtures].map(([id, fx]) => ({ id, type: fx.type.id, pos: fx.root.position.toArray(), visible: fx.root.visible })),
          electrical: { components: data.components.filter(c => ids.includes(c.id)), routes: data.routes.filter(r => r.itemIds.some(id => ids.includes(id))) } }));
      }, { key: storageKey, prefix: backupPrefix, artPrefix: artBackupPrefix, ids: soundIds });
    }
    async function wiring(page) {
      if (!await page.locator('#simPanel').isVisible()) await page.locator('#simulatorButton').click();
      await page.locator('#simPanel [data-tab=wiring]').click();
      await page.locator('[data-wing-review=sound]').scrollIntoViewIfNeeded();
    }
    async function lightingWalkthrough(page) {
      await wiring(page);
      const before = await snapshot(page);
      for (const step of [0,1,2,3]) await page.locator(`[data-act=electrical-step][data-step="${step}"]`).click();
      const stage = page.locator('.installation-review'), text = await stage.innerText();
      assert.match(text, /04 · Lighting routes and fittings/i);
      assert.match(text, /Review current per-seat lighting failures in the matching calculation report\./);
      assert.doesNotMatch(text, /4 dim seats|four dim seats/);
      assert.match(text, /Steps change the view only\./);
      await stage.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(out, '08-lighting-walkthrough-current-hold.png') });
      await page.locator('[data-act=electrical-step-stop]').click();
      assertUnchanged(await snapshot(page), before, 'lighting walkthrough remains read-only');
      checks.push({ name: 'Lighting walkthrough shows the current-report hold without a stale fixed seat count; start/end changes display only', text });
    }
    async function adoptThroughUI(page, side, before) {
      await page.locator(`[data-act=wing-sound-adopt][data-side=${side}]`).click();
      await page.waitForFunction(code => CHURCH_SIMULATOR.wingSoundStatus().sides.find(s => s.side === code).current, side);
      const after = await snapshot(page), attempt = after.attempts.at(-1), result = attempt.result;
      assert.equal(attempt.side, side); assert(result.backupKey, side + ': actual durable backup key');
      assert.deepEqual(result.changedIds, [targetId(side)]); assert.deepEqual(result.retiredIds, [retiredId(side)]);
      assert.equal(Object.keys(after.backups).length, Object.keys(before.backups).length + 1, side + ': separate full browser backup');
      assert.deepEqual(layoutRecord(JSON.parse(after.backups[result.backupKey])), layoutRecord(before.layout), side + ': backup is complete preceding export');
      assert.deepEqual(layoutRecord(JSON.parse(after.stored)), layoutRecord(after.layout), side + ': adoption saved durably');
      assertAdoption(after, before, side);
      fs.writeFileSync(path.join(out, `before-adopt-${side}.json`), after.backups[result.backupKey] + '\n');
      fs.writeFileSync(path.join(out, `after-adopt-${side}.json`), JSON.stringify(after.layout, null, 2) + '\n'); return after;
    }
    async function undoRedo(page, before, adopted, side) {
      await page.locator('#simPanel [data-act=undo]').click(); const undone = await snapshot(page);
      assert.deepEqual(layoutRecord(undone.layout), layoutRecord(before.layout), side + ': Undo restores retired ID and exact editable export');
      assertFixturesAndRoutes(undone, 'Undo ' + side);
      await page.locator('#simPanel [data-act=redo]').click(); const redone = await snapshot(page);
      assert.deepEqual(layoutRecord(redone.layout), layoutRecord(adopted.layout), side + ': Redo restores exact reviewed export');
      assert.deepEqual(redone.backups, adopted.backups, side + ': durable backups survive history actions');
      assertFixturesAndRoutes(redone, 'Redo ' + side); return redone;
    }
    async function sourceNoops(page) {
      await wiring(page);
      await page.evaluate(() => {
        const SIM = CHURCH_SIMULATOR;
        SIM.update('S276', { on: false, note: 'Current source geometry with an owner operating override.' }, { record: false });
        SIM.update('D-WING-B-PETER', { on: false, note: 'Current picture placement with an owner note.' }, { record: false });
        if (!SIM.saveNow()) throw new Error('Current-source preparation could not save.');
      });
      // The setup edits schedule the ordinary 700 ms autosave independently
      // of adoption. Drain it before testing strict no-op storage byte equality.
      await page.waitForTimeout(850); await settled(page);
      for (const kind of ['sound','art']) for (const side of ['B','H']) {
        const before = await snapshot(page), action = kind === 'sound' ? 'adoptWingSound' : 'adoptWingArt';
        assert.equal((kind === 'sound' ? before.status : before.artStatus).sides.find(s => s.side === side).current, true);
        const button = page.locator(`[data-act=wing-${kind}-adopt][data-side=${side}]`);
        assert.equal(await button.isDisabled(), true, kind + ' ' + side + ': current action is disabled');
        await button.evaluate(el => { el.disabled = false; el.click(); }); const forced = await snapshot(page);
        assertUnchanged(forced, before, 'forced current-source ' + kind + ' ' + side + ' UI action');
        assert.deepEqual(forced.attempts, before.attempts); assert.deepEqual(forced.artAttempts, before.artAttempts);
        const noOp = await page.evaluate(({ action, side }) => CHURCH_SIMULATOR[action](side), { action, side });
        assert.deepEqual(noOp, kind === 'sound' ? { backupKey: null, changedIds: [], retiredIds: [] } : { backupKey: null, changedIds: [] });
        const after = await snapshot(page); assertUnchanged(after, before, 'current-source ' + kind + ' ' + side + ' API');
        assert.deepEqual(after.backups, before.backups); assert.deepEqual(after.artBackups, before.artBackups); assert.equal(after.stored, before.stored, kind + ' ' + side + ': current action leaves durable layout bytes unchanged');
      }
      checks.push({ name: 'Fresh current sound/art actions are disabled and forced UI/API no-ops retain owner on/off, notes, exact layout, history and backup bytes' });
    }
    async function artwork(page, label) {
      await page.waitForFunction(ids => ids.every(id => {
        const fixture = CHURCH_SIMULATOR.fixtures.get(id); let loaded = false;
        fixture?.root.traverse(mesh => {
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
            if (material?.name === 'Simulator · saintPeterArt' || material?.name === 'Simulator · saintPaulArt') loaded ||= !!(material.map?.image?.complete && material.map.image.naturalWidth);
          }
        }); return loaded;
      }), artIds, { timeout: 30000 });
      const result = await page.evaluate(async ids => {
        const sourceMetadata = new Map();
        async function imageSource(src) {
          if (!sourceMetadata.has(src)) sourceMetadata.set(src, (async () => {
            const scheme = new URL(src).protocol;
            if (scheme !== 'data:') return { src, scheme, nativePayloadSha256: null };
            const [header, payload] = src.split(',');
            if (header !== 'data:image/png;base64') return { src: header + ',[payload omitted]', scheme, nativePayloadSha256: null };
            const bytes = Uint8Array.from(atob(payload), ch => ch.charCodeAt(0)), digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
            return { src: header + ',[native payload omitted]', scheme, nativePayloadSha256: [...digest].map(n => n.toString(16).padStart(2, '0')).join(''), nativePayloadBytes: bytes.length };
          })());
          return sourceMetadata.get(src);
        }
        return Promise.all(ids.map(async id => {
        const SIM = CHURCH_SIMULATOR, item = SIM.item(id), fixture = SIM.fixtures.get(id), maps = [];
        fixture.root.traverse(mesh => {
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
            if (!['Simulator · saintPeterArt', 'Simulator · saintPaulArt'].includes(material?.name)) continue;
            const texture = material.map, image = texture?.image;
            const position = mesh.geometry.getAttribute('position'), uv = mesh.geometry.getAttribute('uv');
            const bounds = new SIM.THREE.Box3().setFromBufferAttribute(position), size = bounds.getSize(new SIM.THREE.Vector3());
            maps.push({ materialName: material.name, materialUuid: material.uuid, mapUuid: texture?.uuid, colorSpace: texture?.colorSpace,
              srgbExpected: SIM.THREE.SRGBColorSpace, src: image?.currentSrc || image?.src, complete: image?.complete,
              naturalWidth: image?.naturalWidth, naturalHeight: image?.naturalHeight, width: image?.width, height: image?.height,
              geometry: { type: mesh.geometry.type, isBufferGeometry: mesh.geometry.isBufferGeometry, vertexCount: position.count, uvCount: uv?.count,
                finiteVertices: [...position.array].every(Number.isFinite), finiteUV: !!uv && [...uv.array].every(n => Number.isFinite(n) && n >= 0 && n <= 1),
                bounds: [bounds.min.toArray(), bounds.max.toArray()], extents: size.toArray() } });
          }
        });
        for (const map of maps) Object.assign(map, await imageSource(map.src));
        return { id, type: item.type, pos: item.pos, fixtureVisible: fixture.root.visible, maps };
        }));
      }, artIds);
      assert.equal(result.length, 4, label + ': four actual saints fixtures');
      for (const picture of result) {
        assert(artTypes.includes(picture.type)); assert.equal(picture.maps.length, 1, picture.id + ': one actual art-plane material');
        const map = picture.maps[0], asset = artAssets[picture.type === 'saintPeterPicture' ? 0 : 1];
        assert.equal(map.complete, true); assert.equal(map.naturalWidth, 1024); assert.equal(map.naturalHeight, 1536);
        assert.equal(map.width, 1024); assert.equal(map.height, 1536); assert.equal(map.colorSpace, map.srgbExpected);
        assert.equal(map.geometry.isBufferGeometry, true); assert.equal(map.geometry.finiteVertices, true); assert.equal(map.geometry.finiteUV, true);
        assert(map.geometry.vertexCount >= 4); assert.equal(map.geometry.uvCount, map.geometry.vertexCount);
        const extents = [...map.geometry.extents].sort((a,b) => a - b);
        for (let index = 0; index < 3; index++) assert(Math.abs(extents[index] - [0,1,1.5][index]) < 1e-6, picture.id + ': compiled art plane retains 1.00 × 1.50 m two-dimensional extents');
        assert(['file:', 'data:'].includes(map.scheme), picture.id + ': no external image URL');
        if (map.scheme === 'file:') assert.equal(map.src, pathToFileURL(path.join(root, asset)).href, picture.id + ': exact local native artwork URL');
        else {
          const native = fs.readFileSync(path.join(root, asset));
          assert.equal(map.nativePayloadSha256, sha256(native), picture.id + ': data URL preserves the exact native PNG bytes');
          assert.equal(map.nativePayloadBytes, native.length);
        }
      }
      assert.equal(new Set(result.map(p => p.maps[0].mapUuid)).size, 2, label + ': two source texture maps shared across four frames');
      for (const type of artTypes) {
        const matching = result.filter(p => p.type === type); assert.equal(matching.length, 2);
        assert.equal(new Set(matching.map(p => p.maps[0].mapUuid)).size, 1, type + ': each native map reused twice');
        assert.equal(new Set(matching.map(p => p.maps[0].materialUuid)).size, 1, type + ': material reused twice');
      }
      artworkChecks.push({ label, pictures: result, nativeImageCount: 2, renderedPictureCount: 4, noExternalImageURLs: true }); return result;
    }
    async function captureArt(page, side, lighting, observer = 'standing') {
      const before = await snapshot(page), pictures = await artwork(page, 'fresh ' + side + ' ' + observer + ' ' + lighting);
      const eyeHeight = { standing: 1.6, 'short-seated': 1.05, wheelchair: 1.1 }[observer];
      const display = await page.evaluate(async ({ side, lighting, ids, eyeHeight }) => {
        const SIM = CHURCH_SIMULATOR, T = SIM.THREE, items = ids.map(id => SIM.item(id));
        SIM.electrical.setMode('building'); SIM.electrical.setReviewFilter({ system: 'all', circuit: 'all', item: 'all', board: 'all' });
        SIM.ui.setOpen(false); CHURCH_PERFORMANCE.setMode('full'); church.pause();
        const target = new T.Vector3(); items.forEach(item => target.add(new T.Vector3(...item.pos))); target.multiplyScalar(1 / items.length);
        const root = SIM.fixtures.get(ids[0]).root; root.updateMatrixWorld(true);
        const normal = new T.Vector3(1, 0, 0).transformDirection(root.matrixWorld), camera = target.clone().addScaledVector(normal, 5.3);
        const floorY = SIM.floorY(camera.x, camera.z); camera.y = floorY + eyeHeight;
        church.places['wing-art-evidence'] = { title: 'Saint Peter and Saint Paul · concepts', note: 'Desktop picture review, not final artwork or fixing approval.',
          pos: camera.toArray(), target: target.toArray(), interior: true };
        church.goTo('wing-art-evidence', { mode: 'explore', instant: true }); church.setRoof(true); church.setLighting(lighting);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); church.render();
        return { camera: church.camera.position.toArray(), target: church.controls.target.toArray(), floorY, nominalEyeHeight: eyeHeight, ui: church.uiState(), pictures: items.map(item => {
          const point = new T.Vector3(...item.pos).project(church.camera);
          let texture; SIM.fixtures.get(item.id).root.traverse(mesh => {
            for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) if (['Simulator · saintPeterArt', 'Simulator · saintPaulArt'].includes(material?.name)) texture = material.map;
          });
          const gpu = church.renderer.properties.get(texture);
          return { id: item.id, pos: item.pos, visible: SIM.fixtures.get(item.id).root.visible, projected: point.toArray(), textureVersion: texture.version,
            uploadedVersion: gpu.__version, hasGPUTexture: !!gpu.__webglTexture,
            centerInFrustum: Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && point.z > -1 && point.z < 1 };
        }), receiverCount: SIM.seats().length, drawingBuffer: [church.renderer.domElement.width, church.renderer.domElement.height] };
      }, { side, lighting, ids: artPair[side], eyeHeight });
      const file = `00-fresh-saints-${side}-${observer}-${lighting}.png`; await page.screenshot({ path: path.join(out, file) });
      const after = await snapshot(page); assertUnchanged(after, before, file + ': art-facing display'); assert.equal(display.receiverCount, 368);
      for (const picture of display.pictures) {
        assert.equal(picture.visible, true); assert.equal(picture.centerInFrustum, true);
        assert.equal(picture.hasGPUTexture, true, picture.id + ': artwork uploaded to an actual GPU texture');
        assert.equal(picture.uploadedVersion, picture.textureVersion, picture.id + ': GPU texture contains the current native image');
      }
      frames.push({ file, side, lighting, observer, category: 'fresh saints art', ...display, actualLoadedMaps: pictures.filter(p => artPair[side].includes(p.id)), layoutSha256: sha256(JSON.stringify(layoutRecord(after.layout))) });
    }
    async function adoptArt(page, side, before) {
      await page.locator(`[data-act=wing-art-adopt][data-side=${side}]`).click();
      await page.waitForFunction(code => CHURCH_SIMULATOR.wingArtStatus().sides.find(s => s.side === code).current, side);
      const after = await snapshot(page), result = after.artAttempts.at(-1).result, oldItems = equipmentRecords(before.layout.items), newItems = equipmentRecords(after.layout.items);
      assert(result.backupKey); assert.deepEqual(result.changedIds, artPair[side]);
      assert.deepEqual(layoutRecord(JSON.parse(after.artBackups[result.backupKey])), layoutRecord(before.layout), side + ': saints backup contains exact complete previous export');
      assert.equal(Object.keys(after.artBackups).length, Object.keys(before.artBackups).length + 1);
      assert.deepEqual(layoutRecord(JSON.parse(after.stored)), layoutRecord(after.layout), side + ': saints adoption saved durably');
      for (const item of oldItems.filter(it => !artPair[side].includes(it.id))) assert.deepEqual(newItems.find(it => it.id === item.id), item, side + ': unrelated item preserved by saints action ' + item.id);
      for (const source of after.sourceArtTargets[side]) {
        const item = newItems.find(it => it.id === source.id), prior = oldItems.find(it => it.id === source.id);
        for (const field of ['type','mount','pos','yaw','mountYaw','hidden']) assert.deepEqual(item[field], source[field], side + ': reviewed saints field ' + field);
        if (prior?.note) assert.equal(item.note, prior.note, side + ': saints user note retained');
      }
      assert.deepEqual(after.layout.settings, before.layout.settings); assert.deepEqual(after.layout.customScenes, before.layout.customScenes); assert.equal(after.layout.scene, before.layout.scene);
      assert.equal(after.history.length, before.history.length + 1); assert.equal(after.history.at(-1).label, 'Use reviewed wing ' + side + ' saints'); assert.deepEqual(after.future, []);
      assertFixturesAndRoutes(after, 'saints adoption ' + side);
      fs.writeFileSync(path.join(out, `before-adopt-saints-${side}.json`), after.artBackups[result.backupKey] + '\n');
      fs.writeFileSync(path.join(out, `after-adopt-saints-${side}.json`), JSON.stringify(after.layout, null, 2) + '\n');
      await page.locator('#simPanel [data-act=undo]').click(); const undone = await snapshot(page); assertUnchangedLayout(undone.layout, before.layout, side + ': saints Undo');
      assertFixturesAndRoutes(undone, 'saints Undo ' + side);
      await page.locator('#simPanel [data-act=redo]').click(); const redone = await snapshot(page); assertUnchangedLayout(redone.layout, after.layout, side + ': saints Redo');
      assert.deepEqual(redone.artBackups, after.artBackups); assertFixturesAndRoutes(redone, 'saints Redo ' + side); return redone;
    }
    async function capture(page, name, side, lighting) {
      const before = await snapshot(page);
      const display = await page.evaluate(async ({ side, lighting }) => {
        const SIM = CHURCH_SIMULATOR, sign = side === 'B' ? -1 : 1, id = side === 'B' ? 'S276' : 'S278';
        SIM.electrical.setMode('building'); SIM.electrical.setReviewFilter({ system: 'all', circuit: 'all', item: 'all', board: 'all' });
        SIM.ui.setOpen(false); CHURCH_PERFORMANCE.setMode('full'); church.pause();
        const target = [...SIM.item(id).pos];
        church.places['wing-sound-evidence'] = { title: 'Held wall-speaker review', note: 'Desktop model view, not installation approval.',
          pos: [target[0] - 3.2, 3.2, target[2] - sign * 5.2], target, interior: true };
        church.goTo('wing-sound-evidence', { mode: 'explore', instant: true }); church.setRoof(true); church.setLighting(lighting);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); church.render();
        const point = new SIM.THREE.Vector3(...SIM.item(id).pos).project(church.camera);
        return { camera: church.camera.position.toArray(), target: church.controls.target.toArray(), ui: church.uiState(), speaker: { id, pos: SIM.item(id).pos, projected: point.toArray(),
          visible: SIM.fixtures.get(id).root.visible, centerInFrustum: Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && point.z > -1 && point.z < 1 },
          status: SIM.wingSoundStatus(), receiverCount: SIM.seats().length, drawingBuffer: [church.renderer.domElement.width, church.renderer.domElement.height] };
      }, { side, lighting });
      const file = name + '.png'; await page.screenshot({ path: path.join(out, file) }); const after = await snapshot(page);
      assert.deepEqual(layoutRecord(after.layout), layoutRecord(before.layout), name + ': day/evening/camera retains complete editable export');
      assert.deepEqual(after.history, before.history); assert.deepEqual(after.future, before.future);
      assert.equal(display.receiverCount, 368); assert.equal(display.speaker.visible, true); assert.equal(display.speaker.centerInFrustum, true);
      frames.push({ file, side, lighting, ...display, layoutSha256: sha256(JSON.stringify(layoutRecord(after.layout))) });
    }
    async function reviewRoutes(page, side) {
      const before = await snapshot(page), id = targetId(side); await wiring(page);
      await page.locator('[data-act=electrical-review-reset]').click();
      await page.locator('[data-act=electrical-system][data-system=sound]').click();
      await page.locator(`[data-act=electrical-isolate-item][data-id=${id}]`).first().click();
      await page.waitForFunction(itemId => CHURCH_SIMULATOR.electrical.view.item === itemId && document.querySelector(`.electrical-plan circle[data-id="${itemId}"]`), id);
      const state = await page.evaluate(() => {
        const SIM = CHURCH_SIMULATOR, E = SIM.electrical, selection = E.reviewSelection(); church.render();
        return { view: { ...E.view }, selection, visibleFixtureIds: [...SIM.fixtures].filter(([,f]) => f.root.visible).map(([id]) => id),
          planIds: [...document.querySelectorAll('.electrical-plan circle[data-id]')].map(el => el.dataset.id),
          planRouteIds: [...document.querySelectorAll('.electrical-plan polyline[data-electrical-id]')].map(el => el.dataset.electricalId),
          routeModels: E.layer.children.filter(o => o.userData.routeShape && o.visible).map(o => ({ id: o.userData.electricalId, points: JSON.parse(o.userData.routeShape)[1] })),
          routes: E.routes.filter(r => selection.routeIds.includes(r.id)) };
      });
      assert.deepEqual(state.selection.itemIds, [id]); assert.deepEqual(state.visibleFixtureIds, [id]); assert.deepEqual(state.planIds, [id]);
      assert(state.selection.sourceIds.includes('AV1') && state.selection.sourceIds.includes('DB1'), side + ': upstream audio rack and supply context');
      assert.deepEqual(state.planRouteIds.sort(), [...state.selection.routeIds].sort(), side + ': 2D route IDs match selection');
      assert.deepEqual(state.routeModels.map(r => r.id).sort(), [...state.selection.routeIds].sort(), side + ': actual 3D route IDs match selection');
      for (const model of state.routeModels) assert.deepEqual(model.points, state.routes.find(r => r.id === model.id).points, side + ': actual mesh uses exact route vertices');
      const drop = state.routes.find(r => r.role === 'drop' && r.itemIds.includes(id)); assert(drop);
      await page.locator(`[data-act=electrical-select][data-electrical-id="${drop.id}"]`).last().click();
      await page.getByText('Route vertices · metres', { exact: true }).click();
      assert.equal(await page.locator('details .electrical-table tbody tr').count(), drop.points.length, side + ': complete visible route vertex table');
      const projected = await page.locator(`.electrical-plan polyline[data-electrical-id="${drop.id}"]`).getAttribute('points');
      assert.equal(projected, drop.points.map(p => [32 + (p[0] + 1) * 8.4, 154 + p[2] * 8.4].join(',')).join(' '), side + ': 2D plan shares exact source vertices');
      await page.locator('.electrical-plan').scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(out, `03-sound-${side}-3d-2d-route.png`) });
      const after = await snapshot(page); assert.deepEqual(layoutRecord(after.layout), layoutRecord(before.layout), side + ': route review never edits equipment');
      assert.deepEqual(after.history, before.history); assert.deepEqual(after.future, before.future);
      routeChecks.push({ side, id, ...state, dropId: drop.id, vertexRows: drop.points.length, exact2DAnd3DVertices: true });
    }

    if (ordinaryFileArtOnly) {
      const test = await newPage('ordinary file-origin native artwork');
      await artwork(test.page, 'ordinary file-origin fresh defaults'); await captureArt(test.page, 'B', 'day');
      assert.deepEqual(errors, [], 'ordinary Chrome file profile has no console/page/native-image upload errors');
      assert.deepEqual(fingerprints(), sourceSha256, 'ordinary file verification source stayed frozen');
      fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ status: 'PASS', generatedAt: new Date().toISOString(), browser: browser.version(),
        headed: process.env.HEADED === '1', desktopViewport: [1600,1000], mode: 'ordinary file-origin artwork', specialFileAccessFlag: false,
        frames, artworkChecks, errors, warnings, sourceSha256, limitations: ['Isolated Chrome profile never reads user browser storage.', 'Native artwork loading and an actual GPU upload/render are software evidence only.'] }, null, 2) + '\n');
      console.log('PASS: ordinary Chrome file profile, no special file flag, four actual native local picture maps and an art-facing GPU render.');
      await test.context.close(); return;
    }
    const fresh = await newPage('fresh default'); let state = await snapshot(fresh.page);
    assertCounts(state, 'B', true); assertCounts(state, 'H', true); assert.equal(state.migrations.length, 0);
    assertFixturesAndRoutes(state, 'fresh default');
    for (const side of ['B','H']) { const row = state.artStatus.sides.find(s => s.side === side); assert.equal(row.current, true); assert.deepEqual(row.counts, { pictures: 2 }); assert.deepEqual(row.conflictIds, []); }
    await artwork(fresh.page, 'fresh defaults');
    for (const side of ['B','H']) for (const observer of ['standing','short-seated','wheelchair']) for (const lighting of ['day','evening']) await captureArt(fresh.page, side, lighting, observer);
    await lightingWalkthrough(fresh.page);
    await sourceNoops(fresh.page);
    checks.push({ name: 'Fresh source defaults contain the stable wall-speaker pair and four local saints pictures', status: state.status, artStatus: state.artStatus }); await fresh.context.close();
    const untouched = await newPage('untouched old speaker pairs', seeds.untouched); state = await snapshot(untouched.page);
    assert.equal(state.migrations.length, 1); assertCounts(state, 'B', true); assertCounts(state, 'H', true);
    assert.deepEqual(layoutRecord(JSON.parse(state.migrationBackup)), layoutRecord(seeds.untouched), 'automatic migration first retains full prior export');
    assertFixturesAndRoutes(state, 'untouched migration'); checks.push({ name: 'Untouched old pairs migrate once with full backup', status: state.status }); await untouched.context.close();
    const deleted = await newPage('owner-deleted old pendant', seeds.deleted); state = await snapshot(deleted.page);
    assertCounts(state, 'B', true); assertCounts(state, 'H', false, 1); assert(!state.layout.items.some(it => it.id === 'S277'));
    assert.deepEqual(equipmentRecords(state.layout.items).find(it => it.id === 'S278'), seeds.deleted.items.find(it => it.id === 'S278'), 'deleted pair prevents target replacement');
    const deletedBefore = layoutRecord(state.layout); await deleted.page.reload(); await settled(deleted.page);
    assert.deepEqual(layoutRecord((await snapshot(deleted.page)).layout), deletedBefore, 'deleted-pair layout stays preserved on reload');
    checks.push({ name: 'Deleted old pair preserved exactly, opposite untouched pair migrates', deletedId: 'S277' }); await deleted.context.close();

    const primary = await newPage('owner-edited speaker pairs', seeds.edited), page = primary.page; let before = await snapshot(page);
    for (const side of ['B','H']) { assertCounts(before, side, false); for (const id of pair[side]) assert.deepEqual(equipmentRecords(before.layout.items).find(it => it.id === id), seeds.edited.items.find(it => it.id === id), 'saved owner edit blocks whole-pair migration ' + id); }
    assert.equal(before.layout.settings.wingSoundRevision, before.status.sourceRevision, 'attempted migration marker does not imply current speaker content');
    await page.locator('#simulatorButton').click(); assert.match(await page.locator('#simBody').innerText(), /Wing B \/ H uses preserved or custom speakers/);
    await page.locator('[data-act=wing-sound-review]').click(); await page.locator('[data-wing-review=sound]').scrollIntoViewIfNeeded();
    const text = await page.locator('[data-wing-review=sound]').innerText();
    assert.match(text, /Wing B sound · Preserved or custom/i); assert.match(text, /Wing H sound · Preserved or custom/i);
    assert.match(text, /0 wall speakers · 2 pendant speakers/); assert.match(text, /Source sound review/); assert.match(text, /history only/);
    assert.match(text, /worsens microphone feedback/); assert.match(text, /Legacy equipment IDs to remove: S275/); assert.match(text, /Mismatching speaker IDs: S276/);
    await page.screenshot({ path: path.join(out, '01-retained-speaker-wiring.png') });
    let adopted = await adoptThroughUI(page, 'B', before); assertCounts(adopted, 'B', true); assertCounts(adopted, 'H', false);
    adopted = await undoRedo(page, before, adopted, 'B');
    assert.equal(await page.locator('[data-act=wing-sound-adopt][data-side=B]').isDisabled(), true);
    const currentBefore = await snapshot(page); await page.locator('[data-act=wing-sound-adopt][data-side=B]').evaluate(el => { el.disabled = false; el.click(); });
    const forced = await snapshot(page); assertUnchanged(forced, currentBefore, 'forced current speaker UI action'); assert.deepEqual(forced.attempts, currentBefore.attempts);
    const noOp = await page.evaluate(() => CHURCH_SIMULATOR.adoptWingSound('B')); assert.deepEqual(noOp, { backupKey: null, changedIds: [], retiredIds: [] });
    const noOpAfter = await snapshot(page); assertUnchanged(noOpAfter, currentBefore, 'current speaker API action'); assert.deepEqual(noOpAfter.backups, currentBefore.backups);
    before = noOpAfter; adopted = await adoptThroughUI(page, 'H', before); adopted = await undoRedo(page, before, adopted, 'H');
    assertCounts(adopted, 'B', true); assertCounts(adopted, 'H', true);
    assert.equal(await page.evaluate(() => CHURCH_SIMULATOR.saveNow()), true); const saved = await snapshot(page);
    await page.reload(); await settled(page); const reloaded = await snapshot(page);
    assert.deepEqual(layoutRecord(reloaded.layout), layoutRecord(saved.layout), 'save/reload preserves every editable item/settings/scene');
    assert.deepEqual(reloaded.backups, saved.backups, 'full adoption backups survive reload byte-for-byte'); assert.equal(reloaded.migrations.length, 0); assertFixturesAndRoutes(reloaded, 'saved reload');
    await page.waitForTimeout(200); await settled(page);
    for (const side of ['B','H']) for (const lighting of ['day','evening']) await capture(page, `02-wall-speaker-${side}-${lighting}`, side, lighting);
    for (const side of ['B','H']) await reviewRoutes(page, side);
    checks.push({ name: 'Edited old pairs preserve until explicit B/H UI adoption; exact backups, unrelated/scenes/settings/on-off/notes, Undo/Redo, current no-op and reload', backupKeys: Object.keys(saved.backups), status: reloaded.status });
    await primary.context.close();

    for (const failure of ['backup','save']) {
      const test = await newPage('controlled sound ' + failure + ' failure', seeds.edited); await wiring(test.page);
      await test.page.evaluate(mode => { CHURCH_SIMULATOR.select('S276'); CHURCH_SIMULATOR.ui.tab = 'wiring'; window.__denySoundBackup = mode === 'backup'; window.__denySoundSave = mode === 'save'; }, failure);
      const initial = await snapshot(test.page); await test.page.locator('[data-act=wing-sound-adopt][data-side=B]').click(); const failed = await snapshot(test.page);
      assertUnchanged(failed, initial, 'controlled sound ' + failure + ' failure'); assert.equal(failed.stored, initial.stored, failure + ': durable current layout bytes unchanged');
      assert(failed.attempts.at(-1).error); assert.match(await test.page.locator('#toast').innerText(), /Could not apply wing B speaker review/);
      if (failure === 'backup') assert.deepEqual(failed.backups, initial.backups, 'failed backup creates no partial record');
      else { assert.equal(Object.keys(failed.backups).length, Object.keys(initial.backups).length + 1); assert.deepEqual(layoutRecord(JSON.parse(Object.values(failed.backups).at(-1))), layoutRecord(initial.layout), 'save failure retains full recovery backup'); }
      // Restoring selection on a failed save uses the existing category-tab
      // behavior. Navigate back to Wiring for the failure evidence.
      await wiring(test.page); await test.page.locator('[data-wing-review=sound]').scrollIntoViewIfNeeded(); await test.page.screenshot({ path: path.join(out, `04-speaker-${failure}-failure.png`) });
      checks.push({ name: 'Controlled speaker ' + failure + ' failure preserves exact layout/history/selection', failureMessage: failed.attempts.at(-1).error }); await test.context.close();
    }

    const art = await newPage('owner-edited and deleted saints pictures', seeds.artEdited), artPage = art.page;
    let artBefore = await snapshot(artPage);
    for (const id of artIds.filter(id => id !== artPair.H[1])) assert.deepEqual(equipmentRecords(artBefore.layout.items).find(it => it.id === id), seeds.artEdited.items.find(it => it.id === id), id + ': saved picture edits retained');
    assert(!artBefore.layout.items.some(it => it.id === artPair.H[1]), 'saved deleted picture remains deleted');
    assert.equal(artBefore.layout.settings.wingArtRevision, artBefore.artStatus.sourceRevision, 'saved saints marker is history only');
    assert.equal(artBefore.artStatus.sides.find(s => s.side === 'B').current, false); assert.equal(artBefore.artStatus.sides.find(s => s.side === 'H').current, false);
    assert.deepEqual(artBefore.artStatus.sides.find(s => s.side === 'B').counts, { pictures: 2 }); assert.deepEqual(artBefore.artStatus.sides.find(s => s.side === 'H').counts, { pictures: 1 });
    await artPage.locator('#simulatorButton').click(); assert.match(await artPage.locator('#simBody').innerText(), /Wing B \/ H uses preserved or custom saints' pictures/);
    assert.equal(await artPage.locator('[data-act=wing-art-review]').count(), 1, 'unique saints notice action');
    await artPage.locator('[data-act=wing-art-review]').click(); await artPage.locator('[data-wing-review=art]').scrollIntoViewIfNeeded();
    const artText = await artPage.locator('[data-wing-review=art]').innerText();
    assert.match(artText, /Saint Peter and Saint Paul sit between the two windows/); assert.match(artText, /dimensions are proxies/); assert.match(artText, /history only/);
    assert.match(artText, /Actual visible pictures: 2/); assert.match(artText, /Actual visible pictures: 1/); assert.match(artText, /Mismatching picture IDs: D-WING-H-PAUL/);
    await artPage.screenshot({ path: path.join(out, '05-retained-saints-wiring.png') });
    const artPreReload = artBefore.layout; await artPage.reload(); await settled(artPage); await instrumentActions(artPage); artBefore = await snapshot(artPage);
    assertUnchangedLayout(artBefore.layout, artPreReload, 'edited/deleted saints reload'); await wiring(artPage);
    let artAdopted = await adoptArt(artPage, 'B', artBefore); artAdopted = await adoptArt(artPage, 'H', artAdopted);
    await artwork(artPage, 'explicitly adopted saints'); assert.equal(await artPage.evaluate(() => CHURCH_SIMULATOR.saveNow()), true);
    const artSaved = await snapshot(artPage); await artPage.reload(); await settled(artPage); const artReloaded = await snapshot(artPage);
    assertUnchangedLayout(artReloaded.layout, artSaved.layout, 'adopted saints reload'); assert.deepEqual(artReloaded.artBackups, artSaved.artBackups);
    checks.push({ name: 'Saved edited/deleted saints retain exact records until per-side UI adoption; unique notice, live counts, full backups, notes/unrelated/scenes/settings preservation, Undo/Redo and reload', artStatus: artReloaded.artStatus, backupKeys: Object.keys(artSaved.artBackups) });
    await art.context.close();

    for (const failure of ['backup','save']) {
      const test = await newPage('controlled saints ' + failure + ' failure', seeds.artEdited); await wiring(test.page);
      await test.page.evaluate(mode => { CHURCH_SIMULATOR.select('D-WING-B-PETER'); CHURCH_SIMULATOR.ui.tab = 'wiring'; window.__denyArtBackup = mode === 'backup'; window.__denyArtSave = mode === 'save'; }, failure);
      const initial = await snapshot(test.page); await test.page.locator('[data-act=wing-art-adopt][data-side=B]').click(); const failed = await snapshot(test.page);
      assertUnchanged(failed, initial, 'controlled saints ' + failure + ' failure'); assert.equal(failed.stored, initial.stored); assert(failed.artAttempts.at(-1).error);
      assert.match(await test.page.locator('#toast').innerText(), /Could not apply wing B saints review/);
      if (failure === 'backup') assert.deepEqual(failed.artBackups, initial.artBackups);
      else { assert.equal(Object.keys(failed.artBackups).length, Object.keys(initial.artBackups).length + 1); assertUnchangedLayout(JSON.parse(Object.values(failed.artBackups).at(-1)), initial.layout, 'failed saints save recovery backup'); }
      await wiring(test.page); await test.page.locator('[data-wing-review=art]').scrollIntoViewIfNeeded(); await test.page.screenshot({ path: path.join(out, `06-saints-${failure}-failure.png`) });
      checks.push({ name: 'Controlled saints ' + failure + ' failure leaves layout/history/selection unchanged', failureMessage: failed.artAttempts.at(-1).error }); await test.context.close();
    }
    const conflict = await newPage('reserved saints-ID conflict', seeds.artConflict); await wiring(conflict.page); const conflictBefore = await snapshot(conflict.page);
    assert.deepEqual(conflictBefore.artStatus.sides.find(s => s.side === 'B').conflictIds, [artPair.B[0]]);
    const conflictButton = conflict.page.locator('[data-act=wing-art-adopt][data-side=B]'); assert.equal(await conflictButton.isDisabled(), true);
    assert.equal(await conflict.page.locator('[data-act=wing-art-adopt][data-side=H]').isDisabled(), false);
    assert.match(await conflict.page.locator('[data-wing-review=art]').innerText(), /Adoption is blocked.*D-WING-B-PETER/);
    await conflictButton.evaluate(el => { el.disabled = false; el.click(); }); const conflictForced = await snapshot(conflict.page);
    assertUnchanged(conflictForced, conflictBefore, 'forced conflicting saints UI action'); assert.deepEqual(conflictForced.artAttempts, conflictBefore.artAttempts);
    const rejection = await conflict.page.evaluate(() => { try { CHURCH_SIMULATOR.adoptWingArt('B'); return null; } catch (error) { return error.message; } });
    assert.match(rejection, /Reserved saints IDs/); const rejected = await snapshot(conflict.page); assertUnchanged(rejected, conflictBefore, 'conflicting saints API rejection'); assert.deepEqual(rejected.artBackups, conflictBefore.artBackups);
    await conflict.page.locator('[data-wing-review=art]').scrollIntoViewIfNeeded(); await conflict.page.screenshot({ path: path.join(out, '07-saints-id-conflict.png') });
    checks.push({ name: 'Reserved saints-ID conflict blocks UI/API without replacing unrelated equipment; independent H action remains available', conflictIds: [artPair.B[0]] }); await conflict.context.close();
    assert.deepEqual(errors, [], 'zero desktop Chrome console/page errors'); assert.deepEqual(fingerprints(), sourceSha256, 'all viewer/test source inputs stayed frozen');
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ status: 'PASS', generatedAt: new Date().toISOString(), browser: browser.version(), headed: process.env.HEADED === '1', desktopViewport: [1600,1000],
      checks, frames, routeChecks, artworkChecks, errors, warnings, sourceSha256, ignoredCalculatedField: 'Derived microphone feedbackMargin only; all editable equipment fields/settings/custom scenes are compared.',
      specialFileAccessFlag: false, ordinaryFileCheckIsSeparate: true,
      limitations: ['Isolated temporary Chrome profiles never read/reset user browser storage.', 'Per-side wall-speaker counts concern the known review IDs; light/fan quantities come from the frozen model and are never hardcoded here.',
        'Four rendered saints pictures reuse two native local 1024×1536 maps; final artwork, dimensions, materials and fixings remain concepts.',
        'Standing, short seated and wheelchair art-facing frames use nominal eye-height proxies above the model floor, not a complete access/sightline assessment.',
        'Desktop model/frustum/route evidence does not establish acoustic commissioning, physical concealment, support adequacy or construction approval. Speech/feedback and other engineering holds remain.'] }, null, 2) + '\n');
    console.log(`PASS: held speaker and saints status/adoption, durable backups, preservation, Undo/Redo, reload, no-op and storage/conflict protection; ${frames.length} desktop day/evening views, ${routeChecks.length} exact 3D/2D sound routes and four actual local picture maps.`);
  } catch (error) {
    fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ generatedAt: new Date().toISOString(), error: error.stack, checks, frames, routeChecks, artworkChecks, errors, warnings, sourceSha256 }, null, 2) + '\n');
    if (currentPage && !currentPage.isClosed()) await currentPage.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {}); throw error;
  } finally { if (browser) await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
