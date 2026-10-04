/* The apse in mosaic: the ground of the conch. In mosaic the sky is not painted, it is light:
   by day the conch is gold glass, as in Ravenna; at night it turns to lapis strewn with stars, as
   in the vault of Galla Placidia; at dusk and dawn rows of rose, coral and gold glass run between
   them. `k` blends: gold (day) → warm gold (golden hour) → dusk rows → lapis (night). */
import { mix, clamp, smooth, rgb } from '../core.js';
import { MAT } from '../arch.js';

export const SKY = {
  gold: rgb('#c49540'), goldLit: rgb('#d9ae55'), goldWarm: rgb('#cf9040'), goldDeep: rgb('#a87c34'),
  rose: rgb('#c9776e'), coral: rgb('#e0935e'), violet: rgb('#5c4f8c'),
  lapisTop: rgb('#1c2c62'), lapis: rgb('#26397a'), lapisLow: rgb('#3d5898'),
};

/** The ground colour at (x, y): v runs 0 at the top of the conch to 1 at the horizon.
    L.day, L.golden, L.dusk, L.night are 0–1 weights from the light. */
export function groundColour(L, v, glow = 0) {
  const S = SKY;
  let gold = mix(S.goldLit, S.gold, smooth(0, 1, v) * .5);
  gold = mix(gold, S.goldWarm, (L.golden || 0) * smooth(.2, 1, v) * .8);
  const night = mix(S.lapisTop, mix(S.lapis, S.lapisLow, smooth(.5, 1, v)), smooth(0, .45, v));
  // dusk: lapis above, then violet, rose and coral rows down to gold at the horizon
  const dusk = v < .35 ? mix(S.lapisTop, S.lapis, v / .35) : v < .55 ? mix(S.lapis, S.violet, (v - .35) / .2) : v < .72 ? mix(S.violet, S.rose, (v - .55) / .17) : v < .86 ? mix(S.rose, S.coral, (v - .72) / .14) : mix(S.coral, S.goldWarm, (v - .86) / .14);
  let c = gold;
  if (L.dusk) c = mix(c, dusk, L.dusk);
  if (L.night) c = mix(c, night, L.night);
  if (glow) c = mix(c, S.goldLit, glow);
  return c;
}
/** gold by day, glass at night; at dusk the lower, warmer rows stay gold */
export function groundMat(L, v) {
  const goldness = (1 - (L.night || 0)) * (1 - (L.dusk || 0) * smooth(.86, .6, v));
  return goldness > .5 ? MAT.GOLD : MAT.GLASS;
}
/** Gold stars for a night conch: eight-pointed, four-pointed and single, on a jittered grid above
    `below(x)`, kept clear of `avoid` discs [x, y, r]. */
export function starField(A, below, avoid = [], seed = 5, density = 1) {
  let a = seed * 9301 + 49297; const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  const out = [], step = 64 / Math.sqrt(density), gold = [rgb('#e2bb5c'), rgb('#f0d488'), rgb('#cfa148'), rgb('#f4e6c0')];
  for (let gy = -RI + step * .4; gy < 1200; gy += step * .86) for (let gx = -RI; gx < RI; gx += step) {
    const x = gx + (rnd() - .5) * step * .8 + ((Math.round(gy / step) % 2) * step * .5), y = gy + (rnd() - .5) * step * .6;
    if (Math.hypot(x, Math.min(y, 0)) > RI - 26 || y > below(x) - 14) continue;
    if (avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar)) continue;
    const roll = rnd();
    out.push({ x, y, size: roll < .22 ? 2 : roll < .6 ? 1 : 0, a: rnd() * Math.PI, col: gold[(rnd() * 4) | 0] });
  }
  return out;
}
export const RI = 500;
export { clamp };
