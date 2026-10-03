// Dyson Swarm — space-age screenprint.
// Living detail: collectors orbit, and cross in front of the sun.
import { PI, TAU, DW, DH, bez, vnoise, smooth, pathPts, halftone, spaced, wear, paperTex } from './kit.js';

const PAPER = '#ebe1c8', NAVY = '#151b32', ORANGE = '#ff6b2f', YELLOW = '#f6c444', CREAM = '#f2e7cb';
const SUN = [256, 236], SR = 120, TILT = -.2;
const RINGS = [[160, 40, 28, 3], [200, 52, 36, 2], [244, 64, 46, 1], [292, 78, 54, 1]];
const MER = [96, 404], MR = 40;
const ringPt = (rx, ry, a) => { const x = rx * Math.cos(a), y = ry * Math.sin(a); return [SUN[0] + x * Math.cos(TILT) - y * Math.sin(TILT), SUN[1] + x * Math.sin(TILT) + y * Math.cos(TILT)]; };
const STREAM = bez([MER[0] + 26, MER[1] - 30], [160, 320], [128, 296], ringPt(160, 40, 2.9), 60);

export default {
  seed: 61, still: 5, fonts: ['michroma-400'],
  build(L) {
    const b = L.bctx, r = L.rng;
    b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
    let n = 0;
    const screen = (fn, col, o = {}, p = {}) => L.paint(L.base, fn, { color: col, blur: .6, rough: .8, mottle: .08, voids: .2, voidT: .72, grain: .03, salt: ++n, ...o }, p);
    screen(x => x.fillRect(-5, -5, 410, 610), NAVY, { voids: .3, voidT: .83, mottle: .1 }, { mode: 'multiply' });
    // ring backs (behind the sun)
    const dotted = (x, rx, ry, front) => { let on = false; for (let a = 0; a <= TAU + .01; a += 1.2 / rx) { const p = ringPt(rx, ry, a); if ((Math.sin(a) > 0) === front) { on ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); on = true; } else on = false; } };
    screen(x => { x.lineWidth = .8; x.beginPath(); for (const [rx, ry] of RINGS) dotted(x, rx, ry, false); x.stroke(); }, CREAM, { blur: 0, voids: 0 }, { alpha: .45 });
    // corona: a coarse halftone glow
    const glow = L.mask(x => { const g = x.createRadialGradient(SUN[0], SUN[1], SR * .9, SUN[0], SUN[1], SR + 90); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, DW, DH); });
    L.put(L.base, L.ink(halftone(L, glow, { cell: 3.4, angle: .26, gain: .75 }), { color: ORANGE, blur: .4, rough: .5, salt: 9 }));
    screen(x => { x.beginPath(); x.arc(SUN[0], SUN[1], SR, 0, TAU); x.fill(); }, ORANGE, {}, {});
    screen(x => { x.beginPath(); x.arc(SUN[0] - 6, SUN[1] - 5, SR * .74, 0, TAU); x.fill(); }, YELLOW, {}, { dx: 1.2, dy: -.8 });
    screen(x => { for (const [a, rr, s] of [[-.6, .4, 4], [-.4, .48, 2.6], [2.4, .3, 3.2]]) { x.beginPath(); x.arc(SUN[0] - 6 + Math.cos(a) * SR * rr, SUN[1] - 5 + Math.sin(a) * SR * rr, s, 0, TAU); x.fill(); } }, ORANGE, { blur: .3 }, { dx: 1.2, dy: -.8 });
    screen(x => { x.lineWidth = .9; x.beginPath(); for (const [rx, ry] of RINGS) dotted(x, rx, ry, true); x.stroke(); }, CREAM, { blur: 0, voids: 0 }, { alpha: .75 });
    // Mercury, half eaten, shaded with a navy dot screen
    const bite = x => { x.beginPath(); const pts = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU; const rr = 27 + 7 * vnoise(Math.cos(a) * 2 + 3, Math.sin(a) * 2, 4); pts.push([MER[0] + 31 + Math.cos(a) * rr, MER[1] - 28 + Math.sin(a) * rr]); } pathPts(x, pts, true); };
    screen(x => { x.beginPath(); x.arc(MER[0], MER[1], MR, 0, TAU); x.fill(); x.globalCompositeOperation = 'destination-out'; bite(x); x.fill(); }, CREAM, {}, {});
    const shade = L.mask(x => { x.save(); x.beginPath(); x.arc(MER[0], MER[1], MR, 0, TAU); x.clip(); const g = x.createLinearGradient(MER[0] + 26, MER[1] - 26, MER[0] - 34, MER[1] + 32); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.95)'); x.fillStyle = g; x.fillRect(0, 0, DW, DH); x.restore(); x.globalCompositeOperation = 'destination-out'; bite(x); x.fill(); });
    L.put(L.base, L.ink(halftone(L, shade, { cell: 2.3, angle: .8 }), { color: NAVY, blur: .3, rough: .4, salt: 12 }));
    screen(x => { for (let k = 0; k < 14; k++) { const f = r(), p = STREAM[(f * 22) | 0]; x.save(); x.translate(p[0] + (r() - .5) * 8, p[1] + (r() - .5) * 8); x.rotate(r() * PI); x.scale(1.6, 1.6); x.beginPath(); x.moveTo(-2, -1.5); x.lineTo(2.5, -1); x.lineTo(1.5, 2); x.lineTo(-2, 1.2); x.closePath(); x.fill(); x.restore(); } }, CREAM, { blur: .2 }, {});
    screen(x => { x.beginPath(); for (let i = 0; i < STREAM.length; i += 2) { const p = STREAM[i]; x.moveTo(p[0] + .45, p[1]); x.arc(p[0], p[1], .45, 0, TAU); } x.fill(); }, CREAM, { blur: 0, voids: 0 }, { alpha: .45 });
    // type
    screen(x => { x.font = '27px Michroma'; spaced(x, 'DYSON SWARM', 28, 538, 1.5); }, CREAM, { blur: .4, rough: .5, voids: .1 }, {});
    screen(x => { x.font = '7.6px Michroma'; spaced(x, 'AN INTERACTIVE MEGASTRUCTURE', 29, 562, 1.8); spaced(x, '2024', 372, 562, 1.8, 'right'); x.fillRect(29, 510, 34, 2.2); }, YELLOW, { blur: .3, rough: .25, bias: .16, voids: 0, mottle: 0 }, {});
    wear(L, PAPER, .5);
    L.tex = paperTex(L, { mottle: .04, grain: .05, fibres: 260, fAlpha: .06 });
  },
  live: {
    box: [0, 120, 400, 330], fps: 24,
    draw(ctx, t) {
      const Pd = 24;
      RINGS.forEach(([rx, ry, n, laps], ri) => {
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU + ri * .7 + TAU * laps * t / Pd, front = Math.sin(a) > 0, p = ringPt(rx, ry, a);
          const inSun = Math.hypot(p[0] - SUN[0], p[1] - SUN[1]) < SR - 1;
          if (!front && inSun) continue;
          const s = front ? 1 : .72, ta = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) + TILT;
          ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ta); ctx.fillStyle = front && inSun ? NAVY : CREAM;
          ctx.fillRect(-3.4 * s, -1.4 * s, 6.8 * s, 2.8 * s); ctx.fillStyle = front && inSun ? NAVY : YELLOW; ctx.fillRect(-.4 * s, -1.4 * s, .8 * s, 2.8 * s); ctx.restore();
        }
      });
      for (let k = 0; k < 16; k++) { const f = (t / 8 + k / 16) % 1, p = STREAM[Math.min(STREAM.length - 1, (f * STREAM.length) | 0)]; ctx.fillStyle = CREAM; ctx.globalAlpha = smooth(0, .1, f) * (1 - smooth(.85, 1, f)); ctx.fillRect(p[0] - 1.1, p[1] - 1.1, 2.2, 2.2); }
      ctx.globalAlpha = 1;
    },
  },
};
