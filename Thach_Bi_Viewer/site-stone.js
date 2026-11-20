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
    revision: '2026-11-20-site-stone-1',
    status: 'CONCEPT · design excellence stages 4–5 · appearance only',
    plinthTile: 2.4,            // realism.js UV scale of mat.foundation
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
    const pair = (size) => { const a = document.createElement('canvas'), b = document.createElement('canvas'); a.width = a.height = b.width = b.height = size; return [a, b, a.getContext('2d'), b.getContext('2d')]; };
    function speckle(g, n, count, alpha) {
      for (let i = 0; i < count; i++) { const v = rand() > .5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${alpha * rand()})`; g.fillRect(rand() * n, rand() * n, 1 + rand() * 2, 1 + rand() * 2); }
    }
    function replace(material, map, bump, bumpScale, color, roughness) {
      material.map = map; material.bumpMap = bump; material.bumpScale = bumpScale;
      if (color) material.color.set(color);
      if (roughness !== undefined) material.roughness = roughness;
      material.userData.siteStone = spec.revision; material.needsUpdate = true;
      const p = palettes?.get(material);
      if (p) { p.map = map; p.bump = bump; if (color) p.color = material.color.clone(); }
    }

    /* ------------------------------------------------ stage 4: coursed random rubble */
    if (off !== 'off' && off !== 'noplinth') {
      const N = 1024, px = N / spec.plinthTile, [cc, bc, g, b] = pair(N);
      g.fillStyle = '#5d584f'; g.fillRect(0, 0, N, N);           // recessed lime mortar, in shade
      b.fillStyle = '#262626'; b.fillRect(0, 0, N, N);
      // Courses 0.22–0.40 m that add up exactly to the tile height.
      const rows = []; let y = 0;
      while (y < N - .2 * px) { const h = Math.round((.22 + rand() * .18) * px); rows.push([y, Math.min(h, N - y)]); y += h; }
      rows[rows.length - 1][1] += N - y;
      const joint = .022 * px;
      for (const [y0, h] of rows) {
        let x = -rand() * .5 * px; const start = x;
        while (x < N + start) {
          const w = Math.round((.3 + rand() * .45) * px), tone = rand(), warm = rand();
          // Rough rectangle: jittered corners and mid-points, inset by half a joint.
          const j = () => (rand() - .5) * .05 * px, pts = [
            [x + joint + j(), y0 + joint + j()], [x + w / 2 + j(), y0 + joint + j() * .6], [x + w - joint + j(), y0 + joint + j()],
            [x + w - joint + j() * .6, y0 + h / 2 + j()], [x + w - joint + j(), y0 + h - joint + j()], [x + w / 2 + j(), y0 + h - joint + j() * .6],
            [x + joint + j(), y0 + h - joint + j()], [x + joint + j() * .6, y0 + h / 2 + j()]];
          const cx = x + w / 2, cy = y0 + h / 2;
          for (const dx of [-N, 0, N]) {
            const path = (ctx, k = 1) => { ctx.beginPath(); pts.forEach(([u, v], i) => { const X = cx + (u - cx) * k + dx, Y = cy + (v - cy) * k; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); };
            // Granite greys with some warmer stones; never the saturated blue/tan of the old map.
            const v = 150 + tone * 42, r = v + (warm > .7 ? 14 : warm < .2 ? -4 : 4), gg = v + (warm > .7 ? 6 : 0), bb = v - (warm > .7 ? 10 : -2);
            const face = g.createLinearGradient(0, y0, 0, y0 + h);
            face.addColorStop(0, `rgb(${r + 16},${gg + 16},${bb + 14})`); face.addColorStop(.55, `rgb(${r},${gg},${bb})`); face.addColorStop(1, `rgb(${r - 26},${gg - 26},${bb - 24})`);
            g.fillStyle = face; path(g); g.fill();
            g.strokeStyle = 'rgba(40,36,30,.35)'; g.lineWidth = 2; path(g); g.stroke();
            // Pillowed face for the relief: dark rim, raised centre.
            b.fillStyle = '#8a8a8a'; path(b); b.fill();
            b.fillStyle = '#b4b4b4'; path(b, .86); b.fill();
            b.fillStyle = '#c8c8c8'; path(b, .62); b.fill();
          }
          stats.plinthStones++;
          x += w;
        }
      }
      // Weathering: a faint darker wash toward each tile's foot reads as splash and damp at the base.
      const wash = g.createLinearGradient(0, 0, 0, N); wash.addColorStop(0, 'rgba(0,0,0,0)'); wash.addColorStop(1, 'rgba(35,30,22,.08)');
      g.fillStyle = wash; g.fillRect(0, 0, N, N);
      speckle(g, N, 26000, .12); speckle(b, N, 9000, .1);
      replace(mat.foundation, texture(cc, 'Site stone · coursed random rubble', true), texture(bc, 'Site stone · coursed rubble relief', false), .045, '#ffffff', .9);
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
