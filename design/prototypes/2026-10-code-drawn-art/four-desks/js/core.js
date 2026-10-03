'use strict';
/* Four desks: shared numbers, noise, colour, San Jose time, sun and moon, layouts.
   Every scene is designed in its layout's units (wide 1600×1000, tall 1000×1250) and drawn
   at device resolution through a single scale factor. */

const QS = new URLSearchParams(location.search);
const FIXED_T = QS.has('t') ? (parseFloat(QS.get('t')) || 0) : null;
const HOUR_OVERRIDE = QS.has('hour') ? parseFloat(QS.get('hour')) : null;
const ERA_JUMP = QS.get('era');
const ROLL_JUMP = QS.has('roll') ? parseFloat(QS.get('roll')) : null;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEBUG = QS.has('debug');
const TAU = Math.PI * 2, PI = Math.PI, DEG = PI / 180;

/* ───────── numbers ───────── */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(ix, iy, s) { let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(s | 0, 982451653); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y, s = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x, y, s = 0, oct = 4) { let v = 0, a = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += a * vnoise(x * f, y * f, s + i * 17); n += a; a *= .5; f *= 2.03; } return v / n; }
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const fract = v => v - Math.floor(v);

/* ───────── colour ───────── */
function rgb(hex) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function hex(c) { return '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = typeof a === 'string' ? rgb(a) : a, B = typeof b === 'string' ? rgb(b) : b; return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; }
function css(c, a = 1) { const C = typeof c === 'string' ? rgb(c) : c; return `rgba(${C[0] | 0},${C[1] | 0},${C[2] | 0},${a})`; }
function gradientStops(stops, t) { // stops: [[t, colour], ...] ascending
  if (t <= stops[0][0]) return rgb(stops[0][1]);
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  return rgb(stops[stops.length - 1][1]);
}

/* ───────── canvases ───────── */
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
function ctx2d(c, opts) { return c.getContext('2d', opts); }

/* ───────── geometry helpers ───────── */
function poly(x, pts, close = true) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); if (close) x.closePath(); }
function rr(x, X, Y, W, H, R) { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); }
function wobblePts(pts, amp, freq, seed) {
  const out = []; let s = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = (vnoise(s * freq, seed, 3) - .5) * 2 * amp;
    out.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]);
  }
  return out;
}
function resample(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(l / step));
    for (let k = 1; k <= n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  }
  return out;
}
function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; }

/* ───────── San Jose time ───────── */
const SJ = { lat: 37.3382, lon: -121.8863, tz: 'America/Los_Angeles' };
function laParts(date) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: SJ.tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
  const o = {}; for (const p of f.formatToParts(date)) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, min: +o.minute, s: +o.second };
}
function laOffsetMinutes(date) { // LA wall time minus UTC, in minutes
  const p = laParts(date);
  const asUTC = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s);
  return Math.round((asUTC - date.getTime()) / 60000);
}
/** The moment the scene shows: real now, or today at ?hour= in San Jose. */
function sceneDate() {
  const now = new Date();
  if (HOUR_OVERRIDE == null || isNaN(HOUR_OVERRIDE)) return now;
  const p = laParts(now), off = laOffsetMinutes(now);
  const hh = Math.floor(HOUR_OVERRIDE), mm = Math.round((HOUR_OVERRIDE - hh) * 60);
  return new Date(Date.UTC(p.y, p.m - 1, p.d, hh, mm) - off * 60000);
}
function clockLabel(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: SJ.tz, hour: 'numeric', minute: '2-digit' }).format(date).toLowerCase().replace(' ', ' ');
}

/* Sun position (NOAA-style approximation; good to a fraction of a degree). */
function sunPosition(date) {
  const jd = date.getTime() / 86400000 + 2440587.5, n = jd - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360, g = ((357.528 + 0.9856003 * n) % 360) * DEG;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG, eps = (23.439 - 0.0000004 * n) * DEG;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)), dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  return equatorialToHorizontal(ra, dec, jd);
}
function equatorialToHorizontal(ra, dec, jd) {
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360;
  const lst = (gmst + SJ.lon) * DEG, H = lst - ra, lat = SJ.lat * DEG;
  const el = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(H)); // from north, clockwise
  return { el: el / DEG, az: ((az / DEG) + 360) % 360 };
}
/* Moon: low-precision position and phase, enough to place it in a window. */
function moonPosition(date) {
  const jd = date.getTime() / 86400000 + 2440587.5, d = jd - 2451545.0;
  const L = (218.316 + 13.176396 * d) * DEG, M = (134.963 + 13.064993 * d) * DEG, F = (93.272 + 13.229350 * d) * DEG;
  const lon = L + 6.289 * DEG * Math.sin(M), lat = 5.128 * DEG * Math.sin(F), eps = 23.439 * DEG;
  const ra = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon));
  const dec = Math.asin(Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon));
  const pos = equatorialToHorizontal(ra, dec, jd);
  const phase = fract((jd - 2451550.1) / 29.530588853); // 0 new, .5 full
  return { ...pos, phase };
}
/** Everything the painted present needs to know about the light right now. */
function skyState(date) {
  const sun = sunPosition(date), moon = moonPosition(date), e = sun.el;
  const night = smooth(-1, -14, e);          // 0 day → 1 deep night
  const twilight = smooth(-9, -1, e) * (1 - smooth(4, 14, e)); // dusk/dawn colour
  const golden = smooth(-1, 3, e) * (1 - smooth(10, 22, e));
  const day = smooth(2, 18, e);
  const morning = sun.az < 180;
  return { sun, moon, night, twilight, golden, day, morning, lamp: smooth(6, -1, e), stars: smooth(-4, -13, e) };
}

/* ───────── layouts ─────────
   Two compositions of the same room. Everything that stays put across the four eras
   lives here: the window, the pinboard, the lamp and the desk. */
const LAYOUTS = {
  wide: {
    W: 1600, H: 1000,
    win: { x: 688, y: 92, w: 564, h: 498, frame: 22, transom: .34 },
    sill: { y: 590, h: 24, over: 26 },
    pin: { x: 196, y: 150, w: 384, h: 304 },
    deskY: 652, frontY: 938, frontT: 34,
    lamp: { clamp: [612, 652], elbow: [530, 352], head: [742, 446] },
    center: [962, 906], left: [214, 896], right: [1296, 868], far: [1452, 872],
    vp: [962, 420], os: 1.12,
  },
  tall: {
    W: 1000, H: 1250,
    win: { x: 372, y: 118, w: 556, h: 500, frame: 22, transom: .34 },
    sill: { y: 618, h: 24, over: 22 },
    pin: { x: 30, y: 196, w: 312, h: 276 },
    deskY: 690, frontY: 1176, frontT: 34,
    lamp: { clamp: [336, 690], elbow: [276, 424], head: [440, 514] },
    center: [600, 1128], left: [24, 1112], right: [872, 1088], far: [1036, 1080],
    vp: [650, 470], os: 1.08,
  },
};
