// Winning by Overfitting — Swiss International Style, offset.
// Living detail: the score staircase is plotted round by round.
import { TAU, DW, DH, mulberry32, polyLen, clamp, smooth, pathPts, spaced, paperTex, crease } from './kit.js';

const YEL = '#f2c12e', INK = '#1b1a17', PAPER = '#f4f1e8';
const X0 = 24, X1 = 376, Y0 = 150, Y1 = 392, R = 11;
const r0 = mulberry32(5), sc = []; let best = .1;
for (let k = 0; k <= R; k++) { best = Math.max(best, Math.min(.975, 1 - .9 * Math.exp(-.36 * k) + (r0() - .5) * .06)); sc.push(best); }
sc[R] = .985;
const px = k => X0 + (X1 - X0) * k / R, py = s => Y1 - (Y1 - Y0) * s;
const path = [[px(0), Y1], [px(0), py(sc[0])]];
for (let k = 0; k < R; k++) { path.push([px(k + 1), py(sc[k])]); path.push([px(k + 1), py(sc[k + 1])]); }
const total = polyLen(path);
function partial(p) { // polyline up to fraction p of its length
  let budget = p * total; const out = [path[0]];
  for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (budget >= l) { out.push(b); budget -= l; } else { const t = budget / l; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } }
  return out;
}

export default {
  seed: 23, still: 10, fonts: ['archivo-400', 'archivo-600', 'archivo-800'],
  build(L) {
    const b = L.bctx;
    b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
    L.paint(L.base, x => x.fillRect(-5, -5, 410, 610), { color: YEL, mottle: .05, grain: .03, salt: 1 }, { mode: 'multiply' });
    L.paint(L.base, x => {
      x.lineWidth = .9; x.beginPath(); x.moveTo(X0, Y0 - 24); x.lineTo(X0, Y1); x.lineTo(X1 + 4, Y1); x.stroke();
      for (let k = 0; k <= R; k++) { x.beginPath(); x.moveTo(px(k), Y1); x.lineTo(px(k), Y1 + 5); x.stroke(); }
      x.beginPath(); for (let q = X0 + 2; q <= X1; q += 4.4) { x.moveTo(q + .75, Y0); x.arc(q, Y0, .75, 0, TAU); } x.fill();
      x.font = '400 8.5px Archivo'; spaced(x, 'evaluator', X1, Y0 - 6, .3, 'right'); spaced(x, 'score', X0 + 6, Y0 - 16, .3); spaced(x, 'rounds', X1, Y1 + 17, .3, 'right');
    }, { color: INK, blur: .3, rough: .25, bias: .14, salt: 2 }, { mode: 'multiply' });
    L.paint(L.base, x => {
      x.font = '600 10.5px Archivo'; spaced(x, 'NeurIPS 2025', X0, 40);
      x.font = '400 10.5px Archivo'; spaced(x, 'Embodied Agent', X0, 54); spaced(x, 'Interface Challenge', X0, 68); spaced(x, 'First place', X0, 82);
      spaced(x, 'An LLM in a loop', 212, 40); spaced(x, 'with a benchmark’s', 212, 54); spaced(x, 'own evaluator', 212, 68);
    }, { color: INK, blur: .3, rough: .25, bias: .1, salt: 3 }, { mode: 'multiply' });
    L.paint(L.base, x => { x.font = '800 61px Archivo'; spaced(x, 'Winning', 20, 466, -1.5); spaced(x, 'by over-', 20, 520, -1.5); spaced(x, 'fitting', 20, 574, -1.5); }, { color: INK, blur: .5, rough: .4, mottle: .06, salt: 4 }, { mode: 'multiply' });
    L.tex = paperTex(L, { mottle: .035, grain: .035, fibres: 150, fAlpha: .05 });
    crease(L, 7, .25, .08);
  },
  live: {
    box: [X0 - 6, Y0 - 4, X1 - X0 + 12, Y1 - Y0 + 10],
    key: t => { const tt = t % 15; return tt < 9.1 || (tt > 12.9 && tt < 14.6) ? Math.floor(t * 30) : tt < 13 ? 'hold' : 'blank'; },
    draw(ctx, t) {
      const tt = t % 15, p = clamp(tt / 9), fade = tt < 13 ? 1 : 1 - smooth(13, 14.5, tt);
      if (p <= 0 || fade <= 0) return;
      const sub = partial(p), head = sub[sub.length - 1];
      ctx.save(); ctx.globalAlpha = fade;
      ctx.fillStyle = PAPER; ctx.beginPath(); pathPts(ctx, sub); ctx.lineTo(head[0], Y1); ctx.lineTo(X0, Y1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.lineJoin = 'miter'; ctx.beginPath(); pathPts(ctx, sub); ctx.stroke();
      ctx.fillStyle = INK; for (let i = 3; i < sub.length; i += 2) { const q = sub[i]; if (i < sub.length - 1) ctx.fillRect(q[0] - 3, q[1] - 3, 6, 6); }
      ctx.beginPath(); ctx.arc(head[0], head[1], 4.4, 0, TAU); ctx.fill();
      ctx.restore();
    },
  },
};
