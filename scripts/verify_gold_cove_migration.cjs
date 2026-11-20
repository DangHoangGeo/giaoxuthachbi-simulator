/* Scoped migration checks use synthetic layouts; no browser storage is accessed. */
'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync('Thach_Bi_Viewer/simulator/design.js', 'utf8'), context);
const D = context.window.CHURCH_SIM_DESIGN, before = D.goldCoveBefore;
const ids = ['L115', 'L116', 'L117', 'L118'];
const old = ids.map(id => ({ id, ...before[id], mount: 'pendant', params: { finish: 'chamber' }, on: false, note: 'retain' }));
const design = ids.map(id => ({ id, pos: [46, 5.903, id.endsWith('5') || id.endsWith('6') ? -4.14 : 4.14], anchorY: 6.063, yaw: 10, tilt: -30, lumens: 50 }));
const migrated = D.upgradeGoldCove(old, design);
for (let i = 0; i < ids.length; i++) { assert.deepEqual([...migrated[i].pos], design[i].pos); assert.equal(migrated[i].on, false); assert.equal(migrated[i].note, 'retain'); }
for (const change of [{ anchorY: undefined }, { pos: [44, 2, 3] }, { lumens: 300 }, { yaw: 1 }]) {
  const edited = { ...old[0], ...change }; assert.equal(D.upgradeGoldCove([edited], design)[0], edited, 'modified or incomplete item is preserved');
}
const previous = old[0], pos = [44.68, 6.003, -4.14], dx = 48.83 - pos[0], dz = -5.5 - pos[2], dy = 4.1 - (pos[1] - .14);
const interim = { ...previous, pos, anchorY: 6.063, yaw: Math.atan2(dz, dx)*180/Math.PI, tilt: Math.atan2(dy, Math.hypot(dx, dz))*180/Math.PI, lumens: 90 };
assert.deepEqual([...D.upgradeGoldCove([interim], design)[0].pos], design[0].pos, 'interim saved version moves');
const finish = { id: 'L106', name: 'Crucifix accent · B', params: { finish: 'chamber' } };
assert.equal(D.upgradeGoldCove([finish], design)[0].params.finish, 'gilt');
const custom = { ...finish, params: { finish: 'metal' } }; assert.equal(D.upgradeGoldCove([custom], design)[0], custom);
assert.equal(D.upgradeGoldCove([], design).length, 0, 'deleted items stay deleted');
console.log('Gold-cove migration: prior and interim layouts, custom edits, deletion and finish passed.');
