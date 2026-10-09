/* Combined wing light/fan comparisons from the frozen held two-speaker layout.
 * Full layout imports keep fixture caches consistent. No defaults, catalogue
 * specifications, calculation methods, receivers or acceptance criteria change. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '..');
const evidence = path.join(repo, 'review/wing-revision-2026-10-09');
const args = process.argv.slice(2);
const option = name => args.find(a => a.startsWith(name + '='))?.slice(name.length + 1);
const sourceRoot = path.resolve(option('--source-root') || repo);
const phase = option('--phase') || 'initial';
assert(['initial', 'final-review'].includes(phase), '--phase must be initial or final-review');
const blocks = Number(option('--blocks') || 4);
assert([2, 4].includes(blocks), '--blocks must be 2 or 4');
const out = path.resolve(option('--out') || path.join(evidence, phase === 'initial' ? `blocks-${blocks}` : `final-blocks-${blocks}`));
fs.mkdirSync(out, { recursive: true });
const { loadStudyModel, sources } = require(path.join(sourceRoot, 'scripts/lib/study_model.cjs'));
const clone = value => JSON.parse(JSON.stringify(value));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const hashFiles = root => Object.fromEntries([...sources, 'scripts/lib/study_model.cjs'].map(p => [p, sha(fs.readFileSync(path.join(root, p)))]));
const write = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const freeze = JSON.parse(fs.readFileSync(path.join(evidence, phase === 'initial' ? 'freeze.json' : 'final-freeze.json'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(evidence, phase === 'initial' ? 'baseline-layout.json' : 'final-baseline-layout.json'), 'utf8'));
assert.equal(sha(JSON.stringify(baseline)), freeze.layoutSha256, 'Frozen held layout changed');
const priorResultFile = path.join(repo, `review/wing-sound-2026-10-09/current-${blocks}-block/column-y4.4-tilt-50-level-6.json`);
const priorResult = JSON.parse(fs.readFileSync(priorResultFile, 'utf8'));
const runtimeSourceHashes = hashFiles(sourceRoot);
const currentSourceHashesStart = hashFiles(repo);
for (const name of ['physics.js', 'analysis.js']) {
  const file = 'Thach_Bi_Viewer/simulator/' + name;
  assert.equal(runtimeSourceHashes[file], priorResult.sourceHashes[file], 'Calculation/catalogue source changed: ' + file);
}

const lightVariants = [
  { id: 'lights4-y4.4', countPerWing: 4, y: 4.4 },
  { id: 'lights2-y3.8', countPerWing: 2, y: 3.8 },
  { id: 'lights2-y4.4', countPerWing: 2, y: 4.4 }
];
const fanVariants = [
  { id: 'fans4-speed1', countPerWing: 4, speed: 1 },
  { id: 'fans4-speed2', countPerWing: 4, speed: 2 },
  ...[2.7, 3.5].flatMap(y => [1, 2].map(speed => ({ id: `fans2-y${y}-speed${speed}`, countPerWing: 2, y, speed })))
];
const cases = phase === 'initial' ? lightVariants.flatMap(light => fanVariants.map(fan => ({ id: `${light.id}-${fan.id}`, light, fan }))) : lightVariants.filter(l => l.countPerWing === 2).flatMap(light => [1, 2].map(speed => ({ id: `${light.id}-fans2-extended-y4.05-speed${speed}`, light, fan: { id: `fans2-extended-y4.05-speed${speed}`, countPerWing: 2, y: 4.05, speed, type: 'fanWingWall', frontX: 38.05, rearX: 43.10 } })));
for (const light of lightVariants.filter(l => l.countPerWing === 2)) cases.push({ id: `${light.id}-fans0-comparison-only`, light, fan: { id: 'fans0-comparison-only', countPerWing: 0, speed: 0 }, comparisonOnly: true });
const requested = option('--case');
const selected = requested ? cases.filter(c => c.id === requested) : cases;
assert(selected.length, 'Unknown --case');
const lightIds = new Set(['L63', 'L64', 'L65', 'L66', 'L67', 'L68', 'L69', 'L70']);
const retainedLightIds = new Set(['L63', 'L65', 'L67', 'L69']);
const fanIds = new Set(['F240', 'F241', 'F242', 'F243', 'F-WING-B-3', 'F-WING-B-4', 'F-WING-H-3', 'F-WING-H-4']);
const retainedFanIds = new Set(['F240', 'F241', 'F242', 'F243']);
const artwork = { source: 'USER CONFIRMED: saints pictures between the two end-gable windows', reservedStripX: [38.675, 42.475], extentHeight: null, pictureSize: null, status: 'Entire central end-gable strip reserved in concept because picture height/size is unknown; actual equipment envelope clearance unreviewed', constructionApproved: false };
const criteria = { lux: [200, 300], air: [0.3, 0.8], noiseDbA: 45, stiEverySeat: 0.6, weakerWingStiMin: 0.45, weakerWingStiMean: 0.5, splDbA: [68, 76], feedbackDb: 3 };
const manifest = {
  schema: 1, startedAt: new Date().toISOString(), status: 'Running CONCEPT / ENGINEERING HOLD comparison',
  baseline: { layout: phase === 'initial' ? 'baseline-layout.json' : 'final-baseline-layout.json', sha256: freeze.layoutSha256, sourceResult: freeze.sourceResult, sourceResultSha256: freeze.sourceResultSha256 },
  phase, blocks, runtimeSourceHashes, currentSourceHashesStart, runnerSha256: sha(fs.readFileSync(__filename)),
  sourceMode: sourceRoot === repo ? 'Current source with frozen imported layout' : 'Temporary frozen source snapshot',
  cases: selected, settings: clone(baseline.settings), scene: 'Full service · evening', criteria, artwork,
  catalogLimits: { lightType: 'chandelier6Reading', lumensPerAssembly: 5640, wattsPerAssembly: 51, beamDegrees: 100, cctK: 2700, dim: 1, fanType: phase === 'initial' ? 'fanWall' : 'fanWingWall', speeds: { 1: 'Low', 2: 'Medium' }, selectedProduct: null },
  measurementPlanes: { lux: 'model book offset at local floor +0.80 m', air: 'seat X/Z at local floor +0.60 m', noiseStiSplEcho: 'seat X/Z at local floor +1.20 m', reportedSeatXYZ: 'seat floor XYZ in metres' },
  limitations: [
    'Catalogue light/fan/speaker data remain representative assumptions; no output, noise, directivity or rating is increased or tuned.',
    'Removing equipment from a calculation layout does not change or approve the default design, registers or physical construction.',
    'Empirical oscillating fan jets and statistical room acoustics are unchanged; product duty points and site conditions are unverified.',
    'Fan mount points outside the artwork strip are not proof that their bodies, sweeps, supports or maintenance areas clear the pictures.',
    'The root agent must review complete fixture geometry, windows, supports, movement, artwork, sightlines and maintenance access.',
    'No case is a design choice; thresholds, complete receiver sampling and all unmet targets remain visible.'
  ]
};
write('manifest.json', manifest);

function aim(from, to) {
  return { yaw: Math.atan2(to[2] - from[2], to[0] - from[0]) * 180 / Math.PI, tilt: Math.atan2(to[1] - from[1], Math.hypot(to[0] - from[0], to[2] - from[2])) * 180 / Math.PI };
}
function receiverSignature(seats) { return seats.map(s => [s.x, s.y, s.z, s.block, s.pew, s.book ?? null]); }
function independentAudienceFactors(speakers, SIM, P) {
  const cells = new Set();
  for (const seat of SIM.GEO.seats) for (const dx of [-0.6, -0.3, 0, 0.3, 0.6]) for (const dz of [-0.3, 0, 0.3]) cells.add(Math.round((seat.x + dx) * 2) + ':' + Math.round((seat.z + dz) * 2));
  const alpha = P.ABSORPTION.pewsEmpty.map((a, b) => a + (P.ABSORPTION.pewsOccupied[b] - a) * SIM.state.settings.occupancy);
  return speakers.map(sp => {
    const fraction = P.audienceFraction(sp.src, sp.spec, (x, z) => cells.has(Math.round(x * 2) + ':' + Math.round(z * 2)), 1.0);
    const expected = clone(fraction.map((f, b) => 1 - f * alpha[b]));
    assert.deepEqual(sp.src.reverbFactor, expected, 'Cached source must match independently recomputed current receiver geometry: ' + sp.id);
    return { id: sp.id, cachedAndIndependentFactorsExact: true, factor: expected };
  });
}
function seatRef(s, metric) {
  const book = s.book ?? [0.25, 0];
  const height = metric === 'lux' ? 0.8 : metric === 'air' ? 0.6 : 1.2;
  return { floorXYZ: [s.x, s.y, s.z], measurementXYZ: [s.x + (metric === 'lux' ? book[0] : 0), s.y + height, s.z + (metric === 'lux' ? book[1] : 0)], block: s.block, pew: s.pew };
}
function zoneSummary(seats, P) {
  const metrics = {};
  for (const key of ['lux', 'air', 'noise', 'sti', 'spl']) {
    const valid = seats.filter(s => Number.isFinite(s[key]));
    const ordered = [...valid].sort((a, b) => a[key] - b[key]);
    if (!ordered.length) { metrics[key] = null; continue; }
    const decibels = ['noise', 'spl'].includes(key);
    const stats = P.statistics(valid.map(s => s[key]), decibels);
    metrics[key] = { ...stats, mean: stats.avg, meanBasis: decibels ? 'Acoustic energy mean in dBA' : 'Arithmetic mean', minimumSeat: seatRef(ordered[0], key), maximumSeat: seatRef(ordered.at(-1), key), worstSeat: seatRef(key === 'noise' ? ordered.at(-1) : ordered[0], key) };
  }
  const failures = {
    luxBelow200: seats.filter(s => s.lux < 200).length, luxAbove300: seats.filter(s => s.lux > 300).length,
    airBelow0p3: seats.filter(s => s.air < 0.3).length, airAbove0p8: seats.filter(s => s.air > 0.8).length,
    noiseAbove45: seats.filter(s => s.noise > 45).length,
    stiBelow0p6: seats.filter(s => s.sti !== null && s.sti < 0.6).length, stiBelow0p45: seats.filter(s => s.sti !== null && s.sti < 0.45).length,
    splBelow68: seats.filter(s => s.spl !== null && s.spl < 68).length, splAbove76: seats.filter(s => s.spl !== null && s.spl > 76).length
  };
  const echoes = seats.filter(s => s.echo);
  return { n: seats.length, ...metrics, failureCounts: failures, echoes: { seats: echoes.length, maxGapMs: echoes.length ? Math.max(...echoes.map(s => s.echo.gapMs)) : null }, passes: { luxMinimum200: failures.luxBelow200 === 0, luxPreferred200to300: failures.luxBelow200 + failures.luxAbove300 === 0, air0p3to0p8: failures.airBelow0p3 + failures.airAbove0p8 === 0, noiseAtMost45: failures.noiseAbove45 === 0, stiEverySeat0p6: failures.stiBelow0p6 === 0, weakerStiMinimum0p45: failures.stiBelow0p45 === 0, weakerStiMean0p5: metrics.sti?.mean >= 0.5, speechLevel68to76: failures.splBelow68 + failures.splAbove76 === 0 } };
}
function summaries(seats, P) {
  return Object.fromEntries(['all', 'nave', 'wing', 'wing-B', 'wing-H'].map(zone => [zone, zoneSummary(seats.filter(s => zone === 'all' || zone === 'nave' && s.block !== 'wing' || zone === 'wing' && s.block === 'wing' || zone === 'wing-B' && s.block === 'wing' && s.z < 0 || zone === 'wing-H' && s.block === 'wing' && s.z > 0), P)]));
}
function makeLayout(c, SIM) {
  const layout = clone(baseline);
  if (c.light.countPerWing === 2) {
    layout.items = layout.items.filter(i => !lightIds.has(i.id) || retainedLightIds.has(i.id));
    for (const i of layout.items.filter(i => retainedLightIds.has(i.id))) {
      const sign = Math.sign(i.pos[2]);
      const pos = [i.id === 'L63' || i.id === 'L67' ? 38.94 : 42.22, c.light.y, sign * 10.15];
      const support = SIM.structureAbove(pos[0], pos[2], pos[1] + 0.05); assert(support, 'Missing visualization roof projection');
      Object.assign(i, { pos, anchorY: support.y, on: true, hidden: false, dim: 1, lumens: 5640, beam: 100, cct: 2700 });
    }
  }
  if (c.fan.countPerWing === 0) layout.items = layout.items.filter(i => !fanIds.has(i.id));
  if (c.fan.countPerWing === 2) {
    layout.items = layout.items.filter(i => !fanIds.has(i.id) || retainedFanIds.has(i.id));
    for (const i of layout.items.filter(i => retainedFanIds.has(i.id))) {
      const sign = Math.sign(i.pos[2]), front = i.id === 'F240' || i.id === 'F242';
      const pos = [front ? c.fan.frontX ?? 37.325 : c.fan.rearX ?? 43.825, c.fan.y, sign * 13.06];
      const target = [front ? 38.94 : 42.22, 0.28, sign * 10.15];
      Object.assign(i, { type: c.fan.type || 'fanWall', pos, mountYaw: -sign * 90, ...aim(pos, target), on: true, hidden: false, oscillate: true, speed: c.fan.speed });
    }
  }
  if (c.fan.countPerWing === 4) for (const i of layout.items.filter(i => fanIds.has(i.id))) Object.assign(i, { speed: c.fan.speed, on: true });
  return layout;
}

const study = loadStudyModel(), { SIM, model, P, CAT } = study;
(async () => {
  const results = [];
  const physicalInputsPath = path.join(evidence, 'catalog-physical-inputs.json');
  const expectedPhysicalInputs = JSON.parse(fs.readFileSync(physicalInputsPath, 'utf8'));
  const actualPhysicalInputs = clone(Object.fromEntries(Object.entries(CAT.byId).filter(([id, t]) => id !== 'fanWingWall' && (t.light || t.fan || t.speaker || t.mic)).map(([id, t]) => [id, { cat: t.cat, mounts: t.mounts, defaultHeight: t.defaultHeight, defaultTilt: t.defaultTilt, defaultDrop: t.defaultDrop, aim: t.aim, params: t.params, light: t.light, fan: t.fan, speaker: t.speaker, mic: t.mic }])));
  assert.deepEqual(actualPhysicalInputs, expectedPhysicalInputs, 'Existing light/fan/speaker/microphone catalogue physical inputs must remain exact');
  let extendedFanAliasValidation = null;
  if (CAT.byId.fanWingWall) {
    assert.deepEqual(clone(CAT.byId.fanWingWall.fan), expectedPhysicalInputs.fanWall.fan, 'Extended bracket must not change fan engineering specifications');
    assert.deepEqual(clone(CAT.byId.fanWingWall.params || {}), expectedPhysicalInputs.fanWall.params || {}, 'Extended bracket must not tune fan parameters');
    extendedFanAliasValidation = { original: 'fanWall', alias: 'fanWingWall', completeFanSpecExact: true, parameterSpecExact: true, status: 'Geometry-only extended bracket; actual transformed nozzle recorded; structure and product selection remain held' };
  }
  if (phase === 'final-review') assert(extendedFanAliasValidation, 'Final source must include fanWingWall');
  const catalogValidation = { physicalInputsSha256: sha(JSON.stringify(actualPhysicalInputs)), existingPhysicalTypes: Object.keys(actualPhysicalInputs).length, allExistingPhysicalObjectsExact: true, extendedFanAliasValidation, catalogFileHashChanged: runtimeSourceHashes['Thach_Bi_Viewer/simulator/catalog.js'] !== priorResult.sourceHashes['Thach_Bi_Viewer/simulator/catalog.js'], changeReason: 'Root added unpowered saint-picture decor and local image materials; final source adds fanWingWall with unchanged fan specs and an extended geometry bracket. Existing physical specifications remain exact.' };
  const expectedReceivers = receiverSignature(priorResult.seats);
  const invariantsByLight = new Map(), invariantsByFan = new Map();
  assert.equal(CAT.byId.chandelier6Reading.light.lumens, 5640);
  assert.equal(CAT.byId.chandelier6Reading.light.watts, 51);
  for (const c of selected) {
    const start = performance.now();
    SIM.importLayout(makeLayout(c, SIM), { record: false });
    SIM.state.scene = 'Full service · evening';
    model.interior.setSeatingLayout(blocks); SIM.refreshSeating();
    for (const [key, value] of Object.entries(baseline.settings)) assert.deepEqual(clone(SIM.state.settings[key]), value, 'Frozen setting changed: ' + key);
    for (const item of SIM.state.items) assert.equal(SIM.fixtures.get(item.id).type.id, item.type, 'Fixture cache mismatch');
    assert(SIM.state.items.filter(i => i.circuit === 'F2').every(i => !i.on), 'Nave wall fans must remain off');
    const lightItems = SIM.state.items.filter(i => lightIds.has(i.id));
    assert.equal(lightItems.length, c.light.countPerWing * 2);
    assert(lightItems.every(i => i.type === 'chandelier6Reading' && i.lumens === 5640 && i.beam === 100 && i.cct === 2700 && i.dim === 1), 'Prescribed light assumptions changed');
    assert.equal(SIM.state.items.filter(i => fanIds.has(i.id)).length, c.fan.countPerWing * 2);
    const delays = clone(SIM.alignDelays({ record: false }));
    const analysis = await study.analyse();
    const seats = clone(analysis.seats.seats);
    assert.equal(seats.length, 368); assert.equal(seats.filter(s => s.block === 'wing').length, 80);
    assert.deepEqual(receiverSignature(seats), expectedReceivers, 'Receiver signature changed');
    const lightValues = seats.map(s => s.lux), fanValues = seats.map(s => [s.air, s.noise]);
    if (invariantsByLight.has(c.light.id)) assert.deepEqual(lightValues, invariantsByLight.get(c.light.id), 'Fan comparison changed light results'); else invariantsByLight.set(c.light.id, lightValues);
    if (invariantsByFan.has(c.fan.id)) assert.deepEqual(fanValues, invariantsByFan.get(c.fan.id), 'Light comparison changed air/noise results'); else invariantsByFan.set(c.fan.id, fanValues);
    const speakers = clone(SIM.speakers());
    const audienceCacheAudit = independentAudienceFactors(speakers, SIM, P);
    let historicalBaselineComparison = null;
    if (phase === 'initial' && c.light.countPerWing === 4 && c.fan.countPerWing === 4 && c.fan.speed === 1) {
      if (blocks === 4) {
        assert.deepEqual(seats, priorResult.seats, 'Four-block held baseline seat parity changed');
        historicalBaselineComparison = { allSeatValuesExact: true };
      } else {
        assert.deepEqual(seats.map(s => [s.lux, s.air, s.noise]), priorResult.seats.map(s => [s.lux, s.air, s.noise]), 'Historical receiver light/air/noise values changed');
        historicalBaselineComparison = {
          allReceiverPositionsAndLuxAirNoiseExact: true,
          explanation: 'Root corrected audience-cache invalidation on seating-array changes. Historical two-block sound values reused four-block source fractions and are superseded; physical inputs and thresholds are unchanged.',
          soundDeltas: seats.map((s, i) => ({ receiver: [s.x, s.y, s.z], stiDelta: s.sti - priorResult.seats[i].sti, splDeltaDbA: s.spl - priorResult.seats[i].spl }))
        };
      }
    }
    const microphones = clone(SIM.mics().map(m => {
      const feedbackMarginDb = P.feedbackMargin(speakers.filter(s => s.on).map(s => ({ src: s.src, spec: s.spec })), m, SIM.room(), SIM.state.settings.talkerDbA, SIM.state.settings.micDistance);
      assert.equal(feedbackMarginDb, m.item.feedbackMargin);
      return { id: m.id, name: m.item.name, position: clone(m.pos), direction: clone(m.dir), on: m.on, feedbackMarginDb, meets3Db: feedbackMarginDb >= 3 };
    }));
    const emitterSources = clone(SIM.emitters()), fanSources = clone(SIM.fans());
    const priorCaseFile = path.join(out, c.id + '.json');
    let earlierFourBlockCaseParity = null;
    if (blocks === 4 && fs.existsSync(priorCaseFile)) {
      const priorCase = JSON.parse(fs.readFileSync(priorCaseFile, 'utf8'));
      assert.deepEqual(seats, priorCase.seats, 'Root cache correction changed a verified four-block case');
      assert.deepEqual(microphones, priorCase.microphones, 'Root cache correction changed four-block microphone results');
      assert.deepEqual(speakers, priorCase.speakerSources, 'Four-block loudspeaker source results changed');
      assert.deepEqual(emitterSources, priorCase.emitterSources, 'Four-block physical light emitters changed');
      assert.deepEqual(fanSources, priorCase.fanSources, 'Four-block actual fan sources changed');
      earlierFourBlockCaseParity = { all368SeatValuesExact: true, everyMicrophoneExact: true, everySpeakerSourceExact: true, everyEmitterSourceExact: true, everyFanSourceExact: true };
    }
    SIM.electrical.rebuild();
    const electrical = clone(SIM.electrical.exportData());
    const byCircuit = Object.fromEntries([...new Set(SIM.state.items.map(i => i.circuit))].sort().map(circuit => [circuit, { equipment: SIM.state.items.filter(i => i.circuit === circuit && !i.hidden).length, commandedOn: SIM.state.items.filter(i => i.circuit === circuit && !i.hidden && i.on).length, routes: electrical.routes.filter(r => r.circuit === circuit).length }]));
    const mountsInStrip = SIM.state.items.filter(i => fanIds.has(i.id) && i.pos[0] >= artwork.reservedStripX[0] && i.pos[0] <= artwork.reservedStripX[1]).map(i => i.id);
    const zones = summaries(seats, P);
    const result = {
      case: c, phase, blocks, status: 'Calculated concept; no design selection or construction approval',
      elapsedSeconds: (performance.now() - start) / 1000, receiverSha256: sha(JSON.stringify(expectedReceivers)), runtimeSourceHashes,
      layout: clone(SIM.exportLayout()), alignedDelays: delays, zones, seats, microphones,
      audienceCacheAudit, historicalBaselineComparison, earlierFourBlockCaseParity,
      emitterSources, fanSources, speakerSources: speakers,
      power: clone(SIM.powerSummary()), electricalCounts: { equipment: electrical.components.length, routes: electrical.routes.length, byCircuit, lightAssemblyCount: lightItems.length, fanCount: c.fan.countPerWing * 2, wingSpeakerCount: speakers.filter(s => ['S276', 'S278'].includes(s.id)).length },
      geometry: { status: phase === 'initial' && c.fan.countPerWing === 2 ? 'REJECTED physical layout: root full-mesh screen finds end fans overlapping window extents and wing return boundaries. Numerical case retained only as comparison.' : 'NOT APPROVED: root complete geometry/clearance review is separate; structure, product dimensions and maintenance remain held', endPierRejection: phase === 'initial' && c.fan.countPerWing === 2 ? { source: 'Root geometry review, 9 October 2026; exact evidence file to be linked by root', y3p5MeshX: [[36.943, 37.775], [43.375, 44.207]], windowsX: [[37.675, 38.675], [42.475, 43.475]] } : null, mountingReferencesOutsideReservedStrip: mountsInStrip.length === 0, fanMountReferenceIdsInsideStrip: mountsInStrip, artwork, supportsChecked: false, completeMovementChecked: false, maintenanceChecked: false },
      checks: clone(SIM.analysis.checks)
    };
    write(c.id + '.json', result);
    const compact = { case: c, blocks, elapsedSeconds: result.elapsedSeconds, zones, microphones, power: result.power, electricalCounts: result.electricalCounts, geometry: result.geometry };
    results.push(compact); write('summary.json', results);
    console.log(JSON.stringify({ id: c.id, blocks, seconds: Number(result.elapsedSeconds.toFixed(3)), wing: { luxMin: zones.wing.lux.min, airMin: zones.wing.air.min, airOk: zones.wing.n - zones.wing.failureCounts.airBelow0p3 - zones.wing.failureCounts.airAbove0p8, noiseMax: zones.wing.noise.max, stiMin: zones.wing.sti.min, stiMean: zones.wing.sti.mean, failures: zones.wing.failureCounts }, feedback: microphones.map(m => m.feedbackMarginDb) }));
  }
  const currentSourceHashesEnd = hashFiles(repo), runtimeSourceHashesEnd = hashFiles(sourceRoot);
  const runtimeSourceFilesStableAtEnd = Object.keys(runtimeSourceHashes).every(p => runtimeSourceHashes[p] === runtimeSourceHashesEnd[p]);
  if (sourceRoot !== repo) assert(runtimeSourceFilesStableAtEnd, 'Temporary snapshot changed');
  const sourceDrift = Object.keys(currentSourceHashesEnd).filter(p => currentSourceHashesStart[p] !== currentSourceHashesEnd[p]).map(p => ({ path: p, startSha256: currentSourceHashesStart[p], endSha256: currentSourceHashesEnd[p] }));
  write('manifest.json', { ...manifest, catalogValidation, completedAt: new Date().toISOString(), status: 'Complete numerical comparison; CONCEPT / ENGINEERING HOLD, no approved choice', currentSourceHashesEnd, runtimeSourceHashesEnd, runtimeSourceFilesStableAtEnd, sourceDrift, invariants: { full368Receivers: true, all80WingReceivers: true, receiverPositionsUnchanged: true, frozenFourBlockBaselineSeatParity: phase === 'initial' && blocks === 4 && !requested, twoBlockHistoricalLightAirNoiseParity: phase === 'initial' && blocks === 2 && !requested, audienceFactorsMatchIndependentCalculationEveryCase: true, luxInvariantForFixedLightCase: true, airNoiseInvariantForFixedFanCase: true, catalogRatingsUnchanged: true } });
  study.dispose();
})().catch(error => { write('failure.json', { at: new Date().toISOString(), message: error.message.slice(0, 2000), stack: error.stack?.slice(0, 2500) }); console.error(error.message.slice(0, 2000)); study.dispose(); process.exitCode = 1; });
