/* Four frames in mosaic: the lines stones are walked along.
   A mosaicist sets stones along a line, one after another, each turned to the line. Two kinds
   of line are used here: the cartoon's own ink outlines, recorded as polylines while the
   drawing is replayed, and the contours of the row field φ, traced with marching squares. */

/** A stand-in context that flattens a path (in the drawing's units) into polylines in sheet
    pixels, through the transform that was current when the outline was inked. */
export class Flatten {
  constructor(M, tol = .9) { this.M = M; this.out = []; this.cur = null; this.x = 0; this.y = 0; this.sx = 0; this.sy = 0; this.tol = tol; }
  map(x, y) { const M = this.M; return [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]; }
  start(x, y) { this.end(); this.cur = [this.map(x, y)]; this.x = this.sx = x; this.y = this.sy = y; }
  to(x, y) { if (!this.cur) this.start(this.x, this.y); this.cur.push(this.map(x, y)); this.x = x; this.y = y; }
  end() { if (this.cur && this.cur.length > 1) this.out.push(this.cur); this.cur = null; }
  steps(len) { const sc = Math.hypot(this.M.a, this.M.b); return Math.max(4, Math.min(64, Math.ceil(len * sc / 3))); }
  moveTo(x, y) { this.start(x, y); }
  lineTo(x, y) { this.to(x, y); }
  closePath() { if (this.cur) { this.to(this.sx, this.sy); this.end(); } this.x = this.sx; this.y = this.sy; }
  bezierCurveTo(a, b, c, d, x, y) {
    const x0 = this.x, y0 = this.y, n = this.steps(Math.hypot(a - x0, b - y0) + Math.hypot(c - a, d - b) + Math.hypot(x - c, y - d));
    for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; this.to(u * u * u * x0 + 3 * u * u * t * a + 3 * u * t * t * c + t * t * t * x, u * u * u * y0 + 3 * u * u * t * b + 3 * u * t * t * d + t * t * t * y); }
  }
  quadraticCurveTo(a, b, x, y) {
    const x0 = this.x, y0 = this.y, n = this.steps(Math.hypot(a - x0, b - y0) + Math.hypot(x - a, y - b));
    for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; this.to(u * u * x0 + 2 * u * t * a + t * t * x, u * u * y0 + 2 * u * t * b + t * t * y); }
  }
  ellipse(cx, cy, rx, ry, rot, a0, a1, ccw) {
    let span = a1 - a0;
    if (ccw) { if (span > 0) span -= Math.PI * 2; } else if (span < 0) span += Math.PI * 2;
    span = Math.max(-Math.PI * 2, Math.min(Math.PI * 2, span));
    const n = this.steps(Math.abs(span) * Math.max(rx, ry)), cr = Math.cos(rot || 0), sr = Math.sin(rot || 0);
    for (let i = 0; i <= n; i++) {
      const a = a0 + span * i / n, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry, x = cx + ex * cr - ey * sr, y = cy + ex * sr + ey * cr;
      if (i === 0) { if (this.cur) this.to(x, y); else this.start(x, y); } else this.to(x, y);
    }
    if (Math.abs(span) >= Math.PI * 2 - 1e-3) this.end();
  }
  arc(cx, cy, r, a0, a1, ccw) { this.ellipse(cx, cy, r, r, 0, a0, a1, ccw); }
  arcTo(x1, y1) { this.to(x1, y1); }
  rect(x, y, w, h) { this.start(x, y); this.to(x + w, y); this.to(x + w, y + h); this.to(x, y + h); this.to(x, y); this.end(); }
  roundRect(x, y, w, h) { this.rect(x, y, w, h); }
}

/** Contours of a scalar field at `level`, as polylines (marching squares, linked by edge). */
export function contours(F, W, H, level, mask) {
  const segs = [], key = (x, y, vert) => (vert ? W * H : 0) + y * W + x;
  const P = new Map();
  const pt = (x, y, vert) => {
    const k = key(x, y, vert); let p = P.get(k);
    if (!p) {
      if (!vert) { const a = F[y * W + x], b = F[y * W + x + 1], t = (level - a) / (b - a); p = [x + t, y]; }
      else { const a = F[y * W + x], b = F[(y + 1) * W + x], t = (level - a) / (b - a); p = [x, y + t]; }
      P.set(k, p);
    }
    return k;
  };
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
    if (mask && !mask[y * W + x]) continue;
    const i = y * W + x, a = F[i] > level, b = F[i + 1] > level, c = F[i + W + 1] > level, d = F[i + W] > level;
    const cs = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
    if (cs === 0 || cs === 15) continue;
    const T = () => pt(x, y, false), R = () => pt(x + 1, y, true), Bm = () => pt(x, y + 1, false), Lf = () => pt(x, y, true);
    switch (cs) {
      case 1: case 14: segs.push([Lf(), Bm()]); break;
      case 2: case 13: segs.push([Bm(), R()]); break;
      case 3: case 12: segs.push([Lf(), R()]); break;
      case 4: case 11: segs.push([T(), R()]); break;
      case 6: case 9: segs.push([T(), Bm()]); break;
      case 7: case 8: segs.push([Lf(), T()]); break;
      case 5: case 10: {
        const ctr = (F[i] + F[i + 1] + F[i + W] + F[i + W + 1]) / 4 > level;
        if ((cs === 5) === ctr) { segs.push([Lf(), T()]); segs.push([Bm(), R()]); } else { segs.push([Lf(), Bm()]); segs.push([T(), R()]); }
        break;
      }
    }
  }
  // link segments that share an edge point into polylines
  const at = new Map();
  segs.forEach((s, i) => { for (const k of s) { const l = at.get(k); if (l) l.push(i); else at.set(k, [i]); } });
  const used = new Uint8Array(segs.length), lines = [];
  for (let i0 = 0; i0 < segs.length; i0++) {
    if (used[i0]) continue;
    used[i0] = 1;
    const chain = [segs[i0][0], segs[i0][1]];
    for (const dir of [1, 0]) {
      for (;;) {
        const end = dir ? chain[chain.length - 1] : chain[0];
        const nb = (at.get(end) || []).find(j => !used[j]);
        if (nb === undefined) break;
        used[nb] = 1;
        const s = segs[nb], nxt = s[0] === end ? s[1] : s[0];
        if (dir) chain.push(nxt); else chain.unshift(nxt);
      }
    }
    lines.push(chain.map(k => P.get(k)));
  }
  return lines;
}

/** Walk a polyline, setting a stone every step(x, y) × k along it; place(x, y, angle, size).
    A closed ring is evened out so its last stone meets its first. */
export function walk(line, stepAt, k, place) {
  const n = line.length; if (n < 2) return;
  const L = new Float32Array(n);
  for (let i = 1; i < n; i++) L[i] = L[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
  const total = L[n - 1];
  const pos = d => {
    let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m; else hi = m; }
    const t = (d - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
    return [line[lo][0] + (line[hi][0] - line[lo][0]) * t, line[lo][1] + (line[hi][1] - line[lo][1]) * t];
  };
  const s0 = stepAt(line[0][0], line[0][1]) * k;
  if (total < s0 * .55) return;
  const closed = Math.hypot(line[0][0] - line[n - 1][0], line[0][1] - line[n - 1][1]) < 1.5;
  // first pass: the natural spacing; a closed ring is then stretched to a whole number of stones
  const ds = []; let d = closed ? 0 : s0 * .5;
  while (d <= total) { ds.push(d); const p = pos(d); d += stepAt(p[0], p[1]) * k; }
  // d is now where the next stone would go; on a ring that should land on the first stone
  if (closed && ds.length > 1) { const sc = total / d; for (let i = 0; i < ds.length; i++) ds[i] *= sc; }
  for (const dd of ds) {
    const p = pos(dd), st = stepAt(p[0], p[1]) * k, a = pos(Math.max(0, dd - st * .5)), b = pos(Math.min(total, dd + st * .5));
    place(p[0], p[1], Math.atan2(b[1] - a[1], b[0] - a[0]), stepAt(p[0], p[1]));
  }
}
