/* The apse in mosaic: things that move through fixed stones (the stones are re-coloured).
   Gulls glide and flap; kites tug on their strings. */
import { lerp } from '../core.js';
import { RI } from '../geom.js';
const IN_X0 = -RI, IN_X1 = RI;

/** gulls: specs are [seed, period (s), height, size] */
export function birdsAt(t, specs) {
  return specs.map(([i, period, y0, size]) => {
    const ph = ((t + i * 13) % period) / period, x = lerp(IN_X0 - 120, IN_X1 + 120, ph), y = y0 + 22 * Math.sin(ph * 6.28 + i);
    return { x, y, size, flap: .5 + .5 * Math.sin(t * (1.6 + i * .3) + i) };
  });
}
/** Is (x, y) inside a gull's silhouette? Two arcs meeting at the body. */
export function inBird(b, x, y) {
  const dx = x - b.x, dy = y - b.y, s = b.size;
  if (Math.abs(dx) > s * 1.1 || Math.abs(dy) > s * .6) return false;
  const u = Math.abs(dx) / s, lift = .18 + .2 * b.flap;
  const wingY = -lift * Math.sin(Math.min(1, u) * Math.PI) * s * .9 + u * u * s * .22 * (1 - b.flap * .5);
  return u <= 1 && Math.abs(dy - wingY) < Math.max(s * .07, s * (.16 - .09 * u));
}

/** kites: each tugs on its string, bobbing and turning a little */
export function kitesAt(t, specs) {
  return specs.map(k => ({ ...k, x: k.x + 16 * Math.sin(t * .7 + k.ph) + 6 * Math.sin(t * 1.9 + k.ph * 2), y: k.y + 10 * Math.sin(t * .9 + k.ph * 1.3), a: .18 * Math.sin(t * 1.1 + k.ph) }));
}
/** Which part of a kite is (x, y) in: 1 or 2 for its two halves, 3 for the tail, 4 for the string, 0 for none. */
export function inKite(k, x, y) {
  const c = Math.cos(-k.a), s = Math.sin(-k.a), dx = x - k.x, dy = y - k.y, u = dx * c - dy * s, v = dx * s + dy * c, w = k.size * .62, h = k.size;
  if (Math.abs(u) / w + Math.abs(v + h * .1) / h < 1) return u < 0 ? 1 : 2;
  // the tail: a few bows hanging below
  for (let i = 1; i <= 3; i++) { const tx = Math.sin(i * 1.3 + k.ph) * 10, ty = h * .9 + i * k.size * .42; if (Math.abs(u - tx) < k.size * .16 && Math.abs(v - ty) < k.size * .11) return 3; }
  // the string, down to the right toward a roof
  const ex = k.strX - k.x, ey = k.strY - k.y, l = Math.hypot(ex, ey), along = (dx * ex + dy * ey) / l;
  if (along > 0 && along < l) { const off = Math.abs(dx * ey - dy * ex) / l; if (off < 4.5) return 4; }
  return 0;
}
