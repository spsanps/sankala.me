/* =============================================================================
   fig-zinify.js — "Paper in, zine out".

   A riso-printed contraption that does what the ZINify paper describes:
     1 CONDENSE  Claude reads the PDF, summarizes it into short sections and
                 picks figures (the figures also go straight to the pictures,
                 the paper's Fig. 2 bypass).
     2 PLAN      Claude plans the zine; an equation can come back as a poem.
     3 PICTURES  the plan's prompts go to a text-to-image model.
     4 ASSEMBLE  words and pictures are laid out.
   The paper's output is a multi-page PDF. The fold into a one-sheet,
   eight-page mini-zine is ours, because zines are meant to be folded.

   Timeline (seconds after the paper goes in) drives everything, so ?t=
   renders any moment exactly. Reading state: spreads on desktop, single
   pages on phones. Uses riso.js and zine-pages.js globals.
   ========================================================================== */
'use strict';

const ZT = (() => {
  const feed = 1.25, SD = 2.6, s = [0, 1, 2, 3].map(i => [feed + i * SD, feed + (i + 1) * SD]), e = s[3][1];
  return { feed, s, out: [e, e + .9], top: [e + .9, e + 1.55], acc: [e + 1.55, e + 2.75], fly: [e + 2.75, e + 3.75], read: e + 3.75, auto: e + 4.35, autoDur: .85 };
})();
const ST_LABEL = ['CONDENSE', 'PLAN', 'PICTURES', 'ASSEMBLE'];
const ST_SUB = ['CLAUDE', 'CLAUDE', 'TEXT TO IMAGE', 'LAYOUT'];
const TURN_DUR = .78;
const SPREADS = [[null, 1], [2, 3], [4, 5], [6, 7], [8, null]];
const IMPOSE = [[5, 4, 3, 2], [6, 7, 8, 1]];        // top row prints upside down

/* ------------------------------------------------------------- layouts */
function layoutDesk() {
  const L = { W: 960, H: 600, phone: false, axis: 'x' };
  L.ground = 508;
  L.paper = { cx: 106, cy: 396, rot: -.07, s: 1 };
  L.mouth = { x: 218, y: 394, h: 30 };
  L.body = { x0: 218, y0: 178, x1: 700, y1: 468 };
  L.st = [0, 1, 2, 3].map(i => { const x0 = 230 + i * 117; return { x0, w: 110, y0: 184, cx: x0 + 55, cy: 290, r: 46, signY: 192, subY: 346, lamp: [x0 + 98, 232] }; });
  L.belt = { y: 428, x0: 230, x1: 688 };
  L.item = (i, f) => [lerp(L.st[i].cx + 22, L.st[i + 1].cx - 22, f), 427];
  L.plate = { cx: 459, cy: 389, w: 168, h: 38 };
  L.pipe = [[285, 184], [285, 146], [519, 146], [519, 184]];
  L.chimney = { x: 240, y: 118, w: 26, h: 60 };
  L.gears = [{ cx: 630, cy: 160, r: 17, n: 9, k: 1 }, { cx: 659, cy: 146, r: 11, n: 6, k: -1.55 }];
  L.bell = [588, 170];
  L.gauge = [540, 158, 13];
  L.crank = [700, 356];
  L.legs = [[244, 468], [674, 468]];
  L.out = { x: 700, y: 402, h: 34 };
  L.sheet = { cx: 828, cy: 400, w: 196, h: 152 };
  L.tray = [[712, 482], [944, 482], [936, 496], [720, 496]];
  L.read = { cx: 480, cy: 302, ph: 432 }; L.read.pw = L.read.ph * PG_W / PG_H;
  L.unf = { cx: 480, cy: 304, w: 700 };
  L.feedMe = { x: 200, y: 206, size: 14, align: 'right', arrow: [[200, 238], [218, 274], [222, 330], [216, 372]] };
  L.labelIn = [209, 372, 'left', -Math.PI / 2]; L.labelOut = [713, 372, 'left', -Math.PI / 2];
  L.cellK = 1;
  return L;
}
function layoutPhone() {
  const L = { W: 380, H: 792, phone: true, axis: 'y' };
  L.ground = 786;
  L.paper = { cx: 78, cy: 96, rot: -.06, s: .58 };
  L.mouth = { x: 172, y: 178, h: 30 };
  L.body = { x0: 30, y0: 178, x1: 350, y1: 630 };
  L.st = [0, 1, 2, 3].map(i => { const y0 = 188 + i * 104; return { x0: 40, w: 300, y0, h: 98, cx: 110, cy: y0 + 49, r: 38, labelX: 166, signY: y0 + 16, subY: y0 + 44, lamp: [328, y0 + 20] }; });
  L.plate = { cx: 222, cy: 613, w: 150, h: 26 };
  L.belt = { x: 50, y0: 190, y1: 620 };
  L.item = (i, f) => [50, lerp(L.st[i].cy + 26, L.st[i + 1].cy - 14, f)];
  L.pipe = [[350, 237], [366, 237], [366, 445], [350, 445]];
  L.chimney = { x: 320, y: 122, w: 22, h: 56 };
  L.gears = [{ cx: 252, cy: 162, r: 14, n: 8, k: 1 }, { cx: 276, cy: 151, r: 9, n: 6, k: -1.5 }];
  L.bell = [302, 169];
  L.gauge = [42, 158, 10];
  L.crank = [350, 540];
  L.legs = [[52, 630], [328, 630]];
  L.out = { x: 190, y: 630, h: 40 };
  L.sheet = { cx: 190, cy: 708, w: 176, h: 136 };
  L.tray = [[84, 778], [296, 778], [288, 785], [92, 785]];
  L.read = { cx: 190, cy: 398, ph: 480 }; L.read.pw = L.read.ph * PG_W / PG_H;
  L.unf = { cx: 190, cy: 398, w: 440, rot: -Math.PI / 2 };
  L.feedMe = { x: 150, y: 40, size: 12, align: 'left', arrow: [[200, 64], [206, 102], [194, 140], [176, 170]] };
  L.labelIn = [104, 164, 'right', 0]; L.labelOut = [248, 640, 'left', 0];
  L.cellK = 1;
  return L;
}

/* --------------------------------------------------------- ink helpers */
function inkSet(w, h) { return { B: mk(w, h), P: mk(w, h), Y: mk(w, h) }; }
function inkLayers(set) { return { B: set.B.getContext('2d'), P: set.P.getContext('2d'), Y: set.Y.getContext('2d') }; }
function renderInk(set, scale, fn) {
  const keep = LY, kb = BOIL; LY = inkLayers(set); BOIL = 0;
  for (const k in LY) LY[k].setTransform(scale, 0, 0, scale, 0, 0);
  fn(); LY = keep; BOIL = kb;
}
function blit(set, dx, dy, dw, dh) { if (dw <= .01 || dh <= .01) return; for (const k of ORDER) LY[k].drawImage(set[k], dx, dy, dw, dh); }
function blitPart(set, sx, sy, sw, sh, dx, dy, dw, dh) { if (dw <= .01 || dh <= .01 || sw <= .01) return; for (const k of ORDER) LY[k].drawImage(set[k], sx, sy, sw, sh, dx, dy, dw, dh); }
function clearPoly(pts) {
  for (const k in LY) { const c = LY[k]; c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); c.restore(); }
}
function clearRect4(x, y, w, h) { clearPoly([x, y, x + w, y, x + w, y + h, x, y + h]); }
function clipPoly(pts) { for (const k in LY) { const c = LY[k]; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.clip(); } }
function clipCircle(cx, cy, r) { for (const k in LY) { const c = LY[k]; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.clip(); } }
function veil(v) { for (const k in LY) { const c = LY[k]; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = v; c.fillStyle = '#000'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); } }
function rectPoly(x, y, w, h) { return [x, y, x + w, y, x + w, y + h, x, y + h]; }
function offsetPath(p, d) {          // offset an orthogonal polyline by d
  const o = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[Math.min(p.length - 1, i + 1)];
    const n1 = norm2(a, b), n2 = norm2(b, c);
    const nx = (n1[0] + n2[0]), ny = (n1[1] + n2[1]); const l = Math.hypot(nx, ny) || 1;
    const dot = (n1[0] * nx + n1[1] * ny) / l || 1;
    o.push(b[0] + nx / l * d / dot, b[1] + ny / l * d / dot);
  }
  return o;
}
function norm2(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return l < 1e-6 ? [0, 0] : [-dy / l, dx / l]; }
function along(p, f) {               // point at fraction f of a polyline
  let total = 0; const segs = [];
  for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); segs.push(l); total += l; }
  let s = f * total;
  for (let i = 0; i < segs.length; i++) { if (s <= segs[i] || i === segs.length - 1) { const t = segs[i] ? s / segs[i] : 0; return [lerp(p[i][0], p[i + 1][0], t), lerp(p[i][1], p[i + 1][1], t)]; } s -= segs[i]; }
  return p[p.length - 1];
}

/* ---------------------------------------------------------- the state */
const Z = {
  started: false, T: 0, feedFrom: null, drag: null, dragPos: null, snap: null,
  userTurned: false, spread: 0, page: 0, turn: null, queue: 0, unfold: 0, unfoldTo: 0, hintSeen: false,
};
function readT() { return Z.started ? Z.T : 0; }
function stationActive(i, T) { return Z.started && T >= ZT.s[i][0] && T < ZT.s[i][1]; }
function phaseOf(T) {
  if (!Z.started) return 'idle';
  if (T < ZT.feed) return 'feed';
  for (let i = 0; i < 4; i++) if (T < ZT.s[i][1]) return 's' + i;
  if (T < ZT.read) return 'fold';
  return 'read';
}
/* Current reading position, including the one automatic page turn. */
function readState(L) {
  const T = readT();
  if (!Z.userTurned) {
    const p = (T - ZT.auto) / ZT.autoDur;
    if (p <= 0) return { at: 0, turn: null };
    if (p < 1) return { at: 0, turn: { a: 0, p: eio(p) } };
    return { at: 1, turn: null };
  }
  return { at: L.phone ? Z.page : Z.spread, turn: Z.turn ? { a: Z.turn.a, p: eio(clamp(Z.turn.p)) } : null };
}

/* --------------------------------------------------------- the press */
const zEl = document.getElementById('zfig');
const zSheet = document.getElementById('zsheet');
const zCv = document.getElementById('zcv');
const PG = {};           // page ink sets at reading resolution
let PAPER_INK = null, PAGE_PX = [0, 0], PAPER_PX = 1;

const press = new Press(zCv, w => (w < 560 ? layoutPhone() : layoutDesk()), drawStatic, 11);

function buildCaches() {
  const L = press.lay, K = press.K;
  const sc = Math.min(K, 760 / L.read.ph) * L.read.ph / PG_H;          // px per page unit
  PAGE_PX = [Math.round(PG_W * sc), Math.round(PG_H * sc)];
  CELL = press.cell;
  for (let i = 1; i <= 8; i++) { PG[i] = inkSet(PAGE_PX[0], PAGE_PX[1]); renderInk(PG[i], sc, ZINE_PAGES[i]); }
  const ps = K * L.paper.s; PAPER_PX = ps;
  PAPER_INK = inkSet(Math.ceil((PAPER_W + 16) * ps), Math.ceil((PAPER_H + 14) * ps));
  renderInk(PAPER_INK, ps, () => { ttr(2, 2); drawPaperStack(); });
}

/* ======================================================= static: machine */
function drawStatic(L) {
  const B = L.body;
  // table edge
  line('B', [10, L.ground, L.W - 10, L.ground + .6], { w: 1.4, seed: 1 });
  line('B', [10, L.ground + 7, L.W - 10, L.ground + 7.4], { w: .6, seed: 2 });
  // legs
  for (const [x, y] of L.legs) {
    line('B', [x - 6, y, x - 8, L.ground - 4, x + 8, L.ground - 4, x + 6, y], { w: 1.4, seed: 3 + x });
    solid('Y', polyPts(x - 6, y, x + 6, y, x + 8, L.ground - 4, x - 8, L.ground - 4), { wob: .2, seed: 4 + x });
  }
  // chimney
  const C = L.chimney;
  solid('Y', rectPts(C.x, C.y + 6, C.w, C.h - 6, 1, 4), { wob: .4, seed: 9 });
  outline('B', rectPts(C.x, C.y + 6, C.w, C.h - 6, 1, 4), { w: 1.4, seed: 10 });
  outline('B', rectPts(C.x - 4, C.y, C.w + 8, 8, 1.5, 4), { w: 1.4, seed: 11 });
  solid('P', rectPts(C.x, C.y + 22, C.w, 6, 0, 4), { wob: .3, seed: 12 });
  // the bypass pipe (figures skip ahead to the pictures)
  line('Y', L.pipe.flat(), { w: 9, wob: .2, seed: 13 });
  line('B', offsetPath(L.pipe, 5), { w: 1.2, seed: 14 }); line('B', offsetPath(L.pipe, -5), { w: 1.2, seed: 15 });
  const mid = along(L.pipe, .5);
  if (L.phone) { tsave(); ttr(mid[0] + 9, mid[1]); trot(Math.PI / 2); say('B', 'FIGURES', 0, 0, 5, { align: 'center', seed: 16 }); trest(); }
  else say('B', 'FIGURES', mid[0], mid[1] - 15, 5.4, { align: 'center', seed: 16 });
  // body
  const body = rectPts(B.x0, B.y0, B.x1 - B.x0, B.y1 - B.y0, 12, 5);
  tone('Y', body, .3, { wob: .6, seed: 17 });
  outline('B', body, { w: 2.2, seed: 18, over: .06 });
  // a pink stripe and rivets
  if (!L.phone) { solid('P', polyPts(B.x0 + 4, B.y1 - 20, B.x1 - 4, B.y1 - 21, B.x1 - 4, B.y1 - 14, B.x0 + 4, B.y1 - 13), { wob: .4, seed: 19 }); }
  else solid('P', polyPts(B.x1 - 18, B.y0 + 10, B.x1 - 11, B.y0 + 10, B.x1 - 11, B.y1 - 10, B.x1 - 18, B.y1 - 10), { wob: .4, seed: 19 });
  // stations
  L.st.forEach((s, i) => station(L, s, i));
  // the nameplate
  const NP = L.plate;
  knock(rectPts(NP.cx - NP.w / 2, NP.cy - NP.h / 2, NP.w, NP.h, 6, 4), { wob: 0 });
  outline('B', rectPts(NP.cx - NP.w / 2, NP.cy - NP.h / 2, NP.w, NP.h, 6, 4), { w: 1.4, seed: 37 });
  for (const dx of [-1, 1]) line('B', [NP.cx + dx * (NP.w / 2 - 8), NP.cy], { w: 3, seed: 38 + dx });
  say('P', 'ZINIFY', NP.cx + 1.6, NP.cy - 10.4, 21, { align: 'center', w: 3, seed: 39, gj: 1.2 });
  say('B', 'ZINIFY', NP.cx, NP.cy - 12, 21, { align: 'center', w: 2.2, seed: 39, gj: 1.2 });
  // conveyor
  if (!L.phone) {
    const b = L.belt;
    knock(rectPts(b.x0 - 6, b.y - 1, b.x1 - b.x0 + 12, 14, 7, 4), { wob: 0 });
    line('B', [b.x0, b.y, b.x1, b.y], { w: 1.2, seed: 20 }); line('B', [b.x0, b.y + 12, b.x1, b.y + 12], { w: 1.2, seed: 21 });
    for (const x of [b.x0, b.x1]) { outline('B', ellPts(x, b.y + 6, 6, 6, 18), { w: 1.1, seed: 22 + x }); line('B', [x, b.y + 6], { w: 2, seed: 23 }); }
  } else {
    const b = L.belt;
    knock(rectPts(b.x - 8, b.y0 - 6, 16, b.y1 - b.y0 + 12, 7, 4), { wob: 0 });
    line('B', [b.x - 7, b.y0, b.x - 7, b.y1], { w: 1.2, seed: 20 }); line('B', [b.x + 7, b.y0, b.x + 7, b.y1], { w: 1.2, seed: 21 });
    for (const y of [b.y0, b.y1]) { outline('B', ellPts(b.x, y, 6, 6, 18), { w: 1.1, seed: 22 + y }); }
  }
  // mouth and output slot
  const M = L.mouth, O = L.out;
  if (L.axis === 'x') {
    solid('B', rectPts(M.x - 5, M.y - M.h / 2, 10, M.h, 2, 3), { wob: .3, seed: 24 });
    line('P', [M.x - 9, M.y - M.h / 2 - 4, M.x - 9, M.y + M.h / 2 + 4], { w: 1.6, seed: 25 });
    solid('B', rectPts(O.x - 5, O.y - O.h / 2, 10, O.h, 2, 3), { wob: .3, seed: 26 });
    line('P', [O.x + 9, O.y - O.h / 2 - 4, O.x + 9, O.y + O.h / 2 + 4], { w: 1.6, seed: 27 });
  } else {
    solid('B', rectPts(M.x - M.h * 2, M.y - 5, M.h * 4, 10, 2, 3), { wob: .3, seed: 24 });
    line('P', [M.x - M.h * 2 - 4, M.y - 9, M.x + M.h * 2 + 4, M.y - 9], { w: 1.6, seed: 25 });
    solid('B', rectPts(O.x - O.h * 2.6, O.y - 5, O.h * 5.2, 10, 2, 3), { wob: .3, seed: 26 });
    line('P', [O.x - O.h * 2.6 - 4, O.y + 9, O.x + O.h * 2.6 + 4, O.y + 9], { w: 1.6, seed: 27 });
  }
  for (const [lab, [x, y, al, rot], seed] of [['PAPER IN', L.labelIn, 28], ['ZINE OUT', L.labelOut, 29]]) {
    tsave(); ttr(x, y); trot(rot); say('P', lab, 0, rot ? -6 : 0, 6, { align: al, seed }); trest();
  }
  // bell
  const [bx, by] = L.bell;
  solid('Y', arcPts(bx, by, 10, 10, 180, 360).concat([bx + 10, by, bx - 10, by]), { wob: .2, seed: 30 });
  line('B', arcPts(bx, by, 10, 10, 180, 360), { w: 1.3, seed: 31 }); line('B', [bx - 13, by + .5, bx + 13, by], { w: 1.4, seed: 32 });
  line('B', [bx, by - 10, bx, by - 13], { w: 1.4, seed: 33 }); line('B', [bx, by + .5, bx, B.y0], { w: 1.2, seed: 34 });
  // pressure gauge
  const [gx, gy, gr] = L.gauge;
  line('B', [gx, gy + gr, gx, B.y0], { w: 1.4, seed: 46 });
  knock(ellPts(gx, gy, gr + 2, gr + 2, 24), { wob: 0 });
  outline('B', ellPts(gx, gy, gr, gr, 24), { w: 1.4, seed: 47 });
  for (let k = 0; k <= 6; k++) { const a = Math.PI * (.8 + k * 1.4 / 6); line('B', [gx + Math.cos(a) * gr * .7, gy + Math.sin(a) * gr * .7, gx + Math.cos(a) * gr * .9, gy + Math.sin(a) * gr * .9], { w: .8, seed: 48 + k }); }
  solid('P', arcPts(gx, gy, gr * .82, gr * .82, 330, 382).concat(arcPts(gx, gy, gr * .66, gr * .66, 382, 330)), { wob: 0, seed: 55 });
  // crank axle
  outline('B', ellPts(L.crank[0], L.crank[1], 6, 6, 16), { w: 1.4, seed: 35 });
  // gear axles
  for (const g of L.gears) line('B', [g.cx, g.cy + g.r * .4, g.cx, Math.max(g.cy + g.r * .4, B.y0)], { w: 1.2, seed: 36 + g.cx });
  // sticker
  const sx = L.phone ? 70 : 664, sy = L.phone ? 613 : 389;
  solid('P', ellPts(sx, sy, 16, 16, 28), { wob: .5, seed: 40 });
  say('B', "UIST", sx, sy - 7, 5.4, { align: 'center', seed: 41 }); say('B', "'23", sx, sy + 1, 5, { align: 'center', seed: 42 });
  // tray
  const tr = L.tray.flat();
  tone('Y', tr, .5, { wob: .3, seed: 43 }); line('B', tr.concat(tr.slice(0, 2)), { w: 1.2, seed: 44 });
  for (const [x] of [L.tray[2], L.tray[3]]) line('B', [x, L.tray[2][1], x - (L.phone ? 0 : 0), L.ground], { w: 1, seed: 45 + x });
}

function station(L, s, i) {
  // the porthole: glass, double rim, bolts
  knock(ellPts(s.cx, s.cy, s.r + 6, s.r + 6, 40), { wob: 0 });
  tone('B', ellPts(s.cx, s.cy, s.r, s.r, 40), .06, { wob: 0, seed: 50 + i });
  outline('B', ellPts(s.cx, s.cy, s.r, s.r, 44), { w: 1.4, seed: 51 + i, over: .06 });
  outline('B', ellPts(s.cx, s.cy, s.r + 6, s.r + 6, 48), { w: 1.6, seed: 52 + i, over: .06 });
  for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + .2; line('B', [s.cx + Math.cos(a) * (s.r + 3), s.cy + Math.sin(a) * (s.r + 3)], { w: 1.8, seed: 53 + k }); }
  // a glint on the glass
  line('Y', arcPts(s.cx, s.cy, s.r - 7, s.r - 7, 200, 250), { w: 3, seed: 54 + i });
  const n = String(i + 1) + ' ' + ST_LABEL[i];
  if (!L.phone) {
    knock(rectPts(s.x0 + 2, s.y0, s.w - 4, 34, 3, 4), { wob: 0 });
    outline('B', rectPts(s.x0 + 2, s.y0, s.w - 4, 34, 3, 4), { w: 1.1, seed: 55 + i });
    const size = Math.min(10, (s.w - 14) / (tw(n, 10) / 10));
    say('B', n, s.cx, s.signY, size, { align: 'center', seed: 56 + i });
    say('B', ST_SUB[i], s.cx, s.subY, 5.6, { align: 'center', seed: 57 + i });
  } else {
    knock(rectPts(s.labelX - 8, s.y0 + 4, 152, 56, 3, 4), { wob: 0 });
    outline('B', rectPts(s.labelX - 8, s.y0 + 4, 152, 56, 3, 4), { w: 1.1, seed: 55 + i });
    say('B', n, s.labelX, s.signY - 2, 14, { seed: 56 + i });
    say('B', ST_SUB[i], s.labelX, s.subY, 8, { seed: 57 + i });
  }
  outline('B', ellPts(s.lamp[0], s.lamp[1], 5, 5, 16), { w: 1.1, seed: 58 + i });
}

/* ======================================================= dynamic drawing */
function drawDynamic(L) {
  const T = readT();
  const v = Z.started ? 0.74 * sm(seg(T, ZT.fly[0], ZT.fly[1])) : 0;
  machineMotion(L, T);
  if (v > 0) veil(v);
  drawPaper(L, T);
  drawOutput(L, T);
  if (Z.started && T >= ZT.read) drawReading(L, T);
  else if (!Z.started) feedMe(L);
}

function feedMe(L) {
  const F = L.feedMe;
  say('P', 'FEED ME!', F.x, F.y, F.size, { align: F.align, seed: 70, w: 1.9 });
  line('P', bezPts(F.arrow, 24), { w: 1.6, seed: 71 });
  const e = F.arrow[3], d = F.arrow[2]; arrowAt('P', e[0], e[1], Math.atan2(e[1] - d[1], e[0] - d[0]), 7, 1.6, 72);
}

/* ---------------------------------------------------------- machine parts */
function machineMotion(L, T) {
  const run = clamp(T, ZT.feed, ZT.s[3][1]) - ZT.feed;           // seconds of running
  // gears and crank
  L.gears.forEach((g, gi) => gear(g, run * 2.6 * g.k + gi * .3));
  const ca = run * 2.1, [kx, ky] = L.crank, cr = 17;
  const hx = kx + Math.cos(ca) * cr, hy = ky + Math.sin(ca) * cr;
  line('B', [kx, ky, hx, hy], { w: 2.4, seed: 80 }); solid('P', ellPts(hx, hy, 4.2, 4.2, 14), { wob: .2, seed: 81 }); line('B', ellPts(hx, hy, 4.2, 4.2, 14).concat([hx + 4.2, hy]), { w: 1, seed: 82 });
  // the gauge needle climbs while it runs
  { const [gx, gy, gr] = L.gauge, lvl = Z.started ? sm(clamp(run / 2)) * (1 - sm(seg(T, ZT.s[3][1], ZT.s[3][1] + 1))) : 0;
    const a = Math.PI * (.8 + 1.4 * (.08 + .82 * lvl + .04 * Math.sin(T * 13) * lvl));
    line('B', [gx, gy, gx + Math.cos(a) * gr * .78, gy + Math.sin(a) * gr * .78], { w: 1.3, seed: 84 }); line('B', [gx, gy], { w: 2.6, seed: 85 }); }
  // conveyor dashes
  const off = (run * 34) % 16;
  if (!L.phone) { const b = L.belt; for (let x = b.x0 + 4 + off; x < b.x1 - 4; x += 16) line('B', [x, b.y + 6, Math.min(b.x1 - 4, x + 6), b.y + 6], { w: 1, seed: 83 + Math.round(x) }); }
  else { const b = L.belt; for (let y = b.y0 + 4 + off; y < b.y1 - 4; y += 16) line('B', [b.x, y, b.x, Math.min(b.y1 - 4, y + 6)], { w: 1, seed: 83 + Math.round(y) }); }
  // lamps and signs
  L.st.forEach((s, i) => {
    const on = stationActive(i, T), done = Z.started && T >= ZT.s[i][1];
    if (on) {
      solid('P', ellPts(s.lamp[0], s.lamp[1], 4.2, 4.2, 14), { wob: .2, seed: 90 + i });
      if (!L.phone) tone('Y', rectPts(s.x0 + 6, s.y0 + 4, s.w - 12, 26, 2, 4), .9, { wob: .5, seed: 91 + i });
      else tone('Y', rectPts(s.labelX - 4, s.y0 + 8, 144, 25, 2, 4), .9, { wob: .5, seed: 91 + i });
    } else if (done) solid('Y', ellPts(s.lamp[0], s.lamp[1], 4, 4, 14), { wob: .2, seed: 92 + i });
    tsave(); clipCircle(s.cx, s.cy, s.r - 1.5);
    const kz = s.r / 36; ttr(s.cx, s.cy); tsc(kz); ttr(-s.cx, -s.cy);
    [porthole0, porthole1, porthole2, porthole3][i]({ cx: s.cx, cy: s.cy, r: 36 }, Z.started ? T - ZT.s[i][0] : -1);
    trest();
  });
  if (!Z.started) return;
  // chimney puffs
  const C = L.chimney;
  for (let k = 0; ; k++) {
    const t0 = ZT.feed + .1 + k * .52; if (t0 > ZT.s[3][1] - .2) break;
    const age = T - t0; if (age < 0 || age > 1.9) continue;
    const r = 4 + age * 7.5, x = C.x + C.w / 2 + age * 9 * (k % 2 ? 1 : -.6), y = C.y - 4 - age * 42;
    tone('P', ellPts(x, y, r, r * .86, 22), .62 * (1 - age / 1.9), { wob: .9, seed: 100 + k });
    if (age < 1.1) outline('B', ellPts(x, y, r, r * .86, 22), { w: .8, seed: 101 + k });
  }
  // onomatopoeia
  for (let k = 0; ; k++) {
    const t0 = ZT.feed + .3 + k * .95; if (t0 > ZT.s[3][1] - .3) break;
    if (T >= t0 && T < t0 + .32) {
      const left = k % 2 === 0; const x = left ? C.x - 12 : C.x + C.w + 14, y = C.y + 12 + (k % 3) * 6;
      tsave(); ttr(x, y); trot(left ? -.22 : .2); say('P', 'CHUG', 0, 0, 11, { align: left ? 'right' : 'left', seed: 110 + k, w: 1.8 }); trest();
    }
  }
  const s0 = L.st[0], u0 = T - ZT.s[0][0];
  if (u0 > .45 && u0 < 1.25) { tsave(); ttr(s0.cx - s0.r - 4, s0.cy - s0.r - 2); trot(-.25); say('P', 'SNIP SNIP', 0, 0, 8.5, { align: 'right', seed: 115, w: 1.5 }); trest(); }
  const s3 = L.st[3], u3 = T - ZT.s[3][0];
  if (u3 > .2 && u3 < 2) { tsave(); ttr(s3.cx + s3.r + 4, s3.cy + s3.r - 2); trot(.18); say('P', 'WHIRR', 0, 0, 8.5, { seed: 116, w: 1.5 }); trest(); }
  if (T > ZT.out[0] - .05 && T < ZT.out[0] + .9) {
    const [bx, by] = L.bell, sh = Math.sin((T - ZT.out[0]) * 40) * 2.2 * (1 - (T - ZT.out[0]) / .9);
    say('P', 'DING!', bx + 12 + sh, by - 34, 10, { seed: 117, w: 1.8 });
    for (let k = 0; k < 3; k++) { const a = -2.4 + k * .5; line('P', [bx + Math.cos(a) * 15, by - 6 + Math.sin(a) * 15, bx + Math.cos(a) * 22, by - 6 + Math.sin(a) * 22], { w: 1.3, seed: 118 + k }); }
  }
  // things riding the belt
  for (const it of BELT) {
    const f = seg(T, it.t0, it.t1); if (f <= 0 || f >= 1) continue;
    const [x, y] = L.item(it.st, sm(f));
    beltThing(it, x, y);
  }
  // figures through the bypass pipe
  const fp = seg(T, ZT.s[0][0] + 1.25, ZT.s[0][0] + 2.6);
  if (fp > 0 && fp < 1) { const [x, y] = along(L.pipe, sm(fp)); tsave(); ttr(x, y); tsc(1.4); ttr(-x, -y); figCard(x, y, 1); trest(); }
}

const BELT = [
  ...['PROBLEM', 'READER', 'AUTHOR', 'ZINES', 'METHOD'].map((s, k) => ({ st: 0, t0: ZT.s[0][0] + 2.0 + k * .17, kind: 'strip', label: s })),
  { st: 1, t0: ZT.s[1][0] + 1.95, kind: 'poem' },
  ...['WALL', 'CURVE', 'PILE'].map((s, k) => ({ st: 1, t0: ZT.s[1][0] + 2.12 + k * .17, kind: 'tag', label: s })),
  ...[0, 1, 2].map(k => ({ st: 2, t0: ZT.s[2][0] + 1.95 + k * .18, kind: 'pic', n: k })),
].map(it => ({ ...it, t1: it.t0 + .95 }));
function beltThing(it, x, y) {
  tsave(); ttr(x, y); tsc(1.45); ttr(-x, -y);
  beltThing0(it, x, y);
  trest();
}
function beltThing0(it, x, y) {
  if (it.kind === 'strip') {
    const w = 31, h = 8; clearRect4(x - w / 2, y - h, w, h);
    outline('B', rectPts(x - w / 2, y - h, w, h, .3, 3), { w: .8, wob: .15, seed: 120 + x });
    say('B', it.label, x, y - h + 2.2, 3.6, { align: 'center', w: .6, seed: 121 + it.label.length });
  } else if (it.kind === 'poem') {
    const w = 30, h = 11; clearRect4(x - w / 2, y - h, w, h);
    outline('B', rectPts(x - w / 2, y - h, w, h, .3, 3), { w: .8, wob: .15, seed: 122 });
    for (let k = 0; k < 2; k++) { const yy = y - h + 3.4 + k * 4; const p = []; for (let j = 0; j <= 10; j++) p.push(x - 11 + j * 2.2, yy + Math.sin(j * 1.3 + k) * .8); line('P', p, { w: .8, seed: 123 + k }); }
  } else if (it.kind === 'tag') {
    const w = 22, h = 9; clearPoly([x - w / 2, y - h, x + w / 2 - 3, y - h, x + w / 2, y - h / 2, x + w / 2 - 3, y, x - w / 2, y]);
    tone('Y', polyPts(x - w / 2, y - h, x + w / 2 - 3, y - h, x + w / 2, y - h / 2, x + w / 2 - 3, y, x - w / 2, y), .8, { wob: .1, seed: 124 });
    line('B', [x - w / 2, y - h, x + w / 2 - 3, y - h, x + w / 2, y - h / 2, x + w / 2 - 3, y, x - w / 2, y, x - w / 2, y - h], { w: .8, seed: 125 });
    say('B', it.label, x - 1.5, y - h + 2.4, 3.4, { align: 'center', w: .6, seed: 126 + it.label.length });
  } else {
    const s = 14; clearRect4(x - s / 2, y - s, s, s);
    outline('B', rectPts(x - s / 2, y - s, s, s, .5, 3), { w: .8, wob: .15, seed: 127 + it.n });
    doodle(it.n, x - s / 2 + 2, y - s + 2, s - 4, s - 4, 1);
  }
}
function figCard(x, y, k) {
  const w = 15, h = 11; clearRect4(x - w / 2, y - h / 2, w, h);
  tone('Y', rectPts(x - w / 2, y - h / 2, w, h, .5, 3), .7, { wob: .1, seed: 130 });
  outline('B', rectPts(x - w / 2, y - h / 2, w, h, .5, 3), { w: .8, wob: .15, seed: 131 });
  for (let j = 0; j < 4; j++) { const hh = 2 + ((j * 7 + k) % 5); line('B', [x - 5 + j * 3.2, y + 3.5, x - 5 + j * 3.2, y + 3.5 - hh], { w: .9, seed: 132 + j }); }
}
/* tiny pictures: 0 a wall, 1 a curve, 2 a pile */
function doodle(n, x, y, w, h, s = 1, reveal = 1) {
  if (n === 0) {
    tone('Y', rectPts(x, y + h * .4, w, h * .6, 0, 3), .7, { wob: .1, seed: 140 });
    line('B', rectPts(x, y + h * .4, w, h * .6, 0, 3).concat([x, y + h * .4]), { w: .7 * s, seed: 141, reveal });
    line('B', [x, y + h * .7, x + w, y + h * .7], { w: .6 * s, seed: 142, reveal: clamp(reveal * 2 - 1) });
    line('B', [x + w * .5, y + h * .4, x + w * .5, y + h * .7], { w: .6 * s, seed: 143, reveal: clamp(reveal * 2 - 1) });
    line('B', [x + w * .3, y + h * .7, x + w * .3, y + h], { w: .6 * s, seed: 144, reveal: clamp(reveal * 2 - 1) });
  } else if (n === 1) {
    line('B', [x, y, x, y + h, x + w, y + h], { w: .7 * s, seed: 145 });
    line('P', bezPts([[x, y + h * .95], [x + w * .6, y + h * .95], [x + w * .8, y + h * .6], [x + w * .95, y + h * .05]], 14), { w: 1 * s, seed: 146, reveal });
  } else {
    for (let k = 0; k < 4; k++) outline('B', rectPts(x + w * .2 + (k % 2) * .8, y + h - (k + 1) * h * .22, w * .6, h * .18, .2, 2), { w: .6 * s, wob: .1, seed: 147 + k });
  }
}

function gear(g, a) {
  const pts = [], n = g.n, ro = g.r, ri = g.r * .78;
  for (let t = 0; t < n; t++) {
    const a0 = a + t * TAU / n, d = TAU / n;
    for (const [f, r] of [[-.5, ri], [-.28, ri], [-.18, ro], [.18, ro], [.28, ri]]) pts.push(g.cx + Math.cos(a0 + f * d) * r, g.cy + Math.sin(a0 + f * d) * r);
  }
  solid('Y', pts, { wob: .1, seed: 150 + g.cx });
  line('B', pts.concat(pts.slice(0, 2)), { w: 1.1, seed: 151 + g.cx });
  line('B', ellPts(g.cx, g.cy, g.r * .26, g.r * .26, 12).concat([g.cx + g.r * .26, g.cy]), { w: 1, seed: 152 + g.cx });
}

/* ------------------------------------------------- what the portholes show */
function porthole0(s, u) {             // CONDENSE: the page is cut into sections
  const { cx, cy } = s; if (u < 0) return;
  const pw = 30, ph = 38;
  const enter = eout(seg(u, 0, .45));
  const px = cx - pw / 2 - (1 - enter) * 64, py = cy - ph / 2 - 3;
  const cut = seg(u, .45, 1.25), fall = seg(u, 1.3, 2.05), lift = seg(u, 1.0, 1.55);
  const n = 5, sh = ph / n;
  if (u > 2.2) {                       // what is left: a few strips on the floor
    for (let k = 0; k < 3; k++) { tsave(); ttr(cx - 12 + k * 12, cy + 26 - k * 2); trot((k - 1) * .4); clearRect4(-12, -3, 24, 6); outline('B', rectPts(-12, -3, 24, 6, .2, 3), { w: .7, wob: .1, seed: 160 + k }); trest(); }
    return;
  }
  for (let k = 0; k < n; k++) {
    const dy = fall * fall * (52 + k * 9), dx = fall * (k - 2) * 5, rot = fall * (k - 2) * .22;
    tsave(); ttr(px + pw / 2 + dx, py + k * sh + sh / 2 + dy); trot(rot);
    clearRect4(-pw / 2, -sh / 2, pw, sh);
    const cutHere = cut * n > k + 1 || fall > 0;
    if (cutHere || k === 0) line('B', [-pw / 2, -sh / 2, pw / 2, -sh / 2], { w: .8, seed: 161 + k });
    if (cutHere || k === n - 1) line('B', [-pw / 2, sh / 2, pw / 2, sh / 2], { w: .8, seed: 162 + k });
    line('B', [-pw / 2, -sh / 2, -pw / 2, sh / 2], { w: .8, seed: 163 + k }); line('B', [pw / 2, -sh / 2, pw / 2, sh / 2], { w: .8, seed: 164 + k });
    line('B', [-pw / 2 + 4, 0, pw / 2 - (k === 0 ? 14 : 5), 0], { w: .55, seed: 165 + k });
    trest();
  }
  if (cut > 0 && cut < 1) { const ky = py + cut * ph; line('P', [px - 6, ky, px + pw + 6, ky - 1], { w: 1.4, seed: 170 }); }
  if (lift < 1) figCard(px + pw - 7, py + 6 - eio(lift) * 46, 1);
}
function porthole1(s, u) {             // PLAN: eight boxes, and the equation becomes a poem
  const { cx, cy } = s; if (u < 0) return;
  const bw = 11, bh = 14, gx = cx - (bw * 4 + 6) / 2, gy = cy - bh - 8;
  for (let k = 0; k < 8; k++) {
    const r = seg(u, k * .11, k * .11 + .3); if (r <= 0) continue;
    const c = k % 4, row = Math.floor(k / 4), x = gx + c * (bw + 2), y = gy + row * (bh + 3);
    line('B', rectPts(x, y, bw, bh, .5, 2).concat([x + .5, y]), { w: .8, seed: 180 + k, reveal: r });
    if (r >= 1) say('B', String(k + 1), x + bw / 2, y + bh / 2 - 2.4, 4.4, { align: 'center', w: .7, seed: 190 + k });
  }
  const e = seg(u, 1.0, 1.4), m = seg(u, 1.5, 1.9), gone = seg(u, 1.95, 2.2);
  if (e > 0 && gone < 1) {
    const x = cx - 16, y = cy + 20 + (1 - eout(e)) * 30 + eio(gone) * 30;
    clearRect4(x, y, 32, 11); outline('B', rectPts(x, y, 32, 11, .4, 3), { w: .8, wob: .1, seed: 200 });
    if (m < .5) say('B', '∫ L COS θ', x + 16, y + 3, 4.6, { align: 'center', w: .7, seed: 201 });
    else for (let k = 0; k < 2; k++) { const yy = y + 3.6 + k * 4; const p = []; for (let j = 0; j <= 12; j++) p.push(x + 4 + j * 2, yy + Math.sin(j * 1.2 + k) * .9); line('P', p, { w: .8, seed: 202 + k }); }
    if (m > 0 && m < 1) for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, r0 = 8 + m * 6, r1 = r0 + 5; line('P', [x + 16 + Math.cos(a) * r0, y + 5.5 + Math.sin(a) * r0, x + 16 + Math.cos(a) * r1, y + 5.5 + Math.sin(a) * r1], { w: 1, seed: 204 + k }); }
  }
}
function porthole2(s, u) {             // PICTURES: a prompt becomes a drawing
  const { cx, cy } = s; if (u < 0) return;
  const fw = 42, fh = 30, fx = cx - fw / 2, fy = cy - fh / 2 + 4;
  const pr = seg(u, 0, .5);
  if (u < 2) say('B', 'A WALLED GARDEN', cx, cy - 27, 3.6, { align: 'center', w: .65, seed: 210, reveal: pr });
  clearRect4(fx, fy, fw, fh); outline('B', rectPts(fx, fy, fw, fh, .5, 3), { w: .9, wob: .15, seed: 211 });
  const d = seg(u, .45, 1.6);
  if (u < 1.95) {
    doodle(0, fx + 4, fy + 4, fw - 8, fh - 8, 1.3, d);
    if (d > 0 && d < 1) {               // the pen
      const px = fx + 4 + (fw - 8) * ((d * 3) % 1), py = fy + fh * .45 + (fh - 8) * .55 * Math.floor(d * 3) / 3;
      solid('B', polyPts(px, py, px + 2, py - 5, px + 5, py - 4), { wob: .1, seed: 212 });
      line('B', [px + 3.5, py - 4.5, px + 12, py - 13], { w: 2, seed: 213 });
    }
    const sp = seg(u, 1.6, 1.95);
    if (sp > 0 && sp < 1) for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .3, r0 = 18 + sp * 6; line('P', [cx + Math.cos(a) * r0, fy + fh / 2 + Math.sin(a) * r0 * .8, cx + Math.cos(a) * (r0 + 5), fy + fh / 2 + Math.sin(a) * (r0 + 5) * .8], { w: 1, seed: 214 + k }); }
  } else {
    doodle(0, fx + 4, fy + 4, fw - 8, fh - 8, 1.3, 1);
    person(fx + 9, fy + fh - 4, .42, { w: 1.6 });
  }
}
function porthole3(s, u) {             // ASSEMBLE: the drum prints the sheet
  const { cx, cy } = s; if (u < 0) return;
  const run = clamp(u, 0, 2.2), a = run * 4.2, r = 19, dy = cy - 7;
  const sx = cx - 40 + seg(u, .4, 2.15) * 46;
  clearRect4(sx - 30, dy + r - 1, 30, 5); outline('B', rectPts(sx - 30, dy + r - 1, 30, 5, .2, 3), { w: .7, wob: .1, seed: 220 });
  for (let k = 0; k < 4; k++) line('P', [sx - 27 + k * 7, dy + r + 1.5, sx - 23 + k * 7, dy + r + 1.5], { w: .9, seed: 221 + k });
  clearPoly(ellPts(cx, dy, r, r, 30));
  tone('P', ellPts(cx, dy, r, r, 30), .35, { wob: 0, seed: 225 });
  for (let k = 0; k < 7; k++) { const t = a + k * TAU / 7; line('B', [cx + Math.cos(t) * r * .25, dy + Math.sin(t) * r * .25, cx + Math.cos(t) * r * .92, dy + Math.sin(t) * r * .92], { w: .7, seed: 226 + k }); }
  line('B', ellPts(cx, dy, r, r, 32).concat([cx + r, dy]), { w: 1.2, seed: 233 });
  line('B', ellPts(cx, dy, 3, 3, 10).concat([cx + 3, dy]), { w: 1, seed: 234 });
}

/* ------------------------------------------------------------ the paper */
function paperPose(L) {
  const P = L.paper;
  if (Z.dragPos) return { cx: Z.dragPos[0], cy: Z.dragPos[1], rot: P.rot * .4 };
  if (Z.snap) { const e = eout(clamp(Z.snap.p)); return { cx: lerp(Z.snap.from[0], P.cx, e), cy: lerp(Z.snap.from[1], P.cy, e), rot: P.rot }; }
  return { cx: P.cx, cy: P.cy, rot: P.rot };
}
function paperDims(L) { const s = L.paper.s; return { w: (PAPER_W + 16) * s, h: (PAPER_H + 14) * s }; }
function drawPaper(L, T) {
  if (!PAPER_INK) return;
  const D = paperDims(L), iw = PAPER_INK.B.width, ih = PAPER_INK.B.height;
  if (!Z.started) {
    const p = paperPose(L);
    tsave(); ttr(p.cx, p.cy); trot(p.rot);
    tone('B', rectPts(-D.w / 2 + 5, -D.h / 2 + 6, D.w - 4, D.h - 4, 1, 6), .12, { wob: .4, seed: 240 });
    const s = L.paper.s;
    for (const [dx, dy] of [[12, 10], [6, 5], [0, 0]]) clearRect4(-D.w / 2 + (2 + dx) * s, -D.h / 2 + (2 + dy) * s, PAPER_W * s, PAPER_H * s);
    blit(PAPER_INK, -D.w / 2, -D.h / 2, D.w, D.h);
    trest();
    return;
  }
  if (T >= ZT.feed) return;
  // feeding: the sheet is pulled in and squeezed through the slot
  const from = Z.feedFrom || [L.paper.cx, L.paper.cy, L.paper.rot];
  const f = ein(seg(T, 0, ZT.feed)), r = from[2] * (1 - sm(seg(T, 0, ZT.feed * .45)));
  const M = L.mouth, N = 90, BEND = 70;
  if (L.axis === 'x') {
    const ex = M.x + D.w / 2 + 10, ey = M.y;
    const cx = lerp(from[0], ex, f), cy = lerp(from[1], ey, f);
    tsave(); tclipRect(0, 0, M.x - 4, L.H);
    for (let k = 0; k < N; k++) {
      const u0 = k / N, u1 = (k + 1) / N, x0 = cx - D.w / 2 + u0 * D.w, x1 = cx - D.w / 2 + u1 * D.w;
      if (x0 > M.x) break;
      const q = sm(clamp((x1 - (M.x - BEND)) / BEND)), hh = lerp(D.h, M.h - 4, q * q), yc = lerp(cy + Math.sin(r) * (x0 - cx), M.y, q) + Math.sin(k * .35 + T * 7) * 1.4 * q;
      clearRect4(x0, yc - hh / 2, x1 - x0 + .4, hh);
      blitPart(PAPER_INK, u0 * iw, 0, iw / N, ih, x0, yc - hh / 2, x1 - x0 + .4, hh);
    }
    trest();
  } else {
    const ex = M.x, ey = M.y + D.h / 2 + 10;
    const cx = lerp(from[0], ex, f), cy = lerp(from[1], ey, f);
    tsave(); tclipRect(0, 0, L.W, M.y - 4);
    for (let k = 0; k < N; k++) {
      const u0 = k / N, u1 = (k + 1) / N, y0 = cy - D.h / 2 + u0 * D.h, y1 = cy - D.h / 2 + u1 * D.h;
      if (y0 > M.y) break;
      const q = sm(clamp((y1 - (M.y - BEND)) / BEND)), ww = lerp(D.w, M.h * 4 - 6, q * q), xc = lerp(cx - Math.sin(r) * (y0 - cy), M.x, q) + Math.sin(k * .35 + T * 7) * 1.4 * q;
      clearRect4(xc - ww / 2, y0, ww, y1 - y0 + .4);
      blitPart(PAPER_INK, 0, u0 * ih, iw, ih / N, xc - ww / 2, y0, ww, y1 - y0 + .4);
    }
    trest();
  }
}

/* ------------------------------------------------- the sheet and the fold */
function panelRect(sx, sy, pw, ph, r, c) { return [sx + c * pw, sy + r * ph, pw, ph]; }
function blitPage(i, x, y, w, h, flip) {
  if (!PG[i]) return;
  if (!flip) { blit(PG[i], x, y, w, h); return; }
  tsave(); ttr(x + w / 2, y + h / 2); trot(Math.PI); blit(PG[i], -w / 2, -h / 2, w, h); trest();
}
function drawOutput(L, T) {
  if (!Z.started || T < ZT.out[0]) return;
  if (T >= ZT.fly[1]) return;
  const S0 = L.sheet, sw = S0.w, sh = S0.h, pw = sw / 4, ph = sh / 2;
  let cx = S0.cx, cy = S0.cy;
  const em = seg(T, ZT.out[0], ZT.out[1]);
  tsave();
  if (em < 1) {
    const e = eout(em);
    if (L.axis === 'x') { cx = lerp(L.out.x - sw / 2 + 6, S0.cx, e); cy = lerp(L.out.y, S0.cy, e); tclipRect(L.out.x + 5, 0, L.W, L.H); }
    else { cx = lerp(L.out.x, S0.cx, e); cy = lerp(L.out.y - sh / 2 + 6, S0.cy, e); tclipRect(0, L.out.y + 5, L.W, L.H); }
  }
  const sx = cx - sw / 2, sy = cy - sh / 2;
  const topA = seg(T, ZT.top[0], ZT.top[1]) * Math.PI / 2 * 1.02;
  const acc = seg(T, ZT.acc[0], ZT.acc[1]) * 3;
  const fly = seg(T, ZT.fly[0], ZT.fly[1]);
  if (fly <= 0) {
    // bottom row (columns fold one by one behind the next)
    for (let c = 0; c < 4; c++) {
      const fj = clamp(acc - c), ang = fj * Math.PI / 2 * 1.02;
      if (c < 3 && ang >= Math.PI / 2) continue;
      const k = c < 3 ? Math.cos(ang) : 1, hinge = sx + (c + 1) * pw;
      const x = c < 3 ? hinge - pw * k : sx + c * pw, w = pw * k;
      if (c === 3 && acc > 0) { for (let j = 1; j <= Math.min(3, Math.floor(acc + .99)); j++) outline('B', rectPts(x + j * 1.3, sy + ph + j * 1.1, pw, ph, .3, 4), { w: .7, wob: .1, seed: 250 + j }); }
      clearRect4(x, sy + ph, w, ph); blitPage(IMPOSE[1][c], x, sy + ph, w, ph, false);
      if (c < 3 && fj > 0) tone('B', rectPts(x, sy + ph, w, ph, 0, 4), .35 * (1 - k), { wob: 0, seed: 255 + c });
      outline('B', rectPts(x, sy + ph, w, ph, .3, 4), { w: .8, wob: .12, seed: 258 + c });
    }
    // top row folds backward along the middle
    if (topA < Math.PI / 2) {
      const k = Math.cos(topA), h = ph * k;
      for (let c = 0; c < 4; c++) {
        const x = sx + c * pw, y = sy + ph - h;
        clearRect4(x, y, pw, h); blitPage(IMPOSE[0][c], x, y, pw, h, true);
        if (topA > 0) tone('B', rectPts(x, y, pw, h, 0, 4), .32 * (1 - k), { wob: 0, seed: 262 + c });
        outline('B', rectPts(x, y, pw, h, .3, 4), { w: .8, wob: .12, seed: 266 + c });
      }
    }
    if (em >= 1 && topA === 0) line('B', [sx + 4, sy + ph, sx + sw - 4, sy + ph], { w: .5, wob: .1, seed: 270 });
  } else {
    // the folded zine flies to the reading spot
    const R = L.read, e = eio(fly);
    const x0 = sx + 3 * pw, y0 = sy + ph, x1 = R.cx - R.pw / 2, y1 = R.cy - R.ph / 2;
    const x = lerp(x0, x1, e), y = lerp(y0, y1, e) - Math.sin(e * Math.PI) * 40, w = lerp(pw, R.pw, e), h = lerp(ph, R.ph, e);
    tone('B', rectPts(x + 8, y + 10, w, h, 2, 6), .16, { wob: .6, seed: 271 });
    for (let j = 3; j >= 1; j--) { clearRect4(x + j * 1.6, y + j * 1.4, w, h); outline('B', rectPts(x + j * 1.6, y + j * 1.4, w, h, .4, 6), { w: .8, wob: .15, seed: 272 + j }); }
    clearRect4(x, y, w, h); blitPage(1, x, y, w, h, false);
    outline('B', rectPts(x, y, w, h, .6, 6), { w: 1.2, wob: .2, seed: 276 });
  }
  trest();
}

/* ------------------------------------------------------- reading the zine */
function drawReading(L, T) {
  const R = L.read;
  const u = clamp(Z.unfold);
  if (u > 0) { drawUnfolded(L, eout(u)); return; }
  const st = readState(L);
  if (L.phone) drawSingle(L, st); else drawSpread(L, st);
  // a nudge to flip
  if (!Z.hintSeen && T > ZT.auto + ZT.autoDur + .3) {
    if (!L.phone) { say('P', 'FLIP ME', R.cx + R.pw + 22, R.cy - 10, 10, { seed: 280, w: 1.7 }); arrowAt('P', R.cx + R.pw + 92, R.cy + 2, 0, 7, 1.6, 281); line('P', [R.cx + R.pw + 22, R.cy + 2, R.cx + R.pw + 92, R.cy + 2], { w: 1.6, seed: 282 }); }
    else { say('P', 'TAP OR SWIPE TO FLIP', R.cx, R.cy + R.ph / 2 + 18, 8, { align: 'center', seed: 280, w: 1.4 }); }
  }
}
function spineFor(s, R) { return R.cx + (s === 0 ? -R.pw / 2 : s === 4 ? R.pw / 2 : 0); }
function flatPage(i, x, y, w, h, gutter) {
  if (!i) return;
  clearRect4(x, y, w, h); blitPage(i, x, y, w, h, false);
  if (gutter) { const gx = gutter > 0 ? x : x + w - 12; tone('B', rectPts(gx, y, 12, h, 0, 6), .14, { wob: 0, seed: 283 + i }); }
  outline('B', rectPts(x, y, w, h, .6, 6), { w: 1.1, wob: .2, seed: 286 + i });
}
function bookShadow(x, y, w, h) { tone('B', rectPts(x + 8, y + 10, w, h, 2, 8), .15, { wob: .6, seed: 290 }); }
function drawSpread(L, st) {
  const R = L.read, pw = R.pw, ph = R.ph, top = R.cy - ph / 2;
  if (!st.turn) {
    const s = st.at, [a, b] = SPREADS[s], sp = spineFor(s, R);
    const x0 = a ? sp - pw : sp, x1 = b ? sp + pw : sp;
    bookShadow(x0, top, x1 - x0, ph);
    stackEdges(sp, top, pw, ph, a, b, s);
    flatPage(a, sp - pw, top, pw, ph, -1); flatPage(b, sp, top, pw, ph, 1);
    return;
  }
  const { a: s, p } = st.turn, phi = p * Math.PI;
  const sp = lerp(spineFor(s, R), spineFor(s + 1, R), sm(p));
  const L0 = SPREADS[s][0], R1 = SPREADS[s + 1][1], front = SPREADS[s][1], back = SPREADS[s + 1][0];
  const x0 = L0 || phi > Math.PI / 2 ? sp - pw : sp, x1 = R1 || phi < Math.PI / 2 ? sp + pw : sp;
  bookShadow(x0, top, x1 - x0, ph);
  flatPage(L0, sp - pw, top, pw, ph, -1); flatPage(R1, sp, top, pw, ph, 1);
  // the shadow the lifting page casts on the page below
  const sh = Math.sin(phi) * .2;
  if (phi < Math.PI / 2 && R1) tone('B', rectPts(sp, top, pw * (1 - Math.cos(phi)) * .9 + 6, ph, 0, 6), sh, { wob: 0, seed: 291 });
  if (phi > Math.PI / 2 && L0) tone('B', rectPts(sp - (pw * (1 + Math.cos(phi)) * .9 + 6), top, pw * (1 + Math.cos(phi)) * .9 + 6, ph, 0, 6), sh, { wob: 0, seed: 292 });
  turningPage(phi < Math.PI / 2 ? front : back, sp, R.cy, pw, ph, phi);
}
function stackEdges(sp, top, pw, ph, a, b, s) {
  // a few page edges under the open zine, thicker on the side with more pages
  const left = s, right = 4 - s;
  for (let j = 1; j <= Math.min(3, right); j++) if (b) outline('B', rectPts(sp + j * 1.4, top + j * 1.2, pw, ph, .4, 6), { w: .7, wob: .1, seed: 293 + j });
  for (let j = 1; j <= Math.min(3, left); j++) if (a) outline('B', rectPts(sp - pw - j * 1.4, top + j * 1.2, pw, ph, .4, 6), { w: .7, wob: .1, seed: 297 + j });
}
/* A page hinged at the spine, rotated phi (0 = flat right, π = flat left), drawn in
   vertical strips with perspective so it lifts off the paper. */
function turningPage(i, sp, cy, pw, ph, phi) {
  if (!i || !PG[i]) return;
  const N = 30, D = 2100, iw = PG[i].B.width, ih = PG[i].B.height, sn = Math.sin(phi), cs = Math.cos(phi), back = phi > Math.PI / 2;
  const X = u => { const z = u * sn, s = D / (D - z); return [sp + u * cs * s, s]; };
  const topE = [], botE = [];
  for (let k = 0; k <= N; k++) { const u = k / N * pw, [x, s] = X(u); topE.push(x, cy - ph / 2 * s); botE.unshift(x, cy + ph / 2 * s); }
  const poly = topE.concat(botE);
  clearPoly(poly);
  for (let k = 0; k < N; k++) {
    const u0 = k / N * pw, u1 = (k + 1) / N * pw, [xa] = X(u0), [xb, sb] = X(u1), [, sm_] = X((u0 + u1) / 2);
    const hh = ph * sm_, y = cy - hh / 2;
    if (!back) blitPart(PG[i], k / N * iw, 0, iw / N, ih, Math.min(xa, xb), y, Math.abs(xb - xa) + .5, hh);
    else blitPart(PG[i], (1 - (k + 1) / N) * iw, 0, iw / N, ih, Math.min(xa, xb) - .5, y, Math.abs(xb - xa) + .5, hh);
    void sb;
  }
  tone('B', poly, .13 * Math.abs(sn) * (back ? .7 : 1), { wob: 0, seed: 301 });
  line('B', poly.concat(poly.slice(0, 2)), { w: 1.1, wob: .15, seed: 302 });
}
function drawSingle(L, st) {
  const R = L.read, pw = R.pw, ph = R.ph, x = R.cx - pw / 2, top = R.cy - ph / 2;
  bookShadow(x, top, pw, ph);
  if (!st.turn) { const k = st.at; for (let j = 1; j <= Math.min(3, 7 - k); j++) outline('B', rectPts(x + j * 1.4, top + j * 1.2, pw, ph, .4, 6), { w: .7, wob: .1, seed: 303 + j }); flatPage(k + 1, x, top, pw, ph, 0); return; }
  const { a, p } = st.turn, phi = p * Math.PI / 2;
  flatPage(a + 2, x, top, pw, ph, 0);
  if (phi < Math.PI / 2 - .02) turningPage(a + 1, x, R.cy, pw, ph, phi);
}
function drawUnfolded(L, e) {
  const U = L.unf;
  if (U.rot) { tsave(); ttr(U.cx, U.cy); trot(U.rot); drawUnfolded0({ cx: 0, cy: 0, w: U.w }, e, true); trest(); }
  else drawUnfolded0(U, e, false);
}
function drawUnfolded0(U, e, phone) {
  const w = U.w * lerp(.55, 1, e), h = w * 8.5 / 11, sx = U.cx - w / 2, sy = U.cy - h / 2, pw = w / 4, ph = h / 2;
  tone('B', rectPts(sx + 8, sy + 10, w, h, 2, 8), .15, { wob: .6, seed: 310 });
  clearRect4(sx, sy, w, h);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) blitPage(IMPOSE[r][c], sx + c * pw, sy + r * ph, pw, ph, r === 0);
  outline('B', rectPts(sx, sy, w, h, .6, 6), { w: 1.3, wob: .2, seed: 311 });
  const dash = (x0, y0, x1, y1, ink, seed) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 9)); for (let k = 0; k < n; k += 2) line(ink, [lerp(x0, x1, k / n), lerp(y0, y1, k / n), lerp(x0, x1, (k + 1) / n), lerp(y0, y1, (k + 1) / n)], { w: 1.1, seed: seed + k }); };
  for (let c = 1; c < 4; c++) dash(sx + c * pw, sy + 4, sx + c * pw, sy + h - 4, 'B', 320 + c * 40);
  dash(sx + 4, sy + ph, sx + pw, sy + ph, 'B', 480); dash(sx + 3 * pw, sy + ph, sx + w - 4, sy + ph, 'B', 520);
  dash(sx + pw, sy + ph, sx + 3 * pw, sy + ph, 'P', 560);
  if (e > .9) {
    const lx = sx + 2 * pw, ly = sy + ph;
    tsave(); ttr(lx, ly - 13); solid('Y', rectPts(-20, -6, 40, 11, 2, 3), { wob: .3, seed: 600 }); say('P', 'CUT', 0, -3.6, 6.4, { align: 'center', seed: 601, w: 1.3 }); trest();
    if (!phone) { tsave(); ttr(sx + pw, sy + h + 14); say('B', 'FOLD ON THE DASHES', 0, 0, 6, { seed: 602 }); trest(); }
  }
}

/* ======================================================= the figure loop */
const ui = {
  feed: document.getElementById('b-feed'), prev: document.getElementById('b-prev'), next: document.getElementById('b-next'),
  unfold: document.getElementById('b-unfold'), again: document.getElementById('b-again'), status: document.getElementById('zstatus'),
  hitPaper: document.getElementById('hit-paper'), hitPrev: document.getElementById('hit-prev'), hitNext: document.getElementById('hit-next'),
};
const STATUS = {
  idle: 'Drag the paper into the machine, or press “Feed the paper”.',
  feed: 'In goes the PDF.',
  s0: '1 of 4 · Condense. Claude reads the paper, summarizes it into short sections and picks the figures worth keeping.',
  s1: '2 of 4 · Plan. Claude plans the zine page by page. A dense equation can come back as a short poem.',
  s2: '3 of 4 · Pictures. The plan includes prompts for a text-to-image model, which draws the illustrations.',
  s3: '4 of 4 · Assemble. The words and pictures are laid out together.',
  fold: 'Out comes one printed sheet, and it folds into an eight-page zine.',
};
function readStatus(L) {
  if (Z.unfold > .5) return 'The whole zine is one sheet. Fold it on the dashes and cut along the pink line to make your own.';
  const st = readState(L);
  if (L.phone) { const k = st.turn ? st.turn.a + 1 : st.at; return `Page ${k + 1} of 8. Tap the right side or swipe to turn; tap the left side to go back.`; }
  const s = st.turn ? st.turn.a + 1 : st.at;
  return ['The cover.', 'Pages 2 and 3.', 'Pages 4 and 5.', 'Pages 6 and 7.', 'The back cover.'][s] + ' Flip with Next, the arrow keys, a swipe, or a tap on the page.';
}
let lastStatus = '';
function syncUI() {
  const L = press.lay, T = readT(), ph = phaseOf(T), reading = ph === 'read';
  const st = reading ? readState(L) : null, max = L.phone ? 7 : 4;
  ui.feed.disabled = Z.started; ui.again.disabled = !reading;
  ui.prev.disabled = !reading || Z.unfold > 0 || (st && !st.turn && st.at === 0);
  ui.next.disabled = !reading || Z.unfold > 0 || (st && !st.turn && st.at === max);
  ui.unfold.disabled = !reading;
  ui.unfold.textContent = Z.unfoldTo ? 'Fold it back up' : 'Unfold the sheet';
  const s = reading ? readStatus(L) : STATUS[ph];
  if (s !== lastStatus) { ui.status.textContent = s; lastStatus = s; }
  // hit areas
  const D = paperDims(L), P = paperPose(L);
  ui.hitPaper.hidden = Z.started;
  if (!Z.started) placeHit(ui.hitPaper, L, P.cx - D.w / 2, P.cy - D.h / 2, D.w, D.h);
  const showFlip = reading && Z.unfold === 0;
  ui.hitPrev.hidden = ui.hitNext.hidden = !showFlip;
  if (showFlip) {
    const R = L.read, top = R.cy - R.ph / 2;
    if (L.phone) { placeHit(ui.hitPrev, L, R.cx - R.pw / 2, top, R.pw * .4, R.ph); placeHit(ui.hitNext, L, R.cx - R.pw / 2 + R.pw * .4, top, R.pw * .6, R.ph); }
    else { const sp = spineFor(st.turn ? st.turn.a : st.at, R); placeHit(ui.hitPrev, L, sp - R.pw, top, R.pw, R.ph); placeHit(ui.hitNext, L, sp, top, R.pw, R.ph); }
  }
}

function startFeed(from) {
  if (Z.started) return;
  const P = press.lay.paper;
  Z.feedFrom = from || [P.cx, P.cy, P.rot];
  Z.started = true; Z.T = 0; Z.userTurned = false; Z.spread = 0; Z.page = 0; Z.turn = null; Z.unfold = Z.unfoldTo = 0; Z.hintSeen = false;
  Z.dragPos = null; Z.snap = null;
  if (REDUCE) { Z.T = ZT.read + .01; Z.userTurned = true; }
  fig.dirty = true; syncUI();
}
function turn(dir) {
  const L = press.lay; if (phaseOf(readT()) !== 'read' || Z.unfold > 0) return;
  const st = readState(L);
  if (!Z.userTurned) { Z.userTurned = true; Z.turn = st.turn ? { a: st.turn.a, p: st.turn.p, dir: 1 } : null; if (L.phone) Z.page = st.at; else Z.spread = st.at; }
  Z.hintSeen = true;
  const max = L.phone ? 7 : 4, at = L.phone ? Z.page : Z.spread;
  if (Z.turn) { Z.queue = dir; return; }                // finish this turn, then take the next
  if (dir > 0 && at < max) Z.turn = { a: at, p: 0, dir: 1 };
  else if (dir < 0 && at > 0) Z.turn = { a: at - 1, p: 1, dir: -1 };
  else return;
  if (REDUCE) finishTurn();
  fig.dirty = true;
}
function finishTurn() {
  const L = press.lay, t = Z.turn; if (!t) return;
  const at = t.dir > 0 ? t.a + 1 : t.a;
  if (L.phone) Z.page = at; else Z.spread = at;
  Z.turn = null;
  if (Z.queue) { const q = Z.queue; Z.queue = 0; turn(q); }
}
function reset() {
  Z.started = false; Z.T = 0; Z.turn = null; Z.unfold = Z.unfoldTo = 0; Z.userTurned = false; Z.spread = 0; Z.page = 0; Z.hintSeen = false; Z.feedFrom = null;
  fig.dirty = true; syncUI();
}

const fig = {
  el: zSheet, dirty: true,
  onShow() { this.dirty = true; },
  update(dt) {
    const T = readT();
    if (Z.started && !REDUCE) Z.T = Math.min(Z.T + dt, 9999);
    if (Z.turn) {
      Z.turn.p += Z.turn.dir * dt / TURN_DUR;
      if ((Z.turn.dir > 0 && Z.turn.p >= 1) || (Z.turn.dir < 0 && Z.turn.p <= 0)) finishTurn();
    }
    if (Z.unfold !== Z.unfoldTo) { const d = dt / .55; Z.unfold = Z.unfoldTo > Z.unfold ? Math.min(Z.unfoldTo, Z.unfold + d) : Math.max(Z.unfoldTo, Z.unfold - d); if (REDUCE) Z.unfold = Z.unfoldTo; }
    if (Z.snap) { Z.snap.p += dt / .35; if (Z.snap.p >= 1) Z.snap = null; }
    const moving = (Z.started && T < ZT.auto + ZT.autoDur + 1) || Z.turn || Z.unfold !== Z.unfoldTo || Z.snap || Z.dragPos;
    // one more update after motion stops, so the last frame and the status settle
    const settle = !!this.wasMoving && !moving; this.wasMoving = !!moving;
    this.dirty = this.dirty || !!moving || settle;
    if (this.dirty) syncUI();
  },
  draw(boil) { press.frame(boil, drawDynamic); },
};

/* ------------------------------------------------------------ input */
ui.feed.addEventListener('click', () => {
  startFeed();
  const r = zSheet.getBoundingClientRect();
  if (r.top < -40 && !REDUCE) zSheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
ui.again.addEventListener('click', reset);
ui.prev.addEventListener('click', () => turn(-1));
ui.next.addEventListener('click', () => turn(1));
ui.unfold.addEventListener('click', () => { if (phaseOf(readT()) !== 'read') return; Z.hintSeen = true; Z.unfoldTo = Z.unfoldTo ? 0 : 1; fig.dirty = true; syncUI(); });
let swallow = false;
ui.hitPrev.addEventListener('click', () => { if (swallow) { swallow = false; return; } turn(-1); });
ui.hitNext.addEventListener('click', () => { if (swallow) { swallow = false; return; } turn(1); });
// swipe on the zine
let sw0 = null;
for (const h of [ui.hitPrev, ui.hitNext]) {
  h.addEventListener('pointerdown', e => { sw0 = [e.clientX, e.clientY]; });
  h.addEventListener('pointerup', e => { if (!sw0) return; const dx = e.clientX - sw0[0], dy = e.clientY - sw0[1]; sw0 = null; if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy)) { swallow = true; turn(dx < 0 ? 1 : -1); setTimeout(() => { swallow = false; }, 400); } });
}
// drag the paper into the machine
let drag = null;
ui.hitPaper.addEventListener('pointerdown', e => {
  if (Z.started) return;
  const [x, y] = press.toLay(e), P = paperPose(press.lay);
  drag = { ox: x - P.cx, oy: y - P.cy, x0: e.clientX, y0: e.clientY, moved: false, id: e.pointerId };
  ui.hitPaper.setPointerCapture(e.pointerId); e.preventDefault();
});
ui.hitPaper.addEventListener('pointermove', e => {
  if (!drag) return;
  if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 5) drag.moved = true;
  if (!drag.moved) return;
  const [x, y] = press.toLay(e); Z.dragPos = [x - drag.ox, y - drag.oy]; fig.dirty = true;
});
ui.hitPaper.addEventListener('pointerup', e => {
  if (!drag) return;
  const L = press.lay, D = paperDims(L), moved = drag.moved; drag = null;
  if (!moved) { startFeed(); return; }
  const p = Z.dragPos; Z.dragPos = null;
  const near = L.axis === 'x' ? (p[0] + D.w / 2 > L.mouth.x - 40 && Math.abs(p[1] - L.mouth.y) < D.h * .7) : (p[1] + D.h / 2 > L.mouth.y - 40 && Math.abs(p[0] - L.mouth.x) < D.w * .9);
  if (near) startFeed([p[0], p[1], L.paper.rot * .4]); else { Z.snap = { from: p, p: 0 }; fig.dirty = true; }
});
ui.hitPaper.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startFeed(); } });
zSheet.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
});

/* ------------------------------------------------------------ boot */
function boot() {
  press.resize(); buildCaches();
  if (FIXED_T !== null) {
    Z.started = FIXED_T > 0; Z.T = FIXED_T;
    if (QS.has('page')) { Z.userTurned = true; const pg = parseInt(QS.get('page'), 10) || 0; if (press.lay.phone) Z.page = clamp(pg, 0, 7); else Z.spread = clamp(pg, 0, 4); }
    if (QS.has('turn')) { Z.userTurned = true; const a = parseInt(QS.get('turn'), 10) || 0; Z.turn = { a, p: parseFloat(QS.get('p') || '.5'), dir: 1 }; }
    if (QS.get('unfold') === '1') Z.unfold = Z.unfoldTo = 1;
    if (QS.get('hint') === '0') Z.hintSeen = true;
    if (QS.has('drag')) { const [x, y] = QS.get('drag').split(',').map(Number); Z.dragPos = [x, y]; }
  }
  syncUI();
  fig.draw(0); fig.drawnBoil = 0; fig.dirty = false;
  window.__ready = true;
}
registerFigure(fig);
let rz = 0;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { const w = press.wCss; const nw = Math.round(zCv.parentElement.clientWidth); if (Math.abs(nw - w) < 2) return; press.resize(); buildCaches(); syncUI(); fig.dirty = true; if (FIXED_T !== null) fig.draw(0); }, 140); });
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { boot(); startClock(); });
