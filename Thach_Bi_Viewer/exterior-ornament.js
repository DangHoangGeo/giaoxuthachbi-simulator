/* Exterior ornament generators, metres. See docs/exterior-23102026/decoration-inventory.md.
   Visual proxies only; source outlines and engineering holds remain in the owning records. */
(() => {
  // Reusable illustrative exterior ornament: fleur-de-lis finial, pinnacle crown, flat foliate pilaster capital,
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
    const towerSpandrel = (profile, strokeRadius = .008, sagitta = .0002) => {
      const vertices = [], indices = [], radial = 6;
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
          const steps = Math.max(2, Math.ceil((span * Math.PI / 180) / Math.min(sagitta > .0002 ? Math.PI / 9 : Math.PI / 18, 2 * Math.acos(Math.max(-1, 1 - sagitta / r)))));
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
    return { fleur, pilasterCapital, meanderGeo, spray, towerSpandrel, pinnacleCrown };
  }

  window.CHURCH_EXTERIOR_ORNAMENT = { create };
})();
