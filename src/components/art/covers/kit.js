// The print kit shared by every code-drawn cover.
// Ported from design/prototypes/2026-10-code-drawn-art/covers/index.html.
// Every cover is designed in 400×600 units and printed at any pixel size: shapes are drawn
// into alpha masks, then "inked" with spread, mottle, grain and voids so they read as print.

export const TAU = Math.PI * 2, PI = Math.PI;
export const DW = 400, DH = 600;

/* ───────────────────────── numbers ───────────────────────── */
export function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(ix, iy, s) { let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s, 982451653); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
export function vnoise(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x, y, s, oct) { let v = 0, a = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += a * vnoise(x * f, y * f, s + i * 17); n += a; a *= .5; f *= 2.03; } return v / n; }
export const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export function rgb(hex) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }

/* ───────────────────────── geometry ───────────────────────── */
export function arcPts(cx, cy, rx, ry, a0, a1, n) { n = n || Math.max(10, Math.ceil(Math.abs(a1 - a0) / (PI / 18))); const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; }
export function bez(p0, p1, p2, p3, n = 40) { const p = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; p.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return p; }
export const cat = (...parts) => [].concat(...parts);
export function polyLen(p) { let l = 0; for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return l; }
export function resample(p, step) {
  if (p.length < 2) return [p[0].slice()];
  const out = [p[0].slice()]; let carry = 0;
  for (let i = 1; i < p.length; i++) {
    const ax = p[i - 1][0], ay = p[i - 1][1], bx = p[i][0], by = p[i][1]; const seg = Math.hypot(bx - ax, by - ay); if (!seg) continue;
    let d = step - carry;
    while (d <= seg) { const t = d / seg; out.push([ax + (bx - ax) * t, ay + (by - ay) * t]); d += step; }
    carry = seg - (d - step);
  }
  const last = p[p.length - 1]; const o = out[out.length - 1]; if (Math.hypot(last[0] - o[0], last[1] - o[1]) > step * .3) out.push(last.slice());
  return out;
}
export function pathPts(ctx, pts, close) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
// Displace a polyline along its normals with smooth noise.
export function wobble(pts, amp, freq, seed) {
  const out = []; let s = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = (vnoise(s * freq, seed, 3) - .5) * 2 * amp; out.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]);
  }
  return out;
}

/* ───────────────────────── a single-stroke alphabet ───────────────────────── */
// Skeletons in a cap-height box: x right, y down, 0 = cap line, 1 = baseline. One alphabet, many hands:
// brush (poster), marker (zine), pencil (annotation), broad nib (deco).
const GL = (() => {
  const A = arcPts;
  return {
    ' ': { w: .34, s: [] },
    A: { w: .72, s: [[[0, 1], [.36, 0], [.72, 1]], [[.16, .66], [.56, .66]]] },
    B: { w: .6, s: [[[0, 1], [0, 0]], cat([[0, 0], [.3, 0]], A(.3, .245, .25, .245, -PI / 2, PI / 2), [[.3, .49], [0, .49]]), cat([[0, .49], [.33, .49]], A(.33, .745, .27, .255, -PI / 2, PI / 2), [[.33, 1], [0, 1]])] },
    C: { w: .7, s: [A(.42, .5, .42, .5, -PI / 4, -7 * PI / 4)] },
    D: { w: .68, s: [[[0, 0], [0, 1]], cat([[0, 0], [.26, 0]], A(.26, .5, .42, .5, -PI / 2, PI / 2), [[.26, 1], [0, 1]])] },
    E: { w: .56, s: [[[.56, 0], [0, 0], [0, 1], [.56, 1]], [[0, .5], [.46, .5]]] },
    F: { w: .54, s: [[[.54, 0], [0, 0], [0, 1]], [[0, .5], [.44, .5]]] },
    G: { w: .74, s: [A(.44, .5, .44, .5, -PI / 4, -2 * PI + .04), [[.52, .54], [.88, .54], [.88, .9]]] },
    H: { w: .64, s: [[[0, 0], [0, 1]], [[.64, 0], [.64, 1]], [[0, .5], [.64, .5]]] },
    I: { w: .08, s: [[[.04, 0], [.04, 1]]] },
    J: { w: .46, s: [cat([[.46, 0], [.46, .7]], A(.23, .7, .23, .3, 0, PI))] },
    K: { w: .6, s: [[[0, 0], [0, 1]], [[.58, 0], [0, .6]], [[.2, .44], [.6, 1]]] },
    L: { w: .52, s: [[[0, 0], [0, 1], [.52, 1]]] },
    M: { w: .8, s: [[[0, 1], [.04, 0], [.4, .72], [.76, 0], [.8, 1]]] },
    N: { w: .64, s: [[[0, 1], [0, 0], [.64, 1], [.64, 0]]] },
    O: { w: .86, s: [A(.43, .5, .43, .5, -PI / 2, 3 * PI / 2 + .18)] },
    P: { w: .58, s: [[[0, 1], [0, 0]], cat([[0, 0], [.31, 0]], A(.31, .27, .27, .27, -PI / 2, PI / 2), [[.31, .54], [0, .54]])] },
    Q: { w: .86, s: [A(.43, .5, .43, .5, -PI / 2, 3 * PI / 2 + .18), [[.52, .72], [.9, 1.06]]] },
    R: { w: .62, s: [[[0, 1], [0, 0]], cat([[0, 0], [.31, 0]], A(.31, .27, .27, .27, -PI / 2, PI / 2), [[.31, .54], [0, .54]]), [[.26, .54], [.62, 1]]] },
    S: { w: .58, s: [cat(A(.29, .25, .27, .25, -PI / 6, -3 * PI / 2), A(.29, .75, .29, .25, -PI / 2, 5 * PI / 6))] },
    T: { w: .66, s: [[[0, 0], [.66, 0]], [[.33, 0], [.33, 1]]] },
    U: { w: .62, s: [cat([[0, 0], [0, .68]], A(.31, .68, .31, .32, PI, 0), [[.62, .68], [.62, 0]])] },
    V: { w: .68, s: [[[0, 0], [.34, 1], [.68, 0]]] },
    W: { w: .92, s: [[[0, 0], [.22, 1], [.46, .22], [.7, 1], [.92, 0]]] },
    X: { w: .62, s: [[[0, 0], [.62, 1]], [[.62, 0], [0, 1]]] },
    Y: { w: .64, s: [[[0, 0], [.32, .52]], [[.64, 0], [.32, .52], [.32, 1]]] },
    Z: { w: .6, s: [[[0, 0], [.6, 0], [0, 1], [.62, 1]]] },
    0: { w: .56, s: [A(.28, .5, .28, .5, -PI / 2, 3 * PI / 2 + .12)] },
    1: { w: .3, s: [[[0, .18], [.22, 0], [.22, 1]]] },
    2: { w: .54, s: [cat(A(.27, .27, .26, .27, -PI * .95, .15 * PI), [[0, 1], [.56, 1]])] },
    3: { w: .54, s: [cat(A(.26, .24, .25, .24, -PI * .9, PI / 2), A(.26, .74, .28, .26, -PI / 2, PI * .85))] },
    4: { w: .6, s: [[[.44, 1], [.44, 0], [0, .68], [.6, .68]]] },
    5: { w: .54, s: [cat([[.52, 0], [.06, 0], [.03, .45]], A(.26, .68, .28, .32, -PI * .75, PI * .8))] },
    6: { w: .54, s: [cat([[.46, 0], [.2, .26], [.05, .56]], A(.28, .72, .24, .28, PI * 1.1, PI * 3.12))] },
    7: { w: .56, s: [[[0, 0], [.56, 0], [.2, 1]]] },
    8: { w: .56, s: [A(.28, .25, .22, .25, PI / 2, PI / 2 + TAU), A(.28, .745, .27, .255, -PI / 2, 3 * PI / 2)] },
    9: { w: .54, s: [A(.27, .3, .25, .3, 0, TAU + .1), [[.52, .32], [.46, .7], [.22, 1]]] },
    '-': { w: .4, s: [[[.04, .56], [.36, .56]]] },
    '.': { w: .1, s: [[[.05, .96]]] },
    ',': { w: .1, s: [[[.06, .92], [0, 1.12]]] },
    '!': { w: .1, s: [[[.05, 0], [.05, .7]], [[.05, .97]]] },
    '?': { w: .52, s: [cat(A(.25, .25, .24, .24, -PI * .9, PI * .45)), [[.3, .47], [.25, .62], [.25, .72]], [[.25, .97]]] },
    '·': { w: .14, s: [[[.07, .55]]] },
    '’': { w: .1, s: [[[.07, 0], [.03, .22]]] },
    '→': { w: .76, s: [[[0, .55], [.74, .55]], [[.5, .32], [.74, .55], [.5, .78]]] },
  };
})();

export function glyphStrokes(text, o) {
  const size = o.size, xs = o.xs ?? 1, track = (o.track ?? .14) * size;
  const r = mulberry32(o.seed ?? 1);
  const chars = [...text.toUpperCase()];
  const adv = chars.map(ch => (GL[ch] || GL[' ']).w * size * xs);
  const total = adv.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
  let x = o.align === 'center' ? o.x - total / 2 : o.align === 'right' ? o.x - total : o.x;
  const out = [];
  chars.forEach((ch, ci) => {
    const g = GL[ch] || GL[' '];
    const jr = (r() - .5) * 2 * (o.jrot ?? 0), jy = (r() - .5) * 2 * (o.jy ?? 0) * size, js = 1 + (r() - .5) * 2 * (o.js ?? 0);
    const gw = adv[ci], cx = x + gw / 2, cy = o.y - size / 2; const co = Math.cos(jr), si = Math.sin(jr);
    const sl = o.slant ?? 0;
    for (const s of g.s) out.push(s.map(([px, py]) => { const X = (px * xs * size - gw / 2 + (.5 - py) * sl * size) * js, Y = (py * size - size / 2) * js; return [cx + X * co - Y * si, cy + jy + X * si + Y * co]; }));
    x += gw + track;
  });
  return { strokes: out, width: total };
}

// Round brush / marker / pencil: overlapping discs with taper, pressure and wobble.
export function brush(ctx, strokes, o) {
  const lens = strokes.map(polyLen); const total = lens.reduce((a, b) => a + b, 0);
  let budget = (o.progress ?? 1) * total;
  const w = o.w, step = o.step ?? Math.max(.18, w * .16);
  let seed = o.seed ?? 3, batch = 0;
  ctx.beginPath();
  for (let si = 0; si < strokes.length && budget > 0; si++) {
    const L = lens[si]; seed += 7.31;
    if (L < .01) { const p = strokes[si][0]; ctx.moveTo(p[0] + w * .62, p[1]); ctx.arc(p[0], p[1], w * .62, 0, TAU); budget -= w; continue; }
    const pts = resample(strokes[si], step); const lim = Math.min(L, budget); budget -= L;
    const ti = (o.taper ? o.taper[0] : 0) * w, to = (o.taper ? o.taper[1] : 0) * w;
    for (let k = 0; k < pts.length; k++) {
      const s = k * step; if (s > lim) break;
      const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
      const wob = (o.wob ?? 0) * (vnoise(s * (o.wobF ?? .06) + seed, seed, 1) - .5) * 2;
      const X = pts[k][0] - dy / dl * wob, Y = pts[k][1] + dx / dl * wob;
      let pr = 1;
      if (ti) pr *= .3 + .7 * smooth(0, 1, s / ti);
      if (to) pr *= .3 + .7 * smooth(0, 1, (L - s) / to);
      if (o.nib != null) pr *= (o.nibMin ?? .45) + (1 - (o.nibMin ?? .45)) * Math.abs(Math.sin(Math.atan2(dy, dx) - o.nib));
      if (o.vary) pr *= 1 + o.vary * (vnoise(s * .05 + seed * 3, 2, 2) - .5) * 2;
      const r = Math.max(.08, w * pr * .5);
      ctx.moveTo(X + r, Y); ctx.arc(X, Y, r, 0, TAU);
      if (++batch === 160) { ctx.fill(); ctx.beginPath(); batch = 0; }   // small paths fill far faster than one enormous one
    }
  }
  ctx.fill();
}

// Pencil / thin pen: cached wobbly polylines, stroked up to a fraction of their total length.
export function penPaths(strokes, o) {
  const paths = strokes.map((st, si) => st.length < 2 ? [st[0], [st[0][0] + .3, st[0][1] + .2]] : wobble(resample(st, o.step ?? .8), o.wob ?? .3, o.wobF ?? .2, (o.seed ?? 1) + si * 7.3));
  const lens = paths.map(polyLen); return { paths, lens, total: lens.reduce((a, b) => a + b, 0) };
}
export function strokePen(ctx, pp, progress) {
  let budget = progress * pp.total; ctx.beginPath();
  for (let i = 0; i < pp.paths.length && budget > 0; i++) {
    const p = pp.paths[i]; ctx.moveTo(p[0][0], p[0][1]);
    for (let k = 1; k < p.length; k++) { const l = Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); if (budget < l) { const t = budget / l; ctx.lineTo(lerp(p[k - 1][0], p[k][0], t), lerp(p[k - 1][1], p[k][1], t)); budget = 0; break; } ctx.lineTo(p[k][0], p[k][1]); budget -= l; }
  }
  ctx.stroke();
}

// Broad nib (deco hairline/heavy contrast): swept parallelograms, orientation-normalised so they union.
export function nibPen(ctx, strokes, o) {
  const nx = Math.cos(o.angle) * o.W / 2, ny = Math.sin(o.angle) * o.W / 2, step = o.step ?? .6, m = (o.min ?? .6) / 2;
  ctx.beginPath();
  for (const st of strokes) {
    const pts = st.length < 2 ? [st[0], st[0]] : resample(st, step);
    for (let k = 0; k < pts.length - 1; k++) {
      const p = pts[k], q = pts[k + 1];
      let quad = [[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]];
      const area = (quad[1][0] - quad[0][0]) * (quad[2][1] - quad[0][1]) - (quad[2][0] - quad[0][0]) * (quad[1][1] - quad[0][1]);
      if (area < 0) quad = quad.reverse();
      ctx.moveTo(quad[0][0], quad[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(quad[i][0], quad[i][1]); ctx.closePath();
      ctx.moveTo(p[0] + m, p[1]); ctx.arc(p[0], p[1], m, 0, TAU);
    }
    const e = pts[pts.length - 1]; ctx.moveTo(e[0] + m, e[1]); ctx.arc(e[0], e[1], m, 0, TAU);
  }
  ctx.fill('nonzero');
}

// Manually tracked text (fonts); returns width in design units.
export function spaced(ctx, str, x, y, ls = 0, align = 'left') {
  const chars = [...str]; const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + ls * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  if (!ls) { ctx.fillText(str, cx, y); return ctx.measureText(str).width; }
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + ls; });
  return total;
}

/* ───────────────────────── blur ───────────────────────── */
// Canvas filters are fast but missing in some browsers; the fallback is a three-pass box blur
// of the alpha channel (zero outside the sheet, like the native filter).
const NATIVE_FILTER = (() => {
  try { return typeof document !== 'undefined' && typeof document.createElement('canvas').getContext('2d').filter === 'string'; } catch { return false; }
})();
function boxesForGauss(sigma) {
  const wIdeal = Math.sqrt(12 * sigma * sigma / 3 + 1); let wl = Math.floor(wIdeal); if (wl % 2 === 0) wl--;
  const m = Math.round((12 * sigma * sigma - 3 * wl * wl - 12 * wl - 9) / (-4 * wl - 4));
  return [0, 1, 2].map(i => i < m ? wl : wl + 2);
}
function blurLine(s, d, start, stride, len, r) {
  const k = 1 / (2 * r + 1); let acc = 0;
  for (let j = 0; j <= Math.min(r, len - 1); j++) acc += s[start + j * stride];
  for (let i = 0; i < len; i++) {
    d[start + i * stride] = acc * k;
    const add = i + r + 1, sub = i - r;
    if (add < len) acc += s[start + add * stride];
    if (sub >= 0) acc -= s[start + sub * stride];
  }
}
function blurAlphaJS(data, W, H, sigma) {
  const N = W * H; let a = new Float32Array(N), b = new Float32Array(N);
  for (let i = 0; i < N; i++) a[i] = data[i * 4 + 3];
  for (const box of boxesForGauss(sigma)) {
    const r = (box - 1) / 2; if (r < 1) continue;
    for (let y = 0; y < H; y++) blurLine(a, b, y * W, 1, W, r);
    for (let x = 0; x < W; x++) blurLine(b, a, x, W, H, r);
  }
  const out = new Uint8ClampedArray(N * 4); for (let i = 0; i < N; i++) out[i * 4 + 3] = a[i]; return out;
}

/* ───────────────────────── print kit ───────────────────────── */
// Noise fields are shared by every cover printed at the same size; they are only needed while building.
const fieldCache = new Map();
function makeFields(W, H, S) {
  const N = W * H;
  const grid = (sx, sy, fn) => {
    const gw = Math.ceil(W / sx) + 2, gh = Math.ceil(H / sy) + 2; const g = new Float32Array(gw * gh);
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) g[gy * gw + gx] = fn(gx * sx / S, gy * sy / S);
    const out = new Float32Array(N);
    for (let y = 0; y < H; y++) { const fy = y / sy, iy = fy | 0, ty = fy - iy; for (let x = 0; x < W; x++) { const fx = x / sx, ix = fx | 0, tx = fx - ix, k = iy * gw + ix; const a = g[k], b = g[k + 1], c = g[k + gw], d = g[k + gw + 1]; out[y * W + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty; } }
    return out;
  };
  const st = v => clamp((v - .5) * 1.9 + .5);
  const F = { W, H };
  F.low = grid(8, 8, (x, y) => st(fbm(x / 55, y / 55, 3, 3)));
  F.mid = grid(Math.max(1, S * .8), Math.max(1, S * .8), (x, y) => st(fbm(x / 3, y / 3, 5, 3)));
  F.fine = grid(1, 1, (x, y) => st(fbm(x / 1.05, y / 1.05, 7, 2)));
  F.streak = grid(Math.max(2, S * 6), 1, (x, y) => st(fbm(x / 70, y / 1.5, 9, 3)));
  F.vstreak = grid(1, Math.max(2, S * 6), (x, y) => st(fbm(x / 1.5, y / 70, 13, 3)));
  F.brush = grid(Math.max(2, S * 4), Math.max(1, S * .8), (x, y) => st(fbm(x / 38 + fbm(x / 90, y / 90, 21, 2) * 2, y / 4.5, 19, 3)));
  F.wood = grid(Math.max(2, S * 3), 1, (x, y) => { const w = fbm(x / 110, y / 45, 23, 3) * 9 + fbm(x / 30, y / 12, 29, 2) * 1.5; const ring = .5 + .5 * Math.sin(TAU * (y / 2.6 + w)); return clamp(Math.pow(ring, 6) * (.4 + 1.2 * fbm(x / 25, y / 8, 31, 2))); });
  F.grain = new Float32Array(N); const r = mulberry32(99); for (let i = 0; i < N; i++) F.grain[i] = r();
  return F;
}
function getFields(W, H, S) {
  const key = W + 'x' + H;
  if (!fieldCache.has(key)) { fieldCache.clear(); fieldCache.set(key, makeFields(W, H, S)); }
  return fieldCache.get(key);
}
export function releaseFields() { fieldCache.clear(); }

function makeKit(W, H, seed, F) {
  const S = W / DW;
  const L = { W, H, S, seed, F, rng: mulberry32(seed * 7919 + 1) };
  L.canvas = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  L.ctx = c => { const x = c.getContext('2d', { willReadFrequently: true }); x.setTransform(S, 0, 0, S, 0, 0); return x; };
  L.scratch = L.canvas();
  L.base = L.canvas(); L.over = L.canvas(); L.bctx = L.ctx(L.base); L.octx = L.ctx(L.over);
  L.mask = fn => { const c = L.canvas(), x = L.ctx(c); x.fillStyle = x.strokeStyle = '#000'; x.lineCap = 'round'; x.lineJoin = 'round'; fn(x, L); return c; };
  L.ink = (src, o) => inkify(L, src, o);
  // Clipping is done by masking the source (destination-in) rather than ctx.clip(): on CPU-backed
  // (willReadFrequently) canvases, Chromium can clear pixels outside some clip paths during drawImage.
  L.clipTmp = null;
  L.put = (dst, src, o = {}) => {
    if (o.clip) {
      const t = L.clipTmp || (L.clipTmp = L.canvas()), tx = t.getContext('2d');
      tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = 'source-over'; tx.clearRect(0, 0, W, H); tx.drawImage(src, 0, 0);
      tx.globalCompositeOperation = 'destination-in'; tx.setTransform(S, 0, 0, S, 0, 0); tx.beginPath(); o.clip(tx); tx.fillStyle = '#000'; tx.fill();
      tx.globalCompositeOperation = 'source-over'; tx.setTransform(1, 0, 0, 1, 0, 0);
      src = t;
    }
    const x = dst.getContext('2d'); x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = o.mode || 'source-over'; x.globalAlpha = o.alpha ?? 1;
    if (o.dx || o.dy || o.rot) { x.translate(W / 2 + (o.dx || 0) * S, H / 2 + (o.dy || 0) * S); x.rotate(o.rot || 0); x.translate(-W / 2, -H / 2); }
    x.drawImage(src, 0, 0); x.restore();
  };
  L.paint = (dst, fn, inkO, putO) => L.put(dst, L.ink(L.mask(fn), inkO), putO);
  L.alphaOf = c => c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  L.blurA = (c, b) => {
    if (!NATIVE_FILTER) return blurAlphaJS(L.alphaOf(c), W, H, b * S);
    const t = L.scratch, x = t.getContext('2d', { willReadFrequently: true }); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.filter = `blur(${(b * S).toFixed(2)}px)`; x.drawImage(c, 0, 0); x.filter = 'none'; return x.getImageData(0, 0, W, H).data;
  };
  L.tex = null;
  return L;
}

// Ink: alpha mask → printed ink. Blur+noisy threshold for spread edges; mottle, streak (wood/brush grain),
// voids (paper showing through) and grain modulate coverage.
function inkify(L, src, o = {}) {
  const { W, H } = L, F = L.F;
  const A = o.blur ? L.blurA(src, o.blur) : o.feather ? L.blurA(src, o.feather) : L.alphaOf(src);
  const out = L.canvas(), oc = out.getContext('2d'), img = oc.createImageData(W, H), d = img.data;
  const [cr, cg, cb] = rgb(o.color || '#000');
  const rough = o.rough ?? 0, soft = o.soft ?? .1, bias = o.bias ?? 0, mottle = o.mottle ?? 0, streak = o.streak ?? 0, vstreak = o.vstreak ?? 0,
    voids = o.voids ?? 0, voidT = o.voidT ?? .6, grain = o.grain ?? 0, alpha = o.alpha ?? 1;
  const ox = (o.ox ?? (L.seed * 131 + (o.salt || 0) * 37)) % W | 0, oy = (o.oy ?? (L.seed * 71 + (o.salt || 0) * 53)) % H | 0;
  const lo = .5 - soft, inv = 1 / (2 * soft);
  for (let y = 0; y < H; y++) {
    let yy = y + oy; if (yy >= H) yy = 2 * H - 1 - yy; const ny = yy * W, row = y * W;   // mirrored offset: continuous, no seam
    for (let x = 0; x < W; x++) {
      const i = row + x; let a = A[i * 4 + 3] / 255; if (a === 0) continue;
      let xi = x + ox; if (xi >= W) xi = 2 * W - 1 - xi; const j = ny + xi;
      if (o.blur) { a = (a + bias + (F.mid[j] - .5) * rough - lo) * inv; if (a <= 0) continue; a = a >= 1 ? 1 : a * a * (3 - 2 * a); }
      if (mottle) a *= 1 - mottle * F.low[j];
      if (streak) a *= 1 - streak * F.streak[j];
      if (vstreak) a *= 1 - vstreak * F.vstreak[j];
      if (o.brushy) a *= 1 - o.brushy * F.brush[j];
      if (o.wood) a *= 1 - o.wood * F.wood[j];
      if (voids) { const v = F.fine[j] - voidT; if (v > 0) a *= 1 - voids * Math.min(1, v * 7); }
      if (grain) a *= 1 - grain * F.grain[j];
      const k = i * 4; d[k] = cr; d[k + 1] = cg; d[k + 2] = cb; d[k + 3] = a * alpha * 255;
    }
  }
  oc.putImageData(img, 0, 0);
  return out;
}

// Paper: grayscale multiply layer — mottling, grain, fibres, flecks.
export function paperTex(L, o = {}) {
  const { W, H, S, F } = L; const c = L.canvas(), x = c.getContext('2d'); const img = x.createImageData(W, H), d = img.data;
  const mot = o.mottle ?? .05, gr = o.grain ?? .05, sk = o.streak ?? 0, ox = (L.seed * 97) % W, oy = (L.seed * 61) % H;
  for (let y = 0; y < H; y++) {
    let yy = y + oy; if (yy >= H) yy = 2 * H - 1 - yy;
    for (let xx0 = 0; xx0 < W; xx0++) {
      let xx = xx0 + ox; if (xx >= W) xx = 2 * W - 1 - xx; const i = y * W + xx0, j = yy * W + xx;
      const v = 255 * (1 - mot * F.low[j] - gr * F.grain[i] - sk * F.streak[j]); const k = i * 4; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  x.setTransform(S, 0, 0, S, 0, 0); x.lineCap = 'round';
  const r = mulberry32(L.seed * 13 + 5);
  const fib = (n, len, wid, alpha, col) => { for (let k = 0; k < n; k++) { const px = r() * DW, py = r() * DH, l = len * (.4 + r() * 1.3), a = r() * TAU, b = (r() - .5) * 1.4; x.strokeStyle = `rgba(${col},${alpha * (.25 + r() * .75)})`; x.lineWidth = wid * (.5 + r()); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + b) * l * .5, py + Math.sin(a + b) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } };
  fib(o.fibres ?? 500, o.fLen ?? 5, o.fWid ?? .35, o.fAlpha ?? .1, o.fCol || '110,95,75');
  if (o.long) fib(o.long, o.longLen ?? 40, .3, o.longAlpha ?? .08, o.fCol || '110,95,75');
  if (o.flecks) for (let k = 0; k < o.flecks; k++) { x.fillStyle = `rgba(${o.fleckCol || '70,50,30'},${.2 + r() * .4})`; x.beginPath(); x.ellipse(r() * DW, r() * DH, .3 + r() * .9, .2 + r() * .5, r() * PI, 0, TAU); x.fill(); }
  return c;
}

// Worn edges and corners: paper colour showing through at the perimeter (drawn into the over layer).
export function wear(L, color, amt = 1) {
  const { W, H, S, F } = L; const x = L.over.getContext('2d', { willReadFrequently: true });
  const band = Math.ceil(4 * S), img = x.getImageData(0, 0, W, H), d = img.data, [cr, cg, cb] = rgb(color);
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    const dx = Math.min(xx, W - 1 - xx), dy = Math.min(y, H - 1 - y), e = Math.min(dx, dy);
    if (e > band) { if (xx < W - band - 1) xx = W - band - 2; continue; }
    const i = y * W + xx; const corner = Math.max(0, 1 - Math.hypot(Math.min(dx, 40 * S), Math.min(dy, 40 * S)) / (40 * S));
    const v = F.mid[i] * .55 + F.fine[i] * .45 + Math.pow(1 - e / band, 3) * .3 * amt + corner * corner * .45 * amt;
    if (v > .9) { const a = Math.min(1, (v - .9) * 9); const k = i * 4; const ia = d[k + 3] / 255; d[k] = cr * a + d[k] * (1 - a); d[k + 1] = cg * a + d[k + 1] * (1 - a); d[k + 2] = cb * a + d[k + 2] * (1 - a); d[k + 3] = 255 * (a + ia * (1 - a)); }
  }
  x.putImageData(img, 0, 0);
}

// Paperback spine crease, a few units in from the left edge.
export function crease(L, x0 = 7, light = .22, dark = .1) {
  const o = L.octx; o.save();
  o.fillStyle = `rgba(255,252,240,${light})`; o.fillRect(x0, 0, .9, DH);
  o.fillStyle = `rgba(0,0,0,${dark})`; o.fillRect(x0 + .9, 0, .7, DH);
  o.fillStyle = `rgba(0,0,0,${dark * .5})`; o.fillRect(x0 - .7, 0, .7, DH);
  o.restore();
}

// Letterpress: ink with a squeezed rim and a debossed impression (shadow top-left inside, light bottom-right).
export function letterpress(L, mask, o) {
  const { W, H, S } = L;
  const inked = L.ink(mask, o);
  if (o.deboss) {
    const A = L.alphaOf(mask); const k = Math.max(1, Math.round(1.1 * S));
    const sh = L.canvas(), hl = L.canvas(); const sx = sh.getContext('2d'), hx = hl.getContext('2d');
    const si = sx.createImageData(W, H), hi = hx.createImageData(W, H), sd = si.data, hd = hi.data;
    for (let y = k; y < H - k; y++) for (let x = k; x < W - k; x++) {
      const i = y * W + x, a = A[i * 4 + 3] / 255; if (!a) continue;
      const up = A[((y - k) * W + x - k) * 4 + 3] / 255, dn = A[((y + k) * W + x + k) * 4 + 3] / 255;
      const s = a * (1 - up), h = a * (1 - dn);
      if (s) { sd[i * 4 + 3] = s * 255 * o.deboss; }
      if (h) { hd[i * 4] = hd[i * 4 + 1] = hd[i * 4 + 2] = 255; hd[i * 4 + 3] = h * 255 * o.deboss * .7; }
    }
    sx.putImageData(si, 0, 0); hx.putImageData(hi, 0, 0);
    return { inked, shadow: sh, light: hl };
  }
  return { inked };
}

// AM halftone of a tone mask (alpha = tone), rotated screen; returns a mask.
export function halftone(L, tone, o) {
  const { W, H, S } = L; const A = o.blurTone ? L.blurA(tone, o.blurTone) : L.alphaOf(tone);
  const out = L.canvas(), x = out.getContext('2d'), img = x.createImageData(W, H), d = img.data;
  const cell = o.cell * S, ca = Math.cos(o.angle), sa = Math.sin(o.angle), gain = o.gain ?? 1, min = o.min ?? 0;
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    const i = y * W + xx; let t = A[i * 4 + 3] / 255 * gain; if (t <= min) continue; t = Math.min(1, t);
    const u = (xx * ca + y * sa) / cell, v = (-xx * sa + y * ca) / cell;
    const fu = u - Math.floor(u) - .5, fv = v - Math.floor(v) - .5; const dist = Math.hypot(fu, fv);
    const r = Math.sqrt(t / PI) * (o.shape ?? 1.05);
    const a = clamp((r - dist) * cell + .5);
    if (a > 0) d[i * 4 + 3] = a * 255;
  }
  x.putImageData(img, 0, 0); return out;
}

/* ───────────────────────── building and compositing ───────────────────────── */
// Build a cover at W×H pixels. The returned printing holds the finished layers plus anything
// the living detail needs; the noise fields and scratch sheets are dropped afterwards.
export function buildCover(spec, W, H) {
  const F = getFields(W, H, W / DW);
  const L = makeKit(W, H, spec.seed || 1, F);
  spec.build(L);
  L.F = null; L.scratch = null; L.clipTmp = null;
  return { L, spec };
}

// Draw a printing at time t: the paper and ink below, the living detail, then the layers above.
// With full = false only the living detail's box is repainted.
export function composite(ctx, printing, t, full) {
  const { L, spec } = printing; const S = L.S;
  let bx = 0, by = 0, bw = L.W, bh = L.H;
  if (!full && spec.live && spec.live.box) { const b = spec.live.box; bx = Math.max(0, Math.floor(b[0] * S) - 1); by = Math.max(0, Math.floor(b[1] * S) - 1); bw = Math.min(L.W - bx, Math.ceil(b[2] * S) + 3); bh = Math.min(L.H - by, Math.ceil(b[3] * S) + 3); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(L.base, bx, by, bw, bh, bx, by, bw, bh);
  if (spec.live) { ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); spec.live.draw(ctx, t, L); ctx.restore(); }
  ctx.globalCompositeOperation = spec.overMode || 'source-over'; ctx.drawImage(L.over, bx, by, bw, bh, bx, by, bw, bh);
  if (L.tex) { ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L.tex, bx, by, bw, bh, bx, by, bw, bh); }
  ctx.restore();
}

// The animation key: covers redraw only when their detail has visibly changed.
export function frameKey(spec, t) {
  const lv = spec.live; if (!lv) return 0;
  return lv.key ? lv.key(t) : Math.floor(t * (lv.fps || 30));
}
