/* The apse in mosaic: the stage.
   The architecture (the starry lapis wall, the jewelled archivolt and the cornice) is laid once for
   the whole screen. Each place's scene (the conch's ground, its landscape and the desk) is its own
   layer, laid in the conch when first needed. Scrolling moves between places: the architecture
   stays, and the conch is re-laid in a wave from its upper right, each stone turning over to show
   the next place. A WebGL layer lights the gold and glass (glint.js).
   Layers on screen, back to front: the wall (whole screen, sticky), the words (scrolling, on
   marble tablets), then the band above the cornice (sticky): architecture, conch, glint. So the
   words slide up under the cornice, like an inscription passing beneath the apse. */
import { mix, clamp, smooth, mulberry32, hash2, fbm } from './core.js';
import { RI, C, layoutApse, conchPath, sceneAnchors } from './geom.js';
import { laySteps, corners } from './lay.js';
import { ARCH_PAL, MAT, archRegions, ARCH_OUTLINES, archPreStones, finishArch } from './arch.js';
import { deskLiveKind, deskLive } from './desk.js';
import { createGlint } from './glint.js';
import sanjose from './places/sanjose.js';
import sandiego from './places/sandiego.js';
import bengaluru from './places/bengaluru.js';
import surathkal from './places/surathkal.js';

export const PLACES = [sanjose, sandiego, bengaluru, surathkal];
const SHEET_STONE = 6;
const FLAT_GROUPS = new Set(['sky', 'view', 'sun', 'cloud', 'city', 'robotEye']);
const q8 = new Float32Array(8);
const GOLD_TONES = ['#c9a04a', '#d8b35c', '#b3883a', '#e0bd68', '#a77c32', '#cfa654'].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);

function shade(col, h, h2, amt = .085) {
  const f = 1 + (h - .5) * amt, tilt = (h2 - .5) * 7;
  return [clamp(col[0] * f + tilt, 0, 255), clamp(col[1] * f, 0, 255), clamp(col[2] * f - tilt, 0, 255)];
}
function paintStone(c, t, col, k, ox, oy, flat = false, squash = 1) {
  if (squash < 1) corners({ ...t, w: t.w * Math.max(.04, squash) }, q8); else corners(t, q8);
  c.beginPath();
  c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
  for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
  c.closePath();
  c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; c.fill();
  if (flat) return;
  const dark = col[0] + col[1] + col[2] < 200;
  c.lineWidth = Math.max(.7, k * .5);
  c.strokeStyle = dark ? 'rgba(255,250,236,.16)' : 'rgba(255,253,244,.26)';
  c.beginPath(); c.moveTo(q8[6] * k + ox, q8[7] * k + oy); c.lineTo(q8[0] * k + ox, q8[1] * k + oy); c.lineTo(q8[2] * k + ox, q8[3] * k + oy); c.stroke();
  c.strokeStyle = 'rgba(30,22,12,.2)';
  c.beginPath(); c.moveTo(q8[2] * k + ox, q8[3] * k + oy); c.lineTo(q8[4] * k + ox, q8[5] * k + oy); c.lineTo(q8[6] * k + ox, q8[7] * k + oy); c.stroke();
}
const grouted = t => ({ ...t, l: t.l + t.s * .2, w: t.w + t.s * .2 });

async function runSliced(gen, alive) {
  let res = gen.next(), start = performance.now();
  while (!res.done) {
    if (performance.now() - start > 14) { await new Promise(r => setTimeout(r, 0)); if (!alive()) return null; start = performance.now(); }
    res = gen.next();
  }
  return res.value;
}

/** Lay and set the apse. Returns { destroy }. */
export async function createStage({ root, wallCanvas, archCanvas, conchCanvas, glintCanvas, frontEl, backEl, laneEl, sections, header, captionEl, hooks = {}, still = false, onChange, onReady, onLayout }) {
  let disposed = false, raf = 0, building = 0, resizeTimer = 0, visible = true, lastT = -1, lastPos = -1, lastKey = '', lastW = 0;
  const st = { eras: [], pos: 0, light: null, target: null, pointerAt: -1e9, tilt: null };
  const t0 = performance.now();
  const glint = createGlint(glintCanvas);

  /* where the words are: which place is in view (0–3, fractional during a change) */
  const scrollPos = () => {
    if (hooks.pos != null) return hooks.pos;
    const G = st.G; if (!G) return 0;
    const vh = G.h, zone = vh - G.bandH, ref = scrollY + G.bandH + zone * .62, span = Math.max(150, zone * .75);
    const tops = sections.map(s => s.getBoundingClientRect().top + scrollY);
    let pos = 0;
    for (let k = 1; k < tops.length; k++) { const a = tops[k] - span, b = tops[k]; if (ref >= b) pos = k; else if (ref > a) { pos = k - 1 + (ref - a) / span; break; } else break; }
    return clamp(pos, 0, 3);
  };
  const waveD = () => 2 * RI + (RI + st.G.F) * .55;
  const waveAt = (ux, uy) => ((RI - ux) + (uy + RI) * .55) / waveD();
  const WAVE_W = .16, WAVE_J = .05;

  /* one place's layer */
  async function buildEra(i, alive) {
    if (st.eras[i]) return;
    st.eras[i] = 'pending';
    const G = st.G, Z = st.Z, place = PLACES[i], L = place.light(hooks.hour), A = sceneAnchors(G.F);
    const regions = place.regions(L, A);
    // eight-pointed gold stars set into a night sky before its rows, like the wall's
    const pre = [], skyIdx = regions.findIndex(r => r.name === 'sky'), S6 = SHEET_STONE;
    for (const sp of (place.stars ? place.stars(L, A) : [])) {
      const sx = (sp.x - Z.panel.x0) * Z.q, sy = (sp.y - Z.panel.y0) * Z.q, a0 = sp.a ?? 0, col = sp.col;
      const put = (dx, dy, l, w, a) => pre.push({ x: sx + dx, y: sy + dy, a, l, w, reg: skyIdx, extra: { col, mat: MAT.GOLD, preStar: true } });
      put(0, 0, S6 * (sp.size ? .86 : .7), S6 * (sp.size ? .86 : .7), a0);
      if (sp.size >= 1) for (let k = 0; k < 4; k++) { const b = a0 + k * Math.PI / 2; put(Math.cos(b) * S6 * .98, Math.sin(b) * S6 * .98, S6 * .78, S6 * .5, b); }
      if (sp.size === 2) for (let k = 0; k < 4; k++) { const b = a0 + Math.PI / 4 + k * Math.PI / 2; put(Math.cos(b) * S6 * 1.02, Math.sin(b) * S6 * 1.02, S6 * .5, S6 * .4, b); }
    }
    const res = await runSliced(laySteps(regions, place.outlines, { W: Z.W, H: Z.H, q: Z.q, s: SHEET_STONE, seed: 23 + i * 17, panel: Z.panel, clip: conchPath(G.F), pre }), alive);
    if (!res) { st.eras[i] = undefined; return; }
    const stones = res.stones, live = [], rnd = mulberry32(400 + i);
    // each region's box, for the modelling below
    const rb = regions.map(() => [1e9, 1e9, -1e9, -1e9]);
    for (const t of stones) if (t.reg >= 0) { const b = rb[t.reg], ux = t.x / Z.q + Z.panel.x0, uy = t.y / Z.q + Z.panel.y0; if (ux < b[0]) b[0] = ux; if (uy < b[1]) b[1] = uy; if (ux > b[2]) b[2] = ux; if (uy > b[3]) b[3] = uy; }
    for (const t of stones) {
      t.ux = t.x / Z.q + Z.panel.x0; t.uy = t.y / Z.q + Z.panel.y0;
      t.w8 = clamp(waveAt(t.ux, t.uy) + (hash2(t.x * 7 | 0, t.y * 7 | 0, 5) - .5) * 2 * WAVE_J, -WAVE_J, 1 + WAVE_J);
      if (t.k === 0) { t.col = shade(L.outline || ARCH_PAL.outline, t.h, t.h2, .12); t.mat = 0; continue; }
      const r = regions[t.reg];
      if (t.preStar) { t.col = shade(t.col, t.h, t.h2, .1); t.star = true; live.push(t); continue; }
      let col = r.fill(t.ux, t.uy), mat = r.matAt ? r.matAt(t.ux, t.uy) : (r.mat || 0);
      t.star = place.isStar(r, L, t, A);
      if (t.star) { col = rnd() < .2 ? [236, 238, 240] : GOLD_TONES[(t.h2 * 6) | 0]; mat = col[2] > 200 ? MAT.SILVER : MAT.GOLD; }
      else if (mat === MAT.GOLD) { const rowTone = hash2(t.row, i, 9); col = mix(mix(col, GOLD_TONES[(rowTone * 6) | 0], .16), GOLD_TONES[(t.h2 * 6) | 0], .12); }
      /* modelling, as mosaicists do it: a row of light just inside a thing's lit edge (light from the
         upper left), a darker row inside its shaded edge, and a lit top row on things laid in courses */
      if (!r.flat && !FLAT_GROUPS.has(r.group) && t.row >= 0 && t.row <= 1) {
        const b = rb[t.reg], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, hw = Math.max(4, (b[2] - b[0]) / 2), hh = Math.max(4, (b[3] - b[1]) / 2);
        const k = t.row === 0 ? 1 : .45;
        if (r.src === 'courses') { if (t.row === 0) col = mix(col, [255, 250, 236], .16); }
        else { const lit = -((t.ux - cx) / hw * .62 + (t.uy - cy) / hh * .78); col = lit > 0 ? mix(col, [255, 250, 236], .17 * k * Math.min(1, lit * 1.6)) : mix(col, [18, 14, 10], .16 * k * Math.min(1, -lit * 1.6)); }
      }
      t.col = shade(col, t.h, t.h2, mat === MAT.GOLD ? .07 : .085); t.mat = mat;
      t.kind = place.liveKind(t, r, L);
      t.liveKind = deskLiveKind(t, r);
      if (t.liveKind === 'code') t.cursor = r.name === 'code' && t.ux < A.sd * -70 && t.uy > A.deskY - 36 * A.sd;
      if (place.edgeOf) t.edge = place.edgeOf(r, t.ux, t.uy, A);
      if (t.kind || t.star || (t.liveKind && (t.liveKind !== 'code' || t.cursor))) live.push(t);
    }
    // the layer: a dark setting bed, the joints tinted by their stones, then the stones
    const cv = document.createElement('canvas'); cv.width = Z.cw; cv.height = Z.ch;
    const c = cv.getContext('2d'), gr = ARCH_PAL.grout;
    c.save(); c.setTransform(G.u * Z.dpr, 0, 0, G.u * Z.dpr, (G.cx * Z.dpr) - Z.cx0, (G.cy * Z.dpr) - Z.cy0); c.beginPath(); conchPath(G.F)(c); c.restore();
    c.save(); c.clip(); c.fillStyle = `rgb(${gr.join(',')})`; c.fillRect(0, 0, cv.width, cv.height);
    for (const t of stones) paintStone(c, grouted(t), mix(gr, t.col, .5), Z.kk, Z.ox, Z.oy, true);
    for (const t of stones) paintStone(c, t, t.col, Z.kk, Z.ox, Z.oy);
    c.restore();
    if (!alive()) { st.eras[i] = undefined; return; }
    const sorted = stones.slice().sort((a, b) => a.w8 - b.w8);
    st.eras[i] = { cv, stones: sorted, live, L, place, A };
    uploadGlint('era' + i, stones.filter(t => t.mat), Z, true);
  }

  /* the glint layer's copy of a set of stones: corners and centres in the band's device px */
  function uploadGlint(key, list, Z, conch) {
    if (!glint) return;
    const G = st.G, dpr = Z.dpr, out = [];
    for (const t of list) {
      corners(t, q8);
      const cc = new Float32Array(8);
      for (let k = 0; k < 4; k++) { cc[k * 2] = q8[k * 2] * Z.kk + Z.gx; cc[k * 2 + 1] = q8[k * 2 + 1] * Z.kk + Z.gy; }
      const cx = t.x * Z.kk + Z.gx, cy = t.y * Z.kk + Z.gy;
      if (!conch && cy > G.bandH * dpr + 4) continue;
      // each stone's tilt: its own angle, a patchy drift across the wall, and (in the conch) a lean toward the middle
      const patch = (fbm(t.ux / 90, t.uy / 90, 61, 2) - .5) * 2, patch2 = (fbm(t.ux / 90, t.uy / 90, 83, 2) - .5) * 2;
      let bx = patch * .1, by = patch2 * .1;
      if (conch) { bx += -t.ux / RI * .24; by += -Math.min(t.uy, 0) / RI * .24; }
      const nx = bx + (t.h - .5) * .44, ny = by + (t.h2 - .5) * .44;
      out.push({ c: cc, cx, cy, nx, ny, bx, by, col: t.col, mat: t.mat, w8: t.w8 });
    }
    glint.upload(key, out);
  }

  const build = async () => {
    const id = ++building, alive = () => !disposed && id === building;
    const w = document.documentElement.clientWidth, h = backEl.clientHeight || innerHeight;
    const corner = w >= 980 && w / h >= 1.22;
    root.classList.toggle('is-corners', corner); root.classList.toggle('is-band', !corner);
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const G = layoutApse(w, h, corner ? 'corners' : 'band', headerH);
    const dpr = Math.min(2, devicePixelRatio || 1);
    st.G = G; st.dpr = dpr; st.ready = false; st.eras = []; lastW = w;
    glint?.clearAll();
    onLayout?.(G);
    // stones: about one every 7 css px on a big screen, never under 4.6 px
    const stonePx = clamp(G.u * 1000 / 132, 4.6, 7.4), q = SHEET_STONE * G.u / stonePx, su = SHEET_STONE / q;
    st.su = su;

    /* the architecture, for the whole screen */
    const panel = { x0: -G.cx / G.u - 20, y0: -G.cy / G.u - 20 };
    const AW = Math.ceil((w / G.u + 40) * q), AH = Math.ceil((h / G.u + 40) * q);
    const regs = archRegions(G), idx = n => regs.findIndex(r => r.name === n);
    // no stars behind the nav
    const ex = [];
    if (header) for (const el of header.querySelectorAll('a, .wordmark')) {
      const r = el.getBoundingClientRect(), fr = frontEl.getBoundingClientRect();
      ex.push([(r.left - fr.left - G.cx - 26) / G.u, (r.top - fr.top - G.cy - 16) / G.u, (r.right - fr.left - G.cx + 26) / G.u, (r.bottom - fr.top - G.cy + 18) / G.u]);
    }
    const pre = archPreStones(G, q, SHEET_STONE, panel, idx, ex);
    const ares = await runSliced(laySteps(regs, ARCH_OUTLINES, { W: AW, H: AH, q, s: SHEET_STONE, seed: 11, panel, pre }), alive);
    if (!ares) return;
    for (const t of ares.stones) { t.ux = t.x / q + panel.x0; t.uy = t.y / q + panel.y0; }
    finishArch(ares.stones, regs, G, su);
    const kk = G.u * dpr / q, aox = (panel.x0 * G.u + G.cx) * dpr, aoy = (panel.y0 * G.u + G.cy) * dpr;
    wallCanvas.width = Math.round(w * dpr); wallCanvas.height = Math.round(h * dpr);
    const wc = wallCanvas.getContext('2d'), gr = ARCH_PAL.grout;
    wc.fillStyle = `rgb(${mix(gr, ARCH_PAL.lapisDeep, .5).map(v => v | 0).join(',')})`; wc.fillRect(0, 0, wallCanvas.width, wallCanvas.height);
    for (const t of ares.stones) { t.col = shade(t.col, t.h, t.h2, t.mat === MAT.GOLD ? .12 : .07); paintStone(wc, grouted(t), mix(gr, t.col, .45), kk, aox, aoy, true); }
    for (const t of ares.stones) paintStone(wc, t, t.col, kk, aox, aoy, t.mat === MAT.GLASS && !t.star);   // the lapis needs no bevel
    archCanvas.width = Math.round(w * dpr); archCanvas.height = Math.round(G.bandH * dpr);
    archCanvas.getContext('2d').drawImage(wallCanvas, 0, 0);
    glintCanvas.width = archCanvas.width; glintCanvas.height = archCanvas.height;
    uploadGlint('arch', ares.stones.filter(t => t.mat), { kk, gx: aox, gy: aoy, dpr }, false);
    if (!alive()) return;

    /* the conch: its own canvas and sheet */
    const cx0 = Math.floor((G.cx - (RI + 6) * G.u) * dpr), cy0 = Math.floor((G.cy - (RI + 6) * G.u) * dpr);
    const cw = Math.ceil((2 * RI + 12) * G.u * dpr), ch = Math.ceil((RI + G.F + 12) * G.u * dpr);
    conchCanvas.width = cw; conchCanvas.height = ch;
    Object.assign(conchCanvas.style, { left: cx0 / dpr + 'px', top: cy0 / dpr + 'px', width: cw / dpr + 'px', height: ch / dpr + 'px' });
    const zp = { x0: -RI - 10, y0: -RI - 10 };
    const Z = { q, dpr, panel: zp, W: Math.ceil((2 * RI + 20) * q), H: Math.ceil((RI + G.F + 20) * q), kk, cw, ch, cx0, cy0,
      ox: (zp.x0 * G.u + G.cx) * dpr - cx0, oy: (zp.y0 * G.u + G.cy) * dpr - cy0, gx: (zp.x0 * G.u + G.cx) * dpr, gy: (zp.y0 * G.u + G.cy) * dpr };
    st.Z = Z;
    st.cc = conchCanvas.getContext('2d');

    const first = Math.min(3, Math.round(hooks.era != null ? hooks.era : scrollPos()));
    const need = hooks.all ? [0, 1, 2, 3] : hooks.pos != null ? [Math.floor(hooks.pos), Math.min(3, Math.ceil(hooks.pos))] : [first];
    for (const i of need) { await buildEra(i, alive); if (!alive()) return; }
    st.ready = true; lastPos = -1; lastKey = '';
    window.__apsePerf = { firstFrame: performance.now() - t0 };
    render(hooks.t != null ? hooks.t : 0);
    drawGlint(hooks.t != null ? hooks.t : 0, true);
    onReady?.(PLACES[0].light(hooks.hour));
    if (hooks.t == null) {
      for (const i of [first + 1, first - 1, first + 2, first - 2, first + 3, first - 3]) if (i >= 0 && i < 4) { await buildEra(i, alive); if (!alive()) return; }
      lastPos = -1; kick();
      if (window.__apsePerf) window.__apsePerf.allPlaces = performance.now() - t0;
    }
  };

  function caption(E) {
    const key = E.place.key + E.L.caption;
    if (key === lastKey) return;
    lastKey = key;
    onChange?.({ place: E.place.place, caption: E.L.caption, alt: E.place.alt(E.L), L: E.L, key: E.place.key });
    if (captionEl) captionEl.textContent = E.L.caption;
  }
  function drawLive(E, time) {
    const c = st.cc, Z = st.Z, F = E.place.frameState(time, E.L, E.A);
    for (const s of E.live) {
      let col = null;
      if (s.liveKind) col = deskLive(s, F, E.L);
      if (!col && (s.kind || s.star)) col = E.place.liveColour(s, F, E.L);
      if (col) paintStone(c, s, col, Z.kk, Z.ox, Z.oy);
    }
  }

  /* the conch at the current scroll position */
  function render(time) {
    const c = st.cc, Z = st.Z; if (!c || !Z) return;
    const pos = clamp(st.pos = scrollPos(), 0, 3);
    let i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
    if (still) { i = Math.min(3, Math.round(pos)); tau = 0; }
    const A = st.eras[i], B = st.eras[Math.min(3, i + 1)];
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, Z.cw, Z.ch);
    const okA = A && A !== 'pending', okB = B && B !== 'pending';
    st.wave = null;
    if (tau < .001 || tau > .999 || !okA || !okB) {
      const E = tau > .999 && okB ? B : okA ? A : okB ? B : null;
      st.shown = E ? [E === A ? i : i + 1] : [];
      if (E) { c.drawImage(E.cv, 0, 0); caption(E); if (!(still && hooks.t == null)) drawLive(E, time); }
      return;
    }
    const fw = -WAVE_J + tau * (1 + 2 * WAVE_J + WAVE_W);
    st.wave = { a: i, b: i + 1, fw };
    const G = st.G, toDev = ([ux, uy]) => [(G.cx + ux * G.u) * Z.dpr - Z.cx0, (G.cy + uy * G.u) * Z.dpr - Z.cy0];
    const box = [[-RI - 8, -RI - 8], [RI + 8, -RI - 8], [RI + 8, G.F + 8], [-RI - 8, G.F + 8]];
    const half = (pts, a, keepBelow) => {
      const f = ([x, y]) => (waveAt(x, y) - a) * (keepBelow ? 1 : -1), out = [];
      for (let k = 0; k < pts.length; k++) {
        const p = pts[k], qq = pts[(k + 1) % pts.length], fp = f(p), fq = f(qq);
        if (fp <= 0) out.push(p);
        if ((fp <= 0) !== (fq <= 0)) { const t = fp / (fp - fq); out.push([p[0] + (qq[0] - p[0]) * t, p[1] + (qq[1] - p[1]) * t]); }
      }
      return out;
    };
    const poly = pts => { if (pts.length < 3) return false; c.beginPath(); pts.map(toDev).forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); return true; };
    c.drawImage(A.cv, 0, 0);
    c.save(); if (poly(half(box, fw - WAVE_W - WAVE_J - .012, true))) { c.clip(); c.drawImage(B.cv, 0, 0); } c.restore();
    const lo = fw - WAVE_W - WAVE_J - .03, hi = fw + WAVE_J + .03;
    c.save();
    if (poly(half(half(box, hi, true), lo, false))) {
      c.clip();
      c.save(); c.setTransform(G.u * Z.dpr, 0, 0, G.u * Z.dpr, G.cx * Z.dpr - Z.cx0, G.cy * Z.dpr - Z.cy0); c.beginPath(); conchPath(G.F)(c); c.restore();
      c.fillStyle = `rgb(${ARCH_PAL.grout.join(',')})`; c.fill();
      for (const E of [A, B]) {
        const isA = E === A, S = E.stones;
        let a = 0, b = S.length; while (a < b) { const m = (a + b) >> 1; if (S[m].w8 < lo - .02) a = m + 1; else b = m; }
        for (let k = a; k < S.length && S[k].w8 <= hi + .02; k++) {
          const t = S[k], u = clamp((fw - t.w8) / WAVE_W);
          const sq = isA ? (u < .5 ? Math.cos(u * Math.PI) : 0) : (u > .5 ? -Math.cos(u * Math.PI) : 0);
          if (sq <= .02) continue;
          paintStone(c, t, mix(t.col, [30, 26, 22], (1 - sq) * .3), Z.kk, Z.ox, Z.oy, sq < .98, sq);
        }
      }
    }
    c.restore();
    caption(tau < .5 ? A : B);
  }

  /* where the light is: the pointer (eased), a tilted phone, or a slow drift */
  function lightAt(time) {
    const G = st.G, w = G.w, bh = G.bandH;
    const drift = [w * (.5 + .3 * Math.sin(time * .11 - .4)), bh * (.32 + .14 * Math.sin(time * .083 - .6))];   // starts over the open gold
    let target = drift;
    if (hooks.light) target = [w * hooks.light[0], bh * hooks.light[1]];
    else if (st.tilt) target = [w * clamp(.5 + st.tilt[0] / 50, -.1, 1.1), bh * clamp(.4 + st.tilt[1] / 60, -.1, 1.1)];
    else if (st.target && performance.now() - st.pointerAt < 9000) target = [w / 2 + (st.target[0] - w / 2) * 1.15, bh * .45 + (st.target[1] - bh * .45) * 1.15];
    if (!st.light || hooks.t != null || still) st.light = target.slice();
    else { st.light[0] += (target[0] - st.light[0]) * .07; st.light[1] += (target[1] - st.light[1]) * .07; }
    return st.light;
  }
  let lastLight = null;
  function drawGlint(time, force) {
    if (!glint || !st.G) return;
    const G = st.G, d = st.dpr, Lp = lightAt(time);
    const moved = !lastLight || Math.hypot(Lp[0] - lastLight[0], Lp[1] - lastLight[1]) > .25;
    if (!force && !moved && !st.wave && st.lastWave == null) return;
    st.lastWave = st.wave ? 1 : null;
    lastLight = Lp.slice();
    const draws = [{ key: 'arch' }];
    if (st.wave) { draws.push({ key: 'era' + st.wave.a, mode: 1, hi: st.wave.fw }); draws.push({ key: 'era' + st.wave.b, mode: 2, lo: st.wave.fw - WAVE_W }); }
    else for (const k of st.shown || []) draws.push({ key: 'era' + k });
    if (hooks.noGlint) return glint.draw([0, 0, 1], [0, 0, 1], [], 0);
    glint.draw([Lp[0] * d, Lp[1] * d, G.w * .5 * d], [G.w * .5 * d, G.bandH * .5 * d, G.w * 2.4 * d], draws, 1);
  }

  const frame = now => {
    raf = 0;
    if (disposed || document.hidden || !st.ready || !visible) return;
    const t = (now - t0) / 1000, pos = scrollPos();
    const a = performance.now();
    if (pos !== lastPos || t - lastT > 1 / 15) { render(t); lastT = t; lastPos = pos; }
    drawGlint(t);
    if (window.__apsePerf) (window.__apsePerf.frames || (window.__apsePerf.frames = [])).push(performance.now() - a);
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!still && !raf && st.ready && !disposed && !document.hidden && visible && hooks.t == null) raf = requestAnimationFrame(frame); };
  const onScroll = () => { if (still && st.ready) { const p = Math.round(scrollPos()); if (p !== lastPos) { lastPos = p; render(0); drawGlint(0, true); } } else kick(); };
  const onVis = () => { if (!document.hidden) kick(); };
  const onPointer = e => { if (e.pointerType === 'touch' && !st.touchLight) return; st.target = [e.clientX, e.clientY]; st.pointerAt = performance.now(); kick(); };
  const onTilt = e => { if (e.gamma == null) return; st.tilt = [e.gamma, (e.beta ?? 45) - 45]; kick(); };
  document.addEventListener('visibilitychange', onVis);
  addEventListener('scroll', onScroll, { passive: true });
  if (!still) addEventListener('pointermove', onPointer, { passive: true });
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); });
  io.observe(frontEl);
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (Math.abs(document.documentElement.clientWidth - lastW) > 1 || Math.abs((backEl.clientHeight || innerHeight) - st.G.h) > 120) build(); }, 220); };
  addEventListener('resize', onResize);
  await build();
  if (hooks.t != null) window.__light = (x, y) => { hooks.light = [x, y]; drawGlint(0, true); };
  if (hooks.t != null) window.__renderAt = (t, pos) => { if (pos != null) hooks.pos = pos; const a = performance.now(); render(t); drawGlint(t, true); return performance.now() - a; };
  return {
    /** device tilt (only after permission where a browser asks for it) */
    enableTilt() { if (still) return; addEventListener('deviceorientation', onTilt); },
    glintOk: !!glint,
    destroy() { disposed = true; cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', onResize); removeEventListener('scroll', onScroll); removeEventListener('pointermove', onPointer); removeEventListener('deviceorientation', onTilt); document.removeEventListener('visibilitychange', onVis); },
  };
}
export { smooth };
