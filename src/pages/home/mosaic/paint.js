/* The apse in mosaic: painting stones. A layer is painted in three passes: a dark setting bed,
   the joints tinted by their stones (each stone a little larger, at half strength), then the stones,
   each with a lit upper-left edge and a shaded lower-right edge. `T` places units on the canvas:
   { s: canvas px per unit, x, y: canvas position of the unit origin }. */
import { mix } from './core.js';
import { corners } from './lay.js';
import { conchPath } from './geom.js';
import { ARCH_PAL, MAT } from './arch.js';

const q8 = new Float32Array(8);
export const grouted = t => ({ ...t, l: t.l + t.s * .2, w: t.w + t.s * .2 });
const css = col => `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;

export function paintStone(c, t, col, k, ox, oy, flat = false, squash = 1) {
  if (squash < 1) corners({ ...t, w: t.w * Math.max(.04, squash) }, q8); else corners(t, q8);
  c.beginPath();
  c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
  for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
  c.closePath();
  c.fillStyle = css(col); c.fill();
  if (flat) return;
  const dark = col[0] + col[1] + col[2] < 200;
  c.lineWidth = Math.max(.7, k * .5);
  c.strokeStyle = dark ? 'rgba(255,250,236,.16)' : 'rgba(255,253,244,.26)';
  c.beginPath(); c.moveTo(q8[6] * k + ox, q8[7] * k + oy); c.lineTo(q8[0] * k + ox, q8[1] * k + oy); c.lineTo(q8[2] * k + ox, q8[3] * k + oy); c.stroke();
  c.strokeStyle = 'rgba(30,22,12,.2)';
  c.beginPath(); c.moveTo(q8[2] * k + ox, q8[3] * k + oy); c.lineTo(q8[4] * k + ox, q8[5] * k + oy); c.lineTo(q8[6] * k + ox, q8[7] * k + oy); c.stroke();
}

/** the scale and offset that take a layer's sheet px to the canvas */
export const sheetToCanvas = (layer, T) => ({ kk: T.s / layer.q, ox: layer.panel.x0 * T.s + T.x, oy: layer.panel.y0 * T.s + T.y });

/** the architecture: the wall's bed, joints, then stones (the lapis without a bevel) */
export function paintArch(c, layer, T, w, h) {
  const { kk, ox, oy } = sheetToCanvas(layer, T), gr = ARCH_PAL.grout;
  c.fillStyle = css(mix(gr, ARCH_PAL.lapisDeep, .5)); c.fillRect(0, 0, w, h);
  for (const t of layer.stones) paintStone(c, grouted(t), mix(gr, t.col, .45), kk, ox, oy, true);
  for (const t of layer.stones) paintStone(c, t, t.col, kk, ox, oy, t.mat === MAT.GLASS && !t.star);
}

/** clip to the conch (its floor at F) */
export function clipConch(c, F, T) {
  c.save(); c.setTransform(T.s, 0, 0, T.s, T.x, T.y); c.beginPath(); conchPath(F)(c); c.restore();
}
/** a place's conch: the bed, joints and stones, inside the conch */
export function paintPlace(c, layer, T) { const g = paintPlaceSteps(c, layer, T, Infinity); while (!g.next().done); }
/** the same, as a generator that yields every `chunk` stones (the live layer slices it) */
export function* paintPlaceSteps(c, layer, T, chunk = 2500) {
  const { kk, ox, oy } = sheetToCanvas(layer, T), gr = ARCH_PAL.grout, S = layer.stones;
  const pass = function* (fn) {
    for (let i = 0; i < S.length; i += chunk) {
      c.save(); clipConch(c, layer.F, T); c.clip();
      for (let k = i, n = Math.min(S.length, i + chunk); k < n; k++) fn(S[k]);
      c.restore();
      if (i + chunk < S.length) yield;
    }
  };
  c.save(); clipConch(c, layer.F, T); c.clip(); c.fillStyle = css(gr); c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.restore();
  yield* pass(t => paintStone(c, grouted(t), mix(gr, t.col, .5), kk, ox, oy, true));
  yield;
  yield* pass(t => paintStone(c, t, t.col, kk, ox, oy));
}
