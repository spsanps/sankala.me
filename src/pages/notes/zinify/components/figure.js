/*
 * figure.js — ZINify at the copy center.
 *
 * The whole figure is a photocopied flyer on blue copy paper: the copier itself is printed
 * on it in toner. Real paper moves on top: the ZINify paper gets cut down, pasted up, given
 * pictures, copied, folded and stapled into a zine the reader can flip. Then the zine can be
 * copied again — and again — and you watch it degrade, the way every zine does.
 *
 * Steps follow the paper's pipeline (Fig. 2): an LLM condenses the paper and picks figures,
 * an LLM plans the zine, a text-to-image model makes pictures, and the pieces are assembled.
 * The copier, scissors, staples and fold are this page's; ZINify's output is a PDF.
 */
import { copy, sheet, makeCanvas } from './toner.js';
import * as M from './masters.js';
import { TYPE, MARKER } from './paste.js';
import { figParams } from '../../../../components/art/essay-fonts.js';

const FLYER = '#88c3e6', WHITE = '#f6f5f0', INK = '#151413';
// Review hooks: ?fig-t=seconds into the run, &fig-page=, &fig-gen=, &fig-unfold=1, &fig-idle=1
const params = figParams();
const FROZEN = params.has('t') ? parseFloat(params.get('t')) : null;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const LAYOUTS = {
  wide: {
    W: 1000, H: 600, tall: false,
    copier: { x: -12, y: 70, s: 0.95 },
    tags: { x: 540, y: 22, w: 102, h: 30, gap: 10 },
    paperIdle: { x: 742, y: 214, r: -0.08, s: 1 }, paperCut: { x: 618, y: 96, r: 0, s: 1 },
    pile: { x: 872, y: 104 }, board: { x: 548, y: 352, s: 1 }, bands: { x: 866, y: 352 },
    fold: { x: 620, y: 330 }, read: { spine: 500, y: 128, pw: 232 }, stapler: { x: 820, y: 470 },
    props: { x: 394, y: 474, s: 0.68 },
  },
  tall: {
    W: 400, H: 800, tall: true,
    copier: { x: 6, y: 4, s: 0.66 },
    tags: { x: 12, y: 362, w: 88, h: 26, gap: 6 },
    paperIdle: { x: 118, y: 426, r: -0.06, s: 0.9 }, paperCut: { x: 40, y: 414, r: 0, s: 0.9 },
    pile: { x: 296, y: 430 }, board: { x: 50, y: 572, s: 1 }, bands: { x: 284, y: 480 },
    fold: { x: 96, y: 480 }, read: { x: 70, y: 400, pw: 260 }, stapler: { x: 236, y: 470 },
    props: { x: 150, y: 700, s: 0.85 },
  },
};

// Times in seconds from pressing "Make the zine".
const T = { cut: 0, plan: 3.2, pics: 6.0, copy: 8.6, read: 14.5 };
const STATUS = [
  'Paper in. Drag the ZINify paper onto the copier glass, or press “Make the zine”.',
  '1 · Cut it down. An LLM (Claude, in the paper) condenses the paper into short sections and picks the figures worth keeping.',
  '2 · Plan it. Claude plans the zine page by page, and you can steer it. A dense equation can come back as a poem.',
  '3 · Picture it. The plan writes prompts for a text-to-image model (the paper names DeepFloyd IF). Figures skip straight ahead.',
  '4 · Copy it. Everything is assembled into one zine. ZINify makes a multi-page PDF; the copier, fold and staples are ours.',
];
const SCRAPS = ['ZINIFY!', 'walled garden', 'steep climb', 'exponential pile', 'not unlike preprints', 'steer the plan', 'L = Le + ∫ Li f cos θ dω', 'more accessible'];
const PICS = ['cover', 'garden', 'reader', 'author', 'zines', 'pipeline', 'poem', 'award'];
// saddle-stitched 8 pages from two sheets: [left, right] page numbers per face
const FACES = [[8, 1], [2, 7], [6, 3], [4, 5]];
const FACE_NAMES = ['sheet 1, outside', 'sheet 1, inside', 'sheet 2, outside', 'sheet 2, inside'];

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, k) => a + (b - a) * k;
const back = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

// Mounts the copy-center figure into `root` (the <figure>) and returns a cleanup function.
export function mount(root) {
  const ac = new AbortController(), on = (target, type, fn, opts) => target.addEventListener(type, fn, { ...opts, signal: ac.signal });
  let disposed = false;
  const sheetEl = root.querySelector('.sheet'), canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d');
  const ui = {
    make: root.querySelector('#b-make'), skip: root.querySelector('#b-skip'), prev: root.querySelector('#b-prev'), next: root.querySelector('#b-next'),
    again: root.querySelector('#b-copy'), unfold: root.querySelector('#b-unfold'), reset: root.querySelector('#b-reset'), status: root.querySelector('#zstatus'),
  };
  const st = {
    // K stays 0 until the first resize, so that resize always runs (even when the figure is exactly 1000 px wide)
    L: LAYOUTS.wide, K: 0, cssW: 0, dpr: 1, sprites: new Map(), gen: 1,
    mode: 'idle', t0: 0, now: 0, page: 0, turn: null, unfold: false, drag: null, dragPos: null,
    copyFlash: -10, visible: true, raf: 0, lastStatus: '',
  };

  /* ---------------------------------------------------------------- sprites ---------- */
  const px = (s) => st.K * s;
  function toner(key, wDU, hDU, s, draw, o = {}) {
    if (st.sprites.has(key)) return st.sprites.get(key);
    const p = px(s), m = M.master(wDU, hDU, p, draw, { white: o.paper ? true : o.white !== false && !o.clear });
    const t = copy(m, { px: p, gen: o.gen || 1, seed: o.seed || 1, screen: (o.screen || 2.4) / s, streaks: o.streaks });
    const out = o.paper ? sheet(t, o.paper, { px: p, seed: o.seed }) : t;
    st.sprites.set(key, out);
    return out;
  }
  const L = () => st.L;
  const copierSprite = (lid) => toner('copier' + lid, M.COPIER.w, M.COPIER.h, L().copier.s, (g) => M.drawCopier(g, lid), { clear: true, seed: 3, streaks: true });
  const paperSprite = () => toner('paper', M.PAPER.w, M.PAPER.h, L().paperCut.s, M.drawPaper, { paper: WHITE, seed: 9 });
  const bladeSprite = (side) => toner('blade' + side, M.SCISSORS.w, M.SCISSORS.h, 1, (g) => M.drawBlade(g, side), { clear: true, seed: 5 + side });
  const staplerSprite = (open) => toner('stapler' + open, M.STAPLER.w, M.STAPLER.h, 0.8, (g, w, h) => M.drawStapler(g, w, h, open), { clear: true, seed: 17 });
  const boardSprite = () => toner('board', M.BOARD.w, M.BOARD.h, L().board.s, M.drawBoard, { paper: WHITE, seed: 21 });
  const scrapSprite = (i) => toner('scrap' + i, 62, 24, 1, (g, w, h) => {
    g.fillStyle = '#000'; g.font = `400 ${SCRAPS[i].length > 16 ? 6.4 : 8}px ${TYPE}`; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(SCRAPS[i], w / 2, h / 2 + 0.5);
  }, { paper: WHITE, seed: 30 + i });
  const poemSprite = () => toner('poemscrap', 62, 24, 1, (g) => {
    g.fillStyle = '#000'; g.font = `400 5.4px ${TYPE}`; g.textAlign = 'left';
    ['In realms of code where', 'light does dance, the', 'rendering equation…'].forEach((l, i) => g.fillText(l, 4, 7 + i * 6.4));
  }, { paper: WHITE, seed: 39 });
  const slipSprite = (i) => toner('slip' + i, M.SLIP.w, M.SLIP.h, 1, (g, w, h) => M.drawPromptSlip(g, w, h, i), { paper: WHITE, seed: 40 + i });
  const thumbSprite = (i) => toner('thumb' + i, 62, 54, 1, (g, w, h) => M.PICTURES[PICS[i]](g, 3, 3, w - 6, h - 6), { paper: WHITE, seed: 50 + i });
  const tagSprite = (i) => toner('tag' + i, L().tags.w, L().tags.h, 1, (g, w, h) => M.drawStepTag(g, w, h, i), { paper: WHITE, seed: 60 + i });
  const pageScale = () => (L().tall ? L().read.pw : L().read.pw) / M.PAGE.w;
  // Page n at copy generation gen. Generation 1 is copied from the paste-up; every later
  // generation is a real copy of the previous one (text mode, skewed a little on the glass),
  // so the dots clump, lines thicken, specks pile up and the drum streaks accumulate.
  function pageSprite(n, gen = st.gen) {
    const key = `page${n}g${gen}`;
    if (st.sprites.has(key)) return st.sprites.get(key);
    let out;
    if (gen <= 1) out = toner(key, M.PAGE.w, M.PAGE.h, pageScale(), M.PAGES[n - 1], { paper: WHITE, gen: 1, seed: 70 + n * 7 });
    else {
      const prev = pageSprite(n, gen - 1), w = prev.width, h = prev.height, onGlass = makeCanvas(w, h), g = onGlass.getContext('2d');
      const r = (k) => Math.sin(n * 12.9898 + gen * 78.233 + k) * 0.5;
      g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
      g.translate(w / 2 + r(1) * 4 * st.K, h / 2 + r(2) * 4 * st.K); g.rotate(r(3) * 0.016); g.scale(1.006, 1.006);
      g.drawImage(prev, -w / 2, -h / 2);
      const p = px(pageScale());
      out = sheet(copy(onGlass, { px: p, gen: 1, seed: 70 + n * 7 + gen * 31, mode: 'text', darken: 0.012 * gen, wear: gen, streaks: true }), WHITE, { px: p, seed: gen });
      st.sprites.set(key, out);
    }
    return out;
  }
  function flyer() {
    if (st.sprites.has('flyer')) return st.sprites.get('flyer');
    const { W, H } = L(), p = st.K;
    const m = M.master(W, H, p, (g, w, h) => {
      // the dark, ragged border a copier leaves when the original sits on the glass
      g.fillStyle = '#000'; const e = 5, j = () => Math.random() * 2.2;
      g.beginPath(); g.rect(0, 0, w, h);
      g.moveTo(e + j(), e + j());
      for (let x = e; x < w - e; x += 14) g.lineTo(x, e + j());
      for (let y = e; y < h - e; y += 14) g.lineTo(w - e - j(), y);
      for (let x = w - e; x > e; x -= 14) g.lineTo(x, h - e - j());
      for (let y = h - e; y > e; y -= 14) g.lineTo(e + j(), y);
      g.closePath(); g.fill('evenodd');
      g.font = `400 11px ${TYPE}`; g.fillStyle = '#000'; g.textAlign = 'right'; g.fillText('ZINIFY COPY CENTER · open late · bring your PDF', w - 16, h - 16);
      const pr = L().props; if (pr) M.drawCounterProps(g, pr.x, pr.y, pr.s);
    });
    const out = sheet(copy(m, { px: p, seed: 2, screen: 2.4, streaks: true }), FLYER, { px: p, seed: 4 });
    st.sprites.set('flyer', out);
    return out;
  }

  // Pre-build sprites in small slices so the first frames stay smooth.
  let queue = [];
  function warm(fns) { queue.push(...fns); pump(); }
  function pump() {
    if (disposed || !queue.length) return;
    const t0 = performance.now();
    while (queue.length && performance.now() - t0 < 18) queue.shift()();
    if (queue.length) setTimeout(pump, 16);
  }

  /* ---------------------------------------------------------------- layout ----------- */
  function resize() {
    const cssW = sheetEl.clientWidth, tall = cssW < 600, Lx = tall ? LAYOUTS.tall : LAYOUTS.wide;
    const dpr = Math.min(2, window.devicePixelRatio || 1), K = (cssW / Lx.W) * dpr;
    if (Math.abs(K - st.K) < 0.001 && Lx === st.L && canvas.width) return;
    st.L = Lx; st.K = K; st.dpr = dpr; st.cssW = cssW;
    canvas.width = Math.round(Lx.W * K); canvas.height = Math.round(Lx.H * K);
    canvas.style.aspectRatio = `${Lx.W} / ${Lx.H}`;
    st.sprites.clear(); queue = [];
    layoutHits();
  }

  /* ---------------------------------------------------------------- drawing helpers -- */
  function place(spr, x, y, s, r = 0, o = {}) {
    // spr was built at K*s device px per DU; draw it at DU position (x, y), rotated about its centre
    const w = spr.width / st.K, h = spr.height / st.K;
    ctx.save(); ctx.translate((x + w / 2) * st.K, (y + h / 2) * st.K); ctx.rotate(r);
    if (o.sx !== undefined || o.sy !== undefined) ctx.scale(o.sx ?? 1, o.sy ?? 1);
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    if (o.shadow) { ctx.shadowColor = 'rgba(20,30,40,0.32)'; ctx.shadowBlur = 7 * st.dpr; ctx.shadowOffsetX = 1.5 * st.dpr; ctx.shadowOffsetY = 3 * st.dpr; }
    ctx.drawImage(spr, (-w / 2) * st.K, (-h / 2) * st.K);
    ctx.restore();
  }
  // draw a sub-rectangle (in DU of the sprite) of a sprite at (x, y)
  function placeCrop(spr, cx, cy, cw, ch, x, y, r = 0, o = {}) {
    ctx.save(); ctx.translate((x + cw / 2) * st.K, (y + ch / 2) * st.K); ctx.rotate(r);
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    if (o.shadow) { ctx.shadowColor = 'rgba(20,30,40,0.3)'; ctx.shadowBlur = 6 * st.dpr; ctx.shadowOffsetY = 2.5 * st.dpr; }
    ctx.drawImage(spr, cx * st.K, cy * st.K, cw * st.K, ch * st.K, (-cw / 2) * st.K, (-ch / 2) * st.K, cw * st.K, ch * st.K);
    ctx.restore();
  }
  function markerText(text, x, y, size, rot = 0, align = 'left', color = INK) {
    ctx.save(); ctx.translate(x * st.K, y * st.K); ctx.rotate(rot); ctx.font = `400 ${size * st.K}px ${MARKER}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, 0, 0); ctx.restore();
  }
  function markerArrow(x0, y0, x1, y1, bend = 0.2, width = 2.6) {
    const K = st.K, mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = width * K; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([9 * K, 7 * K]);
    ctx.beginPath(); ctx.moveTo(x0 * K, y0 * K); ctx.quadraticCurveTo(mx * K, my * K, x1 * K, y1 * K); ctx.stroke();
    ctx.setLineDash([]);
    const a = Math.atan2(y1 - my, x1 - mx), L2 = width * 5;
    ctx.beginPath(); ctx.moveTo((x1 - Math.cos(a - 0.5) * L2) * K, (y1 - Math.sin(a - 0.5) * L2) * K); ctx.lineTo(x1 * K, y1 * K); ctx.lineTo((x1 - Math.cos(a + 0.5) * L2) * K, (y1 - Math.sin(a + 0.5) * L2) * K); ctx.stroke();
    ctx.restore();
  }
  function markerRing(cx, cy, rx, ry, k = 1, width = 2.6) {
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = width * st.K; ctx.lineCap = 'round'; ctx.beginPath();
    const a0 = -2.2, n = 40;
    for (let i = 0; i <= n * k * 1.1; i++) { const a = a0 + (i / n) * Math.PI * 2, kk = 1 + (i / n) * 0.07; const x = (cx + Math.cos(a) * rx * kk) * st.K, y = (cy + Math.sin(a) * ry * kk) * st.K; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
  // copier-local point (in COPIER DU) → scene DU
  const cp = ([x, y]) => [L().copier.x + x * L().copier.s, L().copier.y + y * L().copier.s];

  /* ---------------------------------------------------------------- the scene -------- */
  function drawScene(t) {
    const Lx = L(), running = st.mode !== 'idle';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(flyer(), 0, 0);

    // the copier: lid opens for the original, closes to copy
    const lidT = !running ? 0 : seg(t, T.copy + 0.8, T.copy + 1.2) * (1 - seg(t, T.copy + 3.6, T.copy + 4.0));
    const lid = lidT < 0.25 ? 0 : lidT < 0.75 ? 0.5 : 1;
    place(copierSprite(lid), Lx.copier.x, Lx.copier.y, Lx.copier.s);

    if (st.mode === 'read') return;
    // step tags along the table, the current one ringed in marker
    const step = !running ? -1 : t < T.plan ? 0 : t < T.pics ? 1 : t < T.copy ? 2 : t < T.read ? 3 : 4;
    for (let i = 0; i < 4; i++) {
      const x = Lx.tags.x + i * (Lx.tags.w + Lx.tags.gap), y = Lx.tags.y + (i % 2 ? 2 : 0);
      place(tagSprite(i), x, y, 1, (i % 2 ? 1 : -1) * 0.025, { shadow: true, alpha: step === 4 ? 0.9 : 1 });
      if (i === step) markerRing(x + Lx.tags.w / 2, y + Lx.tags.h / 2, Lx.tags.w * 0.6, Lx.tags.h * 0.95, seg(t, [T.cut, T.plan, T.pics, T.copy][i], [T.cut, T.plan, T.pics, T.copy][i] + 0.5));
      if (i < 3) markerText('→', x + Lx.tags.w + Lx.tags.gap * 0.08, y + Lx.tags.h * 0.72, Lx.tall ? 9 : 12);
    }

    if (!running) return drawIdle(t);
    drawPlan(t); drawCut(t); drawCopy(t);
  }

  function drawIdle(t) {
    const Lx = L(), p = st.dragPos || Lx.paperIdle, bob = reduceMotion.matches || FROZEN !== null ? 0 : Math.sin(t * 2) * 1.2;
    place(paperSprite(), p.x, p.y + bob, Lx.paperIdle.s, st.dragPos ? 0.02 : Lx.paperIdle.r, { shadow: true });
    if (!st.dragPos) {
      const tip = cp(M.deck(0.42, 0.55)), sx = p.x - 8, sy = p.y + 20;
      markerArrow(sx, sy, tip[0] + 18, tip[1] - 6, Lx.tall ? -0.25 : 0.22, Lx.tall ? 2.2 : 2.8);
      if (Lx.tall) markerText('copy me!', p.x + 60, p.y - 12, 15, -0.08);
      else { markerText('copy me!', p.x - 20, p.y - 16, 20, -0.06); markerText('(drag me onto the glass)', p.x - 34, p.y + M.PAPER.h * Lx.paperIdle.s + 26, 12, -0.04); }
    }
  }

  // Phase 1: the paper is cut into bands, the figure is cut out, the bands are trimmed.
  function bandState(i, t) {
    const Lx = L(), s = Lx.paperCut.s, [y0, y1] = M.CUTS[i];
    const split = seg(t, 0.6 + i * 0.32, 0.6 + i * 0.32 + 0.2);
    const trim = ease(seg(t, 2.6 + i * 0.08, 3.1 + i * 0.08));
    const leave = ease(seg(t, T.plan + 0.1 + i * 0.12, T.plan + 0.55 + i * 0.12));
    let x = Lx.paperCut.x + 0, y = Lx.paperCut.y + y0 * s + split * i * 5;
    // bands drift to a little stack beside the board, then their words get pasted
    const sx = Lx.bands.x + i * 3, sy = Lx.bands.y + i * 16;
    x = lerp(x, sx, leave); y = lerp(y, sy, leave);
    return { x, y, y0, y1, w: lerp(M.PAPER.w, M.PAPER.w * 0.56, trim) * s, r: split * (i % 2 ? 0.02 : -0.018) + leave * (i % 2 ? 0.08 : -0.06), alpha: 1 - seg(t, T.plan + 1.6, T.plan + 2.4) };
  }

  function drawCut(t) {
    const Lx = L(), s = Lx.paperCut.s, paper = paperSprite();
    if (t >= T.plan + 2.4) { drawPile(t); return; }
    // before the first snip, the whole sheet travels from its spot to the cutting position
    const arrive = ease(seg(t, 0, 0.6));
    if (t < 0.6) {
      const a = st.startFrom || Lx.paperIdle, b = Lx.paperCut;
      place(paper, lerp(a.x, b.x, arrive), lerp(a.y, b.y, arrive), s, lerp(a.r, 0, arrive), { shadow: true });
      return;
    }
    // the figure box: cut out, then sent to the pile (it skips the plan)
    const [fx, fy, fw, fh] = M.FIGBOX, out = ease(seg(t, 2.0, 2.6));
    for (let i = 0; i < M.CUTS.length; i++) {
      const b = bandState(i, t);
      if (b.alpha <= 0) continue;
      // the bottom bands have the figure cut out of them: draw the band, then knock out the box
      ctx.save();
      if (out > 0 && (i === 2 || i === 3)) {
        ctx.beginPath(); ctx.rect(0, 0, canvas.width, canvas.height);
        const bx = (b.x + fx * s) * st.K, by = (b.y + (fy - b.y0) * s) * st.K;
        ctx.rect(bx + fw * s * st.K, by, -fw * s * st.K, (fh) * s * st.K);
        ctx.clip('evenodd');
      }
      placeCrop(paper, 0, b.y0 * s, b.w, (b.y1 - b.y0) * s, b.x, b.y, b.r, { shadow: true, alpha: b.alpha });
      ctx.restore();
      // the trimmed-off part falls away and fades
      const trim = seg(t, 2.6 + i * 0.08, 3.1 + i * 0.08);
      if (trim > 0 && trim < 1) placeCrop(paper, b.w, b.y0 * s, M.PAPER.w * s - b.w, (b.y1 - b.y0) * s, b.x + b.w + trim * 10, b.y + trim * trim * 60, 0.2 * trim, { alpha: 1 - trim });
    }
    drawPile(t);
    // scissors travel along each cut, snipping
    const cutT = seg(t, 0.6, 2.2);
    if (cutT > 0 && cutT < 1) {
      const lines = [...M.CUTS.slice(1).map((c) => c[0]), 'fig'], k = cutT * lines.length, li = Math.min(lines.length - 1, Math.floor(k)), f = k - li;
      let x, y, r = 0;
      if (lines[li] === 'fig') { x = Lx.paperCut.x + (fx + fw * f) * s; y = Lx.paperCut.y + (fy + fh * 0.5) * s + Math.sin(f * 6.28) * fh * 0.4 * s; r = Math.cos(f * 6.28) * 0.8; }
      else { x = Lx.paperCut.x + (-10 + f * (M.PAPER.w + 20)) * s; y = Lx.paperCut.y + lines[li] * s + li * 5; }
      drawScissors(x - 44, y - 30, r, Math.abs(Math.sin(t * 17)));
    }
  }

  function drawPile(t) {
    const Lx = L(), s = Lx.paperCut.s, [fx, fy, fw, fh] = M.FIGBOX;
    const out = ease(seg(t, 2.0, 2.6)), into = ease(seg(t, T.pics + 2.0, T.pics + 2.5));
    if (out <= 0 || t > T.copy) return;
    const from = [Lx.paperCut.x + fx * s, Lx.paperCut.y + fy * s + 10], pile = [Lx.pile.x, Lx.pile.y];
    const b = boxXY(5, 0, 26);
    const x = lerp(lerp(from[0], pile[0], out), b[0], into), y = lerp(lerp(from[1], pile[1], out), b[1], into) - Math.sin(out * Math.PI) * 30;
    const sc = lerp(1, 0.62, into);
    ctx.save(); ctx.translate(x * st.K, y * st.K); ctx.scale(sc, sc); ctx.translate(-x * st.K, -y * st.K);
    placeCrop(paperSprite(), fx * s, fy * s, fw * s, fh * s, x, y, 0.06 * (1 - into), { shadow: true });
    ctx.restore();
    if (into < 0.1) { markerText('figures', pile[0] + 6, pile[1] - 8, L().tall ? 11 : 14, -0.05); if (!L().tall) markerText('(they skip ahead)', pile[0] - 6, pile[1] + fh * s + 18, 10, -0.03); }
  }

  function drawScissors(x, y, r, open) {
    const a = 0.08 + open * 0.32;
    for (const side of [1, -1]) {
      ctx.save(); ctx.translate((x + 44) * st.K, (y + 30) * st.K); ctx.rotate(r - side * a); ctx.translate(-(x + 44) * st.K, -(y + 30) * st.K);
      place(bladeSprite(side), x, y, 1, 0); ctx.restore();
    }
  }

  // board-box position for slot i, offset (dx, dy) inside the box
  function boxXY(i, dx = 0, dy = 0) { const b = M.BOX(i), Lx = L(); return [Lx.board.x + (b.x + dx) * Lx.board.s, Lx.board.y + (b.y + dy) * Lx.board.s]; }

  // Phases 2 and 3: the paste-up fills with words, prompts and pictures.
  function boardPos(t) {
    const Lx = L(), inn = back(seg(t, T.plan, T.plan + 0.45));
    const toGlass = ease(seg(t, T.copy, T.copy + 0.8));
    const g = cp(M.deck((M.GLASS.u0 + M.GLASS.u1) / 2, (M.GLASS.v0 + M.GLASS.v1) / 2));
    const x = lerp(Lx.board.x, g[0] - M.BOARD.w * 0.3 / 2, toGlass), y = lerp(Lx.board.y + (1 - inn) * 260, g[1] - M.BOARD.h * 0.22 / 2, toGlass);
    return { x, y, s: lerp(1, 0.3, toGlass), flip: 1 - 2 * seg(t, T.copy + 0.1, T.copy + 0.5), alpha: 1 - seg(t, T.copy + 0.6, T.copy + 0.85) };
  }
  function drawPlan(t) {
    if (t < T.plan || t > T.copy + 0.9) return;
    const Lx = L(), bp = boardPos(t), board = boardSprite();
    ctx.save();
    // board (and everything on it) scales and flips face-down as it goes onto the glass
    ctx.translate((bp.x + M.BOARD.w * bp.s / 2) * st.K, (bp.y + M.BOARD.h * bp.s / 2) * st.K);
    ctx.scale(bp.s, bp.s * Math.max(0.02, Math.abs(bp.flip)));
    ctx.translate(-(Lx.board.x + M.BOARD.w / 2) * st.K, -(Lx.board.y + M.BOARD.h / 2) * st.K);
    ctx.globalAlpha = bp.alpha;
    if (bp.flip < 0) {
      // face-down: we see the back of the paste-up
      ctx.fillStyle = WHITE; ctx.fillRect(Lx.board.x * st.K, Lx.board.y * st.K, M.BOARD.w * st.K, M.BOARD.h * st.K);
    } else {
      place(board, Lx.board.x, Lx.board.y, 1, 0, { shadow: bp.s > 0.9 });
      for (let i = 0; i < 8; i++) {
        // words: a scrap flies in from the band stack and lands in its box
        const k = seg(t, T.plan + 0.45 + i * 0.22, T.plan + 0.85 + i * 0.22);
        if (k > 0) {
          const [bx, by] = boxXY(i, 0, 2), from = [Lx.bands.x + 20, Lx.bands.y + 20];
          const x = lerp(from[0], bx, easeOut(k)), y = lerp(from[1], by, easeOut(k)) - Math.sin(k * Math.PI) * 40, r = (1 - k) * 0.5 + (i % 2 ? 0.03 : -0.03);
          let spr = scrapSprite(i), sx = 1;
          if (i === 6) { const f = seg(t, T.plan + 2.0, T.plan + 2.4); sx = Math.cos(f * Math.PI); if (f > 0.5) spr = poemSprite(); }
          place(spr, x, y, 1, r, { shadow: k < 1, sx: Math.abs(sx) < 0.02 ? 0.02 : Math.abs(sx) });
        }
        // pictures: a prompt slip lands, then flips over into a picture
        const ps = seg(t, T.pics + i * 0.12, T.pics + 0.35 + i * 0.12), flip = seg(t, T.pics + 1.2 + i * 0.12, T.pics + 1.5 + i * 0.12);
        if (ps > 0) {
          const [bx, by] = boxXY(i, 2, 28), y = by - (1 - easeOut(ps)) * 30;
          if (flip < 0.5) place(slipSprite(i), bx, y, 1, (i % 2 ? 0.04 : -0.04), { alpha: easeOut(ps), sx: Math.max(0.02, Math.cos(flip * Math.PI)) });
          else place(thumbSprite(i), bx - 2, by - 2, 1, 0, { sx: Math.max(0.02, -Math.cos(flip * Math.PI)) });
        }
      }
      // the planner's marks
      if (t > T.plan + 2.4 && t < T.copy) {
        const k = seg(t, T.plan + 2.4, T.plan + 2.8);
        if (k > 0.3) markerText('equation → poem!', Lx.board.x + M.BOARD.w * 0.42, Lx.board.y - 8, Lx.tall ? 11 : 13, -0.04);
      }
    }
    ctx.restore();
  }

  // Phase 4: copy, eject, fold, staple.
  function drawCopy(t) {
    if (t < T.copy) return;
    const Lx = L();
    // the copy light, leaking out along the lid's front edge as it sweeps
    for (const [a, b] of [[T.copy + 1.3, T.copy + 2.2], [T.copy + 2.3, T.copy + 3.2]]) {
      const k = seg(t, a, b); if (k <= 0 || k >= 1) continue;
      drawScanLight(lerp(M.GLASS.u0, M.GLASS.u1, k));
    }
    if (t > T.copy + 1.3 && t < T.copy + 3.3) {
      const k = (t - T.copy - 1.3) / 0.5, c = cp(M.deck(0.62, 1));
      const word = ['ka-CHUNK', 'WHIRR…', 'ka-CHUNK', 'WHIRR…'][Math.min(3, Math.floor(k))];
      markerText(word, c[0] + 10, c[1] - (Lx.tall ? 34 : 50), Lx.tall ? 16 : 24, -0.08);
    }
    // two sheets slide out of the slot and settle in the tray, lying on its tilted plane
    const c = Lx.copier, TR = M.TRAY, K = st.K;
    const o = cp([TR.x + 4, TR.y - 12]), U = [104 * c.s, 18 * c.s], V = [30 * c.s, -23 * c.s];
    const slotX = cp([TR.x + 3, TR.y])[0];
    for (let s = 0; s < 2; s++) {
      const e = ease(seg(t, T.copy + 2.2 + s * 0.8, T.copy + 2.9 + s * 0.8)), go = ease(seg(t, T.copy + 3.9, T.copy + 4.4));
      if (e <= 0 || t > T.read - 0.05) continue;
      const face = faceSprite(s * 2, 0.25);
      if (go <= 0) {
        const along = lerp(-0.98, 0.02 + s * 0.03, e), up = 0.1 + s * 0.06;
        ctx.save(); ctx.beginPath(); ctx.rect(slotX * K, 0, canvas.width, canvas.height); ctx.clip();
        ctx.shadowColor = 'rgba(20,30,40,0.3)'; ctx.shadowBlur = 5 * st.dpr; ctx.shadowOffsetY = 2 * st.dpr;
        const ox = o[0] + U[0] * along + V[0] * up, oy = o[1] + U[1] * along + V[1] * up;
        // map the face (width → U, height → V, flipped so its top edge is at the back)
        ctx.setTransform(U[0] / face.width * K * 0.98, U[1] / face.width * K * 0.98, -V[0] / face.height * K * 0.8, -V[1] / face.height * K * 0.8, (ox + V[0] * 0.8) * K, (oy + V[1] * 0.8) * K);
        ctx.drawImage(face, 0, 0);
        ctx.restore();
      } else {
        const from = [o[0] + U[0] * 0.1, o[1] + V[1] * 0.9];
        drawFolding(t, lerp(from[0], Lx.fold.x, go), lerp(from[1], Lx.fold.y, go), s);
      }
    }
    drawStaple(t);
  }

  function drawScanLight(u) {
    // the lid is down, so the light only shows where it leaks out of the seams
    const a = cp(M.deck(u, 0.0)), K = st.K;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(a[0] * K, a[1] * K, 0, a[0] * K, a[1] * K, 90 * K);
    g.addColorStop(0, 'rgba(214,255,222,0.95)'); g.addColorStop(0.25, 'rgba(190,255,205,0.45)'); g.addColorStop(1, 'rgba(190,255,205,0)');
    ctx.fillStyle = g; ctx.fillRect((a[0] - 90) * K, (a[1] - 70) * K, 180 * K, 160 * K);
    ctx.strokeStyle = 'rgba(235,255,238,1)'; ctx.lineWidth = 3 * K; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo((a[0] - 34) * K, a[1] * K); ctx.lineTo((a[0] + 34) * K, a[1] * K); ctx.stroke();
    // and down the side seam a little
    const s0 = cp(M.deck(M.GLASS.u1 + 0.03, 0.1 + u * 0.8));
    ctx.fillStyle = 'rgba(200,255,214,0.35)'; ctx.beginPath(); ctx.arc(s0[0] * K, s0[1] * K, 16 * K, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // one face of a printed sheet: two pages side by side
  function faceSprite(f, scale) {
    const key = `face${f}s${scale}g${st.gen}`;
    if (st.sprites.has(key)) return st.sprites.get(key);
    const pw = M.PAGE.w * scale, ph = M.PAGE.h * scale, c = makeCanvas(pw * 2 * st.K, ph * st.K), g = c.getContext('2d');
    FACES[f].forEach((n, k) => g.drawImage(pageSprite(n), k * pw * st.K, 0, pw * st.K, ph * st.K));
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.setLineDash([3 * st.K, 3 * st.K]); g.lineWidth = st.K * 0.8; g.beginPath(); g.moveTo(pw * st.K, 0); g.lineTo(pw * st.K, ph * st.K); g.stroke();
    st.sprites.set(key, c);
    return c;
  }

  function drawFolding(t, x, y, s) {
    // the stack folds in half along the spine, then the stapler bites
    const k = ease(seg(t, T.copy + 4.4, T.copy + 4.9)), scale = 0.25 + 0.2 * ease(seg(t, T.copy + 3.9, T.copy + 4.4));
    const pw = M.PAGE.w * scale, ph = M.PAGE.h * scale;
    if (s === 1 && k <= 0) return place(faceSprite(2, 0.25), x, y, 0.25, 0, { shadow: true, sx: scale / 0.25, sy: scale / 0.25 });
    if (s === 1) return;
    const face = faceSprite(0, 0.25);
    ctx.save(); ctx.translate(x * st.K, y * st.K); ctx.scale(scale / 0.25, scale / 0.25); ctx.translate(-x * st.K, -y * st.K);
    ctx.shadowColor = 'rgba(20,30,40,0.3)'; ctx.shadowBlur = 6 * st.dpr; ctx.shadowOffsetY = 3 * st.dpr;
    const W2 = M.PAGE.w * 0.25 * st.K, H = M.PAGE.h * 0.25 * st.K;
    // right half (page 1, the cover) stays; left half folds over behind it
    ctx.drawImage(face, W2, 0, W2, H, (x + M.PAGE.w * 0.25) * st.K, y * st.K, W2, H);
    const c = Math.cos(k * Math.PI);
    if (c > 0) ctx.drawImage(face, 0, 0, W2, H, (x + M.PAGE.w * 0.25) * st.K - W2 * c, y * st.K, W2 * c, H);
    ctx.restore();
    void pw; void ph;
  }

  function drawStaple(t) {
    const Lx = L(), k = seg(t, T.copy + 4.95, T.copy + 5.6); if (k <= 0 || t > T.read) return;
    const bite = k > 0.4 && k < 0.7 ? 1 : 0, spine = Lx.fold.x + M.PAGE.w * 0.45, midY = Lx.fold.y + M.PAGE.h * 0.45 / 2;
    const sw = M.STAPLER.w * 0.8, alpha = Math.min(1, k * 4) * (1 - seg(t, T.read - 0.4, T.read - 0.1));
    place(staplerSprite(bite), spine + 14 - sw, midY - 44 * 0.8 + (bite ? 6 : 0), 0.8, 0, { shadow: true, alpha });
    if (bite) markerText('CHUNK!', spine + 18, midY - 44, Lx.tall ? 15 : 20, 0.1);
    if (k > 0.55) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#5d6166'; for (const f of [0.26, 0.74]) ctx.fillRect((spine + 2) * st.K, (Lx.fold.y + M.PAGE.h * 0.45 * f - 8) * st.K, 2.2 * st.K, 16 * st.K); ctx.restore(); }
  }

  /* ---------------------------------------------------------------- reading ---------- */
  function drawReading(now) {
    const Lx = L();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // the table dims under the zine
    ctx.fillStyle = 'rgba(136,195,230,0.78)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (st.unfold) return drawUnfold();
    const pw = Lx.read.pw, ph = pw * M.PAGE.h / M.PAGE.w;
    const shadow = { shadow: true };
    if (Lx.tall) {
      // phones: one page at a time, the next sliding over the last
      const turn = st.turn, x = Lx.read.x, y = Lx.read.y;
      if (!turn) { place(pageSprite(st.page + 1), x, y, pageScale(), 0, shadow); }
      else {
        const k = ease(seg(now, turn.start, turn.start + 0.32)), dir = turn.to > turn.from ? 1 : -1;
        place(pageSprite(turn.from + 1), x - dir * k * 40, y, pageScale(), -dir * k * 0.04, { ...shadow, alpha: 1 - k * 0.6 });
        place(pageSprite(turn.to + 1), x + dir * (1 - k) * (pw + 40), y, pageScale(), dir * (1 - k) * 0.05, shadow);
        if (k >= 1) { st.turn = null; st.page = turn.to; updateUI(); }
      }
      drawGenStamp(x + pw - 20, y + ph + 26);
      drawCopyFlash(now, x, y, pw, ph);
      return;
    }
    const spine = Lx.read.spine, y = Lx.read.y;
    const left = (s) => (s === 0 ? null : s === 4 ? 8 : s * 2), right = (s) => (s === 0 ? 1 : s === 4 ? null : s * 2 + 1);
    const pages = (s) => [left(s), right(s)];
    const turn = st.turn;
    if (!turn) {
      const [l, r] = pages(st.page);
      if (l) place(pageSprite(l), spine - pw, y, pageScale(), 0, shadow);
      if (r) place(pageSprite(r), spine, y, pageScale(), 0, shadow);
      if (l && r) drawGutter(spine, y, ph);
      drawStaples(spine, y, ph, l && r);
    } else {
      const k = ease(seg(now, turn.start, turn.start + 0.55)), fwd = turn.to > turn.from;
      const [l0, r0] = pages(turn.from), [l1, r1] = pages(turn.to);
      // underneath: the pages that stay put
      if (fwd) { if (l0) place(pageSprite(l0), spine - pw, y, pageScale(), 0, shadow); if (r1) place(pageSprite(r1), spine, y, pageScale(), 0, shadow); }
      else { if (l1) place(pageSprite(l1), spine - pw, y, pageScale(), 0, shadow); if (r0) place(pageSprite(r0), spine, y, pageScale(), 0, shadow); }
      // the turning leaf: front shrinks toward the spine, then its back opens on the other side
      const a = k * Math.PI, c = Math.cos(a);
      const front = fwd ? r0 : l0, backP = fwd ? l1 : r1;
      const spr = c > 0 ? (front && pageSprite(front)) : (backP && pageSprite(backP));
      if (spr) {
        const w = pw * Math.abs(c), side = fwd ? (c > 0 ? 1 : -1) : (c > 0 ? -1 : 1);
        const x = side > 0 ? spine : spine - w;
        ctx.save(); ctx.shadowColor = 'rgba(20,30,40,0.35)'; ctx.shadowBlur = 10 * st.dpr; ctx.shadowOffsetY = 4 * st.dpr;
        ctx.drawImage(spr, x * st.K, (y - Math.sin(a) * 8) * st.K, w * st.K, (ph + Math.sin(a) * 8) * st.K);
        ctx.restore();
        // a little light falls off across the curling leaf
        const g = ctx.createLinearGradient(x * st.K, 0, (x + w) * st.K, 0);
        const dark = `rgba(0,0,0,${0.18 * Math.sin(a)})`;
        g.addColorStop(side > 0 ? 0 : 1, dark); g.addColorStop(side > 0 ? 1 : 0, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x * st.K, (y - Math.sin(a) * 8) * st.K, w * st.K, (ph + Math.sin(a) * 8) * st.K);
      }
      if (k >= 1) { st.turn = null; st.page = turn.to; updateUI(); }
    }
    drawGenStamp(spine + pw - 10, y + ph + 30);
    drawCopyFlash(now, spine - pw, y, pw * 2, ph);
  }
  function drawCopyFlash(now, x, y, w, h) {
    const k = (now - st.copyFlash) / 0.8; if (k < 0 || k > 1) return;
    const bx = x + w * k;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient((bx - 40) * st.K, 0, (bx + 40) * st.K, 0);
    g.addColorStop(0, 'rgba(206,255,214,0)'); g.addColorStop(0.5, 'rgba(206,255,214,0.85)'); g.addColorStop(1, 'rgba(206,255,214,0)');
    ctx.fillStyle = g; ctx.fillRect((bx - 40) * st.K, (y - 10) * st.K, 80 * st.K, (h + 20) * st.K);
    ctx.restore();
    kick();
  }
  function drawGutter(spine, y, ph) {
    const g = ctx.createLinearGradient((spine - 14) * st.K, 0, (spine + 14) * st.K, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect((spine - 14) * st.K, y * st.K, 28 * st.K, ph * st.K);
  }
  function drawStaples(spine, y, ph, open) {
    ctx.save(); ctx.fillStyle = '#8b8f94'; ctx.strokeStyle = '#3c3f43'; ctx.lineWidth = 0.8 * st.K;
    for (const k of [0.26, 0.74]) {
      const yy = y + ph * k;
      if (open) { ctx.fillRect((spine - 1.2) * st.K, (yy - 10) * st.K, 2.4 * st.K, 20 * st.K); ctx.strokeRect((spine - 1.2) * st.K, (yy - 10) * st.K, 2.4 * st.K, 20 * st.K); }
    }
    ctx.restore();
  }
  function drawGenStamp(x, y) {
    if (st.gen <= 1) return;
    const label = st.gen === 2 ? 'a copy of a copy' : `a copy of a copy ×${st.gen - 1}`;
    markerText(label, x, y, L().tall ? 13 : 15, -0.03, 'right');
  }

  function drawUnfold() {
    const Lx = L(), cols = Lx.tall ? 1 : 2, fs = Lx.tall ? 0.42 : 0.5;
    const fw = M.PAGE.w * 2 * fs, fh = M.PAGE.h * fs, gapX = 30, gapY = 46;
    const totalW = cols * fw + (cols - 1) * gapX, x0 = (Lx.W - totalW) / 2, y0 = Lx.tall ? 60 : 72;
    for (let f = 0; f < 4; f++) {
      const cx = x0 + (f % cols) * (fw + gapX), cy = y0 + Math.floor(f / cols) * (fh + gapY);
      place(faceSprite(f, fs), cx, cy, fs, 0, { shadow: true });
      markerText(FACE_NAMES[f], cx, cy - 8, Lx.tall ? 12 : 14, -0.02);
    }
    markerText('print both sheets double-sided, fold, staple', Lx.W / 2, Lx.H - (Lx.tall ? 26 : 22), Lx.tall ? 13 : 16, 0, 'center');
  }

  /* ---------------------------------------------------------------- loop ------------- */
  function runTime(now) { return FROZEN !== null ? Math.max(0, FROZEN) : (now - st.t0) / 1000; }
  function frame(nowMs) {
    st.raf = 0;
    const now = nowMs / 1000; st.now = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const t = st.mode === 'run' ? runTime(nowMs) : 0;
    if (st.mode === 'run' && t >= T.read) { st.mode = 'read'; st.page = 0; updateUI(); }
    if (st.mode === 'read') {
      drawScene(T.read + 0.01);
      drawReading(now);
    } else drawScene(st.mode === 'run' ? t : now);
    if (st.mode === 'run') setStatus(STATUS[t < T.plan ? 1 : t < T.pics ? 2 : t < T.copy ? 3 : 4]);
    if (FROZEN !== null) window.__ready = true;
    const animating = st.mode === 'run' || st.turn || (st.mode === 'idle' && !st.drag && !reduceMotion.matches);
    if (FROZEN === null && st.visible && animating) st.raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!disposed && !st.raf && st.visible) st.raf = requestAnimationFrame(frame); };

  /* ---------------------------------------------------------------- controls --------- */
  function setStatus(s) { if (s !== st.lastStatus) { st.lastStatus = s; ui.status.textContent = s; } }
  function updateUI() {
    const reading = st.mode === 'read';
    ui.make.hidden = st.mode !== 'idle'; ui.skip.hidden = st.mode !== 'run';
    for (const b of [ui.prev, ui.next, ui.again, ui.unfold, ui.reset]) b.hidden = !reading;
    const last = L().tall ? 7 : 4;
    const pg = st.turn ? st.turn.to : st.page;
    ui.prev.disabled = st.unfold || pg <= 0; ui.next.disabled = st.unfold || pg >= last;
    ui.again.disabled = st.unfold || st.gen >= 5;
    ui.unfold.textContent = st.unfold ? 'Fold it back up' : 'Unfold the sheets';
    if (reading && !st.unfold) {
      const pg = st.turn ? st.turn.to : st.page;
      const desc = L().tall ? `Page ${pg + 1} of 8.` : pg === 0 ? 'The cover.' : pg === 4 ? 'The back cover.' : `Pages ${pg * 2} and ${pg * 2 + 1}.`;
      setStatus(`The zine. ${desc} ${st.gen > 1 ? `This is copy generation ${st.gen}: every copy loses a little.` : 'Turn the pages, or make a copy of the copy.'}`);
    }
    if (reading && st.unfold) setStatus('Both sheets, unfolded. Print them double-sided, fold them in half together and staple the spine: that’s the zine.');
    if (st.mode === 'idle') setStatus(STATUS[0]);
    layoutHits();
  }
  function start() {
    if (st.mode !== 'idle') return;
    st.gen = 1;
    if (reduceMotion.matches) { st.mode = 'read'; st.page = 0; updateUI(); kick(); return; }
    st.mode = 'run'; st.t0 = performance.now(); updateUI();
    warm([...[0.5, 1].map((l) => () => copierSprite(l)), boardSprite, ...SCRAPS.map((_, i) => () => scrapSprite(i)), poemSprite,
      ...PICS.map((_, i) => () => slipSprite(i)), ...PICS.map((_, i) => () => thumbSprite(i)), () => staplerSprite(0), () => staplerSprite(1),
      ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => () => pageSprite(n)), () => faceSprite(0, 0.25), () => faceSprite(2, 0.25)]);
    kick();
  }
  function skip() { if (st.mode === 'run') { st.mode = 'read'; st.page = 0; updateUI(); kick(); } }
  function turnTo(p) {
    const last = L().tall ? 7 : 4; p = clamp(p, 0, last);
    if (st.mode !== 'read' || st.unfold || p === st.page) return;
    if (st.turn) { st.page = st.turn.to; st.turn = null; }
    if (reduceMotion.matches) { st.page = p; updateUI(); kick(); return; }
    st.turn = { from: st.page, to: p, start: performance.now() / 1000 }; updateUI(); kick();
  }
  function copyAgain() {
    if (st.mode !== 'read' || st.gen >= 5) return;
    st.gen += 1; st.copyFlash = performance.now() / 1000; updateUI(); kick();
  }
  function reset() { st.mode = 'idle'; st.gen = 1; st.page = 0; st.turn = null; st.unfold = false; st.dragPos = null; updateUI(); kick(); }

  on(ui.make, 'click', start);
  on(ui.skip, 'click', skip);
  on(ui.prev, 'click', () => turnTo(st.page - 1));
  on(ui.next, 'click', () => turnTo(st.page + 1));
  on(ui.again, 'click', copyAgain);
  on(ui.unfold, 'click', () => { st.unfold = !st.unfold; updateUI(); kick(); });
  on(ui.reset, 'click', reset);
  on(sheetEl, 'keydown', (e) => {
    if (e.key === 'ArrowRight') { turnTo(st.page + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { turnTo(st.page - 1); e.preventDefault(); }
    else if ((e.key === 'Enter' || e.key === ' ') && st.mode === 'idle' && e.target === sheetEl) { start(); e.preventDefault(); }
  });

  // hit areas: the paper (idle), page halves (reading)
  const hitPaper = root.querySelector('#hit-paper'), hitPrev = root.querySelector('#hit-prev'), hitNext = root.querySelector('#hit-next');
  function layoutHits() {
    const Lx = L(), k = 100 / Lx.W, kh = 100 / Lx.H, p = st.dragPos || Lx.paperIdle;
    const set = (el, x, y, w, h) => Object.assign(el.style, { left: `${x * k}%`, top: `${y * kh}%`, width: `${w * k}%`, height: `${h * kh}%` });
    hitPaper.hidden = st.mode !== 'idle';
    set(hitPaper, p.x, p.y, M.PAPER.w * Lx.paperIdle.s, M.PAPER.h * Lx.paperIdle.s);
    const reading = st.mode === 'read' && !st.unfold;
    hitPrev.hidden = hitNext.hidden = !reading;
    if (Lx.tall) { set(hitPrev, 0, Lx.read.y, Lx.W / 2, Lx.read.pw * 1.34); set(hitNext, Lx.W / 2, Lx.read.y, Lx.W / 2, Lx.read.pw * 1.34); }
    else { const ph = Lx.read.pw * M.PAGE.h / M.PAGE.w; set(hitPrev, Lx.read.spine - Lx.read.pw, Lx.read.y, Lx.read.pw, ph); set(hitNext, Lx.read.spine, Lx.read.y, Lx.read.pw, ph); }
  }
  on(hitPrev, 'click', () => turnTo(st.page - 1));
  on(hitNext, 'click', () => turnTo(st.page + 1));
  // drag the paper onto the glass; a tap or Enter also works
  const toDU = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * L().W, (e.clientY - r.top) / r.height * L().H]; };
  on(hitPaper, 'pointerdown', (e) => {
    if (st.mode !== 'idle') return;
    const [x, y] = toDU(e), p = L().paperIdle; st.drag = { dx: x - p.x, dy: y - p.y, x0: x, y0: y, moved: false };
    hitPaper.setPointerCapture(e.pointerId); e.preventDefault();
  });
  on(hitPaper, 'pointermove', (e) => {
    if (!st.drag) return; const [x, y] = toDU(e);
    if (Math.hypot(x - st.drag.x0, y - st.drag.y0) > 4) st.drag.moved = true;
    st.dragPos = { x: x - st.drag.dx, y: y - st.drag.dy }; layoutHits(); kick();
  });
  on(hitPaper, 'pointerup', (e) => {
    if (!st.drag) return; const d = st.drag; st.drag = null;
    const [x, y] = toDU(e), Lx = L(), c = Lx.copier;
    const overCopier = x > c.x + 40 * c.s && x < c.x + (M.COPIER.ox + M.COPIER.fw + 40) * c.s && y > c.y && y < c.y + (M.COPIER.oy + 60) * c.s;
    if (!d.moved || overCopier) { st.startFrom = st.dragPos ? { ...st.dragPos, r: 0.02 } : null; start(); }
    st.dragPos = null; layoutHits(); kick();
  });
  on(hitPaper, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { start(); e.preventDefault(); } });

  // swipe to turn on touch
  let sx0 = null;
  on(sheetEl, 'touchstart', (e) => { if (st.mode === 'read') sx0 = e.touches[0].clientX; }, { passive: true });
  on(sheetEl, 'touchend', (e) => { if (sx0 === null) return; const dx = e.changedTouches[0].clientX - sx0; sx0 = null; if (Math.abs(dx) > 40) turnTo(st.page + (dx < 0 ? 1 : -1)); }, { passive: true });

  // Off screen or in a hidden tab, nothing draws and the run's clock stops where it was.
  let onScreen = true;
  function setVisible() {
    const v = onScreen && !document.hidden;
    if (v === st.visible) return;
    st.visible = v;
    if (!v) st.pausedAt = performance.now() - st.t0;
    else { if (st.mode === 'run') st.t0 = performance.now() - st.pausedAt; kick(); }
  }
  on(document, 'visibilitychange', setVisible);
  const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; setVisible(); });
  io.observe(sheetEl);
  let rz = 0;
  const ro = new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => { resize(); kick(); }, 120); });
  ro.observe(sheetEl);

  // review hooks: ?t=seconds into the run, &page=, &gen=, &unfold=1, &idle=1
  resize();
  if (FROZEN !== null) {
    if (params.get('idle') === '1' || FROZEN < 0) st.mode = 'idle';
    else if (FROZEN >= T.read) { st.mode = 'read'; st.page = parseInt(params.get('page') || '0', 10); st.gen = parseInt(params.get('gen') || '1', 10); st.unfold = params.get('unfold') === '1'; }
    else st.mode = 'run';
  }
  updateUI();
  kick();
  return () => {
    disposed = true; ac.abort(); io.disconnect(); ro.disconnect(); clearTimeout(rz);
    if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0;
  };
}
