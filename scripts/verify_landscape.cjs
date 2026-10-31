/* Presentation context only: these checks do not establish site access or grading. */
'use strict';
const assert = require('node:assert/strict');
const {loadExteriorModel} = require('./lib/exterior_model.cjs');
const {model} = loadExteriorModel(), T = model.THREE;
const landscape = model.building.getObjectByName('Two rows of courtyard trees');
assert(landscape, 'existing landscape group');
model.scene.updateMatrixWorld(true);
const children = landscape.children;
const lawns = children.filter(o => o.name === 'Proposed lawn beyond courtyard');
const beds = children.filter(o => o.name === 'Tree bed soil · presentation concept');
const trees = children.filter(o => /^Tree \d+ · (left|right) row$/.test(o.name));
assert.equal(lawns.length, 2); assert.equal(beds.length, 16); assert.equal(trees.length, 16);
const ground = new T.Box3().setFromObject(model.scene.getObjectByName('Presentation ground'));
for (const lawn of lawns) {
  const box = new T.Box3().setFromObject(lawn);
  assert(box.min.y > ground.max.y, 'lawn is visible above presentation ground');
  assert(box.max.z < -22.3 || box.min.z > 22.3, 'lawn stays beyond modeled side approach envelope');
  assert.match(lawn.userData.status, /UNSURVEYED/);
}
for (const bed of beds) {
  assert(Math.abs(Math.abs(bed.position.z) - 23.2) < 1e-8, 'soil remains in existing tree rows');
  assert(Math.abs(bed.geometry.parameters.radius - .66) < 1e-8, 'soil fits inside the existing edging');
}
const display = model.batches.get(landscape);
assert(display && display.children.some(o => o.material.name === 'Proposed grass · presentation only'));
assert(display.children.some(o => o.material.name === 'Proposed tree-bed soil'));
console.log(JSON.stringify({landscape:'passed', lawns:lawns.length, beds:beds.length, trees:trees.length, limits:'Unsurveyed presentation context; grading, accessibility and drainage remain pending.'}));
