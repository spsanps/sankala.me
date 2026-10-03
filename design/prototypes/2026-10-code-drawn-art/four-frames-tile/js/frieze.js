/* Four frames in tile: the painted border.
   The room's skirting is a border band of the old kind (a "barra"): two cobalt rules and, between
   them, a running vine with leaves and a small ochre rosette on every tile, one repeat per tile so
   the pattern breaks exactly at the grout. It is painted through the glaze context like
   everything else, before the chair and the things on the floor, which stand in front of it.
   Under the words (wide screens) the wall stays plain: no floor is painted there. */
import { TAU } from './core.js';
import { R, LN, EL, CURVE, PAL, LW, LW_IN } from './ink.js';

// colours of the clear-line vocabulary that map to particular dilutions in glaze
const PALE = '#a9a9a9', MID = '#7b7b7b', DEEP = '#565656', DARK = '#1f1f1f', OCHRE = '#b47c06', OCHRE_PALE = '#e2a52a', WHITE = '#ffffff';

export function drawFrieze(g, P, L, era, pitch = 96) {
  if (L.mode !== 'wide') return;
  const y0 = L.base.y - 4, y1 = L.yMax + 8, x0 = L.desk.leftFront - 46, X1 = L.xMax + 8;
  // the wall under the words stays bare glaze to the bottom
  P.fill(WHITE, R(L.xMin - 8, L.base.y - 1, x0 - L.xMin + 8, y1 - L.base.y + 2));
  // the band itself
  P.fill(WHITE, R(x0, y0, X1 - x0, y1 - y0));
  const h = 1000 - y0, ruleA = y0 + 7, ruleB = y0 + h - 9, midY = (ruleA + ruleB) / 2, amp = (ruleB - ruleA) * .26;
  P.fill(PALE, R(x0, y0, X1 - x0, 5));
  P.ink(LN([[x0, ruleA], [X1, ruleA]]), 2.4, DARK);
  P.ink(LN([[x0, ruleA + 4], [X1, ruleA + 4]]), .9, DARK);
  P.ink(LN([[x0, ruleB], [X1, ruleB]]), 2.4, DARK);
  P.ink(LN([[x0, ruleB - 4], [X1, ruleB - 4]]), .9, DARK);
  // repeats aligned to the tile grid (which is aligned to the right edge)
  const first = L.xMax - Math.ceil((L.xMax - x0) / pitch) * pitch;
  for (let tx = first; tx < X1; tx += pitch) {
    if (tx + pitch < x0) continue;
    const pts = [];
    for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push([tx + u * pitch, midY + Math.sin(u * TAU) * amp]); }
    P.ink(CURVE(pts), 2, DARK);
    // leaves on the vine, washed in two strengths, outlined
    for (const [u, side] of [[.12, -1], [.38, 1], [.62, -1], [.88, 1]]) {
      const x = tx + u * pitch, y = midY + Math.sin(u * TAU) * amp, a = side * .9 + (u > .5 ? .3 : -.3);
      P.at(x, y, a, 1, p => {
        const leaf = c => { c.moveTo(0, 0); c.quadraticCurveTo(8, -side * 9, 20, -side * 2); c.quadraticCurveTo(9, side * 4, 0, 0); };
        p.paint(u < .5 ? MID : PALE, leaf); p.ink(leaf, 1.3, DARK);
        p.ink(LN([[2, 0], [15, -side * 2.5]]), .8, DEEP);
      });
    }
    // the rosette at the crossing, centre of each tile
    const cx = tx + pitch / 2, cy = midY;
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * TAU;
      P.at(cx, cy, a, 1, p => { const pet = c => { c.moveTo(0, 0); c.quadraticCurveTo(4, -3.6, 9.5, 0); c.quadraticCurveTo(4, 3.6, 0, 0); }; p.paint(DEEP, pet); p.ink(pet, .9, DARK); });
    }
    P.paint(OCHRE, EL(cx, cy, 3.6, 3.6)); P.ink(EL(cx, cy, 3.6, 3.6), 1, DARK);
    P.fill(OCHRE_PALE, EL(cx - .8, cy - .8, 1.4, 1.4));
    // dots in the corners where four repeats meet
    P.fill(DEEP, EL(tx, ruleA + 9, 2.2, 2.2)); P.fill(DEEP, EL(tx, ruleB - 9, 2.2, 2.2));
  }
  // the desk's front leg stands in front of the band, down to the floor
  const d = L.desk, legX = d.leftFront + 14;
  P.within(R(L.xMin, y0, L.xMax - L.xMin + 10, y1 - y0), p => {
    p.shape(R(legX, d.frontY + d.faceH - 2, d.legW, L.base.y + L.base.h - d.frontY - d.faceH + 10), PAL.oakShade, LW);
    p.fill(PAL.oakDeep, R(legX + d.legW - 7, d.frontY + d.faceH, 7, L.base.y + L.base.h - d.frontY - d.faceH + 8));
  });
}
