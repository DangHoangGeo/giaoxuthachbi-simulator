/* Thạch Bi simulator · catalogue of lights, fans, loudspeakers, microphones
 * and decorations. Each entry carries representative product data (lumens,
 * watts, beam, airflow, sensitivity, coverage) and a procedural model built
 * with a small geometry kit. Product data are typical category values for
 * planning, not a specification of a particular brand.
 *
 * Local model frame: +Y up, +X forward (away from the wall / aim direction).
 * Optional named groups: 'head' (aimable), 'rotor' (spinning), 'osc'
 * (oscillating fan head), 'stem' (unit-height pendant rod scaled to anchor).
 */
(function () {
  'use strict';
  const PI = Math.PI;

  const MATERIALS = {
    brass: { color: '#c59a4a', metalness: 0.85, roughness: 0.32 },
    agedBrass: { color: '#a07a3c', metalness: 0.8, roughness: 0.42 },
    bronze: { color: '#4f3f2e', metalness: 0.55, roughness: 0.48 },
    black: { color: '#1e1e20', metalness: 0.35, roughness: 0.5 },
    white: { color: '#efede6', metalness: 0.08, roughness: 0.45 },
    steel: { color: '#9aa0a6', metalness: 0.7, roughness: 0.35 },
    aluminium: { color: '#c9ccd0', metalness: 0.75, roughness: 0.3 },
    darkWood: { color: '#5a3a22', roughness: 0.55 },
    wood: { color: '#8a6040', roughness: 0.5 },
    ivory: { color: '#f3ead6', roughness: 0.62 },
    candle: { color: '#f4ecdc', roughness: 0.7 },
    grille: { color: '#2a2b2e', roughness: 0.88, metalness: 0.15 },
    grilleWhite: { color: '#dddcd5', roughness: 0.8 },
    marble: { color: '#efeae0', roughness: 0.32 },
    stone: { color: '#d8d0c0', roughness: 0.72 },
    terracotta: { color: '#b0603a', roughness: 0.82 },
    robeWhite: { color: '#f5f2ea', roughness: 0.6 },
    robeBlue: { color: '#3d6db0', roughness: 0.55 },
    robeBrown: { color: '#76583a', roughness: 0.65 },
    robeOchre: { color: '#b48946', roughness: 0.6 },
    robeRed: { color: '#a2262b', roughness: 0.55 },
    robeGreen: { color: '#5d7851', roughness: 0.6 },
    skin: { color: '#e6c2a2', roughness: 0.52 },
    hair: { color: '#4a3423', roughness: 0.8 },
    gold: { color: '#d6a842', metalness: 0.9, roughness: 0.25 },
    leaf: { color: '#3d6834', roughness: 0.8 },
    leafLight: { color: '#5d8a45', roughness: 0.8 },
    flowerWhite: { color: '#fbf8f0', roughness: 0.7 },
    flowerCream: { color: '#f5e7c4', roughness: 0.7 },
    flowerRed: { color: '#b1202b', roughness: 0.6 },
    flowerPink: { color: '#e6a3b2', roughness: 0.7 },
    rock: { color: '#8b8276', roughness: 0.95 },
    straw: { color: '#cfae5c', roughness: 0.95 },
    fabricRed: { color: '#9e1b22', roughness: 0.88 },
    fabricGold: { color: '#cfa244', roughness: 0.7, metalness: 0.2 },
    fabricWhite: { color: '#f7f3e8', roughness: 0.88 },
    fabricPurple: { color: '#5a2b6e', roughness: 0.88 },
    fabricGreen: { color: '#2f6a3a', roughness: 0.88 },
    fabricBlue: { color: '#2c4f8f', roughness: 0.88 },
    carpetRed: { color: '#8c1c23', roughness: 0.97 },
    rope: { color: '#3a2f25', roughness: 0.9 },
    pine: { color: '#2f5a33', roughness: 0.9 },
    lanternFrame: { color: '#3b2a1c', metalness: 0.2, roughness: 0.6 },
    statueIvory: { color: '#ece3cf', roughness: 0.58 },
    statueIvoryShade: { color: '#d9cdb4', roughness: 0.62 },
    statueEye: { color: '#2e211a', roughness: 0.35 },
    statueLip: { color: '#b56a62', roughness: 0.5 },
    socketPlate: { color: '#f1eee6', roughness: 0.42 },
    socketDark: { color: '#33363a', roughness: 0.6 },
    enclosureGrey: { color: '#8f959b', metalness: 0.25, roughness: 0.55 },
    socketBlue: { color: '#2456a6', roughness: 0.5 },
    saintPeterArt: { color: '#ffffff', roughness: 0.9, textureUrl: 'references/10-wing-saints/saint-peter-concept-v1.png' },
    saintPaulArt: { color: '#ffffff', roughness: 0.9, textureUrl: 'references/10-wing-saints/saint-paul-concept-v1.png' }
  };

  /* ------------------------------------------------------------ geometry kit */
  function makeKit(T) {
    const geoCache = new Map();
    const cached = (key, make) => {
      const geo = geoCache.get(key) || make();
      geoCache.delete(key); geoCache.set(key, geo);
      // These source primitives are copied into prototype buffers, never drawn.
      // Eviction cannot invalidate live fixtures or a kit still holding a part.
      if (geoCache.size > 256) {
        const oldest = geoCache.keys().next().value;
        geoCache.get(oldest).dispose(); geoCache.delete(oldest);
      }
      return geo;
    };
    const euler = new T.Euler(), quat = new T.Quaternion(), mat4 = new T.Matrix4();
    const vScale = new T.Vector3(), vPos = new T.Vector3();
    function matrixOf(o = {}) {
      vPos.set(...(o.p || [0, 0, 0]));
      if (o.q) quat.copy(o.q); else { euler.set(...(o.r || [0, 0, 0]), o.order || 'XYZ'); quat.setFromEuler(euler); }
      const s = o.s === undefined ? 1 : o.s;
      vScale.set(...(Array.isArray(s) ? s : [s, s, s]));
      return mat4.compose(vPos, quat, vScale).clone();
    }
    const factory = function Kit() {
      const parts = { root: [], head: [], rotor: [], osc: [], stem: [] };
      let target = 'root';
      const kit = {
        T, parts, pivots: { head: [0, 0, 0], rotor: [0, 0, 0], osc: [0, 0, 0] }, rotorAxis: 'y',
        in(group, fn) { const prev = target; target = group; fn(); target = prev; return kit; },
        add(geo, mat, o) { parts[target].push({ geo, mat, matrix: matrixOf(o) }); return kit; },
        box(w, h, d, mat, o) { return kit.add(cached(`b${w}|${h}|${d}`, () => new T.BoxGeometry(w, h, d)), mat, o); },
        cyl(rt, rb, h, mat, o, seg = 14, open = false) {
          return kit.add(cached(`c${rt}|${rb}|${h}|${seg}|${open}`, () => new T.CylinderGeometry(rt, rb, h, seg, 1, open)), mat, o);
        },
        sph(r, mat, o, ws = 14, hs = 10) { return kit.add(cached(`s${r}|${ws}|${hs}`, () => new T.SphereGeometry(r, ws, hs)), mat, o); },
        tor(R, r, mat, o, arc = 2 * PI, rs = 6, ts = 28) {
          return kit.add(cached(`t${R}|${r}|${arc}|${rs}|${ts}`, () => new T.TorusGeometry(R, r, rs, ts, arc)), mat, o);
        },
        cone(r, h, mat, o, seg = 14) { return kit.add(cached(`k${r}|${h}|${seg}`, () => new T.ConeGeometry(r, h, seg)), mat, o); },
        ico(r, mat, o, detail = 0) { return kit.add(cached(`i${r}|${detail}`, () => new T.IcosahedronGeometry(r, detail)), mat, o); },
        lathe(points, mat, o, seg = 20, phiStart = 0, phiLength = 2 * PI) {
          const key = 'l' + points.map(p => p.join(',')).join(';') + `|${seg}|${phiStart}|${phiLength}`;
          return kit.add(cached(key, () => new T.LatheGeometry(points.map(p => new T.Vector2(p[0], p[1])), seg, phiStart, phiLength)), mat, o);
        },
        tube(points, r, mat, o, seg = 20, rs = 6) {
          const key = 'u' + points.map(p => p.map(v => v.toFixed(3)).join(',')).join(';') + `|${r}|${seg}|${rs}`;
          return kit.add(cached(key, () => new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), seg, r, rs, false)), mat, o);
        },
        shape(pts, depth, mat, o, key) {
          return kit.add(cached('e' + (key || pts.join(';')) + depth, () => {
            const s = new T.Shape(); s.moveTo(...pts[0]); for (const p of pts.slice(1)) s.lineTo(...p); s.closePath();
            const g = depth > 0 ? new T.ExtrudeGeometry(s, { depth, bevelEnabled: false }) : new T.ShapeGeometry(s);
            if (depth > 0) g.translate(0, 0, -depth / 2);
            return g;
          }), mat, o);
        },
        plane(w, h, mat, o) { return kit.add(cached(`p${w}|${h}`, () => new T.PlaneGeometry(w, h)), mat, o); },
        rod(a, b, r, mat, seg = 8) {
          const A = new T.Vector3(...a), B = new T.Vector3(...b), d = B.clone().sub(A), len = d.length();
          if (len < 1e-5) return kit;
          const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
          return kit.cyl(r, r, 1, mat, { p: A.add(B).multiplyScalar(0.5).toArray(), q, s: [1, len, 1] }, seg);
        },
        glowPoint(p, size) { (kit.glows ||= []).push({ p, size, group: target }); return kit; }
      };
      return kit;
    };
    factory.cacheSize = () => geoCache.size;
    return factory;
  }

  /* --------------------------------------------------------------- builders */
  const deg = d => d * PI / 180;
  const ring = (n, fn) => { for (let i = 0; i < n; i++) fn(i, i * 2 * PI / n); };

  function candleLamp(k, x, y, z, s = 1) {
    k.cyl(0.07 * s, 0.045 * s, 0.035 * s, 'brass', { p: [x, y, z] }, 12);
    k.cyl(0.024 * s, 0.024 * s, 0.17 * s, 'candle', { p: [x, y + 0.1 * s, z] }, 10);
    k.sph(0.026 * s, 'glow', { p: [x, y + 0.215 * s, z], s: [1, 1.7, 1] }, 10, 8);
    k.glowPoint([x, y + 0.215 * s, z], 0.16 * s);
  }
  function buildChandelier(k, lamps = 8, R = 0.95) {
    k.cyl(0.05, 0.07, 0.12, 'brass', { p: [0, -0.06, 0] }, 14);
    k.lathe([[0.001, -0.1], [0.04, -0.12], [0.06, -0.25], [0.035, -0.35], [0.09, -0.5], [0.17, -0.62], [0.15, -0.71], [0.05, -0.79], [0.085, -0.9], [0.03, -1.0], [0.001, -1.08]], 'brass', {}, 18);
    k.sph(0.05, 'brass', { p: [0, -1.1, 0] }, 10, 8);
    k.tor(R * 0.62, 0.011, 'brass', { p: [0, -0.78, 0], r: [PI / 2, 0, 0] }, 2 * PI, 5, 40);
    ring(lamps, (i, a) => {
      const c = Math.cos(a), s = Math.sin(a);
      const pts = [[0.13, -0.64], [lamps === 6 ? 0.36 * R / 0.95 : 0.36, -0.79], [lamps === 6 ? 0.66 * R / 0.95 : 0.66, -0.79], [R - 0.07, -0.63], [R, -0.46]];
      k.tube(pts.map(([r, y]) => [c * r, y, s * r]), 0.016, 'brass', {}, 18, 6);
      candleLamp(k, c * R, -0.45, s * R);
    });
  }
  function buildSconce(k) {
    k.box(0.03, 0.36, 0.13, 'brass', { p: [0.015, 0.02, 0] });
    k.sph(0.035, 'brass', { p: [0.04, 0.22, 0] }, 10, 8);
    k.sph(0.03, 'brass', { p: [0.04, -0.18, 0] }, 10, 8);
    for (const side of [-1, 1]) {
      k.tube([[0.03, -0.06, 0], [0.12, -0.08, side * 0.05], [0.21, -0.03, side * 0.13], [0.24, 0.05, side * 0.16]], 0.013, 'brass', {}, 14, 6);
      candleLamp(k, 0.24, 0.06, side * 0.16, 0.95);
    }
  }
  function buildProjector(k, r = 0.075, len = 0.24, finish = 'black', yoke = true, mountUp = false) {
    const sign = mountUp ? 1 : -1;
    k.box(0.14, 0.022, 0.14, finish, { p: [0, sign * 0.011, 0] });
    if (yoke) {
      k.box(0.02, 0.13, 0.03, finish, { p: [0, sign * 0.075, r + 0.03] });
      k.box(0.02, 0.13, 0.03, finish, { p: [0, sign * 0.075, -r - 0.03] });
      k.box(0.03, 0.02, 2 * r + 0.09, finish, { p: [0, sign * 0.022, 0] });
    }
    k.pivots.head = [0, sign * 0.14, 0];
    k.in('head', () => {
      k.cyl(r, r, len, finish, { p: [-0.02, 0, 0], r: [0, 0, -PI / 2] }, 18);
      for (let i = 0; i < 5; i++) k.cyl(r + 0.008, r + 0.008, 0.008, finish, { p: [-0.11 + i * 0.03, 0, 0], r: [0, 0, -PI / 2] }, 18);
      k.cyl(r + 0.004, r * 0.92, 0.09, finish, { p: [len / 2 + 0.025, 0, 0], r: [0, 0, -PI / 2] }, 18, true);
      k.cyl(r * 0.78, r * 0.78, 0.006, 'glow', { p: [len / 2 - 0.012, 0, 0], r: [0, 0, -PI / 2] }, 18);
      k.glowPoint([len / 2 + 0.05, 0, 0], r * 4);
    });
  }
  function buildUplight(k) {
    k.box(0.32, 0.03, 0.16, 'bronze', { p: [0, 0.015, 0] });
    k.pivots.head = [0, 0.09, 0];
    k.in('head', () => {
      k.box(0.12, 0.22, 0.3, 'bronze', { p: [-0.03, 0, 0] });
      k.box(0.006, 0.18, 0.26, 'glow', { p: [0.034, 0, 0] });
      k.glowPoint([0.06, 0, 0], 0.4);
    });
  }
  function buildHighbay(k) {
    k.cyl(0.03, 0.03, 0.2, 'white', { p: [0, -0.1, 0] }, 10);
    k.pivots.head = [0, -0.24, 0];
    k.in('head', () => {
      k.cyl(0.24, 0.24, 0.09, 'aluminium', { p: [-0.02, 0, 0], r: [0, 0, -PI / 2] }, 28);
      for (let i = 0; i < 10; i++) k.box(0.07, 0.012, 0.44, 'aluminium', { p: [-0.09, 0, 0], r: [i * PI / 10, 0, 0] });
      k.cyl(0.2, 0.2, 0.006, 'glow', { p: [0.03, 0, 0], r: [0, 0, -PI / 2] }, 28);
      k.glowPoint([0.06, 0, 0], 0.9);
    });
  }
  function buildPendantLantern(k, h = 0.55, r = 0.2) {
    k.cone(r * 0.9, 0.14, 'lanternFrame', { p: [0, -0.12, 0] }, 6);
    k.cyl(0.03, 0.03, 0.06, 'lanternFrame', { p: [0, -0.02, 0] }, 8);
    k.cyl(r * 0.7, r * 0.7, h * 0.8, 'glow', { p: [0, -0.2 - h / 2, 0] }, 6);
    ring(6, (i, a) => k.box(0.02, h, 0.02, 'lanternFrame', { p: [Math.cos(a) * r * 0.78, -0.2 - h / 2, Math.sin(a) * r * 0.78] }));
    k.cyl(r * 0.85, r * 0.85, 0.03, 'lanternFrame', { p: [0, -0.2 - h, 0] }, 6);
    k.sph(0.04, 'lanternFrame', { p: [0, -0.26 - h, 0] }, 8, 6);
    k.glowPoint([0, -0.2 - h / 2, 0], 0.7);
  }
  function buildWallLantern(k) {
    k.box(0.03, 0.22, 0.1, 'lanternFrame', { p: [0.015, 0, 0] });
    k.tube([[0.02, 0, 0], [0.18, 0.05, 0], [0.3, 0.02, 0]], 0.012, 'lanternFrame', {}, 10, 5);
    k.cone(0.12, 0.09, 'lanternFrame', { p: [0.3, -0.04, 0] }, 6);
    k.cyl(0.08, 0.08, 0.22, 'glow', { p: [0.3, -0.2, 0] }, 6);
    ring(6, (i, a) => k.box(0.012, 0.24, 0.012, 'lanternFrame', { p: [0.3 + Math.cos(a) * 0.09, -0.2, Math.sin(a) * 0.09] }));
    k.cyl(0.1, 0.1, 0.02, 'lanternFrame', { p: [0.3, -0.32, 0] }, 6);
    k.glowPoint([0.3, -0.2, 0], 0.5);
  }
  function buildFlood(k) {
    k.cyl(0.02, 0.02, 0.35, 'black', { p: [0, 0.1, 0] }, 8);
    k.box(0.16, 0.03, 0.16, 'black', { p: [0, 0.015, 0] });
    k.pivots.head = [0, 0.32, 0];
    k.in('head', () => {
      k.box(0.12, 0.28, 0.34, 'black', { p: [-0.03, 0, 0] });
      for (let i = 0; i < 6; i++) k.box(0.05, 0.25, 0.008, 'black', { p: [-0.11, 0, -0.14 + i * 0.056] });
      k.box(0.006, 0.24, 0.3, 'glow', { p: [0.034, 0, 0] });
      k.glowPoint([0.06, 0, 0], 0.7);
    });
  }
  function buildCorniceFlood(k, { params }) {
    buildFlood(k);
    const reach = params.outreach ?? 0.5;
    // The base stays on the ledge; the head clears the projecting masonry.
    k.box(reach, 0.05, 0.08, 'black', { p: [reach / 2, 0.25, 0] });
    k.pivots.head = [reach, 0.32, 0];
  }
  function buildBollard(k) {
    k.cyl(0.09, 0.1, 0.7, 'bronze', { p: [0, 0.35, 0] }, 16);
    k.cyl(0.085, 0.085, 0.12, 'glow', { p: [0, 0.76, 0] }, 16);
    k.cyl(0.11, 0.09, 0.06, 'bronze', { p: [0, 0.85, 0] }, 16);
    k.glowPoint([0, 0.76, 0], 0.4);
  }
  function buildExitSign(k) {
    k.box(0.05, 0.17, 0.38, 'white', { p: [0.025, 0, 0] });
    k.box(0.006, 0.13, 0.33, 'glow', { p: [0.052, 0, 0] });
    k.glowPoint([0.07, 0, 0], 0.4);
  }

  function fanBlades(k, n, rIn, rOut, width, mat, pitch = deg(12), thick = 0.012) {
    k.in('rotor', () => {
      k.cyl(0.07, 0.07, 0.05, 'black', {}, 16);
      ring(n, (i, a) => {
        const mid = (rIn + rOut) / 2, len = rOut - rIn;
        const q = new k.T.Quaternion().setFromEuler(new k.T.Euler(pitch, -a, 0, 'YXZ'));
        k.box(len, thick, width, mat, { p: [Math.cos(a) * mid, -0.01, Math.sin(a) * mid], q });
        k.box(0.16, 0.012, 0.03, 'black', { p: [Math.cos(a) * (rIn - 0.03), 0.005, Math.sin(a) * (rIn - 0.03)], r: [0, -a, 0] });
      });
    });
  }
  function buildCeilingFan(k) {
    k.cyl(0.075, 0.08, 0.05, 'darkWood', { p: [0, -0.02, 0] }, 14);
    k.lathe([[0.04, -0.05], [0.11, -0.08], [0.13, -0.14], [0.12, -0.2], [0.06, -0.24], [0.001, -0.25]], 'bronze', {}, 22);
    k.pivots.rotor = [0, -0.17, 0];
    fanBlades(k, 5, 0.17, 0.71, 0.13, 'darkWood');
  }
  function buildHVLS(k) {
    k.box(0.36, 0.3, 0.3, 'steel', { p: [0, -0.2, 0] });
    k.cyl(0.04, 0.04, 0.3, 'steel', { p: [0, -0.02, 0] }, 10);
    k.pivots.rotor = [0, -0.42, 0];
    k.in('rotor', () => {
      k.cyl(0.2, 0.2, 0.06, 'steel', {}, 20);
      ring(6, (i, a) => {
        const q = new k.T.Quaternion().setFromEuler(new k.T.Euler(deg(8), -a, 0, 'YXZ'));
        k.box(1.32, 0.022, 0.18, 'aluminium', { p: [Math.cos(a) * 0.86, 0, Math.sin(a) * 0.86], q });
        k.box(0.05, 0.12, 0.2, 'aluminium', { p: [Math.cos(a) * 1.5, 0.04, Math.sin(a) * 1.5], r: [0, -a, 0] });
      });
    });
  }
  function fanHead(k, guardR = 0.24) {
    k.in('head', () => {
      k.cyl(0.08, 0.075, 0.2, 'white', { p: [-0.08, 0, 0], r: [0, 0, -PI / 2] }, 16);
      k.sph(0.075, 'white', { p: [-0.18, 0, 0] }, 12, 8);
      for (const x of [0.04, 0.17]) k.tor(guardR, 0.005, 'white', { p: [x, 0, 0], r: [0, PI / 2, 0] }, 2 * PI, 4, 32);
      ring(12, (i, a) => k.tube([[0.04, Math.cos(a) * guardR, Math.sin(a) * guardR], [0.13, Math.cos(a) * guardR * 0.6, Math.sin(a) * guardR * 0.6], [0.17, 0, 0]], 0.003, 'white', {}, 6, 3));
      ring(12, (i, a) => k.rod([0.04, Math.cos(a) * guardR, Math.sin(a) * guardR], [-0.02, Math.cos(a) * guardR * 0.4, Math.sin(a) * guardR * 0.4], 0.003, 'white', 4));
      k.sph(0.035, 'white', { p: [0.17, 0, 0] }, 10, 8);
    });
    k.rotorAxis = 'x';
    k.pivots.rotor = [0.1, 0, 0];
    k.in('rotor', () => {
      k.cyl(0.04, 0.04, 0.05, 'white', { r: [0, 0, -PI / 2] }, 12);
      ring(3, (i, a) => {
        const q = new k.T.Quaternion().setFromEuler(new k.T.Euler(a, 0, deg(20), 'XYZ'));
        const off = new k.T.Vector3(0, 0.12, 0).applyEuler(new k.T.Euler(a, 0, 0));
        k.box(0.012, 0.19, 0.12, 'grilleWhite', { p: off.toArray(), q });
      });
    });
  }
  function buildWallFan(k, context, extraOutreach = 0) {
    k.box(0.04, 0.2, 0.08, 'white', { p: [0.02, 0, 0] });
    k.box(0.12 + extraOutreach, 0.04, 0.05, 'white', { p: [0.08 + extraOutreach / 2, -0.04, 0] });
    k.pivots.osc = [0.14 + extraOutreach, -0.04, 0];
    k.pivots.head = [0.06, 0.04, 0];
    fanHead(k);
  }
  // Large wall-mounted circulator (≈90 cm): steel bracket, deep guard, 5 blades.
  function buildLargeWallFan(k) {
    const R = 0.47;
    k.box(0.06, 0.5, 0.16, 'steel', { p: [0.03, 0, 0] });
    k.box(0.32, 0.06, 0.08, 'steel', { p: [0.2, -0.12, 0] });
    k.pivots.osc = [0.36, -0.12, 0];
    k.pivots.head = [0.1, 0.12, 0];
    k.in('head', () => {
      k.cyl(0.15, 0.14, 0.26, 'steel', { p: [-0.1, 0, 0], r: [0, 0, -PI / 2] }, 18);
      for (const x of [0.06, 0.3]) k.tor(R, 0.009, 'steel', { p: [x, 0, 0], r: [0, PI / 2, 0] }, 2 * PI, 4, 40);
      ring(18, (i, a) => k.tube([[0.06, Math.cos(a) * R, Math.sin(a) * R], [0.22, Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6], [0.3, 0, 0]], 0.004, 'steel', {}, 6, 3));
      ring(18, (i, a) => k.rod([0.06, Math.cos(a) * R, Math.sin(a) * R], [-0.02, Math.cos(a) * R * 0.35, Math.sin(a) * R * 0.35], 0.004, 'steel', 4));
    });
    k.rotorAxis = 'x';
    k.pivots.rotor = [0.18, 0, 0];
    k.in('rotor', () => {
      k.cyl(0.07, 0.07, 0.08, 'steel', { r: [0, 0, -PI / 2] }, 14);
      ring(5, (i, a) => {
        const q = new k.T.Quaternion().setFromEuler(new k.T.Euler(a, 0, deg(22), 'XYZ'));
        const off = new k.T.Vector3(0, 0.24, 0).applyEuler(new k.T.Euler(a, 0, 0));
        k.box(0.016, 0.38, 0.2, 'steel', { p: off.toArray(), q });
      });
    });
  }
  // Wall exhaust (ventilation) fan, 50 cm, with weather louvres outside.
  function buildExhaustFan(k) {
    k.box(0.08, 0.62, 0.62, 'white', { p: [0.04, 0, 0] });
    k.box(0.02, 0.54, 0.54, 'grilleWhite', { p: [0.085, 0, 0] });
    for (let i = -2; i <= 2; i++) k.box(0.025, 0.012, 0.54, 'white', { p: [0.1, i * 0.1, 0] });
    k.rotorAxis = 'x';
    k.pivots.rotor = [0.05, 0, 0];
    k.in('rotor', () => {
      k.cyl(0.05, 0.05, 0.04, 'white', { r: [0, 0, -PI / 2] }, 12);
      ring(5, (i, a) => {
        const q = new k.T.Quaternion().setFromEuler(new k.T.Euler(a, 0, deg(25), 'XYZ'));
        const off = new k.T.Vector3(0, 0.13, 0).applyEuler(new k.T.Euler(a, 0, 0));
        k.box(0.01, 0.2, 0.12, 'grilleWhite', { p: off.toArray(), q });
      });
    });
  }
  function buildPedestalFan(k) {
    k.cyl(0.24, 0.27, 0.05, 'white', { p: [0, 0.025, 0] }, 24);
    k.cyl(0.018, 0.022, 1.12, 'white', { p: [0, 0.6, 0] }, 10);
    k.pivots.osc = [0, 1.18, 0];
    k.pivots.head = [0, 0.04, 0];
    fanHead(k);
  }

  function buildColumnSpeaker(k, h = 1.0, w = 0.09, d = 0.11, finish = 'white') {
    k.box(0.06, 0.12, 0.05, finish, { p: [0.03, 0, 0] });
    k.pivots.head = [0.09, 0, 0];
    k.in('head', () => {
      k.box(d, h, w, finish, { p: [d / 2 - 0.02, 0, 0] });
      k.box(0.006, h - 0.03, w - 0.012, finish === 'white' ? 'grilleWhite' : 'grille', { p: [d - 0.017, 0, 0] });
    });
  }
  function buildPointSpeaker(k) {
    k.box(0.04, 0.16, 0.12, 'black', { p: [0.02, 0, 0] });
    k.box(0.12, 0.03, 0.03, 'black', { p: [0.08, 0, 0] });
    k.pivots.head = [0.18, 0, 0];
    k.in('head', () => {
      k.box(0.26, 0.42, 0.25, 'black', { p: [0.08, 0, 0] });
      k.box(0.008, 0.38, 0.22, 'grille', { p: [0.214, 0, 0] });
    });
  }
  function buildPendantSpeaker(k) {
    k.pivots.head = [0, -0.05, 0];
    k.in('head', () => {
      k.cyl(0.13, 0.13, 0.36, 'white', { p: [-0.2, 0, 0], r: [0, 0, -PI / 2] }, 22);
      k.cyl(0.12, 0.12, 0.008, 'grilleWhite', { p: [-0.017, 0, 0], r: [0, 0, -PI / 2] }, 22);
    });
  }
  function buildHorn(k) {
    k.box(0.04, 0.12, 0.12, 'steel', { p: [0.02, 0, 0] });
    k.pivots.head = [0.1, 0, 0];
    k.in('head', () => {
      k.cyl(0.06, 0.06, 0.14, 'steel', { p: [-0.02, 0, 0], r: [0, 0, -PI / 2] }, 14);
      k.lathe([[0.05, 0], [0.07, 0.08], [0.12, 0.18], [0.2, 0.26], [0.2, 0.27]], 'white', { p: [0.05, 0, 0], r: [0, 0, -PI / 2] }, 20);
    });
  }
  function buildWedge(k) {
    k.pivots.head = [0, 0, 0];
    k.in('head', () => {
      k.shape([[-0.22, 0], [0.22, 0], [0.22, 0.12], [-0.16, 0.36], [-0.22, 0.36]], 0.5, 'black', {}, 'wedge');
      k.box(0.43, 0.006, 0.44, 'grille', { p: [0.032, 0.244, 0], r: [0, 0, -Math.atan2(0.24, 0.38)] });
    });
  }
  function buildMic(k) {
    k.cyl(0.05, 0.06, 0.03, 'black', { p: [0, 0.015, 0] }, 14);
    k.tube([[0, 0.02, 0], [0.02, 0.2, 0], [0.12, 0.33, 0], [0.22, 0.36, 0]], 0.006, 'black', {}, 20, 5);
    k.cyl(0.013, 0.011, 0.07, 'black', { p: [0.25, 0.36, 0], r: [0, 0, -PI / 2] }, 10);
    k.sph(0.014, 'grille', { p: [0.29, 0.36, 0] }, 8, 6);
  }

  /* Decorations */
  function pedestal(k, h = 1.0, w = 0.5) {
    k.box(w + 0.1, 0.1, w + 0.1, 'marble', { p: [0, 0.05, 0] });
    k.box(w, h - 0.18, w, 'marble', { p: [0, 0.1 + (h - 0.18) / 2, 0] });
    k.box(w + 0.08, 0.04, w + 0.08, 'stone', { p: [0, h - 0.06, 0] });
    k.box(w + 0.12, 0.05, w + 0.12, 'marble', { p: [0, h - 0.025, 0] });
  }
  /* ------------------------------------------------------------ sculpture
   * Statue figures: a lofted body with drapery folds, a modelled head and face,
   * mantle, veil or hair, sleeves and hands. Local frame: +X is the front, +Y
   * up; one unit is the height of the figure. These generated shapes read as
   * carved statues at viewing distance. They are not scans, they define no real
   * sculpture, and the artist's work will differ. */
  const SCULPT = (() => {
    const TAU = 2 * PI, sat = v => Math.max(0, Math.min(1, v));
    const smooth = (a, b, v) => { const t = sat((v - a) / (b - a)); return t * t * (3 - 2 * t); };
    const bell = (v, c, w) => Math.exp(-(((v - c) / w) ** 2));
    const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
    const store = new Map(), memo = (key, make) => { if (!store.has(key)) store.set(key, make()); return store.get(key); };
    // Rings of equal point count become one smooth closed surface.
    function surface(T, rings, twoSided = false) {
      const n = rings[0].length, pos = [], idx = [];
      for (const ring of rings) for (const p of ring) pos.push(p[0], p[1], p[2]);
      for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < n; j++) {
        const a = i * n + j, b = i * n + (j + 1) % n;
        idx.push(a, a + n, b, b, a + n, b + n);
      }
      for (const [ring, flip] of [[0, true], [rings.length - 1, false]]) {
        const c = pos.length / 3, sum = [0, 0, 0];
        for (const p of rings[ring]) for (let k = 0; k < 3; k++) sum[k] += p[k] / n;
        pos.push(...sum);
        for (let j = 0; j < n; j++) { const a = ring * n + j, b = ring * n + (j + 1) % n; flip ? idx.push(c, a, b) : idx.push(c, b, a); }
      }
      // Face outward whatever direction the rings were given in.
      let volume = 0;
      for (let i = 0; i < idx.length; i += 3) {
        const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]].map(v => pos.slice(v * 3, v * 3 + 3));
        volume += a[0] * (b[1] * c[2] - b[2] * c[1]) + a[1] * (b[2] * c[0] - b[0] * c[2]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
      }
      if (volume < 0) for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
      if (twoSided) { const count = pos.length / 3, m = idx.length; pos.push(...pos.slice()); for (let i = 0; i < m; i += 3) idx.push(idx[i] + count, idx[i + 2] + count, idx[i + 1] + count); }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    // Body sections: height, half depth (front to back), half width, forward shift.
    const BODY = [[0, 0.118, 0.152, 0], [0.025, 0.116, 0.149, 0], [0.13, 0.104, 0.134, 0.002], [0.28, 0.092, 0.118, 0.006], [0.42, 0.087, 0.112, 0.004],
      [0.52, 0.086, 0.114, 0], [0.585, 0.074, 0.098, 0.002], [0.66, 0.08, 0.108, 0.008], [0.73, 0.086, 0.118, 0.01], [0.785, 0.079, 0.124, 0.004],
      [0.815, 0.064, 0.118, 0], [0.834, 0.05, 0.08, -0.002], [0.848, 0.038, 0.046, -0.004], [0.876, 0.031, 0.033, -0.002]];
    function section(y) {
      let i = 0; while (i < BODY.length - 2 && y > BODY[i + 1][0]) i++;
      const a = BODY[i], b = BODY[i + 1], t = smooth(a[0], b[0], y);
      return [1, 2, 3].map(k => a[k] + (b[k] - a[k]) * t);
    }
    // Long folds with rounded ridges and sharp valleys, deeper towards the hem.
    const folds = (a, y, k1, k2, p) => 0.6 * Math.abs(Math.sin(k1 * a + p)) + 0.4 * Math.abs(Math.sin(k2 * a + 2.1 * p + 1.5 * y)) - 0.62;
    const levels = (y0, y1, n) => Array.from({ length: n + 1 }, (_, i) => y0 + (y1 - y0) * i / n);
    function robe(T, female) {
      return memo('robe' + female, () => surface(T, levels(0, 0.876, 56).map(y => {
        const [rx, rz, cx] = section(y), amp = 0.012 + 0.1 * smooth(0.6, 0.04, y) * smooth(0, 0.03, y + 0.02);
        return Array.from({ length: 56 }, (_, j) => {
          const a = j * TAU / 56, front = wrap(a);
          let d = 1 + amp * folds(a, y, 3.5, 5.5, 0.6);
          d += 0.1 * bell(y, 0.27, 0.075) * bell(front, 0.42, 0.33);            // one knee forward
          if (female) d += 0.05 * bell(y, 0.715, 0.035) * (bell(front, 0.5, 0.3) + bell(front, -0.5, 0.3));
          const w = female ? 1 - 0.07 * smooth(0.7, 0.8, y) * smooth(0.85, 0.8, y) : 1;
          return [cx + rx * d * Math.cos(a), y, rz * w * d * Math.sin(a)];
        });
      })));
    }
    // A cloak wraps the body and dives inside it across the front opening, so
    // its edge reads as the thickness of the cloth.
    function mantle(T, o) {
      return memo('mantle' + JSON.stringify(o), () => surface(T, levels(o.y0, o.y1, 44).map(y => {
        const [rx, rz, cx] = section(Math.min(y, 0.83)), t = sat((o.y1 - y) / (o.y1 - o.y0));
        const fade = o.taper ? smooth(0, o.taper, t) : 1; // a short veil thins out into the cloak below it
        const amp = (0.02 + 0.085 * t) * fade, off = ((o.base || 0.012) + (o.flow || 0.02) * t) * fade, open = o.open0 + (o.open1 - o.open0) * Math.sqrt(t);
        return Array.from({ length: 96 }, (_, j) => {
          const a = j * TAU / 96, front = Math.abs(wrap(a)), out = smooth(open - 0.04, open + 0.04, front);
          const arms = fade * (o.arms || 0) * bell(y, 0.68, 0.11) * Math.abs(Math.sin(a)) ** 3;
          const d = 1 + out * (amp * folds(a, y, 3, 4.5, 1.3) + (o.back || 0) * t * sat(-Math.cos(a)));
          const grow = out * (off + 0.012) - 0.012;
          return [cx + (rx + grow) * d * Math.cos(a), y, (rz + grow + out * arms) * d * Math.sin(a)];
        });
      })));
    }
    // Head in its own units: ±1 is half its height (y), width (z) and depth (x).
    const faceRelief = (y, z) => {
      const az = Math.abs(z), tip = sat((0.14 - y) / 0.34);
      const nose = y > 0.14 ? 0.1 * bell(y, 0.14, 0.09) : y > -0.2 ? 0.1 + 0.26 * tip ** 1.5 : 0.36 * bell(y, -0.2, 0.05);
      return nose * bell(z, 0, 0.085 + 0.05 * tip) - 0.11 * bell(y, 0.1, 0.085) * bell(az, 0.34, 0.16) + 0.05 * bell(y, 0.09, 0.04) * bell(az, 0.34, 0.1)
        + 0.06 * bell(y, 0.25, 0.07) * bell(z, 0, 0.62) + 0.05 * bell(y, -0.12, 0.17) * bell(az, 0.43, 0.2)
        + 0.075 * bell(y, -0.4, 0.035) * bell(z, 0, 0.2) + 0.065 * bell(y, -0.5, 0.04) * bell(z, 0, 0.17) - 0.035 * bell(y, -0.45, 0.013) * bell(z, 0, 0.21)
        + 0.1 * bell(y, -0.76, 0.13) * bell(z, 0, 0.27);
    };
    const skull = (y, a) => {
      const r = Math.sqrt(Math.max(0, 1 - y * y)), jaw = 1 - 0.36 * sat(-y) ** 1.5, x = r * Math.cos(a), z = r * Math.sin(a) * jaw;
      return [x * (1 - 0.1 * sat(-y) * sat(-x)) + smooth(0.1, 0.7, x) * faceRelief(y, z), y, z];
    };
    const headLevels = [-0.995, -0.96, -0.9, ...levels(-0.84, 0.36, 44), 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.9, 0.95, 0.985, 0.998];
    const headAngles = Array.from({ length: 72 }, (_, j) => { const u = -PI + j * TAU / 72; return u - 0.45 * Math.sin(u); });
    const HEAD = [0.056, 0.066, 0.047]; // half depth, height, width as fractions of the figure
    const scaled = p => [p[0] * HEAD[0], p[1] * HEAD[1], p[2] * HEAD[2]];
    function head(T) { return memo('head', () => surface(T, headLevels.map(y => headAngles.map(a => scaled(skull(y, a)))))); }
    // Veil or hair: a shell round the skull, drawn inside it over the face.
    function hood(T, o) {
      return memo('hood' + JSON.stringify(o), () => surface(T, [...levels(o.bottom, -0.9, 6), ...headLevels.slice(3)].map(y => headAngles.map(a => {
        const yy = Math.max(y, -0.96), p = skull(yy, a), hidden = p[0] > o.edge + o.rise * sat(yy - 0.3) && y < o.brow;
        const grow = hidden ? 0.9 : o.grow * (1 + (o.wave || 0) * Math.sin(9 * a + 6 * y)), fall = y < -0.9 ? 1 + o.spread * (-0.9 - y) : 1;
        const q = hidden ? p : [Math.sqrt(Math.max(0.02, 1 - yy * yy)) * Math.cos(a), yy, Math.sqrt(Math.max(0.02, 1 - yy * yy)) * Math.sin(a)];
        return scaled([q[0] * grow * fall - (y < -0.9 ? 0.25 * (-0.9 - y) : 0), y * (hidden ? 0.9 : 1), q[2] * grow * fall]);
      }))));
    }
    function limb(T, points, radii, key) {
      return memo('limb' + key, () => {
        const P3 = points.map(p => new T.Vector3(...p)), curve = new T.CatmullRomCurve3(P3, false, 'centripetal'), n = 20, rings = [];
        let normal = new T.Vector3(0, 0, 1);
        for (let i = 0; i <= n; i++) {
          const t = i / n, c = curve.getPoint(t), tan = curve.getTangent(t), u = t * (radii.length - 1), k = Math.min(radii.length - 2, Math.floor(u));
          const r = radii[k] + (radii[k + 1] - radii[k]) * (u - k);
          normal = normal.sub(tan.clone().multiplyScalar(normal.dot(tan))).normalize();
          const side = new T.Vector3().crossVectors(tan, normal);
          rings.push(Array.from({ length: 16 }, (_, j) => {
            const a = j * TAU / 16, w = r * (1 + 0.05 * Math.sin(4 * a + 7 * t));
            return [c.x + (normal.x * Math.cos(a) + side.x * Math.sin(a)) * w, c.y + (normal.y * Math.cos(a) + side.y * Math.sin(a)) * w, c.z + (normal.z * Math.cos(a) + side.z * Math.sin(a)) * w];
          }));
        }
        return surface(T, rings);
      });
    }
    // Arm paths by pose: shoulder, elbow, wrist; then where the fingers point and the palm faces.
    const POSES = {
      prayer: z => ({ arm: [[0, 0.79, z * 0.108], [0.035, 0.63, z * 0.138], [0.102, 0.7, z * 0.022]], dir: [0.3, 0.95, -z * 0.11], palm: [0, 0, -z], reach: 0.012 }),
      raised: z => ({ arm: [[0, 0.795, z * 0.108], [0.045, 0.765, z * 0.2], [0.1, 0.885, z * 0.275]], dir: [0.25, 0.85, z * 0.46], palm: [0.75, 0.6, -z * 0.25], reach: 0.03 }),
      open: z => ({ arm: [[0, 0.79, z * 0.108], [0.02, 0.63, z * 0.15], [0.115, 0.565, z * 0.195]], dir: [0.75, -0.5, z * 0.43], palm: [0.5, 0.8, 0], reach: 0.03 }),
      hold: z => ({ arm: [[0, 0.79, z * 0.108], [0.04, 0.63, z * 0.14], [0.125, z > 0 ? 0.655 : 0.7, z * (z > 0 ? 0.06 : 0.03)]], dir: [0.6, 0.25, -z * 0.75], palm: [0.3, 0.5, -z * 0.8], reach: 0.02 }),
      keys: z => ({ arm: [[0, 0.79, z * 0.108], [0.04, 0.63, z * 0.14], z < 0 ? [0.115, 0.71, -0.04] : [0.11, 0.6, 0.095]], dir: z < 0 ? [0.5, 0.8, 0.3] : [0.9, 0, -0.4], palm: [0.6, 0, -z * 0.8], reach: 0.02 }),
      sword: z => ({ arm: [[0, 0.79, z * 0.108], [0.04, 0.63, z * 0.14], z < 0 ? [0.125, 0.585, -0.015] : [0.105, 0.72, 0.07]], dir: z < 0 ? [0.7, -0.6, 0.3] : [0.5, 0.75, -0.4], palm: [0.4, 0.2, -z * 0.9], reach: 0.02 })
    };
    function hand(k, mat, at, dir, palm, H, y0, ox, oz) {
      const T = k.T, f = new T.Vector3(...dir).normalize(), n = new T.Vector3(...palm);
      n.sub(f.clone().multiplyScalar(n.dot(f))).normalize();
      const s = new T.Vector3().crossVectors(f, n), q = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(f, n, s));
      const P = (a, b, c) => [ox + (at[0] + f.x * a + n.x * b + s.x * c) * H, y0 + (at[1] + f.y * a + n.y * b + s.y * c) * H, oz + (at[2] + f.z * a + n.z * b + s.z * c) * H];
      k.sph(1, mat, { p: P(0.024, 0, 0), q, s: [0.027 * H, 0.0085 * H, 0.021 * H] }, 12, 8);
      [-0.0155, -0.0052, 0.0052, 0.0155].forEach((c, i) => k.rod(P(0.04, 0, c), P(0.086 - 0.006 * Math.abs(i - 1.3), 0.002, c * 1.08), 0.0052 * H, mat, 6));
      k.rod(P(0.012, 0.002, 0.02), P(0.045, 0.012, 0.034), 0.0058 * H, mat, 6);
    }
    /* o: { H, y0, robe, mantle, veil, sleeve, skin, hair, beard, sash, pose, look,
     *      female, painted, cloak: mantle shape, x, z: offset }. Returns the two hand positions. */
    function figure(k, o) {
      const T = k.T, H = o.H, y0 = o.y0 || 0, ox = o.x || 0, oz = o.z || 0, at = { p: [ox, y0, oz], s: H }, skin = o.skin || 'skin';
      k.add(robe(T, !!o.female), o.robe, at);
      if (o.mantle) k.add(mantle(T, { y0: 0.03, y1: 0.842, open0: 0.3, open1: 0.78, arms: 0.05, ...o.cloak }), o.mantle, at);
      if (o.sash) k.add(memo('sash', () => surface(T, levels(0.572, 0.6, 3).map(y => { const [rx, rz, cx] = section(y); return Array.from({ length: 40 }, (_, j) => [cx + (rx + 0.007) * Math.cos(j * TAU / 40), y, (rz + 0.007) * Math.sin(j * TAU / 40)]); }))), o.sash, at);
      // Head and neck pivot at the base of the skull so the face can turn up.
      const look = o.look || 0, neck = [ox - 0.002 * H, y0 + 0.872 * H, oz], headAt = { p: [neck[0] + Math.sin(-look) * 0.062 * H, neck[1] + Math.cos(look) * 0.062 * H, oz], r: [0, 0, look], s: H };
      k.add(head(T), skin, headAt);
      if (o.veil) {
        k.add(hood(T, { bottom: -1.5, edge: 0.34, rise: 0.25, brow: 0.6, grow: 1.13, spread: 0.55 }), o.veil, headAt);
        k.add(mantle(T, { y0: 0.5, y1: 0.862, open0: 0.6, open1: 1.3, base: 0.03, flow: 0.012, arms: 0.05, back: 0.1, taper: 0.3, ...o.veilDrape }), o.veil, at);
      }
      if (o.hair) k.add(hood(T, { bottom: o.female ? -2 : -1.35, edge: 0.3, rise: 0.4, brow: 0.56, grow: 1.08, spread: 0.3, wave: 0.03 }), o.hair, headAt);
      const face = (y, z, lift = 0) => { // a point on the modelled face, in figure units
        const x = Math.sqrt(Math.max(0, 1 - y * y - z * z)) + faceRelief(y, z) + lift, c = Math.cos(look), s = Math.sin(look), px = x * HEAD[0], py = y * HEAD[1];
        return [headAt.p[0] + (px * c - py * s) * H, headAt.p[1] + (px * s + py * c) * H, oz + z * HEAD[2] * H];
      };
      if (o.beard) {
        k.sph(1, o.hair, { p: face(-0.78, 0, -0.5), r: [0, 0, look], s: [0.034 * H, 0.04 * H, 0.04 * H] }, 16, 12);
        for (const z of [-1, 1]) { k.sph(1, o.hair, { p: face(-0.42, z * 0.56, -0.12), r: [0, 0, look], s: [0.02 * H, 0.034 * H, 0.012 * H] }, 10, 8); k.rod(face(-0.36, z * 0.04, 0.01), face(-0.42, z * 0.3, -0.02), 0.0048 * H, o.hair, 6); }
      }
      if (o.painted) for (const z of [-1, 1]) {
        k.sph(0.0052 * H, 'statueEye', { p: face(0.09, z * 0.34, -0.035), s: [0.5, 0.75, 1] }, 8, 6);
        k.rod(face(0.268, z * 0.15, 0.008), face(0.268, z * 0.5, -0.012), 0.0015 * H, o.hair || 'hair', 5);
        k.sph(1, 'statueLip', { p: face(-0.45, z * 0.07, -0.02), r: [0, 0, look], s: [0.004 * H, 0.0042 * H, 0.0085 * H] }, 8, 6);
      }
      const hands = {};
      for (const z of [-1, 1]) {
        const pose = POSES[o.pose || 'prayer'](z), wrist = pose.arm[2];
        k.add(limb(T, pose.arm, [0.04, 0.036, 0.033, 0.034, 0.044], (o.pose || 'prayer') + z), o.sleeve || o.robe, at);
        const f = new T.Vector3(...pose.dir).normalize(), start = [wrist[0] - f.x * 0.004, wrist[1] - f.y * 0.004, wrist[2] - f.z * 0.004];
        hand(k, skin, start, pose.dir, pose.palm, H, y0, ox, oz);
        hands[z < 0 ? 'right' : 'left'] = [ox + (wrist[0] + f.x * 0.045) * H, y0 + (wrist[1] + f.y * 0.045) * H, oz + (wrist[2] + f.z * 0.045) * H];
      }
      // Toes of the forward foot under the hem.
      k.sph(1, o.feet || skin, { p: [ox + 0.118 * H, y0 + 0.014 * H, oz + 0.05 * H], s: [0.03 * H, 0.014 * H, 0.022 * H] }, 10, 8);
      return hands;
    }
    return { figure, surface, bell, smooth };
  })();
  function starHalo(k, centre, radius, tilt, mat = 'gold', size = 0.03) {
    ring(12, (i, a) => k.shape(starPoints(size, size * 0.42), 0.006, mat, { p: [centre[0] + Math.cos(a) * radius * Math.sin(tilt), centre[1] + Math.cos(a) * radius * Math.cos(tilt), centre[2] + Math.sin(a) * radius], r: [0, PI / 2, 0] }, 'halo-star' + size));
    k.tor(radius, 0.004, mat, { p: centre, r: [0, PI / 2, tilt], order: 'ZYX' }, 2 * PI, 4, 40);
  }
  function buildMary(k) {
    pedestal(k, 1.0, 0.5);
    k.sph(0.25, 'robeWhite', { p: [0, 1.03, 0], s: [1, 0.3, 1] }, 18, 8);
    SCULPT.figure(k, { H: 1.62, y0: 1.06, robe: 'robeWhite', mantle: 'robeBlue', veil: 'robeWhite', sash: 'robeBlue', pose: 'prayer', female: true, painted: true, hair: 'hair', look: -0.06 });
    starHalo(k, [-0.02, 2.62, 0], 0.17, 0.2);
  }
  function buildJoseph(k) {
    pedestal(k, 1.0, 0.5);
    const hands = SCULPT.figure(k, { H: 1.66, y0: 1.0, robe: 'robeGreen', mantle: 'robeOchre', sash: 'robeBrown', hair: 'hair', beard: true, pose: 'hold', painted: true, feet: 'robeBrown', cloak: { open0: 0.45, open1: 0.95 } });
    // The Child Jesus sits on Joseph's left arm, following the approved concept.
    const c = hands.left;
    SCULPT.figure(k, { H: 0.5, y0: c[1] - 0.27, x: c[0] + 0.03, z: c[2] + 0.09, robe: 'robeWhite', hair: 'hair', pose: 'open', painted: true });
  }
  function buildSacredHeart(k) {
    pedestal(k, 1.0, 0.5);
    SCULPT.figure(k, { H: 1.68, y0: 1.0, robe: 'robeWhite', mantle: 'robeRed', hair: 'hair', beard: true, pose: 'open', painted: true, cloak: { open0: 0.5, open1: 0.9 } });
    k.sph(0.04, 'robeRed', { p: [0.155, 2.24, 0], s: [0.6, 1, 1] }, 12, 10);
    ring(10, (i, a) => k.rod([0.165, 2.24, 0], [0.165, 2.24 + Math.cos(a) * 0.09, Math.sin(a) * 0.09], 0.004, 'gold', 4));
  }
  /* Façade niche figures stand on the modelled niche pedestals, so they carry
   * no pedestal of their own. One ivory finish, as on the approved church views. */
  const IVORY = { robe: 'statueIvory', mantle: 'statueIvory', sleeve: 'statueIvory', skin: 'statueIvory', hair: 'statueIvoryShade', feet: 'statueIvory' };
  function buildAssumption(k) {
    // Cloud plinth, then Our Lady with open raised arms and upturned face.
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 16; i++) { const a = i * 2.39996, r = 0.1 + 0.14 * rnd(); k.sph(0.11 + 0.06 * rnd(), 'statueIvory', { p: [Math.cos(a) * r * 0.55, 0.11 + 0.12 * rnd(), Math.sin(a) * r * 1.1], s: [1, 0.72, 1] }, 12, 8); }
    SCULPT.figure(k, { ...IVORY, H: 2.2, y0: 0.26, veil: 'statueIvory', sash: 'statueIvoryShade', pose: 'raised', female: true, look: 0.42, cloak: { open0: 0.55, open1: 0.8, arms: 0.07, flow: 0.035, back: 0.04 }, veilDrape: { back: 0.04 } });
    starHalo(k, [-0.12, 2.42, 0], 0.3, 0.35, 'gold', 0.045);
  }
  function buildPeter(k) {
    const h = SCULPT.figure(k, { ...IVORY, H: 1.78, y0: 0.03, beard: true, pose: 'keys', cloak: { open0: 0.5, open1: 0.9 } });
    k.box(0.3, 0.03, 0.44, 'statueIvory', { p: [0, 0.015, 0] });
    // Two keys in the right hand, a book in the left.
    for (const [dz, tilt] of [[-0.02, 0.25], [0.03, -0.2]]) {
      const [x, y, z] = [h.right[0] + 0.02, h.right[1], h.right[2] + dz];
      k.rod([x, y - 0.22, z + tilt * 0.22], [x, y + 0.03, z], 0.008, 'gold', 8);
      k.tor(0.03, 0.008, 'gold', { p: [x, y + 0.06, z - tilt * 0.03], r: [0, PI / 2, 0] }, 2 * PI, 6, 16);
      k.box(0.012, 0.04, 0.045, 'gold', { p: [x, y - 0.2, z + tilt * 0.22 + 0.022] });
    }
    k.box(0.05, 0.24, 0.17, 'statueIvoryShade', { p: [h.left[0] + 0.01, h.left[1] + 0.05, h.left[2] + 0.02], r: [0, 0.2, -0.15] });
  }
  function buildPaul(k) {
    const h = SCULPT.figure(k, { ...IVORY, H: 1.78, y0: 0.03, beard: true, pose: 'sword', cloak: { open0: 0.5, open1: 0.9 } });
    k.box(0.3, 0.03, 0.44, 'statueIvory', { p: [0, 0.015, 0] });
    // The sword rests point down under the right hand; a book lies on the left arm.
    const [x, y, z] = h.right;
    k.box(0.012, y - 0.1, 0.055, 'statueIvoryShade', { p: [x + 0.01, 0.05 + (y - 0.1) / 2, z] });
    k.box(0.03, 0.03, 0.24, 'gold', { p: [x + 0.01, y - 0.04, z] });
    k.rod([x + 0.01, y - 0.04, z], [x + 0.01, y + 0.13, z], 0.016, 'gold', 8);
    k.sph(0.026, 'gold', { p: [x + 0.01, y + 0.14, z] }, 8, 6);
    k.box(0.05, 0.24, 0.17, 'statueIvoryShade', { p: [h.left[0] + 0.01, h.left[1] + 0.03, h.left[2] + 0.03], r: [0, -0.2, -0.1] });
  }
  function bouquet(k, x, y, z, s = 1, colors = ['flowerWhite', 'flowerCream']) {
    for (let i = 0; i < 18; i++) {
      const a = i * 2.39996, rr = (0.06 + (i % 4) * 0.05) * s, h = (0.12 + (i % 5) * 0.06) * s;
      k.rod([x, y, z], [x + Math.cos(a) * rr, y + h, z + Math.sin(a) * rr], 0.006 * s, 'leaf', 5);
      k.sph(0.045 * s, i % 3 ? 'leaf' : 'leafLight', { p: [x + Math.cos(a) * rr * 0.8, y + h * 0.75, z + Math.sin(a) * rr * 0.8], s: [0.5, 1.3, 0.8], r: [a, 0, 0.6] }, 8, 6);
      k.sph(0.05 * s, colors[i % colors.length], { p: [x + Math.cos(a) * rr, y + h + 0.02 * s, z + Math.sin(a) * rr] }, 8, 6);
    }
  }
  function buildFlowerStand(k) {
    k.cyl(0.18, 0.22, 0.06, 'darkWood', { p: [0, 0.03, 0] }, 16);
    k.lathe([[0.06, 0.06], [0.05, 0.3], [0.07, 0.5], [0.045, 0.7], [0.06, 0.95], [0.12, 1.0]], 'darkWood', {}, 16);
    k.lathe([[0.001, 1.0], [0.12, 1.0], [0.16, 1.08], [0.14, 1.2], [0.17, 1.27], [0.15, 1.28]], 'brass', {}, 18);
    bouquet(k, 0, 1.24, 0, 1.25, ['flowerWhite', 'flowerWhite', 'flowerCream']);
  }
  function buildFloorFlowers(k) {
    k.lathe([[0.001, 0], [0.16, 0], [0.2, 0.08], [0.17, 0.3], [0.22, 0.38], [0.2, 0.39]], 'stone', {}, 16);
    bouquet(k, 0, 0.36, 0, 1.15, ['flowerWhite', 'flowerCream', 'flowerWhite']);
  }
  function buildPalm(k) {
    k.lathe([[0.001, 0], [0.17, 0], [0.24, 0.42], [0.26, 0.44], [0.25, 0.46]], 'terracotta', {}, 18);
    k.cyl(0.235, 0.235, 0.02, 'straw', { p: [0, 0.43, 0] }, 16);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.39996, lean = 0.35 + (i % 3) * 0.2, len = 0.9 + (i % 4) * 0.18;
      const pts = [[0, 0.42, 0], [Math.cos(a) * 0.1, 0.42 + len * 0.6, Math.sin(a) * 0.1], [Math.cos(a) * len * lean, 0.42 + len * 0.95, Math.sin(a) * len * lean], [Math.cos(a) * len * lean * 1.7, 0.42 + len * 0.75, Math.sin(a) * len * lean * 1.7]];
      k.tube(pts, 0.008, 'leaf', {}, 10, 4);
      for (let j = 1; j < 9; j++) {
        const t = j / 9, px = Math.cos(a) * len * lean * 1.7 * t * 0.95, py = 0.42 + len * (0.6 + 0.4 * Math.sin(t * PI)) * 0.95, pz = Math.sin(a) * len * lean * 1.7 * t * 0.95;
        for (const side of [-1, 1]) k.sph(0.03, j % 2 ? 'leaf' : 'leafLight', { p: [px - Math.sin(a) * side * 0.08, py - 0.03, pz + Math.cos(a) * side * 0.08], s: [2.4, 0.25, 0.8], r: [0, -a + side * 0.9, -0.3] }, 6, 4);
      }
    }
  }
  function buildCandleStand(k) {
    k.lathe([[0.001, 0], [0.2, 0], [0.18, 0.04], [0.05, 0.1], [0.035, 0.6], [0.05, 0.9], [0.03, 1.0], [0.04, 1.02]], 'brass', {}, 18);
    k.tor(0.3, 0.012, 'brass', { p: [0, 1.02, 0], r: [PI / 2, 0, 0] }, 2 * PI, 5, 30);
    ring(6, (i, a) => k.rod([0, 1.0, 0], [Math.cos(a) * 0.3, 1.02, Math.sin(a) * 0.3], 0.01, 'brass', 6));
    candleLamp(k, 0, 1.03, 0, 1.3);
    ring(6, (i, a) => candleLamp(k, Math.cos(a) * 0.3, 1.03, Math.sin(a) * 0.3, 1.1));
  }
  function buildPaschal(k) {
    k.lathe([[0.001, 0], [0.22, 0], [0.2, 0.06], [0.07, 0.14], [0.05, 0.75], [0.09, 0.95], [0.11, 1.0]], 'brass', {}, 18);
    k.cyl(0.045, 0.045, 0.85, 'candle', { p: [0, 1.43, 0] }, 16);
    k.box(0.006, 0.18, 0.012, 'robeRed', { p: [0.046, 1.5, 0] });
    k.box(0.006, 0.012, 0.11, 'robeRed', { p: [0.046, 1.55, 0] });
    k.sph(0.024, 'glow', { p: [0, 1.9, 0], s: [1, 1.8, 1] }, 10, 8);
    k.glowPoint([0, 1.9, 0], 0.2);
  }
  function buildBanner(k, item) {
    const c = item.params?.colour || 'fabricWhite';
    k.cyl(0.012, 0.012, 1.0, 'brass', { p: [0.04, -0.03, 0], r: [PI / 2, 0, 0] }, 8);
    for (const z of [-0.5, 0.5]) k.sph(0.025, 'brass', { p: [0.04, -0.03, z] }, 8, 6);
    k.box(0.012, 2.6, 0.9, c, { p: [0.04, -1.36, 0] });
    k.shape([[-0.45, 0], [0.45, 0], [0, -0.35]], 0.012, c, { p: [0.04, -2.66, 0], r: [0, PI / 2, 0] }, 'pennant-tail');
    k.box(0.016, 0.9, 0.08, 'fabricGold', { p: [0.04, -1.2, 0] });
    k.box(0.016, 0.08, 0.5, 'fabricGold', { p: [0.04, -1.0, 0] });
    for (const z of [-0.44, 0.44]) k.box(0.014, 2.5, 0.025, 'fabricGold', { p: [0.04, -1.33, z] });
  }
  function catenary(len, sag, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([t * len, -4 * sag * t * (1 - t), 0]); }
    return pts;
  }
  function buildLanternString(k, item) {
    const len = item.params?.length || 6, sag = Math.min(1.2, len * 0.12), n = Math.max(3, Math.round(len / 0.9));
    k.tube(catenary(len, sag, 12).map(([x, y]) => [0, y, x - len / 2]), 0.006, 'rope', {}, 24, 4);
    for (let i = 1; i < n; i++) {
      const t = i / n, z = t * len - len / 2, y = -4 * sag * t * (1 - t);
      k.cyl(0.003, 0.003, 0.12, 'rope', { p: [0, y - 0.06, z] }, 4);
      k.cyl(0.07, 0.07, 0.03, 'gold', { p: [0, y - 0.13, z] }, 12);
      k.sph(0.16, 'glow', { p: [0, y - 0.3, z], s: [1, 0.85, 1] }, 14, 10);
      k.cyl(0.07, 0.07, 0.03, 'gold', { p: [0, y - 0.45, z] }, 12);
      k.cyl(0.01, 0.025, 0.16, 'fabricRed', { p: [0, y - 0.55, z] }, 6);
      k.glowPoint([0, y - 0.3, z], 0.6);
    }
  }
  // Festival bulb string: a straight run along local z, tilted by `slope` (90° = vertical).
  function bulbCount(params = {}) {
    const length = Number(params.length ?? 12), spacing = Number(params.spacing ?? 0.6);
    return Number.isFinite(length) && Number.isFinite(spacing) && length > 0 && spacing > 0
      ? Math.max(2, Math.round(length / spacing)) + 1 : 0;
  }
  function buildBulbString(k, item) {
    const len = item.params?.length || 12, slope = (item.params?.slope || 0) * PI / 180;
    const n = bulbCount(item.params) - 1, dy = Math.sin(slope), dz = Math.cos(slope);
    if (n < 1) return;
    k.tube([[0, -len / 2 * dy, -len / 2 * dz], [0, len / 2 * dy, len / 2 * dz]], 0.006, 'rope', {}, 2, 4);
    for (let i = 0; i <= n; i++) {
      const t = i / n - 0.5, p = [0, t * len * dy, t * len * dz];
      k.sph(0.05, 'glow', { p }, 6, 4);
      k.glowPoint(p, 0.55);
    }
  }
  function buildBunting(k, item) {
    const len = item.params?.length || 7, sag = Math.min(0.9, len * 0.08), n = Math.round(len / 0.32);
    const colors = ['fabricRed', 'fabricGold', 'fabricWhite', 'fabricBlue', 'fabricGreen'];
    k.tube(catenary(len, sag, 12).map(([x, y]) => [0, y, x - len / 2]), 0.004, 'rope', {}, 24, 4);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, z = t * len - len / 2, y = -4 * sag * t * (1 - t);
      k.shape([[-0.11, 0], [0.11, 0], [0, -0.28]], 0.004, colors[i % colors.length], { p: [0, y, z], r: [0, PI / 2, 0] }, 'pennant');
    }
  }
  function buildTree(k) {
    k.cyl(0.32, 0.38, 0.4, 'fabricRed', { p: [0, 0.2, 0] }, 16);
    k.cyl(0.07, 0.08, 0.6, 'darkWood', { p: [0, 0.6, 0] }, 10);
    const tiers = [[0.95, 0.9, 0.55], [0.8, 0.8, 1.1], [0.62, 0.7, 1.6], [0.45, 0.6, 2.05], [0.28, 0.55, 2.45]];
    tiers.forEach(([r, h, y]) => k.cone(r, h, 'pine', { p: [0, y + h / 2, 0] }, 18));
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const tier = tiers[i % tiers.length], a = rnd() * 2 * PI, f = 0.2 + rnd() * 0.7;
      const y = tier[2] + tier[1] * (1 - f) * 0.9, r = tier[0] * f + 0.02;
      const p = [Math.cos(a) * r, y, Math.sin(a) * r];
      if (i % 2) k.sph(0.045, i % 4 === 1 ? 'flowerRed' : 'gold', { p }, 8, 6);
      else { k.sph(0.018, 'glow', { p }, 6, 4); k.glowPoint(p, 0.12); }
    }
    k.shape(starPoints(0.17, 0.07), 0.04, 'glow', { p: [0, 3.18, 0], r: [0, PI / 2, 0] }, 'star-small');
    k.glowPoint([0, 3.18, 0], 0.6);
  }
  function starPoints(R, r) {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = PI / 2 + i * PI / 5, rr = i % 2 ? r : R; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    return pts;
  }
  function buildStar(k) {
    k.cyl(0.003, 0.003, 0.6, 'rope', { p: [0, -0.3, 0] }, 4);
    k.shape(starPoints(0.55, 0.22), 0.06, 'glow', { p: [0, -1.15, 0], r: [0, PI / 2, 0] }, 'star-big');
    k.glowPoint([0, -1.15, 0], 2.0);
  }
  function buildGrotto(k) {
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    k.box(1.6, 0.06, 2.8, 'straw', { p: [0, 0.03, 0] });
    for (let i = 0; i < 26; i++) {
      const t = i / 25, a = PI * t, r = 1.25 + rnd() * 0.15;
      k.ico(0.28 + rnd() * 0.18, 'rock', { p: [-0.35 + rnd() * 0.3, 0.15 + Math.sin(a) * r * 1.25, Math.cos(a) * r], r: [rnd(), rnd(), rnd()] }, 0);
    }
    for (let i = 0; i < 10; i++) k.ico(0.3 + rnd() * 0.2, 'rock', { p: [-0.75, 0.3 + rnd() * 1.4, -1 + rnd() * 2], r: [rnd(), rnd(), rnd()] }, 0);
    k.box(0.32, 0.22, 0.55, 'wood', { p: [0.15, 0.17, 0] });
    k.box(0.28, 0.04, 0.5, 'straw', { p: [0.15, 0.3, 0] });
    k.add(new k.T.CapsuleGeometry(0.05, 0.12, 4, 8), 'robeWhite', { p: [0.15, 0.36, 0], r: [PI / 2, 0, 0] });
    k.add(new k.T.CapsuleGeometry(0.12, 0.42, 4, 10), 'robeBlue', { p: [0.1, 0.4, -0.55] });
    k.sph(0.08, 'skin', { p: [0.1, 0.78, -0.55] }, 10, 8);
    k.add(new k.T.CapsuleGeometry(0.13, 0.55, 4, 10), 'robeBrown', { p: [0.05, 0.48, 0.58] });
    k.sph(0.085, 'skin', { p: [0.05, 0.93, 0.58] }, 10, 8);
    k.shape(starPoints(0.3, 0.12), 0.04, 'glow', { p: [0.1, 2.35, 0], r: [0, PI / 2, 0] }, 'star-grotto');
    k.glowPoint([0.1, 2.35, 0], 1.2);
  }
  function buildCarpet(k, item) {
    const len = item.params?.length || 24;
    k.box(len, 0.012, 1.5, 'carpetRed', { p: [len / 2, 0.006, 0] });
    for (const z of [-0.66, 0.66]) k.box(len, 0.014, 0.05, 'fabricGold', { p: [len / 2, 0.007, z] });
  }

  /* Socket outlets. Local +X faces away from the wall. Envelopes are review
   * proxies for common accessory sizes, not selected products. */
  function buildSocketDouble(k) {
    // 146 × 86 mm twin plate on a flush box; two shuttered outlets.
    k.box(0.012, 0.086, 0.146, 'socketPlate', { p: [0.006, 0, 0] });
    for (const z of [-0.036, 0.036]) {
      k.cyl(0.02, 0.02, 0.004, 'socketDark', { p: [0.014, 0, z], r: [0, 0, PI / 2] }, 16);
      for (const y of [-0.008, 0.008]) k.box(0.003, 0.006, 0.003, 'socketPlate', { p: [0.0165, y, z] });
    }
  }
  function buildSocketEvent(k) {
    // 400 × 500 × 180 mm lockable weatherproof cabinet with a hinged door,
    // a rain hood, one angled 32 A industrial outlet and two 16 A outlets below.
    k.box(0.18, 0.5, 0.4, 'enclosureGrey', { p: [0.09, 0, 0] });
    k.box(0.012, 0.46, 0.36, 'enclosureGrey', { p: [0.186, 0, 0] });
    k.box(0.22, 0.02, 0.44, 'enclosureGrey', { p: [0.11, 0.26, 0], r: [0, 0, -0.12] });
    k.cyl(0.012, 0.012, 0.02, 'socketDark', { p: [0.196, 0, 0.15], r: [0, 0, PI / 2] }, 10);
    k.cyl(0.045, 0.045, 0.09, 'socketBlue', { p: [0.1, -0.29, -0.09], r: [0, 0, 0.35] }, 16);
    for (const z of [0.03, 0.13]) k.cyl(0.03, 0.03, 0.06, 'socketBlue', { p: [0.1, -0.275, z], r: [0, 0, 0.35] }, 14);
    k.box(0.006, 0.06, 0.16, 'socketPlate', { p: [0.194, 0.13, 0] });
  }

  /* --------------------------------------------------------------- catalogue */
  const LIGHT = 'light', FAN = 'fan', SPK = 'speaker', DECOR = 'decor', POWER = 'power';
  const types = [
    // Owner's smaller wing chandelier intent, 9 October 2026. Both are concept
    // envelopes, not selected products. Candle output uses the existing 470 lm /
    // 4.5 W lamp assumption; the reading optic is a separate unverified component.
    { id: 'chandelier6', cat: LIGHT, family: 'Decorative', name: 'Small brass chandelier · 6 lamps · concept', mounts: ['pendant'], defaultDrop: 2.4, glow: 'warm', circuit: 'L8',
      desc: 'Concept: six 470 lm / 4.5 W candle lamps; 1.2 m nominal arm diameter. Appearance approved in principle, product/support/photometry pending. Decorative-only comparison.',
      light: { lumens: 2820, watts: 27, cct: 2700, cri: 90, emitters: [{ kind: 'point', pos: [0, -0.3, 0] }] }, build: k => buildChandelier(k, 6, 0.6) },
    { id: 'chandelier6Reading', cat: LIGHT, family: 'Decorative', name: 'Small brass chandelier + reading optic · concept', mounts: ['pendant'], aim: true, defaultTilt: -90, defaultDrop: 2.4, glow: 'warm', circuit: 'L8',
      desc: 'Concept assembly: 2820 lm candle lamps plus separate downward 2820 lm / 24 W optic, beneath the body. Equal flux split, 70 degree nominal beam; manufacturer, thermal design, glare and support approval pending.',
      light: { lumens: 5640, watts: 51, cct: 2700, cri: 90, beam: 70, field: 112, emitters: [{ kind: 'point', pos: [0, -0.3, 0] }, { kind: 'spot', pos: [0, -1.245, 0] }] },
      build: k => { buildChandelier(k, 6, 0.6); k.cyl(0.09, 0.075, 0.08, 'brass', { p: [0, -1.19, 0] }); k.cyl(0.064, 0.064, 0.009, 'glow', { p: [0, -1.236, 0] }); k.glowPoint([0, -1.245, 0], 0.2); } },
    { id: 'chandelier8', cat: LIGHT, family: 'Decorative', name: 'Brass candle chandelier · 8 lamps', mounts: ['pendant'], defaultDrop: 2.4, glow: 'warm', circuit: 'LD',
      desc: '8 × 470 lm candle LEDs, 2700 K, Ø 1.9 m. Sparkle and character; not a reading light.',
      light: { lumens: 3760, watts: 36, cct: 2700, cri: 90, emitters: [{ kind: 'point', pos: [0, -0.3, 0] }] }, build: k => buildChandelier(k, 8, 0.95) },
    { id: 'chandelier12', cat: LIGHT, family: 'Decorative', name: 'Grand chandelier · 12 lamps', mounts: ['pendant'], defaultDrop: 2.6, glow: 'warm', circuit: 'LD',
      desc: '12 × 470 lm candle LEDs, 2700 K, Ø 2.5 m. For the crossing or sanctuary.',
      light: { lumens: 5640, watts: 54, cct: 2700, cri: 90, emitters: [{ kind: 'point', pos: [0, -0.3, 0] }] }, build: k => buildChandelier(k, 12, 1.25) },
    { id: 'sconce2', cat: LIGHT, family: 'Decorative', name: 'Brass candle sconce · 2 lamps', mounts: ['wall'], defaultHeight: 3.6, glow: 'warm', circuit: 'LD',
      desc: '2 × 470 lm candle LEDs, 2700 K. Wall rhythm and evening atmosphere.',
      light: { lumens: 940, watts: 9, cct: 2700, cri: 90, emitters: [{ kind: 'point', pos: [0.24, 0.2, 0] }] }, build: buildSconce },
    { id: 'projector24', cat: LIGHT, family: 'Task & accent', name: 'LED projector · narrow 24°', mounts: ['pendant', 'wall'], aim: true, defaultTilt: -90, defaultDrop: 0, glow: 'lens', circuit: 'L1',
      desc: '6 000 lm, 3000 K CRI 90, 24° beam, 50 W. Long throws from beams.',
      light: { lumens: 6000, watts: 50, cct: 3000, cri: 90, beam: 24, field: 40, optics: [15, 24, 36, 50], emitters: [{ kind: 'spot', head: true, pos: [0.17, 0, 0] }] }, build: k => buildProjector(k) },
    { id: 'projector36', cat: LIGHT, family: 'Task & accent', name: 'LED projector · medium 36°', mounts: ['pendant', 'wall'], aim: true, defaultTilt: -90, defaultDrop: 0, glow: 'lens', circuit: 'L1',
      desc: '6 000 lm, 3000 K CRI 90, 36° beam, 50 W. Reading light from the tie beams.',
      light: { lumens: 6000, watts: 50, cct: 3000, cri: 90, beam: 36, field: 58, optics: [15, 24, 36, 50], emitters: [{ kind: 'spot', head: true, pos: [0.17, 0, 0] }] }, build: k => buildProjector(k) },
    { id: 'spot15', cat: LIGHT, family: 'Task & accent', name: 'Accent spotlight · 15°', mounts: ['pendant', 'wall', 'floor'], aim: true, defaultTilt: -45, defaultDrop: 0, glow: 'lens', circuit: 'L3', shadow: true,
      desc: '2 500 lm, 3000 K CRI 95, 15° beam, 22 W. Altar, ambo, crucifix and statues.',
      light: { lumens: 2500, watts: 22, cct: 3000, cri: 95, beam: 15, field: 26, optics: [10, 15, 24, 36], emitters: [{ kind: 'spot', head: true, pos: [0.12, 0, 0] }] }, build: k => buildProjector(k, 0.05, 0.17, 'bronze') },
    { id: 'servicePanel', cat: LIGHT, family: 'Task & accent', name: 'Service-room LED panel · 600 × 600 mm', mounts: ['pendant'], defaultDrop: 0, glow: 'lens', circuit: 'L3',
      desc: 'Existing 600 × 600 × 30 mm panel geometry. 3000 lm / 30 W are provisional category values; confirm product.',
      light: { lumens: 3000, watts: 30, cct: 4000, cri: 80, emitters: [{ kind: 'point', pos: [0, -0.02, 0] }] },
      build: k => { k.box(0.6, 0.03, 0.6, 'white'); k.box(0.58, 0.003, 0.58, 'glow', { p: [0, -0.017, 0] }); } },
    { id: 'highbay', cat: LIGHT, family: 'Task & accent', name: 'LED high-bay · wide 70°', mounts: ['pendant'], aim: true, defaultTilt: -90, defaultDrop: 0.3, glow: 'lens', circuit: 'L4',
      desc: '12 000 lm, 4000 K, 70° beam, 90 W. Cleaning and maintenance light.',
      light: { lumens: 12000, watts: 90, cct: 4000, cri: 80, beam: 70, field: 110, emitters: [{ kind: 'spot', head: true, pos: [0.05, 0, 0] }] }, build: buildHighbay },
    { id: 'uplight', cat: LIGHT, family: 'Architectural', name: 'Roof uplight · wide flood', mounts: ['floor', 'wall'], aim: true, defaultTilt: 90, glow: 'lens', circuit: 'LA',
      desc: '4 000 lm, 2700 K, 100° flood, 32 W. Sits on a tie beam and washes the timber roof.',
      light: { lumens: 4000, watts: 32, cct: 2700, cri: 90, beam: 100, field: 150, emitters: [{ kind: 'spot', head: true, pos: [0.04, 0, 0] }] }, build: buildUplight },
    { id: 'lantern', cat: LIGHT, family: 'Decorative', name: 'Pendant lantern · opal', mounts: ['pendant'], defaultDrop: 1.2, glow: 'warm', circuit: 'L4',
      desc: '1 500 lm, 2700 K, 14 W. Verandas and porches.',
      light: { lumens: 1500, watts: 14, cct: 2700, cri: 90, emitters: [{ kind: 'point', pos: [0, -0.48, 0] }] }, build: k => buildPendantLantern(k) },
    { id: 'wallLantern', cat: LIGHT, family: 'Decorative', name: 'Wall lantern', mounts: ['wall'], defaultHeight: 2.6, glow: 'warm', circuit: 'L4',
      desc: '900 lm, 2700 K, 9 W. Veranda piers and side doors.',
      light: { lumens: 900, watts: 9, cct: 2700, cri: 90, emitters: [{ kind: 'point', pos: [0.3, -0.2, 0] }] }, build: buildWallLantern },
    { id: 'flood', cat: LIGHT, family: 'Exterior', name: 'Façade floodlight', mounts: ['floor'], aim: true, defaultTilt: 50, glow: 'lens', circuit: 'L6',
      desc: '9 000 lm, 3000 K, 30° beam, 70 W, IP66. Towers and façade.',
      light: { lumens: 9000, watts: 70, cct: 3000, cri: 80, beam: 30, field: 50, optics: [15, 30, 50, 70], emitters: [{ kind: 'spot', head: true, pos: [0.05, 0, 0] }] }, build: buildFlood },
    { id: 'corniceFlood', cat: LIGHT, family: 'Exterior', name: 'Tower floodlight · projecting arm', mounts: ['floor'], aim: true, defaultTilt: 50, glow: 'lens', circuit: 'L6',
      desc: 'Adjustable flood on a proposed cornice arm. Base follows the ledge; head projects clear of the tower wall. Product and bracket details pending.',
      params: { outreach: { label: 'Arm outreach (m)', min: 0.25, max: 0.8, step: 0.05, value: 0.5 } },
      light: { lumens: 9000, watts: 70, cct: 3000, cri: 80, beam: 30, field: 50, optics: [15, 30, 50, 70], emitters: [{ kind: 'spot', head: true, pos: [0.05, 0, 0] }] }, build: buildCorniceFlood },
    // Concealed niche lighting, 9 October 2026 (owner: no visible lamps at the
    // statues; the light is the art). Each line is a linear LED in a slot behind
    // a lip in the finish of the wall. The model shows that lip only: no lens,
    // no lamp body and no glare point. Two calculation points stand for a line.
    { id: 'nicheJambLine', cat: LIGHT, family: 'Exterior', name: 'Concealed light line · niche jamb', mounts: ['wall'], aim: true, defaultTilt: 0, glow: 'lens', circuit: 'L10',
      params: { length: { label: 'Lip length (m)', min: 0.4, max: 2.4, step: 0.1, value: 1.3 } },
      desc: 'Upright linear LED hidden behind a matching lip at the front edge of a niche jamb. Nominal 360 lm, 3000 K CRI 90, 5 W, weatherproof. Slot, lip, driver place and access pending.',
      light: { lumens: 360, watts: 5, cct: 3000, cri: 90, beam: 80, field: 130, optics: [50, 80, 110], emitters: [{ kind: 'spot', pos: [0.03, 0.35, 0] }, { kind: 'spot', pos: [0.03, -0.35, 0] }] },
      build: (k, item) => k.box(0.03, item.params?.length || 1.3, 0.05, 'ivory', { p: [0.015, 0, 0] }) },
    { id: 'nicheArchLine', cat: LIGHT, family: 'Exterior', name: 'Concealed light line · niche arch', mounts: ['wall'], aim: true, defaultTilt: -80, glow: 'lens', circuit: 'L10',
      params: { length: { label: 'Lip length (m)', min: 0.3, max: 1.6, step: 0.1, value: 0.6 } },
      desc: 'Short linear LED hidden behind a matching lip under the head of a niche arch. Nominal 400 lm, 3000 K CRI 90, 5 W, weatherproof. Slot, lip, driver place and access pending.',
      light: { lumens: 400, watts: 5, cct: 3000, cri: 90, beam: 60, field: 100, optics: [36, 60, 90], emitters: [{ kind: 'spot', pos: [0.02, -0.03, 0] }] },
      build: (k, item) => k.box(0.05, 0.03, item.params?.length || 0.6, 'ivory', { p: [0.025, -0.015, 0] }) },
    // Owner request, 9 October 2026: two candle lights on the base of each façade
    // statue. A devotional object that is meant to be seen, unlike the hidden lines.
    { id: 'nicheCandle', cat: LIGHT, family: 'Exterior', name: 'Statue candle light · electric flame', mounts: ['floor'], glow: 'warm', flicker: true, circuit: 'L10',
      desc: 'Electric candle in a brass holder at the feet of a statue: 0.46 m tall, warm flickering flame, about 40 lm and 1 W, weatherproof. Product, fixing and lamp access pending.',
      light: { lumens: 40, watts: 1, cct: 2200, emitters: [{ kind: 'point', pos: [0, 0.45, 0] }] },
      build: k => {
        k.cyl(0.07, 0.09, 0.03, 'brass', { p: [0, 0.015, 0] }, 16);
        k.cyl(0.028, 0.045, 0.1, 'brass', { p: [0, 0.08, 0] }, 12);
        k.cyl(0.06, 0.035, 0.02, 'brass', { p: [0, 0.14, 0] }, 16);
        k.cyl(0.027, 0.027, 0.27, 'candle', { p: [0, 0.285, 0] }, 12);
        k.sph(0.028, 'glow', { p: [0, 0.455, 0], s: [1, 1.9, 1] }, 10, 8);
        k.glowPoint([0, 0.455, 0], 0.22);
      } },
    { id: 'bollard', cat: LIGHT, family: 'Exterior', name: 'Path bollard', mounts: ['floor'], glow: 'warm', circuit: 'L5',
      desc: '600 lm, 3000 K, 8 W, 0.9 m. Steps and paths.',
      light: { lumens: 600, watts: 8, cct: 3000, cri: 80, emitters: [{ kind: 'point', pos: [0, 0.76, 0] }] }, build: buildBollard },
    { id: 'exitSign', cat: LIGHT, family: 'Emergency', name: 'Exit sign (maintained)', mounts: ['wall', 'pendant'], defaultHeight: 2.4, glow: 'green', circuit: 'E1',
      desc: '3 W self-contained exit sign. Shown for location only; emergency lighting needs its own design.',
      light: { lumens: 20, watts: 3, cct: 6500, emitters: [] }, build: buildExitSign },

    { id: 'fanCeiling', cat: FAN, family: 'Ceiling', name: 'Ceiling fan · 1.42 m (56")', mounts: ['pendant'], defaultDrop: 3.0, circuit: 'F1',
      desc: 'Downrod ceiling fan. Blades ≥ 2.4 m above floor; ~1.2 m/s below at high speed.',
      fan: { kind: 'ceiling', diameter: 1.42, rotorDrop: 0.17, speeds: [{ flow: 1.3, watts: 18, dBA: 32, rpm: 110 }, { flow: 2.0, watts: 34, dBA: 38, rpm: 170 }, { flow: 2.8, watts: 60, dBA: 45, rpm: 240 }] }, build: buildCeilingFan },
    { id: 'fanHVLS', cat: FAN, family: 'Ceiling', name: 'Large slow fan (HVLS) · 3.0 m', mounts: ['pendant'], defaultDrop: 3.2, circuit: 'F1',
      params: { spreader: { label: 'Steel spreader between tie beams', type: 'bool', value: false } },
      desc: 'Few large, quiet fans covering ~8 m radius each. Check chandelier clearance.',
      fan: { kind: 'ceiling', diameter: 3.0, rotorDrop: 0.42, speeds: [{ flow: 4, watts: 45, dBA: 33, rpm: 35 }, { flow: 7, watts: 120, dBA: 36, rpm: 50 }, { flow: 10, watts: 250, dBA: 39, rpm: 70 }, { flow: 13, watts: 420, dBA: 42, rpm: 85 }, { flow: 16, watts: 650, dBA: 45, rpm: 100 }] }, build: buildHVLS },
    { id: 'fanWall', cat: FAN, family: 'Wall', name: 'Wall fan · oscillating 45 cm', mounts: ['wall'], aim: true, defaultHeight: 2.8, defaultTilt: -22, circuit: 'F2',
      desc: 'Common on church columns in Việt Nam. Louder; aim it at people, not microphones or candles.',
      fan: { kind: 'jet', diameter: 0.45, oscillate: true, sweepDeg: 80, speeds: [{ flow: 0.45, watts: 35, dBA: 47, rpm: 900 }, { flow: 0.6, watts: 45, dBA: 52, rpm: 1100 }, { flow: 0.75, watts: 55, dBA: 57, rpm: 1300 }] }, build: buildWallFan },
    { id: 'fanWingWall', cat: FAN, family: 'Wall', name: 'Wing wall fan · 45 cm · extended bracket concept', mounts: ['wall'], aim: true, defaultHeight: 4.05, defaultTilt: -52, circuit: 'F5',
      desc: 'Unverified 0.40 m pivot outreach proxy clears modeled swept guard from wall. Same fan ratings as fanWall; bracket, anchors, vibration, real dimensions and concealment ENGINEERING HOLD.',
      fan: { kind: 'jet', diameter: 0.45, oscillate: true, sweepDeg: 80, speeds: [{ flow: 0.45, watts: 35, dBA: 47, rpm: 900 }, { flow: 0.6, watts: 45, dBA: 52, rpm: 1100 }, { flow: 0.75, watts: 55, dBA: 57, rpm: 1300 }] }, build: k => buildWallFan(k, null, 0.26) },
    { id: 'fanNaveWall', cat: FAN, family: 'Wall', name: 'Nave wall fan · 45 cm · extended bracket concept', mounts: ['wall'], aim: true, defaultHeight: 5.55, defaultTilt: -38, circuit: 'F2',
      desc: 'Unverified 0.40 m pivot outreach proxy clears modeled swept guard from wall. Same fan ratings as fanWall; bracket, anchors, vibration, real dimensions and concealment ENGINEERING HOLD.',
      fan: { kind: 'jet', diameter: 0.45, oscillate: true, sweepDeg: 80, speeds: [{ flow: 0.45, watts: 35, dBA: 47, rpm: 900 }, { flow: 0.6, watts: 45, dBA: 52, rpm: 1100 }, { flow: 0.75, watts: 55, dBA: 57, rpm: 1300 }] }, build: k => buildWallFan(k, null, 0.26) },
    { id: 'fanWallLarge', cat: FAN, family: 'Wall', name: 'Large wall circulator · 90 cm', mounts: ['wall'], aim: true, defaultHeight: 4.5, defaultTilt: -8, circuit: 'F4',
      desc: 'Industrial wall circulator, long throw down the nave. Loud at high speed; test before buying.',
      fan: { kind: 'jet', diameter: 0.9, oscillate: false, sweepDeg: 0, speeds: [{ flow: 2.2, watts: 160, dBA: 52, rpm: 450 }, { flow: 3.2, watts: 260, dBA: 58, rpm: 650 }, { flow: 4.2, watts: 380, dBA: 64, rpm: 850 }] }, build: buildLargeWallFan },
    { id: 'fanExhaust', cat: FAN, family: 'Ventilation', name: 'Exhaust (ventilation) fan · 50 cm', mounts: ['wall'], defaultHeight: 6, circuit: 'V1',
      desc: 'Extracts the hot air that collects under the roof; fresh air enters through the open doors and windows. Rated by air changes, not by draught on people.',
      fan: { kind: 'jet', exhaust: true, diameter: 0.5, oscillate: false, sweepDeg: 0, speeds: [{ flow: 0.8, watts: 60, dBA: 40, rpm: 900 }, { flow: 1.2, watts: 110, dBA: 46, rpm: 1300 }, { flow: 1.6, watts: 170, dBA: 52, rpm: 1700 }] }, build: buildExhaustFan },
    { id: 'fanPedestal', cat: FAN, family: 'Portable', name: 'Pedestal fan · 45 cm', mounts: ['floor'], aim: true, defaultTilt: -5, circuit: 'F3',
      desc: 'Temporary fan for festivals and overflow areas.',
      fan: { kind: 'jet', diameter: 0.45, oscillate: true, sweepDeg: 80, speeds: [{ flow: 0.45, watts: 35, dBA: 46, rpm: 900 }, { flow: 0.6, watts: 45, dBA: 51, rpm: 1100 }, { flow: 0.75, watts: 55, dBA: 56, rpm: 1300 }] }, build: buildPedestalFan },

    { id: 'columnSpeaker', cat: SPK, family: 'Columns', name: 'Column loudspeaker · 1.0 m passive', mounts: ['wall'], aim: true, defaultHeight: 3.2, defaultTilt: -6, circuit: 'A1',
      desc: '8 × 3" drivers, 140° × 25° (−6 dB, 2 kHz), 93 dB 1 W/1 m, 160 W.',
      speaker: { hb: [360, 300, 220, 160, 140, 130, 120], vb: [360, 160, 75, 40, 25, 20, 16], rear: [3, 5, 8, 12, 15, 18, 20], sensitivity: 93, ratedW: 160, lineLength: 1.0, response: [-12, -4, 0, 0, 0, 0, -3], nominal: 86 },
      build: k => buildColumnSpeaker(k, 1.0, 0.09, 0.11) },
    { id: 'steerableColumn', cat: SPK, family: 'Columns', name: 'Steerable column · 2.0 m active DSP', mounts: ['wall'], aim: true, defaultHeight: 3.1, defaultTilt: -7, circuit: 'A1',
      desc: 'Digitally steered beam: 150° wide, vertical opening 8–45° (set below), long throw with low reverberant excitation. Self-powered.',
      params: { opening: { label: 'Vertical beam opening (°)', min: 8, max: 45, step: 1, value: 20 } },
      speaker: { hb: [360, 300, 220, 170, 150, 140, 130], vb: [360, 110, 50, 24, 15, 12, 10], rear: [3, 6, 10, 14, 18, 20, 22], sensitivity: 97, ratedW: 400, lineLength: 2.0, response: [-8, -2, 0, 0, 0, 0, -2], nominal: 86, active: true, steerable: true, opening: 20 },
      build: k => buildColumnSpeaker(k, 2.0, 0.12, 0.14) },
    { id: 'slimColumn', cat: SPK, family: 'Columns', name: 'Slim wall column · 0.6 m, wall colour', mounts: ['wall'], aim: true, defaultHeight: 2.7, defaultTilt: -8, circuit: 'A1',
      desc: '4 × 2.5" drivers in a 6 cm-wide case painted to match the plaster; 130° × 30° (2 kHz), 89 dB 1 W/1 m, 60 W. For a discreet distributed system along the walls.',
      speaker: { hb: [360, 300, 200, 150, 130, 120, 110], vb: [360, 220, 110, 60, 40, 32, 28], rear: [3, 5, 8, 12, 15, 17, 19], sensitivity: 89, ratedW: 60, lineLength: 0.6, response: [-14, -6, -1, 0, 0, 0, -3], nominal: 82 },
      build: k => buildColumnSpeaker(k, 0.6, 0.06, 0.07) },
    { id: 'pointSpeaker', cat: SPK, family: 'Point source', name: '2-way loudspeaker · 8"', mounts: ['wall'], aim: true, defaultHeight: 3.5, defaultTilt: -12, circuit: 'A1',
      desc: '90° × 60°, 92 dB 1 W/1 m, 200 W. Compact fill or monitor.',
      speaker: { hb: [360, 240, 140, 100, 90, 85, 80], vb: [360, 200, 120, 80, 60, 55, 50], rear: [4, 7, 11, 14, 17, 19, 21], sensitivity: 92, ratedW: 200, response: [-6, -1, 0, 0, 0, 0, -2], nominal: 84 },
      build: buildPointSpeaker },
    { id: 'pendantSpeaker', cat: SPK, family: 'Distributed', name: 'Pendant loudspeaker · 6"', mounts: ['pendant'], aim: true, defaultDrop: 2.5, defaultTilt: -90, circuit: 'A2',
      desc: '110° cone, 89 dB 1 W/1 m, 30 W (100 V line). Verandas and overflow areas.',
      speaker: { hb: [360, 300, 180, 120, 110, 100, 90], vb: [360, 300, 180, 120, 110, 100, 90], rear: [3, 5, 8, 12, 15, 17, 18], sensitivity: 89, ratedW: 30, response: [-12, -4, 0, 0, 0, -1, -4], nominal: 80 },
      build: buildPendantSpeaker },
    { id: 'horn', cat: SPK, family: 'Exterior', name: 'Outdoor horn · 30 W', mounts: ['wall', 'pendant'], aim: true, defaultHeight: 4.5, defaultTilt: -15, circuit: 'A3',
      desc: '60° × 40°, 108 dB 1 W/1 m. Courtyard overflow at festivals; narrow, bright sound.',
      speaker: { hb: [360, 200, 110, 70, 60, 55, 50], vb: [360, 160, 80, 50, 40, 36, 32], rear: [3, 6, 10, 14, 17, 18, 20], sensitivity: 108, ratedW: 30, response: [-22, -12, -4, 0, 0, -2, -10], nominal: 98 },
      build: buildHorn },
    { id: 'wedge', cat: SPK, family: 'Monitor', name: 'Choir monitor wedge', mounts: ['floor'], aim: true, defaultTilt: 0, circuit: 'A4',
      desc: '90° × 60°, 95 dB 1 W/1 m. Keep it out of the congregation and away from microphones.',
      speaker: { hb: [360, 240, 140, 100, 90, 85, 80], vb: [360, 200, 120, 80, 60, 55, 50], rear: [4, 7, 11, 14, 17, 19, 21], sensitivity: 95, ratedW: 250, response: [-4, 0, 0, 0, 0, 0, -2], nominal: 80, upward: 40 },
      build: buildWedge },
    { id: 'mic', cat: SPK, family: 'Microphone', name: 'Gooseneck microphone (cardioid)', mounts: ['floor'], circuit: 'MIC', mic: { pattern: 'cardioid' },
      desc: 'Feedback check point. Place at the ambo or altar; the talker is ~0.4 m away.', build: buildMic },

    // Socket outlets (cat 'power'). The planning allowance is this point's share of
    // its circuit rating at 230 V / PF 0.9, the simulator's convention: it sizes
    // the circuit for review and is not a product load. Circuit rating, RCD,
    // cable and accessory type are provisional and on ENGINEERING HOLD.
    { id: 'socketDouble', cat: POWER, family: 'Indoor sockets', name: 'Double socket outlet · 16 A · recessed', mounts: ['wall'], defaultHeight: 0.45, circuit: 'P1',
      desc: 'Two shuttered 16 A 2P+E outlets on one flush plate, 0.45 m above the floor. Shares a 16 A circuit with 30 mA residual-current protection (provisional). For instruments, cleaning machines and portable equipment.',
      params: { loadW: { label: 'Plugged-in load to test (W)', min: 0, max: 3300, step: 50, value: 0 } },
      outlet: { ratingA: 16, outlets: '2 × 16 A 2P+E shuttered', protection: 'IP20 indoor', rcdmA: 30, allowanceW: 1656 }, build: buildSocketDouble },
    { id: 'socketEvent', cat: POWER, family: 'Outdoor event power', name: 'Event power point · 32 A + 2 × 16 A · lockable', mounts: ['wall'], defaultHeight: 1.3, circuit: 'P3',
      desc: 'Lockable weatherproof cabinet: one 32 A 2P+E industrial outlet (IEC 60309 pattern) and two 16 A outlets on its own 32 A circuit with 30 mA residual-current protection (provisional). Outdoor stage sound, lighting and stalls. Kept isolated outside events.',
      params: { loadW: { label: 'Plugged-in load to test (W)', min: 0, max: 6600, step: 100, value: 0 } },
      outlet: { ratingA: 32, outlets: '1 × 32 A 2P+E industrial + 2 × 16 A', protection: 'IP66 lockable (provisional)', rcdmA: 30, allowanceW: 6624 }, build: buildSocketEvent },

    ...[['saintPeterPicture', 'Saint Peter (Thánh Phêrô)', 'saintPeterArt'], ['saintPaulPicture', 'Saint Paul (Thánh Phaolô)', 'saintPaulArt']].map(([id, name, art]) => ({
      id, cat: DECOR, family: 'Sacred pictures', name: name + ' · concept picture', mounts: ['wall'], circuit: 'DECOR',
      desc: 'Generated devotional concept. Frame proxy 1.12 × 1.62 m; actual size, material, glass, mounting and artwork approval pending. Unpowered.',
      build: k => {
        // +X faces into the room. A 1.00 × 1.50 m native-ratio artwork is
        // surrounded by a modeled frame; these are review envelopes only.
        k.box(0.04, 1.62, 1.12, 'darkWood', { p: [0.02, 0, 0] });
        for (const y of [-0.78, 0.78]) k.box(0.035, 0.06, 1.12, 'agedBrass', { p: [0.0525, y, 0] });
        for (const z of [-0.53, 0.53]) k.box(0.035, 1.50, 0.06, 'agedBrass', { p: [0.0525, 0, z] });
        k.plane(1.00, 1.50, art, { p: [0.045, 0, 0], r: [0, PI / 2, 0] });
      }
    })),
    { id: 'statueMary', cat: DECOR, family: 'Statues', name: 'Statue · Our Lady (Đức Mẹ)', mounts: ['floor'], footprint: [0.7, 0.7], build: buildMary },
    { id: 'statueJoseph', cat: DECOR, family: 'Statues', name: 'Statue · Saint Joseph', mounts: ['floor'], footprint: [0.7, 0.7], build: buildJoseph },
    { id: 'statueSacredHeart', cat: DECOR, family: 'Statues', name: 'Statue · Sacred Heart', mounts: ['floor'], footprint: [0.7, 0.7], build: buildSacredHeart },
    { id: 'statueAssumption', cat: DECOR, family: 'Statues', name: 'Statue · Assumption of Our Lady (Đức Mẹ Hồn Xác Lên Trời) · concept', mounts: ['floor'], footprint: [0.7, 1.5],
      desc: 'Ivory figure 2.2 m on a cloud plinth, open raised arms and upturned face, for the central façade niche. Generated concept: the sculptor, size, material, weight and fixing are pending.', build: buildAssumption },
    { id: 'statuePeter', cat: DECOR, family: 'Statues', name: 'Statue · Saint Peter (Thánh Phêrô) · niche figure · concept', mounts: ['floor'], footprint: [0.5, 0.8],
      desc: 'Ivory figure 1.78 m with keys and book, for a side façade niche. Generated concept: subject, sculptor, size, material, weight and fixing are pending.', build: buildPeter },
    { id: 'statuePaul', cat: DECOR, family: 'Statues', name: 'Statue · Saint Paul (Thánh Phaolô) · niche figure · concept', mounts: ['floor'], footprint: [0.5, 0.8],
      desc: 'Ivory figure 1.78 m with sword and book, for a side façade niche. Generated concept: subject, sculptor, size, material, weight and fixing are pending.', build: buildPaul },
    { id: 'flowerStand', cat: DECOR, family: 'Flowers', name: 'Tall flower stand · white lilies', mounts: ['floor'], footprint: [0.5, 0.5], build: buildFlowerStand },
    { id: 'floorFlowers', cat: DECOR, family: 'Flowers', name: 'Low flower arrangement', mounts: ['floor'], footprint: [0.5, 0.5], build: buildFloorFlowers },
    { id: 'palm', cat: DECOR, family: 'Plants', name: 'Potted palm', mounts: ['floor'], footprint: [0.6, 0.6], build: buildPalm },
    { id: 'candleStand', cat: DECOR, family: 'Candles', name: 'Votive candle stand · 7', mounts: ['floor'], footprint: [0.7, 0.7], glow: 'flame', flicker: true,
      light: { lumens: 84, watts: 0, cct: 1900, emitters: [{ kind: 'point', pos: [0, 1.25, 0] }] }, build: buildCandleStand },
    { id: 'paschal', cat: DECOR, family: 'Candles', name: 'Paschal candle', mounts: ['floor'], footprint: [0.5, 0.5], glow: 'flame', flicker: true,
      light: { lumens: 12, watts: 0, cct: 1900, emitters: [] }, build: buildPaschal },
    { id: 'banner', cat: DECOR, family: 'Fabric', name: 'Liturgical banner', mounts: ['wall', 'pendant'], defaultHeight: 6.4, defaultDrop: 0, params: { colour: { label: 'Colour', options: { fabricWhite: 'White / gold', fabricPurple: 'Purple', fabricGreen: 'Green', fabricRed: 'Red', fabricBlue: 'Marian blue' }, value: 'fabricWhite' } },
      absorptionArea: 2.3, build: buildBanner },
    { id: 'lanternString', cat: DECOR, family: 'Festival', name: 'String of red lanterns (đèn lồng)', mounts: ['pendant'], defaultDrop: 0, glow: 'red', circuit: 'X1',
      params: { length: { label: 'Length (m)', min: 2, max: 14, step: 0.5, value: 6 } },
      light: { lumens: 240, watts: 18, cct: 2200, emitters: [{ kind: 'point', pos: [0, -0.6, 0] }] }, build: buildLanternString },
    { id: 'bulbString', cat: LIGHT, family: 'Festival', name: 'Festival bulb string (outdoor)', mounts: ['floor', 'wall'], glow: 'warm', circuit: 'L7',
      params: { length: { label: 'Length (m)', min: 2, max: 60, step: 0.5, value: 12 }, slope: { label: 'Slope (°, 90 = vertical)', min: -90, max: 90, step: 1, value: 0 }, spacing: { label: 'Bulb spacing (m)', min: 0.3, max: 1.5, step: 0.1, value: 0.6 } },
      desc: 'Warm 2200 K LED bulbs, ~1 W each, IP65. For ridges, eaves, gables and tower edges on big feasts.',
      light: { lumens: 0, watts: 0, wattsPerBulb: 1, cct: 2200, emitters: [] }, build: buildBulbString },
    { id: 'bunting', cat: DECOR, family: 'Festival', name: 'Festival pennants (cờ đuôi nheo)', mounts: ['pendant'], defaultDrop: 0,
      params: { length: { label: 'Length (m)', min: 2, max: 14, step: 0.5, value: 7 } }, build: buildBunting },
    { id: 'christmasTree', cat: DECOR, family: 'Christmas', name: 'Christmas tree with lights', mounts: ['floor'], footprint: [2, 2], glow: 'fairy', circuit: 'X1',
      light: { lumens: 350, watts: 25, cct: 2400, emitters: [{ kind: 'point', pos: [0, 1.8, 0] }] }, build: buildTree },
    { id: 'grotto', cat: DECOR, family: 'Christmas', name: 'Nativity grotto (hang đá)', mounts: ['floor'], footprint: [1.8, 3.0], glow: 'warm', circuit: 'X1',
      light: { lumens: 400, watts: 6, cct: 3000, emitters: [{ kind: 'point', pos: [0.4, 2.2, 0] }] }, build: buildGrotto },
    { id: 'star', cat: DECOR, family: 'Christmas', name: 'Hanging illuminated star', mounts: ['pendant'], defaultDrop: 1.2, glow: 'cool', circuit: 'X1',
      light: { lumens: 500, watts: 12, cct: 5000, emitters: [{ kind: 'point', pos: [0, -1.15, 0] }] }, build: buildStar },
    { id: 'carpet', cat: DECOR, family: 'Fabric', name: 'Aisle carpet runner', mounts: ['floor'], params: { length: { label: 'Length (m)', min: 4, max: 34, step: 1, value: 26 } }, build: buildCarpet }
  ];
  const byId = Object.fromEntries(types.map(t => [t.id, t]));

  window.CHURCH_SIM_CATALOG = { MATERIALS, types, byId, makeKit, bulbCount };
})();
