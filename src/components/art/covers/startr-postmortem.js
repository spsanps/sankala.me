// StartR Accelerator: A Post-Mortem — letterpress broadside, annotated in blue pencil.
// Living detail: the pencil writes "post-mortem".
import { PI, TAU, DW, DH, bez, wobble, glyphStrokes, penPaths, strokePen, spaced, clamp, smooth, letterpress, paperTex } from './kit.js';

const KRAFT = '#dacbaa', BLACK = '#1f1c19', RED = '#bd3527', PENCIL = '#3d78b8';

export default {
  seed: 29, still: 9, fonts: ['old-standard-tt-400', 'old-standard-tt-700', 'abril-fatface-400', 'anton-400'],
  build(L) {
    const b = L.bctx;
    b.fillStyle = KRAFT; b.fillRect(0, 0, DW, DH);
    const press = (fn, o, mis = {}) => { const lp = letterpress(L, L.mask(fn), o); L.put(L.base, lp.inked, { mode: 'multiply', ...mis }); if (lp.shadow) { L.put(L.base, lp.shadow, { mode: 'multiply', ...mis }); L.put(L.base, lp.light, { mode: 'screen', ...mis }); } };
    const BLK = { color: BLACK, blur: .7, rough: .7, mottle: .2, voids: .3, voidT: .7, grain: .08, deboss: .3 };
    const SMALL = { color: BLACK, blur: .45, rough: .45, mottle: .12, voids: .12, voidT: .74, grain: .05, deboss: .1 };
    press(x => { x.fillRect(28, 26, 344, 3.2); x.fillRect(28, 31.5, 344, .9); x.fillRect(28, 568, 344, .9); x.fillRect(28, 571, 344, 3.2); }, { ...BLK, salt: 1 });
    press(x => { x.font = '700 15px "Old Standard TT"'; spaced(x, 'STARTR ACCELERATOR', 200, 60, 3.2, 'center'); x.font = '400 9.5px "Old Standard TT"'; spaced(x, 'UC SAN DIEGO  ·  FALL 2023', 200, 78, 2.2, 'center'); x.fillRect(150, 90, 100, .8); }, { ...SMALL, salt: 2 }, { rot: .002 });
    press(x => { x.font = '128px "Abril Fatface"'; spaced(x, 'GLYP', 200, 238, 2, 'center'); }, { color: RED, blur: .9, rough: 1, mottle: .3, wood: .75, streak: .12, voids: .45, voidT: .7, grain: .1, deboss: .35, salt: 3 }, { dx: .8, dy: -.5, rot: -.004 });
    press(x => { x.font = '44px Anton'; spaced(x, 'A WRITING ASSISTANT', 200, 300, 1.2, 'center'); spaced(x, 'FOR NOVELISTS', 200, 350, 2.4, 'center'); }, { ...BLK, streak: .3, salt: 4 }, { rot: .003 });
    press(x => { x.fillRect(70, 372, 112, .9); x.fillRect(218, 372, 112, .9); x.save(); x.translate(200, 372.5); x.rotate(PI / 4); x.fillRect(-4, -4, 8, 8); x.restore(); x.beginPath(); x.arc(188, 372.5, 1.6, 0, TAU); x.arc(212, 372.5, 1.6, 0, TAU); x.fill(); }, { ...BLK, salt: 5 });
    press(x => { x.font = '400 14px "Old Standard TT"'; spaced(x, 'An AI platform for long-form writing,', 200, 402, .2, 'center'); spaced(x, 'pitched in the fall of 2023.', 200, 420, .2, 'center'); }, { ...SMALL, salt: 6 });
    press(x => { x.font = '700 9px "Old Standard TT"'; spaced(x, 'OCT 2023', 30, 559, 1.8); spaced(x, 'SAN DIEGO', 370, 559, 1.8, 'right'); }, { ...SMALL, salt: 7 });

    const g1 = glyphStrokes('POST-MORTEM', { x: 200, y: 506, size: 30, align: 'center', track: .1, xs: .86, slant: .2, jrot: .09, jy: .07, js: .08, seed: 7 });
    const g2 = glyphStrokes('DEC 2025', { x: 322, y: 541, size: 13, align: 'right', track: .14, xs: .9, slant: .2, jrot: .08, jy: .07, js: .06, seed: 8 });
    const under = wobble(bez([96, 517], [170, 525], [250, 521], [314, 512], 30), .8, .1, 3);
    L.pen = { pp: penPaths([...g1.strokes, under, ...g2.strokes], { step: .7, wob: .45, wobF: .22, seed: 2 }), rot: -.07, cx: 200, cy: 510 };
    L.pencilTmp = L.canvas();
    const tooth = L.canvas(), tx = tooth.getContext('2d'), ti = tx.createImageData(L.W, L.H);
    for (let i = 0; i < L.W * L.H; i++) { const v = L.F.fine[i] * .6 + L.F.grain[i] * .4; ti.data[i * 4 + 3] = v > .5 ? Math.min(255, (v - .5) * 700) : 0; }
    tx.putImageData(ti, 0, 0); L.tooth = tooth;
    L.tex = paperTex(L, { mottle: .05, grain: .06, fibres: 900, fLen: 4, fAlpha: .15, flecks: 160 });
  },
  live: {
    box: [40, 440, 330, 120],
    key: t => { const tt = t % 16; return tt < 8.1 || (tt > 12.4 && tt < 14.6) ? Math.floor(t * 30) : tt < 12.5 ? 'hold' : 'blank'; },
    draw(ctx, t, L) {
      const tt = t % 16, prog = clamp(tt / 8), fade = tt < 12.5 ? 1 : 1 - smooth(12.5, 14.5, tt);
      if (prog <= 0 || fade <= 0) return;
      const pc = L.pencilTmp, px = pc.getContext('2d'), S = L.S, bx = Math.floor(40 * S), by = Math.floor(440 * S), bw = Math.ceil(330 * S), bh = Math.ceil(120 * S);
      px.setTransform(1, 0, 0, 1, 0, 0); px.clearRect(bx, by, bw, bh);
      px.setTransform(L.S, 0, 0, L.S, 0, 0); px.translate(L.pen.cx, L.pen.cy); px.rotate(L.pen.rot); px.translate(-L.pen.cx, -L.pen.cy);
      px.strokeStyle = PENCIL; px.lineWidth = 1.75; px.lineCap = px.lineJoin = 'round'; strokePen(px, L.pen.pp, prog);
      px.setTransform(1, 0, 0, 1, 0, 0); px.globalCompositeOperation = 'destination-out'; px.drawImage(L.tooth, bx, by, bw, bh, bx, by, bw, bh); px.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .8 * fade; ctx.drawImage(pc, bx, by, bw, bh, bx, by, bw, bh); ctx.restore();
    },
  },
};
