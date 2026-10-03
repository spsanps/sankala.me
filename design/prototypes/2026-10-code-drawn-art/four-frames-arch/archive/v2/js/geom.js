/* Arched window mosaic: the shared geometry and drawing helpers.
   Units: the window is 1000 wide; the arch's centre is (500, 500); the sill line is y = 1000. */
import { TAU, clamp } from './core.js';

export const CX = 500, CY = 500, R_IN = 430, R_OUT = 500, IN_X0 = 70, IN_X1 = 930, SILL = 1000, SILL_B = 1086;
/* the layout sheet: the panel plus a little wall */
export const PANEL = { x0: -40, y0: -14, w: 1080, h: 1114 };
/* what has to fit on screen: the panel plus room for its outer edge to dissolve into the plaster */
export const FIT = { x0: -86, y0: -78, w: 1172, h: 1178 };

export const outerPath = c => { c.moveTo(0, SILL + 1); c.lineTo(0, CY); c.arc(CX, CY, R_OUT, Math.PI, 0); c.lineTo(1000, SILL + 1); c.closePath(); };
export const innerPath = c => { c.moveTo(IN_X0, SILL + 1); c.lineTo(IN_X0, CY); c.arc(CX, CY, R_IN, Math.PI, 0); c.lineTo(IN_X1, SILL + 1); c.closePath(); };
export const sillPath = c => c.rect(-26, SILL, 1052, SILL_B - SILL);
export const panelShape = c => { outerPath(c); sillPath(c); };

/* distance (units) from the outer edge of the frame, positive inside the frame */
export function outerDepth(x, y) {
  if (y >= CY) return Math.min(x, 1000 - x);
  return R_OUT - Math.hypot(x - CX, y - CY);
}
/* distance (units) from the window's inner edge, positive inside the frame */
export function innerDepth(x, y) { return Math.hypot(x - CX, Math.min(y, CY) - CY) - R_IN; }
/* where along the frame a point lies: 0 at the bottom left, 1 at the bottom right */
export function frameParam(x, y) {
  const arcLen = Math.PI * R_OUT, side = SILL - CY, total = arcLen + 2 * side;
  if (y >= CY) return x < CX ? (SILL - y) / total : (side + arcLen + (y - CY)) / total;
  const a = Math.atan2(y - CY, x - CX);                 // -π (left) … 0 (right) along the top
  return (side + (a + Math.PI) / Math.PI * arcLen) / total;
}

/* shapes */
export const poly = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
export const disc = (x, y, r) => c => { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); c.closePath(); };
export const ell = (x, y, rx, ry, rot = 0) => c => { c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.closePath(); };
export const rect = (x, y, w, h) => c => c.rect(x, y, w, h);
export const union = (...fs) => c => { for (const f of fs) f(c); };
/** the ground under a curve y = fn(x), from x0 to x1, down to the sill */
export const below = (fn, x0 = IN_X0 - 4, x1 = IN_X1 + 4, step = 5) => c => {
  c.moveTo(x0, SILL + 1); for (let x = x0; x <= x1; x += step) c.lineTo(x, fn(x)); c.lineTo(x1, fn(x1)); c.lineTo(x1, SILL + 1); c.closePath();
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

export const nearest = (arr, x, y) => arr.reduce((a, b) => ((b.x - x) ** 2 + ((b.y ?? y) - y) ** 2 < (a.x - x) ** 2 + ((a.y ?? y) - y) ** 2 ? b : a));
/** distance from (px, py) to the segment (ax, ay)–(bx, by) */
export function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}
/** collects regions for a place; every region of the view is clipped to the window */
export function regionList() {
  const out = [];
  out.R = (name, group, draw, fill, o = {}) => { out.push({ name, group, draw, fill, clip: true, fine: 1, src: 'self', ...o }); return out; };
  return out;
}
