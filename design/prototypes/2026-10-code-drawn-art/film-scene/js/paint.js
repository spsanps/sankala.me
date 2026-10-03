/* ═══════════════════════════════════════════════════════════════════════════
   paint.js — egg tempera and water-gilded gold, the hand of Film 02.
   Copied from ../paper-robots-made/js/tempera.js (the kit's poster/thumbnail
   renderer): the palette, the gold leaf, the craquelure, the hatched tempera
   painting, punches and incised lines. The eye and the rocks are rebuilt in
   film.js for the moving picture.
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';
const TEMP = {
  goldD: '#6f4c13', goldM: '#bf9237', goldL: '#f0d68c', bole: '#9a3b22',
  cin: '#c8381f', cinL: '#e5633d', lake: '#7d1b16', azur: '#2b4a9a', azurD: '#172659', azurL: '#5c7cc4',
  verte: '#6f7a4a', verteD: '#3b4528', ochre: '#b8892f', ochreL: '#d9b465',
  agent: '#6b7a3c', agentL: '#adb872', agentD: '#39441f',
  white: '#f1e8d2', brown: '#2a1d18', gesso: '#efe6d1',
};
const LIGHT = [-0.55, -0.83];


// ── gold leaf: squares laid in rows, burnished unevenly, wrinkled, torn ──────
function* makeGoldLeaf(W, H, u, seed = 3, q = null) {
  q = q || Math.max(30, 78 * u);
  const c = makeCanvas(W, H), ctx = ctxOf(c), img = ctx.createImageData(W, H), d = img.data;
  const g = makeCanvas(W, H), gctx = ctxOf(g), gimg = gctx.createImageData(W, H), gd = gimg.data;
  // burnished gold is a mirror: its value comes from what it reflects
  const ramp = [[0, hexRGB('#3f2806')], [0.3, hexRGB('#80561a')], [0.55, hexRGB('#c39339')], [0.8, hexRGB('#ecd084')], [1, hexRGB('#fff1c4')]];
  const rampAt = v => { v = clamp(v); for (let i = 1; i < ramp.length; i++) if (v <= ramp[i][0]) return mixRGB(ramp[i - 1][1], ramp[i][1], (v - ramp[i - 1][0]) / (ramp[i][0] - ramp[i - 1][0])); return ramp[ramp.length - 1][1]; };
  const B = hexRGB(TEMP.bole);
  const rows = Math.ceil(H / q) + 2, offs = [];
  for (let r = 0; r < rows; r++) offs.push(hash2(r, 1, seed) * q);
  const tilt = 0.012;
  yield* pixelRows(H, y => {
    for (let x = 0; x < W; x++) {
      const yy = y + x * tilt, row = Math.floor(yy / q), fy = yy - row * q;
      const xx = x + offs[(row + rows * 4) % rows] - y * tilt, col = Math.floor(xx / q), fx = xx - col * q;
      const id = hash2(col, row, seed + 1), ang = (hash2(col, row, seed + 2) - 0.5) * 1.2;
      const ca = Math.cos(ang), sa = Math.sin(ang), ax = x * ca + y * sa, ay = -x * sa + y * ca;
      const broad = Math.sin((x * 0.62 + y * 0.78) / (230 * u) + fbm(x / (300 * u), y / (300 * u), 2, seed + 7) * 4) * 0.16;
      let b = 0.62 + (id - 0.5) * 0.06 + (fbm(x / (190 * u), y / (190 * u), 3, seed + 3) - 0.5) * 0.4 + broad * 1.25; // film: calmer leaf-to-leaf, broader burnish
      const scr = vnoise(ax / (30 * u), ay / (0.8 * u), seed + 4);
      b += (scr - 0.5) * 0.12;
      const rn = 1 - Math.abs(2 * fbm(x / (24 * u), y / (24 * u), 3, seed + 5) - 1);
      const wr = smooth(0.965, 0.995, rn) * smooth(0.45, 0.7, vnoise(x / (90 * u), y / (90 * u), seed + 8));
      b -= wr * 0.2;
      const seam = Math.min(fx, fy);
      if (seam < 0.8 * u) b -= 0.11 * (1 - seam / (0.8 * u));   // film: quieter seams
      else if (seam < 3.2 * u) b += 0.025;
      const tear = seam < 5 * u && vnoise(x / (6 * u), y / (6 * u), seed + 6) > 0.935;   // film: fewer tears
      b = Math.min(b, 0.9 - 0.04 * hash2(col, row, seed + 9));
      const col3 = tear ? mixRGB(B, hexRGB('#5e2a14'), 0.3) : rampAt(b);
      const i = (y * W + x) * 4;
      d[i] = col3[0]; d[i + 1] = col3[1]; d[i + 2] = col3[2]; d[i + 3] = 255;
      const spec = tear ? 0 : smooth(0.5, 0.9, b) * (1 - wr) * (seam < 0.8 * u ? 0.2 : 1);
      gd[i] = 255; gd[i + 1] = 247; gd[i + 2] = 212; gd[i + 3] = spec * 255;
    }
  });
  ctx.putImageData(img, 0, 0); gctx.putImageData(gimg, 0, 0);
  // film: the glint is softened so moving light reads as burnish, not as tiles
  { const t = makeCanvas(W, H), tc = ctxOf(t); tc.filter = `blur(${2.2 * u}px)`; tc.drawImage(g, 0, 0); tc.filter = 'none'; gctx.clearRect(0, 0, W, H); gctx.drawImage(t, 0, 0); }
  const leaves = [];
  for (let r = -1; r < rows; r++) for (let cI = -1; cI < Math.ceil(W / q) + 2; cI++) {
    const off = offs[(r + rows * 4) % rows], x0 = cI * q - off, y0 = r * q;
    leaves.push({ r, c: cI, poly: [[x0, y0], [x0 + q, y0], [x0 + q, y0 + q], [x0, y0 + q]].map(([px, py]) => [px + py * tilt, py - px * tilt]) });
  }
  return { gold: c, glint: g, leaves, q };
}

// ── craquelure: a Voronoi crack network with warped coordinates ─────────────
function* makeCracks(W, H, u, seed = 9, cell = 22) {
  const c = makeCanvas(W, H), ctx = ctxOf(c), img = ctx.createImageData(W, H), d = img.data;
  const cs = cell * u;
  const seedPt = (gx, gy) => [(gx + 0.15 + 0.7 * hash2(gx, gy, seed)) * cs, (gy + 0.15 + 0.7 * hash2(gx, gy, seed + 1)) * cs];
  yield* pixelRows(H, y => {
    for (let x = 0; x < W; x++) {
      const wx = x + (fbm(x / (30 * u), y / (30 * u), 2, seed + 2) - 0.5) * 9 * u, wy = y + (fbm(x / (30 * u), y / (30 * u), 2, seed + 3) - 0.5) * 9 * u;
      const gx = Math.floor(wx / cs), gy = Math.floor(wy / cs);
      let d1 = 1e9, d2 = 1e9;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const p = seedPt(gx + i, gy + j), dd = Math.hypot(wx - p[0], wy - p[1]);
        if (dd < d1) { d2 = d1; d1 = dd; } else if (dd < d2) d2 = dd;
      }
      const e = d2 - d1, wv = (0.32 + vnoise(x / (14 * u), y / (14 * u), seed + 4) * 0.5) * u;
      const a = smooth(wv * 1.4, wv * 0.3, e) * (0.55 + 0.45 * vnoise(x / (40 * u), y / (40 * u), seed + 5));
      const i4 = (y * W + x) * 4;
      d[i4] = 40; d[i4 + 1] = 26; d[i4 + 2] = 16; d[i4 + 3] = a * 255;
    }
  });
  ctx.putImageData(img, 0, 0);
  return c;
}

// ── tempera painting: lay flat, then model with hatching ─────────────────────
function shadeSphere(cx, cy, R, lx = LIGHT[0], ly = LIGHT[1]) {
  return (x, y) => { const nx = (x - cx) / R, ny = (y - cy) / R, r2 = nx * nx + ny * ny; return clamp((nx * lx + ny * ly) * 0.95 - r2 * 0.35 + 0.12, -1, 1); };
}
function paintForm(ctx, poly, o, rnd, u) {
  const { base, light, dark, shade = () => 0, dir = null, density = 1, len = [5, 12], width = [0.7, 1.15], outline = TEMP.brown, outlineW = 1.3, outlineA = 0.75, flatNoise = 0.06, strokeA = 1 } = o;
  const bb = bboxOf(poly);
  ctx.save(); ctx.beginPath(); polyPath(ctx, poly); ctx.clip();
  ctx.fillStyle = base; ctx.fillRect(bb.x0 - 2, bb.y0 - 2, bb.w + 4, bb.h + 4);
  // flat-laid paint is never perfectly even: soft mottling in small dabs
  const bcol = hexRGB(base), nd = Math.round(bb.w * bb.h / (90 * u * u) * 0.6);
  for (let i = 0; i < nd; i++) {
    const x = bb.x0 + rnd() * bb.w, y = bb.y0 + rnd() * bb.h, r = (4 + rnd() * 10) * u;
    ctx.fillStyle = rgba(shadeRGB(bcol, (rnd() - 0.5) * flatNoise * 2), 0.35); ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, rnd() * TAU, 0, TAU); ctx.fill();
  }
  // hatching: short fine strokes that follow the form, denser where it turns
  const Lc = hexRGB(light), Dc = hexRGB(dark);
  const n = Math.round(bb.w * bb.h / (16 * u * u) * density);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = bb.x0 + rnd() * bb.w, y = bb.y0 + rnd() * bb.h, s = shade(x, y);
    const pLight = s > 0 ? Math.pow(s, 0.9) : 0, pDark = s < 0 ? Math.pow(-s, 0.85) : 0, r = rnd();
    let col = null, a = 0;
    if (r < pLight) { col = mixRGB(Lc, [255, 250, 235], rnd() * 0.25 * s); a = (0.35 + 0.45 * s) * strokeA; }
    else if (r < pLight + pDark * 0.9) { col = Dc; a = (0.3 + 0.45 * (-s)) * strokeA; }
    if (!col) continue;
    const ang = (dir ? dir(x, y) : 0) + (rnd() - 0.5) * 0.35, l = (len[0] + rnd() * (len[1] - len[0])) * u;
    const ca = Math.cos(ang), sa = Math.sin(ang), bow = (rnd() - 0.5) * l * 0.25;
    ctx.beginPath(); ctx.moveTo(x - ca * l / 2, y - sa * l / 2); ctx.quadraticCurveTo(x - sa * bow, y + ca * bow, x + ca * l / 2, y + sa * l / 2);
    ctx.strokeStyle = rgba(col, a); ctx.lineWidth = (width[0] + rnd() * (width[1] - width[0])) * u; ctx.stroke();
  }
  ctx.restore();
  if (outline) { ctx.save(); ctx.lineJoin = 'round'; ctx.beginPath(); polyPath(ctx, wobble(poly, 6 * u, 0.7 * u, rnd)); ctx.strokeStyle = rgba(hexRGB(outline), outlineA); ctx.lineWidth = outlineW * u; ctx.stroke(); ctx.restore(); }
}
// a punched dimple in gold: dark upper-left wall, bright lower-right wall
function punch(ctx, x, y, r, u, kind = 'ring') {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = 'rgba(60,36,8,0.32)'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r * 0.92, Math.PI * 0.95, Math.PI * 1.75); ctx.strokeStyle = 'rgba(52,30,6,0.85)'; ctx.lineWidth = Math.max(0.8, r * 0.38); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * 0.92, Math.PI * -0.05, Math.PI * 0.75); ctx.strokeStyle = 'rgba(255,240,190,0.85)'; ctx.lineWidth = Math.max(0.7, r * 0.3); ctx.stroke();
  if (kind === 'rosette') for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6, r * 0.42, 0, TAU); ctx.fillStyle = 'rgba(58,34,8,0.6)'; ctx.fill(); }
  ctx.restore();
  void u;
}
// an incised line in gold: a dark groove with a bright lip below-right
function incise(ctx, pl, u, w = 1) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); polyPath(ctx, pl, false); ctx.strokeStyle = 'rgba(255,236,180,0.7)'; ctx.lineWidth = 1.1 * w * u; ctx.translate(0.8 * u, 0.9 * u); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); polyPath(ctx, pl, false); ctx.strokeStyle = 'rgba(58,34,8,0.85)'; ctx.lineWidth = 1.0 * w * u; ctx.stroke();
  ctx.restore();
}


function eyeLids(open, k = 1) {
  const up = [], lo = [], n = 40;
  for (let i = 0; i <= n; i++) {
    const x = -1 + 2 * i / n, s = Math.max(0, 1 - x * x);
    up.push([x, -0.5 * open * Math.pow(s, 0.72) * (1 + 0.1 * x) * k]);
    lo.push([x, 0.3 * open * Math.pow(s, 0.9) * (1 - 0.12 * x) * k + 0.02 * open * s]);
  }
  return { up, lo };
}
