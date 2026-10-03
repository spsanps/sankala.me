/*
 * masters.js — every drawing in the figure, as greyscale masters for the copier.
 *
 * Masters are drawn in design units (DU) on a canvas scaled by px. Paper-coloured areas are
 * left white (or transparent for props drawn straight onto the flyer); greys become toner dots
 * when copied. Facts on the zine pages paraphrase the ZINify paper (Shriram & Sreekala,
 * UIST '23 Adjunct); the poem is quoted from its Figure 3.
 */
import { makeCanvas, rng } from './toner.js';
import { ransom, typeStrip, marker, markerLine, markerArrow, markerRing, burst, TYPE, MARKER } from './paste.js';

export function master(w, h, px, draw, opts = {}) {
  const c = makeCanvas(w * px, h * px), g = c.getContext('2d');
  if (opts.white !== false) { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
  g.scale(px, px);
  draw(g, w, h);
  return c;
}

const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
const shape = (g, pts, fill, line = 3) => { poly(g, pts); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.lineWidth = line; g.strokeStyle = '#000'; g.lineJoin = 'round'; g.stroke(); } };
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

/* ---------------------------------------------------------------- the copier --------- */
// Oblique view: front face square-on, the top deck receding up and to the right.
export const COPIER = { w: 560, h: 500, ox: 40, oy: 232, fw: 344, fh: 228, dx: 36, dy: -60 };
// where finished copies come out: the mouth of the tray on the right side
export const TRAY = { x: COPIER.ox + COPIER.fw + COPIER.dx * 0.42, y: COPIER.oy + 72 + COPIER.dy * 0.42 };
const C = COPIER;
// point on the top deck: u across (0..1), v into the depth (0..1)
export const deck = (u, v) => [C.ox + C.fw * u + C.dx * v, C.oy + C.dy * v];
// where the glass sits (u, v ranges) and the hinge line of the lid
export const GLASS = { u0: 0.05, u1: 0.68, v0: 0.14, v1: 0.84 };

export function drawCopier(g, lid = 0 /* 0 open … 1 closed */) {
  const { ox, oy, fw, fh, dx, dy } = C;
  const FL = [ox, oy], FR = [ox + fw, oy], BL = [ox + fw + dx, oy + dy], B0 = [ox + dx, oy + dy];
  const bottom = oy + fh;

  // floor shadow
  g.save(); g.beginPath(); g.ellipse(ox + fw / 2 + 20, bottom + 20, fw * 0.62, 15, 0, 0, Math.PI * 2); g.fillStyle = '#9b9b9b'; g.fill(); g.restore();
  // casters
  for (const x of [ox + 34, ox + fw - 30]) { g.beginPath(); g.arc(x, bottom + 12, 9, 0, Math.PI * 2); g.fillStyle = '#000'; g.fill(); }


  // right side face, the darkest
  shape(g, [FR, BL, [BL[0], bottom + dy], [FR[0], bottom]], '#a2a2a2', 3);
  // vents low on the side
  g.lineWidth = 2; g.strokeStyle = '#000';
  for (let i = 0; i < 5; i++) { const y = oy + 130 + i * 12; g.beginPath(); g.moveTo(FR[0] + 9, y + 2); g.lineTo(FR[0] + dx - 8, y - 32); g.stroke(); }
  // output tray, sticking out of the right side where the copies land
  const T = TRAY;
  // the slot the copies come out of
  shape(g, [[T.x - 3, T.y - 30], [T.x + 7, T.y - 38], [T.x + 7, T.y - 22], [T.x - 3, T.y - 14]], '#000', 1.5);
  // a shallow tray, wider than a sheet, tilted down and out
  shape(g, [[T.x - 2, T.y - 10], [T.x + 30, T.y - 34], [T.x + 132, T.y - 18], [T.x + 102, T.y + 8]], '#e2e2e2', 2.6);
  shape(g, [[T.x + 102, T.y + 8], [T.x + 132, T.y - 18], [T.x + 134, T.y - 10], [T.x + 104, T.y + 16]], '#7a7a7a', 2.2);
  shape(g, [[T.x - 2, T.y - 10], [T.x + 102, T.y + 8], [T.x + 104, T.y + 16], [T.x - 2, T.y - 3]], '#a9a9a9', 2.2);

  // front face
  shape(g, [FL, FR, [FR[0], bottom], [ox, bottom]], '#d4d4d4', 3);
  // upper band with the name plate
  g.fillStyle = '#c4c4c4'; g.fillRect(ox + 1.5, oy + 1.5, fw - 3, 84);
  g.lineWidth = 3; g.strokeStyle = '#000'; g.beginPath(); g.moveTo(ox, oy + 86); g.lineTo(ox + fw, oy + 86); g.stroke();
  rrect(g, ox + 20, oy + 22, 176, 40, 4); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.4; g.stroke();
  g.font = `700 25px "Stardos Stencil", "Courier New", monospace`; g.fillStyle = '#000'; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillText('ZINIFY 2023', ox + 31, oy + 43);
  g.font = `400 9px ${TYPE}`; g.fillText('COPY CENTER · UIST', ox + 214, oy + 30);
  // a keyhole and a little warning label
  g.beginPath(); g.arc(ox + 300, oy + 50, 6, 0, Math.PI * 2); g.fill();
  rrect(g, ox + 214, oy + 40, 62, 26, 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 1.6; g.stroke();
  g.fillStyle = '#000'; g.font = `400 7.4px ${TYPE}`; g.fillText('CAUTION: HOT', ox + 219, oy + 48); g.fillText('DO NOT FEED', ox + 219, oy + 58);
  // drawers
  for (const [i, y] of [[0, oy + 98], [1, oy + 158]]) {
    rrect(g, ox + 16, y, fw - 86, 52, 3); g.fillStyle = '#c9c9c9'; g.fill(); g.lineWidth = 2.6; g.stroke();
    rrect(g, ox + 16 + (fw - 86) / 2 - 34, y + 9, 68, 11, 5); g.fillStyle = '#000'; g.fill();
    rrect(g, ox + 26, y + 31, 34, 14, 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 1.6; g.stroke();
    g.fillStyle = '#000'; g.font = `400 9px ${TYPE}`; g.fillText(i ? 'LTR' : 'A4', ox + 32, y + 39);
    g.fillStyle = '#7a7a7a'; g.fillRect(ox + 18, y + 49, fw - 90, 3);
  }
  // service door at the right of the front
  g.lineWidth = 2.4; g.strokeStyle = '#000'; g.beginPath(); g.moveTo(ox + fw - 58, oy + 98); g.lineTo(ox + fw - 58, bottom - 8); g.stroke();
  g.beginPath(); g.arc(ox + fw - 48, oy + 150, 4, 0, Math.PI * 2); g.fillStyle = '#000'; g.fill();

  // top deck
  shape(g, [FL, FR, BL, B0], '#e6e6e6', 3);
  // control panel, raised on the right of the deck
  const p = (u, v) => deck(u, v);
  shape(g, [p(0.73, 0.08), p(0.97, 0.08), p(0.97, 0.9), p(0.73, 0.9)], '#b4b4b4', 2.4);
  shape(g, [p(0.76, 0.52), p(0.94, 0.52), p(0.94, 0.8), p(0.76, 0.8)], '#111', 1.8);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const [x, y] = p(0.775 + c * 0.05, 0.16 + r * 0.11); g.beginPath(); g.ellipse(x, y, 5.2, 3.4, 0, 0, Math.PI * 2);
    g.fillStyle = '#fff'; g.fill(); g.lineWidth = 1.4; g.strokeStyle = '#000'; g.stroke();
  }
  { const [x, y] = p(0.935, 0.24); g.beginPath(); g.ellipse(x, y, 9, 6, 0, 0, Math.PI * 2); g.fillStyle = '#000'; g.fill();
    g.beginPath(); g.moveTo(x - 3, y - 3); g.lineTo(x + 4, y); g.lineTo(x - 3, y + 3); g.closePath(); g.fillStyle = '#fff'; g.fill(); }

  // the glass, with the lid somewhere between open and closed
  const G = GLASS, gq = [p(G.u0, G.v0), p(G.u1, G.v0), p(G.u1, G.v1), p(G.u0, G.v1)];
  shape(g, gq, '#141414', 2.4);
  g.save(); poly(g, gq); g.clip(); g.strokeStyle = '#fff'; g.lineWidth = 3;
  for (const k of [0.25, 0.33]) { const a = p(G.u0 + (G.u1 - G.u0) * k, G.v0), b = p(G.u0 + (G.u1 - G.u0) * (k + 0.22), G.v1); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.restore();
  drawLid(g, lid);
}

// The lid hinges on the back edge of the deck. open = standing up; closed = lying on the glass.
function drawLid(g, t) {
  const hingeA = deck(0.02, 0.97), hingeB = deck(0.71, 0.97);
  const closedV = [deck(0.02, 0.03)[0] - hingeA[0], deck(0.02, 0.03)[1] - hingeA[1]];   // towards the viewer, down
  const openV = [16, -158];                                                                  // up, leaning back a touch
  const a = t * Math.PI / 2, v = [openV[0] * Math.cos(a) + closedV[0] * Math.sin(a), openV[1] * Math.cos(a) + closedV[1] * Math.sin(a)];
  const A2 = [hingeA[0] + v[0], hingeA[1] + v[1]], B2 = [hingeB[0] + v[0], hingeB[1] + v[1]];
  const thick = 9;
  if (t < 0.55) {
    // we see the underside: a white pad inside a grey frame
    shape(g, [hingeA, hingeB, B2, A2], '#bdbdbd', 3);
    const ins = (P, Q, k) => [P[0] + (Q[0] - P[0]) * k, P[1] + (Q[1] - P[1]) * k];
    const i1 = ins(ins(hingeA, hingeB, 0.05), ins(A2, B2, 0.05), 0.06), i2 = ins(ins(hingeA, hingeB, 0.95), ins(A2, B2, 0.95), 0.06);
    const i3 = ins(ins(hingeA, hingeB, 0.95), ins(A2, B2, 0.95), 0.92), i4 = ins(ins(hingeA, hingeB, 0.05), ins(A2, B2, 0.05), 0.92);
    shape(g, [i1, i2, i3, i4], '#fff', 1.6);
    // thickness along the top edge
    shape(g, [A2, B2, [B2[0] + 4, B2[1] - thick], [A2[0] + 4, A2[1] - thick]], '#8d8d8d', 2.4);
  } else {
    // we see the top of the lid, then its front edge
    shape(g, [[hingeA[0], hingeA[1] - thick], [hingeB[0], hingeB[1] - thick], [B2[0], B2[1] - thick], [A2[0], A2[1] - thick]], '#cbcbcb', 3);
    shape(g, [[A2[0], A2[1] - thick], [B2[0], B2[1] - thick], B2, A2], '#8f8f8f', 2.4);
    const h = [(A2[0] + B2[0]) / 2, A2[1] - thick / 2]; rrect(g, h[0] - 22, h[1] - 2.5, 44, 5, 2.5); g.fillStyle = '#000'; g.fill();
  }
}

/* ---------------------------------------------------------------- the paper ---------- */
export const PAPER = { w: 172, h: 222 };
// The first page of the ZINify paper, small enough that only the title reads.
export function drawPaper(g, w, h) {
  const r = rng(41), bar = (x, y, len) => { g.fillStyle = '#7d7d7d'; g.fillRect(x, y, len, 2.3); };
  g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `700 9.4px Georgia, "Times New Roman", serif`;
  g.fillText('ZINify: Transforming Research', w / 2, 17);
  g.fillText('Papers into Engaging Zines with', w / 2, 28);
  g.fillText('Large Language Models', w / 2, 39);
  g.font = `400 5.6px Georgia, serif`;
  g.fillText('Jaidev Shriram*   Sanjayan Sreekala*  ·  UC San Diego', w / 2, 49);
  g.textAlign = 'left'; g.font = `700 6px Georgia, serif`; g.fillText('ABSTRACT', 12, 62);
  for (let i = 0; i < 6; i++) bar(12, 67 + i * 4.3, i === 5 ? 62 : w - 24 - r() * 4);
  g.fillText('1  INTRODUCTION', 12, 101);
  for (let i = 0; i < 24; i++) bar(12, 105 + i * 4.3, i % 9 === 8 ? 30 + r() * 20 : 70 - r() * 3);
  // Figure 1 in the right column
  g.lineWidth = 1.2; g.strokeStyle = '#000'; g.strokeRect(92, 98, 68, 52);
  g.fillStyle = '#e5e5e5'; g.fillRect(100, 106, 18, 24); g.fillStyle = '#000';
  for (let i = 0; i < 5; i++) g.fillRect(102, 109 + i * 4, 14, 1.2);
  g.beginPath(); g.moveTo(122, 118); g.lineTo(130, 118); g.lineTo(127, 115); g.moveTo(130, 118); g.lineTo(127, 121); g.stroke();
  g.fillStyle = '#9a9a9a'; poly(g, [[134, 106], [146, 109], [158, 106], [158, 132], [146, 135], [134, 132]]); g.fill(); g.stroke();
  g.font = `700 4.6px Georgia, serif`; g.fillStyle = '#000'; g.fillText('Figure 1:', 92, 157);
  for (let i = 0; i < 4; i++) bar(92, 160 + i * 4.3, i === 3 ? 30 : 68);
  for (let i = 0; i < 9; i++) bar(92, 180 + i * 4.3, i === 8 ? 40 : 68 - r() * 3);
  g.font = `400 5px Georgia, serif`; g.fillStyle = '#555'; g.fillText('UIST ’23, San Francisco, CA', 12, h - 8);
}
// Bands of the paper that the scissors cut out: [y0, y1] in paper DU, and the figure box.
export const CUTS = [[8, 55], [58, 92], [95, 150], [150, 200]];
export const FIGBOX = [90, 96, 72, 56];

/* ---------------------------------------------------------------- props -------------- */
export const SCISSORS = { w: 120, h: 60 };
// One blade of a pair of scissors, pointing right, pivot at (44, 30). side = 1 upper, -1 lower.
export function drawBlade(g, side) {
  g.save(); g.translate(44, 30); g.scale(1, side);
  // finger loop
  g.beginPath(); g.ellipse(-26, 9, 16, 11, -0.25, 0, Math.PI * 2); g.ellipse(-26, 9, 9, 5.5, -0.25, 0, Math.PI * 2, true);
  g.fillStyle = '#1a1a1a'; g.fill('evenodd');
  g.lineWidth = 2; g.strokeStyle = '#000'; g.beginPath(); g.moveTo(-12, 4); g.lineTo(0, 1); g.stroke();
  // blade
  poly(g, [[-2, -2.5], [72, -2], [76, 0.5], [-2, 4.5]]); g.fillStyle = '#d9d9d9'; g.fill(); g.lineWidth = 2; g.stroke();
  g.lineWidth = 0.9; g.beginPath(); g.moveTo(4, 1); g.lineTo(70, 0); g.stroke();
  g.restore();
  g.beginPath(); g.arc(44, 30, 3.2, 0, Math.PI * 2); g.fillStyle = '#000'; g.fill();
}

export const STAPLER = { w: 150, h: 70 };
export function drawStapler(g, w, h, open = 0) {
  // base
  rrect(g, 6, 50, 136, 14, 6); g.fillStyle = '#3a3a3a'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#000'; g.stroke();
  rrect(g, 108, 52, 26, 6, 2); g.fillStyle = '#d0d0d0'; g.fill();
  // arm, hinged at the back (left)
  g.save(); g.translate(16, 48); g.rotate(-open * 0.42);
  rrect(g, -6, -26, 140, 24, 10); g.fillStyle = '#171717'; g.fill(); g.lineWidth = 2.4; g.stroke();
  g.fillStyle = '#fff'; g.font = `400 8px ${TYPE}`; g.textBaseline = 'middle'; g.fillText('HEAVY DUTY', 20, -14);
  g.restore();
}

export const BOARD = { w: 300, h: 214 };
// The paste-up sheet: eight page boxes, imposed the way the copies will be folded.
export const BOX = (i) => ({ x: 14 + (i % 4) * 70, y: 32 + Math.floor(i / 4) * 90, w: 62, h: 82 });
export function drawBoard(g, w, h) {
  g.fillStyle = '#000'; g.font = `400 13px ${MARKER}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.fillText('PASTE-UP  (8 pages)', 14, 22);
  g.setLineDash([3, 3]); g.lineWidth = 1; g.strokeStyle = '#555';
  for (let i = 0; i < 8; i++) { const b = BOX(i); g.strokeRect(b.x, b.y, b.w, b.h); }
  g.setLineDash([]);
  g.font = `400 8px ${TYPE}`; g.fillStyle = '#666';
  for (let i = 0; i < 8; i++) { const b = BOX(i); g.fillText(String(i + 1), b.x + 3, b.y + b.h - 4); }
  // crop marks
  g.strokeStyle = '#000'; g.lineWidth = 0.8;
  for (const [x, y] of [[6, 6], [w - 6, 6], [6, h - 6], [w - 6, h - 6]]) { g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.moveTo(x, y - 4); g.lineTo(x, y + 4); g.stroke(); }
}

// The little slips the plan writes: typewriter text for words, marker prompts for pictures.
export const SLIP = { w: 58, h: 24 };
export const PROMPTS = ['a zine cover', 'a walled garden', 'a curious reader', 'a pile of papers', 'stapled zines', 'a pipeline', 'math into verse', 'an award'];
export function drawPromptSlip(g, w, h, i) {
  g.strokeStyle = '#000'; g.lineWidth = 0.8; g.strokeRect(0.5, 0.5, w - 1, h - 1);
  g.fillStyle = '#000'; g.font = `400 6.6px ${TYPE}`; g.textAlign = 'left'; g.fillText('prompt:', 4, 9);
  g.font = `400 8.6px ${MARKER}`; g.fillText(PROMPTS[i], 4, 19.5);
}

/* ---------------------------------------------------------------- pictures ----------- */
// Halftone illustrations for the zine pages. Each draws into a box (x, y, w, h).
function shade(g, x0, y0, x1, y1, a, b) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; }

export const PICTURES = {
  cover(g, x, y, w, h) {
    // a research paper on the left, scissors-cut into a folded zine on the right
    g.save(); g.translate(x, y);
    g.fillStyle = '#fff'; g.fillRect(w * 0.06, h * 0.12, w * 0.36, h * 0.76); g.lineWidth = 2; g.strokeStyle = '#000'; g.strokeRect(w * 0.06, h * 0.12, w * 0.36, h * 0.76);
    g.fillStyle = '#777'; for (let i = 0; i < 11; i++) g.fillRect(w * 0.1, h * (0.2 + i * 0.058), w * (i % 4 === 3 ? 0.16 : 0.28), 2.2);
    g.fillStyle = '#000'; g.fillRect(w * 0.1, h * 0.15, w * 0.24, 3.6);
    markerArrow(g, w * 0.46, h * 0.52, w * 0.58, h * 0.48, -0.25, 2.6, 31);
    poly(g, [[w * 0.62, h * 0.18], [w * 0.78, h * 0.24], [w * 0.95, h * 0.18], [w * 0.95, h * 0.84], [w * 0.78, h * 0.9], [w * 0.62, h * 0.84]]);
    g.fillStyle = shade(g, w * 0.6, 0, w * 0.95, 0, '#5a5a5a', '#bdbdbd'); g.fill(); g.lineWidth = 2; g.stroke();
    g.beginPath(); g.moveTo(w * 0.78, h * 0.24); g.lineTo(w * 0.78, h * 0.9); g.stroke();
    burst(g, w * 0.86, h * 0.36, 7, 13, 9, '#fff', 3); g.lineWidth = 1.2; g.stroke();
    g.restore();
  },
  garden(g, x, y, w, h) {
    g.save(); g.translate(x, y);
    // trees peeking over the wall
    for (const [cx, r] of [[0.22, 0.2], [0.42, 0.25], [0.66, 0.22], [0.86, 0.17]]) { g.beginPath(); g.arc(w * cx, h * 0.36, w * r, 0, Math.PI * 2); g.fillStyle = shade(g, 0, h * 0.1, 0, h * 0.6, '#2a2a2a', '#6a6a6a'); g.fill(); }
    // the wall, brick by brick
    g.fillStyle = '#9d9d9d'; g.fillRect(0, h * 0.44, w, h * 0.5);
    g.strokeStyle = '#000'; g.lineWidth = 1.2;
    for (let row = 0; row < 7; row++) { const yy = h * 0.44 + row * h * 0.071; g.beginPath(); g.moveTo(0, yy); g.lineTo(w, yy); g.stroke();
      for (let bx = (row % 2) * 9; bx < w; bx += 18) { g.beginPath(); g.moveTo(bx, yy); g.lineTo(bx, yy + h * 0.071); g.stroke(); } }
    // an arched gate, locked
    g.beginPath(); g.moveTo(w * 0.38, h * 0.94); g.lineTo(w * 0.38, h * 0.62); g.arc(w * 0.5, h * 0.62, w * 0.12, Math.PI, 0); g.lineTo(w * 0.62, h * 0.94); g.closePath();
    g.fillStyle = '#111'; g.fill(); g.lineWidth = 2; g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 1.4; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(w * (0.38 + k * 0.06), h * 0.6); g.lineTo(w * (0.38 + k * 0.06), h * 0.94); g.stroke(); }
    rrect(g, w * 0.46, h * 0.74, w * 0.08, h * 0.08, 2); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1.4; g.stroke();
    g.beginPath(); g.arc(w * 0.5, h * 0.74, w * 0.025, Math.PI, 0); g.stroke();
    g.restore();
  },
  reader(g, x, y, w, h) {
    g.save(); g.translate(x, y);
    // a steep slope made of stacked papers
    for (let i = 0; i < 9; i++) { const yy = h * 0.92 - i * h * 0.08; g.fillStyle = i % 2 ? '#fff' : '#cfcfcf'; g.fillRect(w * (0.08 + i * 0.07), yy, w * (0.86 - i * 0.07), h * 0.08); g.strokeStyle = '#000'; g.lineWidth = 1.1; g.strokeRect(w * (0.08 + i * 0.07), yy, w * (0.86 - i * 0.07), h * 0.08); }
    // a small climber with a book
    const cx = w * 0.28, cy = h * 0.66;
    g.fillStyle = '#111'; g.beginPath(); g.arc(cx, cy - h * 0.12, w * 0.045, 0, Math.PI * 2); g.fill();
    g.lineWidth = 3; g.strokeStyle = '#111'; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx, cy - h * 0.08); g.lineTo(cx + 2, cy + h * 0.02); g.lineTo(cx - 5, cy + h * 0.1); g.moveTo(cx + 2, cy + h * 0.02); g.lineTo(cx + 9, cy + h * 0.09); g.moveTo(cx, cy - h * 0.05); g.lineTo(cx + 11, cy - h * 0.08); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(cx + 9, cy - h * 0.12, 9, 7); g.lineWidth = 1.2; g.strokeRect(cx + 9, cy - h * 0.12, 9, 7);
    g.font = `400 ${h * 0.16}px ${MARKER}`; g.fillStyle = '#000'; g.fillText('?', w * 0.42, h * 0.32); g.fillText('?', w * 0.55, h * 0.2);
    g.restore();
  },
  author(g, x, y, w, h) {
    g.save(); g.translate(x, y);
    // a growth curve drawn in marker over graph paper
    g.strokeStyle = '#bdbdbd'; g.lineWidth = 0.8;
    for (let i = 0; i <= 6; i++) { g.beginPath(); g.moveTo(w * 0.1, h * (0.1 + i * 0.13)); g.lineTo(w * 0.95, h * (0.1 + i * 0.13)); g.stroke(); g.beginPath(); g.moveTo(w * (0.1 + i * 0.14), h * 0.1); g.lineTo(w * (0.1 + i * 0.14), h * 0.88); g.stroke(); }
    markerLine(g, [[w * 0.1, h * 0.88], [w * 0.1, h * 0.06]], 2.2, 3); markerLine(g, [[w * 0.1, h * 0.88], [w * 0.96, h * 0.88]], 2.2, 4);
    const pts = []; for (let t = 0; t <= 1.0001; t += 0.05) pts.push([w * (0.12 + t * 0.78), h * (0.86 - (Math.exp(t * 3.2) - 1) / (Math.exp(3.2) - 1) * 0.74)]);
    markerLine(g, pts, 3.4, 7);
    // a tiny paper waving at the top of the pile
    g.save(); g.translate(w * 0.86, h * 0.1); g.rotate(0.2); g.fillStyle = '#fff'; g.fillRect(-7, -9, 14, 18); g.lineWidth = 1.3; g.strokeStyle = '#000'; g.strokeRect(-7, -9, 14, 18);
    g.fillStyle = '#000'; for (let i = 0; i < 4; i++) g.fillRect(-5, -6 + i * 4, 10, 1.3); g.restore();
    g.font = `400 ${h * 0.1}px ${MARKER}`; g.fillStyle = '#000'; g.fillText('pick me!', w * 0.4, h * 0.14);
    g.restore();
  },
  zines(g, x, y, w, h) {
    g.save(); g.translate(x, y);
    for (let i = 0; i < 5; i++) {
      g.save(); g.translate(w * (0.26 + i * 0.03), h * (0.78 - i * 0.12)); g.rotate((i % 2 ? 1 : -1) * 0.09);
      g.fillStyle = i === 4 ? '#3a3a3a' : ['#fff', '#d0d0d0', '#fff', '#a8a8a8'][i];
      g.fillRect(-w * 0.22, -h * 0.07, w * 0.5, h * 0.12); g.lineWidth = 1.6; g.strokeStyle = '#000'; g.strokeRect(-w * 0.22, -h * 0.07, w * 0.5, h * 0.12);
      g.fillStyle = '#000'; g.fillRect(-w * 0.12, -h * 0.07, 2, h * 0.02); g.fillRect(w * 0.12, -h * 0.07, 2, h * 0.02);
      g.restore();
    }
    burst(g, w * 0.8, h * 0.24, 10, 19, 11, '#000', 8);
    g.save(); g.translate(w * 0.8, h * 0.25); g.rotate(-0.15); g.fillStyle = '#fff'; g.font = `400 ${h * 0.09}px ${MARKER}`; g.textAlign = 'center'; g.fillText('DIY', 0, 4); g.restore();
    g.restore();
  },
  pipeline(g, x, y, w, h) {
    // Figure 2 of the paper, re-pasted: cut-out labels and marker arrows
    g.save(); g.translate(x, y);
    const steps = [['PDF', 0.13, 0.1], ['LLM', 0.48, 0.1], ['summary + figures', 0.72, 0.28], ['LLM', 0.6, 0.48], ['zine plan', 0.26, 0.52], ['text-to-image', 0.34, 0.76], ['ZINE!', 0.82, 0.88]];
    const at = (i) => [w * steps[i][1], h * steps[i][2]];
    for (let i = 0; i < steps.length - 1; i++) { const [a, b] = [at(i), at(i + 1)]; markerArrow(g, a[0] + (b[0] > a[0] ? 14 : -14), a[1] + 5, b[0] + (b[0] > a[0] ? -16 : 16), b[1] - 4, 0.18, 1.8, 40 + i); }
    // the bypass: figures skip the plan and go straight to the pictures
    const s = at(2), e = at(5); g.setLineDash([3, 3]); markerArrow(g, s[0] + 4, s[1] + 10, e[0] + 32, e[1] - 8, 0.38, 1.4, 60); g.setLineDash([]);
    steps.forEach(([label, u, v], i) => {
      g.font = `${i === 6 ? 400 : 400} ${i === 6 ? h * 0.075 : h * 0.06}px ${i === 6 ? MARKER : TYPE}`;
      const tw = g.measureText(label).width + 8, th = h * (i === 6 ? 0.1 : 0.085);
      g.save(); g.translate(w * u, h * v); g.rotate((i % 2 ? 1 : -1) * 0.05);
      g.fillStyle = i === 6 ? '#000' : '#fff'; g.fillRect(-tw / 2, -th / 2, tw, th); g.lineWidth = 1.1; g.strokeStyle = '#000'; g.strokeRect(-tw / 2, -th / 2, tw, th);
      g.fillStyle = i === 6 ? '#fff' : '#000'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, 1);
      g.restore();
    });
    g.font = `400 ${h * 0.05}px ${MARKER}`; g.fillStyle = '#000'; g.fillText('figures', w * 0.76, h * 0.6); g.fillText('skip ahead', w * 0.76, h * 0.66);
    g.restore();
  },
  poem(g, x, y, w, h) {
    g.save(); g.translate(x, y);
    // the rendering equation, typeset, with the integral drawn by hand
    g.fillStyle = '#000'; g.textBaseline = 'alphabetic';
    const fs = h * 0.17, by = h * 0.36;
    const it = (t, xx, size = fs) => { g.font = `italic 400 ${size}px Georgia, "Times New Roman", serif`; g.fillText(t, xx, by); return g.measureText(t).width; };
    const sub = (t, xx) => { g.font = `italic 400 ${fs * 0.55}px Georgia, serif`; g.fillText(t, xx, by + fs * 0.22); return g.measureText(t).width; };
    let cx = w * 0.02;
    cx += it('L', cx); cx += sub('o', cx) + 4; g.font = `400 ${fs}px Georgia, serif`; g.fillText('=', cx, by); cx += g.measureText('= ').width;
    cx += it('L', cx); cx += sub('e', cx) + 3; g.font = `400 ${fs}px Georgia, serif`; g.fillText('+', cx, by); cx += g.measureText('+ ').width;
    g.font = `400 ${fs * 1.6}px Georgia, serif`; g.fillText('∫', cx, by + fs * 0.18); g.font = `italic 400 ${fs * 0.5}px Georgia, serif`; g.fillText('Ω', cx + fs * 0.32, by + fs * 0.5); cx += fs * 0.85;
    cx += it('L', cx); cx += sub('i', cx) + 2; g.font = `400 ${fs}px Georgia, serif`; g.fillText('·', cx, by); cx += fs * 0.32;
    cx += it('f', cx) + 2; g.fillText('·', cx, by); cx += fs * 0.32;
    g.font = `400 ${fs * 0.9}px Georgia, serif`; g.fillText('cos', cx, by); cx += g.measureText('cos ').width; cx += it('θ', cx) + 2;
    g.font = `400 ${fs}px Georgia, serif`; g.fillText('·', cx, by); cx += fs * 0.32; cx += it('d', cx); it('ω', cx);
    markerLine(g, [[w * 0.02, by + fs * 0.45], [w * 0.98, by + fs * 0.42]], 1.6, 3);
    markerArrow(g, w * 0.5, h * 0.48, w * 0.5, h * 0.66, 0.0, 2.2, 12);
    g.restore();
  },
  award(g, x, y, w, h) {
    g.save(); g.translate(x + w / 2, y + h * 0.44);
    // ribbon tails
    for (const s of [-1, 1]) { poly(g, [[s * w * 0.05, h * 0.12], [s * w * 0.2, h * 0.5], [s * w * 0.13, h * 0.44], [s * w * 0.08, h * 0.54], [s * w * 0.0, h * 0.16]]); g.fillStyle = '#4a4a4a'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#000'; g.stroke(); }
    // rosette
    burst(g, 0, 0, w * 0.2, w * 0.27, 20, '#9a9a9a', 21); g.lineWidth = 1.6; g.stroke();
    g.beginPath(); g.arc(0, 0, w * 0.16, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.stroke();
    g.fillStyle = '#000'; g.textAlign = 'center'; g.font = `400 ${w * 0.055}px ${TYPE}`; g.fillText('HONORABLE', 0, -w * 0.035); g.fillText('MENTION', 0, w * 0.035);
    g.font = `400 ${w * 0.04}px ${TYPE}`; g.fillText('UIST ’23', 0, w * 0.1);
    g.restore();
  },
};

/* ---------------------------------------------------------------- the zine ----------- */
export const PAGE = { w: 210, h: 280 };
const POEM = ['In realms of code where light does dance,', 'The rendering equation takes its chance,', 'Radiance, the light a point emits,', 'On surfaces, its radiant flux submits.'];

// Each zine page, drawn as a paste-up. n = 1..8.
export const PAGES = [
  // 1 cover: heavy toner, so it pops on the coloured flyer
  (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h * 0.5);
    g.fillStyle = '#fff'; g.font = `400 11px ${TYPE}`; g.textAlign = 'left'; g.fillText('ISSUE #1', 12, 20); g.textAlign = 'right'; g.fillText('UIST ’23', w - 12, 20);
    ransom(g, 'ZINIFY!', w / 2, h * 0.3, 38, { align: 'center', maxW: w - 20, seed: 101, invert: 0.12, news: 0.35 });
    typeStrip(g, ['research papers', '      into zines'], w * 0.2, h * 0.39, w * 0.6, 11, { seed: 12, rot: -0.04 });
    PICTURES.cover(g, w * 0.08, h * 0.55, w * 0.84, h * 0.33);
    marker(g, 'cut. paste. copy.', w / 2, h - 12, 14, { align: 'center', rot: -0.03 });
  },
  // 2 the walled garden
  (g, w, h) => {
    ransom(g, 'WALLED', w / 2, 38, 26, { align: 'center', maxW: w - 22, seed: 202 });
    ransom(g, 'GARDEN', w / 2, 70, 26, { align: 'center', maxW: w - 22, seed: 203 });
    PICTURES.garden(g, 14, 84, w - 28, 112);
    typeStrip(g, ['Academia is often seen as', 'a walled garden: jargon and', 'paywalls keep most people out.'], 12, 202, w - 24, 9.6, { seed: 21 });
    marker(g, 'you are here →', 18, h - 12, 12, { rot: -0.04 });
  },
  // 3 the reader
  (g, w) => {
    ransom(g, 'THE READER', w / 2, 40, 23, { align: 'center', maxW: w - 22, seed: 303 });
    PICTURES.reader(g, 12, 52, w - 24, 140);
    typeStrip(g, ['Curious, but not an expert.', 'Even with good tutorials,', 'new research is a steep climb.'], 14, 200, w - 28, 9.6, { seed: 31 });
    markerRing(g, w * 0.3, 128, 30, 34, 2.2, 33);
  },
  // 4 the author
  (g, w) => {
    ransom(g, 'THE AUTHOR', w / 2, 40, 23, { align: 'center', maxW: w - 22, seed: 404 });
    PICTURES.author(g, 10, 54, w - 20, 132);
    marker(g, 'AI papers on arXiv', w * 0.18, 200, 10.5);
    typeStrip(g, ['Wants one paper to stand out', 'in an exponential pile.', 'Looks matter too.'], 14, 210, w - 28, 9.6, { seed: 41 });
  },
  // 5 why zines
  (g, w) => {
    ransom(g, 'WHY ZINES?', w / 2, 40, 24, { align: 'center', maxW: w - 22, seed: 505, invert: 0.35 });
    PICTURES.zines(g, 10, 52, w - 20, 120);
    typeStrip(g, ['Self-published. Small print runs.', 'Passed hand to hand.', 'Roots in punk and queercore.'], 10, 178, w - 20, 9.4, { seed: 51 });
    typeStrip(g, ['Not unlike preprints.'], 40, 236, w - 80, 10.5, { seed: 52, rot: 0.05 });
  },
  // 6 how it works (Figure 2)
  (g, w) => {
    ransom(g, 'HOW IT WORKS', w / 2, 38, 21, { align: 'center', maxW: w - 22, seed: 606 });
    PICTURES.pipeline(g, 8, 50, w - 16, 176);
    typeStrip(g, ['Claude condenses and plans.', 'You can steer the plan.'], 22, 232, w - 44, 9.6, { seed: 61 });
  },
  // 7 equation into poem (Figure 3)
  (g, w, h) => {
    ransom(g, 'MATH', w * 0.27, 38, 24, { align: 'center', maxW: w * 0.38, seed: 707 });
    marker(g, '→', w * 0.52, 38, 22, { align: 'center' });
    ransom(g, 'POEM', w * 0.75, 38, 24, { align: 'center', maxW: w * 0.38, seed: 708 });
    PICTURES.poem(g, 10, 56, w - 20, 80);
    typeStrip(g, POEM, 6, 124, w - 12, 8.2, { seed: 71, rot: -0.02 });
    marker(g, 'the rendering equation, as told by an LLM', w / 2, 210, 9, { align: 'center' });
    marker(g, '(fig. 3 of the paper)', w / 2, 224, 9, { align: 'center' });
    burst(g, w * 0.86, h - 32, 9, 16, 10, '#000', 72);
  },
  // 8 back cover
  (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, h * 0.72, w, h * 0.28);
    ransom(g, 'MORE ENGAGING.', w / 2, 34, 17, { align: 'center', maxW: w - 22, seed: 808 });
    ransom(g, 'MORE ACCESSIBLE.', w / 2, 62, 17, { align: 'center', maxW: w - 22, seed: 809 });
    PICTURES.award(g, w * 0.18, 70, w * 0.64, 110);
    typeStrip(g, ['People’s Choice,', 'UIST ’23 Student Innovation Contest'], 14, 168, w - 28, 8.8, { seed: 81, tape: false });
    g.fillStyle = '#fff'; g.font = `400 9px ${TYPE}`; g.textAlign = 'center';
    g.fillText('Jaidev Shriram & Sanjayan Sreekala', w / 2, h * 0.79);
    g.fillText('UC San Diego · equal contribution', w / 2, h * 0.84);
    marker(g, 'copy me & pass it on', w / 2, h - 14, 13, { align: 'center', color: '#fff' });
  },
];

// The words the zine says live in zine-text.js, so the page's text version doesn't need the drawing code.
export { PAGE_TEXT } from './zine-text.js';

/* ---------------------------------------------------------------- flyer type -------- */
// Step tags pinned along the top of the table: the four steps in the paper's pipeline.
export const STEPS = ['CUT', 'PLAN', 'PICTURE', 'COPY'];
export function drawStepTag(g, w, h, i) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.lineWidth = 1.4; g.strokeStyle = '#000'; g.strokeRect(0.7, 0.7, w - 1.4, h - 1.4);
  g.fillStyle = '#000'; g.font = `400 ${h * 0.72}px ${MARKER}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(String(i + 1), 6, h * 0.55);
  g.font = `400 ${h * 0.42}px ${TYPE}`; g.fillText(STEPS[i], h * 0.62 + 6, h * 0.55);
}

/* ---------------------------------------------------------------- the counter ------- */
// Things on the copy-center counter, printed into the flyer itself: a price sign, a glue
// stick, a roll of tape and a box of staples. (x, y) is the sign's top-left in flyer DU.
export function drawCounterProps(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  // a handwritten price sign in a little stand
  g.save(); g.rotate(-0.05);
  g.fillStyle = '#fff'; g.fillRect(0, 0, 118, 64); g.lineWidth = 2.4; g.strokeStyle = '#000'; g.strokeRect(0, 0, 118, 64);
  g.fillStyle = '#000'; g.font = `400 13px ${MARKER}`; g.textAlign = 'left'; g.fillText('COPIES', 10, 22);
  g.font = `400 28px ${MARKER}`; g.fillText('10¢', 14, 54); g.font = `400 9px ${TYPE}`; g.fillText('self serve', 64, 50);
  burst(g, 100, 14, 7, 12, 9, '#000', 4);
  g.restore();
  // glue stick
  g.save(); g.translate(150, 6); g.rotate(0.18);
  g.fillStyle = '#000'; g.fillRect(0, 0, 18, 12); g.fillStyle = '#d0d0d0'; g.fillRect(0, 12, 18, 46); g.lineWidth = 2; g.strokeRect(0, 12, 18, 46);
  g.fillStyle = '#000'; g.font = `400 8px ${TYPE}`; g.save(); g.translate(12, 54); g.rotate(-Math.PI / 2); g.fillText('GLUE', 0, 0); g.restore();
  g.restore();
  // roll of tape
  g.save(); g.translate(206, 40);
  g.beginPath(); g.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2); g.fillStyle = '#9a9a9a'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#000'; g.stroke();
  g.fillStyle = '#9a9a9a'; g.fillRect(-22, 0, 44, 8); g.beginPath(); g.ellipse(0, 8, 22, 9, 0, 0, Math.PI); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-22, 0); g.lineTo(-22, 8); g.moveTo(22, 0); g.lineTo(22, 8); g.stroke();
  g.beginPath(); g.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.stroke();
  g.restore();
  g.restore();
}
