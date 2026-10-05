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
for (const file of ['references.js', 'glass-art.js', 'realism.js', 'planning.js', 'simulator/physics.js', 'simulator/catalog.js', 'simulator/engine.js', 'simulator/design.js', 'simulator/analysis.js', 'simulator/electrical.js'])
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
const church = { scene: sandbox.window.model.scene, colliders: [], walkCamera: { aspect: 1.6, fov: 68, updateProjectionMatrix() {} }, walk: { eyeHeight: 1.65, speed: 2.05 }, places: {}, goTo() {}, setMode() {}, uiState: () => ({ roof: true }), camera, controls: { target: new T.Vector3(), update() {} } };
SIM.start(church);
assert(SIM.ready, 'simulator started');
assert(SIM.state.items.length > 100, 'recommended design loaded: ' + SIM.state.items.length);
assert.equal(church.walk.speed, 1.4, 'realistic walking speed');
assert(church.walkCamera.fov < 60, 'natural lens instead of 68° vertical: ' + church.walkCamera.fov.toFixed(1));
// Door pairs follow the actual openings, with decoration only at the middle
// front door. The two tower layouts mirror exactly, including arm orientation.
{
  const lights = SIM.state.items, near = (a, b) => Math.abs(a - b) < 0.0001;
  const side = lights.filter(it => it.name.startsWith('Side door lantern ·'));
  assert.equal(side.length, 12, 'six exterior side doors have twelve lanterns');
  for (const s of [-1, 1]) for (const x of [16.725, 34.725, 46.425]) {
    const pair = side.filter(it => near(it.pos[2], s * 10.55) && Math.abs(it.pos[0] - x) < 1.5);
    assert.equal(pair.length, 2, 'two lanterns beside each exterior side door');
    assert(near((pair[0].pos[0] + pair[1].pos[0]) / 2, x), 'lantern pair centres on the door');
    assert(pair.every(it => near(it.pos[1], 2.6) && it.mountYaw === s * 90), 'equal height and outward orientation');
  }
  const front = lights.filter(it => it.name.startsWith('Central front door lantern ·'));
  assert.equal(front.length, 2, 'only one front-door decorative pair');
  assert(front.every(it => near(it.pos[0], 2.2) && near(Math.abs(it.pos[2]), 2.4) && it.circuit === 'L9'), 'central pair outside the front wall on DB2');
  assert(!lights.some(it => /^(Tower lantern|Sconce · main door) ·/.test(it.name)), 'old duplicate door decoration removed');
  assert.equal(lights.filter(it => it.name.startsWith('Service door lantern ·')).length, 4, 'two service doors have balanced pairs');
  const tower = lights.filter(it => it.type === 'corniceFlood');
  assert.equal(tower.length, 18, 'nine architecture washes per tower');
  for (const a of tower.filter(it => it.name.endsWith(' · B'))) {
    const b = tower.find(it => it.name === a.name.replace(/ · B$/, ' · H'));
    assert(b && near(a.pos[0], b.pos[0]) && near(a.pos[1], b.pos[1]) && near(a.pos[2], -b.pos[2]), 'mirrored tower mount: ' + a.name);
    assert(near(a.tilt, b.tilt) && near(Math.cos(a.yaw * Math.PI / 180), Math.cos(b.yaw * Math.PI / 180)) && near(Math.sin(a.yaw * Math.PI / 180), -Math.sin(b.yaw * Math.PI / 180)), 'mirrored tower beam');
  }
  const D = sandbox.CHURCH_SIM_DESIGN, unrelated = { id: 'custom-fan', name: 'User fan', type: 'fanWall', circuit: 'F2', pos: [20, 3, 7], speed: 1 };
  const old = [unrelated, { id: 'old-door', name: 'Side door lantern · B', type: 'wallLantern', circuit: 'L5', pos: [15.3, 2.25, -10.55], on: false, dim: 0.4 }];
  const revised = D.upgradeLighting(old, D.recommended(SIM.GEO, SIM), SIM.SCENES['All off']);
  assert.equal(revised.find(it => it.id === unrelated.id), unrelated, 'lighting migration preserves unrelated custom equipment');
  assert(revised.find(it => it.id === 'old-door')?.name.includes('16.725 · front'), 'migration retains existing door selection ID');
  assert(revised.filter(it => it.type === 'wallLantern' || it.type === 'corniceFlood').every(it => !it.on), 'migration honours the all-off scene');
  const twice = D.upgradeLighting(revised, D.recommended(SIM.GEO, SIM), SIM.SCENES['All off']);
  assert.equal(twice.length, revised.length, 'lighting migration does not duplicate reviewed fittings');
}
// --- Electrical network: connectivity, real picking and reversible isolation ---
{
  const E = SIM.electrical;
  assert(E.layer, 'electrical layer starts with the scene');
  const data = E.exportData(), runs = E.routes;
  assert.equal(new Set(runs.map(r => r.id)).size, runs.length, 'each run has a unique selection identity');
  assert.equal(runs.filter(r => r.role === 'feeder' && r.board === 'DB2').length, 1, 'one continuous DB2 feeder');
  const near = (a, b) => Math.hypot(...a.map((n, k) => n - b[k])) < 0.0001;
  const onPath = (p, path) => path.slice(1).some((b, i) => {
    const a = path[i], d = new T.Vector3(...b).sub(new T.Vector3(...a)), v = new T.Vector3(...p).sub(new T.Vector3(...a));
    const t = Math.max(0, Math.min(1, v.dot(d) / d.lengthSq()));
    return d.multiplyScalar(t).sub(v).length() < 0.0001;
  });
  for (const r of runs) {
    assert(r.points.every(p => p.length === 3 && p.every(Number.isFinite)), 'finite route ' + r.id);
    assert(r.length > 0, 'positive measured length ' + r.id);
    if (r.role === 'drop') {
      const it = SIM.item(r.itemIds[0]), trunk = runs.find(t => t.id === r.trunkId);
      assert(near(r.points.at(-1), it.pos), 'drop terminates at component ' + r.id);
      assert(trunk && onPath(r.points[0], trunk.points), 'drop connects to its trunk ' + r.id);
    } else assert(near(r.points[0], E.SOURCES[r.source].pos), 'trunk/feeder starts at source ' + r.id);
  }
  for (const c of data.components.filter(c => !c.hiddenAlternative)) {
    assert(runs.some(r => ['drop', 'local'].includes(r.role) && r.itemIds.includes(c.id)), 'every installed component is connected ' + c.id);
    assert(c.modelSize.length === 3 && c.modelSize.every(Number.isFinite), 'component has model dimensions ' + c.id);
    const t = CAT.byId[c.type], drops = runs.filter(r => ['drop', 'local'].includes(r.role) && r.itemIds.includes(c.id));
    if (t.speaker && !t.speaker.active || t.mic) assert(drops.every(r => r.source === 'AV1'), 'passive audio / mic never connected directly to DB mains');
  }
  const before = new Map(); church.scene.traverse(o => {
    for (let p = o; p; p = p.parent) if (p === E.layer || p.userData.simId) return;
    before.set(o, o.visible);
  });
  E.setMode('systems');
  assert(E.layer.visible, 'wires survive isolation');
  for (const fx of SIM.fixtures.values()) assert.equal(fx.root.visible, !fx.item.hidden && data.components.some(c => c.id === fx.item.id), 'isolation excludes hidden and non-electrical fixtures');
  const board = E.SOURCES.DB1;
  assert.equal(E.pick(new T.Ray(new T.Vector3(board.pos[0] + 1, board.pos[1], board.pos[2]), new T.Vector3(-1, 0, 0))).id, 'DB1', 'real 3D ray selects physical board');
  E.select('DB1'); assert.equal(E.view.selected, 'DB1', 'physical board can be selected');
  const drop = runs.find(r => r.role === 'drop'); E.select(drop.id);
  assert.equal(E.view.selected, drop.id, 'individual run can be selected');
  const fixture = SIM.item(drop.itemIds[0]), oldPosition = fixture.pos.slice();
  SIM.update(fixture.id, { pos: [oldPosition[0] + 0.1, oldPosition[1], oldPosition[2]] }, { record: false }); E.rebuild();
  assert(near(E.routes.find(r => r.id === drop.id).points.at(-1), fixture.pos), 'routes follow edited fixtures with stable IDs');
  SIM.update(fixture.id, { pos: oldPosition }, { record: false }); E.rebuild();
  E.setMode('building');
  for (const [o, v] of before) assert.equal(o.visible, v, 'building visibility restored: ' + o.name);
  assert([...SIM.fixtures.values()].filter(f => f.item.hidden).every(f => !f.root.visible), 'restoring building does not reveal hidden alternatives');
  E.select('AV1'); assert.equal(E.view.selected, 'AV1', 'audio rack selectable');
  const active = SIM.add({ type: 'steerableColumn', circuit: 'A1', pos: [25.725, 3.1, -7.07], mount: 'wall' }, { record: false }); E.rebuild();
  const feeds = E.routes.filter(r => r.role === 'drop' && r.itemIds.includes(active.id));
  assert.equal(feeds.length, 2, 'active speaker gets both signal and local power');
  assert(feeds.some(r => r.source === 'DB1') && feeds.some(r => r.source === 'AV1'), 'active power and signal originate separately');
  SIM.remove(active.id, { record: false }); E.rebuild();
  assert(!E.routes.some(r => r.itemIds.includes(active.id)), 'removing a component removes its run');
  if (process.argv.includes('--export-electrical')) {
    const dest = path.join(root, 'docs', 'systems');
    fs.writeFileSync(path.join(dest, 'electrical-systems.json'), JSON.stringify(E.exportData(), null, 2) + '\n');
    fs.writeFileSync(path.join(dest, 'electrical-schedule.csv'), '\ufeff' + E.csv() + '\n');
  }
  console.log(JSON.stringify({ electrical: 'passed', installedComponents: data.components.filter(c => !c.hiddenAlternative).length, selectableRuns: runs.length }));
  if (process.argv.includes('--electrical')) process.exit(0);
}
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
  for (const it of SIM.state.items.filter(i => i.type === 'corniceFlood')) {
    assert(hit([it.pos[0], it.pos[1] + 0.1, it.pos[2]], [0, -1, 0], 0.35), 'tower arm base rests on a cornice: ' + it.name);
    const fx = SIM.fixtures.get(it.id), head = fx.head.getWorldPosition(new T.Vector3());
    const a = it.mountYaw * Math.PI / 180, f = [Math.cos(a), 0, Math.sin(a)];
    assert(Math.abs(head.x - it.pos[0] - f[0] * 0.5) < 0.0001 && Math.abs(head.z - it.pos[2] - f[2] * 0.5) < 0.0001, 'tower head projects outward from the ledge: ' + it.name);
    const h = hit([head.x, head.y, head.z], [-f[0], 0, -f[2]], 0.9);
    assert(h && h.distance > 0.1, 'tower head clears the masonry: ' + it.name);
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
// Reduced graphics must never relocate lamps to synthetic midpoints (which
// previously made a beam appear to originate at a neighbouring speaker).
function verifyRenderOrigins() {
  const sources = SIM.emitters(), drawn = [];
  church.scene.traverse(o => { if (o.isLight && o.userData.emitter && o.intensity > 0) drawn.push(o); });
  assert(drawn.length, 'renderer draws real lamps');
  for (const light of drawn) {
    const e = light.userData.emitter;
    assert(SIM.item(e.id) && !CAT.byId[SIM.item(e.id).type].speaker, 'rendered light belongs to a lamp, never a speaker');
    const source = sources.find(s => s.id === e.id && Math.hypot(...s.pos.map((v, k) => v - e.pos[k])) < 0.0001);
    assert(source && Math.abs(source.cd - e.cd) < 0.0001, 'renderer preserves the real source position and intensity');
    assert(light.position.distanceTo(new T.Vector3(...source.pos)) < 0.0001, 'light is drawn at the fixture lens');
    if (source.dir) assert(new T.Vector3(...source.dir).distanceTo(light.target.position.clone().sub(light.position)) < 0.0001, 'renderer preserves the real beam direction');
  }
}
verifyRenderOrigins();
for (const s of [-1, 1]) {
  camera.position.set(16.725, 2.6, s * 15.5); camera.lookAt(16.725, 2.4, s * 10.55);
  SIM.setSetting('quality', 'balanced');
  SIM.setSetting('quality', 'fast');
  SIM.frame(0.05, 'walk', camera);
  verifyRenderOrigins();
  const drawnIds = new Set();
  church.scene.traverse(o => { if (o.isPointLight && o.userData.emitter && o.intensity > 0) drawnIds.add(o.userData.emitter.id); });
  const pair = SIM.state.items.filter(it => it.name.startsWith(`Side door lantern · ${s < 0 ? 'B' : 'H'} · 16.725`));
  assert(pair.every(it => drawnIds.has(it.id)), 'both lanterns of the visible doorway receive real light even at fast quality');
}
camera.position.set(20, 1.6, 0); camera.lookAt(20, 1.6, -1);
SIM.setSetting('quality', 'balanced');

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
  // Nave seats: the brief's main target. Wing benches (choir, ministers) sit
  // beside the sanctuary with their own pendant speakers; check them apart.
  const nave = s.seats.filter(x => x.block !== 'wing'), wingSeats = s.seats.filter(x => x.block === 'wing');
  const naveOk = 100 * nave.filter(x => x.sti >= 0.6).length / nave.length, naveMin = Math.min(...nave.map(x => x.sti));
  const wingAvg = wingSeats.reduce((t, x) => t + x.sti, 0) / wingSeats.length, wingMin = Math.min(...wingSeats.map(x => x.sti));
  console.log(JSON.stringify({ naveStiOk: Math.round(naveOk), naveStiMin: +naveMin.toFixed(3), wingStiAvg: +wingAvg.toFixed(3), wingStiMin: +wingMin.toFixed(3), wingLuxMin: Math.round(Math.min(...wingSeats.map(x => x.lux))) }));
  assert.equal(wingSeats.length, 80, 'wing benches are analysed');
  assert(Math.min(...wingSeats.map(x => x.lux)) >= 200, 'every wing seat has ≥ 200 lux');
  assert(naveMin >= 0.45 && naveOk >= 75, 'nave speech clarity: min ' + naveMin + ', ' + naveOk + ' % ≥ 0.60');
  assert(wingMin >= 0.45 && wingAvg >= 0.5, 'wing speech clarity: min ' + wingMin + ', avg ' + wingAvg);
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
