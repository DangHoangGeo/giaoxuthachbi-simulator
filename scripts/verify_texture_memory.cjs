const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../Thach_Bi_Viewer/texture-memory.js'), 'utf8');
function policy(search) {
  const drawn = [];
  const sandbox = { window: {}, location: { search }, URLSearchParams, document: { createElement() {
    const c = { width: 0, height: 0, getContext() { return { drawImage(source, x, y, w, h) { drawn.push({ source, c, x, y, w, h }); } }; } }; return c;
  } } };
  vm.runInNewContext(code, sandbox);
  const T = { CanvasTexture: class { constructor(image) { this.image = image; this.userData = {}; this.wrapS = 1001; this.colorSpace = ''; } } };
  return { ...sandbox.window.CHURCH_TEXTURES, T, drawn };
}
const full = policy(''), low = policy('?graphics=light');
for (const source of [{ width: 512, height: 512 }, { width: 1024, height: 677 }, { width: 2200, height: 1200 }, { width: 128, height: 128 }]) {
  const dimensions = [source.width, source.height];
  assert.equal(full.create(full.T, source).image, source, 'standard retains original canvas by identity');
  const texture = low.create(low.T, source), image = texture.image;
  assert(image.width <= 512 && image.height <= 512); assert(image.width > 0 && image.height > 0);
  assert.deepEqual([source.width, source.height], dimensions, 'source artwork is never resized or mutated');
  assert(Math.abs(image.width * source.height / source.width - image.height) <= 1, 'aspect ratio preserved within pixel rounding');
  assert.equal(low.create(low.T, source).image, image, 'shared input has one retained display image');
  assert.equal(low.create(low.T, image).image, image, 'reduced input is not reduced again');
  if (source.width > 256 || source.height > 256) {
    assert.deepEqual(Array.from(texture.userData.displayResample.source), dimensions);
    assert.equal(low.create(low.T, image).userData.displayResample, texture.userData.displayResample);
    assert.notEqual(image, source); assert(image.width * image.height <= source.width * source.height * .251);
  }
}
assert.equal(full.drawn.length, 0); assert.equal(low.drawn.length, 3);
assert.equal(low.stats().resampledImages, 3);
console.log(JSON.stringify({ texturePolicy: 'passed', checks: ['standard identity', 'aspect ratio', 'size cap', 'shared canvas reuse', 'idempotence', 'source preservation', 'resampling provenance'], stats: low.stats() }, null, 2));
