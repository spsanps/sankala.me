'use strict';
/* Four desks — the scene.
   One room, drawn once as geometry. Every fill goes through a "painter" with a semantic key
   (wall, wood, glass, sky…) and a shade (-1 shadow … +1 light). Each era's painter turns those
   into its own process: gouache, riso ink separations, engraving tone + line direction, or
   cyanotype exposure. The room shell is identical in every era, so the prints stay registered. */

/* ───────── shell geometry ───────── */
function shell(LY) {
  const w = LY.win, o = { x: w.x + w.frame, y: w.y + w.frame, w: w.w - 2 * w.frame, h: w.h - 2 * w.frame };
  const tY = o.y + o.h * w.transom, mX = o.x + o.w / 2;
  return { win: w, open: o, transomY: tY, mullionX: mX, bar: 13 };
}
// Slightly hand-made rectangle (same seed → same wobble in every era, so registration holds)
function wrect(x, y, w, h, amp, seed) {
  const pts = wobblePts(resample(rectPts(x, y, w, h), 18), amp, .02, seed);
  return c => poly(c, pts);
}
function wpoly(pts, amp, seed, step = 16) { const p = wobblePts(resample([...pts, pts[0]], step), amp, .025, seed); return c => poly(c, p); }

/* Draws the room in a given era. `era` = { key, view(P, LY, st), objects(P, LY, st), pins(P, LY, st) } */
function drawRoom(P, LY, era, st, parts = 'all') {
  const S = shell(LY), o = S.open, W = LY.W, H = LY.H, amp = P.wob ?? 1.1;
  const doSky = parts === 'all' || parts === 'sky', doLand = parts === 'all' || parts === 'land', doRoom = parts === 'all' || parts === 'room' || parts === 'shell', doObj = parts === 'all' || parts === 'room' || parts === 'objects';

  if (doSky || doLand) {
    P.push(c => { c.beginPath(); c.rect(o.x, o.y, o.w, o.h); c.clip(); c.translate(o.x, o.y); c.scale(o.w / 1000, o.h / 890); });
    era.view(P, st, doSky, doLand);
    P.pop();
  }
  if (!doRoom && !doObj) return;
  if (doRoom) {

  /* wall, with the window opening left open so the view shows through */
  P.ang(90);
  P.f('wall', 0, c => { c.beginPath(); c.rect(-20, -20, W + 40, LY.deskY + 40); c.rect(o.x + o.w, o.y, -o.w, o.h); }, [0, 0, 0, LY.deskY, .25, -.15], 'evenodd');
  // a little depth where the wall meets the window reveal
  P.f('wall', -.55, wpoly([[S.win.x - 6, S.win.y - 6], [S.win.x + S.win.w + 6, S.win.y - 6], [S.win.x + S.win.w + 6, S.win.y], [S.win.x - 6, S.win.y]], .4, 3));

  /* window frame, mullion, transom */
  P.ang(0);
  const fr = S.win;
  P.f('frame', 0, c => { c.beginPath(); c.rect(fr.x, fr.y, fr.w, fr.h); c.rect(o.x + o.w, o.y, -o.w, o.h); }, null, 'evenodd');
  P.f('frame', -.6, c => { c.beginPath(); c.rect(o.x, o.y, o.w, 7); c.rect(o.x, o.y, 6, o.h); }); // inner reveal shadow
  P.f('frame', .1, c => { c.beginPath(); c.rect(o.x, S.transomY - S.bar / 2, o.w, S.bar); });
  P.f('frame', 0, c => { c.beginPath(); c.rect(S.mullionX - S.bar / 2, o.y, S.bar, o.h); });
  P.f('frame', -.45, c => { c.beginPath(); c.rect(o.x, S.transomY + S.bar / 2, o.w, 4); c.rect(S.mullionX + S.bar / 2, o.y, 3, o.h); });
  P.s('frameLine', -.8, 1.1, c => { c.beginPath(); c.rect(fr.x + .5, fr.y + .5, fr.w - 1, fr.h - 1); c.rect(o.x, o.y, o.w, o.h); });
  // sill
  const sy = LY.sill.y, sh = LY.sill.h, so = LY.sill.over;
  P.f('frame', .45, c => poly(c, [[fr.x - so, sy], [fr.x + fr.w + so, sy], [fr.x + fr.w + so + 4, sy + 6], [fr.x - so - 4, sy + 6]]));
  P.f('frame', -.25, c => { c.beginPath(); c.rect(fr.x - so - 4, sy + 6, fr.w + 2 * so + 8, sh - 6); });
  P.f('wall', -.7, c => { c.beginPath(); c.rect(fr.x - so, sy + sh, fr.w + 2 * so, 7); }); // shadow under sill
  P.s('frameLine', -.8, 1, c => { c.beginPath(); c.moveTo(fr.x - so - 4, sy + 6); c.lineTo(fr.x + fr.w + so + 4, sy + 6); c.moveTo(fr.x - so - 4, sy + sh); c.lineTo(fr.x + fr.w + so + 4, sy + sh); });

  /* pinboard */
  const pb = LY.pin;
  P.ang(35);
  P.f('wall', -.65, c => { c.beginPath(); c.rect(pb.x + 6, pb.y + 8, pb.w, pb.h); }); // board shadow on wall
  P.f('pinframe', 0, wrect(pb.x, pb.y, pb.w, pb.h, amp * .5, 11));
  P.ang(-30);
  P.f('cork', 0, wrect(pb.x + 12, pb.y + 12, pb.w - 24, pb.h - 24, amp * .4, 12), [0, pb.y, 0, pb.y + pb.h, .15, -.2]);
  P.f('pinframe', -.6, c => { c.beginPath(); c.rect(pb.x + 12, pb.y + 12, pb.w - 24, 5); c.rect(pb.x + 12, pb.y + 12, 4, pb.h - 24); });
  P.s('frameLine', -.9, 1, c => { c.beginPath(); c.rect(pb.x, pb.y, pb.w, pb.h); c.rect(pb.x + 12, pb.y + 12, pb.w - 24, pb.h - 24); });
  era.pins(P, LY, st);

  /* desk: one slab of oak, its front edge and the dark under it */
  const dy = LY.deskY, fy = LY.frontY, ft = LY.frontT, vp = LY.vp;
  P.ang('vp');
  P.f('wood', 0, c => { c.beginPath(); c.rect(-40, dy, W + 80, fy - dy); }, [0, dy, 0, fy, -.3, .22]);
  P.f('wood', -.8, c => { c.beginPath(); c.rect(-40, dy, W + 80, 5); }); // contact shadow along the wall
  // grain: long, faint streaks that follow the perspective toward the vanishing point
  const rnd = mulberry32(77);
  for (let i = 0; i < 46; i++) {
    const fx = -400 + (W + 800) * (i + rnd() * .8) / 46, y0 = dy + 10 + rnd() * (fy - dy) * .5, y1 = Math.min(fy - 4, y0 + 60 + rnd() * 240);
    const at = y => vp[0] + (fx - vp[0]) * (y - vp[1]) / (fy - vp[1]);
    P.s('woodGrain', -.2 + rnd() * .4, .6 + rnd() * .9, c => { c.beginPath(); c.moveTo(at(y0), y0); for (let k2 = 1; k2 <= 8; k2++) { const y = lerp(y0, y1, k2 / 8); c.lineTo(at(y) + Math.sin(k2 * 1.3 + i) * 1.6, y); } });
  }
  P.ang(0);
  P.f('wood', .65, c => { c.beginPath(); c.rect(-40, fy - 3, W + 80, 3); }); // the front edge catches the light
  P.f('woodFront', 0, c => { c.beginPath(); c.rect(-40, fy, W + 80, ft); }, [0, fy, 0, fy + ft, .1, -.4]);
  P.f('underDesk', 0, c => { c.beginPath(); c.rect(-40, fy + ft, W + 80, H - fy - ft + 40); });
  }
  if (!doObj) return;
  /* lamp (the same lamp in every era) */
  drawLamp(P, LY, st);
  /* era objects */
  era.objects(P, LY, st);
}

function drawLamp(P, LY, st) {
  const L = LY.lamp, [cx, cy] = L.clamp, [ex, ey] = L.elbow, [hx, hy] = L.head;
  P.ang(60);
  // clamp on the desk's back edge
  P.f('metalDark', 0, c => { c.beginPath(); c.rect(cx - 13, cy - 26, 26, 30); });
  P.f('metalDark', .5, c => { c.beginPath(); c.rect(cx - 13, cy - 26, 26, 5); });
  P.f('metalDark', -.4, c => { c.beginPath(); c.rect(cx - 7, cy - 52, 14, 28); });
  // arms: twin rods with springs
  const rod = (a, b, off, sh) => P.s('metal', sh, 5, c => { c.beginPath(); c.moveTo(a[0] + off, a[1]); c.lineTo(b[0] + off, b[1]); });
  const base = [cx, cy - 50];
  rod(base, [ex, ey], -3, .2); rod(base, [ex, ey], 4, -.3);
  rod([ex, ey], [hx, hy], 0, .25); rod([ex, ey + 6], [hx - 4, hy + 6], 0, -.35);
  // springs: little zigzags along the lower arm
  P.s('metalDark', -.2, 1.6, c => { c.beginPath(); const n = 22; for (let i = 0; i <= n; i++) { const t = .18 + .5 * i / n, x = lerp(base[0], ex, t) + (i % 2 ? 6 : -1), y = lerp(base[1], ey, t); i ? c.lineTo(x, y) : c.moveTo(x, y); } });
  P.f('metalDark', 0, c => { c.beginPath(); c.arc(ex, ey, 8, 0, TAU); });
  P.f('metal', .6, c => { c.beginPath(); c.arc(ex - 2, ey - 2, 3, 0, TAU); });
  // shade: a cone pointing down toward the desk
  const ang = Math.atan2(140, 70), len = 96, r0 = 16, r1 = 52;
  const ax = Math.cos(ang), ay = Math.sin(ang), nx = -ay, ny = ax;
  const p0 = [hx + nx * r0, hy + ny * r0], p1 = [hx - nx * r0, hy - ny * r0];
  const q1 = [hx + ax * len - nx * r1, hy + ay * len - ny * r1], q0 = [hx + ax * len + nx * r1, hy + ay * len + ny * r1];
  P.f('lampShade', 0, c => poly(c, [p0, p1, q1, q0]), [p1[0], p1[1], p0[0], p0[1], .45, -.45]);
  P.f('lampShade', -.15, c => { c.beginPath(); c.ellipse(hx + ax * len, hy + ay * len, r1, 13, ang - PI / 2, 0, TAU); });
  P.f('lampInside', 0, c => { c.beginPath(); c.ellipse(hx + ax * len, hy + ay * len, r1 - 6, 9, ang - PI / 2, 0, TAU); });
  P.f('metalDark', 0, c => { c.beginPath(); c.arc(hx, hy, 11, 0, TAU); });
  P.s('frameLine', -.9, 1.1, c => poly(c, [p0, p1, q1, q0]));
  P.lampHead = { x: hx + ax * len, y: hy + ay * len, ang };
}

/* ───────── shared objects ───────── */
function drawLaptop(P, LY, screen) {
  const [cx, cy] = LY.center, k = LY.os || 1, hw = 196 * k, bw = 186 * k, by = cy - 56 * k;
  P.ang('vp');
  // shadow
  P.f('shadow', 0, c => poly(c, [[cx - hw - 6, cy + 2], [cx + hw + 14, cy + 2], [cx + hw + 6, cy + 18], [cx - hw + 4, cy + 18]]));
  // deck and keys
  P.f('alu', 0, c => poly(c, [[cx - hw, cy], [cx + hw, cy], [cx + bw, by], [cx - bw, by]]), [0, by, 0, cy, -.1, .3]);
  P.f('alu', -.5, c => poly(c, [[cx - hw, cy], [cx + hw, cy], [cx + hw - 2, cy + 10], [cx - hw + 2, cy + 10]]));
  P.ang(0);
  for (let row = 0; row < 5; row++) {
    const t0 = .12 + row * .13, t1 = t0 + .1, ya = lerp(by, cy, t0), yb = lerp(by, cy, t1);
    const wa = lerp(bw, hw, t0) * .86, wb = lerp(bw, hw, t1) * .86, n = row === 4 ? 1 : 12;
    for (let k = 0; k < n; k++) {
      const f0 = row === 4 ? .3 : k / n, f1 = row === 4 ? .7 : (k + .82) / n;
      P.f('keys', 0, c => poly(c, [[cx - wa + 2 * wa * f0, ya], [cx - wa + 2 * wa * f1, ya], [cx - wb + 2 * wb * f1, yb], [cx - wb + 2 * wb * f0, yb]]));
    }
  }
  P.f('alu', -.15, c => poly(c, [[cx - 54 * k, cy - 6], [cx + 54 * k, cy - 6], [cx + 50 * k, cy - 18 * k], [cx - 50 * k, cy - 18 * k]])); // trackpad
  // screen
  const sb = by - 2, st = by - 240 * k, swb = 180 * k, swt = 176 * k;
  P.ang(0);
  P.f('aluDark', 0, c => poly(c, [[cx - swb, sb], [cx + swb, sb], [cx + swt, st], [cx - swt, st]]));
  const ix = 11 * k, iy = 11 * k, scr = [[cx - swb + ix, sb - iy - 6], [cx + swb - ix, sb - iy - 6], [cx + swt - ix, st + iy], [cx - swt + ix, st + iy]];
  P.screenQuad = scr;
  P.f('screen', 0, c => poly(c, scr));
  if (screen) screen(P, scr);
  P.f('aluDark', -.5, c => { c.beginPath(); c.rect(cx - swb, sb - 6, 2 * swb, 6); });
  P.s('frameLine', -.9, 1, c => poly(c, [[cx - swb, sb], [cx + swb, sb], [cx + swt, st], [cx - swt, st]]));
}
// map (u,v) in 0..1 to a point inside the screen quad
function quadPt(q, u, v) { const a = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)], b = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)]; return [lerp(a[0], b[0], v), lerp(a[1], b[1], v)]; }

function drawPinPrint(P, LY, spec) { // spec: { photo, fx, fy, fw, rot, pin:'pin'|'tape' }
  const pb = LY.pin, x = pb.x + 12 + spec.fx * (pb.w - 24), y = pb.y + 12 + spec.fy * (pb.h - 24), w = spec.fw * (pb.w - 24);
  P.photo(spec.photo, x, y, w, spec.rot || 0, spec);
}

function drawTelescope(P, LY, s = 1) {
  const [bx, by] = LY.far;
  P.ang(25);
  const top = [bx, by - 92 * s];
  for (const [dx, dy] of [[-44, 2], [40, 0], [8, 12]]) P.s('metalDark', dx > 0 ? -.3 : .1, 4.2 * s, c => { c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(bx + dx * s, by + dy * s); });
  P.f('shadow', 0, c => { c.beginPath(); c.ellipse(bx, by + 8 * s, 52 * s, 9 * s, 0, 0, TAU); });
  P.f('metalDark', 0, c => { c.beginPath(); c.rect(top[0] - 9 * s, top[1] - 26 * s, 18 * s, 28 * s); });
  // tube, pointing up and out of the window
  const rear = [bx + 34 * s, by - 132 * s], front = [bx - 118 * s, by - 262 * s], r = 16 * s;
  const dx = front[0] - rear[0], dy = front[1] - rear[1], l = Math.hypot(dx, dy), nx = -dy / l * r, ny = dx / l * r;
  P.ang(Math.atan2(dy, dx) / DEG);
  P.f('tube', 0, c => poly(c, [[rear[0] + nx, rear[1] + ny], [front[0] + nx, front[1] + ny], [front[0] - nx, front[1] - ny], [rear[0] - nx, rear[1] - ny]]), [rear[0] + nx, rear[1] + ny, rear[0] - nx, rear[1] - ny, .5, -.5]);
  const band = (t, wdt, key, sh) => { const px = lerp(rear[0], front[0], t), py = lerp(rear[1], front[1], t), ex = dx / l * wdt, ey = dy / l * wdt; P.f(key, sh, c => poly(c, [[px + nx * 1.12, py + ny * 1.12], [px + ex + nx * 1.12, py + ey + ny * 1.12], [px + ex - nx * 1.12, py + ey - ny * 1.12], [px - nx * 1.12, py - ny * 1.12]])); };
  band(-.02, 14 * s, 'metalDark', 0); band(.94, 22 * s, 'metalDark', -.1); band(.42, 10 * s, 'metalDark', .1);
  P.f('glass', .4, c => { c.beginPath(); c.ellipse(front[0] + dx / l * 22 * s, front[1] + dy / l * 22 * s, r * 1.05, r * .42, Math.atan2(dy, dx) + PI / 2, 0, TAU); });
  // finder scope
  const f0 = [lerp(rear[0], front[0], .3) + nx * 1.7, lerp(rear[1], front[1], .3) + ny * 1.7], f1 = [lerp(rear[0], front[0], .62) + nx * 1.7, lerp(rear[1], front[1], .62) + ny * 1.7];
  P.s('metalDark', 0, 6 * s, c => { c.beginPath(); c.moveTo(f0[0], f0[1]); c.lineTo(f1[0], f1[1]); });
  P.s('frameLine', -.9, 1, c => poly(c, [[rear[0] + nx, rear[1] + ny], [front[0] + nx, front[1] + ny], [front[0] - nx, front[1] - ny], [rear[0] - nx, rear[1] - ny]]));
}

/* The Paper Robots robot as a small figurine — the house character, standing on the desk. */
function drawRobot(P, x, y, s, blink = 0) {
  const u = v => v * s;
  P.ang(0);
  P.f('shadow', 0, c => { c.beginPath(); c.ellipse(x + u(6), y + u(2), u(40), u(7), 0, 0, TAU); });
  // legs
  P.f('robot', -.35, c => { c.beginPath(); c.rect(x - u(19), y - u(20), u(15), u(20)); c.rect(x + u(4), y - u(20), u(15), u(20)); });
  // body
  const bx = x - u(25), bt = y - u(70);
  P.f('robot', 0, c => { c.beginPath(); c.rect(bx, bt, u(50), u(52)); });
  P.f('robot', -.6, c => poly(c, [[bx + u(50), bt], [bx + u(60), bt - u(7)], [bx + u(60), bt + u(45)], [bx + u(50), bt + u(52)]]));
  P.f('robot', .35, c => poly(c, [[bx, bt], [bx + u(50), bt], [bx + u(60), bt - u(7)], [bx + u(10), bt - u(7)]]));
  // arms
  P.f('robot', -.2, c => { c.beginPath(); c.rect(bx - u(12), bt + u(6), u(12), u(34)); });
  P.f('robot', -.5, c => { c.beginPath(); c.rect(bx + u(60), bt + u(2), u(10), u(34)); });
  // head: a folded-paper cube
  const hx = x - u(32), hy = bt - u(66), hw = u(64), hh = u(58), dx = u(15), dy = u(12);
  P.f('robot', -.55, c => poly(c, [[hx + hw, hy], [hx + hw + dx, hy - dy], [hx + hw + dx, hy + hh - dy], [hx + hw, hy + hh]]));
  P.f('robot', .4, c => poly(c, [[hx, hy], [hx + hw, hy], [hx + hw + dx, hy - dy], [hx + dx, hy - dy]]));
  P.f('robot', 0, c => { c.beginPath(); c.rect(hx, hy, hw, hh); });
  // white folded corner at the top right
  P.f('robotWhite', 0, c => poly(c, [[hx + hw - u(22), hy], [hx + hw, hy], [hx + hw, hy + u(26)]]));
  P.f('robotWhite', -.3, c => poly(c, [[hx + hw, hy], [hx + hw + dx, hy - dy], [hx + hw + dx, hy - dy + u(18)], [hx + hw, hy + u(26)]]));
  // ear disc on the right side
  P.f('vermilion', 0, c => { c.beginPath(); c.ellipse(hx + hw + dx * .55, hy + hh * .52 - dy * .5, u(5.5), u(12), 0, 0, TAU); });
  P.f('vermilion', -.4, c => { c.beginPath(); c.ellipse(hx + hw + dx * .55 + u(2), hy + hh * .52 - dy * .5, u(3), u(8), 0, 0, TAU); });
  // eyes
  const ey = hy + hh * .5;
  for (const ex of [hx + hw * .3, hx + hw * .68]) {
    if (blink > .5) P.s('ink', 0, u(2.4), c => { c.beginPath(); c.moveTo(ex - u(9), ey); c.quadraticCurveTo(ex, ey + u(3.5), ex + u(9), ey); });
    else {
      P.f('robotWhite', .3, c => { c.beginPath(); c.ellipse(ex, ey, u(10.5), u(10.5) * (1 - blink * .9), 0, 0, TAU); });
      P.f('ink', 0, c => { c.beginPath(); c.arc(ex + u(1.5), ey + u(1), u(4.6), 0, TAU); });
      P.f('robotWhite', .8, c => { c.beginPath(); c.arc(ex + u(3), ey - u(1), u(1.4), 0, TAU); });
    }
  }
  P.s('frameLine', -.9, .9, c => { c.beginPath(); c.rect(hx, hy, hw, hh); c.rect(bx, bt, u(50), u(52)); });
  return { hx, hy, hw, hh, ey, eyes: [hx + hw * .3, hx + hw * .68] };
}

/* ═════════════ ERA: now — San Jose, 2024– ═════════════ */
const ERA_NOW = {
  key: 'now',
  view(P, st, doSky, doLand) {
    const sky = st.sky;
    if (doSky) {
      P.ang(0);
      // sky: horizontal painted bands from zenith colour to horizon colour
      const n = 18;
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1.25) / n;
        P.f('skyBand', t0, c => { c.beginPath(); c.rect(-10, t0 * 640 - 4, 1020, (t1 - t0) * 640 + 8); });
      }
      P.f('skyBand', 1, c => { c.beginPath(); c.rect(-10, 600, 1020, 300); });
      if (sky.sunIn) P.sun(sky.sunIn);
      if (sky.moonIn) P.moon(sky.moonIn);
    }
    if (doLand) {
      P.ang(0);
      const night = sky.night;
      // the far ridge: Mt Hamilton, with the Lick Observatory domes on its summit
      const ridgeY = x => 352 - 92 * Math.exp(-Math.pow((x - 600) / 190, 2)) - 30 * Math.exp(-Math.pow((x - 300) / 140, 2)) - 18 * Math.exp(-Math.pow((x - 860) / 120, 2)) + 5 * Math.sin(x * .031) + 3 * Math.sin(x * .083 + 1);
      const far = []; for (let x = -20; x <= 1020; x += 6) far.push([x, ridgeY(x)]);
      P.f('hillFar', 0, c => poly(c, [...far, [1020, 560], [-20, 560]]), [0, 250, 0, 480, .25, -.2]);
      // sunlit and shaded flanks, painted as soft bands
      for (let i = 0; i < 7; i++) { const x0 = 150 + i * 120, y0 = ridgeY(x0); P.f('hillFar', -.28, c => { c.beginPath(); c.moveTo(x0, y0 + 2); c.bezierCurveTo(x0 + 26, y0 + 30, x0 + 6, y0 + 70, x0 + 34, 480); c.lineTo(x0 + 70, 480); c.bezierCurveTo(x0 + 40, y0 + 60, x0 + 50, y0 + 24, x0 + 22, y0 + 6); c.closePath(); }); }
      const sx = 600, sy = ridgeY(600);
      P.f('dome', 0, c => { c.beginPath(); c.arc(sx - 10, sy + 1, 12, PI, TAU); c.rect(sx - 22, sy + 1, 24, 6); c.arc(sx + 20, sy + 3, 9, PI, TAU); c.rect(sx + 11, sy + 3, 18, 5); c.arc(sx - 38, sy + 6, 6.5, PI, TAU); c.rect(sx - 45, sy + 6, 13, 4); });
      P.f('dome', -.5, c => { c.beginPath(); c.arc(sx - 10, sy + 1, 12, PI * 1.55, TAU); c.lineTo(sx - 10, sy + 1); c.arc(sx + 20, sy + 3, 9, PI * 1.55, TAU); c.lineTo(sx + 20, sy + 3); });
      P.s('ridgeLine', -.2, 1.6, c => { c.beginPath(); c.moveTo(sx + 120, sy + 76); c.bezierCurveTo(sx + 60, sy + 70, sx + 110, sy + 40, sx + 50, sy + 30); c.bezierCurveTo(sx + 10, sy + 24, sx + 40, sy + 14, sx + 18, sy + 8); });
      P.domes = [sx - 10, sy];
      // the foothills: golden grass, oak-dark ravines
      const midY = x => 452 + 18 * Math.sin(x * .011 + .4) + 10 * Math.sin(x * .029 + 2) + 6 * Math.sin(x * .07);
      const mid = []; for (let x = -20; x <= 1020; x += 6) mid.push([x, midY(x)]);
      P.f('hillMid', 0, c => poly(c, [...mid, [1020, 600], [-20, 600]]), [0, 430, 0, 560, .3, -.25]);
      const oak = mulberry32(13);
      for (let i = 0; i < 14; i++) { // ravines: a dark fold with oaks crowded into it
        const x0 = oak() * 1000, y0 = midY(x0) + 6, len = 40 + oak() * 60, bend = (oak() - .5) * 40;
        P.s('hillMid', -.7, 5 + oak() * 4, c => { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + bend, y0 + len * .5, x0 + bend * .4, y0 + len); });
        for (let k = 0; k < 9; k++) { const t2 = oak(), px = x0 + bend * t2 * .8 + (oak() - .5) * 14, py = y0 + len * t2; P.f('oak', -.2 + oak() * .4, c => { c.beginPath(); c.ellipse(px, py, 4 + oak() * 4, 3 + oak() * 2, 0, 0, TAU); }); }
      }
      for (let i = 0; i < 60; i++) { const px = oak() * 1000, py = midY(px) + 12 + oak() * 60; P.f('oak', -.1, c => { c.beginPath(); c.ellipse(px, py, 3 + oak() * 3, 2 + oak() * 2, 0, 0, TAU); }); }
      // haze over the valley floor
      P.f('valley', .6, c => { c.beginPath(); c.rect(-20, 528, 1040, 40); });
      P.f('valley', 0, c => { c.beginPath(); c.rect(-20, 560, 1040, 120); }, [0, 560, 0, 680, .35, -.2]);
      // the city: downtown towers on the left, then low roofs all the way across
      const r = mulberry32(41), towers = [];
      for (let i = 0; i < 9; i++) { const x = 150 + i * 22 + r() * 10, h = 22 + r() * 46, w = 12 + r() * 10; towers.push([x, h, w]); P.f('tower', r() * .5 - .2, c => { c.beginPath(); c.rect(x, 566 - h, w, h); }); P.f('tower', -.5, c => { c.beginPath(); c.rect(x + w * .7, 566 - h, w * .3, h); }); }
      P.towers = towers;
      for (let row = 0; row < 7; row++) { // low roofs in rows that get bigger as they come closer
        const y = 572 + row * row * 2.4 + row * 6, sc = 1 + row * .35;
        for (let x = -10 + r() * 20; x < 1010; x += (10 + r() * 16) * sc) { const w = (6 + r() * 10) * sc, h = (2.5 + r() * 2.5) * sc; P.f(r() < .55 ? 'roofA' : 'roofB', .3, c => { c.beginPath(); c.rect(x, y - h, w, h * .55); }); P.f(r() < .55 ? 'roofA' : 'roofB', -.35, c => { c.beginPath(); c.rect(x, y - h * .45, w, h * .45); }); if (r() < .35) P.f('treeFar', r() * .4 - .2, c => { c.beginPath(); c.ellipse(x + w + 3 * sc, y - h * .4, 4 * sc, 3 * sc, 0, 0, TAU); }); }
      }
      // the street below: yards and street trees between the roofs
      P.f('yard', 0, c => { c.beginPath(); c.rect(-20, 640, 1040, 260); }, [0, 640, 0, 900, .2, -.3]);
      const yt = mulberry32(31); for (let i = 0; i < 40; i++) { const x = yt() * 1000, y = 650 + yt() * 90; P.f('oak', yt() * .6 - .4, c => { c.beginPath(); c.ellipse(x, y, 14 + yt() * 14, 10 + yt() * 8, 0, 0, TAU); }); }
      // our street: two tiled roofs, a fan palm, a dark magnolia
      drawTileRoof(P, [[-40, 676], [400, 648], [470, 900], [-40, 900]], 3, night);
      drawTileRoof(P, [[560, 712], [1040, 690], [1040, 900], [520, 900]], 5, night);
      const mag = mulberry32(9);
      for (let i = 0; i < 120; i++) { const a = mag() * TAU, d = Math.sqrt(mag()) * 130, x = 905 + Math.cos(a) * d * 1.05, y = 640 + Math.sin(a) * d * .78, up = (640 - y) / 130; P.f('oak', clamp(up * .6 + (mag() - .5) * .5, -.8, .8), c => { c.beginPath(); c.ellipse(x, y, 13 + mag() * 12, 9 + mag() * 7, mag() * 3, 0, TAU); }); }
      drawFanPalm(P, 128, 905, 1.25, 21);
    }
  },
  pins(P, LY) {
    drawPinPrint(P, LY, { photo: 'ebay-headquarters', fx: .05, fy: .1, fw: .29, rot: -3.2, pin: 'pin' });
    drawPinPrint(P, LY, { photo: 'neurips-award', fx: .4, fy: .42, fw: .45, rot: 2.4, pin: 'tape' });
    drawPinPrint(P, LY, { paper: 'eai', fx: .58, fy: .05, fw: .3, rot: 3.5, pin: 'pin' });
  },
  objects(P, LY, st) {
    drawLaptop(P, LY, (P2, q) => P2.screenNow && P2.screenNow(q));
    drawBooks(P, LY);
    P.robotGeom = drawRobot(P, LY.right[0], LY.right[1], 1.3 * (LY.os || 1), st.blink || 0);
    drawTelescope(P, LY, 1.08 * (LY.os || 1));
  },
};

function drawPalm(P, x, y, s, seed, key) { // a coconut palm: a leaning trunk, arching fronds, hanging leaflets
  const r = mulberry32(seed), lean = (r() - .5) * 80 * s;
  const top = [x + lean, y - (300 + r() * 40) * s];
  P.s(key + 'Trunk', 0, 11 * s, c => { c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + lean * .1, y - 120 * s, x + lean * .7, y - 220 * s, top[0], top[1]); });
  P.s(key + 'Trunk', -.4, 2 * s, c => { c.beginPath(); for (let k = 1; k < 14; k++) { const t = k / 14, px = lerp(x, top[0], t * t * .7 + t * .3), py = lerp(y, top[1], t); c.moveTo(px - 5 * s, py); c.lineTo(px + 5 * s, py - 2 * s); } });
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = -PI + .25 + (i / (n - 1)) * (PI - .5) + (r() - .5) * .18, L = (100 + r() * 50) * s, g = (.55 + r() * .35) * (1 - Math.abs(Math.sin(a)) * .45);
    const pts = []; for (let k = 0; k <= 14; k++) { const t = k / 14; pts.push([top[0] + Math.cos(a) * L * t, top[1] + Math.sin(a) * L * t * .75 + g * L * t * t]); }
    P.s(key, -.1, 2.4 * s, c => poly(c, pts, false));
    for (let k = 2; k < 14; k++) {
      const [px, py] = pts[k], [qx, qy] = pts[k + 1], tang = Math.atan2(qy - py, qx - px), ll = (30 - k * 1.6) * s;
      for (const side of [-1, 1]) {
        const d = lerp(tang + side * 1.25, PI / 2, .45);
        P.s(key, side > 0 ? -.35 : .05, 1.7 * s, c => { c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + Math.cos(d) * ll * .5, py + Math.sin(d) * ll * .4, px + Math.cos(d) * ll, py + Math.sin(d) * ll); });
      }
    }
  }
  P.f(key + 'Trunk', -.2, c => { c.beginPath(); c.arc(top[0] - 6 * s, top[1] + 8 * s, 7 * s, 0, TAU); c.arc(top[0] + 7 * s, top[1] + 10 * s, 6 * s, 0, TAU); });
}
function drawTileRoof(P, pts, seed, night) { // pts: ridge left, ridge right, eave right, eave left
  const [r0, r1, e1, e0] = pts;
  P.f('tile', 0, c => poly(c, pts), [0, r0[1], 0, e0[1], .3, -.15]);
  const r = mulberry32(seed);
  for (let i = 0; i <= 36; i++) { // barrel tiles in courses down the slope
    const u = i / 36, a = [lerp(r0[0], r1[0], u), lerp(r0[1], r1[1], u)], b = [lerp(e0[0], e1[0], u), lerp(e0[1], e1[1], u)];
    P.s('tile', -.5 + r() * .25, 2.4, c => { c.beginPath(); c.moveTo(a[0], a[1] + 3); c.lineTo(b[0], b[1]); });
    P.s('tile', .45, 1.2, c => { c.beginPath(); c.moveTo(a[0] + 3, a[1] + 3); c.lineTo(b[0] + 4, b[1]); });
  }
  for (let k = 1; k < 7; k++) { const v = Math.pow(k / 7, 1.3); P.s('tile', -.35, 1, c => { c.beginPath(); c.moveTo(lerp(r0[0], e0[0], v), lerp(r0[1], e0[1], v)); c.lineTo(lerp(r1[0], e1[0], v), lerp(r1[1], e1[1], v)); }); }
  P.f('tile', .55, c => { c.beginPath(); c.moveTo(r0[0], r0[1] - 3); c.lineTo(r1[0], r1[1] - 3); c.lineTo(r1[0], r1[1] + 5); c.lineTo(r0[0], r0[1] + 5); c.closePath(); });
  // a skylight that glows after dark
  const sx = lerp(r0[0], r1[0], .62), sy = lerp(r0[1], e0[1], .42);
  P.f(night > .25 ? 'windowLit' : 'windowDay', 0, c => poly(c, [[sx, sy], [sx + 42, sy - 2], [sx + 46, sy + 26], [sx + 2, sy + 28]]));
  P.s('stucco', .2, 2.5, c => poly(c, [[sx, sy], [sx + 42, sy - 2], [sx + 46, sy + 26], [sx + 2, sy + 28]]));
}
function drawFanPalm(P, x, y, s, seed) { // a Mexican fan palm: tall, thin, a small dense crown
  const r = mulberry32(seed), top = [x + 40 * s, y - 560 * s];
  P.s('palmTrunk', 0, 11 * s, c => { c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 6 * s, y - 300 * s, x + 40 * s, y - 480 * s, top[0], top[1]); });
  for (let i = 0; i < 34; i++) { const a = PI / 2 + (r() - .5) * 1.6, len = (26 + r() * 30) * s, ox = (r() - .5) * 16 * s; P.s('palmSkirt', r() * .6 - .4, 2.2 * s, c => { c.beginPath(); c.moveTo(top[0] + ox, top[1] + 2 * s); c.quadraticCurveTo(top[0] + ox + Math.cos(a) * len * .4, top[1] + len * .5, top[0] + ox * 1.4 + Math.cos(a) * len * .5, top[1] + len); }); }
  for (let i = 0; i < 26; i++) {
    const a = -PI * 1.05 + (i / 25) * PI * 1.1 + (r() - .5) * .2, len = (52 + r() * 30) * s, droop = Math.cos(a) * 6;
    const ex = top[0] + Math.cos(a) * len, ey = top[1] + Math.sin(a) * len * .8 + Math.abs(Math.cos(a)) * 14 * s;
    P.s('palm', -.3 + r() * .5, 2.2 * s, c => { c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(top[0] + Math.cos(a) * len * .5, top[1] + Math.sin(a) * len * .4 - 4, ex, ey + droop); });
    for (let k = 0; k < 5; k++) { const f = .55 + k * .1; P.s('palm', -.1, 1.4 * s, c => { c.beginPath(); c.moveTo(top[0] + (ex - top[0]) * f, top[1] + (ey - top[1]) * f); c.lineTo(top[0] + (ex - top[0]) * (f + .12) + Math.cos(a + .5) * 6 * s, top[1] + (ey - top[1]) * (f + .12) + Math.sin(a + .5) * 6 * s); }); }
  }
}
function drawBooks(P, LY) {
  const k = LY.os || 1, [lx, ly] = LY.left, books = [
    { key: 'bookYellow', h: 34, w: 270, dx: 6, title: 'WINNING BY OVERFITTING' },
    { key: 'bookCobalt', h: 30, w: 252, dx: 20, title: 'GPT-7 WILL HAVE ARMS' },
    { key: 'bookKraft', h: 27, w: 260, dx: 2, title: 'STARTR · A POST-MORTEM' },
    { key: 'bookPink', h: 23, w: 240, dx: 24, title: 'ZINIFY' },
    { key: 'bookCream', h: 25, w: 232, dx: 12, title: 'POWER QUALITY · LSTM' },
  ].map(b => ({ ...b, h: b.h * k, w: b.w * k, dx: b.dx * k }));
  P.ang(0);
  P.f('shadow', 0, c => { c.beginPath(); c.ellipse(lx + 132, ly + 4, 150, 11, 0, 0, TAU); });
  let y = ly; const top = [];
  for (const b of books) {
    const x = lx + b.dx;
    P.f(b.key, 0, c => { c.beginPath(); c.rect(x, y - b.h, b.w, b.h); }, [0, y - b.h, 0, y, .25, -.25]);
    P.f(b.key, -.55, c => { c.beginPath(); c.rect(x, y - 3, b.w, 3); });
    P.text(b.key + 'Ink', 0, b.title, x + 16, y - b.h / 2 + 3.8, 10.5 * k, { tracking: 1.3 });
    P.s('frameLine', -.9, .8, c => { c.beginPath(); c.rect(x, y - b.h, b.w, b.h); });
    top.push([x, y - b.h, b.w]); y -= b.h;
  }
  const t = top[top.length - 1];
  P.f('paperWhite', .2, c => poly(c, [[t[0], t[1]], [t[0] + t[2], t[1]], [t[0] + t[2] - 6, t[1] - 9], [t[0] + 8, t[1] - 9]]));
  P.books = { x: lx, y: ly - 120, w: 270, h: 130 };
}

/* ═════════════ ERA: San Diego, 2022–2024 (risograph) ═════════════ */
const ERA_SD = {
  key: 'sd',
  view(P) {
    // sky: a warm late-afternoon field
    P.f('skyBand', 0, c => { c.beginPath(); c.rect(-10, -10, 1020, 900); }, [0, 0, 0, 700, -.4, .6]);
    P.f('sun', 0, c => { c.beginPath(); c.arc(812, 238, 58, 0, TAU); });
    // distant mesa and the Pacific glimpse
    P.f('sea', 0, c => { c.beginPath(); c.rect(-10, 600, 1020, 60); });
    // Geisel Library: an inverted ziggurat of glass floors held up by flaring concrete piers
    const cx = 500, tiers = [[372, 150], [332, 196], [292, 236], [252, 266], [212, 284], [172, 280], [136, 252]];
    P.f('concrete', -.1, c => { c.beginPath(); c.rect(cx - 210, 720, 420, 46); });          // podium
    P.f('glass', -.2, c => { c.beginPath(); c.rect(cx - 196, 732, 392, 20); });
    P.f('concrete', .1, c => { c.beginPath(); c.rect(cx - 64, 520, 128, 200); });            // core
    P.f('glass', -.3, c => { c.beginPath(); for (let k = 0; k < 4; k++) c.rect(cx - 54, 534 + k * 46, 108, 26); });
    for (const sd of [-1, 1]) for (const k of [0, 1, 2]) {                                   // piers
      const x0 = cx + sd * (40 + k * 12), y0 = 700, x1 = cx + sd * (126 + k * 64), y1 = 404 - k * 30;
      P.f('concrete', sd > 0 ? -.45 : .25, c => poly(c, [[x0 - 11, y0], [x0 + 11, y0], [x1 + 13 * sd, y1], [x1 - 15 * sd, y1 - 4]]));
    }
    for (let i = 0; i < tiers.length; i++) {                                                 // floors
      const [y, hw] = tiers[i], h = 30;
      P.f('glass', i % 2 ? -.1 : .1, c => { c.beginPath(); c.rect(cx - hw, y, 2 * hw, h); });
      P.f('glassLine', 0, c => { c.beginPath(); for (let x = cx - hw + 10; x < cx + hw - 4; x += 16) c.rect(x, y + 3, 3, h - 6); });
      P.f('concrete', .35, c => { c.beginPath(); c.rect(cx - hw - 10, y + h, 2 * hw + 20, 10); });
      P.f('concrete', -.4, c => { c.beginPath(); c.rect(cx + hw - 6, y, 16, h + 10); });
    }
    P.f('concrete', .3, c => { c.beginPath(); c.rect(cx - 262, 122, 524, 14); });
    // eucalyptus: pale trunks, drooping leaf curtains
    for (const [tx, s, seed] of [[96, 1.05, 3], [858, .95, 5], [960, .8, 8], [-10, .8, 11]]) drawEucalyptus(P, tx, 900, s, seed);
    // lawn
    P.f('lawn', 0, c => { c.beginPath(); c.rect(-10, 760, 1020, 140); });
  },
  pins(P, LY) {
    drawPinPrint(P, LY, { photo: 'ucsd-library', fx: .03, fy: .05, fw: .5, rot: -2, pin: 'tape' });
    drawPinPrint(P, LY, { photo: 'research-group', fx: .38, fy: .42, fw: .58, rot: 1.8, pin: 'pin' });
    drawPinPrint(P, LY, { photo: 'uist-award', fx: .06, fy: .44, fw: .26, rot: -4, pin: 'pin' });
    drawPinPrint(P, LY, { paper: 'ebay-letter', fx: .62, fy: .02, fw: .33, rot: 3, pin: 'pin' });
  },
  objects(P, LY) {
    drawLaptop(P, LY, (P2, q) => drawPaperScreen(P2, q));
    // printed papers and an open zine on top
    const [lx, ly] = LY.left;
    P.ang(0);
    P.f('shadow', 0, c => { c.beginPath(); c.ellipse(lx + 130, ly + 3, 150, 10, 0, 0, TAU); });
    for (let i = 0; i < 6; i++) P.f('paperWhite', i % 2 ? -.15 : .1, c => poly(c, [[lx + 10 + i * 3, ly - i * 5], [lx + 250 - i * 2, ly - i * 5 - 1], [lx + 238 - i * 2, ly - i * 5 - 22], [lx + 22 + i * 3, ly - i * 5 - 21]]));
    const zx = lx + 40, zy = ly - 34;
    P.f('zine', 0, c => poly(c, [[zx, zy], [zx + 100, zy - 4], [zx + 96, zy - 34], [zx + 8, zy - 30]]));
    P.f('zine', -.3, c => poly(c, [[zx + 100, zy - 4], [zx + 196, zy + 2], [zx + 186, zy - 28], [zx + 96, zy - 34]]));
    P.s('zineInk', 0, 1.6, c => { c.beginPath(); c.moveTo(zx + 22, zy - 12); c.bezierCurveTo(zx + 40, zy - 30, zx + 60, zy - 2, zx + 80, zy - 22); c.moveTo(zx + 116, zy - 10); c.lineTo(zx + 170, zy - 12); c.moveTo(zx + 116, zy - 18); c.lineTo(zx + 160, zy - 20); });
    P.text('zineInk', 0, 'ZINE!', zx + 128, zy - 23, 9, {});
    // binder clip
    P.f('metalDark', 0, c => poly(c, [[lx + 200, ly - 30], [lx + 226, ly - 31], [lx + 222, ly - 18], [lx + 204, ly - 17]]));
    // paper coffee cup
    const [rx, ry] = LY.right;
    P.f('shadow', 0, c => { c.beginPath(); c.ellipse(rx + 6, ry + 3, 36, 7, 0, 0, TAU); });
    P.f('cup', 0, c => poly(c, [[rx - 26, ry], [rx + 26, ry], [rx + 33, ry - 92], [rx - 33, ry - 92]]), [rx - 30, 0, rx + 30, 0, .3, -.4]);
    P.f('cupSleeve', 0, c => poly(c, [[rx - 29, ry - 34], [rx + 29, ry - 34], [rx + 31, ry - 66], [rx - 31, ry - 66]]));
    P.f('cupLid', 0, c => { c.beginPath(); c.rect(rx - 36, ry - 104, 72, 13); });
    // sticky notes stuck to the wall beside the window
    for (const [nx, ny, rot] of [[LY.win.x - 70, LY.win.y + 300, -.08], [LY.win.x - 60, LY.win.y + 372, .06]]) {
      P.push(c => { c.translate(nx, ny); c.rotate(rot); });
      P.f('sticky', 0, c => { c.beginPath(); c.rect(-24, -24, 48, 48); });
      P.s('zineInk', 0, 1.2, c => { c.beginPath(); c.moveTo(-14, -8); c.lineTo(12, -8); c.moveTo(-14, 2); c.lineTo(8, 2); c.moveTo(-14, 12); c.lineTo(4, 12); });
      P.pop();
    }
  },
};

function drawEucalyptus(P, x, y, s, seed) {
  const r = mulberry32(seed);
  const top = [x + 20 * s, y - 640 * s];
  P.f('trunkPale', 0, c => { c.beginPath(); c.moveTo(x - 10 * s, y); c.bezierCurveTo(x - 4 * s, y - 300 * s, x + 30 * s, y - 420 * s, top[0] - 4 * s, top[1]); c.lineTo(top[0] + 6 * s, top[1]); c.bezierCurveTo(x + 40 * s, y - 420 * s, x + 8 * s, y - 300 * s, x + 12 * s, y); c.closePath(); });
  for (let i = 0; i < 22; i++) { // loose clusters of narrow hanging leaves
    const cx = top[0] + (r() - .5) * 280 * s, cy = top[1] + 30 * s + r() * 320 * s, key = r() < .35 ? 'eucalyptusLight' : 'eucalyptus';
    P.f(key, 0, c => { c.beginPath(); for (let k = 0; k < 26; k++) { const lx = cx + (r() - .5) * 90 * s, ly = cy + (r() - .5) * 50 * s, a = PI / 2 + (r() - .5) * .9; c.moveTo(lx, ly); c.ellipse(lx + Math.cos(a) * 9 * s, ly + Math.sin(a) * 9 * s, 2.6 * s, 11 * s, a - PI / 2, 0, TAU); } });
  }
}

function drawPaperScreen(P, q) {
  P.f('screenPaper', 0, c => poly(c, [quadPt(q, .08, .06), quadPt(q, .92, .06), quadPt(q, .92, .96), quadPt(q, .08, .96)]));
  for (let col = 0; col < 2; col++) for (let i = 0; i < 13; i++) {
    const u0 = .14 + col * .4, v = .82 - i * .055, len = (i === 0 ? .2 : .3) + (i % 4 === 3 ? -.12 : 0);
    if (col === 0 && i < 2) continue;
    P.s('screenText', 0, 2.2, c => { const a = quadPt(q, u0, v), b = quadPt(q, u0 + len, v); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); });
  }
  P.s('screenText', .5, 4, c => { const a = quadPt(q, .14, .86), b = quadPt(q, .62, .86); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); });
  P.f('screenFig', 0, c => poly(c, [quadPt(q, .14, .6), quadPt(q, .46, .6), quadPt(q, .46, .34), quadPt(q, .14, .34)]));
}

/* ═════════════ ERA: Bengaluru, 2019–2022 (engraving) ═════════════ */
const ERA_BLR = {
  key: 'blr',
  view(P) {
    P.ang(0);
    P.f('skyBand', 0, c => { c.beginPath(); c.rect(-10, -10, 1020, 900); }, [0, 0, 0, 640, .35, -.5]);
    // engraved cumulus
    for (const [cx, cy, s] of [[260, 170, 1.1], [690, 110, .8], [880, 250, .7]]) {
      const puffs = [[-60, 10, 42], [-14, -14, 56], [40, 0, 46], [86, 16, 32], [-100, 22, 26]];
      P.f('cloud', 0, c => { c.beginPath(); for (const [dx, dy, r2] of puffs) { c.moveTo(cx + dx * s + r2 * s, cy + dy * s); c.arc(cx + dx * s, cy + dy * s, r2 * s, 0, TAU); } c.rect(cx - 120 * s, cy + 10 * s, 230 * s, 34 * s); }, [0, cy - 60 * s, 0, cy + 44 * s, 1, -1.4]);
      P.s('cloudEdge', 0, .9, c => { c.beginPath(); for (const [dx, dy, r2] of puffs) c.arc(cx + dx * s, cy + dy * s, r2 * s, PI * 1.05, PI * 1.95); });
    }
    // the city: flat roofs, parapets and black water tanks
    const r = mulberry32(19);
    let x = -30;
    while (x < 1030) {
      const w = 90 + r() * 120, h = 160 + r() * 200, y = 900 - h - r() * 40;
      P.ang(90);
      P.f('building', r() * .5 - .25, c => { c.beginPath(); c.rect(x, y, w, 900 - y); });
      P.f('building', -.6, c => { c.beginPath(); c.rect(x + w - 10, y, 10, 900 - y); });
      P.ang(0);
      P.f('building', .4, c => { c.beginPath(); c.rect(x - 3, y - 8, w + 6, 10); });
      for (let wy = y + 24; wy < 880; wy += 44) for (let wx = x + 14; wx < x + w - 22; wx += 32) P.f('windowDark', 0, c => { c.beginPath(); c.rect(wx, wy, 14, 20); });
      if (r() < .7) { const tx = x + 16 + r() * (w - 60); P.f('tank', 0, c => { c.beginPath(); c.rect(tx, y - 42, 30, 34); c.ellipse(tx + 15, y - 42, 15, 5, 0, 0, TAU); }); P.f('tank', -.5, c => { c.beginPath(); c.rect(tx + 20, y - 42, 10, 34); }); }
      x += w + 6 + r() * 14;
    }
    // power lines
    P.s('ink', 0, 1.2, c => { c.beginPath(); for (const yy of [400, 418]) { c.moveTo(-10, yy); c.quadraticCurveTo(500, yy + 60, 1010, yy + 10); } });
    // a gulmohar (flame tree) in flower
    const g = mulberry32(23);
    P.ang(40);
    P.s('trunk', 0, 16, c => { c.beginPath(); c.moveTo(800, 900); c.bezierCurveTo(796, 760, 760, 700, 720, 620); c.moveTo(796, 760); c.bezierCurveTo(830, 700, 900, 660, 960, 640); });
    for (let i = 0; i < 26; i++) { const a = g() * PI, d = 60 + g() * 210, cx = 830 + Math.cos(a + PI) * d * 1.2, cy = 600 + Math.sin(a + PI) * d * .38; P.f('canopy', g() * .8 - .4, c => { c.beginPath(); c.ellipse(cx, cy, 44 + g() * 30, 20 + g() * 12, 0, 0, TAU); }); }
    for (let i = 0; i < 150; i++) { const a = g() * PI, d = 40 + g() * 230, cx = 830 + Math.cos(a + PI) * d * 1.2, cy = 590 + Math.sin(a + PI) * d * .38; P.f('flower', 0, c => { c.beginPath(); c.arc(cx, cy, 2.5 + g() * 4, 0, TAU); }); }
    // a coconut palm on the left
    drawPalm(P, 120, 900, 1.15, 31, 'palm');
  },
  pins(P, LY) {
    drawPinPrint(P, LY, { photo: 'ti-bengaluru', fx: .06, fy: .06, fw: .38, rot: -2.4, pin: 'tape' });
    drawPinPrint(P, LY, { paper: 'die-plot', fx: .52, fy: .14, fw: .42, rot: 2.2, pin: 'pin' });
    drawPinPrint(P, LY, { paper: 'schematic', fx: .1, fy: .54, fw: .32, rot: 1.2, pin: 'pin' });
  },
  objects(P, LY) {
    const [cx, cy] = LY.center;
    // monitor on its stand, showing a chip layout
    P.ang(0);
    P.f('shadow', 0, c => { c.beginPath(); c.ellipse(cx, cy - 22, 120, 10, 0, 0, TAU); });
    P.f('metalDark', 0, c => poly(c, [[cx - 80, cy - 26], [cx + 80, cy - 26], [cx + 62, cy - 42], [cx - 62, cy - 42]]));
    P.ang(90);
    P.f('metalDark', -.2, c => { c.beginPath(); c.rect(cx - 16, cy - 120, 32, 82); });
    const sx = cx - 214, sy = 600, sw = 428, sh = 256;
    P.ang(0);
    P.f('bezel', 0, c => { c.beginPath(); c.rect(sx, sy, sw, sh); });
    const scr = [[sx + 12, sy + sh - 12], [sx + sw - 12, sy + sh - 12], [sx + sw - 12, sy + 12], [sx + 12, sy + 12]];
    P.f('screen', 0, c => poly(c, scr));
    drawLayoutScreen(P, scr);
    P.s('frameLine', -.9, 1, c => { c.beginPath(); c.rect(sx, sy, sw, sh); });
    // keyboard
    P.ang('vp');
    P.f('keys', -.2, c => poly(c, [[cx - 190, cy + 18], [cx + 190, cy + 18], [cx + 176, cy - 18], [cx - 176, cy - 18]]));
    P.ang(0);
    for (let row = 0; row < 4; row++) for (let k = 0; k < 16; k++) { const y0 = cy - 14 + row * 8, x0 = cx - 170 + k * 21.5 + row * 1.5; P.f('keys', .3, c => { c.beginPath(); c.rect(x0, y0, 17, 5.5); }); }
    // datasheets and a cup of pens on the left
    const [lx, ly] = LY.left;
    P.f('shadow', 0, c => { c.beginPath(); c.ellipse(lx + 120, ly + 3, 140, 10, 0, 0, TAU); });
    for (let i = 0; i < 8; i++) P.f('paperWhite', i % 2 ? -.2 : .15, c => poly(c, [[lx + 6 + i * 2, ly - i * 4], [lx + 226 - i, ly - i * 4], [lx + 216 - i, ly - i * 4 - 18], [lx + 16 + i * 2, ly - i * 4 - 18]]));
    P.f('paperWhite', .3, c => poly(c, [[lx + 22, ly - 32], [lx + 220, ly - 32], [lx + 210, ly - 50], [lx + 30, ly - 50]]));
    P.text('ink', 0, 'DATASHEET', lx + 46, ly - 37, 8, { tracking: 1.5 });
    P.ang(90);
    P.f('cup', 0, c => { c.beginPath(); c.rect(lx + 250, ly - 74, 46, 74); });
    for (const [a, l] of [[-.2, 70], [.05, 84], [.25, 64]]) P.s('ink', 0, 3, c => { c.beginPath(); c.moveTo(lx + 273, ly - 70); c.lineTo(lx + 273 + Math.sin(a) * l, ly - 70 - Math.cos(a) * l); });
    // evaluation board with the packaged chip and a loupe
    const [rx, ry] = LY.right;
    P.ang('vp');
    P.f('pcb', 0, c => poly(c, [[rx - 70, ry + 4], [rx + 86, ry + 4], [rx + 76, ry - 36], [rx - 62, ry - 36]]));
    P.f('chip', 0, c => poly(c, [[rx - 4, ry - 6], [rx + 30, ry - 6], [rx + 28, ry - 24], [rx - 2, ry - 24]]));
    P.ang(0);
    for (let k = 0; k < 6; k++) P.s('ink', .3, 1, c => { c.beginPath(); c.moveTo(rx - 50 + k * 8, ry - 2); c.lineTo(rx - 40 + k * 8, ry - 30); });
    P.s('metalDark', 0, 3.5, c => { c.beginPath(); c.moveTo(rx + 70, ry - 6); c.lineTo(rx + 64, ry - 96); c.lineTo(rx + 40, ry - 100); });
    P.f('glass', .5, c => { c.beginPath(); c.ellipse(rx + 12, ry - 92, 30, 20, -.15, 0, TAU); });
    P.s('ink', -.2, 1.4, c => { c.save(); c.beginPath(); c.ellipse(rx + 12, ry - 92, 28, 18, -.15, 0, TAU); c.clip(); c.beginPath(); for (let k = -3; k <= 3; k++) { c.moveTo(rx - 20, ry - 92 + k * 6); c.lineTo(rx + 44, ry - 92 + k * 6 - 4); } c.moveTo(rx + 4, ry - 112); c.lineTo(rx + 2, ry - 72); c.restore(); }); // the chip, magnified
    P.s('metalDark', 0, 4, c => { c.beginPath(); c.ellipse(rx + 12, ry - 92, 30, 20, -.15, 0, TAU); });
  },
};

function drawLayoutScreen(P, q) { // a chip layout, the way layout tools show it: each layer its own hatch
  const r = mulberry32(71), x0 = q[3][0], y0 = q[3][1], w = q[1][0] - q[3][0], h = q[1][1] - q[3][1];
  P.ang(0); P.f('layoutBg', 0, c => { c.beginPath(); c.rect(x0, y0, w, h); });
  const die = [x0 + 22, y0 + 18, w - 44, h - 36];
  P.ang(45); P.f('layoutMacro', 0, c => { c.beginPath(); c.rect(die[0] + 10, die[1] + 10, die[2] * .32, die[3] * .45); c.rect(die[0] + die[2] * .62, die[1] + die[3] * .5, die[2] * .34, die[3] * .44); });
  P.ang(0); P.f('layoutRow', 0, c => { c.beginPath(); for (let y = die[1] + die[3] * .55; y < die[1] + die[3] - 6; y += 12) c.rect(die[0] + 10, y, die[2] * .55, 7); for (let y = die[1] + 12; y < die[1] + die[3] * .46; y += 12) c.rect(die[0] + die[2] * .38, y, die[2] * .58, 7); });
  P.ang(90); P.f('layoutStrap', 0, c => { c.beginPath(); for (let x = die[0] + die[2] * .2; x < die[0] + die[2]; x += die[2] * .2) c.rect(x, die[1], 6, die[3]); });
  P.s('layoutLine', 0, 1.4, c => { c.beginPath(); c.rect(...die); });
  // a spiral inductor in one corner
  P.s('layoutLine', 0, 1.6, c => { c.beginPath(); const sx = die[0] + die[2] * .16, sy = die[1] + die[3] * .78; for (let k = 0; k < 4; k++) { const d = 28 - k * 6; c.rect(sx - d, sy - d * .8, 2 * d, 1.6 * d); } });
}

/* ═════════════ ERA: Surathkal, 2015–2019 (cyanotype) ═════════════ */
const ERA_NITK = {
  key: 'nitk',
  view(P) {
    P.ang(0);
    P.f('skyBand', 0, c => { c.beginPath(); c.rect(-10, -10, 1020, 900); }, [0, 0, 0, 560, .2, -.6]);
    // monsoon clouds
    for (const [cx, cy, s] of [[200, 140, 1.3], [640, 90, 1], [930, 190, .9]]) P.f('cloud', 0, c => { c.beginPath(); for (const [dx, dy, r2] of [[-70, 10, 50], [-10, -20, 66], [56, 4, 52], [110, 22, 34]]) { c.moveTo(cx + dx * s + r2 * s, cy + dy * s); c.arc(cx + dx * s, cy + dy * s, r2 * s, 0, TAU); } c.rect(cx - 120 * s, cy + 14 * s, 260 * s, 30 * s); }, [0, cy - 70 * s, 0, cy + 46 * s, .4, -.6]);
    P.f('sun', 0, c => { c.beginPath(); c.arc(420, 290, 34, 0, TAU); });
    // the sea
    P.f('sea', 0, c => { c.beginPath(); c.rect(-10, 520, 1020, 380); }, [0, 520, 0, 900, -.1, .4]);
    P.s('seaLine', 0, 1.6, c => { c.beginPath(); for (let i = 0; i < 9; i++) { const y = 540 + i * i * 6; c.moveTo(-10, y); for (let x = 0; x <= 1010; x += 40) c.lineTo(x, y + Math.sin(x * .03 + i) * 2); } });
    // the lighthouse on its rocky knoll
    P.f('rock', 0, c => { c.beginPath(); c.moveTo(560, 640); c.bezierCurveTo(600, 520, 760, 500, 840, 640); c.closePath(); });
    const lx = 700, ly = 535;
    P.f('lighthouse', 0, c => poly(c, [[lx - 22, ly], [lx + 22, ly], [lx + 14, ly - 190], [lx - 14, ly - 190]]));
    P.f('lighthouse', -.6, c => poly(c, [[lx + 6, ly], [lx + 22, ly], [lx + 14, ly - 190], [lx + 4, ly - 190]]));
    P.f('lighthouseBand', 0, c => { c.beginPath(); for (const t of [.25, .58]) { const y = ly - 190 * t, a = 22 - 8 * t, b = 22 - 8 * (t + .1); c.moveTo(lx - a, y); c.lineTo(lx + a, y); c.lineTo(lx + b, y - 19); c.lineTo(lx - b, y - 19); c.closePath(); } });
    P.f('lantern', 0, c => { c.beginPath(); c.rect(lx - 13, ly - 218, 26, 28); c.moveTo(lx - 16, ly - 218); c.lineTo(lx, ly - 238); c.lineTo(lx + 16, ly - 218); });
    // beach and palms
    P.f('sand', 0, c => { c.beginPath(); c.moveTo(-10, 760); c.bezierCurveTo(300, 720, 700, 740, 1010, 700); c.lineTo(1010, 900); c.lineTo(-10, 900); });
    drawPalm(P, 120, 900, 1.25, 41, 'palm');
    drawPalm(P, 330, 920, 1.0, 43, 'palm');
    drawPalm(P, 930, 910, 1.1, 47, 'palm');
  },
  pins(P, LY) {
    drawPinPrint(P, LY, { photo: 'nitk-lab', fx: .05, fy: .07, fw: .52, rot: -2.2, pin: 'tape' });
    drawPinPrint(P, LY, { paper: 'certificate', fx: .56, fy: .38, fw: .4, rot: 2.6, pin: 'pin' });
    drawPinPrint(P, LY, { paper: 'star-chart', fx: .1, fy: .54, fw: .32, rot: -1.5, pin: 'pin' });
  },
  objects(P, LY) {
    const [cx, cy] = LY.center;
    // bench oscilloscope
    const w = 340, h = 210, x = cx - w / 2 + 10, y = cy - h - 10, d = 26;
    P.ang(0);
    P.f('shadow', 0, c => { c.beginPath(); c.ellipse(cx + 16, cy - 6, 200, 12, 0, 0, TAU); });
    P.f('scopeCase', .35, c => poly(c, [[x, y], [x + w, y], [x + w + d, y - d * .8], [x + d, y - d * .8]]));
    P.f('scopeCase', -.5, c => poly(c, [[x + w, y], [x + w + d, y - d * .8], [x + w + d, y + h - d * .8], [x + w, y + h]]));
    P.f('scopeCase', 0, c => { c.beginPath(); c.rect(x, y, w, h); });
    const sx = x + 18, sy = y + 22, sw = 200, sh = 150;
    P.f('screen', 0, c => { c.beginPath(); c.rect(sx, sy, sw, sh); });
    P.s('scopeGrid', 0, .8, c => { c.beginPath(); for (let i = 1; i < 10; i++) { c.moveTo(sx + sw * i / 10, sy); c.lineTo(sx + sw * i / 10, sy + sh); } for (let i = 1; i < 8; i++) { c.moveTo(sx, sy + sh * i / 8); c.lineTo(sx + sw, sy + sh * i / 8); } });
    P.scopeScreen = [sx, sy, sw, sh];
    if (P.staticTrace) P.s('trace', 0, 2.4, c => squareWave(c, sx, sy, sw, sh, 0));
    // knobs and the asset label
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { const kx = x + 248 + i * 26, ky = y + 34 + j * 40; P.f('knob', 0, c => { c.beginPath(); c.arc(kx, ky, 8 + (i === 1 ? 2 : 0), 0, TAU); }); P.s('frameLine', -.9, .8, c => { c.beginPath(); c.moveTo(kx, ky); c.lineTo(kx + 5, ky - 6); }); }
    P.text('scopeLabel', 0, 'NITK / EEE', sx, y + h - 12, 10, { tracking: 1.4 });
    P.s('frameLine', -.9, 1.2, c => { c.beginPath(); c.rect(x, y, w, h); });
    // breadboard with chips and jumper wires
    const [lx, ly] = LY.left;
    P.ang('vp');
    P.f('shadow', 0, c => { c.beginPath(); c.ellipse(lx + 120, ly + 3, 130, 9, 0, 0, TAU); });
    P.f('breadboard', 0, c => poly(c, [[lx + 10, ly], [lx + 236, ly], [lx + 224, ly - 52], [lx + 22, ly - 52]]));
    P.ang(0);
    P.f('breadboard', -.4, c => { c.beginPath(); for (let i = 0; i < 26; i++) for (let j = 0; j < 5; j++) c.rect(lx + 30 + i * 7.2 - j * .4, ly - 44 + j * 8, 2.2, 2.2); });
    for (const [px, pw] of [[60, 34], [120, 46]]) P.f('chipDip', 0, c => { c.beginPath(); c.rect(lx + px, ly - 30, pw, 12); });
    P.s('wire', 0, 2.2, c => { c.beginPath(); c.moveTo(lx + 44, ly - 40); c.bezierCurveTo(lx + 60, ly - 80, lx + 100, ly - 76, lx + 112, ly - 36); c.moveTo(lx + 170, ly - 22); c.bezierCurveTo(lx + 190, ly - 60, lx + 220, ly - 50, lx + 212, ly - 12); });
    // planisphere for the astronomy club
    const [rx, ry] = LY.right;
    P.f('shadow', 0, c => { c.beginPath(); c.ellipse(rx + 10, ry + 2, 70, 9, 0, 0, TAU); });
    P.f('paperWhite', 0, c => poly(c, [[rx - 60, ry], [rx + 76, ry], [rx + 60, ry - 34], [rx - 46, ry - 34]]));
    P.f('planisphere', 0, c => { c.beginPath(); c.ellipse(rx + 8, ry - 17, 54, 14, 0, 0, TAU); });
    P.f('paperWhite', .4, c => { c.beginPath(); c.ellipse(rx + 4, ry - 18, 30, 7, 0, 0, TAU); });
    drawTelescope(P, LY, 1.04 * (LY.os || 1));
  },
};
function squareWave(c, sx, sy, sw, sh, phase) {
  c.beginPath(); const per = sw / 3.2, hi = sy + sh * .3, lo = sy + sh * .68;
  let first = true;
  for (let x = 0; x <= sw; x += 1) {
    const p = fract((x + phase * per) / per), y = p < .5 ? hi : lo, X = sx + x;
    const prev = fract((x - 1 + phase * per) / per) < .5 ? hi : lo;
    if (first) { c.moveTo(X, y); first = false; } else { if (prev !== y) c.lineTo(X, prev); c.lineTo(X, y); }
  }
}

const ERAS = { now: ERA_NOW, sd: ERA_SD, blr: ERA_BLR, nitk: ERA_NITK };
const ERA_ORDER = ['now', 'sd', 'blr', 'nitk'];
