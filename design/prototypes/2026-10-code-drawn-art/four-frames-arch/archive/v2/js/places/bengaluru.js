/* Bengaluru, 2019 – 2022, a monsoon afternoon: towering clouds lit from the west, a city of flat
   roofs with black water tanks, a gulmohar in flower, and two kites tugging on their strings.
   On the sill: a glass of chai and a packaged chip on a small walnut stand (chip design at TI).
   Palette: sky slate #55697b → #8796a2, a warm break near the horizon #e8cf9e; clouds lit #f7efdf,
   mid #d8d4cc, shadow #9aa2aa, base #6c7682; buildings cream #eadcc0, pink #e2aa9f, ochre #d9a64f,
   pale blue #a9c2ce, mint #b8d0b2; tanks #26282c; gulmohar #e0462a / #f27d3c with leaf #5f7a3a;
   chai #c27a3a; chip #1f2124 with pins #c9ced2. */
import { mix, clamp, smooth, rgb, vnoise, hash2 } from '../core.js';
import { IN_X0, IN_X1, SILL, poly, disc, ell, bar, below, union, blade, regionList, nearest } from '../geom.js';
import { kitesAt, inKite } from './life.js';

const C = s => rgb(s);
const P = {
  skyTop: C('#55697b'), skyMid: C('#8796a2'), skyHor: C('#e8cf9e'),
  cloudLit: C('#f7efdf'), cloud: C('#d8d4cc'), cloudShade: C('#9aa2aa'), cloudBase: C('#6c7682'),
  tank: C('#34373c'), tankLit: C('#5d636b'), outline: C('#2b2925'),
  bloom: C('#e0462a'), bloomLit: C('#f27d3c'), bloomDeep: C('#b5321f'), leaf: C('#5f7a3a'), bark: C('#4a3426'),
};
const WALLS = ['#eadcc0', '#e2aa9f', '#d9a64f', '#a9c2ce', '#b8d0b2', '#eadcc0', '#d9b48a', '#c8b7d0'].map(C);
function light() { return { pal: P, caption: 'Bengaluru · a monsoon afternoon', label: 'a monsoon afternoon', night: 0, stars: 0 }; }

/* clouds: unions of round masses, lit from the right (the west) */
const CLOUDS = [
  { parts: [[300, 360, 112], [376, 284, 104], [452, 350, 96], [232, 440, 84], [330, 450, 108], [436, 446, 92], [516, 452, 70], [384, 196, 74]] },
  { parts: [[740, 330, 84], [806, 270, 92], [866, 342, 74], [716, 420, 88], [812, 424, 100], [888, 446, 62], [790, 192, 62]] },
];
const cloudTop = 120;
/* the city: [x0, x1, roof y]; tanks sit on some roofs */
const BLOCKS = [[66, 172, 712], [172, 268, 668], [268, 382, 726], [382, 476, 648], [476, 600, 700], [600, 704, 656], [704, 820, 714], [820, 934, 676]];
const TANKS = [[226, 668, .9], [430, 648, .8], [648, 656, 1], [880, 676, .85]];
/* the gulmohar */
const CROWN = [[182, 600, 136, 72], [104, 646, 84, 56], [262, 640, 100, 62], [196, 682, 120, 48], [150, 560, 70, 40]];
/* the sill */
const GLX = 330, CHX = 690;

function regions() {
  const out = regionList(), R = out.R;
  R('sky', 'view', c => c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, SILL - 60), (x, y) => {
    const t = clamp((y - 70) / 660);
    return t < .6 ? mix(P.skyTop, P.skyMid, t / .6) : mix(P.skyMid, P.skyHor, smooth(.6, 1, t));
  }, { live: 'sky' });
  for (const [n, cl] of CLOUDS.entries()) {
    R('cloud' + n, 'cloud', union(...cl.parts.map(([x, y, r]) => disc(x, y, r))), (x, y) => {
      // light from the upper right: each round mass is lit on its right shoulder
      let lit = 0;
      for (const [cx, cy, r] of cl.parts) { const d = Math.hypot(x - cx, y - cy) / r; if (d < 1) lit = Math.max(lit, (1 - d) * .4 + clamp(((x - cx) * .7 - (y - cy) * .7) / r) * .9); }
      const base = smooth(400, 540, y);
      let c = lit > .7 ? mix(P.cloud, P.cloudLit, smooth(.7, 1.05, lit)) : mix(P.cloudShade, P.cloud, smooth(.15, .7, lit));
      return mix(c, P.cloudBase, base * .75);
    }, { live: 'cloud', fine: .9 });
  }
  R('city', 'city', c => { for (const [x0, x1, top] of BLOCKS) c.rect(x0, top, x1 - x0, SILL + 1 - top); }, (x, y) => {
    const i = BLOCKS.findIndex(([x0, x1]) => x >= x0 && x < x1), b = BLOCKS[Math.max(0, i)], wall = WALLS[Math.max(0, i) % WALLS.length];
    const [x0, x1, top] = b;
    if (y < top + 10) return mix(wall, [255, 255, 255], .25);                       // the parapet catches the light
    const col = Math.floor((x - x0 - 14) / 34), row = Math.floor((y - top - 28) / 46), wx = x - x0 - 14 - col * 34, wy = y - top - 28 - row * 46;
    if (col >= 0 && x < x1 - 16 && row >= 0 && wx < 18 && wy < 24) return mix(wall, [40, 44, 52], .55);   // windows
    return mix(wall, [60, 60, 70], x > x1 - 22 ? .16 : 0);
  }, { fine: .8, src: 'courses' });
  R('tanks', 'city', c => { for (const [x, roof, z] of TANKS) { const w = 42 * z, h = 32 * z; c.rect(x - w, roof - h, 2 * w, h + 1); c.moveTo(x + w, roof - h); c.ellipse(x, roof - h, w, 8 * z, 0, 0, Math.PI * 2); c.closePath(); } },
    (x, y) => {
      const t = nearest(TANKS.map(([tx, ty]) => ({ x: tx, y: ty })), x, y), dy = (t.y - y) / (TANKS.find(([tx]) => tx === t.x)[2]);
      if (dy > 29) return P.tankLit;                                             // the lid catches the light
      const rib = Math.abs(dy - 20) < 3.5 || Math.abs(dy - 9) < 3.5;             // the ribs of a plastic tank
      return mix(rib ? P.tankLit : P.tank, [20, 20, 24], smooth(-10, 30, x - t.x) * .5);
    }, { fine: .64 });
  /* the gulmohar */
  R('trunk', 'tree', union(blade(214, SILL + 1, 206, 820, 196, 640, 34, 18), blade(200, 720, 170, 680, 130, 640, 14, 6), blade(204, 700, 240, 660, 280, 630, 14, 6)), () => P.bark, { fine: .7 });
  R('crown', 'tree', union(...CROWN.map(([x, y, rx, ry]) => ell(x, y, rx, ry))), (x, y) => {
    const n = vnoise(x / 30, y / 26, 7), n2 = vnoise(x / 14, y / 14, 11);
    if (n2 > .72 && n < .55) return P.leaf;                                          // the feathery green between the flowers
    const top = smooth(700, 540, y) * .6 + smooth(100, 300, x) * .3;
    return mix(P.bloomDeep, mix(P.bloom, P.bloomLit, top), .5 + .5 * n);
  }, { fine: .76 });
  /* the sill: a glass of chai */
  const glass = C('#dfe7e6'), tea = C('#c27a3a'), teaDeep = C('#93552a'), foam = C('#e6c18c');
  R('chai', 'still', poly([[GLX - 42, 884], [GLX + 42, 884], [GLX + 33, SILL + 1], [GLX - 33, SILL + 1]]), (x, y) => {
    const flute = Math.floor((x - GLX + 42) / 15) % 2 === 0;
    if (y < 896) return glass;
    if (y < 908) return foam;
    if (y > 986) return mix(glass, tea, .35);
    return mix(mix(tea, teaDeep, smooth(908, 986, y) * .6 + smooth(GLX - 20, GLX + 40, x) * .25), [255, 238, 210], flute ? .1 : 0);
  }, { fine: .58 });
  /* the chip on its stand */
  const chip = C('#1f2124'), chipLit = C('#3a3d42'), pin = C('#c9ced2'), wood = C('#6e4a2c'), woodLit = C('#93643c');
  R('stand', 'still', union(poly([[CHX - 96, 972], [CHX + 96, 972], [CHX + 104, SILL + 1], [CHX - 104, SILL + 1]]), bar(CHX + 30, 972, CHX + 54, 840, 18)), x => mix(woodLit, wood, smooth(CHX - 80, CHX + 100, x)), { fine: .66 });
  const S = 142, CY0 = 818;
  R('pins', 'still', c => {
    for (let i = 0; i < 6; i++) {
      const o = -S / 2 + 19 + i * 21;
      c.rect(CHX + o - 5, CY0 - 14, 10, 15); c.rect(CHX + o - 5, CY0 + S, 10, 15);
      c.rect(CHX - S / 2 - 14, CY0 + S / 2 + o - 5, 15, 10); c.rect(CHX + S / 2, CY0 + S / 2 + o - 5, 15, 10);
    }
  }, () => pin, { fine: .52 });
  R('chip', 'still', c => c.rect(CHX - S / 2, CY0, S, S), (x, y) => {
    if (Math.hypot(x - (CHX - S / 2 + 22), y - (CY0 + 22)) < 9) return C('#d9dcdc');      // pin one
    return mix(chipLit, chip, smooth(-60, 60, (x - CHX) + (y - CY0 - S / 2)));
  }, { fine: .6, src: 'courses' });
  return out;
}

const outlines = [
  { inside: ['still'], against: ['view', 'city', 'tree', 'cloud'] },
  { inside: ['city'], against: ['sky', 'cloud'] },
  { inside: ['crown'], against: ['sky', 'cloud', 'city'] },
];

const KITES = [
  { x: 566, y: 236, size: 44, ph: 0, c1: C('#d4337a'), c2: C('#f2c230'), strX: 930, strY: 700 },
  { x: 470, y: 520, size: 34, ph: 2.1, c1: C('#f08a2c'), c2: C('#3f8f5a'), strX: 560, strY: 700 },
];
function liveKind(t, r) { return r.live === 'sky' ? 'sky' : r.live === 'cloud' ? 'cloud' : null; }
function frameState(time) { return { kites: kitesAt(time, KITES), time }; }
function liveColour(s, F) {
  for (const k of F.kites) {
    const part = inKite(k, s.ux, s.uy);
    if (part === 1) return k.c1;
    if (part === 2) return k.c2;
    if (part === 3) return mix(k.c1, [255, 255, 255], .2);
    if (part === 4) return mix(s.col, [52, 50, 56], .55);
  }
  if (s.kind === 'cloud' && s.edge) {
    // the cloud edges facing the sun glint as the light comes and goes
    const g = Math.max(0, Math.sin(F.time * .55 - s.ux * .012 + s.h * 2)) ** 6;
    return g > .05 ? mix(s.col, [255, 248, 228], g * .4) : null;
  }
  return null;
}

export default {
  key: 'blr', place: 'Bengaluru', light, regions, outlines, liveKind, frameState, liveColour, isStar: () => false,
  edgeOf: (r, ux, uy) => r.live === 'cloud' && CLOUDS[+r.name.slice(5)].parts.some(([cx, cy, rr]) => { const d = Math.hypot(ux - cx, uy - cy); return d > rr - 22 && d < rr + 4 && ux - cx > -rr * .2 && uy - cy < rr * .3; }) && !CLOUDS[+r.name.slice(5)].parts.some(([cx, cy, rr]) => Math.hypot(ux - cx, uy - cy) < rr - 24),
  alt: () => 'The window onto Bengaluru on a monsoon afternoon: towering clouds lit from the west, flat roofs with black water tanks, a gulmohar in flower and two kites; on the sill a glass of chai and a packaged chip on a small walnut stand.',
};
