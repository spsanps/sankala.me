/* Four frames in print: separating the drawing into a key plate and the colour plates.
   The clear-line scene is drawn through a pen that writes its line work (the dark, near-neutral
   ink) onto a key canvas and everything else onto a colour canvas, the way a printer's artwork
   is kept as separate layers. Every fill also knocks out the key beneath it, so lines stay
   hidden behind whatever is painted in front of them. */
import { Pen, LW, INK } from './ink.js';
import { makeCanvas } from './core.js';

const parseCache = new Map();
function parseColor(col) {
  if (typeof col !== 'string') return null;
  if (parseCache.has(col)) return parseCache.get(col);
  let out = null;
  if (col[0] === '#') {
    let h = col.slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    out = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  } else {
    const m = col.match(/rgba?\(([^)]+)\)/);
    if (m) { const v = m[1].split(',').map(Number); out = [v[0], v[1], v[2], v[3] ?? 1]; }
  }
  parseCache.set(col, out);
  return out;
}
const alphaOf = col => { const c = parseColor(col); return c ? c[3] : 1; };
/** Line work in dark, near-neutral ink belongs to the key plate; coloured lines stay with the colour. */
export function isKey(col) {
  const c = parseColor(col); if (!c) return false;
  const mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]);
  return mx < 92 && mx - mn < 42;
}

/* `lift` mixes flat colours toward the paper: distance and air, so the view sits behind the room */
const PAPER_LIFT = [242, 236, 223];
function liftColor(col, amt) {
  const c = parseColor(col); if (!c) return col;
  const m = i => Math.round(c[i] + (PAPER_LIFT[i] - c[i]) * amt);
  return `rgba(${m(0)},${m(1)},${m(2)},${c[3]})`;
}
export class SplitPen extends Pen {
  constructor(c, k, px, lift = 0) { super(c, px); this.k = k; this.pool = 0; this.lift = lift; }
  fill(col, fn, rule) {
    const c = this.c, k = this.k;
    if (this.lift && typeof col === 'string') col = liftColor(col, this.lift);
    c.beginPath(); fn(c); c.fillStyle = col; c.fill(rule || 'nonzero');
    const a = alphaOf(col);
    if (a > .02) { k.save(); k.globalCompositeOperation = 'destination-out'; k.globalAlpha *= Math.min(1, a * 1.15); k.beginPath(); fn(k); k.fillStyle = '#000'; k.fill(rule || 'nonzero'); k.restore(); }
    return this;
  }
  paint(col, fn, rule) { return this.fill(col, fn, rule); }
  ink(fn, w = LW, col = INK) {
    const key = isKey(col), width = Math.max(w, (key ? 1.6 : 1.1) / this.px), k = this.k, c = this.c;
    const setup = x => { x.lineWidth = width; x.lineJoin = 'round'; x.lineCap = 'round'; };
    if (key) {
      k.beginPath(); fn(k); setup(k); k.strokeStyle = `rgba(0,0,0,${Math.min(1, alphaOf(col) * 1.25)})`; k.stroke();
    } else {
      c.beginPath(); fn(c); setup(c); c.strokeStyle = col; c.stroke();
      const a = alphaOf(col);
      if (a > .3) { k.save(); k.globalCompositeOperation = 'destination-out'; k.globalAlpha *= a; k.beginPath(); fn(k); setup(k); k.strokeStyle = '#000'; k.stroke(); k.restore(); }
    }
    return this;
  }
  within(clipFn, draw) {
    const c = this.c, k = this.k;
    c.save(); k.save();
    c.beginPath(); clipFn(c); c.clip();
    k.beginPath(); clipFn(k); k.clip();
    draw(this);
    k.restore(); c.restore();
    return this;
  }
  alpha(a, draw) {
    const c = this.c, k = this.k, g = c.globalAlpha, gk = k.globalAlpha;
    c.globalAlpha = g * a; k.globalAlpha = gk * a; draw(this); c.globalAlpha = g; k.globalAlpha = gk;
    return this;
  }
  at(x, y, rot, sc, draw) {
    for (const t of [this.c, this.k]) { t.save(); t.translate(x, y); if (rot) t.rotate(rot); if (sc && sc !== 1) t.scale(sc, sc); }
    draw(this);
    this.k.restore(); this.c.restore();
    return this;
  }
}

/** A pair of transparent canvases (colour, key) sharing one transform. */
export function plateCanvases(w, h) {
  const cv = makeCanvas(w, h), kv = makeCanvas(w, h);
  return { cv, kv, c: cv.getContext('2d'), k: kv.getContext('2d') };
}
export function setBoth(p, a, b, c, d, e, f) { p.c.setTransform(a, b, c, d, e, f); p.k.setTransform(a, b, c, d, e, f); }

/** Bake a sprite as separated artwork: draw(pen) in art units inside [x0, y0, w, h]. */
export function bakeSplit(px, x0, y0, w, h, draw, lift = 0) {
  const p = plateCanvases(w * px, h * px);
  setBoth(p, px, 0, 0, px, -x0 * px, -y0 * px);
  draw(new SplitPen(p.c, p.k, px, lift));
  setBoth(p, 1, 0, 0, 1, 0, 0);
  return { cv: p.cv, kv: p.kv, x0, y0, w, h };
}

/** Lay a separated sprite onto a separated frame: colour over colour, and the key knocked out
    under the sprite's colour before its own lines go down. */
export function placeSplit(dst, sp, px, o = {}) {
  if (!sp) return;
  const a = o.alpha ?? 1; if (a <= 0) return;
  const draw = (x, img, mode) => {
    x.save(); x.globalAlpha = a; if (mode) x.globalCompositeOperation = mode;
    const dx = o.dx || 0, dy = o.dy || 0;
    if (o.rot || (o.sc && o.sc !== 1) || o.sy) {
      const pv = o.pivot || [sp.x0 + sp.w / 2, sp.y0 + sp.h];
      x.translate((pv[0] + dx) * px, (pv[1] + dy) * px);
      if (o.rot) x.rotate(o.rot);
      if (o.sc && o.sc !== 1) x.scale(o.sc, o.sc);
      if (o.sy) x.scale(1, o.sy);
      x.drawImage(img, (sp.x0 - pv[0]) * px, (sp.y0 - pv[1]) * px, sp.w * px, sp.h * px);
    } else x.drawImage(img, (sp.x0 + dx) * px, (sp.y0 + dy) * px, sp.w * px, sp.h * px);
    x.restore();
  };
  draw(dst.c, sp.cv);
  draw(dst.k, sp.cv, 'destination-out');
  draw(dst.k, sp.kv);
}
