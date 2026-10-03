/* San Jose, 2024 – now: Mt Hamilton across the valley, with the Lick Observatory on its summit
   drawn large enough to read (the long hall with a small dome at one end and the great dome on
   its tower at the other, the separate Shane dome on the next shoulder), golden October foothills
   with dark valley oaks, and the real sky at this hour in San Jose.
   On the sill, one thing: a small brass telescope aimed at the great dome.
   v3 (October 3): v2's view (three equal domes on a teal ridge, two houses, cypresses, a hedge, and
   a telescope, the robot and a succulent on the sill) did not read: the domes looked like bubbles
   and the sill was a crowd. Now a few big shapes: the observatory, the golden hills, one big oak.
   Palette (golden hour): sky teal #25868a → aqua #62b0aa → gold #f2c675; Mt Hamilton mauve
   #7f7896, its lit face #b8938a; hills tawny #c18e54 → #e4b474, shade #84643e; oaks #3f5a35 /
   #66803f; domes #fdf1dd / #c2b8c4, slit #4b4650; hall stucco #f6e2bf / #cfb48e; brass #c9973f;
   walnut #6e4a2c. Night stays light: sky #2a4479 → #6b88bc, moonlit hills #5c6a86 / #7a88a2,
   city lights #ffcc76. */
import { mix, clamp, smooth, lerp, rgb, skyState, sceneDate, clockLabel, vnoise, hash2 } from '../core.js';
import { CX, CY, IN_X0, IN_X1, SILL, poly, disc, ell, bar, below, union, regionList } from '../geom.js';
import { birdsAt, inBird } from './life.js';

const DAY = {
  skyTop: '#3a8fc2', skyMid: '#77bbdf', skyLow: '#b6dbe6', skyHor: '#e8efdd',
  mtn: '#8293b2', mtnLit: '#aab6ca', chap: '#6f7f8e', hill: '#c3a06a', hillLit: '#dcc18e', near: '#c9a56c', nearLit: '#e0c690', shadow: '#8c7850',
  town: '#d9dcd8', townTree: '#7f9180', haze: '#b9c6d2',
  oak: '#4c6a3d', oakLit: '#738e50', oakDeep: '#33492e', trunk: '#4e3b2a',
  domeLit: '#fbf8f1', domeShade: '#c4c9d1', domeSlit: '#4c535d', stucco: '#f3ead6', stuccoShade: '#d3c6a8', window: '#66707a', slitGlow: '#4c535d',
  sunOut: '#f2b44e', sunIn: '#fbefc4', tint: [1, 1, 1], bird: '#3a3530',
};
const GOLDEN = {
  skyTop: '#25868a', skyMid: '#62b0aa', skyLow: '#b7dcc9', skyHor: '#f2c675',
  mtn: '#7f7896', mtnLit: '#b8938a', chap: '#6a6478', hill: '#c18e54', hillLit: '#e4b474', near: '#c99a5a', nearLit: '#e9be7c', shadow: '#84643e',
  town: '#e9d7c0', townTree: '#7b7f62', haze: '#c9b4a6',
  oak: '#3f5a35', oakLit: '#66803f', oakDeep: '#2b4029', trunk: '#4a3626',
  domeLit: '#fdf1dd', domeShade: '#c2b8c4', domeSlit: '#4b4650', stucco: '#f6e2bf', stuccoShade: '#cfb48e', window: '#5f5a62', slitGlow: '#4b4650',
  sunOut: '#e2702f', sunIn: '#fae6a0', tint: [1.04, .99, .94], bird: '#33302e',
};
const TWILIGHT = {
  skyTop: '#3b5b92', skyMid: '#6a7cb2', skyLow: '#b09bbb', skyHor: '#f0b28a',
  mtn: '#55608c', mtnLit: '#7a7aa4', chap: '#4b527a', hill: '#8c7c68', hillLit: '#ab9473', near: '#958268', nearLit: '#b39a76', shadow: '#6e6158',
  town: '#8a87a0', townTree: '#57606a', haze: '#8b8fb0',
  oak: '#344632', oakLit: '#4a5c40', oakDeep: '#26352a', trunk: '#3a2e2a',
  domeLit: '#ece6e6', domeShade: '#a7a6bd', domeSlit: '#45435a', stucco: '#ddd0c4', stuccoShade: '#b2a6a2', window: '#f2c66a', slitGlow: '#e9a95a',
  sunOut: '#e4683a', sunIn: '#f6c58c', tint: [.9, .88, .96], bird: '#2a2a36',
};
/* night is lifted on purpose: moonlit blues with clear steps between sky, mountain, hills and oaks */
const NIGHT = {
  skyTop: '#2a4479', skyMid: '#38558e', skyLow: '#4d6ba4', skyHor: '#6b88bc',
  mtn: '#34477a', mtnLit: '#51659a', chap: '#2e3f6c', hill: '#5c6a86', hillLit: '#7a88a2', near: '#66738f', nearLit: '#8592ab', shadow: '#4a5671',
  town: '#3a4566', townTree: '#2c3756', haze: '#4a5a84',
  oak: '#25334f', oakLit: '#3a4b6c', oakDeep: '#1c2840', trunk: '#222b40',
  domeLit: '#e6ebf3', domeShade: '#a3aec4', domeSlit: '#3a4258', stucco: '#c4c9d6', stuccoShade: '#9aa1b6', window: '#f5c35a', slitGlow: '#f2b45a',
  sunOut: '#e4683a', sunIn: '#f6c58c', tint: [.84, .86, .97], bird: '#1b2236',
};
const asRGB = p => { const o = {}; for (const k of Object.keys(p)) o[k] = typeof p[k] === 'string' ? rgb(p[k]) : p[k]; return o; };
function blend(a, b, t) { const o = {}; for (const k of Object.keys(a)) o[k] = k === 'tint' ? a[k].map((v, i) => lerp(v, b[k][i], t)) : mix(a[k], b[k], t); return o; }
const PALS = { D: asRGB(DAY), G: asRGB(GOLDEN), T: asRGB(TWILIGHT), N: asRGB(NIGHT) };

/* the sun or moon travels an arc concentric with the window: morning on the left, evening on the right */
const ARC_R = 318;
const arcPos = az => { const th = Math.PI + Math.PI * clamp((az - 95) / 170); return [CX + ARC_R * Math.cos(th), CY + ARC_R * Math.sin(th) - 34]; };

function light(hour) {
  const date = sceneDate(hour), sky = skyState(date), e = sky.sun.el, { D, G, T, N } = PALS;
  const pal = e >= 24 ? D : e >= 6 ? blend(G, D, smooth(6, 24, e)) : e >= -1 ? G
    : e >= -7 ? blend(G, T, smooth(-1, -7, e)) : e >= -13 ? blend(T, N, smooth(-7, -13, e)) : N;
  const sunUp = e > -1.5, moonUp = sky.moon.el > 0 && sky.night + sky.twilight > .35;
  const label = clockLabel(date);
  return { pal, sky, label, caption: `San Jose · ${label}`, clock: label,
    sun: sunUp ? arcPos(sky.sun.az) : null, moon: !sunUp && moonUp ? { at: arcPos(sky.moon.az), phase: sky.moon.phase } : null,
    stars: sky.stars, night: sky.night, lamps: smooth(-2, -8, e) };
}

/* ───────── shapes ───────── */
/* Mt Hamilton: a broad, rounded summit for the observatory and a shoulder for the Shane dome */
const ridgeY = x => 612 + 112 * (1 - Math.exp(-((Math.max(0, Math.abs(x - 566) - 56) / 210) ** 2))) - 30 * Math.exp(-(((x - 838) / 60) ** 2)) + 3 * Math.sin(x / 37 + 1);
const footY = x => 744 + 3 * Math.sin(x / 50);                       // where the mountain meets the valley
const hillY = x => 794 + 18 * Math.sin(x / 115 + .6) + 8 * Math.sin(x / 47 + 2);
const nearY = x => 886 + 12 * Math.sin(x / 80 + 1) - 46 * Math.exp(-(((x - 800) / 170) ** 2));
/* the Lick Observatory, from the west: the small dome's tower (north, left), the hall with its entrance
   block, the great dome's tower (south, right), and the Shane dome on its own shoulder */
const SMALL = { x: 450, half: 38, top: 576, r: 42 };
const BIG = { x: 666, half: 60, top: 544, r: 66 };
const HALL = { x0: 470, x1: 630, top: 580 };
const ENTRY = { x0: 528, x1: 576, top: 566 };
const SHANE = { x: 838, half: 38, top: ridgeY(838) - 24, r: 38 };
const HALL_WINDOWS = [490, 510, 594, 614];
/** a building's outline from x0 to x1 at `top`, its foot following the ground */
const onGround = (x0, x1, top, peak) => c => {
  c.moveTo(x0, top); if (peak) c.lineTo((x0 + x1) / 2, top - peak); c.lineTo(x1, top);
  for (let x = x1; x >= x0; x -= 4) c.lineTo(x, ridgeY(x) + 8); c.lineTo(x0, ridgeY(x0) + 8); c.closePath();
};
/* valley oaks: dark rounded crowns on the gold: woodland down the folds and on the shaded flank,
   a few alone on the open grass, and the tops of the oaks below the window */
const rnd = (() => { let a = 91; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
const along2 = (x0, y0, x1, y1, n, r0, r1, jit) => Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return { x: x0 + (x1 - x0) * t + (rnd() - .5) * jit, y: y0 + (y1 - y0) * t + (rnd() - .5) * jit * .5, r: r0 + (r1 - r0) * rnd() }; });
const GROVES = [
  ...along2(366, 806, 612, 908, 12, 16, 30, 16),                                          // down the fold
  ...along2(92, 802, 232, 818, 7, 18, 30, 14),                                            // the shaded flank
  { x: 300, y: hillY(300) + 3, r: 20 }, { x: 662, y: hillY(662) + 4, r: 22 }, { x: 706, y: hillY(706) + 3, r: 15 },
  ...along2(300, 1002, 600, 1004, 7, 30, 42, 10).map(o => ({ ...o, low: true })),         // treetops below the window
].map(o => ({ ...o, ry: o.r * .7, k: rnd() }));
const OAKS = GROVES.filter(o => !o.low), LOW = GROVES.filter(o => o.low);
const FOLD = [[366, 806], [612, 908]];
const BIG_OAK = { x: 792, y: nearY(792) + 6, rx: 96, ry: 58 };
const segDistTo = (x, y, [[ax, ay], [bx, by]]) => { const dx = bx - ax, dy = by - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)); return Math.hypot(x - ax - dx * t, y - ay - dy * t); };
const crownOf = o => o.big ? union(ell(o.x, o.y - o.ry * .78, o.rx, o.ry * .72), ell(o.x - o.rx * .45, o.y - o.ry * .55, o.rx * .58, o.ry * .6), ell(o.x + o.rx * .5, o.y - o.ry * .58, o.rx * .55, o.ry * .58), ell(o.x + o.rx * .05, o.y - o.ry * 1.18, o.rx * .55, o.ry * .5)) : ell(o.x, o.y - o.ry * .8, o.r, o.ry);

/* the telescope: brass tube on a walnut pillar, aimed at the great dome */
const E = [150, 906], AIM = [BIG.x, BIG.top - BIG.r * .55], TL = 250, TW = 44;
const dir = (() => { const dx = AIM[0] - E[0], dy = AIM[1] - E[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; })();
const O = [E[0] + dir[0] * TL, E[1] + dir[1] * TL];
const along = t => [lerp(E[0], O[0], t), lerp(E[1], O[1], t)];
const PIV = along(.42);

function regions(L) {
  const P = L.pal, out = regionList(), R = out.R;
  const tint = c => [c[0] * P.tint[0], c[1] * P.tint[1], c[2] * P.tint[2]].map(v => Math.min(255, v));
  const warm = c => tint(L.sun ? mix(c, [255, 236, 200], .07 * (1 - L.night)) : c);
  const sunSide = L.sun ? (L.sun[0] < CX ? -1 : 1) : (L.moon ? (L.moon.at[0] < CX ? -1 : 1) : 1);   // which side the light comes from
  /* the view */
  R('sky', 'view', c => { c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, SILL - 60); }, (x, y) => {
    const t = clamp((y - 70) / (ridgeY(x) - 70));
    let c = t < .45 ? mix(P.skyTop, P.skyMid, t / .45) : t < .78 ? mix(P.skyMid, P.skyLow, (t - .45) / .33) : mix(P.skyLow, P.skyHor, (t - .78) / .22);
    if (L.sun) c = mix(c, P.sunIn, .36 * (1 - smooth(60, 240, Math.hypot(x - L.sun[0], y - L.sun[1]))) * (1 - L.night));
    if (L.moon) c = mix(c, mix(P.skyLow, [235, 236, 225], .3), .4 * (1 - smooth(50, 210, Math.hypot(x - L.moon.at[0], y - L.moon.at[1]))));
    return c;
  }, { live: 'sky' });
  if (L.sun) { const [sx, sy] = L.sun; R('sun', 'view', disc(sx, sy, 60), (x, y) => mix(P.sunIn, P.sunOut, smooth(8, 58, Math.hypot(x - sx, y - sy))), { live: 'sun', fine: .9 }); }
  if (L.moon) {
    const [mx, my] = L.moon.at, ph = L.moon.phase, r = 48, c2 = Math.cos(ph * Math.PI * 2);
    R('moon', 'view', disc(mx, my, r), (x, y) => {
      const dx = x - mx, w = Math.sqrt(Math.max(0, r * r - (y - my) ** 2)), lit = ph < .5 ? dx > c2 * w : -dx > c2 * w;
      return lit ? rgb('#f6efd8') : mix(P.skyMid, P.skyLow, .4);
    }, { live: 'moon', fine: .9 });
  }
  /* Mt Hamilton: its face toward the light is lit, the rest in haze */
  R('ridge', 'view', below(ridgeY), (x, y) => {
    const d = y - ridgeY(x), slope = (ridgeY(x + 6) - ridgeY(x - 6)) / 12;            // which way the slope faces
    const spur = Math.sin((x - (y - 600) * .9 * Math.sign(x - 566)) / 46);              // ridges running down its flanks
    const lit = clamp(.45 - slope * 2.2 * sunSide + spur * .18) * (1 - smooth(10, 140, d) * .5);
    let c = mix(P.mtn, P.mtnLit, lit);
    if (vnoise(x / 34, y / 22, 12) > .62 && d > 14) c = mix(c, P.chap, .5);              // patches of chaparral
    return mix(c, P.haze, .22 * smooth(40, 140, d));
  }, { src: ['sky', 'sun', 'moon'] });
  /* the valley: the city, far off, a band of roofs and trees (and lights at night) */
  R('town', 'view', below(footY), (x, y) => {
    const h = hash2(x / 9 | 0, y / 9 | 0, 21);
    let c = h < .55 ? P.townTree : h < .84 ? mix(P.townTree, P.haze, .5) : mix(P.town, [255, 255, 255], h > .95 ? .3 : 0);
    c = mix(c, P.haze, (.62 - .4 * L.lamps) + .2 * (1 - smooth(0, 22, y - footY(x))) * (1 - L.lamps));   // hazier toward the mountain's foot
    if (L.lamps > 0 && hash2(x / 9 | 0, y / 9 | 0, 33) > .5) c = mix(c, h > .7 ? [236, 240, 255] : [255, 204, 118], L.lamps * .78);   // the city's lights
    return c;
  }, { src: ['ridge', 'obs'], live: 'town', fine: .8 });
  /* the observatory */
  const stucco = (x, cx, half) => mix(P.stucco, P.stuccoShade, smooth(-.3, .8, (x - cx) / half * sunSide) * .85);
  R('towers', 'obs', union(onGround(SMALL.x - SMALL.half, SMALL.x + SMALL.half, SMALL.top), onGround(BIG.x - BIG.half, BIG.x + BIG.half, BIG.top), onGround(SHANE.x - SHANE.half, SHANE.x + SHANE.half, SHANE.top)), (x, y) => {
    const T = x < 560 ? SMALL : x < 760 ? BIG : SHANE;
    if (y < T.top + 7) return mix(P.stucco, [255, 255, 255], .2);                          // a pale cornice under the dome
    return stucco(x, T.x, T.half);
  }, { fine: .74, src: 'courses' });
  R('hall', 'obs', union(onGround(HALL.x0, HALL.x1, HALL.top), onGround(ENTRY.x0, ENTRY.x1, ENTRY.top, 14)), (x, y) => {
    const inEntry = x >= ENTRY.x0 && x <= ENTRY.x1;
    if (!inEntry && y < HALL.top + 6) return mix(P.stucco, [255, 255, 255], .18);
    return mix(P.stucco, P.stuccoShade, inEntry ? (sunSide * (x - 552) > 0 ? .5 : .1) : .3);
  }, { fine: .7, src: 'courses' });
  R('obsWindows', 'obs', c => {
    for (const wx of HALL_WINDOWS) { c.moveTo(wx - 6, HALL.top + 34); c.lineTo(wx - 6, HALL.top + 17); c.arc(wx, HALL.top + 17, 6, Math.PI, 0); c.lineTo(wx + 6, HALL.top + 34); c.closePath(); }
    c.rect(546, ENTRY.top + 16, 12, 30);                                                     // the door
  }, () => P.window, { fine: .5, live: 'window' });
  R('domes', 'obs', c => {
    for (const D of [SMALL, BIG, SHANE]) { c.moveTo(D.x + D.r, D.top + 1); c.arc(D.x, D.top + 1, D.r, 0, Math.PI, true); c.closePath(); }
  }, (x, y) => {
    const D = x < 560 ? SMALL : x < 760 ? BIG : SHANE, nx = (x - D.x) / D.r, ny = (y - D.top) / D.r;
    if (D !== SHANE && Math.abs(nx + .14 * sunSide) < (D === BIG ? .11 : .12) && ny < -.08) return D === BIG && L.lamps > .2 ? mix(P.domeSlit, P.slitGlow, L.lamps) : P.domeSlit;   // the open shutter
    const l = smooth(-.2, .8, nx * sunSide * .9 - ny * .3);
    return mix(P.domeLit, P.domeShade, l);
  }, { fine: .72, live: 'slit' });
  /* golden foothills, and the valley oaks on them */
  R('hills', 'view', below(hillY), (x, y) => {
    const d = y - hillY(x), slope = (hillY(x + 5) - hillY(x - 5)) / 10;
    let c = mix(P.hillLit, P.hill, clamp(.45 + slope * 3 * sunSide) * .75 + smooth(0, 90, d) * .3);
    const fd = segDistTo(x, y, FOLD);                                                         // the fold the oaks follow is in shade
    if (fd < 60) c = mix(c, P.shadow, .5 * (1 - fd / 60) * (x - FOLD[0][0] > 0 ? 1 : 0));
    for (const o of OAKS) { const s = Math.hypot((x - o.x - o.r * .35 * -sunSide) / (o.r * 1.3), (y - o.y - 3) / (o.ry * .5)); if (s < 1) c = mix(c, P.shadow, .55 * (1 - s * s)); }
    c = mix(c, P.shadow, smooth(.58, .8, vnoise(x / 44, y / 7, 9)) * .3);                     // dry grass, combed by the wind
    return mix(c, P.hill, .25 * vnoise(x / 22, y / 10, 4));
  }, { src: ['town', 'ridge', 'obs'] });
  const grove = list => (x, y) => {
    let o = list[0], bd = 1e9;
    for (const g of list) { const d = Math.hypot((x - g.x) / g.r, (y - (g.y - g.ry * .8)) / g.ry); if (d < bd) { bd = d; o = g; } }
    const nx = (x - o.x) / o.r, ny = (y - (o.y - o.ry * .8)) / o.ry;
    const lit = smooth(.3, -.8, nx * -sunSide * .7 + ny * .8);
    return mix(mix(mix(P.oak, P.oakDeep, o.k * .35), P.oakLit, lit), P.oakDeep, smooth(.1, .95, ny) * .55);
  };
  R('oaks', 'tree', union(...OAKS.map(crownOf)), grove(OAKS), { fine: .72 });
  R('near', 'view', below(nearY), (x, y) => {
    const d = y - nearY(x);
    let c = mix(P.nearLit, P.near, smooth(0, 70, d) * .6 + .2 * vnoise(x / 30, y / 10, 6));
    c = mix(c, P.shadow, smooth(.58, .8, vnoise(x / 50, y / 8, 10)) * .3);
    const o = BIG_OAK, s = Math.hypot((x - o.x - o.rx * .25 * -sunSide) / (o.rx * 1.2), (y - o.y - 6) / 20);
    if (s < 1) c = mix(c, P.shadow, .6 * (1 - s * s));
    return c;
  }, { src: ['hills', 'tree'] });
  R('treetops', 'tree', union(...LOW.map(crownOf)), grove(LOW), { fine: .76 });
  R('bigTrunk', 'tree', union(poly([[BIG_OAK.x - 12, BIG_OAK.y + 4], [BIG_OAK.x - 7, BIG_OAK.y - 40], [BIG_OAK.x + 7, BIG_OAK.y - 40], [BIG_OAK.x + 13, BIG_OAK.y + 4]]),
    bar(BIG_OAK.x - 2, BIG_OAK.y - 30, BIG_OAK.x - 34, BIG_OAK.y - 62, 10), bar(BIG_OAK.x + 2, BIG_OAK.y - 30, BIG_OAK.x + 36, BIG_OAK.y - 58, 10)), () => P.trunk, { fine: .62 });
  R('bigOak', 'tree', crownOf({ ...BIG_OAK, y: BIG_OAK.y - 30, big: true }), (x, y) => {
    const o = BIG_OAK, cy = o.y - 30 - o.ry;
    const lit = smooth(.25, -.95, ((x - o.x) / o.rx) * -sunSide + (y - cy) / o.ry * .9);
    const clump = vnoise(x / 30, y / 24, 8);
    return mix(mix(P.oak, P.oakLit, clamp(lit + (clump - .5) * .5)), P.oakDeep, smooth(cy + o.ry * .3, cy + o.ry * 1.05, y) * .65);
  }, { fine: .76 });

  /* the sill: the telescope */
  const brassLit = rgb('#efcd76'), brassDark = rgb('#8f6a26'), wood = rgb('#6e4a2c'), woodLit = rgb('#93643c'), woodDark = rgb('#4d321e');
  const tubeShade = (x, y) => {   // light falls across the tube: bright along its upper edge
    const ax = O[0] - E[0], ay = O[1] - E[1], l = Math.hypot(ax, ay), v = ((x - E[0]) * -ay + (y - E[1]) * ax) / l;
    return warm(mix(brassLit, brassDark, smooth(-TW * .45, TW * .5, -v)));
  };
  R('tsStand', 'still', poly([[PIV[0] - 54, 962], [PIV[0] + 54, 962], [PIV[0] + 80, SILL + 1], [PIV[0] - 80, SILL + 1]]),
    (x, y) => tint(mix(woodLit, woodDark, smooth(-40, 80, x - PIV[0]) * .7 + smooth(962, 1000, y) * .3)), { fine: .74 });
  R('tsPillar', 'still', poly([[PIV[0] - 15, PIV[1]], [PIV[0] + 15, PIV[1]], [PIV[0] + 15, 964], [PIV[0] - 15, 964]]), x => tint(mix(wood, woodDark, smooth(-10, 16, x - PIV[0]))), { fine: .7 });
  R('tsTube', 'still', bar(...along(.04), ...along(.8), TW), (x, y) => {
    const c = tubeShade(x, y), t = ((x - E[0]) * (O[0] - E[0]) + (y - E[1]) * (O[1] - E[1])) / ((O[0] - E[0]) ** 2 + (O[1] - E[1]) ** 2);
    return Math.abs(t - .34) < .028 ? mix(c, brassDark, .55) : c;
  }, { fine: .7 });
  R('tsCap', 'still', bar(...along(.78), ...O, TW + 14), tubeShade, { fine: .7 });
  R('tsLens', 'still', bar(...along(.985), ...along(1.005), TW + 6), () => tint(rgb('#35505f')), { fine: .64 });
  R('tsEye', 'still', bar(...along(-.12), ...along(.06), 22), () => tint(mix(brassDark, woodDark, .4)), { fine: .66 });
  return out;
}

const outlines = [
  { inside: ['still'], against: ['view', 'obs', 'tree'] },
  { inside: ['obs'], against: ['sky', 'sun', 'moon', 'ridge'] },
];

/* ───────── what moves ───────── */
function liveKind(t, r, L) {
  if (r.live === 'sky') return 'sky';
  if (r.live === 'sun') return 'sun';
  if (r.live === 'window' && L.lamps > .2) return 'window';
  if (r.live === 'slit' && L.lamps > .2 && r.name === 'domes') return 'slit';
  if (r.live === 'town' && L.lamps > .1 && t.h > .8) return 'town';
  return null;
}
/* by day, two red-tailed hawks circle over the hills */
function frameState(time, L) { return { birds: L.night < .5 ? birdsAt(time, [[0, 30, 250, 46], [1, 38, 330, 38]]) : [], band: (time * 38) % 1500 - 250, time }; }
function liveColour(s, F, L) {
  const P = L.pal;
  if (s.kind === 'sky') {
    let col = s.col, changed = false;
    const b = Math.exp(-((((s.ux - F.band) + (s.uy - 300) * .35) / 90) ** 2)) * (1 - L.night * .7);
    if (b > .03) { col = mix(col, [255, 252, 238], b * .13); changed = true; }
    for (const bd of F.birds) if (inBird(bd, s.ux, s.uy)) { col = mix(s.col, P.bird, .88); changed = true; break; }
    if (s.star) { const tw = .55 + .45 * Math.sin(F.time * (1.3 + s.h2 * 2) + s.h * 40); col = mix(col, [255, 248, 222], L.stars * tw); changed = true; }
    return changed ? col : null;
  }
  if (s.kind === 'sun' && L.sun) {
    const a = Math.atan2(s.uy - L.sun[1], s.ux - L.sun[0]), gl = Math.max(0, Math.cos(a - F.time * .45 - s.row * .6)) ** 12;
    return gl > .02 ? mix(s.col, [255, 250, 230], gl * .35) : null;
  }
  if (s.kind === 'window') { const fl = .85 + .15 * Math.sin(F.time * 2.1 + s.h * 30); return mix(s.col, [255, 214, 120], .25 * fl * L.lamps); }
  if (s.kind === 'town') {
    // a few of the city's lights twinkle in the haze
    const tw = Math.sin(F.time * (1.5 + s.h2 * 2) + s.h * 60);
    return tw > .3 ? mix(s.col, [255, 244, 220], (tw - .3) * .5 * L.lamps) : mix(s.col, P.town, (.3 - tw) * .25 * L.lamps);
  }
  if (s.kind === 'slit') {
    const nx = (s.ux - BIG.x) / BIG.r;
    if (Math.abs(nx + .14 * (L.sun ? (L.sun[0] < CX ? -1 : 1) : L.moon ? (L.moon.at[0] < CX ? -1 : 1) : 1)) > .13 || s.ux < 560) return null;
    const fl = .8 + .2 * Math.sin(F.time * .7 + s.uy * .05);
    return mix(s.col, [255, 220, 150], .3 * fl * L.lamps);
  }
  return null;
}
const isStar = (r, L, t, uy) => r.name === 'sky' && L.stars > .05 && t.h > .982 && t.h2 > .2 && uy < 560 && !(L.moon && Math.hypot(t.ux - L.moon.at[0], t.uy - L.moon.at[1]) < 110);

export default {
  key: 'now', place: 'San Jose', light, regions, outlines, liveKind, frameState, liveColour, isStar,
  alt: L => `The window onto San Jose at ${L.label}: Mt Hamilton across the valley with the white domes of the Lick Observatory on its summit, golden foothills and dark valley oaks; on the sill a small brass telescope aimed at the great dome.`,
};
