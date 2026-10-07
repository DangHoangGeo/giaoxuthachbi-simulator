/* Audio runtime regression checks. No audio device, network or microphone needed. */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { referenceIR, referenceStipa } = require('./fixtures/audio-reference.cjs');
const dir = path.resolve(__dirname, '../Thach_Bi_Viewer/simulator');
const P = { OCTAVES: [125, 250, 500, 1000, 2000, 4000, 8000], SPEECH_SPECTRUM: [-3, -2, -1, 0, -1, -6, -12] };
function buffer(channels, n, sr) {
  const data = Array.from({ length: channels }, () => new Float32Array(n));
  return { numberOfChannels: channels, length: n, sampleRate: sr, duration: n / sr, getChannelData: ch => data[ch] };
}
const deferred = () => { let resolve, reject; const promise = new Promise((r, j) => { resolve = r; reject = j; }); return { promise, resolve, reject }; };
const tick = async () => { for (let i = 0; i < 16; i++) await Promise.resolve(); };
const summary = {};
async function synthesis() {
  let yields = 0;
  const box = { window: {}, performance, setTimeout: (fn, ms) => { yields++; return setTimeout(fn, ms); } };
  vm.runInNewContext(fs.readFileSync(path.join(dir, 'audio-synthesis.js'), 'utf8'), box);
  const synth = box.window.CHURCH_AUDIO_SYNTHESIS;
  const equal = (a, b) => {
    assert.equal(a.numberOfChannels, b.numberOfChannels); assert.equal(a.length, b.length);
    for (let ch = 0; ch < a.numberOfChannels; ch++) assert(Buffer.from(a.getChannelData(ch).buffer).equals(Buffer.from(b.getChannelData(ch).buffer)), 'every sample bit matches original synthesis');
  };
  let samples = 0;
  for (const sr of [44100, 48000]) {
    const ctx = { sampleRate: sr, createBuffer: buffer };
    for (const T of [[.4, .3, .2, .15, .13, .12, .1], [1.99, 1.55, 1.20, 1.10, 1.08, 1.07, .92], [10, 9, 8, 7, 6, 5, 4]]) {
      const room = { T, Tmid: (T[2] + T[3]) / 2 };
      const expected = referenceIR(ctx, room, P), actual = await synth.makeIR(ctx, room, P);
      equal(actual, expected); samples += actual.length * 2;
    }
    const stipa = await synth.makeStipa(ctx, P); equal(stipa, referenceStipa(ctx, P)); samples += stipa.length;
  }
  // Skip-band behavior is also unchanged at a low sample rate.
  const low = { sampleRate: 8000, createBuffer: buffer }, room = { T: Array(7).fill(2), Tmid: 2 };
  equal(await synth.makeIR(low, room, P), referenceIR(low, room, P));
  let cancelled = false;
  const job = synth.makeIR({ sampleRate: 48000, createBuffer: buffer }, room, P, () => cancelled);
  setTimeout(() => { cancelled = true; }, 10);
  assert.equal(await job, null); assert(yields > 10, 'long synthesis yields to browser tasks');
  summary.synthesis = { bitIdenticalSamples: samples, sampleRates: [44100, 48000], lowRateSkipBands: true, yieldedTasks: yields, cancellation: true };
}
function harness() {
  let now = 1000, timerId = 0, arrivals = 0, readouts = 0;
  let currentRoom = { T: Array(7).fill(1), Tmid: 1, A: Array(7).fill(50), airDb: Array(7).fill(.01), V: 1000 };
  const timers = new Map(), events = {}, documentEvents = {}, nodes = [], decodeJobs = [], micJobs = [], irJobs = [], signalJobs = [];
  const speakers = [1, 2].map(i => ({ id: 's' + i, on: true, item: { name: 'Speaker ' + i }, spec: { response: Array(7).fill(0) }, src: { pos: [i, 3, 0], level1m: 70, delayMs: 0 } }));
  const fan = { id: 'fan', running: true, pos: [0, 3, 0], dBA: 45, diameter: 1, rpm: 120, kind: 'wall' };
  class Param { constructor() { this.value = 0; this.calls = []; } cancelScheduledValues() {} setTargetAtTime(v) { this.value = v; this.calls.push(v); } setValueAtTime(v) { this.value = v; this.calls.push(v); } }
  class Node {
    constructor(kind) { this.kind = kind; this.edges = new Set(); this.removedEdges = []; nodes.push(this); for (const n of ['gain', 'frequency', 'Q', 'delayTime', 'threshold', 'knee', 'ratio', 'attack', 'release', 'positionX', 'positionY', 'positionZ']) this[n] = new Param(); }
    connect(n) { this.edges.add(n); return n; }
    disconnect(n) { if (n) { assert(this.edges.has(n)); this.edges.delete(n); this.removedEdges.push(n); } else this.edges.clear(); }
    start() { this.started = true; } stop() { this.stopped = true; }
    getFloatTimeDomainData(data) { data.fill(.1); }
  }
  class Context {
    constructor() { this.sampleRate = 8000; this.currentTime = 1; this.state = 'suspended'; this.destination = new Node('destination'); this.listener = {}; for (const name of ['position', 'forward', 'up']) for (const axis of ['X', 'Y', 'Z']) this.listener[name + axis] = new Param(); }
    createGain() { return new Node('gain'); } createDynamicsCompressor() { return new Node('compressor'); }
    createAnalyser() { return new Node('analyser'); } createConvolver() { return new Node('convolver'); }
    createPanner() { return new Node('panner'); } createBiquadFilter() { return new Node('filter'); }
    createDelay() { return new Node('delay'); } createBufferSource() { return new Node('source'); }
    createOscillator() { return new Node('oscillator'); } createMediaStreamSource() { return new Node('microphone'); }
    createBuffer(...args) { return buffer(...args); }
    async resume() { if (this.resumeJob) await this.resumeJob.promise; this.state = 'running'; }
    async suspend() { this.state = 'suspended'; }
    decodeAudioData() { const job = deferred(); decodeJobs.push(job); return job.promise; }
  }
  const SIM = {
    state: { settings: { talker: false, talkerDbA: 62, ambientDbA: 40 } }, THREE: { Vector3: class {} }, GEO: { occluders: [] },
    speakers: () => speakers, fans: () => [fan], mics: () => [], worldFrame: () => ({}), room: () => currentRoom, roomCouplingAt: () => 1,
    analysis: { pointValues: () => { readouts++; return { spl: 70, sti: .6, noise: 40 }; } },
    on: (name, fn) => { (events[name] ||= []).push(fn); }
  };
  const physics = { ...P, stiRating: () => 'good', sourceArrivals: (src, spec, rx) => { arrivals++; return { direct: Array(7).fill(src.level1m + rx[0]), reflected: Array(7).fill(currentRoom.Tmid), tau: .1 + src.delayMs / 1000 }; } };
  const document = { hidden: false, addEventListener: (name, fn) => { documentEvents[name] = fn; }, getElementById: () => null };
  const box = { window: { CHURCH_SIMULATOR: SIM, CHURCH_SIM_PHYSICS: physics, AudioContext: Context,
    CHURCH_SIM_SAMPLES: { 'speech-vi': { data: 'AA==' }, 'speech-en': { data: 'AA==' } },
    CHURCH_AUDIO_SYNTHESIS: { makeStipa: () => { const job = deferred(); signalJobs.push(job); return job.promise; }, makeIR: async (ctx, room, p, cancelled) => { const job = deferred(); irJobs.push({ ...job, key: room.T.join(','), cancelled }); await job.promise; return cancelled() ? null : ctx.createBuffer(2, 32, ctx.sampleRate); } }
  }, navigator: { mediaDevices: { getUserMedia: () => { const job = deferred(); micJobs.push(job); return job.promise; } } }, document, console, atob,
    performance: { now: () => now }, setTimeout: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; }, clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(fs.readFileSync(path.join(dir, 'audio.js'), 'utf8'), box);
  const A = SIM.audio; A.state.noise = A.state.fans = false;
  const emit = (name, value) => events[name]?.forEach(fn => fn(value));
  const flush = ms => { for (const [id, t] of [...timers]) if (t.ms === ms) { timers.delete(id); t.fn(); } };
  const camera = { position: { x: 1, y: 1.6, z: 2 }, direction: { x: 1, y: 0, z: 0 }, getWorldDirection(v) { return Object.assign(v, this.direction); } };
  const frame = () => { now += 100; emit('frame', { camera }); };
  const decoded = () => { const b = buffer(1, 100, 8000); b.getChannelData(0).fill(.2); return b; };
  return { A, SIM, emit, flush, nodes, decodeJobs, micJobs, irJobs, signalJobs, fan, camera, frame, decoded, document, documentEvents, timers,
    setRoom: T => { currentRoom = { ...currentRoom, T: Array(7).fill(T), Tmid: T }; },
    get arrivals() { return arrivals; }, get readouts() { return readouts; } };
}
async function ready(h) { const p = h.A.play('clap'); await tick(); h.irJobs.at(-1).resolve(); await p; assert(h.A.state.playing); }
async function lifecycle() {
  const h = harness(), { A } = h;
  // Stop while the initial IR is still running must prevent a source starting.
  const initial = A.play('clap'); await tick(); A.stop(); h.irJobs[0].resolve(); await initial;
  assert(!A.state.playing && !A.state.loading); assert.equal(h.nodes.filter(n => n.kind === 'source').length, 0);
  await A.play('clap'); assert(A.state.playing);
  // Resume is asynchronous too.
  A.context.resumeJob = deferred(); const resuming = A.play('clap'); A.stop(); A.context.resumeJob.resolve(); await resuming; delete A.context.resumeJob;
  assert(!A.state.playing);
  // A decode resolving or rejecting after Stop/newer Play cannot publish state.
  const decoding = A.play('speech-vi'); await tick(); assert.equal(h.decodeJobs.length, 1); A.stop(); h.decodeJobs[0].resolve(h.decoded()); await decoding;
  assert(!A.state.playing);
  const stale = A.play('speech-en'); await tick(); await A.play('clap'); h.decodeJobs[1].reject(new Error('obsolete decode')); await stale;
  assert(A.state.playing); assert.equal(A.state.error, null); assert.equal(A.state.source, 'clap');
  // A simultaneous same-sample request shares a single decode, with one player.
  const first = A.play('speech-en'); await tick(); const second = A.play('speech-en'); await tick(); assert.equal(h.decodeJobs.length, 3);
  h.decodeJobs[2].resolve(h.decoded()); await Promise.all([first, second]);
  assert.equal(h.nodes.filter(n => n.kind === 'source' && n.started && !n.stopped).length, 1);
  // Shared long synthesis may finish after Cancel but cannot start an old player.
  const signal1 = A.play('stipa'); await tick(); A.stop();
  const signal2 = A.play('stipa'); await tick(); assert.equal(h.signalJobs.length, 1);
  h.signalJobs[0].resolve(h.decoded()); await Promise.all([signal1, signal2]);
  assert(A.state.playing); assert.equal(h.nodes.filter(n => n.kind === 'source' && n.started && !n.stopped).length, 1);
  // Permission may return after Cancel; every stale track must be stopped.
  const mic = A.play('mic'); await tick(); let stopped = 0; A.stop(); h.micJobs[0].resolve({ getTracks: () => [{ stop: () => stopped++ }] }); await mic;
  assert.equal(stopped, 1); assert(!A.state.playing);
  const live = A.play('mic'); await tick(); h.micJobs[1].resolve({ getTracks: () => [{ stop: () => stopped++ }] }); await live; A.stop(); assert.equal(stopped, 2);
  // Retiring a chain removes only its bus edge and leaves other speakers live.
  const bus = h.nodes.find(n => n.edges.size === 2 && [...n.edges].every(e => e.kind === 'gain'));
  assert(bus); h.SIM.speakers().pop(); h.emit('items', {}); h.flush(120);
  assert.equal(bus.edges.size, 1); assert.equal(bus.removedEdges.length, 1);
  assert.equal(bus.removedEdges[0].edges.size, 0);
  // Stop retains established fan/background semantics, hidden tabs suspend them.
  h.A.state.fans = h.A.state.noise = true; h.emit('items', {});
  const activeAmbient = h.nodes.filter(n => n.kind === 'source' && n.started && !n.stopped).length;
  A.stop(); assert.equal(h.nodes.filter(n => n.kind === 'source' && n.started && !n.stopped).length, activeAmbient);
  h.document.hidden = true; h.documentEvents.visibilitychange(); assert.equal(A.context.state, 'suspended');
  h.document.hidden = false; h.documentEvents.visibilitychange(); await tick(); assert.equal(A.context.state, 'running');
  summary.lifecycle = { cancelResumeIRDecodeMic: true, staleDecodeErrorIgnored: true, sharedDecode: true, sharedLongSignal: true, oneCurrentPlayer: true, retiredBusEdgeReleased: true, hiddenAmbientSuspended: true };
}
async function activeChains() {
  const h = harness(), speakers = h.SIM.speakers();
  const spare = { ...speakers[0], id: 'spare', on: false }; speakers.push(spare);
  await ready(h); assert.equal(h.A.resources().speakerChains, 2, 'off speakers allocate no processing chain');
  spare.on = true; h.emit('items', {}); assert.equal(h.A.resources().speakerChains, 3);
  const bus = h.nodes.find(n => n.edges.size === 3 && [...n.edges].every(e => e.kind === 'gain'));
  const originalInputs = [...bus.edges];
  spare.on = false; h.emit('items', {}); assert.equal(h.A.resources().drainingSpeakerChains, 1);
  assert.equal(bus.edges.size, 3, 'delay contents can drain before teardown');
  spare.on = true; h.emit('items', {}); h.flush(1600); h.flush(120);
  assert.equal(h.A.resources().speakerChains, 3); assert.deepEqual([...bus.edges], originalInputs, 'quick mute/unmute reuses delay line');
  spare.on = false; h.emit('items', {}); h.flush(1600); h.flush(120);
  assert.equal(h.A.resources().speakerChains, 2); assert.equal(bus.edges.size, 2);
  const highpass = [...originalInputs[0].edges][0], lowpass = [...highpass.edges][0], count = h.nodes.length;
  speakers[0].spec.response = [-15, 0, 0, 0, 0, 0, -8]; h.emit('items', {});
  assert.equal(highpass.frequency.value, 220); assert.equal(lowpass.frequency.value, 6500); assert.equal(h.nodes.length, count, 'filter changes reuse the chain');
  summary.activeChains = { offSourcesAllocateNothing: true, delayedTailDrain: true, quickToggleReusesChain: true, filterUpdatesInPlace: true };
}
async function roomsAndCache() {
  const h = harness(); await ready(h); h.frame(); assert.equal(h.arrivals, 2);
  for (let i = 0; i < 10; i++) h.frame(); assert.equal(h.arrivals, 2, 'stationary propagation reused'); assert(h.readouts >= 2);
  h.camera.direction.z = .5; h.frame(); assert.equal(h.arrivals, 2); assert.equal(h.A.context.listener.forwardZ.value, .5);
  h.camera.position.x += 1e-10; h.frame(); assert.equal(h.arrivals, 4, 'no rounded receiver position');
  h.camera.position.y += .001; h.frame(); assert.equal(h.arrivals, 6);
  for (const event of [['items', {}], ['settings', {}], ['settings', { key: 'mixerDb' }], ['seats']]) {
    const before = h.arrivals; h.emit(...event); h.frame(); assert.equal(h.arrivals, before + 2);
  }
  const beforeRoom = h.arrivals; h.setRoom(1); h.frame(); assert.equal(h.arrivals, beforeRoom + 2, 'room identity also invalidates');
  // Stop/restart leaves propagation reusable while the gate follows playback.
  const before = h.arrivals; h.A.stop(); h.frame(); await h.A.play('clap'); h.frame(); assert.equal(h.arrivals, before);
  // Oscillating fan emitter positions remain live without an item event.
  h.A.state.fans = true; h.emit('items', {}); h.frame();
  const fanPanner = h.nodes.filter(n => n.kind === 'panner').at(-1), arrivalsBeforeFan = h.arrivals;
  h.fan.pos[0] += .04; h.frame(); assert.equal(fanPanner.positionX.value, .04); assert.equal(h.arrivals, arrivalsBeforeFan);
  // Applied A -> pending B -> A: B must never replace the existing buffer.
  const convolver = h.nodes.find(n => n.kind === 'convolver'), applied = convolver.buffer;
  h.setRoom(2); h.emit('settings', { key: 'entranceFinish' }); h.flush(50); await tick(); const b = h.irJobs.at(-1);
  h.setRoom(1); h.emit('items', {}); h.flush(50); await tick(); assert(b.cancelled()); b.resolve(); await tick(); assert.equal(convolver.buffer, applied);
  // A -> B -> C and matching in-flight requests: latest job only, no duplicate.
  h.setRoom(2); h.emit('seats'); h.flush(50); await tick(); const b2 = h.irJobs.at(-1);
  h.setRoom(3); h.emit('settings', {}); h.flush(50); await tick(); const c = h.irJobs.at(-1), count = h.irJobs.length;
  h.emit('items', {}); h.flush(50); await tick(); assert.equal(h.irJobs.length, count);
  b2.resolve(); await tick(); assert.equal(convolver.buffer, applied); c.resolve(); await tick(); assert.notEqual(convolver.buffer, applied); assert.equal(h.A.state.irKey, Array(7).fill('3.00').join(','));
  h.emit('settings', { key: 'quality' }); h.flush(50); await tick(); assert.equal(h.irJobs.length, count);
  summary.acoustics = { stationaryArrivalCalls: 2, orientationStillUpdates: true, exactMovementInvalidates: true, itemsSettingsSeatsInvalidate: true, movingFansStayLive: true, roomReturnCancelsObsoleteIR: true, latestIRWins: true, duplicateIRSuppressed: true };
}
async function fileAndMeter() {
  const h = harness(); await ready(h);
  const elements = new Map();
  const el = { isConnected: true, querySelector: key => {
    if (!elements.has(key)) elements.set(key, { isConnected: true, style: {}, classList: { toggle() {} }, addEventListener(name, fn) { this[name] = fn; }, click() {} });
    return elements.get(key);
  } };
  h.A.renderPanel(el);
  const file = { name: 'sample.wav', arrayBuffer: async () => new ArrayBuffer(1) };
  const pending = elements.get('#simAudioFile').change({ target: { files: [file] } }); await tick(); h.A.stop(); h.decodeJobs[0].resolve(h.decoded()); await pending;
  assert(!h.A.state.playing && !h.A.state.loading); assert.equal(h.A.state.fileName, null);
  assert([...h.timers.values()].some(t => t.ms === 100)); elements.get('#simMeter').isConnected = false; h.flush(100);
  assert(![...h.timers.values()].some(t => t.ms === 100), 'closed panel stops meter scheduling');
  summary.panel = { cancelFileDecode: true, closedMeterStops: true };
}
(async () => { await synthesis(); await lifecycle(); await activeChains(); await roomsAndCache(); await fileAndMeter(); console.log(JSON.stringify(summary, null, 2)); console.log('Audio synthesis, lifecycle, propagation cache and panel checks passed.'); })().catch(e => { console.error(e); process.exitCode = 1; });
