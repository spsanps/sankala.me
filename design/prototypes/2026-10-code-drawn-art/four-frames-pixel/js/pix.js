/* Four frames, pixel edition: the toolkit.
   Everything is drawn into indexed sprites on a low-resolution grid. A pixel holds a material and
   a step on that material's ramp (0 = deepest shade … 4 = brightest), never a colour. Colour is
   decided when a sprite is baked, from one palette per light (day, golden hour, night, lamplight…),
   so the light can change without a single new colour being invented by blending. No transforms,
   no anti-aliasing: every mark lands on a whole pixel. */

/* ───────── ramps ─────────
   Five hand-picked steps each, dark → light. Shadows lean cool and toward violet; lights lean warm
   and toward yellow. 18 ramps · 5 steps = 90 colours per light. */
export const RAMPS = {
  ink:     ['#1b1622', '#2b2232', '#3d3141', '#574859', '#7a6a78'],
  wall:    ['#5a6a63', '#86957f', '#adb99e', '#cdd5bb', '#e3e8d3'],
  wood:    ['#4a2a28', '#7a4431', '#a9663c', '#cf8f50', '#e8b878'],
  cream:   ['#8a8478', '#b0aa98', '#d3ccb8', '#ece6d3', '#fbf8ec'],
  cork:    ['#5f3e2a', '#87603b', '#ad8550', '#cba46b', '#e2c690'],
  red:     ['#4e1a26', '#86282c', '#bb4234', '#e06b48', '#f4a37c'],
  cobalt:  ['#1a1e48', '#25368a', '#3557c2', '#6283de', '#a6bdf3'],
  steel:   ['#262833', '#454959', '#6e7486', '#9ea5b4', '#d2d6de'],
  screen:  ['#11141d', '#1c2331', '#2c3a52', '#466081', '#7593bb'],
  leaf:    ['#16302a', '#244d36', '#3c7442', '#6aa04f', '#a9cd72'],
  sky:     ['#4f86c0', '#73a7d8', '#9cc6e8', '#c4e0f2', '#e8f4f7'],
  hill:    ['#6c4c42', '#93694f', '#b98f68', '#d6b388', '#ecd5aa'],
  roof:    ['#5f2a26', '#93402f', '#bf613d', '#dc8a5b', '#efb98c'],
  gold:    ['#5e3f17', '#97691f', '#c99932', '#e8c35b', '#f7e3a0'],
  sea:     ['#14283d', '#1d4560', '#286784', '#3f8eaa', '#7fbfd0'],
  stone:   ['#4f4c55', '#78747f', '#9f9ba4', '#c3bfc5', '#e4e1e3'],
  flame:   ['#6a2414', '#a83c1c', '#d9602a', '#f08e45', '#fac47c'],
  mint:    ['#0f2a23', '#16473a', '#24745a', '#4fb88a', '#b8f2cf'],
};
export const MATS = Object.keys(RAMPS);
const MAT_INDEX = Object.fromEntries(MATS.map((m, i) => [m, i]));
/** The value stored in a sprite for material `m` at ramp step `l` (0 is transparent). */
export const C = (m, l) => MAT_INDEX[m] * 5 + Math.max(0, Math.min(4, l)) + 1;
export const matOf = v => MATS[((v - 1) / 5) | 0];
export const lvlOf = v => (v - 1) % 5;

/* ───────── light ─────────
   Each light is one deliberate transform of every ramp, done in OKLab and then frozen into a
   256-entry table: the palette for that light. */
function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
const toLin = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
const toSrgb = v => { v = v <= .0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - .055; return Math.max(0, Math.min(255, Math.round(v * 255))); };
function oklab([r, g, b]) {
  r = toLin(r); g = toLin(g); b = toLin(b);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .7936177850 * m - .0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .8086757660 * s];
}
function fromOklab([L, a, b]) {
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.2914855480 * b) ** 3;
  return [toSrgb(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s), toSrgb(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s), toSrgb(-.0041960863 * l - .7034186147 * m + 1.7076127010 * s)];
}
const LIGHTS = {
  day: ([L, a, b]) => [L, a, b],
  // window light falling on a surface: brighter and a touch warmer
  sun: ([L, a, b]) => [Math.min(.97, L * 1.06 + .045), a + .004, b + .022],
  golden: ([L, a, b]) => [L * .96, a + .009, b + .024],
  goldsun: ([L, a, b]) => [Math.min(.95, L * 1.03 + .04), a + .018, b + .048],
  // a heavy sky before the rain: warm, muted
  overcast: ([L, a, b]) => [L * .93 + .012, a * .82 + .005, b * .8 + .016],
  warmsun: ([L, a, b]) => [Math.min(.95, L * 1.02 + .035), a * .9 + .012, b * .9 + .036],
  twilight: ([L, a, b]) => [L * .72 + .02, a * .7 + .012, b * .55 - .04],
  night: ([L, a, b]) => [L * .5 + .045, a * .45 + .008, b * .4 - .05],
  // lamplight: warm and orange, a little darker than day
  lamp: ([L, a, b]) => [L * .86 + .03, a * .8 + .022, b * .75 + .058],
  // the cool spill of a screen at night
  glow: ([L, a, b]) => [L * .6 + .1, a * .5 - .02, b * .5 - .045],
  // the phosphor-green spill of an oscilloscope at night
  phosphor: ([L, a, b]) => [L * .58 + .1, a * .4 - .055, b * .45 + .02],
};
const PAL_CACHE = {};
/** The 256-entry RGBA table for one light. */
export function palette(light) {
  if (PAL_CACHE[light]) return PAL_CACHE[light];
  const f = LIGHTS[light], out = new Uint8ClampedArray(256 * 4);
  MATS.forEach((m, mi) => RAMPS[m].forEach((h, l) => {
    const v = mi * 5 + l + 1, c = fromOklab(f(oklab(hex(h))));
    out.set([c[0], c[1], c[2], 255], v * 4);
  }));
  return (PAL_CACHE[light] = out);
}
export function rgbOf(light, v) { const p = palette(light); return [p[v * 4], p[v * 4 + 1], p[v * 4 + 2]]; }

/* ───────── ordered dithering ───────── */
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Threshold in [0, 1) for the 4 × 4 Bayer matrix at (x, y). */
export const bayer = (x, y) => (B4[((y & 3) << 2) | (x & 3)] + .5) / 16;

/* ───────── seeded numbers ───────── */
export function rng(seed) {
  let a = seed | 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function hash(x, y, s = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/* ───────── the indexed sprite ───────── */
export class Spr {
  constructor(w, h) { this.w = Math.max(1, w | 0); this.h = Math.max(1, h | 0); this.d = new Uint8Array(this.w * this.h); }
  get(x, y) { x = Math.floor(x); y = Math.floor(y); return x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : this.d[y * this.w + x]; }
  set(x, y, v) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = v; }
  /** set only where something is already drawn */
  over(x, y, v) { if (this.get(x, y)) this.set(x, y, v); }
  rect(x, y, w, h, v) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) this.d[j * this.w + i] = v;
    return this;
  }
  hl(x0, x1, y, v) { if (x1 < x0) [x0, x1] = [x1, x0]; for (let x = Math.round(x0); x <= Math.round(x1); x++) this.set(x, y, v); }
  vl(x, y0, y1, v) { if (y1 < y0) [y0, y1] = [y1, y0]; for (let y = Math.round(y0); y <= Math.round(y1); y++) this.set(x, y, v); }
  /** A one-pixel line with no doubled corners (pixel-perfect Bresenham). */
  line(x0, y0, x1, y1, v) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, x = x0, y = y0;
    for (;;) { pts.push([x, y]); if (x === x1 && y === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x += sx; } if (e2 <= dx) { err += dx; y += sy; } }
    // drop the middle pixel of every L-shaped elbow
    for (let i = 0; i < pts.length; i++) {
      if (i > 0 && i < pts.length - 1) {
        const [ax, ay] = pts[i - 1], [cx, cy] = pts[i + 1], [bx, by] = pts[i];
        if ((ax === bx || ay === by) && (cx === bx || cy === by) && ax !== cx && ay !== cy) { pts.splice(i, 1); i--; continue; }
      }
    }
    for (const [px, py] of pts) this.set(px, py, v);
  }
  /** Thick line: a run of square stamps. */
  thick(x0, y0, x1, y1, w, v) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))), r = (w - 1) / 2;
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; this.rect(Math.round(x - r), Math.round(y - r), w, w, v); }
  }
  /** Scan-filled polygon; pixel centres decide. */
  poly(pts, v) {
    let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const cy = y + .5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + (cy - ay) / (by - ay) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - .5); x <= Math.floor(xs[k + 1] - .5); x++) this.set(x, y, v);
    }
    return this;
  }
  ellipse(cx, cy, rx, ry, v) {
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) this.set(x, y, v);
    }
    return this;
  }
  disc(cx, cy, r, v) { return this.ellipse(cx, cy, r, r, v); }
  /** Outline of an ellipse, one pixel. */
  ring(cx, cy, rx, ry, v) {
    const inside = (x, y) => { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; return dx * dx + dy * dy <= 1; };
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++)
      if (inside(x, y) && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) this.set(x, y, v);
  }
  /** Ordered-dither a rectangle with v where the Bayer threshold is below `density`. */
  dither(x, y, w, h, v, density, onlyOver = false) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (bayer(i, j) < density) { if (onlyOver) this.over(i, j, v); else this.set(i, j, v); }
  }
  /** Copy another sprite in (transparent pixels skipped). */
  blit(s, ox, oy) {
    ox = Math.round(ox); oy = Math.round(oy);
    for (let y = 0; y < s.h; y++) { const ty = y + oy; if (ty < 0 || ty >= this.h) continue; for (let x = 0; x < s.w; x++) { const v = s.d[y * s.w + x]; if (!v) continue; const tx = x + ox; if (tx < 0 || tx >= this.w) continue; this.d[ty * this.w + tx] = v; } }
    return this;
  }
  /** Re-colour every drawn pixel through fn(v, x, y) → v. */
  map(fn) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const i = y * this.w + x, v = this.d[i]; if (v) this.d[i] = fn(v, x, y) || 0; } return this; }
  /** Selective outline: every empty pixel touching the shape takes the darkest step of the
      material it touches (or `v` if given). `sides` limits it, e.g. 'b' for a ground line. */
  outline(v, sides = 'lrtb') {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.d[y * this.w + x]) continue;
      let n = 0;
      if (sides.includes('l') && (n = this.get(x + 1, y))) { add.push([x, y, n]); continue; }
      if (sides.includes('r') && (n = this.get(x - 1, y))) { add.push([x, y, n]); continue; }
      if (sides.includes('t') && (n = this.get(x, y + 1))) { add.push([x, y, n]); continue; }
      if (sides.includes('b') && (n = this.get(x, y - 1))) { add.push([x, y, n]); continue; }
    }
    for (const [x, y, n] of add) this.set(x, y, v != null ? v : C(matOf(n), 0));
    return this;
  }
  clone() { const s = new Spr(this.w, this.h); s.d.set(this.d); return s; }
}

/* ───────── baking ─────────
   A sprite becomes pixels: each value is looked up in the palette of the light that falls on it.
   `light(x, y)` returns a light name for the scene pixel (or null for the ambient light). */
export function bake(s, ambient, light, ox = 0, oy = 0) {
  const cv = document.createElement('canvas'); cv.width = s.w; cv.height = s.h;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(s.w, s.h), D = img.data;
  const base = palette(ambient);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
    const v = s.d[y * s.w + x]; if (!v) continue;
    const l = light ? light(x + ox, y + oy) : null, p = l ? palette(l) : base, i = (y * s.w + x) * 4;
    D[i] = p[v * 4]; D[i + 1] = p[v * 4 + 1]; D[i + 2] = p[v * 4 + 2]; D[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}
