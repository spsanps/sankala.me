// Two hands, one sheet of paper — a page of origami instruction diagrams, Yoshizawa–Randlett notation:
// thin ink on warm paper, dashed valley folds, dot-dash mountain folds, curved fold arrows, step numbers in
// circles, a grey tint for the paper's back, and one accent: the blue of the challenge sheet's printed guide lines.
// The cover is step 2 of 5: both corners folded, one robot hand pressing the centre crease while the other pins
// the sheet. Living detail: the right corner unfolds and folds again along its dashed line.
import { DW, DH, paperTex } from './kit.js';
import { PALETTE, flatSheet, applyFold, drawStack, robotHand, POSES, valleyArrow, mountainArrow, stepCircle, foldLine, extend, label, ease, smooth } from '../../../pages/notes/iros-2026-origami/art/diagram.js';

const PAPER = '#f3eee2', INK = PALETTE.ink;
// The 15 cm sheet in design units.
const X0 = 76, Y0 = 246, SIDE = 248, view = { ox: X0, oy: Y0, s: SIDE };
const page = p => [X0 + p[0] * SIDE, Y0 + p[1] * SIDE];
const FOLD1 = { line: [[.5, 0], [0, .5]], side: [0, 0], kind: 'valley' };
const FOLD2 = { line: [[.5, 0], [1, .5]], side: [1, 0], kind: 'valley' };
const one = applyFold(flatSheet(), FOLD1).after, two = applyFold(one, FOLD2);
const STILL_PART = two.before.filter(f => !f.moving), FLAP = two.before.filter(f => f.moving);
// The live box: the right corner's sweep, its dashed line and its arrow.
const BOX = [X0 + SIDE / 2 - 16, Y0 - 18, SIDE / 2 + 34, SIDE / 2 + 36];
const PERIOD = 15;
// Folded for most of the loop; then it opens, rests open, and folds again.
function flapAngle(t) {
  const tt = t % PERIOD;
  if (tt < 8) return Math.PI;
  if (tt < 9.6) return Math.PI * (1 - ease((tt - 8) / 1.6));
  if (tt < 11) return 0;
  if (tt < 13) return Math.PI * ease((tt - 11) / 2);
  return Math.PI;
}

export default {
  seed: 113, still: 2, fonts: ['zen-maru-gothic-500', 'zen-maru-gothic-700'],
  build(L) {
    const b = L.bctx, o = L.octx;
    b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
    b.lineCap = b.lineJoin = 'round';

    // the title block, set like the head of a diagram sheet
    b.fillStyle = INK;
    b.font = '500 8.6px "Zen Maru Gothic"'; label(b, 'IROS 2026  ·  ROBOTIC ORIGAMI CHALLENGE', 30, 44, 1.6);
    b.font = '700 33px "Zen Maru Gothic"'; label(b, 'Two hands,', 28, 86, -.3); label(b, 'one sheet of paper', 28, 124, -.3);
    b.fillRect(30, 142, 340, .8);
    b.font = '500 9.5px "Zen Maru Gothic"'; label(b, 'Paper plane  ·  traditional', 30, 158, .3); label(b, 'Two robot hands', 370, 158, .3, 'right');

    // step 2 of 5
    stepCircle(b, 46, 198, 15, '2');
    b.font = '500 10px "Zen Maru Gothic"'; label(b, 'of 5', 67, 202, .4);

    // the sheet without its right corner (that is the living detail), the left corner folded over,
    // where the left corner was (hidden lines) and the arrow that brought it to the centre
    drawStack(b, STILL_PART, view, { hide: FOLD2.line });
    b.save(); b.strokeStyle = INK; b.lineWidth = .7; b.setLineDash([1.2, 2.6]);
    const [l0, l1, l2] = [page([0, .5]), page([0, 0]), page([.5, 0])]; b.beginPath(); b.moveTo(...l0); b.lineTo(...l1); b.lineTo(...l2); b.stroke(); b.restore();
    valleyArrow(b, page([.03, .03]), page([.27, .25]), -.34);

    // above the living detail: the next step, a mountain fold down the centre, and the two hands
    o.lineCap = o.lineJoin = 'round';
    foldLine(o, page([.5, -.08]), page([.5, 1.08]), 'mountain');
    mountainArrow(o, page([.25, .9]), page([.75, .9]), -.28);
    robotHand(o, { at: page([.22, .78]), angle: 1.05, scale: 1.45, side: 'left', pose: POSES.pin, anchor: 'pin', arm: 320 });
    robotHand(o, { at: page([.505, .63]), angle: -1.22, scale: 1.45, side: 'right', pose: POSES.press, arm: 320 });
    // the press marks around the fingertip on the crease
    o.save(); o.strokeStyle = INK; o.lineWidth = .95; o.lineCap = 'round';
    const tip = page([.505, .63]);
    for (const a of [-2.75, -2.2, -1.65]) { o.beginPath(); o.moveTo(tip[0] + Math.cos(a) * 8.5, tip[1] + Math.sin(a) * 8.5); o.lineTo(tip[0] + Math.cos(a) * 13, tip[1] + Math.sin(a) * 13); o.stroke(); }
    o.restore();

    // the foot of the sheet
    o.fillStyle = INK; o.fillRect(30, 562, 340, .8);
    o.font = '500 9px "Zen Maru Gothic"'; label(o, 'SAN KALA', 30, 578, 1.4); label(o, 'OCTOBER 2026', 370, 578, 1.4, 'right');

    L.tex = paperTex(L, { mottle: .035, grain: .035, fibres: 260, fAlpha: .06, flecks: 24 });
  },
  live: {
    box: BOX,
    key: t => { const tt = t % PERIOD; return (tt > 8 && tt < 9.6) || (tt > 11 && tt < 13) ? Math.floor(t * 30) : tt >= 9.6 && tt <= 11 ? 'open' : 'folded'; },
    draw(ctx, t) {
      const theta = flapAngle(t), open = 1 - smooth(.15 * Math.PI, .55 * Math.PI, theta);
      // the right corner, turning about its crease
      drawStack(ctx, FLAP, view, { fold: FOLD2, theta, hide: theta < .12 ? FOLD2.line : null });
      // while it is open: its dashed valley line; once folded: where it was, as hidden lines
      if (open > 0) { ctx.save(); ctx.globalAlpha = open; foldLine(ctx, ...extend(page([.5, 0]), page([1, .5]), 13)); ctx.restore(); }
      const shut = smooth(.8 * Math.PI, Math.PI, theta);
      if (shut > 0) {
        ctx.save(); ctx.globalAlpha = shut; ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.setLineDash([1.2, 2.6]);
        const [a, c, d] = [page([.5, 0]), page([1, 0]), page([1, .5])]; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...c); ctx.lineTo(...d); ctx.stroke(); ctx.restore();
      }
      valleyArrow(ctx, page([.97, .03]), page([.73, .25]), .34);
    },
  },
};
