/* Conservative display-light lists, independent of analysis. A cell drops a spot
 * only when its whole bounding sphere misses the infinite outer cone. Point
 * lights have no distance cutoff. Outside this domain the shader uses all lamps.
 */
(() => {
  'use strict';
  const min = [-24, -4, -32], dimensions = [22, 11, 16], step = 4;
  const cells = dimensions.reduce((a, b) => a * b, 1);
  const radius = Math.sqrt(3) * step / 2 + 0.002;
  function cellAt(p) {
    const a = p.map((v, k) => Math.floor((v - min[k]) / step));
    return a.every((v, k) => v >= 0 && v < dimensions[k]) ? a[0] + dimensions[0] * (a[1] + dimensions[1] * a[2]) : -1;
  }
  function intersects(source, centre) {
    if (source.kind !== 'spot' || !source.dir || !source.pos) return true;
    // Match uploaded floats and err on the side of including uncertain sources.
    const d = source.dir.map(Math.fround), c = Math.fround(source.cosOuter);
    const norm = Math.hypot(...d);
    if (!(c > 0 && c < 1) || !Number.isFinite(norm) || Math.abs(norm - 1) > 1e-5) return true;
    const v = centre.map((x, k) => x - Math.fround(source.pos[k]));
    if (!v.every(Number.isFinite)) return true;
    // Inflate the cone slightly to cover axis quantization in the GPU dot product.
    const cosine = Math.max(0, c - 0.000002), sine = Math.sqrt(1 - cosine * cosine);
    const t = v.reduce((sum, x, k) => sum + x * d[k] / norm, 0);
    const length = Math.hypot(...v), rho = Math.sqrt(Math.max(0, length * length - t * t));
    if (t >= 0 && rho * cosine <= t * sine) return true;
    const distance = t * cosine + rho * sine <= 0 ? length : rho * cosine - t * sine;
    return distance <= radius;
  }
  function build(sources, capacity) {
    const width = Math.ceil((capacity + 1) / 4), stride = width * 4;
    const data = new Float32Array(stride * cells);
    let total = 0, max = 0;
    for (let z = 0; z < dimensions[2]; z++) for (let y = 0; y < dimensions[1]; y++) for (let x = 0; x < dimensions[0]; x++) {
      const row = x + dimensions[0] * (y + dimensions[1] * z), offset = row * stride;
      const centre = [x, y, z].map((v, k) => min[k] + (v + 0.5) * step);
      let n = 0;
      for (let i = 0; i < sources.length; i++) if (intersects(sources[i], centre)) data[offset + ++n] = i;
      data[offset] = n; total += n; max = Math.max(max, n);
    }
    return { data, width, height: cells, average: total / cells, max };
  }
  window.CHURCH_LIGHT_GRID = { min, dimensions, step, cells, cellAt, intersects, build };
})();
