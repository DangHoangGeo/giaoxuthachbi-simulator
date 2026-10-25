/* Catalogue sculpture checks without a GPU. Freeze extents against the earlier
 * coordinated catalogue, check finite buffers, determinism and rendering cost.
 * Niche placement and saved-layout behaviour belong to verify_simulator.cjs. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const sandbox = { console, window: {} };
vm.createContext(sandbox);
const source = fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/bundle.js'), 'utf8');
const cut = source.indexOf('    Us = document.getElementById("viewport"),');
assert(cut > 0, 'Known THREE boundary before renderer/UI startup');
vm.runInContext(source.slice(0, cut) + '    Us=null;window.T=Ec;})();', sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/simulator/catalog.js'), 'utf8'), sandbox);
const T = sandbox.window.T, catalog = sandbox.window.CHURCH_SIM_CATALOG, makeKit = catalog.makeKit(T);
const previous = JSON.parse(fs.readFileSync(path.join(root, 'review/sculpture-detail-2026-10-25/bounds-before.json'), 'utf8'));
const figures = ['statueMary', 'statueJoseph', 'statueSacredHeart', 'statueAssumption', 'statuePeter', 'statuePaul'];
function inspect(id) {
  const kit = makeKit(); catalog.byId[id].build(kit, {});
  assert.equal(kit.glows?.length || 0, 0, 'Sculpture creates no lamp: ' + id);
  const bounds = new T.Box3(), hash = crypto.createHash('sha256');
  let triangles = 0;
  for (const part of Object.values(kit.parts).flat()) {
    assert(catalog.MATERIALS[part.mat], 'Known finish: ' + part.mat);
    for (const name of ['position', 'normal']) {
      const attribute = part.geo.attributes[name]; assert(attribute, id + ': ' + name);
      assert(attribute.array.every(Number.isFinite), id + ': finite ' + name);
      hash.update(Buffer.from(attribute.array.buffer, attribute.array.byteOffset, attribute.array.byteLength));
    }
    if (part.geo.index) {
      assert(part.geo.index.array.every(i => i >= 0 && i < part.geo.attributes.position.count), id + ': valid triangle indices');
      hash.update(Buffer.from(part.geo.index.array.buffer, part.geo.index.array.byteOffset, part.geo.index.array.byteLength));
    }
    hash.update(JSON.stringify(part.matrix.elements));
    hash.update(part.mat);
    const geometry = part.geo.clone().applyMatrix4(part.matrix);
    geometry.computeBoundingBox(); bounds.union(geometry.boundingBox);
    triangles += (geometry.index?.count || geometry.attributes.position.count) / 3;
    geometry.dispose();
  }
  assert(triangles < 70000, id + ': sculpture triangle budget, ' + triangles);
  for (const end of ['min', 'max']) for (let i = 0; i < 3; i++) {
    assert(Math.abs(bounds[end].getComponent(i) - previous[id][end][i]) < 1e-6, id + ': retained envelope ' + end + ' axis ' + i);
  }
  return { min: bounds.min.toArray(), max: bounds.max.toArray(), triangles, fingerprint: hash.digest('hex') };
}
const results = {};
for (const id of figures) {
  const first = inspect(id), second = inspect(id);
  assert.equal(first.fingerprint, second.fingerprint, id + ': deterministic geometry and transforms');
  results[id] = first;
}
console.log(JSON.stringify({ checks: 'passed', envelopeToleranceMetres: 1e-6, figures: results }, null, 2));
