// "Even lifting a corner is hard": a small instruction vignette. One robot hand presses the sheet near a corner
// and pushes toward it, so the corner rises a little; the other slides a fingertip under it. Drawn in code with
// the essay's diagram kit, on a slow loop.
//
// createRenderer({ canvas, width, height }) → { still, key(t), draw(t, full) }   (LivingCanvas)
import { PALETTE, flatSheet, applyFold, drawStack, placer, toSheet, robotHand, POSES, blendPose, pressMarks, straightArrow, valleyArrow, smooth, ease } from './diagram.js';

export const DW = 460, DH = 300;
const PERIOD = 7.6, STILL = 4.7;
const view = { ox: 58, oy: 40, s: 196 };
const BEND = { line: [[1, .6], [.6, 1]], side: [1, 1], kind: 'valley' };
const split = applyFold(flatSheet(), BEND).before;
const page = p => [view.ox + p[0] * view.s, view.oy + p[1] * view.s];
// A hand seen through the lifted paper: its lines faint, its fill clear.
const XRAY = { ...PALETTE, ink: 'rgba(31, 35, 40, .42)', hand: 'rgba(0, 0, 0, 0)', pad: 'rgba(0, 0, 0, 0)', shade: 'rgba(0, 0, 0, 0)' };

export function drawLift(ctx, t) {
  const tt = ((t % PERIOD) + PERIOD) % PERIOD;
  const down = smooth(0, .8, tt) * (1 - smooth(5.9, 6.9, tt));            // the pressing hand on the paper
  const rise = ease((tt - 1.1) / 1.1) * (1 - smooth(5.7, 6.7, tt));        // the corner lifting
  const slide = ease((tt - 2.3) / 1.3) * (1 - smooth(5.5, 6.4, tt));       // the fingertip going under
  const theta = .8 * rise;

  // the sheet on the table, the corner where it lay shown as hidden lines while it is up
  const lifted = split.filter(f => f.moving);
  drawStack(ctx, split.filter(f => !f.moving), view, {});
  if (rise > .02) {
    const a = page([1, .6]), c = page([1, 1]), b = page([.6, 1]);
    ctx.save(); ctx.globalAlpha = rise; ctx.fillStyle = 'rgba(31, 35, 40, .07)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(b[0], b[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = .9; ctx.setLineDash([1.4, 3]); ctx.globalAlpha = .7 * rise;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
  }

  // the sliding hand, under the corner
  const out = page([1.36, .84]), under = page([.93, .82]);
  const slideHand = { at: [out[0] + (under[0] - out[0]) * slide, out[1] + (under[1] - out[1]) * slide], angle: -1.5, scale: 1.12, side: 'right', pose: blendPose(POSES.rest, POSES.slide, smooth(1.6, 2.5, tt)), lift: 4 + 8 * (1 - smooth(1.6, 2.4, tt)) };
  robotHand(ctx, slideHand);
  drawStack(ctx, lifted, view, { fold: BEND, theta });
  // where the finger is under the paper, its lines show through faintly
  if (slide > .02) {
    ctx.save(); ctx.beginPath();
    const place = placer(view, BEND, theta, true);
    lifted.forEach(f => { f.poly.forEach((v, j) => { const q = place(toSheet(f, v)); j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); });
    ctx.clip(); robotHand(ctx, { ...slideHand, P: XRAY }); ctx.restore();
  }

  // the pressing hand, pushing toward the corner
  const push = page([.66 + .05 * rise, .66 + .05 * rise]);
  robotHand(ctx, { at: push, angle: 2.36, scale: 1.12, side: 'left', pose: POSES.press, lift: 18 * (1 - down) });
  pressMarks(ctx, push, -2.36 + Math.PI, PALETTE, 7.5, smooth(.6, 1, down) * (1 - smooth(5.6, 6, tt)));

  // the arrows: push toward the corner, the corner rising, the fingertip sliding in
  const notes = smooth(1, 1.5, tt) * (1 - smooth(5.6, 6.1, tt));
  if (notes > 0) {
    ctx.save(); ctx.globalAlpha = notes;
    const p0 = page([.74, .6]), p1 = page([.84, .7]); straightArrow(ctx, p0, p1, PALETTE, 7, smooth(1.1, 1.8, tt));
    const c0 = page([.74, 1.07]), c1 = page([.93, 1.02]); valleyArrow(ctx, c0, c1, -.42, PALETTE, 7.5, smooth(1.6, 2.3, tt));
    const s0 = page([1.3, .6]), s1 = page([1.1, .6]); straightArrow(ctx, s0, s1, PALETTE, 7, smooth(2.4, 3.2, tt));
    ctx.restore();
  }
}

export async function createRenderer({ canvas, width, height }) {
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'), k = width / DW;
  return {
    still: STILL,
    key: t => { const tt = t % PERIOD; return (tt > 3.7 && tt < 5.5) || tt > 7.05 ? 'hold' : Math.floor(t * 30); },
    draw: t => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, width, height); ctx.setTransform(k, 0, 0, k, 0, 0); drawLift(ctx, t); },
  };
}
