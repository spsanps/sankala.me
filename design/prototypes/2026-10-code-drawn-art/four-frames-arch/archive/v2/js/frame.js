/* Arched window mosaic: the frame.
   The marble frame and the sill are laid once and never change; only the view inside is re-laid
   for each place. The frame is lit by the room, so its colour stays the same whatever the hour
   or the place outside.
   DESIGN
     Marble #efe7d2 → #ddd0b3, sill #ebe2cb / front #cfc2a3, outline #2b2925, grout #ddd6c6.
     One row of gold glass tesserae (#d6aa48 / #e9c66c / #b8892f) runs round the arch, a little
     way in from the window: the one rich line in the frame.
     The outer edge is not a hard line: its outermost stones thin out, a few lie loose on a pale
     setting bed, and a handful are scattered on the plaster, like a panel still being laid.
     Dark outline rows only along the window's inner edge and the sill's top. */
import { mix, clamp, smooth, fbm, rgb } from './core.js';
import { CX, CY, R_OUT, SILL, PANEL, outerPath, innerPath, sillPath, outerDepth, innerDepth, frameParam } from './geom.js';

export const FRAME_PAL = {
  marble: rgb('#efe7d2'), marbleShade: rgb('#ddd0b3'), marbleWarm: rgb('#e6d6b6'), sill: rgb('#ebe2cb'), sillFront: rgb('#cfc2a3'),
  outline: rgb('#2b2925'), grout: rgb('#ddd6c6'), bed: rgb('#e2dacb'),
  gold: [rgb('#d6aa48'), rgb('#e9c66c'), rgb('#b8892f')],
};

export function frameRegions() {
  const P = FRAME_PAL;
  return [
    { name: 'frame', group: 'frame', draw: outerPath, clip: false, fine: 1, src: ['window'],
      fill: (x, y) => { const t = clamp(innerDepth(x, y) / (R_OUT - 430)); return mix(P.marble, P.marbleShade, .22 + .5 * Math.abs(t - .45) * 2); } },
    { name: 'window', group: 'window', draw: innerPath, clip: false, skip: true, fill: () => P.grout },
    { name: 'sill', group: 'sill', draw: sillPath, clip: false, fine: 1.05, src: ['window', 'frame'],
      fill: (x, y) => y < SILL + 34 ? P.sill : P.sillFront },
  ];
}
export const FRAME_OUTLINES = [
  { inside: ['frame'], against: ['window'] },
  { inside: ['sill'], against: ['window', 'frame'] },
];

/* the ragged outer edge: how deep the dissolve eats into the frame, and how far loose stones
   reach onto the wall, both varying along the frame */
const ragged = f => smooth(.25, .75, fbm(f * 15, 3.1, 41, 3));
const reach = f => .35 + .65 * smooth(.2, .8, fbm(f * 9, 7.7, 57, 3));
const fade = f => smooth(0, .07, f) * smooth(1, .93, f);           // calm where the frame meets the sill

/** A point at `depth` units in from the frame's outer edge, at position f (0–1) along the frame. */
export function edgePoint(f, depth) {
  const arcLen = Math.PI * R_OUT, side = SILL - CY, total = arcLen + 2 * side, s = f * total;
  if (s < side) return [depth, SILL - s];
  if (s < side + arcLen) { const a = (s - side) / arcLen * Math.PI - Math.PI; return [CX + (R_OUT - depth) * Math.cos(a), CY + (R_OUT - depth) * Math.sin(a)]; }
  return [1000 - depth, CY + (s - side - arcLen)];
}

/** Colour the frame stones, drop the outermost ones where the edge dissolves, and mark the gold row.
    `su` is the stone size in units. Returns the stones that stay. */
export function finishFrame(stones, regions, q, su, rnd) {
  const P = FRAME_PAL, out = [];
  for (const t of stones) {
    const ux = t.x / q + PANEL.x0, uy = t.y / q + PANEL.y0;
    t.ux = ux; t.uy = uy;
    if (t.k === 0) { t.col = P.outline; out.push(t); continue; }
    const r = regions[t.reg];
    if (r.name === 'frame') {
      const od = outerDepth(ux, uy), f = frameParam(ux, uy), eat = su * (.15 + 1.75 * ragged(f)) * fade(f);
      if (od < eat && rnd() > .18) continue;                       // the dissolving edge
      const id = innerDepth(ux, uy);
      if (id > su * 2.05 && id < su * 3.05) { t.gold = true; t.col = P.gold[t.h < .45 ? 0 : t.h < .8 ? 1 : 2]; out.push(t); continue; }
      t.col = r.fill(ux, uy);
      if (od < su * 2.2 && t.h2 > .7) t.col = mix(t.col, P.marbleWarm, .6);   // the edge stones are a little older
    } else t.col = r.fill(ux, uy);
    out.push(t);
  }
  return out;
}

/** Loose stones on the wall beyond the frame's edge, in sheet pixels like the laid stones. */
export function looseStones(q, su, rnd, kept) {
  const P = FRAME_PAL, out = [], arcLen = Math.PI * R_OUT, total = arcLen + 2 * (SILL - CY);
  const near = (x, y, r) => kept.some(o => (o.x - x) ** 2 + (o.y - y) ** 2 < r * r);
  const step = su * 1.08;
  for (let s = step * .5; s < total; s += step) {
    const f = s / total, fd = fade(f);
    if (fd < .05) continue;
    const L = su * (1.2 + 5.2 * reach(f)) * fd, E = su * (.15 + 1.75 * ragged(f)) * fd;
    for (let d = E; d > -L; d -= su * (1 + rnd() * .25)) {
      const p = clamp((d + L) / (L + E)), keep = Math.pow(p, 1.7) * .82;
      if (rnd() > keep) continue;
      const jit = d < 0 ? su * .35 : su * .12;
      const [ux, uy] = edgePoint(clamp(f + (rnd() - .5) * step * .5 / total), d);
      const x = (ux + (rnd() - .5) * jit - PANEL.x0) * q, y = (uy + (rnd() - .5) * jit - PANEL.y0) * q;
      if (uy > SILL - su * .5) continue;
      const sz = su * q * (.62 + rnd() * .3);
      if (near(x, y, sz * .78)) continue;
      const a = Math.atan2(uy - CY, ux - CX) + Math.PI / 2 + (rnd() - .5) * (d < 0 ? 1.4 : .3);
      const t = { x, y, a, l: sz, w: sz * (.78 + rnd() * .2), k: 4, s: su * q, h: rnd(), h2: rnd(), loose: true };
      t.j = new Float32Array(8); for (let k = 0; k < 8; k++) t.j[k] = (rnd() - .5) * t.s * .1;
      t.col = rnd() < .04 ? P.gold[(rnd() * 3) | 0] : mix(P.marble, rnd() < .5 ? P.marbleShade : P.marbleWarm, rnd() * .7);
      t.gold = t.col === P.gold[0] || t.col === P.gold[1] || t.col === P.gold[2];
      t.ux = ux; t.uy = uy;
      out.push(t); kept.push(t);
    }
  }
  return out;
}

/** The setting bed under the dissolving edge: a pale wash of mortar with a soft, uneven border. */
export function bedPath(c, toPx) {
  const N = 220;
  c.beginPath();
  for (let i = 0; i <= N; i++) {
    const f = i / N, fd = fade(f), L = (36 + 70 * reach(f)) * fd;
    const [ux, uy] = edgePoint(f, -L * (.55 + .25 * fbm(f * 31, 2.2, 77, 2)));
    const [px, py] = toPx(ux, uy);
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  for (let i = N; i >= 0; i--) { const [ux, uy] = edgePoint(i / N, 30); const [px, py] = toPx(ux, uy); c.lineTo(px, py); }
  c.closePath();
}
/** The grout under the laid frame: stops just short of the ragged edge, so no hard outline shows. */
export function groutPath(c, toPx, su) {
  const N = 260;
  c.beginPath();
  for (let i = 0; i <= N; i++) {
    const f = i / N, E = su * (.15 + 1.75 * ragged(f)) * fade(f) + su * .55;
    const [px, py] = toPx(...edgePoint(f, E));
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath();
}
