'use strict';
/* Four frames — what the window looks out on. Each view is drawn in view units (1000 wide,
   H tall to match the opening) for a given light, baked once, and panned like a train window
   when the place changes. Small live things (clouds, a beam, kites, lights) are drawn on top. */

/* light-dependent colour: mix a day, golden-hour and night value by the current light */
let LIGHT = { day: 1, golden: 0, night: 0, twilight: 0 };
function lc(day, gold, night) {
  const g = clamp(LIGHT.golden + LIGHT.twilight * .6), n = clamp(LIGHT.night);
  const a = mix(day, gold || day, g);
  return css(mix(a, night || day, n));
}
function lcRGB(day, gold, night) { const g = clamp(LIGHT.golden + LIGHT.twilight * .6), n = clamp(LIGHT.night); return mix(mix(day, gold || day, g), night || day, n); }

/* ───────── shared pieces ───────── */
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
    if (r > 2.2) { // a few clear-line stars as little crosses
      c.save(); c.translate(x, y); c.beginPath();
      for (let k = 0; k < 4; k++) { c.rotate(PI / 2); c.moveTo(0, 0); c.quadraticCurveTo(1, -1, 0, -r * 2.6); c.quadraticCurveTo(-1, -1, 0, 0); }
      c.fill(); c.restore();
    } else { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  }
}
function drawMoon(P, sky) {
  const x = sky.moonX, y = sky.moonY, r = 26, ph = sky.moon.phase;
  P.alpha(.25 * LIGHT.night, p => p.fill(p.rgrad(x, y, r, r * 3.4, [[0, 'rgba(255,246,214,.6)'], [1, 'rgba(255,246,214,0)']]), EL(x, y, r * 3.4, r * 3.4)));
  // lit part: full disc minus a shifted disc for the shadow side
  const k = Math.cos(ph * TAU); // 1 new, -1 full
  P.within(EL(x, y, r, r), p => {
    p.fill('#f7efcf', EL(x, y, r, r));
    p.alpha(.9, q => q.fill(css(lcRGB('#9fbfd6', '#8a94b4', '#1d2748')), c => { c.ellipse(x + (ph < .5 ? -1 : 1) * r * (1 - Math.abs(k)) * 2 * (k > 0 ? .5 : .5), y, r * Math.max(.05, Math.abs(k)), r, 0, 0, TAU); }));
  });
  P.ink(EL(x, y, r, r), LW_IN, 'rgba(40,34,30,.65)');
}
function drawSun(P, sky) {
  const x = sky.sunX, y = sky.sunY, r = 30;
  P.alpha(.45, p => p.fill(p.rgrad(x, y, r * .8, r * 4, [[0, 'rgba(255,236,170,.75)'], [1, 'rgba(255,236,170,0)']]), EL(x, y, r * 4, r * 4)));
  P.shape(EL(x, y, r, r), lc('#fff6d6', '#ffd98a', '#fff6d6'), LW_IN);
}
// clear-line cumulus: scalloped top, flatter base, shaded underside
function cloud(P, cx, cy, w, h, seed, lw = LW_IN) {
  const pts = bumpRing(cx, cy, w / 2, h / 2, 11, seed, .18, true);
  const shapeFn = SCALLOP(pts, .42);
  P.fill(lc(PAL.cloud, '#ffe7c8', '#4a5480'), shapeFn);
  P.within(shapeFn, p => p.fill(lc(PAL.cloudShade, '#efc7a4', '#363f69'), BLOB([[cx - w * .6, cy + h * .26], [cx - w * .1, cy + h * .18], [cx + w * .3, cy + h * .24], [cx + w * .6, cy + h * .2], [cx + w * .6, cy + h], [cx - w * .6, cy + h]])));
  P.ink(shapeFn, lw, lc(INK, INK, 'rgba(22,24,44,.9)'));
}
// a round tree crown with a shaded side, ligne claire
function crown(P, cx, cy, r, seed, col, shade, lw = LW_IN, n = 9) {
  const pts = bumpRing(cx, cy, r, r * .86, n, seed, .2);
  const f = SCALLOP(pts, .38);
  P.fill(col, f);
  P.within(f, p => p.fill(shade, BLOB([[cx + r * .1, cy - r], [cx + r * 1.2, cy - r * .2], [cx + r * 1.1, cy + r], [cx - r * .6, cy + r * 1.1], [cx - r * .2, cy + r * .2]])));
  P.ink(f, lw);
}
/* a feather-palm frond: an arching rachis with serrated leaflet edges, filled, clear line */
function frond(P, x, y, ang, len, droop, wmax, col, shade, lw = LW_IN, seed = 1) {
  const pts = [], n = 22, rnd = mulberry32(seed);
  const cx = x + Math.cos(ang) * len * .55, cy = y + Math.sin(ang) * len * .55 - len * .18;
  const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len + droop * len;
  const at = t => { const u = 1 - t; return [u * u * x + 2 * u * t * cx + t * t * ex, u * u * y + 2 * u * t * cy + t * t * ey]; };
  const tan = t => { const u = 1 - t; const dx = 2 * u * (cx - x) + 2 * t * (ex - cx), dy = 2 * u * (cy - y) + 2 * t * (ey - cy), l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const L = [], Rr = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, [px0, py0] = at(t), [tx, ty] = tan(t), nx = -ty, ny = tx;
    const w = wmax * Math.pow(Math.sin(PI * Math.min(1, t * 1.08)), .55) * (1 - t * .35) * (.85 + rnd() * .3);
    const fwd = w * .55, inner = w * .3;
    // leaflets droop: the lower side hangs further than the upper
    const hang = .25;
    L.push([px0 + nx * w + tx * fwd, py0 + ny * w + ty * fwd + w * hang], [px0 + nx * inner, py0 + ny * inner]);
    Rr.push([px0 - nx * w * 1.05 + tx * fwd, py0 - ny * w * 1.05 + ty * fwd + w * (hang + .35)], [px0 - nx * inner, py0 - ny * inner]);
  }
  const poly = [[x, y], ...L, [ex, ey], ...Rr.reverse()];
  P.shape(PL(poly), col, lw);
  P.within(PL(poly), p => p.fill(shade, c => { c.moveTo(x, y); for (let i = 1; i <= n; i++) { const [a0, b0] = at(i / n); c.lineTo(a0, b0 + 1); } for (let i = Rr.length - 1; i >= 0; i -= 2) c.lineTo(Rr[i][0], Rr[i][1]); c.closePath(); }));
  P.ink(CURVE([[x, y], at(.25), at(.5), at(.75), [ex, ey]]), lw * .8, INK);
}
/* a feather palm: trunk (curved or straight), a crown of fronds */
function featherPalm(P, x, baseY, topY, s = 1, o = {}) {
  const bend = (o.bend || 0) * s, tx = x + bend, trunkW = (o.trunk || 9) * s;
  const tr = c => {
    c.moveTo(x - trunkW, baseY); c.quadraticCurveTo(x - trunkW * .7 + bend * .2, (baseY + topY) / 2, tx - trunkW * .55, topY);
    c.lineTo(tx + trunkW * .55, topY); c.quadraticCurveTo(x + trunkW * .7 + bend * .2, (baseY + topY) / 2, x + trunkW, baseY); c.closePath();
  };
  P.shape(tr, o.trunkCol || lc('#9b7b58', '#a87a50', '#1c2139'), LW_IN);
  P.within(tr, p => {
    p.fill(o.trunkShade || lc('#7d6045', '#875f3c', '#141830'), c => { c.moveTo(x + trunkW * .2, baseY); c.quadraticCurveTo(x + trunkW * .5 + bend * .2, (baseY + topY) / 2, tx + trunkW * .2, topY); c.lineTo(tx + 40, topY); c.lineTo(x + 40, baseY); c.closePath(); });
    for (let y = baseY - 14 * s, k = 0; y > topY + 10; y -= (o.ring || 14) * s, k++) {
      const t = (baseY - y) / (baseY - topY), xc = x + bend * t * t;
      p.ink(LN([[xc - trunkW, y + 3 * s], [xc + trunkW, y - 1 * s]]), LW_FINE, o.ringCol || lc('#5d4630', '#5d4630', '#0e1124'));
    }
  });
  const col = o.leaf || lc('#6f9a4c', '#7e9142', '#1a2440'), shade = o.leafShade || lc('#557a3a', '#647236', '#121a32');
  const back = o.leafBack || lc('#5a7f41', '#6a7739', '#141c34');
  const L = (o.len || 120) * s;
  const angs = o.fronds || [-2.9, -2.4, -1.95, -1.4, -.95, -.45, .05, 2.75, .5];
  // back fronds first, darker
  angs.forEach((a, i) => { if (i % 2) frond(P, tx, topY, a, L * .92, .3, 13 * s, back, shade, LW_IN, 40 + i); });
  angs.forEach((a, i) => { if (!(i % 2)) frond(P, tx, topY, a, L, .38, 15 * s, col, shade, LW_IN, 80 + i); });
  if (o.nuts) { for (const [dx, dy] of [[-8, 8], [6, 10], [-1, 14]]) P.shape(EL(tx + dx * s, topY + dy * s, 6 * s, 6.5 * s), lc('#8b9a3a', '#8b8a36', '#1a2036'), LW_FINE); }
  P.shape(EL(tx, topY, 9 * s, 7 * s), o.trunkCol || lc('#8b6f4f', '#8b6c46', '#1a1d33'), LW_IN);
}
// an Italian cypress: a tall dark flame
function cypress(P, x, baseY, h, w, seed) {
  const pts = []; const n = 16, rnd = mulberry32(seed);
  for (let i = 0; i <= n; i++) { const t = i / n, yy = baseY - h * t, ww = w * Math.sin(Math.min(1, t * 1.15) * PI) * (1 - t * .25); pts.push([x + ww * .5 + (rnd() - .5) * 3, yy]); }
  for (let i = n; i >= 0; i--) { const t = i / n, yy = baseY - h * t, ww = w * Math.sin(Math.min(1, t * 1.15) * PI) * (1 - t * .25); pts.push([x - ww * .5 + (rnd() - .5) * 3, yy]); }
  P.shape(BLOB(pts, .4), lc('#4f6b3e', '#596334', '#11182c'), LW_IN);
  P.within(BLOB(pts, .4), p => p.fill(lc('#3f5732', '#48502a', '#0d1324'), R(x + w * .08, baseY - h, w, h)));
}
/* a stucco house with a red tile roof, seen from a little above */
function tileHouse(P, x, baseY, w, h, roofH, o = {}) {
  const wallC = o.wall || lc('#f1ebdc', '#f6d4b0', '#2d3150'), wallS = o.wallS || lc('#d9d0bd', '#e2b590', '#22263f');
  const roofC = o.roof || lc('#c8693f', '#d8743c', '#3b2a3e'), roofS = lc('#a9532f', '#b65a2d', '#2a1d2c');
  P.shape(R(x, baseY - h, w, h), wallC, LW_IN);
  P.fill(wallS, R(x + w * .72, baseY - h, w * .28, h));
  // windows
  const nw = Math.max(1, Math.floor(w / 46));
  for (let i = 0; i < nw; i++) {
    const wx = x + (i + .5) * w / nw - 9, wy = baseY - h * .72;
    const lit = LIGHT.night > .3;
    P.shape(R(wx, wy, 18, h * .38), lit ? '#f6cf7a' : lc('#3c4a58', '#4a4250', '#f0c66e'), LW_FINE);
  }
  // hip roof
  const ov = 8, rf = PL([[x - ov, baseY - h], [x + w + ov, baseY - h], [x + w - w * .16, baseY - h - roofH], [x + w * .16, baseY - h - roofH]]);
  P.shape(rf, roofC, LW_IN);
  P.within(rf, p => {
    p.fill(roofS, PL([[x + w * .55, baseY - h], [x + w + ov, baseY - h], [x + w - w * .16, baseY - h - roofH], [x + w * .45, baseY - h - roofH]]));
    for (let k = 1; k < 4; k++) { const yy = baseY - h - roofH * k / 4; p.ink(LN([[x - ov, yy], [x + w + ov, yy]]), .6, lc('#7f3a1e', '#7f3a1e', '#140c18')); }
  });
}

/* ───────── San Jose: the valley and Mt Hamilton with the Lick domes ───────── */
function viewSanJose(P, H, sky) {
  const haze = (col, k) => css(mix(lcRGB(...col), lcRGB('#c9dde6', '#f2c8a0', '#28315c'), k));
  drawSky(P, H, sky, { horizon: .5, top: '#6eaedd', mid: '#9dcbea', low: '#d8ecf1', topGold: '#7e9cc6', midGold: '#e3b38f', lowGold: '#f8d49c' });
  if (sky.night < .75) {
    cloud(P, 180, H * .09, 280, 80, 11, LW_IN);
    cloud(P, 860, H * .05, 190, 52, 12, LW_FINE);
  }
  /* Mt Hamilton: a broad, dry massif, its summit high enough to sit in the upper panes */
  const y0 = H * .52;
  const range = [[-5, y0 - 70], [80, y0 - 96], [170, y0 - 86], [260, y0 - 130], [340, y0 - 150], [420, y0 - 196], [500, y0 - 240], [560, y0 - 288], [610, y0 - 318], [660, y0 - 322], [700, y0 - 306], [760, y0 - 262], [840, y0 - 236], [920, y0 - 250], [1005, y0 - 214], [1005, y0 + 60], [-5, y0 + 60]];
  P.fill(haze(['#d5b47e', '#e8a46f', '#252c52'], .2), PL(range));
  P.within(PL(range), p => {
    // the shaded north flank and the oak-dark folds that run down it
    p.fill(haze(['#c09c6c', '#cc895c', '#1f264a'], .2), PL([[610, y0 - 318], [660, y0 - 322], [700, y0 - 306], [760, y0 - 262], [840, y0 - 236], [920, y0 - 250], [1005, y0 - 214], [1005, y0 + 60], [640, y0 + 60]]));
    // oak and chaparral: small dark crowns gathered in the folds that run down the flanks
    const rnd = mulberry32(17);
    for (const [fx, k] of [[180, .45], [300, .6], [420, .72], [510, .86], [590, .96], [720, .9], [830, .78], [950, .72]]) {
      for (let j = 0; j < 9; j++) {
        const t = j / 9, x = fx + (rnd() - .5) * 26 + t * 14, y = y0 - 300 * k + 40 + t * (300 * k - 10);
        p.fill(haze(['#8c8a56', '#977a50', '#181e3e'], .2), EL(x, y, 7 + rnd() * 6, 5 + rnd() * 4));
      }
    }
  });
  P.ink(LN(range.slice(0, -2)), LW_FINE, lc(INK, INK, '#0d1022'));
  /* Lick Observatory: the main building with its two domes on the summit, the Shane dome on the shoulder */
  const domeC = lc('#f8f6ef', '#ffdfba', '#8e98bd'), domeS = lc('#d3d3ca', '#e9b38b', '#5a638c');
  const dome = (x, y, r) => {
    P.shape(R(x - r * 1.04, y - r * .34, r * 2.08, r * .7), domeS, LW_FINE);
    const top = c => { c.moveTo(x - r, y - r * .34); c.arc(x, y - r * .34, r, PI, 0); c.closePath(); };
    P.fill(domeC, top);
    P.within(top, p => p.fill(domeS, EL(x + r * .95, y - r * .55, r * .78, r * 1.25)));
    P.ink(top, LW_FINE);
    P.ink(LN([[x - r * .2, y - r * 1.32], [x - r * .2, y - r * .36]]), .7);
  };
  const sx = 646, sy = y0 - 322;
  P.shape(R(sx - 44, sy - 2, 88, 16), domeS, LW_FINE);
  P.fill(domeC, R(sx - 43, sy - 1, 60, 6));
  dome(sx - 40, sy, 18); dome(sx + 40, sy, 13);
  dome(560, y0 - 284, 22);
  /* the golden foothills, oaks dotted along their folds */
  const y1 = H * .64;
  const hills = [[-5, y1 - 96], [80, y1 - 120], [190, y1 - 100], [290, y1 - 132], [380, y1 - 110], [470, y1 - 140], [580, y1 - 116], [690, y1 - 136], [800, y1 - 112], [900, y1 - 130], [1005, y1 - 108], [1005, y1 + 40], [-5, y1 + 40]];
  P.fill(lc('#dcb46c', '#eaa15c', '#232a4c'), PL(hills));
  P.within(PL(hills), p => { const rnd = mulberry32(31); for (let i = 0; i < 8; i++) { const x = 40 + i * 130 + rnd() * 40; p.fill(lc('#c99d58', '#d48a50', '#1d2342'), BLOB([[x - 40, y1 + 30], [x - 4, y1 - 120 + rnd() * 20], [x + 46, y1 + 30]])); } });
  P.ink(LN(hills.slice(0, -2)), LW_FINE);
  const r2 = mulberry32(21);
  for (let i = 0; i < 26; i++) { const x = r2() * 1000, yy = y1 - 104 + r2() * 70, r = 8 + r2() * 8; crown(P, x, yy, r, 100 + i, lc('#6d7e44', '#787240', '#1b2140'), lc('#56653a', '#5e5832', '#141a32'), LW_FINE, 7); }
  /* the valley: a hazy band of low roofs, downtown's few towers on the left */
  const vy = H * .66;
  P.fill(lc('#c4cbaa', '#d9b78f', '#1d2344'), R(-5, y1 - 30, 1010, vy - y1 + 60));
  const towers = [[70, 92, 30], [106, 124, 34], [146, 104, 26], [178, 74, 28], [212, 58, 24]];
  for (const [x, h, w] of towers) {
    P.shape(R(x, vy - h, w, h), haze(['#e9e7de', '#f3d1ac', '#2f3762'], .2), LW_FINE);
    P.fill(haze(['#c5cac4', '#dcab86', '#262d54'], .2), R(x + w * .62, vy - h, w * .38, h));
    for (let wy = vy - h + 7; wy < vy - 4; wy += 8) P.ink(LN([[x + 4, wy], [x + w * .54, wy]]), .5, lc('rgba(60,60,60,.4)', 'rgba(60,60,60,.4)', 'rgba(255,220,150,.0)'));
  }
  const rr = mulberry32(5);
  for (let x = 250; x < 1010;) { const w = 24 + rr() * 30, h = 10 + rr() * 8; P.shape(R(x, vy - h, w, h), lc(['#ebe4d4', '#d79267', '#f3eee3'][Math.floor(rr() * 3)], '#efc6a2', '#2a3157'), .7); if (rr() < .4) crown(P, x + w + 7, vy - 6, 9, 600 + (x | 0), lc('#7f9455', '#8a8448', '#1c223c'), lc('#667a44', '#6e683a', '#151a30'), .7, 6); x += w + 6 + rr() * 10; }
  /* the neighbourhood below the window: stucco houses, tile roofs, garden trees, a cypress, a palm */
  const gy = H * .74;
  P.fill(lc('#8fae6a', '#a4a35c', '#18213a'), R(-5, gy - 20, 1010, H - gy + 30));
  crown(P, 60, gy - 6, 62, 70, lc('#6c8a4c', '#7a8644', '#18203a'), lc('#56723c', '#626a36', '#121830'), LW_IN, 10);
  tileHouse(P, 90, gy + 54, 210, 74, 42);
  crown(P, 340, gy + 6, 50, 71, lc('#78964f', '#869246', '#18203a'), lc('#5f7a40', '#6b6e38', '#121830'), LW_IN, 10);
  cypress(P, 420, gy + 90, 250, 46, 9); cypress(P, 466, gy + 90, 210, 40, 10);
  tileHouse(P, 520, gy + 70, 260, 84, 46, { wall: lc('#f4e6cf', '#f8d0a8', '#2f3252') });
  crown(P, 900, gy + 30, 110, 55, lc('#6c8a4c', '#7a8644', '#18203a'), lc('#56723c', '#626a36', '#121830'), LW, 12);
  featherPalm(P, 790, H + 30, H * .3, 1.35, { bend: 22, trunk: 12, len: 130 });
  // a garden wall along the bottom
  P.shape(R(-5, H * .93, 1010, H * .1), lc('#e9e1cf', '#f2cba5', '#2b2e4c'), LW_IN);
  P.fill(lc('#d2c8b2', '#ddb08a', '#22253f'), R(-5, H * .93, 1010, 8));
  /* after dark: the valley lights, the windows, a light on the summit */
  if (sky.night > .05) {
    const r3 = mulberry32(8), c = P.c;
    for (let i = 0; i < 220; i++) { const x = r3() * 1000, y = y1 - 20 + r3() * (vy - y1 + 14), a = sky.night * (.35 + r3() * .65); c.fillStyle = `rgba(255,${200 + (r3() * 40 | 0)},120,${a})`; c.fillRect(x, y, 2.6, 2.6); }
    for (const [x, h, w] of towers) for (let wy = vy - h + 6; wy < vy - 4; wy += 8) if (r3() < .6) { c.fillStyle = `rgba(255,224,150,${sky.night * .85})`; c.fillRect(x + 4, wy, w * .45, 2.6); }
    c.fillStyle = `rgba(255,236,190,${sky.night * .9})`; c.fillRect(sx - 34, sy + 4, 3, 3); c.fillRect(sx + 18, sy + 4, 3, 3);
  }
}

/* a eucalyptus: a pale, peeling, sinuous trunk and drooping clusters of grey-green leaves */
function eucalyptus(P, x, baseY, h, s = 1, seed = 1, lean = 0) {
  const rnd = mulberry32(seed);
  const trunkC = lc('#ece6d6', '#f3d8b8', '#2a2f4e'), trunkS = lc('#c9c2ae', '#d6b190', '#1e2340'), leaf = lc('#86a48e', '#93a07a', '#18213a'), leafS = lc('#6b8a77', '#788a64', '#121a30');
  const pts = [[x, baseY], [x + lean * .3 + 8 * s, baseY - h * .35], [x + lean * .7 - 6 * s, baseY - h * .65], [x + lean, baseY - h]];
  const w0 = 14 * s, w1 = 5 * s;
  const left = pts.map(([px0, py0], i) => [px0 - lerp(w0, w1, i / 3), py0]), right = pts.map(([px0, py0], i) => [px0 + lerp(w0, w1, i / 3), py0]).reverse();
  // branches
  const branches = [];
  for (let i = 0; i < 4; i++) {
    const t = .45 + i * .14, bx = lerp(x, x + lean, t), by = baseY - h * t, dir = i % 2 ? 1 : -1, len = (60 + rnd() * 40) * s;
    branches.push([bx, by, bx + dir * len, by - len * .7]);
  }
  for (const [bx, by, ex, ey] of branches) { P.ink(LN([[bx, by], [ex, ey]]), 6 * s, INK); P.ink(LN([[bx, by], [ex, ey]]), 3.4 * s, trunkC); }
  const tr = c => { CURVE(left)(c); const r = right; c.lineTo(r[0][0], r[0][1]); for (let i = 1; i < r.length; i++) c.lineTo(r[i][0], r[i][1]); c.closePath(); };
  P.shape(tr, trunkC, LW_IN);
  P.within(tr, p => { for (let i = 0; i < 6; i++) { const yy = baseY - h * (.1 + i * .15), xx = lerp(x, x + lean, (baseY - yy) / h); p.fill(trunkS, BLOB([[xx - 3, yy], [xx + 9 * s, yy - 10 * s], [xx + 12 * s, yy + 14 * s], [xx + 2, yy + 22 * s]])); } });
  // leaf clusters: drooping, at branch ends and the crown
  const tips = branches.map(b => [b[2], b[3]]).concat([[x + lean, baseY - h], [x + lean - 30 * s, baseY - h - 20 * s], [x + lean + 34 * s, baseY - h + 10 * s]]);
  for (const [tx, ty] of tips) {
    for (let k = 0; k < 3; k++) {
      const cx = tx + (rnd() - .5) * 50 * s, cy = ty + (rnd() - .3) * 30 * s, rw = (34 + rnd() * 20) * s, rh = (22 + rnd() * 14) * s;
      const pts2 = []; const n = 9;
      for (let j = 0; j < n; j++) { const a = j / n * TAU; const droop = Math.sin(a) > 0 ? 1.45 : .8; pts2.push([cx + Math.cos(a) * rw * (1 + (rnd() - .5) * .3), cy + Math.sin(a) * rh * droop * (1 + (rnd() - .5) * .3)]); }
      const f = SCALLOP(pts2, .3);
      P.fill(k === 0 ? leafS : leaf, f);
      P.within(f, p => p.fill(leafS, R(cx - rw, cy + rh * .3, rw * 2, rh * 2)));
      P.ink(f, LW_FINE);
    }
  }
}

/* ───────── San Diego: the Geisel Library among eucalyptus, a clear morning ───────── */
function viewSanDiego(P, H, sky) {
  drawSky(P, H, sky, { horizon: .62, top: '#5fa6dc', mid: '#94c8ea', low: '#d6ecf2' });
  cloud(P, 220, H * .12, 160, 42, 21, LW_FINE);
  cloud(P, 820, H * .2, 120, 34, 22, LW_FINE);
  // the Pacific, a thin bright line far off to the left, and the low mesa
  P.fill(lc('#7fb2cf', '#e7b98d', '#24305a'), R(-5, H * .6, 330, 20));
  P.ink(LN([[-5, H * .6], [325, H * .6]]), LW_FINE);
  for (let i = 0; i < 6; i++) P.ink(LN([[20 + i * 52, H * .61 + (i % 2) * 6], [44 + i * 52, H * .61 + (i % 2) * 6]]), 1, 'rgba(255,255,255,.8)');
  P.fill(lc('#a9b98c', '#c9a87a', '#1e2444'), PL([[-5, H * .62], [180, H * .6], [330, H * .61], [520, H * .58], [760, H * .6], [1005, H * .58], [1005, H], [-5, H]]));
  // Geisel: a concrete pedestal, angled columns flaring out, glass floors stepping out then in
  const gx = 520, gy = H * .84, conc = lc('#ddd6c8', '#f0cba4', '#3a4068'), concS = lc('#bdb5a6', '#d7a882', '#2a3058'), glass = lc('#4f6f84', '#7a6c72', '#1a2242'), glassL = lc('#86a9bf', '#c99a86', '#28335c');
  const floors = [[300, 30], [370, 30], [420, 30], [430, 30], [380, 28], [300, 26]];
  let fy = H * .5; const tiers = [];
  for (let i = floors.length - 1; i >= 0; i--) { tiers.push({ w: floors[i][0], h: floors[i][1] }); }
  // columns first (behind the pedestal edges)
  const colTop = H * .56 + 36, base = { w: 190, y: gy - 70 };
  const cols = [[-.34, -.12, 13], [.34, .12, 13], [-.95, -.42, 17], [.95, .42, 17], [-.66, -.28, 16], [.66, .28, 16]];
  for (const [top, bot, cw] of cols) {
    const x0 = gx + bot * base.w, x1 = gx + top * 245;
    P.shape(PL([[x0 - cw * .7, base.y + 6], [x0 + cw * .7, base.y + 6], [x1 + cw, colTop], [x1 - cw, colTop]]), top > 0 ? concS : conc, LW_IN);
    P.fill(top > 0 ? lc('#a9a192', '#c5966f', '#232951') : concS, PL([[x0 + cw * .15, base.y + 6], [x0 + cw * .7, base.y + 6], [x1 + cw, colTop], [x1 + cw * .2, colTop]]));
  }
  // the pedestal and its dark ground-floor glass
  P.shape(R(gx - base.w / 2, base.y, base.w, 64), conc, LW_IN);
  P.shape(R(gx - base.w / 2 + 12, base.y + 18, base.w - 24, 32), glass, LW_FINE);
  // floors: slab edges in concrete, glass between, from the widest middle floors
  let y = colTop;
  const stack = [[500, 40], [540, 40], [540, 40], [490, 38], [410, 34], [310, 30]];
  for (let i = 0; i < stack.length; i++) {
    const [w, h] = stack[i]; y -= h;
    P.shape(R(gx - w / 2, y, w, h), glass, LW_IN);
    P.within(R(gx - w / 2, y, w, h), p => {
      p.fill(glassL, PL([[gx - w / 2 + w * .1, y], [gx - w / 2 + w * .28, y], [gx - w / 2 + w * .2, y + h], [gx - w / 2 + w * .02, y + h]]));
      for (let k = 1; k < 12; k++) p.ink(LN([[gx - w / 2 + w * k / 12, y + 2], [gx - w / 2 + w * k / 12, y + h - 7]]), .6, lc('rgba(30,40,50,.6)', 'rgba(30,40,50,.6)', 'rgba(255,220,150,.5)'));
    });
    P.shape(R(gx - w / 2 - 6, y + h - 8, w + 12, 9), conc, LW_FINE);
  }
  P.shape(R(gx - 160, y - 14, 320, 16), conc, LW_IN);
  // eucalyptus framing the library
  eucalyptus(P, 40, H * .98, H * .74, 1.15, 3, 26);
  eucalyptus(P, 975, H * 1.02, H * .78, 1.25, 7, -30);
  // lawn, a path, low shrubs
  P.fill(lc('#8fbf63', '#a7b65a', '#18233c'), PL([[-5, H * .86], [1005, H * .84], [1005, H + 5], [-5, H + 5]]));
  P.ink(LN([[-5, H * .86], [1005, H * .84]]), LW_FINE);
  P.shape(PL([[470, H + 5], [520, H * .845], [600, H * .845], [690, H + 5]]), lc('#ece4cf', '#f3cfa6', '#2c3050'), LW_IN);
  for (const [x, r] of [[60, 40], [230, 34], [760, 38], [960, 42]]) crown(P, x, H * .9, r, 300 + x, lc('#6f9a50', '#7f9246', '#18203a'), lc('#57803e', '#667538', '#121830'), LW_IN, 9);
}

/* ───────── Bengaluru: rooftops, water tanks, a flame tree, monsoon clouds ───────── */
function roofBlock(P, x, baseY, w, h, wall, wallS, o = {}) {
  P.shape(R(x, baseY - h, w, h + 10), wall, LW_IN);
  P.fill(wallS, R(x + w * .74, baseY - h, w * .26, h + 10));
  // parapet
  P.shape(R(x - 3, baseY - h - 8, w + 6, 9), lc('#efe9da', '#f6d2a8', '#30344f'), LW_FINE);
  // windows with shades
  const cols = Math.max(1, Math.floor(w / 38)), rows = Math.max(1, Math.floor(h / 46));
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const wx = x + (k + .5) * w / cols - 8, wy = baseY - h + 14 + r * 46;
    P.shape(R(wx, wy, 16, 22), lc('#3e4d5c', '#4c4858', '#f1c66c'), LW_FINE);
    P.fill(wallS, R(wx - 3, wy - 4, 22, 4));
  }
  if (o.tank) { // a black water tank on the roof
    const tx = x + w * o.tank, ty = baseY - h - 8;
    P.shape(R(tx - 3, ty - 6, 30, 6), lc('#8a8a86', '#9a8a7a', '#1d2034'), LW_FINE);
    P.shape(c => { c.moveTo(tx, ty - 6); c.lineTo(tx, ty - 34); c.quadraticCurveTo(tx + 12, ty - 42, tx + 24, ty - 34); c.lineTo(tx + 24, ty - 6); c.closePath(); }, lc('#2f3337', '#3a3436', '#0f1222'), LW_FINE);
    for (let k = 0; k < 3; k++) P.ink(LN([[tx, ty - 14 - k * 7], [tx + 24, ty - 14 - k * 7]]), .7, 'rgba(255,255,255,.25)');
  }
}
function viewBengaluru(P, H, sky) {
  drawSky(P, H, sky, { horizon: .56, top: '#4f78ad', mid: '#93b6d8', low: '#f3c78e', topGold: '#4a72a8', midGold: '#98b6d2', lowGold: '#f4c487' });
  // towering monsoon clouds, lit warm from the west
  const bigCloud = (cx, cy, w, h, seed) => {
    const pts = bumpRing(cx, cy, w / 2, h / 2, 14, seed, .22, true), f = SCALLOP(pts, .45);
    P.fill('#fffaf0', f);
    P.within(f, p => {
      // slate underside with a soft, lumpy top edge; a warm rim where the low sun catches the top
      p.fill('#b3bccd', BLOB([[cx - w * .7, cy + h * .22], [cx - w * .35, cy + h * .1], [cx, cy + h * .2], [cx + w * .35, cy + h * .08], [cx + w * .7, cy + h * .18], [cx + w * .7, cy + h], [cx - w * .7, cy + h]]));
      p.fill('#98a3b9', R(cx - w, cy + h * .4, w * 2, h));
      p.fill('#ffe2b8', BLOB([[cx - w * .55, cy - h * .2], [cx - w * .3, cy - h * .5], [cx - w * .05, cy - h * .55], [cx - w * .2, cy - h * .25]]));
    });
    P.ink(f, LW_IN);
  };
  bigCloud(300, H * .2, 460, 230, 41);
  bigCloud(790, H * .14, 360, 170, 42);
  // far city: a soft band of blocks
  P.fill('#b7c3cf', R(-5, H * .52, 1010, H * .1));
  for (let x = -5, i = 0; x < 1005; i++) { const w = 30 + (i * 23 % 34), h = 18 + (i * 17 % 30); P.shape(R(x, H * .58 - h, w, h + 20), ['#cdd5dc', '#c4ccd5', '#d6dce2'][i % 3], .7); x += w + 3; }
  P.fill('#7fa25a', R(-5, H * .6, 1010, H * .45));
  for (let i = 0; i < 16; i++) crown(P, i * 66 + 10, H * .62 + (i % 3) * 8, 26 + (i * 7 % 12), 700 + i, '#6c9450', '#557a3e', LW_FINE, 8);
  // the near rooftops: flat roofs, painted walls, black tanks
  const blocks = [
    [-10, H * .9, 190, 210, '#e8c7c0', '#d2aba3', { tank: .55 }],
    [170, H * .95, 160, 170, '#f0dca2', '#dcc386', { tank: .2 }],
    [320, H * .92, 200, 250, '#cfe0cf', '#b4c9b4', { tank: .64 }],
    [510, H * .96, 150, 150, '#f2ede0', '#dad3c2', {}],
    [650, H * .93, 180, 230, '#f2c9a2', '#ddb08a', { tank: .3 }],
  ];
  for (const [x, by, w, h, a, b, o] of blocks) roofBlock(P, x, by, w, h, lc(a, a, '#2c3150'), lc(b, b, '#22263f'), o);
  // street trees and a coconut palm rising between the houses
  for (const [x, y, r] of [[120, H * .97, 70], [470, H * 1.0, 64], [700, H * .99, 58]]) crown(P, x, y, r, 900 + x, lc('#5f8a46', '#6b7f40', '#18203a'), lc('#4a7238', '#556634', '#121830'), LW_IN, 11);
  featherPalm(P, 590, H + 30, H * .52, 1.0, { bend: -18, trunk: 8, len: 110, nuts: true });
  // overhead wires sagging across
  P.ink(CURVE([[-5, H * .52], [300, H * .58], [600, H * .55], [1005, H * .6]]), .9);
  P.ink(CURVE([[-5, H * .55], [320, H * .61], [640, H * .58], [1005, H * .63]]), .9);
  // the gulmohar: a wide umbrella canopy, red-orange flowers over feathery leaves
  const gx = 800, gy = H * .48;
  P.ink(LN([[gx - 10, H + 5], [gx - 6, gy + 60], [gx - 80, gy + 10]]), 9, INK); P.ink(LN([[gx - 10, H + 5], [gx - 6, gy + 60], [gx - 80, gy + 10]]), 5.4, lc('#7a5b42', '#86603e', '#1a1d33'));
  P.ink(LN([[gx - 6, gy + 60], [gx + 60, gy + 8]]), 7, INK); P.ink(LN([[gx - 6, gy + 60], [gx + 60, gy + 8]]), 3.6, lc('#7a5b42', '#86603e', '#1a1d33'));
  const can = SCALLOP(bumpRing(gx - 10, gy - 10, 250, 96, 18, 51, .16), .35);
  P.fill(lc('#6e8f4a', '#7a8644', '#1a2240'), can);
  P.within(can, p => {
    p.fill(lc('#56763a', '#636c36', '#121a32'), R(gx - 260, gy + 20, 520, 120));
    const rnd = mulberry32(52);
    for (let i = 0; i < 160; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()), x = gx - 10 + Math.cos(a) * 250 * r, y = gy - 10 + Math.sin(a) * 96 * r - 6;
      p.fill(i % 5 ? lc('#e2552f', '#ee5a2a', '#3a2232') : lc('#f19a3a', '#f8a03a', '#3c2a30'), EL(x, y, 7 + rnd() * 6, 5 + rnd() * 4, rnd()));
    }
  });
  P.ink(can, LW_IN);
}

/* ───────── Surathkal: palms, the Arabian Sea and the lighthouse, after dark ───────── */
function viewSurathkal(P, H, sky) {
  drawSky(P, H, sky, { horizon: .62, top: '#1b2a55', mid: '#33437a', low: '#6a6f9c' });
  const hz = H * .6;
  // the sea, a moon road on it
  P.fill(lc('#2c4c7a', '#2c4c7a', '#1e3058'), R(-5, hz, 1010, H * .25));
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
    p.ink(PL([[-16, 0], [16, 0], [11, -126], [-11, -126]]), LW_IN);
    p.shape(R(-15, -142, 30, 16), '#ffe9a8', LW_IN);
    p.shape(c => { c.moveTo(-17, -142); c.lineTo(0, -160); c.lineTo(17, -142); c.closePath(); }, '#2a2f3e', LW_IN);
    p.shape(R(-22, -128, 44, 5), '#2a2f3e', LW_FINE);
  });
  // the beach, foam
  P.fill('#3a3b52', PL([[-5, H * .84], [1005, H * .8], [1005, H + 5], [-5, H + 5]]));
  P.ink(CURVE([[-5, H * .84], [300, H * .825], [700, H * .81], [1005, H * .8]]), 1.6, 'rgba(240,244,255,.75)');
  // coconut palms, dark against the sky
  const palm = (x, top, bend, s, seed) => featherPalm(P, x, H + 20, top, s, { bend, trunk: 9, len: 120, trunkCol: '#151b30', trunkShade: '#0f1426', ringCol: '#0a0d1c', leaf: '#16203a', leafShade: '#0e1529', leafBack: '#121a31', nuts: false });
  palm(640, H * .34, 40, 1.15, 1);
  palm(830, H * .22, -30, 1.3, 2);
  palm(80, H * .4, 30, 1.0, 3);
}

const VIEWS = { now: viewSanJose, sd: viewSanDiego, blr: viewBengaluru, nitk: viewSurathkal };

/* ───────── live things outside the window (view units, drawn every frame) ───────── */
const VIEW_LIVE = {
  nitk(c, H, t) {
    // the lighthouse beam: a pale wedge sweeping round, brightest as it faces us
    const hx = 250, hy = H * .6 - 44 - 134 * 1.25, ph = (t * .35) % 1, a = ph * TAU, face = Math.cos(a);
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
};
