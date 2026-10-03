/* Four frames in mosaic: laying the stones (andamento).
   From the cartoon's sheets the layout is worked out the way a mosaicist lays a floor:
     1. a row of dark stones is set along every ink outline;
     2. two rows hug each outline and each meeting of colours on both sides (opus vermiculatum);
        small shapes (a lamp shade, a robot's head, the sun) keep going inward in concentric rows;
     3. big fields (wall, sky, floor, desk top) are filled with straight courses in running bond
        (opus tessellatum);
     4. what is left is filled with smaller cut stones.
   Rows follow a "phase" field φ: distance from an ink line in stone widths, or distance from a
   colour edge plus half a stone. Rows sit on whole values of φ; stones lie along its contours. */
import { stoneOf, labDist, INK_STONE } from './palette.js';
import { mulberry32 } from './core.js';
import { contours, walk } from './paths.js';

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
function boxBlur(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H), n = 2 * r + 1;
  for (let y = 0; y < H; y++) { let acc = 0; const o = y * W; for (let x = -r; x <= r; x++) acc += src[o + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { tmp[o + x] = acc / n; acc += src[o + Math.min(W - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; } }
  for (let x = 0; x < W; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { out[y * W + x] = acc / n; acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; } }
  return out;
}

/* connected areas between ink and edges */
function regions(ink, edge, W, H) {
  const N = W * H, lab = new Int32Array(N).fill(-1), area = [], q = new Int32Array(N);
  let nl = 0;
  for (let i0 = 0; i0 < N; i0++) {
    if (lab[i0] >= 0 || ink[i0] || edge[i0]) continue;
    let qh = 0, qt = 0; q[qt++] = i0; lab[i0] = nl; let n = 0;
    while (qh < qt) {
      const i = q[qh++]; n++;
      const x = i % W;
      if (x > 0 && lab[i - 1] < 0 && !ink[i - 1] && !edge[i - 1]) { lab[i - 1] = nl; q[qt++] = i - 1; }
      if (x < W - 1 && lab[i + 1] < 0 && !ink[i + 1] && !edge[i + 1]) { lab[i + 1] = nl; q[qt++] = i + 1; }
      if (i >= W && lab[i - W] < 0 && !ink[i - W] && !edge[i - W]) { lab[i - W] = nl; q[qt++] = i - W; }
      if (i < N - W && lab[i + W] < 0 && !ink[i + W] && !edge[i + W]) { lab[i + W] = nl; q[qt++] = i + W; }
    }
    area.push(n); nl++;
  }
  return { lab, area, nl };
}

/* a grid of buckets so "is there a stone too close?" stays cheap */
class Buckets {
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

/**
 * Lay out the stones for one cartoon.
 *   sheets: { W, H, base, col, line, hole?, lines? } RGBA arrays at sheet resolution, plus the
 *           ink outlines as polylines
 *   s:      stone size in sheet pixels for the open fields (wall, floor, desk top, sky)
 *   opts:   { fine: size factor for small shapes and detail (default .74), seed, cover }
 * Returns { tiles, W, H } where each tile is
 *   { x, y, a, l, w, k (0 outline, 1 row, 2 course, 3 cut), row, j: corner jitter, h }
 */
export function* layStonesSteps(sheets, s, opts = {}) {
  const { W, H, base, line, hole } = sheets, N = W * H, fine = opts.fine ?? .74;
  const rnd = mulberry32(opts.seed || 7);
  /* 1. what the cartoon says: stone colour of each field, ink lines, colour edges */
  const fieldStone = new Int16Array(N).fill(-1);
  for (let i = 0; i < N; i++) { const p = i * 4; if (base[p + 3] > 128) fieldStone[i] = stoneOf(base[p], base[p + 1], base[p + 2]); }
  const ink = new Uint8Array(N), edge = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (line[i * 4 + 3] > 90) ink[i] = 1;
  const distCache = new Map(), far = (a, b) => {
    if (a === b) return false; if (a < 0 || b < 0) return a !== b;
    const k = a < b ? a * 64 + b : b * 64 + a; let v = distCache.get(k);
    if (v === undefined) { v = labDist(a, b) > 17; distCache.set(k, v); } return v;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, a = fieldStone[i];
    if (x + 1 < W && far(a, fieldStone[i + 1])) edge[i] = 1;
    if (y + 1 < H && far(a, fieldStone[i + W])) edge[i] = 1;
  }
  const holeAt = i => hole && hole[i * 4 + 3] > 100;
  const inHole = (x, y) => { if (!hole) return false; const xi = Math.min(W - 1, Math.max(0, x | 0)), yi = Math.min(H - 1, Math.max(0, y | 0)); return holeAt(yi * W + xi); };
  if (hole) for (let i = 0; i < N; i++) if (holeAt(i)) {
    const x = i % W, y = (i / W) | 0;
    const out = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && !holeAt(yy * W + xx);
    if (out(x - 1, y) || out(x + 1, y) || out(x, y - 1) || out(x, y + 1)) ink[i] = 1;
  }
  yield;
  /* 2. fields: connected areas between edges. Tiny ones (a few stones) do not steer the rows:
        their edges are dropped and they are only coloured into the stones laid across them. */
  let { lab, area, nl } = regions(ink, edge, W, H);
  const tiny = (s * 1.25) ** 2;
  {
    const keep = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (!edge[i]) continue;
      let a1 = -1, two = false;
      for (let dy = -1; dy <= 1 && !two; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const l = lab[yy * W + xx]; if (l < 0 || area[l] < tiny) continue;
        if (a1 < 0) a1 = l; else if (l !== a1) { two = true; break; }
      }
      if (two) keep[i] = 1;
    }
    for (let i = 0; i < N; i++) edge[i] = keep[i];
    ({ lab, area, nl } = regions(ink, edge, W, H));
  }
  yield;
  const bigArea = (s * (opts.bigStones || 13)) ** 2;
  const bigLab = new Uint8Array(nl);
  for (let l = 0; l < nl; l++) bigLab[l] = area[l] > bigArea ? 1 : 0;
  const big = new Uint8Array(N);
  for (let i = 0; i < N; i++) { const l = lab[i]; big[i] = l >= 0 && bigLab[l] ? 1 : 0; }
  // the stone size at each point: open fields full size, small shapes finer, eased across the change
  const sz0 = new Float32Array(N);
  for (let i = 0; i < N; i++) sz0[i] = big[i] ? s : s * fine;
  // outlines and edges belong to the finer of their two sides
  const sz = boxBlur(sz0, W, H, Math.max(1, Math.round(s * .6)));
  for (let i = 0; i < N; i++) sz[i] = Math.min(sz[i], big[i] ? s : s * fine);
  const sAt = (x, y) => sz[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
  yield;
  /* 3. the phase field: rows of stones at whole values of φ */
  const dInk = distanceField(ink, W, H), dCol = distanceField(edge, W, H);
  const phi = new Float32Array(N);
  for (let i = 0; i < N; i++) phi[i] = Math.min(dInk[i] / sz[i], dCol[i] / sz[i] + .5);
  yield;
  /* stones lie along the contours of φ: orientation from its smoothed structure tensor */
  const jxx = new Float32Array(N), jxy = new Float32Array(N), jyy = new Float32Array(N);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x, gx = (phi[i + 1] - phi[i - 1]) * .5, gy = (phi[i + W] - phi[i - W]) * .5;
    jxx[i] = gx * gx; jxy[i] = gx * gy; jyy[i] = gy * gy;
  }
  const r = Math.max(2, Math.round(s * .4));
  const bxx = boxBlur(boxBlur(jxx, W, H, r), W, H, r), bxy = boxBlur(boxBlur(jxy, W, H, r), W, H, r), byy = boxBlur(boxBlur(jyy, W, H, r), W, H, r);
  // where the field has no clear direction (open wall), stones run level, as in courses
  const ang = i => {
    const tr = bxx[i] + byy[i], coh = tr > 1e-6 ? Math.hypot(bxx[i] - byy[i], 2 * bxy[i]) / tr : 0;
    return coh < .35 ? 0 : .5 * Math.atan2(2 * bxy[i], bxx[i] - byy[i]) + Math.PI / 2;
  };

  yield;
  const tiles = [], B = new Buckets(W, H, s);
  const jit = (amt) => { const j = new Float32Array(8); for (let k = 0; k < 8; k++) j[k] = (rnd() - .5) * amt; return j; };
  const add = (x, y, a, l, w, k, row, ls) => { const id = tiles.length; tiles.push({ x, y, a, l, w, k, row, s: ls, j: jit(ls * (k === 3 ? .14 : .085)), h: rnd() }); B.add(x, y, id); return id; };
  const free = (x, y, r) => !B.near(x, y, r);

  /* 4. the outline row, walked along the cartoon's own ink lines (and round the prints) */
  const inkNear = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = (x | 0) + dx, yy = (y | 0) + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && ink[yy * W + xx]) return true; } return false; };
  const outlineLines = (sheets.lines || []).slice();
  if (hole) { const hf = new Float32Array(N); for (let i = 0; i < N; i++) hf[i] = hole[i * 4 + 3] / 255; for (const l of contours(hf, W, H, .5)) outlineLines.push(l); }
  outlineLines.sort((p, q) => q.length - p.length);
  for (const ln of outlineLines) walk(ln, sAt, .78, (x, y, a, ls) => {
    if (x < 0 || y < 0 || x >= W || y >= H || !inkNear(x, y)) return;
    if (!free(x, y, ls * .6)) return;
    add(x, y, a, ls * .7, ls * .6, 0, 0, ls);
  });
  yield;
  /* 5. rows: the contours of φ at 1, 2, 3 …; past the third, only inside small shapes */
  const small = new Uint8Array(N);
  for (let i = 0; i < N; i++) small[i] = big[i] ? 0 : 1;
  let maxPhi = 0; for (let i = 0; i < N; i++) if (small[i] && phi[i] > maxPhi && !ink[i] && !holeAt(i)) maxPhi = phi[i];
  for (let k = 1; k <= Math.max(3, Math.floor(maxPhi)); k++) {
    const lines = contours(phi, W, H, k, k > 3 ? small : null);
    lines.sort((p, q) => q.length - p.length);
    for (const ln of lines) walk(ln, sAt, .98, (x, y, a, ls) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      if (inHole(x, y) || !free(x, y, ls * .8)) return;
      add(x, y, a, ls * (.82 + rnd() * .06), ls * .78, 1, k, ls);
    });
  }
  yield;
  /* 6. straight courses in running bond for the big fields */
  const rowH = s * .9;
  for (let row = 0, yc = rowH / 2; yc < H; row++, yc += rowH) {
    let xc = -((row * 7.3) % 1) * s * 1.1 - s;
    while (xc < W + s) {
      const len = s * (1.12 + rnd() * .2);
      const cx = xc + len / 2, i = Math.min(H - 1, yc | 0) * W + Math.min(W - 1, Math.max(0, cx | 0));
      if (cx >= 0 && cx < W && big[i] && phi[i] > 3.42 && !inHole(cx, yc) && free(cx, yc, s * .74)) add(cx, yc, (rnd() - .5) * .025, len * .9, rowH * .86, 2, 99, s);
      xc += len;
    }
  }
  yield;
  /* 7. fill what is left with smaller cut stones */
  const cover = opts.cover;
  if (cover) {
    for (const [size, gap] of [[.7, .6], [.52, .44]]) {
      yield;
      const cov = cover(tiles, 1.06);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x; if (cov[i * 4 + 3] > 60 || holeAt(i)) continue;
        if (big[i] && phi[i] > 3.3) continue;  // the courses' own joints are grout, not gaps
        const ls = sz[i];
        if (!free(x + .5, y + .5, ls * gap)) continue;
        add(x + .5, y + .5, ang(i), ls * size, ls * size * .9, 3, 100, ls);
      }
    }
  }
  yield;
  /* 8. fit the stones: each takes the cell of sheet nearest to it (in its own square measure,
        within its own field), moves to the cell's centre, and is cut to fill it less the grout.
        This is what makes the stones sit tight in their rows rather than scattered. */
  const kept = yield* relax(tiles, { W, H, lab, ink, dInk, sz, holeAt }, s, opts.grout ?? .13);
  return { tiles: kept, W, H, phi, sz };
}

function* relax(tiles, F, s, grout) {
  const { W, H, lab, dInk, sz, holeAt } = F, up = 2, W2 = W * up, H2 = H * up;
  const labAt = (x, y) => lab[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
  for (const t of tiles) {
    t.lab = -1;
    if (t.k === 0) { t.lab = -2; continue; }
    for (let r = 0; r <= 2 && t.lab < 0; r++) for (let dy = -r; dy <= r && t.lab < 0; dy++) for (let dx = -r; dx <= r; dx++) { const l = labAt(t.x + dx, t.y + dy); if (l >= 0) { t.lab = l; break; } }
  }
  const n = tiles.length, sx = new Float64Array(n), sy = new Float64Array(n), cnt = new Int32Array(n);
  const mnU = new Float32Array(n), mxU = new Float32Array(n), mnV = new Float32Array(n), mxV = new Float32Array(n);
  const cosA = new Float32Array(n), sinA = new Float32Array(n), hl = new Float32Array(n), hw = new Float32Array(n);
  for (let pass = 0; pass < 3; pass++) {
    const final = pass === 2;
    const B = new Buckets(W, H, s);
    tiles.forEach((t, i) => { B.add(t.x, t.y, i); cosA[i] = Math.cos(t.a); sinA[i] = Math.sin(t.a); hl[i] = Math.max(.5, t.l / 2); hw[i] = Math.max(.5, t.w / 2); });
    sx.fill(0); sy.fill(0); cnt.fill(0);
    if (final) { mnU.fill(1e9); mxU.fill(-1e9); mnV.fill(1e9); mxV.fill(-1e9); }
    const cw = B.cw, cell = B.cell;
    for (let y2 = 0; y2 < H2; y2++) {
      const py = (y2 + .5) / up, yi = Math.min(H - 1, py | 0), gy = Math.floor(py / cell);
      for (let x2 = 0; x2 < W2; x2++) {
        const px = (x2 + .5) / up, xi = Math.min(W - 1, px | 0), i = yi * W + xi;
        if (holeAt(i)) continue;
        const inkZone = dInk[i] < sz[i] * .3, cls = inkZone ? -2 : lab[i];
        const gx = Math.floor(px / cell);
        let best = -1, bd = 1.75;
        for (let by = gy - 1; by <= gy + 1; by++) {
          if (by < 0 || by >= B.ch) continue;
          for (let bx = gx - 1; bx <= gx + 1; bx++) {
            if (bx < 0 || bx >= cw) continue;
            const l = B.b[by * cw + bx]; if (!l) continue;
            for (const id of l) {
              const t = tiles[id];
              if (cls === -2 ? t.k !== 0 : (t.k === 0 || (cls >= 0 && t.lab >= 0 && t.lab !== cls))) continue;
              const dx = px - t.x, dy = py - t.y;
              const u = (dx * cosA[id] + dy * sinA[id]) / hl[id], v = (-dx * sinA[id] + dy * cosA[id]) / hw[id];
              // a course stone is already cut and set: nothing takes ground from inside it
              let d = Math.max(Math.abs(u), Math.abs(v));
              if (t.k === 2) d = d <= 1.06 ? d * .2 : d + .15;
              if (d < bd) { bd = d; best = id; }
            }
          }
        }
        if (best < 0) continue;
        cnt[best]++; sx[best] += px; sy[best] += py;
        if (final) {
          const t = tiles[best], dx = px - t.x, dy = py - t.y, u = dx * cosA[best] + dy * sinA[best], v = -dx * sinA[best] + dy * cosA[best];
          if (u < mnU[best]) mnU[best] = u; if (u > mxU[best]) mxU[best] = u; if (v < mnV[best]) mnV[best] = v; if (v > mxV[best]) mxV[best] = v;
        }
      }
    }
    if (!final) {
      for (let i = 0; i < n; i++) if (cnt[i] > 0 && tiles[i].k !== 2) {
        const t = tiles[i], nx = sx[i] / cnt[i], ny = sy[i] / cnt[i], m = Math.hypot(nx - t.x, ny - t.y), lim = (t.s || s) * .35;
        const f = m > lim ? lim / m : 1; t.x += (nx - t.x) * f; t.y += (ny - t.y) * f;
      }
      yield;
    }
  }
  // cut each stone to its cell, less the grout, and never much bigger than a stone
  const out = [];
  for (let i = 0; i < n; i++) {
    if (cnt[i] < 2) continue;
    const t = tiles[i], ls = t.s || s, g = ls * grout, px = 1 / up;
    if (t.k === 2) { out.push(t); continue; }  // courses keep their own regular cut
    const L = Math.min(mxU[i] - mnU[i] + px - g, ls * (t.k === 0 ? .78 : t.k === 3 ? .95 : 1.25)), Wd = Math.min(mxV[i] - mnV[i] + px - g, ls * (t.k === 0 ? .62 : t.k === 3 ? .85 : 1.05));
    if (L < ls * .22 || Wd < ls * .18) continue;
    const cu = (mxU[i] + mnU[i]) / 2, cv = (mxV[i] + mnV[i]) / 2;
    t.x += cu * cosA[i] - cv * sinA[i]; t.y += cu * sinA[i] + cv * cosA[i];
    t.l = L; t.w = Wd;
    for (let k = 0; k < 8; k++) t.j[k] *= .6;
    out.push(t);
  }
  return out;
}
/** the same, straight through */
export function layStones(sheets, s, opts = {}) {
  const g = layStonesSteps(sheets, s, opts); let r = g.next();
  while (!r.done) r = g.next();
  return r.value;
}

/** the four corners of a stone, in sheet pixels */
export function corners(t, out = new Float32Array(8)) {
  const c = Math.cos(t.a), s = Math.sin(t.a), hl = t.l / 2, hw = t.w / 2, j = t.j;
  const P = [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]];
  for (let k = 0; k < 4; k++) {
    const lx = P[k][0] + j[k * 2], ly = P[k][1] + j[k * 2 + 1];
    out[k * 2] = t.x + c * lx - s * ly; out[k * 2 + 1] = t.y + s * lx + c * ly;
  }
  return out;
}
export { INK_STONE };
