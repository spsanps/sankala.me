/* Four frames in mosaic: the stones.
   A limited box of tesserae, like a mosaicist's trays: limestone and marble creams, a few
   greys, one near-black for outlines, and ramps of teal, lapis, green, ochre, orange, red,
   wood and dusk violet. Every colour the scene asks for is matched to the nearest stone in
   CIE Lab, through a 32-level lookup cube. */

const HEX = [
  // creams, limestone, marble
  '#f8f4ea', '#efe5cc', '#e4d5b2', '#d6c398', '#c4ab7c',
  // greys
  '#d2cec4', '#aaa59a', '#7e7a72', '#54514c', '#34322f',
  // outline stone
  '#1f1c18',
  // teal
  '#dff0ea', '#b6e0d8', '#86c9c0', '#52aba5', '#2b8a88', '#1b6566', '#12474b',
  // lapis
  '#4f78c2', '#2f55b8', '#22408f', '#1b2c5e', '#141d3d',
  // green
  '#dfe4c4', '#bccb94', '#8ea866', '#5f8445', '#3c6236', '#26432a',
  // ochre and gold
  '#f8eab8', '#f1d27a', '#e3b14a', '#c98f2e', '#9e6a22',
  // orange
  '#f6c393', '#ef9a5a', '#e0702f', '#b8521f',
  // red
  '#e9806e', '#d6453a', '#a8322a', '#74231e',
  // wood
  '#e2b67c', '#cc935a', '#a66b3a', '#7c4a27', '#543019',
  // dusk violet
  '#a789a8', '#6e5a86', '#433a63',
];

export const PAL_RGB = HEX.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
export const INK_STONE = HEX.indexOf('#1f1c18');
export const GOLD_STONE = HEX.indexOf('#e3b14a');

function srgbToLin(c) { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }
export function toLab(r, g, b) {
  const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
  let x = (R * .4124 + G * .3576 + B * .1805) / .95047, y = R * .2126 + G * .7152 + B * .0722, z = (R * .0193 + G * .1192 + B * .9505) / 1.08883;
  const f = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  x = f(x); y = f(y); z = f(z);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
export const PAL_LAB = PAL_RGB.map(c => toLab(c[0], c[1], c[2]));

/* nearest stone for every point of a 32³ cube; lightness weighted a little less than hue, so a
   pale blue sky finds a pale teal rather than a grey */
const LUT = new Uint8Array(32 * 32 * 32);
(function build() {
  for (let r = 0; r < 32; r++) for (let g = 0; g < 32; g++) for (let b = 0; b < 32; b++) {
    const [L, A, B] = toLab(r * 8.2258, g * 8.2258, b * 8.2258);
    let best = 0, bd = 1e9;
    for (let i = 0; i < PAL_LAB.length; i++) {
      const p = PAL_LAB[i], dl = (L - p[0]) * .85, da = A - p[1], db = B - p[2], d = dl * dl + da * da + db * db;
      if (d < bd) { bd = d; best = i; }
    }
    LUT[(r << 10) | (g << 5) | b] = best;
  }
})();
export const stoneOf = (r, g, b) => LUT[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
/* a daylight sky has no violet stones: its in-between colours go to teal, cream or ochre */
const VIOLET = new Set(['#a789a8', '#6e5a86', '#433a63', '#d2cec4', '#aaa59a'].map(h => HEX.indexOf(h)));
const LUT_DAY = new Uint8Array(32 * 32 * 32);
for (let i = 0; i < LUT.length; i++) {
  if (!VIOLET.has(LUT[i])) { LUT_DAY[i] = LUT[i]; continue; }
  const r = (i >> 10) * 8.2258, g = ((i >> 5) & 31) * 8.2258, b = (i & 31) * 8.2258, [L, A, B] = toLab(r, g, b);
  let best = 0, bd = 1e9;
  for (let k = 0; k < PAL_LAB.length; k++) { if (VIOLET.has(k)) continue; const p = PAL_LAB[k], dl = (L - p[0]) * .85, da = A - p[1], db = B - p[2], d = dl * dl + da * da + db * db; if (d < bd) { bd = d; best = k; } }
  LUT_DAY[i] = best;
}
export const stoneOfDay = (r, g, b) => LUT_DAY[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
export function labDist(i, j) { const a = PAL_LAB[i], b = PAL_LAB[j]; return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }

/* how a stone sits in the light: a stone's own small difference from its neighbours (no two
   tesserae are cut from the same spot of the cane) */
export function stoneRGB(idx, h) {
  const c = PAL_RGB[idx], v = 1 + (h - .5) * .1, j = (h * 7.31 % 1 - .5) * 8;
  return [Math.max(0, Math.min(255, c[0] * v + j)), Math.max(0, Math.min(255, c[1] * v + j * .6)), Math.max(0, Math.min(255, c[2] * v - j * .4))];
}
/* saturated stones that may be cut from glass (smalti) and catch the light */
export const GLASSY = new Set(['#52aba5', '#2b8a88', '#4f78c2', '#2f55b8', '#e0702f', '#d6453a', '#f1d27a', '#e3b14a', '#ef9a5a', '#86c9c0'].map(h => HEX.indexOf(h)));

/* the sky through the window, by day, leans toward the teal of a mosaicist's tray rather than the
   painter's blue; at night it stays in its own blues and violets */
export function viewTone(r, g, b, night) {
  if (night > .3) {
    // at night the hills, sea and sky are all deep blues; stretch them apart so they read as stones
    const k = 1 + .9 * Math.min(1, night), m = [34, 42, 84];
    return [m[0] + (r - m[0]) * k, m[1] + (g - m[1]) * k, m[2] + (b - m[2]) * k].map(v => Math.max(0, Math.min(255, v)));
  }
  if (b < r || b < g * .9) return [r, g, b];
  const k = Math.min(1, (b - Math.max(r, g * .9)) / 60) * .85;
  return [r * (1 - .12 * k), g + (b - g) * .55 * k + 6 * k, b - (b - g) * .25 * k];
}
