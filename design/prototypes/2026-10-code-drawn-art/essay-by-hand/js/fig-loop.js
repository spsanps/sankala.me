/* =============================================================================
   fig-loop.js — Figure 1: the loop, driven by the reader.
   The scene is the riso zine loop from ../explainer/ (an illustrative task:
   put a sliced apple in the fridge). The reader steps through the three tries,
   scrubs the timeline, and opens each error log to read what the evaluator said
   and what changed in the plan. The two failures are the two kinds the
   write-up names: an implied OPEN action, and the new identifier an object
   gets after it is sliced.
   ========================================================================== */
(() => {
const LOOP = 16;
const FPS = 12;
/* ================================================================ LAYOUTS */
const LAY_D = {
  W: 960, H: 580,
  title: { x: 40, y: 30, size: 34 },
  task: { x: 668, y: 28, w: 256, h: 80, rot: -.032, size: 13 },
  model: { x: 172, y: 258, s: 1.12 },
  desk: { x: 44, y: 334, w: 286, h: 96 },
  board: { x: 226, y: 348, rot: -.03, s: 1.14 },
  spike: { x: 358, y: 436 },
  box: { x: 582, y: 156, s: 1.16 },
  clip: { x: 548, y: 238, rot: .07, s: .86 },
  tray: { x: 478, y: 394, s: 1.08 },
  small: { x: 566, y: 476, s: 1.25 },
  arcTop: [[334, 276], [366, 150], [452, 118], [508, 188]],
  arcBot: [[722, 490], [640, 572], [460, 572], [372, 462]],
  cardPath: [[226, 348], [310, 170], [430, 120], [548, 238]],
  tixPath: [[756, 458], [680, 590], [450, 590], [358, 404]],
  plan: { x: 410, y: 128, size: 12 },
  err: { x: 470, y: 556, size: 12 },
  lblModel: { x: 190, y: 448, size: 9.5 },
  lblSmall: { x: 566, y: 503, size: 8 },
  tixS: .78,
};
const LAY_P = {
  W: 360, H: 744,
  title: { x: 16, y: 18, size: 24 },
  task: { x: 16, y: 58, w: 328, h: 46, rot: -.016, size: 10.5, oneLine: true },
  model: { x: 150, y: 192, s: .8 },
  desk: { x: 66, y: 244, w: 282, h: 60 },
  board: { x: 222, y: 250, rot: -.03, s: .92 },
  spike: { x: 34, y: 352 },
  box: { x: 38, y: 446, s: .95 },
  clip: { x: 290, y: 424, rot: .07, s: .58 },
  tray: { x: 178, y: 388, s: .9 },
  small: { x: 64, y: 400, s: 1 },
  arcTop: [[318, 268], [358, 300], [358, 352], [334, 388]],
  arcBot: [[126, 728], [16, 738], [2, 440], [30, 366]],
  cardPath: [[222, 250], [330, 210], [372, 330], [290, 424]],
  tixPath: [[180, 698], [20, 744], [0, 430], [34, 318]],
  plan: { x: 340, y: 340, size: 10, align: 'right' },
  err: { x: 22, y: 560, size: 9, vertical: true },
  lblModel: { x: 206, y: 318, size: 8 },
  lblSmall: { x: 64, y: 424, size: 7 },
  tixS: .6,
};
let LAY = LAY_D;

/* sim geometry derived from the evaluator box */
const BW = 300, BH = 240;
function boxXY(x, y) { const b = LAY.box; return [b.x + x * b.s, b.y + y * b.s]; }
function slotXY() { return boxXY(150, BH); }
function simGeo() {
  const b = { x: 0, y: 0, w: BW, h: BH };
  const inner = { x: b.x + 12, y: b.y + 36, w: b.w - 24, h: b.h - 50 };
  const floor = inner.y + inner.h - 10;
  const counter = { x0: inner.x + 8, x1: inner.x + 86, top: floor - 58 };
  const fridge = { x0: inner.x + inner.w - 72, x1: inner.x + inner.w - 8, top: floor - 150 };
  return {
    inner, floor, counter, fridge,
    apple: [inner.x + 38, counter.top - 11],
    knife: [inner.x + 68, counter.top - 2],
    home: inner.x + 124,
    bonkX: fridge.x0 - 30,
    openX: fridge.x0 - 52,
    shelf: [fridge.x0 + 34, fridge.top + 104],
    clock: [inner.x + 150, inner.y + 30],
  };
}

/* ================================================================ TIMELINE */
const TL = {
  eat: [.12, .9, 1.75],
  tries: [
    { start: .3, write: [.35, 2.25], fly: [2.3, 2.95], sim: [3.0, 4.7], stamp: 4.75, print: [5.0, 5.4], back: [5.45, 6.2], tear: [5.45, 6.05], wipe: [5.5, 5.9], idea: [6.2, 6.5] },
    { start: 6.3, shift: [6.3, 6.5], write: [6.5, 7.15], hl: [7.15, 7.35], fly: [7.4, 8.0], sim: [8.0, 9.8], stamp: 9.85, print: [10.1, 10.4], back: [10.45, 11.2], tear: [10.45, 11.05], wipe: [10.5, 10.9], idea: [11.2, 11.45] },
    { start: 11.3, strike: [11.4, 11.6], write: [11.6, 12.05], hl: [12.05, 12.2], fly: [12.2, 12.7], sim: [12.7, 14.0], stamp: 14.05, toTray: [14.45, 15.05], tix: [14.55, 15.15], wipe: [15.3, 15.7], tearSheet: [15.35, 15.85] },
  ],
  unHL: [15.4, 15.85],
};
const LINES = { grasp: 'GRASP APPLE', slice: 'SLICE APPLE', open: 'OPEN FRIDGE', put: 'PUT APPLE IN FRIDGE' };
const TICKETS = [['FRIDGE IS', 'CLOSED'], ["'APPLE' NO", 'LONGER EXISTS']];

/* desk card content as a function of time */
function cardState(t) {
  const T = TL.tries;
  const st = { tally: 0, rows: [], strike: 0, word: 0, wordHL: 0, cursor: null, writing: false, blank: false };
  if (t < T[0].start) { st.blank = true; return st; }
  st.tally = t >= T[2].start ? 3 : t >= T[1].start ? 2 : 1;
  const w1 = T[0].write; const third = (w1[1] - w1[0]) / 3;
  const shift = seg(t, ...(T[1].shift));
  st.rows.push({ text: LINES.grasp, n: 1, row: 0, rv: seg(t, w1[0], w1[0] + third) });
  st.rows.push({ text: LINES.slice, n: 2, row: 1, rv: seg(t, w1[0] + third, w1[0] + 2 * third) });
  st.rows.push({ text: LINES.put, n: shift > .5 ? 4 : 3, row: 2 + eio(shift), rv: seg(t, w1[0] + 2 * third, w1[1]), put: true });
  if (t >= T[1].write[0]) st.rows.push({ text: LINES.open, n: 3, row: 2, rv: seg(t, ...T[1].write), hl: seg(t, ...T[1].hl) });
  st.strike = seg(t, ...T[2].strike);
  st.word = seg(t, ...T[2].write);
  st.wordHL = seg(t, ...T[2].hl);
  for (const T_ of [T[0].write, T[1].write, T[2].strike, T[2].write]) if (inR(t, T_[0], T_[1])) st.writing = true;
  return st;
}

/* ================================================================ DRAWING */
const CW = 196, CH = 98;
function drawCard(cs, x, y, rot, s, extra = {}) {
  tsave(); ttr(x, y); trot(rot); tsc(s);
  const pts = rectPts(-CW / 2, -CH / 2, CW, CH, 1.5);
  knock(pts);
  outline('B', pts, { w: 1.7, seed: 401, wob: .5 });
  // dog-ear
  line('B', [CW/2 - 14, -CH/2, CW/2 - 14, -CH/2 + 12, CW/2, -CH/2 + 12], { w: 1.1, seed: 402 });
  if (extra.sheetEdges) {
    line('B', [-CW/2 + 3, CH/2 + 3.5, CW/2 - 1, CH/2 + 3], { w: 1, seed: 404 });
    line('B', [-CW/2 + 6, CH/2 + 7, CW/2 - 4, CH/2 + 6.5], { w: .9, seed: 405 });
  }
  let cursor = null;
  if (!cs.blank) {
    say('B', 'PLAN', -CW/2 + 10, -CH/2 + 8, 7, { w: .95, seed: 77 });
    say('B', 'TRY', 30, -CH/2 + 8, 7, { w: .95, seed: 78 });
    for (let i = 0; i < cs.tally; i++) line('B', [54 + i * 5.5, -CH/2 + 7, 53 + i * 5.5 + (i % 2) * .6, -CH/2 + 16.5], { w: 1.25, seed: 79 + i });
    line('B', [-CW/2 + 8, -CH/2 + 21, CW/2 - 22, -CH/2 + 20.4], { w: .8, seed: 81, wob: .3 });
    const x0 = -CW/2 + 24, y0 = -CH/2 + 28, lh = 15.5, size = 7.4;
    for (const r of cs.rows) {
      const ry = y0 + r.row * lh;
      if (r.hl > 0) solid('Y', rectPts(x0 - 3, ry - 2.2, (tw(r.text, size) + 6) * r.hl, size + 4, 1), { wob: .7, seed: 90 + r.n, dy: .5 });
      if (r.rv > 0) {
        say('B', String(r.n), -CW/2 + 11, ry, size, { w: .95, seed: 60 + r.n * 3 + (r.n === 4 ? 1 : 0) });
        const res = say('B', r.text, x0, ry, size, { w: .95, reveal: r.rv, seed: hstr(r.text) });
        if (r.rv < 1 && res.cursor) cursor = res.cursor;
      }
      if (r.put) {
        const ax = x0 + tw('PUT ', size), aw = tw('APPLE', size);
        if (cs.strike > 0) {
          line('B', [ax - 2, ry + 5.4, ax - 2 + (aw + 4) * cs.strike, ry + 4.6], { w: 1.3, seed: 95, wob: .5 });
          if (cs.strike < 1) cursor = [ax - 2 + (aw + 4) * cs.strike, ry + 4.6];
        }
        if (cs.word > 0) {
          const wy = ry - 7.6, ws = 5.8;
          if (cs.wordHL > 0) solid('Y', rectPts(ax - 2, wy - 1.8, (tw('SLICES', ws) + 4) * cs.wordHL, ws + 3.6, 1), { wob: .5, seed: 97 });
          line('B', [ax + aw * .42 - 2.4, ry + 1.6, ax + aw * .42, ry - 1.4, ax + aw * .42 + 2.4, ry + 1.6], { w: .9, seed: 96, reveal: clamp(cs.word * 4) });
          const res = say('B', 'SLICES', ax, wy, ws, { w: .8, reveal: clamp(cs.word * 1.15 - .15), seed: 98 });
          if (cs.word < 1 && res.cursor) cursor = res.cursor;
        }
      }
    }
  }
  for (const st of (extra.stamps || [])) drawStamp(st);
  trest();
  if (!cursor) return null;
  const m = new DOMMatrix().translate(x, y).rotate(rot * 180 / Math.PI).scale(s);
  const p = m.transformPoint({ x: cursor[0], y: cursor[1] });
  return [p.x, p.y];
}

function drawStamp(st) {
  const k = st.k; if (k <= 0) return;
  const slam = 1 + .55 * (1 - eout(clamp(k / .35)));
  tsave(); ttr(st.x, st.y); trot(st.rot); tsc(slam);
  if (st.type === 'fail') {
    const w = 46, h = 22;
    outline('P', rectPts(-w/2, -h/2, w, h, 2.5), { w: 2.1, seed: 501, wob: .5, press: .4 });
    outline('P', rectPts(-w/2 + 3.5, -h/2 + 3.5, w - 7, h - 7, 1.5), { w: 1, seed: 502, wob: .4, press: .3 });
    say('P', 'FAIL', 0, -4.6, 9.4, { align: 'center', w: 1.9, seed: 503, gj: .3, track: 1.6 });
    roughen('P', rectPts(-w/2 - 3, -h/2 - 3, w + 6, h + 6, 0), .45);
  } else {
    const r = 27;
    solid('Y', ellPts(0, 0, r - 1, r - 1, 40), { wob: .9, seed: 511, dx: .8, dy: .5 });
    outline('B', ellPts(0, 0, r, r, 44), { w: 2.4, seed: 512, wob: .5, press: .4 });
    outline('B', ellPts(0, 0, r - 4.5, r - 4.5, 40), { w: 1, seed: 513, wob: .4, press: .3 });
    say('B', 'PASS', 0, -7.6, 11, { align: 'center', w: 2.1, seed: 514, gj: .3, track: 1.5 });
    line('B', [-6.5, 9, -2.5, 13, 7, 5.5], { w: 2, seed: 515 });
    roughen('B', ellPts(0, 0, r + 4, r + 4, 24), .35);
  }
  trest();
}

function drawTicket(lines, x, y, rot, s, printed = 1, hole = false) {
  const w = 86, h = 50 * printed;
  if (h < 1) return;
  tsave(); ttr(x, y); trot(rot); tsc(s);
  const pts = [];
  pts.push(-w/2, 0, w/2, 0);
  const teeth = 9;
  for (let i = 0; i <= teeth * 2; i++) { const xx = w/2 - w * i / (teeth * 2); pts.push(xx, h - (i % 2 ? 0 : 3.2)); }
  knock(pts, { wob: .3 });
  line('P', pts.concat([-w/2, 0]), { w: .9, seed: 601, wob: .3, press: .2 });
  tsave(); tclipRect(-w/2, 0, w, h);
  say('P', 'ERROR LOG', -w/2 + 6, 5, 4.8, { w: .7, seed: 602, gj: .2 });
  for (let i = 0; i < 9; i++) line('P', [6 + i * 4.2, 7.2, 8 + i * 4.2, 7.2], { w: .6, seed: 603 + i });
  line('P', [-w/2 + 6, 14.5, w/2 - 6, 14.5], { w: .55, seed: 612, wob: .2 });
  say('P', lines[0], -w/2 + 6, 19, 7.2, { w: 1.05, seed: 613 + hstr(lines[0]) % 50 });
  say('P', lines[1], -w/2 + 6, 31, 7.2, { w: 1.05, seed: 614 + hstr(lines[1]) % 50 });
  trest();
  if (hole) { const hp = ellPts(0, 4.5, 2, 2, 10); knock(hp, { wob: .1 }); }
  trest();
}

/* ------------------------------------------------------- the frontier model */
function drawModel(ms) {
  const L = LAY.model;
  tsave(); ttr(L.x, L.y + ms.bob); tsc(L.s);
  const body = superPts(0, 0, 46, 50, 2.5, 64, .07);
  // sprout
  line('B', [0, -49, -1, -58, 2, -66], { w: 1.8, seed: 701 });
  const leafL = [2, -66, -8, -74, -15, -70, -7, -63], leafR = [2, -66, 10, -76, 17, -71, 9, -64];
  solid('Y', catmull(leafL.concat(leafL.slice(0, 2)), 4), { wob: .3, seed: 702, dx: .7 });
  tone('B', catmull(leafL.concat(leafL.slice(0, 2)), 4), .45, { wob: .3, seed: 702 });
  outline('B', catmull(leafL.concat(leafL.slice(0, 2)), 4), { w: 1.3, seed: 703 });
  solid('Y', catmull(leafR.concat(leafR.slice(0, 2)), 4), { wob: .3, seed: 704, dx: .7 });
  tone('B', catmull(leafR.concat(leafR.slice(0, 2)), 4), .45, { wob: .3, seed: 704 });
  outline('B', catmull(leafR.concat(leafR.slice(0, 2)), 4), { w: 1.3, seed: 705 });
  // body
  solid('Y', body, { wob: 1.1, seed: 710, dx: 1.4, dy: .8 });
  const cB = LY.B; cB.save(); cB.beginPath(); blobPath(cB, body, { wob: 0 }); cB.clip();
  cB.beginPath(); cB.rect(-60, -60, 120, 120); blobPath(cB, ellPts(-12, -14, 50, 52, 40), { wob: .5, seed: 711 });
  cB.fillStyle = tonePat(cB, 'B', .3); cB.fill('evenodd'); cB.restore();
  outline('B', body, { w: 2.5, seed: 712, wob: .7 });
  // cheeks
  tone('P', ellPts(-26, 9, 8.5, 5.2, 20), .55, { wob: .4, seed: 713 });
  tone('P', ellPts(26, 9, 8.5, 5.2, 20), .55, { wob: .4, seed: 714 });
  // eyes
  const gx = ms.gaze[0] * 3.2, gy = ms.gaze[1] * 2.6;
  for (const sx of [-1, 1]) {
    const ex = sx * 15 + gx, ey = -5 + gy;
    if (ms.eyes === 'happy') line('B', [ex - 5, ey + 2, ex, ey - 3.5, ex + 5, ey + 2], { w: 2.2, seed: 720 + sx });
    else if (ms.eyes === 'wince') line('B', [ex - 4.5 * sx, ey - 4, ex + 3.5 * sx, ey, ex - 4.5 * sx, ey + 4], { w: 2, seed: 722 + sx });
    else if (ms.blink > .5) line('B', [ex - 4.6, ey + .5, ex, ey + 2, ex + 4.6, ey + .5], { w: 2, seed: 724 + sx });
    else {
      const ry = ms.eyes === 'wide' ? 6.4 : 5.6, rx = ms.eyes === 'wide' ? 5 : 4.4;
      solid('B', ellPts(ex, ey, rx, ry, 18), { wob: .25, seed: 726 + sx });
      punch('B', ellPts(ex - 1.5 + gx * .2, ey - 2.2, 1.5, 1.6, 10));
    }
    if (ms.brows) line('B', [ex - 5, ey - 10 + (sx > 0 ? 2 : -1) * ms.brows, ex + 5, ey - 10 + (sx > 0 ? -1 : 2) * ms.brows], { w: 1.4, seed: 728 + sx });
  }
  // mouth
  if (ms.mouth === 'open') { solid('P', ellPts(0, 15, 4, 4.6, 16), { wob: .3, seed: 730 }); outline('B', ellPts(0, 15, 4, 4.6, 16), { w: 1.5, seed: 731 }); }
  else if (ms.mouth === 'grin') { const m = [-9, 11, 0, 21, 9, 11]; const mp = catmull([-9, 11, -4, 18, 0, 20, 4, 18, 9, 11], 4).concat([-9, 11]); solid('P', mp, { wob: .3, seed: 732 }); outline('B', mp, { w: 1.6, seed: 733 }); void m; }
  else if (ms.mouth === 'worry') line('B', catmull([-5, 16, -2, 13.6, 2, 14.2, 5, 15.5], 4), { w: 1.6, seed: 734 });
  else line('B', catmull([-5, 12.5, -2, 15.4, 2, 15.4, 5, 12.5], 4), { w: 1.6, seed: 735 });
  if (ms.sweat > 0) {
    const dy = ms.sweat * 6, dp = catmull([38, -30 + dy, 34.5, -22 + dy, 38, -18.5 + dy, 41.5, -22 + dy, 38, -30 + dy], 4);
    tone('B', dp, .35, { wob: .2, seed: 736 }); outline('B', dp, { w: 1.2, seed: 737 });
  }
  if (ms.bang > 0) say('P', '!', 46, -74 - 6 * eout(ms.bang), 18, { w: 2.6, seed: 738 });
  trest();
}
function drawArmTube(p, wOut = 10.4, wIn = 6, seed = 740) {
  line('B', p, { w: wOut, seed, wob: .4, press: .2, ta: .1, tb: .1 });
  const ctxs = LY; for (const k in ctxs) { const c = ctxs[k]; c.save(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); penPath(c, p, { w: wIn, seed: seed + BOIL * 131, wob: .4, press: 0, jit: .4 }); c.fill(); c.restore(); }
  line('Y', p, { w: wIn + 1.2, seed: seed + 1, wob: .4, press: 0 });
}
function drawPencil(tip, ang, len = 30) {
  const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, hw = 2.9;
  const P = (a, b) => [tip[0] + ux * a + nx * b, tip[1] + uy * a + ny * b];
  const body = [...P(7, -hw), ...P(len, -hw), ...P(len, hw), ...P(7, hw)];
  knock(body.concat(P(0, 0)), { wob: .1 });
  solid('Y', body, { wob: .3, seed: 750, dx: .5 });
  const er = [...P(len, -hw), ...P(len + 5, -hw), ...P(len + 5, hw), ...P(len, hw)];
  solid('P', er, { wob: .2, seed: 751 });
  outline('B', [...P(0, 0), ...P(7, -hw), ...P(len + 5, -hw), ...P(len + 5, hw), ...P(7, hw)], { w: 1.2, seed: 752, wob: .25, over: .02 });
  line('B', [...P(7, -hw), ...P(7, hw)], { w: .9, seed: 753 });
  solid('B', [...P(0, 0), ...P(2.6, -1.1), ...P(2.6, 1.1)], { wob: 0, seed: 754 });
}
function drawDesk() {
  const d = LAY.desk;
  const front = rectPts(d.x, d.y, d.w, d.h, 2);
  knock(front);
  tone('Y', front, .32, { wob: .6, seed: 760 });
  outline('B', front, { w: 2.2, seed: 761, wob: .6 });
  line('B', [d.x - 6, d.y + 1, d.x + d.w + 6, d.y - .5], { w: 2.6, seed: 762, wob: .5 });
  for (let i = 0; i < 4; i++) {
    const y = d.y + 18 + i * 16; const pts = [];
    for (let x = d.x + 10 + (i % 2) * 18; x < d.x + d.w - 12; x += 8) pts.push(x, y + Math.sin(x * .07 + i) * 1.6);
    line('B', pts, { w: .8, seed: 763 + i, wob: .4, reveal: .55 + .1 * (i % 3) });
  }
  // knot
  outline('B', ellPts(d.x + d.w * .7, d.y + d.h * .52, 6, 3, 16), { w: .8, seed: 768 });
  line('B', [d.x + 12, d.y + d.h, d.x + 14, d.y + d.h + 10], { w: 2.2, seed: 769 });
  line('B', [d.x + d.w - 12, d.y + d.h, d.x + d.w - 14, d.y + d.h + 10], { w: 2.2, seed: 770 });
}

/* ------------------------------------------------------------ the evaluator */
function drawBoxStatic() {
  tsave(); ttr(LAY.box.x, LAY.box.y); tsc(LAY.box.s);
  const b = { x: 0, y: 0, w: BW, h: BH }, g = simGeo(), I = g.inner;
  const outer = rectPts(b.x, b.y, b.w, b.h, 4);
  tone('B', outer, .22, { wob: .7, seed: 801 });
  knock(rectPts(I.x, I.y, I.w, I.h, 1), { wob: .3 });
  outline('B', outer, { w: 2.8, seed: 802, wob: .7 });
  outline('B', rectPts(I.x, I.y, I.w, I.h, 1), { w: 1.8, seed: 803, wob: .5 });
  // back wall + floor
  tone('Y', rectPts(I.x, I.y, I.w, g.floor - I.y, 0), .14, { wob: .2, seed: 804 });
  tone('Y', rectPts(I.x, g.floor, I.w, I.y + I.h - g.floor, 0), .5, { wob: .2, seed: 805 });
  line('B', [I.x, g.floor, I.x + I.w, g.floor], { w: 1.4, seed: 806 });
  for (let i = 1; i < 9; i++) line('B', [I.x + i * I.w / 9, g.floor + 1, I.x + i * I.w / 9 - 3, I.y + I.h], { w: .7, seed: 807 + i });
  // window on back wall
  const wx = I.x + 96, wy = I.y + 16;
  tone('B', rectPts(wx, wy, 34, 46, 1), .16, { wob: .3, seed: 820 });
  outline('B', rectPts(wx, wy, 34, 46, 1), { w: 1.3, seed: 821 });
  line('B', [wx + 17, wy, wx + 17, wy + 46], { w: 1, seed: 822 });
  line('B', [wx, wy + 23, wx + 34, wy + 23], { w: 1, seed: 823 });
  line('B', [wx - 3, wy + 48, wx + 37, wy + 48], { w: 1.6, seed: 824 });
  // backsplash tiles
  const C0 = g.counter, ty0 = C0.top - 44;
  tone('P', rectPts(C0.x0 + 2, ty0, C0.x1 - C0.x0 - 4, 44, 0), .1, { wob: .2, seed: 825 });
  for (let i = 1; i < 4; i++) line('B', [C0.x0 + 2, ty0 + i * 11, C0.x1 - 2, ty0 + i * 11], { w: .55, seed: 826 + i, wob: .2 });
  for (let i = 1; i < 6; i++) line('B', [C0.x0 + 2 + i * (C0.x1 - C0.x0 - 4) / 6, ty0, C0.x0 + 2 + i * (C0.x1 - C0.x0 - 4) / 6, C0.top], { w: .55, seed: 830 + i, wob: .2 });
  // pendant lamp
  const lx = C0.x0 + 40;
  line('B', [lx, I.y, lx, I.y + 22], { w: .9, seed: 836 });
  const shade = [lx - 12, I.y + 34, lx - 6, I.y + 22, lx + 6, I.y + 22, lx + 12, I.y + 34];
  solid('Y', shade.concat([lx - 12, I.y + 34]), { wob: .2, seed: 837, dx: .5 }); outline('B', shade.concat([lx - 12, I.y + 34]), { w: 1.3, seed: 838 });
  for (let i = 0; i < 3; i++) line('Y', [lx - 8 + i * 8, I.y + 39, lx - 12 + i * 12, I.y + 48], { w: 1.6, seed: 839 + i });
  // clock face
  const ck = g.clock;
  knock(ellPts(ck[0], ck[1], 13, 13, 24));
  outline('B', ellPts(ck[0], ck[1], 13, 13, 28), { w: 1.6, seed: 845 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line('B', [ck[0] + Math.cos(a) * 9.5, ck[1] + Math.sin(a) * 9.5, ck[0] + Math.cos(a) * 11, ck[1] + Math.sin(a) * 11], { w: i % 3 ? .7 : 1.2, seed: 846 + i }); }
  // header sign
  const sw = 132, sx = b.x + b.w / 2 - sw / 2, sy = b.y + 8;
  solid('Y', rectPts(sx, sy, sw, 22, 2), { wob: .5, seed: 830, dx: 1, dy: .6 });
  knock(rectPts(sx + 1, sy + 1, sw - 2, 20, 2), { wob: .2 });
  solid('Y', rectPts(sx, sy, sw, 22, 2), { wob: .5, seed: 830, dx: 1, dy: .6 });
  outline('B', rectPts(sx, sy, sw, 22, 2), { w: 1.6, seed: 831 });
  say('B', 'EVALUATOR', b.x + b.w / 2, sy + 5.6, 11, { align: 'center', w: 1.55, seed: 832 });
  for (const xx of [sx + 6, sx + sw - 6]) solid('B', ellPts(xx, sy + 11, 1.6, 1.6, 8), { wob: 0 });
  // counter
  const C = g.counter;
  const cab = rectPts(C.x0 + 3, C.top + 6, C.x1 - C.x0 - 6, g.floor - C.top - 6, 1);
  knock(cab); tone('Y', cab, .4, { wob: .4, seed: 840 }); tone('P', cab, .12, { wob: .4, seed: 841 });
  outline('B', cab, { w: 1.6, seed: 842 });
  const slab = rectPts(C.x0, C.top, C.x1 - C.x0, 6, 1);
  knock(slab); outline('B', slab, { w: 1.6, seed: 843 });
  line('B', [(C.x0 + C.x1) / 2, C.top + 10, (C.x0 + C.x1) / 2, g.floor - 4], { w: 1, seed: 844 });
  solid('B', ellPts((C.x0 + C.x1) / 2 - 6, C.top + 22, 1.6, 1.6, 8), { wob: 0 });
  solid('B', ellPts((C.x0 + C.x1) / 2 + 6, C.top + 22, 1.6, 1.6, 8), { wob: 0 });
  // fridge body + interior (door is dynamic)
  const F = g.fridge;
  const fb = rectPts(F.x0, F.top, F.x1 - F.x0, g.floor - F.top, 4);
  knock(fb);
  const inn = rectPts(F.x0 + 4, F.top + 4, F.x1 - F.x0 - 8, g.floor - F.top - 30, 2);
  tone('Y', inn, .62, { wob: .3, seed: 850 });
  outline('B', fb, { w: 1.9, seed: 851 });
  outline('B', inn, { w: 1, seed: 852 });
  for (const yy of [F.top + 40, F.top + 70]) line('B', [F.x0 + 6, yy, F.x1 - 6, yy], { w: 1.1, seed: 853 + yy });
  line('B', [F.x0, g.floor - 24, F.x1, g.floor - 24], { w: 1.2, seed: 856 });
  // a carton and a jar, so it reads as a fridge when it opens
  const cx0 = F.x0 + 12, cy0 = F.top + 40;
  const carton = [cx0, cy0, cx0, cy0 - 18, cx0 + 5, cy0 - 24, cx0 + 12, cy0 - 24, cx0 + 12, cy0];
  knock(carton.concat([cx0, cy0]), { wob: .1 }); tone('B', carton.concat([cx0, cy0]), .3, { wob: .2, seed: 870 });
  outline('B', carton.concat([cx0, cy0]), { w: 1.1, seed: 871 });
  const jx = F.x0 + 44, jy = F.top + 70;
  const jar = rectPts(jx - 7, jy - 15, 14, 15, 3);
  knock(jar); tone('P', jar, .5, { wob: .2, seed: 872 }); outline('B', jar, { w: 1.1, seed: 873 });
  solid('B', rectPts(jx - 6, jy - 19, 12, 4, 1), { wob: .1, seed: 874 });
  line('B', [F.x0 + 10, g.floor - 12, F.x0 + 22, g.floor - 12], { w: 1.5, seed: 857 });
  // slot
  solid('B', rectPts(150 - 48, BH - 3, 96, 5, 1.5), { wob: .2, seed: 860 });
  trest();
}

function drawClockHands(t) {
  const ck = simGeo().clock, a = (Math.floor(t * 2) / 2) / LOOP * TAU * 3 - Math.PI / 2, b = t / LOOP * TAU - Math.PI / 2;
  line('P', [ck[0], ck[1], ck[0] + Math.cos(a) * 9.5, ck[1] + Math.sin(a) * 9.5], { w: .9, seed: 859 });
  line('B', [ck[0], ck[1], ck[0] + Math.cos(b) * 6.5, ck[1] + Math.sin(b) * 6.5], { w: 1.5, seed: 858 });
}
function drawApple(x, y, r = 9, split = 0, seed = 870) {
  if (split <= 0) {
    const pts = catmull([x, y - r * .7, x + r * .9, y - r * .95, x + r * 1.05, y + r * .1, x + r * .55, y + r * .95, x, y + r * .8, x - r * .55, y + r * .95, x - r * 1.05, y + r * .1, x - r * .9, y - r * .95, x, y - r * .7], 3);
    solid('P', pts, { wob: .3, seed }); solid('Y', pts, { wob: .4, seed: seed + 1, dx: .6, dy: .4 });
    outline('B', pts, { w: 1.3, seed: seed + 2 });
    punch('P', ellPts(x - r * .45, y - r * .25, r * .17, r * .26, 8));
    line('B', [x, y - r * .68, x + 1, y - r * 1.25], { w: 1.2, seed: seed + 3 });
    const lf = catmull([x + 1, y - r * 1.1, x + 5, y - r * 1.55, x + 9, y - r * 1.25, x + 4, y - r * .95, x + 1, y - r * 1.1], 3);
    solid('Y', lf, { wob: .1, seed: seed + 4 }); solid('B', lf, { wob: .1, seed: seed + 5, dx: .3 });
  } else {
    const gap = 2.5 + split * 3;
    for (const sx of [-1, 1]) {
      const cx = x + sx * gap;
      const half = [];
      for (let i = 0; i <= 12; i++) { const a = (-90 + 180 * i / 12) * Math.PI / 180; half.push(cx + sx * Math.cos(a) * r * .95, y + Math.sin(a) * r * .9); }
      const shape = half.concat([cx, y + r * .9]);
      solid('P', shape, { wob: .2, seed: seed + 10 + sx }); solid('Y', shape, { wob: .3, seed: seed + 12 + sx, dx: .5 });
      const face = [];
      for (let i = 0; i <= 10; i++) { const a = (-80 + 160 * i / 10) * Math.PI / 180; face.push(cx + sx * Math.cos(a) * r * .55, y + Math.sin(a) * r * .72); }
      const fp = face.concat([cx, y + r * .7]);
      punch('P', fp);
      outline('B', shape, { w: 1.2, seed: seed + 14 + sx });
      solid('B', ellPts(cx + sx * 2, y - 1, .9, 1.4, 6), { wob: 0 });
    }
  }
}
function drawSlices(x, y, s = .8, seed = 880) {
  tsave(); ttr(x, y); tsc(s); drawApple(0, 0, 9, .2, seed); trest();
}
function drawKnife(x, y, ang) {
  tsave(); ttr(x, y); trot(ang);
  const blade = [0, -1.6, 12, -2.2, 16, 0, 12, 1.2, 0, 1.2];
  knock(blade, { wob: .1 }); outline('B', blade, { w: 1, seed: 890, over: .05 });
  const h = [-8, -1.8, 0, -1.8, 0, 1.8, -8, 1.8];
  solid('P', h, { wob: .2, seed: 891 }); solid('B', h, { wob: .2, seed: 892 });
  trest();
}
function drawFridgeDoor(open) {
  const g = simGeo(), F = g.fridge;
  const th = open * 100 * Math.PI / 180, hx = F.x1, wD = F.x1 - F.x0, top = F.top, bot = g.floor - 24;
  const fx = hx - wD * Math.cos(th), dd = 7 * Math.sin(th);
  const q = [hx, top, fx, top - dd, fx, bot + dd, hx, bot];
  const inside = Math.cos(th) < 0;
  knock(q, { wob: .2 });
  if (!inside) {
    tone('B', q, .1, { wob: .2, seed: 900 });
    const hxp = lerp(hx, fx, .82);
    line('B', [hxp, top + 30, hxp, top + 58], { w: 2.2, seed: 901 });
  } else {
    tone('Y', q, .3, { wob: .2, seed: 902 });
    for (const k of [.3, .55]) line('B', [hx, lerp(top, bot, k), fx, lerp(top - dd, bot + dd, k)], { w: .9, seed: 903 + k * 10 });
  }
  outline('B', q, { w: 1.7, seed: 905, over: .05 });
}

const RS = 1.32;
function drawRobot(r) {
  const g = simGeo();
  tsave(); ttr(r.x, g.floor - r.lift); tsc(RS);
  const f = r.face;
  // legs
  line('B', [-6, -8, -6.5, 0], { w: 2.2, seed: 910 });
  line('B', [6, -8, 6.5 + r.step, 0], { w: 2.2, seed: 911 });
  solid('B', ellPts(-7.5, -.5, 4, 1.8, 10), { wob: .1 }); solid('B', ellPts(7.5 + r.step, -.5, 4, 1.8, 10), { wob: .1 });
  // body
  const body = rectPts(-13, -40, 26, 32, 6);
  knock(body); outline('B', body, { w: 1.9, seed: 912 });
  const pan = rectPts(-7, -33, 14, 11, 2);
  tone('P', pan, .45, { wob: .2, seed: 913 }); outline('B', pan, { w: 1, seed: 914 });
  // head
  const hy = -53 + r.headBob;
  const head = ellPts(r.look * 1.5, hy, 11.5, 10.5, 24);
  knock(head); outline('B', head, { w: 1.9, seed: 915 });
  line('B', [0, hy - 10.5, 1, hy - 18], { w: 1.3, seed: 916 });
  solid('Y', ellPts(1, hy - 20, 3, 3, 10), { wob: .2, seed: 917 }); outline('B', ellPts(1, hy - 20, 3, 3, 10), { w: 1, seed: 918 });
  const ex = f * 4.5 + r.look * 3.5;
  if (r.mood === 'happy') line('B', [ex - 3.2, hy + 1, ex, hy - 2.2, ex + 3.2, hy + 1], { w: 1.7, seed: 919 });
  else if (r.mood === 'bonk') { line('B', [ex - 3, hy - 3, ex + 3, hy + 3], { w: 1.5, seed: 920 }); line('B', [ex + 3, hy - 3, ex - 3, hy + 3], { w: 1.5, seed: 921 }); }
  else { solid('B', ellPts(ex, hy, 2.6, 3.2, 12), { wob: .1, seed: 922 }); }
  // arm
  const sh = [f * 12, -33];
  const hand = r.hand ? [(r.hand[0] - r.x) / RS, (r.hand[1] - (g.floor - r.lift)) / RS] : [f * 16, -18];
  const mx = (sh[0] + hand[0]) / 2, my = (sh[1] + hand[1]) / 2, dx = hand[0] - sh[0], dy = hand[1] - sh[1], L = Math.hypot(dx, dy) || 1;
  const sag = 8 * f;
  const arm = catmull([sh[0], sh[1], mx - dy / L * sag, my + dx / L * sag + 3, hand[0], hand[1]], 6);
  line('B', arm, { w: 2.3, seed: 923, press: .3 });
  line('B', [-f * 12, -33, -f * 16, -20, -f * 15, -14], { w: 2.3, seed: 924, press: .3 });
  // gripper
  const ga = Math.atan2(dy, dx);
  line('B', arcPts(hand[0] + Math.cos(ga) * 2.5, hand[1] + Math.sin(ga) * 2.5, 3.6, 3.6, ga * 180 / Math.PI + 60, ga * 180 / Math.PI + 300, 8), { w: 1.5, seed: 925 });
  if (r.knife) drawKnife(hand[0] + 1, hand[1] + 2, Math.PI / 2 - .15 * f);
  if (r.hold) drawSlices(hand[0] + Math.cos(ga) * 6, hand[1] + Math.sin(ga) * 6 - 2, .78, 930);
  trest();
  // marks above head
  const top = [r.x, g.floor - r.lift - 78 * RS];
  if (r.mood === 'bonk' && r.stars > 0) {
    for (let i = 0; i < 3; i++) {
      const a = r.stars * 5 + i * TAU / 3, sx = top[0] + Math.cos(a) * 15, sy = top[1] + 6 + Math.sin(a) * 4;
      line('P', [sx - 3, sy, sx + 3, sy], { w: 1.4, seed: 940 + i }); line('P', [sx, sy - 3, sx, sy + 3], { w: 1.4, seed: 943 + i });
    }
  }
  if (r.q > 0) say('B', '?', top[0] + 6, top[1] - 4 - 4 * eout(r.q), 15, { w: 2.1, seed: 950, reveal: clamp(r.q * 2) });
  if (r.mood === 'happy' && r.joy > 0) {
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .5, rr = 16 + 4 * r.joy; line('Y', [top[0] + Math.cos(a) * rr, top[1] + 18 + Math.sin(a) * rr, top[0] + Math.cos(a) * (rr + 7), top[1] + 18 + Math.sin(a) * (rr + 7)], { w: 2.2, seed: 960 + i }); }
  }
}

/* sim state for a time (one try), returns full scene state */
function simState(t) {
  const g = simGeo(), T = TL.tries;
  const home = { x: g.home, face: -1, hand: null, knife: false, hold: false, mood: 'ok', step: 0, lift: 0, look: 0, headBob: 0, q: 0, stars: 0, joy: 0 };
  const st = { robot: { ...home }, apple: 'whole', split: 0, door: 0, inFridge: false, knifeOnCounter: true };
  const R = st.robot;
  const A = g.apple;
  const chopHand = (k, n) => { const ph = k * n * Math.PI; return [A[0] + 3, A[1] - 26 + 18 * Math.abs(Math.sin(ph))]; };
  const walk = (k, x0, x1) => { R.x = lerp(x0, x1, eio(k)); R.face = 1; R.step = Math.sin(k * Math.PI * 4) * 3; R.lift = Math.abs(Math.sin(k * Math.PI * 4)) * 1.5; };
  let tri = -1;
  for (let i = 0; i < 3; i++) if (t >= T[i].sim[0] && t < T[i].wipe[1]) tri = i;
  if (tri < 0) return st;
  const tt = t - T[tri].sim[0];
  // per-try schedules (seconds after sim start)
  const P = [
    { reach: .25, chop: .65, split: .5, grab: .8, walk: 1.4, end: 1.55 },
    { reach: .12, chop: .38, split: .28, grab: .48, walk: .9, open: 1.2, search: 1.8 },
    { reach: .08, chop: .28, split: .2, grab: .35, walk: .6, open: .78, place: 1.0, close: 1.22 },
  ][tri];
  if (tt < P.reach) { R.hand = [lerp(R.x - 18, A[0] + 2, eout(tt / P.reach)), lerp(g.floor - 26, A[1] - 7, eout(tt / P.reach))]; }
  else if (tt < P.chop) { const k = (tt - P.reach) / (P.chop - P.reach); R.hand = chopHand(k, 2); R.knife = true; st.knifeOnCounter = false; R.headBob = Math.sin(k * 12) * .8; }
  else if (tt < P.grab) { R.hand = [A[0] + 2, A[1] - 2]; }
  if (tt >= P.split) { st.apple = 'split'; st.split = clamp((tt - P.split) / .15); }
  if (tt >= P.grab) { st.apple = 'held'; R.hold = true; }
  if (tt >= P.grab) {
    const wk = clamp((tt - P.grab) / (P.walk - P.grab));
    const target = tri === 0 ? g.bonkX : g.openX;
    walk(wk, g.home, target);
    R.hand = [R.x + 24, g.floor - 44];
    if (wk >= 1) { R.step = 0; R.lift = 0; }
  }
  if (tri === 0 && tt >= P.walk) {
    const k = clamp((tt - P.walk) / (P.end - P.walk));
    R.x = g.bonkX - 7 * Math.sin(k * Math.PI) - (k >= 1 ? 4 : 0) * clamp((tt - P.end) / .1);
    R.hand = [R.x + 24, g.floor - 44];
    R.mood = 'bonk'; R.stars = tt; R.headBob = k < 1 ? Math.sin(k * 30) * 1.5 : 0;
    if (tt > P.end + .3) R.look = -.6;
  }
  if (tri >= 1 && tt >= P.walk) {
    const k = clamp((tt - P.walk) / (P.open - P.walk));
    st.door = eio(k);
    const F = g.fridge, th = st.door * 100 * Math.PI / 180, fx = F.x1 - (F.x1 - F.x0) * Math.cos(th);
    R.hand = [Math.min(fx, F.x1 - 4) - 3, F.top + 66];
    R.x = g.openX;
  }
  if (tri === 1 && tt >= P.open) {
    const k = clamp((tt - P.open) / (P.search - P.open));
    R.hand = [lerp(R.x + 24, R.x + 28, k), g.floor - 46];
    R.look = Math.sin(k * Math.PI * 3) * 1;
    R.face = R.look < 0 ? -1 : 1;
    R.q = clamp(k * 1.6);
    if (tt > P.search) { R.q = 1; R.look = -.4; }
  }
  if (tri === 2 && tt >= P.open) {
    const kp = clamp((tt - P.open) / (P.place - P.open));
    const S_ = g.shelf;
    if (tt < P.place) R.hand = [lerp(R.x + 24, S_[0], eio(kp)), lerp(g.floor - 44, S_[1] - 6, eio(kp))];
    if (tt >= P.place) { R.hold = false; st.inFridge = true; }
    const kc = clamp((tt - P.place) / (P.close - P.place));
    if (tt >= P.place) {
      st.door = 1 - eio(kc);
      const F = g.fridge, th = st.door * 100 * Math.PI / 180, fx = F.x1 - (F.x1 - F.x0) * Math.cos(th);
      R.hand = [Math.min(fx, F.x1 - 4) - 3, F.top + 66];
    }
    if (tt >= P.close) {
      R.mood = 'happy'; R.joy = clamp((tt - P.close) / .3); R.hand = [R.x + 18, g.floor - 84 - 5 * Math.sin((tt - P.close) * 10)];
      R.lift = Math.max(0, Math.sin((tt - P.close) * 9)) * 5 * Math.exp(-(tt - P.close) * 1.4);
    }
  }
  return st;
}

function drawSim(t) {
  tsave(); ttr(LAY.box.x, LAY.box.y); tsc(LAY.box.s);
  drawSimLocal(t);
  trest();
}
function drawSimLocal(t) {
  const g = simGeo(), I = g.inner, T = TL.tries;
  // which wipe is active?
  let wipe = null;
  for (const w of [T[0].wipe, T[1].wipe, T[2].wipe]) if (inR(t, w[0], w[1])) wipe = w;
  const draw = (st) => {
    drawClockHands(t);
    if (st.inFridge) drawSlices(g.shelf[0], g.shelf[1] - 5, 1, 970);
    drawFridgeDoor(st.door);
    if (st.apple === 'whole') drawApple(g.apple[0], g.apple[1], 11);
    else if (st.apple === 'split') drawApple(g.apple[0], g.apple[1], 11, st.split);
    if (st.knifeOnCounter) drawKnife(g.knife[0], g.knife[1], -.08);
    drawRobot(st.robot);
  };
  if (!wipe) { draw(simState(t)); return; }
  const k = eio(seg(t, wipe[0], wipe[1])), px = I.x + I.w * k;
  const before = simState(wipe[0] - .001);
  tsave(); tclipRect(px, I.y, I.x + I.w - px, I.h); draw(before); trest();
  tsave(); tclipRect(I.x, I.y, px - I.x, I.h); draw(simState(LOOP + 1)); trest();
  // the reset sweep
  tone('Y', rectPts(px - 10, I.y + 1, 10, I.h - 2, 0), .7, { wob: .2, seed: 990 });
  line('B', [px, I.y + 2, px - 1, I.y + I.h - 2], { w: 1.4, seed: 991 });
}

/* ---------------------------------------------------- gold tray + small model */
const BASE_TABS = [1, 0, 3, 1, 2];
function drawTrayCard(x, y, w, tabs, seed) {
  const c = [x - w / 2, y, x + w / 2 - 6, y - 1, x + w / 2, y + 5.5, x - w / 2 + 5, y + 6.5];
  for (let i = 0; i < tabs; i++) { const tx = x + w / 2 - 18 - i * 11; const tb = rectPts(tx, y - 4.6 + (i % 2), 8, 6, 1); knock(tb, { wob: .1 }); outline('P', tb, { w: .9, seed: seed + 20 + i }); }
  knock(c, { wob: .1 });
  solid('Y', c, { wob: .3, seed: seed, dx: .5 });
  outline('B', c, { w: 1.2, seed: seed + 1, over: .04 });
}
function drawTray(t, eatK, newTopK) {
  const L = LAY.tray; tsave(); ttr(L.x, L.y); tsc(L.s);
  const x = 0, y = 0, w = 128;
  // back
  line('B', [x - w / 2 + 6, y - 22, x + w / 2 - 6, y - 23], { w: 1.4, seed: 1001 });
  // stack
  let yy = y + 2;
  for (let i = 0; i < BASE_TABS.length; i++) { drawTrayCard(x + (i % 2 ? 2 : -1), yy, 104, BASE_TABS[i], 1010 + i * 7); yy -= 5.4; }
  const topPresent = newTopK >= 1 || eatK <= 0;
  if (topPresent) drawTrayCard(x + 1, yy, 104, 2, 1060);
  // front lip
  const lip = [x - w / 2, y + 2, x + w / 2, y + 1, x + w / 2 - 6, y + 26, x - w / 2 + 6, y + 27];
  knock(lip, { wob: .2 });
  tone('Y', lip, .45, { wob: .4, seed: 1070 }); tone('P', lip, .12, { wob: .4, seed: 1071 });
  outline('B', lip, { w: 1.9, seed: 1072, over: .04 });
  line('B', [x - w / 2, y + 2, x - w / 2 + 4, y - 20], { w: 1.4, seed: 1073 });
  line('B', [x + w / 2, y + 1, x + w / 2 - 4, y - 21], { w: 1.4, seed: 1074 });
  say('B', 'GOLD DATA', x, y + 9.5, 9, { align: 'center', w: 1.35, seed: 1075 });
  trest();
  return L.y + yy * L.s;
}
function drawSmall(t, eat) {
  const L = LAY.small; const s = L.s;
  tsave(); ttr(L.x, L.y); tsc(s);
  const chomp = eat.chomp, happy = eat.happy;
  const bounce = happy > 0 ? Math.abs(Math.sin(happy * 9)) * 3 * (1 - happy) : 0;
  ttr(0, -bounce);
  const body = superPts(0, 0, 17, 15, 2.3, 40, .1);
  tone('P', body, .55, { wob: .5, seed: 1101 });
  outline('B', body, { w: 1.9, seed: 1102 });
  // antenna nub
  line('B', [2, -15, 4, -21], { w: 1.3, seed: 1103 });
  solid('Y', ellPts(4.5, -22.5, 2.4, 2.4, 8), { wob: .1 }); outline('B', ellPts(4.5, -22.5, 2.4, 2.4, 8), { w: .9, seed: 1104 });
  const look = eat.look;
  for (const sx of [-1, 1]) {
    const ex = sx * 6 + look * 2, ey = -4;
    if (happy > 0 && happy < .9) line('B', [ex - 2.6, ey + 1, ex, ey - 1.6, ex + 2.6, ey + 1], { w: 1.4, seed: 1105 + sx });
    else { solid('B', ellPts(ex, ey, 2, 2.5, 10), { wob: .1, seed: 1107 + sx }); punch('B', ellPts(ex - .6, ey - 1, .6, .7, 6)); }
  }
  if (chomp > 0) {
    const m = 1.5 + 4.5 * chomp;
    const mp = ellPts(look * 2, 6, 5, m, 16);
    knock(mp, { wob: .1 }); solid('P', mp, { wob: .2, seed: 1110 }); outline('B', mp, { w: 1.2, seed: 1111 });
  } else line('B', catmull([-3 + look * 2, 5, 0 + look * 2, 7, 3 + look * 2, 5], 3), { w: 1.2, seed: 1112 });
  trest();
}
function eatState(t) {
  const [a, b, c] = TL.eat;
  const st = { k: 0, chomp: 0, happy: 0, look: 0, crumbs: 0 };
  if (t < a) { st.look = -1; return st; }
  if (t < b) { st.k = eio((t - a) / (b - a)); st.chomp = .5 + .5 * st.k; st.look = -1; return st; }
  if (t < c) { st.k = 1; const ph = (t - b) / (c - b); st.chomp = Math.abs(Math.sin(ph * Math.PI * 3)); st.crumbs = ph; return st; }
  st.k = 1; st.happy = clamp((t - c) / 1.2); st.look = 0;
  return st;
}

/* ------------------------------------------------------------ title + task */
function drawTitleStatic() {
  const T = LAY.title;
  say('B', 'LOOP. LOOP. LOOP.', T.x, T.y, T.size, { w: T.size * .13, seed: 41, gj: .9 });
}
function titleHL(t) {
  const T = LAY.title; const wW = tw('LOOP.', T.size), sp = tw('LOOP. ', T.size) + tw(' ', T.size) * .0;
  const un = seg(t, ...TL.unHL);
  for (let i = 0; i < 3; i++) {
    const s0 = TL.tries[i].start; let k = eout(seg(t, s0, s0 + .28));
    if (t >= TL.unHL[0]) k = 1 - eio(un);
    if (k <= 0) continue;
    const x = T.x + i * (sp + tw(' ', T.size) * 0) - 4, w = (wW + 8) * k;
    solid('Y', rectPts(x, T.y + T.size * .36, w, T.size * .62, 2), { wob: 1.1, seed: 50 + i, dy: 1 });
  }
}
function drawTask() {
  const T = LAY.task;
  tsave(); ttr(T.x, T.y); trot(T.rot);
  const n = rectPts(0, 0, T.w, T.h, 1);
  tone('Y', n, .42, { wob: .5, seed: 61 });
  tone('Y', rectPts(0, 0, T.w, 9, 0), .3, { wob: .2, seed: 62 });
  const tape = rectPts(T.w / 2 - 26, -7, 52, 15, 0);
  tsave(); ttr(T.w / 2, 0); trot(.06); ttr(-T.w / 2, 0);
  knock(tape, { wob: .2 }); tone('P', tape, .28, { wob: .5, seed: 63 });
  trest();
  say('B', 'TASK', 12, 13, 7.6, { w: 1, seed: 64 });
  if (T.oneLine) say('B', 'PUT A SLICED APPLE IN THE FRIDGE', 12, 27, T.size, { w: 1.4, seed: 65 });
  else {
    say('B', 'PUT A SLICED APPLE', 12, 29, T.size, { w: 1.5, seed: 65 });
    say('B', 'IN THE FRIDGE', 12, 50, T.size, { w: 1.5, seed: 66 });
  }
  trest();
}
function drawArcs() {
  const at = LAY.arcTop, ab = LAY.arcBot;
  line('B', bezPts(at, 50), { w: 1.8, seed: 1201, wob: .9, freq: .03 });
  arrowHead('B', at, 1210);
  line('P', bezPts(ab, 50), { w: 1.8, seed: 1202, wob: .9, freq: .03 });
  arrowHead('P', ab, 1220);
  const pl = LAY.plan, er = LAY.err;
  say('B', 'PLAN', pl.x, pl.y, pl.size, { align: pl.align || 'center', w: pl.size * .13, seed: 1230 });
  if (er.vertical) {
    tsave(); ttr(er.x, er.y); trot(-Math.PI / 2); say('P', 'ERROR LOG', 0, 0, er.size, { align: 'center', w: 1.3, seed: 1231 }); trest();
  } else say('P', 'ERROR LOG', er.x, er.y, er.size, { align: 'center', w: er.size * .13, seed: 1231 });
}
function arrowHead(ink, p, seed) {
  const e = bez(p, 1), a = bezTan(p, .985), L = 11;
  line(ink, [e[0] + Math.cos(a + 2.55) * L, e[1] + Math.sin(a + 2.55) * L, e[0], e[1], e[0] + Math.cos(a - 2.55) * L, e[1] + Math.sin(a - 2.55) * L], { w: 1.9, seed });
}
function drawSpikeStatic() {
  const s = LAY.spike;
  solid('B', ellPts(s.x, s.y, 13, 3.6, 18), { wob: .3, seed: 1301 });
  tone('Y', ellPts(s.x, s.y - 1, 12, 3, 18), .5, { wob: .3, seed: 1302 });
  line('B', [s.x, s.y - 2, s.x, s.y - 46], { w: 1.6, seed: 1303, press: .8, tb: 8 });
}
function drawLabels() {
  const a = LAY.lblModel, b = LAY.lblSmall;
  say('B', 'FRONTIER MODEL', a.x, a.y, a.size, { align: 'center', w: 1.3, seed: 1401 });
  say('B', '0.6B MODEL', b.x, b.y, b.size, { align: 'center', w: 1.2, seed: 1402 });
}

/* ------------------------------------------------------------ model mood */
function modelState(t) {
  const T = TL.tries;
  const ms = { gaze: [0, .9], eyes: 'open', blink: 0, mouth: 'smile', brows: 0, sweat: 0, bang: 0, bob: 0, mode: 'rest', cheer: 0 };
  const writing = [T[0].write, T[1].write, [T[2].strike[0], T[2].write[1]]];
  for (const w of writing) if (inR(t, w[0], w[1])) { ms.mode = 'write'; ms.gaze = [.6, 1]; ms.bob = Math.sin(t * 14) * .8; }
  for (const tr of T) {
    if (inR(t, tr.fly[0], tr.fly[1])) { const k = seg(t, ...tr.fly); ms.gaze = [lerp(.6, 1, k), lerp(-.2, .2, k)]; ms.mode = 'watch'; }
    if (inR(t, tr.sim[0], tr.stamp)) { ms.gaze = [1, -.1]; ms.mode = 'watch'; ms.eyes = 'wide'; }
  }
  for (let i = 0; i < 2; i++) {
    const tr = T[i];
    if (inR(t, tr.stamp, tr.stamp + .3)) { ms.eyes = 'wince'; ms.mouth = 'worry'; ms.mode = 'watch'; }
    if (inR(t, tr.stamp + .3, tr.back[0])) { ms.gaze = [1, .3]; ms.mouth = 'worry'; ms.mode = 'watch'; ms.brows = 1.5; }
    if (inR(t, tr.back[0], tr.back[1])) { const k = seg(t, ...tr.back); ms.gaze = [lerp(1, .9, k), lerp(.5, .5, k)]; ms.mouth = 'open'; ms.mode = 'watch'; ms.brows = 1.5; ms.sweat = k; }
    if (inR(t, tr.back[1], tr.idea[1])) { ms.gaze = [1, .5]; ms.mouth = 'open'; ms.bang = seg(t, tr.back[1], tr.idea[1]); ms.mode = 'watch'; }
  }
  if (inR(t, T[2].stamp, 15.3)) {
    const k = t - T[2].stamp;
    ms.eyes = 'happy'; ms.mouth = 'grin'; ms.mode = 'cheer'; ms.cheer = clamp(k / .2);
    ms.bob = -Math.max(0, Math.sin(k * 9)) * 9 * Math.exp(-k * 1.6);
  }
  if (inR(t, 15.3, LOOP)) { ms.gaze = [.2, .9]; ms.mode = 'rest'; }
  if (ms.eyes === 'open' && ms.mode !== 'write') { const b = (t + .7) % 3.4; if (b < .14) ms.blink = 1; }
  if (ms.mode === 'write' && (t % 2.9) < .1) ms.blink = 1;
  return ms;
}

/* ========================================================= scene: dynamic */
function drawDynamic(t) {
  const T = TL.tries;
  titleHL(t);
  drawSim(t);
  // tray + small model
  const eat = eatState(t);
  const newTop = seg(t, ...T[2].toTray);
  const topY = drawTray(t, eat.k, t >= T[2].toTray[1] ? 1 : 0);
  if (eat.k > 0 && eat.k < 1) {
    const L = LAY.tray, S = LAY.small;
    const x = lerp(L.x + 1, S.x - 2, eat.k), y = lerp(topY, S.y + 4, eat.k) - Math.sin(eat.k * Math.PI) * 16;
    tsave(); ttr(x, y); tsc(L.s * lerp(1, .22, eat.k), L.s * lerp(1, .5, eat.k)); trot(-eat.k * .5); drawTrayCard(0, 0, 104, 2, 1060); trest();
  }
  drawSmall(t, eat);
  if (eat.crumbs > 0 && eat.crumbs < 1) {
    const S = LAY.small;
    for (let i = 0; i < 5; i++) { const r = rng(1200 + i); const k = (eat.crumbs * 1.6 + r()) % 1; const cx = S.x - 4 + (r() - .5) * 18, cy = S.y + 10 + k * 18; solid('Y', ellPts(cx, cy, 1.4, 1.1, 6), { wob: 0 }); solid('B', ellPts(cx + .6, cy + .4, .6, .5, 5), { wob: 0 }); }
  }
  // the model and the desk
  const ms = modelState(t);
  drawModel(ms);
  drawDesk();
  const B = LAY.board;
  const cs = cardState(t);
  // pad: tear the finished sheet at the end, blank sheet beneath
  const tear = seg(t, ...T[2].tearSheet);
  let cursor = null;
  if (t >= T[2].tearSheet[0]) {
    drawCard({ blank: true }, B.x, B.y, B.rot, B.s, { sheetEdges: true });
    if (tear < 1) { const k = eio(tear); tsave(); drawCard(cs, B.x - 70 * k, B.y - 40 * k + 30 * k * k, B.rot - .6 * k, B.s * (1 - .25 * k)); trest(); }
  } else {
    cursor = drawCard(cs, B.x, B.y, B.rot, B.s, { sheetEdges: true });
  }
  // arms + pencil
  const L = LAY.model;
  const sh = [L.x + 38 * L.s, L.y + ms.bob + 25 * L.s], shL = [L.x - 38 * L.s, L.y + ms.bob + 25 * L.s];
  let tip, hand, ang = -1.05;
  if (ms.mode === 'write' && cursor) { tip = cursor; ang = -1.0 + Math.sin(t * 20) * .06; }
  else if (ms.mode === 'cheer') { tip = null; }
  else { tip = [L.x + 52 * L.s, B.y - (CH / 2 - 7) * B.s]; ang = -.55; }
  if (ms.mode === 'cheer') {
    const up = ms.cheer, wav = Math.sin((t - T[2].stamp) * 14) * 4;
    hand = [L.x + 50 * L.s, L.y + ms.bob - lerp(0, 66, up) * L.s + wav];
    const handL = [L.x - 50 * L.s, L.y + ms.bob - lerp(0, 62, up) * L.s - wav];
    drawArmTube(catmull([sh[0], sh[1], sh[0] + 16, sh[1] - 20, hand[0], hand[1]], 5), 10.4 * L.s, 6 * L.s, 741);
    drawArmTube(catmull([shL[0], shL[1], shL[0] - 16, shL[1] - 20, handL[0], handL[1]], 5), 10.4 * L.s, 6 * L.s, 745);
    for (const hp of [hand, handL]) { const hpts = ellPts(hp[0], hp[1], 5.5 * L.s, 5 * L.s, 14); knock(hpts); solid('Y', hpts, { wob: .2, seed: 747 }); outline('B', hpts, { w: 1.5, seed: 748 }); }
    drawPencil([hand[0] - 3, hand[1] - 22], 1.35, 28 * L.s);
  } else {
    const ux = Math.cos(ang), uy = Math.sin(ang);
    hand = [tip[0] + ux * 13, tip[1] + uy * 13];
    drawArmTube(catmull([sh[0], sh[1], (sh[0] + hand[0]) / 2 + 10, (sh[1] + hand[1]) / 2 + 4, hand[0], hand[1]], 5), 10.4 * L.s, 6 * L.s, 741);
    drawPencil(tip, ang, 30 * L.s);
    const hpts = ellPts(hand[0], hand[1], 5.5 * L.s, 5 * L.s, 14); knock(hpts); solid('Y', hpts, { wob: .2, seed: 747 }); outline('B', hpts, { w: 1.5, seed: 748 });
    // resting left hand on the card edge
    const handL = [B.x - (CW / 2 + 12) * B.s, B.y + 14 * B.s];
    drawArmTube(catmull([shL[0], shL[1], (shL[0] + handL[0]) / 2 - 6, (shL[1] + handL[1]) / 2 + 2, handL[0], handL[1]], 5), 10.4 * L.s, 6 * L.s, 745);
    const hl = ellPts(handL[0], handL[1], 5.5 * L.s, 5 * L.s, 14); knock(hl); solid('Y', hl, { wob: .2, seed: 749 }); outline('B', hl, { w: 1.5, seed: 744 });
  }
  // tickets
  const S = LAY.spike, slot = slotXY();
  const spikePos = i => [S.x + (i ? 9 : -5) * LAY.tixS / .78, S.y - 34 + i * 14 * LAY.tixS / .78];
  for (let i = 0; i < 2; i++) {
    const tr = T[i];
    const toT = i === 0 ? [14.55, 15.15] : [14.6, 15.2];
    if (t < tr.print[0] || t >= toT[1]) continue;
    const sp = spikePos(i), rotS = i ? .15 : -.1;
    if (t < tr.back[0]) { drawTicket(TICKETS[i], slot[0], slot[1] + 2, 0, LAY.box.s, seg(t, ...tr.print)); }
    else if (t < tr.back[1]) {
      const k = eio(seg(t, ...tr.back)); const tp = LAY.tixPath.map(q => q.slice());
      tp[3] = [sp[0], sp[1] - 4];
      const p = bez(tp, k);
      drawTicket(TICKETS[i], p[0], p[1], lerp(0, rotS, k) + Math.sin(k * Math.PI) * .5, lerp(LAY.box.s, LAY.tixS, k), 1, k > .95);
    } else if (t < toT[0]) {
      drawTicket(TICKETS[i], sp[0], sp[1] - 4, rotS, LAY.tixS, 1, true);
      line('B', [S.x, sp[1] - 2, S.x, sp[1] - 12], { w: 1.5, seed: 1310 + i });
    } else {
      const k = eio(seg(t, ...toT)); const L2 = LAY.tray;
      const x = lerp(sp[0], L2.x + 30 - i * 10, k), y = lerp(sp[1] - 4, L2.y - 34, k) - Math.sin(k * Math.PI) * 30;
      drawTicket(TICKETS[i], x, y, lerp(rotS, .4, k), lerp(LAY.tixS, .18, k), 1, false);
    }
  }
  // flying copy / clipped copy
  drawCopy(t);
}

function copyContent(sendT) { return cardState(sendT); }
function drawCopy(t) {
  const T = TL.tries, C = LAY.clip, B = LAY.board;
  for (let i = 0; i < 3; i++) {
    const tr = T[i];
    const endT = i < 2 ? tr.tear[1] : tr.toTray[1];
    if (t < tr.fly[0] || t >= endT) continue;
    const cs = copyContent(tr.fly[0]);
    const stamps = [];
    const sk = (t - tr.stamp);
    if (sk >= 0) stamps.push(i < 2 ? { type: 'fail', x: 66, y: 8 - i * 0, rot: -.22, k: sk } : { type: 'pass', x: 58, y: 6, rot: .12, k: sk });
    if (t < tr.fly[1]) {
      const k = eio(seg(t, ...tr.fly)); const p = bez(LAY.cardPath, k);
      const rot = lerp(B.rot, C.rot, k) + Math.sin(k * Math.PI) * .18, s = lerp(B.s, C.s, k) * (1 + Math.sin(k * Math.PI) * .06);
      drawCard(cs, p[0], p[1] - Math.sin(k * Math.PI) * 6, rot, s);
    } else if (i < 2 && t >= tr.tear[0]) {
      const k = seg(t, ...tr.tear), fall = k * k * 46, sc = 1 - eio(clamp((k - .25) / .75));
      if (sc > .02) for (const sx of [-1, 1]) {
        tsave();
        ttr(C.x + sx * (4 + k * 22), C.y + fall); trot(C.rot + sx * k * 1.4); tsc(sc);
        tclipRect(sx < 0 ? -200 : 0, -200, 200, 400);
        drawCard(cs, 0, 0, 0, C.s, { stamps });
        trest();
      }
    } else if (i === 2 && t >= tr.toTray[0]) {
      const k = eio(seg(t, ...tr.toTray)); const L = LAY.tray;
      const x = lerp(C.x, L.x + 1, k), y = lerp(C.y, L.y - 30, k) - Math.sin(k * Math.PI) * 40;
      tsave(); ttr(x, y); tsc(1, lerp(1, .12, k * k)); drawCard(cs, 0, 0, lerp(C.rot, 0, k), lerp(C.s, .52, k), { stamps }); trest();
    } else {
      const jig = sk >= 0 && sk < .25 ? Math.sin(sk * 60) * .02 * (1 - sk / .25) : 0;
      drawCard(cs, C.x, C.y, C.rot + jig, C.s, { stamps });
      // binder clip onto the box edge
      const bx = C.x + 70 * C.s, by = C.y - CH / 2 * C.s - 2;
      const clip = rectPts(bx - 9, by - 5, 18, 10, 1.5);
      solid('B', clip, { wob: .2, seed: 1501 });
      line('B', [bx - 6, by - 5, bx - 3, by - 15, bx + 3, by - 15, bx + 6, by - 5], { w: 1.4, seed: 1502 });
    }
    // PASS burst
    if (i === 2 && sk >= 0 && sk < .7 && t < tr.toTray[0]) {
      const m = new DOMMatrix().translate(C.x, C.y).rotate(C.rot * 180 / Math.PI).scale(C.s);
      const c0 = m.transformPoint({ x: 58, y: 6 });
      const k = eout(clamp(sk / .5));
      for (let j = 0; j < 9; j++) {
        const a = j / 9 * TAU + .3, r0 = 30 + 10 * k, r1 = r0 + 12 * (1 - clamp((sk - .3) / .4)) + 4;
        line(j % 2 ? 'Y' : 'B', [c0.x + Math.cos(a) * r0, c0.y + Math.sin(a) * r0, c0.x + Math.cos(a) * r1, c0.y + Math.sin(a) * r1], { w: j % 2 ? 3 : 1.6, seed: 1520 + j });
      }
    }
  }
}

/* ========================================================== static scene */
function drawStatic() {
  drawTitleStatic();
  drawTask();
  drawArcs();
  drawBoxStatic();
  drawSpikeStatic();
  drawLabels();
}

/* ===================================================== reader-driven layer */
LAY_D.zoom = { x: 262, y: 104, w: 300, h: 196, rot: -.03 };
LAY_P.zoom = { x: 30, y: 452, w: 300, h: 210, rot: -.025 };
LAY_D.hint = { x: 400, y: 437, size: 9.5, align: 'left', ax: [396, 443, 388, 444, 382, 438] };
LAY_P.hint = { x: 84, y: 336, size: 7.5, align: 'left', ax: [80, 340, 70, 342, 60, 338] };
LAY_D.hits = [[312, 392, 62, 36], [336, 428, 72, 32]];
LAY_P.hits = [[0, 296, 74, 35], [0, 331, 84, 36]];

const STOPS = [2.3, 6.25, 11.25, 15.25];
const TIX_WINDOWS = [[6.2, 14.55], [11.2, 14.6]];
const ZOOM = [
  { head: 'ERROR LOG · TRY 1', msg: ['FRIDGE IS CLOSED'], next: 'SO THE NEXT PLAN ADDS', change: { n: '3', text: 'OPEN FRIDGE' },
    said: 'Error log, try 1: fridge is closed. The next plan adds step 3, open fridge.' },
  { head: 'ERROR LOG · TRY 2', msg: ["'APPLE' NO LONGER", 'EXISTS'], next: 'SO THE NEXT PLAN SAYS', change: { n: '4', text: 'PUT APPLE IN FRIDGE', strike: 'APPLE', word: 'SLICES' },
    said: 'Error log, try 2: apple no longer exists, because it was sliced. The next plan puts the slices in the fridge.' },
];

function drawZoom(i, k) {
  const Z = LAY.zoom, z = ZOOM[i];
  // fly out from the spike
  const S = LAY.spike;
  const sx = S.x, sy = S.y - 30;
  const kk = eback(clamp(k));
  const cx = lerp(sx, Z.x + Z.w / 2, eout(clamp(k))), cy = lerp(sy, Z.y + Z.h / 2, eout(clamp(k)));
  const sc = lerp(.22, 1, kk);
  tsave(); ttr(cx, cy); trot(lerp(.3, Z.rot, eout(clamp(k)))); tsc(sc); ttr(-Z.w / 2, -Z.h / 2);
  const w = Z.w, h = Z.h, teeth = 14, pts = [0, 0, w, 0];
  for (let j = 0; j <= teeth * 2; j++) { const xx = w - w * j / (teeth * 2); pts.push(xx, h - (j % 2 ? 0 : 7)); }
  knock(pts, { wob: .4 });
  tone('P', pts, .08, { wob: .4, seed: 1601 + i });
  line('P', pts.concat([0, 0]), { w: 1.6, seed: 1602 + i, wob: .45, press: .3 });
  // pin hole + header
  knock(ellPts(w / 2, 11, 4, 4, 14), { wob: .1 });
  outline('P', ellPts(w / 2, 11, 4.6, 4.6, 14), { w: 1, seed: 1603 });
  say('P', z.head, 16, 22, 8.5, { w: 1.1, seed: 1604 + i });
  for (let j = 0; j < 7; j++) line('P', [w - 92 + j * 11, 26, w - 86 + j * 11, 26], { w: .8, seed: 1610 + j });
  line('P', [14, 40, w - 14, 39], { w: .9, seed: 1620, wob: .3 });
  // what the evaluator said
  const big = LAY === LAY_P ? 17 : 18;
  z.msg.forEach((m, j) => say('P', m, 16, 50 + j * (big + 7), big, { w: 2.1, seed: 1630 + j + i * 5, gj: .5 }));
  const y2 = 50 + z.msg.length * (big + 7) + 6;
  line('P', [14, y2, w - 14, y2 + 1], { w: .9, seed: 1640, wob: .3 });
  // what changed in the plan (blue = the plan)
  say('B', z.next, 16, y2 + 9, 8, { w: 1.1, seed: 1650 + i });
  arrowAt('B', w - 20, y2 + 13, 0, 6, 1.3, 1651);
  line('B', [w - 52, y2 + 13, w - 20, y2 + 13], { w: 1.3, seed: 1652 });
  const cy2 = y2 + 26, cs = 11.5;
  const c = z.change;
  const x0 = c.strike ? 36 : 50;
  if (!c.strike) {
    say('B', '+', 16, cy2, cs, { w: 1.6, seed: 1662 });
    say('B', c.n, 32, cy2, cs, { w: 1.5, seed: 1660 + i });
    solid('Y', rectPts(x0 - 4, cy2 - 3, tw(c.text, cs) + 8, cs + 6, 1.5), { wob: .8, seed: 1661, dy: .6 });
    say('B', c.text, x0, cy2, cs, { w: 1.5, seed: 1663 });
  } else {
    say('B', c.n, 16, cy2 + 6, cs, { w: 1.5, seed: 1660 + i });
    say('B', c.text, x0, cy2 + 6, cs, { w: 1.5, seed: 1664 });
    const ax = x0 + tw('PUT ', cs), aw = tw(c.strike, cs);
    line('B', [ax - 3, cy2 + 6 + cs * .55, ax + aw + 3, cy2 + 6 + cs * .48], { w: 2, seed: 1665, wob: .5 });
    const ws = 9.5, wy = cy2 - 7;
    solid('Y', rectPts(ax - 3, wy - 2.5, tw(c.word, ws) + 6, ws + 5, 1.5), { wob: .6, seed: 1666 });
    say('B', c.word, ax, wy, ws, { w: 1.3, seed: 1667 });
    line('B', [ax + aw * .4 - 3.5, cy2 + 4.5, ax + aw * .4, cy2 + .5, ax + aw * .4 + 3.5, cy2 + 4.5], { w: 1.1, seed: 1668 });
  }
  // close mark
  line('B', [w - 24, 9, w - 12, 21], { w: 1.8, seed: 1670 });
  line('B', [w - 12, 9, w - 24, 21], { w: 1.8, seed: 1671 });
  trest();
}

function drawHint(i) {
  const H = LAY.hint;
  const res = say('B', i === 0 ? 'TAP THE ERROR LOG' : 'TAP THE NEW ERROR LOG', H.x, H.y, H.size, { align: H.align, w: H.size * .14, seed: 1700 + i });
  void res;
  const a = H.ax;
  line('B', catmull(a, 5), { w: 1.4, seed: 1710 + i, wob: .3 });
  const n = a.length;
  arrowAt('B', a[n - 2], a[n - 1], Math.atan2(a[n - 1] - a[n - 3], a[n - 2] - a[n - 4]), 6, 1.4, 1712);
}

/* ------------------------------------------------------------------ state */
const fig = document.getElementById('fig-loop');
const cvs = document.getElementById('loop');
const press = new Press(cvs, w => (w < 560 ? LAY_P : LAY_D), lay => { LAY = lay; drawStatic(); }, 11);
const ui = {
  back: document.getElementById('loop-back'), play: document.getElementById('loop-play'), next: document.getElementById('loop-next'),
  scrub: document.getElementById('loop-scrub'), status: document.getElementById('loop-status'), live: document.getElementById('loop-live'),
  tix: [document.getElementById('loop-tix1'), document.getElementById('loop-tix2')],
  hit: [document.getElementById('loop-hit1'), document.getElementById('loop-hit2')], close: document.getElementById('loop-close'),
};
const st = { t: REDUCE ? STOPS[1] : .35, playing: false, target: null, open: -1, openK: 0, seen: [false, false], shown: false };
if (QS.has('f1')) st.t = parseFloat(QS.get('f1'));
else if (FIXED_T !== null) st.t = ((FIXED_T % LOOP) + LOOP) % LOOP;
if (QS.has('tk')) { st.open = parseInt(QS.get('tk'), 10) - 1; st.openK = 1; }

function tixAvailable(i, t) { return t >= TIX_WINDOWS[i][0] && t < TIX_WINDOWS[i][1]; }
function statusFor(t) {
  if (t < .3) return 'A fresh sheet. The frontier model is about to write a plan.';
  if (t < 2.3) return 'Try 1: the frontier model writes a plan.';
  if (t < 4.75) return 'Try 1: the evaluator runs the plan in its simulated kitchen.';
  if (t < 6.3) return 'Try 1 fails. The error log says the fridge is closed.';
  if (t < 7.4) return 'Try 2: the model adds OPEN FRIDGE to the plan.';
  if (t < 9.85) return 'Try 2: the evaluator runs the new plan.';
  if (t < 11.3) return 'Try 2 fails. The error log says the apple no longer exists.';
  if (t < 12.2) return 'Try 3: the model changes APPLE to SLICES.';
  if (t < 14.05) return 'Try 3: the evaluator runs it again.';
  if (t < 15.3) return 'Try 3 passes. The plan and both error logs go into the gold data.';
  return 'A fresh sheet for the next task. The small model eats the gold data.';
}
let lastStatus = '';
function syncUI() {
  const s = statusFor(st.t);
  if (s !== lastStatus) { ui.status.textContent = s; lastStatus = s; }
  if (document.activeElement !== ui.scrub) ui.scrub.value = st.t.toFixed(2);
  ui.play.textContent = st.playing ? 'Pause' : 'Play';
  ui.play.setAttribute('aria-pressed', st.playing ? 'true' : 'false');
  for (let i = 0; i < 2; i++) {
    const ok = tixAvailable(i, st.t);
    ui.tix[i].disabled = !ok;
    ui.hit[i].hidden = !ok || st.open >= 0;
    ui.tix[i].setAttribute('aria-expanded', st.open === i ? 'true' : 'false');
  }
  ui.close.hidden = st.open < 0;
}
function layoutHits() {
  for (let i = 0; i < 2; i++) placeHit(ui.hit[i], LAY, ...LAY.hits[i]);
  placeHit(ui.close, LAY, 0, 0, LAY.W, LAY.H);
}

function openTicket(i) {
  if (!tixAvailable(i, st.t)) return;
  if (st.open === i) { closeTicket(); return; }
  st.open = i; st.openK = REDUCE ? 1 : 0; st.playing = false; st.target = null; st.seen[i] = true;
  ui.live.textContent = ZOOM[i].said;
  figObj.dirty = true; syncUI();
}
function closeTicket() { if (st.open < 0) return; st.open = -1; st.openK = 0; ui.live.textContent = ''; figObj.dirty = true; syncUI(); }
function goNext() {
  closeTicket();
  let nx = STOPS.find(s => s > st.t + .02);
  if (nx === undefined) nx = STOPS[0] + LOOP;
  if (REDUCE) { st.t = nx % LOOP; st.playing = false; st.target = null; }
  else { st.target = nx; st.playing = true; }
  figObj.dirty = true; syncUI();
}
function goBack() {
  closeTicket();
  let pv = [...STOPS].reverse().find(s => s < st.t - .05);
  if (pv === undefined) pv = STOPS[STOPS.length - 1];
  st.t = pv; st.playing = false; st.target = null; figObj.dirty = true; syncUI();
}
ui.next.addEventListener('click', goNext);
ui.back.addEventListener('click', goBack);
ui.play.addEventListener('click', () => {
  closeTicket();
  if (REDUCE) { goNext(); return; }
  st.playing = !st.playing; st.target = null; syncUI();
});
ui.scrub.addEventListener('input', () => { closeTicket(); st.t = parseFloat(ui.scrub.value); st.playing = false; st.target = null; figObj.dirty = true; syncUI(); });
ui.tix.forEach((b, i) => b.addEventListener('click', () => openTicket(i)));
ui.hit.forEach((b, i) => b.addEventListener('click', () => openTicket(i)));
ui.close.addEventListener('click', closeTicket);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && st.open >= 0) { closeTicket(); ui.tix[0].focus(); } });

const figObj = {
  el: fig, dirty: true,
  onShow() {
    if (st.shown) return; st.shown = true;
    if (!REDUCE && FIXED_T === null && !QS.has('f1')) setTimeout(() => { if (!st.playing && st.open < 0 && st.t < 1) { st.target = STOPS[1]; st.playing = true; syncUI(); } }, 450);
  },
  update(dt) {
    if (st.open >= 0 && st.openK < 1) { st.openK = Math.min(1, st.openK + dt / .38); this.dirty = true; }
    if (!st.playing) return;
    const prevF = Math.floor(st.t * FPS);
    st.t += dt;
    if (st.target !== null && st.t >= st.target) { st.t = st.target; st.target = null; st.playing = false; }
    if (st.t >= LOOP) { st.t -= LOOP; if (st.target !== null) st.target -= LOOP; }
    if (Math.floor(st.t * FPS) !== prevF) this.dirty = true;
    syncUI();
  },
  draw(boil) {
    const tq = st.playing ? Math.floor(st.t * FPS) / FPS : st.t;
    press.frame(boil, () => {
      drawDynamic(tq);
      if (!st.playing && st.open < 0) {
        if (Math.abs(st.t - STOPS[1]) < .06 && !st.seen[0]) drawHint(0);
        if (Math.abs(st.t - STOPS[2]) < .06 && !st.seen[1]) drawHint(1);
      }
      if (st.open >= 0) drawZoom(st.open, st.openK);
    });
    const label = statusFor(st.t) + (st.open >= 0 ? ' ' + ZOOM[st.open].said : '');
    cvs.setAttribute('aria-label', 'The loop, hand-drawn. ' + label);
  },
};
function relayout() { press.resize(); LAY = press.lay; layoutHits(); figObj.dirty = true; }
window.__figLoop = { st, ready: false };
relayout(); syncUI();
registerFigure(figObj);
figObj.draw(0); window.__figLoop.ready = true;
let rz = null;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { const w = cvs.parentElement.clientWidth; if (w !== press.wCss) { relayout(); figObj.draw(figObj.drawnBoil < 0 ? 0 : figObj.drawnBoil); } }, 140); });
})();
