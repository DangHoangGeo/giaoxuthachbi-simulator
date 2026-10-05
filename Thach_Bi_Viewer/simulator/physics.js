/* Thạch Bi simulator · physics. Pure functions: no DOM, no three.js.
 * Units: metres, seconds, lumens, candela, lux, dB SPL, m/s.
 *
 * Transparent engineering estimates for comparing positions; not certified
 * predictions:
 *  - Light: the renderer's own point/spot distributions (three.js smoothstep
 *    cone), inverse-square direct illuminance with column and wall occlusion,
 *    plus an integrating-sphere estimate of inter-reflected light.
 *  - Sound: octave-band loudspeaker directivity, inverse-square spreading
 *    (cylindrical near field for columns), ISO 9613-1 air absorption,
 *    reflected energy after Barron's revised theory, Eyring reverberation
 *    time, STI after IEC 60268-16 (MTF from an energy-time model with auditory
 *    masking and reception threshold).
 *  - Air: empirical jet + floor wall-jet model for ceiling and wall fans.
 */
(function (root) {
  'use strict';
  const PI = Math.PI;
  const P = {};

  P.OCTAVES = [125, 250, 500, 1000, 2000, 4000, 8000];
  P.A_WEIGHT = [-16.1, -8.6, -3.2, 0, 1.2, 1.0, -1.1];
  // IEC 60268-16 male speech spectrum: band levels re the overall A-weighted level.
  P.SPEECH_SPECTRUM = [2.9, 2.9, -0.8, -6.8, -12.8, -18.8, -24.8];
  P.FLAT_SPECTRUM = [0, 0, 0, 0, 0, 0, 0];
  P.MOD_FREQS = [0.63, 0.8, 1, 1.25, 1.6, 2, 2.5, 3.15, 4, 5, 6.3, 8, 10, 12.5];
  P.STI_ALPHA = [0.085, 0.127, 0.230, 0.233, 0.309, 0.224, 0.173];
  P.STI_BETA = [0.085, 0.078, 0.065, 0.011, 0.047, 0.095];
  P.RECEPTION_THRESHOLD = [46, 27, 12, 6.5, 7.5, 8, 12];
  P.FAN_SPECTRUM = [3, 2, 0, -3, -7, -12, -18];
  P.AMBIENT_SPECTRUM = [8, 4, 0, -4, -8, -13, -20];
  // Column shadow for sound at higher frequencies (diffraction-limited), dB.
  P.COLUMN_SHADOW = [0, 0, -1, -3, -5, -6, -6];
  // Sound passing a solid wall (around/through openings and reveals), dB.
  P.WALL_SHADOW = [-6, -8, -10, -12, -14, -15, -16];

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smoothstep = (e0, e1, x) => {
    if (e1 <= e0) return x >= e1 ? 1 : 0;
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const db = x => 10 * Math.log10(Math.max(x, 1e-30));
  const undb = L => Math.pow(10, L / 10);
  Object.assign(P, { clamp, smoothstep, db, undb });

  /* ------------------------------------------------------------------ colour */
  // Planckian locus (Kim et al. cubic spline) → linear sRGB with luminance 1.
  P.cctToLinear = function (kelvin) {
    const T = clamp(kelvin, 1700, 12000);
    const x = T <= 4000
      ? -0.2661239e9 / T ** 3 - 0.2343589e6 / T ** 2 + 0.8776956e3 / T + 0.179910
      : -3.0258469e9 / T ** 3 + 2.1070379e6 / T ** 2 + 0.2226347e3 / T + 0.240390;
    const y = T <= 2222
      ? -1.1063814 * x ** 3 - 1.34811020 * x ** 2 + 2.18555832 * x - 0.20219683
      : T <= 4000
        ? -0.9549476 * x ** 3 - 1.37418593 * x ** 2 + 2.09137015 * x - 0.16748867
        : 3.0817580 * x ** 3 - 5.87338670 * x ** 2 + 3.75112997 * x - 0.37001483;
    const X = x / y, Z = (1 - x - y) / y;
    const rgb = [
      Math.max(0, 3.2406 * X - 1.5372 - 0.4986 * Z),
      Math.max(0, -0.9689 * X + 1.8758 + 0.0415 * Z),
      Math.max(0, 0.0557 * X - 0.2040 + 1.0570 * Z)
    ];
    const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    return rgb.map(v => v / lum);
  };
  // Partial (von Kries-like) adaptation to the viewer's white point; Y stays 1.
  const colorCache = new Map();
  P.adaptedLightColor = function (kelvin, whiteKelvin = 3600, degree = 0.75) {
    const key = kelvin + '|' + whiteKelvin + '|' + degree;
    if (colorCache.has(key)) return colorCache.get(key);
    const c = P.cctToLinear(kelvin), w = P.cctToLinear(whiteKelvin);
    const out = c.map((v, i) => v / (1 + degree * (w[i] - 1)));
    const lum = 0.2126 * out[0] + 0.7152 * out[1] + 0.0722 * out[2];
    const res = out.map(v => v / lum);
    colorCache.set(key, res);
    return res;
  };

  /* -------------------------------------------------------------- photometry */
  // three.js spot attenuation = smoothstep(cos(angle), cos(angle·(1−penumbra)), cosθ).
  // The 50 % point sits at the catalogue beam angle, the cut-off at the field angle.
  const spotCache = new Map();
  P.spotCone = function (beamDeg, fieldDeg) {
    const ck = beamDeg + '|' + fieldDeg;
    if (spotCache.has(ck)) return spotCache.get(ck);
    const res = spotConeRaw(beamDeg, fieldDeg);
    spotCache.set(ck, res);
    return res;
  };
  function spotConeRaw(beamDeg, fieldDeg) {
    const field = Math.max(beamDeg + 0.5, fieldDeg || beamDeg * 1.6);
    const cosBeam = Math.cos((beamDeg / 2) * PI / 180);
    let cosOuter = Math.cos((Math.min(field, 178) / 2) * PI / 180);
    // A soft edge cannot reach 50 % at the beam angle if the field is too tight:
    // then keep the full-intensity centre and narrow the cut-off instead.
    if (2 * cosBeam - cosOuter > 1) cosOuter = 2 * cosBeam - 1;
    const outer = Math.acos(cosOuter);
    const inner = Math.acos(clamp(2 * cosBeam - cosOuter, cosOuter, 1));
    const penumbra = clamp(1 - inner / outer, 0, 1);
    return { angle: outer, penumbra, cosOuter, cosInner: Math.cos(outer * (1 - penumbra)) };
  }
  const coneCache = new Map();
  P.coneSolidAngle = function (cone) {
    const key = cone.cosOuter.toFixed(7) + '|' + cone.cosInner.toFixed(7);
    if (coneCache.has(key)) return coneCache.get(key);
    const steps = 480, outer = Math.acos(cone.cosOuter);
    let sum = 0;
    for (let i = 0; i < steps; i++) {
      const th = (i + 0.5) / steps * outer;
      sum += smoothstep(cone.cosOuter, cone.cosInner, Math.cos(th)) * Math.sin(th);
    }
    const value = 2 * PI * sum * outer / steps;
    coneCache.set(key, value);
    return value;
  };
  P.peakCandela = (lumens, cone) => cone ? lumens / P.coneSolidAngle(cone) : lumens / (4 * PI);

  /* Occluders for light and sound: timber shafts, column bases and the inner
     C/G walls with their arched openings. */
  P.buildOccluders = function (geo) {
    const cylinders = geo.columns || [], boxes = geo.boxes || [], walls = geo.walls || [];
    function segCylinder(a, b, c) {
      const dx = b[0] - a[0], dz = b[2] - a[2];
      const fx = a[0] - c.x, fz = a[2] - c.z;
      const A = dx * dx + dz * dz;
      if (A < 1e-9) return false;
      const B = 2 * (fx * dx + fz * dz), C = fx * fx + fz * fz - c.r * c.r;
      const disc = B * B - 4 * A * C;
      if (disc <= 0) return false;
      const s = Math.sqrt(disc);
      const t0 = (-B - s) / (2 * A), t1 = (-B + s) / (2 * A);
      if (t1 < 0.0005 || t0 > 0.9995) return false;
      const ta = Math.max(t0, 0.0005), tb = Math.min(t1, 0.9995);
      const ya = a[1] + (b[1] - a[1]) * ta, yb = a[1] + (b[1] - a[1]) * tb;
      return Math.max(ya, yb) >= c.y0 && Math.min(ya, yb) <= c.y1;
    }
    function segBox(a, b, box) {
      let t0 = 0.0005, t1 = 0.9995;
      for (let k = 0; k < 3; k++) {
        const d = b[k] - a[k];
        if (Math.abs(d) < 1e-12) {
          if (a[k] < box.min[k] || a[k] > box.max[k]) return false;
        } else {
          let u0 = (box.min[k] - a[k]) / d, u1 = (box.max[k] - a[k]) / d;
          if (u0 > u1) { const t = u0; u0 = u1; u1 = t; }
          t0 = Math.max(t0, u0); t1 = Math.min(t1, u1);
          if (t0 > t1) return false;
        }
      }
      return true;
    }
    function segWall(a, b, w) {
      const da = a[2] - w.z, dbz = b[2] - w.z;
      if ((da > 0) === (dbz > 0) || Math.abs(da - dbz) < 1e-9) return false;
      const t = da / (da - dbz);
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      if (x < w.x0 || x > w.x1 || y < w.y0 || y > w.y1) return false;
      for (const o of w.openings) if (x >= o.x0 && x <= o.x1 && y >= o.y0 && y <= o.y1) return false;
      return true;
    }
    return {
      cylinders, boxes, walls,
      blocked(a, b) {
        for (const w of walls) if (segWall(a, b, w)) return true;
        for (const c of cylinders) if (segCylinder(a, b, c)) return true;
        for (const box of boxes) if (segBox(a, b, box)) return true;
        return false;
      },
      blockedByColumn(a, b) {
        for (const c of cylinders) if (segCylinder(a, b, c)) return true;
        return false;
      },
      blockedByWall(a, b) {
        for (const w of walls) if (segWall(a, b, w)) return true;
        return false;
      }
    };
  };

  /* Direct illuminance (lux) at p with unit normal n. Emitters:
     {kind:'point'|'spot', pos, dir, cd, cosOuter, cosInner, downFraction?}. */
  P.illuminance = function (p, n, emitters, occluders) {
    let E = 0;
    for (const e of emitters) {
      const vx = e.pos[0] - p[0], vy = e.pos[1] - p[1], vz = e.pos[2] - p[2];
      const d2 = vx * vx + vy * vy + vz * vz;
      if (d2 < 1e-4) continue;
      const d = Math.sqrt(d2), lx = vx / d, ly = vy / d, lz = vz / d;
      const cosInc = n[0] * lx + n[1] * ly + n[2] * lz;
      if (cosInc <= 0) continue;
      let I = e.cd;
      if (e.kind === 'spot') {
        const c = -(lx * e.dir[0] + ly * e.dir[1] + lz * e.dir[2]);
        if (c <= e.cosOuter) continue;
        I *= smoothstep(e.cosOuter, e.cosInner, c);
      }
      if (I <= 0) continue;
      if (occluders && occluders.blocked(p, e.pos)) continue;
      E += I * cosInc / d2;
    }
    return E;
  };
  // Integrating-sphere (split-flux) estimate of inter-reflected illuminance.
  P.indirectIlluminance = function (fluxLm, light) {
    const rho = clamp(light.meanReflectance, 0, 0.95);
    return fluxLm * rho / (light.area * (1 - rho));
  };

  /* --------------------------------------------------------------- acoustics */
  P.speedOfSound = T => 331.3 + 0.606 * T;
  // Sabine / Eyring constant 24·ln10 / c (0.161 at 343 m/s; 0.159 at 28 °C).
  P.reverbConstant = c => 24 * Math.LN10 / c;
  // ISO 9613-1 air attenuation (dB/m) at the octave centres.
  P.airAttenuationDb = function (tempC = 28, rh = 75, pressureKPa = 101.325) {
    const T = tempC + 273.15, T0 = 293.15, T01 = 273.16, pr = 101.325, pa = pressureKPa;
    const C = -6.8346 * Math.pow(T01 / T, 1.261) + 4.6151;
    const h = rh * Math.pow(10, C) * (pr / pa);
    const frO = (pa / pr) * (24 + 4.04e4 * h * (0.02 + h) / (0.391 + h));
    const frN = (pa / pr) * Math.pow(T / T0, -0.5) * (9 + 280 * h * Math.exp(-4.170 * (Math.pow(T / T0, -1 / 3) - 1)));
    return P.OCTAVES.map(f => 8.686 * f * f * (1.84e-11 * (pr / pa) * Math.sqrt(T / T0)
      + Math.pow(T / T0, -2.5) * (0.01275 * Math.exp(-2239.1 / T) / (frO + f * f / frO)
      + 0.1068 * Math.exp(-3352 / T) / (frN + f * f / frN))));
  };

  // Random-incidence absorption coefficients, 125 Hz – 8 kHz (typical published values).
  P.ABSORPTION = {
    plaster: [0.01, 0.02, 0.02, 0.03, 0.04, 0.05, 0.05],
    stoneFloor: [0.01, 0.01, 0.015, 0.015, 0.02, 0.02, 0.02],
    timberSolid: [0.10, 0.07, 0.05, 0.05, 0.05, 0.05, 0.05],
    tileUnderside: [0.20, 0.15, 0.10, 0.08, 0.08, 0.10, 0.10],
    timberLining: [0.15, 0.11, 0.10, 0.07, 0.06, 0.07, 0.07],
    acousticLining: [0.30, 0.55, 0.80, 0.85, 0.80, 0.70, 0.60],
    mixedLining: [0.22, 0.33, 0.45, 0.46, 0.43, 0.39, 0.34],
    glass: [0.35, 0.25, 0.18, 0.12, 0.07, 0.04, 0.04],
    timberDoor: [0.14, 0.10, 0.06, 0.08, 0.10, 0.10, 0.10],
    opening: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
    pewsEmpty: [0.08, 0.10, 0.12, 0.14, 0.16, 0.16, 0.16],
    pewsOccupied: [0.57, 0.61, 0.75, 0.86, 0.91, 0.86, 0.86],
    banner: [0.05, 0.10, 0.25, 0.40, 0.50, 0.55, 0.55],
    slatPanels: [0.25, 0.55, 0.85, 0.90, 0.80, 0.65, 0.55]
  };
  P.ROOF_FINISHES = {
    tile: { label: 'Tile underside on battens (as drawn)', absorption: 'tileUnderside', reflectance: 0.32 },
    timber: { label: 'Ivory timber boarded lining (proposal)', absorption: 'timberLining', reflectance: 0.50 },
    mixed: { label: 'Timber lining, ~50 % slotted acoustic boards (recommended)', absorption: 'mixedLining', reflectance: 0.48 },
    acoustic: { label: 'Slotted timber acoustic lining throughout', absorption: 'acousticLining', reflectance: 0.45 }
  };
  // The entrance wall faces the loudspeakers and the altar; treating it stops a late
  // reflection back to the front and shortens the reverberation of the whole room.
  P.ENTRANCE_FINISHES = {
    plaster: { label: 'Plaster as drawn', area: 0 },
    slats: { label: 'Timber slat acoustic panels, ≈75 m² (recommended)', area: 75 }
  };

  // Surface schedule of the nave and wings from the model's sourced dimensions.
  P.roomModel = function (opt = {}) {
    const length = 52.85 - 5.475, width = 14.5, eave = 7.13, ridge = 12.28;
    const section = width * eave + 0.5 * width * (ridge - eave);
    const wingVolume = 2 * 6.7 * 5.7 * 6.6;
    const columnsVolume = 18 * PI * 0.31 * 0.31 * 8.8;
    // Entrance hall between the façade (x 2.65) and axis 2′, under the +8.14 m
    // terrace slab and open to the nave; the front gable and façade together
    // match the end-wall area already counted in the two sections.
    const hallDepth = 5.475 - 2.65, hallHeight = 8.14;
    const V = length * section + wingVolume + hallDepth * width * hallHeight - columnsVolume;
    const roof = P.ROOF_FINISHES[opt.roofFinish] ? opt.roofFinish : 'timber';
    const occupancy = clamp(opt.occupancy ?? 0.6, 0, 1);
    const openings = clamp(opt.openingsOpen ?? 1, 0, 1);
    const seatingArea = opt.seatingArea || 250;
    const floor = (length + hallDepth) * width + 2 * 6.7 * 5.7;
    const innerOpenings = opt.innerOpeningArea || 130;
    const doorArea = 26;
    const bannerArea = opt.bannerArea || 0;
    const walls = 2 * length * eave + 2 * section + 2 * (2 * 6.7 + 5.7) * 6.6 + hallDepth * (2 * hallHeight + width) - innerOpenings - doorArea - bannerArea;
    const roofArea = 2 * length * Math.hypot(7.25, ridge - eave) + 2 * 55;
    const timber = 18 * PI * 0.61 * 8.8 + 110;
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const surfaces = [
      { name: 'Stone floor and aisles', area: floor - seatingArea, abs: P.ABSORPTION.stoneFloor, rho: 0.55 },
      { name: `Seating (${Math.round(occupancy * 100)} % occupied)`, area: seatingArea, abs: mix(P.ABSORPTION.pewsEmpty, P.ABSORPTION.pewsOccupied, occupancy), rho: 0.2 },
      { name: 'Plaster walls', area: walls, abs: P.ABSORPTION.plaster, rho: 0.78 },
      { name: P.ROOF_FINISHES[roof].label, area: roofArea, abs: P.ABSORPTION[P.ROOF_FINISHES[roof].absorption], rho: P.ROOF_FINISHES[roof].reflectance },
      { name: 'Timber columns and beams', area: timber, abs: P.ABSORPTION.timberSolid, rho: 0.25 },
      { name: `Inner wall openings (${Math.round(openings * 100)} % open)`, area: innerOpenings, abs: mix(P.ABSORPTION.glass, P.ABSORPTION.opening, openings), rho: 0.1 * (1 - openings) },
      { name: 'Main doors', area: doorArea, abs: mix(P.ABSORPTION.timberDoor, P.ABSORPTION.opening, openings), rho: 0.3 * (1 - openings) }
    ];
    if (bannerArea > 0) surfaces.push({ name: 'Fabric banners', area: bannerArea, abs: P.ABSORPTION.banner, rho: 0.5 });
    const slats = P.ENTRANCE_FINISHES[opt.entranceFinish]?.area || 0;
    if (slats > 0) {
      surfaces[2].area -= slats;
      surfaces.push({ name: 'Timber slat acoustic panels, entrance hall', area: slats, abs: P.ABSORPTION.slatPanels, rho: 0.35 });
    }
    const S = surfaces.reduce((s, x) => s + x.area, 0);
    const tempC = opt.tempC ?? 28, rh = opt.rh ?? 75;
    const airDb = P.airAttenuationDb(tempC, rh);
    const m = airDb.map(a => a / (10 * Math.log10(Math.E)));
    const A = P.OCTAVES.map((_, b) => surfaces.reduce((s, x) => s + x.area * x.abs[b], 0));
    const alpha = A.map(a => a / S);
    const c = P.speedOfSound(tempC), K = P.reverbConstant(c);
    const T = alpha.map((a, b) => K * V / (-S * Math.log(1 - Math.min(a, 0.99)) + 4 * m[b] * V));
    const Tsabine = A.map((a, b) => K * V / (a + 4 * m[b] * V));
    const meanReflectance = surfaces.reduce((s, x) => s + x.area * x.rho, 0) / S;
    return { V, S, A, alpha, T, Tsabine, Tmid: (T[2] + T[3]) / 2, surfaces, airDb, c, K,
      occupancy, openings, roofFinish: roof, entranceFinish: slats > 0 ? opt.entranceFinish : 'plaster', light: { area: S, meanReflectance } };
  };

  /* Loudspeaker directivity: spec.hb / spec.vb are the −6 dB full coverage
     angles per octave band (125 Hz … 8 kHz). Returns attenuation (dB ≤ 0). */
  P.directivityDb = function (spec, hDeg, vDeg, band) {
    const H = spec.hb[band], Vc = spec.vb[band];
    const rear = spec.rear ? spec.rear[band] : [6, 9, 12, 15, 18, 20, 22][band];
    const q = (H >= 360 ? 0 : (hDeg / (H / 2)) ** 2) + (Vc >= 360 ? 0 : (vDeg / (Vc / 2)) ** 2);
    const off = Math.max(Math.abs(hDeg), Math.abs(vDeg));
    const blend = smoothstep(80, 150, off);
    return -Math.min(rear, 6 * q * (1 - blend) + rear * blend);
  };
  const qCache = new Map();
  // On-axis directivity factor Q = 4π / ∫ D² dΩ.
  P.directivityQ = function (spec, band) {
    const key = spec.hb[band] + '|' + spec.vb[band] + '|' + (spec.rear ? spec.rear[band] : '-') + '|' + band;
    if (qCache.has(key)) return qCache.get(key);
    let sum = 0;
    const N = 72, M = 36;
    for (let i = 0; i < N; i++) {
      const az = (i + 0.5) / N * 2 * PI - PI;
      for (let j = 0; j < M; j++) {
        const el = (j + 0.5) / M * PI - PI / 2;
        const fx = Math.cos(el) * Math.cos(az), fy = Math.cos(el) * Math.sin(az), fz = Math.sin(el);
        const h = Math.atan2(fy, fx) * 180 / PI, v = Math.atan2(fz, Math.hypot(fx, fy)) * 180 / PI;
        sum += undb(P.directivityDb(spec, h, v, band)) * Math.cos(el);
      }
    }
    const Q = 4 * PI / (sum * (2 * PI / N) * (PI / M));
    qCache.set(key, Q);
    return Q;
  };
  // Horizontal / vertical off-axis angles (deg) of unit vector d in frame (f, r, u).
  P.offAxis = function (d, f, r, u) {
    const df = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
    const dr = d[0] * r[0] + d[1] * r[1] + d[2] * r[2];
    const du = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
    return { h: Math.atan2(dr, df) * 180 / PI, v: Math.atan2(du, Math.hypot(df, dr)) * 180 / PI };
  };

  P.bandsFromDbA = function (dBA, shape) {
    const weighted = shape.reduce((s, x, i) => s + undb(x + P.A_WEIGHT[i]), 0);
    const offset = dBA - db(weighted);
    return shape.map(s => s + offset);
  };
  P.dbaFromBands = bands => db(bands.reduce((s, L, i) => s + undb(L + P.A_WEIGHT[i]), 0));
  P.sumBands = (a, b) => a.map((L, i) => db(undb(L) + undb(b[i])));

  /* Energy arriving at receiver rx from one source, per band (mean-square
     pressure re 20 µPa, i.e. 10^(L/10)). src: {pos, f, r, u, level1m, delayMs,
     response[], lineLength}. level1m is the A-weighted programme level 1 m
     on axis. Barron's revised theory supplies the reflected energy. */
  P.sourceArrivals = function (src, spec, rx, room, occluders, spectrum) {
    const rf = src.reverbFactor;
    const shape = spectrum || P.SPEECH_SPECTRUM;
    const vx = rx[0] - src.pos[0], vy = rx[1] - src.pos[1], vz = rx[2] - src.pos[2];
    const r = Math.max(0.3, Math.hypot(vx, vy, vz));
    const d = [vx / r, vy / r, vz / r];
    const ang = P.offAxis(d, src.f, src.r, src.u);
    // Near field of a line array: listeners below or above it are served by the
    // nearest elements, so the vertical angle is taken to the closest point.
    let angNear = ang;
    if (src.lineLength) {
      const along = Math.max(-src.lineLength / 2, Math.min(src.lineLength / 2, vx * src.u[0] + vy * src.u[1] + vz * src.u[2]));
      const nx = vx - src.u[0] * along, ny = vy - src.u[1] * along, nz = vz - src.u[2] * along, nr = Math.hypot(nx, ny, nz) || 1;
      angNear = P.offAxis([nx / nr, ny / nr, nz / nr], src.f, src.r, src.u);
    }
    const columnShadow = occluders ? occluders.blockedByColumn(src.pos, rx) : false;
    const wallShadow = occluders && occluders.walls ? occluders.blockedByWall(src.pos, rx) : false;
    const direct = [], reflected = [], barronK = 16 * PI / (room.K || P.reverbConstant(room.c));
    for (let b = 0; b < 7; b++) {
      const L1 = src.level1m + shape[b] + (src.response ? src.response[b] : 0);
      const rt = src.lineLength ? src.lineLength * src.lineLength * P.OCTAVES[b] / (2 * room.c) : 0;
      const spread = rt > 1 && r < rt ? 1 / (r * rt) : 1 / (r * r);
      const w = rt > 1 ? Math.min(1, r / rt) : 1;
      const v = angNear.v + (ang.v - angNear.v) * w;
      const dir = P.directivityDb(spec, ang.h, v, b);
      const occ = (columnShadow ? P.COLUMN_SHADOW[b] : 0) + (wallShadow ? P.WALL_SHADOW[b] : 0);
      direct.push(undb(L1 + dir - room.airDb[b] * r + occ) * spread);
      const T = room.T[b];
      // Barron: 31200·T/V·e^(−0.04 r/T) re the direct sound at 10 m, i.e. 16π/K
      // and 13.82/c with the room's own speed of sound.
      reflected.push(undb(L1) * barronK * T * Math.exp(-13.82 * r / (room.c * T)) / (room.V * P.directivityQ(spec, b)) * (rf ? rf[b] : 1) * (src.coupling ?? 1));
    }
    return { r, tau: r / room.c + (src.delayMs || 0) / 1000, direct, reflected, angle: ang, shadowed: columnShadow || wallShadow };
  };

  /* Fraction of a loudspeaker's radiated energy (per band) whose first hit is
     the seated congregation. That energy is largely absorbed at first incidence
     and does not feed the reverberant field, which is why directional columns
     aimed at people outperform sources that spray walls and roof. */
  P.audienceFraction = function (src, spec, isAudience, planeY = 1.0) {
    const out = [0, 0, 0, 0, 0, 0, 0], tot = [0, 0, 0, 0, 0, 0, 0];
    const N = 96, M = 48;
    for (let i = 0; i < N; i++) {
      const az = (i + 0.5) / N * 2 * PI - PI;
      for (let j = 0; j < M; j++) {
        const el = (j + 0.5) / M * PI - PI / 2;
        const ce = Math.cos(el);
        const lf = ce * Math.cos(az), lr = ce * Math.sin(az), lu = Math.sin(el);
        const d = [src.f[0] * lf + src.r[0] * lr + src.u[0] * lu, src.f[1] * lf + src.r[1] * lr + src.u[1] * lu, src.f[2] * lf + src.r[2] * lr + src.u[2] * lu];
        const h = Math.atan2(lr, lf) * 180 / PI, v = el * 180 / PI;
        let hit = false;
        if (d[1] < -1e-3) {
          const t = (planeY - src.pos[1]) / d[1];
          if (t > 0) hit = isAudience(src.pos[0] + d[0] * t, src.pos[2] + d[2] * t);
        }
        for (let b = 0; b < 7; b++) {
          const w = undb(P.directivityDb(spec, h, v, b)) * ce;
          tot[b] += w; if (hit) out[b] += w;
        }
      }
    }
    return out.map((v, b) => tot[b] > 0 ? v / tot[b] : 0);
  };

  function mtfBand(arrivals, b, F, T) {
    let re = 0, im = 0, total = 0;
    const k = 2 * PI * F * T / 13.82, dd = 1 + k * k;
    for (const a of arrivals) {
      const ph = -2 * PI * F * a.tau, c = Math.cos(ph), s = Math.sin(ph);
      re += a.direct[b] * c + a.reflected[b] * (c + s * k) / dd;
      im += a.direct[b] * s + a.reflected[b] * (s - c * k) / dd;
      total += a.direct[b] + a.reflected[b];
    }
    return total > 0 ? Math.hypot(re, im) / total : 0;
  }
  function maskingDb(L) {
    if (L < 63) return 0.5 * L - 65;
    if (L < 67) return 1.8 * L - 146.9;
    if (L < 100) return 0.5 * L - 59.8;
    return -10;
  }
  // STI (IEC 60268-16, male weighting) from speech arrivals and noise bands (dB).
  P.sti = function (arrivals, noiseBands, room) {
    const Ls = [];
    for (let b = 0; b < 7; b++) {
      let e = 0;
      for (const a of arrivals) e += a.direct[b] + a.reflected[b];
      Ls.push(db(e));
    }
    const I = Ls.map((L, b) => undb(L) + undb(noiseBands[b]));
    const mti = [];
    for (let b = 0; b < 7; b++) {
      const noiseFactor = 1 / (1 + undb(noiseBands[b] - Ls[b]));
      const Iam = b > 0 ? I[b - 1] * undb(maskingDb(db(I[b - 1]))) : 0;
      const corr = I[b] / (I[b] + Iam + undb(P.RECEPTION_THRESHOLD[b]));
      let ti = 0;
      for (const F of P.MOD_FREQS) {
        const m = clamp(mtfBand(arrivals, b, F, room.T[b]) * noiseFactor * corr, 1e-6, 0.999999);
        ti += (clamp(10 * Math.log10(m / (1 - m)), -15, 15) + 15) / 30;
      }
      mti.push(ti / P.MOD_FREQS.length);
    }
    let sti = 0;
    for (let b = 0; b < 7; b++) sti += P.STI_ALPHA[b] * mti[b];
    for (let b = 0; b < 6; b++) sti -= P.STI_BETA[b] * Math.sqrt(mti[b] * mti[b + 1]);
    return { sti: clamp(sti, 0, 1), mti, speechBands: Ls, speechDbA: P.dbaFromBands(Ls) };
  };
  P.stiRating = s => s >= 0.75 ? 'Excellent' : s >= 0.60 ? 'Good' : s >= 0.45 ? 'Fair' : s >= 0.30 ? 'Poor' : 'Bad';

  /* Echo risk (precedence): the reference is the earliest arrival within 10 dB
     of the strongest one; a later arrival ≥ 50 ms behind it and within 10 dB of
     the strongest is likely heard as a separate echo. */
  P.echoCheck = function (arrivals) {
    if (arrivals.length < 2) return null;
    const lv = arrivals.map(a => ({ tau: a.tau, L: db(a.direct[3] + a.direct[4]) }));
    const Lmax = Math.max(...lv.map(a => a.L));
    const ref = lv.filter(a => a.L >= Lmax - 10).reduce((m, a) => a.tau < m.tau ? a : m);
    let worst = null;
    for (const a of lv) {
      const gap = (a.tau - ref.tau) * 1000;
      if (gap > 50 && a.L >= Lmax - 10) {
        const severity = a.L - Lmax + 10;
        if (!worst || severity > worst.severity) worst = { gapMs: gap, severity, levelDiff: a.L - ref.L };
      }
    }
    return worst;
  };

  /* Feedback estimate at a cardioid microphone with the talker 0.4 m away.
     margin = talker level at mic − loudspeaker level returning to it (worst
     band 250 Hz–4 kHz) − 6 dB stability margin. Positive is stable. */
  P.feedbackMargin = function (speakers, mic, room, talkerLevel1m = 62, talkerDistance = 0.4) {
    const Lt = talkerLevel1m + 20 * Math.log10(1 / talkerDistance);
    const back = [0, 0, 0, 0, 0, 0, 0];
    for (const sp of speakers) {
      const a = P.sourceArrivals(sp.src, sp.spec, mic.pos, room, null, P.FLAT_SPECTRUM);
      const v = [sp.src.pos[0] - mic.pos[0], sp.src.pos[1] - mic.pos[1], sp.src.pos[2] - mic.pos[2]];
      const cosM = (v[0] * mic.dir[0] + v[1] * mic.dir[1] + v[2] * mic.dir[2]) / a.r;
      const cardioid = ((1 + cosM) / 2) ** 2;
      for (let b = 0; b < 7; b++) back[b] += a.direct[b] * cardioid + a.reflected[b] / 3;
    }
    let worst = -Infinity;
    for (let b = 1; b <= 5; b++) worst = Math.max(worst, db(back[b]));
    return Lt - worst - 6;
  };

  /* --------------------------------------------------------------- air speed */
  // Occupied-zone air speed (m/s) at p from one fan. fan: {kind:'ceiling'|'jet',
  // pos, diameter, flow (m³/s), floorY, yaw, tilt (rad), oscillate, sweepDeg}.
  P.fanAirSpeed = function (fan, p, blockage = 1) {
    if (!fan.flow || fan.flow <= 0 || fan.kind === 'exhaust') return 0; // exhaust fans ventilate; no draught at seats
    const D = fan.diameter, u0 = fan.flow / (PI * D * D / 4);
    if (fan.kind === 'ceiling') {
      const r = Math.hypot(p[0] - fan.pos[0], p[2] - fan.pos[2]);
      const drop = Math.max(0.2, fan.pos[1] - p[1]);
      const b = D / 2 + 0.16 * drop;
      const core = u0 * Math.min(1.15, 1.15 * (D / 2) / b) * Math.exp(-((r / b) ** 2));
      const floorDrop = Math.max(0.5, fan.pos[1] - (fan.floorY ?? 0));
      const bf = D / 2 + 0.16 * floorDrop;
      const ucFloor = u0 * Math.min(1.15, 1.15 * (D / 2) / bf);
      const heightPenalty = 1 / (1 + 0.12 * Math.max(0, floorDrop - 2.5));
      const wallJet = 0.6 * Math.sqrt(fan.flow * ucFloor) * heightPenalty / Math.max(r, 0.6 * D);
      return Math.hypot(core, wallJet * smoothstep(0.2 * D, 0.9 * D, r)) * blockage;
    }
    const vx = p[0] - fan.pos[0], vy = p[1] - fan.pos[1], vz = p[2] - fan.pos[2];
    if (Math.hypot(vx, vy, vz) < 0.2) return u0;
    const sweep = fan.oscillate ? fan.sweepDeg * PI / 180 : 0;
    const steps = sweep > 0 ? 11 : 1;
    let best = Infinity, axial = 0, radial = 0;
    const ct = Math.cos(fan.tilt), st = Math.sin(fan.tilt);
    for (let i = 0; i < steps; i++) {
      const yaw = fan.yaw + (steps > 1 ? (i / (steps - 1) - 0.5) * sweep : 0);
      const ax = [Math.cos(yaw) * ct, st, Math.sin(yaw) * ct];
      const s1 = vx * ax[0] + vy * ax[1] + vz * ax[2];
      if (s1 <= 0) continue;
      const rr = Math.hypot(vx - s1 * ax[0], vy - s1 * ax[1], vz - s1 * ax[2]);
      const score = rr / (D / 2 + 0.11 * s1);
      if (score < best) { best = score; axial = s1; radial = rr; }
    }
    if (!axial) return 0;
    const b = D / 2 + 0.11 * axial;
    let u = u0 * Math.min(1, 4 * D / Math.max(axial, 0.1)) * Math.exp(-((radial / b) ** 2));
    if (sweep > 0) u *= Math.sqrt(Math.min(1, 2 * Math.atan(b / Math.max(axial, 0.1)) / sweep));
    return u * blockage;
  };
  P.combineAirSpeeds = speeds => Math.sqrt(speeds.reduce((s, v) => s + v * v, 0));
  // Approximate sedentary cooling effect (°C) of elevated air speed, warm, ~0.5 clo.
  P.coolingEffect = function (v) {
    const t = [[0.1, 0], [0.2, 0.4], [0.3, 1.0], [0.5, 1.8], [0.8, 2.6], [1.2, 3.3], [1.6, 3.8]];
    if (v <= t[0][0]) return 0;
    for (let i = 1; i < t.length; i++) if (v <= t[i][0]) {
      const [a, ca] = t[i - 1], [b, cb] = t[i];
      return ca + (cb - ca) * (v - a) / (b - a);
    }
    return t[t.length - 1][1];
  };

  root.CHURCH_SIM_PHYSICS = P;
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
