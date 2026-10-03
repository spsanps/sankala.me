/* =============================================================================
   fig-pile.js — Figure 2: hard tasks teach the most.
   Three illustrative tasks of different difficulty go through the loop. Every
   try leaves a card in the dataset (a pink error log, or the gold plan that
   finally passed), so the stack for the hardest task grows tallest. "Distill"
   feeds the dataset to the small 0.6B model, as in the write-up: "We distilled
   the loop's output into small Qwen3 models." Task names and try counts are
   illustrative; the ten-try task follows the write-up's own example.
   ========================================================================== */
(() => {
const TASKS = [
  { id: 'lamp', name: ['TURN ON', 'THE LAMP'], one: 'TURN ON THE LAMP', short: 'LAMP', tries: 1, said: 'Turn on the lamp passes on the first try: one card in the dataset.' },
  { id: 'coffee', name: ['MAKE', 'COFFEE'], one: 'MAKE COFFEE', short: 'COFFEE', tries: 4, said: 'Make coffee takes four tries: three error logs and the plan that passed.' },
  { id: 'dinner', name: ['CLEAN UP', 'AFTER DINNER'], one: 'CLEAN UP AFTER DINNER', short: 'DINNER', tries: 10, said: 'Clean up after dinner takes ten tries: ten cards, nine error logs and the plan that passed.' },
];
const ATT = .34, LIFT = .12, FLY = .44, EAT = .1, EAT_FLY = .3;

const LAY_D = {
  W: 960, H: 472,
  title: { x: 34, y: 24, size: 22, lines: ['HARD TASKS TEACH THE MOST'] },
  legend: { x: 36, y: 66 },
  rows: [150, 256, 362].map(y => ({ y })),
  tag: { x: 34, w: 198, h: 66 },
  strip: { x: 270, step: 31, sq: 24 },
  tray: { cx: 770, base: 392, w: 250, stacks: [702, 770, 838], cw: 60, th: 15 },
  model: { x: 922, y: 376, s: 1.25 },
  note: { x: 668, y: 236, w: 108, h: 34, rot: -.06, size: 8 },
  hint: { x: 262, y: 96, size: 8.5, align: 'left', to: [258, 104, 246, 110, 238, 120] },
};
const LAY_P = {
  W: 360, H: 698,
  title: { x: 16, y: 16, size: 19, lines: ['HARD TASKS', 'TEACH THE MOST'] },
  legend: { x: 18, y: 86 },
  rows: [134, 246, 358].map(y => ({ y })),
  tag: { x: 16, w: 328, h: 38, one: true },
  strip: { x: 22, step: 31.5, sq: 23 },
  tray: { cx: 160, base: 614, w: 236, stacks: [96, 160, 224], cw: 54, th: 12 },
  model: { x: 316, y: 600, s: 1.05 },
  note: { x: 40, y: 476, w: 92, h: 30, rot: -.06, size: 7 },
  hint: { x: 344, y: 98, size: 7, align: 'right', to: null },
};

let LAY = LAY_D;
const stripY = r => LAY === LAY_P ? r.y + 66 : r.y;
const rowBox = i => {
  const r = LAY.rows[i];
  return LAY === LAY_P ? [8, r.y - 26, 344, 104] : [26, r.y - 46, 606, 92];
};

/* ---------------------------------------------------------------- drawing */
function drawTitle() {
  const T = LAY.title;
  T.lines.forEach((l, j) => say('B', l, T.x, T.y + j * (T.size + 8), T.size, { w: T.size * .13, seed: 2001 + j, gj: .8 }));
}
function miniTicket(x, y, w, h, seed, k = 1) {
  const pts = rectPts(x - w / 2, y - h / 2, w, h, 1);
  knock(pts, { wob: .1 });
  tone('P', pts, .3, { wob: .25, seed });
  outline('P', pts, { w: .95, seed: seed + 1, over: .03 });
  line('P', [x - w / 2 + 4, y, x - w / 2 + 4 + (w - 14) * k, y], { w: .6, seed: seed + 2, wob: .2 });
}
function miniGold(x, y, w, h, seed) {
  const pts = rectPts(x - w / 2, y - h / 2, w, h, 1);
  knock(pts, { wob: .1 });
  solid('Y', pts, { wob: .3, seed, dx: .5 });
  outline('B', pts, { w: 1.1, seed: seed + 1, over: .03 });
}
function drawLegend() {
  const L = LAY.legend, s = LAY === LAY_P ? 7 : 7.5;
  miniTicket(L.x + 11, L.y + 4, 22, 9, 2010);
  say('P', 'ERROR LOG', L.x + 28, L.y, s, { w: 1, seed: 2012 });
  const x2 = L.x + 28 + tw('ERROR LOG', s) + 22;
  miniGold(x2 + 11, L.y + 4, 22, 9, 2014);
  say('B', 'PLAN THAT PASSED', x2 + 28, L.y, s, { w: 1, seed: 2016 });
}
function drawTag(i, triesShown, lit) {
  const T = LAY.tag, r = LAY.rows[i], task = TASKS[i];
  const y = LAY === LAY_P ? r.y - 20 : r.y - T.h / 2;
  tsave(); ttr(T.x, y); trot((i - 1) * -.012);
  const n = rectPts(0, 0, T.w, T.h, 1);
  knock(n, { wob: .4 });
  tone('Y', n, lit ? .6 : .34, { wob: .5, seed: 2101 + i });
  const tape = rectPts(T.w / 2 - 20, -6, 40, 12, 0);
  tsave(); ttr(T.w / 2, 0); trot(.05 - i * .04); ttr(-T.w / 2, 0); knock(tape, { wob: .2 }); tone('Y', tape, .22, { wob: .5, seed: 2104 + i }); trest();
  if (T.one) {
    say('B', task.one, 10, 13, 10, { w: 1.35, seed: 2110 + i });
    say('B', 'TRIES ' + triesShown, T.w - 10, 13, 10, { align: 'right', w: 1.35, seed: 2120 + i + triesShown });
  } else {
    say('B', task.name[0], 12, 11, 10.5, { w: 1.45, seed: 2110 + i });
    say('B', task.name[1], 12, 27, 10.5, { w: 1.45, seed: 2113 + i });
    say('B', 'TRIES', 12, 47, 7.5, { w: 1, seed: 2116 + i });
    say('B', String(triesShown), 12 + tw('TRIES ', 7.5) + 2, 44, 12, { w: 1.7, seed: 2120 + i + triesShown });
  }
  trest();
}
function stampAt(x, y, pass, k, seed) {
  if (k <= 0) return;
  const S = LAY.strip.sq;
  const slam = 1 + .6 * (1 - eout(clamp(k / .22)));
  tsave(); ttr(x, y); tsc(slam); trot((h1(seed) * .12));
  if (!pass) {
    const pts = rectPts(-S / 2, -S / 2, S, S, 2);
    knock(pts, { wob: .2 });
    outline('P', pts, { w: 1.5, seed, wob: .4, press: .4 });
    line('P', [-S * .26, -S * .26, S * .26, S * .26], { w: 1.8, seed: seed + 1 });
    line('P', [S * .26, -S * .26, -S * .26, S * .26], { w: 1.8, seed: seed + 2 });
  } else {
    const r = S * .62;
    solid('Y', ellPts(0, 0, r, r, 22), { wob: .5, seed, dx: .6, dy: .4 });
    outline('B', ellPts(0, 0, r + .5, r + .5, 24), { w: 1.8, seed: seed + 1, wob: .4, press: .4 });
    line('B', [-r * .42, r * .02, -r * .1, r * .36, r * .48, -r * .34], { w: 2, seed: seed + 2 });
  }
  trest();
}
function stackTop(i, n) { const T = LAY.tray; return [T.stacks[i], T.base - 4 - n * T.th]; }
function drawStackCard(i, j, x, y, w) {
  const task = TASKS[i], pass = j === task.tries - 1;
  const jit = h1(i * 31 + j * 7) * 2.2;
  if (pass) miniGold(x + jit, y, w, LAY.tray.th - 1.2, 2200 + i * 20 + j);
  else miniTicket(x + jit, y, w - 2, LAY.tray.th - 1.6, 2300 + i * 20 + j);
}
function drawTray(counts) {
  const T = LAY.tray, x = T.cx, y = T.base, w = T.w;
  line('B', [x - w / 2 + 8, y - 26, x + w / 2 - 8, y - 27], { w: 1.4, seed: 2401 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < counts[i]; j++) { const p = stackTop(i, j); drawStackCard(i, j, p[0], p[1], T.cw); }
  const lip = [x - w / 2, y + 2, x + w / 2, y + 1, x + w / 2 - 6, y + 27, x - w / 2 + 6, y + 28];
  knock(lip, { wob: .2 });
  tone('Y', lip, .45, { wob: .4, seed: 2410 });
  outline('B', lip, { w: 1.9, seed: 2411, over: .04 });
  line('B', [x - w / 2, y + 2, x - w / 2 + 4, y - 24], { w: 1.4, seed: 2412 });
  line('B', [x + w / 2, y + 1, x + w / 2 - 4, y - 25], { w: 1.4, seed: 2413 });
  say('B', 'THE DATASET', x, y + 10, LAY === LAY_P ? 8.5 : 9.5, { align: 'center', w: 1.4, seed: 2414 });
}
function drawStackLabels(counts) {
  const T = LAY.tray, P = LAY === LAY_P;
  for (let i = 0; i < 3; i++) {
    const x = T.stacks[i];
    say('B', String(counts[i]), x, T.base + 36, P ? 12 : 14, { align: 'center', w: P ? 1.7 : 2, seed: 2420 + i * 3 + counts[i] });
    say('B', TASKS[i].short, x, T.base + (P ? 54 : 57), P ? 6.5 : 7.5, { align: 'center', w: .95, seed: 2430 + i });
  }
}
function drawNoLabels() {
  const N = LAY.note;
  tsave(); ttr(N.x, N.y); trot(N.rot);
  const n = rectPts(0, 0, N.w, N.h, 1);
  knock(n, { wob: .3 }); tone('Y', n, .34, { wob: .4, seed: 2440 });
  const tape = rectPts(N.w / 2 - 14, -5, 28, 10, 0); knock(tape, { wob: .2 }); tone('Y', tape, .2, { wob: .4, seed: 2443 });
  say('B', 'NO HUMAN', 9, 6, N.size, { w: 1.05, seed: 2441 });
  say('B', 'LABELS', 9, 8 + N.size * 1.45, N.size, { w: 1.05, seed: 2442 });
  trest();
}
function drawTrails() {
  // faint pencil trails from each task's last try to its stack
  if (LAY === LAY_P) return;
  for (let i = 0; i < 3; i++) {
    const r = LAY.rows[i], S = LAY.strip, k = TASKS[i].tries - 1;
    const x = S.x + S.sq / 2 + k * S.step + 18, y = stripY(r);
    const to = stackTop(i, TASKS[i].tries), mid = [(x + to[0]) / 2, Math.min(y, to[1]) - 40];
    const pts = bezPts([[x, y], [mid[0] - 40, mid[1]], [mid[0] + 40, mid[1]], [to[0], to[1] - 8]], 60);
    for (let j = 0; j + 6 < pts.length; j += 8) line('B', pts.slice(j, j + 6), { w: .7, seed: 2450 + i * 20 + j, wob: .2 });
    arrowAt('B', to[0], to[1] - 8, Math.PI / 2 + .2, 5, .8, 2460 + i);
  }
}
function drawSmallModel(ms) {
  const M = LAY.model;
  tsave(); ttr(M.x, M.y - ms.bounce); tsc(M.s);
  const body = superPts(0, 0, 17, 15, 2.3, 40, .1);
  tone('P', body, .55, { wob: .5, seed: 2501 });
  outline('B', body, { w: 1.9, seed: 2502 });
  line('B', [2, -15, 4, -21], { w: 1.3, seed: 2503 });
  solid('Y', ellPts(4.5, -22.5, 2.4, 2.4, 8), { wob: .1 }); outline('B', ellPts(4.5, -22.5, 2.4, 2.4, 8), { w: .9, seed: 2504 });
  for (const sx of [-1, 1]) {
    const ex = sx * 6 + ms.look * 2, ey = -4;
    if (ms.happy) line('B', [ex - 2.6, ey + 1, ex, ey - 1.6, ex + 2.6, ey + 1], { w: 1.4, seed: 2505 + sx });
    else { solid('B', ellPts(ex, ey, 2, 2.5, 10), { wob: .1, seed: 2507 + sx }); punch('B', ellPts(ex - .6, ey - 1, .6, .7, 6)); }
  }
  if (ms.chomp > 0) {
    const m = 1.5 + 4.5 * ms.chomp, mp = ellPts(ms.look * 2, 6, 5, m, 16);
    knock(mp, { wob: .1 }); solid('P', mp, { wob: .2, seed: 2510 }); outline('B', mp, { w: 1.2, seed: 2511 });
  } else line('B', catmull([-3 + ms.look * 2, 5, ms.look * 2, 7, 3 + ms.look * 2, 5], 3), { w: 1.2, seed: 2512 });
  if (ms.star > 0) {
    const k = eback(clamp(ms.star)), r = 7 * k, cy = -36;
    const sp = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; sp.push(Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    solid('Y', sp, { wob: .2, seed: 2513, dx: .4 }); outline('B', sp, { w: 1.1, seed: 2514, over: .05 });
  }
  trest();
  const P = LAY === LAY_P;
  const rx = LAY.W - (P ? 10 : 14), ly = M.y + 28 * M.s;
  say('B', '0.6B', rx, ly, P ? 7.5 : 8.5, { align: 'right', w: 1.15, seed: 2520 });
  say('B', ms.star > 0 ? 'SPECIALIST' : 'MODEL', rx, ly + (P ? 12 : 13), P ? 6.5 : 7.5, { align: 'right', w: 1, seed: ms.star > 0 ? 2521 : 2522 });
}
function drawHint() {
  const H = LAY.hint;
  say('B', 'TAP A TASK TO RUN IT', H.x, H.y, H.size, { align: H.align, w: H.size * .14, seed: 2601 });
  if (H.to) {
    line('B', catmull(H.to, 5), { w: 1.3, seed: 2602, wob: .3 });
    const a = H.to, n = a.length;
    arrowAt('B', a[n - 2], a[n - 1], Math.atan2(a[n - 1] - a[n - 3], a[n - 2] - a[n - 4]), 6, 1.3, 2603);
  }
}

/* ------------------------------------------------------------------ state */
const fig = document.getElementById('fig-pile');
const cvs = document.getElementById('pile');
const press = new Press(cvs, w => (w < 560 ? LAY_P : LAY_D), lay => { LAY = lay; drawTitle(); drawLegend(); }, 23);
const ui = {
  all: document.getElementById('pile-all'), distill: document.getElementById('pile-distill'), reset: document.getElementById('pile-reset'),
  live: document.getElementById('pile-live'), hits: [0, 1, 2].map(i => document.getElementById('pile-hit' + (i + 1))),
};
/* run[i]: seconds since that task's run began, or Infinity when complete */
const st = { run: [Infinity, Infinity, Infinity], distill: null, eaten: 0, order: [], done: false, touched: false, clock: 0 };
const mode = QS.get('f2');
if (FIXED_T !== null && mode === 'run') st.run = [FIXED_T, FIXED_T, FIXED_T];
if (FIXED_T !== null && mode === 'distill') { st.distill = FIXED_T; st.order = eatOrder(); }

function landed(i, tr) {
  const task = TASKS[i]; if (tr === Infinity) return task.tries;
  let n = 0; for (let k = 0; k < task.tries; k++) if (tr >= k * ATT + LIFT + FLY) n++;
  return n;
}
function shownTries(i, tr) { const task = TASKS[i]; if (tr === Infinity) return task.tries; return Math.min(task.tries, Math.floor(tr / ATT) + 1); }
function runLength(i) { return (TASKS[i].tries - 1) * ATT + LIFT + FLY + .05; }
function eatOrder() {
  const c = [0, 1, 2].map(i => TASKS[i].tries), o = [];
  while (c.some(v => v > 0)) { let best = 2; for (let i = 2; i >= 0; i--) if (c[i] > c[best]) best = i; o.push([best, c[best] - 1]); c[best]--; }
  return o;
}
function distillLength() { return .25 + st.order.length * EAT + EAT_FLY + .9; }

function runTask(i) {
  st.touched = true;
  if (st.distill !== null || st.done) { st.distill = null; st.done = false; st.eaten = 0; }
  st.run[i] = REDUCE ? Infinity : 0;
  ui.live.textContent = TASKS[i].said;
  figObj.dirty = true;
}
ui.hits.forEach((b, i) => b.addEventListener('click', () => runTask(i)));
ui.all.addEventListener('click', () => { [0, 1, 2].forEach(runTask); ui.live.textContent = 'All three tasks run. The hardest task leaves ten cards, the easiest leaves one.'; });
ui.distill.addEventListener('click', () => {
  st.touched = true;
  st.run = [Infinity, Infinity, Infinity];
  st.order = eatOrder(); st.eaten = 0;
  if (REDUCE) { st.distill = null; st.done = true; } else { st.distill = 0; st.done = false; }
  ui.live.textContent = 'The 0.6B model is trained on copies of all fifteen cards and becomes a specialist. The dataset keeps them.';
  figObj.dirty = true;
});
ui.reset.addEventListener('click', () => { st.run = [Infinity, Infinity, Infinity]; st.distill = null; st.done = false; st.eaten = 0; ui.live.textContent = 'Reset.'; figObj.dirty = true; });

function layoutHits() { ui.hits.forEach((b, i) => placeHit(b, LAY, ...rowBox(i))); }

const figObj = {
  el: fig, dirty: true,
  update(dt) {
    st.clock += dt;
    let moving = false;
    for (let i = 0; i < 3; i++) if (st.run[i] !== Infinity) { st.run[i] += dt; moving = true; if (st.run[i] > runLength(i)) st.run[i] = Infinity; }
    if (st.distill !== null) { st.distill += dt; moving = true; if (st.distill > distillLength()) { st.distill = null; st.done = true; } }
    if (moving) this.dirty = true;
  },
  draw(boil) {
    press.frame(boil, () => {
      const counts = [0, 1, 2].map(i => landed(i, st.run[i]));
      // distill: cards leave the stacks in eat order
      let eaten = 0, flying = null, ms = { look: 0, chomp: 0, happy: false, bounce: 0, star: 0 };
      if (st.distill !== null || st.done) {
        const td = st.done ? Infinity : st.distill;
        const t0 = .25;
        eaten = st.done ? st.order.length : clamp(Math.floor((td - t0) / EAT) + 1, 0, st.order.length);
        const tl = td - t0 - (eaten - 1) * EAT;
        if (!st.done && eaten > 0 && tl < EAT_FLY) flying = { e: eaten - 1, k: tl / EAT_FLY };
        const eatEnd = t0 + st.order.length * EAT + EAT_FLY;
        if (!st.done && td < eatEnd) { ms.chomp = Math.abs(Math.sin((td - t0) * 22)); ms.look = -1; ms.bounce = Math.abs(Math.sin((td - t0) * 11)) * 2; }
        else { ms.happy = true; ms.star = st.done ? 1 : clamp((td - eatEnd) / .4); ms.bounce = st.done ? 0 : Math.abs(Math.sin((td - eatEnd) * 9)) * 4 * (1 - clamp((td - eatEnd) / .9)); }
      } else if (!REDUCE && FIXED_T === null) {
        const b = (st.clock + 1.3) % 3.8; if (b < .12) ms.happy = true; // blink
      }
      drawNoLabels();
      drawTray(counts);
      drawStackLabels(counts);
      drawSmallModel(ms);
      // rows
      for (let i = 0; i < 3; i++) {
        const tr = st.run[i], task = TASKS[i], r = LAY.rows[i], S = LAY.strip, y = stripY(r);
        drawTag(i, shownTries(i, tr), tr !== Infinity);
        for (let k = 0; k < task.tries; k++) {
          const ka = tr === Infinity ? 1 : (tr - k * ATT);
          if (ka <= 0) continue;
          const x = S.x + S.sq / 2 + k * S.step;
          stampAt(x, y, k === task.tries - 1, tr === Infinity ? 1 : ka, 2700 + i * 40 + k);
          // card flying to the stack
          if (tr !== Infinity) {
            const kf = (tr - k * ATT - LIFT) / FLY;
            if (kf > 0 && kf < 1) {
              const to = stackTop(i, k), e = eio(kf);
              const px = lerp(x, to[0], e), py = lerp(y + 14, to[1], e) - Math.sin(kf * Math.PI) * (LAY === LAY_P ? 40 : 70);
              tsave(); ttr(px, py); trot((1 - e) * .5 * (i % 2 ? 1 : -1));
              if (k === task.tries - 1) miniGold(0, 0, lerp(26, LAY.tray.cw, e), LAY.tray.th - 1.2, 2800 + i * 20 + k);
              else miniTicket(0, 0, lerp(24, LAY.tray.cw - 2, e), LAY.tray.th - 1.6, 2900 + i * 20 + k);
              trest();
            }
          }
        }
      }
      if (flying) {
        // a copy of the card goes into the model; the dataset keeps the original
        const [si, sj] = st.order[flying.e], from = stackTop(si, sj), M = LAY.model, k = eio(clamp(flying.k));
        const px = lerp(from[0], M.x - 2, k), py = lerp(from[1], M.y + 6 * M.s, k) - Math.sin(k * Math.PI) * 50;
        const hl = rectPts(from[0] - LAY.tray.cw / 2 - 3, from[1] - LAY.tray.th / 2 - 1, LAY.tray.cw + 6, LAY.tray.th + 2, 1);
        outline('B', hl, { w: 1.2, seed: 2950 + flying.e, over: .02 });
        tsave(); ttr(px, py); tsc(lerp(.9, .25, k)); trot(-k * .8);
        const cp = rectPts(-LAY.tray.cw / 2, -LAY.tray.th / 2, LAY.tray.cw, LAY.tray.th - 1, 1);
        knock(cp, { wob: .1 }); outline(TASKS[si].tries - 1 === sj ? 'B' : 'P', cp, { w: 1.1, seed: 2960 + flying.e, over: .03 });
        trest();
      }
      if (!st.touched && st.distill === null && !st.done && st.run.every(v => v === Infinity) && QS.get('hint') !== '0') drawHint();
    });
  },
};
function relayout() { press.resize(); LAY = press.lay; layoutHits(); figObj.dirty = true; }
relayout();
registerFigure(figObj);
figObj.draw(0);
let rz = null;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (cvs.parentElement.clientWidth !== press.wCss) { relayout(); figObj.draw(Math.max(0, figObj.drawnBoil)); } }, 140); });
})();
