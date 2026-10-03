/* Four frames in mosaic: the room's layout, as on the homepage (src/pages/home/four-frames/stage.js). */
import { LANE_PX } from './constants.js';

export const ERAS = ['now', 'sd', 'blr', 'nitk'];
export const PLACE_NAMES = { now: 'San Jose', sd: 'San Diego', blr: 'Bengaluru', nitk: 'Surathkal' };

/* ───────── layouts (art units; the art square is 1000 × 1000) ───────── */
function wideBase() {
  return {
    mode: 'wide', objScale: 1,
    win: { x: 170, y: 118, w: 470, h: 482, f: 20, transom: .36, bar: 12 },
    sill: { y: 600, h: 20, over: 24 },
    shelf: { x: 690, y: 172, w: 290 },
    pin: { x: 700, y: 214, w: 278, h: 246 },
    desk: { backY: 668, frontY: 806, faceH: 34, leftBack: 34, leftFront: 4, legW: 26 },
    base: { y: 952, h: 20 },
    lamp: { base: [92, 712], elbow: [42, 470], head: [196, 432], aim: [262, 736] },
    slots: { left: [238, 748], center: [440, 772], right: [652, 758], far: [858, 742] },
    floor: [872, 970],
    chair: { x: 214, top: 772, floor: 986 },
    socket: [640, 900],
  };
}
function tallBase() {
  return {
    mode: 'tall', objScale: 1,
    win: { x: 252, y: 36, w: 428, h: 418, f: 18, transom: .36, bar: 11 },
    sill: { y: 454, h: 18, over: 16 },
    shelf: { x: 18, y: 66, w: 206 },
    pin: { x: 22, y: 106, w: 202, h: 236 },
    desk: { backY: 526, frontY: 652, faceH: 30, leftBack: -40, leftFront: -60, legW: 22 },
    base: { y: 806, h: 18 },
    lamp: { base: [74, 566], elbow: [30, 372], head: [142, 338], aim: [196, 606] },
    slots: { left: [150, 606], center: [338, 628], right: [488, 616], far: [646, 604] },
    floor: null, chair: null, socket: null,
  };
}
/** The layout for a stage box of w × h CSS pixels. `bounds` overrides the visible extent (stills). */
export function layoutFor(mode, w, h, bounds) {
  if (mode === 'wide') {
    const art = Math.min(h, w - LANE_PX), u = Math.max(art, 200) / 1000;
    return { ...wideBase(), u, xMin: 1000 - w / u, xMax: 1000, yMin: 1000 - h / u, yMax: 1000, ...bounds };
  }
  const u = Math.min(w / 700, h / 790);
  return { ...tallBase(), u, xMin: 350 - w / u / 2, xMax: 350 + w / u / 2, yMin: 742 - h / u, yMax: 742, ...bounds };
}

