/* Four frames, pixel edition: the things on the desk, the shelf, the board and the floor, place by
   place. Each is a small indexed sprite drawn pixel by pixel, with a selective outline (the darkest
   step of its own material, never black). Light comes from the window, up and to the left. */
import { Spr, C, hash } from './pix.js';

/** A sprite with a one-pixel margin for its outline; `fn` draws with (s, x0, y0) = (sprite, 1, 1). */
function make(w, h, fn, outline = true) { const s = new Spr(w + 2, h + 2); fn(s, 1, 1); if (outline) s.outline(); return s; }

/* ───────── desk things ───────── */
export function robot() {
  return make(17, 24, (s, x, y) => {
    const b = l => C('cobalt', l);
    // head: front face, top, right side
    s.poly([[x + 1, y + 3], [x + 4, y], [x + 16, y], [x + 13, y + 3]], b(3));
    s.hl(x + 4, x + 15, y, b(4));
    s.rect(x + 1, y + 3, 12, 12, b(2));
    s.poly([[x + 13, y + 3], [x + 16, y], [x + 16, y + 12], [x + 13, y + 15]], b(1));
    // the folded corner, top right of the face
    s.poly([[x + 8, y + 3], [x + 13, y + 3], [x + 13, y + 8]], C('cream', 4));
    s.line(x + 8, y + 3, x + 12, y + 7, C('cream', 2)); s.line(x + 9, y + 4, x + 12, y + 7, C('cream', 3));
    s.line(x + 8, y + 4, x + 12, y + 8, b(0));
    // eyes
    for (const ex of [x + 3, x + 8]) {
      s.rect(ex + 1, y + 6, 3, 5, C('cream', 4)); s.rect(ex, y + 7, 5, 3, C('cream', 4));
      s.set(ex + 4, y + 9, C('cream', 2)); s.set(ex + 3, y + 10, C('cream', 2));
      s.rect(ex + 1, y + 7, 2, 2, C('ink', 0));
    }
    // ear disc on the side
    s.rect(x + 14, y + 6, 2, 5, C('red', 2)); s.vl(x + 13, y + 7, y + 9, C('red', 3)); s.set(x + 14, y + 6, C('red', 4)); s.set(x + 14, y + 7, C('red', 4));
    // mouth line
    s.hl(x + 5, x + 8, y + 13, b(1));
    // neck, body, arms, legs
    s.rect(x + 6, y + 15, 3, 1, b(0));
    s.rect(x + 3, y + 16, 9, 6, b(2)); s.hl(x + 3, x + 11, y + 16, b(3)); s.rect(x + 12, y + 16, 2, 6, b(1));
    s.vl(x + 2, y + 17, y + 20, b(1)); s.vl(x + 14, y + 17, y + 20, b(0));
    s.rect(x + 4, y + 22, 2, 2, b(1)); s.rect(x + 9, y + 22, 2, 2, b(1));
  });
}
export const ROBOT_EYES = [[5, 8], [10, 8]]; // eye boxes (sprite coords, top-left of the pupil area)

/** The laptop: a deck (base) and a screen; lid frames for closing. Silver by default. */
export function laptopBase(kind = 'now') {
  const st = l => C('steel', Math.min(4, l + (kind === 'sd' ? 1 : 0)));
  return make(46, 8, (s, x, y) => {
    s.poly([[x + 4, y], [x + 42, y], [x + 46, y + 6], [x, y + 6]], st(3));
    s.hl(x + 4, x + 41, y, st(4));
    // keys
    for (let r = 0; r < 3; r++) { const yy = y + 1 + r, x0 = x + 7 - r, x1 = x + 39 + r; for (let k = x0; k <= x1; k += 2) s.set(k, yy, C('ink', 2)); }
    s.rect(x + 19, y + 4, 9, 2, st(4));
    s.rect(x, y + 6, 47, 2, st(1)); s.hl(x, x + 46, y + 6, st(2));
  });
}
export function laptopScreen(kind = 'now') {
  const st = l => C('steel', Math.min(4, l + (kind === 'sd' ? 1 : 0)));
  return make(38, 27, (s, x, y) => {
    s.rect(x, y, 38, 27, st(1)); s.hl(x, x + 37, y, st(2)); s.vl(x, y, y + 26, st(2));
    s.rect(x + 2, y + 2, 34, 22, C('screen', 1));
    if (kind === 'sd') {
      // a paper on the screen: the page, its lines, one pink highlight
      s.rect(x + 2, y + 2, 34, 22, C('cream', 4));
      for (let r = 0; r < 7; r++) { const yy = y + 5 + r * 3; s.hl(x + 6, x + 6 + 18 + (r * 7) % 9, yy, C('steel', 3)); }
      s.rect(x + 6, y + 11, 15, 2, C('red', 4)); s.rect(x + 24, y + 5, 8, 8, C('sky', 3)); s.rect(x + 25, y + 6, 6, 6, C('sky', 2));
    } else {
      for (let r = 0; r < 6; r++) { const yy = y + 4 + r * 3, ind = r % 3 === 2 ? 4 : 0, len = 8 + (r * 11) % 14; s.hl(x + 5 + ind, x + 5 + ind + len, yy, C(['sky', 'gold', 'leaf', 'steel'][r % 4], 3)); }
    }
    s.rect(x, y + 24, 38, 3, st(1)); s.hl(x + 16, x + 21, y + 25, st(2));
  });
}
export function laptopHalf(kind = 'now') {
  const st = l => C('steel', Math.min(4, l + (kind === 'sd' ? 1 : 0)));
  return make(40, 14, (s, x, y) => { s.poly([[x + 2, y], [x + 38, y], [x + 40, y + 13], [x, y + 13]], st(2)); s.hl(x + 2, x + 37, y, st(3)); s.rect(x + 3, y + 2, 34, 9, C('screen', 0)); s.hl(x, x + 40, y + 13, st(1)); });
}
export function laptopClosed(kind = 'now') {
  const st = l => C('steel', Math.min(4, l + (kind === 'sd' ? 1 : 0)));
  return make(46, 3, (s, x, y) => { s.poly([[x + 3, y], [x + 43, y], [x + 46, y + 2], [x, y + 2]], st(3)); s.hl(x + 3, x + 42, y, st(4)); s.hl(x, x + 45, y + 2, st(2)); });
}

export function telescope() {
  return make(28, 26, (s, x, y) => {
    const st = l => C('steel', l), cr = l => C('cream', l);
    // tripod
    s.line(x + 15, y + 13, x + 7, y + 25, st(1)); s.line(x + 15, y + 13, x + 15, y + 25, st(2)); s.line(x + 15, y + 13, x + 23, y + 25, st(1));
    s.line(x + 11, y + 20, x + 19, y + 20, st(1));
    // tube, pointing up and to the left toward the window
    s.thick(x + 5, y + 5, x + 22, y + 13, 4, cr(3));
    s.line(x + 4, y + 3, x + 21, y + 11, cr(4)); s.line(x + 6, y + 7, x + 23, y + 15, cr(1));
    // dew cap and objective
    s.thick(x + 2, y + 3, x + 5, y + 5, 5, st(2)); s.line(x + 1, y + 1, x + 4, y + 3, st(3));
    // focuser and eyepiece
    s.rect(x + 22, y + 13, 3, 3, st(1)); s.rect(x + 24, y + 15, 2, 3, st(0));
    // finder
    s.line(x + 10, y + 4, x + 16, y + 7, st(1));
    s.rect(x + 14, y + 11, 3, 3, st(1));
  });
}

export function mug() {
  return make(10, 10, (s, x, y) => {
    const t = l => C('sea', l);
    s.rect(x, y + 1, 7, 9, t(2)); s.vl(x + 1, y + 2, y + 8, t(3)); s.vl(x + 2, y + 2, y + 8, t(4)); s.vl(x + 6, y + 1, y + 9, t(1));
    s.hl(x, x + 6, y, t(3)); s.hl(x + 1, x + 5, y + 1, C('wood', 0));
    s.vl(x + 7, y + 3, y + 6, t(1)); s.vl(x + 9, y + 3, y + 6, t(1)); s.set(x + 8, y + 2, t(1)); s.set(x + 8, y + 7, t(1));
  });
}

export function papers() {
  return make(26, 8, (s, x, y) => {
    for (const [dx, dy, l] of [[3, 2, 2], [1, 1, 3], [0, 0, 4]]) {
      s.poly([[x + 4 + dx, y + dy], [x + 22 + dx, y + dy], [x + 24 + dx, y + 5 + dy], [x + dx, y + 5 + dy]], C('cream', l));
    }
    for (let r = 0; r < 2; r++) s.hl(x + 5 - r, x + 18 - r, y + 1 + r * 2, C('steel', 3));
    s.line(x + 14, y + 4, x + 22, y + 1, C('cobalt', 2));
  });
}
export function zine() {
  return make(17, 8, (s, x, y) => {
    s.poly([[x + 3, y + 2], [x + 15, y], [x + 17, y + 5], [x + 4, y + 7]], C('cream', 3));
    s.poly([[x + 2, y + 1], [x + 14, y - 1], [x + 16, y + 4], [x + 3, y + 6]], C('red', 4));
    s.disc(x + 7, y + 3, 2, C('red', 3)); s.line(x + 10, y + 1, x + 13, y + 3, C('cobalt', 2)); s.set(x + 6, y + 2, C('cream', 4));
  });
}
export function paperCup() {
  return make(8, 12, (s, x, y) => {
    s.poly([[x, y + 2], [x + 7, y + 2], [x + 6, y + 11], [x + 1, y + 11]], C('cream', 4));
    s.vl(x + 6, y + 2, y + 10, C('cream', 2));
    s.rect(x + 1, y + 5, 6, 4, C('cork', 2)); s.vl(x + 1, y + 5, y + 8, C('cork', 3)); s.vl(x + 6, y + 5, y + 8, C('cork', 1));
    s.rect(x - 0, y, 8, 2, C('cream', 3)); s.hl(x, x + 7, y, C('cream', 4)); s.set(x + 5, y, C('ink', 2));
  });
}
export function tumbler() {
  return make(12, 10, (s, x, y) => {
    const st = l => C('steel', l);
    s.ellipse(x + 6, y + 8.5, 6, 1.6, st(2)); s.hl(x + 1, x + 10, y + 7, st(3));
    s.poly([[x + 2, y], [x + 9, y], [x + 8, y + 7], [x + 3, y + 7]], st(3));
    s.vl(x + 3, y + 1, y + 6, st(4)); s.vl(x + 8, y + 1, y + 6, st(1));
    s.hl(x + 2, x + 9, y, st(4)); s.hl(x + 3, x + 8, y + 1, C('wood', 1));
  });
}
export function monitor() {
  return make(42, 36, (s, x, y) => {
    const k = l => C('ink', l);
    s.rect(x, y, 42, 28, k(1)); s.hl(x, x + 41, y, k(3)); s.vl(x, y, y + 27, k(2));
    s.rect(x + 2, y + 2, 38, 23, C('screen', 0));
    // a chip layout: standard-cell rows, two macros, metal straps
    const cols = ['cobalt', 'red', 'gold', 'mint', 'flame', 'sky'];
    for (let r = 0; r < 7; r++) {
      let xx = x + 3; const yy = y + 3 + r * 3;
      while (xx < x + 26) { const w = 2 + Math.floor(hash(xx, r, 5) * 4); s.rect(xx, yy, Math.min(w, x + 26 - xx), 2, C(cols[Math.floor(hash(r, xx, 6) * 4)], 2 + (hash(xx, r, 2) > .6 ? 1 : 0))); xx += w + 1; }
    }
    s.rect(x + 28, y + 3, 10, 9, C('mint', 2)); s.rect(x + 29, y + 4, 8, 7, C('mint', 1)); s.rect(x + 28, y + 14, 10, 9, C('flame', 2)); s.rect(x + 29, y + 15, 8, 7, C('flame', 1));
    for (const vx of [x + 9, x + 18, x + 26]) s.vl(vx, y + 2, y + 24, C('gold', 4));
    s.hl(x + 2, x + 39, y + 12, C('sky', 4));
    s.rect(x, y + 25, 42, 3, k(1)); s.set(x + 38, y + 26, C('mint', 3));
    // stand and foot
    s.rect(x + 18, y + 28, 6, 6, C('steel', 2)); s.vl(x + 18, y + 28, y + 33, C('steel', 3));
    s.poly([[x + 11, y + 34], [x + 31, y + 34], [x + 33, y + 36], [x + 9, y + 36]], C('steel', 2)); s.hl(x + 11, x + 30, y + 34, C('steel', 3));
  });
}
export function keyboard() {
  return make(34, 5, (s, x, y) => { s.poly([[x + 2, y], [x + 32, y], [x + 34, y + 4], [x, y + 4]], C('steel', 3)); for (let r = 0; r < 2; r++) for (let k = x + 4 - r; k < x + 31 + r; k += 2) s.set(k, y + 1 + r, C('steel', 1)); s.hl(x, x + 34, y + 4, C('steel', 1)); });
}
export function loupe() {
  return make(16, 9, (s, x, y) => { s.ring(x + 4.5, y + 4.5, 4.5, 4, C('ink', 1)); s.ring(x + 4.5, y + 4.5, 3.5, 3, C('ink', 2)); s.ellipse(x + 4.5, y + 4.5, 2.6, 2.2, C('sky', 3)); s.set(x + 3, y + 3, C('cream', 4)); s.set(x + 4, y + 3, C('cream', 4)); s.thick(x + 9, y + 6, x + 15, y + 8, 2, C('wood', 2)); s.line(x + 9, y + 5, x + 15, y + 7, C('wood', 3)); });
}
export function chip() {
  return make(13, 9, (s, x, y) => {
    s.poly([[x + 3, y], [x + 11, y], [x + 12, y + 6], [x + 1, y + 6]], C('ink', 1)); s.hl(x + 3, x + 10, y, C('ink', 3)); s.set(x + 4, y + 2, C('ink', 4));
    for (let k = 0; k < 4; k++) { s.set(x + 3 + k * 2, y + 7, C('steel', 4)); s.set(x + 1, y + 1 + k, C('steel', 3)); s.set(x + 12, y + 1 + k, C('steel', 3)); }
    s.hl(x + 1, x + 12, y + 6, C('ink', 0));
  });
}
export function breadboard() {
  return make(26, 9, (s, x, y) => {
    s.poly([[x + 3, y], [x + 24, y], [x + 26, y + 6], [x, y + 6]], C('cream', 4)); s.hl(x, x + 26, y + 6, C('cream', 2)); s.hl(x, x + 26, y + 7, C('cream', 1));
    for (let r = 0; r < 3; r++) for (let k = x + 4 - r; k < x + 23 + r; k += 2) s.set(k, y + 1 + r * 2, C('cream', 2));
    s.rect(x + 10, y + 2, 6, 2, C('ink', 1));
    s.line(x + 5, y + 4, x + 9, y + 1, C('red', 3)); s.line(x + 17, y + 1, x + 21, y + 4, C('cobalt', 3)); s.line(x + 7, y + 5, x + 19, y + 5, C('gold', 3)); s.set(x + 13, y + 4, C('leaf', 3));
  });
}
export function scope() {
  return make(36, 26, (s, x, y) => {
    const st = l => C('steel', l), cr = l => C('cream', l);
    // handle
    s.hl(x + 8, x + 26, y, st(1)); s.vl(x + 8, y, y + 2, st(1)); s.vl(x + 26, y, y + 2, st(1));
    // case
    s.rect(x, y + 2, 36, 24, cr(2)); s.hl(x, x + 35, y + 2, cr(4)); s.vl(x, y + 2, y + 25, cr(3)); s.vl(x + 35, y + 2, y + 25, cr(1)); s.hl(x, x + 35, y + 25, cr(1));
    // screen with its graticule
    s.rect(x + 3, y + 5, 20, 15, st(0)); s.rect(x + 4, y + 6, 18, 13, C('mint', 0));
    for (let gy = y + 7; gy < y + 19; gy += 3) for (let gx = x + 5; gx < x + 22; gx += 3) s.set(gx, gy, C('mint', 1));
    // the square wave
    const hi = y + 9, lo = y + 15;
    let xx = x + 4, up = true; while (xx < x + 22) { const run = 4; s.hl(xx, Math.min(x + 21, xx + run - 1), up ? hi : lo, C('mint', 3)); if (xx + run < x + 22) s.vl(xx + run, hi, lo, C('mint', 2)); xx += run; up = !up; }
    // knobs and buttons
    for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { const kx = x + 26 + k * 5, ky = y + 6 + r * 6; s.rect(kx, ky, 3, 3, st(1)); s.set(kx, ky, st(3)); }
    s.rect(x + 4, y + 21, 3, 2, C('red', 3)); s.rect(x + 9, y + 21, 3, 2, C('gold', 3)); s.rect(x + 14, y + 21, 3, 2, st(2));
  });
}
export const SCOPE_SCREEN = [5, 7, 18, 13]; // inside the sprite (with its margin)
export function planisphere() {
  return make(18, 7, (s, x, y) => { s.ellipse(x + 9, y + 3.5, 9, 3.4, C('gold', 2)); s.ellipse(x + 9, y + 3.2, 7.6, 2.6, C('cobalt', 0)); for (const [a, b] of [[5, 3], [8, 2], [11, 4], [13, 3], [7, 4], [10, 3]]) s.set(x + a, y + b, C('cream', 4)); s.hl(x + 3, x + 15, y + 6, C('gold', 1)); });
}
export function multimeter() {
  return make(11, 16, (s, x, y) => {
    s.rect(x, y, 11, 16, C('gold', 3)); s.vl(x, y, y + 15, C('gold', 4)); s.vl(x + 10, y, y + 15, C('gold', 1)); s.hl(x, x + 10, y + 15, C('gold', 1));
    s.rect(x + 2, y + 2, 7, 4, C('steel', 4)); s.hl(x + 3, x + 6, y + 3, C('ink', 2)); s.hl(x + 4, x + 7, y + 4, C('ink', 2));
    s.disc(x + 5.5, y + 9.5, 2.5, C('ink', 1)); s.set(x + 5, y + 8, C('ink', 4));
    s.set(x + 3, y + 13, C('red', 3)); s.set(x + 7, y + 13, C('ink', 0));
  });
}

/* ───────── shelf things (stand on the shelf top; sprites are bottom-aligned) ───────── */
function spines(s, x, base, list) {
  let xx = x;
  for (const b of list) {
    const top = base - b.h, m = l => C(b.c, l + (b.lift || 0));
    s.rect(xx, top, b.w, b.h, m(2)); s.vl(xx, top, base - 1, m(3)); s.vl(xx + b.w - 1, top, base - 1, m(1)); s.hl(xx, xx + b.w - 1, top, m(3));
    if (b.band) { s.hl(xx, xx + b.w - 1, top + 3, C(b.band, 4)); s.hl(xx, xx + b.w - 1, base - 4, C(b.band, 3)); }
    xx += b.w + (b.gap || 0);
  }
  return xx;
}
export function shelfNow() {
  return make(64, 22, (s, x, y) => {
    const base = y + 22;
    const end = spines(s, x + 2, base, [{ c: 'gold', w: 5, h: 18, band: 'ink' }, { c: 'cobalt', w: 6, h: 21, band: 'gold' }, { c: 'red', w: 4, h: 17, band: 'cream' }, { c: 'cream', w: 5, h: 19, band: 'red' }, { c: 'wood', w: 4, h: 16, band: 'gold', lift: -1 }, { c: 'cobalt', w: 5, h: 20, band: 'cream', lift: -1 }]);
    plant(s, end + 14, base, 1);
  });
}
function plant(s, cx, base, scale) {
  const p = l => C('roof', l);
  s.poly([[cx - 5, base - 8], [cx + 5, base - 8], [cx + 4, base], [cx - 4, base]], p(2)); s.hl(cx - 6, cx + 5, base - 8, p(3)); s.hl(cx - 6, cx + 5, base - 7, p(3)); s.vl(cx - 4, base - 6, base - 1, p(3)); s.vl(cx + 4, base - 7, base - 1, p(1));
  const g = l => C('leaf', l);
  const blades = [[-1, -15, -6], [1, -17, 0], [2, -14, 6], [-2, -11, -9], [3, -10, 9], [0, -12, -3], [1, -13, 3]];
  for (const [ox, h, lean] of blades) { const x0 = cx + ox, y0 = base - 9; s.line(x0, y0, x0 + lean * scale, y0 + h * scale, g(lean < 0 ? 2 : 3)); s.set(x0 + lean * scale, y0 + h * scale, g(4)); }
}
export function shelfSd() {
  return make(64, 22, (s, x, y) => {
    const base = y + 22;
    // three books lying flat, then three standing
    const lay = [['cobalt', 20, 4], ['red', 18, 3], ['gold', 16, 3]]; let yy = base;
    for (const [c, w, h] of lay) { yy -= h; s.rect(x + 2, yy, w, h, C(c, 2)); s.hl(x + 2, x + 1 + w, yy, C(c, 3)); s.vl(x + 1 + w, yy, yy + h - 1, C('cream', 3)); }
    const end = spines(s, x + 26, base, [{ c: 'leaf', w: 5, h: 18, band: 'cream' }, { c: 'cream', w: 4, h: 16, band: 'cobalt' }, { c: 'cobalt', w: 5, h: 19, band: 'cream', lift: 1 }]);
    // a small cactus in a pot
    const cx = end + 12; s.poly([[cx - 4, base - 6], [cx + 4, base - 6], [cx + 3, base], [cx - 3, base]], C('cream', 3)); s.hl(cx - 4, cx + 4, base - 6, C('cream', 4));
    s.rect(cx - 2, base - 15, 4, 9, C('leaf', 2)); s.vl(cx - 1, base - 14, base - 7, C('leaf', 3)); s.rect(cx + 2, base - 12, 3, 2, C('leaf', 2)); s.rect(cx + 4, base - 15, 2, 4, C('leaf', 2)); s.rect(cx - 5, base - 11, 3, 2, C('leaf', 1)); s.rect(cx - 5, base - 13, 2, 3, C('leaf', 2));
    s.set(cx, base - 16, C('red', 4));
  });
}
export function shelfBlr() {
  return make(64, 22, (s, x, y) => {
    const base = y + 22; let xx = x + 2;
    for (const c of ['cobalt', 'red', 'cream', 'leaf', 'cobalt']) {
      const top = base - 20; s.rect(xx, top, 7, 20, C(c, 2)); s.vl(xx, top, base - 1, C(c, 3)); s.vl(xx + 6, top, base - 1, C(c, 1)); s.hl(xx, xx + 6, top, C(c, 3));
      s.rect(xx + 1, top + 4, 5, 4, C('cream', 4)); s.ring(xx + 3.5, top + 14.5, 1.6, 1.6, C(c, 0)); xx += 8;
    }
    // money plant in a glass bottle
    const cx = xx + 10; s.rect(cx - 3, base - 11, 6, 11, C('mint', 3)); s.vl(cx - 3, base - 11, base - 1, C('mint', 4)); s.vl(cx + 2, base - 10, base - 1, C('mint', 2)); s.rect(cx - 1, base - 15, 2, 4, C('mint', 3));
    const g = l => C('leaf', l);
    for (const [a, b, l] of [[-2, -17, 3], [1, -19, 3], [3, -16, 2], [5, -13, 3], [7, -9, 2], [8, -5, 3], [-5, -14, 2], [-7, -10, 3], [-8, -6, 2]]) { s.rect(cx + a, base + b, 2, 2, g(l)); s.set(cx + a, base + b, g(4)); }
    s.line(cx, base - 15, cx + 8, base - 4, g(1)); s.line(cx - 1, base - 15, cx - 8, base - 5, g(1));
  });
}
export function shelfNitk() {
  return make(64, 22, (s, x, y) => {
    const base = y + 22;
    const end = spines(s, x + 2, base, [{ c: 'red', w: 6, h: 20, band: 'cream' }, { c: 'cobalt', w: 6, h: 19, band: 'cream' }, { c: 'cream', w: 5, h: 18, band: 'red' }, { c: 'leaf', w: 5, h: 19, band: 'cream' }, { c: 'gold', w: 4, h: 17, band: 'ink' }]);
    // binoculars, standing on their objectives
    const bx = end + 8; for (const dx of [0, 7]) { s.rect(bx + dx, base - 11, 6, 11, C('ink', 2)); s.vl(bx + dx, base - 11, base - 1, C('ink', 3)); s.rect(bx + dx + 1, base - 14, 4, 3, C('ink', 1)); }
    s.rect(bx + 6, base - 9, 1, 3, C('ink', 1));
  });
}

/* ───────── on the board ───────── */
/** A photo print: a white border round a hole the real photograph is drawn into. */
export function print(w, h, fix) {
  const s = make(w + 4, h + 5, (s, x, y) => {
    s.rect(x, y, w + 4, h + 5, C('cream', 4)); s.hl(x, x + w + 3, y + h + 4, C('cream', 2)); s.vl(x + w + 3, y, y + h + 4, C('cream', 3));
    s.rect(x + 2, y + 2, w, h, C('ink', 1));
  }, false);
  // a shadow on the cork, down and to the right
  const out = new Spr(s.w + 1, s.h + 1); for (let yy = 1; yy < out.h; yy++) for (let xx = 1; xx < out.w; xx++) out.set(xx, yy, C('cork', 1)); out.blit(s, 0, 0);
  if (fix === 'tape') { for (let xx = Math.round(out.w / 2) - 4; xx < Math.round(out.w / 2) + 4; xx++) for (let yy = 0; yy < 3; yy++) if ((xx + yy) % 2 === 0) out.set(xx, yy, C('cream', 3)); else out.set(xx, yy, C('cream', 4)); }
  else { const px = Math.round(out.w / 2) - 1, c = fix || 'red'; out.rect(px, 1, 2, 2, C(c, 2)); out.set(px, 1, C(c, 4)); out.set(px + 2, 3, C('cork', 1)); out.set(px + 2, 2, C('cork', 1)); }
  return { spr: out, photo: [3, 3, w, h] };
}
export function note(w, h, paper = 'cream', pin = 'cobalt') {
  const s = new Spr(w + 3, h + 3);
  for (let yy = 1; yy < h + 2; yy++) for (let xx = 1; xx < w + 2; xx++) s.set(xx, yy, C('cork', 1));
  s.rect(0, 0, w, h, C(paper, 4)); s.hl(0, w - 1, h - 1, C(paper, 2)); s.vl(w - 1, 0, h - 1, C(paper, 3));
  for (let r = 3; r < h - 1; r += 2) s.hl(2, w - 3 - (r * 3) % 5, r, C('sky', 3));
  s.vl(3, 1, h - 2, C('red', 4));
  const px = Math.round(w / 2) - 1; s.rect(px, 0, 2, 2, C(pin, 2)); s.set(px, 0, C(pin, 4));
  return s;
}
export function layoutSheet(w, h) {
  const s = new Spr(w + 2, h + 2);
  for (let yy = 1; yy < h + 1; yy++) for (let xx = 1; xx < w + 1; xx++) s.set(xx, yy, C('cork', 1));
  s.rect(0, 0, w, h, C('cream', 4)); s.vl(w - 1, 0, h - 1, C('cream', 2)); s.hl(0, w - 1, h - 1, C('cream', 2));
  const cols = ['cobalt', 'red', 'gold', 'mint'];
  for (let yy = 3; yy < h - 3; yy += 3) { let xx = 2; while (xx < w - 3) { const ww = 1 + Math.floor(hash(xx, yy, 4) * 4); s.rect(xx, yy, Math.min(ww, w - 3 - xx), 2, C(cols[Math.floor(hash(yy, xx, 9) * 4)], 2)); xx += ww + 1; } }
  s.vl(Math.round(w * .4), 2, h - 3, C('gold', 3)); s.rect(Math.round(w / 2) - 1, 0, 2, 2, C('gold', 2));
  return s;
}
export function starSheet(w, h) {
  const s = new Spr(w + 2, h + 2);
  for (let yy = 1; yy < h + 1; yy++) for (let xx = 1; xx < w + 1; xx++) s.set(xx, yy, C('cork', 1));
  s.rect(0, 0, w, h, C('cobalt', 0)); s.hl(0, w - 1, 0, C('cobalt', 1));
  const pts = [[.2, .25], [.36, .3], [.5, .22], [.62, .4], [.78, .32], [.3, .62], [.52, .7], [.7, .66], [.84, .8], [.18, .82]];
  for (const [a, b] of pts) s.set(Math.round(a * (w - 1)), Math.round(b * (h - 1)), C('cream', 4));
  const P = i => [Math.round(pts[i][0] * (w - 1)), Math.round(pts[i][1] * (h - 1))];
  for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8]]) { const [a, b] = P(i), [c, d] = P(j); s.line(a, b, c, d, C('cobalt', 2)); }
  for (const [a, b] of pts) s.set(Math.round(a * (w - 1)), Math.round(b * (h - 1)), C('cream', 4));
  s.rect(Math.round(w / 2) - 1, 1, 2, 2, C('red', 2));
  return s;
}
export function schematic(w, h) {
  const s = new Spr(w + 2, h + 2);
  for (let yy = 1; yy < h + 1; yy++) for (let xx = 1; xx < w + 1; xx++) s.set(xx, yy, C('cork', 1));
  s.rect(0, 0, w, h, C('cream', 4)); s.hl(0, w - 1, h - 1, C('cream', 2));
  const k = C('ink', 2), my = Math.round(h / 2);
  s.hl(2, w - 3, my, k); s.vl(2, my - 3, my, k); s.vl(w - 3, my, my + 3, k);
  // a resistor zigzag and a capacitor
  for (let i = 0; i < 6; i++) s.set(Math.round(w * .3) + i, my + (i % 2 ? -1 : 1), k);
  s.rect(Math.round(w * .3), my, 6, 1, C('cream', 4));
  const cx = Math.round(w * .66); s.vl(cx, my - 2, my + 2, k); s.vl(cx + 2, my - 2, my + 2, k); s.set(cx + 1, my, C('cream', 4));
  s.rect(Math.round(w / 2) - 1, 0, 2, 2, C('leaf', 2));
  return s;
}

/* ───────── chairs and floor things (wide screens only) ───────── */
export function officeChair(mat = 'ink', mesh = true) {
  return make(34, 64, (s, x, y) => {
    const m = l => C(mat, l), st = l => C('steel', l);
    // backrest, rounded at the top, seen from behind
    s.poly([[x + 6, y + 3], [x + 10, y], [x + 24, y], [x + 28, y + 3], [x + 29, y + 22], [x + 25, y + 27], [x + 9, y + 27], [x + 5, y + 22]], m(2));
    s.hl(x + 10, x + 23, y, m(3)); s.line(x + 6, y + 3, x + 5, y + 21, m(3)); s.line(x + 28, y + 3, x + 29, y + 21, m(1));
    if (mesh) for (let yy = y + 3; yy < y + 25; yy++) for (let xx = x + 8; xx < x + 27; xx++) if ((xx + yy) % 2 === 0 && s.get(xx, yy) === m(2)) s.set(xx, yy, m(1));
    s.hl(x + 9, x + 25, y + 13, m(3));
    // the spine that joins back and seat
    s.rect(x + 15, y + 27, 4, 7, st(1)); s.vl(x + 15, y + 27, y + 33, st(2));
    // seat, seen edge-on
    s.rect(x + 3, y + 33, 28, 6, m(2)); s.hl(x + 3, x + 30, y + 33, m(3)); s.hl(x + 3, x + 30, y + 38, m(1));
    // gas lift and the five-star base with casters
    s.rect(x + 15, y + 39, 4, 12, st(2)); s.vl(x + 15, y + 39, y + 50, st(4)); s.vl(x + 18, y + 39, y + 50, st(1));
    s.rect(x + 13, y + 49, 8, 2, st(1));
    s.line(x + 17, y + 51, x + 3, y + 57, st(1)); s.line(x + 17, y + 51, x + 31, y + 57, st(1)); s.line(x + 17, y + 51, x + 10, y + 59, st(2)); s.line(x + 17, y + 51, x + 25, y + 59, st(2)); s.vl(x + 17, y + 51, y + 58, st(2));
    for (const [cx, cy] of [[x + 3, y + 59], [x + 31, y + 59], [x + 10, y + 61], [x + 25, y + 61], [x + 17, y + 60]]) { s.rect(cx - 1, cy - 1, 3, 3, C('ink', 0)); s.set(cx - 1, cy - 1, C('ink', 2)); }
  });
}
export function monobloc() {
  return make(30, 62, (s, x, y) => {
    const p = l => C('cream', l);
    s.poly([[x + 4, y + 2], [x + 8, y], [x + 22, y], [x + 26, y + 2], [x + 27, y + 26], [x + 3, y + 26]], p(3));
    s.hl(x + 8, x + 21, y, p(4)); s.vl(x + 4, y + 2, y + 25, p(4)); s.vl(x + 26, y + 2, y + 25, p(2));
    for (let k = 0; k < 4; k++) s.rect(x + 8 + k * 4, y + 6, 2, 14, p(1));
    s.rect(x + 2, y + 26, 26, 5, p(3)); s.hl(x + 2, x + 27, y + 26, p(4)); s.hl(x + 2, x + 27, y + 30, p(1));
    for (const [a, b] of [[x + 3, x + 1], [x + 26, x + 28], [x + 8, x + 8], [x + 21, x + 21]]) s.thick(a, y + 31, b, y + 60, 2, p(2));
    s.line(x + 3, y + 31, x + 1, y + 60, p(4));
  });
}
export function backpack() {
  return make(20, 24, (s, x, y) => {
    const m = l => C('sea', l);
    s.ring(x + 10, y + 3, 4, 3, m(1)); s.rect(x + 7, y + 2, 7, 2, 0);
    s.poly([[x + 3, y + 5], [x + 17, y + 5], [x + 19, y + 23], [x + 1, y + 23]], m(2));
    s.line(x + 3, y + 5, x + 1, y + 22, m(3)); s.hl(x + 3, x + 16, y + 5, m(3)); s.line(x + 17, y + 5, x + 19, y + 22, m(1));
    s.rect(x + 5, y + 13, 11, 8, m(1)); s.hl(x + 5, x + 15, y + 13, m(3)); s.rect(x + 9, y + 15, 3, 2, C('gold', 3));
    s.hl(x + 1, x + 19, y + 23, m(0));
  });
}
export function bookPile() {
  return make(26, 14, (s, x, y) => { let yy = y + 14; for (const [c, w, dx] of [['leaf', 24, 0], ['gold', 22, 1], ['cobalt', 23, -1], ['red', 20, 2]]) { yy -= 3; s.rect(x + 1 + dx, yy, w, 3, C(c, 2)); s.hl(x + 1 + dx, x + dx + w, yy, C(c, 3)); s.vl(x + dx + w, yy, yy + 2, C('cream', 3)); } });
}
export function box() {
  return make(26, 20, (s, x, y) => {
    const k = l => C('cork', l);
    s.rect(x, y + 5, 26, 15, k(3)); s.vl(x, y + 5, y + 19, k(4)); s.rect(x + 18, y + 5, 8, 15, k(2)); s.hl(x, x + 25, y + 19, k(1));
    s.poly([[x, y + 5], [x + 4, y], [x + 12, y + 3], [x + 9, y + 5]], k(4)); s.poly([[x + 26, y + 5], [x + 22, y], [x + 15, y + 3], [x + 18, y + 5]], k(2));
    s.rect(x + 9, y + 9, 8, 3, C('cream', 3));
  });
}
export function toolbox() {
  return make(24, 14, (s, x, y) => {
    const r = l => C('red', l);
    s.rect(x + 8, y, 8, 2, C('steel', 2)); s.vl(x + 8, y, y + 3, C('steel', 2)); s.vl(x + 15, y, y + 3, C('steel', 2));
    s.rect(x, y + 3, 24, 11, r(2)); s.hl(x, x + 23, y + 3, r(4)); s.vl(x, y + 3, y + 13, r(3)); s.vl(x + 23, y + 3, y + 13, r(1)); s.hl(x, x + 23, y + 7, r(1)); s.hl(x, x + 23, y + 13, r(0));
    s.rect(x + 10, y + 8, 4, 2, C('steel', 3));
  });
}

/* ───────── each place's things, positioned ───────── */
const BL = (spr, x, y) => [Math.round(x - spr.w / 2), Math.round(y - spr.h + 1)]; // bottom-centre anchor

export function eraObjects(era, L) {
  const S = L.slots, out = [], add = (id, spr, xy, o = {}) => out.push({ id, spr, x: xy[0], y: xy[1], ...o });
  const sh = L.shelf, pb = L.pin, ix = pb.x + 4, iy = pb.y + 4, iw = pb.w - 8, ih = pb.h - 8, wide = L.mode === 'wide';
  const shelf = spr => add('shelf', spr, [sh.x + 4, sh.y - spr.h + 1], { exit: 'up' });
  const desk = (id, spr, slot, dx = 0, dy = 0, o) => add(id, spr, BL(spr, S[slot][0] + dx, S[slot][1] + dy), { exit: 'hop', ...o });
  const pr = (id, photo, fx, fy, w, h, fix) => { const p = print(w, h, fix); add(id, p.spr, [Math.round(ix + fx * iw), Math.round(iy + fy * ih)], { exit: 'board', photo: { key: photo, rect: p.photo } }); };
  const paper = (id, spr, fx, fy) => add(id, spr, [Math.round(ix + fx * iw), Math.round(iy + fy * ih)], { exit: 'board' });
  const k = wide ? 1 : .82, P = v => Math.round(v * k);
  const chair = spr => { if (L.chair) add('chair', spr, [L.chair.x - Math.round(spr.w / 2), L.chair.floor - spr.h + 1], { exit: 'roll', front: true }); };
  const floor = spr => { if (L.floorObj) add('floor', spr, BL(spr, L.floorObj[0], L.floorObj[1]), { exit: 'slide', front: true }); };

  if (era === 'now') {
    shelf(shelfNow());
    desk('mug', mug(), 'left', -10, -2);
    const base = laptopBase('now'), scr = laptopScreen('now'), bxy = BL(base, S.center[0], S.center[1]);
    add('laptop', base, bxy, { exit: 'hop', heavy: true, lid: { open: scr, half: laptopHalf('now'), closed: laptopClosed('now') }, screen: [bxy[0] + 4, bxy[1] - 27 + 2, 34, 22], live: 'tokens' });
    const rb = robot(); desk('robot', rb, 'right', 4, -1, { live: 'blink' });
    desk('telescope', telescope(), 'far', 0, 0);
    pr('p-award', 'neurips-award', .02, .04, P(32), P(24), 'red');
    pr('p-ebay', 'ebay-headquarters', .62, .14, P(17), P(23), 'tape');
    paper('note', note(P(22), P(15)), .1, .66);
    chair(officeChair('ink', true)); floor(backpack());
  } else if (era === 'sd') {
    shelf(shelfSd());
    desk('papers', papers(), 'left', -6, 1);
    const base = laptopBase('sd'), scr = laptopScreen('sd'), bxy = BL(base, S.center[0] - 4, S.center[1]);
    add('laptop', base, bxy, { exit: 'hop', heavy: true, lid: { open: scr, half: laptopHalf('sd'), closed: laptopClosed('sd') } });
    desk('zine', zine(), 'right', 0, 2);
    desk('cup', paperCup(), 'far', -10, 0);
    pr('p-library', 'ucsd-library', .0, .02, P(36), P(17), 'cobalt');
    pr('p-uist', 'uist-award', .68, 0, P(14), P(19), 'red');
    pr('p-group', 'research-group', .02, .5, P(38), P(18), 'tape');
    pr('p-intern', 'ebay-intern', .7, .48, P(14), P(19), 'gold');
    chair(officeChair('cobalt', false)); floor(bookPile());
  } else if (era === 'blr') {
    shelf(shelfBlr());
    desk('tumbler', tumbler(), 'left', -8, -1);
    const mon = monitor(); add('monitor', mon, BL(mon, S.center[0] + 4, S.center[1] - 6), { exit: 'hop', heavy: true });
    desk('keyboard', keyboard(), 'center', 2, 2);
    desk('loupe', loupe(), 'right', 10, 2);
    desk('chip', chip(), 'far', -6, 2);
    pr('p-ti', 'ti-bengaluru', .02, .06, P(26), P(24), 'cobalt');
    paper('layout', layoutSheet(P(20), P(24)), .64, .08);
    paper('note', note(P(19), P(13), 'sky', 'red'), .16, .68);
    chair(officeChair('steel', false)); floor(box());
  } else {
    shelf(shelfNitk());
    desk('breadboard', breadboard(), 'left', -4, 2);
    const sc = scope(), sxy = BL(sc, S.center[0] + 8, S.center[1]);
    add('scope', sc, sxy, { exit: 'hop', heavy: true, live: 'trace', screen: [sxy[0] + 5, sxy[1] + 7, 18, 13] });
    desk('planisphere', planisphere(), 'right', 6, 2);
    desk('meter', multimeter(), 'far', -8, 0);
    pr('p-lab', 'nitk-lab', .02, .04, P(30), P(22), 'red');
    paper('starmap', starSheet(P(20), P(22)), .66, .1);
    paper('schematic', schematic(P(26), P(15)), .06, .66);
    chair(monobloc()); floor(toolbox());
  }
  return out;
}
