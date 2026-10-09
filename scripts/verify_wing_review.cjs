/* Conservative wing migration and actual fixture import/history regression.
 * Run: node scripts/verify_wing_review.cjs [evidence-directory]
 * Storage is isolated in memory. This verifies software preservation only;
 * engineering, concealment, product and mounting holds remain in force.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const { loadStudyModel, root, sources } = require('./lib/study_model.cjs');
const baselinePath = 'review/wing-options-2026-10-09/baseline-layout.json';
const plain = value => JSON.parse(JSON.stringify(value));
const groups = {
  B: ['L63', 'L64', 'L65', 'L66', 'F240', 'F241'],
  H: ['L67', 'L68', 'L69', 'L70', 'F242', 'F243'],
  nave: ['F244', 'F245', 'F246', 'F247', 'F248', 'F249'],
  appended: ['F-WING-B-3', 'F-WING-B-4', 'F-WING-H-3', 'F-WING-H-4']
};
const frozenBaseline = () => JSON.parse(fs.readFileSync(path.join(root, baselinePath), 'utf8'));
const fingerprintPaths = [...new Set([...sources, 'scripts/lib/study_model.cjs', 'scripts/verify_wing_review.cjs', baselinePath])];
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fingerprints = () => Object.fromEntries(fingerprintPaths.map(file => [file, sha256(fs.readFileSync(path.join(root, file)))]));
const edits = {
  deleted: (items, id) => items.splice(items.findIndex(it => it.id === id), 1),
  moved: (items, id) => { items.find(it => it.id === id).pos[0] += 0.15; },
  renamed: (items, id) => { items.find(it => it.id === id).name = 'Owner edited ' + id; },
  retuned: (items, id) => { const it = items.find(it => it.id === id); if (it.type.startsWith('fan')) it.speed = 3; else it.dim = 0.63; },
  hidden: (items, id) => { const it = items.find(it => it.id === id); it.hidden = !it.hidden; },
  switched: (items, id) => { const it = items.find(it => it.id === id); it.on = !it.on; },
  aimed: (items, id) => { items.find(it => it.id === id).yaw += 5; },
  annotated: (items, id) => { items.find(it => it.id === id).note = 'Owner note retained verbatim; local review only.'; },
  recircuited: (items, id) => { const it = items.find(it => it.id === id); it.circuit = it.type.startsWith('fan') ? 'F4' : 'L1'; }
};

function run() {
  const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'review/wing-revision-2026-10-09/migration');
  fs.mkdirSync(out, { recursive: true });
  const sourceSha256 = fingerprints(), baseline = frozenBaseline(), cases = [], study = loadStudyModel();
  const { SIM } = study;
  try {
    assert.equal(baseline.schema, 1);
    const design = plain(SIM.state.items), originalDefault = plain(SIM.exportLayout());
    const context = { window: {} };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/simulator/design.js'), 'utf8'), context, { filename: 'design.js' });
    const D = context.window.CHURCH_SIM_DESIGN;
    assert.equal(typeof D.upgradeWingReview, 'function');
    assert.equal(originalDefault.settings.wingReviewRevision, D.wingReviewRevision);
    const affected = new Set([...groups.B, ...groups.H, ...groups.nave]);
    const retiredSoundIds = ['S275', 'S277'];
    const changedSoundIds = new Set(['S275', 'S276', 'S277', 'S278']);
    const retired = new Set([...D.wingReviewRetiredIds, ...retiredSoundIds]);
    const artIds = ['D-WING-B-PETER', 'D-WING-B-PAUL', 'D-WING-H-PETER', 'D-WING-H-PAUL'];
    assert.equal(design.length, baseline.items.filter(it => !retired.has(it.id)).length + 4, 'retired lights/speakers and four unpowered pictures define inventory');
    assert.deepEqual(design.map(it => it.id), [...baseline.items.filter(it => !retired.has(it.id)).map(it => it.id), ...artIds], 'every retained default ID and ordering stays exact');
    for (const side of ['B', 'H']) {
      for (const id of groups[side].filter(id => id.startsWith('L') && !retired.has(id))) {
        const it = design.find(it => it.id === id);
        assert.equal(it.type, 'chandelier6Reading'); assert.equal(it.circuit, 'L8'); assert.equal(it.mount, 'pendant');
        assert.equal(it.hidden, false); assert.equal(it.pos[1], 3.8); assert.equal(Math.abs(it.pos[2]), 10.15); assert.match(it.note, /HELD/);
      }
      for (const id of groups[side].filter(id => id.startsWith('F'))) {
        const it = design.find(it => it.id === id);
        assert.equal(it.type, 'fanWingWall'); assert.equal(it.circuit, 'F5'); assert.equal(it.mount, 'wall');
        assert.equal(it.hidden, false); assert.equal(it.on, true); assert.equal(it.speed, 1); assert.equal(it.pos[1], 4.05); assert.match(it.note, /ENGINEERING HOLD/);
      }
    }
    for (const id of groups.nave) { const it = design.find(it => it.id === id); assert.equal(it.hidden, false); assert.equal(it.on, false); }
    assert.equal(design.filter(it => it.type === 'fanCeiling' && Math.abs(it.pos[2]) > 7.25).length, 0, 'four former wing roof fans are replaced');
    for (const it of baseline.items.filter(it => !affected.has(it.id) && !changedSoundIds.has(it.id))) assert.deepEqual(design.find(raw => raw.id === it.id), it, 'unrelated default equipment remains exact: ' + it.id);

    const byDesignId = new Map(design.map(it => [it.id, it]));
    function checkMigration(name, inputItems, blocked = [], editedNave = [], overrideDesign = design) {
      const input = plain(inputItems), before = plain(input), beforeDesign = plain(overrideDesign);
      const output = plain(D.upgradeWingReview(input, overrideDesign));
      assert.deepEqual(input, before, name + ': caller items not mutated');
      assert.deepEqual(overrideDesign, beforeDesign, name + ': design templates not mutated');
      assert.equal(new Set(output.map(it => it.id)).size, output.length, name + ': no duplicate equipment IDs');
      const blockedIds = new Set(blocked.flatMap(side => [...groups[side], ...groups.appended.filter(id => id.includes('-' + side + '-'))]));
      for (const it of before) {
        let expected = it;
        if ((groups.B.includes(it.id) || groups.H.includes(it.id) || groups.appended.includes(it.id)) && !blockedIds.has(it.id) && !blocked.some(side => it.id.includes('-' + side + '-'))) expected = byDesignId.get(it.id);
        if (groups.nave.includes(it.id) && !editedNave.includes(it.id)) expected = { ...it, hidden: false, on: false };
        assert.deepEqual(output.find(raw => raw.id === it.id), expected, name + ': exact preservation/replacement ' + it.id);
      }
      for (const side of ['B', 'H']) for (const id of groups.appended.filter(id => id.includes('-' + side + '-'))) {
        const existing = before.find(it => it.id === id), actual = output.find(it => it.id === id);
        assert.deepEqual(actual, blocked.includes(side) ? existing : undefined, name + ': append only unedited wing and preserve existing ID ' + id);
      }
      assert.deepEqual(output.map(it => it.id), before.filter(it => output.some(raw => raw.id === it.id)).map(it => it.id), name + ': retained saved ordering exact');
      assert.deepEqual(plain(D.upgradeWingReview(output, overrideDesign)), output, name + ': repeated migration is idempotent');
      cases.push({ name, inputItems: before.length, outputItems: output.length, blockedWings: blocked, preservedEditedNaveIds: editedNave, sha256: sha256(JSON.stringify(output)) });
      return output;
    }
    const upgraded = checkMigration('untouched frozen baseline', baseline.items);
    for (const side of ['B', 'H']) for (const id of groups[side]) for (const [edit, change] of Object.entries(edits)) {
      const items = plain(baseline.items); change(items, id);
      checkMigration(`${side} wing ${id} ${edit}`, items, [side]);
    }
    for (const id of groups.nave) for (const [edit, change] of Object.entries(edits)) {
      const items = plain(baseline.items); change(items, id);
      checkMigration(`optional nave ${id} ${edit}`, items, [], [id]);
    }
    const both = plain(baseline.items); edits.deleted(both, 'L63'); edits.moved(both, 'F243');
    checkMigration('both wings modified', both, ['B', 'H']);
    const custom = plain(baseline.items);
    custom.find(it => it.id === 'L1').note = 'Unrelated owner note / préserver / giữ nguyên.';
    custom.find(it => it.id === 'L1').pos[0] += 0.2;
    custom.push({ ...plain(baseline.items.find(it => it.id === 'L1')), id: 'USER-LIGHT-1', name: 'Custom owner light', pos: [24, 4, -5.8], note: 'Custom item, never replace.', dim: 0.42 });
    custom.push({ ...plain(baseline.items.find(it => it.id === 'F244')), id: 'F-WING-B-3', name: 'Existing owner fan ID', pos: [12, 4, -6], note: 'Pre-existing appended ID must survive.' });
    checkMigration('unrelated edits, custom item, notes and existing appended ID', custom, ['B']);
    for (const id of groups.appended) {
      const collision = plain(baseline.items);
      collision.push({ ...plain(baseline.items.find(it => it.id === 'F244')), id, name: 'Owner item at reserved ID', pos: [12, 4, -6], note: 'Do not infer a replacement from this ID.' });
      checkMigration('reserved appended-ID collision ' + id, collision, [id.includes('-B-') ? 'B' : 'H']);
    }
    const missing = design.filter(it => it.id !== 'L63');
    checkMigration('incomplete recommended wing template', baseline.items, ['B'], [], missing);

    const intermediate = JSON.parse(fs.readFileSync(path.join(root, 'review/wing-revision-2026-10-09/baseline-layout.json'), 'utf8'));
    checkMigration('untouched intermediate four-light/four-fan review', intermediate.items);
    for (const side of ['B', 'H']) for (const id of [...groups[side], ...groups.appended.filter(id => id.includes('-' + side + '-'))]) for (const [edit, change] of Object.entries(edits)) {
      const items = plain(intermediate.items); change(items, id);
      checkMigration(`intermediate ${side}/${id}/${edit}`, items, [side]);
    }

    function assertFixtures(message) {
      assert.equal(SIM.fixtures.size, SIM.state.items.length, message + ': one instantiated fixture per ID');
      for (const it of SIM.state.items) assert.equal(SIM.fixtures.get(it.id).type.id, it.type, message + ': no stale cached fixture type ' + it.id);
    }
    // Import is an explicit layout operation. It must not silently run the
    // startup migration, even for a whole unchanged pre-review wing.
    SIM.importLayout(plain(baseline), { record: false });
    assert.deepEqual(plain(SIM.state.items), baseline.items, 'explicit whole-baseline import stays exact');
    assertFixtures('frozen baseline import');
    SIM.importLayout({ ...plain(baseline), items: upgraded });
    assert.deepEqual(plain(SIM.state.items), upgraded, 'migrated layout imports exact normalized records');
    assertFixtures('migrated layout');
    const electrical = plain(SIM.electrical.exportData());
    for (const id of [...groups.B, ...groups.H, ...groups.nave].filter(id => !D.wingReviewRetiredIds.includes(id))) {
      const component = electrical.components.find(it => it.id === id), routes = electrical.routes.filter(route => route.itemIds.includes(id));
      assert(component, 'equipment exists in actual electrical export ' + id);
      assert.equal(component.type, SIM.item(id).type, 'electrical type matches actual fixture ' + id);
      assert(routes.length > 0, 'equipment retains circuit route ' + id);
      assert(routes.every(route => route.points.flat().every(Number.isFinite)), 'finite route geometry ' + id);
    }
    assert.equal(SIM.undo(), 'Import layout');
    assert.deepEqual(plain(SIM.state.items), baseline.items, 'undo restores the imported baseline including roof fans');
    assertFixtures('undo');
    assert.equal(SIM.redo(), 'Import layout');
    assert.deepEqual(plain(SIM.state.items), upgraded, 'redo restores exact migrated IDs/positions/notes');
    assertFixtures('redo');
    const editedImport = plain(baseline);
    edits.deleted(editedImport.items, 'L63'); edits.moved(editedImport.items, 'F243');
    editedImport.items.find(it => it.id === 'F244').note = 'Keep my optional fan notes.';
    SIM.importLayout(editedImport);
    assert.deepEqual(plain(SIM.state.items), editedImport.items, 'edited whole wings import unchanged');
    assertFixtures('edited import');
    assert.deepEqual(fingerprints(), sourceSha256, 'source modules remained frozen throughout verification');
    fs.writeFileSync(path.join(out, 'headless-results.json'), JSON.stringify({
      status: 'PASS', generatedAt: new Date().toISOString(), node: process.version, revision: D.wingReviewRevision,
      baseline: { path: baselinePath, items: baseline.items.length }, defaultItems: design.length,
      stableIds: [...groups.B, ...groups.H, ...groups.nave], appendedIds: groups.appended,
      migrationCases: cases, checks: ['exact full baseline import', 'all deleted/moved/renamed/retuned/hidden/switched/aimed/annotated/recircuited group preservation', 'unrelated/custom/note preservation', 'append ID collision preservation', 'incomplete template skip', 'input immutability', 'repeat idempotence', 'cached fixture type', 'electrical route/type presence', 'actual import undo redo'],
      sourceSha256, limitations: ['Headless services are stubbed; desktop GPU and startup localStorage checks are separate.', 'Passing software preservation does not approve fan concealment, mounting, product performance or construction.']
    }, null, 2) + '\n');
    console.log(`PASS: ${cases.length} conservative migration cases; stable IDs, exact import, actual fixture types/electrical routes and undo/redo.`);
  } finally { study.dispose(); }
}
module.exports = { groups, edits, plain, frozenBaseline, baselinePath };
if (require.main === module) { try { run(); } catch (error) { console.error(error); process.exitCode = 1; } }
