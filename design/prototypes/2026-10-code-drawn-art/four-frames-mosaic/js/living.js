/* Four frames in mosaic: what moves.
   The stones never move. What moves is the scene behind them: each frame the view outside is
   painted again on a small live sheet (clouds drifting, birds, kites, the lighthouse beam) and
   every stone in the window takes the colour beneath it, so motion ripples through fixed
   tesserae. On the desk, the laptop's stones light up in reading order as it types, the robot's
   eye stones close for a blink, the scope's trace runs as a bright stone. Glass stones catch a
   slow band of window light. */
import { TAU, PI, clamp, mulberry32 } from './core.js';
import { Pen, PAL } from './ink.js';
import { CLOUDS, drawCloudSpec, setViewLight } from './views.js';
import { stoneOf, stoneOfDay, PAL_RGB, PAL_LAB, toLab, viewTone } from './palette.js';

/* a pen that paints fills only: moving things in the window have no outline of their own */
class FillPen extends Pen { ink() { return this; } }

const wrap = (v, a, b) => a + ((((v - a) % (b - a)) + (b - a)) % (b - a));

/* ───────── the view, painted again each frame (view units, 1000 wide) ───────── */
function drawBird(c, x, y, w, flap, col) {
  c.fillStyle = col; c.beginPath();
  c.moveTo(x - w, y - w * .25 * flap); c.quadraticCurveTo(x - w * .4, y - w * .45 * flap, x, y);
  c.quadraticCurveTo(x + w * .4, y - w * .45 * flap, x + w, y - w * .25 * flap);
  c.lineTo(x + w * .55, y - w * .02); c.quadraticCurveTo(x, y + w * .32, x - w * .55, y - w * .02); c.closePath(); c.fill();
}
const LIVE = {
  now(c, H, t, sky) {
    if (sky.night > .5) {
      // an aircraft's beacon crossing high over the valley
      const x = wrap(t * 22, -200, 1200), on = (t * 1.3) % 1 < .35;
      if (on) { c.fillStyle = '#ff5a3c'; c.beginPath(); c.arc(x, H * .14 + Math.sin(t * .1) * 6, 13, 0, TAU); c.fill(); }
      return;
    }
    // a hawk circling, and now and then three birds gliding across
    const a = t * .22, x = 330 + Math.cos(a) * 90, y = H * .18 + Math.sin(a) * 22;
    drawBird(c, x, y, 64, .7 + .3 * Math.sin(t * 2.1), 'rgba(52,44,38,.95)');
    const fl = wrap(t * 30, -300, 1700);
    for (let i = 0; i < 3; i++) drawBird(c, fl - i * 120, H * .3 + i * 26 + Math.sin(t * .8 + i) * 8, 46, .6 + .4 * Math.sin(t * 5 + i * 1.7), 'rgba(60,52,46,.9)');
  },
  sd(c, H, t) {
    // gulls riding the sea breeze
    for (let i = 0; i < 3; i++) {
      const x = wrap(t * (34 + i * 7) + i * 420, -200, 1200), y = H * (.16 + i * .07) + Math.sin(t * .9 + i * 2) * 14;
      drawBird(c, x, y, 58 - i * 6, .55 + .45 * Math.sin(t * 4.2 + i), 'rgba(252,250,242,.98)');
    }
  },
  blr(c, H, t) {
    // two paper kites tugging on their strings, drawn big enough to be stones
    for (const [x0, y0, col, ph] of [[300, H * .3, '#e2553a', 0], [560, H * .22, '#2f55b8', 1.7]]) {
      const x = x0 + Math.sin(t * .7 + ph) * 34, y = y0 + Math.sin(t * 1.1 + ph) * 20, r = Math.sin(t * .9 + ph) * .2;
      c.save(); c.translate(x, y); c.rotate(r);
      c.beginPath(); c.moveTo(0, -46); c.lineTo(34, 0); c.lineTo(0, 54); c.lineTo(-34, 0); c.closePath(); c.fillStyle = col; c.fill();
      c.fillStyle = 'rgba(255,240,220,.9)'; c.beginPath(); c.moveTo(0, -46); c.lineTo(34, 0); c.lineTo(0, 0); c.closePath(); c.fill();
      for (let k = 1; k <= 4; k++) { c.fillStyle = k % 2 ? col : '#f1d27a'; c.beginPath(); c.arc(Math.sin(t * 3 + k + ph) * 12, 54 + k * 26, 9, 0, TAU); c.fill(); }
      c.restore();
    }
  },
  nitk(c, H, t) {
    // the lighthouse beam sweeping round, brightest as it faces us
    const hx = 250, hy = H * .6 - 44 - 134 * 1.25, a = ((t * .35) % 1) * TAU, face = Math.cos(a);
    const dir = Math.sin(a) > 0 ? 1 : -1, len = 900 * Math.abs(Math.sin(a)) + 80, spread = .07 + (1 - Math.abs(Math.sin(a))) * .4;
    c.save(); c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(hx, hy, hx + dir * len, hy);
    g.addColorStop(0, `rgba(255,236,170,${.7 + face * .25})`); g.addColorStop(1, 'rgba(255,236,170,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + dir * len, hy - len * spread); c.lineTo(hx + dir * len, hy + len * spread * .6); c.closePath(); c.fill();
    c.globalAlpha = .7 + Math.max(0, face) * .3; c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(hx, hy, 16 + Math.max(0, face) * 14, 0, TAU); c.fill();
    c.restore();
  },
};

/** The live view sheet for one place: its static colour plus everything that moves. */
export function makeLiveView(era, view, sky) {
  const cv = document.createElement('canvas'); cv.width = view.w; cv.height = view.h;
  const c = cv.getContext('2d', { willReadFrequently: true });
  const clouds = view.clouds.map((s, i) => ({ ...s, v: 9 + (i * 3.7 % 7), w0: s.w }));
  return {
    cv, c,
    paint(t) {
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
      c.drawImage(view.col, 0, 0);
      c.setTransform(view.sc, 0, 0, view.sc, 0, 0);
      setViewLight(sky);  // the view's colours depend on its own light (other places may have set theirs)
      const P = new FillPen(c, view.sc); P.pool = 0;
      for (const s of clouds) {
        // each cloud drifts right and comes round again from the left
        const span = 1000 + s.w0 * 1.4, x = wrap(s.cx + s.v * t, -s.w0 * .7, 1000 + s.w0 * .7);
        void span;
        drawCloudSpec(P, s, x - s.cx);
      }
      LIVE[era]?.(c, view.H, t, sky);
      return c.getImageData(0, 0, cv.width, cv.height).data;
    },
  };
}

/* ───────── per-stone life in the window: stars, valley lights, the sea ───────── */
const lumOf = i => { const p = PAL_LAB[i]; return p[0] / 100; };
export function assignSparkle(era, tiles, layout, view, sky) {
  const rnd = mulberry32(era.length * 97 + 13), o = layout.opening, Hs = o.y1 - o.y0;
  for (const t of tiles) {
    if (!t.view) continue;
    const vy = (t.y - o.y0) / Hs;
    const L = lumOf(t.stone);
    t.spark = 0;
    if ((sky.night || 0) > .4) {
      if (vy < .42 && L < .4 && rnd() < .04) { t.spark = 1; t.ph = rnd() * TAU; t.rate = .4 + rnd() * .9; }         // a star
      else if (era === 'now' && vy > .52 && vy < .9 && L < .45 && rnd() < .07) { t.spark = 2; t.ph = rnd() * TAU; t.rate = .2 + rnd() * .5; } // valley lights
    }
    if (era === 'nitk' && vy > .62 && vy < .86) { t.spark = 3; t.ph = rnd() * TAU; }                                      // the sea
  }
}
const STAR = stoneOf(248, 234, 184), LAMP = stoneOf(241, 210, 122), WARM = stoneOf(239, 154, 90);
/** the stone a window stone shows at time t, given the colour beneath it */
export function liveViewStone(t, tile, r, g, b, night, now) {
  const pick = night < .3 ? stoneOfDay : stoneOf;
  [r, g, b] = viewTone(r, g, b, night);
  let s = pick(r | 0, g | 0, b | 0);
  if (tile.spark === 1) { if (Math.sin(now * tile.rate + tile.ph) > .55) s = STAR; }
  else if (tile.spark === 2) { const v = Math.sin(now * tile.rate + tile.ph); if (v > -.2) s = v > .85 ? LAMP : WARM; }
  else if (tile.spark === 3) {
    // the sea: highlights travelling shoreward, brightest under the moon
    const ph = tile.x * .21 - now * 1.6 + Math.sin(tile.y * .7 + now * .4) * 1.4 + tile.ph * .3;
    if (Math.sin(ph) > .955) s = pick(Math.min(255, r * 1.5 + 60), Math.min(255, g * 1.5 + 60), Math.min(255, b * 1.4 + 50));
  }
  return s;
}

/* ───────── life on the desk ───────── */
/** the laptop types: its screen's stones light up row by row, like lines being written */
export function tokensFor(tiles, rect, toSheet) {
  const [x0, y0] = toSheet(rect.x + 8, rect.y + 8), [x1, y1] = toSheet(rect.x + rect.w - 8, rect.y + rect.h - 8);
  const list = tiles.filter(t => !t.view && t.k !== 0 && t.x > x0 && t.x < x1 && t.y > y0 && t.y < y1);
  list.sort((a, b) => (a.y - b.y) || (a.x - b.x));
  // group into text rows by height
  const rows = []; for (const t of list) { const r = rows.find(rr => Math.abs(rr.y - t.y) < t.w * .6); if (r) r.tiles.push(t); else rows.push({ y: t.y, tiles: [t] }); }
  rows.sort((a, b) => a.y - b.y);
  rows.forEach((r, i) => { r.tiles.sort((a, b) => a.x - b.x); r.len = Math.max(1, Math.round(r.tiles.length * (.4 + ((i * 37) % 50) / 100))); });
  return rows;
}
const CODE = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3', '#e59a8a'].map(h => stoneOf(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)));
const CURSOR = stoneOf(242, 242, 242);
export function tokensAt(rows, t) {
  const out = new Map(); if (!rows.length) return out;
  const total = rows.reduce((n, r) => n + r.len, 0), cyc = (t % 11) / 11, shown = Math.floor(cyc * total * 1.15);
  let n = 0;
  rows.forEach((r, i) => {
    for (let k = 0; k < r.len; k++, n++) {
      if (n < shown) out.set(r.tiles[k], CODE[(i + 1) % CODE.length]);
      else if (n === shown && (t * 2.4) % 1 < .55) out.set(r.tiles[k], CURSOR);
    }
  });
  return out;
}
/** the robot blinks: its eye stones close (turn cobalt) for a moment every few seconds */
export function eyesFor(tiles, eyes, toSheet, s) {
  const out = [];
  for (const [ex, ey, er] of eyes) { const [x, y] = toSheet(ex, ey); for (const t of tiles) if (Math.hypot(t.x - x, t.y - y) < Math.max(s * .8, er * 1.05 * s / 16)) out.push(t); }
  return out;
}
const COBALT = stoneOf(47, 85, 184);
export const blinkOn = t => { const cyc = (t + 1.3) % 4.6; return cyc <= .18; };
export const COBALT_STONE = COBALT;
/** the scope's phosphor dot running along its square wave */
export function traceFor(tiles, rect, toSheet) {
  const [x0, y0] = toSheet(rect.x, rect.y), [x1, y1] = toSheet(rect.x + rect.w, rect.y + rect.h);
  return { x0, y0, x1, y1, tiles: tiles.filter(t => !t.view && t.k !== 0 && t.x > x0 && t.x < x1 && t.y > y0 && t.y < y1) };
}
const PHOS = stoneOf(200, 255, 220), PHOS2 = stoneOf(120, 230, 150);
export function traceAt(tr, t, s) {
  const out = new Map(); if (!tr.tiles.length) return out;
  const w = tr.x1 - tr.x0, h = tr.y1 - tr.y0, hi = tr.y0 + h * .3, lo = tr.y0 + h * .7;
  const lvl = u => ((u * 4 + .05) % 1) < .5 ? hi : lo;
  for (let i = 0; i < 4; i++) {
    const u = ((t * .9) % 1) - i * .03; if (u < 0) break;
    const px = tr.x0 + w * u, py = lvl(u);
    let best = null, bd = 1e9; for (const tt of tr.tiles) { const d = Math.hypot(tt.x - px, tt.y - py); if (d < bd) { bd = d; best = tt; } }
    if (best && bd < s && !out.has(best)) out.set(best, i === 0 ? PHOS : PHOS2);
  }
  return out;
}

/* ───────── glass stones catching a slow band of window light ───────── */
export function glintAt(t, x, y, W, H) {
  const band = ((t / 14) % 1) * 1.6 - .3, u = (x / W) * .8 + (y / H) * .4;
  const d = Math.abs(u - band); return d < .06 ? (1 - d / .06) : 0;
}
export { PAL_RGB, toLab, clamp, PI, PAL, CLOUDS };
