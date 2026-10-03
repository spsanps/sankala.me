/* Plates — September 2026, pochoir.
   Paper Robots began: the first film went up on September 6, a second followed. The paper robot
   sits in a picture palace, seen from behind, while its films take turns on the screen.
   Process: hand-stencilled gouache. Each colour is its own stencil, dabbed on with a pompon, so
   flat colour carries a cloudy, stippled body, a slightly darker rim where paint banks against
   the stencil edge, and a hair of misregistration between plates. */
(function () {
  'use strict';
  const { rng, vnoise, hash2, canvas, clamp, sheet, smooth } = window.PK;

  const C = {
    wall: '#1f4d50', wallDeep: '#163a3d', gold: '#d9a23e', red: '#b9432b', redDeep: '#8f2f1e',
    cream: '#efe3c6', seat: '#3b2238', cobalt: '#2f50cb', cobaltTop: '#5d76dc', cobaltSide: '#22399b', ink: '#1d1a24', green: '#7a9a3c',
  };

  /* A cheap low-resolution cloud field, sampled bilinearly: the pompon's mottling. */
  function cloud(w, h, sc, seed) {
    const step = Math.max(2, Math.round(3 * sc)), gw = Math.ceil(w / step) + 2, gh = Math.ceil(h / step) + 2;
    const g = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = i * step / sc, y = j * step / sc;
      g[j * gw + i] = vnoise(x / 9, y / 9, seed) * 0.55 + vnoise(x / 3.2, y / 3.2, seed + 3) * 0.3 + vnoise(x / 26, y / 26, seed + 6) * 0.15;
    }
    return (i, j) => {
      const fx = i / step, fy = j / step, xi = fx | 0, yi = fy | 0, tx = fx - xi, ty = fy - yi, k = yi * gw + xi;
      return (g[k] * (1 - tx) + g[k + 1] * tx) * (1 - ty) + (g[k + gw] * (1 - tx) + g[k + gw + 1] * tx) * ty;
    };
  }

  /* Paint one stencil: fill the shape, then give the paint its body, its shading and its rim. */
  function stencil(w, h, S, draw, color, o) {
    o = o || {};
    // each stencil lives on a canvas just large enough for its shape
    const pad = 4;
    const bb = o.bb ? [Math.max(0, Math.floor(S.X(o.bb[0])) - pad), Math.max(0, Math.floor(S.Y(o.bb[1])) - pad), Math.min(w, Math.ceil(S.X(o.bb[2])) + pad), Math.min(h, Math.ceil(S.Y(o.bb[3])) + pad)] : [0, 0, w, h];
    const bw = Math.max(1, bb[2] - bb[0]), bh = Math.max(1, bb[3] - bb[1]);
    const c = canvas(bw, bh), x = c.getContext('2d', { willReadFrequently: true });
    x.translate(-bb[0], -bb[1]);
    x.fillStyle = color; x.beginPath(); draw(x); x.fill(o.rule || 'nonzero');
    const out = { c, x: bb[0], y: bb[1] };
    if (bb[2] <= bb[0] || bb[3] <= bb[1]) return out;
    const img = x.getImageData(0, 0, bw, bh), d = img.data;
    const cl = o.cloud, rr = Math.max(1, Math.round(S.s / 600 * 1.6)), mot = (o.mottle === undefined ? 0.09 : o.mottle) * 1.45;
    const ox = (o.seed || 0) * 37;
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
      const k = (j * bw + i) * 4;
      if (d[k + 3] === 0) continue;
      const gx = bb[0] + i, gy = bb[1] + j;
      const m = cl(Math.min(w - 1, (gx + ox) % w), Math.min(h - 1, gy));
      let f = 1 - (m - 0.5) * 2 * mot - (hash2(gx, gy, 77) - 0.5) * 0.05;
      if (o.shade) f *= 1 - o.shade((gx - S.x) / S.s, (gy - S.y) / S.s) * (o.dark || 0.3);
      // paint banks against the stencil edge
      const a1 = i + rr < bw ? d[k + rr * 4 + 3] : 0, a2 = i - rr >= 0 ? d[k - rr * 4 + 3] : 0;
      const a3 = j + rr < bh ? d[k + rr * bw * 4 + 3] : 0, a4 = j - rr >= 0 ? d[k - rr * bw * 4 + 3] : 0;
      if (Math.min(a1, a2, a3, a4) < 200) f *= 0.86;
      d[k] = clamp(d[k] * f, 0, 255); d[k + 1] = clamp(d[k + 1] * f, 0, 255); d[k + 2] = clamp(d[k + 2] * f, 0, 255);
      if (o.alpha) d[k + 3] = d[k + 3] * clamp(o.alpha((gx - S.x) / S.s, (gy - S.y) / S.s) * (0.8 + 0.4 * m), 0, 1);
    }
    x.putImageData(img, 0, 0);
    return out;
  }
  const put = (ctx, l, dx, dy) => ctx.drawImage(l.c, l.x + (dx || 0), l.y + (dy || 0));

  function scene(w, h, S) {
    const sc = S.s / 600, cl = cloud(w, h, sc, 926);
    const U = (u) => S.X(u), V = (v) => S.Y(v);
    const r = rng(906);
    const L = [];
    const add = (draw, color, o) => { const l = stencil(w, h, S, draw, color, Object.assign({ cloud: cl }, o)); l.dx = (r() - 0.5) * 3 * sc; l.dy = (r() - 0.5) * 3 * sc; L.push(l); };
    const screen = [0.18, 0.21, 0.82, 0.6];

    // the hall
    add((x) => x.rect(0, 0, w, h), C.wall, { mottle: 0.1, shade: (u, v) => smooth(0.25, 0.95, Math.hypot((u - 0.5) * 1.1, (v - 0.42) * 0.8)), dark: 0.42, seed: 1 });
    // deco crown: stepped ziggurat and sunburst above the screen
    add((x) => {
      const s = [[0.12, 0.17], [0.16, 0.13], [0.24, 0.09], [0.34, 0.065], [0.66, 0.065], [0.76, 0.09], [0.84, 0.13], [0.88, 0.17]];
      x.moveTo(U(0.1), V(0.66)); s.forEach(([u, v]) => x.lineTo(U(u), V(v))); x.lineTo(U(0.9), V(0.66)); x.closePath();
      x.moveTo(U(screen[0] - 0.02), V(screen[1] - 0.02)); x.lineTo(U(screen[0] - 0.02), V(screen[3] + 0.02)); x.lineTo(U(screen[2] + 0.02), V(screen[3] + 0.02)); x.lineTo(U(screen[2] + 0.02), V(screen[1] - 0.02)); x.closePath();
    }, C.gold, { rule: 'evenodd', mottle: 0.1, shade: (u, v) => smooth(0.05, 0.7, v), dark: 0.22, seed: 2, bb: [0.08, 0.05, 0.92, 0.68] });
    add((x) => {
      // sunburst rays in the crown, cut as thin wedges and kept inside the crown's steps
      const steps = [[0.12, 0.17], [0.16, 0.13], [0.24, 0.09], [0.34, 0.065], [0.66, 0.065], [0.76, 0.09], [0.84, 0.13], [0.88, 0.17]];
      x.moveTo(U(0.12), V(0.21)); steps.forEach(([u, v]) => x.lineTo(U(u), V(v))); x.lineTo(U(0.88), V(0.21)); x.closePath(); x.clip(); x.beginPath();
      const cx = U(0.5), cy = V(0.205);
      for (let k = 0; k < 13; k++) {
        const a = Math.PI + (k + 0.5) / 13 * Math.PI, a2 = a + Math.PI / 13 * 0.42;
        x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * S.L(0.4), cy + Math.sin(a) * S.L(0.4)); x.lineTo(cx + Math.cos(a2) * S.L(0.4), cy + Math.sin(a2) * S.L(0.4)); x.closePath();
      }
    }, C.redDeep, { mottle: 0.08, seed: 3, bb: [0.1, 0.0, 0.9, 0.21], alpha: (u, v) => smooth(0.06, 0.12, v) * (v < 0.19 ? 1 : 0) });
    // the cartouche with the name
    add((x) => { x.rect(U(0.36), V(0.105), S.L(0.28), S.L(0.055)); }, C.red, { mottle: 0.08, seed: 4, bb: [0.35, 0.1, 0.65, 0.17] });
    // screen
    add((x) => x.rect(U(screen[0]), V(screen[1]), S.L(screen[2] - screen[0]), S.L(screen[3] - screen[1])), C.cream, { mottle: 0.05, shade: (u, v) => smooth(0.12, 0.42, Math.hypot(u - 0.5, (v - 0.4) * 1.4)), dark: 0.12, seed: 5, bb: [screen[0], screen[1], screen[2], screen[3]] });
    // curtains: a scalloped valance and two drapes with folds
    add((x) => {
      x.moveTo(U(0.02), V(0.15)); x.lineTo(U(0.98), V(0.15)); x.lineTo(U(0.98), V(0.235));
      const n = 7;
      for (let k = n; k >= 0; k--) { const u0 = 0.02 + (k / n) * 0.96, um = 0.02 + ((k - 0.5) / n) * 0.96; if (k > 0) x.quadraticCurveTo(U(um), V(0.275), U(0.02 + ((k - 1) / n) * 0.96), V(0.235)); else x.lineTo(U(u0), V(0.235)); }
      x.closePath();
      x.moveTo(U(0.03), V(0.2)); x.lineTo(U(0.2), V(0.2)); x.bezierCurveTo(U(0.17), V(0.36), U(0.14), V(0.52), U(0.2), V(0.7)); x.lineTo(U(0.03), V(0.72)); x.closePath();
      x.moveTo(U(0.8), V(0.2)); x.lineTo(U(0.97), V(0.2)); x.lineTo(U(0.97), V(0.72)); x.lineTo(U(0.8), V(0.7)); x.bezierCurveTo(U(0.86), V(0.52), U(0.83), V(0.36), U(0.8), V(0.2)); x.closePath();
    }, C.red, { mottle: 0.09, shade: (u, v) => (v > 0.24 ? 0.5 + 0.5 * Math.sin(u * 95) : 0.25 + 0.25 * Math.sin(u * 60)), dark: 0.32, seed: 6, bb: [0.01, 0.14, 0.99, 0.73] });
    // gold tie-backs
    add((x) => { x.ellipse(U(0.165), V(0.47), S.L(0.025), S.L(0.012), 0.3, 0, Math.PI * 2); x.moveTo(U(0.86), V(0.47)); x.ellipse(U(0.835), V(0.47), S.L(0.025), S.L(0.012), -0.3, 0, Math.PI * 2); }, C.gold, { mottle: 0.08, seed: 7, bb: [0.1, 0.43, 0.9, 0.51] });
    // the stage lip
    add((x) => { x.moveTo(U(0.02), V(0.7)); x.lineTo(U(0.98), V(0.7)); x.lineTo(U(1.02), V(0.76)); x.lineTo(U(-0.02), V(0.76)); x.closePath(); }, C.wallDeep, { mottle: 0.08, seed: 8, bb: [-0.03, 0.69, 1.03, 0.77] });
    add((x) => { x.rect(U(-0.05), V(0.695), S.L(1.1), S.L(0.009)); }, C.gold, { mottle: 0.06, seed: 9, bb: [-0.05, 0.69, 1.05, 0.71] });

    // seats: a far row and a near row of rounded backs
    const row = (v0, hgt, n, u0, u1, seed) => add((x) => {
      const wd = (u1 - u0) / n;
      for (let k = 0; k < n; k++) {
        const a = u0 + k * wd + wd * 0.06, b = u0 + (k + 1) * wd - wd * 0.06, rad = S.L(wd * 0.3);
        x.moveTo(U(a), V(v0 + hgt)); x.lineTo(U(a), V(v0) + rad); x.quadraticCurveTo(U(a), V(v0), U(a) + rad, V(v0));
        x.lineTo(U(b) - rad, V(v0)); x.quadraticCurveTo(U(b), V(v0), U(b), V(v0) + rad); x.lineTo(U(b), V(v0 + hgt)); x.closePath();
      }
    }, C.seat, { mottle: 0.09, shade: (u, v) => smooth(v0, v0 + hgt, v), dark: 0.45, seed, bb: [u0 - 0.01, v0 - 0.01, u1 + 0.01, v0 + hgt + 0.01] });
    row(0.86, 0.5, 6, -0.04, 1.04, 10);
    add((x) => { for (let k = 0; k < 6; k++) { const wd = 1.08 / 6, a = -0.04 + k * wd + wd * 0.18, b = -0.04 + (k + 1) * wd - wd * 0.18; x.rect(U(a), V(0.873), S.L(b - a), S.L(0.007)); } }, C.gold, { mottle: 0.06, seed: 11, bb: [-0.04, 0.86, 1.04, 0.89] });

    // the robot, from behind and to its right, in the near row
    const rx = 0.62, ry = 0.885, s = 0.17;
    add((x) => { x.moveTo(U(rx - s * 0.5), V(ry)); x.lineTo(U(rx + s * 0.32), V(ry)); x.lineTo(U(rx + s * 0.32), V(ry + s * 0.82)); x.lineTo(U(rx - s * 0.5), V(ry + s * 0.82)); x.closePath(); }, C.cobalt, { mottle: 0.08, seed: 12, shade: (u, v) => smooth(ry, ry + s, v) * 0.6, dark: 0.3, bb: [rx - s * 0.6, ry - 0.01, rx + s * 0.4, ry + s] });
    add((x) => { x.moveTo(U(rx + s * 0.32), V(ry)); x.lineTo(U(rx + s * 0.62), V(ry - s * 0.18)); x.lineTo(U(rx + s * 0.62), V(ry + s * 0.62)); x.lineTo(U(rx + s * 0.32), V(ry + s * 0.82)); x.closePath(); }, C.cobaltSide, { mottle: 0.08, seed: 13, bb: [rx + s * 0.3, ry - s * 0.2, rx + s * 0.65, ry + s] });
    add((x) => { x.moveTo(U(rx - s * 0.5), V(ry)); x.lineTo(U(rx - s * 0.2), V(ry - s * 0.18)); x.lineTo(U(rx + s * 0.62), V(ry - s * 0.18)); x.lineTo(U(rx + s * 0.32), V(ry)); x.closePath(); }, C.cobaltTop, { mottle: 0.07, seed: 14, bb: [rx - s * 0.55, ry - s * 0.2, rx + s * 0.65, ry + 0.01] });
    // the folded white corner sits at the far top corner of the head
    add((x) => { x.moveTo(U(rx + s * 0.62), V(ry - s * 0.18)); x.lineTo(U(rx + s * 0.3), V(ry - s * 0.18)); x.lineTo(U(rx + s * 0.62), V(ry + s * 0.05)); x.closePath(); }, C.cream, { mottle: 0.05, seed: 15, bb: [rx + s * 0.28, ry - s * 0.2, rx + s * 0.65, ry + s * 0.07] });
    // the vermilion ear disc on the side face
    add((x) => { x.ellipse(U(rx + s * 0.475), V(ry + s * 0.3), S.L(s * 0.1), S.L(s * 0.16), -0.12, 0, Math.PI * 2); }, C.red, { mottle: 0.06, seed: 16, bb: [rx + s * 0.35, ry + s * 0.1, rx + s * 0.6, ry + s * 0.5] });
    // two small one-eyed friends from the Paper Robots world, a seat to the left
    [[0.31, 0.93, 0.05], [0.4, 0.945, 0.042]].forEach(([gu, gv, gs], gi) => {
      add((x) => { x.moveTo(U(gu - gs * 0.5), V(gv + gs)); x.bezierCurveTo(U(gu - gs * 0.55), V(gv - gs * 0.2), U(gu + gs * 0.55), V(gv - gs * 0.2), U(gu + gs * 0.5), V(gv + gs)); x.closePath();
      },
      C.green, { mottle: 0.09, seed: 40 + gi, shade: (u, v) => smooth(gv, gv + gs, v), dark: 0.3, bb: [gu - gs, gv - gs, gu + gs, gv + gs * 1.1] });
    });
    // the near row, in front of the robot
    row(1.03, 0.4, 4, -0.08, 1.08, 17);
    add((x) => { for (let k = 0; k < 4; k++) { const wd = 1.16 / 4, a = -0.08 + k * wd + wd * 0.2, b = -0.08 + (k + 1) * wd - wd * 0.2; x.rect(U(a), V(1.045), S.L(b - a), S.L(0.009)); } }, C.gold, { mottle: 0.06, seed: 18, bb: [-0.08, 1.03, 1.08, 1.06] });
    return { L, screen, cl };
  }

  /* What the films look like on the screen: two stencil frames. */
  function films(w, h, S, cl, screen) {
    const U = (u) => S.X(u), V = (v) => S.Y(v);
    const cx = (screen[0] + screen[2]) / 2, cy = (screen[1] + screen[3]) / 2;
    const clipTo = (x) => { x.beginPath(); x.rect(U(screen[0]), V(screen[1]), S.L(screen[2] - screen[0]), S.L(screen[3] - screen[1])); x.clip(); };
    // frame A: a robot with many arms
    const A = canvas(w, h), ax = A.getContext('2d');
    ax.save(); clipTo(ax);
    const limb = (x, pts, wd) => {
      // a thick polyline as filled quads with round joints, which a stencil can hold
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax0, ay0] = pts[i], [bx0, by0] = pts[i + 1], dx = bx0 - ax0, dy = by0 - ay0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * wd / 2, ny = dx / l * wd / 2;
        x.beginPath(); x.moveTo(ax0 + nx, ay0 + ny); x.lineTo(bx0 + nx, by0 + ny); x.lineTo(bx0 - nx, by0 - ny); x.lineTo(ax0 - nx, ay0 - ny); x.closePath(); x.fill();
      }
      pts.slice(1, -1).forEach(([px, py]) => { x.beginPath(); x.arc(px, py, wd / 2, 0, Math.PI * 2); x.fill(); });
      x.beginPath();
    };
    const arms = stencil(w, h, S, (x) => {
      const wd = S.L(0.016);
      const poses = [[-1, -0.03, 0.12, -0.075, 0.2, -0.13], [-1, 0.0, 0.15, 0.0, 0.22, -0.035], [-1, 0.035, 0.12, 0.08, 0.19, 0.115],
        [1, -0.03, 0.11, -0.09, 0.19, -0.12], [1, 0.0, 0.15, 0.015, 0.22, -0.02], [1, 0.035, 0.12, 0.085, 0.2, 0.1]];
      poses.forEach(([side, oy, ex, ey, hx, hy]) => {
        const sx = U(cx + side * 0.04), sy = V(cy + 0.01 + oy);
        const el = [U(cx + side * ex), V(cy + 0.01 + ey)], hd = [U(cx + side * hx), V(cy + 0.01 + hy)];
        limb(x, [[sx, sy], el, hd], wd);
        // a mitten hand with a thumb
        const r = S.L(0.016), a = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
        x.beginPath(); x.ellipse(hd[0] + Math.cos(a) * r * 0.3, hd[1] + Math.sin(a) * r * 0.3, r * 1.05, r * 0.8, a, 0, Math.PI * 2); x.fill();
        const ta = a - side * 1.3;
        x.beginPath(); x.ellipse(hd[0] + Math.cos(ta) * r * 0.95, hd[1] + Math.sin(ta) * r * 0.95, r * 0.5, r * 0.32, ta, 0, Math.PI * 2); x.fill(); x.beginPath();
      });
      x.moveTo(U(cx - 0.042), V(cy - 0.03)); x.rect(U(cx - 0.042), V(cy - 0.03), S.L(0.084), S.L(0.12));
    }, C.cobalt, { cloud: cl, mottle: 0.08, seed: 21, bb: [screen[0], screen[1], screen[2], screen[3]] });
    put(ax, arms);
    const head = stencil(w, h, S, (x) => { x.rect(U(cx - 0.045), V(cy - 0.12), S.L(0.09), S.L(0.08)); }, C.cobalt, { cloud: cl, mottle: 0.08, seed: 22, bb: [cx - 0.06, cy - 0.13, cx + 0.06, cy - 0.03] });
    put(ax, head);
    ax.fillStyle = C.cream;
    [[-0.018], [0.018]].forEach(([d]) => { ax.beginPath(); ax.arc(U(cx + d), V(cy - 0.08), S.L(0.013), 0, Math.PI * 2); ax.fill(); });
    ax.fillStyle = C.ink;
    [[-0.016], [0.02]].forEach(([d]) => { ax.beginPath(); ax.arc(U(cx + d), V(cy - 0.079), S.L(0.006), 0, Math.PI * 2); ax.fill(); });
    ax.fillStyle = C.red; ax.beginPath(); ax.arc(U(cx + 0.05), V(cy - 0.08), S.L(0.011), 0, Math.PI * 2); ax.fill();
    ax.restore();
    // frame B: an enormous eye, a small figure reaching up to it
    const B = canvas(w, h), bx = B.getContext('2d');
    bx.save(); clipTo(bx);
    const eyeW = 0.27, eyeH = 0.12;
    put(bx, stencil(w, h, S, (x) => {
      x.moveTo(U(cx - eyeW), V(cy - 0.02)); x.quadraticCurveTo(U(cx), V(cy - 0.02 - eyeH * 1.6), U(cx + eyeW), V(cy - 0.02));
      x.quadraticCurveTo(U(cx), V(cy - 0.02 + eyeH * 1.6), U(cx - eyeW), V(cy - 0.02)); x.closePath();
    }, '#f6eedb', { cloud: cl, mottle: 0.05, seed: 23, bb: [cx - eyeW - 0.01, cy - 0.2, cx + eyeW + 0.01, cy + 0.17] }));
    put(bx, stencil(w, h, S, (x) => { x.arc(U(cx), V(cy - 0.02), S.L(0.085), 0, Math.PI * 2); }, C.red, { cloud: cl, mottle: 0.1, seed: 24, shade: (u, v) => smooth(0.03, 0.085, Math.hypot(u - cx, v - cy + 0.02)), dark: 0.35, bb: [cx - 0.09, cy - 0.11, cx + 0.09, cy + 0.07] }));
    bx.fillStyle = C.ink; bx.beginPath(); bx.arc(U(cx), V(cy - 0.02), S.L(0.04), 0, Math.PI * 2); bx.fill();
    bx.fillStyle = C.green; bx.beginPath(); bx.ellipse(U(cx + 0.045), V(cy + 0.045), S.L(0.009), S.L(0.016), 0, 0, Math.PI * 2); bx.fill();
    bx.strokeStyle = C.green; bx.lineWidth = S.L(0.004); bx.lineCap = 'round'; bx.beginPath(); bx.moveTo(U(cx + 0.049), V(cy + 0.036)); bx.lineTo(U(cx + 0.06), V(cy + 0.012)); bx.stroke();
    bx.strokeStyle = C.ink; bx.lineWidth = S.L(0.005); bx.beginPath(); bx.moveTo(U(cx - eyeW), V(cy - 0.02)); bx.quadraticCurveTo(U(cx), V(cy - 0.02 - eyeH * 1.6), U(cx + eyeW), V(cy - 0.02)); bx.stroke();
    bx.lineWidth = S.L(0.0028); bx.globalAlpha = 0.6; bx.beginPath(); bx.moveTo(U(cx - eyeW), V(cy - 0.02)); bx.quadraticCurveTo(U(cx), V(cy - 0.02 + eyeH * 1.6), U(cx + eyeW), V(cy - 0.02)); bx.stroke(); bx.globalAlpha = 1;
    bx.restore();
    return [A, B];
  }

  const def = {
    words: 'Paper Robots began: two films, a separate site',
    process: 'pochoir',
    alt: 'the paper robot, seen from behind in a velvet seat, watches its films in an art-deco picture palace while a projector beam crosses the hall.',
    fps: 18,
    still: 1,
    build(w, h) {
      const S = sheet(w, h);
      const sc = scene(w, h, S);
      const base = canvas(w, h), x = base.getContext('2d');
      const behind = sc.L.slice(0, 5), front = sc.L.slice(5);
      behind.forEach((l) => put(x, l, l.dx, l.dy));
      const fore = canvas(w, h), fx = fore.getContext('2d');
      front.forEach((l) => put(fx, l, l.dx, l.dy));
      // the beam: a translucent stencil, brightest near the projector
      const scr = sc.screen;
      const beam = stencil(w, h, S, (bx) => { bx.moveTo(S.X(0.43), S.Y(-0.05)); bx.lineTo(S.X(0.57), S.Y(-0.05)); bx.lineTo(S.X(scr[2]), S.Y(scr[3])); bx.lineTo(S.X(scr[0]), S.Y(scr[3])); bx.closePath(); },
        '#f4dc96', { cloud: sc.cl, mottle: 0.12, seed: 30, alpha: (u, v) => 0.46 - 0.26 * smooth(-0.05, 0.6, v), bb: [scr[0], -0.06, scr[2], scr[3]] });
      // the name in the cartouche
      x.save(); x.fillStyle = C.cream; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `800 ${Math.round(S.L(0.034))}px "Big Shoulders Stencil Display", Impact, sans-serif`;
      if ('letterSpacing' in x) x.letterSpacing = `${S.L(0.006)}px`;
      x.fillText('PAPER ROBOTS', S.X(0.5), S.Y(0.134)); x.restore();
      const [fa, fb] = films(w, h, S, sc.cl, scr);
      return { w, h, S, base, fore, beam, fa, fb, scr };
    },
    draw(ctx, st, t) {
      ctx.drawImage(st.base, 0, 0);
      // the films alternate, with one dark frame at each cut
      const cyc = (t + 1.4) % 6, dark = Math.abs(cyc - 3) < 0.05 || cyc < 0.05;
      if (!dark) ctx.drawImage(cyc < 3 ? st.fa : st.fb, 0, 0);
      const flick = 0.9 + 0.1 * Math.sin(t * 73.1) * Math.sin(t * 17.3);
      ctx.save(); ctx.globalAlpha = 0.07 * (1.15 - flick) + (dark ? 0.25 : 0);
      ctx.fillStyle = '#1d1a24'; ctx.fillRect(st.S.X(st.scr[0]), st.S.Y(st.scr[1]), st.S.L(st.scr[2] - st.scr[0]), st.S.L(st.scr[3] - st.scr[1])); ctx.restore();
      ctx.save(); ctx.globalAlpha = flick; put(ctx, st.beam); ctx.restore();
      // dust in the beam
      const S = st.S, r = rng(4242);
      ctx.save();
      for (let i = 0; i < 46; i++) {
        const ph = r(), sp = 0.012 + r() * 0.02, bu = r(), drift = r();
        const v = ((ph + t * sp) % 1) * 0.62 - 0.02;
        const half = 0.07 + (v + 0.05) / 0.65 * 0.25;
        const u = 0.5 + (bu - 0.5) * 2 * half * 0.9 + Math.sin(t * 0.4 + drift * 6) * 0.006;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + drift * 2) + ph * 9));
        ctx.globalAlpha = 0.5 * tw * (1 - smooth(0.4, 0.6, v));
        ctx.fillStyle = '#fff3cf';
        ctx.beginPath(); ctx.arc(S.X(u), S.Y(v), S.L(0.0018 + drift * 0.0016), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      ctx.drawImage(st.fore, 0, 0);
    },
    label(ctx, st, name) {
      const S = st.S, fs = Math.round(S.L(0.05));
      ctx.save(); ctx.fillStyle = 'rgba(239,227,198,0.92)'; ctx.textAlign = 'left';
      ctx.font = `800 ${fs}px "Big Shoulders Stencil Display", Impact, sans-serif`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.08}px`;
      ctx.fillText(name.toUpperCase(), Math.max(S.L(0.05), S.X(0.06)), st.h - Math.max(fs * 0.9, S.L(0.05)));
      ctx.restore();
    },
  };
  (window.PLATE_DEFS = window.PLATE_DEFS || {})['2026-09'] = def;
})();
