/* The apse in mosaic: the tablets the words are written on.
   Every block of words sits on a polished slab of pale marble, book-matched (its veins mirrored
   about the middle, as the revetment of Hagia Sophia is), set into the wall in a frame laid in
   tesserae: a dark row, gold, porphyry red, gold. The intro is a tabula ansata, the Roman
   inscription tablet with a dovetail "handle" on each side. The words themselves stay HTML.
   The frame is laid by the same engine as the apse; the marble is painted once, softly, so the
   type reads on it. */
import { mix, clamp, smooth, rgb, fbm, mulberry32 } from './core.js';
import { laySteps, corners } from './lay.js';

const P = {
  marble: rgb('#f7f2e6'), vein: rgb('#dcd2bf'), vein2: rgb('#cbbfa7'), warm: rgb('#f3e8d2'),
  gold: [rgb('#d9ad4f'), rgb('#e8c46a'), rgb('#c0913a'), rgb('#f0d488')], red: rgb('#8e2c27'), redLit: rgb('#a8392f'),
  outline: rgb('#231d18'), grout: rgb('#3e392f'), lapis: rgb('#1e2f66'),
};
const SHEET_STONE = 6;
const q8 = new Float32Array(8);

/** the tablet's outline (css px, origin top left of the canvas): a rectangle `x0..x1`, `0..h`,
    with dovetail handles reaching `ear` px out on each side when `ansae` */
function outline(c, x0, x1, h, ansae, ear) {
  c.moveTo(x0, 0); c.lineTo(x1, 0);
  if (ansae) { const cy = h / 2, n = h * .2, m = h * .36; c.lineTo(x1, cy - n); c.lineTo(x1 + ear, cy - m); c.lineTo(x1 + ear, cy + m); c.lineTo(x1, cy + n); }
  c.lineTo(x1, h); c.lineTo(x0, h);
  if (ansae) { const cy = h / 2, n = h * .2, m = h * .36; c.lineTo(x0, cy + n); c.lineTo(x0 - ear, cy + m); c.lineTo(x0 - ear, cy - m); c.lineTo(x0, cy - n); }
  c.closePath();
}

/** Paint a tablet on `canvas` for an element `w` × `h` css px. Returns a promise. */
export async function paintTablet(target, w, h, { ansae = false, ear = 0, stonePx = 6.6, rows = 4, seed = 3, dpr = 1 } = {}) {
  const pad = ansae ? ear : 0, W = w + 2 * pad;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(h * dpr);
  const c = canvas.getContext('2d');
  const frameW = stonePx * rows;
  /* the marble: one book-matched slab, painted once and shared by every tablet */
  const m = marbleSlab(seed);
  c.save(); c.scale(dpr, dpr);
  c.beginPath(); outline(c, pad, pad + w, h, ansae, ear); c.fillStyle = `rgb(${P.grout.join(',')})`; c.fill();
  c.save(); c.beginPath(); c.rect(pad + frameW, frameW, w - 2 * frameW, h - 2 * frameW); c.clip(); c.imageSmoothingQuality = 'high';
  // the slab is mirrored about the tablet's middle (book-matched) and repeated, mirrored, down a tall tablet
  const sw = m.width * 2, sh = m.height * 2, cxm = pad + w / 2;
  for (let y0 = 0, flip = false; y0 < h; y0 += sh, flip = !flip) {
    for (const side of [-1, 1]) {
      c.save(); c.translate(cxm, y0 + (flip ? sh : 0)); c.scale(side, flip ? -1 : 1);
      c.drawImage(m, -1.5, -1.5, sw + 1.5, sh + 3); c.restore();   // a hair of overlap, so the halves meet without a seam
    }
  }
  // a faint polish: the light from above
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,252,240,.18)'); g.addColorStop(1, 'rgba(120,100,70,.06)'); c.fillStyle = g; c.fillRect(0, 0, W, h);
  c.restore(); c.restore();

  /* the frame, in tesserae, laid along the outline */
  const q = SHEET_STONE / stonePx, panel = { x0: -4, y0: -4 };
  const regions = [
    { name: 'frame', group: 'frame', clip: false, fine: 1, src: ['outside'], draw: cc => outline(cc, pad, pad + w, h, ansae, ear), fill: () => P.gold[0] },
    { name: 'field', group: 'field', clip: false, skip: true, draw: cc => cc.rect(pad + frameW - .5, frameW - .5, w - 2 * frameW + 1, h - 2 * frameW + 1), fill: () => P.marble },
  ];
  const gen = laySteps(regions, [{ inside: ['frame'], against: ['outside'] }], { W: Math.ceil((W + 8) * q), H: Math.ceil((h + 8) * q), q, s: SHEET_STONE, seed, panel });
  let res = gen.next(), t0 = performance.now();
  while (!res.done) { if (performance.now() - t0 > 12) { await new Promise(r => setTimeout(r, 0)); t0 = performance.now(); } res = gen.next(); }
  const rnd = mulberry32(seed * 13);
  const kk = dpr / q, ox = panel.x0 * dpr, oy = panel.y0 * dpr;
  const depth = (x, y) => {   // distance in from the outline (approximate: from the rectangle, or the ear)
    const xr = Math.min(x - pad, pad + w - x), yr = Math.min(y, h - y);
    if (x < pad || x > pad + w) return Math.min(yr, Math.abs(x < pad ? x - pad + ear : pad + w + ear - x), Math.abs(Math.abs(y - h / 2) - h * .36 * (1 - 0)) + 0);
    return Math.min(xr, yr);
  };
  for (const t of res.value.stones) {
    const x = t.x / q + panel.x0, y = t.y / q + panel.y0;
    if (t.k === 0) { t.col = P.outline; continue; }
    const r = Math.floor(depth(x, y) / stonePx);
    t.col = r <= 1 ? P.gold[(rnd() * 4) | 0] : r === 2 ? mix(P.red, P.redLit, rnd() * .6) : P.gold[(rnd() * 4) | 0];
    if (x < pad || x > pad + w) t.col = (t.row % 3 === 1) ? mix(P.red, P.redLit, rnd() * .6) : P.gold[(rnd() * 4) | 0];
  }
  for (const t of res.value.stones) paint(c, { ...t, l: t.l + t.s * .2, w: t.w + t.s * .2 }, mix(P.grout, t.col, .45), kk, ox, oy, true);
  for (const t of res.value.stones) paint(c, t, t.col, kk, ox, oy, false);
  target.width = canvas.width; target.height = canvas.height;
  target.style.width = W + 'px'; target.style.height = h + 'px'; target.style.left = -pad + 'px';
  target.getContext('2d').drawImage(canvas, 0, 0);
}

/* a slab of veined marble, half size (it is drawn at twice this): veins from warped noise */
const slabs = new Map();
function marbleSlab(seed) {
  const key = seed % 3; if (slabs.has(key)) return slabs.get(key);
  const mw = 340, mh = 260, m = document.createElement('canvas'); m.width = mw; m.height = mh;
  const mc = m.getContext('2d'), img = mc.createImageData(mw, mh), d = img.data;
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    const X = x * 2, Y = y * 2;
    const warp = fbm(X / 210, Y / 210, key + 3, 3) * 4.2;
    const v = Math.abs(Math.sin((X * .006 + Y * .011 + warp) * 3.1));
    const v2 = Math.abs(Math.sin((X * .013 - Y * .004 + warp * 1.7) * 2.3));
    let col = mix(P.marble, P.warm, fbm(X / 300, Y / 260, key + 12, 2) * .7);
    col = mix(col, P.vein, (1 - smooth(0, .06, v)) * .45);
    col = mix(col, P.vein2, (1 - smooth(0, .02, v2)) * .22);
    const k = (y * mw + x) * 4; d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255;
  }
  mc.putImageData(img, 0, 0);
  slabs.set(key, m);
  return m;
}

function paint(c, t, col, k, ox, oy, flat) {
  corners(t, q8);
  c.beginPath(); c.moveTo(q8[0] * k + ox, q8[1] * k + oy); for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy); c.closePath();
  c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; c.fill();
  if (flat) return;
  c.lineWidth = Math.max(.7, k * .5); c.strokeStyle = 'rgba(255,253,244,.28)';
  c.beginPath(); c.moveTo(q8[6] * k + ox, q8[7] * k + oy); c.lineTo(q8[0] * k + ox, q8[1] * k + oy); c.lineTo(q8[2] * k + ox, q8[3] * k + oy); c.stroke();
}
export { clamp };
