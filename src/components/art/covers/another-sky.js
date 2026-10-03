// Another Sky — art-deco railway lithograph, looking down the axis of the cylinder.
// Living detail: clouds drift down the inside of the world.
import { PI, TAU, DW, DH, lerp, clamp, smooth, pathPts, glyphStrokes, nibPen, spaced, paperTex } from './kit.js';

const CREAM = '#efe3c6', NAVY = '#1b2743', TEAL = '#2b6b68', DTEAL = '#22504e', SEA = '#5f9f92', SAND = '#e2bd74', CORAL = '#de6848', GOLD = '#d8a13c', SKY = '#a9cfc5', OLIVE = '#86955a';
const VP = [200, 300], FOC = 150, YV = .46, ZF = 5.4, IMG = [12, 12, 376, 440];
// The viewer floats a little above the valley floor, so the far side of the world arches overhead.
const P = (th, z, h = 1) => [VP[0] + FOC * h * Math.cos(th) / z, VP[1] + FOC * (h * Math.sin(th) - YV) / z];
const CAP = [VP[0], VP[1] - FOC * YV / ZF];
function band(x, th0, th1, z0, z1, h = 1) {
  const n = Math.max(2, Math.ceil(Math.abs(th1 - th0) / .035));
  let p = P(th0, z0, h); x.moveTo(p[0], p[1]);
  for (let i = 1; i <= n; i++) { p = P(th0 + (th1 - th0) * i / n, z0, h); x.lineTo(p[0], p[1]); }
  for (let i = n; i >= 0; i--) { p = P(th0 + (th1 - th0) * i / n, z1, h); x.lineTo(p[0], p[1]); }
  x.closePath();
}
const imgClip = x => x.rect(...IMG);
const LAND = [0, 2, 4].map(k => [PI / 3 + k * PI / 3, PI / 3 + (k + 1) * PI / 3]);
const WIN = [1, 3, 5].map(k => [PI / 3 + k * PI / 3, PI / 3 + (k + 1) * PI / 3]);

export default {
  seed: 17, still: 14, fonts: ['josefin-sans-600', 'josefin-sans-700'],
  build(L) {
    const b = L.bctx, r = L.rng;
    b.fillStyle = CREAM; b.fillRect(0, 0, DW, DH);
    let n = 0;
    const litho = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .5, rough: .5, mottle: .1, grain: .03, salt: ++n, ...o }, { clip: imgClip, ...p });
    // windows: the sky of this world is glass, bright with mirrored sunlight, banded toward the far cap
    const winClip = x => { for (const [a0, a1] of WIN) band(x, a0, a1, .12, ZF); };
    const landClip = x => { for (const [a0, a1] of LAND) band(x, a0, a1, .12, ZF); };
    litho(x => { winClip(x); x.fill(); }, SKY, { mottle: .12 });
    [[2.6, '#c9e1d6'], [1.75, '#dcebdc'], [1.25, '#ecf1df']].forEach(([f, col]) => litho(x => { x.beginPath(); x.arc(CAP[0], CAP[1], FOC / ZF * f * 2.2, 0, TAU); x.fill(); }, col, { mottle: .06 }, { clip: winClip }));
    litho(x => {
      for (let z = .2; z < ZF; z *= 1.24) for (const [a0, a1] of WIN) { x.lineWidth = Math.min(6, 1.6 / z); x.beginPath(); const pts = []; for (let i = 0; i <= 40; i++) pts.push(P(lerp(a0, a1, i / 40), z)); pathPts(x, pts); x.stroke(); }
      for (const [a0, a1] of WIN) for (const f of [1 / 3, 2 / 3]) { const th = lerp(a0, a1, f); x.beginPath(); const p0 = P(th, .12), p1 = P(th, ZF); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.lineWidth = .9; x.stroke(); }
    }, TEAL, { blur: .3, mottle: .05 }, { alpha: .8 });
    // land: patchwork fields, a winding river, a few towns, hedges between
    litho(x => { for (const [a0, a1] of LAND) band(x, a0, a1, .12, ZF); x.fill(); }, DTEAL);
    const cells = { [TEAL]: [], [SEA]: [], [OLIVE]: [], [SAND]: [], [SKY]: [], [CREAM]: [] };
    const roofs = [], trees = [], roads = [];
    LAND.forEach(([a0, a1], si) => {
      // uneven lanes and rows, so the patchwork reads as farmland rather than tiles
      const cuts = [0]; while (cuts[cuts.length - 1] < 1) cuts.push(Math.min(1, cuts[cuts.length - 1] + .08 + r() * .14));
      const lanes = cuts.length - 1; let river = (1 + si) % lanes;
      for (let z = .12; z < ZF;) {
        const z1 = z * (1.1 + r() * .14); if (r() < .3) river = clamp(river + (r() < .5 ? -1 : 1), 1, lanes - 2);
        for (let ln = 0; ln < lanes; ln++) {
          const t0 = lerp(a0, a1, cuts[ln]) + .005, t1 = lerp(a0, a1, cuts[ln + 1]) - .005;
          let col = r() < .3 ? TEAL : r() < .45 ? SEA : r() < .5 ? OLIVE : SAND;
          if (ln === river) col = SKY;
          else if (r() < .05) { col = CREAM; for (let q = 0; q < 6; q++) roofs.push([lerp(t0, t1, .12 + r() * .76), z * (1.02 + r() * .08)]); }
          else if (col === TEAL && r() < .5) for (let q = 0; q < 5; q++) trees.push([lerp(t0, t1, .15 + r() * .7), lerp(z, z1, .15 + r() * .7)]);
          cells[col].push([t0, t1, z * 1.01, z1 * .99]);
        }
        z = z1;
      }
      roads.push(lerp(a0, a1, cuts[(lanes * .5) | 0]));
    });
    for (const col of [TEAL, SEA, OLIVE, SAND, SKY, CREAM]) litho(x => { for (const c of cells[col]) band(x, ...c); x.fill(); }, col, { mottle: .14 });
    litho(x => { for (const [th, z] of roofs) { const p = P(th, z), s = 2.4 / z; x.fillRect(p[0] - s * .6, p[1] - s * .6, s * 1.2, s * 1.2); } }, CORAL, { blur: .2, rough: .2 });
    litho(x => { for (const [th, z] of trees) { const p = P(th, z), s = 1.5 / z; x.beginPath(); x.arc(p[0], p[1], Math.min(6, s), 0, TAU); x.fill(); } }, DTEAL, { blur: .2, rough: .3 });
    litho(x => { for (const th of roads) { const pts = []; for (let z = .12; z < ZF; z *= 1.05) pts.push(P(th, z)); x.lineWidth = .9; x.beginPath(); pathPts(x, pts); x.stroke(); } }, CREAM, { blur: .2, rough: .3 }, { alpha: .85 });
    // rims where land meets glass
    litho(x => { for (let k = 0; k < 6; k++) { const th = PI / 3 + k * PI / 3; band(x, th - .018, th + .018, .12, ZF); } x.fill(); }, SAND, { mottle: .1 });
    // atmosphere: litho stipple thickening toward the far end
    litho(x => {
      const rmin = FOC / ZF;
      for (let k = 0; k < 42000; k++) { const px = IMG[0] + r() * IMG[2], py = IMG[1] + r() * IMG[3]; const rho = Math.hypot(px - CAP[0], py - CAP[1]); const p = Math.pow(1 - smooth(rmin, 190, rho), 1.8) * .92; if (r() < p) { x.beginPath(); x.arc(px, py, .45 + r() * .3, 0, TAU); x.fill(); } }
    }, SKY, { blur: 0, mottle: 0, grain: 0 }, { clip: landClip });
    // the far end cap: a deco target of light
    litho(x => { x.beginPath(); x.arc(CAP[0], CAP[1], FOC / ZF + 1, 0, TAU); x.fill(); }, GOLD, { mottle: 0 });
    [[.8, CREAM], [.55, CORAL], [.34, CREAM], [.16, GOLD]].forEach(([f, col]) => litho(x => { x.beginPath(); x.arc(CAP[0], CAP[1], FOC / ZF * f, 0, TAU); x.fill(); }, col, { mottle: 0 }));

    // frame, band and lettering
    L.paint(L.over, x => { x.lineWidth = 1.3; x.strokeRect(IMG[0], IMG[1], IMG[2], IMG[3]); x.fillRect(12, 458, 376, 130); }, { color: NAVY, blur: .4, rough: .5, mottle: .12, salt: 30 });
    const g = glyphStrokes('ANOTHER SKY', { x: 200, y: 545, size: 36, align: 'center', xs: 1.12, track: .17, seed: 3 });
    L.paint(L.over, x => nibPen(x, g.strokes, { W: 36 * .21, angle: 0, min: 1.55, step: .5 }), { color: CREAM, blur: .4, rough: .45, salt: 31 });
    L.paint(L.over, x => { x.font = '700 8.4px "Josefin Sans"'; spaced(x, 'WALK INSIDE AN O’NEILL CYLINDER', 200, 489, 2.6, 'center'); }, { color: GOLD, blur: .3, rough: .25, bias: .12, salt: 32 });
    L.paint(L.over, x => { x.font = '600 7.2px "Josefin Sans"'; spaced(x, 'DYSONSWARM.COM', 200, 572, 3.2, 'center'); }, { color: SAND, blur: .3, rough: .25, bias: .14, salt: 33 });
    L.paint(L.over, x => { x.fillRect(150, 556, 100, .8); }, { color: GOLD, blur: .2, rough: .2, salt: 34 });
    L.tex = paperTex(L, { mottle: .05, grain: .05, fibres: 300, fAlpha: .07 });
  },
  live: {
    box: IMG, fps: 15,
    draw(ctx, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(...IMG); ctx.clip();
      const N = 11, Pd = 48;
      for (let k = 0; k < N; k++) {
        const f = (t / Pd + k / N) % 1, z = .36 * Math.pow(ZF * .8 / .36, f);
        const s = LAND[k % 3], th = lerp(s[0], s[1], .2 + .6 * ((k * .618) % 1)), h = .78 + .08 * ((k * .37) % 1);
        const a = smooth(0, .05, f) * (1 - smooth(.62, .96, f)); if (a <= 0) continue;
        const [cx, cy] = P(th, z, h), sz = FOC / z * .07;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(th - PI / 2); ctx.globalAlpha = a;
        const puffs = [[-1.5, .12, .48], [-.95, -.2, .66], [-.25, -.52, .86], [.55, -.36, .74], [1.2, -.02, .56], [1.62, .2, .36], [.1, .08, .7], [-.6, .22, .5], [.85, .22, .46]];
        const shape = (dy = 0) => { ctx.beginPath(); for (const [px, py, pr] of puffs) { ctx.moveTo((px + pr) * sz, (py + dy) * sz); ctx.arc(px * sz, (py + dy) * sz, pr * sz, 0, TAU); } };
        ctx.fillStyle = SKY; shape(.16); ctx.fill();
        ctx.fillStyle = CREAM; shape(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    },
  },
};
