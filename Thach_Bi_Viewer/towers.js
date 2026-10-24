/* Tower base and tower tops, metres.
   Owner, 25 October 2026, after the parish priest's meeting (point 5): the tower fronts have no
   opening, only a closed wall with a decorative arch; the tower base, the top and the ornament
   follow the church's CAD file of 23 October 2026. Sources: DWG sheet 1, drawing E01B (front
   elevation, traced in model axes: corner piers Z 7.0–8.2 and 12.1–13.4 on the H tower, pedestals
   to +1.85, fluted shafts to +7.4, foliate capital band and Greek-key frieze +7.4 to +7.85,
   cornice to +8.39; big archivolt springing +4.0 with radius 1.95; inner blind arch on colonnettes
   springing +2.85 with radius 0.8 to 1.15; dome +30.05 to +32.75 with a rosette at +31.8;
   lantern +33.05 to +33.95, open acanthus crown to +35.0, ball, trefoil cross to +36.92), and
   plan sheet 5 (stepped corner piers about 2.0 × 1.45 m).
   Departure kept on purpose: the stage-1 wall plane stays at X 0 (the plan draws it 0.5 m
   further forward) so the stages above and the fittings on the +8.39 cornice keep their places;
   the piers and the entablature project in front of it as drawn. Moulding profiles, carving and
   depths are illustrative; nothing here implies a structure, a fixing or a construction detail. */
(() => {
  const SOURCE = 'CAD file 23 Oct 2026 · DWG sheet 1 (E01B), plan sheet 5; owner 25 Oct 2026';
  const DRAWN = 'TRACED CAD ELEVATION / SCHEMATIC DEPTH';
  const CARVED = 'TRACED CAD ELEVATION / ILLUSTRATIVE CARVING';
  const spec = {
    revision: '2026-10-25-cad-towers-1',
    centre: 10.153, core: 2.45, wall: 0.14, // tower centre |Z|; core half-width; half wall thickness
    top: 8.39,
    pier: { t: [1.95, 3.2], front: [-0.72, 1.0], back: [3.9, 5.1], pedestal: 1.85, shaft: 7.4, capital: 7.85 },
    arch: { spring: 4.0, r: [1.58, 1.95], impost: [1.55, 1.95] },
    blind: { spring: 2.85, r: [0.8, 1.15], colonnette: 1.02, recess: 0.2 },
    entablature: { architrave: [6.95, 7.1], dentils: [7.15, 7.35], frieze: [7.42, 7.78], cornice: [7.85, 8.39] },
    door: { x: [3.4, 4.4], h: 2.3 }, // into each tower from the rear corner of the nave (inner side)
    dome: { y0: 29.6, wall: 30.6, top: 32.75, r: 1.7, rosette: 31.8 },
    lantern: { plinth: [32.75, 32.95, 0.8], step: [32.95, 33.05, 0.72], base: [33.05, 33.2, 0.55], body: [33.2, 33.8, 0.48], beads: [33.8, 33.95, 0.58], crown: [33.95, 35.0, 1.2], ball: 35.3, cross: [35.5, 36.92], arm: 36.42 },
    pinnacle: { at: 2.02, y: 30.25, h: 1.05 },
    // Corner piers of the upper stages (E01B): pedestal block, fluted pilaster, foliate capital
    // band, dentils and cornice, the cornice top at the stage level. `u` is the model's stage
    // depth (X); the piers stand 0.45 m in front of and behind it.
    stages: [
      { y: [8.39, 15.84], t: [1.8, 3.05], u: 4.72, cap: [15.0, 15.3] },
      { y: [15.84, 23.14], t: [1.8, 3.05], u: 4.52, cap: [22.35, 22.65] },
      { y: [23.14, 29.09], t: [1.75, 2.6], u: 3.95, cap: [28.4, 28.75] },
    ],
  };
  // Front face of the corner piers of each stage (stage 1 first) and the pier centre, for fittings.
  spec.pierFront = [spec.pier.front[0], ...spec.stages.map(g => 2.45 - g.u / 2 - 0.45)];
  spec.pierCentre = [(spec.pier.t[0] + spec.pier.t[1]) / 2, ...spec.stages.map(g => (g.t[0] + g.t[1]) / 2)];
  window.CHURCH_TOWERS = { spec, prepare };

  function prepare({ THREE: T, exterior, mat, data }) {
    if (!exterior) return;
    exterior.updateMatrixWorld(true);
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, RX, RZ, SC, place, merge } = K;
    const towers = [];
    exterior.traverse(o => { if (/^Tower (A–C|G–I) \/ 1–2$/.test(o.name)) towers.push(o); });
    if (towers.length !== 2) return;

    // ---- Superseded bundle parts ----
    let crossMaterial = mat.metal;
    const remove = [], box3 = new T.Box3();
    const capNames = /^(Tower cap profile|Schematic cap rib|Cap pedestal|Continuous cap cross support|Cross — apex is source height|Cross transverse arm|Urn (foot|body|shoulder|finial)|Dome drum|Schematic rose-window infill|Schematic rosette (ring|ray))/;
    for (const tower of towers) {
      // The four stage-1 wall groups (front, sides, back); realism.js has already rebuilt the rear one.
      for (const g of tower.children) if (g.children.some(m => m.name === 'Tower stage 1 wall')) remove.push(g);
      tower.traverse(o => {
        if (!o.isMesh) return;
        if (o.name === 'Cross — apex is source height') crossMaterial = o.material;
        box3.setFromObject(o);
        if (o.name === 'Tower continuous cornice' && box3.max.y < 8.6) remove.push(o);
        else if (capNames.test(o.name) && box3.min.y > 29.0) remove.push(o);
        else if (!o.name && box3.min.y > 32.5) remove.push(o); // unnamed parts of the old cross
      });
    }
    remove.forEach(o => o.removeFromParent());
    const empty = [];
    towers.forEach(t => t.traverse(o => { if (o !== t && o.type === 'Group' && !o.children.length) empty.push(o); }));
    empty.forEach(o => o.removeFromParent());

    const root = new T.Group();
    root.name = 'Tower bases and tops — CAD file 23 Oct 2026';
    root.userData = { status: DRAWN, source: SOURCE, revision: spec.revision };
    exterior.add(root);
    const bins = new Map();
    const add = (name, material, geometry, matrix = null, status = DRAWN) => {
      const key = name + '\u0000' + material.uuid;
      if (!bins.has(key)) bins.set(key, { name, material, status, parts: [] });
      bins.get(key).parts.push([geometry, matrix]);
    };
    const W = mat.wall, S = mat.trim, D = mat.darkTrim, CAP = mat.cap || mat.wall;
    const stats = { piers: 0, blindArches: 0, removedBundleMeshes: remove.length };

    // ---- Shared carving ----
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
    // Each tower face has its own frame: u along the face, v up, w out of the face.
    // face(s, kind) → function mapping (u, v, w) to a world matrix and box helpers.
    const both = fn => { for (const s of [-1, 1]) fn(s); };

    both(s => {
      const zc = s * spec.centre, C = spec.core, P = spec.pier, E = spec.entablature;
      const Z = t => zc + s * t; // t outward from the tower centre
      const block = (name, material, [x0, x1], [y0, y1], [t0, t1], status) => {
        const z0 = Z(t0), z1 = Z(t1);
        add(name, material, new T.BoxGeometry(x1 - x0, y1 - y0, Math.abs(z1 - z0)), TR((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), status);
      };
      // Faces: front (normal −X, u = t), outer side (normal +s·Z, u = X − 2.45), inner side
      // (normal −s·Z), back (normal +X). Local frame: x = u, y = v, z = out of the face.
      const frames = {
        front: (u, v, w) => place(RY(-Math.PI / 2), TR(-spec.wall - w, v, Z(u))),
        outer: (u, v, w) => place(RY(s > 0 ? 0 : Math.PI), TR(C + u, v, Z(C + spec.wall + w))),
        inner: (u, v, w) => place(RY(s > 0 ? Math.PI : 0), TR(C - u, v, Z(-C - spec.wall - w))),
      };
      // The front frame's local x runs along +Z; for the B tower that is inward, so mirror u.
      const at = (face, u, v, w, ...pre) => place(...pre, SC(face === 'front' ? s : 1, 1, 1)).premultiply(frames[face](u, v, w));
      // Slab shape in a face frame, extruded from w0 to w1 out of the face.
      const slab = (name, material, face, shape, w0, w1, status, segments = 24) => {
        const g = new T.ExtrudeGeometry(shape, { depth: w1 - w0, bevelEnabled: false, curveSegments: segments });
        add(name, material, g, at(face, 0, 0, w0), status);
      };
      const ring = (cx, cy, r0, r1, legs = 0) => {
        const sh = new T.Shape();
        sh.moveTo(cx + r1, cy - legs); sh.lineTo(cx + r1, cy); sh.absarc(cx, cy, r1, 0, Math.PI, false); sh.lineTo(cx - r1, cy - legs);
        sh.lineTo(cx - r0, cy - legs); sh.lineTo(cx - r0, cy); sh.absarc(cx, cy, r0, Math.PI, 0, true); sh.lineTo(cx + r0, cy - legs);
        return sh;
      };
      const archHole = (cx, half, y0, spring) => { const p = new T.Path(); p.moveTo(cx - half, y0); p.absarc(cx, spring, half, Math.PI, 0, true); p.lineTo(cx + half, y0); p.lineTo(cx - half, y0); return p; };
      const rect = (u0, u1, v0, v1) => { const sh = new T.Shape(); sh.moveTo(u0, v0); sh.lineTo(u1, v0); sh.lineTo(u1, v1); sh.lineTo(u0, v1); sh.lineTo(u0, v0); return sh; };

      // ---- Stage-1 walls: closed front and outer side, a door in the inner side ----
      block('Tower base wall · closed front (owner 25 Oct 2026)', W, [-spec.wall, spec.wall], [0, spec.top], [-C - spec.wall, C + spec.wall]);
      block('Tower base wall · outer side', W, [-spec.wall, 2 * C + spec.wall], [0, spec.top], [C - spec.wall, C + spec.wall]);
      {
        const [d0, d1] = spec.door.x, wall = rect(-spec.wall, 2 * C + spec.wall, 0, spec.top);
        const hole = new T.Path(); hole.moveTo(d0, 0); hole.lineTo(d0, spec.door.h); hole.lineTo(d1, spec.door.h); hole.lineTo(d1, 0); hole.lineTo(d0, 0);
        wall.holes.push(hole);
        // Shape x along world X; extruded across the wall thickness on the inner side.
        const g = new T.ExtrudeGeometry(wall, { depth: 2 * spec.wall, bevelEnabled: false });
        add('Tower base wall · inner side with door to the nave', W, g, place(TR(0, 0, -spec.wall), SC(1, 1, s), TR(0, 0, Z(-C))));
        block('Tower room door leaf · timber, closed', mat.wood || D, [d0 + .02, d1 - .02], [0, spec.door.h - .02], [-C - .02, -C + .03]);
      }
      // ---- Corner piers: pedestal, fluted shaft, foliate capital band, cornice ----
      const piers = [[P.front, 1], [P.front, -1], [P.back, 1], [P.back, -1]];
      for (const [[x0, x1], side] of piers) {
        const [t0, t1] = side > 0 ? P.t : [-P.t[1], -P.t[0]];
        const grow = (a, d) => [a[0] - d, a[1] + d];
        block('Tower corner pier plinth', S, grow([x0, x1], .22), [0, .35], grow([t0, t1], .12));
        block('Tower corner pier pedestal', W, grow([x0, x1], .12), [.35, 1.55], grow([t0, t1], .07));
        block('Tower corner pier pedestal cap', S, grow([x0, x1], .17), [1.55, 1.7], grow([t0, t1], .1));
        block('Tower corner pier base moulding', S, grow([x0, x1], .07), [1.7, P.pedestal], grow([t0, t1], .05));
        block('Tower corner pier shaft', W, [x0, x1], [P.pedestal, P.shaft], [t0, t1]);
        // Pilaster strips with three flutes on each exposed face.
        const front = x0 < 0, outer = side > 0;
        if (front) for (const tm of [(t0 + t1) / 2]) {
          block('Tower pier pilaster', W, [x0 - .06, x0], [P.pedestal + .02, P.shaft], [tm - .3, tm + .3]);
          for (const k of [-1, 0, 1]) block('Tower pier flute', D, [x0 - .068, x0 - .055], [P.pedestal + .2, P.shaft - .12], [tm + k * .16 - .022, tm + k * .16 + .022]);
          add('Tower pier capital foliage', S, pilasterCapital(.7, (P.capital - P.shaft) * .9), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(x0 - .07, P.shaft, Z(tm))), CARVED);
        }
        if (outer || !front) {
          const xm = (x0 + x1) / 2, tf = outer ? t1 : t0, dir = outer ? 1 : -1;
          block('Tower pier pilaster', W, [xm - .3, xm + .3], [P.pedestal + .02, P.shaft], [tf, tf + dir * .06].sort((a, b) => a - b));
          for (const k of [-1, 0, 1]) block('Tower pier flute', D, [xm + k * .16 - .022, xm + k * .16 + .022], [P.pedestal + .2, P.shaft - .12], [tf + dir * .055, tf + dir * .068].sort((a, b) => a - b));
          add('Tower pier capital foliage', S, pilasterCapital(.7, (P.capital - P.shaft) * .9), place(RY(dir * s > 0 ? 0 : Math.PI), TR(xm, P.shaft, Z(tf + dir * .07))), CARVED);
        }
        block('Tower pier capital band', S, grow([x0, x1], .04), [P.shaft, P.capital], grow([t0, t1], .04));
        stats.piers++;
      }
      // ---- Entablature round the base: architrave, dentils, Greek-key frieze, cornice ----
      // As drawn, it breaks forward over the piers; between them it stands on the wall.
      const wallFace = -spec.wall;
      const entab = (name, mat_, xs, ys, ts) => block(name, mat_, xs, ys, ts);
      // Front, between the piers.
      entab('Tower base architrave', S, [wallFace - .18, wallFace], E.architrave, [-P.t[0], P.t[0]]);
      for (let t = -P.t[0] + .06; t <= P.t[0] - .05; t += .12) entab('Tower base dentil', S, [wallFace - .16, wallFace], E.dentils, [t, t + .06]);
      entab('Tower base frieze', W, [wallFace - .1, wallFace], [E.dentils[1], E.cornice[0]], [-P.t[0], P.t[0]]);
      add('Tower base Greek-key frieze', S, meanderGeo(2 * P.t[0], E.frieze[1] - E.frieze[0]), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .1, E.frieze[0], Z(-P.t[0]))), CARVED);
      // Cornice over everything, stepping out; its top is the +8.39 ledge the tower floods stand on.
      // Between the piers the cornice keeps the old 0.30 m lip, where the tower floods stand;
      // over the piers it breaks forward with them, as drawn.
      const core = { x: [-spec.wall, 2 * C + spec.wall], t: [-C - spec.wall, C + spec.wall] };
      for (const [dy, out, m] of [[[E.cornice[0], 7.98], .1, S], [[7.98, 8.2], .2, W], [[8.2, spec.top], .24, S]]) { // top lip at the old cornice cap, 0.38 m from the wall centre
        block('Tower base cornice', m, [core.x[0] - out, core.x[1] + out], dy, [core.t[0] - out, core.t[1] + out]);
        for (const [[x0, x1], side] of piers) {
          const [t0, t1] = side > 0 ? P.t : [-P.t[1], -P.t[0]];
          block('Tower base cornice', m, [x0 - out, x1 + out], dy, [t0 - out, t1 + out]);
        }
      }
      // Side faces between piers: architrave, frieze and dentils on the outer side.
      entab('Tower base architrave', S, [P.front[1], P.back[0]], E.architrave, [C + spec.wall, C + spec.wall + .18]);
      for (let x = P.front[1] + .06; x <= P.back[0] - .05; x += .12) entab('Tower base dentil', S, [x, x + .06], E.dentils, [C + spec.wall, C + spec.wall + .16]);
      add('Tower base Greek-key frieze', S, meanderGeo(P.back[0] - P.front[1], E.frieze[1] - E.frieze[0]), place(RY(s > 0 ? 0 : Math.PI), TR(s > 0 ? P.front[1] : P.back[0], E.frieze[0], Z(C + spec.wall + .1))), CARVED);

      // ---- Corner piers of the upper stages ----
      for (const g of spec.stages) {
        const [y0, y1] = g.y, front = [2.45 - g.u / 2 - .45, 2.45 - g.u / 2 + 1.1], back = [2.45 + g.u / 2 - 1.1, 2.45 + g.u / 2 + .45];
        for (const [xs, side] of [[front, 1], [front, -1], [back, 1], [back, -1]]) {
          const ts = side > 0 ? g.t : [-g.t[1], -g.t[0]], grow = (a, d) => [a[0] - d, a[1] + d];
          block('Tower stage pier pedestal', S, grow(xs, .1), [y0, y0 + .6], grow(ts, .08));
          block('Tower stage pier shaft', W, xs, [y0 + .6, g.cap[0]], ts);
          const tm = (ts[0] + ts[1]) / 2, isFront = xs === front, outer = side > 0;
          if (isFront) {
            for (const k of [-1, 0, 1]) block('Tower pier flute', D, [xs[0] - .013, xs[0] + .002], [y0 + .85, g.cap[0] - .15], [tm + k * .16 - .022, tm + k * .16 + .022]);
            add('Tower pier capital foliage', S, pilasterCapital(.66, (g.cap[1] - g.cap[0]) * .95), place(RY(-Math.PI / 2), TR(xs[0] - .01, g.cap[0], Z(tm))), CARVED);
          }
          if (outer) {
            const xm = (xs[0] + xs[1]) / 2, tf = ts[1];
            for (const k of [-1, 0, 1]) block('Tower pier flute', D, [xm + k * .16 - .022, xm + k * .16 + .022], [y0 + .85, g.cap[0] - .15], [tf - .002, tf + .013]);
            add('Tower pier capital foliage', S, pilasterCapital(.66, (g.cap[1] - g.cap[0]) * .95), place(RY(s > 0 ? 0 : Math.PI), TR(xm, g.cap[0], Z(tf + .01))), CARVED);
          }
          block('Tower pier capital band', S, grow(xs, .03), g.cap, grow(ts, .03));
          for (const [dy, out, m] of [[[g.cap[1], g.cap[1] + .12], .06, S], [[g.cap[1] + .12, y1 - .16], .12, W], [[y1 - .16, y1], .2, S]]) block('Tower stage pier cornice', m, grow(xs, out), dy, grow(ts, out));
          stats.piers++;
        }
      }

      // ---- Front composition: archivolt on impost pilasters, blind arch on colonnettes ----
      const A = spec.arch, B = spec.blind;
      for (const e of [-1, 1]) {
        const [i0, i1] = e > 0 ? A.impost : [-A.impost[1], -A.impost[0]];
        block('Tower front impost pilaster', W, [wallFace - .16, wallFace], [.3, A.spring - .5], [i0, i1]);
        block('Tower front impost base', S, [wallFace - .22, wallFace], [0, .3], [i0 - .04, i1 + .04]);
        block('Tower front impost capital', S, [wallFace - .2, wallFace], [A.spring - .5, A.spring], [i0 - .03, i1 + .03]);
        add('Tower front impost capital foliage', S, pilasterCapital(.4, .42), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .2, A.spring - .48, Z((i0 + i1) / 2))), CARVED);
        // Colonnettes of the blind arch.
        const tcol = e * B.colonnette;
        add('Tower blind-arch colonnette', S, new T.CylinderGeometry(.085, .095, B.spring - .65, 14), TR(wallFace - .14, .3 + (B.spring - .65) / 2, Z(tcol)));
        block('Tower blind-arch colonnette base', S, [wallFace - .26, wallFace], [0, .3], [tcol - .14, tcol + .14]);
        block('Tower blind-arch colonnette capital', S, [wallFace - .27, wallFace], [B.spring - .35, B.spring], [tcol - .16, tcol + .16]);
        add('Tower blind-arch capital foliage', S, pilasterCapital(.3, .3), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .27, B.spring - .33, Z(tcol))), CARVED);
        // Leaf sprays in the spandrels.
        add('Tower front spandrel spray', S, spray(1.1), place(SC(-e * s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .02, 5.55, Z(e * 1.45))), CARVED);
      }
      // Archivolt: three rings, the outer one proud.
      slab('Tower front archivolt', S, 'front', ring(0, A.spring, A.r[0] + .12, A.r[1], 0), 0, .16, DRAWN, 32);
      slab('Tower front archivolt inner ring', S, 'front', ring(0, A.spring, A.r[0], A.r[0] + .12, 0), 0, .1, DRAWN, 32);
      // Blind arch: its archivolt, then a recessed panel (the wall stays closed behind it).
      slab('Tower blind-arch archivolt', S, 'front', ring(0, B.spring, B.r[0], B.r[1], 0), 0, .14, DRAWN, 28);
      {
        const sh = new T.Shape(); sh.moveTo(-B.r[0], .3); sh.lineTo(B.r[0], .3); sh.lineTo(B.r[0], B.spring); sh.absarc(0, B.spring, B.r[0], 0, Math.PI, false); sh.lineTo(-B.r[0], .3);
        slab('Tower blind-arch recessed panel', D, 'front', sh, 0, .015, DRAWN, 24);
        const inner = new T.Shape(); inner.moveTo(-B.r[0] + .12, .45); inner.lineTo(B.r[0] - .12, .45); inner.lineTo(B.r[0] - .12, B.spring); inner.absarc(0, B.spring, B.r[0] - .12, 0, Math.PI, false); inner.lineTo(-B.r[0] + .12, .45);
        slab('Tower blind-arch panel', W, 'front', inner, .015, .035, DRAWN, 24);
        stats.blindArches++;
      }
      // Cartouche in the tympanum between the two arches, and the moulded sill of the big arch.
      add('Tower front cartouche', S, K.cartouche({ len: 1.25, r: .13 }), place(RY(-Math.PI / 2), TR(wallFace - .04, 4.72, Z(0))), CARVED);
      block('Tower front arch sill band', S, [wallFace - .12, wallFace], [A.spring - .08, A.spring], [-A.r[0], A.r[0]]);
      // ---- Outer side: a smaller blind arch between the piers ----
      {
        const xm = (P.front[1] + P.back[0]) / 2, half = (P.back[0] - P.front[1]) / 2 - .3, spring = 3.4;
        const sideRing = ring(0, spring, half - .25, half, spring - .3);
        add('Tower side archivolt', S, new T.ExtrudeGeometry(sideRing, { depth: .14, bevelEnabled: false, curveSegments: 28 }), place(RY(s > 0 ? 0 : Math.PI), TR(xm, 0, Z(C + spec.wall))));
        const border = ring(0, spring, half - .32, half - .25, spring - .5);
        add('Tower side blind-arch border', D, new T.ExtrudeGeometry(border, { depth: .02, bevelEnabled: false, curveSegments: 24 }), place(RY(s > 0 ? 0 : Math.PI), TR(xm, 0, Z(C + spec.wall))));
        const panel = new T.Shape(); panel.moveTo(-half + .25, .5); panel.lineTo(half - .25, .5); panel.lineTo(half - .25, spring); panel.absarc(0, spring, half - .25, 0, Math.PI, false); panel.lineTo(-half + .25, .5);
        add('Tower side blind-arch panel', W, new T.ExtrudeGeometry(panel, { depth: .015, bevelEnabled: false, curveSegments: 24 }), place(RY(s > 0 ? 0 : Math.PI), TR(xm, 0, Z(C + spec.wall))));
        for (const e of [-1, 1]) block('Tower side impost', S, [xm + e * half - .14, xm + e * half + .14], [0, spring - .3], [C + spec.wall, C + spec.wall + .12]);
      }

      // ---- Top: dome, lantern, crown, cross; pinnacles on the balustrade corners ----
      const DM = spec.dome, LN = spec.lantern, xc = 2.45;
      const profile = [];
      profile.push(new T.Vector2(DM.r, DM.y0), new T.Vector2(DM.r, DM.wall));
      const b = (DM.top - DM.wall) / Math.sqrt(1 - (0.94 / DM.r) ** 2);
      for (let i = 1; i <= 24; i++) { const y = DM.wall + (DM.top - DM.wall) * i / 24; profile.push(new T.Vector2(DM.r * Math.sqrt(Math.max(0, 1 - ((y - DM.wall) / b) ** 2)), y)); }
      profile.push(new T.Vector2(0.001, DM.top));
      add('Tower dome · CAD profile', CAP, new T.LatheGeometry(profile, 48), TR(xc, 0, zc));
      const rDome = y => y <= DM.wall ? DM.r : DM.r * Math.sqrt(Math.max(0, 1 - ((y - DM.wall) / b) ** 2));
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4 + Math.PI / 8;
        const pts = Array.from({ length: 16 }, (_, i) => { const y = DM.wall + (DM.top - .05 - DM.wall) * i / 15, r = rDome(y) + .03; return [xc + Math.cos(a) * r, y, zc + Math.sin(a) * r]; });
        add('Tower dome rib', S, K.stem(pts, .045, .045, 18, 6));
      }
      add('Tower dome base moulding', S, new T.TorusGeometry(DM.r + .02, .06, 8, 48), place(RX(Math.PI / 2), TR(xc, DM.wall, zc)));
      // Rosettes on the four faces, as the drawn rosette at +31.8.
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2, r = rDome(DM.rosette) + .02, n = new T.Vector3(Math.cos(a), 0, Math.sin(a));
        const rot = new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), n));
        add('Tower dome rosette', S, K.bloom({ r: .32, petals: 12, rings: 2, seg: 3 }), place(rot, TR(xc + n.x * r, DM.rosette, zc + n.z * r)), CARVED);
        add('Tower dome rosette ring', S, new T.TorusGeometry(.42, .04, 6, 32), place(rot, TR(xc + n.x * (r - .02), DM.rosette, zc + n.z * (r - .02))));
      }
      const sq = (name, m_, [y0, y1, h]) => add(name, m_, new T.BoxGeometry(2 * h, y1 - y0, 2 * h), TR(xc, (y0 + y1) / 2, zc));
      sq('Tower lantern plinth', S, LN.plinth); sq('Tower lantern plinth step', S, LN.step); sq('Tower lantern base', S, LN.base); sq('Tower lantern body', W, LN.body);
      for (const ex of [-1, 1]) for (const ez of [-1, 1]) add('Tower lantern corner post', S, new T.BoxGeometry(.1, LN.body[1] - LN.body[0], .1), TR(xc + ex * LN.body[2], (LN.body[0] + LN.body[1]) / 2, zc + ez * LN.body[2]));
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2, n = new T.Vector3(Math.cos(a), 0, Math.sin(a)), rot = new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), n));
        add('Tower lantern panel rosette', S, K.bloom({ r: .14, petals: 6, rings: 1, seg: 3 }), place(rot, TR(xc + n.x * (LN.body[2] + .01), (LN.body[0] + LN.body[1]) / 2, zc + n.z * (LN.body[2] + .01))), CARVED);
      }
      sq('Tower lantern bead band', S, [LN.beads[0], LN.beads[0] + .05, LN.beads[2]]);
      for (let k = 0; k < 24; k++) {
        const side = Math.floor(k / 6), f = (k % 6 + .5) / 6 * 2 - 1, h = LN.beads[2];
        const [dx, dz] = [[f * h, -h], [h, f * h], [-f * h, h], [-h, -f * h]][side];
        add('Tower lantern beads', S, new T.SphereGeometry(.045, 8, 6), TR(xc + dx, (LN.beads[0] + LN.beads[1]) / 2 + .02, zc + dz));
      }
      // Open crown: eight acanthus leaves rising and curling out, eight smaller between.
      const big = K.leaf({ len: .95, wid: .62, thick: .05, curl: 2.4, lobes: 3, cup: .45, seg: 8, fine: false });
      const small = K.leaf({ len: .7, wid: .4, thick: .04, curl: 2.6, lobes: 3, cup: .35, seg: 6, fine: false });
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        add('Tower lantern acanthus crown', S, big, place(RX(.85), RY(Math.PI / 2 - a), TR(xc + Math.cos(a) * .42, LN.crown[0], zc + Math.sin(a) * .42)), CARVED);
        const a2 = a + Math.PI / 8;
        add('Tower lantern acanthus crown', S, small, place(RX(.45), RY(Math.PI / 2 - a2), TR(xc + Math.cos(a2) * .3, LN.crown[0] + .25, zc + Math.sin(a2) * .36)), CARVED);
      }
      add('Tower lantern crown core', S, new T.CylinderGeometry(.12, .3, .7, 16), TR(xc, LN.crown[0] + .35, zc));
      add('Tower lantern crown neck', S, new T.CylinderGeometry(.09, .12, LN.ball - LN.crown[0] - .7, 12), TR(xc, (LN.crown[0] + .7 + LN.ball) / 2, zc));
      add('Tower lantern ball', S, new T.SphereGeometry(.2, 18, 14), TR(xc, LN.ball, zc));
      // Trefoil cross, in the old cross's material.
      const [c0, c1] = LN.cross;
      add('Tower cross', crossMaterial, new T.BoxGeometry(.1, c1 - c0 - .1, .1), TR(xc, (c0 + c1 - .1) / 2, zc));
      add('Tower cross arm', crossMaterial, new T.BoxGeometry(.1, .1, 1.0), TR(xc, LN.arm, zc));
      for (const [y, dz] of [[c1 - .09, 0], [LN.arm, -.52], [LN.arm, .52]]) for (const [u, v] of [[0, .05], [-.06, -.01], [.06, -.01]]) {
        const up = dz === 0, dy = up ? v : u, ddz = up ? u : Math.sign(dz) * v;
        add('Tower cross trefoil end', crossMaterial, new T.SphereGeometry(.055, 10, 8), TR(xc, y + dy, zc + dz + ddz));
      }
      // Pinnacles with fleur-de-lis on the four corner pedestals of the balustrade.
      const pin = K.pinnacle({ w: .3, h: spec.pinnacle.h * .8 }), fl = fleur(.32);
      for (const ex of [-1, 1]) for (const ez of [-1, 1]) {
        const px = xc + ex * spec.pinnacle.at, pz = zc + ez * spec.pinnacle.at;
        add('Tower corner pinnacle', S, pin, TR(px, spec.pinnacle.y, pz), CARVED);
        add('Tower corner pinnacle fleur-de-lis', S, fl, place(RY(Math.atan2(ex, ez)), TR(px, spec.pinnacle.y + spec.pinnacle.h * .8 + .02, pz)), CARVED);
      }
    });

    // ---- Meshes, with welded indices so the display batches keep their saving ----
    const indexed = g => {
      const pos = g.attributes.position.array, nor = g.attributes.normal.array, uv = g.attributes.uv?.array, n = pos.length / 3;
      const seen = new Map(), index = new Uint32Array(n), P = [], Nn = [], U = [];
      for (let i = 0; i < n; i++) {
        const key = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2], uv ? uv[i * 2] : 0, uv ? uv[i * 2 + 1] : 0].map(v => Math.round(v * 1e5)).join();
        let k = seen.get(key);
        if (k === undefined) { k = P.length / 3; seen.set(key, k); P.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); Nn.push(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]); U.push(uv ? uv[i * 2] : 0, uv ? uv[i * 2 + 1] : 0); }
        index[i] = k;
      }
      const out = new T.BufferGeometry();
      out.setAttribute('position', new T.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(Nn, 3)); out.setAttribute('uv', new T.Float32BufferAttribute(U, 2));
      out.setIndex(new T.BufferAttribute(index, 1)); g.dispose();
      return out;
    };
    let meshes = 0, triangles = 0;
    for (const { name, material, status, parts } of bins.values()) {
      const geometry = indexed(merge(parts));
      const mesh = new T.Mesh(geometry, material);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData = { status, source: SOURCE };
      root.add(mesh);
      meshes++; triangles += geometry.index.count / 3;
    }
    Object.assign(stats, { meshes, triangles: Math.round(triangles) });
    root.userData.stats = stats;
    window.CHURCH_TOWERS.stats = stats;
    data?.assumptions?.push('Tower bases and tops follow the church’s CAD file of 23 October 2026 (E01B, plan sheet 5) at the owner’s direction of 25 October 2026: closed fronts with a blind arch inside an archivolt, massive fluted corner piers on pedestals, a Greek-key entablature to the +8.39 cornice, a door from the nave into each tower room, and a ribbed dome with rosettes, lantern, acanthus crown, ball and trefoil cross to +36.92, with fleur-de-lis pinnacles on the balustrade corners. The stage-1 wall plane stays at X 0.');
  }
})();
