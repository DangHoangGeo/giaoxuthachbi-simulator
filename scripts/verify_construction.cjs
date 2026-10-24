/* Headless checks for the site view (Thach_Bi_Viewer/construction.js).
 *
 * Runs the real bundled geometry builders without a GPU (same loader as
 * verify_model.cjs) and checks that:
 *  - every architectural mesh is assigned to a known construction layer, and
 *    named reference parts land in the expected layer;
 *  - ordering the display batches by layer keeps exactly the same geometry
 *    (index counts and an order-independent position checksum per batch), and
 *    the recorded layer ranges tile each batch without gaps or overlaps;
 *  - the generated data is current, the workbook's model grid equals the
 *    viewer's grid, every grid spacing in the dimension register agrees with
 *    the model grid, and every phase names existing layers and known gates;
 *  - site records are only read or written outside the public visit.
 * Software checks only; nothing here approves a dimension or a programme.
 * Run from the repository root: node scripts/verify_construction.cjs
 */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const viewer = file => path.join(root, 'Thach_Bi_Viewer', file);

execFileSync('python3', [path.join(root, 'scripts/build_construction_data.py'), '--check'], { stdio: 'inherit' });

const gradient = { addColorStop() {} };
const ctx = new Proxy({
  getImageData() { return { data: new Uint8ClampedArray(512 * 512 * 4) }; },
  createLinearGradient() { return gradient; }, createRadialGradient() { return gradient; },
  measureText() { return { width: 120 }; },
}, { get(t, k) { return k in t ? t[k] : () => {}; }, set(t, k, v) { t[k] = v; return true; } });
const document = {
  getElementById() { return null; },
  createElement() { return { width: 512, height: 512, getContext() { return ctx; } }; },
  documentElement: { classList: { contains: () => false } },
};
const sandbox = { console, document, location: { search: '' }, URLSearchParams, Uint8ClampedArray, window: {} };
vm.createContext(sandbox);
for (const file of ['construction-data.js', 'construction.js', 'texture-memory.js', 'render-batches.js', 'references.js', 'glass-art.js', 'carving.js', 'sanctuary.js', 'facade.js', 'porches.js', 'stations.js', 'towers.js', 'realism.js', 'planning.js'])
  vm.runInContext(fs.readFileSync(viewer(file), 'utf8'), sandbox);
let src = fs.readFileSync(viewer('bundle.js'), 'utf8');
const begin = src.indexOf('    Us = document.getElementById("viewport"),');
const end = src.indexOf('  var ce = {};', begin);
assert(begin > 0 && end > begin, 'bundle renderer block found');
src = src.slice(0, begin) + `    ni = {capabilities:{getMaxAnisotropy:()=>8},shadowMap:{},toneMappingExposure:1};
  var ii = new Ti(), xn = new Cs(), Fp = new Cs(), X0 = new xr();
  ii.background = new De('#d9e4e9'); ii.add(xn,Fp,X0);
` + src.slice(end);
const ui = src.lastIndexOf('  z0({');
assert(ui > 0, 'viewer start-up call found');
src = src.slice(0, ui) + '  window.model={THREE:Ec,building:nn,data:ti,batches:t_};\n})();';
assert(src.includes('window.CHURCH_CONSTRUCTION?.prepare('), 'bundle prepares the site view');
assert(src.includes('window.CHURCH_CONSTRUCTION?.bindBatches(t_)'), 'bundle binds the site view to the display batches');
vm.runInContext(src, sandbox, { timeout: 120000 });

const { THREE: T, building, data, batches } = sandbox.window.model;
const C = sandbox.window.CHURCH_CONSTRUCTION, DATA = sandbox.window.CHURCH_CONSTRUCTION_DATA;
const layerIds = new Set(C.LAYERS.map(l => l.id));

// 1. Classification of every architectural mesh.
const bySource = new Map(), layerCount = {};
for (const source of building.children) {
  source.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    const layer = C.layerOf(o, source);
    assert(layerIds.has(layer), `${o.name} in ${source.name}: unknown layer ${layer}`);
    layerCount[layer] = (layerCount[layer] || 0) + 1;
    if (!bySource.has(source)) bySource.set(source, []);
    bySource.get(source).push({ o, layer });
  });
}
for (const l of C.LAYERS) if (!l.special) assert(layerCount[l.id] > 0, `layer ${l.id} has parts`);
const expect = {
  'Central column 5/D — illustrative diameter': 'columns', 'Column head +9.402': 'columns',
  'Main tie beam 0.30 × 0.59 m · as drawn': 'frame', 'Purlin · as drawn spacing ~0.50 m': 'frame', 'Queen post · reference': 'frame',
  'Continuous principal roof, valley clipped': 'roof', 'Terracotta half-round ridge cap': 'roof',
  'Outer window clear glass body': 'openings', 'Exterior timber door leaf': 'openings',
  'Inner C–G floor at ±0.000 — buildup schematic': 'floors', 'Side stair riser': 'plinth',
  'Schematic arch moulding': 'ornament', 'Main tie beam carved haunch': 'ornament', 'Column carving · capital foliage': 'ornament',
  'Sanctuary back wall behind the reredos': 'walls', 'Schematic block': 'walls', 'Window low parapet': 'walls',
  'Proposed central aisle stone inlay': 'finishes', 'Pew seat': 'furniture', 'Tree trunk': 'site', 'Gilded floral relief': 'sanctuary',
};
const seen = new Set();
// The reredos reuses some part names (column carving); it is one sanctuary layer by design.
for (const [source, parts] of bySource) for (const { o, layer } of parts) if (expect[o.name] && (expect[o.name] === 'sanctuary' || !/^Reference sanctuary/.test(source.name))) {
  assert.equal(layer, expect[o.name], `${o.name} belongs to ${expect[o.name]}`);
  seen.add(o.name);
}
// The timber frames, proposed truss bracing and the frame's purlins are added by
// the simulator at start-up (not built here): classify their real names directly.
const frameParts = {
  'Main tie beam 0.30 × 0.59 m · as drawn': ['Timber frame · as drawn (round shafts and tie beams)', 'frame'],
  'Main tie beam carved haunch': ['Timber frame · as drawn (round shafts and tie beams)', 'ornament', 'CONCEPT ORNAMENT · NOT STRUCTURAL'],
  'Column carving · capital foliage': ['Timber frame · as drawn (round shafts and tie beams)', 'ornament'],
  'Central column 7/E — illustrative diameter': ['Timber frame · as drawn (round shafts and tie beams)', 'columns', 'SCHEMATIC'],
  'Column head +9.402': ['Timber frame · as drawn (round shafts and tie beams)', 'columns', 'SCHEMATIC'],
  'Queen post · reference': ['Timber frame · reference interior (posts, collars, arch braces)', 'frame'],
  'Square timber post · reference': ['Timber frame · reference interior (posts, collars, arch braces)', 'columns'],
  'Capital bolster under the plate': ['Timber frame · reference interior (posts, collars, arch braces)', 'columns'],
  'Purlin · as drawn spacing ~0.50 m': ['Roof assembly — toggle', 'frame', 'AS DRAWN · SECTION SHEET 4'],
  'Proposed roof truss diagonal': ['Proposed truss bracing and purlins — not on the drawings', 'frame'],
};
for (const [name, [group, layer, status]] of Object.entries(frameParts)) {
  delete expect[name];
  assert.equal(C.layerOf({ name, userData: { status: status || '' } }, { name: group }), layer, `${name} in ${group} belongs to ${layer}`);
}
assert.deepEqual([...seen].filter(n => n in expect).sort(), Object.keys(expect).sort(), 'every reference part was found in the model');

// 2. Display batches: same geometry, ranges tile each batch by layer.
let checkedBatches = 0, checkedIndices = 0;
const p = new T.Vector3();
for (const [source, display] of batches) {
  const parts = bySource.get(source) || [];
  for (const mesh of display.children) {
    const ranges = mesh.userData.layerRanges;
    assert(Array.isArray(ranges), `${source.name}: batch has layer ranges`);
    const own = parts.filter(({ o }) => o.material === mesh.material);
    const count = own.reduce((n, { o }) => n + (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count), 0);
    assert.equal(mesh.geometry.index.count, count, `${source.name}: index count unchanged`);
    let next = 0;
    for (const r of ranges) {
      assert.equal(r.start, next, `${source.name}: ranges are contiguous`);
      const expected = own.filter(x => x.layer === r.layer).reduce((n, { o }) => n + (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count), 0);
      assert.equal(r.count, expected, `${source.name}: range ${r.layer} holds exactly that layer`);
      next += r.count;
    }
    assert.equal(next, count, `${source.name}: ranges cover the batch`);
    assert.equal(new Set(ranges.map(r => r.layer)).size, ranges.length, `${source.name}: one range per layer`);
    // Order-independent checksum of all vertex positions.
    let a = 0, b = 0;
    for (const { o } of own) { const pos = o.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); a += p.x + p.y * 3 + p.z * 7; } }
    const merged = mesh.geometry.attributes.position;
    for (let i = 0; i < merged.count; i++) b += merged.getX(i) + merged.getY(i) * 3 + merged.getZ(i) * 7;
    assert(Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a)) + 1e-3, `${source.name}: merged positions unchanged (${a} vs ${b})`);
    checkedBatches++; checkedIndices += count;
  }
}

// 3. Data: workbook grid equals the viewer grid; grid spacings agree.
const near = (a, b) => Math.abs(a - b) < 5e-4;
for (const [axis, key] of [['X', 'longitudinal'], ['Z', 'transverse']]) {
  for (const [name, value] of Object.entries(data[key])) {
    const row = DATA.grid.find(r => r.axis3d === axis && r.name === name);
    assert(row, `workbook Model grid has ${axis} axis ${name}`);
    assert(near(row.m, value), `axis ${name}: workbook ${row.m} m, viewer ${value} m`);
  }
}
const checks = DATA.dimensions.map(r => ({ r, c: C.modelCheck(r) })).filter(x => x.c);
assert(checks.length >= 20, `grid-spacing records are recognised (${checks.length})`);
const differ = checks.filter(x => Math.abs(x.c.diff) >= .5);
assert.deepEqual([...differ.map(x => `${x.r.id} ${x.c.a}→${x.c.b}: drawing ${x.r.mm}, model ${x.c.model}`)], [], 'every grid spacing in the register agrees with the model');
for (const phase of DATA.phases.phases) {
  for (const l of phase.layers) assert(layerIds.has(l), `${phase.id} names layer ${l}`);
}
const covered = new Set(DATA.phases.phases.flatMap(ph => ph.layers));
for (const l of C.LAYERS) assert(covered.has(l.id), `layer ${l.id} belongs to a phase`);

// 4. Site records stay out of the public visit.
const code = fs.readFileSync(viewer('construction.js'), 'utf8');
const storage = code.split('\n').filter(line => line.includes('localStorage'));
assert(storage.length === 2, 'two storage accesses (read at start, write in saveRecord)');
assert(storage[0].includes('if (!VISIT)'), 'record is read only outside the public visit');
assert(/function saveRecord\(\) \{\n\s+if \(VISIT\) return;/.test(code), 'record is written only outside the public visit');
assert(!/thachbi\.simulator\.v1/.test(code), 'the site view never touches the simulator layout');

console.log(`Site view checks passed: ${Object.values(layerCount).reduce((a, b) => a + b, 0)} meshes in ${Object.keys(layerCount).length} layers `
  + `(${C.LAYERS.filter(l => !l.special).map(l => `${l.id} ${layerCount[l.id]}`).join(', ')}); `
  + `${checkedBatches} display batches, ${checkedIndices} indices, geometry unchanged; `
  + `${checks.length} grid spacings agree with the model; ${DATA.dimensions.length} dimension records, ${DATA.issues.length} open items, ${DATA.phases.phases.length} phases.`);
