/* Plates — December 2025, mezzotint.
   GPT-7 Will Have Arms, and first place at the NeurIPS EAI Challenge with his brother:
   two robot arms lift one laurel wreath out of the dark.
   Process: a copper plate is "rocked" until it would print solid velvet black; the image is
   then burnished back toward light. Here a tonal scene is drawn first, then thresholded
   against a rocked burr texture (rows of rocker-tooth pits in many directions,
   equalised so ink coverage tracks tone exactly). */
(function () {
  'use strict';
  const { rng, canvas, clamp, sheet, GL } = window.PK;

  const FS = `#version 300 es
precision highp float;
uniform sampler2D uTone; uniform sampler2D uGrain;
uniform vec2 uRes; uniform float uGrainSize;
out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
void main(){
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float T = clamp(texture(uTone, fc / uRes).r, 0.0, 1.0);
  float g  = texture(uGrain, fc / uGrainSize).r;
  float g2 = texture(uGrain, fc / (uGrainSize * 2.71) + vec2(0.37, 0.61)).r;
  g = mix(g, g2, 0.22);
  float e = 0.085 + 0.06 * T;
  float ink = 1.0 - smoothstep(g - e, g + e, T);
  ink *= mix(0.94 + 0.06 * g2, 1.0, smoothstep(0.0, 0.22, T));
  vec3 paper = vec3(0.925, 0.898, 0.836);
  vec3 inkc  = vec3(0.070, 0.058, 0.050);
  float film = 0.06 * (1.0 - T) * (1.0 - T);
  vec3 col = mix(paper, inkc, clamp(ink + film, 0.0, 1.0));
  col *= 0.988 + 0.024 * h(fc * 0.37);
  o = vec4(col, 1.0);
}`;

  /* Rocked burr: rows of rocker-tooth pits laid in many directions, then equalised. */
  let grain = null, grainTex = null;
  function makeGrain() {
    if (grain) return grain;
    const G = 512, buf = new Float32Array(G * G), r = rng(1225);
    const passes = 9;
    for (let p = 0; p < passes; p++) {
      const a = (p / passes) * Math.PI + (r() - 0.5) * 0.2, ca = Math.cos(a), sa = Math.sin(a);
      const gap = 1.7 + r() * 0.5, step = 1.5 + r() * 0.4;
      for (let row = -G; row < G; row += gap) {
        const jitterRow = (r() - 0.5) * 0.6;
        for (let s = -G; s < G; s += step) {
          if (r() < 0.12) continue;
          const x = G / 2 + ca * s - sa * (row + jitterRow) + (r() - 0.5) * 0.7;
          const y = G / 2 + sa * s + ca * (row + jitterRow) + (r() - 0.5) * 0.7;
          const xi = ((Math.floor(x) % G) + G) % G, yi = ((Math.floor(y) % G) + G) % G;
          const fx = x - Math.floor(x), fy = y - Math.floor(y), v = 0.5 + r();
          const x1 = (xi + 1) % G, y1 = (yi + 1) % G;
          buf[yi * G + xi] += v * (1 - fx) * (1 - fy); buf[yi * G + x1] += v * fx * (1 - fy);
          buf[y1 * G + xi] += v * (1 - fx) * fy; buf[y1 * G + x1] += v * fx * fy;
        }
      }
    }
    for (let i = 0; i < buf.length; i++) buf[i] += r() * 0.9;
    // equalise: coverage at a threshold must equal tone
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < buf.length; i++) { mn = Math.min(mn, buf[i]); mx = Math.max(mx, buf[i]); }
    const B = 4096, hist = new Uint32Array(B);
    for (let i = 0; i < buf.length; i++) hist[Math.min(B - 1, ((buf[i] - mn) / (mx - mn) * B) | 0)]++;
    const cdf = new Float32Array(B); let acc = 0;
    for (let i = 0; i < B; i++) { acc += hist[i]; cdf[i] = acc / buf.length; }
    const data = new Uint8Array(G * G);
    for (let i = 0; i < buf.length; i++) data[i] = Math.round(cdf[Math.min(B - 1, ((buf[i] - mn) / (mx - mn) * B) | 0)] * 255);
    grain = { width: G, height: G, data };
    return grain;
  }

  const L = (() => { const v = [-0.5, -0.6, 0.66], n = Math.hypot(...v); return v.map((c) => c / n); })();

  function cylStops(nx, ny) {
    // brightness across a cylinder whose cross-section normal sweeps from -n to +n
    const stops = [];
    for (let i = 0; i <= 16; i++) {
      const s = -1 + i / 8, c = Math.sqrt(Math.max(0, 1 - s * s));
      const d = s * (nx * L[0] + ny * L[1]) + c * L[2];
      let b = 0.11 + 0.7 * Math.pow(Math.max(0, d), 1.0) + 0.38 * Math.pow(Math.max(0, d), 16);
      const away = s * (nx * L[0] + ny * L[1]) < 0 ? 1 : 0;
      b += away * 0.24 * Math.pow(Math.abs(s), 7); // burnished rim against the black
      stops.push([i / 16, clamp(b, 0, 1)]);
    }
    return stops;
  }
  function gray(v) { const c = Math.round(clamp(v, 0, 1) * 255); return `rgb(${c},${c},${c})`; }

  function segment(x, ax, ay, bx, by, w0, w1) {
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const nx = -Math.sin(a), ny = Math.cos(a), wm = Math.max(w0, w1);
    x.save(); x.translate(ax, ay); x.rotate(a);
    const g = x.createLinearGradient(0, -wm / 2, 0, wm / 2);
    cylStops(nx, ny).forEach(([o, b]) => g.addColorStop(o, gray(b)));
    x.fillStyle = g;
    x.beginPath(); x.moveTo(0, -w0 / 2); x.lineTo(len, -w1 / 2); x.lineTo(len, w1 / 2); x.lineTo(0, w0 / 2); x.closePath(); x.fill();
    // panel seam and end collars
    x.strokeStyle = 'rgba(0,0,0,0.55)'; x.lineWidth = Math.max(1, wm * 0.035);
    x.beginPath(); x.moveTo(len * 0.12, -w0 * 0.2); x.lineTo(len * 0.88, -w1 * 0.2); x.stroke();
    x.beginPath(); x.moveTo(len * 0.2, -w0 / 2); x.lineTo(len * 0.2, w0 / 2); x.moveTo(len * 0.8, -w1 / 2); x.lineTo(len * 0.8, w1 / 2); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = Math.max(1, wm * 0.02);
    x.beginPath(); x.moveTo(len * 0.12, -w0 * 0.2 - wm * 0.05); x.lineTo(len * 0.88, -w1 * 0.2 - wm * 0.05); x.stroke();
    x.restore();
  }

  function joint(x, cx, cy, r) {
    const g = x.createRadialGradient(cx + L[0] * r * 0.42, cy + L[1] * r * 0.42, r * 0.04, cx, cy, r);
    g.addColorStop(0, gray(0.97)); g.addColorStop(0.18, gray(0.72)); g.addColorStop(0.55, gray(0.26)); g.addColorStop(0.86, gray(0.06)); g.addColorStop(1, gray(0.14));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = Math.max(1, r * 0.06);
    x.beginPath(); x.arc(cx, cy, r * 0.62, 0, Math.PI * 2); x.stroke();
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + 0.3, bx = cx + Math.cos(a) * r * 0.62, by = cy + Math.sin(a) * r * 0.62;
      const lit = Math.max(0, -(Math.cos(a) * L[0] + Math.sin(a) * L[1]));
      x.fillStyle = gray(0.15 + 0.6 * lit); x.beginPath(); x.arc(bx, by, r * 0.07, 0, Math.PI * 2); x.fill();
    }
  }

  function gripper(x, S, wx, wy, gx, gy, side) {
    const a = Math.atan2(gy - wy, gx - wx), ca = Math.cos(a), sa = Math.sin(a);
    const palmLen = S.L(0.048), pw = S.L(0.074);
    const px = wx + ca * palmLen, py = wy + sa * palmLen;
    segment(x, wx, wy, px, py, pw * 0.9, pw);
    // two fingers that pinch the wreath's stem
    [-1, 1].forEach((k) => {
      const spread = 0.62 * k, bend = -0.95 * k;
      const r1 = S.L(0.06), r2 = S.L(0.05);
      const ox = px - sa * pw * 0.32 * k, oy = py + ca * pw * 0.32 * k;
      const k1x = ox + Math.cos(a + spread) * r1, k1y = oy + Math.sin(a + spread) * r1;
      const tx = k1x + Math.cos(a + spread + bend) * r2, ty = k1y + Math.sin(a + spread + bend) * r2;
      segment(x, ox, oy, k1x, k1y, S.L(0.027), S.L(0.022));
      segment(x, k1x, k1y, tx, ty, S.L(0.021), S.L(0.012));
      x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = S.L(0.004); x.lineCap = 'round';
      x.beginPath(); x.moveTo(ox - sa * S.L(0.01), oy + ca * S.L(0.004)); x.lineTo(k1x, k1y - S.L(0.008)); x.lineTo(tx, ty - S.L(0.004)); x.stroke();
      joint(x, k1x, k1y, S.L(0.016));
    });
    joint(x, px, py, S.L(0.027));
  }

  function leaf(x, cx, cy, ang, len, wid, tone) {
    x.save(); x.translate(cx, cy); x.rotate(ang);
    const lit = Math.max(0, -(Math.cos(ang - 1.57) * L[0] + Math.sin(ang - 1.57) * L[1]));
    const g = x.createLinearGradient(0, -wid, 0, wid);
    g.addColorStop(0, gray(tone * (0.55 + 0.6 * lit))); g.addColorStop(0.48, gray(tone * (0.9 + 0.25 * lit)));
    g.addColorStop(0.52, gray(tone * 0.42)); g.addColorStop(1, gray(tone * (0.28 + 0.2 * (1 - lit))));
    x.fillStyle = g;
    x.beginPath(); x.moveTo(0, 0);
    x.quadraticCurveTo(len * 0.42, -wid * 1.15, len, 0);
    x.quadraticCurveTo(len * 0.42, wid * 1.15, 0, 0); x.fill();
    x.strokeStyle = gray(tone * 0.25); x.lineWidth = Math.max(0.8, wid * 0.08);
    x.beginPath(); x.moveTo(len * 0.04, 0); x.lineTo(len * 0.9, 0); x.stroke();
    x.restore();
  }

  function wreath(x, S, cx, cy, R, rot) {
    const r = rng(77);
    // branch stems
    const branches = [[95, 258, 1], [85, -78, -1]];
    branches.forEach(([a0, a1, dir]) => {
      x.strokeStyle = gray(0.38); x.lineWidth = S.L(0.006); x.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, a = (a0 + (a1 - a0) * t) * Math.PI / 180 + rot;
        const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.stroke();
      const n = 11;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.4) / n, a = (a0 + (a1 - a0) * t) * Math.PI / 180 + rot;
        const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
        const tangent = a + (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
        const size = 1 - t * 0.45;
        const ll = S.L(0.088) * size, lw = S.L(0.03) * size;
        leaf(x, px, py, tangent + 0.55 * dir + (r() - 0.5) * 0.15, ll, lw, 0.95);
        leaf(x, px, py, tangent - 0.5 * dir + (r() - 0.5) * 0.15, ll * 0.9, lw * 0.95, 0.74);
        if (i % 4 === 2) {
          const bx = px + Math.cos(a) * S.L(0.012), by = py + Math.sin(a) * S.L(0.012), br = S.L(0.0075);
          const g = x.createRadialGradient(bx - br * 0.4, by - br * 0.4, 0, bx, by, br);
          g.addColorStop(0, gray(0.95)); g.addColorStop(0.5, gray(0.45)); g.addColorStop(1, gray(0.08));
          x.fillStyle = g; x.beginPath(); x.arc(bx, by, br, 0, Math.PI * 2); x.fill();
        }
      }
    });
    // the tie where the branches meet, with two short tails
    const tx = cx + Math.cos(Math.PI / 2 + rot) * R, ty = cy + Math.sin(Math.PI / 2 + rot) * R;
    x.fillStyle = gray(0.62);
    [[-1], [1]].forEach(([k]) => {
      x.beginPath(); x.moveTo(tx, ty);
      x.quadraticCurveTo(tx + k * S.L(0.03), ty + S.L(0.03), tx + k * S.L(0.022), ty + S.L(0.075));
      x.lineTo(tx + k * S.L(0.008), ty + S.L(0.068));
      x.quadraticCurveTo(tx + k * S.L(0.012), ty + S.L(0.03), tx, ty + S.L(0.008)); x.fill();
    });
    const g = x.createRadialGradient(tx - S.L(0.004), ty - S.L(0.004), 0, tx, ty, S.L(0.013));
    g.addColorStop(0, gray(0.95)); g.addColorStop(1, gray(0.3));
    x.fillStyle = g; x.beginPath(); x.ellipse(tx, ty, S.L(0.014), S.L(0.011), 0, 0, Math.PI * 2); x.fill();
  }

  function drawTone(x, w, h, t) {
    const S = sheet(w, h);
    x.fillStyle = gray(0.012); x.fillRect(0, 0, w, h);
    const cycle = (1 - Math.cos(t / 8 * Math.PI * 2)) / 2;
    const lift = -S.L(0.011) * cycle, rot = 0.012 * Math.sin(t / 8 * Math.PI * 2 + 0.6);
    const breath = 0.86 + 0.14 * Math.sin(t / 8 * Math.PI * 2 + 1.1);
    const C = [S.X(0.5), S.Y(0.5) + lift], R = S.L(0.175);
    // burnished glow behind the wreath
    const hg = x.createRadialGradient(C[0], C[1], 0, C[0], C[1], S.L(0.62));
    hg.addColorStop(0, gray(0.42 * breath)); hg.addColorStop(0.3, gray(0.24 * breath)); hg.addColorStop(0.62, gray(0.08 * breath)); hg.addColorStop(1, gray(0.012));
    x.fillStyle = hg; x.fillRect(0, 0, w, h);

    const arm = (pts, ws, js, G) => {
      const P = pts.map(([u, v, k]) => [S.X(u), S.Y(v) + lift * k]);
      for (let i = 0; i < P.length - 1; i++) segment(x, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], S.L(ws[i][0]), S.L(ws[i][1]));
      // a hydraulic line that follows the arm
      x.strokeStyle = gray(0.2); x.lineWidth = S.L(0.007); x.beginPath();
      P.forEach(([px, py], i) => { const o = S.L(0.026); i ? x.lineTo(px + o, py + o * 0.3) : x.moveTo(px + o, py + o * 0.3); });
      x.stroke();
      for (let i = 1; i < P.length; i++) joint(x, P[i][0], P[i][1], S.L(js[i - 1]));
      const W = P[P.length - 1];
      gripper(x, S, W[0], W[1], S.X(G[0]), S.Y(G[1]) + lift, 1);
    };
    const ga = 150 * Math.PI / 180 + rot, gb = 30 * Math.PI / 180 + rot;
    const gl = [(C[0] + Math.cos(ga) * R * 1.02 - S.x) / S.s, (C[1] - lift + Math.sin(ga) * R * 1.02 - S.y) / S.s];
    const gr = [(C[0] + Math.cos(gb) * R * 1.02 - S.x) / S.s, (C[1] - lift + Math.sin(gb) * R * 1.02 - S.y) / S.s];
    arm([[0.06, 1.4, 0], [0.13, 1.13, 0.2], [0.18, 0.89, 0.55], [0.26, 0.72, 1]], [[0.112, 0.098], [0.088, 0.074], [0.068, 0.058]], [0.07, 0.058, 0.045], gl);
    arm([[0.95, 1.4, 0], [0.88, 1.16, 0.2], [0.82, 0.92, 0.55], [0.745, 0.735, 1]], [[0.112, 0.098], [0.088, 0.074], [0.068, 0.058]], [0.07, 0.058, 0.045], gr);
    wreath(x, S, C[0], C[1], R, rot);
  }

  const def = {
    words: 'GPT-7 Will Have Arms; first place at the NeurIPS EAI Challenge, with my brother',
    process: 'mezzotint',
    alt: 'two robot arms rise out of velvet black and lift one laurel wreath together into a burnished glow.',
    fps: 12,
    still: 4,
    build(w, h) {
      const k = 0.7;
      const tone = canvas(w * k, h * k), tx = tone.getContext('2d');
      const st = { w, h, tone, tx, k, gl: !!GL.init() };
      if (st.gl) {
        if (!grainTex) grainTex = GL.texture(makeGrain(), { repeat: true, nearest: false });
        st.toneTex = GL.texture(tone);
      }
      return st;
    },
    draw(ctx, st, t) {
      st.tx.setTransform(st.k, 0, 0, st.k, 0, 0);
      drawTone(st.tx, st.w, st.h, t);
      if (!st.gl) { ctx.drawImage(st.tone, 0, 0, st.w, st.h); return; }
      GL.update(st.toneTex, st.tone);
      const cv = GL.run('mezzotint', FS, st.w, st.h, { uRes: ['2f', st.w, st.h], uGrainSize: ['1f', 512 * Math.max(0.75, st.w / 1400)] }, { uTone: st.toneTex, uGrain: grainTex });
      ctx.drawImage(cv, 0, 0);
    },
    label(ctx, st, name) {
      const S = sheet(st.w, st.h), fs = Math.round(S.L(0.024));
      ctx.save();
      ctx.fillStyle = 'rgba(214,204,188,0.78)'; ctx.textAlign = 'center';
      ctx.font = `600 ${fs}px "Cormorant SC", Georgia, serif`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.22}px`;
      const y = Math.min(st.h - fs * 2.2, S.Y(1.17));
      ctx.fillText(name.toUpperCase(), st.w / 2, y);
      ctx.fillRect(st.w / 2 - S.L(0.05), y - fs * 1.5, S.L(0.1), Math.max(1, fs * 0.05));
      ctx.restore();
    },
  };
  (window.PLATE_DEFS = window.PLATE_DEFS || {})['2025-12'] = def;
})();
