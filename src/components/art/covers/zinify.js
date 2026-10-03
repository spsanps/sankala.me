// ZINify — two-drum risograph zine, stapled.
// Living detail: the hand-drawn doodles boil.
import { PI, DW, DH, mulberry32, bez, resample, wobble, glyphStrokes, brush, halftone, paperTex } from './kit.js';

const PAPER = '#f3f0e8', BLUE = '#0078bf', PINK = '#ff48b0';
const RISO = { blur: .55, rough: .9, mottle: .25, voids: .55, voidT: .56, grain: .2, streak: .08 };
function star(cx, cy, R, seed, pts = 5) { const r = mulberry32(seed), out = []; for (let k = 0; k <= pts * 2; k++) { const a = -PI / 2 + k * PI / pts, rr = (k % 2 ? R * .45 : R) * (.85 + r() * .3); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return out; }
const boilFrame = t => Math.floor(t * 3.4) % 3;

export default {
  seed: 71, still: 3, fonts: ['courier-prime-400', 'courier-prime-700'],
  build(L) {
    const b = L.bctx, r = L.rng;
    b.fillStyle = PAPER; b.fillRect(0, 0, DW, DH);
    const blue = L.canvas(), pink = L.canvas(), bx = L.ctx(blue), px = L.ctx(pink);
    for (const x of [bx, px]) { x.fillStyle = x.strokeStyle = '#000'; x.lineCap = x.lineJoin = 'round'; }
    // the paper being transformed (blue drum)
    bx.save(); bx.translate(190, 236); bx.rotate(-.09); bx.translate(-190, -236);
    bx.lineWidth = 1.2; bx.strokeRect(62, 72, 262, 318);
    bx.font = '700 10.4px "Courier Prime"'; ['ZINify: Transforming Research Papers', 'into Engaging Zines with Large', 'Language Models'].forEach((s, i) => bx.fillText(s, 80, 98 + i * 12));
    bx.font = '400 7.4px "Courier Prime"'; bx.fillText('J. Shriram and S. P. Kumar Sreekala', 80, 144);
    bx.font = '700 7.6px "Courier Prime"'; bx.fillText('Abstract', 80, 164);
    for (let col = 0; col < 2; col++) for (let ln = 0; ln < 22; ln++) { const y = 174 + ln * 9; if (col === 1 && ln > 4 && ln < 13) continue; let x0 = 80 + col * 122; const end = x0 + 108 - (ln % 7 === 6 ? 40 : r() * 6); while (x0 < end) { const w = 6 + r() * 20; bx.fillRect(x0, y, Math.min(w, end - x0), 2.1); x0 += w + 3; } }
    bx.lineWidth = .8; bx.strokeRect(204, 214, 104, 66); for (let k = 0; k < 7; k++) { const h = 10 + r() * 44; bx.fillRect(212 + k * 13.5, 274 - h, 8, h); }
    bx.restore();
    // halftone shadow under the page (blue)
    const sh = L.mask(x => { x.translate(190, 236); x.rotate(-.09); x.translate(-190, -236); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(70, 82, 262, 318); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fillRect(62, 72, 262, 318); });
    bx.save(); bx.setTransform(1, 0, 0, 1, 0, 0); bx.drawImage(halftone(L, sh, { cell: 3.2, angle: 1.31 }), 0, 0); bx.restore();
    // pink drum: big halftone blob behind the lettering
    const blob = L.mask(x => { const g = x.createRadialGradient(250, 446, 10, 250, 446, 150); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(.7, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(250, 446, 150, 132, -.2, 0, Math.PI * 2); x.fill(); });
    px.save(); px.setTransform(1, 0, 0, 1, 0, 0); px.drawImage(halftone(L, blob, { cell: 4.4, angle: .38 }), 0, 0); px.restore();
    // hand lettering
    const g = glyphStrokes('ZINIFY!', { x: 200, y: 506, size: 74, align: 'center', track: .26, jrot: .08, jy: .07, js: .06, seed: 12 });
    const rot = (x, fn) => { x.save(); x.translate(200, 470); x.rotate(-.075); x.translate(-200, -470); fn(); x.restore(); };
    rot(bx, () => { bx.translate(4.5, 4.5); brush(bx, g.strokes, { w: 76 * .17, wob: 1.1, wobF: .05, seed: 4 }); });
    rot(px, () => brush(px, g.strokes, { w: 76 * .17, wob: 1.1, wobF: .05, seed: 4 }));
    const g2 = glyphStrokes('RESEARCH PAPERS → ZINES', { x: 200, y: 560, size: 12.5, align: 'center', track: .16, jrot: .06, jy: .06, seed: 13 });
    rot(bx, () => brush(bx, g2.strokes, { w: 1.9, wob: .3, seed: 5 }));
    // sticker: pink disc, blue words → purple where they overprint
    px.beginPath(); px.arc(322, 122, 36, 0, Math.PI * 2); px.fill();
    const g3 = glyphStrokes('UIST', { x: 322, y: 119, size: 19, align: 'center', track: .2, jrot: .04, seed: 14 }), g4 = glyphStrokes('2023', { x: 322, y: 141, size: 13, align: 'center', track: .16, jrot: .05, seed: 15 });
    bx.save(); bx.translate(322, 122); bx.rotate(.18); bx.translate(-322, -122); brush(bx, [...g3.strokes, ...g4.strokes], { w: 3, wob: .25, seed: 6 }); bx.restore();
    L.put(L.base, L.ink(blue, { color: BLUE, ...RISO, salt: 1 }), { mode: 'multiply' });
    L.put(L.base, L.ink(pink, { color: PINK, ...RISO, salt: 2 }), { mode: 'multiply', dx: 1.4, dy: -1, rot: .0035 });
    // the doodles boil: three hand-drawn takes, cycled
    L.boil = [0, 1, 2].map(v => L.ink(L.mask(x => {
      const j = (pts, a) => wobble(resample(pts, 2), a, .15, v * 31 + pts.length);
      brush(x, [j(star(60, 420, 15, 3 + v), 1), j(star(354, 528, 11, 9 + v), .9), j(star(88, 566, 8, 21 + v, 4), .7), j(star(270, 52, 9, 33 + v, 4), .7)], { w: 2.4, wob: .4, seed: 7 + v });
      brush(x, [j(bez([330, 352], [372, 380], [366, 412], [334, 424], 24), 1.2), j([[334, 424], [347, 413]], .6), j([[334, 424], [349, 428]], .6)], { w: 2.6, wob: .4, seed: 9 + v });
      brush(x, [j(bez([118, 590], [160, 580], [240, 596], [290, 584], 30), 1)], { w: 2.2, wob: .4, seed: 11 + v });
    }), { color: PINK, ...RISO, salt: 3 + v }));
    // staples through the fold
    const o = L.octx;
    for (const sy of [150, 450]) { o.fillStyle = 'rgba(40,40,40,.25)'; o.fillRect(-1, sy + 1.6, 11, 1.8); const gr = o.createLinearGradient(0, sy - 1.3, 0, sy + 1.3); gr.addColorStop(0, '#e6e8ea'); gr.addColorStop(.5, '#9ea3a8'); gr.addColorStop(1, '#6d7276'); o.fillStyle = gr; o.fillRect(-1, sy - 1.3, 10, 2.6); }
    const fold = o.createLinearGradient(0, 0, 9, 0); fold.addColorStop(0, 'rgba(60,50,40,.16)'); fold.addColorStop(1, 'rgba(60,50,40,0)'); o.fillStyle = fold; o.fillRect(0, 0, 9, DH);
    L.tex = paperTex(L, { mottle: .03, grain: .04, fibres: 120, fAlpha: .04 });
  },
  live: { box: [36, 30, 340, 570], key: boilFrame, draw(ctx, t, L) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L.boil[boilFrame(t)], 0, 0); ctx.restore(); } },
};
