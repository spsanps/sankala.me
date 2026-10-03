// "Features or distribution" — the StartR post-mortem's figure, drawn in code.
// Glyp is pencil: each feature is a kraft tag the pencil spikes onto a wobbling tower.
// The competitors are letterpress ink: one printed stretch of road to readers per feature.
// Every word in the figure comes from the essay. Hooks: ?t=<seconds> freezes the autoplay.
(() => {
  'use strict';
  const canvas = document.getElementById('features-canvas');
  if (!canvas) return;
  const mainCtx = canvas.getContext('2d');
  let ctx = mainCtx; // drawing functions use ctx; static layers swap it briefly
  const statusEl = document.getElementById('features-status');
  const btnFeature = document.getElementById('btn-feature');
  const btnPivot = document.getElementById('btn-pivot');
  const btnReset = document.getElementById('btn-reset');

  const params = new URLSearchParams(location.search);
  const FREEZE = params.has('t') ? (parseFloat(params.get('t')) || 0) : null;
  const RM = FREEZE === null && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- content
  const C = {
    paper: '#F4EDDC', ruleLine: 'rgba(116,150,192,.40)', margin: 'rgba(205,108,94,.55)',
    kraft: '#DACBAA', kraftEdge: 'rgba(120,96,58,.55)', ink: '#1F1C19', red: '#BD3527',
    pencil: '#3D78B8', graphite: '#3E434E', spike: '#55524C', wood: '#E8C68F', woodDark: '#C9A06A',
    eraser: '#E39089', ferrule: '#B5AFA2',
  };
  const FEATURES = ['share', 'edit', 'collaborate', 'readers as participants', 'tweak features', 'a new angle', 'second-guess the core'];
  const EXTRA = ['another tweak', 'one more angle'];
  const LABELS = FEATURES.concat(EXTRA);
  const MAX_FEATURES = LABELS.length;
  const GUESS = 6; // "second-guess the core": the pencil scribbles over the GLYP block
  const ROAD_STEPS = FEATURES.length;
  const MILESTONES = ['GETTING USERS', 'GROWING USERS', 'KEEPING USERS', 'MAKING MONEY'];
  const MS_AT = [.24, .48, .72, .955];

  // timing (seconds)
  const T = { travel: .45, drop0: .12, drop: .45, write0: .45, write: .8, road0: .35, road: 1.05, scrub: .7, pivot: 2.0, finaleText: 3.0, finalePath: 1.7 };
  const AUTO = (() => {
    const ev = FEATURES.map((_, i) => ({ type: 'feature', i, s: 1.0 + i * 1.9 }));
    ev.push({ type: 'pivot', s: 15.2 });
    ev.push({ type: 'finale', s: 17.8 });
    return ev;
  })();
  const CYCLE = 30;

  // ---------------------------------------------------------------- layouts (design units)
  const LAYOUTS = {
    wide: {
      W: 960, H: 600, margin: 58, rule0: 50, ruleGap: 28,
      date: [930, 38, 19], sketch: [930, 586, 17],
      compLabel: [86, 64, 24], compNote: [88, 93, 21],
      road: { x0: 86, x1: 800, y: 124, label: 11.5, twoLine: false },
      readers: { cx: 884, cy: 214, k: 1, label: [884, 304, 21], labelAlign: 'center' },
      tower: { cx: 262, base: 560, boxW: 142, boxH: 58, gap: 31, tagH: 27, font: 21, glyp: 44, offK: 1 },
      micOff: [58, -18], pencilLen: 150,
      idle: [392, 482],
      path: [[342, 556], [590, 600], [840, 556], [884, 322]], pathLabel: [556, 554, 21],
      stamp: { x: 640, y: 346, size: 27, rot: -.06, lines: ['SAME FUNDAMENTAL PROBLEMS'] },
      finale: { size: 29, rot: -.025, lines: [[520, 462, 'distribution matters'], [540, 498, 'way more than features']] },
    },
    tall: {
      W: 380, H: 724, margin: 24, rule0: 40, ruleGap: 26, oneSide: true,
      date: [366, 24, 16], sketch: [366, 44, 14],
      compLabel: [36, 70, 16], compNote: [37, 90, 16],
      road: { x0: 36, x1: 286, y: 116, label: 8.6, twoLine: true },
      readers: { cx: 330, cy: 186, k: .78, label: [330, 266, 16], labelAlign: 'center' },
      tower: { cx: 72, base: 700, boxW: 100, boxH: 46, gap: 27, tagH: 23, font: 17, glyp: 33, offK: .7 },
      micOff: [50, -12], pencilLen: 104,
      idle: [272, 548],
      path: [[124, 696], [256, 728], [368, 650], [348, 286]], pathLabel: [200, 690, 16],
      stamp: { x: 130, y: 212, size: 19, rot: -.05, lines: ['SAME FUNDAMENTAL', 'PROBLEMS'] },
      finale: { size: 20, rot: -.03, lines: [[38, 272, 'distribution matters'], [38, 298, 'way more'], [38, 324, 'than features']] },
    },
  };

  // ---------------------------------------------------------------- helpers
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const easeOut = t => 1 - (1 - t) * (1 - t);
  const smooth = (a, b, x) => ease(clamp((x - a) / (b - a)));
  function prog(now, s, a, d) { if (now < s) return 0; return RM ? 1 : clamp((now - s - a) / d); }
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const bez = (p, t) => { const u = 1 - t; return [u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0], u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1]]; };
  const rot = (x, y, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };

  // ---------------------------------------------------------------- canvas, patterns, paper
  let L = LAYOUTS.wide, K = 1, dpr = 1, paper = null;
  const pat = {};
  function tile(size, seed, fn) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'), im = x.createImageData(size, size), r = rng(seed);
    // two octaves of value noise, tileable
    const g = 16, grid = []; for (let i = 0; i < g * g; i++) grid.push(r());
    const vn = (px, py) => { const fx = px / size * g, fy = py / size * g, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = ease(fx - x0), ty = ease(fy - y0), at = (i, j) => grid[((j % g + g) % g) * g + ((i % g + g) % g)]; return lerp(lerp(at(x0, y0), at(x0 + 1, y0), tx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), tx), ty); };
    for (let y = 0; y < size; y++) for (let xx = 0; xx < size; xx++) { const n = vn(xx, y) * .55 + vn(xx * 4 % size, y * 4 % size) * .25 + r() * .2; const [cr, cg, cb, ca] = fn(n, r); const k = (y * size + xx) * 4; im.data[k] = cr; im.data[k + 1] = cg; im.data[k + 2] = cb; im.data[k + 3] = ca; }
    x.putImageData(im, 0, 0); return c;
  }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function buildPatterns() {
    const m = new DOMMatrix().scaleSelf(1 / K, 1 / K);
    const mk = (c, key) => { const p = mainCtx.createPattern(c, 'repeat'); p.setTransform(m); pat[key] = p; };
    const [pr, pg, pb] = hex(C.pencil);
    mk(tile(128, 11, (n) => [pr, pg, pb, n > .78 ? 40 : Math.round(150 + n * 100)]), 'pencil');
    const [ir, ig, ib] = hex(C.ink);
    mk(tile(128, 12, (n, r) => [ir, ig, ib, n > .82 && r() < .7 ? 70 : 236]), 'ink');
    const [rr, rg, rb] = hex(C.red);
    mk(tile(128, 13, (n, r) => [rr, rg, rb, n > .8 && r() < .6 ? 80 : 230]), 'red');
    const [kr, kg, kb] = hex(C.kraft);
    mk(tile(128, 14, (n, r) => { const d = (n - .5) * 26 + (r() < .03 ? -30 : 0); return [kr + d, kg + d, kb + d * .8, 255]; }), 'kraft');
  }
  function buildPaper() {
    paper = document.createElement('canvas'); paper.width = canvas.width; paper.height = canvas.height;
    const x = paper.getContext('2d');
    x.fillStyle = C.paper; x.fillRect(0, 0, paper.width, paper.height);
    const im = x.getImageData(0, 0, paper.width, paper.height), d = im.data, r = rng(5);
    for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n * .8; }
    x.putImageData(im, 0, 0);
    x.setTransform(K, 0, 0, K, 0, 0);
    // fibres
    for (let i = 0; i < L.W * L.H / 900; i++) { const fx = r() * L.W, fy = r() * L.H, a = r() * Math.PI, l = 3 + r() * 9; x.strokeStyle = `rgba(120,100,70,${.05 + r() * .06})`; x.lineWidth = .5; x.beginPath(); x.moveTo(fx, fy); x.quadraticCurveTo(fx + Math.cos(a) * l * .5 + (r() - .5) * 3, fy + Math.sin(a) * l * .5, fx + Math.cos(a) * l, fy + Math.sin(a) * l); x.stroke(); }
    // ruled lines and the margin
    x.lineWidth = .8; x.strokeStyle = C.ruleLine;
    for (let y = L.rule0; y < L.H - 6; y += L.ruleGap) { x.beginPath(); x.moveTo(0, y + .5); x.lineTo(L.W, y + .5); x.stroke(); }
    x.strokeStyle = C.margin; x.lineWidth = 1.1; x.beginPath(); x.moveTo(L.margin, 0); x.lineTo(L.margin, L.H); x.stroke();
    // everything that never moves is printed into the paper once: header, readers, the dotted road
    ctx = x; drawHeader(); drawReaderBodies(); drawDottedPath(); drawRoadGuide(); ctx = mainCtx;
  }
  // sprites: each tag and the GLYP block with their soft shadows, drawn once per size
  let tagSprites = [], boxSprite = null;
  function buildSprites() {
    const tw = L.tower, pad = 10;
    tagSprites = LABELS.map((_, i) => {
      const g = tagGeom(i), h = g.h, w = g.w, n = h * .32;
      const cw = w + pad * 2 + 8, ch = h + pad * 2, c = document.createElement('canvas');
      c.width = Math.ceil(cw * K); c.height = Math.ceil(ch * K);
      const x = c.getContext('2d'); x.setTransform(K, 0, 0, K, 0, 0);
      const ax = g.dir === 1 ? pad + 8 : cw - pad - 8, ay = pad + h / 2;
      x.translate(ax, ay); x.scale(g.dir, 1);
      x.beginPath(); x.moveTo(-8 + n, -h / 2); x.lineTo(w - 8, -h / 2); x.lineTo(w - 8, h / 2); x.lineTo(-8 + n, h / 2); x.lineTo(-8, h / 2 - n); x.lineTo(-8, -h / 2 + n); x.closePath();
      x.shadowColor = 'rgba(60,45,20,.18)'; x.shadowBlur = 3 * K; x.shadowOffsetY = 1.2 * K;
      x.fillStyle = pat.kraft; x.fill(); x.shadowColor = 'transparent';
      x.strokeStyle = C.kraftEdge; x.lineWidth = .6; x.stroke();
      x.fillStyle = 'rgba(244,237,220,.92)'; x.beginPath(); x.arc(0, 0, 3.4, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(120,96,58,.6)'; x.lineWidth = .8; x.beginPath(); x.arc(0, 0, 4.6, 0, Math.PI * 2); x.stroke();
      return { c, ax, ay, cw, ch };
    });
    const bw = tw.boxW + 24, bh = tw.boxH + 24, c = document.createElement('canvas');
    c.width = Math.ceil(bw * K); c.height = Math.ceil(bh * K);
    const x = c.getContext('2d'); x.setTransform(K, 0, 0, K, 0, 0); x.translate(12, 10);
    x.shadowColor = 'rgba(60,45,20,.22)'; x.shadowBlur = 5 * K; x.shadowOffsetY = 2 * K;
    x.fillStyle = pat.kraft; x.fillRect(0, 0, tw.boxW, tw.boxH); x.shadowColor = 'transparent';
    x.strokeStyle = C.kraftEdge; x.lineWidth = .8; x.strokeRect(.5, .5, tw.boxW - 1, tw.boxH - 1);
    x.font = F.abril(tw.glyp); x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillStyle = 'rgba(40,30,20,.12)'; x.fillText('GLYP', tw.boxW / 2 + .8, tw.boxH * .78 + .9);
    x.fillStyle = pat.red; x.fillText('GLYP', tw.boxW / 2, tw.boxH * .78);
    boxSprite = { c, ox: 12, oy: 10, bw, bh };
  }
  function resize() {
    const cssW = canvas.getBoundingClientRect().width || canvas.parentElement.clientWidth || 640;
    L = cssW < 600 ? LAYOUTS.tall : LAYOUTS.wide;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const s = cssW / L.W; K = s * dpr;
    canvas.width = Math.round(L.W * K); canvas.height = Math.round(L.H * K);
    canvas.style.aspectRatio = `${L.W} / ${L.H}`;
    buildPatterns(); measure(); buildPaper(); buildSprites();
  }

  // ---------------------------------------------------------------- text
  const F = { pencil: s => `600 ${s}px Caveat, "Comic Sans MS", cursive`, anton: s => `${s}px Anton, Impact, sans-serif`, old: s => `700 ${s}px "Old Standard TT", Georgia, serif`, abril: s => `${s}px "Abril Fatface", Georgia, serif` };
  let tagW = [];
  function measure() { ctx.setTransform(K, 0, 0, K, 0, 0); ctx.font = F.pencil(L.tower.font); tagW = LABELS.map(l => ctx.measureText(l).width); }
  function textW(font, t) { ctx.font = font; return ctx.measureText(t).width; }
  function pencilText(t, x, y, size, a, p, align = 'left') {
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.font = F.pencil(size); ctx.textBaseline = 'alphabetic';
    const w = ctx.measureText(t).width, x0 = align === 'right' ? -w : align === 'center' ? -w / 2 : 0;
    if (p < 1) { ctx.beginPath(); ctx.rect(x0 - 2, -size * 1.1, (w + 4) * p, size * 1.6); ctx.clip(); }
    ctx.fillStyle = pat.pencil; ctx.fillText(t, x0, 0);
    ctx.restore();
  }
  function stamp(lines, x, y, font, size, fill, a, p, align = 'center', lead = 1.05) {
    if (p <= 0) return;
    const e = easeOut(clamp(p)), sc = 1 + (1 - e) * .22;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 2.2);
    ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    lines.forEach((t, k) => {
      const yy = k * size * lead;
      ctx.fillStyle = 'rgba(40,30,20,.13)'; ctx.fillText(t, .7, yy + .9); // the impression
      ctx.fillStyle = fill; ctx.fillText(t, 0, yy);
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- tower geometry
  const ROT = [-.05, .045, -.025, .06, -.04, .03, -.065, .05, -.03];
  function tagGeom(i) {
    const tw = L.tower, dir = L.oneSide || i % 2 === 0 ? 1 : -1;
    const hy = tw.base - tw.boxH - tw.gap * (i + .62);
    const w = tagW[i] + 30, h = tw.tagH;
    return { hx: tw.cx, hy, dir, w, h, rot: L.oneSide ? (i % 2 ? .035 : -.03) * (1 + (i % 3) * .4) : ROT[i] * dir };
  }
  function towerTop(n) { const tw = L.tower; return tw.base - tw.boxH - tw.gap * Math.max(n, 0) - 10; }

  // ---------------------------------------------------------------- state
  function featureEvents(evs, now) { return evs.filter(e => e.type === 'feature' && e.s <= now); }
  function swayAt(now, evs) {
    if (RM || FREEZE !== null && now < 0) return 0;
    const fs = featureEvents(evs, now), n = fs.length;
    let a = RM ? 0 : (n * .0017 + .0015) * Math.sin(now * 1.25) + n * .0006 * Math.sin(now * 2.9 + 1);
    if (fs.length) { const d = now - (fs[fs.length - 1].s + T.drop0 + T.drop * .8); if (d > 0) a += .022 * Math.exp(-d * 3.2) * Math.sin(d * 13); }
    return a;
  }
  const tw2w = (x, y, a) => rot(x, y, L.tower.cx, L.tower.base, a);
  const tagTextX = g => g.dir === 1 ? 14 : -(g.w - 8) + 8;
  function writePoint(i, u, a) {
    // the pencil tip follows the label as it is written, in the tag's frame, then the tower's sway
    const g = tagGeom(i), lx = tagTextX(g) + tagW[i] * clamp(u), ly = 1 + Math.sin(u * 46) * 1.5;
    const [x, y] = rot(g.hx + lx, g.hy + ly, g.hx, g.hy, g.rot);
    return tw2w(x, y, a);
  }
  function micPath(n) {
    const top = towerTop(n), mx = L.tower.cx + L.micOff[0], my = top + L.micOff[1], k = L.tower.boxH / 58;
    const pts = [];
    // capsule outline, then grille strokes, then the stand
    for (let j = 0; j <= 20; j++) { const a = Math.PI + j / 20 * Math.PI; pts.push([mx + Math.cos(a) * 11 * k, my - 14 * k + Math.sin(a) * 11 * k]); }
    pts.push([mx + 11 * k, my + 8 * k]);
    for (let j = 0; j <= 10; j++) { const a = j / 10 * Math.PI; pts.push([mx + Math.cos(a) * 11 * k, my + 8 * k + Math.sin(a) * 9 * k]); }
    pts.push([mx - 11 * k, my - 14 * k]);
    return { pts, mx, my, k };
  }
  function polyAt(pts, u) { const n = pts.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)); return [lerp(pts[i][0], pts[i + 1][0], f - i), lerp(pts[i][1], pts[i + 1][1], f - i)]; }
  function finaleLinePoint(u) {
    const fl = L.finale.lines, size = L.finale.size;
    const widths = fl.map(l => textW(F.pencil(size), l[2])), total = widths.reduce((a, b) => a + b, 0);
    let d = clamp(u) * total;
    for (let k = 0; k < fl.length; k++) { if (d <= widths[k] || k === fl.length - 1) { const t = clamp(d / widths[k]); const [x0, y0] = fl[k]; return rot(x0 + widths[k] * t, y0 - size * .25 + Math.sin(t * 60) * 1.6, x0, y0, L.finale.rot); } d -= widths[k]; }
    return [fl[0][0], fl[0][1]];
  }

  // Each event says where the pencil goes: a start point, a path over u in [0,1], a duration.
  function script(e, evs) {
    if (e.type === 'feature') {
      const extra = e.i === GUESS ? T.scrub : 0, dur = T.write + extra;
      return { travel: T.travel, dur, at: (u, now) => {
        const a = swayAt(now, evs), uw = clamp(u * dur / T.write);
        if (u * dur <= T.write) return writePoint(e.i, uw, a);
        const v = (u * dur - T.write) / extra, tw = L.tower, bx = tw.cx - tw.boxW * .34, by = tw.base - tw.boxH * .42;
        return tw2w(bx + (v * tw.boxW * .68), by + Math.sin(v * 38) * tw.boxH * .2, a);
      } };
    }
    if (e.type === 'pivot') {
      const n = featureEvents(evs, e.s).length, mp = micPath(n);
      return { travel: T.travel, dur: 1.3, at: u => polyAt(mp.pts, u) };
    }
    if (e.type === 'finale') {
      return { travel: .6, dur: T.finaleText + T.finalePath, at: u => {
        const split = T.finaleText / (T.finaleText + T.finalePath);
        if (u <= split) return finaleLinePoint(u / split);
        return bez(L.path, (u - split) / (1 - split));
      } };
    }
    return null;
  }
  function idlePose(now) { const b = RM ? 0 : Math.sin(now * 1.7) * 2.2; return [L.idle[0] + (RM ? 0 : Math.sin(now * .9) * 3), L.idle[1] + b]; }
  function pencilPose(now, evs) {
    // Walk the events in order. Each one starts from wherever the pencil was when it began.
    const past = evs.filter(e => e.s <= now);
    let pos = null, writing = false;
    for (let k = 0; k < past.length; k++) {
      const e = past[k], sc = script(e, evs); if (!sc) continue;
      const tNow = k === past.length - 1 ? now : past[k + 1].s, from = pos || idlePose(e.s);
      const p0 = sc.at(0, e.s + sc.travel), tt = tNow - e.s;
      if (tt < sc.travel) { const q = RM ? 1 : ease(tt / sc.travel); pos = [lerp(from[0], p0[0], q), lerp(from[1], p0[1], q)]; writing = false; }
      else if (tt < sc.travel + sc.dur) { pos = sc.at(RM ? 1 : (tt - sc.travel) / sc.dur, tNow); writing = true; }
      else { const end = sc.at(1, e.s + sc.travel + sc.dur), q = RM ? 1 : ease(clamp((tNow - e.s - sc.travel - sc.dur) / .9)), id = idlePose(tNow); pos = [lerp(end[0], id[0], q), lerp(end[1], id[1], q)]; writing = false; }
    }
    return { pos: pos || idlePose(now), writing };
  }

  function roadFraction(now, evs) {
    let f = 0;
    featureEvents(evs, now).forEach((e, k) => { if (k < ROAD_STEPS) f += prog(now, e.s, T.road0, T.road) / ROAD_STEPS; });
    return f > .9995 ? 1 : clamp(f); // seven sevenths can sum to 0.99999…
  }
  function roadHead(f) { const r = L.road; return [lerp(r.x0, r.x1, f), r.y]; }

  // ---------------------------------------------------------------- drawing
  function pencilStroke(w = 1.25) { ctx.strokeStyle = pat.pencil; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
  function drawHeader() {
    pencilText('fall 2023', L.date[0], L.date[1], L.date[2], -.02, 1, 'right');
    pencilText('a sketch, not data', L.sketch[0], L.sketch[1], L.sketch[2], -.01, 1, 'right');
    stamp(['SUDOWRITE · JENNI AI'], L.compLabel[0], L.compLabel[1], F.anton(L.compLabel[2]), L.compLabel[2], pat.red, -.012, 1, 'left');
    pencilText('picked a niche and stuck with it', L.compNote[0], L.compNote[1], L.compNote[2], -.015, 1);
  }
  function drawRoadGuide() {
    // the full route, faint, as a ruled pencil guide
    const r = L.road;
    ctx.save(); ctx.globalAlpha = .28; pencilStroke(.7); ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(r.x0, r.y + 1); ctx.lineTo(r.x1, r.y + 1); ctx.stroke(); ctx.restore();
  }
  function drawRoad(now, roadF, evs) {
    const r = L.road, x = lerp(r.x0, r.x1, roadF);
    if (roadF > 0) {
      ctx.fillStyle = pat.ink; ctx.fillRect(r.x0, r.y - 1.6, x - r.x0, 3.2); ctx.fillRect(r.x0, r.y + 3.4, x - r.x0, 1.1);
      ctx.fillStyle = pat.red; ctx.beginPath(); ctx.moveTo(r.x0 - 9, r.y + 1); ctx.lineTo(r.x0 - 4, r.y - 4); ctx.lineTo(r.x0 + 1, r.y + 1); ctx.lineTo(r.x0 - 4, r.y + 6); ctx.closePath(); ctx.fill();
    }
    // the brayer that prints it: visible only while a stretch of road is being inked
    const inking = featureEvents(evs, now).slice(0, ROAD_STEPS).some(e => now > e.s + T.road0 && now < e.s + T.road0 + T.road);
    if (inking && roadF > 0 && roadF < 1 && !RM) {
      const k = L.road.label / 11.5, hx = x, hy = r.y + 1;
      ctx.save(); ctx.translate(hx, hy);
      ctx.fillStyle = 'rgba(60,45,20,.15)'; ctx.beginPath(); ctx.ellipse(6 * k, 9 * k, 14 * k, 3.5 * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6E6A62'; ctx.lineWidth = 1.6 * k; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-9 * k, -4 * k); ctx.lineTo(-9 * k, -12 * k); ctx.lineTo(9 * k, -12 * k); ctx.lineTo(9 * k, -4 * k); ctx.moveTo(0, -12 * k); ctx.lineTo(14 * k, -34 * k); ctx.stroke();
      ctx.strokeStyle = '#8A5A3A'; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.moveTo(14 * k, -34 * k); ctx.lineTo(24 * k, -50 * k); ctx.stroke();
      ctx.fillStyle = pat.ink; ctx.beginPath(); ctx.roundRect(-11 * k, -5 * k, 22 * k, 10 * k, 5 * k); ctx.fill();
      ctx.restore();
    }
    MILESTONES.forEach((m, j) => {
      const f = MS_AT[j], p = RM ? (roadF >= f ? 1 : 0) : clamp((roadF - f) / .045); if (p <= 0) return;
      const mx = lerp(r.x0, r.x1, f);
      ctx.fillStyle = pat.ink; ctx.globalAlpha = clamp(p * 2); ctx.fillRect(mx - .8, r.y - 7, 1.6, 15); ctx.globalAlpha = 1;
      const lines = r.twoLine ? m.split(' ') : [m];
      stamp(lines, mx, r.y + r.label * 2.2, F.old(r.label), r.label, pat.ink, 0, p, 'center', 1.15);
    });
  }
  const READER_POS = [[-34, -42], [0, -50], [34, -40], [-50, 2], [-16, -4], [18, -2], [50, 4], [-32, 44], [2, 40], [36, 46]];
  const READER_KIND = [1, 0, 2, 3, 1, 0, 2, 1, 3, 0];
  function drawReaderBodies() {
    const rd = L.readers, k = rd.k;
    READER_POS.forEach(([dx, dy], j) => {
      const x = rd.cx + dx * k, y = rd.cy + dy * k, hr = 8.5 * k, kind = READER_KIND[j];
      pencilStroke(1.2);
      ctx.beginPath(); ctx.ellipse(x, y, hr, hr * 1.05, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y + hr * 2.35, hr * 1.55, hr * 1.25, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      // hair and a bun: enough to read as people
      pencilStroke(1.1);
      if (kind === 1) { ctx.beginPath(); ctx.arc(x, y, hr, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - hr * .5, y - hr * .85); ctx.quadraticCurveTo(x, y - hr * .4, x + hr * .6, y - hr * .8); ctx.stroke(); }
      if (kind === 2) { ctx.beginPath(); ctx.arc(x + hr * .2, y - hr * 1.15, hr * .38, 0, Math.PI * 2); ctx.stroke(); }
    });
    pencilText('readers', rd.label[0], rd.label[1], rd.label[2], -.02, 1, rd.labelAlign || 'right');
  }
  function drawReaderEyes(now, roadF) {
    const rd = L.readers, k = rd.k, turn = RM ? (roadF >= 1 ? 1 : 0) : clamp((roadF - .965) / .035);
    // straight ahead, then towards the printed road once it arrives
    const lx = lerp(.6, -3.2, turn) * k, ly = lerp(.4, -2.2, turn) * k;
    READER_POS.forEach(([dx, dy], j) => {
      const x = rd.cx + dx * k, y = rd.cy + dy * k;
      ctx.fillStyle = pat.pencil;
      for (const ex of [-3, 3]) { ctx.beginPath(); ctx.arc(x + ex * k + lx, y + ly, 1.25 * k, 0, Math.PI * 2); ctx.fill(); }
      if (READER_KIND[j] === 3) { pencilStroke(.8); for (const ex of [-3, 3]) { ctx.beginPath(); ctx.arc(x + ex * k + lx, y + ly, 2.4 * k, 0, Math.PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - .6 * k + lx, y + ly); ctx.lineTo(x + .6 * k + lx, y + ly); ctx.stroke(); }
    });
  }
  function bezLen(p) { let l = 0, prev = p[0]; for (let i = 1; i <= 48; i++) { const q = bez(p, i / 48); l += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; } return l; }
  function drawDottedPath() {
    const p = L.path;
    ctx.save(); pencilStroke(1.3); ctx.globalAlpha = .62; ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1]); ctx.stroke(); ctx.restore();
  }
  function drawGlypPath(now, fin) {
    const p = L.path;
    if (fin.path > 0) {
      const len = bezLen(p);
      ctx.save(); pencilStroke(1.9); ctx.setLineDash([len * fin.path, len + 10]);
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1]); ctx.stroke(); ctx.restore();
      if (fin.path >= 1) { const e = p[3], q = bez(p, .97), a = Math.atan2(e[1] - q[1], e[0] - q[0]); pencilStroke(1.9); ctx.beginPath(); ctx.moveTo(e[0] + Math.cos(a + 2.6) * 9, e[1] + Math.sin(a + 2.6) * 9); ctx.lineTo(e[0], e[1]); ctx.lineTo(e[0] + Math.cos(a - 2.6) * 9, e[1] + Math.sin(a - 2.6) * 9); ctx.stroke(); }
    }
    const pl = L.pathLabel;
    pencilText(fin.path >= 1 ? 'distribution' : 'distribution ?', pl[0], pl[1], pl[2], -.02, 1);
  }
  function drawTag(i, g, write, drop) {
    if (drop <= 0) return;
    const dy = (1 - easeOut(drop)) * -26, wob = (1 - drop) * .25 * g.dir, sp = tagSprites[i];
    ctx.save(); ctx.translate(g.hx, g.hy + dy); ctx.rotate(g.rot + wob);
    ctx.globalAlpha = clamp(drop * 3);
    ctx.drawImage(sp.c, -sp.ax, -sp.ay, sp.cw, sp.ch);
    // the pencilled label, written left to right in reading order whichever way the tag hangs
    if (write > 0) {
      const tx = tagTextX(g), tw = tagW[i], h = g.h;
      ctx.font = F.pencil(L.tower.font);
      if (write < 1) { ctx.beginPath(); ctx.rect(tx - 2, -h, (tw + 4) * write, h * 2); ctx.clip(); }
      ctx.fillStyle = pat.pencil; ctx.textBaseline = 'middle'; ctx.fillText(LABELS[i], tx, h * .06);
    }
    ctx.restore();
  }
  function drawTower(now, evs) {
    const tw = L.tower, a = swayAt(now, evs), fs = featureEvents(evs, now), n = fs.length;
    ctx.save(); ctx.translate(tw.cx, tw.base); ctx.rotate(a); ctx.translate(-tw.cx, -tw.base);
    // the block: GLYP, in the cover's red wood type
    const bx = tw.cx - tw.boxW / 2, by = tw.base - tw.boxH;
    ctx.drawImage(boxSprite.c, bx - boxSprite.ox, by - boxSprite.oy, boxSprite.bw, boxSprite.bh);
    // second-guessing the core: pencil scribble over the block, then a question mark
    const ge = fs.find(e => e.i === GUESS);
    if (ge) {
      const sp = prog(now, ge.s, T.travel + T.write, T.scrub);
      if (sp > 0) {
        const r = rng(77); pencilStroke(1.1); ctx.globalAlpha = .8; ctx.beginPath();
        const x0 = tw.cx - tw.boxW * .34, x1 = tw.cx + tw.boxW * .34, yc = tw.base - tw.boxH * .42, steps = 30;
        for (let j = 0; j <= steps * sp; j++) { const v = j / steps, xx = lerp(x0, x1, v), yy = yc + Math.sin(v * 38) * tw.boxH * .2 + (r() - .5) * 2; if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
        ctx.stroke(); ctx.globalAlpha = 1;
        if (sp >= 1) pencilText('?', tw.cx + tw.boxW / 2 + 6, tw.base - tw.boxH * .3, tw.font * 1.5, .12, 1);
      }
    }
    // the spike the features are skewered on
    if (n > 0) {
      const top = towerTop(n) + (1 - prog(now, fs[n - 1].s, T.drop0, T.drop)) * tw.gap;
      ctx.strokeStyle = C.spike; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tw.cx, by); ctx.lineTo(tw.cx, top); ctx.stroke();
      ctx.fillStyle = C.spike; ctx.beginPath(); ctx.moveTo(tw.cx - 2.2, top + 3); ctx.lineTo(tw.cx, top - 4); ctx.lineTo(tw.cx + 2.2, top + 3); ctx.fill();
    }
    fs.forEach(e => drawTag(e.i, tagGeom(e.i), prog(now, e.s, T.write0, T.write), prog(now, e.s, T.drop0, T.drop)));
    ctx.restore();
  }
  function drawPivot(now, evs) {
    const pe = evs.find(e => e.type === 'pivot' && e.s <= now); if (!pe) return;
    const n = featureEvents(evs, pe.s).length, mp = micPath(n), a = swayAt(now, evs);
    const dp = prog(now, pe.s, T.travel, 1.3);
    ctx.save(); ctx.translate(L.tower.cx, L.tower.base); ctx.rotate(a); ctx.translate(-L.tower.cx, -L.tower.base);
    if (dp > 0) {
      // the capsule as it is drawn, then grille and stand
      pencilStroke(1.5); ctx.beginPath(); const m = Math.max(1, Math.floor(mp.pts.length * dp));
      mp.pts.slice(0, m + 1).forEach((q, j) => j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
      if (dp >= 1) {
        const { mx, my, k } = mp; pencilStroke(1);
        for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(mx - 9 * k, my - 14 * k + j * 4.5 * k); ctx.lineTo(mx + 9 * k, my - 14 * k + j * 4.5 * k); ctx.stroke(); }
        pencilStroke(1.4); ctx.beginPath(); ctx.moveTo(mx, my + 17 * k); ctx.lineTo(mx, my + 27 * k); ctx.moveTo(mx - 9 * k, my + 27 * k); ctx.lineTo(mx + 9 * k, my + 27 * k); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mx - 4, my + 27 * k); ctx.quadraticCurveTo(L.tower.cx + 6, my + 30 * k, L.tower.cx, towerTop(n) + 4); ctx.stroke();
      }
    }
    const tp = prog(now, pe.s, T.travel + 1.3, .6);
    if (tp > 0) pencilText('Glyp Podcasts', mp.mx + 18 * mp.k, mp.my - 18 * mp.k, L.tower.font, -.04, tp);
    ctx.restore();
    const sp = prog(now, pe.s, T.pivot, .32), st = L.stamp;
    stamp(st.lines, st.x, st.y, F.anton(st.size), st.size, pat.red, st.rot, sp, 'center', 1.05);
  }
  function finaleProgress(now, evs) {
    const fe = evs.find(e => e.type === 'finale' && e.s <= now);
    if (!fe) return { text: 0, path: 0 };
    return { text: prog(now, fe.s, .6, T.finaleText), path: prog(now, fe.s, .6 + T.finaleText, T.finalePath) };
  }
  function drawFinale(fin) {
    if (fin.text <= 0) return;
    const fl = L.finale.lines, size = L.finale.size, widths = fl.map(l => textW(F.pencil(size), l[2])), total = widths.reduce((a, b) => a + b, 0);
    let d = fin.text * total;
    fl.forEach(([x, y, t], k) => { const p = clamp(d / widths[k]); d -= widths[k]; if (p > 0) pencilText(t, x, y, size, L.finale.rot, p); });
    // underline the lesson once it is written
    if (fin.text >= 1) { const [x, y] = fl[0]; const w = widths[0]; pencilStroke(1.3); ctx.beginPath(); const a = rot(x, y + 6, x, y, L.finale.rot), b = rot(x + w, y + 7, x, y, L.finale.rot); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 3, b[0], b[1]); ctx.stroke(); }
  }
  function drawPencil(now, evs, roadF) {
    const pose = pencilPose(now, evs), [x, y] = pose.pos, len = L.pencilLen, w = len * .088, tip = len * .2, bodyL = len * .62;
    // looking: up at the printed road while it grows, otherwise down at the work
    let look = [-.5, .8];
    const fs = featureEvents(evs, now), last = fs[fs.length - 1];
    if (last && fs.length <= ROAD_STEPS) { const t0 = last.s + T.road0, t1 = t0 + T.road + .35; if (now > t0 && now < t1) { const h = roadHead(roadF); const dx = h[0] - x, dy = h[1] - y, m = Math.hypot(dx, dy) || 1; const q = smooth(t0, t0 + .2, now) * (1 - smooth(t1 - .25, t1, now)); look = [lerp(look[0], dx / m, q), lerp(look[1], dy / m, q)]; } }
    const ang = -.68 + (RM ? 0 : Math.sin(now * 2.1) * .03) + (pose.writing ? Math.sin(now * 23) * .025 : 0);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    // shadow on the page
    ctx.save(); ctx.translate(6, 7); ctx.fillStyle = 'rgba(70,52,24,.13)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(tip, -w / 2); ctx.lineTo(tip + bodyL + len * .2, -w / 2); ctx.lineTo(tip + bodyL + len * .2, w / 2); ctx.lineTo(tip, w / 2); ctx.closePath(); ctx.fill(); ctx.restore();
    // sharpened wood and graphite
    ctx.fillStyle = C.wood; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(tip, -w / 2); ctx.lineTo(tip, w / 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.woodDark; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(tip * .3, -w * .15); ctx.lineTo(tip, -w * .3); ctx.moveTo(tip * .3, w * .15); ctx.lineTo(tip, w * .3); ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(tip * .32, -w * .16); ctx.lineTo(tip * .32, w * .16); ctx.closePath(); ctx.fill();
    // painted body, three facets, with the scalloped edge at the cone
    const facets = ['#4C88C6', C.pencil, '#2E6299'];
    facets.forEach((col, j) => { ctx.fillStyle = col; ctx.fillRect(tip, -w / 2 + j * w / 3, bodyL, w / 3 + .2); });
    ctx.fillStyle = C.wood; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(tip, -w / 2 + (j + .5) * w / 3, w / 6, -Math.PI / 2, Math.PI / 2); ctx.fill(); }
    // ferrule and eraser
    ctx.fillStyle = C.ferrule; ctx.fillRect(tip + bodyL, -w / 2 - .4, len * .1, w + .8);
    ctx.strokeStyle = 'rgba(90,84,74,.6)'; ctx.lineWidth = .6; for (let j = 1; j < 4; j++) { const fx = tip + bodyL + j * len * .025; ctx.beginPath(); ctx.moveTo(fx, -w / 2); ctx.lineTo(fx, w / 2); ctx.stroke(); }
    ctx.fillStyle = C.eraser; ctx.beginPath(); ctx.moveTo(tip + bodyL + len * .1, -w / 2); ctx.lineTo(tip + bodyL + len * .17, -w / 2); ctx.quadraticCurveTo(tip + bodyL + len * .2, 0, tip + bodyL + len * .17, w / 2); ctx.lineTo(tip + bodyL + len * .1, w / 2); ctx.closePath(); ctx.fill();
    // a small face on the paint, near the tip: two eyes that watch
    const ex = tip + bodyL * .2, er = w * .3, la = -ang, lx = look[0] * Math.cos(la) - look[1] * Math.sin(la), ly = look[0] * Math.sin(la) + look[1] * Math.cos(la);
    const blink = !RM && FREEZE === null && (now % 4.6) < .13;
    for (const ey of [-w * .21, w * .21]) {
      if (blink) { ctx.strokeStyle = '#F7F1E3'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(ex - er, ey); ctx.lineTo(ex + er, ey); ctx.stroke(); continue; }
      ctx.fillStyle = '#F7F1E3'; ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1A1C22'; ctx.beginPath(); ctx.arc(ex + lx * er * .45, ey + ly * er * .45, er * .5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- frame
  function render(now, evs, fade) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(paper, 0, 0);
    ctx.setTransform(K, 0, 0, K, 0, 0);
    const roadF = roadFraction(now, evs), fin = finaleProgress(now, evs);
    drawRoad(now, roadF, evs); drawReaderEyes(now, roadF); drawGlypPath(now, fin);
    drawTower(now, evs); drawPivot(now, evs); drawFinale(fin); drawPencil(now, evs, roadF);
    if (fade > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = fade; ctx.drawImage(paper, 0, 0); ctx.globalAlpha = 1; }
    return roadF;
  }

  // ---------------------------------------------------------------- modes, clock, controls
  let mode = RM ? 'user' : 'auto', events = [], clock = 0, visible = false, raf = 0, last = 0, lastStatus = '';
  function autoLocal() { return clock % CYCLE; }
  function currentEvents() { return mode === 'auto' ? AUTO : events; }
  function currentNow() { return mode === 'auto' ? autoLocal() : clock; }
  function counts(now, evs) { return { n: featureEvents(evs, now).length, pivot: evs.some(e => e.type === 'pivot' && e.s <= now), finale: evs.some(e => e.type === 'finale' && e.s <= now) }; }
  function statusFor(now, evs, roadF) {
    const c = counts(now, evs), fin = finaleProgress(now, evs);
    if (fin.text >= 1) return 'Distribution matters way more than features.';
    if (c.pivot) return 'Pivot to Glyp Podcasts. Same fundamental problems.';
    if (c.n === 0) return 'Glyp, fall 2023. Add a feature and watch the road to readers.';
    const reached = MILESTONES.filter((_, j) => roadF >= MS_AT[j]);
    const road = roadF >= 1 ? 'their road reached readers' : reached.length ? `their road: ${reached[reached.length - 1].toLowerCase()}` : 'their road is just starting';
    const glyp = `Glyp: ${c.n} feature${c.n > 1 ? 's' : ''}`;
    return roadF >= 1 ? `${glyp}, still a dotted line to readers; ${road}.` : `${glyp}; ${road}.`;
  }
  function syncUI(now, evs, roadF) {
    const c = counts(now, evs);
    btnFeature.disabled = c.n >= MAX_FEATURES || c.pivot;
    btnPivot.disabled = c.n < 3 || c.pivot;
    btnFeature.textContent = c.n >= ROAD_STEPS && c.n < MAX_FEATURES ? 'Add another feature' : 'Add a feature';
    const s = mode === 'auto' ? (now > 17.8 ? 'Distribution matters way more than features. Start over to try it yourself.' : 'Playing a sketch of the year. Add a feature to take over.') : statusFor(now, evs, roadF);
    if (s !== lastStatus) { statusEl.textContent = s; lastStatus = s; }
  }
  function frame() {
    const now = currentNow(), evs = currentEvents();
    const fade = mode === 'auto' ? smooth(CYCLE - 1.4, CYCLE - .35, now) : 0;
    const roadF = render(now, evs, fade);
    syncUI(now, evs, roadF);
  }
  function busy(now, evs) {
    // anything still being written, printed or stamped? (autoplay always counts as busy)
    if (mode === 'auto') return true;
    return evs.some(e => now >= e.s && now < e.s + 6.5);
  }
  let skip = false;
  function loop(ts) {
    raf = 0; if (!visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min(.1, (ts - last) / 1000) : 0; last = ts; clock += dt;
    // when idle, the tower's sway and the pencil's bob only need 30 frames a second
    skip = !skip;
    if (busy(currentNow(), currentEvents()) || !skip) frame();
    raf = requestAnimationFrame(loop);
  }
  function wake() { if (!raf && visible && !document.hidden && !RM && FREEZE === null) { last = 0; raf = requestAnimationFrame(loop); } }
  function takeOver() {
    if (mode === 'user') return;
    const now = autoLocal();
    events = now > CYCLE - 1.4 ? [] : AUTO.filter(e => e.s <= now).map(e => ({ ...e }));
    clock = now; mode = 'user';
  }
  btnFeature.addEventListener('click', () => {
    takeOver(); const c = counts(clock, events);
    if (c.n < MAX_FEATURES && !c.pivot) events.push({ type: 'feature', i: c.n, s: clock });
    if (RM) frame(); else wake();
  });
  btnPivot.addEventListener('click', () => {
    takeOver(); const c = counts(clock, events);
    if (c.n >= 3 && !c.pivot) { events.push({ type: 'pivot', s: clock }); events.push({ type: 'finale', s: clock + 2.6 }); }
    if (RM) { clock += 10; frame(); } else wake();
  });
  btnReset.addEventListener('click', () => { takeOver(); events = []; clock = 0; if (RM) frame(); else wake(); });

  // ---------------------------------------------------------------- start
  async function start() {
    try { await Promise.all([F.pencil(20), F.anton(20), F.old(12), F.abril(40)].map(f => document.fonts.load(f))); await document.fonts.ready; } catch (e) { /* fall back to system faces */ }
    resize();
    if (FREEZE !== null) { mode = 'auto'; clock = FREEZE; frame(); window.__ready = true; return; }
    // with reduced motion, open on the finished sketch, so the still explains itself; Start over steps through it
    if (RM) { events = AUTO.map(e => ({ ...e })); clock = CYCLE - 5; }
    frame(); window.__ready = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) wake(); }, { threshold: .25 }).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
    let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const before = L; resize(); if (before !== L) lastStatus = ''; frame(); }, 120); });
  }
  start();
})();
