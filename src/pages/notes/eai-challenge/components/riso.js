/* =============================================================================
   riso.js — the shared press for "Winning by Overfitting, explained by hand".

   Process: three-drum risograph on natural paper, the same hand as the loop
   figure sample (../explainer/). Every mark is drawn into one of three ink
   layers as a coverage mask; the layers are colourised, given drum speckle and
   uneven inking, and multiplied onto the paper with slight misregistration.

   Inks     BLUE #0078BF the plan, key line, lettering
            PINK #FF48B0 errors only
            YELLOW #FFE800 fills, highlighter, what passed (gold)
   Paper    #F9F7F1 with fibre and tooth.
   Rules    Colour has one job. Lines are marker strokes with pressure and a
            three-drawing boil at 8 fps. Lettering is a single-stroke hand.
   Refused  Boxes-and-arrows flowcharts, gradients, glow, black ink, AI beige,
            decorative italics, pulsing dots, dashboard chrome.

   Ported from design/prototypes/2026-10-code-drawn-art/essay-by-hand/js/riso.js
   as an ES module. Drawing state (LY, BOIL, CELL) stays module-level; the figure
   modules draw through the exported pen functions, one figure at a time.
   ========================================================================== */
const TAU = Math.PI * 2;
const INK = { B: '#0078BF', P: '#FF48B0', Y: '#FFE800' };
const ORDER = ['Y', 'P', 'B'];
const ANG = { B: 15, P: 75, Y: 0 };
const REG = { B: [0, 0], P: [1.4, -0.8], Y: [-1.2, 1.0] };
const PAPER = '#F9F7F1';
/* ---------------------------------------------------------------- utilities */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = x => x * x * (3 - 2 * x);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eout = x => 1 - Math.pow(1 - x, 3);
const eback = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const inR = (t, a, b) => t >= a && t < b;

function h1(i) {
  i |= 0; i = Math.imul(i ^ (i >>> 16), 0x45d9f3b); i = Math.imul(i ^ (i >>> 16), 0x45d9f3b); i ^= i >>> 16;
  return (i >>> 0) / 4294967295 * 2 - 1;
}
function nz(x, seed) {           // smooth value noise, -1..1
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f), s = (seed | 0) * 1013;
  return h1(i + s) * (1 - u) + h1(i + 1 + s) * u;
}
function rng(seed) {             // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function hstr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 100000; }

function bez(p, t) {             // cubic bezier, p = [[x,y]x4]
  const u = 1 - t;
  return [u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0],
          u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1]];
}
function bezPts(p, n = 40) { const o = []; for (let i = 0; i <= n; i++) { const q = bez(p, i / n); o.push(q[0], q[1]); } return o; }
function bezTan(p, t) { const a = bez(p, Math.max(0, t - .01)), b = bez(p, Math.min(1, t + .01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); }

/* ------------------------------------------------------------ point shapes */
function catmull(p, seg = 5) {
  const n = p.length / 2; if (n < 3) return p.slice();
  const out = [];
  for (let i = 0; i < n - 1; i++) {
    const i0 = Math.max(i - 1, 0), i3 = Math.min(i + 2, n - 1);
    const x0 = p[i0*2], y0 = p[i0*2+1], x1 = p[i*2], y1 = p[i*2+1], x2 = p[i*2+2], y2 = p[i*2+3], x3 = p[i3*2], y3 = p[i3*2+1];
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push(.5 * ((2*x1) + (-x0 + x2)*t + (2*x0 - 5*x1 + 4*x2 - x3)*t2 + (-x0 + 3*x1 - 3*x2 + x3)*t3),
               .5 * ((2*y1) + (-y0 + y2)*t + (2*y0 - 5*y1 + 4*y2 - y3)*t2 + (-y0 + 3*y1 - 3*y2 + y3)*t3));
    }
  }
  out.push(p[(n-1)*2], p[(n-1)*2+1]);
  return out;
}
function resample(p, step) {
  const m = p.length / 2; const cum = new Float32Array(m);
  for (let i = 1; i < m; i++) cum[i] = cum[i-1] + Math.hypot(p[i*2] - p[i*2-2], p[i*2+1] - p[i*2-1]);
  const total = cum[m-1] || 0;
  const n = Math.max(2, Math.ceil(total / step) + 1);
  const xs = new Float32Array(n), ys = new Float32Array(n);
  let j = 1;
  for (let k = 0; k < n; k++) {
    const s = total * k / (n - 1);
    while (j < m - 1 && cum[j] < s) j++;
    const s0 = cum[j-1], s1 = cum[j]; const f = s1 > s0 ? (s - s0) / (s1 - s0) : 0;
    xs[k] = p[j*2-2] + (p[j*2] - p[j*2-2]) * f; ys[k] = p[j*2-1] + (p[j*2+1] - p[j*2-1]) * f;
  }
  return { xs, ys, n, total };
}
function arcPts(cx, cy, rx, ry, a0, a1, n) {
  n = n || Math.max(6, Math.ceil(Math.abs(a1 - a0) / 10));
  const o = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push(cx + rx * Math.cos(a), cy + ry * Math.sin(a)); }
  return o;
}
function ellPts(cx, cy, rx, ry, n = 40) { const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; o.push(cx + rx * Math.cos(a), cy + ry * Math.sin(a)); } return o; }
function rectPts(x, y, w, h, r = 2, step = 5) {
  const o = [];
  const ln = (x0, y0, x1, y1) => { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(d / step)); for (let i = 0; i < n; i++) o.push(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
  const ar = (cx, cy, a0) => { if (r <= .01) return; for (let i = 0; i < 4; i++) { const a = (a0 + i * 22.5) * Math.PI / 180; o.push(cx + r * Math.cos(a), cy + r * Math.sin(a)); } };
  ln(x + r, y, x + w - r, y); ar(x + w - r, y + r, -90);
  ln(x + w, y + r, x + w, y + h - r); ar(x + w - r, y + h - r, 0);
  ln(x + w - r, y + h, x + r, y + h); ar(x + r, y + h - r, 90);
  ln(x, y + h - r, x, y + r); ar(x + r, y + r, 180);
  return o;
}
function superPts(cx, cy, rx, ry, n, cnt, bulge = 0) {
  const o = [];
  for (let i = 0; i < cnt; i++) {
    const a = i / cnt * TAU, c = Math.cos(a), s = Math.sin(a);
    const k = 1 + bulge * Math.max(0, s);
    o.push(cx + rx * k * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + ry * Math.sign(s) * Math.pow(Math.abs(s), 2 / n));
  }
  return o;
}

/* --------------------------------------------------------------- the hand */
export let LY = null; // current target layers {B,P,Y}
export let BOIL = 0;  // 0..2, the three-drawing boil
let CELL = 4;         // halftone cell, device px
const tsave = () => { for (const k in LY) LY[k].save(); };
const trest = () => { for (const k in LY) LY[k].restore(); };
const ttr = (x, y) => { for (const k in LY) LY[k].translate(x, y); };
const trot = a => { for (const k in LY) LY[k].rotate(a); };
const tsc = (sx, sy) => { for (const k in LY) LY[k].scale(sx, sy ?? sx); };
function tclipRect(x, y, w, h) { for (const k in LY) { const c = LY[k]; c.beginPath(); c.rect(x, y, w, h); c.clip(); } }

function penPath(c, p, o) {
  const w = o.w ?? 2, wob = o.wob ?? .5, seed = o.seed ?? 1, freq = o.freq ?? .09, reveal = o.reveal ?? 1;
  if (p.length === 2) { const r = w * .62; c.moveTo(p[0] + r, p[1]); c.arc(p[0], p[1], r, 0, TAU); return; }
  const R = resample(p, o.step ?? 1.1); const { xs, ys, n, total } = R;
  if (total < .05) { const r = w * .6; c.moveTo(xs[0] + r, ys[0]); c.arc(xs[0], ys[0], r, 0, TAU); return; }
  const end = total * reveal; if (end <= .05) return;
  const jit = o.jit ?? .4, jx = nz(seed * .71, seed) * jit, jy = nz(seed * 1.37, seed + 3) * jit;
  const ta = o.ta ?? 2.4, tb = o.tb ?? 4.2, press = o.press ?? 1;
  const Lx = [], Ly = [], Rx = [], Ry = [];
  let sx = 0, sy = 0, sw = 0, ex = 0, ey = 0, ew = 0;
  for (let i = 0; i < n; i++) {
    const s = total * i / (n - 1); if (s > end + 1e-6) break;
    const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
    let tx = xs[i1] - xs[i0], ty = ys[i1] - ys[i0]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const nx = -ty, ny = tx;
    const off = wob * nz(s * freq + seed * 3.1, seed + 7);
    const pa = .5 + .5 * sm(Math.min(1, s / ta)), pb = .6 + .4 * sm(Math.min(1, (total - s) / tb));
    const hw = .5 * w * (1 - press + press * Math.min(pa, pb)) * (1 + .17 * nz(s * .06, seed + 13));
    const cx = xs[i] + nx * off + jx, cy = ys[i] + ny * off + jy;
    Lx.push(cx + nx * hw); Ly.push(cy + ny * hw); Rx.push(cx - nx * hw); Ry.push(cy - ny * hw);
    if (i === 0) { sx = cx; sy = cy; sw = hw; }
    ex = cx; ey = cy; ew = hw;
  }
  if (Lx.length < 2) return;
  c.moveTo(Lx[0], Ly[0]);
  for (let i = 1; i < Lx.length; i++) c.lineTo(Lx[i], Ly[i]);
  for (let i = Rx.length - 1; i >= 0; i--) c.lineTo(Rx[i], Ry[i]);
  c.closePath();
  c.moveTo(sx + sw, sy); c.arc(sx, sy, sw, 0, TAU);
  c.moveTo(ex + ew, ey); c.arc(ex, ey, ew, 0, TAU);
}
function line(ink, p, o = {}) {
  const c = LY[ink]; c.beginPath();
  penPath(c, p, { ...o, seed: (o.seed ?? 1) + BOIL * 131 });
  c.fillStyle = '#000'; c.fill();
}
function blobPath(c, pts, o = {}) {
  const wob = o.wob ?? .8, seed = (o.seed ?? 1) + BOIL * 57, dx = o.dx ?? 0, dy = o.dy ?? 0;
  const closed = pts.concat(pts.slice(0, 2));
  const { xs, ys, n, total } = resample(closed, o.step ?? 2);
  for (let i = 0; i < n - 1; i++) {
    const s = total * i / (n - 1);
    const i0 = (i - 1 + (n - 1)) % (n - 1), i1 = (i + 1) % (n - 1);
    let tx = xs[i1] - xs[i0], ty = ys[i1] - ys[i0]; const tl = Math.hypot(tx, ty) || 1;
    const off = wob * nz(s * .07, seed);
    const x = xs[i] - ty / tl * off + dx, y = ys[i] + tx / tl * off + dy;
    if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.closePath();
}
function solid(ink, pts, o = {}) { const c = LY[ink]; c.beginPath(); blobPath(c, pts, o); c.fillStyle = '#000'; c.fill(); }
function tone(ink, pts, d, o = {}) { const c = LY[ink]; c.beginPath(); blobPath(c, pts, o); c.fillStyle = tonePat(c, ink, d); c.fill(o.rule || 'nonzero'); }
function knock(pts, o = {}) {
  for (const k in LY) {
    const c = LY[k]; c.save(); c.globalCompositeOperation = 'destination-out';
    c.beginPath(); blobPath(c, pts, { wob: o.wob ?? .4, seed: o.seed ?? 3, step: 3 }); c.fillStyle = '#000'; c.fill(); c.restore();
  }
}
function punch(ink, pts) { const c = LY[ink]; c.save(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); blobPath(c, pts, { wob: .2, seed: 5 }); c.fill(); c.restore(); }
function outline(ink, pts, o = {}) {
  const k = Math.max(4, Math.floor(pts.length * (o.over ?? .1) / 2) * 2);
  line(ink, pts.concat(pts.slice(0, k)), o);
}
const PATS = new WeakMap();
function tonePat(c, ink, d) {
  d = Math.round(clamp(d, .05, 1) * 20) / 20;
  let e = PATS.get(c); if (!e) { e = new Map(); PATS.set(c, e); }
  const key = ink + d + '|' + CELL;
  let p = e.get(key);
  if (!p) {
    const n = CELL, cv = document.createElement('canvas'); cv.width = cv.height = n;
    const g = cv.getContext('2d'); g.fillStyle = '#000';
    const r = n * Math.sqrt(d / Math.PI);
    if (d >= .96) g.fillRect(0, 0, n, n);
    else if (r <= n * .5) { g.beginPath(); g.arc(n / 2, n / 2, r, 0, TAU); g.fill(); }
    else {
      g.fillRect(0, 0, n, n); g.globalCompositeOperation = 'destination-out';
      const r2 = n * Math.sqrt((1 - d) / Math.PI); g.beginPath();
      for (const [x, y] of [[0, 0], [n, 0], [0, n], [n, n]]) { g.moveTo(x + r2, y); g.arc(x, y, r2, 0, TAU); }
      g.fill();
    }
    p = c.createPattern(cv, 'repeat'); e.set(key, p);
  }
  p.setTransform(c.getTransform().inverse().rotate(ANG[ink]));
  return p;
}

/* --------------------------------------------------- single-stroke letters */
const S = (...c) => ({ c });
const Dt = (x, y) => ({ d: [x, y] });
const cat = (...parts) => { const o = []; for (const p of parts) { if (o.length && Math.abs(o[o.length-2] - p[0]) < 1e-6 && Math.abs(o[o.length-1] - p[1]) < 1e-6) o.push(...p.slice(2)); else o.push(...p); } return o; };
const A_ = arcPts;
const RAW = {
  'A': [7, [0,10,3.5,0,7,10], [1.4,6.6,5.6,6.6]],
  'B': [6.2, cat([0,10,0,0,3.5,0], A_(3.5,2.4,2.4,2.4,-90,90), [0,4.8]), cat([0,4.8,3.8,4.8], A_(3.8,7.4,2.6,2.6,-90,90), [0,10])],
  'C': [6.6, A_(3.7,5,3.7,5,-48,-312)],
  'D': [6.4, cat([0,0,0,10,2.6,10], A_(2.6,5,3.6,5,90,-90), [0,0])],
  'E': [5.8, [5.8,0,0,0,0,10,5.8,10], [0,5,4.6,5]],
  'F': [5.6, [5.6,0,0,0,0,10], [0,5,4.4,5]],
  'G': [7.4, cat(A_(3.7,5,3.7,5,-45,-352), [4.3,5.5])],
  'H': [6.2, [0,0,0,10], [6.2,0,6.2,10], [0,5,6.2,5]],
  'I': [.4, [.2,0,.2,10]],
  'J': [5, cat([5,0,5,7.2], A_(2.5,7.2,2.5,2.8,0,165))],
  'K': [6, [0,0,0,10], [6,0,0,6.4], [2.1,4.4,6,10]],
  'L': [5.4, [0,0,0,10,5.4,10]],
  'M': [8, [0,10,0,0,4,7,8,0,8,10]],
  'N': [6.6, [0,10,0,0,6.6,10,6.6,0]],
  'O': [7.6, A_(3.8,5,3.8,5,-100,275)],
  'P': [6.2, cat([0,10,0,0,3.6,0], A_(3.6,2.6,2.6,2.6,-90,90), [0,5.2])],
  'Q': [7.8, A_(3.8,5,3.8,5,-100,275), [4.6,7,7.8,10.8]],
  'R': [6.4, cat([0,10,0,0,3.6,0], A_(3.6,2.6,2.6,2.6,-90,90), [0,5.2]), [3,5.2,6.4,10]],
  'S': [6.2, S(6,1.3,4.6,.1,2.6,0,.8,.9,.4,2.7,1.6,4.3,3.4,5,5.1,5.9,6.1,7.6,5.4,9.4,3.4,10,1.4,9.8,0,8.6)],
  'T': [7, [0,0,7,0], [3.5,0,3.5,10]],
  'U': [6.4, cat([0,0,0,6.8], A_(3.2,6.8,3.2,3.2,180,0), [6.4,0])],
  'V': [7, [0,0,3.5,10,7,0]],
  'W': [9.2, [0,0,2.3,10,4.6,2.6,6.9,10,9.2,0]],
  'X': [6.6, [0,0,6.6,10], [6.6,0,0,10]],
  'Y': [6.8, [0,0,3.4,5.2,6.8,0], [3.4,5.2,3.4,10]],
  'Z': [6.4, [0,0,6.4,0,0,10,6.4,10]],
  '0': [6.4, A_(3.2,5,3.2,5,-100,275)],
  '1': [3, [.2,2.2,2.6,0,2.6,10]],
  '2': [6, S(.3,2.4,1.2,.6,3,0,4.9,.6,5.6,2.4,5,4.4,2.6,7,0,10), [0,10,6,10]],
  '3': [5.9, S(.3,1.2,2,0,4.2,.2,5.4,1.8,4.8,3.8,2.6,4.8), S(2.6,4.8,5,5.6,5.9,7.6,4.9,9.5,2.8,10,.8,9.5,0,8.5)],
  '4': [6.4, [4.6,10,4.6,0,0,7,6.4,7]],
  '5': [5.9, [5.6,0,1,0,.6,4.4], S(.6,4.4,2.6,3.8,4.8,4.4,5.9,6.6,5.2,9.2,3,10,.9,9.5,0,8.4)],
  '6': [6, S(5,.6,3.4,0,1.4,1,.2,4,.2,7,1.3,9.4,3.2,10,5,9.3,5.8,7.4,5.2,5.4,3.2,4.7,1.2,5.4,.2,7)],
  '7': [6.2, [0,0,6.2,0,2.2,10]],
  '8': [6, S(3,4.7,1,3.8,.6,2,1.6,.4,3,0,4.6,.4,5.4,2,5,3.8,3,4.7,.8,5.8,.2,7.8,1.2,9.6,3,10,4.9,9.6,5.8,7.8,5.2,5.8,3,4.7)],
  '9': [6, S(5.6,3,4.8,4.8,2.8,5.3,.8,4.4,.2,2.4,1.2,.5,3,0,4.9,.6,5.8,2.6,5.6,6,4.8,8.8,3,10,1,9.4)],
  '.': [1.2, Dt(.6,9.3)],
  ',': [1.4, [1,8.8,.2,11.2]],
  ':': [1.2, Dt(.6,3.4), Dt(.6,9.3)],
  "'": [1.2, [.7,0,.4,3]],
  '-': [3.8, [0,5.6,3.8,5.6]],
  '(': [1.8, A_(3,5,3,6,-125,-235)],
  ')': [1.8, A_(-1.72,5,3,6,-55,55)],
  '/': [4.4, [0,10.4,4.4,-.4]],
  '?': [5.4, S(.3,2.3,1.3,.4,3,0,4.7,.6,5.3,2.3,4.5,4,2.9,5,2.7,7), Dt(2.75,9.4)],
  '!': [1.2, [.6,0,.6,7], Dt(.6,9.4)],
  '+': [6, [0,5,6,5], [3,2,3,8]],
  '^': [5, [0,6,2.5,0,5,6]],
  ' ': [3.4],
};
const GL = {};
for (const ch in RAW) {
  const [w, ...strokes] = RAW[ch];
  const s = strokes.map(st => {
    if (st.d) return { pts: st.d, len: .6, dot: true };
    const pts = st.c ? catmull(st.c, 4) : st;
    let len = 0; for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i-2], pts[i+1] - pts[i-1]);
    return { pts, len };
  });
  GL[ch] = { w, s, len: s.reduce((a, b) => a + b.len, 0) };
}
function tw(str, size, track = 1.8) {
  let adv = 0; for (const ch of str.toUpperCase()) adv += (GL[ch] || GL['?']).w + track;
  return (adv - track) * size / 10;
}
// Lay text out; returns glyph boxes so animation can find the pen.
function say(ink, str, x, y, size, o = {}) {
  const c = LY[ink]; str = str.toUpperCase();
  const sc = size / 10, track = o.track ?? 1.8, w = o.w ?? Math.max(.85, size * .115);
  const width = tw(str, size, track);
  const ox = o.align === 'center' ? x - width / 2 : o.align === 'right' ? x - width : x;
  let total = 0; const items = []; let adv = 0;
  for (const ch of str) { const g = GL[ch] || GL['?']; items.push({ g, x: adv }); adv += g.w + track; total += g.len; }
  const rv = (o.reveal ?? 1) * total; let acc = 0;
  const seed = o.seed ?? hstr(str);
  const gj = o.gj ?? 1;
  let cursor = null;
  c.beginPath();
  for (let i = 0; i < items.length; i++) {
    const it = items[i]; if (acc >= rv) break;
    const r = rng(seed * 31 + i * 7919);
    const gr = gj * (r() - .5) * .1, gdy = gj * (r() - .5) * .9, gs = 1 + gj * (r() - .5) * .09;
    const gx = ox + it.x * sc, cx = it.g.w / 2, cy = 5, cs = Math.cos(gr), sn = Math.sin(gr);
    for (let si = 0; si < it.g.s.length; si++) {
      const st = it.g.s[si];
      if (acc >= rv) break;
      const frac = Math.min(1, (rv - acc) / Math.max(st.len, 1e-3)); acc += st.len;
      const p = new Array(st.pts.length);
      for (let k = 0; k < st.pts.length; k += 2) {
        const px = (st.pts[k] - cx) * gs, py = (st.pts[k+1] - cy) * gs;
        p[k] = gx + (px * cs - py * sn + cx) * sc; p[k+1] = y + (px * sn + py * cs + cy + gdy) * sc;
      }
      if (st.dot) { const rr = w * .62; c.moveTo(p[0] + rr, p[1]); c.arc(p[0], p[1], rr, 0, TAU); cursor = [p[0], p[1]]; continue; }
      penPath(c, p, { w, wob: o.wob ?? Math.max(.12, size * .028), seed: seed * 7 + i * 13 + si * 3 + BOIL * 101, reveal: frac, ta: size * .08, tb: size * .14, jit: 0, freq: .22, step: Math.max(.5, size * .08) });
      if (frac < 1) { const q = Math.floor((p.length / 2 - 1) * frac) * 2; cursor = [p[q], p[q+1]]; }
      else cursor = [p[p.length-2], p[p.length-1]];
    }
  }
  c.fillStyle = '#000'; c.fill();
  return { width, x0: ox, cursor };
}

/* extra glyphs the essay figures need */
(() => {
  const extra = {
    '%': [6.4, [0, 10, 6.4, 0], A_(1.4, 1.8, 1.4, 1.8, 0, 360, 12), A_(5, 8.2, 1.4, 1.8, 0, 360, 12)],
    '=': [5, [0, 3.8, 5, 3.8], [0, 7, 5, 7]],
    '>': [4.6, [0, 2, 4.6, 5.4, 0, 8.8]],
    '<': [4.6, [4.6, 2, 0, 5.4, 4.6, 8.8]],
    '&': [6.6, S(6.4, 10, 1.6, 3.6, 1.6, 1.2, 3.2, 0, 4.6, 1.2, 4.4, 2.8, 1.2, 5.6, .2, 7.8, 1.4, 9.8, 3.4, 10, 5.4, 8.6, 6.6, 6.4)],
    '·': [1.6, Dt(.8, 5.2)],
    '×': [5, [0, 2.6, 5, 7.6], [5, 2.6, 0, 7.6]],
  };
  for (const ch in extra) {
    const [w, ...strokes] = extra[ch];
    const s = strokes.map(st => {
      if (st.d) return { pts: st.d, len: .6, dot: true };
      const pts = st.c ? catmull(st.c, 4) : st;
      let len = 0; for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
      return { pts, len };
    });
    GL[ch] = { w, s, len: s.reduce((a, b) => a + b.len, 0) };
  }
})();

/* small shared marks */
function arrowAt(ink, x, y, a, L = 10, w = 1.8, seed = 9) {
  line(ink, [x + Math.cos(a + 2.55) * L, y + Math.sin(a + 2.55) * L, x, y, x + Math.cos(a - 2.55) * L, y + Math.sin(a - 2.55) * L], { w, seed });
}

/* ============================================================== the press */
let SPECK = null;
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function speck() { if (!SPECK) buildSpeck(); return SPECK; }
function buildSpeck() {
  const n = 160, c = mk(n, n), g = c.getContext('2d'), id = g.createImageData(n, n), r = rng(9091);
  for (let i = 0; i < n * n; i++) { const v = r(); id.data[i * 4 + 3] = v < .07 ? 120 + r() * 135 : v < .2 ? r() * 60 : 0; }
  g.putImageData(id, 0, 0);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(0,0,0,${.2 + r() * .4})`; g.beginPath(); g.arc(r() * n, r() * n, .6 + r() * 1.4, 0, TAU); g.fill(); }
  SPECK = c;
}

function roughen(ink, pts, a) {
  const c = LY[ink]; c.save(); c.beginPath(); blobPath(c, pts, { wob: 0 }); c.clip();
  c.globalCompositeOperation = 'destination-out'; c.globalAlpha = a;
  const p = c.createPattern(speck(), 'repeat'); p.setTransform(new DOMMatrix().translate(BOIL * 41, BOIL * 23));
  const m = c.getTransform(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = p; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.setTransform(m);
  c.restore();
}

/* A Press owns one figure canvas: paper, three static ink caches (one per
   boil drawing) and three dynamic layers. Figures supply drawStatic(lay) and
   drawDynamic(lay) and call press.frame(). */
export class Press {
  constructor(canvas, layoutFor, drawStatic, seed = 1) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.layoutFor = layoutFor; this.drawStatic = drawStatic; this.seed = seed;
    this.DYN = {}; this.STAT = [{}, {}, {}];
  }
  resize() {
    const wCss = Math.max(280, Math.round(this.cv.parentElement.clientWidth));
    this.lay = this.layoutFor(wCss);
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    this.DPR = DPR;
    const hCss = Math.round(wCss * this.lay.H / this.lay.W);
    this.cv.style.height = hCss + 'px';
    this.wCss = wCss; this.hCss = hCss;
    const PW = this.PW = Math.round(wCss * DPR), PH = this.PH = Math.round(hCss * DPR);
    this.cv.width = PW; this.cv.height = PH;
    this.K = PW / this.lay.W;
    this.cell = Math.max(3, Math.round(4.3 * DPR * (this.lay.cellK || 1)));
    for (const k of ORDER) this.DYN[k] = mk(PW, PH);
    this.buildPaper();
    this.rebuildStatic();
  }
  rebuildStatic() {
    CELL = this.cell;
    for (let b = 0; b < 3; b++) {
      for (const k of ORDER) this.STAT[b][k] = mk(this.PW, this.PH);
      LY = this.layers(this.STAT[b]); BOIL = b;
      for (const k in LY) LY[k].setTransform(this.K, 0, 0, this.K, 0, 0);
      this.drawStatic(this.lay);
    }
  }
  layers(set) { return { B: set.B.getContext('2d'), P: set.P.getContext('2d'), Y: set.Y.getContext('2d') }; }
  buildPaper() {
    const PW = this.PW, PH = this.PH, DPR = this.DPR;
    const P = this.paper = mk(PW, PH), g = P.getContext('2d');
    g.fillStyle = PAPER; g.fillRect(0, 0, PW, PH);
    const id = g.getImageData(0, 0, PW, PH), d = id.data, r = rng(4242 + this.seed);
    for (let i = 0; i < d.length; i += 4) { const v = (r() - .5) * 9; d[i] += v; d[i + 1] += v; d[i + 2] += v * .9; }
    g.putImageData(id, 0, 0);
    const fr = rng(77 + this.seed);
    for (let i = 0; i < PW * PH / 900; i++) {
      const x = fr() * PW, y = fr() * PH, a = fr() * TAU, l = (3 + fr() * 9) * DPR;
      g.strokeStyle = fr() < .5 ? `rgba(120,105,80,${.05 + fr() * .06})` : `rgba(255,255,250,${.18 + fr() * .2})`;
      g.lineWidth = (.4 + fr() * .5) * DPR; g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a + .5) * l * .5, y + Math.sin(a + .5) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    const mw = 96, mh = Math.max(8, Math.round(96 * PH / PW));
    const M = this.mottle = mk(mw, mh), mg = M.getContext('2d'), mid = mg.createImageData(mw, mh);
    const so = this.seed * 1.7;
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const v = nz(x * .23 + so, 3) * .5 + nz(x * .07 + y * .19 + so, 5) * .3 + nz(y * .3 + x * .05, 8) * .35;
      mid.data[(y * mw + x) * 4 + 3] = clamp(v * .5 + .22) * 120;
    }
    mg.putImageData(mid, 0, 0);
  }
  frame(boil, drawDynamic) {
    BOIL = boil; CELL = this.cell;
    for (const k of ORDER) {
      const c = this.DYN[k].getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
      c.clearRect(0, 0, this.PW, this.PH); c.drawImage(this.STAT[boil][k], 0, 0);
      c.setTransform(this.K, 0, 0, this.K, 0, 0);
    }
    LY = this.layers(this.DYN);
    drawDynamic(this.lay);
    this.composite(boil);
  }
  composite(boil) {
    const main = this.ctx, PW = this.PW, PH = this.PH, DPR = this.DPR;
    main.setTransform(1, 0, 0, 1, 0, 0);
    main.globalCompositeOperation = 'source-over'; main.globalAlpha = 1;
    main.drawImage(this.paper, 0, 0);
    for (const k of ORDER) {
      const c = this.DYN[k].getContext('2d'), idx = ORDER.indexOf(k);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = 'destination-out'; c.globalAlpha = .62;
      const p = c.createPattern(speck(), 'repeat');
      p.setTransform(new DOMMatrix().translate((boil * 53 + idx * 71 + this.seed * 13) % 160, (boil * 29 + idx * 37) % 160).scale(DPR * .75));
      c.fillStyle = p; c.fillRect(0, 0, PW, PH);
      c.globalAlpha = 1;
      c.save(); if (idx === 1) { c.translate(PW, 0); c.scale(-1, 1); } if (idx === 2) { c.translate(0, PH); c.scale(1, -1); }
      c.drawImage(this.mottle, 0, 0, PW, PH); c.restore();
      c.globalCompositeOperation = 'source-in'; c.fillStyle = INK[k]; c.fillRect(0, 0, PW, PH);
      c.globalCompositeOperation = 'source-over';
      main.globalCompositeOperation = 'multiply';
      main.globalAlpha = k === 'Y' ? .96 : .93;
      main.drawImage(this.DYN[k], REG[k][0] * DPR, REG[k][1] * DPR);
    }
    main.globalCompositeOperation = 'source-over'; main.globalAlpha = 1;
  }
  /* pointer → layout coordinates */
  toLay(e) {
    const r = this.cv.getBoundingClientRect();
    return [(e.clientX - r.left) * this.lay.W / r.width, (e.clientY - r.top) * this.lay.H / r.height];
  }
}

/* Transparent, focusable hit buttons laid over a canvas in layout units. */
function placeHit(btn, lay, x, y, w, h) {
  btn.style.left = (x / lay.W * 100) + '%';
  btn.style.top = (y / lay.H * 100) + '%';
  btn.style.width = (w / lay.W * 100) + '%';
  btn.style.height = (h / lay.H * 100) + '%';
}

/* ============================================================ the clock */
/* Review hooks, namespaced so they never collide with ordinary links:
   ?fig-t=<s> freezes every figure at that moment (no clock), and the figures
   read ?fig-f1, ?fig-tk, ?fig-f2, ?fig-sel and ?fig-hint for specific states. */
export function reviewParams() {
  const q = new URLSearchParams(window.location.search);
  const get = k => q.get('fig-' + k);
  const t = get('t');
  return { fixedT: t !== null && t !== '' && !Number.isNaN(parseFloat(t)) ? parseFloat(t) : null, get, has: k => q.has('fig-' + k) };
}
let MQ = null;
export function prefersReducedMotion() {
  if (!window.matchMedia) return false;
  if (!MQ) MQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  return MQ.matches;
}

const FIGS = new Set();
let RAF = 0, T0 = null, PAGE_VISIBLE = true, VIS_BOUND = false;
function onVisibility() { PAGE_VISIBLE = !document.hidden; for (const f of FIGS) f.prev = null; }
function tick(now) {
  if (T0 === null) T0 = now;
  const boil = prefersReducedMotion() ? 0 : Math.floor((now - T0) / 125) % 3;
  for (const f of FIGS) {
    if (f.frozen || !f.visible || !PAGE_VISIBLE) { f.prev = null; continue; }
    const dt = f.prev === null ? 0 : Math.min(.1, (now - f.prev) / 1000);
    f.prev = now;
    f.update(dt);
    if (f.dirty || f.drawnBoil !== boil) { f.draw(boil); f.drawnBoil = boil; f.dirty = false; }
  }
  RAF = FIGS.size ? requestAnimationFrame(tick) : 0;
}

/* fig: { el, update(dt), draw(boil), dirty, onShow?, frozen? }
   Only visible figures animate, and nothing animates while the tab is hidden.
   Returns an unregister function for cleanup. */
export function registerFigure(fig) {
  fig.visible = false; fig.drawnBoil = -1; fig.prev = null;
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(es => { for (const e of es) { fig.visible = e.isIntersecting; if (fig.visible && fig.onShow) fig.onShow(); } }, { rootMargin: '120px 0px' });
    io.observe(fig.el);
  } else { fig.visible = true; if (fig.onShow) fig.onShow(); }
  FIGS.add(fig);
  if (!VIS_BOUND) { document.addEventListener('visibilitychange', onVisibility); VIS_BOUND = true; PAGE_VISIBLE = !document.hidden; }
  if (!RAF) { T0 = null; RAF = requestAnimationFrame(tick); }
  return () => {
    if (io) io.disconnect();
    FIGS.delete(fig);
    if (!FIGS.size) {
      if (RAF) cancelAnimationFrame(RAF);
      RAF = 0;
      document.removeEventListener('visibilitychange', onVisibility); VIS_BOUND = false;
    }
  };
}

export {
  TAU, clamp, lerp, seg, eio, eout, eback, inR, h1, rng, hstr, bez, bezPts, bezTan,
  catmull, arcPts, ellPts, rectPts, superPts,
  tsave, trest, ttr, trot, tsc, tclipRect, penPath, line, blobPath, solid, tone, knock, punch, outline, tonePat,
  tw, say, arrowAt, roughen, placeHit,
};
