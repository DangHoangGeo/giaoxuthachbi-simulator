/* Export every existing seat receiver for repeatable comparative studies.
 * No acceptance decision or physics adjustment is made by this script.
 * Usage: node scripts/study_systems.cjs scenarios.json output-directory
 * Optional --repeat verifies exact equality after a fresh model load. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { loadStudyModel, root, sources } = require('./lib/study_model.cjs');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const frozen = value => { const copy = clone(value); delete copy.savedAt; return copy; };
const [scenarioPath, outputPath, ...flags] = process.argv.slice(2);
assert(scenarioPath && outputPath && flags.every(f => f === '--repeat'), 'Usage: node scripts/study_systems.cjs scenarios.json output-directory [--repeat]');
const scenarioBytes = fs.readFileSync(scenarioPath);
const input = JSON.parse(scenarioBytes);
const fingerprints = Object.fromEntries([...sources, 'scripts/lib/study_model.cjs', 'scripts/study_systems.cjs'].map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
assert(input.schema === 1 && Array.isArray(input.cases) && input.cases.length, 'scenario schema 1 with cases required');
const ids = new Set();
for (const c of input.cases) {
  assert(/^[a-z0-9-]+$/.test(c.id) && !ids.has(c.id), 'unique safe case ID required'); ids.add(c.id);
  assert([2, 4].includes(c.layoutBlocks), 'explicit 2 or 4 block layout required');
  assert(c.inputStatus && c.settings && c.scene, 'scenario, settings and evidence status required');
}
async function evaluate() {
  const context = loadStudyModel(), { SIM, model } = context;
  try {
    const baseline = frozen(SIM.exportLayout()), cases = [];
    for (const c of input.cases) {
      assert(SIM.SCENES[c.scene], 'unknown scene ' + c.scene);
      SIM.importLayout(clone(baseline), { record: false });
      model.interior.setSeatingLayout(c.layoutBlocks); SIM.refreshSeating();
      for (const [k, v] of Object.entries(c.settings)) {
        assert(k in SIM.state.settings, 'unknown setting ' + k);
        SIM.setSetting(k, v);
        assert.equal(SIM.state.settings[k], v, 'setting clamped or rejected: ' + k);
      }
      SIM.applyScene(c.scene, { record: false });
      // Input snapshot precedes analysis: feedbackMargin is a calculated cache.
      const layout = frozen(SIM.exportLayout());
      for (const item of layout.items) delete item.feedbackMargin;
      const result = clone((await context.analyse()).seats);
      const receiverIds = new Set();
      result.seats = result.seats.map(s => {
        const key = JSON.stringify([c.layoutBlocks, s.pew ?? null, s.block, s.x, s.y, s.z]);
        const receiverId = 'R' + c.layoutBlocks + '-' + hash(key).slice(0, 16);
        assert(!receiverIds.has(receiverId), 'receiver ID collision'); receiverIds.add(receiverId);
        return { receiverId, ...s };
      });
      for (const s of result.seats) for (const metric of ['lux', 'sti', 'spl', 'noise', 'air', 'cooling']) assert(s[metric] === null || Number.isFinite(s[metric]), 'invalid receiver value');
      const metrics = {};
      for (const metric of ['lux', 'sti', 'spl', 'noise', 'air']) {
        const sorted = result.seats.filter(s => Number.isFinite(s[metric])).sort((a, b) => a[metric] - b[metric] || a.receiverId.localeCompare(b.receiverId));
        const point = s => ({ receiverId: s.receiverId, block: s.block, pew: s.pew, positionM: [s.x, s.y, s.z], value: s[metric] });
        metrics[metric] = { evaluated: sorted.length, missing: result.n - sorted.length, lowest: sorted.slice(0, 10).map(point), highest: sorted.slice(-10).reverse().map(point) };
      }
      const below = (metric, limit) => result.seats.filter(s => Number.isFinite(s[metric]) && s[metric] < limit).map(s => s.receiverId);
      const sceneLuxTarget = SIM.sceneLuxTarget();
      const above = (metric, limit) => result.seats.filter(s => Number.isFinite(s[metric]) && s[metric] > limit).map(s => s.receiverId);
      const criteria = { sceneLuxTarget, belowSceneLux: sceneLuxTarget === null ? null : below('lux', sceneLuxTarget), below200Lux: below('lux', 200), above300Lux: above('lux', 300), belowSTI060: below('sti', .6), belowSTI050: below('sti', .5), belowSTI045: below('sti', .45), belowSPL068: below('spl', 68), aboveSPL076: above('spl', 76), aboveNoise035: above('noise', 35), aboveNoise040: above('noise', 40), aboveNoise045: above('noise', 45), belowAir030: below('air', .3), aboveAir080: above('air', .8) };
      const microphones = SIM.mics().map(m => ({ id: m.id, name: m.item.name, on: m.on, positionM: m.pos ?? m.item.pos, feedbackMarginDb: m.on && SIM.speakers().length ? m.item.feedbackMargin ?? null : null }));
      cases.push({ id: c.id, inputStatus: c.inputStatus, layoutBlocks: c.layoutBlocks, input: layout, room: clone(SIM.room()), results: result, metrics, criteria, microphones, checks: clone(SIM.analysis.checks), power: clone(SIM.powerSummary()) });
      console.log(`${c.id}: ${result.n} receivers; lux min=${result.lux?.min}; STI min=${result.sti?.min ?? 'null'}; air min=${result.air?.min}`);
    }
    return { baseline, cases };
  } finally { context.dispose(); }
}
(async () => {
  const study = await evaluate();
  let repeat = { performed: false, criterion: 'Exact JSON equality excluding export timestamps; no rounding tolerance' };
  if (flags.includes('--repeat')) {
    const repeated = await evaluate();
    // VM arrays have different prototypes across loads; compare the exported
    // JSON payload, including every numerical digit and array ordering.
    assert.equal(JSON.stringify(repeated), JSON.stringify(study), 'fresh model run did not reproduce every input/result');
    repeat = { ...repeat, performed: true, passed: true };
  }
  for (const [file, expected] of Object.entries(fingerprints)) assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, 'source changed during study: ' + file);
  assert.equal(hash(fs.readFileSync(scenarioPath)), hash(scenarioBytes), 'scenario input changed during study');
  fs.mkdirSync(outputPath, { recursive: true });
  for (const c of study.cases) fs.writeFileSync(path.join(outputPath, c.id + '.json'), JSON.stringify(c, null, 2) + '\n', { flag: 'wx' });
  fs.writeFileSync(path.join(outputPath, 'baseline-layout.json'), JSON.stringify(study.baseline, null, 2) + '\n', { flag: 'wx' });
  const manifest = { schema: 1, generatedAt: new Date().toISOString(), gitCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), node: process.version, platform: process.platform, sourceSha256: fingerprints, scenarioSha256: hash(scenarioBytes), scenarios: input, repeat, receiverIdBasis: 'Derived study ID: SHA-256 prefix of layout, pew, block and exact model x/y/z; not an equipment ID or approved capacity', planesMAboveLocalFloor: { book: .8, ears: 1.2, air: .6 }, bookHorizontalOffset: 'Each seat.book, default [0.25, 0]; unchanged analysis.js seatTask', limitations: ['Headless calculations; no rendering, audio, measured data or construction approval', 'Existing empirical methods unchanged; ambient/daylight and actual ventilation paths are not solved', 'Every case samples every model seat irrespective of scene occupancy; occupancy is an absorption scalar', 'Baseline recommended default only; browser-edited layouts are separate and were not accessed'], files: Object.fromEntries(['baseline-layout', ...study.cases.map(c => c.id)].map(id => [id + '.json', hash(fs.readFileSync(path.join(outputPath, id + '.json')))])) };
  fs.writeFileSync(path.join(outputPath, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  console.log(`Saved ${study.cases.length} cases to ${outputPath}; repeat: ${repeat.passed ?? 'not run'}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
