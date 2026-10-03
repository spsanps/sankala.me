/* Four frames, pixel edition: the room. One desk, one window, one pinboard, one lamp, laid out on
   a fixed design square of whole pixels (wide screens) or a re-composed tall square (phones).
   Coordinates here are design pixels; the stage places the design square in the frame. */
import { Spr, C, bayer, hash } from './pix.js';

export function layout(mode) {
  if (mode === 'wide') return {
    mode, W: 270, H: 270,
    win: { x: 44, y: 28, w: 134, h: 136, f: 6, transom: .36, bar: 3 },
    sill: { y: 164, h: 6, over: 7 },
    shelf: { x: 188, y: 46, w: 80 },
    pin: { x: 190, y: 56, w: 76, h: 70 },
    desk: { backY: 184, frontY: 212, faceH: 9, leftBack: 16, leftFront: 2, legW: 6 },
    floorY: 254,
    lamp: { base: [24, 198], elbow: [10, 128], head: [52, 116] },
    slots: { left: [66, 203], center: [120, 208], right: [176, 205], far: [234, 201] },
    chair: { x: 70, top: 204, floor: 268 }, socket: [150, 236], floorObj: [190, 266],
  };
  return {
    mode, W: 196, H: 210,
    win: { x: 70, y: 8, w: 122, h: 120, f: 5, transom: .36, bar: 3 },
    sill: { y: 128, h: 5, over: 6 },
    shelf: { x: 3, y: 18, w: 62 },
    pin: { x: 4, y: 26, w: 60, h: 68 },
    desk: { backY: 148, frontY: 180, faceH: 8, leftBack: -30, leftFront: -40, legW: 5 },
    floorY: null,
    lamp: { base: [22, 162], elbow: [8, 106], head: [44, 98] },
    slots: { left: [40, 171], center: [96, 177], right: [140, 173], far: [182, 169] },
    chair: null, socket: null, floorObj: null,
  };
}
/** The glass opening inside the window frame. */
export function openingOf(L) { const w = L.win; return { x: w.x + w.f, y: w.y + w.f, w: w.w - 2 * w.f, h: w.h - 2 * w.f }; }

/* ───────── the room ───────── */
export function drawRoom(s, L, ox, oy, socketKind) {
  const W = s.w, H = s.h, wl = l => C('wall', l), X = x => x + ox, Y = y => y + oy;
  // plaster wall, flat; the room's depth comes from shadows, not texture
  s.rect(0, 0, W, H, wl(3));

  drawWindow(s, L, ox, oy);
  drawShelf(s, L, ox, oy);
  drawPinboard(s, L, ox, oy);
  drawDesk(s, L, ox, oy);
  if (socketKind && L.socket) drawSocket(s, X(L.socket[0]), Y(L.socket[1]), socketKind);
  drawLamp(s, L, ox, oy);
  return s;
}

function drawWindow(s, L, ox, oy) {
  const w = L.win, o = openingOf(L), x0 = w.x + ox, y0 = w.y + oy, cr = l => C('cream', l);
  // a soft shadow the frame casts on the wall, down and to the right
  s.rect(x0 + 2, y0 + 2, w.w, w.h, C('wall', 2));
  s.rect(x0, y0, w.w, w.h, cr(3));
  // outer edge and inner reveal
  s.hl(x0, x0 + w.w - 1, y0, cr(4)); s.vl(x0, y0, y0 + w.h - 1, cr(4));
  s.hl(x0, x0 + w.w - 1, y0 + w.h - 1, cr(1)); s.vl(x0 + w.w - 1, y0, y0 + w.h - 1, cr(1));
  const ix = o.x + ox, iy = o.y + oy;
  s.hl(ix - 1, ix + o.w, iy - 1, cr(1)); s.vl(ix - 1, iy - 1, iy + o.h, cr(2));
  s.hl(ix - 1, ix + o.w, iy + o.h, cr(4)); s.vl(ix + o.w, iy - 1, iy + o.h, cr(4));
  // the glass is a hole the view shows through
  s.rect(ix, iy, o.w, o.h, 0);
  // transom and mullion
  const ty = iy + Math.round(o.h * w.transom), mx = ix + Math.round(o.w / 2) - 1;
  s.rect(ix, ty - 1, o.w, w.bar, cr(3)); s.hl(ix, ix + o.w - 1, ty - 1, cr(4)); s.hl(ix, ix + o.w - 1, ty + w.bar - 2, cr(1));
  s.rect(mx - 1, iy, w.bar, o.h, cr(3)); s.vl(mx - 1, iy, iy + o.h - 1, cr(4)); s.vl(mx + w.bar - 2, iy, iy + o.h - 1, cr(2));
  s.rect(mx - 1, ty - 1, w.bar, w.bar, cr(3));
  // a brass latch on the mullion
  s.rect(mx - 1, ty + 18, 3, 6, C('gold', 2)); s.vl(mx - 1, ty + 18, ty + 23, C('gold', 4)); s.set(mx + 1, ty + 23, C('gold', 1));
  // sill
  const sl = L.sill, sx0 = x0 - sl.over, sx1 = x0 + w.w + sl.over - 1, sy = sl.y + oy;
  s.rect(sx0, sy, sx1 - sx0 + 1, sl.h, cr(3));
  s.hl(sx0, sx1, sy, cr(4)); s.hl(sx0, sx1, sy + 1, cr(4));
  s.hl(sx0, sx1, sy + sl.h - 1, cr(1)); s.vl(sx0, sy, sy + sl.h - 1, cr(2)); s.vl(sx1, sy, sy + sl.h - 1, cr(2));
  s.hl(sx0 + 1, sx1 + 1, sy + sl.h, C('wall', 1)); s.hl(sx0 + 2, sx1 + 2, sy + sl.h + 1, C('wall', 2));
}
/** Glare on the glass, drawn on top of the view: two diagonal streaks of dithered light. */
export function drawGlare(s, L, ox, oy) {
  // two short parallel streaks of light in the top corner of each upper pane
  const o = openingOf(L), ix = o.x + ox, iy = o.y + oy, half = Math.round(o.w / 2);
  const streak = (x, y, len) => { for (let k = 0; k < len; k++) s.set(x + k, y - k, C('cream', 4)); };
  for (const px of [ix, ix + half + 1]) { streak(px + 4, iy + 12, 9); streak(px + 4, iy + 17, 13); streak(px + 6, iy + 19, 4); }
}

function drawShelf(s, L, ox, oy) {
  const sh = L.shelf, x0 = sh.x + ox, y0 = sh.y + oy, wd = l => C('wood', l);
  // brackets
  for (const bx of [x0 + 8, x0 + sh.w - 11]) { s.rect(bx, y0 + 4, 3, 7, C('steel', 2)); s.vl(bx, y0 + 4, y0 + 10, C('steel', 3)); s.set(bx + 2, y0 + 10, C('steel', 1)); }
  s.rect(x0, y0, sh.w, 4, wd(3)); s.hl(x0, x0 + sh.w - 1, y0, wd(4)); s.hl(x0, x0 + sh.w - 1, y0 + 3, wd(1)); s.vl(x0, y0, y0 + 3, wd(2));
  s.hl(x0 + 1, x0 + sh.w, y0 + 4, C('wall', 1)); s.hl(x0 + 2, x0 + sh.w + 1, y0 + 5, C('wall', 2));
}

function drawPinboard(s, L, ox, oy) {
  const p = L.pin, x0 = p.x + ox, y0 = p.y + oy, wd = l => C('wood', l), ck = l => C('cork', l);
  s.rect(x0 + 2, y0 + 2, p.w, p.h, C('wall', 2));
  s.rect(x0, y0, p.w, p.h, wd(2));
  s.hl(x0, x0 + p.w - 1, y0, wd(4)); s.vl(x0, y0, y0 + p.h - 1, wd(3));
  s.hl(x0, x0 + p.w - 1, y0 + p.h - 1, wd(0)); s.vl(x0 + p.w - 1, y0, y0 + p.h - 1, wd(1));
  s.rect(x0 + 3, y0 + 3, p.w - 6, p.h - 6, ck(3));
  s.hl(x0 + 3, x0 + p.w - 4, y0 + 3, ck(1)); s.vl(x0 + 3, y0 + 3, y0 + p.h - 4, ck(2));
  for (let y = y0 + 4; y < y0 + p.h - 3; y++) for (let x = x0 + 4; x < x0 + p.w - 3; x++) {
    const h = hash(x, y, 31);
    if (h < .07) s.set(x, y, ck(2)); else if (h > .95) s.set(x, y, ck(4));
  }
}

function drawDesk(s, L, ox, oy) {
  const d = L.desk, W = s.w, by = d.backY + oy, fy = d.frontY + oy, wd = l => C('wood', l);
  const xl = x => x + ox, right = W + 2;
  // the contact shadow where the desk meets the wall
  s.hl(xl(d.leftBack) + 1, W, by - 1, C('wall', 2));
  // the top, in gentle perspective: the left end slants toward the viewer
  s.poly([[xl(d.leftBack), by], [right, by], [right, fy], [xl(d.leftFront), fy]], wd(3));
  // grain: long thin strokes, broken
  for (let y = by + 3; y < fy - 2; y += 4) {
    let x = xl(d.leftBack) + 4 + ((y * 7) % 13);
    while (x < W) { const len = 10 + ((x * 13 + y * 3) % 23); s.hl(x, Math.min(W, x + len), y, wd(2)); x += len + 6 + ((x + y) % 11); }
  }
  for (let y = by + 1; y < fy - 1; y++) for (let x = xl(d.leftBack); x < W; x++) if (hash(x, y, 3) < .012) s.set(x, y, wd(4));
  // a highlight along the front edge, the face below
  s.line(xl(d.leftBack), by, xl(d.leftFront), fy - 1, wd(2));
  s.hl(xl(d.leftFront) + 1, W, fy - 1, wd(4));
  s.rect(xl(d.leftFront), fy, right - xl(d.leftFront), d.faceH, wd(2));
  s.hl(xl(d.leftFront), W, fy, wd(3));
  s.hl(xl(d.leftFront), W, fy + d.faceH - 1, wd(1));
  s.vl(xl(d.leftFront), fy, fy + d.faceH - 1, wd(1));
  // drawer
  if (L.mode === 'wide') {
    const dx = xl(92), dw = 64;
    s.rect(dx, fy + 2, dw, d.faceH - 4, wd(2)); s.hl(dx, dx + dw - 1, fy + 2, wd(1)); s.vl(dx, fy + 2, fy + d.faceH - 3, wd(1)); s.hl(dx, dx + dw - 1, fy + d.faceH - 3, wd(3));
    s.rect(dx + dw / 2 - 4, fy + 4, 8, 2, C('steel', 2)); s.hl(dx + dw / 2 - 4, dx + dw / 2 + 3, fy + 4, C('steel', 4));
  }
  // below the desk: the wall in its shade, legs, the skirting and the floor
  const under = fy + d.faceH;
  if (L.floorY != null) {
    const fl = L.floorY + oy;
    const x0 = xl(d.leftFront);
    for (let y = under; y < fl; y++) for (let x = x0; x < W; x++) { const k = (y - under) / 14; if (k < 1 && bayer(x, y) > k * 1.1) s.set(x, y, C('wall', 2)); }
    s.hl(x0, W, under, C('wall', 1));
    // legs
    for (const lx of [xl(d.leftFront) + 4]) { s.rect(lx, under, d.legW, fl - under, wd(2)); s.vl(lx, under, fl - 1, wd(3)); s.vl(lx + d.legW - 1, under, fl - 1, wd(1)); s.hl(lx, lx + d.legW - 1, under, wd(1)); }
    // skirting, then floorboards
    s.rect(0, fl, W, 3, C('cream', 3)); s.hl(0, W, fl, C('cream', 4)); s.hl(0, W, fl + 2, C('cream', 1));
    const fb = fl + 3;
    s.rect(0, fb, W, s.h - fb, wd(2));
    for (let y = fb; y < s.h; y += 4) {
      s.hl(0, W, y, wd(1));
      const off = ((y - fb) / 4 | 0) * 37 % 53;
      for (let x = off; x < W; x += 53) s.vl(x, y + 1, y + 3, wd(1));
      for (let x = 0; x < W; x++) if (hash(x, y + 1, 9) < .05) s.set(x, y + 2, wd(3));
    }
    s.hl(0, W, fb, wd(0));
  } else {
    for (let y = under; y < s.h; y++) for (let x = 0; x < W; x++) { const k = (y - under) / 14; if (k < 1 && bayer(x, y) > k * 1.1) s.set(x, y, C('wall', 2)); }
    s.hl(0, W, under, C('wall', 1));
    for (const lx of [Math.max(2, xl(d.leftFront) + 4)]) { s.rect(lx, under, d.legW, s.h - under, wd(2)); s.vl(lx, under, s.h - 1, wd(3)); s.vl(lx + d.legW - 1, under, s.h - 1, wd(1)); }
  }
}

function drawSocket(s, x, y, kind) {
  const cr = l => C('cream', l);
  s.rect(x - 4, y - 5, 9, 11, cr(3)); s.hl(x - 4, x + 4, y - 5, cr(4)); s.vl(x + 4, y - 5, y + 5, cr(1)); s.hl(x - 4, x + 4, y + 5, cr(1));
  s.hl(x - 3, x + 5, y + 6, C('wall', 1));
  if (kind === 'us') { s.vl(x - 2, y - 2, y, C('ink', 1)); s.vl(x + 2, y - 2, y, C('ink', 1)); s.set(x, y + 3, C('ink', 1)); }
  else { s.set(x, y - 3, C('ink', 1)); s.set(x - 2, y + 1, C('ink', 1)); s.set(x + 2, y + 1, C('ink', 1)); s.rect(x - 2, y + 3, 5, 1, C('cream', 2)); s.set(x + 3, y - 4, C('red', 3)); }
}

function drawLamp(s, L, ox, oy) {
  const [bx, by] = L.lamp.base, [ex, ey] = L.lamp.elbow, [hx, hy] = L.lamp.head;
  const X = bx + ox, Y = by + oy, EX = ex + ox, EY = ey + oy, HX = hx + ox, HY = hy + oy, r = l => C('red', l);
  // cord, a loose curve off the back of the desk
  for (let k = 0; k <= 22; k++) { const t = k / 22, x = Math.round(X + 5 + t * 22), y = Math.round(Y + Math.sin(t * Math.PI) * 3 - t * 5); s.set(x, y, C('ink', 1)); }
  // weighted base and a short stem
  s.ellipse(X, Y - 1, 8.5, 3, r(1)); s.ellipse(X, Y - 2, 8, 2.6, r(2));
  s.hl(X - 5, X + 1, Y - 4, r(4)); s.hl(X - 6, X - 4, Y - 3, r(3)); s.hl(X + 4, X + 7, Y - 2, r(1));
  s.rect(X - 1, Y - 8, 3, 5, r(2)); s.vl(X - 1, Y - 8, Y - 4, r(4)); s.vl(X + 1, Y - 8, Y - 4, r(1));
  // the two arms: each a ribbon of two clean one-pixel lines, a spring beside it
  const arm = (x0, y0, x1, y1, side) => {
    s.line(x0, y0, x1, y1, r(2)); s.line(x0 + 1, y0, x1 + 1, y1, r(1)); s.line(x0 - 1, y0, x1 - 1, y1, r(4));
    void side;
  };
  arm(X, Y - 8, EX, EY, 1);
  arm(EX, EY, HX - 6, HY - 3, -1);
  s.disc(EX, EY, 2.2, r(1)); s.set(EX, EY, C('steel', 4)); s.set(EX - 1, EY - 1, r(3));
  // the head: a cone pointing down and to the right, its rim catching the light
  const head = [[HX - 8, HY - 4], [HX - 3, HY - 8], [HX + 9, HY + 4], [HX + 4, HY + 11]];
  s.poly(head, r(2));
  s.line(HX - 8, HY - 4, HX - 3, HY - 8, r(3)); s.line(HX - 3, HY - 8, HX + 9, HY + 4, r(4)); s.line(HX - 2, HY - 7, HX + 8, HY + 3, r(3));
  s.line(HX - 8, HY - 3, HX + 3, HY + 10, r(1));
  s.line(HX + 4, HY + 11, HX + 9, HY + 4, C('cream', 4)); s.line(HX + 3, HY + 10, HX + 8, HY + 4, C('cream', 3));
  s.rect(HX - 10, HY - 6, 3, 3, r(1)); s.set(HX - 10, HY - 6, r(3));
}
export function lampMouth(L, ox, oy) { const [hx, hy] = L.lamp.head; return [hx + ox + 7, hy + oy + 9]; }

/* ───────── light maps ─────────
   A map says which light falls on each pixel: 0 the room's light, 1 a lit patch (window sun or
   lamplight), 2 a screen's spill. Edges are ordered-dithered, the pixel way of saying "soft". */
export function lightMap(L, ox, oy, w, h, cfg) {
  const m = new Uint8Array(w * h), d = L.desk, o = openingOf(L);
  if (cfg.patch) {
    // window light on the desk top: the two panes, projected forward and to one side
    const by = d.backY + oy + 1, fy = d.frontY + oy - 1, shift = cfg.patchShift || 0, ix = o.x + ox, mx = ix + Math.round(o.w / 2);
    const panes = [[ix + 2, mx - 3], [mx + 2, o.x + o.w + ox - 2]];
    for (let y = by; y < fy; y++) {
      const t = (y - by) / (fy - by), sx = shift * (6 + t * 26), spread = t * 9;
      for (const [a, b] of panes) {
        const xa = a + sx - spread * .6, xb = b + sx + spread * .4;
        for (let x = Math.floor(xa) - 2; x <= Math.ceil(xb) + 2; x++) {
          if (x < 0 || x >= w) continue;
          const inside = Math.min(x - xa, xb - x, (y - by) + .5, (fy - y));
          if (inside >= 1.5 || (inside > -1.5 && bayer(x, y) < (inside + 1.5) / 3 * cfg.patch)) m[y * w + x] = 1;
        }
      }
    }
  }
  if (cfg.lamp) {
    const [mx, my] = lampMouth(L, ox, oy), cx = mx + 22, cy = d.backY + oy + Math.round((d.frontY - d.backY) * .55);
    const pool = (x, y) => { const dx = (x - cx) / 52, dy = (y - cy) / 15; return dx * dx + dy * dy; };
    const halo = (x, y) => { const dx = (x - mx) / 17, dy = (y - my) / 15; return dx * dx + dy * dy; };
    for (let y = Math.max(0, my - 34); y < Math.min(h, d.frontY + oy + d.faceH + 6); y++) for (let x = Math.max(0, cx - 60); x < Math.min(w, cx + 62); x++) {
      const a = pool(x, y), onTop = y >= d.backY + oy && y < d.frontY + oy, k = onTop ? 1 - a : 0;
      if (k > .35 || (k > 0 && bayer(x, y) < k / .35)) { m[y * w + x] = 1; continue; }
      // round the lamp's head the light only speckles the wall: never solid
      const hv = 1 - halo(x, y);
      if (hv > 0 && bayer(x, y) < hv * .42) m[y * w + x] = 1;
    }
  }
  for (const g of cfg.glows || []) {
    // a screen's spill: a low ellipse on the desk in front of it
    for (let y = g.y - 2; y < g.y + g.ry + 2; y++) for (let x = g.x - g.rx - 2; x < g.x + g.rx + 2; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h || m[y * w + x]) continue;
      const dx = (x - g.x) / g.rx, dy = (y - g.y) / g.ry, k = 1 - (dx * dx + dy * dy);
      if (k > .5 || (k > 0 && bayer(x, y) < k / .5 * .8)) m[y * w + x] = 2;
    }
  }
  return m;
}
