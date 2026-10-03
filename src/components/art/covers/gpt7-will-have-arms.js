// GPT-7 Will Have Arms — mid-century paperback, linocut in two colours.
// Living detail: the six arms gesture.
import { PI, TAU, DW, DH, lerp, brush, spaced, wear, crease, paperTex } from './kit.js';

const CREAM = '#efe5cc', COBALT = '#2747a6', VERM = '#de4a2e';
const ARMS = [[166, 424, -2.5, .55, 0, -1], [162, 440, -2.98, -.45, 1.7, -1], [165, 457, 2.62, -.62, 3.1, -1], [234, 424, -.64, -.55, .9, 1], [238, 440, -.16, .45, 2.4, 1], [235, 457, .52, .62, 4.2, 1]];
const HC = [200, 350];
function arm(ctx, a, t) {
  const [sx, sy, base, bend, ph, side] = a, w = TAU * t / 16;
  const a1 = base + .1 * Math.sin(w + ph) + .05 * Math.sin(2 * w + ph * 1.7);
  const a2 = a1 + bend + .28 * Math.sin(w + ph + 1.1) * Math.sign(bend);
  const ex = sx + Math.cos(a1) * 50, ey = sy + Math.sin(a1) * 50, wx = ex + Math.cos(a2) * 42, wy = ey + Math.sin(a2) * 42;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = CREAM; ctx.lineWidth = 15.5; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(wx, wy); ctx.stroke();
  // carved shading along the shadow side of the tube
  const off = (ax, ay, bx, by, d) => { const l = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / l * d, ny = (bx - ax) / l * d; return [ax + nx, ay + ny, bx + nx, by + ny]; };
  ctx.strokeStyle = COBALT; ctx.lineWidth = 1.25;
  for (const [p, q, d] of [[[sx, sy], [ex, ey], 3.6], [[ex, ey], [wx, wy], 3.6]]) { const s = off(p[0], p[1], q[0], q[1], d * side * -1); ctx.beginPath(); ctx.moveTo(lerp(s[0], s[2], .18), lerp(s[1], s[3], .18)); ctx.lineTo(lerp(s[0], s[2], .86), lerp(s[1], s[3], .86)); ctx.stroke(); }
  for (let k = -1; k <= 1; k++) { const ang = a1 + PI / 2, cx = ex + Math.cos(a1) * k * 3.2, cy = ey + Math.sin(a1) * k * 3.2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * 4, cy + Math.sin(ang) * 4); ctx.lineTo(cx - Math.cos(ang) * 4, cy - Math.sin(ang) * 4); ctx.stroke(); }
  // cuff
  ctx.strokeStyle = VERM; ctx.lineWidth = 5; ctx.lineCap = 'butt'; const cx = wx - Math.cos(a2) * 5, cy = wy - Math.sin(a2) * 5, pa = a2 + PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(pa) * 7.6, cy + Math.sin(pa) * 7.6); ctx.lineTo(cx - Math.cos(pa) * 7.6, cy - Math.sin(pa) * 7.6); ctx.stroke();
  // open hand
  ctx.save(); ctx.translate(wx, wy); ctx.rotate(a2); ctx.scale(1.3, 1.3 * side);
  const spread = .12 * Math.sin(w * 2 + ph);
  ctx.fillStyle = CREAM; ctx.beginPath(); ctx.ellipse(7, 0, 8.5, 7.8, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = CREAM; ctx.lineCap = 'round'; ctx.lineWidth = 4.2;
  [-.42, -.14, .14, .42].forEach((f, k) => { const an = f * (1 + spread * 3), l = [9, 11, 10.5, 8.5][k]; ctx.beginPath(); ctx.moveTo(11, f * 9); ctx.lineTo(11 + Math.cos(an) * l, f * 9 + Math.sin(an) * l); ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(5, -6); ctx.lineTo(9, -13.5); ctx.stroke();
  ctx.strokeStyle = COBALT; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(4, 2); ctx.quadraticCurveTo(8, 4.5, 12, 2.5); ctx.stroke();
  ctx.restore();
}
const RS = x => { x.translate(200, 404); x.scale(1.22, 1.22); x.translate(-200, -404); };

export default {
  seed: 53, still: 4, fonts: ['jost-500', 'jost-700'],
  build(L) {
    const b = L.bctx, r = L.rng;
    b.fillStyle = CREAM; b.fillRect(0, 0, DW, DH);
    // the cobalt block, with type and a halo of gouge marks cut away
    const block = L.mask(x => {
      x.fillRect(-4, -4, 408, 608);
      x.globalCompositeOperation = 'destination-out';
      x.font = '700 92px Jost'; spaced(x, 'GPT-7', 26, 112, -1);
      x.font = '700 33px Jost'; spaced(x, 'WILL HAVE ARMS', 28, 152, 1.4);
      for (let rr = 128; rr < 262; rr += 9 + r() * 2.5) {
        let a = r() * TAU;
        while (a < TAU * 1.02 + 1) {
          const len = (14 + r() * 34) / rr, a1 = a + len; const pts = []; for (let k = 0; k <= 8; k++) { const aa = lerp(a, a1, k / 8); pts.push([HC[0] + Math.cos(aa) * rr, HC[1] + 10 + Math.sin(aa) * rr * .96]); }
          if (pts.every(p => p[1] > 226 && p[1] < 548 && p[0] > 12 && p[0] < 388)) brush(x, [pts], { w: 1.9 + r() * 1.4, taper: [3, 3], wob: .35, seed: rr + a });
          a = a1 + (7 + r() * 20) / rr;
        }
      }
    });
    L.put(L.base, L.ink(block, { color: COBALT, blur: .8, rough: 1.2, mottle: .2, voids: .3, voidT: .66, grain: .05, salt: 1 }), { mode: 'multiply' });

    // the robot: torso, neck and the folded paper head sit above the arms
    L.paint(L.over, x => { x.font = '500 11.5px Jost'; spaced(x, 'The coming convergence of', 29, 183, .3); spaced(x, 'foundation models and robotics', 29, 198, .3); x.font = '500 10px Jost'; spaced(x, 'SAN KALA', 29, 224, 3.4); }, { color: CREAM, blur: .35, rough: .3, bias: .1, salt: 90 });
    let n = 0;
    const o = (fn, col, ink = {}, p = {}) => L.paint(L.over, x => { RS(x); fn(x); }, { color: col, blur: .6, rough: .9, mottle: .12, salt: (n += 10), ...ink }, p);
    const hatch = (x, x0, y0, x1, y1, step, ang) => { x.save(); x.beginPath(); x.rect(x0, y0, x1 - x0, y1 - y0); x.clip(); x.lineWidth = 1.1; for (let k = -400; k < 400; k += step) { x.beginPath(); x.moveTo(x0 + k, y0); x.lineTo(x0 + k + Math.cos(ang) * 600, y0 + Math.sin(ang) * 600); x.stroke(); } x.restore(); };
    const torso = x => { x.beginPath(); x.moveTo(168, 410); x.lineTo(232, 410); x.lineTo(243, 488); x.quadraticCurveTo(200, 496, 157, 488); x.closePath(); };
    o(x => { torso(x); x.fill(); x.fillRect(189, 388, 22, 26); }, CREAM);
    o(x => { x.save(); torso(x); x.clip(); hatch(x, 214, 404, 250, 500, 4.2, PI / 2.6); x.restore(); hatch(x, 202, 388, 212, 412, 3.4, PI / 2.6); }, COBALT, { blur: .3, rough: .6 });
    o(x => { x.beginPath(); x.arc(200, 447, 10, 0, TAU); x.fill(); }, VERM);
    o(x => { x.lineWidth = 1.2; x.beginPath(); x.arc(200, 447, 5.5, 0, TAU); x.stroke(); }, CREAM, { blur: .3, rough: .5 });
    // head: front face (paper), top face (hatched), side face (cobalt, outlined by a carved line), folded corner
    const front = x => { x.beginPath(); x.moveTo(152, 304); x.lineTo(214, 304); x.lineTo(240, 330); x.lineTo(240, 392); x.lineTo(152, 392); x.closePath(); };
    o(x => { front(x); x.fill(); x.beginPath(); x.moveTo(152, 304); x.lineTo(214, 304); x.lineTo(226, 291); x.lineTo(168, 291); x.closePath(); x.fill(); }, CREAM);
    o(x => { x.save(); x.beginPath(); x.moveTo(152, 304); x.lineTo(214, 304); x.lineTo(226, 291); x.lineTo(168, 291); x.closePath(); x.clip(); hatch(x, 150, 288, 230, 306, 3.6, PI / 2); x.restore(); }, COBALT, { blur: .3, rough: .6 });
    o(x => { x.lineWidth = 1.3; x.beginPath(); x.moveTo(240, 330); x.lineTo(256, 316); x.lineTo(256, 378); x.lineTo(240, 392); x.moveTo(226, 291); x.lineTo(232, 285); x.lineTo(256, 316); x.stroke(); }, CREAM, { blur: .3, rough: .6 });
    o(x => { x.beginPath(); x.moveTo(214, 304); x.lineTo(240, 330); x.lineTo(219, 326); x.closePath(); x.fill(); }, CREAM);
    o(x => { x.lineWidth = 1.1; x.beginPath(); x.moveTo(214, 304); x.lineTo(240, 330); x.lineTo(219, 326); x.closePath(); x.stroke(); x.save(); x.beginPath(); x.moveTo(214, 304); x.lineTo(240, 330); x.lineTo(219, 326); x.closePath(); x.clip(); hatch(x, 210, 300, 242, 332, 3, PI / 4); x.restore(); }, COBALT, { blur: .3, rough: .6 });
    for (const ex of [178, 216]) { o(x => { x.lineWidth = 2.6; x.beginPath(); x.arc(ex, 346, 14.5, 0, TAU); x.stroke(); x.beginPath(); x.arc(ex - 3, 342, 6.6, 0, TAU); x.fill(); }, COBALT, { blur: .35, rough: .6 }); o(x => { x.beginPath(); x.arc(ex - 5, 340, 1.8, 0, TAU); x.fill(); }, CREAM, { blur: .2, rough: .3 }); }
    o(x => { x.beginPath(); x.ellipse(259, 348, 9, 14, 0, 0, TAU); x.fill(); }, VERM);
    o(x => { x.lineWidth = 1.1; x.beginPath(); x.ellipse(259, 348, 4.5, 8, 0, 0, TAU); x.stroke(); }, CREAM, { blur: .3, rough: .5 });
    o(x => { x.lineWidth = 1; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(160 + k * 3, 384 - k * 2); x.lineTo(176 + k * 6, 384 - k * 2); x.stroke(); } }, COBALT, { blur: .3, rough: .6 });
    wear(L, CREAM, .6);
    crease(L, 7, .2, .1);
    L.tex = paperTex(L, { mottle: .05, grain: .05, fibres: 300, fAlpha: .07 });
  },
  live: { box: [0, 214, 400, 340], fps: 20, draw(ctx, t) { ctx.save(); RS(ctx); ARMS.forEach(a => arm(ctx, a, t)); ctx.restore(); } },
};
