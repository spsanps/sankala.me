/* player.js — the screening page: build the panels, then play, scrub, replay.
   ?t=<s> frame mode (the picture alone, frozen) · ?at=<s> page mode, paused.  */
'use strict';
(async function () {
  const qs = new URLSearchParams(location.search);
  const T = qs.has('t') ? parseFloat(qs.get('t')) : null;
  const AT = qs.has('at') ? parseFloat(qs.get('at')) : null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (T !== null) document.documentElement.classList.add('frame');

  const canvas = document.getElementById('film'), ctx = canvas.getContext('2d');
  const status = document.getElementById('status');
  const playBtn = document.getElementById('play'), replayBtn = document.getElementById('replay');
  const scrub = document.getElementById('scrub'), timeEl = document.getElementById('time');

  const cssW = () => canvas.getBoundingClientRect().width || 1280;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const FW = T !== null ? Math.round(cssW() * dpr) : Math.round(clamp(cssW() * dpr, 640, 1920));
  canvas.width = FW; canvas.height = Math.round(FW * 9 / 16);
  const s = FW / 1280;

  try { await Promise.all([document.fonts.load('500 30px "EB Garamond"'), document.fonts.load('900 60px "Fraunces"'), document.fonts.load('600 20px "Fraunces"')]); } catch (e) { /* fall back to Georgia */ }

  const runGen = gen => new Promise(res => {
    const step = () => {
      const t0 = performance.now();
      while (performance.now() - t0 < 28) { const r = gen.next(); if (r.done) { res(r.value); return; } }
      setTimeout(step, 0);
    };
    step();
  });
  const A = await runGen(buildFilm(s, p => { status.textContent = `Laying the gold… ${Math.round(p * 100)}%`; }));
  status.hidden = true;

  const draw = t => renderFrame(ctx, A, t, { cssW: cssW() });
  window.__renderAt = t => { draw(t); return true; };

  if (T !== null) { draw(T); window.__ready = true; return; }

  // ── playback ──────────────────────────────────────────────────────────────
  let t = AT !== null ? clamp(AT, 0, FILM.D) : 0, playing = false, t0 = 0, p0 = 0, wasPlaying = false;
  const fmt = x => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  const sync = () => { scrub.value = t.toFixed(2); timeEl.textContent = `${fmt(t)} / ${fmt(FILM.D)}`; playBtn.textContent = playing ? 'Pause' : (t >= FILM.D - 0.05 ? 'Play again' : 'Play'); };
  const play = () => { if (t >= FILM.D - 0.05) t = 0; playing = true; t0 = t; p0 = performance.now(); sync(); requestAnimationFrame(tick); };
  const pause = () => { playing = false; sync(); };
  function tick(now) {
    if (!playing) return;
    t = t0 + (now - p0) / 1000;
    if (t >= FILM.D) { t = FILM.D; playing = false; }
    draw(t); sync();
    if (playing) requestAnimationFrame(tick);
  }
  playBtn.addEventListener('click', () => (playing ? pause() : play()));
  replayBtn.addEventListener('click', () => { t = 0; play(); });
  scrub.addEventListener('input', () => { t = parseFloat(scrub.value); if (playing) { t0 = t; p0 = performance.now(); } else { draw(t); sync(); } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { wasPlaying = playing; if (playing) pause(); }
    else if (wasPlaying) { wasPlaying = false; play(); }
  });
  for (const b of [playBtn, replayBtn, scrub]) b.disabled = false;

  // reduced motion: no autoplay; one still per shot, captioned, instead
  if (reduce) {
    const board = document.getElementById('board'); board.hidden = false;
    for (const sh of SHOTS) {
      draw(sh.key);
      const fig = document.createElement('figure'), c = document.createElement('canvas');
      c.width = 640; c.height = 360; c.getContext('2d').drawImage(canvas, 0, 0, 640, 360);
      const words = CUES.filter(q => q.a < sh.b - 0.3 && q.b > sh.a + 0.3).map(q => q.text).join(' ');
      const cap = document.createElement('figcaption');
      cap.innerHTML = `<strong>${sh.id}. ${sh.name}</strong>${words ? ` · “${words}”` : ''}`;
      fig.append(c, cap); board.append(fig);
    }
    t = AT !== null ? t : SHOTS[0].key;
  }
  draw(t); sync();
  if (AT !== null || reduce) { window.__ready = true; return; }
  window.__ready = true;
  play();
})();
