/* Arched window mosaic: the stage.
   Places the panel beside the words (wide) or above them (phones), lays it once, sets the stones
   on a canvas over pale grout, and then only re-colours the few stones that live: a slow band of
   light across the sky, two gulls, glints running round the sun's rings, stars at night. Stones
   never move. */
import { mix, clamp, smooth } from './core.js';
import { PANEL, panelShape, regionsFor, lightFor, OUTLINES, birdsAt, inBird } from './scene.js';
import { laySteps, corners } from './lay.js';

export const WIDE_QUERY = '(min-aspect-ratio: 29/20) and (min-width: 1000px)';
const SHEET_STONE = 6;
const q8 = new Float32Array(8);

function placePanel(mode, stageEl, laneEl, header) {
  const r = stageEl.getBoundingClientRect(), w = r.width, h = r.height, CAP = 30;
  let area;
  if (mode === 'wide') {
    const laneRight = laneEl.getBoundingClientRect().right - r.left;
    const top = Math.max(24, header ? header.getBoundingClientRect().bottom - r.top + 18 : 24);
    area = { x: laneRight + 56, y: top, w: w - laneRight - 56 - 44, h: h - top - 28 - CAP };
  } else {
    area = { x: 16, y: 14, w: w - 32, h: h - 14 - CAP - 6 };
  }
  const k = Math.min(area.w / PANEL.w, area.h / PANEL.h);
  const pw = PANEL.w * k, ph = PANEL.h * k;
  return { k, x: area.x + (area.w - pw) / 2, y: area.y + (area.h - ph) / 2, w: pw, h: ph, stageW: w, stageH: h };
}

function shade(col, h, h2, amt = .085) {
  const f = 1 + (h - .5) * amt, tilt = (h2 - .5) * 7;
  return [clamp(col[0] * f + tilt, 0, 255), clamp(col[1] * f, 0, 255), clamp(col[2] * f - tilt, 0, 255)];
}

function paintStone(c, t, col, k, ox, oy, glint = 0, flat = false) {
  corners(t, q8);
  c.beginPath();
  c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
  for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
  c.closePath();
  c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; c.fill();
  if (flat) return;
  // a stone catches the light on its upper edges and drops a hair of shadow on its lower ones
  const lw = Math.max(.7, k * .5), dark = col[0] + col[1] + col[2] < 200;
  c.lineWidth = lw;
  c.strokeStyle = dark ? 'rgba(255,250,236,.22)' : 'rgba(255,253,244,.32)';
  c.beginPath(); c.moveTo(q8[6] * k + ox, q8[7] * k + oy); c.lineTo(q8[0] * k + ox, q8[1] * k + oy); c.lineTo(q8[2] * k + ox, q8[3] * k + oy); c.stroke();
  c.strokeStyle = 'rgba(40,30,18,.16)';
  c.beginPath(); c.moveTo(q8[2] * k + ox, q8[3] * k + oy); c.lineTo(q8[4] * k + ox, q8[5] * k + oy); c.lineTo(q8[6] * k + ox, q8[7] * k + oy); c.stroke();
  if (glint > .02) {
    c.strokeStyle = `rgba(255,255,250,${Math.min(.85, glint)})`; c.lineWidth = Math.max(.9, k * .7);
    const mx = (q8[0] + q8[2]) / 2, my = (q8[1] + q8[3]) / 2, nx = (q8[6] + q8[0]) / 2, ny = (q8[7] + q8[1]) / 2;
    c.beginPath(); c.moveTo((nx * .55 + mx * .45) * k + ox, (ny * .55 + my * .45) * k + oy); c.lineTo((mx * .75 + nx * .25) * k + ox, (my * .75 + ny * .25) * k + oy); c.stroke();
  }
}

/** Lay and set the window on `canvas`. Returns { destroy }. */
export async function createStage({ canvas, stageEl, laneEl, header, captionEl, hooks = {}, still = false, onReady }) {
  let disposed = false, raf = 0, building = 0, resizeTimer = 0, visible = true, lastT = -1;
  const st = { canvas, ctx: canvas.getContext('2d') };
  const t0 = performance.now();
  const wideMq = matchMedia(WIDE_QUERY);

  const build = async () => {
    const id = ++building, alive = () => !disposed && id === building;
    const mode = wideMq.matches ? 'wide' : 'tall', dpr = Math.min(2, devicePixelRatio || 1);
    const P = placePanel(mode, stageEl, laneEl, header);
    if (P.w < 40) return;
    canvas.width = Math.round(P.stageW * dpr); canvas.height = Math.round(P.stageH * dpr);
    // stones across the arch: about one every 6 css px, between 72 and 126
    const across = clamp(Math.round(P.w * 1000 / PANEL.w / 6.1), 72, 126);
    const q = across * SHEET_STONE / 1000, W = Math.ceil(PANEL.w * q), H = Math.ceil(PANEL.h * q);
    const light = lightFor(hooks.hour), regions = regionsFor(light);
    const gen = laySteps(regions, OUTLINES, { W, H, q, s: SHEET_STONE, seed: 11 });
    let res = gen.next(), sliceStart = performance.now();
    while (!res.done) {
      if (performance.now() - sliceStart > 14) { await new Promise(r => setTimeout(r, 0)); if (!alive()) return; sliceStart = performance.now(); }
      res = gen.next();
    }
    if (!alive()) return;
    const { stones } = res.value;
    // colour every stone once
    const Pl = light.pal;
    for (const t of stones) {
      const ux = t.x / q + PANEL.x0, uy = t.y / q + PANEL.y0;
      t.ux = ux; t.uy = uy;
      if (t.k === 0) { t.col = shade(Pl.outline, t.h, t.h2, .12); continue; }
      const r = regions[t.reg];
      t.live = r.live || null;
      t.col = shade(r.fill(ux, uy), t.h, t.h2, r.group === 'robot' ? .06 : .085);
      t.glass = (r.live === 'sun' && t.h2 > .62) || (r.name === 'sky' && t.h2 > .965 && uy < 520);
      t.star = r.name === 'sky' && light.stars > .05 && t.h > .988 && t.h2 > .3 && uy < 560;
    }
    // the static panel: shadow, grout, stones
    const kk = P.k * dpr / q, ox = P.x * dpr, oy = P.y * dpr;   // sheet (0, 0) is the panel's top-left corner
    const sc = document.createElement('canvas'); sc.width = canvas.width; sc.height = canvas.height;
    const c = sc.getContext('2d');
    const panelPath = cc => { cc.beginPath(); cc.setTransform(P.k * dpr, 0, 0, P.k * dpr, P.x * dpr - PANEL.x0 * P.k * dpr, P.y * dpr - PANEL.y0 * P.k * dpr); panelShape(cc); cc.setTransform(1, 0, 0, 1, 0, 0); };
    c.save(); panelPath(c); c.shadowColor = 'rgba(70,52,30,.2)'; c.shadowBlur = 22 * dpr; c.shadowOffsetY = 8 * dpr; c.fillStyle = `rgb(${Pl.grout.map(v => v | 0).join(',')})`; c.fill('nonzero'); c.restore();
    // the joints take a little of each stone's colour, as grout does in a lit panel: pale under
    // light stones, darker under the night sky, so the joints never become a bright net
    const gr = Pl.grout;
    for (const t of stones) {
      const tint = mix(gr, t.col, .42);
      paintStone(c, { ...t, l: t.l + t.s * .2, w: t.w + t.s * .2 }, tint, kk, ox, oy, 0, true);
    }
    for (const t of stones) paintStone(c, t, t.col, kk, ox, oy, t.glass ? .22 : 0);
    st.static = sc; st.stones = stones; st.light = light; st.kk = kk; st.ox = ox; st.oy = oy; st.q = q;
    st.liveStones = stones.filter(t => t.live === 'sky' || t.live === 'sun' || t.glass || t.star);
    if (captionEl) {
      captionEl.textContent = `San Jose · ${light.label} · a style frame for the first place`;
      captionEl.style.left = P.x + 'px'; captionEl.style.top = (P.y + P.h + 10) + 'px'; captionEl.style.width = P.w + 'px';
    }
    st.ready = true; lastT = -1;
    render(hooks.t != null ? hooks.t : 0);
    onReady?.(light);
    if (!still && hooks.t == null) kick();
  };

  const render = t => {
    const c = st.ctx; if (!st.static) return;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height); c.drawImage(st.static, 0, 0);
    if (still && hooks.t == null) return;
    const L = st.light, birds = birdsAt(t), band = (t * 38) % 1500 - 250, sun = L.sun;
    for (const s of st.liveStones) {
      let col = s.col, g = 0, changed = false;
      if (s.live === 'sky') {
        // a slow band of light moves across the sky; the gulls pass in front of it
        const b = Math.exp(-((((s.ux - band) + (s.uy - 300) * .35) / 90) ** 2)) * (1 - L.night * .7);
        if (b > .03) { col = mix(col, [255, 252, 238], b * .14); changed = true; }
        if (L.night < .5) for (const bd of birds) if (inBird(bd, s.ux, s.uy)) { col = mix(s.col, L.pal.bird, .88); changed = true; break; }
        if (s.star) { const tw = .55 + .45 * Math.sin(t * (1.3 + s.h2 * 2) + s.h * 40); col = mix(col, [255, 246, 214], L.stars * tw); changed = true; }
      } else if (s.live === 'sun' && sun) {
        const a = Math.atan2(s.uy - sun[1], s.ux - sun[0]), ring = s.row;
        const gl = Math.max(0, Math.cos(a - t * .45 - ring * .6)) ** 12;
        if (gl > .02) { col = mix(col, [255, 250, 230], gl * .35); changed = true; }
      }
      if (s.glass) { g = .18 + .6 * Math.max(0, Math.sin(t * .5 + s.h * 23)) ** 14; changed = true; }
      if (changed) paintStone(c, s, col, st.kk, st.ox, st.oy, g);
    }
  };
  const frame = now => {
    raf = 0;
    if (disposed || document.hidden || !st.ready || !visible) return;
    const t = (now - t0) / 1000;
    if (t - lastT > 1 / 14) { render(t); lastT = t; }
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && st.ready && !disposed && !document.hidden && visible && !still && hooks.t == null) raf = requestAnimationFrame(frame); };
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); });
  io.observe(stageEl);
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 220); };
  addEventListener('resize', onResize);
  wideMq.addEventListener?.('change', onResize);
  await build();
  if (hooks.t != null) window.__renderAt = t => { const a = performance.now(); render(t); return performance.now() - a; };
  return { destroy() { disposed = true; cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); } };
}
