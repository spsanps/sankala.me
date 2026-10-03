/* San Diego, 2022 – 2024, a clear morning. Behind the desk: the Geisel Library (a small podium,
   splayed concrete piers, six floors of glass that step out to the widest in the middle and in again
   to the roof), the Pacific along the horizon, the sandstone bluffs of Torrey Pines with a gnarled
   Torrey pine on top, and in front a lawn strewn with flowers, like the meadow at the foot of a
   Ravenna apse. The conch is morning gold, the sun low on the left; gulls cross it.
   Palette: sea #2d6f9f / #5b9fc6, crest #e8f4f6; bluff #d9a77a / shade #b07a52; lawn #6f9a4a /
   #4f7e3a; concrete #ece6d8 / #c9c0b0; glass #3c5866 / #7397a8; pine #3f5e3a. */
import { mix, clamp, smooth, lerp, rgb, vnoise, hash2 } from '../core.js';
import { RI, poly, disc, ell, bar, below, union, blade, regionList } from '../geom.js';
import { deskRegions, deskOutlines, deskShadow } from '../desk.js';
import { groundColour, groundMat } from './sky.js';
import { MAT } from '../arch.js';
import { birdsAt, inBird } from './life.js';

const C = s => rgb(s);
const P = {
  sea: C('#2d6f9f'), seaFar: C('#5b9fc6'), crest: C('#e8f4f6'),
  bluff: C('#dcaa7c'), bluffLit: C('#ecc79c'), bluffShade: C('#b07a52'), scrub: C('#8f9a5e'), pine: C('#3f5e3a'), pineLit: C('#62824f'), bark: C('#5a4632'),
  lawn: C('#5f8a43'), lawnLit: C('#79a253'), lawnDark: C('#466f35'), path: C('#e6dcc2'),
  concrete: C('#ece6d8'), concreteShade: C('#c9c0b0'), glass: C('#3c5866'), glassLit: C('#7397a8'), glassDeep: C('#2c4250'),
  bird: C('#3a3330'), flowers: [C('#f3efe4'), C('#f2d36a'), C('#d9573c'), C('#efe7d6')],
};
function light() {
  return { pal: P, tint: [1.02, 1, .97], caption: 'San Diego · a clear morning', label: 'a clear morning', day: 1, golden: .15, dusk: 0, night: 0, lamp: 0, stars: 0 };
}

/* the library, drawn in the window study's coordinates (centre 520, ground 862) and placed here */
const LX0 = 520, G0 = 862, POD = { top: 808, w: 224 };
const FLOORS = [[680, 716, 290], [644, 680, 358], [608, 644, 412], [574, 608, 420], [541, 574, 378], [510, 541, 326]];
const ROOF = [497, 510, 278];
const PIERS = [[22, 52, 716, 26], [58, 110, 716, 27], [96, 180, 680, 27]].flatMap(p => [[-1, ...p], [1, ...p]]);

function layout(A) {
  const t = A.t, sd = A.sd;
  const hor = lerp(-152, A.deskY - 205 * sd, t);
  const lib = { x: lerp(-352, 20, t), g: lerp(-62, A.deskY - 170 * sd, t), s: lerp(.47, .6, t) };
  const coast = x => hor + lerp(24, 34, t) + 5 * Math.sin(x / 40);
  const lawnY = x => hor + lerp(46, 64, t) + 4 * Math.sin(x / 60 + 2);
  /* the bluffs rise at the right and fall sheer into the sea */
  const bx = lerp(272, 250, t), bluffTop = hor - lerp(56, 64, t);
  const bluffY = x => x < bx ? 1e9 : bluffTop + 6 * Math.sin(x / 19) + 10 * smooth(bx + 40, bx, x) * 3;
  const pine = { x: lerp(430, 400, t), y: bluffTop + 2, s: lerp(1, 1.3, t) };
  const sun = [lerp(-232, -250, t), lerp(-372, -330, t)];
  return { t, hor, lib, coast, lawnY, bx, bluffTop, bluffY, pine, sun };
}

function regions(L, A) {
  const out = regionList(), R = out.R, Y = layout(A), F = A.F;
  const T = (x, y) => [Y.lib.x + (x - LX0) * Y.lib.s, Y.lib.g + (y - G0) * Y.lib.s];
  const TI = (x, y) => [LX0 + (x - Y.lib.x) / Y.lib.s, G0 + (y - Y.lib.g) / Y.lib.s];
  const tpoly = pts => poly(pts.map(([x, y]) => T(x, y)));
  const vOf = (x, y) => clamp((y + RI) / (Y.hor + RI));
  const [sx, sy] = Y.sun, sr = lerp(42, 52, A.t);
  R('sky', 'sky', c => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8), (x, y) => groundColour(L, vOf(x, y), .3 * (1 - smooth(sr, sr * 4.5, Math.hypot(x - sx, y - sy)))),
    { live: 'sky', matAt: (x, y) => groundMat(L, vOf(x, y)), fine: 1.02, src: ['outside'], halo: 2 });
  R('rays', 'sun', c => { for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r1 = sr * (i % 2 ? 1.36 : 1.62), w = .16; c.moveTo(sx + Math.cos(a - w) * sr * .9, sy + Math.sin(a - w) * sr * .9); c.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); c.lineTo(sx + Math.cos(a + w) * sr * .9, sy + Math.sin(a + w) * sr * .9); c.closePath(); } },
    () => C('#e9873a'), { fine: .6, mat: MAT.GOLD, live: 'rays' });
  R('sun', 'sun', disc(sx, sy, sr), (x, y) => { const d = Math.hypot(x - sx, y - sy) / sr; return d > .8 ? C('#e07a35') : mix(C('#fff7dc'), C('#f6d27a'), smooth(0, .8, d)); }, { fine: .64, mat: MAT.GOLD, live: 'sun' });
  /* the Pacific */
  R('sea', 'view', below(() => Y.hor, -RI - 4, RI + 4, F + 2), (x, y) => {
    const d = y - Y.hor, row = Math.floor(d / 7);
    let c = mix(P.seaFar, P.sea, smooth(0, 30, d));
    if (row % 3 === 1 && hash2(x / 22 | 0, row, 3) > .55) c = mix(c, P.crest, .45);         // white caps in rows
    return c;
  }, { src: 'courses', live: 'sea', fine: .9 });
  R('bluff', 'view', c => { c.moveTo(Y.bx, F + 2); for (let x = Y.bx; x <= RI + 4; x += 4) c.lineTo(x, Y.bluffY(x)); c.lineTo(RI + 4, F + 2); c.closePath(); }, (x, y) => {
    const d = y - Y.bluffY(x), face = x < Y.bx + 26;
    if (d < 7) return mix(P.scrub, P.pine, hash2(x / 10 | 0, 1, 9) * .4);                    // scrub along the top
    const band = Math.floor((d + 4 * Math.sin(x / 30)) / 11) % 3;                              // the sandstone's layers
    return face ? mix(P.bluffShade, P.bluff, .3 + band * .1) : mix(band === 1 ? P.bluffLit : P.bluff, P.bluffShade, smooth(0, 90, d) * .35);
  }, { src: 'courses' });
  R('coast', 'view', below(Y.coast, -RI - 4, RI + 4, F + 2), (x, y) => mix(P.scrub, P.lawnDark, smooth(0, 30, y - Y.coast(x)) * .5 + .2 * vnoise(x / 30, y / 12, 5)), { src: ['sea', 'bluff'] });
  R('lawn', 'view', below(Y.lawnY, -RI - 4, RI + 4, F + 2), (x, y) => {
    const h = hash2(x / 8 | 0, y / 8 | 0, 41), d = y - Y.lawnY(x);
    if (h > .955 && d > 10 && vnoise(x / 60, y / 40, 8) > .45 && deskShadow(A, x, y) < .2) return P.flowers[(hash2(x / 8 | 0, y / 8 | 0, 42) * 4) | 0];   // flowers, in drifts
    const c = mix(mix(P.lawnLit, P.lawn, smooth(0, 40, d)), P.lawnDark, smooth(.55, .8, vnoise(x / 34, y / 14, 7)) * .4);
    return mix(c, mix(P.lawnDark, [20, 40, 20], .35), deskShadow(A, x, y) * .75);
  }, { src: 'courses', fine: .92 });
  /* the Torrey pine on the bluff: a crooked trunk and flat, wind-shaped crowns */
  const pn = Y.pine, k = pn.s;
  R('pineTrunk', 'tree', union(blade(pn.x, pn.y + 4, pn.x - 6 * k, pn.y - 30 * k, pn.x + 10 * k, pn.y - 58 * k, 10 * k, 6 * k), blade(pn.x - 2 * k, pn.y - 30 * k, pn.x - 22 * k, pn.y - 44 * k, pn.x - 38 * k, pn.y - 50 * k, 6 * k, 3 * k)), () => P.bark, { fine: .6 });
  R('pine', 'tree', union(ell(pn.x + 12 * k, pn.y - 70 * k, 40 * k, 14 * k, -.08), ell(pn.x - 34 * k, pn.y - 56 * k, 26 * k, 10 * k, .1), ell(pn.x + 30 * k, pn.y - 50 * k, 24 * k, 9 * k)), (x, y) => mix(P.pineLit, P.pine, smooth(pn.y - 84 * k, pn.y - 50 * k, y)), { fine: .66 });
  /* the library */
  const facet = (lx, f) => { const u = (lx - LX0) / (f[2] / 2); return u < -.8 ? -1 : u > .8 ? 1 : 0; };
  const floorAt = ly => { for (const f of [...FLOORS, ROOF]) if (ly >= f[0] && ly < f[1] + .5) return f; return null; };
  R('libCore', 'lib', tpoly([[LX0 - 112, FLOORS[0][1] - 2], [LX0 + 112, FLOORS[0][1] - 2], [LX0 + 112, POD.top + 2], [LX0 - 112, POD.top + 2]]), (x, y) => mix(P.glassDeep, P.glass, smooth(FLOORS[0][1], POD.top, TI(x, y)[1]) * .5), { fine: .6, src: 'courses' });
  R('podium', 'lib', tpoly([[LX0 - POD.w / 2, POD.top], [LX0 + POD.w / 2, POD.top], [LX0 + POD.w / 2, G0 + 1], [LX0 - POD.w / 2, G0 + 1]]), (x, y) => {
    const [lx, ly] = TI(x, y);
    if (ly < POD.top + 9) return lx > LX0 + POD.w * .3 ? P.concreteShade : P.concrete;
    return mix(Math.abs(((lx - LX0) / 22) % 1) < .18 ? P.concreteShade : P.glassLit, P.glass, smooth(POD.top + 9, G0, ly) * .7);
  }, { fine: .6, src: 'courses' });
  R('piers', 'lib', union(...PIERS.map(([sd, b, tt, yt, w]) => {
    const x0 = LX0 + sd * b, x1 = LX0 + sd * tt, a = Math.atan2(yt - POD.top, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    return tpoly([[x0 + nx * 8, POD.top + 4 + ny * 8], [x1 + nx * w / 2, yt + ny * w / 2], [x1 - nx * w / 2, yt - ny * w / 2], [x0 - nx * 8, POD.top + 4 - ny * 8]]);
  })), (x, y) => { const [lx, ly] = TI(x, y); return mix(P.concrete, P.concreteShade, lx < LX0 ? .08 + .2 * smooth(POD.top, 700, ly) : .55); }, { fine: .6 });
  R('library', 'lib', c => {
    for (const f of [...FLOORS, ROOF]) {
      const hw = f[2] / 2, ch = Math.min(26, hw * .14);
      const pts = [[LX0 - hw + ch, f[0]], [LX0 + hw - ch, f[0]], [LX0 + hw, f[0] + 3], [LX0 + hw, f[1] + .8], [LX0 - hw, f[1] + .8], [LX0 - hw, f[0] + 3]].map(([x, y]) => T(x, y));
      c.moveTo(...pts[0]); for (const p of pts.slice(1)) c.lineTo(...p); c.closePath();
    }
  }, (x, y) => {
    const [lx, ly] = TI(x, y), f = floorAt(ly); if (!f) return P.concrete;
    const side = facet(lx, f), ledge = ly > f[1] - 12 || f === ROOF;
    if (ledge) return side > 0 ? P.concreteShade : side < 0 ? mix(P.concrete, [255, 255, 255], .3) : mix(P.concrete, P.concreteShade, .14);
    let c = mix(P.glassLit, P.glass, smooth(.05, .85, (ly - f[0]) / (f[1] - 12 - f[0])));
    if (side > 0) c = mix(c, P.glassDeep, .55); else if (side < 0) c = mix(c, P.glassLit, .35);
    return c;
  }, { fine: .6, src: 'courses' });
  deskRegions(R, L, A);
  return out;
}

function liveKind(t, r) { return r.live === 'sky' ? 'sky' : r.live === 'sea' ? 'sea' : null; }
function frameState(time, L, A) {
  const t = A ? A.t : 0;
  return { birds: birdsAt(time, [[0, 26, lerp(-300, -150, t), 26], [1, 33, lerp(-262, -110, t), 20], [2, 41, lerp(-340, -220, t), 18]]), time };
}
function liveColour(s, F) {
  if (s.kind === 'sky') { for (const bd of F.birds) if (inBird(bd, s.ux, s.uy)) return mix(s.col, P.bird, .86); return null; }
  if (s.kind === 'sea') {
    const v = Math.sin(s.uy * .2 - F.time * 1.1 + Math.sin(s.ux / 70) * .8);
    let c = v > .88 ? mix(s.col, P.crest, (v - .88) / .12 * .5) : null;
    const g = Math.max(0, Math.sin(F.time * 2.4 + s.h * 61)) ** 30;
    if (g > .05) c = mix(c || s.col, [255, 255, 245], g * .6);
    return c;
  }
  return null;
}

export default {
  key: 'sd', place: 'San Diego', light, regions, liveKind, frameState, liveColour, isStar: () => false,
  outlines: [
    ...deskOutlines(['rays', 'sky', 'sun', 'view', 'lib', 'tree']),
    { inside: ['lib'], against: ['sky', 'sun', 'view'] },
  ],
  alt: () => 'The apse, laid in mosaic: San’s desk with its red lamp, a stack of books, the laptop, the blue paper robot and a telescope, and behind it, on a clear San Diego morning, the stepped glass floors of the Geisel Library, the Pacific, the sandstone bluffs of Torrey Pines with a Torrey pine, and a lawn full of flowers, under a gold conch with the morning sun.',
};
