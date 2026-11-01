/* Saved wing downlight migration: backup, edits, deletion, reload and failed storage. */
'use strict';
const assert = require('node:assert/strict');
const { loadStudyModel } = require('./lib/study_model.cjs');
const key = 'thachbi.simulator.v1', suffix = key + '.before-wing-roof-lighting';
const clone = v => JSON.parse(JSON.stringify(v));
let c = loadStudyModel();
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../Thach_Bi_Viewer/simulator/design.js'), 'utf8'), context);
const design = context.window.CHURCH_SIM_DESIGN, current = clone(c.SIM.exportLayout()); c.dispose();
assert.equal(current.settings.wingRoofLightingRevision, design.wingRoofLightingRevision);
const previous = () => {
  const layout = clone(current); delete layout.settings.wingRoofLightingRevision;
  layout.items = layout.items.map(it => { const old = design.wingRoofLightingBefore[it.id]; if (!old) return it; const { finish, ...fields } = old; return { ...it, ...clone(fields), params: { ...it.params, finish } }; });
  return layout;
};
const open = (layout, rejectStorage) => loadStudyModel({ storageEntries: [[key, JSON.stringify(layout)]], rejectStorage });
let before = previous();
before.items.find(it => it.id === 'L-WING-B-FI').dim = 0.4;
before.items.find(it => it.id === 'L-WING-B-FO').pos[0] += 0.1;
before.items.find(it => it.id === 'L-WING-B-RI').lumens = 1900;
before.items = before.items.filter(it => it.id !== 'L-WING-B-RO');
try {
  c = open(before);
  assert.deepEqual(JSON.parse(c.storage.get(suffix)).items, before.items, 'complete backup');
  assert.equal(c.SIM.item('L-WING-B-FI').lumens, 3000);
  assert.equal(c.SIM.item('L-WING-B-FI').dim, 0.4);
  assert.equal(c.SIM.item('L-WING-B-FO').pos[0], 39.04, 'moved item kept');
  assert.equal(c.SIM.item('L-WING-B-RI').lumens, 1900, 'retuned item kept');
  assert(!c.SIM.item('L-WING-B-RO'), 'deleted item stays deleted');
  let saved = JSON.parse(c.storage.get(key));
  assert.equal(saved.settings.wingRoofLightingRevision, design.wingRoofLightingRevision);
  c.dispose(); c = open(saved);
  assert(!c.storage.has(suffix) && !c.SIM.item('L-WING-B-RO'), 'migration happens once');
  c.dispose();
  c = open(previous(), (k, v) => k === key && JSON.parse(v).settings.wingRoofLightingRevision === design.wingRoofLightingRevision);
  assert.equal(c.SIM.item('L-WING-B-FI').lumens, 2100, 'failed save rolls back');
  assert(!c.SIM.state.settings.wingRoofLightingRevision, 'failed migration retries');
  console.log('Wing roof lighting reload, edits, deletion and rollback: passed');
} finally { c.dispose(); }
