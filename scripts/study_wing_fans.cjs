/* Bounded wall-fan option sweep in the actual isolated study model.
 * No source model, user layout, physics, electrical export or register is edited.
 * Run: node scripts/study_wing_fans.cjs [output-directory]
 * Baseline: review/wing-options-2026-10-09/baseline-layout.json, explicitly
 * imported before comparison; later recommended-default edits are not inputs.
 * Output is DERIVED design-development evidence; no layout is selected here.
 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { loadStudyModel, root, sources } = require('./lib/study_model.cjs');
const out = path.resolve(process.argv[2] || path.join(root, 'review/wing-options-2026-10-09/fan-sweep'));
assert(process.argv.length <= 3, 'Usage: node scripts/study_wing_fans.cjs [output-directory]');
const clone = value => JSON.parse(JSON.stringify(value));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const layoutCopy = SIM => { const layout = clone(SIM.exportLayout()); delete layout.savedAt; return layout; };
const baselineFile = 'review/wing-options-2026-10-09/baseline-layout.json';
const baselineBytes = fs.readFileSync(path.join(root, baselineFile)), frozenBaseline = JSON.parse(baselineBytes);
assert(frozenBaseline.schema === 1 && Array.isArray(frozenBaseline.items) && frozenBaseline.items.length, 'frozen baseline layout schema 1 with equipment required');
const wingIds = ['F240', 'F241', 'F242', 'F243'];
const optionalNaveIds = ['F244', 'F245', 'F246', 'F247', 'F248', 'F249'];
const heights = [2.7, 3.2, 3.7], speeds = [1, 2], twoTargets = [9.5, 10.15, 11.0], fourFrontTargets = [8.6, 9.0];
const threshold = { low: 0.3, high: 0.8, unit: 'm/s', basis: 'Existing project comparison brief; not an established statutory requirement' };
const parameters = {
  heightsModelYMetres: heights, speeds, oscillate: true, fanType: 'fanWall', diameterMetres: 0.45,
  outerGableCentreAbsZMetres: 13.249, modeledWallThicknessMetres: 0.3, innerFaceAbsZMetres: 13.099, mountingAbsZMetres: 13.06,
  windowsXMetres: [[37.675, 38.675], [42.475, 43.475]], windowTopModelYMetres: 3.608,
  twoFans: { xMetres: [40.26, 40.86], targetXMetres: [38.94, 42.22], targetAbsZMetres: twoTargets },
  fourFans: { xMetres: [39.15, 39.95, 41.2, 42.0], targetXMetres: [38.94, 38.94, 42.22, 42.22], outerTargetAbsZMetres: 11.5, innerTargetAbsZMetres: fourFrontTargets },
  airPlaneMetresAboveLocalFloor: 0.6, noisePlaneMetresAboveLocalFloor: 1.2,
  heightsBasis: 'Absolute model Y; wing floor is −0.32 m, so tested mounting heights above floor are 3.02/3.52/4.02 m.',
  geometryBasis: 'MODEL TRANSCRIPTION from bundle.js outer veranda axis 9–10: centre X 40.575, Z ±13.249, wall 0.30 m, window offsets ±2.4 m / width 1 m / spring 3.101 + rise 0.507 m.',
  approval: 'CONCEPT / ENGINEERING HOLD. A centre point between modeled windows does not approve its fixing, envelope, concealment or maintenance access.'
};
const cases = [{ id: 'baseline-roof-fans', family: 'baseline', fansPerWing: 2, source: 'Existing four F240–F243 ceiling-fan proxies; F244–F249 visible but OFF.' }];
for (const height of heights) for (const speed of speeds) for (const target of twoTargets) cases.push({ id: `wall-2-h${String(height).replace('.', 'p')}-s${speed}-z${String(target).replace('.', 'p')}`, family: 'wall-2', fansPerWing: 2, height, speed, targetAbsZ: target });
for (const height of heights) for (const speed of speeds) for (const target of fourFrontTargets) cases.push({ id: `wall-4-h${String(height).replace('.', 'p')}-s${speed}-front${String(target).replace('.', 'p')}`, family: 'wall-4', fansPerWing: 4, height, speed, frontTargetAbsZ: target, backTargetAbsZ: 11.5 });
const fingerprintPaths = [...sources, 'scripts/lib/study_model.cjs', 'scripts/study_wing_fans.cjs', baselineFile];
const fingerprints = Object.fromEntries(fingerprintPaths.map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
assert.equal(fingerprints[baselineFile], hash(baselineBytes), 'frozen baseline changed while reading its input');
const documentFingerprints = Object.fromEntries(['AGENTS.md', 'docs/systems/fans.md', 'docs/engineering/central-view-constraint.md', 'docs/simulator/methods-and-limitations.md'].map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));

function makeWingItems(candidate) {
  const items = [], geometry = candidate.fansPerWing === 2 ? parameters.twoFans : parameters.fourFans;
  for (const side of [-1, 1]) for (let index = 0; index < geometry.xMetres.length; index++) {
    const x = geometry.xMetres[index], y = candidate.height, z = side * parameters.mountingAbsZMetres;
    const targetZ = candidate.fansPerWing === 2 ? candidate.targetAbsZ : index === 0 || index === 3 ? candidate.backTargetAbsZ : candidate.frontTargetAbsZ;
    const target = [geometry.targetXMetres[index], 0.28, side * targetZ], dx = target[0] - x, dy = target[1] - y, dz = target[2] - z;
    const id = candidate.fansPerWing === 2 ? wingIds[(side === -1 ? 0 : 2) + index] : `STUDY-WING-${side === -1 ? 'B' : 'H'}-${index + 1}`;
    assert(x > parameters.windowsXMetres[0][1] && x < parameters.windowsXMetres[1][0], 'mount centre must be in modeled solid band between windows');
    assert(Math.abs(z) < parameters.innerFaceAbsZMetres, 'mount reference point must lie inside modeled inner gable face');
    items.push({ id, type: 'fanWall', name: `Study wall fan · wing ${side === -1 ? 'B' : 'H'} · ${index + 1}`, circuit: 'F2', mount: 'wall',
      pos: [x, y, z], mountYaw: -side * 90, yaw: Math.atan2(dz, dx) * 180 / Math.PI,
      tilt: Math.atan2(dy, Math.hypot(dx, dz)) * 180 / Math.PI, speed: candidate.speed, oscillate: true, on: true, hidden: false,
      note: 'CONCEPT / ENGINEERING HOLD: study-only gable mounting; fixing and concealment unapproved.', target } );
  }
  return items;
}
function fanRecord(fan) {
  const { id, running, kind, pos, diameter, flow, watts, dBA, rpm, yaw, tilt, oscillate, sweepDeg, floorY } = fan;
  return { id, type: fan.item.type, running, kind, mountPositionM: clone(fan.item.pos), nozzlePositionM: clone(pos), diameter, flow, watts, dBA, rpm, yaw, tilt, oscillate, sweepDeg, floorY };
}
function statistics(values) {
  return { count: values.length, minimum: Math.min(...values), maximum: Math.max(...values), mean: values.reduce((sum, value) => sum + value, 0) / values.length };
}
function summaries(receivers) {
  const air = statistics(receivers.map(receiver => receiver.air)), noise = statistics(receivers.map(receiver => receiver.noise));
  const point = receiver => ({ receiverId: receiver.receiverId, wing: receiver.wing, pew: receiver.pew, floorPositionM: [receiver.x, receiver.y, receiver.z],
    airPositionM: receiver.airPositionM, noisePositionM: receiver.noisePositionM, air: receiver.air, noise: receiver.noise });
  return { air: { ...air, below030: receivers.filter(receiver => receiver.air < threshold.low).length,
    within030to080: receivers.filter(receiver => receiver.air >= threshold.low && receiver.air <= threshold.high).length,
    above080: receivers.filter(receiver => receiver.air > threshold.high).length,
    lowest: receivers.slice().sort((a, b) => a.air - b.air || a.receiverId.localeCompare(b.receiverId)).slice(0, 10).map(point),
    highest: receivers.slice().sort((a, b) => b.air - a.air || a.receiverId.localeCompare(b.receiverId)).slice(0, 10).map(point) },
    noise: { ...noise, above040: receivers.filter(receiver => receiver.noise > 40).length, above045: receivers.filter(receiver => receiver.noise > 45).length,
      highest: receivers.slice().sort((a, b) => b.noise - a.noise || a.receiverId.localeCompare(b.receiverId)).slice(0, 10).map(point) } };
}
// The cheap sweep reproduces analysis.js airContext/airAt exactly, including
// unchanged P.fanAirSpeed, current fan nozzle origins, wall blocking, seated
// allowance 0.85 and P.combineAirSpeeds root-sum-square aggregation.
function evaluateReceivers(SIM, P, seats) {
  const fans = SIM.fans().filter(fan => fan.running), occ = SIM.GEO.occluders, room = SIM.room();
  const ambient = P.bandsFromDbA(SIM.state.settings.ambientDbA, P.AMBIENT_SPECTRUM);
  const fanSpecs = fans.map(fan => ({ fan, bands: P.bandsFromDbA(fan.dBA, P.FAN_SPECTRUM), coupling: SIM.roomCouplingAt(fan.pos) || 0.05 }));
  const reverbNoise = [0, 0, 0, 0, 0, 0, 0];
  for (const { bands, coupling } of fanSpecs) for (let band = 0; band < 7; band++) {
    const Lw = bands[band] + 11;
    reverbNoise[band] += coupling * P.undb(Lw + 10 * Math.log10(4 / (room.A[band] + 4 * room.airDb[band] / 4.343 * room.V)));
  }
  return seats.map(seat => {
    const airPositionM = [seat.x, seat.y + 0.6, seat.z], noisePositionM = [seat.x, seat.y + 1.2, seat.z];
    const seated = SIM.GEO.seats.some(sample => Math.abs(sample.x - seat.x) < 0.6 && Math.abs(sample.z - seat.z) < 0.6);
    assert(seated, 'every wing receiver retains its seated blockage allowance');
    const contributions = fans.map(fan => {
      const blocked = !!occ?.blockedByWall(fan.pos, airPositionM);
      return { id: fan.id, blocked, air: blocked ? 0 : P.fanAirSpeed(fan, airPositionM, 0.85) };
    });
    const direct = fanSpecs.map(({ fan, bands }) => ({ bands,
      distance2: Math.max(0.25, (seat.x - fan.pos[0]) ** 2 + (noisePositionM[1] - fan.pos[1]) ** 2 + (seat.z - fan.pos[2]) ** 2),
      blocked: !!occ?.blockedByWall(fan.pos, noisePositionM) }));
    const noiseBands = [], receiverCoupling = SIM.roomCouplingAt(noisePositionM);
    for (let band = 0; band < 7; band++) {
      let energy = P.undb(ambient[band]) + reverbNoise[band] * receiverCoupling;
      for (const source of direct) energy += P.undb(source.bands[band] + (source.blocked ? P.WALL_SHADOW[band] : 0)) / source.distance2;
      noiseBands.push(P.db(energy));
    }
    const air = P.combineAirSpeeds(contributions.map(contribution => contribution.air)), noise = P.dbaFromBands(noiseBands);
    assert(Number.isFinite(air) && Number.isFinite(noise), 'finite unrounded per-receiver output');
    return { ...seat, airPositionM, noisePositionM, air, noise, contributions };
  });
}

(async () => {
  const study = loadStudyModel(), { SIM, P, CAT, model } = study;
  try {
    SIM.importLayout(clone(frozenBaseline), { record: false });
    // importLayout restores equipment/settings but not its scene-name metadata.
    // Keep the imported baseline's scenario label without applying a new scene.
    SIM.state.scene = frozenBaseline.scene ?? null;
    const sourceLayout = layoutCopy(SIM);
    assert.deepEqual(sourceLayout.items, frozenBaseline.items, 'frozen equipment IDs, types, coordinates and operating settings are imported exactly');
    for (const [key, value] of Object.entries(frozenBaseline.settings || {})) assert.deepEqual(sourceLayout.settings[key], value, 'frozen scenario setting preserved: ' + key);
    assert.equal(CAT.byId.fanWall.fan.diameter, 0.45, 'actual catalogue fan diameter');
    assert.equal(CAT.byId.fanWall.fan.sweepDeg, 80, 'actual catalogue oscillation sweep');
    assert.deepEqual(clone(CAT.byId.fanWall.fan.speeds.slice(0, 2).map(speed => [speed.flow, speed.watts, speed.dBA])), [[0.45, 35, 47], [0.6, 45, 52]], 'actual flow, watts and noise remain unchanged');
    model.interior.setSeatingLayout(4); SIM.refreshSeating();
    const seats = clone(SIM.seats().filter(seat => seat.block === 'wing')).map(seat => ({ ...seat, wing: seat.z < 0 ? 'B' : 'H',
      receiverId: 'R4-' + hash(JSON.stringify([4, seat.pew ?? null, seat.block, seat.x, seat.y, seat.z])).slice(0, 16) }));
    assert.equal(seats.length, 80, 'preserve all 80 wing receivers');
    assert.equal(new Set(seats.map(seat => seat.receiverId)).size, 80, 'unique receiver identity');
    for (const side of ['B', 'H']) assert.equal(seats.filter(seat => seat.wing === side).length, 40, '40 receivers on each wing');
    for (const seat of seats) assert.equal(seat.y, -0.32, 'wing floor remains −0.32 m');
    const baseline = clone(sourceLayout);
    for (const id of wingIds) assert(baseline.items.find(item => item.id === id)?.type === 'fanCeiling', 'existing wing roof-fan identity ' + id);
    for (const id of optionalNaveIds) {
      const item = baseline.items.find(candidate => candidate.id === id); assert(item?.type === 'fanWall', 'existing optional nave wall-fan identity ' + id);
      item.hidden = false; item.on = false;
    }
    const unchangedIds = baseline.items.filter(item => !wingIds.includes(item.id)).map(item => item.id);
    const results = [], parity = [];
    for (let index = 0; index < cases.length; index++) {
      const candidate = cases[index], input = clone(baseline), requestedWingFans = candidate.family === 'baseline' ? [] : makeWingItems(candidate);
      if (requestedWingFans.length) { input.items = input.items.filter(item => !wingIds.includes(item.id)); input.items.push(...requestedWingFans.map(({ target, ...item }) => item)); }
      // Type changes must instantiate fresh Fixture objects; SIM.update({type})
      // can leave fx.type cached. This importer path is deliberately mandatory.
      SIM.importLayout(input, { record: false });
      for (const item of SIM.state.items) assert.equal(SIM.fixtures.get(item.id)?.type.id, item.type, candidate.id + ': fixture cache matches item type ' + item.id);
      const layout = layoutCopy(SIM);
      for (const id of unchangedIds) assert.deepEqual(clone(SIM.item(id)), baseline.items.find(item => item.id === id), candidate.id + ': unchanged other equipment ' + id);
      for (const id of optionalNaveIds) assert(SIM.item(id).hidden === false && SIM.item(id).on === false, candidate.id + ': optional nave wall fan visible but OFF');
      const receiverResults = evaluateReceivers(SIM, P, seats), allFanSources = SIM.fans().map(fanRecord);
      for (const fan of allFanSources.filter(fan => requestedWingFans.some(item => item.id === fan.id))) assert(fan.kind === 'jet' && fan.diameter === 0.45 && fan.oscillate && fan.sweepDeg === 80, candidate.id + ': actual wall-fan source used');
      results.push({ ...candidate, inputStatus: candidate.family === 'baseline' ? 'MODEL TRANSCRIPTION with explicit optional-fan OFF scenario' : 'CONCEPT / ENGINEERING HOLD',
        layoutSha256: hash(JSON.stringify(layout)), changedWingItems: layout.items.filter(item => requestedWingFans.some(fan => fan.id === item.id)),
        requestedTargets: requestedWingFans.map(item => ({ id: item.id, targetPositionM: item.target })), allFanSources,
        summary: summaries(receiverResults), wings: Object.fromEntries(['B', 'H'].map(side => [side, summaries(receiverResults.filter(receiver => receiver.wing === side))])),
        receivers: receiverResults });
      console.log(`${candidate.id}: all ${seats.length} wing receivers; air ${results.at(-1).summary.air.minimum.toFixed(3)}–${results.at(-1).summary.air.maximum.toFixed(3)} m/s; ${results.at(-1).summary.air.within030to080}/80 within brief; noise max ${results.at(-1).summary.noise.maximum.toFixed(2)} dBA`);
      // Two representative states are cross-checked against the untouched full
      // 368-receiver analysis, including a real imported fan-type conversion.
      if (index === 0 || index === 1) {
        const fullSeats = clone((await study.analyse()).seats.seats), actual = fullSeats.filter(seat => seat.block === 'wing');
        assert.equal(fullSeats.length, SIM.seats().length, 'full-analysis parity retains the entire model receiver set');
        assert.equal(actual.length, 80, 'full-analysis parity retains all wing receivers');
        let maxAirDelta = 0, maxNoiseDelta = 0;
        for (const receiver of receiverResults) {
          const full = actual.find(seat => seat.x === receiver.x && seat.y === receiver.y && seat.z === receiver.z && seat.pew === receiver.pew);
          assert(full, 'parity receiver exists ' + receiver.receiverId);
          maxAirDelta = Math.max(maxAirDelta, Math.abs(full.air - receiver.air)); maxNoiseDelta = Math.max(maxNoiseDelta, Math.abs(full.noise - receiver.noise));
          assert.equal(full.air, receiver.air, candidate.id + ': exact full-analysis air parity ' + receiver.receiverId);
          assert.equal(full.noise, receiver.noise, candidate.id + ': exact full-analysis noise parity ' + receiver.receiverId);
        }
        parity.push({ id: candidate.id, fullReceiverCount: fullSeats.length, wingReceiverCount: actual.length, exactEquality: true, maxAirDelta, maxNoiseDelta });
      }
    }
    SIM.importLayout(sourceLayout, { record: false });
    assert.deepEqual(layoutCopy(SIM), sourceLayout, 'isolated model restored to the exact imported frozen baseline');
    for (const [file, expected] of Object.entries(fingerprints)) assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, 'source changed during sweep: ' + file);
    const limitations = [
      'Empirical unchanged fan jet/downflow equation and oscillation averaging, not CFD, manufacturer throw/directivity or measured performance.',
      'All 80 existing wing receivers are retained; no receiver removal, relocation, target or sampling adjustment.',
      'Air speed is floor +0.60 m with the existing 0.85 seated allowance and root-sum-square combination; background noise is floor +1.20 m with unchanged catalogue noise and analysis.js octave-band direct/reverberant energy.',
      'Wall blocking uses the current analytical solid-wall/intersection model. It does not resolve timber, roofs, fan guards, screens, brackets, furniture, people, curtain effects, inlet starvation, gable-window flow or natural wind.',
      'No proposed fan mount is engineer-approved. A mounting centre between modeled windows is only a geometry predicate; strength, full motion envelope, blade/light conflicts, acoustic feedback, mic wind, concealment and maintenance remain held.',
      'No outside-air delivery, heat-removal, ACH, comfort, noise-compliance, safety or all-hidden fan-brief acceptance is established by this sweep.',
      'Other fans and all non-fan equipment remain unchanged; the six optional nave wall fans are visible but OFF in every comparison. Physical concealment and power switching are not simulated installations.',
      'No candidate is selected. A later complete coordinated study and specialist review must assess light, speech, feedback, electrical/control routes and physical access before adoption.',
      'Source model files, user layouts, original drawings, registers and saved electrical schedules were not changed. Browser saved configurations were not read.',
      'Equipment/scenario inputs come from the explicitly imported frozen baseline file, not the current recommended default. Current source/geometry/catalogue hashes remain part of every run.'
    ];
    fs.mkdirSync(out, { recursive: true });
    const files = {
      'source-layout.json': sourceLayout, 'study-baseline-layout.json': baseline, 'receivers.json': { schema: 1, layoutBlocks: 4, receivers: seats },
      'cases.json': { schema: 1, status: 'DERIVED design-development sweep; no construction or product approval', parameters, threshold, cases: results, limitations },
      'parity.json': { schema: 1, method: 'Exact unrounded equality against untouched analysis.js seatTask at all 80 wing receivers in two states.', cases: parity }
    };
    for (const [file, value] of Object.entries(files)) fs.writeFileSync(path.join(out, file), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    const header = ['case', 'family', 'fans_per_wing', 'model_y_m', 'speed', 'target_abs_z_m', 'front_target_abs_z_m', 'back_target_abs_z_m', 'air_min_m_s', 'air_max_m_s', 'air_mean_m_s', 'below_0_3', 'within_0_3_0_8', 'above_0_8', 'noise_min_dba', 'noise_max_dba', 'noise_mean_dba', 'above_40_dba', 'above_45_dba'];
    const rows = results.map(candidate => [candidate.id, candidate.family, candidate.fansPerWing, candidate.height ?? '', candidate.speed ?? '', candidate.targetAbsZ ?? '', candidate.frontTargetAbsZ ?? '', candidate.backTargetAbsZ ?? '', candidate.summary.air.minimum, candidate.summary.air.maximum, candidate.summary.air.mean, candidate.summary.air.below030, candidate.summary.air.within030to080, candidate.summary.air.above080, candidate.summary.noise.minimum, candidate.summary.noise.maximum, candidate.summary.noise.mean, candidate.summary.noise.above040, candidate.summary.noise.above045]);
    fs.writeFileSync(path.join(out, 'summary.csv'), [header, ...rows].map(row => row.join(',')).join('\n') + '\n', { flag: 'wx' });
    const manifest = { schema: 1, generatedAt: new Date().toISOString(), gitCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      gitBranch: execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(), node: process.version, platform: process.platform,
      inputStatus: 'MODEL TRANSCRIPTION / CONCEPT / DERIVED; ENGINEERING HOLD retained', caseCount: results.length, sourceSha256: fingerprints, documentSha256AtRead: documentFingerprints,
      baselineInput: { path: baselineFile, sha256: fingerprints[baselineFile], schema: frozenBaseline.schema, designVersion: frozenBaseline.designVersion, scene: frozenBaseline.scene },
      parameters, caseParametersSha256: hash(JSON.stringify(cases)), fanCatalogue: clone(CAT.byId.fanWall.fan), baselineScene: baseline.scene, baselineSettings: baseline.settings,
      receiverCount: seats.length, receiverCoordinateSha256: hash(JSON.stringify(seats)), receiverIdBasis: 'SHA-256 prefix of four-block layout, pew, block and exact existing seat x/y/z; study IDs, not approved capacity.',
      fullAnalysisParity: parity, fixtureTypeCacheCheckedEveryCase: true, exactBaselineRestoration: true, sourceFingerprintsUnchangedDuringRun: true, limitations,
      files: Object.fromEntries([...Object.keys(files), 'summary.csv'].map(file => [file, hash(fs.readFileSync(path.join(out, file)))])) };
    fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    console.log(`Saved ${results.length} cases; two exact full-analysis parity cases; all 80 wing receivers; no candidate selection: ${out}`);
  } finally { study.dispose(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
