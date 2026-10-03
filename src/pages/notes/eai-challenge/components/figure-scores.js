/* =============================================================================
   fig-scores.js — Figure 3: what it bought us.
   The official BEHAVIOR scores from the AxisTilted2 technical report (Table 1),
   as reported in the write-up: the gpt-5-mini baseline against the fine-tuned
   Qwen3-0.6B specialists. Bars start at zero on one 0–100 scale. The reader
   picks a module to draw the gap. Gaps are simple differences of the reported
   numbers; nothing else is added.
   ========================================================================== */
/* Ported from the essay-by-hand prototype. mount(root) wires one figure inside
   its React container and returns a cleanup function. */
import {
  Press, arcPts, arrowAt, clamp, ellPts, eout, knock, lerp, line, outline, placeHit, rectPts, registerFigure, say, solid, superPts, tone, trest, trot, tsave, ttr, tw, prefersReducedMotion, reviewParams,
} from './riso';

export function mountScoresFigure(root) {
const ac = new AbortController();
const on = (el, type, fn, opts) => el.addEventListener(type, fn, { ...opts, signal: ac.signal });
const RP = reviewParams();
const FIXED_T = RP.fixedT;
const QS = { has: RP.has, get: RP.get };
const REDUCE = prefersReducedMotion();

const ROWS = [
  { name: 'GOAL INTERPRETATION', label: 'Goal interpretation', base: 78.6, ours: 99.6 },
  { name: 'SUBGOAL DECOMPOSITION', label: 'Subgoal decomposition', base: 50.0, ours: 97.0 },
  { name: 'ACTION SEQUENCING', label: 'Action sequencing', base: 68.0, ours: 98.0 },
  { name: 'TRANSITION MODELING', label: 'Transition modeling', base: 80.0, ours: 99.5 },
];
const LAY_D = {
  W: 960, H: 500,
  title: { x: 34, y: 24, size: 20, lines: ['OFFICIAL BEHAVIOR SCORES'] },
  legend: { x: 36, y: 64, stack: false },
  rows: [146, 224, 302, 380], labelInline: true,
  x0: 330, x1: 896, axisY: 420,
  bar: { bh: 10, oh: 16, gap: 3 },
  overall: { x: 34, y: 452, w: 380, h: 32, size: 9 },
  vsize: [9, 11],
};
const LAY_P = {
  W: 360, H: 672,
  title: { x: 16, y: 16, size: 18, lines: ['OFFICIAL', 'BEHAVIOR SCORES'] },
  legend: { x: 18, y: 84, stack: true },
  rows: [178, 282, 386, 490], labelInline: false,
  x0: 18, x1: 292, axisY: 542,
  bar: { bh: 9, oh: 14, gap: 3 },
  overall: { x: 16, y: 594, w: 328, h: 52, size: 8.5, two: true },
  vsize: [8, 10],
};
let LAY = LAY_D;
const X = v => LAY.x0 + (LAY.x1 - LAY.x0) * v / 100;
const fmt = v => v.toFixed(1);

function drawStatic() {
  const T = LAY.title;
  T.lines.forEach((l, j) => say('B', l, T.x, T.y + j * (T.size + 8), T.size, { w: T.size * .13, seed: 3001 + j, gj: .8 }));
  // legend
  const L = LAY.legend, s = LAY === LAY_P ? 7.5 : 8;
  const b1 = rectPts(L.x, L.y + 1, 26, 9, 1);
  tone('B', b1, .38, { wob: .3, seed: 3010 }); outline('B', b1, { w: .9, seed: 3011, over: .03 });
  say('B', 'GPT-5-MINI BASELINE', L.x + 34, L.y, s, { w: 1.05, seed: 3012 });
  const lx2 = L.stack ? L.x : L.x + 34 + tw('GPT-5-MINI BASELINE', s) + 30, ly2 = L.stack ? L.y + 20 : L.y;
  const b2 = rectPts(lx2, ly2, 26, 11, 1);
  knock(b2, { wob: .1 }); solid('Y', b2, { wob: .3, seed: 3013, dx: .5 }); outline('B', b2, { w: 1.2, seed: 3014, over: .03 });
  say('B', 'QWEN3-0.6B, FINE-TUNED (OURS)', lx2 + 34, ly2 + 1, s, { w: 1.05, seed: 3015 });
  // the little 0.6B model from figures 1 and 2, as the legend's mark
  const hx = lx2 + 34 + tw('QWEN3-0.6B, FINE-TUNED (OURS)', s) + 16, hy = ly2 + 5;
  const body = superPts(hx, hy, 8.5, 7.5, 2.3, 28, .1);
  tone('P', body, .55, { wob: .3, seed: 3016 }); outline('B', body, { w: 1.2, seed: 3017 });
  solid('B', ellPts(hx - 3, hy - 2, 1.1, 1.4, 8), { wob: 0 }); solid('B', ellPts(hx + 3, hy - 2, 1.1, 1.4, 8), { wob: 0 });
  line('B', [hx - 1.6, hy + 2.6, hx, hy + 3.6, hx + 1.6, hy + 2.6], { w: .8, seed: 3018 });
  // axis, ticks, guides
  const ay = LAY.axisY;
  line('B', [LAY.x0 - 4, ay, LAY.x1 + 6, ay - .6], { w: 1.6, seed: 3020, wob: .5 });
  const top = LAY.rows[0] - (LAY.labelInline ? 26 : 30);
  for (const v of [0, 25, 50, 75, 100]) {
    const x = X(v);
    line('B', [x, ay - 4, x - .4, ay + 5], { w: 1.2, seed: 3021 + v });
    say('B', String(v), x, ay + 10, LAY === LAY_P ? 7.5 : 8.5, { align: 'center', w: 1.05, seed: 3030 + v });
    if (v > 0) for (let y = top; y < ay - 8; y += 9) line('B', [x, y, x + .2, y + 3.4], { w: .55, seed: 3040 + v + y });
  }
  // module names
  ROWS.forEach((r, i) => {
    const y = LAY.rows[i];
    if (LAY.labelInline) say('B', r.name, 34, y - 6, 10, { w: 1.4, seed: 3100 + i });
    else say('B', r.name, 18, y - 36, 9, { w: 1.25, seed: 3100 + i });
  });
  // overall slip
  const O = LAY.overall;
  tsave(); ttr(O.x, O.y); trot(-.012);
  const n = rectPts(0, 0, O.w, O.h, 1);
  knock(n, { wob: .4 }); tone('Y', n, .4, { wob: .5, seed: 3110 });
  const tape = rectPts(-6, O.h / 2 - 7, 18, 14, 0); knock(tape, { wob: .2 }); tone('Y', tape, .2, { wob: .4, seed: 3111 });
  if (O.two) {
    say('B', 'OVERALL  90.09', 16, 10, 10.5, { w: 1.5, seed: 3112 });
    say('B', 'SECOND-PLACE TEAM  84.32', 16, 30, O.size, { w: 1.2, seed: 3113 });
  } else {
    say('B', 'OVERALL  90.09', 18, 10, 11, { w: 1.6, seed: 3112 });
    say('B', '·  SECOND-PLACE TEAM  84.32', 18 + tw('OVERALL  90.09', 11) + 10, 11.5, O.size, { w: 1.2, seed: 3113 });
  }
  trest();
}

function barPts(x0, y, w, h) { return rectPts(x0, y, Math.max(1, w), h, 1.2); }
function drawRow(i, grow, sel) {
  const r = ROWS[i], y = LAY.rows[i], B = LAY.bar;
  const yb = y - B.bh - B.gap / 2 + (LAY.labelInline ? 0 : -6), yo = y + B.gap / 2 + (LAY.labelInline ? 0 : -6);
  const kb = eout(clamp(grow)), ko = eout(clamp(grow - .08));
  if (sel) {
    const ls = LAY.labelInline ? 10 : 9, lx = LAY.labelInline ? 34 : 18, ly = LAY.labelInline ? y - 6 : y - 36;
    solid('Y', rectPts(lx - 4, ly - 2.5, tw(r.name, ls) + 8, ls + 5, 1.5), { wob: .8, seed: 3290 + i, dy: .5 });
  }
  const xb = X(r.base * kb), xo = X(r.ours * ko);
  // baseline bar: blue tint
  const pb = barPts(LAY.x0, yb, xb - LAY.x0, B.bh);
  knock(pb, { wob: .1 });
  tone('B', pb, .38, { wob: .5, seed: 3210 + i });
  outline('B', pb, { w: .9, seed: 3220 + i, over: .03 });
  // ours: solid gold, inked outline; marker-stroke fill texture
  const po = barPts(LAY.x0, yo, xo - LAY.x0, B.oh);
  knock(po, { wob: .1 });
  solid('Y', po, { wob: .5, seed: 3240 + i, dx: .7, dy: .4 });
  for (let k = 0; k < 3; k++) {
    const yy = yo + 3.5 + k * (B.oh - 7) / 2;
    line('Y', [LAY.x0 + 4, yy, Math.max(LAY.x0 + 5, xo - 4 - k * 6), yy + .4], { w: 2.2, seed: 3250 + i * 3 + k, wob: .5 });
  }
  outline('B', po, { w: sel ? 2.2 : 1.4, seed: 3260 + i, over: .03 });
  const vs = LAY.vsize;
  if (grow >= 1) {
    say('B', fmt(r.base), xb + 6, yb + B.bh / 2 - vs[0] / 2, vs[0], { w: 1.05, seed: 3270 + i });
    say('B', fmt(r.ours), xo + 6, yo + B.oh / 2 - vs[1] / 2, vs[1], { w: 1.45, seed: 3280 + i });
  }
  return { xb, xo, yb, yo };
}
function drawGap(i, g, k) {
  if (k <= 0) return;
  const r = ROWS[i], d = r.ours - r.base, y = g.yb - (LAY === LAY_P ? 9 : 11);
  const kk = eout(clamp(k));
  const x0 = g.xb, x1 = lerp(g.xb, g.xo, kk);
  line('B', [x0, y + 5, x0, y], { w: 1.3, seed: 3300 + i });
  line('B', [x0, y, x1, y - .5], { w: 1.5, seed: 3301 + i, wob: .4 });
  if (kk > .95) { line('B', [g.xo, y - .5, g.xo, y + 5], { w: 1.3, seed: 3302 + i }); }
  arrowAt('B', x1, y - .5, 0, 5, 1.3, 3303 + i);
  if (k > .6) {
    const s = LAY === LAY_P ? 9.5 : 11, txt = '+' + fmt(d), wv = tw(txt, s), cx = (x0 + g.xo) / 2;
    const hk = clamp((k - .6) / .25);
    solid('Y', rectPts(cx - wv / 2 - 5, y - s - 7, (wv + 10) * hk, s + 6, 1.5), { wob: .7, seed: 3309 + i, dy: .6 });
    say('B', txt, cx, y - s - 5, s, { align: 'center', w: s * .15, seed: 3310 + i, reveal: clamp((k - .6) / .4) });
  }
  // a hand-drawn ring around the score it reached
  if (k > .8) {
    const s = LAY.vsize[1], wv = tw(fmt(r.ours), s);
    const cx = g.xo + 6 + wv / 2, cy = g.yo + LAY.bar.oh / 2;
    line('B', arcPts(cx, cy, wv / 2 + 7, s * .9, -200, 160 * clamp((k - .8) / .2) - 40, 26), { w: 1.3, seed: 3320 + i, wob: .5 });
  }
}

/* ------------------------------------------------------------------ state */
const fig = root;
const cvs = root.querySelector('#' + 'scores');
const press = new Press(cvs, w => (w < 560 ? LAY_P : LAY_D), lay => { LAY = lay; drawStatic(); }, 37);
const ui = { live: root.querySelector('#' + 'scores-live'), hits: [0, 1, 2, 3].map(i => root.querySelector('#' + 'scores-hit' + (i + 1))) };
const startT = REDUCE ? 9 : 0;
const st = { t: startT, started: REDUCE, sel: -1, selK: 0, auto: true };
if (FIXED_T !== null) { st.t = 9; st.started = true; st.sel = QS.has('sel') ? parseInt(QS.get('sel'), 10) : 1; st.selK = 1; }

function select(i) {
  if (st.sel === i) return;
  st.sel = i; st.selK = REDUCE ? 1 : 0; st.auto = false;
  const r = ROWS[i];
  ui.live.textContent = `${r.label}: baseline ${fmt(r.base)}, ours ${fmt(r.ours)}, a gain of ${fmt(r.ours - r.base)} points.`;
  figObj.dirty = true;
}
ui.hits.forEach((b, i) => {
  on(b, 'click', () => select(i));
  on(b, 'focus', () => select(i));
  on(b, 'pointerenter', e => { if (e.pointerType === 'mouse') select(i); });
});
function rowHit(i) {
  const y = LAY.rows[i];
  return LAY.labelInline ? [26, y - 36, LAY.W - 40, 66] : [8, y - 50, LAY.W - 16, 92];
}
function layoutHits() { ui.hits.forEach((b, i) => placeHit(b, LAY, ...rowHit(i))); }

const figObj = {
  el: fig, dirty: true,
  onShow() { st.started = true; },
  update(dt) {
    if (st.started && st.t < 9) { st.t += dt; this.dirty = true; if (st.auto && st.t > 1.7 && st.sel < 0) { st.sel = 1; st.selK = 0; } }
    if (st.sel >= 0 && st.selK < 1) { st.selK = Math.min(1, st.selK + dt / .7); this.dirty = true; }
  },
  draw(boil) {
    press.frame(boil, () => {
      for (let i = 0; i < 4; i++) {
        const grow = st.t >= 9 ? 1 : clamp((st.t - i * .12) / 1.0);
        const g = drawRow(i, grow, i === st.sel);
        if (i === st.sel && grow >= 1) drawGap(i, g, st.selK);
      }
    });
  },
};
function relayout() { press.resize(); LAY = press.lay; layoutHits(); figObj.dirty = true; }
relayout();
figObj.frozen = FIXED_T !== null;
const unregister = registerFigure(figObj);
figObj.draw(0);
let rz = null;
on(window, 'resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (cvs.parentElement.clientWidth !== press.wCss) { relayout(); figObj.draw(Math.max(0, figObj.drawnBoil)); } }, 140); });

return () => { ac.abort(); unregister(); clearTimeout(rz); };
}
