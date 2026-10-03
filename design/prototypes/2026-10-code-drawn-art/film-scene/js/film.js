/* ═══════════════════════════════════════════════════════════════════════════
   film.js — "How to Please a Capricious God", the opening, re-staged in code.
   One renderer: renderFrame(ctx, A, t) draws any moment of the 37.4 s scene.
   Film space is 1280 × 720 units; plates are built at s px per unit.

   DESIGN
     hand      egg tempera on a gessoed panel, water-gilded gold leaf (paint.js)
     gold      the god. Never a gradient: light moves across burnished leaf.
     eye       red-orange cinnabar and minium, a dark pupil, set into raised gold
               folds (pastiglia) instead of drawn as a sticker. No green in it.
     YOU       olive egg, one big eye (lead white, bone-brown pupil), thin legs,
               stick arms, flat three-fingered mittens. Closed eye = a lid disc
               with a white crescent, never a curved line (San, fb-0011).
     rocks     Sienese crags as tilted slabs with lit edges and clefts, not tiers.
     grammar   six shots, hard cuts on words, a new angle every shot.
     refuses   gradients standing in for gold, airbrush shading, pure black,
               speed lines, shake, lens flares, player chrome on the picture.
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

const FILM = { W: 1280, H: 720, D: 37.4, fps: 24 };
const PAGE_DARK = '#120d0a';

// the script's opening lines, verbatim; times are the recorded read + 1.2 s,
// with the score's openings after "opens its own", "left in you" and "god"
const CUES = [
  { a: 1.20, b: 2.95, text: 'You open your eye.' },
  { a: 3.33, b: 7.20, text: 'Above you, something enormous opens its own.' },
  { a: 8.62, b: 14.30, text: 'Something stirs, a thousand lifetimes you have stood beneath this same eye.' },
  { a: 14.64, b: 17.05, text: 'No clear memories survive.' },
  { a: 17.18, b: 20.70, text: 'Only the longing they have left in you.' },
  { a: 22.27, b: 27.70, text: 'You need, terribly, to please this capricious god.' },
];
const SHOTS = [
  { id: 1, a: 0.00, b: 4.10, key: 2.70, name: 'Close, front: it opens its eye' },
  { id: 2, a: 4.10, b: 8.62, key: 7.20, name: 'Low, from behind: the eye opens in the gold' },
  { id: 3, a: 8.62, b: 14.64, key: 12.30, name: 'From straight above: a thousand lifetimes' },
  { id: 4, a: 14.64, b: 22.27, key: 19.40, name: 'Close, three-quarter: the longing' },
  { id: 5, a: 22.27, b: 29.60, key: 27.20, name: 'Wide, from behind: the need' },
  { id: 6, a: 29.60, b: 37.40, key: 34.40, name: 'Title' },
];

// ── timing helpers ──────────────────────────────────────────────────────────
const EASE = {
  lin: t => clamp(t),
  io: t => easeInOut(t),
  out: t => easeOut(t),
  in: t => Math.pow(clamp(t), 3),
  sine: t => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t)),
  back: t => { t = clamp(t); const c = 2.0; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
// keyframes: [[time, value, easeIntoThisKey], …]
function key(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1], [t1, v1, e = 'io'] = ks[i];
      return v0 + (v1 - v0) * EASE[e]((t - t0) / (t1 - t0));
    }
  }
  return ks[ks.length - 1][1];
}
const spring = (t, t0, amp, freq, damp) => t < t0 ? 0 : amp * Math.sin(TAU * freq * (t - t0)) * Math.exp(-damp * (t - t0));
const drift = (t, f, seed) => vnoise(t * f, 0.5, seed) * 2 - 1;      // organic −1…1
const within = (t, a, b, fa = 0.12, fb = 0.12) => smooth(a, a + fa, t) * (1 - smooth(b - fb, b, t));

// ── palette beyond paint.js ─────────────────────────────────────────────────
const YOU = { body: '#6b7a3c', light: '#b2bd76', dark: '#3c4720', deep: '#2a3217', white: '#eee3c8', pupil: '#211510' };
const EARTH = { base: '#827c47', light: '#bcae6b', dark: '#4a482a', far: '#9c9a6b', farD: '#6e7150' };

// ── geometry ────────────────────────────────────────────────────────────────
function eggPts(rx, ry, n = 72) {           // centred, top at −ry, fuller below
  const out = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, s = Math.sin(a), c = Math.cos(a); out.push([s * rx * (1 - 0.13 * c), -c * ry]); }
  return out;
}
const xf = (pts, f) => pts.map(f);

// ═══════════════════════════════════════════════════════════════════════════
// BUILD
// ═══════════════════════════════════════════════════════════════════════════
function plateCanvas(rect, s) {
  const c = makeCanvas(rect.w * s, rect.h * s), g = ctxOf(c);
  g.setTransform(s, 0, 0, s, -rect.x * s, -rect.y * s);
  return { c, g };
}
// a region of the leaf, laid into a plate; tooling is drawn in plate (film) units
function goldPlate(A, rect, leafScale, src, tool) {
  const s = A.s, { c, g } = plateCanvas(rect, s), gl = makeCanvas(c.width, c.height), gg = ctxOf(gl);
  const sw = rect.w / leafScale * s, sh = rect.h / leafScale * s;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(A.G.gold, src[0] * s, src[1] * s, sw, sh, 0, 0, c.width, c.height);
  gg.drawImage(A.G.glint, src[0] * s, src[1] * s, sw, sh, 0, 0, c.width, c.height);
  g.restore();
  if (tool) tool(g, gg);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.09; g.drawImage(A.cracks, 0, 0, c.width, c.height); g.restore();
  return { img: c, glint: gl, rect, leafScale, src };
}
// rays, a punched mandorla and rosettes: the god's glory, tooled into the gold
function toolGlory(g, gg, cx, cy, E, o = {}) {
  const { n = 56, reach = 1600, oval = 0.6, k = 1.6 } = o;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, r0 = E * 1.3;
    const pl = [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * oval * 1.05], [cx + Math.cos(a) * reach, cy + Math.sin(a) * reach]];
    incise(g, pl, k, i % 2 ? 0.75 : 1.25);
    if (i % 2 === 0) {
      for (let j = 0; j < 40; j++) {
        const rr = E * 1.42 + j * 8.5 * (1 + j * 0.03); if (rr > E * 2.7) break;
        const aa = a + TAU / n / 2, f = oval + (1 - oval) * Math.min(1, (rr - E) / (E * 1.6));
        punch(g, cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr * f, 1.7 + (j % 3 === 0 ? 0.7 : 0), k);
      }
    }
  }
  for (const kk of [1.16, 1.3]) incise(g, ellipsePts(cx, cy, E * kk, E * kk * oval, 140).concat([[cx + E * kk, cy]]), k, 1.2);
  for (let i = 0; i < 52; i++) { const a = i / 52 * TAU; punch(g, cx + Math.cos(a) * E * 1.23, cy + Math.sin(a) * E * 1.23 * oval, 2.6, k, i % 2 ? 'ring' : 'rosette'); }
  if (gg) { // punches and incisions sparkle a little in the glint map
    gg.save(); gg.globalCompositeOperation = 'destination-out'; gg.globalAlpha = 0.5;
    for (const kk of [1.16, 1.3]) { gg.beginPath(); polyPath(gg, ellipsePts(cx, cy, E * kk, E * kk * oval, 140)); gg.lineWidth = 2 * k; gg.stroke(); }
    gg.restore();
  }
}
// gold-leaf creases incised above where the eye will open
function toolLidCreases(g, cx, cy, E, k = 1.6) {
  for (const [m, w] of [[1.0, 1.3], [1.12, 0.9]]) {
    const pts = [];
    for (let i = 4; i <= 36; i++) { const x = -1 + 2 * i / 40, sx = Math.max(0, 1 - x * x); pts.push([cx + x * E * 1.04, cy - (0.5 * Math.pow(sx, 0.72) * 1.18 + 0.16 * sx) * E * m - E * 0.07]); }
    incise(g, pts, k, w);
  }
}

// ── the god's eye ───────────────────────────────────────────────────────────
function* buildGodEye(A, E) {
  const s = A.s, rnd = mulberry32(808), u = E / 160;
  const w = Math.ceil(E * 2.4), h = Math.ceil(E * 1.5), cx = w / 2, cy = h / 2;
  const sclera = makeCanvas(w * s, h * s), sc = ctxOf(sclera); sc.setTransform(s, 0, 0, s, 0, 0);
  const full = eyeLids(1.0);
  const aper = [...full.up.map(([x, y]) => [cx + x * E * 1.01, cy + y * E * 1.06 - E * 0.01]), ...full.lo.slice().reverse().map(([x, y]) => [cx + x * E * 1.01, cy + y * E * 1.08 + E * 0.01])];
  paintForm(sc, aper, {
    base: '#e3d1ac', light: '#faefd6', dark: '#a08262',
    shade: (x, y) => { const nx = (x - cx) / E, ny = (y - cy) / E; return 0.36 - Math.pow(Math.abs(nx), 1.7) * 1.25 - Math.max(0, -ny - 0.02) * 1.7 - Math.max(0, ny - 0.1) * 0.9 + (nx < 0 ? 0.08 : -0.08); },
    dir: x => 0.12 + (x - cx) / E * 0.45, density: 3.4, len: [3, 7], width: [0.7, 1.1], outline: null, flatNoise: 0.05, strokeA: 0.5,
  }, rnd, u);
  // the corners go warm grey-green (terre verte underpaint), the inner corner pink
  sc.save(); sc.beginPath(); polyPath(sc, aper); sc.clip();
  for (const side of [-1, 1]) for (let i = 0; i < 220; i++) {
    const x = cx + side * E * (0.62 + rnd() * 0.4), y = cy + (rnd() - 0.45) * E * 0.42, l = (5 + rnd() * 9) * u;
    sc.beginPath(); sc.moveTo(x, y); sc.lineTo(x + side * l * 0.3, y + l * 0.9);
    sc.strokeStyle = rgba(hexRGB(side < 0 ? '#9a8a68' : '#7f7458'), 0.12 + rnd() * 0.18); sc.lineWidth = (0.9 + rnd()) * u; sc.stroke();
  }
  for (let i = 0; i < 420; i++) {
    const x = cx + (rnd() - 0.5) * E * 1.6, y = cy + E * (0.08 + rnd() * 0.22), l = (5 + rnd() * 8) * u;
    sc.beginPath(); sc.moveTo(x, y); sc.lineTo(x + l, y + l * 0.1); sc.strokeStyle = rgba(hexRGB('#d8b066'), 0.06 + rnd() * 0.1); sc.lineWidth = (1 + rnd()) * u; sc.stroke();
  }
  sc.fillStyle = 'rgba(190,92,78,0.32)'; sc.beginPath(); sc.ellipse(cx - E * 0.9, cy + E * 0.03, E * 0.065, E * 0.05, 0.2, 0, TAU); sc.fill();
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 1 : -1; let x = cx + side * E * (0.95 - rnd() * 0.08), y = cy + (rnd() - 0.5) * E * 0.2;
    sc.beginPath(); sc.moveTo(x, y);
    for (let j = 0; j < 7; j++) { x -= side * E * (0.035 + rnd() * 0.03); y += (rnd() - 0.5) * E * 0.04; sc.lineTo(x, y); }
    sc.strokeStyle = 'rgba(165,64,52,0.28)'; sc.lineWidth = 0.6 * u; sc.stroke();
  }
  sc.restore();
  yield;
  // the iris, without its pupil (the pupil breathes, so it is painted per frame)
  const R = E * 0.43, iw = Math.ceil(R * 2.3), ix = iw / 2;
  const iris = makeCanvas(iw * s, iw * s), ic = ctxOf(iris); ic.setTransform(s, 0, 0, s, 0, 0);
  ic.fillStyle = '#c43d1e'; ic.beginPath(); ic.arc(ix, ix, R, 0, TAU); ic.fill();
  ic.save(); ic.beginPath(); ic.arc(ix, ix, R, 0, TAU); ic.clip();
  // underlayer: darker lake toward the rim, minium toward the collarette
  for (let i = 0; i < 26; i++) { const r = R * (1 - i / 26); ic.beginPath(); ic.arc(ix, ix, r, 0, TAU); ic.strokeStyle = rgba(mixRGB(hexRGB('#7d1b16'), hexRGB('#e0602f'), Math.pow(i / 26, 0.8)), 0.16); ic.lineWidth = R / 22; ic.stroke(); }
  const nF = Math.round(Math.max(1400, R * R * 0.07));
  for (let i = 0; i < nF; i++) {           // radial fibres, laid like tempera hatching
    const a = rnd() * TAU, r0 = R * (0.34 + rnd() * 0.14), r1 = R * (0.6 + rnd() * 0.42), bend = (rnd() - 0.5) * 0.22;
    const pick = rnd(), col = pick < 0.34 ? '#ee8a4a' : pick < 0.62 ? '#e5633d' : pick < 0.86 ? '#9c2a18' : '#6f1611';
    ic.beginPath(); ic.moveTo(ix + Math.cos(a) * r0, ix + Math.sin(a) * r0);
    ic.quadraticCurveTo(ix + Math.cos(a + bend) * (r0 + r1) / 2, ix + Math.sin(a + bend) * (r0 + r1) / 2, ix + Math.cos(a + bend * 1.7) * r1, ix + Math.sin(a + bend * 1.7) * r1);
    ic.strokeStyle = rgba(hexRGB(col), 0.28 + rnd() * 0.42); ic.lineWidth = (0.5 + rnd() * 1.2) * u; ic.stroke();
  }
  for (let i = 0; i < 70; i++) {            // crypts: small dark lenses in the mid-iris
    const a = rnd() * TAU, r = R * (0.5 + rnd() * 0.32), L = R * (0.04 + rnd() * 0.07), Wd = R * (0.012 + rnd() * 0.02);
    ic.save(); ic.translate(ix + Math.cos(a) * r, ix + Math.sin(a) * r); ic.rotate(a);
    ic.beginPath(); ic.ellipse(0, 0, L, Wd, 0, 0, TAU); ic.fillStyle = rgba(hexRGB('#5e130e'), 0.35 + rnd() * 0.3); ic.fill();
    ic.beginPath(); ic.ellipse(L * 0.2, -Wd * 0.4, L * 0.6, Wd * 0.35, 0, 0, TAU); ic.fillStyle = 'rgba(244,150,90,0.25)'; ic.fill();
    ic.restore();
  }
  // collarette: a broken, lighter zig-zag ring around the pupil
  ic.beginPath();
  for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, r = R * (0.47 + (i % 2 ? 0.035 : -0.02) + (rnd() - 0.5) * 0.02); const x = ix + Math.cos(a) * r, y = ix + Math.sin(a) * r; if (i) ic.lineTo(x, y); else ic.moveTo(x, y); }
  ic.strokeStyle = 'rgba(246,160,96,0.55)'; ic.lineWidth = 1.4 * u; ic.stroke();
  // warm bounce from the gold below; a cool-free shadow from the lid above
  for (let i = 0; i < 260; i++) {
    const a = Math.PI * (0.18 + rnd() * 0.64), r = R * (0.62 + rnd() * 0.34), l = (4 + rnd() * 7) * u;
    ic.beginPath(); ic.moveTo(ix + Math.cos(a) * r, ix + Math.sin(a) * r); ic.lineTo(ix + Math.cos(a) * (r + l), ix + Math.sin(a) * (r + l));
    ic.strokeStyle = rgba(hexRGB('#f2c26a'), 0.12 + rnd() * 0.16); ic.lineWidth = 1.1 * u; ic.stroke();
  }
  ic.restore();
  for (let i = 0; i < 5; i++) { ic.beginPath(); ic.arc(ix, ix, R * (0.995 - i * 0.022), 0, TAU); ic.strokeStyle = rgba(hexRGB('#5c120d'), 0.55 - i * 0.1); ic.lineWidth = R * 0.03; ic.stroke(); }
  yield;
  // a window highlight in lead white: a cluster of soft round dabs, not a sticker
  const hw = Math.ceil(R * 0.6), hl = makeCanvas(hw * s, hw * s), hc = ctxOf(hl); hc.setTransform(s, 0, 0, s, 0, 0);
  for (let i = 0; i < 26; i++) {
    const a = rnd() * TAU, r = hw * 0.1 * Math.sqrt(rnd()), x = hw * 0.42 + Math.cos(a) * r * 1.3, y = hw * 0.4 + Math.sin(a) * r, rr = hw * (0.045 + rnd() * 0.05);
    const gr = hc.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(253,247,232,${0.5 + rnd() * 0.3})`); gr.addColorStop(1, 'rgba(253,247,232,0)');
    hc.fillStyle = gr; hc.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  { const gr = hc.createRadialGradient(hw * 0.7, hw * 0.72, 0, hw * 0.7, hw * 0.72, hw * 0.05); gr.addColorStop(0, 'rgba(253,247,232,0.55)'); gr.addColorStop(1, 'rgba(253,247,232,0)'); hc.fillStyle = gr; hc.fillRect(0, 0, hw, hw); }
  return { E, w, h, sclera, iris, R, iw, hl, hw };
}
// draw the god's eye: k scales the built eye; lids are raised gold folds
function drawGodEye(ctx, eye, cx, cy, k, open, look, pupil, seam = 1) {
  if (seam <= 0.002) return;
  const E = eye.E * k, lids = eyeLids(Math.max(0.0001, open));
  const P = ([x, y]) => [cx + x * E, cy + y * E];
  const up = lids.up.map(P), lo = lids.lo.map(P);
  const th = x => E * (0.1 * Math.pow(Math.max(0, 1 - x * x), 0.55) + 0.012);
  const upFold = lids.up.map(([x, y]) => [cx + x * E * 1.02, cy + y * E - th(x) * 0.85]);
  const loFold = lids.lo.map(([x, y]) => [cx + x * E * 1.02, cy + y * E + th(x) * 0.5]);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = seam;
  // the upper fold: gold turning down toward the eye (darker toward the lid edge)
  ctx.beginPath(); polyPath(ctx, [...upFold, ...up.slice().reverse()]); ctx.fillStyle = 'rgba(96,60,16,0.2)'; ctx.fill();
  ctx.beginPath(); polyPath(ctx, [...lids.up.map(([x, y]) => [cx + x * E * 1.015, cy + y * E - th(x) * 0.45]), ...up.slice().reverse()]); ctx.fillStyle = 'rgba(70,40,10,0.26)'; ctx.fill();
  ctx.beginPath(); polyPath(ctx, upFold.slice(5, -5), false); ctx.strokeStyle = 'rgba(255,240,188,0.34)'; ctx.lineWidth = Math.max(1.4, E * 0.006); ctx.stroke();
  ctx.beginPath(); polyPath(ctx, loFold.slice(3, -3), false); ctx.strokeStyle = 'rgba(70,40,10,0.34)'; ctx.lineWidth = Math.max(1.2, E * 0.008); ctx.stroke();
  ctx.restore();
  if (open > 0.012) {
    ctx.save(); ctx.beginPath(); polyPath(ctx, [...up, ...lo.slice().reverse()]); ctx.clip();
    ctx.drawImage(eye.sclera, cx - eye.w / 2 * k, cy - eye.h / 2 * k, eye.w * k, eye.h * k);
    const R = eye.R * k, lx = clamp(look[0], -1, 1) * E * 0.33, ly = clamp(look[1], -1, 1) * E * 0.14 - E * 0.015;
    ctx.drawImage(eye.iris, cx + lx - eye.iw / 2 * k, cy + ly - eye.iw / 2 * k, eye.iw * k, eye.iw * k);
    const pr = R * 0.4 * pupil;
    ctx.beginPath(); ctx.arc(cx + lx, cy + ly, pr * 1.06, 0, TAU); ctx.fillStyle = 'rgba(70,16,12,0.55)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx + lx, cy + ly, pr, 0, TAU); ctx.fillStyle = '#1f130e'; ctx.fill();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(eye.hl, cx + lx - R * 0.62, cy + ly - R * 0.66, eye.hw * k, eye.hw * k);
    ctx.globalAlpha = 1;
    for (const [d, a] of [[0.022, 0.42], [0.055, 0.22], [0.1, 0.1], [0.16, 0.05]]) {
      ctx.beginPath(); polyPath(ctx, up, false); ctx.lineWidth = E * d * 2; ctx.strokeStyle = `rgba(78,30,14,${a})`; ctx.stroke();
    }
    ctx.beginPath(); polyPath(ctx, lo.slice(4, -4), false); ctx.strokeStyle = 'rgba(255,232,214,0.6)'; ctx.lineWidth = Math.max(1, E * 0.009); ctx.stroke();
    ctx.restore();
  }
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = seam;
  ctx.beginPath(); polyPath(ctx, up, false); ctx.strokeStyle = 'rgba(70,26,16,0.92)'; ctx.lineWidth = 1.2 + E * 0.011; ctx.stroke();
  ctx.beginPath(); polyPath(ctx, lo, false); ctx.strokeStyle = 'rgba(118,28,20,0.8)'; ctx.lineWidth = 0.9 + E * 0.006; ctx.stroke();
  ctx.restore();
}

// ── YOU: body sprites and the eye ─────────────────────────────────────────────
// creature units: feet at y = 0, top of the head at y = −h
function* buildBody(A, h, view, seed) {
  const s = A.s, rnd = mulberry32(seed), u = clamp(h / 300, 0.6, 4.5);
  const rect = { x: -0.42 * h, y: -1.04 * h, w: 0.84 * h, h: 0.92 * h };
  const { c, g } = plateCanvas(rect, s);
  const rx = 0.31 * h, ry = 0.4 * h, cy = -0.6 * h;
  const egg = view === 'top' ? ellipsePts(0, -0.6 * h, rx, rx * 0.88, 72) : xf(eggPts(rx, ry), ([x, y]) => [x, y + cy]);
  const L = view === 'back' ? [0.25, -0.97] : view === 'top' ? [-0.2, -0.3] : [-0.55, -0.8];
  const shade = (x, y) => {
    const nx = x / rx, ny = (y - cy - 0.05 * h) / ry, r2 = nx * nx + ny * ny;
    if (view === 'top') return clamp(0.55 - r2 * 0.95 + (nx * L[0] + ny * L[1]) * 0.4, -1, 1);
    if (view === 'back') return clamp(-0.32 + smooth(0.62, 1.0, r2) * 0.55 * (ny < 0.2 ? 1 : 0.3) - Math.max(0, ny) * 0.3, -1, 1);
    return clamp((nx * L[0] + ny * L[1]) * 1.05 - Math.pow(r2, 1.6) * 0.75 + 0.1, -1, 1);
  };
  paintForm(g, egg, { base: YOU.body, light: YOU.light, dark: YOU.dark, shade, dir: (x, y) => 0.55 + (x / rx) * 0.35, density: 4.2, len: [2.2, 5], width: [0.6, 0.95], outline: YOU.deep, outlineW: 1.5, outlineA: 0.85, flatNoise: 0.07, strokeA: 0.55 }, rnd, u);
  if (view === 'back') {      // the god's light in front of it: a rim along the crown
    g.save(); g.beginPath(); polyPath(g, egg); g.clip(); g.lineCap = 'round';
    for (let i = 0; i < 900; i++) {
      const a = -Math.PI / 2 + (rnd() - 0.5) * 2.2, ex = Math.sin(a + Math.PI / 2), ey = -Math.cos(a + Math.PI / 2);
      const rr = 1 - rnd() * 0.12 * (1 + Math.abs(a + Math.PI / 2) * 0.5);
      const x = Math.cos(a) * rx * rr * 1.02, y = cy + Math.sin(a) * ry * rr;
      if (y > cy - ry * 0.05) continue;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + ex * 6 * u, y + ey * 6 * u);
      g.strokeStyle = rgba(hexRGB(rnd() < 0.5 ? '#e7cf86' : '#cdd08c'), 0.22 + rnd() * 0.3); g.lineWidth = (0.8 + rnd() * 0.6) * u; g.stroke();
    }
    g.restore();
  }
  return { img: c, rect, h };
}
function* buildYouEye(A, r, seed) {
  const s = A.s, rnd = mulberry32(seed), u = clamp(r / 60, 0.5, 4), size = Math.ceil(r * 2.4);
  const rect = { x: -size / 2, y: -size / 2, w: size, h: size };
  const W = plateCanvas(rect, s);
  paintForm(W.g, ellipsePts(0, 0, r * 1.02, r * 1.02, 72), {
    base: '#e8dcc0', light: '#fdf7e7', dark: '#9a8a6a', shade: (x, y) => clamp(0.42 - Math.pow(Math.hypot(x, y) / r, 2.2) * 0.85 + (-x * 0.25 - y * 0.45) / r, -1, 1),
    dir: (x, y) => Math.atan2(y, x) + Math.PI / 2, density: 3.0, len: [3, 7], outline: null, flatNoise: 0.04, strokeA: 0.55,
  }, rnd, u);
  yield;
  const Pp = plateCanvas(rect, s);
  paintForm(Pp.g, ellipsePts(0, 0, r * 0.5, r * 0.5, 56), { base: YOU.pupil, light: '#4b3326', dark: '#100a07', shade: (x, y) => clamp(-0.1 + (-x - y) / r * 0.6, -1, 1), dir: (x, y) => Math.atan2(y, x), density: 1.4, len: [3, 7], outline: null }, rnd, u);
  const Lw = plateCanvas(rect, s);
  paintForm(Lw.g, ellipsePts(0, 0, r * 1.12, r * 1.12, 72), { base: YOU.body, light: YOU.light, dark: YOU.dark, shade: (x, y) => clamp(0.38 - (y + r * 0.45) / r * 0.55 - x / r * 0.22, -1, 1), dir: () => 0.06, density: 1.6, len: [4, 10], outline: null }, rnd, u);
  return { r, size, white: W.c, pupil: Pp.c, lid: Lw.c };
}
// the creature's eye. lid: 0 closed (a disc with a white crescent below) … 1 open
function drawYouEye(ctx, S, cx, cy, r, o = {}) {
  const { lid = 1, look = [0, 0], pupil = 1, rot = 0, sx = 1, sy = 1, reflect = 0, memories = 0, mt = 0 } = o;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sx, sy);
  const k = S ? r / S.r : 1;
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
  if (S) ctx.drawImage(S.white, -S.size / 2 * k, -S.size / 2 * k, S.size * k, S.size * k);
  else { ctx.fillStyle = YOU.white; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.beginPath(); ctx.arc(r * 0.18, r * 0.2, r * 1.02, 0.1, 2.6); ctx.strokeStyle = 'rgba(120,104,78,0.35)'; ctx.lineWidth = r * 0.22; ctx.stroke(); }
  const px = look[0] * r * 0.4, py = look[1] * r * 0.4, pr = r * 0.44 * pupil;
  if (S) { const pk = pr / (S.r * 0.5); ctx.drawImage(S.pupil, px - S.size / 2 * pk, py - S.size / 2 * pk, S.size * pk, S.size * pk); }
  else { ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fillStyle = YOU.pupil; ctx.fill(); }
  if (memories > 0.01) {          // memories: pale smeared shapes crossing the pupil
    ctx.save(); ctx.beginPath(); ctx.arc(px, py, pr * 0.98, 0, TAU); ctx.clip();
    const rm = mulberry32(51);
    for (let i = 0; i < 7; i++) {
      const sp = 0.6 + rm() * 0.8, y0 = py + (rm() - 0.5) * pr * 1.4, x0 = px - pr * 1.6 + ((mt * sp * 0.55 + rm()) % 1.2) * pr * 3.2;
      const kind = i % 3, sz = pr * (0.18 + rm() * 0.2);
      for (let j = 0; j < 6; j++) {   // smear: the same shape, offset along its path
        ctx.globalAlpha = memories * (0.06 + 0.03 * (6 - j)) * (0.6 + rm() * 0.4);
        ctx.fillStyle = i % 2 ? '#d9cbb0' : '#b9a789';
        const x = x0 - j * sz * 0.35;
        ctx.beginPath();
        if (kind === 0) ctx.ellipse(x, y0, sz * 0.55, sz * 0.7, 0, 0, TAU);
        else if (kind === 1) ctx.rect(x - sz * 0.5, y0 - sz * 0.5, sz, sz);
        else { ctx.ellipse(x, y0 - sz * 0.2, sz * 0.4, sz * 0.5, 0, 0, TAU); ctx.rect(x - sz * 0.06, y0 + sz * 0.2, sz * 0.12, sz * 0.5); }
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1; ctx.restore();
  }
  if (reflect > 0.01) {           // the longing: a small reflection of the god's eye
    const rx = px + pr * 0.18, ry = py - pr * 0.36, s2 = pr * 0.26 * (0.85 + reflect * 0.4);
    ctx.save(); ctx.globalAlpha = Math.min(1, reflect * 1.4);
    ctx.beginPath(); ctx.ellipse(rx, ry, s2 * 1.5, s2 * 0.62, 0, 0, TAU); ctx.fillStyle = 'rgba(214,170,84,0.55)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(rx - s2, ry); ctx.quadraticCurveTo(rx, ry - s2 * 0.75, rx + s2, ry); ctx.quadraticCurveTo(rx, ry + s2 * 0.5, rx - s2, ry); ctx.fillStyle = 'rgba(238,226,196,0.9)'; ctx.fill();
    ctx.beginPath(); ctx.arc(rx + s2 * 0.08, ry - s2 * 0.02, s2 * 0.34, 0, TAU); ctx.fillStyle = '#d2461f'; ctx.fill();
    ctx.beginPath(); ctx.arc(rx + s2 * 0.08, ry - s2 * 0.02, s2 * 0.14, 0, TAU); ctx.fillStyle = '#2a140d'; ctx.fill();
    ctx.restore();
  }
  // catchlight: fixed toward the light, not riding the pupil
  ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = '#fbf5e4';
  ctx.beginPath(); ctx.ellipse(-r * 0.32, -r * 0.36, r * 0.13, r * 0.09, -0.55, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.ellipse(r * 0.3, r * 0.34, r * 0.05, r * 0.035, -0.55, 0, TAU); ctx.fill();
  ctx.restore();
  // the lid: its edge is a curve lowest at the centre; closed leaves a crescent
  const yc = lerp(r * 0.6, -r * 0.88, lid), c = r * 0.24;
  const edge = []; for (let i = 0; i <= 24; i++) { const x = -r * 1.2 + 2.4 * r * i / 24; edge.push([x, yc - c * (x * x) / (r * r)]); }
  ctx.save(); ctx.beginPath(); polyPath(ctx, [...edge, [r * 1.3, -r * 1.4], [-r * 1.3, -r * 1.4]]); ctx.clip();
  if (S) ctx.drawImage(S.lid, -S.size / 2 * k, -S.size / 2 * k, S.size * k, S.size * k); else { ctx.fillStyle = YOU.body; ctx.fillRect(-r * 1.3, -r * 1.4, 2.6 * r, 2.6 * r); }
  ctx.restore();
  ctx.lineCap = 'round';
  ctx.beginPath(); polyPath(ctx, edge.map(([x, y]) => [x, y - r * 0.035]), false); ctx.strokeStyle = 'rgba(205,212,140,0.55)'; ctx.lineWidth = r * 0.03; ctx.stroke();
  ctx.beginPath(); polyPath(ctx, edge, false); ctx.strokeStyle = YOU.deep; ctx.lineWidth = r * 0.045; ctx.stroke();
  ctx.beginPath(); polyPath(ctx, edge.map(([x, y]) => [x, y + r * 0.05]), false); ctx.strokeStyle = 'rgba(50,40,24,0.22)'; ctx.lineWidth = r * 0.06; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = YOU.deep; ctx.lineWidth = r * 0.05; ctx.stroke();
  ctx.restore();
}
// stick limbs and flat three-fingered mittens, painted per frame
function limb(ctx, pts, w) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); polyPath(ctx, pts, false); ctx.strokeStyle = YOU.deep; ctx.lineWidth = w + Math.max(1, w * 0.45); ctx.stroke();
  ctx.beginPath(); polyPath(ctx, pts, false); ctx.strokeStyle = YOU.body; ctx.lineWidth = w; ctx.stroke();
  ctx.beginPath(); polyPath(ctx, pts.map(([x, y]) => [x - w * 0.18, y - w * 0.18]), false); ctx.strokeStyle = 'rgba(178,189,118,0.75)'; ctx.lineWidth = w * 0.32; ctx.stroke();
  ctx.restore();
}
function mitten(ctx, x, y, ang, len, wd) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const f = wd / 2, pts = [[0, -f * 0.7], [len * 0.62, -f], [len * 0.95, -f * 0.92], [len, -f * 0.5], [len * 0.86, -f * 0.3], [len, -f * 0.12], [len * 1.0, f * 0.18], [len * 0.86, f * 0.32], [len * 0.98, f * 0.6], [len * 0.9, f * 0.98], [len * 0.55, f], [0, f * 0.7]];
  ctx.beginPath(); polyPath(ctx, pts); ctx.fillStyle = YOU.body; ctx.fill();
  ctx.strokeStyle = YOU.deep; ctx.lineWidth = Math.max(1, wd * 0.12); ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(len * 0.15, -f * 0.45); ctx.lineTo(len * 0.7, -f * 0.62); ctx.strokeStyle = 'rgba(178,189,118,0.8)'; ctx.lineWidth = wd * 0.14; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
}
// rig: {x, y, h, sq, lean, raiseL, raiseR, lagL, lagR, footL, footR, view}
function drawYou(ctx, A, body, rig, eyeFn) {
  const { x, y, h, sq = 1, lean = 0 } = rig, sy = sq, sx = 1 / Math.sqrt(sq);
  ctx.save(); ctx.translate(x, y);
  // contact shadow
  ctx.save(); ctx.fillStyle = 'rgba(42,30,16,0.32)'; ctx.beginPath(); ctx.ellipse(h * 0.02, h * 0.005, h * 0.26 * sx, h * 0.045, 0, 0, TAU); ctx.fill(); ctx.restore();
  ctx.rotate(lean);
  const legW = h * 0.03, fL = rig.footL || [0, 0], fR = rig.footR || [0, 0];
  for (const [side, f] of [[-1, fL], [1, fR]]) {
    const hip = [side * 0.1 * h * sx, -0.25 * h * sy], ft = [side * 0.11 * h + f[0] * h, f[1] * h];
    limb(ctx, [hip, [lerp(hip[0], ft[0], 0.5) + side * h * 0.01, lerp(hip[1], ft[1], 0.5)], ft], legW);
    ctx.beginPath(); ctx.ellipse(ft[0] + side * h * 0.018, ft[1] - h * 0.006, h * 0.055, h * 0.024, 0, 0, TAU); ctx.fillStyle = YOU.dark; ctx.fill();
  }
  ctx.save(); ctx.scale(sx, sy);
  ctx.drawImage(body.img, body.rect.x * h / body.h, body.rect.y * h / body.h, body.rect.w * h / body.h, body.rect.h * h / body.h);
  ctx.restore();
  // arms: raise 0 hangs, 1 reaches up in a V; lag bends the elbow (overlap)
  for (const side of [-1, 1]) {
    const r = side < 0 ? (rig.raiseL || 0) : (rig.raiseR || 0), lag = side < 0 ? (rig.lagL || 0) : (rig.lagR || 0);
    const sh = [side * 0.27 * h * sx, -0.52 * h * sy];
    const a1 = lerp(1.05, -1.1, r), a2 = lerp(0.42, 0.14, r) + lag * 1.5;
    const ca = side > 0 ? a1 : Math.PI - a1, cb = side > 0 ? a1 + a2 : Math.PI - a1 - a2;
    const el = [sh[0] + Math.cos(ca) * 0.165 * h, sh[1] + Math.sin(ca) * 0.165 * h];
    const hd = [el[0] + Math.cos(cb) * 0.15 * h, el[1] + Math.sin(cb) * 0.15 * h];
    limb(ctx, [sh, el, hd], h * 0.032);
    mitten(ctx, hd[0], hd[1], cb + (rig.flop || 0) * side * 0.5, h * 0.11, h * 0.082);
  }
  if (eyeFn) { ctx.save(); ctx.scale(sx, sy); eyeFn(ctx); ctx.restore(); }
  ctx.restore();
}

// ── rocks: Sienese crags. Many narrow leaning teeth with sloped, lit tops,
// tallest toward a peak and drawn back to front, so the mass reads as a
// mountain of facets, never as stacked terraces.
function paintCrag(g, x0, x1, base, top, rnd, o = {}) {
  const { u = 1, lightFrom = -1, tint = 0 } = o;
  const W = x1 - x0, Hh = base - top, lit = lightFrom < 0;
  const peak = lerp(x0, x1, 0.3 + rnd() * 0.4), n = 5 + (rnd() * 4 | 0), teeth = [];
  for (let i = 0; i < n; i++) {
    const cx = lerp(x0 + W * 0.08, x1 - W * 0.08, (i + rnd() * 0.8) / n);
    const dist = Math.abs(cx - peak) / (W * 0.55);
    const ht = Hh * clamp(1 - dist * 0.75, 0.25, 1) * (0.62 + rnd() * 0.38);
    const hw = W * (0.055 + rnd() * 0.06) * (0.8 + ht / Hh * 0.5);
    teeth.push({ cx, hw, ht, lean: (rnd() - 0.5) * 0.28 + (cx < peak ? 0.06 : -0.06), slope: (rnd() - 0.5) * 0.9 + (cx < peak ? 0.35 : -0.35) });
  }
  teeth.sort((p, q) => q.ht - p.ht);
  const ink = '#2f3520';
  for (const T of teeth) {
    const yb = base + 6, yt = base - T.ht, lx = T.cx - T.hw * 1.3, rx = T.cx + T.hw * 1.3;
    const lean = T.lean * T.ht, tl = T.hw * T.slope, d = Math.min(T.ht * 0.16, T.hw * 0.5);   // d: depth of the top plane
    const tlx = T.cx - T.hw + lean, trx = T.cx + T.hw + lean;
    const face = wobble([[lx, yb], [tlx, yt + d + tl], [trx, yt + d - tl], [rx, yb]], 9 * u, 2.4 * u, rnd);
    const topP = wobble([[tlx, yt + d + tl], [tlx + T.hw * 0.3 * (lit ? 1 : 0.6), yt + tl * 0.8], [trx - T.hw * 0.15, yt - tl * 0.9], [trx, yt + d - tl]], 8 * u, 1.6 * u, rnd);
    const fb = bboxOf(face);
    paintForm(g, face, {
      base: tint ? '#7b8657' : '#6b7648', light: '#a9af76', dark: '#30381f',
      shade: (x, y) => { const fx = (x - fb.x0) / fb.w; return clamp(0.22 - (y - fb.y0) / fb.h * 0.8 + (lit ? (fx < 0.34 ? 0.5 : fx > 0.7 ? -0.55 : 0) : (fx > 0.66 ? 0.5 : fx < 0.3 ? -0.55 : 0)), -1, 1); },
      dir: () => Math.PI / 2 + T.lean * 0.8 + 0.05, density: 1.6, len: [6, 15], width: [0.7, 1.1], outline: ink, outlineW: 1.15, outlineA: 0.85,
    }, rnd, u);
    // one or two clefts: a dark split with a lit lip on the light side
    for (let k = 0; k < 1 + (rnd() * 2 | 0); k++) {
      const f = 0.3 + rnd() * 0.4, cx0 = lerp(tlx, trx, f), cy0 = lerp(yt + d + tl, yt + d - tl, f) + T.ht * 0.06;
      const pl = []; for (let j = 0; j <= 7; j++) { const q = j / 7; pl.push([cx0 - lean * q * 0.9 + (rnd() - 0.5) * 3 * u, lerp(cy0, lerp(cy0, yb, 0.85), q)]); }
      g.save(); g.lineCap = 'round'; g.beginPath(); polyPath(g, pl, false); g.strokeStyle = 'rgba(38,42,24,0.9)'; g.lineWidth = 1.7 * u; g.stroke();
      g.beginPath(); polyPath(g, pl.map(([x, y]) => [x + (lit ? -1.8 : 1.8) * u, y]), false); g.strokeStyle = 'rgba(212,206,148,0.5)'; g.lineWidth = 1.0 * u; g.stroke(); g.restore();
    }
    const tb = bboxOf(topP);
    paintForm(g, topP, { base: '#a7a26a', light: '#e2cb8f', dark: '#7a7849', shade: x => clamp(lit ? 0.75 - (x - tb.x0) / tb.w * 0.8 : -0.05 + (x - tb.x0) / tb.w * 0.8, -1, 1), dir: () => -T.slope * 0.4, density: 1.8, len: [5, 11], outline: ink, outlineW: 1.0, outlineA: 0.75 }, rnd, u);
    g.save(); g.lineCap = 'round'; g.beginPath(); g.moveTo(tlx + 2 * u, yt + d + tl); g.lineTo(trx - 2 * u, yt + d - tl);
    g.strokeStyle = 'rgba(240,228,176,0.62)'; g.lineWidth = 1.5 * u; g.stroke(); g.restore();
    if (rnd() < 0.45) {                                   // a tuft on the top plane
      const gx = lerp(tlx, trx, 0.3 + rnd() * 0.4), gy = lerp(yt + tl, yt - tl, (gx - tlx) / (trx - tlx)) + d * 0.5;
      for (let j = 0; j < 5; j++) { g.beginPath(); g.moveTo(gx, gy); g.quadraticCurveTo(gx + (j - 2) * 1.3 * u, gy - 5 * u, gx + (j - 2) * 2.6 * u, gy - (7 + rnd() * 5) * u); g.strokeStyle = 'rgba(59,69,40,0.85)'; g.lineWidth = 0.9 * u; g.stroke(); }
    }
  }
}
// painted ground: hatched earth that recedes toward a horizon
function paintGround(g, poly, rnd, o = {}) {
  const { u = 1, y0 = 0, y1 = 720, dark = 0 } = o;
  paintForm(g, poly, {
    base: EARTH.base, light: EARTH.light, dark: EARTH.dark,
    shade: (x, y) => clamp((fbm(x / 160, y / 90, 3, 31) - 0.5) * 1.5 + (y - y0) / (y1 - y0) * -0.35 + 0.1 - dark, -1, 1),
    dir: (x, y) => 0.04 + (fbm(x / 300, y / 300, 2, 9) - 0.5) * 0.4, density: 1.15, len: [8, 18], width: [0.7, 1.2], outline: null, flatNoise: 0.08,
  }, rnd, u);
}

// ── shot plates ─────────────────────────────────────────────────────────────
function* buildS1(A) {                        // close, front: the face, the plain dim behind
  const s = A.s, rnd = mulberry32(101), rect = { x: -90, y: -60, w: 1460, h: 840 };
  const bg = goldPlate(A, rect, 1.0, [120, 80]);
  const g = ctxOf(bg.img);
  { const t = makeCanvas(bg.img.width, bg.img.height), tc = ctxOf(t); tc.filter = `blur(${6 * s}px)`; tc.drawImage(bg.img, 0, 0); tc.filter = 'none'; g.drawImage(t, 0, 0); }
  g.setTransform(s, 0, 0, s, -rect.x * s, -rect.y * s);
  // the far plain, out of focus (soft): painted, then blurred as a lens would
  const far = plateCanvas(rect, s);
  paintGround(far.g, [[rect.x, 330], [rect.x + rect.w, 300], [rect.x + rect.w, 800], [rect.x, 800]], rnd, { u: 2.5, y0: 300, y1: 800, dark: 0.15 });
  paintCrag(far.g, -40, 330, 380, 230, rnd, { u: 2.2 });
  paintCrag(far.g, 960, 1360, 370, 210, rnd, { u: 2.2, lightFrom: 1 });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${7 * s}px)`; g.drawImage(far.c, 0, 0); g.filter = 'none'; g.restore();
  yield;
  // the face: YOU at h = 1167 so the eye (r 175) sits at (640, 360)
  const face = yield* buildBody(A, 1167, 'front', 7);
  const eye = yield* buildYouEye(A, 175, 11);
  return { bg, face, eye, rect };
}
function* buildS2(A) {                        // low, from behind: blank gold, then the eye
  const s = A.s, rnd = mulberry32(202), rect = { x: -120, y: -140, w: 1520, h: 1000 };
  const E = 470, cx = 640, cy = 250;
  const gold = goldPlate(A, rect, 1.32, [200, 60], (g, gg) => { toolGlory(g, gg, cx, cy, E, { n: 60, reach: 1500, k: 2.0 }); toolLidCreases(g, cx, cy, E, 2.0); });
  const land = plateCanvas(rect, s);
  paintGround(land.g, [[rect.x, 640], [rect.x + rect.w, 628], [rect.x + rect.w, 900], [rect.x, 900]], rnd, { u: 1.4, y0: 630, y1: 900, dark: 0.3 });
  paintCrag(land.g, -60, 260, 650, 560, rnd, { u: 1.3 });
  paintCrag(land.g, 230, 420, 648, 600, rnd, { u: 1.1 });
  paintCrag(land.g, 900, 1110, 646, 588, rnd, { u: 1.1, lightFrom: 1 });
  paintCrag(land.g, 1060, 1380, 652, 548, rnd, { u: 1.3, lightFrom: 1 });
  yield;
  const back = yield* buildBody(A, 560, 'back', 21);
  return { gold, land: { img: land.c, rect }, back, E, cx, cy };
}
function* buildS3(A) {                        // from straight above: the earth, the creature, spokes
  const s = A.s, rnd = mulberry32(303), rect = { x: -420, y: -520, w: 2120, h: 1760 };
  const P = plateCanvas(rect, s), g = P.g;
  paintForm(g, [[rect.x, rect.y], [rect.x + rect.w, rect.y], [rect.x + rect.w, rect.y + rect.h], [rect.x, rect.y + rect.h]], {
    base: '#8b8550', light: '#c4b674', dark: '#55522f', shade: (x, y) => clamp((fbm(x / 220, y / 220, 4, 41) - 0.5) * 1.9, -1, 1),
    dir: (x, y) => (fbm(x / 400, y / 400, 2, 3) - 0.5) * 3, density: 1.0, len: [8, 16], width: [0.8, 1.3], outline: null, flatNoise: 0.1,
  }, rnd, 2.2);
  yield;
  // stones from above: faceted tops, lit from the god (straight above): centre light
  for (let i = 0; i < 70; i++) {
    const x = rect.x + rnd() * rect.w, y = rect.y + rnd() * rect.h;
    if (Math.hypot(x - 640, y - 380) < 230) continue;
    const r = 8 + rnd() * 26, pts = []; const nv = 6 + (rnd() * 4 | 0);
    for (let k = 0; k < nv; k++) { const a = k / nv * TAU + rnd() * 0.4; pts.push([x + Math.cos(a) * r * (0.7 + rnd() * 0.5), y + Math.sin(a) * r * (0.7 + rnd() * 0.5)]); }
    paintForm(g, pts, { base: '#717a4b', light: '#c9c38c', dark: '#3c4326', shade: (px, py) => clamp(0.55 - Math.hypot(px - x, py - y) / r * 1.1, -1, 1), dir: (px, py) => Math.atan2(py - y, px - x), density: 2, len: [3, 7], outline: '#2f3520', outlineW: 1, outlineA: 0.75 }, rnd, 1);
  }
  for (let i = 0; i < 160; i++) {            // tufts from above: little stars of blades
    const x = rect.x + rnd() * rect.w, y = rect.y + rnd() * rect.h;
    if (Math.hypot(x - 640, y - 380) < 170) continue;
    for (let j = 0; j < 7; j++) { const a = rnd() * TAU, l = 4 + rnd() * 9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.strokeStyle = rgba(hexRGB(rnd() < 0.5 ? '#3b4528' : '#5d6a34'), 0.8); g.lineWidth = 1.1; g.stroke(); }
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.28; g.drawImage(A.cracks, 0, 0, P.c.width, P.c.height); g.restore();
  yield;
  // one long shadow, painted once (umber hatching), drawn per spoke rotated
  const L = 420, Wd = 76, sr = { x: -10, y: -Wd / 2 - 6, w: L + 20, h: Wd + 12 }, S = plateCanvas(sr, s);
  const shape = []; for (let i = 0; i <= 20; i++) { const t = i / 20; shape.push([t * L, -Wd / 2 * Math.pow(1 - t, 0.75) * (1 - 0.15 * Math.sin(t * 9))]); }
  for (let i = 20; i >= 0; i--) { const t = i / 20; shape.push([t * L, Wd / 2 * Math.pow(1 - t, 0.75) * (1 - 0.12 * Math.sin(t * 7 + 1))]); }
  const sh = wobble(shape, 8, 2, rnd);
  S.g.save(); S.g.beginPath(); polyPath(S.g, sh); S.g.clip();
  { const gr = S.g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, 'rgba(112,90,64,1)'); gr.addColorStop(0.5, 'rgba(160,140,110,1)'); gr.addColorStop(1, 'rgba(218,206,180,1)'); S.g.fillStyle = gr; S.g.fillRect(sr.x, sr.y, sr.w, sr.h); }
  for (let i = 0; i < 520; i++) { const x = rnd() * L, y = (rnd() - 0.5) * Wd, l = 6 + rnd() * 10; S.g.beginPath(); S.g.moveTo(x, y); S.g.lineTo(x + l, y + (rnd() - 0.5) * 2); S.g.strokeStyle = `rgba(70,50,30,${0.15 + rnd() * 0.25})`; S.g.lineWidth = 1; S.g.stroke(); }
  S.g.restore();
  const top = yield* buildBody(A, 150, 'top', 33);
  return { ground: { img: P.c, rect }, spoke: { img: S.c, rect: sr, L }, top };
}
function* buildS4(A) {                        // close, three-quarter, low: the eye against the god's light
  const s = A.s, rnd = mulberry32(404), rect = { x: -100, y: -80, w: 1480, h: 880 };
  const bg = goldPlate(A, rect, 1.15, [380, 160], (g) => {
    for (let i = 0; i < 40; i++) { const a = -2.9 + i / 40 * 2.6; incise(g, [[1400 + Math.cos(a) * 260, -260 + Math.sin(a) * 260], [1400 + Math.cos(a) * 2200, -260 + Math.sin(a) * 2200]], 2.0, i % 2 ? 0.7 : 1.1); }
  });
  // the body: a huge egg seen from below-right, turning away into shadow
  const h = 1500, F = plateCanvas(rect, s), g = F.g;
  const ecx = 560, ecy = 830, rx = 640, ry = 830, rot = -0.14;
  const egg = xf(eggPts(rx, ry), ([x, y]) => [ecx + x * Math.cos(rot) - y * Math.sin(rot), ecy + x * Math.sin(rot) + y * Math.cos(rot)]);
  paintForm(g, egg, {
    base: YOU.body, light: YOU.light, dark: YOU.dark,
    shade: (x, y) => { const nx = (x - ecx) / rx, ny = (y - ecy) / ry; const r2 = nx * nx + ny * ny; return clamp((nx * 0.62 + ny * -0.78) * 0.95 - r2 * 0.4 + 0.18, -1, 1); },
    dir: (x, y) => 0.6 + (x - ecx) / rx * 0.35, density: 4.2, len: [2.2, 5], width: [0.6, 0.95], outline: YOU.deep, outlineW: 1.6, outlineA: 0.9, strokeA: 0.55,
  }, rnd, 4.2);
  // rim light from the god: warm hatching along the upper-right silhouette
  g.save(); g.beginPath(); polyPath(g, egg); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < 1600; i++) {
    const j = rnd() * egg.length | 0, [px, py] = egg[j];
    if (px < ecx - 40 || py > 700) continue;
    const ang = Math.atan2(py - ecy, px - ecx), d = rnd() * 40, x = px - Math.cos(ang) * d, y = py - Math.sin(ang) * d;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.sin(ang) * 14, y + Math.cos(ang) * 14);
    g.strokeStyle = rgba(hexRGB('#e8d58e'), 0.18 + rnd() * 0.28 * (1 - d / 40)); g.lineWidth = 2.2; g.stroke();
  }
  g.restore();
  yield;
  const eye = yield* buildYouEye(A, 230, 13);
  return { bg, face: { img: F.c, rect }, eye };
}
function* buildS5(A) {                        // wide, from behind: gold, eye, three planes of rock
  const s = A.s, rnd = mulberry32(505);
  const E = 360, cx = 640, cy = 185, rect = { x: -140, y: -100, w: 1560, h: 760 };
  const gold = goldPlate(A, rect, 1.0, [60, 40], (g, gg) => { toolGlory(g, gg, cx, cy, E, { n: 56, reach: 1400, k: 1.7 }); toolLidCreases(g, cx, cy, E, 1.7); });
  const farR = { x: -160, y: 380, w: 1600, h: 200 }, far = plateCanvas(farR, s);
  const ridge = [[farR.x, 580]]; for (let i = 0; i <= 40; i++) { const x = farR.x + farR.w * i / 40; ridge.push([x, 470 - 22 * fbm(x / 140, 3, 3, 4) - 14 * Math.sin(x / 210)]); } ridge.push([farR.x + farR.w, 580]);
  paintForm(far.g, ridge, { base: EARTH.far, light: '#c6c08f', dark: EARTH.farD, shade: (x, y) => clamp(0.2 - (y - 440) / 120, -1, 1), dir: () => 0.02, density: 1.2, len: [8, 16], outline: '#5a5e40', outlineW: 1, outlineA: 0.6 }, rnd, 1);
  yield;
  const midR = { x: -200, y: 260, w: 1680, h: 360 }, mid = plateCanvas(midR, s);
  paintGround(mid.g, [[midR.x, 486], [midR.x + midR.w, 480], [midR.x + midR.w, 620], [midR.x, 620]], rnd, { u: 1.2, y0: 480, y1: 620 });
  paintCrag(mid.g, -120, 300, 520, 322, rnd, { u: 1.2 });
  paintCrag(mid.g, 230, 460, 512, 410, rnd, { u: 1.0 });
  paintCrag(mid.g, 850, 1060, 512, 398, rnd, { u: 1.0, lightFrom: 1 });
  paintCrag(mid.g, 990, 1420, 522, 312, rnd, { u: 1.2, lightFrom: 1 });
  yield;
  const nearR = { x: -240, y: 470, w: 1760, h: 380 }, near = plateCanvas(nearR, s);
  paintGround(near.g, [[nearR.x, 560], [nearR.x + nearR.w, 556], [nearR.x + nearR.w, 850], [nearR.x, 850]], rnd, { u: 1.6, y0: 556, y1: 850 });
  const fg = plateCanvas(nearR, s);
  paintCrag(fg.g, -230, 230, 820, 590, rnd, { u: 1.8, tint: 1 });
  paintCrag(fg.g, 1060, 1500, 830, 600, rnd, { u: 1.8, tint: 1, lightFrom: 1 });
  yield;
  const back = yield* buildBody(A, 138, 'back', 55);
  return { gold, far: { img: far.c, rect: farR }, mid: { img: mid.c, rect: midR }, ground: { img: near.c, rect: nearR }, fg: { img: fg.c, rect: nearR }, back, E, cx, cy };
}
function* buildS6(A) {                        // title: bole, leaf laid square by square, the name painted
  const s = A.s, rnd = mulberry32(606), rect = { x: 0, y: 0, w: 1280, h: 720 };
  const E = 104, cx = 640, cy = 228;
  const gold = goldPlate(A, rect, 1.0, [300, 220], (g, gg) => toolGlory(g, gg, cx, cy, E, { n: 64, reach: 1500, k: 1.5 }));
  const bole = yield* makePaper(Math.ceil(1280 * s), Math.ceil(720 * s), s, TEMP.bole, { mottle: 0.09, tooth: 0.05, fibres: 0, seed: 23 });
  ctxOf(bole).globalAlpha = 0.35; ctxOf(bole).drawImage(A.cracks, 0, 0, bole.width, bole.height);
  // leaves in plate units: the leaf grid maps through the plate's source window
  const leaves = A.G.leaves.map(l => ({ poly: l.poly.map(([x, y]) => [x / s - 300, y / s - 220]), r: l.r, c: l.c }))
    .filter(l => { const b = bboxOf(l.poly); return b.x1 > -10 && b.x0 < 1290 && b.y1 > -10 && b.y0 < 730; })
    .map(l => { const c = centroid(l.poly); return { ...l, d: Math.hypot(c[0] - cx, (c[1] - cy) * 1.5) + hash2(l.r, l.c, 3) * 50 }; })
    .sort((a, b) => a.d - b.d);
  // the name, painted in lake over the gold, with hatched body and a soft edge
  const T = plateCanvas(rect, s), tg = T.g;
  const lines = [{ str: 'HOW TO PLEASE A CAPRICIOUS GOD', y: 498, maxW: 1000, px: 66, w: 900, track: 0.06, col: '#651510' }, { str: 'PAPER ROBOTS  ·  FILM 02', y: 548, maxW: 360, px: 19, w: 600, track: 0.26, col: TEMP.brown }];
  for (const L of lines) {
    const px = fitText(tg, L.str, L.maxW, L.px, L.w, FONT_DISPLAY, L.track);
    setFont(tg, px, L.w, FONT_DISPLAY); tg.fillStyle = L.col; drawTracked(tg, L.str, 640, L.y, px, L.track, 'center');
  }
  tg.save(); tg.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 2400; i++) { const x = 120 + rnd() * 1040, y = 430 + rnd() * 130, l = 4 + rnd() * 6; tg.beginPath(); tg.moveTo(x, y); tg.lineTo(x + l * 0.3, y - l); tg.strokeStyle = rnd() < 0.5 ? 'rgba(150,40,28,0.45)' : 'rgba(40,10,8,0.35)'; tg.lineWidth = 1; tg.stroke(); }
  tg.restore();
  return { gold, bole, leaves, title: T.c, E, cx, cy };
}

function* buildFilm(s, onProgress = () => {}) {
  const A = { s };
  A.G = yield* makeGoldLeaf(Math.ceil(1900 * s), Math.ceil(1250 * s), s, 13, 50 * s); onProgress(0.18);
  A.cracks = yield* makeCracks(Math.ceil(1100 * s), Math.ceil(660 * s), s, 17, 14); onProgress(0.3);
  A.godEye = yield* buildGodEye(A, 470); onProgress(0.4);
  A.S1 = yield* buildS1(A); onProgress(0.5);
  A.S2 = yield* buildS2(A); onProgress(0.6);
  A.S3 = yield* buildS3(A); onProgress(0.72);
  A.S4 = yield* buildS4(A); onProgress(0.82);
  A.S5 = yield* buildS5(A); onProgress(0.94);
  A.S6 = yield* buildS6(A); onProgress(0.98);
  // a frame-sized sheet for the moving light, and a warm vignette
  A.sheen = makeCanvas(Math.ceil(1280 * s), Math.ceil(720 * s));
  const v = makeCanvas(Math.ceil(1280 * s), Math.ceil(720 * s)), vc = ctxOf(v); vc.setTransform(s, 0, 0, s, 0, 0);
  const gr = vc.createRadialGradient(640, 340, 300, 640, 380, 860);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(176,138,96,1)');
  vc.fillStyle = gr; vc.fillRect(0, 0, 1280, 720);
  A.vignette = v;
  onProgress(1);
  return A;
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAW
// ═══════════════════════════════════════════════════════════════════════════
// camera: c = {x, y, z, r}; a layer at depth d moves d times as much
function camera(ctx, A, c, d = 1) {
  const z = 1 + (c.z - 1) * d, cx = 640 + (c.x - 640) * d, cy = 360 + (c.y - 360) * d;
  ctx.setTransform(A.s, 0, 0, A.s, 0, 0);
  ctx.translate(640, 360); if (c.r) ctx.rotate(c.r * d); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
const plate = (ctx, P) => ctx.drawImage(P.img, P.rect.x, P.rect.y, P.rect.w, P.rect.h);
// light moving across burnished leaf: the plate's glint, masked by a soft band
function sheen(ctx, A, P, band, amount) {
  if (amount <= 0.002) return;
  const sh = A.sheen, c = ctxOf(sh);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, sh.width, sh.height);
  c.setTransform(ctx.getTransform());
  c.drawImage(P.glint, P.rect.x, P.rect.y, P.rect.w, P.rect.h);
  c.globalCompositeOperation = 'destination-in';
  let gr;
  if (band.r) { gr = c.createRadialGradient(band.x, band.y, 0, band.x, band.y, band.r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
  else {
    const { x0, y0, x1, y1, p, w } = band; gr = c.createLinearGradient(x0, y0, x1, y1);
    const a = clamp(p - w), m = clamp(p), b = clamp(p + w);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); if (a > 0) gr.addColorStop(a, 'rgba(0,0,0,0)'); gr.addColorStop(m, 'rgba(0,0,0,1)'); if (b < 1) gr.addColorStop(b, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  }
  c.fillStyle = gr; c.fillRect(P.rect.x, P.rect.y, P.rect.w, P.rect.h);
  c.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = amount; ctx.drawImage(sh, 0, 0); ctx.restore();
}
// light running outward along the incised rays (a ring that travels)
function rayLight(ctx, cx, cy, E, n, oval, ringR, amount) {
  if (amount <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, w = i % 2 ? 0.6 : 1, r0 = Math.max(E * 1.3, ringR - 90), r1 = ringR + 30;
    const f = r => oval + (1 - oval) * Math.min(1, Math.max(0, (r - E) / (E * 1.6)));
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * f(r0)); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * f(r1));
    const gA = amount * (0.35 + 0.65 * hash2(i, 7, 1)) * w;
    ctx.strokeStyle = `rgba(255,230,160,${0.5 * gA})`; ctx.lineWidth = 2.4; ctx.stroke();
  }
  ctx.restore();
}
function dim(ctx, A, a, col = '28,16,8') {
  if (a <= 0.002) return;
  ctx.save(); ctx.setTransform(A.s, 0, 0, A.s, 0, 0); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, 1280, 720); ctx.restore();
}
function glow(ctx, x, y, r, a, col = '255,214,140') {
  if (a <= 0.002) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}

// ── shot 1: close, front ────────────────────────────────────────────────────
function drawS1(ctx, A, t) {
  const S = A.S1, l = t;
  const c = { x: 640, y: 372 - 6 * EASE.io(l / 4.1), z: 1 + 0.035 * EASE.io(l / 4.1) };
  camera(ctx, A, c, 0.45); plate(ctx, S.bg);
  const tilt = key(t, [[3.42, 0], [4.1, 1, 'io']]);
  const breathe = Math.sin(t * TAU * 0.45) * 0.006 + drift(t, 0.7, 3) * 0.002;
  camera(ctx, A, c, 1);
  ctx.save(); ctx.translate(640, 360 + 817 + tilt * -22);
  ctx.scale(1 - breathe * 0.5, 1 + breathe); ctx.translate(-640, -(360 + 817));
  const f = S.face; ctx.drawImage(f.img, 640 + f.rect.x, 360 + 817 + f.rect.y, f.rect.w, f.rect.h);
  // the lid: held shut, a squeeze, then up past open and settling
  const lid = key(t, [[1.38, 0], [1.52, -0.08, 'io'], [1.86, 1.12, 'out'], [2.12, 0.97, 'sine'], [2.34, 1.0, 'sine']]);
  const fz = 1.6, wob = spring(t, 1.62, 0.2, 3.1, 3.2);
  const lookY = key(t, [[3.33, 0], [3.41, 0.08, 'io'], [3.86, -0.82, 'io']]) + spring(t, 3.86, 0.05, 2.5, 6);
  const look = [wob + drift(t, 0.9, 5) * 0.03 * smooth(2.4, 2.8, t), lookY + spring(t, fz, 0.1, 2.6, 4) * 0.4];
  const pupil = key(t, [[1.6, 1.32], [2.02, 1.32], [2.35, 0.98, 'out']]) - 0.06 * smooth(3.4, 3.9, t);
  drawYouEye(ctx, S.eye, 640, 360 - tilt * 26, 175, { lid, look, pupil, sy: 1 - tilt * 0.1 });
  ctx.restore();
  // light: dim before the god, warmer from above as it looks up
  glow(ctx, 640, -140, 760, 0.18 * smooth(3.3, 4.1, t));
  dim(ctx, A, 0.26 - 0.1 * smooth(3.3, 4.1, t), '34,20,8');
}
// ── shot 2: low, from behind; the eye opens in the gold ──────────────────────
function drawS2(ctx, A, t) {
  const S = A.S2, l = t - 4.10;
  const c = { x: 640, y: 412 - 52 * EASE.io(l / 4.52), z: 1 + 0.055 * EASE.io(l / 4.52) };
  const open = key(t, [[4.34, 0], [4.72, 0.17, 'out'], [4.98, 0.21, 'sine'], [5.78, 1.0, 'io'], [5.98, 0.985, 'sine']]);
  const bloom = smooth(4.36, 6.0, t);
  camera(ctx, A, c, 0.3);
  plate(ctx, S.gold);
  // the eye, then the glory catching the light outward
  const look = [drift(t, 0.35, 9) * 0.04, key(t, [[5.9, 0.0], [6.35, 0.36, 'io']])];
  const pupil = key(t, [[5.0, 1.18], [5.94, 1.15], [6.32, 0.86, 'out']]);
  drawGodEye(ctx, A.godEye, S.cx, S.cy, S.E / A.godEye.E, open, look, pupil, smooth(4.24, 4.44, t));
  rayLight(ctx, S.cx, S.cy, S.E, 60, 0.6, lerp(S.E * 1.2, S.E * 3.2, smooth(4.4, 6.4, t)), within(t, 4.5, 6.6, 0.3, 0.6));
  sheen(ctx, A, S.gold, { x: S.cx, y: S.cy + 40, r: lerp(260, 1200, bloom) }, 0.32 * bloom * (1 - 0.6 * smooth(6.4, 7.6, t)));
  sheen(ctx, A, S.gold, { x0: -100, y0: 0, x1: 1400, y1: 260, p: lerp(-0.1, 1.05, smooth(6.2, 8.62, t)), w: 0.22 }, 0.4 * smooth(6.0, 6.6, t));
  camera(ctx, A, c, 0.55); plate(ctx, S.land);
  camera(ctx, A, c, 1);
  // YOU from behind, head back, frozen in awe after a small recoil at "enormous"
  const recoil = key(t, [[4.36, 0], [4.6, 1, 'out'], [5.4, 0.7, 'sine']]);
  drawYou(ctx, A, S.back, { x: 640, y: 1034 + recoil * 8, h: 560, sq: 1 - recoil * 0.025, lean: -0.02 * recoil + drift(t, 0.5, 4) * 0.003, raiseL: 0.02, raiseR: 0.02 });
  glow(ctx, 640, 520, 420, 0.14 * bloom);
  dim(ctx, A, 0.42 * (1 - bloom));
}
// ── shot 3: from straight above; a star of shadows ──────────────────────────
const SPOKES = (() => {
  const r = mulberry32(31), out = [];
  for (let i = 0; i < 52; i++) {
    const a = i * 2.39996 + (r() - 0.5) * 0.5;
    const at = i === 0 ? 9.12 : i === 1 ? 9.52 : 10.64 + Math.pow((i - 2) / 50, 0.85) * 1.9 + (r() - 0.5) * 0.06;
    out.push({ a, at, len: 0.42 + r() * 0.72, w: 0.6 + r() * 0.55, f: r() * 10 });
  }
  return out;
})();
function drawS3(ctx, A, t) {
  const S = A.S3, l = t - 8.62, p = EASE.io(l / 6.02);
  const c = { x: 640, y: 380, z: lerp(1.26, 0.98, p), r: lerp(0.0, 0.13, p) };
  camera(ctx, A, c, 1); plate(ctx, S.ground);
  const fx = 640, fy = 400;
  // spokes: each a shadow from another lifetime's sun
  const fade = 1 - smooth(12.88, 13.8, t);
  for (const sp of SPOKES) {
    const ap = smooth(sp.at, sp.at + 0.45, t);
    if (ap <= 0) continue;
    const flick = 0.85 + 0.15 * Math.sin(t * 7 + sp.f);
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(sp.a); ctx.translate(16, 0); ctx.scale(sp.len * ap * (0.9 + 0.1 * fade), sp.w);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = ap * fade * flick * 0.36;
    ctx.drawImage(S.spoke.img, S.spoke.rect.x, S.spoke.rect.y, S.spoke.rect.w, S.spoke.rect.h);
    ctx.restore();
  }
  // the one shadow that stays: its own, straight down under the god
  ctx.save(); ctx.fillStyle = 'rgba(46,32,18,0.38)'; ctx.beginPath(); ctx.ellipse(fx + 4, fy + 4, 58, 50, 0, 0, TAU); ctx.fill(); ctx.restore();
  // YOU from above: the crown, the eye looking up at us (we are where the god is)
  const startle = key(t, [[9.06, 0], [9.2, 1, 'out'], [9.7, 0, 'sine']]);
  const lookDown = key(t, [[10.7, 0], [11.1, 1, 'io'], [12.88, 1], [13.3, 0, 'io']]);
  const lookA = 2.2 + 0.6 * Math.sin(t * 0.7);
  const lk = [Math.cos(lookA) * 0.75 * lookDown + drift(t, 0.6, 2) * 0.04, Math.sin(lookA) * 0.75 * lookDown];
  const blink = key(t, [[13.3, 1], [13.42, 0.05, 'in'], [13.5, 0.05], [13.72, 1, 'out']]);
  const T = S.top, h = 150, sq = 1 + startle * 0.05;
  ctx.save(); ctx.translate(fx, fy);
  for (const side of [-1, 1]) {     // arms out at the sides, seen from above
    const a = (side < 0 ? Math.PI - 0.5 : 0.5) + startle * 0.2 * side, sh = [side * 38, 4];
    const el = [sh[0] + Math.cos(a) * 26, sh[1] + Math.sin(a) * 26], hd = [el[0] + Math.cos(a + side * 0.4) * 22, el[1] + Math.sin(a + side * 0.4) * 22];
    limb(ctx, [sh, el, hd], 4.2); mitten(ctx, hd[0], hd[1], a + side * 0.4, 13, 10);
  }
  ctx.beginPath(); ctx.ellipse(-14, 46, 9, 6, 0, 0, TAU); ctx.ellipse(14, 46, 9, 6, 0, 0, TAU); ctx.fillStyle = YOU.dark; ctx.fill();
  ctx.scale(sq, sq);
  ctx.drawImage(T.img, T.rect.x, T.rect.y + 0.6 * h, T.rect.w, T.rect.h);
  drawYouEye(ctx, null, 0, 6, 25, { lid: blink, look: lk, pupil: 1.05 });
  ctx.restore();
  // gold motes drifting in the god's light, nearer the lens than the ground
  camera(ctx, A, c, 1.7);
  const rm = mulberry32(77);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) {
    const x0 = rm() * 1600 - 160, y0 = rm() * 1000 - 140, sp = 6 + rm() * 10, ph = rm() * TAU;
    const x = x0 + Math.sin(t * 0.3 + ph) * 30 + t * sp * 0.4, y = y0 + Math.cos(t * 0.23 + ph) * 22 - t * sp * 0.6;
    const a = (0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.3 + ph * 3), 2)) * 0.5, r = 2 + rm() * 3.5;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 3); gr.addColorStop(0, `rgba(255,226,150,${a})`); gr.addColorStop(1, 'rgba(255,226,150,0)');
    ctx.fillStyle = gr; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }
  ctx.restore();
  camera(ctx, A, c, 1);
  glow(ctx, fx, fy, 420, 0.16);
}
// ── shot 4: close, three-quarter: memories, then the longing ───────────────────
function drawS4(ctx, A, t) {
  const S = A.S4, l = t - 14.64, p = EASE.io(l / 7.63);
  const ex = 742, ey = 318;
  const c = { x: lerp(640, ex - 40, p), y: lerp(360, ey + 10, p), z: 1 + 0.13 * p };
  camera(ctx, A, c, 0.4); plate(ctx, S.bg);
  sheen(ctx, A, S.bg, { x0: 700, y0: -100, x1: 1400, y1: 500, p: lerp(0.0, 0.9, smooth(14.64, 22.27, t)), w: 0.3 }, 0.35);
  camera(ctx, A, c, 1);
  ctx.drawImage(S.face.img, S.face.rect.x, S.face.rect.y, S.face.rect.w, S.face.rect.h);
  const memories = within(t, 15.1, 16.25, 0.25, 0.4);
  const reflect = smooth(17.72, 18.3, t) * (0.7 + 0.3 * smooth(18.3, 22.2, t));
  const up = key(t, [[18.42, 0], [19.1, 1, 'io']]);
  const blink = key(t, [[20.3, 1], [20.43, 0.0, 'in'], [20.52, 0.0], [20.78, 1.06, 'out'], [20.95, 1.0, 'sine']]);
  const look = [0.3 + 0.08 * up + drift(t, 0.5, 8) * 0.025, -0.36 - 0.24 * up + spring(t, 20.78, 0.04, 3, 6)];
  drawYouEye(ctx, S.eye, ex, ey, 230, { lid: blink, look, pupil: 1.1 - 0.06 * up, sx: 0.86, rot: -0.16, memories, mt: t - 15.0, reflect });
  glow(ctx, 1180, -60, 700, 0.2);
}
// ── shot 5: wide from behind; the need ──────────────────────────────────────
function drawS5(ctx, A, t) {
  const S = A.S5, l = t - 22.27, p = EASE.io(l / 7.33);
  const c = { x: 640, y: lerp(400, 382, p), z: 1 + 0.07 * p };
  camera(ctx, A, c, 0.2); plate(ctx, S.gold);
  const narrow = key(t, [[25.22, 0], [25.7, 1, 'io']]);
  const look = [drift(t, 0.3, 12) * 0.03, 0.2 + 0.32 * narrow];
  drawGodEye(ctx, A.godEye, S.cx, S.cy, S.E / A.godEye.E, 1, look, 1.0 - 0.27 * narrow);
  const fall = smooth(25.86, 26.5, t);
  rayLight(ctx, S.cx, S.cy, S.E, 56, 0.6, lerp(S.E * 1.2, S.E * 3.4, smooth(25.86, 27.6, t)), within(t, 25.9, 27.8, 0.2, 0.6));
  sheen(ctx, A, S.gold, { x0: -140, y0: 100, x1: 1420, y1: -100, p: lerp(0.0, 1.0, smooth(22.27, 29.6, t)), w: 0.18 }, 0.28);
  sheen(ctx, A, S.gold, { x: 640, y: 330, r: 640 }, 0.3 * fall);
  camera(ctx, A, c, 0.36); plate(ctx, S.far);
  camera(ctx, A, c, 0.62); plate(ctx, S.mid);
  camera(ctx, A, c, 0.82); plate(ctx, S.ground);
  // YOU: weight back, one step, settle; then the arms, shoulders before elbows
  const ant = key(t, [[22.38, 0], [22.55, 1, 'io'], [22.78, 0, 'io']]);
  const stp = key(t, [[22.55, 0], [22.98, 1, 'io']]);
  const settle = spring(t, 22.98, 0.035, 2.4, 5);
  const rs = key(t, [[23.16, 0], [23.24, -0.06, 'io'], [23.74, 1, 'out'], [24.44, 1], [24.7, 1.06, 'io'], [25.2, 1.02, 'sine']]);
  const re = key(t, [[23.34, 0], [24.02, 1, 'out']]);
  const flop = spring(t, 23.8, 0.6, 2.2, 4.5);
  const tip = key(t, [[24.44, 0], [24.72, 1, 'io']]);
  const tremble = drift(t, 2.2, 6) * 0.004 * smooth(24, 25, t);
  const y = lerp(618, 603, stp) - tip * 5, h = 138 * lerp(1, 0.965, stp);
  const liftR = Math.sin(Math.PI * clamp((t - 22.58) / 0.38)) * (t > 22.58 && t < 22.96 ? 1 : 0);
  camera(ctx, A, c, 0.85);
  glow(ctx, 640, 590, 260, 0.07 + 0.14 * fall);
  drawYou(ctx, A, S.back, {
    x: 640, y, h, sq: 1 - ant * 0.05 + settle + tip * 0.035, lean: ant * -0.05 + tremble,
    footR: [0, -0.07 * liftR], raiseL: rs, raiseR: rs * 0.98, lagL: (rs - re) * 0.9 + 0.05 * flop, lagR: (rs - re) * 0.9 + 0.05 * flop, flop,
  });
  camera(ctx, A, c, 1.15); plate(ctx, S.fg);
}
// ── shot 6: the title ───────────────────────────────────────────────────────
function drawS6(ctx, A, t) {
  const S = A.S6, l = t - 29.6;
  ctx.setTransform(A.s, 0, 0, A.s, 0, 0);
  ctx.drawImage(S.bole, 0, 0, 1280, 720);
  const lay = l / 2.5, N = S.leaves.length, laid = clamp(lay) * N;
  for (let i = 0; i < N; i++) {
    const fresh = clamp(laid - i);
    if (fresh <= 0) break;
    const L = S.leaves[i];
    ctx.save(); ctx.beginPath(); polyPath(ctx, L.poly); ctx.clip();
    ctx.globalAlpha = Math.min(1, fresh * 3);
    plate(ctx, S.gold);
    ctx.restore();
  }
  drawGodEye(ctx, A.godEye, S.cx, S.cy, S.E / A.godEye.E, key(l, [[2.0, 0], [3.1, 0.62, 'io']]), [0, 0.15], 1, smooth(1.6, 2.1, l));
  const paint = smooth(2.7, 3.9, l);
  if (paint > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 140 + paint * 1000, 720); ctx.clip();
    ctx.globalAlpha = Math.min(1, paint * 1.5); ctx.drawImage(S.title, 0, 0, 1280, 720); ctx.restore();
  }
  sheen(ctx, A, S.gold, { x0: -200, y0: 0, x1: 1480, y1: 120, p: lerp(-0.1, 1.1, smooth(4.0, 6.0, l)), w: 0.16 }, 0.45 * smooth(2.5, 3.0, l));
  if (laid < N) sheen(ctx, A, S.gold, { x: S.cx, y: S.cy, r: 140 + lay * 900 }, 0.2);
}

const DRAW = { 1: drawS1, 2: drawS2, 3: drawS3, 4: drawS4, 5: drawS5, 6: drawS6 };
function shotAt(t) { for (const sh of SHOTS) if (t < sh.b) return sh; return SHOTS[SHOTS.length - 1]; }
function cueAt(t) { for (const c of CUES) if (t >= c.a && t < c.b) return c; return null; }
// subtitles: restrained, sentence case, in screen space; minPx keeps phones legible
function drawSubs(ctx, A, t, cssW) {
  const c = cueAt(t); if (!c) return;
  const a = smooth(c.a, c.a + 0.14, t) * (1 - smooth(c.b - 0.16, c.b, t));
  const px = Math.max(30, 15 * 1280 / Math.max(320, cssW || 1280));
  ctx.save(); ctx.setTransform(A.s, 0, 0, A.s, 0, 0);
  ctx.font = `500 ${px}px "EB Garamond", Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const words = c.text.split(' '), lines = []; let cur = '';
  const maxW = cssW && cssW < 700 ? 1180 : 1000;
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; }
  lines.push(cur);
  const lh = px * 1.22, y0 = 720 - 34 - (lines.length - 1) * lh;
  ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(18,10,6,0.9)'; ctx.shadowBlur = px * 0.35; ctx.shadowOffsetY = px * 0.04;
  ctx.fillStyle = '#f5ecd6';
  lines.forEach((ln, i) => ctx.fillText(ln, 640, y0 + i * lh));
  ctx.restore();
}
function renderFrame(ctx, A, t, o = {}) {
  t = clamp(t, 0, FILM.D - 1e-4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = PAGE_DARK; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
  const sh = shotAt(t);
  ctx.save(); DRAW[sh.id](ctx, A, t); ctx.restore();
  ctx.save(); ctx.setTransform(A.s, 0, 0, A.s, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.7; ctx.drawImage(A.vignette, 0, 0, 1280, 720); ctx.restore();
  if (o.subs !== false) drawSubs(ctx, A, t, o.cssW);
  const fade = smooth(36.4, 37.35, t);
  if (fade > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = fade; ctx.fillStyle = PAGE_DARK; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
}
