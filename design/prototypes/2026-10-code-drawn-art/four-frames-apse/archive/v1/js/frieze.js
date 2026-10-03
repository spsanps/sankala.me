/* The apse in mosaic: where the mosaic ends and the plaster begins. Below the apse the lapis wall
   finishes in a border (dark, gold, porphyry, gold, dark), and a few loose stones lie on the
   plaster beneath it, as if the setters had just stopped. */
import { mix, rgb, mulberry32 } from './core.js';
import { laySteps, corners } from './lay.js';

const P = { lapis: rgb('#1f3170'), lapisDeep: rgb('#142152'), gold: [rgb('#d9ad4f'), rgb('#e8c46a'), rgb('#c0913a'), rgb('#f0d488')], red: rgb('#8e2c27'), outline: rgb('#231d18'), grout: rgb('#3e392f'), plaster: rgb('#efe8d9'), cream: rgb('#e9dfc8') };
const q8 = new Float32Array(8);

export async function paintFrieze(canvas, stonePx, dpr) {
  const w = canvas.getBoundingClientRect().width || document.documentElement.clientWidth;
  const band = Math.round(stonePx * 7), loose = Math.round(stonePx * 6), h = band + loose;
  canvas.style.height = h + 'px'; canvas.style.background = 'transparent';
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const c = canvas.getContext('2d');
  c.fillStyle = `rgb(${P.plaster.join(',')})`; c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = `rgb(${P.grout.join(',')})`; c.fillRect(0, 0, canvas.width, band * dpr);
  const S = 6, q = S / stonePx, panel = { x0: -4, y0: -4 };
  const regions = [{ name: 'band', group: 'band', clip: false, fine: 1, src: 'courses', draw: cc => cc.rect(-4, -2, w + 8, band + 2), fill: () => P.gold[0] }];
  const gen = laySteps(regions, [], { W: Math.ceil((w + 8) * q), H: Math.ceil((band + 8) * q), q, s: S, seed: 9, panel });
  let res = gen.next(); while (!res.done) res = gen.next();
  const rnd = mulberry32(19), kk = dpr / q, ox = panel.x0 * dpr, oy = panel.y0 * dpr;
  for (const t of res.value.stones) {
    const y = t.y / q + panel.y0, row = Math.floor(y / stonePx);
    t.col = row <= 1 ? mix(P.lapis, P.lapisDeep, rnd() * .6) : row === 2 || row === 6 ? P.outline : row === 4 ? P.red : P.gold[(rnd() * 4) | 0];
  }
  // loose stones on the plaster: sparser and smaller further down
  const extra = [];
  for (let x = stonePx * .5; x < w; x += stonePx * 1.15) for (let d = 0; d < loose; d += stonePx) {
    const p = 1 - d / loose; if (rnd() > p * p * .55) continue;
    const s = stonePx * (.55 + .3 * rnd()) * (.75 + .25 * p);
    extra.push({ x: (x + (rnd() - .5) * stonePx * .8 - panel.x0) * q, y: (band + d + stonePx * .5 + (rnd() - .5) * stonePx * .6 - panel.y0) * q, a: (rnd() - .5) * .9, l: s * q, w: s * q * .85, s: stonePx * q, j: new Float32Array(8).map(() => (rnd() - .5) * stonePx * q * .1), col: rnd() < .45 ? P.gold[(rnd() * 4) | 0] : rnd() < .5 ? mix(P.lapis, P.lapisDeep, rnd()) : P.cream });
  }
  for (const t of res.value.stones) paint(c, { ...t, l: t.l + t.s * .2, w: t.w + t.s * .2 }, mix(P.grout, t.col, .45), kk, ox, oy, true);
  for (const t of [...res.value.stones, ...extra]) paint(c, t, t.col, kk, ox, oy, false);
}
function paint(c, t, col, k, ox, oy, flat) {
  corners(t, q8);
  c.beginPath(); c.moveTo(q8[0] * k + ox, q8[1] * k + oy); for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy); c.closePath();
  c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; c.fill();
  if (flat) return;
  c.lineWidth = Math.max(.7, k * .5); c.strokeStyle = 'rgba(255,253,244,.25)';
  c.beginPath(); c.moveTo(q8[6] * k + ox, q8[7] * k + oy); c.lineTo(q8[0] * k + ox, q8[1] * k + oy); c.lineTo(q8[2] * k + ox, q8[3] * k + oy); c.stroke();
}
