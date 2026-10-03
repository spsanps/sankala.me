/* Arched window mosaic: the stage.
   The frame (marble, a gold row, the sill, the dissolving edge) is laid once. Each place's view
   and still life is its own layer, laid in the window when first needed. Scrolling moves between
   places: the frame and sill stay, and the window is re-laid in a wave from the upper right, each
   stone turning over to show the next place. Stones never move; the living details re-colour a
   few of them. */
import { mix, clamp, smooth, mulberry32, hash2 } from './core.js';
import { PANEL, FIT, IN_X0, IN_X1, SILL, SILL_B, innerPath, sillPath } from './geom.js';
import { laySteps, corners } from './lay.js';
import { FRAME_PAL, frameRegions, FRAME_OUTLINES, finishFrame, looseStones, bedPath, groutPath } from './frame.js';
import sanjose from './places/sanjose.js';
import sandiego from './places/sandiego.js';
import bengaluru from './places/bengaluru.js';
import surathkal from './places/surathkal.js';

export const PLACES = [sanjose, sandiego, bengaluru, surathkal];
export const WIDE_QUERY = '(min-aspect-ratio: 29/20) and (min-width: 1000px)';
const SHEET_STONE = 6;
const WIN = { x0: IN_X0 - 4, y0: 64, x1: IN_X1 + 4, y1: SILL + 2 };   // the window's box, in units
const q8 = new Float32Array(8);

function placePanel(mode, stageEl, laneEl, header) {
  const r = stageEl.getBoundingClientRect(), w = r.width, h = r.height, CAP = 30;
  let area;
  if (mode === 'wide') {
    const laneRight = laneEl.getBoundingClientRect().right - r.left;
    const top = Math.max(16, header ? header.getBoundingClientRect().bottom - r.top + 4 : 16);
    area = { x: laneRight + 40, y: top, w: w - laneRight - 40 - 30, h: h - top - 14 - CAP };
  } else area = { x: 14, y: 8, w: w - 28, h: h - 8 - CAP - 4 };
  const k = Math.min(area.w / FIT.w, area.h / FIT.h);
  const ox = area.x + (area.w - FIT.w * k) / 2 - FIT.x0 * k, oy = area.y + (area.h - FIT.h * k) / 2 - FIT.y0 * k;
  return { k, ox, oy, stageW: w, stageH: h };
}

function shade(col, h, h2, amt = .085) {
  const f = 1 + (h - .5) * amt, tilt = (h2 - .5) * 7;
  return [clamp(col[0] * f + tilt, 0, 255), clamp(col[1] * f, 0, 255), clamp(col[2] * f - tilt, 0, 255)];
}
/* paint one stone; `squash` narrows it across its width (a stone turning over) */
function paintStone(c, t, col, k, ox, oy, glint = 0, flat = false, squash = 1) {
  if (squash < 1) {
    const tt = { ...t, w: t.w * Math.max(.04, squash), j: t.j }; corners(tt, q8);
  } else corners(t, q8);
  c.beginPath();
  c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
  for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
  c.closePath();
  c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; c.fill();
  if (flat) return;
  const lw = Math.max(.7, k * .5), dark = col[0] + col[1] + col[2] < 200;
  c.lineWidth = lw;
  c.strokeStyle = dark ? 'rgba(255,250,236,.2)' : 'rgba(255,253,244,.32)';
  c.beginPath(); c.moveTo(q8[6] * k + ox, q8[7] * k + oy); c.lineTo(q8[0] * k + ox, q8[1] * k + oy); c.lineTo(q8[2] * k + ox, q8[3] * k + oy); c.stroke();
  c.strokeStyle = 'rgba(40,30,18,.16)';
  c.beginPath(); c.moveTo(q8[2] * k + ox, q8[3] * k + oy); c.lineTo(q8[4] * k + ox, q8[5] * k + oy); c.lineTo(q8[6] * k + ox, q8[7] * k + oy); c.stroke();
  if (glint > .02) {
    c.strokeStyle = `rgba(255,255,250,${Math.min(.85, glint)})`; c.lineWidth = Math.max(.9, k * .7);
    const mx = (q8[0] + q8[2]) / 2, my = (q8[1] + q8[3]) / 2, nx = (q8[6] + q8[0]) / 2, ny = (q8[7] + q8[1]) / 2;
    c.beginPath(); c.moveTo((nx * .55 + mx * .45) * k + ox, (ny * .55 + my * .45) * k + oy); c.lineTo((mx * .75 + nx * .25) * k + ox, (my * .75 + ny * .25) * k + oy); c.stroke();
  }
}
const grouted = (t, gr) => ({ ...t, l: t.l + t.s * .2, w: t.w + t.s * .2 });

/* where a stone sits in the re-laying wave: 0 at the window's upper right, 1 at its lower left */
const WAVE_D = (IN_X1 - IN_X0) + 930 * .55;
const waveAt = (ux, uy) => ((IN_X1 - ux) + (uy - 70) * .55) / WAVE_D;
const WAVE_W = .16, WAVE_J = .05;

/* clip a polygon by the half-plane where waveAt(x, y) <= a (in units) */
function halfPlane(pts, a, keepBelow) {
  const f = ([x, y]) => (waveAt(x, y) - a) * (keepBelow ? 1 : -1), out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], qq = pts[(i + 1) % pts.length], fp = f(p), fq = f(qq);
    if (fp <= 0) out.push(p);
    if ((fp <= 0) !== (fq <= 0)) { const t = fp / (fp - fq); out.push([p[0] + (qq[0] - p[0]) * t, p[1] + (qq[1] - p[1]) * t]); }
  }
  return out;
}
const WIN_PTS = [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];

async function runSliced(gen, alive) {
  let res = gen.next(), start = performance.now();
  while (!res.done) {
    if (performance.now() - start > 14) { await new Promise(r => setTimeout(r, 0)); if (!alive()) return null; start = performance.now(); }
    res = gen.next();
  }
  return res.value;
}

/** Lay and set the window on `canvas`. Returns { destroy }. */
export async function createStage({ canvas, stageEl, laneEl, sections, header, captionEl, hooks = {}, still = false, onChange, onReady }) {
  let disposed = false, raf = 0, building = 0, resizeTimer = 0, visible = true, lastT = -1, lastPos = -1, lastKey = '';
  const st = { canvas, ctx: canvas.getContext('2d'), eras: [], pos: 0 };
  const t0 = performance.now(), wideMq = matchMedia(WIDE_QUERY);

  const scrollPos = () => {
    if (hooks.pos != null) return hooks.pos;
    const tall = !wideMq.matches, vh = innerHeight;
    const ref = scrollY + vh * (tall ? .78 : .52), span = vh * (tall ? .3 : .42);
    const tops = sections.map(s => s.getBoundingClientRect().top + scrollY);
    let pos = 0;
    for (let k = 1; k < tops.length; k++) { const a = tops[k] - span, b = tops[k]; if (ref >= b) pos = k; else if (ref > a) { pos = k - 1 + (ref - a) / span; break; } else break; }
    return clamp(pos, 0, 3);
  };

  /* one place's layer: the view and still life, laid and set in the window's box */
  async function buildEra(i, G, alive) {
    if (st.eras[i] || st.eras[i] === 'pending') return;
    st.eras[i] = 'pending';
    const place = PLACES[i], L = place.light(hooks.hour), regions = place.regions(L);
    const res = await runSliced(laySteps(regions, place.outlines, { W: G.W, H: G.H, q: G.q, s: SHEET_STONE, seed: 23 + i * 17 }), alive);
    if (!res) { st.eras[i] = undefined; return; }
    const stones = res.stones, P = L.pal, live = [];
    for (const t of stones) {
      t.ux = t.x / G.q + PANEL.x0; t.uy = t.y / G.q + PANEL.y0;
      t.w8 = clamp(waveAt(t.ux, t.uy) + (hash2(t.x * 7 | 0, t.y * 7 | 0, 5) - .5) * 2 * WAVE_J, -WAVE_J, 1 + WAVE_J);
      if (t.k === 0) { t.col = shade(P.outline || FRAME_PAL.outline, t.h, t.h2, .12); continue; }
      const r = regions[t.reg];
      t.col = shade(r.fill(t.ux, t.uy), t.h, t.h2, r.group === 'still' ? .06 : .085);
      t.kind = place.liveKind(t, r, L);
      t.star = place.isStar(r, L, t, t.uy);
      if (place.edgeOf) t.edge = place.edgeOf(r, t.ux, t.uy);
      t.glass = (t.kind === 'sun' && t.h2 > .62) || (r.name === 'sky' && !L.night && t.h2 > .975 && t.uy < 520);
      if (t.kind || t.glass || t.star) live.push(t);
    }
    // the layer: grout bed in the window, the joints tinted by their stones, then the stones
    const cv = document.createElement('canvas'); cv.width = G.winW; cv.height = G.winH;
    const c = cv.getContext('2d'), gr = FRAME_PAL.grout;
    c.save(); c.setTransform(G.k * G.dpr, 0, 0, G.k * G.dpr, G.unitX - G.winX, G.unitY - G.winY); c.beginPath(); innerPath(c); c.restore();
    c.save(); c.clip(); c.fillStyle = `rgb(${mix(gr, P.skyMid || gr, .25).map(v => v | 0).join(',')})`; c.fillRect(0, 0, cv.width, cv.height);
    const ox = G.offX - G.winX, oy = G.offY - G.winY;
    for (const t of stones) paintStone(c, grouted(t), mix(gr, t.col, .42), G.kk, ox, oy, 0, true);
    for (const t of stones) paintStone(c, t, t.col, G.kk, ox, oy, t.glass ? .22 : 0);
    c.restore();
    const sorted = stones.slice().sort((a, b) => a.w8 - b.w8);
    if (!alive()) { st.eras[i] = undefined; return; }
    st.eras[i] = { cv, stones: sorted, live, L, place, bed: mix(gr, P.skyMid || gr, .25), ox, oy };
  }

  const build = async () => {
    const id = ++building, alive = () => !disposed && id === building;
    const mode = wideMq.matches ? 'wide' : 'tall', dpr = Math.min(2, devicePixelRatio || 1);
    const Pp = placePanel(mode, stageEl, laneEl, header);
    if (Pp.k * 1000 < 60) return;
    st.ready = false; st.eras = [];
    canvas.width = Math.round(Pp.stageW * dpr); canvas.height = Math.round(Pp.stageH * dpr);
    // stones across the arch: about one every 6 css px, between 72 and 126
    const across = clamp(Math.round(Pp.k * 1000 / 6.1), 72, 126), q = across * SHEET_STONE / 1000, su = SHEET_STONE / q;
    const G = { k: Pp.k, dpr, q, su, W: Math.ceil(PANEL.w * q), H: Math.ceil(PANEL.h * q), kk: Pp.k * dpr / q,
      unitX: Pp.ox * dpr, unitY: Pp.oy * dpr, offX: (Pp.ox + PANEL.x0 * Pp.k) * dpr, offY: (Pp.oy + PANEL.y0 * Pp.k) * dpr };
    G.winX = Math.floor(G.unitX + WIN.x0 * Pp.k * dpr); G.winY = Math.floor(G.unitY + WIN.y0 * Pp.k * dpr);
    G.winW = Math.ceil((WIN.x1 - WIN.x0) * Pp.k * dpr) + 2; G.winH = Math.ceil((WIN.y1 - WIN.y0) * Pp.k * dpr) + 2;
    st.G = G; st.P = Pp;
    const toPx = (ux, uy) => [G.unitX + ux * G.k * dpr, G.unitY + uy * G.k * dpr];

    /* the frame */
    const fr = frameRegions(), rnd = mulberry32(5);
    const fres = await runSliced(laySteps(fr, FRAME_OUTLINES, { W: G.W, H: G.H, q, s: SHEET_STONE, seed: 11 }), alive);
    if (!fres) return;
    const kept = finishFrame(fres.stones, fr, q, su, rnd), loose = looseStones(q, su, rnd, kept.slice());
    const fc = document.createElement('canvas'); fc.width = canvas.width; fc.height = canvas.height;
    const c = fc.getContext('2d');
    // the setting bed, soft-edged, and a few trowel marks in it
    c.save(); c.filter = `blur(${Math.max(1, 3 * dpr * G.k)}px)`; bedPath(c, toPx); c.fillStyle = `rgba(${FRAME_PAL.bed.join(',')},.6)`; c.fill(); c.restore();
    c.save(); bedPath(c, toPx); c.clip(); c.strokeStyle = 'rgba(150,138,116,.08)'; c.lineWidth = Math.max(1, 1.1 * dpr);
    for (let i = 0; i < 8; i++) { const r0 = 512 + rnd() * 40, a0 = Math.PI * 1.08 + rnd() * Math.PI * .84, a1 = a0 + .08 + rnd() * .14; c.beginPath(); for (let a = a0; a < a1; a += .01) { const [px, py] = toPx(500 + r0 * Math.cos(a), 500 + r0 * Math.sin(a)); a === a0 ? c.moveTo(px, py) : c.lineTo(px, py); } c.stroke(); }
    c.restore();
    // a soft shadow under the sill
    c.save(); const [sx0, sy0] = toPx(-30, SILL_B), [sx1, sy1] = toPx(1030, SILL_B + 18); const g = c.createLinearGradient(0, sy0, 0, sy1); g.addColorStop(0, 'rgba(70,52,30,.2)'); g.addColorStop(1, 'rgba(70,52,30,0)'); c.fillStyle = g; c.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0); c.restore();
    // grout under the laid frame and the sill, then the stones
    c.fillStyle = `rgb(${FRAME_PAL.grout.join(',')})`;
    groutPath(c, toPx, su); c.fill();
    c.save(); c.setTransform(G.k * dpr, 0, 0, G.k * dpr, G.unitX, G.unitY); c.beginPath(); sillPath(c); c.fill(); c.restore();
    for (const t of [...kept, ...loose]) paintStone(c, grouted(t), mix(FRAME_PAL.grout, t.col, t.loose ? .25 : .42), G.kk, G.offX, G.offY, 0, true);
    for (const t of [...kept, ...loose]) paintStone(c, t, shade(t.col, t.h, t.h2, t.gold ? .14 : .07), G.kk, G.offX, G.offY, t.gold ? .25 : 0);
    st.frame = fc; st.gold = [...kept, ...loose].filter(t => t.gold);
    for (const t of st.gold) t.col = shade(t.col, t.h, t.h2, .14);
    if (!alive()) return;

    /* the places: the one in view first, then the rest */
    const first = Math.min(3, Math.round(hooks.era != null ? hooks.era : scrollPos()));
    const need = hooks.all ? [0, 1, 2, 3] : hooks.pos != null ? [Math.floor(hooks.pos), Math.min(3, Math.ceil(hooks.pos))] : [first];
    for (const i of need) { await buildEra(i, G, alive); if (!alive()) return; }
    st.ready = true; lastPos = -1; lastKey = '';
    render(hooks.t != null ? hooks.t : 0, true);
    onReady?.(PLACES[0].light(hooks.hour));
    if (hooks.t == null) {
      for (const i of [first + 1, first - 1, first + 2, first - 2, first + 3, first - 3]) if (i >= 0 && i < 4) { await buildEra(i, G, alive); if (!alive()) return; }
      lastPos = -1; kick();
    }
  };

  function caption(E, P) {
    const key = E.place.key + E.L.caption;
    if (key !== lastKey) {
      lastKey = key;
      onChange?.({ place: E.place.place, caption: E.L.caption, alt: E.place.alt(E.L), L: E.L, key: E.place.key });
      if (captionEl) {
        captionEl.textContent = E.L.caption;
        const yb = P.oy + (SILL_B + 12) * P.k;
        captionEl.style.left = (P.ox - 40 * P.k) + 'px'; captionEl.style.top = yb + 'px'; captionEl.style.width = (1080 * P.k) + 'px';
      }
    }
  }

  function drawLive(E, time) {
    const c = st.ctx, G = st.G, F = E.place.frameState(time, E.L);
    for (const s of E.live) {
      let col = E.place.liveColour(s, F, E.L), g = 0;
      if (s.glass) g = .18 + .6 * Math.max(0, Math.sin(time * .5 + s.h * 23)) ** 14;
      if (col || g) paintStone(c, s, col || s.col, G.kk, G.offX, G.offY, g);
    }
  }
  function drawGold(time) {
    const c = st.ctx, G = st.G;
    for (const s of st.gold) {
      const g = Math.max(0, Math.sin(time * .4 - (s.ux + s.uy) * .006 + s.h * 1.5)) ** 18;
      if (g > .06) paintStone(c, s, mix(s.col, [255, 244, 200], g * .35), G.kk, G.offX, G.offY, g * .9);
    }
  }

  function render(time, force) {
    const c = st.ctx, G = st.G; if (!st.frame || !G) return;
    const pos = clamp(st.pos = scrollPos(), 0, 3);
    let i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
    if (still) { i = Math.min(3, Math.round(pos)); tau = 0; }
    const A = st.eras[i], B = st.eras[Math.min(3, i + 1)];
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(st.frame, 0, 0);
    const okA = A && A !== 'pending', okB = B && B !== 'pending';
    const settled = tau < .001 || tau > .999 || !okA || !okB;
    if (settled) {
      const E = tau > .999 && okB ? B : okA ? A : okB ? B : null;
      if (E) { c.drawImage(E.cv, G.winX, G.winY); caption(E, st.P); if (!(still && hooks.t == null)) drawLive(E, time); }
    } else {
      const fw = -WAVE_J + tau * (1 + 2 * WAVE_J + WAVE_W);
      c.drawImage(A.cv, G.winX, G.winY);
      const toDev = ([ux, uy]) => [G.unitX + ux * G.k * G.dpr, G.unitY + uy * G.k * G.dpr];
      const poly = pts => { if (pts.length < 3) return false; c.beginPath(); pts.map(toDev).forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); return true; };
      // behind the wave: the next place, settled
      c.save(); if (poly(halfPlane(WIN_PTS, fw - WAVE_W - WAVE_J - .012, true))) { c.clip(); c.drawImage(B.cv, G.winX, G.winY); } c.restore();
      // in the wave: grout, and stones of both places turning over
      const lo = fw - WAVE_W - WAVE_J - .03, hi = fw + WAVE_J + .03;
      const band = halfPlane(halfPlane(WIN_PTS, hi, true), lo, false);
      c.save();
      if (poly(band)) {
        c.clip();
        c.save(); c.setTransform(G.k * G.dpr, 0, 0, G.k * G.dpr, G.unitX, G.unitY); c.beginPath(); innerPath(c); c.restore();
        c.fillStyle = `rgb(${B.bed.map(v => v | 0).join(',')})`; c.fill();
        for (const E of [A, B]) {
          const isA = E === A, S = E.stones;
          let a = 0, b = S.length; while (a < b) { const m = (a + b) >> 1; if (S[m].w8 < lo - .02) a = m + 1; else b = m; }
          for (let k = a; k < S.length && S[k].w8 <= hi + .02; k++) {
            const t = S[k], u = clamp((fw - t.w8) / WAVE_W);
            const sq = isA ? (u < .5 ? Math.cos(u * Math.PI) : 0) : (u > .5 ? -Math.cos(u * Math.PI) : 0);
            if (sq <= .02) continue;
            paintStone(c, t, mix(t.col, [30, 26, 22], (1 - sq) * .3), G.kk, G.offX, G.offY, 0, sq < .98, sq);
          }
        }
      }
      c.restore();
      caption(tau < .5 ? A : B, st.P);
    }
    if (!(still && hooks.t == null)) drawGold(time);
  }

  const frame = now => {
    raf = 0;
    if (disposed || document.hidden || !st.ready || !visible) return;
    const t = (now - t0) / 1000, pos = scrollPos();
    if (pos !== lastPos || t - lastT > 1 / 14) { render(t); lastT = t; lastPos = pos; }
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!still && !raf && st.ready && !disposed && !document.hidden && visible && hooks.t == null) raf = requestAnimationFrame(frame); };
  const onScroll = () => { if (still && st.ready) { const p = Math.round(scrollPos()); if (p !== lastPos) { lastPos = p; render(0); } } else kick(); };
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  addEventListener('scroll', onScroll, { passive: true });
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); });
  io.observe(stageEl);
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 220); };
  addEventListener('resize', onResize);
  wideMq.addEventListener?.('change', onResize);
  await build();
  if (hooks.t != null) window.__renderAt = (t, pos) => { if (pos != null) hooks.pos = pos; const a = performance.now(); render(t); return performance.now() - a; };
  return { destroy() { disposed = true; cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', onResize); removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVis); } };
}
