/* Plates — January 2026, sumi ink wash.
   A Clauiet Life: a bee in a quiet garden. Mostly empty paper; grass and two flowers in the
   lower left; one bee drifting through the space, painted, not drawn.
   Process: a loaded brush is a bundle of bristles, each carrying its own ink; strokes
   taper, run dry and split; wet washes bleed into the paper's fibres and leave a darker
   rim where the pigment settles. The date is a vermilion seal, the one colour on the sheet. */
(function () {
  'use strict';
  const { rng, vnoise, hash2, canvas, clamp, sheet, blurF32, paper, smooth } = window.PK;

  function stamp(D, w, h, x, y, r, v) {
    const x0 = Math.max(0, Math.floor(x - r - 1)), x1 = Math.min(w - 1, Math.ceil(x + r + 1));
    const y0 = Math.max(0, Math.floor(y - r - 1)), y1 = Math.min(h - 1, Math.ceil(y + r + 1));
    for (let j = y0; j <= y1; j++) {
      const dy = j - y;
      for (let i = x0; i <= x1; i++) {
        const dx = i - x, f = clamp(r + 0.5 - Math.sqrt(dx * dx + dy * dy), 0, 1);
        if (f > 0) { const k = j * w + i; D[k] += v * f * (1 - D[k] * 0.55); }
      }
    }
  }

  function resample(P, step) {
    // Catmull-Rom through control points, then even spacing with normals
    const dense = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 24; k++) {
        const t = k / 24, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), p1[2] + (p2[2] - p1[2]) * t]);
      }
    }
    dense.push(P[P.length - 1]);
    const out = []; let acc = 0, s = 0;
    out.push({ x: dense[0][0], y: dense[0][1], p: dense[0][2], s: 0 });
    for (let i = 1; i < dense.length; i++) {
      const dx = dense[i][0] - dense[i - 1][0], dy = dense[i][1] - dense[i - 1][1], d = Math.hypot(dx, dy);
      acc += d; s += d;
      while (acc >= step) { acc -= step; const t = 1 - acc / Math.max(1e-6, d); out.push({ x: dense[i - 1][0] + dx * t, y: dense[i - 1][1] + dy * t, p: dense[i - 1][2] + (dense[i][2] - dense[i - 1][2]) * t, s: s - acc }); }
    }
    for (let i = 0; i < out.length; i++) {
      const a = out[Math.max(0, i - 2)], b = out[Math.min(out.length - 1, i + 2)];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      out[i].nx = -dy / d; out[i].ny = dx / d;
    }
    return out;
  }

  /* One brush stroke made of individual bristles. */
  function brush(D, w, h, P, o) {
    const r = rng(o.seed || 1);
    const pts = resample(P, o.step || 0.8);
    if (pts.length < 2) return;
    const total = pts[pts.length - 1].s || 1;
    const n = o.bristles || 14, B = [];
    for (let k = 0; k < n; k++) {
      const off = n === 1 ? 0 : (k / (n - 1)) * 2 - 1;
      B.push({ off: off * (0.85 + r() * 0.2) + (r() - 0.5) * 0.12, cap: 0.55 + r() * 0.45, ph: r() * 1000, end: 1 - (o.dry || 0) * r() * 0.9, rad: (o.br || 1.4) * (0.75 + r() * 0.5) });
    }
    const tin = o.tin === undefined ? 0.08 : o.tin, tout = o.tout === undefined ? 0.35 : o.tout;
    for (const q of pts) {
      const f = q.s / total;
      const taper = Math.min(1, tin > 0 ? smooth(0, tin, f) * 0.85 + 0.15 : 1, tout > 0 ? smooth(0, tout, 1 - f) : 1);
      const width = o.width * q.p * taper;
      const load = (o.load || 1) * (1 - (o.dry || 0) * 0.65 * f);
      for (const b of B) {
        if (f > b.end) continue;
        let amt = load * b.cap * (0.75 + 0.5 * vnoise(q.s * 0.045, b.ph, 3));
        if (o.dry && amt < (o.gap || 0.45) * vnoise(q.s * 0.11, b.ph + 7, 5) * (0.4 + f)) continue;
        const rad = b.rad * (0.55 + 0.45 * taper);
        // normalise so a stroke's density does not depend on stamp spacing or bristle overlap
        const kStep = Math.min(1, (o.step || 0.8) / (1.7 * rad)), kLane = Math.min(1, Math.max(0.35, width / n) / (1.6 * rad));
        stamp(D, w, h, q.x + q.nx * b.off * width * 0.5, q.y + q.ny * b.off * width * 0.5, rad, (o.dens || 0.6) * amt * kStep * kLane * 1.6);
      }
    }
  }

  /* Wet ink: soften, bleed along fibres, and push pigment to the wet edge. */
  function wet(D, T, w, h, F, o) {
    const B1 = blurF32(T, w, h, o.soft || 1, 2), B2 = blurF32(T, w, h, o.bleed || 5, 3);
    for (let i = 0; i < D.length; i++) {
      const m = B1[i];
      if (m < 0.002 && B2[i] < 0.002) continue;
      const hair = B2[i] * F[i] * (o.hair || 0.8);
      const edge = clamp((B1[i] - B2[i]) * (o.edge || 1.2), 0, 1) * smooth(0.02, 0.2, m);
      const v = clamp(Math.max(m, hair) * (o.k || 1) + edge * (o.edgeK || 0.35), 0, 1);
      D[i] = 1 - (1 - D[i]) * (1 - v);
    }
  }

  function scene(w, h, S, F) {
    const D = new Float32Array(w * h);
    const U = (u, v, p) => [S.X(u), S.Y(v), p === undefined ? 1 : p];
    const sc = S.s / 600;
    // ground mist: a pale, very wet wash low on the sheet
    let T = new Float32Array(w * h);
    brush(T, w, h, [U(-0.08, 1.12, 0.7), U(0.18, 1.1, 1), U(0.46, 1.115, 0.9), U(0.66, 1.125, 0.4)], { width: S.L(0.07), bristles: 22, br: 3 * sc, dens: 0.16, seed: 3, tin: 0.05, tout: 0.4, step: 1.2 * sc });
    wet(D, T, w, h, F, { soft: 3 * sc, bleed: 11 * sc, hair: 0.5, edge: 1.4, edgeK: 0.3, k: 0.55 });

    // grass: dark blades with dry tips, a few paler ones behind
    const blades = [
      [0.05, 0.86, 0.12, 0.95, 0.75], [0.09, 0.72, 0.19, 0.9, 1.0], [0.13, 0.8, 0.05, 0.88, 0.55], [0.17, 0.68, 0.26, 0.88, 0.95],
      [0.21, 0.82, 0.3, 0.92, 0.45], [0.24, 0.76, 0.17, 0.85, 0.7], [0.3, 0.88, 0.38, 0.95, 0.35], [0.35, 0.93, 0.43, 0.98, 0.55],
      [0.11, 0.92, 0.22, 0.97, 0.25], [0.27, 0.97, 0.2, 1.0, 0.28], [0.07, 0.95, 0.0, 1.0, 0.3],
    ];
    blades.forEach(([x0, vt, xt, , dens], i) => {
      const lean = xt - x0, wv = 0.011 + 0.005 * ((i * 7) % 3) / 2;
      brush(D, w, h, [U(x0, 1.3, 1), U(x0 + lean * 0.22, 1.13, 0.95), U(x0 + lean * 0.68, (1.13 + vt) / 2, 0.72), U(xt, vt, 0.16)],
        { width: S.L(wv), bristles: 8, br: 1.05 * sc, dens: dens * 1.15, dry: 0.75, gap: 0.55, seed: 40 + i, tin: 0, tout: 0.55, step: 0.8 * sc });
    });

    // two flower stems and a leaf on each
    const stems = [[0.27, 1.3, 0.29, 0.98, 0.335, 0.655], [0.4, 1.3, 0.42, 1.02, 0.465, 0.74]];
    stems.forEach(([a, b, c, d, e, f], i) => {
      brush(D, w, h, [U(a, b, 0.9), U(c, d, 1), U(e, f, 0.75)], { width: S.L(0.0075), bristles: 5, br: 0.9 * sc, dens: 0.62, dry: 0.3, seed: 70 + i, tin: 0, tout: 0.1, step: 0.7 * sc });
      T = new Float32Array(w * h);
      const lx = (c + e) / 2, ly = (d + f) / 2 + 0.06, dir = i ? 1 : -1;
      brush(T, w, h, [U(lx, ly, 0.3), U(lx + dir * 0.03, ly - 0.025, 1), U(lx + dir * 0.075, ly - 0.03, 0.15)], { width: S.L(0.026), bristles: 14, br: 1.6 * sc, dens: 0.42, seed: 90 + i, tin: 0.2, tout: 0.5, step: 0.8 * sc });
      wet(D, T, w, h, F, { soft: 1.2 * sc, bleed: 4 * sc, hair: 0.6, edge: 1.6, edgeK: 0.45, k: 1 });
    });

    // flower heads: pale petals pulled outward from the centre, then a dark heart
    const heads = [[0.335, 0.655, 7, 0], [0.465, 0.74, 5, 1]];
    heads.forEach(([cu, cv, n, kind], hi) => {
      T = new Float32Array(w * h);
      const r = rng(200 + hi);
      for (let k = 0; k < n; k++) {
        const a = kind ? -Math.PI / 2 + (k - (n - 1) / 2) * 0.42 : (k / n) * Math.PI * 2 + r() * 0.3;
        const len = (kind ? 0.045 : 0.06) * (0.85 + r() * 0.3);
        brush(T, w, h, [U(cu + Math.cos(a) * 0.006, cv + Math.sin(a) * 0.006, 1), U(cu + Math.cos(a) * len * 0.55, cv + Math.sin(a) * len * 0.55, 1.15), U(cu + Math.cos(a) * len, cv + Math.sin(a) * len, 0.5)],
          { width: S.L(kind ? 0.024 : 0.03), bristles: 14, br: 1.6 * sc, dens: kind ? 0.27 : 0.3, seed: 300 + hi * 20 + k, tin: 0.05, tout: 0.4, step: 0.7 * sc });
      }
      wet(D, T, w, h, F, { soft: 1.4 * sc, bleed: 5 * sc, hair: 0.6, edge: 2.0, edgeK: 0.55, k: 0.9 });
      for (let k = 0; k < (kind ? 3 : 9); k++) {
        const a = r() * Math.PI * 2, d = r() * 0.008;
        stamp(D, w, h, S.X(cu + Math.cos(a) * d), S.Y(cv + Math.sin(a) * d), (1.5 + r() * 1.5) * sc, 0.5);
      }
    });
    return D;
  }

  /* The bee, painted into its own small sheet so it can drift. */
  function bee(sc) {
    const N = Math.round(120 * sc), H = N;
    const body = new Float32Array(N * H), wingsB = new Float32Array(N * H);
    const F = new Float32Array(N * H).fill(1);
    const P = (x, y, p) => [N / 2 + x * sc, H / 2 + y * sc, p === undefined ? 1 : p];
    // wings: two pale washes swept back
    let T = new Float32Array(N * H);
    brush(T, N, H, [P(-2, -6, 0.6), P(-9, -20, 1.2), P(-17, -24, 0.5)], { width: 11 * sc, bristles: 12, br: 1.4 * sc, dens: 0.22, seed: 501, tin: 0.1, tout: 0.4, step: 0.5 });
    brush(T, N, H, [P(1, -6, 0.6), P(2, -19, 1.1), P(-3, -27, 0.5)], { width: 10 * sc, bristles: 12, br: 1.4 * sc, dens: 0.18, seed: 502, tin: 0.1, tout: 0.4, step: 0.5 });
    wet(wingsB, T, N, H, F, { soft: 0.8 * sc, bleed: 2 * sc, hair: 0.3, edge: 2.2, edgeK: 0.6, k: 1 });
    // abdomen: a pale oval, then three dark bands
    T = new Float32Array(N * H);
    brush(T, N, H, [P(-3, 1, 0.8), P(-11, 3, 1.15), P(-19, 5, 0.6)], { width: 12 * sc, bristles: 12, br: 1.5 * sc, dens: 0.4, seed: 503, tin: 0.15, tout: 0.4, step: 0.5 });
    wet(body, T, N, H, F, { soft: 0.7 * sc, bleed: 1.6 * sc, hair: 0.3, edge: 1.6, edgeK: 0.5, k: 1 });
    [[-6, 1.6], [-11.5, 3], [-16.5, 4.3]].forEach(([x, y], i) => {
      brush(body, N, H, [P(x + 1, y - 5.5, 0.6), P(x, y, 1), P(x - 1, y + 5.5, 0.6)], { width: 3.2 * sc, bristles: 6, br: 1 * sc, dens: 0.8, seed: 520 + i, tin: 0.2, tout: 0.3, step: 0.4 });
    });
    // thorax, head, legs, antennae
    for (let k = 0; k < 10; k++) stamp(body, N, H, N / 2 + (2 + Math.cos(k) * 1.4) * sc, H / 2 + Math.sin(k * 1.7) * 1.4 * sc, (3.4 - k * 0.12) * sc, 0.4);
    stamp(body, N, H, N / 2 + 9 * sc, H / 2 - 0.5 * sc, 2.7 * sc, 0.9);
    [[-1, 4, -4, 12], [2, 4, 1, 13], [5, 3, 7, 11]].forEach(([a, b, c, d], i) => brush(body, N, H, [P(a, b, 1), P((a + c) / 2 + 1, (b + d) / 2, 0.8), P(c, d, 0.3)], { width: 1.1 * sc, bristles: 2, br: 0.55 * sc, dens: 0.75, seed: 540 + i, tin: 0, tout: 0.3, step: 0.4 }));
    brush(body, N, H, [P(10, -2, 1), P(14, -7, 0.7), P(18, -8, 0.3)], { width: 0.9 * sc, bristles: 2, br: 0.5 * sc, dens: 0.7, seed: 560, tin: 0, tout: 0.3, step: 0.4 });
    brush(body, N, H, [P(10, -1, 1), P(15, -4, 0.7), P(19, -3, 0.3)], { width: 0.9 * sc, bristles: 2, br: 0.5 * sc, dens: 0.6, seed: 561, tin: 0, tout: 0.3, step: 0.4 });
    const toCanvas = (B) => {
      const c = canvas(N, H), x = c.getContext('2d'), img = x.createImageData(N, H);
      for (let i = 0; i < B.length; i++) { const d = clamp(B[i], 0, 1); img.data[i * 4] = 26; img.data[i * 4 + 1] = 24; img.data[i * 4 + 2] = 30; img.data[i * 4 + 3] = d * 238; }
      x.putImageData(img, 0, 0); return c;
    };
    return { body: toCanvas(body), wings: toCanvas(wingsB), N };
  }

  function seal(S, sc) {
    const sz = Math.round(S.L(0.082)), c = canvas(sz, sz), x = c.getContext('2d');
    x.fillStyle = '#c0361f';
    const r = rng(2601);
    x.beginPath();
    const pad = sz * 0.04;
    x.moveTo(pad + r() * 2, pad + r() * 2); x.lineTo(sz - pad - r() * 2, pad + r() * 2); x.lineTo(sz - pad - r() * 2, sz - pad - r() * 2); x.lineTo(pad + r() * 2, sz - pad - r() * 2); x.closePath(); x.fill();
    x.globalCompositeOperation = 'destination-out';
    x.fillStyle = '#000'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `600 ${Math.round(sz * 0.32)}px "Cormorant SC", Georgia, serif`;
    x.fillText('JAN', sz / 2, sz * 0.33);
    x.fillText('2026', sz / 2, sz * 0.68);
    // the stamp never picks up ink evenly
    const img = x.getImageData(0, 0, sz, sz);
    for (let j = 0; j < sz; j++) for (let i = 0; i < sz; i++) {
      const k = (j * sz + i) * 4, n = vnoise(i * 0.35 / sc, j * 0.35 / sc, 61) * 0.6 + hash2(i, j, 4) * 0.4;
      if (n < 0.13) img.data[k + 3] = 0; else img.data[k + 3] *= clamp((n - 0.13) * 5, 0.7, 1);
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  const def = {
    words: 'A Clauiet Life: a bee in a quiet garden',
    process: 'sumi ink wash',
    alt: 'a single painted bee drifts over two pale flowers and a few strokes of grass, with a small vermilion date seal.',
    fps: 20,
    still: 3,
    reelOffset: 2,
    build(w, h) {
      const S = sheet(w, h), sc = S.s / 600;
      const base = paper(w, h, { base: '#f3eee2', seed: 126, scale: sc * 1.3, fibres: 1.4, mottle: 0.03, flecks: 0.35 });
      // fibre gate for bleeding: long horizontal-ish fibres
      const F = new Float32Array(w * h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const n = vnoise(i * 0.06 / sc, j * 0.5 / sc, 11) * 0.6 + vnoise(i * 0.5 / sc, j * 0.07 / sc, 12) * 0.4;
        F[j * w + i] = smooth(0.42, 0.75, n);
      }
      const D = scene(w, h, S, F);
      const c = canvas(w, h), x = c.getContext('2d');
      x.drawImage(base, 0, 0);
      const img = x.getImageData(0, 0, w, h), d = img.data;
      for (let i = 0; i < D.length; i++) {
        let v = clamp(D[i], 0, 1);
        if (v < 0.004) continue;
        const k = i * 4, lum = (d[k] + d[k + 1] + d[k + 2]) / 765;
        v *= 0.9 + (0.93 - lum) * 1.6; // pigment settles into the paper's low spots
        v = clamp(v, 0, 1);
        const tone = smooth(0, 0.85, v);
        const ir = 92 - 70 * tone, ig = 88 - 67 * tone, ib = 86 - 58 * tone;
        const a = Math.min(1, v * 1.12);
        d[k] = d[k] * (1 - a) + ir * a; d[k + 1] = d[k + 1] * (1 - a) + ig * a; d[k + 2] = d[k + 2] * (1 - a) + ib * a;
      }
      x.putImageData(img, 0, 0);
      const sl = seal(S, sc);
      x.save(); x.translate(S.X(0.8), S.Y(1.07)); x.rotate(-0.015); x.globalAlpha = 0.92; x.globalCompositeOperation = 'multiply'; x.drawImage(sl, 0, 0); x.restore();
      return { w, h, S, c, bee: bee(sc * 1.45) };
    },
    draw(ctx, st, t) {
      ctx.drawImage(st.c, 0, 0);
      const S = st.S, om = Math.PI * 2 / 12;
      const u = 0.56 + 0.13 * Math.sin(om * t) + 0.02 * Math.sin(om * 3 * t + 1);
      const v = 0.53 + 0.06 * Math.sin(om * 2 * t) + 0.012 * Math.sin(om * 5 * t);
      const du = 0.13 * om * Math.cos(om * t), dv = 0.12 * om * Math.cos(om * 2 * t);
      const face = du >= 0 ? 1 : -1;
      const tilt = clamp(dv / Math.max(0.02, Math.abs(du)), -1, 1) * 0.25;
      const B = st.bee, N = B.N;
      ctx.save();
      ctx.translate(S.X(u), S.Y(v));
      ctx.scale(face, 1); ctx.rotate(tilt * face);
      const flap = 0.82 + 0.18 * Math.sin(t * Math.PI * 2 * 7);
      ctx.save(); ctx.translate(0, -0.06 * N); ctx.scale(1, flap); ctx.translate(0, 0.06 * N);
      ctx.drawImage(B.wings, -N / 2, -N / 2); ctx.restore();
      ctx.drawImage(B.body, -N / 2, -N / 2);
      ctx.restore();
    },
  };
  (window.PLATE_DEFS = window.PLATE_DEFS || {})['2026-01'] = def;
})();
