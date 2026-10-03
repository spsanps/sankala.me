/* Four frames in print: the inks, and how each colour of the drawing is separated into them.
   Five muted inks on warm paper, printed one plate at a time. A colour is matched by at most two
   colour inks (plus the key for the darkest tones), each at one of a few screen strengths, so
   flat areas stay flat: one clean dot field or one solid, never a muddle of every plate. */

export const PAPER = '#f2ecdf';
/* plate order is printing order: the lightest ink first, the key last */
export const INKS = [
  { id: 'sage', hex: '#93aa8b', angle: 15 },
  { id: 'ochre', hex: '#d9ae5c', angle: 0 },
  { id: 'terracotta', hex: '#c4704f', angle: 75 },
  { id: 'slate', hex: '#4e6c88', angle: 45 },
  { id: 'key', hex: '#36332f', angle: 45 },
];
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const PAPER_RGB = hex(PAPER);
export const INK_RGB = INKS.map(i => hex(i.hex));

const LEVELS = [.18, .32, .48, .64, 1];
const KEY_LEVELS = [0, .25, .5, .75, 1];

/* the colour a set of coverages prints: paper times each ink's transmission (dots side by side
   average out; overprinted inks multiply) */
function printed(cov) {
  const out = [...PAPER_RGB];
  for (let i = 0; i < 5; i++) {
    const c = cov[i]; if (!c) continue;
    for (let ch = 0; ch < 3; ch++) out[ch] *= 1 - c * (1 - INK_RGB[i][ch] / PAPER_RGB[ch]);
  }
  return out;
}
/* a cheap perceptual distance (redmean) */
function dist(a, b) {
  const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

let CANDIDATES = null;
function candidates() {
  if (CANDIDATES) return CANDIDATES;
  const list = [];
  const colourSets = [[0, 0, 0, 0]];
  for (let i = 0; i < 4; i++) for (const a of LEVELS) { const v = [0, 0, 0, 0]; v[i] = a; colourSets.push(v); }
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (const a of LEVELS) for (const b of LEVELS) { const v = [0, 0, 0, 0]; v[i] = a; v[j] = b; colourSets.push(v); }
  for (const v of colourSets) for (const k of KEY_LEVELS) {
    const cov = [...v, k], n = v.filter(Boolean).length + (k ? 1 : 0), total = v.reduce((s, x) => s + x, 0) + k;
    // cleanliness: fewer plates, less ink, and the key only where it is needed
    // slate over terracotta is near-complementary and prints as mud; keep it for real browns only
    const mud = v[2] && v[3] ? 22 : 0;
    list.push({ cov, rgb: printed(cov), k, penalty: n * 11 + total * 9 + mud });
  }
  CANDIDATES = list;
  return list;
}

/** The separation table: for an N³ grid of colours, the coverage of each of the five inks.
    Returns { n, colour: Uint8Array (RGBA = sage, ochre, terracotta, slate), key: Uint8Array }. */
export function buildLUT(n = 26) {
  const cands = candidates(), colour = new Uint8Array(n * n * n * 4), key = new Uint8Array(n * n * n);
  const step = 255 / (n - 1);
  for (let b = 0; b < n; b++) for (let g = 0; g < n; g++) for (let r = 0; r < n; r++) {
    const t = [r * step, g * step, b * step];
    let best = null, bestCost = Infinity;
    // the key is for genuinely dark colours: cheap in the shadows, expensive in the mid-tones
    const lum = (.3 * t[0] + .59 * t[1] + .11 * t[2]) / 255, keyCost = 22 + 70 * Math.min(1, lum * 1.6);
    for (const cd of cands) {
      const cost = dist(t, cd.rgb) + cd.penalty + cd.k * keyCost;
      if (cost < bestCost) { bestCost = cost; best = cd; }
    }
    const i = (b * n * n + g * n + r);
    for (let p = 0; p < 4; p++) colour[i * 4 + p] = Math.round(best.cov[p] * 255);
    key[i] = Math.round(best.cov[4] * 255);
  }
  return { n, colour, key };
}
