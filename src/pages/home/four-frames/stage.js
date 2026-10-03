/* Four frames: the stage. Lays the room out for the stage box, bakes the layers, maps scroll to
   a position between the four places, and composites: view (panning) → room → objects →
   light → live details. One desk, one style; only what a hand would change changes. */
import { TAU, PI, clamp, smooth, lerp, mix, css, rgb, luminance, sceneDate, clockLabel, skyState } from './core.js';
import { INK, LW_IN, Pen, bake, place, texturize, PAL } from './ink.js';
import { drawRoom, openingOf } from './room.js';
import { VIEWS, VIEW_LIVE, setViewLight } from './views.js';
import { eraObjects } from './objects.js';

import { WIDE_QUERY, LANE_PX } from './constants.js';

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

/* ───────── light for each place ─────────
   San Jose follows the real hour; the past keeps the light each place is remembered by.
   After dark the room is lit by the lamp, warm and dim; the night is outside the window. */
const NIGHT_ROOM = '#c7b6a5';
function eraLight(era, L, hour) {
  const o = openingOf(L), H = 1000 * o.h / o.w;
  if (era === 'now') {
    const date = sceneDate(hour), st = skyState(date);
    // the window faces east, toward Mt Hamilton: azimuth 55°…125° spans the opening
    const ax = az => (az - 55) / 70 * 1000, ey = el => H * .44 - el / 30 * H * .44;
    const sunUp = st.sun.el > -1 && st.sun.az > 50 && st.sun.az < 130;
    const moonUp = st.moon.el > 0 && st.moon.az > 45 && st.moon.az < 135 && st.night > .2;
    const patch = st.sun.el > 1 && st.sun.az > 40 && st.sun.az < 160 ? clamp(st.sun.el / 12) * (1 - smooth(48, 70, st.sun.el)) : 0;
    return {
      key: 'now', label: clockLabel(date),
      sky: { ...st, sunUp, sunX: ax(st.sun.az), sunY: ey(st.sun.el), moonUp, moonX: ax(st.moon.az), moonY: ey(st.moon.el) },
      tint: mix(mix(mix('#ffffff', '#fbeedd', st.golden), '#ece4e6', st.twilight * .8), NIGHT_ROOM, st.night),
      lamp: st.lamp, patch, patchShift: clamp((st.sun.az - 90) / 60, -1, 1), patchWarm: st.golden,
    };
  }
  if (era === 'sd') return { key: 'sd', label: 'a clear morning', sky: { day: 1, golden: 0, night: 0, twilight: 0, stars: 0 }, tint: rgb('#ffffff'), lamp: 0, patch: .9, patchShift: -.35, patchWarm: 0 };
  if (era === 'blr') return { key: 'blr', label: 'late afternoon, before the rain', sky: { day: .7, golden: .55, night: 0, twilight: 0, stars: 0 }, tint: rgb('#f8efe1'), lamp: 0, patch: .75, patchShift: .55, patchWarm: .8 };
  return { key: 'nitk', label: 'after dark, by the sea', sky: { day: 0, golden: 0, night: .78, twilight: .35, stars: .9, moonUp: true, moon: { phase: .3 }, moonX: 760, moonY: H * .16 }, tint: rgb(NIGHT_ROOM), lamp: 1, patch: 0, patchShift: 0, patchWarm: 0 };
}

/* ───────── baking ───────── */
function measure(L, draw) {
  const s = .25, W = (L.xMax - L.xMin + 400) * s, H = (L.yMax - L.yMin + 600) * s;
  const cv = document.createElement('canvas'); cv.width = Math.ceil(W); cv.height = Math.ceil(H);
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.setTransform(s, 0, 0, s, -(L.xMin - 200) * s, -(L.yMin - 400) * s);
  draw(new Pen(c, s));
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const pad = 14;
  return [x0 / s + L.xMin - 200 - pad, y0 / s + L.yMin - 400 - pad, (x1 - x0 + 1) / s + 2 * pad, (y1 - y0 + 1) / s + 2 * pad];
}
function bakePatch(L, light, px) {
  const o = openingOf(L), d = L.desk, w = L.win;
  const shift = light.patchShift * 120, depth = (d.frontY - d.backY) * 1.05;
  const x0 = Math.max(L.xMin, d.leftFront - 80);
  const sp = bake(px, x0, d.backY - 10, L.xMax - x0, d.frontY - d.backY + 60, P => {
    P.within(c => { c.moveTo(d.leftBack, d.backY); c.lineTo(L.xMax + 10, d.backY); c.lineTo(L.xMax + 10, d.frontY); c.lineTo(d.leftFront, d.frontY); c.closePath(); }, p => {
      const mX = o.x + o.w / 2, bar = w.bar;
      const quad = (xa, xb, ya, yb) => c => {
        const sx = v => shift * v;
        c.moveTo(xa + sx(ya), d.backY + depth * ya); c.lineTo(xb + sx(ya), d.backY + depth * ya);
        c.lineTo(xb + sx(yb) + 30 * yb, d.backY + depth * yb); c.lineTo(xa + sx(yb) - 30 * yb, d.backY + depth * yb); c.closePath();
      };
      const warm = light.patchWarm ? 'rgba(255,214,150,1)' : 'rgba(255,246,222,1)';
      for (const [ya, yb] of [[0, .59], [.65, 1]]) { p.fill(warm, quad(o.x, mX - bar * .7, ya, yb)); p.fill(warm, quad(mX + bar * .7, o.x + o.w, ya, yb)); }
    });
  }, { texture: 0, pool: 0 });
  const soft = document.createElement('canvas'); soft.width = sp.cv.width; soft.height = sp.cv.height;
  const sx = soft.getContext('2d');
  if ('filter' in sx) { sx.filter = `blur(${Math.max(1, 5 * px)}px)`; sx.drawImage(sp.cv, 0, 0); sp.cv = soft; }
  return sp;
}
/* Baking a place is a list of steps (the view, then each object), so the live page can yield to
   the browser between them; the static printer runs them straight through. */
function* eraSteps(st, era, out) {
  const { L, px } = st, o = openingOf(L);
  const light = eraLight(era, L, st.hour);
  const H = 1000 * o.h / o.w;
  setViewLight(light.sky);
  const view = bake(o.w * px / 1000, 0, 0, 1000, H, P => VIEWS[era](P, H, light.sky), { texture: .8 });
  yield;
  const probe = eraObjects(era, L, {}), real = eraObjects(era, L, st.photos), objs = [];
  for (let i = 0; i < real.length; i++) {
    const ob = real[i], b = measure(L, probe[i].draw) || [0, 0, 1, 1];
    const done = { ...ob, sp: bake(px, b[0], b[1], b[2], b[3], ob.draw) };
    if (ob.lid) { const bl = measure(L, probe[i].lid) || [0, 0, 1, 1]; done.lidSp = bake(px, bl[0], bl[1], bl[2], bl[3], ob.lid); }
    objs.push(done);
    yield;
  }
  out[era] = { light, view, objs, H, patch: light.patch > 0 ? bakePatch(L, light, px) : null };
}
function buildEra(st, era) { for (const step of eraSteps(st, era, st.eras)) void step; }
const nextTask = () => new Promise(res => setTimeout(res, 0));
/** Bake a place in slices of about `budget` ms; `alive()` says whether the result is still wanted. */
async function buildEraSliced(st, era, alive, budget = 36) {
  const out = {};
  let t = performance.now();
  for (const step of eraSteps(st, era, out)) {
    void step;
    if (performance.now() - t > budget) { await nextTask(); if (!alive()) return; t = performance.now(); }
  }
  if (alive()) { st.eras[era] = out[era]; if (st.cacheKey === era || st.cacheKey == null) st.cacheKey = null; }
}

/* ───────── moving things by hand ───────── */
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const FLOOR = new Set(['backpack', 'books', 'box', 'toolbox']);
function motionFor(ob, k, entering) {
  // k: 0 = in place, 1 = gone. Everything travels one way: things slide off to the right, and the
  // next place's things slide in from the right and settle. Prints are unpinned and carried off
  // the same way, turning a little; the socket on the wall simply changes.
  if (k <= 0) return {};
  if (k >= 1) return { alpha: 0 };
  const e = k * k, lift = Math.sin(k * PI);
  const kind = entering ? ob.enter : ob.exit;
  if (kind === 'fade') return { alpha: 1 - k };
  if (kind === 'board') return { dx: e * 520, dy: -lift * 70, rot: e * (entering ? -.2 : .22), sc: 1 + lift * .05 };
  return { dx: e * 920, dy: -lift * 10, rot: lift * (entering ? -.025 : .025) };
}
/* prints come off first, then the shelf, then the desk, then the floor; arrivals overlap the
   departures, so the desk is never bare for long */
function staggerOf(ob) { return ob.exit === 'board' ? 0 : (ob.exit === 'up' || ob.exit === 'drop') ? .04 : (ob.exit === 'roll' || ob.exit === 'fade') ? .1 : FLOOR.has(ob.id) ? .12 : .07; }
const HEAVY = new Set(['laptop-base', 'monitor', 'scope']);
function goneK(ob, tau, entering) {
  const d = staggerOf(ob);
  if (FLOOR.has(ob.id)) return entering ? 1 - clamp((tau - .5) / .3) : clamp((tau - d) / .28);
  if (ob.exit === 'board') return entering ? 1 - clamp((tau - .3) / .32) : clamp(tau / .3);
  if (HEAVY.has(ob.id)) return entering ? 1 - clamp((tau - .3 - d) / .34) : clamp((tau - d - .08) / .3);
  return entering ? 1 - clamp((tau - .22 - d) / .34) : clamp((tau - d) / .32);
}
function drawObjects(st, c, eraKey, tau, entering, live) {
  const E = st.eras[eraKey]; if (!E) return;
  const byId = {}; E.objs.forEach(ob => { byId[ob.id] = ob; });
  for (const ob of E.objs) {
    if (ob.exit === 'lid') {
      // the screen folds shut over the base before it leaves, and opens after it arrives
      const base = byId[ob.follow], d = staggerOf(base), k = goneK(base, tau, entering);
      const fold = entering ? 1 - clamp((tau - .3 - d - .34) / .1) : clamp((tau - d) / .1);
      const m = motionFor(base, k, entering);
      if (m.alpha === 0) continue;
      const f = easeIO(fold);
      if (f < .92) place(c, ob.sp, st.px, { ...m, pivot: ob.hinge, sy: Math.max(.05, 1 - f / .92) });
      if (f > .55 && ob.lidSp) place(c, ob.lidSp, st.px, { ...m, pivot: ob.hinge, sy: clamp((f - .55) / .45) });
      if (k === 0 && fold === 0 && ob.live) live.push(ob);
      continue;
    }
    if (ob.follow) continue;
    const k = goneK(ob, tau, entering), m = motionFor(ob, k, entering);
    if (m.alpha === 0) continue;
    place(c, ob.sp, st.px, m);
    if (k === 0 && ob.live) live.push(ob);
  }
}
function drawLive(c, ob, px, t) {
  c.save(); c.scale(px, px);
  if (ob.live === 'blink') {
    const cyc = (t + 1.3) % 4.6;
    if (cyc <= .16) {
      const k = Math.sin(cyc / .16 * PI);
      for (const [ex, ey, er] of ob.eyes) {
        c.beginPath(); c.rect(ex - er - 2, ey - er - 2, 2 * er + 4, (2 * er + 4) * k); c.fillStyle = PAL.cobalt; c.fill();
        c.lineWidth = LW_IN; c.strokeStyle = INK; c.beginPath(); c.moveTo(ex - er, ey - er + 2 * er * k); c.lineTo(ex + er, ey - er + 2 * er * k); c.stroke();
      }
    }
  } else if (ob.live === 'trace') {
    // the phosphor dot running along the square wave, leaving a brighter trail
    const r = ob.screen, ph = (t * .9) % 1, hi = r.y + r.h * .3, lo = r.y + r.h * .7;
    const lvl = u => ((u * 4 + .05) % 1) < .5 ? hi : lo;
    c.lineCap = 'round'; c.lineWidth = 2.4;
    for (let i = 0; i < 14; i++) { const u0 = ph - i * .012, u1 = u0 - .012; if (u1 < 0) break; c.strokeStyle = `rgba(200,255,220,${.9 - i * .06})`; c.beginPath(); c.moveTo(r.x + r.w * u0, lvl(u0)); c.lineTo(r.x + r.w * u1, lvl(u0)); c.stroke(); }
    c.fillStyle = '#f2fff6'; c.beginPath(); c.arc(r.x + r.w * ph, lvl(ph), 2.4, 0, TAU); c.fill();
  } else if (ob.live === 'tokens') {
    // new lines being written under the static ones; the screen gives off its own light
    const r = ob.screen, cyc = (t % 9) / 9, lines = 6, shown = cyc * lines * 1.3;
    const cols = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3', '#e59a8a'], sc = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3'];
    c.fillStyle = '#273240'; c.fillRect(r.x + .6, r.y + .6, r.w - 1.2, r.h - 1.2);
    for (let i = 0; i < 6; i++) { c.fillStyle = sc[i % 4]; c.fillRect(r.x + 14 + (i % 3 === 2 ? 16 : 0), r.y + 16 + i * 13, 50 + (i * 37 % 70), 4); }
    c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(r.x + r.w * .55, r.y); c.lineTo(r.x + r.w * .78, r.y); c.lineTo(r.x + r.w * .4, r.y + r.h); c.lineTo(r.x + r.w * .17, r.y + r.h); c.closePath(); c.fill();
    for (let i = 0; i < lines; i++) {
      const ly = r.y + 16 + (i + 6) * 13 * .78; if (ly > r.y + r.h - 8) break;
      const x0 = r.x + 14 + (i % 4 === 1 ? 14 : 0), full = Math.min(r.w - 30 - (x0 - r.x), 40 + (i * 53 % 90)), part = clamp(shown - i) * full;
      if (part > 0) { c.fillStyle = cols[(i + 2) % 5]; c.fillRect(x0, ly, part, 3.2); }
      if (part > 0 && part < full) { c.fillStyle = '#f2f2f2'; c.fillRect(x0 + part + 2, ly - 3, 2, 9); }
    }
  }
  c.restore();
}

/* ───────── compositing ─────────
   Back to front: the view (panning like a train window) and what moves outside, then everything
   in the room (room, objects, light), then the live details on the desk. While the scroll rests
   on one place, the room layer is painted once and kept, so the idle frames are cheap. */
function render(st, t) {
  const c = st.ctx, L = st.L, px = st.px; if (!c || !L) return;
  const pos = clamp(st.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
  const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)];
  const EA = st.eras[A], EB = st.eras[B];
  const inT = tau > 0 && tau < 1 && pos < 3 && !!EB;
  const o = openingOf(L);
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (inT || !st.cache || st.cacheKey !== A) { c.fillStyle = PAL.wall; c.fillRect(0, 0, st.canvas.width, st.canvas.height); }
  c.setTransform(1, 0, 0, 1, -L.xMin * px, -L.yMin * px);

  /* the view, panning like a train window */
  c.save(); c.beginPath(); c.rect(o.x * px, o.y * px, o.w * px, o.h * px); c.clip();
  const e = inT ? easeIO(clamp((tau - .15) / .7)) : 0;
  if (EA) c.drawImage(EA.view.cv, (o.x - e * o.w) * px, o.y * px, o.w * px, o.h * px);
  if (inT) c.drawImage(EB.view.cv, (o.x + (1 - e) * o.w) * px, o.y * px, o.w * px, o.h * px);
  const vs = o.w * px / 1000;
  const liveView = (key, off) => { const f = VIEW_LIVE[key], E = st.eras[key]; if (!f || !E) return; c.save(); c.translate((o.x + off) * px, o.y * px); c.scale(vs, vs); f(c, E.H, t, E.light.sky); c.restore(); };
  if (EA) liveView(A, -e * o.w);
  if (inT) liveView(B, (1 - e) * o.w);
  c.restore();

  if (inT) {
    const live = [];
    paintRoom(st, c, A, B, tau, true, live);
    for (const ob of live) drawLive(c, ob, px, t);
    return;
  }
  if (!st.cache || st.cacheKey !== A) {
    st.cache = st.cache || document.createElement('canvas');
    if (st.cache.width !== st.canvas.width || st.cache.height !== st.canvas.height) { st.cache.width = st.canvas.width; st.cache.height = st.canvas.height; }
    const cc = st.cache.getContext('2d');
    cc.setTransform(1, 0, 0, 1, 0, 0); cc.clearRect(0, 0, st.cache.width, st.cache.height);
    cc.setTransform(1, 0, 0, 1, -L.xMin * px, -L.yMin * px);
    st.cacheLive = [];
    paintRoom(st, cc, A, B, 0, false, st.cacheLive);
    st.cacheKey = EA ? A : null;
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(st.cache, 0, 0);
  c.setTransform(1, 0, 0, 1, -L.xMin * px, -L.yMin * px);
  for (const ob of st.cacheLive) drawLive(c, ob, px, t);
}

function paintRoom(st, c, A, B, tau, inT, live) {
  const L = st.L, px = st.px, o = openingOf(L), EA = st.eras[A], EB = st.eras[B];
  place(c, st.room, px);
  if (inT) { drawObjects(st, c, A, tau, false, live); drawObjects(st, c, B, tau, true, live); }
  else if (EA) drawObjects(st, c, A, 0, false, live);

  /* light: blend the two places' light as the scroll moves between them */
  if (EA) {
    const la = EA.light, lb = inT ? EB.light : null, lt = inT ? easeIO(tau) : 0;
    const tint = lb ? mix(la.tint, lb.tint, lt) : la.tint;
    if (tint[0] + tint[1] + tint[2] < 762) {
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = css(tint);
      c.beginPath(); c.rect(L.xMin * px, L.yMin * px, (L.xMax - L.xMin) * px, (L.yMax - L.yMin) * px); c.rect((o.x + o.w) * px, o.y * px, -o.w * px, o.h * px); c.fill('evenodd');
      c.restore();
    }
    const pa = EA.patch ? la.patch * (1 - lt) : 0, pb = lb && EB.patch ? lb.patch * lt : 0;
    for (const [sp, a] of [[EA.patch, pa], [lb ? EB.patch : null, pb]]) {
      if (!sp || a <= 0) continue;
      c.save(); c.globalCompositeOperation = 'soft-light'; place(c, sp, px, { alpha: a * .7 }); c.globalCompositeOperation = 'screen'; place(c, sp, px, { alpha: a * .18 }); c.restore();
    }
    const lamp = lb ? lerp(la.lamp, lb.lamp, lt) : la.lamp;
    if (lamp > .02) {
      const [ax, ay] = L.lamp.aim, [hx, hy] = L.lamp.head;
      c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = lamp;
      c.save(); c.translate(ax * px, ay * px); c.scale(1, .42);
      let g = c.createRadialGradient(0, 0, 8 * px, 0, 0, 300 * px);
      g.addColorStop(0, 'rgba(255,214,150,.8)'); g.addColorStop(.35, 'rgba(255,196,128,.44)'); g.addColorStop(1, 'rgba(255,190,120,0)');
      c.fillStyle = g; c.fillRect(-310 * px, -310 * px, 620 * px, 620 * px); c.restore();
      g = c.createRadialGradient(hx * px, hy * px, 6 * px, hx * px, hy * px, 520 * px);
      g.addColorStop(0, 'rgba(255,214,160,.5)'); g.addColorStop(.4, 'rgba(255,190,130,.16)'); g.addColorStop(1, 'rgba(255,190,130,0)');
      c.fillStyle = g; c.fillRect((hx - 530) * px, (hy - 530) * px, 1060 * px, 1060 * px);
      c.restore();
    }
    const night = lb ? lerp(la.sky.night || 0, lb.sky.night || 0, lt) : (la.sky.night || 0);
    if (night > .2 && !inT) {
      const scr = EA.objs.find(ob => ob.screen && ob.glow);
      if (scr) {
        const r = scr.screen, gx = r.x + r.w / 2, gy = r.y + r.h;
        c.save(); c.beginPath(); c.rect(L.xMin * px, L.yMin * px, (L.xMax - L.xMin) * px, (L.desk.frontY - L.yMin) * px); c.clip();
        c.globalCompositeOperation = 'screen'; c.globalAlpha = (night - .2) * .9;
        c.translate(gx * px, (gy + 40) * px); c.scale(1, .5);
        const g = c.createRadialGradient(0, 0, 10 * px, 0, 0, 260 * px);
        g.addColorStop(0, scr.glow); g.addColorStop(1, scr.glow.replace(/[\d.]+\)$/, '0)'));
        c.fillStyle = g; c.fillRect(-270 * px, -270 * px, 540 * px, 540 * px); c.restore();
      }
    }
    /* the words always stay readable: if the light has taken the wall behind them below the
       contrast they need, a little daylight-coloured wall is laid back behind the lane */
    if (L.mode === 'wide' && st.lane) {
      const wall = rgb(PAL.wall), lit = [wall[0] * tint[0] / 255, wall[1] * tint[1] / 255, wall[2] * tint[2] / 255];
      const lum = luminance(lit), need = .3;
      st.laneLum = lum;
      if (lum < need) {
        const a = clamp((need - lum) / (luminance(wall) - lum) * 1.15);
        const x1 = L.xMin + st.lane.right / L.u;
        c.save(); c.globalAlpha = a;
        const g = c.createLinearGradient((x1 - 60) * px, 0, (x1 + 40) * px, 0);
        g.addColorStop(0, PAL.wall); g.addColorStop(1, 'rgba(223,227,208,0)');
        c.fillStyle = PAL.wall; c.fillRect(L.xMin * px, L.yMin * px, (x1 - 60 - L.xMin) * px, (L.yMax - L.yMin) * px);
        c.fillStyle = g; c.fillRect((x1 - 60) * px, L.yMin * px, 100 * px, (L.yMax - L.yMin) * px);
        c.restore();
      }
    }
  }
}

/* ───────── scroll → position ───────── */
function scrollPos(st) {
  // the change happens while the next place's heading travels up the reading area
  const tall = st.L && st.L.mode === 'tall', vh = window.innerHeight;
  const ref = window.scrollY + vh * (tall ? .78 : .52), span = vh * (tall ? .22 : .3);
  const tops = st.sections.map(s => s.getBoundingClientRect().top + window.scrollY);
  let pos = 0;
  for (let k = 1; k < tops.length; k++) {
    const a = tops[k] - span, b = tops[k];
    if (ref >= b) pos = k; else if (ref > a) { pos = k - 1 + (ref - a) / span; break; } else break;
  }
  return clamp(pos, 0, 3);
}

function loadPhotos(urls) {
  const out = {};
  return Promise.all(Object.entries(urls).map(([k, src]) => new Promise(res => {
    const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => res(); im.src = src; out[k] = im;
  }))).then(() => out);
}

/** Lay out a fresh stage for a canvas of w × h CSS px and draw the room (texture added after). */
function prepare(st, mode, w, h, dpr, bounds) {
  st.L = layoutFor(mode, w, h, bounds);
  st.px = st.L.u * dpr;
  st.canvas.width = Math.round(w * dpr); st.canvas.height = Math.round(h * dpr);
  st.ctx = st.canvas.getContext('2d');
  st.eras = {}; st.cacheKey = null;
  const room = bake(st.px, st.L.xMin, st.L.yMin, st.L.xMax - st.L.xMin, st.L.yMax - st.L.yMin, P => drawRoom(P, st.L), { texture: 0 });
  return () => { texturize(room.cv, .7); st.room = room; };
}

/**
 * Bring the desk to life on `canvas`.
 *   stageEl   the sticky box the canvas fills
 *   sections  the four place sections, in order (their tops drive the scroll position)
 *   laneEl    the column of words (wide layout keeps the wall behind it readable)
 *   photos    { key: url } for the real photographs pinned on the board
 *   hooks     { t, hour, era, pos } review hooks from the URL
 *   onChange  called with { place, label, pos } when the caption should change
 * Returns a promise of { destroy() }.
 */
export async function createStage({ canvas, stageEl, sections, laneEl, photos, hooks = {}, onChange, onTone, onReady }) {
  const st = { canvas, sections, eras: {}, pos: 0, hour: hooks.hour, photos: {}, lane: null, laneLum: 1 };
  let disposed = false, raf = 0, visible = true, lastT = -1, lastPos = -1, building = 0, resizeTimer = 0, lastCaption = '', lastTone = 'day';
  const t0 = performance.now();
  const wideMq = window.matchMedia(WIDE_QUERY);
  st.photos = await loadPhotos(photos);
  if (disposed) return { destroy() {} };

  const measureLane = () => {
    if (!laneEl) return null;
    const r = laneEl.getBoundingClientRect(), s = stageEl.getBoundingClientRect();
    return { right: r.right - s.left };
  };
  const caption = () => {
    const k = ERAS[Math.min(3, Math.round(st.pos))], E = st.eras[k]; if (!E) return;
    const txt = k === 'now' ? `${PLACE_NAMES[k]} · ${E.light.label}` : PLACE_NAMES[k];
    if (txt !== lastCaption) { lastCaption = txt; onChange?.({ place: PLACE_NAMES[k], label: E.light.label, text: txt, pos: st.pos }); }
  };
  const frame = now => {
    raf = 0;
    if (disposed || document.hidden || !st.ready) return;
    const t = hooks.t != null ? hooks.t : (now - t0) / 1000;
    st.pos = hooks.pos != null ? hooks.pos : scrollPos(st);
    // repaint when the scroll moves; otherwise the live details tick over at about 30 fps
    if (st.pos !== lastPos || t - lastT > .033 || hooks.t != null) {
      render(st, t); lastT = t; lastPos = st.pos; caption();
      // when lamplight dims the wall behind the words, the page darkens their links and dates
      const tone = st.L.mode === 'wide' && st.laneLum < .56 ? 'dim' : 'day';
      if (tone !== lastTone) { lastTone = tone; onTone?.(tone); }
    }
    if (hooks.t == null && visible) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && st.ready && !disposed && !document.hidden && visible) raf = requestAnimationFrame(frame); };

  const build = async () => {
    const id = ++building;
    const r = stageEl.getBoundingClientRect(), mode = wideMq.matches ? 'wide' : 'tall';
    const w = Math.round(r.width), h = Math.round(r.height), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return;
    const alive = () => !disposed && id === building;
    st.ready = false;
    const finishRoom = prepare(st, mode, w, h, dpr);
    st.lane = mode === 'wide' ? measureLane() : null;
    await nextTask(); if (!alive()) return;
    finishRoom();
    await nextTask(); if (!alive()) return;
    const first = hooks.era && ERAS.includes(hooks.era) ? hooks.era : hooks.pos != null ? ERAS[Math.min(3, Math.floor(hooks.pos))] : ERAS[Math.min(3, Math.round(scrollPos(st)))];
    await buildEraSliced(st, first, alive); if (!alive()) return;
    if (hooks.pos != null && hooks.pos % 1 > 0) { await buildEraSliced(st, ERAS[Math.min(3, Math.floor(hooks.pos) + 1)], alive); if (!alive()) return; }
    st.ready = true; lastPos = -1; frame(performance.now());
    onReady?.();
    // the other places, when the browser is idle and one slice at a time
    const idle = () => new Promise(res => window.requestIdleCallback ? window.requestIdleCallback(() => res(), { timeout: 600 }) : setTimeout(res, 60));
    for (const e of ERAS) {
      if (st.eras[e]) continue;
      if (hooks.t == null) await idle();
      if (!alive()) return;
      await buildEraSliced(st, e, alive);
    }
    if (hooks.t != null) { lastPos = -1; frame(performance.now()); }
    kick();
  };

  const onScroll = () => kick();
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!disposed) build(); }, 220); };
  const onVisibility = () => { if (!document.hidden) kick(); };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(stageEl);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  wideMq.addEventListener?.('change', onResize);
  await build();

  return {
    destroy() {
      disposed = true; cancelAnimationFrame(raf); clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      wideMq.removeEventListener?.('change', onResize);
      st.eras = {}; st.room = null;
    },
  };
}

/** Paint one still of a place, for the static images (scripts/publishing/render-home.mjs). */
export async function paintStill({ canvas, mode, width, height, dpr = 1, era = 'now', hour, t = 0, pos, bounds, photos }) {
  const st = { canvas, sections: [], eras: {}, pos: pos ?? ERAS.indexOf(era), hour, photos: await loadPhotos(photos), lane: null };
  prepare(st, mode, width, height, dpr, bounds)();
  buildEra(st, ERAS[Math.min(3, Math.floor(st.pos))]);
  if (st.pos % 1 > 0) buildEra(st, ERAS[Math.min(3, Math.floor(st.pos) + 1)]);
  render(st, t);
  return { label: st.eras[ERAS[Math.min(3, Math.round(st.pos))]].light.label, L: st.L };
}
