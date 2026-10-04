/* San Jose, 2024 – now, in San Jose's light (one of the designed moments in moments.js).
   Behind the desk, Mt Hamilton with the white domes of the
   Lick Observatory on its summit, golden October foothills with dark valley oaks, the city in the
   valley; the conch is gold by day, warm gold at the golden hour, rows of rose and coral at dusk,
   and lapis with stars at night, when the city's lights come on, the great dome's slit glows and
   the lamp on the desk is lit. The sun (or the moon, in its real phase) crosses the conch on an
   arc from left (morning) to right (evening).
   Land palettes from the arched-window study (v3), lifted at night. */
import { mix, clamp, smooth, lerp, rgb, vnoise, hash2 } from '../core.js';
import { MOMENTS, DEFAULT_MOMENT } from '../moments.js';
import { RI, poly, disc, ell, bar, below, union, regionList } from '../geom.js';
import { deskRegions, deskOutlines, deskShadow } from '../desk.js';
import { groundColour, groundMat, starField } from './sky.js';
import { MAT } from '../arch.js';
import { birdsAt, inBird } from './life.js';

const DAY = { mtn: '#8a92ad', mtnLit: '#aeb6c8', chap: '#727e8c', hill: '#c7a066', hillLit: '#e0c288', near: '#cda56a', nearLit: '#e4c68c', shadow: '#8e7850',
  town: '#d9dcd8', townTree: '#7f9180', haze: '#bcc4cc', oak: '#4c6a3d', oakLit: '#738e50', oakDeep: '#33492e', trunk: '#4e3b2a',
  domeLit: '#fbf8f1', domeShade: '#c4c9d1', domeSlit: '#4c535d', stucco: '#f3ead6', stuccoShade: '#d3c6a8', window: '#66707a', slitGlow: '#4c535d', tint: [1, 1, 1] };
const GOLDEN = { mtn: '#857a92', mtnLit: '#bc968a', chap: '#6a6478', hill: '#c48e52', hillLit: '#e8b672', near: '#cc9a58', nearLit: '#ecbf7a', shadow: '#86643c',
  town: '#e9d7c0', townTree: '#7b7f62', haze: '#cbb6a6', oak: '#3f5a35', oakLit: '#66803f', oakDeep: '#2b4029', trunk: '#4a3626',
  domeLit: '#fdf1dd', domeShade: '#c2b8c4', domeSlit: '#4b4650', stucco: '#f6e2bf', stuccoShade: '#cfb48e', window: '#5f5a62', slitGlow: '#4b4650', tint: [1.04, .99, .93] };
const TWILIGHT = { mtn: '#5a628c', mtnLit: '#7e7ca6', chap: '#4b527a', hill: '#90806a', hillLit: '#ae9774', near: '#988468', nearLit: '#b69c78', shadow: '#6e6158',
  town: '#8a87a0', townTree: '#57606a', haze: '#8d90b0', oak: '#344632', oakLit: '#4a5c40', oakDeep: '#26352a', trunk: '#3a2e2a',
  domeLit: '#ece6e6', domeShade: '#a7a6bd', domeSlit: '#45435a', stucco: '#ddd0c4', stuccoShade: '#b2a6a2', window: '#f2c66a', slitGlow: '#e9a95a', tint: [.92, .9, .97] };
const NIGHT = { mtn: '#3a4d80', mtnLit: '#566a9e', chap: '#33446f', hill: '#5f6d8a', hillLit: '#7d8ba6', near: '#6a7793', nearLit: '#8895ae', shadow: '#4c5873',
  town: '#3c4768', townTree: '#2e3958', haze: '#4c5c86', oak: '#283652', oakLit: '#3d4e70', oakDeep: '#1e2a43', trunk: '#242d42',
  domeLit: '#e6ebf3', domeShade: '#a3aec4', domeSlit: '#3a4258', stucco: '#c4c9d6', stuccoShade: '#9aa1b6', window: '#f5c35a', slitGlow: '#f2b45a', tint: [.8, .83, .96] };
const asRGB = p => { const o = {}; for (const k of Object.keys(p)) o[k] = typeof p[k] === 'string' ? rgb(p[k]) : p[k]; return o; };
function blend(a, b, t) { const o = {}; for (const k of Object.keys(a)) o[k] = k === 'tint' ? a[k].map((v, i) => lerp(v, b[k][i], t)) : mix(a[k], b[k], t); return o; }
const PALS = { D: asRGB(DAY), G: asRGB(GOLDEN), T: asRGB(TWILIGHT), N: asRGB(NIGHT) };

function light(moment = DEFAULT_MOMENT) {
  const M = MOMENTS[moment] || MOMENTS[DEFAULT_MOMENT], e = M.e, { D, G, T, N } = PALS;
  const pal = e >= 22 ? D : e >= 6 ? blend(G, D, smooth(6, 22, e)) : e >= -1 ? G
    : e >= -7 ? blend(G, T, smooth(-1, -7, e)) : e >= -13 ? blend(T, N, smooth(-7, -13, e)) : N;
  const night = smooth(-6, -14, e), dusk = smooth(3, -2.5, e) * (1 - night);
  return { key: moment, pal, tint: pal.tint, label: M.label, caption: 'San Jose',
    day: smooth(6, 20, e), golden: smooth(-1, 4, e) * (1 - smooth(9, 22, e)), dusk, night,
    sunUp: e > -1.5, sunAz: M.az, moonUp: !!M.moon, moonAz: M.moon ? M.moon.az : 0, phase: M.moon ? M.moon.phase : 0,
    stars: smooth(-4, -13, e), lamps: smooth(-2, -8, e), lamp: smooth(1, -5, e) };
}

/* where the sun or moon sits: an arc through the free gold above the desk, morning on the left */
function arcPos(az, A) {
  const th = Math.PI * lerp(.88, .12, clamp((az - 95) / 170));
  const cy = lerp(-150, 40, A.t), ax = lerp(352, 300, A.t), ay = lerp(240, 400, A.t);
  return [ax * Math.cos(th), cy - ay * Math.sin(th)];
}

/* the scene's layout for this apse */
function layout(A) {
  const t = A.t, k = lerp(1, 1.5, t);
  // the summit, where the observatory stands: above the laptop, so the lamp's head stands clear against the gold
  const S = { x: lerp(30, 70, t), y: lerp(-232, A.deskY - 218 * A.sd, t) };
  const foot = lerp(-150, A.deskY - 128 * A.sd, t);                              // where the mountain meets the valley
  const ridgeY = x => {
    const off = Math.abs(x - S.x) - 58 * k;
    const fall = off > 0 ? (x < S.x ? off * .62 : off * .46 - 26 * Math.exp(-(((x - (S.x + 200 * k)) / 60) ** 2)) * k) : 0;
    return Math.min(foot - 4, S.y + fall + 3.5 * Math.sin(x / 23 + 1));
  };
  const hillY = x => foot + lerp(12, 22, t) + 8 * Math.sin(x / 86 + .6) + 5 * Math.sin(x / 33 + 2);
  const nearY = x => A.ground - lerp(22, 30, t) * A.sd + 4 * Math.sin(x / 50 + 1);
  const big = { x: S.x + 6 * k, top: S.y - 36 * k, half: 26 * k, r: 34 * k };
  const small = { x: S.x - 50 * k, top: S.y - 18 * k, half: 15 * k, r: 19 * k };
  const shane = { x: S.x + 66 * k, top: S.y - 12 * k, half: 18 * k, r: 22 * k };
  const hall = { x0: small.x + 8 * k, x1: big.x - 16 * k, top: S.y - 16 * k };
  const oakR = lerp(1, 1.2, t);
  const bigOak = { x: lerp(430, 372, t), y: lerp(A.ground - 26, A.deskY - 40 * A.sd, t), rx: lerp(66, 72, t), ry: lerp(46, 48, t) };
  return { t, k, S, foot, ridgeY, hillY, nearY, big, small, shane, hall, oakR, bigOak };
}

function regions(L, A) {
  const P = L.pal, out = regionList(), R = out.R, Y = layout(A), F = A.F;
  const tint = c => [c[0] * P.tint[0], c[1] * P.tint[1], c[2] * P.tint[2]].map(v => Math.min(255, v));
  const sun = L.sunUp ? arcPos(L.sunAz, A) : null, moon = L.moonUp ? arcPos(L.moonAz, A) : null;
  const sunSide = sun ? (sun[0] < 0 ? -1 : 1) : moon ? (moon[0] < 0 ? -1 : 1) : 1;
  const sr = lerp(44, 56, A.t);
  const vOf = (x, y) => clamp((y + RI) / (Y.ridgeY(x) + RI));
  /* the ground of the conch */
  R('sky', 'sky', c => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8), (x, y) => {
    const glow = sun ? .32 * (1 - smooth(sr, sr * 4.5, Math.hypot(x - sun[0], y - sun[1]))) * (1 - L.night) : moon ? 0 : 0;
    let c = groundColour(L, vOf(x, y), glow);
    if (L.night > .1) c = mix(c, mix(rgb('#5d4f8e'), rgb('#b07a8a'), smooth(.8, 1, vOf(x, y))), .55 * L.night * L.lamps * smooth(.62, 1, vOf(x, y)));   // the valley's glow low on the sky
    if (moon) c = mix(c, [120, 140, 190], .22 * (1 - smooth(40, 200, Math.hypot(x - moon[0], y - moon[1]))));
    return c;
  }, { live: 'sky', matAt: (x, y) => groundMat(L, vOf(x, y)), fine: 1.02, src: ['outside'], halo: 2 });
  if (sun) {
    const [sx, sy] = sun;
    R('rays', 'sun', c => { for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r1 = sr * (i % 2 ? 1.36 : 1.62), w = .16; c.moveTo(sx + Math.cos(a - w) * sr * .9, sy + Math.sin(a - w) * sr * .9); c.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); c.lineTo(sx + Math.cos(a + w) * sr * .9, sy + Math.sin(a + w) * sr * .9); c.closePath(); } },
      () => mix(rgb('#d9572f'), rgb('#e98a3c'), .3 + .4 * L.golden), { fine: .6, mat: MAT.GOLD, live: 'rays' });
    R('sun', 'sun', disc(sx, sy, sr), (x, y) => { const d = Math.hypot(x - sx, y - sy) / sr; return d > .8 ? rgb('#d65a33') : d > .55 ? mix(rgb('#f2b44e'), rgb('#e98a3c'), L.golden) : mix(rgb('#fff6d6'), rgb('#f8dc8a'), smooth(0, .55, d)); }, { fine: .64, mat: MAT.GOLD, live: 'sun' });
  }
  if (moon) {
    const [mx, my] = moon, ph = L.phase, r = sr * .9, c2 = Math.cos(ph * Math.PI * 2);
    R('moon', 'sun', disc(mx, my, r), (x, y) => {
      const dx = x - mx, w = Math.sqrt(Math.max(0, r * r - (y - my) ** 2)), lit = ph < .5 ? dx > c2 * w : -dx > c2 * w;
      return lit ? mix(rgb('#f1f2ee'), rgb('#cfd5de'), smooth(.4, .75, vnoise(x / 16, y / 16, 13)) * .7) : rgb('#33477f');
    }, { fine: .66, mat: MAT.SILVER });
  }
  /* Mt Hamilton */
  R('ridge', 'view', below(Y.ridgeY, -RI - 4, RI + 4, F + 2), (x, y) => {
    const d = y - Y.ridgeY(x), slope = (Y.ridgeY(x + 6) - Y.ridgeY(x - 6)) / 12;
    const lit = clamp(.45 - slope * 2.2 * sunSide + Math.sin((x - (y + 200) * .9 * Math.sign(x - Y.S.x)) / 40) * .16) * (1 - smooth(10, 120, d) * .5);
    let c = mix(P.mtn, P.mtnLit, lit);
    if (d < 7) c = mix(P.mtnLit, [255, 248, 236], .28 * (1 - L.night * .6));                     // the lit crest, one row
    if (vnoise(x / 30, y / 20, 12) > .63 && d > 10) c = mix(c, P.chap, .5);
    return mix(c, P.haze, .2 * smooth(30, 110, d));
  }, { src: ['sky', 'sun'] });
  R('town', 'view', below(() => Y.foot, -RI - 4, RI + 4, F + 2), (x, y) => {
    const h = hash2(x / 9 | 0, y / 9 | 0, 21);
    let c = h < .55 ? P.townTree : h < .84 ? mix(P.townTree, P.haze, .5) : mix(P.town, [255, 255, 255], h > .95 ? .3 : 0);
    c = mix(c, P.haze, .5 - .35 * L.lamps);
    if (L.lamps > 0 && hash2(x / 9 | 0, y / 9 | 0, 33) > .48) c = mix(c, h > .7 ? [236, 240, 255] : [255, 204, 118], L.lamps * .85);
    return c;
  }, { src: ['ridge', 'obs'], live: 'town', fine: .78 });
  /* the observatory */
  const { big, small, shane, hall, k } = Y;
  const onGround = (x0, x1, top) => c => { c.moveTo(x0, top); c.lineTo(x1, top); for (let x = x1; x >= x0; x -= 3) c.lineTo(x, Y.ridgeY(x) + 6); c.lineTo(x0, Y.ridgeY(x0) + 6); c.closePath(); };
  const stucco = (x, cx, half) => mix(P.stucco, P.stuccoShade, smooth(-.3, .8, (x - cx) / half * sunSide) * .85);
  R('towers', 'obs', union(onGround(small.x - small.half, small.x + small.half, small.top), onGround(big.x - big.half, big.x + big.half, big.top), onGround(shane.x - shane.half, shane.x + shane.half, shane.top)), (x, y) => {
    const T = Math.abs(x - small.x) < small.half + 1 ? small : Math.abs(x - big.x) < big.half + 1 ? big : shane;
    return y < T.top + 5 * k ? mix(P.stucco, [255, 255, 255], .2) : stucco(x, T.x, T.half);
  }, { fine: .66, src: 'courses', flat: true });
  R('hall', 'obs', onGround(hall.x0, hall.x1, hall.top), (x, y) => y < hall.top + 5 * k ? mix(P.stucco, [255, 255, 255], .15) : mix(P.stucco, P.stuccoShade, .3), { fine: .62, src: 'courses' });
  R('domes', 'obs', c => { for (const D of [small, big, shane]) { c.moveTo(D.x + D.r, D.top + 1); c.arc(D.x, D.top + 1, D.r, 0, Math.PI, true); c.closePath(); } }, (x, y) => {
    const D = Math.abs(x - small.x) < small.r + 1 ? small : Math.abs(x - big.x) < big.r + 1 ? big : shane, nx = (x - D.x) / D.r, ny = (y - D.top) / D.r;
    if (D !== shane && Math.abs(nx + .14 * sunSide) < .13 && ny < -.1) return D === big && L.lamps > .2 ? mix(P.domeSlit, P.slitGlow, L.lamps) : P.domeSlit;
    return mix(P.domeLit, P.domeShade, smooth(-.2, .8, nx * sunSide * .9 - ny * .3));
  }, { fine: .6, live: 'slit', flat: true });
  /* golden foothills and oaks */
  const OAKS = oakList(Y, A);
  R('hills', 'view', below(Y.hillY, -RI - 4, RI + 4, F + 2), (x, y) => {
    const d = y - Y.hillY(x), slope = (Y.hillY(x + 5) - Y.hillY(x - 5)) / 10;
    let c = mix(P.hillLit, P.hill, clamp(.45 + slope * 3 * sunSide) * .7 + smooth(0, 80, d) * .3);
    for (const o of OAKS) { const s = Math.hypot((x - o.x - o.r * .35 * -sunSide) / (o.r * 1.3), (y - o.y - 3) / (o.ry * .5)); if (s < 1) c = mix(c, P.shadow, .5 * (1 - s * s)); }
    c = mix(c, P.shadow, smooth(.58, .8, vnoise(x / 40, y / 7, 9)) * .3);
    return mix(c, P.shadow, deskShadow(A, x, y) * .7);
  }, { src: ['town', 'ridge', 'obs'] });
  const grove = list => (x, y) => {
    let o = list[0], bd = 1e9;
    for (const g of list) { const d = Math.hypot((x - g.x) / g.r, (y - (g.y - g.ry * .8)) / g.ry); if (d < bd) { bd = d; o = g; } }
    const nx = (x - o.x) / o.r, ny = (y - (o.y - o.ry * .8)) / o.ry;
    return mix(mix(mix(P.oak, P.oakDeep, o.k * .35), P.oakLit, smooth(.3, -.8, nx * -sunSide * .7 + ny * .8)), P.oakDeep, smooth(.1, .95, ny) * .5);
  };
  R('oaks', 'tree', union(...OAKS.map(o => ell(o.x, o.y - o.ry * .8, o.r, o.ry))), grove(OAKS), { fine: .7, flat: true });
  R('near', 'view', below(Y.nearY, -RI - 4, RI + 4, F + 2), (x, y) => {
    const d = y - Y.nearY(x);
    if (hash2(x / 8 | 0, y / 8 | 0, 71) > .9 && d > 4) return mix(mix(rgb('#e8731f'), rgb('#f2a33a'), hash2(x / 8 | 0, y / 8 | 0, 72)), P.near, .7 * L.night + .3 * L.dusk);   // California poppies
    let c = mix(P.nearLit, P.near, smooth(0, 40, d) * .5 + .2 * vnoise(x / 30, y / 10, 6));
    return mix(mix(c, P.shadow, smooth(.58, .8, vnoise(x / 40, y / 8, 10)) * .3), P.shadow, deskShadow(A, x, y) * .7);
  }, { src: 'courses', fine: .9 });
  const bo = Y.bigOak;
  R('bigTrunk', 'tree', union(poly([[bo.x - 9, bo.y + 2], [bo.x - 5, bo.y - 34], [bo.x + 5, bo.y - 34], [bo.x + 10, bo.y + 2]]), bar(bo.x - 2, bo.y - 26, bo.x - 26, bo.y - 50, 8), bar(bo.x + 2, bo.y - 26, bo.x + 28, bo.y - 46, 8)), () => tint(P.trunk), { fine: .6 });
  R('bigOak', 'tree', union(ell(bo.x, bo.y - 30 - bo.ry * .78, bo.rx, bo.ry * .72), ell(bo.x - bo.rx * .45, bo.y - 30 - bo.ry * .55, bo.rx * .58, bo.ry * .6), ell(bo.x + bo.rx * .5, bo.y - 30 - bo.ry * .58, bo.rx * .55, bo.ry * .58), ell(bo.x + bo.rx * .05, bo.y - 30 - bo.ry * 1.18, bo.rx * .55, bo.ry * .5)), (x, y) => {
    const cy = bo.y - 30 - bo.ry, lit = smooth(.25, -.95, ((x - bo.x) / bo.rx) * -sunSide + (y - cy) / bo.ry * .9);
    return mix(mix(P.oak, P.oakLit, clamp(lit + (vnoise(x / 26, y / 20, 8) - .5) * .5)), P.oakDeep, smooth(cy + bo.ry * .3, cy + bo.ry * 1.05, y) * .6);
  }, { fine: .72 });
  /* the desk */
  deskRegions(R, L, A);
  return out;
}

function oakList(Y, A) {
  let a = 91; const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  const out = [], t = Y.t;
  // oaks in three bands down the foothills: small and far along the hill line, larger lower down,
  // and a few big ones behind the desk, so the land goes on behind its legs
  const bands = [[Y.hillY(0) + lerp(12, 20, t), lerp(13, 18, t), 12], [lerp(-40, A.deskY + 70 * A.sd, t), lerp(17, 23, t), 8], [lerp(40, A.deskY + 150 * A.sd, t), lerp(22, 28, t), 6]];
  bands.forEach(([y0, r0, n], bi) => {
    for (let i = 0; i < n; i++) {
      const x = -RI + (i + .3 + rnd() * .5) * (2 * RI / n);
      const y = bi === 0 ? Y.hillY(x) + lerp(10, 18, t) + rnd() * 6 : y0 + (rnd() - .5) * 26;
      if (y > Y.nearY(x) - 6) continue;
      out.push({ x, y, r: r0 * (.8 + rnd() * .45) * Y.oakR, ry: 0, k: rnd() });
    }
  });
  for (const o of out) o.ry = o.r * .72;
  return out;
}

/* ───────── what moves ───────── */
function liveKind(t, r, L) {
  if (r.live === 'sky') return 'sky';
  if (r.live === 'sun' || r.live === 'rays') return 'sun';
  if (r.live === 'slit' && L.lamps > .2) return 'slit';
  if (r.live === 'town' && L.lamps > .1 && t.h > .8) return 'town';
  return null;
}
function frameState(time, L) { return { birds: L.night < .5 && L.dusk < .5 ? birdsAt(time, [[0, 34, -330, 22], [1, 42, -290, 18]]) : [], time }; }
function liveColour(s, F, L) {
  if (s.kind === 'sky') {
    for (const bd of F.birds) if (inBird(bd, s.ux * 1 + 0, s.uy)) return mix(s.col, rgb('#3a2f28'), .85);
    if (s.star) { const tw = .55 + .45 * Math.sin(F.time * (1.3 + s.h2 * 2) + s.h * 40); return mix(s.col, [255, 248, 222], L.stars * tw * .6); }
    return null;
  }
  if (s.kind === 'town') { const tw = Math.sin(F.time * (1.5 + s.h2 * 2) + s.h * 60); return tw > .3 ? mix(s.col, [255, 244, 220], (tw - .3) * .5 * L.lamps) : null; }
  if (s.kind === 'slit') return mix(s.col, [255, 220, 150], .25 * (.8 + .2 * Math.sin(F.time * .7 + s.uy * .05)) * L.lamps);
  return null;
}
const isStar = (r, L, t, A) => r.name === 'sky' && L.stars > .05 && t.h > .985 && t.uy < layout(A).S.y - 30;

export default {
  key: 'now', place: 'San Jose', light, regions, liveKind, frameState, liveColour, isStar,
  stars: (L, A) => { if (L.stars < .35) return []; const Y = layout(A), m = L.moonUp ? arcPos(L.moonAz, A) : null; return starField(A, x => Y.ridgeY(x) - 20, m ? [[m[0], m[1], 100]] : [], 3, L.stars); },
  outlines: [
    ...deskOutlines(['sky', 'sun', 'view', 'obs', 'tree', 'rays']),
    { inside: ['obs'], against: ['sky', 'sun', 'view'] },
  ],
  birdsBox: () => null,
  alt: L => `The apse, laid in mosaic: San’s desk with its red lamp, a stack of books, the laptop, the blue paper robot and a telescope, and behind it Mt Hamilton with the white domes of the Lick Observatory above golden foothills and valley oaks; it is ${L.label} in San Jose, and the conch is ${L.night > .5 ? 'lapis with stars' : L.dusk > .5 ? 'rows of dusk colour' : 'gold'}.`,
};
