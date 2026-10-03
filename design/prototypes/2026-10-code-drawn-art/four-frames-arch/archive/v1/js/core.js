/* Four frames: numbers, noise, colour, canvases, and the San Jose sky.
   Everything here is pure and shared by the drawing modules. */

export const TAU = Math.PI * 2, PI = Math.PI, DEG = PI / 180;

/* ───────── numbers ───────── */
export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function hash2(ix, iy, s) {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(s | 0, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export function vnoise(x, y, s = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export function fbm(x, y, s = 0, oct = 4) {
  let v = 0, a = .5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { v += a * vnoise(x * f, y * f, s + i * 17); n += a; a *= .5; f *= 2.03; }
  return v / n;
}
export const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const fract = v => v - Math.floor(v);

/* ───────── colour ───────── */
/** [r, g, b] (or [r, g, b, a] for rgba() strings) from '#rgb', '#rrggbb' or 'rgba(…)'. */
export function rgb(str) {
  if (str[0] !== '#') {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (m) { const v = m[1].split(',').map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; }
  }
  const h = str.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
export function mix(a, b, t) {
  const A = typeof a === 'string' ? rgb(a) : a, B = typeof b === 'string' ? rgb(b) : b;
  const out = [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)];
  if (A.length > 3 || B.length > 3) out.push(lerp(A[3] ?? 1, B[3] ?? 1, t));
  return out;
}
export function css(c, a = 1) {
  const C = typeof c === 'string' ? rgb(c) : c;
  return `rgba(${C[0] | 0},${C[1] | 0},${C[2] | 0},${(C[3] ?? 1) * a})`;
}
/** Relative luminance (WCAG) of an sRGB triple 0–255. */
export function luminance(c) {
  const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]);
}

/* ───────── canvases ───────── */
export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

/* ───────── San Jose time ───────── */
const SJ = { lat: 37.3382, lon: -121.8863, tz: 'America/Los_Angeles' };
function laParts(date) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: SJ.tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
  const o = {}; for (const p of f.formatToParts(date)) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, min: +o.minute, s: +o.second };
}
function laOffsetMinutes(date) {
  const p = laParts(date);
  return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - date.getTime()) / 60000);
}
/** The moment the San Jose desk shows: now, or today at `hour` (0–24) in San Jose. */
export function sceneDate(hour) {
  const now = new Date();
  if (hour == null || Number.isNaN(hour)) return now;
  const p = laParts(now), off = laOffsetMinutes(now);
  const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60);
  return new Date(Date.UTC(p.y, p.m - 1, p.d, hh, mm) - off * 60000);
}
export function clockLabel(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: SJ.tz, hour: 'numeric', minute: '2-digit' }).format(date).toLowerCase().replace(/\s/g, ' ');
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
  const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(H));
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
  return { ...pos, phase: fract((jd - 2451550.1) / 29.530588853) };
}
/** Everything the painted present needs to know about the light at `date`. */
export function skyState(date) {
  const sun = sunPosition(date), moon = moonPosition(date), e = sun.el;
  return {
    sun, moon,
    night: smooth(-1, -14, e),
    twilight: smooth(-9, -1, e) * (1 - smooth(4, 14, e)),
    golden: smooth(-1, 3, e) * (1 - smooth(10, 22, e)),
    day: smooth(2, 18, e),
    lamp: smooth(6, -1, e),
    stars: smooth(-4, -13, e),
  };
}
