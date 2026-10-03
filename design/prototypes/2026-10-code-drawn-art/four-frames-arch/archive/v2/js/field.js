/* Arched window mosaic: the field tools a mosaicist's layout needs. Copied from the room
   mosaic study (four-frames-mosaic/js/tessera.js and paths.js): a distance transform, a box blur,
   contour tracing and walking a line one stone at a time, plus a bucket grid for spacing. */

/* exact squared Euclidean distance transform (Felzenszwalb & Huttenlocher) */
function edt1d(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const dq = q - v[k]; d[q] = dq * dq + f[v[k]]; }
}
export function distanceField(mask, W, H) {
  const INF = 1e12, N = Math.max(W, H), f = new Float64Array(N), d = new Float64Array(N), v = new Int32Array(N), z = new Float64Array(N + 1);
  const g = new Float64Array(W * H);
  for (let i = 0; i < W * H; i++) g[i] = mask[i] ? 0 : INF;
  for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = g[y * W + x]; edt1d(f, H, d, v, z); for (let y = 0; y < H; y++) g[y * W + x] = d[y]; }
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) { const o = y * W; for (let x = 0; x < W; x++) f[x] = g[o + x]; edt1d(f, W, d, v, z); for (let x = 0; x < W; x++) out[o + x] = Math.sqrt(d[x]); }
  return out;
}
export function boxBlur(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H), n = 2 * r + 1;
  for (let y = 0; y < H; y++) { let acc = 0; const o = y * W; for (let x = -r; x <= r; x++) acc += src[o + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { tmp[o + x] = acc / n; acc += src[o + Math.min(W - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; } }
  for (let x = 0; x < W; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { out[y * W + x] = acc / n; acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; } }
  return out;
}


/* a grid of buckets so "is there a stone too close?" stays cheap */
export class Buckets {
  constructor(W, H, cell) { this.cell = cell; this.cw = Math.ceil(W / cell) + 1; this.ch = Math.ceil(H / cell) + 1; this.b = new Array(this.cw * this.ch); this.xs = []; this.ys = []; }
  add(x, y, id) { const k = Math.floor(y / this.cell) * this.cw + Math.floor(x / this.cell); (this.b[k] || (this.b[k] = [])).push(id); this.xs[id] = x; this.ys[id] = y; }
  near(x, y, r) {
    const c = this.cell, x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c), y0 = Math.floor((y - r) / c), y1 = Math.floor((y + r) / c), r2 = r * r;
    for (let gy = Math.max(0, y0); gy <= Math.min(this.ch - 1, y1); gy++) for (let gx = Math.max(0, x0); gx <= Math.min(this.cw - 1, x1); gx++) {
      const l = this.b[gy * this.cw + gx]; if (!l) continue;
      for (const id of l) { const dx = this.xs[id] - x, dy = this.ys[id] - y; if (dx * dx + dy * dy < r2) return true; }
    }
    return false;
  }
}


/** Contours of a scalar field at `level`, as polylines (marching squares, linked by edge). */
export function contours(F, W, H, level, mask, box) {
  const bx0 = box ? Math.max(0, box[0]) : 0, by0 = box ? Math.max(0, box[1]) : 0, bx1 = box ? Math.min(W - 1, box[2]) : W - 1, by1 = box ? Math.min(H - 1, box[3]) : H - 1;
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
  for (let y = by0; y < by1; y++) for (let x = bx0; x < bx1; x++) {
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
