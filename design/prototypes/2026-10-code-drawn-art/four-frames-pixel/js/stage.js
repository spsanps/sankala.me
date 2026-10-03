/* Four frames, pixel edition: the stage. Picks a whole-number pixel scale for the screen, lays the
   design square into a low-resolution frame, maps scroll to a position between the four places,
   and composites: the view (parallax layers sliding past like a side-scroller) → the room (its
   light changing by ordered dither) → the things (hopping off and dropping in with a bounce) →
   live details at ten frames a second. The frame is scaled up nearest-neighbour; the real
   photographs are drawn on top at full resolution, into their pixel frames. */
import { clamp, sceneDate, clockLabel, skyState, luminance } from './core.js';
import { Spr, C, bake, rgbOf } from './pix.js';
import { layout, openingOf, drawRoom, drawGlare, lightMap, lampMouth } from './scene.js';
import { VIEWS, skyPlacement } from './views.js';
import { eraObjects, ROBOT_EYES } from './objects.js';

export const ERAS = ['now', 'sd', 'blr', 'nitk'];
export const PLACE_NAMES = { now: 'San Jose', sd: 'San Diego', blr: 'Bengaluru', nitk: 'Surathkal' };
export const WIDE_QUERY = '(min-aspect-ratio: 29/20) and (min-width: 1000px)';

/* ───────── light for each place ───────── */
function eraLight(era, hour) {
  if (era === 'now') {
    const date = sceneDate(hour), st = skyState(date), el = st.sun.el;
    const state = el < -6 ? 'night' : el < 0 ? 'twilight' : el < 9 ? 'golden' : 'day';
    const morning = st.sun.el > 1 && st.sun.az > 40 && st.sun.az < 160;
    return {
      era, state, ambient: state, outdoor: state, sky: st, label: clockLabel(date),
      lit: state === 'golden' ? 'goldsun' : state === 'day' ? 'sun' : 'lamp',
      patch: (state === 'day' || state === 'golden') && morning ? 1 : 0, patchShift: clamp((st.sun.az - 90) / 60, -1, 1),
      lamp: state === 'night' || state === 'twilight', glow: state === 'night' ? 'glow' : null,
    };
  }
  if (era === 'sd') return { era, state: 'day', ambient: 'day', outdoor: 'day', lit: 'sun', patch: 1, patchShift: -.45, label: 'a clear morning' };
  if (era === 'blr') return { era, state: 'overcast', ambient: 'overcast', outdoor: 'overcast', lit: 'warmsun', patch: .6, patchShift: .6, label: 'late afternoon, before the rain' };
  return { era, state: 'night', ambient: 'night', outdoor: 'night', lit: 'lamp', lamp: true, glow: 'phosphor', label: 'after dark, by the sea' };
}

/* ───────── frame geometry ───────── */
/** Whole-number scale and the logical frame for a stage of w × h CSS px. */
function geometry(mode, w, h, dpr, laneRight) {
  const devW = Math.round(w * dpr), devH = Math.round(h * dpr);
  const L = layout(mode);
  let s;
  if (mode === 'wide') {
    s = Math.max(1, Math.round(devH / 282));
    // keep the art clear of the words: the design square must start right of the lane
    while (s > 1 && devW - L.W * s < (laneRight - 36) * dpr) s--;
  } else {
    // as large as the width allows, but never so large the shelf and window top are cut off
    s = Math.max(1, Math.min(Math.round(devW / L.W), Math.floor(devH / 200)));
  }
  const Cw = Math.ceil(devW / s), Rh = Math.ceil(devH / s);
  const ox = mode === 'wide' ? Cw - L.W : Math.round((Cw - L.W) / 2), oy = Rh - L.H;
  return { L, s, C: Cw, R: Rh, ox, oy, devW, devH, dpr };
}

/* ───────── building a place ───────── */
function buildEra(G, era, hour) {
  const { L, C: Cw, R: Rh, ox, oy } = G, light = eraLight(era, hour), o = openingOf(L);
  const objs = eraObjects(era, L);
  // light: window sun on the desk, the lamp's pool, a screen's spill
  const glows = [];
  if (light.glow) for (const ob of objs) if (ob.live === 'tokens' || ob.live === 'trace') glows.push({ x: ob.x + ox + Math.round(ob.spr.w / 2), y: L.desk.backY + oy + 4, rx: 22, ry: 7 });
  const map = lightMap(L, ox, oy, Cw, Rh, { patch: light.patch, patchShift: light.patchShift, lamp: light.lamp, glows });
  const lightAt = (x, y) => { if (x < 0 || y < 0 || x >= Cw || y >= Rh) return null; const v = map[y * Cw + x]; return v === 1 ? light.lit : v === 2 ? light.glow : null; };
  // the room
  const room = new Spr(Cw, Rh);
  drawRoom(room, L, ox, oy, era === 'now' || era === 'sd' ? 'us' : 'in');
  drawGlare(room, L, ox, oy);
  if (light.lamp) { const [mx, my] = lampMouth(L, ox, oy); for (const [dx, dy] of [[0, 0], [-1, 0], [1, -1], [-2, 1], [0, 1]]) room.set(mx + dx - 3, my + dy - 1, C('gold', 4)); }
  const roomCv = bake(room, light.ambient, lightAt);
  const roomImg = roomCv.getContext('2d').getImageData(0, 0, Cw, Rh);
  // the things
  // a thing takes one light for its whole sprite: whatever falls where it stands (no seams across it)
  const lightOf = ob => { if (ob.photo || ob.exit === 'board') return null; const bx = ob.x + ox + Math.round(ob.spr.w / 2), byy = ob.y + oy + ob.spr.h - 2; const l = lightAt(bx, byy); return l === light.glow ? null : l; };
  const things = objs.map(ob => {
    const lt = lightOf(ob), one = lt ? () => lt : null;
    const out = { ...ob, cv: bake(ob.spr, lt || light.ambient, null) };
    if (ob.lid) {
      const scrX = ob.x + 4, scrY = ob.y - ob.lid.open.h + 2;
      out.lidCv = {
        open: { cv: bake(ob.lid.open, lt || light.ambient, one), x: scrX, y: scrY },
        half: { cv: bake(ob.lid.half, lt || light.ambient, one), x: ob.x + 3, y: ob.y - ob.lid.half.h + 2 },
        closed: { cv: bake(ob.lid.closed, lt || light.ambient, one), x: ob.x, y: ob.y - 1 },
      };
      out.screen = [scrX + 3, scrY + 3, 34, 22];
    }
    return out;
  });
  // the view
  const sky = era === 'now' ? skyPlacement(o.w, o.h, light.sky) : null;
  const V = VIEWS[era](o.w, o.h, { state: light.outdoor, sky });
  const layers = V.layers.map(l => ({ depth: l.depth, cv: bake(l.spr, light.outdoor), em: l.emit ? bake(l.emit, 'day') : null }));
  const wall = rgbOf(light.ambient, C('wall', 3));
  return { era, light, room: roomCv, roomImg, things, layers, live: V.live, W: o.w, H: o.h, wallLum: luminance(wall) };
}

/* ───────── motion ───────── */
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const step2 = v => Math.round(v / 2) * 2;
function windowOf(ob, entering) {
  // when each kind of thing leaves (and arrives): prints first, then the shelf, desk, floor
  if (ob.exit === 'board') return entering ? [.3, .58] : [0, .26];
  if (ob.exit === 'up') return entering ? [.26, .54] : [.04, .3];
  if (ob.front) return entering ? [.5, .78] : [.1, .36];
  if (ob.heavy) return entering ? [.34, .62] : [.14, .4];
  return entering ? [.3, .58] : [.07, .34];
}
/** k: 0 = in place, 1 = gone. */
function goneK(ob, tau, entering) { const [a, b] = windowOf(ob, entering); return entering ? 1 - clamp((tau - a) / (b - a)) : clamp((tau - a) / (b - a)); }
function offsetFor(ob, k, entering, G) {
  if (k <= 0) return [0, 0];
  const far = G.C - (ob.x + G.ox) + 8, e = ease(k);
  if (ob.exit === 'board') return [step2(e * (far + 10)), step2(-Math.sin(k * Math.PI) * 10 - e * 14)];
  if (ob.exit === 'up') return entering ? [step2(e * far * .4), step2(-e * 70)] : [step2(e * far), step2(-Math.sin(Math.min(1, k * 1.6) * Math.PI) * 9)];
  if (ob.exit === 'roll' || ob.exit === 'slide') return [step2(e * far), 0];
  // a hop off (or onto) the desk
  return [step2(e * far), step2(-Math.abs(Math.sin(k * Math.PI * 2)) * 5)];
}
/** a little bounce after landing: three frames at 12 fps */
const BOUNCE = [-3, -1, 0, 1, 0];

/* ───────── compositing ───────── */
function render(st, t) {
  const G = st.G; if (!G) return;
  const fc = st.fc, x = st.fx, o = openingOf(G.L), OX = o.x + G.ox, OY = o.y + G.oy;
  const pos = clamp(st.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
  const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)], EA = st.eras[A], EB = st.eras[B];
  const inT = tau > 0 && tau < 1 && pos < 3 && !!EB;
  const tf = Math.floor(t * 10) / 10; // sprite time: ten frames a second
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, fc.width, fc.height);
  if (!EA) return;

  /* the view: four layers, each sliding a whole glass-width, the near ones leading */
  x.save(); x.beginPath(); x.rect(OX, OY, o.w, o.h); x.clip();
  const lag = [.3, .24, .17, .1];
  const eOf = d => inT ? ease(clamp((tau - lag[d]) / .56)) : 0;
  const liveA = liveLayers(EA, tf), liveB = inT ? liveLayers(EB, tf) : null;
  for (let d = 0; d < 4; d++) {
    const e = eOf(d), dxA = -Math.round(e * o.w), dxB = o.w - Math.round(e * o.w);
    drawLayer(x, EA, d, OX + dxA, OY, liveA);
    if (inT) drawLayer(x, EB, d, OX + dxB, OY, liveB);
  }
  x.restore();

  /* the room: its light changes the old way, a palette at a time, in four flat steps */
  const dz = inT ? clamp((tau - .36) / .28) : 0, stepI = Math.min(3, Math.floor(dz * 4));
  if (stepI === 0 || !EB) x.drawImage(EA.room, 0, 0);
  else if (stepI === 3) x.drawImage(EB.room, 0, 0);
  else x.drawImage(roomStep(st, EA, EB, stepI / 3), 0, 0);
  st.dominant = stepI >= 2 && EB ? EB : EA;

  /* the things */
  const prints = [], lives = [];
  const draw = (E, entering, front) => {
    for (const ob of E.things) {
      if (!!ob.front !== front) continue;
      const k = inT ? goneK(ob, tau, entering) : 0;
      if (k >= 1) continue;
      let [dx, dy] = offsetFor(ob, k, entering, G);
      // landing bounce
      const key = E.era + ':' + ob.id;
      if (entering && inT) { if (k <= 0 && st.landed[key] == null) st.landed[key] = t; if (k > 0) st.landed[key] = null; }
      if (!inT) st.landed[key] = null;
      if (entering && k <= 0 && st.landed[key] != null) { const f = Math.floor((t - st.landed[key]) * 12); if (f < BOUNCE.length) dy += BOUNCE[f]; }
      const X = ob.x + G.ox + dx, Y = ob.y + G.oy + dy;
      if (ob.lid) {
        // the screen folds shut in three frames before it leaves, and opens after it arrives
        const [a] = windowOf(ob, entering), lidT = entering ? clamp((tau - windowOf(ob, true)[1]) / .08) : clamp((tau - a + .02) / .08);
        const frame = !inT ? 'open' : entering ? (lidT >= 1 ? 'open' : lidT > .5 ? 'half' : 'closed') : (lidT <= 0 ? 'open' : lidT < .5 ? 'half' : 'closed');
        const lf = ob.lidCv[frame];
        x.drawImage(ob.cv, X, Y);
        x.drawImage(lf.cv, lf.x + G.ox + dx, lf.y + G.oy + dy);
        if (frame === 'open' && k <= 0 && ob.live) lives.push({ ob, E, X: dx, Y: dy });
        continue;
      }
      x.drawImage(ob.cv, X, Y);
      if (ob.photo) prints.push({ ob, E, X, Y });
      if (k <= 0 && ob.live) lives.push({ ob, E, X: dx, Y: dy });
    }
  };
  draw(EA, false, false); if (inT) draw(EB, true, false);
  draw(EA, false, true); if (inT) draw(EB, true, true);
  for (const lv of lives) drawLive(st, lv, tf);

  /* up to the screen, nearest neighbour; then the real photographs into their frames */
  const c = st.ctx, s = G.s;
  c.imageSmoothingEnabled = false;
  c.drawImage(fc, 0, 0, fc.width * s, fc.height * s);
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  for (const p of prints) drawPhoto(st, p, s);
}

/** The room between two places' light: every pixel moved the same fraction of the way, once. */
function roomStep(st, EA, EB, f) {
  const key = EA.era + '>' + EB.era + ':' + f.toFixed(2);
  st.steps = st.steps || {};
  if (st.steps[key]) return st.steps[key];
  const a = EA.roomImg.data, b = EB.roomImg.data, img = st.mixCtx.createImageData(st.fc.width, st.fc.height), D = img.data;
  for (let k = 0; k < D.length; k += 4) { D[k] = a[k] + (b[k] - a[k]) * f; D[k + 1] = a[k + 1] + (b[k + 1] - a[k + 1]) * f; D[k + 2] = a[k + 2] + (b[k + 2] - a[k + 2]) * f; D[k + 3] = a[k + 3]; }
  const cv = document.createElement('canvas'); cv.width = st.fc.width; cv.height = st.fc.height; cv.getContext('2d').putImageData(img, 0, 0);
  return (st.steps[key] = cv);
}

function liveLayers(E, tf) {
  if (!E.live) return null;
  const key = E.era + ':' + tf;
  if (E.liveKey === key) return E.liveOut;
  const W = E.W, H = E.H, sprs = { sky: new Spr(W, H), far: new Spr(W, H), mid: new Spr(W, H), near: new Spr(W, H), eSky: new Spr(W, H), eFar: new Spr(W, H), eMid: new Spr(W, H), eNear: new Spr(W, H) };
  E.live(tf, sprs);
  const out = {};
  for (const [k, s] of Object.entries(sprs)) { if (!s.d.some(v => v)) continue; out[k] = bake(s, k[0] === 'e' ? 'day' : E.light.outdoor); }
  E.liveKey = key; E.liveOut = out;
  return out;
}
const DEPTH_KEYS = [['sky', 'eSky'], ['far', 'eFar'], ['mid', 'eMid'], ['near', 'eNear']];
function drawLayer(x, E, d, X, Y, live) {
  const L = E.layers.find(l => l.depth === d); if (!L) return;
  x.drawImage(L.cv, X, Y);
  if (live && live[DEPTH_KEYS[d][0]]) x.drawImage(live[DEPTH_KEYS[d][0]], X, Y);
  if (L.em) x.drawImage(L.em, X, Y);
  if (live && live[DEPTH_KEYS[d][1]]) x.drawImage(live[DEPTH_KEYS[d][1]], X, Y);
}

function drawLive(st, { ob, E, X: dx, Y: dy }, tf) {
  const G = st.G, x = st.fx, light = E.light;
  if (ob.live === 'blink') {
    const cyc = (tf + 1.3) % 4.6; if (cyc > .3) return;
    const f = cyc < .1 || cyc > .2 ? 1 : 2; // half-shut, shut, half-shut
    const s = new Spr(ob.spr.w, ob.spr.h);
    for (const [ex, ey] of ROBOT_EYES) { const ax = ex - 1, ay = ey - 1; s.rect(ax, ay, 5, f === 2 ? 5 : 2, C('cobalt', 2)); s.hl(ax, ax + 4, ay + (f === 2 ? 3 : 2), C('cobalt', 0)); }
    x.drawImage(bake(s, light.ambient), ob.x + G.ox + dx, ob.y + G.oy + dy);
  } else if (ob.live === 'tokens') {
    const [sx, sy, w, h] = ob.screen, s = new Spr(w, h), cyc = (tf % 9) / 9, shown = cyc * 9;
    for (let r = 0; r < 6; r++) { const ind = r % 3 === 1 ? 3 : 0, full = 7 + (r * 13) % 15, part = Math.round(clamp(shown - r) * full); if (part > 0) s.hl(3 + ind, 3 + ind + part - 1, 20 - (5 - r) * 3 - 1, C(['red', 'mint', 'gold', 'sky', 'cream', 'leaf'][r], 3)); if (part > 0 && part < full && Math.floor(tf * 4) % 2) s.vl(3 + ind + part + 1, 20 - (5 - r) * 3 - 2, 20 - (5 - r) * 3, C('cream', 4)); }
    x.drawImage(bake(s, 'day'), sx + G.ox + dx, sy + G.oy + dy);
  } else if (ob.live === 'trace') {
    const [sx, sy, w, h] = ob.screen, s = new Spr(w, h), ph = (tf * .9) % 1, hi = 3, lo = 9;
    const lvl = u => Math.floor(u * 18 / 4) % 2 === 0 ? hi : lo;
    for (let i = 0; i < 5; i++) { const u = ph - i * .03; if (u < 0) break; const px = Math.floor(u * 18); s.set(px, lvl(u), C('mint', 4)); }
    x.drawImage(bake(s, 'day'), sx + G.ox + dx, sy + G.oy + dy);
  }
}

function drawPhoto(st, { ob, E, X, Y }, s) {
  const im = st.photos[ob.photo.key]; if (!im || !im.naturalWidth) return;
  const [px, py, pw, ph] = ob.photo.rect, c = st.ctx;
  const dx = (X + px) * s, dy = (Y + py) * s, dw = pw * s, dh = ph * s;
  // cover-crop the photograph to its frame
  const ar = dw / dh, iar = im.naturalWidth / im.naturalHeight;
  let sw = im.naturalWidth, sh = im.naturalHeight, sx = 0, sy = 0;
  if (iar > ar) { sw = sh * ar; sx = (im.naturalWidth - sw) / 2; } else { sh = sw / ar; sy = (im.naturalHeight - sh) / 2; }
  c.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
  // the room's light on the print
  const tint = { night: 'rgba(52,46,96,.5)', twilight: 'rgba(110,96,150,.32)', golden: 'rgba(255,214,160,.16)' }[E.light.ambient];
  if (tint) { c.save(); c.globalCompositeOperation = E.light.ambient === 'golden' ? 'soft-light' : 'multiply'; c.fillStyle = tint; c.fillRect(dx, dy, dw, dh); c.restore(); }
}

/* ───────── scroll → position ───────── */
function scrollPos(st) {
  const tall = st.G && st.G.L.mode === 'tall', vh = window.innerHeight;
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
  return Promise.all(Object.entries(urls).map(([k, src]) => new Promise(res => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = src; out[k] = im; }))).then(() => out);
}

function prepare(st, mode, w, h, dpr, laneRight) {
  st.G = geometry(mode, w, h, dpr, laneRight);
  const G = st.G;
  st.canvas.width = G.C * G.s; st.canvas.height = G.R * G.s;
  st.canvas.style.width = (G.C * G.s / dpr) + 'px'; st.canvas.style.height = (G.R * G.s / dpr) + 'px';
  st.ctx = st.canvas.getContext('2d');
  st.fc = document.createElement('canvas'); st.fc.width = G.C; st.fc.height = G.R; st.fx = st.fc.getContext('2d');
  st.mixCv = document.createElement('canvas'); st.mixCv.width = G.C; st.mixCv.height = G.R; st.mixCtx = st.mixCv.getContext('2d'); st.mixImg = st.mixCtx.createImageData(G.C, G.R);
  st.eras = {}; st.landed = {}; st.steps = {};
}

/**
 * Bring the pixel desk to life.
 *   canvas, stageEl, laneEl, sections (the four place sections), photos { key: url },
 *   hooks { t, hour, era, pos }, onChange({ place, label, text }), onTone('dim' | 'day'), onReady()
 */
export async function createStage({ canvas, stageEl, laneEl, sections, photos, hooks = {}, onChange, onTone, onReady }) {
  const st = { canvas, sections, eras: {}, pos: 0, landed: {} };
  let disposed = false, raf = 0, visible = true, lastF = -1, lastPos = -1, building = 0, resizeTimer = 0, lastCaption = '', lastTone = '';
  const t0 = performance.now(), wideMq = window.matchMedia(WIDE_QUERY);
  st.photos = await loadPhotos(photos);

  const caption = () => {
    const E = st.dominant; if (!E) return;
    const txt = E.era === 'now' ? `${PLACE_NAMES.now} · ${E.light.label}` : PLACE_NAMES[E.era];
    if (txt !== lastCaption) { lastCaption = txt; onChange?.({ place: PLACE_NAMES[E.era], label: E.light.label, text: txt }); }
    const tone = E.wallLum < .2 ? 'dim' : 'day';
    if (tone !== lastTone) { lastTone = tone; onTone?.(tone, st.G.L.mode); }
  };
  const frame = now => {
    raf = 0;
    if (disposed || document.hidden || !st.ready) return;
    const t = hooks.t != null ? hooks.t : (now - t0) / 1000;
    st.pos = hooks.pos != null ? hooks.pos : scrollPos(st);
    const f = Math.floor(t * 12);
    if (st.pos !== lastPos || f !== lastF || hooks.t != null) { render(st, t); lastF = f; lastPos = st.pos; caption(); }
    if (hooks.t == null && visible) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && st.ready && !disposed && !document.hidden && visible) raf = requestAnimationFrame(frame); };

  const build = async () => {
    const id = ++building, alive = () => !disposed && id === building;
    const r = stageEl.getBoundingClientRect(), mode = wideMq.matches ? 'wide' : 'tall';
    const w = Math.round(r.width), h = Math.round(r.height), dpr = Math.min(3, window.devicePixelRatio || 1);
    if (!w || !h) return;
    const laneRight = laneEl ? laneEl.getBoundingClientRect().right - r.left : 0;
    st.ready = false;
    prepare(st, mode, w, h, dpr, mode === 'wide' ? laneRight : 0);
    const first = hooks.era && ERAS.includes(hooks.era) ? hooks.era : hooks.pos != null ? ERAS[Math.min(3, Math.floor(hooks.pos))] : ERAS[Math.min(3, Math.round(scrollPos(st)))];
    st.eras[first] = buildEra(st.G, first, hooks.hour);
    if (hooks.pos != null && hooks.pos % 1 > 0) st.eras[ERAS[Math.min(3, Math.floor(hooks.pos) + 1)]] = buildEra(st.G, ERAS[Math.min(3, Math.floor(hooks.pos) + 1)], hooks.hour);
    st.ready = true; lastPos = -1; frame(performance.now()); onReady?.();
    for (const e of ERAS) {
      if (st.eras[e]) continue;
      if (hooks.t == null) await new Promise(res => window.requestIdleCallback ? window.requestIdleCallback(() => res(), { timeout: 500 }) : setTimeout(res, 40));
      if (!alive()) return;
      st.eras[e] = buildEra(st.G, e, hooks.hour);
    }
    if (hooks.t != null) { lastPos = -1; frame(performance.now()); }
    kick();
  };

  const onScroll = () => kick();
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!disposed) build(); }, 200); };
  const onVis = () => { if (!document.hidden) kick(); };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(stageEl);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVis);
  wideMq.addEventListener?.('change', onResize);
  await build();
  return { destroy() { disposed = true; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); } };
}

/** One still of a place, for the plain version and reduced motion. */
export async function paintStill({ canvas, mode, cssWidth, dpr = 1, era, hour, photos }) {
  const L = layout(mode), s = Math.max(1, Math.floor(cssWidth * dpr / L.W));
  const G = { L, s, C: L.W, R: L.H, ox: 0, oy: 0, dpr };
  const st = { canvas, G, eras: {}, pos: ERAS.indexOf(era), landed: {}, photos: await loadPhotos(photos) };
  canvas.width = L.W * s; canvas.height = L.H * s; canvas.style.width = (L.W * s / dpr) + 'px'; canvas.style.height = (L.H * s / dpr) + 'px';
  st.ctx = canvas.getContext('2d');
  st.fc = document.createElement('canvas'); st.fc.width = L.W; st.fc.height = L.H; st.fx = st.fc.getContext('2d');
  st.eras[era] = buildEra(G, era, hour);
  render(st, 0);
}
