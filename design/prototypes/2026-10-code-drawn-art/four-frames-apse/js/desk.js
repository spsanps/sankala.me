/* The apse in mosaic: San's desk and its attributes, the same in every place, the way an apse
   shows one figure with the things that identify it. Five things, big and unmistakable:
   the red lamp, a stack of books with gilt spines, the laptop (its screen dark glass with lines of
   code in gold, teal and rose), the blue paper robot, and a telescope on its tripod aimed at the sky.
   The desk is walnut, seen from the front, its top tipped up a little toward you (as Byzantine
   tables are) so the things stand on it clearly.
   Drawn in desk units (the desk's top at y = 0, its middle at x = 0), scaled by `sd` into the conch.
   The place's light tints everything (`L.tint`); after dark the lamp is lit and pools on the desk,
   and the screen glows. */
import { mix, clamp, smooth, rgb, lerp } from './core.js';
import { poly, disc, bar, rect, union, LEG } from './geom.js';
import { MAT } from './arch.js';

const C = s => rgb(s);
export const DESK_PAL = {
  walnutTop: C('#a8743f'), walnutTopLit: C('#c48c52'), walnutFront: C('#6b4428'), walnutDeep: C('#4b2f1c'), leg: C('#5e3c24'),
  brass: C('#d9a948'), brassDark: C('#9a7128'),
  alu: C('#d3d6da'), aluShade: C('#a9aeb5'), aluLit: C('#eceef0'), bezel: C('#26292f'), screen: C('#132447'), screenDeep: C('#0e1a35'),
  code: [C('#e8c46a'), C('#63c6b4'), C('#ea8f8a'), C('#d4dcea')],
  mesh: C('#2c2f36'), meshLit: C('#474c56'), frame: C('#1b1d21'), chrome: C('#9aa1aa'),
  cobalt: C('#2f62bf'), cobaltLit: C('#4f84dc'), cobaltDeep: C('#1f448f'), eye: C('#f6f2e6'), pupil: C('#17191e'), ear: C('#d64a35'),
  tube: C('#2f6f80'), tubeShade: C('#1b4452'), tubeLit: C('#5aa0ad'), iron: C('#3b3431'), lens: C('#2a4a6a'),
  red: C('#cf452c'), redLit: C('#ea6a45'), redDeep: C('#962f1d'), bulb: C('#ffe7a6'),
  books: [C('#2c4f92'), C('#d29e3a'), C('#a7342b'), C('#3b6c4f')], pages: C('#efe4c8'),
};
const CODE = [   // [x0, x1, colour] from the screen's left edge, one line each
  [[0, 56, 0], [64, 118, 3]], [[14, 52, 1], [60, 136, 3]], [[28, 78, 2], [86, 150, 3]], [[28, 104, 3]],
  [[14, 44, 1], [52, 112, 0]], [[28, 128, 3]], [[0, 34, 0], [42, 76, 3]], [[0, 9, 3]],
];

/** The desk's things, laid out for this apse. Returns helpers and the shapes (in units). */
export function deskLayout(A) {
  const s = A.sd, t = A.t;
  const X = lx => lx * s, Y = ly => A.deskY + ly * s;
  const P = (lx, ly) => [X(lx), Y(ly)];
  const pts = arr => arr.map(([a, b]) => P(a, b));
  /* the telescope: steeper and shorter in a tall apse */
  const th = lerp(52, 60, t) * Math.PI / 180, mount = [lerp(266, 258, t), -112], len = lerp(132, 128, t);
  const d = [Math.cos(th), -Math.sin(th)];
  const E = [mount[0] - d[0] * 56, mount[1] - d[1] * 56], O = [mount[0] + d[0] * len, mount[1] + d[1] * len];
  const at = k => [mount[0] + d[0] * k, mount[1] + d[1] * k];
  /* the lamp: base, two arms, the shade aimed down at the books */
  const lampHead = [-156, -262], sh = (() => { const a = [.3, 1], l = Math.hypot(...a); return [a[0] / l, a[1] / l]; })();
  const shN = [-sh[1], sh[0]], mouth = [lampHead[0] + sh[0] * 74, lampHead[1] + sh[1] * 74];
  return { s, X, Y, P, pts, d, E, O, at, mount, th, lampHead, sh, shN, mouth };
}

export function deskRegions(R, L, A) {
  const D = DESK_PAL, K = deskLayout(A), { X, Y, P, pts, d } = K, s = A.sd;
  const tint = c => [c[0] * L.tint[0], c[1] * L.tint[1], c[2] * L.tint[2]].map(v => Math.min(255, v));
  const lamp = L.lamp || 0;
  const lampPool = (x, y) => lamp * (1 - smooth(30 * s, 250 * s, Math.hypot(x - X(K.mouth[0]), (y - Y(-20)) * 1.8)));
  const warm = (c, x, y) => mix(tint(c), [255, 206, 128], .5 * lampPool(x, y));
  const local = (x, y) => [x / s, (y - A.deskY) / s];

  /* the desk */
  R('deskLegs', 'desk', union(poly(pts([[-324, 44], [-296, 44], [-299, LEG], [-319, LEG]])), poly(pts([[296, 44], [324, 44], [319, LEG], [299, LEG]]))),
    (x, y) => warm(mix(D.leg, D.walnutDeep, smooth(-12, 14, Math.abs(local(x, y)[0]) - 310)), x, y), { fine: .8, src: 'courses' });
  R('deskApron', 'desk', rect(X(-326), Y(17), X(652), 30 * s), (x, y) => {
    const [lx, ly] = local(x, y);
    if (Math.hypot(lx, ly - 33) < 5.5) return tint(D.brass);
    if (Math.abs(lx) < 84 && Math.abs(lx) > 76 || (Math.abs(lx) < 84 && (ly < 23 || ly > 43))) return warm(D.walnutDeep, x, y);   // the drawer's edge
    return warm(mix(D.walnutFront, D.walnutDeep, .25), x, y);
  }, { fine: .76, src: 'courses' });
  R('deskFront', 'desk', rect(X(-344), Y(0), X(688), 18 * s), (x, y) => warm(D.walnutFront, x, y), { fine: .76, src: 'courses' });
  R('deskTop', 'desk', poly(pts([[-356, -15], [356, -15], [344, .5], [-344, .5]])), (x, y) => {
    const [lx] = local(x, y);
    return warm(mix(D.walnutTopLit, D.walnutTop, smooth(-300, 300, lx) * .6), x, y);
  }, { fine: .74, src: 'courses' });

  /* after dark the lamp's light is drawn the way an apse draws light from heaven: gold rays fanning down onto the desk */
  if (lamp > .5) {
    const m0 = K.mouth, rays = [];
    for (let k = -2; k <= 2; k++) {
      const a = Math.atan2(K.sh[1], K.sh[0]) + k * .2, len = 150 + 40 * (1 - Math.abs(k) / 2);
      const ex = m0[0] + Math.cos(a) * len, ey = Math.min(-4, m0[1] + Math.sin(a) * len);
      rays.push(bar(...P(m0[0] + Math.cos(a) * 14, m0[1] + Math.sin(a) * 14), ...P(ex, ey), (9 - Math.abs(k) * 1.5) * s));
    }
    R('lampRays', 'rays', union(...rays), (x, y) => mix(C('#f6d77e'), C('#e9b54e'), smooth(Y(K.mouth[1]), Y(0), y)), { fine: .55, mat: MAT.GOLD, flat: true, live: 'bulb' });
  }
  /* the chair, pulled out in front of the desk and empty: he has just stepped away */
  const CH = -16;
  R('chairBase', 'chair', union(bar(...P(CH - 4, 127), ...P(CH - 86, 141), 8 * s), bar(...P(CH + 4, 127), ...P(CH + 82, 141), 8 * s), bar(...P(CH, 126), ...P(CH, 143), 8 * s), rect(X(CH - 8), Y(96), 16 * s, 32 * s)), () => tint(D.frame), { fine: .56 });
  R('chairWheels', 'chair', union(disc(...P(CH - 88, 144), 7 * s), disc(...P(CH + 84, 144), 7 * s), disc(...P(CH, 146), 7 * s)), () => tint(D.chrome), { fine: .5 });
  R('chairSeat', 'chair', union(poly(pts([[CH - 96, 80], [CH + 96, 80], [CH + 90, 100], [CH - 90, 100]])), rect(X(CH - 104), Y(54), 10 * s, 34 * s), rect(X(CH + 94), Y(54), 10 * s, 34 * s)), (x, y) => warm(mix(D.meshLit, D.mesh, smooth(Y(80), Y(100), y)), x, y), { fine: .6 });
  R('chairBack', 'chair', c => { const x0 = X(CH - 82), x1 = X(CH + 82), y0 = Y(10), y1 = Y(74), r = 18 * s; c.moveTo(x0 + r, y0); c.lineTo(x1 - r, y0); c.quadraticCurveTo(x1, y0, x1, y0 + r); c.lineTo(x1 - 6 * s, y1); c.lineTo(x0 + 6 * s, y1); c.lineTo(x0, y0 + r); c.quadraticCurveTo(x0, y0, x0 + r, y0); c.closePath(); }, (x, y) => {
    const [lx, ly] = local(x, y), edge = Math.min(lx - (CH - 82), (CH + 82) - lx, ly - 10, 74 - ly);
    if (edge < 7) return tint(D.frame);
    return warm(mix(D.meshLit, D.mesh, smooth(-60, 60, lx - CH) * .6 + ((Math.floor(lx / 9) + Math.floor(ly / 9)) % 2) * .12), x, y);   // the mesh
  }, { fine: .6 });

  /* the books, spines toward you, each with a gilt band */
  const BOOKS = [[-238, -112, -21, 0, 0], [-228, -118, -39, -21, 1], [-242, -122, -57, -39, 2], [-224, -132, -72, -57, 3]];
  const bookAt = (x, y) => { const [lx, ly] = local(x, y); return [lx, ly, BOOKS.find(([, , y0, y1]) => ly >= y0 - .5 && ly <= y1 + .5) || BOOKS[0]]; };
  const gilt = (x, y) => { const [lx, ly, b] = bookAt(x, y); return Math.abs(ly - (b[2] + b[3]) / 2) < 2.8 && lx > b[0] + 12 && lx < b[1] - 12; };
  R('books', 'books', union(...BOOKS.map(([x0, x1, y0, y1]) => poly(pts([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])))), (x, y) => {
    const [lx, , b] = bookAt(x, y);
    if (gilt(x, y)) return tint(D.brass);
    return warm(mix(D.books[b[4]], [20, 18, 22], smooth(b[0] + 70, b[1] + 6, lx) * .3), x, y);
  }, { fine: .56, src: 'courses', flat: true, matAt: (x, y) => gilt(x, y) ? MAT.GOLD : 0 });

  /* the lamp */
  R('lampBase', 'lamp', union(poly(pts([[-324, 0.5], [-240, 0.5], [-248, -10], [-316, -10]])), disc(...P(-282, -12), 12 * s)), (x, y) => warm(mix(D.redDeep, D.red, .35), x, y), { fine: .7 });
  R('lampArms', 'lamp', union(bar(...P(-282, -12), ...P(-244, -226), 12 * s), bar(...P(-244, -226), ...K.lampHead.map((v, i) => i ? Y(v) : X(v)), 11 * s)), (x, y) => warm(mix(D.red, D.redDeep, .2), x, y), { fine: .62 });
  R('lampJoints', 'lamp', union(disc(...P(-244, -226), 10 * s), disc(...P(...K.lampHead), 9 * s)), () => tint(D.iron), { fine: .58 });
  const sp = (k, w) => [K.lampHead[0] + K.sh[0] * k + K.shN[0] * w, K.lampHead[1] + K.sh[1] * k + K.shN[1] * w];
  R('lampShade', 'lamp', poly(pts([sp(2, 18), sp(2, -18), sp(74, -45), sp(74, 45)])), (x, y) => {
    const [lx, ly] = local(x, y), v = (lx - K.lampHead[0]) * K.shN[0] + (ly - K.lampHead[1]) * K.shN[1];
    return tint(mix(D.redLit, D.redDeep, smooth(-30, 40, -v)));
  }, { fine: .66 });
  R('lampBulb', 'lamp', poly(pts([sp(70, -42), sp(70, 42), sp(80, 34), sp(80, -34)])), () => lamp > .2 ? mix(D.bulb, [255, 255, 255], .2 * lamp) : tint(D.redDeep), { fine: .5, live: lamp > .2 ? 'bulb' : null, flat: true });

  /* the laptop */
  R('laptopBase', 'laptop', poly(pts([[-120, .5], [120, .5], [110, -10], [-110, -10]])), (x, y) => warm(mix(D.aluLit, D.aluShade, smooth(-120, 120, local(x, y)[0]) * .7), x, y), { fine: .6, src: 'courses' });
  R('laptopLid', 'laptop', rect(X(-104), Y(-154), 208 * s, 144 * s), (x, y) => {
    const [lx, ly] = local(x, y);
    if (lx < -95 || lx > 95 || ly < -145 || ly > -18) return tint(D.bezel);
    return mix(mix(D.screen, D.screenDeep, smooth(-145, -18, ly) * .5), C('#2c5394'), .5 * (L.night || 0));   // it glows after dark
  }, { fine: .66, src: 'courses' });
  const codeRects = [];
  CODE.forEach((line, i) => line.forEach(([a, b, col]) => codeRects.push([-86 + a, -136 + i * 14.5, Math.min(b - a, 176 - a), 7.5, col])));
  R('code', 'laptop', union(...codeRects.map(([x0, y0, w, h]) => rect(X(x0), Y(y0), w * s, h * s))), (x, y) => {
    const [lx, ly] = local(x, y);
    const r = codeRects.find(([x0, y0, w, h]) => lx >= x0 - 1 && lx <= x0 + w + 1 && ly >= y0 - 1.5 && ly <= y0 + h + 1.5) || codeRects[0];
    return mix(D.code[r[4]], [255, 255, 255], .08 + .12 * (L.night || 0));
  }, { fine: .5, src: 'courses', live: 'code', flat: true });

  /* the paper robot */
  R('robotLegs', 'robot', union(rect(X(156), Y(-30), 14 * s, 30.5 * s), rect(X(184), Y(-30), 14 * s, 30.5 * s)), () => tint(D.cobaltDeep), { fine: .56 });
  R('robotArms', 'robot', union(rect(X(132), Y(-78), 12 * s, 38 * s), rect(X(210), Y(-78), 12 * s, 38 * s)), () => tint(D.cobaltDeep), { fine: .56 });
  R('robotBody', 'robot', rect(X(144), Y(-84), 66 * s, 56 * s), (x, y) => {
    const [lx, ly] = local(x, y);
    if (lx > 164 && lx < 190 && ly > -70 && ly < -48) return tint(mix(D.eye, D.cobaltLit, .25));
    return tint(mix(D.cobaltLit, D.cobalt, smooth(150, 200, lx)));
  }, { fine: .6 });
  R('robotHead', 'robot', rect(X(126), Y(-158), 92 * s, 72 * s), (x, y) => warm(mix(D.cobaltLit, D.cobalt, smooth(140, 210, local(x, y)[0]) * .9), x, y), { fine: .6 });
  R('robotEar', 'robot', rect(X(218), Y(-134), 11 * s, 26 * s), () => tint(D.ear), { fine: .5 });
  R('robotEyes', 'robotEye', union(disc(...P(150, -122), 14.5 * s), disc(...P(192, -122), 14.5 * s)), () => tint(D.eye), { fine: .5, live: 'eye', flat: true });
  R('robotPupils', 'robotEye', union(disc(...P(153, -120), 6.5 * s), disc(...P(195, -120), 6.5 * s)), () => D.pupil, { fine: .48, live: 'eye', flat: true });

  /* the telescope */
  const legTop = K.mount;
  R('teleLegs', 'tele', union(bar(...P(...legTop), ...P(legTop[0] - 40, 0), 7 * s), bar(...P(...legTop), ...P(legTop[0] + 36, 0), 7 * s), bar(...P(...legTop), ...P(legTop[0] + 4, 0), 6 * s)), () => tint(D.iron), { fine: .54 });
  const tubeFill = (x, y) => {
    const [lx, ly] = local(x, y), v = (lx - K.mount[0]) * -d[1] + (ly - K.mount[1]) * -d[0];   // across the tube
    return warm(v < -8 ? mix(D.tubeLit, D.tube, smooth(-16, -8, v)) : mix(D.tube, D.tubeShade, smooth(-4, 16, v)), x, y);
  };
  R('teleTube', 'tele', bar(...P(...K.E), ...P(...K.at(K.O === null ? 0 : (Math.hypot(K.O[0] - K.mount[0], K.O[1] - K.mount[1]) - 28))), 32 * s), tubeFill, { fine: .6 });
  const lenO = Math.hypot(K.O[0] - K.mount[0], K.O[1] - K.mount[1]);
  R('teleCap', 'tele', bar(...P(...K.at(lenO - 30)), ...P(...K.at(lenO)), 40 * s), tubeFill, { fine: .6 });
  R('teleBrass', 'teleB', union(bar(...P(...K.at(-36)), ...P(...K.at(-28)), 34 * s), bar(...P(...K.at(-6)), ...P(...K.at(6)), 35 * s), bar(...P(...K.at(-70)), ...P(...K.at(-56)), 15 * s)), () => tint(D.brass), { fine: .5, mat: MAT.GOLD, flat: true });
  R('teleLens', 'teleB', bar(...P(...K.at(lenO)), ...P(...K.at(lenO + 4)), 38 * s), () => D.lens, { fine: .5, mat: MAT.GLASS, flat: true });
  return K;
}

/** how much the desk and chair shade the ground at (x, y): 0–1 */
export function deskShadow(A, x, y) {
  const s = A.sd, gy = A.ground;
  const under = smooth(330 * s, 280 * s, Math.abs(x)) * smooth(gy - 70 * s, gy - 4 * s, y) * smooth(gy + 14 * s, gy + 2 * s, y);
  const chair = Math.exp(-(((x + 16 * s) / (110 * s)) ** 2) - (((y - gy) / (9 * s)) ** 2));
  return Math.min(1, under * .55 + chair * .45);
}

/* outline rows: each thing against what lies behind it */
export function deskOutlines(behind) {
  return [
    { inside: ['desk'], against: behind },
    { inside: ['books'], against: [...behind, 'desk', 'lamp', 'rays'] },
    { inside: ['lamp'], against: [...behind, 'desk', 'rays'] },
    { inside: ['laptop'], against: [...behind, 'desk'] },
    { inside: ['robot'], against: [...behind, 'desk', 'laptop'] },
    { inside: ['tele', 'teleB'], against: [...behind, 'desk', 'robot'] },
    { inside: ['chair'], against: [...behind, 'desk'] },
  ];
}

/** what a desk stone does from moment to moment: the cursor blinks, the robot blinks, the lamp hums */
export function deskLive(s, F, L) {
  if (s.liveKind === 'eye') {
    const ph = (F.time + 1.3) % 5.2;                         // a blink every few seconds
    if (ph < .16) return DESK_PAL.cobalt;
    return null;
  }
  if (s.liveKind === 'code' && s.cursor) return Math.sin(F.time * 5.2) > 0 ? null : DESK_PAL.screen;
  if (s.liveKind === 'bulb') return mix(s.col, [255, 255, 255], .12 * (.5 + .5 * Math.sin(F.time * 1.7 + s.h * 9)));
  return null;
}
export const deskLiveKind = (t, r) => {
  if (r.live === 'eye') return 'eye';
  if (r.live === 'bulb') return 'bulb';
  if (r.live === 'code') { const lx = t.ux; void lx; return 'code'; }
  return null;
};
export { clamp };
