/* Four frames: the clear-line kit.
   One warm ink and a small family of line weights: heavier on silhouettes and near things,
   lighter inside and far away. Flat gouache fills carry a little pigment pooled at their
   edges; shading is a flat wash inside the contour. Texture is added once, when a sprite is
   baked, never per frame. */
import { TAU, mulberry32, hash2, vnoise, makeCanvas, rgb } from './core.js';

export const INK = '#28221e';
export const LW_SIL = 2.8;   // silhouettes of near things
export const LW = 2.3;       // contours
export const LW_IN = 1.35;   // interior detail
export const LW_FINE = .9;   // far detail, glazing, hatching

/* ───────── path builders: each returns c => { …path… } ───────── */
export const R = (x, y, w, h) => c => c.rect(x, y, w, h);
export const RR = (x, y, w, h, r) => c => {
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
export const PL = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
export const LN = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };
export const EL = (cx, cy, rx, ry, rot = 0) => c => c.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), rot, 0, TAU);
/** smooth closed blob through points (Catmull-Rom → Bézier) */
export const BLOB = (pts, tension = .5) => c => {
  const n = pts.length;
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  c.closePath();
};
/** open smooth curve through points */
export const CURVE = (pts, tension = .5) => c => {
  const n = pts.length; c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
};
/** a ring of points around an ellipse, for clouds and crowns */
export function bumpRing(cx, cy, rx, ry, n, seed, amp = .22, flatBottom = false) {
  const rnd = mulberry32(seed), pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + rnd() * .2;
    const r = 1 + (rnd() - .4) * amp;
    let y = cy + Math.sin(a) * ry * r;
    if (flatBottom && Math.sin(a) > .25) y = cy + ry * .55 + (rnd() - .5) * ry * .06;
    pts.push([cx + Math.cos(a) * rx * r, y]);
  }
  return pts;
}
/** scalloped outline: real bumps between ring points, the way clear-line clouds are drawn */
export const SCALLOP = (pts, bulge = .55) => c => {
  const n = pts.length; c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    c.quadraticCurveTo(mx + dy * bulge, my - dx * bulge, b[0], b[1]);
  }
  c.closePath();
};

/* pigment pooled at the edge of a flat fill: a darker, transparent version of the colour */
const poolCache = new Map();
function poolOf(col) {
  if (typeof col !== 'string') return null;
  if (poolCache.has(col)) return poolCache.get(col);
  let c = null, a = 1;
  if (col[0] === '#') c = rgb(col);
  else { const m = col.match(/rgba?\(([^)]+)\)/); if (m) { const v = m[1].split(',').map(Number); c = v.slice(0, 3); a = v[3] ?? 1; } }
  const out = c && a > .6 ? `rgba(${c[0] * .62 | 0},${c[1] * .6 | 0},${c[2] * .58 | 0},` : null;
  poolCache.set(col, out);
  return out;
}

/* ───────── the pen ───────── */
export class Pen {
  constructor(c, px) { this.c = c; this.px = px; this.pool = 1; } // px = device pixels per art unit
  begin(fn) { const c = this.c; c.beginPath(); fn(c); return c; }
  fill(col, fn, rule) { const c = this.begin(fn); c.fillStyle = col; c.fill(rule || 'nonzero'); return this; }
  ink(fn, w = LW, col = INK) {
    const c = this.begin(fn); c.lineWidth = Math.max(w, .8 / this.px); c.strokeStyle = col;
    c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); return this;
  }
  /** a gouache fill: flat colour with a little pigment pooled along the inside of its edge */
  paint(col, fn, rule, amt = this.pool) {
    this.fill(col, fn, rule);
    const pc = amt > 0 ? poolOf(col) : null;
    if (pc) {
      const c = this.c; c.save(); this.begin(fn); c.clip(rule || 'nonzero');
      c.lineJoin = 'round';
      for (const [w, a] of [[9, .045], [5, .05], [2.2, .07]]) { c.lineWidth = w; c.strokeStyle = pc + (a * amt) + ')'; c.stroke(); }
      c.restore();
    }
    return this;
  }
  shape(fn, col, w = LW, rule) { this.paint(col, fn, rule); if (w) this.ink(fn, w); return this; }
  within(clipFn, draw) { const c = this.c; c.save(); this.begin(clipFn); c.clip(); draw(this); c.restore(); return this; }
  alpha(a, draw) { const c = this.c, g = c.globalAlpha; c.globalAlpha = g * a; draw(this); c.globalAlpha = g; return this; }
  at(x, y, rot, sc, draw) { const c = this.c; c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (sc && sc !== 1) c.scale(sc, sc); draw(this); c.restore(); return this; }
  grad(x0, y0, x1, y1, stops) { const g = this.c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); return g; }
  rgrad(x, y, r0, r1, stops) { const g = this.c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([t, col]) => g.addColorStop(t, col)); return g; }
}

/* ───────── textures (device-pixel scale, generated once per page) ───────── */
let TEX = null;
function makeTextures() {
  if (TEX) return TEX;
  // gouache: soft, directional brush marks around mid-grey, applied with soft-light
  const N = 384, b = makeCanvas(N, N), bx = b.getContext('2d');
  bx.fillStyle = 'rgb(128,128,128)'; bx.fillRect(0, 0, N, N);
  const rnd = mulberry32(77);
  for (let i = 0; i < 320; i++) {
    const x = rnd() * N, y = rnd() * N, len = 40 + rnd() * 90, wdt = 12 + rnd() * 26, ang = -.25 + (rnd() - .5) * 1.4;
    const light = rnd() < .5;
    bx.strokeStyle = light ? `rgba(255,255,255,${.018 + rnd() * .028})` : `rgba(0,0,0,${.016 + rnd() * .024})`;
    bx.lineWidth = wdt; bx.lineCap = 'round';
    for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
      bx.beginPath(); bx.moveTo(x + ox, y + oy);
      bx.quadraticCurveTo(x + ox + Math.cos(ang) * len * .5 + (rnd() - .5) * 6, y + oy + Math.sin(ang) * len * .5 + (rnd() - .5) * 6, x + ox + Math.cos(ang) * len, y + oy + Math.sin(ang) * len);
      bx.stroke();
    }
  }
  const s = makeCanvas(N / 4, N / 4); s.getContext('2d').drawImage(b, 0, 0, N / 4, N / 4);
  const g = makeCanvas(N, N), gx = g.getContext('2d'); gx.imageSmoothingQuality = 'high'; gx.drawImage(s, 0, 0, N, N);
  // paper tooth: very faint, slightly clumped
  const T = 256, t = makeCanvas(T, T), tx = t.getContext('2d'), id = tx.createImageData(T, T);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const v = 128 + (hash2(x, y, 9) - .5) * 16 + (vnoise(x / 3, y / 3, 4) - .5) * 14;
    const i = (y * T + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
  }
  tx.putImageData(id, 0, 0);
  TEX = { gouache: g, tooth: t };
  return TEX;
}

/** Add gouache and paper texture to whatever is painted on `cv` (transparent stays transparent). */
export function texturize(cv, amt = 1, tooth = 1) {
  const tex = makeTextures();
  const w = cv.width, h = cv.height, tmp = makeCanvas(w, h), tx = tmp.getContext('2d');
  tx.fillStyle = tx.createPattern(tex.gouache, 'repeat'); tx.fillRect(0, 0, w, h);
  if (tooth) { tx.globalAlpha = tooth; tx.globalCompositeOperation = 'soft-light'; tx.fillStyle = tx.createPattern(tex.tooth, 'repeat'); tx.fillRect(0, 0, w, h); tx.globalAlpha = 1; }
  tx.globalCompositeOperation = 'destination-in'; tx.drawImage(cv, 0, 0);
  const c = cv.getContext('2d'); c.save(); c.globalAlpha = amt; c.globalCompositeOperation = 'soft-light'; c.drawImage(tmp, 0, 0); c.restore();
}

/** Bake a sprite: draw(pen) in art units inside the box [x0, y0, w, h]. */
export function bake(px, x0, y0, w, h, draw, opts = {}) {
  const cv = makeCanvas(w * px, h * px), c = cv.getContext('2d');
  c.setTransform(px, 0, 0, px, -x0 * px, -y0 * px);
  const pen = new Pen(c, px);
  if (opts.pool != null) pen.pool = opts.pool;
  draw(pen);
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (opts.texture !== 0) texturize(cv, opts.texture ?? 1, opts.tooth ?? 1);
  return { cv, x0, y0, w, h };
}
/** Draw a baked sprite at its art position, optionally moved, turned or squashed about a pivot. */
export function place(c, sp, px, o = {}) {
  if (!sp) return;
  const a = o.alpha ?? 1; if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  const dx = o.dx || 0, dy = o.dy || 0;
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
export const PAL = {
  wall: '#f2ecdf', wallShade: '#dfdfce', wallDeep: '#cdd0bb', base: '#f1efe5', baseShade: '#d8d6c9',
  floor: '#b07c50', floorShade: '#93623a',
  frame: '#f4f2ea', frameShade: '#d9d7cb',
  oak: '#cf9459', oakTop: '#dca86c', oakShade: '#ad733f', oakDeep: '#8f5a31',
  cork: '#c99c66', corkShade: '#b0844f', pinframe: '#8f6039', pinframeShade: '#74492a',
  lamp: '#c4523b', lampShade: '#9b3a28',
  cobalt: '#2f55b8', cobaltShade: '#22408f', vermilion: '#e0553a',
  cloud: '#fbfaf3', cloudShade: '#dfe7ea',
};
