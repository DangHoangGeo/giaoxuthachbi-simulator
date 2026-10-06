/* Independent analytical checks for the church's six estimate stats.
 * Run with node scripts/verify_estimates.cjs. No renderer, browser data or
 * persistent design is modified. The full geometry test remains separate.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const P = require('../Thach_Bi_Viewer/simulator/physics.js');
const checks = [];
function check(name, fn) { fn(); checks.push(name); }
function near(actual, expected, tolerance = 1e-9) {
  assert(Number.isFinite(actual), `finite result required, got ${actual}`);
  assert(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
}
const omni = { hb: Array(7).fill(360), vb: Array(7).fill(360), rear: Array(7).fill(0) };
const source = { pos: [0, 0, 0], f: [1, 0, 0], r: [0, 0, 1], u: [0, 1, 0], level1m: 80, coupling: 0 };
const room = P.roomModel({ roofFinish: 'mixed', entranceFinish: 'slats' });
const noAirRoom = { ...room, airDb: Array(7).fill(0) };
const directLevel = a => P.dbaFromBands(a.direct.map(P.db));

check('Point illuminance: cosine law and inverse square', () => {
  const lamp = { kind: 'point', pos: [0, 2, 0], cd: 100 };
  near(P.illuminance([0, 0, 0], [0, 1, 0], [lamp]), 25);
  near(P.illuminance([0, -2, 0], [0, 1, 0], [lamp]), 6.25);
  near(P.illuminance([0, 0, 0], [0, -1, 0], [lamp]), 0);
  near(P.illuminance([0, 0, 0], [0, 1, 0], [lamp], { blocked: () => true }), 0);
  near(P.illuminance([2, 0, 0], [0, 1, 0], [lamp]), 100 * Math.SQRT1_2 / 8);
});
check('Spotlight normalization conserves lumens and reaches half intensity at beam angle', () => {
  for (const beam of [12, 24, 36, 60, 90]) {
    const cone = P.spotCone(beam, beam * 1.6);
    near(P.peakCandela(2000, cone) * P.coneSolidAngle(cone), 2000, 1e-8);
    near(P.smoothstep(cone.cosOuter, cone.cosInner, Math.cos(beam * Math.PI / 360)), 0.5);
  }
});
check('A-weighted band conversion round-trips arbitrary levels and spectra', () => {
  for (const L of [0, 35, 62, 85]) for (const shape of [P.SPEECH_SPECTRUM, P.FAN_SPECTRUM, P.AMBIENT_SPECTRUM]) {
    near(P.dbaFromBands(P.bandsFromDbA(L, shape)), L);
  }
});
check('Acoustic averages use energy; equal sources add 3.0103 dB', () => {
  near(P.meanLevel([40, 60]), 10 * Math.log10(505000));
  near(P.meanLevel([50, 50]), 50);
  near(P.dbaFromBands(P.sumBands(P.bandsFromDbA(50, P.FAN_SPECTRUM), P.bandsFromDbA(50, P.FAN_SPECTRUM))), 50 + 10 * Math.log10(2));
  assert.equal(P.meanLevel([null, NaN, Infinity]), null);
});
check('Statistics use interpolated percentiles and exclude unavailable readings', () => {
  const s = P.statistics([0, 10, null, 20, 30, NaN]);
  near(s.avg, 15); near(s.median, 15); near(s.p10, 3); near(s.p05, 1.5); near(s.p95, 28.5);
  assert.equal(s.n, 4); near(P.statistics([40, 60], true).avg, 10 * Math.log10(505000));
});
check('Speaker on-axis direct SPL at 1 m matches its stated dBA, with response and line length', () => {
  for (const lineLength of [undefined, 0.6, 1, 2]) for (const spectrum of [undefined, P.FLAT_SPECTRUM]) {
    const a = P.sourceArrivals({ ...source, lineLength, response: [-14, -6, -1, 0, 0, 0, -3] }, omni, [1, 0, 0], room, null, spectrum);
    near(directLevel(a), 80);
  }
});
check('Point speech loses 6.0206 dB when distance doubles', () => {
  const at2 = P.sourceArrivals(source, omni, [2, 0, 0], noAirRoom);
  const at4 = P.sourceArrivals(source, omni, [4, 0, 0], noAirRoom);
  near(directLevel(at2) - directLevel(at4), 20 * Math.log10(2));
});
check('Line source has continuous transition and correct near/far distance slopes', () => {
  const line = { ...source, lineLength: 2 };
  const at2 = P.sourceArrivals(line, omni, [2, 0, 0], noAirRoom);
  const at4 = P.sourceArrivals(line, omni, [4, 0, 0], noAirRoom);
  near(P.db(at2.direct[6] / at4.direct[6]), 10 * Math.log10(2));
  const rt = 4 * 8000 / (2 * room.c);
  const before = P.sourceArrivals(line, omni, [rt * (1 - 1e-7), 0, 0], noAirRoom);
  const after = P.sourceArrivals(line, omni, [rt * (1 + 1e-7), 0, 0], noAirRoom);
  near(P.db(before.direct[6] / after.direct[6]), 0, 0.00001);
  const far1 = P.sourceArrivals(line, omni, [rt * 2, 0, 0], noAirRoom);
  const far2 = P.sourceArrivals(line, omni, [rt * 4, 0, 0], noAirRoom);
  near(P.db(far1.direct[6] / far2.direct[6]), 20 * Math.log10(2));
});
check('Outdoor receivers have no enclosed reverberation, without changing direct sound', () => {
  const sp = { ...source, coupling: 1 };
  const inside = P.sourceArrivals(sp, omni, [4, 0, 0], room, null, undefined, 1);
  const outside = P.sourceArrivals(sp, omni, [4, 0, 0], room, null, undefined, 0);
  assert(inside.reflected.some(v => v > 0));
  outside.reflected.forEach(v => near(v, 0));
  outside.direct.forEach((v, i) => near(v, inside.direct[i]));
});
check('STI remains bounded and decreases with additional background noise', () => {
  const a = P.sourceArrivals({ ...source, level1m: 65, coupling: 1 }, omni, [4, 0, 0], room);
  const quiet = P.sti([a], P.bandsFromDbA(30, P.AMBIENT_SPECTRUM), room);
  const loud = P.sti([a], P.bandsFromDbA(70, P.AMBIENT_SPECTRUM), room);
  assert(quiet.sti >= 0 && quiet.sti <= 1 && loud.sti >= 0 && loud.sti <= 1);
  assert(loud.sti < quiet.sti);
});
check('Feedback margin responds to gain, microphone distance and additional source energy', () => {
  const sp = { src: { ...source, coupling: 1 }, spec: omni };
  const mic = { pos: [5, 0, 0], dir: [-1, 0, 0] };
  const base = P.feedbackMargin([sp], mic, room, 62, 0.4);
  near(P.feedbackMargin([{ ...sp, src: { ...sp.src, level1m: 86 } }], mic, room, 62, 0.4), base - 6);
  near(P.feedbackMargin([sp], mic, room, 62, 0.2), base + 20 * Math.log10(2));
  near(P.feedbackMargin([sp, sp], mic, room, 62, 0.4), base - 10 * Math.log10(2));
});
check('Fan airflow and cooling outputs have physically appropriate boundaries', () => {
  const fan = { kind: 'ceiling', pos: [0, 5, 0], diameter: 1.42, flow: 2, floorY: 0 };
  near(P.fanAirSpeed({ ...fan, flow: 0 }, [0, 0.6, 0]), 0);
  near(P.fanAirSpeed({ ...fan, kind: 'exhaust' }, [0, 0.6, 0]), 0);
  near(P.fanAirSpeed(fan, [0, 0.6, 0], 0.85), P.fanAirSpeed(fan, [0, 0.6, 0]) * 0.85);
  assert(P.fanAirSpeed(fan, [0, 0.6, 0]) > P.fanAirSpeed(fan, [10, 0.6, 0]));
  near(P.combineAirSpeeds([0.3, 0.4]), 0.5);
  near(P.coolingEffect(0), 0);
  for (const v of [0.2, 0.3, 0.5, 0.8, 1.2]) assert(P.coolingEffect(v + 0.01) >= P.coolingEffect(v));
});

// Use the actual engine API for power accounting and setting validation.
const sandbox = { console, performance, setTimeout: () => 0, clearTimeout() {},
  localStorage: { setItem() {}, getItem: () => null } };
sandbox.window = sandbox;
vm.createContext(sandbox);
const viewer = path.join(__dirname, '..', 'Thach_Bi_Viewer', 'simulator');
for (const file of ['physics', 'catalog', 'engine']) vm.runInContext(fs.readFileSync(path.join(viewer, file + '.js'), 'utf8'), sandbox, { filename: file });
const SIM = sandbox.CHURCH_SIMULATOR, CAT = sandbox.CHURCH_SIM_CATALOG;
check('Every catalogue item draws zero operational watts when off or hidden', () => {
  for (const type of CAT.types) {
    near(SIM.itemWatts({ type: type.id, on: false, hidden: false }), 0);
    near(SIM.itemWatts({ type: type.id, on: true, hidden: true }), 0);
  }
});
check('Fan power follows discrete speeds and preserves connected rating while off', () => {
  near(SIM.itemWatts({ type: 'fanCeiling', on: true, speed: 1 }), 18);
  near(SIM.itemWatts({ type: 'fanCeiling', on: true, speed: 2 }), 34);
  near(SIM.itemWatts({ type: 'fanCeiling', on: true, speed: 3 }), 60);
  near(SIM.itemWatts({ type: 'fanCeiling', on: true, speed: 0 }), 0);
  near(SIM.itemWatts({ type: 'fanCeiling', on: false, speed: 1 }, true), 60);
  near(SIM.itemWatts({ type: 'fanCeiling', on: true, speed: 99 }), 60);
});
check('LED power uses the declared efficacy and dimmer/driver allowance', () => {
  const L = CAT.byId.projector24.light;
  near(SIM.itemWatts({ type: 'projector24', on: true, lumens: L.lumens * 2, dim: 1 }), L.watts * 2);
  near(SIM.itemWatts({ type: 'projector24', on: true, dim: 0.5 }), L.watts * 0.53);
  near(SIM.itemWatts({ type: 'projector24', on: true, lumens: -1000 }), 0);
});
check('Festival power follows the actual number of bulbs, including spacing', () => {
  near(CAT.bulbCount({ length: 12, spacing: 0.6 }), 21);
  near(SIM.itemWatts({ type: 'bulbString', on: true, params: { length: 12, spacing: 0.6 }, dim: 1 }), 21);
  near(SIM.itemWatts({ type: 'bulbString', on: true, params: { length: 12, spacing: 0.3 }, dim: 0.5 }), 20.5);
  near(SIM.itemWatts({ type: 'bulbString', on: true, params: { length: -12, spacing: 0.6 }, dim: 1 }), 0);
});
check('Power totals and service energy are dimensionally correct and reconcile by circuit', () => {
  SIM.state.items = [{ type: 'fanCeiling', circuit: 'F1', on: true, speed: 2 }, { type: 'fanWall', circuit: 'F2', on: true, speed: 2 }];
  SIM.setSetting('serviceHours', 1.5); SIM.setSetting('servicesPerMonth', 80); SIM.setSetting('tariff', 2200);
  const p = SIM.powerSummary();
  near(p.total, 79); near(p.byCircuit.reduce((s, c) => s + c.watts, 0), p.total);
  near(p.kWhService, 0.1185); near(p.kWhMonth, 9.48); near(p.costMonth, 20856);
});
check('Invalid estimate settings cannot generate negative loads, energy or invalid acoustics', () => {
  SIM.setSetting('serviceHours', -4); SIM.setSetting('servicesPerMonth', -20); SIM.setSetting('tariff', -100);
  near(SIM.state.settings.serviceHours, 0.25); near(SIM.state.settings.servicesPerMonth, 1); near(SIM.state.settings.tariff, 0);
  SIM.setSetting('occupancy', 9); SIM.setSetting('rh', -1); SIM.setSetting('maintenance', 2); SIM.setSetting('tempC', -273);
  near(SIM.state.settings.occupancy, 1); near(SIM.state.settings.rh, 0); near(SIM.state.settings.maintenance, 1); near(SIM.state.settings.tempC, -20);
  SIM.setSetting('serviceHours', NaN); near(SIM.state.settings.serviceHours, 1.5);
  SIM.setSetting('talker', 'false'); assert.equal(SIM.state.settings.talker, false);
});

// Exercise the same analysis entry points used by the HUD, seated averages
// and plan overlays, with controlled sources at known coordinates.
sandbox.setTimeout = setTimeout; sandbox.clearTimeout = clearTimeout;
SIM.state.items = [{ id: 'fan', name: 'Controlled test fan', type: 'fanCeiling', circuit: 'F1',
  on: true, speed: 2, mount: 'pendant', pos: [20.75, 5, 0.15] }];
Object.assign(SIM.state.settings, { maintenance: 0.8, occupancy: 0.6, rh: 75, tempC: 28, ambientDbA: 40, talker: false, overlay: 'none' });
SIM.GEO.seats = [{ x: 20.75, z: 0.15, y: 0, block: 'central' }];
SIM.GEO.columns = [];
let wallBlocks = false;
SIM.GEO.occluders = { walls: [], blocked: () => false, blockedByWall: () => wallBlocks, blockedByColumn: () => false };
let lights = [{ kind: 'point', pos: [20.75, 4, 0.15], cd: 100, lumens: 4 * Math.PI * 100, interior: true }];
let fans = [{ id: 'fan', kind: 'ceiling', pos: [20.75, 5, 0.15], diameter: 1.42, floorY: 0, flow: 2, dBA: 38, running: true }];
let speakers = [{ on: true, spec: omni, src: { ...source, pos: [18.75, 1.2, 0.15], level1m: 65, coupling: 1 } }];
SIM.emitters = () => lights; SIM.fans = () => fans; SIM.speakers = () => speakers;
SIM.mics = () => []; SIM.room = () => room;
vm.runInContext(fs.readFileSync(path.join(viewer, 'analysis.js'), 'utf8'), sandbox, { filename: 'analysis' });
async function run(kinds) {
  return new Promise(resolve => { const off = SIM.on('analysis', r => { off(); resolve(r); }); SIM.analysis.run(kinds); });
}
(async () => {
  const r = await run(['seats', 'air', 'noise']);
  const seated = r.seats.seats[0], point = SIM.analysis.pointValues(seated.x, seated.z, 1.2);
  check('HUD point and seated sample agree at the same book, ear and airflow planes', () => {
    for (const key of ['lux', 'sti', 'spl', 'noise', 'air']) near(point[key], seated[key]);
  });
  check('Air and noise plan samples agree with the exact point calculation', () => {
    for (const kind of ['air', 'noise']) {
      const g = r[kind], i = Math.round((seated.x - g.x0) / g.step), j = Math.round((seated.z - g.z0) / g.step);
      near(g.values[j * g.nx + i], point[kind], 0.00001);
    }
  });
  check('Air does not pass through solid walls', () => {
    wallBlocks = true; near(SIM.analysis.pointValues(20.75, 0.15, 1.2).air, 0); wallBlocks = false;
  });
  check('No fans or speakers gives zero fan airflow, ambient-only noise and no invented speech/STI', () => {
    fans = []; speakers = []; lights = [];
    const p = SIM.analysis.pointValues(20.75, 0.15, 1.2);
    near(p.air, 0); near(p.noise, 40); near(p.lux, 0); assert.equal(p.spl, null); assert.equal(p.sti, null);
  });
  check('Indoor diffuse light does not extend beyond the church envelope', () => {
    lights = [{ kind: 'point', pos: [20, 3, 0], cd: 0, lumens: 10000, interior: true }];
    assert(SIM.analysis.pointValues(20, 0, 1.2).lux > 0);
    const outside = SIM.analysis.pointValues(60, 0, 1.2); near(outside.lux, 0); near(outside.floorLux, 0); assert.equal(outside.zone, 'outside');
  });
  check('Outdoor noise follows free-field fan spreading without a room-wide noise floor', () => {
    SIM.state.settings.ambientDbA = 0;
    fans = [{ id: 'outdoor-fan', kind: 'ceiling', pos: [-20, 1, 0], diameter: 1.42, floorY: 0, flow: 2, dBA: 50, running: true }];
    const p = SIM.analysis.pointValues(-22, 0, 1);
    near(p.noise, 10 * Math.log10(1 + 100000 / 4));
    fans.push({ ...fans[0], id: 'second-outdoor-fan' });
    near(SIM.analysis.pointValues(-22, 0, 1).noise, 10 * Math.log10(1 + 200000 / 4));
  });
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
