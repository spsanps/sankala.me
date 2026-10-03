/* The bench oscilloscope. Drawn entirely in code; driven by the real buttons laid over it.
   DESIGN
   - An instrument, not an illustration: warm grey ABS case, recessed dark bezel, a backlit
     blue LCD with a yellow CH1 trace and cyan readouts, echoing the digital scope in San's
     NITK lab photo. Silk-screened labels, knurled knobs, a BNC with its probe cable.
   - The network speaks the instrument's language: its cells sit under the trace like a math
     channel, its confidence fills the soft-key menu.
   - Palette: case #d9d4c9 / bezel #2a2d33 / screen #0b1d4e / trace #ffd84a / readout #55e4ff /
     amber LED #ffb12e. One accent per job: yellow is the signal, cyan is the network.
   - Refuse: glossy gradients, fake brand names of real makers, pulsing dots, chrome that does
     nothing. Every control works. */
import PQ from './signal.js';
import { figParams } from '../../../../components/art/essay-fonts.js';

// Mounts the oscilloscope into `fig` (the <figure>) and returns a cleanup function.
export function mountScope(fig) {
  const TAU = Math.PI * 2;
  const ac = new AbortController(), on = (target, type, fn, opts) => target.addEventListener(type, fn, { ...opts, signal: ac.signal });
  const qs = figParams();
  let disposed = false;
  const FREEZE = qs.has('t') ? parseFloat(qs.get('t')) || 0 : null;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = motionQuery.matches || qs.get('motion') === 'reduce';

  const C = {
    plastic: '#d9d4c9', plasticHi: '#e7e3da', plasticLo: '#c4bdb0', panel: '#cfc8bb', trim: '#a8a092',
    silk: '#45423b', silk2: '#7b766b', bezel: '#2a2d33', bezel2: '#17191d', key: '#efebe3', keyLo: '#9f988b',
    knob: '#2f3338', knobHi: '#596068', metal: '#a3a8ae', ledOff: '#6e655a', amber: '#ffb12e', green: '#62d672', red: '#ff5b4f',
    scr: '#0a1b4a', scr2: '#173582', grat: '#5076cc', txt: '#eaf0fd', dim: '#8ea4d8', cyan: '#55e4ff', yellow: '#ffd84a', orange: '#ff9e3d',
  };
  const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  const SANS = '"DM Sans", system-ui, sans-serif';
  const TIMEDIV = [{ ms: 10, N: 5 }, { ms: 20, N: 10 }, { ms: 40, N: 20 }];
  const VOLTDIV = [50, 100, 200];
  const ARM = 0.55, WALK = 3.0, HOLD = 2.6, SEG = ARM + WALK + HOLD;
  const AUTO = ['sag', 'notch', 'flicker', 'transient', 'interruption', 'harmonics', 'swell', 'normal'];
  const KIND = Object.fromEntries(PQ.KINDS.map(k => [k.id, k]));

  const stage = fig.querySelector('.scope-stage');
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const controls = stage.querySelector('.scope-controls');
  const live = fig.querySelector('#scope-live');

  const state = {
    mode: 'auto', kind: 'sag', seed: 1, t0: 0, td: 1, vd: 1, level: 0, running: true,
    pressed: null, pressT: -9, ang: { td: 0, vd: 0, lv: 0 }, announced: '',
  };
  if (qs.get('kind') && KIND[qs.get('kind')]) { state.mode = 'manual'; state.kind = qs.get('kind'); state.seed = parseInt(qs.get('seed') || '3', 10); }
  if (qs.has('td')) state.td = Math.max(0, Math.min(2, parseInt(qs.get('td'), 10)));
  if (qs.has('vd')) state.vd = Math.max(0, Math.min(2, parseInt(qs.get('vd'), 10)));
  let clock = 0, sig = null, steps = null, sigKey = '';
  let L = null, body = null, screenBase = null, dpr = 1;

  const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const tdAngle = i => (i - 1) * 0.72, lvAngle = v => (v / 150) * 2.1;

  /* ---------------- layout (logical units; u = CSS px per unit) ---------------- */
  function layout() {
    const W = Math.max(280, stage.clientWidth), wide = W >= 700;
    const LW = wide ? 1000 : 400, LH = wide ? 600 : 800, u = W / LW;
    const o = { W, H: Math.round(LH * u), u, wide, LW, LH };
    if (wide) {
      o.case = { x: 10, y: 12, w: 980, h: 548, r: 26 };
      o.bezel = { x: 36, y: 72, w: 604, h: 424, r: 16 };
      o.s = { x: 52, y: 88, w: 572, h: 392 };
      const s = o.s;
      o.g = { x: s.x + 12, y: s.y + 34, w: 392, h: 240 };
      o.band = { x: o.g.x, y: o.g.y + o.g.h + 10, w: o.g.w, h: 46 };
      o.msg = { x: s.x + 12, y: o.band.y + o.band.h + 6, w: o.g.w, h: 26 };
      o.menu = { x: s.x + 418, y: s.y + 32, w: 142, h: 352 };
      const rowH = o.menu.h / 8;
      o.rows = PQ.KINDS.map((k, i) => ({ x: o.menu.x, y: o.menu.y + rowH * i, w: o.menu.w, h: rowH }));
      o.keys = o.rows.map(r => ({ x: 654, y: r.y + r.h / 2 - 14, w: 36, h: 28 }));
      o.panel = { x: 712, y: 64, w: 262, h: 456, r: 14 };
      o.groups = [
        { x: 722, y: 78, w: 118, h: 166, label: 'HORIZONTAL' },
        { x: 846, y: 78, w: 118, h: 166, label: 'VERTICAL' },
        { x: 722, y: 254, w: 118, h: 128, label: 'TRIGGER' },
        { x: 846, y: 254, w: 118, h: 128, label: 'RUN CONTROL' },
      ];
      o.knobs = {
        td: { cx: 781, cy: 160, r: 37, label: 'TIME/DIV', marks: TIMEDIV.map(t => t.ms + 'ms'), kind: 'detent' },
        vd: { cx: 905, cy: 160, r: 37, label: 'VOLTS/DIV', marks: VOLTDIV.map(v => v + 'V'), kind: 'detent' },
        lv: { cx: 781, cy: 318, r: 25, label: 'LEVEL', kind: 'level' },
      };
      o.btns = { run: { x: 858, y: 280, w: 94, h: 34, label: 'RUN/STOP' }, single: { x: 858, y: 326, w: 94, h: 34, label: 'SINGLE' } };
      o.bnc = [{ cx: 781, cy: 448, r: 19, label: 'CH1' }, { cx: 905, cy: 448, r: 15, label: 'EXT TRIG' }];
      o.power = { cx: 950, cy: 42, r: 11 };
      o.brand = { x: 40, y: 48 };
      o.sticker = { x: 54, y: 512, w: 164, h: 24 };
      o.feet = [{ x: 86, w: 74 }, { x: 840, w: 74 }];
    } else {
      o.case = { x: 8, y: 10, w: 384, h: 772, r: 22 };
      o.bezel = { x: 20, y: 56, w: 360, h: 420, r: 14 };
      o.s = { x: 31, y: 67, w: 338, h: 398 };
      const s = o.s;
      o.g = { x: s.x + 11, y: s.y + 30, w: 316, h: 200 };
      o.band = { x: o.g.x, y: o.g.y + o.g.h + 8, w: o.g.w, h: 40 };
      o.bars = { x: s.x + 11, y: o.band.y + o.band.h + 8, w: 316, h: 82 };
      o.msg = { x: s.x + 11, y: o.bars.y + o.bars.h + 4, w: 316, h: 22 };
      o.keys = PQ.KINDS.map((k, i) => ({ x: 22 + (i % 4) * 89, y: 496 + Math.floor(i / 4) * 48, w: 80, h: 38 }));
      o.panel = null;
      o.knobs = {
        td: { cx: 80, cy: 666, r: 33, label: 'TIME/DIV', marks: TIMEDIV.map(t => t.ms + 'ms'), kind: 'detent' },
        vd: { cx: 192, cy: 666, r: 33, label: 'VOLTS/DIV', marks: VOLTDIV.map(v => v + 'V'), kind: 'detent' },
      };
      o.btns = { run: { x: 262, y: 620, w: 108, h: 36, label: 'RUN/STOP' }, single: { x: 262, y: 666, w: 108, h: 36, label: 'SINGLE' } };
      o.bnc = [{ cx: 320, cy: 746, r: 13, label: 'CH1' }];
      o.power = { cx: 366, cy: 36, r: 10 };
      o.brand = { x: 24, y: 40 };
      o.sticker = { x: 24, y: 740, w: 168, h: 22 };
      o.feet = [{ x: 40, w: 60 }, { x: 300, w: 60 }];
    }
    return o;
  }

  /* ---------------- drawing helpers ---------------- */
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function text(c, s, x, y, { font = SANS, size = 11, weight = 600, color = C.silk, align = 'left', base = 'alphabetic', track = 0 } = {}) {
    c.font = `${weight} ${size}px ${font}`; c.fillStyle = color; c.textAlign = align; c.textBaseline = base;
    if ('letterSpacing' in c) { c.letterSpacing = track + 'px'; c.fillText(s, x, y); c.letterSpacing = '0px'; }
    else c.fillText(s, x, y);
  }
  let speckle = null;
  function speckleOf() {
    if (speckle) return speckle;
    const p = document.createElement('canvas'); p.width = p.height = 160; const x = p.getContext('2d'), r = PQ.rng(91);
    for (let i = 0; i < 2600; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.55)' : 'rgba(60,50,40,.5)'; x.fillRect(r() * 160, r() * 160, r() < 0.8 ? 0.7 : 1.2, r() < 0.8 ? 0.7 : 1.2); }
    return (speckle = p);
  }
  function plastic(c, x, y, w, h, r, base, hi, lo, sp = 0.09) {
    rr(c, x, y, w, h, r);
    const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, hi); gr.addColorStop(0.08, base); gr.addColorStop(0.9, base); gr.addColorStop(1, lo);
    c.fillStyle = gr; c.fill();
    c.save(); rr(c, x, y, w, h, r); c.clip(); c.globalAlpha = sp; c.fillStyle = c.createPattern(speckleOf(), 'repeat'); c.fillRect(x, y, w, h); c.restore();
  }

  /* ---------------- the static body (cached per layout) ---------------- */
  function buildBody() {
    const cv = document.createElement('canvas'); cv.width = Math.round(L.W * dpr); cv.height = Math.round(L.H * dpr);
    const c = cv.getContext('2d'); c.scale(L.u * dpr, L.u * dpr);
    const K = L.case, sh = L.u * dpr;
    // bench shadow and rubber feet
    c.save(); c.filter = `blur(${6}px)`; c.fillStyle = 'rgba(40,30,20,.22)'; c.beginPath(); c.ellipse(K.x + K.w / 2, K.y + K.h + 6, K.w * 0.47, 10, 0, 0, TAU); c.fill(); c.restore();
    c.fillStyle = '#3a3733'; for (const f of L.feet) { rr(c, f.x, K.y + K.h - 6, f.w, 14, 5); c.fill(); }
    // case
    c.save(); c.shadowColor = 'rgba(30,24,16,.28)'; c.shadowBlur = 18 * sh; c.shadowOffsetY = 6 * sh;
    rr(c, K.x, K.y, K.w, K.h, K.r); c.fillStyle = C.plastic; c.fill(); c.restore();
    plastic(c, K.x, K.y, K.w, K.h, K.r, C.plastic, C.plasticHi, C.plasticLo);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.2; rr(c, K.x + 1.5, K.y + 1.5, K.w - 3, K.h - 3, K.r - 1.5); c.stroke();
    c.strokeStyle = 'rgba(70,60,48,.35)'; c.lineWidth = 1; rr(c, K.x + 0.5, K.y + 0.5, K.w - 1, K.h - 1, K.r); c.stroke();
    // control panel inset
    if (L.panel) {
      const P = L.panel;
      plastic(c, P.x, P.y, P.w, P.h, P.r, C.panel, '#c3bcae', '#d8d2c6', 0.07);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(P.x + P.r, P.y + P.h + 0.5); c.lineTo(P.x + P.w - P.r, P.y + P.h + 0.5); c.stroke();
      c.strokeStyle = 'rgba(80,70,58,.28)'; rr(c, P.x, P.y, P.w, P.h, P.r); c.stroke();
      for (const g of L.groups) {
        c.strokeStyle = 'rgba(69,66,59,.5)'; c.lineWidth = 0.9; rr(c, g.x, g.y, g.w, g.h, 6); c.stroke();
        c.fillStyle = C.panel; const tw = g.label.length * 6.1 + 10; c.fillRect(g.x + 10, g.y - 5, tw, 10);
        text(c, g.label, g.x + 15, g.y + 3.5, { size: 8.5, weight: 700, color: C.silk2, track: 1.2 });
      }
    } else {
      c.strokeStyle = 'rgba(69,66,59,.35)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(62, 489); c.lineTo(376, 489); c.moveTo(24, 596); c.lineTo(376, 596); c.stroke();
      text(c, 'EVENT', 24, 492, { size: 8.5, weight: 700, color: C.silk2, track: 1.2 });
    }
    // brand line
    const B = L.brand;
    text(c, 'DSO-5022', B.x, B.y, { size: L.wide ? 15 : 13, weight: 700, color: C.silk, track: 0.5 });
    text(c, 'DIGITAL STORAGE OSCILLOSCOPE', B.x + (L.wide ? 92 : 80), B.y, { size: L.wide ? 9.5 : 7.8, weight: 600, color: C.silk2, track: 1.3 });
    if (L.wide) text(c, '100 MHz   1 GSa/s', L.bezel.x + L.bezel.w, B.y, { size: 9.5, weight: 600, color: C.silk2, align: 'right', track: 1.2 });
    // power button
    const Pw = L.power;
    c.fillStyle = '#b9b1a3'; c.beginPath(); c.arc(Pw.cx, Pw.cy, Pw.r + 3, 0, TAU); c.fill();
    const pg = c.createRadialGradient(Pw.cx - 3, Pw.cy - 4, 1, Pw.cx, Pw.cy, Pw.r); pg.addColorStop(0, '#f4f1ea'); pg.addColorStop(1, '#cfc8bb');
    c.fillStyle = pg; c.beginPath(); c.arc(Pw.cx, Pw.cy, Pw.r, 0, TAU); c.fill();
    c.strokeStyle = C.silk2; c.lineWidth = 1.4; c.beginPath(); c.arc(Pw.cx, Pw.cy, Pw.r * 0.45, -Math.PI * 0.32, Math.PI * 1.32); c.moveTo(Pw.cx, Pw.cy - Pw.r * 0.6); c.lineTo(Pw.cx, Pw.cy - Pw.r * 0.1); c.stroke();
    c.fillStyle = C.green; c.beginPath(); c.arc(Pw.cx - Pw.r - 9, Pw.cy, 2.2, 0, TAU); c.fill();
    // bezel and recessed screen frame
    const Z = L.bezel;
    c.save(); c.shadowColor = 'rgba(255,255,255,.6)'; c.shadowOffsetY = 1.2 * sh; rr(c, Z.x, Z.y, Z.w, Z.h, Z.r); c.fillStyle = C.bezel; c.fill(); c.restore();
    const bz = c.createLinearGradient(0, Z.y, 0, Z.y + Z.h); bz.addColorStop(0, '#1f2226'); bz.addColorStop(0.1, C.bezel); bz.addColorStop(1, '#33373e');
    rr(c, Z.x, Z.y, Z.w, Z.h, Z.r); c.fillStyle = bz; c.fill();
    const S = L.s; rr(c, S.x - 3, S.y - 3, S.w + 6, S.h + 6, 7); c.fillStyle = C.bezel2; c.fill();
    if (L.wide) text(c, 'MENU', L.keys[0].x + 18, L.keys[0].y - 12, { size: 8, weight: 700, color: C.silk2, align: 'center', track: 1.2 });
    // knob scales and skirts
    for (const id in L.knobs) {
      const k = L.knobs[id];
      c.strokeStyle = C.silk; c.lineWidth = 1.1;
      if (k.kind === 'detent') {
        k.marks.forEach((m, i) => {
          const a = tdAngle(i) - Math.PI / 2, r1 = k.r + 6, r2 = k.r + 12;
          c.beginPath(); c.moveTo(k.cx + Math.cos(a) * r1, k.cy + Math.sin(a) * r1); c.lineTo(k.cx + Math.cos(a) * r2, k.cy + Math.sin(a) * r2); c.stroke();
          text(c, m, k.cx + Math.cos(a) * (k.r + 22), k.cy + Math.sin(a) * (k.r + 22) + 3, { size: L.wide ? 8.5 : 8, weight: 600, color: C.silk, align: 'center', font: MONO });
        });
      } else {
        for (let i = 0; i <= 12; i++) { const a = -2.1 + (4.2 * i) / 12 - Math.PI / 2, r1 = k.r + 5, r2 = k.r + (i % 6 === 0 ? 11 : 8); c.beginPath(); c.moveTo(k.cx + Math.cos(a) * r1, k.cy + Math.sin(a) * r1); c.lineTo(k.cx + Math.cos(a) * r2, k.cy + Math.sin(a) * r2); c.stroke(); }
      }
      text(c, k.label, k.cx, k.cy + k.r + (L.wide ? 30 : 28), { size: L.wide ? 9 : 8.5, weight: 700, color: C.silk, align: 'center', track: 1.1 });
      const skirt = c.createRadialGradient(k.cx - k.r * 0.3, k.cy - k.r * 0.4, 1, k.cx, k.cy, k.r + 4);
      skirt.addColorStop(0, '#e7e9eb'); skirt.addColorStop(0.7, C.metal); skirt.addColorStop(1, '#6f747a');
      c.fillStyle = skirt; c.beginPath(); c.arc(k.cx, k.cy, k.r + 4, 0, TAU); c.fill();
    }
    // connectors
    for (const b of L.bnc) {
      text(c, b.label, b.cx, b.cy - b.r - 9, { size: 8.5, weight: 700, color: C.silk, align: 'center', track: 1.1 });
      const mg = c.createRadialGradient(b.cx - b.r * 0.4, b.cy - b.r * 0.5, 1, b.cx, b.cy, b.r);
      mg.addColorStop(0, '#f2f3f4'); mg.addColorStop(0.6, '#a8adb3'); mg.addColorStop(1, '#5e6369');
      c.fillStyle = mg; c.beginPath(); c.arc(b.cx, b.cy, b.r, 0, TAU); c.fill();
      c.fillStyle = '#7d8288'; for (const a of [0, Math.PI]) { c.beginPath(); c.arc(b.cx + Math.cos(a) * b.r * 0.95, b.cy + Math.sin(a) * b.r * 0.95, b.r * 0.16, 0, TAU); c.fill(); }
      c.fillStyle = '#1b1c1f'; c.beginPath(); c.arc(b.cx, b.cy, b.r * 0.55, 0, TAU); c.fill();
      c.fillStyle = '#d8c48a'; c.beginPath(); c.arc(b.cx, b.cy, b.r * 0.13, 0, TAU); c.fill();
    }
    // the probe cable leaves the CH1 connector, hangs over the front edge and runs off the bench
    {
      const b0 = L.bnc[0];
      const path = () => {
        c.beginPath(); c.moveTo(b0.cx, b0.cy + b0.r * 0.4);
        if (L.wide) c.bezierCurveTo(b0.cx + 4, b0.cy + 70, b0.cx - 70, K.y + K.h + 4, b0.cx - 210, L.LH + 30);
        else c.bezierCurveTo(b0.cx + 4, b0.cy + 26, b0.cx + 30, K.y + K.h + 6, b0.cx + 70, L.LH + 30);
      };
      c.save(); c.lineCap = 'round';
      c.filter = 'blur(3px)'; c.strokeStyle = 'rgba(30,24,16,.25)'; c.lineWidth = 9; c.translate(3, 5); path(); c.stroke(); c.restore();
      c.save(); c.lineCap = 'round';
      c.strokeStyle = '#212328'; c.lineWidth = L.wide ? 8.5 : 7; path(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 1.6; c.translate(-1.4, -1); path(); c.stroke(); c.restore();
      // the probe's strain relief on the connector
      c.fillStyle = '#2a2c31'; rr(c, b0.cx - b0.r * 0.42, b0.cy - b0.r * 0.2, b0.r * 0.84, b0.r * 1.1, 3); c.fill();
    }
    // the lab's asset tag, copied from the scope in San's NITK lab photo
    // a strip of masking tape someone left on the bench scope
    if (L.wide) {
      c.save(); c.translate(372, 522); c.rotate(-0.025);
      c.fillStyle = 'rgba(236,224,186,.94)'; c.beginPath(); c.moveTo(-104, -13);
      for (let i = 0; i <= 6; i++) c.lineTo(-104 + (i % 2 ? 2.5 : 0), -13 + i * 26 / 6);
      c.lineTo(104, 13); for (let i = 0; i <= 6; i++) c.lineTo(104 - (i % 2 ? 2.5 : 0), 13 - i * 26 / 6); c.closePath(); c.fill();
      c.globalAlpha = 0.06; c.fillStyle = c.createPattern(speckleOf(), 'repeat'); c.fill(); c.globalAlpha = 1;
      text(c, 'try FLICKER at 40 ms  →', 0, 6, { font: '"Caveat", cursive', size: 19, weight: 600, color: '#27407a', align: 'center' });
      c.restore();
    }
    const T = L.sticker;
    c.save(); c.translate(T.x + T.w / 2, T.y + T.h / 2); c.rotate(-0.012);
    c.shadowColor = 'rgba(0,0,0,.12)'; c.shadowBlur = 2 * sh; c.shadowOffsetY = 0.6 * sh;
    c.fillStyle = '#f7f4ec'; c.fillRect(-T.w / 2, -T.h / 2, T.w, T.h); c.shadowColor = 'transparent';
    text(c, 'NITK/EED/8900/8/19', 0, 4, { size: L.wide ? 11.5 : 11, weight: 500, color: '#2a2a2a', align: 'center', font: MONO, track: 0.4 });
    c.restore();
    return cv;
  }

  /* ---------------- the screen base: backlight, LCD grain, graticule ---------------- */
  function buildScreenBase() {
    const cv = document.createElement('canvas'); cv.width = Math.round(L.W * dpr); cv.height = Math.round(L.H * dpr);
    const c = cv.getContext('2d'); c.scale(L.u * dpr, L.u * dpr);
    const S = L.s, G = L.g;
    rr(c, S.x, S.y, S.w, S.h, 5); c.save(); c.clip();
    const bg = c.createRadialGradient(S.x + S.w * 0.45, S.y + S.h * 0.42, 10, S.x + S.w / 2, S.y + S.h / 2, S.w * 0.75);
    bg.addColorStop(0, C.scr2); bg.addColorStop(1, C.scr); c.fillStyle = bg; c.fillRect(S.x, S.y, S.w, S.h);
    // LCD pixel lattice, very faint
    c.globalAlpha = 0.07; c.fillStyle = '#000';
    for (let y = S.y; y < S.y + S.h; y += 1.6) c.fillRect(S.x, y, S.w, 0.45);
    c.globalAlpha = 1;
    // status band
    c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(S.x, S.y, S.w, L.wide ? 26 : 23);
    // graticule: dotted divisions, ticked centre axes
    const dx = G.w / 10, dy = G.h / 8;
    c.fillStyle = C.grat;
    for (let i = 0; i <= 10; i++) for (let y = G.y; y <= G.y + G.h + 0.1; y += dy / 5) { c.globalAlpha = i === 0 || i === 10 ? 0.75 : 0.42; c.fillRect(G.x + i * dx - 0.55, y - 0.55, 1.1, 1.1); }
    for (let j = 0; j <= 8; j++) for (let x = G.x; x <= G.x + G.w + 0.1; x += dx / 5) { c.globalAlpha = j === 0 || j === 8 ? 0.75 : 0.42; c.fillRect(x - 0.55, G.y + j * dy - 0.55, 1.1, 1.1); }
    c.globalAlpha = 0.8; c.strokeStyle = C.grat; c.lineWidth = 0.8;
    for (let x = G.x; x <= G.x + G.w + 0.1; x += dx / 5) { c.beginPath(); c.moveTo(x, G.y + G.h / 2 - 2.4); c.lineTo(x, G.y + G.h / 2 + 2.4); c.stroke(); }
    for (let y = G.y; y <= G.y + G.h + 0.1; y += dy / 5) { c.beginPath(); c.moveTo(G.x + G.w / 2 - 2.4, y); c.lineTo(G.x + G.w / 2 + 2.4, y); c.stroke(); }
    c.globalAlpha = 0.9; c.strokeRect(G.x, G.y, G.w, G.h);
    c.globalAlpha = 1;
    if (L.wide) { c.strokeStyle = 'rgba(80,118,204,.35)'; c.beginPath(); c.moveTo(L.menu.x - 6, S.y + 30); c.lineTo(L.menu.x - 6, S.y + S.h - 8); c.stroke(); }
    c.restore();
    return cv;
  }

  /* ---------------- dynamic parts ---------------- */
  function drawKnob(c, k, ang) {
    const { cx, cy, r } = k, sh = L.u * dpr;
    c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 5 * sh; c.shadowOffsetY = 2.5 * sh;
    c.fillStyle = C.knob; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); c.restore();
    const g = c.createRadialGradient(cx - r * 0.45, cy - r * 0.55, r * 0.1, cx, cy, r);
    g.addColorStop(0, C.knobHi); g.addColorStop(1, '#202327'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1;
    const n = Math.round(r * 1.4);
    for (let i = 0; i < n; i++) { const a = ang + (i / n) * TAU; c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86); c.lineTo(cx + Math.cos(a) * r * 0.99, cy + Math.sin(a) * r * 0.99); c.stroke(); }
    const t = c.createRadialGradient(cx - r * 0.3, cy - r * 0.4, 1, cx, cy, r * 0.72);
    t.addColorStop(0, '#666d75'); t.addColorStop(1, '#2b2f34'); c.fillStyle = t; c.beginPath(); c.arc(cx, cy, r * 0.72, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(cx, cy, r * 0.72, Math.PI * 1.05, Math.PI * 1.75); c.stroke();
    const a = ang - Math.PI / 2;
    c.strokeStyle = '#f3f1ec'; c.lineCap = 'round'; c.lineWidth = Math.max(2, r * 0.08);
    c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 0.28, cy + Math.sin(a) * r * 0.28); c.lineTo(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8); c.stroke();
  }
  function drawKey(c, k, label, pressed, led, ledColor, ledLeft) {
    const dy = pressed ? 1.6 : 0;
    if (!pressed) { rr(c, k.x, k.y + 2, k.w, k.h, 6); c.fillStyle = C.keyLo; c.fill(); }
    rr(c, k.x, k.y + dy, k.w, k.h, 6);
    const g = c.createLinearGradient(0, k.y + dy, 0, k.y + dy + k.h); g.addColorStop(0, pressed ? '#ddd8cd' : '#f7f4ee'); g.addColorStop(1, pressed ? '#d2ccbf' : '#e4dfd5');
    c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(80,70,58,.35)'; c.lineWidth = 0.8; c.stroke();
    const lx = k.x + (label ? 10 : ledLeft ? 13 : k.w / 2), ly = k.y + dy + (label ? 10 : k.h / 2);
    c.fillStyle = led ? ledColor : C.ledOff;
    if (led) { c.save(); c.shadowColor = ledColor; c.shadowBlur = 7 * L.u * dpr; }
    c.beginPath(); c.arc(lx, ly, label ? 2.6 : 2.8, 0, TAU); c.fill();
    if (led) c.restore();
    if (label) text(c, label, k.x + k.w / 2 + 4, k.y + dy + k.h / 2 + 4, { size: label.length > 8 ? 10 : 11.2, weight: 700, color: C.silk, align: 'center', track: 0.6 });
  }

  function current() {
    if (state.mode === 'auto') {
      if (reduce && FREEZE === null) return { kind: 'sag', seed: 1, local: 99 };
      const i = Math.floor(clock / SEG);
      return { kind: AUTO[i % AUTO.length], seed: i + 1, local: clock - i * SEG };
    }
    return { kind: state.kind, seed: state.seed, local: reduce ? 99 : clock - state.t0 };
  }
  function ensure(kind, seed, N) {
    const key = kind + '|' + seed + '|' + N;
    if (key !== sigKey) { sig = PQ.generate(kind, N, seed); steps = PQ.read(sig); sigKey = key; }
  }
  // how strongly a cycle supports a class: used to shade "where it found it"
  function windowEvidence(st, cls) {
    const e = st.ev;
    switch (cls) {
      case 'sag': return e.eSag; case 'swell': return e.eSwell; case 'interruption': return e.eInt;
      case 'harmonics': return e.eHarm; case 'transient': case 'notch': return e.eSpike;
      case 'flicker': { const m = steps.reduce((s, x) => s + x.f.A1, 0) / steps.length; return Math.min(1, Math.abs(st.f.A1 - m) / 0.08); }
      default: return 0;
    }
  }

  function draw() {
    const c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(body, 0, 0); c.drawImage(screenBase, 0, 0);
    c.setTransform(L.u * dpr, 0, 0, L.u * dpr, 0, 0);
    const cur = current();
    // the demo turns TIME/DIV itself for flicker, which only shows across many cycles
    if (state.mode === 'auto' && !qs.has('td')) state.td = cur.kind === 'flicker' ? 2 : 1;
    const td = TIMEDIV[state.td], N = td.N, vdiv = VOLTDIV[state.vd];
    ensure(cur.kind, cur.seed, N);
    const local = cur.local, STEP = WALK / N;
    const armed = local < ARM, reading = !armed && local < ARM + WALK, settled = local >= ARM + WALK;
    const ri = armed ? -1 : Math.min(N - 1, Math.floor((local - ARM) / STEP));
    const frac = armed ? 0 : settled ? 1 : ease(((local - ARM) / STEP) - ri);
    const S = L.s, G = L.g;
    const frameN = Math.floor((reduce || !state.running ? 0 : clock) * 30);

    c.save(); rr(c, S.x, S.y, S.w, S.h, 5); c.clip();
    // status band
    const sy = S.y + (L.wide ? 18 : 16.5), fs = L.wide ? 12 : 10.8;
    rr(c, S.x + 8, sy - fs + 1.5, L.wide ? 32 : 28, fs + 3, 2); c.fillStyle = C.yellow; c.fill();
    text(c, 'CH1', S.x + 8 + (L.wide ? 16 : 14), sy, { font: MONO, size: fs - 1, weight: 700, color: '#1a1a1a', align: 'center' });
    let x0 = S.x + (L.wide ? 48 : 42);
    text(c, `${vdiv}V/div`, x0, sy, { font: MONO, size: fs, weight: 500, color: C.txt }); x0 += L.wide ? 88 : 78;
    text(c, `M ${td.ms.toFixed(1)}ms`, x0, sy, { font: MONO, size: fs, weight: 500, color: C.txt }); x0 += L.wide ? 92 : 80;
    if (L.wide) text(c, '50.00Hz', x0, sy, { font: MONO, size: fs, weight: 500, color: C.dim });
    const trig = !state.running ? ['STOP', C.red] : armed ? ['WAIT', C.orange] : ["TRIG'D", C.green];
    const tx = S.x + S.w - 10;
    text(c, trig[0], tx, sy, { font: MONO, size: fs, weight: 700, color: trig[1], align: 'right' });
    text(c, `${state.level >= 0 ? '↑' : '↓'}${Math.abs(state.level)}V`, tx - (L.wide ? 58 : 52), sy, { font: MONO, size: fs, weight: 500, color: C.dim, align: 'right' });

    // where the network found it (after reading)
    const topNow = ri >= 0 ? PQ.top(steps[ri].p) : 'normal';
    const ww = G.w / N;
    if (settled && topNow !== 'normal') {
      for (let i = 0; i < N; i++) { const e = windowEvidence(steps[i], topNow, i); if (e > 0.05) { c.fillStyle = `rgba(85,228,255,${0.13 * e})`; c.fillRect(G.x + i * ww, G.y, ww, G.h); } }
    }
    // the cursor walking cycle by cycle
    if (reading && ri >= 0) {
      const cx = G.x + ri * ww;
      c.fillStyle = 'rgba(85,228,255,.13)'; c.fillRect(cx, G.y, ww, G.h);
      c.strokeStyle = 'rgba(85,228,255,.85)'; c.lineWidth = 1; c.strokeRect(cx + 0.5, G.y + 0.5, ww - 1, G.h - 1);
    }
    // the trace
    const n = N * PQ.SPC, rng = PQ.rng(1000 + frameN), jit = (rng() - 0.5) * 0.6;
    const vy = v => G.y + G.h / 2 - (v * PQ.VPEAK / vdiv) * (G.h / 8);
    const sweep = armed ? ease(local / ARM) : 1;
    const kmax = Math.max(2, Math.floor(n * sweep));
    c.save(); c.beginPath(); c.rect(G.x, G.y - 1, G.w, G.h + 2); c.clip();
    c.beginPath();
    for (let k = 0; k < kmax; k++) {
      const x = G.x + ((k + jit) / (n - 1)) * G.w, v = sig.x[k] + PQ.gauss(rng) * 0.007;
      if (k === 0) c.moveTo(x, vy(v)); else c.lineTo(x, vy(v));
    }
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,216,74,.22)'; c.lineWidth = 4.2; c.stroke();
    c.strokeStyle = C.yellow; c.lineWidth = L.wide ? 1.55 : 1.35; c.stroke();
    if (armed) { const k = kmax - 1, x = G.x + (k / (n - 1)) * G.w; c.fillStyle = '#fff6c9'; c.beginPath(); c.arc(x, vy(sig.x[k]), 2.2, 0, TAU); c.fill(); }
    c.restore();
    // trigger markers: position (top) and level (right edge)
    c.fillStyle = C.orange;
    c.beginPath(); c.moveTo(G.x - 0.5, G.y - 6); c.lineTo(G.x + 5, G.y - 6); c.lineTo(G.x + 2.25, G.y - 1.5); c.closePath(); c.fill();
    const ly = vy(state.level / PQ.VPEAK);
    c.beginPath(); c.moveTo(G.x + G.w + 1, ly); c.lineTo(G.x + G.w + 7, ly - 3.5); c.lineTo(G.x + G.w + 7, ly + 3.5); c.closePath(); c.fill();
    // cycle label while reading
    if (reading && ri >= 0) text(c, `cycle ${ri + 1}/${N}`, G.x + ri * ww + ww / 2, G.y + 11, { font: MONO, size: L.wide ? 10.5 : 9.6, weight: 600, color: C.cyan, align: 'center' });

    // the network's cells, one per cycle
    const B = L.band, cs = Math.max(8, Math.min(ww - (N > 10 ? 3 : 7), B.h - 12)), cyTop = B.y + (B.h - cs) / 2 + 3;
    for (let i = 0; i < N; i++) {
      const cx = G.x + ww * (i + 0.5), x = cx - cs / 2, done = ri >= 0 && i < ri || settled, now = reading && i === ri, alpha = done || now ? 1 : 0.32;
      if (done || now) { c.strokeStyle = 'rgba(85,228,255,.35)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(cx, G.y + G.h + 1); c.lineTo(cx, cyTop - 1); c.stroke(); }
      rr(c, x, cyTop, cs, cs, Math.min(3, cs / 4));
      c.fillStyle = now ? 'rgba(85,228,255,.18)' : 'rgba(10,20,60,.55)'; c.fill();
      c.globalAlpha = alpha; c.strokeStyle = now ? C.cyan : 'rgba(85,228,255,.7)'; c.lineWidth = now ? 1.4 : 0.9; c.stroke(); c.globalAlpha = 1;
      if (done || now) {
        const h = PQ.hidden(steps[i]), pad = cs * 0.18, step = (cs - pad * 2) / 3, dr = Math.max(0.6, cs / 13);
        for (let d = 0; d < 16; d++) {
          const b = h[d] * (now ? frac : 1);
          c.fillStyle = `rgba(${Math.round(lerp(60, 120, b))},${Math.round(lerp(110, 240, b))},${Math.round(lerp(170, 255, b))},${0.25 + 0.75 * b})`;
          c.beginPath(); c.arc(x + pad + (d % 4) * step, cyTop + pad + Math.floor(d / 4) * step, dr, 0, TAU); c.fill();
        }
      }
      if (i < N - 1 && ww - cs > 5) {
        const ax = x + cs + 1, bx = x + ww - 1.5, ay = cyTop + cs / 2;
        c.strokeStyle = done ? 'rgba(85,228,255,.75)' : 'rgba(85,228,255,.25)'; c.lineWidth = 0.9;
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, ay); c.moveTo(bx - 2.2, ay - 1.8); c.lineTo(bx, ay); c.lineTo(bx - 2.2, ay + 1.8); c.stroke();
      }
    }
    if (L.wide || N <= 10) text(c, 'LSTM', B.x, B.y + 3, { font: MONO, size: 8.4, weight: 700, color: 'rgba(85,228,255,.7)', track: 1 });

    // confidence: interpolate between reading steps
    let p = null;
    if (ri >= 0) {
      const a = ri > 0 ? steps[ri - 1].p : null, b = steps[ri].p;
      p = {}; for (const id of PQ.KIND_IDS) p[id] = a ? lerp(a[id], b[id], frac) : b[id] * frac;
    }
    const winner = settled ? PQ.top(steps[N - 1].p) : null;
    const rows = L.wide ? L.rows : PQ.KINDS.map((k, i) => ({ x: L.bars.x + (i % 2) * 162, y: L.bars.y + Math.floor(i / 2) * (L.bars.h / 4), w: 154, h: L.bars.h / 4 }));
    PQ.KINDS.forEach((k, i) => {
      const r = rows[i], v = p ? p[k.id] : 0, isWin = winner === k.id, isInj = cur.kind === k.id;
      if (isWin) { rr(c, r.x - 2, r.y + 2, r.w + 4, r.h - 4, 3); c.fillStyle = 'rgba(85,228,255,.13)'; c.fill(); c.strokeStyle = 'rgba(85,228,255,.8)'; c.lineWidth = 0.9; c.stroke(); }
      if (L.wide) {
        const ty = r.y + r.h * 0.44;
        if (isInj) text(c, '▶', r.x + 2, ty, { font: MONO, size: 9.6, weight: 700, color: C.yellow });
        text(c, k.key, r.x + 13, ty, { font: MONO, size: 11.6, weight: 600, color: isInj ? C.yellow : isWin ? '#fff' : C.txt });
        text(c, p ? `${Math.round(v * 100)}%` : '--', r.x + r.w - 4, ty, { font: MONO, size: 11, weight: 500, color: isWin ? C.cyan : C.dim, align: 'right' });
        const bx = r.x + 13, bw = r.w - 18, by = r.y + r.h * 0.62;
        c.fillStyle = 'rgba(80,118,204,.35)'; c.fillRect(bx, by, bw, 4.5);
        c.fillStyle = isWin ? C.cyan : 'rgba(85,228,255,.75)'; c.fillRect(bx, by, bw * v, 4.5);
      } else {
        const ty = r.y + r.h * 0.66;
        if (isInj) text(c, '▶', r.x, ty, { font: MONO, size: 9, weight: 700, color: C.yellow });
        text(c, k.key, r.x + 11, ty, { font: MONO, size: 10, weight: 600, color: isInj ? C.yellow : isWin ? '#fff' : C.txt });
        const bx = r.x + 90, bw = 38, by = r.y + r.h * 0.38;
        c.fillStyle = 'rgba(80,118,204,.35)'; c.fillRect(bx, by, bw, 5);
        c.fillStyle = isWin ? C.cyan : 'rgba(85,228,255,.75)'; c.fillRect(bx, by, bw * v, 5);
        text(c, p ? `${Math.round(v * 100)}` : '--', r.x + r.w, ty, { font: MONO, size: 9.6, weight: 500, color: isWin ? C.cyan : C.dim, align: 'right' });
      }
    });

    // the message line
    const M = L.msg, my = M.y + M.h * 0.7, mf = L.wide ? 13.4 : 11.2;
    if (!state.running) text(c, 'STOP · press RUN/STOP to go on', M.x, my, { font: MONO, size: mf, weight: 600, color: C.red });
    else if (armed) text(c, 'WAIT · trigger armed, acquiring…', M.x, my, { font: MONO, size: mf, weight: 600, color: C.orange });
    else if (reading) {
      const t = PQ.top(p);
      text(c, `reading cycle ${ri + 1} of ${N} · best guess ${KIND[t].key} ${Math.round(p[t] * 100)}%`, M.x, my, { font: MONO, size: mf, weight: 500, color: C.cyan });
    } else {
      const pv = steps[N - 1].p[winner];
      text(c, `reads: ${KIND[winner].key}  ${Math.round(pv * 100)}%`, M.x, my, { font: MONO, size: mf + 1.5, weight: 700, color: C.cyan });
      text(c, 'illustrative', M.x + M.w, my, { font: MONO, size: mf - 1.5, weight: 500, color: C.dim, align: 'right' });
    }
    // glass: a soft reflection across the top-left
    const gl = c.createLinearGradient(S.x, S.y, S.x + S.w * 0.6, S.y + S.h * 0.7);
    gl.addColorStop(0, 'rgba(255,255,255,.07)'); gl.addColorStop(0.35, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(S.x, S.y, S.w, S.h);
    c.restore();

    // keys, knobs and buttons
    const pressing = state.pressed && clock - state.pressT < 0.14;
    PQ.KINDS.forEach((k, i) => drawKey(c, L.keys[i], L.wide ? null : k.key, pressing && state.pressed === k.id, cur.kind === k.id, C.amber));
    for (const id in L.knobs) drawKnob(c, L.knobs[id], state.ang[id]);
    for (const id in L.btns) {
      const b = L.btns[id];
      const pr = state.pressed === id && clock - state.pressT < 0.14;
      drawKey(c, b, null, pr, id === 'run', state.running ? C.green : C.red, true);
      text(c, b.label, b.x + b.w / 2 + 7, b.y + (pr ? 1.6 : 0) + b.h / 2 + 4, { size: 10, weight: 700, color: C.silk, align: 'center', track: 0.8 });
    }
    // announce the reading once per acquisition (manual only)
    if (settled && state.mode === 'manual') {
      const id = `${cur.kind}|${cur.seed}|${N}`;
      if (state.announced !== id) { state.announced = id; live.textContent = `The network reads ${KIND[winner].label}, ${Math.round(steps[N - 1].p[winner] * 100)} percent. Illustrative.`; }
    }
  }

  /* ---------------- controls laid over the drawing ---------------- */
  const els = {};
  function makeButton(id, label, extra = {}) {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', label);
    Object.entries(extra).forEach(([k, v]) => b.setAttribute(k, v)); controls.appendChild(b); els[id] = b; return b;
  }
  PQ.KINDS.forEach(k => on(makeButton('key-' + k.id, `Inject ${k.label.toLowerCase()}: ${k.what}`), 'click', () => inject(k.id)));
  on(makeButton('run', 'Run or stop'), 'click', () => { touch(); press('run'); state.running = !state.running; kick(); });
  on(makeButton('single', 'Single: acquire a new example of the same event'), 'click', () => { touch(); press('single'); state.mode = 'manual'; state.kind = current().kind; state.seed = state.seed * 7 % 997 + 2; state.t0 = clock; state.running = true; kick(); });
  const knobDefs = {
    td: { label: 'Time per division', get: () => state.td, set: v => { state.td = v; rearm(); }, text: v => `${TIMEDIV[v].ms} milliseconds per division, ${TIMEDIV[v].N} cycles` },
    vd: { label: 'Volts per division', get: () => state.vd, set: v => { state.vd = v; }, text: v => `${VOLTDIV[v]} volts per division` },
    lv: { label: 'Trigger level', get: () => state.level, set: v => { state.level = v; }, text: v => `${v} volts`, min: -150, max: 150, step: 10 },
  };
  for (const id in knobDefs) {
    const d = knobDefs[id], b = makeButton('knob-' + id, d.label, { role: 'slider', 'aria-valuemin': d.min ?? 0, 'aria-valuemax': d.max ?? 2 });
    const step = dir => {
      touch();
      if (id === 'lv') d.set(Math.max(d.min, Math.min(d.max, d.get() + dir * d.step)));
      else { let v = d.get() + dir; if (v > 2) v = dir > 0 && b.dataset.wrap ? 0 : 2; if (v < 0) v = 0; d.set(v); }
      sync(); kick();
    };
    let start = null, acc = 0, moved = false;
    on(b, 'pointerdown', e => { start = { x: e.clientX, y: e.clientY }; acc = 0; moved = false; b.setPointerCapture(e.pointerId); });
    on(b, 'pointermove', e => {
      if (!start) return;
      const d0 = (e.clientX - start.x) - (e.clientY - start.y); start = { x: e.clientX, y: e.clientY }; acc += d0;
      const th = id === 'lv' ? 10 : 26;
      while (Math.abs(acc) > th) { moved = true; step(Math.sign(acc)); acc -= Math.sign(acc) * th; }
    });
    on(b, 'pointerup', () => { start = null; });
    on(b, 'click', () => { if (moved) return; if (id === 'lv') step(1); else { const v = d.get(); d.set(v >= 2 ? 0 : v + 1); touch(); sync(); kick(); } });
    on(b, 'keydown', e => {
      const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
      if (map[e.key]) { e.preventDefault(); step(map[e.key]); }
    });
  }
  function sync() {
    for (const id in knobDefs) {
      const el = els['knob-' + id]; if (!el) continue; const v = knobDefs[id].get();
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuetext', knobDefs[id].text(v));
    }
    PQ.KINDS.forEach(k => els['key-' + k.id].setAttribute('aria-pressed', String(state.mode === 'manual' && state.kind === k.id)));
    els.run.setAttribute('aria-pressed', String(!state.running));
  }
  function place() {
    const u = L.u, put = (el, x, y, w, h, round) => { Object.assign(el.style, { left: x * u + 'px', top: y * u + 'px', width: w * u + 'px', height: h * u + 'px', borderRadius: round ? '50%' : '8px', display: '' }); };
    PQ.KINDS.forEach((k, i) => { const r = L.keys[i]; put(els['key-' + k.id], r.x - 2, r.y - 2, r.w + 4, r.h + 6); });
    for (const id of ['run', 'single']) { const r = L.btns[id]; put(els[id], r.x - 2, r.y - 2, r.w + 4, r.h + 6); }
    for (const id in knobDefs) { const el = els['knob-' + id], k = L.knobs[id]; if (!k) { el.style.display = 'none'; continue; } put(el, k.cx - k.r - 6, k.cy - k.r - 6, k.r * 2 + 12, k.r * 2 + 12, true); }
  }
  function touch() { if (state.mode === 'auto') { const cur = current(); state.mode = 'manual'; state.kind = cur.kind; state.seed = cur.seed; state.t0 = clock - Math.min(cur.local, ARM + WALK); } }
  function press(id) { state.pressed = id; state.pressT = clock; }
  function inject(kind) { touch(); press(kind); state.mode = 'manual'; state.kind = kind; state.seed = state.seed * 7 % 997 + 2; state.t0 = clock; state.running = true; sync(); kick(); }
  function rearm() { if (state.mode === 'manual') state.t0 = clock; }

  /* ---------------- loop ---------------- */
  let raf = 0, last = 0, lastDraw = 0, onscreen = true;
  const animating = () => FREEZE === null && onscreen && !document.hidden && (state.running && !reduce || knobsMoving() || state.pressed && clock - state.pressT < 0.2);
  function knobsMoving() {
    const tgt = { td: tdAngle(state.td), vd: tdAngle(state.vd), lv: lvAngle(state.level) };
    return Object.keys(tgt).some(k => Math.abs(state.ang[k] - tgt[k]) > 0.002);
  }
  function stepKnobs(dt) {
    const tgt = { td: tdAngle(state.td), vd: tdAngle(state.vd), lv: lvAngle(state.level) };
    for (const k in tgt) state.ang[k] = reduce || dt === null ? tgt[k] : lerp(state.ang[k], tgt[k], 1 - Math.exp(-dt * 18));
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    if (state.running && !reduce) clock += dt; else if (reduce) clock += dt; // keeps button press timing in reduced motion
    stepKnobs(dt);
    if (now - lastDraw > 31) { const td0 = state.td; draw(); lastDraw = now; if (state.td !== td0) sync(); }
    if (animating()) raf = requestAnimationFrame(frame); else { last = 0; draw(); }
  }
  function kick() { if (disposed) return; if (FREEZE !== null) { stepKnobs(null); draw(); return; } if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }

  function relayout() {
    L = layout(); dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(L.W * dpr); canvas.height = Math.round(L.H * dpr);
    canvas.style.height = L.H + 'px';
    body = buildBody(); screenBase = buildScreenBase(); place(); draw();
  }

  const ro = new ResizeObserver(() => { const w = stage.clientWidth; if (L && Math.abs(w - L.W) < 1) return; relayout(); });
  const io = new IntersectionObserver(es => { onscreen = es[0].isIntersecting; if (onscreen) kick(); });
  if (FREEZE !== null) {
    if (state.mode === 'manual') { clock = 100; state.t0 = 100 - FREEZE; } else clock = FREEZE;
    if (qs.has('lv')) state.level = parseInt(qs.get('lv'), 10) || 0;
  }
  stepKnobs(null); relayout(); sync();
  ro.observe(stage);
  io.observe(stage);
  on(document, 'visibilitychange', () => { if (!document.hidden) kick(); });
  on(motionQuery, 'change', e => { reduce = e.matches; kick(); });
  if (FREEZE === null) kick(); else window.__ready = true;
  return () => {
    disposed = true; ac.abort(); ro.disconnect(); io.disconnect();
    if (raf) cancelAnimationFrame(raf); raf = 0;
    controls.replaceChildren();
  };
}
