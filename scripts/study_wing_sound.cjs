/* Two-total-wing-speaker calculation comparison. The complete frozen baseline
 * is imported for every case so fixtures, sources and product caches agree.
 * This runner never edits the default model, physics, criteria or seat grid. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const repo = path.resolve(__dirname, '..');
const evidence = path.join(repo, 'review/wing-sound-2026-10-09/sweep');
const args = process.argv.slice(2);
const option = name => args.find(a => a.startsWith(name + '='))?.slice(name.length + 1);
const sourceRoot = path.resolve(option('--source-root') || repo);
const out = path.resolve(option('--out') || evidence);
const blocks = Number(option('--blocks') || 4);
assert([2, 4].includes(blocks), '--blocks must be 2 or 4');
const { loadStudyModel, sources } = require(path.join(sourceRoot, 'scripts/lib/study_model.cjs'));
const sourceFiles = [...sources, 'scripts/lib/study_model.cjs'];
const clone = value => JSON.parse(JSON.stringify(value));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const hashFiles = root => Object.fromEntries(sourceFiles.map(p => [p, sha(fs.readFileSync(path.join(root, p)))]));
const write = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');

fs.mkdirSync(out, { recursive: true });
const freeze = JSON.parse(fs.readFileSync(path.join(evidence, 'freeze.json'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(evidence, 'baseline-layout.json'), 'utf8'));
const frozenResultPath = path.join(evidence, 'baseline-existing-delays.json');
const frozenResult = fs.existsSync(frozenResultPath) ? JSON.parse(fs.readFileSync(frozenResultPath, 'utf8')) : null;
assert.equal(sha(JSON.stringify(baseline)), freeze.layoutSha256, 'Frozen layout changed');
const runtimeSourceHashes = hashFiles(sourceRoot);
const currentSourceHashesStart = hashFiles(repo);
const startedAt = new Date().toISOString();
const runnerSha256 = sha(fs.readFileSync(__filename));

const cases = [
  { id: 'baseline-existing-delays', kind: 'baseline', alignDelays: false },
  { id: 'baseline-aligned', kind: 'baseline', alignDelays: true },
  { id: 'no-wing-comparison-only', kind: 'no-wing', alignDelays: true }
];
for (const y of [3.8, 4.4]) for (const tilt of [-20, -35, -50]) for (const level of [-10, -6]) {
  cases.push({ id: `column-y${y}-tilt${tilt}-level${level}`, kind: 'two-wall', type: 'slimColumn', y, tilt, level, alignDelays: true });
}
for (const y of [3.8, 4.4]) for (const tilt of [-20, -35]) for (const level of [-14, -10]) {
  cases.push({ id: `point-y${y}-tilt${tilt}-level${level}`, kind: 'two-wall', type: 'pointSpeaker', y, tilt, level, alignDelays: true });
}
const requestedCase = option('--case');
const requested = requestedCase ? cases.filter(c => c.id === requestedCase) : cases;
const selected = args.includes('--with-baselines') && requestedCase
  ? [...cases.filter(c => c.kind === 'baseline'), ...requested.filter(c => c.kind !== 'baseline')]
  : requested;
assert(selected.length, 'Unknown --case');
const fixed = {
  scene: 'Full service · evening', blocks,
  fanSetting: 'F5 low (1), F2 off; all other baseline fan states unchanged',
  settings: clone(baseline.settings),
  measurementPlanes: {
    lux: 'seat book offset, seat floor Y + 0.80 m',
    air: 'seat X/Z, seat floor Y + 0.60 m',
    noiseStiSplEcho: 'seat X/Z, seat floor Y + 1.20 m',
    seatCoordinates: 'model floor XYZ; metres'
  },
  criteria: { stiEverySeat: 0.6, weakerWingTestMin: 0.45, weakerWingTestMean: 0.5, feedbackDb: 3, splDbA: [68, 76], bookLux: [200, 300], airMps: [0.3, 0.8], noiseComparisonDbA: 45 },
  configuration: { retainedWingIds: ['S276', 'S278'], omittedWingIds: ['S275', 'S277'], wallMountX: 43.82, wallMountAbsZ: 13.06, yaw: 180, mountYaw: '-sign(Z) * 90 degrees' }
};
const manifest = {
  schema: 1, status: 'Running design-development comparison; no construction or optimum approval', startedAt,
  baseline: { layout: 'baseline-layout.json', sha256: freeze.layoutSha256, sourceHashes: freeze.sourceHashes },
  runtimeSourceHashes, currentSourceHashesStart, runnerSha256, sourceMode: sourceRoot === repo ? 'current source with frozen imported baseline' : 'temporary frozen source snapshot',
  fixed, cases: selected,
  limitations: [
    'Existing catalogue directivity, response, ratings and fan noise are representative assumptions; no selected-product validation.',
    'Existing statistical reflections, empirical fan jets, occluders, receivers and criteria are unchanged.',
    'Per-seat STI, feedback, light, air and noise failures remain visible; raw arithmetic and acoustic-energy means are distinguished.',
    'Two wall mounting references are concepts; body/support clashes, window clearance, service access and structure are separately held.',
    'Passive audio peak/programme W and model amplifier operating allowance are distinct from approved mains demand.',
    'Ranking by minimum wing STI is a raw comparison order; root/owner retains coordinated design disposition.'
  ]
};
write('manifest.json', manifest);

function signature(seats) {
  return seats.map(s => [s.x, s.y, s.z, s.block, s.pew, s.book ?? null]);
}
function seatRef(s) {
  return { floor: [s.x, s.y, s.z], block: s.block, pew: s.pew, bookOffset: s.book ?? [0.25, 0] };
}
function summarizeZone(seats, P) {
  const out = { n: seats.length };
  for (const metric of ['lux', 'air', 'noise', 'sti', 'spl']) {
    const valid = seats.filter(s => Number.isFinite(s[metric]));
    if (!valid.length) { out[metric] = null; continue; }
    const isDbA = ['noise', 'spl'].includes(metric);
    const ordered = [...valid].sort((a, b) => a[metric] - b[metric]);
    const stats = P.statistics(valid.map(s => s[metric]), isDbA);
    out[metric] = {
      ...stats, mean: stats.avg,
      meanBasis: isDbA ? 'acoustic energy mean, dBA' : 'arithmetic mean',
      arithmeticMean: valid.reduce((a, s) => a + s[metric], 0) / valid.length,
      minimumSeat: seatRef(ordered[0]), maximumSeat: seatRef(ordered.at(-1)),
      worstSeat: seatRef(metric === 'noise' ? ordered.at(-1) : ordered[0])
    };
  }
  out.failureCounts = {
    stiBelow0p6: seats.filter(s => s.sti !== null && s.sti < 0.6).length,
    stiBelow0p45: seats.filter(s => s.sti !== null && s.sti < 0.45).length,
    stiNotApplicable: seats.filter(s => s.sti === null).length,
    splBelow68: seats.filter(s => s.spl !== null && s.spl < 68).length,
    splAbove76: seats.filter(s => s.spl !== null && s.spl > 76).length,
    luxBelow200: seats.filter(s => s.lux < 200).length,
    luxAbove300: seats.filter(s => s.lux > 300).length,
    airBelow0p3: seats.filter(s => s.air < 0.3).length,
    airAbove0p8: seats.filter(s => s.air > 0.8).length,
    noiseAbove45: seats.filter(s => s.noise > 45).length
  };
  const echoes = seats.filter(s => s.echo);
  out.echo = { seats: echoes.length, worstByGap: echoes.length ? seatRef([...echoes].sort((a, b) => b.echo.gapMs - a.echo.gapMs)[0]) : null, maxGapMs: echoes.length ? Math.max(...echoes.map(s => s.echo.gapMs)) : null, maxSeverity: echoes.length ? Math.max(...echoes.map(s => s.echo.severity)) : null };
  return out;
}
function zoneSummaries(seats, P) {
  return Object.fromEntries(['all', 'nave', 'wing', 'wing-B', 'wing-H'].map(zone => [zone,
    summarizeZone(seats.filter(s => zone === 'all' || zone === 'nave' && s.block !== 'wing' || zone === 'wing' && s.block === 'wing' || zone === 'wing-B' && s.block === 'wing' && s.z < 0 || zone === 'wing-H' && s.block === 'wing' && s.z > 0), P)
  ]));
}
function candidateLayout(c) {
  const layout = clone(baseline);
  if (c.kind === 'no-wing') layout.items = layout.items.filter(i => !['S275', 'S276', 'S277', 'S278'].includes(i.id));
  if (c.kind === 'two-wall') {
    layout.items = layout.items.filter(i => !['S275', 'S277'].includes(i.id));
    for (const [id, sign] of [['S276', -1], ['S278', 1]]) {
      const item = layout.items.find(i => i.id === id); assert(item, id);
      Object.assign(item, { type: c.type, mount: 'wall', pos: [43.82, c.y, sign * 13.06], yaw: 180, mountYaw: -sign * 90, tilt: c.tilt, anchorY: c.y, level: c.level, on: true, hidden: false, params: {} });
    }
  }
  return layout;
}

const study = loadStudyModel();
const { SIM, model, P } = study;
(async () => {
  const results = [];
  let expectedReceivers = blocks === 4 && frozenResult ? signature(frozenResult.seats) : null;
  let expectedMetrics = blocks === 4 && frozenResult ? frozenResult.seats.map(s => [s.lux, s.air, s.noise]) : null;
  for (const c of selected) {
    const start = performance.now();
    SIM.importLayout(candidateLayout(c), { record: false });
    SIM.state.scene = fixed.scene;
    model.interior.setSeatingLayout(blocks); SIM.refreshSeating();
    assert.deepEqual(clone(SIM.state.settings), fixed.settings, 'Comparison settings changed');
    for (const item of SIM.state.items) assert.equal(SIM.fixtures.get(item.id).type.id, item.type, 'Fixture cache type mismatch');
    assert(SIM.state.items.filter(i => i.circuit === 'F5').every(i => i.on && i.speed === 1), 'Held F5 low setting changed');
    assert(SIM.state.items.filter(i => i.circuit === 'F2').every(i => !i.on), 'F2 must remain off');
    const alignedDelays = c.alignDelays ? clone(SIM.alignDelays({ record: false })) : null;
    const analysis = await study.analyse();
    const seats = clone(analysis.seats.seats);
    assert.equal(seats.length, 368, 'All 368 receivers are required');
    const receiverSignature = signature(seats);
    if (frozenResult) assert.deepEqual(signature(seats.filter(s => s.block === 'wing')), signature(frozenResult.seats.filter(s => s.block === 'wing')), 'The frozen 80 wing receivers changed');
    if (!expectedReceivers) {
      expectedReceivers = receiverSignature;
      expectedMetrics = seats.map(s => [s.lux, s.air, s.noise]);
    } else {
      assert.deepEqual(receiverSignature, expectedReceivers, 'Receiver signature changed');
      assert.deepEqual(seats.map(s => [s.lux, s.air, s.noise]), expectedMetrics, 'A non-sound comparison input/result changed');
    }
    if (!results.length) write('receivers.json', { blocks, signature: receiverSignature, sha256: sha(JSON.stringify(receiverSignature)), n: seats.length });
    let frozenNumericalParity = null;
    const frozenCasePath = path.join(evidence, c.id + '.json');
    if (blocks === 4 && fs.existsSync(frozenCasePath)) {
      const frozenCase = JSON.parse(fs.readFileSync(frozenCasePath, 'utf8'));
      assert.deepEqual(seats, frozenCase.seats, 'Current imported-layout seat results differ from the frozen calculation');
      frozenNumericalParity = { originalCase: path.relative(repo, frozenCasePath), allSeatValuesExact: true };
    }
    const speakers = clone(SIM.speakers()).map(sp => ({
      ...sp,
      audioPeakW: sp.peakWatts,
      programmeAudioEstimatedW: Math.min(sp.peakWatts, sp.spec.ratedW) / 8,
      modelAmplifierOperatingAllowanceW: sp.on ? Math.min(sp.peakWatts, sp.spec.ratedW) / 8 / 0.7 + (sp.spec.active ? 25 : 6) : 0,
      audioPowerBasis: 'Existing nominal level + item level + mixer; peak includes 10 dB above nominal; programme estimate uses existing 8:1 model allowance. Not selected amplifier mains data.'
    }));
    for (const sp of speakers.filter(s => c.kind === 'two-wall' && ['S276', 'S278'].includes(s.id))) {
      assert(sp.src.f[0] < 0, 'Wing speaker must aim toward entrance (-X)');
      assert(Math.abs(sp.src.f[2]) < 1e-12, 'Wing pair must not face each other');
    }
    const microphones = SIM.mics().map(m => {
      const margin = P.feedbackMargin(speakers.filter(s => s.on).map(s => ({ src: s.src, spec: s.spec })), m, SIM.room(), SIM.state.settings.talkerDbA, SIM.state.settings.micDistance);
      if (m.on) assert(Math.abs(margin - m.item.feedbackMargin) < 1e-10, 'Feedback must match the actual analysis check');
      return { id: m.id, name: m.item.name, on: m.on, position: clone(m.pos), direction: clone(m.dir), feedbackMarginDb: margin, meets3Db: margin >= 3 };
    });
    const result = {
      case: c, status: 'Calculated concept comparison, no design or construction approval', blocks,
      elapsedSeconds: (performance.now() - start) / 1000,
      receiverSha256: sha(JSON.stringify(receiverSignature)),
      frozenNumericalParity,
      sourceHashes: runtimeSourceHashes,
      layout: clone(SIM.exportLayout()), alignedDelays,
      zones: zoneSummaries(seats, P), seats,
      microphones, speakerSources: speakers,
      fanSources: clone(SIM.fans()), room: clone(SIM.room()),
      power: clone(SIM.powerSummary()), checks: clone(SIM.analysis.checks)
    };
    write(c.id + '.json', result);
    const compact = { case: c, blocks, elapsedSeconds: result.elapsedSeconds, receiverSha256: result.receiverSha256, zones: result.zones, microphones, checks: result.checks, power: result.power };
    results.push(compact); write('summary.json', results);
    console.log(JSON.stringify({ id: c.id, seconds: Number(result.elapsedSeconds.toFixed(3)), wingStiMin: result.zones.wing.sti?.min, wingStiMean: result.zones.wing.sti?.mean, naveStiMin: result.zones.nave.sti?.min, allStiMin: result.zones.all.sti?.min, feedback: microphones.map(m => [m.id, m.feedbackMarginDb]), echoes: result.zones.all.echo.seats }));
  }
  const currentSourceHashesEnd = hashFiles(repo);
  const runtimeSourceHashesEnd = hashFiles(sourceRoot);
  const runtimeSourceFilesStableAtEnd = Object.keys(runtimeSourceHashes).every(p => runtimeSourceHashesEnd[p] === runtimeSourceHashes[p]);
  if (sourceRoot !== repo) assert(runtimeSourceFilesStableAtEnd, 'Temporary frozen calculation source files changed during this run');
  const sourceDrift = Object.keys(currentSourceHashesEnd).filter(p => currentSourceHashesEnd[p] !== currentSourceHashesStart[p]).map(p => ({ path: p, startSha256: currentSourceHashesStart[p], endSha256: currentSourceHashesEnd[p] }));
  const driftFromFrozenBaseline = Object.keys(currentSourceHashesEnd).filter(p => currentSourceHashesEnd[p] !== freeze.sourceHashes[p]).map(p => ({ path: p, baselineSha256: freeze.sourceHashes[p], currentSha256: currentSourceHashesEnd[p] }));
  write('ranking.json', results.filter(r => r.case.kind === 'two-wall').sort((a, b) => b.zones.wing.sti.min - a.zones.wing.sti.min).map((r, index) => ({ rankByMinimumWingSti: index + 1, case: r.case, wingSti: r.zones.wing.sti, naveSti: r.zones.nave.sti, allSti: r.zones.all.sti, microphones: r.microphones, echo: r.zones.all.echo, failureCounts: r.zones.all.failureCounts })));
  write('manifest.json', { ...manifest, status: 'Complete numerical comparison; no optimum, selected-product or construction approval', completedAt: new Date().toISOString(), currentSourceHashesEnd, sourceDrift, driftFromFrozenBaseline, runtimeSourceHashesEnd, runtimeSourceFilesStableAtEnd, liveSourceDriftRequiresStableRerun: sourceRoot === repo && !runtimeSourceFilesStableAtEnd, invariants: { full368ReceiversEachCase: true, receiverSignatureUnchanged: true, frozen80WingReceiversRetained: frozenResult ? true : null, frozenFourBlockNumericalParity: blocks === 4 && frozenResult ? true : null, luxAirNoiseIdenticalBetweenCases: true, fixturesMatchImportedCatalogType: true, everyMicrophoneRetained: true } });
  study.dispose();
})().catch(error => {
  write('failure.json', { at: new Date().toISOString(), message: error.message, stack: error.stack });
  console.error(error); study.dispose(); process.exitCode = 1;
});
