// "The five folds": the paper plane's five stages as instruction diagrams that fold in 2.5D, drawn in code.
// Stages 1 and 2 are folded by the two robot hands, as my policy folded them in the final; stages 3 to 5 are drawn
// greyed and without hands, because my policy didn't get there.
//
// drawFolds(ctx, layout, stage, t) draws one moment; mountFolds(root) runs the figure on the page.
import { STAGES, statusFor } from './folds-text.js';
import { PALETTE, GHOST, flatSheet, applyFold, drawStack, stackBox, placer, WING, extend, foldLine, valleyArrow, mountainArrow, stepCircle, pressMarks, robotHand, POSES, blendPose, ease, smooth, clamp } from './diagram.js';

export const LAYOUTS = {
  wide: { x: 0, y: 0, w: 640, h: 430 },
  narrow: { x: 46, y: 0, w: 548, h: 430 },
};
const SIDE = 216, CENTRE = [324, 232];
const LINE = l => extend(l[0], l[1], .09);

// The five folds, each in the coordinates where the paper lies when it starts.
const FOLDS = [
  { name: 'Corner', line: [[.5, 0], [0, .5]], side: [0, 0], kind: 'valley' },
  { name: 'Corner', line: [[.5, 0], [1, .5]], side: [1, 0], kind: 'valley' },
  { name: 'Centre', line: [[.5, -.2], [.5, 1.2]], side: [0, .5], kind: 'mountain', tag: 'back' },
  { name: 'Wing', line: WING, side: [1, 1], kind: 'valley', select: f => f.tag !== 'back' },
  { name: 'Wing', line: WING, side: [1, 1], kind: 'mountain', select: f => f.tag === 'back' },
];
// The stacks before and after each fold.
const STATES = (() => {
  let stack = flatSheet(); const out = [];
  for (const fold of FOLDS) { const r = applyFold(stack, fold); out.push({ fold, before: r.before, start: stack, end: r.after }); stack = r.after; }
  return out;
})();

// Seconds per stage: the hands take longer than a bare diagram.
export const DURATION = [5.8, 5.8, 3.8, 3.8, 3.8];
const FOLD_AT = [[1.05, 3.05], [1.05, 3.05], [.9, 2.7], [.9, 2.7], [.9, 2.7]];
// The moment a still shows: the step drawn, hands in place, before anything moves.
export const STILL_T = .7;

// Each stage is centred on the paper it ends with, moving there as it folds; as the model gets smaller, the view
// comes in closer, as diagrams do.
const ZOOM = [1, 1, 1, 1.18, 1.26, 1.26];
function viewFor(i, u) {
  const centre = st => { const [x0, y0, x1, y1] = stackBox(st); return [(x0 + x1) / 2, (y0 + y1) / 2]; };
  const a = centre(STATES[i].start), b = centre(STATES[i].end), e = ease(u);
  const cx = a[0] + (b[0] - a[0]) * e, cy = a[1] + (b[1] - a[1]) * e, s = SIDE * (ZOOM[i] + (ZOOM[i + 1] - ZOOM[i]) * e);
  return { ox: CENTRE[0] - cx * s, oy: CENTRE[1] - cy * s, s };
}
const onPage = (view, p) => [view.ox + p[0] * view.s, view.oy + p[1] * view.s];

// The notation for each stage, in the coordinates the paper starts in.
function notation(ctx, i, view, P, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  const f = FOLDS[i], L = LINE(f.line).map(p => onPage(view, p)), at = p => onPage(view, p);
  if (i === 0) { foldLine(ctx, ...L, 'valley', P); valleyArrow(ctx, at([.05, .05]), at([.44, .44]), -.42, P); }
  if (i === 1) { foldLine(ctx, ...L, 'valley', P); valleyArrow(ctx, at([.95, .05]), at([.56, .44]), .42, P); }
  if (i === 2) { foldLine(ctx, ...extend(...f.line, -.08).map(at), 'mountain', P); mountainArrow(ctx, at([.18, .82]), at([.8, .8]), .28, P); }
  if (i === 3) { foldLine(ctx, ...L, 'valley', P); valleyArrow(ctx, at([.96, .8]), at([.46, .9]), .36, P); }
  if (i === 4) { foldLine(ctx, ...L, 'mountain', P); mountainArrow(ctx, at([.96, .8]), at([.46, .9]), .36, P, 10, 1, true); }
  ctx.restore();
}

// Where the robot hands are in stages 1 and 2. The folding hand pinches the corner, carries it over, then presses
// the new crease from end to end; the other hand pins the sheet.
const HANDS = [
  { fold: 'left', corner: [0, 0], crease: [[.07, .43], [.4, .1]], pin: [.7, .72], pinAngle: -.7, foldAngle: [1.45, 2.4] },
  { fold: 'right', corner: [1, 0], crease: [[.93, .43], [.6, .1]], pin: [.3, .72], pinAngle: .7, foldAngle: [-1.45, -2.4] },
];
function hands(ctx, i, t, view, theta, P) {
  const H = HANDS[i], [f0, f1] = FOLD_AT[i], s = 1.45;
  const pinSide = H.fold === 'left' ? 'right' : 'left';
  // the pinning hand: settles on the sheet, then lifts away at the end
  const pinLift = 14 * (1 - smooth(0, .5, t)) + 18 * smooth(DURATION[i] - .7, DURATION[i] - .1, t);
  robotHand(ctx, { at: onPage(view, H.pin), angle: H.pinAngle, scale: s, side: pinSide, pose: POSES.pin, anchor: 'pin', lift: pinLift, P });

  // the folding hand
  const place = placer(view, STATES[i].fold, theta, true), corner3d = cornerOnPage(view, i, theta);
  const c0 = H.crease[0], c1 = H.crease[1];
  const pressStart = f1 + .45, pressEnd = f1 + 1.75;
  let at, lift, pose, anchor = 'pinch', angle = H.foldAngle[0] + (H.foldAngle[1] - H.foldAngle[0]) * ease((t - f0) / (f1 - f0));
  if (t < f0) {
    // reach for the corner and close on it
    const u = smooth(0, f0, t);
    at = onPage(view, H.corner); lift = 22 * (1 - u) + 3 * u;
    pose = blendPose(POSES.open, POSES.pinch, smooth(.35, f0, t));
  } else if (t < f1 + .05) {
    // carry the corner over
    at = corner3d.at; lift = corner3d.lift + 3; pose = POSES.pinch;
  } else {
    // let go, and press the crease from end to end
    const u = smooth(f1 + .05, pressStart, t), slide = smooth(pressStart, pressEnd, t), away = smooth(pressEnd + .1, DURATION[i] - .2, t);
    const end = onPage(view, [c0[0] + (c1[0] - c0[0]) * slide, c0[1] + (c1[1] - c0[1]) * slide]);
    const from = place([H.corner[0], H.corner[1]]);
    at = [from[0] + (end[0] - from[0]) * u, from[1] + (end[1] - from[1]) * u];
    lift = 10 * Math.sin(Math.PI * u) + 18 * away;
    pose = blendPose(blendPose(POSES.pinch, POSES.press, u), POSES.rest, away);
    anchor = u > .5 ? 'index' : 'pinch';
    if (t > pressStart && t < pressEnd + .1) pressMarks(ctx, end, angle + Math.PI, P, 7.5, 1 - away);
  }
  robotHand(ctx, { at, angle, scale: s, side: H.fold, pose, anchor, lift, P });
}
// The moving corner's position and height on the page while it turns.
function cornerOnPage(view, i, theta) {
  const fold = STATES[i].fold, [a, b] = fold.line, p = HANDS[i].corner;
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
  const rx = p[0] - a[0], ry = p[1] - a[1], along = rx * ux + ry * uy, nx = rx - along * ux, ny = ry - along * uy, d = Math.hypot(nx, ny);
  const X = a[0] + along * ux + nx * Math.cos(theta), Y = a[1] + along * uy + ny * Math.cos(theta), Z = d * Math.sin(theta);
  return { at: onPage(view, [X, Y]), lift: Z * view.s };
}

// Draw stage i (0–4) at t seconds into it. layout is LAYOUTS.wide or .narrow; the context is scaled to it.
export function drawFolds(ctx, layout, i, t) {
  const P = STAGES[i].done ? PALETTE : GHOST, [f0, f1] = FOLD_AT[i];
  const u = clamp((t - f0) / (f1 - f0)), theta = Math.PI * ease(u), view = viewFor(i, u);
  ctx.save(); ctx.translate(-layout.x, -layout.y);
  const st = STATES[i];
  if (theta <= 1e-3) drawStack(ctx, st.start, view, { P });
  else if (theta >= Math.PI - 1e-3) drawStack(ctx, st.end, view, { P });
  else drawStack(ctx, st.before, view, { fold: st.fold, theta, P });
  notation(ctx, i, view, P, 1 - smooth(f0, f0 + .45, t));
  if (i < 2) hands(ctx, i, t, view, theta, P);
  stepCircle(ctx, layout.x + 34, layout.y + 36, 17, String(i + 1), P);
  ctx.restore();
}

/* ───────────────────────── on the page ───────────────────────── */
// root holds .folds-stage (the still and the canvas), the step buttons [data-step], the play button and the status line.
export function mountFolds(root) {
  const stage = root.querySelector('.folds-stage'), canvas = stage.querySelector('canvas'), still = stage.querySelector('img');
  const steps = [...root.querySelectorAll('[data-step]')], play = root.querySelector('[data-play]'), status = root.querySelector('[data-status]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrowQuery = window.matchMedia('(max-width: 600px)');
  const ctx = canvas.getContext('2d');
  let layout = LAYOUTS.wide, current = 0, t = STILL_T, playing = false, chainAll = false, raf = 0, last = 0, visible = false, started = false, disposed = false;

  const size = () => {
    layout = narrowQuery.matches ? LAYOUTS.narrow : LAYOUTS.wide;
    const w = stage.clientWidth, h = w * layout.h / layout.w, dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    draw();
  };
  const draw = () => {
    const k = canvas.width / layout.w;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    drawFolds(ctx, layout, current, t);
  };
  const say = () => {
    status.textContent = statusFor(current);
    steps.forEach((b, i) => b.setAttribute('aria-current', i === current ? 'step' : 'false'));
    play.textContent = chainAll && playing ? 'Pause' : 'Play all five';
  };
  const frame = now => {
    raf = 0;
    if (disposed || !playing || !visible || document.hidden) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    if (t >= DURATION[current]) {
      if (chainAll && current < 4) { current += 1; t = 0; say(); } else { t = DURATION[current]; playing = false; say(); }
    }
    draw();
    if (playing) raf = requestAnimationFrame(frame);
  };
  const run = () => { if (!raf && playing && visible && !document.hidden && !reduce.matches) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  // Reduced motion: each step is shown as its diagram, without the fold moving.
  const show = (i, all, from = 0) => {
    current = i; chainAll = all; stop();
    if (reduce.matches) { t = STILL_T; playing = false; } else { t = from; playing = true; }
    say(); draw(); run();
  };

  steps.forEach((b, i) => { b.disabled = false; b.onclick = () => show(i, false); });
  play.disabled = false;
  play.onclick = () => { if (playing && chainAll) { playing = false; stop(); say(); } else if (chainAll && t < DURATION[current] && !reduce.matches) { playing = true; run(); say(); } else show(0, true); };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { stop(); return; }
    // the first time it is on screen, it plays all five folds once
    if (!started && !reduce.matches) { started = true; show(0, true, STILL_T); } else run();
  }, { threshold: .35 });
  io.observe(stage);
  const ro = new ResizeObserver(() => size());
  ro.observe(stage);
  const onVis = () => { if (document.hidden) stop(); else run(); };
  document.addEventListener('visibilitychange', onVis);
  const onMotion = () => { if (reduce.matches) { playing = false; stop(); t = STILL_T; draw(); say(); } };
  reduce.addEventListener?.('change', onMotion);
  narrowQuery.addEventListener?.('change', size);

  size(); say();
  stage.classList.add('is-live');
  if (still) still.setAttribute('aria-hidden', 'true');
  return () => {
    disposed = true; stop(); io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    reduce.removeEventListener?.('change', onMotion); narrowQuery.removeEventListener?.('change', size);
  };
}
