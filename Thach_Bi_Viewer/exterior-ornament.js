/* Exterior ornament generators, metres. See docs/exterior-23102026/decoration-inventory.md.
   Visual proxies only; source outlines and engineering holds remain in the owning records. */
(() => {
  // Reusable illustrative exterior ornament: fleur-de-lis finial, pinnacle crown, fluted field, flat foliate pilaster capital,
  // Greek-key frieze and a leaf spray, each built facing +Z with its base at the origin.
  function create(T, K) {
    const { TR, RX, RZ, SC, place, merge } = K;
    const fleur = h => {
      const parts = [[K.leaf({ len: h * .62, wid: h * .26, thick: h * .05, curl: .3, lobes: 0, cup: .25, seg: 6, fine: false }), TR(0, h * .34, 0)],
        [new T.BoxGeometry(h * .34, h * .07, h * .12), TR(0, h * .3, 0)], [new T.BoxGeometry(h * .09, h * .3, h * .09), TR(0, h * .15, 0)]];
      const petal = K.stem([[h * .04, h * .32, 0], [h * .2, h * .42, 0], [h * .27, h * .6, 0], [h * .2, h * .74, 0], [h * .11, h * .68, 0]], h * .045, h * .018, 10, 5);
      for (const e of [-1, 1]) parts.push([petal, SC(e, 1, 1)]);
      return merge(parts);
    };
    const capitalCache = new Map();
    const pilasterCapital = (w, h) => {
      const key = w.toFixed(3) + '|' + h.toFixed(3);
      if (capitalCache.has(key)) return capitalCache.get(key);
      const n = Math.max(3, Math.round(w / .2)), parts = [];
      const blade = K.leaf({ len: h * .78, wid: w / n * 1.3, thick: .025, curl: 1.7, lobes: 3, cup: .25, seg: 6 });
      for (let i = 0; i < n; i++) parts.push([blade, place(RX(.12), TR(-w / 2 + (i + .5) * w / n, h * .04, .01))]);
      const volute = K.stem(K.scroll(0, 0, h * .14, 1.2, -Math.PI / 2, 1), .02, .008, 10, 5);
      for (const e of [-1, 1]) parts.push([volute, place(SC(e, 1, 1), TR(e * (w / 2 - h * .1), h * .74, .02))]);
      const g = merge(parts); capitalCache.set(key, g); return g;
    };
    const meanderGeo = (len, h) => {
      const u = .31, t = .035, m = .035, depth = .03, parts = [];
      const bar = (a, b, c, d) => parts.push([new T.BoxGeometry(b - a, d - c, depth), TR((a + b) / 2, (c + d) / 2, depth / 2)]);
      bar(0, len, m, m + t); bar(0, len, h - m - t, h - m);
      for (let x = 0; x + u <= len + 1e-6; x += u) {
        bar(x, x + t, m, h - m); bar(x + .8 * u - t, x + .8 * u, .3 * h, h - m);
        bar(x + .4 * u, x + .8 * u, .3 * h, .3 * h + t); bar(x + .4 * u, x + .4 * u + t, .3 * h, .66 * h);
        bar(x + .4 * u, x + .62 * u, .66 * h - t, .66 * h);
      }
      return merge(parts);
    };
    const spray = h => {
      const parts = [], stemG = K.stem([[0, 0, 0], [h * .35, h * .25, 0], [h * .7, h * .15, 0], [h * .95, h * .32, 0]], .03, .012, 14, 5);
      parts.push([stemG, null], [K.stem(K.scroll(h * .95, h * .42, h * .1, 1.2, 0, 1), .022, .008, 10, 5), null]);
      const blade = K.leaf({ len: h * .32, wid: h * .16, thick: .025, curl: 1.4, lobes: 3, seg: 5, fine: false });
      for (const [u, v, a] of [[h * .2, h * .12, .6], [h * .45, h * .22, 2.3], [h * .62, h * .12, .9], [h * .82, h * .22, 2.1]]) parts.push([blade, place(RZ(-a), TR(u, v, 0))]);
      return merge(parts);
    };
    // T12 traces from the two independently drawn E01B H-front corners.
    // Tubes visualize inked contours only: stroke radius and relief are CONCEPT.
    // radial and a sagitta of 3 mm or more (arc steps up to 45° since 3 Nov 2026, was 30°) give a lighter
    // tube for small, often repeated carvings (pier and window capitals, rosettes): on their 20–60 mm
    // arcs the chord error stays at 1–4 mm. The default stays at 6 sides and fine steps.
    const towerSpandrel = (profile, strokeRadius = .008, sagitta = .0002, radial = 6) => {
      const vertices = [], indices = [];
      const tube = (points, normals) => {
        const base = vertices.length / 3;
        for (let i = 0; i < points.length; i++) for (let j = 0; j < radial; j++) {
          const a = 2 * Math.PI * j / radial, c = strokeRadius * Math.cos(a);
          vertices.push(points[i][0] + normals[i][0] * c, points[i][1] + normals[i][1] * c, strokeRadius * Math.sin(a));
        }
        for (let i = 0; i < points.length - 1; i++) for (let j = 0; j < radial; j++) {
          const a = base + i * radial + j, b = base + i * radial + (j + 1) % radial, c = a + radial, d = b + radial;
          indices.push(a, b, d, a, d, c);
        }
      };
      for (const row of profile) {
        const points = [], normals = [];
        if (row[1] === 'A') {
          const [, , u, v, r, start, span, handedness] = row;
          const steps = Math.max(2, Math.ceil((span * Math.PI / 180) / Math.min(sagitta >= .003 ? Math.PI / 4 : sagitta > .0002 ? Math.PI / 9 : Math.PI / 18, 2 * Math.acos(Math.max(-1, 1 - sagitta / r)))));
          for (let i = 0; i <= steps; i++) {
            const a = (start + span * i / steps) * Math.PI / 180;
            points.push([u + handedness * r * Math.cos(a), v + r * Math.sin(a)]);
            normals.push([-Math.cos(a), -handedness * Math.sin(a)]);
          }
        } else {
          const [, , x0, y0, x1, y1] = row, dx = x1 - x0, dy = y1 - y0, length = Math.hypot(dx, dy);
          if (!length) continue;
          points.push([x0, y0], [x1, y1]); normals.push([-dy / length, dx / length], [-dy / length, dx / length]);
        }
        tube(points, normals);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
      g.setIndex(indices); g.computeVertexNormals();
      return g;
    };
    // Fluted field as E01B draws every fluted pier (2 Nov 2026 survey of its flute arcs): a raised
    // panel with three round-ended flutes, r 25 mm and 110 mm apart, cut through it. Built facing +Z
    // from the wall face (z 0) to the field face (z depth), x across the pier, y = world level.
    // Returns the field and the groove beds, so each can take its own material.
    const flutedField = ({ half, y: [y0, y1], flutes: [f0, f1], step = .11, r = .025, depth = .03 }) => {
      const s = new T.Shape(), beds = [];
      s.moveTo(-half, y0); s.lineTo(half, y0); s.lineTo(half, y1); s.lineTo(-half, y1); s.lineTo(-half, y0);
      for (const k of [-1, 0, 1]) {
        const c = k * step, h = new T.Path();
        h.moveTo(c + r, f0 + r); h.lineTo(c + r, f1 - r); h.absarc(c, f1 - r, r, 0, Math.PI, false);
        h.lineTo(c - r, f0 + r); h.absarc(c, f0 + r, r, Math.PI, Math.PI * 2, false); s.holes.push(h);
        beds.push([new T.BoxGeometry(2 * r, f1 - f0, .002), TR(c, (f0 + f1) / 2, .001)]);
      }
      return { field: new T.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 8 }), bed: merge(beds) };
    };
    // Solid fill of a traced outline (owner, 3 Nov 2026: free-standing cresting is solid stone, not a
    // hollow outline). CAD strokes often stop on another curve instead of meeting end to end, so the fill
    // is found on a grid: strokes are drawn `close` thick (closing gaps up to about 2·close), everything
    // not reachable from outside is solid, and the result is eroded by `close` back to the drawn edge.
    // Runs of solid cells merge into boxes from z 0 to `depth`; edges step by `cell` (the outline tube
    // covers them). Returns null when nothing encloses. A display reading of the drawing: DERIVED.
    const solidOutline = (profile, depth = .05, cell = .005, close = .01) => {
      const lines = profile.map(row => {
        if (row[1] === 'L') return [[row[2], row[3]], [row[4], row[5]]];
        const [, , u, v, r, start, span, hd] = row, n = Math.max(2, Math.ceil(r * span * Math.PI / 180 / cell));
        return Array.from({ length: n + 1 }, (_, i) => { const a = (start + span * i / n) * Math.PI / 180; return [u + hd * r * Math.cos(a), v + r * Math.sin(a)]; });
      });
      let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      for (const l of lines) for (const [u, v] of l) { u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
      const pad = close + 2 * cell; u0 -= pad; v0 -= pad;
      const W = Math.ceil((u1 + pad - u0) / cell), H = Math.ceil((v1 + pad - v0) / cell), k = Math.round(close / cell);
      const mark = new Uint8Array(W * H), at = (x, y) => y * W + x;
      for (const l of lines) for (let s = 1; s < l.length; s++) {
        const [a, b] = [l[s - 1], l[s]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (cell / 2)));
        for (let i = 0; i <= n; i++) {
          const x = Math.floor((a[0] + (b[0] - a[0]) * i / n - u0) / cell), y = Math.floor((a[1] + (b[1] - a[1]) * i / n - v0) / cell);
          for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) if (dx * dx + dy * dy <= k * k) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H) mark[at(X, Y)] = 1; }
        }
      }
      const outside = new Uint8Array(W * H), queue = [];
      for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (!mark[at(x, y)]) { outside[at(x, y)] = 1; queue.push(at(x, y)); }
      for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (!mark[at(x, y)] && !outside[at(x, y)]) { outside[at(x, y)] = 1; queue.push(at(x, y)); }
      for (let q = 0; q < queue.length; q++) {
        const c = queue[q], x = c % W, y = (c - x) / W;
        for (const [X, Y] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) if (X >= 0 && Y >= 0 && X < W && Y < H) { const d = at(X, Y); if (!mark[d] && !outside[d]) { outside[d] = 1; queue.push(d); } }
      }
      // Erode: a cell stays solid when no outside cell lies within `close`.
      const solid = new Uint8Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (outside[at(x, y)]) continue;
        let keep = 1;
        for (let dy = -k; dy <= k && keep; dy++) for (let dx = -k; dx <= k; dx++) if (dx * dx + dy * dy <= k * k) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H || outside[at(X, Y)]) { keep = 0; break; } }
        solid[at(x, y)] = keep;
      }
      // Merge runs row by row, extending a box upward while the same run continues.
      const boxes = [], open = new Map();
      for (let y = 0; y <= H; y++) {
        const runs = new Set();
        if (y < H) for (let x = 0; x < W;) { if (!solid[at(x, y)]) { x++; continue; } let e = x; while (e < W && solid[at(e, y)]) e++; runs.add(x + ':' + e); x = e; }
        for (const [key, y0] of open) if (!runs.has(key)) { const [a, b] = key.split(':').map(Number); boxes.push([a, b, y0, y]); open.delete(key); }
        for (const key of runs) if (!open.has(key)) open.set(key, y);
      }
      if (!boxes.length) return null;
      return merge(boxes.map(([a, b, ya, yb]) => [new T.BoxGeometry((b - a) * cell, (yb - ya) * cell, depth), TR(u0 + (a + b) / 2 * cell, v0 + (ya + yb) / 2 * cell, depth / 2)]));
    };
    // Pinnacle crown as E01B draws it on the central aedicule piers (C4A086–C4A092, C49F98–C4A054):
    // a gablet, a square core with a colonnette on each corner under a small fleur, and a tapered
    // spire under the big fleur. Base centre at the origin, 1.68 m high at scale 1;
    // owner, 2 Nov 2026: the same crown tops every pier pinnacle around the church.
    let crownCache = null;
    const pinnacleCrown = () => {
      if (crownCache) return crownCache;
      const box = (h, [y0, y1], x = 0, z = 0) => [new T.BoxGeometry(2 * h, y1 - y0, 2 * h), TR(x, (y0 + y1) / 2, z)];
      const pyramid = (h, [y0, y1]) => [new T.ConeGeometry(Math.SQRT2, 1, 4, 1), place(K.RY(Math.PI / 4), SC(h, y1 - y0, h), TR(0, (y0 + y1) / 2, 0))];
      const small = fleur(.25), big = fleur(.43), parts = [pyramid(.289, [0, .213]), box(.12, [.1, .743])];
      for (const ex of [-1, 1]) for (const ez of [-1, 1]) {
        const x = ex * .1495, z = ez * .1495;
        parts.push(box(.0455, [0, .213], ex * .2435, ez * .2435),
          [new T.CylinderGeometry(.0485, .0485, .489, 10), TR(x, .3115, z)], box(.0615, [.556, .582], x, z),
          [new T.CylinderGeometry(.0485, .0485, .064, 10), TR(x, .614, z)], [new T.CylinderGeometry(.09, .055, .07, 10), TR(x, .681, z)],
          box(.103, [.716, .743], x, z), [small, TR(x, .743, z)]);
      }
      // Owner, 2 Nov 2026: the top reads as one piece. The drawn spire slope (half 0.112 at +0.918 to
      // 0.052 at +1.217) runs down to the core top and covers the inner gablet; a turned neck carries
      // the big fleur off the cap.
      parts.push([new T.CylinderGeometry(.052 * Math.SQRT2, .147 * Math.SQRT2, .474, 4, 1), place(K.RY(Math.PI / 4), TR(0, .98, 0))],
        box(.068, [1.217, 1.235]), box(.06, [1.235, 1.27]), [new T.CylinderGeometry(.03, .06, .13, 12), TR(0, 1.335, 0)], [big, TR(0, 1.27, 0)]);
      crownCache = merge(parts); crownCache.computeBoundingBox();
      return crownCache;
    };
    // Ground-storey pier of the church body as EW and E02 draw it (EW corner pier about u 3.925,
    // levels from the ±0 floor): plinth and mouldings, pedestal die with a rosette panel, base, fluted
    // shaft (field ±0.225), traced Corinthian capital and cornice bands. Rows are [y0, y1, half, kind]
    // from EW horizontal lines; each band projects (half − 0.335) beyond the shaft face, as square
    // mouldings. Built facing +Z: x across the pier, y = world level, z out from `back` to `face`
    // (shaft face). `wrap` puts the faces at ±face for a free-standing column. Depths are DERIVED.
    const PIER_BANDS = [[0, .15, .559, 'S'], [.15, .2, .507, 'S'], [.2, .29, .44, 'S'], [.29, .34, .415, 'S'], [.34, .86, .39, 'W'],
      [.86, .91, .415, 'S'], [.91, .99, .455, 'S'], [.99, 1.14, .375, 'S'], [1.14, 1.39, .335, 'W'], [1.39, 1.43, .36, 'S'],
      [1.43, 1.49, .39, 'S'], [1.49, 1.53, .36, 'S'], [5.622, 5.662, .36, 'S'], [5.662, 5.722, .39, 'S'], [5.722, 5.762, .36, 'S'],
      [6.012, 6.06, .385, 'S'], [6.06, 6.18, .435, 'S'], [6.18, 6.228, .485, 'S'], [6.228, 6.3239, .537, 'S']];
    const traced = (key, stroke = .008, light = true) => towerSpandrel(window.CHURCH_FACADE_CREST_PROFILE[key], stroke, light ? .003 : .001, light ? 3 : 6);
    const drawnPier = ({ bottom = 0, back = 0, face = .18, wrap = false }) => {
      const parts = [], boxAt = (kind, name, h, [y0, y1], z0, z1) => parts.push({ kind, name, geometry: new T.BoxGeometry(2 * h, y1 - y0, z1 - z0), matrix: TR(0, (y0 + y1) / 2, (z0 + z1) / 2) });
      const span = f => wrap ? [-f, f] : [back, f];
      for (const [y0, y1, h, kind] of PIER_BANDS) boxAt(kind, kind === 'W' ? 'die' : 'moulding', h, [y0 === 0 ? Math.min(0, bottom) : y0, y1], ...span(face + h - .335));
      boxAt('W', 'shaft', .335, [1.53, 5.622], ...span(face));
      boxAt('S', 'capital bell', .3, [5.762, 6.012], ...span(face));
      const field = flutedField({ half: .225, y: [1.53, 5.622], flutes: [1.655, 5.497] });
      const cap = traced('pierCapitalEW', .01), rosette = traced('pierRosette', .006), dieFace = face + .055;
      for (const side of wrap ? [1, -1] : [1]) {
        const m = z => side > 0 ? TR(0, 0, z) : place(K.RY(Math.PI), TR(0, 0, -z));
        parts.push({ kind: 'W', name: 'fluted field', geometry: field.field, matrix: m(face) }, { kind: 'S', name: 'fluted field bed', geometry: field.bed, matrix: m(face) },
          { kind: 'C', name: 'capital foliage', geometry: cap, matrix: m(face + .012) }, { kind: 'C', name: 'pedestal rosette', geometry: rosette, matrix: m(dieFace + .02) });
        // Pedestal panel (EW about u 3.78–4.07, centre +0.60): two square frames round the rosette.
        for (const [hh, w] of [[.145, .022], [.115, .015]]) for (const [x0, x1, y0, y1] of [[-hh, hh, .6 + hh - w, .6 + hh], [-hh, hh, .6 - hh, .6 - hh + w], [-hh, -hh + w, .6 - hh, .6 + hh], [hh - w, hh, .6 - hh, .6 + hh]])
          parts.push({ kind: 'S', name: 'pedestal panel', geometry: new T.BoxGeometry(x1 - x0, y1 - y0, .015), matrix: m(dieFace + .0075).multiply(TR((x0 + x1) / 2, (y0 + y1) / 2, 0)) });
      }
      return parts;
    };
    // Entablature over the ground storey as EW and E02 draw it (EW C… horizontals): dentils 66.3 mm on
    // a 132.6 mm pitch from +5.422, three fillets, the Greek-key frieze +5.762–6.012, then the cornice
    // to +6.3239. Built along x from u0 to u1 (dentils on whole multiples of the pitch), facing +Z from
    // `back` to the projections below, measured from the wall face z 0; depths are DERIVED.
    const drawnEntablature = (u0, u1, back = -.06) => {
      const parts = [], bar = (name, kind, [y0, y1], z1, a = u0, b = u1) => parts.push({ kind, name, geometry: new T.BoxGeometry(b - a, y1 - y0, z1 - back), matrix: TR((a + b) / 2, (y0 + y1) / 2, (back + z1) / 2) });
      // Owner, 3 Nov 2026: recessed grounds take the wall finish so the projecting dentils read clearly.
      bar('dentil backing', 'W', [5.422, 5.622], .06);
      for (let k = Math.ceil((u0 + .0332) / .1326); k * .1326 + .0332 <= u1 + 1e-6; k++) bar('dentil', 'S', [5.422, 5.622], .16, k * .1326 - .0332, k * .1326 + .0332);
      bar('fillet', 'S', [5.622, 5.662], .18); bar('fillet', 'S', [5.662, 5.722], .21); bar('fillet', 'S', [5.722, 5.762], .18);
      bar('frieze', 'W', [5.762, 6.012], .1);
      parts.push({ kind: 'C', name: 'Greek-key frieze', geometry: meanderGeo(u1 - u0, 6.012 - 5.762), matrix: TR(u0, 5.762, .1) });
      bar('cornice', 'S', [6.012, 6.06], .18); bar('cornice', 'S', [6.06, 6.18], .28); bar('cornice', 'S', [6.18, 6.228], .33); bar('cornice', 'S', [6.228, 6.3239], .38);
      return parts;
    };
    return { fleur, pilasterCapital, meanderGeo, spray, towerSpandrel, pinnacleCrown, flutedField, drawnPier, drawnEntablature, traced, solidOutline };
  }

  window.CHURCH_EXTERIOR_ORNAMENT = { create };
})();
