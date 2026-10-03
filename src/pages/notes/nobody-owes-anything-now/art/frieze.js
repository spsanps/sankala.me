// The cup's decoration: the habitat, rolled like a sleeve until its edges meet.
// Drawn flat, as if the cup were unrolled, in units where the cup is 150 across the radius
// and 320 tall: x runs once around (FW), y runs down from the lip. As the wheel turns, the
// land goes past: the lamp, the house with POTTERY on its roof, the fields climbing, the
// lake, the woods, the orchard, the train, and back to the door. Hanging upside down from the
// band under the lip is the far shore, with its lamps.
import { glyphStrokes, arcPts, bez, wobble, resample } from '../../../../components/art/covers/kit.js';
import { pnoise, clamp, smooth, TAU } from './sgraffito.js';

export const CUP = { R: 150, H: 320, wall: 7 };
export const FW = TAU * CUP.R;               // once around
export const HANDLE_X = 0;                   // the handle sits over the seam, between the train and the lamp
export const HOUSE_X = 138;

const GROUND = 238, RAIL2 = 246;
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
const wob = (p, amp, seed) => wobble(resample(p, 1.5), amp, .07, seed);
// A closed path for scraping, from a polyline.
const poly = p => ctx => { ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); };

// The far shore, overhead: no stars, only its lamps, in ones and in the windows of houses.
function farShore(a, y0) {
  const r = a.rng;
  let x = 4;
  while (x < FW - 10) {
    const n = r() < .45 ? 1 : 2 + Math.floor(r() * 3), y = y0 + (r() - .5) * 6;
    for (let k = 0; k < n; k++) a.scrape(c => c.arc(x + k * 4.6, y + (k % 2) * .8, n === 1 ? 2.3 : 1.55, 0, TAU), 0, { seed: x + k });
    x += n * 4.6 + 9 + r() * 16;
  }
}

function cloud(a, x, y, s, seed) {
  // a scroll cloud: three bumps and a curl, scratched in one go
  const p = [];
  p.push(...arcPts(x - 16 * s, y, 8 * s, 8 * s, Math.PI, TAU * .93, 14));
  p.push(...arcPts(x - 2 * s, y - 5 * s, 10 * s, 10 * s, Math.PI * 1.05, TAU * .96, 16));
  p.push(...arcPts(x + 14 * s, y - 1 * s, 8 * s, 8 * s, Math.PI * 1.1, TAU + .9, 18));
  p.push(...arcPts(x + 12 * s, y + 3 * s, 3.5 * s, 3.5 * s, .9, -Math.PI * .9, 10));
  a.line([wob(p, .5, seed), wob([[x - 24 * s, y + 7 * s], [x + 18 * s, y + 7 * s]], .4, seed + 1)], 2.2);
}

function house(a, x0, x1, eave, ground, ridge, letters) {
  const w = x1 - x0, over = w * .1, inset = w * .2;
  // walls, roof, the roof's lower edge doubled
  a.line([rect(x0, eave, x1, ground)], 2.5, { seed: 21 });
  a.line([wob([[x0 - over, eave], [x0 + inset - over * .4, ridge], [x1 - inset + over * .4, ridge], [x1 + over, eave], [x0 - over, eave]], .4, 7)], 2.6, { seed: 22 });
  a.line([wob([[x0 - over + 6, eave - 5], [x1 + over - 6, eave - 5]], .4, 8)], 1.4, { seed: 23 });
  if (letters) {
    const g = glyphStrokes(letters, { x: (x0 + x1) / 2, y: eave - 15, size: 17.5, align: 'center', track: .16, jrot: .035, jy: .04, seed: 4 });
    a.line(g.strokes, 2.2, { seed: 24, vary: .2 });
  }
  return { w };
}

export function drawFrieze(a) {
  const r = a.rng;
  // Rings cut while the wheel turned: under the lip, around the far shore, the rails, the wave.
  const ring = (y, w, seed) => a.line([wob([[-20, y], [FW + 20, y]], .35, seed)], w, { seed, taper: [0, 0] });
  ring(17, 2.4, 1); ring(46, 1.6, 2);
  farShore(a, 31.5);
  ring(GROUND, 2, 3); ring(RAIL2, 2, 4);
  for (let x = 2; x < FW; x += 7.6 + r() * .6) a.line([[[x, GROUND + 1.5], [x + .4, RAIL2 - 1.5]]], 1.4, { seed: x });
  const wave = []; for (let x = -10; x <= FW + 10; x += 2) wave.push([x, 264 + 4.2 * Math.sin(x / FW * TAU * 26)]);
  a.line([wave], 2.2, { seed: 5, taper: [0, 0] });
  ring(280, 1.8, 6);

  // The lamp by the door.
  const lx = 52;
  a.line([[[lx, GROUND], [lx, 186]], [[lx - 5, 188], [lx + 5, 188]]], 2.2, { seed: 30 });
  a.scrape(c => c.arc(lx, 179, 5.6, 0, TAU), .3, { seed: 31 });
  a.reserve(c => c.arc(lx - 1.3, 177.8, 1.5, 0, TAU));
  for (let k = 0; k < 6; k++) { const an = -Math.PI / 2 + (k - 2.5) * .45; a.line([[[lx + Math.cos(an) * 9, 179 + Math.sin(an) * 9], [lx + Math.cos(an) * 14, 179 + Math.sin(an) * 14]]], 1.3, { seed: 32 + k }); }

  // The house, POTTERY painted on its roof.
  const hx0 = HOUSE_X - 56, hx1 = HOUSE_X + 56, eave = 186, ridge = 114;
  house(a, hx0, hx1, eave, GROUND, ridge, 'POTTERY');
  a.scrape(poly(rect(HOUSE_X - 10, 206, HOUSE_X + 10, GROUND)), 1.57, { seed: 40 });                 // the door
  a.reserve(c => c.arc(HOUSE_X + 5.5, 223, 1.6, 0, TAU));
  for (const wx of [hx0 + 13, hx1 - 33]) {                                                          // windows
    a.scrape(poly(rect(wx, 197, wx + 20, 217)), 0, { seed: wx });
    a.reserve(c => { c.rect(wx + 8.8, 197, 2.4, 20); c.rect(wx, 205.8, 20, 2.4); });
  }
  a.line([rect(hx1 - 30, 94, hx1 - 18, 122)], 2.2, { seed: 41 });                                   // chimney
  a.line([wob(bez([hx1 - 24, 90], [hx1 - 30, 74], [hx1 - 6, 72], [hx1 - 12, 58], 24).concat(arcPts(hx1 - 6, 56, 6, 5, Math.PI * .95, TAU * 1.05, 14)), .5, 42)], 1.8, { seed: 43 });
  a.line([[[hx0 - 8, GROUND - 3], [hx0 - 2, GROUND - 12], [hx0 + 2, GROUND - 4]], [[hx1 + 4, GROUND - 3], [hx1 + 9, GROUND - 13], [hx1 + 13, GROUND - 3]]], 1.6, { seed: 44 });

  // The fields climb away from the door: hills behind hills, each ploughed along its own
  // curve, hedges on their crests, and a path from the door winding up through them.
  const hills = [
    { x0: 194, x1: 318, h: 40, skew: .45 },
    { x0: 246, x1: 392, h: 72, skew: .55 },
    { x0: 312, x1: 446, h: 106, skew: .52 },
  ];
  const hillTop = (k, x) => {
    const hl = hills[k], t = (x - hl.x0) / (hl.x1 - hl.x0); if (t <= 0 || t >= 1) return GROUND;
    const tt = t < hl.skew ? .5 * t / hl.skew : .5 + .5 * (t - hl.skew) / (1 - hl.skew);
    return GROUND - hl.h * Math.pow(Math.sin(Math.PI * tt), .85);
  };
  // a point on hill k shows only above the hills in front of it
  const shows = (k, x, y, gap = 3.2) => { for (let j = 0; j < k; j++) if (y > hillTop(j, x) - gap) return false; return y < GROUND - 3; };
  const visibleRuns = (k, ptsIn, gap) => { const out = []; let run = []; for (const p of ptsIn) { if (shows(k, p[0], p[1], gap)) run.push(p); else { if (run.length > 2) out.push(run); run = []; } } if (run.length > 2) out.push(run); return out; };
  hills.forEach((hl, k) => {
    // outline, with a hedge of small bushes along the crest
    const crest = []; for (let x = hl.x0; x <= hl.x1; x += 2.5) crest.push([x, hillTop(k, x)]);
    a.line(visibleRuns(k, wob(crest, .45, 50 + k), 1.2), 2.3, { seed: 51 + k });
    for (let x = hl.x0 + 8; x < hl.x1 - 6; x += 9.5) { const y = hillTop(k, x) - 1.4; if (shows(k, x, y + 4, 0) && y < GROUND - 8) a.line([[[x, y]]], 3, { seed: x + k }); }
    // furrows following the hill's own curve
    const step = [5.2, 4.6, 5.8][k];
    for (let d = step + 1; d < hl.h; d += step) {
      const f = []; for (let x = hl.x0; x <= hl.x1; x += 2.5) { const y = hillTop(k, x) + d * (.55 + .45 * Math.sin(Math.PI * clamp((x - hl.x0) / (hl.x1 - hl.x0)))); if (y < GROUND - 3) f.push([x, y]); else if (f.length) { break; } }
      a.line(visibleRuns(k, f, 3.5), 1.3, { seed: 80 + k * 13 + d, taper: [.6, .6] });
    }
  });
  // a small empty house on the far hill, its window dark
  const sx = 412, sy = hillTop(2, sx) + 4;
  a.line([rect(sx - 9, sy - 12, sx + 9, sy), [[sx - 12, sy - 12], [sx, sy - 22], [sx + 12, sy - 12]]], 1.8, { seed: 90 });
  a.scrape(poly(rect(sx - 3.5, sy - 8.5, sx + 3, sy - 3)), 0, { seed: 91 });

  // The lake, scraped back to the clay, its ripples left standing in slip; reeds at the ends.
  const LX = 506, LW = 74;
  a.scrape(c => c.ellipse(LX, 224, LW, 13.5, 0, 0, TAU), .04, { seed: 100 });
  a.reserve(c => { for (let k = 0; k < 9; k++) { const y = 216 + (k % 3) * 6.5 + (k % 2), x = LX - 50 + k * 12 + (k % 3) * 5, w = 9 + (k % 4) * 3; c.rect(x, y, w, 1.6); } });
  for (const [x, dir] of [[LX - LW - 4, -1], [LX + LW + 3, 1]]) for (let k = 0; k < 5; k++) a.line([[[x + dir * k * 3, GROUND - 1], [x + dir * k * 3 + dir * (k - 2) * .8, GROUND - 13 - (k % 3) * 5]]], 1.4, { seed: 110 + k });
  cloud(a, 300, 96, 1.05, 120);

  // The woods: firs and broad trees scraped out of the slip, trunks and branches left standing.
  const woods = [[604, 64, 'fir'], [626, 92, 'round'], [650, 76, 'fir'], [672, 104, 'fir'], [694, 70, 'round'], [716, 88, 'fir'], [736, 60, 'fir']];
  for (const [x, h, kind] of woods) {
    if (kind === 'fir') {
      const w = h * .3, p = [[x, GROUND - h]];
      for (let k = 1; k <= 4; k++) { const y = GROUND - h + h * .85 * k / 4, ww = w * k / 4; p.push([x + ww, y], [x + ww * .45, y - 2]); }
      const right = p.slice(1), left = right.map(([px, py]) => [2 * x - px, py]).reverse();
      a.scrape(poly([p[0], ...right, [x + 3, GROUND - h * .15], [x + 3, GROUND], [x - 3, GROUND], [x - 3, GROUND - h * .15], ...left]), 1.2, { seed: x });
      a.reserve(c => { c.rect(x - .8, GROUND - h * .75, 1.6, h * .62); for (let k = 1; k < 4; k++) { const y = GROUND - h + h * .85 * k / 4 + 2; c.moveTo(x, y - 6); c.lineTo(x + w * k / 4 * .55, y); c.lineTo(x + w * k / 4 * .55 - 1.6, y + 1.2); c.lineTo(x, y - 4); c.lineTo(x - w * k / 4 * .55 + 1.6, y + 1.2); c.lineTo(x - w * k / 4 * .55, y); c.closePath(); } });
    } else {
      const cr = h * .3, cy = GROUND - h + cr;
      a.scrape(c => { c.arc(x, cy, cr, 0, TAU); c.rect(x - 2.6, cy, 5.2, GROUND - cy); }, -.6, { seed: x });
      a.reserve(c => { for (let k = 0; k < 4; k++) { const an = -2.5 + k * .45; c.moveTo(x + Math.cos(an) * cr * .45, cy + Math.sin(an) * cr * .45); c.arc(x + Math.cos(an) * cr * .62, cy + Math.sin(an) * cr * .62, 1.5, 0, TAU); } c.rect(x - .8, cy - cr * .2, 1.6, cr * .9); });
    }
  }
  cloud(a, 664, 70, .9, 130);

  // The orchard: rows of round trees scraped out of the slip, their fruit left standing.
  for (let row = 0; row < 2; row++) {
    const base = row ? GROUND : GROUND - 15, s = row ? 1 : .8, n = row ? 4 : 5, x0 = row ? 772 : 762, dx = row ? 26 : 22;
    for (let k = 0; k < n; k++) {
      const x = x0 + k * dx + (row ? 0 : 2), cr = 12.5 * s, ty = base - 15 * s, cy = ty - cr + 3;
      a.scrape(c => { c.ellipse(x, cy, cr, cr * .92, 0, 0, TAU); c.rect(x - 1.7 * s, cy, 3.4 * s, base - cy); }, .8 + k, { seed: 140 + k + row * 10 });
      a.reserve(c => { for (let f = 0; f < 7; f++) { const an = f * 2.4 + k * 1.3 + row, rr = cr * (.2 + .55 * ((f * 37 % 10) / 10)); c.moveTo(x + Math.cos(an) * rr + 1.7 * s, cy + Math.sin(an) * rr); c.arc(x + Math.cos(an) * rr, cy + Math.sin(an) * rr, 1.7 * s, 0, TAU); } });
    }
  }
  for (let x = 752; x < 876; x += 4 + (x % 3)) a.line([[[x, GROUND - 1], [x + 1.4, GROUND - 5 - (x % 4)]]], 1, { seed: x });   // grass

  // The train, going round.
  const T0 = 880, Ty = GROUND - 3, Th = 22;
  const car = (x0, x1, nose) => {
    const p = nose ? [[x1, Ty - Th], [x0 + 12, Ty - Th], ...arcPts(x0 + 12, Ty - 8, 12, Th - 8, -Math.PI / 2, -Math.PI, 8), [x0, Ty], [x1, Ty], [x1, Ty - Th]] : rect(x0, Ty - Th, x1, Ty);
    a.line([p], 2.2, { seed: x0 });
    a.line([[[x0 + 3, Ty - 7], [x1 - 3, Ty - 7]]], 1.2, { seed: x0 + 1 });
    for (let wx = x0 + (nose ? 14 : 5); wx < x1 - 8; wx += 9) a.scrape(poly(rect(wx, Ty - Th + 5, wx + 6, Ty - Th + 12)), 0, { seed: wx });
    for (const wx of [x0 + 8, x1 - 8]) a.scrape(c => c.arc(wx, GROUND, 3.4, 0, TAU), 0, { seed: wx + 3 });
  };
  car(T0, T0 + 44, true); car(T0 + 47, T0 + 92, false);
}

// How thick the slip lies. The cup was dipped upside down, held by its foot: the slip thins
// over the rim, beads at the dip line, and stops where three fingertips held it.
const FINGERS = [[176, 7], [497, -3], [812, 4]];
export function cupSlip(x, y) {
  const P = 120, n = c => pnoise(x * c / FW, y / 37, 3, c);
  let dip = 291 + 2.2 * Math.sin(x / FW * TAU * 3 + 1) + (n(60) - .5) * 3.4;
  let s = smooth(dip + 1.6, dip - 1.8, y);
  s *= 1 + .22 * Math.exp(-(((y - dip + 3) / 3) ** 2));                          // the bead above the dip line
  for (const [fx, fy] of FINGERS) {
    let dx = x - fx; dx -= Math.round(dx / FW) * FW;
    const e = (dx / 10.5) ** 2 + ((y - (dip + fy * 0)) / 14) ** 2;
    s *= smooth(.75, 1.15, e);
  }
  // runs from the dip, pulling toward the rim, and the thin lip
  s *= .9 + .18 * pnoise(x * P / FW, y / 90, 9, P) + .06 * (n(240) - .5);
  s *= .42 + .58 * smooth(.2, 7, y);
  return clamp(s, 0, 1.25);
}
// A fingerprint pressed into the slip beside the first fingertip.
export function pressFingerprint(a) {
  const [fx] = FINGERS[0], cy = 283, cx = fx + 2;
  a.press(c => {
    c.lineWidth = .7; c.strokeStyle = '#000';
    for (let k = 1; k < 9; k++) { c.beginPath(); c.ellipse(cx, cy, k * 1.25, k * 1.55, .3, Math.PI * 1.05, TAU * .98); c.stroke(); }
  }, .5);
}
