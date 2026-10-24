/* Stations of the Cross, metres.
   Parish priest's meeting of 25 October 2026 (docs/engineering/parish-meeting-2026-10-25.md),
   point 3: fourteen stations, each between two columns above the window or door of a nave bay,
   with a candle light below (the candles are simulator fittings, design.js, circuit LS).
   One station per nave bay, 2′–3 to 8–9, seven on each side, on the nave face of the inner
   C/G wall. Station I is at the sanctuary end of the side on the left of the drawings and of a
   person facing the altar (grid H, see ENG-027), descending to VII at the entrance; VIII to
   XIV return up grid B. Frames, sizes and the relief are a placeholder for commissioned
   artwork: CONCEPT. Fixing into the plastered wall is not designed. */
(() => {
  const spec = {
    revision: '2026-10-25-stations-1',
    bays: [['2′', '3'], ['3', '4'], ['4', '5'], ['5', '6'], ['6', '7'], ['7', '8'], ['8', '9']],
    face: 7.25, // nave face of the C/G wall
    panel: { half: 0.40, bottom: 5.0, top: 6.05, apex: 6.42, depth: 0.05 },
    plaque: { y: 4.93, half: 0.22, h: 0.13 },
    candles: { dx: 0.32, y: 4.72 },
    firstSide: 1, // grid H
  };
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
  // Station number n (1–14) → bay and side.
  spec.place = (n, A) => {
    const i = n - 1, s = i < 7 ? spec.firstSide : -spec.firstSide;
    const bay = i < 7 ? spec.bays[6 - i] : spec.bays[i - 7];
    return { s, x: (A[bay[0]] + A[bay[1]]) / 2, bay: bay.join('–') };
  };
  window.CHURCH_STATIONS = { spec, prepare, ROMAN };

  function prepare({ THREE: T, building, data }) {
    const A = data.longitudinal;
    // The bundle's small placeholders on the pier faces are superseded.
    const old = [];
    building.traverse(o => { if (/^Proposed Stations of the Cross placements/.test(o.name)) old.push(o); });
    old.forEach(o => o.removeFromParent());
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, place, merge } = K;
    const mat = (name, color, metalness = 0, roughness = .5) => { const m = new T.MeshStandardMaterial({ color, metalness, roughness }); m.name = name; return m; };
    const gold = mat('Stations · gilded frame', '#c7983f', .7, .32), ground = mat('Stations · red lacquer ground', '#7d2c22', 0, .45), relief = mat('Stations · ivory relief', '#efe6d2', 0, .6), dark = mat('Stations · numeral plaque', '#3b2a22', 0, .5);
    const root = new T.Group();
    root.name = 'Stations of the Cross — parish priest 25 Oct 2026 · placeholder artwork';
    root.userData = { status: 'CONCEPT', source: 'Parish priest 25 Oct 2026, point 3', revision: spec.revision };
    building.add(root);
    const bins = new Map();
    const add = (name, material, g, m) => { const k = name + material.uuid; if (!bins.has(k)) bins.set(k, { name, material, parts: [] }); bins.get(k).parts.push([g, m]); };
    const P = spec.panel;
    // Pointed panel outline in local x (along the wall), y (height).
    const outline = grow => {
      const s = new T.Shape(), h = P.half + grow;
      s.moveTo(-h, P.bottom - grow); s.lineTo(h, P.bottom - grow); s.lineTo(h, P.top);
      s.quadraticCurveTo(h, P.top + (P.apex - P.top) * .6, 0, P.apex + grow * 1.6);
      s.quadraticCurveTo(-h, P.top + (P.apex - P.top) * .6, -h, P.top); s.lineTo(-h, P.bottom - grow);
      return s;
    };
    const ext = (shape, d) => new T.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 12 });
    const box = (w, h, d, x, y, z) => [new T.BoxGeometry(w, h, d), TR(x, y, z)];
    // Strokes of a Roman numeral, centred, in local units (height 1).
    const numeral = text => {
      const parts = [], w = .5, gap = .14;
      let x = -(text.length * w + (text.length - 1) * gap) / 2 + w / 2;
      for (const ch of text) {
        if (ch === 'I') parts.push([0, 0, .14, 1, x]);
        if (ch === 'V') { parts.push([.22, -.22, .13, 1.05, x - .12], [-.22, .22, .13, 1.05, x + .12]); }
        if (ch === 'X') { parts.push([.42, 0, .13, 1.1, x], [-.42, 0, .13, 1.1, x]); }
        x += w + gap;
      }
      return { parts, width: text.length * w + (text.length - 1) * gap };
    };
    const stats = { stations: 0 };
    for (let n = 1; n <= 14; n++) {
      const { s, x } = spec.place(n, A);
      // Local frame: x along the wall, y up, z out of the wall into the nave.
      const frame = place(RY(s > 0 ? Math.PI : 0), TR(x, 0, s * spec.face));
      const at = m => m.clone().premultiply(frame);
      add('Station of the Cross gilded frame', gold, ext(outline(.07), .035), at(TR(0, 0, 0)));
      add('Station of the Cross lacquered ground', ground, ext(outline(0), .02), at(TR(0, 0, .035)));
      // Placeholder relief: the cross with a small mound, for the commissioned artwork.
      const cy = (P.bottom + P.top) / 2 + .05;
      for (const [g, m] of [box(.07, .62, .03, 0, cy, .07), box(.36, .07, .03, 0, cy + .14, .07), box(.30, .06, .03, 0, P.bottom + .12, .07)]) add('Station of the Cross relief placeholder', relief, g, at(m));
      for (const [g, m] of [box(.035, .2, .03, 0, P.apex + .2, .03), box(.13, .035, .03, 0, P.apex + .24, .03)]) add('Station of the Cross finial cross', gold, g, at(m));
      // Numeral plaque.
      const Q = spec.plaque, text = ROMAN[n - 1], num = numeral(text), sc = Q.h * .62, half = Math.max(Q.half, num.width * sc / 2 + .06);
      add('Station of the Cross numeral plaque', dark, new T.BoxGeometry(half * 2, Q.h, .02), at(TR(0, Q.y, .03)));
      for (const [dx0, dx1, w, h, px] of num.parts) {
        const g = new T.BoxGeometry(w * sc, h * sc, .012), m = new T.Matrix4().makeRotationZ(Math.atan2(dx0 - dx1, 1) * .9);
        add('Station of the Cross numeral stroke', gold, g, at(m.premultiply(TR(px * sc, Q.y, .045))));
      }
      stats.stations++;
    }
    for (const { name, material, parts } of bins.values()) {
      const g = merge(parts), pos = g.attributes.position, n = pos.count, index = [];
      // Weld identical corners so display batches keep their memory saving.
      const seen = new Map(), P2 = [], N2 = [], U2 = [], nor = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < n; i++) {
        const key = [pos.getX(i), pos.getY(i), pos.getZ(i), nor.getX(i), nor.getY(i), nor.getZ(i)].map(v => Math.round(v * 1e5)).join();
        let k = seen.get(key);
        if (k === undefined) { k = P2.length / 3; seen.set(key, k); P2.push(pos.getX(i), pos.getY(i), pos.getZ(i)); N2.push(nor.getX(i), nor.getY(i), nor.getZ(i)); U2.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); }
        index.push(k);
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(P2, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(N2, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(U2, 2));
      geo.setIndex(index); g.dispose();
      const mesh = new T.Mesh(geo, material);
      mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = true;
      mesh.userData = { status: 'CONCEPT', source: 'Parish priest 25 Oct 2026, point 3' };
      root.add(mesh);
    }
    root.userData.stats = stats;
    window.CHURCH_STATIONS.stats = stats;
    data?.assumptions?.push('Fourteen Stations of the Cross, one per nave bay between the columns above the window or door, with a candle light pair below (parish priest, 25 October 2026). Frames and relief are placeholders for commissioned artwork.');
  }
})();
