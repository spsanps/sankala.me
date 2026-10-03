/* San Jose, 2024 – now: Mt Hamilton with the Lick Observatory domes, foothills, a few valley
   houses and cypresses, a garden hedge, and the real sky at this hour in San Jose.
   On the sill: a small brass telescope aimed at the domes, the paper robot as a figurine, and a
   potted succulent.
   Palette (golden hour): teal #25868a → aqua #62b0aa → gold #f2c675 sky; sun #e2702f → #fae6a0;
   ridge #1f5864; foothills #7f8f4a → #c9b65c; hedge #3e5a34; roofs #c8643a; brass #c9973f;
   walnut #6e4a2c; terracotta #c2653a; succulent sage #7aa58d with blush tips #cf8b8e;
   robot cobalt #3a62c4 / #22408f, ear #e8573a. */
import { mix, clamp, smooth, lerp, rgb, skyState, sceneDate, clockLabel, hash2 } from '../core.js';
import { CX, CY, IN_X0, IN_X1, SILL, poly, disc, bar, below, union, blade, regionList, nearest } from '../geom.js';
import { birdsAt, inBird } from './life.js';

const DAY = {
  skyTop: '#2c8fa0', skyMid: '#6fbcc4', skyLow: '#b5dfdc', skyHor: '#e9f0d8',
  ridge: '#3f7480', ridgeRim: '#6a9aa0', foot: '#7f9a54', footLit: '#a9b867', hedge: '#3f5c36', hedgeLit: '#5f7f45',
  wall: '#f2ead6', wallShade: '#ddd0b3', roof: '#c96b42', roofDark: '#a8522f', cypress: '#2f4b31', window: '#5a6f78',
  sunOut: '#f2b44e', sunIn: '#fbefc4', domeLit: '#f6f1e4', domeShade: '#c9cdd2', drum: '#e9e3d4', domeSlit: '#59606a',
  tint: [1, 1, 1], bird: '#33383d',
};
const GOLDEN = {
  skyTop: '#25868a', skyMid: '#62b0aa', skyLow: '#b7dcc9', skyHor: '#f2c675',
  ridge: '#1f5864', ridgeRim: '#4f7f86', foot: '#7f8f4a', footLit: '#c9b65c', hedge: '#3a5331', hedgeLit: '#6f7a3c',
  wall: '#f3e2c0', wallShade: '#dcc8a3', roof: '#c8643a', roofDark: '#a14b2b', cypress: '#2c462d', window: '#57606a',
  sunOut: '#e2702f', sunIn: '#fae6a0', domeLit: '#fbecd0', domeShade: '#b9b4bf', drum: '#efdcbc', domeSlit: '#5b5560',
  tint: [1.05, .99, .93], bird: '#2f3036',
};
const TWILIGHT = {
  skyTop: '#26406e', skyMid: '#4b5d8f', skyLow: '#9a86a6', skyHor: '#e7a07a',
  ridge: '#273650', ridgeRim: '#3f4d6c', foot: '#4a5640', footLit: '#6a6a4a', hedge: '#26332a', hedgeLit: '#34402f',
  wall: '#cbbca6', wallShade: '#b5a88c', roof: '#8d4c3a', roofDark: '#6f3a2c', cypress: '#22332a', window: '#f2c66a',
  sunOut: '#e4683a', sunIn: '#f6c58c', domeLit: '#d9d2d6', domeShade: '#8f8ca3', drum: '#cbc3c4', domeSlit: '#3c3a48',
  tint: [.8, .8, .92], bird: '#22242c',
};
const NIGHT = {
  skyTop: '#101b3a', skyMid: '#172a54', skyLow: '#22396a', skyHor: '#354c78',
  ridge: '#141d2e', ridgeRim: '#26324a', foot: '#1f2a26', footLit: '#2a3530', hedge: '#141d18', hedgeLit: '#1c2620',
  wall: '#5c5a62', wallShade: '#4a4952', roof: '#3f2c2c', roofDark: '#33232a', cypress: '#142019', window: '#f5c35a',
  sunOut: '#e4683a', sunIn: '#f6c58c', domeLit: '#b9c0cf', domeShade: '#6c7590', drum: '#9aa1b2', domeSlit: '#2a2f3e',
  tint: [.66, .68, .84], bird: '#0e1220',
};
const asRGB = p => { const o = {}; for (const k of Object.keys(p)) o[k] = typeof p[k] === 'string' ? rgb(p[k]) : p[k]; return o; };
function blend(a, b, t) { const o = {}; for (const k of Object.keys(a)) o[k] = k === 'tint' ? a[k].map((v, i) => lerp(v, b[k][i], t)) : mix(a[k], b[k], t); return o; }
const PALS = { D: asRGB(DAY), G: asRGB(GOLDEN), T: asRGB(TWILIGHT), N: asRGB(NIGHT) };

/* the sun or moon travels an arc concentric with the window: morning on the left, evening on the right */
const ARC_R = 300;
const arcPos = az => { const th = Math.PI + Math.PI * clamp((az - 95) / 170); return [CX + ARC_R * Math.cos(th), CY + ARC_R * Math.sin(th) - 20]; };

function light(hour) {
  const date = sceneDate(hour), sky = skyState(date), e = sky.sun.el, { D, G, T, N } = PALS;
  const pal = e >= 24 ? D : e >= 6 ? blend(G, D, smooth(6, 24, e)) : e >= -1 ? G
    : e >= -7 ? blend(G, T, smooth(-1, -7, e)) : e >= -13 ? blend(T, N, smooth(-7, -13, e)) : N;
  const sunUp = e > -1.5, moonUp = sky.moon.el > 0 && sky.night + sky.twilight > .35;
  const label = clockLabel(date);
  return { pal, sky, label, caption: `San Jose · ${label}`, clock: label,
    sun: sunUp ? arcPos(sky.sun.az) : null, moon: !sunUp && moonUp ? { at: arcPos(sky.moon.az), phase: sky.moon.phase } : null,
    stars: sky.stars, night: sky.night };
}

/* ───────── shapes ───────── */
const ridgeY = x => 786 - 146 * Math.exp(-(((x - 690) / 240) ** 2)) - 40 * Math.exp(-(((x - 205) / 125) ** 2));
const footY = x => 852 + 16 * Math.sin(x / 110 + .8) + 7 * Math.sin(x / 47 + 2);
const hedgeY = x => 936 + 7 * Math.sin(x / 38 + 1.3) + 5 * Math.sin(x / 17);
const DOMES = [{ x: 572, r: 46, drum: 26 }, { x: 690, r: 60, drum: 34, slit: true }, { x: 812, r: 46, drum: 26 }];
const HOUSES = [{ x: 466, w: 96, h: 42 }, { x: 576, w: 86, h: 38 }];
const BASE = 930;
const CYPRESS = [{ x: 520, w: 38, h: 128 }, { x: 628, w: 34, h: 112 }];

/* the telescope: brass tube on a walnut pillar, aimed at the big dome */
const E = [140, 884], O = [392, 754], TW = 50;
const along = t => [lerp(E[0], O[0], t), lerp(E[1], O[1], t)];
const PIV = along(.42);
/* the robot figurine */
const RS = .62, RB = { x: 722 - 96 * RS, y: SILL - 358 * RS };
const rob = (dx, dy) => [RB.x + dx * RS, RB.y + dy * RS];
/* the succulent: a terracotta pot and a rosette */
const POT = { x: 862, rimY: 906, rimH: 20, topW: 118, botW: 90, rimW: 130 };
const ROS = { x: 862, y: 896 };
const LEAVES = [
  [-172, 72, 34], [-150, 86, 38], [-128, 92, 40], [-106, 96, 40], [-84, 98, 40], [-62, 94, 40], [-40, 88, 38], [-14, 76, 34],
  [-139, 56, 30], [-112, 62, 32], [-86, 64, 32], [-60, 60, 30], [-34, 52, 28], [-96, 34, 24], [-72, 34, 24],
].map(([deg, len, w]) => ({ a: deg * Math.PI / 180, len, w }));
const leafTip = l => [ROS.x + Math.cos(l.a) * l.len, ROS.y + Math.sin(l.a) * l.len * .82];

function regions(L) {
  const P = L.pal, out = regionList(), R = out.R;
  const tint = c => [c[0] * P.tint[0], c[1] * P.tint[1], c[2] * P.tint[2]].map(v => Math.min(255, v));
  const warm = c => tint(L.sun ? mix(c, [255, 236, 200], .07 * (1 - L.night)) : c);   // a touch of the sun's warmth on the sill
  /* the view */
  R('sky', 'view', c => { c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, SILL - 60); }, (x, y) => {
    const t = clamp((y - 70) / (ridgeY(x) - 70));
    let c = t < .45 ? mix(P.skyTop, P.skyMid, t / .45) : t < .78 ? mix(P.skyMid, P.skyLow, (t - .45) / .33) : mix(P.skyLow, P.skyHor, (t - .78) / .22);
    if (L.sun) c = mix(c, P.sunIn, .36 * (1 - smooth(60, 240, Math.hypot(x - L.sun[0], y - L.sun[1]))) * (1 - L.night));
    return c;
  }, { live: 'sky' });
  if (L.sun) { const [sx, sy] = L.sun; R('sun', 'view', disc(sx, sy, 64), (x, y) => mix(P.sunIn, P.sunOut, smooth(8, 62, Math.hypot(x - sx, y - sy))), { live: 'sun', fine: .9 }); }
  if (L.moon) {
    const [mx, my] = L.moon.at, ph = L.moon.phase, r = 50, c2 = Math.cos(ph * Math.PI * 2);
    R('moon', 'view', disc(mx, my, r), (x, y) => {
      const dx = x - mx, w = Math.sqrt(Math.max(0, r * r - (y - my) ** 2)), lit = ph < .5 ? dx > c2 * w : -dx > c2 * w;
      return lit ? rgb('#f1ead2') : mix(P.skyMid, P.skyTop, .5);
    }, { live: 'moon', fine: .9 });
  }
  R('ridge', 'view', below(ridgeY), (x, y) => mix(P.ridgeRim, P.ridge, smooth(0, 80, y - ridgeY(x))), { src: ['sky', 'sun', 'moon'] });
  R('domes', 'view', c => {
    for (const d of DOMES) {
      const base = ridgeY(d.x) + 10;
      c.moveTo(d.x - d.r * .92, base); c.lineTo(d.x - d.r * .92, base - d.drum); c.lineTo(d.x + d.r * .92, base - d.drum); c.lineTo(d.x + d.r * .92, base); c.closePath();
      c.moveTo(d.x + d.r, base - d.drum); c.arc(d.x, base - d.drum, d.r, 0, Math.PI, true); c.closePath();
    }
  }, (x, y) => {
    const d = nearest(DOMES, x, 0), base = ridgeY(d.x) + 10;
    if (y > base - d.drum) return mix(P.drum, P.domeShade, smooth(-.2, .9, (x - d.x) / d.r) * .7);
    const nx = (x - d.x) / d.r, ny = (y - (base - d.drum)) / d.r;
    if (d.slit && Math.abs(nx + .12) < .1 && ny < -.12) return P.domeSlit;
    return mix(P.domeLit, P.domeShade, smooth(-.15, .65, nx * .9 - ny * .25));
  }, { fine: .78 });
  R('foothills', 'view', below(footY), (x, y) => mix(P.footLit, P.foot, smooth(0, 70, y - footY(x))), { src: ['ridge', 'domes'] });
  R('cypress', 'view', c => {
    for (const t of CYPRESS) { const b = BASE + 8; c.moveTo(t.x, b - t.h); c.bezierCurveTo(t.x + t.w * .7, b - t.h * .62, t.x + t.w * .62, b - t.h * .12, t.x + t.w * .4, b); c.lineTo(t.x - t.w * .4, b); c.bezierCurveTo(t.x - t.w * .62, b - t.h * .12, t.x - t.w * .7, b - t.h * .62, t.x, b - t.h); c.closePath(); }
  }, x => { const t = nearest(CYPRESS, x, 0); return mix(P.footLit, P.cypress, .6 + .4 * smooth(-.5, .5, (x - t.x) / t.w)); }, { fine: .8 });
  R('walls', 'view', c => { for (const h of HOUSES) c.rect(h.x - h.w / 2, BASE - h.h, h.w, h.h + 4); }, x => { const h = nearest(HOUSES, x, 0); return x > h.x + h.w * .18 ? P.wallShade : P.wall; }, { fine: .8 });
  R('windows', 'view', c => { for (const h of HOUSES) for (const f of [-.24, .22]) c.rect(h.x + f * h.w - 9, BASE - h.h * .64, 18, 16); }, () => P.window, { fine: .7, live: 'window' });
  R('roofs', 'view', c => { for (const h of HOUSES) { const y = BASE - h.h; c.moveTo(h.x - h.w * .62, y + 2); c.lineTo(h.x - h.w * .3, y - 32); c.lineTo(h.x + h.w * .3, y - 32); c.lineTo(h.x + h.w * .62, y + 2); c.closePath(); } },
    x => { const h = nearest(HOUSES, x, 0); return x > h.x + h.w * .05 ? P.roofDark : P.roof; }, { fine: .8 });
  R('hedge', 'view', below(hedgeY), (x, y) => mix(P.hedgeLit, P.hedge, smooth(0, 40, y - hedgeY(x)) * .8 + .2 * hash2(x / 22 | 0, y / 22 | 0, 3)), { src: ['foothills', 'walls', 'cypress', 'roofs'] });

  /* the sill: telescope */
  const brass = rgb('#c9973f'), brassLit = rgb('#ecc970'), brassDark = rgb('#8f6a26'), wood = rgb('#6e4a2c'), woodLit = rgb('#93643c'), woodDark = rgb('#4d321e');
  const tubeShade = (x, y) => {   // light falls across the tube: bright along its upper edge
    const ax = O[0] - E[0], ay = O[1] - E[1], l = Math.hypot(ax, ay), v = ((x - E[0]) * -ay + (y - E[1]) * ax) / l;   // signed distance from the tube's axis
    return warm(mix(brassLit, brassDark, smooth(-TW * .45, TW * .5, -v)), x);
  };
  R('tsStand', 'still', poly([[PIV[0] - 56, 960], [PIV[0] + 56, 960], [PIV[0] + 82, SILL + 1], [PIV[0] - 82, SILL + 1]]),
    (x, y) => tint(mix(woodLit, woodDark, smooth(-40, 80, x - PIV[0]) * .7 + smooth(960, 1000, y) * .3)), { fine: .74 });
  R('tsPillar', 'still', poly([[PIV[0] - 16, PIV[1]], [PIV[0] + 16, PIV[1]], [PIV[0] + 16, 962], [PIV[0] - 16, 962]]), x => tint(mix(wood, woodDark, smooth(-10, 16, x - PIV[0]))), { fine: .7 });
  R('tsTube', 'still', bar(...along(.04), ...along(.82), TW), (x, y) => {
    const c = tubeShade(x, y), t = ((x - E[0]) * (O[0] - E[0]) + (y - E[1]) * (O[1] - E[1])) / ((O[0] - E[0]) ** 2 + (O[1] - E[1]) ** 2);
    return Math.abs(t - .3) < .025 || Math.abs(t - .58) < .025 ? mix(c, brassDark, .55) : c;
  }, { fine: .7 });
  R('tsCap', 'still', bar(...along(.8), ...O, TW + 16), tubeShade, { fine: .7 });
  R('tsLens', 'still', bar(...along(.985), ...along(1.005), TW + 8), () => tint(rgb('#2f4a5a')), { fine: .64 });
  R('tsEye', 'still', bar(...along(-.12), ...along(.06), 22), () => tint(mix(brassDark, woodDark, .4)), { fine: .66 });
  /* the robot figurine */
  const blue = rgb('#3a62c4'), deep = rgb('#22408f');
  R('rBody', 'still', poly([rob(16, 358), rob(16, 232), rob(34, 206), rob(158, 206), rob(176, 232), rob(176, 358)]), (x, y) => warm(mix(blue, deep, smooth(220, 360, (y - RB.y) / RS) * .55 + smooth(80, 180, (x - RB.x) / RS) * .3), x), { fine: .68, src: 'courses' });
  R('rNeck', 'still', poly([rob(68, 210), rob(68, 176), rob(124, 176), rob(124, 210)]), () => tint(rgb('#1d3478')), { fine: .66 });
  R('rTop', 'still', poly([rob(4, 28), rob(32, 0), rob(194, 0), rob(166, 28)]), x => warm(rgb('#5b82cc'), x), { fine: .66 });
  R('rSide', 'still', poly([rob(166, 28), rob(194, 0), rob(194, 150), rob(166, 178)]), () => tint(deep), { fine: .66 });
  R('rFront', 'still', poly([rob(4, 28), rob(122, 28), rob(166, 72), rob(166, 178), rob(4, 178)]), (x, y) => warm(mix(rgb('#3460c2'), rgb('#2a4ea8'), smooth(40, 170, (y - RB.y) / RS)), x), { fine: .64 });
  R('rFold', 'still', poly([rob(122, 28), rob(166, 28), rob(166, 72)]), () => tint(rgb('#f2e9d4')), { fine: .6 });
  R('rEarRim', 'still', disc(...rob(184, 102), 31 * RS), () => tint(rgb('#f2e6cc')), { fine: .6 });
  R('rEar', 'still', disc(...rob(184, 102), 23 * RS), () => tint(rgb('#e0502f')), { fine: .6 });
  for (const [k, ex] of [['L', 44], ['R', 116]]) {
    R('rEye' + k, 'still', disc(...rob(ex, 104), 30 * RS), () => tint(rgb('#f8f3e6')), { fine: .56 });
    R('rPupil' + k, 'still', disc(...rob(ex + 9, 106), 13 * RS), () => rgb('#1f1c1a'), { fine: .54 });
  }
  /* the succulent */
  const terra = rgb('#c2653a'), terraLit = rgb('#dc8454'), terraDark = rgb('#9a4a29');
  R('pot', 'still', poly([[POT.x - POT.topW / 2, POT.rimY + POT.rimH], [POT.x + POT.topW / 2, POT.rimY + POT.rimH], [POT.x + POT.botW / 2, SILL + 1], [POT.x - POT.botW / 2, SILL + 1]]),
    x => warm(mix(terraLit, terraDark, smooth(-50, 60, x - POT.x)), x), { fine: .72, src: 'courses' });
  R('potRim', 'still', poly([[POT.x - POT.rimW / 2, POT.rimY], [POT.x + POT.rimW / 2, POT.rimY], [POT.x + POT.rimW / 2, POT.rimY + POT.rimH], [POT.x - POT.rimW / 2, POT.rimY + POT.rimH]]),
    x => warm(mix(terraLit, terra, smooth(-40, 66, x - POT.x)), x), { fine: .66 });
  const leafCol = [rgb('#7aa58d'), rgb('#9cc2a6'), rgb('#5f8a73')], blush = rgb('#d08a8c');
  R('succulent', 'still', union(...LEAVES.map(l => { const [tx, ty] = leafTip(l); return blade(ROS.x, ROS.y + 4, (ROS.x + tx) / 2, (ROS.y + ty) / 2 - 6, tx, ty, l.w, 2); })), (x, y) => {
    let best = 0, bd = 1e9;
    LEAVES.forEach((l, i) => { const [tx, ty] = leafTip(l), d = Math.abs(Math.atan2(y - ROS.y, x - ROS.x) - Math.atan2(ty - ROS.y, tx - ROS.x)) * (1 + .002 * Math.abs(Math.hypot(x - ROS.x, y - ROS.y) - l.len * .6)); if (d < bd) { bd = d; best = i; } });
    const l = LEAVES[best], r = Math.hypot(x - ROS.x, (y - ROS.y) / .82) / l.len;
    let c = leafCol[(best * 2 + (l.len < 70 ? 1 : 0)) % 3];
    c = mix(c, blush, smooth(.72, .98, r) * .75);
    return warm(c, x);
  }, { fine: .62 });
  return out;
}

const outlines = [
  { inside: ['still'], against: ['view'] },
  { inside: ['domes'], against: ['sky', 'sun', 'moon'] },
];

/* ───────── what moves ───────── */
function liveKind(t, r, L) {
  if (r.live === 'sky') return 'sky';
  if (r.live === 'sun') return 'sun';
  if (r.live === 'window' && L.night > .3) return 'window';
  return null;
}
function frameState(time, L) { return { birds: L.night < .5 ? birdsAt(time, [[0, 26, 230, 70], [1, 34, 320, 54]]) : [], band: (time * 38) % 1500 - 250, time }; }
function liveColour(s, F, L) {
  const P = L.pal;
  if (s.kind === 'sky') {
    let col = s.col, changed = false;
    const b = Math.exp(-((((s.ux - F.band) + (s.uy - 300) * .35) / 90) ** 2)) * (1 - L.night * .7);
    if (b > .03) { col = mix(col, [255, 252, 238], b * .13); changed = true; }
    for (const bd of F.birds) if (inBird(bd, s.ux, s.uy)) { col = mix(s.col, P.bird, .88); changed = true; break; }
    if (s.star) { const tw = .55 + .45 * Math.sin(F.time * (1.3 + s.h2 * 2) + s.h * 40); col = mix(col, [255, 246, 214], L.stars * tw); changed = true; }
    return changed ? col : null;
  }
  if (s.kind === 'sun' && L.sun) {
    const a = Math.atan2(s.uy - L.sun[1], s.ux - L.sun[0]), gl = Math.max(0, Math.cos(a - F.time * .45 - s.row * .6)) ** 12;
    return gl > .02 ? mix(s.col, [255, 250, 230], gl * .35) : null;
  }
  if (s.kind === 'window') { const fl = .85 + .15 * Math.sin(F.time * 2.1 + s.h * 30); return mix(s.col, [255, 214, 120], .25 * fl); }
  return null;
}
const isStar = (r, L, t, uy) => r.name === 'sky' && L.stars > .05 && t.h > .985 && t.h2 > .25 && uy < 600;

export default {
  key: 'now', place: 'San Jose', light, regions, outlines, liveKind, frameState, liveColour, isStar,
  alt: L => `The window onto San Jose at ${L.label}: Mt Hamilton with the three Lick Observatory domes, foothills, two valley houses and cypresses; on the sill a brass telescope aimed at the domes, the small blue paper robot and a potted succulent.`,
};
