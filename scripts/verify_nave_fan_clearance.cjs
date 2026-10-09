/* Nave wall-fan geometry screen. Uses the actual viewer and fixture builders.
 * Continuous yaw bounds cover every mesh vertex; a sphere also encloses the
 * spinning rotor through every blade angle. This is geometry evidence, not
 * approved product, anchor, service, sightline or ventilation design. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { loadStudyModel, root } = require('./lib/study_model.cjs');

const out = path.resolve(root, process.argv.find(arg => arg.startsWith('--out='))?.slice(6) || 'review/nave-wall-fans-2026-10-09/geometry');
const surrogate = process.argv.includes('--surrogate');
// Comparison mode: put the rejected short `fanWall` bracket at the same sixteen
// positions and record (not assert) its column/structure conflicts.
const shortBracket = process.argv.includes('--short-bracket');
const axes = ['2′', '3', '4', '5', '6', '7', '8', '9'];
const originalIds = ['F244', 'F245', 'F246', 'F247', 'F248', 'F249'];
const expectedOriginalX = { F244: 14.475, F245: 14.475, F246: 23.475, F247: 23.475, F248: 32.475, F249: 32.475 };
const study = loadStudyModel();
try {
  const { SIM, model } = study, T = model.THREE;
  if (shortBracket) {
    const layout = JSON.parse(JSON.stringify(SIM.exportLayout()));
    for (const it of layout.items) if (it.circuit === 'F2') it.type = 'fanWall';
    SIM.importLayout(layout, { record: false });
  }
  if (surrogate) {
    const layout = JSON.parse(JSON.stringify(SIM.exportLayout()));
    const existing = layout.items.filter(it => it.circuit === 'F2');
    for (const it of existing) it.type = 'fanWingWall';
    for (const axis of axes) for (const sign of [-1, 1]) {
      if (existing.some(it => it.pos[0] === model.data.longitudinal[axis] && Math.sign(it.pos[2]) === sign)) continue;
      layout.items.push({ ...existing.find(it => Math.sign(it.pos[2]) === sign), type: 'fanWingWall',
        id: `F-PROBE-${axis}-${sign < 0 ? 'B' : 'H'}`, name: `Nave geometry probe · ${axis} · ${sign < 0 ? 'B' : 'H'}`,
        pos: [model.data.longitudinal[axis], 5.55, sign * 7.07] });
    }
    SIM.importLayout(layout, { record: false });
  }
  model.scene.updateMatrixWorld(true);
  const fans = [...SIM.fixtures.values()].filter(f => f.item.circuit === 'F2');
  assert.equal(fans.length, 16, 'eight F2 wall fans per nave side required');
  const round = n => Math.round(n * 1e9) / 1e9;
  const bounds = b => ({ minimum: b.min.toArray().map(round), maximum: b.max.toArray().map(round) });
  const box = f => new T.Box3().setFromObject(f.root);
  const gap = (a, b) => Math.hypot(...['x', 'y', 'z'].map(k => Math.max(a.min[k] - b.max[k], b.min[k] - a.max[k], 0)));
  const penetrates = (a, b) => ['x', 'y', 'z'].every(k => Math.min(a.max[k], b.max[k]) - Math.max(a.min[k], b.min[k]) > 1e-6);
  const range = (a, b, lo, hi) => {
    const values = [a * Math.cos(lo) + b * Math.sin(lo), a * Math.cos(hi) + b * Math.sin(hi)];
    const stationary = Math.atan2(b, a);
    for (let n = -3; n <= 3; n++) {
      const t = stationary + n * Math.PI;
      if (t >= lo && t <= hi) values.push(a * Math.cos(t) + b * Math.sin(t));
    }
    return [Math.min(...values), Math.max(...values)];
  };
  const sourceFiles = ['Thach_Bi_Viewer/bundle.js', 'Thach_Bi_Viewer/realism.js', 'Thach_Bi_Viewer/simulator/catalog.js',
    'Thach_Bi_Viewer/simulator/design.js', 'Thach_Bi_Viewer/simulator/engine.js', 'scripts/lib/study_model.cjs',
    'scripts/verify_nave_fan_clearance.cjs', 'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx'];
  const buildingBoxes = [];
  model.building.traverse(o => {
    if (o.isMesh && !o.isInstancedMesh) buildingBoxes.push({ name: o.name, box: new T.Box3().setFromObject(o) });
  });
  const fixedFixtures = [...SIM.fixtures.values()].filter(f => f.item.circuit !== 'F2').map(f => ({ f, box: box(f) }));
  const records = [], movingBounds = new Map();
  for (const sign of [-1, 1]) {
    const sideFans = fans.filter(f => Math.sign(f.item.pos[2]) === sign);
    assert.equal(sideFans.length, 8, 'eight fans per side');
    assert.deepEqual(sideFans.map(f => f.item.pos[0]).sort((a, b) => a - b), axes.map(axis => model.data.longitudinal[axis]));
  }
  for (const f of fans) {
    const it = f.item, sign = Math.sign(it.pos[2]);
    assert.equal(it.type, shortBracket ? 'fanWall' : surrogate ? 'fanWingWall' : 'fanNaveWall', 'bracket model required');
    assert.equal(it.pos[1], 5.55); assert.equal(it.pos[2], sign * 7.07);
    assert.equal(it.mount, 'wall'); assert.equal(it.mountYaw, -sign * 90);
    assert.equal(it.yaw, -sign * 90); assert.equal(it.tilt, -38);
    assert.equal(it.hidden, false, 'default-visible fan'); assert.equal(it.on, false, 'visible is separate from operation');
    if (originalIds.includes(it.id)) assert.equal(it.pos[0], expectedOriginalX[it.id], 'existing mounting coordinate must survive');
    assert(f.osc && f.head && f.rotor, 'wall fan articulated geometry required');
    const old = f.osc.rotation.y, beta = -(it.mountYaw || 0) * Math.PI / 180;
    const centreAngle = -(it.yaw - it.mountYaw) * Math.PI / 180;
    const halfSweep = f.type.fan.sweepDeg * Math.PI / 360;
    const lo = beta + centreAngle - halfSweep, hi = beta + centreAngle + halfSweep;
    f.osc.rotation.y = 0; f.root.updateMatrixWorld(true);
    const continuous = new T.Box3(), sampled = new T.Box3(), local = new T.Vector3(), world = new T.Vector3();
    const origin = f.root.localToWorld(f.osc.position.clone());
    let vertexCount = 0;
    const addMovingPoint = (p, radius = 0) => {
      const xr = range(p.x, p.z, lo, hi), zr = range(p.z, -p.x, lo, hi);
      continuous.expandByPoint(new T.Vector3(origin.x + xr[0] - radius, origin.y + p.y - radius, origin.z + zr[0] - radius));
      continuous.expandByPoint(new T.Vector3(origin.x + xr[1] + radius, origin.y + p.y + radius, origin.z + zr[1] + radius));
    };
    f.root.traverse(m => {
      const p = m.geometry?.attributes?.position;
      if (!m.isMesh || !p) return;
      let moving = false;
      for (let ancestor = m.parent; ancestor && ancestor !== f.root; ancestor = ancestor.parent) if (ancestor === f.osc) moving = true;
      for (let i = 0; i < p.count; i++) {
        world.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); vertexCount++;
        if (moving) { local.copy(world); f.root.worldToLocal(local); local.sub(f.osc.position); addMovingPoint(local); }
        else continuous.expandByPoint(world);
      }
    });
    // The blade mesh has finite thickness. Its maximum 3D radius about the
    // rotor pivot encloses all its rotations, regardless of blade phase.
    let rotorRadius = 0;
    f.rotor.traverse(m => {
      const p = m.geometry?.attributes?.position;
      if (!m.isMesh || !p) return;
      for (let i = 0; i < p.count; i++) {
        world.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); f.rotor.worldToLocal(world);
        rotorRadius = Math.max(rotorRadius, world.length());
      }
    });
    const rotorCentre = f.rotor.getWorldPosition(new T.Vector3());
    f.root.worldToLocal(rotorCentre); rotorCentre.sub(f.osc.position); addMovingPoint(rotorCentre, rotorRadius);
    for (let degrees = -40; degrees <= 40; degrees += 5) {
      f.osc.rotation.y = -(it.yaw - it.mountYaw + degrees) * Math.PI / 180;
      f.root.updateMatrixWorld(true); sampled.union(box(f));
    }
    f.osc.rotation.y = old; f.root.updateMatrixWorld(true);
    const conservative = continuous.clone().union(sampled);
    assert([...conservative.min.toArray(), ...conservative.max.toArray()].every(Number.isFinite));
    const maxOutwardZ = sign > 0 ? conservative.max.z : -conservative.min.z;
    if (!shortBracket) assert(maxOutwardZ <= 7.07 + 1e-6, it.id + ': body passes through modeled side-column face');
    assert(conservative.min.y > 4.311, it.id + ': fan envelope overlaps nave window/door crown');
    assert(conservative.max.y < 6.24, it.id + ': fan envelope enters lowest side-beam carved bracket band');
    assert(conservative.min.y >= 2.4, it.id + ': envelope below existing project floor clearance');
    const collisions = buildingBoxes.filter(o => penetrates(conservative, o.box));
    if (!shortBracket) assert.equal(collisions.length, 0, it.id + ': intersects modeled structure: ' + collisions.map(o => o.name).join(', '));
    const fixtureChecks = fixedFixtures.map(o => ({ id: o.f.item.id, name: o.f.item.name, hidden: o.f.item.hidden,
      clearanceM: round(gap(conservative, o.box)), intersection: penetrates(conservative, o.box) })).filter(o => o.clearanceM < 1.25);
    assert(!fixtureChecks.some(o => o.intersection), it.id + ': intersects another fixture');
    movingBounds.set(it.id, conservative);
    records.push({ id: it.id, axis: axes.find(axis => model.data.longitudinal[axis] === it.pos[0]), side: sign < 0 ? 'B' : 'H',
      type: it.type, mountingPositionM: it.pos, yawDegrees: it.yaw, tiltDegrees: it.tilt, hidden: it.hidden, on: it.on,
      continuousYawDegrees: [-40, 40], meshVertexCount: vertexCount, rotorAllAngleSphereRadiusM: round(rotorRadius),
      continuousVertexAndRotorEnvelope: bounds(continuous), sampled17YawFullMeshAABB: bounds(sampled), conservativeEnvelope: bounds(conservative),
      modeledWindowCrownGapM: round(conservative.min.y - 4.311), minimumAboveNaveFloorM: round(conservative.min.y),
      modeledSideColumnFaceMaximumPenetrationM: round(Math.max(0, maxOutwardZ - 7.07)), nearbyFixtures: fixtureChecks,
      ...(shortBracket ? { intersectedBuildingMeshes: collisions.map(o => o.name) } : {}) });
  }
  for (const id of originalIds) assert(fans.some(f => f.item.id === id), 'preserve existing ID ' + id);
  const pairs = [];
  for (let a = 0; a < fans.length; a++) for (let b = a + 1; b < fans.length; b++) {
    if (Math.sign(fans[a].item.pos[2]) !== Math.sign(fans[b].item.pos[2])) continue;
    const aa = movingBounds.get(fans[a].item.id), bb = movingBounds.get(fans[b].item.id);
    assert(!penetrates(aa, bb), 'nave fan motion envelopes overlap');
    pairs.push({ a: fans[a].item.id, b: fans[b].item.id, clearanceM: round(gap(aa, bb)) });
  }
  const report = { status: 'Software geometry screen passed; physical design remains ENGINEERING HOLD',
    testedLayout: surrogate ? 'In-memory extraOutreach 0.26 m fanWingWall surrogate at proposed F2 axes; no saved layout mutation'
      : 'Actual default F2 fanNaveWall layout; no saved layout mutation',
    modelRevision: model.data.revision, units: 'm', sources: sourceFiles.map(file => ({ path: file, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex') })),
    dimensionBasis: { workbook: 'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx', modelGridAxisMetres: 'Model grid!E10:E17',
      CGAxisMetres: 'Model grid!E30 and E33', naveClearWidth: 'Dimensions!H36, 14.500 m inner C/G faces, printed plan sheet 6/file 4',
      windowCrown: 'Dimensions!H456, DERIVED 4.311 m nave floor to crown, printed sheet 12/file 8',
      doorCrown: 'Dimensions!H459, DERIVED 4.311 m nave floor to crown, printed sheet 13/file 9',
      wallTop: 'Dimensions!H457 and H460, DERIVED 7.057 m; separate from 7.130 m roof reference',
      mountingFace: 'MODEL TRANSCRIPTION 0.58 m side-column shaft at Z±7.36 m, inner face Z±7.07 m; unknown physical section RFI-S07' },
    method: 'For each moving mesh vertex, evaluate endpoints and every stationary angle of a*cos(yaw)+b*sin(yaw) over the full ±40° interval. Union with the rotor all-angle sphere and 17 transformed full-mesh AABBs. Test strict volume penetration against all original building mesh AABBs and all other fixture AABBs; mounting face contact is permitted.',
    fans: records.sort((a, b) => a.side.localeCompare(b.side) || a.mountingPositionM[0] - b.mountingPositionM[0]), fanPairs: pairs,
    limits: ['The .40 m pivot outreach is a visualization concept; actual product/bracket dimensions, support loads, anchors, vibration and corrosion remain unknown',
      'Continuous bounds apply to these finite meshes; they do not establish installation tolerance, selected-product motion stops or required service clearance',
      'Axis 2′ entrance return wall and nave openings/side beams are included in the structure screen; wall buildup and surveyed face offsets remain unconfirmed',
      'No screen establishes light-field/blade interaction, lux, speech/noise/feedback, occupied-zone airflow, thermal comfort, maintenance access or inclusive sightline/concealment approval',
      'Model visible and OFF state is separate from a physical installation and from hardware operation'] };
  fs.mkdirSync(out, { recursive: true });
  if (shortBracket) {
    const worst = Math.max(...records.map(r => r.modeledSideColumnFaceMaximumPenetrationM));
    assert(worst > 0, 'comparison expects the short bracket to enter the modeled column face');
    fs.writeFileSync(path.join(out, 'short-bracket-comparison.json'), JSON.stringify({
      status: 'REJECTED GEOMETRY: displayed layout uses fanNaveWall; this is the old fanWall bracket at the same positions',
      modelRevision: model.data.revision, units: 'm', sixteenFansTested: records.length,
      fansEnteringColumnFace: records.filter(r => r.modeledSideColumnFaceMaximumPenetrationM > 0).map(r => r.id),
      maximumPenetrationIntoColumnFaceM: worst,
      perFan: records.map(r => ({ id: r.id, penetrationM: r.modeledSideColumnFaceMaximumPenetrationM, buildingMeshes: r.intersectedBuildingMeshes })),
      note: 'Software geometry screen only; real product and bracket dimensions are unknown.' }, null, 2) + '\n');
    console.log(JSON.stringify({ shortBracketComparison: 'recorded', fansEnteringColumnFace: records.filter(r => r.modeledSideColumnFaceMaximumPenetrationM > 0).length, maximumPenetrationM: worst }));
    return;
  }
  fs.writeFileSync(path.join(out, 'geometry.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ naveFanGeometryScreen: 'passed', testedLayout: surrogate ? 'surrogate' : 'default', naveWallFans: fans.length,
    minimumWindowCrownGapM: Math.min(...records.map(r => r.modeledWindowCrownGapM)),
    minimumOtherFixtureAABBGapM: Math.min(...records.flatMap(r => r.nearbyFixtures.map(p => p.clearanceM))), constructionApproved: false }));
} finally { study.dispose(); }
