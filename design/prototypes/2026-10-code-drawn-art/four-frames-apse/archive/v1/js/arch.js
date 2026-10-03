/* The apse in mosaic: the architecture, laid once for the whole screen.
   DESIGN
     The wall is lapis glass (#1d2f68 → #15224f toward the edges, lighter near the arch, as if lit by
     the gold), strewn with gold stars like the vault of Galla Placidia: eight-pointed stars of a
     centre stone and eight cut pieces, smaller four-pointed ones, and single gold stones.
     The archivolt wraps the conch: a dark outline row against the conch, a gold row, a band of
     gems (ruby, emerald, sapphire, alternately oval and square) on gold with a pearl between each
     pair, another gold row, and a cream marble edge.
     At the conch's floor a cornice band crosses the whole wall: dark, gold, two rows of lapis that
     carry the inscription (the place and the hour, in HTML), gold, dark.
   Materials (for the glint): gold, glass (the lapis and the gems: a weaker, whiter sparkle) and
   matte stone (marble, outlines). Every gold and glass stone is set at a slightly different angle. */
import { mix, clamp, smooth, rgb, fbm, mulberry32 } from './core.js';
import { RI, RO, B, C, conchPath, archivoltPath, archDepth, archParam, archPoint } from './geom.js';

export const ARCH_PAL = {
  lapis: rgb('#213573'), lapisLit: rgb('#2c4590'), lapisDeep: rgb('#152250'), lapisBand: rgb('#1b2c63'),
  gold: [rgb('#cfa148'), rgb('#ddb75e'), rgb('#b5883a'), rgb('#e6c672')],
  outline: rgb('#231d18'), cream: rgb('#efe5cc'), creamShade: rgb('#d8cbac'), red: rgb('#9e2f2a'),
  gems: [rgb('#b8262f'), rgb('#257a58'), rgb('#2a56a8')], pearl: rgb('#f4efe2'),
  grout: rgb('#4a4438'),
};
export const MAT = { NONE: 0, GOLD: 1, GLASS: 2, SILVER: 3, GEM: 4 };

const GEM_STEP = 74;     // units between gem centres along the archivolt

/** Regions for the whole screen. `ex`: rectangles (units) where no stars go (the nav). */
export function archRegions(G) {
  const F = G.F, X0 = -G.cx / G.u - 20, X1 = (G.w - G.cx) / G.u + 20, Y0 = -G.cy / G.u - 20, Y1 = (G.h - G.cy) / G.u + 20;
  const gems = gemList(F);
  const P = ARCH_PAL;
  return [
    { name: 'wall', group: 'wall', clip: false, fine: 1.04, src: ['archivolt', 'cornice'], draw: c => c.rect(X0, Y0, X1 - X0, Y1 - Y0), fill: () => P.lapis },
    { name: 'cornice', group: 'cornice', clip: false, fine: .9, src: 'courses', draw: c => c.rect(X0, F, X1 - X0, C), fill: () => P.lapisBand },
    { name: 'conch', group: 'conch', clip: false, skip: true, draw: conchPath(F), fill: () => P.gold[0] },
    { name: 'archivolt', group: 'archivolt', clip: false, fine: .86, src: ['conch'], draw: archivoltPath(F), fill: () => P.gold[0] },
    { name: 'gems', group: 'archivolt', clip: false, fine: .62, src: 'self', draw: c => { for (const g of gems) gemPath(c, g); }, fill: () => P.gems[0] },
  ];
}
export const ARCH_OUTLINES = [
  { inside: ['archivolt', 'gems'], against: ['conch'] },
  { inside: ['cornice'], against: ['conch', 'archivolt', 'wall'] },
];

function gemList(F) {
  const total = Math.PI * (RI + B / 2) + 2 * F, n = Math.max(6, Math.round(total / GEM_STEP)), out = [];
  for (let i = 0; i < n; i++) {
    const f = (i + .5) / n, p = archPoint(f, F);
    if (p.y > F - 14) continue;
    out.push({ ...p, f, i, kind: i % 2, col: i % 3 });
  }
  return out;
}
function gemPath(c, g) {
  const a = Math.atan2(g.ny, g.nx);                      // radial direction
  if (g.kind === 0) { c.moveTo(g.x + 9 * Math.cos(a), g.y + 9 * Math.sin(a)); c.ellipse(g.x, g.y, 9, 14, a, 0, Math.PI * 2); c.closePath(); }
  else {                                                 // a square set on its point
    const r = 12.5;
    for (let k = 0; k < 4; k++) { const b = a + k * Math.PI / 2; const x = g.x + r * Math.cos(b), y = g.y + r * Math.sin(b); k ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath();
  }
}

/** Stones laid before the rows: the stars on the wall and the pearls between the gems (sheet px). */
export function archPreStones(G, q, s, panel, regionIndex, ex) {
  const rnd = mulberry32(31), out = [], F = G.F, P = ARCH_PAL;
  const toS = (x, y) => [(x - panel.x0) * q, (y - panel.y0) * q];
  const su = s / q;                                       // one stone, in units
  const X0 = -G.cx / G.u, X1 = (G.w - G.cx) / G.u, Y0 = -G.cy / G.u, Y1 = (G.h - G.cy) / G.u;
  const wall = regionIndex('wall'), av = regionIndex('archivolt');
  /* stars on a jittered grid */
  const step = Math.max(64, su * 11.5);
  for (let gy = Y0 + step * .4; gy < Y1; gy += step * .87) for (let gx = X0 + step * .3; gx < X1; gx += step) {
    const x = gx + (rnd() - .5) * step * .8 + ((Math.round(gy / step) % 2) * step * .5), y = gy + (rnd() - .5) * step * .6;
    const dArch = y < F ? (y < 0 ? Math.hypot(x, y) - RO : Math.abs(x) - RO) : 1e9;
    if (y < F + C + su * 2 && y > F - su * 2) continue;                                   // the cornice
    if (y < F && dArch < su * 2.6) continue;                                              // off the archivolt
    if (ex.some(r => x > r[0] && x < r[2] && y > r[1] && y < r[3])) continue;             // the nav
    const roll = rnd(), size = roll < .36 ? 2 : roll < .6 ? 1 : 0;
    const col = rnd() < .06 ? P.pearl : P.gold[(rnd() * 4) | 0], a0 = rnd() * Math.PI;
    const [sx, sy] = toS(x, y);
    const put = (dx, dy, l, w, a, c2 = col) => out.push({ x: sx + dx, y: sy + dy, a, l, w, reg: wall, extra: { col: c2, mat: c2 === P.pearl ? MAT.SILVER : MAT.GOLD, star: true } });
    put(0, 0, s * (size ? .86 : .7), s * (size ? .86 : .7), a0);
    if (size >= 1) for (let k = 0; k < 4; k++) { const b = a0 + k * Math.PI / 2; put(Math.cos(b) * s * .98, Math.sin(b) * s * .98, s * .78, s * .5, b); }
    if (size === 2) for (let k = 0; k < 4; k++) { const b = a0 + Math.PI / 4 + k * Math.PI / 2; put(Math.cos(b) * s * 1.02, Math.sin(b) * s * 1.02, s * .5, s * .4, b); }
  }
  /* a pearl between every pair of gems */
  const gems = gemList(F), total = Math.PI * (RI + B / 2) + 2 * F;
  for (let i = 0; i < gems.length; i++) {
    const g = gems[i], f = g.f + .5 / Math.max(6, Math.round(total / GEM_STEP));
    const p = archPoint(f, F); if (p.y > F - 10) continue;
    const [sx, sy] = toS(p.x, p.y);
    out.push({ x: sx, y: sy, a: Math.atan2(p.ny, p.nx), l: s * .8, w: s * .8, reg: av, extra: { col: P.pearl, mat: MAT.SILVER, pearl: true } });
  }
  return out;
}

/** Colour every architecture stone and give it a material. `su`: one stone in units. */
export function finishArch(stones, regions, G, su) {
  const P = ARCH_PAL, F = G.F, rnd = mulberry32(77);
  const gems = gemList(F);
  for (const t of stones) {
    if (t.col) continue;                                                        // stars and pearls keep theirs
    if (t.k === 0) { t.col = P.outline; t.mat = MAT.NONE; continue; }
    const r = regions[t.reg], x = t.ux, y = t.uy;
    if (r.name === 'wall') {
      // lighter near the arch (lit by the gold), deeper toward the edges and low on the wall
      const d = y < F ? (y < 0 ? Math.hypot(x, y) - RO : Math.abs(x) - RO) : (y - F - C) * 1.4 + 40;
      let c = mix(P.lapisLit, P.lapis, smooth(0, 150, d));
      c = mix(c, P.lapisDeep, smooth(150, 700, d) * .7 + smooth(.55, .8, fbm(x / 160, y / 160, 3, 3)) * .25);
      if (rnd() < .05) c = mix(c, rgb('#3a56a8'), .5); else if (rnd() < .05) c = mix(c, P.lapisDeep, .6);
      t.col = c; t.mat = MAT.GLASS;
    } else if (r.name === 'cornice') {
      const v = (y - F) / C;
      if (v < .2 || v > .8) { t.col = P.gold[(t.h * 4) | 0]; t.mat = MAT.GOLD; }
      else { t.col = mix(P.lapisBand, P.lapisDeep, .25 * t.h2); t.mat = MAT.GLASS; }
    } else if (r.name === 'gems') {
      let g = gems[0], bd = 1e9; for (const o of gems) { const dd = (o.x - x) ** 2 + (o.y - y) ** 2; if (dd < bd) { bd = dd; g = o; } }
      t.col = mix(P.gems[g.col], [255, 255, 255], t.h > .8 ? .18 : 0); t.mat = MAT.GEM;
    } else if (r.name === 'archivolt') {
      const d = archDepth(x, y < F ? y : Math.min(y, 0)) ;
      const dd = y >= 0 ? Math.abs(x) - RI : d;
      if (dd > B - su * 1.05) { t.col = mix(P.cream, P.creamShade, t.h2 * .6); t.mat = MAT.NONE; }
      else { t.col = P.gold[(t.h * 4) | 0]; t.mat = MAT.GOLD; }
    } else { t.col = P.lapis; t.mat = MAT.GLASS; }
    void archParam;
  }
  return stones;
}
