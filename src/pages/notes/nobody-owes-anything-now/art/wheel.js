// "Nobody Owes Anything Now": a sgraffito cup turning on a banding wheel.
// The cup is a small cylinder; its decoration, scratched through white slip to the red clay,
// is the habitat (frieze.js). The wheel and the cup turn once a minute, the only thing moving.
//
// Built once per size: the frieze as relief maps, the cup's screen pixels mapped to the
// surface (with their light worked out, since the light is fixed while the cup turns), the
// wheel head as a top-down disc, and the stand. Each frame then turns the disc, re-samples the
// frieze at the new angle and lights it, and draws the handle in its new place.
//
// createRenderer({ canvas, width, height }) → { still, key(t), draw(t, full) }   (LivingCanvas)
import { buildSurface, halve, frame, light as shadeOne, K, COS_T, LIGHT, VIEW, pnoise, pfbm, clamp, smooth, lerp, mulberry32, TAU, CLAY, SLIP } from './sgraffito.js';
import { CUP, FW, HANDLE_X, HOUSE_X, drawFrieze, cupSlip, pressFingerprint } from './frieze.js';

export const DW = 1000, DH = 800;
export const PERIOD = 60;                   // seconds per turn
const FPS = 15;
const { R, H, wall: WALL } = CUP;
const CX = 500, YB = 462;                   // the cup's foot, centred on the wheel head (design units)
const RW = 296, HEAD = 30, STEM = { r: 30, len: 132 }, BASE = { r: 132, t: 30 };
const PAPER = [250, 249, 245];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

// The cup's outer radius at height h: a slight belly, a flared lip, a bevelled foot.
export function prof(h) {
  const v = clamp(h / H);
  return R * (.962 + .038 * Math.sin(Math.PI * Math.min(1, v / .92)) + .02 * smooth(.86, 1, v) - .055 * (1 - smooth(0, .075, v)));
}
const dprof = h => (prof(h + .5) - prof(h - .5));
// Design point (height y above the wheel head, depth z toward the viewer) → screen y.
const sy = (y, z) => YB - y * COS_T + z * K;

/* ───────────────────────── the cup's pixels ───────────────────────── */
// Where a design point (x from the axis, screen Y) lands on the cup, if it does.
function hit(x, Y) {
  let h = (YB - Y) / COS_T;
  for (let it = 0; it < 6; it++) {
    const r = prof(clamp(h, 0, H)); if (Math.abs(x) >= r) { h = -1; break; }
    h = (YB + Math.sqrt(r * r - x * x) * K - Y) / COS_T;
  }
  if (h >= 0 && h <= H && Math.abs(x) < prof(h)) return { type: 0, h, phi: Math.asin(x / prof(h)) };
  const yt = YB - H * COS_T, ro = prof(H), ri = ro - WALL, dy = (Y - yt) / K, e = Math.sqrt(x * x + dy * dy);
  if (e > ro) return null;
  if (e > ri) return { type: 2, w: (e - ri) / (ro - ri), ang: Math.atan2(x, dy) };
  // inside: the far wall, seen over the near rim
  let hi = H;
  for (let it = 0; it < 6; it++) { const r = prof(clamp(hi, 0, H)) - WALL; if (Math.abs(x) >= r) return { type: 2, w: 0, ang: Math.atan2(x, dy) }; hi = (YB - Math.sqrt(r * r - x * x) * K - Y) / COS_T; }
  const ri2 = prof(hi) - WALL;
  return { type: 1, h: hi, pb: Math.asin(clamp(x / ri2, -1, 1)) };
}

// Is a point on the inside wall lit, or shaded by the rim? Soft at the edge.
function insideLit(x, y, z) {
  const ri = prof(H) - WALL, lx = LIGHT[0], lz = LIGHT[2];
  const a = lx * lx + lz * lz, b = 2 * (x * lx + z * lz), c = x * x + z * z - ri * ri;
  const sWall = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a), sTop = (H - y) / LIGHT[1];
  return smooth(-6, 6, sWall - sTop);
}

function mapCup(s, ox, oy) {
  const rmax = R * 1.03;
  const X0 = Math.floor(ox + (CX - rmax) * s) - 1, X1 = Math.ceil(ox + (CX + rmax) * s) + 1;
  const Y0 = Math.floor(oy + (YB - H * COS_T - rmax * K) * s) - 1, Y1 = Math.ceil(oy + (YB + rmax * K) * s) + 1;
  const bw = X1 - X0, bh = Y1 - Y0;
  // per entry: pixel, weight, u0, v, light frame (9), ao, lod
  const E = { pix: [], w: [], u: [], v: [], f: [], ao: [], lod: [] };
  const statics = new Float32Array(bw * bh * 4);     // lip and inside: lit once, they do not change as it turns
  const texel = 1.25;                                 // frieze texels per screen pixel at the front
  const SS = 3;
  const ringsAt = h => Math.sin(h * .6 + pnoise(h * .04, 1, 4) * 5) * (.5 + .5 * pnoise(h * .1, 2, 6)) + Math.sin(h * 1.9) * .1;
  for (let py = 0; py < bh; py++) for (let px = 0; px < bw; px++) {
    const acc = [[], [], []];
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) {
      const X = (X0 + px + (i + .5) / SS - ox) / s, Y = (Y0 + py + (j + .5) / SS - oy) / s;
      const p = hit(X - CX, Y); if (p) acc[p.type].push(p);
    }
    const pi = py * bw + px;
    // the outside: sampled from the turning frieze every frame
    if (acc[0].length) {
      let h = 0, phi = 0; for (const p of acc[0]) { h += p.h; phi += p.phi; } h /= acc[0].length; phi /= acc[0].length;
      const sp = Math.sin(phi), cp = Math.cos(phi), dr = dprof(h);
      const n = nrm([sp, -dr, cp]), t = [cp, 0, -sp], b = nrm([dr * sp, 1, dr * cp]);
      const foot = 1 - .4 * (1 - smooth(0, 26, h)) - .12 * (1 - smooth(0, 70, h));
      E.pix.push(pi); E.w.push(acc[0].length / (SS * SS)); E.u.push(phi / TAU); E.v.push(1 - h / H);
      E.f.push(...frame(n, t, b)); E.ao.push(foot);
      E.lod.push(Math.log2(Math.max(1, texel / Math.max(.05, cp))));
    }
    // the lip and the inside wall
    let sr = 0, sg = 0, sb = 0, sw = 0;
    for (const type of [1, 2]) for (const p of acc[type]) {
      let n, t, b, col, lit = 1, ao = 1, gv = 0;
      if (type === 1) {
        const phi = Math.PI - p.pb, sp = Math.sin(phi), cp = Math.cos(phi), ri = prof(p.h) - WALL;
        n = [-sp, 0, -cp]; t = [cp, 0, -sp]; b = [0, 1, 0];
        lit = insideLit(ri * sp, p.h, ri * cp);
        ao = .5 + .5 * smooth(H - 150, H - 4, p.h);
        gv = ringsAt(p.h) * .1;                         // throwing rings, faint
        const tone = .95 + .07 * pnoise(p.h * .08, phi * 3, 12);
        col = SLIP.map(c => c * tone);
      } else {
        const beta = Math.PI * (1 - p.w), radial = [Math.sin(p.ang), 0, Math.cos(p.ang)];
        n = nrm([radial[0] * Math.cos(beta), Math.sin(beta), radial[2] * Math.cos(beta)]);
        t = [radial[2], 0, -radial[0]]; b = [0, 1, 0];
        const edge = Math.exp(-(((p.w - .55) / .2) ** 2)) * .45;   // the slip thins over the rim
        col = SLIP.map((c, k) => lerp(c, [214, 150, 116][k], edge));
      }
      const f = frame(n, t, b), o = [0, 0, 0];
      shadeOne(o, col, .55, 0, gv, f, ao, lit);
      sr += o[0]; sg += o[1]; sb += o[2]; sw++;
    }
    // stored weighted by coverage, ready to add to the turning outside
    if (sw) { const k = pi * 4, n = SS * SS; statics[k] = sr / n; statics[k + 1] = sg / n; statics[k + 2] = sb / n; statics[k + 3] = sw / n; }
  }
  const F = k => Float32Array.from(E[k]);
  return { X0, Y0, bw, bh, n: E.pix.length, pix: Int32Array.from(E.pix), w: F('w'), u: F('u'), v: F('v'), f: F('f'), ao: F('ao'), lod: F('lod'), statics };
}

/* ───────────────────────── the frieze surface ───────────────────────── */
function buildFrieze(s) {
  const TW = Math.max(512, Math.min(2048, Math.round(FW * s * 1.25 / 2) * 2));
  const scale = TW / FW, TH = Math.round(H * scale);
  const sf = buildSurface({
    W: TW, H: TH, scale, seed: 7, wrapX: true, relief: .42, burrs: .8, wash: .6,
    draw: a => { drawFrieze(a); pressFingerprint(a); trimLines(a); },
    slip: cupSlip, extra: throwingLines,
  });
  return [sf, halve(sf), halve(halve(sf))];
}
// The throwing lines: a shallow spiral left by the fingers as the wall was pulled up, rising
// one ring per turn, so it meets itself at the seam.
const RING = 10.5;
function throwingLines(x, y) {
  const ph = (y + x / FW * RING) / RING * TAU;
  return .12 * Math.sin(ph + 1.3 * pnoise(x * 40 / FW, y / 60, 5, 40)) * smooth(10, 40, y) * (1 - smooth(270, 292, y));
}
// Turning marks on the bare foot, from trimming.
function trimLines(a) {
  a.press(c => { c.lineWidth = .5; for (let y = 296; y < H; y += 2.2 + (y % 3) * .4) { c.globalAlpha = .25 + (y % 5) * .08; c.beginPath(); c.moveTo(-20, y); c.lineTo(FW + 20, y); c.stroke(); } }, .5);
}

function sample(sf, u, v, out) {
  const W = sf.W, Hh = sf.H;
  let x = u * W - .5, y = v * Hh - .5;
  x -= Math.floor(x / W) * W;
  if (y < 0) y = 0; else if (y > Hh - 1.001) y = Hh - 1.001;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, x1 = x0 + 1 === W ? 0 : x0 + 1;
  const i00 = y0 * W + x0, i10 = y0 * W + x1, i01 = i00 + W, i11 = i10 + W;
  const a = (1 - fx) * (1 - fy), b = fx * (1 - fy), c = (1 - fx) * fy, d = fx * fy, T = sf.tex;
  for (let k = 0; k < 4; k++) out[k] = T[i00 * 4 + k] * a + T[i10 * 4 + k] * b + T[i01 * 4 + k] * c + T[i11 * 4 + k] * d;
  out[4] = sf.gu[i00] * a + sf.gu[i10] * b + sf.gu[i01] * c + sf.gu[i11] * d;
  out[5] = sf.gv[i00] * a + sf.gv[i10] * b + sf.gv[i01] * c + sf.gv[i11] * d;
}

/* ───────────────────────── the wheel ───────────────────────── */
const IRON = [92, 96, 93], IRON_HI = [168, 172, 166];
const sheet = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// The wheel head seen from straight above: machined iron, centring rings, old slip.
function headDisc(s) {
  const Rp = Math.ceil(RW * s), D = Rp * 2 + 2, c = sheet(D, D), x = c.getContext('2d', { willReadFrequently: true });
  const img = x.createImageData(D, D), d = img.data;
  for (let py = 0; py < D; py++) for (let px = 0; px < D; px++) {
    const X = (px - Rp - 1 + .5) / s, Y = (py - Rp - 1 + .5) / s, rho = Math.hypot(X, Y);
    if (rho > RW + 1 / s) continue;
    const a = clamp((RW - rho) * s + .5), ang = Math.atan2(Y, X);
    const n = pfbm(X / 40 + 9, Y / 40, 21, 3), fine = pnoise(X / 2.2, Y / 2.2, 22);
    let v = .9 + .1 * n + .03 * Math.sin(rho * 2.1 + n * 3) + .05 * (fine - .5);
    for (const rr of [44, 96, 152, 206, 258]) v -= .2 * Math.exp(-(((rho - rr) * 1.6) ** 2)) - .06 * Math.exp(-(((rho - rr - 1.1) * 1.6) ** 2));
    const edge = smooth(RW - 10, RW - 2, rho);
    v = v * (1 - edge * .25) + edge * .18 * Math.max(0, Math.cos(ang + 2.3));
    const k = (py * D + px) * 4;
    d[k] = 168 * v; d[k + 1] = 171 * v; d[k + 2] = 166 * v; d[k + 3] = 255 * a;
  }
  x.putImageData(img, 0, 0);
  // old slip and clay: the ring of a bigger pot, splashes, a finger's swipe
  x.save(); x.translate(Rp + 1, Rp + 1); x.scale(s, s);
  const r = mulberry32(17);
  x.globalCompositeOperation = 'source-atop';
  for (let k = 0; k < 220; k++) {
    const an = k / 220 * TAU, rr = 212 + 6 * Math.sin(an * 3) + (r() - .5) * 3, gap = pnoise(an * 4, 2, 30) > .62;
    if (gap) continue;
    x.fillStyle = css(CLAY.map(c => c * 1.1), .16 + r() * .2); x.beginPath(); x.ellipse(Math.cos(an) * rr, Math.sin(an) * rr, 5 + r() * 4, 2 + r() * 2, an + Math.PI / 2, 0, TAU); x.fill();
  }
  x.lineCap = 'round';
  x.strokeStyle = css(SLIP, .35); x.lineWidth = 9; x.beginPath(); x.arc(0, 0, 176, 2.1, 3.2); x.stroke();
  x.strokeStyle = css(SLIP, .2); x.lineWidth = 4; x.beginPath(); x.arc(0, 0, 183, 2.3, 3.0); x.stroke();
  for (let k = 0; k < 70; k++) {
    const an = r() * TAU, rr = 160 + r() * 125, big = r() < .15;
    x.fillStyle = r() < .6 ? css(SLIP, .28 + r() * .3) : css(CLAY.map(c => c * 1.12), .25 + r() * .3);
    x.beginPath(); x.arc(Math.cos(an) * rr, Math.sin(an) * rr, big ? 3 + r() * 4 : .8 + r() * 1.8, 0, TAU); x.fill();
  }
  x.restore();
  return { c, Rp };
}

// The stand, the head's turned edge and the shadow on the paper: drawn once.
function standLayer(s, ox, oy, W, Hc) {
  const c = sheet(W, Hc), p = c.getContext('2d');
  p.fillStyle = css(PAPER); p.fillRect(0, 0, W, Hc);
  p.setTransform(s, 0, 0, s, ox, oy);
  const parts = sheet(W, Hc), x = parts.getContext('2d', { willReadFrequently: true });
  x.setTransform(s, 0, 0, s, ox, oy);
  const yHeadTop = YB, yHeadBot = YB + HEAD * COS_T, yBase = yHeadBot + STEM.len * COS_T, yBaseBot = yBase + BASE.t * COS_T;
  // shadow on the paper, falling right
  const g = x.createRadialGradient(CX + 70, yBaseBot + 4, 10, CX + 70, yBaseBot + 4, BASE.r * 1.6);
  g.addColorStop(0, 'rgba(70,58,44,.30)'); g.addColorStop(.55, 'rgba(70,58,44,.12)'); g.addColorStop(1, 'rgba(70,58,44,0)');
  p.save(); p.translate(CX + 70, yBaseBot + 4); p.scale(1, .22); p.translate(-(CX + 70), -(yBaseBot + 4)); p.fillStyle = g; p.beginPath(); p.arc(CX + 70, yBaseBot + 4, BASE.r * 1.6, 0, TAU); p.fill(); p.restore();
  p.fillStyle = 'rgba(50,40,30,.35)'; p.beginPath(); p.ellipse(CX + 6, yBaseBot + 1, BASE.r * 1.02, BASE.r * K * 1.02, 0, 0, TAU); p.fill();
  // a cylinder band (side of a disc): lit from the left, shading round to the right
  const band = (r, yTop, yBot, base, hi, grooves = []) => {
    const lg = x.createLinearGradient(CX - r, 0, CX + r, 0);
    lg.addColorStop(0, css(base.map(v => v * .8))); lg.addColorStop(.18, css(hi)); lg.addColorStop(.32, css(base.map(v => v * 1.15)));
    lg.addColorStop(.7, css(base.map(v => v * .72))); lg.addColorStop(1, css(base.map(v => v * .5)));
    x.fillStyle = lg; x.beginPath(); x.ellipse(CX, yTop, r, r * K, 0, 0, Math.PI); x.lineTo(CX - r, yBot); x.ellipse(CX, yBot, r, r * K, 0, Math.PI, 0, true); x.closePath(); x.fill();
    for (const [f, a] of grooves) { const yy = lerp(yTop, yBot, f); x.strokeStyle = `rgba(20,22,21,${a})`; x.lineWidth = 1.1; x.beginPath(); x.ellipse(CX, yy, r, r * K, 0, .05, Math.PI - .05); x.stroke(); x.strokeStyle = `rgba(230,232,226,${a * .5})`; x.lineWidth = .8; x.beginPath(); x.ellipse(CX, yy + 1.2, r, r * K, 0, .3, Math.PI - .6); x.stroke(); }
  };
  // base
  band(BASE.r, yBase, yBaseBot, IRON, IRON_HI, [[.35, .35]]);
  const tg = x.createLinearGradient(CX - BASE.r, yBase - BASE.r * K, CX + BASE.r, yBase + BASE.r * K);
  tg.addColorStop(0, css([134, 139, 134])); tg.addColorStop(.5, css([102, 107, 103])); tg.addColorStop(1, css([76, 80, 77]));
  x.fillStyle = tg; x.beginPath(); x.ellipse(CX, yBase, BASE.r, BASE.r * K, 0, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(200,205,198,.5)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(CX, yBase, BASE.r - 1, BASE.r * K - .5, 0, Math.PI * .95, Math.PI * 1.6); x.stroke();
  // the stem, in the head's shadow
  band(STEM.r, yHeadBot - 10, yBase, [64, 68, 66], [110, 115, 111]);
  x.fillStyle = 'rgba(20,20,18,.28)'; x.beginPath(); x.ellipse(CX + 8, yBase - 2, STEM.r * 1.9, STEM.r * K * 1.9, 0, 0, TAU); x.fill();
  band(STEM.r, yHeadBot - 10, yBase - 1, [64, 68, 66], [110, 115, 111]);
  // the head's turned edge
  band(RW, yHeadTop, yHeadBot, [108, 113, 109], [190, 194, 187], [[.3, .32], [.72, .24]]);
  x.strokeStyle = 'rgba(236,238,230,.55)'; x.lineWidth = 1.3; x.beginPath(); x.ellipse(CX, yHeadTop + .6, RW - .3, RW * K, 0, Math.PI * .55, Math.PI * .97); x.stroke();
  // cast iron is never smooth: a mottle, pits, and a few bright scratches
  const img = x.getImageData(0, 0, W, Hc), d = img.data, r = mulberry32(41);
  for (let py = 0; py < Hc; py++) for (let px = 0; px < W; px++) {
    const k = (py * W + px) * 4; if (!d[k + 3]) continue;
    const X = (px - ox) / s, Y = (py - oy) / s;
    let m = .92 + .14 * pfbm(X / 18, Y / 6, 51, 3) + .05 * (pnoise(X / 1.2, Y / 1.2, 52) - .5);
    if (r() < .004) m *= .7;
    d[k] *= m; d[k + 1] *= m; d[k + 2] *= m * .99;
  }
  x.putImageData(img, 0, 0);
  p.setTransform(1, 0, 0, 1, 0, 0); p.drawImage(parts, 0, 0);
  return c;
}

// What stays put on the head while it turns: the cup's shadow, the window's reflection.
function headLight(s, ox, oy, W, Hc) {
  const shadow = sheet(W, Hc), x = shadow.getContext('2d');
  x.setTransform(s, 0, 0, s, ox, oy);
  x.save(); x.beginPath(); x.ellipse(CX, YB, RW - 1, (RW - 1) * K, 0, 0, TAU); x.clip();
  const L = LIGHT, off = h => [-h * L[0] / L[1], -h * L[2] / L[1]];
  const hull = (h, r0, grow) => {
    const [dx, dz] = off(h), x0 = CX, z0 = 0, x1 = CX + dx, z1 = dz;
    const a = Math.atan2(z1 - z0, x1 - x0) + Math.PI / 2;
    x.beginPath();
    x.moveTo(x0 + Math.cos(a) * r0, sy(0, z0 + Math.sin(a) * r0));
    x.lineTo(x1 + Math.cos(a) * (r0 + grow), sy(0, z1 + Math.sin(a) * (r0 + grow)));
    x.lineTo(x1 - Math.cos(a) * (r0 + grow), sy(0, z1 - Math.sin(a) * (r0 + grow)));
    x.lineTo(x0 - Math.cos(a) * r0, sy(0, z0 - Math.sin(a) * r0)); x.closePath(); x.fill();
    x.beginPath(); x.ellipse(x1, sy(0, z1), r0 + grow, (r0 + grow) * K, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(x0, sy(0, z0), r0, r0 * K, 0, 0, TAU); x.fill();
  };
  const blurOk = typeof x.filter === 'string';
  x.fillStyle = 'rgba(44,36,30,.5)'; if (blurOk) x.filter = `blur(${(9 * s).toFixed(1)}px)`; hull(H, R, 10);
  x.fillStyle = 'rgba(44,36,30,.26)'; if (blurOk) x.filter = `blur(${(3 * s).toFixed(1)}px)`; hull(H * .55, R, 2);
  x.filter = 'none';
  const fg = x.createRadialGradient(CX, YB, R * .9, CX, YB, R * 1.35);
  fg.addColorStop(0, 'rgba(30,24,20,.55)'); fg.addColorStop(.3, 'rgba(30,24,20,.18)'); fg.addColorStop(1, 'rgba(30,24,20,0)');
  x.save(); x.translate(CX, YB); x.scale(1, K); x.translate(-CX, -YB); x.fillStyle = fg; x.beginPath(); x.arc(CX, YB, R * 1.4, 0, TAU); x.fill(); x.restore();
  x.restore();
  const sheen = sheet(W, Hc), y = sheen.getContext('2d');
  y.setTransform(s, 0, 0, s, ox, oy);
  y.save(); y.beginPath(); y.ellipse(CX, YB, RW - 1, (RW - 1) * K, 0, 0, TAU); y.clip();
  y.translate(CX - 120, YB - 40); y.scale(1, K * 1.1);
  const sg = y.createRadialGradient(0, 0, 10, 0, 0, 260); sg.addColorStop(0, 'rgba(255,250,238,.28)'); sg.addColorStop(1, 'rgba(255,250,238,0)');
  y.fillStyle = sg; y.beginPath(); y.arc(0, 0, 260, 0, TAU); y.fill(); y.restore();
  // turned metal throws a bright band through its centre, toward the light and away from it
  y.save(); y.beginPath(); y.ellipse(CX, YB, RW - 1, (RW - 1) * K, 0, 0, TAU); y.clip();
  y.translate(CX, YB); y.scale(1, K);
  const dir = Math.atan2(-LIGHT[2], LIGHT[0]);
  for (const side of [0, Math.PI]) {
    const a0 = dir + side;
    const bg = y.createRadialGradient(0, 0, 20, 0, 0, RW);
    bg.addColorStop(0, 'rgba(255,253,246,0)'); bg.addColorStop(.35, `rgba(255,253,246,${side ? .1 : .22})`); bg.addColorStop(1, 'rgba(255,253,246,0)');
    y.fillStyle = bg; y.beginPath(); y.moveTo(0, 0); y.arc(0, 0, RW, a0 - .16, a0 + .16); y.closePath(); y.fill();
  }
  y.restore();
  return { shadow, sheen };
}

// Crumbs of scratched slip lying on the head; they turn with it.
function makeCrumbs() {
  const r = mulberry32(23), out = [];
  for (let k = 0; k < 46; k++) {
    const rho = R * (1.06 + Math.pow(r(), 1.6) * .75), ang = r() * TAU, slip = r() < .72;
    out.push({ rho, ang, size: (slip ? 1.2 : 1) * (.9 + r() * 1.8), rot: r() * TAU, curl: slip && r() < .12, slip });
  }
  return out;
}

/* ───────────────────────── the handle ───────────────────────── */
// A pulled strap, centreline in (radial distance, height), swept by an elliptical section.
const HANDLE = (() => {
  const P0 = [0, H * .79], P1 = [R * .66, H * .88], P2 = [R * .74, H * .27], P3 = [0, H * .22];
  // sampled evenly along its length, densely enough that its outline stays smooth
  const dense = [];
  for (let i = 0; i <= 400; i++) {
    const t = i / 400, u = 1 - t;
    const d = u * u * u * P0[0] + 3 * u * u * t * P1[0] + 3 * u * t * t * P2[0] + t * t * t * P3[0];
    const h = u * u * u * P0[1] + 3 * u * u * t * P1[1] + 3 * u * t * t * P2[1] + t * t * t * P3[1];
    dense.push([prof(h) - 5 + d, h, t]);
  }
  const len = [0]; for (let i = 1; i < dense.length; i++) len.push(len[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const M = 56, pts = [];
  for (let i = 0, j = 0; i <= M; i++) {
    const L = len[len.length - 1] * i / M; while (j < len.length - 2 && len[j + 1] < L) j++;
    const f = (L - len[j]) / ((len[j + 1] - len[j]) || 1), a = dense[j], b = dense[j + 1];
    pts.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f), i / M]);
  }
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(M, i + 1)], dl = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t = p[2], width = R * .118 * (1.18 - .32 * t + .25 * Math.exp(-((t / .08) ** 2))), thick = R * .052 * (1 + .2 * Math.exp(-(((1 - t) / .1) ** 2)));
    return { rho: p[0], h: p[1], tr: (b[0] - a[0]) / dl, th: (b[1] - a[1]) / dl, width, thick };
  });
})();
const Q = 24;

function handleMesh(phi) {
  const er = [Math.sin(phi), 0, Math.cos(phi)], et = [Math.cos(phi), 0, -Math.sin(phi)];
  return HANDLE.map(c => {
    const C = [er[0] * c.rho, c.h, er[2] * c.rho];
    const T = [er[0] * c.tr, c.th, er[2] * c.tr];
    const N1 = et, N2 = nrm([T[1] * N1[2] - T[2] * N1[1], T[2] * N1[0] - T[0] * N1[2], T[0] * N1[1] - T[1] * N1[0]]);
    const ring = [];
    for (let j = 0; j < Q; j++) {
      const g = j / Q * TAU, cg = Math.cos(g), sg = Math.sin(g);
      const P = [C[0] + N1[0] * c.width * cg + N2[0] * c.thick * sg, C[1] + N1[1] * c.width * cg + N2[1] * c.thick * sg, C[2] + N1[2] * c.width * cg + N2[2] * c.thick * sg];
      const n = nrm([N1[0] * cg / c.width + N2[0] * sg / c.thick, N1[1] * cg / c.width + N2[1] * sg / c.thick, N1[2] * cg / c.width + N2[2] * sg / c.thick]);
      ring.push({ P, n, g });
    }
    return { C, ring };
  });
}

function drawHandle(ctx, phi, grow) {
  const rings = handleMesh(phi), quads = [];
  // which way is "out" (away from the cup) in the section: the side whose normal points off the axis
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < Q; j++) {
    const a = rings[i].ring[j], b = rings[i + 1].ring[j], c = rings[i + 1].ring[(j + 1) % Q], d = rings[i].ring[(j + 1) % Q];
    const n = nrm([a.n[0] + b.n[0] + c.n[0] + d.n[0], a.n[1] + b.n[1] + c.n[1] + d.n[1], a.n[2] + b.n[2] + c.n[2] + d.n[2]]);
    if (dot3(n, VIEW) < -.05) continue;
    const depth = dot3(a.P, VIEW) + dot3(c.P, VIEW);
    quads.push({ pts: [a.P, b.P, c.P, d.P], n, depth, g: (a.g + c.g) / 2, i });
  }
  quads.sort((p, q) => p.depth - q.depth);
  const col = [0, 0, 0];
  for (const q of quads) {
    const f = frame(q.n, [1, 0, 0], [0, 1, 0]);
    const cg = Math.cos(q.g), edge = Math.pow(Math.abs(cg), 8) * .35;
    // a groove down the outer face of the strap, scratched like the rest
    const outward = q.n[0] * Math.sin(phi) + q.n[2] * Math.cos(phi);
    const groove = outward > .9 && Math.abs(cg) < .2 && q.i > 2 && q.i < HANDLE.length - 4 ? 1 : 0;
    const tone = .955 + .07 * pnoise(q.i * .35, q.g * 2, 31) - (pnoise(q.i * 3.1, q.g * 9, 32) > .9 ? .07 : 0);
    const base = groove ? CLAY.map(v => v * .92) : SLIP.map((v, k) => lerp(v, [214, 160, 124][k], edge) * tone);
    const ends = Math.min(q.i, HANDLE.length - 1 - q.i), ao = .72 + .28 * smooth(0, 4, ends);
    shadeOne(col, base, groove ? .2 : .6, 0, 0, f, ao, 1);
    ctx.fillStyle = `rgb(${Math.min(255, col[0]) | 0},${Math.min(255, col[1]) | 0},${Math.min(255, col[2]) | 0})`;
    // each facet is grown a hair past its edges so neighbours meet without seams
    const X = q.pts.map(P => CX + P[0]), Y = q.pts.map(P => sy(P[1], P[2]));
    const mx = (X[0] + X[1] + X[2] + X[3]) / 4, my = (Y[0] + Y[1] + Y[2] + Y[3]) / 4;
    ctx.beginPath();
    for (let k = 0; k < 4; k++) { const dx = X[k] - mx, dy = Y[k] - my, l = Math.hypot(dx, dy) || 1, gx = X[k] + dx / l * grow, gy = Y[k] + dy / l * grow; if (k) ctx.lineTo(gx, gy); else ctx.moveTo(gx, gy); }
    ctx.fill();
  }
}

// The handle's shadow, on the head (projected down the light) or across the cup's side.
function handleShadowPoints(phi, onCup) {
  const er = [Math.sin(phi), 0, Math.cos(phi)], out = [];
  for (const c of HANDLE) {
    const P = [er[0] * c.rho, c.h, er[2] * c.rho];
    if (!onCup) { const t = P[1] / LIGHT[1]; out.push([CX + P[0] - t * LIGHT[0], sy(0, P[2] - t * LIGHT[2])]); continue; }
    // walk from the handle away from the light until the ray meets the cup wall
    const r = prof(P[1]), lx = -LIGHT[0], lz = -LIGHT[2], ly = -LIGHT[1];
    const a = lx * lx + lz * lz, b = 2 * (P[0] * lx + P[2] * lz), cc = P[0] * P[0] + P[2] * P[2] - r * r, disc = b * b - 4 * a * cc;
    if (disc < 0) { out.push(null); continue; }
    const t = (-b - Math.sqrt(disc)) / (2 * a); if (t <= .5) { out.push(null); continue; }
    const Qp = [P[0] + lx * t, P[1] + ly * t, P[2] + lz * t];
    out.push(Qp[2] > 0 && Qp[1] > 0 && Qp[1] < H ? [CX + Qp[0], sy(Qp[1], Qp[2])] : null);
  }
  return out;
}
function strokeSoft(ctx, pts, widths, color) {
  for (const [w, a] of widths) {
    ctx.strokeStyle = `rgba(${color},${a})`; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    let on = false; for (const p of pts) { if (!p) { on = false; continue; } if (on) ctx.lineTo(p[0], p[1]); else { ctx.moveTo(p[0], p[1]); on = true; } }
    ctx.stroke();
  }
}

/* ───────────────────────── the renderer ───────────────────────── */
// The still: the house facing you, the handle out to the left, catching the window.
export const STILL = 0;
const ROT0 = HOUSE_X / FW + .03;

export async function createRenderer({ canvas, width, height }) {
  const s = Math.min(width / DW, height / DH), ox = (width - DW * s) / 2, oy = (height - DH * s) / 2;
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const tick = () => new Promise(res => setTimeout(res, 0));    // let the page breathe between heavy steps
  const stand = standLayer(s, ox, oy, width, height); await tick();
  const disc = headDisc(s); await tick();
  const light = headLight(s, ox, oy, width, height); await tick();
  const mips = buildFrieze(s); await tick();
  const map = mapCup(s, ox, oy); await tick();
  const crumbs = makeCrumbs();
  const cupCanvas = sheet(map.bw, map.bh), cupCtx = cupCanvas.getContext('2d');
  const cupImg = cupCtx.createImageData(map.bw, map.bh), acc = new Float32Array(map.bw * map.bh * 4);
  // the pixels the cup covers at all; the rest of its box stays transparent
  const cover = new Float32Array(map.bw * map.bh);
  for (let e = 0; e < map.n; e++) cover[map.pix[e]] += map.w[e];
  for (let i = 0; i < cover.length; i++) cover[i] += map.statics[i * 4 + 3];
  const covered = Int32Array.from({ length: cover.length }, (_, i) => i).filter(i => cover[i] > 0);
  const smp = new Float32Array(6), col = [0, 0, 0], out = [0, 0, 0];

  function drawCup(rot) {
    acc.set(map.statics);
    for (let e = 0; e < map.n; e++) {
      const lod = map.lod[e], l0 = lod < 1 ? 0 : lod < 2 ? 1 : 2;
      sample(mips[l0], map.u[e] + rot, map.v[e], smp);
      col[0] = smp[0]; col[1] = smp[1]; col[2] = smp[2];
      shadeOne(out, col, smp[3] / 255, smp[4], smp[5], map.f, map.ao[e], 1, e * 9);
      const k = map.pix[e] * 4, w = map.w[e];
      acc[k] += out[0] * w; acc[k + 1] += out[1] * w; acc[k + 2] += out[2] * w; acc[k + 3] += w;
    }
    const d = cupImg.data;
    for (let j = 0; j < covered.length; j++) {
      const k = covered[j] * 4, a = acc[k + 3];
      d[k] = acc[k] / a; d[k + 1] = acc[k + 1] / a; d[k + 2] = acc[k + 2] / a; d[k + 3] = Math.min(1, a) * 255;
    }
    cupCtx.putImageData(cupImg, 0, 0);
  }

  // Only the head, the cup and its handle change; after the first frame just their box is redrawn.
  const bx = Math.max(0, Math.floor(ox + (CX - RW - 6) * s)), by = Math.max(0, Math.floor(oy + (YB - H * COS_T - R * 1.05 * K - 8) * s));
  const bw = Math.min(width, Math.ceil(ox + (CX + RW + 6) * s)) - bx, bh = Math.min(height, Math.ceil(oy + (YB + RW * K + 6) * s)) - by;
  const layer = (img, mode) => { ctx.globalCompositeOperation = mode; ctx.drawImage(img, bx, by, bw, bh, bx, by, bw, bh); };

  function draw(t, full) {
    const turn = ((t / PERIOD) % 1 + 1) % 1, rot = ROT0 + turn, theta = turn * TAU;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    if (full) ctx.drawImage(stand, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    layer(stand, 'source-over');
    // the head turns; its light and the cup's shadow stay
    ctx.save(); ctx.translate(ox + CX * s, oy + YB * s); ctx.scale(1, K); ctx.rotate(theta); ctx.drawImage(disc.c, -disc.Rp - 1, -disc.Rp - 1); ctx.restore();
    layer(light.shadow, 'multiply'); layer(light.sheen, 'screen');
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(s, 0, 0, s, ox, oy);
    const phiH = TAU * (HANDLE_X / FW - rot), front = Math.cos(phiH) > 0;
    ctx.save(); ctx.beginPath(); ctx.ellipse(CX, YB, RW - 1, (RW - 1) * K, 0, 0, TAU); ctx.clip();
    ctx.globalCompositeOperation = 'multiply'; strokeSoft(ctx, handleShadowPoints(phiH, false), [[R * .34, .07], [R * .24, .08], [R * .15, .09]], '60,48,40'); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    // crumbs, batched: their shadows, then each colour, then the glints
    const placed = crumbs.map(c => { const a = c.ang - theta; return [c, CX + Math.sin(a) * c.rho, sy(0, Math.cos(a) * c.rho)]; });
    ctx.fillStyle = 'rgba(40,32,26,.25)'; ctx.beginPath();
    for (const [c, X, Y] of placed) { ctx.moveTo(X + c.size * 1.6, Y + c.size * .25); ctx.ellipse(X + c.size * .5, Y + c.size * .25, c.size * 1.1, c.size * .45, 0, 0, TAU); }
    ctx.fill();
    for (const slip of [true, false]) {
      ctx.fillStyle = ctx.strokeStyle = slip ? css([226, 214, 190]) : css([150, 76, 46]); ctx.beginPath();
      for (const [c, X, Y] of placed) if (c.slip === slip && !c.curl) { ctx.moveTo(X + c.size * .9, Y - c.size * .3); ctx.ellipse(X, Y - c.size * .3, c.size * .9, c.size * .6, c.rot, 0, TAU); }
      ctx.fill();
      for (const [c, X, Y] of placed) if (c.slip === slip && c.curl) { ctx.lineWidth = c.size * .6; ctx.beginPath(); ctx.arc(X, Y - c.size * .4, c.size * 1.1, c.rot, c.rot + 3.6); ctx.stroke(); }
    }
    ctx.fillStyle = 'rgba(255,250,235,.45)'; ctx.beginPath();
    for (const [c, X, Y] of placed) { ctx.moveTo(X - c.size * .3 + c.size * .3, Y - c.size * .6); ctx.arc(X - c.size * .3, Y - c.size * .6, c.size * .3, 0, TAU); }
    ctx.fill();
    if (!front) drawHandle(ctx, phiH, .45 / s);
    drawCup(rot);
    // the handle's shadow across the side of the cup
    if (front) {
      cupCtx.save(); cupCtx.globalCompositeOperation = 'source-atop'; cupCtx.setTransform(s, 0, 0, s, ox - map.X0, oy - map.Y0);
      strokeSoft(cupCtx, handleShadowPoints(phiH, true), [[R * .3, .08], [R * .2, .1], [R * .12, .1]], '50,30,20');
      cupCtx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(cupCanvas, map.X0, map.Y0);
    ctx.setTransform(s, 0, 0, s, ox, oy);
    if (front) drawHandle(ctx, phiH, .45 / s);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  return { still: STILL, key: t => Math.floor(t * FPS), draw: (t, full) => draw(t, full) };
}
