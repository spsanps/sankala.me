/* The apse in mosaic: the pieces the page's CSS is built from, printed by the stills script
   (scripts/publishing/render-home.mjs). They are laid in regular courses, the way a mosaicist sets
   a border: every stone cut to its course, a joint between stones, corners turned with a cut stone.
   Because they repeat, CSS can size them to any text:
     frameTile    the border-image for a marble tablet: four courses (dark, gold, porphyry, gold)
                  with four corners and edges that repeat seamlessly
     steleHead    the stele's round head for one width: the same courses along a segmental arch,
                  turning down the sides to a joint where the border-image takes over
     courses      the wall below the cornice: lapis in level courses with gold stars, a repeating tile
     frieze       the border where the mosaic ends: lapis, dark, gold, porphyry, gold, dark
     loose        a few stones lying on the plaster, as if the setters had just stopped
     marble       the book-matched marble slab the words are written on
     socialCard   the share card
   All printed at twice their CSS size unless noted. */
import { mix, clamp, smooth, rgb, fbm, mulberry32 } from './core.js';
import { paintArch, paintPlace } from './paint.js';
import { RI, RO, C as CORNICE, FRAMES, steleRise, HEAD_EXTRA, FAMILIES } from './layout.js';
export { steleClip } from './layout.js';

const P = {
  marble: rgb('#f7f2e6'), vein: rgb('#dcd2bf'), vein2: rgb('#cbbfa7'), warm: rgb('#f3e8d2'),
  gold: [rgb('#d9ad4f'), rgb('#e8c46a'), rgb('#c0913a'), rgb('#f0d488')], red: rgb('#8e2c27'), redLit: rgb('#a8392f'),
  outline: rgb('#231d18'), grout: rgb('#3e392f'), lapis: rgb('#213573'), lapisLit: rgb('#2c4590'), lapisDeep: rgb('#152250'),
  lapisHi: rgb('#3a56a8'), pearl: rgb('#f4efe2'), cream: rgb('#e9dfc8'), plaster: rgb('#efe8d9'),
};
const css = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const canvas = (w, h) => new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));

/* ───────── stones as polygons ───────── */
/** move every edge of a convex polygon (clockwise on screen) inward by d */
function inset(pts, d) {
  const n = pts.length, lines = [];
  let area = 0; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = area > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l * sgn, ny = dx / l * sgn;                       // inward normal
    lines.push([a[0] + nx * d, a[1] + ny * d, dx, dy]);
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const A = lines[(i + n - 1) % n], Bl = lines[i], den = A[2] * Bl[3] - A[3] * Bl[2];
    if (Math.abs(den) < 1e-9) { out.push([Bl[0], Bl[1]]); continue; }
    const t = ((Bl[0] - A[0]) * Bl[3] - (Bl[1] - A[1]) * Bl[2]) / den;
    out.push([A[0] + A[2] * t, A[1] + A[3] * t]);
  }
  return out;
}
/** keep the part of a polygon where a·x + b·y + c >= 0 */
function clipHalf(pts, a, b, c) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], fp = a * p[0] + b * p[1] + c, fq = a * q[0] + b * q[1] + c;
    if (fp >= 0) out.push(p);
    if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return out;
}
/** a stone: a cell inset by half a joint, its corners nudged a little, filled, with a lit upper-left
    edge and a shaded lower-right one */
function stone(c, cell, col, s, rnd, joint = .17) {
  let pts = inset(cell, s * joint / 2);
  if (pts.length < 3) return;
  pts = pts.map(([x, y]) => [x + (rnd() - .5) * s * .07, y + (rnd() - .5) * s * .07]);
  c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
  c.fillStyle = css(col); c.fill();
  const dark = col[0] + col[1] + col[2] < 200;
  c.lineWidth = Math.max(.9, s * .07);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1];
    const lit = (dy - dx) > 0;   // the outward normal (dy, -dx) points up-left
    c.strokeStyle = lit ? (dark ? 'rgba(255,250,236,.16)' : 'rgba(255,253,244,.28)') : 'rgba(30,22,12,.2)';
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  }
}
/** the joint behind a stone: its cell, tinted half way between the grout and the stone */
function joint(c, cell, col, grout) { c.beginPath(); cell.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = css(mix(grout, col, .45)); c.fill(); }
const lay = (c, cells, s, rnd, grout) => { for (const [cell, col] of cells) joint(c, inset(cell, s * .02), col, grout); for (const [cell, col] of cells) stone(c, cell, col, s, rnd); };

/** split a length into n stone lengths around `s`, summing exactly to `len` */
function lengths(len, s, rnd, spread = .45) {
  const n = Math.max(1, Math.round(len / (s * 1.05))), raw = Array.from({ length: n }, () => 1 - spread / 2 + spread * rnd());
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map(v => v / sum * len);
}
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

/* the frame's four courses, outside in */
const COURSES = ['outline', 'gold', 'red', 'gold'];
function courseColour(kind, rnd) {
  if (kind === 'outline') return mix(P.outline, [0, 0, 0], rnd() * .15);
  if (kind === 'red') return mix(P.red, P.redLit, rnd() * .6);
  return mix(P.gold[(rnd() * 4) | 0], [255, 250, 236], rnd() < .1 ? .12 : 0);
}

/** The border-image for a rectangular tablet: corners `fw` square and edge segments `per` long,
    so the image is (2 fw + per) square. `kind` is 'wide' or 'phone'. */
export function frameTile({ kind = 'wide', scale = 2 } = {}) {
  const s = FRAMES[kind].stone * scale, n = COURSES.length, fw = s * n, per = s * 12, W = 2 * fw + per;
  const cv = canvas(W, W), c = cv.getContext('2d'), rnd = mulberry32(kind === 'wide' ? 5 : 9);
  c.fillStyle = css(P.grout); c.fillRect(0, 0, W, W);
  const cells = [];
  const push = (cell, k) => cells.push([cell, courseColour(COURSES[k], rnd)]);
  for (let k = 0; k < n; k++) {
    const a = k * s, b = (k + 1) * s;
    // the four corner stones of course k
    for (const [x, y] of [[a, a], [W - b, a], [a, W - b], [W - b, W - b]]) push(rect(x, y, x + s, y + s), k);
    // within the corner slices: the course's runs from its corner stone to the slice's edge
    const run = (from, to, fixed, vertical) => { let p = from; for (const l of lengths(to - from, s, rnd)) { push(vertical ? rect(fixed, p, fixed + s, p + l) : rect(p, fixed, p + l, fixed + s), k); p += l; } };
    if (fw - b > .5) {
      run(b, fw, a, true); run(b, fw, a, false);                     // top left
      run(b, fw, W - b, true); run(W - fw, W - b, a, false);         // top right
      run(W - fw, W - b, a, true); run(b, fw, W - b, false);         // bottom left
      run(W - fw, W - b, W - b, true); run(W - fw, W - b, W - b, false);   // bottom right
    }
    // the edges: one repeat, the same pattern on opposite sides so the tile is consistent
    const L = lengths(per, s, rnd), cols = L.map(() => courseColour(COURSES[k], rnd));
    let p = fw;
    L.forEach((l, i) => {
      cells.push([rect(p, a, p + l, b), cols[i]]); cells.push([rect(p, W - b, p + l, W - a), cols[i]]);
      cells.push([rect(a, p, b, p + l), cols[i]]); cells.push([rect(W - b, p, W - a, p + l), cols[i]]);
      p += l;
    });
  }
  // the field inside is never shown (border-image-slice has no fill); leave it grout
  lay(c, cells, s, rnd, P.grout);
  cv.meta = { slice: fw, width: fw / scale, per: per / scale };
  return cv;
}

/** The stele's round head for a stele `width` css px wide: the four courses along a segmental arch
    (the circle through both shoulders and the crown, `rise` above the shoulders), turning down the
    sides with a cut corner stone, to a joint `HEAD_EXTRA` stones below the inner shoulder. Inside
    and outside are transparent: the stele's marble and the wall show through. */
export function steleHead({ kind = 'wide', width, scale = 2 } = {}) {
  const s0 = FRAMES[kind].stone, rise0 = steleRise(width, kind), n = COURSES.length;
  const half0 = width / 2, r00 = (half0 * half0 + rise0 * rise0) / (2 * rise0);
  // the inner shoulder: where the innermost course's inner circle meets its side line
  const dIn = n * s0, yIn = r00 - Math.sqrt((r00 - dIn) ** 2 - (half0 - dIn) ** 2);
  const headH0 = Math.ceil(yIn + HEAD_EXTRA * s0);
  const s = s0 * scale, W = width * scale, H = headH0 * scale, R0 = rise0 * scale, half = W / 2, r0 = (half * half + R0 * R0) / (2 * R0), cx = half, cy = r0;
  const cv = canvas(W, H), c = cv.getContext('2d'), rnd = mulberry32(width * 7 + (kind === 'wide' ? 1 : 2));
  const yOn = (r, x) => cy - Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
  const cells = [];
  for (let k = 0; k < n; k++) {
    const d1 = k * s, d2 = (k + 1) * s, ro = r0 - d1, ri = r0 - d2, rm = (ro + ri) / 2, kind2 = COURSES[k];
    // the corner stones, left and right: from the outer arc down to where the inner arc meets x = d2
    const y3 = yOn(ri, d2), yTop1 = yOn(ro, d1), yTop2 = yOn(ro, d2);
    const cornerL = [[d1, yTop1], [d2, yTop2], [d2, y3], [d1, y3]];
    const cornerR = cornerL.map(([x, y]) => [W - x, y]).reverse();
    cells.push([cornerL, courseColour(kind2, rnd)], [cornerR, courseColour(kind2, rnd)]);
    // the arch: radial joints between the corners
    const thL = Math.atan2(yOn(rm, d2) - cy, d2 - cx), thR = Math.atan2(yOn(rm, W - d2) - cy, W - d2 - cx);
    const span = thR - thL, Ls = lengths(rm * span, s, rnd, .3);
    let th = thL;
    Ls.forEach((l, i) => {
      const t2 = th + l / rm;
      let cell = [[cx + ro * Math.cos(th), cy + ro * Math.sin(th)], [cx + ro * Math.cos(t2), cy + ro * Math.sin(t2)], [cx + ri * Math.cos(t2), cy + ri * Math.sin(t2)], [cx + ri * Math.cos(th), cy + ri * Math.sin(th)]];
      // the first and last stones of the course are cut to the corner stones' upright edge
      if (i === 0) cell = clipHalf(cell, 1, 0, -d2);
      if (i === Ls.length - 1) cell = clipHalf(cell, -1, 0, W - d2);
      if (cell.length >= 3) cells.push([cell, courseColour(kind2, rnd)]);
      th = t2;
    });
    // down the sides from the corner stone to the head's foot
    let y = y3;
    for (const l of lengths(H - y3, s, rnd)) {
      cells.push([rect(d1, y, d2, y + l), courseColour(kind2, rnd)]);
      cells.push([rect(W - d2, y, W - d1, y + l), courseColour(kind2, rnd)]);
      y += l;
    }
  }
  // the bed: the band of the frame only (the outline minus the field), so inside stays clear
  c.save();
  c.beginPath(); outlinePath(c, W, H + 2, R0, 0); outlinePath(c, W, H + 2, R0, n * s, true); c.fillStyle = css(P.grout); c.fill('evenodd');
  c.clip('evenodd');
  lay(c, cells, s, rnd, P.grout);
  c.restore();
  cv.meta = { rise: rise0, headH: headH0, r: r00, frame: n * s0 };
  return cv;
}
/** a round-headed outline inset by f (css: x from f to W − f; the field's shoulders follow the inset circle) */
function outlinePath(c, W, H, R0, f, reverse = false) {
  const half = W / 2, r0 = (half * half + R0 * R0) / (2 * R0), ri = r0 - f, hi = half - f;
  const a = Math.asin(Math.min(1, hi / ri)), ys = r0 - Math.cos(a) * ri;
  if (!reverse) { c.moveTo(f, ys); c.arc(half, r0, ri, -Math.PI / 2 - a, -Math.PI / 2 + a, false); c.lineTo(W - f, H); c.lineTo(f, H); c.closePath(); }
  else { c.moveTo(f, H); c.lineTo(W - f, H); c.lineTo(W - f, ys); c.arc(half, r0, ri, -Math.PI / 2 + a, -Math.PI / 2 - a, true); c.closePath(); }
}
/* ───────── level courses ───────── */
/** Stones in level courses across a w × h tile that repeats in both directions; `colour(x, y, rnd)`
    picks each stone's colour; `stars` are [x, y, size] gold stars set into the courses (with wrap). */
function coursedTile(c, w, h, s, rnd, colour, stars = []) {
  const rows = Math.round(h / s), rh = h / rows, cells = [];
  // each star: its pieces reach `ext`; a ring of small stones from r1 to r2 sets it into the courses
  const rings = stars.map(([x, y, size]) => { const ext = s * (size ? 1.4 : .42), r1 = ext + s * .02, r2 = r1 + s * .78; return { x, y, size, r1, r2 }; });
  const near = (x, y) => { let best = null, bd = 1e9; for (const g of rings) for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { const d = Math.hypot(x - g.x - ox, y - g.y - oy); if (d < bd) { bd = d; best = { g, cx: g.x + ox, cy: g.y + oy, d }; } } return best; };
  for (let r = 0; r < rows; r++) {
    const y0 = r * rh, Ls = lengths(w, s, rnd); let x = rnd() * s;   // each course starts at its own offset and wraps
    for (const l of Ls) {
      const col = colour((x + l / 2) % w, y0 + rh / 2, rnd);
      for (const ox of x + l > w ? [0, -w] : [0]) {
        let cell = rect(x + ox, y0, x + l + ox, y0 + rh);
        const mx = x + ox + l / 2, my = y0 + rh / 2, n = near(mx, my);
        if (n && n.d < n.g.r2 + s * .1) continue;                                      // inside the ring
        if (n && n.d < n.g.r2 + s * .9) {                                              // cut straight along the ring
          const nx = (mx - n.cx) / n.d, ny = (my - n.cy) / n.d;
          cell = clipHalf(cell, nx, ny, -(nx * n.cx + ny * n.cy) - n.g.r2 - s * .05);
          if (cell.length < 3) continue;
        }
        cells.push([cell, col]);
      }
      x += l;
    }
  }
  // the ring of small stones round each star, then the star itself
  const ring = [], star = [];
  for (const g of rings) {
    const { x, y, size, r1, r2 } = g, rm = (r1 + r2) / 2, m = Math.max(5, Math.round(2 * Math.PI * rm / (s * .8)));
    const a0 = rnd() * Math.PI;
    for (let i = 0; i < m; i++) {
      const a = a0 + i / m * Math.PI * 2, a2 = a0 + (i + 1) / m * Math.PI * 2;
      ring.push([[[x + r2 * Math.cos(a), y + r2 * Math.sin(a)], [x + r2 * Math.cos(a2), y + r2 * Math.sin(a2)], [x + r1 * Math.cos(a2), y + r1 * Math.sin(a2)], [x + r1 * Math.cos(a), y + r1 * Math.sin(a)]], colour(x, y, rnd)]);
    }
    const col = rnd() < .06 ? P.pearl : P.gold[(rnd() * 4) | 0], b0 = rnd() * Math.PI;
    const sq = (px, py, l, ww, a) => { const ca = Math.cos(a), sa = Math.sin(a); return [[-l / 2, -ww / 2], [l / 2, -ww / 2], [l / 2, ww / 2], [-l / 2, ww / 2]].map(([u, v]) => [px + u * ca - v * sa, py + u * sa + v * ca]); };
    star.push([sq(x, y, s * (size ? .86 : .7), s * (size ? .86 : .7), b0), col]);
    if (size >= 1) for (let k = 0; k < 4; k++) { const b = b0 + k * Math.PI / 2; star.push([sq(x + Math.cos(b) * s * .98, y + Math.sin(b) * s * .98, s * .78, s * .5, b), col]); }
    if (size === 2) for (let k = 0; k < 4; k++) { const b = b0 + Math.PI / 4 + k * Math.PI / 2; star.push([sq(x + Math.cos(b) * s * 1.02, y + Math.sin(b) * s * 1.02, s * .5, s * .4, b), col]); }
  }
  for (const [cell, col] of [...ring, ...star]) for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) cells.push([cell.map(([x, y]) => [x + ox, y + oy]), col]);
  lay(c, cells, s, rnd, P.grout);
}
/* noise that repeats with the tile: sines with whole periods */
const tileNoise = (x, y, w, h, seed) => {
  let v = 0;
  for (let i = 1; i <= 3; i++) v += Math.sin((x / w) * Math.PI * 2 * i + seed * i * 1.7 + Math.sin((y / h) * Math.PI * 2 * (4 - i) + seed) * 1.3) / i;
  return .5 + v / 3.6;
};

/** The wall below the cornice: lapis in level courses, gold stars. `stonePx` is the stone in image
    px; CSS scales the tile to the apse's stone size. */
export function courses({ stones = 72, rows = 48, stonePx = 12, seed = 3, deep = .38 } = {}) {
  const s = stonePx, w = stones * s, h = rows * s, cv = canvas(w, h), c = cv.getContext('2d'), rnd = mulberry32(seed);
  c.fillStyle = css(mix(P.grout, P.lapisDeep, .5)); c.fillRect(0, 0, w, h);
  // stars scattered, not on a grid: each at least ten stones from the next (counting the wrap)
  const stars = [], minD = s * 10.5;
  for (let tries = 0; tries < 4000 && stars.length < 26; tries++) {
    const x = rnd() * w, y = rnd() * h;
    if (stars.some(([sx, sy]) => { for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) if (Math.hypot(x - sx - ox, y - sy - oy) < minD) return true; return false; })) continue;
    const roll = rnd(); stars.push([x, y, roll < .2 ? 2 : roll < .5 ? 1 : 0]);
  }
  coursedTile(c, w, h, s, rnd, (x, y, r) => {
    let col = mix(P.lapis, P.lapisDeep, deep + (tileNoise(x, y, w, h, seed) - .5) * .5);
    const roll = r(); if (roll < .05) col = mix(col, P.lapisHi, .5); else if (roll < .1) col = mix(col, P.lapisDeep, .6);
    return mix(col, [255, 255, 255], (r() - .5) * .05);
  }, stars);
  cv.meta = { stone: s, stones, rows };
  return cv;
}

/** The border where the mosaic ends, `per` stones long and repeating: two courses of lapis, then
    dark, gold, porphyry, gold, dark. `flip` turns it upside down (the footer's top edge). */
export function frieze({ kind = 'wide', scale = 2, per = 24, flip = false } = {}) {
  const s = FRAMES[kind].stone * scale, rows = ['lapis', 'lapis', 'outline', 'gold', 'red', 'gold', 'outline'], w = per * s, h = rows.length * s;
  const cv = canvas(w, h), c = cv.getContext('2d'), rnd = mulberry32(flip ? 41 : 17);
  c.fillStyle = css(P.grout); c.fillRect(0, 0, w, h);
  const cells = [];
  rows.forEach((kind2, r) => {
    const rr = flip ? rows.length - 1 - r : r, y0 = rr * s; let x = rnd() * s;
    for (const l of lengths(w, s, rnd)) {
      const col = kind2 === 'lapis' ? mix(P.lapis, P.lapisDeep, .3 + rnd() * .4) : courseColour(kind2, rnd);
      for (const ox of x + l > w ? [0, -w] : [0]) cells.push([rect(x + ox, y0, x + l + ox, y0 + s), col]);
      x += l;
    }
  });
  lay(c, cells, s, rnd, P.grout);
  cv.meta = { stone: s / scale, height: h / scale, width: w / scale };
  return cv;
}

/** A few stones lying loose on the plaster below the border, sparser further from it; transparent.
    `flip`: the stones gather at the bottom instead (above the footer's border). */
export function loose({ kind = 'wide', scale = 2, per = 48, rows = 6, flip = false } = {}) {
  const s = FRAMES[kind].stone * scale, w = per * s, h = rows * s, cv = canvas(w, h), c = cv.getContext('2d'), rnd = mulberry32(flip ? 53 : 19);
  const cells = [];
  for (let x = s * .5; x < w; x += s * 1.15) for (let d = 0; d < h; d += s) {
    const p = 1 - d / h; if (rnd() > p * p * .5) continue;
    const z = s * (.55 + .3 * rnd()) * (.75 + .25 * p), a = (rnd() - .5) * .9, cx = x + (rnd() - .5) * s * .8, cy0 = d + s * .5 + (rnd() - .5) * s * .6, cy = flip ? h - cy0 : cy0;
    const col = rnd() < .45 ? P.gold[(rnd() * 4) | 0] : rnd() < .5 ? mix(P.lapis, P.lapisDeep, rnd()) : P.cream;
    const ca = Math.cos(a), sa = Math.sin(a);
    cells.push([[[-z / 2, -z * .42], [z / 2, -z * .42], [z / 2, z * .42], [-z / 2, z * .42]].map(([u, v]) => [cx + u * ca - v * sa, cy + u * sa + v * ca]), col]);
  }
  for (const [cell, col] of cells) {
    // a soft contact shadow on the plaster, then the stone
    c.save(); c.translate(s * .06, s * .1); c.beginPath(); cell.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = 'rgba(60,44,20,.18)'; c.fill(); c.restore();
    stone(c, cell.map(([x, y]) => [x, y]), col, s, rnd, 0);
  }
  cv.meta = { stone: s / scale, height: h / scale, width: w / scale };
  return cv;
}

/** The marble the words are written on: one slab of pale veined marble, book-matched (mirrored
    about the middle, as the revetment of Hagia Sophia is) and mirrored again below, so the tile
    repeats seamlessly. Printed at half its CSS size (1360 × 1040), as the soft veins allow. */
export function marble({ seed = 3 } = {}) {
  const mw = 340, mh = 260, slab = canvas(mw, mh), sc = slab.getContext('2d'), img = sc.createImageData(mw, mh), d = img.data, key = seed % 3;
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    const X = x * 2, Y = y * 2;
    const warp = fbm(X / 210, Y / 210, key + 3, 3) * 4.2;
    const v = Math.abs(Math.sin((X * .006 + Y * .011 + warp) * 3.1));
    const v2 = Math.abs(Math.sin((X * .013 - Y * .004 + warp * 1.7) * 2.3));
    let col = mix(P.marble, P.warm, fbm(X / 300, Y / 260, key + 12, 2) * .7);
    col = mix(col, P.vein, (1 - smooth(0, .06, v)) * .45);
    col = mix(col, P.vein2, (1 - smooth(0, .02, v2)) * .22);
    const k = (y * mw + x) * 4; d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255;
  }
  sc.putImageData(img, 0, 0);
  const cv = canvas(mw * 2, mh * 2), c = cv.getContext('2d');
  for (const [fx, fy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    c.save(); c.translate(fx < 0 ? mw * 2 : 0, fy < 0 ? mh * 2 : 0); c.scale(fx, fy); c.drawImage(slab, 0, 0); c.restore();
  }
  // a faint polish: the light from above
  cv.meta = { width: mw * 4, height: mh * 4 };
  return cv;
}

/** The share card (1200 × 630): the apse at the golden hour on the starry wall, and the words on a
    marble tablet beside it. */
export async function socialCard({ wall, conch }) {
  const W = 1200, H = 630, cv = canvas(W, H), c = cv.getContext('2d');
  const F = FAMILIES.fine.F, s = (H - 40) / (RO + F + CORNICE), T = { s, x: W - 34 - RO * s, y: 20 + RO * s };
  paintArch(c, wall, T, W, H);
  paintPlace(c, conch, T);
  // the tablet: marble in a frame of four courses
  const tx = 52, ty = 120, tw = 470, th = 390, fs = 7, rnd = mulberry32(3);
  const m = marble({ seed: 3 });
  c.save(); c.beginPath(); c.rect(tx, ty, tw, th); c.clip(); c.drawImage(m, tx - 200, ty - 120, m.width * 2, m.height * 2); c.restore();
  c.fillStyle = css(P.grout);
  for (const [x, y, w, h] of [[tx, ty, tw, fs * 4], [tx, ty + th - fs * 4, tw, fs * 4], [tx, ty, fs * 4, th], [tx + tw - fs * 4, ty, fs * 4, th]]) c.fillRect(x, y, w, h);
  const cells = [];
  for (let k = 0; k < 4; k++) {
    const a = k * fs, x0 = tx + a, y0 = ty + a, x1 = tx + tw - a, y1 = ty + th - a;
    const runH = (y) => { let x = x0 + fs; for (const l of lengths(x1 - x0 - 2 * fs, fs, rnd)) { cells.push([rect(x, y, x + l, y + fs), courseColour(COURSES[k], rnd)]); x += l; } };
    const runV = (x) => { let y = y0 + fs; for (const l of lengths(y1 - y0 - 2 * fs, fs, rnd)) { cells.push([rect(x, y, x + fs, y + l), courseColour(COURSES[k], rnd)]); y += l; } };
    runH(y0); runH(y1 - fs); runV(x0); runV(x1 - fs);
    for (const [x, y] of [[x0, y0], [x1 - fs, y0], [x0, y1 - fs], [x1 - fs, y1 - fs]]) cells.push([rect(x, y, x + fs, y + fs), courseColour(COURSES[k], rnd)]);
  }
  lay(c, cells, fs, rnd, P.grout);
  c.fillStyle = '#172552'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = '400 70px Marcellus'; c.fillText('San Kala', tx + tw / 2, ty + 136);
  c.fillStyle = '#1f1b17'; c.font = '400 29px "EB Garamond"';
  ['Language models at eBay.', 'Before that: UC San Diego,', 'Texas Instruments and', 'NIT Karnataka.'].forEach((line, i) => c.fillText(line, tx + tw / 2, ty + 200 + i * 37));
  c.fillStyle = '#84261f'; c.font = '400 21px "Marcellus SC"'; c.fillText('SANKALA.ME', tx + tw / 2, ty + th - 42);
  void clamp; void RI;
  return cv;
}
