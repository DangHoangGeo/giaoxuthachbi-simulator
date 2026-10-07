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
  const state = { source: 'speech-vi', playing: false, loading: false, volume: 0.8, fans: true, noise: true, error: null, fileName: null, irKey: '', here: null };
  let ctx = null, master, limiter, programBus, programTrim, reverbIn, convolver, reverbOut, analyser;
  let player = null, fileBuffer = null, playRequest = 0, sampleScript = null;
  let irVersion = 0, irJob = null, irTimer = 0, acousticRevision = 0;
  let forward = null, listenerPose = null, resumeAfterVisibility = false;
  const buffers = {}, bufferJobs = {};
  const chains = new Map();
  let talker = null, noiseBed = null, fanNodes = new Map(), lastUpdate = 0, noiseBuffer = null;
  const A = SIM.audio = { state, SOURCES, renderPanel, play, stop, outputLevels,
    resources: () => ({ speakerChains: chains.size, drainingSpeakerChains: [...chains.values()].filter(ch => ch.retireTimer).length, fanSources: fanNodes.size }),
    get context() { return ctx; } };

  /* ------------------------------------------------------------- graph */
  function ensureContext() {
    if (ctx) return ctx;
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
  function responseFilters(response) {
    return [response && response[0] <= -15 ? 220 : response && response[0] <= -10 ? 150 : response && response[0] <= -6 ? 110 : 60,
      response && response[6] <= -8 ? 6500 : 16000];
  }
  // One chain per active loudspeaker (and one for the unamplified talker).
  function makeChain(response) {
    const input = ctx.createGain(); input.gain.value = 0;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.Q.value = 0.7;
    const [highpass, lowpass] = responseFilters(response);
    hp.frequency.value = highpass;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
    lp.frequency.value = lowpass;
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
    return { input, hp, lp, delay, gLo, gHi, send, panner, lastDelay: null, retireTimer: null, nodes: [input, hp, lp, delay, lo.input, lo.output, hi.input, hi.output, gLo, gHi, sum, send, panner] };
  }
  function dropChain(ch) {
    clearTimeout(ch.retireTimer); ch.retireTimer = null;
    try { ch.input.gain.setTargetAtTime(0, ctx.currentTime, 0.02); } catch { /* closed */ }
    setTimeout(() => {
      // disconnect() on the input only releases its outputs, not the bus edge.
      try { programBus.disconnect(ch.input); } catch { /* already detached */ }
      ch.nodes.forEach(n => { try { n.disconnect(); } catch { /* already */ } });
    }, 120);
  }
  function syncChains() {
    if (!ctx) return;
    const speakers = SIM.speakers();
    const ids = new Set(speakers.map(s => s.id));
    for (const [id, ch] of chains) if (!ids.has(id)) { dropChain(ch); chains.delete(id); }
    for (const s of speakers) {
      let ch = chains.get(s.id);
      if (!s.on) {
        if (ch && !ch.retireTimer) {
          setParam(ch.input.gain, 0, 0.03);
          // Allow the maximum 1.45 s programme delay plus its input fade to drain.
          // A quick re-enable cancels retirement and reuses the same delay line.
          ch.retireTimer = setTimeout(() => { dropChain(ch); if (chains.get(s.id) === ch) chains.delete(s.id); }, 1600);
        }
        continue;
      }
      if (!ch) { ch = makeChain(s.spec.response); chains.set(s.id, ch); }
      clearTimeout(ch.retireTimer); ch.retireTimer = null;
      const [highpass, lowpass] = responseFilters(s.spec.response);
      if (ch.hp.frequency.value !== highpass) setParam(ch.hp.frequency, highpass);
      if (ch.lp.frequency.value !== lowpass) setParam(ch.lp.frequency, lowpass);
    }
    if (SIM.state.settings.talker && !talker) talker = makeChain(null);
    if (!SIM.state.settings.talker && talker) { dropChain(talker); talker = null; }
    syncFans();
    syncNoise();
    lastUpdate = 0;
  }

  /* -------------------------------------------------------- reverberation */
  const roomKey = room => room.T.map(t => t.toFixed(2)).join(',');
  function buildIR() {
    if (!ctx) return Promise.resolve();
    const room = SIM.room(), key = roomKey(room);
    if (irJob?.key === key) return irJob.promise;
    // Also cancels B when inputs return to the already-applied A.
    const version = ++irVersion;
    irJob = null;
    if (key === state.irKey) return Promise.resolve();
    const captured = { T: room.T.slice(), Tmid: room.Tmid };
    const job = { key, promise: null };
    job.promise = window.CHURCH_AUDIO_SYNTHESIS.makeIR(ctx, captured, P, () => version !== irVersion).then(ir => {
      if (ir && version === irVersion) { convolver.buffer = ir; state.irKey = key; }
    }).finally(() => { if (irJob === job) irJob = null; });
    irJob = job;
    return job.promise;
  }
  function scheduleIR() {
    if (irJob && irJob.key !== roomKey(SIM.room())) { irVersion++; irJob = null; }
    clearTimeout(irTimer);
    irTimer = setTimeout(() => buildIR().catch(e => { state.error = e.message || String(e); refreshPanel(); }), 50);
  }
  function invalidateAcoustics() { acousticRevision++; lastUpdate = 0; }

  /* --------------------------------------------------- per-listener update */
  function listenerUpdate(camera) {
    if (!ctx || ctx.state !== 'running') return;
    const p = camera.position, L = ctx.listener;
    const f = camera.getWorldDirection(forward ||= new SIM.THREE.Vector3());
    const t = ctx.currentTime;
    if (!listenerPose || listenerPose[0] !== p.x || listenerPose[1] !== p.y || listenerPose[2] !== p.z ||
        listenerPose[3] !== f.x || listenerPose[4] !== f.y || listenerPose[5] !== f.z) {
      if (L.positionX) {
        L.positionX.setTargetAtTime(p.x, t, 0.02); L.positionY.setTargetAtTime(p.y, t, 0.02); L.positionZ.setTargetAtTime(p.z, t, 0.02);
        L.forwardX.setTargetAtTime(f.x, t, 0.02); L.forwardY.setTargetAtTime(f.y, t, 0.02); L.forwardZ.setTargetAtTime(f.z, t, 0.02);
        L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0;
      } else { L.setPosition(p.x, p.y, p.z); L.setOrientation(f.x, f.y, f.z, 0, 1, 0); }
      listenerPose = [p.x, p.y, p.z, f.x, f.y, f.z];
    }
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
      let cached = ch.arrival;
      if (!cached || cached.revision !== acousticRevision || cached.room !== room ||
          cached.rx[0] !== rx[0] || cached.rx[1] !== rx[1] || cached.rx[2] !== rx[2]) {
        cached = ch.arrival = { revision: acousticRevision, room, rx,
          value: P.sourceArrivals(src, spec, rx, room, occ, P.FLAT_SPECTRUM, SIM.roomCouplingAt(rx)) };
      }
      const a = cached.value;
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
    if (!window.CHURCH_SIM_SAMPLES) {
      sampleScript ||= loadScript('simulator/samples.js?v=20261006-1').catch(e => { sampleScript = null; throw e; });
      await sampleScript;
    }
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
    if (bufferJobs[key]) return bufferJobs[key];
    const job = bufferJobs[key] = loadBuffer(key);
    try { return await job; }
    finally { if (bufferJobs[key] === job) delete bufferJobs[key]; }
  }
  async function loadBuffer(key) {
    let b;
    if (key === 'speech-vi' || key === 'speech-en') b = await decodeSample(key);
    else if (key === 'pink') b = makeBuffer(6, d => d.set(getNoiseBuffer().getChannelData(0).subarray(0, d.length)));
    else if (key === 'clap') b = makeBuffer(3.2, (d, sr) => { let s = 99; for (let i = 0; i < sr * 0.08; i++) { s = (s * 16807) % 2147483647; const w = s / 1073741823.5 - 1; d[i] = w * Math.exp(-i / (sr * 0.009)) * (i < sr * 0.0015 ? i / (sr * 0.0015) : 1); } });
    else if (key === 'sweep') b = makeBuffer(6.5, (d, sr) => { const T = 5, f0 = 80, f1 = 12000, K = T / Math.log(f1 / f0); for (let i = 0; i < sr * T; i++) { const t = i / sr; const env = Math.min(1, t / 0.05, (T - t) / 0.05); d[i] = 0.5 * env * Math.sin(2 * Math.PI * f0 * K * (Math.exp(t / K) - 1)); } });
    else if (key === 'stipa') b = await window.CHURCH_AUDIO_SYNTHESIS.makeStipa(ctx, P);
    else if (key === 'organ') b = await makeOrgan();
    else if (key === 'file') b = fileBuffer;
    if (!b) throw new Error('No recording chosen yet.');
    // Programme RMS 1.0 ≙ the loudspeaker's speech level; a clap is set by its 80 ms burst.
    buffers[key] = { buffer: b, gain: key === 'clap' ? 0.5 / rmsOf({ numberOfChannels: 1, getChannelData: () => b.getChannelData(0).subarray(0, Math.floor(b.sampleRate * 0.08)) }) : 1 / rmsOf(b) };
    return buffers[key];
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
    stop(true);
    const request = playRequest;
    state.error = null; state.source = key; state.loading = true;
    refreshPanel();
    try {
      ensureContext();
      await ctx.resume();
      if (request !== playRequest) return;
      if (document.hidden) { resumeAfterVisibility = true; void ctx.suspend(); }
      // Keep the previous complete room response while a replacement builds.
      do {
        await buildIR();
        if (request !== playRequest) return;
      } while (state.irKey !== roomKey(SIM.room()));
      if (key === 'mic') {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone input is not available here (it needs https or localhost in most browsers).');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        if (request !== playRequest) { stream.getTracks().forEach(tk => tk.stop()); return; }
        try {
          const src = ctx.createMediaStreamSource(stream);
          const g = ctx.createGain(); g.gain.value = 8;
          src.connect(g); g.connect(programTrim);
          player = { stop() { try { src.disconnect(); g.disconnect(); } catch { /* */ } stream.getTracks().forEach(tk => tk.stop()); } };
        } catch (e) { stream.getTracks().forEach(tk => tk.stop()); throw e; }
      } else {
        const { buffer, gain } = await getBuffer(key);
        if (request !== playRequest) return;
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
      if (request !== playRequest) return;
      state.error = e.message || String(e);
      state.playing = false;
    }
    if (request === playRequest) { state.loading = false; refreshPanel(); }
  }
  function stop(silent) {
    playRequest++;
    if (player) { player.stop(); player = null; }
    state.playing = state.loading = false;
    if (ctx) for (const ch of [...chains.values(), talker].filter(Boolean)) setParam(ch.input.gain, 0, 0.02);
    if (!silent) refreshPanel();
  }

  /* --------------------------------------------------------------- meter */
  let meterEl = null, meterData = null, meterTimer = null;
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
    clearTimeout(meterTimer); meterTimer = null;
    if (!meterEl?.isConnected || !analyser || document.hidden) return;
    const dbfs = outputLevels()?.peakDb ?? -Infinity;
    meterEl.style.width = Math.max(0, Math.min(100, (dbfs + 50) * 2)) + '%';
    meterEl.classList.toggle('hot', dbfs > -3);
    meterTimer = setTimeout(meterLoop, 100);
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
        <button id="simAudioPlay" class="sim-primary">${state.loading ? '■ Cancel' : state.playing ? '■ Stop' : '▶ Play'}</button>
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
    el.querySelector('#simAudioPlay').addEventListener('click', () => (state.playing || state.loading) ? stop() : (state.source === 'file' && !fileBuffer ? el.querySelector('#simAudioFile').click() : play(el.querySelector('#simAudioSource').value)));
    el.querySelector('#simAudioSource').addEventListener('change', e => {
      state.source = e.target.value;
      if (state.source === 'file' && !fileBuffer) { stop(); el.querySelector('#simAudioFile').click(); }
      else if (state.playing || state.loading) play(state.source);
    });
    el.querySelector('#simAudioFile').addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if (!f) return;
      stop(true);
      const request = playRequest;
      state.loading = true; state.error = null; refreshPanel();
      try {
        ensureContext();
        const data = await f.arrayBuffer();
        if (request !== playRequest) return;
        const decoded = await ctx.decodeAudioData(data);
        if (request !== playRequest) return;
        fileBuffer = decoded; delete buffers.file; state.fileName = f.name;
        await play('file');
      } catch (err) {
        if (request !== playRequest) return;
        state.loading = false; state.error = 'Could not decode this file: ' + err.message; refreshPanel();
      }
    });
    el.querySelector('#simAudioVolume').addEventListener('input', e => { state.volume = Number(e.target.value); e.target.nextElementSibling.textContent = Math.round(state.volume * 100) + ' %'; if (master) setParam(master.gain, state.volume, 0.03); });
    el.querySelector('#simAudioFans').addEventListener('change', e => { state.fans = e.target.checked; syncFans(); });
    el.querySelector('#simAudioNoise').addEventListener('change', e => { state.noise = e.target.checked; syncNoise(); });
    el.querySelector('#simSeatCentral').addEventListener('click', () => document.getElementById('centralSeatView')?.click());
    el.querySelector('#simSeatOuter').addEventListener('click', () => document.getElementById('outerSeatView')?.click());
    meterEl = el.querySelector('#simMeter');
    meterLoop(); renderHere();
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
  SIM.on('items', () => { invalidateAcoustics(); if (ctx) { syncChains(); scheduleIR(); } });
  SIM.on('seats', () => { invalidateAcoustics(); if (ctx) scheduleIR(); });
  SIM.on('settings', ({ key }) => {
    invalidateAcoustics();
    if (!ctx) return;
    // Keyless notifications restore/import all settings at once.
    if (!key || ['occupancy', 'openings', 'roofFinish', 'entranceFinish', 'tempC', 'rh'].includes(key)) scheduleIR();
    if (!key || key === 'talker') syncChains();
    if (!key || key === 'ambientDbA') syncNoise();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeAfterVisibility = !!ctx && ctx.state === 'running';
      if (resumeAfterVisibility) void ctx.suspend();
    } else if (resumeAfterVisibility && ctx) {
      resumeAfterVisibility = false; void ctx.resume();
    }
    meterLoop();
  });
})();
