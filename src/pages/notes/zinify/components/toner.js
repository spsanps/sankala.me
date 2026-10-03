/*
 * toner.js — the photocopier.
 *
 * Every picture in this figure is first drawn as a plain greyscale "master" (white paper,
 * grey and black shapes), then run through copy(): the master is read the way an office
 * copier reads it, and comes back as a layer of black toner.
 *
 *   - solids stay solid, with a few white drop-outs where the toner skipped;
 *   - greys become a coarse, broken dot screen (photo mode on a cheap copier);
 *   - thin lines thicken a little (dot gain) and edges go slightly ragged;
 *   - loose toner specks land everywhere, and a dirty drum leaves faint streaks;
 *   - each generation (a copy of a copy) is a little blurrier, darker, skewed and grittier.
 *
 * Nothing here is a filter over a finished image: the masters are drawn for this press.
 */

export const TONER = [21, 20, 19];

// Fast integer hash → [0, 1). Deterministic per (x, y, seed).
export function hash(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Smooth value noise at a given cell size, for uneven toner density.
function valueNoise(x, y, cell, seed) {
  const gx = x / cell, gy = y / cell, x0 = Math.floor(gx), y0 = Math.floor(gy);
  const fx = gx - x0, fy = gy - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, seed), b = hash(x0 + 1, y0, seed), c = hash(x0, y0 + 1, seed), d = hash(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}

// Separable box blur on a Float32Array, in place (two passes ≈ a soft gaussian).
function boxBlur(src, w, h, r) {
  if (r < 0.5) return src;
  const rad = Math.max(1, Math.round(r)), tmp = new Float32Array(src.length), inv = 1 / (rad * 2 + 1);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w; let acc = 0;
      for (let i = -rad; i <= rad; i++) acc += src[row + Math.min(w - 1, Math.max(0, i))];
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc * inv;
        acc += src[row + Math.min(w - 1, x + rad + 1)] - src[row + Math.max(0, x - rad)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -rad; i <= rad; i++) acc += tmp[Math.min(h - 1, Math.max(0, i)) * w + x];
      for (let y = 0; y < h; y++) {
        src[y * w + x] = acc * inv;
        acc += tmp[Math.min(h - 1, y + rad + 1) * w + x] - tmp[Math.max(0, y - rad) * w + x];
      }
    }
  }
  return src;
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

/*
 * copy(master, opts) → a canvas the same size, transparent except for toner.
 *   px    pixels per design unit (sets the screen size, grit size and blur)
 *   gen   1 = first copy; 2+ = copies of copies
 *   seed  which copy this is (specks and streaks differ per copy)
 *   screen  dot-screen cell in design units (default 2.6)
 *   streaks true to let the drum streak
 */
export function copy(master, opts = {}) {
  const px = opts.px || 1, gen = Math.max(1, opts.gen || 1), seed = (opts.seed || 1) + gen * 101;
  const w = master.width, h = master.height;

  // A copy of a copy is read off a sheet that never sits perfectly square on the glass.
  let read = master;
  if (gen > 1) {
    read = makeCanvas(w, h);
    const g = read.getContext('2d'), r = rng(seed), drift = gen - 1;
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.translate(w / 2 + (r() - 0.5) * 2.4 * px * drift, h / 2 + (r() - 0.5) * 2.4 * px * drift);
    g.rotate((r() - 0.5) * 0.009 * drift);
    g.scale(1 + 0.004 * drift, 1 + 0.004 * drift);
    g.drawImage(master, -w / 2, -h / 2);
  }

  const src = read.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  const dark = new Float32Array(w * h);
  for (let i = 0, j = 0; i < dark.length; i++, j += 4) {
    const a = src[j + 3] / 255;
    const lum = (src[j] * 0.3 + src[j + 1] * 0.59 + src[j + 2] * 0.11) / 255;
    dark[i] = (1 - lum) * a;
  }
  const text = opts.mode === 'text';
  boxBlur(dark, w, h, px * (text ? 0.26 + (opts.wear || 0) * 0.075 : 0.32 + 0.16 * (gen - 1)));

  const out = makeCanvas(w, h), og = out.getContext('2d'), img = og.createImageData(w, h), o = img.data;
  const cell = (opts.screen || 2.6) * px, ang = 0.785, ca = Math.cos(ang) * 2 * Math.PI / cell, sa = Math.sin(ang) * 2 * Math.PI / cell;
  const contrast = 1.3 + 0.22 * (gen - 1), gain = 0.035 + 0.03 * (gen - 1);
  const grit = 0.12 + 0.07 * (gen - 1), patch = 0.13 + 0.04 * (gen - 1), drop = 0.0018 * gen;
  const lowCell = 46 * px;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let d = (dark[i] - 0.5) * contrast + 0.5 + gain;
      if (d <= 0.04) continue;
      if (d > 1) d = 1;
      const n = hash(x, y, seed), ln = valueNoise(x, y, lowCell, seed + 7);
      let a;
      if (text) {
        // text mode: no screen; everything snaps to toner or paper at a slightly ragged threshold,
        // so lines thicken, dots clump together and fine greys drop out
        const th = 0.4 + (n - 0.5) * 0.12 + (ln - 0.5) * 0.1 - (opts.darken || 0);
        a = (d - th) * 9 + 0.5;
        if (a <= 0) continue;
        if (a > 1) a = 1;
        if (d > 0.9 && n < drop * (1.4 - ln)) a = 0;
      } else if (d > 0.86) {
        // a solid: full toner, with the odd white drop-out where the drum skipped
        a = n < drop * (1.4 - ln) ? 0 : 1;
      } else {
        const u = x * ca - y * sa, v = x * sa + y * ca;
        const sc = (Math.cos(u) + Math.cos(v)) * 0.25 + 0.5;          // round, clustered dots
        const t = 0.1 + 0.78 * sc + (n - 0.5) * grit + (ln - 0.5) * patch;
        a = (d - t) * 6 + 0.5;
        if (a <= 0) continue;
        if (a > 1) a = 1;
      }
      const k = i * 4;
      o[k] = TONER[0]; o[k + 1] = TONER[1]; o[k + 2] = TONER[2]; o[k + 3] = a * 255;
    }
  }

  // Loose toner: specks and the occasional clump.
  const r = rng(seed + 3), specks = Math.round(w * h * (0.00012 + 0.00011 * (gen - 1)));
  for (let s = 0; s < specks; s++) {
    const x = Math.floor(r() * w), y = Math.floor(r() * h), big = r() < 0.12;
    const rad = big ? px * (0.6 + r() * 0.9) : px * (0.22 + r() * 0.3);
    for (let dy = -Math.ceil(rad); dy <= Math.ceil(rad); dy++) for (let dx = -Math.ceil(rad); dx <= Math.ceil(rad); dx++) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      if (dx * dx + dy * dy > rad * rad * (0.7 + hash(xx, yy, seed + 9) * 0.6)) continue;
      const k = (yy * w + xx) * 4; o[k] = TONER[0]; o[k + 1] = TONER[1]; o[k + 2] = TONER[2]; o[k + 3] = 235;
    }
  }

  // A dirty drum leaves a faint vertical streak, broken into dashes.
  if (opts.streaks !== false && (gen > 1 || opts.streaks)) {
    const lines = gen > 2 ? 2 : 1;
    for (let l = 0; l < lines; l++) {
      const sx = Math.floor((0.15 + r() * 0.7) * w), sw = Math.max(1, Math.round(px * (0.35 + r() * 0.5)));
      for (let y = 0; y < h; y++) {
        if (valueNoise(sx, y, 9 * px, seed + l * 13) < 0.42) continue;
        for (let dx = 0; dx < sw; dx++) {
          const k = (y * w + sx + dx) * 4; if (sx + dx >= w) break;
          o[k] = TONER[0]; o[k + 1] = TONER[1]; o[k + 2] = TONER[2]; o[k + 3] = Math.max(o[k + 3], 70 + 50 * (gen - 1));
        }
      }
    }
  }
  og.putImageData(img, 0, 0);
  return out;
}

/*
 * A sheet of copy paper with toner on it: paper colour, a whisper of fibre, the toner,
 * and (optionally) the dark ragged border you get when the lid is left up.
 */
export function sheet(toner, paperColor, opts = {}) {
  const w = toner.width, h = toner.height, c = makeCanvas(w, h), g = c.getContext('2d');
  g.fillStyle = paperColor; g.fillRect(0, 0, w, h);
  // fibre: barely-there mottling so the paper isn't a flat swatch
  const fib = g.createImageData(w, h), f = fib.data, seed = (opts.seed || 5) + 31;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const v = valueNoise(x, y, 7 * (opts.px || 1), seed) * 0.6 + hash(x, y, seed) * 0.4;
    const a = Math.max(0, v - 0.55) * 34;
    if (a < 1) continue;
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      const k = ((y + dy) * w + x + dx) * 4; if (x + dx >= w || y + dy >= h) continue;
      f[k] = 70; f[k + 1] = 64; f[k + 2] = 56; f[k + 3] = a;
    }
  }
  const fc = makeCanvas(w, h); fc.getContext('2d').putImageData(fib, 0, 0);
  g.drawImage(fc, 0, 0);
  g.drawImage(toner, 0, 0);
  return c;
}
