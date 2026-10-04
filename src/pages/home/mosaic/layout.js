/* The apse's fixed compositions, shared by the page's CSS (MosaicStyle.jsx writes these numbers
   into custom properties), the live layer and the stills script (scripts/publishing/render-home.mjs).

   The first screen is laid once, in apse units, for each of three layout classes, and the browser
   only scales and places it: CSS works out the apse's scale `u` (px per unit) and its centre from
   the viewport, the still is drawn at that size, and the live layer reads the same box back from the
   page. So the picture on the first paint and the live mosaic always line up exactly.

     side  wide screens: the words on a stele in a column on the left, the apse at the right, full height
     mid   tablets, square and narrow windows: the apse on top, the words beneath, wall at the sides
     band  phones: a taller apse across the width, the words beneath

   Each class has a sheet: the wall, archivolt and cornice laid over a rectangle (units) wide enough
   for every screen in the class. The sheet stops at the cornice's foot (y = F + C); the wall below
   it is laid in level courses, so it is a repeating texture. Each family of conch (its F and its
   stone size) has its own stills; the stone size is fixed in units, so stones scale with the apse. */
export const RI = 500, B = 46, C = 46, RO = RI + B;
export const SHEET_STONE = 6;      // sheet px per stone in the laying engine

export const FAMILIES = {
  fine: { F: 440, stone: 7.58, still: [0.8, 1.6] },     // wide screens and tablets
  coarse: { F: 640, stone: 14.5, still: [0.5, 1.0] },   // phones: a taller apse, fewer, larger stones
};
export const SHEETS = {
  side: { family: 'fine', x0: -1560, x1: 626, y0: -776 },
  mid: { family: 'fine', x0: -1010, x1: 1010, y0: -820 },
  // phones: the apse is drawn at 47% of the screen's height, so the sheet must reach the sides and
  // the top of any phone at the smallest scale home.css allows (u >= 100cqw / 1960 and 0.2 px)
  band: { family: 'coarse', x0: -1000, x1: 1000, y0: -1050 },
};
export const CLASSES = Object.keys(SHEETS);
/** which class a viewport falls in; keep in step with the media queries in MosaicStyle.jsx */
export const SIDE_QUERY = '(min-width: 1100px) and (min-aspect-ratio: 6/5)';
export const BAND_QUERY = '(max-aspect-ratio: 31/50)';
export function classFor(matches) { return matches(SIDE_QUERY) ? 'side' : matches(BAND_QUERY) ? 'band' : 'mid'; }

export const sheetOf = key => { const S = SHEETS[key], fam = FAMILIES[S.family]; return { ...S, key, F: fam.F, y1: fam.F + C, fam }; };
/** the conch's canvas box, in units (a stone's margin round the conch) */
export const conchBox = F => ({ x0: -RI - 6, y0: -RI - 6, x1: RI + 6, y1: F + 6 });
/** sheet px per unit for a family */
export const qOf = family => SHEET_STONE / FAMILIES[family].stone;

/* The marble tablets' frames: four courses of tesserae (dark, gold, porphyry, gold) of one stone each.
   Two sizes: wide screens and phones. The stele's round head is a still per width. */
export const FRAMES = {
  wide: { stone: 6.5, widths: [480, 520, 580], riseMax: 104 },
  // phones: the screen width less two 16 px gutters (320, 360, 375, 390, 412 and 430 px screens)
  phone: { stone: 5, widths: [288, 328, 343, 358, 380, 398], riseMax: 64 },
};
export const steleRise = (w, kind) => Math.round(Math.min(w * .2, FRAMES[kind].riseMax));
export const HEAD_EXTRA = 2;         // the head still runs this many stones below the inner shoulder
/** the CSS clip path for a stele `width` wide: its outer outline, a segmental arch on upright sides */
export function steleClip(width, kind) {
  const rise = steleRise(width, kind), half = width / 2, r = (half * half + rise * rise) / (2 * rise);
  return `path('M0 ${rise} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${width} ${rise} L ${width} 20000 L 0 20000 Z')`;
}

/* The places, newest first (the order of the history on the page). */
export const PLACE_KEYS = ['now', 'sd', 'blr', 'nitk'];
export const PLACE_NAMES = { now: 'San Jose', sd: 'San Diego', blr: 'Bengaluru', nitk: 'Surathkal' };
/** the inscription on the cornice for each place (San Jose shows its real time instead) */
export const PLACE_CAPTIONS = { sd: 'a clear morning', blr: 'a monsoon afternoon', nitk: 'a night by the sea' };
/** every conch still: San Jose in each moment, and the other three places */
export const conchStates = momentKeys => [...momentKeys.map(m => `now-${m}`), 'sd', 'blr', 'nitk'];
