/* Saved-layout migration of 1 November 2026 (nave centre lighting, wing downlights).
 * Synthetic in-memory storage only: the previous layout is built from the recommended design and the frozen
 * "before" tables of design.js. Run: node scripts/verify_nave_wing_lighting_reload.cjs
 * Checks the actual engine start-up path: full backup, one-time durable marker, user changes kept,
 * a deletion that stays deleted on the next reload, and a rolled-back start-up when the save fails.
 * This verifies software preservation only; engineering holds on the wing and nave lights remain. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { loadStudyModel, root } = require('./lib/study_model.cjs');
const key = 'thachbi.simulator.v1', suffix = key + '.before-nave-wing-lighting', clone = v => JSON.parse(JSON.stringify(v));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/simulator/design.js'), 'utf8'), context, { filename: 'design.js' });
const D = context.window.CHURCH_SIM_DESIGN;
const lightIds = ['B', 'H'].flatMap(code => D.naveWingLightIds(code)), tieIds = Object.keys(D.naveCentreBefore), chandelierIds = Object.keys(D.wingChandelierBefore);
assert.equal(lightIds.length, 8); assert.equal(tieIds.length, 28); assert.deepEqual(chandelierIds, ['L63', 'L65', 'L67', 'L69']);

let study = loadStudyModel();
const current = clone(study.SIM.exportLayout());
study.dispose();
assert.equal(current.settings.naveWingLightingRevision, D.naveWingLightingRevision, 'a fresh start stores the revision');
const names = { L63: 'Wing light · B · front block · back rows', L65: 'Wing light · B · rear block · back rows', L67: 'Wing light · H · front block · back rows', L69: 'Wing light · H · rear block · back rows' };
function previousLayout() {
  const layout = clone(current);
  layout.items = layout.items.filter(it => !lightIds.includes(it.id)).map(it => {
    const was = D.naveCentreBefore[it.id];
    return was ? { ...it, pos: [...was.pos], yaw: was.yaw, tilt: was.tilt, beam: was.beam, lumens: was.lumens, anchorY: was.anchorY } : it;
  });
  for (const id of chandelierIds) {
    const was = D.wingChandelierBefore[id];
    layout.items.push({ id, type: was.type, name: names[id], circuit: was.circuit, mount: was.mount, pos: [...was.pos], yaw: was.yaw, tilt: was.tilt, mountYaw: 0, anchorY: was.anchorY, on: true, hidden: false, dim: 1, params: {}, lumens: was.lumens, cct: 2700, beam: was.beam, shadow: false });
  }
  delete layout.settings.naveWingLightingRevision;
  return layout;
}
const open = (layout, rejectStorage) => loadStudyModel({ storageEntries: [[key, JSON.stringify(layout)]], rejectStorage });
let c;
try {
  // 1. An untouched previous layout moves once, with a full backup and a durable marker.
  const previous = previousLayout();
  c = open(previous);
  const { SIM, storage } = c;
  assert(storage.has(suffix), 'full backup written before the change');
  const backup = JSON.parse(storage.get(suffix));
  assert.deepEqual(clone(backup.items.map(it => it.id)), clone(previous.items.map(it => it.id)), 'the backup holds the previous layout exactly');
  assert(backup.items.find(it => it.id === 'L63') && !backup.items.find(it => it.id === 'L-WING-B-FI'), 'backup still has the chandelier');
  for (const id of chandelierIds) assert(!SIM.item(id), 'chandelier retired: ' + id);
  for (const id of lightIds) { const it = SIM.item(id); assert(it && it.type === 'projector24' && it.circuit === 'L8' && it.lumens === 2100 && it.beam === 24, 'downlight added: ' + id); }
  for (const id of tieIds) { const it = SIM.item(id), raw = current.items.find(r => r.id === id); assert.deepEqual(clone(it.pos), raw.pos, 'head moved: ' + id); assert(it.yaw === raw.yaw || Math.abs(it.yaw - raw.yaw) < 1e-9); assert.equal(it.beam, raw.beam); }
  const saved = JSON.parse(storage.get(key));
  assert.equal(saved.settings.naveWingLightingRevision, D.naveWingLightingRevision, 'durable marker');
  assert.equal(SIM.state.items.length, current.items.length, 'same item count as the new default');
  // 2. A deletion made afterwards stays deleted on the next reload (the marker is current).
  saved.items = saved.items.filter(it => it.id !== 'L-WING-H-RO' && it.id !== 'L5');
  c.dispose(); c = null;
  c = open(saved);
  assert(!c.SIM.item('L-WING-H-RO') && !c.SIM.item('L5'), 'a deleted downlight and a deleted head stay deleted');
  assert(!c.storage.has(suffix), 'no second backup: the revision is applied once');
  c.dispose(); c = null;
  // 3. What the user changed stays as the user left it.
  const edited = previousLayout(), at = id => edited.items.find(it => it.id === id);
  at('L13').pos[2] = 2.3; at('L21').yaw += 5; at('L25').lumens = 1800; at('L5').dim = 0.4; at('L5').on = false;
  at('L63').pos[0] = 38.5;                 // wing B: the user moved a chandelier, so both stay and no B downlight appears
  at('L67').dim = 0.5;                     // wing H: untouched except for its dimmer; replaced, dimmer carried over
  edited.items = edited.items.filter(it => it.id !== 'L30');
  c = open(edited);
  assert.deepEqual(clone(c.SIM.item('L13').pos), clone(at('L13').pos), 'moved head stays'); assert.equal(c.SIM.item('L21').yaw, at('L21').yaw, 're-aimed head stays'); assert.equal(c.SIM.item('L25').lumens, 1800, 'retuned head stays');
  assert(c.SIM.item('L5').on === false && c.SIM.item('L5').dim === 0.4 && c.SIM.item('L5').pos[2] === 0.9, 'untouched head moves and keeps its switch and dimmer');
  assert(!c.SIM.item('L30'), 'deleted head stays deleted');
  assert(c.SIM.item('L63') && c.SIM.item('L65') && ['L-WING-B-FI', 'L-WING-B-FO', 'L-WING-B-RI', 'L-WING-B-RO'].every(id => !c.SIM.item(id)), 'wing B keeps its user-changed chandeliers');
  assert(!c.SIM.item('L67') && !c.SIM.item('L69') && ['L-WING-H-FI', 'L-WING-H-FO'].every(id => c.SIM.item(id).dim === 0.5), 'wing H is replaced; the dimmer of its chandelier carries over');
  c.dispose(); c = null;
  // 4. A failed durable save rolls the start-up back and retries later.
  c = open(previousLayout(), (k, v) => k === key && JSON.parse(v).settings.naveWingLightingRevision);
  assert(c.SIM.item('L63') && !c.SIM.item('L-WING-B-FI'), 'failed persistence restores the chandelier');
  assert(!c.SIM.state.settings.naveWingLightingRevision, 'failed migration is retried later');
  console.log(JSON.stringify({ reload: 'passed', fullBackup: true, durableMarker: true, appliedOnce: true, userChangesRetained: true, deletionRetained: true, failedSave: 'rolled back' }));
} finally { c?.dispose(); }
