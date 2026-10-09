/* Wing sacred-picture software preservation and geometry screen.
 * Run: node scripts/verify_wing_art.cjs
 * Uses actual app modules with isolated in-memory browser/GPU services.
 * This does not approve artwork, physical frames, anchors or construction.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const Module = require('node:module');
const { root, sources } = require('./lib/study_model.cjs');
const clone = value => JSON.parse(JSON.stringify(value));
const storageKey = 'thachbi.simulator.v1';
const output = path.join(root, 'review/wing-art-2026-10-09/headless');
const assetFolder = 'Thach_Bi_Viewer/references/10-wing-saints';
const groups = {
  B: ['D-WING-B-PETER', 'D-WING-B-PAUL'],
  H: ['D-WING-H-PETER', 'D-WING-H-PAUL']
};
const ids = [...groups.B, ...groups.H], artIds = new Set(ids);
const assets = [
  { file: 'saint-peter-concept-v1.png', material: 'saintPeterArt', type: 'saintPeterPicture', sha256: '71feba6b3d2dd04ee77a2308185f038eceea40ad28a8814a7ffcb2697e9ba2f9' },
  { file: 'saint-paul-concept-v1.png', material: 'saintPaulArt', type: 'saintPaulPicture', sha256: '2f3a98e28de43d3e39198b8e6a807fcdfe51f607298f6105d3d5735b527d5db0' }
];
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const trackedSources = [...new Set([...sources, 'scripts/lib/study_model.cjs', 'scripts/verify_wing_art.cjs',
  'Thach_Bi_Viewer/wing-saint-textures.js', 'scripts/build_saint_textures.py',
  ...assets.map(asset => assetFolder + '/' + asset.file), assetFolder + '/provenance.json', assetFolder + '/README.md'])];
// A coordinated kernel-only run may explicitly exclude concurrent electrical
// edits; ordinary verification requires every loaded source to remain frozen.
const concurrentlyEditedSources = new Set(process.argv.includes('--allow-electrical-edits') ? ['Thach_Bi_Viewer/simulator/electrical.js'] : []);
const fingerprints = () => Object.fromEntries(trackedSources.map(file => [file, sha256(fs.readFileSync(path.join(root, file)))]));
const frozenHashes = records => Object.fromEntries(Object.entries(records).filter(([file]) => !concurrentlyEditedSources.has(file)));

// Expose only the adapter's existing isolated browser/storage objects. The
// production sources execute unmodified. A seed permits actual startup tests.
function loadIsolated(storageEntries = [], failWrite = null) {
  const filename = path.join(root, 'scripts/lib/study_model.cjs');
  let adapter = fs.readFileSync(filename, 'utf8');
  for (const [anchor, replacement] of [
    ['function loadStudyModel() {', 'function loadStudyModel(options = {}) {'],
    ['const storage = new Map(), listeners = {};', 'const storage = new Map(options.storageEntries || []), listeners = {};'],
    ['setItem: (k, v) => storage.set(k, String(v))', 'setItem: (k, v) => { if (options.failWrite && options.failWrite(k)) throw new Error("Injected startup quota failure"); return storage.set(k, String(v)); }'],
    ['return { SIM, model, P:', 'return { sandbox, storage, SIM, model, P:']
  ]) {
    assert.equal(adapter.split(anchor).length, 2, 'study adapter anchor changed: ' + anchor);
    adapter = adapter.replace(anchor, replacement);
  }
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(adapter, filename);
  return loaded.exports.loadStudyModel({ storageEntries, failWrite });
}
const layoutShape = layout => { const value = clone(layout); delete value.savedAt; return value; };
function stateSnapshot(study) {
  const { SIM } = study;
  return { layout: layoutShape(SIM.exportLayout()), history: clone(SIM.state.history),
    future: clone(SIM.state.future), selectedId: SIM.state.selectedId };
}
function assertFixtures(study, label) {
  const { SIM } = study;
  assert.equal(SIM.fixtures.size, SIM.state.items.length, label + ': one fixture per item');
  for (const item of SIM.state.items) assert.equal(SIM.fixtures.get(item.id).type.id, item.type, label + ': actual fixture type ' + item.id);
}
function markCase(cases, name, data = {}) { cases.push({ name, passed: true, ...data }); }

function run() {
  fs.mkdirSync(output, { recursive: true });
  const sourceSha256 = fingerprints(), cases = [], studies = new Set();
  const isolated = (seed, failWrite) => { const result = loadIsolated(seed, failWrite); studies.add(result); return result; };
  const release = study => { study.dispose(); studies.delete(study); };
  try {
    const study = isolated(), { SIM, CAT, model, sandbox } = study;
    const D = sandbox.CHURCH_SIM_DESIGN, defaults = clone(SIM.exportLayout());
    assert.equal(typeof D.upgradeWingArt, 'function');
    assert.equal(typeof SIM.wingArtStatus, 'function');
    assert.equal(typeof SIM.adoptWingArt, 'function');
    assert.equal(defaults.settings.wingArtRevision, D.wingArtRevision, 'fresh default records current art revision');
    assert.equal(new Set(defaults.items.map(item => item.id)).size, defaults.items.length);
    assert.deepEqual(defaults.items.filter(item => artIds.has(item.id)).map(item => item.id).sort(), ids.slice().sort(), 'exact four stable picture IDs');
    for (const side of ['B', 'H']) {
      assert.equal(SIM.wingArtStatus().sides.find(row => row.side === side).current, true, side + ': fresh default status is current');
      const sideArt = groups[side].map(id => SIM.item(id));
      assert.deepEqual(sideArt.map(item => item.type), assets.map(asset => asset.type), side + ': Peter then Paul');
      for (const item of sideArt) {
        const type = CAT.byId[item.type];
        assert.equal(type.cat, 'decor'); assert.equal(item.circuit, 'DECOR'); assert.equal(item.mount, 'wall');
        assert.equal(item.hidden, false); assert.equal(Math.sign(item.pos[2]), side === 'B' ? -1 : 1);
        assert(!type.light && !type.fan && !type.speaker && !type.mic, item.id + ': no powered emitter or transducer');
        assert.equal(SIM.itemWatts(item, true), 0, item.id + ': no connected electrical rating');
        assert.equal(SIM.itemWatts(item, false), 0, item.id + ': no operating demand');
        assert.match(type.desc, /concept/i); assert.match(type.desc, /pending/i);
      }
    }
    const native = JSON.parse(fs.readFileSync(path.join(root, assetFolder, 'provenance.json'), 'utf8'));
    const readme = fs.readFileSync(path.join(root, assetFolder, 'README.md'), 'utf8');
    // Decode the package as data rather than executing it or inventing a
    // browser Image service. GPU upload remains a separate desktop check.
    const packageSource = fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/wing-saint-textures.js'), 'utf8');
    const packageAnchor = 'window.CHURCH_WING_SAINT_TEXTURES = ';
    assert.equal(packageSource.split(packageAnchor).length, 2, 'one packaged texture assignment');
    const packaged = JSON.parse(packageSource.slice(packageSource.indexOf(packageAnchor) + packageAnchor.length, packageSource.lastIndexOf(';')));
    assert.equal(packageSource.slice(packageSource.lastIndexOf(';') + 1).trim(), '', 'no code follows the data package');
    assert.equal(Object.keys(packaged).length, 2, 'exactly two shared native textures are packaged');
    for (const asset of assets) {
      const file = path.join(root, assetFolder, asset.file), bytes = fs.readFileSync(file);
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', asset.file + ': PNG signature');
      assert.equal(bytes.readUInt32BE(16), 1024); assert.equal(bytes.readUInt32BE(20), 1536);
      assert.equal(sha256(bytes), asset.sha256, asset.file + ': exact reviewed native artwork');
      const provenance = native.assets.find(record => record.file === asset.file);
      assert(provenance); assert.equal(provenance.sha256, asset.sha256);
      assert.equal(provenance.nativeWidth, 1024); assert.equal(provenance.nativeHeight, 1536);
      assert.equal(provenance.bytes, bytes.length); assert.equal(provenance.resampled, false);
      assert.equal(provenance.status, 'CONCEPT'); assert(readme.includes(provenance.prompt));
      const pointer = CAT.MATERIALS[asset.material].textureUrl;
      assert.equal(pointer, 'references/10-wing-saints/' + asset.file, 'catalog binds exact local native artwork');
      assert(!/^\w+:|^\/|\.\./.test(pointer), 'artwork pointer stays in the offline viewer');
      assert(fs.existsSync(path.join(root, 'Thach_Bi_Viewer', pointer)));
      const offline = packaged[pointer]; assert(offline, 'native local pointer resolves in the offline package');
      assert.equal(offline.sha256, asset.sha256); assert.equal(offline.width, 1024); assert.equal(offline.height, 1536);
      const dataPrefix = 'data:image/png;base64,';
      assert(offline.imageUrl.startsWith(dataPrefix), 'offline artwork embeds PNG bytes');
      const decoded = Buffer.from(offline.imageUrl.slice(dataPrefix.length), 'base64');
      assert.equal(sha256(decoded), asset.sha256, 'independent decoded payload SHA matches native artwork');
      assert(decoded.equals(bytes), 'independent decoded offline payload is byte-identical to the selected PNG');
    }
    markCase(cases, 'native artwork hashes, 2:3 pixel dimensions, provenance, offline pointers and independently decoded native-byte package');

    model.scene.updateMatrixWorld(true);
    const T = model.THREE, boxes = new Map(), geometry = [];
    for (const id of ids) {
      const fixture = SIM.fixtures.get(id), box = new T.Box3().setFromObject(fixture.root);
      assert(!box.isEmpty(), id + ': picture has actual mesh geometry');
      assert(box.min.x > 38.675 && box.max.x < 42.475, id + ': complete frame remains between window edges');
      const meshes = [];
      fixture.root.traverse(mesh => {
        if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;
        const meshBox = new T.Box3().setFromObject(mesh);
        for (const [x0, x1] of [[37.675, 38.675], [42.475, 43.475]]) {
          assert(meshBox.min.x > x1 || meshBox.max.x < x0 || meshBox.min.y > 3.608 || meshBox.max.y < 0.85,
            id + ': rendered mesh does not enter a window opening projection');
        }
        meshes.push({ name: mesh.name, min: meshBox.min.toArray(), max: meshBox.max.toArray() });
      });
      assert(meshes.length, id + ': mesh screen was exercised');
      boxes.set(id, box); geometry.push({ id, minimum: box.min.toArray(), maximum: box.max.toArray(), meshes });
    }
    for (const side of ['B', 'H']) assert(!boxes.get(groups[side][0]).intersectsBox(boxes.get(groups[side][1])), side + ': picture frames do not intersect each other');
    markCase(cases, 'complete rendered frame and mesh envelopes between both wing windows');

    const electrical = clone(SIM.electrical.exportData());
    for (const id of ids) {
      assert(!electrical.components.some(record => record.id === id), id + ': unpowered artwork is absent from the mains equipment schedule');
      assert(!electrical.routes.some(route => route.itemIds?.includes(id)), id + ': no electrical branch or shared route membership');
    }
    const powerWithArt = clone(SIM.powerSummary());
    assert(Number.isFinite(powerWithArt.total) && Number.isFinite(powerWithArt.rated), 'power comparison uses finite actual values');
    SIM.importLayout({ ...clone(defaults), items: clone(defaults.items.filter(item => !artIds.has(item.id))) }, { record: false });
    const powerWithoutArt = clone(SIM.powerSummary()), electricalWithoutArt = clone(SIM.electrical.exportData());
    assert.equal(powerWithArt.total, powerWithoutArt.total, 'pictures add no operating demand');
    assert.equal(powerWithArt.rated, powerWithoutArt.rated, 'pictures add no connected rating');
    assert.deepEqual(electricalWithoutArt.components, electrical.components, 'pictures do not change the mains schedule');
    assert.deepEqual(electricalWithoutArt.routes, electrical.routes, 'pictures do not change electrical route data');
    SIM.importLayout(clone(defaults), { record: false });
    markCase(cases, 'unpowered decorative equipment absent from mains schedule/routes with zero power delta');

    const legacy = clone(defaults); legacy.items = legacy.items.filter(item => !artIds.has(item.id)); legacy.settings.wingArtRevision = '';
    function checkPure(name, inputItems, expectedItems, design = defaults.items) {
      const input = clone(inputItems), templates = clone(design), before = clone(input), priorTemplates = clone(templates);
      const outputItems = clone(D.upgradeWingArt(input, templates));
      assert.deepEqual(input, before, name + ': caller records not mutated');
      assert.deepEqual(templates, priorTemplates, name + ': templates not mutated');
      assert.deepEqual(outputItems, expectedItems, name + ': exact expected output');
      assert.equal(new Set(outputItems.map(item => item.id)).size, outputItems.length, name + ': no duplicate IDs');
      markCase(cases, name, { inputItems: input.length, outputItems: outputItems.length });
      return outputItems;
    }
    const appended = [...legacy.items, ...ids.map(id => defaults.items.find(item => item.id === id))];
    checkPure('first issue adds exactly four missing pictures', legacy.items, appended);
    checkPure('repeat with existing complete pairs is unchanged', appended, appended);
    for (const side of ['B', 'H']) {
      const templates = defaults.items.filter(item => item.id !== groups[side][0]);
      const other = side === 'B' ? groups.H : groups.B;
      checkPure(side + ' incomplete template skips whole pair', legacy.items,
        [...legacy.items, ...other.map(id => defaults.items.find(item => item.id === id))], templates);
    }
    for (const id of ids) {
      const collision = clone(legacy.items);
      collision.push({ ...clone(legacy.items[0]), id, name: 'Owner reserved-ID collision', note: 'Preserve my unrelated record.' });
      const sideIds = id.includes('-B-') ? groups.B : groups.H;
      const expected = [...collision, ...ids.filter(candidate => !sideIds.includes(candidate)).map(candidate => defaults.items.find(item => item.id === candidate))];
      checkPure('first-issue ID collision preserves and skips whole pair: ' + id, collision, expected);
      for (const change of ['delete', 'move', 'rename', 'hide', 'switch', 'annotate']) {
        const input = clone(appended), item = input.find(record => record.id === id);
        if (change === 'delete') input.splice(input.indexOf(item), 1);
        else if (change === 'move') item.pos[0] += 0.17;
        else if (change === 'rename') item.name = 'Owner sacred picture name';
        else if (change === 'hide') item.hidden = true;
        else if (change === 'switch') item.on = false;
        else item.note = 'Owner picture annotation retained verbatim.';
        checkPure('existing/partial pair art edit preserved: ' + id + '/' + change, input, input);
      }
    }

    // Real adoption will use deliberately edited, deleted and custom unrelated
    // fixtures, notes/settings/scenes and an unrecorded change before adoption.
    const edited = clone(legacy);
    edited.items = edited.items.filter((item, index) => index !== 2 && index !== 5);
    for (const [index, item] of edited.items.entries()) {
      item.name = ('Owner ' + item.name).slice(0, 80);
      item.note = 'Owner note ' + item.id + ' / giữ nguyên / préserver';
      if (index % 3 === 0) item.pos[0] += 0.06;
      if (index % 4 === 0) item.yaw += 7;
      if (index % 5 === 0) item.on = false;
    }
    edited.items.push({ ...clone(legacy.items[0]), id: 'OWNER-ART-TEST-ITEM', name: 'Owner custom unrelated light', pos: [24, 4.2, -5.5], note: 'Must remain exact.' });
    edited.settings.occupancy = 0.73; edited.settings.quality = 'balanced'; edited.settings.snap = false;
    edited.customScenes = [{ name: 'Owner saved scenario', items: { L1: { on: false, dim: 0.33 } }, ownerNote: 'Preserve saved scenario metadata.' }];
    for (const side of ['B', 'H']) {
      const scopedLayout = clone(edited), other = side === 'B' ? groups.H : groups.B;
      for (const id of other) {
        const picture = clone(defaults.items.find(item => item.id === id));
        picture.pos[0] += 0.13; picture.hidden = true;
        picture.name = 'Owner opposite-wing artwork'; picture.note = 'Preserve the other wing picture.';
        scopedLayout.items.push(picture);
      }
      SIM.importLayout(scopedLayout, { record: false });
      SIM.state.scene = 'Owner current scenario'; SIM.select('OWNER-ART-TEST-ITEM');
      SIM.update(edited.items[0].id, { note: 'Latest unrecorded owner annotation.' }, { record: false });
      const before = stateSnapshot(study), result = clone(SIM.adoptWingArt(side)), after = stateSnapshot(study);
      assert(result.backupKey, side + ': durable full backup key');
      assert.deepEqual(result.changedIds, groups[side], side + ': exactly requested pair adopted');
      const backup = JSON.parse(study.storage.get(result.backupKey));
      assert.equal(typeof backup.savedAt, 'string'); assert(Number.isFinite(Date.parse(backup.savedAt)));
      assert.deepEqual(layoutShape(backup), before.layout, side + ': durable backup includes complete preceding layout');
      for (const item of before.layout.items) assert.deepEqual(clone(SIM.item(item.id)), item, side + ': all unrelated edited equipment preserved ' + item.id);
      assert.deepEqual(after.layout.customScenes, before.layout.customScenes); assert.equal(after.layout.scene, before.layout.scene);
      assert.equal(after.selectedId, before.selectedId);
      const expectedSettings = { ...before.layout.settings, wingArtRevision: D.wingArtRevision };
      assert.deepEqual(after.layout.settings, expectedSettings, side + ': every unrelated setting preserved');
      assert.equal(SIM.wingArtStatus().sides.find(row => row.side === side).current, true);
      assertFixtures(study, side + ' adoption');
      const undoLabel = SIM.undo(); assert.match(undoLabel, new RegExp('wing ' + side, 'i'));
      assert.deepEqual(clone(SIM.state.items), before.layout.items, side + ': undo restores exact preceding records including deletions/unrecorded edit');
      assert.deepEqual(clone(SIM.state.settings), expectedSettings); assert.deepEqual(clone(SIM.state.customScenes), before.layout.customScenes);
      assertFixtures(study, side + ' undo');
      assert.equal(SIM.redo(), undoLabel); assert.deepEqual(clone(SIM.state.items), after.layout.items, side + ': redo restores exact adopted records');
      assertFixtures(study, side + ' redo');
      const noOpBefore = stateSnapshot(study), storageBefore = [...study.storage];
      const noOp = clone(SIM.adoptWingArt(side)); assert.equal(noOp.backupKey, null); assert.deepEqual(noOp.changedIds, []);
      assert.deepEqual(stateSnapshot(study), noOpBefore, side + ': current adoption does not touch state/history');
      assert.deepEqual([...study.storage], storageBefore, side + ': current adoption does not write storage');
      markCase(cases, side + ' scoped adoption, full durable backup, exact unrelated edits, undo/redo and current no-op');
    }

    for (const side of ['B', 'H']) {
      const moved = clone(edited);
      for (const id of ids) {
        const picture = clone(defaults.items.find(item => item.id === id));
        picture.pos[0] += 0.1; picture.note = 'Entered artwork note ' + id;
        moved.items.push(picture);
      }
      SIM.importLayout(moved, { record: false }); const before = clone(SIM.state.items);
      SIM.adoptWingArt(side);
      for (const id of groups[side]) {
        assert.equal(SIM.item(id).note, 'Entered artwork note ' + id, side + ': explicit adoption preserves existing target notes');
        assert.deepEqual(clone(SIM.item(id).pos), defaults.items.find(item => item.id === id).pos, side + ': requested geometry is adopted');
      }
      for (const item of before.filter(item => !groups[side].includes(item.id))) assert.deepEqual(clone(SIM.item(item.id)), item);
      markCase(cases, side + ' adoption updates existing moved pictures while preserving entered target notes');
    }

    for (const failure of ['backup', 'save']) {
      SIM.importLayout(clone(edited), { record: false }); SIM.state.scene = 'Owner failure review'; SIM.select('OWNER-ART-TEST-ITEM');
      const before = stateSnapshot(study), storageBefore = study.storage.get(storageKey), originalSet = sandbox.localStorage.setItem;
      sandbox.localStorage.setItem = (key, value) => {
        if ((failure === 'backup' && key !== storageKey) || (failure === 'save' && key === storageKey)) throw new Error('Injected ' + failure + ' quota failure');
        return originalSet(key, value);
      };
      try { assert.throws(() => SIM.adoptWingArt('B'), /quota|saved|retained|backup/i, failure + ': error is surfaced'); }
      finally { sandbox.localStorage.setItem = originalSet; }
      assert.deepEqual(stateSnapshot(study), before, failure + ': no state/history/selection/settings/scenes change');
      assert.equal(study.storage.get(storageKey), storageBefore, failure + ': existing durable layout unchanged');
      assertFixtures(study, failure + ' rollback');
      markCase(cases, 'explicit adoption ' + failure + ' failure retains complete layout and history');
    }
    for (const side of ['B', 'H']) {
      const conflict = clone(edited);
      conflict.items.push({ ...clone(legacy.items[0]), id: groups[side][0], name: 'Owner reserved-ID item' });
      SIM.importLayout(conflict, { record: false }); const before = stateSnapshot(study), priorStorage = [...study.storage];
      assert.throws(() => SIM.adoptWingArt(side), /reserved|conflict|resolve|custom/i, side + ': adoption refuses unrelated reserved ID');
      assert.deepEqual(stateSnapshot(study), before); assert.deepEqual([...study.storage], priorStorage);
      markCase(cases, side + ' reserved-ID adoption refuses overwrite');
    }
    const invalidBefore = stateSnapshot(study), invalidStorage = [...study.storage];
    assert.throws(() => SIM.adoptWingArt('Z'), /wing B or H/i);
    assert.deepEqual(stateSnapshot(study), invalidBefore); assert.deepEqual([...study.storage], invalidStorage);
    markCase(cases, 'invalid requested wing refuses mutation');

    let firstStart = isolated([[storageKey, JSON.stringify(edited)]]);
    const firstLayout = clone(firstStart.SIM.exportLayout());
    assert.deepEqual(firstLayout.items, [...edited.items, ...ids.map(id => defaults.items.find(item => item.id === id))], 'first saved-layout startup only appends four pictures');
    assert.equal(firstLayout.settings.wingArtRevision, D.wingArtRevision);
    const artBackups = [...firstStart.storage].filter(([key]) => key.includes('before-wing-art'));
    assert(artBackups.length, 'first startup keeps a durable pre-art backup');
    assert.deepEqual(layoutShape(JSON.parse(artBackups[0][1])).items, edited.items);
    firstStart.SIM.remove(groups.B[0], { record: false });
    firstStart.SIM.remove(groups.B[1], { record: false });
    firstStart.SIM.update(groups.H[1], { pos: [41.1, 2.3, 13.85], hidden: true, note: 'Owner art movement and visibility.' }, { record: false });
    assert(firstStart.SIM.saveNow());
    const saved = firstStart.storage.get(storageKey);
    release(firstStart); firstStart = null;
    let reloaded = isolated([[storageKey, saved]]);
    assert.deepEqual(layoutShape(reloaded.SIM.exportLayout()), layoutShape(JSON.parse(saved)), 'reload preserves deleted/moved/hidden pictures and all unrelated records');
    for (const id of groups.B) assert(!reloaded.SIM.item(id), 'deleted complete pair is never recreated after marker: ' + id);
    assert.equal([...reloaded.storage].filter(([key]) => key.includes('before-wing-art')).length, 0, 'current marker does not repeat startup migration');
    assertFixtures(reloaded, 'saved art reload');
    release(reloaded); reloaded = null;
    markCase(cases, 'actual first startup and later reload preserve deleted/moved/hidden art after marker');

    let failedStart = isolated([[storageKey, JSON.stringify(edited)]], key => key.includes('.before-wing-art-review'));
    assert.deepEqual(layoutShape(failedStart.SIM.exportLayout()), layoutShape(edited), 'startup backup failure retains complete saved layout');
    assert.equal(failedStart.SIM.state.settings.wingArtRevision, '', 'failed first issue remains pending');
    assertFixtures(failedStart, 'startup backup failure');
    release(failedStart); failedStart = null;
    markCase(cases, 'startup backup failure retains complete saved layout and pending marker');

    let failedSaveStart = isolated([[storageKey, JSON.stringify(edited)]], key => key === storageKey);
    assert.deepEqual(layoutShape(failedSaveStart.SIM.exportLayout()), layoutShape(edited), 'startup save failure restores complete saved layout');
    assert.equal(failedSaveStart.SIM.state.settings.wingArtRevision, '', 'failed startup durable save leaves art revision pending');
    assert.equal(failedSaveStart.storage.get(storageKey), JSON.stringify(edited), 'startup save failure retains exact preceding durable layout');
    assertFixtures(failedSaveStart, 'startup save failure');
    release(failedSaveStart); failedSaveStart = null;
    markCase(cases, 'startup save failure restores complete saved layout and pending marker');

    const finalSourceSha256 = fingerprints();
    assert.deepEqual(frozenHashes(finalSourceSha256), frozenHashes(sourceSha256), 'kernel/art source modules/assets remained frozen during verification');
    const report = { status: 'PASS software preservation and geometry screen; CONCEPT / ENGINEERING HOLD remains',
      generatedAt: new Date().toISOString(), node: process.version, wingArtRevision: D.wingArtRevision,
      pictureIds: ids, nativeAssets: assets, cases, geometry, sourceSha256, finalSourceSha256,
      freezeExcludedSources: [...concurrentlyEditedSources],
      limits: ['Headless GPU/browser image services are stubbed; texture appearance and desktop UI are separately inspected.',
        'Window checks use the existing model opening projection; source drawing/survey and actual installed clearances remain separate.',
        'No physical frame material, artwork clearance, product specification, mounting capacity, acoustic or photometric approval is inferred.',
        'Passing software checks does not resolve existing lighting, ventilation, speech-clarity, feedback or sightline limitations.'] };
    fs.writeFileSync(path.join(output, 'art-results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('PASS: ' + cases.length + ' wing-art cases; native hashes, frame/window envelopes, unpowered routes, pure one-time migration, scoped durable adoption, failures and reload preservation.');
  } finally { for (const study of studies) study.dispose(); }
}
module.exports = { groups, assets };
if (require.main === module) { try { run(); } catch (error) { console.error(error); process.exitCode = 1; } }
