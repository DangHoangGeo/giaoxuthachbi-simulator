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
// Owner, 8 Nov 2026: the outside window type (E26) stands in the outer B/H porch wall again, open;
// the inner C/G wall has the single inside opening (2.25 m, semicircular head holding the M lunette).
const { loadStudyModel } = require('./lib/study_model.cjs');
const context = loadStudyModel();
let windowBays = 0, panes = 0, outerCrowns = 0;
try {
  const { model } = context, T = model.THREE, P = api.spec, inner = P.openings.innerWindow;
  assert.equal(P.outer.window, opening, 'outer wall uses the native outside window type');
  model.building.updateMatrixWorld(true);
  const outer = [];
  model.building.traverse(o => { if (o.isMesh && o.name.startsWith('Porch outer wall')) outer.push(o); });
  assert.equal(outer.length, 1, 'one merged outer porch wall');
  const v = outer[0].geometry.attributes.position, A = context.model.data?.longitudinal || model.data.longitudinal;
  for (const s of [-1, 1]) for (const [from, to] of P.runs) {
    const keys = Object.keys(A).filter(k => A[k] >= A[from] - 1e-6 && A[k] <= A[to] + 1e-6).sort((a, b) => A[a] - A[b]);
    for (let i = 0; i < keys.length - 1; i++) {
      const c = (A[keys[i]] + A[keys[i + 1]]) / 2;
      if (P.stairBays.some(x => Math.abs(x - c) < .6)) continue;
      for (const u of opening.centres) {
        let distance = Infinity;
        for (let k = 0; k < v.count; k++) if (Math.sign(v.getZ(k)) === s)
          distance = Math.min(distance, Math.hypot(v.getX(k) - (c + u), v.getY(k) - sourceWindow.derived_m.crown));
        assert(distance < 2e-5, 'Rendered outer wall includes the native aperture crown');
        outerCrowns++;
      }
    }
  }
  model.building.traverse(bay => {
    if (!/^Inner wall [CG] /.test(bay.name) || / (4–5|8–9|11–12)$/.test(bay.name)) return;
    windowBays++;
    const wall = bay.children.find(o => o.name === 'Inner C/G wall with opening');
    assert(wall && wall.geometry.parameters.shapes.holes.length === 1, 'One inner wall aperture per window bay');
    near(Math.max(...wall.geometry.parameters.shapes.holes[0].getPoints(128).map(p => p.y)), inner.spring + inner.radius, 'Inner wall-hole crown', 1e-6);
    for (const mesh of bay.children) {
      if (mesh.name === 'Inner window M lunette · nave face') {
        const b = new T.Box3().setFromObject(mesh);
        near(b.min.y, inner.spring, 'Lunette spring', 2e-6);
        near(b.max.y, inner.spring + inner.radius, 'Lunette crown', 2e-6);
        panes++;
      }
      if (mesh.name === 'Inner window clear glass body') {
        const b = new T.Box3().setFromObject(mesh);
        near(b.min.y, inner.bottom, 'Actual glass-body sill', 2e-6);
        near(b.max.y, inner.leafTop, 'Actual glass-body head', 2e-6);
      }
    }
  });
  assert.equal(windowBays, 12, 'Six inner window bays on each side (11–12 has doors since 7 Nov 2026)');
  assert.equal(panes, 12, 'One M lunette (nave face) per inner window');
  assert.equal(outerCrowns, 24, 'Two native outside-window crowns in each of the 12 outer window bays');
} finally { context.dispose(); }
console.log(JSON.stringify({ status: 'passed', drawing: witness.drawing, arcs: spec.arcs.map(a => a.handle),
  clearColumnSpanM: spec.half * 2, springM: spec.spring, shoulderM: spec.shoulder, crownM: spec.crown,
  maximumChordSagittaMm: sagitta * 1000, innerWindowBays: windowBays, innerLunettes: panes, outerNativeCrowns: outerCrowns, source: witness.source_sha256,
  limits: 'Geometric transcription and display bounds only. Unit/datum confirmation, outer band, extrusion and structural design remain held.' }, null, 2));
