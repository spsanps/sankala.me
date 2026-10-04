/* Bengaluru, 2019 – 2022, a monsoon afternoon. The conch is gold with monsoon clouds laid the
   Byzantine way, as long streaks of white, blue-grey, slate and rose (like the clouds in the apse of
   San Vitale), lit from the west. Behind the desk a row of flat roofs in pastel colours with black
   water tanks, a gulmohar in flame-red flower on the left, two kites tugging on their strings; the
   desk stands on a red-oxide terrace.
   Palette: clouds #fbf3e2 / #c9d2dc / #8796aa / #5d6c84, rose edge #d99a8c; walls #eadcc0 #e2aa9f
   #d9a64f #a9c2ce #b8d0b2; tanks #2c2e33; gulmohar #e0462a / #f27d3c / #b5321f, leaf #5f7a3a;
   terrace #a8463a / #8c3a30. */
import { mix, clamp, smooth, lerp, rgb, vnoise, hash2 } from '../core.js';
import { RI, poly, ell, below, union, blade, regionList } from '../geom.js';
import { deskRegions, deskOutlines, deskShadow } from '../desk.js';
import { groundColour, groundMat } from './sky.js';
import { kitesAt, inKite } from './life.js';

const C = s => rgb(s);
const P = {
  cloudLit: C('#fbf3e2'), cloud: C('#c9d2dc'), cloudShade: C('#8796aa'), cloudBase: C('#5d6c84'), rose: C('#d99a8c'),
  tank: C('#2c2e33'), tankLit: C('#5a5f68'), parapet: C('#f1ebe0'),
  bloom: C('#e0462a'), bloomLit: C('#f27d3c'), bloomDeep: C('#b5321f'), leaf: C('#5f7a3a'), bark: C('#4a3426'),
  terrace: C('#a8463a'), terraceDeep: C('#8c3a30'), terraceLit: C('#bd5a46'),
};
const WALLS = ['#eadcc0', '#e2aa9f', '#d9a64f', '#a9c2ce', '#b8d0b2', '#eadcc0', '#d9b48a', '#c8b7d0', '#e8c9a8', '#b9cbb8'].map(C);
function light() { return { pal: P, tint: [1.03, .98, .93], caption: 'Bengaluru · a monsoon afternoon', label: 'a monsoon afternoon', day: 1, golden: .35, dusk: 0, night: 0, lamp: 0, stars: 0 }; }

function layout(A) {
  const t = A.t, sd = A.sd, k = lerp(1, 1.35, t);
  const hor = lerp(-150, A.deskY - 172 * sd, t);
  const blocks = [];
  let x = -RI - 10, i = 0;
  while (x < RI + 10) {
    const w = (54 + 40 * hash2(i, 1, 5)) * k, h = (20 + 52 * hash2(i, 2, 5)) * k;
    blocks.push([x, x + w, hor - h + 30 * k, i]); x += w; i++;
  }
  const tanks = blocks.filter(b => hash2(b[3], 3, 5) > .45).map(b => [b[0] + (b[1] - b[0]) * (.3 + .4 * hash2(b[3], 4, 5)), b[2], (.7 + .3 * hash2(b[3], 6, 5)) * k]);
  const parapetY = x => hor + lerp(34, 44, t) * k + 0 * x;
  const terraceY = x => parapetY(x) + lerp(30, 40, t) * k;
  // the gulmohar stands above the robot, the kites fly over the roofs on the left: the lamp's head stays clear
  const tree = { x: lerp(150, 175, t), y: lerp(-240, A.deskY - 300 * sd, t), k: lerp(1, 1.12, t) };
  const clouds = A.t < .5
    ? [[-170, -404, 170, 20], [-10, -350, 150, 16], [210, -322, 160, 18], [70, -446, 120, 14], [300, -404, 90, 12], [-300, -300, 110, 13]]
    : [[-160, -330, 200, 24], [170, -260, 210, 24], [30, -410, 170, 18], [-220, -180, 150, 16], [240, -380, 120, 15], [-40, -110, 190, 18]];
  return { t, k, hor, blocks, tanks, terraceY, parapetY, tree, clouds };
}

function regions(L, A) {
  const out = regionList(), R = out.R, Y = layout(A), F = A.F;
  const vOf = (x, y) => clamp((y + RI) / (Y.hor + RI));
  R('sky', 'sky', c => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8), (x, y) => groundColour(L, vOf(x, y), 0), { live: 'sky', matAt: (x, y) => groundMat(L, vOf(x, y)), fine: 1.02, src: ['outside'], halo: 2 });
  /* clouds: long streaks with pointed ends, laid in level rows: cream above, blue-grey, slate, a rose underside */
  Y.clouds.forEach(([cx, cy, rx, ry], n) => {
    const lens = c => { const N = 24; for (let i = 0; i <= N; i++) { const u = i / N, x = cx - rx + 2 * rx * u, h = Math.sin(Math.PI * u) ** .8; i ? c.lineTo(x, cy - ry * h * 1.25) : c.moveTo(x, cy); } for (let i = N; i >= 0; i--) { const u = i / N, x = cx - rx + 2 * rx * u, h = Math.sin(Math.PI * u) ** 1.4; c.lineTo(x, cy + ry * h * .55); } c.closePath(); };
    R('cloud' + n, 'cloud', lens, (x, y) => {
      const v = clamp((y - (cy - ry * 1.25)) / (ry * 1.8));
      return v < .3 ? P.cloudLit : v < .55 ? P.cloud : v < .78 ? P.cloudShade : P.rose;
    }, { fine: .74, src: 'courses', live: 'cloud' });
  });
  /* the roofs: pastel blocks, windows, black water tanks */
  R('city', 'city', c => { for (const [x0, x1, top] of Y.blocks) c.rect(x0, top, x1 - x0, F + 4 - top); }, (x, y) => {
    const b = Y.blocks.find(([x0, x1]) => x >= x0 && x < x1) || Y.blocks[0], wall = WALLS[b[3] % WALLS.length];
    const [x0, x1, top] = b, k = Y.k;
    if (y < top + 7 * k) return mix(wall, [255, 255, 255], .3);
    const col = Math.floor((x - x0 - 10 * k) / (24 * k)), row = Math.floor((y - top - 18 * k) / (30 * k)), wx = x - x0 - 10 * k - col * 24 * k, wy = y - top - 18 * k - row * 30 * k;
    if (col >= 0 && x < x1 - 12 * k && row >= 0 && wx < 12 * k && wy < 15 * k) return mix(wall, [40, 44, 52], .55);
    return mix(wall, [60, 60, 70], x > x1 - 14 * k ? .16 : 0);
  }, { fine: .8, src: 'courses' });
  R('tanks', 'city', c => { for (const [x, roof, z] of Y.tanks) { const w = 20 * z, h = 22 * z; c.rect(x - w, roof - h, 2 * w, h + 1); c.moveTo(x + w, roof - h); c.ellipse(x, roof - h, w, 5 * z, 0, 0, Math.PI * 2); c.closePath(); } }, (x, y) => {
    let best = Y.tanks[0]; for (const tk of Y.tanks) if (Math.abs(tk[0] - x) < Math.abs(best[0] - x)) best = tk;
    const dy = (best[1] - y) / best[2];
    if (dy > 20) return P.tankLit;
    const rib = Math.abs(dy - 14) < 2.5 || Math.abs(dy - 6) < 2.5;
    return mix(rib ? P.tankLit : P.tank, [20, 20, 24], smooth(-6, 20, x - best[0]) * .5);
  }, { fine: .6, flat: true });
  /* the gulmohar */
  const T = Y.tree, k = T.k;
  const CROWN = [[0, 0, 96, 40], [-62, 22, 60, 30], [64, 18, 66, 30], [6, 34, 84, 26], [-20, -26, 56, 24], [44, -20, 46, 20]].map(([dx, dy, rx, ry]) => [T.x + dx * k, T.y + dy * k, rx * k, ry * k]);
  R('trunk', 'tree', union(blade(T.x + 10 * k, F + 4, T.x + 4 * k, T.y + 140 * k, T.x - 4 * k, T.y + 36 * k, 18 * k, 10 * k), blade(T.x - 2 * k, T.y + 80 * k, T.x - 30 * k, T.y + 60 * k, T.x - 60 * k, T.y + 30 * k, 8 * k, 4 * k), blade(T.x + 2 * k, T.y + 70 * k, T.x + 34 * k, T.y + 50 * k, T.x + 62 * k, T.y + 26 * k, 8 * k, 4 * k)), () => P.bark, { fine: .62 });
  R('crown', 'tree', union(...CROWN.map(([x, y, rx, ry]) => ell(x, y, rx, ry))), (x, y) => {
    const n = vnoise(x / 26, y / 22, 7), n2 = vnoise(x / 12, y / 12, 11);
    if (n2 > .74 && n < .5) return P.leaf;
    const top = smooth(T.y + 50 * k, T.y - 40 * k, y) * .6 + smooth(T.x - 60 * k, T.x + 80 * k, x) * .3;
    return mix(P.bloomDeep, mix(P.bloom, P.bloomLit, top), .5 + .5 * n);
  }, { fine: .74 });
  /* the terrace: a whitewashed parapet, then the red-oxide floor the desk stands on */
  R('parapet', 'view', below(Y.parapetY, -RI - 4, RI + 4, F + 4), (x, y) => y < Y.parapetY(x) + 8 ? mix(P.parapet, [255, 255, 255], .3) : mix(P.parapet, C('#cfc6b6'), smooth(Y.parapetY(x), Y.terraceY(x), y) * .6), { src: 'courses', fine: .9 });
  R('terrace', 'view', below(Y.terraceY, -RI - 4, RI + 4, F + 4), (x, y) => {
    const d = y - Y.terraceY(x), k = Y.k, tile = 46 * k * (1 + d / 260);
    const gx = Math.abs(((x / tile) % 1 + 1) % 1 - .5), gy = Math.abs((((d + 12) / (tile * .5)) % 1) - .5);
    const sh = deskShadow(A, x, y) * .7;
    if (gx > .45 || gy > .42) return mix(C('#7a2f27'), [40, 20, 16], sh * .5);                 // the joints between the floor tiles
    return mix(mix(mix(P.terraceLit, P.terrace, smooth(0, 60, d)), P.terraceDeep, smooth(.55, .8, vnoise(x / 40, y / 10, 3)) * .3), C('#5e2822'), sh);
  }, { src: 'courses', fine: .92 });
  /* a pot of tulsi on the terrace, by the desk */
  const px = lerp(410, 360, Y.t), pk = lerp(1, 1.3, Y.t), pg = A.ground - 4;
  R('pot', 'pot', poly([[px - 30 * pk, pg - 50 * pk], [px + 30 * pk, pg - 50 * pk], [px + 22 * pk, pg], [px - 22 * pk, pg]]), (x, y) => y < pg - 42 * pk ? C('#c8603e') : mix(C('#b5543a'), C('#86391f'), smooth(px - 20 * pk, px + 30 * pk, x)), { fine: .6, src: 'courses' });
  R('tulsi', 'pot', union(ell(px, pg - 82 * pk, 38 * pk, 30 * pk), ell(px - 24 * pk, pg - 68 * pk, 22 * pk, 18 * pk), ell(px + 24 * pk, pg - 70 * pk, 22 * pk, 18 * pk), ell(px, pg - 112 * pk, 20 * pk, 16 * pk)), (x, y) => {
    const n = vnoise(x / 9, y / 9, 31);
    if (n > .78) return C('#7a4a6a');                                                            // its purple flower spikes
    return mix(C('#6f9a46'), C('#3f6a32'), smooth(.3, .7, n) * .6 + smooth(pg - 120 * pk, pg - 60 * pk, y) * .4);
  }, { fine: .6 });
  deskRegions(R, L, A);
  return out;
}

function kiteSpecs(A) {
  const t = A ? A.t : 0;
  return [
    { x: lerp(-110, -90, t), y: lerp(-330, -250, t), size: lerp(34, 40, t), ph: 0, c1: C('#d4337a'), c2: C('#f2c230'), strX: lerp(-300, -330, t), strY: lerp(-120, 60, t) },
    { x: lerp(-320, -300, t), y: lerp(-400, -320, t), size: lerp(26, 32, t), ph: 2.1, c1: C('#2f7fd0'), c2: C('#f08a2c'), strX: lerp(-470, -450, t), strY: lerp(-130, 40, t) },
  ];
}
function liveKind(t, r) { return r.live === 'sky' ? 'sky' : r.live === 'cloud' ? 'cloud' : null; }
function frameState(time, L, A) { return { kites: kitesAt(time, kiteSpecs(A)), time }; }
function liveColour(s, F) {
  for (const k of F.kites) {
    const part = inKite(k, s.ux, s.uy);
    if (part === 1) return k.c1;
    if (part === 2) return k.c2;
    if (part === 3) return mix(k.c1, [255, 255, 255], .2);
    if (part === 4 && s.kind === 'sky') return mix(s.col, [52, 50, 56], .5);
  }
  if (s.kind === 'cloud' && s.edge) { const g = Math.max(0, Math.sin(F.time * .5 - s.ux * .012 + s.h * 2)) ** 6; return g > .05 ? mix(s.col, [255, 250, 232], g * .35) : null; }
  return null;
}

export default {
  key: 'blr', place: 'Bengaluru', light, regions, liveKind, frameState, liveColour, isStar: () => false,
  edgeOf: (r, ux, uy) => r.live === 'cloud' && hash2(ux | 0, uy | 0, 3) > .4,
  outlines: [
    ...deskOutlines(['rays', 'sky', 'cloud', 'view', 'city', 'tree', 'pot']),
    { inside: ['pot'], against: ['view', 'city', 'tree'] },
    { inside: ['city'], against: ['sky', 'cloud'] },
    { inside: ['tree'], against: ['sky', 'cloud', 'city'] },
  ],
  alt: () => 'The apse, laid in mosaic: San’s desk with its red lamp, a stack of books, the laptop, the blue paper robot and a telescope, on a red-oxide terrace in Bengaluru on a monsoon afternoon; behind it flat pastel roofs with black water tanks, a gulmohar in flower and two kites, under a gold conch streaked with monsoon clouds.',
};
