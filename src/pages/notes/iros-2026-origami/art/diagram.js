// Origami instruction diagrams in Yoshizawa–Randlett notation, drawn in code, for "Two hands, one sheet of paper":
// fold lines, fold arrows, step circles and the essay's robot hands, all in one thin ink line on warm paper.
// Used by the essay's cover (src/components/art/covers/iros-2026-origami.js). Coordinates are design units;
// every function draws into a 2D context that is already scaled.
const TAU = Math.PI * 2;

export const INK = '#1f2328';
export const PAPER_FRONT = '#fffdf7';      // the sheet's printed side
export const PAPER_BACK = '#d9d6ce';       // the grey tint for the paper's back
export const SHEET_BLUE = '#2a7fbf';       // the challenge sheet's printed guide lines: the one accent
const HAND_FILL = '#fbfaf6';

/* ───────────────────────── notation ───────────────────────── */
// Valley folds are dashed; mountain folds are a dash and two dots. Both run a little past the paper's edges.
export function foldLine(ctx, a, b, kind = 'valley', width = 1) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = width; ctx.lineCap = 'butt';
  ctx.setLineDash(kind === 'valley' ? [6, 4] : [8, 2.6, 1.3, 2.6, 1.3, 2.6]);
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
}

// A curved arrow from a to b; bend pushes the curve to one side (a fraction of the distance).
function arc(a, b, bend) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  return [mx - dy * bend, my + dx * bend];
}
function curve(ctx, a, c, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]); ctx.stroke(); }

// "Fold in front": a curved arrow with a full, solid head.
export function valleyArrow(ctx, a, b, bend = .4, size = 7.5) {
  const c = arc(a, b, bend), ang = Math.atan2(b[1] - c[1], b[0] - c[0]);
  ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 1; ctx.lineCap = 'round';
  const back = [b[0] - Math.cos(ang) * size * .8, b[1] - Math.sin(ang) * size * .8];
  curve(ctx, a, c, back);
  ctx.beginPath(); ctx.moveTo(b[0], b[1]);
  ctx.lineTo(b[0] - Math.cos(ang - .38) * size, b[1] - Math.sin(ang - .38) * size);
  ctx.lineTo(b[0] - Math.cos(ang + .38) * size, b[1] - Math.sin(ang + .38) * size);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// "Fold behind": a curved arrow with a hollow half head.
export function mountainArrow(ctx, a, b, bend = .4, size = 9) {
  const c = arc(a, b, bend), ang = Math.atan2(b[1] - c[1], b[0] - c[0]), side = bend >= 0 ? -1 : 1;
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  curve(ctx, a, c, b);
  ctx.beginPath(); ctx.moveTo(b[0], b[1]);
  ctx.lineTo(b[0] - Math.cos(ang + side * .5) * size, b[1] - Math.sin(ang + side * .5) * size);
  ctx.lineTo(b[0] - Math.cos(ang) * size * .62, b[1] - Math.sin(ang) * size * .62);
  ctx.closePath(); ctx.fillStyle = HAND_FILL; ctx.fill(); ctx.stroke(); ctx.restore();
}

// Lettering, set in device pixels: small type drawn under a scaled transform gets its letters placed on the
// unscaled pixel grid and then magnified, which spaces them unevenly. Tracking uses the canvas's own letter
// spacing where the browser has it, so kerning survives. Assumes no rotation in the current transform.
export function label(ctx, text, x, y, track = 0, align = 'left') {
  const m = ctx.getTransform(), k = Math.hypot(m.a, m.b) || 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = align;
  ctx.font = ctx.font.replace(/([\d.]+)px/, (_, n) => `${(parseFloat(n) * k).toFixed(2)}px`);
  const spacing = 'letterSpacing' in ctx;
  if (spacing) ctx.letterSpacing = `${(track * k).toFixed(2)}px`;
  // letter spacing is added after the last letter too; take it back off right-aligned and centred text
  const dx = spacing ? (align === 'right' ? track : align === 'center' ? track / 2 : 0) : 0;
  ctx.fillText(text, (x + dx) * m.a + m.e, y * m.d + m.f);
  ctx.restore();
}

// A step number in a circle.
export function stepCircle(ctx, x, y, r, text, font = '"Zen Maru Gothic"') {
  ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.font = `700 ${Math.round(r * 1.25)}px ${font}`; ctx.textBaseline = 'middle';
  label(ctx, text, x, y + r * .06, 0, 'center'); ctx.restore();
}

/* ───────────────────────── the robot hands ───────────────────────── */
// A five-fingered robot hand seen from above, palm down, fingers pointing along -y in its own frame:
// a forearm, a palm plate, jointed finger links and a sensor pad on each fingertip.
// side: 'right' puts the thumb on the left (as a right hand seen from above); 'left' mirrors it.
// pose: 'press' (index straight, the rest curled under) or 'pin' (index and middle flat on the paper).
// press: where the index fingertip should touch; the hand is placed so that it does.
const FINGERS = [
  { x: -12.4, y: -40, len: [17, 12, 10], w: 8.2 },     // index
  { x: -4.1, y: -42, len: [19, 13, 10.5], w: 8.2 },    // middle
  { x: 4.2, y: -41, len: [17.5, 12, 9.5], w: 7.8 },    // ring
  { x: 12.2, y: -37.5, len: [14, 10, 8.5], w: 7.2 },   // little
];
const CURL = { straight: [1, 1, 1], curled: [.8, .38, .22] };

function fingerChain(f, spread, curl) {
  const pts = [[f.x, f.y]]; let a = spread, x = f.x, y = f.y;
  f.len.forEach((l, i) => { x += Math.sin(a) * l * curl[i]; y -= Math.cos(a) * l * curl[i]; pts.push([x, y]); a += spread * .15; });
  return pts;
}
function handGeometry(pose) {
  const fingers = FINGERS.map((f, i) => {
    const spread = (i - 1.2) * .07;
    const out = pose === 'press' ? i === 0 : pose === 'pin' ? i < 2 : false;
    return { ...f, pts: fingerChain(f, spread, out ? CURL.straight : CURL.curled), out };
  });
  const thumbCurl = pose === 'press' ? [.9, .6] : [1, .9];
  const thumb = { w: 9.4, out: pose === 'pin', pts: [[-16.5, -13]] };
  let a = -.95, x = -16.5, y = -13;
  [15, 12].forEach((l, i) => { x += Math.sin(a) * l * thumbCurl[i]; y -= Math.cos(a) * l * thumbCurl[i]; thumb.pts.push([x, y]); a += .32; });
  return { fingers, thumb };
}

function capsule(ctx, a, b, r) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  ctx.beginPath(); ctx.arc(a[0], a[1], r, ang + Math.PI / 2, ang - Math.PI / 2); ctx.arc(b[0], b[1], r, ang - Math.PI / 2, ang + Math.PI / 2); ctx.closePath();
}
function drawLink(ctx, a, b, r) { capsule(ctx, a, b, r); ctx.fill(); ctx.stroke(); }

function drawFinger(ctx, f) {
  const n = f.pts.length - 1;
  for (let i = 0; i < n; i++) drawLink(ctx, f.pts[i], f.pts[i + 1], f.w / 2 * (1 - i * .06));
  // joints: an axle dot at each knuckle
  ctx.save(); ctx.fillStyle = INK;
  for (let i = 1; i < n; i++) { const p = f.pts[i]; ctx.beginPath(); ctx.arc(p[0], p[1], .85, 0, TAU); ctx.fill(); }
  ctx.restore();
  // the fingertip sensor pad, shown as a dark cap on fingers that reach the paper
  if (f.out) {
    const a = f.pts[n - 1], b = f.pts[n], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = f.w / 2 * (1 - (n - 1) * .06);
    ctx.save(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(b[0], b[1], r, ang - Math.PI / 2, ang + Math.PI / 2);
    ctx.lineTo(b[0] - Math.cos(ang) * r * .55 + Math.cos(ang + Math.PI / 2) * r, b[1] - Math.sin(ang) * r * .55 + Math.sin(ang + Math.PI / 2) * r);
    ctx.lineTo(b[0] - Math.cos(ang) * r * .55 - Math.cos(ang + Math.PI / 2) * r, b[1] - Math.sin(ang) * r * .55 - Math.sin(ang + Math.PI / 2) * r);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

export function robotHand(ctx, { wrist = [0, 0], angle = 0, scale = 1, side = 'right', pose = 'press', press = null, mark = true, arm = 260 }) {
  const g = handGeometry(pose), mirror = side === 'left' ? -1 : 1;
  const tip = g.fingers[0].pts[g.fingers[0].pts.length - 1];
  let [wx, wy] = wrist;
  if (press) {
    const tx = tip[0] * mirror * scale, ty = tip[1] * scale, c = Math.cos(angle), s = Math.sin(angle);
    wx = press[0] - (tx * c - ty * s); wy = press[1] - (tx * s + ty * c);
  }
  ctx.save(); ctx.translate(wx, wy); ctx.rotate(angle); ctx.scale(mirror * scale, scale);
  ctx.lineJoin = ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.fillStyle = HAND_FILL; ctx.lineWidth = 1.15 / scale;
  // forearm, running off the page, with a cable along it
  ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(-17, arm); ctx.lineTo(17, arm); ctx.lineTo(14, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(14, 10); ctx.stroke();
  ctx.save(); ctx.lineWidth = .8 / scale; ctx.beginPath(); ctx.moveTo(9, 14); ctx.bezierCurveTo(13, 60, 4, 110, 10, arm); ctx.stroke(); ctx.restore();
  // palm plate
  ctx.beginPath(); ctx.moveTo(-15, 2); ctx.lineTo(-18.5, -30); ctx.quadraticCurveTo(-18, -44, -8, -45); ctx.lineTo(9, -44); ctx.quadraticCurveTo(17.5, -42, 17, -34); ctx.lineTo(15, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.lineWidth = .7 / scale; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(12, -6); ctx.stroke(); ctx.restore();
  for (const [x, y] of [[-10, -12], [10, -12]]) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, TAU); ctx.stroke(); }
  // thumb, then the fingers from the little finger in
  drawFinger(ctx, g.thumb);
  for (let i = g.fingers.length - 1; i >= 0; i--) drawFinger(ctx, g.fingers[i]);
  ctx.restore();
  // a press mark at the touching fingertip
  if (press && mark) {
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.lineCap = 'round';
    for (const a of [-2.4, -1.75, -1.1]) { const r0 = 8 * scale, r1 = 12.5 * scale, aa = a + angle; ctx.beginPath(); ctx.moveTo(press[0] + Math.cos(aa) * r0, press[1] + Math.sin(aa) * r0); ctx.lineTo(press[0] + Math.cos(aa) * r1, press[1] + Math.sin(aa) * r1); ctx.stroke(); }
    ctx.restore();
  }
}
