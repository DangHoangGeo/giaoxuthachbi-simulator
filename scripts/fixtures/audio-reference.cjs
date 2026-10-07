/* Original synthesis from f7b3d91 simulator/audio.js, preserved unchanged in
 * sample arithmetic/order as an independent parity oracle. Not production code. */
  function biquadBandpass(f, sr) {
    const w = 2 * Math.PI * f / sr, alpha = Math.sin(w) * Math.sinh(Math.LN2 / 2 * 1.0 * w / Math.sin(w));
    const b0 = alpha, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
    return [b0 / a0, 0, b2 / a0, a1 / a0, a2 / a0];
  }
  function referenceIR(ctx, room, P) {
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
    return ir;
  }

  function referenceStipa(ctx, P) {
    const mods = [[1.6, 8], [1, 5], [0.63, 3.15], [2, 10], [1.25, 6.25], [0.8, 4], [2.5, 12.5]];
    const sr = ctx.sampleRate, buffer = ctx.createBuffer(1, sr * 20, sr);
    const d = buffer.getChannelData(0);
    {
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
    }
    return buffer;
  }
module.exports = { referenceIR, referenceStipa };
