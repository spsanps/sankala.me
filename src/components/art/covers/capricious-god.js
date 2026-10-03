// How to Please a Capricious God — Polish poster school: gouache on a dark ground.
// Living detail: the eye's gaze wanders.
import { TAU, DW, DH, bez, cat, clamp, pathPts, resample, wobble, brush, glyphStrokes, spaced, wear, paperTex } from './kit.js';

const GROUND = '#2b1713', BONE = '#e9dcc2', VERM = '#d4462a', NIGHT = '#170b09', OLIVE = '#7f8c3b';
const UL = bez([-14, 246], [60, 130], [300, 70], [414, 236], 60);
const LL = bez([414, 236], [320, 330], [90, 352], [-14, 246], 60);
// The eye runs off both edges; its clip path is held just inside the sheet
// (paths reaching past the canvas trip a Chromium clipping bug).
const ALMOND = cat(UL, LL.slice(1)).map(([x, y]) => [clamp(x, .5, 399.5), y]);
const almond = x => pathPts(x, ALMOND, true);
const IC = [200, 226], IR = 104;
const seg = (a, b, amp, s) => wobble(resample([a, b], 5), amp, .03, s);

export default {
  seed: 11, still: 6.5, fonts: ['archivo-600'],
  build(L) {
    const b = L.bctx, r = L.rng;
    b.fillStyle = GROUND; b.fillRect(0, 0, DW, DH);
    for (const [col, n, a, salt] of [['#3d2119', 26, .55, 1], ['#1e0f0c', 18, .5, 2], ['#4a291f', 10, .35, 3]]) {
      L.paint(L.base, x => {
        for (let k = 0; k < n; k++) {
          const y = r() * 640 - 20, len = 140 + r() * 320, x0 = r() * 520 - 140, ang = (r() - .5) * .14;
          x.lineWidth = 18 + r() * 46; x.beginPath(); pathPts(x, seg([x0, y], [x0 + len * Math.cos(ang), y + len * Math.sin(ang)], 3, k + salt * 40)); x.stroke();
        }
      }, { color: col, blur: 2.2, rough: .9, brushy: .8, mottle: .4, salt }, { alpha: a });
    }
    // sclera, painted, with shading toward the corners and a few veins
    L.paint(L.base, x => { almond(x); x.fill(); }, { color: BONE, blur: 1.6, rough: 1, mottle: .1, brushy: .07, salt: 4 });
    L.paint(L.base, x => { x.beginPath(); x.ellipse(14, 246, 92, 66, 0, 0, TAU); x.ellipse(388, 238, 96, 66, 0, 0, TAU); x.fill(); }, { color: '#c39783', feather: 14 }, { alpha: .65, clip: almond });
    L.paint(L.base, x => { x.lineWidth = 9; x.beginPath(); pathPts(x, LL.map(([px, py]) => [px, py - 4])); x.stroke(); }, { color: '#c9a48d', feather: 6 }, { alpha: .45, clip: almond });
    L.paint(L.base, x => {
      const veins = [];
      for (let k = 0; k < 14; k++) {
        const left = k % 2 === 0, sx = left ? 4 + r() * 20 : 396 - r() * 20, sy = 236 + (r() - .5) * 40, len = 40 + r() * 50, ang = (left ? 0 : Math.PI) + (r() - .5) * .9;
        const main = wobble(resample([[sx, sy], [sx + Math.cos(ang) * len, sy + Math.sin(ang) * len]], 2), 2.2, .12, k); veins.push(main);
        const m = main[(main.length * .55) | 0], a2 = ang + (r() - .5) * 1.4; veins.push(wobble(resample([m, [m[0] + Math.cos(a2) * len * .4, m[1] + Math.sin(a2) * len * .4]], 2), 1.2, .15, k + 50));
      }
      brush(x, veins, { w: 1, taper: [3, 14], wob: .2, seed: 9 });
    }, { color: '#a8443a', blur: .4, rough: .5, salt: 5 }, { alpha: .55, clip: almond });

    // the iris lives on its own sheet so the gaze can wander
    const iris = L.canvas(); L.iris = iris;
    const ic = (fn, o, p) => L.put(iris, L.ink(L.mask(fn), o), p);
    ic(x => { x.beginPath(); x.arc(IC[0], IC[1], IR, 0, TAU); x.fill(); }, { color: VERM, blur: 1.2, rough: .8, mottle: .22, salt: 6 });
    for (const [col, n, a, w0, salt] of [['#f08b4a', 170, .55, 1.4, 7], ['#8c2414', 160, .5, 1.25, 8], ['#ffb46c', 60, .45, .8, 9]]) {
      ic(x => {
        for (let k = 0; k < n; k++) {
          const ang = r() * TAU, r0 = 43 + r() * 12, r1 = 68 + r() * 32, a1 = ang + (r() - .5) * .1;
          x.lineWidth = w0 * (.5 + r()); x.beginPath();
          pathPts(x, wobble(resample([[IC[0] + Math.cos(ang) * r0, IC[1] + Math.sin(ang) * r0], [IC[0] + Math.cos(a1) * r1, IC[1] + Math.sin(a1) * r1]], 1.5), .9, .2, k + salt * 300)); x.stroke();
        }
      }, { color: col, blur: .5, rough: .6, salt }, { alpha: a });
    }
    ic(x => { for (let k = 0; k < 28; k++) { const ang = r() * TAU, rr = 58 + r() * 28; x.beginPath(); x.ellipse(IC[0] + Math.cos(ang) * rr, IC[1] + Math.sin(ang) * rr, 2 + r() * 4.5, 1 + r() * 2, ang, 0, TAU); x.fill(); } }, { color: '#6b1a10', blur: .8, rough: .8, salt: 10 }, { alpha: .6 });
    ic(x => { x.lineWidth = 13; x.beginPath(); x.arc(IC[0], IC[1], IR - 5, 0, TAU); x.stroke(); }, { color: '#5a150e', blur: 3, rough: .85, salt: 11 }, { alpha: .85 });
    ic(x => { x.lineWidth = 2.6; x.beginPath(); for (let k = 0; k <= 160; k++) { const a = k / 160 * TAU, rr = 55 + 3.5 * Math.sin(a * 14) + 2 * Math.sin(a * 5 + 1); const px = IC[0] + Math.cos(a) * rr, py = IC[1] + Math.sin(a) * rr; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }, { color: '#f6a65e', blur: .6, rough: .7, salt: 12 }, { alpha: .75 });
    ic(x => { x.beginPath(); x.arc(IC[0], IC[1], 40, 0, TAU); x.fill(); }, { color: '#1a0b08', blur: 1.2, rough: .9, salt: 13 });
    // catchlight: a four-pane window reflected in the cornea, plus a small bounce light
    ic(x => { x.save(); x.translate(IC[0] - 27, IC[1] - 28); x.rotate(-.2); for (const [px, py] of [[-13, -12.5], [1.4, -12.5], [-13, 1.6], [1.4, 1.6]]) { x.beginPath(); x.roundRect(px, py, 11.6, 11, 3.2); x.fill(); } x.restore(); x.beginPath(); x.ellipse(IC[0] + 22, IC[1] + 21, 4.5, 3, -.5, 0, TAU); x.fill(); }, { color: '#f4ead6', blur: .7, rough: .6, salt: 14 });

    // lids and the little visitor live above the iris
    L.paint(L.over, x => { x.lineWidth = 30; x.beginPath(); pathPts(x, UL.map(([px, py]) => [px, py + 7])); x.stroke(); }, { color: NIGHT, feather: 9 }, { alpha: .55, clip: almond });
    L.paint(L.over, x => brush(x, [bez([18, 214], [90, 96], [290, 44], [394, 198], 50)], { w: 4.2, taper: [7, 7], wob: 1.2, seed: 4 }), { color: '#55302a', blur: .8, rough: .7, brushy: .4, salt: 15 });
    L.paint(L.over, x => brush(x, [UL], { w: 13, taper: [9, 7], wob: 1.4, vary: .25, seed: 5 }), { color: NIGHT, blur: 1, rough: .8, brushy: .3, salt: 16 });
    L.paint(L.over, x => brush(x, [UL.slice(8, 53).map(([px, py]) => [px, py + 6.5])], { w: 3, taper: [8, 8], wob: .6, seed: 6 }), { color: '#b64a39', blur: .6, rough: .6, salt: 17 }, { alpha: .9 });
    L.paint(L.over, x => brush(x, [LL], { w: 5, taper: [10, 10], wob: 1, seed: 7 }), { color: NIGHT, blur: .8, rough: .8, brushy: .3, salt: 18 });
    L.paint(L.over, x => brush(x, [LL.slice(6, 55).map(([px, py]) => [px, py - 5])], { w: 2.6, taper: [8, 8], wob: .6, seed: 8 }), { color: '#c88a72', blur: .6, rough: .6, salt: 19 }, { alpha: .8 });

    const ai = LL.reduce((bi, p, i) => Math.abs(p[0] - 258) < Math.abs(LL[bi][0] - 258) ? i : bi, 0);
    const ax = LL[ai][0], ay = LL[ai][1] - 6;
    L.paint(L.over, x => { x.beginPath(); x.ellipse(ax + 2, ay + 1, 12, 2.6, 0, 0, TAU); x.fill(); }, { color: NIGHT, feather: 1.6 }, { alpha: .4 });
    L.paint(L.over, x => { x.lineWidth = 3.4; x.beginPath(); x.moveTo(ax - 3.5, ay - 8); x.lineTo(ax - 4.5, ay); x.moveTo(ax + 4, ay - 8); x.lineTo(ax + 5, ay); x.stroke(); }, { color: '#3b4719', blur: .4, rough: .4, salt: 20 });
    const body = x => { x.beginPath(); x.moveTo(ax - 8.5, ay - 7); x.bezierCurveTo(ax - 11, ay - 25, ax - 7.5, ay - 37, ax + 1, ay - 37); x.bezierCurveTo(ax + 9.5, ay - 37, ax + 12, ay - 25, ax + 9.5, ay - 7); x.bezierCurveTo(ax + 6, ay - 3.5, ax - 5, ay - 3.5, ax - 8.5, ay - 7); };
    L.paint(L.over, x => { body(x); x.fill(); }, { color: OLIVE, blur: .6, rough: .6, mottle: .2, salt: 21 });
    L.paint(L.over, x => { x.beginPath(); x.ellipse(ax + 9, ay - 18, 7, 20, .1, 0, TAU); x.fill(); }, { color: '#55622a', feather: 2.5 }, { alpha: .8, clip: body });
    L.paint(L.over, x => { brush(x, [[[ax + 6, ay - 25], [ax + 12, ay - 36], [ax + 15, ay - 49]]], { w: 3.1, taper: [1, 2], seed: 10 }); x.beginPath(); x.arc(ax + 15.3, ay - 50.5, 2.3, 0, TAU); x.fill(); brush(x, [[[ax - 7, ay - 24], [ax - 11, ay - 17], [ax - 12, ay - 11]]], { w: 2.8, taper: [1, 2], seed: 11 }); }, { color: OLIVE, blur: .4, rough: .4, salt: 22 });
    L.paint(L.over, x => { x.beginPath(); x.arc(ax + .5, ay - 26, 5.2, 0, TAU); x.fill(); }, { color: '#f2ead8', blur: .4, rough: .3, salt: 23 });
    L.paint(L.over, x => { x.beginPath(); x.arc(ax + 2, ay - 28.2, 2.3, 0, TAU); x.fill(); }, { color: '#15100c' });

    [['HOW TO PLEASE', 24, 438, BONE], ['A CAPRICIOUS', 36, 490, BONE], ['GOD', 76, 578, VERM]].forEach(([txt, size, y, col], li) => {
      const g = glyphStrokes(txt, { x: 28, y, size, track: .2, jrot: .05, jy: .035, js: .04, seed: 20 + li });
      L.paint(L.over, x => brush(x, g.strokes, { w: size * .15, taper: [1.6, 2.2], wob: size * .012, wobF: .08, vary: .2, nib: -.6, nibMin: .62, seed: 30 + li }), { color: col, blur: .9, rough: .9, brushy: .3, mottle: .12, salt: 40 + li });
    });
    L.paint(L.over, x => { x.font = '600 8.5px Archivo'; spaced(x, 'PAPER ROBOTS', 372, 552, 1.6, 'right'); spaced(x, 'A FILM · 2026', 372, 566, 1.6, 'right'); }, { color: BONE, blur: .35, rough: .3, bias: .12, salt: 44 }, { alpha: .85 });
    wear(L, '#cfc1a2', .5);
    L.tex = paperTex(L, { mottle: .06, grain: .06, fibres: 380, fAlpha: .08 });
  },
  live: {
    box: [0, 70, 400, 290], fps: 20,
    draw(ctx, t, L) {
      const ph = (t % 18) / 18 * TAU;
      const dx = 15 * Math.sin(ph) + 5 * Math.sin(2 * ph + 1.3);
      const dy = 5 * Math.sin(ph + .9) + 3 * Math.cos(3 * ph) + 9 * Math.pow(Math.max(0, Math.sin(ph - 2.2)), 6);
      ctx.save(); ctx.beginPath(); almond(ctx); ctx.clip(); ctx.drawImage(L.iris, dx, dy, DW, DH); ctx.restore();
    },
  },
};
