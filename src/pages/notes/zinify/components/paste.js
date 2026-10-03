/*
 * paste.js — cut-and-paste tools for the greyscale masters.
 *
 * Ransom-note headlines (each letter cut from a different typeface and stuck on its own
 * scrap), typewriter strips held down with tape, and black marker. These draw onto a master
 * in plain greys; toner.js turns the result into a photocopy, so newsprint scraps come out
 * dotted, tape edges show as faint lines and cut edges cast thin shadows, as they do on a real
 * copier.
 */
import { rng } from './toner.js';

export const CUT_FONTS = [
  ['"Alfa Slab One"', 400], ['"Bowlby One SC"', 400], ['"Special Elite"', 400],
  ['"UnifrakturCook"', 700], ['"Rubik Mono One"', 400], ['"Playfair Display SC"', 900],
  ['"Stardos Stencil"', 700],
];
export const TYPE = '"Special Elite", "Courier New", monospace';
export const MARKER = '"Permanent Marker", "Comic Sans MS", cursive';

// A scrap of paper cut with scissors: a rectangle whose corners never quite square up.
export function scrapPath(g, x, y, w, h, r) {
  const j = () => (r() - 0.5) * Math.min(w, h) * 0.16;
  g.beginPath();
  g.moveTo(x + j(), y + j());
  g.lineTo(x + w + j(), y + j());
  g.lineTo(x + w + j(), y + h + j());
  g.lineTo(x + j(), y + h + j());
  g.closePath();
}

// The cut edge of a pasted scrap casts a hairline shadow on the copier glass.
function pasted(g, fill, r, x, y, w, h, shadow = 0.38) {
  g.save();
  g.translate(0.9, 1.1); scrapPath(g, x, y, w, h, rng(Math.floor(r() * 1e6)));
  g.fillStyle = `rgba(0,0,0,${shadow})`; g.fill();
  g.restore();
  scrapPath(g, x, y, w, h, r);
  g.fillStyle = fill; g.fill();
}

/*
 * Ransom-note lettering. Returns the width used. Letters are laid left to right from (x, y)
 * (y is the baseline); align 'center' centres the word on x.
 */
export function ransom(g, text, x, y, size, opts = {}) {
  const r = rng(opts.seed || 7), chars = [...text];
  const plan = chars.map((ch, i) => {
    if (ch === ' ') return { ch, w: size * 0.42 };
    let [family, weight] = CUT_FONTS[Math.floor(r() * CUT_FONTS.length)];
    // blackletter Z and S read as 3 and 6; cut those from somewhere else
    if (family.includes('Unifraktur') && 'ZSzs'.includes(ch)) [family, weight] = CUT_FONTS[0];
    const s = size * (0.82 + r() * 0.36), lower = opts.mixCase !== false && r() < 0.18;
    const c = lower ? ch.toLowerCase() : ch.toUpperCase();
    g.font = `${weight} ${s}px ${family}`;
    const mw = g.measureText(c).width, pad = s * (0.12 + r() * 0.12);
    const kind = r() < (opts.invert ?? 0.24) ? 'black' : r() < (opts.news ?? 0.3) ? 'news' : 'white';
    return { ch: c, family, weight, s, w: mw + pad * 2, pad, kind, rot: (r() - 0.5) * (opts.tilt ?? 0.2), dy: (r() - 0.5) * size * 0.14, i };
  });
  const total = plan.reduce((a, p) => a + p.w, 0) + (plan.length - 1) * size * 0.03;
  // a headline that won't fit is re-cut smaller, the way you'd hunt for smaller letters
  if (opts.maxW && total > opts.maxW && !opts._refit) return ransom(g, text, x, y, size * opts.maxW / total * 0.97, { ...opts, _refit: true });
  let cx = opts.align === 'center' ? x - total / 2 : opts.align === 'right' ? x - total : x;
  for (const p of plan) {
    if (p.ch === ' ') { cx += p.w; continue; }
    const h = p.s * 1.22;
    g.save();
    g.translate(cx + p.w / 2, y - p.s * 0.36 + p.dy);
    g.rotate(p.rot);
    const fill = p.kind === 'black' ? '#000' : p.kind === 'news' ? '#d6d6d6' : '#fff';
    pasted(g, fill, r, -p.w / 2, -h / 2, p.w, h, p.kind === 'white' ? 0.42 : 0.3);
    if (p.kind === 'news') {
      // newsprint: tiny columns of grey type behind the letter
      g.save(); scrapPath(g, -p.w / 2, -h / 2, p.w, h, rng(p.i + 99)); g.clip();
      g.fillStyle = '#9a9a9a';
      for (let ly = -h / 2 + 2; ly < h / 2; ly += 3.2) g.fillRect(-p.w / 2, ly, p.w, 1.1);
      g.restore();
    }
    g.font = `${p.weight} ${p.s}px ${p.family}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = p.kind === 'black' ? '#fff' : '#000';
    g.fillText(p.ch, 0, p.s * 0.04);
    g.restore();
    cx += p.w + size * 0.03;
  }
  return total;
}

// Matte tape: translucent, so on a copy it is mostly an outline with a faint grey body.
export function tape(g, x, y, w, h, rot, seed = 3) {
  const r = rng(seed);
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath();
  const teeth = 6;
  g.moveTo(-w / 2, -h / 2);
  g.lineTo(w / 2, -h / 2);
  for (let i = 1; i <= teeth; i++) g.lineTo(w / 2 + (i % 2 ? 1.6 : 0) + (r() - 0.5), -h / 2 + (h * i) / teeth);
  g.lineTo(-w / 2, h / 2);
  for (let i = teeth - 1; i >= 0; i--) g.lineTo(-w / 2 - (i % 2 ? 1.6 : 0) + (r() - 0.5), -h / 2 + (h * i) / teeth);
  g.closePath();
  g.fillStyle = 'rgba(160,160,160,0.28)'; g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.42)'; g.lineWidth = 0.7; g.stroke();
  g.restore();
}

// Typewriter text on a strip of white paper, taped down at both ends.
export function typeStrip(g, lines, x, y, w, size, opts = {}) {
  const r = rng(opts.seed || 11), lh = size * 1.32, h = lines.length * lh + size * 0.9;
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(opts.rot ?? (r() - 0.5) * 0.05);
  pasted(g, '#fff', r, -w / 2, -h / 2, w, h, 0.4);
  g.font = `400 ${size}px ${TYPE}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  lines.forEach((line, i) => {
    // a worn ribbon: some letters strike lighter than others
    let cx = -w / 2 + size * 0.55;
    for (const ch of line) {
      g.fillStyle = r() < 0.12 ? '#555' : '#111';
      g.fillText(ch, cx, -h / 2 + size * 1.12 + i * lh + (r() - 0.5) * 0.5);
      cx += g.measureText(ch).width;
    }
  });
  if (opts.tape !== false) {
    tape(g, -w / 2 + 6, -h / 2 + 2, size * 2.6, size * 1.1, -0.5 + r() * 0.3, Math.floor(r() * 99));
    tape(g, w / 2 - 6, h / 2 - 2, size * 2.6, size * 1.1, -0.5 + r() * 0.3, Math.floor(r() * 99));
  }
  g.restore();
  return h;
}

export function marker(g, text, x, y, size, opts = {}) {
  g.save(); g.translate(x, y); g.rotate(opts.rot || 0);
  g.font = `400 ${size}px ${MARKER}`; g.textAlign = opts.align || 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = opts.color || '#000'; g.fillText(text, 0, 0);
  g.restore();
}

// A marker stroke through points, slightly wobbly, with a rounded nib.
export function markerLine(g, pts, width = 3.2, seed = 5) {
  const r = rng(seed);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = width; g.strokeStyle = '#000';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const mx = (ax + bx) / 2 + (r() - 0.5) * width * 1.2, my = (ay + by) / 2 + (r() - 0.5) * width * 1.2;
    g.quadraticCurveTo(mx, my, bx, by);
  }
  g.stroke(); g.restore();
}

export function markerArrow(g, x0, y0, x1, y1, bend = 0.2, width = 3, seed = 9) {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend, pts = [];
  for (let t = 0; t <= 1.001; t += 0.1) pts.push([(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1]);
  markerLine(g, pts, width, seed);
  const a = Math.atan2(y1 - my, x1 - mx), L = width * 4.2;
  markerLine(g, [[x1 - Math.cos(a - 0.5) * L, y1 - Math.sin(a - 0.5) * L], [x1, y1], [x1 - Math.cos(a + 0.5) * L, y1 - Math.sin(a + 0.5) * L]], width, seed + 1);
}

// A hand-drawn loop around something: an ellipse that overshoots its start.
export function markerRing(g, cx, cy, rx, ry, width = 2.8, seed = 4) {
  const r = rng(seed), pts = [], a0 = r() * 6.28;
  for (let t = 0; t <= 1.12; t += 0.04) {
    const a = a0 + t * 6.28, k = 1 + (r() - 0.5) * 0.05 + t * 0.06;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  markerLine(g, pts, width, seed);
}

// A starburst, the zine-maker's favourite punctuation.
export function burst(g, cx, cy, r0, r1, n, fill = '#000', seed = 2) {
  const r = rng(seed);
  g.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r0 : r1 * (0.85 + r() * 0.3);
    g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  g.closePath(); g.fillStyle = fill; g.fill();
}
