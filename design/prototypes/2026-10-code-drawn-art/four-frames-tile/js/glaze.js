/* Four frames in tile: the glaze kit.

   DESIGN
   The desk is re-painted the way a tile painter works on raw tin glaze, then fired onto a wall
   of hand-made tiles.
   - One pigment does almost everything: cobalt, in four dilutions (pale wash, mid wash, deep
     wash, the dark "trek" outline). Antimony ochre and copper green appear only as accents on
     things that are warm or alive (the lamp, the robot's ear, a pot, a plant).
   - White is never painted. It is the glaze left bare (reserved), and light marks laid over
     paint (glints, stars, a lighthouse beam) are scratched back out of the pigment.
   - Washes pool at their edges and carry brush marks; outlines swell and thin with pressure and
     bleed a little into the glaze.
   - The painting is then fired onto square tiles: each tile is set slightly off true, its glaze
     a shade warmer or cooler than its neighbours, with grout between, a pillowed edge, a soft
     gloss, the odd crackle, pinhole and chipped corner.
   Refused: a grid laid over a finished picture, gradients standing in for washes, glossy
   plastic highlights, more than a touch of colour beyond cobalt.

   Palette (as each dilution reads on white glaze):
     cobalt  #c6d3ec #86a0d4 #3d5eae #1d3278, outline #16276a
     ochre   #f4dfa8 #e8b65a #cf8a2c #94561c, outline #7a4314
     green   #d3e3bd #a2c47f #6a9a50 #3e6a36, outline #2f5530
     glaze   #f7f3e8 (±2% per tile), grout #cfc7b5, biscuit #c98f6a
*/
import { TAU, mulberry32, hash2, vnoise, makeCanvas, clamp, smooth } from './core.js';

/* ───────── colour → glaze ───────── */
export const TONES = {
  cobalt: ['#cbd8f0', '#7f9ad6', '#3657ad', '#1a2f7a'],
  ochre: ['#f4dfa8', '#e8b65a', '#cf8a2c', '#94561c'],
  green: ['#d3e3bd', '#a2c47f', '#6a9a50', '#3e6a36'],
};
export const OUTLINE = { cobalt: '#13235f', ochre: '#7a4314', green: '#2f5530' };
const hexRGB = h => { h = h.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const TONE_RGB = Object.fromEntries(Object.entries(TONES).map(([k, v]) => [k, v.map(hexRGB)]));

let probe = null;
const parseCache = new Map();
function parse(col) {
  if (typeof col !== 'string') return null;
  let v = parseCache.get(col); if (v) return v;
  const s = col.trim();
  if (s[0] === '#') { const c = hexRGB(s); v = [c[0], c[1], c[2], 1]; }
  else {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map(Number); v = [p[0], p[1], p[2], p[3] ?? 1]; }
    else { // named colours, resolved once by the browser
      probe = probe || makeCanvas(1, 1).getContext('2d');
      probe.fillStyle = '#000'; probe.fillStyle = s; const r = probe.fillStyle;
      v = r[0] === '#' ? [...hexRGB(r), 1] : parse(r) || [0, 0, 0, 1];
    }
  }
  parseCache.set(col, v);
  return v;
}

/** How a colour of the clear-line drawing is painted in glaze. */
export function glazeOf(col, accents = true, cuts = CUTS) {
  const p = parse(col); if (!p) return null;
  const [r, g, b, a] = p, V = (.2126 * r + .7152 * g + .0722 * b) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
  let h = 0;
  if (mx !== mn) { const d = mx - mn; h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
  let fam = 'cobalt';
  if (accents && s > .62 && V > .22 && (h < 21 || h > 340 || (h > 37 && h < 56))) fam = 'ochre';
  else if (accents && s > .3 && h > 72 && h < 168) fam = 'green';
  const tone = V > cuts[0] ? 0 : V > cuts[1] ? 1 : V > cuts[2] ? 2 : V > cuts[3] ? 3 : 4;
  return { fam, tone, a, V, h, s };
}
/* where the room's colours break into dilutions; landscapes are painted with more steps of tone
   in the middle, so hills, valley and trees separate */
export const CUTS = [.76, .58, .42, .27];
export const VIEW_CUTS = [.8, .69, .55, .36];
const toneCss = (fam, tone, a) => { const c = TONE_RGB[fam][tone - 1]; return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

/* ───────── a canvas context that paints in glaze ─────────
   It stands in for a 2D context: every path goes to two real canvases, the WASH (flat
   dilutions of pigment) and the LINE (the brushed outline). Fills become washes, strokes become
   outline; anything white is reserved or scratched out; an opaque wash covers the outlines
   behind it, so the painter's order of the clear-line drawing still holds. */
class FakeGrad {
  constructor(kind, args) { this.kind = kind; this.args = args; this.stops = []; }
  addColorStop(t, c) { this.stops.push([t, c]); }
}
const FWD_PATH = ['beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'roundRect'];
const FWD_STATE = ['translate', 'rotate', 'scale', 'transform', 'setTransform', 'resetTransform'];

export class GlazeCtx {
  constructor(wash, line, { accents = true, lineScale = 1.18, cuts = CUTS } = {}) {
    this.w = wash; this.l = line; this.accents = accents; this.lineScale = lineScale; this.cuts = cuts; this.skyStrokes = false;
    this._fill = '#000'; this._stroke = '#000'; this._gco = 'source-over'; this._lw = 1; this._stack = [];
    for (const m of FWD_PATH) this[m] = (...a) => { this.w[m](...a); this.l[m](...a); };
    for (const m of FWD_STATE) this[m] = (...a) => { this.w[m](...a); this.l[m](...a); };
  }
  get canvas() { return this.w.canvas; }
  save() { this.w.save(); this.l.save(); this._stack.push([this._fill, this._stroke, this._gco, this._lw]); }
  restore() { this.w.restore(); this.l.restore(); const s = this._stack.pop(); if (s) [this._fill, this._stroke, this._gco, this._lw] = s; }
  clip(rule) { this.w.clip(rule || 'nonzero'); this.l.clip(rule || 'nonzero'); }
  getTransform() { return this.w.getTransform(); }
  measureText(t) { return this.w.measureText(t); }
  createLinearGradient(...a) { return new FakeGrad('lin', a); }
  createRadialGradient(...a) { return new FakeGrad('rad', a); }
  createPattern() { return null; }
  drawImage() { /* photographs stay real; they are hung over the tiles, not painted */ }
  set fillStyle(v) { this._fill = v; } get fillStyle() { return this._fill; }
  set strokeStyle(v) { this._stroke = v; } get strokeStyle() { return this._stroke; }
  set globalCompositeOperation(v) { this._gco = v; } get globalCompositeOperation() { return this._gco; }
  set globalAlpha(v) { this.w.globalAlpha = v; this.l.globalAlpha = v; } get globalAlpha() { return this.w.globalAlpha; }
  set lineWidth(v) { this._lw = v; } get lineWidth() { return this._lw; }
  set lineCap(v) { this.w.lineCap = v; this.l.lineCap = v; } get lineCap() { return this.w.lineCap; }
  set lineJoin(v) { this.w.lineJoin = v; this.l.lineJoin = v; } get lineJoin() { return this.w.lineJoin; }
  set miterLimit(v) { this.w.miterLimit = v; this.l.miterLimit = v; }
  set font(v) { this.w.font = v; } set textAlign(v) { this.w.textAlign = v; } set textBaseline(v) { this.w.textBaseline = v; }
  set filter(v) { /* no filters in glaze */ } set shadowBlur(v) {} set shadowColor(v) {} set shadowOffsetX(v) {} set shadowOffsetY(v) {}
  set imageSmoothingEnabled(v) {} set imageSmoothingQuality(v) {}

  _light() { return this._gco === 'screen' || this._gco === 'lighter' || this._gco === 'soft-light' || this._gco === 'overlay'; }
  /* a solid colour or a gradient, as {mode, style} for the wash or the line */
  _resolve(raw, target) {
    const ctx = target === 'line' ? this.l : this.w;
    if (raw instanceof FakeGrad) {
      const infos = raw.stops.map(([t, c]) => [t, glazeOf(c, this.accents, this.cuts)]);
      const light = this._light();
      const reserveAll = infos.every(([, i]) => !i || i.tone === 0);
      const g = raw.kind === 'lin' ? ctx.createLinearGradient(...raw.args) : ctx.createRadialGradient(...raw.args);
      // a faint tint (the plaster's shading, a breath of shadow) is not a wash at all
      if (!light && !reserveAll && Math.max(...infos.map(([, i]) => (i ? i.a : 0))) * this.w.globalAlpha < .2) return { mode: 'skip' };
      if (light || reserveAll) {
        for (const [t, i] of infos) g.addColorStop(t, `rgba(0,0,0,${i ? i.a * (light ? i.V : 1) : 0})`);
        return { mode: 'erase', style: g };
      }
      let last = infos.find(([, i]) => i && i.tone > 0)[1];
      for (const [t, i] of infos) {
        if (i && i.tone > 0) { last = i; g.addColorStop(t, toneCss(i.fam, i.tone, i.a)); }
        else g.addColorStop(t, toneCss(last.fam, last.tone, 0));
      }
      return { mode: 'paint', style: g, opaque: false };
    }
    const i = glazeOf(raw, this.accents, this.cuts);
    if (!i) return { mode: 'skip' };
    if (this._light()) return { mode: 'erase', style: `rgba(0,0,0,${i.a * i.V})` };
    if (i.tone === 0) return { mode: 'erase', style: `rgba(0,0,0,${i.a})`, opaque: i.a * this.w.globalAlpha > .94 };
    if (target === 'wash' && i.a * this.w.globalAlpha < .2) return { mode: 'skip' };
    if (target === 'line') return { mode: 'paint', style: i.V < .36 ? OUTLINE[i.fam] : toneCss(i.fam, i.tone, 1), alpha: i.a };
    return { mode: 'paint', style: toneCss(i.fam, i.tone, i.a), opaque: i.a * this.w.globalAlpha > .94 };
  }
  _apply(ctx, gco, style, op) { const o = ctx.globalCompositeOperation; ctx.globalCompositeOperation = gco; op(ctx, style); ctx.globalCompositeOperation = o; }
  /* a daylight sky is not washed: the glaze is left white and the sky laid in with horizontal
     strokes of pale cobalt, closer together toward the top, as tile painters do */
  _isSky(raw) {
    if (!this.skyStrokes || !(raw instanceof FakeGrad) || raw.kind !== 'lin' || this._light()) return false;
    const [x0, y0, x1, y1] = raw.args; if (Math.abs(x1 - x0) > 1 || y1 - y0 < 60) return false;
    const infos = raw.stops.map(([, c]) => glazeOf(c, false, this.cuts)).filter(Boolean);
    if (!infos.length || infos[0].h < 170 || infos[0].h > 250) return false;
    return Math.min(...infos.map(i => i.V)) > .42 ? 'day' : 'night';
  }
  /* a night sky is one even, deep wash, lighter toward the horizon, so the dark shapes of the
     land, the palms and the lighthouse can still be painted against it in the darkest blue */
  _nightSky(raw, rule) {
    const [x0, y0, x1, y1] = raw.args, c = this.w, g = c.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, toneCss('cobalt', 3, 1)); g.addColorStop(.55, toneCss('cobalt', 3, .86)); g.addColorStop(1, toneCss('cobalt', 2, .9));
    c.save(); c.fillStyle = g; c.fill(rule); c.restore();
  }
  _sky(raw, rule) {
    const [, y0, , y1] = raw.args, c = this.w, rnd = mulberry32(((y0 * 13 + y1) | 0) + 7);
    c.save(); c.fillStyle = '#000'; c.globalCompositeOperation = 'destination-out'; c.fill(rule); c.restore();
    c.save(); c.clip(rule);
    c.lineCap = 'round'; c.strokeStyle = toneCss('cobalt', 1, 1);
    const top = Math.min(y0, -5), span = y1 - top;
    for (let y = top + 8; y < y1 - 6; y += 12 + rnd() * 9) {
      const k = 1 - (y - top) / span, density = .1 + .62 * k * k;
      for (let x = -40 + rnd() * 60; x < 1040;) {
        const len = 50 + rnd() * 170;
        if (rnd() < density) {
          c.globalAlpha = .6 + rnd() * .4; c.lineWidth = 1.8 + rnd() * 2.4 * (.5 + k);
          const dy = (rnd() - .5) * 3;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + len / 2, y + dy - 1.5, x + len, y + dy); c.stroke();
        }
        x += len + 30 + rnd() * 110;
      }
    }
    c.restore();
  }
  fill(rule) {
    rule = rule || 'nonzero';
    const sky = this._isSky(this._fill);
    if (sky === 'day') { this._sky(this._fill, rule); return; }
    if (sky === 'night') { this._nightSky(this._fill, rule); return; }
    const r = this._resolve(this._fill, 'wash');
    if (r.mode === 'skip') return;
    const doFill = (c, s) => { c.fillStyle = s; c.fill(rule); };
    if (r.mode === 'erase') {
      this._apply(this.w, 'destination-out', r.style, doFill);
      if (r.opaque) this._apply(this.l, 'destination-out', '#000', doFill);
      return;
    }
    this._apply(this.w, 'source-over', r.style, doFill);
    if (r.opaque) this._apply(this.l, 'destination-out', '#000', doFill);
  }
  stroke() {
    const r = this._resolve(this._stroke, 'line');
    if (r.mode === 'skip') return;
    const lw = this._lw;
    if (r.mode === 'erase') {
      const doS = (c, s) => { c.lineWidth = lw; c.strokeStyle = s; c.stroke(); };
      this._apply(this.w, 'destination-out', r.style, doS);
      this._apply(this.l, 'destination-out', r.style, doS);
      return;
    }
    const a = r.alpha ?? 1, ga = this.l.globalAlpha;
    this.l.globalAlpha = ga * a;
    this._apply(this.l, 'source-over', r.style, (c, s) => {
      c.strokeStyle = s;
      c.lineWidth = lw * this.lineScale; c.stroke();
      const g2 = c.globalAlpha; c.globalAlpha = g2 * .22; c.lineWidth = lw * this.lineScale * 1.45; c.stroke(); c.globalAlpha = g2;
    });
    this.l.globalAlpha = ga;
  }
  fillRect(x, y, w, h) {
    const r = this._resolve(this._fill, 'wash');
    if (r.mode === 'skip') return;
    const doR = (c, s) => { c.fillStyle = s; c.fillRect(x, y, w, h); };
    if (r.mode === 'erase') { this._apply(this.w, 'destination-out', r.style, doR); if (r.opaque) this._apply(this.l, 'destination-out', '#000', doR); return; }
    this._apply(this.w, 'source-over', r.style, doR);
    if (r.opaque) this._apply(this.l, 'destination-out', '#000', doR);
  }
  strokeRect(x, y, w, h) { this.beginPath(); this.rect(x, y, w, h); this.stroke(); }
  clearRect(x, y, w, h) { this.w.clearRect(x, y, w, h); this.l.clearRect(x, y, w, h); }
  fillText() {} strokeText() {}
}

/* ───────── textures, generated once ───────── */
let TEX = null;
function textures() {
  if (TEX) return TEX;
  // brush marks inside a wash: soft strokes, mostly diagonal like a loaded brush laid flat
  const N = 320, b = makeCanvas(N, N), bx = b.getContext('2d');
  bx.fillStyle = 'rgb(128,128,128)'; bx.fillRect(0, 0, N, N);
  const rnd = mulberry32(41);
  for (let i = 0; i < 420; i++) {
    const x = rnd() * N, y = rnd() * N, len = 14 + rnd() * 40, w = 3 + rnd() * 9, ang = -.7 + (rnd() - .5) * 1.6;
    const dark = rnd() < .55;
    for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
      bx.strokeStyle = dark ? `rgba(0,0,0,${.05 + rnd() * .07})` : `rgba(255,255,255,${.05 + rnd() * .07})`;
      bx.lineWidth = w; bx.lineCap = 'round'; bx.beginPath(); bx.moveTo(x + ox, y + oy);
      bx.quadraticCurveTo(x + ox + Math.cos(ang) * len * .5 + (rnd() - .5) * 8, y + oy + Math.sin(ang) * len * .5 + (rnd() - .5) * 8, x + ox + Math.cos(ang) * len, y + oy + Math.sin(ang) * len);
      bx.stroke();
    }
  }
  const s = makeCanvas(N / 2, N / 2); s.getContext('2d').drawImage(b, 0, 0, N / 2, N / 2);
  const g = makeCanvas(N, N), gx = g.getContext('2d'); gx.imageSmoothingQuality = 'high'; gx.drawImage(s, 0, 0, N, N);
  const brush = new Float32Array(N * N), d = gx.getImageData(0, 0, N, N).data;
  for (let k = 0; k < N * N; k++) brush[k] = d[k * 4] / 255 - .5;
  TEX = { N, brush };
  return TEX;
}

/* ───────── after painting: what the pigment does on raw glaze ───────── */
const blurInto = (src, r) => {
  const c = makeCanvas(src.width, src.height), x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.filter = `blur(${r}px)`; x.drawImage(src, 0, 0); x.filter = 'none';
  return c;
};
/**
 * Compose WASH and LINE into one painted sheet (white where the glaze stays bare):
 * washes mottled by the brush and darker where they pooled at their edges, outlines loaded
 * unevenly along their length, everything bleeding a fraction into the glaze.
 */
export async function finishPainting(wash, line, dpr, alive = () => true) {
  // the pixel passes yield to the browser every ~30 ms, so scrolling never stalls
  let tq = performance.now();
  const breathe = async () => { if (performance.now() - tq > 30) { await new Promise(r => setTimeout(r, 0)); tq = performance.now(); } return alive(); };
  const W = wash.width, H = wash.height, tex = textures(), N = tex.N;
  // the wash on white, and a softened copy to find where the pigment pooled at its edges
  const src = makeCanvas(W, H), sx = src.getContext('2d', { willReadFrequently: true });
  sx.fillStyle = '#fff'; sx.fillRect(0, 0, W, H);
  sx.filter = `blur(${.35 * dpr}px)`; sx.drawImage(wash, 0, 0); sx.filter = 'none';
  const S = sx.getImageData(0, 0, W, H).data;
  const B = blurInto(wash, 2.2 * dpr).getContext('2d').getImageData(0, 0, W, H).data;
  const flat = makeCanvas(W, H), fx = flat.getContext('2d', { willReadFrequently: true });
  const O = fx.createImageData(W, H), o = O.data;
  const inv = 1 / dpr, amp = 1.9 * dpr, k8 = 1 / 17;
  // dilutions a painter actually mixes: the wash settles into a few flat strengths
  const LV = [0, .2, .44, .7, .88];
  for (let y = 0; y < H; y++) {
    if (!(y & 15) && !(await breathe())) return null;
    const yy = y * inv, ty = ((yy * 1.6) | 0) % N;
    for (let x = 0; x < W; x++) {
      const xx = x * inv, i = (y * W + x) * 4;
      // the wash never quite sits on the drawing: a slow, wandering misregistration
      const wx = (vnoise(xx * k8, yy * k8, 21) - .5) * 2 * amp, wy = (vnoise(xx * k8, yy * k8, 22) - .5) * 2 * amp;
      let px = (x + wx) | 0, py = (y + wy) | 0;
      if (px < 0) px = 0; else if (px >= W) px = W - 1;
      if (py < 0) py = 0; else if (py >= H) py = H - 1;
      const j = (py * W + px) * 4;
      const r = S[j], g = S[j + 1], b = S[j + 2];
      if (r > 250 && g > 250 && b > 250) { o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255; continue; }
      const dA = 1 - (.2126 * r + .7152 * g + .0722 * b) / 255;
      // a breath of pigment is not a wash: faint shading leaves the glaze bare
      if (dA < .085) { o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255; continue; }
      // edges wander and break up a little before the wash settles into its strength
      const grain = ((vnoise(xx / 9, yy / 9, 6) - .5) * .1 + (vnoise(xx / 2.2, yy / 2.2, 8) - .5) * .03) * smooth(.08, .22, dA) * (1 - .8 * smooth(.52, .72, dA));
      const dq = dA + grain;
      let q = 0, best = 9;
      for (let k = 0; k < 5; k++) { const e = Math.abs(dq - LV[k]); if (e < best) { best = e; q = k; } }
      if (q === 0) { o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255; continue; }
      const dB = 1 - (.2126 * B[j] + .7152 * B[j + 1] + .0722 * B[j + 2]) / 255;
      const rim = dA - dB > 0 ? dA - dB : 0;
      const n = tex.brush[ty * N + (((xx * 1.6) | 0) % N)];
      // pigment pooled at the rim, the brush's passes, and the soft mottle of cobalt sunk into glaze
      const mot = (vnoise(xx / 11, yy / 11, 24) - .5) * .22;
      const target = LV[q] * clamp(1 + n * (.42 - .22 * smooth(.6, .85, LV[q])) + rim * 1.7 + mot, .6, 1.5);
      const sc = target / Math.max(.04, dA);
      o[i] = 255 - (255 - r) * sc; o[i + 1] = 255 - (255 - g) * sc; o[i + 2] = 255 - (255 - b) * sc; o[i + 3] = 255;
    }
  }
  fx.putImageData(O, 0, 0);
  // the outline: a pointed brush swells and thins along its stroke and runs dry in places;
  // the line is softened, then cut at a threshold that wanders, so it gets fatter and thinner
  const L = makeCanvas(W, H), lx = L.getContext('2d', { willReadFrequently: true });
  lx.filter = `blur(${.6 * dpr}px)`; lx.drawImage(line, 0, 0); lx.filter = 'none';
  const LD = lx.getImageData(0, 0, W, H), ld = LD.data;
  for (let y = 0; y < H; y++) {
    if (!(y & 31) && !(await breathe())) return null;
    const yy = y * inv;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4 + 3, a0 = ld[i]; if (!a0) continue;
      const xx = x * inv, a = a0 / 255;
      // thin lines keep most of their ink; heavy ones swell and thin with the threshold
      const th = .08 + .3 * vnoise(xx / 13, yy / 13, 9) + .06 * (vnoise(xx / 3, yy / 3, 10) - .5);
      const cut = Math.max(smooth(th - .1, th + .1, a), a * .55);
      const load = .7 + .45 * vnoise(xx / 6, yy / 6, 7);
      ld[i] = Math.min(255, 255 * cut * clamp(load, .45, 1.1));
    }
  }
  lx.putImageData(LD, 0, 0);
  fx.globalCompositeOperation = 'multiply'; fx.drawImage(L, 0, 0); fx.globalCompositeOperation = 'source-over';
  return flat;
}

/* ───────── the tiles ───────── */
/**
 * A wall of tiles for a canvas of W × H device pixels. `T` is the tile pitch in device pixels;
 * the grid is aligned to the right and bottom edges so the picture's frame lands on tile edges.
 */
export function makeTiles(W, H, T, seed = 5, quiet = null) {
  const cols = Math.ceil(W / T) + 1, rows = Math.ceil(H / T) + 1, ox = W - cols * T, oy = H - rows * T;
  const tiles = [], grout = Math.max(1.4, T * .028), rnd = mulberry32(seed);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + c * T, y = oy + r * T;
    tiles.push({
      r, c, x, y, cx: x + T / 2, cy: y + T / 2,
      fx: x + grout / 2, fy: y + grout / 2, fw: T - grout, fh: T - grout,
      dx: (rnd() - .5) * T * .026, dy: (rnd() - .5) * T * .026, rot: (rnd() - .5) * .009,
      warm: (rnd() - .5), bright: (rnd() - .5),
      tiltX: rnd() - .5, tiltY: rnd() - .5, gloss: .55 + rnd() * .45,
      crackle: rnd() < .13, chip: rnd() < .025 ? Math.floor(rnd() * 4) : -1, seed: (rnd() * 1e6) | 0,
    });
  }
  if (quiet) for (const t of tiles) if (quiet(t)) t.chip = -1;
  return { tiles, T, grout, W, H, cols, rows };
}
export const glazeColor = t => {
  const base = [244, 240, 229], w = t.warm * 6, br = t.bright * 6;
  return `rgb(${base[0] + br + w | 0},${base[1] + br + w * .35 | 0},${base[2] + br - w * .8 | 0})`;
};
const faceRadius = g => g.T * .055;
function facePath(c, t, g) {
  const r = faceRadius(g), x = -t.fw / 2, y = -t.fh / 2, w = t.fw, h = t.fh;
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
/* each tile's own surface: pillowed edge, gloss, crackle, pinholes, a chipped corner */
function paintSurface(g, dpr) {
  const { W, H, T } = g;
  const shade = makeCanvas(W, H), sx = shade.getContext('2d');
  const gloss = makeCanvas(W, H), gx = gloss.getContext('2d');
  const chips = makeCanvas(W, H), cx = chips.getContext('2d');
  sx.fillStyle = '#fff'; sx.fillRect(0, 0, W, H);
  for (const t of g.tiles) {
    if (t.x > W || t.y > H || t.x + T < 0 || t.y + T < 0) continue;
    const rnd = mulberry32(t.seed);
    for (const [c, kind] of [[sx, 'shade'], [gx, 'gloss'], [cx, 'chip']]) {
      c.save(); c.translate(t.cx + t.dx, t.cy + t.dy); c.rotate(t.rot);
      if (kind === 'shade') {
        // the glaze thins and rolls over at the edge: a soft darker rim, heavier below and right
        facePath(c, t, g); c.save(); c.clip();
        c.lineJoin = 'round';
        for (const [w, a] of [[T * .08, .01], [T * .04, .016], [T * .016, .03]]) { c.lineWidth = w; c.strokeStyle = `rgba(150,124,92,${a})`; facePath(c, t, g); c.stroke(); }
        let gr = c.createLinearGradient(-t.fw / 2, -t.fh / 2, t.fw / 2, t.fh / 2);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.7, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(140,116,90,.04)');
        c.fillStyle = gr; c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
        if (t.crackle) {
          // crazing: a fine net of glaze cracks, faintly stained
          c.strokeStyle = `rgba(120,104,86,${.035 + rnd() * .035})`; c.lineWidth = Math.max(.5, .45 * dpr);
          const n = 5 + (rnd() * 6 | 0);
          for (let k = 0; k < n; k++) {
            let x = (rnd() - .5) * t.fw, y = (rnd() - .5) * t.fh, a = rnd() * TAU;
            c.beginPath(); c.moveTo(x, y);
            for (let s = 0; s < 6; s++) { a += (rnd() - .5) * 1.3; x += Math.cos(a) * T * .09; y += Math.sin(a) * T * .09; c.lineTo(x, y); }
            c.stroke();
          }
        }
        // pinholes where the glaze crawled in the kiln
        for (let k = 0; k < 1 + (rnd() * 3 | 0); k++) {
          c.fillStyle = `rgba(120,104,86,${.08 + rnd() * .1})`;
          c.beginPath(); c.arc((rnd() - .5) * t.fw * .9, (rnd() - .5) * t.fh * .9, (.35 + rnd() * .55) * dpr, 0, TAU); c.fill();
        }
        c.restore();
      } else if (kind === 'gloss') {
        // the glaze is thicker in the middle: a broad, faint sheen and a bright rolled edge top-left
        facePath(c, t, g); c.save(); c.clip();
        const gr = c.createRadialGradient(-t.fw * .12, -t.fh * .16, 0, 0, 0, t.fw * .8);
        gr.addColorStop(0, `rgba(255,252,240,${.06 * t.gloss})`); gr.addColorStop(1, 'rgba(255,252,240,0)');
        c.fillStyle = gr; c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
        c.restore();
        c.strokeStyle = 'rgba(255,255,250,.22)'; c.lineWidth = Math.max(1, T * .012);
        c.beginPath(); c.moveTo(-t.fw / 2 + faceRadius(g), -t.fh / 2 + c.lineWidth); c.lineTo(t.fw / 2 - faceRadius(g) * 2, -t.fh / 2 + c.lineWidth); c.stroke();
        c.beginPath(); c.moveTo(-t.fw / 2 + c.lineWidth, -t.fh / 2 + faceRadius(g)); c.lineTo(-t.fw / 2 + c.lineWidth, t.fh / 2 - faceRadius(g) * 2); c.stroke();
      } else if (t.chip >= 0) {
        // a chipped corner: the glaze gone, the biscuit showing, with a rough edge
        const k = t.chip, sxg = k % 2 ? 1 : -1, syg = k > 1 ? 1 : -1, ccx = sxg * t.fw / 2, ccy = syg * t.fh / 2, rr = T * (.05 + rnd() * .05);
        c.beginPath(); c.moveTo(ccx, ccy);
        for (let s = 0; s <= 7; s++) { const a = (s / 7) * Math.PI / 2, rad = rr * (.7 + rnd() * .5); c.lineTo(ccx - sxg * Math.cos(a) * rad, ccy - syg * Math.sin(a) * rad); }
        c.closePath(); c.fillStyle = '#c98f6a'; c.fill();
        c.strokeStyle = 'rgba(120,80,50,.5)'; c.lineWidth = Math.max(.7, .6 * dpr); c.stroke();
      }
      c.restore();
    }
  }
  // grout: lime mortar between the tiles, in shadow just under each tile's edge
  return { shade, gloss, chips };
}
/** Everything about the wall that never changes with the place: mortar, glaze, surface. */
export function prepareWall(g, dpr) {
  const surf = paintSurface(g, dpr);
  return { g, ...surf };
}
/** Fire a painted sheet onto the wall: each tile carries its piece of the painting, a little off true. */
export function fire(wall, painting) {
  const g = wall.g, { W, H, T } = g;
  const out = makeCanvas(W, H), c = out.getContext('2d');
  c.fillStyle = '#e3dccd'; c.fillRect(0, 0, W, H);
  // mortar texture: faint sand
  for (const t of g.tiles) {
    if (t.x > W || t.y > H || t.x + T < 0 || t.y + T < 0) continue;
    c.save(); c.translate(t.cx + t.dx, t.cy + t.dy); c.rotate(t.rot);
    // a soft shadow of the tile on the mortar
    c.fillStyle = 'rgba(90,76,60,.12)'; c.fillRect(-t.fw / 2 + T * .006, -t.fh / 2 + T * .01, t.fw, t.fh);
    facePath(c, t, g); c.clip();
    c.fillStyle = glazeColor(t); c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
    c.globalCompositeOperation = 'multiply';
    c.drawImage(painting, t.cx - t.fw / 2 - 1, t.cy - t.fh / 2 - 1, t.fw + 2, t.fh + 2, -t.fw / 2 - 1, -t.fh / 2 - 1, t.fw + 2, t.fh + 2);
    c.restore();
  }
  c.globalCompositeOperation = 'multiply'; c.drawImage(wall.shade, 0, 0);
  c.globalCompositeOperation = 'source-over'; c.drawImage(wall.chips, 0, 0);
  c.globalCompositeOperation = 'screen'; c.drawImage(wall.gloss, 0, 0);
  c.globalCompositeOperation = 'source-over';
  return out;
}

/* ───────── what moves: the sheen on the glaze, and tiles turning over ───────── */
let SHEEN = null;
function sheenSprite(T) {
  if (SHEEN && SHEEN.T === T) return SHEEN.cv;
  // the reflection of the window in a glossy glaze: a small soft-edged pane of light with a
  // brighter core, and a fainter second pane beside it (the glazing bar between them)
  const w = Math.ceil(T * .46), h = Math.ceil(T * .34), cv = makeCanvas(w, h), c = cv.getContext('2d');
  const b = Math.max(1, T * .028);
  c.filter = `blur(${b}px)`;
  const pane = (x, y, pw, ph, a) => { c.fillStyle = `rgba(255,255,250,${a})`; c.beginPath(); c.roundRect(x, y, pw, ph, ph * .2); c.fill(); };
  pane(w * .14, h * .2, w * .34, h * .56, .8);
  pane(w * .54, h * .2, w * .28, h * .56, .42);
  c.filter = 'none';
  const g = c.createRadialGradient(w * .3, h * .42, 0, w * .3, h * .42, w * .2);
  g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  SHEEN = { T, cv };
  return cv;
}
/**
 * The reflection of the room's light in each tile. Every tile sits at its own tiny angle, so
 * each one catches the light in a different place; as the page scrolls (or the pointer moves)
 * the reflections slide across the wall together. `skip(t)` leaves a tile out (while it turns).
 */
export function drawSheen(c, g, px, py, strength, skip) {
  const sp = sheenSprite(g.T), { T } = g, sw = sp.width, sh = sp.height;
  c.save(); c.globalCompositeOperation = 'screen';
  for (const t of g.tiles) {
    if (t.x > g.W || t.y > g.H || t.x + T < 0 || t.y + T < 0) continue;
    if (skip && skip(t)) continue;
    const ox = clamp(t.tiltX * .7 + px, -.5, .5) * (t.fw - sw), oy = clamp(t.tiltY * .7 + py, -.5, .5) * (t.fh - sh);
    c.globalAlpha = strength * t.gloss * (.55 + .45 * (1 - Math.abs(t.tiltX + px)));
    c.drawImage(sp, t.cx + t.dx + ox - sw / 2, t.cy + t.dy + oy - sh / 2);
  }
  c.restore();
}
/**
 * Turn tile `t` over, from sheet A to sheet B, `p` from 0 to 1. The tile spins about its
 * vertical axis; its thickness shows as a strip of biscuit when it is nearly edge-on.
 */
export function drawFlip(c, g, t, A, B, p) {
  const ang = p * Math.PI, cosA = Math.cos(ang), src = p < .5 ? A : B, sx = Math.abs(cosA), T = g.T;
  const x = t.cx + t.dx, y = t.cy + t.dy;
  c.save();
  // the bed of mortar behind a lifted tile
  // the bed of mortar a lifted tile leaves: grey lime, combed by the trowel
  c.fillStyle = '#d3cab8'; c.fillRect(t.x + g.grout * .2, t.y + g.grout * .2, T - g.grout * .4, T - g.grout * .4);
  c.fillStyle = 'rgba(120,104,84,.2)'; for (let k = 0; k < 5; k++) c.fillRect(t.x + T * .12, t.y + T * (.16 + k * .16), T * .76, T * .045);
  c.translate(x, y); c.rotate(t.rot);
  const lift = Math.sin(ang);
  c.fillStyle = `rgba(60,48,36,${.12 * lift})`; c.fillRect(-t.fw / 2 + T * .03 * lift, -t.fh / 2 + T * .05 * lift, t.fw, t.fh);
  c.scale(Math.max(.002, sx) * (1 + lift * .06), 1 + lift * .06);
  c.drawImage(src, t.cx + t.dx - t.fw / 2, t.cy + t.dy - t.fh / 2, t.fw, t.fh, -t.fw / 2, -t.fh / 2, t.fw, t.fh);
  // light falls off as the face turns away
  c.fillStyle = `rgba(40,40,70,${.22 * (1 - sx)})`; c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
  c.restore();
  if (sx < .35) {
    // the tile's edge: unglazed biscuit
    c.save(); c.translate(x, y); c.rotate(t.rot);
    const e = (1 - sx / .35) * T * .09, side = cosA > 0 ? -1 : 1;
    c.fillStyle = '#c4916d'; c.fillRect(side * t.fw / 2 * sx * 1.06 - (side < 0 ? e : 0), -t.fh / 2 * 1.06, e, t.fh * 1.06);
    c.restore();
  }
}
