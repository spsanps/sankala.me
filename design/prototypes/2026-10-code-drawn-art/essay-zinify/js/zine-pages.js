/* =============================================================================
   zine-pages.js — the eight pages of the zine ZINify makes about itself, and
   the first page of the paper that goes into the machine.

   Every page is drawn in page units (PG_W × PG_H, the 2.75 × 4.25 in panel of
   a letter sheet folded into an eight-page mini-zine) with the riso.js hand:
   blue for line and lettering, pink for accents, yellow for fills.

   Words on the pages paraphrase the ZINify paper (Shriram and Sreekala,
   UIST '23 Adjunct). The poem on page 7 is quoted from its Figure 3.
   ========================================================================== */
'use strict';
const PG_W = 110, PG_H = 170;

/* ------------------------------------------------- a few more letterforms */
function addGlyph(ch, w, ...strokes) {
  const s = strokes.map(st => {
    if (st.d) return { pts: st.d, len: .6, dot: true };
    const pts = st.c ? catmull(st.c, 4) : st;
    let len = 0; for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
    return { pts, len };
  });
  GL[ch] = { w, s, len: s.reduce((a, b) => a + b.len, 0) };
}
addGlyph('∫', 4.2, S(4, .9, 3.3, -.2, 2.3, .4, 1.9, 2.6, 1.6, 6, 1.3, 9, .5, 10.6, -.4, 9.6));
addGlyph('θ', 5.4, A_(2.7, 5, 2.7, 5, -100, 275), [.3, 5, 5.1, 5]);
addGlyph('ω', 7.6, S(1.4, 3.4, .2, 6.6, 1.4, 9.6, 3, 9.5, 3.8, 6.8, 4.6, 9.5, 6.2, 9.6, 7.4, 6.6, 6.2, 3.4));
GL['Θ'] = GL['θ']; GL['Ω'] = GL['ω'];          // say() upper-cases its text
addGlyph('#', 6, [1.9, .4, 1.3, 9.6], [4.9, .4, 4.3, 9.6], [.3, 3.4, 6, 3.4], [0, 6.6, 5.7, 6.6]);
addGlyph('*', 4.6, [2.3, 1, 2.3, 7], [0, 2.4, 4.6, 5.6], [4.6, 2.4, 0, 5.6]);
addGlyph('"', 2.8, [.6, 0, .4, 3], [2.4, 0, 2.2, 3]);

/* ---------------------------------------------------------------- helpers */
function wrapLines(str, size, maxW, track = 1.8) {
  const words = str.split(' '); const out = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (tw(t, size, track) <= maxW || !cur) cur = t; else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  return out;
}
/* Set a paragraph of hand lettering; returns the y below it. */
function para(ink, str, x, y, size, maxW, lh, o = {}) {
  const lines = wrapLines(str, size, maxW, o.track);
  lines.forEach((l, i) => say(ink, l, x, y + i * lh, size, { ...o, seed: (o.seed ?? 5) + i * 17 }));
  return y + lines.length * lh;
}
/* Highlighter swipe behind a line of lettering. */
function swipe(x0, y0, x1, y1, seed = 3) {
  solid('Y', polyPts(x0, y0 + .6, x1, y0 - .4, x1 + .8, y1, x0 - .6, y1 + .5), { wob: .5, seed });
}
function star(cx, cy, R, ink = 'P', seed = 1, n = 5) {
  const p = [];
  for (let k = 0; k <= n * 2; k++) { const a = -Math.PI / 2 + k * Math.PI / n, r = k % 2 ? R * .42 : R; p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  line(ink, p, { w: Math.max(.7, R * .16), seed });
}
function pageNo(n) { say('B', String(n), n % 2 ? PG_W - 7 : 7, PG_H - 9, 4, { align: n % 2 ? 'right' : 'left', w: .7, seed: 900 + n }); }
function person(x, y, s = 1, o = {}) {          // a small stick reader standing on y
  const ink = o.ink ?? 'B', w = (o.w ?? 1.1) * s;
  line(ink, ellPts(x, y - 19 * s, 3.4 * s, 3.6 * s, 18).concat([x + 3.4 * s, y - 19 * s]), { w, seed: 31 + x });
  line(ink, [x, y - 15.2 * s, x + .3 * s, y - 7 * s], { w, seed: 32 + x });
  line(ink, [x - 3.4 * s, y, x + .3 * s, y - 7 * s, x + 3.6 * s, y], { w, seed: 33 + x });
  const arms = o.arms ?? 'down';
  if (arms === 'up') line(ink, [x - 4.6 * s, y - 18 * s, x, y - 13 * s, x + 4.6 * s, y - 18 * s], { w, seed: 34 + x });
  else if (arms === 'wave') line(ink, [x - 4.4 * s, y - 9.5 * s, x, y - 13 * s, x + 4.2 * s, y - 18.5 * s], { w, seed: 34 + x });
  else line(ink, [x - 4 * s, y - 8.5 * s, x, y - 13 * s, x + 4 * s, y - 8.5 * s], { w, seed: 34 + x });
}
function miniPaper(x, y, w, h, rot = 0, seed = 1) {   // a little sheet with text lines
  tsave(); ttr(x + w / 2, y + h / 2); trot(rot); ttr(-w / 2, -h / 2);
  knock(rectPts(0, 0, w, h, .5, 3), { wob: 0 });
  outline('B', rectPts(0, 0, w, h, .5, 3), { w: .8, wob: .25, seed });
  const r = rng(seed * 13);
  for (let yy = h * .16; yy < h * .9; yy += h * .11) line('B', [w * .14, yy, w * (.62 + r() * .24), yy], { w: .55, wob: .15, seed: seed + yy });
  trest();
}

/* -------------------------------------------------------------- the pages */
const ZINE_PAGES = [];

/* 1 — front cover */
ZINE_PAGES[1] = () => {
  tone('P', ellPts(57, 68, 47, 28, 34), .42, { wob: 2.2, seed: 11 });
  say('B', 'ISSUE #1', 9, 10, 4.6, { seed: 3 });
  say('B', "UIST '23", PG_W - 9, 10, 4.6, { align: 'right', seed: 4 });
  line('B', [8, 19.5, PG_W - 8, 19.2], { w: .8, seed: 5 });
  say('P', 'ZINIFY!', 56.6, 57.2, 21, { align: 'center', w: 3.1, seed: 21, gj: 1.4 });
  say('B', 'ZINIFY!', 55, 55.6, 21, { align: 'center', w: 2.3, seed: 21, gj: 1.4 });
  // a paper turning into a zine
  miniPaper(12, 98, 25, 33, -.08, 7);
  line('P', bezPts([[42, 114], [48, 108], [54, 108], [62, 113]], 16), { w: 1.6, seed: 8 });
  arrowAt('P', 62, 113, .5, 5, 1.5, 9);
  const zx = 68, zy = 96;
  solid('Y', polyPts(zx, zy + 4, zx + 15, zy + 1, zx + 15, zy + 37, zx, zy + 40), { wob: .5, seed: 12 });
  solid('Y', polyPts(zx + 15, zy + 1, zx + 31, zy + 5, zx + 31, zy + 41, zx + 15, zy + 37), { wob: .5, seed: 13 });
  line('B', polyPts(zx, zy + 4, zx + 15, zy + 1, zx + 31, zy + 5, zx + 31, zy + 41, zx + 15, zy + 37, zx, zy + 40, zx, zy + 4), { w: .95, seed: 14 });
  line('B', [zx + 15, zy + 1, zx + 15, zy + 37], { w: .8, seed: 15 });
  say('B', 'ZINE', zx + 23, zy + 15, 4.2, { align: 'center', seed: 16 });
  star(zx + 6, zy - 6, 4.2, 'P', 17); star(zx + 35, zy + 46, 3, 'B', 18, 4); star(14, 92, 2.8, 'B', 19, 4);
  swipe(17, 145.5, 93, 152.5, 22);
  say('B', 'RESEARCH PAPERS', 55, 145, 5.6, { align: 'center', seed: 23 });
  say('B', 'INTO ZINES', 55, 155, 5.6, { align: 'center', seed: 24 });
};

/* 2 — the walled garden */
ZINE_PAGES[2] = () => {
  say('B', 'A WALLED', 55, 11, 9.5, { align: 'center', seed: 41 });
  say('B', 'GARDEN', 55, 24, 9.5, { align: 'center', seed: 42 });
  miniPaper(24, 50, 16, 21, -.18, 43); miniPaper(43, 45, 17, 22, .06, 44); miniPaper(63, 49, 16, 21, .2, 45);
  // the wall
  const wx0 = 12, wx1 = 98, wy0 = 66, wy1 = 112;
  knock(rectPts(wx0, wy0, wx1 - wx0, wy1 - wy0, 0, 4), { wob: 0 });
  tone('Y', rectPts(wx0, wy0, wx1 - wx0, wy1 - wy0, 0, 4), .62, { wob: .3, seed: 46 });
  outline('B', rectPts(wx0, wy0, wx1 - wx0, wy1 - wy0, .6, 4), { w: 1.1, seed: 47 });
  for (let r = 1; r < 6; r++) { const y = wy0 + r * 7.7; line('B', [wx0, y, wx1, y + .3], { w: .65, wob: .2, seed: 48 + r }); }
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const x = wx0 + 6 + c * 13 + (r % 2 ? 6.5 : 0); if (x > wx1 - 2) continue;
    line('B', [x, wy0 + r * 7.7, x + .2, wy0 + (r + 1) * 7.7], { w: .6, wob: .1, seed: 60 + r * 9 + c });
  }
  // a padlock on the gate
  solid('P', rectPts(73, 86, 13, 11, 1.4, 3), { wob: .3, seed: 71 });
  line('B', arcPts(79.5, 86.5, 4.4, 5.4, 180, 360), { w: 1.2, seed: 72 });
  line('B', [79.5, 90, 79.5, 93], { w: 1, seed: 73 });
  // a reader outside
  line('B', [6, 122, 104, 122.4], { w: .7, seed: 74 });
  person(28, 121, 1, { arms: 'up' });
  say('P', '?', 36, 94, 6, { seed: 75 });
  para('B', 'JARGON AND PAYWALLS KEEP MOST PEOPLE OUTSIDE.', 55, 132, 5.2, 92, 8.6, { align: 'center', seed: 76 });
  pageNo(2);
};

/* 3 — the reader */
ZINE_PAGES[3] = () => {
  say('B', 'THE READER', 55, 11, 9, { align: 'center', seed: 81 });
  para('B', 'CURIOUS, BUT NOT AN EXPERT.', 55, 25, 4.8, 94, 7.5, { align: 'center', seed: 82 });
  line('B', [14, 40, 14, 120, 98, 120], { w: 1, seed: 83 });
  tone('Y', polyPts(15, 119, 70, 117, 84, 98, 92, 46, 97, 46, 97, 119), .55, { wob: .4, seed: 84 });
  line('P', bezPts([[15, 119], [66, 118], [86, 96], [94, 44]], 30), { w: 2.1, seed: 85 });
  tsave(); ttr(69, 72); trot(-1.05); say('B', 'LEARNING CURVE', 0, 0, 3.8, { align: 'center', seed: 86 }); trest();
  person(32, 118, .95, { arms: 'wave' });
  // a backpack and sweat
  solid('Y', rectPts(26.5, 101, 4, 6.5, 1, 2), { wob: .2, seed: 87 });
  line('B', [38, 96, 39.5, 93.5], { w: .8, seed: 88 }); line('B', [40, 99, 42, 97.4], { w: .8, seed: 89 });
  para('B', 'EVEN WITH GOOD TUTORIALS, NEW RESEARCH FEELS STEEP.', 55, 131, 5.2, 92, 8.6, { align: 'center', seed: 90 });
  pageNo(3);
};

/* 4 — the author */
ZINE_PAGES[4] = () => {
  say('B', 'THE AUTHOR', 55, 11, 9, { align: 'center', seed: 101 });
  line('Y', bezPts([[12, 120], [60, 119], [80, 100], [96, 34]], 30), { w: 3.2, seed: 102 });
  const r = rng(103);
  for (let k = 0; k < 11; k++) {
    const y = 116 - k * 6.4, x = 44 + (r() - .5) * 4, w = 30 + (r() - .5) * 3, rot = (r() - .5) * .08;
    tsave(); ttr(x + w / 2, y + 2.6); trot(rot);
    knock(rectPts(-w / 2, -2.6, w, 5.2, .4, 3), { wob: 0 });
    outline('B', rectPts(-w / 2, -2.6, w, 5.2, .4, 3), { w: .7, wob: .15, seed: 104 + k });
    trest();
  }
  solid('P', rectPts(46, 41, 28, 5.2, .4, 3), { wob: .2, seed: 120 });
  outline('B', rectPts(46, 41, 28, 5.2, .4, 3), { w: .8, wob: .15, seed: 121 });
  person(60, 41, .85, { arms: 'wave' });
  line('B', [64, 26, 64, 34], { w: .8, seed: 122 });
  solid('P', polyPts(64, 26, 71, 28, 64, 30), { wob: .1, seed: 123 });
  tsave(); ttr(38, 92); trot(-Math.PI / 2); say('B', 'ARXIV', 0, 0, 4.6, { align: 'center', seed: 124 }); trest();
  para('B', 'WANTS ONE PAPER TO STAND OUT IN AN EXPONENTIAL PILE.', 55, 131, 5.2, 92, 8.6, { align: 'center', seed: 125 });
  pageNo(4);
};

/* 5 — zines */
ZINE_PAGES[5] = () => {
  say('P', 'ZINES!', 56.2, 13.2, 15, { align: 'center', w: 2.6, seed: 141 });
  say('B', 'ZINES!', 55, 12, 15, { align: 'center', w: 1.9, seed: 141 });
  // a stapler
  solid('Y', polyPts(20, 62, 74, 56, 80, 60, 26, 67), { wob: .3, seed: 142 });
  line('B', polyPts(18, 70, 80, 64, 82, 69, 20, 75, 18, 70), { w: 1, seed: 143 });
  line('B', polyPts(20, 62, 74, 56, 80, 60, 80, 64, 26, 67, 20, 66, 20, 62), { w: 1, seed: 144 });
  line('B', arcPts(80, 62, 3, 4, -90, 90), { w: .9, seed: 145 });
  line('P', [34, 69.6, 41, 69], { w: 1.2, seed: 146 });
  // three folded zines, fanned
  for (let k = 0; k < 3; k++) {
    tsave(); ttr(30 + k * 22, 98); trot(-.25 + k * .25);
    solid(k === 1 ? 'P' : 'Y', rectPts(-9, -12, 18, 24, .5, 3), { wob: .3, seed: 150 + k });
    outline('B', rectPts(-9, -12, 18, 24, .5, 3), { w: .8, seed: 153 + k });
    line('B', [-5, -6, 5, -6], { w: .6, seed: 156 + k });
    trest();
  }
  star(96, 82, 4, 'P', 160); star(12, 88, 3, 'B', 161, 4);
  let y = 120;
  for (const [s, sw] of [['SELF-PUBLISHED.', 0], ['SMALL PRINT RUNS.', 1], ['PUNK ROOTS.', 0]]) {
    const w = tw(s, 5.4); if (sw) swipe(55 - w / 2 - 1, y + .4, 55 + w / 2 + 1, y + 6.4, 162);
    say('B', s, 55, y, 5.4, { align: 'center', seed: 163 + y }); y += 9;
  }
  say('B', '(A LOT LIKE PREPRINTS.)', 55, y + 1, 4.2, { align: 'center', seed: 170 });
  pageNo(5);
};

/* 6 — how it works */
ZINE_PAGES[6] = () => {
  say('B', 'HOW IT WORKS', 55, 9, 7.6, { align: 'center', seed: 181 });
  const steps = [['PDF', ''], ['CONDENSE', 'CLAUDE'], ['PLAN', 'CLAUDE'], ['PICTURES', 'TEXT TO IMAGE'], ['ZINE!', '']];
  let y = 24;
  steps.forEach(([a, b], i) => {
    const h = b ? 17 : 12, w = i === 4 ? 46 : 60, x = 55 - w / 2;
    if (i % 2 === 1) tone('Y', rectPts(x, y, w, h, 2, 4), .6, { wob: .3, seed: 182 + i });
    if (i === 4) solid('P', rectPts(x, y, w, h, 2, 4), { wob: .3, seed: 187 });
    outline('B', rectPts(x, y, w, h, 2, 4), { w: .95, seed: 188 + i });
    say('B', a, 55, y + 2.4, 5.4, { align: 'center', seed: 193 + i });
    if (b) say('B', b, 55, y + 10, 3.4, { align: 'center', seed: 198 + i });
    if (i < 4) { line('B', [55, y + h + 1.2, 55, y + h + 6.6], { w: .9, seed: 203 + i }); arrowAt('B', 55, y + h + 7, Math.PI / 2, 2.6, .9, 207 + i); }
    y += h + 8.4;
  });
  // the summary also goes straight to the pictures (Fig. 2)
  line('P', bezPts([[85, 59], [100, 66], [100, 92], [86, 100]], 20), { w: 1.1, seed: 212 });
  arrowAt('P', 86, 100, 2.6, 3, 1, 213);
  para('B', 'AND YOU CAN STEER THE PLAN.', 55, 148, 4.4, 94, 7, { align: 'center', seed: 214 });
  pageNo(6);
};

/* 7 — equations into poems */
ZINE_PAGES[7] = () => {
  say('B', 'EQUATIONS', 55, 10, 8.6, { align: 'center', seed: 221 });
  say('B', 'INTO POEMS', 55, 21.5, 8.6, { align: 'center', seed: 222 });
  // the rendering equation, set by hand: Lo = Le + ∫ Li · f · cos θ dω
  const toks = [['L'], ['O', 1], ['='], ['L'], ['E', 1], ['+'], ['∫', 2], ['L'], ['I', 1], ['·'], ['F'], ['·'], ['COS'], [' '], ['θ'], [' '], ['D'], ['ω']];
  const S0 = 6.4, sz = t => t[1] === 1 ? S0 * .58 : t[1] === 2 ? S0 * 1.6 : S0;
  const wid = toks.reduce((a, t) => a + tw(t[0], sz(t)) + 1.2, 0);
  let x = 55 - wid / 2; const base = 44;
  tone('Y', rectPts(10, base - 7, 90, 18, 2, 4), .5, { wob: .5, seed: 223 });
  toks.forEach((t, i) => {
    const s = sz(t), y = t[1] === 1 ? base + S0 * .62 : t[1] === 2 ? base - S0 * .3 : base;
    say('B', t[0], x, y, s, { seed: 224 + i, w: Math.max(.7, s * .12) }); x += tw(t[0], s) + 1.2;
  });
  line('P', [55, 63, 55, 71], { w: 1.4, seed: 245 }); arrowAt('P', 55, 72, Math.PI / 2, 3.2, 1.3, 246);
  say('P', 'AN LLM WROTE:', 55, 76, 4.2, { align: 'center', seed: 247 });
  const poem = ['IN REALMS OF CODE', 'WHERE LIGHT DOES DANCE,', 'THE RENDERING EQUATION', 'TAKES ITS CHANCE,', 'RADIANCE, THE LIGHT', 'A POINT EMITS...'];
  poem.forEach((l, i) => say('B', l, 13, 88 + i * 8.6, 4.6, { seed: 248 + i }));
  line('B', [9, 87, 9, 139], { w: .9, seed: 255 });
  say('B', 'FROM FIG. 3 OF THE PAPER', 55, 150, 3.6, { align: 'center', seed: 256 });
  pageNo(7);
};

/* 8 — back cover */
ZINE_PAGES[8] = () => {
  say('B', 'MORE', 55, 16, 9, { align: 'center', seed: 271 });
  say('B', 'ENGAGING.', 55, 28, 9, { align: 'center', seed: 272 });
  say('B', 'MORE', 55, 46, 9, { align: 'center', seed: 273 });
  const w = tw('ACCESSIBLE.', 9); swipe(55 - w / 2 - 1.5, 58.6, 55 + w / 2 + 1.5, 68.8, 274);
  say('B', 'ACCESSIBLE.', 55, 58, 9, { align: 'center', seed: 275 });
  // a rosette
  solid('P', polyPts(48, 104, 44, 124, 50, 120, 53, 126, 55, 106), { wob: .3, seed: 276 });
  solid('P', polyPts(62, 104, 66, 124, 60, 120, 57, 126, 55, 106), { wob: .3, seed: 277 });
  const ros = []; for (let k = 0; k < 32; k++) { const a = k / 32 * TAU, r = k % 2 ? 13 : 15; ros.push(55 + Math.cos(a) * r, 94 + Math.sin(a) * r); }
  solid('Y', ros, { wob: .2, seed: 278 }); outline('B', ros, { w: .8, seed: 279 });
  say('B', 'PEOPLE\'S', 55, 89, 3.6, { align: 'center', seed: 280 });
  say('B', 'CHOICE', 55, 94.6, 3.6, { align: 'center', seed: 281 });
  say('B', 'HONORABLE MENTION', 55, 131, 4, { align: 'center', seed: 282 });
  line('B', [16, 141, 94, 141], { w: .6, seed: 283 });
  say('B', 'J. SHRIRAM & S. SREEKALA', 55, 146, 3.9, { align: 'center', seed: 284 });
  say('B', "UIST '23 · SAN FRANCISCO", 55, 154, 3.9, { align: 'center', seed: 285 });
};

/* ------------------------------------------- the paper that goes in (3 pp) */
const PAPER_W = 148, PAPER_H = 192;
function drawPaperStack() {
  for (const [dx, dy, s] of [[12, 10, 3], [6, 5, 2]]) {
    knock(rectPts(dx, dy, PAPER_W, PAPER_H, .5, 4), { wob: 0 });
    outline('B', rectPts(dx, dy, PAPER_W, PAPER_H, .5, 4), { w: .8, wob: .2, seed: 300 + s });
  }
  knock(rectPts(0, 0, PAPER_W, PAPER_H, .5, 4), { wob: 0 });
  outline('B', rectPts(0, 0, PAPER_W, PAPER_H, .5, 4), { w: .95, wob: .2, seed: 303 });
  ['ZINIFY: TRANSFORMING RESEARCH', 'PAPERS INTO ENGAGING ZINES WITH', 'LARGE LANGUAGE MODELS'].forEach((l, i) => say('B', l, PAPER_W / 2, 10 + i * 7.4, 4.6, { align: 'center', w: .82, seed: 304 + i, gj: .6 }));
  say('B', 'JAIDEV SHRIRAM*', 40, 36, 3.1, { align: 'center', w: .55, seed: 307, gj: .4 });
  say('B', 'SANJAYAN SREEKALA*', 108, 36, 3.1, { align: 'center', w: .55, seed: 308, gj: .4 });
  say('B', 'ABSTRACT', 10, 48, 3.1, { w: .6, seed: 309, gj: .4 });
  const r = rng(310);
  const col = (x0, y0, y1, w, s) => { for (let y = y0; y < y1; y += 4.1) line('B', [x0, y, x0 + w * (y + 4.1 > y1 ? .55 : .86 + r() * .14), y], { w: .42, wob: .08, seed: s + y }); };
  col(10, 55, 108, 60, 311); col(10, 118, 182, 60, 312);
  say('B', '1 INTRODUCTION', 10, 111, 2.8, { w: .55, seed: 313, gj: .3 });
  // Figure 1: papers become a zine
  outline('B', rectPts(80, 48, 58, 40, 1, 4), { w: .55, wob: .1, seed: 314 });
  for (let k = 0; k < 3; k++) outline('B', rectPts(84 + k * 4, 54 + k * 3, 12, 16, .3, 2), { w: .5, wob: .1, seed: 315 + k });
  arrowAt('B', 112, 66, 0, 3, .6, 318); line('B', [104, 66, 112, 66], { w: .6, seed: 319 });
  tone('P', rectPts(116, 56, 9, 20, .3, 2), .7, { wob: .1, seed: 320 }); tone('Y', rectPts(125, 57, 9, 19, .3, 2), .8, { wob: .1, seed: 321 });
  col(80, 94, 182, 58, 322);
  say('B', "UIST '23", PAPER_W / 2, PAPER_H - 6, 2.6, { align: 'center', w: .5, seed: 323, gj: .3 });
}
