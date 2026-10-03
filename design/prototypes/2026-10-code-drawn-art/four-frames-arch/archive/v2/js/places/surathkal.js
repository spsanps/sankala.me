/* Surathkal, 2015 – 2019, at night: the Arabian Sea under a full moon, the lighthouse on its
   headland, coconut palms over the beach, and the stars (the astronomy club years).
   On the sill: a star chart unrolled and standing up, a small pocket oscilloscope showing a square
   wave (the NITK electronics lab), and a conch from the beach.
   Palette: sky #0e1a3c → #1c3466 → #2c4677; moon #f3ecd2; sea #13284e → #1d3d6c, moon path #7d93b8;
   headland #161e2e / #2f3b55; tower #e6e2d6 / #a9afc0 with red bands #b8402e, lantern #f7d27a;
   palms #0c1424 / #26365a; sand #6e7487; chart #1f2f63 with gold #e2b552; scope #4f5e6e,
   screen #0d2a22, trace #7dfc9a; conch #f1dcc4 / #e4a98c, lip #e8a2a0. */
import { mix, clamp, smooth, rgb, vnoise } from '../core.js';
import { IN_X0, IN_X1, SILL, poly, disc, ell, bar, below, union, blade, regionList, segDist } from '../geom.js';

const C = s => rgb(s);
const P = {
  skyTop: C('#0e1a3c'), skyMid: C('#1c3466'), skyHor: C('#2c4677'), moon: C('#f3ecd2'), moonDim: C('#dcd3b6'), halo: C('#3b5486'),
  sea: C('#0b1834'), seaFar: C('#13264a'), path: C('#8aa0c4'), foam: C('#b9c6da'), horizonGlow: C('#3e5a8c'),
  head: C('#141b2a'), headLit: C('#34405c'), sand: C('#8a8778'), sandWet: C('#5f6273'),
  tower: C('#e6e2d6'), towerShade: C('#a9afc0'), red: C('#b8402e'), redShade: C('#8a2f24'), iron: C('#22262e'), lamp: C('#f7d27a'), cap: C('#7a2a20'),
  palm: C('#0c1424'), palmLit: C('#26365a'), outline: C('#2b2925'),
};
function light() { return { pal: P, moon: { at: [474, 246], r: 56 }, caption: 'Surathkal · a night by the sea', label: 'a night by the sea', night: 1, stars: 1 }; }

const HORIZON = 640;
const headY = x => 736 - 64 * smooth(560, 700, x) + 10 * Math.sin(x / 33) - 18 * smooth(860, 930, x) * 0;
const SHORE = x => 856 + 10 * Math.sin(x / 60 + 1);
const LH = { x: 772, base: 690, top: 470 };
/* each frond: [tip dx, tip dy, lift of its middle] from the crown */
const PALMS = [
  { root: [146, 912], mid: [166, 760], crown: [216, 560], s: 1, fronds: [[-214, 74, 70], [-190, -26, 64], [-118, -104, 50], [-12, -132, 40], [104, -96, 50], [196, -16, 62], [212, 86, 70], [-90, 120, 40], [80, 126, 40]] },
  { root: [316, 912], mid: [306, 800], crown: [282, 664], s: .74, fronds: [[-200, 60, 64], [-150, -60, 56], [-40, -128, 40], [90, -110, 50], [190, -20, 60], [180, 90, 64]] },
];
const MOON_X = 474;
/* the star chart: the Plough (seven stars) in gold, joined by lines */
const CH = { x0: 118, x1: 346, y0: 796, y1: 968 };
const DIPPER = [[150, 842], [190, 832], [228, 850], [262, 862], [300, 896], [318, 940], [270, 934]];
const SEGS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];
const EXTRA = [[136, 918], [208, 900], [330, 816], [232, 948], [176, 806], [312, 862]];
const SC = { x0: 628, x1: 792, y0: 884, sx0: 642, sx1: 744, sy0: 898, sy1: 962 };
const CONCH = { x: 872, y: 972 };

function regions(L) {
  const out = regionList(), R = out.R, [mx, my] = L.moon.at, mr = L.moon.r;
  R('sky', 'view', c => c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, HORIZON + 4 - 60), (x, y) => {
    const t = clamp((y - 70) / (HORIZON - 70));
    const c = t < .55 ? mix(P.skyTop, P.skyMid, t / .55) : mix(P.skyMid, P.skyHor, (t - .55) / .45);
    return mix(c, P.halo, .55 * (1 - smooth(mr, mr + 150, Math.hypot(x - mx, y - my))));
  }, { live: 'sky' });
  R('moon', 'view', disc(mx, my, mr), (x, y) => mix(P.moon, P.moonDim, smooth(.45, .75, vnoise(x / 22, y / 22, 13)) * .8), { fine: .82 });
  R('sea', 'view', below(() => HORIZON), (x, y) => {
    let c = mix(P.seaFar, P.sea, smooth(HORIZON, HORIZON + 140, y));
    c = mix(c, P.horizonGlow, .6 * (1 - smooth(0, 14, y - HORIZON)));           // a faint glow along the horizon
    const w = 14 + (y - HORIZON) * .32;
    return mix(c, P.path, .55 * (1 - smooth(w * .4, w, Math.abs(x - MOON_X - (y - HORIZON) * .05))));
  }, { src: 'courses', live: 'sea' });
  R('head', 'view', c => { c.moveTo(560, SILL + 1); for (let x = 560; x <= IN_X1 + 4; x += 5) c.lineTo(x, headY(x)); c.lineTo(IN_X1 + 4, SILL + 1); c.closePath(); },
    (x, y) => mix(P.headLit, P.head, smooth(0, 26, y - headY(x))), { src: ['sky', 'sea'] });
  R('sand', 'view', below(SHORE, IN_X0 - 4, 640), (x, y) => { const d = y - SHORE(x); return d < 9 ? P.foam : mix(P.sandWet, P.sand, smooth(9, 50, d)); }, { src: ['sea'], live: 'foam' });
  /* the lighthouse */
  R('tower', 'lh', poly([[LH.x - 36, LH.base + 6], [LH.x - 24, LH.top], [LH.x + 24, LH.top], [LH.x + 36, LH.base + 6]]), (x, y) => {
    const band = (y > 520 && y < 556) || (y > 604 && y < 640);
    const shade = x > LH.x + 4;
    return band ? (shade ? P.redShade : P.red) : (shade ? P.towerShade : P.tower);
  }, { fine: .66, src: 'courses' });
  R('gallery', 'lh', c => c.rect(LH.x - 34, LH.top - 12, 68, 14), () => P.iron, { fine: .56 });
  R('lantern', 'lh', c => c.rect(LH.x - 20, LH.top - 50, 40, 38), x => Math.abs(x - LH.x) % 13 < 3 ? mix(P.lamp, P.iron, .6) : P.lamp, { fine: .52, live: 'lamp' });
  R('cap', 'lh', c => { c.moveTo(LH.x + 25, LH.top - 50); c.arc(LH.x, LH.top - 50, 25, 0, Math.PI, true); c.closePath(); }, () => P.cap, { fine: .56 });
  /* palms */
  for (const [n, pm] of PALMS.entries()) {
    R('palmTrunk' + n, 'palm', blade(...pm.root, ...pm.mid, ...pm.crown, 26, 16), (x, y) => mix(P.palmLit, P.palm, .55 + .45 * smooth(-6, 8, x - pm.mid[0])), { fine: .62 });
    const [cx, cy] = pm.crown;
    R('fronds' + n, 'palm', union(...pm.fronds.map(([dx, dy, lift]) => blade(cx, cy, cx + dx * .5 * pm.s, cy + (dy * .5 - lift) * pm.s, cx + dx * pm.s, cy + dy * pm.s, 30 * pm.s + 6, 2)), disc(cx, cy + 10, 20 * pm.s + 4)),
      (x, y) => mix(P.palm, P.palmLit, .5 * smooth(0, -120, (x - cx) + (y - cy) * .8)), { fine: .62 });
  }
  /* the sill: the star chart, standing up between its two rolls */
  const navy = C('#1f2f63'), navyDeep = C('#17244e'), gold = C('#e2b552'), paper = C('#eadfc4'), paperShade = C('#b9ab8c');
  R('chartFace', 'still', c => c.rect(CH.x0, CH.y0, CH.x1 - CH.x0, CH.y1 - CH.y0), (x, y) => {
    for (const [sx, sy] of DIPPER) if (Math.hypot(x - sx, y - sy) < 8.5) return C('#fff1c2');
    for (const [sx, sy] of EXTRA) if (Math.hypot(x - sx, y - sy) < 5) return gold;
    for (const [a, b] of SEGS) if (segDist(x, y, ...DIPPER[a], ...DIPPER[b]) < 3.6) return gold;
    return mix(navy, navyDeep, smooth(CH.y0, CH.y1, y) * .6);
  }, { fine: .56 });
  const roll = (x, y, cy) => mix(paper, paperShade, smooth(-6, 14, y - cy));
  R('chartTop', 'still', bar(CH.x0 - 8, CH.y0 - 2, CH.x1 + 8, CH.y0 - 2, 26), (x, y) => roll(x, y, CH.y0 - 2), { fine: .56 });
  R('chartBot', 'still', bar(CH.x0 - 10, CH.y1 + 16, CH.x1 + 10, CH.y1 + 16, 30), (x, y) => roll(x, y, CH.y1 + 16), { fine: .56 });
  /* the pocket oscilloscope */
  const body = C('#4f5e6e'), bodyLit = C('#6f8090'), screen = C('#0d2a22'), grid = C('#1d4a3a'), knob = C('#20262c');
  R('scope', 'still', c => { c.rect(SC.x0, SC.y0, SC.x1 - SC.x0, SILL + 1 - SC.y0); }, (x, y) => mix(bodyLit, body, smooth(SC.y0, SC.y0 + 30, y) * .7 + smooth(SC.x0, SC.x1, x) * .3), { fine: .6, src: 'courses' });
  R('screen', 'still', c => c.rect(SC.sx0, SC.sy0, SC.sx1 - SC.sx0, SC.sy1 - SC.sy0), (x, y) => ((x - SC.sx0) % 25 < 2 || (y - SC.sy0) % 21 < 2) ? grid : screen, { fine: .5, live: 'screen' });
  R('knobs', 'still', union(disc(770, 914, 11), disc(770, 946, 11)), () => knob, { fine: .5 });
  /* the conch */
  const shell = C('#f1dcc4'), shellStripe = C('#e4a98c'), lip = C('#e8a2a0');
  R('conch', 'still', union(ell(CONCH.x, CONCH.y, 52, 26, -.18), poly([[CONCH.x + 30, CONCH.y - 22], [CONCH.x + 84, CONCH.y - 6], [CONCH.x + 38, CONCH.y + 14]])), (x, y) => {
    if (Math.hypot((x - CONCH.x + 18) / 26, (y - CONCH.y - 2) / 14) < 1) return lip;
    return Math.floor((x - CONCH.x + y * .5) / 14) % 2 === 0 ? shell : mix(shell, shellStripe, .8);
  }, { fine: .56 });
  return out;
}

const outlines = [
  { inside: ['still'], against: ['view', 'lh', 'palm'] },
  { inside: ['lh'], against: ['sky', 'sea', 'head'] },
];

function liveKind(t, r, L) { return r.live === 'sky' ? 'sky' : r.live === 'sea' ? 'sea' : r.live === 'screen' ? 'screen' : r.live === 'lamp' ? 'lamp' : r.live === 'foam' && t.uy - SHORE(t.ux) < 12 ? 'foam' : null; }
function frameState(time) {
  const ph = time * .55, cx = Math.cos(ph);
  return { time, beam: { side: Math.sign(cx) || 1, len: 640 * Math.pow(Math.abs(cx), .6), b: Math.pow(Math.abs(cx), .5) }, flare: Math.max(0, Math.sin(ph)) ** 8 };
}
const LAMP = [LH.x, LH.top - 31];
function liveColour(s, F, L) {
  if (s.kind === 'sky' || s.kind === 'sea') {
    let col = null;
    const dx = s.ux - LAMP[0], dy = s.uy - LAMP[1];
    if (Math.sign(dx) === F.beam.side && Math.abs(dx) < F.beam.len) {
      const ang = Math.abs(Math.atan2(-dy - Math.abs(dx) * .02, Math.abs(dx))), spread = .07 + Math.abs(dx) * .00012;
      const b = Math.exp(-((ang / spread) ** 2)) * (1 - Math.abs(dx) / F.beam.len) * F.beam.b;
      if (b > .03) col = mix(s.col, [255, 236, 184], b * .55);
    }
    if (s.star) { const tw = .5 + .5 * Math.sin(F.time * (1.2 + s.h2 * 2.4) + s.h * 50); col = mix(col || s.col, [255, 246, 214], .35 + .55 * tw); }
    if (s.kind === 'sea') {
      const w = 14 + (s.uy - HORIZON) * .32, inPath = 1 - smooth(w * .4, w * 1.1, Math.abs(s.ux - MOON_X - (s.uy - HORIZON) * .05));
      const g = Math.max(0, Math.sin(F.time * 2.8 + s.h * 70)) ** 18 * inPath;
      if (g > .05) col = mix(col || s.col, [255, 250, 230], g * .8);
    }
    return col;
  }
  if (s.kind === 'screen') {
    // the trace runs across the little screen: a square wave
    const x = s.ux - SC.sx0 + F.time * 22, hi = Math.floor(x / 34) % 2 === 0, yL = hi ? 914 : 946;
    const onLevel = Math.abs(s.uy - yL) < 4.5, onEdge = (x % 34 < 4.5 || x % 34 > 29.5) && s.uy > 910 && s.uy < 950;
    return onLevel || onEdge ? C('#8dffa8') : null;
  }
  if (s.kind === 'lamp') return F.flare > .05 ? mix(s.col, [255, 252, 236], F.flare * .7) : null;
  if (s.kind === 'foam') { const f = Math.sin(F.time * .9 - s.ux * .03); return f > .4 ? mix(s.col, [236, 242, 250], (f - .4) * .9) : mix(s.col, P.sandWet, (.4 - f) * .5); }
  return null;
}

export default {
  key: 'nitk', place: 'Surathkal', light, regions, outlines, liveKind, frameState, liveColour,
  isStar: (r, L, t, uy) => r.name === 'sky' && t.h > .962 && uy < HORIZON - 30 && Math.hypot(t.ux - L.moon.at[0], t.uy - L.moon.at[1]) > L.moon.r + 60,
  alt: () => 'The window onto Surathkal at night: the Arabian Sea under a full moon, the red-and-white lighthouse on its headland, coconut palms over the beach and a sky full of stars; on the sill an unrolled star chart showing the Plough, a pocket oscilloscope with a square wave and a conch.',
};
