/* Headless checks for the simulator layer: runs the actual bundled geometry,
   the as-drawn structure correction, every catalogue model, the recommended
   design and the analysis engine without a GPU or audio device.
   Usage: node scripts/verify_simulator.cjs [--report]                       */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const viewer = path.join(root, 'Thach_Bi_Viewer');

const gradient = { addColorStop() {} };
const ctx2d = new Proxy({ getImageData() { return { data: new Uint8ClampedArray(512 * 512 * 4) }; }, createLinearGradient() { return gradient; }, createRadialGradient() { return gradient; }, measureText() { return { width: 120 }; } },
  { get(t, k) { return k in t ? t[k] : () => {}; }, set(t, k, v) { t[k] = v; return true; } });
const listeners = {};
const element = () => ({ width: 512, height: 512, style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, getContext() { return ctx2d; }, addEventListener() {}, setAttribute() {}, append() {}, appendChild() {} });
const body = element();
body.dataset.lighting = 'evening';
const document = { getElementById() { return null; }, createElement: element, body, querySelector() { return null; }, querySelectorAll() { return []; } };
const storage = new Map();
const sandbox = {
  console, document, location: { search: '' }, URLSearchParams, Uint8ClampedArray, performance, setTimeout, clearTimeout,
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)) },
  MutationObserver: class { observe() {} }, requestAnimationFrame: () => 0
};
sandbox.window = sandbox;
sandbox.addEventListener = (e, f) => { (listeners[e] ||= []).push(f); };
vm.createContext(sandbox);
for (const file of ['references.js', 'glass-art.js', 'realism.js', 'planning.js', 'simulator/physics.js', 'simulator/catalog.js', 'simulator/engine.js', 'simulator/design.js', 'simulator/analysis.js'])
  vm.runInContext(fs.readFileSync(path.join(viewer, file), 'utf8'), sandbox, { filename: file });

let src = fs.readFileSync(path.join(viewer, 'bundle.js'), 'utf8');
const begin = src.indexOf('    Us = document.getElementById("viewport"),');
const end = src.indexOf('  var ce = {};', begin);
assert(begin > 0 && end > begin);
src = src.slice(0, begin) + `    ni = {capabilities:{getMaxAnisotropy:()=>8, maxFragmentUniforms:1024}, shadowMap:{enabled:true}, toneMappingExposure:1, domElement:{addEventListener(){}, getBoundingClientRect(){return {left:0,top:0,width:1280,height:800}}, height:800}};
  var ii = new Ti(), xn = new Cs(), Fp = new Cs(), X0 = new xr();
  ii.background = new De('#d9e4e9'); ii.add(xn,Fp,X0);
` + src.slice(end);
const ui = src.lastIndexOf('  z0({');
src = src.slice(0, ui) + `  window.model={THREE:Ec,building:nn,scene:ii,roofs:ei,mat:ce,data:ti,batches:t_,interior:Qo};\n})();`;
const t0 = Date.now();
vm.runInContext(src, sandbox, { timeout: 120000, filename: 'bundle.js' });
const { THREE: T, building, data, interior, batches } = sandbox.window.model;
const SIM = sandbox.CHURCH_SIMULATOR;
const CAT = sandbox.CHURCH_SIM_CATALOG;
const P = sandbox.CHURCH_SIM_PHYSICS;

// --- As-drawn frame -------------------------------------------------------
const nodes = []; building.traverse(o => nodes.push(o));
const ties = nodes.filter(o => o.name === 'Main tie beam 0.30 × 0.59 m · as drawn');
assert.equal(ties.length, 8, 'eight main tie beams (axes 3–9 and 11)');
for (const t of ties) { const b = new T.Box3().setFromObject(t); assert(Math.abs(b.min.y - 8.59) < 0.002 && Math.abs(b.max.y - 9.18) < 0.002, 'tie beam levels'); }
const sideBeams = nodes.filter(o => o.name === 'Side beam 0.22 × 0.34 m · as drawn');
assert.equal(sideBeams.length, 14, 'side beams on axes 3–9, both sides');
assert(nodes.filter(o => o.name === 'Purlin · as drawn spacing ~0.50 m').length >= 28, 'drawn purlins');
const truss = [...batches.keys()].find(g => g.userData.proposedTruss);
assert(truss, 'proposed truss layer is a separate batch');
const moved = []; truss.traverse(o => { if (o.isMesh) moved.push(o.name); });
for (const n of ['Proposed truss king post', 'Proposed roof truss diagonal', 'Schematic transverse tie']) assert(moved.includes(n), 'moved ' + n);
assert.equal(batches.get(truss).visible, false, 'proposed bracing hidden by default');
assert(!nodes.some(o => o.name.startsWith('Proposed nave chandelier')), 'legacy chandeliers detached from batches');
assert.equal(interior.lights.length, 0, 'legacy interior lights replaced');

// --- Start with a stub viewer API ------------------------------------------
const camera = new T.PerspectiveCamera(50, 1.6, 0.05, 500); camera.position.set(20, 1.6, 0);
const church = { colliders: [], walkCamera: { aspect: 1.6, fov: 68, updateProjectionMatrix() {} }, walk: { eyeHeight: 1.65, speed: 2.05 }, places: {}, goTo() {}, setMode() {}, uiState: () => ({ roof: true }), camera, controls: { target: new T.Vector3(), update() {} } };
SIM.start(church);
assert(SIM.ready, 'simulator started');
assert(SIM.state.items.length > 100, 'recommended design loaded: ' + SIM.state.items.length);
assert.equal(church.walk.speed, 1.4, 'realistic walking speed');
assert(church.walkCamera.fov < 60, 'natural lens instead of 68° vertical: ' + church.walkCamera.fov.toFixed(1));
for (const t of CAT.types) {
  const it = SIM.add({ type: t.id, pos: [20, 1, 0], mount: t.mounts[0], anchorY: 8.59 }, { record: false });
  assert(it, 'catalogue item builds: ' + t.id);
  SIM.remove(it.id, { record: false });
}
for (const it of SIM.state.items) {
  const t = CAT.byId[it.type];
  assert(t, 'type ' + it.type);
  for (const v of it.pos) assert(Number.isFinite(v));
  if (it.mount === 'pendant') assert(it.anchorY >= it.pos[1] - 0.01, 'pendant hangs below its anchor: ' + it.name);
}
// Floor-standing items collide in walk mode.
assert(church.colliders.some(c => c.kind === 'simulator'), 'floor items add walk colliders');
// Every fixture is fixed to something the model actually has: wall items need a
// surface right behind them, pendants need structure at their anchor (fans on
// steel spreaders and strung decorations carry their own support).
{
  const scene = sandbox.window.model.scene, solid = [];
  scene.updateMatrixWorld(true);
  scene.traverse(o => {
    if (!o.isMesh || (o.material?.name || '').startsWith('Simulator')) return;
    for (let p = o; p; p = p.parent) if ((p.name || '').startsWith('Simulator')) return;
    solid.push(o);
  });
  const rc = new T.Raycaster(); rc.camera = camera;
  const hit = (from, dir, far) => { rc.set(new T.Vector3(...from), new T.Vector3(...dir)); rc.near = 0; rc.far = far; return rc.intersectObjects(solid, false)[0]; };
  for (const it of SIM.state.items.filter(i => i.mount === 'wall')) {
    const a = (it.mountYaw ?? 0) * Math.PI / 180, f = [Math.cos(a), 0, Math.sin(a)];
    assert(hit([it.pos[0] + f[0] * 0.25, it.pos[1], it.pos[2] + f[2] * 0.25], [-f[0], 0, -f[2]], 0.4), 'wall item sits on a surface: ' + it.name);
  }
  const seen = new Set();
  for (const it of SIM.state.items.filter(i => i.mount === 'pendant' && !i.params?.spreader && i.type !== 'bunting')) {
    const key = `${it.type}|${it.anchorY.toFixed(2)}|${it.pos[0].toFixed(0)}|${Math.abs(it.pos[2]).toFixed(1)}`; // mirrored pairs share a ray
    if (seen.has(key)) continue;
    seen.add(key);
    const h = hit([it.pos[0], it.anchorY - 0.3, it.pos[2]], [0, 1, 0], 0.6);
    assert(h && Math.abs(h.point.y - it.anchorY) < 0.3, 'pendant hangs from structure: ' + it.name);
  }
}

// --- Frame + pool -----------------------------------------------------------
for (let i = 0; i < 4; i++) SIM.frame(0.05, 'walk', camera);
const pool = SIM.poolStats();
assert(pool && pool.emitters > 60, 'light pool fed: ' + JSON.stringify(pool));

// --- Analysis ---------------------------------------------------------------
const A = SIM.analysis;
function runSync(kinds) {
  return new Promise(resolve => { const off = SIM.on('analysis', r => { off(); resolve(r); }); A.run(kinds); });
}
(async () => {
  await new Promise(r => setTimeout(r, 400));
  const r = await runSync(['seats', 'lux', 'sti', 'air', 'noise']);
  const s = r.seats;
  assert(s.n >= 300, 'seats evaluated');
  const room = SIM.room();
  const report = {
    buildMs: Date.now() - t0,
    items: SIM.state.items.length, pool,
    room: { V: Math.round(room.V), T: room.T.map(t => +t.toFixed(2)), Tmid: +room.Tmid.toFixed(2) },
    seats: s.n,
    lux: { avg: Math.round(s.lux.avg), min: Math.round(s.lux.min), p10: Math.round(s.lux.p10), u0: +s.lux.u0.toFixed(2), okPct: Math.round(s.luxOk) },
    sti: s.sti && { avg: +s.sti.avg.toFixed(3), min: +s.sti.min.toFixed(3), okPct: Math.round(s.stiOk), fairPct: Math.round(s.stiFair) },
    spl: s.spl && { avg: +s.spl.avg.toFixed(1), spread90: +s.splSpread.toFixed(1) },
    noise: s.noise && { avg: +s.noise.avg.toFixed(1), max: +s.noise.max.toFixed(1) },
    air: { avg: +s.air.avg.toFixed(2), min: +s.air.min.toFixed(2), max: +s.air.max.toFixed(2), okPct: Math.round(s.airOk) },
    cooling: +s.cooling.avg.toFixed(1),
    blocks: Object.fromEntries(Object.entries(s.blocks).map(([k, b]) => [k, { lux: Math.round(b.lux.avg), sti: b.sti ? +b.sti.avg.toFixed(2) : null, air: +b.air.avg.toFixed(2) }])),
    checks: A.checks.map(c => `${c.level}: ${c.title} — ${c.detail}`),
    power: (() => { const p = SIM.powerSummary(); return { totalW: Math.round(p.total), kWhService: +p.kWhService.toFixed(1), byCircuit: p.byCircuit.map(c => `${c.circuit} ${Math.round(c.watts)} W`) }; })(),
    grids: Object.fromEntries(['lux', 'sti', 'air', 'noise'].map(k => [k, r[k] ? r[k].values.filter(Number.isFinite).length : 0]))
  };
  if (process.argv.includes('--report')) console.log(JSON.stringify(report, null, 2));
  // Sanity ranges for the recommended design.
  assert(s.lux.avg > 150 && s.lux.avg < 600, 'seat illuminance plausible: ' + s.lux.avg);
  assert(s.sti.avg > 0.4 && s.sti.avg < 0.85, 'seat STI plausible: ' + s.sti.avg);
  assert(s.air.avg > 0.15 && s.air.avg < 1.5, 'seat air speed plausible: ' + s.air.avg);
  assert(!A.checks.some(c => c.level === 'error'), 'recommended design has no errors: ' + A.checks.filter(c => c.level === 'error').map(c => c.title + ' ' + c.detail).join('; '));
  // The recommended design also meets its own checks and the main brief targets.
  assert(!A.checks.some(c => c.level === 'warn'), 'recommended design has no warnings: ' + A.checks.filter(c => c.level === 'warn').map(c => c.title + ' ' + c.detail).join('; '));
  assert(s.luxOk >= 95, 'seats with ≥ 200 lux: ' + s.luxOk);
  assert(s.sti.min >= 0.45 && s.stiOk >= 75, 'speech clarity: min ' + s.sti.min + ', ' + s.stiOk + ' % ≥ 0.60');
  // Toggling a circuit changes light; history restores it.
  const before = s.lux.avg;
  SIM.applyScene('All off');
  const off = (await runSync(['seats'])).seats.lux.avg;
  assert(off < before * 0.3, 'all-off scene removes most reading light: ' + off);
  assert(SIM.undo(), 'undo scene');
  const back = (await runSync(['seats'])).seats.lux.avg;
  assert(Math.abs(back - before) < 1, 'undo restores lighting');
  // Export / import round trip.
  const json = JSON.stringify(SIM.exportLayout());
  const n = SIM.importLayout(json);
  assert.equal(n, SIM.state.items.length, 'layout round trip');
  assert(SIM.exportSchedule().split('\n').length === SIM.state.items.length + 1, 'schedule CSV rows');
  console.log(JSON.stringify({ checks: 'passed', items: report.items, lux: report.lux, sti: report.sti, air: report.air, noise: report.noise, Tmid: report.room.Tmid }, null, 1));
})().catch(e => { console.error(e); process.exitCode = 1; });
