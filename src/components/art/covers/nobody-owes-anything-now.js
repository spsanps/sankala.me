// Nobody Owes Anything Now — a sgraffito slab: white slip brushed over red earthenware and
// scratched through. The habitat seen end-on, a ring of land with everything standing on its
// inside, the house with POTTERY on the roof at the bottom, the orchard hanging overhead, and
// at the middle, where nothing weighs anything, a cup. The same hand as the poem's figure
// (src/pages/notes/nobody-owes-anything-now/art/). No living detail: the slab is still.
import { DW, DH, glyphStrokes, arcPts, wobble, resample, bez } from './kit.js';
import { buildSurface, lightFlat, pnoise, pfbm, clamp, smooth, TAU } from '../../../pages/notes/nobody-owes-anything-now/art/sgraffito.js';

const C = [200, 332], RG = 124, RO = 137;           // the ring: ground on the inside, the shell outside
const wob = (p, amp, seed, step = 1.5) => wobble(resample(p, step), amp, .07, seed);
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];

// A frame standing on the inside of the ring at angle th (0 = the bottom, turning clockwise):
// local x along the ground, local y up toward the middle.
function at(th) {
  const g = [C[0] - Math.sin(th) * RG, C[1] + Math.cos(th) * RG], up = [Math.sin(th), -Math.cos(th)], right = [Math.cos(th), Math.sin(th)];
  const P = ([x, y]) => [g[0] + right[0] * x + up[0] * y, g[1] + right[1] * x + up[1] * y];
  return { P, lines: s => s.map(p => p.map(P)), path: (c, fn) => { c.save(); c.transform(right[0], right[1], -up[0], -up[1], g[0], g[1]); fn(c); c.restore(); } };
}

function cuts(a) {
  // a ruled frame inside the brushed edge
  a.line([wob(rect(28, 28, DW - 28, DH - 28), .5, 1, 2)], 1.9, { seed: 2, taper: [0, 0] });
  // the title, scratched with a stylus in two lines
  for (const [text, y, seed] of [['NOBODY OWES', 92, 3], ['ANYTHING NOW', 140, 4]]) {
    const g = glyphStrokes(text, { x: DW / 2, y, size: 33, align: 'center', track: .17, jrot: .03, jy: .025, js: .03, seed });
    a.line(g.strokes, 3.5, { seed: seed + 10, vary: .22, wob: .5 });
  }
  const by = glyphStrokes('A POEM BY SAN KALA', { x: DW / 2, y: 540, size: 11.5, align: 'center', track: .3, jrot: .03, jy: .03, seed: 5 });
  a.line(by.strokes, 1.9, { seed: 15, vary: .2 });

  // the shell of the habitat, scraped back to the clay, with a ring scratched round outside it
  a.scrape(c => { c.arc(C[0], C[1], RO, 0, TAU); c.arc(C[0], C[1], RG, 0, TAU, true); }, .7, { seed: 20 });
  a.line([wob(arcPts(C[0], C[1], RO + 7, RO + 7, 0, TAU, 160), .35, 21)], 1.5, { seed: 22, taper: [0, 0] });

  // the house at the bottom, POTTERY on its roof
  const h = at(0);
  a.line(h.lines([rect(-22, 0, 22, -22), [[-28, -22], [-15, -40], [15, -40], [28, -22], [-28, -22]]].map(p => p.map(([x, y]) => [x, -y]))), 1.7, { seed: 30 });
  const g = glyphStrokes('POTTERY', { x: 0, y: 26.5, size: 7.2, align: 'center', track: .14, seed: 6 });
  a.line(g.strokes.map(s => s.map(([x, y]) => h.P([x, 51.5 - y]))), 1.15, { seed: 31, vary: .1 });
  a.scrape(c => h.path(c, x => x.rect(-4, -15, 8, 15)), 1.57, { seed: 32 });
  a.scrape(c => h.path(c, x => { x.rect(-17, -16, 8, 7); x.rect(9, -16, 8, 7); }), 0, { seed: 33 });
  a.line(h.lines([[[11, 36], [11, 46], [17, 46], [17, 33]]]), 1.4, { seed: 34 });

  // the fields climb both ways from the door, ploughed along the curve of the world
  for (const [t0, t1] of [[.32, .78], [-.78, -.32]]) {
    for (let d = 3; d < 22; d += 3.6) {
      const p = arcPts(C[0], C[1], RG - d, RG - d, Math.PI / 2 + t0 + d * .004, Math.PI / 2 + t1 - d * .004, 40);
      a.line([wob(p, .35, d * 7 + t0 * 10)], 1.15, { seed: 40 + d, taper: [.5, .5] });
    }
    const hedge = arcPts(C[0], C[1], RG - 25, RG - 25, Math.PI / 2 + t0, Math.PI / 2 + t1, 40);
    a.line([wob(hedge, .4, 44 + t0)], 1.6, { seed: 45 });
    for (let k = 0; k < hedge.length; k += 3) a.line([[hedge[k]]], 2.6, { seed: 46 + k });
  }
  // the lake, to the right
  const lk = at(1.12);
  a.scrape(c => lk.path(c, x => x.ellipse(0, -6, 26, 6.4, 0, 0, TAU)), .1, { seed: 50 });
  a.reserve(c => lk.path(c, x => { for (let k = 0; k < 4; k++) x.rect(-17 + k * 9, -8 + (k % 2) * 3.2, 6, 1.1); }));
  // the woods, climbing the right side
  for (let k = 0; k < 7; k++) {
    const tr = at(1.52 + k * .085), hh = 18 + ((k * 7) % 5) * 3.5, w = hh * .3;
    a.scrape(c => tr.path(c, x => { x.moveTo(0, -hh); x.lineTo(w, -hh * .25); x.lineTo(1.4, -hh * .25); x.lineTo(1.4, 0); x.lineTo(-1.4, 0); x.lineTo(-1.4, -hh * .25); x.lineTo(-w, -hh * .25); x.closePath(); }), 1, { seed: 60 + k });
  }
  // the orchard overhead
  for (let k = 0; k < 5; k++) {
    const tr = at(Math.PI - .3 + k * .15);
    a.scrape(c => tr.path(c, x => { x.arc(0, -15, 7, 0, TAU); x.rect(-1.2, -9, 2.4, 9); }), .5, { seed: 70 + k });
    a.reserve(c => tr.path(c, x => { for (let f = 0; f < 4; f++) { const an = f * 1.7 + k; x.moveTo(Math.cos(an) * 3.6 + 1.1, -15 + Math.sin(an) * 3.6); x.arc(Math.cos(an) * 3.6, -15 + Math.sin(an) * 3.6, 1.1, 0, TAU); } }));
  }
  // the train, going round on the left
  for (let k = 0; k < 3; k++) {
    const t = at(-1.5 - k * .2), nose = k === 0;
    a.line(t.lines([nose ? [[-10, 2], [11, 2], [11, 14], [-4, 14], [-10, 8], [-10, 2]] : rect(-11, 2, 11, 14)]), 1.3, { seed: 80 + k });
    a.scrape(c => t.path(c, x => { for (let w = -7; w < 9; w += 5.2) x.rect(w, -11.5, 3.4, 4); x.arc(-6, -1.2, 1.8, 0, TAU); x.arc(6, -1.2, 1.8, 0, TAU); }), 0, { seed: 85 + k });
  }
  // empty houses up the left, and a lamp
  for (const th of [-2.25, -2.55]) {
    const e = at(th);
    a.line(e.lines([rect(-7, 0, 7, 10).map(([x, y]) => [x, y]), [[-9, 10], [0, 18], [9, 10]]]), 1.3, { seed: 90 + th });
    a.scrape(c => e.path(c, x => x.rect(-2.4, -7.5, 4.8, 4.5)), 0, { seed: 91 + th });
  }
  const lp = at(-.62);
  a.line(lp.lines([[[0, 0], [0, 22]]]), 1.4, { seed: 95 });
  a.scrape(c => lp.path(c, x => x.arc(0, -25, 3.2, 0, TAU)), 0, { seed: 96 });
  // in the middle, where nothing weighs anything: a cup
  const cx = C[0], cy = C[1] + 2, cw = 28, ch = 58, ry = 7.8;
  a.scrape(c => c.ellipse(cx, cy - ch / 2, cw - 3, ry - 1.6, 0, 0, TAU), 0, { seed: 100 });
  a.line([wob(arcPts(cx, cy - ch / 2, cw, ry, 0, TAU, 60), .3, 101, 1)], 2, { seed: 101 });
  a.line([wob([[cx - cw, cy - ch / 2], [cx - cw * .97, cy + ch / 2 - 2]], .4, 102), wob([[cx + cw, cy - ch / 2], [cx + cw * .97, cy + ch / 2 - 2]], .4, 103),
    wob(arcPts(cx, cy + ch / 2 - 2, cw * .97, ry, 0, Math.PI, 40), .3, 104, 1)], 2, { seed: 105 });
  a.line([wob(bez([cx - cw, cy - 16], [cx - cw - 22, cy - 18], [cx - cw - 22, cy + 15], [cx - cw, cy + 13], 30), .3, 106, 1)], 2.8, { seed: 107 });
  // its band: rails and a little house going round it too
  a.line([wob(arcPts(cx, cy + 10, cw * .985, ry, .15, Math.PI - .15, 30), .25, 108, 1)], 1.2, { seed: 108 });
  a.line([wob(arcPts(cx, cy + 14, cw * .98, ry, .15, Math.PI - .15, 30), .25, 109, 1)], 1.2, { seed: 109 });
  a.line([rect(cx - 7, cy - 2, cx + 4, cy + 8), [[cx - 9, cy - 2], [cx - 1.5, cy - 9], [cx + 6, cy - 2]]], 1.2, { seed: 110 });
  for (let k = 0; k < 4; k++) a.line([[[cx + 10 + k * 3.4, cy + 5 - (k % 2) * 3]]], 1.8, { seed: 111 + k });
}

// The slip was brushed on in broad diagonal strokes, short of the edges.
function slabSlip(x, y) {
  const u = (x * .8 + y * .6), v = (-x * .6 + y * .8);
  // the brush ends in streaks along its stroke, not in a torn edge
  const e = Math.min(x - 15, DW - 15 - x, y - 15, DH - 15 - y) + (pnoise(x / 40, y / 40, 3) - .5) * 5 + (pnoise(v / 1.6, u / 26, 4) - .5) * 4;
  const stroke = .94 + .14 * pfbm(v / 14, u / 70, 5, 3);
  return smooth(-.5, 2.5, e) * stroke;
}
function fingerprint(a) {
  a.press(c => { c.lineWidth = .65; c.strokeStyle = '#000'; for (let k = 1; k < 10; k++) { c.beginPath(); c.ellipse(352, 566, k * 1.3, k * 1.65, -.5, Math.PI * .1, TAU * .95); c.stroke(); } }, .45);
}

export default {
  seed: 97, still: 0, fonts: [],
  build(L) {
    const sf = buildSurface({
      W: L.W, H: L.H, scale: L.S, seed: 97, relief: .34, burrs: .9, wash: .45, specks: .6,
      draw: a => { cuts(a); fingerprint(a); },
      slip: slabSlip,
      // the slab is not quite flat, and its edges are rounded over
      extra: (x, y) => { const e = Math.min(x, DW - x, y, DH - y); return 2.2 * pfbm(x / 140, y / 140, 8, 2) - 9 * (1 - smooth(0, 9, e)) ** 2; },
    });
    const img = L.bctx.createImageData(L.W, L.H);
    // a little darker toward the edges, where the slab curls away from the light
    lightFlat(sf, img,
      (px, py) => { const x = px / L.S, y = py / L.S, e = Math.min(x, DW - x, y, DH - y); return .9 + .1 * smooth(0, 40, e) + .04 * clamp((DH - y) / DH); },
      (px, py) => { const x = px / L.S, y = py / L.S, d2 = ((x - 120) / 230) ** 2 + ((y - 170) / 300) ** 2; return .985 * Math.exp(-d2 * 1.6); });
    L.bctx.putImageData(img, 0, 0);
  },
};
