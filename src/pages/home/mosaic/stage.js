/* The apse in mosaic: the live layer. Runs in a worker (worker.js, with the page's canvases
   transferred as OffscreenCanvases) or, where a browser can't, on the main thread in idle slices
   (live.js). Either way the page talks to it with the same messages.

   What it draws, over the stills the page painted first:
   - the conch. The still under it shows San Jose in the current moment. While that place is on
     screen the conch canvas stays transparent except for the stones that are moving (birds, the
     robot's blink, the cursor, the lamp, the stars), each painted over its own stone in the still.
     When the words scroll to another place, the conch is re-laid in a wave from its upper right, each
     stone turning over; the other places are opaque layers laid here, in the same stones as their stills.
   - the light (glint.js): every gold, silver, gem and glass stone of the wall (data shipped with the
     stills) and of the conch, lit from the pointer, a tilted phone or a slow drift.
   Laying runs in slices, so frames keep coming; nothing draws while the apse is off screen or the
   tab is hidden. */
import { layPlace, runSliced, WAVE_W, WAVE_J, waveAt, glintPack, decodeWallGlint, ARCH_PAL } from './build.js';
import { paintPlaceSteps, paintStone, clipConch } from './paint.js';
import { deskLive } from './desk.js';
import { createGlint } from './glint.js';
import { createCanvas } from './canvas.js';
import { mix, clamp } from './core.js';
import { RI, conchBox, FAMILIES } from './layout.js';

const css = col => `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
const MOMENT_WAVE = 2.4;   // seconds for the conch to turn over to a new moment of San Jose's day

export function createStage({ conchCanvas, glintCanvas, post = () => {}, pause, budget = 12, raf, now = () => performance.now() }) {
  const st = {
    family: null, F: 0, box: null, G: null, still: null, moment: null, pos: 0, places: [], laying: false, gen: 0,
    visible: true, hidden: false, glintOn: false, wall: null, light: null, target: null, pointerAt: -1e9, tilt: null,
    hooks: {}, frame: 0, lastLive: -1, lastPos: -1, lastLight: null, dirty: true, trans: null, perf: { t0: now() },
  };
  // drawn on the CPU (here, off the main thread): the compositor only receives finished frames, so the
  // GPU never has to fill tens of thousands of small paths in one go while the page scrolls
  const cc = conchCanvas.getContext('2d', { willReadFrequently: true });
  let glint = null, disposed = false;
  const t0 = now();
  const request = raf || (cb => setTimeout(() => cb(now()), 16));

  /* ───────── geometry ───────── */
  function setGeometry(G) {
    st.G = G;
    const box = st.box, cw = Math.max(1, Math.round((box.x1 - box.x0) * G.u * G.dpr)), ch = Math.max(1, Math.round((box.y1 - box.y0) * G.u * G.dpr));
    if (conchCanvas.width !== cw || conchCanvas.height !== ch) { conchCanvas.width = cw; conchCanvas.height = ch; }
    const s = cw / (box.x1 - box.x0);
    st.T = { s, x: -box.x0 * s, y: -box.y0 * s };
    for (const E of st.places) if (E) E.stale = true;            // repainted at the new size soon (layLoop); shown scaled meanwhile
    if (st.places.some(Boolean)) layLoop();
    if (glintCanvas) {
      const gw = Math.max(1, Math.round(G.glintW * G.gdpr)), gh = Math.max(1, Math.round(G.glintH * G.gdpr));
      if (glintCanvas.width !== gw || glintCanvas.height !== gh) { glintCanvas.width = gw; glintCanvas.height = gh; }
    }
    st.dirty = true; st.lastLight = null; kick();
  }

  /* ───────── laying ───────── */
  const placeAt = pos => clamp(Math.round(pos), 0, 3);
  function wanted() {
    const first = placeAt(st.pos), order = [first];
    for (const d of [1, -1, 2, -2, 3, -3]) { const i = first + d; if (i >= 0 && i < 4) order.push(i); }
    return order.filter(i => !st.places[i] || (i === 0 && st.places[0].moment !== st.moment));
  }
  const staleOne = () => { const first = placeAt(st.pos); return [first, first + 1, first - 1, first + 2, first - 2, first + 3, first - 3].find(i => st.places[i]?.stale); };
  /** paint a place's layer at the current size, a slice at a time */
  async function paintLayer(E) {
    const T = st.T, w = conchCanvas.width, h = conchCanvas.height, L = createCanvas(w, h), c = L.getContext('2d', { willReadFrequently: true });
    const gen = paintPlaceSteps(c, E, T);
    let start = now();
    for (let r = gen.next(); !r.done; r = gen.next()) if (now() - start > budget) { await pause(); if (disposed || st.T !== T) return false; start = now(); }
    if (st.T !== T) return false;
    E.layer = L; E.stale = false;
    return true;
  }
  async function layLoop() {
    if (st.laying) return;
    st.laying = true;
    const gen = st.gen;
    try {
      for (;;) {
        if (disposed || gen !== st.gen) return;
        const next = wanted()[0];
        if (next == null) {
          // nothing left to lay: repaint any layer left at an old size
          const k = staleOne(); if (k == null) return;
          if (await paintLayer(st.places[k])) { st.dirty = true; kick(); }
          await pause();
          continue;
        }
        const t = now();
        const E = await runSliced(layPlace(st.family, next, next === 0 ? st.moment : undefined), { budget, pause, alive: () => !disposed && gen === st.gen });
        if (!E) return;
        // its layer, painted now in slices, so the first wave to it never stalls
        // (San Jose in the still's moment needs none: the still under the canvas is its picture)
        if (!(next === 0 && E.moment === st.still)) { if (!await paintLayer(E)) E.stale = true; }
        if (disposed || gen !== st.gen) return;
        E.layMs = Math.round(now() - t);
        if (next === 0 && st.places[0] && st.places[0].moment !== E.moment && showing(0)) st.trans = { from: st.places[0], to: E, t0: now() };
        else if (next === 0 && !st.places[0] && E.moment !== st.still && showing(0)) st.trans = { from: null, to: E, t0: now() };
        st.places[next] = E;
        if (glint) glint.upload('place' + next, glintPack(E.stones, E.q, E.panel, true));
        post({ type: 'laid', index: next, moment: E.moment, ms: E.layMs, at: Math.round(now() - st.perf.t0) });
        st.dirty = true; kick();
        await pause();
      }
    } finally { st.laying = false; }
  }
  const showing = i => Math.abs(st.pos - i) < .5;

  /* ───────── the conch ───────── */
  const isStill = E => E && E.index === 0 && E.moment === st.still;
  /** a place's painted layer; if it isn't painted (or is at an old size) yet, paint it now in one go */
  function layerOf(E) {
    if (!E.layer) {
      const L = createCanvas(conchCanvas.width, conchCanvas.height), g = paintPlaceSteps(L.getContext('2d', { willReadFrequently: true }), E, st.T, Infinity);
      while (!g.next().done);
      E.layer = L; E.stale = false;
    }
    return E.layer;
  }
  /** draw a layer: at an old size it is drawn scaled until its repaint is ready */
  const drawLayer = (c, E) => { const L = layerOf(E); if (L.width === conchCanvas.width && L.height === conchCanvas.height) c.drawImage(L, 0, 0); else c.drawImage(L, 0, 0, conchCanvas.width, conchCanvas.height); };
  function liveStones(E, time, c) {
    const T = st.T, kk = T.s / E.q, ox = E.panel.x0 * T.s + T.x, oy = E.panel.y0 * T.s + T.y;
    const F = E.place.frameState(time, E.L, E.A);
    for (const s of E.live) {
      let col = null;
      if (s.liveKind) col = deskLive(s, F);
      if (!col && (s.kind || s.star)) col = E.place.liveColour(s, F, E.L);
      if (col) paintStone(c, s, col, kk, ox, oy);
    }
  }
  /** a fingerprint of the moving stones' colours at `time`: when it hasn't changed, the frame is skipped */
  function liveSignature(E, time) {
    const F = E.place.frameState(time, E.L, E.A);
    let h = 0;
    for (let i = 0; i < E.live.length; i++) {
      const s = E.live[i];
      let col = s.liveKind ? deskLive(s, F) : null;
      if (!col && (s.kind || s.star)) col = E.place.liveColour(s, F, E.L);
      if (col) h = (Math.imul(h ^ (i + 1), 2654435761) + ((col[0] | 0) << 16 | (col[1] | 0) << 8 | (col[2] | 0))) | 0;
    }
    return h;
  }
  function full(E, time) {
    if (!isStill(E)) drawLayer(cc, E);
    liveStones(E, time, cc);
  }
  /** the wave from A to B at fraction tau; A may be the still (left transparent) */
  function wave(A, B, tau) {
    const c = cc, T = st.T, F = st.F;
    const fw = -WAVE_J + tau * (1 + 2 * WAVE_J + WAVE_W);
    const toDev = ([ux, uy]) => [T.x + ux * T.s, T.y + uy * T.s];
    const box = [[-RI - 8, -RI - 8], [RI + 8, -RI - 8], [RI + 8, F + 8], [-RI - 8, F + 8]];
    const half = (pts, a, keepBelow) => {
      const f = ([x, y]) => (waveAt(x, y, F) - a) * (keepBelow ? 1 : -1), out = [];
      for (let k = 0; k < pts.length; k++) {
        const p = pts[k], q = pts[(k + 1) % pts.length], fp = f(p), fq = f(q);
        if (fp <= 0) out.push(p);
        if ((fp <= 0) !== (fq <= 0)) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
      }
      return out;
    };
    const poly = pts => { if (pts.length < 3) return false; c.beginPath(); pts.map(toDev).forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); return true; };
    if (A && !isStill(A)) drawLayer(c, A);
    c.save(); if (poly(half(box, fw - WAVE_W - WAVE_J - .012, true))) { c.clip(); drawLayer(c, B); } c.restore();
    const lo = fw - WAVE_W - WAVE_J - .03, hi = fw + WAVE_J + .03;
    c.save();
    if (poly(half(half(box, hi, true), lo, false))) {
      c.clip();
      clipConch(c, F, T); c.fillStyle = css(ARCH_PAL.grout); c.fill();
      for (const E of [A, B]) {
        if (!E) continue;
        const isA = E === A, S = E.stones, kk = T.s / E.q, ox = E.panel.x0 * T.s + T.x, oy = E.panel.y0 * T.s + T.y;
        let a = 0, b = S.length; while (a < b) { const m = (a + b) >> 1; if (S[m].w8 < lo - .02) a = m + 1; else b = m; }
        for (let k = a; k < S.length && S[k].w8 <= hi + .02; k++) {
          const t = S[k], u = clamp((fw - t.w8) / WAVE_W);
          const sq = isA ? (u < .5 ? Math.cos(u * Math.PI) : 0) : (u > .5 ? -Math.cos(u * Math.PI) : 0);
          if (sq <= .02) continue;
          paintStone(c, t, mix(t.col, [30, 26, 22], (1 - sq) * .3), kk, ox, oy, sq < .98, sq);
        }
      }
    }
    c.restore();
    return fw;
  }
  function render(time) {
    if (!st.T) return;
    const c = cc;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, conchCanvas.width, conchCanvas.height);
    st.waveState = null; st.shown = [];
    const pos = clamp(st.pos, 0, 3);
    // a new moment of San Jose's day, turning over while it is on screen
    if (st.trans) {
      const tau = clamp((now() - st.trans.t0) / 1000 / MOMENT_WAVE);
      if (!showing(0) || tau >= 1) st.trans = null;
      else { const fw = wave(st.trans.from, st.trans.to, tau); st.waveState = { a: 'place0', b: 'place0', fw }; st.shown = [0]; return; }
    }
    const i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i, A = st.places[i], B = st.places[i + 1];
    if (tau > .001 && tau < .999 && (A || i === 0) && B) {
      const fw = wave(A, B, tau);
      st.waveState = { a: i, b: i + 1, fw };
      return;
    }
    // at rest: the place in view, or the nearest one laid; nothing (the still) if none is
    const target = placeAt(pos);
    let E = st.places[target];
    if (!E) for (const d of [1, -1, 2, -2, 3, -3]) { const k = target + d; if (st.places[k] && (k !== 0 || target === 0)) { E = st.places[k]; break; } }
    if (E) { full(E, time); st.shown = [E.index]; }
  }

  /* ───────── the light ───────── */
  function lightAt(time) {
    const G = st.G, R = 546 * G.u, mid = [G.cx, G.cy - R * .35];
    const drift = [G.cx + R * .8 * Math.sin(time * .11 - .4), G.cy - R * .5 + R * .3 * Math.sin(time * .083 - .6)];
    let target = drift, moving = true;
    if (st.hooks.light) { target = [G.glintW * st.hooks.light[0], G.glintH * st.hooks.light[1]]; moving = false; }
    else if (st.tilt) target = [G.glintW * clamp(.5 + st.tilt[0] / 50, -.1, 1.1), G.glintH * clamp(.4 + st.tilt[1] / 60, -.1, 1.1)];
    else if (st.target && now() - st.pointerAt < 9000) target = [mid[0] + (st.target[0] - mid[0]) * 1.15, mid[1] + (st.target[1] - mid[1]) * 1.15];
    if (!st.light || st.hooks.t != null) st.light = target.slice();
    else { st.light[0] += (target[0] - st.light[0]) * .07; st.light[1] += (target[1] - st.light[1]) * .07; }
    return { at: st.light, moving };
  }
  function drawGlint(time, force) {
    if (!glint || !st.glintOn || !st.G) return false;
    const G = st.G, d = G.gdpr, { at } = lightAt(time);
    const moved = !st.lastLight || Math.hypot(at[0] - st.lastLight[0], at[1] - st.lastLight[1]) > .3;
    if (!force && !moved && !st.waveState && !st.hadWave) return false;
    // the slow drift (no pointer, no tilt) needs no more than 30 frames a second
    const driving = st.tilt || (st.target && now() - st.pointerAt < 9000);
    if (!force && !driving && !st.waveState && now() - (st.glintAt || 0) < 32) return false;
    st.glintAt = now();
    st.hadWave = !!st.waveState; st.lastLight = at.slice();
    const draws = [{ key: 'wall' }];
    const w8 = st.waveState;
    if (w8 && w8.a !== 'place0') { draws.push({ key: 'place' + w8.a, mode: 1, hi: w8.fw }); draws.push({ key: 'place' + w8.b, mode: 2, lo: w8.fw - WAVE_W }); }
    else for (const k of st.shown) draws.push({ key: 'place' + k });
    const R = 546 * G.u;
    glint.draw([at[0] * d, at[1] * d, R * 1.45 * d], [G.cx * d, (G.cy - R * .3) * d, G.glintW * 2.4 * d], [G.u * d, G.cx * d, G.cy * d], G.minX * d, draws, st.hooks.noGlint ? 0 : 1);
    return true;
  }

  /* ───────── frames ───────── */
  let pending = false;
  function kick() { if (!pending && !disposed && st.visible && !st.hidden && st.G && st.hooks.t == null) { pending = true; request(frame); } }
  function frame() {
    pending = false;
    if (disposed || !st.visible || st.hidden) return;
    const n = now(), time = (n - t0) / 1000;
    const a = n;
    const liveDue = time - st.lastLive > 1 / 15;
    let draw = st.dirty || st.pos !== st.lastPos || st.trans;
    if (!draw && liveDue) {
      // at rest: redraw only when a moving stone has changed (a bird crossing, a blink, the cursor)
      st.lastLive = time;
      const E = st.shown.length === 1 ? st.places[st.shown[0]] : null, sig = E ? liveSignature(E, time) : 0;
      if (!E || sig !== st.lastSig) { draw = true; st.lastSig = sig; }
    }
    if (draw) { render(time); st.lastLive = time; st.lastPos = st.pos; st.dirty = false; }
    drawGlint(time);
    const ms = now() - a;
    if (st.perf.frames) { st.perf.frames.push(ms); if (st.perf.frames.length > 600) st.perf.frames.shift(); }
    kick();
  }

  /* ───────── messages ───────── */
  function handle(msg) {
    switch (msg.type) {
      case 'init': {
        st.family = msg.family; st.F = FAMILIES[msg.family].F; st.box = conchBox(st.F);
        st.still = msg.still; st.moment = msg.moment; st.pos = msg.pos || 0; st.hooks = msg.hooks || {};
        st.perf.frames = msg.perf ? [] : null;
        setGeometry(msg.geometry);
        layLoop();
        break;
      }
      case 'geometry': setGeometry(msg.geometry); break;
      case 'pos': if (msg.pos !== st.pos) { st.pos = msg.pos; if (wanted()[0] === placeAt(st.pos)) layLoop(); kick(); } break;
      case 'pointer': st.target = msg.at; st.pointerAt = now(); kick(); break;
      case 'tilt': st.tilt = msg.at; kick(); break;
      case 'visible': st.visible = msg.on; kick(); break;
      case 'hidden': st.hidden = msg.on; kick(); break;
      case 'moment': if (msg.moment !== st.moment) { st.moment = msg.moment; layLoop(); } break;
      case 'wall': st.wall = decodeWallGlint(msg.buffer); if (glint) glint.upload('wall', st.wall); kick(); break;
      case 'glint': {
        if (msg.on && !glint && glintCanvas) {
          glint = createGlint(glintCanvas);
          if (glint) { if (st.wall) glint.upload('wall', st.wall); st.places.forEach((E, i) => E && glint.upload('place' + i, glintPack(E.stones, E.q, E.panel, true))); }
          post({ type: 'glint', ok: !!glint });
        }
        st.glintOn = !!msg.on && !!glint; st.lastLight = null;
        if (!st.glintOn && glint) glint.clear();
        kick();
        break;
      }
      case 'render': {   // review hook: draw one moment now (?t=)
        if (msg.pos != null) st.pos = msg.pos;
        if (msg.light) st.hooks.light = msg.light;
        render(msg.t || 0); drawGlint(msg.t || 0, true);
        post({ type: 'rendered', id: msg.id });
        break;
      }
      case 'perf': post({ type: 'perf', frames: st.perf.frames ? st.perf.frames.slice() : null, places: st.places.map(E => E ? E.layMs : null) }); break;
      case 'destroy': disposed = true; st.gen++; if (glint) glint.clearAll(); break;
      default: break;
    }
  }
  return { handle };
}
