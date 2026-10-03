'use strict';
/* Four frames — the ligne claire kit.
   One ink, one line weight family, flat gouache fills, flat shading washes. Everything is drawn
   in art units through a Pen whose context is already scaled; texture is added once, when a
   sprite is baked, never per frame. */

const INK = '#28221e';
const LW = 2.3;        // outer contour, art units
const LW_IN = 1.35;    // interior detail
const LW_FINE = .9;    // hatching on far things, window glazing

/* ───────── path builders: each returns c => { …path… } ───────── */
const R = (x, y, w, h) => c => c.rect(x, y, w, h);
const RR = (x, y, w, h, r) => c => {
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
const PL = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
const LN = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };
const EL = (cx, cy, rx, ry, rot = 0) => c => c.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), rot, 0, TAU);
const ARC = (cx, cy, rx, ry, a0, a1, rot = 0) => c => c.ellipse(cx, cy, rx, ry, rot, a0, a1);
const MULTI = (...fns) => c => fns.forEach(f => f(c));
// smooth closed blob through points (Catmull-Rom → Bézier)
const BLOB = (pts, tension = .5) => c => {
  const n = pts.length;
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  c.closePath();
};
// open smooth curve
const CURVE = (pts, tension = .5) => c => {
  const n = pts.length; c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
};
// a cloud or a canopy: a ring of bumps around an ellipse
function bumpRing(cx, cy, rx, ry, n, seed, amp = .22, flatBottom = false) {
  const rnd = mulberry32(seed), pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + rnd() * .2;
    let r = 1 + (rnd() - .4) * amp;
    let y = cy + Math.sin(a) * ry * r;
    if (flatBottom && Math.sin(a) > .25) y = cy + ry * .55 + (rnd() - .5) * ry * .06;
    pts.push([cx + Math.cos(a) * rx * r, y]);
  }
  return pts;
}
// scalloped outline: real bumps (arcs) between ring points, the way clear-line clouds and trees are drawn
const SCALLOP = (pts, bulge = .55) => c => {
  const n = pts.length; c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    // control point pushed outward (to the left of the direction of travel for a clockwise ring)
    c.quadraticCurveTo(mx + dy * bulge, my - dx * bulge, b[0], b[1]);
  }
  c.closePath();
};

/* ───────── the pen ───────── */
class Pen {
  constructor(c, px) { this.c = c; this.px = px; } // px = device pixels per art unit
  begin(fn) { const c = this.c; c.beginPath(); fn(c); return c; }
  fill(col, fn, rule) { const c = this.begin(fn); c.fillStyle = col; c.fill(rule || 'nonzero'); return this; }
  ink(fn, w = LW, col = INK) {
    const c = this.begin(fn); c.lineWidth = Math.max(w, .8 / this.px); c.strokeStyle = col;
    c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); return this;
  }
  shape(fn, col, w = LW, rule) { this.fill(col, fn, rule); if (w) this.ink(fn, w); return this; }
  /** flat wash clipped to a parent shape */
  within(clipFn, draw) { const c = this.c; c.save(); this.begin(clipFn); c.clip(); draw(this); c.restore(); return this; }
  alpha(a, draw) { const c = this.c, g = c.globalAlpha; c.globalAlpha = g * a; draw(this); c.globalAlpha = g; return this; }
  mode(m, draw) { const c = this.c, o = c.globalCompositeOperation; c.globalCompositeOperation = m; draw(this); c.globalCompositeOperation = o; return this; }
  at(x, y, rot, sc, draw) { const c = this.c; c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (sc && sc !== 1) c.scale(sc, sc); draw(this); c.restore(); return this; }
  grad(x0, y0, x1, y1, stops) { const g = this.c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); return g; }
  rgrad(x, y, r0, r1, stops) { const g = this.c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([t, col]) => g.addColorStop(t, col)); return g; }
}

/* ───────── textures (device-pixel scale, generated once) ───────── */
const TEX = {};
function makeTextures() {
  if (TEX.ready) return TEX;
  // gouache: soft, directional brush marks around mid-grey, for soft-light
  const N = 384, b = makeCanvas(N, N), bx = b.getContext('2d');
  bx.fillStyle = 'rgb(128,128,128)'; bx.fillRect(0, 0, N, N);
  const rnd = mulberry32(77);
  for (let i = 0; i < 300; i++) {
    const x = rnd() * N, y = rnd() * N, len = 40 + rnd() * 90, wdt = 14 + rnd() * 26, ang = -.25 + (rnd() - .5) * 1.4;
    const light = rnd() < .5;
    bx.strokeStyle = light ? `rgba(255,255,255,${.018 + rnd() * .026})` : `rgba(0,0,0,${.016 + rnd() * .022})`;
    bx.lineWidth = wdt; bx.lineCap = 'round';
    for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
      bx.beginPath(); bx.moveTo(x + ox, y + oy);
      bx.quadraticCurveTo(x + ox + Math.cos(ang) * len * .5 + (rnd() - .5) * 6, y + oy + Math.sin(ang) * len * .5 + (rnd() - .5) * 6, x + ox + Math.cos(ang) * len, y + oy + Math.sin(ang) * len);
      bx.stroke();
    }
  }
  // soften: down and up
  const s = makeCanvas(N / 4, N / 4); s.getContext('2d').drawImage(b, 0, 0, N / 4, N / 4);
  const g = makeCanvas(N, N), gx = g.getContext('2d'); gx.imageSmoothingQuality = 'high'; gx.drawImage(s, 0, 0, N, N);
  TEX.gouache = g;
  // paper tooth: very faint, slightly clumped
  const T = 256, t = makeCanvas(T, T), tx = t.getContext('2d'), id = tx.createImageData(T, T);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const v = 128 + (hash2(x, y, 9) - .5) * 16 + (vnoise(x / 3, y / 3, 4) - .5) * 14;
    const i = (y * T + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
  }
  tx.putImageData(id, 0, 0);
  TEX.tooth = t;
  TEX.ready = true;
  return TEX;
}

/** Add gouache and paper texture to whatever is painted on canvas `cv` (transparent stays transparent). */
function texturize(cv, amt = 1, tooth = 1) {
  makeTextures();
  const w = cv.width, h = cv.height, tmp = makeCanvas(w, h), tx = tmp.getContext('2d');
  tx.fillStyle = tx.createPattern(TEX.gouache, 'repeat'); tx.fillRect(0, 0, w, h);
  if (tooth) { tx.globalAlpha = tooth; tx.globalCompositeOperation = 'soft-light'; tx.fillStyle = tx.createPattern(TEX.tooth, 'repeat'); tx.fillRect(0, 0, w, h); tx.globalAlpha = 1; }
  tx.globalCompositeOperation = 'destination-in'; tx.drawImage(cv, 0, 0);
  const c = cv.getContext('2d'); c.save(); c.globalAlpha = amt; c.globalCompositeOperation = 'soft-light'; c.drawImage(tmp, 0, 0); c.restore();
}

/** Bake a sprite: draw(pen) in absolute art units inside box [x0,y0,w,h]; returns { cv, x0, y0, w, h }. */
function bake(px, x0, y0, w, h, draw, opts = {}) {
  const cv = makeCanvas(w * px, h * px), c = cv.getContext('2d');
  c.setTransform(px, 0, 0, px, -x0 * px, -y0 * px);
  draw(new Pen(c, px));
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (opts.texture !== 0) texturize(cv, opts.texture ?? 1, opts.tooth ?? 1);
  return { cv, x0, y0, w, h };
}
/** Draw a baked sprite at its art position, with an optional offset/rotation/scale about a pivot. */
function place(c, sp, px, o = {}) {
  if (!sp) return;
  const a = o.alpha ?? 1; if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  const dx = (o.dx || 0), dy = (o.dy || 0);
  if (o.rot || (o.sc && o.sc !== 1) || o.sy) {
    const pv = o.pivot || [sp.x0 + sp.w / 2, sp.y0 + sp.h];
    c.translate((pv[0] + dx) * px, (pv[1] + dy) * px);
    if (o.rot) c.rotate(o.rot);
    if (o.sc && o.sc !== 1) c.scale(o.sc, o.sc);
    if (o.sy) c.scale(1, o.sy);
    c.drawImage(sp.cv, (sp.x0 - pv[0]) * px, (sp.y0 - pv[1]) * px, sp.w * px, sp.h * px);
  } else {
    c.drawImage(sp.cv, (sp.x0 + dx) * px, (sp.y0 + dy) * px, sp.w * px, sp.h * px);
  }
  c.restore();
}

/* ───────── shared palette ───────── */
const PAL = {
  wall: '#dfe3d0', wallShade: '#c7cdb6', wallDeep: '#b3baa2', base: '#f1efe5', baseShade: '#d8d6c9',
  floor: '#b07c50', floorShade: '#93623a',
  frame: '#f4f2ea', frameShade: '#d9d7cb', glassEdge: '#c9d8de',
  oak: '#cf9459', oakTop: '#dca86c', oakShade: '#ad733f', oakDeep: '#8f5a31',
  cork: '#c99c66', corkShade: '#b0844f', pinframe: '#8f6039', pinframeShade: '#74492a',
  lamp: '#c4523b', lampShade: '#9b3a28', steel: '#b8bdbf', steelShade: '#8c9295',
  paper: '#fbf9f1', paperShade: '#e4e0d2',
  cobalt: '#2f55b8', cobaltShade: '#22408f', vermilion: '#e0553a',
  sky: '#a7cde3', skyHigh: '#8ebcd9', cloud: '#fbfaf3', cloudShade: '#dfe7ea',
};
