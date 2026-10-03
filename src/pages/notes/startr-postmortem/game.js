/* The Startup Game, 2023 edition: the figure for "Glyp: A Post-Mortem".
   A 1960s lithographed board game, drawn in Canvas 2D. Glyp is a little open-top car that
   collects a peg for every feature it lands on and goes round the Feature Loop; Sudowrite and
   Jenni AI each carry one peg and drive straight down the Niche Lane to the readers. The
   reader spins Glyp's spinner, which is honestly rigged: almost all of it is features, with a
   sliver of distribution. The ending flips the weighting. Every label is the essay's own words;
   the spinner's proportions are a sketch, not data. DESIGN notes live in index.html. */
import { figParams } from '../../../components/art/essay-fonts.js';

// Mounts the board game into `root` (the <figure>) and returns a cleanup function.
export function mountGame(root) {
  const canvas = root.querySelector('#game-canvas');
  if (!canvas) return () => {};
  const ac = new AbortController(), on = (target, type, fn, opts) => target.addEventListener(type, fn, { ...opts, signal: ac.signal });
  let disposed = false;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;
  const btnSpin = root.querySelector('#btn-spin');
  const btnFlip = root.querySelector('#btn-flip');
  const btnReset = root.querySelector('#btn-reset');
  const statusEl = root.querySelector('#game-status');

  // Review hooks: ?fig-t=seconds freezes a frame of the autoplayed game, &fig-flip=seconds adds the flip.
  const params = figParams();
  const T_PARAM = params.has('t') ? Math.max(0, parseFloat(params.get('t')) || 0) : null;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches && T_PARAM === null;
  const PI = Math.PI, TAU = PI * 2;

  // ---------- palette and type: a 1960s lithographed game board ----------
  const C = {
    board: '#F1E2BF', paper: '#FBF2DC', ink: '#2A221D', navy: '#1E2A4D', navyHi: '#2E3C66',
    red: '#CF3A2B', tang: '#EC7A2C', mustard: '#E7B23A', teal: '#1B958F', seafoam: '#A6D5C0',
    green: '#3D8A4D', sky: '#7EBCD6', pink: '#EBA59A', cream: '#FFF7E4', shadow: 'rgba(42,26,10,.30)',
  };
  const F = {
    title: '"Shrikhand", Georgia, serif',
    label: '"Barlow Condensed", "Arial Narrow", Arial, sans-serif',
    card: '"Rokkitt", Georgia, serif',
  };

  // ---------- content: every label is from the essay ----------
  const SECTORS = [ // Glyp's spinner, fall 2023. Weights are a sketch, not data.
    { key: 'tweak', label: 'Tweak features', w: 20, fw: 6, col: C.mustard, ink: C.ink },
    { key: 'angle', label: 'A new angle', w: 15, fw: 6, col: C.teal, ink: C.cream },
    { key: 'second', label: 'Second-guess the core', w: 14, fw: 6, col: C.red, ink: C.cream },
    { key: 'share', label: 'Share', w: 12, fw: 6, col: C.sky, ink: C.ink },
    { key: 'edit', label: 'Edit', w: 11, fw: 6, col: C.tang, ink: C.ink },
    { key: 'collab', label: 'Collaborate', w: 11, fw: 6, col: C.seafoam, ink: C.ink },
    { key: 'readers', label: 'Readers as participants', w: 11, fw: 6, col: C.pink, ink: C.ink },
    { key: 'dist', label: 'Distribution', w: 6, fw: 64, col: C.green, ink: C.cream },
  ];
  const RING = [ // the Feature Loop, clockwise from the left
    { key: 'share', label: 'Share', icon: 'share', col: C.sky, ink: C.ink },
    { key: 'edit', label: 'Edit', icon: 'edit', col: C.tang, ink: C.ink },
    { key: 'collab', label: 'Collaborate', icon: 'collab', col: C.seafoam, ink: C.ink },
    { key: 'readers', label: 'Readers as participants', icon: 'readersIn', col: C.pink, ink: C.ink },
    { key: 'web', label: 'Building for the web', icon: 'web', col: C.navy, ink: C.cream },
    { key: 'tweak', label: 'Tweak features', icon: 'tweak', col: C.mustard, ink: C.ink },
    { key: 'angle', label: 'A new angle', icon: 'angle', col: C.teal, ink: C.cream },
    { key: 'second', label: 'Second-guess the core', icon: 'core', col: C.red, ink: C.cream },
  ];
  const LANE = [
    { label: 'Pick a niche', icon: 'target' }, { label: 'Getting users', icon: 'one' },
    { label: 'Growing users', icon: 'three' }, { label: 'Keeping users', icon: 'magnet' },
    { label: 'Making money', icon: 'coins' },
  ];
  const CARDS = {
    medium: { kind: 'Chance', col: C.red, main: 'Wrong medium, wrong form factor.', sub: 'For B2C, the momentum was in mobile apps like Cal AI, while I was still building for the web.', foot: 'Back to the loop.' },
    conviction: { kind: 'Chance', col: C.red, main: 'No real conviction, no committed path forward.', sub: 'I also wasn’t really in founder mode.', foot: 'Go back 2 spaces.' },
    established: { kind: 'Chance', col: C.red, main: 'Competitors had already established themselves.', sub: 'Sudowrite and Jenni AI picked specific niches and stuck with them.', foot: 'They reach the readers.' },
    pivot: { kind: 'Pivot', col: C.tang, main: 'Glyp Podcasts', sub: 'Same fundamental problems though—too late, poorly executed, no real conviction behind the pivot.', foot: 'Once more round the loop.' },
    lesson: { kind: 'Lesson', col: C.green, main: 'Distribution matters way more than features.', sub: 'This sounds obvious when you say it, but you don’t really internalize it until you’ve built something nobody finds.', foot: 'Flip the spinner.' },
  };
  const DECK = ['medium', 'conviction', 'established', 'pivot', 'lesson'];
  // The game as it went, fall 2023: one entry per spin.
  const SCRIPT = [
    { sector: 'share', comps: 1 },
    { sector: 'collab', comps: 2 },
    { sector: 'dist', comps: 3, card: 'medium' },
    { sector: 'tweak', comps: 4 },
    { sector: 'second', comps: 5, card: 'conviction', back: 2 },
    { sector: 'angle', comps: 6, card: 'established' },
    { pivot: true },
  ];

  // ---------- layout ----------
  function makeLayout(phone) {
    if (!phone) {
      const L = {
        phone: false, W: 1000, H: 700, board: [16, 12, 984, 688], edge: 9,
        title: { x: 54, y: 86, size: 50 }, ribbon: { x: 58, y: 104, w: 196, h: 26 }, tag: { x: 270, y: 122 },
        sq: { w: 104, h: 66 }, ring: { w: 96, h: 56 }, lab: 13, labMin: 10.5, icon: 20,
        start: { x: 112, y: 270, w: 124, h: 84 },
        lane: [{ x: 244, y: 270 }, { x: 362, y: 270 }, { x: 480, y: 270 }, { x: 598, y: 270 }, { x: 716, y: 270 }],
        laneRoad: [[112, 270], [866, 270]], laneLabel: { x: 192, y: 196 },
        finish: { x: 866, y: 262, w: 150, h: 110 },
        loop: { x: 332, y: 494, r: 144 }, entry: 0, exit: 4,
        glypRoad: [[112, 312], [112, 494], [140, 494]],
        dist: [{ x: 590, y: 494, chance: true }, { x: 694, y: 440 }, { x: 778, y: 380 }],
        distEnd: [866, 317],
        deck: { x: 302, y: 504, w: 64, h: 44 }, discard: { x: 364, y: 504 },
        spinner: { x: 858, y: 562, r: 104 }, spinLabel: 'arc',
        card: { x: 532, y: 424, w: 340, h: 210 }, cardAt: { medium: [300, 418], conviction: [704, 418], established: [318, 430], pivot: [704, 418] }, car: 52, cardScale: 1, dock: { x: 838, y: 112, s: .5, rot: .05 },
        fold: 500,
      };
      return L;
    }
    return {
      phone: true, W: 420, H: 830, board: [8, 8, 412, 822], edge: 7,
      title: { x: 24, y: 58, size: 30 }, ribbon: { x: 26, y: 72, w: 150, h: 22 }, tag: { x: 186, y: 88 },
      sq: { w: 84, h: 50 }, ring: { w: 68, h: 48 }, lab: 11, labMin: 8.5, icon: 13,
      start: { x: 362, y: 566, w: 92, h: 62 },
      lane: [{ x: 362, y: 490 }, { x: 362, y: 428 }, { x: 362, y: 366 }, { x: 362, y: 304 }, { x: 362, y: 242 }],
      laneRoad: [[362, 566], [362, 156]], laneLabel: { x: 309, y: 452, vertical: true },
      finish: { x: 362, y: 156, w: 88, h: 82 },
      loop: { x: 156, y: 372, r: 106 }, entry: 7, exit: 4, ringRot: -PI / 4,
      glypRoad: [[316, 562], [156, 562], [156, 496]],
      dist: [{ x: 252, y: 196, chance: true }],
      distEnd: [318, 166],
      deck: { x: 134, y: 380, w: 44, h: 31 }, discard: { x: 178, y: 380 },
      spinner: { x: 176, y: 690, r: 92 }, spinLabel: 'below',
      card: { x: 210, y: 400, w: 368, h: 196 }, cardAt: { medium: [210, 470], conviction: [210, 282], established: [210, 470], pivot: [210, 266] }, car: 40, cardScale: .94, dock: { x: 92, y: 196, s: .27, rot: -.04 },
      fold: null,
    };
  }

  // ---------- small helpers ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function lines(c, text, maxW) {
    const words = text.split(' '); const out = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width <= maxW || !cur) cur = t; else { out.push(cur); cur = w; } }
    if (cur) out.push(cur); return out;
  }
  function fitLabel(c, text, maxW, maxLines, size, min, weight = 700, family = F.label, upper = true) {
    const t = upper ? text.toUpperCase() : text;
    for (let s = size; s >= min; s -= .5) {
      c.font = `${weight} ${s}px ${family}`;
      const ls = lines(c, t, maxW);
      if (ls.length <= maxLines && ls.every(l => c.measureText(l).width <= maxW)) return { size: s, lines: ls };
    }
    c.font = `${weight} ${min}px ${family}`;
    return { size: min, lines: lines(c, t, maxW) };
  }
  function spaced(c, text, x, y, sp, align = 'left') {
    let w = 0; for (const ch of text) w += c.measureText(ch).width + sp; w -= sp;
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const a = c.textAlign; c.textAlign = 'left';
    for (const ch of text) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + sp; }
    c.textAlign = a;
  }
  function arcText(c, text, cx, cy, r, mid, sp = 0, inward = false) {
    // text along a circle, centred on angle `mid` (radians, screen coords), reading clockwise
    const widths = [...text].map(ch => c.measureText(ch).width + sp);
    const total = widths.reduce((a, b) => a + b, 0) - sp;
    let a = mid - (inward ? -1 : 1) * total / r / 2;
    const dir = inward ? -1 : 1;
    [...text].forEach((ch, i) => {
      const w = widths[i]; const am = a + dir * (w - sp) / 2 / r;
      c.save(); c.translate(cx + Math.cos(am) * r, cy + Math.sin(am) * r); c.rotate(am + (inward ? -PI / 2 : PI / 2));
      c.fillText(ch, -(w - sp) / 2, 0); c.restore();
      a += dir * w / r;
    });
  }

  // ---------- icons (flat, geometric, 1960s) ----------
  function icon(c, name, x, y, s, fg, bg) {
    c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
    c.fillStyle = fg; c.strokeStyle = fg; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
    const person = (px, py, k = 1) => { c.beginPath(); c.arc(px, py - 5 * k, 3.4 * k, 0, TAU); c.fill(); c.beginPath(); c.moveTo(px - 6 * k, py + 7 * k); c.quadraticCurveTo(px - 6 * k, py - 1 * k, px, py - 1 * k); c.quadraticCurveTo(px + 6 * k, py - 1 * k, px + 6 * k, py + 7 * k); c.closePath(); c.fill(); };
    switch (name) {
      case 'flag': c.beginPath(); c.moveTo(-6, 11); c.lineTo(-6, -11); c.stroke(); c.beginPath(); c.moveTo(-5, -11); c.lineTo(10, -6); c.lineTo(-5, -1); c.closePath(); c.fill(); break;
      case 'target': c.beginPath(); c.arc(0, 0, 10, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, 5.5, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, 2, 0, TAU); c.fill(); break;
      case 'one': person(0, 2); break;
      case 'three': person(-8, 4, .78); person(8, 4, .78); person(0, 1, 1); break;
      case 'magnet': c.lineWidth = 5; c.beginPath(); c.arc(0, -1, 7, PI, 0, true); c.moveTo(-7, -1); c.lineTo(-7, -9); c.moveTo(7, -1); c.lineTo(7, -9); c.stroke(); c.lineWidth = 2; c.fillStyle = bg; c.fillRect(-9.5, -11, 5, 3); c.fillRect(4.5, -11, 5, 3); break;
      case 'coins': for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(0, 8 - i * 5, 9, 3.2, 0, 0, TAU); c.fillStyle = fg; c.fill(); c.strokeStyle = bg; c.lineWidth = 1.2; c.stroke(); } break;
      case 'readers': c.beginPath(); c.moveTo(-12, 4); c.quadraticCurveTo(-6, 1, 0, 4); c.quadraticCurveTo(6, 1, 12, 4); c.lineTo(12, 12); c.quadraticCurveTo(6, 9, 0, 12); c.quadraticCurveTo(-6, 9, -12, 12); c.closePath(); c.fill(); person(-8, -3, .62); person(0, -5, .7); person(8, -3, .62); break;
      case 'share': c.beginPath(); c.moveTo(-3, -9); c.lineTo(-10, -9); c.lineTo(-10, 10); c.lineTo(9, 10); c.lineTo(9, 3); c.stroke(); c.beginPath(); c.moveTo(-1, 1); c.lineTo(10, -10); c.moveTo(3, -10); c.lineTo(10, -10); c.lineTo(10, -3); c.stroke(); break;
      case 'edit': c.lineWidth = 2.2; c.beginPath(); c.moveTo(-10, -7); c.lineTo(8, -7); c.moveTo(-10, -1); c.lineTo(4, -1); c.moveTo(-10, 5); c.lineTo(1, 5); c.stroke(); c.lineWidth = 2.6; c.beginPath(); c.moveTo(5, 1); c.lineTo(5, 12); c.moveTo(2.5, 1); c.lineTo(7.5, 1); c.moveTo(2.5, 12); c.lineTo(7.5, 12); c.stroke(); break;
      case 'collab': c.beginPath(); c.arc(-4, 0, 8, 0, TAU); c.stroke(); c.beginPath(); c.arc(4, 0, 8, 0, TAU); c.stroke(); c.save(); c.beginPath(); c.arc(-4, 0, 8, 0, TAU); c.clip(); c.beginPath(); c.arc(4, 0, 8, 0, TAU); c.fill(); c.restore(); break;
      case 'readersIn': c.beginPath(); c.moveTo(-12, -2); c.quadraticCurveTo(-6, -5, 0, -2); c.lineTo(0, 11); c.quadraticCurveTo(-6, 8, -12, 11); c.closePath(); c.fill(); c.beginPath(); c.moveTo(12, -2); c.quadraticCurveTo(6, -5, 0, -2); c.lineTo(0, 11); c.quadraticCurveTo(6, 8, 12, 11); c.closePath(); c.globalAlpha = .55; c.fill(); c.globalAlpha = 1; person(6, -5, .62); break;
      case 'web': c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 10, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(0, 0, 4.5, 10, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.moveTo(-8.6, -5); c.lineTo(8.6, -5); c.moveTo(-8.6, 5); c.lineTo(8.6, 5); c.stroke(); break;
      case 'tweak': c.save(); c.rotate(-PI / 4); c.lineWidth = 4.6; c.beginPath(); c.moveTo(0, -3); c.lineTo(0, 11); c.stroke(); c.beginPath(); c.arc(0, -6, 6.4, 0, TAU); c.fill(); c.fillStyle = bg; c.fillRect(-2.2, -14, 4.4, 8); c.restore(); break;
      case 'angle': c.beginPath(); c.moveTo(-11, 9); c.lineTo(11, 9); c.moveTo(-11, 9); c.lineTo(6, -10); c.stroke(); c.lineWidth = 1.8; c.beginPath(); c.arc(-11, 9, 11, -PI / 3.6, 0); c.stroke(); break;
      case 'core': // an apple core, with a question mark: second-guessing the core
        c.beginPath(); c.moveTo(-6, -8); c.quadraticCurveTo(-2, -2, -5, 2); c.quadraticCurveTo(-2, 6, -6, 10); c.lineTo(6, 10); c.quadraticCurveTo(2, 6, 5, 2); c.quadraticCurveTo(2, -2, 6, -8); c.closePath(); c.fill();
        c.lineWidth = 2; c.beginPath(); c.moveTo(0, -8); c.lineTo(1, -12); c.stroke();
        c.font = `700 13px ${F.card}`; c.textAlign = 'center'; c.fillText('?', 11, -2); break;
      case 'phone': c.lineWidth = 2.2; rrect(c, -6.5, -11, 13, 22, 2.6); c.stroke(); c.beginPath(); c.arc(0, 7.6, 1.3, 0, TAU); c.fill(); c.font = `700 12px ${F.card}`; c.textAlign = 'center'; c.fillText('?', 0, 3); break;
      case 'mega': c.beginPath(); c.moveTo(-10, -3); c.lineTo(4, -9); c.lineTo(4, 9); c.lineTo(-10, 3); c.closePath(); c.fill(); c.fillRect(-12, -3, 3, 6); c.lineWidth = 2; c.beginPath(); c.arc(4, 0, 6, -PI / 3, PI / 3); c.moveTo(-7, 3); c.lineTo(-5, 10); c.stroke(); break;
    }
    c.restore();
  }

  // ---------- board positions ----------
  let L = makeLayout(false);
  const ringPos = i => { const a = PI + i * PI / 4 + (L.ringRot || 0); return { x: L.loop.x + Math.cos(a) * L.loop.r, y: L.loop.y + Math.sin(a) * L.loop.r }; };
  function locPos(loc) {
    if (loc === 'start') return { x: L.start.x, y: L.start.y };
    if (loc === 'finish') return { x: L.finish.x, y: L.finish.y };
    if (loc[0] === 'r') return ringPos(+loc.slice(1));
    if (loc[0] === 'd') return L.dist[+loc.slice(1)];
    if (loc[0] === 'n') return L.lane[+loc.slice(1)];
    return { x: 0, y: 0 };
  }
  const ringIndex = key => RING.findIndex(r => r.key === key);
  // Where a car sits on a square: in its upper half, so the square's label stays readable.
  function carSpot(loc, who) {
    const p = locPos(loc);
    const h = loc === 'start' ? L.start.h : loc === 'finish' ? L.finish.h : loc[0] === 'r' ? L.ring.h : L.sq.h;
    const lift = loc === 'finish' ? h * .38 : h * .34;
    if (who === 'glyp') {
      if (loc === 'start') return L.phone ? { x: L.glypRoad[0][0] - 22, y: L.glypRoad[0][1] - 6 } : { x: L.glypRoad[0][0], y: L.glypRoad[0][1] + 26 };
      return { x: p.x, y: p.y - lift };
    }
    const dx = (who === 'sudo' ? -1 : 1) * L.car * .6;
    if (loc === 'start') return { x: p.x + dx, y: p.y - h * .2 };
    return { x: p.x + dx, y: p.y - lift };
  }

  function distPoints() {
    const e = ringPos(L.exit), first = L.dist[0];
    const dx = first.x - e.x, dy = first.y - e.y, l = Math.hypot(dx, dy) || 1;
    const edge = Math.min(L.ring.w / 2 / Math.max(.01, Math.abs(dx / l)), L.ring.h / 2 / Math.max(.01, Math.abs(dy / l)));
    return [[e.x + dx / l * edge, e.y + dy / l * edge], ...L.dist.map(d => [d.x, d.y]), L.distEnd];
  }
  // ---------- static board (drawn once per size) ----------
  let staticLayer = null, staticKey = '';
  let linen = null;
  function linenPattern(scale) {
    const s = Math.max(64, Math.round(80 * scale));
    const cv = document.createElement('canvas'); cv.width = cv.height = s;
    const g = cv.getContext('2d'); const img = g.createImageData(s, s); const r = rng(11);
    const rows = Array.from({ length: s }, () => (r() - .5) * 2), cols = Array.from({ length: s }, () => (r() - .5) * 2);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const weave = ((x >> 1) + (y >> 1)) & 1 ? rows[y] : cols[x];
      const v = 128 + weave * 34 + (r() - .5) * 26;
      const i = (y * s + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); return cv;
  }

  function drawSquare(c, x, y, w, h, fill, ink, label, iconName, opts = {}) {
    c.save();
    if (!opts.noShadow) { rrect(c, x - w / 2 + 3.5, y - h / 2 + 4, w, h, opts.r ?? 8); c.fillStyle = 'rgba(30,42,77,.28)'; c.fill(); }
    rrect(c, x - w / 2, y - h / 2, w, h, opts.r ?? 8); c.fillStyle = fill; c.fill();
    c.lineWidth = 2; c.strokeStyle = C.ink; c.stroke();
    // the litho keyline just inside the edge
    rrect(c, x - w / 2 + 3.5, y - h / 2 + 3.5, w - 7, h - 7, Math.max(3, (opts.r ?? 8) - 3)); c.lineWidth = 1; c.strokeStyle = ink === C.cream ? 'rgba(255,247,228,.55)' : 'rgba(42,34,29,.35)'; c.stroke();
    const top = y - h / 2;
    const isz = opts.icon ?? L.icon;
    if (iconName) icon(c, iconName, x, top + 6 + isz / 2, isz, ink, fill);
    if (label) {
      const fit = fitLabel(c, label, w - 12, opts.maxLines ?? 2, opts.lab ?? L.lab, L.labMin);
      c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      const lh = fit.size * 1.02;
      const blockTop = iconName ? top + 9 + isz : y - (fit.lines.length * lh) / 2 - 2;
      const room = y + h / 2 - 5 - blockTop;
      const y0 = blockTop + (room - fit.lines.length * lh) / 2 + fit.size * .82;
      fit.lines.forEach((ln, i) => spaced(c, ln, x, y0 + i * lh, .4, 'center'));
    }
    c.restore();
  }

  function road(c, pts, width, fill, dash) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.strokeStyle = C.ink; c.lineWidth = width + 4; c.stroke();
    c.strokeStyle = fill; c.lineWidth = width; c.stroke();
    if (dash) { c.setLineDash(dash); c.strokeStyle = 'rgba(255,247,228,.75)'; c.lineWidth = 2.2; c.stroke(); }
    c.restore();
  }

  function starburst(c, x, y, r, n, fill, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = i * PI / n; const rr = i % 2 ? r * .52 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = fill; c.fill(); c.restore();
  }

  function buildStatic(dpr, cssW) {
    const k = cssW / L.W * dpr;
    const cv = document.createElement('canvas'); cv.width = Math.round(L.W * k); cv.height = Math.round(L.H * k);
    const c = cv.getContext('2d'); c.scale(k, k);
    const [bx0, by0, bx1, by1] = L.board, E = L.edge;
    // the board on the table: a soft shadow under folded cardboard
    c.save(); c.shadowColor = 'rgba(40,26,8,.32)'; c.shadowBlur = 18; c.shadowOffsetY = 7;
    rrect(c, bx0, by0, bx1 - bx0, by1 - by0, 10); c.fillStyle = C.navy; c.fill(); c.restore();
    // bookcloth wrap on the edge, with a fine weave and rubbed corners
    c.save(); rrect(c, bx0, by0, bx1 - bx0, by1 - by0, 10); c.clip();
    const wr = rng(5); c.globalAlpha = .18; c.strokeStyle = '#8796C2'; c.lineWidth = .6;
    for (let i = bx0 - 800; i < bx1; i += 3.2) { c.beginPath(); c.moveTo(i, by0); c.lineTo(i + 800, by1); c.stroke(); }
    c.globalAlpha = 1;
    for (const [cx, cy] of [[bx0, by0], [bx1, by0], [bx0, by1], [bx1, by1]]) {
      const gr = c.createRadialGradient(cx, cy, 0, cx, cy, 26); gr.addColorStop(0, 'rgba(190,196,214,.55)'); gr.addColorStop(1, 'rgba(190,196,214,0)');
      c.fillStyle = gr; c.fillRect(cx - 26, cy - 26, 52, 52);
    }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(200,205,225,${.08 + wr() * .1})`; c.fillRect(bx0 + wr() * (bx1 - bx0), wr() < .5 ? by0 + wr() * E : by1 - wr() * E, 2 + wr() * 6, .8); }
    c.restore();
    // the printed face
    const fx0 = bx0 + E, fy0 = by0 + E, fx1 = bx1 - E, fy1 = by1 - E;
    rrect(c, fx0, fy0, fx1 - fx0, fy1 - fy0, 4); c.fillStyle = C.board; c.fill();
    c.save(); rrect(c, fx0, fy0, fx1 - fx0, fy1 - fy0, 4); c.clip();
    // printed zones: a seafoam park under the loop, a mustard sunburst behind the title
    c.fillStyle = 'rgba(166,213,192,.55)'; c.beginPath(); c.arc(L.loop.x, L.loop.y, L.loop.r + L.ring.h * .95, 0, TAU); c.fill();
    c.save(); c.translate(L.title.x + 30, L.title.y - L.title.size * .45);
    for (let i = 0; i < 24; i++) { c.rotate(TAU / 24); if (i % 2) continue; c.beginPath(); c.moveTo(0, 0); c.lineTo(L.phone ? 260 : 520, -16); c.lineTo(L.phone ? 260 : 520, 16); c.closePath(); c.fillStyle = 'rgba(231,178,58,.13)'; c.fill(); }
    c.restore();
    // decorative stars, printed in two inks
    const sr = rng(19);
    const deco = L.phone ? [[392, 30, 9], [30, 470, 7], [282, 806, 8], [395, 640, 7]] : [[952, 44, 14], [618, 64, 9], [44, 640, 11], [560, 662, 8], [700, 600, 7]];
    deco.forEach(([x, y, r], i) => starburst(c, x, y, r, 8, i % 2 ? C.red : C.mustard, sr() * PI));
    // the centre fold of the board
    if (L.fold) {
      const g = c.createLinearGradient(L.fold - 4, 0, L.fold + 4, 0);
      g.addColorStop(0, 'rgba(60,40,10,0)'); g.addColorStop(.45, 'rgba(60,40,10,.16)'); g.addColorStop(.55, 'rgba(255,250,235,.35)'); g.addColorStop(1, 'rgba(60,40,10,0)');
      c.fillStyle = g; c.fillRect(L.fold - 4, fy0, 8, fy1 - fy0);
    }

    // roads
    const laneW = L.phone ? 64 : 84;
    road(c, L.laneRoad, laneW, C.teal, [10, 9]);
    road(c, L.glypRoad, L.phone ? 22 : 26, C.tang, [6, 7]);
    // the Feature Loop: a roundabout ring
    c.save(); c.lineWidth = L.ring.h + 22; c.strokeStyle = C.ink; c.beginPath(); c.arc(L.loop.x, L.loop.y, L.loop.r, 0, TAU); c.stroke();
    c.lineWidth = L.ring.h + 18; c.strokeStyle = C.mustard; c.stroke();
    c.setLineDash([7, 8]); c.lineWidth = 2; c.strokeStyle = 'rgba(42,34,29,.45)'; c.beginPath(); c.arc(L.loop.x, L.loop.y, L.loop.r, 0, TAU); c.stroke(); c.restore();
    // roundabout arrows between squares
    for (let i = 0; i < 8; i++) {
      const a = PI + (i + .5) * PI / 4 + (L.ringRot || 0); const x = L.loop.x + Math.cos(a) * L.loop.r, y = L.loop.y + Math.sin(a) * L.loop.r;
      c.save(); c.translate(x, y); c.rotate(a + PI / 2); c.fillStyle = C.ink; c.beginPath(); const s = L.phone ? 5 : 7; c.moveTo(s, 0); c.lineTo(-s * .6, -s * .8); c.lineTo(-s * .6, s * .8); c.closePath(); c.fill(); c.restore();
    }
    // the distribution road: never printed in 2023, so only a dashed die-line
    const dpts = distPoints();
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([2, 7]); c.strokeStyle = 'rgba(42,34,29,.55)'; c.lineWidth = 2.2;
    for (const off of [-1, 1]) { c.beginPath(); dpts.forEach(([x, y], i) => { const n = i < dpts.length - 1 ? dpts[i + 1] : dpts[i - 1]; const dx = n[0] - x, dy = n[1] - y, l = Math.hypot(dx, dy) || 1; const ox = -dy / l * (L.phone ? 13 : 17) * off * (i < dpts.length - 1 ? 1 : -1), oy = dx / l * (L.phone ? 13 : 17) * off * (i < dpts.length - 1 ? 1 : -1); i ? c.lineTo(x + ox, y + oy) : c.moveTo(x + ox, y + oy); }); c.stroke(); }
    c.restore();

    // titles and labels
    c.save(); c.textBaseline = 'alphabetic';
    c.font = `400 ${L.title.size}px ${F.title}`;
    c.fillStyle = C.red; c.fillText('The Startup Game', L.title.x + 3, L.title.y + 3);
    c.fillStyle = C.navy; c.fillText('The Startup Game', L.title.x, L.title.y);
    const rb = L.ribbon;
    c.fillStyle = C.navy; c.beginPath(); c.moveTo(rb.x, rb.y); c.lineTo(rb.x + rb.w, rb.y); c.lineTo(rb.x + rb.w - 8, rb.y + rb.h / 2); c.lineTo(rb.x + rb.w, rb.y + rb.h); c.lineTo(rb.x, rb.y + rb.h); c.lineTo(rb.x + 8, rb.y + rb.h / 2); c.closePath(); c.fill();
    c.fillStyle = C.cream; c.font = `700 ${L.phone ? 12 : 15}px ${F.label}`; c.textAlign = 'left';
    spaced(c, '2023 EDITION', rb.x + rb.w / 2, rb.y + rb.h * .7, L.phone ? 2 : 3, 'center');
    c.fillStyle = C.ink; c.font = `500 ${L.phone ? 11.5 : 13.5}px ${F.card}`;
    c.fillText(L.phone ? '1 player · a sketch, not data' : 'One player, fall 2023 · a sketch of the essay, not data', L.tag.x, L.tag.y);
    // lane label
    c.fillStyle = C.navy; c.font = `700 ${L.phone ? 13 : 16}px ${F.label}`;
    if (L.laneLabel.vertical) {
      c.save(); c.translate(L.laneLabel.x, L.laneLabel.y); c.rotate(-PI / 2); spaced(c, 'THE NICHE LANE', 0, 0, 2.5, 'center'); c.restore();
    } else {
      spaced(c, 'THE NICHE LANE', L.laneLabel.x, L.laneLabel.y, 3);
      c.font = `500 14px ${F.card}`; c.fillStyle = C.ink;
      c.fillText('Sudowrite and Jenni AI: picked specific niches and stuck with them', L.laneLabel.x + 150, L.laneLabel.y);
    }
    // loop label, curved inside the ring
    c.fillStyle = C.navy; c.font = `700 ${L.phone ? 10.5 : 13}px ${F.label}`;
    spaced(c, 'THE FEATURE LOOP', L.loop.x, L.loop.y - L.deck.h / 2 - (L.phone ? 12 : 16), L.phone ? 1.4 : 2.2, 'center');
    // glyp's road label
    c.fillStyle = C.ink; c.font = `700 ${L.phone ? 10.5 : 12}px ${F.label}`;
    if (L.phone) spaced(c, 'GLYP’S ROAD', 236, L.glypRoad[0][1] - 16, 1.6, 'center');
    else { c.save(); c.translate(L.glypRoad[0][0] - 20, 430); c.rotate(-PI / 2); spaced(c, 'GLYP’S ROAD', 0, 0, 1.6, 'center'); c.restore(); }
    c.restore();

    // squares: start, lane, finish, ring, the chance square
    drawSquare(c, L.start.x, L.start.y, L.start.w, L.start.h, C.red, C.cream, 'Start · Fall 2023', 'flag', { lab: L.phone ? 12 : 14, icon: L.phone ? 16 : 22 });
    L.lane.forEach((p, i) => drawSquare(c, p.x, p.y, L.sq.w, L.sq.h, i % 2 ? C.paper : C.seafoam, C.ink, LANE[i].label, LANE[i].icon));
    drawSquare(c, L.finish.x, L.finish.y, L.finish.w, L.finish.h, C.mustard, C.ink, 'Readers', 'readers', { lab: L.phone ? 15 : 19, icon: L.phone ? 26 : 34, maxLines: 1, r: 12 });
    RING.forEach((s, i) => { const p = ringPos(i); drawSquare(c, p.x, p.y, L.ring.w, L.ring.h, s.col, s.ink, s.label, s.icon, { maxLines: L.phone ? 3 : 2, icon: L.phone ? 13 : L.icon }); });
    L.dist.forEach((d) => {
      if (d.chance) drawSquare(c, d.x, d.y, L.ring.w, L.ring.h, C.cream, C.red, 'Wrong medium', 'phone', { icon: L.phone ? 13 : L.icon });
      else { c.save(); rrect(c, d.x - L.ring.w / 2, d.y - L.ring.h / 2, L.ring.w, L.ring.h, 8); c.fillStyle = C.board; c.fill(); c.setLineDash([3, 4]); c.lineWidth = 1.6; c.strokeStyle = 'rgba(42,34,29,.6)'; c.stroke(); c.fillStyle = 'rgba(42,34,29,.55)'; c.font = `700 ${L.phone ? 11 : 13}px ${F.label}`; c.textAlign = 'center'; spaced(c, 'DISTRIBUTION?', d.x, d.y + 4, 1, 'center'); c.restore(); }
    });
    // the card tray in the middle of the loop
    for (const p of [L.deck, L.discard]) { c.save(); rrect(c, p.x - L.deck.w / 2 - 4, p.y - L.deck.h / 2 - 4, L.deck.w + 8, L.deck.h + 8, 6); c.setLineDash([3, 3]); c.strokeStyle = 'rgba(42,34,29,.45)'; c.lineWidth = 1.2; c.stroke(); c.restore(); }
    // spinner base printed on the board
    const S = L.spinner;
    c.save(); c.beginPath(); c.arc(S.x, S.y, S.r + 9, 0, TAU); c.fillStyle = C.navy; c.fill();
    c.fillStyle = C.mustard; c.font = `700 ${L.phone ? 11 : 13}px ${F.label}`;
    if (L.spinLabel === 'arc') arcText(c, 'MY SPINNER · FALL 2023', S.x, S.y, S.r + 23, -PI / 2, 2.2);
    else { c.fillStyle = C.navy; c.textAlign = 'center'; spaced(c, 'MY SPINNER · FALL 2023', S.x, S.y + S.r + 26, 2, 'center'); }
    c.restore();

    // linen emboss over the printed face (and a faint wear near the edges)
    if (!linen || linen._k !== k) { linen = linenPattern(Math.min(2, k)); linen._k = k; }
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .36;
    c.fillStyle = c.createPattern(linen, 'repeat'); c.fillRect(0, 0, cv.width, cv.height); c.restore();
    c.save(); c.globalCompositeOperation = 'multiply';
    const vg = c.createRadialGradient(L.W / 2, L.H / 2, Math.min(L.W, L.H) * .3, L.W / 2, L.H / 2, Math.max(L.W, L.H) * .75); vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(160,120,70,.16)');
    c.fillStyle = vg; c.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0); c.restore();
    c.restore();
    return cv;
  }

  // ---------- moving pieces ----------
  function drawCar(c, x, y, s, body, pegs, flag, mic, t, flagSide = 1, lift = 0) {
    c.save(); c.translate(x, y); const k = s / 44; c.scale(k, k);
    c.fillStyle = 'rgba(40,26,8,.28)'; c.beginPath(); c.ellipse(1, 11, 22, 4.4, 0, 0, TAU); c.fill();
    if (flag) { // a pennant on a whip antenna, flying away from the other car
      const fx = flagSide * 15; c.strokeStyle = C.ink; c.lineWidth = 1.1; c.beginPath(); c.moveTo(fx, -3); c.lineTo(fx, -25 - lift); c.stroke();
      c.font = `700 9px ${F.label}`; const tw = c.measureText(flag).width + 12; const wave = Math.sin(t * 3 + x * .05) * .9;
      c.fillStyle = C.cream; c.strokeStyle = C.ink; c.lineWidth = .9;
      const fy = -25 - lift, fh = 9.5, e = fx + flagSide * tw;
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(e, fy + wave); c.lineTo(e - flagSide * 3.5, fy + fh / 2 + wave); c.lineTo(e, fy + fh + wave); c.lineTo(fx, fy + fh); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = C.ink; c.textAlign = flagSide > 0 ? 'left' : 'right'; c.textBaseline = 'alphabetic'; c.fillText(flag, fx + flagSide * 2.4, fy + fh - 2.2 + wave * .5);
    }
    // pegs: the first three ride in the seats, the rest pile up behind them
    const slot = i => i < 3 ? [[-7, -6], [-1, -6], [5, -6]][i] : [[-4, -17], [2, -17], [-1, -28], [8, -16], [-10, -16]][Math.min(i - 3, 4)];
    pegs.forEach((p, i) => {
      const sc = p.s ?? 1; if (sc <= 0) return; const [px, py] = slot(i); const jig = Math.sin(t * 4 + i * 1.7) * .4;
      c.save(); c.translate(px, py + jig); c.scale(sc, sc); c.fillStyle = p.col; c.strokeStyle = C.ink; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(-3, 2); c.lineTo(-3, -6); c.arc(0, -7.5, 3.6, PI * .85, PI * .15); c.lineTo(3, 2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,247,228,.5)'; c.fillRect(-1.6, -8.5, 1.1, 7); c.restore();
    });
    // body: a rounded 1960s convertible, drawn over the pegs' feet
    c.fillStyle = body; c.strokeStyle = C.ink; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-22, 6); c.quadraticCurveTo(-23, -2, -15, -3); c.lineTo(-11, -3); c.quadraticCurveTo(-1, -1, 11, -3); c.lineTo(14, -3); c.quadraticCurveTo(22, -3, 22, 4); c.lineTo(22, 6); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,247,228,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-16, 1.5); c.lineTo(17, 1.5); c.stroke();
    c.fillStyle = C.cream; c.strokeStyle = C.ink; c.lineWidth = .9; c.beginPath(); c.moveTo(12, -3); c.lineTo(14.5, -8); c.lineTo(16, -3); c.closePath(); c.fill(); c.stroke(); // windscreen
    if (mic > 0) { // a microphone on a stand: the Glyp Podcasts pivot
      c.save(); c.translate(-17, -3); c.scale(mic, mic); c.strokeStyle = C.ink; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -10); c.stroke();
      c.fillStyle = C.ink; rrect(c, -3.2, -19, 6.4, 10, 3.2); c.fill(); c.fillStyle = C.cream; c.fillRect(-1.8, -16.6, 3.6, .9); c.fillRect(-1.8, -14.2, 3.6, .9); c.restore();
    }
    for (const wx of [-13, 13]) { c.fillStyle = C.ink; c.beginPath(); c.arc(wx, 6, 4.8, 0, TAU); c.fill(); c.fillStyle = '#B9B2A4'; c.beginPath(); c.arc(wx, 6, 1.9, 0, TAU); c.fill(); }
    c.restore();
  }

  function sectorLayout(flip) {
    const ws = SECTORS.map(s => s.w + (s.fw - s.w) * flip); const total = ws.reduce((a, b) => a + b, 0);
    let a = 0; return SECTORS.map((s, i) => { const span = ws[i] / total * TAU; const o = { ...s, a0: a, span }; a += span; return o; });
  }

  function drawSpinner(c, arrow, flip) {
    const S = L.spinner; const secs = sectorLayout(flip);
    c.save(); c.translate(S.x, S.y);
    secs.forEach(s => {
      const a0 = s.a0 - PI / 2, a1 = s.a0 + s.span - PI / 2;
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, S.r, a0, a1); c.closePath(); c.fillStyle = s.col; c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 1.4; c.stroke();
      // label along the radius, flipped on the left half so it never reads upside down
      const mid = s.a0 + s.span / 2 - PI / 2;
      const inner = S.r * .28, outer = S.r * .94;
      let fit = null;
      for (let size = L.phone ? 11 : 12.5; size >= (L.phone ? 7.5 : 8.5) && !fit; size -= .5) {
        c.font = `700 ${size}px ${F.label}`;
        for (const maxLines of [1, 2]) {
          const ls = maxLines === 1 ? [s.label.toUpperCase()] : lines(c, s.label.toUpperCase(), (outer - inner) * .8);
          if (ls.length > maxLines) continue;
          const textW = Math.max(...ls.map(l2 => c.measureText(l2).width));
          const blockH = size * 1.08 * ls.length + 2;
          const rStart = Math.max(inner, blockH / Math.max(.001, s.span) + 1);
          if (rStart + textW <= outer) { fit = { size, lines: ls, rStart }; break; }
        }
      }
      if (!fit) return;
      const rStart = fit.rStart;
      c.save(); c.rotate(mid); c.fillStyle = s.ink; c.textBaseline = 'middle';
      const left = Math.cos(mid) < -0.001;
      if (left) c.rotate(PI);
      const lh = fit.size * 1.05; const n = fit.lines.length;
      fit.lines.forEach((ln, i) => {
        const yy = (i - (n - 1) / 2) * lh;
        c.textAlign = left ? 'right' : 'left';
        if (left) c.fillText(ln, -rStart, yy); else c.fillText(ln, rStart, yy);
      });
      c.restore();
    });
    // rim with pegs at each boundary
    c.beginPath(); c.arc(0, 0, S.r, 0, TAU); c.strokeStyle = C.ink; c.lineWidth = 2.6; c.stroke();
    secs.forEach(s => { const a = s.a0 - PI / 2; c.fillStyle = C.cream; c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.arc(Math.cos(a) * (S.r - 4), Math.sin(a) * (S.r - 4), 2.6, 0, TAU); c.fill(); c.stroke(); });
    // the pointer, cut from red plastic, on a brass rivet
    c.save(); c.rotate(arrow);
    c.fillStyle = 'rgba(40,26,8,.28)'; c.beginPath(); c.moveTo(3, 5); c.lineTo(9, -S.r * .82 + 6); c.lineTo(-3, -S.r * .82 + 6); c.closePath(); c.fill();
    c.fillStyle = C.red; c.strokeStyle = C.ink; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(0, -S.r * .86); c.lineTo(7.5, -S.r * .62); c.lineTo(4.4, -S.r * .62); c.lineTo(4.8, S.r * .2); c.quadraticCurveTo(0, S.r * .3, -4.8, S.r * .2); c.lineTo(-4.4, -S.r * .62); c.lineTo(-7.5, -S.r * .62); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,247,228,.45)'; c.fillRect(-1.2, -S.r * .58, 1.6, S.r * .7);
    c.restore();
    c.fillStyle = C.mustard; c.strokeStyle = C.ink; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,247,228,.7)'; c.beginPath(); c.arc(-2.4, -2.4, 2.2, 0, TAU); c.fill();
    c.restore();
  }

  function cardBack(c, w, h) {
    rrect(c, -w / 2, -h / 2, w, h, 7); c.fillStyle = C.navy; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 1.4; c.stroke();
    rrect(c, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 5); c.strokeStyle = C.mustard; c.lineWidth = 1.2; c.stroke();
    starburst(c, 0, 0, Math.min(w, h) * .3, 8, C.mustard, .2);
    starburst(c, 0, 0, Math.min(w, h) * .14, 8, C.red, 0);
  }
  function cardFace(c, id, w, h) {
    const cd = CARDS[id]; const S = L.cardScale;
    rrect(c, -w / 2, -h / 2, w, h, 10); c.fillStyle = C.paper; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 1.6; c.stroke();
    rrect(c, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 6); c.strokeStyle = cd.col; c.lineWidth = 5; c.stroke();
    // header band
    c.save(); rrect(c, -w / 2 + 7, -h / 2 + 7, w - 14, 40 * S, 6); c.clip(); c.fillStyle = cd.col; c.fillRect(-w / 2, -h / 2, w, 60); c.restore();
    c.fillStyle = C.cream; c.font = `400 ${24 * S}px ${F.title}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText(cd.kind, 0, -h / 2 + 7 + 30 * S);
    starburst(c, -w / 2 + 28, -h / 2 + 27 * S, 8 * S, 8, C.cream, 0); starburst(c, w / 2 - 28, -h / 2 + 27 * S, 8 * S, 8, C.cream, .3);
    // main line and the essay's sentence
    let y = -h / 2 + 7 + 40 * S + 12;
    const main = fitLabel(c, cd.main, w - 44, 2, (cd.main.length < 16 ? 26 : 20) * S, 14, 700, F.card, false);
    c.fillStyle = C.ink; main.lines.forEach((ln, i) => { c.font = `700 ${main.size}px ${F.card}`; c.fillText(ln, 0, y + main.size * .9 + i * main.size * 1.12); });
    y += main.lines.length * main.size * 1.12 + 8;
    c.font = `500 ${13.5 * S}px ${F.card}`; c.fillStyle = '#4A4038';
    lines(c, cd.sub, w - 52).forEach((ln, i) => c.fillText(ln, 0, y + 13 * S + i * 16.5 * S));
    // instruction at the foot
    c.font = `700 ${12.5 * S}px ${F.label}`; c.fillStyle = cd.col; spaced(c, cd.foot.toUpperCase(), 0, h / 2 - 16, 1.4, 'center');
  }

  // ---------- the timeline: actions with start times ----------
  // Every visible change is an action. Autoplay schedules the whole game ahead; a reader's spin
  // schedules one turn. The screen at time `now` is the replay of every action that has begun.
  let actions = [];
  let plan = null; // where the game will be once every scheduled action has finished
  let autoplay = false, autoplayStarted = false;
  const turnsMeta = []; // [{t0, end, plan, status}]
  function freshPlan() { return { loc: 'start', arrow: 2.6, comps: 0, turn: 0, pegs: 0, phase: 'play', busyUntil: 0, deck: 0, flip: 0, mic: false }; }

  const LESSON_DOCK = REDUCED ? 0 : 4.2;
  const D = { spin: 2.3, hop: .27, fast: .13, slide: .7, comps: .6, peg: .36, cardIn: .5, cardOut: .45, flip: 1.7 };
  function dur(x) { return REDUCED ? .001 : x; }

  function pathTo(plan, key) { // forward round the loop to the square named `key`
    const pts = [];
    let i;
    if (plan.loc === 'start') {
      pts.push({ road: true, pts: L.glypRoad.map(([x, y]) => ({ x, y })) });
      i = L.entry; pts.push({ loc: 'r' + i });
    } else if (plan.loc[0] === 'r') i = +plan.loc.slice(1);
    else i = L.exit;
    const target = ringIndex(key);
    let guard = 0;
    while (i !== target && guard++ < 16) { i = (i + 1) % 8; pts.push({ loc: 'r' + i }); }
    return { steps: pts, end: 'r' + target };
  }

  function scheduleTurn(t0, holdCard) {
    const p = plan; const n = p.turn; const step = SCRIPT[n];
    if (!step) return null;
    const out = []; let t = t0; let status = '';
    const spinNo = n + 1;
    if (step.pivot) {
      // the pivot: draw the card, put a microphone on the car, go round the loop once more
      const cid = DECK[p.deck];
      out.push({ type: 'card', id: cid, t0: t, inD: dur(D.cardIn), hold: holdCard, outD: dur(D.cardOut), deckIdx: p.deck }); p.deck++;
      t += dur(D.cardIn) + Math.min(holdCard, 1.4);
      out.push({ type: 'mic', t0: t, d: dur(.5) }); p.mic = true;
      const loopSteps = []; let i = +p.loc.slice(1); for (let k = 0; k < 8; k++) { i = (i + 1) % 8; loopSteps.push({ loc: 'r' + i }); }
      out.push(mv(t + dur(.3), loopSteps, p.loc, dur(D.fast))); t += dur(.3) + loopSteps.length * dur(D.fast);
      t = Math.max(t, t0 + dur(D.cardIn) + holdCard + dur(D.cardOut));
      // then the lesson, which stays on the table
      const lid = DECK[p.deck];
      out.push({ type: 'card', id: lid, t0: t + dur(.4), inD: dur(D.cardIn), hold: Infinity, outD: dur(D.cardOut), deckIdx: p.deck, lesson: true }); p.deck++;
      t += dur(.4) + dur(D.cardIn);
      p.phase = 'end';
      status = 'Pivot: Glyp Podcasts. Same fundamental problems, and once more round the loop. Lesson card: distribution matters way more than features.';
      out.forEach(a => { a.turn = n; });
      p.turn++; p.busyUntil = t;
      return { actions: out, end: t, status };
    }
    // 1. spin
    const secs = sectorLayout(0); const sec = secs.find(s => s.key === step.sector);
    const r = rng(101 + n * 17)();
    const target = sec.a0 + sec.span * (.32 + r * .36);
    const cur = ((p.arrow % TAU) + TAU) % TAU; let delta = (target - cur + TAU) % TAU; if (delta < .5) delta += TAU;
    const to = p.arrow + TAU * 3 + delta;
    out.push({ type: 'spin', t0: t, d: dur(D.spin), from: p.arrow, to }); p.arrow = to;
    t += dur(D.spin) + dur(.15);
    // 2. competitors drive one square down the Niche Lane, every spin, no matter what Glyp does
    out.push({ type: 'comps', t0: t, d: dur(D.comps), from: p.comps, to: step.comps }); const compsTo = step.comps;
    // 3. Glyp moves
    const SQ = s => RING[ringIndex(s)].label;
    if (step.sector === 'dist') {
      const pt = pathTo(p, RING[L.exit].key); const steps = [...pt.steps, { loc: 'd0' }];
      out.push(mv(t, steps, p.loc, dur(D.hop))); t += moveDur(steps);
      p.loc = 'd0';
      const cid = DECK[p.deck];
      out.push({ type: 'card', id: cid, t0: t + dur(.1), inD: dur(D.cardIn), hold: holdCard, outD: dur(D.cardOut), deckIdx: p.deck }); p.deck++;
      t += dur(.1) + dur(D.cardIn) + Math.min(holdCard, 2.2);
      out.push(mv(t, [{ loc: 'r' + L.exit }], 'd0', dur(D.hop))); p.loc = 'r' + L.exit; t += dur(D.hop);
      t = Math.max(t, out[out.length - 2].t0 + dur(D.cardIn) + holdCard + dur(D.cardOut));
      status = `Spin ${spinNo}: the sliver of distribution! Glyp heads for the readers and draws Chance: wrong medium, wrong form factor. Back to the loop. Sudowrite and Jenni AI move to ${LANE[compsTo - 1].label}.`;
    } else {
      const pt = pathTo(p, step.sector);
      out.push(mv(t, pt.steps, p.loc, dur(D.hop))); t += moveDur(pt.steps); p.loc = pt.end;
      if (!step.card || step.card === 'established') {
        out.push({ type: 'peg', t0: t, d: dur(D.peg), col: RING[ringIndex(step.sector)].col, idx: p.pegs }); p.pegs++; t += dur(D.peg);
      }
      if (step.card === 'conviction') {
        const cid = DECK[p.deck];
        out.push({ type: 'card', id: cid, t0: t + dur(.1), inD: dur(D.cardIn), hold: holdCard, outD: dur(D.cardOut), deckIdx: p.deck }); p.deck++;
        const tc = t + dur(.1) + dur(D.cardIn) + Math.min(holdCard, 2.2);
        let i = +p.loc.slice(1); const back = []; for (let k = 0; k < step.back; k++) { i = (i + 7) % 8; back.push({ loc: 'r' + i }); }
        out.push(mv(tc, back, p.loc, dur(D.hop))); p.loc = 'r' + i;
        t = Math.max(tc + back.length * dur(D.hop), t + dur(.1) + dur(D.cardIn) + holdCard + dur(D.cardOut));
        status = `Spin ${spinNo}: ${SQ(step.sector)}. Chance: no real conviction, no committed path forward. Back 2 spaces. Sudowrite and Jenni AI move to ${LANE[compsTo - 1].label}.`;
      } else if (step.card === 'established') {
        const cid = DECK[p.deck];
        const tc = Math.max(t, out.find(a => a.type === 'comps' && a.t0 >= t0).t0 + dur(D.comps)) + dur(.15);
        out.push({ type: 'card', id: cid, t0: tc, inD: dur(D.cardIn), hold: holdCard, outD: dur(D.cardOut), deckIdx: p.deck }); p.deck++;
        t = tc + dur(D.cardIn) + holdCard + dur(D.cardOut);
        status = `Spin ${spinNo}: ${SQ(step.sector)}, one more feature. Sudowrite and Jenni AI reach the readers. Chance: competitors had already established themselves.`;
      } else {
        status = `Spin ${spinNo}: Glyp lands on ${SQ(step.sector)} and adds a feature. Sudowrite and Jenni AI move to ${LANE[compsTo - 1].label}.`;
      }
    }
    p.comps = compsTo;
    t = Math.max(t, out.find(a => a.type === 'comps').t0 + dur(D.comps));
    out.forEach(a => { a.turn = n; });
    p.turn++; p.busyUntil = t;
    return { actions: out, end: t, status };
  }
  function moveDur(steps) { return steps.reduce((s, st) => s + (st.road ? dur(D.slide) : dur(D.hop)), 0); }
  function mv(t0, steps, from, per) { const total = steps.reduce((s, st) => s + (st.road ? dur(D.slide) : per), 0) || .001; return { type: 'move', t0, steps, from, per, total, slide: dur(D.slide) }; }

  function startAutoplay(base) {
    autoplay = true; autoplayStarted = true;
    let t = base + .6;
    while (plan.phase === 'play') {
      const res = scheduleTurn(t, 3.2); if (!res) break;
      actions.push(...res.actions); turnsMeta.push({ idx: turnsMeta.length, t0: t, end: res.end, plan: { ...plan }, status: res.status });
      t = res.end + .9;
    }
  }
  function cancelFutureAutoplay(now) {
    if (!autoplay) return;
    autoplay = false;
    const started = turnsMeta.filter(m => m.t0 <= now);
    const cur = started[started.length - 1];
    if (!cur) { actions = []; turnsMeta.length = 0; plan = freshPlan(); return; }
    actions = actions.filter(a => a.turn <= cur.idx);
    turnsMeta.length = started.length;
    plan = { ...cur.plan };
  }
  function userSpin(now) {
    cancelFutureAutoplay(now);
    if (plan.phase !== 'play') return;
    if (REDUCED) closeOpenCards(now);
    const t0 = Math.max(now, plan.busyUntil);
    const res = scheduleTurn(t0, REDUCED ? 1e9 : 2.8); if (!res) return;
    actions.push(...res.actions); turnsMeta.push({ idx: turnsMeta.length, t0, end: res.end, plan: { ...plan }, status: res.status });
  }
  function closeOpenCards(now) { for (const a of actions) if (a.type === 'card' && !a.lesson && a.hold > 1e8) a.hold = Math.max(0, now - a.t0 - a.inD); }
  function userFlip(now) {
    if (plan.phase !== 'end' || autoplay && now < plan.busyUntil) return;
    for (const a of actions) if (a.lesson && a.dockAt === undefined) a.dockAt = Math.max(0, Math.min(LESSON_DOCK, now - a.t0 - a.inD));
    const to = plan.flip ? 0 : 1;
    actions.push({ type: 'flip', t0: Math.max(now, plan.busyUntil), d: dur(D.flip), from: plan.flip, to });
    plan.flip = to;
  }
  function reset() {
    autoplay = false; actions = []; turnsMeta.length = 0; plan = freshPlan(); lastStatus = '';
  }

  // ---------- replay: the state of the board at time `now` ----------
  function stateAt(now) {
    const s = { glyp: { loc: 'start', anim: null }, pegs: [], mic: 0, comps: 0, compAnim: null, arrow: 2.6, cards: [], drawn: 0, discard: [], flip: 0, lesson: false };
    for (const a of actions) {
      if (now < a.t0) continue;
      const el = now - a.t0;
      switch (a.type) {
        case 'spin': { const p = clamp(el / a.d); let v = lerp(a.from, a.to, easeOut(p)); if (p > .82 && p < 1) v += .05 * Math.sin((p - .82) / .18 * PI * 2) * (1 - p) / .18; s.arrow = v; break; }
        case 'move': { const p = clamp(el / a.total); if (p >= 1) { s.glyp.loc = a.steps[a.steps.length - 1].loc || s.glyp.loc; s.glyp.anim = null; } else s.glyp.anim = { from: a.from, steps: a.steps, p, total: a.total, per: a.per, slide: a.slide }; break; }
        case 'comps': { const p = clamp(el / a.d); if (p >= 1) { s.comps = a.to; s.compAnim = null; } else s.compAnim = { from: a.from, to: a.to, p }; break; }
        case 'peg': { const p = clamp(el / a.d); s.pegs[a.idx] = { col: a.col, s: p >= 1 ? 1 : easeOutBack(p) }; break; }
        case 'mic': s.mic = clamp(el / a.d); break;
        case 'flip': s.flip = lerp(a.from, a.to, easeInOut(clamp(el / a.d))); break;
        case 'card': {
          s.drawn = Math.max(s.drawn, a.deckIdx + 1);
          const end = a.inD + a.hold + a.outD;
          if (el >= end) s.discard.push(a.id);
          else s.cards.push({ id: a.id, el, a });
          if (a.lesson) s.lesson = true;
          break;
        }
      }
    }
    return s;
  }
  function easeOutBack(t) { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  function glypPos(st) {
    const a = st.glyp.anim;
    if (!a) return carSpot(st.glyp.loc, 'glyp');
    // walk the steps: road slides are continuous, squares are hops
    let elapsed = a.p * a.total; let prev = carSpot(a.from, 'glyp');
    for (const step of a.steps) {
      const d = step.road ? a.slide : a.per;
      if (step.road) {
        const pts = step.pts; const segs = []; let tot = 0;
        for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); segs.push(l); tot += l; }
        if (elapsed <= d) {
          let dist = easeInOut(elapsed / d) * tot; for (let i = 0; i < segs.length; i++) { if (dist <= segs[i]) { const f = dist / segs[i]; return { x: lerp(pts[i].x, pts[i + 1].x, f), y: lerp(pts[i].y, pts[i + 1].y, f) - 4, tilt: 0 }; } dist -= segs[i]; }
          return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y - 4 };
        }
        elapsed -= d; prev = { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y - 4 }; continue;
      }
      const to = carSpot(step.loc, 'glyp');
      if (elapsed <= d) { const f = easeInOut(elapsed / d); return { x: lerp(prev.x, to.x, f), y: lerp(prev.y, to.y, f) - Math.sin(f * PI) * (L.phone ? 10 : 14), hop: true }; }
      elapsed -= d; prev = to;
    }
    return prev;
  }
  function compLoc(i) { return i <= 0 ? 'start' : i >= 6 ? 'finish' : 'n' + (i - 1); }
  function compPos(st, who) {
    const a = st.compAnim;
    if (!a) return carSpot(compLoc(st.comps), who);
    const delay = who === 'jenni' ? .12 : 0; const f = easeInOut(clamp((a.p - delay) / (1 - .12)));
    const A = carSpot(compLoc(a.from), who), B = carSpot(compLoc(a.to), who);
    return { x: lerp(A.x, B.x, f), y: lerp(A.y, B.y, f) - Math.sin(f * PI) * (L.phone ? 9 : 12) };
  }

  // ---------- drawing a frame ----------
  let cssW = 0, dprUsed = 1;
  function resize() {
    const w = Math.max(280, wrap.clientWidth);
    const phone = w < 640;
    if (phone !== L.phone || !cssW) L = makeLayout(phone);
    cssW = w; dprUsed = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = w + 'px'; canvas.style.height = (w * L.H / L.W) + 'px';
    canvas.width = Math.round(w * dprUsed); canvas.height = Math.round(w * L.H / L.W * dprUsed);
    staticLayer = null;
    canvas.setAttribute('aria-label', describe());
  }
  function describe() {
    return 'A 1960s-style board game, The Startup Game, 2023 edition, a sketch of the essay. Glyp is a little open-top car on a circular track called the Feature Loop, whose squares read Share, Edit, Collaborate, Readers as participants, Building for the web, Tweak features, A new angle and Second-guess the core. Every feature it lands on adds a peg to the car. Sudowrite and Jenni AI drive straight down the Niche Lane: Pick a niche, Getting users, Growing users, Keeping users, Making money, then Readers. Glyp’s spinner is almost all features, with a thin sliver labelled Distribution, and a dashed, never-printed Distribution road leads from the loop to the readers.';
  }

  let lastStatus = '';
  function render(now) {
    if (!staticLayer || staticKey !== `${cssW}|${dprUsed}|${L.phone}`) { staticLayer = buildStatic(dprUsed, cssW); staticKey = `${cssW}|${dprUsed}|${L.phone}`; }
    const k = cssW / L.W * dprUsed;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(staticLayer, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const st = stateAt(now);

    // the distribution road, printed only when the spinner is flipped
    if (st.flip > 0) drawPrintedRoad(st.flip);
    drawSpinner(ctx, st.arrow, st.flip, now);
    // card piles
    drawPile(L.deck, DECK.length - st.drawn, false);
    drawPile(L.discard, st.discard.length, true, st.discard[st.discard.length - 1]);
    // cars: the competitors first, then Glyp on top
    const sp = compPos(st, 'sudo'), jp = compPos(st, 'jenni');
    const cs = L.car * .92, [sd, jd, jl] = flagSides(sp, jp, cs);
    drawCar(ctx, sp.x, sp.y, cs, C.teal, [{ col: C.navy }], 'SUDOWRITE', 0, now, sd);
    drawCar(ctx, jp.x, jp.y, cs, C.sky, [{ col: C.navy }], 'JENNI AI', 0, now, jd, jl);
    const gp = glypPos(st);
    drawCar(ctx, gp.x, gp.y, L.car, C.tang, st.pegs.filter(Boolean), 'GLYP', st.mic, now, 1);
    // the card in play
    for (const cd of st.cards) drawCardInPlay(cd, now);
    updateStatus(now, st);
    updateButtons(now, st);
  }

  function flagSides(sp, jp, cs) {
    const k = cs / 44, fx0 = L.board[0] + L.edge + 2, fx1 = L.board[2] - L.edge - 2;
    ctx.font = `700 9px ${F.label}`;
    const reach = name => (15 + ctx.measureText(name).width + 12) * k;
    let sd = -1, jd = 1;
    if (sp.x - reach('SUDOWRITE') < fx0) sd = 1;
    if (jp.x + reach('JENNI AI') > fx1) jd = -1;
    const lift = sd === jd && Math.abs(sp.x - jp.x) < 90 ? 12 : 0;
    return [sd, jd, lift];
  }
  function drawPrintedRoad(f) {
    const pts = distPoints();
    let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    const want = tot * clamp(f * 1.15);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...pts[0]); let acc = 0;
    for (let i = 1; i < pts.length; i++) { if (acc + seg[i - 1] <= want) { ctx.lineTo(...pts[i]); acc += seg[i - 1]; } else { const r = (want - acc) / seg[i - 1]; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], r), lerp(pts[i - 1][1], pts[i][1], r)); break; } }
    const w = L.phone ? 24 : 32;
    ctx.strokeStyle = C.ink; ctx.lineWidth = w + 4; ctx.stroke(); ctx.strokeStyle = C.green; ctx.lineWidth = w; ctx.stroke();
    ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(255,247,228,.8)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    L.dist.forEach((d, i) => {
      if (d.chance) return; const reveal = clamp((f - .25 - i * .2) / .35); if (reveal <= 0) return;
      ctx.save(); ctx.globalAlpha = reveal; drawSquare(ctx, d.x, d.y, L.ring.w, L.ring.h, C.green, C.cream, 'Distribution', 'mega', { maxLines: 1, icon: L.phone ? 13 : L.icon }); ctx.restore();
    });
    // re-stamp the exit and chance squares over the road so the road reads beneath them
    { const e = RING[L.exit], ep = ringPos(L.exit); drawSquare(ctx, ep.x, ep.y, L.ring.w, L.ring.h, e.col, e.ink, e.label, e.icon, { maxLines: L.phone ? 3 : 2, icon: L.phone ? 13 : L.icon }); }
    const ch = L.dist[0]; drawSquare(ctx, ch.x, ch.y, L.ring.w, L.ring.h, C.cream, C.red, 'Wrong medium', 'phone', { icon: L.phone ? 13 : L.icon });
    if (L.phone && f > .6) { ctx.save(); ctx.globalAlpha = clamp((f - .6) / .3); ctx.fillStyle = C.green; ctx.font = `700 11px ${F.label}`; spaced(ctx, 'DISTRIBUTION', L.dist[0].x - 26, L.dist[0].y - L.ring.h / 2 - 12, 1.2, 'center'); ctx.restore(); }
  }

  function drawPile(p, count, faceUp, topId) {
    if (count <= 0) return;
    const w = L.deck.w, h = L.deck.h;
    for (let i = 0; i < Math.min(count, 5); i++) {
      ctx.save(); ctx.translate(p.x - i * .8, p.y - i * 1.3); ctx.rotate((i % 2 ? -1 : 1) * .02 + (faceUp ? .05 : 0));
      ctx.shadowColor = 'rgba(40,26,8,.25)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1.5;
      if (faceUp && i === Math.min(count, 5) - 1 && topId) { ctx.shadowColor = 'transparent'; miniFace(topId, w, h); }
      else if (faceUp) { rrect(ctx, -w / 2, -h / 2, w, h, 4); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke(); }
      else { ctx.scale(w / 200, h / 130); cardBack(ctx, 200, 130); }
      ctx.restore();
    }
  }
  function miniFace(id, w, h) {
    const cd = CARDS[id];
    rrect(ctx, -w / 2, -h / 2, w, h, 4); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); rrect(ctx, -w / 2 + 2, -h / 2 + 2, w - 4, h * .32, 3); ctx.clip(); ctx.fillStyle = cd.col; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.fillStyle = C.cream; ctx.font = `400 ${h * .22}px ${F.title}`; ctx.textAlign = 'center'; ctx.fillText(cd.kind, 0, -h / 2 + h * .27);
    ctx.fillStyle = 'rgba(42,34,29,.5)'; for (let i = 0; i < 3; i++) ctx.fillRect(-w * .32, -h * .02 + i * h * .14, w * .64 - i * w * .12, h * .05);
  }

  function drawCardInPlay(cd) {
    const { el, a } = cd; const W = L.card.w, H = L.card.h;
    const at = (L.cardAt && L.cardAt[a.id]) || [L.card.x, L.card.y];
    const from = { x: L.deck.x, y: L.deck.y, s: L.deck.w / W }, mid = { x: at[0], y: at[1], s: 1 }, to = { x: L.discard.x, y: L.discard.y, s: L.deck.w / W };
    let x, y, sc, face, rot = 0, dim = 0;
    if (el < a.inD) { const f = easeOut(el / a.inD); x = lerp(from.x, mid.x, f); y = lerp(from.y, mid.y, f) - Math.sin(f * PI) * 30; sc = lerp(from.s, 1, f); face = f > .5; rot = (1 - f) * -.25; dim = f; }
    else if (a.lesson && el >= a.inD + (a.dockAt ?? LESSON_DOCK)) { const f = REDUCED ? 1 : easeInOut(clamp((el - a.inD - (a.dockAt ?? LESSON_DOCK)) / .9)); const dk = L.dock; x = lerp(mid.x, dk.x, f); y = lerp(mid.y, dk.y, f); sc = lerp(1, dk.s, f); face = true; rot = lerp(0, dk.rot, f); dim = 1 - f; }
    else if (el < a.inD + a.hold) { x = mid.x; y = mid.y + Math.sin((el - a.inD) * 1.4) * 1.2; sc = 1; face = true; dim = 1; rot = Math.sin((el - a.inD) * .9) * .006; }
    else { const f = easeInOut((el - a.inD - a.hold) / a.outD); x = lerp(mid.x, to.x, f); y = lerp(mid.y, to.y, f); sc = lerp(1, to.s, f); face = true; rot = f * .05; dim = 1 - f; }
    if (dim > 0) { ctx.save(); ctx.fillStyle = `rgba(30,24,40,${.16 * dim})`; ctx.fillRect(L.board[0] + L.edge, L.board[1] + L.edge, L.board[2] - L.board[0] - 2 * L.edge, L.board[3] - L.board[1] - 2 * L.edge); ctx.restore(); }
    // the flip: squash horizontally through the middle of the flight
    let sx = 1; if (el < a.inD) { const f = el / a.inD; sx = Math.abs(Math.cos(f * PI)); if (sx < .04) sx = .04; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc * sx, sc);
    ctx.shadowColor = 'rgba(30,20,6,.35)'; ctx.shadowBlur = 22 * sc; ctx.shadowOffsetY = 10 * sc;
    if (face) { ctx.fillStyle = C.paper; rrect(ctx, -W / 2, -H / 2, W, H, 10); ctx.fill(); ctx.shadowColor = 'transparent'; cardFace(ctx, a.id, W, H); }
    else { cardBack(ctx, W, H); }
    ctx.restore();
  }

  function updateStatus(now, st) {
    let msg;
    const done = turnsMeta.filter(m => m.end <= now + .05);
    const inPlay = turnsMeta.find(m => m.t0 <= now && m.end > now + .05);
    if (autoplay && !done.length) msg = 'Playing fall 2023 through: spin, move, draw a card. Press Spin to take over.';
    else if (inPlay && !autoplay) msg = SCRIPT[inPlay.idx] && SCRIPT[inPlay.idx].pivot ? 'Pivoting to Glyp Podcasts…' : `Spin ${inPlay.idx + 1}: spinning…`;
    else if (done.length) msg = done[done.length - 1].status;
    else msg = 'Your turn, Glyp. Press Spin, or tap the spinner.';
    if (plan.phase === 'end' && st.flip > .99) msg = 'Flipped: most of the spinner is distribution now, and the road to the readers is printed. Still a sketch, not data.';
    if (msg !== lastStatus) { lastStatus = msg; statusEl.textContent = msg; }
  }
  let btnState = '';
  function updateButtons(now, st) {
    const busy = now < plan.busyUntil - .01;
    let spinLabel, spinOff;
    if (autoplay) {
      // while the demo plays, Spin takes over, until the last turn (the pivot) has begun
      const started = turnsMeta.filter(m => m.t0 <= now);
      const cur = started[started.length - 1];
      spinLabel = 'Spin'; spinOff = !!(cur && SCRIPT[cur.idx] && SCRIPT[cur.idx].pivot);
    } else {
      const next = SCRIPT[plan.turn];
      spinLabel = next && next.pivot ? 'Pivot to Glyp Podcasts' : 'Spin';
      spinOff = plan.phase !== 'play' || busy;
    }
    const flipOff = !(plan.phase === 'end' && st.lesson && !busy);
    const flipLabel = plan.flip ? 'Flip it back' : 'Flip the spinner';
    const key = `${spinLabel}|${spinOff}|${flipOff}|${flipLabel}`;
    if (key === btnState) return; btnState = key;
    btnSpin.textContent = spinLabel; btnSpin.setAttribute('aria-disabled', spinOff ? 'true' : 'false');
    btnFlip.textContent = flipLabel; btnFlip.setAttribute('aria-disabled', flipOff ? 'true' : 'false');
  }

  // ---------- running ----------
  let visible = false, running = false, raf = 0, clock0 = performance.now();
  const now = () => (performance.now() - clock0) / 1000;
  function frame() { raf = 0; if (!running) return; render(now()); raf = requestAnimationFrame(frame); }
  function start() { if (disposed || running || T_PARAM !== null) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function kick() { if (!running) render(now()); }

  const off = b => b.getAttribute('aria-disabled') === 'true';
  const trySpin = () => { if (off(btnSpin)) return false; userSpin(now()); kick(); return true; };
  const tryFlip = () => { if (off(btnFlip)) return false; userFlip(now()); kick(); return true; };
  on(btnSpin, 'click', trySpin);
  on(btnFlip, 'click', tryFlip);
  on(btnReset, 'click', () => { reset(now()); kick(); });
  on(canvas, 'click', e => {
    const r = canvas.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * L.W, y = (e.clientY - r.top) / r.height * L.H;
    if (Math.hypot(x - L.spinner.x, y - L.spinner.y) <= L.spinner.r + 8) { if (!trySpin()) tryFlip(); }
  });
  on(canvas, 'pointermove', e => {
    const r = canvas.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * L.W, y = (e.clientY - r.top) / r.height * L.H;
    canvas.style.cursor = Math.hypot(x - L.spinner.x, y - L.spinner.y) <= L.spinner.r + 8 ? 'pointer' : 'default';
  });

  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      visible = en.isIntersecting;
      if (visible && !document.hidden) {
        if (!autoplayStarted && !REDUCED && plan.turn === 0 && !actions.length) startAutoplay(now());
        start();
      } else stop();
    }
  }, { threshold: .35 });
  on(document, 'visibilitychange', () => {
    if (document.hidden) { stop(); pausedAt = performance.now(); }
    else { if (pausedAt) { clock0 += performance.now() - pausedAt; pausedAt = 0; } if (visible) start(); }
  });
  let pausedAt = 0;
  let rT = 0;
  on(window, 'resize', () => { clearTimeout(rT); rT = setTimeout(() => { resize(); kick(); }, 120); });

  async function init() {
    try {
      await Promise.all([`400 30px ${F.title}`, `700 13px ${F.label}`, `500 13px ${F.label}`, `700 18px ${F.card}`, `500 13px ${F.card}`].map(f => document.fonts.load(f)));
    } catch (e) { /* fall back to the stacks */ }
    if (disposed) return;
    plan = freshPlan();
    resize();
    if (T_PARAM !== null) {
      // a frozen frame of the autoplayed game, for review
      startAutoplay(0);
      const flipAt = params.has('flip') ? parseFloat(params.get('flip')) : null;
      if (flipAt !== null) { actions.push({ type: 'flip', t0: flipAt, d: D.flip, from: 0, to: 1 }); plan.flip = 1; }
      render(T_PARAM);
      window.__ready = true;
      return;
    }
    if (REDUCED) {
      // no autoplay: open on the finished game, with every spin resolved and the lesson on the table
      while (plan.phase === 'play') { const res = scheduleTurn(0, 0); if (!res) break; actions.push(...res.actions); turnsMeta.push({ idx: turnsMeta.length, t0: 0, end: res.end, plan: { ...plan }, status: res.status }); }
      for (const a of actions) if (a.type === 'card' && !a.lesson) a.hold = 0;
      render(1);
    } else render(0);
    io.observe(canvas);
  }
  init();
  return () => { disposed = true; ac.abort(); io.disconnect(); stop(); clearTimeout(rT); };
}
