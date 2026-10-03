/* Surathkal, 2015 – 2019, a night by the sea (the astronomy club years). The conch turns to lapis
   strewn with gold stars, like the vault of Galla Placidia, with a silver full moon. Behind the desk:
   the Arabian Sea with the moon's path on it, the red-and-white lighthouse on its headland (its
   beam sweeping, in gold), a coconut palm leaning over the beach. The lamp on the desk is lit, the
   screen glows, and the telescope points at the stars.
   Palette (lifted night): sea #34578f / #4669a3, moon path #c9d6ec; headland #3f5487 / #6a82b0;
   sand #b9b5a5 / wet #8c93a8; tower #f4f0e6 / #bcc2d2, bands #cc4e3c; lantern #fadb84;
   palm #24365e / #4a6694. */
import { mix, clamp, smooth, lerp, rgb, vnoise, hash2 } from '../core.js';
import { RI, poly, disc, below, union, blade, regionList } from '../geom.js';
import { deskRegions, deskOutlines, deskShadow } from '../desk.js';
import { groundColour, starField } from './sky.js';
import { MAT } from '../arch.js';

const C = s => rgb(s);
const P = {
  sea: C('#34578f'), seaFar: C('#4669a3'), path: C('#c9d6ec'), foam: C('#dde4f0'),
  head: C('#3f5487'), headLit: C('#6a82b0'), scrub: C('#4f6690'),
  sand: C('#868a92'), sandLit: C('#9b9d9f'), sandWet: C('#5f6a8a'),
  tower: C('#f4f0e6'), towerShade: C('#bcc2d2'), red: C('#cc4e3c'), redShade: C('#9e3a2e'), iron: C('#2c3240'), lamp: C('#fadb84'), cap: C('#8e3226'),
  palm: C('#2c4473'), palmLit: C('#6b88bd'), outline: C('#231d18'),
};
function light() { return { pal: P, tint: [.82, .86, .99], caption: 'Surathkal · a night by the sea', label: 'a night by the sea', day: 0, golden: 0, dusk: 0, night: 1, lamp: 1, stars: 1 }; }

function layout(A) {
  const t = A.t, sd = A.sd, k = lerp(1, 1.3, t);
  const hor = lerp(-150, A.deskY - 176 * sd, t);
  const moon = [lerp(-150, -120, t), lerp(-382, -300, t)], mr = lerp(44, 56, t);
  const beach = x => hor + lerp(52, 92, t) + 6 * Math.sin(x / 60 + 1);
  const lh = { x: lerp(-372, -330, t), base: hor - lerp(20, 30, t), top: hor - lerp(132, 190, t), w: lerp(19, 24, t) };
  const headX = lerp(-250, -190, t);
  const headY = x => x > headX ? 1e9 : lh.base + 4 + 26 * smooth(lh.x + 20, headX, x) + 3 * Math.sin(x / 17);
  const palm = { root: [lerp(330, 300, t), beach(330) + lerp(26, 40, t)], crown: [lerp(430, 380, t), lerp(-232, A.deskY - 300 * sd, t)], s: lerp(1, 1.25, t) };
  return { t, k, hor, moon, mr, beach, lh, headX, headY, palm };
}

function regions(L, A) {
  const out = regionList(), R = out.R, Y = layout(A), F = A.F, [mx, my] = Y.moon;
  const vOf = (x, y) => clamp((y + RI) / (Y.hor + RI));
  R('sky', 'sky', c => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8), (x, y) => mix(groundColour(L, vOf(x, y), 0), C('#6f8cc4'), .5 * (1 - smooth(Y.mr, Y.mr + 170, Math.hypot(x - mx, y - my)))),
    { live: 'sky', mat: MAT.GLASS, fine: 1.02, src: ['outside'], halo: 2 });
  R('moon', 'sun', disc(mx, my, Y.mr), (x, y) => mix(C('#f4f2ea'), C('#cfd6e2'), smooth(.42, .72, vnoise(x / 16, y / 16, 13)) * .8), { fine: .64, mat: MAT.SILVER });
  R('sea', 'view', below(() => Y.hor, -RI - 4, RI + 4, F + 4), (x, y) => {
    const d = y - Y.hor, w = 10 + d * .5;
    let c = mix(P.seaFar, P.sea, smooth(0, 60, d));
    return mix(c, P.path, .62 * (1 - smooth(w * .35, w, Math.abs(x - mx - d * .05))));
  }, { src: 'courses', live: 'sea', fine: .9 });
  R('head', 'view', c => { c.moveTo(-RI - 4, F + 4); for (let x = -RI - 4; x <= Y.headX; x += 4) c.lineTo(x, Math.min(Y.headY(x), Y.beach(x) + 20)); c.lineTo(Y.headX, F + 4); c.closePath(); },
    (x, y) => { const c = mix(P.headLit, P.head, smooth(0, 70, y - Y.headY(x))); return vnoise(x / 26, y / 16, 19) > .62 ? mix(c, P.scrub, .55) : c; }, { src: ['sky', 'sea'] });
  R('sand', 'view', below(Y.beach, -RI - 4, RI + 4, F + 4), (x, y) => {
    const d = y - Y.beach(x);
    if (d < 6) return P.foam;
    if (d < 30) { const w = 14 + d * .4; return mix(P.sandWet, P.path, .5 * (1 - smooth(w * .3, w, Math.abs(x - mx - (Y.hor - my) * 0 - d * .05)))); }   // wet sand, the moon in it
    return mix(mix(mix(P.sandLit, P.sand, smooth(30, 70, d)), P.sandWet, smooth(.6, .82, vnoise(x / 50, y / 9, 4)) * .35), C('#4c5470'), deskShadow(A, x, y) * .7);
  }, { src: 'courses', live: 'foam', fine: .92 });
  /* the lighthouse */
  const lh = Y.lh, w = lh.w, H = lh.base - lh.top;
  R('tower', 'lh', poly([[lh.x - w * 1.25, lh.base + 4], [lh.x - w * .8, lh.top], [lh.x + w * .8, lh.top], [lh.x + w * 1.25, lh.base + 4]]), (x, y) => {
    const v = (y - lh.top) / H, band = (v > .22 && v < .38) || (v > .58 && v < .74), shade = x > lh.x + 2;
    return band ? (shade ? P.redShade : P.red) : (shade ? P.towerShade : P.tower);
  }, { fine: .62, src: 'courses' });
  R('gallery', 'lh', c => c.rect(lh.x - w * 1.15, lh.top - 7, w * 2.3, 8), () => P.iron, { fine: .54 });
  R('lantern', 'lh', c => c.rect(lh.x - w * .62, lh.top - 7 - w * 1.3, w * 1.24, w * 1.3), x => Math.abs(x - lh.x) % 9 < 2 ? mix(P.lamp, P.iron, .5) : P.lamp, { fine: .5, live: 'lamp', mat: MAT.GOLD });
  R('cap', 'lh', c => { const r = w * .78, cy = lh.top - 7 - w * 1.3; c.moveTo(lh.x + r, cy); c.arc(lh.x, cy, r, 0, Math.PI, true); c.closePath(); }, () => P.cap, { fine: .54 });
  /* the coconut palm, leaning over the beach */
  const pm = Y.palm, s = pm.s, [cx, cy] = pm.crown;
  R('palmTrunk', 'palm', blade(...pm.root, pm.root[0] + 60 * s, (pm.root[1] + cy) / 2, cx, cy + 6, 18 * s, 11 * s), (x, y) => mix(P.palmLit, P.palm, .5 + .5 * smooth(-4, 8, x - (pm.root[0] + cx) / 2)), { fine: .6 });
  const FR = [[-150, 40, 50], [-128, -40, 46], [-70, -96, 36], [10, -108, 30], [84, -80, 36], [136, -14, 44], [128, 64, 48], [-60, 92, 30], [52, 96, 30]];
  R('fronds', 'palm', union(...FR.map(([dx, dy, lift]) => blade(cx, cy, cx + dx * .5 * s, cy + (dy * .5 - lift) * s, cx + dx * s, cy + dy * s, 22 * s + 4, 2)), disc(cx, cy + 6, 13 * s)), (x, y) => mix(P.palm, P.palmLit, .55 * smooth(0, -100, (x - cx) * -.4 + (y - cy) * .9)), { fine: .6 });
  /* a fishing boat drawn up on the sand below the lighthouse (wide screens only: on a phone it would hide behind the desk) */
  if (Y.t < .4) {
    const bx = -412, by = Y.beach(-412) + 38, L2 = 78;
    const hull = c => { c.moveTo(bx - L2 - 14, by - 26); c.quadraticCurveTo(bx - L2 + 10, by + 4, bx - L2 + 30, by + 8); c.lineTo(bx + L2 - 30, by + 8); c.quadraticCurveTo(bx + L2 - 10, by + 4, bx + L2 + 14, by - 26); c.lineTo(bx + L2 - 4, by - 14); c.lineTo(bx - L2 + 4, by - 14); c.closePath(); };
    R('boat', 'boat', hull, (x, y) => y < by - 8 ? C('#b8432f') : y < by - 3 ? C('#e9e3d2') : mix(C('#4a3d36'), C('#2e2723'), smooth(by - 3, by + 8, y)), { fine: .6, src: 'courses' });
  }
  deskRegions(R, L, A);
  return out;
}

function liveKind(t, r) { return r.live === 'sky' ? 'sky' : r.live === 'sea' ? 'sea' : r.live === 'lamp' ? 'lamp' : r.live === 'foam' ? 'foam' : null; }
function frameState(time, L, A) {
  const Y = layout(A), ph = time * .5, cx = Math.cos(ph);
  return { time, Y, beam: { side: Math.sign(cx) || 1, len: 640 * Math.pow(Math.abs(cx), .6), b: Math.pow(Math.abs(cx), .5) }, flare: Math.max(0, Math.sin(ph)) ** 8 };
}
function liveColour(s, F) {
  const Y = F.Y, lamp = [Y.lh.x, Y.lh.top - 7 - Y.lh.w * .65];
  if (s.kind === 'sky' || s.kind === 'sea') {
    let col = null;
    const dx = s.ux - lamp[0], dy = s.uy - lamp[1];
    if (Math.sign(dx) === F.beam.side && Math.abs(dx) < F.beam.len) {
      const ang = Math.abs(Math.atan2(-dy - Math.abs(dx) * .02, Math.abs(dx))), spread = .07 + Math.abs(dx) * .00012;
      const b = Math.exp(-((ang / spread) ** 2)) * (1 - Math.abs(dx) / F.beam.len) * F.beam.b;
      if (b > .03) col = mix(s.col, [255, 226, 150], b * .6);
    }
    if (s.star) { const tw = .5 + .5 * Math.sin(F.time * (1.2 + s.h2 * 2.4) + s.h * 50); col = mix(col || s.col, [255, 246, 214], .2 + .45 * tw); }
    if (s.kind === 'sea') {
      const d = s.uy - Y.hor, w = 10 + d * .5, inPath = 1 - smooth(w * .35, w * 1.1, Math.abs(s.ux - Y.moon[0] - d * .05));
      const g = Math.max(0, Math.sin(F.time * 2.6 + s.h * 70)) ** 18 * inPath;
      if (g > .05) col = mix(col || s.col, [255, 252, 236], g * .8);
    }
    return col;
  }
  if (s.kind === 'lamp') return F.flare > .05 ? mix(s.col, [255, 252, 236], F.flare * .7) : null;
  if (s.kind === 'foam' && s.uy - Y.beach(s.ux) < 8) { const f = Math.sin(F.time * .9 - s.ux * .03); return f > .4 ? mix(s.col, [236, 242, 250], (f - .4) * .9) : null; }
  return null;
}

export default {
  key: 'nitk', place: 'Surathkal', light, regions, liveKind, frameState, liveColour,
  stars: (L, A) => { const Y = layout(A); return starField(A, () => Y.hor - 10, [[Y.moon[0], Y.moon[1], Y.mr + 52], [Y.lh.x, Y.lh.top - 20, 40]], 7, 1.1); },
  isStar: (r, L, t, A) => { if (r.name !== 'sky' || t.h <= .982) return false; const Y = layout(A); return t.uy < Y.hor - 24 && Math.hypot(t.ux - Y.moon[0], t.uy - Y.moon[1]) > Y.mr + 46; },
  outlines: [
    ...deskOutlines(['rays', 'sky', 'sun', 'view', 'lh', 'palm', 'boat']),
    { inside: ['boat'], against: ['view', 'palm'] },
    { inside: ['lh'], against: ['sky', 'sea', 'view'] },
  ],
  alt: () => 'The apse, laid in mosaic: San’s desk with its lit red lamp, a stack of books, the glowing laptop, the blue paper robot and a telescope aimed at the stars, and behind it Surathkal at night: the Arabian Sea under a silver full moon, the red-and-white lighthouse on its headland with its beam sweeping, and a coconut palm, under a lapis conch full of gold stars.',
};
