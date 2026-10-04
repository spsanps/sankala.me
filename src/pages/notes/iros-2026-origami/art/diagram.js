// Origami instruction diagrams in Yoshizawa–Randlett notation, drawn in code, for "Two hands, one sheet of paper":
// the notation (fold lines, fold arrows, step circles), a sheet of paper that folds in 2.5D, and the essay's two
// robot hands, all in one thin, confident ink line on warm paper. Shared by the cover
// (src/components/art/covers/iros-2026-origami.js), the five-folds figure (folds.js) and the corner vignette (lift.js).
// Coordinates are design units; every function draws into a 2D context that is already scaled.
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
export const ease = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// The palette: ink, the sheet's printed front, the grey tint for its back, and the one accent, the blue of the
// challenge sheet's printed guide lines. GHOST is the same drawing greyed out, for the folds nobody reached.
export const PALETTE = { ink: '#1f2328', front: '#fffdf7', back: '#d8d5cd', blue: '#2a7fbf', hand: '#fcfbf8', pad: '#c3c8ce', paper: '#f4efe4' };
export const GHOST = { ink: '#a7a9ac', front: '#fbfaf5', back: '#ebe8e1', blue: '#aac8df', hand: '#fbfaf6', pad: '#e1e3e5', paper: '#f4efe4' };
export const INK = PALETTE.ink, PAPER_FRONT = PALETTE.front, PAPER_BACK = PALETTE.back, SHEET_BLUE = PALETTE.blue;

/* ───────────────────────── lettering ───────────────────────── */
// Small type drawn under a scaled transform gets its letters placed on the unscaled pixel grid and then magnified,
// which spaces them unevenly, so text is set in device pixels. Tracking uses the canvas's own letter spacing where
// the browser has it, so kerning survives. Assumes no rotation in the current transform.
export function label(ctx, text, x, y, track = 0, align = 'left') {
  const m = ctx.getTransform(), k = Math.hypot(m.a, m.b) || 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = align;
  ctx.font = ctx.font.replace(/([\d.]+)px/, (_, n) => `${(parseFloat(n) * k).toFixed(2)}px`);
  const spacing = 'letterSpacing' in ctx;
  if (spacing) ctx.letterSpacing = `${(track * k).toFixed(2)}px`;
  // letter spacing is added after the last letter too; take it back off right-aligned and centred text
  const dx = spacing ? (align === 'right' ? track : align === 'center' ? track / 2 : 0) : 0;
  ctx.fillText(text, (x + dx) * m.a + m.e, y * m.d + m.f);
  ctx.restore();
}

/* ───────────────────────── notation ───────────────────────── */
// Valley folds are dashed; mountain folds are a dash and two dots.
export function foldLine(ctx, a, b, kind = 'valley', P = PALETTE, width = 1) {
  ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = width; ctx.lineCap = 'butt';
  ctx.setLineDash(kind === 'valley' ? [6, 4] : [8, 2.6, 1.3, 2.6, 1.3, 2.6]);
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
}
// A fold line through two points, run a set distance past each of them.
export function extend(a, b, before, after = before) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  return [[a[0] - ux * before, a[1] - uy * before], [b[0] + ux * after, b[1] + uy * after]];
}

// A curved arrow from a to b; bend pushes the curve to one side, as a fraction of the distance.
function control(a, b, bend) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  return [mx - dy * bend, my + dx * bend];
}
const qpt = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
function shaft(ctx, a, c, b, upto = 1) {
  ctx.beginPath(); ctx.moveTo(a[0], a[1]);
  for (let i = 1; i <= 24; i++) { const p = qpt(a, c, b, i / 24 * upto); ctx.lineTo(p[0], p[1]); }
  ctx.stroke();
}

// "Fold in front": a curved arrow with a full, solid head. progress draws it from the tail (0–1).
export function valleyArrow(ctx, a, b, bend = .4, P = PALETTE, size = 8, progress = 1) {
  if (progress <= 0) return;
  const c = control(a, b, bend), end = qpt(a, c, b, progress), pre = qpt(a, c, b, Math.max(0, progress - .02)), ang = Math.atan2(end[1] - pre[1], end[0] - pre[0]);
  ctx.save(); ctx.strokeStyle = P.ink; ctx.fillStyle = P.ink; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  const back = progress * Math.max(0, 1 - size * .7 / Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1])));
  shaft(ctx, a, c, b, back);
  ctx.beginPath(); ctx.moveTo(end[0], end[1]);
  ctx.lineTo(end[0] - Math.cos(ang - .36) * size, end[1] - Math.sin(ang - .36) * size);
  ctx.quadraticCurveTo(end[0] - Math.cos(ang) * size * .7, end[1] - Math.sin(ang) * size * .7, end[0] - Math.cos(ang + .36) * size, end[1] - Math.sin(ang + .36) * size);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// "Fold behind": a curved arrow with a hollow half head. repeat adds the tick that says "repeat behind".
export function mountainArrow(ctx, a, b, bend = .4, P = PALETTE, size = 10, progress = 1, repeat = false) {
  if (progress <= 0) return;
  const c = control(a, b, bend), end = qpt(a, c, b, progress), pre = qpt(a, c, b, Math.max(0, progress - .02)), ang = Math.atan2(end[1] - pre[1], end[0] - pre[0]);
  const side = bend >= 0 ? -1 : 1;
  ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  shaft(ctx, a, c, b, progress);
  ctx.beginPath(); ctx.moveTo(end[0], end[1]);
  ctx.lineTo(end[0] - Math.cos(ang + side * .5) * size, end[1] - Math.sin(ang + side * .5) * size);
  ctx.lineTo(end[0] - Math.cos(ang) * size * .6, end[1] - Math.sin(ang) * size * .6);
  ctx.closePath(); ctx.fillStyle = P.hand; ctx.fill(); ctx.stroke();
  if (repeat && progress > .5) {
    const m = qpt(a, c, b, .5), m2 = qpt(a, c, b, .52), t = Math.atan2(m2[1] - m[1], m2[0] - m[0]) + Math.PI / 2;
    for (const o of [-2.2, 2.2]) {
      const mx = m[0] + Math.cos(t - Math.PI / 2) * o, my = m[1] + Math.sin(t - Math.PI / 2) * o;
      ctx.beginPath(); ctx.moveTo(mx - Math.cos(t) * 4.5, my - Math.sin(t) * 4.5); ctx.lineTo(mx + Math.cos(t) * 4.5, my + Math.sin(t) * 4.5); ctx.stroke();
    }
  }
  ctx.restore();
}

// A straight arrow with a solid head (slide, move).
export function straightArrow(ctx, a, b, P = PALETTE, size = 7.5, progress = 1) {
  if (progress <= 0) return;
  const end = [lerp(a[0], b[0], progress), lerp(a[1], b[1], progress)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  ctx.save(); ctx.strokeStyle = P.ink; ctx.fillStyle = P.ink; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(end[0] - Math.cos(ang) * size * .7, end[1] - Math.sin(ang) * size * .7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(end[0], end[1]);
  ctx.lineTo(end[0] - Math.cos(ang - .36) * size, end[1] - Math.sin(ang - .36) * size);
  ctx.lineTo(end[0] - Math.cos(ang + .36) * size, end[1] - Math.sin(ang + .36) * size);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// "Push here": the hollow arrow of origami diagrams, pointing at p from the direction ang.
export function pushArrow(ctx, p, ang, P = PALETTE, len = 26, gap = 7) {
  ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang);
  ctx.strokeStyle = P.ink; ctx.fillStyle = P.hand; ctx.lineWidth = 1.1; ctx.lineJoin = 'round';
  const x0 = -gap, h = 7, w = 3.2;
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 - 10, -h); ctx.lineTo(x0 - 10, -w); ctx.lineTo(x0 - len, -w); ctx.lineTo(x0 - len, w); ctx.lineTo(x0 - 10, w); ctx.lineTo(x0 - 10, h); ctx.closePath();
  ctx.fill(); ctx.stroke(); ctx.restore();
}

// Short strokes around a fingertip that presses the paper.
export function pressMarks(ctx, p, ang = -Math.PI / 2, P = PALETTE, r = 7.5, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = P.ink; ctx.lineWidth = .95; ctx.lineCap = 'round';
  for (const d of [-.62, 0, .62]) { const a = ang + d; ctx.beginPath(); ctx.moveTo(p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r); ctx.lineTo(p[0] + Math.cos(a) * (r + 4.6), p[1] + Math.sin(a) * (r + 4.6)); ctx.stroke(); }
  ctx.restore();
}

// A step number in a circle.
export function stepCircle(ctx, x, y, r, text, P = PALETTE, font = '"Zen Maru Gothic"') {
  ctx.save(); ctx.strokeStyle = P.ink; ctx.fillStyle = P.ink; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.font = `700 ${Math.round(r * 1.2)}px ${font}`; ctx.textBaseline = 'middle';
  label(ctx, text, x, y + r * .07, 0, 'center'); ctx.restore();
}

/* ───────────────────────── the sheet ───────────────────────── */
// The 15 cm sheet as a unit square (x right, y down, the plane's nose at the top), folded in steps. Each state is a
// stack of flat facets, bottom to top; a facet keeps its outline in sheet coordinates and an affine map M to where
// it lies now. A fold splits the chosen facets along a line and reflects one side across it; while it is under way
// that side turns about the line in 3D, drawn in an oblique view where height lifts the paper up the page.
const ID = [1, 0, 0, 1, 0, 0];
const ap = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
function inv(M) { const d = M[0] * M[3] - M[1] * M[2]; return [M[3] / d, -M[1] / d, -M[2] / d, M[0] / d, (M[2] * M[5] - M[3] * M[4]) / d, (M[1] * M[4] - M[0] * M[5]) / d]; }
function reflection(p, q) {
  const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
  const a = 2 * ux * ux - 1, b = 2 * ux * uy, d = 2 * uy * uy - 1;
  return [a, b, b, d, p[0] - a * p[0] - b * p[1], p[1] - b * p[0] - d * p[1]];
}
const sideOf = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
function clipPoly(poly, p, q, keep) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], sa = sideOf(p, q, a) * keep, sb = sideOf(p, q, b) * keep;
    if (sa >= -1e-9) out.push(a);
    if ((sa > 1e-9 && sb < -1e-9) || (sa < -1e-9 && sb > 1e-9)) { const t = sa / (sa - sb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out.length >= 3 ? out : null;
}
const area = poly => { let s = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };

export function flatSheet() { return [{ poly: [[0, 0], [1, 0], [1, 1], [0, 1]], M: ID, tag: '' }]; }

// fold = { line: [p, q] (where the paper lies now), side: a point on the side that moves, kind: 'valley' | 'mountain',
//          select(facet): which facets take part (default all), tag: a label for the facets that move }
// Returns { before: the split stack with moving flags, after: the folded stack }.
export function applyFold(stack, fold) {
  const [p, q] = fold.line, keep = Math.sign(sideOf(p, q, fold.side)) || 1, R = reflection(p, q);
  const before = [];
  for (const f of stack) {
    if (fold.select && !fold.select(f)) { before.push({ ...f, moving: false }); continue; }
    const cur = f.poly.map(v => ap(f.M, v)), Mi = inv(f.M);
    const mov = clipPoly(cur, p, q, keep), sta = clipPoly(cur, p, q, -keep);
    if (sta && Math.abs(area(sta)) > 1e-7) before.push({ ...f, poly: sta.map(v => ap(Mi, v)), moving: false });
    if (mov && Math.abs(area(mov)) > 1e-7) before.push({ ...f, poly: mov.map(v => ap(Mi, v)), moving: true });
  }
  const moving = before.filter(f => f.moving).reverse().map(f => ({ poly: f.poly, M: mul(R, f.M), tag: fold.tag ?? f.tag }));
  const still = before.filter(f => !f.moving).map(f => ({ poly: f.poly, M: f.M, tag: f.tag }));
  return { before, after: fold.kind === 'mountain' ? [...moving, ...still] : [...still, ...moving] };
}

// Where a point of a facet lies on the page while a fold turns its side by theta (0 to π).
export const OBLIQUE = { k: .42, kx: .2 };
export function placer(view, fold, theta, moving) {
  const { ox, oy, s, k = OBLIQUE.k, kx = OBLIQUE.kx } = view;
  if (!moving || !fold) return p => [ox + p[0] * s, oy + p[1] * s];
  const [a, b] = fold.line, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
  const sgn = fold.kind === 'mountain' ? -1 : 1, c = Math.cos(theta), sn = Math.sin(theta);
  return p => {
    const rx = p[0] - a[0], ry = p[1] - a[1], along = rx * ux + ry * uy, nx = rx - along * ux, ny = ry - along * uy;
    const d = Math.hypot(nx, ny), ex = d ? nx / d : 0, ey = d ? ny / d : 0;
    const X = a[0] + along * ux + ex * d * c, Y = a[1] + along * uy + ey * d * c, Z = sgn * d * sn;
    return [ox + (X + Z * kx) * s, oy + (Y - Z * k) * s];
  };
}

// What is printed on the front of the sheet, in sheet coordinates: the centre stripes with a ring at the tail,
// the wing lines and two targets at the corners.
export const WING = [[.5, 0], [.82, 1]];
const PRINT = {
  lines: [
    [[.488, .07], [.488, .93]], [[.512, .07], [.512, .93]],
    [[.5, 0], [.82, 1]], [[.5, 0], [.18, 1]],
  ],
  rings: [[.5, .955, .02], [.07, .07, .022], [.93, .07, .022]],
};

// Draw a stack. fold/theta animate the facets marked moving; P is the palette. Edges lying along hide (a line
// where the paper lies) are left out: a crease that is not yet folded is not an edge.
export function drawStack(ctx, stack, view, { fold = null, theta = 0, P = PALETTE, edge = 1.6, print = true, hide = null } = {}) {
  const items = stack.map((f, i) => {
    const place = placer(view, fold, theta, f.moving), cur = f.poly.map(v => ap(f.M, v)), pts = cur.map(place);
    return { f, i, place, cur, pts, front: Math.sign(area(pts)) === Math.sign(area(f.poly)) };
  });
  const onHide = p => hide && Math.abs(sideOf(hide[0], hide[1], p)) / Math.hypot(hide[1][0] - hide[0][0], hide[1][1] - hide[0][1]) < 1e-6;
  // Moving facets turn above the rest for a valley fold and below it for a mountain fold; past half way their order flips.
  const still = items.filter(x => !x.f.moving), moving = items.filter(x => x.f.moving);
  if (theta > Math.PI / 2) moving.reverse();
  const order = fold && fold.kind === 'mountain' ? [...moving, ...still] : [...still, ...moving];
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const { f, place, cur, pts, front } of order) {
    const path = () => { ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
    path(); ctx.fillStyle = front ? P.front : P.back; ctx.fill();
    if (front && print) {
      ctx.save(); path(); ctx.clip();
      ctx.strokeStyle = P.blue; ctx.lineWidth = 1.05;
      const map = v => place(ap(f.M, v));
      for (const [a, b] of PRINT.lines) { const A = map(a), B = map(b); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); }
      for (const [cx, cy, r] of PRINT.rings) { ctx.beginPath(); for (let j = 0; j <= 28; j++) { const a = j / 28 * TAU, m = map([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); j ? ctx.lineTo(m[0], m[1]) : ctx.moveTo(m[0], m[1]); } ctx.stroke(); }
      ctx.restore();
    }
    ctx.strokeStyle = P.ink; ctx.lineWidth = edge;
    if (!hide) { path(); ctx.stroke(); continue; }
    ctx.beginPath();
    for (let j = 0; j < pts.length; j++) { const k = (j + 1) % pts.length; if (onHide(cur[j]) && onHide(cur[k])) continue; ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(pts[k][0], pts[k][1]); }
    ctx.stroke();
  }
  // a flap turning behind the paper shows through as hidden (x-ray) lines
  if (fold && fold.kind === 'mountain' && theta > .02 && theta < Math.PI - .02) {
    ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = .9; ctx.setLineDash([1.4, 3]); ctx.globalAlpha *= .7;
    for (const { pts } of moving) { ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}

// The bounding box of a stack as it lies (sheet units).
export function stackBox(stack) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const f of stack) for (const v of f.poly) { const p = ap(f.M, v); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  return [x0, y0, x1, y1];
}
export const toSheet = (f, v) => ap(f.M, v);

/* ───────────────────────── the robot hands ───────────────────────── */
// A five-fingered robot hand seen from above, palm down, fingers pointing along -y in its own frame (the wrist at
// the origin, about 100 units to the middle fingertip). Each finger is three shell links on hinge barrels, the last
// one capped by a fingertip sensor pad; the thumb is three links from the side of the palm. A pose gives each joint's
// flexion in radians (bending into the page shortens a link as seen from above); poses blend, so a hand can move
// between them. The thumb can aim at the index fingertip, to pinch.
const FINGERS = [
  { x: -13, y: -44, len: [21, 14, 12], w: 9, splay: -.06 },     // index
  { x: -4.3, y: -46, len: [23, 15, 12.5], w: 9.4, splay: -.015 },// middle
  { x: 4.5, y: -45, len: [21.5, 14, 12], w: 9, splay: .03 },     // ring
  { x: 12.9, y: -41.5, len: [17.5, 12, 10.5], w: 8.2, splay: .09 },// little
];
const THUMB = { x: -15.5, y: -16, len: [15, 13.5, 12], w: 10.2 };
const CURLED = [1.2, 1.3, .85];
export const POSES = {
  rest: { f: [[.3, .35, .2], [.3, .35, .2], [.35, .4, .25], [.4, .45, .3]], thumb: { ang: -.8, curl: [.15, .2, .15] } },
  // index straight down onto the paper, the others curled under, the thumb tucked
  press: { f: [[.55, .45, .35], CURLED, CURLED, CURLED], thumb: { ang: -.42, curl: [.4, .6, .5] } },
  // index and middle flat on the paper
  pin: { f: [[.22, .16, .1], [.22, .16, .1], [.95, 1.05, .7], [1, 1.1, .75]], thumb: { ang: -.85, curl: [.12, .14, .1] } },
  // thumb and index together, holding a corner
  pinch: { f: [[.32, .5, .38], [.9, 1, .7], CURLED, CURLED], thumb: { ang: -.5, curl: [.15, .2, .15], aim: 1 } },
  // index flat and straight, to slide under paper
  slide: { f: [[.05, .04, .02], [.6, .65, .45], CURLED, CURLED], thumb: { ang: -.7, curl: [.2, .25, .2] } },
  // open, about to pinch
  open: { f: [[.35, .28, .18], [.5, .5, .3], [.75, .85, .55], [.8, .9, .6]], thumb: { ang: -.95, curl: [.12, .1, .08] } },
};
export function blendPose(a, b, t) {
  if (t <= 0) return a; if (t >= 1) return b;
  return { f: a.f.map((j, i) => j.map((v, k) => lerp(v, b.f[i][k], t))), thumb: { ang: lerp(a.thumb.ang, b.thumb.ang, t), curl: a.thumb.curl.map((v, k) => lerp(v, b.thumb.curl[k], t)), aim: lerp(a.thumb.aim || 0, b.thumb.aim || 0, t) } };
}

// Joint positions of one finger, from the knuckle: each link is seen shortened by the cosine of its total flexion.
// Links that point down and back under the hand (total flexion past about 80 degrees) are hidden.
function chain(x, y, dir, len, flex) {
  const pts = [[x, y]]; let total = 0, a = dir, shown = 0;
  len.forEach((l, i) => { total += flex[i]; const k = Math.max(.18, Math.cos(total)); x += Math.sin(a) * l * k; y -= Math.cos(a) * l * k; pts.push([x, y]); a += dir * .2; if (total < 1.4) shown = i + 1; });
  pts.shown = Math.max(1, shown);
  return pts;
}
function handGeometry(pose) {
  const fingers = FINGERS.map((f, i) => ({ w: f.w, pts: chain(f.x, f.y, f.splay, f.len, pose.f[i]) }));
  let tp = chain(THUMB.x, THUMB.y, pose.thumb.ang, THUMB.len, pose.thumb.curl);
  const aim = pose.thumb.aim || 0;
  if (aim > 0) {
    // turn and stretch the thumb about its base so its tip meets the index fingertip, just beside it
    const ix = tipOf(fingers[0]), b = tp[0], t = tp[3], target = [ix[0] - 7.5, ix[1] + 1.5];
    const a0 = Math.atan2(t[1] - b[1], t[0] - b[0]), a1 = Math.atan2(target[1] - b[1], target[0] - b[0]);
    const k = clamp(Math.hypot(target[0] - b[0], target[1] - b[1]) / Math.hypot(t[0] - b[0], t[1] - b[1]), .6, 1.25);
    const da = (a1 - a0) * aim, kk = 1 + (k - 1) * aim, c = Math.cos(da), s = Math.sin(da);
    const shown = tp.shown;
    tp = tp.map(p => { const x = (p[0] - b[0]) * kk, y = (p[1] - b[1]) * kk; return [b[0] + x * c - y * s, b[1] + x * s + y * c]; });
    tp.shown = shown;
  }
  return { fingers, thumb: { w: THUMB.w, pts: tp, thumb: true } };
}
const tipOf = f => f.pts[f.pts.shown ?? f.pts.length - 1];
// Where a hand touches, in its own frame: one fingertip, or between two.
// A pinch is only between the two tips once the thumb has reached the index; before that it is the index tip.
function anchorOf(g, anchor, aim = 1) {
  const ix = tipOf(g.fingers[0]), mid = tipOf(g.fingers[1]), th = tipOf(g.thumb);
  if (anchor === 'pin') return [(ix[0] + mid[0]) / 2, (ix[1] + mid[1]) / 2];
  if (anchor === 'pinch') return [ix[0] + (th[0] - ix[0]) * aim / 2, ix[1] + (th[1] - ix[1]) * aim / 2];
  return ix;
}

// A shell link from a to b: squared ends with rounded corners, or a domed far end for a fingertip.
function linkPath(c, a, b, wa, wb, dome) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
  const ux = Math.cos(ang), uy = Math.sin(ang), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ra = Math.min(wa * .32, L * .3);
  const P = (p, along, across) => [p[0] + ux * along + nx * across, p[1] + uy * along + ny * across];
  let q = P(a, 0, wa / 2 - ra); c.moveTo(q[0], q[1]);
  q = P(a, ra, wa / 2); c.quadraticCurveTo(...P(a, 0, wa / 2), ...q);
  if (dome) {
    const r = wb / 2, e = P(b, -r, 0);
    q = P(e, 0, r); c.lineTo(q[0], q[1]);
    c.arc(e[0], e[1], r, ang + Math.PI / 2, ang - Math.PI / 2, true);
  } else {
    const rb = Math.min(wb * .32, L * .3);
    q = P(b, -rb, wb / 2); c.lineTo(q[0], q[1]); c.quadraticCurveTo(...P(b, 0, wb / 2), ...P(b, 0, wb / 2 - rb));
    q = P(b, 0, -wb / 2 + rb); c.lineTo(q[0], q[1]); c.quadraticCurveTo(...P(b, 0, -wb / 2), ...P(b, -rb, -wb / 2));
  }
  q = P(a, ra, -wa / 2); c.lineTo(q[0], q[1]); c.quadraticCurveTo(...P(a, 0, -wa / 2), ...P(a, 0, -wa / 2 + ra));
  c.closePath();
}
// A hinge barrel across a joint at p, for a finger running at angle ang.
function hingePath(c, p, ang, across, along) {
  const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2), ux = Math.cos(ang), uy = Math.sin(ang), r = Math.min(1.4, along / 2);
  const P = (a, b) => [p[0] + ux * a + nx * b, p[1] + uy * a + ny * b];
  const h = along / 2, w = across / 2;
  let q = P(-h, w - r); c.moveTo(q[0], q[1]);
  c.quadraticCurveTo(...P(-h, w), ...P(-h + r, w)); q = P(h - r, w); c.lineTo(q[0], q[1]);
  c.quadraticCurveTo(...P(h, w), ...P(h, w - r)); q = P(h, -w + r); c.lineTo(q[0], q[1]);
  c.quadraticCurveTo(...P(h, -w), ...P(h - r, -w)); q = P(-h + r, -w); c.lineTo(q[0], q[1]);
  c.quadraticCurveTo(...P(-h, -w), ...P(-h, -w + r)); c.closePath();
}

// One finger as parts, back to front: the hinge barrels, then the links from the tip back, so each knuckle sits on top.
function fingerParts(f) {
  const n = f.pts.shown ?? f.pts.length - 1, parts = [], width = i => f.w * (1 - i * .07), dir = i => Math.atan2(f.pts[i + 1][1] - f.pts[i][1], f.pts[i + 1][0] - f.pts[i][0]);
  for (let i = 0; i < n; i++) {
    const p = f.pts[i], ang = i ? (dir(i - 1) + dir(i)) / 2 : dir(0), across = width(i) * (i ? .82 : .86) + 2.2;
    parts.push({ path: c => hingePath(c, p, ang, across, 4.2), detail: (c, P, w) => { c.lineWidth = w * .6; c.beginPath(); const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2); c.moveTo(p[0] + nx * (across / 2 - 1.3), p[1] + ny * (across / 2 - 1.3)); c.lineTo(p[0] - nx * (across / 2 - 1.3), p[1] - ny * (across / 2 - 1.3)); c.stroke(); } });
  }
  for (let i = n - 1; i >= 0; i--) {
    // the last link shown ends in a dome: a fingertip, or the knuckle of a finger curled under
    const a0 = f.pts[i], b0 = f.pts[i + 1], ang = dir(i), L = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]), tip = i === n - 1, pad = tip && n === f.pts.length - 1;
    const g0 = Math.min(1.5, L * .2), g1 = tip ? 0 : Math.min(1.5, L * .2);
    const a = [a0[0] + Math.cos(ang) * g0, a0[1] + Math.sin(ang) * g0], b = [b0[0] - Math.cos(ang) * g1, b0[1] - Math.sin(ang) * g1];
    const wa = width(i), wb = width(i + 1) * (tip ? .98 : 1);
    parts.push({
      path: c => linkPath(c, a, b, wa, wb, tip),
      detail: (c, P, w) => {
        const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2), l = Math.hypot(b[0] - a[0], b[1] - a[1]);
        // a light side, so the links read as round
        c.save(); c.beginPath(); linkPath(c, a, b, wa, wb, tip); c.clip();
        c.fillStyle = P.shade || 'rgba(31, 35, 40, .07)'; c.beginPath();
        c.moveTo(a[0] - nx * wa * .18, a[1] - ny * wa * .18); c.lineTo(b[0] - nx * wb * .18, b[1] - ny * wb * .18);
        c.lineTo(b[0] - nx * wb, b[1] - ny * wb); c.lineTo(a[0] - nx * wa, a[1] - ny * wa); c.closePath(); c.fill();
        if (pad && l > 3) {
          // the fingertip sensor pad: a cap beyond a seam
          const s = Math.max(.25, 1 - (wb * .62) / l), m = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
          c.fillStyle = P.pad; c.beginPath(); c.moveTo(m[0] + nx * wb, m[1] + ny * wb); c.lineTo(m[0] - nx * wb, m[1] - ny * wb);
          c.lineTo(b[0] - nx * wb + Math.cos(ang) * 3, b[1] - ny * wb + Math.sin(ang) * 3); c.lineTo(b[0] + nx * wb + Math.cos(ang) * 3, b[1] + ny * wb + Math.sin(ang) * 3); c.closePath(); c.fill();
          c.lineWidth = w * .7; c.beginPath(); c.moveTo(m[0] + nx * wb / 2, m[1] + ny * wb / 2); c.lineTo(m[0] - nx * wb / 2, m[1] - ny * wb / 2); c.stroke();
        }
        c.restore();
      },
    });
  }
  return parts;
}

// The parts of a hand, back to front; each has an outline and the details drawn on it.
// The forearm is cut off a little way past the wrist, its end left open, as hands are in diagrams; on the cover it
// runs off the page instead (arm).
function partsList(pose, arm) {
  const g = handGeometry(pose), list = [], ew = 15 + 3 * Math.min(1, arm / 300);
  list.push({ // forearm, with a wrist joint and a cable bundle
    path: c => { c.moveTo(-15, 7); c.lineTo(-ew, arm); c.lineTo(ew, arm); c.lineTo(15, 7); c.closePath(); },
    edge: c => { c.moveTo(-ew, arm); c.lineTo(-15, 7); c.lineTo(15, 7); c.lineTo(ew, arm); },
    detail: (c, P, w) => {
      c.lineWidth = w * .7; c.beginPath(); c.moveTo(-15.4, 14); c.lineTo(15.4, 14); c.moveTo(-15.6, 18.5); c.lineTo(15.6, 18.5); c.stroke();
      const f = arm / 320;
      c.beginPath(); c.moveTo(7.5, 21); c.bezierCurveTo(12, 21 + 59 * f, 4, 21 + 129 * f, 9.5, arm); c.moveTo(11, 21); c.bezierCurveTo(15.5, 21 + 61 * f, 7.5, 21 + 131 * f, 13, arm); c.stroke();
    },
  });
  list.push({ // the wrist joint: a short drum between forearm and palm
    path: c => hingePath(c, [0, 4.5], -Math.PI / 2, 33, 5.5),
    detail: () => {},
  });
  // the thumb comes out from under the side of the palm; reaching for the index fingertip, it crosses over it
  const thumbOver = (pose.thumb.aim || 0) > .5;
  if (!thumbOver) list.push(...fingerParts(g.thumb));
  list.push({ // the palm: a shell plate with a cover panel
    path: c => { c.moveTo(-15, 2); c.bezierCurveTo(-17.5, -10, -21, -22, -19.5, -35); c.quadraticCurveTo(-18.5, -46.5, -8.5, -47.5); c.lineTo(9.5, -47); c.quadraticCurveTo(19, -45.5, 18.5, -34); c.bezierCurveTo(18.5, -21, 16.8, -9, 15, 2); c.closePath(); },
    detail: (c, P, w) => {
      c.save(); c.beginPath(); c.moveTo(19, -34); c.bezierCurveTo(19, -21, 17, -9, 15, 2); c.lineTo(9, 2); c.bezierCurveTo(11, -10, 12.5, -22, 12.5, -40); c.closePath(); c.fillStyle = P.shade || 'rgba(31, 35, 40, .07)'; c.fill(); c.restore();
      c.lineWidth = w * .7; c.beginPath(); c.moveTo(-12, -9); c.lineTo(-13.5, -33); c.quadraticCurveTo(-13.2, -40, -7, -40.5); c.lineTo(7.5, -40.2); c.quadraticCurveTo(13, -39.5, 12.8, -33); c.lineTo(11.5, -9); c.quadraticCurveTo(0, -6.5, -12, -9); c.closePath(); c.stroke();
      c.lineWidth = w * .6; for (const [x, y] of [[-10.2, -12], [9.8, -12], [-10.8, -36.4], [9.6, -36.2]]) { c.beginPath(); c.arc(x, y, .85, 0, TAU); c.stroke(); }
    },
  });
  if (thumbOver) list.push(...fingerParts(g.thumb));
  // fingers from the little finger in
  for (let i = g.fingers.length - 1; i >= 0; i--) list.push(...fingerParts(g.fingers[i]));
  return { list, g };
}

// Draw a hand. at: where its anchor touches (or hovers over); angle: the direction the fingers point (0 = up the
// page); lift: height above the paper, drawn the way lifted paper is. Returns the anchor's page position.
export function robotHand(ctx, { at, angle = 0, scale = 1, side = 'right', pose = POSES.press, anchor = 'index', lift = 0, P = PALETTE, k = OBLIQUE.k, kx = OBLIQUE.kx, arm = 50 }) {
  const { list, g } = partsList(pose, arm), mirror = side === 'left' ? -1 : 1, an = anchorOf(g, anchor, pose.thumb.aim || 0);
  const sc = scale * (1 + lift * .004);
  const c = Math.cos(angle), s = Math.sin(angle), ax = an[0] * mirror * sc, ay = an[1] * sc;
  const tx = at[0] + lift * kx - (ax * c - ay * s), ty = at[1] - lift * k - (ax * s + ay * c);
  ctx.save(); ctx.translate(tx, ty); ctx.rotate(angle); ctx.scale(mirror * sc, sc);
  ctx.lineJoin = ctx.lineCap = 'round';
  const w = 1 / sc;
  // the silhouette first, a little heavier than the lines inside it
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2.6 * w;
  for (const p of list) { ctx.beginPath(); (p.edge || p.path)(ctx); ctx.stroke(); }
  for (const p of list) {
    ctx.beginPath(); p.path(ctx); ctx.fillStyle = P.hand; ctx.fill();
    ctx.save(); ctx.strokeStyle = P.ink; p.detail(ctx, P, w); ctx.restore();
    ctx.beginPath(); (p.edge || p.path)(ctx); ctx.strokeStyle = P.ink; ctx.lineWidth = .95 * w; ctx.stroke();
  }
  ctx.restore();
  return [at[0] + lift * kx, at[1] - lift * k];
}
