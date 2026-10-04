/* A 2D canvas that works on the main thread, in a worker and in the stills script: an
   OffscreenCanvas where the browser has one, otherwise a detached <canvas>. */
export function createCanvas(w, h) {
  const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h));
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(W, H);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  return c;
}
export const ctx2d = (canvas, opts) => canvas.getContext('2d', opts);
