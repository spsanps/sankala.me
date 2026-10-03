/* Four frames in mosaic: the cartoon.
   A mosaicist works from a cartoon: the shapes, their colours and the lines the stones must
   follow. The homepage's drawing code is replayed through this pen, which keeps only what a
   cartoon needs, on three sheets:
     base  the solid colour fields (they decide where one field of stones meets another)
     col   the colours the stones are matched to (fields plus soft shading and small details)
     line  the ink outlines, where a row of dark stones will be laid
   Hairlines, wood grain, glints and textures are left out: stones cannot carry them. */
import { LW_IN } from './ink.js';
import { Flatten } from './paths.js';

function parseColor(col) {
  if (typeof col !== 'string') return null;
  if (col[0] === '#') {
    const h = col.length === 4 ? col.slice(1).split('').map(x => x + x).join('') : col.slice(1, 7);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const m = col.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const v = m[1].split(',').map(Number);
  return [v[0], v[1], v[2], v[3] ?? 1];
}
const lum = c => (c[0] * .299 + c[1] * .587 + c[2] * .114) / 255;
const PATH_OPS = ['moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'closePath', 'roundRect'];
const XFORM_OPS = ['save', 'restore', 'translate', 'rotate', 'scale', 'setTransform', 'transform', 'resetTransform'];

/** A context that builds paths and transforms on all three sheets, and draws details on `col`. */
function makeProxy(pen) {
  const all = pen.all;
  const px = {};
  for (const op of PATH_OPS) px[op] = (...a) => { for (const c of all) c[op](...a); };
  for (const op of XFORM_OPS) px[op] = (...a) => { for (const c of all) c[op](...a); };
  px.beginPath = () => { for (const c of all) c.beginPath(); };
  px.clip = (...a) => { for (const c of all) c.clip(...a); };
  // details drawn straight onto the context (flecks, stars) colour the stones but make no field
  px.fill = (...a) => pen.C.fill(...a);
  px.stroke = () => pen.C.stroke();
  px.fillRect = (...a) => pen.C.fillRect(...a);
  px.drawImage = (...a) => pen.C.drawImage(...a);
  px.createLinearGradient = (...a) => pen.C.createLinearGradient(...a);
  px.createRadialGradient = (...a) => pen.C.createRadialGradient(...a);
  for (const prop of ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha', 'globalCompositeOperation', 'filter', 'font', 'textAlign', 'textBaseline']) {
    Object.defineProperty(px, prop, { get: () => pen.C[prop], set: v => { pen.C[prop] = v; } });
  }
  px.fillText = (...a) => pen.C.fillText(...a);
  return px;
}

export class CartoonPen {
  /** ctxs: { base, col, line } 2D contexts sharing one transform; px: sheet pixels per art unit */
  constructor(ctxs, px) {
    this.B = ctxs.base; this.C = ctxs.col; this.L = ctxs.line; this.px = px; this.pool = 0;
    // the sheets may be one and the same context (a footprint); transforms must apply once each
    this.all = [...new Set([this.B, this.C, this.L])];
    this.c = makeProxy(this);
    this.lines = [];  // the ink outlines as polylines in sheet pixels, for walking stones along
    this.L.strokeStyle = '#fff'; this.L.lineCap = 'round'; this.L.lineJoin = 'round';
  }
  begin(fn) { for (const x of this.all) x.beginPath(); fn(this.c); return this.c; }
  opaque(col) {
    if (this.C.globalAlpha < .85) return false;
    if (typeof col === 'string') { const c = parseColor(col); return !!c && c[3] >= .85; }
    return !!(col && col.__opaque);
  }
  faint(col) {
    // washes too faint to change a stone's colour are not worth rasterising
    const ga = this.C.globalAlpha;
    if (typeof col === 'string') { const c = parseColor(col); return !c || c[3] * ga < .12; }
    return !!(col && col.__faint) || ga < .12;
  }
  fill(col, fn, rule) {
    if (this.faint(col)) return this;
    this.begin(fn);
    this.C.fillStyle = col; this.C.fill(rule || 'nonzero');
    if (this.opaque(col)) { this.B.fillStyle = col; this.B.fill(rule || 'nonzero'); }
    return this;
  }
  paint(col, fn, rule) { return this.fill(col, fn, rule); }
  ink(fn, w = 2.3, col = '#28221e') {
    const c = parseColor(col), a = (c ? c[3] : 1) * this.C.globalAlpha;
    if (!c) return this;
    if (lum(c) < .32 && a > .45 && w >= LW_IN * .95) {
      // an outline the stones will follow: one sheet pixel wide on the line sheet
      this.begin(fn); this.L.lineWidth = 1.25 / this.px; this.L.stroke();
      const f = new Flatten(this.L.getTransform()); fn(f); f.end(); for (const l of f.out) this.lines.push(l);
    } else if (lum(c) >= .32 && a > .6 && w >= 2) {
      // a coloured stroke that is really a shape (a lamp arm, a cord): a field of its own
      this.begin(fn);
      for (const x of [this.C, this.B]) { x.lineWidth = w; x.strokeStyle = col; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(); }
    }
    return this;
  }
  shape(fn, col, w = 2.3, rule) { this.fill(col, fn, rule); if (w) this.ink(fn, w); return this; }
  within(clipFn, draw) {
    for (const x of this.all) x.save();
    this.begin(clipFn); for (const x of this.all) x.clip();
    draw(this);
    for (const x of this.all) x.restore();
    return this;
  }
  alpha(a, draw) { const g = this.C.globalAlpha; this.C.globalAlpha = g * a; draw(this); this.C.globalAlpha = g; return this; }
  at(x, y, rot, sc, draw) {
    for (const c of this.all) { c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (sc && sc !== 1) c.scale(sc, sc); }
    draw(this);
    for (const c of this.all) c.restore();
    return this;
  }
  grad(x0, y0, x1, y1, stops) {
    const g = this.C.createLinearGradient(x0, y0, x1, y1); let op = true;
    let mx = 0; stops.forEach(([t, col]) => { g.addColorStop(t, col); const c = parseColor(col); if (!c || c[3] < .85) op = false; if (c) mx = Math.max(mx, c[3]); });
    g.__opaque = op; g.__faint = mx < .2; return g;
  }
  rgrad(x, y, r0, r1, stops) {
    const g = this.C.createRadialGradient(x, y, r0, x, y, r1); let op = true;
    let mx = 0; stops.forEach(([t, col]) => { g.addColorStop(t, col); const c = parseColor(col); if (!c || c[3] < .85) op = false; if (c) mx = Math.max(mx, c[3]); });
    g.__opaque = op; g.__faint = mx < .2; return g;
  }
}

/** A pen that only marks where something is (for the photographs' footprints). */
export class FootprintPen extends CartoonPen {
  // a footprint never copies the photograph itself (that would also taint the sheet for reading)
  constructor(ctxs, px) { super(ctxs, px); this.c.drawImage = () => {}; }
  fill(col, fn, rule) { this.begin(fn); this.C.fillStyle = '#fff'; this.C.fill(rule || 'nonzero'); return this; }
  ink() { return this; }
}
