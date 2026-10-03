'use strict';
/* Four desks — building each era, lighting the present, live details, the roller between
   prints, and the scroll that drives it all. */

const yieldFrame = () => new Promise(r => setTimeout(r, 0));
const WINDOW_AZ = 84; // the window looks east-north-east, toward Mt Hamilton
const ERA_INFO = {
  now: { years: '2024 – now', place: 'San Jose', process: 'painted live' },
  sd: { years: '2022 – 2024', place: 'San Diego', process: 'risograph' },
  blr: { years: '2019 – 2022', place: 'Bengaluru', process: 'engraving' },
  nitk: { years: '2015 – 2019', place: 'Surathkal', process: 'cyanotype' },
};

/* ───────── where the sun, moon and light land in this room ───────── */
function sceneSky(date, LY) {
  const k = skyState(date);
  const azr = ((k.sun.az - WINDOW_AZ + 540) % 360) - 180, el = k.sun.el;
  const toView = (az, e) => { const a = ((az - WINDOW_AZ + 540) % 360) - 180; return { x: 500 + Math.tan(a * DEG) * 1500, y: 470 - Math.tan(e * DEG) * 1500, a }; };
  const sv = toView(k.sun.az, el);
  k.sunIn = (el > -1 && Math.abs(sv.a) < 30 && sv.x > -60 && sv.x < 1060 && sv.y > -60) ? sv : null;
  const mv = toView(k.moon.az, k.moon.el);
  k.moonIn = (k.moon.el > 1 && Math.abs(mv.a) < 30 && mv.x > 30 && mv.x < 970 && mv.y > 40 && mv.y < 420) ? { ...mv, phase: k.moon.phase } : null;
  k.azr = azr;
  k.patch = (el > 1.5 && Math.abs(azr) < 62) ? { el, azr, strength: smooth(1.5, 7, el) * (1 - smooth(48, 68, el)) * (1 - smooth(48, 62, Math.abs(azr))) } : null;
  return k;
}
function patchShadows(LY, patch) { // quads cast toward the camera by the things on the desk
  const k = LY.os || 1, t = Math.tan(patch.el * DEG), dxk = -Math.tan(patch.azr * DEG), out = [];
  const cast = (x0, x1, y, h) => { const L = Math.min(900, h / t * .55), dx = dxk * L * .9; out.push([[x0, y], [x1, y], [x1 + dx, y + L], [x0 + dx, y + L]]); };
  const [cx, cy] = LY.center, [lx, ly] = LY.left, [rx, ry] = LY.right;
  cast(cx - 186 * k, cx + 186 * k, cy - 56 * k, 250 * k);       // laptop screen
  cast(lx, lx + 270 * k, ly - 6, 140 * k);                        // books
  cast(rx - 42 * k, rx + 42 * k, ry - 2, 190 * k);                // robot
  return out;
}
function patchPolys(LY, patch) {
  const S0 = shell(LY), o = S0.open, b = S0.bar / 2, vp = LY.vp, t = Math.tan(patch.el * DEG);
  const proj = (x, y) => { const h = LY.deskY - y, d = h / t, z = d * Math.cos(patch.azr * DEG), lat = -d * Math.sin(patch.azr * DEG); return [vp[0] + (x + lat - vp[0]) * (1 + z / 700), LY.deskY + z * .55 * (1 + z / 900)]; };
  const panes = [[o.x, S0.transomY + b, S0.mullionX - b, o.y + o.h], [S0.mullionX + b, S0.transomY + b, o.x + o.w, o.y + o.h]];
  return panes.map(([x0, y0, x1, y1]) => [proj(x0, y1), proj(x1, y1), proj(x1, y0), proj(x0, y0)]);
}

/* ───────── the present ───────── */
let STROKE_TEX = null;
function strokeTexture(W, H, S, LY) {
  if (STROKE_TEX && STROKE_TEX.width === W && STROKE_TEX.height === H) return STROKE_TEX;
  const c = makeCanvas(W, H), x = ctx2d(c, { willReadFrequently: true }), r = mulberry32(5);
  x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, W, H); x.setTransform(S, 0, 0, S, 0, 0); x.lineCap = 'round';
  const n = Math.round(LY.W * LY.H / 95);
  for (let i = 0; i < n; i++) {
    const px = r() * LY.W, py = r() * LY.H, len = 10 + r() * 30, wdt = 1.5 + r() * 5;
    let a = (r() - .5) * .5;
    if (py > LY.deskY) a = Math.atan2(py - LY.vp[1], px - LY.vp[0]) + (r() - .5) * .2;
    const v = 128 + (r() - .5) * 90; x.strokeStyle = `rgba(${v},${v},${v},.35)`; x.lineWidth = wdt;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * len * .5 + (r() - .5) * 3, py + Math.sin(a) * len * .5 + (r() - .5) * 3, px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke();
  }
  return (STROKE_TEX = c);
}
let SCRATCH = null;
function scratch(W, H) { if (!SCRATCH || SCRATCH.width !== W || SCRATCH.height !== H) SCRATCH = makeCanvas(W, H); const x = ctx2d(SCRATCH); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, W, H); return SCRATCH; }
/** Blend onto a layer without filling its transparent parts. */
function blendInPlace(c, mode, paint, alpha = 1) {
  const W = c.width, H = c.height, tmp = scratch(W, H); ctx2d(tmp).drawImage(c, 0, 0);
  const x = ctx2d(c); x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = mode; x.globalAlpha = alpha; x.save(); paint(x); x.restore(); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; x.globalCompositeOperation = 'destination-in'; x.globalAlpha = 1; x.drawImage(tmp, 0, 0); x.restore();
}
/** One pixel pass per layer: hand-displaced edges, brush texture (soft-light), paper grain and
    the light of the hour, multiplied in without touching alpha (canvas blend modes would pull
    the tint into the anti-aliased fringes). */
function finishLayer(c, S, LY, light, opts = {}) {
  const W = c.width, H = c.height, x = ctx2d(c), src = x.getImageData(0, 0, W, H), d = src.data, out = x.createImageData(W, H), o = out.data;
  const st = strokeTexture(W, H, S, LY); if (!st.px) st.px = ctx2d(st, { willReadFrequently: true }).getImageData(0, 0, W, H).data; const tex = st.px;
  const Ld = light && light.width ? ctx2d(light).getImageData(opts.lx || 0, opts.ly || 0, W, H).data : null, Lc = light && !light.width ? light : null;
  const amp = 1.3 * S, g = 24 * S, gw = Math.ceil(W / g) + 2, gh = Math.ceil(H / g) + 2, fx = new Float32Array(gw * gh), fy = new Float32Array(gw * gh), ox = opts.lx || 0, oy = opts.ly || 0;
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { fx[j * gw + i] = (vnoise(i * .55, j * .55, 3) - .5) * 2 * amp; fy[j * gw + i] = (vnoise(i * .55, j * .55, 12) - .5) * 2 * amp; }
  const sl = (b, s2) => { if (s2 <= .5) return b - (1 - 2 * s2) * b * (1 - b); const D = b <= .25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b); return b + (2 * s2 - 1) * (D - b); };
  const tA = opts.tex ?? .3;
  for (let y = 0; y < H; y++) {
    const gy = (y + oy) / g, j = gy | 0, ty = gy - j;
    for (let xx = 0; xx < W; xx++) {
      const a = (y * W + xx) * 4;
      let sx = xx, sy = y;
      if (opts.displace !== false) {
        const gx = (xx + ox) / g, i = gx | 0, tx = gx - i, k0 = j * gw + i, k1 = k0 + gw;
        sx = Math.min(W - 1, Math.max(0, Math.round(xx + (fx[k0] * (1 - tx) + fx[k0 + 1] * tx) * (1 - ty) + (fx[k1] * (1 - tx) + fx[k1 + 1] * tx) * ty)));
        sy = Math.min(H - 1, Math.max(0, Math.round(y + (fy[k0] * (1 - tx) + fy[k0 + 1] * tx) * (1 - ty) + (fy[k1] * (1 - tx) + fy[k1 + 1] * tx) * ty)));
      }
      const b = (sy * W + sx) * 4, al = d[b + 3]; o[a + 3] = al; if (!al) continue;
      const t = tex[((y + oy) % H * W + (xx + ox) % W) * 4] / 255, grain = .9 + .1 * hash2((xx + ox) >> 1, (y + oy) >> 1, 11);
      for (let ch = 0; ch < 3; ch++) {
        let v = d[b + ch] / 255; v = v + (sl(v, t) - v) * tA; v *= grain;
        if (Ld) v *= Ld[a + ch] / 255; else if (Lc) v *= Lc[ch] / 255;
        o[a + ch] = v * 255;
      }
    }
  }
  x.putImageData(out, 0, 0);
}
function lightMap(W, H, S, LY, k, geo, withPatch = true) {
  const c = makeCanvas(W, H), x = ctx2d(c);
  const dayC = rgb('#fffaf2'), eve = rgb('#ffdcb4'), back = rgb('#e3dfe2'), dusk = rgb('#a69cb8'), night = rgb('#3a4062');
  let A = mix(dayC, k.morning ? back : eve, k.morning ? (k.patch ? .6 : .2) : k.golden * .95);
  A = mix(A, dusk, k.twilight * .55); A = mix(A, night, k.night);
  x.fillStyle = css(A); x.fillRect(0, 0, W, H);
  x.setTransform(S, 0, 0, S, 0, 0); x.globalCompositeOperation = 'lighter';
  if (k.lamp > .01 && geo.lampHead) {
    const L = geo.lampHead, px = L.x + Math.cos(L.ang) * 190, py = L.y + Math.sin(L.ang) * 240;
    const g = x.createRadialGradient(px, py, 10, px, py, 330); g.addColorStop(0, `rgba(255,190,120,${.95 * k.lamp})`); g.addColorStop(.45, `rgba(255,170,100,${.42 * k.lamp})`); g.addColorStop(1, 'rgba(255,160,90,0)');
    x.save(); x.translate(px, py); x.scale(1.45, .62); x.translate(-px, -py); x.fillStyle = g; x.fillRect(px - 400, py - 400, 800, 800); x.restore();
    const g2 = x.createRadialGradient(L.x, L.y - 40, 0, L.x, L.y - 40, 300); g2.addColorStop(0, `rgba(255,190,130,${.42 * k.lamp})`); g2.addColorStop(1, 'rgba(255,180,120,0)'); x.fillStyle = g2; x.fillRect(L.x - 320, L.y - 360, 640, 640);
  }
  if (geo.screenQuad) {
    const q = geo.screenQuad, cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2, a = .1 + .32 * k.night;
    const g = x.createRadialGradient(cx, cy + 40, 20, cx, cy + 40, 330); g.addColorStop(0, `rgba(120,150,215,${a})`); g.addColorStop(1, 'rgba(120,150,215,0)'); x.fillStyle = g; x.fillRect(cx - 360, cy - 300, 720, 700);
  }
  if (k.patch && withPatch) {
    const pc = makeCanvas(W, H), px = ctx2d(pc); px.setTransform(S, 0, 0, S, 0, 0);
    px.filter = `blur(${5 * S}px)`; px.fillStyle = `rgba(255,214,160,${.75 * k.patch.strength})`;
    for (const p of patchPolys(LY, k.patch)) { poly(px, p); px.fill(); }
    px.globalCompositeOperation = 'destination-out'; px.filter = `blur(${7 * S}px)`; px.fillStyle = 'rgba(0,0,0,.9)';
    for (const p of patchShadows(LY, k.patch)) { poly(px, p); px.fill(); }
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(pc, 0, 0); x.restore();
  }
  // the window itself lets in daylight onto the nearby wall
  const S0 = shell(LY), o = S0.open, wl = k.day * .22 + k.golden * .1;
  if (wl > .01) { const g = x.createRadialGradient(o.x + o.w / 2, o.y + o.h, 40, o.x + o.w / 2, o.y + o.h, 700); g.addColorStop(0, `rgba(255,245,230,${wl})`); g.addColorStop(1, 'rgba(255,245,230,0)'); x.fillStyle = g; x.fillRect(-100, -100, LY.W + 200, LY.H + 200); }
  return c;
}
async function buildNow(LY, S, W, H, date) {
  const sky = sceneSky(date, LY), st = { sky, blink: 0 };
  const skyC = makeCanvas(W, H), landC = makeCanvas(W, H), roomC = makeCanvas(W, H);
  drawRoom(new PaintPainter(LY, S, ctx2d(skyC), st), LY, ERA_NOW, st, 'sky');
  const PL = new PaintPainter(LY, S, ctx2d(landC), st); drawRoom(PL, LY, ERA_NOW, st, 'land');
  await yieldFrame();
  const objC = makeCanvas(W, H);
  drawRoom(new PaintPainter(LY, S, ctx2d(roomC), st), LY, ERA_NOW, st, 'shell');
  const PR = new PaintPainter(LY, S, ctx2d(objC), st);
  PR.screenNow = q => { PR.f('screenBar', 0, c => poly(c, [quadPt(q, 0, 1), quadPt(q, 1, 1), quadPt(q, 1, .93), quadPt(q, 0, .93)])); };
  drawRoom(PR, LY, ERA_NOW, st, 'objects');
  const geo = { screenQuad: PR.screenQuad, robot: PR.robotGeom, lampHead: PR.lampHead, books: PR.books, domes: PL.domes };
  // the robot with its eyes closed, for blinking
  const rg = geo.robot, bx = rg.hx - 6, by = rg.hy - 26, bw = rg.hw + 40, bh = rg.hh + 34;
  const blinkC = makeCanvas(bw * S, bh * S), PB = new PaintPainter(LY, S, ctx2d(blinkC), { sky, blink: 1 });
  PB.push(c => c.translate(-bx, -by)); drawRobot(PB, LY.right[0], LY.right[1], 1.3 * (LY.os || 1), 1); PB.pop();
  await yieldFrame();
  const L = lightMap(W, H, S, LY, sky, geo, true), L2 = sky.patch ? lightMap(W, H, S, LY, sky, geo, false) : L;
  finishLayer(skyC, S, LY, null, { displace: false, tex: .22 });
  finishLayer(landC, S, LY, (sky.twilight > .05 || sky.night > .05) ? mix('#ffffff', '#c9c0d8', sky.twilight * .5) : null);
  finishLayer(roomC, S, LY, L);
  finishLayer(objC, S, LY, L2);
  finishLayer(blinkC, S, LY, L2, { lx: Math.round(bx * S), ly: Math.round(by * S) });
  await yieldFrame();
  // highlights: the sun patch and the lamp bulb burn a little brighter than the paint
  blendInPlace(roomC, 'screen', x => {
    x.setTransform(S, 0, 0, S, 0, 0);
    if (sky.patch) { x.filter = `blur(${4 * S}px)`; x.fillStyle = `rgba(255,200,130,${.45 * sky.patch.strength})`; for (const p of patchPolys(LY, sky.patch)) { poly(x, p); x.fill(); } x.filter = 'none'; }
    const o = shell(LY).open, refl = clamp(sky.day * .32 + sky.golden * .22 + sky.twilight * .12);
    if (refl > .01) { // the window, smeared in the desk's varnish
      x.filter = `blur(${10 * S}px)`; const hz = mix(skyHorizon(sky), '#ffffff', .4);
      x.fillStyle = css(hz, refl); x.beginPath(); x.moveTo(o.x + 10, LY.deskY + 4); x.lineTo(o.x + o.w - 10, LY.deskY + 4); x.lineTo(o.x + o.w + 40, LY.deskY + 150); x.lineTo(o.x - 40, LY.deskY + 150); x.closePath(); x.fill();
      x.fillStyle = css('#2a2420', refl * .5); x.fillRect(shell(LY).mullionX - 5, LY.deskY + 4, 10, 150); x.filter = 'none';
    }
  });
  if (sky.lamp > .01 && geo.lampHead) blendInPlace(objC, 'screen', x => { const h = geo.lampHead; x.setTransform(S, 0, 0, S, 0, 0); x.fillStyle = `rgba(255,236,190,${sky.lamp})`; x.beginPath(); x.ellipse(h.x, h.y, 38, 7, h.ang - PI / 2, 0, TAU); x.fill(); });
  { const x = ctx2d(roomC); x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(objC, 0, 0); x.restore(); }
  // live material
  const r = mulberry32(17), stars = []; for (let i = 0; i < 170; i++) stars.push([r() * 1000, r() * 470, .4 + r() * 1.3, r() * TAU, r() < .1]);
  const lights = []; for (let i = 0; i < 300; i++) { const y = 552 + Math.pow(r(), .7) * 76; lights.push([r() * 1000, y, r() < .2 ? '#fff4dc' : r() < .5 ? '#ffd08a' : '#ffb766', r() * TAU, .6 + r() * .9]); }
  const clouds = [0, 1, 2, 3].map(i => cloudSprite(S, sky, i));
  return { kind: 'now', LY, S, W, H, sky, sky0: skyC, land: landC, room: roomC, blink: { c: blinkC, x: bx, y: by }, geo, stars, lights, clouds, date };
}
function cloudSprite(S, k, seed) { // a soft, flat-bottomed fair-weather cloud, painted in translucent dabs
  const r = mulberry32(seed * 31 + 7), w = 240 + r() * 200, h = 100, c = makeCanvas(w * S, h * S), x = ctx2d(c);
  x.setTransform(S, 0, 0, S, 0, 0);
  const hor = skyHorizon(k), warm = k.morning ? 0 : k.golden;
  const lit = mix(mix(mix(hor, '#ffffff', .55), '#ffd9b0', warm * .45), '#46507a', k.night * .85);
  const sh = mix(mix(lit, '#8c8fa8', .42), '#2a3150', k.night * .6);
  const puffs = []; const n = 7 + Math.floor(r() * 5);
  for (let i = 0; i < n; i++) { const t = i / (n - 1), cx = 24 + t * (w - 48), ch = Math.sin(t * PI) * (26 + r() * 16) + 8; puffs.push([cx + (r() - .5) * 20, 74 - ch * .55, 14 + ch * .5 + r() * 6]); }
  x.filter = `blur(${1.2 * S}px)`;
  for (const [px, py, pr] of puffs) for (let d = 0; d < 6; d++) { const ox = (r() - .5) * pr * .7, oy = (r() - .5) * pr * .4; x.fillStyle = css(sh, .16); x.beginPath(); x.ellipse(px + ox, py + oy + pr * .25, pr, pr * .7, 0, 0, TAU); x.fill(); }
  for (const [px, py, pr] of puffs) for (let d = 0; d < 5; d++) { const ox = (r() - .5) * pr * .6, oy = -r() * pr * .35; x.fillStyle = css(lit, .2); x.beginPath(); x.ellipse(px + ox - pr * .1, py + oy - pr * .1, pr * .85, pr * .6, 0, 0, TAU); x.fill(); }
  x.filter = 'none'; x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fillRect(0, 80, w, 30); // flat base
  return { c, w, h, y: 40 + seed * 46 + r() * 30, speed: 3 + r() * 4, x0: r() * 1400, alpha: (.95 - k.night * .5) };
}
// sky.hor is set on the painter; mirror it into the state for clouds
function skyHorizon(k) { return gradientStops([[-18, '#1c2444'], [-10, '#3a3a5e'], [-4, '#a8697a'], [0, '#f09a72'], [5, '#f5c08a'], [14, '#dfe3dc'], [40, '#d2e3ee']], k.sun.el); }

function drawNowFrame(ctx, R, t) {
  const { LY, S } = R, o = shell(LY).open, k = R.sky;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.drawImage(R.sky0, 0, 0);
  // inside the window: stars, clouds, the plane
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); ctx.beginPath(); ctx.rect(o.x, o.y, o.w, o.h); ctx.clip(); ctx.translate(o.x, o.y); ctx.scale(o.w / 1000, o.h / 890);
  if (k.stars > .02) for (const [sx, sy, sz, ph, big] of R.stars) { const tw = .65 + .35 * Math.sin(t * (1.3 + sz) + ph); ctx.fillStyle = `rgba(250,246,232,${k.stars * tw * (big ? 1 : .7)})`; ctx.beginPath(); ctx.arc(sx, sy, sz * (big ? 1.5 : 1), 0, TAU); ctx.fill(); }
  for (const cl of R.clouds) { const span = 1000 + cl.w + 200, x = ((cl.x0 + t * cl.speed) % span) - cl.w - 100; ctx.globalAlpha = cl.alpha; ctx.drawImage(cl.c, x, cl.y, cl.w, cl.h); }
  ctx.globalAlpha = 1;
  const pp = (t % 96) / 96; if (pp < .5) { const f = pp / .5, px = -60 + f * 1120, py = 150 + f * 140; if (k.night > .3) { if (Math.floor(t * 1.4) % 2 === 0) { ctx.fillStyle = '#ff5a48'; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, TAU); ctx.fill(); } ctx.fillStyle = '#fff6dc'; ctx.beginPath(); ctx.arc(px + 6, py + 1, 1.6, 0, TAU); ctx.fill(); } else { ctx.fillStyle = 'rgba(60,64,80,.6)'; ctx.fillRect(px - 7, py - 1, 14, 2.2); ctx.fillRect(px - 2, py - 4, 4, 8); } }
  ctx.restore();
  ctx.drawImage(R.land, 0, 0);
  // the valley lights up at night; cars run along the freeway
  if (k.night > .08) {
    ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); ctx.beginPath(); ctx.rect(o.x, o.y, o.w, o.h); ctx.clip(); ctx.translate(o.x, o.y); ctx.scale(o.w / 1000, o.h / 890);
    for (const [lx, ly, col, ph, sz] of R.lights) { const f = .7 + .3 * Math.sin(t * .8 + ph * 7); ctx.fillStyle = col; ctx.globalAlpha = k.night * f * .9; ctx.beginPath(); ctx.arc(lx, ly, sz, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 18; i++) { const dir = i % 2 ? 1 : -1, f = fract(t * .018 * (1 + (i % 5) * .13) + i * .137), x = dir > 0 ? f * 1040 - 20 : 1020 - f * 1040, y = 606 + dir * 3 + (x - 500) * .02; ctx.globalAlpha = k.night * .95; ctx.fillStyle = dir > 0 ? '#fff3d0' : '#ff5c4a'; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, TAU); ctx.fill(); }
    if (R.geo.domes && Math.floor(t * .9) % 2 === 0) { ctx.globalAlpha = k.night; ctx.fillStyle = '#ff4a3a'; ctx.beginPath(); ctx.arc(R.geo.domes[0] + 40, R.geo.domes[1] - 14, 2.2, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  ctx.drawImage(R.room, 0, 0);
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0);
  // leaves outside break up the sun patch a little
  if (k.patch) {
    ctx.save(); ctx.beginPath(); for (const p of patchPolys(LY, k.patch)) poly(ctx, p); ctx.clip();
    ctx.globalCompositeOperation = 'multiply'; ctx.filter = `blur(${6 * S}px)`; ctx.fillStyle = `rgba(150,120,95,${.32 * k.patch.strength})`;
    for (let i = 0; i < 14; i++) { const bx = LY.vp[0] - 360 + i * 60 + Math.sin(t * .6 + i * 1.7) * 14 + Math.sin(t * 1.9 + i) * 4, by = LY.deskY + 120 + (i % 4) * 70 + Math.cos(t * .5 + i * 2.3) * 9; ctx.beginPath(); ctx.ellipse(bx, by, 26 + (i % 3) * 8, 12, .3, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  // the laptop: a language model writing, one token at a time
  tokenStream(ctx, R.geo.screenQuad, t, k);
  // the robot blinks every few seconds
  const bt = t % 5.3; if (bt > 5.05 || (t % 11.7) > 11.55) { ctx.drawImage(R.blink.c, R.blink.x, R.blink.y, R.blink.c.width / S, R.blink.c.height / S); }
  ctx.restore();
}
function tokenStream(ctx, q, t, k) {
  if (!q) return;
  const r = mulberry32(3), lines = []; for (let i = 0; i < 11; i++) { const toks = []; let u = .06 + (i % 3 === 1 ? .04 : 0) + (i % 5 === 3 ? .08 : 0); while (u < .9) { const w = .03 + r() * .1; if (u + w > .92) break; toks.push([u, w, r() < .12 ? 1 : r() < .2 ? 2 : 0]); u += w + .015; if (r() < .12) break; } lines.push(toks); }
  const total = lines.reduce((a, l) => a + l.length, 0), rate = 7.5, cycle = total / rate + 2.4, n = Math.floor((t % cycle) * rate);
  const cols = ['rgba(205,214,230,.82)', 'rgba(236,170,96,.9)', 'rgba(128,180,236,.9)'];
  let shown = 0, cur = null;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < lines.length; i++) {
    const v = .86 - i * .072;
    for (const [u, w, c] of lines[i]) {
      if (shown >= n) break; shown++;
      const a = quadPt(q, u, v), b = quadPt(q, u + w, v); ctx.strokeStyle = cols[c]; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); cur = [quadPt(q, u + w + .012, v)];
    }
    if (shown >= n) { if (!cur) cur = [quadPt(q, .06, v)]; break; }
  }
  if (cur && Math.floor(t * 2.2) % 2 === 0) { ctx.fillStyle = 'rgba(230,236,245,.9)'; ctx.fillRect(cur[0][0], cur[0][1] - 5, 6, 10); }
  ctx.restore();
}

/* ───────── the prints ───────── */
async function buildPrint(key, LY, S, W, H) {
  const era = ERAS[key], out = makeCanvas(W, H), mk = () => { const c = makeCanvas(W, H), x = ctx2d(c); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); return c; };
  let geo = {};
  if (key === 'sd') {
    const layers = [mk(), mk(), mk()], P = new RisoPainter(LY, S, layers.map(c => ctx2d(c)));
    drawRoom(P, LY, era, {}); geo.screenQuad = P.screenQuad; await yieldFrame();
    finishRiso(out, layers, S, 9);
  } else if (key === 'blr') {
    const tone = mk(), angle = makeCanvas(W, H), art = makeCanvas(W, H), acc = makeCanvas(W, H);
    const ax = ctx2d(angle); ax.fillStyle = 'rgb(128,0,0)'; ax.fillRect(0, 0, W, H);
    const P = new EngravePainter(LY, S, ctx2d(tone), ax, ctx2d(art), ctx2d(acc));
    drawRoom(P, LY, era, {}); await yieldFrame();
    finishEngraving(out, tone, angle, art, acc, S, LY);
  } else if (key === 'nitk') {
    const expo = mk(), P = new CyanoPainter(LY, S, ctx2d(expo));
    drawRoom(P, LY, era, {}); geo.scope = P.scopeScreen; await yieldFrame();
    finishCyanotype(out, expo, S, LY);
  }
  return { kind: 'print', key, LY, S, W, H, img: out, geo };
}
function drawPrintFrame(ctx, R, t) {
  const { LY, S } = R, S0 = shell(LY), o = S0.open;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(R.img, 0, 0);
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0);
  if (R.key === 'blr') {
    // black kites wheeling over the rooftops
    ctx.save(); ctx.beginPath(); ctx.rect(o.x, o.y, o.w, o.h); ctx.clip(); ctx.translate(o.x, o.y); ctx.scale(o.w / 1000, o.h / 890);
    ctx.strokeStyle = '#1f2a2c'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [cx, cy, rad, sp, ph, sz] of [[380, 250, 120, 1, 0, 1], [650, 190, 80, -1.3, 2, .8], [520, 330, 150, .8, 4, .7]]) {
      const a = t * .16 * sp + ph, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad * .42, flap = Math.sin(t * 2.2 + ph) * .25, dir = Math.sign(-Math.sin(a) * sp) || 1;
      ctx.lineWidth = 2.6 * sz; ctx.beginPath(); ctx.moveTo(x - 22 * sz, y + (-4 + flap * 10) * sz); ctx.quadraticCurveTo(x - 10 * sz, y - (8 + flap * 6) * sz, x, y); ctx.quadraticCurveTo(x + 10 * sz, y - (8 + flap * 6) * sz, x + 22 * sz, y + (-4 + flap * 10) * sz); ctx.stroke();
      ctx.lineWidth = 2 * sz; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dir * 7 * sz, y + 6 * sz); ctx.stroke();
    }
    ctx.restore();
    restoreBars(ctx, R);
  } else if (R.key === 'nitk' && R.geo.scope) {
    // the oscilloscope trace: unexposed paper, so it prints white
    const [sx, sy, sw, sh] = R.geo.scope;
    ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
    ctx.strokeStyle = 'rgba(236,242,248,.28)'; ctx.lineWidth = 7; squareWave(ctx, sx, sy, sw, sh, t * .45); ctx.stroke();
    ctx.strokeStyle = 'rgba(244,248,252,.95)'; ctx.lineWidth = 2.2; squareWave(ctx, sx, sy, sw, sh, t * .45); ctx.stroke();
    ctx.restore();
  } else if (R.key === 'sd' && R.geo.screenQuad && Math.floor(t * 1.8) % 2 === 0) {
    const p = quadPt(R.geo.screenQuad, .52, .5); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(47,91,181,.9)'; ctx.fillRect(p[0], p[1] - 6, 5, 11);
  }
  ctx.restore();
}
function restoreBars(ctx, R) { // copy the window bars back over anything live drawn in the sky
  const S0 = shell(R.LY), o = S0.open, b = S0.bar, S = R.S;
  ctx.save(); ctx.beginPath(); ctx.rect(o.x, S0.transomY - b / 2 - 1, o.w, b + 6); ctx.rect(S0.mullionX - b / 2 - 1, o.y, b + 5, o.h); ctx.clip();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(R.img, 0, 0); ctx.restore();
}

/* the roller that re-inks the scene into the next process */
const ROLLER_INK = { now: '#2f56b8', sd: '#ff4fa8', blr: '#1f2a2c', nitk: '#1d4a86' };
function drawRoller(ctx, xPx, H, S, inkKey) {
  const w = 34 * S, ink = rgb(ROLLER_INK[inkKey] || '#333');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sh = ctx.createLinearGradient(xPx, 0, xPx + 40 * S, 0); sh.addColorStop(0, 'rgba(20,18,16,.32)'); sh.addColorStop(1, 'rgba(20,18,16,0)');
  ctx.fillStyle = sh; ctx.fillRect(xPx, 0, 40 * S, H);
  const g = ctx.createLinearGradient(xPx - w, 0, xPx, 0);
  g.addColorStop(0, css(mix(ink, '#000', .55))); g.addColorStop(.32, css(mix(ink, '#000', .15))); g.addColorStop(.55, css(mix(ink, '#ffffff', .35))); g.addColorStop(.7, css(ink)); g.addColorStop(1, css(mix(ink, '#000', .6)));
  ctx.fillStyle = g; ctx.fillRect(xPx - w, 0, w, H);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; for (let y = 0; y < H; y += 7 * S) ctx.fillRect(xPx - w * .5, y, w * .08, 3 * S); // ink texture on the rubber
  ctx.restore();
}

/* ───────── desktop: one sticky stage, scroll moves through the eras ───────── */
class Stage {
  constructor(canvas, caption, articles) {
    this.cv = canvas; this.ctx = ctx2d(canvas); this.caption = caption; this.articles = articles; this.R = {}; this.t0 = performance.now(); this.raf = 0; this.visible = true; this.building = null;
    this.trans = []; articles.forEach((a, i) => { if (i && a.dataset.era !== articles[i - 1].dataset.era) this.trans.push({ from: articles[i - 1].dataset.era, to: a.dataset.era, el: a }); });
    addEventListener('scroll', () => this.kick(), { passive: true });
    new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.kick(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => this.kick());
    setInterval(() => this.checkClock(), 30000);
  }
  layoutKey() { const r = this.cv.getBoundingClientRect(); return r.width / r.height > 1.2 ? 'wide' : 'tall'; }
  async build() {
    const r = this.cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), LY = LAYOUTS[this.layoutKey()];
    const W = Math.round(r.width * dpr), H = Math.round(W * LY.H / LY.W);
    if (!W || (this.W === W && this.LYk === this.layoutKey())) return;
    this.W = W; this.H = H; this.LYk = this.layoutKey(); this.cv.width = W; this.cv.height = H; this.S = W / LY.W; this.LY = LY;
    const date = sceneDate();
    this.R = {}; this.R.now = await buildNow(LY, this.S, W, H, date); this.minute = Math.floor(date.getTime() / 300000);
    this.draw(); this.kick();
    for (const k of ['sd', 'blr', 'nitk']) { await yieldFrame(); this.R[k] = await buildPrint(k, LY, this.S, W, H); this.kick(); }
  }
  async checkClock() { if (HOUR_OVERRIDE != null || !this.LY) return; const d = sceneDate(), m = Math.floor(d.getTime() / 300000); if (m !== this.minute) { this.minute = m; this.R.now = await buildNow(this.LY, this.S, this.W, this.H, d); this.kick(); } this.updateCaption(true); }
  state() {
    if (ERA_JUMP && ERAS[ERA_JUMP] && !this.userScrolled) { const i = ERA_ORDER.indexOf(ERA_JUMP); if (ROLL_JUMP != null && i > 0) return { a: ERA_ORDER[i - 1], b: ERA_JUMP, p: ROLL_JUMP }; return { a: ERA_JUMP, b: null, p: 0 }; }
    const vh = innerHeight, trig = vh * .7, span = vh * .42; let s = { a: this.articles[0].dataset.era, b: null, p: 0 };
    for (const tr of this.trans) { const p = clamp((trig - tr.el.getBoundingClientRect().top) / span); if (p >= 1) s = { a: tr.to, b: null, p: 0 }; else { if (p > 0) s = { a: s.a, b: tr.to, p }; break; } }
    if (REDUCED && s.b) s = s.p > .5 ? { a: s.b, b: null, p: 0 } : { a: s.a, b: null, p: 0 };
    return s;
  }
  frameOf(key, t) { const R = this.R[key]; if (!R) return false; if (R.kind === 'now') drawNowFrame(this.ctx, R, t); else drawPrintFrame(this.ctx, R, t); return true; }
  draw() {
    const t = window.__T ?? FIXED_T ?? (REDUCED ? 0 : (performance.now() - this.t0) / 1000), s = this.state(), ctx = this.ctx;
    if (!this.frameOf(s.a, t)) { if (!this.frameOf('now', t)) return; }
    if (s.b && this.R[s.b]) {
      const e = s.p * s.p * (3 - 2 * s.p), x = e * (this.W + 34 * this.S);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, this.H); ctx.clip(); this.frameOf(s.b, t); ctx.restore();
      if (s.p > 0 && s.p < 1) drawRoller(ctx, x, this.H, this.S, s.b);
    }
    this.cur = s; this.updateCaption();
  }
  updateCaption(force) {
    const s = this.cur || { a: 'now' }, k = s.b && s.p > .5 ? s.b : s.a, i = ERA_INFO[k];
    const txt = k === 'now' ? `San Jose · ${clockLabel(sceneDate())} · painted live` : `${i.years} · ${i.place} · ${i.process}`;
    if (force || this.caption.textContent !== txt) this.caption.textContent = txt;
  }
  kick() { if (this.raf || document.hidden) return; this.raf = requestAnimationFrame(() => { this.raf = 0; this.draw(); if (!REDUCED && FIXED_T == null && this.visible) this.kick(); }); }
}

/* ───────── phones: each era prints in its own frame as it scrolls into view ───────── */
class PhoneScenes {
  constructor(blocks) {
    this.items = blocks.map(b => ({ key: b.dataset.era, cv: b.querySelector('canvas.phone-scene'), cap: b.querySelector('.phone-caption'), R: null, shown: 0, visible: false }));
    this.t0 = performance.now(); this.raf = 0;
    const io = new IntersectionObserver(es => es.forEach(e => { const it = this.items.find(i => i.cv === e.target); if (!it) return; it.visible = e.isIntersecting; if (e.isIntersecting) this.ensure(it); }), { rootMargin: '200px' });
    this.items.forEach(it => io.observe(it.cv));
    document.addEventListener('visibilitychange', () => this.kick());
    setInterval(() => this.items.forEach(it => it.key === 'now' && it.cap && (it.cap.textContent = `San Jose · ${clockLabel(sceneDate())} · painted live`)), 30000);
  }
  async ensure(it) {
    if (it.R || it.building) return; it.building = true;
    const r = it.cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), LY = LAYOUTS.tall, W = Math.round(r.width * dpr), H = Math.round(W * LY.H / LY.W), S = W / LY.W;
    it.cv.width = W; it.cv.height = H;
    it.R = it.key === 'now' ? await buildNow(LY, S, W, H, sceneDate()) : await buildPrint(it.key, LY, S, W, H);
    it.born = performance.now(); if (it.cap) { const i = ERA_INFO[it.key]; it.cap.textContent = it.key === 'now' ? `San Jose · ${clockLabel(sceneDate())} · painted live` : `${i.years} · ${i.place} · ${i.process}`; }
    this.drawItem(it); this.kick();
  }
  drawItem(it) {
    const R = it.R, ctx = ctx2d(it.cv), t = window.__T ?? FIXED_T ?? (REDUCED ? 0 : (performance.now() - this.t0) / 1000);
    if (R.kind === 'now') { drawNowFrame(ctx, R, t); return; }
    const p = (FIXED_T != null || REDUCED) ? 1 : clamp((performance.now() - it.born) / 1400);
    if (p < 1) { const e = p * p * (3 - 2 * p), x = e * (R.W + 34 * R.S); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, 0, R.W, R.H); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, R.H); ctx.clip(); drawPrintFrame(ctx, R, t); ctx.restore(); drawRoller(ctx, x, R.H, R.S, R.key); }
    else drawPrintFrame(ctx, R, t);
  }
  kick() { if (this.raf || document.hidden || REDUCED || FIXED_T != null) return; this.raf = requestAnimationFrame(() => { this.raf = 0; let any = false; for (const it of this.items) if (it.R && it.visible) { this.drawItem(it); any = true; } if (any) this.kick(); }); }
}

/* ───────── boot ───────── */
async function boot() {
  const fonts = Promise.race([Promise.all(['600 10px "DM Sans"', '700 10px "DM Sans"', '500 20px Fraunces'].map(f => document.fonts.load(f))).catch(() => { }), new Promise(r => setTimeout(r, 4000))]);
  await Promise.all([loadPhotos(), fonts]);
  const phone = matchMedia('(max-width: 860px)').matches;
  let ready = [];
  if (phone) {
    const ps = new PhoneScenes([...document.querySelectorAll('.era[data-era]')].filter(b => b.querySelector('canvas.phone-scene')));
    if (FIXED_T != null || ERA_JUMP) { for (const it of ps.items) await ps.ensure(it); if (ERA_JUMP) { const it = ps.items.find(i => i.key === ERA_JUMP); it && it.cv.scrollIntoView({ block: 'start' }); } }
    else await ps.ensure(ps.items[0]);
    window.__phone = ps;
  } else {
    const stage = new Stage(document.getElementById('stage-canvas'), document.getElementById('stage-caption'), [...document.querySelectorAll('.column [data-era]')]);
    addEventListener('wheel', () => stage.userScrolled = true, { passive: true }); addEventListener('touchmove', () => stage.userScrolled = true, { passive: true });
    await stage.build();
    if (ERA_JUMP) { const el = [...document.querySelectorAll('.column [data-era]')].find(a => a.dataset.era === ERA_JUMP && a.classList.contains('era')); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - 120); }
    stage.draw();
    let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(async () => { await stage.build(); stage.draw(); }, 250); });
    window.__stage = stage;
  }
  // footer: the figurine, painted once
  const fc = document.getElementById('colophon-robot');
  if (fc) { const dpr = Math.min(2, devicePixelRatio || 1), w = fc.clientWidth || 72, h = fc.clientHeight || 96; fc.width = w * dpr; fc.height = h * dpr; const LYf = { W: w, H: h }; const P = new PaintPainter(LYf, dpr, ctx2d(fc), { sky: skyState(new Date()) }); const k = Math.min(w / 112, h / 168); drawRobot(P, w * .44, h * .95, k); }
  const shelf = document.getElementById('shelf');
  if (shelf && window.mountShelf) ready.push(window.mountShelf(shelf, ['overfitting', 'gpt7', 'startr', 'zinify', 'power']));
  await Promise.all(ready);
  window.__ready = true;
}
boot();
