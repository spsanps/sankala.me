/* Four frames in tile: the stage. The same desk, window and pinboard as the clear-line homepage,
   painted in cobalt on tin glaze and fired onto a wall of tiles. Scrolling to the next place
   turns over only the tiles whose picture changes, in a wave; the rest of the wall stays put.
   The glaze catches the room's light, and the reflections slide as the page moves. */
import { clamp, smooth, lerp, mix, css, rgb, sceneDate, clockLabel, skyState, makeCanvas, mulberry32 } from './core.js';
import { Pen } from './ink.js';
import { drawRoom, openingOf } from './room.js';
import { VIEWS, VIEW_LIVE, setViewLight } from './views.js';
import { eraObjects } from './objects.js';
import { GlazeCtx, CUTS, VIEW_CUTS, finishPainting, makeTiles, prepareWall, fire, drawSheen, drawFlip } from './glaze.js';
import { drawFrieze } from './frieze.js';
import { WIDE_QUERY, LANE_PX } from './constants.js';

export const ERAS = ['now', 'sd', 'blr', 'nitk'];
export const PLACE_NAMES = { now: 'San Jose', sd: 'San Diego', blr: 'Bengaluru', nitk: 'Surathkal' };

/* ───────── layouts (art units; the art square is 1000 × 1000), as on the homepage ───────── */
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
export function layoutFor(mode, w, h) {
  if (mode === 'wide') {
    const art = Math.min(h, w - LANE_PX), u = Math.max(art, 200) / 1000;
    return { ...wideBase(), u, xMin: 1000 - w / u, xMax: 1000, yMin: 1000 - h / u, yMax: 1000 };
  }
  const u = Math.min(w / 700, h / 790);
  return { ...tallBase(), u, xMin: 350 - w / u / 2, xMax: 350 + w / u / 2, yMin: 742 - h / u, yMax: 742 };
}

/* ───────── light: San Jose follows the real hour; the past keeps the light it is remembered by ───────── */
function eraLight(era, L, hour) {
  const o = openingOf(L), H = 1000 * o.h / o.w;
  if (era === 'now') {
    const date = sceneDate(hour), st = skyState(date);
    const ax = az => (az - 55) / 70 * 1000, ey = el => H * .44 - el / 30 * H * .44;
    const sunUp = st.sun.el > -1 && st.sun.az > 50 && st.sun.az < 130;
    const moonUp = st.moon.el > 0 && st.moon.az > 45 && st.moon.az < 135 && st.night > .2;
    return {
      key: 'now', label: clockLabel(date),
      sky: { ...st, sunUp, sunX: ax(st.sun.az), sunY: ey(st.sun.el), moonUp, moonX: ax(st.moon.az), moonY: ey(st.moon.el) },
      night: st.night, lamp: st.lamp, warm: st.golden,
    };
  }
  if (era === 'sd') return { key: 'sd', label: 'a clear morning', sky: { day: 1, golden: 0, night: 0, twilight: 0, stars: 0 }, night: 0, lamp: 0, warm: 0 };
  if (era === 'blr') return { key: 'blr', label: 'late afternoon, before the rain', sky: { day: .7, golden: .55, night: 0, twilight: 0, stars: 0 }, night: 0, lamp: 0, warm: .5 };
  return { key: 'nitk', label: 'after dark, by the sea', sky: { day: 0, golden: 0, night: .78, twilight: .35, stars: .9, moonUp: true, moon: { phase: .3 }, moonX: 760, moonY: H * .16 }, night: .8, lamp: 1, warm: 0 };
}

/* ───────── painting a place in glaze ───────── */
const tick = () => new Promise(res => setTimeout(res, 0));
const PLAIN_BLUE = new Set(['monitor', 'layout', 'laptop-screen', 'zine', 'chip', 'note', 'papers', 'starmap', 'schematic', 'planisphere', 'breadboard']);
async function paintEra(st, era, alive) {
  const t0 = performance.now();
  const { L, px, W, H, dpr } = st, o = openingOf(L), light = eraLight(era, L, st.hour), VH = 1000 * o.h / o.w;
  const wash = makeCanvas(W, H), line = makeCanvas(W, H);
  const g = new GlazeCtx(wash.getContext('2d'), line.getContext('2d'), { accents: false, cuts: VIEW_CUTS });
  g.skyStrokes = true;
  g.setTransform(px, 0, 0, px, -L.xMin * px, -L.yMin * px);
  // what the window looks out on: cobalt only, like the blue landscapes of old tile panels
  g.save(); g.beginPath(); g.rect(o.x, o.y, o.w, o.h); g.clip();
  g.translate(o.x, o.y); g.scale(o.w / 1000, o.w / 1000);
  setViewLight(light.sky);
  const vp = new Pen(g, px * o.w / 1000); vp.pool = 0;
  VIEWS[era](vp, VH, light.sky);
  if (VIEW_LIVE[era]) VIEW_LIVE[era](g, VH, era === 'nitk' ? 1.05 : 2.2, light.sky);
  g.restore();
  if (!alive()) return null;
  await tick();
  // the room and everything in it; a touch of ochre and green where things are warm or alive
  g.accents = true; g.cuts = CUTS; g.skyStrokes = false;
  const pen = new Pen(g, px); pen.pool = 0;
  drawRoom(pen, L);
  // the border that frames the panel: the room's tiled skirting, behind the chair and the floor things
  drawFrieze(g, pen, L, era);
  if (!alive()) return null;
  await tick();
  const objs = eraObjects(era, L, {});
  const prints = [];
  let n = 0;
  for (const ob of objs) {
    if (++n % 4 === 0) { await tick(); if (!alive()) return null; }
    if (ob.photo) { prints.push(ob.id); continue; }
    // colour beyond cobalt is kept for a few warm or living things; screens and charts stay blue
    g.accents = !PLAIN_BLUE.has(ob.id);
    ob.draw(pen);
  }
  g.accents = true;
  if (!alive()) return null;
  await tick();
  const painted = await finishPainting(wash, line, dpr, alive);
  if (!painted || !alive()) return null;
  await tick();
  await tick(); if (!alive()) return null;
  const fired = fire(st.wall, painted);
  // the real photographs, hung over the tiles in true colour
  const photoLayer = makeCanvas(W, H), pc = photoLayer.getContext('2d');
  pc.setTransform(px, 0, 0, px, -L.xMin * px, -L.yMin * px);
  const realPen = new Pen(pc, px);
  for (const ob of eraObjects(era, L, st.photos)) if (ob.photo) ob.draw(realPen);
  // a small fingerprint of the painting, to find which tiles change between places
  const fp = fingerprint(st, painted);
  // review: how long each place took to paint (window.__tileTimings)
  (window.__tileTimings = window.__tileTimings || {})[era] = Math.round(performance.now() - t0);
  return { light, fired, photoLayer, fp };
}
function fingerprint(st, painted) {
  const g = st.grid, s = 4, cw = g.cols * s, ch = g.rows * s;
  const c = makeCanvas(cw, ch), x = c.getContext('2d', { willReadFrequently: true });
  const ox = g.tiles[0].x, oy = g.tiles[0].y;
  x.drawImage(painted, ox, oy, g.cols * g.T, g.rows * g.T, 0, 0, cw, ch);
  return { data: x.getImageData(0, 0, cw, ch).data, cw, s };
}
function changedTiles(st, A, B) {
  const key = A + '>' + B; if (st.changed[key]) return st.changed[key];
  const EA = st.eras[A], EB = st.eras[B], g = st.grid, out = new Map();
  if (!EA || !EB) return null;
  const { s, cw } = EA.fp, a = EA.fp.data, b = EB.fp.data;
  const list = [];
  for (const t of g.tiles) {
    let d = 0;
    for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) {
      const i = ((t.r * s + yy) * cw + t.c * s + xx) * 4;
      d += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    }
    if (d / (s * s) > 9) list.push(t);
  }
  // a wave from the right edge toward the words, falling a little as it goes, never quite even
  const rnd = mulberry32(17);
  const ws = list.map(t => (1 - t.cx / g.W) * .78 + (t.cy / g.H) * .22);
  const lo = Math.min(...ws), hi = Math.max(...ws);
  list.forEach((t, k) => out.set(t, .05 + .7 * ((ws[k] - lo) / Math.max(1e-6, hi - lo)) + (rnd() - .5) * .05));
  st.changed[key] = out;
  return out;
}

/* ───────── compositing ───────── */
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const FLIP = .17;
function render(st) {
  const c = st.ctx; if (!c) return;
  const pos = clamp(st.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
  const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)];
  const EA = st.eras[A], EB = st.eras[B];
  const inT = tau > 0 && tau < 1 && pos < 3 && !!EB;
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (!EA) { c.fillStyle = '#f4f0e5'; c.fillRect(0, 0, st.W, st.H); return; }
  c.drawImage(EA.fired, 0, 0);
  let turning = null;
  if (inT) {
    const map = changedTiles(st, A, B);
    turning = new Set();
    if (map) for (const [t, d] of map) {
      const p = clamp((tau - d) / FLIP);
      if (p <= 0) continue;
      turning.add(t);
      drawFlip(c, st.grid, t, EA.fired, EB.fired, easeIO(p));
    }
  }
  // light: a little dimmer and warmer after dark, the lamp pooling on the desk and glowing in the glaze
  const lt = inT ? easeIO(tau) : 0, la = EA.light, lb = inT ? EB.light : null;
  const night = lb ? lerp(la.night, lb.night, lt) : la.night, lamp = lb ? lerp(la.lamp, lb.lamp, lt) : la.lamp;
  // the photographs: taken down before their tiles turn, put back up after; they share the
  // room's light, so they dim at night and warm under the lamp
  if (!inT) c.drawImage(EA.photoLayer, 0, 0);
  else {
    const aOut = 1 - clamp(tau / .2), aIn = clamp((tau - .8) / .2);
    if (aOut > 0) { c.save(); c.globalAlpha = aOut; c.drawImage(EA.photoLayer, 0, -(1 - aOut) * 18 * st.dpr); c.restore(); }
    if (aIn > 0) { c.save(); c.globalAlpha = aIn; c.drawImage(EB.photoLayer, 0, -(1 - aIn) * 18 * st.dpr); c.restore(); }
  }
  // the window's reflection in each glossy tile; after dark the window is black, so it fades
  drawSheen(c, st.grid, st.sheen[0], st.sheen[1], .34 * (1 - .85 * night), turning ? t => turning.has(t) : null);
  if (night > .02) {
    // night is cool and dim, a little less so behind the words; only the lamp is warm
    c.save(); c.globalCompositeOperation = 'multiply';
    const dim = css(mix('#ffffff', '#b6bacd', night)), lane = css(mix('#ffffff', '#e4e2dc', night));
    if (st.L.mode === 'wide') {
      const lr = Math.min(st.W * .42, 600 * st.dpr), gr = c.createLinearGradient(lr * .9, 0, lr * 1.35, 0);
      gr.addColorStop(0, lane); gr.addColorStop(1, dim); c.fillStyle = gr;
    } else c.fillStyle = dim;
    c.fillRect(0, 0, st.W, st.H); c.restore();
  }
  if (lamp > .02) {
    const L = st.L, px = st.px, [ax, ay] = L.lamp.aim, [hx, hy] = L.lamp.head;
    const X = v => (v - L.xMin) * px, Y = v => (v - L.yMin) * px;
    // lamplight warms the white glaze (multiply) and lifts the painted cobalt (screen)
    c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = lamp * .75;
    c.save(); c.translate(X(ax), Y(ay)); c.scale(1, .5);
    let wg = c.createRadialGradient(0, 0, 4 * px, 0, 0, 340 * px);
    wg.addColorStop(0, '#ffd59a'); wg.addColorStop(.45, '#ffe6c4'); wg.addColorStop(1, '#ffffff');
    c.fillStyle = wg; c.fillRect(-350 * px, -350 * px, 700 * px, 700 * px); c.restore();
    wg = c.createRadialGradient(X(hx), Y(hy), 4 * px, X(hx), Y(hy), 380 * px);
    wg.addColorStop(0, '#ffdcae'); wg.addColorStop(1, '#ffffff');
    c.fillStyle = wg; c.fillRect(X(hx - 390), Y(hy - 390), 780 * px, 780 * px);
    c.restore();
    c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = lamp * .7;
    c.save(); c.translate(X(ax), Y(ay)); c.scale(1, .45);
    let gr = c.createRadialGradient(0, 0, 6 * px, 0, 0, 300 * px);
    gr.addColorStop(0, 'rgba(255,200,130,.62)'); gr.addColorStop(.4, 'rgba(255,186,116,.26)'); gr.addColorStop(1, 'rgba(255,186,116,0)');
    c.fillStyle = gr; c.fillRect(-310 * px, -310 * px, 620 * px, 620 * px); c.restore();
    gr = c.createRadialGradient(X(hx), Y(hy), 4 * px, X(hx), Y(hy), 470 * px);
    gr.addColorStop(0, 'rgba(255,212,150,.42)'); gr.addColorStop(.35, 'rgba(255,190,130,.12)'); gr.addColorStop(1, 'rgba(255,190,130,0)');
    c.fillStyle = gr; c.fillRect(X(hx - 480), Y(hy - 480), 960 * px, 960 * px);
    c.restore();
  }

}

/* ───────── scroll → position ───────── */
function scrollPos(st) {
  const tall = st.L && st.L.mode === 'tall', vh = window.innerHeight;
  const ref = window.scrollY + vh * (tall ? .78 : .52), span = vh * (tall ? .3 : .42);
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
function prepare(st, mode, w, h, dpr) {
  st.L = layoutFor(mode, w, h);
  st.dpr = dpr; st.px = st.L.u * dpr;
  st.W = Math.round(w * dpr); st.H = Math.round(h * dpr);
  st.canvas.width = st.W; st.canvas.height = st.H;
  st.ctx = st.canvas.getContext('2d');
  // no chipped corners behind the words
  const laneRight = mode === 'wide' ? Math.min(w, 600) * dpr : 0;
  st.grid = makeTiles(st.W, st.H, 96 * st.px, 5, t => t.cx < laneRight);
  st.wall = prepareWall(st.grid, dpr);
  st.eras = {}; st.changed = {};
}

/**
 * Bring the tiled desk to life on `canvas`. Same contract as the homepage stage:
 * { canvas, stageEl, sections, photos, hooks, onChange, onReady } → { destroy() }.
 */
export async function createStage({ canvas, stageEl, sections, photos, hooks = {}, onChange, onReady }) {
  const st = { canvas, sections, eras: {}, changed: {}, pos: 0, hour: hooks.hour, photos: {}, sheen: [0, 0] };
  let disposed = false, raf = 0, visible = true, building = 0, resizeTimer = 0, lastCaption = '', lastKey = '';
  const pointer = [0, 0];
  const wideMq = window.matchMedia(WIDE_QUERY);
  st.photos = await loadPhotos(photos);

  const caption = () => {
    const k = ERAS[Math.min(3, Math.round(st.pos))], E = st.eras[k]; if (!E) return;
    const txt = k === 'now' ? `${PLACE_NAMES[k]} · ${E.light.label}` : PLACE_NAMES[k];
    if (txt !== lastCaption) { lastCaption = txt; onChange?.({ place: PLACE_NAMES[k], label: E.light.label, text: txt, pos: st.pos }); }
  };
  const frame = () => {
    raf = 0;
    if (disposed || document.hidden || !st.ready) return;
    st.pos = hooks.pos != null ? hooks.pos : scrollPos(st);
    // the reflections drift as the page scrolls, and lean toward the pointer
    const s = window.scrollY / Math.max(1, window.innerHeight);
    st.sheen = [Math.sin(s * 1.1) * .32 + pointer[0] * .35, Math.cos(s * .8) * .14 + pointer[1] * .2];
    if (hooks.t != null) st.sheen = [Math.sin(hooks.t * .7) * .3, .05];
    const key = st.pos.toFixed(4) + '|' + st.sheen[0].toFixed(3) + '|' + st.sheen[1].toFixed(3) + '|' + Object.keys(st.eras).length;
    if (key !== lastKey) { render(st); lastKey = key; caption(); }
  };
  const kick = () => { if (!raf && st.ready && !disposed && !document.hidden && visible) raf = requestAnimationFrame(frame); };

  const build = async () => {
    const id = ++building;
    const r = stageEl.getBoundingClientRect(), mode = wideMq.matches ? 'wide' : 'tall';
    const w = Math.round(r.width), h = Math.round(r.height), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return;
    const alive = () => !disposed && id === building;
    st.ready = false;
    prepare(st, mode, w, h, dpr);
    await tick(); if (!alive()) return;
    const first = hooks.era && ERAS.includes(hooks.era) ? hooks.era : hooks.pos != null ? ERAS[Math.min(3, Math.floor(hooks.pos))] : ERAS[Math.min(3, Math.round(scrollPos(st)))];
    const order = [first, ...ERAS.filter(e => e !== first)];
    if (hooks.pos != null && hooks.pos % 1 > 0) { const nx = ERAS[Math.min(3, Math.floor(hooks.pos) + 1)]; order.splice(order.indexOf(nx), 1); order.splice(1, 0, nx); }
    const E0 = await paintEra(st, order[0], alive); if (!alive() || !E0) return;
    st.eras[order[0]] = E0;
    if (hooks.pos != null && hooks.pos % 1 > 0) { const E1 = await paintEra(st, order[1], alive); if (!alive() || !E1) return; st.eras[order[1]] = E1; }
    st.ready = true; lastKey = ''; frame();
    onReady?.();
    const idle = () => new Promise(res => window.requestIdleCallback ? window.requestIdleCallback(() => res(), { timeout: 700 }) : setTimeout(res, 60));
    for (const e of order) {
      if (st.eras[e]) continue;
      if (hooks.t == null) await idle();
      if (!alive()) return;
      const E = await paintEra(st, e, alive); if (!alive() || !E) return;
      st.eras[e] = E; lastKey = ''; kick();
    }
    if (hooks.t != null) { lastKey = ''; frame(); }
  };

  const onScroll = () => kick();
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!disposed) build(); }, 220); };
  const onVisibility = () => { if (!document.hidden) kick(); };
  const onPointer = e => { if (e.pointerType !== 'mouse') return; pointer[0] = e.clientX / window.innerWidth - .5; pointer[1] = e.clientY / window.innerHeight - .5; kick(); };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(stageEl);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  wideMq.addEventListener?.('change', onResize);
  await build();
  return {
    destroy() {
      disposed = true; cancelAnimationFrame(raf); clearTimeout(resizeTimer); io.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer); document.removeEventListener('visibilitychange', onVisibility);
      wideMq.removeEventListener?.('change', onResize);
      st.eras = {};
    },
  };
}

/** One fired place on its own canvas, for the plain version and readers who prefer less motion. */
export async function paintStill({ canvas, width, height, dpr = 1, era = 'now', hour, photos }) {
  const st = { canvas, sections: [], eras: {}, changed: {}, pos: ERAS.indexOf(era), hour, photos: await loadPhotos(photos), sheen: [.1, .05] };
  prepare(st, 'tall', width, height, dpr);
  const E = await paintEra(st, era, () => true);
  st.eras[era] = E; st.ready = true;
  render(st);
}
