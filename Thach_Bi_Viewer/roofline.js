/* Roofline ornament after the church's CAD file, metres.
   Parish priest's meeting of 25 October 2026, point 4 (the roof and its heights follow the new
   drawings); owner, the same day: follow the side elevation. Sources, traced in model axes:
   - DWG side elevation E02: over the porch cornice a balustrade +6.35 to +7.05 with a pedestal and
     a fleur-de-lis pinnacle to +8.0 on every axis; the 9–10 side gables with outer piers
     (pinnacles to +10.75), inner piers (pinnacles to +12.9), stepped raking cornices, a rose at
     +7.55 and a crowning niche aedicule with volutes, ball and cross to +15.2.
   - DWG gabled-end elevation E03 (axis 12): corner piers (pinnacles to +10.2), C/G piers (+11.5),
     D/E piers (+14.65), crested parapets over the porch ends, a lower and an upper raking
     cornice with leaf crests, a band between the D/E piers at +7.6 to +8.55, a rose at +10.0 and a
     crowning aedicule with its cross at +17.829.
   The roof planes, ridge (+12.472) and eaves already follow sections 24/25 and are kept.
   Depths, moulding profiles and carving are illustrative; nothing here implies a structure. */
(() => {
  const SOURCE = 'CAD file 23 Oct 2026 · side elevation E02, gabled-end elevation E03; owner 25 Oct 2026';
  const DRAWN = 'TRACED CAD ELEVATION / SCHEMATIC DEPTH';
  const CARVED = 'TRACED CAD ELEVATION / ILLUSTRATIVE CARVING';
  const spec = {
    revision: '2026-10-25-cad-roofline-1',
    parapet: { z: 10.6, y: [6.35, 7.05], half: 0.12, pedestal: 0.25, pinnacle: 0.95, runs: [['2′', '9'], ['10', '12']] },
    side: {
      x: 40.575, face: 13.56, wall: [13.18, 13.56],
      outline: [[-3.57, 6.2], [3.57, 6.2], [3.57, 7.35], [2.73, 8.6], [2.08, 8.95], [1.3, 9.75], [-1.3, 9.75], [-2.08, 8.95], [-2.73, 8.6], [-3.57, 7.35]],
      outer: { u: [3.57, 4.37], shaft: [6.3, 7.9], capital: [7.9, 8.15], pedestal: [8.15, 8.6], top: 10.75 },
      inner: { u: [2.08, 2.73], shaft: [6.3, 9.3], capital: [9.3, 9.55], pedestal: [9.55, 11.1], top: 12.9 },
      rakes: [[[3.57, 7.15], [2.73, 8.5]], [[2.08, 8.85], [1.3, 9.62]]], band: [9.3, 9.75],
      rose: [0, 7.55, 0.8],
      aedicule: { base: 9.75, niche: 0.62, pier: [0.62, 1.1], spring: 11.9, crown: 12.6, pierTop: 12.1, pinnacle: 13.4, volute: [1.1, 1.9, 11.75], ball: 13.4, cross: [13.65, 15.2], arm: 14.6 },
    },
    rear: {
      face: 53.24,
      corner: { u: [10.2, 10.95], shaft: [6.3, 7.5], capital: [7.5, 7.8], pedestal: [7.8, 8.6], top: 10.2 },
      cg: { u: [7.05, 7.7], shaft: [6.3, 9.1], capital: [9.1, 9.35], pedestal: [9.35, 9.85], top: 11.5 },
      de: { u: [3.25, 3.95], shaft: [6.3, 11.7], capital: [11.7, 12.0], pedestal: [12.0, 13.2], top: 14.65 },
      crest: { u: [7.7, 10.2], band: [6.8, 7.05], top: 7.6 },
      rakes: [[[7.0, 7.4], [3.95, 10.1]], [[3.2, 10.4], [1.25, 12.45]]], band: [12.0, 12.5], mid: [7.6, 8.55],
      rose: [0, 10.0, 0.8],
      aedicule: { base: 12.5, niche: 0.62, pier: [0.62, 1.1], spring: 14.4, crown: 15.15, pierTop: 14.6, pinnacle: 16.0, volute: [1.1, 1.9, 14.6], ball: 16.05, cross: [16.35, 17.829], arm: 17.25 },
    },
  };
  window.CHURCH_ROOFLINE = { spec, prepare };

  function prepare({ THREE: T, exterior, mat, data }) {
    if (!exterior || !window.CHURCH_TOWERS?.ornament) return;
    exterior.updateMatrixWorld(true);
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, RZ, SC, place, merge } = K;
    const { fleur, pilasterCapital, meanderGeo } = window.CHURCH_TOWERS.ornament(T, K);
    const A = data.longitudinal;

    // ---- Superseded bundle parts ----
    const remove = [], box3 = new T.Box3();
    let crossMaterial = mat.metal;
    exterior.traverse(o => {
      // Porch eave crest and the small finials over the porch cornice (the parapet replaces them).
      if (/^Outer veranda [BH] /.test(o.name) && !/9–10$/.test(o.name)) o.traverse(m => { if (m.isMesh && box3.setFromObject(m).min.y > 6.33) remove.push(m); });
    });
    let sideGroups = [], rearGroup = null;
    exterior.traverse(o => {
      if (o.name === 'Schematic side ornamental gable' && o.parent) sideGroups.push(o.parent);
      if (o.name === 'Ornate opposite-end gable' && o.parent) rearGroup = o.parent;
    });
    sideGroups.forEach(g => g.traverse(m => { if (m.isMesh && /cross/i.test(m.name)) crossMaterial = m.material; }));
    // Rear gable: the end wall and the ground storey stay; ornament above +7.55 goes.
    rearGroup?.traverse(m => { if (m.isMesh && m.name !== 'Ornate opposite-end gable' && box3.setFromObject(m).min.y > 7.55) remove.push(m); });
    remove.forEach(o => o.removeFromParent());
    sideGroups.forEach(g => g.removeFromParent());

    const root = new T.Group();
    root.name = 'Roofline ornament — CAD file 23 Oct 2026';
    root.userData = { status: DRAWN, source: SOURCE, revision: spec.revision };
    exterior.add(root);
    const bins = new Map();
    const add = (name, material, geometry, matrix = null, status = DRAWN) => {
      const key = name + '\u0000' + material.uuid;
      if (!bins.has(key)) bins.set(key, { name, material, status, parts: [] });
      bins.get(key).parts.push([geometry, matrix]);
    };
    const W = mat.wall, S = mat.trim, D = mat.darkTrim;
    const stats = { pinnacles: 0, crosses: 0, balusters: 0, removedBundleMeshes: remove.length + sideGroups.length };

    // A face frame: world = origin + u·U + v·Y + w·N (N out of the face). Shapes and parts are
    // built in (u, v) with +z out of the face.
    const frame = (origin, U, N) => new T.Matrix4().set(U[0], 0, N[0], origin[0], U[1], 1, N[1], origin[1], U[2], 0, N[2], origin[2], 0, 0, 0, 1);
    const face = F => {
      const at = (u, v, w, ...pre) => place(...pre, TR(u, v, w)).premultiply(F);
      const blk = (name, m, [u0, u1], [v0, v1], [w0, w1], st) => add(name, m, new T.BoxGeometry(u1 - u0, v1 - v0, w1 - w0), at((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2), st);
      const slab = (name, m, shape, w0, w1, st, seg = 20) => add(name, m, new T.ExtrudeGeometry(shape, { depth: w1 - w0, bevelEnabled: false, curveSegments: seg }), at(0, 0, w0), st);
      const poly = pts => new T.Shape(pts.map(([u, v]) => new T.Vector2(u, v)));
      // Pier: fluted shaft, foliate capital band, cornice cap, pedestal, pinnacle with fleur-de-lis.
      const pier = (P, d = .38) => {
        const [u0, u1] = P.u, um = (u0 + u1) / 2, half = (u1 - u0) / 2;
        blk('Gable pier shaft', W, [u0, u1], P.shaft, [0, d]);
        for (const k of [-1, 0, 1]) blk('Gable pier flute', D, [um + k * half * .4 - .02, um + k * half * .4 + .02], [P.shaft[0] + .2, P.shaft[1] - .15], [d, d + .012]);
        blk('Gable pier capital band', S, [u0 - .04, u1 + .04], P.capital, [-.02, d + .04]);
        add('Gable pier capital foliage', S, pilasterCapital(u1 - u0, (P.capital[1] - P.capital[0]) * .95), at(um, P.capital[0], d + .04), CARVED);
        blk('Gable pier cornice', S, [u0 - .1, u1 + .1], [P.capital[1], P.capital[1] + .1], [-.05, d + .1]);
        blk('Gable pier pedestal', W, [u0 + .04, u1 - .04], [P.capital[1] + .1, P.pedestal[1]], [0, d - .04]);
        blk('Gable pier pedestal cap', S, [u0 - .03, u1 + .03], [P.pedestal[1] - .08, P.pedestal[1]], [-.03, d + .03]);
        pinnacle(um, P.pedestal[1], P.top, Math.min(.36, u1 - u0 - .12), d / 2);
      };
      const pinnacle = (u, v0, v1, w, wc) => {
        const h = v1 - v0, fl = Math.min(.42, h * .25);
        add('Gable pinnacle', S, K.pinnacle({ w, h: h - fl }), at(u, v0, wc), CARVED);
        add('Gable pinnacle fleur-de-lis', S, fleur(fl), at(u, v1 - fl, wc), CARVED);
        stats.pinnacles++;
      };
      // Raking cornice between two points (u0 < u1 in |u|), mirrored to both sides: a band with a
      // Greek-key face, hanging dentils and a leaf crest standing on it.
      const rake = ([a, b], thick = .45, d = .42, crest = true) => {
        for (const e of [-1, 1]) {
          const p = [[e * a[0], a[1]], [e * b[0], b[1]], [e * b[0], b[1] + thick], [e * a[0], a[1] + thick]];
          slab('Gable raking cornice', S, poly(e > 0 ? p : p.slice().reverse()), 0, d);
          // The frieze runs from the left end of the rake so that it stays upright on both sides.
          const [p0, p1] = e > 0 ? [b, a] : [[-a[0], a[1]], [-b[0], b[1]]], u0 = e > 0 ? p0[0] : p0[0];
          const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
          add('Gable raking Greek-key frieze', S, meanderGeo(len, thick * .5), place(TR(0, thick * .22, 0), RZ(ang), TR(u0, p0[1], d)).premultiply(F), CARVED);
          const n = Math.floor(len / .13);
          for (let i = 0; i < n; i++) { const t = (i + .5) / n, u = e * (a[0] + (b[0] - a[0]) * t), v = a[1] + (b[1] - a[1]) * t; blk('Gable raking dentil', S, [u - .03, u + .03], [v - .16, v], [.02, d - .06]); }
          if (crest) for (let t = .18; t < .96; t += .22) {
            const u = e * (a[0] + (b[0] - a[0]) * t), v = a[1] + (b[1] - a[1]) * t + thick;
            add('Gable raking leaf crest', S, fleur(.42), at(u, v, d / 2), CARVED);
          }
        }
      };
      const rose = ([u, v, r], w = .4) => {
        add('Gable rose ring', S, new T.TorusGeometry(r, .05, 8, 40), at(u, v, w));
        add('Gable rose ring', S, new T.TorusGeometry(r * .82, .035, 8, 40), at(u, v, w));
        add('Gable rose tracery', S, K.bloom({ r: r * .7, petals: 12, rings: 2, seg: 3 }), at(u, v, w - .02), CARVED);
      };
      // Crowning aedicule: lobed niche between two piers with pinnacles, volutes, ball and cross.
      const aedicule = (E, d = .42) => {
        const lobe = (half, spring, crown) => { const p = new T.Path(); p.moveTo(-half, spring); p.quadraticCurveTo(-half, spring + (crown - spring) * .6, -half * .55, spring + (crown - spring) * .55); p.quadraticCurveTo(0, crown + .08, half * .55, spring + (crown - spring) * .55); p.quadraticCurveTo(half, spring + (crown - spring) * .6, half, spring); return p.getPoints(12); };
        const outline = [[-E.pier[1], E.base], [E.pier[1], E.base], [E.pier[1], E.pierTop], ...lobe(E.pier[1] - .05, E.pierTop, E.crown + .25).reverse().map(p => [p.x, p.y]), [-E.pier[1], E.pierTop]];
        slab('Gable aedicule back wall', W, poly(outline), -.2, .12);
        const niche = poly([[-E.niche, E.base + .1], [E.niche, E.base + .1], [E.niche, E.spring], ...lobe(E.niche, E.spring, E.crown).reverse().map(p => [p.x, p.y]), [-E.niche, E.spring]]);
        slab('Gable aedicule niche', D, niche, .12, .13);
        blk('Gable aedicule pedestal', S, [-.42, .42], [E.base + .1, E.base + .55], [.13, .45]);
        for (const e of [-1, 1]) {
          const [p0, p1] = e > 0 ? E.pier : [-E.pier[1], -E.pier[0]];
          blk('Gable aedicule pier', W, [p0, p1], [E.base, E.pierTop], [0, d]);
          blk('Gable aedicule pier cap', S, [p0 - .05, p1 + .05], [E.pierTop, E.pierTop + .12], [-.03, d + .05]);
          pinnacle((p0 + p1) / 2, E.pierTop + .12, E.pinnacle, .3, d / 2);
          // S-scroll volute on the outer side, from the base up to the pier.
          const [v0, v1, top] = E.volute, s = e;
          const pts = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return [s * (v1 - (v1 - v0) * Math.sin(t * Math.PI / 2)), E.base + .1 + (top - E.base) * t, d / 2]; });
          add('Gable aedicule volute', S, K.stem(pts.map(([u, v, w]) => { const p = new T.Vector3(u, v, w).applyMatrix4(F); return [p.x, p.y, p.z]; }), .07, .05, 16, 6), null, CARVED);
          add('Gable aedicule volute scroll', S, K.stem(K.scroll(0, 0, .14, 1.3, 0, s), .045, .02, 12, 5), at(s * v1, E.base + .25, d / 2), CARVED);
        }
        // Arch moulding over the niche, crest, ball and trefoil cross.
        const arc = lobe(E.niche + .12, E.spring, E.crown + .12).map(p => { const v = new T.Vector3(p.x, p.y, d * .6).applyMatrix4(F); return [v.x, v.y, v.z]; });
        add('Gable aedicule arch moulding', S, K.stem(arc, .06, .06, 24, 6));
        add('Gable aedicule crest', S, K.cartouche({ len: 1.1, r: .14 }), at(0, E.crown + .32, d * .5), CARVED);
        add('Gable aedicule ball', S, new T.SphereGeometry(.25, 16, 12), at(0, E.ball, d * .5));
        const [c0, c1] = E.cross;
        blk('Gable cross', crossMaterial, [-.05, .05], [c0, c1 - .1], [d * .5 - .05, d * .5 + .05]);
        blk('Gable cross arm', crossMaterial, [-.5, .5], [E.arm - .05, E.arm + .05], [d * .5 - .05, d * .5 + .05]);
        for (const [u, v] of [[0, c1 - .055], [-.5, E.arm], [.5, E.arm]]) add('Gable cross trefoil end', crossMaterial, new T.SphereGeometry(.055, 10, 8), at(u, v, d * .5));
        stats.crosses++;
      };
      return { at, blk, slab, poly, pier, pinnacle, rake, rose, aedicule };
    };

    // ---- Porch parapets: balustrade on the porch cornice, pedestal and pinnacle on every axis ----
    const PP = spec.parapet;
    for (const s of [-1, 1]) {
      const zc = s * PP.z;
      for (const [from, to] of PP.runs) {
        const keys = Object.keys(A).filter(k => A[k] >= A[from] - 1e-6 && A[k] <= A[to] + 1e-6).sort((a, b) => A[a] - A[b]);
        const blk = (name, m, [x0, x1], [y0, y1], [z0, z1], st) => add(name, m, new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), TR((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), st);
        const zr = h => [zc - h, zc + h];
        for (let i = 0; i < keys.length; i++) {
          const x = A[keys[i]], P = PP.pedestal;
          blk('Porch parapet pedestal', W, [x - P, x + P], PP.y, zr(P));
          blk('Porch parapet pedestal cap', S, [x - P - .04, x + P + .04], [PP.y[1] - .07, PP.y[1]], zr(P + .04));
          add('Porch parapet pinnacle', S, K.pinnacle({ w: .26, h: PP.pinnacle - .3 }), TR(x, PP.y[1], zc), CARVED);
          add('Porch parapet pinnacle fleur-de-lis', S, fleur(.3), place(RY(s < 0 ? Math.PI : 0), TR(x, PP.y[1] + PP.pinnacle - .3, zc)), CARVED);
          stats.pinnacles++;
          if (i === keys.length - 1) continue;
          const x0 = x + P, x1 = A[keys[i + 1]] - P;
          blk('Porch parapet plinth', S, [x0, x1], [PP.y[0], PP.y[0] + .12], zr(PP.half + .03));
          blk('Porch parapet top rail', S, [x0, x1], [PP.y[1] - .1, PP.y[1]], zr(PP.half + .02));
          const n = Math.max(2, Math.round((x1 - x0) / .21));
          for (let k = 1; k < n; k++) { add('Porch parapet baluster', S, new T.CylinderGeometry(.05, .07, PP.y[1] - PP.y[0] - .22, 10), TR(x0 + (x1 - x0) * k / n, (PP.y[0] + .12 + PP.y[1] - .1) / 2, zc)); stats.balusters++; }
        }
      }
    }

    // ---- 9–10 side gables (E02) ----
    const SG = spec.side;
    for (const s of [-1, 1]) {
      const F = frame([SG.x, 0, s * SG.face], [s, 0, 0], [0, 0, s]);
      const f = face(F);
      // The gable wall itself, to the CAD silhouette, across the existing wall thickness.
      f.slab('Side gable wall · CAD silhouette', W, f.poly(SG.outline), -(SG.wall[1] - SG.wall[0]), 0);
      for (const e of [-1, 1]) {
        for (const P of [SG.outer, SG.inner]) f.pier({ ...P, u: e > 0 ? P.u : [-P.u[1], -P.u[0]] });
      }
      f.rake(SG.rakes[0]); f.rake(SG.rakes[1], .45, .42, false);
      f.blk('Side gable top band', S, [-1.3, 1.3], SG.band, [0, .42]);
      add('Side gable Greek-key frieze', S, meanderGeo(2.6, .22), f.at(-1.3, SG.band[0] + .1, .42), CARVED);
      f.rose(SG.rose);
      f.aedicule(SG.aedicule);
    }

    // ---- Rear gable on axis 12 (E03) ----
    const RG = spec.rear;
    {
      const F = frame([RG.face, 0, 0], [0, 0, 1], [1, 0, 0]);
      const f = face(F);
      // Gable wall raised to the CAD silhouette under the rakes (the old end wall stops lower).
      const [[l0, l1], [h0, h1]] = RG.rakes;
      f.slab('Rear gable wall · CAD silhouette', W, f.poly([[-l0[0], 7.0], [l0[0], 7.0], [l0[0], l0[1]], [l1[0], l1[1]], [h0[0], h0[1]], [h1[0], h1[1]], [-h1[0], h1[1]], [-h0[0], h0[1]], [-l1[0], l1[1]], [-l0[0], l0[1]]]), -.44, 0);
      for (const e of [-1, 1]) for (const P of [RG.corner, RG.cg, RG.de]) f.pier({ ...P, u: e > 0 ? P.u : [-P.u[1], -P.u[0]] });
      // The D/E piers carry on above the mid band: a second fluted stage to the upper capital.
      for (const e of [-1, 1]) {
        const C = RG.crest, [c0, c1] = e > 0 ? C.u : [-C.u[1], -C.u[0]];
        f.blk('Rear gable porch-end parapet', S, [c0, c1], C.band, [0, .32]);
        add('Rear gable porch-end frieze', S, meanderGeo(c1 - c0, .18), f.at(c0, C.band[0] + .03, .32), CARVED);
        for (let u = c0 + .25; u < c1 - .1; u += .3) add('Rear gable porch-end crest', S, fleur(C.top - C.band[1]), f.at(u, C.band[1], .16), CARVED);
      }
      f.blk('Rear gable mid band', S, [-RG.de.u[0], RG.de.u[0]], RG.mid, [0, .36]);
      add('Rear gable mid Greek-key frieze', S, meanderGeo(2 * RG.de.u[0], .2), f.at(-RG.de.u[0], RG.mid[0] + .45, .36), CARVED);
      for (let u = -RG.de.u[0] + .06; u < RG.de.u[0]; u += .13) f.blk('Rear gable mid dentil', S, [u, u + .06], [RG.mid[0], RG.mid[0] + .15], [.02, .3]);
      f.rake(RG.rakes[0]); f.rake(RG.rakes[1]);
      f.blk('Rear gable top band', S, [-RG.rakes[1][1][0], RG.rakes[1][1][0]], RG.band, [0, .42]);
      f.rose(RG.rose);
      f.aedicule(RG.aedicule);
    }

    // ---- Meshes with welded indices ----
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
    window.CHURCH_ROOFLINE.stats = stats;
    data?.assumptions?.push('The roofline follows the church’s CAD file of 23 October 2026 (E02, E03) at the owner’s direction of 25 October 2026: a balustrade with axis pinnacles over the porch cornices, the stepped 9–10 side gables with a crowning niche and cross, and the stepped rear gable with its crowning niche and cross at +17.829. Roof planes and ridge are unchanged (sections 24/25).');
  }
})();
