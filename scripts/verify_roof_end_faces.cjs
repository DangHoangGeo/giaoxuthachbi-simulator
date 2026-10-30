/* Actual assembled roof meshes, not a construction or flashing check. */
'use strict';
const assert = require('node:assert/strict');
const {loadExteriorModel} = require('./lib/exterior_model.cjs');
const {model, api} = loadExteriorModel();
const T = model.THREE, nodes = [];
model.roofs.updateMatrixWorld(true);
model.roofs.traverse(o => { if (o.isMesh) nodes.push(o); });
const named = name => nodes.filter(o => o.name === name);
const bounds = o => new T.Box3().setFromObject(o);
const eps = .002; // software comparison, not a construction tolerance
const rear = api.CHURCH_ROOFLINE.spec.rear.face;
const side = api.CHURCH_ROOFLINE.spec.side.face;
for (const [name, count] of [
  ['Continuous principal roof, valley clipped', 2],
  ['Veranda roof beyond side projection', 2],
  ['Planar side-gable roof meeting main valley', 4],
]) assert.equal(named(name).length, count, `${name}: retained roof surfaces`);
for (const o of nodes.filter(o => /^(Continuous principal roof, valley clipped|Veranda roof beyond side projection|Main eaves trim|Veranda eaves trim|Longitudinal ridge cap|Terracotta half-round ridge cap)$/.test(o.name)))
  assert(bounds(o).max.x <= rear + eps, `${o.name}: no projection beyond sanctuary-end face`);
for (const o of named('Planar side-gable roof meeting main valley')) {
  const b = bounds(o);
  assert(b.min.z >= -side - eps && b.max.z <= side + eps, 'wing roof ends behind wing face');
  assert(Math.abs(b.max.y - 9.45) < eps && Math.abs(b.min.y - 6.325) < eps, 'wing roof height is retained');
}
for (const o of named('Continuous principal roof, valley clipped')) {
  const b = bounds(o);
  assert(Math.abs(b.min.x - 4.87) < eps && Math.abs(b.max.y - 12.472) < eps, 'main roof origin and ridge are retained');
}
console.log(JSON.stringify({roofEnds:'passed', rearFace:rear, wingFaces:[-side, side], limits:'Display geometry only; junction construction, ISSUE-R05 and ISSUE-R06 remain open.'}));
