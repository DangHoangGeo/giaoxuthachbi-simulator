/* Regression for actual viewer source fractions. Synthetic positions are used
 * only inside this isolated test, never saved as a project layout. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const args = process.argv.slice(2);
const option = name => args.find(a => a.startsWith(name + '='))?.slice(name.length + 1);
const repo = path.resolve(__dirname, '../..');
const sourceRoot = path.resolve(option('--source-root') || repo);
const output = path.resolve(option('--out') || path.join(__dirname, 'audience-cache-regression.json'));
const { loadStudyModel } = require(path.join(sourceRoot, 'scripts/lib/study_model.cjs'));
const study = loadStudyModel(), { SIM, model, P } = study;
const rows = [];
const copy = x => JSON.parse(JSON.stringify(x));
function exactSourceFactors(label) {
  const cells = new Set();
  for (const seat of SIM.GEO.seats) for (const dx of [-0.6, -0.3, 0, 0.3, 0.6]) for (const dz of [-0.3, 0, 0.3]) cells.add(Math.round((seat.x + dx) * 2) + ':' + Math.round((seat.z + dz) * 2));
  const alpha = P.ABSORPTION.pewsEmpty.map((a, b) => a + (P.ABSORPTION.pewsOccupied[b] - a) * SIM.state.settings.occupancy);
  const actual = SIM.speakers();
  const sources = actual.map(sp => {
    const fraction = P.audienceFraction(sp.src, sp.spec, (x, z) => cells.has(Math.round(x * 2) + ':' + Math.round(z * 2)), 1.0);
    const expected = copy(fraction.map((f, b) => 1 - f * alpha[b]));
    assert.deepEqual(copy(sp.src.reverbFactor), expected, label + ': ' + sp.id + ' must use current receiver positions');
    return { id: sp.id, cachedFactor: copy(sp.src.reverbFactor), independentlyRecomputedFactor: expected };
  });
  assert.equal(SIM.GEO.seats.length, 368, 'Same receiver count is part of this regression');
  rows.push({ step: label, receivers: 368, sources });
  return sources;
}
try {
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline-layout.json'), 'utf8'));
  SIM.importLayout(baseline, { record: false });
  model.interior.setSeatingLayout(4); SIM.refreshSeating();
  const original = exactSourceFactors('Four blocks');
  model.interior.setSeatingLayout(2); SIM.refreshSeating();
  const two = exactSourceFactors('Two blocks after four');
  assert.notDeepEqual(two, original, 'Two-block geometry must affect audience interception at the same count');
  model.interior.setSeatingLayout(4); SIM.refreshSeating();
  assert.deepEqual(exactSourceFactors('Four blocks restored'), original);
  const actualSeats = SIM.GEO.seatsByLayout[4];
  try {
    SIM.GEO.seatsByLayout[4] = actualSeats.map(seat => ({ ...seat, x: seat.x + 2.0, z: seat.z + 1.6 }));
    SIM.refreshSeating();
    const moved = exactSourceFactors('Same count, synthetic positions changed');
    assert.notDeepEqual(moved, original, 'Changing positions at the same count must recompute audience interception');
  } finally {
    SIM.GEO.seatsByLayout[4] = actualSeats; SIM.refreshSeating();
  }
  assert.deepEqual(exactSourceFactors('Original positions restored'), original);
  fs.writeFileSync(output, JSON.stringify({ status: 'Passed software cache regression; no physical design approval', method: 'Independent existing P.audienceFraction with fresh cells at the actual receiver coordinates; unchanged absorption and occupancy', steps: rows }, null, 2) + '\n');
  console.log(JSON.stringify({ audienceCacheRegression: 'passed', steps: rows.length, sourcesPerStep: original.length, sameCount: 368 }));
} catch (error) {
  fs.writeFileSync(output, JSON.stringify({ status: 'Failed software cache regression', message: error.message.slice(0, 2500), completedSteps: rows }, null, 2) + '\n');
  console.error(error.message.slice(0, 2500)); process.exitCode = 1;
} finally { study.dispose(); }
