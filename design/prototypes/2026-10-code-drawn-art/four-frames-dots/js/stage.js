/* Four frames in print: the stage. The same desk, window and pinboard as the clear-line
   homepage, separated into a key plate and colour plates and printed in muted inks through dot
   screens. While the scroll rests on a place, the sheet stays alive: clouds, birds, lights and the
   laptop move, printed through the same screens. Scrolling on to the next place prints the next
   sheet over the last, one ink at a time. The real photographs lie on top, untouched. */
import { clamp, smooth, lerp, mix, css, rgb, luminance, sceneDate, clockLabel, skyState, makeCanvas } from './core.js';
import { Pen, bake, place } from './ink.js';
import { drawRoom, openingOf } from './room.js';
import { VIEWS, VIEW_OPTS, setViewLight } from './views.js';
import { eraObjects, setPrintMode } from './objects.js';
import { SplitPen, plateCanvases, setBoth, bakeSplit, placeSplit } from './split.js';
import { drawViewLive, drawObjectLive } from './live.js';
import { Printer, getLUT } from './printer.js';
import { PAPER } from './plates.js';
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
const NIGHT_ROOM = '#dbe1e9';
function eraLight(era, L, hour) {
  const o = openingOf(L), H = 1000 * o.h / o.w;
  if (era === 'now') {
    const date = sceneDate(hour), st = skyState(date);
    const ax = az => (az - 55) / 70 * 1000, ey = el => H * .44 - el / 30 * H * .44;
    const sunUp = st.sun.el > -1 && st.sun.az > 50 && st.sun.az < 130;
    const moonUp = st.moon.el > 0 && st.moon.az > 45 && st.moon.az < 135 && st.night > .2;
    const patch = st.sun.el > 1 && st.sun.az > 40 && st.sun.az < 160 ? clamp(st.sun.el / 12) * (1 - smooth(48, 70, st.sun.el)) : 0;
    return {
      key: 'now', label: clockLabel(date),
      sky: { ...st, sunUp, sunX: ax(st.sun.az), sunY: ey(st.sun.el), moonUp, moonX: ax(st.moon.az), moonY: ey(st.moon.el) },
      tint: mix(mix(mix('#ffffff', '#fdf8f0', st.golden), '#f2eef0', st.twilight * .8), NIGHT_ROOM, st.night),
      lamp: st.lamp, patch, patchShift: clamp((st.sun.az - 90) / 60, -1, 1), patchWarm: st.golden,
    };
  }
  if (era === 'sd') return { key: 'sd', label: 'a clear morning', sky: { day: 1, golden: 0, night: 0, twilight: 0, stars: 0 }, tint: rgb('#ffffff'), lamp: 0, patch: .9, patchShift: -.35, patchWarm: 0 };
  if (era === 'blr') return { key: 'blr', label: 'late afternoon, before the rain', sky: { day: .7, golden: .55, night: 0, twilight: 0, stars: 0 }, tint: rgb('#fcf8f1'), lamp: 0, patch: .75, patchShift: .55, patchWarm: .8 };
  return { key: 'nitk', label: 'after dark, by the sea', sky: { day: 0, golden: 0, night: .78, twilight: .35, stars: .9, moonUp: true, moon: { phase: .3 }, moonX: 760, moonY: H * .16 }, tint: rgb(NIGHT_ROOM), lamp: 1, patch: 0, patchShift: 0, patchWarm: 0 };
}

/* ───────── baking a place ───────── */
function measure(L, draw) {
  const s = .25, W = (L.xMax - L.xMin + 400) * s, H = (L.yMax - L.yMin + 600) * s;
  const cv = makeCanvas(W, H), c = cv.getContext('2d', { willReadFrequently: true });
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
  return bake(px, x0, d.backY - 10, L.xMax - x0, d.frontY - d.backY + 60, P => {
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
}
/* Baking a place is a list of steps so the page can yield to the browser between them. */
function* eraSteps(st, era, out) {
  const { L, px, dpx } = st, o = openingOf(L), light = eraLight(era, L, st.hour), H = 1000 * o.h / o.w;
  setViewLight(light.sky);
  VIEW_OPTS.clouds = false;
  const vs = o.w * px / 1000;
  const air = .2 * (1 - clamp(light.sky.night || 0));
  const view = bakeSplit(vs, 0, 0, 1000, H, P => VIEWS[era](P, H, light.sky), air);
  VIEW_OPTS.clouds = true;
  yield;
  const objs = [], probe = eraObjects(era, L, {}), real = eraObjects(era, L, st.photos);
  for (let i = 0; i < real.length; i++) {
    const ob = real[i], b = measure(L, probe[i].draw) || [0, 0, 1, 1];
    setPrintMode(ob.photo ? 'frame' : 'full');
    const done = { ...ob, sp: bakeSplit(px, b[0], b[1], b[2], b[3], ob.draw) };
    if (ob.photo) { setPrintMode('photo'); done.photoSp = bake(dpx, b[0], b[1], b[2], b[3], ob.draw, { texture: 0, pool: 0 }); }
    setPrintMode('full');
    objs.push(done);
    yield;
  }
  // the room and everything on it, lit, on one separated sheet; the window opening stays open
  const sheet = plateCanvases(st.W, st.H);
  setBoth(sheet, 1, 0, 0, 1, -L.xMin * px, -L.yMin * px);
  placeSplit(sheet, st.room, px);
  for (const ob of objs) placeSplit(sheet, ob.sp, px);
  light.patchSp = light.patch > 0 ? bakePatch(L, light, px) : null;
  lightSheet(st, sheet, light, objs);
  yield;
  // the view outside, on its own separated sheet, clipped to the opening
  const live = objs.filter(ob => ob.live);
  const rects = [winRect(st)];
  for (const ob of live) if (ob.sp) rects.push(clipRect(st, ob.sp.x0, ob.sp.y0, ob.sp.w, ob.sp.h));
  out[era] = { light, objs, H, sheet, view, live, rects };
}
/* light: the room's tint, the patch of sun on the desk, the lamp after dark, a screen's glow; the
   words always keep bare paper behind them */
function lightSheet(st, sheet, light, objs) {
  const c = sheet.c, L = st.L, px = st.px, o = openingOf(L), tint = light.tint;
  if (tint[0] + tint[1] + tint[2] < 762) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = css(tint);
    c.beginPath(); c.rect(L.xMin * px, L.yMin * px, (L.xMax - L.xMin) * px, (L.yMax - L.yMin) * px); c.rect((o.x + o.w) * px, o.y * px, -o.w * px, o.h * px); c.fill('evenodd');
    c.restore();
  }
  if (light.patchSp) { c.save(); c.globalCompositeOperation = 'soft-light'; place(c, light.patchSp, px, { alpha: light.patch * .8 }); c.globalCompositeOperation = 'screen'; place(c, light.patchSp, px, { alpha: light.patch * .2 }); c.restore(); }
  if (light.lamp > .02) {
    const [ax, ay] = L.lamp.aim, [hx, hy] = L.lamp.head;
    c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = light.lamp;
    c.save(); c.translate(ax * px, ay * px); c.scale(1, .42);
    let g = c.createRadialGradient(0, 0, 8 * px, 0, 0, 300 * px);
    g.addColorStop(0, 'rgba(255,214,150,.8)'); g.addColorStop(.35, 'rgba(255,196,128,.44)'); g.addColorStop(1, 'rgba(255,190,120,0)');
    c.fillStyle = g; c.fillRect(-310 * px, -310 * px, 620 * px, 620 * px); c.restore();
    g = c.createRadialGradient(hx * px, hy * px, 6 * px, hx * px, hy * px, 520 * px);
    g.addColorStop(0, 'rgba(255,214,160,.5)'); g.addColorStop(.4, 'rgba(255,190,130,.16)'); g.addColorStop(1, 'rgba(255,190,130,0)');
    c.fillStyle = g; c.fillRect((hx - 530) * px, (hy - 530) * px, 1060 * px, 1060 * px);
    c.restore();
  }
  if ((light.sky.night || 0) > .2) {
    const scr = objs.find(ob => ob.screen && ob.glow);
    if (scr) {
      const r = scr.screen, gx = r.x + r.w / 2, gy = r.y + r.h;
      c.save(); c.beginPath(); c.rect(L.xMin * px, L.yMin * px, (L.xMax - L.xMin) * px, (L.desk.frontY - L.yMin) * px); c.clip();
      c.globalCompositeOperation = 'screen'; c.globalAlpha = (light.sky.night - .2) * .9;
      c.translate(gx * px, (gy + 40) * px); c.scale(1, .5);
      const g = c.createRadialGradient(0, 0, 10 * px, 0, 0, 260 * px);
      g.addColorStop(0, scr.glow); g.addColorStop(1, scr.glow.replace(/[\d.]+\)$/, '0)'));
      c.fillStyle = g; c.fillRect(-270 * px, -270 * px, 540 * px, 540 * px); c.restore();
    }
  }
  if (L.mode === 'wide' && st.lane) {
    // bare paper behind the column of words: the print fades out into the sheet's margin
    const x1 = L.xMin + st.lane.right / L.u;
    for (const [x, col] of [[c, PAPER], [sheet.k, null]]) {
      x.save();
      if (!col) x.globalCompositeOperation = 'destination-out';
      const g = x.createLinearGradient((x1 - 30) * px, 0, (x1 + 60) * px, 0);
      g.addColorStop(0, col || '#000'); g.addColorStop(1, col ? 'rgba(242,236,223,0)' : 'rgba(0,0,0,0)');
      x.fillStyle = col || '#000'; x.fillRect(L.xMin * px, L.yMin * px, (x1 - 30 - L.xMin) * px, (L.yMax - L.yMin) * px);
      x.fillStyle = g; x.fillRect((x1 - 30) * px, L.yMin * px, 90 * px, (L.yMax - L.yMin) * px);
      x.restore();
    }
  }
}
const nextTask = () => new Promise(res => setTimeout(res, 0));
async function buildEraSliced(st, era, alive, budget = 36) {
  const out = {};
  let t = performance.now();
  for (const step of eraSteps(st, era, out)) {
    void step;
    if (performance.now() - t > budget) { await nextTask(); if (!alive()) return; t = performance.now(); }
  }
  if (alive()) st.eras[era] = out[era];
}
function buildEra(st, era) { for (const step of eraSteps(st, era, st.eras)) void step; }

/* ───────── composing a sheet for the press ───────── */
/* rectangles in artwork pixels, rounded out and kept on the sheet */
function clipRect(st, x, y, w, h) {
  const L = st.L, px = st.px, pad = 2;
  const x0 = Math.max(0, Math.floor((x - L.xMin) * px) - pad), y0 = Math.max(0, Math.floor((y - L.yMin) * px) - pad);
  const x1 = Math.min(st.W, Math.ceil((x + w - L.xMin) * px) + pad), y1 = Math.min(st.H, Math.ceil((y + h - L.yMin) * px) + pad);
  return [x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0)];
}
function winRect(st) { const o = openingOf(st.L); return clipRect(st, o.x, o.y, o.w, o.h); }
/* compose the whole sheet, or (with `rect`) only that part of it: paper, the view and what moves
   outside, the room over it, then what moves on the desk */
function compose(st, frame, era, t, rect) {
  const E = st.eras[era], L = st.L, px = st.px, o = openingOf(L);
  const { c, k } = frame;
  c.setTransform(1, 0, 0, 1, 0, 0); k.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'source-over'; k.globalCompositeOperation = 'source-over';
  const [rx, ry, rw, rh] = rect || [0, 0, st.W, st.H];
  if (!rw || !rh) return;
  c.save(); k.save();
  if (rect) { c.beginPath(); c.rect(rx, ry, rw, rh); c.clip(); k.beginPath(); k.rect(rx, ry, rw, rh); k.clip(); }
  c.fillStyle = PAPER; c.fillRect(rx, ry, rw, rh); k.clearRect(rx, ry, rw, rh);
  if (!E) { c.restore(); k.restore(); return; }
  const wx = (o.x - L.xMin) * px, wy = (o.y - L.yMin) * px;
  for (const x of [c, k]) { x.save(); x.beginPath(); x.rect(wx, wy, o.w * px, o.h * px); x.clip(); x.drawImage(x === c ? E.view.cv : E.view.kv, wx, wy, o.w * px, o.h * px); x.restore(); }
  // what moves outside, behind the glazing bars
  const vs = o.w * px / 1000;
  for (const x of [c, k]) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.beginPath(); x.rect((o.x - L.xMin) * px, (o.y - L.yMin) * px, o.w * px, o.h * px); x.clip(); x.translate((o.x - L.xMin) * px, (o.y - L.yMin) * px); x.scale(vs, vs); }
  drawViewLive(new SplitPen(c, k, vs, .2 * (1 - clamp(E.light.sky.night || 0))), era, E.H, t, E.light.sky);
  c.restore(); k.restore();
  // the room over it
  c.drawImage(E.sheet.cv, 0, 0);
  k.globalCompositeOperation = 'destination-out'; k.drawImage(E.sheet.cv, 0, 0);
  k.globalCompositeOperation = 'source-over'; k.drawImage(E.sheet.kv, 0, 0);
  // what moves on the desk
  for (const x of [c, k]) { x.save(); x.setTransform(px, 0, 0, px, -L.xMin * px, -L.yMin * px); }
  const P = new SplitPen(c, k, px);
  for (const ob of E.live) drawObjectLive(P, ob, t);
  c.restore(); k.restore();
  c.restore(); k.restore();
}

/* the photographs, laid on the print in true colour and the room's light */
function drawPhotos(st, era, alpha, lift, clipRight) {
  const E = st.eras[era]; if (!E || alpha <= 0 || clipRight <= 0) return;
  const c = st.pctx, L = st.L, dpx = st.dpx, tint = E.light.tint;
  const tmp = st.ptmp, tc = tmp.getContext('2d');
  tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, tmp.width, tmp.height);
  tc.setTransform(1, 0, 0, 1, -L.xMin * dpx, -L.yMin * dpx);
  // after dark the prints dim and warm with the room (ignored where canvas filters are missing)
  const lum = (tint[0] + tint[1] + tint[2]) / 765, night = E.light.sky.night || 0;
  if (lum < .995) tc.filter = `brightness(${(.35 + .65 * lum).toFixed(3)}) sepia(${(night * .3).toFixed(3)})`;
  for (const ob of E.objs) if (ob.photoSp) place(tc, ob.photoSp, dpx, { dy: -lift });
  tc.filter = 'none';
  c.save(); c.globalAlpha = alpha; c.beginPath(); c.rect(0, 0, clipRight ?? tmp.width, tmp.height); c.clip(); c.drawImage(tmp, 0, 0); c.restore();
}

const easeIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
function render(st, t) {
  const pos = clamp(st.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
  const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)];
  const inT = tau > 0 && tau < 1 && pos < 3 && !!st.eras[B];
  const full = window.__forceFull || inT || st.faKey !== A || st.faBuilt !== Object.keys(st.eras).length;
  if (full) {
    compose(st, st.fa, A, t);
    st.printer.layer(0, st.fa.cv); st.printer.layer(1, st.fa.kv);
    st.faKey = inT ? null : A; st.faBuilt = Object.keys(st.eras).length;
  } else if (st.eras[A]) {
    for (const r of st.eras[A].rects) {
      compose(st, st.fa, A, t, r);
      st.printer.layer(0, st.fa.cv, r); st.printer.layer(1, st.fa.kv, r);
    }
  }
  if (inT) { compose(st, st.fb, B, t); st.printer.layer(2, st.fb.cv); st.printer.layer(3, st.fb.kv); }
  st.printer.print({ tau: inT ? tau : 0, dpr: st.dpr, cssCell: st.cell, misreg: 1 });
  // photographs: unpinned before the new sheet arrives, pinned again after it is printed
  const pkey = inT ? `${A}>${B}:${Math.round(tau * 60)}` : A;
  if (pkey !== st.photoKey) {
    st.photoKey = pkey;
    const c = st.pctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, st.pcanvas.width, st.pcanvas.height);
    if (!inT) drawPhotos(st, A, 1, 0);
    else {
      // the old prints go under the new sheet as it slides in; the new ones are pinned once printed
      const edge = (1 - clamp(tau / .24) * 1.08) * st.pcanvas.width, aIn = easeIO(clamp((tau - .86) / .14));
      drawPhotos(st, A, 1, 0, edge);
      drawPhotos(st, B, aIn, (1 - aIn) * 16);
    }
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
  return Promise.all(Object.entries(urls).map(([key, src]) => new Promise(res => {
    const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => res(); im.src = src; out[key] = im;
  }))).then(() => out);
}
/* the separated artwork is drawn a little below device resolution: the dots and lines are far
   coarser than a pixel, and the press samples it smoothly */
function prepare(st, mode, w, h, dpr) {
  st.L = layoutFor(mode, w, h);
  st.dpr = dpr; st.dpx = st.L.u * dpr;
  st.scale = Math.min(dpr, mode === 'wide' ? 1.1 : 1.6);
  st.px = st.L.u * st.scale;
  st.W = Math.round(w * st.scale); st.H = Math.round(h * st.scale);
  st.canvas.width = Math.round(w * dpr); st.canvas.height = Math.round(h * dpr);
  st.pcanvas.width = st.canvas.width; st.pcanvas.height = st.canvas.height;
  st.pctx = st.pcanvas.getContext('2d');
  st.ptmp = makeCanvas(st.canvas.width, st.canvas.height);
  st.fa = plateCanvases(st.W, st.H); st.fb = plateCanvases(st.W, st.H);
  // dot pitch: about 7 CSS px on a desk this size, a little finer when the desk is small
  st.cell = clamp(8.2 * st.L.u, 4.6, 7.2);
  st.eras = {}; st.photoKey = null; st.faKey = null;
  st.room = bakeSplit(st.px, st.L.xMin, st.L.yMin, st.L.xMax - st.L.xMin, st.L.yMax - st.L.yMin, P => drawRoom(P, st.L));
}

/**
 * Bring the printed desk to life. Same contract as the homepage stage:
 * { canvas, photoCanvas, stageEl, sections, laneEl, photos, hooks, onChange, onReady } → { destroy() }.
 */
export async function createStage({ canvas, photoCanvas, stageEl, sections, laneEl, photos, hooks = {}, onChange, onReady }) {
  getLUT();
  const st = { canvas, pcanvas: photoCanvas, sections, eras: {}, pos: 0, hour: hooks.hour, photos: {}, lane: null };
  st.printer = new Printer(canvas);
  let disposed = false, raf = 0, visible = true, lastT = -1, lastPos = -1, building = 0, resizeTimer = 0, lastCaption = '';
  const t0 = performance.now();
  const wideMq = window.matchMedia(WIDE_QUERY);
  st.photos = await loadPhotos(photos);

  const caption = () => {
    const key = ERAS[Math.min(3, Math.round(st.pos))], E = st.eras[key]; if (!E) return;
    const txt = key === 'now' ? `${PLACE_NAMES[key]} · ${E.light.label}` : PLACE_NAMES[key];
    if (txt !== lastCaption) { lastCaption = txt; onChange?.({ place: PLACE_NAMES[key], label: E.light.label, text: txt, pos: st.pos }); }
  };
  const frame = now => {
    raf = 0;
    if (disposed || document.hidden || !st.ready) return;
    const t = window.__clockT != null ? window.__clockT : hooks.t != null ? hooks.t : (now - t0) / 1000;
    st.pos = hooks.pos != null ? hooks.pos : scrollPos(st);
    // the sheet is re-printed when the scroll moves, and otherwise about 24 times a second
    if (st.pos !== lastPos || Math.abs(t - lastT) > .066 || hooks.t != null || window.__clockT != null) { render(st, t); lastT = t; lastPos = st.pos; caption(); }
    if (hooks.t == null && window.__clockT == null && visible) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && st.ready && !disposed && !document.hidden && visible) raf = requestAnimationFrame(frame); };
  window.__stageFrame = () => frame(performance.now());

  const build = async () => {
    const id = ++building;
    const r = stageEl.getBoundingClientRect(), mode = wideMq.matches ? 'wide' : 'tall';
    const w = Math.round(r.width), h = Math.round(r.height), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return;
    const alive = () => !disposed && id === building;
    st.ready = false;
    if (laneEl && mode === 'wide') { const lr = laneEl.getBoundingClientRect(); st.lane = { right: lr.right - r.left }; } else st.lane = null;
    prepare(st, mode, w, h, dpr);
    await nextTask(); if (!alive()) return;
    const first = hooks.era && ERAS.includes(hooks.era) ? hooks.era : hooks.pos != null ? ERAS[Math.min(3, Math.floor(hooks.pos))] : ERAS[Math.min(3, Math.round(scrollPos(st)))];
    await buildEraSliced(st, first, alive); if (!alive()) return;
    if (hooks.pos != null && hooks.pos % 1 > 0) { await buildEraSliced(st, ERAS[Math.min(3, Math.floor(hooks.pos) + 1)], alive); if (!alive()) return; }
    st.ready = true; lastPos = -1; frame(performance.now());
    onReady?.();
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
      disposed = true; cancelAnimationFrame(raf); clearTimeout(resizeTimer); io.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility); wideMq.removeEventListener?.('change', onResize);
      st.eras = {};
    },
  };
}

/** One printed place on its own canvas, for the plain version and readers who prefer less motion. */
export async function paintStill({ canvas, width, height, dpr = 1, era = 'now', hour, photos }) {
  getLUT();
  const gl = makeCanvas(width * dpr, height * dpr), pc = makeCanvas(width * dpr, height * dpr);
  const st = { canvas: gl, pcanvas: pc, sections: [], eras: {}, pos: ERAS.indexOf(era), hour, photos: await loadPhotos(photos), lane: null };
  st.printer = new Printer(gl, { preserve: true });
  prepare(st, 'tall', width, height, dpr);
  buildEra(st, era);
  render(st, 2);
  canvas.width = gl.width; canvas.height = gl.height;
  const c = canvas.getContext('2d');
  c.drawImage(gl, 0, 0); c.drawImage(pc, 0, 0);
  st.printer.gl.getExtension('WEBGL_lose_context')?.loseContext();
}
