// Two hands, one sheet of paper — a page of origami instruction diagrams, Yoshizawa–Randlett notation:
// thin ink on warm paper, dashed valley folds, dot-dash mountain folds, curved fold arrows, step numbers in
// circles, a grey tint for the paper's back, and one accent: the blue of the challenge sheet's printed guide lines.
// The cover is step 2 of 5: both corners folded, a robot hand pressing the centre crease while the other pins the sheet.
import { TAU, DW, DH, paperTex } from './kit.js';
import { robotHand, valleyArrow, mountainArrow, stepCircle, foldLine, label, PAPER_FRONT, PAPER_BACK, INK, SHEET_BLUE } from '../../../pages/notes/iros-2026-origami/art/diagram.js';

const PAPER = '#f3eee2';
// The 15 cm sheet in design units, after the two corner folds: a pentagon with the flaps meeting on the centre line.
const X0 = 76, X1 = 324, Y0 = 226, SIDE = X1 - X0, CX = (X0 + X1) / 2, YS = Y0 + SIDE / 2, Y1 = Y0 + SIDE;

export default {
  seed: 113, still: 0, fonts: ['zen-maru-gothic-500', 'zen-maru-gothic-700'],
  build(L) {
    const b = L.bctx;
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

    // where the corners were: x-ray lines
    b.save(); b.strokeStyle = INK; b.lineWidth = .7; b.setLineDash([1.2, 2.6]);
    b.beginPath(); b.moveTo(X0, YS); b.lineTo(X0, Y0); b.lineTo(X1, Y0); b.lineTo(X1, YS); b.stroke(); b.restore();

    // the sheet: printed front below, the two folded corners showing the grey back
    b.fillStyle = PAPER_FRONT; b.fillRect(X0, YS, SIDE, SIDE / 2);
    // the printed guide lines (the accent): the centre stripes, a ring and the wing lines
    b.save(); b.beginPath(); b.rect(X0, YS, SIDE, SIDE / 2); b.clip();
    b.strokeStyle = SHEET_BLUE; b.lineWidth = 1.1;
    for (const dx of [-3, 3]) { b.beginPath(); b.moveTo(CX + dx, YS); b.lineTo(CX + dx, Y1 - 17); b.stroke(); }
    b.beginPath(); b.arc(CX, Y1 - 12, 4.4, 0, TAU); b.stroke();
    for (const s of [-1, 1]) { b.beginPath(); b.moveTo(CX + s * 15, Y1); b.lineTo(CX + s * 46, YS); b.stroke(); }
    b.restore();
    for (const s of [-1, 1]) {
      b.beginPath(); b.moveTo(CX, Y0); b.lineTo(CX, YS); b.lineTo(s < 0 ? X0 : X1, YS); b.closePath();
      b.fillStyle = PAPER_BACK; b.fill();
    }
    b.strokeStyle = INK; b.lineWidth = 1.5;
    b.beginPath(); b.moveTo(CX, Y0); b.lineTo(X1, YS); b.lineTo(X1, Y1); b.lineTo(X0, Y1); b.lineTo(X0, YS); b.closePath(); b.stroke();
    b.lineWidth = 1.1; b.beginPath(); b.moveTo(X0, YS); b.lineTo(X1, YS); b.moveTo(CX, Y0); b.lineTo(CX, YS); b.stroke();

    // the arrows that brought each corner to the centre
    valleyArrow(b, [X0 + 7, Y0 + 7], [X0 + 66, Y0 + 62], -.32);
    valleyArrow(b, [X1 - 7, Y0 + 7], [X1 - 66, Y0 + 62], .32);

    // the next step, already marked: a mountain fold down the centre
    foldLine(b, [CX, Y0 - 20], [CX, Y1 + 20], 'mountain');
    mountainArrow(b, [X0 + 58, Y1 - 44], [X1 - 58, Y1 - 44], -.3);

    // two robot hands: the left pins the sheet, the right presses the centre crease
    robotHand(b, { angle: 1.05, scale: 1.3, side: 'left', pose: 'pin', press: [X0 + 70, Y1 - 22], mark: false });
    robotHand(b, { angle: -1.18, scale: 1.3, side: 'right', pose: 'press', press: [CX + 1, YS - 16] });

    // the foot of the sheet
    b.fillStyle = INK; b.fillRect(30, 562, 340, .8);
    b.font = '500 9px "Zen Maru Gothic"'; label(b, 'SAN KALA', 30, 578, 1.4); label(b, 'OCTOBER 2026', 370, 578, 1.4, 'right');

    L.tex = paperTex(L, { mottle: .035, grain: .035, fibres: 260, fAlpha: .06, flecks: 24 });
  },
};
