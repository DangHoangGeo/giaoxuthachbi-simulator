/* Saved-layout migration of 1 November 2026 (shrine lights L115-L118 move from the back face of the axis-10 frame
 * to the inner rib of the gilded side vaults, owner decision: the vaults meet the frame).
 * Synthetic in-memory storage only: the previous layout is built from the recommended design and the frozen
 * "before" table of design.js. Run: node scripts/verify_side_vault_lights_reload.cjs
 * Checks the actual engine start-up path: full backup, one-time durable marker, user changes kept,
 * a deletion that stays deleted on the next reload, and a rolled-back start-up when the save fails.
 * This verifies software preservation only; the lighting and mounting holds on these fittings remain. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { loadStudyModel, root } = require('./lib/study_model.cjs');
const key = 'thachbi.simulator.v1', suffix = key + '.before-side-vault-lights', clone = v => JSON.parse(JSON.stringify(v));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/simulator/design.js'), 'utf8'), context, { filename: 'design.js' });
const D = context.window.CHURCH_SIM_DESIGN;
const ids = Object.keys(D.sideVaultLightsBefore);
assert.deepEqual(ids, ['L115', 'L116', 'L117', 'L118']);

const study = loadStudyModel();
const current = clone(study.SIM.exportLayout());
study.dispose();
assert.equal(current.settings.sideVaultLightsRevision, D.sideVaultLightsRevision, 'a fresh start stores the revision');
for (const id of ids) {
  const it = current.items.find(r => r.id === id), was = D.sideVaultLightsBefore[id];
  assert(it && it.mount === 'pendant' && it.circuit === 'L3' && it.type === was.type && it.name === was.name, 'new default hangs from the vault: ' + id);
  assert(it.lumens < was.lumens && it.params.finish === 'chamber' && Math.abs(it.pos[0] - 44.42) > 0.2 && it.pos[1] < 7, 'new default is lower, dimmer and in the chamber lacquer: ' + id);
}
function previousLayout() {
  const layout = clone(current);
  for (const id of ids) {
    const it = layout.items.find(r => r.id === id), was = D.sideVaultLightsBefore[id];
    Object.assign(it, { pos: [...was.pos], yaw: was.yaw, tilt: was.tilt, mount: was.mount, mountYaw: 0, lumens: was.lumens, beam: was.beam, params: { ...it.params, finish: was.finish } });
    delete it.anchorY;
  }
  delete layout.settings.sideVaultLightsRevision;
  return layout;
}
const open = (layout, rejectStorage) => loadStudyModel({ storageEntries: [[key, JSON.stringify(layout)]], rejectStorage });
let c;
try {
  // 1. An untouched previous layout moves once, with a full backup and a durable marker.
  const previous = previousLayout();
  previous.items.find(r => r.id === 'L115').on = false; previous.items.find(r => r.id === 'L115').dim = 0.4; previous.items.find(r => r.id === 'L115').note = 'kept note';
  c = open(previous);
  const { SIM, storage } = c;
  assert(storage.has(suffix), 'full backup written before the change');
  const backup = JSON.parse(storage.get(suffix));
  assert.deepEqual(clone(backup.items), clone(previous.items), 'the backup holds the previous layout exactly');
  for (const id of ids) {
    const it = SIM.item(id), raw = current.items.find(r => r.id === id);
    assert.deepEqual(clone(it.pos), raw.pos, 'moved: ' + id);
    assert(Math.abs(it.yaw - raw.yaw) < 1e-9 && Math.abs(it.tilt - raw.tilt) < 1e-9, 'aimed: ' + id);
    assert(it.mount === 'pendant' && it.anchorY === raw.anchorY && it.lumens === raw.lumens && it.beam === raw.beam && it.params.finish === 'chamber', 'mount, anchor, output and finish: ' + id);
  }
  const l115 = SIM.item('L115');
  assert(l115.on === false && l115.dim === 0.4 && l115.note === 'kept note', 'switching, dimmer and note are kept');
  assert.equal(JSON.parse(storage.get(key)).settings.sideVaultLightsRevision, D.sideVaultLightsRevision, 'durable marker');
  assert.equal(SIM.state.items.length, current.items.length, 'same item count as the new default');
  // 2. A deletion made afterwards stays deleted on the next reload (the marker is current).
  const saved = JSON.parse(storage.get(key));
  saved.items = saved.items.filter(it => it.id !== 'L118');
  c.dispose(); c = null;
  c = open(saved);
  assert(!c.SIM.item('L118') && c.SIM.item('L117'), 'a deleted head stays deleted');
  assert(!c.storage.has(suffix), 'no second backup: the revision is applied once');
  c.dispose(); c = null;
  // 3. What the user changed stays as the user left it.
  const edited = previousLayout(), at = id => edited.items.find(it => it.id === id);
  at('L115').lumens = 250;        // retuned
  at('L116').pos[2] -= 0.3;       // moved
  at('L117').yaw += 5;            // re-aimed
  edited.items = edited.items.filter(it => it.id !== 'L118'); // deleted before the move
  c = open(edited);
  assert.equal(c.SIM.item('L115').lumens, 250); assert.equal(c.SIM.item('L115').mount, 'wall', 'retuned head stays where it is');
  assert.deepEqual(clone(c.SIM.item('L116').pos), clone(at('L116').pos), 'moved head stays'); assert.equal(c.SIM.item('L116').mount, 'wall');
  assert.equal(c.SIM.item('L117').yaw, at('L117').yaw, 're-aimed head stays'); assert.equal(c.SIM.item('L117').mount, 'wall');
  assert(!c.SIM.item('L118'), 'a head deleted before the move is not added again');
  c.dispose(); c = null;
  // 4. A failed durable save rolls the start-up back and retries later.
  c = open(previousLayout(), (k, v) => k === key && JSON.parse(v).settings.sideVaultLightsRevision);
  assert(ids.every(id => c.SIM.item(id).mount === 'wall'), 'failed persistence restores the wall-mounted heads');
  assert(!c.SIM.state.settings.sideVaultLightsRevision, 'failed migration is retried later');
  console.log(JSON.stringify({ reload: 'passed', fullBackup: true, durableMarker: true, appliedOnce: true, userChangesRetained: true, deletionRetained: true, failedSave: 'rolled back' }));
} finally { c?.dispose(); }
