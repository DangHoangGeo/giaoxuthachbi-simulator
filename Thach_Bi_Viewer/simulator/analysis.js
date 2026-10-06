/* Thạch Bi simulator · analysis. Grids and seat statistics for light, sound,
 * speech intelligibility, air movement and background noise; the coloured
 * overlay; and design-rule checks. Computation is time-sliced so the 3D view
 * stays responsive. All values are estimates from the physics module.
 */
(() => {
  'use strict';
  const P = window.CHURCH_SIM_PHYSICS;
  const CAT = window.CHURCH_SIM_CATALOG;
  const SIM = window.CHURCH_SIMULATOR;
  let T, overlayMesh = null, job = 0, latest = {};

  const KINDS = {
    lux: { label: 'Light on books', unit: 'lux', height: 0.8, step: 0.5, target: [200, 300],
      stops: [[0, '#17204a'], [50, '#23408f'], [100, '#2c7fb8'], [150, '#41b6c4'], [200, '#5fc06b'], [300, '#a8d84e'], [500, '#f4d03f'], [750, '#f39c34'], [1100, '#d7301f']] },
    spl: { label: 'Speech level', unit: 'dBA', height: 1.2, step: 1.0, target: [68, 76],
      stops: [[50, '#2b3a8c'], [58, '#3a6fc0'], [64, '#41b6c4'], [68, '#5fc06b'], [74, '#a8d84e'], [78, '#f4d03f'], [82, '#f39c34'], [88, '#d7301f']] },
    sti: { label: 'Speech intelligibility', unit: 'STI', height: 1.2, step: 1.0, target: [0.6, 1],
      stops: [[0.2, '#a50026'], [0.3, '#d73027'], [0.45, '#f39c34'], [0.52, '#f4d03f'], [0.6, '#91cf60'], [0.68, '#3fae5a'], [0.75, '#1a9850'], [0.9, '#0f6f3a']] },
    air: { label: 'Air speed (seated)', unit: 'm/s', height: 0.6, step: 0.5, target: [0.3, 0.8],
      stops: [[0, '#d9d9d9'], [0.15, '#9ecae1'], [0.3, '#5fc06b'], [0.55, '#3fae5a'], [0.8, '#a8d84e'], [1.0, '#f4d03f'], [1.3, '#f39c34'], [1.8, '#d7301f']] },
    noise: { label: 'Background noise', unit: 'dBA', height: 1.2, step: 1.0, target: [0, 40],
      stops: [[30, '#1a9850'], [36, '#66bd63'], [40, '#a6d96a'], [44, '#fee08b'], [48, '#fdae61'], [52, '#f46d43'], [58, '#d73027']] }
  };

  const A = SIM.analysis = { KINDS, run, results: latest, sampleLux, pointValues, checks: [], legend: kind => KINDS[kind], busy: false, colorFor };

  function colorFor(kind, v) {
    const stops = KINDS[kind].stops;
    if (v <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i];
      return mixHex(ca, cb, (v - a) / (b - a));
    }
    return stops[stops.length - 1][1];
  }
  function mixHex(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (p, s) => (p >> s) & 255;
    const m = s => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
    return '#' + ((1 << 24) + (m(16) << 16) + (m(8) << 8) + m(0)).toString(16).slice(1);
  }

  /* --------------------------------------------------------------- domain */
  function inDomain(x, z) {
    const az = Math.abs(z);
    if (x < 2.75 || x > 52.7) return false;
    if (az <= 7.18) {
      for (const c of SIM.GEO.columns) if (Math.hypot(x - c.x, z - c.z) < 0.45) return false;
      return true;
    }
    if (x < 5.6) return false; // tower bases beside the entrance hall
    if (az >= 7.75 && az <= 10.15) return true;
    if (x >= 37.3 && x <= 43.8 && az <= 12.85) return true;
    return false;
  }
  function zoneOf(x, z) {
    const az = Math.abs(z);
    const p = [x, SIM.floorY(x, z) + 0.6, z];
    if (!SIM.isInterior(p)) return SIM.roomCouplingAt(p) > 0 ? 'veranda' : 'outside';
    if (SIM.inWing(x, z)) return 'wing';
    if (az > 7.25) return 'veranda';
    if (x >= 39.75 && x <= 48.65 && az <= 3.6) return 'sanctuary';
    if (x > 38.2) return 'sanctuary-side';
    const seated = SIM.GEO.seats.some(s => Math.abs(s.x - x) < 0.6 && Math.abs(s.z - z) < 0.6);
    if (seated) return az > 4 ? 'outer' : 'central';
    return 'aisle';
  }

  /* ------------------------------------------------------------- per point */
  function lightContext() {
    const emitters = SIM.emitters();
    const room = SIM.room();
    const interiorFlux = emitters.reduce((s, e) => s + (e.interior ? e.lumens : 0), 0);
    return { emitters, Eind: P.indirectIlluminance(interiorFlux, room.light), mf: SIM.state.settings.maintenance, occ: SIM.GEO.occluders };
  }
  function luxAt(lc, x, y, z) {
    const direct = P.illuminance([x, y, z], [0, 1, 0], lc.emitters, lc.occ);
    // Inter-reflected light: full in the nave, partly in the wings (open to the
    // veranda on one side), a little spill onto the verandas.
    const coupling = SIM.roomCouplingAt([x, y, z]);
    const ind = coupling === 1 ? lc.Eind * (SIM.inWing(x, z) ? 0.6 : 1) : coupling > 0 ? lc.Eind * 0.35 : 0;
    return (direct + ind) * lc.mf;
  }
  function soundContext() {
    const s = SIM.state.settings;
    const room = SIM.room();
    const speakers = SIM.speakers().filter(sp => sp.on);
    const fans = SIM.fans().filter(f => f.running);
    const talker = s.talker ? talkerSource() : null;
    const ambient = P.bandsFromDbA(s.ambientDbA, P.AMBIENT_SPECTRUM);
    // Each fan: free-field level at 1 m plus its reverberant contribution.
    const fanSpecs = fans.map(f => ({ f, bands: P.bandsFromDbA(f.dBA, P.FAN_SPECTRUM), coupling: SIM.roomCouplingAt(f.pos) || 0.05 }));
    const A = room.A;
    const reverbNoise = [0, 0, 0, 0, 0, 0, 0];
    for (const { bands, coupling } of fanSpecs) for (let b = 0; b < 7; b++) {
      const Lw = bands[b] + 11; // sound power from the 1 m free-field level (Q≈1)
      reverbNoise[b] += coupling * P.undb(Lw + 10 * Math.log10(4 / (A[b] + 4 * room.airDb[b] / 4.343 * room.V)));
    }
    return { room, speakers, fans: fanSpecs, talker, ambient, reverbNoise, occ: SIM.GEO.occluders };
  }
  function talkerSource() {
    const mic = SIM.mics()[0];
    const pos = mic ? [mic.pos[0] + 0.45 * mic.dir[0], mic.pos[1] + 0.05, mic.pos[2] + 0.45 * mic.dir[2]] : [42.95, 2.3, -2.62];
    const yaw = mic ? Math.atan2(-mic.dir[2], -mic.dir[0]) * 180 / Math.PI : 180;
    const spec = { id: 'voice', hb: [360, 360, 300, 230, 180, 160, 150], vb: [360, 360, 300, 230, 180, 160, 150], rear: [2, 3, 5, 7, 9, 11, 12] };
    const fr = SIM.worldFrame({ yaw, tilt: 0 });
    return { spec, src: { pos, ...fr, level1m: SIM.state.settings.talkerDbA, delayMs: 0 } };
  }
  function noiseAt(sc, x, y, z) {
    const out = [];
    const receiver = [x, y, z], receiverCoupling = SIM.roomCouplingAt(receiver);
    // Wall intersections and distance are shared by all seven octave bands.
    const direct = sc.fans.map(({ f, bands }) => ({ bands,
      distance2: Math.max(0.25, (x - f.pos[0]) ** 2 + (y - f.pos[1]) ** 2 + (z - f.pos[2]) ** 2),
      blocked: !!sc.occ?.blockedByWall(f.pos, receiver) }));
    for (let b = 0; b < 7; b++) {
      let e = P.undb(sc.ambient[b]) + sc.reverbNoise[b] * receiverCoupling;
      for (const { bands, distance2, blocked } of direct) {
        e += P.undb(bands[b] + (blocked ? P.WALL_SHADOW[b] : 0)) / distance2;
      }
      out.push(P.db(e));
    }
    return out;
  }
  function soundAt(sc, x, y, z) {
    const rx = [x, y, z], coupling = SIM.roomCouplingAt(rx);
    const arrivals = sc.speakers.map(sp => P.sourceArrivals(sp.src, sp.spec, rx, sc.room, sc.occ, undefined, coupling));
    if (sc.talker) arrivals.push(P.sourceArrivals(sc.talker.src, sc.talker.spec, rx, sc.room, sc.occ, undefined, coupling));
    const noise = noiseAt(sc, x, y, z);
    if (!arrivals.length) return { sti: null, spl: null, noise: P.dbaFromBands(noise), echo: null };
    const r = P.sti(arrivals, noise, sc.room);
    return { sti: r.sti, spl: r.speechDbA, noise: P.dbaFromBands(noise), echo: P.echoCheck(arrivals), mti: r.mti };
  }
  function airContext() { return { fans: SIM.fans().filter(f => f.running), occ: SIM.GEO.occluders }; }
  function airAt(ac, x, y, z) {
    const seated = SIM.GEO.seats.some(s => Math.abs(s.x - x) < 0.6 && Math.abs(s.z - z) < 0.6);
    const blockage = seated ? 0.85 : 1;
    return P.combineAirSpeeds(ac.fans.map(f => ac.occ?.blockedByWall(f.pos, [x, y, z]) ? 0 : P.fanAirSpeed(f, [x, y, z], blockage)));
  }

  // Exact values at one point (walk readout, listening panel). Aisles and
  // verandas also report light on the floor, where the brief sets its target.
  function pointValues(x, z, eyeY) {
    const fy = SIM.floorY(x, z);
    const lc = lightContext(), sc = soundContext(), ac = airContext();
    const s = soundAt(sc, x, eyeY ?? fy + 1.2, z);
    const air = airAt(ac, x, fy + 0.6, z);
    const zone = zoneOf(x, z);
    const floorLux = ['aisle', 'veranda', 'outside'].includes(zone) ? luxAt(lc, x, fy + 0.02, z) : null;
    const seat = SIM.GEO.seats.filter(s => Math.abs(s.x - x) < 0.6 && Math.abs(s.z - z) < 0.6)
      .sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0];
    const bookX = x + (seat ? seat.book?.[0] ?? 0.25 : 0), bookZ = z + (seat?.book?.[1] ?? 0);
    return { lux: luxAt(lc, bookX, fy + 0.8, bookZ), floorLux, ...s, air, cooling: P.coolingEffect(air), zone };
  }
  function sampleLux(x, z) {
    const g = latest.lux;
    if (!g) return null;
    const i = Math.round((x - g.x0) / g.step), j = Math.round((z - g.z0) / g.step);
    if (i < 0 || j < 0 || i >= g.nx || j >= g.nz) return null;
    const v = g.values[j * g.nx + i];
    return Number.isFinite(v) ? v : null;
  }

  /* ------------------------------------------------------------ run grids */
  function run(kinds) {
    const id = ++job;
    A.busy = true;
    SIM.emit('analysis-start');
    const want = kinds || ['seats', SIM.state.settings.overlay].filter(k => k && k !== 'none');
    const tasks = [];
    if (want.includes('seats')) tasks.push(seatTask());
    for (const k of want) if (KINDS[k]) tasks.push(gridTask(k));
    tasks.push(checksTask());
    let t = 0;
    const step = () => {
      if (id !== job) return;
      const until = performance.now() + 14;
      while (t < tasks.length && performance.now() < until) {
        const done = tasks[t].next();
        if (done) t++;
      }
      if (t < tasks.length) setTimeout(step, 0);
      else {
        A.busy = false;
        if (SIM.state.settings.overlay !== 'none') buildOverlay(SIM.state.settings.overlay);
        else clearOverlay();
        SIM.emit('analysis', latest);
      }
    };
    setTimeout(step, 0);
  }
  function gridTask(kind) {
    const K = KINDS[kind];
    const step = K.step, x0 = 2.75, x1 = 52.7, z0 = -12.85, z1 = 12.85;
    const nx = Math.floor((x1 - x0) / step) + 1, nz = Math.floor((z1 - z0) / step) + 1;
    const values = new Float32Array(nx * nz).fill(NaN);
    const ctx = kind === 'lux' ? lightContext() : kind === 'air' ? airContext() : soundContext();
    let j = 0;
    return {
      next() {
        const z = z0 + j * step;
        for (let i = 0; i < nx; i++) {
          const x = x0 + i * step;
          if (!inDomain(x, z)) continue;
          const fy = SIM.floorY(x, z), y = fy + K.height;
          let v;
          if (kind === 'lux') v = luxAt(ctx, x, y, z);
          else if (kind === 'air') v = airAt(ctx, x, y, z);
          else if (kind === 'noise') v = P.dbaFromBands(noiseAt(ctx, x, y, z));
          else { const s = soundAt(ctx, x, y, z); v = kind === 'sti' ? s.sti : s.spl; }
          values[j * nx + i] = v ?? NaN;
        }
        j++;
        if (j >= nz) { latest[kind] = { kind, x0, z0, step, nx, nz, values, height: K.height, at: Date.now() }; return true; }
        return false;
      }
    };
  }
  function seatTask() {
    const seats = SIM.GEO.seats;
    const lc = lightContext(), sc = soundContext(), ac = airContext();
    const out = [];
    let i = 0;
    return {
      next() {
        const end = Math.min(seats.length, i + 12);
        for (; i < end; i++) {
          const s = seats[i];
          const fy = s.y;
          const snd = soundAt(sc, s.x, fy + 1.2, s.z);
          const air = airAt(ac, s.x, fy + 0.6, s.z);
          out.push({ ...s, lux: luxAt(lc, s.x + (s.book?.[0] ?? 0.25), fy + 0.8, s.z + (s.book?.[1] ?? 0)), sti: snd.sti, spl: snd.spl, noise: snd.noise, echo: snd.echo, air, cooling: P.coolingEffect(air) });
        }
        if (i >= seats.length) { latest.seats = summarize(out); return true; }
        return false;
      }
    };
  }
  const stats = P.statistics;
  function summarize(seats) {
    const pct = (f, list = seats) => list.length ? 100 * list.filter(f).length / list.length : 0;
    const blocks = {};
    for (const b of ['central', 'outer', 'long', 'wing']) {
      const l = seats.filter(s => s.block === b);
      if (l.length) blocks[b] = { n: l.length, lux: stats(l.map(s => s.lux)), sti: stats(l.map(s => s.sti)), air: stats(l.map(s => s.air)) };
    }
    return {
      seats, n: seats.length, blocks,
      lux: stats(seats.map(s => s.lux)), sti: stats(seats.map(s => s.sti)), spl: stats(seats.map(s => s.spl), true), noise: stats(seats.map(s => s.noise), true), air: stats(seats.map(s => s.air)),
      cooling: stats(seats.map(s => s.cooling)),
      luxOk: pct(s => s.lux >= 200), luxLow: pct(s => s.lux < 150),
      stiOk: pct(s => s.sti !== null && s.sti >= 0.6), stiFair: pct(s => s.sti !== null && s.sti >= 0.5),
      airOk: pct(s => s.air >= 0.3 && s.air <= 0.8), airStrong: pct(s => s.air > 1.0), echoSeats: seats.filter(s => s.echo).length,
      splSpread: (() => { const s = stats(seats.map(s => s.spl), true); return s ? s.p95 - s.p05 : null; })()
    };
  }

  /* ---------------------------------------------------------------- checks */
  function checksTask() {
    let done = false;
    return { next() { if (!done) { A.checks = runChecks(); done = true; } return true; } };
  }
  function runChecks() {
    const out = [];
    const add = (level, title, detail, ids = []) => out.push({ level, title, detail, ids });
    const items = SIM.state.items.filter(i => !i.hidden);
    const fans = SIM.fans().filter(f => f.running);
    const emitters = SIM.emitters();
    // 1. Strobe / flicker: a light shining through spinning blades.
    for (const f of fans) {
      const R = f.diameter / 2;
      const axisDown = f.kind === 'ceiling';
      if (!axisDown) continue;
      for (const e of emitters) {
        if (e.pos[1] < f.pos[1] + 0.15) continue;
        const dx = f.pos[0] - e.pos[0], dz = f.pos[2] - e.pos[2], dy = f.pos[1] - e.pos[1];
        let hit = 0;
        for (let k = 0; k < 12; k++) {
          const a = k / 12 * 2 * Math.PI;
          for (const rr of [R * 0.4, R * 0.75, R]) {
            const px = dx + Math.cos(a) * rr, pz = dz + Math.sin(a) * rr, d = Math.hypot(px, dy, pz);
            const l = [px / d, dy / d, pz / d];
            let I = e.cd;
            if (e.kind === 'spot') I *= P.smoothstep(e.cosOuter, e.cosInner, l[0] * e.dir[0] + l[1] * e.dir[1] + l[2] * e.dir[2]);
            // Illuminance contribution under the fan relative to 50 lux.
            hit = Math.max(hit, I / ((f.pos[1] - SIM.floorY(f.pos[0], f.pos[2])) ** 2 + d * d));
          }
        }
        if (hit > 30) {
          const fanItem = SIM.item(f.id), lightItem = SIM.item(e.id.split('+')[0]);
          add(hit > 120 ? 'error' : 'warn', 'Light shines through fan blades',
            `${lightItem?.name || 'A light'} is above ${fanItem?.name}. The blades will cast a flickering shadow (≈${Math.round(hit)} lux modulated). Move the light, aim it away, or mount it below the blades.`, [f.id, lightItem?.id].filter(Boolean));
        }
      }
    }
    // 2. Clearances for fans and pendants.
    const solids = SIM.GEO.columns.map(c => ({ x: c.x, z: c.z, r: 0.42, label: 'column' }));
    const pairs = new Set();
    for (const f of SIM.fans()) {
      const it = SIM.item(f.id);
      if (f.kind !== 'ceiling') continue;
      const R = f.diameter / 2, fy = SIM.floorY(f.pos[0], f.pos[2]);
      if (f.pos[1] - fy < 2.4) add('error', 'Fan blades too low', `${it.name}: blades ${(f.pos[1] - fy).toFixed(2)} m above the floor (keep ≥ 2.4 m).`, [f.id]);
      if (f.pos[1] - fy > 4.2 && f.diameter < 2) add('info', 'Fan mounted high', `${it.name}: blades ${(f.pos[1] - fy).toFixed(1)} m up. Air speed at the seats drops when small fans hang above ~3.5 m.`, [f.id]);
      for (const c of solids) if (Math.hypot(f.pos[0] - c.x, f.pos[2] - c.z) < R + c.r + 0.3) add('error', 'Fan blade clearance', `${it.name} is within 0.3 m of a ${c.label}.`, [f.id]);
      const wallGap = 7.25 - Math.abs(f.pos[2]) - R;
      if (Math.abs(f.pos[2]) < 7.25 && wallGap < 0.45) add('warn', 'Fan close to the wall', `${it.name}: ${wallGap.toFixed(2)} m from the inner wall (manufacturers usually ask ≥ 0.45 m).`, [f.id]);
      for (const o of items) {
        const t = CAT.byId[o.type];
        if (o.id === f.id || !(t.id.startsWith('chandelier') || t.fan?.kind === 'ceiling')) continue;
        const r2 = t.fan ? t.fan.diameter / 2 : t.id === 'chandelier12' ? 1.3 : 1.0;
        const gap = Math.hypot(f.pos[0] - o.pos[0], f.pos[2] - o.pos[2]) - R - r2;
        const overlapY = Math.abs((f.pos[1]) - (o.pos[1] - 0.6)) < 1.6;
        const key = [f.id, o.id].sort().join('|');
        if (gap < 0.5 && overlapY && !pairs.has(key) && pairs.add(key)) add('error', 'Fan and pendant clash', `${it.name} and ${o.name} are ${Math.max(0, gap).toFixed(2)} m apart.`, [f.id, o.id]);
      }
    }
    for (const o of items) {
      const t = CAT.byId[o.type];
      if (t.id.startsWith('chandelier')) {
        const fy = SIM.floorY(o.pos[0], o.pos[2]), bottom = o.pos[1] - (t.id === 'chandelier12' ? 1.15 : 1.12);
        if (bottom - fy < 2.6) add('warn', 'Low chandelier', `${o.name}: lowest point ${(bottom - fy).toFixed(2)} m above the floor (keep ≥ 2.6 m over walkways; lamp changes need access).`, [o.id]);
      }
      if (o.mount === 'floor' && t.footprint && Math.abs(o.pos[2]) < 1.15 && o.pos[0] > 6 && o.pos[0] < 38.5 && t.id !== 'carpet') add('warn', 'Item in the centre aisle', `${o.name} narrows the 2.4 m processional / exit route.`, [o.id]);
      if (o.mount === 'floor' && t.footprint) for (const aisle of [[16.225, 17.425], [34.225, 35.425]]) if (o.pos[0] > aisle[0] - 0.3 && o.pos[0] < aisle[1] + 0.3 && Math.abs(o.pos[2]) < 7.2) add('warn', 'Item in a side-door cross aisle', `${o.name} blocks the 1.20 m crossing to the side doors.`, [o.id]);
    }
    // 3. Microphone feedback.
    const sc = soundContext();
    for (const m of SIM.mics()) {
      if (!m.on || !sc.speakers.length) continue;
      const margin = P.feedbackMargin(sc.speakers.map(s => ({ src: s.src, spec: s.spec })), m, sc.room, SIM.state.settings.talkerDbA, SIM.state.settings.micDistance);
      m.item.feedbackMargin = margin;
      if (margin < 0) add('error', 'Feedback risk', `${m.item.name}: about ${(-margin).toFixed(1)} dB short of stable gain. Lower the system level, aim loudspeakers away, move them further from the microphone, or use a headset microphone (talker 5–10 cm).`, [m.id]);
      else if (margin < 3) add('warn', 'Low feedback margin', `${m.item.name}: only ${margin.toFixed(1)} dB of margin.`, [m.id]);
      else add('ok', 'Feedback margin', `${m.item.name}: ${margin.toFixed(1)} dB of stable gain margin.`, [m.id]);
    }
    // 4. Loudspeakers overdriven or aimed at a microphone; wall fans at mics/candles.
    for (const sp of sc.speakers) if (sp.overdriven) add('warn', 'Loudspeaker driven past its rating', `${sp.item.name}: needs ≈${Math.round(sp.peakWatts)} W peaks (rated ${sp.spec.ratedW} W). Lower its level or choose a more sensitive model.`, [sp.id]);
    const sensitive = items.filter(o => CAT.byId[o.type].mic || CAT.byId[o.type].flicker);
    for (const f of fans.filter(f => f.kind === 'jet')) for (const o of sensitive) {
      const v = P.fanAirSpeed(f, [o.pos[0], o.pos[1] + 0.4, o.pos[2]]);
      if (v > 0.35) add('warn', 'Fan blows at ' + (CAT.byId[o.type].mic ? 'a microphone' : 'candles'), `${SIM.item(f.id).name} reaches ${o.name} at ≈${v.toFixed(1)} m/s (wind noise / flame flicker).`, [f.id, o.id]);
    }
    // Ventilation: exhaust fans by air changes per hour of the hall volume.
    const exhaust = fans.filter(f => CAT.byId[SIM.item(f.id).type]?.fan?.exhaust);
    if (exhaust.length) {
      const q = exhaust.reduce((t, f) => t + f.flow, 0) * 3600, V = SIM.room?.()?.V || 7456;
      add('info', 'Ventilation', `${exhaust.length} exhaust fans move ≈${Math.round(q).toLocaleString('en')} m³/h ≈ ${(q / V).toFixed(1)} air changes per hour (comfort target in a hot climate with people: 4–6).`, exhaust.map(f => f.id));
    }
    // Electrical: final circuits above 16 A should be split; the board's main
    // switch must carry everything that can run at once.
    const pw = SIM.powerSummary();
    for (const c of pw.byCircuit) if (c.ratedAmps > 12.8) add('warn', 'Circuit needs splitting', `${c.label}: ${c.ratedAmps.toFixed(1)} A connected; split it so each breaker stays at 16 A or below (${c.mcb} A would need heavier cable).`, []);
    if (pw.ratedAmps > 63 * 0.8) add('warn', 'Main switch overloaded', `All circuits together can draw ${pw.ratedAmps.toFixed(0)} A, more than 80 % of the 63 A main switch.`, []);
    // 5. Results-based notes.
    const s = latest.seats;
    if (s) {
      const target = SIM.sceneLuxTarget?.() ?? 150;
      const dim = target ? 100 * s.seats.filter(x => x.lux < target).length / s.n : 0;
      if (s.lux && target && dim > 10) add('warn', 'Dim seats', `${dim.toFixed(0)} % of seats have less than the ${target} lux this scene is meant to give on the book (maintained).`, []);
      if (s.sti && s.stiOk < 80) add(s.stiOk < 50 ? 'warn' : 'info', 'Speech clarity', `${s.stiOk.toFixed(0)} % of seats reach STI ≥ 0.60 (target: every seat). Average ${s.sti.avg.toFixed(2)}.`, []);
      if (s.echoSeats > 0) add('warn', 'Late arrivals (echo risk)', `${s.echoSeats} seats hear a loudspeaker ≥ 50 ms after the first arrival and within 10 dB. Use “Align delays”.`, []);
      if (s.air && s.airStrong > 5) add('info', 'Strong draughts', `${s.airStrong.toFixed(0)} % of seats above 1.0 m/s — pages and candles may be disturbed; reduce speed there.`, []);
    }
    const order = { error: 0, warn: 1, info: 2, ok: 3 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
  }

  /* --------------------------------------------------------------- overlay */
  function clearOverlay() {
    if (overlayMesh) { overlayMesh.removeFromParent(); overlayMesh.geometry.dispose(); overlayMesh.material.dispose(); overlayMesh = null; }
  }
  function buildOverlay(kind) {
    T = SIM.THREE;
    clearOverlay();
    const g = latest[kind];
    if (!g) return;
    const { nx, nz, x0, z0, step, values } = g;
    const pos = [], col = [], idx = [], map = new Int32Array(nx * nz).fill(-1);
    const c = new T.Color();
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const v = values[j * nx + i];
      if (!Number.isFinite(v)) continue;
      const x = x0 + i * step, z = z0 + j * step;
      map[j * nx + i] = pos.length / 3;
      pos.push(x, SIM.floorY(x, z) + g.height + 0.01, z);
      c.setStyle(colorFor(kind, v));
      col.push(c.r, c.g, c.b);
    }
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = map[j * nx + i], b = map[j * nx + i + 1], d = map[(j + 1) * nx + i], e = map[(j + 1) * nx + i + 1];
      if (a >= 0 && b >= 0 && d >= 0) idx.push(a, d, b);
      if (b >= 0 && d >= 0 && e >= 0) idx.push(b, d, e);
      else if (a >= 0 && b >= 0 && e >= 0 && d < 0) idx.push(a, e, b);
      else if (a >= 0 && d >= 0 && e >= 0 && b < 0) idx.push(a, d, e);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeBoundingSphere();
    const mat = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.78, depthWrite: false, side: T.DoubleSide, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 });
    overlayMesh = new T.Mesh(geo, mat);
    overlayMesh.name = 'Analysis overlay · ' + kind;
    overlayMesh.renderOrder = 4;
    overlayMesh.userData.kind = kind;
    SIM.overlayGroup().add(overlayMesh);
  }
  function valueAt(kind, x, z) {
    const g = latest[kind];
    if (!g) return null;
    const fi = (x - g.x0) / g.step, fj = (z - g.z0) / g.step;
    const i = Math.floor(fi), j = Math.floor(fj), tx = fi - i, tz = fj - j;
    let sum = 0, w = 0;
    for (const [di, dj, ww] of [[0, 0, (1 - tx) * (1 - tz)], [1, 0, tx * (1 - tz)], [0, 1, (1 - tx) * tz], [1, 1, tx * tz]]) {
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= g.nx || jj >= g.nz) continue;
      const v = g.values[jj * g.nx + ii];
      if (Number.isFinite(v)) { sum += v * ww; w += ww; }
    }
    return w > 0.2 ? sum / w : null;
  }
  A.valueAt = valueAt;
  SIM.on('hover', ({ ray, ev }) => {
    if (!overlayMesh) return;
    const rc = new SIM.THREE.Raycaster();
    rc.ray.copy(ray);
    const hit = rc.intersectObject(overlayMesh, false)[0];
    if (!hit) { SIM.emit('readout', null); return; }
    const kind = overlayMesh.userData.kind;
    SIM.emit('readout', { kind, value: valueAt(kind, hit.point.x, hit.point.z), x: hit.point.x, z: hit.point.z, clientX: ev.clientX, clientY: ev.clientY });
  });
  SIM.on('analysis-needed', () => run());
  SIM.on('overlay', kind => { if (kind === 'none') clearOverlay(); else if (latest[kind] && !SIM.analysisDirtyFor?.(kind)) { buildOverlay(kind); run(); } else run(); });
})();
