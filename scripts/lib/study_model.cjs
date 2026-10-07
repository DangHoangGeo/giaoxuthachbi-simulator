/* Headless study adapter. Loads the actual viewer geometry and simulator;
 * only browser/GPU/audio services are stubbed, as in verify_simulator.cjs.
 * It has isolated in-memory storage and never reads a user's saved layout. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const modules = ['texture-memory.js', 'render-batches.js', 'references.js', 'glass-art.js', 'carving.js', 'sanctuary.js', 'realism.js', 'planning.js', 'simulator/physics.js', 'simulator/catalog.js', 'simulator/engine.js', 'simulator/light-grid.js', 'simulator/persistent-lighting.js', 'simulator/design.js', 'simulator/analysis.js', 'simulator/electrical.js'];
function loadStudyModel() {
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const cancel = id => { clearTimeout(id); timers.delete(id); };
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ getImageData: () => ({ data: new Uint8ClampedArray(512 * 512 * 4) }), createLinearGradient: () => gradient, createRadialGradient: () => gradient, measureText: () => ({ width: 120 }) }, { get: (o, k) => k in o ? o[k] : () => {}, set: (o, k, v) => { o[k] = v; return true; } });
  const element = () => ({ width: 512, height: 512, style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, getContext: () => ctx, addEventListener() {}, setAttribute() {}, append() {}, appendChild() {} });
  const body = element(); body.dataset.lighting = 'evening';
  const storage = new Map(), listeners = {};
  const sandbox = { console, document: { getElementById: () => null, createElement: element, body, querySelector: () => null, querySelectorAll: () => [] }, devicePixelRatio: 2, location: { search: '' }, URLSearchParams, Uint8ClampedArray, performance, setTimeout: later, clearTimeout: cancel, localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)) }, MutationObserver: class { observe() {} }, requestAnimationFrame: () => 0 };
  sandbox.window = sandbox;
  sandbox.addEventListener = (e, f) => { (listeners[e] ||= []).push(f); };
  vm.createContext(sandbox);
  for (const name of modules) vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer', name), 'utf8'), sandbox, { filename: name });
  let source = fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/bundle.js'), 'utf8');
  const begin = source.indexOf('    Us = document.getElementById("viewport"),');
  const end = source.indexOf('  var ce = {};', begin);
  assert(begin > 0 && end > begin, 'bundle renderer adapter anchors changed');
  source = source.slice(0, begin) + `    ni = {pixelRatio:1, setPixelRatio(r){this.pixelRatio=r}, capabilities:{getMaxAnisotropy:()=>8, maxFragmentUniforms:1024}, shadowMap:{enabled:true}, toneMappingExposure:1, domElement:{addEventListener(){}, getBoundingClientRect(){return {left:0,top:0,width:1280,height:800}}, height:800}};
    var ii=new Ti(),xn=new Cs(),Fp=new Cs(),X0=new xr();ii.background=new De('#d9e4e9');ii.add(xn,Fp,X0);
  ` + source.slice(end);
  const ui = source.lastIndexOf('  z0({');
  assert(ui > 0, 'bundle UI adapter anchor changed');
  source = source.slice(0, ui) + 'window.model={THREE:Ec,building:nn,scene:ii,renderer:ni,data:ti,interior:Qo};\n})();';
  vm.runInContext(source, sandbox, { timeout: 120000, filename: 'bundle.js' });
  const model = sandbox.model, T = model.THREE, SIM = sandbox.CHURCH_SIMULATOR;
  const camera = new T.PerspectiveCamera(50, 1.6, .05, 500); camera.position.set(20, 1.6, 0);
  SIM.start({ scene: model.scene, renderer: model.renderer, colliders: [], walkCamera: { aspect: 1.6, fov: 68, updateProjectionMatrix() {} }, walk: { eyeHeight: 1.65, speed: 2.05 }, places: {}, goTo() {}, setMode() {}, uiState: () => ({ roof: true }), camera, controls: { target: new T.Vector3(), update() {} } });
  assert(SIM.ready, 'simulator failed to initialise');
  return { SIM, model, P: sandbox.CHURCH_SIM_PHYSICS, CAT: sandbox.CHURCH_SIM_CATALOG,
    dispose() { for (const timer of timers) clearTimeout(timer); timers.clear(); },
    analyse() { return new Promise((resolve, reject) => {
      const timeout = later(() => { off(); reject(new Error('Seat analysis exceeded 180 seconds')); }, 180000);
      const off = SIM.on('analysis', result => { cancel(timeout); off(); resolve(result); });
      SIM.analysis.run(['seats']);
    }); }
  };
}
module.exports = { loadStudyModel, root, sources: modules.map(n => 'Thach_Bi_Viewer/' + n).concat('Thach_Bi_Viewer/bundle.js') };
