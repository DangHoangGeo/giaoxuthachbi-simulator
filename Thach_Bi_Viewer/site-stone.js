/* Exterior stone and courtyard, design excellence stages 4 and 5 (20 November 2026). Metres; X
 * from axis 1 toward the sanctuary, Y up, Z from the centre line. See docs/design-excellence.md.
 *
 * CONCEPT · In development · Not for construction.
 *   - Stage 4, plinth masonry: the rubble plinth selected for the church (realism.js, mat.foundation)
 *     was flat two-tone patches with a pale outline. It becomes coursed random rubble: stones of
 *     varied length in courses of varied height, pillowed faces, recessed dark mortar, natural grey
 *     to warm-grey granite. Same material, same UV scale (2.4 m per tile), no geometry change.
 *   - Stage 5, grounds: the presentation ground (mat.ground) becomes sawn granite slabs in running
 *     bond. In front of the entrance steps a designed courtyard (DX-05) lies on the existing
 *     courtyard level: a processional way on the axis, a granite medallion with an eight-point
 *     star and cross, a diagonal field, transverse bands and a dark border. It is a surface finish
 *     3 mm above the ground plane, inside the paved area between the two lawns.
 * The site is unsurveyed. Levels, drainage falls, sub-base, kerbs, stone selection and slip
 * resistance are not designed; the walking floor and every analysis input are unchanged.
 */
(() => {
  'use strict';
  const spec = {
    revision: '2026-11-21-site-stone-2',
    status: 'CONCEPT · design excellence stages 4–5 · appearance only',
    plinthTile: 2.4,            // realism.js UV scale of mat.foundation
    // Rock-faced ashlar (21 Nov 2026): one canvas covers 4.8 m; course joints at these world levels
    // (m). The plinth tops are −0.40 (main and side projections) and ±0.00 (towers); the courtyard
    // is at −2.077. Foot course 0.64 m, then 0.52 m, then a 0.40 m tower course.
    plinth: { tile: 4.8, courses: [0, -0.40, -0.92, -1.44, -2.08], ground: 2.077, joint: .012, draft: .035, proud: .035, chamfer: .02 },
    groundTile: 4.8,            // realism.js UV scale of mat.ground
    courtyard: { x0: -58, x1: -9.3, z: 22.4, y: -2.077, axis: 3.0, medallion: { x: -21, r: 4.2 }, bands: [-33, -46], border: .6 }
  };

  function prepare({ THREE: T, building, mat, palettes, data, renderer }) {
    if (!mat?.foundation || !mat?.ground) return;
    const off = new URLSearchParams(globalThis.location?.search || '').get('sitestone');
    let seed = 20112028;
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 4);
    const stats = { plinthStones: 0, slabs: 0, courtyard: 0 };
    function texture(canvas, name, colour, repeat = true) {
      const t = window.CHURCH_TEXTURES?.create(T, canvas) || new T.CanvasTexture(canvas);
      t.name = name; t.colorSpace = colour ? T.SRGBColorSpace : T.NoColorSpace; t.anisotropy = anisotropy;
      if (repeat) t.wrapS = t.wrapT = T.RepeatWrapping;
      return t;
    }
    const pair = (w, h = w) => { const a = document.createElement('canvas'), b = document.createElement('canvas'); a.width = b.width = w; a.height = b.height = h; return [a, b, a.getContext('2d'), b.getContext('2d')]; };
    function speckle(g, n, count, alpha, h = n) {
      for (let i = 0; i < count; i++) { const v = rand() > .5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${alpha * rand()})`; g.fillRect(rand() * n, rand() * h, 1 + rand() * 2, 1 + rand() * 2); }
    }
    function replace(material, map, bump, bumpScale, color, roughness) {
      material.map = map; material.bumpMap = bump; material.bumpScale = bumpScale;
      if (color) material.color.set(color);
      if (roughness !== undefined) material.roughness = roughness;
      material.userData.siteStone = spec.revision; material.needsUpdate = true;
      const p = palettes?.get(material);
      if (p) { p.map = map; p.bump = bump; if (color) p.color = material.color.clone(); }
    }

    /* ------------------------------------------------ stage 4: rock-faced granite ashlar */
    // Owner, 21 Nov 2026: the coursed rubble looked busy ("silly"); the base should be simpler and
    // read steady and strong, like rock. Large rock-faced blocks in level courses set to the plinth's
    // own levels, one granite tone, thin recessed joints, a heavier course at the foot.
    if (off !== 'off' && off !== 'noplinth') {
      const P = spec.plinth, W = 2048, H = 1024, sx = W / P.tile, sy = H / P.tile, [cc, bc, g, b] = pair(W, H);
      // realism.js maps V = world Y / 2.4; the map repeats every P.tile m, so canvas row y holds
      // world Y = −y / sy (0 at the top of the canvas, the plinth's top levels just below it).
      const row = Y => -Y * sy, joint = P.joint * sx, draft = P.draft * sx;
      g.fillStyle = '#57534d'; g.fillRect(0, 0, W, H);           // recessed joint, in shade
      b.fillStyle = '#202020'; b.fillRect(0, 0, W, H);
      const levels = P.courses.concat([-P.tile]);
      for (let k = 0; k < levels.length - 1; k++) {
        const y0 = row(levels[k]), y1 = row(levels[k + 1]), base = levels[k + 1] <= P.courses[P.courses.length - 1] + 1e-6;
        // Blocks fill the 4.8 m repeat exactly, in running bond from course to course.
        const lengths = []; let left = W;
        while (left > 0) { const L = Math.round(((base ? 1.25 : .95) + rand() * .55) * sx); lengths.push(Math.min(L, left)); left -= L; }
        if (lengths.length > 1 && lengths[lengths.length - 1] < .6 * sx) { const last = lengths.pop(); lengths[lengths.length - 1] += last; }
        let x = (k % 2 ? .5 : .15 + rand() * .2) * sx;
        for (const L of lengths) {
          const tone = 146 + (rand() - .5) * 12, warm = (rand() - .5) * 2;
          for (const dx of [-W, 0, W]) {
            const X0 = x + dx + joint / 2, X1 = x + dx + L - joint / 2, Y0 = y0 + joint / 2, Y1 = y1 - joint / 2;
            if (X1 < 0 || X0 > W) continue;
            // Colour: one granite family, lighter tooled margin, rock face slightly darker below.
            const face = g.createLinearGradient(0, Y0, 0, Y1);
            face.addColorStop(0, `rgb(${tone + 8 + warm},${tone + 7},${tone + 3 - warm})`);
            face.addColorStop(1, `rgb(${tone - 10 + warm},${tone - 11},${tone - 14 - warm})`);
            g.fillStyle = face; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
            g.strokeStyle = `rgba(255,252,245,.16)`; g.lineWidth = draft * .9; g.strokeRect(X0 + draft / 2, Y0 + draft / 2, X1 - X0 - draft, Y1 - Y0 - draft);
            // Relief: the drafted margin is a flat band; the rock face inside it bulges and breaks.
            b.fillStyle = '#7a7a7a'; b.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
            b.fillStyle = '#9c9c9c'; b.fillRect(X0 + draft, Y0 + draft, X1 - X0 - 2 * draft, Y1 - Y0 - 2 * draft);
            g.save(); g.beginPath(); g.rect(X0 + draft, Y0 + draft, X1 - X0 - 2 * draft, Y1 - Y0 - 2 * draft); g.clip();
            b.save(); b.beginPath(); b.rect(X0 + draft, Y0 + draft, X1 - X0 - 2 * draft, Y1 - Y0 - 2 * draft); b.clip();
            const lumps = Math.round((X1 - X0) * (Y1 - Y0) / (sx * sy) * 70);
            let s2 = Math.round(tone * 977 + L) >>> 0;   // same lumps in each wrap copy
            const r2 = () => ((s2 = (Math.imul(s2, 1664525) + 1013904223) >>> 0) / 4294967296);
            for (let i = 0; i < lumps; i++) {
              const cx = X0 + r2() * (X1 - X0), cy = Y0 + r2() * (Y1 - Y0), rad = (.03 + r2() * .09) * sx, up = r2();
              const bump = b.createRadialGradient(cx, cy, 0, cx, cy, rad), v = Math.round(150 + up * 90);
              bump.addColorStop(0, `rgba(${v},${v},${v},.55)`); bump.addColorStop(1, `rgba(${v},${v},${v},0)`);
              b.fillStyle = bump; b.fillRect(cx - rad, cy - rad, 2 * rad, 2 * rad);
              const shade = g.createRadialGradient(cx, cy, 0, cx, cy, rad), d = up > .5 ? 255 : 0;
              shade.addColorStop(0, `rgba(${d},${d},${d},.05)`); shade.addColorStop(1, `rgba(${d},${d},${d},0)`);
              g.fillStyle = shade; g.fillRect(cx - rad, cy - rad, 2 * rad, 2 * rad);
            }
            g.restore(); b.restore();
            // The bed joint casts a thin shadow under each block's top arris.
            g.fillStyle = 'rgba(30,27,22,.18)'; g.fillRect(X0, Y0, X1 - X0, Math.max(2, joint * .6));
          }
          stats.plinthStones++;
          x += L;
        }
      }
      // Damp and splash darken the foot course a little.
      const foot = g.createLinearGradient(0, row(P.courses[P.courses.length - 2]), 0, row(-P.ground));
      foot.addColorStop(0, 'rgba(40,36,30,0)'); foot.addColorStop(1, 'rgba(40,36,30,.12)');
      g.fillStyle = foot; g.fillRect(0, row(P.courses[P.courses.length - 2]), W, row(-P.ground) - row(P.courses[P.courses.length - 2]));
      speckle(g, W, 60000, .1, H); speckle(b, W, 30000, .14, H);
      const map = texture(cc, 'Site stone · rock-faced granite ashlar', true), relief = texture(bc, 'Site stone · ashlar rock-face relief', false);
      // One canvas covers P.tile metres; realism.js UVs count 2.4 m per unit.
      for (const t of [map, relief]) t.repeat.set(spec.plinthTile / P.tile, spec.plinthTile / P.tile);
      replace(mat.foundation, map, relief, .07, '#ffffff', .93);
    }

    /* ------------------------------------------------ stage 4b: real stones on the plinth */
    // Owner, 21 Nov 2026: a texture still reads "like a paper drawing". The large plinth faces get
    // real blocks: each stone stands 35 mm proud with 20 mm chamfered arrises, so the joints are
    // shadowed grooves. Courses follow spec.plinth.courses; blocks are skipped where another plinth
    // body covers the face. Stair risers and slivers under 0.15 m keep the textured finish.
    // Display geometry only: the plinth boxes, walking floor and analysis inputs are unchanged.
    if (off !== 'off' && off !== 'noplinth' && off !== 'flat') {
      const P = spec.plinth, D = P.proud, C = P.chamfer, J = P.joint, sources = [];
      building.updateMatrixWorld(true);
      building.traverse(o => {
        if (!o.isMesh || o.material !== mat.foundation || o.geometry.type !== 'BoxGeometry' || /riser/i.test(o.name)) return;
        const e = o.matrixWorld.elements;
        if (Math.abs(e[1]) + Math.abs(e[2]) + Math.abs(e[4]) + Math.abs(e[6]) + Math.abs(e[8]) + Math.abs(e[9]) > 1e-6) return; // axis-aligned only
        sources.push({ o, box: new T.Box3().setFromObject(o) });
      });
      const covered = (p, self) => sources.some(({ box }) => box !== self && p.x > box.min.x - .005 && p.x < box.max.x + .005
        && p.y > box.min.y && p.y < box.max.y && p.z > box.min.z - .005 && p.z < box.max.z + .005);
      // Rock face: a tileable 2 m × 1 m patch of broken granite, multiplied by a per-stone tone.
      const RW = 1024, RH = 512, [rc, rb, g, b] = pair(RW, RH);
      g.fillStyle = 'rgb(160,159,155)'; g.fillRect(0, 0, RW, RH); b.fillStyle = '#808080'; b.fillRect(0, 0, RW, RH);
      for (let i = 0; i < 900; i++) {
        const cx = rand() * RW, cy = rand() * RH, rad = (.025 + rand() * .11) * RH, up = rand();
        for (const dx of [-RW, 0, RW]) for (const dy of [-RH, 0, RH]) {
          const X = cx + dx, Y = cy + dy; if (X < -rad || X > RW + rad || Y < -rad || Y > RH + rad) continue;
          const v = Math.round(80 + up * 175), bump = b.createRadialGradient(X, Y, 0, X, Y, rad);
          bump.addColorStop(0, `rgba(${v},${v},${v},.5)`); bump.addColorStop(1, `rgba(${v},${v},${v},0)`);
          b.fillStyle = bump; b.fillRect(X - rad, Y - rad, 2 * rad, 2 * rad);
          const d = up > .5 ? 255 : 70, sh = g.createRadialGradient(X, Y, 0, X, Y, rad);
          sh.addColorStop(0, `rgba(${d},${d},${d},.035)`); sh.addColorStop(1, `rgba(${d},${d},${d},0)`);
          g.fillStyle = sh; g.fillRect(X - rad, Y - rad, 2 * rad, 2 * rad);
        }
      }
      speckle(g, RW, 50000, .13, RH); speckle(b, RW, 30000, .2, RH);
      const rockMap = texture(rc, 'Site stone · rock-faced granite block face', true), rockBump = texture(rb, 'Site stone · rock-faced block relief', false);
      // Four close granite tones; the display batches keep only position, normal and uv, so tone is
      // a material per group rather than a vertex colour.
      const TONES = ['#f2f1ee', '#e8e7e3', '#e0dfdb', '#eeeeec'];
      const buckets = TONES.map((c, i) => ({ mat: new T.MeshStandardMaterial({ name: `Rock-faced granite ashlar · plinth blocks ${i + 1} (concept)`, map: rockMap, bumpMap: rockBump,
        bumpScale: .09, roughness: .92, metalness: 0, color: c, envMapIntensity: mat.foundation.envMapIntensity ?? .45 }), pos: [], nor: [], uv: [], idx: [] }));
      // Quad from four corners (counter-clockwise seen from outside) with one flat normal.
      const quad = (a, b2, c, d, n, B, uvOf) => {
        const base = B.pos.length / 3;
        for (const q of [a, b2, c, d]) { B.pos.push(...q); B.nor.push(...n); B.uv.push(...uvOf(q)); }
        B.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      };
      let stones = 0;
      // One stone on a face: [s0, s1] along it, [y0, y1] up, chamfered and standing D proud.
      const stone = (axis, fixed, sgn, s0, s1, y0, y1) => {
        const W3 = (u, v, w) => axis === 0 ? [u, v, fixed + sgn * w] : [fixed + sgn * w, v, u];
        const N3 = (nu, nv, nw) => { const v3 = axis === 0 ? [nu, nv, sgn * nw] : [sgn * nw, nv, nu]; const l = Math.hypot(...v3); return v3.map(x => x / l); };
        const ou = rand() * 4, ov = rand() * 4, uvOf = q => [((axis === 0 ? q[0] : q[2]) + ou) / 2, (q[1] + ov) / 1];
        const tone = buckets[Math.floor(rand() * buckets.length)], c = Math.min(C, (y1 - y0) / 3, (s1 - s0) / 3);
        const back = -.004, bl = W3(s0, y0, back), br = W3(s1, y0, back), tr = W3(s1, y1, back), tl = W3(s0, y1, back);
        const fbl = W3(s0 + c, y0 + c, D), fbr = W3(s1 - c, y0 + c, D), ftr = W3(s1 - c, y1 - c, D), ftl = W3(s0 + c, y1 - c, D);
        // Winding depends on which way the face looks along its axis.
        const ccw = (axis === 0 ? sgn > 0 : sgn < 0);
        const Q = (a, b2, cc, d, n) => ccw ? quad(a, b2, cc, d, n, tone, uvOf) : quad(a, d, cc, b2, n, tone, uvOf);
        Q(fbl, fbr, ftr, ftl, N3(0, 0, 1));                 // rock face
        Q(tl, ftl, ftr, tr, N3(0, c, D));                    // top chamfer
        Q(bl, br, fbr, fbl, N3(0, -c, D));                   // bottom chamfer
        Q(bl, fbl, ftl, tl, N3(-c, 0, D));                   // left chamfer
        Q(br, tr, ftr, fbr, N3(c, 0, D));                    // right chamfer
        stones++;
      };
      // Courses on one face. top(t) is the face's top at t along it: constant on a plinth box, the
      // tread of the riser there on a stair cheek, where the top course is cut at each step (cuts).
      const layFace = ({ axis, fixed, sgn, a0, a1, yb, yt, top, cuts, self, ext }) => {
        const levels = P.courses.filter(y => y < yt - 1e-6 && y > yb + 1e-6);
        const rows = [yt, ...levels, yb].map((y, i, all) => [all[i + 1], y]).slice(0, -1).filter(([lo, hi]) => hi - lo >= .15);
        rows.forEach(([lo, hi], k) => {
          const foot = lo <= -P.ground + .01;
          let t = a0 - ext, first = true;
          while (t < a1 + ext - .05) {
            let L = (foot ? 1.25 : .95) + rand() * .55;
            if (first) { L *= ((k + (axis === 0 ? 0 : 1)) % 2) ? .5 : 1; first = false; }   // running bond
            let t1 = Math.min(t + L, a1 + ext); if (a1 + ext - t1 < .45) t1 = a1 + ext;
            const marks = [t, ...cuts.filter(m => m > t + .05 && m < t1 - .05), t1];
            const pieces = marks.slice(0, -1).map((m, i) => [m, marks[i + 1]]);
            const stepped = pieces.some(([p0, p1]) => top((p0 + p1) / 2) < hi - 1e-6);
            for (const [p0, p1] of stepped ? pieces : [[t, t1]]) {
              const h = Math.min(hi, top((p0 + p1) / 2));
              if (h - lo < .1) continue;
              const s0 = p0 + J / 2, s1 = p1 - J / 2, y0 = lo + (foot ? 0 : J / 2), y1 = h - J / 2;
              const mid = new T.Vector3(), out = .02 * sgn;
              if (axis === 0) mid.set((s0 + s1) / 2, (y0 + y1) / 2, fixed + out); else mid.set(fixed + out, (y0 + y1) / 2, (s0 + s1) / 2);
              if (!covered(mid, self)) stone(axis, fixed, sgn, s0, s1, y0, y1);
            }
            t = t1;
          }
        });
      };
      for (const { box } of sources) {
        const yb = Math.max(box.min.y, -P.ground - .003), yt = box.max.y;
        // Faces: axis along the face (0 = X, 2 = Z), fixed coordinate, outward sign.
        for (const [axis, fixed, sgn] of [[2, box.min.x, -1], [2, box.max.x, 1], [0, box.min.z, -1], [0, box.max.z, 1]]) {
          const [a0, a1] = axis === 0 ? [box.min.x, box.max.x] : [box.min.z, box.max.z];
          if (a1 - a0 >= .8) layFace({ axis, fixed, sgn, a0, a1, yb, yt, top: () => yt, cuts: [], self: box, ext: D });
        }
      }
      // Owner, 21 Nov 2026: the towers' lower columns (towers.js, traced E02/E01B, plastered with strips)
      // take the same stone, so the base of each tower reads as one rock foot with the plinth. Faces
      // against the tower core are inside the plinth and skipped; the band course above stays.
      const lower = (window.CHURCH_TOWERS?.lowerColumns || []).map(c => new T.Box3(new T.Vector3(c.x[0], c.y[0], c.z[0]), new T.Vector3(c.x[1], c.y[1], c.z[1])));
      for (const box of lower) {
        const yb = Math.max(box.min.y, -P.ground - .003), yt = box.max.y;
        for (const [axis, fixed, sgn] of [[2, box.min.x, -1], [2, box.max.x, 1], [0, box.min.z, -1], [0, box.max.z, 1]]) {
          const [a0, a1] = axis === 0 ? [box.min.x, box.max.x] : [box.min.z, box.max.z];
          layFace({ axis, fixed, sgn, a0, a1, yb, yt, top: () => yt, cuts: [], self: box, ext: D });
        }
      }
      stats.towerColumnFaces = lower.length;
      // Owner, 21 Nov 2026: the outer faces of the side stairs get the same stones. Each flight's risers
      // (boxes stepping along X) form one cheek wall on each side; the inner cheek, inside the plinth,
      // is skipped by the cover test.
      const risers = [];
      building.traverse(o => {
        if (!o.isMesh || o.material !== mat.foundation || o.geometry.type !== 'BoxGeometry' || !/riser/i.test(o.name)) return;
        const box = new T.Box3().setFromObject(o);
        if (box.max.x - box.min.x < box.max.z - box.min.z) risers.push(box);   // flights running along X
      });
      const flights = new Map();
      for (const r of risers) {
        const key = `${r.min.z.toFixed(2)}|${r.max.z.toFixed(2)}`;
        if (!flights.has(key)) flights.set(key, []);
        flights.get(key).push(r);
      }
      for (const list of flights.values()) {
        list.sort((p, q) => p.min.x - q.min.x);
        // Split into contiguous runs (two flights can share a Z band).
        const runs = [[list[0]]];
        for (const r of list.slice(1)) { const run = runs[runs.length - 1]; if (r.min.x - run[run.length - 1].max.x > .05) runs.push([r]); else run.push(r); }
        for (const run of runs) {
          const a0 = run[0].min.x, a1 = run[run.length - 1].max.x, yt = Math.max(...run.map(r => r.max.y));
          // Riser boxes overlap a little: the cheek top is the highest riser at t, and the course is cut
          // wherever that height changes (flights rise either way along X).
          const top = t => Math.max(-Infinity, ...run.filter(q => t >= q.min.x - 1e-6 && t <= q.max.x + 1e-6).map(q => q.max.y));
          const marks = [...new Set(run.flatMap(r => [r.min.x, r.max.x]).map(v => +v.toFixed(4)))].sort((p, q) => p - q);
          const cuts = marks.slice(1, -1).filter((m, i) => Math.abs(top((marks[i] + m) / 2) - top((m + marks[i + 2]) / 2)) > 1e-6);
          for (const [fixed, sgn] of [[run[0].min.z, -1], [run[0].max.z, 1]])
            layFace({ axis: 0, fixed, sgn, a0, a1, yb: -P.ground - .003, yt, top, cuts, self: null, ext: 0 });
        }
      }
      for (const B of stones ? buckets : []) {
        if (!B.idx.length) continue;
        const geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(B.pos, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(B.nor, 3));
        geo.setAttribute('uv', new T.Float32BufferAttribute(B.uv, 2)); geo.setIndex(B.idx);
        const mesh = new T.Mesh(geo, B.mat), parent = sources[0].o.parent;
        mesh.name = 'Plinth rock-faced ashlar blocks · concept';
        mesh.castShadow = sources[0].o.castShadow; mesh.receiveShadow = true;
        mesh.userData = { status: 'CONCEPT · display stone on the plinth faces; plinth geometry unchanged', revision: spec.revision };
        // Built in world coordinates: undo the parent's transform.
        parent.updateMatrixWorld(true); mesh.applyMatrix4(new T.Matrix4().copy(parent.matrixWorld).invert()); parent.add(mesh);
      }
      stats.plinthBlocks = stones;
    }

    /* ------------------------------------------------ stage 5: granite slab paving */
    if (off === 'off') return;
    const slabDraw = (g, b, N, tile, light) => {
      const px = N / tile, cols = Math.round(tile / .6), rowsN = Math.round(tile / .4), w = N / cols, h = N / rowsN, jt = Math.max(2, .008 * px);
      g.fillStyle = '#8b877e'; g.fillRect(0, 0, N, N); b.fillStyle = '#3a3a3a'; b.fillRect(0, 0, N, N);
      for (let r = 0; r < rowsN; r++) for (let c = -1; c <= cols; c++) {
        const x = (c + (r % 2) * .5) * w, y = r * h, v = light + (rand() - .5) * 16, warm = (rand() - .5) * 6;
        g.fillStyle = `rgb(${v + warm},${v},${v - 6 - warm})`; g.fillRect(x + jt / 2, y + jt / 2, w - jt, h - jt);
        b.fillStyle = '#b8b8b8'; b.fillRect(x + jt / 2, y + jt / 2, w - jt, h - jt);
        stats.slabs++;
      }
      speckle(g, N, 30000, .14); speckle(b, N, 8000, .08);
    };
    {
      const N = 1024, [cc, bc, g, b] = pair(N);
      slabDraw(g, b, N, spec.groundTile, 186);
      replace(mat.ground, texture(cc, 'Site stone · sawn granite slabs', true), texture(bc, 'Site stone · slab joints', false), .02, '#ffffff', .78);
    }

    /* ------------------------------------------------ stage 5: designed courtyard (DX-05) */
    {
      const C = spec.courtyard, W = C.x1 - C.x0, D = 2 * C.z, NX = 2048, NY = Math.round(2048 * D / W);
      const cc = document.createElement('canvas'); cc.width = NX; cc.height = NY; const g = cc.getContext('2d');
      const bc = document.createElement('canvas'); bc.width = NX; bc.height = NY; const b = bc.getContext('2d');
      const sx = NX / W, sz = NY / D, X = x => (x - C.x0) * sx, Z = z => (z + C.z) * sz;
      const stone = { field: 176, light: 214, dark: 98, red: [150, 82, 70] };
      // Field: 0.5 m diagonal granite grid.
      g.fillStyle = '#8a867e'; g.fillRect(0, 0, NX, NY); b.fillStyle = '#3a3a3a'; b.fillRect(0, 0, NX, NY);
      g.save(); b.save();
      for (const ctx of [g, b]) { ctx.translate(NX / 2, NY / 2); ctx.rotate(Math.PI / 4); }
      const cell = .5 * sx, span = Math.hypot(NX, NY) / 2, jt = 2;
      for (let u = -span; u < span; u += cell) for (let v = -span; v < span; v += cell) {
        const t = stone.field + (rand() - .5) * 18; g.fillStyle = `rgb(${t + 2},${t},${t - 6})`; g.fillRect(u + jt / 2, v + jt / 2, cell - jt, cell - jt);
        b.fillStyle = '#b4b4b4'; b.fillRect(u + jt / 2, v + jt / 2, cell - jt, cell - jt);
      }
      g.restore(); b.restore();
      const slabs = (x0, x1, z0, z1, lw, ld, base, tint = [0, 0, 0]) => {
        for (let x = x0, r = 0; x < x1 - 1e-6; x += lw, r++) for (let z = z0 - (r % 2) * ld / 2; z < z1 - 1e-6; z += ld) {
          const a = Math.max(z, z0), e = Math.min(z + ld, z1), t = base + (rand() - .5) * 14;
          g.fillStyle = `rgb(${t + tint[0]},${t + tint[1]},${t + tint[2]})`; g.fillRect(X(x) + 1, Z(a) + 1, Math.min(lw, x1 - x) * sx - 2, (e - a) * sz - 2);
          b.fillStyle = '#c0c0c0'; b.fillRect(X(x) + 1, Z(a) + 1, Math.min(lw, x1 - x) * sx - 2, (e - a) * sz - 2);
        }
      };
      const band = (x0, x1, z0, z1, rgb) => { g.fillStyle = `rgb(${rgb.join(',')})`; g.fillRect(X(x0), Z(z0), (x1 - x0) * sx, (z1 - z0) * sz); b.fillStyle = '#bdbdbd'; b.fillRect(X(x0), Z(z0), (x1 - x0) * sx, (z1 - z0) * sz); };
      // Transverse bands across the field, in dark granite edged with the light stone.
      for (const x of C.bands) { band(x - .45, x + .45, -C.z, C.z, [stone.light, stone.light, stone.light - 8]); band(x - .25, x + .25, -C.z, C.z, [stone.dark, stone.dark, stone.dark - 4]); }
      // Processional way on the axis: light granite in long slabs, red and dark edging.
      slabs(C.x0, C.x1, -C.axis, C.axis, .9, .6, stone.light, [4, 0, -8]);
      for (const s of [-1, 1]) { band(C.x0, C.x1, s * C.axis - (s > 0 ? 0 : .3), s * C.axis + (s > 0 ? .3 : 0), stone.red); band(C.x0, C.x1, s * (C.axis + .3) - (s > 0 ? 0 : .2), s * (C.axis + .3) + (s > 0 ? .2 : 0), [stone.dark, stone.dark, stone.dark]); }
      // Medallion: rings, an eight-point star and a cross, read best from the forecourt and towers.
      const M = C.medallion, mx = X(M.x), mz = Z(0), R = M.r * sx, ring = (r0, r1, rgb) => {
        g.beginPath(); g.ellipse(mx, mz, r1, r1 * sz / sx, 0, 0, 2 * Math.PI); g.ellipse(mx, mz, r0, r0 * sz / sx, 0, 0, 2 * Math.PI, true); g.fillStyle = `rgb(${rgb.join(',')})`; g.fill('evenodd');
      };
      g.beginPath(); g.ellipse(mx, mz, R, R * sz / sx, 0, 0, 2 * Math.PI); g.fillStyle = `rgb(${stone.light},${stone.light - 2},${stone.light - 10})`; g.fill();
      b.beginPath(); b.ellipse(mx, mz, R, R * sz / sx, 0, 0, 2 * Math.PI); b.fillStyle = '#c4c4c4'; b.fill();
      ring(R * .93, R, [stone.dark, stone.dark, stone.dark]); ring(R * .86, R * .9, stone.red); ring(R * .6, R * .63, [stone.dark, stone.dark, stone.dark]);
      const star = (r0, r1, points, rgb, turn = 0) => {
        g.beginPath();
        for (let k = 0; k < points * 2; k++) { const a = turn + k * Math.PI / points, r = k % 2 ? r0 : r1; const u = mx + Math.cos(a) * r, v = mz + Math.sin(a) * r * sz / sx; k ? g.lineTo(u, v) : g.moveTo(u, v); }
        g.closePath(); g.fillStyle = `rgb(${rgb.join(',')})`; g.fill();
      };
      star(R * .2, R * .84, 8, [stone.dark + 20, stone.dark + 20, stone.dark + 14], Math.PI / 8);
      star(R * .18, R * .58, 8, stone.red, 0);
      // Joints radiating through the medallion so it reads as cut stone, not paint.
      g.strokeStyle = 'rgba(60,56,50,.55)'; g.lineWidth = 2;
      for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; g.beginPath(); g.moveTo(mx + Math.cos(a) * R * .2, mz + Math.sin(a) * R * .2 * sz / sx); g.lineTo(mx + Math.cos(a) * R, mz + Math.sin(a) * R * sz / sx); g.stroke(); }
      // Cross in light stone at the centre, its foot toward the church.
      g.fillStyle = `rgb(${stone.light + 14},${stone.light + 12},${stone.light + 2})`;
      const cw = R * .07, cl = R * .3; g.fillRect(mx - cl, mz - cw * sz / sx, cl * 2.2, cw * 2 * sz / sx); g.fillRect(mx - cw, mz - cl * .72 * sz / sx, cw * 2, cl * 1.44 * sz / sx);
      // Border: dark granite kerb band round the designed area.
      const k = C.border;
      for (const [x0, x1, z0, z1] of [[C.x0, C.x1, -C.z, -C.z + k], [C.x0, C.x1, C.z - k, C.z], [C.x0, C.x0 + k, -C.z, C.z], [C.x1 - k * .5, C.x1, -C.z, C.z]]) band(x0, x1, z0, z1, [stone.dark + 10, stone.dark + 10, stone.dark + 6]);
      speckle(g, Math.max(NX, NY), 120000, .12);
      const map = texture(cc, 'Site stone · courtyard design DX-05', true, false), bump = texture(bc, 'Site stone · courtyard joints', false, false);
      const material = new T.MeshStandardMaterial({ name: 'Courtyard · designed granite paving (CONCEPT)', map, bumpMap: bump, bumpScale: .02, roughness: .8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      palettes?.set(material, { color: material.color.clone(), map, bump });
      const plane = new T.Mesh(new T.PlaneGeometry(W, D), material);
      plane.rotation.x = -Math.PI / 2; plane.position.set((C.x0 + C.x1) / 2, C.y, 0);
      plane.name = 'Courtyard designed paving · DX-05 concept';
      plane.receiveShadow = true; plane.castShadow = false; plane.raycast = () => {};
      plane.userData = { status: 'CONCEPT / UNSURVEYED SITE · surface finish only', revision: spec.revision, source: 'Design excellence stage 5; drawings show no courtyard paving design' };
      building.add(plane);
      stats.courtyard = 1;
    }
    window.CHURCH_SITE_STONE.stats = stats;
    if (data) {
      data.siteStone = { revision: spec.revision, status: 'CONCEPT', ...stats, departures: ['DX-05'] };
      data.assumptions?.push('Exterior stone and courtyard, 20 November 2026: coursed rubble finish on the plinth, sawn granite slab paving on the presentation ground, and a designed courtyard in front of the entrance steps (processional way, medallion with star and cross, banded field). Surface finishes only on the unsurveyed site: no levels, falls, sub-base, kerbs, stone selection or slip resistance are designed.');
    }
  }

  window.CHURCH_SITE_STONE = { spec, prepare };
})();
