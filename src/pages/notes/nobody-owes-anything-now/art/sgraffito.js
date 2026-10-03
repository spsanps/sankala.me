// Sgraffito: cream slip over red earthenware, scratched through to the clay.
// Used by the poem's figure (a cup turning on a banding wheel) and by its cover (a slab).
//
// A surface is built once, as maps: what was cut (stylus lines and scraped areas, drawn with
// canvas paths), how thick the slip lies, and from those the colour, the gloss and the relief:
// grooves dug a little into the clay, burrs of slip pushed up along their edges, crumbs left
// behind, striations where a loop tool scraped. Shading then lights the relief, so the same maps
// read correctly whichever way the surface faces the light (the cup turns; its light does not).
import { mulberry32, brush, clamp, smooth, lerp } from '../../../../components/art/covers/kit.js';

export { clamp, smooth, lerp, mulberry32 };
export const TAU = Math.PI * 2;

export const CLAY = [156, 72, 41];      // red earthenware, leather hard
export const SLIP = [238, 226, 200];    // white slip, a little warm
const THIN = [222, 183, 147];           // slip too thin to hide the clay

/* ───────────────────────── noise that can wrap around a cup ───────────────────────── */
function hash2(ix, iy, s) { let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s, 982451653); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
// Value noise; with a period, it repeats every `period` cells in x.
export function pnoise(x, y, s, period = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  let x0 = ix, x1 = ix + 1;
  if (period) { x0 = ((ix % period) + period) % period; x1 = (x0 + 1) % period; }
  const a = hash2(x0, iy, s), b = hash2(x1, iy, s), c = hash2(x0, iy + 1, s), d = hash2(x1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export function pfbm(x, y, s, oct = 3, period = 0) {
  let v = 0, a = .5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { v += a * pnoise(x * f, y * f, s + i * 17, period * f); n += a; a *= .5; f *= 2; }
  return v / n;
}

/* ───────────────────────── blur ───────────────────────── */
function boxes(sigma) {
  const ideal = Math.sqrt(12 * sigma * sigma / 3 + 1); let wl = Math.floor(ideal); if (wl % 2 === 0) wl--;
  const m = Math.round((12 * sigma * sigma - 3 * wl * wl - 12 * wl - 9) / (-4 * wl - 4));
  return [0, 1, 2].map(i => (i < m ? wl : wl + 2));
}
function boxLine(s, d, start, stride, len, r, wrap) {
  const k = 1 / (2 * r + 1); let acc = 0;
  const at = j => wrap ? s[start + (((j % len) + len) % len) * stride] : s[start + (j < 0 ? 0 : j >= len ? len - 1 : j) * stride];
  for (let j = -r; j <= r; j++) acc += at(j);
  for (let i = 0; i < len; i++) { d[start + i * stride] = acc * k; acc += at(i + r + 1) - at(i - r); }
}
// Gaussian-ish blur of a scalar map; x can wrap (the seam of a cup).
export function blur(src, W, H, sigma, wrapX = false) {
  let a = Float32Array.from(src), b = new Float32Array(src.length);
  if (sigma < .3) return a;
  for (const box of boxes(sigma)) {
    const r = (box - 1) / 2; if (r < 1) continue;
    for (let y = 0; y < H; y++) boxLine(a, b, y * W, 1, W, r, wrapX);
    for (let x = 0; x < W; x++) boxLine(b, a, x, W, H, r, false);
  }
  return a;
}

const sheet = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function alphaOf(canvas) {
  const d = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const out = new Float32Array(canvas.width * canvas.height);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + 3] / 255;
  return out;
}

/* ───────────────────────── building a surface ───────────────────────── */
// W×H pixels at `scale` pixels per design unit. `draw(api)` makes the marks in design units:
//   api.line(strokes, width, opts)  a stylus line (strokes are polylines)
//   api.scrape(fill, angle)         a scraped area: fill(ctx) adds paths; striations run along angle
//   api.reserve(fill)               leave slip standing inside a scraped area
//   api.press(fill, depth)          a dent pressed into the surface (fingerprints)
//   api.rng                         seeded randomness, the same on every pass
// With wrapX the drawing is made three times, shifted by one width, so marks cross the seam.
// `slip(x, y)` gives the slip's thickness at a design point (0 = none, 1 = full).
export function buildSurface({ W, H, scale, seed = 1, wrapX = false, draw, slip, extra = null, relief = 1, specks = 1, crumbs = 1, burrs = 1, wash = 1 }) {
  const N = W * H, DW = W / scale, DH = H / scale;
  const cut = sheet(W, H), stri = sheet(W, H), dent = sheet(W, H);
  const cx = cut.getContext('2d', { willReadFrequently: true }), sx = stri.getContext('2d', { willReadFrequently: true }), dx = dent.getContext('2d', { willReadFrequently: true });
  for (const c of [cx, sx, dx]) { c.lineCap = 'round'; c.lineJoin = 'round'; c.fillStyle = c.strokeStyle = '#000'; }
  for (const shift of wrapX ? [-DW, 0, DW] : [0]) {
    for (const c of [cx, sx, dx]) c.setTransform(scale, 0, 0, scale, shift * scale, 0);
    const api = {
      rng: mulberry32(seed * 7919 + 3),
      line(strokes, w, o = {}) { brush(cx, strokes, { w, wob: o.wob ?? w * .12, wobF: o.wobF ?? .09, vary: o.vary ?? .28, taper: o.taper ?? [.6, 1.4], seed: o.seed ?? 3, step: Math.max(.25, w * .2) }); },
      scrape(fill, angle = 0, o = {}) {
        cx.beginPath(); fill(cx); cx.fill();
        // the loop tool leaves fine parallel tracks across the scraped clay
        sx.save(); sx.beginPath(); fill(sx); sx.clip();
        const r = mulberry32((o.seed ?? 11) * 131), ca = Math.cos(angle), sa = Math.sin(angle);
        sx.lineWidth = .55; sx.lineCap = 'butt';
        for (let k = -DW - DH; k < DW + DH; k += .9 + r() * 1.6) {
          sx.globalAlpha = .25 + r() * .6; sx.beginPath();
          sx.moveTo(-sa * k - ca * 2000, ca * k - sa * 2000); sx.lineTo(-sa * k + ca * 2000, ca * k + sa * 2000); sx.stroke();
        }
        sx.restore(); sx.globalAlpha = 1;
      },
      reserve(fill) { cx.save(); cx.globalCompositeOperation = 'destination-out'; cx.beginPath(); fill(cx); cx.fill(); cx.restore(); },
      press(fill, depth = 1) { dx.save(); dx.globalAlpha = clamp(depth); fill(dx); dx.restore(); },
    };
    draw(api);
  }

  // Cut edges chip: the drawn mask is softened, roughened with fine noise and re-sharpened.
  const raw = alphaOf(cut), soft = blur(raw, W, H, .55 * Math.max(1, scale * .5), wrapX);
  // Noise that repeats exactly once around: coordinates are scaled to a whole number of cells.
  const per = wrapX ? Math.round(DW / 1.6) : 0, perC = wrapX ? Math.round(DW / 7) : 0;
  const fx = (ux, cells, size) => wrapX ? ux * cells / DW : ux / size;
  const C = new Float32Array(N), S = new Float32Array(N), lowA = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, ux = x / scale, uy = y / scale;
    const v = soft[i]; let c = v;
    if (v > .02 && v < .98) c = v + (pnoise(fx(ux, per, 1.6), uy / 1.6, seed + 5, per) - .5) * .5 * 4 * v * (1 - v);
    C[i] = smooth(.32, .68, c);
    S[i] = Math.max(0, slip(ux, uy));
    lowA[i] = pfbm(fx(ux, perC, 7), uy / 7, seed + 9, 3, perC);
  }
  const G = blur(C, W, H, .9 * Math.max(1, scale * .4), wrapX);            // groove bowl
  const B = blur(C, W, H, 1.5 * Math.max(1, scale * .45), wrapX);          // spread for burrs
  const ST = alphaOf(stri), D = blur(alphaOf(dent), W, H, .6, wrapX);
  const perW = wrapX ? Math.round(DW / 22) : 0, WASH = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) WASH[y * W + x] = clamp((pfbm(fx(x / scale, perW, 22), y / scale / 22, seed + 40, 2, perW) - .5) * 4, -1, 1);

  // Height in design units (slip about 1.2 thick) and the colour of each pixel.
  const h = new Float32Array(N), tex = new Uint8ClampedArray(N * 4);
  const r = mulberry32(seed * 31 + 7), perF = wrapX ? Math.round(DW / .9) : 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, ux = x / scale, uy = y / scale;
    const c = C[i], s = S[i], lo = lowA[i];
    const burr = Math.max(0, B[i] - c) * (c < .5 ? 1 : 0);
    const flake = pnoise(fx(ux, perF, .9), uy / .9, seed + 13, perF);
    const sl = 1.2 * (.86 + .28 * lo) * smooth(0, .6, s) * (1 + .25 * (s - 1));
    h[i] = sl * (1 - c) - .55 * G[i] * c + burr * (.6 + 1.2 * flake) * .7 * burrs - ST[i] * c * .22 - D[i] * .5 + (extra ? extra(ux, uy) : 0);
    // colour
    const cover = (1 - c) * smooth(.04, .7, s);
    const tone = .94 + .1 * lo, warm = (lo - .5) * 10;
    let cr = CLAY[0] * tone + warm, cg = CLAY[1] * tone + warm * .4, cb = CLAY[2] * tone;
    const deep = G[i] * c; cr *= 1 - .1 * deep; cg *= 1 - .12 * deep; cb *= 1 - .1 * deep;   // burnished groove floors
    cr *= 1 - .06 * ST[i] * c; cg *= 1 - .06 * ST[i] * c;
    // the slip is never one colour: thinner where it ran, a little cooler or warmer in patches
    const thin = smooth(.3, 1.05, s), wsh = WASH[i] * wash;
    const sr = lerp(THIN[0], SLIP[0], thin) + wsh * 6, sg = lerp(THIN[1], SLIP[1], thin) + wsh * 1.5, sb = lerp(THIN[2], SLIP[2], thin) - wsh * 9;
    const sT = .965 + .07 * lo + burr * .12;
    let R = lerp(cr, sr * sT, cover), Gc = lerp(cg, sg * sT, cover), Bc = lerp(cb, sb * sT, cover);
    tex[i * 4] = R; tex[i * 4 + 1] = Gc; tex[i * 4 + 2] = Bc;
    tex[i * 4 + 3] = 255 * clamp(.05 + .75 * cover - burr * .3);
  }
  // Iron specks in the slip, grog in the clay, and crumbs of slip left along the cuts.
  const dot = (px, py, rad, col, lift) => {
    const R2 = rad * rad, x0 = Math.floor(px - rad - 1), x1 = Math.ceil(px + rad + 1), y0 = Math.max(0, Math.floor(py - rad - 1)), y1 = Math.min(H - 1, Math.ceil(py + rad + 1));
    for (let yy = y0; yy <= y1; yy++) for (let xx0 = x0; xx0 <= x1; xx0++) {
      let xx = xx0; if (wrapX) xx = ((xx % W) + W) % W; else if (xx < 0 || xx >= W) continue;
      const d2 = (xx0 - px) ** 2 + (yy - py) ** 2; if (d2 > R2 + rad) continue;
      const a = clamp(rad + .5 - Math.sqrt(d2)), i = yy * W + xx;
      if (col) for (let k = 0; k < 3; k++) tex[i * 4 + k] = lerp(tex[i * 4 + k], col[k], a);
      if (lift) h[i] += lift * a * Math.sqrt(Math.max(0, 1 - d2 / (R2 + .01)));
    }
  };
  const nSpecks = Math.round(N / (scale * scale) / 260 * specks);
  for (let k = 0; k < nSpecks; k++) {
    const px = r() * W, py = r() * H, i = (py | 0) * W + (px | 0);
    if (C[i] < .5 && S[i] > .5) dot(px, py, (.25 + r() * r() * .9) * scale, r() < .7 ? [104, 70, 48] : [142, 104, 70], 0);
    else if (C[i] > .5) dot(px, py, (.2 + r() * .4) * scale, [186, 120, 84], .15);
  }
  const nCrumbs = Math.round(N / (scale * scale) / 90 * crumbs);
  for (let k = 0; k < nCrumbs; k++) {
    const px = r() * W, py = r() * H, i = (py | 0) * W + (px | 0);
    const burr = B[i] - C[i];
    if (burr > .12 && r() < burr * 1.6) {
      const ang = r() * TAU, off = (.4 + r() * 1.2) * scale, rad = (.25 + r() * r() * .9) * scale;
      const tint = r() < .75 ? SLIP.map(v => v * (.96 + r() * .06)) : CLAY.map(v => v * 1.05);
      dot(px + Math.cos(ang) * off, py + Math.sin(ang) * off, rad, tint, 1.1 + r() * .8);
    }
  }

  // Slopes of the relief (design units of height per design unit across), for shading.
  const gu = new Float32Array(N), gv = new Float32Array(N), k2 = relief * scale / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const xl = x > 0 ? i - 1 : wrapX ? i + W - 1 : i, xr = x < W - 1 ? i + 1 : wrapX ? i - W + 1 : i;
    const yu = y > 0 ? i - W : i, yd = y < H - 1 ? i + W : i;
    gu[i] = (h[xr] - h[xl]) * k2; gv[i] = (h[yd] - h[yu]) * k2;
  }
  return { W, H, scale, wrapX, tex, gu, gv, cut: C, slip: S };
}

// A half-size copy of a surface, for sampling where the cup turns away and the texture squeezes.
export function halve(sf) {
  const W = sf.W >> 1, H = sf.H >> 1, N = W * H, tex = new Uint8ClampedArray(N * 4), gu = new Float32Array(N), gv = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = y * W + x, a = 2 * y * sf.W + 2 * x, b = a + 1, c = a + sf.W, d = c + 1;
    for (let k = 0; k < 4; k++) tex[o * 4 + k] = (sf.tex[a * 4 + k] + sf.tex[b * 4 + k] + sf.tex[c * 4 + k] + sf.tex[d * 4 + k]) / 4;
    gu[o] = (sf.gu[a] + sf.gu[b] + sf.gu[c] + sf.gu[d]) / 8; gv[o] = (sf.gv[a] + sf.gv[b] + sf.gv[c] + sf.gv[d]) / 8;
  }
  return { W, H, scale: sf.scale / 2, wrapX: sf.wrapX, tex, gu, gv };
}

/* ───────────────────────── light ───────────────────────── */
// Window light from the upper left and a little in front; the viewer looks down by asin(K).
export const K = .3, COS_T = Math.sqrt(1 - K * K);
const norm = v => { const l = Math.hypot(...v); return v.map(c => c / l); };
export const LIGHT = norm([-.5, .82, .5]);
export const VIEW = [0, K, COS_T];
export const HALF = norm(LIGHT.map((c, i) => c + VIEW[i]));
// The window itself, low on the left: its reflection is the soft upright sheen on the slip.
const WINDOW = norm([-.72, .22, .66]);
export const SHEEN = norm(WINDOW.map((c, i) => c + VIEW[i]));

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// A surface frame against the light: [L·n, L·t, L·b, H·n, H·t, H·b, S·n, S·t, S·b] for normal n,
// tangent t (the direction of increasing x in the maps) and b (up the surface, decreasing y);
// H is the light's half vector, S the window sheen's.
export const frame = (n, t, b) => [dot3(LIGHT, n), dot3(LIGHT, t), dot3(LIGHT, b), dot3(HALF, n), dot3(HALF, t), dot3(HALF, b), dot3(SHEEN, n), dot3(SHEEN, t), dot3(SHEEN, b)];

// The lighting for clay and slip: wrapped diffuse window light, a warm room fill, a satin
// sheen on the slip (leather hard, still faintly damp), and relief from the maps' slopes.
// `f` holds the frame at offset `o` (so a whole surface's frames can live in one array).
export function light(out, col, gloss, gu, gv, f, ao, lit, o = 0) {
  const inv = 1 / Math.sqrt(1 + gu * gu + gv * gv);
  const d = (f[o] - gu * f[o + 1] + gv * f[o + 2]) * inv;
  const hd = (f[o + 3] - gu * f[o + 4] + gv * f[o + 5]) * inv, sd = f.length > o + 6 ? (f[o + 6] - gu * f[o + 7] + gv * f[o + 8]) * inv : 0;
  const diff = d > 0 ? d : 0, w = (d + .4) / 1.4, fill = w > 0 ? w : 0;
  let spec = 0;
  if (hd > 0) { const h2 = hd * hd, h4 = h2 * h2, h8 = h4 * h4, h16 = h8 * h8; spec = gloss * (.05 * h8 + .2 * h16 * h16) * lit; }
  if (sd > 0) { const s2 = sd * sd, s4 = s2 * s2, s8 = s4 * s4, s16 = s8 * s8; spec += gloss * (.06 * s16 + .1 * s16 * s16); }
  const Ld = diff * lit;
  out[0] = col[0] * (ao * (.35 + .2 * fill) + Ld * .8) + spec * 255;
  out[1] = col[1] * (ao * (.34 + .2 * fill) + Ld * .78) + spec * 250;
  out[2] = col[2] * (ao * (.35 + .21 * fill) + Ld * .74) + spec * 240;
}

// A flat surface facing the viewer (the cover's slab), lit from the upper left at a lower
// angle than the cup so its scratches show, and written into an ImageData.
const SLAB_L = norm([-.62, .5, .6]), SLAB_H = norm([SLAB_L[0], SLAB_L[1], SLAB_L[2] + 1]);
// `sheen(x, y)` (0..1) moves the window's reflection across it, as a near light would.
export function lightFlat(sf, img, ao = () => 1, sheen = () => 0) {
  const f = [SLAB_L[2], SLAB_L[0], SLAB_L[1], SLAB_H[2], SLAB_H[0], SLAB_H[1]], d = img.data, out = [0, 0, 0], col = [0, 0, 0];
  for (let y = 0; y < sf.H; y++) for (let x = 0; x < sf.W; x++) {
    const i = y * sf.W + x, k = i * 4;
    col[0] = sf.tex[k]; col[1] = sf.tex[k + 1]; col[2] = sf.tex[k + 2];
    f[3] = SLAB_H[2] + (1 - SLAB_H[2]) * sheen(x, y);
    light(out, col, sf.tex[k + 3] / 255, sf.gu[i], sf.gv[i], f, ao(x, y), 1);
    d[k] = out[0]; d[k + 1] = out[1]; d[k + 2] = out[2]; d[k + 3] = 255;
  }
  return img;
}
