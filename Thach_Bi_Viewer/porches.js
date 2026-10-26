/* Open side porches (hiên thoáng), metres.
   Parish priest's meeting of 25 October 2026 (docs/engineering/parish-meeting-2026-10-25.md), point 2:
   the porches on grid B–C and G–H have no outer wall, only concrete columns with pointed
   arches cast between them; doors and windows stay in the inner C/G wall; the 9–10 side bays
   have no opening to the porches; the porch roof is a cast concrete slab, not timber.
   Sources: plan sheet 5 (porches 2′–9 and 10–12, columns on the B/H axes), sections 24/25
   (“bê tông cốt thép đổ dày 13 cm”, clay tiles over; RC beams), detail 47 (the shouldered
   circular-arc intrados on the C/G axes of the 9–10 bay: spring +5.474155, shoulder +7.147420,
   crown +8.503190; four native ARC entities and two short impost shelves).
   The porch arcade and the cross arches C–B / G–H are true two-centred pointed (Gothic) arches,
   as the owner asked; the 9–10 side-bay arch keeps the drawn shouldered outline of detail 47. Column and arch sizes, the guard balustrade and the beam sizes are
   proposals: no structural design, reinforcement, guard height or code check is implied. */
(() => {
  const SOURCE = 'Parish priest 25 Oct 2026, point 2 · CAD file 23 Oct 2026: plan sheet 5, sections 24/25, detail 47';
  const DRAWN = 'USER CONFIRMED LAYOUT / SOURCE GRID / SCHEMATIC SECTION';
  const CONCEPT = 'CONCEPT · ENGINEERING HOLD';
  const spec = {
    revision: '2026-10-26-d47-intrados-2',
    lineZ: 10.414, // axes B/H
    innerFace: 7.47, // porch face of the C/G wall
    floor: -0.32,
    entablature: 5.81, // underside of the existing porch cornice
    column: { half: 0.18, base: [-0.32, 0.28], baseHalf: 0.26, pilaster: 0.06 },
    // Gothic two-centred pointed arch (owner, 25 Oct 2026: the porch must read as Gothic with
    // pointed arches); a drop arch, centres 0.6 m inside the springing, rise 2.6 m on 4.14 m.
    arch: { spring: 3.0, rise: 2.6 },
    runs: [['2′', '9'], ['10', '12']],
    // Bays where the outside stairs land on the porch stay open at floor level; the others have a guard.
    stairBays: [16.725, 34.725, 46.425],
    guard: { top: 0.76, rail: 0.21, pitch: 0.22 },
    slab: { thick: 0.13, below: 0.03 }, // under the tile plane
    // Cross arches C–B / G–H on every inner axis of each porch run (parish priest's follow-up,
    // 25 Oct 2026; sections 24/25 draw an arch across the porch at each column), from the C/G
    // wall column (porch face |z| 7.65) to the arcade column, same outline as the arcade, with a
    // cast spandrel up to the slab. They carry the slab in place of flat beams.
    beam: { width: 0.22 },
    beamAxes: ['3', '4', '5', '6', '7', '8', '11'],
    cross: { from: 7.65, spring: 3.0, rise: 1.75 },
    wingEnds: [36.975, 44.175], wingWall: 0.32,
    // Outside opening types of E26/D29 and E31/D34, relocated to C/G by the owner.
    // The CAD's different single inside opening is NOT silently treated as the same type.
    openings: {
      window: { width: 1, bottom: .85, leafTop: 2.9505, spring: 3.1005, radius: .5,
        centres: [-1.015, 1.015], radii: [.5, .610, .688, .708, .778, .793, .828] },
      // Candidate only: the current 170 mm exit-sign case does not fit its 150 mm head band.
      // Keep the previous door model until a coordinated sign/mounting revision is checked.
      doorCandidate: { status: 'ENGINEERING HOLD · NOT APPLIED', width: 2.25, bottom: 0, leafTop: 2.9505, spring: 3.1005, radius: 1.125,
        radii: [1.125, 1.290, 1.407, 1.445, 1.550, 1.572, 1.625] },
      reliefDepth: [.21, .30], // retained visual relief projection: CONCEPT, not verified CAD depth
    },
    wingArch: {
      half: 3.303, spring: 5.474154929, shoulder: 7.147419557, crown: 8.503190063,
      band: 0.25, depth: 0.30, z: 7.36, // band/depth remain CONCEPT, not D47 dimensions
      // Native CAD arcs, mapped by the 9–10 midpoint and the foot datum of DIMENSION DA5CEE.
      // All are traversed clockwise, from each stored end angle back to its start angle.
      // The curve begins 99.996392 mm inside each clear column face; the short shelf is drawn.
      arcs: [
        { handle: 'DA5B35', centre: [-1.476627726, 5.488819943], radius: 1.72643816757638, angles: [106.1150944769076, 180.4866976874492] },
        { handle: 'DA5B34', centre: [0, 6.414566025], radius: 2.088624038705893, angles: [90, 159.4589347943677] },
        { handle: 'DA5B43', centre: [0, 6.414566025], radius: 2.088624038705893, angles: [20.5410652086613, 90] },
        { handle: 'DA5B44', centre: [1.476627726, 5.488819943], radius: 1.72643816757638, angles: [359.5133023125509, 73.88490553350736] },
      ],
    },
  };
  // Clay tiles of the porch roof (bundle): +7.13 at the C/G line falling to +6.325 at |z| 10.98.
  const tileY = az => 7.13 - (7.13 - 6.325) * (az - 7.36) / (10.98 - 7.36);
  spec.slabUnderside = az => tileY(az) - spec.slab.below - spec.slab.thick;
  // Sample the native intrados at a maximum angular step of about 1.55 degrees (48 per arc).
  // This gives <0.20 mm chord sagitta on these radii; it is a rendering bound, not site accuracy.
  function wingIntrados(segments = 48) {
    const A = spec.wingArch, points = [[-A.half, A.spring]];
    for (const arc of A.arcs) {
      const end = arc.angles[1] * Math.PI / 180;
      let start = arc.angles[0] * Math.PI / 180;
      if (start > end) start -= Math.PI * 2;
      for (let i = 0; i <= segments; i++) {
        const angle = end + (start - end) * i / segments;
        const point = [arc.centre[0] + arc.radius * Math.cos(angle), arc.centre[1] + arc.radius * Math.sin(angle)];
        if (Math.hypot(point[0] - points.at(-1)[0], point[1] - points.at(-1)[1]) > 1e-8) points.push(point);
      }
    }
    points.push([A.half, A.spring]);
    return points;
  }
  window.CHURCH_PORCHES = { spec, prepare, tileY, wingIntrados };

  function prepare({ THREE: T, exterior, mat, data }) {
    if (!exterior) return;
    const A = data.longitudinal;
    exterior.updateMatrixWorld(true);
    // ---- Superseded bundle parts: the outer porch walls with their windows and doors ----
    // Everything that starts below the cornice in the outer groups of the porch bays goes (the
    // wall, its windows and doors, the engaged pilasters); the cornice, eave crest and pinnacles stay. The 9–10 groups are the wing gables and stay.
    const remove = [], box = new T.Box3();
    exterior.traverse(o => {
      if (!/^Outer veranda [BH] /.test(o.name) || /9–10$/.test(o.name)) return;
      o.traverse(m => { if (m.isMesh && box.setFromObject(m).min.y < spec.entablature - 0.01) remove.push(m); });
    });
    remove.forEach(o => o.removeFromParent());

    const root = new T.Group();
    root.name = 'Open side porches — parish priest 25 Oct 2026';
    root.userData = { status: DRAWN, source: SOURCE, revision: spec.revision };
    exterior.add(root);
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, place, merge } = K;
    const bins = new Map();
    const add = (name, material, geometry, matrix = null, status = DRAWN) => {
      const key = name + '\u0000' + material.uuid;
      if (!bins.has(key)) bins.set(key, { name, material, status, parts: [] });
      bins.get(key).parts.push([geometry, matrix]);
    };
    const block = (name, material, [x0, x1], [y0, y1], [z0, z1], status) =>
      add(name, material, new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), TR((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), status);
    // Shapes in the X–Y plane, extruded across z0..z1.
    const slabXY = (name, material, shape, [z0, z1], status, segments = 24) =>
      add(name, material, new T.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false, curveSegments: segments }), TR(0, 0, z0), status);
    // Two-centred pointed arch from (cx − half, spring) over the apex (cx, spring + rise).
    const pointedPoints = (cx, half, a, n = 14) => {
      const c = (a.rise * a.rise - half * half) / (2 * half), r = half + c, pts = [];
      const end = Math.atan2(a.rise, c); // angle of the apex seen from each centre
      for (let i = 0; i <= n; i++) { const t = end * i / n; pts.push(new T.Vector2(cx + c - r * Math.cos(t), a.spring + r * Math.sin(t))); }
      for (let i = n - 1; i >= 0; i--) { const t = end * i / n; pts.push(new T.Vector2(cx - c + r * Math.cos(t), a.spring + r * Math.sin(t))); }
      return pts;
    };
    const pointedBand = (cx, half, a, w) => {
      const outer = pointedPoints(cx, half + w, { spring: a.spring, rise: a.rise + w * 1.3 }), inner = pointedPoints(cx, half, a).reverse();
      return new T.Shape([...outer, ...inner]);
    };
    // Prism over x0..x1 and z0..z1 whose top and bottom follow functions of |z| (sloped slab,
    // beams and walls under the porch roof).
    const prism = (name, material, x0, x1, z0, z1, top, bottom, status) => {
      const P = (x, z, f) => [x, f(Math.abs(z)), z];
      const c = [P(x0, z0, top), P(x1, z0, top), P(x1, z1, top), P(x0, z1, top), P(x0, z0, bottom), P(x1, z0, bottom), P(x1, z1, bottom), P(x0, z1, bottom)];
      const flip = (x1 - x0) * (z1 - z0) < 0, v = [], uv = [];
      const tri = (a, b, d) => { for (const k of flip ? [a, d, b] : [a, b, d]) { v.push(...c[k]); uv.push(c[k][0] + c[k][2], c[k][1]); } };
      const quad = (a, b, d, e) => { tri(a, b, d); tri(a, d, e); };
      quad(0, 3, 2, 1); quad(4, 5, 6, 7); quad(0, 1, 5, 4); quad(1, 2, 6, 5); quad(2, 3, 7, 6); quad(3, 0, 4, 7);
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(v, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g.computeVertexNormals();
      add(name, material, g, null, status);
    };
    const W = mat.wall, S = mat.trim;
    // Cross-arch outline in (|z|, y), shared with the simulator's structure lookup.
    const crossArch = (() => {
      const za = spec.cross.from, zb = spec.lineZ - spec.column.half, half = (zb - za) / 2, cx = (za + zb) / 2;
      const a = { spring: spec.cross.spring, rise: spec.cross.rise };
      return { cx, half, a, points: pointedPoints(cx, half, a, 16) };
    })();
    spec.crossSoffit = az => { const p = crossArch.points; if (az <= p[0].x || az >= p[p.length - 1].x) return spec.cross.spring; for (let i = 1; i < p.length; i++) if (p[i].x >= az) { const f = (az - p[i - 1].x) / (p[i].x - p[i - 1].x); return p[i - 1].y + f * (p[i].y - p[i - 1].y); } return spec.cross.spring; };
    const C = spec.column, AR = spec.arch, G = spec.guard;
    const stats = { columns: 0, arches: 0, guardedBays: 0, openBays: 0, beams: 0 };

    for (const s of [-1, 1]) {
      const zc = s * spec.lineZ, z0 = zc - C.half, z1 = zc + C.half, out = s * (spec.lineZ + C.half);
      for (const [from, to] of spec.runs) {
        const keys = Object.keys(A).filter(k => A[k] >= A[from] - 1e-6 && A[k] <= A[to] + 1e-6).sort((a, b) => A[a] - A[b]);
        for (let i = 0; i < keys.length; i++) {
          const x = A[keys[i]];
          // Column at every axis: pedestal, pilaster strips inside and out, impost at the spring.
          block('Porch column pedestal', S, [x - C.baseHalf, x + C.baseHalf], C.base, [zc - C.baseHalf, zc + C.baseHalf]);
          block('Porch column pedestal cap', S, [x - C.baseHalf - .03, x + C.baseHalf + .03], [C.base[1] - .06, C.base[1]], [zc - C.baseHalf - .03, zc + C.baseHalf + .03]);
          for (const e of [-1, 1]) block('Porch column pilaster', W, [x - .13, x + .13], [C.base[1], spec.entablature], [e > 0 ? z1 : z0 - C.pilaster, e > 0 ? z1 + C.pilaster : z0]);
          block('Porch column impost capital', S, [x - .25, x + .25], [AR.spring - .2, AR.spring], [zc - .26, zc + .26]);
          stats.columns++;
          if (i === keys.length - 1) continue;
          const xa = x, xb = A[keys[i + 1]], cx = (xa + xb) / 2, half = (xb - xa) / 2 - C.half;
          // Column halves and the spandrel over the arch, one cast wall per bay.
          const wall = new T.Shape([new T.Vector2(xa, spec.floor), new T.Vector2(xb, spec.floor), new T.Vector2(xb, spec.entablature), new T.Vector2(xa, spec.entablature)]);
          const hole = [new T.Vector2(cx - half, spec.floor), ...pointedPoints(cx, half, AR), new T.Vector2(cx + half, spec.floor)];
          wall.holes.push(new T.Path(T.ShapeUtils.isClockWise(hole) ? hole : hole.reverse()));
          slabXY('Porch arcade column and arch spandrel · cast concrete, plastered', W, wall, [z0, z1]);
          // Arch moulding on both faces and a keystone bloom at the crown.
          for (const [a, b] of [[z1, z1 + .05], [z0 - .05, z0]]) slabXY('Porch arch moulding', S, pointedBand(cx, half, AR, .12), [a, b], DRAWN, 12);
          add('Porch arch keystone rosette', S, K.bloom({ r: .14, petals: 8, rings: 2, seg: 3 }), place(RY(s < 0 ? Math.PI : 0), TR(cx, AR.spring + AR.rise + .2, out + s * .05)), CONCEPT);
          stats.arches++;
          // Guard between the columns, except where the outside stairs land.
          if (spec.stairBays.some(c => Math.abs(c - cx) < .6)) { stats.openBays++; continue; }
          const g0 = cx - half, g1 = cx + half;
          block('Porch guard plinth rail', S, [g0, g1], [spec.floor, spec.floor + .15], [zc - .12, zc + .12], CONCEPT);
          block('Porch guard top rail', S, [g0, g1], [G.top - G.rail, G.top], [zc - .13, zc + .13], CONCEPT);
          const n = Math.max(2, Math.round((g1 - g0) / G.pitch));
          for (let k = 1; k < n; k++) add('Porch guard baluster', S, new T.CylinderGeometry(.045, .055, G.top - G.rail - spec.floor - .15, 10), TR(g0 + (g1 - g0) * k / n, (spec.floor + .15 + G.top - G.rail) / 2, zc), CONCEPT);
          stats.guardedBays++;
        }
        // Cast slab under the tiles, plastered underneath, and an RC beam on every inner axis.
        const xs = A[from] + (from === '10' ? spec.wingWall / 2 : 0), xe = A[to] - (to === '9' ? spec.wingWall / 2 : 0);
        prism('Porch roof slab · cast concrete 130 mm, plastered soffit', W, xs, xe, s * spec.innerFace, s * (spec.lineZ - C.half), az => tileY(az) - spec.slab.below, spec.slabUnderside, DRAWN);
        for (const k of keys.filter(k => spec.beamAxes.includes(k))) {
          const pts = crossArch.points, top = spec.slabUnderside, za = spec.cross.from, zb = spec.lineZ - C.half, t = spec.beam.width;
          const shape = new T.Shape([...pts, new T.Vector2(zb, top(zb) + .005), new T.Vector2(za, top(za) + .005)]);
          // Shape u runs along |z|, v is height; extruded across the axis (world x).
          const m = new T.Matrix4().set(0, 0, 1, A[k] - t / 2, 0, 1, 0, 0, s, 0, 0, 0, 0, 0, 0, 1);
          add('Porch cross arch C–B / G–H · cast concrete, plastered', W, new T.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 16 }), m, DRAWN);
          for (const [a, b] of [[-t / 2 - .04, -t / 2], [t / 2, t / 2 + .04]]) {
            const mm = new T.Matrix4().set(0, 0, 1, A[k] + a, 0, 1, 0, 0, s, 0, 0, 0, 0, 0, 0, 1);
            add('Porch arch moulding', S, new T.ExtrudeGeometry(pointedBand(crossArch.cx, crossArch.half, crossArch.a, .1), { depth: b - a, bevelEnabled: false, curveSegments: 12 }), mm, DRAWN);
          }
          stats.beams++;
        }
      }
      // The 9–10 side bays are closed to the porches: a plain wall on each axis from the C/G
      // wall to the arcade column, up to the porch slab.
      for (const x of spec.wingEnds) {
        const za = spec.innerFace, zb = spec.lineZ - C.half;
        prism('Side-bay end wall to the porch · no opening', W, x - spec.wingWall / 2, x + spec.wingWall / 2, s * za, s * zb, az => tileY(az) - spec.slab.below, () => spec.floor, DRAWN);
        block('Side-bay end wall plinth', S, [x - spec.wingWall / 2 - .03, x + spec.wingWall / 2 + .03], [spec.floor, spec.floor + .32], [Math.min(s * za, s * zb), Math.max(s * za, s * zb)]);
      }
      // Detail 47: the shouldered pointed RC arch on the C/G axis of the 9–10 bay, open to the
      // timber roof above, between the side bay and the nave.
      const WA = spec.wingArch, cxw = (A['9'] + A['10']) / 2, zw = s * WA.z;
      const inner = wingIntrados().map(([x, y]) => new T.Vector2(cxw + x, y));
      // Only the intrados is transcribed from D47. The retained display band and its extrusion
      // are provisional: this does not model the complete raked concrete frame in the drawing.
      const outer = inner.map(p => new T.Vector2(cxw + (p.x - cxw) * (WA.half + WA.band) / WA.half,
        WA.spring + (p.y - WA.spring) * (WA.crown - WA.spring + WA.band) / (WA.crown - WA.spring)));
      slabXY('Side-bay arch rib · reinforced concrete (detail 47)', W,
        new T.Shape([...outer, ...inner.slice().reverse()]), [zw - WA.depth / 2, zw + WA.depth / 2],
        'DRAWING SHOWN INTRADOS / CONCEPT BAND AND DEPTH · ENGINEERING HOLD', 16);
      for (const e of [-1, 1]) block('Side-bay arch impost', S, [cxw + e * WA.half - .2, cxw + e * WA.half + .2].sort((a, b) => a - b), [WA.spring - .16, WA.spring], [zw - .2, zw + .2]);
    }

    // ---- Meshes, with welded indices so the display batches keep their saving ----
    const indexed = g => {
      g = g.index ? g.toNonIndexed() : g;
      if (!g.attributes.uv) g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      const pos = g.attributes.position.array, nor = g.attributes.normal.array, uv = g.attributes.uv.array, n = pos.length / 3;
      const seen = new Map(), index = new Uint32Array(n), P = [], Nn = [], U = [];
      for (let i = 0; i < n; i++) {
        const key = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2], uv[i * 2], uv[i * 2 + 1]].map(v => Math.round(v * 1e5)).join();
        let k = seen.get(key);
        if (k === undefined) { k = P.length / 3; seen.set(key, k); P.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); Nn.push(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]); U.push(uv[i * 2], uv[i * 2 + 1]); }
        index[i] = k;
      }
      const out = new T.BufferGeometry();
      out.setAttribute('position', new T.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(Nn, 3)); out.setAttribute('uv', new T.Float32BufferAttribute(U, 2));
      out.setIndex(new T.BufferAttribute(index, 1)); g.dispose();
      return out;
    };
    let meshes = 0, triangles = 0;
    for (const { name, material, status, parts } of bins.values()) {
      const geometry = indexed(merge(parts.map(([g, m]) => [g.index ? g.toNonIndexed() : g, m])));
      const mesh = new T.Mesh(geometry, material);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData = { status, source: SOURCE };
      root.add(mesh);
      meshes++; triangles += geometry.index.count / 3;
    }
    root.userData.stats = { ...stats, meshes, triangles, removedBundleMeshes: remove.length };
    window.CHURCH_PORCHES.stats = root.userData.stats;
    data?.assumptions?.push('The side porches follow the parish priest’s decision of 25 October 2026: no outer wall, concrete columns on the B/H axes with two-centred pointed arcade and cross arches, a guard except where the outside stairs land, doors and windows only in the inner C/G wall, a cast roof slab under the tiles and plain walls closing the 9–10 side bays from the porches. The 9–10 C/G arch intrados uses four native circular arcs and the short impost shelves from CAD detail 47 (26 October audit); its display band/depth and the porch column, arch, guard and beam sizes remain proposals on engineering hold.');
  }
})();
