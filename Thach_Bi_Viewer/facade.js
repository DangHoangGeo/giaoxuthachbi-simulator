/* Central facade between the towers, upper storey and crown, metres.
   Follows the church's CAD file of 23 October 2026, adopted by the owner on 24 October 2026:
   DWG sheet 1, drawing E01B (the full twin-tower end elevation) for heights and widths, and the
   tower-end plans at +10.128 and +15.840 m for depths. The bundle's traced facade (PDF sheet 1:
   three pinnacled gables over a broad entablature) is kept below +8.45 m, where the CAD file
   agrees with it: doors, arches, spandrels and the side-bay cornice. Everything above, and the
   central cornice, is replaced here.
   Faces, levels and arc radii are read from the drawing (see docs/facade-model.md). Moulding
   profiles, relief depths and the carving are illustrative; nothing here implies a structure,
   a fixing or a construction detail. */
(() => {
  const SOURCE = 'CAD file 23 Oct 2026 · DWG sheet 1, drawing E01B; tower-end plans +10.128 and +15.840 m';
  const DRAWN = 'TRACED CAD ELEVATION / SCHEMATIC DEPTH';
  const CARVED = 'TRACED CAD ELEVATION / ILLUSTRATIVE CARVING';
  // World axes: X from axis 1 toward the sanctuary (the street side is smaller X), Y up from the
  // nave floor, Z from the D/E midpoint, positive toward H. The facade is symmetric about Z 0.
  const spec = {
    revision: '2026-10-24-cad-facade-1',
    cut: 8.45, // bundle meshes wholly above this level are superseded
    cornice: { dentil: [8.42, 8.52], fillet: [8.52, 8.605], corona: [8.605, 8.773], frieze: [8.773, 9.073], band: [9.073, 9.115] },
    // The drawing stops the side bays at ±7.128 against the tower pilasters; the model's towers
    // stand back at about ±7.5, so the side-bay wall, plinth and entablature run on to meet them.
    plinth: { body: [9.115, 9.424], cap: [9.424, 9.626], top: [9.626, 9.741], half: 7.5 },
    storey: [9.741, 15.333], entablature: [15.333, 15.84],
    // Piers on the D/E side of the central bay: 621 mm each side of the 5,958.8 mm chain (E01B).
    pier: { z: 2.979, half: 0.435, front: 2.30, back: 5.466 },
    central: {
      half: 2.544, face: 2.936, tympanum: [3.226, 3.556], room: [3.666, 4.716], back: 5.046,
      arch: { y: 12.677, r: [1.96, 2.07, 2.27] },
      lights: { z: [-1.19, 0, 1.19], half: 0.415, sill: 9.984, spring: 12.241, rings: [0.43, 0.54, 0.65] },
      rose: { y: 13.70, r: 0.52 },
    },
    side: {
      z: 5.35, inner: 3.614, outer: 7.5, face: 4.017, back: 4.936,
      arch: { y: 12.96, r: [1.626, 1.736, 1.936] },
      niche: { half: 0.599, spring: 12.308, x: 4.117, rings: [0.709, 0.986] },
      pedestal: [9.741, 10.391],
    },
    crest: { from: 3.614, to: 7.086, front: 3.376, back: 3.706, posts: [3.79, 4.407, 5.024, 5.641, 6.258, 6.875], finial: 17.4 },
    pinnacle: { front: [2.096, 3.40], back: [4.60, 5.42], top: 20.55 },
    aedicule: {
      pier: { z: 1.68, half: 0.30 }, front: 3.805, wall: 3.915, back: 5.046,
      niche: { half: 0.711, floor: 15.997, spring: 18.893, x: 4.225, rings: [0.799, 1.112] },
      pedestal: [15.997, 16.683], rake: [20.42, 21.07], cross: { ball: 22.921, top: 24.648 },
    },
  };
  window.CHURCH_FACADE = { spec, prepare };

  function prepare({ THREE: T, exterior, mat, data }) {
    if (!exterior) return;
    const facade = exterior.getObjectByName('Tower-end central facade — traced from supplied elevation');
    if (!facade) return;
    exterior.updateMatrixWorld(true);
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, RX, RZ, SC, place, merge } = K;

    // ---- Superseded bundle parts: the gables, shrines, entablature and central cornice ----
    let crossMaterial = mat.trim;
    const remove = [], box3 = new T.Box3();
    const corbel = /^(Layered cornice \/ frieze|Cornice dentil|Corbel capital|Tapered cornice corbel|Corbel drop)$/;
    facade.traverse(o => {
      if (!o.isMesh) return;
      if (o.name === 'Central cross') crossMaterial = o.material;
      box3.setFromObject(o);
      const centralCornice = corbel.test(o.name) && Math.abs((box3.min.z + box3.max.z) / 2) < 3.5 && box3.max.y > 8.2;
      if (box3.min.y >= spec.cut || centralCornice) remove.push(o);
    });
    remove.forEach(o => o.removeFromParent());
    // The shrine groups are left empty.
    const hasMesh = o => { let found = false; o.traverse(c => { found ||= c.isMesh; }); return found; };
    facade.children.filter(o => !o.isMesh && !hasMesh(o)).forEach(o => o.removeFromParent());
    facade.name = 'Tower-end central facade — ground storey traced from supplied elevation';
    facade.userData.supersededAbove = spec.cut;
    delete facade.userData.traceLevels;
    delete facade.userData.noStatues;

    const root = new T.Group();
    root.name = 'Tower-end upper facade — CAD file 23 Oct 2026';
    root.userData = { status: DRAWN, source: SOURCE, revision: spec.revision,
      depthStatus: 'Faces from the +10.128 and +15.840 m plans; moulding profiles and carving relief are illustrative.' };
    exterior.add(root);

    // ---- Collect placed parts per name and finish, merged into one mesh each ----
    const bins = new Map();
    const add = (name, material, geometry, matrix = null, status = DRAWN) => {
      const key = name + '\u0000' + material.uuid;
      if (!bins.has(key)) bins.set(key, { name, material, status, parts: [] });
      bins.get(key).parts.push([geometry, matrix]);
    };
    // Axis-aligned block by its world extents.
    const block = (name, material, [x0, x1], [y0, y1], [z0, z1], status) =>
      add(name, material, new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), TR((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), status);
    // Carving is built facing +Z in its own XY plane; this turns it to face the street (−X),
    // with its x along world Z.
    const facing = (x, y, z, ...steps) => place(...steps, RY(-Math.PI / 2), TR(x, y, z));
    // Shapes are drawn in the elevation plane (u = world Z, v = world Y) and extruded back
    // from the face at x0 to x1.
    const slab = (name, material, shape, [x0, x1], status, segments = 20) => {
      const g = new T.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: segments });
      add(name, material, g, place(RY(-Math.PI / 2), TR(x1, 0, 0)), status);
    };
    const outline = (path, zc, half, y0, spring) => {
      path.moveTo(zc - half, y0); path.lineTo(zc + half, y0); path.lineTo(zc + half, spring);
      path.absarc(zc, spring, half, 0, Math.PI, false); path.lineTo(zc - half, y0);
      return path;
    };
    const archOpening = (zc, half, y0, spring) => outline(new T.Path(), zc, half, y0, spring);
    const rect = (z0, z1, y0, y1) => { const s = new T.Shape(); s.moveTo(z0, y0); s.lineTo(z1, y0); s.lineTo(z1, y1); s.lineTo(z0, y1); s.lineTo(z0, y0); return s; };
    // Arch band between radii r0 and r1 about (zc, yc); with legs, it runs down to y0.
    const band = (zc, yc, r0, r1, y0 = yc) => {
      const s = new T.Shape();
      s.moveTo(zc + r1, y0); s.lineTo(zc + r1, yc); s.absarc(zc, yc, r1, 0, Math.PI, false); s.lineTo(zc - r1, y0);
      s.lineTo(zc - r0, y0); s.lineTo(zc - r0, yc); s.absarc(zc, yc, r0, Math.PI, 0, true); s.lineTo(zc + r0, y0);
      return s;
    };
    const both = fn => { for (const s of [-1, 1]) fn(s); };
    const W = mat.wall, S = mat.trim, D = mat.darkTrim;

    // ---- Shared carving ----
    // Fleur-de-lis finial h high, base at the origin, facing +Z.
    const fleur = h => {
      const parts = [[K.leaf({ len: h * .62, wid: h * .26, thick: h * .05, curl: .3, lobes: 0, cup: .25, seg: 6, fine: false }), TR(0, h * .34, 0)],
        [new T.BoxGeometry(h * .34, h * .07, h * .12), TR(0, h * .3, 0)], [new T.BoxGeometry(h * .09, h * .3, h * .09), TR(0, h * .15, 0)]];
      const petal = K.stem([[h * .04, h * .32, 0], [h * .2, h * .42, 0], [h * .27, h * .6, 0], [h * .2, h * .74, 0], [h * .11, h * .68, 0]], h * .045, h * .018, 10, 5);
      for (const e of [-1, 1]) parts.push([petal, SC(e, 1, 1)]);
      return merge(parts);
    };
    const tallFleur = fleur(0.85), smallFleur = fleur(0.42), crownFleur = fleur(0.58);
    // Flat foliate capital for a pilaster w wide and h high, front face at the origin, facing +Z.
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
    // Corinthian-type pilaster capital: bell, leaves and abacus, by world extents.
    const capital = (name, zc, half, [y0, y1], xFront, depth = .3) => {
      const h = y1 - y0;
      block(name, S, [xFront + .03, xFront + depth], [y0, y1 - h * .12], [zc - half * .92, zc + half * .92]);
      block(name, S, [xFront - .02, xFront + depth], [y1 - h * .12, y1], [zc - half * 1.08, zc + half * 1.08]);
      add(name + ' foliage', S, pilasterCapital(half * 2, h * .88), facing(xFront + .03, y0, zc), CARVED);
    };
    // Three flutes on a pilaster face: shadowed grooves read on the face.
    const flutes = (name, zc, step, [y0, y1], xFront) => {
      for (const k of [-1, 0, 1]) block(name, D, [xFront - .004, xFront + .01], [y0, y1], [zc + k * step - .022, zc + k * step + .022]);
    };
    // Greek key frieze in relief between z0 and z1, facing −X at xFront.
    const meander = (name, [z0, z1], [y0, y1], xFront) => {
      const h = y1 - y0, u = .31, t = .035, m = .035, depth = .03, parts = [];
      const bar = (a, b, c, d) => parts.push([new T.BoxGeometry(b - a, d - c, depth), TR((a + b) / 2, (c + d) / 2, depth / 2)]);
      bar(0, z1 - z0, m, m + t); bar(0, z1 - z0, h - m - t, h - m);
      for (let x = 0; x + u <= z1 - z0 + 1e-6; x += u) {
        bar(x, x + t, m, h - m); bar(x + .8 * u - t, x + .8 * u, .3 * h, h - m);
        bar(x + .4 * u, x + .8 * u, .3 * h, .3 * h + t); bar(x + .4 * u, x + .4 * u + t, .3 * h, .66 * h);
        bar(x + .4 * u, x + .62 * u, .66 * h - t, .66 * h);
      }
      add(name, S, merge(parts), facing(xFront, y0, z0), CARVED);
    };
    // Leaf cresting along an arch's extrados from angle a0 down to a1, facing −X.
    const archCrest = (name, zc, yc, r, xFront, size, count, a0 = Math.PI * .9, a1 = Math.PI * .1) => {
      const pts = Array.from({ length: 9 }, (_, i) => { const a = a0 + (a1 - a0) * i / 8; return [Math.cos(a) * r, Math.sin(a) * r]; });
      add(name, S, K.cresting(pts, { size, count, out: 1 }), facing(xFront, yc, zc), CARVED);
    };
    // Carved crest over an arch: an upright leaf between two scrolling sprays and a boss.
    const crown = (name, zc, y0, h, xFront) => {
      const parts = [[K.leaf({ len: h * .72, wid: h * .2, thick: .04, curl: .25, lobes: 2, seg: 6, fine: false }), TR(0, h * .2, 0)]];
      const spray = K.stem([[0, h * .1, 0], [h * .22, h * .32, 0], [h * .42, h * .3, 0], [h * .5, h * .12, 0], [h * .42, h * .04, 0]], .035, .012, 14, 5);
      const curl = K.stem(K.scroll(h * .3, h * .5, h * .12, 1.2, 0, 1), .028, .01, 10, 5);
      const blade = K.leaf({ len: h * .3, wid: h * .16, thick: .025, curl: 1.4, lobes: 3, seg: 5, fine: false });
      for (const e of [-1, 1]) {
        const m = SC(e, 1, 1);
        parts.push([spray, m], [curl, m], [blade, place(RZ(-.9), TR(h * .26, h * .38, 0), m)], [blade, place(RZ(-2.2), TR(h * .46, h * .2, 0), m)]);
      }
      const c = K.cluster({ a: h * .12, b: h * .12, c: .06, leaves: 8, blooms: 1, size: h * .12 });
      parts.push([c.body, TR(0, h * .12, 0)], [c.accent, TR(0, h * .12, 0)]);
      add(name, S, merge(parts), facing(xFront, y0, zc), CARVED);
    };
    // Niche hood: the back half of a cylinder and a quarter sphere over it.
    const hood = (name, zc, half, [y0, spring], x) => {
      add(name, W, new T.CylinderGeometry(half, half, spring - y0, 20, 1, true, 0, Math.PI), TR(x, (y0 + spring) / 2, zc));
      add(name, W, new T.SphereGeometry(half, 20, 8, Math.PI / 2, Math.PI, 0, Math.PI / 2), TR(x, spring, zc));
    };
    // Round colonnette with base, shaft, foliate capital and abacus, by world extents.
    const column = (name, x, zc, r, [y0, y1], capH) => {
      block(name + ' base', S, [x - r * 1.5, x + r * 1.5], [y0, y0 + .12], [zc - r * 1.5, zc + r * 1.5]);
      add(name + ' base', S, new T.CylinderGeometry(r * 1.32, r * 1.4, .1, 16), TR(x, y0 + .17, zc));
      add(name, S, new T.CylinderGeometry(r, r * 1.04, y1 - y0 - .22 - capH, 16), TR(x, (y0 + .22 + y1 - capH) / 2, zc));
      const c = K.capital({ r, h: capH * .8, flare: r * .45, leaves: 6 });
      for (const g of [c.core, c.foliage, c.gilt]) add(name + ' capital', S, g, TR(x, y1 - capH, zc), CARVED);
      block(name + ' abacus', S, [x - r * 1.6, x + r * 1.6], [y1 - capH * .2, y1], [zc - r * 1.6, zc + r * 1.6]);
    };
    const pyramid = (name, x, zc, half, [y0, y1], depthHalf = half) =>
      add(name, S, new T.ConeGeometry(Math.SQRT2, 1, 4, 1), place(RY(Math.PI / 4), SC(depthHalf, y1 - y0, half), TR(x, (y0 + y1) / 2, zc)));

    // ===================================================================================
    // 1. Central cornice over the main door (+8.42 to +9.115) and pier capitals
    const C = spec.cornice, P = spec.pier;
    block('Central cornice dentil band', S, [2.30, 2.6], C.dentil, [-2.49, 2.49]);
    for (let z = -2.43; z <= 2.43 + 1e-6; z += .135) block('Central cornice dentil', S, [2.22, 2.30], [C.dentil[0], C.dentil[1] - .01], [z - .035, z + .035]);
    block('Central cornice fillet', S, [2.18, 2.6], C.fillet, [-3.5, 3.5]);
    block('Central cornice corona', S, [2.06, 2.6], C.corona, [-3.535, 3.535]);
    block('Central cornice frieze', S, [2.19, 2.6], C.frieze, [-2.49, 2.49]);
    meander('Central cornice Greek-key frieze', [-2.48, 2.48], C.frieze, 2.16);
    block('Central cornice crown band', S, [2.05, 2.6], C.band, [-3.53, 3.53]);
    both(s => {
      const zc = s * P.z;
      block('Central pier frieze block', W, [2.12, 2.6], [8.39, C.corona[0]], [zc - .5, zc + .5]);
      capital('Central pier capital · cornice', zc, .5, C.frieze, 2.08, .5);
    });

    // 2. Upper-storey plinth across the three bays (+9.115 to +9.741), the terrace slab behind
    const L = spec.plinth;
    block('Upper storey attic behind the cornice', W, [2.36, 4.95], [8.39, L.body[0]], [-L.half, L.half]);
    block('Upper storey plinth', W, [2.30, 4.95], L.body, [-L.half, L.half]);
    block('Upper storey plinth cap moulding', S, [2.20, 4.95], [L.cap[0], L.cap[0] + .1], [-L.half, L.half]);
    block('Upper storey plinth cap moulding', S, [2.08, 4.95], [L.cap[0] + .1, L.cap[1]], [-L.half, L.half]);
    block('Upper storey terrace slab and plinth top', S, [2.0, 4.95], L.top, [-L.half, L.half]);
    both(s => {
      const zc = s * P.z;
      block('Pier pedestal on the plinth', W, [1.80, 2.4], L.body, [zc - .5, zc + .5]);
      block('Pier pedestal cap moulding', S, [1.68, 2.4], L.cap, [zc - .6, zc + .6]);
      block('Pier pedestal top', S, [1.56, 2.4], L.top, [zc - .73, zc + .73]);
    });

    // 3. Piers of the central bay, +9.741 to the upper entablature
    const [Y0, Y1] = spec.storey;
    both(s => {
      const zc = s * P.z;
      block('Central bay pier base', S, [1.62, 2.4], [Y0, 9.85], [zc - .62, zc + .62]);
      block('Central bay pier base moulding', S, [1.75, 2.4], [9.85, 10.0], [zc - .55, zc + .55]);
      block('Central bay pier base die', W, [1.86, 2.4], [10.0, 10.2], [zc - .49, zc + .49]);
      add('Central bay pier torus moulding', S, new T.CylinderGeometry(.075, .075, 1.14, 12), place(RX(Math.PI / 2), TR(1.70, 10.275, zc)));
      block('Central bay pier torus moulding', S, [1.70, 2.4], [10.2, 10.35], [zc - .57, zc + .57]);
      block('Central bay pier shaft', W, [P.front, P.back], [10.35, 14.95], [zc - P.half, zc + P.half]);
      block('Central bay pier core', W, [2.9, P.back], [Y0, Y1], [s > 0 ? 2.5 : -3.614, s > 0 ? 3.614 : -2.5]);
      flutes('Central bay pier flute', zc, .13, [10.5, 14.75], P.front);
      block('Central bay pier necking', S, [P.front - .03, 2.6], [14.95, 15.0], [zc - .47, zc + .47]);
      capital('Central bay pier capital', zc, .51, [15.0, Y1], 2.22, .4);
    });

    // 4. Central bay: wall, great arch, triple window and rose
    const CB = spec.central, A = CB.arch, LT = CB.lights;
    {
      const wall = rect(-CB.half, CB.half, Y0, Y1);
      wall.holes.push(archOpening(0, A.r[2], Y0, A.y));
      slab('Central bay upper wall', W, wall, [CB.face, CB.tympanum[0]]);
      slab('Central bay great arch moulding', S, band(0, A.y, A.r[1], A.r[2], 12.217), [2.786, CB.face]);
      slab('Central bay great arch inner ring', S, band(0, A.y, A.r[0], A.r[1], 12.217), [3.006, CB.tympanum[0]]);
      // The jambs below the springing step back to the tympanum.
      both(s => {
        block('Central bay arch jamb', W, [2.786, CB.tympanum[0]], [Y0, 12.217], s > 0 ? [A.r[0], A.r[2]] : [-A.r[2], -A.r[0]]);
        block('Central bay arch impost', S, [2.70, CB.tympanum[0]], [12.55, A.y], s > 0 ? [1.75, 2.30] : [-2.30, -1.75]);
        block('Central bay arch impost band', S, [2.74, CB.tympanum[0]], [12.20, 12.25], s > 0 ? [1.75, 2.30] : [-2.30, -1.75]);
      });
      const tymp = new T.Shape(); outline(tymp, 0, A.r[0], Y0, A.y);
      for (const z of LT.z) tymp.holes.push(archOpening(z, LT.half, LT.sill, LT.spring));
      slab('Central bay tympanum wall', W, tymp, CB.tympanum);
      for (const z of LT.z) {
        slab('Triple window arch moulding', S, band(z, LT.spring, LT.rings[1], LT.rings[2]), [3.12, CB.tympanum[0]]);
        slab('Triple window arch moulding', S, band(z, LT.spring, LT.rings[0], LT.rings[1]), [3.17, CB.tympanum[0]]);
        block('Triple window sill', S, [3.12, CB.tympanum[1]], [LT.sill - .05, LT.sill], [z - LT.half - .05, z + LT.half + .05]);
        // Louvred timber leaves in the opening, as the tower belfry windows; the room behind is dark.
        const leaf = new T.Shape(); outline(leaf, z, LT.half, LT.sill, LT.spring);
        slab('Triple window louvre backing', D, leaf, [3.70, 3.72]);
        block('Triple window louvre frame', mat.wood, [3.56, 3.64], [LT.sill, LT.spring + .02], [z - .03, z + .03]);
        for (const e of [-1, 1]) block('Triple window louvre frame', mat.wood, [3.56, 3.64], [LT.sill, LT.spring], [z + e * LT.half - .04, z + e * LT.half + .04].sort((a, b) => a - b));
        for (let y = LT.sill + .12; y < LT.spring; y += .16)
          add('Triple window louvre slat', mat.wood, new T.BoxGeometry(.09, .018, LT.half * 2 - .04), place(RZ(-.7), TR(3.60, y, z)));
      }
      // Engaged colonnettes between and beside the lights.
      for (const [z, r] of [[-1.73, .1], [-.595, .11], [.595, .11], [1.73, .1]]) column('Triple window colonnette', CB.tympanum[0], z, r, [Y0, LT.spring], .46);
      block('Central bay room behind the window', D, [CB.room[1] - .02, CB.room[1]], [Y0, 14.6], [-2.2, 2.2]);
      block('Central bay back wall', W, [CB.room[1], CB.back], [Y0, Y1], [-CB.half, CB.half]);
      // Rose in the tympanum.
      const R = CB.rose;
      add('Central rose moulding', S, new T.TorusGeometry(R.r, .035, 8, 40), place(RY(Math.PI / 2), TR(CB.tympanum[0] - .03, R.y, 0)));
      add('Central rose moulding', S, new T.TorusGeometry(R.r - .07, .025, 8, 40), place(RY(Math.PI / 2), TR(CB.tympanum[0] - .02, R.y, 0)));
      add('Central rose rosette', S, new T.CylinderGeometry(R.r - .09, R.r - .09, .03, 32), place(RZ(Math.PI / 2), TR(CB.tympanum[0] - .015, R.y, 0)));
      add('Central rose carved rosette', S, K.bloom({ r: .3, petals: 12, rings: 2, seg: 4 }), facing(CB.tympanum[0] - .03, R.y, 0), CARVED);
    }
    // Dentils under the upper entablature across the three bays.
    const dentils = (z0, z1, x) => {
      block('Upper entablature dentil band', S, [x + .06, x + .3], [15.15, Y1], [z0, z1]);
      for (let z = z0 + .06; z <= z1 - .06 + 1e-6; z += .13) block('Upper entablature dentil', S, [x, x + .06], [15.15, Y1 - .01], [z - .035, z + .035]);
    };
    dentils(-2.27, 2.27, CB.face - .09);

    // 5. Side bays: great arch, aedicule with an empty niche and pedestal
    const SB = spec.side, N = SB.niche;
    both(s => {
      const zc = s * SB.z, [a, b] = s > 0 ? [SB.inner, SB.outer] : [-SB.outer, -SB.inner];
      const wall = rect(a, b, Y0, Y1);
      wall.holes.push(archOpening(zc, N.half, Y0, N.spring));
      slab('Side bay upper wall', W, wall, [SB.face, SB.back]);
      hood('Side bay niche', zc, N.half, [Y0, N.spring], N.x);
      block('Side bay niche back', W, [N.x + N.half, SB.back], [Y0, N.spring + N.half], [zc - N.half, zc + N.half]);
      slab('Side bay great arch moulding', S, band(zc, SB.arch.y, SB.arch.r[0], SB.arch.r[1], Y0), [3.686, SB.face]);
      slab('Side bay great arch moulding', S, band(zc, SB.arch.y, SB.arch.r[1], SB.arch.r[2]), [3.85, SB.face]);
      for (const e of [-1, 1]) {
        const [p, q] = [zc + e * 1.47, zc + e * 1.80].sort((m, n) => m - n);
        block('Side bay arch impost', S, [3.62, SB.face], [12.85, SB.arch.y], [p, q]);
        block('Side bay arch impost band', S, [3.66, SB.face], [12.50, 12.56], [p, q]);
        column('Side aedicule column', 3.907, zc + e * .896, .09, [Y0, N.spring], .3);
        column('Side aedicule colonnette', 3.975, zc + e * .75, .05, [Y0, N.spring], .3);
      }
      slab('Side aedicule arch moulding', S, band(zc, N.spring, N.rings[0], N.rings[1]), [3.797, SB.face]);
      slab('Side aedicule arch moulding', S, band(zc, N.spring, N.half, N.rings[0]), [3.95, SB.face]);
      archCrest('Side aedicule leaf cresting', zc, N.spring, N.rings[1] + .04, 3.80, .2, 10);
      crown('Side aedicule carved crest', zc, 12.95, 1.4, 3.80);
      // Empty-niche pedestal of the drawing; the owner's statue stands on it (simulator item).
      const [p0, p1] = SB.pedestal;
      block('Side niche statue pedestal base', S, [3.84, 4.46], [p0, p0 + .11], [zc - .6, zc + .6]);
      block('Side niche statue pedestal', W, [3.92, 4.40], [p0 + .11, p1 - .15], [zc - .40, zc + .40]);
      block('Side niche statue pedestal cap', S, [3.84, 4.46], [p1 - .15, p1], [zc - .6, zc + .6]);
      dentils(a + .1, b - .1, SB.face - .09);
    });

    // 6. Upper entablature (+15.333 to +15.840), broken forward over the piers
    const E = spec.entablature, layers = (name, zs, fronts) => {
      const [f0, f1, f2, f3] = fronts;
      block(name + ' architrave', S, [f0, 5.36], [E[0], 15.528], zs);
      block(name + ' fillet', S, [f1, 5.36], [15.528, 15.576], zs);
      block(name + ' corona', S, [f2, 5.36], [15.576, 15.744], zs);
      block(name + ' crown', S, [f3, 5.36], [15.744, E[1]], zs);
    };
    layers('Upper entablature', [-2.344, 2.344], [2.86, 2.80, 2.70, 2.736]);
    both(s => {
      layers('Upper entablature over the pier', s > 0 ? [2.344, 3.614] : [-3.614, -2.344], [2.25, 2.20, 2.10, 2.12]);
      layers('Upper entablature over the side bay', s > 0 ? [SB.inner, SB.outer] : [-SB.outer, -SB.inner], [3.95, 3.70, 3.42, 3.376]);
    });

    // 7. Fleur-de-lis cresting over the side bays, +15.84 to +17.40
    const CR = spec.crest;
    both(s => {
      const zs = s > 0 ? [CR.from, CR.to] : [-CR.to, -CR.from], xm = (CR.front + CR.back) / 2;
      block('Cresting balustrade base rail', S, [CR.front - .05, CR.back + .05], [E[1], 15.94], zs);
      block('Cresting balustrade back upstand', W, [4.85, 4.95], [E[1], 16.1], zs);
      for (const z of [CR.from - .1, CR.to + .1]) block('Cresting balustrade end post', S, [CR.front - .02, CR.back + .02], [15.94, 16.55], [s * z - .1, s * z + .1]);
      const posts = CR.posts, mids = [CR.from + .09, ...posts.slice(0, -1).map((p, i) => (p + posts[i + 1]) / 2), CR.to - .09];
      for (const p of posts) {
        const z = s * p;
        block('Cresting balustrade post', S, [CR.front, CR.back], [15.94, 16.45], [z - .11, z + .11]);
        block('Cresting balustrade post cap', S, [CR.front - .03, CR.back + .03], [16.45, 16.55], [z - .14, z + .14]);
        add('Cresting tall fleur-de-lis finial', S, tallFleur, facing(xm, 16.55, z), CARVED);
      }
      for (const p of mids.slice(1, -1)) {
        const z = s * p;
        add('Cresting baluster', S, K.turned([[.05, 0], [.075, .05], [.04, .14], [.06, .24], [.035, .33], [.07, .4], [.07, .44]], 14), TR(xm, 15.94, z));
        add('Cresting small fleur-de-lis finial', S, smallFleur, facing(xm, 16.84, z), CARVED);
      }
      // Pointed arches from post to post, meeting under the small fleurs.
      for (let i = 0; i < posts.length - 1; i++) for (const [from, to] of [[posts[i], (posts[i] + posts[i + 1]) / 2], [posts[i + 1], (posts[i] + posts[i + 1]) / 2]]) {
        const d = to - from;
        add('Cresting pointed arch', S, K.stem([[0, 16.55, s * from], [0, 16.72, s * (from + d * .45)], [0, 16.82, s * (from + d * .8)], [0, 16.86, s * to]].map(([, y, z]) => [xm, y, z]), .028, .02, 10, 5), null, CARVED);
      }
    });

    // 8. Pinnacles on the central piers, front and back (+15.84 to +20.55)
    const pinnacle = (zc, [x0, x1], label) => {
      const xm = (x0 + x1) / 2, k = Math.min(1, (x1 - x0) / 1.04), tier = (y, half, name = 'Pier pinnacle moulding', m = S) => block(name, m, [xm - half * k, xm + half * k], y, [zc - half, zc + half]);
      block(`Pier pinnacle pedestal · ${label}`, S, [x0, x1], [E[1], 15.94], [zc - .56, zc + .56]);
      tier([15.94, 16.05], .47);
      tier([16.05, 17.17], .40, `Pier pinnacle shaft · ${label}`, W);
      if (label === 'front') flutes('Pier pinnacle flute', zc, .12, [16.25, 17.0], xm - .40 * k);
      tier([17.17, 17.23], .43); tier([17.23, 17.37], .40); tier([17.37, 17.43], .55); tier([17.43, 17.54], .58);
      pyramid('Pier pinnacle gablet', xm, zc, .36, [17.54, 17.80], .36 * k);
      tier([17.54, 18.23], .24, `Pier pinnacle upper shaft · ${label}`, W);
      tier([18.23, 18.27], .33); tier([18.27, 18.33], .30); tier([18.33, 18.62], .24, `Pier pinnacle upper shaft · ${label}`, W);
      tier([18.62, 18.66], .30); tier([18.66, 18.78], .36); tier([18.78, 18.85], .42);
      pyramid('Pier pinnacle gablet', xm, zc, .30, [18.85, 19.10], .30 * k);
      for (const e of [-1, 1]) add('Pier pinnacle colonnette', S, new T.CylinderGeometry(.035, .04, .52, 10), TR(xm, 19.36, zc + e * .13));
      tier([19.62, 19.67], .20);
      add('Pier pinnacle fleur-de-lis finial', S, crownFleur, facing(xm, 19.67, zc), CARVED);
      add('Pier pinnacle finial rod', mat.metal, new T.CylinderGeometry(.015, .015, .3, 6), TR(xm, 20.40, zc));
    };
    both(s => {
      pinnacle(s * P.z, spec.pinnacle.front, 'front');
      pinnacle(s * P.z, spec.pinnacle.back, 'back');
    });
    // The central terrace at +15.84 between the pinnacles and the aedicule.
    block('Central terrace at +15.84', S, [2.736, 5.36], [E[1] - .02, E[1]], [-2.344, 2.344]);

    // 9. Central aedicule: niche, pedestal, piers with pinnacles, pediment, cross on a disc
    const AE = spec.aedicule, AN = AE.niche;
    {
      const r = AE.rake, run = 1.316 - .36, slope = (r[1] - r[0]) / run, top = z => r[0] + (1.316 - Math.abs(z)) * slope;
      const wall = new T.Shape();
      wall.moveTo(-1.40, E[1]); wall.lineTo(1.40, E[1]); wall.lineTo(1.40, top(1.40)); wall.lineTo(.36, r[1]); wall.lineTo(-.36, r[1]); wall.lineTo(-1.40, top(1.40)); wall.lineTo(-1.40, E[1]);
      wall.holes.push(archOpening(0, AN.half, AN.floor, AN.spring));
      slab('Central aedicule wall', W, wall, [AE.wall, AE.back]);
      block('Central aedicule floor step', S, [3.80, AE.back], [E[1], AN.floor], [-1.206, 1.206]);
      hood('Central aedicule niche', 0, AN.half, [AN.floor, AN.spring], AN.x);
      block('Central aedicule niche back', W, [AN.x + AN.half, AE.back + .05], [AN.floor, AN.spring + AN.half], [-AN.half, AN.half]);
      slab('Central aedicule arch moulding', S, band(0, AN.spring, AN.rings[0], AN.rings[1]), [3.88, AE.wall]);
      slab('Central aedicule arch moulding', S, band(0, AN.spring, AN.half, AN.rings[0]), [3.95, AE.wall + .1]);
      archCrest('Central aedicule leaf cresting', 0, AN.spring, AN.rings[1] + .04, 3.86, .22, 12);
      crown('Central aedicule carved crest', 0, 19.86, 1.1, 3.86);
      for (const e of [-1, 1]) column('Central aedicule niche column', 4.015, e * 1.009, .1, [AN.floor, AN.spring], .3);
      // Pedestal of the drawing: 930 mm wide at its mouldings, 686 mm high.
      const [p0, p1] = AE.pedestal;
      block('Central niche statue pedestal base', S, [3.60, 4.60], [p0, p0 + .106], [-.465, .465]);
      block('Central niche statue pedestal', W, [3.68, 4.52], [p0 + .106, p1 - .106], [-.374, .374]);
      block('Central niche statue pedestal cap', S, [3.60, 4.60], [p1 - .079, p1], [-.465, .465]);
      block('Central niche statue pedestal cap', S, [3.64, 4.56], [p1 - .106, p1 - .079], [-.43, .43]);
      // Raking cornice of the pediment, 0.36 m deep on the face.
      both(s => {
        const rake = new T.Shape(), z0 = s * 1.40, z1 = s * .36;
        rake.moveTo(z0, top(1.40) - .02); rake.lineTo(z1, r[1] - .02); rake.lineTo(z1, r[1] + .36); rake.lineTo(z0, top(1.40) + .36); rake.lineTo(z0, top(1.40) - .02);
        slab('Central aedicule raking cornice', S, rake, [3.76, AE.back]);
      });
      block('Central aedicule pediment plinth', S, [3.84, 4.95], [21.29, 21.55], [-.711, .711]);
      block('Central aedicule cross pedestal', W, [3.95, 4.85], [21.55, 22.037], [-.48, .48]);
      add('Central aedicule pedestal rosette', S, K.bloom({ r: .16, petals: 8, rings: 2, seg: 3 }), facing(3.94, 21.80, 0), CARVED);
      for (const e of [-1, 1]) add('Central aedicule pedestal leaf', S, K.leaf({ len: .3, wid: .1, thick: .02, curl: .2, lobes: 0, seg: 4, fine: false }), facing(3.94, 21.80, e * .2, RZ(e * Math.PI / 2)), CARVED);
      block('Central aedicule cross pedestal cornice', S, [3.88, 4.92], [22.037, 22.155], [-.52, .52]);
      block('Central aedicule cross pedestal cornice', S, [3.94, 4.86], [22.155, 22.23], [-.42, .42]);
      block('Central aedicule cross pedestal cornice', S, [4.0, 4.80], [22.23, 22.364], [-.35, .35]);
      pyramid('Central aedicule cross gablet', 4.40, 0, .35, [22.364, 22.645]);
      add('Central cross neck', S, new T.CylinderGeometry(.06, .08, .07, 12), TR(4.40, 22.68, 0));
      add('Central cross disc', S, new T.SphereGeometry(.213, 20, 14), TR(4.40, AE.cross.ball, 0));
      const c0 = AE.cross.ball + .213, c1 = AE.cross.top, arm = 24.10;
      block('Central cross', crossMaterial, [4.34, 4.46], [c0, c1 - .1], [-.055, .055], DRAWN);
      block('Central cross arm', crossMaterial, [4.34, 4.46], [arm - .055, arm + .055], [-.48, .48], DRAWN);
      // Trefoil ends, as drawn.
      for (const [y, z] of [[c1 - .105, 0], [arm, -.5], [arm, .5]]) {
        const dir = z === 0 ? [0, 1] : [Math.sign(z), 0];
        for (const [u, v] of [[0, .05], [-.06, -.01], [.06, -.01]]) {
          const dz = dir[0] ? dir[0] * v : u, dy = dir[0] ? u : v;
          add('Central cross trefoil end', crossMaterial, new T.SphereGeometry(.055, 10, 8), place(SC(1, 1, 1), TR(4.40, y + dy, z + dz)), DRAWN);
        }
      }
      // Aedicule piers with their own pinnacles.
      both(s => {
        const zc = s * AE.pier.z, hw = AE.pier.half, x0 = AE.front;
        block('Central aedicule pier base', S, [x0 - .1, 4.80], [E[1], 16.0], [zc - hw - .1, zc + hw + .1]);
        block('Central aedicule pier base die', W, [x0 - .04, 4.75], [16.0, 16.30], [zc - hw - .04, zc + hw + .04]);
        add('Central aedicule pier torus moulding', S, new T.CylinderGeometry(.06, .06, hw * 2 + .14, 12), place(RX(Math.PI / 2), TR(x0 - .05, 16.38, zc)));
        block('Central aedicule pier torus moulding', S, [x0 - .08, 4.75], [16.30, 16.45], [zc - hw - .07, zc + hw + .07]);
        block('Central aedicule pier shaft', W, [x0, 4.713], [16.45, 20.35], [zc - hw, zc + hw]);
        flutes('Central aedicule pier flute', zc, .1, [16.6, 20.15], x0);
        capital('Central aedicule pier capital', zc, hw + .04, [20.35, 20.65], x0 - .04, .5);
        const [b0, b1] = [zc - s * .58, zc + s * .50].sort((m, n) => m - n);
        block('Central aedicule pier entablature block', S, [x0 - .1, 4.85], [20.65, 21.05], [b0, b1]);
        block('Central aedicule pier entablature cap', S, [x0 - .14, 4.89], [20.97, 21.05], [b0 - .04, b1 + .04]);
        pyramid('Central aedicule pier gablet', 4.25, zc, .40, [21.05, 21.25], .40);
        for (const e of [-1, 1]) add('Central aedicule pier colonnette', S, new T.CylinderGeometry(.035, .04, .6, 10), TR(4.25, 21.55, zc + e * .15));
        block('Central aedicule pier pinnacle cap', S, [4.03, 4.47], [21.85, 21.90], [zc - .22, zc + .22]);
        pyramid('Central aedicule pier gablet', 4.25, zc, .20, [21.90, 22.10], .20);
        add('Central aedicule pier fleur-de-lis finial', S, crownFleur, facing(4.25, 22.10, zc, SC(1.1)), CARVED);
        // Concave spur from the pier pinnacle up to the aedicule pier (arc centre ±3.404, +18.866, r 1.317–1.417).
        const spur = new T.Shape(), cz = s * 3.404, cy = 18.866, rr = 1.367;
        spur.moveTo(s * 2.55, E[1]);
        for (let i = 0; i <= 12; i++) { const z = 2.55 - (2.55 - 2.04) * i / 12, dz = 3.404 - z; spur.lineTo(s * z, cy - Math.sqrt(Math.max(0, rr * rr - dz * dz))); }
        spur.lineTo(s * 1.98, 18.96); spur.lineTo(s * 1.98, E[1]); spur.lineTo(s * 2.55, E[1]);
        slab('Central aedicule scroll spur', W, spur, [4.273, 4.493]);
        add('Central aedicule scroll spur moulding', S, K.stem(Array.from({ length: 7 }, (_, i) => { const z = 2.55 - (2.55 - 2.02) * i / 6, dz = 3.404 - z; return [4.26, cy - Math.sqrt(Math.max(0, rr * rr - dz * dz)) + .03, s * z]; }), .05, .04, 12, 6), null, CARVED);
        add('Central aedicule scroll spur volute', S, K.stem(K.scroll(0, 0, .14, 1.2, 0, 1), .04, .015, 10, 5), facing(4.25, 17.86, s * 2.50, SC(-s, 1, 1)), CARVED);
      });
    }

    // ---- Meshes ----
    // Shared corners are welded into an index, as in the bundle's own geometry, so the display
    // batches keep their memory saving.
    const indexed = g => {
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
      const geometry = indexed(merge(parts));
      const mesh = new T.Mesh(geometry, material);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData = { status, source: SOURCE };
      root.add(mesh);
      meshes++; triangles += geometry.index.count / 3;
    }
    root.userData.meshCount = meshes; root.userData.triangles = triangles; root.userData.removedBundleMeshes = remove.length;
    root.userData.levels = { plinthTop: L.top[1], entablatureTop: E[1], centralArchSpring: A.y, sideNicheSpring: N.spring, centralNicheSpring: AN.spring, crossTop: AE.cross.top };
    data?.assumptions?.push('The central facade above +8.45 m follows the church’s CAD file of 23 October 2026 (DWG sheet 1, E01B; plans at +10.128 and +15.840 m): upper storey with a triple window and rose, side niches with pedestals, fleur-de-lis cresting, pinnacled piers and a niche aedicule with a cross on a disc to +24.648 m. Faces and levels are traced; moulding profiles and carving are illustrative.');
    window.CHURCH_FACADE.stats = { meshes, triangles: Math.round(triangles), removed: remove.length };
  }
})();
