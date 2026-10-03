/* Arched window mosaic: the composition.
   DESIGN
     One round-headed window, set into a plain plaster wall, laid as a mosaic. Few, big shapes so
     every one is many stones across: a sky, a sun (or moon) travelling along the arch, Mt Hamilton
     with the three Lick Observatory domes, one band of foothills, a row of valley roofs, and the
     paper robot standing on the sill.
     Palette (golden hour): teal #2a8f8c → pale aqua #a8d8cf → gold #f2d68a → apricot #f0b064 sky;
       sun #e0702f → #f8e6a4; ridge deep teal-blue #1d5560; foothills olive #8b9a52 → gold #c8b45c;
       roofs terracotta #c4683e; walls cream #efe4c8; cypress #2e4a30; marble #efe5cc; robot cobalt
       #2f55b8 / #4f78c2 / #22408f, vermilion ear #df4a2e. Grout is pale warm grey #ddd5c4.
     Rules: dark outline rows only on the panel's edge, the inner arch, the sill line, the robot's
       silhouette and the domes against the sky. Everything else is told by colour. Stones follow
       each shape's edges (the sky hugs the arch, the sun and the robot; the hills follow their
       ridge; the frame runs round the arch; the sill is laid in courses).
     Refuse: dark grout, outlines on small detail, many small objects, brick-like walls, noise. */
import { mix, clamp, smooth, lerp, skyState, sceneDate, clockLabel, rgb } from './core.js';

export const PANEL = { x0: -40, y0: -14, w: 1080, h: 1114 };   // the sheet: the panel plus a margin of wall
const CX = 500, CY = 500, R_IN = 430, R_OUT = 500, IN_X0 = 70, IN_X1 = 930, SILL = 1000, SILL_B = 1086;
export const ARC_R = 296;

export const outerPath = c => { c.moveTo(0, SILL + 1); c.lineTo(0, CY); c.arc(CX, CY, R_OUT, Math.PI, 0); c.lineTo(1000, SILL + 1); c.closePath(); };
export const panelShape = c => { outerPath(c); c.rect(-26, SILL, 1052, SILL_B - SILL); };
export const innerPath = c => { c.moveTo(IN_X0, SILL + 1); c.lineTo(IN_X0, CY); c.arc(CX, CY, R_IN, Math.PI, 0); c.lineTo(IN_X1, SILL + 1); c.closePath(); };

/* ───────── the light ───────── */
const DAY = {
  skyTop: '#2c8fa0', skyMid: '#6fbcc4', skyLow: '#b5dfdc', skyHor: '#e9f0d8',
  ridge: '#3f7480', ridgeRim: '#6a9aa0', foot: '#7f9a54', footLit: '#a9b867',
  wall: '#f2ead6', roof: '#c96b42', roofDark: '#a8522f', cypress: '#2f4b31', window: '#5a6f78',
  marble: '#efe7d2', marbleShade: '#ddd0b3', sill: '#ebe2cb', sillFront: '#cfc2a3',
  sunOut: '#f2b44e', sunIn: '#fbefc4', domeLit: '#f6f1e4', domeShade: '#c9cdd2', drum: '#e9e3d4',
  robotTint: [1, 1, 1], outline: '#2b2925', grout: '#ddd6c6', bird: '#33383d',
};
const GOLDEN = {
  skyTop: '#25868a', skyMid: '#62b0aa', skyLow: '#b7dcc9', skyHor: '#f2c675',
  ridge: '#1f5864', ridgeRim: '#4f7f86', foot: '#7f8f4a', footLit: '#c9b65c',
  wall: '#f3e2c0', roof: '#c8643a', roofDark: '#a14b2b', cypress: '#2c462d', window: '#57606a',
  marble: '#f1e4c9', marbleShade: '#dcc8a3', sill: '#eedfc1', sillFront: '#cdb894',
  sunOut: '#e2702f', sunIn: '#fae6a0', domeLit: '#fbecd0', domeShade: '#b9b4bf', drum: '#efdcbc',
  robotTint: [1.05, .99, .93], outline: '#2c2723', grout: '#ddd3bf', bird: '#2f3036',
};
const TWILIGHT = {
  skyTop: '#26406e', skyMid: '#4b5d8f', skyLow: '#9a86a6', skyHor: '#e7a07a',
  ridge: '#273650', ridgeRim: '#3f4d6c', foot: '#4a5640', foot2: '#4a5640', footLit: '#6a6a4a',
  wall: '#cbbca6', roof: '#8d4c3a', roofDark: '#6f3a2c', cypress: '#22332a', window: '#f2c66a',
  marble: '#d9cdb8', marbleShade: '#c2b498', sill: '#d6c9b0', sillFront: '#b5a88c',
  sunOut: '#e4683a', sunIn: '#f6c58c', domeLit: '#d9d2d6', domeShade: '#8f8ca3', drum: '#cbc3c4',
  robotTint: [.74, .76, .9], outline: '#26232a', grout: '#d5ccbb', bird: '#22242c',
};
const NIGHT = {
  skyTop: '#101b3a', skyMid: '#172a54', skyLow: '#22396a', skyHor: '#354c78',
  ridge: '#141d2e', ridgeRim: '#26324a', foot: '#1f2a26', footLit: '#2a3530',
  wall: '#5c5a62', roof: '#3f2c2c', roofDark: '#33232a', cypress: '#142019', window: '#f5c35a',
  marble: '#c9c3b6', marbleShade: '#b3ab9a', sill: '#c6bead', sillFront: '#a79f8c',
  sunOut: '#e4683a', sunIn: '#f6c58c', domeLit: '#b9c0cf', domeShade: '#6c7590', drum: '#9aa1b2',
  robotTint: [.44, .5, .74], outline: '#24222a', grout: '#d2cab9', bird: '#0e1220',
};
function blend(a, b, t) {
  const o = {};
  for (const k of Object.keys(a)) o[k] = k === 'robotTint' ? a[k].map((v, i) => lerp(v, b[k][i], t)) : mix(a[k], b[k] || a[k], t);
  return o;
}
const asRGB = p => { const o = {}; for (const k of Object.keys(p)) o[k] = typeof p[k] === 'string' ? rgb(p[k]) : p[k]; return o; };

/* Where the sun or moon sits: on an arc concentric with the window, morning on the left, evening on the right. */
export function arcPos(az) {
  const th = Math.PI + Math.PI * clamp((az - 95) / 170);
  return [CX + ARC_R * Math.cos(th), CY + ARC_R * Math.sin(th)];
}

export function lightFor(hour) {
  const date = sceneDate(hour), sky = skyState(date);
  // the palette follows the sun's height: day, then gold, then twilight, then night
  const e = sky.sun.el, D = asRGB(DAY), G = asRGB(GOLDEN), T = asRGB(TWILIGHT), Nt = asRGB(NIGHT);
  const p = e >= 24 ? D : e >= 6 ? blend(G, D, smooth(6, 24, e)) : e >= -1 ? G
    : e >= -7 ? blend(G, T, smooth(-1, -7, e)) : e >= -13 ? blend(T, Nt, smooth(-7, -13, e)) : Nt;
  const sunUp = sky.sun.el > -1.5, moonUp = sky.moon.el > 0 && sky.night + sky.twilight > .35;
  return {
    pal: p, sky, date, label: clockLabel(date),
    sun: sunUp ? arcPos(sky.sun.az) : null,
    moon: !sunUp && moonUp ? { at: arcPos(sky.moon.az), phase: sky.moon.phase } : null,
    stars: sky.stars, night: sky.night, lamp: sky.lamp,
  };
}

/* ───────── the shapes ───────── */
const ridgeY = x => 782 - 142 * Math.exp(-(((x - 692) / 236) ** 2)) - 38 * Math.exp(-(((x - 210) / 118) ** 2)) + 5 * Math.sin(x / 41);
const ridgeTop = ridgeY;
const footY = x => 846 + 18 * Math.sin(x / 95 + .8) + 10 * Math.sin(x / 41 + 2);

const DOMES = [{ x: 572, r: 46, drum: 26 }, { x: 692, r: 60, drum: 34, slit: true }, { x: 814, r: 46, drum: 26 }];
const HOUSES = [{ x: 132, w: 100, h: 44 }, { x: 650, w: 108, h: 46 }, { x: 850, w: 100, h: 42 }];
const CYPRESS = [{ x: 212, w: 42, h: 152 }, { x: 566, w: 40, h: 142 }, { x: 752, w: 36, h: 122 }];

/* the robot: stands on the sill, left of centre, looking right toward the sun */
const RS = 1.12, RB = { x: 262, y: SILL - 358 * RS };
const rob = (dx, dy) => [RB.x + dx * RS, RB.y + dy * RS];
const poly = pts => c => { c.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) c.lineTo(...pts[i]); c.closePath(); };
const disc = (x, y, r) => c => { c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); c.closePath(); };

export function regionsFor(L) {
  const P = L.pal, out = [];
  const R = (name, group, draw, fill, o = {}) => out.push({ name, group, draw, fill, clip: group === 'view' || group === 'robot', fine: 1, src: 'self', ...o });
  /* frame and sill */
  R('frame', 'frame', outerPath, (x, y) => {
    const d = Math.hypot(x - CX, Math.min(y, CY) - CY), t = clamp((d - R_IN) / (R_OUT - R_IN));
    return mix(P.marble, P.marbleShade, .25 + .5 * Math.abs(t - .5) * 2);
  }, { clip: false, src: ['view', 'robot'] });
  R('sill', 'sill', c => c.rect(-26, SILL, 1052, SILL_B - SILL), (x, y) => y < SILL + 34 ? P.sill : P.sillFront, { clip: false, src: ['view', 'frame', 'robot'], fine: 1.05 });
  /* the view */
  R('sky', 'view', innerPath, (x, y) => {
    const t = clamp((y - 70) / (ridgeY(x) - 70));
    let c = t < .45 ? mix(P.skyTop, P.skyMid, t / .45) : t < .78 ? mix(P.skyMid, P.skyLow, (t - .45) / .33) : mix(P.skyLow, P.skyHor, (t - .78) / .22);
    if (L.sun) { const d = Math.hypot(x - L.sun[0], y - L.sun[1]); c = mix(c, P.sunIn, .38 * (1 - smooth(60, 230, d)) * (1 - L.night)); }
    return c;
  }, { live: 'sky' });
  if (L.sun) {
    const [sx, sy] = L.sun;
    R('sun', 'view', disc(sx, sy, 66), (x, y) => mix(P.sunIn, P.sunOut, smooth(8, 64, Math.hypot(x - sx, y - sy))), { live: 'sun', fine: .9 });
  }
  if (L.moon) {
    // the lit part of the disc: on the right while waxing, the left while waning
    const [mx, my] = L.moon.at, ph = L.moon.phase, r = 52, c2 = Math.cos(ph * Math.PI * 2);
    R('moon', 'view', disc(mx, my, r), (x, y) => {
      const dx = x - mx, w = Math.sqrt(Math.max(0, r * r - (y - my) ** 2));
      const litSide = ph < .5 ? dx > c2 * w : -dx > c2 * w;
      return litSide ? rgb('#f1ead2') : mix(P.skyMid, P.skyTop, .55);
    }, { live: 'moon', fine: .9 });
  }
  R('ridge', 'view', c => { c.moveTo(IN_X0 - 2, SILL + 1); for (let x = IN_X0 - 2; x <= IN_X1 + 2; x += 6) c.lineTo(x, ridgeTop(x)); c.lineTo(IN_X1 + 2, SILL + 1); c.closePath(); },
    (x, y) => mix(P.ridgeRim, P.ridge, smooth(0, 70, y - ridgeTop(x))), { src: ['sky', 'sun', 'moon'] });
  R('domes', 'view', c => {
    for (const d of DOMES) {
      const base = ridgeY(d.x) + 10;
      c.moveTo(d.x - d.r * .92, base); c.lineTo(d.x - d.r * .92, base - d.drum); c.lineTo(d.x + d.r * .92, base - d.drum); c.lineTo(d.x + d.r * .92, base); c.closePath();
      c.moveTo(d.x + d.r, base - d.drum); c.arc(d.x, base - d.drum, d.r, 0, Math.PI, true); c.closePath();
    }
  }, (x, y) => {
    const d = DOMES.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a), base = ridgeY(d.x) + 10;
    if (y > base - d.drum) return mix(P.drum, P.domeShade, smooth(-.2, .9, (x - d.x) / d.r) * .7);
    const nx = (x - d.x) / d.r, ny = (y - (base - d.drum)) / d.r;
    if (d.slit && Math.abs(nx + .12) < .1 && ny < -.12) return mix(P.domeShade, P.outline, .55);
    return mix(P.domeLit, P.domeShade, smooth(-.15, .65, nx * .9 - ny * .25));
  }, { fine: .78, src: 'self' });
  R('foothills', 'view', c => { c.moveTo(IN_X0 - 2, SILL + 1); for (let x = IN_X0 - 2; x <= IN_X1 + 2; x += 6) c.lineTo(x, footY(x)); c.lineTo(IN_X1 + 2, SILL + 1); c.closePath(); },
    (x, y) => mix(P.footLit, P.foot, smooth(0, 60, y - footY(x))), { src: ['ridge', 'domes'] });
  R('cypress', 'view', c => {
    for (const t of CYPRESS) { const b = SILL + 1; c.moveTo(t.x, b - t.h); c.bezierCurveTo(t.x + t.w * .7, b - t.h * .62, t.x + t.w * .62, b - t.h * .12, t.x + t.w * .4, b); c.lineTo(t.x - t.w * .4, b); c.bezierCurveTo(t.x - t.w * .62, b - t.h * .12, t.x - t.w * .7, b - t.h * .62, t.x, b - t.h); c.closePath(); }
  }, (x) => { const t = CYPRESS.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a); return mix(P.footLit, P.cypress, .62 + .38 * smooth(-.5, .5, (x - t.x) / t.w)); }, { fine: .8 });
  R('walls', 'view', c => { for (const h of HOUSES) c.rect(h.x - h.w / 2, SILL - h.h, h.w, h.h + 1); }, (x) => {
    const h = HOUSES.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a);
    return mix(P.wall, P.marbleShade, x > h.x + h.w * .18 ? .28 : 0);
  }, { fine: .8 });
  R('windows', 'view', c => { for (const h of HOUSES) for (const f of [-.25, .22]) c.rect(h.x + f * h.w - 9, SILL - h.h * .62, 18, 16); }, () => P.window, { fine: .7, live: 'window' });
  R('roofs', 'view', c => { for (const h of HOUSES) { const y = SILL - h.h; c.moveTo(h.x - h.w * .62, y + 2); c.lineTo(h.x - h.w * .3, y - 34); c.lineTo(h.x + h.w * .3, y - 34); c.lineTo(h.x + h.w * .62, y + 2); c.closePath(); } },
    (x) => { const h = HOUSES.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a); return x > h.x + h.w * .05 ? P.roofDark : P.roof; }, { fine: .8 });
  /* the robot */
  const tint = c => [c[0] * P.robotTint[0], c[1] * P.robotTint[1], c[2] * P.robotTint[2]].map(v => Math.min(255, v));
  const lit = (base, x) => tint(mix(base, [255, 236, 200], L.sun && L.sun[0] > RB.x ? .1 * smooth(0, 190, (x - RB.x) / RS) : 0));
  R('body', 'robot', poly([rob(16, 358), rob(16, 232), rob(34, 206), rob(158, 206), rob(176, 232), rob(176, 358)]), (x, y) => lit(mix(rgb('#3a62c4'), rgb('#22408f'), smooth(220, 360, (y - RB.y) / RS) * .6 + smooth(80, 180, (x - RB.x) / RS) * .25), x), { fine: .74, src: 'courses' });
  R('neck', 'robot', poly([rob(68, 210), rob(68, 176), rob(124, 176), rob(124, 210)]), () => tint(rgb('#1d3478')), { fine: .7 });
  R('headTop', 'robot', poly([rob(4, 28), rob(32, 0), rob(194, 0), rob(166, 28)]), (x) => lit(rgb('#5b82cc'), x), { fine: .7 });
  R('headSide', 'robot', poly([rob(166, 28), rob(194, 0), rob(194, 150), rob(166, 178)]), () => tint(rgb('#21418f')), { fine: .7 });
  R('headFront', 'robot', poly([rob(4, 28), rob(122, 28), rob(166, 72), rob(166, 178), rob(4, 178)]), (x, y) => lit(mix(rgb('#3460c2'), rgb('#2a4ea8'), smooth(40, 170, (y - RB.y) / RS)), x), { fine: .7 });
  R('fold', 'robot', poly([rob(122, 28), rob(166, 28), rob(166, 72)]), (x, y) => tint(mix(rgb('#f6eedb'), rgb('#d8ccb2'), smooth(0, 40, ((x - RB.x) / RS - 122) - ((y - RB.y) / RS - 28)))), { fine: .62 });
  R('earRim', 'robot', disc(...rob(184, 102), 33 * RS), () => tint(rgb('#f2e6cc')), { fine: .66 });
  R('ear', 'robot', disc(...rob(184, 102), 25 * RS), (x, y) => tint(mix(rgb('#e8573a'), rgb('#c23a25'), smooth(-20, 25, ((x - RB.x) / RS - 184) + ((y - RB.y) / RS - 102) * .6))), { fine: .66 });
  for (const [k, ex] of [['L', 44], ['R', 116]]) {
    R('eye' + k, 'robot', disc(...rob(ex, 104), 29 * RS), () => tint(rgb('#f8f3e6')), { fine: .62 });
    R('pupil' + k, 'robot', disc(...rob(ex + 10, 106), 12 * RS), () => rgb('#1f1c1a'), { fine: .6 });
  }
  return out;
}

/* outline rows: a dark row laid inside `inside`, hugging its edge with `against` */
export const OUTLINES = [
  { inside: ['frame', 'sill'], against: ['outside'] },
  { inside: ['frame'], against: ['view', 'robot'] },
  { inside: ['sill'], against: ['view', 'frame', 'robot'] },
  { inside: ['robot'], against: ['view', 'frame', 'sill', 'outside'] },
  { inside: ['domes'], against: ['sky', 'sun', 'moon'] },
];

/* the birds: two gulls gliding across the upper sky, about a dozen stones wide */
export function birdsAt(t) {
  const out = [];
  for (const [i, period, y0, size] of [[0, 26, 240, 74], [1, 34, 335, 58]]) {
    const ph = ((t + i * 13) % period) / period, x = lerp(IN_X0 - 120, IN_X1 + 120, ph), y = y0 + 22 * Math.sin(ph * 6.28 + i);
    const flap = .5 + .5 * Math.sin(t * (1.6 + i * .3) + i);
    out.push({ x, y, size, flap });
  }
  return out;
}
/** Is the point (x, y) inside a gull's silhouette? Two arcs meeting at the body. */
export function inBird(b, x, y) {
  const dx = x - b.x, dy = y - b.y, s = b.size;
  if (Math.abs(dx) > s * 1.1 || Math.abs(dy) > s * .6) return false;
  const u = Math.abs(dx) / s, lift = (.18 + .2 * b.flap);
  const wingY = -lift * Math.sin(Math.min(1, u) * Math.PI) * s * .9 + u * u * s * .22 * (1 - b.flap * .5);
  const half = s * (.16 - .09 * u);
  return u <= 1 && Math.abs(dy - wingY) < Math.max(s * .07, half);
}
