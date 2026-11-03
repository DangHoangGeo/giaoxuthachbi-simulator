/* Saved-layout migration of 1 November 2026 (open items of the owner review): the axis-2′ wall fans
 * move along the wall clear of the axis-2 door wall, and the crossing chandelier L81 and star D311
 * hang from the deeper ridge member. Synthetic in-memory storage only.
 * Run: node scripts/verify_entrance_fit_reload.cjs
 * Checks backup, one-time marker, untouched items moved, user-moved items kept. Software preservation only. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { loadStudyModel, root } = require('./lib/study_model.cjs');
const key = 'thachbi.simulator.v1', suffix = key + '.before-entrance-fit', clone = v => JSON.parse(JSON.stringify(v));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/simulator/design.js'), 'utf8'), context, { filename: 'design.js' });
const D = context.window.CHURCH_SIM_DESIGN, ids = Object.keys(D.entranceFitBefore);
let study = loadStudyModel();
const current = clone(study.SIM.exportLayout());
study.dispose();
assert.equal(current.settings.entranceFitRevision, D.entranceFitRevision, 'a fresh start stores the revision');
const previous = () => {
  const layout = clone(current);
  layout.items = layout.items.map(it => { const was = D.entranceFitBefore[it.id]; return was ? { ...it, pos: [...was.pos], yaw: was.yaw, tilt: was.tilt, ...(was.anchorY !== undefined ? { anchorY: was.anchorY } : {}) } : it; });
  delete layout.settings.entranceFitRevision;
  return layout;
};
const open = layout => loadStudyModel({ storageEntries: [[key, JSON.stringify(layout)]] });
let c;
try {
  c = open(previous());
  assert(c.storage.has(suffix), 'backup written before the change');
  for (const id of ids) {
    const it = c.SIM.item(id), raw = current.items.find(r => r.id === id);
    assert.deepEqual(clone(it.pos), raw.pos, 'moved to the new place: ' + id);
    if (raw.anchorY !== undefined) assert(Math.abs(it.anchorY - raw.anchorY) < 1e-9, 'anchor moved: ' + id);
  }
  assert.equal(JSON.parse(c.storage.get(key)).settings.entranceFitRevision, D.entranceFitRevision, 'durable marker');
  c.dispose(); c = null;
  // A fan the user moved, and a chandelier the user re-hung, stay as the user left them.
  const changed = previous();
  const fan = changed.items.find(it => it.id === 'F-NAVE-H-2P'); fan.pos = [5.6, 4.1, 7.07];
  const lamp = changed.items.find(it => it.id === 'L81'); lamp.anchorY = 12.0;
  c = open(changed);
  assert.deepEqual(clone(c.SIM.item('F-NAVE-H-2P').pos), [5.6, 4.1, 7.07], 'user-moved fan kept');
  assert.equal(c.SIM.item('L81').anchorY, 12.0, 'user anchor kept');
  assert.deepEqual(clone(c.SIM.item('F-NAVE-B-2P').pos), current.items.find(r => r.id === 'F-NAVE-B-2P').pos, 'the untouched twin still moves');
  c.dispose(); c = null;
  console.log(JSON.stringify({ entranceFitReload: 'passed', revision: D.entranceFitRevision, items: ids }));
} finally { c?.dispose(); }
process.exit(0);
