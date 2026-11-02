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
    revision: '2026-11-03-ew-decoration-2',
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
      // 3 Nov 2026, E03 detail check: C/G has no capital (bands, plaque die, second die, cornice);
      // D/E repeats the ground-pier base, the EW ground capital (raised 5.863261) and cornice, then a
      // gablet die with a sunk panel and the cornice. Rows: E03 horizontals (0.1 mm), centred on the pier.
      cg: { u: [7.080012, 7.640012], shaft: [6.323919, 8.875933], pedestal: [9.300933, 9.822633], top: 11.525039803,
        rows: [[8.875933, 8.915929, .305, 'S'], [8.915929, 8.975929, .335, 'S'], [8.975929, 9.015929, .305, 'S'], [9.015929, 9.265929, .28, 'W'], [9.115929, 9.165929, .07, 'P'],
          [9.265929, 9.300929, .30, 'S'], [9.300929, 9.360929, .33, 'S'], [9.360929, 9.510929, .28, 'W'], [9.510929, 9.558633, .33, 'S'], [9.558633, 9.678633, .38, 'C'],
          [9.678633, 9.726633, .43, 'S'], [9.726633, 9.822633, .481, 'S']] },
      de: { u: [3.265012, 3.935012], shaft: [9.115367, 11.485477], pedestal: [12.18718, 13.192991], top: 14.895397665, foliage: 5.863261,
        rows: [[8.575367, 8.725367, .375, 'S'], [8.725367, 8.975367, .335, 'W'], [8.975367, 9.015367, .36, 'S'], [9.015367, 9.075367, .39, 'S'], [9.075367, 9.115367, .36, 'S'],
          [11.485477, 11.525477, .36, 'S'], [11.525477, 11.585477, .39, 'S'], [11.585477, 11.625477, .36, 'S'], [11.625477, 11.875477, .3, 'B'],
          [11.875477, 11.92318, .385, 'S'], [11.92318, 12.04318, .435, 'C'], [12.04318, 12.09118, .485, 'S'], [12.09118, 12.18718, .537, 'S'],
          [12.18718, 12.881287, .28, 'W'], [12.18718, 12.44018, .342, 'G'], [12.3144, 12.881287, .17, 'P'],
          [12.881287, 12.92899, .33, 'S'], [12.92899, 13.04899, .38, 'C'], [13.04899, 13.09699, .43, 'S'], [13.09699, 13.192991, .481, 'S']] },
      crest: { u: [7.640012, 10.239845], band: [6.875776, 7.055776], top: 7.6 },
      rakes: [[[7.080012, 7.495586], [3.935012, 9.853050]], [[3.265012, 10.355266], [1.228505, 11.881822]]],
      rakePolygons: [[[7.080012,7.495586],[3.935012,9.853050],[3.935012,10.590403],[7.080012,8.232939]], [[3.265012,10.355266],[1.228505,11.881822],[1.425085727,12.471821656],[3.265012,11.092633]]],
      band: [11.881821656, 12.471821656], bandHalf: 1.425085727, lift: 2.251448,
      rose: [0, 9.988500640, .81], roseRings: [.81, .675, .628113367, .592113367],
      aedicule: { base: 12.471821656, niche: .519986529, pier: [.732012, 1.052012], pierBase: 12.635022,
        spring: 14.617703020, crown: 15.145821656, pierTop: 14.493972, pinnacle: 16.142570786,
        volute: [1.1, 1.9, 14.600000], ball: 16.240109336, ballRadius: .240521246013,
        cross: [16.480630582, 17.829187530], crossRadius: .071735279616, crossCentre: -.000079015232,
        arm: 17.327040573, arch: archProfiles.rear },
    },
  };
  window.CHURCH_ROOFLINE = { spec, prepare };

  function prepare({ THREE: T, exterior, roofs, mat, data }) {
    if (!exterior || !window.CHURCH_EXTERIOR_ORNAMENT) return;
    exterior.updateMatrixWorld(true);
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, RZ, SC, place, merge } = K;
    const { fleur, pilasterCapital, meanderGeo, pinnacleCrown, flutedField, drawnPier, drawnEntablature, traced, towerSpandrel } = window.CHURCH_EXTERIOR_ORNAMENT.create(T, K);
    // Owner, 3 Nov 2026: the wing gables follow the EW decoration; traced outlines are drawn with the
    // T12 contour tube (relief CONCEPT), drawn levels and widths as below, depths DERIVED.
    const EW = 'EW TRACED CARVING / RELIEF CONCEPT', EWD = 'EW DRAWN OUTLINE AND LEVELS / DERIVED DEPTH';
    // Large single pieces (crest, console, corner leaf, rose) keep the full tube; capitals use the light one.
    // E03 outlines (detail-rear-profile.js): the lunette and arch leaves keep the full tube, the repeated
    // crests and bay leaves the light one.
    const rearGeo = {}, e03 = (key, stroke, big = false) => rearGeo[key] ||= towerSpandrel(window.CHURCH_DETAIL_PROFILE_REAR[key], stroke, big ? .001 : .003, big ? 6 : 3);
    const E03C = 'E03 TRACED CARVING / RELIEF CONCEPT';
    const ewGeo = {}, ew = (key, stroke = .012) => ewGeo[key + stroke] ||= traced(key, stroke, !/^wing(Crest|Volute|Spandrel|Rose)$/.test(key));
    // Owner, 2 Nov 2026: every pier pinnacle takes the shared E01B crown, scaled uniformly to its envelope.
    const crown = pinnacleCrown(), crownScale = h => h / crown.boundingBox.max.y;
    const A = data.longitudinal;

    // The bundle's roof planes used to run past the new gable face planes:
    // 53.40 versus 53.24 at the sanctuary end and |Z| 13.62 versus 13.56 at
    // the wings. Clip only those overhangs, including the ridge/eaves trim,
    // before texture projection and batching. This is a display junction,
    // not a designed flashing, drainage detail or a change to roof heights.
    const roofEnds = /^(Continuous principal roof, valley clipped|Veranda roof beyond side projection|Planar side-gable roof meeting main valley|Main eaves trim|Veranda eaves trim|Longitudinal ridge cap|Terracotta half-round ridge cap)$/;
    if (roofs) {
      roofs.updateWorldMatrix(true, true);
      const point = new T.Vector3(), bounds = new T.Box3(), removeRoof = [];
      roofs.traverse(o => {
        if (!o.isMesh || !roofEnds.test(o.name)) return;
        bounds.setFromObject(o);
        const wing = o.name === 'Planar side-gable roof meeting main valley';
        const limit = wing ? spec.side.face : spec.rear.face;
        if (wing ? Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z)) <= limit : bounds.max.x <= limit) return;
        if (!wing && bounds.min.x >= limit) { removeRoof.push(o); return; }
        const inverse = o.matrixWorld.clone().invert(), geometry = o.geometry.clone(), positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          point.fromBufferAttribute(positions, i).applyMatrix4(o.matrixWorld);
          if (wing) point.z = Math.max(-limit, Math.min(limit, point.z));
          else point.x = Math.min(limit, point.x);
          point.applyMatrix4(inverse); positions.setXYZ(i, point.x, point.y, point.z);
        }
        positions.needsUpdate = true; geometry.computeBoundingBox(); geometry.computeBoundingSphere();
        o.geometry = geometry;
      });
      removeRoof.forEach(o => o.removeFromParent());
    }

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
    // E03 detail pass (3 Nov 2026): the bundle D/E pilasters, porch-end beam, eave ornaments and corner
    // finial blocks give way to the drawn piers, entablature and mid band built below.
    const rearOld = /^(Schematic pilaster|Pilaster plinth|Pilaster base cap|Schematic beam|Schematic block|Schematic end eave ornament)$/;
    // The bundle centre arch (an elliptical 0.13 m moulding from +4.3) and its two columns at |Z| 2.5 give
    // way to the E03 archivolt and coupled columns; the window surrounds of the same names stay.
    const rearArch = (m, b) => m.name === 'Schematic arch moulding' ? b.max.y > 4 : /^(Schematic round profile|Column base|Capital)$/.test(m.name) && Math.abs(Math.abs((b.min.z + b.max.z) / 2) - 2.5) < .1;
    rearGroup?.traverse(m => { if (m.isMesh && m.name !== 'Ornate opposite-end gable' && (rearOld.test(m.name) || rearArch(m, box3.setFromObject(m)) || box3.min.y > 7.55)) remove.push(m); });
    remove.forEach(o => o.removeFromParent());
    sideGroups.forEach(g => g.removeFromParent());

    // Replace only the eight legacy lower pilasters at the two wing ends and
    // the outer/crossing pairs on E03. The bundle's square placeholders are
    // narrower than the CAD faces and the wing pair is centred on the grid,
    // rather than beneath the outer gable piers. Keep the separate D/E pair.
    const legacyLower = [];
    const legacyNames = /^(Schematic pilaster|Pilaster plinth|Pilaster base cap|Pilaster capital)$/;
    const centre = new T.Vector3();
    exterior.traverse(o => {
      if (!o.isMesh || !legacyNames.test(o.name)) return;
      box3.setFromObject(o).getCenter(centre);
      const wing = [36.975, 44.175].some(x => Math.abs(centre.x - x) < .02) && Math.abs(Math.abs(centre.z) - 13.365) < .08;
      const rear = Math.abs(centre.x - 53.32) < .09 && [7.36, 10.414].some(z => Math.abs(Math.abs(centre.z) - z) < .02);
      if (wing || rear) legacyLower.push(o);
    });
    legacyLower.forEach(o => o.removeFromParent());

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
    const stats = { pinnacles: 0, crosses: 0, balusters: 0, removedBundleMeshes: remove.length + sideGroups.length, removedLegacyLower: legacyLower.length };
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
      // Pier as EW draws the gable piers: fluted shaft, traced capital, the drawn cornice (+0.312 over the
      // capital), on the tall inner piers a pedestal stage (gablet die, bands, plaque die, cornice; EW
      // +9.795–11.191, scaled to other envelopes), a gablet at the foot of piers standing on the ground
      // cornice, then the pinnacle crown. Half-widths are EW values scaled by the pier width / 0.67.
      const pier = (P, d = .38, capKey = 'wingCapOuter') => {
        const [u0, u1] = P.u, um = (u0 + u1) / 2, half = (u1 - u0) / 2, sx = half / .335;
        const band = (name, m, h, [v0, v1], w1, w0 = 0) => blk(name, m, [um - h * sx, um + h * sx], [v0, v1], [w0, w1]);
        if (P.base) blk('Gable pier base below upper shaft', W, [u0, u1], P.base, [0, d]);
        blk('Gable pier shaft', W, [u0, u1], P.shaft, [0, d]);
        // EW and E03 draw no flutes on these piers; the shared E01B fluted field is repeated here
        // (owner, 2 Nov 2026: every pier), narrowed to the pier: DERIVED.
        const fh = Math.min(.235, half - .06), F2 = flutedField({ half: fh, y: [P.shaft[0] + .1, P.shaft[1] - .05], flutes: [P.shaft[0] + .2, P.shaft[1] - .15], step: Math.min(.11, fh - .045) });
        add('Gable pier fluted field', W, F2.field, at(um, 0, d)); add('Gable pier fluted field bed', S, F2.bed, at(um, 0, d));
        // E03 piers carry their own drawn rows [v0, v1, half, kind] (absolute levels and half-widths
        // from the E03 horizontals); each row projects (half − shaft half) beyond the shaft face.
        // kind: S moulding, C cyma (drawn as a square band at its mean half-width), W die, B capital bell (+ the traced EW ground capital moved to P.foliage),
        // P plaque on the die face, G gablet at the foot of the die. Depths are DERIVED.
        if (Math.abs(P.shaft[0] - 6.3239) < .06) {
          // EW 6.324–6.577: gablet on the foot of the pier, between two side blocks (±0.335–0.426).
          const g0 = P.shaft[0], g = poly([[-.342 * sx, 0], [.342 * sx, 0], [0, .253]]);
          add('Gable pier foot gablet', S, new T.ExtrudeGeometry(g, { depth: .04, bevelEnabled: false }), at(um, g0, d), EWD);
          for (const e of [-1, 1]) blk('Gable pier foot block', S, [um + e * .335 * sx, um + e * .426 * sx].sort((p, q) => p - q), [g0, g0 + .253], [0, d + .04], EWD);
        }
        // E03 piers carry their own drawn rows [v0, v1, half, kind] (absolute levels and half-widths
        // from the E03 horizontals); each row projects (half − shaft half) beyond the shaft face.
        // kind: S moulding, C cyma (drawn as a square band at its mean half-width), W die, B capital bell (with the traced EW ground capital raised by
        // P.foliage), P plaque on the die face, G gablet at the foot of the die. Depths are DERIVED.
        if (P.rows) {
          for (const [v0, v1, h, kind] of P.rows) {
            const p = d + h - half;
            if (kind === 'S' || kind === 'C') blk('Gable pier moulding · E03', S, [um - h, um + h], [v0, v1], [-.03, p], EWD);
            else if (kind === 'W') blk('Gable pier die · E03', W, [um - h, um + h], [v0, v1], [0, d - .04], EWD);
            else if (kind === 'B') {
              blk('Gable pier capital bell', S, [um - h, um + h], [v0, v1], [0, d]);
              add('Gable pier capital foliage · EW', S, ew('pierCapitalEW', .01), at(um, P.foliage, d + .012), EW);
            } else if (kind === 'P') blk('Gable pier die plaque · E03', S, [um - h, um + h], [v0, v1], [0, d - .025], EWD);
            else if (kind === 'G') add('Gable pier pedestal gablet', S, new T.ExtrudeGeometry(poly([[-h, 0], [h, 0], [0, v1 - v0]]), { depth: .05, bevelEnabled: false }), at(um, v0, d - .04), EWD);
          }
          pinnacle(um, P.pedestal[1], P.top, Math.min(.36, u1 - u0 - .12), d / 2);
          return;
        }
        const c0 = P.capital[0], c1 = P.capital[1], capBase = capKey === 'wingCapInner' ? 9.138182 : 7.862396;
        blk('Gable pier capital bell', S, [um - half * .9, um + half * .9], P.capital, [0, d]);
        add('Gable pier capital foliage · EW', S, ew(capKey, .01), at(um, c0, d + .012, TR(0, -capBase, 0), SC(sx, (c1 - c0) / .345, 1)), EW);
        for (const [a, b, h] of [[0, .048, .385], [.048, .168, .435], [.168, .216, .485], [.216, .312, .426]]) band('Gable pier cornice', S, h, [c1 + a, c1 + b], d + (h - .335) * sx, -.03);
        const s0 = c1 + .312, rest = P.pedestal[1] - s0;
        if (rest > 1) {
          const ky = rest / 1.396, y = v => s0 + v * ky, dd = d - .08;
          band('Gable pier pedestal die', W, .28, [y(0), y(.694)], dd);
          add('Gable pier pedestal gablet', S, new T.ExtrudeGeometry(poly([[-.342 * sx, 0], [.342 * sx, 0], [0, .253 * ky]]), { depth: .05, bevelEnabled: false }), at(um, y(0), dd), EWD);
          for (const [a, b, h] of [[.694, .734, .305], [.734, .794, .335], [.794, .834, .305]]) band('Gable pier pedestal band', S, h, [y(a), y(b)], dd + (h - .28) * sx);
          band('Gable pier pedestal die', W, .28, [y(.834), y(1.084)], dd);
          band('Gable pier pedestal plaque', S, .07, [y(.934), y(.984)], dd + .015);
          for (const [a, b, h] of [[1.084, 1.132, .33], [1.132, 1.252, .38], [1.252, 1.30, .43], [1.30, 1.396, .481]]) band('Gable pier pedestal cornice', S, h, [y(a), y(b)], dd + (h - .28) * sx);
        } else blk('Gable pier pedestal', W, [u0 + .04, u1 - .04], [s0, P.pedestal[1]], [0, d - .04]);
        pinnacle(um, P.pedestal[1], P.top, Math.min(.36, u1 - u0 - .12), d / 2);
      };
      const pinnacle = (u, v0, v1, w, wc) => {
        add('Gable pinnacle crown', S, crown, at(u, v0, wc, SC(crownScale(v1 - v0))), CARVED);
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
          // EW: teeth 66.3 mm wide, alternately long (0.387) and short (0.27), flat at the bottom.
          const under = u => a[1] + (b[1] - a[1]) * (u - a[0]) / (b[0] - a[0]), w = .0663, n = Math.floor(Math.abs(b[0] - a[0]) / w);
          for (let i = 0; i < n; i++) {
            const ua = a[0] + Math.sign(b[0] - a[0]) * i * w, ub = ua + Math.sign(b[0] - a[0]) * w, top = Math.max(under(ua), under(ub)), L = i % 2 ? .27 : .387;
            blk('Gable raking dentil', S, [e * ua, e * ub].sort((p, q) => p - q), [top - L, Math.min(under(ua), under(ub))], [.02, d - .06], EWD);
          }
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
        add('Gable rose tracery · EW', S, ew('wingRose', .01), at(u, v - 7.571528705, w - .02), EW);
      };
      // Crowning aedicule: lobed niche between two piers with pinnacles, volutes, ball and cross.
      const aedicule = (E, d = .42) => {
        const inner = profilePoints(E.arch.inner), outer = profilePoints(E.arch.outer);
        const envelope = arcPoints(E.arch.envelope);
        const outline = [[-E.pier[1], E.base], [E.pier[1], E.base], [E.pier[1], E.pierTop], ...envelope, [-E.pier[1], E.pierTop]];
        // Owner, 3 Nov 2026: the parts must read as one body. The aedicule mass runs to the full pier
        // depth d, with the niche cut into it above a 0.1 m sill, and the arch moulding stands proud of
        // that face; until then the mass stopped at 0.12 and the piers read as loose posts. DERIVED depth.
        const body = poly(outline), hole = [[inner.at(-1)[0], E.base + .1], [inner[0][0], E.base + .1], ...inner];
        body.holes.push(new T.Path((T.ShapeUtils.isClockWise(hole.map(([u, v]) => new T.Vector2(u, v))) ? hole : hole.slice().reverse()).map(([u, v]) => new T.Vector2(u, v))));
        slab('Gable aedicule body', W, body, -.2, d, 'CAD ARC ENVELOPE / DERIVED DEPTH');
        const niche = poly([[inner.at(-1)[0], E.base], [inner[0][0], E.base], ...inner]);
        slab('Gable aedicule niche', D, niche, .12, .13);
        const envTop = Math.max(...envelope.map(p => p[1]));
        blk('Gable aedicule pedestal', S, [-.42, .42], [E.base + .1, E.base + .55], [.13, .45]);
        // EW levels are given from the wing aedicule base +9.829529; dv moves them to E03's.
        const dv = E.base - 9.829528705;
        for (const e of [-1, 1]) {
          const [p0, p1] = e > 0 ? E.pier : [-E.pier[1], -E.pier[0]], pc = (p0 + p1) / 2;
          const ring = (name, m, h, [v0, v1], w = h - .16) => blk(name, m, [pc - h, pc + h], [v0 + dv, v1 + dv], [-w, d + w], EWD);
          // EW base and cap mouldings (half-widths about the pier axis, shaft ±0.16).
          for (const [v0, v1, h] of [[9.83, 9.897, .251], [9.897, 9.916, .232], [9.916, 9.964, .194], [9.964, 9.993, .179]]) ring('Gable aedicule pier base', S, h, [v0, v1]);
          blk('Gable aedicule pier', W, [p0, p1], [E.pierBase, E.pierTop], [0, d]);
          for (const [v0, v1, h] of [[11.852, 11.88, .179], [11.88, 11.928, .194], [11.928, 11.948, .232], [11.948, 12.015, .251]]) ring('Gable aedicule pier cap', S, h, [v0, v1]);
          // Gothic turret (EW +12.015–13.5): box with a pointed opening, eave, gablet, spire, collar, fleur.
          const wc = d / 2, tb = (name, m, h, [v0, v1], hd = h) => blk(name, m, [pc - h, pc + h], [v0 + dv, v1 + dv], [wc - hd, wc + hd], EWD);
          tb('Gable aedicule turret', W, .16, [12.015, 12.381]);
          const op = new T.Shape(); op.moveTo(-.08, 0); op.lineTo(.08, 0); op.lineTo(.08, .187);
          op.absarc(-.073, .187, .153, 0, Math.acos(.073 / .153), false); op.absarc(.073, .187, .153, Math.PI - Math.acos(.073 / .153), Math.PI, false); op.lineTo(-.08, 0);
          add('Gable aedicule turret opening', D, new T.ExtrudeGeometry(op, { depth: .006, bevelEnabled: false, curveSegments: 8 }), at(pc, 12.015 + dv, wc + .16), EWD);
          tb('Gable aedicule turret eave', S, .2, [12.381, 12.435]);
          add('Gable aedicule turret gablet', S, new T.ConeGeometry(Math.SQRT2, 1, 4, 1), at(pc, 12.557 + dv, wc, K.RY(Math.PI / 4), SC(.228, .244, .228)), EWD);
          add('Gable aedicule turret spire', S, new T.CylinderGeometry(.061 * Math.SQRT2, .175 * Math.SQRT2, .622, 4, 1), at(pc, 12.746 + dv, wc, K.RY(Math.PI / 4)), EWD);
          for (const [v0, v1, h] of [[13.057, 13.075, .061], [13.075, 13.106, .058], [13.106, 13.124, .051]]) tb('Gable aedicule turret collar', S, h, [v0, v1]);
          add('Gable aedicule turret fleur-de-lis', S, fleur(.39), at(pc, 13.124 + dv, wc), CARVED);
          stats.pinnacles++;
          // Acanthus console from the base up the pier (EW, about |u| 1.05–2.05): a backing slab under
          // the traced outline. The backing silhouette follows the traced outer curve: DERIVED.
          // Its foot follows the upper rake top (slope 0.7496 from |u| 1.425) to the inner pier cornice
          // (|u| 1.905), so it stands on the gable instead of floating over it; full pier depth.
          const sil = [[1.06, 9.83], [1.425, 9.8295], [1.905, 9.4697], [1.905, 9.80], [2.02, 9.85], [2.02, 9.98], [1.85, 10.05], [1.74, 10.02], [1.78, 10.2], [1.76, 10.38], [1.66, 10.56], [1.52, 10.78], [1.38, 11.05], [1.29, 11.35], [1.25, 11.62], [1.26, 11.78], [1.2, 11.86], [1.06, 11.86]];
          const c = poly(sil.map(([u, v]) => [e * u, v + dv]));
          slab('Gable aedicule console', W, e > 0 ? c : poly(sil.map(([u, v]) => [e * u, v + dv]).reverse()), 0, d, EWD);
          add('Gable aedicule console acanthus · EW', S, ew('wingVolute', .016), at(0, dv, d + .016, SC(e, 1, 1)), EW);
        }
        // Arch moulding over the niche, crest, ball and trefoil cross.
        slab('Gable aedicule arch moulding', S, poly([...outer, ...inner.slice().reverse()]), d - .02, d + .06);
        blk('Gable aedicule jamb moulding', S, [inner[0][0], outer[0][0]], [E.base + .1, E.spring], [d - .02, d + .06]);
        blk('Gable aedicule jamb moulding', S, [outer.at(-1)[0], inner.at(-1)[0]], [E.base + .1, E.spring], [d - .02, d + .06]);
        // Crest scrolls on the hood face, with a 16 mm stroke so they read as carved stone, not wire.
        add('Gable aedicule crest scrolls · EW', S, ew('wingCrest', .016), at(0, dv, d + .016), EW);
        // EW ball pedestal: ring +13.104–13.184 (±0.249), swelling neck, ring +13.344–13.392 (±0.24),
        // carried down to the hood top on a ±0.249 base so the ball no longer floats over the niche.
        if (envTop < 13.104 + dv) blk('Gable aedicule ball pedestal base', S, [-.249, .249], [envTop - .02, 13.104 + dv], [d * .5 - .249, d * .5 + .249], EWD);
        add('Gable aedicule ball pedestal', S, K.turned([[.249, 0], [.249, .08], [.17, .08], [.2, .16], [.17, .24], [.24, .24], [.24, .288]], 24), at(0, 13.104 + dv, d * .5), EWD);
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
        add('Gable cross rays · EW', crossMaterial, ew('wingRays', .008), at(0, dv, d * .5 + .06), EW);
        stats.crosses++;
      };
      return { at, blk, slab, poly, pier, pinnacle, rake, rose, aedicule };
    };

    // Lower piers at the wing ends (EW) and the sanctuary end (E03): the shared EW/E02 drawn pier
    // (exterior-ornament.js drawnPier), centred on the CAD shaft (EW/E03 shaft ±0.335, +1.53–5.622).
    // `back` reaches the wall behind; mouldings and depths are DERIVED, not structural design.
    // `lift` (E03 D/E pair) keeps the drawn base and raises the capital and cornice by that much, with the
    // shaft and its flutes run up to meet them (E03 shaft +1.53–7.8737, flutes to +7.7487).
    const lowerPiers = (f, ranges, label, back, lift = 0) => {
      let parts = drawnPier({ bottom: -.4, back, face: .18 });
      if (lift) {
        const up = TR(0, lift, 0), field = flutedField({ half: .225, y: [1.53, 5.622 + lift], flutes: [1.655, 5.497 + lift] });
        parts = parts.map(q => {
          if (q.name === 'shaft') { const g = q.geometry.parameters; return { ...q, geometry: new T.BoxGeometry(g.width, 4.092 + lift, g.depth), matrix: TR(0, 1.53 + (4.092 + lift) / 2, q.matrix.elements[14]) }; }
          if (q.name === 'fluted field') return { ...q, geometry: field.field };
          if (q.name === 'fluted field bed') return { ...q, geometry: field.bed };
          return q.name === 'capital foliage' || q.matrix.elements[13] > 5.6 ? { ...q, matrix: up.clone().multiply(q.matrix) } : q;
        });
      }
      for (const [lo, hi] of ranges) for (const sign of [-1, 1]) {
        const mid = sign * (lo + hi) / 2;
        for (const q of parts) add(`${label} lower pier · EW ${q.name}`, q.kind === 'W' ? W : S, q.geometry, f.at(mid, 0, 0, q.matrix), q.kind === 'C' ? EW : EWD);
      }
    };

    // ---- Porch parapets: balustrade on the porch cornice, pedestal and pinnacle on every axis ----
    const PP = spec.parapet;
    // E02 flat cut baluster (detail-sides-profile.js parapetBaluster, u from its axis, v world level,
    // +6.375–6.925 between the drawn plinth and rail), 0.25 m apart and 0.625 m clear of each axis as
    // drawn; its closed outline is cut as a 0.12 m slab (DERIVED depth) with the centre ring as a boss.
    // Arc steps hold a sagitta of 12 mm (at most 90°) seen from the ground 7 m below: a display bound, not a cutting tolerance.
    const balusterGeo = (() => {
      const SD = window.CHURCH_DETAIL_PROFILE_SIDES, pts = [];
      let first = 0;
      for (const row of SD.parapetBaluster) {
        const [, , u, v, r, a, span, h] = row, n = Math.max(1, Math.ceil(span / Math.min(90, 2 * Math.acos(Math.max(-1, 1 - .012 / r)) * 180 / Math.PI)));
        let seg = Array.from({ length: n + 1 }, (_, i) => { const t = (a + span * i / n) * Math.PI / 180; return new T.Vector2(u + h * r * Math.cos(t), v + r * Math.sin(t)); });
        const near = p => Math.min(seg[0].distanceTo(p), seg.at(-1).distanceTo(p));
        if (pts.length && pts.length === first && near(pts[0]) < near(pts.at(-1))) pts.reverse(); // orient the first arc
        if (pts.length && seg[0].distanceTo(pts.at(-1)) > seg.at(-1).distanceTo(pts.at(-1))) seg.reverse();
        pts.push(...(pts.length ? seg.slice(1) : seg));
        if (!first) first = pts.length;
      }
      if (pts[0].distanceTo(pts.at(-1)) < .003) pts.pop();
      const depth = .12, ring = SD.parapetBalusterRing[0];
      const plate = new T.ExtrudeGeometry(new T.Shape(pts), { depth, bevelEnabled: false });
      const boss = new T.CylinderGeometry(ring[4], ring[4], depth + .024, 8);
      return { depth, geometry: merge([[plate, TR(0, 0, -depth / 2)], [boss, place(K.RX(Math.PI / 2), TR(ring[2], ring[3], 0))]]) };
    })();
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
          add('Porch parapet pinnacle crown', S, crown, place(SC(crownScale(PP.pinnacle)), RY(s < 0 ? Math.PI : 0), TR(x, PP.y[1], zc)), CARVED);
          stats.pinnacles++;
          if (i === keys.length - 1) continue;
          const x0 = x + P, x1 = A[keys[i + 1]] - P;
          blk('Porch parapet plinth', S, [x0, x1], [PP.y[0], PP.y[0] + PP.plinth], zr(PP.half + .03));
          blk('Porch parapet top rail', S, [x0, x1], [PP.y[1] - PP.rail, PP.y[1]], zr(PP.half + .02));
          const L = A[keys[i + 1]] - x, n = Math.floor((L - 1.25) / .25 + 1e-6) + 1, u0 = x + (L - (n - 1) * .25) / 2;
          for (let k = 0; k < n; k++) { add('Porch parapet baluster · E02 flat cut', S, balusterGeo.geometry, TR(u0 + k * .25, 0, zc), CARVED); stats.balusters++; }
        }
      }
    }

    // ---- Wing ground storey (EW): entablature, window colonnettes and panels, corner leaves ----
    // The bundle's wing cornice, corbels, window low parapets and flutes are replaced; realism.js
    // rebuilds the openings at the EW centres ±2.45 with the E26 archivolt radii.
    const wingOld = /^(Cornice (lower band|frieze|cap)|Schematic corbel|Window low parapet|Schematic parapet flute)$/, wingRemove = [];
    exterior.traverse(o => { if (/^Outer veranda [BH] 9–10$/.test(o.name)) o.traverse(m => { if (m.isMesh && wingOld.test(m.name)) wingRemove.push(m); }); });
    wingRemove.forEach(o => o.removeFromParent());
    stats.removedBundleMeshes += wingRemove.length;
    const wingGround = f => {
      const wall = -.16; // ground wall face |Z| 13.40
      for (const q of drawnEntablature(-3.925, 3.925, -.3)) add(`Wing entablature · EW ${q.name}`, q.kind === 'W' ? W : S, q.geometry, f.at(0, 0, wall, q.matrix), q.kind === 'C' ? EW : EWD);
      for (const e of [-1, 1]) {
        // Corner leaf beside each pier (EW about u 2.55–3.45, +4.40–5.20), traced, mirrored for B.
        add('Wing corner leaf · EW', S, ew('wingSpandrel', .012), f.at(0, 0, wall + .012, SC(e, 1, 1)), EW);
        const xc = e * 2.45;
        // Panel under the window (EW 2.046–2.846, +0.10–0.65; frames 50 and 25 mm in) with a rosette.
        for (const [hw, v0, v1, w] of [[.4, .1, .65, .03], [.35, .15, .6, .02], [.325, .175, .575, .012]])
          for (const [a, b, c, g] of [[-hw, hw, v1 - .025, v1], [-hw, hw, v0, v0 + .025], [-hw, -hw + .025, v0, v1], [hw - .025, hw, v0, v1]]) f.blk('Wing window panel frame', S, [xc + a, xc + b], [c, g], [wall, wall + w], EWD);
        add('Wing window panel rosette · EW', S, ew('windowRosette', .006), f.at(xc, 0, wall + .03), EW);
        // Colonnettes each side of the window: shaft r 0.065 at 0.749 from the window axis, respond
        // strip behind (EW 3.056–3.134), base +0.06–0.31, traced capital +2.80–3.02, abacus and impost.
        for (const k of [-1, 1]) {
          const uc = xc + k * .749, wc = wall + .075;
          f.blk('Wing window colonnette respond', S, [uc - k * .104 - .039, uc - k * .104 + .039].sort((p, q) => p - q), [.31, 2.75], [wall, wall + .04], EWD);
          add('Wing window colonnette', S, new T.CylinderGeometry(.065, .065, 2.44, 14), f.at(uc, 1.53, wc), EWD);
          f.blk('Wing window colonnette plinth', S, [uc - .164, uc + .164], [.06, .1], [wall, wc + .1], EWD);
          f.blk('Wing window colonnette base', S, [uc - .17, uc + .17], [0, .06], [wall, wc + .1], EWD);
          add('Wing window colonnette torus', S, new T.CylinderGeometry(.127, .13, .21, 14), f.at(uc, .205, wc), EWD);
          add('Wing window colonnette necking', S, new T.CylinderGeometry(.08, .08, .05, 14), f.at(uc, 2.775, wc), EWD);
          f.blk('Wing window colonnette capital bell', S, [uc - .08, uc + .08], [2.8, 3.02], [wall, wc + .06], EWD);
          add('Wing window colonnette capital · EW', S, ew('windowCapital', .006), f.at(uc, 0, wc + .075, SC(k, 1, 1)), EW);
          f.blk('Wing window colonnette abacus', S, [uc - .168, uc + .168], [3.02, 3.05], [wall, wc + .12], EWD);
          f.blk('Wing window impost', S, [uc - .17, uc + .17], [3.05, 3.1], [wall, wc + .12], EWD);
        }
      }
    };

    // ---- 9–10 side gables (E02) ----
    const SG = spec.side;
    for (const s of [-1, 1]) {
      const F = frame([SG.x, 0, s * SG.face], [s, 0, 0], [0, 0, s]);
      const f = face(F);
      // The ground wall stands at |Z| 13.40, 0.16 behind the gable face; the corner piers reach back to
      // the return walls (|Z| 13.10).
      lowerPiers(f, [[3.59, 4.26]], 'Wing', -.46);
      wingGround(f);
      // The gable wall itself, to the CAD silhouette, across the existing wall thickness.
      f.slab('Side gable wall · CAD silhouette', W, f.poly(SG.outline), -(SG.wall[1] - SG.wall[0]), 0);
      for (const e of [-1, 1]) {
        for (const P of [SG.outer, SG.inner]) f.pier({ ...P, u: e > 0 ? P.u : [-P.u[1], -P.u[0]] }, .38, P === SG.inner ? 'wingCapInner' : 'wingCapOuter');
      }
      f.rake(SG.rakes[0], .737353, .42, true, SG.rakePolygons[0]);
      f.rake(SG.rakes[1], .59, .42, false, SG.rakePolygons[1]);
      const sh = SG.rakes[1][1][0];
      f.slab('Side gable top band', S, f.poly([[-sh, SG.band[0]], [sh, SG.band[0]], [SG.bandHalf, SG.band[1]], [-SG.bandHalf, SG.band[1]]]), 0, .42);
      add('Side gable Greek-key frieze', S, meanderGeo(2 * sh, .22), f.at(-sh, SG.band[0] + .1, .42), CARVED);
      // EW teeth under the top band: 66.3 mm, long to +8.853 on the 132.6 mm pitch, short to +9.019 between.
      for (let k = -Math.floor(sh / .0663); k < Math.floor(sh / .0663); k++) {
        const ua = k * .0663 + .0332, L = Math.abs(k) % 2 ? .221 : .387;
        f.blk('Gable raking dentil', S, [ua - .0332, ua + .0332], [SG.band[0] - L, SG.band[0]], [.02, .36], EWD);
      }
      f.rose(SG.rose, SG.roseRings);
      f.aedicule(SG.aedicule);
    }

    // ---- Rear gable on axis 12 (E03) ----
    const RG = spec.rear;
    {
      const F = frame([RG.face, 0, 0], [0, 0, 1], [1, 0, 0]);
      const f = face(F);
      lowerPiers(f, [[7.025012, 7.695012], [10.239012, 10.909012]], 'Rear', 0);
      // E03: the D/E ground piers run on to the mid band; their drawn capital and cornice sit 2.251448
      // higher (+7.8737–8.575367, LINE D90722 against the EW cornice top +6.323919).
      lowerPiers(f, [[3.265012, 3.935012]], 'Rear D/E', 0, RG.lift);
      // E03 ground entablature, as EW draws it (LINEs D90581, D9674E–D96751, D9681E, D968AB–D968AD), from
      // the D/E pier face to the corner pier axis; the long dentils are centred on u ±(4.08245 + k·0.1326).
      for (const e of [-1, 1]) {
        const phase = e * -.02815, [a, b] = e > 0 ? [3.935012, 10.574012] : [-10.574012, -3.935012];
        for (const q of drawnEntablature(a - phase, b - phase, -.06)) add(`Rear entablature · E03 ${q.name}`, q.kind === 'W' ? W : S, q.geometry, f.at(phase, 0, 0, q.matrix), q.kind === 'C' ? EW : EWD);
      }
      // E03 mid band between the D/E piers: the same entablature raised by the D/E lift (dentils
      // +7.6737–7.8737 centred on u 0, Greek key +8.0137–8.2637, cornice to +8.575367).
      for (const q of drawnEntablature(-3.265012, 3.265012, -.06)) add(`Rear mid band · E03 ${q.name}`, q.kind === 'W' ? W : S, q.geometry, f.at(0, RG.lift, 0, q.matrix), q.kind === 'C' ? EW : EWD);
      // Gable wall raised to the CAD silhouette under the rakes (the old end wall stops lower).
      const [[l0, l1], [h0, h1]] = RG.rakes;
      f.slab('Rear gable wall · CAD silhouette', W, f.poly([[-l0[0], 7.0], [l0[0], 7.0], [l0[0], l0[1]], [l1[0], l1[1]], [h0[0], h0[1]], [h1[0], h1[1]], [-h1[0], h1[1]], [-h0[0], h0[1]], [-l1[0], l1[1]], [-l0[0], l0[1]]]), -.44, 0);
      for (const e of [-1, 1]) for (const P of [RG.corner, RG.cg, RG.de]) f.pier({ ...P, u: e > 0 ? P.u : [-P.u[1], -P.u[0]] }, .38, 'wingCapOuter');
      for (const e of [-1, 1]) {
        const C = RG.crest, [c0, c1] = e > 0 ? C.u : [-C.u[1], -C.u[0]], m = SC(e, 1, 1);
        // E03 porch-end cresting (LINEs D90C8E–D90C92): plain band, frieze of roundels and pointed
        // ovals, fillet, then the traced scroll-and-palmette cresting standing on it to +7.613.
        f.blk('Rear gable porch-end parapet', S, [c0, c1], [C.band[0], 6.935776], [0, .30], EWD);
        f.blk('Rear gable porch-end parapet', S, [c0, c1], [6.935776, 7.015776], [0, .27], EWD);
        f.blk('Rear gable porch-end parapet', S, [c0, c1], [7.015776, C.band[1]], [0, .32], EWD);
        add('Rear gable porch-end cresting · E03', S, e03('rearPorchCrest', .009), f.at(0, 0, .25, m), E03C);
        // Scallops and finials on both rakes (crest=false drops the shared fleur crest).
        add('Rear gable rake cresting · E03', S, e03('rearRakeCrestLow', .012), f.at(0, 0, .21, m), E03C);
        add('Rear gable rake cresting · E03', S, e03('rearRakeCrestUp', .012), f.at(0, 0, .21, m), E03C);
        // Quarter fan on the wall beside the D/E pier, over the ground entablature (E03 ARCs D913BB–D913C9):
        // a raised quarter disc to the outer ring r 1.2317 (relief DERIVED) carrying the traced fan.
        const fan = new T.Shape(); fan.moveTo(0, 0); fan.absarc(0, 0, 1.2317, 0, Math.PI / 2, false); fan.lineTo(0, 0);
        add('Rear gable lunette relief', W, new T.ExtrudeGeometry(fan, { depth: .03, bevelEnabled: false, curveSegments: 24 }), f.at(e * 3.935012, 6.323919, 0, SC(e, 1, 1)), EWD);
        add('Rear gable lunette · E03', S, e03('rearLunette', .012, true), f.at(0, 0, .042, m), E03C);
        add('Rear centre-arch spandrel leaf · E03', S, e03('rearArchLeaf', .012, true), f.at(0, 0, .012, m), E03C);
        add('Rear bay corner leaf · E03', S, e03('rearBayLeaves', .01), f.at(0, 0, .012, m), E03C);
        // E03 centre arch (ARCs D917ED–D917F3 about u 0, +4.6642): stepped archivolt between the drawn
        // radii, the intrados carried to the floor as a reveal strip (LINE at u 1.6875), and a coupled
        // pair of columns on one impost (u 1.7925–2.5556, +4.5517–4.6642). The front column axis is
        // u 2.2572, the second is drawn 0.1661 nearer the arch; E03 is an elevation, so setting the
        // second one back is a CONCEPT reading. Plinth +0–0.225 (half 0.2863), base mouldings to
        // +0.6975, shaft r 0.145 to +3.8767, necking to +3.99, traced capital to the abacus +4.4842–4.5517.
        // Steps and projections are DERIVED.
        const AC = 4.664203;
        f.blk('Rear centre-arch reveal', S, e > 0 ? [1.6875, 1.7925] : [-1.7925, -1.6875], [0, 4.5517], [0, .1], EWD);
        f.blk('Rear centre-arch impost', S, e > 0 ? [1.7925, 2.5556] : [-2.5556, -1.7925], [4.5517, 4.664203], [0, .7], EWD);
        for (const [c, wc] of [[2.0911, .16], [2.2572, .42]]) {
          const u = e * c;
          f.blk('Rear centre-arch column plinth', S, [u - .2863, u + .2863], [0, .225], [wc - .2863, wc + .2863], EWD);
          add('Rear centre-arch column base', S, K.turned([[.26, 0], [.26, .06], [.2, .1], [.165, .2], [.18, .3], [.2, .35], [.2019, .405], [.2019, .4725], [.145, .4725]], 20), f.at(u, .225, wc), EWD);
          add('Rear centre-arch column shaft', W, new T.CylinderGeometry(.145, .145, 3.8767 - .6975, 20), f.at(u, (.6975 + 3.8767) / 2, wc), EWD);
          add('Rear centre-arch column necking', S, new T.CylinderGeometry(.19, .17, .1133, 20), f.at(u, 3.9334, wc), EWD);
          add('Rear centre-arch column bell', S, new T.CylinderGeometry(.25, .15, 4.4842 - 3.99, 20), f.at(u, (3.99 + 4.4842) / 2, wc), EWD);
          f.blk('Rear centre-arch column abacus', S, [u - .2951, u + .2951], [4.4842, 4.5517], [wc - .2951, wc + .2951], EWD);
        }
        add('Rear centre-arch capitals · E03', S, e03('rearArchCapital', .01), f.at(0, 0, .42 + .26, m), E03C);
        if (e > 0) for (const [r0, r1, w] of [[1.6875, 1.9355, .1], [1.9355, 2.1115, .14], [2.1115, 2.1465, .18], [2.1465, 2.3325, .12], [2.3325, 2.3675, .16], [2.3675, 2.4375, .2]]) {
          const ring = new T.Shape(); ring.absarc(0, AC, r1, 0, Math.PI, false); ring.absarc(0, AC, r0, Math.PI, 0, true);
          f.slab('Rear centre-arch archivolt · E03', S, ring, 0, w, EWD, 48);
        }
      }
      f.rake(RG.rakes[0], .737353, .42, false, RG.rakePolygons[0]);
      f.rake(RG.rakes[1], .59, .42, false, RG.rakePolygons[1]);
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
    data?.assumptions?.push('Exterior roofline audited against DWG version 23102026: E02 parapet top +7.073919; EW outside wing rose +7.571529 and cross +15.186895; E03 rear rose +9.988501 and cross +17.829188. Source circular niche arches, rose boundaries, mitred cornices and cross silhouettes are transcribed; depths, capital/pinnacle carving, tracery and scrolls remain visualization proxies. Roof elevations and fixture positions remain; display roof ends are trimmed to the current gable face planes. ISSUE-R05 ridge and ISSUE-R06 units remain open; not for construction.');
    data?.assumptions?.push('Lower pilasters at both wing ends and the sanctuary end follow the EW/E03 source shaft widths and heights; their projected depths, bases, capitals, fluting and connection to the existing plinth are concepts, not a structural design. Existing equipment and routes remain in place; access, weatherproofing and engineering holds remain open.');
  }
})();
