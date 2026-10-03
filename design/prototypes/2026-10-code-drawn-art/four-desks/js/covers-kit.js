'use strict';
/* The code-drawn covers, copied from ../covers/index.html (renderers unchanged) and scoped so
   they can share a page with the desk. mountShelf(list, keys) draws a compact shelf. */
(function () {
'use strict';
/* ───────────────────────── setup ───────────────────────── */
const QS = new URLSearchParams(location.search);
const FIXED_T = QS.has('t') ? (parseFloat(QS.get('t')) || 0) : null;
const ONLY = QS.get('cover');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2, PI = Math.PI;
const DW = 400, DH = 600;             // every cover is designed in 400×600 units
const SITE = 'https://www.sankala.me';

// Real work, from src/data/work.js + site-content.js (titles, dates, routes)
const WORKS = [
  { key: 'capricious', title: 'How to Please a Capricious God', meta: 'Film · Sep 2026', href: 'https://www.paperrobots.studio/films/capricious-god/' },
  { key: 'anothersky', title: 'Another Sky', meta: 'Experiment · Sep 2026', href: 'https://dysonswarm.com/another-sky/' },
  { key: 'overfitting', title: 'Winning by Overfitting', meta: 'Essay · Jul 2026', href: SITE + '/notes/eai-challenge' },
  { key: 'clauiet', title: 'A Clauiet Life', meta: 'Experiment · Jan 2026', href: SITE + '/toys/bee-sim/index.html' },
  { key: 'gpt7', title: 'GPT-7 Will Have Arms', meta: 'Essay and film · Dec 2025', href: SITE + '/essays/gpt7-will-have-arms' },
  { key: 'startr', title: 'StartR Accelerator: A Post-Mortem', meta: 'Note · Dec 2025', href: SITE + '/notes/startr-postmortem' },
  { key: 'dyson', title: 'Dyson Swarm', meta: 'Experiment · 2024', href: 'https://dysonswarm.com/swarm/' },
  { key: 'zinify', title: 'ZINify: research to zines', meta: 'Research · 2023', href: SITE + '/research#zinify' },
  { key: 'power', title: 'Power quality event classification with LSTMs', meta: 'Research · 2019', href: SITE + '/research#power-quality' },
];

/* ───────────────────────── numbers ───────────────────────── */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(ix, iy, s) { let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s, 982451653); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x, y, s, oct) { let v = 0, a = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += a * vnoise(x * f, y * f, s + i * 17); n += a; a *= .5; f *= 2.03; } return v / n; }
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
function rgb(hex) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgba(hex, a) { const [r, g, b] = rgb(hex); return `rgba(${r},${g},${b},${a})`; }

/* ───────────────────────── geometry ───────────────────────── */
function arcPts(cx, cy, rx, ry, a0, a1, n) { n = n || Math.max(10, Math.ceil(Math.abs(a1 - a0) / (PI / 18))); const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; }
function bez(p0, p1, p2, p3, n = 40) { const p = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; p.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return p; }
const cat = (...parts) => [].concat(...parts);
function polyLen(p) { let l = 0; for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return l; }
function resample(p, step) {
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
function pathPts(ctx, pts, close) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
function wobble(pts, amp, freq, seed) { // displace a polyline along its normals with smooth noise
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

function glyphStrokes(text, o) {
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
function brush(ctx, strokes, o) {
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
function penPaths(strokes, o) {
  const paths = strokes.map((st, si) => st.length < 2 ? [st[0], [st[0][0] + .3, st[0][1] + .2]] : wobble(resample(st, o.step ?? .8), o.wob ?? .3, o.wobF ?? .2, (o.seed ?? 1) + si * 7.3));
  const lens = paths.map(polyLen); return { paths, lens, total: lens.reduce((a, b) => a + b, 0) };
}
function strokePen(ctx, pp, progress) {
  let budget = progress * pp.total; ctx.beginPath();
  for (let i = 0; i < pp.paths.length && budget > 0; i++) {
    const p = pp.paths[i]; ctx.moveTo(p[0][0], p[0][1]);
    for (let k = 1; k < p.length; k++) { const l = Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); if (budget < l) { const t = budget / l; ctx.lineTo(lerp(p[k - 1][0], p[k][0], t), lerp(p[k - 1][1], p[k][1], t)); budget = 0; break; } ctx.lineTo(p[k][0], p[k][1]); budget -= l; }
  }
  ctx.stroke();
}

// Broad nib (deco hairline/heavy contrast): swept parallelograms, orientation-normalised so they union.
function nibPen(ctx, strokes, o) {
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
function spaced(ctx, str, x, y, ls = 0, align = 'left') {
  const chars = [...str]; const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + ls * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  if (!ls) { ctx.fillText(str, cx, y); return ctx.measureText(str).width; }
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + ls; });
  return total;
}

/* ───────────────────────── print kit ───────────────────────── */
let FIELDS = null;
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

function makeKit(W, H, seed) {
  const S = W / DW;
  const L = { W, H, S, seed, F: FIELDS, rng: mulberry32(seed * 7919 + 1) };
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
  L.blurA = (c, b) => { const t = L.scratch, x = t.getContext('2d', { willReadFrequently: true }); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.filter = `blur(${(b * S).toFixed(2)}px)`; x.drawImage(c, 0, 0); x.filter = 'none'; return x.getImageData(0, 0, W, H).data; };
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
function paperTex(L, o = {}) {
  const { W, H, S, F } = L; const c = L.canvas(), x = c.getContext('2d'); const img = x.createImageData(W, H), d = img.data;
  const mot = o.mottle ?? .05, gr = o.grain ?? .05, sk = o.streak ?? 0, ox = (L.seed * 97) % W, oy = (L.seed * 61) % H;
  for (let y = 0; y < H; y++) { let yy = y + oy; if (yy >= H) yy = 2 * H - 1 - yy;
    for (let x = 0; x < W; x++) { let xx = x + ox; if (xx >= W) xx = 2 * W - 1 - xx; const i = y * W + x, j = yy * W + xx;
      const v = 255 * (1 - mot * F.low[j] - gr * F.grain[i] - sk * F.streak[j]); const k = i * 4; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255; } }
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
function wear(L, color, amt = 1) {
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
function crease(L, x0 = 7, light = .22, dark = .1) {
  const o = L.octx; o.save();
  o.fillStyle = `rgba(255,252,240,${light})`; o.fillRect(x0, 0, .9, DH);
  o.fillStyle = `rgba(0,0,0,${dark})`; o.fillRect(x0 + .9, 0, .7, DH);
  o.fillStyle = `rgba(0,0,0,${dark * .5})`; o.fillRect(x0 - .7, 0, .7, DH);
  o.restore();
}

// Letterpress: ink with a squeezed rim and a debossed impression (shadow top-left inside, light bottom-right).
function letterpress(L, mask, o) {
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
function halftone(L, tone, o) {
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

const COVERS = {};
/* ═══════════════════════ the nine covers ═══════════════════════ */
/* ═════════ 1 · How to Please a Capricious God — Polish poster school: gouache on a dark ground ═════════ */
COVERS.capricious = (() => {
  const GROUND = '#2b1713', BONE = '#e9dcc2', VERM = '#d4462a', NIGHT = '#170b09', OLIVE = '#7f8c3b';
  const UL = bez([-14, 246], [60, 130], [300, 70], [414, 236], 60);
  const LL = bez([414, 236], [320, 330], [90, 352], [-14, 246], 60);
  // the eye runs off both edges; its clip path is held just inside the sheet (paths reaching past the canvas trip a Chromium clipping bug)
  const ALMOND = cat(UL, LL.slice(1)).map(([x, y]) => [clamp(x, .5, 399.5), y]);
  const almond = x => pathPts(x, ALMOND, true);
  const IC = [200, 226], IR = 104;
  const seg = (a, b, amp, s) => wobble(resample([a, b], 5), amp, .03, s);
  return {
    seed: 11, still: 6.5,
    build(L) {
      const b = L.bctx, r = L.rng;
      b.fillStyle = GROUND; b.fillRect(0, 0, DW, DH);
      for (const [col, n, a, salt] of [['#3d2119', 26, .55, 1], ['#1e0f0c', 18, .5, 2], ['#4a291f', 10, .35, 3]]) {
        L.paint(L.base, x => {
          for (let k = 0; k < n; k++) {
            const y = r() * 640 - 20, len = 140 + r() * 320, x0 = r() * 520 - 140, ang = (r() - .5) * .14;
            x.lineWidth = 18 + r() * 46; x.beginPath(); pathPts(x, seg([x0, y], [x0 + len * Math.cos(ang), y + len * Math.sin(ang)], 3, k + salt * 40)); x.stroke();
          }
        }, { color: col, blur: 2.2, rough: .9, brushy: .8, mottle: .4, salt }, { alpha: a });
      }
      // sclera, painted, with shading toward the corners and a few veins
      L.paint(L.base, x => { almond(x); x.fill(); }, { color: BONE, blur: 1.6, rough: 1, mottle: .1, brushy: .07, salt: 4 });
      L.paint(L.base, x => { x.beginPath(); x.ellipse(14, 246, 92, 66, 0, 0, TAU); x.ellipse(388, 238, 96, 66, 0, 0, TAU); x.fill(); }, { color: '#c39783', feather: 14 }, { alpha: .65, clip: almond });
      L.paint(L.base, x => { x.lineWidth = 9; x.beginPath(); pathPts(x, LL.map(([px, py]) => [px, py - 4])); x.stroke(); }, { color: '#c9a48d', feather: 6 }, { alpha: .45, clip: almond });
      L.paint(L.base, x => {
        const veins = [];
        for (let k = 0; k < 14; k++) {
          const left = k % 2 === 0, sx = left ? 4 + r() * 20 : 396 - r() * 20, sy = 236 + (r() - .5) * 40, len = 40 + r() * 50, ang = (left ? 0 : PI) + (r() - .5) * .9;
          const main = wobble(resample([[sx, sy], [sx + Math.cos(ang) * len, sy + Math.sin(ang) * len]], 2), 2.2, .12, k); veins.push(main);
          const m = main[(main.length * .55) | 0], a2 = ang + (r() - .5) * 1.4; veins.push(wobble(resample([m, [m[0] + Math.cos(a2) * len * .4, m[1] + Math.sin(a2) * len * .4]], 2), 1.2, .15, k + 50));
        }
        brush(x, veins, { w: 1, taper: [3, 14], wob: .2, seed: 9 });
      }, { color: '#a8443a', blur: .4, rough: .5, salt: 5 }, { alpha: .55, clip: almond });

      // the iris lives on its own sheet so the gaze can wander
      const iris = L.canvas(); L.iris = iris;
      const ic = (fn, o, p) => L.put(iris, L.ink(L.mask(fn), o), p);
      ic(x => { x.beginPath(); x.arc(IC[0], IC[1], IR, 0, TAU); x.fill(); }, { color: VERM, blur: 1.2, rough: .8, mottle: .22, salt: 6 });
      for (const [col, n, a, w0, salt] of [['#f08b4a', 170, .55, 1.4, 7], ['#8c2414', 160, .5, 1.25, 8], ['#ffb46c', 60, .45, .8, 9]]) {
        ic(x => {
          for (let k = 0; k < n; k++) {
            const ang = r() * TAU, r0 = 43 + r() * 12, r1 = 68 + r() * 32, a1 = ang + (r() - .5) * .1;
            x.lineWidth = w0 * (.5 + r()); x.beginPath();
            pathPts(x, wobble(resample([[IC[0] + Math.cos(ang) * r0, IC[1] + Math.sin(ang) * r0], [IC[0] + Math.cos(a1) * r1, IC[1] + Math.sin(a1) * r1]], 1.5), .9, .2, k + salt * 300)); x.stroke();
          }
        }, { color: col, blur: .5, rough: .6, salt }, { alpha: a });
      }
      ic(x => { for (let k = 0; k < 28; k++) { const ang = r() * TAU, rr = 58 + r() * 28; x.beginPath(); x.ellipse(IC[0] + Math.cos(ang) * rr, IC[1] + Math.sin(ang) * rr, 2 + r() * 4.5, 1 + r() * 2, ang, 0, TAU); x.fill(); } }, { color: '#6b1a10', blur: .8, rough: .8, salt: 10 }, { alpha: .6 });
      ic(x => { x.lineWidth = 13; x.beginPath(); x.arc(IC[0], IC[1], IR - 5, 0, TAU); x.stroke(); }, { color: '#5a150e', blur: 3, rough: .85, salt: 11 }, { alpha: .85 });
      ic(x => { x.lineWidth = 2.6; x.beginPath(); for (let k = 0; k <= 160; k++) { const a = k / 160 * TAU, rr = 55 + 3.5 * Math.sin(a * 14) + 2 * Math.sin(a * 5 + 1); const px = IC[0] + Math.cos(a) * rr, py = IC[1] + Math.sin(a) * rr; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }, { color: '#f6a65e', blur: .6, rough: .7, salt: 12 }, { alpha: .75 });
      ic(x => { x.beginPath(); x.arc(IC[0], IC[1], 40, 0, TAU); x.fill(); }, { color: '#1a0b08', blur: 1.2, rough: .9, salt: 13 });
      // catchlight: a four-pane window reflected in the cornea, plus a small bounce light
      ic(x => { x.save(); x.translate(IC[0] - 27, IC[1] - 28); x.rotate(-.2); for (const [px, py] of [[-13, -12.5], [1.4, -12.5], [-13, 1.6], [1.4, 1.6]]) { x.beginPath(); x.roundRect(px, py, 11.6, 11, 3.2); x.fill(); } x.restore(); x.beginPath(); x.ellipse(IC[0] + 22, IC[1] + 21, 4.5, 3, -.5, 0, TAU); x.fill(); }, { color: '#f4ead6', blur: .7, rough: .6, salt: 14 });

      // lids and the little visitor live above the iris
      L.paint(L.over, x => { x.lineWidth = 30; x.beginPath(); pathPts(x, UL.map(([px, py]) => [px, py + 7])); x.stroke(); }, { color: NIGHT, feather: 9 }, { alpha: .55, clip: almond });
      L.paint(L.over, x => brush(x, [bez([18, 214], [90, 96], [290, 44], [394, 198], 50)], { w: 4.2, taper: [7, 7], wob: 1.2, seed: 4 }), { color: '#55302a', blur: .8, rough: .7, brushy: .4, salt: 15 });
      L.paint(L.over, x => brush(x, [UL], { w: 13, taper: [9, 7], wob: 1.4, vary: .25, seed: 5 }), { color: NIGHT, blur: 1, rough: .8, brushy: .3, salt: 16 });
      L.paint(L.over, x => brush(x, [UL.slice(8, 53).map(([px, py]) => [px, py + 6.5])], { w: 3, taper: [8, 8], wob: .6, seed: 6 }), { color: '#b64a39', blur: .6, rough: .6, salt: 17 }, { alpha: .9 });
      L.paint(L.over, x => brush(x, [LL], { w: 5, taper: [10, 10], wob: 1, seed: 7 }), { color: NIGHT, blur: .8, rough: .8, brushy: .3, salt: 18 });
      L.paint(L.over, x => brush(x, [LL.slice(6, 55).map(([px, py]) => [px, py - 5])], { w: 2.6, taper: [8, 8], wob: .6, seed: 8 }), { color: '#c88a72', blur: .6, rough: .6, salt: 19 }, { alpha: .8 });

      const ai = LL.reduce((bi, p, i) => Math.abs(p[0] - 258) < Math.abs(LL[bi][0] - 258) ? i : bi, 0);
      const ax = LL[ai][0], ay = LL[ai][1] - 6;
      L.paint(L.over, x => { x.beginPath(); x.ellipse(ax + 2, ay + 1, 12, 2.6, 0, 0, TAU); x.fill(); }, { color: NIGHT, feather: 1.6 }, { alpha: .4 });
      L.paint(L.over, x => { x.lineWidth = 3.4; x.beginPath(); x.moveTo(ax - 3.5, ay - 8); x.lineTo(ax - 4.5, ay); x.moveTo(ax + 4, ay - 8); x.lineTo(ax + 5, ay); x.stroke(); }, { color: '#3b4719', blur: .4, rough: .4, salt: 20 });
      const body = x => { x.beginPath(); x.moveTo(ax - 8.5, ay - 7); x.bezierCurveTo(ax - 11, ay - 25, ax - 7.5, ay - 37, ax + 1, ay - 37); x.bezierCurveTo(ax + 9.5, ay - 37, ax + 12, ay - 25, ax + 9.5, ay - 7); x.bezierCurveTo(ax + 6, ay - 3.5, ax - 5, ay - 3.5, ax - 8.5, ay - 7); };
      L.paint(L.over, x => { body(x); x.fill(); }, { color: OLIVE, blur: .6, rough: .6, mottle: .2, salt: 21 });
      L.paint(L.over, x => { x.beginPath(); x.ellipse(ax + 9, ay - 18, 7, 20, .1, 0, TAU); x.fill(); }, { color: '#55622a', feather: 2.5 }, { alpha: .8, clip: body });
      L.paint(L.over, x => { brush(x, [[[ax + 6, ay - 25], [ax + 12, ay - 36], [ax + 15, ay - 49]]], { w: 3.1, taper: [1, 2], seed: 10 }); x.beginPath(); x.arc(ax + 15.3, ay - 50.5, 2.3, 0, TAU); x.fill(); brush(x, [[[ax - 7, ay - 24], [ax - 11, ay - 17], [ax - 12, ay - 11]]], { w: 2.8, taper: [1, 2], seed: 11 }); }, { color: OLIVE, blur: .4, rough: .4, salt: 22 });
      L.paint(L.over, x => { x.beginPath(); x.arc(ax + .5, ay - 26, 5.2, 0, TAU); x.fill(); }, { color: '#f2ead8', blur: .4, rough: .3, salt: 23 });
      L.paint(L.over, x => { x.beginPath(); x.arc(ax + 2, ay - 28.2, 2.3, 0, TAU); x.fill(); }, { color: '#15100c' });

      [['HOW TO PLEASE', 24, 438, BONE], ['A CAPRICIOUS', 36, 490, BONE], ['GOD', 76, 578, VERM]].forEach(([txt, size, y, col], li) => {
        const g = glyphStrokes(txt, { x: 28, y, size, track: .2, jrot: .05, jy: .035, js: .04, seed: 20 + li });
        L.paint(L.over, x => brush(x, g.strokes, { w: size * .15, taper: [1.6, 2.2], wob: size * .012, wobF: .08, vary: .2, nib: -.6, nibMin: .62, seed: 30 + li }), { color: col, blur: .9, rough: .9, brushy: .3, mottle: .12, salt: 40 + li });
      });
      L.paint(L.over, x => { x.font = '600 8.5px Archivo'; spaced(x, 'PAPER ROBOTS', 372, 552, 1.6, 'right'); spaced(x, 'A FILM · 2026', 372, 566, 1.6, 'right'); }, { color: BONE, blur: .35, rough: .3, bias: .12, salt: 44 }, { alpha: .85 });
      wear(L, '#cfc1a2', .5);
      L.tex = paperTex(L, { mottle: .06, grain: .06, fibres: 380, fAlpha: .08 });
    },
    live: {
      box: [0, 70, 400, 290], fps: 20,
      draw(ctx, t, L) {
        const ph = (t % 18) / 18 * TAU;
        const dx = 15 * Math.sin(ph) + 5 * Math.sin(2 * ph + 1.3);
        const dy = 5 * Math.sin(ph + .9) + 3 * Math.cos(3 * ph) + 9 * Math.pow(Math.max(0, Math.sin(ph - 2.2)), 6);
        ctx.save(); ctx.beginPath(); almond(ctx); ctx.clip(); ctx.drawImage(L.iris, dx, dy, DW, DH); ctx.restore();
      },
    },
  };
})();

/* ═════════ 3 · Winning by Overfitting — Swiss International Style, offset ═════════ */
COVERS.overfitting = (() => {
  const YEL = '#f2c12e', INK = '#1b1a17', PAPER = '#f4f1e8';
  const X0 = 24, X1 = 376, Y0 = 150, Y1 = 392, R = 11;
  const r0 = mulberry32(5), sc = []; let best = .1;
  for (let k = 0; k <= R; k++) { best = Math.max(best, Math.min(.975, 1 - .9 * Math.exp(-.36 * k) + (r0() - .5) * .06)); sc.push(best); }
  sc[R] = .985;
  const px = k => X0 + (X1 - X0) * k / R, py = s => Y1 - (Y1 - Y0) * s;
  const path = [[px(0), Y1], [px(0), py(sc[0])]];
  for (let k = 0; k < R; k++) { path.push([px(k + 1), py(sc[k])]); path.push([px(k + 1), py(sc[k + 1])]); }
  const total = polyLen(path);
  function partial(p) { // polyline up to fraction p of its length
    let budget = p * total; const out = [path[0]];
    for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (budget >= l) { out.push(b); budget -= l; } else { const t = budget / l; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } }
    return out;
  }
  return {
    seed: 23, still: 10,
    build(L) {
      const b = L.bctx;
      b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
      L.paint(L.base, x => x.fillRect(-5, -5, 410, 610), { color: YEL, mottle: .05, grain: .03, salt: 1 }, { mode: 'multiply' });
      L.paint(L.base, x => {
        x.lineWidth = .9; x.beginPath(); x.moveTo(X0, Y0 - 24); x.lineTo(X0, Y1); x.lineTo(X1 + 4, Y1); x.stroke();
        for (let k = 0; k <= R; k++) { x.beginPath(); x.moveTo(px(k), Y1); x.lineTo(px(k), Y1 + 5); x.stroke(); }
        x.beginPath(); for (let q = X0 + 2; q <= X1; q += 4.4) { x.moveTo(q + .75, Y0); x.arc(q, Y0, .75, 0, TAU); } x.fill();
        x.font = '400 8.5px Archivo'; spaced(x, 'evaluator', X1, Y0 - 6, .3, 'right'); spaced(x, 'score', X0 + 6, Y0 - 16, .3); spaced(x, 'rounds', X1, Y1 + 17, .3, 'right');
      }, { color: INK, blur: .3, rough: .25, bias: .14, salt: 2 }, { mode: 'multiply' });
      L.paint(L.base, x => {
        x.font = '600 10.5px Archivo'; spaced(x, 'NeurIPS 2025', X0, 40);
        x.font = '400 10.5px Archivo'; spaced(x, 'Embodied Agent', X0, 54); spaced(x, 'Interface Challenge', X0, 68); spaced(x, 'First place', X0, 82);
        spaced(x, 'An LLM in a loop', 212, 40); spaced(x, 'with a benchmark’s', 212, 54); spaced(x, 'own evaluator', 212, 68);
      }, { color: INK, blur: .3, rough: .25, bias: .1, salt: 3 }, { mode: 'multiply' });
      L.paint(L.base, x => { x.font = '800 61px Archivo'; spaced(x, 'Winning', 20, 466, -1.5); spaced(x, 'by over-', 20, 520, -1.5); spaced(x, 'fitting', 20, 574, -1.5); }, { color: INK, blur: .5, rough: .4, mottle: .06, salt: 4 }, { mode: 'multiply' });
      L.tex = paperTex(L, { mottle: .035, grain: .035, fibres: 150, fAlpha: .05 });
      crease(L, 7, .25, .08);
    },
    live: {
      box: [X0 - 6, Y0 - 4, X1 - X0 + 12, Y1 - Y0 + 10],
      key: t => { const tt = t % 15; return tt < 9.1 || (tt > 12.9 && tt < 14.6) ? Math.floor(t * 30) : tt < 13 ? 'hold' : 'blank'; },
      draw(ctx, t) {
        const tt = t % 15, p = clamp(tt / 9), fade = tt < 13 ? 1 : 1 - smooth(13, 14.5, tt);
        if (p <= 0 || fade <= 0) return;
        const sub = partial(p), head = sub[sub.length - 1];
        ctx.save(); ctx.globalAlpha = fade;
        ctx.fillStyle = PAPER; ctx.beginPath(); pathPts(ctx, sub); ctx.lineTo(head[0], Y1); ctx.lineTo(X0, Y1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.lineJoin = 'miter'; ctx.beginPath(); pathPts(ctx, sub); ctx.stroke();
        ctx.fillStyle = INK; for (let i = 3; i < sub.length; i += 2) { const q = sub[i]; if (i < sub.length - 1) ctx.fillRect(q[0] - 3, q[1] - 3, 6, 6); }
        ctx.beginPath(); ctx.arc(head[0], head[1], 4.4, 0, TAU); ctx.fill();
        ctx.restore();
      },
    },
  };
})();

/* ═════════ 6 · StartR Accelerator: A Post-Mortem — letterpress broadside, annotated in blue pencil ═════════ */
COVERS.startr = (() => {
  const KRAFT = '#dacbaa', BLACK = '#1f1c19', RED = '#bd3527', PENCIL = '#3d78b8';
  return {
    seed: 29, still: 9,
    build(L) {
      const b = L.bctx;
      b.fillStyle = KRAFT; b.fillRect(0, 0, DW, DH);
      const press = (fn, o, mis = {}) => { const lp = letterpress(L, L.mask(fn), o); L.put(L.base, lp.inked, { mode: 'multiply', ...mis }); if (lp.shadow) { L.put(L.base, lp.shadow, { mode: 'multiply', ...mis }); L.put(L.base, lp.light, { mode: 'screen', ...mis }); } };
      const BLK = { color: BLACK, blur: .7, rough: .7, mottle: .2, voids: .3, voidT: .7, grain: .08, deboss: .3 };
      const SMALL = { color: BLACK, blur: .45, rough: .45, mottle: .12, voids: .12, voidT: .74, grain: .05, deboss: .1 };
      press(x => { x.fillRect(28, 26, 344, 3.2); x.fillRect(28, 31.5, 344, .9); x.fillRect(28, 568, 344, .9); x.fillRect(28, 571, 344, 3.2); }, { ...BLK, salt: 1 });
      press(x => { x.font = '700 15px "Old Standard TT"'; spaced(x, 'STARTR ACCELERATOR', 200, 60, 3.2, 'center'); x.font = '400 9.5px "Old Standard TT"'; spaced(x, 'UC SAN DIEGO  ·  FALL 2023', 200, 78, 2.2, 'center'); x.fillRect(150, 90, 100, .8); }, { ...SMALL, salt: 2 }, { rot: .002 });
      press(x => { x.font = '128px "Abril Fatface"'; spaced(x, 'GLYP', 200, 238, 2, 'center'); }, { color: RED, blur: .9, rough: 1, mottle: .3, wood: .75, streak: .12, voids: .45, voidT: .7, grain: .1, deboss: .35, salt: 3 }, { dx: .8, dy: -.5, rot: -.004 });
      press(x => { x.font = '44px Anton'; spaced(x, 'A WRITING ASSISTANT', 200, 300, 1.2, 'center'); spaced(x, 'FOR NOVELISTS', 200, 350, 2.4, 'center'); }, { ...BLK, streak: .3, salt: 4 }, { rot: .003 });
      press(x => { x.fillRect(70, 372, 112, .9); x.fillRect(218, 372, 112, .9); x.save(); x.translate(200, 372.5); x.rotate(PI / 4); x.fillRect(-4, -4, 8, 8); x.restore(); x.beginPath(); x.arc(188, 372.5, 1.6, 0, TAU); x.arc(212, 372.5, 1.6, 0, TAU); x.fill(); }, { ...BLK, salt: 5 });
      press(x => { x.font = '400 14px "Old Standard TT"'; spaced(x, 'An AI platform for long-form writing,', 200, 402, .2, 'center'); spaced(x, 'pitched in the fall of 2023.', 200, 420, .2, 'center'); }, { ...SMALL, salt: 6 });
      press(x => { x.font = '700 9px "Old Standard TT"'; spaced(x, 'OCT 2023', 30, 559, 1.8); spaced(x, 'SAN DIEGO', 370, 559, 1.8, 'right'); }, { ...SMALL, salt: 7 });

      const g1 = glyphStrokes('POST-MORTEM', { x: 200, y: 506, size: 30, align: 'center', track: .1, xs: .86, slant: .2, jrot: .09, jy: .07, js: .08, seed: 7 });
      const g2 = glyphStrokes('DEC 2025', { x: 322, y: 541, size: 13, align: 'right', track: .14, xs: .9, slant: .2, jrot: .08, jy: .07, js: .06, seed: 8 });
      const under = wobble(bez([96, 517], [170, 525], [250, 521], [314, 512], 30), .8, .1, 3);
      L.pen = { pp: penPaths([...g1.strokes, under, ...g2.strokes], { step: .7, wob: .45, wobF: .22, seed: 2 }), rot: -.07, cx: 200, cy: 510 };
      L.pencilTmp = L.canvas();
      const tooth = L.canvas(), tx = tooth.getContext('2d'), ti = tx.createImageData(L.W, L.H);
      for (let i = 0; i < L.W * L.H; i++) { const v = L.F.fine[i] * .6 + L.F.grain[i] * .4; ti.data[i * 4 + 3] = v > .5 ? Math.min(255, (v - .5) * 700) : 0; }
      tx.putImageData(ti, 0, 0); L.tooth = tooth;
      L.tex = paperTex(L, { mottle: .05, grain: .06, fibres: 900, fLen: 4, fAlpha: .15, flecks: 160 });
    },
    live: {
      box: [40, 440, 330, 120],
      key: t => { const tt = t % 16; return tt < 8.1 || (tt > 12.4 && tt < 14.6) ? Math.floor(t * 30) : tt < 12.5 ? 'hold' : 'blank'; },
      draw(ctx, t, L) {
        const tt = t % 16, prog = clamp(tt / 8), fade = tt < 12.5 ? 1 : 1 - smooth(12.5, 14.5, tt);
        if (prog <= 0 || fade <= 0) return;
        const pc = L.pencilTmp, px = pc.getContext('2d'), S = L.S, bx = Math.floor(40 * S), by = Math.floor(440 * S), bw = Math.ceil(330 * S), bh = Math.ceil(120 * S);
        px.setTransform(1, 0, 0, 1, 0, 0); px.clearRect(bx, by, bw, bh);
        px.setTransform(L.S, 0, 0, L.S, 0, 0); px.translate(L.pen.cx, L.pen.cy); px.rotate(L.pen.rot); px.translate(-L.pen.cx, -L.pen.cy);
        px.strokeStyle = PENCIL; px.lineWidth = 1.75; px.lineCap = px.lineJoin = 'round'; strokePen(px, L.pen.pp, prog);
        px.setTransform(1, 0, 0, 1, 0, 0); px.globalCompositeOperation = 'destination-out'; px.drawImage(L.tooth, bx, by, bw, bh, bx, by, bw, bh); px.globalCompositeOperation = 'source-over';
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .8 * fade; ctx.drawImage(pc, bx, by, bw, bh, bx, by, bw, bh); ctx.restore();
      },
    },
  };
})();

/* ═════════ 2 · Another Sky — art-deco railway lithograph, looking down the axis of the cylinder ═════════ */
COVERS.anothersky = (() => {
  const CREAM = '#efe3c6', NAVY = '#1b2743', DEEP = '#15213b', TEAL = '#2b6b68', DTEAL = '#22504e', SEA = '#5f9f92', SAND = '#e2bd74', CORAL = '#de6848', GOLD = '#d8a13c', SKY = '#a9cfc5', OLIVE = '#86955a';
  const VP = [200, 300], FOC = 150, YV = .46, ZN = .3, ZF = 5.4, IMG = [12, 12, 376, 440];
  // the viewer floats a little above the valley floor, so the far side of the world arches overhead
  const P = (th, z, h = 1) => [VP[0] + FOC * h * Math.cos(th) / z, VP[1] + FOC * (h * Math.sin(th) - YV) / z];
  const CAP = [VP[0], VP[1] - FOC * YV / ZF];
  function band(x, th0, th1, z0, z1, h = 1) {
    const n = Math.max(2, Math.ceil(Math.abs(th1 - th0) / .035));
    let p = P(th0, z0, h); x.moveTo(p[0], p[1]);
    for (let i = 1; i <= n; i++) { p = P(th0 + (th1 - th0) * i / n, z0, h); x.lineTo(p[0], p[1]); }
    for (let i = n; i >= 0; i--) { p = P(th0 + (th1 - th0) * i / n, z1, h); x.lineTo(p[0], p[1]); }
    x.closePath();
  }
  const imgClip = x => x.rect(...IMG);
  const LAND = [0, 2, 4].map(k => [PI / 3 + k * PI / 3, PI / 3 + (k + 1) * PI / 3]);
  const WIN = [1, 3, 5].map(k => [PI / 3 + k * PI / 3, PI / 3 + (k + 1) * PI / 3]);
  return {
    seed: 17, still: 14,
    build(L) {
      const b = L.bctx, r = L.rng;
      b.fillStyle = CREAM; b.fillRect(0, 0, DW, DH);
      const litho = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .5, rough: .5, mottle: .1, grain: .03, salt: (litho.n = (litho.n || 0) + 1), ...o }, { clip: imgClip, ...p });
      // windows: the sky of this world is glass, bright with mirrored sunlight, banded toward the far cap
      const winClip = x => { for (const [a0, a1] of WIN) band(x, a0, a1, .12, ZF); };
      const landClip = x => { for (const [a0, a1] of LAND) band(x, a0, a1, .12, ZF); };
      litho(x => { winClip(x); x.fill(); }, SKY, { mottle: .12 });
      [[2.6, '#c9e1d6'], [1.75, '#dcebdc'], [1.25, '#ecf1df']].forEach(([f, col]) => litho(x => { x.beginPath(); x.arc(CAP[0], CAP[1], FOC / ZF * f * 2.2, 0, TAU); x.fill(); }, col, { mottle: .06 }, { clip: winClip }));
      litho(x => {
        for (let z = .2; z < ZF; z *= 1.24) for (const [a0, a1] of WIN) { x.lineWidth = Math.min(6, 1.6 / z); x.beginPath(); const pts = []; for (let i = 0; i <= 40; i++) pts.push(P(lerp(a0, a1, i / 40), z)); pathPts(x, pts); x.stroke(); }
        for (const [a0, a1] of WIN) for (const f of [1 / 3, 2 / 3]) { const th = lerp(a0, a1, f); x.beginPath(); const p0 = P(th, .12), p1 = P(th, ZF); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.lineWidth = .9; x.stroke(); }
      }, TEAL, { blur: .3, mottle: .05 }, { alpha: .8 });
      // land: patchwork fields, a winding river, a few towns, hedges between
      litho(x => { for (const [a0, a1] of LAND) band(x, a0, a1, .12, ZF); x.fill(); }, DTEAL);
      const cells = { [TEAL]: [], [SEA]: [], [OLIVE]: [], [SAND]: [], [SKY]: [], [CREAM]: [] };
      const roofs = [], trees = [], roads = [];
      LAND.forEach(([a0, a1], si) => {
        // uneven lanes and rows, so the patchwork reads as farmland rather than tiles
        const cuts = [0]; while (cuts[cuts.length - 1] < 1) cuts.push(Math.min(1, cuts[cuts.length - 1] + .08 + r() * .14));
        const lanes = cuts.length - 1; let river = (1 + si) % lanes;
        for (let z = .12; z < ZF;) {
          const z1 = z * (1.1 + r() * .14); if (r() < .3) river = clamp(river + (r() < .5 ? -1 : 1), 1, lanes - 2);
          for (let ln = 0; ln < lanes; ln++) {
            const t0 = lerp(a0, a1, cuts[ln]) + .005, t1 = lerp(a0, a1, cuts[ln + 1]) - .005;
            let col = r() < .3 ? TEAL : r() < .45 ? SEA : r() < .5 ? OLIVE : SAND;
            if (ln === river) col = SKY;
            else if (r() < .05) { col = CREAM; for (let q = 0; q < 6; q++) roofs.push([lerp(t0, t1, .12 + r() * .76), z * (1.02 + r() * .08)]); }
            else if (col === TEAL && r() < .5) for (let q = 0; q < 5; q++) trees.push([lerp(t0, t1, .15 + r() * .7), lerp(z, z1, .15 + r() * .7)]);
            cells[col].push([t0, t1, z * 1.01, z1 * .99]);
          }
          z = z1;
        }
        roads.push(lerp(a0, a1, cuts[(lanes * .5) | 0]));
      });
      for (const col of [TEAL, SEA, OLIVE, SAND, SKY, CREAM]) litho(x => { for (const c of cells[col]) band(x, ...c); x.fill(); }, col, { mottle: .14 });
      litho(x => { for (const [th, z] of roofs) { const p = P(th, z), s = 2.4 / z; x.fillRect(p[0] - s * .6, p[1] - s * .6, s * 1.2, s * 1.2); } }, CORAL, { blur: .2, rough: .2 });
      litho(x => { for (const [th, z] of trees) { const p = P(th, z), s = 1.5 / z; x.beginPath(); x.arc(p[0], p[1], Math.min(6, s), 0, TAU); x.fill(); } }, DTEAL, { blur: .2, rough: .3 });
      litho(x => { for (const th of roads) { const pts = []; for (let z = .12; z < ZF; z *= 1.05) pts.push(P(th, z)); x.lineWidth = .9; x.beginPath(); pathPts(x, pts); x.stroke(); } }, CREAM, { blur: .2, rough: .3 }, { alpha: .85 });
      // rims where land meets glass
      litho(x => { for (let k = 0; k < 6; k++) { const th = PI / 3 + k * PI / 3; band(x, th - .018, th + .018, .12, ZF); } x.fill(); }, SAND, { mottle: .1 });
      // atmosphere: litho stipple thickening toward the far end
      litho(x => {
        const rmin = FOC / ZF;
        for (let k = 0; k < 42000; k++) { const px = IMG[0] + r() * IMG[2], py = IMG[1] + r() * IMG[3]; const rho = Math.hypot(px - CAP[0], py - CAP[1]); const p = Math.pow(1 - smooth(rmin, 190, rho), 1.8) * .92; if (r() < p) { x.beginPath(); x.arc(px, py, .45 + r() * .3, 0, TAU); x.fill(); } }
      }, SKY, { blur: 0, mottle: 0, grain: 0 }, { clip: landClip });
      // the far end cap: a deco target of light
      litho(x => { x.beginPath(); x.arc(CAP[0], CAP[1], FOC / ZF + 1, 0, TAU); x.fill(); }, GOLD, { mottle: 0 });
      [[.8, CREAM], [.55, CORAL], [.34, CREAM], [.16, GOLD]].forEach(([f, col]) => litho(x => { x.beginPath(); x.arc(CAP[0], CAP[1], FOC / ZF * f, 0, TAU); x.fill(); }, col, { mottle: 0 }));

      // frame, band and lettering
      L.paint(L.over, x => { x.lineWidth = 1.3; x.strokeRect(IMG[0], IMG[1], IMG[2], IMG[3]); x.fillRect(12, 458, 376, 130); }, { color: NAVY, blur: .4, rough: .5, mottle: .12, salt: 30 });
      const g = glyphStrokes('ANOTHER SKY', { x: 200, y: 545, size: 36, align: 'center', xs: 1.12, track: .17, seed: 3 });
      L.paint(L.over, x => nibPen(x, g.strokes, { W: 36 * .21, angle: 0, min: 1.55, step: .5 }), { color: CREAM, blur: .4, rough: .45, salt: 31 });
      L.paint(L.over, x => { x.font = '700 8.4px "Josefin Sans"'; spaced(x, 'WALK INSIDE AN O’NEILL CYLINDER', 200, 489, 2.6, 'center'); }, { color: GOLD, blur: .3, rough: .25, bias: .12, salt: 32 });
      L.paint(L.over, x => { x.font = '600 7.2px "Josefin Sans"'; spaced(x, 'DYSONSWARM.COM', 200, 572, 3.2, 'center'); }, { color: SAND, blur: .3, rough: .25, bias: .14, salt: 33 });
      L.paint(L.over, x => { x.fillRect(150, 556, 100, .8); }, { color: GOLD, blur: .2, rough: .2, salt: 34 });
      L.tex = paperTex(L, { mottle: .05, grain: .05, fibres: 300, fAlpha: .07 });
    },
    live: {
      box: IMG, fps: 15,
      draw(ctx, t) {
        ctx.save(); ctx.beginPath(); ctx.rect(...IMG); ctx.clip();
        const N = 11, Pd = 48;
        for (let k = 0; k < N; k++) {
          const f = (t / Pd + k / N) % 1, z = .36 * Math.pow(ZF * .8 / .36, f);
          const s = LAND[k % 3], th = lerp(s[0], s[1], .2 + .6 * ((k * .618) % 1)), h = .78 + .08 * ((k * .37) % 1);
          const a = smooth(0, .05, f) * (1 - smooth(.62, .96, f)); if (a <= 0) continue;
          const [cx, cy] = P(th, z, h), sz = FOC / z * .07;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(th - PI / 2); ctx.globalAlpha = a;
          const puffs = [[-1.5, .12, .48], [-.95, -.2, .66], [-.25, -.52, .86], [.55, -.36, .74], [1.2, -.02, .56], [1.62, .2, .36], [.1, .08, .7], [-.6, .22, .5], [.85, .22, .46]];
          const shape = (dy = 0) => { ctx.beginPath(); for (const [px, py, pr] of puffs) { ctx.moveTo((px + pr) * sz, (py + dy) * sz); ctx.arc(px * sz, (py + dy) * sz, pr * sz, 0, TAU); } };
          ctx.fillStyle = SKY; shape(.16); ctx.fill();
          ctx.fillStyle = CREAM; shape(); ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      },
    },
  };
})();

/* ═════════ 4 · A Clauiet Life — shin-hanga woodblock botanical on washi ═════════ */
COVERS.clauiet = (() => {
  const SUMI = '#29251f', INDIGO = '#2d3d6c', PERS = '#dd7337', PINK = '#e6a09d', ROSE = '#c25f74', LEAF = '#6d8a49', OCHRE = '#d4a24a', PALE = '#efd98f', SEAL = '#bf3a2b', WASHI = '#eee4cb';
  const FL = [[118, 268, 46, .2, .9, PINK], [232, 338, 38, -.5, .68, 'white'], [78, 420, 34, .9, .56, PERS], [246, 214, 31, .15, .82, PERS], [158, 482, 33, -1.1, .62, PINK], [306, 430, 28, .6, .52, 'white'], [378, 552, 62, .35, .78, PERS]];
  const STEMS = FL.map(([fx, fy], i) => { const bx = [74, 206, 40, 262, 146, 322, 360][i]; return bez([bx, 612], [bx + (fx - bx) * .2 + (i % 2 ? 22 : -18), 560], [fx + (i % 2 ? -14 : 16), fy + 120], [fx, fy + 4], 40); });
  function petal(x, R) { x.moveTo(R * .2, R * .07); x.quadraticCurveTo(R * .55, R * .26, R * .96, R * .2); x.lineTo(R * 1.0, R * .12); x.lineTo(R * .93, R * .07); x.lineTo(R * 1.01, 0); x.lineTo(R * .93, -R * .07); x.lineTo(R * 1.0, -R * .12); x.lineTo(R * .96, -R * .2); x.quadraticCurveTo(R * .55, -R * .26, R * .2, -R * .07); x.closePath(); }
  function head(x, f, fn) { const [cx, cy, R, rot, tilt] = f; x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(1, tilt); fn(x, R); x.restore(); }
  const petals = (x, f, scale = 1) => head(x, f, (x, R) => { for (let k = 0; k < 8; k++) { x.save(); x.rotate(k * TAU / 8 + Math.sin(k * 2.3 + f[0]) * .06); x.scale(scale, scale); petal(x, R); x.restore(); } });
  function leaf(origin, ang, len, seed) { // cosmos leaf: a rib with thread-like leaflets
    const r = mulberry32(seed), out = []; const rib = []; let a = ang, p = origin.slice();
    for (let i = 0; i <= 24; i++) { rib.push(p.slice()); a += (r() - .5) * .08 + .012; p = [p[0] + Math.cos(a) * len / 24, p[1] + Math.sin(a) * len / 24]; }
    out.push(rib);
    for (let i = 4; i < 24; i += 2) for (const side of [-1, 1]) {
      const q = rib[i], la = Math.atan2(rib[i + 1][1] - q[1], rib[i + 1][0] - q[0]) + side * (.7 + r() * .3), ll = len * .32 * (1 - i / 30) * (.7 + r() * .5);
      out.push(bez(q, [q[0] + Math.cos(la) * ll * .4, q[1] + Math.sin(la) * ll * .4], [q[0] + Math.cos(la + side * .25) * ll * .8, q[1] + Math.sin(la + side * .25) * ll * .8], [q[0] + Math.cos(la + side * .45) * ll, q[1] + Math.sin(la + side * .45) * ll], 10));
    }
    return out;
  }
  return {
    seed: 41, still: 7,
    build(L) {
      const b = L.bctx, r = L.rng;
      b.fillStyle = WASHI; b.fillRect(0, 0, DW, DH);
      const block = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .5, rough: .9, mottle: .22, wood: .12, salt: (block.n = (block.n || 0) + 1), ...o }, { mode: 'multiply', ...p });
      const KENTO = { dx: .9, dy: -.7 };   // colour blocks sit slightly off the key block
      // bokashi: indigo wiped down from the top, persimmon glow rising from the ground
      block(x => { const g = x.createLinearGradient(0, 0, 0, 250); g.addColorStop(0, '#000'); g.addColorStop(.35, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, DW, 260); x.globalCompositeOperation = 'destination-out'; x.fillRect(298, 26, 74, 156); x.fillRect(321, 188, 28, 28); }, INDIGO, { blur: 0, wood: .04, streak: .05, brushy: .1, mottle: .32 });
      block(x => { const g = x.createLinearGradient(0, 600, 0, 470); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 460, DW, 140); }, PERS, { blur: 0, wood: .1, mottle: .28 });
      // stems and leaves
      const leaves = []; STEMS.forEach((st, i) => { for (const f of [.3, .52, .72]) { const p = st[(st.length * f) | 0]; const side = ((i + f * 10) | 0) % 2 ? 1 : -1; leaves.push(...leaf(p, -PI / 2 + side * (1.0 + r() * .5), 50 + r() * 30, i * 10 + f * 100)); } });
      block(x => { brush(x, STEMS, { w: 3.3, taper: [2, 6], wob: .5, seed: 3 }); brush(x, leaves, { w: 1.8, taper: [1, 5], wob: .3, seed: 4 }); }, LEAF, { blur: .35, rough: .6 }, KENTO);
      // petals in colour, with bokashi toward each flower's heart
      for (const col of [PINK, PERS]) block(x => { for (const f of FL) if (f[5] === col) { x.beginPath(); petals(x, f); x.fill(); } }, col, { wood: .18 }, KENTO);
      block(x => { for (const f of FL) if (f[5] === PINK) { x.beginPath(); petals(x, f, .55); x.fill(); } }, ROSE, { blur: 0, feather: 4.5 }, { mode: 'multiply', alpha: .7, ...KENTO });
      block(x => { for (const f of FL) if (f[5] === PERS) { x.beginPath(); petals(x, f, .5); x.fill(); } }, '#b4482a', { blur: 0, feather: 4.5 }, { mode: 'multiply', alpha: .55, ...KENTO });
      block(x => { for (const f of FL) if (f[5] === 'white') { x.beginPath(); petals(x, f, .5); x.fill(); } }, '#b9b0a0', { blur: 0, feather: 5 }, { mode: 'multiply', alpha: .4 });
      block(x => { for (const f of FL) head(x, f, (x, R) => { x.beginPath(); x.arc(0, 0, R * .24, 0, TAU); x.fill(); }); }, OCHRE, {}, KENTO);
      // key block: the carved sumi line
      block(x => {
        x.lineWidth = 1.25;
        for (const f of FL) { x.beginPath(); petals(x, f); x.stroke(); head(x, f, (x, R) => { x.lineWidth = 1; x.beginPath(); x.arc(0, 0, R * .24, 0, TAU); x.stroke(); for (let k = 0; k < 18; k++) { const a = k * 2.4, rr = Math.sqrt(k / 18) * R * .2; x.beginPath(); x.arc(Math.cos(a) * rr, Math.sin(a) * rr, .9, 0, TAU); x.fill(); } }); }
        brush(x, STEMS.map(s => s.map(([px, py]) => [px + 1.4, py])), { w: .7, taper: [3, 10], seed: 5 });
      }, SUMI, { blur: .4, rough: 1, wood: .05, mottle: .1 });
      // a bud on a thin stem
      block(x => { x.beginPath(); x.ellipse(332, 300, 6, 9, .3, 0, TAU); x.ellipse(52, 316, 5, 8, -.4, 0, TAU); x.fill(); }, PERS, {}, KENTO);
      block(x => { brush(x, [bez([346, 612], [352, 520], [320, 400], [334, 310], 30), bez([30, 612], [24, 520], [62, 400], [50, 326], 30)], { w: 1.8, taper: [2, 4], seed: 6 }); }, LEAF, { blur: .35, rough: .6 }, KENTO);
      block(x => { x.lineWidth = .9; x.beginPath(); x.ellipse(332, 300, 6, 9, .3, 0, TAU); x.stroke(); x.beginPath(); x.ellipse(52, 316, 5, 8, -.4, 0, TAU); x.stroke(); }, SUMI, { blur: .3, rough: .8 });
      // cartouche and date seal
      block(x => x.fillRect(300, 28, 70, 152), PALE, { wood: .06, mottle: .15 });
      block(x => { x.lineWidth = 2.4; x.strokeRect(300, 28, 70, 152); x.lineWidth = .8; x.strokeRect(304.5, 32.5, 61, 143); }, INDIGO, { blur: .35, rough: .7 });
      block(x => { x.save(); x.translate(335, 44); x.rotate(PI / 2); x.font = '800 18.5px "Shippori Mincho"'; x.textBaseline = 'middle'; x.fillText('A Clauiet Life', 0, 0); x.restore(); }, SUMI, { blur: .35, rough: .5 });
      block(x => { x.fillRect(323, 190, 24, 24); }, SEAL, { blur: .5, rough: 1.1, voids: .4 });
      L.paint(L.base, x => { x.font = '800 8.5px "Shippori Mincho"'; spaced(x, '20', 335, 200.5, .3, 'center'); spaced(x, '26', 335, 210.5, .3, 'center'); }, { color: WASHI, blur: .3, rough: .5, salt: 70 });

      // the bee, cut as its own little block (two wing poses, facing either way)
      L.bees = [];
      for (const face of [1, -1]) for (const pose of [0, 1]) {
        const c = L.canvas();
        const bp = (fn, col, o = {}) => L.put(c, L.ink(L.mask(x => { x.translate(200, 300); x.scale(face * 1.75, 1.75); fn(x); }), { color: col, blur: .35, rough: .6, salt: 80 + pose, ...o }));
        const wing = x => { x.save(); x.translate(-1, -5); x.rotate(pose ? -.95 : -.45); x.beginPath(); x.ellipse(-6, 0, 8, 3.6, 0, 0, TAU); x.restore(); x.save(); x.translate(2, -5); x.rotate(pose ? -1.25 : -.7); x.beginPath(); x.ellipse(-5, 0, 6.5, 3, 0, 0, TAU); x.restore(); };
        bp(x => { wing(x); x.fill(); }, '#f6f1e2', { alpha: .9 });
        bp(x => { x.beginPath(); x.ellipse(0, 0, 8.5, 5.6, .08, 0, TAU); x.fill(); }, OCHRE);
        bp(x => { x.save(); x.beginPath(); x.ellipse(0, 0, 8.5, 5.6, .08, 0, TAU); x.clip(); for (const sx of [-4.2, -.6, 3]) x.fillRect(sx, -7, 1.9, 14); x.restore(); x.beginPath(); x.arc(9.6, -.6, 3.6, 0, TAU); x.fill(); x.lineWidth = .8; x.beginPath(); x.moveTo(11, -3.4); x.quadraticCurveTo(13, -7, 15.5, -7.6); x.moveTo(10, -3.6); x.quadraticCurveTo(11, -7.5, 13, -8.6); x.stroke(); x.beginPath(); x.moveTo(-8.6, .4); x.lineTo(-11.6, 1.2); x.lineTo(-8.4, 1.8); x.fill(); for (const lx of [-2, 1.5, 4.5]) { x.beginPath(); x.moveTo(lx, 5); x.lineTo(lx - 1.2, 8.6); x.stroke(); } }, SUMI);
        bp(x => { x.lineWidth = .7; wing(x); x.stroke(); }, SUMI, { alpha: .8 });
        L.bees.push(c);
      }
      L.tex = paperTex(L, { mottle: .05, grain: .05, fibres: 350, fAlpha: .08, long: 140, longLen: 55, longAlpha: .09 });
    },
    live: {
      box: [118, 226, 262, 170], fps: 30,
      draw(ctx, t, L) {
        const Pd = 22, a = TAU * (t % Pd) / Pd;
        const x = 248 + 74 * Math.sin(a), y = 306 + 34 * Math.sin(2 * a + .6) + 3 * Math.sin(9 * a);
        const vx = Math.cos(a), face = vx >= 0 ? 0 : 2, pose = Math.floor(t * 9) % 2;
        const tilt = .25 * Math.cos(2 * a + .6) * Math.sign(vx);
        ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.drawImage(L.bees[face + pose], -200, -300, DW, DH); ctx.restore();
      },
    },
  };
})();

/* ═════════ 5 · GPT-7 Will Have Arms — mid-century paperback, linocut in two colours ═════════ */
COVERS.gpt7 = (() => {
  const CREAM = '#efe5cc', COBALT = '#2747a6', VERM = '#de4a2e';
  const ARMS = [[166, 424, -2.5, .55, 0, -1], [162, 440, -2.98, -.45, 1.7, -1], [165, 457, 2.62, -.62, 3.1, -1], [234, 424, -.64, -.55, .9, 1], [238, 440, -.16, .45, 2.4, 1], [235, 457, .52, .62, 4.2, 1]];
  const HC = [200, 350];
  function arm(ctx, a, t, i) {
    const [sx, sy, base, bend, ph, side] = a, w = TAU * t / 16;
    const a1 = base + .1 * Math.sin(w + ph) + .05 * Math.sin(2 * w + ph * 1.7);
    const a2 = a1 + bend + .28 * Math.sin(w + ph + 1.1) * Math.sign(bend);
    const ex = sx + Math.cos(a1) * 50, ey = sy + Math.sin(a1) * 50, wx = ex + Math.cos(a2) * 42, wy = ey + Math.sin(a2) * 42;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = CREAM; ctx.lineWidth = 15.5; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(wx, wy); ctx.stroke();
    // carved shading along the shadow side of the tube
    const off = (ax, ay, bx, by, d) => { const l = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / l * d, ny = (bx - ax) / l * d; return [ax + nx, ay + ny, bx + nx, by + ny]; };
    ctx.strokeStyle = COBALT; ctx.lineWidth = 1.25;
    for (const [p, q, d] of [[[sx, sy], [ex, ey], 3.6], [[ex, ey], [wx, wy], 3.6]]) { const s = off(p[0], p[1], q[0], q[1], d * side * -1); ctx.beginPath(); ctx.moveTo(lerp(s[0], s[2], .18), lerp(s[1], s[3], .18)); ctx.lineTo(lerp(s[0], s[2], .86), lerp(s[1], s[3], .86)); ctx.stroke(); }
    for (let k = -1; k <= 1; k++) { const ang = a1 + PI / 2, cx = ex + Math.cos(a1) * k * 3.2, cy = ey + Math.sin(a1) * k * 3.2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * 4, cy + Math.sin(ang) * 4); ctx.lineTo(cx - Math.cos(ang) * 4, cy - Math.sin(ang) * 4); ctx.stroke(); }
    // cuff
    ctx.strokeStyle = VERM; ctx.lineWidth = 5; ctx.lineCap = 'butt'; const cx = wx - Math.cos(a2) * 5, cy = wy - Math.sin(a2) * 5, pa = a2 + PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(pa) * 7.6, cy + Math.sin(pa) * 7.6); ctx.lineTo(cx - Math.cos(pa) * 7.6, cy - Math.sin(pa) * 7.6); ctx.stroke();
    // open hand
    ctx.save(); ctx.translate(wx, wy); ctx.rotate(a2); ctx.scale(1.3, 1.3 * side);
    const spread = .12 * Math.sin(w * 2 + ph);
    ctx.fillStyle = CREAM; ctx.beginPath(); ctx.ellipse(7, 0, 8.5, 7.8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = CREAM; ctx.lineCap = 'round'; ctx.lineWidth = 4.2;
    [-.42, -.14, .14, .42].forEach((f, k) => { const an = f * (1 + spread * 3), l = [9, 11, 10.5, 8.5][k]; ctx.beginPath(); ctx.moveTo(11, f * 9); ctx.lineTo(11 + Math.cos(an) * l, f * 9 + Math.sin(an) * l); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(5, -6); ctx.lineTo(9, -13.5); ctx.stroke();
    ctx.strokeStyle = COBALT; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(4, 2); ctx.quadraticCurveTo(8, 4.5, 12, 2.5); ctx.stroke();
    ctx.restore();
  }
  return {
    seed: 53, still: 4,
    build(L) {
      const b = L.bctx, r = L.rng;
      b.fillStyle = CREAM; b.fillRect(0, 0, DW, DH);
      // the cobalt block, with type and a halo of gouge marks cut away
      const block = L.mask(x => {
        x.fillRect(-4, -4, 408, 608);
        x.globalCompositeOperation = 'destination-out';
        x.font = '700 92px Jost'; spaced(x, 'GPT-7', 26, 112, -1);
        x.font = '700 33px Jost'; spaced(x, 'WILL HAVE ARMS', 28, 152, 1.4);
        for (let rr = 128; rr < 262; rr += 9 + r() * 2.5) {
          let a = r() * TAU;
          while (a < TAU * 1.02 + 1) {
            const len = (14 + r() * 34) / rr, a1 = a + len; const pts = []; for (let k = 0; k <= 8; k++) { const aa = lerp(a, a1, k / 8); pts.push([HC[0] + Math.cos(aa) * rr, HC[1] + 10 + Math.sin(aa) * rr * .96]); }
            if (pts.every(p => p[1] > 226 && p[1] < 548 && p[0] > 12 && p[0] < 388)) brush(x, [pts], { w: 1.9 + r() * 1.4, taper: [3, 3], wob: .35, seed: rr + a });
            a = a1 + (7 + r() * 20) / rr;
          }
        }
      });
      L.put(L.base, L.ink(block, { color: COBALT, blur: .8, rough: 1.2, mottle: .2, voids: .3, voidT: .66, grain: .05, salt: 1 }), { mode: 'multiply' });

      // the robot: torso, neck and the folded paper head sit above the arms
      L.paint(L.over, x => { x.font = '500 11.5px Jost'; spaced(x, 'The coming convergence of', 29, 183, .3); spaced(x, 'foundation models and robotics', 29, 198, .3); x.font = '500 10px Jost'; spaced(x, 'SAN KALA', 29, 224, 3.4); }, { color: CREAM, blur: .35, rough: .3, bias: .1, salt: 90 });
      const RS = x => { x.translate(200, 404); x.scale(1.22, 1.22); x.translate(-200, -404); };
      const o = (fn, col, ink = {}, p = {}) => L.paint(L.over, x => { RS(x); fn(x); }, { color: col, blur: .6, rough: .9, mottle: .12, salt: (o.n = (o.n || 0) + 10), ...ink }, p);
      L.RS = RS;
      const hatch = (x, x0, y0, x1, y1, step, ang) => { x.save(); x.beginPath(); x.rect(x0, y0, x1 - x0, y1 - y0); x.clip(); x.lineWidth = 1.1; for (let k = -400; k < 400; k += step) { x.beginPath(); x.moveTo(x0 + k, y0); x.lineTo(x0 + k + Math.cos(ang) * 600, y0 + Math.sin(ang) * 600); x.stroke(); } x.restore(); };
      const torso = x => { x.beginPath(); x.moveTo(168, 410); x.lineTo(232, 410); x.lineTo(243, 488); x.quadraticCurveTo(200, 496, 157, 488); x.closePath(); };
      o(x => { torso(x); x.fill(); x.fillRect(189, 388, 22, 26); }, CREAM);
      o(x => { x.save(); torso(x); x.clip(); hatch(x, 214, 404, 250, 500, 4.2, PI / 2.6); x.restore(); hatch(x, 202, 388, 212, 412, 3.4, PI / 2.6); }, COBALT, { blur: .3, rough: .6 });
      o(x => { x.beginPath(); x.arc(200, 447, 10, 0, TAU); x.fill(); }, VERM);
      o(x => { x.lineWidth = 1.2; x.beginPath(); x.arc(200, 447, 5.5, 0, TAU); x.stroke(); }, CREAM, { blur: .3, rough: .5 });
      // head: front face (paper), top face (hatched), side face (cobalt, outlined by a carved line), folded corner
      const front = x => { x.beginPath(); x.moveTo(152, 304); x.lineTo(214, 304); x.lineTo(240, 330); x.lineTo(240, 392); x.lineTo(152, 392); x.closePath(); };
      o(x => { front(x); x.fill(); x.beginPath(); x.moveTo(152, 304); x.lineTo(214, 304); x.lineTo(226, 291); x.lineTo(168, 291); x.closePath(); x.fill(); }, CREAM);
      o(x => { x.save(); x.beginPath(); x.moveTo(152, 304); x.lineTo(214, 304); x.lineTo(226, 291); x.lineTo(168, 291); x.closePath(); x.clip(); hatch(x, 150, 288, 230, 306, 3.6, PI / 2); x.restore(); }, COBALT, { blur: .3, rough: .6 });
      o(x => { x.lineWidth = 1.3; x.beginPath(); x.moveTo(240, 330); x.lineTo(256, 316); x.lineTo(256, 378); x.lineTo(240, 392); x.moveTo(226, 291); x.lineTo(232, 285); x.lineTo(256, 316); x.stroke(); }, CREAM, { blur: .3, rough: .6 });
      o(x => { x.beginPath(); x.moveTo(214, 304); x.lineTo(240, 330); x.lineTo(219, 326); x.closePath(); x.fill(); }, CREAM);
      o(x => { x.lineWidth = 1.1; x.beginPath(); x.moveTo(214, 304); x.lineTo(240, 330); x.lineTo(219, 326); x.closePath(); x.stroke(); x.save(); x.beginPath(); x.moveTo(214, 304); x.lineTo(240, 330); x.lineTo(219, 326); x.closePath(); x.clip(); hatch(x, 210, 300, 242, 332, 3, PI / 4); x.restore(); }, COBALT, { blur: .3, rough: .6 });
      for (const ex of [178, 216]) { o(x => { x.lineWidth = 2.6; x.beginPath(); x.arc(ex, 346, 14.5, 0, TAU); x.stroke(); x.beginPath(); x.arc(ex - 3, 342, 6.6, 0, TAU); x.fill(); }, COBALT, { blur: .35, rough: .6 }); o(x => { x.beginPath(); x.arc(ex - 5, 340, 1.8, 0, TAU); x.fill(); }, CREAM, { blur: .2, rough: .3 }); }
      o(x => { x.beginPath(); x.ellipse(259, 348, 9, 14, 0, 0, TAU); x.fill(); }, VERM);
      o(x => { x.lineWidth = 1.1; x.beginPath(); x.ellipse(259, 348, 4.5, 8, 0, 0, TAU); x.stroke(); }, CREAM, { blur: .3, rough: .5 });
      o(x => { x.lineWidth = 1; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(160 + k * 3, 384 - k * 2); x.lineTo(176 + k * 6, 384 - k * 2); x.stroke(); } }, COBALT, { blur: .3, rough: .6 });
      wear(L, CREAM, .6);
      crease(L, 7, .2, .1);
      L.tex = paperTex(L, { mottle: .05, grain: .05, fibres: 300, fAlpha: .07 });
    },
    live: { box: [0, 214, 400, 340], fps: 20, draw(ctx, t, L) { ctx.save(); L.RS(ctx); ARMS.forEach((a, i) => arm(ctx, a, t, i)); ctx.restore(); } },
  };
})();

/* ═════════ 7 · Dyson Swarm — space-age screenprint ═════════ */
COVERS.dyson = (() => {
  const PAPER = '#ebe1c8', NAVY = '#151b32', ORANGE = '#ff6b2f', YELLOW = '#f6c444', CREAM = '#f2e7cb';
  const SUN = [256, 236], SR = 120, TILT = -.2;
  const RINGS = [[160, 40, 28, 3], [200, 52, 36, 2], [244, 64, 46, 1], [292, 78, 54, 1]];
  const MER = [96, 404], MR = 40;
  const ringPt = (rx, ry, a) => { const x = rx * Math.cos(a), y = ry * Math.sin(a); return [SUN[0] + x * Math.cos(TILT) - y * Math.sin(TILT), SUN[1] + x * Math.sin(TILT) + y * Math.cos(TILT)]; };
  const STREAM = bez([MER[0] + 26, MER[1] - 30], [160, 320], [128, 296], ringPt(160, 40, 2.9), 60);
  return {
    seed: 61, still: 5,
    build(L) {
      const b = L.bctx, r = L.rng;
      b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
      const screen = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .6, rough: .8, mottle: .08, voids: .2, voidT: .72, grain: .03, salt: (screen.n = (screen.n || 0) + 1), ...o }, p);
      screen(x => x.fillRect(-5, -5, 410, 610), NAVY, { voids: .3, voidT: .83, mottle: .1 }, { mode: 'multiply' });
      // ring backs (behind the sun)
      const dotted = (x, rx, ry, front) => { let on = false; for (let a = 0; a <= TAU + .01; a += 1.2 / rx) { const p = ringPt(rx, ry, a); if ((Math.sin(a) > 0) === front) { on ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); on = true; } else on = false; } };
      screen(x => { x.lineWidth = .8; x.beginPath(); for (const [rx, ry] of RINGS) dotted(x, rx, ry, false); x.stroke(); }, CREAM, { blur: 0, voids: 0 }, { alpha: .45 });
      // corona: a coarse halftone glow
      const glow = L.mask(x => { const g = x.createRadialGradient(SUN[0], SUN[1], SR * .9, SUN[0], SUN[1], SR + 90); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, DW, DH); });
      L.put(L.base, L.ink(halftone(L, glow, { cell: 3.4, angle: .26, gain: .75 }), { color: ORANGE, blur: .4, rough: .5, salt: 9 }));
      screen(x => { x.beginPath(); x.arc(SUN[0], SUN[1], SR, 0, TAU); x.fill(); }, ORANGE, {}, {});
      screen(x => { x.beginPath(); x.arc(SUN[0] - 6, SUN[1] - 5, SR * .74, 0, TAU); x.fill(); }, YELLOW, {}, { dx: 1.2, dy: -.8 });
      screen(x => { for (const [a, rr, s] of [[-.6, .4, 4], [-.4, .48, 2.6], [2.4, .3, 3.2]]) { x.beginPath(); x.arc(SUN[0] - 6 + Math.cos(a) * SR * rr, SUN[1] - 5 + Math.sin(a) * SR * rr, s, 0, TAU); x.fill(); } }, ORANGE, { blur: .3 }, { dx: 1.2, dy: -.8 });
      screen(x => { x.lineWidth = .9; x.beginPath(); for (const [rx, ry] of RINGS) dotted(x, rx, ry, true); x.stroke(); }, CREAM, { blur: 0, voids: 0 }, { alpha: .75 });
      // Mercury, half eaten, shaded with a navy dot screen
      const bite = x => { x.beginPath(); const pts = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU; const rr = 27 + 7 * vnoise(Math.cos(a) * 2 + 3, Math.sin(a) * 2, 4); pts.push([MER[0] + 31 + Math.cos(a) * rr, MER[1] - 28 + Math.sin(a) * rr]); } pathPts(x, pts, true); };
      screen(x => { x.beginPath(); x.arc(MER[0], MER[1], MR, 0, TAU); x.fill(); x.globalCompositeOperation = 'destination-out'; bite(x); x.fill(); }, CREAM, {}, {});
      const shade = L.mask(x => { x.save(); x.beginPath(); x.arc(MER[0], MER[1], MR, 0, TAU); x.clip(); const g = x.createLinearGradient(MER[0] + 26, MER[1] - 26, MER[0] - 34, MER[1] + 32); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.95)'); x.fillStyle = g; x.fillRect(0, 0, DW, DH); x.restore(); x.globalCompositeOperation = 'destination-out'; bite(x); x.fill(); });
      L.put(L.base, L.ink(halftone(L, shade, { cell: 2.3, angle: .8 }), { color: NAVY, blur: .3, rough: .4, salt: 12 }));
      screen(x => { for (let k = 0; k < 14; k++) { const f = r(), p = STREAM[(f * 22) | 0]; x.save(); x.translate(p[0] + (r() - .5) * 8, p[1] + (r() - .5) * 8); x.rotate(r() * PI); x.scale(1.6, 1.6); x.beginPath(); x.moveTo(-2, -1.5); x.lineTo(2.5, -1); x.lineTo(1.5, 2); x.lineTo(-2, 1.2); x.closePath(); x.fill(); x.restore(); } }, CREAM, { blur: .2 }, {});
      screen(x => { x.beginPath(); for (let i = 0; i < STREAM.length; i += 2) { const p = STREAM[i]; x.moveTo(p[0] + .45, p[1]); x.arc(p[0], p[1], .45, 0, TAU); } x.fill(); }, CREAM, { blur: 0, voids: 0 }, { alpha: .45 });
      // type
      screen(x => { x.font = '27px Michroma'; spaced(x, 'DYSON SWARM', 28, 538, 1.5); }, CREAM, { blur: .4, rough: .5, voids: .1 }, {});
      screen(x => { x.font = '7.6px Michroma'; spaced(x, 'AN INTERACTIVE MEGASTRUCTURE', 29, 562, 1.8); spaced(x, '2024', 372, 562, 1.8, 'right'); x.fillRect(29, 510, 34, 2.2); }, YELLOW, { blur: .3, rough: .25, bias: .16, voids: 0, mottle: 0 }, {});
      wear(L, PAPER, .5);
      L.tex = paperTex(L, { mottle: .04, grain: .05, fibres: 260, fAlpha: .06 });
    },
    live: {
      box: [0, 120, 400, 330], fps: 24,
      draw(ctx, t) {
        const Pd = 24;
        RINGS.forEach(([rx, ry, n, laps], ri) => {
          for (let i = 0; i < n; i++) {
            const a = i / n * TAU + ri * .7 + TAU * laps * t / Pd, front = Math.sin(a) > 0, p = ringPt(rx, ry, a);
            const inSun = Math.hypot(p[0] - SUN[0], p[1] - SUN[1]) < SR - 1;
            if (!front && inSun) continue;
            const s = front ? 1 : .72, ta = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) + TILT;
            ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ta); ctx.fillStyle = front && inSun ? NAVY : CREAM;
            ctx.fillRect(-3.4 * s, -1.4 * s, 6.8 * s, 2.8 * s); ctx.fillStyle = front && inSun ? NAVY : YELLOW; ctx.fillRect(-.4 * s, -1.4 * s, .8 * s, 2.8 * s); ctx.restore();
          }
        });
        for (let k = 0; k < 16; k++) { const f = (t / 8 + k / 16) % 1, p = STREAM[Math.min(STREAM.length - 1, (f * STREAM.length) | 0)]; ctx.fillStyle = CREAM; ctx.globalAlpha = smooth(0, .1, f) * (1 - smooth(.85, 1, f)); ctx.fillRect(p[0] - 1.1, p[1] - 1.1, 2.2, 2.2); }
        ctx.globalAlpha = 1;
      },
    },
  };
})();

/* ═════════ 8 · ZINify — two-drum risograph zine, stapled ═════════ */
COVERS.zinify = (() => {
  const PAPER = '#f3f0e8', BLUE = '#0078bf', PINK = '#ff48b0';
  const RISO = { blur: .55, rough: .9, mottle: .25, voids: .55, voidT: .56, grain: .2, streak: .08 };
  function star(cx, cy, R, seed, pts = 5) { const r = mulberry32(seed), out = []; for (let k = 0; k <= pts * 2; k++) { const a = -PI / 2 + k * PI / pts, rr = (k % 2 ? R * .45 : R) * (.85 + r() * .3); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return out; }
  return {
    seed: 71, still: 3,
    build(L) {
      const b = L.bctx, r = L.rng;
      b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
      const blue = L.canvas(), pink = L.canvas(), bx = L.ctx(blue), px = L.ctx(pink);
      for (const x of [bx, px]) { x.fillStyle = x.strokeStyle = '#000'; x.lineCap = x.lineJoin = 'round'; }
      // the paper being transformed (blue drum)
      bx.save(); bx.translate(190, 236); bx.rotate(-.09); bx.translate(-190, -236);
      bx.lineWidth = 1.2; bx.strokeRect(62, 72, 262, 318);
      bx.font = '700 10.4px "Courier Prime"'; ['ZINify: Transforming Research Papers', 'into Engaging Zines with Large', 'Language Models'].forEach((s, i) => bx.fillText(s, 80, 98 + i * 12));
      bx.font = '400 7.4px "Courier Prime"'; bx.fillText('J. Shriram and S. P. Kumar Sreekala', 80, 144);
      bx.font = '700 7.6px "Courier Prime"'; bx.fillText('Abstract', 80, 164);
      for (let col = 0; col < 2; col++) for (let ln = 0; ln < 22; ln++) { const y = 174 + ln * 9; if (col === 1 && ln > 4 && ln < 13) continue; let x0 = 80 + col * 122; const end = x0 + 108 - (ln % 7 === 6 ? 40 : r() * 6); while (x0 < end) { const w = 6 + r() * 20; bx.fillRect(x0, y, Math.min(w, end - x0), 2.1); x0 += w + 3; } }
      bx.lineWidth = .8; bx.strokeRect(204, 214, 104, 66); for (let k = 0; k < 7; k++) { const h = 10 + r() * 44; bx.fillRect(212 + k * 13.5, 274 - h, 8, h); }
      bx.restore();
      // halftone shadow under the page (blue)
      const sh = L.mask(x => { x.translate(190, 236); x.rotate(-.09); x.translate(-190, -236); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(70, 82, 262, 318); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fillRect(62, 72, 262, 318); });
      bx.save(); bx.setTransform(1, 0, 0, 1, 0, 0); bx.drawImage(halftone(L, sh, { cell: 3.2, angle: 1.31 }), 0, 0); bx.restore();
      // pink drum: big halftone blob behind the lettering
      const blob = L.mask(x => { const g = x.createRadialGradient(250, 446, 10, 250, 446, 150); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(.7, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(250, 446, 150, 132, -.2, 0, TAU); x.fill(); });
      px.save(); px.setTransform(1, 0, 0, 1, 0, 0); px.drawImage(halftone(L, blob, { cell: 4.4, angle: .38 }), 0, 0); px.restore();
      // hand lettering
      const g = glyphStrokes('ZINIFY!', { x: 200, y: 506, size: 74, align: 'center', track: .26, jrot: .08, jy: .07, js: .06, seed: 12 });
      const rot = (x, fn) => { x.save(); x.translate(200, 470); x.rotate(-.075); x.translate(-200, -470); fn(); x.restore(); };
      rot(bx, () => { bx.translate(4.5, 4.5); brush(bx, g.strokes, { w: 76 * .17, wob: 1.1, wobF: .05, seed: 4 }); });
      rot(px, () => brush(px, g.strokes, { w: 76 * .17, wob: 1.1, wobF: .05, seed: 4 }));
      const g2 = glyphStrokes('RESEARCH PAPERS → ZINES', { x: 200, y: 560, size: 12.5, align: 'center', track: .16, jrot: .06, jy: .06, seed: 13 });
      rot(bx, () => brush(bx, g2.strokes, { w: 1.9, wob: .3, seed: 5 }));
      // sticker: pink disc, blue words → purple where they overprint
      px.beginPath(); px.arc(322, 122, 36, 0, TAU); px.fill();
      const g3 = glyphStrokes('UIST', { x: 322, y: 119, size: 19, align: 'center', track: .2, jrot: .04, seed: 14 }), g4 = glyphStrokes('2023', { x: 322, y: 141, size: 13, align: 'center', track: .16, jrot: .05, seed: 15 });
      bx.save(); bx.translate(322, 122); bx.rotate(.18); bx.translate(-322, -122); brush(bx, [...g3.strokes, ...g4.strokes], { w: 3, wob: .25, seed: 6 }); bx.restore();
      L.put(L.base, L.ink(blue, { color: BLUE, ...RISO, salt: 1 }), { mode: 'multiply' });
      L.put(L.base, L.ink(pink, { color: PINK, ...RISO, salt: 2 }), { mode: 'multiply', dx: 1.4, dy: -1, rot: .0035 });
      // the doodles boil: three hand-drawn takes, cycled
      L.boil = [0, 1, 2].map(v => L.ink(L.mask(x => {
        const j = (pts, a) => wobble(resample(pts, 2), a, .15, v * 31 + pts.length);
        brush(x, [j(star(60, 420, 15, 3 + v), 1), j(star(354, 528, 11, 9 + v), .9), j(star(88, 566, 8, 21 + v, 4), .7), j(star(270, 52, 9, 33 + v, 4), .7)], { w: 2.4, wob: .4, seed: 7 + v });
        brush(x, [j(bez([330, 352], [372, 380], [366, 412], [334, 424], 24), 1.2), j([[334, 424], [347, 413]], .6), j([[334, 424], [349, 428]], .6)], { w: 2.6, wob: .4, seed: 9 + v });
        brush(x, [j(bez([118, 590], [160, 580], [240, 596], [290, 584], 30), 1)], { w: 2.2, wob: .4, seed: 11 + v });
      }), { color: PINK, ...RISO, salt: 3 + v }));
      // staples through the fold
      const o = L.octx;
      for (const sy of [150, 450]) { o.fillStyle = 'rgba(40,40,40,.25)'; o.fillRect(-1, sy + 1.6, 11, 1.8); const gr = o.createLinearGradient(0, sy - 1.3, 0, sy + 1.3); gr.addColorStop(0, '#e6e8ea'); gr.addColorStop(.5, '#9ea3a8'); gr.addColorStop(1, '#6d7276'); o.fillStyle = gr; o.fillRect(-1, sy - 1.3, 10, 2.6); }
      const fold = o.createLinearGradient(0, 0, 9, 0); fold.addColorStop(0, 'rgba(60,50,40,.16)'); fold.addColorStop(1, 'rgba(60,50,40,0)'); o.fillStyle = fold; o.fillRect(0, 0, 9, DH);
      L.tex = paperTex(L, { mottle: .03, grain: .04, fibres: 120, fAlpha: .04 });
    },
    live: { box: [36, 30, 340, 570], key: t => Math.floor(t * 3.4) % 3, draw(ctx, t, L) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L.boil[Math.floor(t * 3.4) % 3], 0, 0); ctx.restore(); } },
  };
})();

/* ═════════ 9 · Power quality event classification — technical journal, duotone halftone oscilloscope ═════════ */
COVERS.power = (() => {
  const PAPER = '#e8dec4', BLACK = '#1c1c1a', GREEN = '#24935f', CORE = '#e2f2d2';
  const C = [200, 390], SR = 102;
  const wave = u => { const sag = 1 - .52 * smooth(.4, .45, u) * (1 - smooth(.66, .71, u)); return -38 * sag * Math.sin(TAU * 5 * u); };
  return {
    seed: 83, still: 1.1,
    build(L) {
      const b = L.bctx;
      b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
      const pr = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .4, rough: .45, mottle: .08, grain: .03, salt: (pr.n = (pr.n || 0) + 1), ...o }, { mode: 'multiply', ...p });
      pr(x => { x.fillRect(-4, -4, 408, 82); x.globalCompositeOperation = 'destination-out'; x.font = '700 11px "Old Standard TT"'; spaced(x, 'IEEE  DISCOVER  ·  2019', 200, 46, 3.2, 'center'); }, BLACK, { mottle: .12 });
      pr(x => { x.font = '700 23px "Old Standard TT"'; ['Power Quality Event', 'Classification Using', 'Long Short-Term', 'Memory Networks'].forEach((s, i) => spaced(x, s, 30, 118 + i * 27, .2)); x.fillRect(30, 222, 340, .9); }, BLACK);
      pr(x => { x.font = '400 10px "Old Standard TT"'; spaced(x, 'Best Paper Award', 30, 566, .4); spaced(x, 'S. K. G. Manikonda et al.', 370, 566, .4, 'right'); x.fillRect(30, 548, 340, .7); }, BLACK, { bias: .14 });
      // the oscilloscope, printed as a duotone photograph
      const bezel = x => { x.beginPath(); x.roundRect(68, 262, 264, 256, 20); };
      const screen = x => { x.beginPath(); x.arc(C[0], C[1], SR, 0, TAU); };
      const greenPlate = L.mask(x => { screen(x); x.globalAlpha = .9; x.fill(); });
      L.put(L.base, L.ink(halftone(L, greenPlate, { cell: 2.1, angle: 1.31, gain: 1.05 }), { color: GREEN, blur: .3, rough: .3, salt: 20 }), { mode: 'multiply' });
      const blackPlate = L.mask(x => {
        bezel(x); const g = x.createLinearGradient(80, 270, 320, 520); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.45, 'rgba(0,0,0,.92)'); g.addColorStop(1, 'rgba(0,0,0,.98)'); x.fillStyle = g; x.fill();
        x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(C[0], C[1], SR + 7, 0, TAU); x.fill();
        x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(C[0], C[1], SR + 7, 0, TAU); x.arc(C[0], C[1], SR, 0, TAU, true); x.fill();
        const v = x.createRadialGradient(C[0] - 20, C[1] - 24, 10, C[0], C[1], SR); v.addColorStop(0, 'rgba(0,0,0,.66)'); v.addColorStop(1, 'rgba(0,0,0,.93)'); x.fillStyle = v; screen(x); x.fill();
        x.globalCompositeOperation = 'destination-out'; x.save(); screen(x); x.clip(); x.lineWidth = .8; x.strokeStyle = 'rgba(0,0,0,.75)';
        for (let k = -5; k <= 5; k++) { x.beginPath(); x.moveTo(C[0] + k * 20, C[1] - SR); x.lineTo(C[0] + k * 20, C[1] + SR); x.stroke(); x.beginPath(); x.moveTo(C[0] - SR, C[1] + k * 20); x.lineTo(C[0] + SR, C[1] + k * 20); x.stroke(); }
        for (let k = -25; k <= 25; k++) { x.beginPath(); x.moveTo(C[0] + k * 4, C[1] - 2); x.lineTo(C[0] + k * 4, C[1] + 2); x.stroke(); x.beginPath(); x.moveTo(C[0] - 2, C[1] + k * 4); x.lineTo(C[0] + 2, C[1] + k * 4); x.stroke(); }
        x.restore();
        x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(0,0,0,.25)';
        for (const [sx, sy] of [[84, 278], [316, 278], [84, 502], [316, 502]]) { x.beginPath(); x.arc(sx, sy, 5, 0, TAU); x.fill(); }
      });
      L.put(L.base, L.ink(halftone(L, blackPlate, { cell: 2.1, angle: .79, gain: 1.04 }), { color: BLACK, blur: .3, rough: .3, salt: 21 }), { mode: 'multiply' });
      pr(x => { x.lineWidth = .9; for (const [sx, sy] of [[84, 278], [316, 278], [84, 502], [316, 502]]) { x.beginPath(); x.arc(sx, sy, 5, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(sx - 3.4, sy - 1); x.lineTo(sx + 3.4, sy + 1); x.stroke(); } }, BLACK, { blur: .2 });
      crease(L, 7, .22, .09);
      L.tex = paperTex(L, { mottle: .07, grain: .05, fibres: 300, fAlpha: .08, flecks: 40 });
      // halftone cells for the live trace, in the screen's own rotated grid
      const cell = 2.6, ang = .26, ca = Math.cos(ang), sa = Math.sin(ang), cells = [];
      for (let v = -48; v <= 48; v++) for (let u = -48; u <= 48; u++) {
        const x = (u * ca - v * sa) * cell, y = (u * sa + v * ca) * cell; if (Math.hypot(x, y) >= SR - 2) continue;
        const px = C[0] + x, py = C[1] + y, uu = (px - (C[0] - SR)) / (SR * 2), wy = wave(uu), dw = (wave(uu + .002) - wave(uu - .002)) / (.004 * SR * 2);
        const d = Math.abs(py - C[1] - wy) / Math.sqrt(1 + dw * dw); if (d > 12) continue;   // only cells near the trace can ever light
        cells.push([px, py, uu, Math.exp(-((d / 4.2) ** 2)), Math.exp(-((d / 1.7) ** 2))]);
      }
      L.cells = cells; L.cellSize = cell;
    },
    live: {
      box: [C[0] - SR - 2, C[1] - SR - 2, SR * 2 + 4, SR * 2 + 4], fps: 30,
      draw(ctx, t, L) {
        const Pd = 3.2, head = (t % Pd) / Pd * 1.18 - .09, cs = L.cellSize;
        const halo = [], core = [];
        for (const [x, y, u, hd, cd] of L.cells) {
          const behind = head - u; const glow = behind >= 0 ? Math.exp(-behind / .22) : Math.exp(-(behind + 1.18) / .22) * .9; if (glow < .03) continue;
          const hb = hd * glow, cb = cd * glow * (behind >= 0 && behind < .02 ? 1.3 : 1);
          if (hb > .04) halo.push(x, y, Math.sqrt(Math.min(1, hb)) * cs * .62);
          if (cb > .12) core.push(x, y, Math.sqrt(Math.min(1, cb)) * cs * .5);
        }
        const dots = (arr, col) => { ctx.fillStyle = col; ctx.beginPath(); for (let i = 0, n = 0; i < arr.length; i += 3) { ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1]); ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, TAU); if (++n % 150 === 0) { ctx.fill(); ctx.beginPath(); } } ctx.fill(); };
        dots(halo, GREEN); dots(core, CORE);
      },
    },
  };
})();

/* ── compact shelf runtime for the homepage ── */
const SHELF_FONTS = ['800 60px Archivo', '400 10px Archivo', '600 10px Archivo', '40px Anton', '40px "Abril Fatface"', '700 15px "Old Standard TT"', '400 14px "Old Standard TT"', '700 40px Jost', '500 10px Jost', '400 10px Jost', '400 12px "Courier Prime"', '700 12px "Courier Prime"'];
function composite(it, t, full) {
  const { L, spec } = it; const S = L.S, ctx = it.ctx;
  let bx = 0, by = 0, bw = L.W, bh = L.H;
  if (!full && spec.live && spec.live.box) { const b = spec.live.box; bx = Math.max(0, Math.floor(b[0] * S) - 1); by = Math.max(0, Math.floor(b[1] * S) - 1); bw = Math.min(L.W - bx, Math.ceil(b[2] * S) + 3); bh = Math.min(L.H - by, Math.ceil(b[3] * S) + 3); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(L.base, bx, by, bw, bh, bx, by, bw, bh);
  if (spec.live) { ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); spec.live.draw(ctx, t, L); ctx.restore(); }
  ctx.globalCompositeOperation = spec.overMode || 'source-over'; ctx.drawImage(L.over, bx, by, bw, bh, bx, by, bw, bh);
  if (L.tex) { ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L.tex, bx, by, bw, bh, bx, by, bw, bh); }
  ctx.restore();
}
window.mountShelf = function (list, keys) {
  const items = keys.map(key => {
    const w = WORKS.find(x => x.key === key); const li = document.createElement('li');
    li.innerHTML = `<a class="cover" href="${w.href}"><canvas aria-hidden="true"></canvas><span class="cover-title">${w.title}</span><span class="cover-meta">${w.meta}</span></a>`;
    list.appendChild(li);
    return { work: w, spec: COVERS[key], canvas: li.querySelector('canvas'), visible: false, L: null };
  });
  let builtW = 0, t0 = performance.now(), raf = 0;
  const startTime = it => FIXED_T ?? (REDUCED ? (it.spec.still ?? 0) : 0);
  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.find(i => i.canvas === e.target); if (it) it.visible = e.isIntersecting; if (e.isIntersecting && !raf && builtW && FIXED_T == null && !REDUCED) raf = requestAnimationFrame(loop); }), { rootMargin: '120px' });
  items.forEach(it => io.observe(it.canvas));
  async function build() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(items[0].canvas.getBoundingClientRect().width * dpr), H = Math.round(W * 1.5);
    if (!W || W === builtW) return; builtW = W;
    FIELDS = makeFields(W, H, W / DW);
    for (const it of items) {
      it.canvas.width = W; it.canvas.height = H; it.ctx = it.canvas.getContext('2d');
      const L = makeKit(W, H, it.spec.seed || 1);
      try { it.spec.build(L); } catch (e) { console.error(it.work.key, e); }
      it.L = L; composite(it, startTime(it), true);
      if (FIXED_T == null) await new Promise(r => setTimeout(r, 0));
    }
  }
  function loop(now) {
    raf = 0; if (document.hidden) return;
    const t = (now - t0) / 1000; let any = false;
    for (const it of items) {
      const lv = it.spec.live; if (!it.L || !it.visible || !lv) continue; any = true;
      const key = lv.key ? lv.key(t) : Math.floor(t * (lv.fps || 30));
      if (key === it.lastKey) continue; it.lastKey = key; composite(it, t, false);
    }
    if (any) raf = requestAnimationFrame(loop);
  }
  const fontsReady = Promise.race([Promise.all(SHELF_FONTS.map(f => document.fonts.load(f))).catch(() => { }), new Promise(r => setTimeout(r, 6000))]);
  const ready = fontsReady.then(build).then(() => { t0 = performance.now(); if (FIXED_T == null && !REDUCED) raf = requestAnimationFrame(loop); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf && FIXED_T == null && !REDUCED && builtW) raf = requestAnimationFrame(loop); });
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(async () => { await build(); if (FIXED_T != null || REDUCED) items.forEach(it => it.L && composite(it, startTime(it), true)); }, 200); });
  return ready;
};
})();
