// A Clauiet Life — shin-hanga woodblock botanical on washi.
// Living detail: a bee loops through the flowers.
import { PI, TAU, DW, DH, mulberry32, bez, brush, spaced, paperTex } from './kit.js';

const SUMI = '#29251f', INDIGO = '#2d3d6c', PERS = '#dd7337', PINK = '#e6a09d', ROSE = '#c25f74', LEAF = '#6d8a49', OCHRE = '#d4a24a', PALE = '#efd98f', SEAL = '#bf3a2b', WASHI = '#eee4cb';
const FL = [[118, 268, 46, .2, .9, PINK], [232, 338, 38, -.5, .68, 'white'], [78, 420, 34, .9, .56, PERS], [246, 214, 31, .15, .82, PERS], [158, 482, 33, -1.1, .62, PINK], [306, 430, 28, .6, .52, 'white'], [378, 552, 62, .35, .78, PERS]];
const STEMS = FL.map(([fx, fy], i) => { const bx = [74, 206, 40, 262, 146, 322, 360][i]; return bez([bx, 612], [bx + (fx - bx) * .2 + (i % 2 ? 22 : -18), 560], [fx + (i % 2 ? -14 : 16), fy + 120], [fx, fy + 4], 40); });
function petal(x, R) { x.moveTo(R * .2, R * .07); x.quadraticCurveTo(R * .55, R * .26, R * .96, R * .2); x.lineTo(R * 1.0, R * .12); x.lineTo(R * .93, R * .07); x.lineTo(R * 1.01, 0); x.lineTo(R * .93, -R * .07); x.lineTo(R * 1.0, -R * .12); x.lineTo(R * .96, -R * .2); x.quadraticCurveTo(R * .55, -R * .26, R * .2, -R * .07); x.closePath(); }
function head(x, f, fn) { const [cx, cy, R, rot, tilt] = f; x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(1, tilt); fn(x, R); x.restore(); }
const petals = (x, f, scale = 1) => head(x, f, (x, R) => { for (let k = 0; k < 8; k++) { x.save(); x.rotate(k * TAU / 8 + Math.sin(k * 2.3 + f[0]) * .06); x.scale(scale, scale); petal(x, R); x.restore(); } });
function leaf(origin, ang, len, seed) { // cosmos leaf: a rib with thread-like leaflets
  const r = mulberry32(seed), out = []; const rib = []; let a = ang, p = origin.slice();
  for (let i = 0; i <= 24; i++) { rib.push(p.slice()); a += (r() - .5) * .08 + .012; p = [p[0] + Math.cos(a) * len / 24, p[1] + Math.sin(a) * len / 24]; }
  out.push(rib);
  for (let i = 4; i < 24; i += 2) for (const side of [-1, 1]) {
    const q = rib[i], la = Math.atan2(rib[i + 1][1] - q[1], rib[i + 1][0] - q[0]) + side * (.7 + r() * .3), ll = len * .32 * (1 - i / 30) * (.7 + r() * .5);
    out.push(bez(q, [q[0] + Math.cos(la) * ll * .4, q[1] + Math.sin(la) * ll * .4], [q[0] + Math.cos(la + side * .25) * ll * .8, q[1] + Math.sin(la + side * .25) * ll * .8], [q[0] + Math.cos(la + side * .45) * ll, q[1] + Math.sin(la + side * .45) * ll], 10));
  }
  return out;
}

export default {
  seed: 41, still: 7, fonts: ['shippori-mincho-800'],
  build(L) {
    const b = L.bctx, r = L.rng;
    b.fillStyle = WASHI; b.fillRect(0, 0, DW, DH);
    let n = 0;
    const block = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .5, rough: .9, mottle: .22, wood: .12, salt: ++n, ...o }, { mode: 'multiply', ...p });
    const KENTO = { dx: .9, dy: -.7 };   // colour blocks sit slightly off the key block
    // bokashi: indigo wiped down from the top, persimmon glow rising from the ground
    block(x => { const g = x.createLinearGradient(0, 0, 0, 250); g.addColorStop(0, '#000'); g.addColorStop(.35, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, DW, 260); x.globalCompositeOperation = 'destination-out'; x.fillRect(298, 26, 74, 156); x.fillRect(321, 188, 28, 28); }, INDIGO, { blur: 0, wood: .04, streak: .05, brushy: .1, mottle: .32 });
    block(x => { const g = x.createLinearGradient(0, 600, 0, 470); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 460, DW, 140); }, PERS, { blur: 0, wood: .1, mottle: .28 });
    // stems and leaves
    const leaves = []; STEMS.forEach((st, i) => { for (const f of [.3, .52, .72]) { const p = st[(st.length * f) | 0]; const side = ((i + f * 10) | 0) % 2 ? 1 : -1; leaves.push(...leaf(p, -PI / 2 + side * (1.0 + r() * .5), 50 + r() * 30, i * 10 + f * 100)); } });
    block(x => { brush(x, STEMS, { w: 3.3, taper: [2, 6], wob: .5, seed: 3 }); brush(x, leaves, { w: 1.8, taper: [1, 5], wob: .3, seed: 4 }); }, LEAF, { blur: .35, rough: .6 }, KENTO);
    // petals in colour, with bokashi toward each flower's heart
    for (const col of [PINK, PERS]) block(x => { for (const f of FL) if (f[5] === col) { x.beginPath(); petals(x, f); x.fill(); } }, col, { wood: .18 }, KENTO);
    block(x => { for (const f of FL) if (f[5] === PINK) { x.beginPath(); petals(x, f, .55); x.fill(); } }, ROSE, { blur: 0, feather: 4.5 }, { mode: 'multiply', alpha: .7, ...KENTO });
    block(x => { for (const f of FL) if (f[5] === PERS) { x.beginPath(); petals(x, f, .5); x.fill(); } }, '#b4482a', { blur: 0, feather: 4.5 }, { mode: 'multiply', alpha: .55, ...KENTO });
    block(x => { for (const f of FL) if (f[5] === 'white') { x.beginPath(); petals(x, f, .5); x.fill(); } }, '#b9b0a0', { blur: 0, feather: 5 }, { mode: 'multiply', alpha: .4 });
    block(x => { for (const f of FL) head(x, f, (x, R) => { x.beginPath(); x.arc(0, 0, R * .24, 0, TAU); x.fill(); }); }, OCHRE, {}, KENTO);
    // key block: the carved sumi line
    block(x => {
      x.lineWidth = 1.25;
      for (const f of FL) { x.beginPath(); petals(x, f); x.stroke(); head(x, f, (x, R) => { x.lineWidth = 1; x.beginPath(); x.arc(0, 0, R * .24, 0, TAU); x.stroke(); for (let k = 0; k < 18; k++) { const a = k * 2.4, rr = Math.sqrt(k / 18) * R * .2; x.beginPath(); x.arc(Math.cos(a) * rr, Math.sin(a) * rr, .9, 0, TAU); x.fill(); } }); }
      brush(x, STEMS.map(s => s.map(([px, py]) => [px + 1.4, py])), { w: .7, taper: [3, 10], seed: 5 });
    }, SUMI, { blur: .4, rough: 1, wood: .05, mottle: .1 });
    // a bud on a thin stem
    block(x => { x.beginPath(); x.ellipse(332, 300, 6, 9, .3, 0, TAU); x.ellipse(52, 316, 5, 8, -.4, 0, TAU); x.fill(); }, PERS, {}, KENTO);
    block(x => { brush(x, [bez([346, 612], [352, 520], [320, 400], [334, 310], 30), bez([30, 612], [24, 520], [62, 400], [50, 326], 30)], { w: 1.8, taper: [2, 4], seed: 6 }); }, LEAF, { blur: .35, rough: .6 }, KENTO);
    block(x => { x.lineWidth = .9; x.beginPath(); x.ellipse(332, 300, 6, 9, .3, 0, TAU); x.stroke(); x.beginPath(); x.ellipse(52, 316, 5, 8, -.4, 0, TAU); x.stroke(); }, SUMI, { blur: .3, rough: .8 });
    // cartouche and date seal
    block(x => x.fillRect(300, 28, 70, 152), PALE, { wood: .06, mottle: .15 });
    block(x => { x.lineWidth = 2.4; x.strokeRect(300, 28, 70, 152); x.lineWidth = .8; x.strokeRect(304.5, 32.5, 61, 143); }, INDIGO, { blur: .35, rough: .7 });
    block(x => { x.save(); x.translate(335, 44); x.rotate(PI / 2); x.font = '800 18.5px "Shippori Mincho"'; x.textBaseline = 'middle'; x.fillText('A Clauiet Life', 0, 0); x.restore(); }, SUMI, { blur: .35, rough: .5 });
    block(x => { x.fillRect(323, 190, 24, 24); }, SEAL, { blur: .5, rough: 1.1, voids: .4 });
    L.paint(L.base, x => { x.font = '800 8.5px "Shippori Mincho"'; spaced(x, '20', 335, 200.5, .3, 'center'); spaced(x, '26', 335, 210.5, .3, 'center'); }, { color: WASHI, blur: .3, rough: .5, salt: 70 });

    // the bee, cut as its own little block (two wing poses, facing either way)
    L.bees = [];
    for (const face of [1, -1]) for (const pose of [0, 1]) {
      const c = L.canvas();
      const bp = (fn, col, o = {}) => L.put(c, L.ink(L.mask(x => { x.translate(200, 300); x.scale(face * 1.75, 1.75); fn(x); }), { color: col, blur: .35, rough: .6, salt: 80 + pose, ...o }));
      const wing = x => { x.save(); x.translate(-1, -5); x.rotate(pose ? -.95 : -.45); x.beginPath(); x.ellipse(-6, 0, 8, 3.6, 0, 0, TAU); x.restore(); x.save(); x.translate(2, -5); x.rotate(pose ? -1.25 : -.7); x.beginPath(); x.ellipse(-5, 0, 6.5, 3, 0, 0, TAU); x.restore(); };
      bp(x => { wing(x); x.fill(); }, '#f6f1e2', { alpha: .9 });
      bp(x => { x.beginPath(); x.ellipse(0, 0, 8.5, 5.6, .08, 0, TAU); x.fill(); }, OCHRE);
      bp(x => { x.save(); x.beginPath(); x.ellipse(0, 0, 8.5, 5.6, .08, 0, TAU); x.clip(); for (const sx of [-4.2, -.6, 3]) x.fillRect(sx, -7, 1.9, 14); x.restore(); x.beginPath(); x.arc(9.6, -.6, 3.6, 0, TAU); x.fill(); x.lineWidth = .8; x.beginPath(); x.moveTo(11, -3.4); x.quadraticCurveTo(13, -7, 15.5, -7.6); x.moveTo(10, -3.6); x.quadraticCurveTo(11, -7.5, 13, -8.6); x.stroke(); x.beginPath(); x.moveTo(-8.6, .4); x.lineTo(-11.6, 1.2); x.lineTo(-8.4, 1.8); x.fill(); for (const lx of [-2, 1.5, 4.5]) { x.beginPath(); x.moveTo(lx, 5); x.lineTo(lx - 1.2, 8.6); x.stroke(); } }, SUMI);
      bp(x => { x.lineWidth = .7; wing(x); x.stroke(); }, SUMI, { alpha: .8 });
      L.bees.push(c);
    }
    L.tex = paperTex(L, { mottle: .05, grain: .05, fibres: 350, fAlpha: .08, long: 140, longLen: 55, longAlpha: .09 });
  },
  live: {
    box: [118, 226, 262, 170], fps: 30,
    draw(ctx, t, L) {
      const Pd = 22, a = TAU * (t % Pd) / Pd;
      const x = 248 + 74 * Math.sin(a), y = 306 + 34 * Math.sin(2 * a + .6) + 3 * Math.sin(9 * a);
      const vx = Math.cos(a), face = vx >= 0 ? 0 : 2, pose = Math.floor(t * 9) % 2;
      const tilt = .25 * Math.cos(2 * a + .6) * Math.sign(vx);
      ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.drawImage(L.bees[face + pose], -200, -300, DW, DH); ctx.restore();
    },
  },
};
