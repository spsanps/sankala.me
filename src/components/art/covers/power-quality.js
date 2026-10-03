// Power quality event classification — technical journal, duotone halftone oscilloscope.
// Living detail: the trace sweeps across the screen, sagging mid-cycle.
import { TAU, DW, DH, smooth, halftone, spaced, crease, paperTex } from './kit.js';

const PAPER = '#e8dec4', BLACK = '#1c1c1a', GREEN = '#24935f', CORE = '#e2f2d2';
const C = [200, 390], SR = 102;
const wave = u => { const sag = 1 - .52 * smooth(.4, .45, u) * (1 - smooth(.66, .71, u)); return -38 * sag * Math.sin(TAU * 5 * u); };

export default {
  seed: 83, still: 1.1, fonts: ['old-standard-tt-400', 'old-standard-tt-700'],
  build(L) {
    const b = L.bctx;
    b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
    let n = 0;
    const pr = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .4, rough: .45, mottle: .08, grain: .03, salt: ++n, ...o }, { mode: 'multiply', ...p });
    pr(x => { x.fillRect(-4, -4, 408, 82); x.globalCompositeOperation = 'destination-out'; x.font = '700 11px "Old Standard TT"'; spaced(x, 'IEEE  DISCOVER  ·  2019', 200, 46, 3.2, 'center'); }, BLACK, { mottle: .12 });
    pr(x => { x.font = '700 23px "Old Standard TT"'; ['Power Quality Event', 'Classification Using', 'Long Short-Term', 'Memory Networks'].forEach((s, i) => spaced(x, s, 30, 118 + i * 27, .2)); x.fillRect(30, 222, 340, .9); }, BLACK);
    pr(x => { x.font = '400 10px "Old Standard TT"'; spaced(x, 'Best Paper Award', 30, 566, .4); spaced(x, 'S. K. G. Manikonda et al.', 370, 566, .4, 'right'); x.fillRect(30, 548, 340, .7); }, BLACK, { bias: .14 });
    // the oscilloscope, printed as a duotone photograph
    const bezel = x => { x.beginPath(); x.roundRect(68, 262, 264, 256, 20); };
    const screen = x => { x.beginPath(); x.arc(C[0], C[1], SR, 0, TAU); };
    const greenPlate = L.mask(x => { screen(x); x.globalAlpha = .9; x.fill(); });
    L.put(L.base, L.ink(halftone(L, greenPlate, { cell: 2.1, angle: 1.31, gain: 1.05 }), { color: GREEN, blur: .3, rough: .3, salt: 20 }), { mode: 'multiply' });
    const blackPlate = L.mask(x => {
      bezel(x); const g = x.createLinearGradient(80, 270, 320, 520); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.45, 'rgba(0,0,0,.92)'); g.addColorStop(1, 'rgba(0,0,0,.98)'); x.fillStyle = g; x.fill();
      x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(C[0], C[1], SR + 7, 0, TAU); x.fill();
      x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(C[0], C[1], SR + 7, 0, TAU); x.arc(C[0], C[1], SR, 0, TAU, true); x.fill();
      const v = x.createRadialGradient(C[0] - 20, C[1] - 24, 10, C[0], C[1], SR); v.addColorStop(0, 'rgba(0,0,0,.66)'); v.addColorStop(1, 'rgba(0,0,0,.93)'); x.fillStyle = v; screen(x); x.fill();
      x.globalCompositeOperation = 'destination-out'; x.save(); screen(x); x.clip(); x.lineWidth = .8; x.strokeStyle = 'rgba(0,0,0,.75)';
      for (let k = -5; k <= 5; k++) { x.beginPath(); x.moveTo(C[0] + k * 20, C[1] - SR); x.lineTo(C[0] + k * 20, C[1] + SR); x.stroke(); x.beginPath(); x.moveTo(C[0] - SR, C[1] + k * 20); x.lineTo(C[0] + SR, C[1] + k * 20); x.stroke(); }
      for (let k = -25; k <= 25; k++) { x.beginPath(); x.moveTo(C[0] + k * 4, C[1] - 2); x.lineTo(C[0] + k * 4, C[1] + 2); x.stroke(); x.beginPath(); x.moveTo(C[0] - 2, C[1] + k * 4); x.lineTo(C[0] + 2, C[1] + k * 4); x.stroke(); }
      x.restore();
      x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(0,0,0,.25)';
      for (const [sx, sy] of [[84, 278], [316, 278], [84, 502], [316, 502]]) { x.beginPath(); x.arc(sx, sy, 5, 0, TAU); x.fill(); }
    });
    L.put(L.base, L.ink(halftone(L, blackPlate, { cell: 2.1, angle: .79, gain: 1.04 }), { color: BLACK, blur: .3, rough: .3, salt: 21 }), { mode: 'multiply' });
    pr(x => { x.lineWidth = .9; for (const [sx, sy] of [[84, 278], [316, 278], [84, 502], [316, 502]]) { x.beginPath(); x.arc(sx, sy, 5, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(sx - 3.4, sy - 1); x.lineTo(sx + 3.4, sy + 1); x.stroke(); } }, BLACK, { blur: .2 });
    crease(L, 7, .22, .09);
    L.tex = paperTex(L, { mottle: .07, grain: .05, fibres: 300, fAlpha: .08, flecks: 40 });
    // halftone cells for the live trace, in the screen's own rotated grid
    const cell = 2.6, ang = .26, ca = Math.cos(ang), sa = Math.sin(ang), cells = [];
    for (let v = -48; v <= 48; v++) for (let u = -48; u <= 48; u++) {
      const x = (u * ca - v * sa) * cell, y = (u * sa + v * ca) * cell; if (Math.hypot(x, y) >= SR - 2) continue;
      const px = C[0] + x, py = C[1] + y, uu = (px - (C[0] - SR)) / (SR * 2), wy = wave(uu), dw = (wave(uu + .002) - wave(uu - .002)) / (.004 * SR * 2);
      const d = Math.abs(py - C[1] - wy) / Math.sqrt(1 + dw * dw); if (d > 12) continue;   // only cells near the trace can ever light
      cells.push([px, py, uu, Math.exp(-((d / 4.2) ** 2)), Math.exp(-((d / 1.7) ** 2))]);
    }
    L.cells = cells; L.cellSize = cell;
  },
  live: {
    box: [C[0] - SR - 2, C[1] - SR - 2, SR * 2 + 4, SR * 2 + 4], fps: 30,
    draw(ctx, t, L) {
      const Pd = 3.2, head = (t % Pd) / Pd * 1.18 - .09, cs = L.cellSize;
      const halo = [], core = [];
      for (const [x, y, u, hd, cd] of L.cells) {
        const behind = head - u; const glow = behind >= 0 ? Math.exp(-behind / .22) : Math.exp(-(behind + 1.18) / .22) * .9; if (glow < .03) continue;
        const hb = hd * glow, cb = cd * glow * (behind >= 0 && behind < .02 ? 1.3 : 1);
        if (hb > .04) halo.push(x, y, Math.sqrt(Math.min(1, hb)) * cs * .62);
        if (cb > .12) core.push(x, y, Math.sqrt(Math.min(1, cb)) * cs * .5);
      }
      const dots = (arr, col) => { ctx.fillStyle = col; ctx.beginPath(); for (let i = 0, k = 0; i < arr.length; i += 3) { ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1]); ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, TAU); if (++k % 150 === 0) { ctx.fill(); ctx.beginPath(); } } ctx.fill(); };
      dots(halo, GREEN); dots(core, CORE);
    },
  },
};
