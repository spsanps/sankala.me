'use strict';
/* Four frames — the stage. Lays the room out for the viewport, bakes the layers, maps scroll to
   a position between the four places, and composites: view (panning) → room → light → objects →
   live details. Hooks: ?t= freezes time · ?hour= sets San Jose time · ?era= jumps · ?pos= sets
   the continuous position (0 San Jose … 3 Surathkal) for review · ?plain=1 shows the stills. */

const ERAS = ['now', 'sd', 'blr', 'nitk'];
const PLAIN = QS.get('plain') === '1' || REDUCED;
const PHOTO_FILES = ['neurips-award', 'ebay-headquarters', 'ucsd-library', 'research-group', 'uist-award', 'ti-bengaluru', 'nitk-lab'];

/* ───────── layouts (art units) ───────── */
function wideLayout(vw, vh) {
  const u = vh / 1000, artLeft = vw - 1000 * u;
  return {
    mode: 'wide', u, artLeft, xMin: -artLeft / u, xMax: 1000, yMin: 0, yMax: 1000, objScale: 1,
    win: { x: 170, y: 118, w: 470, h: 482, f: 20, transom: .36, bar: 12 },
    sill: { y: 600, h: 20, over: 24 },
    shelf: { x: 690, y: 172, w: 290 },
    pin: { x: 700, y: 214, w: 278, h: 246 },
    desk: { backY: 668, frontY: 806, faceH: 34, leftBack: 34, leftFront: 4, legW: 26 },
    base: { y: 952, h: 20 },
    lamp: { base: [92, 712], elbow: [42, 470], head: [196, 432], aim: [262, 736] },
    slots: { left: [238, 748], center: [440, 772], right: [652, 758], far: [858, 742] },
    floor: [870, 968],
  };
}
function tallLayout(vw, sh) {
  // fit the whole room (700 × ~800 art units); on wider screens the wall and desk run on sideways
  const u = Math.min(vw / 700, sh / 790), yMax = 742, yMin = yMax - sh / u, aw = vw / u;
  return {
    mode: 'tall', u, artLeft: 0, xMin: 350 - aw / 2, xMax: 350 + aw / 2, yMin, yMax, objScale: 1,
    win: { x: 252, y: 36, w: 428, h: 418, f: 18, transom: .36, bar: 11 },
    sill: { y: 454, h: 18, over: 16 },
    shelf: { x: 18, y: 66, w: 206 },
    pin: { x: 22, y: 106, w: 202, h: 236 },
    desk: { backY: 526, frontY: 652, faceH: 30, leftBack: -40, leftFront: -60, legW: 22 },
    base: { y: 806, h: 18 },
    lamp: { base: [74, 566], elbow: [30, 372], head: [142, 338], aim: [196, 606] },
    slots: { left: [150, 606], center: [338, 628], right: [488, 616], far: [646, 604] },
    floor: null,
  };
}

/* ───────── light for each place ─────────
   San Jose follows the real hour; the past keeps the light each place is remembered by. */
function eraLight(era, L) {
  const o = openingOf(L), H = 1000 * o.h / o.w;
  if (era === 'now') {
    const date = sceneDate(), st = skyState(date);
    // the window faces east, toward Mt Hamilton: azimuth 55°…125° spans the opening
    const ax = az => (az - 55) / 70 * 1000, ey = el => H * .44 - el / 30 * H * .44;
    const sunUp = st.sun.el > -1 && st.sun.az > 50 && st.sun.az < 130;
    const moonUp = st.moon.el > 0 && st.moon.az > 45 && st.moon.az < 135 && st.night > .2;
    const patch = st.sun.el > 1 && st.sun.az > 40 && st.sun.az < 160 ? clamp((st.sun.el) / 12) * (1 - smooth(48, 70, st.sun.el)) : 0;
    return {
      key: 'now', label: clockLabel(date), date,
      sky: { ...st, sunUp, sunX: ax(st.sun.az), sunY: ey(st.sun.el), moonUp, moonX: ax(st.moon.az), moonY: ey(st.moon.el) },
      tint: mix(mix(mix('#ffffff', '#fbeedd', st.golden), '#e6e0ec', st.twilight * .8), '#56618a', st.night),
      lamp: st.lamp, patch, patchShift: clamp((st.sun.az - 90) / 60, -1, 1), patchWarm: st.golden,
    };
  }
  if (era === 'sd') return { key: 'sd', label: 'a clear morning', sky: { day: 1, golden: 0, night: 0, twilight: 0, stars: 0, sunUp: false, moonUp: false }, tint: rgb('#ffffff'), lamp: 0, patch: .9, patchShift: -.35, patchWarm: 0 };
  if (era === 'blr') return { key: 'blr', label: 'late afternoon, before the rain', sky: { day: .7, golden: .55, night: 0, twilight: 0, stars: 0, sunUp: false, moonUp: false }, tint: rgb('#f8efe1'), lamp: .0, patch: .75, patchShift: .55, patchWarm: .8 };
  return { key: 'nitk', label: 'after dark, by the sea', sky: { day: 0, golden: 0, night: .78, twilight: .35, stars: .9, sunUp: false, moonUp: true, moon: { phase: .3 }, moonX: 760, moonY: H * .16 }, tint: rgb('#66709a'), lamp: 1, patch: 0, patchShift: 0, patchWarm: 0 };
}

/* ───────── scroll → position ───────── */
const Stage = {
  canvas: null, ctx: null, L: null, px: 1, layers: {}, eras: {}, photos: {}, pos: 0, built: false,
  sections: [], time0: performance.now(), raf: 0, visible: true, lastKey: '',
};

function loadPhotos() {
  return Promise.all(PHOTO_FILES.map(n => new Promise(res => {
    const im = new Image(); im.onload = () => res(); im.onerror = () => res(); im.src = `photos/${n}.jpg`; Stage.photos[n] = im;
  })));
}

function layoutFor() {
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  const wide = vw / vh >= 1.3 && vw >= 900;
  if (wide) return { L: wideLayout(vw, vh), cw: vw, ch: vh };
  const sh = Math.round(Math.min(vh * .56, vw * 1.15));
  return { L: tallLayout(vw, sh), cw: vw, ch: sh };
}

/* measure an object's painted bounds at low resolution (no photos, so the canvas stays readable) */
function measure(L, draw) {
  const s = .25, W = (L.xMax - L.xMin + 200) * s, H = (L.yMax - L.yMin + 400) * s;
  const cv = makeCanvas(W, H), c = cv.getContext('2d', { willReadFrequently: true });
  c.setTransform(s, 0, 0, s, -(L.xMin - 100) * s, -(L.yMin - 300) * s);
  draw(new Pen(c, s));
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const pad = 14;
  return [x0 / s + L.xMin - 100 - pad, y0 / s + L.yMin - 300 - pad, (x1 - x0 + 1) / s + 2 * pad, (y1 - y0 + 1) / s + 2 * pad];
}

function buildEra(era) {
  const L = Stage.L, px = Stage.px, o = openingOf(L);
  const light = eraLight(era, L);
  // the view, baked at the opening's size
  LIGHT = { day: light.sky.day ?? 1, golden: light.sky.golden || 0, night: light.sky.night || 0, twilight: light.sky.twilight || 0 };
  const vpx = o.w * px / 1000, H = 1000 * o.h / o.w;
  const view = bake(vpx, 0, 0, 1000, H, P => VIEWS[era](P, H, light.sky), { texture: .8 });
  // the objects
  const probe = eraObjects(era, L, {});
  const real = eraObjects(era, L, Stage.photos);
  const objs = real.map((ob, i) => {
    const b = measure(L, probe[i].draw) || [0, 0, 1, 1];
    const out = { ...ob, sp: bake(px, b[0], b[1], b[2], b[3], ob.draw) };
    if (ob.lid) { const bl = measure(L, probe[i].lid) || [0, 0, 1, 1]; out.lidSp = bake(px, bl[0], bl[1], bl[2], bl[3], ob.lid); }
    return out;
  });
  // the sunlit patch on the desk, softened once
  const patch = light.patch > 0 ? bakePatch(L, light) : null;
  Stage.eras[era] = { light, view, objs, patch, H };
}

function bakePatch(L, light) {
  const px = Stage.px, o = openingOf(L), d = L.desk, w = L.win;
  const shift = light.patchShift * 120, depth = (d.frontY - d.backY) * 1.05;
  const x0 = L.xMin, y0 = d.backY - 10, W = L.xMax - L.xMin, Hh = d.frontY - d.backY + 60;
  const sp = bake(px, x0, y0, W, Hh, P => {
    P.within(PL([[d.leftBack, d.backY], [L.xMax + 10, d.backY], [L.xMax + 10, d.frontY], [d.leftFront, d.frontY]]), p => {
      const tY = w.transom, mX = o.x + o.w / 2, bar = w.bar;
      const quad = (xa, xb, ya, yb) => { // ya,yb in 0..1 of patch depth; the light shears with the sun
        const sx = v => shift * v;
        return PL([[xa + sx(ya), d.backY + depth * ya], [xb + sx(ya), d.backY + depth * ya], [xb + sx(yb) + 30 * yb, d.backY + depth * yb], [xa + sx(yb) - 30 * yb, d.backY + depth * yb]]);
      };
      const warm = light.patchWarm ? 'rgba(255,214,150,1)' : 'rgba(255,246,222,1)';
      for (const [ya, yb] of [[0, .62 - .03], [.62 + .03, 1]]) {
        p.fill(warm, quad(o.x, mX - bar * .7, ya, yb));
        p.fill(warm, quad(mX + bar * .7, o.x + o.w, ya, yb));
      }
    });
  }, { texture: 0 });
  // soften the edges, the way light through a real window does
  const soft = makeCanvas(sp.cv.width, sp.cv.height), sx = soft.getContext('2d');
  sx.filter = `blur(${Math.max(1, 5 * px)}px)`; sx.drawImage(sp.cv, 0, 0); sp.cv = soft;
  return sp;
}

function buildRoom() {
  const L = Stage.L, px = Stage.px;
  Stage.layers.room = bake(px, L.xMin, L.yMin, L.xMax - L.xMin, L.yMax - L.yMin, P => drawRoom(P, L), { texture: 1 });
}

/* ───────── compositing ───────── */
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;

function motionFor(kind, k, entering) {
  // k: 0 = in place, 1 = fully gone
  if (k <= 0) return {};
  if (k >= 1) return { alpha: 0 };
  const e = entering ? easeOut(k) : easeIn(k);
  switch (kind) {
    case 'right': return { dx: e * 760, dy: -Math.sin(k * PI) * 8, rot: Math.sin(k * PI) * .03 * (entering ? -1 : 1) };
    case 'up': case 'drop': return { dy: -e * 460, rot: (entering ? -.07 : .07) * e };
    case 'board': return { dy: -e * 340, dx: e * 36, rot: e * .14, sc: 1 + Math.sin(k * PI) * .05 };
    default: return { dx: e * 700 };
  }
}
/* when each thing moves inside a change of place (tau 0…1): prints come off first, then the
   shelf, then the desk, then the floor; arrivals start before the last departures finish */
function staggerOf(ob) { return ob.exit === 'board' ? 0 : (ob.exit === 'up' || ob.exit === 'drop') ? .05 : ob.id === 'backpack' || ob.id === 'books' || ob.id === 'box' || ob.id === 'toolbox' ? .14 : .1; }
const HEAVY = new Set(['laptop-base', 'monitor', 'scope']);
function goneK(ob, tau, entering) {
  const d = staggerOf(ob);
  if (HEAVY.has(ob.id)) return entering ? 1 - clamp((tau - .36 - d) / .4) : clamp((tau - d - .1) / .32);   // heavier things move a beat later
  return entering ? 1 - clamp((tau - .3 - d) / .42) : clamp((tau - d) / .38);
}

function drawObjects(c, eraKey, tau, entering, L, px, t, live) {
  const E = Stage.eras[eraKey]; if (!E) return;
  const byId = {}; E.objs.forEach(ob => byId[ob.id] = ob);
  for (const ob of E.objs) {
    if (ob.exit === 'lid') {
      // the screen folds shut over the base before it leaves, and opens after it arrives
      const base = byId[ob.follow], d = staggerOf(base), k = goneK(base, tau, entering);
      const fold = entering ? 1 - clamp((tau - .36 - d - .4) / .12) : clamp((tau - d) / .12);
      const m = motionFor(base.exit, k, entering);
      if (m.alpha === 0) continue;
      const f = easeIO(fold);
      if (f < .92) place(c, ob.sp, px, { ...m, pivot: ob.hinge, sy: Math.max(.05, 1 - f / .92) });
      if (f > .55 && ob.lidSp) place(c, ob.lidSp, px, { ...m, pivot: ob.hinge, sy: clamp((f - .55) / .45) });
      if (k === 0 && fold === 0 && ob.live) live.push(ob);
      continue;
    }
    if (ob.follow) continue;
    const k = goneK(ob, tau, entering);
    const m = motionFor(entering ? ob.enter : ob.exit, k, entering);
    if (m.alpha === 0) continue;
    place(c, ob.sp, px, m);
    if (k === 0 && ob.live) live.push(ob);
  }
}

function drawLive(c, ob, px, t) {
  if (ob.live === 'blink') {
    const cyc = (t + 1.3) % 4.6; if (cyc > .16) return;
    const k = Math.sin(cyc / .16 * PI);
    c.save(); c.scale(px, px);
    for (const [ex, ey, er] of ob.eyes) {
      c.beginPath(); c.rect(ex - er - 2, ey - er - 2, 2 * er + 4, (2 * er + 4) * k); c.fillStyle = PAL.cobalt; c.fill();
      c.lineWidth = LW_IN; c.strokeStyle = INK; c.beginPath(); c.moveTo(ex - er, ey - er + 2 * er * k); c.lineTo(ex + er, ey - er + 2 * er * k); c.stroke();
    }
    c.restore();
  } else if (ob.live === 'trace') {
    // the phosphor dot running along the square wave, leaving a brighter trail (no clip: it stays on the screen)
    const r = ob.screen, ph = (t * .9) % 1, hi = r.y + r.h * .3, lo = r.y + r.h * .7;
    const lvl = u => ((u * 4 + .05) % 1) < .5 ? hi : lo;
    c.save(); c.scale(px, px); c.lineCap = 'round'; c.lineWidth = 2.4;
    for (let i = 0; i < 14; i++) { const u0 = ph - i * .012, u1 = u0 - .012; if (u1 < 0) break; c.strokeStyle = `rgba(200,255,220,${.9 - i * .06})`; c.beginPath(); c.moveTo(r.x + r.w * u0, lvl(u0)); c.lineTo(r.x + r.w * u1, lvl(u0)); c.stroke(); }
    c.fillStyle = '#f2fff6'; c.beginPath(); c.arc(r.x + r.w * ph, lvl(ph), 2.4, 0, TAU); c.fill();
    c.restore();
  } else if (ob.live === 'tokens') {
    // new lines being written under the static ones (sized to stay inside the screen, so no clip)
    const r = ob.screen, cyc = (t % 9) / 9, lines = 6, shown = cyc * lines * 1.3;
    const cols = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3', '#e59a8a'];
    c.save(); c.scale(px, px);
    // the screen gives off its own light: redraw it above the room's light
    c.fillStyle = '#273240'; c.fillRect(r.x + .6, r.y + .6, r.w - 1.2, r.h - 1.2);
    const sc = ['#9bc4e2', '#e8c46a', '#a9d39a', '#d8dde3'];
    for (let i = 0; i < 6; i++) { c.fillStyle = sc[i % 4]; c.fillRect(r.x + 14 + (i % 3 === 2 ? 16 : 0), r.y + 16 + i * 13, 50 + (i * 37 % 70), 4); }
    c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(r.x + r.w * .55, r.y); c.lineTo(r.x + r.w * .78, r.y); c.lineTo(r.x + r.w * .4, r.y + r.h); c.lineTo(r.x + r.w * .17, r.y + r.h); c.closePath(); c.fill();
    for (let i = 0; i < lines; i++) {
      const ly = r.y + 16 + (i + 6) * 13 * .78; if (ly > r.y + r.h - 8) break;
      const x0 = r.x + 14 + (i % 4 === 1 ? 14 : 0), full = Math.min(r.w - 30 - (x0 - r.x), 40 + (i * 53 % 90)), part = clamp(shown - i) * full;
      if (part > 0) { c.fillStyle = cols[(i + 2) % 5]; c.fillRect(x0, ly, part, 3.2); }
      if (part > 0 && part < full) { c.fillStyle = '#f2f2f2'; c.fillRect(x0 + part + 2, ly - 3, 2, 9); }
    }
    c.restore();
  }
}

function render(t) {
  const c = Stage.ctx, L = Stage.L, px = Stage.px; if (!c || !L) return;
  const pos = clamp(Stage.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
  const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)];
  const EA = Stage.eras[pos >= 3 ? 'nitk' : A], EB = Stage.eras[B];
  const inT = tau > 0 && tau < 1 && pos < 3 && EB;
  const o = openingOf(L);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, Stage.canvas.width, Stage.canvas.height);
  c.setTransform(1, 0, 0, 1, -L.xMin * px, -L.yMin * px);   // sprites are placed in art units × px

  /* the view, panning like a train window */
  c.save(); c.beginPath(); c.rect(o.x * px, o.y * px, o.w * px, o.h * px); c.clip();
  if (inT) {
    const e = easeIO(clamp((tau - .15) / .7));
    if (EA) c.drawImage(EA.view.cv, (o.x - e * o.w) * px, o.y * px, o.w * px, o.h * px);
    c.drawImage(EB.view.cv, (o.x + (1 - e) * o.w) * px, o.y * px, o.w * px, o.h * px);
  } else if (EA) c.drawImage(EA.view.cv, o.x * px, o.y * px, o.w * px, o.h * px);
  // the live things outside: they ride along with their view when it pans
  const vs = o.w * px / 1000;
  const liveView = (key, off) => { const f = VIEW_LIVE[key]; if (!f || !Stage.eras[key]) return; c.save(); c.translate((o.x + off) * px, o.y * px); c.scale(vs, vs); f(c, Stage.eras[key].H, t); c.restore(); };
  if (inT) { const e = easeIO(clamp((tau - .15) / .7)); liveView(A, -e * o.w); liveView(B, (1 - e) * o.w); }
  else if (EA) liveView(pos >= 3 ? 'nitk' : A, 0);
  c.restore();

  /* the room */
  place(c, Stage.layers.room, px);

  /* objects, under the light: the leaving place's things go first, then the arriving place's things come */
  const live = [];
  if (inT) {
    drawObjects(c, A, tau, false, L, px, t, live);
    drawObjects(c, B, tau, true, L, px, t, live);
  } else if (EA) drawObjects(c, pos >= 3 ? 'nitk' : A, 0, false, L, px, t, live);

  /* light: blend the two places' light as the scroll moves between them */
  const la = EA ? EA.light : null, lb = inT ? EB.light : null, lt = inT ? easeIO(tau) : 0;
  if (la) {
    const tint = lb ? mix(la.tint, lb.tint, lt) : la.tint;
    if (tint[0] + tint[1] + tint[2] < 762) { // a white tint changes nothing; skip the full-canvas blend
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = css(tint);
      c.beginPath(); c.rect(L.xMin * px, L.yMin * px, (L.xMax - L.xMin) * px, (L.yMax - L.yMin) * px); c.rect((o.x + o.w) * px, o.y * px, -o.w * px, o.h * px); c.fill('evenodd');
      c.restore();
    }
    // sun on the desk
    const pa = EA.patch ? la.patch * (1 - lt) : 0, pb = lb && EB.patch ? lb.patch * lt : 0;
    if (pa > 0) { c.save(); c.globalCompositeOperation = 'soft-light'; place(c, EA.patch, px, { alpha: pa * .7 }); c.globalCompositeOperation = 'screen'; place(c, EA.patch, px, { alpha: pa * .18 }); c.restore(); }
    if (pb > 0) { c.save(); c.globalCompositeOperation = 'soft-light'; place(c, EB.patch, px, { alpha: pb * .7 }); c.globalCompositeOperation = 'screen'; place(c, EB.patch, px, { alpha: pb * .18 }); c.restore(); }
    // the lamp's pool
    const lamp = lb ? lerp(la.lamp, lb.lamp, lt) : la.lamp;
    if (lamp > .02) {
      const [ax, ay] = L.lamp.aim, [hx, hy] = L.lamp.head;
      c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = lamp;
      // the pool on the desk: an ellipse lying on the surface
      c.save(); c.translate(ax * px, ay * px); c.scale(1, .42);
      let g = c.createRadialGradient(0, 0, 8 * px, 0, 0, 300 * px);
      g.addColorStop(0, 'rgba(255,214,150,.85)'); g.addColorStop(.35, 'rgba(255,196,128,.48)'); g.addColorStop(1, 'rgba(255,190,120,0)');
      c.fillStyle = g; c.fillRect(-310 * px, -310 * px, 620 * px, 620 * px); c.restore();
      // the wider glow on the wall and around the lamp head
      g = c.createRadialGradient(hx * px, hy * px, 6 * px, hx * px, hy * px, 420 * px);
      g.addColorStop(0, 'rgba(255,214,160,.55)'); g.addColorStop(.4, 'rgba(255,190,130,.18)'); g.addColorStop(1, 'rgba(255,190,130,0)');
      c.fillStyle = g; c.fillRect((hx - 430) * px, (hy - 430) * px, 860 * px, 860 * px);
      c.restore();
    }
    const night = lb ? lerp(la.sky.night || 0, lb.sky.night || 0, lt) : (la.sky.night || 0);
    if (night > .2) {
      const scr = (Stage.eras[pos >= 3 ? 'nitk' : A] || {}).objs?.find(ob => ob.screen && ob.glow);
      if (scr && !inT) {
        const r = scr.screen, gx = r.x + r.w / 2, gy = r.y + r.h;
        c.save(); c.beginPath(); c.rect(L.xMin * px, L.yMin * px, (L.xMax - L.xMin) * px, (L.desk.frontY - L.yMin) * px); c.clip();
        c.globalCompositeOperation = 'screen'; c.globalAlpha = (night - .2) * .9;
        c.translate(gx * px, (gy + 40) * px); c.scale(1, .5);
        const g = c.createRadialGradient(0, 0, 10 * px, 0, 0, 260 * px);
        g.addColorStop(0, scr.glow); g.addColorStop(1, scr.glow.replace(/[\d.]+\)$/, '0)'));
        c.fillStyle = g; c.fillRect(-270 * px, -270 * px, 540 * px, 540 * px); c.restore();
      }
    }
  }

  /* screens and eyes stay live on top of the light: screens give off their own */
  for (const ob of live) drawLive(c, ob, px, t);
}

/* ───────── text colour follows the light on the wall ───────── */
function updateInk() {
  const L = Stage.L; if (!L || L.mode !== 'wide') { document.documentElement.style.removeProperty('--lane-ink'); return; }
  const pos = clamp(Stage.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
  const EA = Stage.eras[ERAS[i]], EB = Stage.eras[ERAS[Math.min(3, i + 1)]];
  if (!EA) return;
  const tint = EB && tau > 0 ? mix(EA.light.tint, EB.light.tint, easeIO(tau)) : EA.light.tint;
  const w = rgb(PAL.wall), lum = (.2126 * w[0] * tint[0] + .7152 * w[1] * tint[1] + .0722 * w[2] * tint[2]) / 255 / 255;
  document.documentElement.classList.toggle('lane-dark', lum < .42);
}

/* ───────── scroll mapping ───────── */
function scrollPos() {
  // the change happens while the next place's heading travels up the reading area
  const tall = Stage.L && Stage.L.mode === 'tall', vh = window.innerHeight;
  const ref = window.scrollY + vh * (tall ? .73 : .62), span = vh * (tall ? .27 : .38);
  const tops = Stage.sections.map(s => s.getBoundingClientRect().top + window.scrollY);
  if (!tops.length) return 0;
  let pos = 0;
  for (let k = 1; k < tops.length; k++) {
    const a = tops[k] - span, b = tops[k];
    if (ref >= b) pos = k; else if (ref > a) { pos = k - 1 + (ref - a) / span; break; } else break;
  }
  return clamp(pos, 0, 3);
}

function frame(now) {
  Stage.raf = 0;
  if (document.hidden || !Stage.built) return;
  const t = FIXED_T != null ? FIXED_T : (now - Stage.time0) / 1000;
  const p = POS_JUMP != null ? POS_JUMP : scrollPos();
  Stage.pos = p;
  render(t);
  updateInk();
  updateCaption();
  if (FIXED_T == null && !REDUCED && Stage.visible) Stage.raf = requestAnimationFrame(frame);
}
function kick() { if (!Stage.raf && Stage.built && !document.hidden) Stage.raf = requestAnimationFrame(frame); }

function updateCaption() {
  const el = document.getElementById('stage-caption'); if (!el) return;
  const pos = Stage.pos, k = ERAS[Math.min(3, Math.round(pos))], E = Stage.eras[k]; if (!E) return;
  const names = { now: 'San Jose', sd: 'San Diego', blr: 'Bengaluru', nitk: 'Surathkal' };
  const txt = `${names[k]} · ${E.light.label}`;
  if (el.textContent !== txt) el.textContent = txt;
}

/* ───────── build and wire up ───────── */
async function buildStage() {
  const { L, cw, ch } = layoutFor();
  const bar = document.getElementById('topbar');
  document.documentElement.style.setProperty('--bar-h', (L.mode === 'tall' ? bar.getBoundingClientRect().height : 0) + 'px');
  document.documentElement.style.setProperty('--art-left', L.artLeft + 'px');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  Stage.L = L; Stage.px = L.u * dpr;
  const cv = Stage.canvas;
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  Stage.ctx = cv.getContext('2d');
  Stage.eras = {}; Stage.built = false;
  makeTextures();
  buildRoom();
  const first = ERA_JUMP && ERAS.includes(ERA_JUMP) ? ERA_JUMP : (POS_JUMP != null ? ERAS[Math.min(3, Math.floor(POS_JUMP))] : 'now');
  buildEra(first);
  if (POS_JUMP != null && POS_JUMP % 1 > 0) buildEra(ERAS[Math.min(3, Math.floor(POS_JUMP) + 1)]);
  Stage.built = true;
  if (ERA_JUMP && ERAS.includes(ERA_JUMP)) { const sec = Stage.sections[ERAS.indexOf(ERA_JUMP)]; if (sec) window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY - window.innerHeight * .2); }
  frame(performance.now());
  // the other places, a little later, so the first frame is fast
  const rest = ERAS.filter(e => !Stage.eras[e]);
  if (FIXED_T != null) { rest.forEach(buildEra); }
  else for (const e of rest) { await new Promise(r => setTimeout(r, 30)); buildEra(e); }
  kick();
}

async function boot() {
  Stage.canvas = document.getElementById('stage-canvas');
  Stage.sections = [...document.querySelectorAll('[data-frame]')];
  await loadPhotos();
  await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]);
  if (PLAIN) { await buildPlain(); window.__ready = true; return; }
  await buildStage();
  window.__ready = true;
  addEventListener('scroll', kick, { passive: true });
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(buildStage, 220); });
  document.addEventListener('visibilitychange', kick);
  const io = new IntersectionObserver(es => { Stage.visible = es[0].isIntersecting; kick(); });
  io.observe(document.getElementById('stage'));
  const shelf = document.getElementById('shelf');
  if (shelf && window.mountShelf) window.mountShelf(shelf, ['overfitting', 'gpt7', 'capricious', 'anothersky', 'clauiet', 'startr', 'zinify', 'dyson', 'power']);
  drawColophon();
}

/* the little robot in the footer, the same figurine as on the desk */
function drawColophon() {
  const cv = document.getElementById('colophon-robot'); if (!cv) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = 64, h = 84, f = .54; // css px per art unit
  cv.width = w * dpr; cv.height = h * dpr;
  const c = cv.getContext('2d'); c.setTransform(dpr * f, 0, 0, dpr * f, 0, 0);
  drawRobot(new Pen(c, dpr * f), 52, 150, 1);
}

/* plain version / reduced motion: each place as a still above its words */
async function buildPlain() {
  document.documentElement.classList.add('plain');
  const vw = Math.min(document.documentElement.clientWidth, 1100);
  const wide = vw >= 700;
  const L = wide ? wideLayout(vw, vw / 1.6) : tallLayout(vw, Math.round(vw * 1.15));
  if (wide) { L.xMin = 0; L.artLeft = 0; L.u = vw / 1000; }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  Stage.L = L; Stage.px = L.u * dpr; makeTextures(); buildRoom();
  const ch = wide ? Math.round(vw / 1.0 * (L.yMax - L.yMin) / (L.xMax - L.xMin)) : Math.round((L.yMax - L.yMin) * L.u);
  for (let k = 0; k < 4; k++) {
    buildEra(ERAS[k]);
    const sec = Stage.sections[k], cv = document.createElement('canvas');
    cv.className = 'plain-still'; cv.width = Math.round(vw * dpr); cv.height = Math.round(ch * dpr); cv.style.aspectRatio = `${vw} / ${ch}`;
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', sec.dataset.alt || '');
    Stage.canvas = cv; Stage.ctx = cv.getContext('2d'); Stage.pos = k; render(FIXED_T ?? 0);
    sec.insertBefore(cv, sec.firstChild);
  }
  const shelf = document.getElementById('shelf');
  if (shelf && window.mountShelf) window.mountShelf(shelf, ['overfitting', 'gpt7', 'capricious', 'anothersky', 'clauiet', 'startr', 'zinify', 'dyson', 'power']);
  drawColophon();
}

boot();
