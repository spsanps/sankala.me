'use strict';
/* Four desks — materials. Each era's painter turns semantic fills into one hand process.
   Painters draw in layout units through a single scale S (device px per unit). */

/* ───────── photographs: loaded once, separated once ───────── */
const PHOTOS = {
  'nitk-lab': { src: 'photos/nitk-lab.jpg', caption: 'The electronics lab at NITK' },
  'ti-bengaluru': { src: 'photos/ti-bengaluru.jpg', caption: 'Texas Instruments, Bengaluru' },
  'ucsd-library': { src: 'photos/ucsd-library.jpg', caption: 'Starting at UC San Diego, 2022' },
  'research-group': { src: 'photos/research-group.jpg', caption: 'With Julian McAuley’s research group, 2023' },
  'uist-award': { src: 'photos/uist-award.jpg', caption: 'ZINify at UIST 2023' },
  'ebay-headquarters': { src: 'photos/ebay-headquarters.jpg', caption: 'eBay headquarters, San Jose' },
  'neurips-award': { src: 'photos/neurips-award.jpg', caption: 'Receiving the NeurIPS 2025 EAI Challenge award' },
};
function loadPhotos() {
  return Promise.all(Object.entries(PHOTOS).map(([id, p]) => new Promise(res => {
    const im = new Image(); im.onload = () => { p.img = im; res(); }; im.onerror = () => res(); im.src = (typeof PHOTO_DATA !== 'undefined' && PHOTO_DATA[id]) || p.src;
  })));
}
function photoChannels(id) {
  const p = PHOTOS[id]; if (!p || !p.img) return null;
  if (p.ch) return p.ch;
  const w = p.img.naturalWidth, h = p.img.naturalHeight, c = makeCanvas(w, h), x = ctx2d(c, { willReadFrequently: true });
  x.drawImage(p.img, 0, 0); const d = x.getImageData(0, 0, w, h).data;
  const mk = () => { const cc = makeCanvas(w, h); return [cc, ctx2d(cc), new ImageData(w, h)]; };
  const [lc, lx, ld] = mk(), [wc, wx, wd] = mk(), [yc, yx, yd] = mk();
  // auto-levels so every print uses its full range
  let lo = 255, hi = 0; for (let i = 0; i < d.length; i += 16) { const l = .3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2]; lo = Math.min(lo, l); hi = Math.max(hi, l); }
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], l = clamp((.3 * r + .59 * g + .11 * b - lo) / Math.max(1, hi - lo));
    const warm = clamp((r - b) / 140 + .1) * (1 - Math.abs(l - .55) * 1.2), yel = clamp(((r + g) / 2 - b) / 160) * l;
    const set = (D, v) => { const q = Math.round(clamp(v) * 255); D.data[i] = D.data[i + 1] = D.data[i + 2] = q; D.data[i + 3] = 255; };
    set(ld, l); set(wd, 1 - clamp(warm)); set(yd, 1 - clamp(yel * .8));
  }
  lx.putImageData(ld, 0, 0); wx.putImageData(wd, 0, 0); yx.putImageData(yd, 0, 0);
  p.ch = { lum: lc, warm: wc, yel: yc, w, h };
  return p.ch;
}

/* ───────── shared texture tiles ───────── */
const TILES = {};
function noiseTile(key, size, fn) {
  if (TILES[key]) return TILES[key];
  const c = makeCanvas(size, size), x = ctx2d(c), d = x.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) { const v = fn(i, j, size), k = (j * size + i) * 4; d.data[k] = d.data[k + 1] = d.data[k + 2] = clamp(v) * 255; d.data[k + 3] = 255; }
  x.putImageData(d, 0, 0); return (TILES[key] = c);
}
// tileable fbm (wraps by sampling on a torus of periods)
function tfbm(i, j, size, freq, seed, oct = 4) {
  let v = 0, a = .5, n = 0, f = freq;
  for (let o = 0; o < oct; o++) {
    const P2 = Math.round(f), x = i / size * P2, y = j / size * P2;
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const h = (a2, b2) => hash2(((a2 % P2) + P2) % P2, ((b2 % P2) + P2) % P2, seed + o * 13);
    const A = h(ix, iy), B = h(ix + 1, iy), C = h(ix, iy + 1), D = h(ix + 1, iy + 1);
    v += a * (A + (B - A) * ux + (C - A) * uy + (A - B - C + D) * ux * uy); n += a; a *= .5; f *= 2;
  }
  return v / n;
}

/* ═════════ base painter ═════════ */
class Painter {
  constructor(LY, S, ctxs) { this.LY = LY; this.S = S; this.ctxs = ctxs; this.angle = 0; this.wob = 1.1; this.stack = 0; for (const c of ctxs) c.setTransform(S, 0, 0, S, 0, 0); }
  push(fn) { for (const c of this.ctxs) { c.save(); fn(c); } this.stack++; }
  pop() { for (const c of this.ctxs) c.restore(); this.stack--; }
  ang(a) { this.angle = a; }
  tone(key, shade) { return 0; }
  text(key, shade, str, x, y, size, o = {}) {
    this.f(key, shade, null, null, null, c => { c.font = `${o.weight || 600} ${size}px ${o.family || '"DM Sans", system-ui, sans-serif'}`; if ('letterSpacing' in c) c.letterSpacing = (o.tracking || 0) + 'px'; c.textBaseline = 'alphabetic'; c.fillText(str, x, y); if ('letterSpacing' in c) c.letterSpacing = '0px'; });
  }
  photo(id, x, y, w, rot, spec) {
    const ch = spec.photo ? photoChannels(spec.photo) : null;
    const aspect = ch ? ch.h / ch.w : (spec.paper === 'certificate' || spec.paper === 'ebay-letter' || spec.paper === 'eai' ? 1.3 : 1.05);
    const b = w * (ch ? .055 : 0), iw = w - 2 * b, ih = iw * aspect, h = ih + 2 * b + (ch ? b * .8 : 0);
    this.push(c => { c.translate(x + w / 2, y + h / 2); c.rotate(rot * DEG); });
    this.f('shadow', 0, c => { c.beginPath(); c.rect(-w / 2 + 3, -h / 2 + 5, w, h); });
    this.f('paperWhite', .2, c => { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); });
    if (ch) this.image(spec.photo, ch, -w / 2 + b, -h / 2 + b, iw, ih);
    else drawPaperContent(this, spec.paper, -w / 2, -h / 2, w, h);
    this.s('frameLine', -.6, .6, c => { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); });
    if (spec.pin === 'tape') { this.f('tape', 0, c => { c.beginPath(); c.save(); c.translate(0, -h / 2); c.rotate(-.06); c.rect(-w * .17, -7, w * .34, 14); c.restore(); }); }
    else { this.f('pin', 0, c => { c.beginPath(); c.arc(0, -h / 2 + 8, 4.6, 0, TAU); }); this.f('pin', .7, c => { c.beginPath(); c.arc(-1.4, -h / 2 + 6.6, 1.5, 0, TAU); }); }
    this.pop();
  }
  sun() { } moon() { }
}
// Papers pinned to the board: only documented things, drawn simply in whatever ink the era has.
function drawPaperContent(P, kind, x, y, w, h) {
  const line = (u0, v, u1, wd = 1.2, key = 'ink', sh = 0) => P.s(key, sh, wd, c => { c.beginPath(); c.moveTo(x + w * u0, y + h * v); c.lineTo(x + w * u1, y + h * v); });
  const txt = (s, u, v, size, o = {}) => P.text(o.key || 'ink', 0, s, x + w * u, y + h * v, size, o);
  if (kind === 'eai') { txt('AxisTilted2', .1, .14, 6.5, { weight: 700 }); for (let i = 0; i < 3; i++) line(.1, .22 + i * .06, .9 - i * .15, 1.6); for (let i = 0; i < 9; i++) line(.1, .46 + i * .05, i % 3 === 2 ? .55 : .9, .8, 'ink', .3); }
  else if (kind === 'ebay-letter') { txt('ML CHALLENGE', .1, .14, 6, { weight: 700, tracking: .6 }); line(.1, .2, .9, .6); txt('1st of 591', .1, .34, 9, { weight: 700 }); for (let i = 0; i < 7; i++) line(.1, .46 + i * .055, i === 6 ? .5 : .88, .8, 'ink', .3); }
  else if (kind === 'certificate') { P.s('ink', 0, 1, c => { c.beginPath(); c.rect(x + w * .06, y + h * .05, w * .88, h * .9); }); txt('BEST PAPER', .16, .3, 8, { weight: 700, tracking: .8 }); txt('IEEE DISCOVER 2019', .16, .42, 5.2, { tracking: .4 }); for (let i = 0; i < 3; i++) line(.2, .58 + i * .07, .8, .7, 'ink', .3); P.f('ink', 0, c => { c.beginPath(); c.arc(x + w * .72, y + h * .8, w * .08, 0, TAU); }); }
  else if (kind === 'die-plot') { const r = mulberry32(5); P.s('ink', 0, .9, c => { c.beginPath(); c.rect(x + w * .1, y + h * .1, w * .8, h * .8); for (let i = 0; i < 14; i++) { const yy = y + h * (.14 + i * .055); c.moveTo(x + w * .12, yy); c.lineTo(x + w * .88, yy); } }); P.f('ink', -.3, c => { c.beginPath(); for (let i = 0; i < 6; i++) c.rect(x + w * (.15 + r() * .5), y + h * (.15 + r() * .55), w * (.1 + r() * .15), h * (.08 + r() * .1)); }); }
  else if (kind === 'schematic') { P.s('ink', 0, .9, c => { c.beginPath(); c.moveTo(x + w * .08, y + h * .5); c.lineTo(x + w * .3, y + h * .5); for (let i = 0; i < 6; i++) c.lineTo(x + w * (.32 + i * .03), y + h * (i % 2 ? .4 : .6)); c.lineTo(x + w * .52, y + h * .5); c.lineTo(x + w * .66, y + h * .5); c.moveTo(x + w * .66, y + h * .3); c.lineTo(x + w * .66, y + h * .7); c.moveTo(x + w * .7, y + h * .3); c.lineTo(x + w * .7, y + h * .7); c.moveTo(x + w * .7, y + h * .5); c.lineTo(x + w * .92, y + h * .5); }); }
  else if (kind === 'star-chart') { const r = mulberry32(13); P.f('ink', 0, c => { c.beginPath(); for (let i = 0; i < 40; i++) { const sx = x + w * (.08 + r() * .84), sy = y + h * (.08 + r() * .84); c.moveTo(sx + 1.6, sy); c.arc(sx, sy, .6 + r() * 1.2, 0, TAU); } }); P.s('ink', .2, .5, c => { c.beginPath(); c.moveTo(x + w * .2, y + h * .3); c.lineTo(x + w * .35, y + h * .22); c.lineTo(x + w * .5, y + h * .35); c.lineTo(x + w * .62, y + h * .28); c.moveTo(x + w * .3, y + h * .7); c.lineTo(x + w * .45, y + h * .62); c.lineTo(x + w * .6, y + h * .74); }); txt('ORION', .66, .2, 5, { tracking: .5 }); }
}

/* ═════════ 1 · the present: gouache, lit by San Jose's real sky ═════════ */
const PAINT = {
  wall: ['#ebe4d7', '#f5f0e6', '#c9bfb0'], frame: ['#efe9dc', '#fbf7ee', '#c9bfae'], frameLine: ['#6c6256', '#8a7f72', '#3f382f'],
  cork: ['#b98a57', '#d1a46d', '#8a6440'], pinframe: ['#8e6a48', '#a88160', '#5e4530'], wood: ['#b2804f', '#c99a68', '#87603c'], woodGrain: ['#946640', '#a87750', '#7a5233'],
  metal: ['#8b8f93', '#c4c7c9', '#5d6165'], metalDark: ['#3d4146', '#62676d', '#24272b'], lampShade: ['#2f5d8a', '#4c7fb0', '#1d3d5f'], lampInside: ['#f3dfb7', '#fff3d6', '#cdb48a'],
  alu: ['#b9bcbf', '#dcdedf', '#8d9195'], aluDark: ['#3b3f45', '#55595f', '#25282c'], keys: ['#2c2f34', '#44484e', '#1c1e21'], screen: ['#1c2230', '#283043', '#121620'],
  paperWhite: ['#f4f0e6', '#fffdf6', '#d8d1c2'], glass: ['#7f98ab', '#b9cad6', '#4f6676'], tube: ['#e8e6e0', '#ffffff', '#b2aea6'],
  robot: ['#2f56b8', '#4a74d4', '#1d3a85'], robotWhite: ['#f7f3ea', '#ffffff', '#d6cfc0'], vermilion: ['#e0482c', '#f26a48', '#a8301b'], ink: ['#22262d', '#3a3f48', '#14171c'],
  bookYellow: ['#e5b52a', '#f3cb4f', '#b88a12'], bookCobalt: ['#2c50a6', '#4569bf', '#1c3677'], bookKraft: ['#c4a275', '#d8b98d', '#97774f'], bookPink: ['#f2ede6', '#ffffff', '#cfc6ba'], bookCream: ['#ece2c9', '#f8f0dc', '#c4b897'],
  bookYellowInk: ['#1a1a1a'], bookCobaltInk: ['#f3efe4'], bookKraftInk: ['#b53424'], bookPinkInk: ['#e2448f'], bookCreamInk: ['#2f4b3c'],
  tape: ['#efe6c8', '#fbf4dc', '#cbbf98'], pin: ['#c8402c', '#ee6a52', '#8a2a1c'], trunk: ['#6f5a46', '#8d7660', '#4b3c2e'], bezel: ['#3b3f45', '#55595f', '#25282c'], screenBar: ['#2a3142'],
  woodFront: ['#7a5233', '#94683f', '#4e341f'], underDesk: ['#2b241e', '#3a3029', '#1d1814'],
};
class PaintPainter extends Painter {
  static CALM = new Set(['skyBand', 'wall', 'wood', 'hillFar', 'hillMid', 'valley', 'underDesk', 'woodFront', 'cork', 'frame', 'screen', 'shadow']);
  constructor(LY, S, ctx, st) { super(LY, S, [ctx]); this.c = ctx; this.st = st; this.wob = 1.2; this.mottle = this.c.createPattern(noiseTile('mottleFine', 256, (i, j, s) => .5 + (tfbm(i, j, s, 12, 3, 4) - .5) * 1.6), 'repeat'); this.skyCols(); }
  skyCols() {
    const k = this.st.sky, e = k.sun.el;
    // zenith and horizon colours from the sun's elevation
    const zen = gradientStops([[-18, '#0a1230'], [-10, '#16224a'], [-4, '#2c3d70'], [0, '#4a6295'], [6, '#6d8fc2'], [20, '#6ea2d8'], [60, '#5e97d3']], e);
    const hor = gradientStops([[-18, '#1c2444'], [-10, '#3a3a5e'], [-4, '#a8697a'], [0, '#f09a72'], [5, '#f5c08a'], [14, '#dfe3dc'], [40, '#d2e3ee']], e);
    this.zen = zen; this.hor = hor;
    // the hills: lit gold from the west in the evening, silhouetted against a morning sun
    const hillDay = rgb('#c3a479'), hillLit = k.morning ? mix(hillDay, '#7d7896', .55) : mix(mix(hillDay, '#e8935a', k.golden * .9), '#d98a86', k.twilight * .6);
    const night = k.night;
    this.hill = mix(mix(hillLit, mix(hor, '#6f6a88', .5), .25), '#1a2036', night * .92);
    this.hillFar = mix(mix(this.hill, hor, .38), '#232a48', night * .9);
    this.valley = mix(mix('#a99a7f', hor, .28), '#151b2e', night * .95);
  }
  col(key, shade) {
    if (key === 'skyBand') return mix(this.zen, this.hor, Math.pow(clamp(shade), 1.35));
    if (key === 'hillFar') return mix(this.hillFar, shade > 0 ? mix(this.hor, '#ffffff', .1) : '#2b3150', Math.abs(shade) * .35);
    if (key === 'hillMid') return mix(this.hill, shade > 0 ? '#e4c597' : '#3a3550', Math.abs(shade) * .35);
    if (key === 'valley') return mix(this.valley, shade > 0 ? this.hor : '#141a2a', Math.abs(shade) * .4);
    const nightMix = (c, a = .9) => mix(c, '#151b2e', this.st.sky.night * a);
    if (key === 'roofA') return nightMix(mix(mix('#c9bba2', this.hor, .3), shade > 0 ? '#ece2cf' : '#8f8a8c', Math.abs(shade))); if (key === 'roofB') return nightMix(mix(mix('#b5876a', this.hor, .3), shade > 0 ? '#d4a582' : '#7e6a64', Math.abs(shade)));
    if (key === 'treeFar') return nightMix(mix(mix('#5d6b4a', this.hor, .3), '#7b8a5c', shade + .5)); if (key === 'oak') return nightMix(mix('#3f4d32', '#66744a', shade + .5), .85);
    if (key === 'roofNear') return nightMix(mix('#6d5a4c', '#a07f66', shade * .5 + .5), .8); if (key === 'palm') return nightMix(mix('#3d5233', '#6a8048', shade + .5), .82); if (key === 'palmTrunk') return nightMix(rgb('#7a6650'), .82);
    if (key === 'dome') return nightMix(mix('#f6f3ec', '#b7b4c4', Math.max(0, -shade)), .72); if (key === 'ridgeLine') return nightMix(mix(this.hill, '#5a4a3a', .3), .9);
    if (key === 'tower') return nightMix(mix(mix('#cfcac2', this.hor, .25), shade > 0 ? '#efe9de' : '#8790a2', Math.abs(shade)), .88);
    if (key === 'stucco') return nightMix(mix('#e9dfcf', shade > 0 ? '#f7f0e2' : '#a89a88', Math.abs(shade)), .82);
    if (key === 'tile') return nightMix(mix('#b65c38', shade > 0 ? '#d97e52' : '#7a3820', Math.abs(shade)), .8);
    if (key === 'windowDay') return mix('#58697a', this.hor, .2); if (key === 'windowLit') return rgb('#ffcc80');
    if (key === 'palmSkirt') return nightMix(mix('#8b7356', shade > 0 ? '#b0966f' : '#5e4c38', Math.abs(shade)), .85);
    if (key === 'yard') return nightMix(mix(mix('#7d7b5c', this.hor, .15), shade > 0 ? '#9a9670' : '#4d4c3a', Math.abs(shade)), .9);
    const p = PAINT[key] || ['#ff00ff'];
    const base = rgb(p[0]); if (shade > 0 && p[1]) return mix(base, p[1], shade); if (shade < 0 && p[2]) return mix(base, p[2], -shade); return base;
  }
  f(key, shade, build, grad, rule, draw) {
    const c = this.c;
    if (key === 'shadow') { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(70,58,48,.32)'; c.filter = `blur(${2.5 * this.S}px)`; build(c); c.fill(rule || 'nonzero'); c.restore(); return; }
    if (grad) { const g = c.createLinearGradient(grad[0], grad[1], grad[2], grad[3]); g.addColorStop(0, css(this.col(key, grad[4]))); g.addColorStop(1, css(this.col(key, grad[5]))); c.fillStyle = g; }
    else c.fillStyle = css(this.col(key, shade));
    if (draw) { draw(c); return; }
    build(c); c.fill(rule || 'nonzero');
    // paint mottle: the same surface carries uneven pigment
    c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = PaintPainter.CALM.has(key) ? .09 : .22; c.fillStyle = this.mottle;
    const m = new DOMMatrix().translateSelf((key.length * 97) % 256, (key.charCodeAt(0) * 31) % 256).scaleSelf(.9); this.mottle.setTransform(m);
    c.fill(rule || 'nonzero'); c.restore();
    // pigment gathers at the edge of every painted shape
    if (!PaintPainter.CALM.has(key)) { c.save(); c.strokeStyle = css(mix(this.col(key, shade), '#2a1f18', .28), .45); c.lineWidth = 1.1; c.stroke(); c.restore(); }
  }
  s(key, shade, width, build) { const c = this.c; c.strokeStyle = css(this.col(key, shade), key === 'frameLine' ? .55 : 1); c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; build(c); c.stroke(); }
  image(id, ch, x, y, w, h) { const c = this.c; c.drawImage(PHOTOS[id].img, x, y, w, h); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(255,240,215,.22)'; c.fillRect(x, y, w, h); c.restore(); }
  sun(p) { const c = this.c; c.save(); const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 180); g.addColorStop(0, 'rgba(255,246,220,.95)'); g.addColorStop(.12, 'rgba(255,230,180,.6)'); g.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = g; c.fillRect(p.x - 200, p.y - 200, 400, 400); c.fillStyle = '#fff8e8'; c.beginPath(); c.arc(p.x, p.y, 20, 0, TAU); c.fill(); c.restore(); }
  moon(p) {
    const c = this.c, r = 15, ph = p.phase, lit = '#f4ecd6', dark = css(mix(this.zen, '#000', .2));
    c.save(); const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 70); g.addColorStop(0, 'rgba(240,232,210,.25)'); g.addColorStop(1, 'rgba(240,232,210,0)'); c.fillStyle = g; c.fillRect(p.x - 80, p.y - 80, 160, 160);
    c.fillStyle = dark; c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill();
    // terminator: lit half plus an ellipse that grows or carves with the phase
    const waxing = ph < .5, k = Math.cos(ph * TAU);
    c.fillStyle = lit; c.beginPath(); c.arc(p.x, p.y, r, -PI / 2, PI / 2, !waxing); c.ellipse(p.x, p.y, Math.abs(k) * r, r, 0, PI / 2, -PI / 2, (k > 0) === waxing); c.fill();
    c.restore();
  }
}

/* ═════════ 2 · San Diego: three-drum risograph ═════════ */
const RISO_INKS = [{ name: 'blue', rgb: rgb('#2f5bb5'), ang: 15 }, { name: 'pink', rgb: rgb('#ff4fa8'), ang: 75 }, { name: 'yellow', rgb: rgb('#ffde1f'), ang: 0 }];
const RISO = { // [blue, pink, yellow] density, then how shade changes it
  wall: [0, .07, .16], frame: [0, 0, .02], frameLine: [.95, 0, 0], cork: [.14, .42, .62], pinframe: [.3, .5, .62], wood: [.1, .48, .82], woodGrain: [.5, .55, .4],
  metal: [.45, .12, 0], metalDark: [.92, .3, 0], bezel: [.86, .3, 0], lampShade: [.08, .92, .1], lampInside: [0, .1, .65], alu: [.24, .06, .02], aluDark: [.86, .3, 0], keys: [.62, .2, 0], screen: [.9, .35, 0],
  screenPaper: [0, 0, .04], screenText: [.85, 0, 0], screenFig: [.15, .65, 0], paperWhite: [0, 0, 0], zine: [0, .9, 0], zineInk: [.92, 0, 0],
  cup: [.06, 0, .05], cupSleeve: [.0, .78, .1], cupLid: [.8, .15, 0], sticky: [0, .05, .9], sun: [0, .32, 1], sea: [.75, .12, 0], concrete: [.14, .02, .2],
  glass: [.86, .22, 0], glassLine: [.98, .35, 0], trunkPale: [.05, .22, .26], eucalyptus: [.6, 0, .8], eucalyptusLight: [.2, 0, .7], lawn: [.48, 0, .8], ink: [.95, .1, 0], tape: [0, .05, .3], pin: [.1, .95, .2], shadow: [.25, .2, 0],
};
class RisoPainter extends Painter {
  constructor(LY, S, ctxs) { super(LY, S, ctxs); this.wob = 1.5; }
  dens(key, shade) {
    if (key === 'skyBand') { const s = shade; return [clamp(.12 - s * .3), clamp(.2 + s * .3), clamp(.22 + s * .45)]; }
    const d = RISO[key] || [.5, .5, .5];
    if (key === 'concrete' && shade < 0) return [clamp(.14 - shade * .5), .02, clamp(.2 - shade * .1)];
    return d.map(v => clamp(v * (1 - shade * .35) + (shade < 0 && v > 0 ? -shade * .12 : 0)));
  }
  f(key, shade, build, grad, rule, draw) {
    this.ctxs.forEach((c, i) => {
      if (key === 'shadow') { c.save(); c.globalCompositeOperation = 'multiply'; const d = this.dens('shadow', 0)[i]; c.fillStyle = `rgba(0,0,0,${d})`; build(c); c.fill(rule || 'nonzero'); c.restore(); return; }
      if (grad) { const g = c.createLinearGradient(grad[0], grad[1], grad[2], grad[3]); const a = 1 - this.dens(key, grad[4])[i], b = 1 - this.dens(key, grad[5])[i]; g.addColorStop(0, `rgb(${a * 255},${a * 255},${a * 255})`); g.addColorStop(1, `rgb(${b * 255},${b * 255},${b * 255})`); c.fillStyle = g; }
      else { const v = (1 - this.dens(key, shade)[i]) * 255; c.fillStyle = `rgb(${v},${v},${v})`; }
      if (draw) draw(c); else { build(c); c.fill(rule || 'nonzero'); }
    });
  }
  s(key, shade, width, build) { this.ctxs.forEach((c, i) => { const v = (1 - this.dens(key, shade)[i]) * 255; c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; build(c); c.stroke(); }); }
  image(id, ch, x, y, w, h) {
    const layers = [ch.lum, ch.warm, ch.yel];
    this.ctxs.forEach((c, i) => {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      if (i === 0) { c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.globalCompositeOperation = 'multiply'; c.filter = 'contrast(1.25)'; c.drawImage(layers[0], x, y, w, h); }
      else { c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.globalCompositeOperation = 'multiply'; c.globalAlpha = i === 1 ? .55 : .35; c.drawImage(layers[i], x, y, w, h); }
      c.restore();
    });
  }
}
function finishRiso(out, layers, S, seed) {
  const W = out.width, H = out.height, o = ctx2d(out), dst = o.createImageData(W, H), D = dst.data;
  const data = layers.map(c => ctx2d(c, { willReadFrequently: true }).getImageData(0, 0, W, H).data);
  const paper = rgb('#f6f1e6'), cell = 4.2 * S;
  const off = [[Math.round(1.6 * S), Math.round(-.8 * S)], [Math.round(-1.2 * S), Math.round(1.4 * S)], [0, Math.round(-1.6 * S)]];
  const trig = RISO_INKS.map(k => [Math.cos(k.ang * DEG), Math.sin(k.ang * DEG)]);
  const r = mulberry32(seed);
  const streakY = new Float32Array(H); for (let y = 0; y < H; y++) streakY[y] = (vnoise(y / (38 * S), 2, 5) - .5) * .18 + (vnoise(y / (6 * S), 9, 7) - .5) * .05;
  const mx = Math.round(26 * S), my = Math.round(24 * S); // the unprinted margin a riso always leaves
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = (y * W + x) * 4; let cr = paper[0], cg = paper[1], cb = paper[2];
    const tooth = hash2(x >> 1, y >> 1, 3);
    if (x > mx && x < W - mx && y > my && y < H - my) {
      for (let i = 0; i < 3; i++) {
        const sx = clamp(x + off[i][0], 0, W - 1) | 0, sy = clamp(y + off[i][1], 0, H - 1) | 0;
        let d = 1 - data[i][(sy * W + sx) * 4] / 255;
        if (d < .01) continue;
        d = clamp(d * (1 + streakY[y] + (i === 1 ? .06 : 0)) + (vnoise(x / (90 * S), y / (90 * S), 11 + i) - .5) * .12);
        let cov;
        if (d > .9) cov = 1 - (hash2(x, y, 40 + i) < .05 + .1 * (1 - tooth) ? .7 : 0); // solid ink with starved specks
        else {
          const [ca, sa] = trig[i], u = (x * ca + y * sa) / cell, v = (-x * sa + y * ca) / cell;
          const du = u - Math.round(u), dv = v - Math.round(v), dist = Math.sqrt(du * du + dv * dv), rad = Math.sqrt(d) * .62;
          cov = clamp((rad - dist) * cell * .9 + .5);
          if (hash2(x, y, 60 + i) < .08) cov *= .4;
        }
        const ink = RISO_INKS[i].rgb, a = cov * (.92 + tooth * .08);
        cr *= 1 - a * (1 - ink[0] / 255); cg *= 1 - a * (1 - ink[1] / 255); cb *= 1 - a * (1 - ink[2] / 255);
      }
    }
    const g = .965 + tooth * .035; D[k] = cr * g; D[k + 1] = cg * g; D[k + 2] = cb * g; D[k + 3] = 255;
  }
  o.putImageData(dst, 0, 0);
}

/* ═════════ 3 · Bengaluru: line engraving ═════════ */
const ENGRAVE_TONE = {
  wall: .1, frame: .03, frameLine: 1, cork: .42, pinframe: .62, wood: .3, woodGrain: .7, woodFront: .6, underDesk: .82, metal: .5, metalDark: .86, lampShade: .6, lampInside: .1,
  alu: .3, aluDark: .82, keys: .55, screen: .92, paperWhite: .02, glass: .28, ink: 1, cup: .3, pcb: .62, chip: .95, cloud: .03, building: .34, windowDark: .8,
  tank: .86, trunk: .8, bezel: .66, canopy: .58, palm: 1, palmTrunk: .8, cloudEdge: .9, layoutBg: .55, layoutLine: 1, layoutMacro: .25, layoutRow: .8, layoutStrap: .08, tape: .12, pin: .7,
};
class EngravePainter extends Painter {
  constructor(LY, S, tone, angle, art, accent) { super(LY, S, [tone, angle, art, accent]); this.t = tone; this.a = angle; this.art = art; this.acc = accent; this.wob = .35; }
  tval(key, shade) { if (key === 'skyBand') return clamp(.07 - shade * .1); return clamp((ENGRAVE_TONE[key] ?? .5) - shade * .22); }
  angStyle() { if (this.angle === 'vp') return 'rgb(0,255,0)'; const a = ((this.angle % 180) + 180) % 180; return `rgb(${Math.round(a / 180 * 255)},0,0)`; }
  f(key, shade, build, grad, rule, draw) {
    if (key === 'flower') { this.acc.fillStyle = '#000'; build(this.acc); this.acc.fill(); this.t.fillStyle = 'rgb(225,225,225)'; build(this.t); this.t.fill(); return; }
    const c = this.t;
    if (key === 'shadow') { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(0,0,0,.35)'; c.filter = `blur(${1.5 * this.S}px)`; build(c); c.fill(); c.restore(); return; }
    if (grad) { const g = c.createLinearGradient(grad[0], grad[1], grad[2], grad[3]); const a = (1 - this.tval(key, grad[4])) * 255, b = (1 - this.tval(key, grad[5])) * 255; g.addColorStop(0, `rgb(${a},${a},${a})`); g.addColorStop(1, `rgb(${b},${b},${b})`); c.fillStyle = g; }
    else { const v = (1 - this.tval(key, shade)) * 255; c.fillStyle = `rgb(${v},${v},${v})`; }
    if (draw) { draw(c); this.a.fillStyle = this.angStyle(); draw(this.a); return; }
    build(c); c.fill(rule || 'nonzero');
    this.a.fillStyle = this.angStyle(); build(this.a); this.a.fill(rule || 'nonzero');
    // engravers outline every form
    if (key !== 'skyBand' && key !== 'wall' && key !== 'wood' && key !== 'cloud') { this.art.strokeStyle = 'rgba(0,0,0,.85)'; this.art.lineWidth = .7; build(this.art); this.art.stroke(); }
  }
  s(key, shade, width, build) { if (key === 'woodGrain') return; const c = this.art; c.strokeStyle = `rgba(0,0,0,${clamp(this.tval(key, shade) + .15)})`; c.lineWidth = Math.max(.6, width * .8); c.lineCap = 'round'; c.lineJoin = 'round'; build(c); c.stroke(); }
  text(key, shade, str, x, y, size, o = {}) { const c = this.art; c.fillStyle = '#000'; c.font = `${o.weight || 600} ${size}px "DM Sans", system-ui, sans-serif`; if ('letterSpacing' in c) c.letterSpacing = (o.tracking || 0) + 'px'; c.fillText(str, x, y); if ('letterSpacing' in c) c.letterSpacing = '0px'; }
  image(id, ch, x, y, w, h) { const c = this.t; c.save(); c.filter = 'contrast(1.15) brightness(1.04)'; c.drawImage(ch.lum, x, y, w, h); c.restore(); this.a.fillStyle = 'rgb(0,0,0)'; this.a.fillRect(x, y, w, h); }
}
function finishEngraving(out, tone, angle, art, accent, S, LY) {
  const W = out.width, H = out.height, o = ctx2d(out), dst = o.createImageData(W, H), D = dst.data;
  const T = ctx2d(tone, { willReadFrequently: true }).getImageData(0, 0, W, H).data, A = ctx2d(angle, { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const C = ctx2d(accent, { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const paper = rgb('#f3efe4'), ink = rgb('#1f2a2c'), red = rgb('#b4432c');
  const sp = 3.3 * S, aa = .9 / sp, vpx = LY.vp[0] * S, vpy = LY.vp[1] * S, ref = 330 * S / sp;
  const pm = Math.round(30 * S); // plate mark
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = (y * W + x) * 4; let t = 1 - T[k] / 255; const ar = A[k], ag = A[k + 1];
    let phase, ang;
    let crowd = 1;
    if (ag > 128) { ang = Math.atan2(y - vpy, x - vpx); phase = ang * ref; crowd = clamp((Math.hypot(x - vpx, y - vpy) / (330 * S) - .45) / .4); }
    else { ang = ar / 255 * PI; phase = (x * Math.cos(ang + PI / 2) + y * Math.sin(ang + PI / 2)) / sp; }
    phase += (vnoise(x / (60 * S), y / (60 * S), 4) - .5) * .5; // the engraver's hand drifts a little
    let inkA = 0; t *= .35 + .65 * crowd;
    if (t > .04) {
      const dc = Math.abs(phase - Math.round(phase)), w = Math.pow(t, 1.1) * .42;
      inkA = clamp((w - dc) / aa + .5);
      if (t > .52) { const a2 = (ag > 128 ? ang + PI / 2 : ang) + 1.0, p2 = (x * Math.cos(a2) + y * Math.sin(a2)) / (sp * 1.05), d2 = Math.abs(p2 - Math.round(p2)), w2 = (t - .52) * .62; inkA = Math.max(inkA, clamp((w2 - d2) / aa + .5)); }
      if (t > .86) { const a3 = ang - .8, p3 = (x * Math.cos(a3) + y * Math.sin(a3)) / (sp * .9), d3 = Math.abs(p3 - Math.round(p3)), w3 = (t - .86) * 1.2; inkA = Math.max(inkA, clamp((w3 - d3) / aa + .5)); }
    }
    // red plate: the flame tree's flowers, cross-hatched at its own angle
    const cr2 = C[k + 3] / 255; let redA = 0;
    if (cr2 > .02) { const p4 = (x * .5 + y * .866) / (sp * .8), d4 = Math.abs(p4 - Math.round(p4)); redA = clamp((cr2 * .45 - d4) / aa + .5) * .95; }
    const tooth = hash2(x, y, 9) * .04;
    let cr = paper[0] * (1 - tooth), cg = paper[1] * (1 - tooth), cb = paper[2] * (1 - tooth);
    if (x < pm || x > W - pm || y < pm || y > H - pm) { const edge = Math.min(Math.abs(x - pm), Math.abs(x - (W - pm)), Math.abs(y - pm), Math.abs(y - (H - pm))); const emb = edge < 2.2 * S ? .93 : 1; D[k] = cr * emb * 1.01; D[k + 1] = cg * emb * 1.01; D[k + 2] = cb * emb; D[k + 3] = 255; continue; }
    cr = lerp(cr, red[0], redA); cg = lerp(cg, red[1], redA); cb = lerp(cb, red[2], redA);
    cr = lerp(cr, ink[0], inkA); cg = lerp(cg, ink[1], inkA); cb = lerp(cb, ink[2], inkA);
    // plate tone: the faint film of ink left on the wiped plate
    const pt = .02 + vnoise(x / (140 * S), y / (140 * S), 6) * .03;
    D[k] = cr * (1 - pt); D[k + 1] = cg * (1 - pt); D[k + 2] = cb * (1 - pt * .8); D[k + 3] = 255;
  }
  o.putImageData(dst, 0, 0);
  o.save(); o.globalCompositeOperation = 'multiply'; o.globalAlpha = .9; o.filter = `contrast(1.4)`; o.drawImage(art, 0, 0); o.restore();
  // re-establish the plate margin over the outlines
  o.save(); o.fillStyle = css(paper); o.beginPath(); o.rect(0, 0, W, H); o.rect(pm, H - pm, W - 2 * pm, -(H - 2 * pm)); o.fill('evenodd'); o.restore();
  o.save(); o.strokeStyle = 'rgba(80,70,50,.18)'; o.lineWidth = 1.2 * S; o.strokeRect(pm - 1.5 * S, pm - 1.5 * S, W - 2 * pm + 3 * S, H - 2 * pm + 3 * S); o.restore();
}

/* ═════════ 4 · Surathkal: cyanotype ═════════ */
const CYANO_TONE = {
  wall: .62, frame: .04, frameLine: .95, cork: .72, pinframe: .85, wood: .8, woodGrain: .92, woodFront: .9, underDesk: 1, metal: .55, metalDark: .88, lampShade: .7, lampInside: .1,
  paperWhite: .03, glass: .2, ink: .95, tube: .1, screen: .93, scopeCase: .32, scopeGrid: .6, trace: 0, knob: .9, scopeLabel: .92, breadboard: .08, chipDip: .95, wire: .85,
  planisphere: .62, cloud: .02, sun: 0, sea: .78, seaLine: .92, rock: .8, lighthouse: .05, lighthouseBand: .85, lantern: .9, sand: .32, palm: .97, palmTrunk: .9, tape: .15, pin: .85,
};
class CyanoPainter extends Painter {
  constructor(LY, S, ctx) { super(LY, S, [ctx]); this.c = ctx; this.wob = 1.4; }
  tval(key, shade) { if (key === 'skyBand') return clamp(.48 - shade * .45); return clamp((CYANO_TONE[key] ?? .5) - shade * .24); }
  f(key, shade, build, grad, rule, draw) {
    const c = this.c;
    if (key === 'shadow') { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(0,0,0,.4)'; c.filter = `blur(${3 * this.S}px)`; build(c); c.fill(); c.restore(); return; }
    if (grad) { const g = c.createLinearGradient(grad[0], grad[1], grad[2], grad[3]); const a = (1 - this.tval(key, grad[4])) * 255, b = (1 - this.tval(key, grad[5])) * 255; g.addColorStop(0, `rgb(${a},${a},${a})`); g.addColorStop(1, `rgb(${b},${b},${b})`); c.fillStyle = g; }
    else { const v = (1 - this.tval(key, shade)) * 255; c.fillStyle = `rgb(${v},${v},${v})`; }
    if (draw) draw(c); else { build(c); c.fill(rule || 'nonzero'); }
  }
  s(key, shade, width, build) { const c = this.c, v = (1 - this.tval(key, shade)) * 255; c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; build(c); c.stroke(); }
  image(id, ch, x, y, w, h) { const c = this.c; c.save(); c.filter = 'contrast(1.2)'; c.drawImage(ch.lum, x, y, w, h); c.restore(); }
}
// fronds laid straight onto the paper before exposure: the oldest way to print a palm
function frondMask(W, H, S, LY) {
  const m = makeCanvas(W, H), x = ctx2d(m); x.setTransform(S, 0, 0, S, 0, 0);
  const frond = (bx, by, ang, len, seed, lift) => {
    const r = mulberry32(seed); x.save(); x.translate(bx, by); x.rotate(ang);
    x.filter = `blur(${lift * S}px)`; x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineCap = 'round';
    x.lineWidth = 5; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * .5, -len * .06, len, len * .05); x.stroke();
    for (let k = 3; k < 46; k++) {
      const t = k / 46, px = len * t, py = -len * .06 * Math.sin(t * PI) + t * t * len * .05, ll = (1 - t * .7) * len * .26 * (.8 + r() * .3);
      for (const side of [-1, 1]) { const a = side * (1.05 + r() * .2) + .35; x.lineWidth = 3.4 * (1 - t * .5); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * ll * .5, py + Math.sin(a) * ll * .5 + 4, px + Math.cos(a) * ll + side * 4, py + Math.sin(a) * ll + 10); x.stroke(); }
    }
    x.restore();
  };
  frond(-30, LY.H * .06, .32, LY.W * .3, 3, .6);
  frond(LY.W + 30, LY.H * .98, PI + .42, LY.W * .34, 5, 1.6);
  return m;
}
function brushMask(W, H, S, seed) { // where the sensitiser was brushed on
  const m = makeCanvas(W, H), x = ctx2d(m), r = mulberry32(seed);
  x.fillStyle = '#fff'; const inset = 30 * S;
  for (let i = 0; i < 26; i++) {
    const y0 = inset + (H - 2 * inset) * i / 25, th = (H - 2 * inset) / 25 * 1.9;
    x.beginPath(); const x0 = inset + (r() - .5) * 40 * S, x1 = W - inset + (r() - .5) * 40 * S;
    const pts = []; for (let k = 0; k <= 30; k++) { const t = k / 30; pts.push([lerp(x0, x1, t), y0 - th / 2 + (vnoise(t * 9, i, seed) - .5) * 10 * S]); }
    for (let k = 30; k >= 0; k--) { const t = k / 30; pts.push([lerp(x0, x1, t) + (k === 30 ? (r() - .5) * 30 * S : 0), y0 + th / 2 + (vnoise(t * 9, i + 50, seed) - .5) * 10 * S]); }
    poly(x, pts); x.fill();
    // dry-brush bristle tails at both ends
    for (let b = 0; b < 14; b++) { const yy = y0 + (r() - .5) * th, len = (20 + r() * 60) * S; x.fillRect(x0 - len, yy, len, (1 + r() * 2.5) * S); x.fillRect(x1, yy, len * (.5 + r()), (1 + r() * 2) * S); }
  }
  // dry-brush streaks: thin runs of bare paper where the bristles skipped, densest at the top and bottom
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 260; i++) {
    const edge = r() < .5, d = Math.pow(r(), 2.2) * (H * .12), yy = edge ? inset + d - (H - 2 * inset) / 25 : H - inset - d + (H - 2 * inset) / 25;
    const xx = r() * W, len = (40 + r() * 260) * S * (1 - d / (H * .12)) + 10 * S;
    x.globalAlpha = .6 + r() * .4; x.fillRect(xx, yy, len, (.8 + r() * 1.8) * S);
  }
  x.globalAlpha = 1;
  return m;
}
function finishCyanotype(out, expo, S, LY) {
  const W = out.width, H = out.height, o = ctx2d(out), dst = o.createImageData(W, H), D = dst.data;
  const E = ctx2d(expo, { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const F = ctx2d(frondMask(W, H, S, LY), { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const B = ctx2d(brushMask(W, H, S, 7), { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const paper = rgb('#f4f2ea'), stain = rgb('#dfe7ef'), mid = rgb('#3c6fae'), deep = rgb('#173a6e');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = (y * W + x) * 4, coat = B[k + 3] / 255 * (B[k] / 255);
    let e = 1 - E[k] / 255;
    const fr = F[k + 3] / 255;
    e = e * (1 - fr * .96);
    const uneven = (fbm(x / (220 * S), y / (220 * S), 5, 3) - .5) * .25 + (vnoise(x / (3 * S), y / (40 * S), 2) - .5) * .06;
    e = clamp(e * (1.02 + uneven) + uneven * .25);
    const tooth = hash2(x, y, 4) * .05;
    e = clamp((e - .08) * 1.18); let c = e < .45 ? mix(stain, mid, e / .45) : mix(mid, deep, (e - .45) / .55);
    c = mix(paper, c, coat);
    if (hash2(x >> 2, y >> 2, 21) < .00012) c = mix(c, paper, .8); // dust that kept the light out
    D[k] = c[0] * (1 - tooth); D[k + 1] = c[1] * (1 - tooth); D[k + 2] = c[2] * (1 - tooth * .6); D[k + 3] = 255;
  }
  o.putImageData(dst, 0, 0);
}
