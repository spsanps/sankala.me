/* The apse in mosaic: geometry.
   Units: the conch's inner radius is 500 and the arch's centre (the middle of the springing line)
   is (0, 0); y grows downward. The conch is a half-disc on two upright sides that run down to its
   floor at y = F; below the floor a cornice band (C tall) runs across the whole wall. The
   archivolt (B wide) wraps the conch. On a wide screen F is short (a broad apse); on a phone it is
   long (a tall, round-headed apse), so one set of drawings serves every screen.
   Everything in a place's scene is placed from `G` (see sceneAnchors), so the desk scales with
   the apse and its things stay big. */
import { TAU, clamp, lerp } from './core.js';

export const RI = 500, B = 46, C = 46, RO = RI + B;
export const LEG = 150;                               // the desk's height, top to feet, in desk units
const F_MIN = 78, F_MAX = 1150;

/** Lay out the apse on a stage `w` × `h` css px. `header`: 'corners' (the nav sits in the top
    corners of the wall, beside the crown) or 'band' (the nav is a band across the top, `headerH` tall). */
export function layoutApse(w, h, header, headerH = 0) {
  const corners = header === 'corners';
  const bandTarget = corners ? h * .662 : Math.min(h * .6, w * 1.62);
  const mt = corners ? Math.max(10, h * .014) : headerH + 6;
  const ms = corners ? 24 : 9;
  const uW = (w - 2 * ms) / (2 * RO);
  let u, F;
  const fW = (bandTarget - mt) / uW - (RO + C);
  if (fW >= F_MIN) { u = uW; F = Math.min(fW, F_MAX); }
  else { F = F_MIN; u = (bandTarget - mt) / (RO + F_MIN + C); }
  const cx = w / 2, cy = mt + RO * u, bandH = Math.ceil(cy + (F + C) * u);
  return { u, F, cx, cy, bandH, w, h, mt, corners, tall: clamp((F - F_MIN) / (760 - F_MIN)) };
}

/* paths, in units */
export const conchPath = (F) => c => { c.moveTo(-RI, F + 1); c.lineTo(-RI, 0); c.arc(0, 0, RI, Math.PI, 0); c.lineTo(RI, F + 1); c.closePath(); };
export const archOuterPath = (F) => c => { c.moveTo(-RO, F + 1); c.lineTo(-RO, 0); c.arc(0, 0, RO, Math.PI, 0); c.lineTo(RO, F + 1); c.closePath(); };
/* the ring of the archivolt (outer path, then the conch the other way round) */
export const archivoltPath = (F) => c => {
  c.moveTo(-RO, F + .5); c.lineTo(-RO, 0); c.arc(0, 0, RO, Math.PI, 0); c.lineTo(RO, F + .5);
  c.lineTo(RI, F + .5); c.lineTo(RI, 0); c.arc(0, 0, RI, 0, Math.PI, true); c.lineTo(-RI, F + .5); c.closePath();
};
/** distance (units) inward from the conch's edge (positive inside the archivolt, outward) */
export function archDepth(x, y) { return Math.hypot(x, Math.min(y, 0)) - RI; }
/** where along the archivolt a point lies: 0 at the bottom left, 1 at the bottom right */
export function archParam(x, y, F) {
  const arcLen = Math.PI * RI, total = arcLen + 2 * F;
  if (y >= 0) return x < 0 ? (F - y) / total : (F + arcLen + y) / total;
  return (F + (Math.atan2(y, x) + Math.PI) / Math.PI * arcLen) / total;
}
/** the point at fraction f along the archivolt's middle line, and its inward normal */
export function archPoint(f, F, r = RI + B / 2) {
  const arcLen = Math.PI * r, total = arcLen + 2 * F, s = f * total;
  if (s < F) return { x: -r, y: F - s, nx: 1, ny: 0 };
  if (s < F + arcLen) { const a = Math.PI + (s - F) / arcLen * Math.PI; return { x: r * Math.cos(a), y: r * Math.sin(a), nx: -Math.cos(a), ny: -Math.sin(a) }; }
  return { x: r, y: s - F - arcLen, nx: -1, ny: 0 };
}

/* the desk and its things, and how the scene sits in the conch, from F */
export function sceneAnchors(F) {
  const t = clamp((F - F_MIN) / (760 - F_MIN));
  const sd = lerp(1.02, 1.4, t);                       // the desk's scale
  const ground = F - lerp(12, 44, t);                  // where the desk's feet stand
  const deskY = ground - LEG * sd;                     // the desk's top
  return { t, sd, ground, deskY, F };
}

/* shape helpers (units) */
export const poly = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
export const disc = (x, y, r) => c => { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); c.closePath(); };
export const ell = (x, y, rx, ry, rot = 0) => c => { c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.closePath(); };
export const rect = (x, y, w, h) => c => c.rect(x, y, w, h);
export const union = (...fs) => c => { for (const f of fs) if (f) f(c); };
/** the ground under a curve y = fn(x), from x0 to x1, down to `bottom` */
export const below = (fn, x0, x1, bottom, step = 5) => c => {
  c.moveTo(x0, bottom); for (let x = x0; x <= x1; x += step) c.lineTo(x, fn(x)); c.lineTo(x1, fn(x1)); c.lineTo(x1, bottom); c.closePath();
};
/** a rotated rectangle from (x0, y0) to (x1, y1), w wide */
export const bar = (x0, y0, x1, y1, w) => {
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * w / 2, ny = Math.cos(a) * w / 2;
  return poly([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]);
};
/** a tapering curved blade (a palm frond, a leaf) along a quadratic curve */
export const blade = (x0, y0, cx, cy, x1, y1, w0, w1 = 0) => c => {
  const N = 14, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy), l = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * t) * Math.sin(Math.min(1, (t + .08) * 1.3) * Math.PI * .5 + .0001) / 2;
    L.push([x - dy / l * w, y + dx / l * w]); R.push([x + dy / l * w, y - dx / l * w]);
  }
  c.moveTo(L[0][0], L[0][1]); for (const p of L) c.lineTo(p[0], p[1]); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath();
};
/** distance from (px, py) to the segment (ax, ay)–(bx, by) */
export function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}
/** collects regions for a place; every region of the scene is clipped to the conch */
export function regionList() {
  const out = [];
  out.R = (name, group, draw, fill, o = {}) => { out.push({ name, group, draw, fill, clip: true, fine: 1, src: 'self', ...o }); return out; };
  return out;
}
