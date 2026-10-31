/* Check the rendered side-wing intrados recipe against native-DXF witnesses.
   Witnesses record source handles/coordinate mapping, not measured site accuracy. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const witness = JSON.parse(fs.readFileSync(path.join(root, 'docs/exterior-23102026/side-witnesses.json'), 'utf8'));
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/porches.js'), 'utf8'), sandbox);
const api = sandbox.window.CHURCH_PORCHES, spec = api.spec.wingArch;
const near = (a, b, label, tolerance = 1e-8) => assert(Math.abs(a - b) < tolerance, `${label}: ${a} != ${b}`);
assert.equal(spec.arcs.length, witness.arcs.length);
for (const arc of witness.arcs) {
  const model = spec.arcs.find(a => a.handle === arc.handle);
  assert(model, `Missing native arc ${arc.handle}`);
  model.centre.forEach((v, i) => near(v, arc.centre_m[i], arc.handle + ' centre'));
  near(model.radius, arc.radius_m, arc.handle + ' radius');
  near(model.angles[0], arc.start_angle_deg, arc.handle + ' start angle');
  near(model.angles[1], arc.end_angle_deg, arc.handle + ' end angle');
}
near(spec.half * 2, witness.dimension_handles.DA5CDC.measurement / 1000, 'Clear column faces');
near(spec.spring, witness.dimension_handles.DA5CEE.measurement / 1000, 'Spring above D47 foot datum');
near(spec.shoulder - spec.spring, witness.dimension_handles.DA5CF1.measurement / 1000, 'Lower arch rise');
near(spec.crown - spec.shoulder, witness.dimension_handles.DA5CF4.measurement / 1000, 'Upper arch rise');
const points = api.wingIntrados();
near(points[0][0], -spec.half, 'Left column face');
near(points.at(-1)[0], spec.half, 'Right column face');
near(Math.max(...points.map(p => p[1])), spec.crown, 'Crown without proxy overshoot');
for (const arc of witness.arcs) for (const endpoint of [arc.start_m, arc.end_m])
  assert(Math.min(...points.map(p => Math.hypot(p[0] - endpoint[0], p[1] - endpoint[1]))) < 1e-8,
    `Curve must include the source endpoint ${arc.handle}`);
for (const point of points.slice(1, -1))
  assert(Math.min(...witness.arcs.map(a => Math.abs(Math.hypot(point[0] - a.centre_m[0], point[1] - a.centre_m[1]) - a.radius_m))) < 1e-8,
    'Each curve vertex must lie on a source circle');
const sagitta = Math.max(...witness.arcs.map(a => {
  let sweep = a.end_angle_deg - a.start_angle_deg;
  if (sweep < 0) sweep += 360;
  return a.radius_m * (1 - Math.cos(sweep * Math.PI / 180 / 48 / 2));
}));
assert(sagitta < 0.0002, 'Display chord error stays below 0.20 mm');
for (const shelf of witness.straight_spring_connections) {
  const length = Math.hypot(shelf.a_m[0] - shelf.b_m[0], shelf.a_m[1] - shelf.b_m[1]);
  near(length, 0.099996392, 'Native impost shelf', 1e-8);
}
const opening = api.spec.openings.window, sourceWindow = witness.opening_profiles.window;
for (const key of ['width', 'bottom', 'leafTop', 'spring', 'radius'])
  near(opening[key], sourceWindow.derived_m[key], 'Outside-window source ' + key);
opening.radii.forEach((r, i) => near(r, sourceWindow.radius_chain_m[i], 'Window moulding radius'));
// Inspect real built wall/glass geometry, not just a duplicated parameter table.
const { loadStudyModel } = require('./lib/study_model.cjs');
const context = loadStudyModel();
let windowBays = 0, panes = 0;
try {
  const { model } = context, T = model.THREE;
  model.building.updateMatrixWorld(true);
  model.building.traverse(bay => {
    if (!/^Inner wall [CG] /.test(bay.name) || / (4–5|8–9)$/.test(bay.name)) return;
    windowBays++;
    const wall = bay.children.find(o => o.name === 'Inner C/G wall with opening');
    assert(wall && wall.geometry.parameters.shapes.holes.length === 2, 'Paired physical wall apertures retained');
    for (const hole of wall.geometry.parameters.shapes.holes)
      near(Math.max(...hole.getPoints(128).map(p => p.y)), sourceWindow.derived_m.crown, 'Wall-hole crown', 1e-6);
    const vertices = wall.geometry.attributes.position;
    for (const x of opening.centres) {
      let distance = Infinity;
      for (let i = 0; i < vertices.count; i++)
        distance = Math.min(distance, Math.hypot(vertices.getX(i) - x, vertices.getY(i) - sourceWindow.derived_m.crown));
      assert(distance < 2e-6, 'Rendered mesh includes native aperture crown');
    }
    for (const mesh of bay.children) {
      if (mesh.name === 'Window stained-glass fanlight') {
        const b = new T.Box3().setFromObject(mesh);
        near(b.min.y, opening.spring, 'Actual fanlight spring', 2e-6);
        near(b.max.y, sourceWindow.derived_m.crown, 'Actual fanlight crown', 2e-6);
        panes++;
      }
      if (mesh.name === 'Inner window clear glass body') {
        const b = new T.Box3().setFromObject(mesh);
        near(b.min.y, opening.bottom, 'Actual glass-body sill', 2e-6);
        near(b.max.y, opening.leafTop, 'Actual glass-body head', 2e-6);
      }
    }
  });
  assert.equal(windowBays, 14, 'Seven paired-window bays on each side');
  assert.equal(panes, 28, 'Two native semicircular fanlights per window bay');
} finally { context.dispose(); }
console.log(JSON.stringify({ status: 'passed', drawing: witness.drawing, arcs: spec.arcs.map(a => a.handle),
  clearColumnSpanM: spec.half * 2, springM: spec.spring, shoulderM: spec.shoulder, crownM: spec.crown,
  maximumChordSagittaMm: sagitta * 1000, nativeWindowBays: windowBays, nativeWindowFanlights: panes, source: witness.source_sha256,
  limits: 'Geometric transcription and display bounds only. Unit/datum confirmation, outer band, extrusion and structural design remain held.' }, null, 2));
