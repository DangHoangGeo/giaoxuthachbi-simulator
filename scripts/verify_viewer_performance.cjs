/* Deterministic checks for display policy; no GPU or viewer dependencies. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const events = {}, saved = new Map();
const document = {
  hidden: false, getElementById: () => null,
  addEventListener: (name, fn) => { events[name] = fn; }
};
const sandbox = {
  document, location: { search: '' }, URLSearchParams,
  localStorage: { getItem: k => saved.get(k), setItem: (k, v) => saved.set(k, v) },
  requestAnimationFrame: fn => fn(),
  window: { devicePixelRatio: 2, addEventListener: (name, fn) => { events[name] = fn; } }
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../Thach_Bi_Viewer/viewer-performance.js'), 'utf8'), sandbox);
const policy = sandbox.window.CHURCH_PERFORMANCE;
const viewport = { clientWidth: 1280, clientHeight: 800 };
let pixelRatio = 2;
const renderer = {
  domElement: {}, getPixelRatio: () => pixelRatio,
  setPixelRatio: value => {
    pixelRatio = value;
    renderer.domElement.width = Math.round(viewport.clientWidth * value);
    renderer.domElement.height = Math.round(viewport.clientHeight * value);
  }
};
const camera = { position: { x: 0, y: 1.6, z: 0 }, quaternion: { x: 0, y: 0, z: 0, w: 1 }, zoom: 1, fov: 60 };
policy.prepare(renderer, viewport);
assert.equal(pixelRatio, 1, 'automatic starts with a bounded framebuffer on a Retina screen');
policy.setMode('full'); assert.equal(pixelRatio, 1.5);
policy.setMode('medium'); assert.equal(pixelRatio, 1.125);
policy.setMode('low'); assert.equal(pixelRatio, .75);
policy.setMode('auto');
let now = 1000;
for (let i = 0; i < 400; i++) policy.shouldRender(now += 50, camera);
assert.equal(pixelRatio, .5, 'sustained slow frames reach but never pass the automatic floor');
policy.setMode('full');
for (let i = 0; i < 200; i++) policy.shouldRender(now += 80, camera);
assert.equal(pixelRatio, 1.5, 'manual resolution is respected even on slow frames');
policy.invalidate(); assert.equal(policy.shouldRender(now += 40, camera), true);
assert.equal(policy.shouldRender(now += 10, camera), false, 'unchanged view skips excess idle renders');
camera.position.x += .01;
assert.equal(policy.shouldRender(now += 10, camera), true, 'navigation renders without idle throttling');
assert.equal(policy.shouldRender(now += 10, camera), false);
policy.invalidate(); assert.equal(policy.shouldRender(now += 1, camera), true, 'equipment/UI changes invalidate the idle view');
policy.setMode('auto');
document.hidden = true; events.visibilitychange();
for (let i = 0; i < 100; i++) policy.shouldRender(now += 1000, camera);
document.hidden = false; events.visibilitychange();
policy.shouldRender(now += 1000, camera);
assert.equal(pixelRatio, 1, 'hidden time never reduces automatic resolution');
viewport.clientWidth = 3840; viewport.clientHeight = 2160; events.resize();
assert.equal(pixelRatio, .5, 'large viewport uses a bounded automatic pixel budget');
console.log('Display policy checks passed: manual/automatic resolution, idle/navigation, invalidation, visibility and resize.');
