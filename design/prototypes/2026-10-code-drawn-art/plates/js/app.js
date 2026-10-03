/* Plates — page logic: the year grid, the live current plate, and "Play the year". */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const FIXED_T = qs.has('t') ? parseFloat(qs.get('t')) || 0 : null;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  const MONTHS = [];
  const NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (let i = 0; i < 12; i++) {
    const m = (11 + i) % 12, y = 2025 + Math.floor((11 + i) / 12);
    MONTHS.push({ id: `${y}-${String(m + 1).padStart(2, '0')}`, name: `${NAMES[m]} ${y}`, future: y === 2026 && m >= 10 });
  }
  const DEFS = window.PLATE_DEFS || {};

  /* ---------- grid ---------- */
  const grid = document.getElementById('grid');
  MONTHS.forEach((mo) => {
    const def = DEFS[mo.id];
    const li = document.createElement('li');
    if (!def) li.className = 'empty';
    const words = def ? def.words : (mo.future ? 'Not yet' : 'Nothing drawn this month');
    const proc = def ? `${def.process}${mo.id < '2026-10' ? ' · drawn later' : ''}` : '';
    const alt = def ? `${mo.name}, ${def.process}: ${def.alt}` : `${mo.name}: a blank plate`;
    li.innerHTML = `<div class="plate" data-plate="${mo.id}"><canvas role="img" aria-label="${alt.replace(/"/g, '&quot;')}"></canvas></div>
      <div class="cap"><span class="m">${mo.name}</span><span class="w">${words}</span>${proc ? `<span class="p">${proc}</span>` : ''}</div>`;
    grid.appendChild(li);
  });

  /* ---------- instances ---------- */
  const instances = [];
  document.querySelectorAll('.plate[data-plate]').forEach((box) => {
    const id = box.dataset.plate;
    const mo = MONTHS.find((m) => m.id === id);
    const def = DEFS[id] || window.PLATE_BLANK(mo, mo.future);
    const cv = box.querySelector('canvas');
    instances.push({ box, cv, ctx: cv.getContext('2d'), def, id, w: 0, h: 0, st: null, visible: true, last: -1, hero: !!box.dataset.hero });
  });

  let queue = [], building = false, readyResolve;
  const allBuilt = new Promise((r) => { readyResolve = r; });

  function measure(inst) {
    const r = inst.box.getBoundingClientRect();
    const w = Math.round(r.width * DPR), h = Math.round(r.height * DPR);
    if (w < 2 || h < 2) return false;
    if (w === inst.w && h === inst.h && inst.st) return false;
    inst.w = w; inst.h = h; inst.cv.width = w; inst.cv.height = h; inst.st = null;
    return true;
  }
  function schedule() {
    queue = instances.filter((i) => !i.st).sort((a, b) => (b.hero - a.hero) || (b.visible - a.visible));
    if (!building) pump();
  }
  function pump() {
    const inst = queue.shift();
    if (!inst) { building = false; readyResolve(); return; }
    building = true;
    if (!inst.st && inst.w > 1) {
      try {
        inst.st = inst.def.build(inst.w, inst.h, { scale: inst.w / 600 });
        drawInst(inst, now(), true);
      } catch (e) { console.error(inst.id, e); }
    }
    setTimeout(pump, 0);
  }
  function now() { return FIXED_T !== null ? FIXED_T : (REDUCED ? stillT : performance.now() / 1000); }
  const stillT = 0;

  function drawInst(inst, t, force) {
    if (!inst.st) return;
    const fps = inst.def.fps || 24;
    if (!force && inst.last >= 0 && t - inst.last < 1 / fps) return;
    inst.last = t;
    const tt = REDUCED && FIXED_T === null ? (inst.def.still || 0) : t;
    inst.def.draw(inst.ctx, inst.st, tt);
  }

  instances.forEach(measure);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { const inst = instances.find((i) => i.box === e.target); if (inst) inst.visible = e.isIntersecting; });
  }, { rootMargin: '120px' });
  instances.forEach((i) => io.observe(i.box));
  // plates letter in their own faces, so wait for the fonts before painting anything
  const fontsReady = Promise.all(['600 20px "Cormorant SC"', '800 20px "Big Shoulders Stencil Display"', '20px "Archivo Black"', '20px "DM Sans"'].map((f) => document.fonts.load(f).catch(() => null)))
    .then(() => document.fonts.ready);
  fontsReady.then(schedule);

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { let any = false; instances.forEach((i) => { if (measure(i)) any = true; }); if (any) schedule(); if (!reel.hidden) sizeReel(true); }, 160);
  });

  let paused = document.hidden;
  document.addEventListener('visibilitychange', () => { paused = document.hidden; if (!paused) requestAnimationFrame(loop); });

  function loop() {
    if (paused || FIXED_T !== null || REDUCED) return;
    const t = now();
    if (!reel.hidden) drawReel(t - reelStart);
    else instances.forEach((i) => { if (i.visible) drawInst(i, t); });
    requestAnimationFrame(loop);
  }

  allBuilt.then(() => {
    if (qs.get('play') === '1' || SOLO) openReel(); else { window.__ready = true; }
    // review hook: draw every plate on the page at a given time
    window.__pageAt = (t) => instances.forEach((i) => { i.last = -1; drawInst(i, t, true); });
    if (FIXED_T === null && !REDUCED) requestAnimationFrame(loop);
  });

  /* ---------- Play the year ---------- */
  const reel = document.getElementById('reel');
  const rcv = document.getElementById('reel-canvas');
  const rctx = rcv.getContext('2d');
  const playBtn = document.getElementById('play');
  const SOLO = qs.get('solo');
  const BEAT = SOLO ? 1e9 : 1.8;
  const order = MONTHS.filter((m) => DEFS[m.id] && (!SOLO || m.id === SOLO)).map((m) => ({ mo: m, def: DEFS[m.id], st: null }));
  let reelStart = 0, reelW = 0, reelH = 0;

  function sizeReel(rebuild) {
    let w = Math.round(innerWidth * DPR), h = Math.round(innerHeight * DPR);
    const cap = 3.4e6;
    if (w * h > cap) { const k = Math.sqrt(cap / (w * h)); w = Math.round(w * k); h = Math.round(h * k); }
    if (w !== reelW || h !== reelH || rebuild) {
      reelW = w; reelH = h; rcv.width = w; rcv.height = h;
      order.forEach((o) => { o.st = null; });
    }
  }
  function buildReel(done) {
    let i = 0;
    rctx.fillStyle = '#000'; rctx.fillRect(0, 0, reelW, reelH);
    rctx.fillStyle = 'rgba(255,255,255,0.7)'; rctx.font = `${14 * DPR}px "DM Sans", sans-serif`;
    rctx.fillText('Preparing the year…', 24 * DPR, reelH - 28 * DPR);
    (function next() {
      if (i >= order.length) { done(); return; }
      const o = order[i++];
      if (!o.st) { try { o.st = o.def.build(reelW, reelH, { scale: Math.min(reelW, reelH * 0.8) / 600, reel: true }); } catch (e) { console.error(e); } }
      setTimeout(next, 0);
    })();
  }
  function drawReel(t) {
    const idx = Math.floor(t / BEAT);
    if (idx >= order.length) { if (FIXED_T === null) closeReel(); return; }
    const o = order[idx];
    if (!o.st) return;
    const local = t - idx * BEAT;
    o.def.draw(rctx, o.st, (o.def.reelOffset || 0) + local);
    if (o.def.label) o.def.label(rctx, o.st, o.mo.name);
  }
  function openReel() {
    reel.hidden = false;
    document.body.style.overflow = 'hidden';
    sizeReel(false);
    buildReel(() => {
      reelStart = FIXED_T !== null ? 0 : performance.now() / 1000;
      if (FIXED_T !== null) { drawReel(FIXED_T); window.__reelAt = (t) => drawReel(t); window.__ready = true; return; }
      if (REDUCED) { reel.dataset.i = 0; drawReel(0.9); return; }
      requestAnimationFrame(loop);
    });
    document.getElementById('reel-close').focus();
  }
  function closeReel() {
    reel.hidden = true;
    document.body.style.overflow = '';
    playBtn.focus();
    instances.forEach((i) => { i.last = -1; });
  }
  playBtn.addEventListener('click', openReel);
  document.getElementById('reel-close').addEventListener('click', closeReel);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !reel.hidden) closeReel(); });
  if (REDUCED) {
    // With reduced motion the montage shows the stills one at a time on click instead of playing.
    reel.addEventListener('click', (e) => {
      if (e.target.id === 'reel-close') return;
      const cur = (reel.dataset.i | 0) + 1;
      if (cur >= order.length) { closeReel(); reel.dataset.i = 0; return; }
      reel.dataset.i = cur;
      drawReel(cur * BEAT + 0.9);
    });
  }
})();
