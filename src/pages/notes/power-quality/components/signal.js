/* Power quality, read by a network — signals and the illustrative reader.
   Everything here is synthetic: textbook power-quality disturbances on a 230 V, 50 Hz wave,
   and a small hand-built stand-in for a recurrent network that reads one cycle at a time.
   It is NOT the 2019 paper's model or data. */
const PQ = {};
  const TAU = Math.PI * 2;
  PQ.TAU = TAU;
  PQ.SPC = 96;           // samples per 50 Hz cycle
  PQ.F = 50;             // mains frequency
  PQ.VPEAK = 325;        // 230 V rms

  PQ.KINDS = [
    { id: 'normal', label: 'Normal', key: 'NORMAL', what: 'a clean wave' },
    { id: 'sag', label: 'Sag', key: 'SAG', what: 'the voltage dips for a few cycles, like when a big motor starts' },
    { id: 'swell', label: 'Swell', key: 'SWELL', what: 'the voltage rises for a few cycles' },
    { id: 'interruption', label: 'Interruption', key: 'INTERRUPT', what: 'the supply drops out almost completely' },
    { id: 'harmonics', label: 'Harmonics', key: 'HARMONICS', what: 'the wave is bent out of shape, as rectifiers and chargers do' },
    { id: 'transient', label: 'Transient', key: 'TRANSIENT', what: 'a sudden spike rings out and dies away' },
    { id: 'notch', label: 'Notch', key: 'NOTCH', what: 'small regular bites out of every cycle' },
    { id: 'flicker', label: 'Flicker', key: 'FLICKER', what: 'the amplitude wobbles slowly, too slowly to see in one cycle' },
  ];
  PQ.KIND_IDS = PQ.KINDS.map(k => k.id);

  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * r()); }
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  PQ.rng = rng; PQ.gauss = gauss; PQ.clamp = clamp;

  // One acquisition: N cycles of wave with the chosen disturbance placed by the seed.
  PQ.generate = function (kind, N, seed) {
    const SPC = PQ.SPC, n = N * SPC, x = new Float32Array(n), r = rng(seed * 7919 + 13);
    const info = { kind, start: -1, len: 0 };
    let s0 = 0, dur = 0;
    if (kind === 'sag' || kind === 'swell' || kind === 'interruption') {
      dur = N <= 5 ? 2 : N <= 10 ? 3 + Math.floor(r() * 2) : 4 + Math.floor(r() * 5);
      const lo = Math.max(1, Math.round(N * 0.22)), hi = Math.max(lo, N - dur - 1);
      s0 = lo + r() * (hi - lo);
      info.start = s0; info.len = dur;
    }
    const level = kind === 'sag' ? 0.42 + r() * 0.16 : kind === 'swell' ? 1.17 + r() * 0.05 : kind === 'interruption' ? 0.03 : 1;
    const ph3 = r() * TAU, ph5 = r() * TAU, ph7 = r() * TAU;
    const tr0 = (0.22 + r() * 0.56) * N;
    if (kind === 'transient') { info.start = tr0; info.len = 0.35; }
    const phm = r() * TAU;
    const noise = rng(seed * 31 + 7);
    for (let k = 0; k < n; k++) {
      const c = k / SPC, th = TAU * c;
      let a = 1;
      if (dur && c >= s0 && c < s0 + dur) a = level;
      if (kind === 'flicker') a = 1 + 0.115 * Math.sin(TAU * 8.8 * (c / PQ.F) + phm); // 8.8 Hz, where flicker is most visible
      let v = a * Math.sin(th);
      if (kind === 'harmonics') v += 0.17 * Math.sin(3 * th + ph3) + 0.1 * Math.sin(5 * th + ph5) + 0.06 * Math.sin(7 * th + ph7);
      if (kind === 'notch') {
        // six commutation notches a cycle, flat-bottomed, as a six-pulse rectifier leaves them
        const p = (c * 6 + 0.21) % 1, w = 0.075;
        if (p < w) { const q = Math.min(1, Math.sin(Math.PI * p / w) * 1.8); v *= 1 - 0.6 * q; }
      }
      if (kind === 'transient' && c >= tr0) { const dt = (c - tr0) / PQ.F; v += 0.95 * Math.exp(-dt / 0.0021) * Math.sin(TAU * 820 * dt); }
      x[k] = v + gauss(noise) * 0.006;
    }
    return { x, info, N, kind, seed };
  };

  // What the reader sees in one cycle: the fundamental's size, and what is left once it is removed.
  PQ.features = function (x, i) {
    const SPC = PQ.SPC, o = i * SPC;
    let s2 = 0, a = 0, b = 0;
    for (let k = 0; k < SPC; k++) { const v = x[o + k], th = TAU * k / SPC; s2 += v * v; a += v * Math.sin(th); b += v * Math.cos(th); }
    a *= 2 / SPC; b *= 2 / SPC;
    const A1 = Math.hypot(a, b);
    let r2 = 0, rp = 0;
    for (let k = 0; k < SPC; k++) {
      const th = TAU * k / SPC, rr = x[o + k] - (a * Math.sin(th) + b * Math.cos(th));
      r2 += rr * rr; if (Math.abs(rr) > rp) rp = Math.abs(rr);
    }
    const rr = Math.sqrt(r2 / SPC);
    return { rms: Math.sqrt(s2 / SPC), A1, rr, rp, peaky: rp / (rr + 1e-6) };
  };

  // The illustrative reader. Per cycle it turns features into evidence, keeps a memory (latched
  // events, running averages, a count of spiky cycles, the spread of amplitudes seen so far),
  // and turns the memory into confidence for each class.
  PQ.read = function (sig) {
    const N = sig.N, steps = [];
    const S = { sag: 0, swell: 0, interruption: 0, harmonics: 0, transient: 0, notch: 0, flicker: 0 };
    let spikeN = 0, spikeMax = 0, harmSum = 0;
    const spikes = [];
    const A = [];
    for (let i = 0; i < N; i++) {
      const f = PQ.features(sig.x, i);
      A.push(f.A1);
      const eInt = clamp((0.3 - f.A1) / 0.15);
      const eSag = clamp((0.86 - f.A1) / 0.18) * (1 - eInt);
      const eSwell = clamp((f.A1 - 1.13) / 0.04);
      const amp = Math.max(eInt, eSag, eSwell);
      // a cycle where the amplitude steps also leaves a residual; don't mistake the step for a spike
      const edge = i > 0 && Math.abs(A[i] - A[i - 1]) > 0.12 ? 1 : 0;
      // spikes only count in cycles whose amplitude (and the one before) is normal
      const steady = (f.A1 > 0.84 && f.A1 < 1.16 ? 1 : 0) * (i > 0 ? clamp(1 - Math.abs(A[i] - A[i - 1]) / 0.08) : 1);
      const rel = f.rr / Math.max(f.A1, 0.2);
      const eHarm = clamp((rel - 0.05) / 0.08) * clamp((3.6 - f.peaky) / 1.0) * (1 - amp) * (1 - edge);
      const eSpike = clamp((f.rp - 0.16) / 0.22) * clamp((f.peaky - 2.6) / 1.2) * (1 - amp) * (1 - edge) * steady;
      S.sag = Math.max(S.sag * 0.985, eSag);
      S.swell = Math.max(S.swell * 0.985, eSwell);
      S.interruption = Math.max(S.interruption * 0.985, eInt);
      harmSum += eHarm;
      S.harmonics = (harmSum / (i + 1)) * clamp((i + 1) / 2);
      // a spike that rings into the next cycle is one burst; spikes in nearly every cycle are notching
      const spiky = eSpike > 0.3;
      spikes[i] = spiky ? eSpike : 0;
      // if the amplitude drops or jumps now, the spike just before it was the step's edge: take it back
      if (amp > 0.5 && i > 0 && spikes[i - 1]) spikes[i - 1] = 0;
      spikeN = spikes.filter(Boolean).length;
      spikeMax = Math.max(0, ...spikes);
      const frac = spikeN / (i + 1);
      S.notch = spikeN >= 3 ? clamp((frac - 0.45) / 0.35) * clamp(spikeMax * 1.6) : 0;
      S.transient = spikeN >= 1 ? clamp(spikeMax * 1.15) * (1 - S.notch) * (spikeN >= 3 && frac > 0.6 ? 0.3 : 1) : 0;
      if (i >= 2) {
        const m = A.reduce((s, v) => s + v, 0) / A.length;
        const sd = Math.sqrt(A.reduce((s, v) => s + (v - m) * (v - m), 0) / A.length);
        S.flicker = clamp((sd - 0.022) / 0.035) * (1 - Math.max(S.sag, S.swell, S.interruption)) * clamp(1 - S.harmonics);
      }
      // an interruption passes through sag levels on its way down; let it win
      const Sx = { ...S, sag: S.sag * (1 - S.interruption) };
      steps.push({ f, S: Sx, p: PQ.probs(Sx), ev: { eSag, eSwell, eInt, eHarm, eSpike } });
    }
    return steps;
  };

  PQ.probs = function (S) {
    let mx = 0; for (const k in S) mx = Math.max(mx, S[k]);
    const z = { normal: 3.3 * (1 - mx) + 0.3 };
    for (const k in S) z[k] = 4.6 * S[k];
    let sum = 0; const p = {};
    for (const id of PQ.KIND_IDS) { p[id] = Math.exp(z[id]); sum += p[id]; }
    for (const id of PQ.KIND_IDS) p[id] /= sum;
    return p;
  };
  PQ.top = p => PQ.KIND_IDS.reduce((a, b) => (p[b] > p[a] ? b : a), 'normal');

  // A small fixed projection that turns a cycle's features into the 4×4 "hidden state" pattern
  // drawn in each cell. Decorative, but deterministic and driven by the real features.
  const proj = (() => { const r = rng(4242); return Array.from({ length: 16 }, () => Array.from({ length: 7 }, () => gauss(r) * 1.2)); })();
  PQ.hidden = function (step) {
    const f = step.f, S = step.S;
    const v = [f.A1 - 1, f.rr * 6, f.rp * 2, f.peaky / 4 - 0.8, S.sag + S.interruption - S.swell, S.harmonics + S.notch, S.flicker + S.transient];
    return proj.map(row => (Math.tanh(row.reduce((s, w, j) => s + w * v[j], 0)) + 1) / 2);
  };

export default PQ;
