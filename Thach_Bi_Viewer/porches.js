/* Side porches (hiên), metres.
   Parish priest's meeting of 25 October 2026 (docs/engineering/parish-meeting-2026-10-25.md), point 2:
   doors and windows stay in the inner C/G wall; the 9–10 side bays have no opening to the porches;
   the porch roof is a cast concrete slab, not timber.
   Owner, 8 November 2026 (docs/engineering/outer-wall-and-marian-art-2026-11-08.md), from a site
   photo of the built wall: the porch line B/H is NOT an open column arcade. It is the drawn outer
   wall of sheets 12/13 (DWG E26/D29 outside opening types): pilasters on the axes, two round-arched
   openings on colonnettes with a rose window above in each window bay, one 2.25 m arch in each stair
   bay, all openings open (no glass or leaves). The rose is the church's 60 cm M rose (concept).
   The pointed arcade of 25 Oct 2026 and its guard are withdrawn; the pointed cross arches remain.
   Sources: plan sheet 5 (porches 2′–9 and 10–12, columns on the B/H axes), sections 24/25
   (“bê tông cốt thép đổ dày 13 cm”, clay tiles over; RC beams), detail 47 (the shouldered
   circular-arc intrados on the C/G axes of the 9–10 bay: spring +5.474155, shoulder +7.147420,
   crown +8.503190; four native ARC entities and two short impost shelves).
   The cross arches C–B / G–H are two-centred pointed arches (owner, 25 Oct 2026); the 9–10 side-bay
   arch keeps the drawn shouldered outline of detail 47. Wall thickness, relief depths, column and
   beam sizes are proposals: no structural design, reinforcement, guarding or code check is implied. */
(() => {
  const SOURCE = 'Parish priest 25 Oct 2026, point 2 · owner 8 Nov 2026 (site photo) · CAD file 23 Oct 2026: plan sheet 5, sections 24/25, detail 47, outer elevations E26/D29 (sheets 12/13)';
  const DRAWN = 'USER CONFIRMED LAYOUT / SOURCE GRID / SCHEMATIC SECTION';
  const CONCEPT = 'CONCEPT · ENGINEERING HOLD';
  const spec = {
    revision: '2026-11-08-outer-wall-1',
    lineZ: 10.414, // axes B/H
    innerFace: 7.47, // porch face of the C/G wall
    floor: -0.32,
    entablature: 5.81, // underside of the existing porch cornice
    // Owner, 3 Nov 2026: the arcade columns take the E02/EW pier at its drawn width (shaft ±0.335
    // along the run, pedestal ±0.559), wrapped round the column; depth ±0.18 and the 0.06 face
    // (0.03 strip + 0.03 fluted field, where the arch washes mount) are unchanged.
    // Owner, 3 Nov 2026 (second review): the column must project. The spandrel's outer face now stands
    // 0.06 from the axis (was 0.18), so the 0.21 column face projects 0.15 in front of it, and the
    // entablature runs from that face and breaks forward over each column; the column depth, its 0.24
    // light-mounting face and the inner (porch) face are unchanged.
    column: { half: 0.18, width: 0.335, pilaster: 0.06, strip: 0.03, spandrel: 0.06 },
    runs: [['2′', '9'], ['10', '12']],
    // Bays where the outside stairs land on the porch: the outer wall has its 2.25 m door-type arch
    // there, down to the porch floor (side elevation: bays 4–5, 8–9 and 10–11).
    stairBays: [16.725, 34.725, 46.425],
    slab: { thick: 0.13, below: 0.03 }, // under the tile plane
    // Cross arches C–B / G–H on every inner axis of each porch run (parish priest's follow-up,
    // 25 Oct 2026; sections 24/25 draw an arch across the porch at each column), from the C/G
    // wall column (porch face |z| 7.65) to the arcade column, same outline as the arcade, with a
    // cast spandrel up to the slab. They carry the slab in place of flat beams.
    beam: { width: 0.22 },
    beamAxes: ['3', '4', '5', '6', '7', '8', '11'],
    cross: { from: 7.65, spring: 3.0, rise: 1.75 },
    wingEnds: [36.975, 44.175], wingWall: 0.32,
    // Outside opening types of E26/D29 and E31/D34. From 25 Oct to 8 Nov 2026 the owner had them in
    // the C/G wall; since 8 Nov 2026 they stand in the outer B/H wall again (site photo), and the
    // C/G wall takes the CAD's single inside opening (sheets 12/13 right-hand elevations).
    openings: {
      window: { width: 1, bottom: .85, leafTop: 2.9505, spring: 3.1005, radius: .5,
        centres: [-1.015, 1.015], radii: [.5, .610, .688, .708, .778, .793, .828] },
      // Candidate only: the current 170 mm exit-sign case does not fit its 150 mm head band.
      // Keep the previous door model until a coordinated sign/mounting revision is checked.
      doorCandidate: { status: 'ENGINEERING HOLD · NOT APPLIED', width: 2.25, bottom: 0, leafTop: 2.9505, spring: 3.1005, radius: 1.125,
        radii: [1.125, 1.290, 1.407, 1.445, 1.550, 1.572, 1.625] },
      reliefDepth: [.21, .30], // retained visual relief projection: CONCEPT, not verified CAD depth
      // Inside elevation of a window bay (sheet 12 right, DWG sheet 26): one 2.25 m opening, sill
      // +0.65, 2.301 m to the 0.22 m head band, then the head. Owner, 8 Nov 2026: the head is a
      // semicircle (1.125 m; drawn as a 1.14 m trefoil) holding the silver M monogram lunette.
      innerWindow: { width: 2.25, bottom: .65, leafTop: 2.951, spring: 3.171, radius: 1.125, centres: [0],
        radii: [1.125, 1.215, 1.265, 1.285] },
    },
    // Outer wall (owner, 8 Nov 2026). Openings use the native outside types above (window E26,
    // door D29 radii); the wall stands from the porch face (−0.18) to the spandrel face (+0.06) of
    // the B/H axis, so the piers still project 0.15. Rose: E02 roundel centre +4.645, overall
    // 0.837 m (sheet 12); glass 0.60 m as the church's sheet gives it. Depths are DERIVED.
    outer: {
      status: 'DRAWING SHOWN (sheets 12/13, DWG E26/D29) · SITE PHOTO 8 NOV 2026 · DERIVED DEPTH · ENGINEERING HOLD',
      relief: .09,
      rose: { y: 4.645, glass: .30, rings: [.33, .39, .4185] },
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
  spec.outer.window = spec.openings.window;
  spec.outer.door = { ...spec.openings.doorCandidate, status: 'OUTER WALL STAIR-BAY ARCH (open, no leaves)', colonnetteShift: .6248 };
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

  function prepare({ THREE: T, exterior, mat, data, artGlass }) {
    if (!exterior) return;
    const A = data.longitudinal;
    exterior.updateMatrixWorld(true);
    // ---- Superseded bundle parts: the outer porch walls with their windows and doors ----
    // Everything that starts below the cornice in the outer groups of the porch bays goes (the
    // wall, its windows and doors, the engaged pilasters); the eave crest and pinnacles stay. Since 3 Nov
    // 2026 the bundle cornice and axis capitals go too: the drawn E02 entablature replaces them. The
    // 9–10 groups are the wing gables (roofline.js).
    const remove = [], box = new T.Box3();
    exterior.traverse(o => {
      if (!/^Outer veranda [BH] /.test(o.name) || /9–10$/.test(o.name)) return;
      o.traverse(m => { if (m.isMesh && (box.setFromObject(m).min.y < spec.entablature - 0.01 || /^(Cornice (lower band|frieze|cap)|Pilaster capital|Schematic corbel)$/.test(m.name))) remove.push(m); });
    });
    remove.forEach(o => o.removeFromParent());

    const root = new T.Group();
    root.name = 'Open side porches — parish priest 25 Oct 2026';
    root.userData = { status: DRAWN, source: SOURCE, revision: spec.revision };
    exterior.add(root);
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, SC, place, merge } = K;
    const ORN = window.CHURCH_EXTERIOR_ORNAMENT.create(T, K);
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
    const C = spec.column;
    const PIER = 'E02/EW PIER OUTLINE AND LEVELS / DERIVED DEPTH · ENGINEERING HOLD', PIER_CARVED = 'E02/EW TRACED CARVING / RELIEF CONCEPT';
    const pier = ORN.drawnPier({ bottom: spec.floor, face: C.half + C.strip, wrap: true });
    const stats = { columns: 0, windowBays: 0, doorBays: 0, openings: 0, roses: 0, colonnettes: 0, beams: 0, leaves: 0 };
    // Traced E02 corner leaf (detail-sides-profile.js sideLeaf, u from the pier axis, left of the pier).
    const leaf = ORN.towerSpandrel(window.CHURCH_DETAIL_PROFILE_SIDES.sideLeaf, .01, .003, 3);
    // Traced E02 window capital (detail-sides-profile.js), as on the inner windows before 8 Nov 2026.
    const capital = ORN.towerSpandrel(window.CHURCH_DETAIL_PROFILE_SIDES.sideWindowCapital, .006, .003, 3);

    // ---- Outer porch wall (owner, 8 Nov 2026) ----
    // Local outward distance d from the B/H axis → world z on side s; boxes take [d0, d1].
    const OW = spec.outer, OUTER = OW.status;
    const zOut = (s, d0, d1) => { const a = s * (spec.lineZ + d0), b = s * (spec.lineZ + d1); return a < b ? [a, b] : [b, a]; };
    const wallFace = C.spandrel, porchFace = -C.half; // the wall stands from the porch face to the spandrel face
    const outBlock = (name, material, s, [x0, x1], [y0, y1], [d0, d1], status = OUTER) => block(name, material, [Math.min(x0, x1), Math.max(x0, x1)], [y0, y1], zOut(s, d0, d1), status);
    const outCyl = (name, material, s, r, y0, y1, x, d) => add(name, material, new T.CylinderGeometry(r, r, y1 - y0, 12), TR(x, (y0 + y1) / 2, s * (spec.lineZ + d)), OUTER);
    // A flat shape in X–Y extruded outward from d0 to d1 on side s.
    const outSlab = (name, material, shape, s, [d0, d1], status = OUTER, segments = 24) => slabXY(name, material, shape, zOut(s, d0, d1), status, segments);
    const archBand = (x, spring, r0, r1) => {
      const shape = new T.Shape(); shape.moveTo(x + r0, spring); shape.absarc(x, spring, r0, 0, Math.PI, false);
      shape.lineTo(x - r1, spring); shape.absarc(x, spring, r1, Math.PI, 0, true); shape.closePath(); return shape;
    };
    const ring = (x, y, r0, r1) => { const shape = new T.Shape(); shape.absarc(x, y, r1, 0, Math.PI * 2, false); const h = new T.Path(); h.absarc(x, y, r0, 0, Math.PI * 2, true); shape.holes.push(h); return shape; };
    // Stained-glass rose (church concept picture, marian-art.js), managed with the other art glass
    // so it follows the day/evening and clear/stained glass settings.
    const roseMaterial = (() => {
      const map = window.CHURCH_MARIAN_ART?.create(T).roseMap ?? null;
      const m = (mat.glass?.clone?.() ?? new T.MeshStandardMaterial({ transparent: true }));
      m.name = 'Stained-glass rose · outer porch wall · church concept';
      if (map) { m.map = m.emissiveMap = map; m.emissive?.set('#ffffff'); m.emissiveIntensity = .24; m.opacity = .92; }
      artGlass?.push({ m, map, bump: null, rough: null });
      return m;
    })();
    function outerBay(s, xa, xb, cx, zArc, out) {
      const door = spec.stairBays.some(c => Math.abs(c - cx) < .6), O = door ? OW.door : OW.window;
      const centres = door ? [0] : O.centres, bottom = door ? spec.floor : O.bottom;
      // The wall between the piers, plastered on both faces, with its openings and the rose cut out.
      const wall = new T.Shape([new T.Vector2(xa, spec.floor), new T.Vector2(xb, spec.floor), new T.Vector2(xb, spec.entablature), new T.Vector2(xa, spec.entablature)]);
      for (const u of centres) {
        const x = cx + u, h = new T.Path();
        h.moveTo(x - O.width / 2, bottom); h.lineTo(x + O.width / 2, bottom); h.lineTo(x + O.width / 2, O.spring);
        h.absarc(x, O.spring, O.radius, 0, Math.PI, false); h.lineTo(x - O.width / 2, bottom);
        wall.holes.push(h); stats.openings++;
      }
      if (!door) { const h = new T.Path(); h.absarc(cx, OW.rose.y, OW.rose.glass, 0, Math.PI * 2, true); wall.holes.push(h); }
      slabXY('Porch outer wall · drawn elevation, openings open · plastered', W, wall, zArc, OUTER, 32);
      for (const u of centres) {
        const x = cx + u, R = O.radii, shift = door ? OW.door.colonnetteShift : 0;
        // Archivolt: concentric bands at the native radii on the outer face; the inner bands return
        // down the jambs, the outer ones rest on the colonnette capitals. A plain band on the porch face.
        for (let i = 0; i < R.length - 1; i++) {
          const d1 = wallFace + OW.relief - i * .008, material = i === 2 || i === 4 ? mat.darkTrim || S : S;
          outSlab('Porch outer archivolt moulding', material, archBand(x, O.spring, R[i], R[i + 1]), s, [wallFace, d1], OUTER, 20);
          if (i < 2) for (const e of [-1, 1]) outBlock('Porch outer opening jamb moulding', material, s, [x + e * R[i], x + e * R[i + 1]], [bottom, O.spring], [wallFace, d1]);
        }
        outSlab('Porch outer opening inner band', S, archBand(x, O.spring, R[0], R[1]), s, [porchFace - .03, porchFace], OUTER, 20);
        for (const e of [-1, 1]) outBlock('Porch outer opening inner band', S, s, [x + e * R[0], x + e * R[1]], [bottom, O.spring], [porchFace - .03, porchFace]);
        // E02 colonnette on each side of the opening (sheet 12 draws four per window bay, sheet 13 two
        // on the door arch): shaft r 0.065 at 0.7532 from a window axis, respond, base, necking,
        // traced capital, abacus and impost (E02 lines D9A249–D9A27C). The door arch keeps the same
        // members 0.6248 further out, under its outer bands. Relief depths are DERIVED.
        const f = wallFace, wc = f + .075;
        for (const k of [-1, 1]) {
          const at = v => x + k * (v + shift), uc = at(.7532), base = door ? spec.floor : -.32;
          outBlock('Porch outer colonnette respond', S, s, [at(.61), at(.6882)], [.31, 2.7505], [f, f + .04]);
          outCyl('Porch outer colonnette shaft', S, s, .065, .31, 2.7505, uc, wc);
          outBlock('Porch outer colonnette base', S, s, [at(.5521), at(.8805)], [base, .06], [f, wc + .1]);
          outBlock('Porch outer colonnette base', S, s, [at(.5521), at(.8805)], [.06, .1], [f, wc + .095]);
          outCyl('Porch outer colonnette base', S, s, .13, .1, .23, uc, wc); outCyl('Porch outer colonnette base', S, s, .09, .23, .31, uc, wc);
          outCyl('Porch outer colonnette necking', S, s, .08, 2.7505, 2.8005, uc, wc);
          outBlock('Porch outer colonnette capital bell', S, s, [uc - .08, uc + .08], [2.8005, 3.0205], [f, wc + .06]);
          add('Porch outer colonnette carving · E02 capital', S, capital, place(SC(k * s, 1, 1), s < 0 ? RY(Math.PI) : new T.Matrix4(), TR(uc, 0, s * (spec.lineZ + wc + .075))), PIER_CARVED);
          outBlock('Porch outer colonnette abacus', S, s, [at(.5482), at(.8867)], [3.0205, 3.0505], [f, wc + .11]);
          outBlock('Porch outer colonnette impost', S, s, [at(.5467), at(.8859)], [3.0505, 3.1005], [f, wc + .12]);
          stats.colonnettes++;
        }
        // Panel under each window (sheet 12, the 850 zone): sill bands +0.75–0.79–0.85 and four
        // notched panels +0.075–0.675, on the outer face.
        if (!door) {
          outBlock('Porch outer sill band moulding', S, s, [x - .5, x + .5], [.75, .79], [f, f + .02]);
          outBlock('Porch outer sill band moulding', S, s, [x - .5, x + .5], [.79, .85], [f, f + .035]);
          outBlock('Porch outer sill', S, s, [x - .5, x + .5], [.82, .85], [porchFace - .03, f]);
          for (const v of [-.33, -.11, .11, .33]) {
            outBlock('Porch outer panel moulding under the opening', S, s, [x + v - .055, x + v + .055], [.1, .65], [f, f + .015]);
            for (const [a, b] of [[.075, .1], [.65, .675]]) outBlock('Porch outer panel moulding under the opening', S, s, [x + v - .03, x + v + .03], [a, b], [f, f + .015]);
          }
        }
      }
      if (door) stats.doorBays++;
      else {
        // Rose window over the pair, where E02 draws its roundel (centre +4.645, 0.837 m overall):
        // the church's 60 cm stained-glass M rose in a moulded ring, glazed at mid-wall.
        const Rr = OW.rose;
        outSlab('Porch rose window frame', mat.darkTrim || S, ring(cx, Rr.y, Rr.glass, Rr.rings[0]), s, [wallFace, wallFace + .03], OUTER, 40);
        outSlab('Porch rose window frame', S, ring(cx, Rr.y, Rr.rings[0], Rr.rings[1]), s, [wallFace, wallFace + .06], OUTER, 40);
        outSlab('Porch rose window frame', S, ring(cx, Rr.y, Rr.rings[1], Rr.rings[2]), s, [wallFace, wallFace + .035], OUTER, 40);
        outSlab('Porch rose window frame', S, ring(cx, Rr.y, Rr.glass, Rr.rings[0]), s, [porchFace - .03, porchFace], OUTER, 40);
        const glass = new T.Mesh(new T.CircleGeometry(Rr.glass, 48), roseMaterial);
        glass.name = 'Porch rose window · stained glass M rose · church concept';
        glass.position.set(cx, Rr.y, s * (spec.lineZ + (wallFace + porchFace) / 2)); if (s < 0) glass.rotation.y = Math.PI;
        glass.castShadow = false; glass.userData = { status: window.CHURCH_MARIAN_ART?.STATUS ?? 'CONCEPT', source: window.CHURCH_MARIAN_ART?.SOURCE ?? SOURCE };
        roses.push(glass); stats.roses++; stats.windowBays++;
      }
    }
    const roses = [];

    for (const s of [-1, 1]) {
      const zc = s * spec.lineZ, z0 = zc - C.half, z1 = zc + C.half, out = s * (spec.lineZ + C.spandrel), zArc = s > 0 ? [z0, out] : [out, z1];
      for (const [from, to] of spec.runs) {
        const keys = Object.keys(A).filter(k => A[k] >= A[from] - 1e-6 && A[k] <= A[to] + 1e-6).sort((a, b) => A[a] - A[b]);
        for (let i = 0; i < keys.length; i++) {
          const x = A[keys[i]];
          // Column at every axis: the drawn E02/EW pier, wrapped round the column, both faces.
          for (const q of pier) add(`Porch column · E02 pier ${q.name}`, q.kind === 'W' ? W : S, q.geometry, place(q.matrix, TR(x, 0, zc)), q.kind === 'C' ? PIER_CARVED : PIER);
          stats.columns++;
          if (i === keys.length - 1) continue;
          const xa = x, xb = A[keys[i + 1]], cx = (xa + xb) / 2, half = (xb - xa) / 2 - C.width;
          // Owner, 8 Nov 2026 (site photo of the built side wall; outer elevations sheets 12/13): the porch
          // line carries the drawn outer wall again, between the piers, with its openings left open (no
          // glass, no leaves). Window bays: two 1.0 m round-arched openings on colonnettes and a rose
          // window above; stair bays: one 2.25 m arch down to the porch floor.
          outerBay(s, xa, xb, cx, zArc, out);
          for (const [px, e] of [[xb, -1], [xa, 1]])
            add('Porch spandrel carving · E02 corner leaf', S, leaf, place(SC(-e * s, 1, 1), s < 0 ? RY(Math.PI) : new T.Matrix4(), TR(px, 0, s * (spec.lineZ + C.spandrel + .002))), PIER_CARVED);
          stats.leaves += 2;
        }
        // Drawn E02 entablature (dentils, fillets, Greek key, cornice to +6.3239) on the outer arcade face,
        // back over the arcade to the old cornice depth. As drawn, it breaks at each pier: it runs between
        // the shaft faces and the pier's own bands carry the cornice over the column.
        for (let i = 0; i < keys.length - 1; i++) {
          const xa = A[keys[i]] + C.width, xb = A[keys[i + 1]] - C.width, face = spec.lineZ + C.spandrel, m = s > 0 ? TR(0, 0, face) : place(RY(Math.PI), TR(0, 0, -face));
          for (const q of ORN.drawnEntablature(s > 0 ? xa : -xb, s > 0 ? xb : -xa, -(C.spandrel + C.half + .2)))
            add(`Porch entablature · E02 ${q.name}`, q.kind === 'W' ? W : S, q.geometry, place(q.matrix, m), q.kind === 'C' ? PIER_CARVED : PIER);
        }
        // Over each column the fillets and cornice break forward by the column's projection (0.15), at
        // the drawn pier band widths (EW/E02), so the entablature wraps the column instead of stopping
        // against it; dentils and frieze stop at the column sides and its capital fills the frieze zone.
        for (const k of keys) {
          const x = A[k], d = C.half + C.strip - C.spandrel;
          for (const [y0, y1, h, p] of [[5.622, 5.662, .36, .18], [5.662, 5.722, .39, .21], [5.722, 5.762, .36, .18], [6.012, 6.06, .385, .18], [6.06, 6.18, .435, .28], [6.18, 6.228, .485, .33], [6.228, 6.3239, .537, .38]]) {
            const f0 = spec.lineZ + C.spandrel, f1 = f0 + p + d;
            block('Porch entablature · E02 break over the column', S, [x - h, x + h], [y0, y1], s > 0 ? [f0, f1] : [-f1, -f0], PIER);
          }
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
    for (const g of roses) root.add(g);
    root.userData.stats = { ...stats, meshes, triangles, removedBundleMeshes: remove.length };
    window.CHURCH_PORCHES.stats = root.userData.stats;
    data?.assumptions?.push('The side porches follow the parish priest’s decision of 25 October 2026 (doors and windows only in the inner C/G wall, a cast roof slab under the tiles with pointed cross arches, plain walls closing the 9–10 side bays from the porches) and the owner’s correction of 8 November 2026 from a site photo: the B/H porch line is the drawn outer wall (sheets 12/13), with open round-arched openings on colonnettes, a 2.25 m arch in each stair bay and the church’s M rose window above each window pair. The 9–10 C/G arch intrados uses four native circular arcs and the short impost shelves from CAD detail 47 (26 October audit); wall thickness, relief depths and the column, slab and beam sizes remain proposals on engineering hold.');
  }
})();
