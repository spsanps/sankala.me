/* Plates — July 2026, suminagashi.
   Winning by Overfitting: an LLM in a loop with the benchmark's own evaluator. Ink is dropped
   on water again and again at one point; every drop pushes the earlier rings outward.
   Loop after loop becomes a target, and the last drop, the only red one, lands dead centre.
   Earlier ring sets near the edges are the attempts that got pushed aside.
   Process: real floating-ink maths. Each drop of radius r at c moves every earlier point p to
   c + (p − c)·√(1 + r²/|p − c|²), which preserves area exactly; a stylus pull shifts points along
   a line by z·λ/(d + λ). The shader inverts the whole history per pixel. A slow current keeps
   the rings drifting, as if the sheet has not been lifted off the water yet. */
(function () {
  'use strict';
  const { rng, sheet, GL, paper } = window.PK;

  const MAX = 104; // two vec4 arrays stay under the 224-vector fragment uniform floor
  const FS = `#version 300 es
precision highp float;
#define MAXOPS ${MAX}
uniform vec4 uA[MAXOPS]; uniform vec4 uB[MAXOPS]; uniform int uN;
uniform vec2 uRes; uniform vec3 uSheet; uniform float uTime;
uniform sampler2D uPaper; uniform int uSamples;
out vec4 o;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= .5; } return s; }
const float TAU = 6.28318530718;
vec4 trace(vec2 fc){
  vec2 p = (fc - uSheet.xy) / uSheet.z;
  // the sheet is still floating: an off-centre eddy that breathes, and a faint drift
  vec2 ec = vec2(0.66, 0.5);
  vec2 d0 = p - ec; float r0 = dot(d0, d0);
  float ang = 0.20 * sin(TAU * uTime / 14.) * exp(-r0 / 0.09);
  float ca = cos(-ang), sa = sin(-ang);
  p = ec + vec2(ca * d0.x - sa * d0.y, sa * d0.x + ca * d0.y);
  p += 0.006 * vec2(sin(TAU * uTime / 14. + p.y * 7.), cos(TAU * uTime / 7. + p.x * 5.)) * 0.5;
  p += 0.0032 * (vec2(noise(p * 11. + 3.1), noise(p * 11. + 7.7)) - 0.5);
  for (int i = MAXOPS - 1; i >= 0; i--) {
    if (i >= uN) continue;
    vec4 a = uA[i], b = uB[i];
    if (a.x < 0.5) {
      vec2 d = p - a.yz; float r2 = dot(d, d), R2 = a.w * a.w;
      if (r2 < R2) {
        // rho runs 0 at the ring's inner edge to 1 at its outer edge: soften the outer edge
        // and let pigment gather there, the way floating ink does
        float rho = sqrt(r2 / R2);
        float k = smoothstep(1.0, 0.93, rho) * (0.86 + 0.32 * smoothstep(0.62, 0.95, rho));
        return vec4(b.x, b.y * k, d / a.w * 0.7 + vec2(float(i) * 1.37, float(i) * 0.71));
      }
      p = a.yz + d * sqrt(1. - R2 / r2);
    } else if (a.x > 1.5) {
      // water moved between drops: a small smooth displacement
      p += a.y * (vec2(noise(p * a.z + a.w), noise(p * a.z + a.w + 17.3)) - 0.5);
    } else {
      vec2 M = b.xy; vec2 N = vec2(-M.y, M.x);
      float dd = abs(dot(p - a.yz, N));
      p -= M * b.z * b.w / (dd + b.w);
    }
  }
  return vec4(-1., 0., p * 8.);
}
vec3 ink(float id){
  if (id < 0.5) return vec3(1.);
  if (id < 1.5) return vec3(0.115, 0.11, 0.13);
  if (id < 2.5) return vec3(0.24, 0.34, 0.6);
  return vec3(0.86, 0.29, 0.2);
}
void main(){
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec3 pap = texture(uPaper, fc / uRes).rgb;
  vec3 acc = vec3(0.);
  for (int s = 0; s < 4; s++) {
    if (s >= uSamples) break;
    vec2 off = uSamples == 2 ? (s == 0 ? vec2(-0.25, -0.25) : vec2(0.25, 0.25)) : (s == 0 ? vec2(0.12, -0.38) : s == 1 ? vec2(0.38, 0.12) : s == 2 ? vec2(-0.12, 0.38) : vec2(-0.38, -0.12));
    vec4 r = trace(fc + off);
    vec3 col = pap;
    if (r.x > 0.5) {
      float n = fbm(r.zw * 2.6);
      float grain = noise(fc * 0.9) * 0.5 + noise(fc * 0.33) * 0.5;
      float d = clamp(r.y * (0.66 + 0.56 * n) * (0.86 + 0.28 * grain), 0., 1.);
      col = pap * mix(vec3(1.), ink(r.x), d);
    }
    acc += col;
  }
  o = vec4(acc / float(uSamples), 1.);
}`;

  function history() {
    const A = [], B = [];
    const r = rng(726);
    const drop = (cx, cy, rad, id, dens) => { A.push(0, cx, cy, rad); B.push(id, dens, 0, 0); };
    const tine = (bx, by, mx, my, z, lam) => { const m = Math.hypot(mx, my); A.push(1, bx, by, 0); B.push(mx / m, my / m, z, lam); };
    const warp = (amp, freq) => { A.push(2, amp, freq, r() * 100); B.push(0, 0, 0, 0); };
    // earlier attempts: ring sets near the edges that the loop will push aside
    const sats = [[0.1, 0.1, 8], [0.88, 0.16, 7], [0.06, 0.66, 7], [0.95, 0.72, 6], [0.2, 1.12, 7], [0.8, 1.16, 7], [0.52, 1.2, 6], [0.48, 0.02, 6]];
    sats.forEach(([cx, cy, n], si) => {
      for (let k = 0; k < n; k++) {
        const ink = k % 2 === 0;
        const id = ink ? ((k + si) % 4 === 0 ? 2 : 1) : 0;
        drop(cx + (r() - 0.5) * 0.006, cy + (r() - 0.5) * 0.006, ink ? 0.03 + r() * 0.03 : 0.028 + r() * 0.032, id, ink ? 0.7 + r() * 0.22 : 0);
      }
    });
    warp(0.03, 3.1);
    warp(0.012, 7.3);
    // the loop: drop after drop at one point, with the water never quite still
    const c = [0.5, 0.62];
    const pattern = [[1, 0.05], [0, 0.034], [1, 0.018], [0, 0.04], [2, 0.038], [0, 0.03], [1, 0.034], [0, 0.046], [1, 0.016], [0, 0.034], [2, 0.026], [0, 0.038]];
    for (let k = 0; k < 36; k++) {
      const [id, rad] = pattern[k % pattern.length];
      drop(c[0] + (r() - 0.5) * 0.003, c[1] + (r() - 0.5) * 0.003, rad * (0.85 + r() * 0.3) * 1.55, id, id ? 0.74 + r() * 0.2 : 0);
      if (k === 12 || k === 24) warp(0.008, 8.5);
    }
    // the surface keeps moving after the last drop: this is what makes rings wander
    warp(0.04, 2.6);
    warp(0.012, 7.5);
    // the one that passes
    drop(c[0], c[1], 0.026, 0, 0);
    drop(c[0], c[1], 0.02, 3, 0.95);
    return { A: new Float32Array(A), B: new Float32Array(B), n: A.length / 4 };
  }

  const def = {
    words: 'Winning by Overfitting: a loop that kept hitting the evaluator’s mark',
    process: 'suminagashi marbling',
    alt: 'concentric rings of black and indigo ink floating on paper, built up drop after drop into a target, with a single red drop at the centre and smaller ring sets pushed out to the edges.',
    fps: 20,
    still: 5,
    reelOffset: 1,
    build(w, h) {
      const S = sheet(w, h);
      const st = { w, h, S, gl: !!GL.init(), hist: history() };
      st.paper = paper(w, h, { base: '#efe9db', seed: 726, scale: S.s / 600 * 1.2, fibres: 1.1, mottle: 0.03, flecks: 0.3 });
      if (st.gl) st.ptex = GL.texture(st.paper);
      return st;
    },
    draw(ctx, st, t) {
      if (!st.gl) { ctx.drawImage(st.paper, 0, 0); return; }
      const H = st.hist;
      const A = new Float32Array(MAX * 4), B = new Float32Array(MAX * 4);
      A.set(H.A.subarray(0, Math.min(H.A.length, MAX * 4))); B.set(H.B.subarray(0, Math.min(H.B.length, MAX * 4)));
      const cv = GL.run('marbling', FS, st.w, st.h, {
        uA: ['4fv', A], uB: ['4fv', B], uN: ['1i', Math.min(MAX, H.n)], uRes: ['2f', st.w, st.h],
        uSheet: ['3f', st.S.x, st.S.y, st.S.s], uTime: ['1f', t], uSamples: ['1i', st.w * st.h > 1.2e6 ? 2 : 4],
      }, { uPaper: st.ptex });
      ctx.drawImage(cv, 0, 0);
    },
    label(ctx, st, name) {
      const S = st.S, fs = Math.round(S.L(0.026));
      ctx.save();
      const x = Math.max(S.L(0.05), S.X(0.06)), y = st.h - Math.max(fs * 2.2, S.L(0.06));
      ctx.font = `600 ${fs}px "Cormorant SC", Georgia, serif`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.12}px`;
      const tw = ctx.measureText(name.toUpperCase()).width;
      ctx.fillStyle = 'rgba(40,30,20,0.12)'; ctx.fillRect(x - fs * 0.5 + 2, y - fs * 1.15 + 3, tw + fs * 2.2, fs * 1.75);
      ctx.fillStyle = '#f3eee2'; ctx.fillRect(x - fs * 0.5, y - fs * 1.15, tw + fs * 2.2, fs * 1.75);
      ctx.fillStyle = 'rgba(190,60,40,0.92)'; ctx.beginPath(); ctx.arc(x + fs * 0.35, y - fs * 0.35, fs * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(28,27,32,0.85)'; ctx.font = `600 ${fs}px "Cormorant SC", Georgia, serif`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.12}px`;
      ctx.fillText(name.toUpperCase(), x + fs * 1.0, y);
      ctx.restore();
    },
  };
  (window.PLATE_DEFS = window.PLATE_DEFS || {})['2026-07'] = def;
})();
