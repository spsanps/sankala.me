/* Four frames: what the window looks out on. Each view is drawn in view units (1000 wide,
   H tall to match the opening) for a given light, baked once, and panned like a train window
   when the place changes. Small live things (clouds, a beam, kites) are drawn on top.
   Lines get finer with distance: near trees and buildings carry LW_IN, the middle distance
   LW_FINE, far hills hairlines. */
import { TAU, PI, mulberry32, clamp, lerp, mix, css } from './core.js';
import { INK, LW, LW_IN, LW_FINE, R, PL, LN, EL, BLOB, CURVE, bumpRing, SCALLOP, PAL } from './ink.js';

const LW_FAR = .65;

/* light-dependent colour: a day, golden-hour and night value mixed by the current light */
let LIGHT = { day: 1, golden: 0, night: 0, twilight: 0 };
export function setViewLight(l) { LIGHT = { day: l.day ?? 1, golden: l.golden || 0, night: l.night || 0, twilight: l.twilight || 0 }; }
function lcRGB(day, gold, night) { const g = clamp(LIGHT.golden + LIGHT.twilight * .6), n = clamp(LIGHT.night); return mix(mix(day, gold || day, g), night || day, n); }
function lc(day, gold, night) { return css(lcRGB(day, gold, night)); }
const inkL = (a = 1) => lc(`rgba(40,34,30,${a})`, `rgba(40,34,30,${a})`, `rgba(14,16,34,${a})`);

/* ───────── sky ───────── */
function drawSky(P, H, sky, o = {}) {
  const top = lcRGB(o.top || '#8fc0dd', o.topGold || '#7f9fc4', '#141c38');
  const mid = lcRGB(o.mid || '#b4d8ea', o.midGold || '#e9b98c', '#24305a');
  const low = lcRGB(o.low || '#d9ecf0', o.lowGold || '#f6d39a', '#3a4370');
  P.fill(P.grad(0, 0, 0, H * (o.horizon || .6), [[0, css(top)], [.55, css(mid)], [1, css(low)]]), R(-5, -5, 1010, H + 10));
  if (sky.stars > .02) drawStars(P, H * (o.horizon || .6), sky.stars, o.starSeed || 3);
  if (sky.moonUp) drawMoon(P, sky);
  if (sky.sunUp && o.sunVisible !== false) drawSun(P, sky);
}
function drawStars(P, H, amt, seed) {
  const rnd = mulberry32(seed), c = P.c;
  for (let i = 0; i < 90; i++) {
    const x = rnd() * 1000, y = rnd() * H * .95, r = .9 + rnd() * 1.8, a = amt * (.35 + rnd() * .65);
    c.fillStyle = `rgba(255,248,224,${a})`;
    if (r > 2.2) {
      c.save(); c.translate(x, y); c.beginPath();
      for (let k = 0; k < 4; k++) { c.rotate(PI / 2); c.moveTo(0, 0); c.quadraticCurveTo(1, -1, 0, -r * 2.6); c.quadraticCurveTo(-1, -1, 0, 0); }
      c.fill(); c.restore();
    } else { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  }
}
function drawMoon(P, sky) {
  const x = sky.moonX, y = sky.moonY, r = 26, ph = sky.moon.phase;
  P.alpha(.25 * Math.max(.4, LIGHT.night), p => p.fill(p.rgrad(x, y, r, r * 3.4, [[0, 'rgba(255,246,214,.6)'], [1, 'rgba(255,246,214,0)']]), EL(x, y, r * 3.4, r * 3.4)));
  const k = Math.cos(ph * TAU); // 1 new, -1 full
  P.within(EL(x, y, r, r), p => {
    p.fill('#f7efcf', EL(x, y, r, r));
    p.alpha(.9, q => q.fill(css(lcRGB('#9fbfd6', '#8a94b4', '#1d2748')), c => c.ellipse(x + (ph < .5 ? -1 : 1) * r * (1 - Math.abs(k)), y, r * Math.max(.05, Math.abs(k)), r, 0, 0, TAU)));
  });
  P.ink(EL(x, y, r, r), LW_IN, 'rgba(40,34,30,.6)');
}
function drawSun(P, sky) {
  const x = sky.sunX, y = sky.sunY, r = 30;
  P.alpha(.45, p => p.fill(p.rgrad(x, y, r * .8, r * 4, [[0, 'rgba(255,236,170,.75)'], [1, 'rgba(255,236,170,0)']]), EL(x, y, r * 4, r * 4)));
  P.shape(EL(x, y, r, r), lc('#fff6d6', '#ffd98a', '#fff6d6'), LW_IN);
}
/* Mosaic: clouds drift across the fixed stones, so while a view is laid they are recorded
   instead of drawn, and the living layer draws them each frame at their drifted position. */
export const CLOUDS = { capture: false, list: [] };
export function drawCloudSpec(P, s, dx = 0) {
  const keep = CLOUDS.capture; CLOUDS.capture = false;
  if (s.kind === 'big') bigCloud(P, s.cx + dx, s.cy, s.w, s.h, s.seed); else cloud(P, s.cx + dx, s.cy, s.w, s.h, s.seed, s.lw);
  CLOUDS.capture = keep;
}
/* clear-line cumulus: scalloped top, flatter base, shaded underside */
function cloud(P, cx, cy, w, h, seed, lw = LW_IN) {
  if (CLOUDS.capture) { CLOUDS.list.push({ kind: 'cum', cx, cy, w, h, seed, lw }); return; }
  const pts = bumpRing(cx, cy, w / 2, h / 2, 11, seed, .18, true), shapeFn = SCALLOP(pts, .42);
  P.paint(lc(PAL.cloud, '#ffe7c8', '#4a5480'), shapeFn);
  P.within(shapeFn, p => p.fill(lc(PAL.cloudShade, '#efc7a4', '#363f69'), BLOB([[cx - w * .6, cy + h * .26], [cx - w * .1, cy + h * .18], [cx + w * .3, cy + h * .24], [cx + w * .6, cy + h * .2], [cx + w * .6, cy + h], [cx - w * .6, cy + h]])));
  P.ink(shapeFn, lw, inkL(.95));
}
/* a round garden-tree crown with a shaded side */
function crown(P, cx, cy, r, seed, col, shade, lw = LW_IN, n = 9) {
  const f = SCALLOP(bumpRing(cx, cy, r, r * .86, n, seed, .2), .38);
  P.paint(col, f);
  P.within(f, p => p.fill(shade, BLOB([[cx + r * .1, cy - r], [cx + r * 1.2, cy - r * .2], [cx + r * 1.1, cy + r], [cx - r * .6, cy + r * 1.1], [cx - r * .2, cy + r * .2]])));
  P.ink(f, lw, inkL());
}

/* ───────── palms ─────────
   A coconut frond in clear line: a curved midrib and a feathered silhouette cut deep between
   the leaflets, which hang from the rib, longest in the middle and drooping toward the tip.
   Fine lines mark the leaflets; the underside of the frond is in shade. */
function frond(P, x, y, ang, len, droop, leaf, col, shade, lw, seed) {
  const rnd = mulberry32(seed);
  const cx = x + Math.cos(ang) * len * .5, cy = y + Math.sin(ang) * len * .5 - len * .22;
  const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len + droop * len;
  const at = t => { const u = 1 - t; return [u * u * x + 2 * u * t * cx + t * t * ex, u * u * y + 2 * u * t * cy + t * t * ey]; };
  const tan = t => { const u = 1 - t; const dx = 2 * u * (cx - x) + 2 * t * (ex - cx), dy = 2 * u * (cy - y) + 2 * t * (ey - cy), l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const n = 15, sides = { 1: [], [-1]: [] };
  for (let i = 1; i <= n; i++) {
    const t = .06 + .94 * i / n, tm = .06 + .94 * (i - .5) / n, [px0, py0] = at(t), [tx, ty] = tan(t), [qx, qy] = at(tm);
    const L = leaf * Math.pow(Math.sin(PI * Math.min(1, t * 1.02)), .55) * (1 - t * .25) * (.86 + rnd() * .26);
    for (const side of [1, -1]) {
      const nx = -ty * side, ny = tx * side;
      let dx = nx * .7 + tx * .5, dy = ny * .7 + ty * .5 + .5; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
      const tip = [px0 + dx * L, py0 + dy * L + L * .22];
      const notch = [qx + dx * L * .18, qy + dy * L * .18];
      sides[side].push({ notch, tip, base: [px0, py0] });
    }
  }
  const outline = c => {
    c.moveTo(x, y);
    for (const l of sides[1]) { c.lineTo(l.notch[0], l.notch[1]); c.lineTo(l.tip[0], l.tip[1]); }
    c.lineTo(ex, ey);
    for (let i = sides[-1].length - 1; i >= 0; i--) { const l = sides[-1][i]; c.lineTo(l.tip[0], l.tip[1]); c.lineTo(l.notch[0], l.notch[1]); }
    c.closePath();
  };
  const lower = Math.sin(ang) < -.2 ? -1 : 1; // the side hanging below the rib is in shade
  P.paint(col, outline);
  P.within(outline, p => {
    p.fill(shade, c => { c.moveTo(x, y); for (const l of sides[lower]) { c.lineTo(l.notch[0], l.notch[1]); c.lineTo(l.tip[0], l.tip[1]); } c.lineTo(ex, ey); for (let i = n; i >= 0; i--) { const [ax, ay] = at(i / n); c.lineTo(ax, ay); } c.closePath(); });
    if (lw > .8) for (const side of [1, -1]) for (const l of sides[side]) p.ink(LN([l.base, l.tip]), lw * .45, inkL(.42));
  });
  P.ink(outline, lw * .8, inkL(lw > .8 ? .95 : .55));
  P.ink(CURVE([[x, y], at(.25), at(.5), at(.75), [ex, ey]]), lw * 1.05, inkL());
}
function coconutPalm(P, x, baseY, topY, s = 1, o = {}) {
  const bend = (o.bend || 0) * s, tx = x + bend, trunkW = (o.trunk || 9) * s;
  const tr = c => {
    c.moveTo(x - trunkW, baseY); c.quadraticCurveTo(x - trunkW * .75 + bend * .25, (baseY + topY) / 2, tx - trunkW * .55, topY);
    c.lineTo(tx + trunkW * .55, topY); c.quadraticCurveTo(x + trunkW * .75 + bend * .25, (baseY + topY) / 2, x + trunkW, baseY); c.closePath();
  };
  const trunkC = o.trunkCol || lc('#9b7b58', '#a87a50', '#1c2139'), trunkS = o.trunkShade || lc('#7d6045', '#875f3c', '#141830');
  P.paint(trunkC, tr);
  P.within(tr, p => {
    p.fill(trunkS, c => { c.moveTo(x + trunkW * .25, baseY); c.quadraticCurveTo(x + trunkW * .5 + bend * .25, (baseY + topY) / 2, tx + trunkW * .2, topY); c.lineTo(tx + 60, topY); c.lineTo(x + 60, baseY); c.closePath(); });
    for (let y = baseY - 10 * s; y > topY + 8; y -= (o.ring || 11) * s) {
      const t = (baseY - y) / (baseY - topY), xc = x + bend * t * t;
      p.ink(LN([[xc - trunkW * 1.1, y + 2.5 * s], [xc + trunkW * 1.1, y - .5 * s]]), LW_FINE * .9, o.ringCol || lc('rgba(70,50,32,.8)', 'rgba(70,50,32,.8)', 'rgba(10,12,28,.9)'));
    }
  });
  P.ink(tr, o.lw || LW_IN, inkL());
  const col = o.leaf || lc('#6f9a4c', '#7e9142', '#1a2440'), shade = o.leafShade || lc('#4f7638', '#5c6a33', '#111930');
  const L = (o.len || 120) * s, leaf = (o.leafLen || 34) * s, lw = o.lw || LW_IN;
  const angs = o.fronds || [-2.95, -2.55, -2.15, -1.75, -1.35, -.95, -.55, -.18, .2, 2.75, .55];
  angs.forEach((a, i) => {
    const droop = .26 + (Math.abs(Math.cos(a)) * .22) + (Math.sin(a) > 0 ? .25 : 0);
    frond(P, tx, topY, a, L * (.86 + (i % 3) * .07), droop, leaf, col, shade, lw, 40 + i * 7);
  });
  if (o.nuts) for (const [dx, dy] of [[-9, 7], [6, 9], [-2, 14], [11, 3]]) P.shape(EL(tx + dx * s, topY + dy * s, 6 * s, 6.6 * s), lc('#8b9a3a', '#8b8a36', '#1a2036'), LW_FINE);
  P.shape(EL(tx, topY, 9 * s, 7 * s), trunkC, LW_FINE);
}
/* an Italian cypress: a tall dark flame */
function cypress(P, x, baseY, h, w, seed) {
  const pts = [], n = 16, rnd = mulberry32(seed);
  for (let i = 0; i <= n; i++) { const t = i / n, ww = w * Math.sin(Math.min(1, t * 1.15) * PI) * (1 - t * .25); pts.push([x + ww * .5 + (rnd() - .5) * 3, baseY - h * t]); }
  for (let i = n; i >= 0; i--) { const t = i / n, ww = w * Math.sin(Math.min(1, t * 1.15) * PI) * (1 - t * .25); pts.push([x - ww * .5 + (rnd() - .5) * 3, baseY - h * t]); }
  P.paint(lc('#4f6b3e', '#596334', '#11182c'), BLOB(pts, .4));
  P.within(BLOB(pts, .4), p => {
    p.fill(lc('#3f5732', '#48502a', '#0d1324'), R(x + w * .08, baseY - h, w, h));
    for (let k = 0; k < 7; k++) { const yy = baseY - h * (.15 + k * .11); p.ink(CURVE([[x - w * .3, yy], [x, yy - 6], [x + w * .3, yy - 2]]), LW_FINE * .8, lc('rgba(30,46,24,.6)', 'rgba(30,46,24,.6)', 'rgba(5,8,18,.6)')); }
  });
  P.ink(BLOB(pts, .4), LW_IN, inkL());
}
/* a stucco house with a red tile roof, seen from a little above */
function tileHouse(P, x, baseY, w, h, roofH, o = {}) {
  const wallC = o.wall || lc('#f1ebdc', '#f6d4b0', '#2d3150'), wallS = o.wallS || lc('#d9d0bd', '#e2b590', '#22263f');
  const roofC = o.roof || lc('#c8693f', '#d8743c', '#3b2a3e'), roofS = lc('#a9532f', '#b65a2d', '#2a1d2c');
  P.shape(R(x, baseY - h, w, h), wallC, LW_IN);
  P.fill(wallS, R(x + w * .72, baseY - h, w * .28, h));
  const nw = Math.max(1, Math.floor(w / 46));
  for (let i = 0; i < nw; i++) {
    const wx = x + (i + .5) * w / nw - 9, wy = baseY - h * .72;
    P.shape(R(wx, wy, 18, h * .38), LIGHT.night > .3 ? '#f6cf7a' : lc('#3c4a58', '#4a4250', '#f0c66e'), LW_FINE);
    P.ink(LN([[wx + 9, wy], [wx + 9, wy + h * .38]]), .6, inkL(.6));
  }
  if (o.door) P.shape(R(x + w * .12, baseY - h * .62, 22, h * .62), lc('#7a5a3e', '#8a5a36', '#1c1a2c'), LW_FINE);
  const ov = 8, rf = PL([[x - ov, baseY - h], [x + w + ov, baseY - h], [x + w - w * .16, baseY - h - roofH], [x + w * .16, baseY - h - roofH]]);
  P.shape(rf, roofC, LW_IN);
  P.within(rf, p => {
    p.fill(roofS, PL([[x + w * .55, baseY - h], [x + w + ov, baseY - h], [x + w - w * .16, baseY - h - roofH], [x + w * .45, baseY - h - roofH]]));
    for (let k = 1; k < 4; k++) { const yy = baseY - h - roofH * k / 4; p.ink(LN([[x - ov, yy], [x + w + ov, yy]]), .6, lc('#7f3a1e', '#7f3a1e', '#140c18')); }
  });
  P.alpha(.22, p => p.fill(lc('#3a2a1a', '#3a2a1a', '#000'), R(x, baseY - h, w, 6)));
}

/* ───────── San Jose: the valley and Mt Hamilton with the Lick domes ───────── */
function viewSanJose(P, H, sky) {
  const haze = (col, k) => css(mix(lcRGB(...col), lcRGB('#c9dde6', '#f2c8a0', '#28315c'), k));
  drawSky(P, H, sky, { horizon: .5, top: '#6eaedd', mid: '#9dcbea', low: '#d8ecf1', topGold: '#7f9dcb', midGold: '#c6b3c9', lowGold: '#f2c3b4' });
  if (sky.night < .75) { cloud(P, 180, H * .09, 280, 80, 11, LW_IN); cloud(P, 860, H * .05, 190, 52, 12, LW_FINE); }
  /* Mt Hamilton: a broad, dry massif; the summit sits in the upper panes */
  const y0 = H * .52;
  const range = [[-5, y0 - 70], [80, y0 - 96], [170, y0 - 86], [260, y0 - 130], [340, y0 - 150], [420, y0 - 196], [500, y0 - 240], [560, y0 - 288], [610, y0 - 318], [660, y0 - 322], [700, y0 - 306], [760, y0 - 262], [840, y0 - 236], [920, y0 - 250], [1005, y0 - 214], [1005, y0 + 60], [-5, y0 + 60]];
  P.fill(haze(['#d5b47e', '#e8a46f', '#252c52'], .22), PL(range));
  P.within(PL(range), p => {
    p.fill(haze(['#c09c6c', '#cc895c', '#1f264a'], .22), PL([[610, y0 - 318], [660, y0 - 322], [700, y0 - 306], [760, y0 - 262], [840, y0 - 236], [920, y0 - 250], [1005, y0 - 214], [1005, y0 + 60], [640, y0 + 60]]));
    // ravines: darker folds of oak and chaparral running down the flanks
    const rnd = mulberry32(17);
    for (const [fx, k] of [[180, .45], [300, .6], [420, .72], [510, .86], [590, .96], [720, .9], [830, .78], [950, .72]]) {
      const top = y0 - 300 * k + 50;
      p.alpha(.16, q => q.fill(haze(['#8a7a50', '#8a6440', '#141a36'], .2), BLOB([[fx - 40, y0 + 40], [fx - 10, top + 40], [fx + 14, top + 30], [fx + 48, y0 + 40]])));
      for (let j = 0; j < 9; j++) { const t = Math.pow(rnd(), .7), x = fx + (rnd() - .5) * 70 * (.4 + t) + t * 16, y = lerp(top + 10, y0 + 20, t); p.fill(haze(['#8c8a56', '#977a50', '#181e3e'], .22), EL(x, y, 5 + rnd() * 6, 3.5 + rnd() * 3.5)); }
    }
  });
  P.ink(LN(range.slice(0, -2)), LW_FAR, inkL(.9));
  /* Lick Observatory: the main building with two domes on the summit, the Shane dome on the shoulder */
  const domeC = lc('#f8f6ef', '#ffdfba', '#8e98bd'), domeS = lc('#d3d3ca', '#e9b38b', '#5a638c');
  const dome = (x, y, r) => {
    P.shape(R(x - r * 1.04, y - r * .34, r * 2.08, r * .7), domeS, LW_FAR);
    const top = c => { c.moveTo(x - r, y - r * .34); c.arc(x, y - r * .34, r, PI, 0); c.closePath(); };
    P.fill(domeC, top);
    P.within(top, p => p.fill(domeS, EL(x + r * .95, y - r * .55, r * .78, r * 1.25)));
    P.ink(top, LW_FAR, inkL());
    P.ink(LN([[x - r * .2, y - r * 1.32], [x - r * .2, y - r * .36]]), .6, inkL());
  };
  const sx = 646, sy = y0 - 322;
  P.shape(R(sx - 44, sy - 2, 88, 16), domeS, LW_FAR);
  P.fill(domeC, R(sx - 43, sy - 1, 60, 6));
  dome(sx - 40, sy, 18); dome(sx + 40, sy, 13);
  dome(560, y0 - 284, 22);
  /* the golden foothills, oaks dotted along their folds */
  const y1 = H * .64;
  const hills = [[-5, y1 - 96], [80, y1 - 120], [190, y1 - 100], [290, y1 - 132], [380, y1 - 110], [470, y1 - 140], [580, y1 - 116], [690, y1 - 136], [800, y1 - 112], [900, y1 - 130], [1005, y1 - 108], [1005, y1 + 40], [-5, y1 + 40]];
  P.fill(lc('#dcb46c', '#eaa15c', '#232a4c'), PL(hills));
  P.within(PL(hills), p => { const rnd = mulberry32(31); for (let i = 0; i < 8; i++) { const x = 40 + i * 130 + rnd() * 40; p.fill(lc('#c99d58', '#d48a50', '#1d2342'), BLOB([[x - 40, y1 + 30], [x - 4, y1 - 120 + rnd() * 20], [x + 46, y1 + 30]])); } });
  P.ink(LN(hills.slice(0, -2)), LW_FINE, inkL());
  const r2 = mulberry32(21);
  for (let i = 0; i < 26; i++) { const x = r2() * 1000, yy = y1 - 104 + r2() * 70, r = 8 + r2() * 8; crown(P, x, yy, r, 100 + i, lc('#6d7e44', '#787240', '#1b2140'), lc('#56653a', '#5e5832', '#141a32'), LW_FAR, 7); }
  /* the valley: a hazy band of low roofs, downtown's few towers on the left */
  const vy = H * .66;
  P.fill(lc('#c4cbaa', '#d9b78f', '#1d2344'), R(-5, y1 - 30, 1010, vy - y1 + 60));
  const towers = [[70, 92, 30], [106, 124, 34], [146, 104, 26], [178, 74, 28], [212, 58, 24]];
  for (const [x, h, w] of towers) {
    P.shape(R(x, vy - h, w, h), haze(['#e9e7de', '#f3d1ac', '#2f3762'], .2), LW_FAR);
    P.fill(haze(['#c5cac4', '#dcab86', '#262d54'], .2), R(x + w * .62, vy - h, w * .38, h));
    for (let wy = vy - h + 7; wy < vy - 4; wy += 8) P.ink(LN([[x + 4, wy], [x + w * .54, wy]]), .5, lc('rgba(60,60,60,.35)', 'rgba(60,60,60,.35)', 'rgba(255,220,150,0)'));
  }
  const rr = mulberry32(5);
  for (let x = 250; x < 1010;) {
    const w = 24 + rr() * 30, h = 10 + rr() * 8;
    P.shape(R(x, vy - h, w, h), lc(['#ebe4d4', '#d79267', '#f3eee3'][Math.floor(rr() * 3)], '#efc6a2', '#2a3157'), LW_FAR);
    if (rr() < .4) crown(P, x + w + 7, vy - 6, 9, 600 + (x | 0), lc('#7f9455', '#8a8448', '#1c223c'), lc('#667a44', '#6e683a', '#151a30'), LW_FAR, 6);
    x += w + 6 + rr() * 10;
  }
  /* the neighbourhood below the window: stucco houses, tile roofs, garden trees, cypresses, a palm */
  const gy = H * .74;
  P.fill(lc('#8fae6a', '#a4a35c', '#18213a'), R(-5, gy - 20, 1010, H - gy + 30));
  crown(P, 60, gy - 6, 62, 70, lc('#6c8a4c', '#7a8644', '#18203a'), lc('#56723c', '#626a36', '#121830'), LW_IN, 10);
  tileHouse(P, 90, gy + 54, 210, 74, 42, { door: true });
  crown(P, 340, gy + 6, 50, 71, lc('#78964f', '#869246', '#18203a'), lc('#5f7a40', '#6b6e38', '#121830'), LW_IN, 10);
  cypress(P, 420, gy + 90, 250, 46, 9); cypress(P, 466, gy + 90, 210, 40, 10);
  tileHouse(P, 520, gy + 70, 260, 84, 46, { wall: lc('#f4e6cf', '#f8d0a8', '#2f3252') });
  crown(P, 900, gy + 30, 110, 55, lc('#6c8a4c', '#7a8644', '#18203a'), lc('#56723c', '#626a36', '#121830'), LW, 12);
  coconutPalm(P, 790, H + 30, H * .3, 1.3, { bend: 22, trunk: 11, len: 128, leafLen: 34, leaf: lc('#7a9d4e', '#86924a', '#1a2440'), fronds: [-2.95, -2.6, -2.2, -1.8, -1.4, -1.0, -.6, -.2, .25, .6] });
  P.shape(R(-5, H * .93, 1010, H * .1), lc('#e9e1cf', '#f2cba5', '#2b2e4c'), LW_IN);
  P.fill(lc('#d2c8b2', '#ddb08a', '#22253f'), R(-5, H * .93, 1010, 8));
  /* after dark: valley lights, lit windows, a light on the summit */
  if (sky.night > .05) {
    const r3 = mulberry32(8), c = P.c;
    for (let i = 0; i < 240; i++) { const x = r3() * 1000, y = y1 - 20 + r3() * (vy - y1 + 14), a = sky.night * (.35 + r3() * .65); c.fillStyle = `rgba(255,${200 + (r3() * 40 | 0)},120,${a})`; c.fillRect(x, y, 2.6, 2.6); }
    for (const [x, h, w] of towers) for (let wy = vy - h + 6; wy < vy - 4; wy += 8) if (r3() < .6) { c.fillStyle = `rgba(255,224,150,${sky.night * .85})`; c.fillRect(x + 4, wy, w * .45, 2.6); }
    c.fillStyle = `rgba(255,236,190,${sky.night * .9})`; c.fillRect(sx - 34, sy + 4, 3, 3); c.fillRect(sx + 18, sy + 4, 3, 3);
  }
}

/* ───────── San Diego ─────────
   A eucalyptus as it looks on campus: a tall, pale, peeling trunk that forks into steep limbs,
   and big loose masses of narrow leaves hanging along the upper limbs, with sky between them. */
function eucalyptus(P, x, baseY, h, s = 1, seed = 1, lean = 0) {
  const rnd = mulberry32(seed);
  const bark = lc('#e4dccb', '#efd2b2', '#2a2f4e'), barkS = lc('#b9b09c', '#cfa684', '#1e2340'), peel = lc('#c9a88c', '#d99e7c', '#252a48');
  const leaf = lc('#86a08b', '#93a07c', '#1a2340'), leafLight = lc('#a3b9a4', '#b4b88c', '#243058'), leafS = lc('#617d6c', '#6f8060', '#121a30'), leafBack = lc('#6f8b78', '#7c8a66', '#141c34');
  const limbs = [];
  const grow = (x0, y0, ang, len, w0, depth) => {
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    limbs.push({ x0, y0, x1, y1, cx: (x0 + x1) / 2 + (rnd() - .5) * len * .18, cy: (y0 + y1) / 2, w0, w1: w0 * .66, depth });
    if (depth < 2) {
      const n = depth === 0 ? 3 : 2;
      for (let k = 0; k < n; k++) {
        const spread = (k - (n - 1) / 2) * (depth === 0 ? .42 : .5) + (rnd() - .5) * .16;
        grow(x1, y1, ang + spread, len * (.56 + rnd() * .16), w0 * (.6 - k * .04), depth + 1);
      }
    }
  };
  grow(x, baseY, -PI / 2 + lean / h, h * .42, 15 * s, 0);
  // the foliage masses, along the upper half of every limb that has left the trunk
  const masses = [];
  for (const l of limbs) {
    if (l.depth === 0) continue;
    const steps = l.depth === 1 ? 3 : 3;
    for (let k = 0; k < steps; k++) {
      const t = (l.depth === 1 ? .3 : .2) + .78 * (k + rnd() * .5) / steps, px0 = lerp(l.x0, l.x1, t), py0 = lerp(l.y0, l.y1, t);
      masses.push({ x: px0 + (rnd() - .5) * 46 * s, y: py0 + (rnd() - .3) * 18 * s, w: (58 + rnd() * 50) * s, hh: (34 + rnd() * 24) * s, back: rnd() < .45 });
    }
  }
  const mass = (m, col, shade, light) => {
    const top = [], k = 5;
    for (let i = 0; i <= k; i++) { const t = i / k; top.push([m.x - m.w / 2 + m.w * t, m.y - Math.sin(PI * t) * m.hh * (.42 + rnd() * .18)]); }
    const drips = [], d = Math.round(m.w / (6.5 * s)) + 4;
    for (let i = 0; i <= d; i++) {
      const t = 1 - i / d, edge = 1 - Math.pow(Math.abs(t - .5) * 2, 2) * .65, len = m.hh * (.55 + rnd() * .5) * edge;
      drips.push([m.x - m.w / 2 + m.w * t, m.y + len], [m.x - m.w / 2 + m.w * (t - .5 / d), m.y + len * (.45 + rnd() * .2)]);
    }
    const fn = c => {
      c.moveTo(top[0][0], top[0][1]);
      for (let i = 1; i < top.length; i++) { const a = top[i - 1], b = top[i]; c.quadraticCurveTo((a[0] + b[0]) / 2 + (rnd() - .5) * 6, Math.min(a[1], b[1]) - 5 * s, b[0], b[1]); }
      for (const [dx, dy] of drips) c.lineTo(dx, dy);
      c.closePath();
    };
    P.paint(col, fn);
    P.within(fn, p => {
      p.fill(shade, R(m.x - m.w, m.y + m.hh * .05, m.w * 2, m.hh * 2));
      if (light) p.fill(light, BLOB([[m.x - m.w * .38, m.y - m.hh * .32], [m.x - m.w * .05, m.y - m.hh * .5], [m.x + m.w * .2, m.y - m.hh * .28], [m.x - m.w * .1, m.y - m.hh * .12]]));
      for (let i = 0; i < 6; i++) { const lx = m.x - m.w * .4 + rnd() * m.w * .8, ly = m.y - m.hh * .2 + rnd() * m.hh * .5; p.ink(LN([[lx, ly], [lx + (rnd() - .5) * 3, ly + 8 * s]]), .5, inkL(.35)); }
    });
    P.ink(fn, LW_FINE * .9, inkL(.85));
  };
  for (const m of masses) if (m.back) mass(m, leafBack, leafS, null);
  for (const l of limbs) {
    const nx = -(l.y1 - l.y0), ny = l.x1 - l.x0, ln = Math.hypot(nx, ny) || 1, ux = nx / ln, uy = ny / ln;
    const fn = c => { c.moveTo(l.x0 - ux * l.w0, l.y0 - uy * l.w0); c.quadraticCurveTo(l.cx - ux * (l.w0 + l.w1) / 2, l.cy - uy * (l.w0 + l.w1) / 2, l.x1 - ux * l.w1, l.y1 - uy * l.w1); c.lineTo(l.x1 + ux * l.w1, l.y1 + uy * l.w1); c.quadraticCurveTo(l.cx + ux * (l.w0 + l.w1) / 2, l.cy + uy * (l.w0 + l.w1) / 2, l.x0 + ux * l.w0, l.y0 + uy * l.w0); c.closePath(); };
    P.paint(bark, fn);
    P.within(fn, p => {
      p.fill(barkS, c => { c.moveTo(l.x0 + ux * l.w0 * .15, l.y0 + uy * l.w0 * .15); c.lineTo(l.x1 + ux * l.w1 * .15, l.y1 + uy * l.w1 * .15); c.lineTo(l.x1 + ux * l.w1 * 2, l.y1 + uy * l.w1 * 2); c.lineTo(l.x0 + ux * l.w0 * 2, l.y0 + uy * l.w0 * 2); c.closePath(); });
      for (let k = 0; k < (l.depth ? 2 : 5); k++) { const t = .1 + rnd() * .8, px0 = lerp(l.x0, l.x1, t) + (rnd() - .5) * l.w0 * .8, py0 = lerp(l.y0, l.y1, t); p.fill(peel, BLOB([[px0 - 3 * s, py0 - 10 * s], [px0 + 4 * s, py0 - 5 * s], [px0 + 3 * s, py0 + 12 * s], [px0 - 4 * s, py0 + 7 * s]])); }
    });
    P.ink(fn, l.depth ? LW_FINE : LW_IN, inkL());
  }
  for (const m of masses) if (!m.back) mass(m, leaf, leafS, leafLight);
}

/* The Geisel Library: thick piers that branch into splayed struts, two recessed glass floors
   inside the legs, the widest floor resting on the struts, and three floors stepping back in,
   their slab edges zig-zagging where the plan steps. */
function geisel(P, gx, gy, s, H) {
  const conc = lc('#e3ddd0', '#f2cfa8', '#3a4068'), concS = lc('#bfb7a7', '#d9a983', '#2a3058'), concD = lc('#a39b8b', '#c4936c', '#22284c');
  const glass = lc('#47667c', '#6e6672', '#1a2242'), glassL = lc('#8fb3c9', '#c99a86', '#28335c'), glassD = lc('#2f4859', '#4f4554', '#121a34');
  const lwB = LW_FINE * 1.05;
  const X = v => gx + v * s, Y = v => gy - v * s;
  // ground and the shadow under the building
  P.alpha(.28, p => p.fill(lc('#2c2a20', '#3a2a1a', '#000'), EL(gx, gy + 2, 300 * s, 10 * s)));
  // glass floors: a band of glass with mullions, a bright slab edge above and below
  const floor = (cx, y0, w, h, zig, k = 0) => {
    const left = cx - w / 2, rnd = mulberry32(900 + k);
    P.shape(R(X(left), Y(y0 + h), w * s, h * s), glass, lwB);
    P.within(R(X(left), Y(y0 + h), w * s, h * s), p => {
      p.fill(glassD, R(X(left), Y(y0 + h * .35), w * s, h * .35 * s));
      for (let i = 0; i < 5; i++) { const a = left + w * (.08 + i * .21) + rnd() * 10; p.alpha(.55, q => q.fill(glassL, PL([[X(a), Y(y0 + h)], [X(a + 16), Y(y0 + h)], [X(a + 6), Y(y0)], [X(a - 10), Y(y0)]]))); }
      for (let m = left + 10; m < left + w; m += 12) p.ink(LN([[X(m), Y(y0 + h - 2)], [X(m), Y(y0 + 2)]]), .45, lc('rgba(20,30,40,.55)', 'rgba(20,30,40,.55)', 'rgba(255,220,150,.35)'));
    });
    // the slab edge above: straight at the ends, a shallow W where the corners step back
    const e = 7, top = y0 + h;
    const edge = zig ? [[left - 6, top], [cx - w * .3, top], [cx - w * .2, top - 5], [cx - w * .1, top + 2], [cx, top - 5], [cx + w * .1, top + 2], [cx + w * .2, top - 5], [cx + w * .3, top], [left + w + 6, top]] : [[left - 6, top], [left + w + 6, top]];
    const band = c => { c.moveTo(X(edge[0][0]), Y(edge[0][1])); for (const [ex, ey] of edge) c.lineTo(X(ex), Y(ey)); for (let i = edge.length - 1; i >= 0; i--) c.lineTo(X(edge[i][0]), Y(edge[i][1] + e)); c.closePath(); };
    P.shape(band, conc, lwB);
  };
  // the piers: thick columns rising from the ground, each branching into a splayed strut
  const branchY = 70, wideY = 196;
  const piers = [[-150, -330, 20], [-92, -250, 19], [-36, -160, 18], [36, 160, 18], [92, 250, 19], [150, 330, 20]];
  // recessed lower floors first, behind the struts
  P.shape(R(X(-118), Y(branchY + 6), 236 * s, 20 * s), concS, lwB);
  floor(0, branchY + 26, 250, 34, true, 1);
  floor(0, branchY + 72, 380, 34, true, 2);
  P.fill(concD, R(X(-192), Y(branchY + 112), 384 * s, 8 * s));
  // piers and struts
  for (const [bx, tx, w] of piers) {
    const outer = Math.sign(bx), sh = bx > 0 ? concS : conc;
    // trunk
    P.shape(R(X(bx - w / 2), Y(branchY + 10), w * s, (branchY + 10) * s), sh, lwB);
    // strut: from the top of the trunk out to the underside of the widest floor
    const strut = PL([[X(bx - w / 2), Y(branchY)], [X(bx + w / 2), Y(branchY)], [X(tx + outer * 10), Y(wideY - 4)], [X(tx - outer * 14), Y(wideY - 4)]]);
    P.shape(strut, sh, lwB);
    P.within(strut, p => p.fill(concD, PL([[X(bx + outer * w * .2), Y(branchY)], [X(bx + outer * w / 2), Y(branchY)], [X(tx + outer * 10), Y(wideY - 4)], [X(tx + outer * 2), Y(wideY - 4)]])));
    // the knee where the trunk turns into the strut
    P.ink(c => { c.moveTo(X(bx - outer * w / 2), Y(branchY - 14)); c.quadraticCurveTo(X(bx - outer * w / 2), Y(branchY + 2), X(bx - outer * w / 2 + outer * 8), Y(branchY + 10)); }, LW_FINE * .8, inkL(.7));
  }
  // the widest floor resting on the strut tips, its slab deep and serrated underneath
  const ww = 720;
  const under = c => { c.moveTo(X(-ww / 2 - 8), Y(wideY)); for (let i = 0; i <= 12; i++) { const t = i / 12, xx = -ww / 2 + ww * t; c.lineTo(X(xx), Y(wideY - (i % 2 ? 9 : 2))); } c.lineTo(X(ww / 2 + 8), Y(wideY)); c.lineTo(X(ww / 2 + 8), Y(wideY + 12)); c.lineTo(X(-ww / 2 - 8), Y(wideY + 12)); c.closePath(); };
  P.shape(under, concS, lwB);
  floor(0, wideY + 12, ww, 40, false, 3);
  floor(0, wideY + 52 + 7, 600, 36, true, 4);
  floor(0, wideY + 102, 470, 34, true, 5);
  floor(0, wideY + 143, 330, 30, true, 6);
  P.shape(R(X(-150), Y(wideY + 188), 300 * s, 9 * s), conc, lwB);
  void H;
}

function viewSanDiego(P, H, sky) {
  drawSky(P, H, sky, { horizon: .62, top: '#5fa6dc', mid: '#94c8ea', low: '#d6ecf2' });
  cloud(P, 210, H * .1, 160, 42, 21, LW_FINE);
  cloud(P, 840, H * .17, 110, 30, 22, LW_FINE);
  // the Pacific, a bright strip far off to the left, and the low mesa
  P.fill(lc('#7fb2cf', '#e7b98d', '#24305a'), R(-5, H * .6, 330, 20));
  P.ink(LN([[-5, H * .6], [325, H * .6]]), LW_FAR, inkL());
  for (let i = 0; i < 6; i++) P.ink(LN([[20 + i * 52, H * .61 + (i % 2) * 6], [44 + i * 52, H * .61 + (i % 2) * 6]]), 1, 'rgba(255,255,255,.8)');
  P.fill(lc('#a9b98c', '#c9a87a', '#1e2444'), PL([[-5, H * .62], [180, H * .6], [330, H * .61], [520, H * .58], [760, H * .6], [1005, H * .58], [1005, H], [-5, H]]));
  // far eucalyptus groves along the mesa, small and soft
  const rf = mulberry32(44);
  for (let i = 0; i < 14; i++) { const x = rf() * 1000, r = 14 + rf() * 16; crown(P, x, H * .6 - r * .3, r, 200 + i, lc('#93ab95', '#9aa47e', '#1a2240'), lc('#7a9483', '#828c68', '#141c34'), LW_FAR, 8); }
  geisel(P, 500, H * .87, .9, H);
  // lawn, a path, low shrubs
  P.fill(lc('#8fbf63', '#a7b65a', '#18233c'), PL([[-5, H * .87], [1005, H * .855], [1005, H + 5], [-5, H + 5]]));
  P.ink(LN([[-5, H * .87], [1005, H * .855]]), LW_FINE, inkL());
  P.shape(PL([[440, H + 5], [478, H * .865], [522, H * .865], [580, H + 5]]), lc('#ece4cf', '#f3cfa6', '#2c3050'), LW_FINE);
  // eucalyptus framing the library, one on either side, close to the window
  eucalyptus(P, 70, H * 1.02, H * .86, 1.15, 3, 60);
  eucalyptus(P, 948, H * 1.04, H * .9, 1.25, 7, -70);
  for (const [x, r] of [[220, 30], [760, 34]]) crown(P, x, H * .93, r, 300 + x, lc('#6f9a50', '#7f9246', '#18203a'), lc('#57803e', '#667538', '#121830'), LW_FINE, 9);
}

/* ───────── Bengaluru: rooftops, water tanks, a gulmohar, monsoon clouds ───────── */
function roofBlock(P, x, baseY, w, h, wall, wallS, o = {}) {
  const lw = o.lw || LW_IN;
  P.shape(R(x, baseY - h, w, h + 10), wall, lw);
  P.fill(wallS, R(x + w * .74, baseY - h, w * .26, h + 10));
  P.shape(R(x - 3, baseY - h - 8, w + 6, 9), lc('#efe9da', '#f6d2a8', '#30344f'), LW_FINE);
  const cols = Math.max(1, Math.floor(w / 38)), rows = Math.max(1, Math.floor(h / 46));
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const wx = x + (k + .5) * w / cols - 8, wy = baseY - h + 14 + r * 46;
    P.shape(R(wx, wy, 16, 22), lc('#3e4d5c', '#4c4858', '#f1c66c'), LW_FINE);
    P.fill(wallS, R(wx - 3, wy - 4, 22, 4));
    if (o.grille) for (let g = 1; g < 3; g++) P.ink(LN([[wx + g * 5.3, wy], [wx + g * 5.3, wy + 22]]), .5, inkL(.6));
  }
  if (o.tank != null) {
    const tx = x + w * o.tank, ty = baseY - h - 8;
    P.shape(R(tx - 3, ty - 6, 30, 6), lc('#8a8a86', '#9a8a7a', '#1d2034'), LW_FINE);
    P.shape(c => { c.moveTo(tx, ty - 6); c.lineTo(tx, ty - 34); c.quadraticCurveTo(tx + 12, ty - 42, tx + 24, ty - 34); c.lineTo(tx + 24, ty - 6); c.closePath(); }, lc('#2f3337', '#3a3436', '#0f1222'), LW_FINE);
    for (let k = 0; k < 3; k++) P.ink(LN([[tx, ty - 14 - k * 7], [tx + 24, ty - 14 - k * 7]]), .7, 'rgba(255,255,255,.25)');
  }
  if (o.clothes) { // a line of washing on the roof
    const cy = baseY - h - 30;
    P.ink(LN([[x + 8, cy], [x + w - 10, cy - 4]]), .6, inkL(.8));
    const cols2 = ['#d2453a', '#2f6fb0', '#f2c94c', '#f1efe6'];
    for (let k = 0; k < 4; k++) { const cx0 = x + 18 + k * (w - 36) / 4; P.shape(R(cx0, cy - k * .9 + 1, 12, 16), cols2[k], .5); }
  }
}
function gopuram(P, x, baseY, w, h) {
  // a small temple tower far off: stepped tiers narrowing to a crown with a kalasha
  const tiers = 6, c1 = lc('#d8cdb5', '#e8c49c', '#2c3152'), c2 = lc('#c3b79c', '#d6ad84', '#232846');
  for (let i = 0; i < tiers; i++) {
    const t0 = i / tiers, t1 = (i + 1) / tiers, w0 = w * (1 - t0 * .55), w1 = w * (1 - t1 * .55), y0 = baseY - h * .8 * t0, y1 = baseY - h * .8 * t1;
    P.shape(PL([[x - w0 / 2, y0], [x + w0 / 2, y0], [x + w1 / 2, y1], [x - w1 / 2, y1]]), i % 2 ? c2 : c1, LW_FAR);
  }
  const wt = w * .45, yt = baseY - h * .8;
  P.shape(c => { c.moveTo(x - wt / 2, yt); c.quadraticCurveTo(x - wt / 2, yt - h * .16, x, yt - h * .17); c.quadraticCurveTo(x + wt / 2, yt - h * .16, x + wt / 2, yt); c.closePath(); }, c1, LW_FAR);
  P.shape(EL(x, yt - h * .2, 2.2, 3.4), lc('#d8a83a', '#e8a83a', '#3a3040'), .5);
}
function crane(P, x, baseY, h, jib) {
  const col = lc('#e3b33c', '#eaa23a', '#3a3446');
  P.ink(LN([[x - 4, baseY], [x - 4, baseY - h]]), 2.4, col); P.ink(LN([[x + 4, baseY], [x + 4, baseY - h]]), 2.4, col);
  for (let y = baseY; y > baseY - h; y -= 10) P.ink(LN([[x - 4, y], [x + 4, y - 10]]), .6, col);
  P.ink(LN([[x - jib * .3, baseY - h], [x + jib, baseY - h]]), 2.2, col);
  P.ink(LN([[x, baseY - h - 16], [x + jib * .8, baseY - h], [x, baseY - h - 16], [x - jib * .3, baseY - h]]), .6, col);
  P.ink(LN([[x + jib * .6, baseY - h], [x + jib * .6, baseY - h + 30]]), .5, inkL(.7));
}
function bigCloud(P, cx, cy, w, h, seed) {
  if (CLOUDS.capture) { CLOUDS.list.push({ kind: 'big', cx, cy, w, h, seed }); return; }
  const f = SCALLOP(bumpRing(cx, cy, w / 2, h / 2, 14, seed, .22, true), .45);
  P.paint('#fffaf0', f);
  P.within(f, p => {
    p.fill('#b3bccd', BLOB([[cx - w * .7, cy + h * .22], [cx - w * .35, cy + h * .1], [cx, cy + h * .2], [cx + w * .35, cy + h * .08], [cx + w * .7, cy + h * .18], [cx + w * .7, cy + h], [cx - w * .7, cy + h]]));
    p.fill('#98a3b9', R(cx - w, cy + h * .4, w * 2, h));
    p.fill('#ffe2b8', BLOB([[cx - w * .55, cy - h * .2], [cx - w * .3, cy - h * .5], [cx - w * .05, cy - h * .55], [cx - w * .2, cy - h * .25]]));
  });
  P.ink(f, LW_IN, inkL());
}
function viewBengaluru(P, H, sky) {
  drawSky(P, H, sky, { horizon: .56, top: '#4f78ad', mid: '#93b6d8', low: '#f3c78e', topGold: '#4a72a8', midGold: '#98b6d2', lowGold: '#f4c487' });
  bigCloud(P, 300, H * .2, 460, 230, 41);
  bigCloud(P, 790, H * .14, 360, 170, 42);
  /* the far city, in three hazy layers: towers and cranes, a gopuram, then dense mid-rise */
  const hz = H * .58;
  const far = (k, col) => css(mix(lcRGB(col, col, '#2a3050'), lcRGB('#c9d3dc', '#e9cfb0', '#323a60'), k));
  const rft = mulberry32(73);
  for (let x = -5; x < 1005;) { const w = 26 + rft() * 40, h = 30 + rft() * 70 + (rft() < .15 ? 70 : 0); P.shape(R(x, hz - h, w, h + 10), far(.62, ['#d5dbe0', '#cdd3d9', '#dde1e4'][Math.floor(rft() * 3)]), LW_FAR * .8); x += w + 4 + rft() * 10; }
  crane(P, 160, hz - 40, 120, 90);
  crane(P, 690, hz - 30, 96, 70);
  gopuram(P, 540, hz + 4, 46, 96);
  const rmid = mulberry32(74);
  for (let x = -10; x < 1010;) {
    const w = 30 + rmid() * 34, h = 22 + rmid() * 30;
    P.shape(R(x, hz + 22 - h, w, h + 20), far(.3, ['#e9cfc7', '#f1e2b0', '#d7e3d2', '#f0d2b4', '#e6e2d6'][Math.floor(rmid() * 5)]), LW_FAR);
    if (rmid() < .45) P.fill(far(.3, '#2f3337'), R(x + w * (.2 + rmid() * .5), hz + 22 - h - 10, 9, 10));
    x += w + 2;
  }
  P.fill(lc('#7fa25a', '#86964f', '#18233c'), R(-5, hz + 26, 1010, H * .5));
  for (let i = 0; i < 16; i++) crown(P, i * 66 + 10, hz + 34 + (i % 3) * 8, 24 + (i * 7 % 12), 700 + i, lc('#6c9450', '#76874a', '#18203a'), lc('#557a3e', '#5f6a38', '#121830'), LW_FAR, 8);
  // coconut palms rising out of the far trees
  for (const [x, top, s, b] of [[90, hz - 40, .55, 10], [420, hz - 20, .5, -8], [905, hz - 46, .58, -12]]) coconutPalm(P, x, hz + 60, top, s, { bend: b, trunk: 7, len: 110, leafLen: 30, lw: LW_FAR, dense: .7 });
  /* the near rooftops: flat roofs, painted walls, black tanks, washing */
  const blocks = [
    [-10, H * .9, 190, 210, '#e8c7c0', '#d2aba3', { tank: .55, grille: true }],
    [170, H * .95, 160, 170, '#f0dca2', '#dcc386', { tank: .2, clothes: true }],
    [320, H * .92, 200, 250, '#cfe0cf', '#b4c9b4', { tank: .64, grille: true }],
    [510, H * .96, 150, 150, '#f2ede0', '#dad3c2', {}],
    [650, H * .93, 180, 230, '#f2c9a2', '#ddb08a', { tank: .3, grille: true }],
  ];
  for (const [x, by, w, h, a, b, o] of blocks) roofBlock(P, x, by, w, h, lc(a, a, '#2c3150'), lc(b, b, '#22263f'), o);
  for (const [x, y, r] of [[120, H * .97, 70], [470, H * 1.0, 64], [700, H * .99, 58]]) crown(P, x, y, r, 900 + x, lc('#5f8a46', '#6b7f40', '#18203a'), lc('#4a7238', '#556634', '#121830'), LW_IN, 11);
  coconutPalm(P, 590, H + 30, H * .5, 1.05, { bend: -20, trunk: 9, len: 124, leafLen: 34, nuts: true });
  P.ink(CURVE([[-5, H * .52], [300, H * .58], [600, H * .55], [1005, H * .6]]), .9, inkL());
  P.ink(CURVE([[-5, H * .55], [320, H * .61], [640, H * .58], [1005, H * .63]]), .9, inkL());
  // the gulmohar: a wide umbrella canopy, red-orange flowers over feathery leaves
  const gx = 800, gy = H * .48;
  const trunk = (pts, w) => { P.ink(LN(pts), w + 3.6, INK); P.ink(LN(pts), w, lc('#7a5b42', '#86603e', '#1a1d33')); };
  trunk([[gx - 10, H + 5], [gx - 6, gy + 60], [gx - 80, gy + 10]], 5.4);
  trunk([[gx - 6, gy + 60], [gx + 60, gy + 8]], 3.6);
  trunk([[gx - 40, gy + 34], [gx - 150, gy + 4]], 2.6);
  const can = SCALLOP(bumpRing(gx - 10, gy - 10, 250, 96, 18, 51, .16), .35);
  P.paint(lc('#6e8f4a', '#7a8644', '#1a2240'), can);
  P.within(can, p => {
    p.fill(lc('#56763a', '#636c36', '#121a32'), R(gx - 260, gy + 20, 520, 120));
    const rnd = mulberry32(52);
    for (let i = 0; i < 70; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()), x = gx - 10 + Math.cos(a) * 240 * r, y = gy - 10 + Math.sin(a) * 90 * r; p.ink(CURVE([[x - 10, y], [x, y - 3], [x + 10, y]]), .6, lc('rgba(60,90,40,.6)', 'rgba(60,90,40,.6)', 'rgba(8,12,24,.6)')); }
    for (let i = 0; i < 170; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()), x = gx - 10 + Math.cos(a) * 250 * r, y = gy - 10 + Math.sin(a) * 96 * r - 8;
      p.fill(i % 5 ? lc('#e2552f', '#ee5a2a', '#3a2232') : lc('#f19a3a', '#f8a03a', '#3c2a30'), EL(x, y, 7 + rnd() * 6, 5 + rnd() * 4, rnd()));
    }
  });
  P.ink(can, LW_IN, inkL());
}

/* ───────── Surathkal: palms, the Arabian Sea and the lighthouse, after dark ───────── */
function viewSurathkal(P, H, sky) {
  drawSky(P, H, sky, { horizon: .62, top: '#1b2a55', mid: '#33437a', low: '#6a6f9c' });
  const hz = H * .6;
  P.fill('#2c4c7a', R(-5, hz, 1010, H * .25));
  P.ink(LN([[-5, hz], [1005, hz]]), LW_FINE, 'rgba(10,14,30,.9)');
  const mx = sky.moonX || 760;
  for (let i = 0; i < 18; i++) { const y = hz + 6 + i * 9, w = 10 + i * 3; P.fill(`rgba(255,240,200,${.55 - i * .025})`, R(mx - w / 2 + Math.sin(i * 2.3) * 8, y, w, 2)); }
  for (let i = 0; i < 9; i++) P.ink(LN([[i * 120 - 30, hz + 40 + (i % 3) * 16], [i * 120 + 30, hz + 40 + (i % 3) * 16]]), .8, 'rgba(200,220,255,.35)');
  // the headland and the lighthouse
  const hx = 250, LS = 1.25;
  P.shape(PL([[60, hz + 6], [150, hz - 34], [240, hz - 46], [330, hz - 40], [420, hz + 8]]), '#1a2440', LW_IN);
  P.at(hx, hz - 44, 0, LS, p => {
    p.shape(PL([[-16, 0], [16, 0], [11, -126], [-11, -126]]), '#e9e4d6', LW_IN);
    for (let k = 0; k < 3; k++) p.fill('#b5452f', PL([[-15 + k * 1.2, -26 - k * 36], [15 - k * 1.2, -26 - k * 36], [14.4 - k * 1.2, -44 - k * 36], [-14.4 + k * 1.2, -44 - k * 36]]));
    p.fill('rgba(30,36,70,.35)', PL([[4, 0], [16, 0], [11, -126], [3, -126]]));
    p.ink(PL([[-16, 0], [16, 0], [11, -126], [-11, -126]]), LW_IN);
    p.shape(R(-15, -142, 30, 16), '#ffe9a8', LW_IN);
    p.shape(c => { c.moveTo(-17, -142); c.lineTo(0, -160); c.lineTo(17, -142); c.closePath(); }, '#2a2f3e', LW_IN);
    p.shape(R(-22, -128, 44, 5), '#2a2f3e', LW_FINE);
  });
  P.fill('#3a3b52', PL([[-5, H * .84], [1005, H * .8], [1005, H + 5], [-5, H + 5]]));
  P.ink(CURVE([[-5, H * .84], [300, H * .825], [700, H * .81], [1005, H * .8]]), 1.6, 'rgba(240,244,255,.75)');
  const palm = (x, top, bend, s) => coconutPalm(P, x, H + 20, top, s, { bend, trunk: 9, len: 124, leafLen: 34, trunkCol: '#151b30', trunkShade: '#0f1426', ringCol: 'rgba(5,7,16,.9)', leaf: '#18223c', leafShade: '#0f1629' });
  palm(640, H * .34, 40, 1.15);
  palm(830, H * .22, -30, 1.3);
  palm(80, H * .4, 30, 1.0);
}

export const VIEWS = { now: viewSanJose, sd: viewSanDiego, blr: viewBengaluru, nitk: viewSurathkal };

/* ───────── live things outside the window (view units, drawn every frame) ───────── */
export const VIEW_LIVE = {
  nitk(c, H, t) {
    // the lighthouse beam: a pale wedge sweeping round, brightest as it faces us
    const hx = 250, hy = H * .6 - 44 - 134 * 1.25, a = ((t * .35) % 1) * TAU, face = Math.cos(a);
    const dir = Math.sin(a) > 0 ? 1 : -1, len = 900 * Math.abs(Math.sin(a)) + 80, spread = .06 + (1 - Math.abs(Math.sin(a))) * .4;
    c.save(); c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(hx, hy, hx + dir * len, hy);
    g.addColorStop(0, `rgba(255,240,190,${.55 + face * .25})`); g.addColorStop(1, 'rgba(255,240,190,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + dir * len, hy - len * spread); c.lineTo(hx + dir * len, hy + len * spread * .6); c.closePath(); c.fill();
    c.globalAlpha = .6 + Math.max(0, face) * .4; c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(hx, hy, 9 + Math.max(0, face) * 8, 0, TAU); c.fill();
    c.restore();
  },
  blr(c, H, t) {
    // two paper kites tugging on their strings
    for (const [x0, y0, col, ph] of [[300, H * .3, '#e2553a', 0], [560, H * .22, '#2f55b8', 1.7]]) {
      const x = x0 + Math.sin(t * .7 + ph) * 14, y = y0 + Math.sin(t * 1.1 + ph) * 8, r = Math.sin(t * .9 + ph) * .18;
      c.save(); c.translate(x, y); c.rotate(r);
      c.beginPath(); c.moveTo(0, -18); c.lineTo(13, 0); c.lineTo(0, 22); c.lineTo(-13, 0); c.closePath();
      c.fillStyle = col; c.fill(); c.lineWidth = LW_IN; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.moveTo(0, -18); c.lineTo(0, 22); c.moveTo(-13, 0); c.lineTo(13, 0); c.lineWidth = .7; c.stroke();
      c.beginPath(); c.moveTo(0, 22); for (let k = 1; k <= 6; k++) c.lineTo(Math.sin(t * 3 + k + ph) * 6, 22 + k * 7); c.lineWidth = 1; c.stroke();
      c.restore();
      c.beginPath(); c.moveTo(x, y + 4); c.quadraticCurveTo(x + 60, y + 160, x + 140 + ph * 30, H * .62); c.lineWidth = .6; c.strokeStyle = 'rgba(40,34,30,.55)'; c.stroke();
    }
  },
  now(c, H, t, sky) {
    // a hawk circling high over the valley on clear days
    if (!sky || sky.night > .4) return;
    const a = t * .22, x = 330 + Math.cos(a) * 70, y = H * .2 + Math.sin(a) * 18, w = 9 + Math.sin(t * 2.1) * 1.5;
    c.save(); c.strokeStyle = 'rgba(40,34,30,.75)'; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - w, y - 2); c.quadraticCurveTo(x - w * .4, y - 5, x, y); c.quadraticCurveTo(x + w * .4, y - 5, x + w, y - 2); c.stroke();
    c.restore();
  },
};
