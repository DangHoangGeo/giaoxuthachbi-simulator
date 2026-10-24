/* Headless checks for the simulator layer: runs the actual bundled geometry,
   the as-drawn structure correction, every catalogue model, the recommended
   design and the analysis engine without a GPU or audio device.
   Usage: node scripts/verify_simulator.cjs [--report] [--estimates]
   --estimates verifies calculation invariants and records unmet design
   targets; the default mode also requires those design targets to pass.   */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const estimateAudit = process.argv.includes('--estimates');
const designTargets = [];
function target(met, name, detail) {
  designTargets.push({ name, met: !!met, detail });
  if (!estimateAudit) assert(met, `${name}: ${detail}`);
}
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
const storage = new Map(), storageWrites = { count: 0 };
const sandbox = {
  console, document, devicePixelRatio: 2, location: { search: '' }, URLSearchParams, Uint8ClampedArray, performance, setTimeout, clearTimeout,
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => { storageWrites.count++; storage.set(k, String(v)); } },
  MutationObserver: class { observe() {} }, requestAnimationFrame: () => 0
};
sandbox.window = sandbox;
sandbox.addEventListener = (e, f) => { (listeners[e] ||= []).push(f); };
vm.createContext(sandbox);
for (const file of ['texture-memory.js', 'render-batches.js', 'references.js', 'glass-art.js', 'carving.js', 'sanctuary.js', 'facade.js', 'porches.js', 'stations.js', 'towers.js', 'realism.js', 'planning.js', 'simulator/physics.js', 'simulator/catalog.js', 'simulator/engine.js', 'simulator/light-grid.js', 'simulator/persistent-lighting.js', 'simulator/design.js', 'simulator/analysis.js', 'simulator/electrical.js'])
  vm.runInContext(fs.readFileSync(path.join(viewer, file), 'utf8'), sandbox, { filename: file });

let src = fs.readFileSync(path.join(viewer, 'bundle.js'), 'utf8');
const begin = src.indexOf('    Us = document.getElementById("viewport"),');
const end = src.indexOf('  var ce = {};', begin);
assert(begin > 0 && end > begin);
src = src.slice(0, begin) + `    ni = {pixelRatio:1, setPixelRatio(r){this.pixelRatio=r}, capabilities:{getMaxAnisotropy:()=>8, maxFragmentUniforms:1024}, shadowMap:{enabled:true}, toneMappingExposure:1, domElement:{addEventListener(){}, getBoundingClientRect(){return {left:0,top:0,width:1280,height:800}}, height:800}};
  var ii = new Ti(), xn = new Cs(), Fp = new Cs(), X0 = new xr();
  ii.background = new De('#d9e4e9'); ii.add(xn,Fp,X0);
` + src.slice(end);
const ui = src.lastIndexOf('  z0({');
src = src.slice(0, ui) + `  window.model={THREE:Ec,building:nn,scene:ii,renderer:ni,hemisphere:X0,roofs:ei,mat:ce,data:ti,batches:t_,interior:Qo};\n})();`;
const t0 = Date.now();
vm.runInContext(src, sandbox, { timeout: 120000, filename: 'bundle.js' });
const { THREE: T, building, data, interior, batches } = sandbox.window.model;
const SIM = sandbox.CHURCH_SIMULATOR;
const CAT = sandbox.CHURCH_SIM_CATALOG;
const P = sandbox.CHURCH_SIM_PHYSICS;

// --- As-drawn frame -------------------------------------------------------
const nodes = []; building.traverse(o => nodes.push(o));
const ties = nodes.filter(o => o.name === 'Main tie beam 0.30 × 0.59 m · as drawn');
assert.equal(ties.length, 7, 'seven main tie beams (axes 3–9); axis 10 carries the lobed sanctuary frame');
for (const t of ties) { const b = new T.Box3().setFromObject(t); assert(Math.abs(b.min.y - 8.59) < 0.002 && Math.abs(b.max.y - 9.18) < 0.002, 'tie beam levels'); }
const sideBeams = nodes.filter(o => o.name === 'Side beam 0.22 × 0.34 m · as drawn');
assert.equal(sideBeams.length, 14, 'side beams on axes 3–9, both sides');
assert(nodes.filter(o => o.name === 'Purlin · as drawn spacing ~0.50 m').length >= 28, 'drawn purlins');
// The beams carry the lacquer of the columns, with gilded borders, rosettes and bands.
{
  const named = name => nodes.filter(o => o.isMesh && o.name === name), timber = interior.materials.timber;
  assert.equal(timber.color.getHexString(), '853125', 'structural timber is lacquered by default');
  for (const o of [...ties, ...sideBeams, ...named('Purlin · as drawn spacing ~0.50 m')]) assert.equal(o.material, timber, o.name + ' uses the structural timber finish');
  const tieGilding = [...named('Main tie beam gilded border'), ...named('Main tie beam gilded rosette'), ...named('Main tie beam gilded band')];
  assert.equal(named('Main tie beam gilded border').length, 28, 'two border lines on both faces of each tie beam');
  assert.equal(named('Main tie beam gilded rosette').length, 14, 'a rosette on both faces of each tie beam');
  assert.equal(named('Main tie beam gilded band').length, 14, 'a band near each shaft');
  assert.equal(named('Side beam gilded band').length, 28, 'a band at each end of every side beam');
  assert.equal(named('Side beam gilded border').length, 56, 'border lines on both faces of every side beam');
  for (const o of [...tieGilding, ...named('Side beam gilded band'), ...named('Side beam gilded border')]) assert.equal(o.material.name, 'Sanctuary · carved gilding', o.name + ' is gilded');
  for (const o of tieGilding) {
    const b = new T.Box3().setFromObject(o), tie = ties.find(t => Math.abs(t.position.x - (b.min.x + b.max.x) / 2) < 0.2);
    // The carved cartouche (still named rosette) stands a few centimetres proud of the beam face.
    assert(tie && new T.Box3().setFromObject(tie).expandByScalar(o.name.endsWith('rosette') ? 0.07 : 0.03).containsBox(b), o.name + ' sits on its tie beam');
    assert.equal(o.parent, tie.parent, 'tie-beam gilding shows and hides with the drawn frame');
  }
  // Lengthwise beams on the D/E column lines (beam specification B03): 14 proxy members with their
  // top flush with the ties, each between two successive column axes, with member and connection
  // IDs. None in bay 2′–3, none beyond the sanctuary frame.
  const long = named('Longitudinal column-line beam 0.24 × 0.45 m · concept proxy'), ids = new Set(), axes = data.longitudinal;
  assert.equal(long.length, 14, 'a lengthwise beam in each bay 3–10 on both column lines');
  for (const o of long) {
    const b = new T.Box3().setFromObject(o), u = o.userData, [x0, x1] = u.supports.map(k => axes[k.split('/')[0]]);
    assert(Math.abs(b.min.y - 8.73) < 0.002 && Math.abs(b.max.y - 9.18) < 0.002, 'lengthwise beam levels');
    assert(Math.abs(Math.abs((b.min.z + b.max.z) / 2) - 3.6) < 0.002 && Math.abs(b.max.z - b.min.z - 0.24) < 0.002, 'lengthwise beam on the column line');
    assert(/^B03-[DE]-\d\d-\d\d$/.test(u.memberId) && !ids.has(u.memberId), 'member ID by family, line and bay: ' + u.memberId);
    ids.add(u.memberId);
    assert(x1 - x0 >= 4.5 - 0.001 && b.min.x >= x0 + 0.29 && b.max.x <= x1 - 0.27 && b.min.x < x0 + 0.31 && b.max.x > x1 - 0.31, u.memberId + ' runs from column to column');
    assert(b.min.x > axes['3'] && b.max.x < axes['10'], u.memberId + ' stays between axis 3 and the sanctuary frame');
    assert(u.engineeringApproved === false && u.sectionStatus === 'ENGINEERING HOLD' && u.connectionIds.length === 2 && u.connectionIds.every(c => /^J04-[DE]-\d\d$/.test(c)), u.memberId + ' keeps its engineering hold and connection IDs');
    assert.equal(o.material, timber, 'lengthwise beam uses the structural timber finish');
    assert.equal(o.parent, ties[0].parent, 'lengthwise beam shows and hides with the drawn frame');
  }
  assert.equal(SIM.GEO.longBeams.length, 14);
  // A proxy member is not a mounting support: only the drawn beams and the roof are.
  assert.equal(SIM.structureAbove((axes['5'] + axes['6']) / 2, 3.6, 2).kind, 'roof', 'nothing is mounted on a proxy beam');
  // Carved ornament of the approved concept: haunches under the beams, cartouches on their faces, carved tie ends.
  const top = o => new T.Box3().setFromObject(o).max.y, centreX = o => new T.Box3().setFromObject(o).getCenter(new T.Vector3()).x;
  for (const [name, count, soffit] of [['Main tie beam carved haunch', 12, 8.59], ['Longitudinal column-line beam carved haunch', 28, 8.73], ['Side beam carved haunch', 14, 6.66], ['Side beam carved pier bracket', 14, 6.66]]) {
    const list = named(name);
    assert.equal(list.length, count, name);
    for (const o of list) { assert(Math.abs(top(o) - soffit) < 0.002, name + ' springs from the beam soffit'); assert.equal(o.material, timber, name + ' is solid beam timber'); assert.equal(o.userData.engineeringApproved, false); }
    assert.equal(named(name + ' · foliage').length, count); assert.equal(named(name + ' · gilding').length, count);
    for (const o of named(name + ' · foliage')) assert.equal(o.material.name, 'Sanctuary · carved lacquered timber');
  }
  // No haunch under the axis-9 tie beam, where the ambo key light and the presider light hang.
  assert(named('Main tie beam carved haunch').every(o => Math.abs(centreX(o) - axes['9']) > 1), 'axis 9 keeps its tie beam soffit clear');
  for (const [name, count] of [['Main tie beam carved end', 14], ['Side beam gilded cartouche', 28], ['Longitudinal column-line beam gilded cartouche', 28], ['Longitudinal column-line beam gilded border', 56]]) assert.equal(named(name).length, count, name);
  for (const o of nodes.filter(o => o.isMesh && /^(Main tie beam|Longitudinal column-line beam)/.test(o.name))) assert.equal(o.parent, ties[0].parent, o.name + ' belongs to the drawn frame');
  let triangles = 0;
  for (const o of nodes) if (o.isMesh && /^(Main tie beam|Side beam|Longitudinal column-line beam) (carved|gilded (rosette|cartouche))/.test(o.name)) triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
  assert(triangles < 260000, 'beam ornament triangle budget: ' + triangles);
}
const truss = [...batches.keys()].find(g => g.userData.proposedTruss);
assert(truss, 'proposed truss layer is a separate batch');
const moved = []; truss.traverse(o => { if (o.isMesh) moved.push(o.name); });
for (const n of ['Proposed truss king post', 'Proposed roof truss diagonal', 'Schematic transverse tie']) assert(moved.includes(n), 'moved ' + n);
assert.equal(batches.get(truss).visible, false, 'proposed bracing hidden by default');
assert(!nodes.some(o => o.name.startsWith('Proposed nave chandelier')), 'legacy chandeliers detached from batches');
assert.equal(interior.lights.length, 0, 'legacy interior lights replaced');

// --- Start with a stub viewer API ------------------------------------------
const camera = new T.PerspectiveCamera(50, 1.6, 0.05, 500); camera.position.set(20, 1.6, 0);
const church = { scene: sandbox.window.model.scene, renderer: sandbox.window.model.renderer, colliders: [], walkCamera: { aspect: 1.6, fov: 68, updateProjectionMatrix() {} }, walk: { eyeHeight: 1.65, speed: 2.05 }, places: {}, goTo() {}, setMode() {}, uiState: () => ({ roof: true }), camera, controls: { target: new T.Vector3(), update() {} } };
SIM.start(church);
assert(SIM.ready, 'simulator started');
assert(SIM.state.items.length > 100, 'recommended design loaded: ' + SIM.state.items.length);
// Carved ornament keeps clear of every fitting of the recommended design: no vertex of a capital,
// haunch, cartouche or beam end lies inside a part of a lamp, fan, loudspeaker or banner. One contact
// is known and recorded as a lighting coordination item: the ambo key light hangs 0.45 m from the
// axis-9/D column axis and its canopy meets the abacus, as it met the plain capital before.
{
  const known = new Set(['Ambo key light|Column carving · capital bell']), contacts = new Map(), v = new T.Vector3();
  const carved = nodes.filter(o => o.isMesh && /^(Column carving|Gilded column capital|Main tie beam|Side beam|Longitudinal column-line beam)/.test(o.name) && !/as drawn$|concept proxy$/.test(o.name));
  building.updateMatrixWorld(true);
  const boxes = carved.map(o => new T.Box3().setFromObject(o));
  for (const fx of SIM.fixtures.values()) {
    // Lamps, fans, loudspeakers and microphones, and the banners on the columns. Plants, flowers
    // and furniture are not fittings.
    if (fx.type.cat === 'decor' && fx.item.type !== 'banner') continue;
    fx.root.updateWorldMatrix(true, true);
    // Part by part: one box round a fan and its long downrod would take in half the bay.
    const parts = [];
    fx.root.traverse(m => { if (m.isMesh && m.geometry?.attributes?.position) { const box = new T.Box3().setFromObject(m); if (!box.isEmpty()) parts.push(box); } });
    carved.forEach((o, i) => {
      const near = parts.filter(box => boxes[i].intersectsBox(box));
      if (!near.length) return;
      const p = o.geometry.attributes.position;
      for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).applyMatrix4(o.matrixWorld); if (near.some(box => box.containsPoint(v))) { contacts.set(`${fx.item.name}|${o.name}`, 1); break; } }
    });
  }
  const unexpected = [...contacts.keys()].filter(k => !known.has(k));
  assert.deepEqual(unexpected, [], 'carved ornament inside a fitting envelope: ' + unexpected.join('; '));
}
assert.equal(church.walk.speed, 1.4, 'realistic walking speed');
assert(church.walkCamera.fov < 60, 'natural lens instead of 68° vertical: ' + church.walkCamera.fov.toFixed(1));
// Door pairs follow the actual openings, with decoration only at the middle
// front door. The two tower layouts mirror exactly, including arm orientation.
{
  const lights = SIM.state.items, near = (a, b) => Math.abs(a - b) < 0.0001;
  const side = lights.filter(it => it.name.startsWith('Side door lantern ·'));
  // Since 25 Oct 2026 the porches are open arcades and bay 10–11 has a window (porches.js):
  // the four side doors keep their pairs on the porch face of the inner C/G wall.
  assert.equal(side.length, 8, 'four side doors have eight lanterns');
  for (const s of [-1, 1]) for (const x of [16.725, 34.725]) {
    const pair = side.filter(it => near(it.pos[2], s * 7.52) && Math.abs(it.pos[0] - x) < 1.5);
    assert.equal(pair.length, 2, 'two lanterns beside each side door');
    assert(near((pair[0].pos[0] + pair[1].pos[0]) / 2, x), 'lantern pair centres on the door');
    assert(pair.every(it => near(it.pos[1], 2.6) && it.mountYaw === s * 90), 'equal height, facing the porch');
  }
  assert(!side.some(it => Math.abs(it.pos[0] - 46.425) < 1.5), 'no lanterns at the bay 10–11 window');
  const front = lights.filter(it => it.name.startsWith('Central front door lantern ·'));
  assert.equal(front.length, 2, 'only one front-door decorative pair');
  assert(front.every(it => near(it.pos[0], 2.2) && near(Math.abs(it.pos[2]), 2.4) && it.circuit === 'L9'), 'central pair outside the front wall on DB2');
  assert(!lights.some(it => /^(Tower lantern|Sconce · main door) ·/.test(it.name)), 'old duplicate door decoration removed');
  assert.equal(lights.filter(it => it.name.startsWith('Service door lantern ·')).length, 4, 'two service doors have balanced pairs');
  // Tower washes (owner, 19 October 2026): cornice-coloured fittings on the ledges, no black arm floods.
  const tower = lights.filter(it => /^(Tower (lower (front|side) wash|stage [23] (flood|side wash))|Belfry (front|side) wash|Dome front wash) ·/.test(it.name));
  assert.equal(tower.length, 18, 'nine architecture washes per tower');
  assert(tower.every(it => it.type === 'ledgeBar' || it.type === 'ledgeFlood') && !lights.some(it => it.type === 'corniceFlood'), 'tower washes are ledge fittings, no projecting-arm floods remain');
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
  const oldFacade = { ...lights.find(it => it.name === 'Central gable flood · B'), id: 'existing-gable', on: false, dim: 0.4, beam: 26 };
  const facade = D.upgradeFacade([unrelated, oldFacade], D.recommended(SIM.GEO, SIM), SIM.SCENES['All off']);
  assert.equal(facade.find(it => it.id === unrelated.id), unrelated, 'facade migration preserves unrelated equipment and edits');
  const migrated = facade.find(it => it.id === oldFacade.id);
  assert(migrated && migrated.beam === 60 && !migrated.on && migrated.dim === 0.4, 'facade migration retains selection ID, switch and dimmer');
  assert.equal(facade.filter(it => it.name.startsWith('Central crown wash ·')).length, 2, 'paired upper fills added once');
  assert(facade.filter(it => it !== unrelated).every(it => !it.on), 'facade migration honours the all-off scene');
  assert.equal(D.upgradeFacade(facade, D.recommended(SIM.GEO, SIM), SIM.SCENES['All off']).length, facade.length, 'facade migration has no duplicates');
  // Sanctuary revision: a layout saved before the frame moved to the column line.
  const design = D.recommended(SIM.GEO, SIM), spec = sandbox.CHURCH_SANCTUARY.spec;
  const saved = [unrelated,
    { id: 'mary', name: 'Statue · Our Lady', type: 'statueMary', circuit: 'DECOR', mount: 'floor', pos: [49.7, 0.83, -5.55], yaw: 180, mountYaw: 180 },
    { id: 'accent', name: 'Crucifix accent · B', type: 'spot15', circuit: 'L3', mount: 'wall', pos: [44.505, 6.6, -3.6], yaw: 40, tilt: -20, mountYaw: 0, beam: 15, lumens: 1200, on: false, dim: 0.5 },
    { id: 'stand', name: 'Flower stand · statue H', type: 'flowerStand', circuit: 'DECOR', mount: 'floor', pos: [49.45, 0.15, 6.6], yaw: 180, mountYaw: 180 },
    { id: 'tie-uplight', name: 'Roof uplight · axis 10', type: 'uplight', circuit: 'LA', mount: 'floor', pos: [44.175, 9.18, 0], yaw: 90, mountYaw: 90, tilt: 90 },
    { id: 'votive', name: 'Votive candles · B', type: 'candleStand', circuit: 'DECOR', mount: 'floor', pos: [48.1, 0.15, -6.2], yaw: 180, mountYaw: 180 },
    { id: 'ambo-mic', name: 'Ambo microphone', type: 'mic', circuit: 'MIC', mount: 'floor', pos: [42.36, 1.9, -2.62], yaw: 0, mountYaw: 0 }];
  const sanctuary = D.upgradeSanctuary(saved, design);
  assert.equal(sanctuary.find(it => it.id === unrelated.id), unrelated, 'sanctuary migration preserves unrelated equipment');
  const mary = sanctuary.find(it => it.id === 'mary'), accent = sanctuary.find(it => it.id === 'accent'), stand = sanctuary.find(it => it.id === 'stand');
  assert(near(mary.pos[0], spec.wingX - 0.1) && near(mary.pos[1], spec.nicheBase) && near(mary.pos[2], -spec.wingZ), 'statue moves to the shrine on the column line');
  assert(accent.pos[0] > spec.chamber.x0 && Math.abs(accent.pos[2]) < spec.chamber.face && accent.lumens === 700 && accent.beam === 24 && accent.on === false && accent.dim === 0.5, 'crucifix accent moves inside the chamber, takes the reviewed output and keeps its switch and dimmer');
  assert(stand.name === 'Flower stand · tabernacle H' && near(stand.pos[0], 47.2), 'flower stand moves to the tabernacle under its new name');
  assert(!sanctuary.some(it => it.id === 'tie-uplight'), 'axis-10 uplight goes with its tie beam');
  assert(!sanctuary.some(it => it.id === 'votive') && !design.some(it => it.type === 'candleStand'), 'votive candle stands are removed from the way to the shrines');
  assert(near(sanctuary.find(it => it.id === 'ambo-mic').pos[0], 41.08), 'ambo microphone follows the ambo forward');
  assert(near(accent.pos[1], 7.6) && Math.abs(Math.tan(accent.yaw * Math.PI / 180) - (0 - accent.pos[2]) / (spec.niche.backX - 0.5 - accent.pos[0])) < 0.001, 'crucifix accent aims at the corpus inside the niche');
  for (const name of ['Reredos wash · B', 'Reredos base wash · H', 'Sanctuary vault uplight · B', 'Sanctuary frame wash · H', 'Shrine wash · B', 'Presider chair light', 'Palm · sanctuary H', 'Shrine flowers · B · inner'])
    assert.equal(sanctuary.filter(it => it.name === name).length, 1, 'new sanctuary fitting added once: ' + name);
  assert(!sanctuary.some(it => it.name === 'Statue · Saint Joseph'), 'a statue deleted from the saved layout stays deleted');
  assert.equal(D.upgradeSanctuary(sanctuary, design).length, sanctuary.length, 'sanctuary migration has no duplicates');
  // Night retune: a layout already at revision 6 keeps every position. Only the output of the
  // sanctuary fittings changes, and the reredos washes still in place are re-aimed.
  const pick = name => design.find(it => it.name === name), washB = pick('Reredos wash · B');
  const at6 = [unrelated,
    { ...pick('Crucifix accent · H'), id: 'acc-h', lumens: 2000, on: false, dim: 0.5 },
    { ...pick('Altar key light · B'), id: 'key-b', lumens: 5500, pos: [36.975, 8.585, -1.1] },
    { ...washB, id: 'wash-b', beam: 50, lumens: 2200, yaw: 10, tilt: -20 },
    { ...pick('Reredos wash · H'), id: 'wash-h', beam: 50, lumens: 2200, yaw: -10, tilt: -20, pos: [45.5, 6.7, 3.24] },
    { ...pick('Statue · Our Lady'), id: 'mary-moved', pos: [44.0, 2.85, -5.2] }];
  {
    const retuned = D.upgradeSanctuary(at6, design, '2026-10-07-sanctuary-6'), r = id => retuned.find(it => it.id === id);
    assert.equal(retuned.length, at6.length, 'the night retune adds and removes nothing');
    assert(retuned[0] === unrelated && r('mary-moved') === at6[5], 'the night retune leaves other equipment and a moved statue untouched');
    assert(r('acc-h').lumens === 700 && r('acc-h').on === false && r('acc-h').dim === 0.5, 'crucifix accent output lowered; switch and dimmer kept');
    assert(r('key-b').lumens === 4500 && near(r('key-b').pos[2], -1.1), 'a moved altar key keeps its place');
    assert(r('wash-b').beam === 36 && r('wash-b').lumens === 650 && near(r('wash-b').yaw, washB.yaw) && near(r('wash-b').tilt, washB.tilt), 'a reredos wash in place takes the tighter beam and its new aim');
    assert(r('wash-h').lumens === 650 && r('wash-h').yaw === -10 && near(r('wash-h').pos[0], 45.5), 'a moved reredos wash keeps its place and aim');
  }
  // The revision travels with the saved settings. (It was not stored before, so the review was
  // re-applied at every load and reset any sanctuary fitting moved by hand.)
  const layout = JSON.parse(JSON.stringify(SIM.exportLayout()));
  assert.equal(layout.settings.sanctuaryRevision, D.sanctuaryRevision, 'sanctuary revision is saved with the layout');
  SIM.importLayout({ ...layout, settings: { ...layout.settings, sanctuaryRevision: '2026-10-07-sanctuary-6' } }, { record: false });
  assert.equal(SIM.state.settings.sanctuaryRevision, '2026-10-07-sanctuary-6', 'sanctuary revision is read back from a saved layout');
  SIM.importLayout(layout, { record: false });
  assert.equal(SIM.state.settings.sanctuaryRevision, D.sanctuaryRevision);
  // Night balance of the sanctuary centre (direct, maintained; "Full service · evening").
  // Evening picture exposure: 160 lux by default since 9 October 2026 (the nave is lit to about 310 lux
  // on the book, and at 110 the whole view burned out). Display only. The limits below were set for
  // the earlier 110 lux and are kept as they are, so the lamps themselves are not allowed to rise.
  assert.equal(SIM.state.settings.adaptLux, 160, 'default evening exposure');
  assert.equal(SIM.state.settings.eveningExposureRevision, '2026-10-09-evening-160', 'evening exposure revision is kept in the saved settings');
  // At 110 lux a surface near twice that level still shows
  // its colour, while the 560 lux that stood on the blue recess before washed it out.
  const em = SIM.emitters(), occ = SIM.GEO.occluders, mf = SIM.state.settings.maintenance;
  const lux = (p, n) => P.illuminance(p, n, em, occ) * mf, back = [-1, 0, 0];
  const Eind = P.indirectIlluminance(em.reduce((sum, e) => sum + (e.interior ? e.lumens : 0), 0), SIM.room().light) * mf;
  const chest = lux([48.45, 5.3, 0], back), blue = lux([48.98, 4.2, 0.6], back), blueSide = lux([48.98, 3.6, 1.3], back);
  const gilding = lux([47.6, 4.6, 2.4], back), mensa = lux([44.24, 1.89, 0], [0, 1, 0]), statue = lux([spec.wingX - 0.225, 4.25, spec.wingZ], back), tabernacle = lux([47.2, 2.05, 0], back);
  assert(blue + Eind < 2.2 * 110 && blueSide < blue, `blue recess stays within about twice the exposure level, darker towards its edges: ${blue.toFixed(0)} / ${blueSide.toFixed(0)} + ${Eind.toFixed(0)} lux`);
  assert(chest > 1.3 * blue && chest > 200 && chest < 320, `corpus stands out from the recess without glare: ${chest.toFixed(0)} lux`);
  assert(gilding > 120 && gilding < 220, `reredos lacquer and gilding at a level that keeps the red: ${gilding.toFixed(0)} lux`);
  assert(mensa >= 300 && mensa > chest && tabernacle > mensa, `altar and tabernacle remain the brightest: ${mensa.toFixed(0)} / ${tabernacle.toFixed(0)} lux`);
  assert(statue < chest && statue > 120, `statues below the crucifix: ${statue.toFixed(0)} lux`);
}
// Structural timber tone: lacquer by default, natural tones bring the grain back; the
// entrance-hall acoustic slats stay natural timber.
{
  const timber = interior.materials.timber;
  let slats = null; church.scene.traverse(o => { if (o.name === 'Entrance hall acoustic slats (option)') slats = o; });
  assert(slats && slats.material !== timber && slats.material.color.getHexString() === 'ab8d6f' && slats.material.map, 'entrance slats keep natural timber');
  SIM.setSetting('timberTone', 'natural');
  assert(timber.color.getHexString() === 'ab8d6f' && timber.map && timber.roughness === 0.5, 'natural tone restores the grain');
  SIM.setSetting('timberTone', 'dark');
  assert(timber.color.getHexString() === '7c5839' && slats.material.color.getHexString() === '7c5839', 'dark tone applies to beams and slats');
  SIM.setSetting('timberTone', 'reference');
  assert(timber.color.getHexString() === '853125' && timber.map === null && slats.material.color.getHexString() === 'ab8d6f', 'reference tone is the red lacquer');
}
// Day/evening: the viewer redraws in the task that switches the mode, before any observer runs.
// That frame must already use the new mode, or the evening sky levels overwrite the day ones.
{
  const hemisphere = sandbox.window.model.hemisphere;
  assert.equal(SIM.ambient().env, 'evening');
  body.dataset.lighting = 'day'; hemisphere.intensity = 1.15;
  SIM.frame(0, 'walk', camera);
  assert(SIM.ambient().env === 'day' && hemisphere.intensity === 1.15, 'the first day frame keeps the day sky level');
  body.dataset.lighting = 'evening';
  SIM.frame(0, 'walk', camera);
  assert(SIM.ambient().env === 'evening' && hemisphere.intensity < 0.2, 'the first evening frame applies the evening level');
}
// --- Electrical network: connectivity, real picking and reversible isolation ---
{
  const E = SIM.electrical;
  assert(E.layer, 'electrical layer starts with the scene');
  require('./verify_concealed_routes.cjs')({ SIM, T, CAT, building });
  const data = E.exportData(), runs = E.routes;
  assert.equal(new Set(runs.map(r => r.id)).size, runs.length, 'each run has a unique selection identity');
  assert.equal(runs.filter(r => r.role === 'feeder' && r.board === 'DB2' && r.source === 'DB1').length, 1, 'one continuous DB2 feeder');
  // Parish priest, 25 Oct 2026: DB-2 and the event board EB-1 stand in the H-side tower room;
  // EB-1 is fed from DB-2 and carries the event points and the festival exterior lights.
  const eb = runs.find(r => r.id === 'feeder:EB1');
  assert(eb && eb.source === 'DB2' && eb.length < 3, 'EB-1 is fed from DB-2 beside it');
  for (const id of ['DB2', 'EB1']) { const p = E.SOURCES[id].pos; assert(p[0] > 0.14 && p[0] < 0.5 && p[2] > 7.84 && p[2] < 12.46 && p[1] > 1 && p[1] < 2, id + ' inside the H-side tower room'); }
  assert(runs.filter(r => ['P3', 'P4', 'L7'].includes(r.circuit) && r.role !== 'feeder').every(r => r.source === 'EB1'), 'event power and festival lights run from EB-1');
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
      assert(near(r.points.at(-1), r.termination?.position || it.pos), 'drop terminates at component cable entry ' + r.id);
      assert(trunk && onPath(r.points[0], trunk.points), 'drop connects to its trunk ' + r.id);
    } else assert(near(r.points[0], E.SOURCES[r.source].pos), 'trunk/feeder starts at source ' + r.id);
  }
  for (const c of data.components.filter(c => !c.hiddenAlternative)) {
    assert(runs.some(r => ['drop', 'local'].includes(r.role) && r.itemIds.includes(c.id)), 'every installed component is connected ' + c.id);
    assert(c.modelSize.length === 3 && c.modelSize.every(Number.isFinite), 'component has model dimensions ' + c.id);
    const t = CAT.byId[c.type], drops = runs.filter(r => ['drop', 'local'].includes(r.role) && r.itemIds.includes(c.id));
    if (t.speaker && !t.speaker.active || t.mic) assert(drops.every(r => r.source === 'AV1'), 'passive audio / mic never connected directly to DB mains');
    if (t.light?.wattsPerBulb) {
      const item = SIM.item(c.id), bulbs = Math.max(2, Math.round(item.params.length / item.params.spacing)) + 1;
      assert.equal(c.wattsEstimate, bulbs * t.light.wattsPerBulb, 'board schedule uses the actual string bulb rating');
      assert(c.specs.includes(`${bulbs} bulbs`) && c.specs.includes('lumen data needed'), 'board string specs identify bulb count and missing photometry');
    }
  }
  const before = new Map(); church.scene.traverse(o => {
    for (let p = o; p; p = p.parent) if (p === E.layer || p.userData.simId) return;
    before.set(o, o.visible);
  });
  church.renderer.shadowMap.needsUpdate = false;
  E.setMode('systems');
  assert(church.renderer.shadowMap.needsUpdate, 'systems isolation invalidates cached building shadows');
  assert(E.layer.visible, 'wires survive isolation');
  for (const fx of SIM.fixtures.values()) assert.equal(fx.root.visible, !fx.item.hidden && data.components.some(c => c.id === fx.item.id), 'isolation excludes hidden and non-electrical fixtures');
  const board = E.SOURCES.DB1;
  assert.equal(E.pick(new T.Ray(new T.Vector3(board.pos[0] + 1, board.pos[1], board.pos[2]), new T.Vector3(-1, 0, 0))).id, 'DB1', 'real 3D ray selects physical board');
  E.select('DB1'); assert.equal(E.view.selected, 'DB1', 'physical board can be selected');
  const drop = runs.find(r => r.role === 'drop'); E.select(drop.id);
  assert.equal(E.view.selected, drop.id, 'individual run can be selected');
  const fixture = SIM.item(drop.itemIds[0]), oldPosition = fixture.pos.slice(), oldAnchor = fixture.anchorY;
  SIM.update(fixture.id, { pos: [oldPosition[0] + 0.1, oldPosition[1], oldPosition[2]] }, { record: false }); E.rebuild();
  assert(near(E.routes.find(r => r.id === drop.id).points.at(-1), fixture.pos), 'routes follow edited fixtures with stable IDs');
  SIM.update(fixture.id, { pos: oldPosition, anchorY: oldAnchor }, { record: false }); E.rebuild();
  church.renderer.shadowMap.needsUpdate = false;
  E.setMode('building');
  assert(church.renderer.shadowMap.needsUpdate, 'restoring the building invalidates cached shadows');
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
    const dest = path.join(root, 'docs', 'electrical-grid');
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, 'electrical-systems.json'), JSON.stringify(E.exportData(), null, 2) + '\n');
    fs.writeFileSync(path.join(dest, 'electrical-schedule.csv'), '\ufeff' + E.csv() + '\n');
    fs.writeFileSync(path.join(dest, 'equipment-layout.json'), JSON.stringify(SIM.exportLayout(), null, 2) + '\n');
  }
  console.log(JSON.stringify({ electrical: 'passed', installedComponents: data.components.filter(c => !c.hiddenAlternative).length, selectableRuns: runs.length }));
  if (process.argv.includes('--electrical')) process.exit(0);
}
for (const t of CAT.types) {
  const it = SIM.add({ type: t.id, pos: [20, 1, 0], mount: t.mounts[0], anchorY: 8.59 }, { record: false });
  assert(it, 'catalogue item builds: ' + t.id);
  SIM.remove(it.id, { record: false });
}
// Repeated edits must release owned resources and leave active/shared geometry intact.
{
  const baseline = JSON.stringify(SIM.state.items), history = SIM.state.history.length;
  const ids = SIM.state.items.filter(it => it.circuit === 'L1' && !it.hidden).slice(0, 3).map(it => it.id);
  let events = 0;
  const stopEvents = SIM.on('items', () => events++);
  SIM.update(ids[0], { dim: .73 }, { record: false });
  assert.equal(events, 1, 'one item edit emits one notification');
  events = 0;
  SIM.batch(() => {
    SIM.update(ids[0], { dim: .77 }, { record: false });
    SIM.batch(() => { for (const id of ids.slice(1)) SIM.update(id, { dim: .77 }, { record: false }); });
    assert.equal(events, 0, 'batch consumers cannot see a half-updated circuit');
    SIM.commit('Performance transaction test');
  });
  assert.equal(events, 1, 'nested batch emits one complete state');
  assert.equal(SIM.state.history.length, history + 1, 'one circuit action keeps one history entry');
  events = 0; SIM.undo();
  assert.equal(events, 1, 'undo restores a layout in one notification');
  assert.deepEqual(JSON.parse(JSON.stringify(SIM.state.items)), JSON.parse(baseline), 'undo preserves every prior item field');
  SIM.redo(); assert(ids.every(id => SIM.item(id).dim === .77), 'redo reapplies the whole circuit');
  SIM.undo();
  events = 0;
  assert.throws(() => SIM.batch(() => { SIM.update(ids[0], { dim: .5 }, { record: false }); throw Error('interrupted transaction'); }), /interrupted/);
  assert.equal(events, 1, 'an interrupted batch flushes its actual state');
  SIM.update(ids[0], JSON.parse(baseline).find(it => it.id === ids[0]), { record: false });
  stopEvents();

  const original = SIM.fixtures.get(ids[0]);
  let glowsDisposed = 0;
  original.glowMat.addEventListener('dispose', () => glowsDisposed++);
  SIM.update(ids[0], {}, { record: false, rebuild: true });
  assert.equal(glowsDisposed, 1, 'rebuilding a fixture disposes its old glow material');
  SIM.select(ids[0]);
  const helper = church.scene.getObjectByName('Simulator selection');
  let helperMaterials = 0; helper.material.addEventListener('dispose', () => helperMaterials++);
  SIM.select(null); assert.equal(helperMaterials, 1, 'deselecting releases the helper material');

  const a = SIM.add({ type: 'carpet', pos: [20, 0, 0], params: { length: 6 } }, { record: false });
  const b = SIM.add({ type: 'carpet', pos: [24, 0, 0], params: { length: 6 } }, { record: false });
  const shared = SIM.fixtures.get(a.id).proto;
  assert.equal(SIM.fixtures.get(b.id).proto, shared, 'matching fixtures share prototype buffers');
  let liveDisposals = 0, retiredDisposals = 0;
  for (const group of Object.values(shared.groups)) for (const part of group) part.geo.addEventListener('dispose', () => liveDisposals++);
  SIM.beginPlacement('carpet', { params: { length: 5.01 } });
  let previewDisposals = 0;
  church.scene.getObjectByName('Simulator placement preview').traverse(o => o.geometry?.addEventListener('dispose', () => previewDisposals++));
  SIM.update(b.id, { params: { length: 6.01 } }, { record: false });
  for (const group of Object.values(SIM.fixtures.get(b.id).proto.groups)) for (const part of group) part.geo.addEventListener('dispose', () => retiredDisposals++);
  for (let i = 0; i < 100; i++) SIM.update(b.id, { params: { length: 7 + i * .1 } }, { record: false });
  assert.equal(liveDisposals, 0, 'cache eviction never disposes a live prototype');
  assert.equal(previewDisposals, 0, 'cache eviction protects an active placement preview');
  SIM.cancelPlacement();
  assert(retiredDisposals > 0, 'old unused variants release their geometry');
  assert(SIM.resourceStats().unusedPrototypes <= SIM.resourceStats().unusedPrototypeLimit, 'unused fixture prototypes are bounded');
  SIM.update(b.id, { params: { length: 6 } }, { record: false });
  assert.equal(SIM.fixtures.get(b.id).proto, shared, 'a shared active prototype remains reusable');
  SIM.remove(a.id, { record: false }); SIM.remove(b.id, { record: false });
  for (let i = 0; i < 70; i++) SIM.beginPlacement('carpet', { params: { length: 20 + i * .1 } });
  SIM.cancelPlacement();
  assert(SIM.resourceStats().unusedPrototypes <= SIM.resourceStats().unusedPrototypeLimit, 'cancelled previews also prune unused geometry');
  const kitFactory = CAT.makeKit(T);
  for (let i = 0; i < 600; i++) kitFactory().box(1 + i / 1000, 1, 1, 'black');
  assert(kitFactory.cacheSize() <= 256, 'temporary primitive cache stays bounded under continuous edits');
  assert.deepEqual(JSON.parse(JSON.stringify(SIM.state.items)), JSON.parse(baseline), 'resource stress test preserves the design layout');

  const E = SIM.electrical; E.rebuild();
  const shapes = new Map(E.layer.children.filter(o => o.geometry && o.userData.electricalId).map(o => [o.userData.electricalId, o.geometry]));
  const paths = JSON.stringify(E.routes), oldDim = SIM.item(ids[0]).dim;
  SIM.update(ids[0], { dim: .2 }, { record: false }); E.rebuild();
  assert.equal(JSON.stringify(E.routes), paths, 'dimming leaves every route coordinate and length unchanged');
  for (const o of E.layer.children) if (shapes.has(o.userData.electricalId)) assert.equal(o.geometry, shapes.get(o.userData.electricalId), 'dimming reuses route GPU buffers');
  assert.equal(SIM.exportLayout().items.find(it => it.id === ids[0]).dim, .2, 'layout export still reads the current dimmer');
  SIM.update(ids[0], { dim: oldDim }, { record: false }); E.rebuild();
  console.log(JSON.stringify({ systemResources: 'passed', ...SIM.resourceStats() }));
}
for (const it of SIM.state.items) {
  const t = CAT.byId[it.type];
  assert(t, 'type ' + it.type);
  for (const v of it.pos) assert(Number.isFinite(v));
  if (it.mount === 'pendant') assert(it.anchorY >= it.pos[1] - 0.01, 'pendant hangs below its anchor: ' + it.name);
}
// Floor-standing items collide in walk mode.
assert(church.colliders.some(c => c.kind === 'simulator'), 'floor items add walk colliders');
assert(!church.colliders.some(c => /^(Statue ·|Shrine flowers ·)/.test(c.label)), 'statues and flowers on the raised shrine shelves leave the service doors walkable');
// Seating-dependent palms preserve manual visibility and remove walk obstacles.
{
  const planning=sandbox.CHURCH_PLANNING,allPalms=SIM.state.items.filter(it=>it.type==='palm');
  const palms=allPalms.filter(it=>it.name.startsWith('Palm · entrance')),sanctuaryPalms=allPalms.filter(it=>it.name.startsWith('Palm · sanctuary'));
  assert.equal(palms.length,2);assert.equal(sanctuaryPalms.length,2);assert.equal(allPalms.length,4);
  const exteriorPalm=SIM.add({type:'palm',name:'Test courtyard palm',mount:'floor',pos:[-10,-.48,5]}, {record:false});
  const visibility=palms.map(it=>it.hidden);
  for(const layout of [2,4,2,4]){
    planning.setLayout(layout);
    SIM.electrical.rebuild();SIM.electrical.setMode('systems');SIM.electrical.setMode('building');
    for(const it of palms){
      assert.equal(SIM.fixtures.get(it.id).root.visible,layout===4&&!it.hidden);
      assert.equal(church.colliders.some(c=>c.label===it.name),layout===4&&!it.hidden,'Hidden indoor palms do not block walking');
    }
    assert(SIM.fixtures.get(exteriorPalm.id).root.visible,'Outdoor palms are independent of seating');
    for(const it of sanctuaryPalms)assert(SIM.fixtures.get(it.id).root.visible,'Sanctuary palms stand clear of the seating in both layouts');
    assert.deepEqual(palms.map(it=>it.hidden),visibility,'Layout switching preserves saved decoration settings');
  }
  SIM.update(palms[0].id,{hidden:true},{record:false});
  planning.setLayout(2);planning.setLayout(4);
  assert.equal(SIM.fixtures.get(palms[0].id).root.visible,false,'Manually hidden palms stay hidden');
  SIM.update(palms[0].id,{hidden:visibility[0]},{record:false});
  SIM.remove(exteriorPalm.id,{record:false});
}
// Socket outlets, façade statues and their hidden light (9 October 2026).
{
  const D = sandbox.CHURCH_SIM_DESIGN, E = SIM.electrical, byId = id => SIM.item(id), power = SIM.powerSummary();
  const circuit = c => power.byCircuit.find(x => x.circuit === c);
  for (const code of ['B', 'H']) {
    const sanct = byId(`P-SANCT-${code}`), nave = byId(`P-NAVE-${code}`), tower = byId(`P-TOWER-${code}`), side = code === 'B' ? -1 : 1;
    assert(sanct && nave && tower, 'six socket-outlet points exist: ' + code);
    assert.equal(sanct.circuit, nave.circuit, 'one indoor socket radial per side');
    assert.equal(sanct.circuit, code === 'B' ? 'P1' : 'P2'); assert.equal(tower.circuit, code === 'B' ? 'P3' : 'P4');
    assert(sanct.on && nave.on && !tower.on, 'indoor outlets live, event points isolated by default');
    assert([sanct, nave, tower].every(it => Math.sign(it.pos[2]) === side && SIM.itemWatts(it) === 0), 'a socket without a test load adds no operating load');
    const drop = E.routes.find(r => r.role === 'drop' && r.itemIds[0] === tower.id), trunk = E.routes.find(r => r.id === drop.trunkId);
    assert.equal(drop.method, 'underfloor-event'); assert.equal(trunk.source, 'EB1');
    // The tower plinth top is in the building model, not in the simplified floor function.
    const surface = p => { const rc = new T.Raycaster(new T.Vector3(p[0], 1.2, p[2]), new T.Vector3(0, -1, 0), 0, 4); rc.camera = camera; const h = rc.intersectObject(building, true)[0]; return h ? h.point.y : -Infinity; };
    assert(trunk.points.slice(1).every(p => p[1] < surface(p) - 0.1 && p[1] < 0), 'event power runs below the hall floor and tower plinth, not over the entrance band');
    // Since 25 Oct 2026 the event board EB-1 is in the H-side tower, so the B-side point is about
    // 19 m away below the entrance (it was under 17 m from DB-2 inside the main doors).
    assert(drop.length + drop.upstreamLength < (code === 'B' ? 22 : 8), 'event power takes the short buried route from EB-1: ' + (drop.length + drop.upstreamLength).toFixed(2));
    for (const it of [sanct, nave]) assert.equal(E.routes.find(r => r.role === 'drop' && r.itemIds[0] === it.id).source, 'DB1', 'indoor sockets come straight from DB-1');
  }
  for (const [c, amps] of [['P1', 16], ['P2', 16], ['P3', 32], ['P4', 32]]) assert(circuit(c).outlet && circuit(c).mcb === amps && circuit(c).rcdmA === 30 && circuit(c).watts === 0, c + ' is rated as a socket circuit');
  assert(Math.abs(power.outletRatedAmps - 96) < 1e-9, 'socket allowance is reported apart from fixed equipment');
  SIM.update('P-NAVE-B', { params: { loadW: 3300 } }, { record: false }); SIM.update('P-SANCT-B', { params: { loadW: 1500 } }, { record: false });
  assert(SIM.powerSummary().byCircuit.find(x => x.circuit === 'P1').overloaded, 'a test load above the circuit rating is flagged');
  SIM.update('P-NAVE-B', { params: { loadW: 0 } }, { record: false }); SIM.update('P-SANCT-B', { params: { loadW: 0 } }, { record: false });
  // Statues stand in their niches; their light has no visible lamp, only lips and candles.
  const lights = SIM.state.items.filter(it => it.circuit === 'L10');
  assert.equal(lights.length, 15, 'three hidden lines and two candles per niche on L10');
  assert.equal(SIM.CIRCUITS.L10.board, 'DB2');
  // Niches of the CAD file of 23 Oct 2026 (facade.js): width, pedestal and crown, and the back of the niche hood.
  for (const [code, , , z, base, crown, , half] of D.facadeNiches) {
    const statue = byId(`D-FACADE-${code}`), box = new T.Box3().setFromObject(SIM.fixtures.get(statue.id).root);
    const back = code === 'C' ? 4.225 + 0.711 : 4.117 + 0.599;
    assert(box.min.y >= base - 0.01 && box.max.y < crown && box.min.z > z - half && box.max.z < z + half && box.max.x < back, `façade statue ${code} stands inside its niche`);
    for (const part of ['ARCH', 'JAMB-1', 'JAMB-2']) {
      const fx = SIM.fixtures.get(`L-STATUE-${code}-${part}`), materials = new Set();
      fx.root.traverse(o => { if (o.isMesh) materials.add(o.material.name); });
      assert(fx.proto.glows.length === 0 && [...materials].every(n => n === 'Simulator · ivory'), `hidden light ${code} ${part} shows only its finish-matched lip`);
    }
    for (const n of [1, 2]) assert(SIM.fixtures.get(`L-STATUE-${code}-CANDLE-${n}`).proto.glows.length === 1 && Math.abs(byId(`L-STATUE-${code}-CANDLE-${n}`).pos[1] - base) < 1e-9, 'candle lights stand on the statue base');
  }
  assert(SIM.emitters().filter(e => /^L-STATUE-.*-(ARCH|JAMB)/.test(e.id)).every(e => e.lumens >= 60), 'every hidden line is bright enough to be drawn');
  for (const name of Object.keys(SIM.SCENES)) assert('L10' in SIM.SCENES[name] && !['P1', 'P2', 'P3', 'P4'].some(c => c in SIM.SCENES[name]), name + ': statues follow scenes, sockets do not');
  // Saved layouts gain the new records once; a record deleted afterwards stays deleted.
  const design = D.recommended(SIM.GEO, SIM), old = design.filter(it => !D.outletIds.includes(it.id) && !D.facadeStatueIds.includes(it.id));
  const upgraded = D.upgradeFacadeStatues(D.upgradeOutlets(old, design), design);
  assert.equal(upgraded.length, design.length); assert.deepEqual(upgraded.slice(0, old.length), old, 'existing records are untouched');
  const kept = upgraded.filter(it => it.id !== 'P-NAVE-H' && it.id !== 'L-STATUE-C-CANDLE-1');
  assert.equal(D.upgradeFacadeStatues(D.upgradeOutlets(kept, design), design).length, design.length, 'the first issue restores a complete set');
  assert(D.outletIds.length === 6 && D.facadeStatueIds.length === 18 && new Set(design.map(it => it.id)).size === design.length, 'stable unique IDs');
  // Exhaust ventilation by zone (safety review finding 9): V1 front gable, V2 wing gables, V3 service room.
  const zone = c => SIM.state.items.filter(it => it.circuit === c && it.type === 'fanExhaust').map(it => it.id), plainCopy = v => JSON.parse(JSON.stringify(v));
  assert.deepEqual(plainCopy([zone('V1'), zone('V2'), zone('V3')]), [['F252', 'F253', 'F254', 'F255'], ['F256', 'F257', 'F258', 'F259'], ['F260']], 'exhaust fans split by zone, IDs unchanged');
  assert.deepEqual(Object.keys(SIM.CIRCUITS).slice(-3), ['V2', 'V3', 'LS'], 'new circuits (exhaust zones, then the Stations candles of 25 Oct 2026) are appended, so existing mains band heights do not move');
  assert.deepEqual(plainCopy(SIM.CIRCUIT_ORDER.slice(SIM.CIRCUIT_ORDER.indexOf('V1'), SIM.CIRCUIT_ORDER.indexOf('V1') + 3)), ['V1', 'V2', 'V3'], 'the web app lists the exhaust zones together');
  assert.equal(new Set(SIM.CIRCUIT_ORDER).size, Object.keys(SIM.CIRCUITS).length, 'display order lists every circuit once');
  for (const [name, scene] of Object.entries(SIM.SCENES)) assert(scene.V2 === scene.V1 && scene.V3 === scene.V1, name + ': every exhaust zone takes the value V1 had');
  // A saved layout from before the split: fans still on V1 move once; the user's own circuit, deletions, positions and states stay.
  const beforeSplit = design.filter(it => it.id !== 'F257').map(it => it.type === 'fanExhaust' ? { ...it, circuit: 'V1' } : it);
  Object.assign(beforeSplit.find(it => it.id === 'F258'), { circuit: 'F2' });
  Object.assign(beforeSplit.find(it => it.id === 'F256'), { pos: [39.5, 7.6, -13.13], speed: 3, on: false });
  beforeSplit.push({ ...design.find(it => it.id === 'F260'), id: 'F-USER-EXHAUST', circuit: 'V1' });
  const split = D.upgradeExhaustSplit(beforeSplit, design), circuitOf = id => split.find(it => it.id === id)?.circuit;
  assert.equal(D.exhaustSplitRevision, SIM.state.settings.exhaustSplitRevision, 'the split revision is stored in the saved settings');
  assert.deepEqual(['F252', 'F255', 'F256', 'F257', 'F258', 'F259', 'F260', 'F-USER-EXHAUST'].map(circuitOf), ['V1', 'V1', 'V2', undefined, 'F2', 'V2', 'V3', 'V1'], 'split moves only recommended fans still on V1');
  assert.deepEqual(plainCopy(split.find(it => it.id === 'F256').pos), [39.5, 7.6, -13.13]); assert(split.find(it => it.id === 'F256').speed === 3 && split.find(it => it.id === 'F256').on === false, 'position, speed and switching are kept');
  assert.equal(split.length, beforeSplit.length, 'nothing is added or restored');
  assert.deepEqual(plainCopy(D.upgradeExhaustSplit(split, design)), plainCopy(split), 'applying the split again changes nothing');
}
// Owner, 19 October 2026: reading lights in the timber colour on the beams, nave speakers off the
// concrete piers into the pier–wall corners, and a one-time move of untouched saved fittings.
{
  const D = sandbox.CHURCH_SIM_DESIGN, timber = interior.materials.timber, wall = sandbox.window.model.mat.wall, plain = v => JSON.parse(JSON.stringify(v));
  const reading = SIM.state.items.filter(it => /^Reading light · axis /.test(it.name));
  assert.equal(reading.length, 56, 'twin reading heads at axes 3–9 on the tie and side beams');
  for (const it of reading) {
    const tie = / central/.test(it.name), beam = (tie ? SIM.GEO.mainBeams : SIM.GEO.sideBeams).find(b => Math.abs(b.x + b.w / 2 - it.pos[0]) < 1e-6 && (tie || b.side === Math.sign(it.pos[2])));
    assert(it.type === 'readingProjector' && it.mount === 'wall' && it.mountYaw === 0 && it.params.finish === 'timber' && beam, 'side bracket on the sanctuary face of its beam: ' + it.name);
    assert(Math.abs(it.anchorY - beam.y0) < 1e-6, 'route and records name the beam soffit: ' + it.name);
    const fx = SIM.fixtures.get(it.id), box = new T.Box3().setFromObject(fx.root), lens = SIM.emitters().find(e => e.id === it.id);
    assert(box.min.y > beam.y0 - 0.03 && box.max.y < beam.y1, 'body beside the beam, only the cowl at the soffit: ' + it.name);
    assert(lens && lens.pos[1] <= beam.y0 + 0.005 && lens.dir[1] < -0.97, 'light leaves below the soffit, aimed down: ' + it.name);
    fx.root.traverse(m => { if (m.isMesh && !m.material.name.startsWith('Simulator glow')) assert.equal(m.material, timber, 'the beam lacquer itself, so it follows the timber tone: ' + it.name); });
  }
  // Tie-beam pairs flank the gilded band at ±2.60 m; side-beam pairs stand either side of the cartouche.
  assert(reading.filter(it => / central/.test(it.name)).every(it => Math.abs(Math.abs(Math.abs(it.pos[2]) - 2.6) - 0.12) < 1e-6), 'tie pairs flank the gilded band');
  assert(reading.filter(it => / outer/.test(it.name)).every(it => [4.84, 6.09].some(z => Math.abs(Math.abs(it.pos[2]) - z) < 1e-6)), 'side pairs flank the cartouche');
  for (const it of SIM.state.items.filter(it => /^Rear (rows|centre) light · entrance façade ·/.test(it.name))) {
    assert(it.type === 'readingProjector' && it.params.finish === 'wall', 'entrance-wall reading heads in the plaster finish: ' + it.name);
    SIM.fixtures.get(it.id).root.traverse(m => { if (m.isMesh && !m.material.name.startsWith('Simulator glow')) assert.equal(m.material, wall, 'wall plaster: ' + it.name); });
  }
  // Wall speakers: on the masonry wall, tight against the entrance side of each pier, inside its projection.
  const speakers = SIM.state.items.filter(it => /^Wall speaker · axis \d · [BH]$/.test(it.name));
  assert.equal(speakers.length, 12);
  for (const it of speakers) {
    const k = it.name.match(/axis (\d)/)[1], s = Math.sign(it.pos[2]), pierFace = SIM.GEO.axes[k] - 0.29, box = new T.Box3().setFromObject(SIM.fixtures.get(it.id).root);
    assert(Math.abs(Math.abs(it.pos[2]) - 7.25) < 1e-6 && it.mountYaw === -s * 90 && it.yaw === -s * 140, 'on the wall, facing the rows behind: ' + it.name);
    assert(box.max.x < pierFace && box.max.x > pierFace - 0.03, 'tight against the pier side: ' + it.name + ' ' + (pierFace - box.max.x).toFixed(3));
    // Tilted 22° down, the top of the column stands at most 40 mm proud of the pier face (0.20 m on the pier before).
    const proud = 7.07 - Math.min(Math.abs(box.min.z), Math.abs(box.max.z));
    assert(proud < 0.04, 'within the depth of the pier: ' + it.name + ' ' + proud.toFixed(3) + ' m proud of its face');
    assert(it.tilt === -22, 'tilted further down for the seats now 0.18 m further away: ' + it.name);
  }
  // Migration: an untouched default fitting moves and keeps its switching; a moved or re-aimed one stays.
  const design = D.recommended(SIM.GEO, SIM), before = D.hiddenFittingsBefore(SIM.GEO);
  assert.equal(before.size, 100, 'previous defaults of every moved fitting');
  const old = (name, o = {}) => { const b = before.get(name), raw = design.find(it => it.name === name);
    return { ...raw, type: b.type, pos: [...b.pos], yaw: b.yaw, tilt: b.tilt, mount: /^Reading/.test(name) ? 'pendant' : b.type === 'corniceFlood' || b.type === 'flood' ? 'floor' : 'wall', params: b.type === 'corniceFlood' ? { outreach: 0.5 } : {}, ...o }; };
  const saved = [old('Reading light · axis 5 · H central', { id: 'r1', on: false, dim: 0.4, lumens: 2000 }), old('Reading light · axis 6 · B outer · twin', { id: 'r2', pos: [23.2, 6.655, -5.6] }),
    old('Tower stage 2 flood · B', { id: 't1', dim: 0.5 }), old('Stage flood · tower H · outer', { id: 't2', on: false, circuit: 'L9' }),
    old('Wall speaker · axis 7 · H', { id: 's1', level: -3, delayMs: 12 }), old('Wall speaker · axis 8 · B', { id: 's2', yaw: 120 }), { id: 'u', name: 'User fan', type: 'fanWall', circuit: 'F2', pos: [20, 3, 7] }];
  const up = D.upgradeHiddenFittings(saved, design, SIM.GEO), byId = id => up.find(it => it.id === id), target = name => design.find(it => it.name === name);
  assert.equal(up.length, saved.length, 'nothing is added or restored');
  for (const [id, name] of [['r1', 'Reading light · axis 5 · H central'], ['t1', 'Tower stage 2 flood · B'], ['t2', 'Stage flood · tower H · outer'], ['s1', 'Wall speaker · axis 7 · H']]) {
    const it = byId(id), raw = target(name);
    assert(it.type === raw.type && it.mount === raw.mount && plain(it.pos).join() === plain(raw.pos).join() && it.yaw === raw.yaw && it.tilt === raw.tilt && it.mountYaw === raw.mountYaw, 'untouched fitting takes its new place: ' + name);
    assert.deepEqual(plain(it.params ?? {}), plain(raw.params ?? {})); assert.equal(it.anchorY, raw.anchorY);
  }
  assert(byId('r1').on === false && byId('r1').dim === 0.4 && byId('r1').lumens === 2000, 'switch, dimmer and output kept');
  assert(byId('t1').dim === 0.5 && byId('t2').on === false && byId('t2').circuit === 'L9' && byId('s1').level === -3 && byId('s1').delayMs === 12, 'dimmer, switch, circuit, level and delay kept');
  assert.deepEqual(plain(byId('r2')), plain(saved[1]), 'a moved reading light stays where the user put it');
  assert.deepEqual(plain(byId('s2')), plain(saved[5]), 'a re-aimed speaker stays as the user set it');
  assert.equal(byId('u'), saved[6], 'unrelated equipment untouched');
  assert.deepEqual(plain(D.upgradeHiddenFittings(up, design, SIM.GEO)), plain(up), 'applying it again changes nothing');
  assert.equal(SIM.state.settings.hiddenFittingsRevision, D.hiddenFittingsRevision, 'the revision is stored in the saved settings');
}
// 19 October 2026 (owner: all the sanctuary lights in the lacquer; nave chandeliers 1.0 m higher).
// The accent heads hung from the axis-9 tie and side beams take the beam lacquer, the heads and vault
// uplights on the chamber walls the chamber's own lacquer. Finish only; a one-time change for saved layouts.
{
  const D = sandbox.CHURCH_SIM_DESIGN, timber = interior.materials.timber, chamberWall = sandbox.window.CHURCH_SANCTUARY.materials.wood, plain = v => JSON.parse(JSON.stringify(v));
  const beamNames = ['Altar key light · B', 'Altar key light · H', 'Ambo key light', 'Sanctuary step fill · B', 'Sanctuary step fill · H', 'Presider chair light',
    'Sanctuary frame wash · B', 'Sanctuary frame wash · H', 'Statue accent · B', 'Statue accent · H', 'Shrine wash · B', 'Shrine wash · H'];
  const chamberNames = ['Crucifix accent · B', 'Crucifix accent · H', 'Reredos wash · B', 'Reredos wash · H', 'Reredos base wash · B', 'Reredos base wash · H',
    'Tabernacle accent', 'Sanctuary vault uplight · B', 'Sanctuary vault uplight · H'];
  const metal = { projector24: 'black', projector36: 'black', spot15: 'bronze', uplight: 'bronze' };
  const byName = name => SIM.state.items.find(it => it.name === name);
  assert([...beamNames, ...chamberNames].every(byName), 'every sanctuary accent and chamber light is in the design');
  // The chamber side walls carry the sanctuary's own lacquer; the beam timber copies only its colour and
  // follows the timber tone, so the chamber fittings share the wall material itself.
  let wallMesh = null; sandbox.window.model.scene.traverse(o => { if (o.isMesh && o.name === 'Chamber side wall · lacquered timber') wallMesh = o; });
  assert(wallMesh && wallMesh.material === chamberWall, 'the chamber side wall is in the sanctuary lacquer');
  for (const [names, finish, mat] of [[beamNames, 'timber', timber], [chamberNames, 'chamber', chamberWall]]) for (const name of names) {
    const it = byName(name);
    assert(it.circuit === 'L3' && Object.hasOwn(metal, it.type) && it.params.finish === finish, finish + ' finish on ' + name);
    let meshes = 0;
    SIM.fixtures.get(it.id).root.traverse(m => { if (m.isMesh && !m.material.name.startsWith('Simulator glow')) { meshes++; assert.equal(m.material, mat, 'the ' + (finish === 'timber' ? 'beam' : 'chamber wall') + ' lacquer itself: ' + name); } });
    assert(meshes > 0, 'fitting has a body: ' + name);
  }
  // Every other head of these types keeps its metal finish (held wing projectors, roof uplights on the ties).
  for (const it of SIM.state.items.filter(it => Object.hasOwn(metal, it.type) && ![...beamNames, ...chamberNames].includes(it.name))) assert.equal(it.params.finish, metal[it.type], 'metal finish kept: ' + it.name);
  // Nave chandeliers: 1.0 m higher, same chain anchor, mid-bay between the ties, clear of the beams and reading heads.
  // Retired by the parish priest's meeting of 25 Oct 2026: only the crossing chandelier remains, on L3.
  const chandeliers = SIM.state.items.filter(it => /^Chandelier · bay [468]–[579]$/.test(it.name));
  assert.equal(chandeliers.length, 0, 'no chandeliers over the nave');
  assert.deepEqual(JSON.parse(JSON.stringify(SIM.state.items.filter(it => ['chandelier8', 'chandelier12'].includes(it.type)).map(it => [it.name, it.circuit]))), [['Grand chandelier · crossing 9–10', 'L3']], 'one chandelier (the wings keep their small ones), over the sanctuary, switched with it');
  for (const it of chandeliers) {
    assert(it.type === 'chandelier8' && Math.abs(it.pos[1] - 7.3) < 1e-9 && it.pos[2] === 0 && it.anchorY > 9, 'raised to +7.3 m on its ridge chain: ' + it.name);
    const k = it.name.match(/bay (\d)/)[1], mid = (SIM.GEO.axes[k] + SIM.GEO.axes[String(Number(k) + 1)]) / 2;
    assert(Math.abs(it.pos[0] - mid) < 1e-6, 'mid-bay: ' + it.name);
    const head = new T.Box3(); SIM.fixtures.get(it.id).root.traverse(m => { if (m.isMesh && m !== SIM.fixtures.get(it.id).stem && m !== SIM.fixtures.get(it.id).canopy) head.expandByObject(m); });
    const tieSoffit = Math.min(...SIM.GEO.mainBeams.map(b => b.y0));
    assert(head.min.y > 6.1 && head.min.y < 6.3 && head.max.y < tieSoffit, 'lowest point about +6.2 m, below the tie soffit: ' + it.name + ' ' + head.min.y.toFixed(2) + '–' + head.max.y.toFixed(2));
    for (const b of SIM.GEO.mainBeams) assert(head.max.x < b.x - b.w / 2 - 0.5 || head.min.x > b.x + b.w / 2 + 0.5, 'at least 0.5 m clear of tie beam ' + b.x + ': ' + it.name);
    // Reading heads on the tie faces: their 28° cones (aimed 8° along the nave) do not reach the chandelier.
    const readingEmitters = SIM.emitters().filter(e => /^Reading light · axis /.test(SIM.item(e.id)?.name || ''));
    assert.equal(readingEmitters.length, 56, 'every reading head checked');
    for (const r of readingEmitters) {
      const half = ((SIM.item(r.id).beam ?? 36) / 2 + 2) * Math.PI / 180;
      const corners = [];
      for (const x of [head.min.x, head.max.x]) for (const y of [head.min.y, head.max.y]) for (const z of [head.min.z, head.max.z]) corners.push([x, y, z]);
      const centre = head.getCenter(new T.Vector3()), radius = head.getSize(new T.Vector3()).length() / 2;
      const v = new T.Vector3(centre.x - r.pos[0], centre.y - r.pos[1], centre.z - r.pos[2]), dist = v.length(), dir = new T.Vector3(...r.dir).normalize();
      const angle = Math.acos(Math.max(-1, Math.min(1, v.dot(dir) / dist))) - Math.asin(Math.min(1, radius / dist));
      assert(angle > half, 'reading cone clear of ' + it.name + ': ' + SIM.item(r.id).name + ' ' + (angle * 180 / Math.PI).toFixed(1) + '°');
    }
  }
  // Migration: an untouched fitting in its old metal finish (or with none, from before the setting) takes the
  // lacquer and keeps everything else; a chandelier still at +6.3 rises; anything the user changed stays.
  const design = D.recommended(SIM.GEO, SIM), raw = name => design.find(it => it.name === name);
  const old = (name, o = {}) => ({ ...raw(name), params: { finish: metal[raw(name).type] }, ...o });
  // The nave chandeliers are no longer in the design (25 Oct 2026); rebuild them as saved before.
  const chX = { 'Chandelier · bay 4–5': SIM.GEO.axes['4'] + 2.25, 'Chandelier · bay 6–7': SIM.GEO.axes['6'] + 2.25, 'Chandelier · bay 8–9': SIM.GEO.axes['8'] + 2.25 };
  const chOld = (name, o = {}) => ({ ...raw('Grand chandelier · crossing 9–10'), type: 'chandelier8', name, circuit: 'LD', pos: [chX[name], D.NAVE_CHANDELIER_BEFORE_Y, 0], ...o });
  const saved = [old('Altar key light · B', { id: 'a1', on: false, dim: 0.3, lumens: 4000 }), { ...raw('Ambo key light'), id: 'a2', params: {} },
    old('Statue accent · H', { id: 'a3', pos: [raw('Statue accent · H').pos[0], raw('Statue accent · H').pos[1], 4.1] }), old('Shrine wash · B', { id: 'a4', tilt: -30 }),
    old('Sanctuary frame wash · H', { id: 'a5', type: 'projector24' }), old('Presider chair light', { id: 'a6', params: { finish: 'timber' } }),
    old('Reredos wash · H', { id: 'c1', dim: 0.5 }), old('Sanctuary vault uplight · B', { id: 'c2', on: false }), old('Tabernacle accent', { id: 'c3', yaw: 12 }),
    chOld('Chandelier · bay 4–5', { id: 'h1', on: false, dim: 0.4 }), chOld('Chandelier · bay 6–7', { id: 'h2', pos: [24.0, 6.3, 0.5] }), chOld('Chandelier · bay 8–9', { id: 'h3', pos: [chX['Chandelier · bay 8–9'], 5.8, 0] }),
    { ...raw('Grand chandelier · crossing 9–10'), id: 'g' }];
  const up = D.upgradeFinishChandeliers(saved, design), byId = id => up.find(it => it.id === id), was = id => saved.find(it => it.id === id);
  assert.equal(up.length, saved.length, 'nothing is added or removed');
  assert(byId('a1').params.finish === 'timber' && byId('a2').params.finish === 'timber', 'untouched beam heads take the beam lacquer');
  assert(byId('c1').params.finish === 'chamber' && byId('c2').params.finish === 'chamber', 'untouched chamber fittings take the chamber lacquer');
  for (const id of ['a1', 'c1', 'c2']) { const { params: _a, ...after } = byId(id), { params: _b, ...before } = was(id); assert.deepEqual(plain(after), plain(before), 'only the finish changes: ' + id); }
  for (const id of ['a3', 'a4', 'a5', 'c3', 'h2', 'h3', 'g']) assert.equal(byId(id), was(id), 'a moved, re-aimed or re-typed item and the grand chandelier stay as they were: ' + id);
  assert.deepEqual(plain(byId('a6')), plain(was('a6')), 'a head already in the lacquer stays');
  assert(byId('h1').pos[1] === 7.3 && byId('h1').pos[0] === was('h1').pos[0] && byId('h1').on === false && byId('h1').dim === 0.4 && byId('h1').anchorY === was('h1').anchorY, 'a chandelier at +6.3 rises; switch, dimmer and anchor kept');
  assert.deepEqual(plain(D.upgradeFinishChandeliers(up, design)), plain(up), 'applying it again changes nothing');
  assert.equal(SIM.state.settings.finishChandelierRevision, D.finishChandelierRevision, 'the revision is stored in the saved settings');
}
// Owner, 19 October 2026: side-aisle fans hang from the column-line beams (B03) that join
// the columns, and 0.30 m higher. Bay 2′–3 has no such beam and keeps its purlin bracket.
{
  const D = sandbox.CHURCH_SIM_DESIGN, plain = v => JSON.parse(JSON.stringify(v));
  const fans = SIM.state.items.filter(it => /^Ceiling fan · bay .* aisle$/.test(it.name));
  assert.equal(fans.length, 14, 'seven bays of side-aisle fans');
  for (const it of fans) {
    assert(Math.abs(it.pos[1] - 4.2) < 1e-9, 'hub at +4.20 m: ' + it.name);
    const back = /2′–3/.test(it.name), beam = SIM.GEO.longBeams.find(b => it.pos[0] > b.x0 && it.pos[0] < b.x1 && Math.abs(b.z - it.pos[2]) < 1e-6);
    if (back) assert(Math.abs(Math.abs(it.pos[2]) - 4.4) < 1e-9 && !beam, 'bay 2′–3 has no column-line beam; its fans stay on the purlins: ' + it.name);
    else assert(beam && Math.abs(it.pos[0] - (beam.x0 + beam.x1) / 2) < 1e-6 && Math.abs(it.anchorY - beam.y0) < 1e-6, 'fan hangs at mid-span under its column-line beam: ' + it.name);
    const t = CAT.byId[it.type], blades = it.pos[1] - t.fan.rotorDrop;
    assert(blades >= 2.4 && blades < 4.2, 'blades above head height and below the height where seated air falls off: ' + it.name);
  }
  const design = D.recommended(SIM.GEO, SIM), pick = name => design.find(it => it.name === name);
  const old = (name, o = {}) => { const raw = pick(name); return { ...raw, pos: [raw.pos[0], 3.9, Math.sign(raw.pos[2]) * 4.4], anchorY: 9.03, note: 'old', ...o }; };
  const saved = [old('Ceiling fan · bay 5–6 · B aisle', { id: 'f1', speed: 3, on: false }), old('Ceiling fan · bay 2′–3 · H aisle', { id: 'f2' }), old('Ceiling fan · bay 6–7 · H aisle', { id: 'f3', pos: [25.0, 3.9, 4.4] })];
  const up = D.upgradeFanBeams(saved, design), byId = id => up.find(it => it.id === id);
  assert(plain(byId('f1').pos).join() === plain(pick('Ceiling fan · bay 5–6 · B aisle').pos).join() && byId('f1').anchorY === 8.73 && byId('f1').speed === 3 && byId('f1').on === false, 'untouched fan moves under the beam, keeps speed and switch');
  assert(Math.abs(byId('f2').pos[1] - 4.2) < 1e-9 && Math.abs(byId('f2').pos[2] - 4.4) < 1e-9, 'back-bay fan only rises');
  assert.deepEqual(plain(byId('f3')), plain(saved[2]), 'a fan the user moved stays');
  assert.deepEqual(plain(D.upgradeFanBeams(up, design)), plain(up), 'applying it again changes nothing');
  assert.equal(SIM.state.settings.fanBeamRevision, D.fanBeamRevision, 'the revision is stored in the saved settings');
  // Tie-beam reading heads aimed toward a bay with a beam-hung fan: 5° along the nave, 24° optic.
  const tie = SIM.state.items.filter(it => /^Reading light · axis \d · [BH] central/.test(it.name));
  const faces = it => { const k = +it.name.match(/axis (\d)/)[1]; return / · twin$/.test(it.name) ? k >= 4 : k <= 8; };
  assert.equal(tie.filter(faces).length, 24, 'twenty-four heads face a beam-hung fan');
  for (const it of tie) assert.equal(it.beam, faces(it) ? 24 : 28, 'optic of ' + it.name);
  const head = pick('Reading light · axis 5 · H central'), axisX = head.pos[0] - 0.15, before = D.aim([head.pos[0] + 0.085, 8.59, head.pos[2]], [axisX + Math.tan(8 * Math.PI / 180) * 7.79, 0.8, 2.6]);
  const heads = D.upgradeFanBeams([{ ...head, id: 'h1', yaw: before.yaw, tilt: before.tilt, beam: 28, on: false, lumens: 2000 }, { ...head, id: 'h2', yaw: before.yaw + 5, tilt: before.tilt, beam: 28 }], design);
  assert(heads[0].yaw === head.yaw && heads[0].tilt === head.tilt && heads[0].beam === 24 && heads[0].on === false && heads[0].lumens === 2000, 'untouched head takes the new aim and optic, keeps switch and output');
  assert(heads[1].beam === 28, 'a re-aimed head stays as the user set it');
}
// CAD file of 23 Oct 2026: the dais rose from +0.75 to +0.80 m. Fittings standing on it
// rise with it once; anything placed elsewhere or at another height stays.
{
  const D = sandbox.CHURCH_SIM_DESIGN, plain = v => JSON.parse(JSON.stringify(v));
  assert.equal(SIM.floorY(44, 0), 0.8, 'dais floor +0.80 m');
  assert.equal(SIM.floorY(46, -5), 0.16, 'side floors +0.16 m');
  assert.equal(SIM.floorY(50, 0), 0.15, 'bay behind the dais keeps +0.15 m');
  for (const name of ['Flower stand · tabernacle B', 'Palm · sanctuary H', 'Paschal candle']) {
    const it = SIM.state.items.find(i => i.name === name);
    assert(it && Math.abs(it.pos[1] - 0.8) < 1e-9, 'stands on the dais: ' + name);
  }
  const design = D.recommended(SIM.GEO, SIM), pick = name => design.find(it => it.name === name);
  const lowered = (name, o = {}) => { const raw = pick(name); return { ...raw, pos: [raw.pos[0], raw.pos[1] - 0.05, raw.pos[2]], ...o }; };
  const saved = [lowered('Ambo microphone', { id: 'm1', on: false }), lowered('Palm · sanctuary B', { id: 'p1' }),
    { ...pick('Paschal candle'), id: 'c1', pos: [40.9, 0.75, -1.2] },
    { ...pick('Altar microphone'), id: 'm2', pos: [44.45, 1.6, 0.45] },
    { ...pick('Palm · entrance B'), id: 'p2' },
    { id: 'u1', name: 'Extra flowers', type: 'flowerStand', circuit: 'DECOR', mount: 'floor', pos: [46.0, 0.75, 1.0], yaw: 0, mountYaw: 0 }];
  const up = D.upgradeDaisLevel(saved, design), byId = id => up.find(it => it.id === id);
  assert(plain(byId('m1').pos).join() === plain(pick('Ambo microphone').pos).join() && byId('m1').on === false, 'untouched dais microphone rises, keeps its switch');
  assert(Math.abs(byId('p1').pos[1] - 0.8) < 1e-9, 'untouched palm stands on the new floor');
  assert(Math.abs(byId('c1').pos[1] - 0.8) < 1e-9 && byId('c1').pos[0] === 40.9, 'a moved item resting on the old floor rises in place');
  assert.deepEqual(plain(byId('m2')), plain(saved[3]), 'a microphone set to another height stays');
  assert.deepEqual(plain(byId('p2')), plain(saved[4]), 'items off the dais stay');
  assert(Math.abs(byId('u1').pos[1] - 0.8) < 1e-9, 'a user item on the old floor rises');
  assert.deepEqual(plain(D.upgradeDaisLevel(up, design)), plain(up), 'applying it again changes nothing');
  assert.equal(SIM.state.settings.daisLevelRevision, D.daisLevelRevision, 'the revision is stored in the saved settings');
}
// CAD facade of 23 Oct 2026: the niches moved back and up, so the statues, their hidden lines and
// candles follow once from their previous places, and the upper washes re-aim at the aedicule.
{
  const D = sandbox.CHURCH_SIM_DESIGN, plain = v => JSON.parse(JSON.stringify(v));
  const design = D.recommended(SIM.GEO, SIM), byIdIn = (list, id) => list.find(it => it.id === id);
  const now = new Map(design.map(it => [it.id, it]));
  // The previous layout, rebuilt from the replaced niches.
  for (const it of design.filter(i => D.facadeStatueIds.includes(i.id))) assert(it.pos[0] > 3.6, 'recommended statue fittings stand in the CAD niches: ' + it.id);
  // Simulate a saved layout at the old places, with one statue moved and one candle deleted by the user.
  const C = D.facadeNichesBefore.find(r => r[0] === 'B');
  const oldStatue = { ...now.get('D-FACADE-B'), pos: [C[10], C[4], C[3]] };
  const oldCandle = { ...now.get('L-STATUE-B-CANDLE-2'), pos: [C[10] - 0.19, C[4], C[3] + 0.31] };
  const moved = { ...now.get('D-FACADE-H'), pos: [3.0, 10.08, 5.48] };
  const crown = design.filter(it => /^Central crown wash · /.test(it.name)).map(it => ({ ...it }));
  const reaimed = { ...crown[1], yaw: crown[1].yaw + 5 };
  const was = D.aim([crown[0].pos[0], crown[0].pos[1] + 0.075, crown[0].pos[2]], [2.2, 18.6, 0]);
  const saved = [oldStatue, oldCandle, moved, reaimed, { ...crown[0], yaw: was.yaw, tilt: was.tilt }];
  const up = D.upgradeFacadeCad(saved, design);
  assert.deepEqual(plain(up[0].pos), plain(now.get('D-FACADE-B').pos), 'a statue at its old place moves to the CAD niche');
  assert.deepEqual(plain(up[1].pos), plain(now.get('L-STATUE-B-CANDLE-2').pos), 'its candle moves with it');
  assert.deepEqual(plain(up[2]), plain(moved), 'a statue the user moved stays');
  assert.deepEqual(plain(up[3]), plain(reaimed), 'a wash the user re-aimed stays');
  assert(Math.abs(up[4].yaw - crown[0].yaw) < 1e-9 && Math.abs(up[4].tilt - crown[0].tilt) < 1e-9, 'an untouched upper wash re-aims at the aedicule');
  assert.equal(up.length, saved.length, 'nothing is added or deleted');
  assert.deepEqual(plain(D.upgradeFacadeCad(up, design)), plain(up), 'applying it again changes nothing');
  assert.equal(SIM.state.settings.facadeCadRevision, D.facadeCadRevision, 'the revision is stored in the saved settings');
}
// Parish priest's decisions of 25 Oct 2026: a saved layout still at the pre-meeting values takes
// the new places, circuits and outputs once; user changes and deletions are kept, retired items
// that are still untouched go, and new items are added once.
{
  const D = sandbox.CHURCH_SIM_DESIGN, plain = v => JSON.parse(JSON.stringify(v));
  const design = D.recommended(SIM.GEO, SIM), now = new Map(design.map(it => [it.id, it]));
  const before = D.parishMeetingBefore, ids = Object.keys(before);
  assert(ids.length > 0, 'the parish-meeting table lists the changed items');
  const old = id => ({ ...(now.get(id) ?? {}), id, ...before[id], on: false, dim: 0.4, note: 'kept note' });
  const keptIds = ids.filter(id => now.has(id)), retiredIds = ids.filter(id => !now.has(id));
  const [movedId, deletedId] = [keptIds[0], keptIds[1]];
  const userMoved = { ...old(movedId), pos: [before[movedId].pos[0] + 0.5, before[movedId].pos[1], before[movedId].pos[2]] };
  const saved = [...ids.filter(id => id !== deletedId && id !== movedId).map(old), userMoved, { ...design.find(it => !before[it.id] && !D.parishMeetingAdded.includes(it.id)) }];
  const up = D.upgradeParishMeeting(saved, design), get = id => up.find(it => it.id === id);
  for (const id of keptIds.filter(id => id !== movedId && id !== deletedId)) {
    const it = get(id), raw = now.get(id);
    assert(it && plain(it.pos).every((v, i) => Math.abs(v - raw.pos[i]) < 1e-9) && it.circuit === raw.circuit && it.type === raw.type, 'an untouched item takes its new place and circuit: ' + id);
    assert(it.on === false && it.dim === 0.4 && it.note === 'kept note', 'switching, dimmer and note are kept: ' + id);
  }
  assert.deepEqual(plain(get(movedId)), plain(userMoved), 'an item the user moved stays where it is');
  assert(!get(deletedId), 'an item the user deleted stays deleted');
  for (const id of retiredIds) assert(!get(id), 'an untouched retired item is removed: ' + id);
  for (const id of D.parishMeetingAdded) assert.equal(up.filter(it => it.id === id).length, 1, 'a new item is added once: ' + id);
  assert.deepEqual(plain(D.upgradeParishMeeting(up, design)), plain(up), 'applying it again changes nothing');
  assert.equal(SIM.state.settings.parishMeetingRevision, D.parishMeetingRevision, 'the revision is stored in the saved settings');
}
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
  // Ledge fittings on the towers and façade (19 October 2026): each rests on a cornice, stays low
  // (about 0.15 m) and in the cornice colour, has no projecting arm, and its optic clears the masonry.
  const trim = sandbox.window.model.mat.trim, ledgeFittings = SIM.state.items.filter(i => i.type === 'ledgeBar' || i.type === 'ledgeFlood');
  assert.equal(ledgeFittings.length, 28, 'eighteen tower washes and ten façade and stage floods on the ledges');
  for (const it of ledgeFittings) {
    assert(hit([it.pos[0], it.pos[1] + 0.1, it.pos[2]], [0, -1, 0], 0.35), 'ledge fitting rests on a cornice: ' + it.name);
    const fx = SIM.fixtures.get(it.id), head = fx.head.getWorldPosition(new T.Vector3()), box = new T.Box3().setFromObject(fx.root);
    assert(box.max.y - it.pos[1] < 0.17, 'low profile above its ledge: ' + it.name + ' ' + (box.max.y - it.pos[1]).toFixed(3));
    const a = it.mountYaw * Math.PI / 180, f = [Math.cos(a), 0, Math.sin(a)], reach = (head.x - it.pos[0]) * f[0] + (head.z - it.pos[2]) * f[2];
    assert(reach <= 0.15 + 1e-6, 'no projecting arm: ' + it.name);
    const h = hit([head.x, head.y, head.z], [-f[0], 0, -f[2]], 0.9);
    assert(!h || h.distance > 0.04, 'optic clears the masonry: ' + it.name);
    fx.root.traverse(m => { if (m.isMesh && !m.material.name.startsWith('Simulator glow')) assert.equal(m.material, trim, 'cornice colour, the model\'s own moulding finish: ' + it.name); });
  }
  // Up-washes stand at the lip with the optic just beyond it: in front of the engaged columns,
  // so that their fronts and the louvres are lit, yet only about 0.11 m high.
  for (const it of ledgeFittings.filter(i => i.type === 'ledgeBar')) {
    const fx = SIM.fixtures.get(it.id), head = fx.head.getWorldPosition(new T.Vector3()), a = it.mountYaw * Math.PI / 180, f = [Math.cos(a), 0, Math.sin(a)];
    assert(!hit([head.x, head.y - 0.04, head.z], [0, -1, 0], 0.3), 'bar optic is beyond the cornice lip: ' + it.name);
    assert(hit([head.x - f[0] * 0.12, it.pos[1] + 0.1, head.z - f[2] * 0.12], [0, -1, 0], 0.35), 'bar base stays on the ledge: ' + it.name);
    assert(it.tilt > 60, 'bar washes the stage above: ' + it.name);
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
function verifyPersistentCoverage() {
  const sources = SIM.emitters(), native = [], persistent = SIM.persistentLighting.emitters();
  church.scene.traverse(o => { if (o.isLight && o.userData.emitter && o.intensity > 0) native.push(o.userData.emitter); });
  const equal = (a, b) => a.id === b.id && Math.hypot(...a.pos.map((v, k) => v - b.pos[k])) < 0.0001;
  for (const source of sources) {
    assert.equal([...native, ...persistent].filter(e => equal(source, e)).length, 1, 'every active emitter illuminates exactly once: ' + source.id);
  }
  assert.equal(native.length + persistent.length, sources.length, 'complete source coverage without double illumination');
  assert.equal(SIM.poolStats().culled, 0, 'no switched-on source loses its light spill');
}
verifyRenderOrigins();
// Retina sharpness stays at the viewer's original 1.5 ratio at every light budget.
for (const quality of ['high', 'balanced', 'fast']) {
  SIM.setSetting('quality', quality);
  assert.equal(sandbox.window.model.renderer.pixelRatio, 1.5, 'quality retains original screen sharpness: ' + quality);
}
// Sample the front-facing plaster: the former gap was at +8.4–11 m. Since the CAD
// facade of 23 Oct 2026 the faces step back as they rise (facade.js): the cornice
// and plinth at x ≈ 2.0, the central piers at 2.30, the tympanum at 3.23, the
// side-bay walls at 4.02 and the niche aedicule at 3.81–3.92, up to the cross.
const facadeIds = new Set(SIM.state.items.filter(it => /^(Façade wash|Central gable flood|Central crown wash) ·/.test(it.name)).map(it => it.id));
const facadeSources = SIM.emitters().filter(e => facadeIds.has(e.id));
const facadeSamples = [];
const faceX = (y, z) => y < 9.75 ? 2.0 : y <= 15.84 ? (Math.abs(z) > 2.5 ? 2.29 : 3.22) : 3.80;
for (const y of [7.5, 8.5, 9.5, 10.25, 11, 13, 15, 17, 19, 21.5, 23.5]) {
  for (const z of (y <= 15 ? [-3, 0, 3] : [0])) {
    const lux = P.illuminance([faceX(y, z), y, z], [-1, 0, 0], facadeSources);
    facadeSamples.push({y,z,lux:+lux.toFixed(1)});
    assert(lux >= 5, 'continuous center facade coverage at y=' + y + ', z=' + z + ': ' + lux);
  }
}
for (const z of [-5.35, 5.35]) for (const [x, y] of [[2.0, 9.5], [4.0, 11.5], [4.0, 14], [3.37, 16]]) {
  assert(P.illuminance([x, y, z], [-1, 0, 0], facadeSources) >= 5, 'side bay is covered: ' + y + '/' + z);
}
console.log(JSON.stringify({ facadeCoverage: 'passed', samples: facadeSamples }));
for (const s of [-1, 1]) {
  camera.position.set(16.725, 2.6, s * 15.5); camera.lookAt(16.725, 2.4, s * 10.55);
  SIM.setSetting('quality', 'balanced');
  SIM.setSetting('quality', 'fast');
  SIM.frame(0.05, 'walk', camera);
  verifyRenderOrigins();
  verifyPersistentCoverage();
  const drawnIds = new Set();
  church.scene.traverse(o => { if (o.isPointLight && o.userData.emitter && o.intensity > 0) drawnIds.add(o.userData.emitter.id); });
  const pair = SIM.state.items.filter(it => it.name.startsWith(`Side door lantern · ${s < 0 ? 'B' : 'H'} · 16.725`));
  assert(pair.every(it => drawnIds.has(it.id)), 'both lanterns of the visible doorway receive real light even at fast quality');
}
camera.position.set(20, 1.6, 0); camera.lookAt(20, 1.6, -1);
SIM.setSetting('quality', 'balanced');

// Moving far away, including changing between inside and outside, retains
// every emitter. Switching/dimming/removing a remote light updates the atlas.
for (const [position, target] of [[[0, 20, 90], [25, 5, 0]], [[-95, 30, 0], [2.45, 10, 0]], [[25, 1.6, 0], [40, 2, 0]]]) {
  camera.position.set(...position); camera.lookAt(...target);
  SIM.setSetting('quality', 'fast'); SIM.frame(0.05, 'explore', camera);
  verifyPersistentCoverage();
}
const remote = SIM.state.items.find(it => it.name === 'Side door lantern · B · 34.725 · rear');
const originalDim = remote.dim;
SIM.update(remote.id, { dim: 0.3 }, { record: false });
SIM.setSetting('quality', 'fast'); SIM.frame(0.05, 'explore', camera);
verifyPersistentCoverage();
assert(Math.abs([...SIM.persistentLighting.emitters()].find(e => e.id === remote.id).lumens - 270) < 0.001, 'remote lamp dimmer updates persistent illumination');
SIM.update(remote.id, { on: false }, { record: false });
SIM.setSetting('quality', 'fast'); SIM.frame(0.05, 'explore', camera);
verifyPersistentCoverage();
assert(!SIM.persistentLighting.emitters().some(e => e.id === remote.id), 'switched-off remote lamp removes its light spill');
SIM.update(remote.id, { on: true, dim: originalDim }, { record: false });
camera.position.set(20, 1.6, 0); camera.lookAt(20, 1.6, -1);
SIM.setSetting('quality', 'balanced'); SIM.frame(0.05, 'walk', camera);
verifyPersistentCoverage();
// A lamp's shadow slot stays on that lamp across viewpoints and light budgets.
// Room bounce and fixed exposure must not brighten the entire model when the
// camera enters the building or the roof is removed.
const shadowSources = () => {
  const ids = [];
  church.scene.traverse(o => { if (o.isSpotLight && o.castShadow && o.userData.emitter) ids.push(o.userData.emitter.id); });
  return ids.join(',');
};
let stableShadowIds, stableAmbient;
for (const quality of ['high', 'balanced', 'fast']) {
  for (const p of [[7, 1.6, 0], [28, 1.6, 0], [44, 1.6, 0], [-90, 30, 0]]) {
    camera.position.set(...p); camera.lookAt(45, 2, 0);
    SIM.setSetting('quality', quality); SIM.frame(0.05, 'walk', camera);
    verifyPersistentCoverage();
    const ids = shadowSources();
    if (stableShadowIds === undefined) stableShadowIds = ids;
    assert.equal(ids, stableShadowIds, 'same shadow lamps across near/far views and every quality');
    const hemi = sandbox.window.model.hemisphere;
    const ambient = JSON.stringify([hemi.intensity, hemi.color.toArray(), hemi.groundColor.toArray(), SIM.ambient().adaptLux]);
    if (stableAmbient === undefined) stableAmbient = ambient;
    assert.equal(ambient, stableAmbient, 'camera movement preserves ambient brightness, colour and fixed exposure');
  }
}
assert.equal(stableShadowIds.split(',').length, 2, 'two permanent altar shadow sources');
const shadowItem = SIM.item(stableShadowIds.split(',')[0]);
SIM.update(shadowItem.id, {on:false}, {record:false}); SIM.setSetting('quality', 'fast'); SIM.frame(0.05, 'walk', camera);
assert.equal(shadowSources(), stableShadowIds.split(',')[1], 'turning a shadow lamp off does not reassign its slot to another lamp');
SIM.update(shadowItem.id, {on:true}, {record:false});
SIM.setSetting('quality', 'balanced'); SIM.frame(0.05, 'walk', camera);
console.log(JSON.stringify({ stableInteriorLighting: 'passed', shadowIds: stableShadowIds, ambient: JSON.parse(stableAmbient) }));

// --- Analysis ---------------------------------------------------------------
const A = SIM.analysis;
function runSync(kinds) {
  return new Promise(resolve => { const off = SIM.on('analysis', r => { off(); resolve(r); }); A.run(kinds); });
}
(async () => {
  await new Promise(r => setTimeout(r, 400));
  let analysisRequests = 0;
  const stopAnalysis = SIM.on('analysis-needed', () => analysisRequests++);
  const oldHalos = SIM.state.settings.halos;
  SIM.setSetting('halos', .3);
  await new Promise(r => setTimeout(r, 180));
  assert.equal(analysisRequests, 0, 'display preferences do not launch full analyses');
  SIM.setSetting('halos', oldHalos);
  SIM.setSetting('occupancy', SIM.state.settings.occupancy);
  await new Promise(r => setTimeout(r, 180));
  assert.equal(analysisRequests, 1, 'physical settings still invalidate analysis');
  stopAnalysis();
  SIM.frame(0.016, 'walk', camera);
  const fanBefore = SIM.fans();
  for (const fx of SIM.fixtures.values()) if (fx.osc && fx.type.fan?.oscillate) fx.update();
  const fanAfter = SIM.fans();
  for (let i = 0; i < fanBefore.length; i++) for (let k = 0; k < 3; k++) assert(Math.abs(fanBefore[i].pos[k] - fanAfter[i].pos[k]) < 1e-12, 'lightweight animation preserves the physical fan source position');
  const gridBuilds = SIM.persistentLighting.stats().gridBuilds;
  sandbox.window.model.renderer.shadowMap.needsUpdate = false;
  const oldCamera = camera.position.clone();
  camera.position.x += 1;
  await new Promise(r => setTimeout(r, 300));
  SIM.frame(0.016, 'walk', camera);
  assert.equal(sandbox.window.model.renderer.shadowMap.needsUpdate, false, 'camera-only light reassignment keeps cached shadows');
  assert.equal(SIM.persistentLighting.stats().gridBuilds, gridBuilds, 'camera movement does not rebuild spatial light lists');
  camera.position.copy(oldCamera);
  const r = await runSync(['seats', 'lux', 'sti', 'air', 'noise']);
  const s = r.seats;
  assert(s.n >= 300, 'seats evaluated');
  // The HUD and analysis must use the same physical measurement planes.
  for (const seat of [s.seats[0], s.seats[Math.floor(s.n / 2)], s.seats.find(x => x.block === 'wing')]) {
    const point = A.pointValues(seat.x, seat.z, seat.y + 1.2);
    for (const key of ['lux', 'sti', 'spl', 'noise', 'air']) {
      assert(Math.abs(point[key] - seat[key]) < 1e-6, `point/seated ${key} agrees at ${seat.x},${seat.z}: ${point[key]} / ${seat[key]}`);
    }
  }
  for (const key of ['spl', 'noise']) {
    const levels = s.seats.map(x => x[key]).filter(Number.isFinite);
    const expected = 10 * Math.log10(levels.reduce((sum, L) => sum + 10 ** (L / 10), 0) / levels.length);
    assert(Math.abs(s[key].avg - expected) < 1e-9, `${key} seating average reconciles with individual energy readings`);
  }
  const power = SIM.powerSummary();
  assert(Math.abs(power.total - power.byCircuit.reduce((sum, c) => sum + c.watts, 0)) < 1e-8, 'power reconciles by circuit');
  assert(Math.abs(power.kWhService - power.total / 1000 * SIM.state.settings.serviceHours) < 1e-9, 'service energy uses kW × hours');
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
  target(!A.checks.some(c => c.level === 'warn'), 'No design warnings', A.checks.filter(c => c.level === 'warn').map(c => c.title + ' ' + c.detail).join('; '));
  target(s.luxOk >= 95, 'At least 95% of seats reach 200 lux', `${s.luxOk.toFixed(1)}%`);
  // Nave seats: the brief's main target. Wing benches (choir, ministers) sit
  // beside the sanctuary with their own pendant speakers; check them apart.
  const nave = s.seats.filter(x => x.block !== 'wing'), wingSeats = s.seats.filter(x => x.block === 'wing');
  const naveOk = 100 * nave.filter(x => x.sti >= 0.6).length / nave.length, naveMin = Math.min(...nave.map(x => x.sti));
  const wingAvg = wingSeats.reduce((t, x) => t + x.sti, 0) / wingSeats.length, wingMin = Math.min(...wingSeats.map(x => x.sti));
  console.log(JSON.stringify({ naveStiOk: Math.round(naveOk), naveStiMin: +naveMin.toFixed(3), wingStiAvg: +wingAvg.toFixed(3), wingStiMin: +wingMin.toFixed(3), wingLuxMin: Math.round(Math.min(...wingSeats.map(x => x.lux))) }));
  assert.equal(wingSeats.length, 80, 'wing benches are analysed');
  target(Math.min(...wingSeats.map(x => x.lux)) >= 200, 'Every wing seat reaches 200 lux', `${Math.min(...wingSeats.map(x => x.lux)).toFixed(1)} lux minimum`);
  target(naveMin >= 0.45 && naveOk >= 75, 'Nave clarity: minimum 0.45, at least 75% reaching 0.60', `minimum ${naveMin.toFixed(3)}, ${naveOk.toFixed(1)}% reaching 0.60`);
  target(wingMin >= 0.45 && wingAvg >= 0.5, 'Wing clarity: minimum 0.45, average 0.50', `minimum ${wingMin.toFixed(3)}, average ${wingAvg.toFixed(3)}`);
  // Toggling a circuit changes light; history restores it.
  const before = s.lux.avg;
  SIM.applyScene('All off');
  const offStats = (await runSync(['seats'])).seats;
  const off = offStats.lux.avg, offPower = SIM.powerSummary();
  assert(off < before * 0.3, 'all-off scene removes most reading light: ' + off);
  assert(offPower.total > 0 && Math.abs(offPower.total - offPower.byCircuit.find(c => c.circuit === 'E1').watts) < 1e-9, 'all-off power contains only maintained exit signs');
  assert(offPower.byCircuit.filter(c => c.circuit !== 'E1').every(c => c.watts === 0), 'all non-emergency circuits draw zero when off');
  assert.equal(offStats.air.avg, 0, 'all-off fan airflow is zero');
  assert(Math.abs(offStats.noise.avg - SIM.state.settings.ambientDbA) < 1e-9, 'all-off noise equals assumed ambient');
  assert.equal(offStats.spl, null, 'all-off scene has no invented speech level');
  assert.equal(offStats.sti, null, 'all-off scene has no invented clarity');
  assert(SIM.undo(), 'undo scene');
  const back = (await runSync(['seats'])).seats.lux.avg;
  assert(Math.abs(back - before) < 1, 'undo restores lighting');
  // Export / import round trip.
  const json = JSON.stringify(SIM.exportLayout());
  const n = SIM.importLayout(json);
  assert.equal(n, SIM.state.items.length, 'layout round trip');
  assert(SIM.exportSchedule().split('\n').length === SIM.state.items.length + 1, 'schedule CSV rows');

  // --- Rehearsal -------------------------------------------------------------
  // The technical tours borrow the switches of the simulator, recalculate the
  // figures and give everything back. Nothing is stored and no history step is made.
  {
    const R = SIM.rehearsal, wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    assert.equal(typeof R?.begin, 'function', 'the simulator offers a rehearsal');
    SIM.saveNow(); await wait(900);
    const snap = () => ({ items: JSON.stringify(SIM.state.items), settings: JSON.stringify(SIM.state.settings), scene: SIM.state.scene, history: SIM.state.history.length, future: SIM.state.future.length });
    const was = snap(), stored = storage.get('thachbi.simulator.v1'), writes = storageWrites.count;
    assert(!R.active && R.begin() && R.active && !R.begin(), 'a rehearsal begins once');
    const read = () => { A.run(undefined, { now: true }); return { lux: A.results.seats.lux.avg, kw: SIM.powerSummary().total / 1000, spl: A.results.seats.spl?.avg ?? null }; };
    const db2 = () => SIM.state.items.filter(item => SIM.CIRCUITS[item.circuit]?.board === 'DB2');
    R.scene('All off'); assert.equal(read().lux, 0, 'all-off rehearsal: no light');
    R.circuits({ L1: 1 }); const one = read();
    R.circuits({ L2: 1 }); const two = read();
    assert(one.lux > 0 && two.lux > one.lux && two.kw > one.kw, 'each circuit switched on adds light and power');
    R.circuits({ L1: 0.5, L2: 0.5 }); const half = read();
    assert(half.lux < two.lux && half.kw < two.kw, 'dimming lowers light and power');
    R.scene('Full service · evening'); assert(db2().some(item => item.on), 'the scene lights the DB-2 circuits');
    R.feeder(false); assert(db2().every(item => !item.on) && SIM.powerSummary().byCircuit.filter(c => SIM.CIRCUITS[c.circuit]?.board === 'DB2').every(c => c.watts === 0), 'feeder off: DB-2 draws nothing');
    R.circuits({ L6: 1 }); assert(db2().every(item => !item.on), 'a circuit behind a dead feeder cannot be switched on');
    R.feeder(true); R.scene('Full service · evening'); assert(db2().some(item => item.on), 'feeder on: the scene lights DB-2 again');
    const level = SIM.powerSummary().total; R.setting('mixerDb', 6); assert.equal(SIM.state.settings.mixerDb, 6); assert(SIM.powerSummary().total > level, 'a higher mixer level draws more');
    SIM.commit('not recorded'); assert.equal(SIM.state.history.length, was.history, 'no history step during a rehearsal');
    await wait(900); assert.equal(storageWrites.count, writes, 'nothing is stored during a rehearsal');
    assert(R.end() && !R.active && !R.end(), 'a rehearsal ends once');
    await wait(900);
    assert.deepEqual(snap(), was, 'every switch, setting and the scene are back as they were');
    assert.equal(storage.get('thachbi.simulator.v1'), stored, 'the stored layout is untouched');
    assert.equal(storageWrites.count, writes, 'a rehearsal writes nothing');
    console.log(JSON.stringify({ rehearsal: 'passed', lightByCircuit: [0, Math.round(one.lux), Math.round(two.lux)], dimmedHalf: Math.round(half.lux) }));

    // The tours play against the real engine: every step reads every figure it quotes, and says what the numbers do.
    vm.runInContext(fs.readFileSync(path.join(viewer, 'cinematic-tour.js'), 'utf8'), sandbox, { filename: 'cinematic-tour.js' });
    const cinema = sandbox.window.CHURCH_CINEMA, tours = {};
    for (const id of ['lighting', 'air', 'sound', 'grid']) tours[id] = cinema.rehearseAll(id);
    assert.deepEqual(snap(), was, 'the tours put everything back');
    assert.equal(storageWrites.count, writes, 'the tours write nothing');
    const at = (id, shot, index) => { const step = tours[id].find(row => row.shot === shot && row.index === index); assert(step, `${id}/${shot}#${index} exists`); return step; };
    const v = (id, shot, index, key) => at(id, shot, index).value[key];
    for (const [id, steps] of Object.entries(tours)) {
      assert(steps.length >= 12, `${id} tour: demonstration steps ran`);
      for (const step of steps) {
        assert.equal(step.missing.length, 0, `${step.shot}#${step.index}: every figure the text quotes is read (missing: ${step.missing.join(', ')})`);
        assert(step.note && step.noteVi && !/\{|\}/.test(step.note + step.noteVi), `${step.shot}#${step.index}: explanation in both languages, figures filled`);
        assert(step.say?.[0] && step.say?.[1], `${step.shot}#${step.index}: names the action in both languages`);
      }
    }
    const rise = (id, shot, key, indexes) => indexes.slice(1).forEach((index, i) => assert(v(id, shot, index, key) > v(id, shot, indexes[i], key), `${shot}: ${key} rises from step ${indexes[i]} to ${index}`));
    const fall = (id, shot, key, indexes) => indexes.slice(1).forEach((index, i) => assert(v(id, shot, index, key) < v(id, shot, indexes[i], key), `${shot}: ${key} falls from step ${indexes[i]} to ${index}`));
    // Lighting: each circuit lights its own block; LA/LD and L3 add little light for their power; dimming saves less power than light.
    assert.equal(v('lighting', 'light-build', 0, 'luxAvg'), 0, 'light-build begins in the dark');
    rise('lighting', 'light-build', 'luxAvg', [0, 1, 2, 3]); rise('lighting', 'light-build', 'kw', [0, 1, 2, 3, 4]);
    assert(v('lighting', 'light-build', 3, 'luxMin') > v('lighting', 'light-build', 2, 'luxMin') * 2, 'L8 lifts the darkest seat');
    {
      // The caption says LA, LD and L3 add little light for their power: against the projectors, a small fraction of the lux per kW.
      const gain = (a, b) => (v('lighting', 'light-build', b, 'luxAvg') - v('lighting', 'light-build', a, 'luxAvg')) / (v('lighting', 'light-build', b, 'kw') - v('lighting', 'light-build', a, 'kw'));
      assert(gain(3, 4) < 0.3 * gain(0, 3), `light-build: LA, LD and L3 give ${gain(3, 4).toFixed(0)} lux per kW on the pews against ${gain(0, 3).toFixed(0)} for the projectors`);
    }
    fall('lighting', 'light-dim', 'luxAvg', [0, 1, 2]); fall('lighting', 'light-dim', 'kw', [0, 1, 2]);
    assert((v('lighting', 'light-dim', 0, 'kw') - v('lighting', 'light-dim', 1, 'kw')) / v('lighting', 'light-dim', 0, 'kw') < (v('lighting', 'light-dim', 0, 'luxAvg') - v('lighting', 'light-dim', 1, 'luxAvg')) / v('lighting', 'light-dim', 0, 'luxAvg'), 'dimming saves a smaller share of power than of light');
    assert(Math.abs(v('lighting', 'light-dim', 3, 'luxAvg') - v('lighting', 'light-dim', 0, 'luxAvg')) < 1e-6, 'back to full output restores the light exactly');
    fall('lighting', 'light-scenes', 'kw', [0, 1, 2, 3]); assert(v('lighting', 'light-scenes', 3, 'kw') < v('lighting', 'light-scenes', 2, 'kw') / 2 && v('lighting', 'light-scenes', 3, 'luxAvg') < 5, 'night security: little power and almost no light inside');
    assert.equal(v('lighting', 'light-feeder', 1, 'kwDb2'), 0); assert(v('lighting', 'light-feeder', 1, 'kw') < v('lighting', 'light-feeder', 0, 'kw'), 'feeder off lowers the load');
    assert(Math.abs(v('lighting', 'light-feeder', 1, 'luxAvg') - v('lighting', 'light-feeder', 0, 'luxAvg')) < 1, 'the nave stays lit with the DB-2 feeder off');
    assert(at('lighting', 'light-feeder', 1).rows.filter(row => ['L6', 'L9', 'L10'].some(id => row.name[0].startsWith(id))).every(row => row.tone === 'dead'), 'DB-2 circuits show no power');
    assert(Math.abs(v('lighting', 'light-feeder', 2, 'kwDb2') - v('lighting', 'light-feeder', 0, 'kwDb2')) < 1e-9, 'feeder back on restores DB-2');
    // Fans: air, noise and power rise with speed; more speed gains little comfort; wings and wall fans; exhaust air changes.
    assert.equal(v('air', 'air-speeds', 0, 'airAvg'), 0);
    rise('air', 'air-speeds', 'airAvg', [0, 1, 2, 3]); rise('air', 'air-speeds', 'noise', [1, 2, 3]); rise('air', 'air-speeds', 'kwFan', [0, 1, 2, 3]);
    assert(v('air', 'air-speeds', 2, 'airOk') > v('air', 'air-speeds', 1, 'airOk') && (v('air', 'air-speeds', 3, 'airOk') - v('air', 'air-speeds', 2, 'airOk')) < (v('air', 'air-speeds', 2, 'airOk') - v('air', 'air-speeds', 1, 'airOk')), 'High adds less comfort than Normal');
    assert(v('air', 'air-wings', 0, 'wingAir') < 0.5 * v('air', 'air-wings', 0, 'naveAir'), 'with the ceiling fans only, the wings are much stiller than the nave');
    rise('air', 'air-wings', 'wingAir', [0, 1]); rise('air', 'air-wings', 'noise', [0, 1, 2]);
    assert(v('air', 'air-wings', 2, 'noise') - v('air', 'air-wings', 1, 'noise') > 3, 'the nave wall fans add several dBA');
    assert.equal(v('air', 'air-exhaust', 0, 'ach'), 0); rise('air', 'air-exhaust', 'ach', [0, 1, 2]);
    assert(v('air', 'air-exhaust', 2, 'ach') >= 4 && v('air', 'air-exhaust', 2, 'ach') <= 6, 'exhaust on Normal is inside the aim of 4 to 6 air changes an hour');
    // Sound: zones, the margin before feedback, the mixer level and fan noise.
    assert(!Number.isFinite(v('sound', 'sound-zones', 0, 'splAvg')) && !Number.isFinite(v('sound', 'sound-zones', 0, 'stiAvg')), 'no speech level or clarity with nothing on');
    assert(v('sound', 'sound-zones', 1, 'splAvg') > 60 && Number.isFinite(v('sound', 'sound-zones', 1, 'stiAvg')), 'zone A1 alone gives speech');
    assert(Number.isFinite(v('sound', 'sound-zones', 2, 'fbLow')), 'a margin is found once the microphones are on');
    assert(Math.abs(v('sound', 'sound-zones', 3, 'splAvg') - v('sound', 'sound-zones', 1, 'splAvg')) < 1.5, 'the veranda loudspeakers change little inside');
    assert(v('sound', 'sound-zones', 4, 'stiAvg') < v('sound', 'sound-zones', 3, 'stiAvg') && v('sound', 'sound-zones', 4, 'echo') > 0 && v('sound', 'sound-zones', 4, 'fbLow') < v('sound', 'sound-zones', 3, 'fbLow'), 'the courtyard horns and rear fill blur speech, flag echo and cut the margin');
    const db = (a, b) => v('sound', 'sound-level', a, 'fbLow') - v('sound', 'sound-level', b, 'fbLow');
    assert(Math.abs(db(1, 0) - 6) < 0.5 && Math.abs(db(0, 2) - 6) < 0.5, 'each 6 dB of mixer level moves the margin before feedback by 6 dB the other way');
    assert(v('sound', 'sound-level', 1, 'splAvg') < v('sound', 'sound-level', 0, 'splAvg') && v('sound', 'sound-level', 2, 'splAvg') > v('sound', 'sound-level', 0, 'splAvg'), 'the mixer level moves the speech level');
    assert(Math.abs(v('sound', 'sound-level', 2, 'stiAvg') - v('sound', 'sound-level', 0, 'stiAvg')) < 0.03 && v('sound', 'sound-level', 2, 'fbLow') < 0, 'louder is not clearer, and the margin goes negative');
    assert(Math.abs(v('sound', 'sound-level', 3, 'fbLow') - v('sound', 'sound-level', 0, 'fbLow')) < 1e-9, 'back to the nominal level restores the margin');
    rise('sound', 'sound-fans', 'noise', [0, 1, 2, 3]); fall('sound', 'sound-fans', 'stiAvg', [0, 2, 3]); fall('sound', 'sound-fans', 'stiOk', [0, 2, 3]);
    // Electrical grid: load by scene, the feeder, currents.
    rise('grid', 'grid-scenes', 'kw', [0, 1, 2, 3]);
    for (let index = 0; index < 4; index++) {
      const s = at('grid', 'grid-scenes', index).value;
      assert(Math.abs(s.kwDb1 + s.kwDb2 - s.kw) < 0.005, `grid-scenes#${index}: DB-1 and DB-2 add up to the total`);
      assert(Math.abs(s.amps - s.kw * 1000 / (230 * 0.9)) < 0.1, `grid-scenes#${index}: current is power ÷ (230 V × 0.9)`);
    }
    rise('grid', 'grid-fans', 'kwFan', [0, 1, 2]); rise('grid', 'grid-fans', 'ampsFan', [0, 1]);
    assert(at('grid', 'grid-fans', 0).rows.every(row => row.mcb === undefined || row.mcb >= 6) && at('grid', 'grid-lighting', 0).rows.every(row => row.mcb >= 6 && row.amps <= row.mcb), 'each circuit shown carries less than its breaker');
    assert.equal(v('grid', 'grid-feeder', 1, 'kwDb2'), 0); assert.equal(v('grid', 'grid-feeder', 1, 'ampsDb2'), 0); assert(v('grid', 'grid-feeder', 0, 'kwDb2') > 0 && Math.abs(v('grid', 'grid-feeder', 2, 'kwDb2') - v('grid', 'grid-feeder', 0, 'kwDb2')) < 1e-9);
    console.log(JSON.stringify({ tours: 'passed', steps: Object.fromEntries(Object.entries(tours).map(([id, steps]) => [id, steps.length])) }));
  }
  console.log(JSON.stringify({ checks: 'passed', mode: estimateAudit ? 'calculation audit' : 'calculations and design targets',
    designTargets, allOff: { watts: offPower.total, lux: off, air: offStats.air.avg, noise: offStats.noise.avg, spl: offStats.spl, sti: offStats.sti },
    items: report.items, lux: report.lux, sti: report.sti, air: report.air, noise: report.noise, Tmid: report.room.Tmid }, null, 1));
})().catch(e => { console.error(e); process.exitCode = 1; });
