'use strict';
/* Four frames — the things on the desk, the shelf and the pinboard, era by era. Each object is
   baked as its own sprite so it can be moved by hand when the place changes: slid off the desk,
   lifted off the board, a lid closed. Positions come from the layout's slots. */

/* contact shadow under anything standing on the desk */
function contact(P, x, y, w, a = .28) { P.alpha(a, p => p.fill('#3a2312', EL(x, y, w / 2, Math.max(4, w * .07)))); }

/* ───────── San Jose ───────── */
function drawLaptopBase(P, x, y, s = 1, col = '#c9ccce') {
  const w = 240 * s, d = 52 * s, t = 9 * s;
  contact(P, x + 6, y + 4, w * 1.08, .3);
  const top = [[x - w / 2 + 14 * s, y - d], [x + w / 2 - 14 * s, y - d], [x + w / 2, y], [x - w / 2, y]];
  P.shape(PL([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + t], [x - w / 2, y + t]]), '#9da2a6', LW);
  P.shape(PL(top), col, LW);
  // keyboard: rows of keys in perspective
  P.within(PL(top), p => {
    for (let r = 0; r < 4; r++) {
      const v0 = .14 + r * .16, v1 = v0 + .12;
      const yA = lerp(y - d, y, v0), yB = lerp(y - d, y, v1);
      const xa0 = lerp(x - w / 2 + 14 * s, x - w / 2, v0) + 26 * s, xa1 = lerp(x + w / 2 - 14 * s, x + w / 2, v0) - 26 * s;
      const xb0 = lerp(x - w / 2 + 14 * s, x - w / 2, v1) + 26 * s, xb1 = lerp(x + w / 2 - 14 * s, x + w / 2, v1) - 26 * s;
      const n = 12;
      for (let k = 0; k < n; k++) {
        const t0 = k / n + .006, t1 = (k + 1) / n - .006;
        p.fill('#43484d', PL([[lerp(xa0, xa1, t0), yA], [lerp(xa0, xa1, t1), yA], [lerp(xb0, xb1, t1), yB], [lerp(xb0, xb1, t0), yB]]));
      }
    }
    // trackpad
    p.fill('#b5b9bc', PL([[x - 34 * s, y - d * .12], [x + 34 * s, y - d * .12], [x + 36 * s, y - 2 * s], [x - 36 * s, y - 2 * s]]));
  });
}
function drawLaptopLid(P, x, y, s = 1, col = '#c9ccce') {
  // the back of the lid, closed over the keyboard
  const w = 240 * s, d = 52 * s;
  P.shape(PL([[x - w / 2 + 12 * s, y - d - 2 * s], [x + w / 2 - 12 * s, y - d - 2 * s], [x + w / 2 + 2 * s, y - 4 * s], [x - w / 2 - 2 * s, y - 4 * s]]), col, LW);
  P.fill('#e3e5e6', PL([[x - w / 2 + 30 * s, y - d + 6 * s], [x - 10 * s, y - d + 6 * s], [x - 34 * s, y - 10 * s], [x - w / 2 + 14 * s, y - 10 * s]]));
}
function laptopScreenRect(x, y, s = 1) { const w = 214 * s, h = 146 * s; return { x: x - w / 2, y: y - 52 * s - h - 4 * s, w, h }; }
function drawLaptopScreen(P, x, y, s = 1, col = '#c9ccce', content = 'code') {
  const r = laptopScreenRect(x, y, s), b = 9 * s;
  P.shape(RR(r.x - b, r.y - b, r.w + 2 * b, r.h + 2 * b, 7 * s), col, LW);
  P.shape(R(r.x, r.y, r.w, r.h), '#273240', LW_IN);
  P.within(R(r.x, r.y, r.w, r.h), p => {
    if (content === 'code') {
      // a few static lines; the live overlay writes more
      const cols = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3'];
      for (let i = 0; i < 6; i++) { const ly = r.y + 16 * s + i * 13 * s; p.fill(cols[i % 4], R(r.x + 14 * s + (i % 3 === 2 ? 16 * s : 0), ly, (50 + (i * 37 % 70)) * s, 4 * s)); }
    } else if (content === 'paper') {
      p.fill('#f4f2ea', R(r.x + 18 * s, r.y + 10 * s, r.w - 36 * s, r.h - 10 * s));
      for (let i = 0; i < 9; i++) p.fill('#9aa1a8', R(r.x + 30 * s, r.y + 22 * s + i * 12 * s, (r.w - 70 * s) * (i % 4 === 3 ? .6 : 1), 3.4 * s));
      p.fill('#e9a3b8', R(r.x + 30 * s, r.y + 22 * s + 4 * 12 * s - 3 * s, 70 * s, 9 * s));
    }
    p.alpha(.18, q => q.fill('#ffffff', PL([[r.x + r.w * .55, r.y], [r.x + r.w * .78, r.y], [r.x + r.w * .4, r.y + r.h], [r.x + r.w * .17, r.y + r.h]])));
  });
  P.fill('#9da2a6', R(r.x - b + 6 * s, r.y + r.h + b - 1, r.w + 2 * b - 12 * s, 5 * s));
}
// the Paper Robots figurine: cobalt folded-paper head, white folded corner, round eyes, vermilion ear
function robotMeta(x, y, s = 1) {
  const hw = 54 * s, hh = 48 * s, hx = x - hw / 2, hy = y - 108 * s;
  return { hx, hy, hw, hh, eyes: [[hx + hw * .3, hy + hh * .5, 9 * s], [hx + hw * .64, hy + hh * .5, 9 * s]] };
}
function drawRobot(P, x, y, s = 1) {
  const m = robotMeta(x, y, s), { hx, hy, hw, hh } = m, dk = 10 * s;
  contact(P, x + 4, y + 2, 64 * s, .3);
  // legs and body
  P.shape(R(x - 17 * s, y - 26 * s, 13 * s, 26 * s), PAL.cobalt, LW_IN);
  P.shape(R(x + 4 * s, y - 26 * s, 13 * s, 26 * s), PAL.cobaltShade, LW_IN);
  P.shape(R(x - 24 * s, y - 60 * s, 48 * s, 36 * s), PAL.cobalt, LW);
  P.fill(PAL.cobaltShade, R(x + 10 * s, y - 59 * s, 13 * s, 34 * s));
  P.shape(R(x - 34 * s, y - 56 * s, 11 * s, 26 * s), PAL.cobaltShade, LW_IN);
  P.shape(R(x + 23 * s, y - 56 * s, 11 * s, 26 * s), PAL.cobaltShade, LW_IN);
  P.shape(R(x - 8 * s, y - 64 * s, 16 * s, 6 * s), PAL.cobaltShade, LW_IN);
  // head: front face plus a side face in shade, top face lighter
  P.shape(PL([[hx + hw, hy], [hx + hw + dk, hy - dk * .7], [hx + hw + dk, hy + hh - dk * .7], [hx + hw, hy + hh]]), PAL.cobaltShade, LW);
  P.shape(PL([[hx, hy], [hx + dk, hy - dk * .7], [hx + hw + dk, hy - dk * .7], [hx + hw, hy]]), '#4a6fcf', LW);
  P.shape(R(hx, hy, hw, hh), PAL.cobalt, LW);
  // the white folded corner, top right
  P.shape(PL([[hx + hw * .62, hy], [hx + hw, hy], [hx + hw, hy + hh * .42]]), '#f6f3ea', LW_IN);
  P.fill('#dcd7c9', PL([[hx + hw * .62, hy], [hx + hw, hy + hh * .42], [hx + hw * .8, hy + hh * .1]]));
  P.ink(LN([[hx + hw * .62, hy], [hx + hw, hy + hh * .42]]), LW_IN);
  // eyes
  for (const [ex, ey, er] of m.eyes) { P.shape(EL(ex, ey, er, er), '#fbf9f1', LW_IN); P.fill(INK, EL(ex + er * .18, ey + er * .1, er * .46, er * .46)); P.fill('#ffffff', EL(ex + er * .02, ey - er * .18, er * .14, er * .14)); }
  // the vermilion ear disc on the side face
  P.shape(EL(hx + hw + dk * .55, hy + hh * .52, 6.5 * s, 11 * s), PAL.vermilion, LW_IN);
  return m;
}
function drawTelescope(P, x, y, s = 1, ang = -.5) {
  // a small refractor on a desk tripod, aimed out of the window
  contact(P, x, y + 2, 90 * s, .22);
  const top = [x, y - 74 * s];
  for (const fx of [-34, 0, 30]) P.ink(LN([[x + fx * s, y], top]), 3.4, INK), P.ink(LN([[x + fx * s, y], top]), 1.4, '#6b7075');
  P.shape(RR(top[0] - 7 * s, top[1] - 10 * s, 14 * s, 14 * s, 3 * s), '#585d62', LW_IN);
  P.at(top[0], top[1] - 6 * s, ang, 1, p => {
    p.shape(RR(-70 * s, -10 * s, 150 * s, 20 * s, 4 * s), '#efece2', LW);
    p.fill('#d6d2c4', R(-68 * s, 3 * s, 146 * s, 6 * s));
    p.shape(RR(64 * s, -13 * s, 30 * s, 26 * s, 4 * s), '#3d4247', LW);          // dew cap
    p.shape(RR(-84 * s, -6 * s, 16 * s, 12 * s, 2 * s), '#3d4247', LW_IN);        // eyepiece
    p.shape(RR(-20 * s, -18 * s, 34 * s, 8 * s, 3 * s), '#3d4247', LW_IN);        // finder
  });
}
function drawMug(P, x, y, s = 1, col = '#3f8f87', shade = '#2f6f69') {
  contact(P, x + 3, y + 2, 46 * s, .25);
  const w = 34 * s, h = 40 * s;
  P.ink(c => { c.ellipse(x + w / 2 + 4 * s, y - h * .52, 9 * s, 11 * s, 0, -PI / 2, PI / 2); }, 5.4);
  P.ink(c => { c.ellipse(x + w / 2 + 4 * s, y - h * .52, 9 * s, 11 * s, 0, -PI / 2, PI / 2); }, 2.4, col);
  P.shape(c => { c.moveTo(x - w / 2, y - h); c.lineTo(x + w / 2, y - h); c.lineTo(x + w / 2, y - 4 * s); c.quadraticCurveTo(x + w / 2, y, x + w / 2 - 6 * s, y); c.lineTo(x - w / 2 + 6 * s, y); c.quadraticCurveTo(x - w / 2, y, x - w / 2, y - 4 * s); c.closePath(); }, col, LW);
  P.fill(shade, R(x + w * .18, y - h + 1, w * .3, h - 2));
  P.shape(EL(x, y - h, w / 2, 5 * s), shade, LW_IN);
}
function drawPlant(P, x, y, s = 1) {
  P.shape(PL([[x - 22 * s, y - 34 * s], [x + 22 * s, y - 34 * s], [x + 16 * s, y], [x - 16 * s, y]]), '#c66d43', LW);
  P.fill('#a95a35', PL([[x + 6 * s, y - 34 * s], [x + 22 * s, y - 34 * s], [x + 16 * s, y], [x + 4 * s, y]]));
  P.shape(R(x - 25 * s, y - 40 * s, 50 * s, 8 * s), '#d27b50', LW_IN);
  // a little rosette of fleshy leaves
  const lv = (a, l, w) => P.at(x, y - 40 * s, a, 1, p => p.shape(c => { c.moveTo(0, 0); c.quadraticCurveTo(w * s, -l * s * .5, 0, -l * s); c.quadraticCurveTo(-w * s, -l * s * .5, 0, 0); }, '#7da35e', LW_IN));
  for (const [a, l, w] of [[-1.2, 34, 10], [1.15, 32, 10], [-.6, 44, 11], [.55, 42, 11], [0, 50, 12]]) lv(a, l, w);
}
// spines on the shelf, in the colours of San's real code-drawn covers
const SPINES_NOW = [
  { c: '#e9b62e', band: '#141414', w: 22, h: 92 },   // Winning by Overfitting
  { c: '#2e4fa8', band: '#e7b04a', w: 26, h: 100 },  // GPT-7 Will Have Arms
  { c: '#3b1e16', band: '#d64b2c', w: 20, h: 86 },   // How to Please a Capricious God
  { c: '#f1eee6', band: '#ff5fa2', w: 18, h: 80 },   // ZINify
  { c: '#e7dcc1', band: '#b8402f', w: 24, h: 94 },   // StartR post-mortem
  { c: '#1f2b52', band: '#f08a3a', w: 21, h: 88 },   // Dyson Swarm
];
function drawSpines(P, x, y, spines, lean = 0) {
  let cx = x;
  spines.forEach((b, i) => {
    const last = i === spines.length - 1 && lean;
    const draw = p => {
      p.shape(R(0, -b.h, b.w, b.h), b.c, LW_IN);
      p.fill(b.band, R(0, -b.h + 12, b.w, 7));
      p.fill(b.band, R(0, -18, b.w, 4));
      p.alpha(.18, q => q.fill('#000', R(b.w * .7, -b.h, b.w * .3, b.h)));
    };
    if (last) P.at(cx + 2, y, lean, 1, draw); else P.at(cx, y, 0, 1, draw);
    cx += b.w + 1;
  });
  return cx;
}
/* a photograph as a physical print: white border, true colour, pin or tape, contact shadow */
function drawPrint(P, img, cx, cy, w, rot, o = {}) {
  const ratio = img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : .75;
  const b = o.border ?? 7, iw = w, ih = w * ratio, W = iw + 2 * b, H = ih + 2 * b + (o.caption ? 10 : 0);
  P.at(cx, cy, rot, 1, p => {
    p.alpha(.3, q => q.fill('#2c2015', R(-W / 2 + 4, -H / 2 + 6, W, H)));
    p.shape(R(-W / 2, -H / 2, W, H), '#fbfaf5', LW_IN);
    if (img && img.complete && img.naturalWidth) {
      p.c.save(); p.c.beginPath(); p.c.rect(-W / 2 + b, -H / 2 + b, iw, ih); p.c.clip();
      p.c.drawImage(img, -W / 2 + b, -H / 2 + b, iw, ih); p.c.restore();
    } else p.fill('#9aa', R(-W / 2 + b, -H / 2 + b, iw, ih));
    p.ink(R(-W / 2 + b, -H / 2 + b, iw, ih), .8, 'rgba(40,34,30,.5)');
    if (o.tape) {
      p.alpha(.82, q => q.shape(R(-16, -H / 2 - 9, 32, 16), '#efe6c4', .8));
    } else {
      const pc = o.pin || '#d6453a';
      p.alpha(.35, q => q.fill('#000', EL(3, -H / 2 + b * .5 + 4, 5, 3)));
      p.shape(EL(0, -H / 2 + b * .5, 5.5, 5.5), pc, LW_IN);
      p.fill('rgba(255,255,255,.7)', EL(-1.6, -H / 2 + b * .5 - 1.8, 1.6, 1.6));
    }
  });
  return { w: W, h: H };
}
function drawNote(P, cx, cy, w, h, rot, col = '#fbf6dc', lines = 4, pin = '#2f55b8') {
  P.at(cx, cy, rot, 1, p => {
    p.alpha(.25, q => q.fill('#2c2015', R(-w / 2 + 3, -h / 2 + 5, w, h)));
    p.shape(R(-w / 2, -h / 2, w, h), col, LW_IN);
    for (let i = 0; i < lines; i++) p.ink(LN([[-w / 2 + 8, -h / 2 + 16 + i * 10], [w / 2 - 8 - (i % 2) * 14, -h / 2 + 16 + i * 10]]), .8, 'rgba(60,60,80,.6)');
    p.shape(EL(0, -h / 2 + 5, 4.5, 4.5), pin, LW_IN);
  });
}

/* ───────── under the desk ───────── */
function drawBackpack(P, x, y, s = 1) {
  contact(P, x, y + 2, 120 * s, .3);
  const body = RR(x - 46 * s, y - 118 * s, 92 * s, 118 * s, 26 * s);
  P.shape(body, '#5c7a8c', LW);
  P.within(body, p => { p.fill('#4a6676', R(x + 18 * s, y - 120 * s, 40 * s, 124 * s)); });
  P.shape(RR(x - 34 * s, y - 62 * s, 68 * s, 50 * s, 12 * s), '#6d8b9c', LW_IN);
  P.ink(LN([[x - 30 * s, y - 50 * s], [x + 30 * s, y - 50 * s]]), LW_IN);
  P.shape(RR(x - 16 * s, y - 132 * s, 32 * s, 18 * s, 8 * s), '#4a6676', LW_IN);
  P.shape(R(x - 4 * s, y - 52 * s, 8 * s, 12 * s), '#d9b44a', LW_FINE);
}
function drawBookPile(P, x, y, s = 1, cols) {
  contact(P, x, y + 2, 150 * s, .3);
  let yy = y;
  (cols || [['#8a3b2e', 120, 22], ['#2f4f6b', 132, 26], ['#d1b45b', 112, 18], ['#3e6b4c', 126, 24]]).forEach(([c, w, h], i) => {
    const off = (i % 2 ? 6 : -5) * s;
    P.shape(R(x - w / 2 * s + off, yy - h * s, w * s, h * s), c, LW_IN);
    P.fill('#f4efe2', R(x + w / 2 * s + off - 7 * s, yy - h * s + 3 * s, 5 * s, h * s - 6 * s));
    P.ink(LN([[x + w / 2 * s + off - 7 * s, yy - h * s + 3 * s], [x + w / 2 * s + off - 7 * s, yy - 3 * s]]), LW_FINE);
    yy -= h * s;
  });
}
function drawBox(P, x, y, s = 1) {
  contact(P, x, y + 2, 150 * s, .3);
  P.shape(R(x - 64 * s, y - 84 * s, 128 * s, 84 * s), '#c9a06a', LW);
  P.fill('#b18850', R(x + 30 * s, y - 84 * s, 34 * s, 84 * s));
  P.shape(PL([[x - 64 * s, y - 84 * s], [x - 40 * s, y - 104 * s], [x + 6 * s, y - 92 * s], [x - 14 * s, y - 84 * s]]), '#d8b07a', LW_IN);
  P.shape(PL([[x + 64 * s, y - 84 * s], [x + 40 * s, y - 102 * s], [x - 4 * s, y - 92 * s], [x + 14 * s, y - 84 * s]]), '#b8925c', LW_IN);
  P.fill('#e8dfc4', R(x - 40 * s, y - 50 * s, 46 * s, 22 * s)); P.ink(R(x - 40 * s, y - 50 * s, 46 * s, 22 * s), LW_FINE);
}
function drawToolbox(P, x, y, s = 1) {
  contact(P, x, y + 2, 140 * s, .3);
  P.shape(R(x - 62 * s, y - 56 * s, 124 * s, 56 * s), '#b8402f', LW);
  P.fill('#963223', R(x + 30 * s, y - 56 * s, 32 * s, 56 * s));
  P.shape(R(x - 64 * s, y - 64 * s, 128 * s, 12 * s), '#c9503c', LW_IN);
  P.ink(c => { c.moveTo(x - 24 * s, y - 64 * s); c.lineTo(x - 24 * s, y - 80 * s); c.lineTo(x + 24 * s, y - 80 * s); c.lineTo(x + 24 * s, y - 64 * s); }, 4.4 * s);
  P.ink(c => { c.moveTo(x - 24 * s, y - 64 * s); c.lineTo(x - 24 * s, y - 80 * s); c.lineTo(x + 24 * s, y - 80 * s); c.lineTo(x + 24 * s, y - 64 * s); }, 2 * s, '#9aa0a3');
  P.shape(R(x - 6 * s, y - 50 * s, 12 * s, 9 * s), '#c9c9c0', LW_FINE);
}

/* ───────── San Diego ───────── */
function drawPapers(P, x, y, s = 1) {
  contact(P, x, y + 2, 130 * s, .22);
  for (let i = 0; i < 4; i++) {
    const r = (i - 1.5) * .05, dx = (i - 1.5) * 4 * s;
    P.at(x + dx, y - 4 - i * 2.4 * s, r, 1, p => {
      p.shape(PL([[-58 * s, 0], [58 * s, 0], [48 * s, -38 * s], [-48 * s, -38 * s]]), i === 3 ? '#fbfaf3' : '#f0ede2', LW_IN);
      if (i === 3) for (let k = 0; k < 6; k++) p.ink(LN([[-40 * s + k * 1.6 * s, -32 * s + k * 5.4 * s], [(30 - (k % 3) * 8) * s, -32 * s + k * 5.4 * s]]), .8, 'rgba(60,64,80,.55)');
    });
  }
  // a pen lying across
  P.at(x + 10 * s, y - 20 * s, -.35, 1, p => { p.shape(RR(-44 * s, -3 * s, 88 * s, 6 * s, 3 * s), '#2f55b8', LW_IN); p.fill('#e9e6dc', R(36 * s, -3 * s, 8 * s, 6 * s)); });
}
function drawZine(P, x, y, s = 1) {
  // a stapled riso zine lying open on the desk: pink and yellow
  contact(P, x, y + 2, 120 * s, .2);
  const L0 = [[x - 60 * s, y], [x, y + 2 * s], [x - 4 * s, y - 34 * s], [x - 54 * s, y - 36 * s]];
  const R0 = [[x, y + 2 * s], [x + 60 * s, y], [x + 54 * s, y - 36 * s], [x - 4 * s, y - 34 * s]];
  P.shape(PL(L0), '#fff1f5', LW_IN); P.shape(PL(R0), '#fffbe8', LW_IN);
  P.within(PL(L0), p => { p.fill('#ff6fa8', EL(x - 30 * s, y - 18 * s, 18 * s, 12 * s)); p.fill('#ffd23f', R(x - 50 * s, y - 8 * s, 34 * s, 4 * s)); });
  P.within(PL(R0), p => { for (let k = 0; k < 4; k++) p.fill('#2f55b8', R(x + 8 * s, y - 28 * s + k * 7 * s, (36 - k * 5) * s, 2.6 * s)); p.fill('#ff6fa8', R(x + 30 * s, y - 10 * s, 16 * s, 6 * s)); });
  P.ink(LN([[x, y + 2 * s], [x - 4 * s, y - 34 * s]]), LW_IN);
}
function drawPaperCup(P, x, y, s = 1) {
  contact(P, x + 2, y + 2, 44 * s, .25);
  P.shape(PL([[x - 18 * s, y - 56 * s], [x + 18 * s, y - 56 * s], [x + 13 * s, y], [x - 13 * s, y]]), '#f4efe4', LW);
  P.fill('#ddd6c6', PL([[x + 4 * s, y - 56 * s], [x + 18 * s, y - 56 * s], [x + 13 * s, y], [x + 3 * s, y]]));
  P.shape(PL([[x - 16.5 * s, y - 40 * s], [x + 16.5 * s, y - 40 * s], [x + 14.5 * s, y - 18 * s], [x - 14.5 * s, y - 18 * s]]), '#a9794e', LW_IN);
  P.shape(RR(x - 21 * s, y - 64 * s, 42 * s, 9 * s, 3 * s), '#3d4247', LW_IN);
}
function drawCactus(P, x, y, s = 1) {
  P.shape(PL([[x - 18 * s, y - 28 * s], [x + 18 * s, y - 28 * s], [x + 14 * s, y], [x - 14 * s, y]]), '#e8e2d4', LW);
  P.shape(RR(x - 9 * s, y - 70 * s, 18 * s, 44 * s, 9 * s), '#6f9a58', LW_IN);
  P.shape(RR(x + 6 * s, y - 56 * s, 14 * s, 9 * s, 4 * s), '#6f9a58', LW_IN);
  P.shape(RR(x + 13 * s, y - 72 * s, 9 * s, 22 * s, 4 * s), '#6f9a58', LW_IN);
  P.ink(LN([[x, y - 66 * s], [x, y - 30 * s]]), LW_FINE, 'rgba(30,50,20,.6)');
}
function drawLyingBooks(P, x, y, s, books) {
  let yy = y;
  books.forEach(([c, w, h], i) => { const off = (i % 2 ? 5 : -4) * s; P.shape(R(x + off, yy - h * s, w * s, h * s), c, LW_IN); P.fill('#f4efe2', R(x + off + w * s - 6 * s, yy - h * s + 2 * s, 4 * s, h * s - 4 * s)); yy -= h * s; });
  return yy;
}

/* ───────── Bengaluru ───────── */
function monitorRect(x, y, s = 1) { const w = 250 * s, h = 150 * s; return { x: x - w / 2, y: y - 74 * s - h, w, h }; }
function drawMonitor(P, x, y, s = 1) {
  const r = monitorRect(x, y, s), b = 10 * s;
  contact(P, x + 4, y + 4, 300 * s, .26);
  // keyboard in front
  P.shape(PL([[x - 120 * s, y + 14 * s], [x + 110 * s, y + 14 * s], [x + 100 * s, y - 14 * s], [x - 110 * s, y - 14 * s]]), '#d9d8d2', LW);
  P.within(PL([[x - 120 * s, y + 14 * s], [x + 110 * s, y + 14 * s], [x + 100 * s, y - 14 * s], [x - 110 * s, y - 14 * s]]), p => { for (let r2 = 0; r2 < 3; r2++) for (let k = 0; k < 16; k++) p.fill('#8b8d90', R(x - 104 * s + k * 13 * s + r2 * 2 * s, y - 10 * s + r2 * 8 * s, 10 * s, 5 * s)); });
  // stand
  P.shape(PL([[x - 46 * s, y - 20 * s], [x + 46 * s, y - 20 * s], [x + 36 * s, y - 30 * s], [x - 36 * s, y - 30 * s]]), '#45494e', LW_IN);
  P.shape(R(x - 10 * s, y - 76 * s, 20 * s, 48 * s), '#55595e', LW_IN);
  // screen with a chip layout: rows of standard cells, metal straps, a block of memory
  P.shape(RR(r.x - b, r.y - b, r.w + 2 * b, r.h + 2 * b, 5 * s), '#2b2e33', LW);
  P.shape(R(r.x, r.y, r.w, r.h), '#10161d', LW_FINE);
  P.within(R(r.x, r.y, r.w, r.h), p => {
    const rnd = mulberry32(19);
    for (let row = 0; row < 9; row++) { const yy = r.y + 8 * s + row * 14 * s; for (let xx = r.x + 6 * s; xx < r.x + r.w - 70 * s;) { const w = (6 + rnd() * 16) * s; p.fill(['#3b6fd1', '#c9473a', '#4fae6c', '#d8b23f'][Math.floor(rnd() * 4)], R(xx, yy, w, 8 * s)); xx += w + 2 * s; } }
    for (let k = 0; k < 5; k++) p.fill('rgba(120,200,255,.75)', R(r.x + 6 * s, r.y + 15 * s + k * 28 * s, r.w - 80 * s, 2 * s));
    for (let k = 0; k < 4; k++) p.fill('rgba(255,120,200,.7)', R(r.x + 30 * s + k * 42 * s, r.y + 4 * s, 2 * s, r.h - 8 * s));
    p.fill('#6b4fa8', R(r.x + r.w - 62 * s, r.y + 10 * s, 52 * s, 62 * s));
    for (let k = 0; k < 6; k++) p.ink(LN([[r.x + r.w - 62 * s, r.y + 18 * s + k * 9 * s], [r.x + r.w - 10 * s, r.y + 18 * s + k * 9 * s]]), .6, 'rgba(255,255,255,.4)');
    p.alpha(.16, q => q.fill('#ffffff', PL([[r.x + r.w * .6, r.y], [r.x + r.w * .8, r.y], [r.x + r.w * .45, r.y + r.h], [r.x + r.w * .25, r.y + r.h]])));
  });
}
function drawLoupe(P, x, y, s = 1) {
  // a datasheet with a block diagram, a loupe resting on it
  contact(P, x, y + 2, 140 * s, .18);
  const sheet = PL([[x - 66 * s, y], [x + 66 * s, y], [x + 56 * s, y - 42 * s], [x - 56 * s, y - 42 * s]]);
  P.shape(sheet, '#fbfaf3', LW_IN);
  P.within(sheet, p => {
    p.ink(R(x - 40 * s, y - 34 * s, 26 * s, 14 * s), .8, '#3a4a6a'); p.ink(R(x - 4 * s, y - 34 * s, 30 * s, 14 * s), .8, '#3a4a6a');
    p.ink(LN([[x - 14 * s, y - 27 * s], [x - 4 * s, y - 27 * s]]), .8, '#3a4a6a');
    for (let k = 0; k < 3; k++) p.ink(LN([[x - 44 * s, y - 14 * s + k * 5 * s], [x + 40 * s, y - 14 * s + k * 5 * s]]), .7, 'rgba(60,64,80,.5)');
  });
  P.shape(EL(x + 18 * s, y - 16 * s, 24 * s, 12 * s), 'rgba(220,236,240,.55)', LW);
  P.ink(EL(x + 18 * s, y - 16 * s, 19 * s, 9 * s), LW_FINE, 'rgba(255,255,255,.8)');
  P.at(x + 40 * s, y - 10 * s, .25, 1, p => p.shape(RR(0, -5 * s, 40 * s, 10 * s, 4 * s), '#3d4247', LW_IN));
}
function drawChip(P, x, y, s = 1) {
  // a packaged chip on a square of pink anti-static foam
  contact(P, x, y + 2, 90 * s, .2);
  P.shape(PL([[x - 44 * s, y], [x + 44 * s, y], [x + 36 * s, y - 26 * s], [x - 36 * s, y - 26 * s]]), '#e9a0b4', LW_IN);
  P.fill('#d98aa0', PL([[x - 44 * s, y], [x + 44 * s, y], [x + 44 * s, y + 6 * s], [x - 44 * s, y + 6 * s]]));
  P.ink(PL([[x - 44 * s, y], [x + 44 * s, y], [x + 44 * s, y + 6 * s], [x - 44 * s, y + 6 * s]]), LW_FINE);
  const top = PL([[x - 22 * s, y - 6 * s], [x + 22 * s, y - 6 * s], [x + 18 * s, y - 22 * s], [x - 18 * s, y - 22 * s]]);
  for (let k = 0; k < 7; k++) { const t = (k + .5) / 7; P.ink(LN([[lerp(x - 22 * s, x + 22 * s, t), y - 6 * s], [lerp(x - 22 * s, x + 22 * s, t), y - 1 * s]]), 1.6, '#c9ccce'); }
  P.shape(top, '#24272b', LW_IN);
  P.fill('#3a3e44', PL([[x - 22 * s, y - 6 * s], [x + 22 * s, y - 6 * s], [x + 22 * s, y - 2 * s], [x - 22 * s, y - 2 * s]]));
  P.fill('#e8e6dc', EL(x - 12 * s, y - 17 * s, 2 * s, 1.2 * s));
}
function drawTumbler(P, x, y, s = 1) {
  contact(P, x + 2, y + 2, 64 * s, .25);
  const steel = '#c6cacc', steelS = '#9da2a5';
  P.shape(PL([[x - 30 * s, y - 14 * s], [x + 30 * s, y - 14 * s], [x + 24 * s, y], [x - 24 * s, y]]), steel, LW_IN);
  P.shape(EL(x, y - 14 * s, 30 * s, 6 * s), steelS, LW_IN);
  P.shape(PL([[x - 15 * s, y - 52 * s], [x + 15 * s, y - 52 * s], [x + 12 * s, y - 14 * s], [x - 12 * s, y - 14 * s]]), steel, LW);
  P.fill(steelS, PL([[x + 3 * s, y - 52 * s], [x + 15 * s, y - 52 * s], [x + 12 * s, y - 14 * s], [x + 3 * s, y - 14 * s]]));
  P.shape(EL(x, y - 52 * s, 15 * s, 4 * s), '#8a5a35', LW_IN);
}
function drawBinders(P, x, y, s = 1) {
  const cols = [['#f1efe6', '#2f55b8'], ['#2f55b8', '#f1efe6'], ['#f1efe6', '#c9473a'], ['#3e6b4c', '#f1efe6'], ['#f1efe6', '#2f55b8']];
  let cx = x;
  cols.forEach(([c, lab], i) => { const w = 26 * s, h = 96 * s; P.shape(R(cx, y - h, w, h), c, LW_IN); P.shape(R(cx + 5 * s, y - h + 18 * s, w - 10 * s, 26 * s), lab, LW_FINE); P.shape(EL(cx + w / 2, y - 20 * s, 5 * s, 5 * s), '#2b2e33', LW_FINE); cx += w + 1; });
  return cx;
}
function drawBottlePlant(P, x, y, s = 1) {
  // a money plant growing in a glass bottle
  P.shape(c => { c.moveTo(x - 16 * s, y); c.lineTo(x - 16 * s, y - 44 * s); c.quadraticCurveTo(x - 16 * s, y - 54 * s, x - 6 * s, y - 58 * s); c.lineTo(x - 6 * s, y - 70 * s); c.lineTo(x + 6 * s, y - 70 * s); c.lineTo(x + 6 * s, y - 58 * s); c.quadraticCurveTo(x + 16 * s, y - 54 * s, x + 16 * s, y - 44 * s); c.lineTo(x + 16 * s, y); c.closePath(); }, 'rgba(180,215,200,.6)', LW_IN);
  P.fill('rgba(140,190,200,.5)', R(x - 15 * s, y - 26 * s, 30 * s, 25 * s));
  const leaf = (lx, ly, a, sz) => P.at(lx, ly, a, 1, p => p.shape(c => { c.moveTo(0, 0); c.quadraticCurveTo(sz * s, -sz * .5 * s, 0, -sz * 1.3 * s); c.quadraticCurveTo(-sz * s, -sz * .5 * s, 0, 0); }, '#7bab52', LW_FINE));
  P.ink(CURVE([[x, y - 66 * s], [x - 20 * s, y - 84 * s], [x - 40 * s, y - 70 * s], [x - 52 * s, y - 40 * s]]), 1.2, '#4f7a34');
  P.ink(CURVE([[x, y - 66 * s], [x + 18 * s, y - 88 * s], [x + 34 * s, y - 82 * s]]), 1.2, '#4f7a34');
  for (const [lx, ly, a, sz] of [[x - 18, y - 84, -.8, 11], [x - 38, y - 72, -1.6, 10], [x - 50, y - 46, -2.6, 10], [x + 16, y - 88, .4, 11], [x + 34, y - 82, 1.2, 10], [x + 2, y - 74, -.2, 12]]) leaf(lx, ly * 1, a, sz);
}

/* ───────── Surathkal ───────── */
function scopeRect(x, y, s = 1) { const w = 120 * s, h = 80 * s; return { x: x - 150 * s / 2 + 12 * s, y: y - 118 * s + 14 * s, w, h }; }
function drawScope(P, x, y, s = 1) {
  // a bench oscilloscope: beige case, a green screen with a square wave, dials
  const W = 230 * s, Hh = 118 * s, x0 = x - W / 2 + 40 * s;
  contact(P, x + 10, y + 4, W * 1.05, .28);
  const r = scopeRect(x, y, s);
  P.shape(PL([[x0 + W - 70 * s, y - Hh], [x0 + W - 40 * s, y - Hh - 22 * s], [x0 + W - 40 * s, y - 22 * s], [x0 + W - 70 * s, y]]), '#bdb39c', LW);
  P.shape(PL([[x0 - 40 * s, y - Hh], [x0 - 10 * s, y - Hh - 22 * s], [x0 + W - 40 * s, y - Hh - 22 * s], [x0 + W - 70 * s, y - Hh]]), '#e2dac6', LW);
  P.shape(R(x0 - 40 * s, y - Hh, W - 30 * s, Hh), '#d6cdb5', LW);
  P.fill('#c4bba2', R(x0 - 40 * s, y - 12 * s, W - 30 * s, 12 * s));
  P.shape(RR(r.x - 6 * s, r.y - 6 * s, r.w + 12 * s, r.h + 12 * s, 6 * s), '#3a3f38', LW_IN);
  P.shape(R(r.x, r.y, r.w, r.h), '#123224', LW_FINE);
  P.within(R(r.x, r.y, r.w, r.h), p => {
    for (let k = 1; k < 8; k++) p.ink(LN([[r.x + r.w * k / 8, r.y], [r.x + r.w * k / 8, r.y + r.h]]), .5, 'rgba(120,220,160,.25)');
    for (let k = 1; k < 6; k++) p.ink(LN([[r.x, r.y + r.h * k / 6], [r.x + r.w, r.y + r.h * k / 6]]), .5, 'rgba(120,220,160,.25)');
    const sq = []; const hi = r.y + r.h * .3, lo = r.y + r.h * .7;
    for (let k = 0; k <= 4; k++) { const xa = r.x + r.w * (k / 4) - r.w * .05, xb = xa + r.w / 8; sq.push([xa, lo], [xa, hi], [xb, hi], [xb, lo]); }
    p.ink(LN(sq), 2.6, 'rgba(140,255,170,.35)'); p.ink(LN(sq), 1.2, '#b8ffd0');
  });
  // dials and buttons
  const kx = r.x + r.w + 20 * s;
  for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) { P.shape(EL(kx + j * 26 * s, r.y + 10 * s + k * 26 * s, 9 * s, 9 * s), '#3a3f38', LW_IN); P.ink(LN([[kx + j * 26 * s, r.y + 10 * s + k * 26 * s], [kx + j * 26 * s + 5 * s, r.y + 4 * s + k * 26 * s]]), 1, '#e9e2cc'); }
  P.shape(R(r.x, y - 26 * s, 26 * s, 9 * s), '#3a3f38', LW_FINE); P.shape(R(r.x + 34 * s, y - 26 * s, 26 * s, 9 * s), '#3a3f38', LW_FINE);
  P.shape(EL(kx + 2 * s, y - 20 * s, 6 * s, 6 * s), '#c9473a', LW_FINE); P.shape(EL(kx + 26 * s, y - 20 * s, 6 * s, 6 * s), '#d8b23f', LW_FINE);
  // the probe lead running to the breadboard
  P.ink(CURVE([[kx + 2 * s, y - 20 * s], [kx - 40 * s, y + 10 * s], [x - 170 * s, y + 6 * s], [x - 230 * s, y - 10 * s]]), 3.4); P.ink(CURVE([[kx + 2 * s, y - 20 * s], [kx - 40 * s, y + 10 * s], [x - 170 * s, y + 6 * s], [x - 230 * s, y - 10 * s]]), 1.4, '#c9473a');
}
function drawBreadboard(P, x, y, s = 1) {
  contact(P, x, y + 2, 140 * s, .18);
  const bb = PL([[x - 64 * s, y], [x + 64 * s, y], [x + 56 * s, y - 40 * s], [x - 56 * s, y - 40 * s]]);
  P.shape(bb, '#f2efe6', LW_IN);
  P.within(bb, p => {
    for (let row = 0; row < 7; row++) for (let k = 0; k < 18; k++) { const t = row / 7, yy = lerp(y - 36 * s, y - 4 * s, t), xa = lerp(x - 52 * s, x - 60 * s, t), xb = lerp(x + 52 * s, x + 60 * s, t); p.fill('#b9b5aa', R(lerp(xa, xb, k / 17) - 1, yy, 2.2 * s, 2.2 * s)); }
    p.fill('#c9473a', R(x - 56 * s, y - 38 * s, 112 * s, 1.6 * s)); p.fill('#2f55b8', R(x - 60 * s, y - 4 * s, 120 * s, 1.6 * s));
  });
  // jumper wires and parts
  for (const [x0, x1, c] of [[-40, -10, '#c9473a'], [-20, 24, '#2f8f5a'], [8, 44, '#d8b23f'], [-48, 30, '#2f55b8']]) P.ink(c2 => { c2.moveTo(x + x0 * s, y - 24 * s); c2.quadraticCurveTo(x + (x0 + x1) / 2 * s, y - 46 * s, x + x1 * s, y - 16 * s); }, 2.2, c);
  P.shape(RR(x - 30 * s, y - 30 * s, 16 * s, 6 * s, 3 * s), '#d9b98a', LW_FINE);
  P.shape(EL(x + 20 * s, y - 34 * s, 4 * s, 6 * s), '#e2553a', LW_FINE);
  P.shape(R(x - 6 * s, y - 22 * s, 22 * s, 10 * s), '#24272b', LW_FINE);
}
function drawPlanisphere(P, x, y, s = 1) {
  // a star wheel for the astronomy club: a disc of the sky in a card holder
  contact(P, x, y + 2, 130 * s, .2);
  P.shape(EL(x, y - 18 * s, 62 * s, 22 * s), '#e6dcc2', LW);
  P.shape(EL(x, y - 20 * s, 52 * s, 18 * s), '#1e2b52', LW_IN);
  P.within(EL(x, y - 20 * s, 52 * s, 18 * s), p => {
    const rnd = mulberry32(61);
    for (let i = 0; i < 40; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()); p.fill('#f6efcf', EL(x + Math.cos(a) * 50 * s * r, y - 20 * s + Math.sin(a) * 17 * s * r, 1.2 * s, .8 * s)); }
    p.ink(LN([[x - 22 * s, y - 26 * s], [x - 8 * s, y - 22 * s], [x + 6 * s, y - 28 * s], [x + 20 * s, y - 20 * s]]), .8, 'rgba(246,239,207,.7)');
    p.ink(EL(x, y - 20 * s, 30 * s, 10 * s), .6, 'rgba(246,239,207,.4)');
  });
  P.ink(LN([[x - 62 * s, y - 18 * s], [x - 52 * s, y - 20 * s]]), LW_FINE);
}
function drawMultimeter(P, x, y, s = 1) {
  contact(P, x, y + 2, 70 * s, .24);
  P.shape(RR(x - 28 * s, y - 92 * s, 56 * s, 92 * s, 10 * s), '#e2b23a', LW);
  P.shape(RR(x - 22 * s, y - 86 * s, 44 * s, 80 * s, 6 * s), '#3a3f38', LW_IN);
  P.shape(R(x - 17 * s, y - 80 * s, 34 * s, 18 * s), '#b9c8a4', LW_FINE);
  P.fill('#2a3324', R(x - 12 * s, y - 75 * s, 6 * s, 8 * s)); P.fill('#2a3324', R(x - 3 * s, y - 75 * s, 6 * s, 8 * s)); P.fill('#2a3324', R(x + 6 * s, y - 75 * s, 6 * s, 8 * s));
  P.shape(EL(x, y - 40 * s, 13 * s, 13 * s), '#55595e', LW_IN);
  P.ink(LN([[x, y - 40 * s], [x + 8 * s, y - 48 * s]]), 1.4, '#e9e2cc');
}
function drawBinoculars(P, x, y, s = 1) {
  for (const dx of [-16, 16]) { P.shape(RR(x + dx * s - 12 * s, y - 52 * s, 24 * s, 52 * s, 8 * s), '#2b2e33', LW_IN); P.shape(EL(x + dx * s, y - 52 * s, 11 * s, 5 * s), '#6b7a8a', LW_FINE); }
  P.shape(R(x - 6 * s, y - 40 * s, 12 * s, 14 * s), '#3d4247', LW_FINE);
}

/* ───────── era object lists ─────────
   Each item: { id, draw(P), exit, enter, live?, screen? }  exit/enter: 'right' | 'up' | 'drop' | 'board' | 'lid' */
function eraObjects(era, L, PH) {
  const S = L.slots, s = L.objScale, pb = L.pin, sh = L.shelf, fl = L.floor;
  const [lx, ly] = S.center, [rx, ry] = S.right, [tx, ty] = S.far, [mx, my] = S.left;
  const P0 = (n, fx, fy, w, rot, o) => P => drawPrint(P, PH[n], pb.x + pb.w * fx, pb.y + pb.h * fy, pb.w * w, rot, o);
  const floorObj = (id, fn) => fl ? [{ id, exit: 'right', enter: 'right', draw: P => fn(P, fl[0], fl[1], s) }] : [];
  if (era === 'now') return [
    { id: 'shelf', exit: 'up', enter: 'drop', draw: P => { const end = drawSpines(P, sh.x + 30, sh.y, SPINES_NOW, -.12); drawPlant(P, end + 44, sh.y, .9); } },
    { id: 'mug', exit: 'right', enter: 'right', draw: P => drawMug(P, mx, my, s) },
    { id: 'laptop-base', exit: 'right', enter: 'right', draw: P => drawLaptopBase(P, lx, ly, s) },
    { id: 'laptop-screen', exit: 'lid', enter: 'lid', hinge: [lx, ly - 52 * s], follow: 'laptop-base', draw: P => drawLaptopScreen(P, lx, ly, s), lid: P => drawLaptopLid(P, lx, ly, s), live: 'tokens', screen: laptopScreenRect(lx, ly, s), glow: 'rgba(150,190,255,.55)' },
    { id: 'robot', exit: 'right', enter: 'right', draw: P => drawRobot(P, rx, ry, s * 1.18), live: 'blink', eyes: robotMeta(rx, ry, s * 1.18).eyes },
    { id: 'telescope', exit: 'up', enter: 'drop', draw: P => drawTelescope(P, tx, ty, s, -2.72) },
    { id: 'p-award', exit: 'board', enter: 'board', draw: P0('neurips-award', .34, .33, .5, -.05, { pin: '#d6453a' }) },
    { id: 'p-ebay', exit: 'board', enter: 'board', draw: P0('ebay-headquarters', .76, .48, .3, .06, { tape: true }) },
    { id: 'note', exit: 'board', enter: 'board', draw: P => drawNote(P, pb.x + pb.w * .28, pb.y + pb.h * .78, pb.w * .32, pb.h * .26, .04) },
    ...floorObj('backpack', drawBackpack),
  ];
  if (era === 'sd') return [
    { id: 'shelf', exit: 'up', enter: 'drop', draw: P => { const top = drawLyingBooks(P, sh.x + 26, sh.y, 1, [['#2f4f6b', 120, 20], ['#8a3b2e', 112, 18], ['#d1b45b', 104, 16]]); drawSpines(P, sh.x + 160, sh.y, [{ c: '#3e6b4c', band: '#e8dcb8', w: 24, h: 88 }, { c: '#e8e2d2', band: '#2f4f6b', w: 20, h: 80 }, { c: '#6b4f8a', band: '#e8dcb8', w: 22, h: 92 }]); drawCactus(P, sh.x + 252, sh.y, .9); } },
    { id: 'papers', exit: 'right', enter: 'right', draw: P => drawPapers(P, mx + 6, my + 8, s) },
    { id: 'laptop-base', exit: 'right', enter: 'right', draw: P => drawLaptopBase(P, lx - 10, ly, s, '#bfc4c8') },
    { id: 'laptop-screen', exit: 'lid', enter: 'lid', hinge: [lx - 10, ly - 52 * s], follow: 'laptop-base', draw: P => drawLaptopScreen(P, lx - 10, ly, s, '#bfc4c8', 'paper'), lid: P => drawLaptopLid(P, lx - 10, ly, s, '#bfc4c8'), screen: laptopScreenRect(lx - 10, ly, s), glow: false },
    { id: 'zine', exit: 'right', enter: 'right', draw: P => drawZine(P, rx - 6, ry + 12, s) },
    { id: 'cup', exit: 'right', enter: 'right', draw: P => drawPaperCup(P, tx - 30, ty + 6, s) },
    { id: 'p-library', exit: 'board', enter: 'board', draw: P0('ucsd-library', .36, .24, .6, -.03, { pin: '#2f55b8' }) },
    { id: 'p-group', exit: 'board', enter: 'board', draw: P0('research-group', .4, .62, .62, .04, { tape: true }) },
    { id: 'p-uist', exit: 'board', enter: 'board', draw: P0('uist-award', .82, .46, .26, -.05, { pin: '#d6453a' }) },
    ...floorObj('books', drawBookPile),
  ];
  if (era === 'blr') return [
    { id: 'shelf', exit: 'up', enter: 'drop', draw: P => { const end = drawBinders(P, sh.x + 30, sh.y, 1); drawBottlePlant(P, end + 60, sh.y, 1); } },
    { id: 'tumbler', exit: 'right', enter: 'right', draw: P => drawTumbler(P, mx, my, s) },
    { id: 'monitor', exit: 'right', enter: 'right', draw: P => drawMonitor(P, lx + 10, ly - 6, s), screen: monitorRect(lx + 10, ly - 6, s), glow: false },
    { id: 'loupe', exit: 'right', enter: 'right', draw: P => drawLoupe(P, rx + 20, ry + 14, s) },
    { id: 'chip', exit: 'right', enter: 'right', draw: P => drawChip(P, tx - 10, ty + 10, s) },
    { id: 'p-ti', exit: 'board', enter: 'board', draw: P0('ti-bengaluru', .32, .38, .44, -.04, { pin: '#2f55b8' }) },
    { id: 'layout', exit: 'board', enter: 'board', draw: P => drawLayoutSheet(P, pb.x + pb.w * .74, pb.y + pb.h * .44, pb.w * .34, .05) },
    { id: 'note', exit: 'board', enter: 'board', draw: P => drawNote(P, pb.x + pb.w * .34, pb.y + pb.h * .8, pb.w * .3, pb.h * .24, -.03, '#e9f1fb', 3, '#d6453a') },
    ...floorObj('box', drawBox),
  ];
  return [ // nitk
    { id: 'shelf', exit: 'up', enter: 'drop', draw: P => { drawSpines(P, sh.x + 30, sh.y, [{ c: '#8a3b2e', band: '#e8dcb8', w: 30, h: 100 }, { c: '#2f4f6b', band: '#e8dcb8', w: 28, h: 96 }, { c: '#e8e2d2', band: '#8a3b2e', w: 24, h: 90 }, { c: '#3e6b4c', band: '#e8dcb8', w: 26, h: 94 }, { c: '#d1b45b', band: '#2b2b2b', w: 22, h: 86 }]); drawBinoculars(P, sh.x + 220, sh.y, 1); } },
    { id: 'breadboard', exit: 'right', enter: 'right', draw: P => drawBreadboard(P, mx + 4, my + 10, s) },
    { id: 'scope', exit: 'right', enter: 'right', draw: P => drawScope(P, lx + 20, ly, s), live: 'trace', screen: scopeRect(lx + 20, ly, s), glow: 'rgba(120,255,170,.5)' },
    { id: 'planisphere', exit: 'right', enter: 'right', draw: P => drawPlanisphere(P, rx + 10, ry + 12, s) },
    { id: 'meter', exit: 'right', enter: 'right', draw: P => drawMultimeter(P, tx - 10, ty + 6, s) },
    { id: 'p-lab', exit: 'board', enter: 'board', draw: P0('nitk-lab', .36, .32, .54, -.04, { pin: '#d6453a' }) },
    { id: 'starmap', exit: 'board', enter: 'board', draw: P => drawStarSheet(P, pb.x + pb.w * .76, pb.y + pb.h * .58, pb.w * .34, .06) },
    { id: 'schematic', exit: 'board', enter: 'board', draw: P => drawSchematic(P, pb.x + pb.w * .3, pb.y + pb.h * .76, pb.w * .36, pb.h * .28, .03) },
    ...floorObj('toolbox', drawToolbox),
  ];
}

/* pinned paper things */
function drawLayoutSheet(P, cx, cy, w, rot) {
  const h = w * 1.25;
  P.at(cx, cy, rot, 1, p => {
    p.alpha(.25, q => q.fill('#2c2015', R(-w / 2 + 3, -h / 2 + 5, w, h)));
    p.shape(R(-w / 2, -h / 2, w, h), '#fbfaf3', LW_IN);
    const rnd = mulberry32(23);
    for (let r = 0; r < 9; r++) for (let x = -w / 2 + 6; x < w / 2 - 6;) { const ww = 3 + rnd() * 9; p.fill(['#3b6fd1', '#c9473a', '#4fae6c', '#d8b23f'][Math.floor(rnd() * 4)], R(x, -h / 2 + 8 + r * (h - 16) / 9, ww, (h - 16) / 9 - 3)); x += ww + 1.5; }
    p.shape(R(-6, -h / 2 - 6, 12, 10), 'rgba(239,230,196,.85)', .7);
  });
}
function drawStarSheet(P, cx, cy, w, rot) {
  const h = w * 1.2;
  P.at(cx, cy, rot, 1, p => {
    p.alpha(.25, q => q.fill('#2c2015', R(-w / 2 + 3, -h / 2 + 5, w, h)));
    p.shape(R(-w / 2, -h / 2, w, h), '#1f2c54', LW_IN);
    const rnd = mulberry32(88);
    for (let i = 0; i < 28; i++) p.fill('#f6efcf', EL(-w / 2 + 6 + rnd() * (w - 12), -h / 2 + 6 + rnd() * (h - 12), .9 + rnd() * 1.2, .9 + rnd() * 1.2));
    // Orion, roughly
    const o = [[-8, -18], [10, -16], [-2, 0], [2, 1], [6, 2], [-10, 18], [12, 16]].map(([a, b]) => [a * w / 50, b * h / 60]);
    p.ink(LN([o[0], o[2], o[5]]), .7, 'rgba(246,239,207,.6)'); p.ink(LN([o[1], o[4], o[6]]), .7, 'rgba(246,239,207,.6)');
    o.forEach(([a, b]) => p.fill('#fff6d6', EL(a, b, 1.8, 1.8)));
    p.shape(EL(0, -h / 2 + 5, 4.5, 4.5), '#d8b23f', LW_IN);
  });
}
function drawSchematic(P, cx, cy, w, h, rot) {
  P.at(cx, cy, rot, 1, p => {
    p.alpha(.25, q => q.fill('#2c2015', R(-w / 2 + 3, -h / 2 + 5, w, h)));
    p.shape(R(-w / 2, -h / 2, w, h), '#fbf6dc', LW_IN);
    const zig = []; for (let i = 0; i <= 8; i++) zig.push([-w / 2 + 14 + i * 4, (i % 2 ? -4 : 4) * (i > 0 && i < 8 ? 1 : 0)]);
    p.ink(LN([[-w / 2 + 6, 0], ...zig, [-w / 2 + 52, 0], [w / 2 - 20, 0]]), .9, '#2f3e6b');
    p.ink(LN([[w / 2 - 20, -10], [w / 2 - 20, 10]]), .9, '#2f3e6b'); p.ink(LN([[w / 2 - 15, -6], [w / 2 - 15, 6]]), .9, '#2f3e6b');
    p.ink(LN([[-w / 2 + 6, 0], [-w / 2 + 6, h / 2 - 8], [w / 2 - 15, h / 2 - 8], [w / 2 - 15, 0]]), .9, '#2f3e6b');
    p.shape(EL(0, -h / 2 + 5, 4.5, 4.5), '#2f55b8', LW_IN);
  });
}
