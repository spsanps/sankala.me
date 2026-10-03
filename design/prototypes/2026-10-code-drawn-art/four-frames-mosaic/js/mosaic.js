/* Four frames in mosaic: one place, from cartoon to laid stones.
   cartoonOf()  replays the homepage's drawing (room, window view, objects) through the cartoon
                pen at sheet resolution; the photographs are kept out, as footprints.
   lay()        works out the andamento (tessera.js) and sorts the stones by what they show:
                the view outside (re-coloured every frame), live screens, everything else.
   colour()     matches each stone to the stone box under the place's light.
   paintStones() lays them on a canvas over dark grout, each with a cut edge catching light. */
import { clamp, lerp, mix, rgb, sceneDate, clockLabel, skyState, smooth, mulberry32 } from './core.js';
import { PAL } from './ink.js';
import { drawRoom, openingOf } from './room.js';
import { VIEWS, setViewLight, CLOUDS } from './views.js';
import { eraObjects } from './objects.js';
import { CartoonPen, FootprintPen } from './mosaicpen.js';
import { layStonesSteps, corners } from './tessera.js';
import { stoneOf, stoneOfDay, stoneRGB, PAL_RGB, PAL_LAB, toLab, INK_STONE, GLASSY, GOLD_STONE, viewTone } from './palette.js';

/* the mosaic wants a warmer, stonier room than the gouache one: limestone wall, marble frame,
   terracotta floor. Everything else keeps the homepage's colours and finds its nearest stone. */
const ROOM_STONE = {
  wall: '#ece3cb', wallShade: '#dccfae', wallDeep: '#cdbd98', base: '#f5f1e6', baseShade: '#ddd6c4',
  floor: '#c4703f', floorShade: '#9c552c', frame: '#f8f5ec', frameShade: '#ddd8c9',
};
export function stoneRoom() { Object.assign(PAL, ROOM_STONE); }

const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };

/* ───────── light for each place (as on the homepage) ───────── */
const NIGHT_ROOM = '#c7b6a5';
export function eraLight(era, L, hour) {
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
      tint: mix(mix(mix('#ffffff', '#fbeedd', st.golden), '#ece4e6', st.twilight * .8), NIGHT_ROOM, st.night),
      lamp: st.lamp, patch, patchShift: clamp((st.sun.az - 90) / 60, -1, 1), patchWarm: st.golden,
    };
  }
  if (era === 'sd') return { key: 'sd', label: 'a clear morning', sky: { day: 1, golden: 0, night: 0, twilight: 0, stars: 0 }, tint: rgb('#ffffff'), lamp: 0, patch: .9, patchShift: -.35, patchWarm: 0 };
  if (era === 'blr') return { key: 'blr', label: 'late afternoon, before the rain', sky: { day: .7, golden: .55, night: 0, twilight: 0, stars: 0 }, tint: rgb('#f8efe1'), lamp: 0, patch: .75, patchShift: .55, patchWarm: .8 };
  return { key: 'nitk', label: 'after dark, by the sea', sky: { day: 0, golden: 0, night: .78, twilight: .35, stars: .9, moonUp: true, moon: { phase: .3 }, moonX: 760, moonY: H * .16 }, tint: rgb(NIGHT_ROOM), lamp: 1, patch: 0, patchShift: 0, patchWarm: 0 };
}

/* ───────── the cartoon ───────── */
export function viewSheetOf(era, L, light, bs) {
  // the view, without its clouds (they drift), on its own sheet in view units → sheet pixels
  const o = openingOf(L), H = 1000 * o.h / o.w, sc = o.w * bs / 1000;
  const w = Math.ceil(o.w * bs), h = Math.ceil(o.h * bs);
  const cv = { base: mk(w, h), col: mk(w, h), line: mk(w, h) };
  const ctx = { base: cv.base.getContext('2d'), col: cv.col.getContext('2d'), line: cv.line.getContext('2d') };
  for (const c of Object.values(ctx)) c.setTransform(sc, 0, 0, sc, 0, 0);
  setViewLight(light.sky);
  CLOUDS.capture = true; CLOUDS.list = [];
  VIEWS[era](new CartoonPen(ctx, sc), H, light.sky);
  CLOUDS.capture = false;
  return { ...cv, clouds: CLOUDS.list.slice(), H, sc, w, h };
}
export function cartoonOf(era, L, light, photos, bs) {
  const W = Math.ceil((L.xMax - L.xMin) * bs), H = Math.ceil((L.yMax - L.yMin) * bs);
  const sh = { base: mk(W, H), col: mk(W, H), line: mk(W, H), hole: mk(W, H) };
  const ctx = {}; for (const k in sh) { ctx[k] = sh[k].getContext('2d', { willReadFrequently: true }); ctx[k].setTransform(bs, 0, 0, bs, -L.xMin * bs, -L.yMin * bs); }
  const o = openingOf(L);
  const view = viewSheetOf(era, L, light, bs);
  // the view first, through the opening; then the room (its window leaves the opening open)
  for (const k of ['base', 'col', 'line']) { const c = ctx[k]; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(view[k], (o.x - L.xMin) * bs, (o.y - L.yMin) * bs); c.restore(); }
  const pen = new CartoonPen({ base: ctx.base, col: ctx.col, line: ctx.line }, bs);
  drawRoom(pen, L);
  const objs = eraObjects(era, L, photos), prints = [];
  for (const ob of objs) {
    if (/^p-/.test(ob.id)) { prints.push(ob); continue; }
    ob.draw(pen);
  }
  // the photographs' footprints: no stones there; the real prints are hung on top
  const fp = new FootprintPen({ base: ctx.hole, col: ctx.hole, line: ctx.hole }, bs);
  for (const ob of prints) ob.draw(fp);
  // what stands in front of the view (glazing bars, the lamp, the laptop): those stones stay put
  const front = mk(W, H), fx = front.getContext('2d', { willReadFrequently: true });
  fx.setTransform(bs, 0, 0, bs, -L.xMin * bs, -L.yMin * bs);
  const mp = new FootprintPen({ base: fx, col: fx, line: fx }, bs);
  drawRoom(mp, L);
  for (const ob of objs) if (!/^p-/.test(ob.id)) ob.draw(mp);
  return { ...sh, front, W, H, bs, view, prints, objs, lines: pen.lines };
}

/* ───────── laying ───────── */
export function* laySteps(cart, L, s, seed = 11, fine = .74) {
  const { W, H } = cart;
  const g = k => cart[k].getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const sheets = { W, H, base: g('base'), col: g('col'), line: g('line'), hole: g('hole'), lines: cart.lines };
  const front = g('front');
  yield;
  const cov = mk(W, H), cc = cov.getContext('2d', { willReadFrequently: true });
  const cover = (tiles, scale) => {
    cc.setTransform(1, 0, 0, 1, 0, 0); cc.clearRect(0, 0, W, H); cc.fillStyle = '#fff';
    const q = new Float32Array(8);
    for (const t of tiles) {
      corners({ ...t, l: t.l * scale, w: t.w * scale }, q);
      cc.beginPath(); cc.moveTo(q[0], q[1]); cc.lineTo(q[2], q[3]); cc.lineTo(q[4], q[5]); cc.lineTo(q[6], q[7]); cc.closePath(); cc.fill();
    }
    return cc.getImageData(0, 0, W, H).data;
  };
  const o = openingOf(L), bs = cart.bs;
  const ox0 = (o.x - L.xMin) * bs, oy0 = (o.y - L.yMin) * bs, ox1 = ox0 + o.w * bs, oy1 = oy0 + o.h * bs;
  const result = yield* layStonesSteps(sheets, s, { seed, cover, fine });
  // the view outside is re-coloured every frame; whatever stands in front of it is not
  for (const t of result.tiles) {
    const xi = Math.min(W - 1, Math.max(0, t.x | 0)), yi = Math.min(H - 1, Math.max(0, t.y | 0));
    t.view = t.x > ox0 && t.x < ox1 && t.y > oy0 && t.y < oy1 && front[(yi * W + xi) * 4 + 3] < 128 && t.k !== 0;
  }
  result.sheets = sheets;
  result.opening = { x0: ox0, y0: oy0, x1: ox1, y1: oy1 };
  result.s = s;
  return result;
}
export function lay(cart, L, s, seed, fine) { const g = laySteps(cart, L, s, seed, fine); let r = g.next(); while (!r.done) r = g.next(); return r.value; }

/* ───────── colour under the place's light ───────── */
function sampleAvg(d, W, H, x, y, r) {
  let R = 0, G = 0, B = 0, n = 0;
  for (let yy = Math.max(0, Math.round(y - r)); yy <= Math.min(H - 1, Math.round(y + r)); yy++)
    for (let xx = Math.max(0, Math.round(x - r)); xx <= Math.min(W - 1, Math.round(x + r)); xx++) {
      const p = (yy * W + xx) * 4; if (d[p + 3] < 20) continue; R += d[p]; G += d[p + 1]; B += d[p + 2]; n++;
    }
  return n ? [R / n, G / n, B / n] : null;
}
/** light the room's stones: the place's tint, the sunlight on the desk, the lamp after dark */
export function lightAt(L, light, ax, ay) {
  // stones do not shade continuously, so daylight changes the room's stones only gently; after
  // dark the room goes most of the way to lamplight
  const t = light.tint, n = light.sky.night || 0, strength = .45 + .45 * n;
  let m = [lerp(1, t[0] / 255, strength), lerp(1, t[1] / 255, strength), lerp(1, t[2] / 255, strength)], add = [0, 0, 0];
  if (light.lamp > .02) {
    const [lx, ly] = L.lamp.aim, [hx, hy] = L.lamp.head;
    const d1 = Math.hypot(ax - lx, (ay - ly) / .42) / 300, d2 = Math.hypot(ax - hx, ay - hy) / 520;
    const k = light.lamp * (Math.max(0, 1 - d1) * .85 + Math.max(0, 1 - d2) * .45);
    add = [255 * .55 * k, 205 * .5 * k, 140 * .42 * k];
  }
  if (light.patch > 0) {
    const d = L.desk, o = openingOf(L), shift = light.patchShift * 120, depth = (d.frontY - d.backY) * 1.05;
    if (ay > d.backY && ay < d.frontY) {
      const v = (ay - d.backY) / depth, x0 = o.x + shift * v - 30 * v, x1 = o.x + o.w + shift * v + 30 * v;
      if (ax > x0 && ax < x1) {
        const edge = Math.min(ax - x0, x1 - ax) / 30, k = light.patch * clamp(edge) * .22;
        add = [add[0] + 255 * k, add[1] + (light.patchWarm ? 214 : 246) * k, add[2] + (light.patchWarm ? 150 : 222) * k];
      }
    }
  }
  return { m, add };
}
const SOFT_INK = stoneOf(170, 165, 154);
const labDistLite = (c, i) => { const a = toLab(c[0], c[1], c[2]), b = PAL_LAB[i]; return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
export function colour(layout, cart, L, light, opts = {}) {
  const { W, H } = cart, d = layout.sheets.col, fb = layout.sheets.base, bs = cart.bs;
  // the words always stay readable: where lamplight or dusk has dimmed the wall behind the lane,
  // that part of the wall keeps nearer its daylight colour
  const wallLum = (PAL_RGB[stoneOf(...rgb(PAL.wall).map((v, i) => v * light.tint[i] / 255))] || [255, 255, 255]).reduce((a, v, i) => a + v * [.299, .587, .114][i], 0) / 255;
  const protect = opts.laneX != null && wallLum < .78 ? clamp((.78 - wallLum) / .3) : 0;
  const rnd = mulberry32(5);
  const night = light.sky.night || 0;
  const lit = (c, t) => {
    if (t.view) return viewTone(c[0], c[1], c[2], night);
    const ax = t.x / bs + L.xMin, ay = t.y / bs + L.yMin, lt = lightAt(L, light, ax, ay);
    if (protect) {
      const k = protect * clamp((opts.laneX + opts.feather - t.x) / opts.feather);
      if (k > 0) lt.m = lt.m.map(v => lerp(v, 1, k));
    }
    return [Math.min(255, c[0] * lt.m[0] + lt.add[0]), Math.min(255, c[1] * lt.m[1] + lt.add[1]), Math.min(255, c[2] * lt.m[2] + lt.add[2])];
  };
  for (const t of layout.tiles) {
    if (t.k === 0 && !(opts.laneX != null && !t.view && t.x < opts.laneX)) { t.stone = INK_STONE; t.rgb = stoneRGB(INK_STONE, t.h); t.glass = false; continue; }
    const c = lit(sampleAvg(d, W, H, t.x, t.y, Math.max(1, t.l * .22)) || [200, 190, 170], t);
    const f = sampleAvg(fb, W, H, t.x, t.y, 1);
    const pick = t.view && (light.sky.night || 0) < .3 ? stoneOfDay : stoneOf;
    let stone = pick(c[0] | 0, c[1] | 0, c[2] | 0);
    if (f) {
      // a faint wash does not change the stone: keep the field's stone unless the colour really moves
      const fl = lit(f, t), fs = pick(fl[0] | 0, fl[1] | 0, fl[2] | 0), cl = toLab(c[0], c[1], c[2]), fp = PAL_LAB[fs];
      if (Math.hypot(cl[0] - fp[0], cl[1] - fp[1], cl[2] - fp[2]) < 11) stone = fs;
    }
    // behind the words the wall is laid calm: one stone, barely varied, over pale grout
    t.lane = opts.laneX != null && !t.view && t.x < opts.laneX + opts.feather * .5 && t.k >= 2;
    if (t.lane && f) {
      // the wall behind the words keeps its stone; a gentle wash of the place's light is all
      const fl = lit(f, t), base = stoneOf(...f.map(v => v | 0));
      stone = labDistLite(fl, base) < 16 ? base : pick(fl[0] | 0, fl[1] | 0, fl[2] | 0);
    }
    // outline stones behind the words soften to a mid grey so the type stays on top
    if (opts.laneX != null && !t.view && t.k === 0 && t.x < opts.laneX) { t.stone = SOFT_INK; t.rgb = stoneRGB(SOFT_INK, t.h); t.glass = false; continue; }
    t.stone = stone;
    t.rgb = stoneRGB(stone, t.lane ? .5 + (t.h - .5) * .35 : t.h);
    t.glass = !t.lane && GLASSY.has(stone) && rnd() < .3;
  }
}

/* ───────── laying stones on a canvas ───────── */
export const GROUT = '#3d362d', GROUT_LIGHT = '#d9cfb8', BED = '#a39479';
const q8 = new Float32Array(8);
export function stonePath(c, t, k, ox, oy, scale = 1) {
  const tt = scale === 1 ? t : { ...t, l: t.l * scale, w: t.w * scale };
  corners(tt, q8);
  c.beginPath(); c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
  for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
  c.closePath();
}
/** one stone: its colour, a lit upper edge and a shaded lower edge (the bevel of a cut cube) */
export function paintStone(c, t, col, k, ox = 0, oy = 0, glint = 0) {
  stonePath(c, t, k, ox, oy);
  c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; c.fill();
  const lw = Math.max(.6, k * .55), dark = col[0] + col[1] + col[2] < 170;
  c.lineWidth = lw;
  c.strokeStyle = dark ? 'rgba(255,248,230,.3)' : 'rgba(255,250,235,.22)';
  c.beginPath(); c.moveTo(q8[6] * k + ox, q8[7] * k + oy); c.lineTo(q8[0] * k + ox, q8[1] * k + oy); c.lineTo(q8[2] * k + ox, q8[3] * k + oy); c.stroke();
  c.strokeStyle = 'rgba(20,14,8,.22)';
  c.beginPath(); c.moveTo(q8[2] * k + ox, q8[3] * k + oy); c.lineTo(q8[4] * k + ox, q8[5] * k + oy); c.lineTo(q8[6] * k + ox, q8[7] * k + oy); c.stroke();
  if (t.glass || glint) {
    // glass catches a sliver of window light along one face
    const a = .18 + glint * .55;
    c.strokeStyle = `rgba(255,255,248,${a})`; c.lineWidth = Math.max(.8, k * .8);
    const mx = (q8[0] + q8[2]) / 2, my = (q8[1] + q8[3]) / 2, nx = (q8[6] + q8[0]) / 2, ny = (q8[7] + q8[1]) / 2;
    c.beginPath(); c.moveTo((nx * .6 + mx * .4) * k + ox, (ny * .6 + my * .4) * k + oy); c.lineTo((mx * .7 + nx * .3) * k + ox, (my * .7 + ny * .3) * k + oy); c.stroke();
  }
}
