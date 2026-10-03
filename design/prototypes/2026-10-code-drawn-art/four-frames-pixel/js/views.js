/* Four frames, pixel edition: what is outside the window, place by place. Each view is a stack of
   parallax layers (sky, far, mid, near) the size of the glass, plus an emissive overlay for things
   that give their own light (stars, lit windows, the lighthouse). Live details tick in whole
   frames, about ten a second, the way sprites do. */
import { Spr, C, bayer, hash, rng } from './pix.js';

/* ───────── shared shapes ───────── */
/** Sky as bands of one ramp, dark at the top, each seam ordered-dithered over a few rows. */
function skyBands(s, H, stops, mat = 'sky') {
  // stops: [[yFrac, level], …] from the top down; each seam is two rows of ordered dither
  for (let y = 0; y < s.h; y++) {
    const f = y / H; let i = 0; while (i < stops.length - 1 && f >= stops[i + 1][0]) i++;
    const lv = stops[i][1], next = stops[i + 1], seam = next ? Math.round(next[0] * H) - y : 99;
    for (let x = 0; x < s.w; x++) {
      let l = lv;
      if (seam === 1 && bayer(x, y) < .5) l = next[1]; else if (seam === 2 && bayer(x, y) < .2) l = next[1];
      s.set(x, y, C(mat, l));
    }
  }
}
/** A pixel cumulus: a union of discs with a flat base, lit from the upper left. */
function cloud(s, cx, cy, w, h, mat = 'cream', levels = [2, 3, 4], seed = 1) {
  const r = rng(seed), blobs = [];
  const n = Math.max(3, Math.round(w / 6));
  for (let i = 0; i < n; i++) { const t = i / (n - 1), bx = cx - w / 2 + t * w, rad = h * (.45 + .55 * Math.sin(t * Math.PI)) * (.8 + r() * .35); blobs.push([bx, cy - rad * .45, rad]); }
  const inside = (x, y) => y <= cy + 1 && blobs.some(([bx, by, rad]) => (x - bx) ** 2 + ((y - by) * 1.15) ** 2 <= rad * rad);
  for (let y = Math.floor(cy - h * 1.6); y <= cy + 1; y++) for (let x = Math.floor(cx - w / 2 - h); x <= cx + w / 2 + h; x++) {
    if (!inside(x, y)) continue;
    const up = inside(x - 1, y - 2) && inside(x, y - 2), low = y >= cy - 1;
    s.set(x, y, C(mat, low ? levels[0] : up ? levels[1] : levels[2]));
  }
}
function palm(s, x, baseY, topY, lean, mat = 'leaf', trunk = 'wood', fronds = 9, len = 16, dark = false) {
  // a curving trunk, slightly thicker at the foot, ringed
  const n = baseY - topY;
  for (let k = 0; k <= n; k++) {
    const t = k / n, xx = Math.round(x + lean * t * t), yy = baseY - k, w = t < .15 ? 3 : 2;
    s.rect(xx, yy, w, 1, C(trunk, dark ? 0 : (k % 3 === 0 ? 1 : 2))); if (!dark) s.set(xx, yy, C(trunk, k % 3 === 0 ? 2 : 3));
  }
  const cx = Math.round(x + lean) + 1, cy = topY;
  // fronds: each rises, arches and droops, with leaflets hanging from its spine
  for (let i = 0; i < fronds; i++) {
    const side = i % 2 ? 1 : -1, rank = Math.floor(i / 2), spread = fronds / 2;
    const rise = .9 - rank / spread * 1.5, L = len - rank % 3;
    let prev = null;
    for (let k = 1; k <= L; k++) {
      const t = k / L, xx = Math.round(cx + side * k * (.85 + rank * .05)), yy = Math.round(cy - rise * k * .7 + t * t * L * .75);
      s.set(xx, yy, C(mat, dark ? 0 : t > .75 ? 2 : 3));
      if (dark) s.set(xx, yy + 1, C(mat, 0));
      if (prev && Math.abs(prev[1] - yy) > 1) s.set(xx, Math.round((prev[1] + yy) / 2), C(mat, dark ? 0 : 3));
      if (k > 2 && (dark || k % 2 === 0)) {
        const hang = Math.max(1, Math.round((dark ? 4 : 3) - t * 2));
        for (let h = 1; h <= hang; h++) { s.set(xx - side * Math.floor(h / 2), yy + h + (dark ? 1 : 0), C(mat, dark ? 0 : h === hang ? 1 : 2)); }
      }
      prev = [xx, yy];
    }
  }
  s.rect(cx - 2, cy - 1, 4, 3, C(mat, dark ? 0 : 1));
  if (!dark) { s.set(cx - 1, cy + 2, C('wood', 1)); s.set(cx + 1, cy + 2, C('wood', 1)); s.set(cx, cy + 3, C('wood', 1)); }
}
/** A canopy of leaf clusters: lobes shaded as forms (lit from the upper left), with clumps of
    brighter leaves on a jittered grid; never per-pixel noise. `hang` adds drooping strands. */
function canopy(s, lobes, mat = 'leaf', seed = 1, opt = {}) {
  const inside = (x, y) => { for (const [cx, cy, rx, ry] of lobes) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) return [dx, dy]; } return null; };
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [cx, cy, rx, ry] of lobes) { x0 = Math.min(x0, cx - rx); x1 = Math.max(x1, cx + rx); y0 = Math.min(y0, cy - ry); y1 = Math.max(y1, cy + ry); }
  for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) {
    const n = inside(x, y); if (!n) continue;
    const light = -(n[0] * .55 + n[1] * .85);
    const rim = !inside(x + 1, y) || !inside(x, y + 1);
    s.set(x, y, C(mat, rim && light < .1 ? 0 : light > .45 ? 3 : light > -.25 ? 2 : 1));
  }
  // clumps: little rounded clusters of light leaves where the light falls, dark ones underneath
  for (let gy = Math.floor(y0); gy <= y1; gy += 4) for (let gx = Math.floor(x0); gx <= x1; gx += 4) {
    const jx = gx + Math.floor(hash(gx, gy, seed) * 3), jy = gy + Math.floor(hash(gy, gx, seed + 1) * 3), n = inside(jx, jy); if (!n) continue;
    const light = -(n[0] * .55 + n[1] * .85);
    if (light > .1) { s.set(jx, jy, C(mat, 4)); s.set(jx + 1, jy, C(mat, 3)); s.set(jx, jy + 1, C(mat, 3)); }
    else if (light < -.35) { s.set(jx, jy, C(mat, 0)); s.set(jx + 1, jy, C(mat, 1)); }
  }
  if (opt.flowers) for (let gy = Math.floor(y0); gy <= y1; gy += 3) for (let gx = Math.floor(x0); gx <= x1; gx += 3) {
    const jx = gx + Math.floor(hash(gx, gy, seed + 5) * 2), jy = gy + Math.floor(hash(gy, gx, seed + 6) * 2), n = inside(jx, jy);
    if (!n || hash(gx, gy, seed + 7) > opt.flowers) continue;
    const light = -(n[0] * .55 + n[1] * .85), m = opt.flowerMat || 'flame';
    s.set(jx, jy, C(m, light > .2 ? 4 : 3)); s.set(jx + 1, jy, C(m, light > -.2 ? 3 : 2)); s.set(jx, jy + 1, C(m, 2));
  }
  if (opt.hang) for (let x = Math.floor(x0); x <= x1; x += 2) {
    let y = Math.floor(y1); while (y > y0 && !inside(x, y)) y--;
    if (y <= y0 || hash(x, 3, seed) > .6) continue;
    const len = 2 + Math.floor(hash(x, 4, seed) * opt.hang);
    for (let k = 1; k <= len; k++) s.set(x, y + k, C(mat, k === len ? 2 : 1));
  }
}
/** A tall fan palm: a thin trunk, a skirt of dead fronds, and a round crown of fan leaves. */
function fanPalm(s, x, baseY, topY) {
  for (let y = baseY - 1; y > topY + 6; y--) { const xx = Math.round(x + Math.sin((baseY - y) / 40) * 1.5); s.rect(xx, y, 2, 1, C('wood', (y % 5 === 0) ? 1 : 2)); s.set(xx, y, C('wood', 3)); }
  const cx = x + 1, cy = topY;
  // skirt of dead fronds
  for (let yy = cy + 2; yy < cy + 10; yy++) { const half = Math.round(3 - (yy - cy - 2) * .25); for (let xx = cx - half; xx <= cx + half; xx++) if ((xx + yy) % 3) s.set(xx, yy, C('cork', yy > cy + 7 ? 1 : 2)); }
  // crown: fan leaves radiating, tips catching the light
  for (let i = 0; i < 15; i++) {
    const a = Math.PI * (1.08 + i / 14 * .84 * 1.0) + (i % 2) * .06, len = 7 + (i % 3);
    for (let k = 1; k <= len; k++) { const xx = Math.round(cx + Math.cos(a) * k * 1.1), yy = Math.round(cy + Math.sin(a) * k * .8 + (k > 4 ? (k - 4) * .35 : 0)); s.set(xx, yy, C('leaf', k > len - 2 ? 3 : 2)); if (k > 2) s.set(xx, yy + 1, C('leaf', 1)); }
  }
  for (const a of [.15, .45, -0.2, 2.9, 2.6, 3.25]) for (let k = 1; k <= 7; k++) { const xx = Math.round(cx + Math.cos(a) * k * 1.1), yy = Math.round(cy + Math.sin(a) * k * .5 + k * .5); s.set(xx, yy, C('leaf', k > 5 ? 3 : 2)); s.set(xx, yy + 1, C('leaf', 1)); }
  s.disc(cx, cy, 3, C('leaf', 1)); s.set(cx - 1, cy - 1, C('leaf', 2));
}
/** Sun position across the glass from the San Jose sky; the window faces east. */
export function skyPlacement(W, H, st) {
  const ax = az => (az - 55) / 70 * W, ey = el => H * .42 - el / 30 * H * .42;
  return { sunUp: st.sun.el > -1 && st.sun.az > 50 && st.sun.az < 130, sunX: ax(st.sun.az), sunY: ey(st.sun.el), moonUp: st.moon.el > 0 && st.moon.az > 45 && st.moon.az < 135, moonX: ax(st.moon.az), moonY: ey(st.moon.el), phase: st.moon.phase };
}
function moon(e, x, y, phase) {
  // a lit disc, then the shadow disc slid across it by the phase
  x = Math.round(x); y = Math.round(y);
  const r = 3.6, k = (1 - Math.cos(phase * Math.PI * 2)) / 2, off = 2 * r * k * (phase < .5 ? -1 : 1);
  e.disc(x, y, r, C('cream', 4));
  if (k < .97) for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) { const dx = xx + .5 - off, dy = yy + .5; if (dx * dx + dy * dy <= r * r) e.set(x + xx, y + yy, 0); }
  // a couple of grey seas on the lit part
  if (e.get(x - 1, y - 1)) e.set(x - 1, y - 1, C('cream', 3));
  if (e.get(x + 1, y + 1)) e.set(x + 1, y + 1, C('cream', 3));
}

/* ───────── San Jose: the valley and Mt Hamilton ───────── */
function viewNow(W, H, cfg) {
  const st = cfg.state, night = st === 'night', dusk = st === 'twilight', gold = st === 'golden';
  const sky = new Spr(W, H), far = new Spr(W, H), mid = new Spr(W, H), near = new Spr(W, H);
  const eSky = new Spr(W, H), eFar = new Spr(W, H), eMid = new Spr(W, H), eNear = new Spr(W, H);
  skyBands(sky, H, night ? [[0, 0], [.22, 1], [.5, 2]] : dusk ? [[0, 1], [.2, 2], [.42, 3], [.56, 4]] : [[0, 1], [.16, 2], [.34, 3], [.5, 4]]);
  if (gold || dusk) { for (let y = Math.round(H * .44); y < Math.round(H * .6); y++) for (let x = 0; x < W; x++) if (bayer(x, y) < (y - H * .44) / (H * .16) * .8) sky.set(x, y, C(dusk ? 'flame' : 'gold', 4)); }
  const p = cfg.sky;
  if (p && p.sunUp && !night) { eSky.disc(Math.round(p.sunX), Math.round(p.sunY), 4, C('gold', 4)); eSky.ring(Math.round(p.sunX), Math.round(p.sunY), 6, 6, C('gold', 3)); }
  if (p && p.moonUp && (night || dusk)) moon(eSky, p.moonX, p.moonY, p.phase);
  if (!night) { cloud(sky, W * .22, H * .16, 26, 6, 'cream', [2, 3, 4], 3); cloud(sky, W * .7, H * .1, 18, 4, 'cream', [2, 3, 4], 8); }

  // Mt Hamilton: a long ridge, highest to the right, with the Lick domes on top
  const ridge = x => { const t = x / W; return H * (.43 - .1 * Math.exp(-((t - .7) ** 2) / .02) - .04 * Math.sin(t * 7.1) - .02 * Math.sin(t * 17.3 + 1)); };
  for (let x = 0; x < W; x++) { const top = Math.round(ridge(x)); for (let y = top; y < H; y++) far.set(x, y, C('hill', 2)); far.set(x, top, C('hill', 4)); if (hash(x, 3, 1) > .3) far.set(x, top + 1, C('hill', 3)); }
  // sunlit faces and ravines: diagonal strokes down to the right
  for (let i = 0; i < 24; i++) { const x0 = Math.floor(hash(i, 1, 2) * W), y0 = Math.round(ridge(x0)) + 2; const len = 6 + Math.floor(hash(i, 2, 2) * 9); for (let k = 0; k < len; k++) far.over(x0 + k, y0 + k, C('hill', 1)); for (let k = 0; k < len - 2; k++) far.over(x0 + k - 1, y0 + k + 1, C('hill', 3)); }
  const sx = Math.round(W * .7), sy = Math.round(ridge(sx));
  far.rect(sx - 9, sy - 3, 5, 3, C('cream', 3)); far.ellipse(sx - 6.5, sy - 3, 2.6, 2.6, C('cream', 4));
  far.rect(sx - 2, sy - 5, 8, 5, C('cream', 3)); far.ellipse(sx + 2, sy - 5, 4, 3.6, C('cream', 4)); far.set(sx + 1, sy - 7, C('cream', 4)); far.hl(sx - 2, sx + 5, sy - 1, C('cream', 2));
  far.rect(sx + 9, sy - 2, 3, 2, C('cream', 3));

  // foothills, oaks, and the valley floor with downtown
  const foot = x => H * (.6 - .03 * Math.sin(x / W * 5 + .4) - .02 * Math.sin(x / W * 13));
  for (let x = 0; x < W; x++) { const top = Math.round(foot(x)); for (let y = top; y < H; y++) mid.set(x, y, C('hill', 3)); mid.set(x, top, C('hill', 4)); }
  for (let i = 0; i < 26; i++) { const x = Math.floor(hash(i, 5, 3) * W), y = Math.round(foot(x)) + 2 + Math.floor(hash(i, 6, 3) * 6); mid.rect(x, y, 3, 2, C('leaf', 1)); mid.set(x + 1, y - 1, C('leaf', 2)); mid.set(x, y, C('leaf', 2)); }
  const vy = Math.round(H * .7);
  for (let y = vy; y < H; y++) for (let x = 0; x < W; x++) mid.set(x, y, C('leaf', 2));
  for (let x = 0; x < W; x += 1) if (hash(x, 9, 4) > .55) mid.set(x, vy, C('leaf', 3));
  for (let y = vy + 6, r = 0; y < H - 16; y += 3, r++) { if (r % 3 === 2) { mid.hl(0, W, y, C('hill', 3)); continue; } for (let x = (r * 2) % 4; x < W; x += 4) { mid.set(x, y, C('leaf', 1)); mid.set(x + 1, y, C('leaf', 1)); mid.set(x, y - 1, C('leaf', 3)); } }
  // downtown towers, small and far
  const towers = [[.14, 14, 5], [.19, 20, 4], [.23, 11, 6], [.28, 16, 4], [.32, 9, 5], [.36, 12, 4]];
  for (const [fx, h, w] of towers) {
    const x = Math.round(W * fx), top = vy - h;
    mid.rect(x, top, w, h, C('stone', 2)); mid.vl(x, top, vy - 1, C('stone', 3)); mid.hl(x, x + w - 1, top, C('stone', 4));
    for (let yy = top + 2; yy < vy - 1; yy += 2) for (let xx = x + 1; xx < x + w - 1; xx += 2) { if (night) { if (hash(xx, yy, 7) > .5) eMid.set(xx, yy, C('gold', 4)); } else mid.set(xx, yy, C('stone', 1)); }
  }
  // the freeway along the valley, and its lights after dark
  mid.hl(0, W, vy + 3, C('stone', 2));
  if (night || dusk) for (let x = 2; x < W; x += 5) eMid.set(x, vy + 2, C('gold', 3));

  // near: two houses with tiled roofs, a pair of cypresses, and a tall fan palm
  const house = (x0, w, top) => {
    const ry = top, wy = ry + 7;
    near.poly([[x0 - 2, wy], [x0 + w / 2, ry], [x0 + w + 2, wy]], C('roof', 2));
    near.line(x0 - 2, wy, x0 + w / 2, ry, C('roof', 3)); for (let yy = ry + 2; yy < wy; yy += 2) near.hl(x0, x0 + w, yy, C('roof', 1));
    near.hl(x0 - 2, x0 + w + 2, wy, C('roof', 1));
    near.rect(x0 + w - 6, ry - 1, 3, 5, C('roof', 1)); near.set(x0 + w - 6, ry - 1, C('roof', 3));
    near.rect(x0, wy + 1, w, H - wy, C('cream', 3)); near.rect(x0 + w - 4, wy + 1, 4, H - wy, C('cream', 2)); near.hl(x0, x0 + w - 1, wy + 1, C('cream', 1));
    near.rect(x0 + Math.round(w / 2) - 1, wy + 9, 3, 6, C('wood', 1));
    for (let k = 0; k < 3; k++) { const wx = x0 + 3 + k * Math.floor((w - 6) / 3); near.rect(wx, wy + 4, 3, 4, C('screen', 2)); if (night || dusk) eNear.rect(wx, wy + 4, 3, 4, C('gold', night ? 4 : 3)); }
  };
  house(Math.round(W * .06), 26, Math.round(H * .78));
  house(Math.round(W * .52), 30, Math.round(H * .8));
  for (const [cx, top] of [[Math.round(W * .42), Math.round(H * .62)], [Math.round(W * .465), Math.round(H * .67)]]) {
    for (let y = top; y < H; y++) { const t = (y - top) / (H - top), half = Math.round(Math.sin(Math.min(1, t * 1.6) * Math.PI * .5) * 3 - (t > .8 ? (t - .8) * 6 : 0)); near.hl(cx - half, cx + half, y, C('leaf', 1)); near.set(cx - half, y, C('leaf', 2)); if (half > 1 && y % 3 === 0) near.set(cx - half + 1, y, C('leaf', 3)); }
    near.set(cx, top - 1, C('leaf', 2));
  }
  fanPalm(near, Math.round(W * .86), H, Math.round(H * .24));
  // a hedge along the bottom
  for (let x = 0; x < W; x++) { const top = Math.round(H * .93 + Math.sin(x * .7) * 1.2); for (let y = top; y < H; y++) near.set(x, y, C('leaf', y === top ? 3 : 2)); }

  const live = (t, out) => {
    // clouds drift a pixel at a time; after dark the valley lights twinkle
    if (!night) { const off = Math.floor(t * .8) % (W + 40); cloud(out.sky, ((W * .55 + off) % (W + 40)) - 20, H * .22, 12, 3, 'cream', [2, 3, 4], 21); }
    if (night || dusk) {
      // stars, a few winking out on each beat
      const r = rng(11), n = night ? 26 : 8, beat = Math.floor(t * 2.5);
      for (let i = 0; i < n; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * H * .45), bright = r() < .2; if (hash(i, beat, 7) > .1) out.eSky.set(x, y, C('cream', bright ? 4 : 3)); }
    }
    if (night) {
      // the valley's lights, twinkling
      const beat = Math.floor(t * 3);
      for (let i = 0; i < 40; i++) { const x = Math.floor(hash(i, 1, 9) * W), y = vy + 5 + Math.floor(hash(i, 2, 9) * (H - vy - 22)); if (hash(i, beat, 4) > .18) out.eMid.set(x, y, C(hash(i, 3, 9) > .7 ? 'cream' : 'gold', 4)); }
      // a plane's beacon crossing high up
      const ph = (t % 26) / 26; if (ph < .6) { const x = Math.round(ph / .6 * (W + 10)) - 5, y = Math.round(H * .12 + ph * 6); out.eSky.set(x, y, C(Math.floor(t * 2) % 2 === 0 ? 'red' : 'cream', 4)); }
    }
  };
  return { layers: [{ spr: sky, emit: eSky, depth: 0 }, { spr: far, emit: eFar, depth: 1 }, { spr: mid, emit: eMid, depth: 2 }, { spr: near, emit: eNear, depth: 3 }], live };
}

/* ───────── San Diego: the Geisel Library among eucalyptus, a clear morning ───────── */
function viewSd(W, H) {
  const sky = new Spr(W, H), far = new Spr(W, H), mid = new Spr(W, H), near = new Spr(W, H);
  skyBands(sky, H, [[0, 1], [.2, 2], [.4, 3], [.58, 4]]);
  for (const [x, y, len] of [[.15, .12, 22], [.55, .08, 16], [.7, .18, 12]]) for (let k = 0; k < len; k++) if (k % 3 !== 2) sky.set(Math.round(W * x) + k, Math.round(H * y + Math.sin(k * .4)), C('cream', 4));
  // the far mesa, hazy
  for (let x = 0; x < W; x++) { const top = Math.round(H * (.66 - .02 * Math.sin(x / W * 4))); for (let y = top; y < H; y++) far.set(x, y, C('hill', 3)); far.set(x, top, C('hill', 4)); if (bayer(x, top + 1) < .5) far.set(x, top + 1, C('hill', 4)); }
  // lawn and paths
  const gy = Math.round(H * .8);
  for (let y = gy; y < H; y++) for (let x = 0; x < W; x++) mid.set(x, y, C('leaf', y < gy + 2 ? 4 : 3));
  for (let y = gy + 3; y < H; y++) { const half = Math.round((y - gy) * .9) + 2; mid.hl(Math.round(W / 2) - half, Math.round(W / 2) + half, y, C('cream', 3)); }
  // Geisel: an inverted ziggurat of concrete and glass on splayed piers
  const cx = Math.round(W / 2), tiers = [[.3, .38], [.355, .5], [.41, .62], [.465, .7], [.52, .66], [.575, .56]];
  const conc = l => C('stone', l), glass = l => C('screen', l);
  tiers.forEach(([fy, fw], i) => {
    const y0 = Math.round(H * fy), w = Math.round(W * fw), x0 = cx - Math.round(w / 2);
    // concrete slab with a lit top edge, then a recessed band of glass with vertical mullions
    mid.rect(x0, y0, w, 3, conc(3)); mid.hl(x0, x0 + w - 1, y0, conc(4)); mid.hl(x0, x0 + w - 1, y0 + 2, conc(2));
    const gx0 = x0 + 2, gw = w - 4;
    mid.rect(gx0, y0 + 3, gw, 4, glass(2));
    for (let x = gx0; x < gx0 + gw; x += 3) mid.vl(x, y0 + 3, y0 + 6, conc(2));
    for (let x = gx0 + 1; x < gx0 + gw; x += 6) mid.set(x, y0 + 4, C('sky', 3));
    void i;
  });
  // the roof cap
  const ry = Math.round(H * .3); mid.rect(cx - Math.round(W * .15), ry - 3, Math.round(W * .3), 3, conc(3)); mid.hl(cx - Math.round(W * .15), cx + Math.round(W * .15) - 1, ry - 3, conc(4));
  // splayed piers down to a podium
  const py0 = Math.round(H * .63), py1 = Math.round(H * .78);
  for (const [a, b] of [[-.24, -.06], [-.12, -.03], [.12, .03], [.24, .06]]) { const xa = cx + Math.round(W * a), xb = cx + Math.round(W * b); mid.thick(xa, py0, xb, py1, 3, conc(2)); mid.line(xa - 1, py0, xb - 1, py1, conc(3)); }
  mid.rect(cx - Math.round(W * .1), py1, Math.round(W * .2), 4, conc(3)); mid.hl(cx - Math.round(W * .1), cx + Math.round(W * .1) - 1, py1, conc(4));
  for (let x = cx - Math.round(W * .08); x < cx + Math.round(W * .08); x += 4) mid.rect(x, py1 + 1, 2, 2, glass(1));

  // eucalyptus: pale peeling trunks and hanging sage-green leaf masses, left and right
  const euc = (x, lean, top, side) => {
    for (let y = H - 1; y > top + 6; y--) { const t = (H - y) / (H - top), xx = Math.round(x + lean * t * t); near.rect(xx, y, 3, 1, C('cream', 3)); near.set(xx + 2, y, C('stone', 3)); if (hash(xx, y >> 1, 2) > .82) near.set(xx + 1, y, C('wood', 3)); }
    const cx = x + lean + 1;
    canopy(near, [[cx, top + 4, 12, 7], [cx + side * 9, top + 10, 10, 6], [cx - side * 7, top + 11, 9, 5], [cx + side * 3, top + 15, 11, 5]], 'leaf', x, { hang: 4 });
  };
  euc(Math.round(W * .06), 4, Math.round(H * .14), 1);
  euc(Math.round(W * .88), -5, Math.round(H * .2), -1);

  const live = (t, out) => {
    // a gull gliding across now and then, two frames of wing
    const ph = (t % 16) / 16; if (ph < .45) { const x = Math.round(ph / .45 * (W + 16)) - 8, y = Math.round(H * .2 + Math.sin(ph * 9) * 2), up = Math.floor(t * 4) % 2 === 0;
      out.sky.set(x, y, C('cream', 4)); out.sky.set(x + 1, y, C('cream', 4)); out.sky.set(x - 1, y + (up ? -1 : 0), C('cream', 2)); out.sky.set(x - 2, y + (up ? -2 : 0), C('cream', 2)); out.sky.set(x + 2, y + (up ? -1 : 0), C('cream', 2)); out.sky.set(x + 3, y + (up ? -2 : 0), C('cream', 2)); }
    // the leaf masses stir: a few tufts shift by a pixel on alternate beats
    if (Math.floor(t * 2) % 2 === 0) for (let i = 0; i < 18; i++) { const x = Math.floor(hash(i, 1, 13) * W * .3) + (i % 2 ? Math.round(W * .7) : 0), y = Math.round(H * .12 + hash(i, 2, 13) * H * .25); out.near.set(x, y, C('leaf', 3)); out.near.set(x + 1, y + 1, C('leaf', 2)); }
  };
  return { layers: [{ spr: sky, depth: 0 }, { spr: far, depth: 1 }, { spr: mid, depth: 2 }, { spr: near, depth: 3 }], live };
}

/* ───────── Bengaluru: rooftops, tanks, a coconut palm, a gulmohar, before the rain ───────── */
function viewBlr(W, H) {
  const sky = new Spr(W, H), far = new Spr(W, H), mid = new Spr(W, H), near = new Spr(W, H);
  // a heavy pre-monsoon sky, lit warm from low in the west
  skyBands(sky, H, [[0, 1], [.25, 2], [.48, 3]], 'stone');
  for (let y = Math.round(H * .5); y < Math.round(H * .58); y++) for (let x = 0; x < W; x++) if (y > H * .53 || bayer(x, y) < (y - H * .5) / (H * .03)) sky.set(x, y, C('gold', 4));
  // storm clouds: dark masses, their upper edges lit by the low sun
  for (const [cx, cy, w, h, sd] of [[W * .3, H * .32, 50, 13, 4], [W * .78, H * .22, 36, 9, 9]]) {
    const tmp = new Spr(W, H); cloud(tmp, cx, cy, w, h, 'stone', [0, 1, 1], sd);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = tmp.get(x, y); if (!v) continue; sky.set(x, y, v); if (!tmp.get(x, y - 1)) sky.set(x, y, C('gold', 3)); else if (!tmp.get(x, y - 2)) sky.set(x, y, C('stone', 2)); }
  }
  // far skyline, two cranes and a gopuram
  const fy = Math.round(H * .6);
  for (const [fx, h, w] of [[.04, 12, 6], [.11, 18, 5], [.18, 9, 7], [.6, 14, 5], [.66, 20, 6], [.74, 11, 5], [.82, 16, 6], [.9, 10, 7]]) { const x = Math.round(W * fx); far.rect(x, fy - h, w, h + 40, C('stone', 1)); far.vl(x, fy - h, fy, C('stone', 2)); }
  const cr = (x, h) => { far.vl(x, fy - h, fy, C('stone', 0)); far.hl(x - 6, x + 12, fy - h, C('stone', 0)); far.line(x, fy - h - 3, x + 10, fy - h, C('stone', 0)); far.line(x, fy - h - 3, x - 5, fy - h, C('stone', 0)); };
  cr(Math.round(W * .3), 24); cr(Math.round(W * .52), 18);
  // a temple gopuram: stacked tiers, carved, a gold finial
  const gx = Math.round(W * .42);
  far.rect(gx - 8, fy - 6, 17, 6, C('cream', 2)); far.rect(gx - 2, fy - 4, 5, 4, C('ink', 1));
  for (let k = 0; k < 6; k++) { const w = 15 - 2 * k, y0 = fy - 9 - k * 3; far.rect(gx - Math.floor(w / 2), y0, w, 3, C('cream', k % 2 ? 2 : 3)); far.hl(gx - Math.floor(w / 2), gx + Math.floor(w / 2), y0, C('cream', 4)); for (let xx = gx - Math.floor(w / 2) + 1; xx < gx + Math.floor(w / 2); xx += 2) far.set(xx, y0 + 1, C('flame', 2)); }
  far.rect(gx - 2, fy - 29, 5, 2, C('cream', 3)); far.vl(gx, fy - 32, fy - 30, C('gold', 4)); far.set(gx, fy - 33, C('gold', 3));
  // rooftops: flat concrete, parapets, black water tanks, a line of washing
  const ry = Math.round(H * .64), walls = ['cream', 'mint', 'flame', 'sky', 'cream', 'wall'];
  let x = -4, i = 0;
  while (x < W) {
    const w = 16 + Math.floor(hash(i, 1, 5) * 14), top = ry + Math.floor(hash(i, 2, 5) * 10) - 4, wc = walls[i % walls.length];
    mid.rect(x, top, w, H - top, C(wc, 3)); mid.vl(x + w - 1, top, H - 1, C(wc, 2)); mid.hl(x, x + w - 1, top, C(wc, 4)); mid.hl(x, x + w - 1, top + 1, C('stone', 2));
    for (let yy = top + 6; yy < H - 2; yy += 7) for (let xx = x + 3; xx < x + w - 3; xx += 6) { mid.rect(xx, yy, 3, 3, C('screen', 2)); mid.set(xx, yy, C('screen', 3)); }
    if (hash(i, 3, 5) > .35) { const tx = x + 3 + Math.floor(hash(i, 4, 5) * (w - 10)); mid.rect(tx, top - 6, 6, 6, C('ink', 1)); mid.hl(tx, tx + 5, top - 6, C('ink', 3)); mid.vl(tx, top - 6, top - 1, C('ink', 2)); mid.hl(tx + 1, tx + 4, top - 7, C('ink', 2)); }
    x += w; i++;
  }
  const ly = ry - 2; mid.line(Math.round(W * .12), ly, Math.round(W * .4), ly + 2, C('stone', 1));
  for (const [fx, c] of [[.16, 'red'], [.21, 'cobalt'], [.27, 'gold'], [.33, 'red']]) { const xx = Math.round(W * fx), yy = Math.round(ly + (fx - .12) / .28 * 2) + 1; mid.rect(xx, yy, 3, 4, C(c, 3)); mid.set(xx + 2, yy + 3, C(c, 2)); }

  // near: a coconut palm at the left, a gulmohar in flower at the right
  palm(near, Math.round(W * .1), H, Math.round(H * .24), 8, 'leaf', 'hill', 9, 18);
  const gcx = Math.round(W * .86), gcy = Math.round(H * .66);
  canopy(near, [[gcx, gcy - 10, 22, 12], [gcx - 18, gcy, 16, 10], [gcx + 10, gcy + 4, 20, 11], [gcx - 6, gcy + 12, 18, 9]], 'leaf', 77, { flowers: .45 });
  for (let yy = gcy + 8; yy < H; yy++) near.rect(gcx - 4 + Math.round((yy - gcy) * .2), yy, 4, 1, C('wood', 1));

  const live = (t, out) => {
    // a paper kite bobbing on its string, and two black kites circling
    const kx = Math.round(W * .62 + Math.sin(t * 1.3) * 2), ky = Math.round(H * .3 + Math.sin(t * 2.1) * 2);
    out.sky.poly([[kx, ky - 4], [kx + 3, ky], [kx, ky + 4], [kx - 3, ky]], C('red', 3)); out.sky.vl(kx, ky - 4, ky + 4, C('gold', 4)); out.sky.hl(kx - 3, kx + 3, ky, C('gold', 4));
    for (let k = 0; k < 9; k++) out.sky.set(kx + Math.round(Math.sin(t * 3 + k) * 1), ky + 5 + k, C('cream', k % 2 ? 3 : 4));
    out.sky.line(kx, ky + 4, Math.round(W * .72), H - 1, C('stone', 2));
    for (let b = 0; b < 2; b++) { const a = t * .5 + b * Math.PI, bx = Math.round(W * .36 + Math.cos(a) * 14), by = Math.round(H * .16 + Math.sin(a) * 5), up = Math.floor(t * 4 + b) % 2;
      out.sky.set(bx, by, C('ink', 1)); out.sky.set(bx - 1, by - up, C('ink', 1)); out.sky.set(bx + 1, by - up, C('ink', 1)); out.sky.set(bx - 2, by - up * 2 + 1 - up, C('ink', 1)); out.sky.set(bx + 2, by - up * 2 + 1 - up, C('ink', 1)); }
  };
  return { layers: [{ spr: sky, depth: 0 }, { spr: far, depth: 1 }, { spr: mid, depth: 2 }, { spr: near, depth: 3 }], live };
}

/* ───────── Surathkal: the sea at night, the lighthouse, palms ───────── */
function viewNitk(W, H) {
  const sky = new Spr(W, H), far = new Spr(W, H), mid = new Spr(W, H), near = new Spr(W, H);
  const eSky = new Spr(W, H), eFar = new Spr(W, H), eMid = new Spr(W, H);
  skyBands(sky, H, [[0, 0], [.25, 1], [.48, 2]]);
  moon(eSky, W * .8, H * .14, .2);
  const hz = Math.round(H * .56);
  for (let y = hz; y < H; y++) for (let x = 0; x < W; x++) far.set(x, y, C('sea', y < hz + 3 ? 2 : y < hz + 12 ? 1 : 0));
  far.hl(0, W, hz, C('sea', 3));
  for (let i = 0; i < 40; i++) { const x = Math.floor(hash(i, 1, 6) * W), y = hz + 2 + Math.floor(hash(i, 2, 6) * (H - hz - 6)); far.hl(x, x + 2 + Math.floor(hash(i, 3, 6) * 4), y, C('sea', 2)); }
  // the moon's road on the water
  for (let y = hz + 2; y < H - 10; y += 2) { const w = 1 + Math.floor((y - hz) / 12); for (let x = Math.round(W * .8) - w; x < Math.round(W * .8) + w; x++) if (hash(x, y, 2) < .55 - (y - hz) / (H - hz) * .35) eFar.set(x, y, C('cream', Math.abs(x - W * .8) < 1.5 ? 4 : 3)); }
  // the headland and the lighthouse
  for (let x = 0; x < Math.round(W * .48); x++) { const top = Math.round(hz - 6 + ((x - W * .22) / (W * .26)) ** 2 * 8); for (let y = Math.min(top, hz); y < hz + 12; y++) mid.set(x, y, C('stone', y === top ? 2 : 1)); }
  const lx = Math.round(W * .24), lb = hz - 6, lt = lb - 30;
  for (let y = lt; y < lb; y++) { const t = (y - lt) / (lb - lt), half = Math.round(2 + t * 3), band = Math.floor((y - lt) / 5) % 2; mid.hl(lx - half, lx + half, y, C(band ? 'red' : 'cream', band ? 2 : 3)); mid.set(lx - half, y, C(band ? 'red' : 'cream', band ? 3 : 4)); mid.set(lx + half, y, C(band ? 'red' : 'cream', 1)); }
  mid.rect(lx - 3, lt - 2, 7, 2, C('ink', 2)); mid.rect(lx - 2, lt - 6, 5, 4, C('ink', 1)); eMid.rect(lx - 1, lt - 5, 3, 3, C('gold', 4)); mid.rect(lx - 2, lt - 8, 5, 2, C('red', 1)); mid.set(lx, lt - 9, C('ink', 2));
  mid.rect(lx + 6, lb - 4, 7, 4, C('cream', 2)); mid.poly([[lx + 5, lb - 4], [lx + 9, lb - 7], [lx + 14, lb - 4]], C('roof', 1)); eMid.set(lx + 8, lb - 2, C('gold', 3));
  // sand and the dark palms of the foreground
  for (let y = Math.round(H * .88); y < H; y++) for (let x = 0; x < W; x++) near.set(x, y, C('cork', y === Math.round(H * .88) ? 2 : 1));
  palm(near, Math.round(W * .06), H, Math.round(H * .18), 10, 'ink', 'ink', 11, 19, true);
  palm(near, Math.round(W * .94), H, Math.round(H * .3), -7, 'ink', 'ink', 10, 16, true);

  const beamOrigin = [lx, lt - 4];
  const live = (t, out) => {
    // the beam sweeps in steps; the water glitters; a few stars wink
    const step = Math.floor(t * 8) % 48, a = (step / 48) * Math.PI * 2, dir = Math.cos(a);
    if (Math.abs(dir) > .15) {
      const reach = Math.round(W * 1.1 * Math.abs(dir)), sgn = dir > 0 ? 1 : -1;
      for (let k = 2; k < reach; k++) { const spread = 1 + k * .12, yy0 = Math.round(beamOrigin[1] - spread), yy1 = Math.round(beamOrigin[1] + spread * .6); for (let yy = yy0; yy <= yy1; yy++) { const xx = beamOrigin[0] + sgn * k; if (bayer(xx, yy) < .28 * (1 - k / reach) + .05) out.eMid.set(xx, yy, C('cream', 4)); } }
    }
    for (let y = hz + 2; y < H - 10; y += 2) if (hash(y, Math.floor(t * 6), 3) > .7) { const w = 1 + Math.floor((y - hz) / 12); out.eFar.set(Math.round(W * .8) - w - 1 + Math.floor(hash(y, Math.floor(t * 6), 4) * (2 * w + 2)), y, C('cream', 4)); }
    const r = rng(5), beat = Math.floor(t * 2.5); for (let i = 0; i < 34; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * H * .5), bright = r() < .25; if (hash(i, beat, 7) > .12) out.eSky.set(x, y, C('cream', bright ? 4 : 3)); }
    // foam along the waterline, two frames
    const fy = Math.round(H * .88) - 1; for (let x = (Math.floor(t * 3) % 2); x < W; x += 3) out.near.set(x, fy, C('cream', 2));
  };
  return { layers: [{ spr: sky, emit: eSky, depth: 0 }, { spr: far, emit: eFar, depth: 1 }, { spr: mid, emit: eMid, depth: 2 }, { spr: near, depth: 3 }], live };
}

export const VIEWS = { now: viewNow, sd: viewSd, blr: viewBlr, nitk: viewNitk };
