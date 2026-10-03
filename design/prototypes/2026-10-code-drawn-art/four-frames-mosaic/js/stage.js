/* Four frames in mosaic: the stage.
   For each place: the homepage's drawing becomes a cartoon, the cartoon is laid in stones
   (andamento), and the stones are set once on a canvas over grout. Each frame that canvas is
   shown and only the living stones are set again: the window, the screen, a blinking eye, glass
   catching light. Between places the mosaic is re-laid: a wave runs in from the right, lifting
   the old stones and setting the new ones outline first, then row by row inward. */
import { clamp, lerp, smooth, rgb } from './core.js';
import { Pen, PAL } from './ink.js';
import { ERAS, PLACE_NAMES, layoutFor } from './layout.js';
import { stoneRoom, eraLight, cartoonOf, laySteps, colour, paintStone, stonePath, GROUT, GROUT_LIGHT, BED } from './mosaic.js';
import { makeLiveView, assignSparkle, liveViewStone, tokensFor, tokensAt, eyesFor, blinkOn, COBALT_STONE, traceFor, traceAt, glintAt } from './living.js';
import { stoneRGB } from './palette.js';
import { WIDE_QUERY } from './constants.js';

export { ERAS, PLACE_NAMES };
stoneRoom();

/* stone size: in art units (the art square is 1000 wide), and in cartoon-sheet pixels */
const STONE_ART = 19, STONE_SHEET = 5.2, FINE = .58;
const nextTask = () => new Promise(res => setTimeout(res, 0));
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* grout: dark through the picture, lightened behind the words so they sit on calm stone */
function groutPaint(c, st, W, H) {
  if (st.laneDev != null) {
    const g = c.createLinearGradient(st.laneDev - 10 * st.dpr, 0, st.laneDev + 90 * st.dpr, 0);
    g.addColorStop(0, GROUT_LIGHT); g.addColorStop(1, GROUT);
    c.fillStyle = g;
  } else c.fillStyle = GROUT;
  c.fillRect(0, 0, W, H);
}

/* ───────── building one place ───────── */
function* eraSteps(st, era, out) {
  const { L } = st;
  const light = eraLight(era, L, st.hour);
  const bs = STONE_SHEET / STONE_ART;
  const cart = cartoonOf(era, L, light, st.photos, bs);
  yield;
  const layout = yield* laySteps(cart, L, STONE_SHEET, 11 + ERAS.indexOf(era) * 7, FINE);
  const laneX = st.laneCss != null ? st.laneCss / st.cssW * cart.W : null;
  colour(layout, cart, L, light, { laneX, feather: 30 });
  yield;
  const W = st.canvas.width, H = st.canvas.height, k = W / cart.W;
  const cv = mk(W, H), c = cv.getContext('2d');
  groutPaint(c, st, W, H);
  for (const t of layout.tiles) paintStone(c, t, t.rgb, k);
  yield;
  // the real photographs, crisp, hung over the stones
  const prints = mk(W, H), pc = prints.getContext('2d');
  const px = L.u * st.dpr;
  pc.setTransform(px, 0, 0, px, -L.xMin * px, -L.yMin * px);
  const P = new Pen(pc, px);
  for (const ob of cart.prints) ob.draw(P);
  c.drawImage(prints, 0, 0);
  // the living stones
  const toSheet = (x, y) => [(x - L.xMin) * bs, (y - L.yMin) * bs];
  const view = layout.tiles.filter(t => t.view);
  assignSparkle(era, layout.tiles, layout, cart.view, light.sky);
  const live = [];
  for (const ob of cart.objs) {
    if (ob.live === 'tokens') live.push({ kind: 'tokens', rows: tokensFor(layout.tiles, ob.screen, toSheet) });
    else if (ob.live === 'blink') live.push({ kind: 'blink', tiles: eyesFor(layout.tiles.filter(t => !t.view && t.k !== 0), ob.eyes, toSheet, STONE_SHEET) });
    else if (ob.live === 'trace') live.push({ kind: 'trace', tr: traceFor(layout.tiles, ob.screen, toSheet) });
  }
  const glass = layout.tiles.filter(t => t.glass && !t.view);
  // stones sorted by x, for the re-laying wave
  const byX = layout.tiles.slice().sort((a, b) => a.x - b.x);
  out[era] = {
    light, cart, layout, cv, k, view, live, glass, byX, prints,
    liveView: makeLiveView(era, cart.view, light.sky),
  };
}
async function buildEraSliced(st, era, alive, budget = 40) {
  const out = {};
  let t = performance.now();
  for (const step of eraSteps(st, era, out)) {
    void step;
    if (performance.now() - t > budget) { await nextTask(); if (!alive()) return; t = performance.now(); }
  }
  if (alive()) st.eras[era] = out[era];
}
function buildEra(st, era) { for (const step of eraSteps(st, era, st.eras)) void step; }

/* ───────── each frame ───────── */
function drawLiving(st, E, t) {
  const c = st.ctx, k = E.k, cart = E.cart, o = E.layout.opening;
  // the window: every stone takes the colour of the moving scene beneath it
  const data = E.liveView.paint(t), vw = cart.view.w, vh = cart.view.h, night = E.light.sky.night || 0;
  for (const tile of E.view) {
    const lx = tile.x - o.x0, ly = tile.y - o.y0;
    let r = 0, g = 0, b = 0, n = 0;
    for (const [dx, dy] of [[-.25, -.2], [.25, -.2], [-.25, .2], [.25, .2]]) {
      const xi = Math.min(vw - 1, Math.max(0, (lx + dx * tile.l) | 0)), yi = Math.min(vh - 1, Math.max(0, (ly + dy * tile.w) | 0)), p = (yi * vw + xi) * 4;
      if (data[p + 3] < 20) continue; r += data[p]; g += data[p + 1]; b += data[p + 2]; n++;
    }
    if (!n) continue;
    const s = liveViewStone(t, tile, r / n, g / n, b / n, night, t);
    if (s !== tile.stone) paintStone(c, tile, stoneRGB(s, tile.h), k);
  }
  // the desk
  for (const lv of E.live) {
    if (lv.kind === 'tokens') for (const [tile, s] of tokensAt(lv.rows, t)) paintStone(c, tile, stoneRGB(s, tile.h), k);
    else if (lv.kind === 'blink' && blinkOn(t)) for (const tile of lv.tiles) paintStone(c, tile, stoneRGB(COBALT_STONE, tile.h), k);
    else if (lv.kind === 'trace') for (const [tile, s] of traceAt(lv.tr, t, STONE_SHEET)) paintStone(c, tile, stoneRGB(s, tile.h), k);
  }
  // glass catching the light
  for (const tile of E.glass) { const g = glintAt(t, tile.x, tile.y, cart.W, cart.H); if (g > .02) paintStone(c, tile, tile.rgb, k, 0, 0, g); }
  c.drawImage(E.prints, 0, 0);
}

/* the re-laying wave. Each stone of the old place is lifted at w(x), the new place's stone set a
   little later: outlines first, then the rows inward, then the courses and the cut fill. */
const SPAN = .66, LIFT = .08, SET = .1;
const stageOf = t => t.k === 0 ? 0 : t.k === 1 ? Math.min(4, t.row || 1) * .17 : t.k === 2 ? .85 : .95;
function relay(st, EA, EB, tau) {
  const c = st.ctx, W = st.canvas.width, H = st.canvas.height, k = EA.k;
  const cw = EA.cart.W;
  // the words' wall is not re-laid: it takes the new place's light in a gentle cross-fade
  const x0 = st.laneCss != null ? st.laneCss / st.cssW * cw + 4 : 0, x0d = x0 * k;
  const startOf = x => (1 - (x - x0) / (cw - x0)) * SPAN;
  const TOTAL = LIFT + .04 + SET * .95 + .06;
  // where the wave is: left of `pend` the old place stands; right of `done` the new one is laid
  const pend = x0 + (cw - x0) * (1 - tau / SPAN), done = x0 + (cw - x0) * (1 - (tau - TOTAL) / SPAN);
  const pd = clamp(pend * k, x0d, W), dd = clamp(done * k, x0d, W);
  if (x0d > 0) {
    c.save(); c.beginPath(); c.rect(0, 0, x0d, H); c.clip();
    c.drawImage(EA.cv, 0, 0); c.globalAlpha = smooth(.25, .75, tau); c.drawImage(EB.cv, 0, 0);
    c.restore();
  }
  if (pd > x0d) { c.save(); c.beginPath(); c.rect(x0d, 0, pd - x0d, H); c.clip(); c.drawImage(EA.cv, 0, 0); c.restore(); }
  if (dd < W) { c.save(); c.beginPath(); c.rect(dd, 0, W - dd, H); c.clip(); c.drawImage(EB.cv, 0, 0); c.restore(); }
  if (dd > pd) {
    c.save(); c.beginPath(); c.rect(pd, 0, dd - pd, H); c.clip();
    // the setting bed: fresh mortar, lighter than set grout
    c.fillStyle = BED; c.fillRect(pd, 0, dd - pd, H);
    const lo = pend - 2 * STONE_SHEET, hi = done + 2 * STONE_SHEET;
    for (const t of EA.byX) {
      if (t.x < lo) continue; if (t.x > hi) break;
      const s0 = startOf(t.x) + (1 - stageOf(t)) * .04, kk = clamp((tau - s0) / LIFT);
      if (kk >= 1) continue;
      const sc = 1 - easeIO(kk);
      paintStone(c, sc === 1 ? t : { ...t, l: t.l * sc, w: t.w * sc, j: t.j.map(v => v * sc) }, t.rgb, k);
    }
    for (const t of EB.byX) {
      if (t.x < lo) continue; if (t.x > hi) break;
      const s0 = startOf(t.x) + LIFT + .04 + stageOf(t) * SET, kk = clamp((tau - s0) / .06);
      if (kk <= 0) continue;
      const sc = easeIO(kk), lift = (1 - sc) * 6 * st.dpr;
      paintStone(c, sc === 1 ? t : { ...t, l: t.l * (.4 + .6 * sc), w: t.w * (.4 + .6 * sc), j: t.j.map(v => v * sc) }, t.rgb, k, 0, -lift);
    }
    c.restore();
  }
  // the photographs come off with the wave and go back up after it
  const fade = (E, a) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.drawImage(E.prints, 0, 0); c.restore(); };
  const ps = startOf(cw * .82);
  fade(EA, 1 - clamp((tau - ps) / .08));
  fade(EB, clamp((tau - ps - TOTAL) / .1));
}

/* The mosaic is a panel set into a plain wall: the words and the menu sit on clean plaster,
   never on stones (a quiet frame around one living thing). */
function frameMask(st) {
  const c = st.ctx, p = st.panel; if (!c || !p) return;
  const W = st.canvas.width, H = st.canvas.height, d = st.dpr;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = st.wallCss;
  c.beginPath(); c.rect(0, 0, W, H); c.rect(p.x, p.y, p.w, p.h); c.fill('evenodd');
  // set into the plaster: a soft shadow under the top and left edges, a fine line all round
  const sh = c.createLinearGradient(0, p.y, 0, p.y + 10 * d); sh.addColorStop(0, 'rgba(40,32,20,.22)'); sh.addColorStop(1, 'rgba(40,32,20,0)');
  c.fillStyle = sh; c.fillRect(p.x, p.y, p.w, 10 * d);
  const sv = c.createLinearGradient(p.x, 0, p.x + 8 * d, 0); sv.addColorStop(0, 'rgba(40,32,20,.16)'); sv.addColorStop(1, 'rgba(40,32,20,0)');
  c.fillStyle = sv; c.fillRect(p.x, p.y, 8 * d, p.h);
  c.strokeStyle = 'rgba(48,40,28,.45)'; c.lineWidth = Math.max(1, d);
  c.strokeRect(p.x + .5 * d, p.y + .5 * d, p.w - d, p.h - d);
  c.restore();
}

function render(st, t) {
  renderInner(st, t);
  frameMask(st);
}

function renderInner(st, t) {
  const c = st.ctx; if (!c) return;
  const pos = clamp(st.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
  const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)];
  const EA = st.eras[A], EB = st.eras[B];
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (!EA) { c.fillStyle = PAL.wall; c.fillRect(0, 0, st.canvas.width, st.canvas.height); return; }
  const inT = tau > .001 && tau < .999 && pos < 3 && !!EB;
  if (inT) { relay(st, EA, EB, tau); return; }
  const E = tau >= .999 && EB ? EB : EA;
  c.drawImage(E.cv, 0, 0);
  if (!st.still) drawLiving(st, E, t);
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
  return Promise.all(Object.entries(urls).map(([key, src]) => new Promise(res => {
    const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => res(); im.src = src; out[key] = im;
  }))).then(() => out);
}
function prepare(st, mode, w, h, dpr, bounds) {
  st.L = layoutFor(mode, w, h, bounds);
  st.dpr = dpr; st.cssW = w; st.cssH = h;
  st.canvas.width = Math.round(w * dpr); st.canvas.height = Math.round(h * dpr);
  st.ctx = st.canvas.getContext('2d');
  st.eras = {};
}

/** Bring the mosaic to life on `canvas` (same interface as the homepage stage). */
export async function createStage({ canvas, stageEl, sections, laneEl, photos, hooks = {}, onChange, onReady }) {
  const st = { canvas, sections, eras: {}, pos: 0, hour: hooks.hour, photos: {} };
  let disposed = false, raf = 0, visible = true, lastT = -1, lastPos = -1, building = 0, resizeTimer = 0, lastCaption = '';
  const t0 = performance.now();
  const wideMq = window.matchMedia(WIDE_QUERY);
  st.photos = await loadPhotos(photos);
  if (disposed) return { destroy() {} };
  const caption = () => {
    const key = ERAS[Math.min(3, Math.round(st.pos))], E = st.eras[key]; if (!E) return;
    const txt = key === 'now' ? `${PLACE_NAMES[key]} · ${E.light.label}` : PLACE_NAMES[key];
    if (txt !== lastCaption) { lastCaption = txt; onChange?.({ place: PLACE_NAMES[key], label: E.light.label, text: txt, pos: st.pos }); }
  };
  const frame = now => {
    raf = 0;
    if (disposed || document.hidden || !st.ready) return;
    const t = hooks.t != null ? hooks.t : (now - t0) / 1000;
    st.pos = hooks.pos != null ? hooks.pos : scrollPos(st);
    // the scene moves slowly: about 20 frames a second is plenty for stones
    if (st.pos !== lastPos || t - lastT > .05 || hooks.t != null) { render(st, t); lastT = t; lastPos = st.pos; caption(); }
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
    if (mode === 'wide' && laneEl) { const lr = laneEl.getBoundingClientRect(); st.laneCss = lr.right - r.left; st.laneDev = st.laneCss * dpr; } else { st.laneCss = null; st.laneDev = null; }
    // where the stones may go: right of the words and below the menu on wide screens, a framed panel
    // on phones. The whole composition is fitted inside that panel, so nothing is cropped by the frame.
    st.wallCss = getComputedStyle(stageEl).backgroundColor || '#ece3cb';
    const hd = document.querySelector('.site-header');
    let pc, bounds;
    if (mode === 'wide') {
      const top = Math.max(18, hd ? hd.getBoundingClientRect().bottom - r.top + 10 : 18), m = 28;
      pc = { x: (st.laneCss ?? 0) + 36, y: top }; pc.w = w - pc.x - m; pc.h = h - pc.y - m;
      const u = Math.max(Math.min(pc.h, pc.w), 200) / 1000;
      const xMin = 1000 - (pc.x + pc.w) / u, yMin = 1000 - (pc.y + pc.h) / u;
      bounds = { u, xMin, xMax: xMin + w / u, yMin, yMax: yMin + h / u };
    } else {
      const m = 12; pc = { x: m, y: m, w: w - 2 * m, h: h - 2 * m };
      const u = Math.min(pc.w / 700, pc.h / 790);
      const xMin = 350 - (pc.x + pc.w / 2) / u, yMin = 742 - (pc.y + pc.h) / u;
      bounds = { u, xMin, xMax: xMin + w / u, yMin, yMax: yMin + h / u };
    }
    prepare(st, mode, w, h, dpr, bounds);
    st.panel = { x: Math.round(pc.x * dpr), y: Math.round(pc.y * dpr), w: Math.round(pc.w * dpr), h: Math.round(pc.h * dpr) };
    await nextTask(); if (!alive()) return;
    const first = hooks.era && ERAS.includes(hooks.era) ? hooks.era : hooks.pos != null ? ERAS[Math.min(3, Math.floor(hooks.pos))] : ERAS[Math.min(3, Math.round(scrollPos(st)))];
    await buildEraSliced(st, first, alive); if (!alive()) return;
    if (hooks.pos != null && hooks.pos % 1 > 0) { await buildEraSliced(st, ERAS[Math.min(3, Math.floor(hooks.pos) + 1)], alive); if (!alive()) return; }
    st.ready = true; lastPos = -1; frame(performance.now());
    // review hook: draw any moment without reloading (frozen pages only)
    if (hooks.t != null) window.__renderAt = (t, pos) => { if (pos != null) st.pos = pos; const t0r = performance.now(); render(st, t); return performance.now() - t0r; };
    onReady?.();
    const idle = () => new Promise(res => window.requestIdleCallback ? window.requestIdleCallback(() => res(), { timeout: 700 }) : setTimeout(res, 60));
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
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!disposed) build(); }, 240); };
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
      disposed = true; cancelAnimationFrame(raf); clearTimeout(resizeTimer); io.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility); wideMq.removeEventListener?.('change', onResize);
      st.eras = {};
    },
  };
}

/** One still of a place, for the plain version and readers who prefer less motion. */
export async function paintStill({ canvas, width, height, dpr = 1, era = 'now', hour, photos }) {
  const st = { canvas, sections: [], eras: {}, pos: ERAS.indexOf(era), hour, photos: await loadPhotos(photos), still: true, laneCss: null, laneDev: null };
  prepare(st, 'tall', width, height, dpr);
  buildEra(st, era);
  render(st, 0);
  return { label: st.eras[era].light.label };
}
export { lerp, smooth, rgb, stonePath };
