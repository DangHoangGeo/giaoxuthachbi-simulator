/* Thạch Bi simulator · spatial audio. You hear the church from the camera
 * position (best in Walk mode, with headphones):
 *  - every switched-on loudspeaker as its own source: real propagation delay
 *    (distance / speed of sound) plus its DSP delay, coverage pattern split
 *    into low and high frequencies, distance loss, air absorption, column and
 *    wall screening, and HRTF direction;
 *  - reverberation synthesised from the room model's octave-band reverberation
 *    times, fed by each loudspeaker at the level Barron's theory predicts;
 *  - optionally the priest's own unamplified voice, running fans and the
 *    background noise of the room.
 * Absolute loudness depends on your headphones; the panel shows the predicted
 * level in dBA. Built-in signals are generated or embedded; nothing streams.
 */
(() => {
  'use strict';
  const SIM = window.CHURCH_SIMULATOR;
  const P = window.CHURCH_SIM_PHYSICS;
  const REF_DB = 86; // SPL that maps to RMS 1.0 in the output (before the headphone volume).
  const SOURCES = {
    'speech-vi': 'Speech · Vietnamese (synthetic voice)',
    'speech-en': 'Speech · English (synthetic voice)',
    organ: 'Organ chorale (generated)',
    stipa: 'STIPA speech-test signal',
    pink: 'Pink noise (coverage)',
    clap: 'Hand clap (hear the reverberation)',
    sweep: 'Sine sweep 80 Hz – 12 kHz',
    file: 'Your recording…',
    mic: 'Live microphone (use headphones)'
  };
  const state = { source: 'speech-vi', playing: false, volume: 0.8, fans: true, noise: true, error: null, fileName: null, irKey: '', here: null };
  let ctx = null, master, limiter, programBus, programTrim, reverbIn, convolver, reverbOut, analyser;
  let player = null, micStream = null, fileBuffer = null;
  const buffers = {};
  const chains = new Map();
  let talker = null, noiseBed = null, fanNodes = new Map(), lastUpdate = 0, noiseBuffer = null;
  const A = SIM.audio = { state, SOURCES, renderPanel, play, stop, outputLevels, get context() { return ctx; } };

  /* ------------------------------------------------------------- graph */
  function ensureContext() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('This browser has no Web Audio support.');
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.gain.value = state.volume;
    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -4; limiter.knee.value = 4; limiter.ratio.value = 16; limiter.attack.value = 0.002; limiter.release.value = 0.2;
    analyser = ctx.createAnalyser(); analyser.fftSize = 2048;
    master.connect(limiter); limiter.connect(analyser); analyser.connect(ctx.destination);
    programBus = ctx.createGain();
    programTrim = ctx.createGain();
    programTrim.connect(programBus);
    reverbIn = ctx.createGain();
    convolver = ctx.createConvolver(); convolver.normalize = false;
    reverbOut = ctx.createGain();
    reverbIn.connect(convolver); convolver.connect(reverbOut); reverbOut.connect(master);
    buildIR();
    syncChains();
    meterLoop();
    return ctx;
  }
  const setParam = (p, v, t = 0.04) => { if (!p) return; const now = ctx.currentTime; p.cancelScheduledValues(now); p.setTargetAtTime(v, now, t); };
  function placeNode(node, pos) {
    if (node.positionX) { node.positionX.value = pos[0]; node.positionY.value = pos[1]; node.positionZ.value = pos[2]; }
    else node.setPosition(pos[0], pos[1], pos[2]);
  }
  function makePanner() {
    const p = ctx.createPanner();
    p.panningModel = 'HRTF'; p.distanceModel = 'linear'; p.refDistance = 1; p.maxDistance = 100000; p.rolloffFactor = 0;
    p.coneInnerAngle = 360; p.coneOuterAngle = 360;
    return p;
  }
  function lr4(type, freq) {
    const a = ctx.createBiquadFilter(), b = ctx.createBiquadFilter();
    a.type = b.type = type; a.frequency.value = b.frequency.value = freq; a.Q.value = b.Q.value = Math.SQRT1_2;
    a.connect(b);
    return { input: a, output: b };
  }
  // One chain per loudspeaker (and one for the unamplified talker).
  function makeChain(response) {
    const input = ctx.createGain(); input.gain.value = 0;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.Q.value = 0.7;
    hp.frequency.value = response && response[0] <= -15 ? 220 : response && response[0] <= -10 ? 150 : response && response[0] <= -6 ? 110 : 60;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
    lp.frequency.value = response && response[6] <= -8 ? 6500 : 16000;
    const delay = ctx.createDelay(1.5);
    const lo = lr4('lowpass', 700), hi = lr4('highpass', 700);
    const gLo = ctx.createGain(), gHi = ctx.createGain(), sum = ctx.createGain();
    const send = ctx.createGain(); send.gain.value = 0;
    const panner = makePanner();
    programBus.connect(input);
    input.connect(hp); hp.connect(lp); lp.connect(delay);
    delay.connect(lo.input); delay.connect(hi.input);
    lo.output.connect(gLo); hi.output.connect(gHi); gLo.connect(sum); gHi.connect(sum);
    sum.connect(panner); panner.connect(master);
    delay.connect(send); send.connect(reverbIn);
    return { input, delay, gLo, gHi, send, panner, lastDelay: null, nodes: [input, hp, lp, delay, lo.input, lo.output, hi.input, hi.output, gLo, gHi, sum, send, panner] };
  }
  function dropChain(ch) {
    try { ch.input.gain.setTargetAtTime(0, ctx.currentTime, 0.02); } catch { /* closed */ }
    setTimeout(() => ch.nodes.forEach(n => { try { n.disconnect(); } catch { /* already */ } }), 120);
  }
  function syncChains() {
    if (!ctx) return;
    const speakers = SIM.speakers();
    const ids = new Set(speakers.map(s => s.id));
    for (const [id, ch] of chains) if (!ids.has(id)) { dropChain(ch); chains.delete(id); }
    for (const s of speakers) if (!chains.has(s.id)) chains.set(s.id, makeChain(s.spec.response));
    if (SIM.state.settings.talker && !talker) talker = makeChain(null);
    if (!SIM.state.settings.talker && talker) { dropChain(talker); talker = null; }
    syncFans();
    syncNoise();
    lastUpdate = 0;
  }

  /* -------------------------------------------------------- reverberation */
  function biquadBandpass(f, sr) {
    const w = 2 * Math.PI * f / sr, alpha = Math.sin(w) * Math.sinh(Math.LN2 / 2 * 1.0 * w / Math.sin(w));
    const b0 = alpha, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
    return [b0 / a0, 0, b2 / a0, a1 / a0, a2 / a0];
  }
  function buildIR() {
    if (!ctx) return;
    const room = SIM.room();
    const key = room.T.map(t => t.toFixed(2)).join(',');
    if (key === state.irKey) return;
    state.irKey = key;
    const sr = ctx.sampleRate, Tmax = Math.max(...room.T);
    const n = Math.min(Math.floor(sr * Math.min(8, Tmax * 1.15 + 0.15)), sr * 8);
    const ir = ctx.createBuffer(2, n, sr);
    let seed = 1234567;
    const rand = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
    const Tmid = room.Tmid;
    for (let ch = 0; ch < 2; ch++) {
      const out = ir.getChannelData(ch);
      for (let b = 0; b < 7; b++) {
        const f = P.OCTAVES[b];
        if (f >= sr / 2.2) continue;
        const [b0, b1, b2, a1, a2] = biquadBandpass(f, sr);
        const T = room.T[b], k = -6.9078 / (T * sr);
        const weight = Math.sqrt(T / Tmid) * (b === 0 ? 0.8 : 1);
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        for (let i = 0; i < n; i++) {
          const x = rand();
          const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
          x2 = x1; x1 = x; y2 = y1; y1 = y;
          out[i] += y * Math.exp(k * i) * weight;
        }
      }
      // Onset: the first reflections arrive a few milliseconds after the direct sound.
      const onset = Math.floor(sr * 0.006), build = Math.floor(sr * 0.05);
      for (let i = 0; i < Math.min(n, onset + build); i++) out[i] *= i < onset ? 0 : Math.min(1, (i - onset) / build) ** 0.5;
      for (let r = 0; r < 14; r++) {
        const t = Math.floor(sr * (0.007 + Math.abs(rand()) * 0.07));
        if (t < n) out[t] += rand() * 0.9 * Math.exp(-t / sr * 6.9 / Tmid) * 3;
      }
    }
    let e = 0;
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < n; i++) e += d[i] * d[i]; }
    const g = 1 / Math.sqrt(e / 2);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < n; i++) d[i] *= g; }
    convolver.buffer = ir;
  }

  /* --------------------------------------------------- per-listener update */
  function listenerUpdate(camera) {
    if (!ctx || ctx.state !== 'running') return;
    const p = camera.position, L = ctx.listener;
    const f = camera.getWorldDirection(new SIM.THREE.Vector3());
    const t = ctx.currentTime;
    if (L.positionX) {
      L.positionX.setTargetAtTime(p.x, t, 0.02); L.positionY.setTargetAtTime(p.y, t, 0.02); L.positionZ.setTargetAtTime(p.z, t, 0.02);
      L.forwardX.setTargetAtTime(f.x, t, 0.02); L.forwardY.setTargetAtTime(f.y, t, 0.02); L.forwardZ.setTargetAtTime(f.z, t, 0.02);
      L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0;
    } else { L.setPosition(p.x, p.y, p.z); L.setOrientation(f.x, f.y, f.z, 0, 1, 0); }
    const now = performance.now();
    if (now - lastUpdate < 60) return;
    lastUpdate = now;
    const rx = [p.x, p.y, p.z];
    const room = SIM.room();
    const occ = SIM.GEO.occluders;
    const ref = Math.pow(10, -REF_DB / 20);
    const bandMean = (arr, list) => list.reduce((s, b) => s + arr[b], 0) / list.length;
    const speakers = SIM.speakers();
    const report = [];
    const apply = (ch, src, spec, on) => {
      const a = P.sourceArrivals(src, spec, rx, room, occ, P.FLAT_SPECTRUM, SIM.roomCouplingAt(rx));
      const gLo = Math.sqrt(bandMean(a.direct, [1, 2])) * ref, gHi = Math.sqrt(bandMean(a.direct, [3, 4, 5])) * ref;
      const send = Math.sqrt(bandMean(a.reflected, [2, 3, 4])) * ref;
      setParam(ch.gLo.gain, gLo); setParam(ch.gHi.gain, gHi); setParam(ch.send.gain, send);
      const d = Math.min(1.45, a.tau);
      if (ch.lastDelay === null || Math.abs(d - ch.lastDelay) > 0.03) {
        // Big jumps (teleports, edited delays): dip the level instead of pitch-sliding.
        const t0 = ctx.currentTime;
        ch.input.gain.cancelScheduledValues(t0);
        ch.input.gain.setTargetAtTime(0, t0, 0.008);
        ch.delay.delayTime.setValueAtTime(d, t0 + 0.04);
        ch.input.gain.setTargetAtTime(on ? 1 : 0, t0 + 0.05, 0.02);
      } else {
        ch.delay.delayTime.setTargetAtTime(d, ctx.currentTime, 0.08);
        setParam(ch.input.gain, on ? 1 : 0, 0.03);
      }
      ch.lastDelay = d;
      placeNode(ch.panner, src.pos);
      return a;
    };
    for (const s of speakers) {
      const ch = chains.get(s.id);
      if (!ch) continue;
      const a = apply(ch, s.src, s.spec, s.on && state.playing);
      if (s.on) report.push({ name: s.item.name, a });
    }
    if (talker) {
      const tk = talkerSourceSpec();
      const a = apply(talker, tk.src, tk.spec, state.playing && /speech|mic|file/.test(state.source));
      report.push({ name: 'Priest’s own voice', a });
    }
    updateFans(rx);
    // Readout: predicted programme level and first arrival here (a few times a second).
    if (now - (state.hereAt || 0) < 450) return;
    state.hereAt = now;
    if (report.length) {
      const first = report.reduce((m, r) => r.a.tau < m.a.tau ? r : m);
      const v = SIM.analysis?.pointValues?.(p.x, p.z, p.y);
      state.here = { first: first.name, firstMs: first.a.tau * 1000, spl: v?.spl, sti: v?.sti, noise: v?.noise };
    } else state.here = null;
    renderHere();
  }
  function talkerSourceSpec() {
    const mic = SIM.mics().find(m => m.on) || SIM.mics()[0];
    const pos = mic ? [mic.pos[0] + mic.dir[0] * 0.45, mic.pos[1] + 0.05, mic.pos[2] + mic.dir[2] * 0.45] : [42.95, 2.3, -2.62];
    const yaw = mic ? Math.atan2(-mic.dir[2], -mic.dir[0]) * 180 / Math.PI : 180;
    const spec = { id: 'voice', hb: [360, 360, 300, 230, 180, 160, 150], vb: [360, 360, 300, 230, 180, 160, 150], rear: [2, 3, 5, 7, 9, 11, 12] };
    return { spec, src: { pos, ...SIM.worldFrame({ yaw, tilt: 0 }), level1m: SIM.state.settings.talkerDbA, delayMs: 0 } };
  }

  /* ---------------------------------------------------------- fans, noise */
  function getNoiseBuffer() {
    if (noiseBuffer) return noiseBuffer;
    const sr = ctx.sampleRate, n = sr * 6;
    noiseBuffer = ctx.createBuffer(1, n, sr);
    const d = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, e = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926;
      e += d[i] * d[i];
    }
    const g = 1 / Math.sqrt(e / n);
    // Crossfade the loop seam.
    const fade = Math.floor(sr * 0.05);
    for (let i = 0; i < fade; i++) { const t = i / fade; d[i] = d[i] * t + d[n - fade + i] * (1 - t); }
    for (let i = 0; i < n; i++) d[i] *= g;
    return noiseBuffer;
  }
  function syncFans() {
    if (!ctx) return;
    const fans = state.fans ? SIM.fans().filter(f => f.running) : [];
    const keep = new Set(fans.map(f => f.id));
    for (const [id, n] of fanNodes) if (!keep.has(id)) { n.out.gain.setTargetAtTime(0, ctx.currentTime, 0.1); setTimeout(() => n.nodes.forEach(x => { try { x.stop?.(); x.disconnect(); } catch { /* done */ } }), 400); fanNodes.delete(id); }
    for (const f of fans) {
      if (fanNodes.has(f.id)) continue;
      const src = ctx.createBufferSource(); src.buffer = getNoiseBuffer(); src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f.kind === 'jet' ? 2600 : f.diameter > 2 ? 650 : 1200;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 60;
      const am = ctx.createGain(); am.gain.value = 0.85;
      const osc = ctx.createOscillator(); osc.frequency.value = 1; const depth = ctx.createGain(); depth.gain.value = 0.15;
      osc.connect(depth); depth.connect(am.gain);
      const out = ctx.createGain(); out.gain.value = 0;
      const send = ctx.createGain(); send.gain.value = 0;
      const pan = makePanner();
      src.connect(hp); hp.connect(lp); lp.connect(am); am.connect(out); out.connect(pan); pan.connect(master); am.connect(send); send.connect(reverbIn);
      src.start(ctx.currentTime + Math.random() * 0.1, Math.random() * 5); osc.start();
      fanNodes.set(f.id, { src, osc, out, send, pan, nodes: [src, lp, hp, am, osc, depth, out, send, pan] });
    }
  }
  function updateFans(rx) {
    if (!fanNodes.size) return;
    const room = SIM.room(), ref = Math.pow(10, -REF_DB / 20);
    for (const f of SIM.fans()) {
      const n = fanNodes.get(f.id);
      if (!n) continue;
      const r = Math.max(0.6, Math.hypot(rx[0] - f.pos[0], rx[1] - f.pos[1], rx[2] - f.pos[2]));
      const L = f.dBA - 20 * Math.log10(r);
      const Lrev = f.dBA + 11 + 10 * Math.log10(4 / (room.A[3] + 4 * room.airDb[3] / 4.343 * room.V));
      setParam(n.out.gain, f.running ? Math.pow(10, (L - REF_DB) / 20) * 1.6 : 0, 0.15);
      setParam(n.send.gain, f.running ? Math.pow(10, (Lrev - REF_DB) / 20) * 1.2 : 0, 0.15);
      const bladeHz = f.rpm / 60 * (f.diameter > 2 ? 6 : f.kind === 'jet' ? 3 : 5);
      n.osc.frequency.setTargetAtTime(Math.min(bladeHz, 18) || 1, ctx.currentTime, 0.3);
      placeNode(n.pan, f.pos);
    }
  }
  function syncNoise() {
    if (!ctx) return;
    if (state.noise && !noiseBed) {
      const src = ctx.createBufferSource(); src.buffer = getNoiseBuffer(); src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(lp); lp.connect(g); g.connect(master); g.connect(reverbIn);
      src.start(0, 2.3);
      noiseBed = { src, g, nodes: [src, lp, g] };
    } else if (!state.noise && noiseBed) {
      noiseBed.g.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      const nb = noiseBed; noiseBed = null;
      setTimeout(() => nb.nodes.forEach(x => { try { x.stop?.(); x.disconnect(); } catch { /* done */ } }), 400);
    }
    if (noiseBed) setParam(noiseBed.g.gain, Math.pow(10, (SIM.state.settings.ambientDbA - 6 - REF_DB) / 20), 0.3);
  }

  /* -------------------------------------------------------------- signals */
  async function decodeSample(key) {
    if (!window.CHURCH_SIM_SAMPLES) await loadScript('simulator/samples.js?v=20261006-1');
    const s = window.CHURCH_SIM_SAMPLES?.[key];
    if (!s) throw new Error('Test speech is missing (simulator/samples.js).');
    const bin = Uint8Array.from(atob(s.data), c => c.charCodeAt(0));
    return ctx.decodeAudioData(bin.buffer);
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => { const el = document.createElement('script'); el.src = src; el.onload = resolve; el.onerror = () => reject(new Error('Could not load ' + src)); document.head.append(el); });
  }
  function rmsOf(buffer) {
    let e = 0, n = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) { const d = buffer.getChannelData(ch); for (let i = 0; i < d.length; i += 3) { e += d[i] * d[i]; n++; } }
    // Speech has pauses: use the RMS of the active part (approx. top half of energy).
    return Math.sqrt(e / Math.max(1, n)) || 1;
  }
  function makeBuffer(seconds, fill) {
    const sr = ctx.sampleRate, b = ctx.createBuffer(1, Math.floor(sr * seconds), sr);
    fill(b.getChannelData(0), sr);
    return b;
  }
  async function getBuffer(key) {
    if (buffers[key]) return buffers[key];
    let b;
    if (key === 'speech-vi' || key === 'speech-en') b = await decodeSample(key);
    else if (key === 'pink') b = makeBuffer(6, d => d.set(getNoiseBuffer().getChannelData(0).subarray(0, d.length)));
    else if (key === 'clap') b = makeBuffer(3.2, (d, sr) => { let s = 99; for (let i = 0; i < sr * 0.08; i++) { s = (s * 16807) % 2147483647; const w = s / 1073741823.5 - 1; d[i] = w * Math.exp(-i / (sr * 0.009)) * (i < sr * 0.0015 ? i / (sr * 0.0015) : 1); } });
    else if (key === 'sweep') b = makeBuffer(6.5, (d, sr) => { const T = 5, f0 = 80, f1 = 12000, K = T / Math.log(f1 / f0); for (let i = 0; i < sr * T; i++) { const t = i / sr; const env = Math.min(1, t / 0.05, (T - t) / 0.05); d[i] = 0.5 * env * Math.sin(2 * Math.PI * f0 * K * (Math.exp(t / K) - 1)); } });
    else if (key === 'stipa') b = makeStipa();
    else if (key === 'organ') b = await makeOrgan();
    else if (key === 'file') b = fileBuffer;
    if (!b) throw new Error('No recording chosen yet.');
    // Programme RMS 1.0 ≙ the loudspeaker's speech level; a clap is set by its 80 ms burst.
    buffers[key] = { buffer: b, gain: key === 'clap' ? 0.5 / rmsOf({ numberOfChannels: 1, getChannelData: () => b.getChannelData(0).subarray(0, Math.floor(b.sampleRate * 0.08)) }) : 1 / rmsOf(b) };
    return buffers[key];
  }
  // IEC 60268-16 STIPA-like signal: 7 half-octave noise carriers, each with two
  // intensity modulation frequencies (m = 0.55), shaped to the male speech spectrum.
  function makeStipa() {
    const mods = [[1.6, 8], [1, 5], [0.63, 3.15], [2, 10], [1.25, 6.25], [0.8, 4], [2.5, 12.5]];
    return makeBuffer(20, (d, sr) => {
      let seed = 4242;
      const rand = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2147483648) - 1;
      P.OCTAVES.forEach((f, b) => {
        if (f > sr / 2.3) return;
        const w = 2 * Math.PI * f / sr, alpha = Math.sin(w) * Math.sinh(Math.LN2 / 2 * 0.5 * w / Math.sin(w));
        const c = [alpha / (1 + alpha), 0, -alpha / (1 + alpha), -2 * Math.cos(w) / (1 + alpha), (1 - alpha) / (1 + alpha)];
        const amp = Math.pow(10, P.SPEECH_SPECTRUM[b] / 20);
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        for (let i = 0; i < d.length; i++) {
          const x = rand(), y = c[0] * x + c[2] * x2 - c[3] * y1 - c[4] * y2;
          x2 = x1; x1 = x; y2 = y1; y1 = y;
          const t = i / sr, I = 1 + 0.55 * (Math.sin(2 * Math.PI * mods[b][0] * t) - Math.sin(2 * Math.PI * mods[b][1] * t));
          d[i] += y * amp * Math.sqrt(Math.max(0, I)) * 4;
        }
      });
    });
  }
  // A short original chorale in G major on a principal-chorus organ.
  async function makeOrgan() {
    const sr = 44100, beat = 0.9;
    const chords = [['G3', 'B3', 'D4', 'G4'], ['C3', 'C4', 'E4', 'G4'], ['D3', 'A3', 'D4', 'F#4'], ['E3', 'G3', 'B3', 'E4'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'F#3', 'A3', 'D4'], ['G2', 'D3', 'B3', 'G4'], ['G2', 'D3', 'B3', 'G4'],
      ['E3', 'G3', 'B3', 'G4'], ['A2', 'E3', 'C4', 'A4'], ['D3', 'F#3', 'A3', 'F#4'], ['G3', 'B3', 'D4', 'G4'], ['C3', 'E3', 'G3', 'E4'], ['A2', 'E3', 'A3', 'C4'], ['D3', 'F#3', 'C4', 'D4'], ['G2', 'D3', 'B3', 'G4']];
    const lengths = [2, 1, 1, 2, 1, 1, 2, 2, 2, 1, 1, 2, 1, 1, 2, 4];
    const total = lengths.reduce((a, b) => a + b, 0) * beat + 3.5;
    const off = new OfflineAudioContext(1, Math.ceil(total * sr), sr);
    const midi = n => { const m = n.match(/^([A-G])(#?)(\d)$/); return 12 * (Number(m[3]) + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0); };
    const real = new Float32Array(10), imag = new Float32Array(10);
    [0, 1, 0.62, 0.4, 0.38, 0.16, 0.12, 0.06, 0.1, 0.03].forEach((v, i) => { imag[i] = v; });
    const wave = off.createPeriodicWave(real, imag, { disableNormalization: false });
    const bus = off.createGain(); bus.gain.value = 0.12;
    const tone = off.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 5200;
    bus.connect(tone); tone.connect(off.destination);
    let t = 0.2;
    chords.forEach((ch, i) => {
      const dur = lengths[i] * beat;
      ch.forEach((note, v) => {
        const f = 440 * Math.pow(2, (midi(note) - 69) / 12);
        for (const [mult, lvl] of [[1, 1], [2, 0.45]]) {
          const o = off.createOscillator(); o.setPeriodicWave(wave); o.frequency.value = f * mult * (1 + (v - 1.5) * 0.0007);
          const g = off.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl * (v === 3 ? 1.1 : 0.9), t + 0.06); g.gain.setValueAtTime(lvl * (v === 3 ? 1.1 : 0.9), t + dur - 0.05); g.gain.linearRampToValueAtTime(0, t + dur + 0.06);
          o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.1);
        }
      });
      t += dur;
    });
    return off.startRendering();
  }

  /* -------------------------------------------------------- play / stop */
  async function play(key = state.source) {
    try {
      ensureContext();
      await ctx.resume();
      stop(true);
      state.error = null;
      state.source = key;
      buildIR();
      if (key === 'mic') {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone input is not available here (it needs https or localhost in most browsers).');
        micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        const src = ctx.createMediaStreamSource(micStream);
        const g = ctx.createGain(); g.gain.value = 8;
        src.connect(g); g.connect(programTrim);
        player = { stop() { try { src.disconnect(); g.disconnect(); } catch { /* */ } micStream?.getTracks().forEach(tk => tk.stop()); micStream = null; } };
      } else {
        const { buffer, gain } = await getBuffer(key);
        const src = ctx.createBufferSource();
        src.buffer = buffer; src.loop = true;
        if (/clap|sweep/.test(key)) src.loopEnd = buffer.duration;
        const g = ctx.createGain(); g.gain.value = gain;
        src.connect(g); g.connect(programTrim);
        src.start();
        player = { stop() { try { src.stop(); src.disconnect(); g.disconnect(); } catch { /* */ } } };
      }
      state.playing = true;
      syncChains();
      lastUpdate = 0;
    } catch (e) {
      state.error = e.message || String(e);
      state.playing = false;
    }
    refreshPanel();
  }
  function stop(silent) {
    if (player) { player.stop(); player = null; }
    state.playing = false;
    if (ctx) for (const ch of [...chains.values(), talker].filter(Boolean)) setParam(ch.input.gain, 0, 0.02);
    if (!silent) refreshPanel();
  }

  /* --------------------------------------------------------------- meter */
  let meterEl = null, meterData = null;
  // Sample the actual signal after headphone volume and the limiter. Digital
  // dBFS is kept separate from the room model's acoustic estimates in dBA.
  // Reading the meter never starts playback or requests a microphone.
  function outputLevels() {
    if (!analyser || !state.playing || ctx.state !== 'running') return null;
    meterData ||= new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(meterData);
    let squares = 0, peak = 0;
    for (const v of meterData) {
      squares += v * v;
      peak = Math.max(peak, Math.abs(v));
    }
    const rms = Math.sqrt(squares / meterData.length);
    return {
      rmsDb: rms > 0 ? 20 * Math.log10(rms) : -Infinity,
      peakDb: peak > 0 ? 20 * Math.log10(peak) : -Infinity
    };
  }
  function meterLoop() {
    requestAnimationFrame(meterLoop);
    if (!meterEl || !analyser || !meterEl.isConnected) return;
    const dbfs = outputLevels()?.peakDb ?? -Infinity;
    meterEl.style.width = Math.max(0, Math.min(100, (dbfs + 50) * 2)) + '%';
    meterEl.classList.toggle('hot', dbfs > -3);
  }

  /* --------------------------------------------------------------- panel */
  let panelEl = null;
  function renderPanel(el) {
    panelEl = el;
    if (!el) return;
    const s = SIM.state.settings;
    el.innerHTML = `<h3>Listen in the church</h3>
      <p class="sim-hint">Use headphones. Choose <b>Walk</b> or a seated view, press Play and move around: each loudspeaker arrives with its real delay, direction and coverage, followed by the room's reverberation.</p>
      <div class="sim-audio-row">
        <select id="simAudioSource" aria-label="Test signal">${Object.entries(SOURCES).map(([k, l]) => `<option value="${k}" ${state.source === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <button id="simAudioPlay" class="sim-primary">${state.playing ? '■ Stop' : '▶ Play'}</button>
      </div>
      <input type="file" id="simAudioFile" accept="audio/*" hidden>
      ${state.fileName ? `<p class="sim-hint">Recording: ${state.fileName}</p>` : ''}
      ${state.error ? `<p class="sim-error">${state.error}</p>` : ''}
      <div class="sim-meter" aria-hidden="true"><span id="simMeter"></span></div>
      <div class="sim-fields">
        <label class="sim-field wide"><span>Headphone volume</span><span class="sim-range"><input type="range" id="simAudioVolume" aria-label="Headphone volume" min="0" max="2" step="0.05" value="${state.volume}"><output>${Math.round(state.volume * 100)} %</output></span></label>
        <label class="sim-field wide"><span>Sound system level (mixer)</span><span class="sim-range"><input type="range" data-setting="mixerDb" min="-20" max="10" step="0.5" value="${s.mixerDb}"><output>${s.mixerDb > 0 ? '+' : ''}${s.mixerDb} dB</output></span></label>
      </div>
      <label class="switch-row"><span>Priest’s own voice at the microphone<small>Unamplified talker, 62 dBA at 1 m</small></span><input type="checkbox" data-setting="talker" ${s.talker ? 'checked' : ''}></label>
      <label class="switch-row"><span>Hear the running fans</span><input type="checkbox" id="simAudioFans" ${state.fans ? 'checked' : ''}></label>
      <label class="switch-row"><span>Hear background noise</span><input type="checkbox" id="simAudioNoise" ${state.noise ? 'checked' : ''}></label>
      <div class="sim-actions"><button data-act="align">Align delays</button><button id="simSeatCentral">Sit near the centre aisle</button><button id="simSeatOuter">Sit near the side aisle</button></div>
      <p class="sim-here-audio" id="simHereAudio"></p>`;
    el.querySelector('#simAudioPlay').addEventListener('click', () => state.playing ? stop() : (state.source === 'file' && !fileBuffer ? el.querySelector('#simAudioFile').click() : play(el.querySelector('#simAudioSource').value)));
    el.querySelector('#simAudioSource').addEventListener('change', e => {
      state.source = e.target.value;
      if (state.source === 'file' && !fileBuffer) el.querySelector('#simAudioFile').click();
      else if (state.playing) play(state.source);
    });
    el.querySelector('#simAudioFile').addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if (!f) return;
      try { ensureContext(); fileBuffer = await ctx.decodeAudioData(await f.arrayBuffer()); delete buffers.file; state.fileName = f.name; play('file'); }
      catch (err) { state.error = 'Could not decode this file: ' + err.message; refreshPanel(); }
    });
    el.querySelector('#simAudioVolume').addEventListener('input', e => { state.volume = Number(e.target.value); e.target.nextElementSibling.textContent = Math.round(state.volume * 100) + ' %'; if (master) setParam(master.gain, state.volume, 0.03); });
    el.querySelector('#simAudioFans').addEventListener('change', e => { state.fans = e.target.checked; syncFans(); });
    el.querySelector('#simAudioNoise').addEventListener('change', e => { state.noise = e.target.checked; syncNoise(); });
    el.querySelector('#simSeatCentral').addEventListener('click', () => document.getElementById('centralSeatView')?.click());
    el.querySelector('#simSeatOuter').addEventListener('click', () => document.getElementById('outerSeatView')?.click());
    meterEl = el.querySelector('#simMeter');
    renderHere();
  }
  function refreshPanel() { if (panelEl?.isConnected) renderPanel(panelEl); }
  function renderHere() {
    const el = panelEl?.querySelector('#simHereAudio');
    if (!el) return;
    const h = state.here;
    if (!h) { el.textContent = state.playing ? 'No loudspeaker is switched on.' : ''; return; }
    el.innerHTML = `Where you are: <b>${h.spl !== null && h.spl !== undefined ? Math.round(h.spl) + ' dBA speech' : ''}</b>${h.sti !== null && h.sti !== undefined ? ` · STI <b>${h.sti.toFixed(2)}</b> (${P.stiRating(h.sti)})` : ''} · background ${h.noise !== undefined ? Math.round(h.noise) : '–'} dBA · first sound from ${h.first} after ${h.firstMs.toFixed(0)} ms`;
  }

  SIM.on('frame', ({ camera }) => { if (ctx) listenerUpdate(camera); });
  SIM.on('items', () => { if (ctx) syncChains(); });
  SIM.on('settings', ({ key }) => {
    if (!ctx) return;
    if (['occupancy', 'openings', 'roofFinish', 'tempC', 'rh'].includes(key)) setTimeout(buildIR, 50);
    if (key === 'talker') syncChains();
    if (key === 'ambientDbA') syncNoise();
    lastUpdate = 0;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && ctx && state.playing) ctx.suspend(); else if (!document.hidden && ctx && state.playing) ctx.resume(); });
})();
