/* Verify the live default against the coordinated numerical cases after
 * display-only offline texture packaging. Uses all receivers and real sources;
 * thresholds, physics, user storage and archived comparison cases stay intact. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { loadStudyModel, root, sources } = require('./lib/study_model.cjs');
const clone = x => JSON.parse(JSON.stringify(x));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const evidence = path.join(root, 'review/wing-revision-2026-10-09');
const tracked = [...sources, 'scripts/lib/study_model.cjs',
  'Thach_Bi_Viewer/wing-saint-textures.js', 'scripts/build_saint_textures.py'];
const hashes = () => Object.fromEntries(tracked.map(p => [p, sha(fs.readFileSync(path.join(root, p)))]));
const startHashes = hashes();
const study = loadStudyModel();
const { SIM, model, P } = study;
const results = [];
function withoutDerived(items) {
  return clone(items).map(i => { delete i.feedbackMargin; return i; });
}
function independentAudience() {
  const cells = new Set();
  for (const s of SIM.GEO.seats) for (const dx of [-.6, -.3, 0, .3, .6])
    for (const dz of [-.3, 0, .3]) cells.add(Math.round((s.x + dx) * 2) + ':' + Math.round((s.z + dz) * 2));
  const alpha = P.ABSORPTION.pewsEmpty.map((a, b) => a + (P.ABSORPTION.pewsOccupied[b] - a) * SIM.state.settings.occupancy);
  for (const sp of SIM.speakers()) {
    const fraction = P.audienceFraction(sp.src, sp.spec,
      (x, z) => cells.has(Math.round(x * 2) + ':' + Math.round(z * 2)), 1);
    assert.deepEqual(clone(sp.src.reverbFactor), clone(fraction.map((f, b) => 1 - f * alpha[b])), sp.id + ': current seating cache');
  }
}
(async () => {
  const baseline = JSON.parse(fs.readFileSync(path.join(evidence, 'final-baseline-layout.json')));
  assert.equal(SIM.state.items.length, 320);
  assert.deepEqual(withoutDerived(SIM.state.items), withoutDerived(baseline.items), 'Actual default must match reviewed equipment');
  assert.deepEqual(clone(SIM.state.settings), baseline.settings, 'Actual default settings must match review');
  for (const blocks of [4, 2, 4]) {
    const file = `final-blocks-${blocks}/lights2-y3.8-fans2-extended-y4.05-speed1.json`;
    const expected = JSON.parse(fs.readFileSync(path.join(evidence, file)));
    model.interior.setSeatingLayout(blocks); SIM.refreshSeating();
    SIM.alignDelays({ record: false });
    const analysis = await study.analyse();
    const seats = clone(analysis.seats.seats);
    assert.equal(seats.length, 368);
    assert.equal(seats.filter(s => s.block === 'wing').length, 80);
    assert.deepEqual(seats, expected.seats, 'All receiver values must remain exact in ' + blocks + '-block seating');
    assert.deepEqual(clone(SIM.emitters()), expected.emitterSources, 'Physical light sources must remain exact');
    assert.deepEqual(clone(SIM.fans()), expected.fanSources, 'Actual fan nozzle sources must remain exact');
    assert.deepEqual(clone(SIM.speakers()), expected.speakerSources, 'Speaker transforms, delays and audience factors must remain exact');
    independentAudience();
    assert.deepEqual(clone(SIM.powerSummary()), expected.power, 'Power model must remain exact');
    for (const m of SIM.mics()) {
      const expectedMic = expected.microphones.find(x => x.id === m.id);
      assert(expectedMic, 'Missing reference microphone');
      const margin = P.feedbackMargin(SIM.speakers().filter(s => s.on).map(s => ({ src: s.src, spec: s.spec })),
        m, SIM.room(), SIM.state.settings.talkerDbA, SIM.state.settings.micDistance);
      assert.equal(margin, expectedMic.feedbackMarginDb, 'Feedback must remain exact');
    }
    results.push({ blocks, reference: file, referenceSha256: sha(fs.readFileSync(path.join(evidence, file))),
      receivers: 368, wingReceivers: 80, exactSeatParity: true, exactPhysicalSourceParity: true,
      exactPowerAndFeedbackParity: true, independentAudienceFactors: true });
  }
  assert.deepEqual(hashes(), startHashes, 'Sources changed during verification');
  fs.writeFileSync(path.join(evidence, 'current-default-parity.json'), JSON.stringify({
    status: 'PASS software/calculation parity; ENGINEERING HOLD remains', verifiedAt: new Date().toISOString(),
    command: 'node scripts/verify_wing_revision.cjs', sourceHashes: startHashes,
    verifierSha256: sha(fs.readFileSync(__filename)), results, constructionApproved: false
  }, null, 2) + '\n');
  console.log('PASS live default: exact 368-seat and physical-source parity, 4 → 2 → 4; engineering holds unchanged.');
  study.dispose();
})().catch(error => { study.dispose(); console.error(error); process.exitCode = 1; });
