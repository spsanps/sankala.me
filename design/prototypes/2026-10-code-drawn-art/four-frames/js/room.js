'use strict';
/* Four frames — the room. The parts that never change: wall, window frame, shelf, pinboard,
   desk, lamp, floor. Drawn once per layout into the room layer, with the window opening left
   transparent so the view outside can pan behind the glazing bars. */

function openingOf(L) { const w = L.win; return { x: w.x + w.f, y: w.y + w.f, w: w.w - 2 * w.f, h: w.h - 2 * w.f }; }

function drawRoom(P, L) {
  const o = openingOf(L), w = L.win, d = L.desk, c = P.c;
  const X0 = L.xMin - 4, X1 = L.xMax + 4, Y0 = L.yMin - 4, Y1 = L.yMax + 4;

  /* wall: one flat colour, a broad soft wash darker toward the ceiling and the far corner,
     with the window opening cut out */
  P.fill(PAL.wall, cc => { cc.rect(X0, Y0, X1 - X0, L.base.y - Y0); cc.rect(o.x + o.w, o.y, -o.w, o.h); }, 'evenodd');
  P.within(cc => { cc.rect(X0, Y0, X1 - X0, L.base.y - Y0); cc.rect(o.x + o.w, o.y, -o.w, o.h); }, p => {
    p.c.globalAlpha = 1;
    p.fill(p.grad(0, Y0, 0, Y0 + 520, [[0, 'rgba(120,128,104,.16)'], [1, 'rgba(120,128,104,0)']]), R(X0, Y0, X1 - X0, 520));
    // daylight from the window spreads across the wall around it; the far corner falls off
    const cx = w.x + w.w / 2, cy = w.y + w.h * .55;
    p.fill(p.rgrad(cx, cy, 60, 900, [[0, 'rgba(255,252,236,.34)'], [.55, 'rgba(255,252,236,.1)'], [1, 'rgba(255,252,236,0)']]), R(X0, Y0, X1 - X0, Y1 - Y0));
    p.fill(p.grad(X0, 0, X0 + 600, 0, [[0, 'rgba(110,118,96,.12)'], [1, 'rgba(110,118,96,0)']]), R(X0, Y0, 600, Y1 - Y0));
    // the wall under the desk sits in shadow
    p.fill(PAL.wallShade, R(d.leftBack - 2, d.backY, X1 - d.leftBack + 4, L.base.y - d.backY));
    p.fill(p.grad(0, d.frontY + d.faceH, 0, L.base.y, [[0, 'rgba(70,74,58,.22)'], [1, 'rgba(70,74,58,.05)']]), R(d.leftBack - 2, d.frontY, X1 - d.leftBack + 4, L.base.y - d.frontY));
  });

  /* baseboard and floor */
  P.fill(PAL.base, R(X0, L.base.y, X1 - X0, L.base.h));
  P.fill(PAL.baseShade, R(X0, L.base.y + L.base.h - 5, X1 - X0, 5));
  P.ink(LN([[X0, L.base.y], [X1, L.base.y]]), LW_IN);
  const fy = L.base.y + L.base.h;
  P.fill(PAL.floor, R(X0, fy, X1 - X0, Y1 - fy));
  P.within(R(X0, fy, X1 - X0, Y1 - fy), p => {
    p.fill(p.grad(0, fy, 0, fy + 60, [[0, 'rgba(60,30,10,.28)'], [1, 'rgba(60,30,10,0)']]), R(X0, fy, X1 - X0, 60));
    for (let x = X0 - 40, k = 0; x < X1; x += 118, k++) p.ink(LN([[x, fy], [x - 70, Y1]]), LW_FINE, 'rgba(60,34,16,.55)');
  });
  P.ink(LN([[X0, fy], [X1, fy]]), LW);

  /* window: enamel frame with a reveal, sill, glazing bars, latch */
  P.alpha(.18, p => p.fill('#4b5240', R(w.x + 7, w.y + 8, w.w, w.h)));             // frame's shadow on the wall
  P.shape(cc => { cc.rect(w.x, w.y, w.w, w.h); cc.rect(o.x + o.w, o.y, -o.w, o.h); }, PAL.frame, LW, 'evenodd');
  // reveal: the top and left inner faces in shade
  P.fill(PAL.frameShade, PL([[o.x, o.y], [o.x + o.w, o.y], [o.x + o.w - 7, o.y + 8], [o.x + 7, o.y + 8]]));
  P.fill(PAL.frameShade, PL([[o.x, o.y], [o.x + 7, o.y + 8], [o.x + 7, o.y + o.h], [o.x, o.y + o.h]]));
  P.ink(cc => cc.rect(o.x, o.y, o.w, o.h), LW);
  const s = L.sill;
  P.shape(PL([[w.x - s.over, s.y], [w.x + w.w + s.over, s.y], [w.x + w.w + s.over + 5, s.y + 8], [w.x - s.over - 5, s.y + 8]]), '#fbfaf4', LW_IN);
  P.shape(R(w.x - s.over - 5, s.y + 8, w.w + 2 * s.over + 10, s.h - 8), PAL.frameShade, LW_IN);
  P.alpha(.22, p => p.fill('#4b5240', R(w.x - s.over, s.y + s.h, w.w + 2 * s.over + 4, 9)));
  // glazing bars
  const tY = o.y + o.h * w.transom, mX = o.x + o.w / 2, bar = w.bar;
  P.shape(R(o.x, tY - bar / 2, o.w, bar), PAL.frame, LW_IN);
  P.shape(R(mX - bar / 2, o.y, bar, o.h), PAL.frame, LW_IN);
  P.fill(PAL.frameShade, R(o.x + 1, tY + bar / 2 - 3, o.w - 2, 3));
  P.fill(PAL.frameShade, R(mX + bar / 2 - 3, tY + bar / 2, 3, o.h - (tY - o.y) - bar / 2));
  // latch
  P.shape(RR(mX - 4, tY + 34, 8, 30, 3), '#c99a3e', LW_IN);
  // glass glints, a clear-line convention: two short diagonal strokes per lower pane
  P.alpha(.55, p => {
    for (const [px0, py0] of [[o.x + 26, tY + 40], [mX + 24, tY + 40]]) {
      p.ink(LN([[px0, py0 + 46], [px0 + 40, py0]]), 2.2, 'rgba(255,255,255,.9)');
      p.ink(LN([[px0 + 12, py0 + 70], [px0 + 66, py0 + 10]]), 1.2, 'rgba(255,255,255,.75)');
    }
  });

  /* shelf with two brackets */
  const sh = L.shelf;
  for (const bx of [sh.x + 26, sh.x + sh.w - 34]) P.shape(PL([[bx, sh.y + 12], [bx + 8, sh.y + 12], [bx + 8, sh.y + 52], [bx, sh.y + 52]]), PAL.oakShade, LW_IN);
  P.alpha(.2, p => p.fill('#4b5240', R(sh.x + 6, sh.y + 12, sh.w, 10)));
  P.shape(R(sh.x, sh.y, sh.w, 12), PAL.oak, LW);
  P.fill(PAL.oakTop, R(sh.x + 1, sh.y + 1, sh.w - 2, 3));

  /* pinboard: wood frame, cork with sparse flecks */
  const pb = L.pin, f = 11;
  P.alpha(.2, p => p.fill('#4b5240', R(pb.x + 7, pb.y + 9, pb.w, pb.h)));
  P.shape(R(pb.x, pb.y, pb.w, pb.h), PAL.pinframe, LW);
  P.shape(R(pb.x + f, pb.y + f, pb.w - 2 * f, pb.h - 2 * f), PAL.cork, LW_IN);
  P.within(R(pb.x + f, pb.y + f, pb.w - 2 * f, pb.h - 2 * f), p => {
    p.fill(PAL.corkShade, R(pb.x + f, pb.y + f, pb.w - 2 * f, 7));
    p.fill(PAL.corkShade, R(pb.x + f, pb.y + f, 6, pb.h - 2 * f));
    const rnd = mulberry32(31);
    p.c.fillStyle = 'rgba(122,84,44,.45)';
    for (let i = 0; i < 70; i++) { p.c.beginPath(); p.c.arc(pb.x + f + rnd() * (pb.w - 2 * f), pb.y + f + rnd() * (pb.h - 2 * f), .9 + rnd() * 1.3, 0, TAU); p.c.fill(); }
  });
  P.fill(PAL.pinframeShade, R(pb.x + 1, pb.y + pb.h - 5, pb.w - 2, 4));

  /* desk */
  drawDesk(P, L);
  /* the lamp's cord, looping off the back of the desk */
  const [lbx, lby] = L.lamp.base;
  P.ink(CURVE([[lbx + 30, lby - 2], [lbx + 70, lby - 14], [lbx + 40, L.desk.backY + 4], [lbx + 6, L.desk.backY + 2], [lbx - 30, L.desk.backY + 10]]), 3.2);
  P.ink(CURVE([[lbx + 30, lby - 2], [lbx + 70, lby - 14], [lbx + 40, L.desk.backY + 4], [lbx + 6, L.desk.backY + 2], [lbx - 30, L.desk.backY + 10]]), 1.3, '#4a4440');
  /* the lamp: the one thing that travels through every frame */
  drawLamp(P, L);
}

function drawDesk(P, L) {
  const d = L.desk, X1 = L.xMax + 6;
  const top = [[d.leftBack, d.backY], [X1, d.backY], [X1, d.frontY], [d.leftFront, d.frontY]];
  // legs (behind the face): the left leg, a stretcher
  const legX = d.leftFront + 14;
  P.shape(R(legX, d.frontY + d.faceH - 2, d.legW, L.base.y + L.base.h - d.frontY - d.faceH + 10), PAL.oakShade, LW);
  P.fill(PAL.oakDeep, R(legX + d.legW - 7, d.frontY + d.faceH, 7, L.base.y + L.base.h - d.frontY - d.faceH + 8));
  const backLegX = d.leftBack + 6;
  P.shape(R(backLegX, d.backY + 20, d.legW * .8, L.base.y - d.backY - 10), PAL.oakDeep, LW_IN);
  // top surface
  P.shape(PL(top), PAL.oakTop, LW);
  P.within(PL(top), p => {
    // broad wash: lighter toward the front edge where the window light lands
    p.fill(p.grad(0, d.backY, 0, d.frontY, [[0, 'rgba(150,96,46,.32)'], [.35, 'rgba(150,96,46,.08)'], [1, 'rgba(255,240,210,.12)']]), PL(top));
    // grain: a few long flowing lines, clear-line style
    const rnd = mulberry32(5);
    for (let i = 0; i < 7; i++) {
      const y = d.backY + (d.frontY - d.backY) * (.12 + i * .13) + (rnd() - .5) * 6;
      const pts = []; for (let x = d.leftFront - 20; x <= X1 + 20; x += 60) pts.push([x, y + Math.sin(x * .012 + i * 1.7) * 3 + (rnd() - .5) * 2]);
      p.ink(CURVE(pts), LW_FINE, 'rgba(120,72,34,.42)');
    }
  });
  // front face and left end
  P.shape(PL([[d.leftFront, d.frontY], [X1, d.frontY], [X1, d.frontY + d.faceH], [d.leftFront, d.frontY + d.faceH]]), PAL.oak, LW);
  P.fill(PAL.oakShade, R(d.leftFront + 1, d.frontY + d.faceH - 7, X1 - d.leftFront, 6));
  P.shape(PL([[d.leftBack, d.backY], [d.leftFront, d.frontY], [d.leftFront, d.frontY + d.faceH], [d.leftBack, d.backY + d.faceH * .7]]), PAL.oakShade, LW);
  // a drawer in the face
  const dx = d.leftFront + 120, dw = 230;
  P.ink(RR(dx, d.frontY + 6, dw, d.faceH - 12, 2), LW_IN);
  P.shape(RR(dx + dw / 2 - 16, d.frontY + d.faceH / 2 - 3, 32, 6, 3), '#7a5232', LW_IN);
}

function drawLamp(P, L) {
  const lp = L.lamp, [bx, by] = lp.base, [ex, ey] = lp.elbow, [hx, hy] = lp.head, [ax, ay] = lp.aim;
  // base
  P.alpha(.25, p => p.fill('#2a1a10', EL(bx + 6, by + 8, 52, 12)));
  P.shape(PL([[bx - 46, by + 4], [bx + 46, by + 4], [bx + 40, by - 8], [bx - 40, by - 8]]), PAL.lamp, LW);
  P.shape(EL(bx, by - 8, 40, 8), '#d4664c', LW);
  P.shape(RR(bx - 9, by - 30, 18, 24, 4), PAL.lampShade, LW_IN);
  // arms: twin rods with springs
  const arm = (x0, y0, x1, y1) => {
    const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny), ox = nx / l * 4, oy = ny / l * 4;
    P.ink(LN([[x0 - ox, y0 - oy], [x1 - ox, y1 - oy]]), 5.2, INK);
    P.ink(LN([[x0 - ox, y0 - oy], [x1 - ox, y1 - oy]]), 2.6, PAL.lamp);
    P.ink(LN([[x0 + ox, y0 + oy], [x1 + ox, y1 + oy]]), 3.6, INK);
    P.ink(LN([[x0 + ox, y0 + oy], [x1 + ox, y1 + oy]]), 1.4, PAL.lampShade);
  };
  arm(bx, by - 26, ex, ey);
  arm(ex, ey, hx, hy);
  // springs: little coils along the lower arm
  const spring = (x0, y0, x1, y1, n) => {
    const pts = []; for (let i = 0; i <= n * 6; i++) { const t = i / (n * 6), a = t * n * TAU; const px = lerp(x0, x1, t), py = lerp(y0, y1, t); const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny); pts.push([px + nx / l * Math.sin(a) * 4, py + ny / l * Math.sin(a) * 4]); }
    P.ink(LN(pts), .9);
  };
  spring(lerp(bx, ex, .2) + 9, lerp(by - 26, ey, .2), lerp(bx, ex, .48) + 9, lerp(by - 26, ey, .48), 6);
  spring(lerp(ex, hx, .25), lerp(ey, hy, .25) + 9, lerp(ex, hx, .55), lerp(ey, hy, .55) + 9, 5);
  P.shape(EL(ex, ey, 8, 8), PAL.lampShade, LW_IN);
  // head: a cone aimed at the desk
  const ang = Math.atan2(ay - hy, ax - hx);
  P.at(hx, hy, ang, 1, p => {
    p.shape(PL([[-6, -14], [16, -16], [64, -40], [72, 38], [16, 16], [-6, 14]]), PAL.lamp, LW);
    p.fill(PAL.lampShade, PL([[16, 6], [70, 24], [72, 38], [16, 16]]));
    p.ink(LN([[16, -16], [16, 16]]), LW_IN);
    p.shape(EL(69, -1, 7, 39), '#f6e9c8', LW);           // the open mouth, lit
    p.shape(EL(-4, 0, 9, 9), PAL.lampShade, LW_IN);
  });
}
