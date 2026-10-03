/* San Diego, 2022 – 2024, a clear morning: the Geisel Library (glass floors stepping out over
   splayed concrete piers), eucalyptus on either side, the Pacific on the horizon, a lawn.
   On the sill: a stack of hand-made zines (ZINify) with one standing up, a coffee cup on its
   saucer, and a gull that has just landed.
   Palette: sky #3c8ed0 → #8cc4e8 → #e6f2f2; sea #2d6f9f / #5b9fc6; scrub #b9b27a; lawn #7fa45a;
   concrete #e6dfd1 / #c9c0b0; glass #3c5866 / #6f93a4; eucalyptus #6f9488 / #a4c2b2, bark #e1d9c8;
   zines pink #e5839c, yellow #f0c64a, blue #4f86c6; cup #f4efe6 with a teal band #3b8f8a;
   gull white #f5f3ee, grey #98a3ab, beak #f0c23a. */
import { mix, clamp, smooth, rgb, vnoise } from '../core.js';
import { IN_X0, IN_X1, SILL, poly, disc, ell, bar, below, union, blade, regionList } from '../geom.js';
import { birdsAt, inBird } from './life.js';

const C = s => rgb(s);
const P = {
  skyTop: C('#3c8ed0'), skyMid: C('#8cc4e8'), skyHor: C('#e6f2f2'), sunIn: C('#fffbe8'), sunOut: C('#f7dc8c'),
  sea: C('#2d6f9f'), seaFar: C('#5b9fc6'), crest: C('#e8f4f6'), scrub: C('#b9b27a'), scrubDark: C('#8e9461'),
  lawn: C('#7fa45a'), lawnDark: C('#5f8a44'), path: C('#e2d7bd'),
  concrete: C('#e6dfd1'), concreteShade: C('#c9c0b0'), glass: C('#3c5866'), glassLit: C('#7397a8'), glassDeep: C('#2c4250'),
  euc: C('#6f9488'), eucLit: C('#a4c2b2'), eucDeep: C('#4d7268'), bark: C('#e1d9c8'), barkShade: C('#b9ad96'),
  bird: C('#3a4248'), outline: C('#2b2925'),
};
function light() {
  return { pal: P, sun: [232, 236], caption: 'San Diego · a clear morning', label: 'a clear morning', night: 0, stars: 0 };
}

/* the Geisel Library: tiers from the bottom up [top y, width]; each has a concrete slab under its glass */
const LX = 522, GROUND = 902;
const TIERS = [[862, 160], [822, 172], [778, 254], [734, 318], [690, 374], [646, 414], [604, 394], [564, 350]];
const ROOF = [550, 362];
const tierAt = y => { for (let i = 0; i < TIERS.length; i++) { const top = TIERS[i][0], bot = i ? TIERS[i - 1][0] : GROUND; if (y >= top && y < bot) return { i, top, bot, w: TIERS[i][1] }; } return null; };
const PIERS = [[46, 88], [60, 140], [76, 188]].flatMap(([b, t]) => [[-1, b, t], [1, b, t]]);
const HORIZON = 652, LAND = x => 726 + 8 * Math.sin(x / 70);

/* eucalyptus: a pale forked trunk and hanging crowns */
const TREES = [
  { trunk: [[160, 912], [170, 760], [200, 600]], fork: [[180, 712], [118, 600]], crowns: [[124, 540, 70, 56, -.3], [204, 486, 76, 58, .2], [254, 552, 52, 44, .4], [160, 430, 52, 40, 0], [92, 600, 40, 34, .1]],
    strands: [[86, 590, 70], [122, 590, 62], [176, 530, 56], [226, 530, 66], [272, 586, 50], [150, 470, 44]] },
  { trunk: [[864, 912], [854, 760], [826, 610]], fork: [[846, 700], [904, 600]], crowns: [[872, 530, 64, 54, .3], [802, 478, 68, 54, -.2], [764, 552, 46, 40, -.4], [846, 420, 50, 38, 0], [912, 600, 34, 30, .2]],
    strands: [[904, 566, 70], [866, 576, 60], [808, 520, 56], [768, 586, 52], [912, 504, 44]] },
];

/* the sill: zines, cup, gull */
const ZX0 = 104, ZX1 = 300;
const ZINE_UP = [[132, 770], [270, 756], [282, 940], [140, 946]];   // the standing zine, leaning back a little
const CUPX = 604;
const GULL = { x: 836, y: 924 };

function regions(L) {
  const out = regionList(), R = out.R;
  R('sky', 'view', c => c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, HORIZON + 4 - 60), (x, y) => {
    const t = clamp((y - 70) / (HORIZON - 70));
    let c = t < .55 ? mix(P.skyTop, P.skyMid, t / .55) : mix(P.skyMid, P.skyHor, (t - .55) / .45);
    return mix(c, P.sunIn, .3 * (1 - smooth(50, 220, Math.hypot(x - L.sun[0], y - L.sun[1]))));
  }, { live: 'sky' });
  R('sun', 'view', disc(...L.sun, 50), (x, y) => mix(P.sunIn, P.sunOut, smooth(6, 48, Math.hypot(x - L.sun[0], y - L.sun[1]))), { live: 'sun', fine: .9 });
  R('sea', 'view', below(() => HORIZON), (x, y) => mix(P.seaFar, P.sea, smooth(HORIZON, HORIZON + 60, y)), { src: 'courses', live: 'sea' });
  R('land', 'view', below(LAND), (x, y) => mix(P.scrub, P.scrubDark, smooth(0, 140, y - LAND(x)) * .6 + .25 * vnoise(x / 40, y / 30, 5)), { src: ['sea'] });
  R('lawn', 'view', below(x => GROUND - 2 + 3 * Math.sin(x / 50)), (x, y) => {
    if (Math.abs(x - LX - (y - GROUND) * .9) < 26 && y > GROUND) return P.path;     // a path leading up to the library
    return mix(P.lawn, P.lawnDark, smooth(GROUND, SILL, y) * .7);
  }, { src: 'courses' });
  /* the library */
  R('library', 'lib', c => {
    TIERS.forEach(([top, w], i) => { const bot = i ? TIERS[i - 1][0] : GROUND; c.rect(LX - w / 2, top, w, bot - top + 1); });
    c.rect(LX - ROOF[1] / 2, ROOF[0], ROOF[1], TIERS[TIERS.length - 1][0] - ROOF[0] + 1);
  }, (x, y) => {
    if (y < TIERS[TIERS.length - 1][0]) return P.concrete;                   // the roof slab
    const T = tierAt(y); if (!T) return P.concrete;
    const slab = y > T.bot - 11;
    const shade = x > LX + T.w * .2;
    if (slab) return shade ? P.concreteShade : P.concrete;
    const g = (y - T.top) / (T.bot - 11 - T.top);
    let c = mix(P.glassLit, P.glass, smooth(0, .7, g));
    if (shade) c = mix(c, P.glassDeep, .45);
    return c;
  }, { fine: .72, src: 'courses' });
  R('piers', 'lib', union(...PIERS.map(([side, b, t]) => bar(LX + side * b, GROUND - 80, LX + side * t, 648, 26))), x => x > LX ? P.concreteShade : P.concrete, { fine: .68 });
  /* eucalyptus */
  for (const [n, T] of TREES.entries()) {
    const [a, m, b] = T.trunk;
    R('trunk' + n, 'tree', union(blade(a[0], a[1], m[0], m[1], b[0], b[1], 30, 14), blade(...T.fork[0], (T.fork[0][0] + T.fork[1][0]) / 2, T.fork[0][1] - 30, ...T.fork[1], 16, 8)),
      (x, y) => mix(P.bark, P.barkShade, .35 * vnoise(x / 18, y / 26, 9) + .4 * smooth(-4, 10, x - a[0])), { fine: .7 });
    // a eucalyptus crown is open and hangs: loose leaf masses with strands of leaves dropping from them
    R('crown' + n, 'tree', union(...T.crowns.map(([x, y, rx, ry, rot]) => ell(x, y, rx, ry, rot)), ...T.strands.map(([x, y, len]) => blade(x, y - 10, x + 6, y + len * .5, x - 4, y + len, 22, 4))), (x, y) => {
      const k = T.crowns.reduce((acc, [cx, cy, rx, ry]) => Math.min(acc, Math.hypot((x - cx) / rx, (y - cy) / ry)), 9);
      return mix(mix(P.eucLit, P.euc, smooth(.1, .9, k)), P.eucDeep, smooth(0, 1, (y - 430) / 230) * .5 + .22 * vnoise(x / 22, y / 18, 3));
    }, { fine: .74 });
  }
  /* the sill: zines */
  const pages = C('#efe6d2'), pageShade = C('#d9cdb3'), covers = [C('#4f86c6'), C('#f0c64a'), C('#e5839c')];
  [[0, 980, 1001], [1, 962, 980], [2, 946, 962]].forEach(([i, top, bot]) => {
    const dx = [0, 10, -6][i];
    R('zine' + i, 'still', poly([[ZX0 + dx, top], [ZX1 + dx, top], [ZX1 + dx + 2, bot], [ZX0 + dx - 2, bot]]), (x, y) => y < top + 6 ? covers[i] : mix(pages, pageShade, smooth(ZX0, ZX1, x) * .5), { fine: .62, src: 'courses' });
  });
  const pink = C('#e5839c'), yellow = C('#f4cb48'), ink = C('#2a2626');
  R('zineUp', 'still', poly(ZINE_UP), (x, y) => {
    // a riso-printed cover: a yellow sun, a black zig-zag "Z" and a pink field
    if (Math.hypot(x - 206, y - 832) < 40) return yellow;
    const zy = (y - 870) / 40, zx = (x - 206) / 52;
    if (zy > 0 && zy < 1 && (Math.abs(zy) < .17 || Math.abs(zy - 1) < .17 || Math.abs(zx + (zy - .5) * 1.7) < .2) && Math.abs(zx) < .9) return ink;
    return mix(pink, C('#cc6f88'), smooth(150, 290, x) * .5);
  }, { fine: .6 });
  /* cup and saucer */
  const white = C('#f4efe6'), whiteShade = C('#d6cdbf'), teal = C('#3b8f8a');
  R('saucer', 'still', ell(CUPX, 986, 86, 15), x => mix(white, whiteShade, smooth(CUPX - 40, CUPX + 90, x)), { fine: .62 });
  R('cup', 'still', c => {
    c.moveTo(CUPX - 54, 896); c.lineTo(CUPX + 54, 896); c.bezierCurveTo(CUPX + 52, 960, CUPX + 40, 982, CUPX, 982); c.bezierCurveTo(CUPX - 40, 982, CUPX - 52, 960, CUPX - 54, 896); c.closePath();
    c.moveTo(CUPX + 88, 932); c.ellipse(CUPX + 64, 932, 24, 28, 0, 0, Math.PI * 2); c.closePath();
    c.moveTo(CUPX + 76, 932); c.ellipse(CUPX + 64, 932, 12, 15, 0, 0, Math.PI * 2, true); c.closePath();
  }, (x, y) => {
    if (y < 905 && Math.abs(x - CUPX) < 48) return y < 900 ? C('#a87750') : C('#5a3a26');   // coffee and crema at the rim
    if (y > 914 && y < 926 && x < CUPX + 52) return teal;
    return mix(white, whiteShade, smooth(CUPX - 30, CUPX + 70, x));
  }, { fine: .6 });
  /* the gull */
  const gw = C('#f5f3ee'), gShade = C('#d6dadb'), grey = C('#98a3ab'), black = C('#2b2f33'), leg = C('#e3925a');
  R('gullLegs', 'still', union(bar(GULL.x - 18, SILL + 1, GULL.x - 12, GULL.y + 30, 9), bar(GULL.x + 6, SILL + 1, GULL.x + 2, GULL.y + 30, 9)), () => leg, { fine: .56 });
  R('gullBody', 'still', union(ell(GULL.x, GULL.y, 64, 33, -.12), disc(GULL.x - 52, GULL.y - 34, 26)), (x, y) => mix(gw, gShade, smooth(GULL.y - 4, GULL.y + 30, y) * .8), { fine: .6 });
  R('gullWing', 'still', blade(GULL.x - 30, GULL.y - 20, GULL.x + 30, GULL.y - 28, GULL.x + 92, GULL.y - 2, 30, 8), x => x > GULL.x + 58 ? black : grey, { fine: .56 });
  R('gullBeak', 'still', poly([[GULL.x - 74, GULL.y - 40], [GULL.x - 104, GULL.y - 31], [GULL.x - 74, GULL.y - 26]]), (x, y) => x < GULL.x - 92 && y > GULL.y - 33 ? C('#d0452e') : C('#f0c23a'), { fine: .52 });
  R('gullEye', 'still', disc(GULL.x - 58, GULL.y - 40, 5), () => black, { fine: .5 });
  return out;
}

const outlines = [
  { inside: ['still'], against: ['view', 'lib', 'tree'] },
  { inside: ['lib'], against: ['sky', 'sea', 'land', 'lawn'] },
];

function liveKind(t, r) { return r.live === 'sky' ? 'sky' : r.live === 'sun' ? 'sun' : r.live === 'sea' ? 'sea' : null; }
function frameState(time) { return { birds: birdsAt(time, [[0, 24, 300, 62], [1, 31, 380, 50], [2, 40, 214, 44]]), band: (time * 30) % 1500 - 250, time }; }
function liveColour(s, F, L) {
  if (s.kind === 'sky') {
    for (const bd of F.birds) if (inBird(bd, s.ux, s.uy)) return mix(s.col, P.bird, .86);
    return null;
  }
  if (s.kind === 'sun') {
    const a = Math.atan2(s.uy - L.sun[1], s.ux - L.sun[0]), gl = Math.max(0, Math.cos(a - F.time * .4 - s.row * .6)) ** 12;
    return gl > .02 ? mix(s.col, [255, 252, 236], gl * .35) : null;
  }
  if (s.kind === 'sea') {
    // swells rolling toward the shore: a lighter crest moves down through the rows
    const d = s.uy - HORIZON, v = Math.sin(d * .11 - F.time * 1.15 + Math.sin(s.ux / 90) * .8);
    let c = null;
    if (v > .86) c = mix(s.col, P.crest, (v - .86) / .14 * .55 * smooth(0, 60, d));
    const glit = Math.max(0, Math.sin(F.time * 2.6 + s.h * 61)) ** 30 * (1 - smooth(0, 70, Math.abs(s.ux - L.sun[0] - 40) - 40));
    if (glit > .05) c = mix(c || s.col, [255, 255, 245], glit * .7);
    return c;
  }
  return null;
}

export default {
  key: 'sd', place: 'San Diego', light, regions, outlines, liveKind, frameState, liveColour, isStar: () => false,
  alt: () => 'The window onto San Diego on a clear morning: the Geisel Library, its glass floors stepping out over splayed concrete piers, eucalyptus on either side and the Pacific behind; on the sill a stack of zines with one standing up, a coffee cup on its saucer and a gull.',
};
