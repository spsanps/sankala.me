/* The apse in mosaic: numbers, noise and colour. Pure, and shared by every drawing module. */

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
