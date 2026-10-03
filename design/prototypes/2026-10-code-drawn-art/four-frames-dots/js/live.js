/* Four frames in print: what keeps moving. Drawn every frame as separated artwork, so it is
   printed through the same screens as everything else: clouds drift across the window, birds
   cross, the valley lights twinkle after dark, kites tug at their strings, the lighthouse beam
   sweeps and the sea glitters under the moon; on the desk the laptop types, the robot blinks
   and the scope's trace runs. */
import { TAU, PI, clamp, mulberry32 } from './core.js';
import { LW_IN, LW_FINE, INK, PAL, EL, R, PL, LN } from './ink.js';
import { cloud, setViewLight } from './views.js';

const wrap = (v, a, b) => a + ((((v - a) % (b - a)) + (b - a)) % (b - a));
const KEYLINE = 'rgba(40,34,30,.9)';

function bird(P, x, y, w, flap, col = KEYLINE) {
  const lift = Math.sin(flap) * w * .35;
  P.ink(c => { c.moveTo(x - w, y - lift); c.quadraticCurveTo(x - w * .45, y - w * .35 - lift * .2, x, y); c.quadraticCurveTo(x + w * .45, y - w * .35 - lift * .2, x + w, y - lift); }, 1.5, col);
}

/* clouds that drift: [x0, y as fraction of H, w, h, seed, speed in view units / s] */
const CLOUDS = {
  now: [[180, .09, 280, 80, 11, 7], [860, .05, 190, 52, 12, 4.5], [520, .16, 150, 40, 13, 9]],
  sd: [[210, .1, 160, 42, 21, 6], [840, .17, 110, 30, 22, 9], [560, .06, 200, 46, 23, 4]],
};

/** Live things outside the window, in view units (1000 wide, H tall). */
export function drawViewLive(P, era, H, t, sky) {
  setViewLight(sky);
  if (CLOUDS[era] && !(era === 'now' && sky.night >= .75)) {
    for (const [x0, fy, w, h, seed, v] of CLOUDS[era]) cloud(P, wrap(x0 + t * v, -w * .6, 1000 + w * .6), H * fy, w, h, seed, LW_FINE);
  }
  if (era === 'now') {
    if (sky.night < .4) {
      // a hawk circling high over the valley
      const a = t * .22, x = 330 + Math.cos(a) * 70, y = H * .2 + Math.sin(a) * 18;
      bird(P, x, y, 10, t * 2.1);
    }
    if (sky.night > .05) {
      // the valley lights, some of them flickering; a plane's beacon crossing high up
      const r = mulberry32(81), y1 = H * .64, vy = H * .66;
      for (let i = 0; i < 70; i++) {
        const x = r() * 1000, y = y1 - 20 + r() * (vy - y1 + 14), ph = r() * TAU, sp = .6 + r() * 2.4;
        const a = sky.night * clamp(.5 + .5 * Math.sin(t * sp + ph)) * (r() < .5 ? 1 : .6);
        if (a > .05) P.fill(`rgba(255,226,150,${a})`, R(x, y, 3.2, 3.2));
      }
      const px = wrap(-80 + t * 26, -80, 1080), py = H * .12 + Math.sin(t * .05) * 6;
      if (Math.sin(t * 6) > .55) P.fill(`rgba(255,120,90,${sky.night})`, EL(px, py, 3.2, 3.2));
      else P.fill(`rgba(255,248,220,${sky.night * .8})`, EL(px + 6, py, 2.2, 2.2));
    }
  }
  if (era === 'sd') {
    // gulls crossing toward the sea, a glint on the Pacific
    for (let k = 0; k < 3; k++) {
      const x = wrap(1050 - t * (34 + k * 9) - k * 260, -60, 1100), y = H * (.22 + k * .05) + Math.sin(t * .8 + k) * 8;
      bird(P, x, y, 8 - k, t * 7 + k * 2);
    }
    for (let i = 0; i < 6; i++) {
      const a = clamp(.5 + .6 * Math.sin(t * 2.2 + i * 1.9));
      if (a > .1) P.ink(LN([[24 + i * 52, H * .605 + (i % 2) * 5], [40 + i * 52, H * .605 + (i % 2) * 5]]), 1.6, `rgba(255,255,255,${a})`);
    }
  }
  if (era === 'blr') {
    // two paper kites tugging on their strings, a pair of kites' worth of crows
    for (const [x0, y0, col, ph] of [[300, H * .3, '#c4704f', 0], [560, H * .22, '#4e6c88', 1.7]]) {
      const x = x0 + Math.sin(t * .7 + ph) * 14, y = y0 + Math.sin(t * 1.1 + ph) * 8, rot = Math.sin(t * .9 + ph) * .18;
      P.ink(c => { c.moveTo(x, y + 4); c.quadraticCurveTo(x + 60, y + 160, x + 140 + ph * 30, H * .62); }, .8, 'rgba(40,34,30,.6)');
      P.at(x, y, rot, 1, p => {
        p.shape(PL([[0, -18], [13, 0], [0, 22], [-13, 0]]), col, LW_IN);
        p.ink(LN([[0, -18], [0, 22]]), .8); p.ink(LN([[-13, 0], [13, 0]]), .8);
        p.ink(c => { c.moveTo(0, 22); for (let k = 1; k <= 6; k++) c.lineTo(Math.sin(t * 3 + k + ph) * 6, 22 + k * 7); }, 1);
      });
    }
    for (let k = 0; k < 2; k++) { const a = t * .3 + k * PI; bird(P, 760 + Math.cos(a) * 60, H * .34 + Math.sin(a) * 14, 7, t * 6 + k); }
  }
  if (era === 'nitk') {
    // the lighthouse beam sweeping round, brightest as it faces us
    const hx = 250, hy = H * .6 - 44 - 134 * 1.25, a = ((t * .35) % 1) * TAU, face = Math.cos(a);
    const dir = Math.sin(a) > 0 ? 1 : -1, len = 900 * Math.abs(Math.sin(a)) + 80, spread = .06 + (1 - Math.abs(Math.sin(a))) * .4;
    P.fill(`rgba(255,240,196,${.34 + Math.max(0, face) * .2})`, PL([[hx, hy], [hx + dir * len, hy - len * spread], [hx + dir * len, hy + len * spread * .6]]));
    P.fill(`rgba(255,243,200,${.7 + Math.max(0, face) * .3})`, EL(hx, hy, 9 + Math.max(0, face) * 8, 9 + Math.max(0, face) * 8));
    // the moon's path on the water, glittering; a few stars catching
    const hz = H * .6, mx = sky.moonX || 760;
    for (let i = 0; i < 14; i++) {
      const y = hz + 8 + i * 10, w = 8 + i * 3, ph = i * 1.7;
      const k = clamp(.4 + .7 * Math.sin(t * 2.6 + ph));
      if (k > .15) P.fill(`rgba(255,244,210,${k * (.8 - i * .04)})`, R(mx - w / 2 + Math.sin(t * .9 + ph) * 10, y, w, 2.4));
    }
    const r = mulberry32(5);
    for (let i = 0; i < 12; i++) { const x = r() * 1000, y = r() * H * .5, a = clamp(Math.sin(t * (1 + r() * 2) + r() * TAU)); if (a > .3) P.fill(`rgba(255,248,224,${a})`, EL(x, y, 2.2, 2.2)); }
  }
}

/** Live things on the desk, in art units. */
export function drawObjectLive(P, ob, t) {
  if (ob.live === 'blink') {
    const cyc = (t + 1.3) % 4.6;
    if (cyc <= .16) {
      const k = Math.sin(cyc / .16 * PI);
      for (const [ex, ey, er] of ob.eyes) {
        P.fill(PAL.cobalt, R(ex - er - 2, ey - er - 2, 2 * er + 4, (2 * er + 4) * k));
        P.ink(LN([[ex - er, ey - er + 2 * er * k], [ex + er, ey - er + 2 * er * k]]), LW_IN, INK);
      }
    }
  } else if (ob.live === 'trace') {
    // the dot running along the square wave, leaving a brighter trail
    const r = ob.screen, ph = (t * .9) % 1, hi = r.y + r.h * .3, lo = r.y + r.h * .7;
    const lvl = u => ((u * 4 + .05) % 1) < .5 ? hi : lo;
    for (let i = 0; i < 14; i++) { const u0 = ph - i * .012, u1 = u0 - .012; if (u1 < 0) break; P.ink(LN([[r.x + r.w * u0, lvl(u0)], [r.x + r.w * u1, lvl(u0)]]), 2.6, `rgba(214,255,226,${.95 - i * .06})`); }
    P.fill('#f2fff6', EL(r.x + r.w * ph, lvl(ph), 2.8, 2.8));
  } else if (ob.live === 'tokens') {
    // new lines being written under the static ones
    const r = ob.screen, cyc = (t % 9) / 9, lines = 6, shown = cyc * lines * 1.3;
    const cols = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3', '#e59a8a'], sc = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3'];
    P.fill('#273240', R(r.x + .6, r.y + .6, r.w - 1.2, r.h - 1.2));
    for (let i = 0; i < 6; i++) P.fill(sc[i % 4], R(r.x + 14 + (i % 3 === 2 ? 16 : 0), r.y + 16 + i * 13, 50 + (i * 37 % 70), 4));
    for (let i = 0; i < lines; i++) {
      const ly = r.y + 16 + (i + 6) * 13 * .78; if (ly > r.y + r.h - 8) break;
      const x0 = r.x + 14 + (i % 4 === 1 ? 14 : 0), full = Math.min(r.w - 30 - (x0 - r.x), 40 + (i * 53 % 90)), part = clamp(shown - i) * full;
      if (part > 0) P.fill(cols[(i + 2) % 5], R(x0, ly, part, 3.4));
      if (part > 0 && part < full) P.fill('#f2f2f2', R(x0 + part + 2, ly - 3, 2.4, 9));
    }
  }
}
