/* Exterior roofline, metres, audited against DWG version 23102026 on 26 October 2026.
   Source handles and coordinate transforms: docs/exterior-23102026/roofline-witnesses.json.
   E02 porch parapets; EW outside side-wing gables; E03 sanctuary-end gable. Circular niche
   arches, rose ring boundaries, trefoil cross outlines and mitred cornice boundaries use CAD
   geometry. Relief depth, capitals, tracery, scrollwork and pinnacles' carving remain proxies.
   Existing roof planes remain at the adopted ridge +12.472 while E02/S24/S25 also draw
   +12.3964 (ISSUE-R05). INSUNITS=1 versus inferred mm/m remains ISSUE-R06; no rescaling or
   construction confirmation is implied. */
(() => {
  const SOURCE = 'CAD file 23 Oct 2026 · side elevation E02, gabled-end elevation E03; owner 25 Oct 2026';
  const DRAWN = 'TRACED CAD ELEVATION / SCHEMATIC DEPTH';
  const CARVED = 'TRACED CAD ELEVATION / ILLUSTRATIVE CARVING';
  // Circular arc centres/radii come directly from the DWG handles recorded in
  // docs/exterior-23102026/roofline-witnesses.json, not from fitting a screenshot.
  const archProfiles = {"rear":{"inner":[{"c":[0.284145374,14.61770302],"r":0.23585353,"a":[0.0,87.86369654799267],"handle":"D9016B"},{"c":[-1.096e-06,14.852882856],"r":0.2929388,"a":[0.09970567773280142,179.9002943189322],"handle":"D90172"},{"c":[-0.284147566,14.61770302],"r":0.23585353,"a":[92.13630345200733,180.0],"handle":"D90178"}],"outer":[{"c":[0.284145374,14.61770302],"r":0.31585353,"a":[0.0,74.91446718982118],"handle":"D9016A"},{"c":[-1.096e-06,14.852882856],"r":0.3729388,"a":[10.78547138934081,169.2145286106592],"handle":"D90171"},{"c":[-0.284147566,14.61770302],"r":0.31585353,"a":[105.0855328101788,180.0],"handle":"D90170"}],"envelope":{"c":[-1.096e-06,14.852882856],"r":0.7089388,"a":[26.26471907744193,153.7352809225581],"handle":"D90176"}},"side":{"inner":[{"c":[0.284159941,11.975410069],"r":0.23585353,"a":[0.0,87.8636965446606],"handle":"DAB425"},{"c":[1.3471e-05,12.210589905],"r":0.2929388,"a":[0.09970568106790674,179.9002943222671],"handle":"DAB41F"},{"c":[-0.284132999,11.975410069],"r":0.23585353,"a":[92.13630345533939,180.0],"handle":"DAB418"}],"outer":[{"c":[0.284159941,11.975410069],"r":0.31585353,"a":[0.0,74.91446718985961],"handle":"DAB41D"},{"c":[1.3471e-05,12.210589905],"r":0.3729388,"a":[10.78547138816362,169.2145286118364],"handle":"DAB41E"},{"c":[-0.284132999,11.975410069],"r":0.31585353,"a":[105.0855328101404,180.0],"handle":"DAB417"}],"envelope":{"c":[1.3471e-05,12.210589905],"r":0.7089388,"a":[26.26471907895724,153.7352809210427],"handle":"DAB423"}}};
  const spec = {
    revision: '2026-10-26-cad-roofline-23102026',
    // E02 LINE D99258 / D99C5F..D99C62; axis pinnacle ARC D9B1A6.
    parapet: { z: 10.6, y: [6.323919332, 7.073919332], plinth: .05, rail: .15,
      half: 0.12, pedestal: 0.25, pinnacle: .952407245, runs: [['2′', '9'], ['10', '12']] },
    side: {
      x: 40.575, face: 13.56, wall: [13.18, 13.56],
      // EW outside view: wall ends under the actual bottom cornice edges.
      outline: [[-3.59, 6.2], [3.59, 6.2], [3.59, 7.469364], [2.725, 8.117760], [2.055, 8.619986], [1.228493, 9.239529], [-1.228493, 9.239529], [-2.055, 8.619986], [-2.725, 8.117760], [-3.59, 7.469364]],
      outer: { u: [3.59, 4.26], base: [6.323919, 6.329040], shaft: [6.329040, 7.862396], capital: [7.862396, 8.207396], pedestal: [8.207396, 8.519100], top: 10.693644282 },
      inner: { u: [2.055, 2.725], base: [6.323919, 6.863919], shaft: [6.863919, 9.138182], capital: [9.138182, 9.483182], pedestal: [9.483182, 11.190700], top: 12.893104714 },
      // Four actual mitred corners per rake, outer bottom -> inner bottom -> inner top -> outer top.
      rakes: [[[3.59, 7.469364], [2.725, 8.117760]], [[2.055, 8.619986], [1.228493, 9.239529]]],
      rakePolygons: [[[3.59,7.469364],[2.725,8.117760],[2.734248,8.848184],[3.54,8.244199]], [[2.055,8.619986],[1.228493,9.239529],[1.425073352,9.829528705],[1.986087952,9.408997303]]],
      band: [9.239528705, 9.829528705], bandHalf: 1.425073352,
      rose: [0, 7.571528705, .81], roseRings: [.81, .675, .628113367, .592113367],
      aedicule: { base: 9.829528705, niche: .519986529, pier: [.732, 1.052], pierBase: 9.992729,
        spring: 11.975410069, crown: 12.503528705, pierTop: 11.851679, pinnacle: 13.500277835,
        volute: [1.1, 1.9, 11.957707], ball: 13.597816386, ballRadius: .240521246013,
        cross: [13.838337632, 15.186894579], crossRadius: .071735279616, crossCentre: .00009139012,
        arm: 14.684747622, arch: archProfiles.side },
    },
    rear: {
      // Existing projection retained: P14 wall face is X53.18097; this X53.24 plane and
      // relief depth remain a documented coordination departure, not a CAD depth claim.
      face: 53.24,
      corner: { u: [10.239012, 10.909012], shaft: [6.323919, 7.409277], capital: [7.409277, 7.754277], pedestal: [7.754277, 8.065981], top: 10.240526943 },
      cg: { u: [7.080012, 7.640012], base: [6.323919, 6.369744], shaft: [6.369744, 8.875933], capital: [8.875933, 9.300933], pedestal: [9.300933, 9.822633], top: 11.525039803 },
      de: { u: [3.265012, 3.935012], shaft: [9.115368, 11.485477], capital: [11.485477, 11.875477], pedestal: [11.875477, 13.192991], top: 14.895397665, base: [8.575368, 9.115368] },
      crest: { u: [7.640012, 10.239845], band: [6.875776, 7.055776], top: 7.6 },
      rakes: [[[7.080012, 7.495586], [3.935012, 9.853050]], [[3.265012, 10.355266], [1.228505, 11.881822]]],
      rakePolygons: [[[7.080012,7.495586],[3.935012,9.853050],[3.935012,10.590403],[7.080012,8.232939]], [[3.265012,10.355266],[1.228505,11.881822],[1.425085727,12.471821656],[3.265012,11.092633]]],
      band: [11.881821656, 12.471821656], bandHalf: 1.425085727, mid: [7.873663, 8.575368],
      rose: [0, 9.988500640, .81], roseRings: [.81, .675, .628113367, .592113367],
      aedicule: { base: 12.471821656, niche: .519986529, pier: [.732012, 1.052012], pierBase: 12.635022,
        spring: 14.617703020, crown: 15.145821656, pierTop: 14.493972, pinnacle: 16.142570786,
        volute: [1.1, 1.9, 14.600000], ball: 16.240109336, ballRadius: .240521246013,
        cross: [16.480630582, 17.829187530], crossRadius: .071735279616, crossCentre: -.000079015232,
        arm: 17.327040573, arch: archProfiles.rear },
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
    // Shared carving generators have a nominal height; fit their actual vertex bounds
    // to the source envelope so the last leaf does not stop short of the CAD top.
    const fitHeight = (geometry, height) => {
      geometry.computeBoundingBox();
      const { min, max } = geometry.boundingBox;
      const base = min.y, extent = max.y - base;
      geometry.translate(0, -base, 0);
      geometry.scale(1, height / extent, 1);
      return geometry;
    };

    // A face frame: world = origin + u·U + v·Y + w·N (N out of the face). Shapes and parts are
    // built in (u, v) with +z out of the face.
    const frame = (origin, U, N) => new T.Matrix4().set(U[0], 0, N[0], origin[0], U[1], 1, N[1], origin[1], U[2], 0, N[2], origin[2], 0, 0, 0, 1);
    const face = F => {
      const at = (u, v, w, ...pre) => place(...pre, TR(u, v, w)).premultiply(F);
      const blk = (name, m, [u0, u1], [v0, v1], [w0, w1], st) => add(name, m, new T.BoxGeometry(u1 - u0, v1 - v0, w1 - w0), at((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2), st);
      const slab = (name, m, shape, w0, w1, st, seg = 20) => add(name, m, new T.ExtrudeGeometry(shape, { depth: w1 - w0, bevelEnabled: false, curveSegments: seg }), at(0, 0, w0), st);
      const poly = pts => new T.Shape(pts.map(([u, v]) => new T.Vector2(u, v)));
      // Display tessellation only: <=0.5 mm chord error against each source circle.
      // This is not a survey/construction accuracy claim (ISSUE-R06 remains open).
      const arcPoints = ({ c, r, a }) => {
        const span = (a[1] - a[0]) * Math.PI / 180;
        const step = 2 * Math.acos(Math.max(-1, 1 - .0005 / r));
        const n = Math.max(2, Math.ceil(Math.abs(span) / step));
        return Array.from({ length: n + 1 }, (_, i) => {
          const angle = a[0] * Math.PI / 180 + span * i / n;
          return [c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle)];
        });
      };
      const profilePoints = profile => profile.flatMap(arcPoints);
      // Pier: fluted shaft, foliate capital band, cornice cap, pedestal, pinnacle with fleur-de-lis.
      const pier = (P, d = .38) => {
        const [u0, u1] = P.u, um = (u0 + u1) / 2, half = (u1 - u0) / 2;
        if (P.base) blk('Gable pier base below upper shaft', W, [u0, u1], P.base, [0, d]);
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
        add('Gable pinnacle', S, fitHeight(K.pinnacle({ w, h: h - fl }), h - fl), at(u, v0, wc), CARVED);
        add('Gable pinnacle fleur-de-lis', S, fitHeight(fleur(fl), fl), at(u, v1 - fl, wc), CARVED);
        stats.pinnacles++;
      };
      // Raking cornice between two points (u0 < u1 in |u|), mirrored to both sides: a band with a
      // Greek-key face, hanging dentils and a leaf crest standing on it.
      const rake = ([a, b], thick = .45, d = .42, crest = true, traced = null) => {
        for (const e of [-1, 1]) {
          const outline = traced || [a, b, [b[0], b[1] + thick], [a[0], a[1] + thick]];
          const p = outline.map(([u, v]) => [e * u, v]);
          slab('Gable raking cornice', S, poly(e > 0 ? p : p.slice().reverse()), 0, d);
          // The frieze runs from the left end of the rake so that it stays upright on both sides.
          const [p0, p1] = e > 0 ? [b, a] : [[-a[0], a[1]], [-b[0], b[1]]], u0 = e > 0 ? p0[0] : p0[0];
          const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
          add('Gable raking Greek-key frieze', S, meanderGeo(len, thick * .5), place(TR(0, thick * .22, 0), RZ(ang), TR(u0, p0[1], d)).premultiply(F), CARVED);
          const n = Math.floor(len / .13);
          for (let i = 0; i < n; i++) { const t = (i + .5) / n, u = e * (a[0] + (b[0] - a[0]) * t), v = a[1] + (b[1] - a[1]) * t; blk('Gable raking dentil', S, [u - .03, u + .03], [v - .16, v], [.02, d - .06]); }
          if (crest) for (let t = .18; t < .96; t += .22) {
            const topA = outline[3], topB = outline[2];
            const u = e * (topA[0] + (topB[0] - topA[0]) * t), v = topA[1] + (topB[1] - topA[1]) * t;
            add('Gable raking leaf crest', S, fleur(.42), at(u, v, d / 2), CARVED);
          }
        }
      };
      const rose = ([u, v, r], rings = [r + .05, r - .05, r * .82 + .035, r * .82 - .035], w = .4) => {
        // The source circles bound each ring: TorusGeometry's radius is its centreline,
        // so using the outer source radius directly would make the ring too large.
        for (let i = 0; i < rings.length; i += 2)
          add('Gable rose ring', S, new T.TorusGeometry((rings[i] + rings[i + 1]) / 2, (rings[i] - rings[i + 1]) / 2, 10, 96), at(u, v, w));
        add('Gable rose tracery', S, K.bloom({ r: rings.at(-1) * .95, petals: 12, rings: 2, seg: 3 }), at(u, v, w - .02), CARVED);
      };
      // Crowning aedicule: lobed niche between two piers with pinnacles, volutes, ball and cross.
      const aedicule = (E, d = .42) => {
        const inner = profilePoints(E.arch.inner), outer = profilePoints(E.arch.outer);
        const envelope = arcPoints(E.arch.envelope);
        const outline = [[-E.pier[1], E.base], [E.pier[1], E.base], [E.pier[1], E.pierTop], ...envelope, [-E.pier[1], E.pierTop]];
        slab('Gable aedicule back wall', W, poly(outline), -.2, .12, 'CAD ARC ENVELOPE / SCHEMATIC BACKING DEPTH');
        const niche = poly([[inner.at(-1)[0], E.base], [inner[0][0], E.base], ...inner]);
        slab('Gable aedicule niche', D, niche, .12, .13);
        blk('Gable aedicule pedestal', S, [-.42, .42], [E.base + .1, E.base + .55], [.13, .45]);
        for (const e of [-1, 1]) {
          const [p0, p1] = e > 0 ? E.pier : [-E.pier[1], -E.pier[0]];
          blk('Gable aedicule pier base', S, [p0 - .05, p1 + .05], [E.base, E.pierBase], [0, d]);
          blk('Gable aedicule pier', W, [p0, p1], [E.pierBase, E.pierTop], [0, d]);
          blk('Gable aedicule pier cap', S, [p0 - .05, p1 + .05], [E.pierTop, E.pierTop + .12], [-.03, d + .05]);
          pinnacle((p0 + p1) / 2, E.pierTop + .12, E.pinnacle, .3, d / 2);
          // S-scroll volute on the outer side, from the base up to the pier.
          const [v0, v1, top] = E.volute, s = e;
          const pts = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return [s * (v1 - (v1 - v0) * Math.sin(t * Math.PI / 2)), E.base + .1 + (top - E.base) * t, d / 2]; });
          add('Gable aedicule volute', S, K.stem(pts.map(([u, v, w]) => { const p = new T.Vector3(u, v, w).applyMatrix4(F); return [p.x, p.y, p.z]; }), .07, .05, 16, 6), null, CARVED);
          add('Gable aedicule volute scroll', S, K.stem(K.scroll(0, 0, .14, 1.3, 0, s), .045, .02, 12, 5), at(s * v1, E.base + .25, d / 2), CARVED);
        }
        // Arch moulding over the niche, crest, ball and trefoil cross.
        slab('Gable aedicule arch moulding', S, poly([...outer, ...inner.slice().reverse()]), .13, .30);
        blk('Gable aedicule jamb moulding', S, [inner[0][0], outer[0][0]], [E.base, E.spring], [.13, .30]);
        blk('Gable aedicule jamb moulding', S, [outer.at(-1)[0], inner.at(-1)[0]], [E.base, E.spring], [.13, .30]);
        add('Gable aedicule crest', S, K.cartouche({ len: 1.1, r: .14 }), at(0, E.crown + .32, d * .5), CARVED);
        add('Gable aedicule ball', S, new T.SphereGeometry(E.ballRadius, 24, 16), at(0, E.ball, d * .5));
        const [c0, c1] = E.cross;
        const r = E.crossRadius, xc = E.crossCentre, arm = E.arm, top = c1 - r;
        const ca = (u, v, a, b) => arcPoints({ c: [u, v], r, a: [a, b] });
        const cross = [[xc - r, c0], [xc - r, arm - r], [xc - 4 * r, arm - r],
          ...ca(xc - 5 * r, arm - r, 0, -180), ...ca(xc - 6 * r, arm, -90, -270),
          ...ca(xc - 5 * r, arm + r, 180, 0), [xc - r, arm + r], [xc - r, top - 2 * r],
          ...ca(xc - r, top - r, -90, -270), ...ca(xc, top, 180, 0),
          ...ca(xc + r, top - r, 90, -90), [xc + r, arm + r], [xc + 4 * r, arm + r],
          ...ca(xc + 5 * r, arm + r, 180, 0), ...ca(xc + 6 * r, arm, 90, -90),
          ...ca(xc + 5 * r, arm - r, 0, -180), [xc + r, arm - r], [xc + r, c0]];
        slab('Gable cross', crossMaterial, poly(cross), d * .5 - .05, d * .5 + .05);
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
          add('Porch parapet pinnacle', S, fitHeight(K.pinnacle({ w: .26, h: PP.pinnacle - .3 }), PP.pinnacle - .3), TR(x, PP.y[1], zc), CARVED);
          add('Porch parapet pinnacle fleur-de-lis', S, fitHeight(fleur(.3), .3), place(RY(s < 0 ? Math.PI : 0), TR(x, PP.y[1] + PP.pinnacle - .3, zc)), CARVED);
          stats.pinnacles++;
          if (i === keys.length - 1) continue;
          const x0 = x + P, x1 = A[keys[i + 1]] - P;
          blk('Porch parapet plinth', S, [x0, x1], [PP.y[0], PP.y[0] + PP.plinth], zr(PP.half + .03));
          blk('Porch parapet top rail', S, [x0, x1], [PP.y[1] - PP.rail, PP.y[1]], zr(PP.half + .02));
          const n = Math.max(2, Math.round((x1 - x0) / .21));
          for (let k = 1; k < n; k++) { add('Porch parapet baluster', S, new T.CylinderGeometry(.05, .07, PP.y[1] - PP.y[0] - PP.plinth - PP.rail, 10), TR(x0 + (x1 - x0) * k / n, (PP.y[0] + PP.plinth + PP.y[1] - PP.rail) / 2, zc)); stats.balusters++; }
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
      f.rake(SG.rakes[0], .737353, .42, true, SG.rakePolygons[0]);
      f.rake(SG.rakes[1], .59, .42, false, SG.rakePolygons[1]);
      const sh = SG.rakes[1][1][0];
      f.slab('Side gable top band', S, f.poly([[-sh, SG.band[0]], [sh, SG.band[0]], [SG.bandHalf, SG.band[1]], [-SG.bandHalf, SG.band[1]]]), 0, .42);
      add('Side gable Greek-key frieze', S, meanderGeo(2 * sh, .22), f.at(-sh, SG.band[0] + .1, .42), CARVED);
      f.rose(SG.rose, SG.roseRings);
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
      f.rake(RG.rakes[0], .737353, .42, true, RG.rakePolygons[0]);
      f.rake(RG.rakes[1], .59, .42, true, RG.rakePolygons[1]);
      const rh = RG.rakes[1][1][0];
      f.slab('Rear gable top band', S, f.poly([[-rh, RG.band[0]], [rh, RG.band[0]], [RG.bandHalf, RG.band[1]], [-RG.bandHalf, RG.band[1]]]), 0, .42);
      f.rose(RG.rose, RG.roseRings);
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
    data?.assumptions?.push('Exterior roofline audited against DWG version 23102026: E02 parapet top +7.073919; EW outside wing rose +7.571529 and cross +15.186895; E03 rear rose +9.988501 and cross +17.829188. Source circular niche arches, rose boundaries, mitred cornices and cross silhouettes are transcribed; depths, capital/pinnacle carving, tracery and scrolls remain visualization proxies. Existing roof planes and fixture positions are unchanged. ISSUE-R05 ridge and ISSUE-R06 units remain open; not for construction.');
  }
})();
