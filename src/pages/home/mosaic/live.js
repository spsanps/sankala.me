/* The apse's live layer, from the page's side. Started once the first paint is up and the browser
   is idle (MosaicApse.jsx), in the mode mode.js chose.

   live    It reads the apse's box back from the page (CSS placed the stills), then either hands two
           canvases to a worker (worker.js) or, where that isn't possible, runs the same stage on the
           main thread in idle slices. From then on the page only reports the scroll position, the
           pointer, a tilted phone and visibility; the worker lays and paints.
   simple  Nothing is laid: the conch's still is switched as the words reach each place (also for
           readers who prefer reduced motion, and on phones).

   The live layer is watched. If its first place isn't laid within 3 s, if frames get slow (a median
   over 50 ms for 2 s) or a main-thread task runs over 200 ms while it is laying or the page scrolls,
   or if the worker fails or a canvas loses its context, it is stopped, its canvases are freed, and
   the page stays on its stills (window.__mosaicPerf.fallback says why). */
import { sanJoseMoment, clockLabel, MOMENTS } from './moments.js';
import { FAMILIES, SHEETS, conchBox, PLACE_KEYS } from './layout.js';

const idle = (fn, timeout = 1200) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout }) : setTimeout(fn, 60));
const num = (params, key) => params.has(key) && !Number.isNaN(parseFloat(params.get(key))) ? parseFloat(params.get(key)) : undefined;
const slowNet = () => { const c = navigator.connection; return !!c && (c.saveData || /(^|-)[23]g$/.test(c.effectiveType || '')); };
const READY_MS = 3000, FRAME_MS = 50, LONG_TASK_MS = 200, WATCH_START_MS = 10000, WATCH_SCROLL_MS = 3000;

/** Start the apse on `root` in `mode` ('live' or 'simple'). `onPlace({ index, key, moment })` reports
    the place in view; `onTilt(ask)` offers the tilt button where the browser asks first (null hides it). */
export function startMosaic(root, { mode = 'live', why = null, onPlace, onTilt, onRestart, onMode } = {}) {
  const home = root.closest('.home') || root, html = document.documentElement;
  const cls = getComputedStyle(home).getPropertyValue('--class').trim() || 'mid';
  const family = SHEETS[cls].family, F = FAMILIES[family].F, box = conchBox(F), side = cls === 'side';
  const front = root.querySelector('.apse-front'), conchEl = root.querySelector('.apse-conch');
  const sections = [...root.querySelectorAll('[data-frame]')];
  const params = new URLSearchParams(location.search);
  const hourParam = params.get('hour');
  const hooks = { t: num(params, 't'), pos: num(params, 'pos'), noGlint: params.get('glint') === '0' };
  if (params.has('light')) hooks.light = params.get('light').split(',').map(Number);
  const era = PLACE_KEYS.indexOf(params.get('era'));
  if (era >= 0 && hooks.pos == null && hooks.t != null) hooks.pos = era;
  const perf = window.__mosaicPerf = { start: Math.round(performance.now()), cls, mode: null, why, laid: [] };
  let disposed = false, stillMode = mode !== 'live', geo = null, tops = [], lastPos = -1, lastPlace = -1;
  let worker = null, stage = null, send = () => {}, io = null, ro = null, tick = 0, glintCanvas = null;
  let moment = sanJoseMoment(hourParam);
  const still = html.getAttribute('data-sj');

  /* ───────── where things are ───────── */
  function geometry() {
    const fr = front.getBoundingClientRect(), r = conchEl.getBoundingClientRect(), u = r.width / (box.x1 - box.x0);
    const cx = r.left - fr.left - box.x0 * u, cy = r.top - fr.top - box.y0 * u;
    const glintH = side ? fr.height : Math.ceil(cy + (F + 46) * u);
    const stele = root.querySelector('.stele'), minX = side && stele ? stele.getBoundingClientRect().right - fr.left + 10 : -1e6;
    return { u, cx, cy, dpr: Math.min(2, window.devicePixelRatio || 1), gdpr: Math.min(1.5, window.devicePixelRatio || 1), glintW: fr.width, glintH, minX };
  }
  const measure = () => { tops = sections.map(s => s.getBoundingClientRect().top + window.scrollY); };
  /** which place the words are at: 0–3, fractional while one gives way to the next */
  function scrollPos() {
    if (hooks.pos != null) return hooks.pos;
    const vh = window.innerHeight, zone = vh - geo.glintH, y = window.scrollY;
    const ref = side ? y + vh * .56 : y + geo.glintH + zone * .62, span = side ? vh * .45 : Math.max(150, zone * .75);
    let pos = 0;
    for (let k = 1; k < tops.length; k++) { const a = tops[k] - span, b = tops[k]; if (ref >= b) pos = k; else if (ref > a) { pos = k - 1 + (ref - a) / span; break; } else break; }
    return Math.min(3, Math.max(0, pos));
  }
  function report(pos) {
    const place = Math.min(3, Math.max(0, Math.round(pos)));
    if (place !== lastPlace) { lastPlace = place; onPlace?.({ index: place, key: PLACE_KEYS[place], moment }); if (stillMode) root.dataset.still = place ? PLACE_KEYS[place] : ''; }
  }

  /* ───────── events ───────── */
  let scrollRaf = 0, pointerRaf = 0, pointerAt = null;
  const onScroll = () => {
    watchFor(WATCH_SCROLL_MS);
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; const pos = scrollPos(); if (pos !== lastPos) { lastPos = pos; send({ type: 'pos', pos }); report(pos); } });
  };
  const onPointer = e => {
    if (e.pointerType === 'touch') return;
    pointerAt = [e.clientX, e.clientY];
    if (!pointerRaf) pointerRaf = requestAnimationFrame(() => { pointerRaf = 0; const fr = front.getBoundingClientRect(); send({ type: 'pointer', at: [pointerAt[0] - fr.left, pointerAt[1] - fr.top] }); });
  };
  const onTiltEvent = e => { if (e.gamma != null) send({ type: 'tilt', at: [e.gamma, (e.beta ?? 45) - 45] }); };
  const onVisibility = () => send({ type: 'hidden', on: document.hidden });
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const now = getComputedStyle(home).getPropertyValue('--class').trim();
      if (now && now !== cls) { onRestart?.(); return; }
      geo = geometry(); measure(); send({ type: 'geometry', geometry: geo }); sizeGlint(); onScroll();
    }, 220);
  };
  // San Jose's moment and the clock on the cornice move on with the real time
  function startClock() {
    tick = setInterval(() => {
      const m = sanJoseMoment(hourParam);
      if (m !== moment) { moment = m; if (stillMode) html.setAttribute('data-sj', m); else send({ type: 'moment', moment }); }
      onPlace?.({ index: lastPlace, key: PLACE_KEYS[lastPlace], moment, tick: true });
    }, 30000);
  }
  /** sharper stills where the screen has the pixels for them, decoded before they replace the 1x */
  function sharpen() {
    idle(() => {
      if (disposed || html.classList.contains('apse-hires') || slowNet()) return;
      if (geo.u * (window.devicePixelRatio || 1) < FAMILIES[family].still[0] * 1.15) return;
      // (Safari writes the custom property back with CSS escapes, url(\/images\/…), so unescape it)
      const cs = getComputedStyle(root), urls = ['--wall2', '--conch2'].map(v => /url\(["']?([^"')]+)/.exec(cs.getPropertyValue(v))?.[1]?.replace(/\\(.)/g, '$1')).filter(Boolean);
      Promise.all(urls.map(u => { const img = new Image(); img.src = u; return img.decode(); })).then(() => {
        if (!disposed) html.classList.add('apse-hires');
      }).catch(() => {});
    }, 4000);
  }

  /* ───────── the simple apse: the stills ───────── */
  function startStill() {
    perf.mode = 'still'; html.dataset.mosaic = 'simple'; onMode?.('simple');
    geo = geometry(); measure(); report(scrollPos());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    if (!tick) startClock();
    // the other places' stills, so switching never shows an empty conch
    idle(() => { if (!disposed && !slowNet()) for (const p of ['sd', 'blr', 'nitk']) new Image().src = `/images/home/conch-${family}-${p}-1x.webp`; });
    sharpen();
    window.__ready = true;
  }

  /* ───────── the watchdog ───────── */
  let readyTimer = 0, watchUntil = 0, watchRaf = 0, lastFrame = 0, windowFrom = 0, frames = [], longTasks = null;
  /** watch the main thread's frames (and long tasks) for the next `ms` */
  function watchFor(ms) {
    if (stillMode || disposed || hooks.t != null) return;
    watchUntil = Math.max(watchUntil, performance.now() + ms);
    if (!watchRaf) { lastFrame = 0; frames = []; watchRaf = requestAnimationFrame(watchFrame); }
  }
  function watchFrame(now) {
    watchRaf = 0;
    if (stillMode || disposed) return;
    if (document.hidden || (lastFrame && now - lastFrame > 1000)) { frames = []; lastFrame = 0; }   // hidden or throttled: start over
    if (lastFrame) frames.push([now, now - lastFrame]); else windowFrom = now;
    lastFrame = now;
    while (frames.length && frames[0][0] < now - 2000) frames.shift();
    if (now - windowFrom >= 2000 && frames.length >= 4) {
      const sorted = frames.map(f => f[1]).sort((a, b) => a - b);
      if (sorted[sorted.length >> 1] > FRAME_MS) { fallback('slow-frames'); return; }
    }
    if (now < watchUntil) watchRaf = requestAnimationFrame(watchFrame); else lastFrame = 0;
  }
  function startWatchdog() {
    if (hooks.t != null) return;   // review: a frozen moment is drawn once, on purpose slowly
    readyTimer = setTimeout(() => { if (!perf.firstLaid) fallback('not-ready'); }, READY_MS);
    watchFor(WATCH_START_MS);
    try {
      longTasks = new PerformanceObserver(list => {
        for (const e of list.getEntries()) if (e.duration > LONG_TASK_MS && e.startTime <= watchUntil) { perf.longTask = Math.round(e.duration); fallback('long-task'); return; }
      });
      longTasks.observe({ type: 'longtask' });
    } catch (e) { longTasks = null; /* no long-task timing in this browser */ }
  }
  /** stop the live layer, free its canvases and stay on the stills */
  function fallback(reason) {
    if (disposed || stillMode) return;
    perf.fallback = reason; perf.fallbackAt = Math.round(performance.now());
    stopLive();
    stillMode = true; lastPlace = -1;
    onTilt?.(null);
    startStill();
  }
  function stopLive() {
    clearTimeout(readyTimer); cancelAnimationFrame(watchRaf); watchRaf = 0; longTasks?.disconnect(); longTasks = null;
    cancelAnimationFrame(scrollRaf); cancelAnimationFrame(pointerRaf); scrollRaf = pointerRaf = 0;
    window.removeEventListener('scroll', onScroll); window.removeEventListener('pointermove', onPointer); window.removeEventListener('resize', onResize);
    window.removeEventListener('deviceorientation', onTiltEvent); document.removeEventListener('visibilitychange', onVisibility);
    io?.disconnect(); io = null;
    if (worker) { try { worker.postMessage({ type: 'destroy' }); } catch (e) { /* already gone */ } worker.terminate(); worker = null; }
    try { stage?.handle({ type: 'destroy' }); } catch (e) { /* already failed */ }
    stage = null; send = () => {};
    root.querySelectorAll('.apse-conch-live, .apse-glint').forEach(el => el.remove());
    glintCanvas = null;
  }

  /* ───────── the live layer ───────── */
  function sizeGlint() { if (glintCanvas) glintCanvas.style.height = geo.glintH + 'px'; }
  function onMessage(msg) {
    if (disposed || stillMode) return;
    if (msg.type === 'laid') {
      perf.laid.push({ index: msg.index, ms: msg.ms, at: msg.at });
      if (hooks.t != null) {   // review: draw the frozen moment once both places of a wave are laid
        const p = hooks.pos ?? 0, need = [Math.floor(p), Math.min(3, Math.ceil(p))];
        if (!perf.frozen && need.every(i => perf.laid.some(l => l.index === i))) { perf.frozen = true; send({ type: 'render', t: hooks.t, pos: p, light: hooks.light }); }
      } else if (perf.laid.length === 1) afterFirst();
      if (perf.laid.length < 4) watchFor(WATCH_SCROLL_MS);   // laying: keep an eye on the frames
    } else if (msg.type === 'rendered') window.__ready = true;
    else if (msg.type === 'glint') perf.glint = msg.ok;
    else if (msg.type === 'perf') perf.worker = msg;
    else if (msg.type === 'error') { perf.error = msg.message; fallback(msg.what === 'context-lost' ? 'context-lost' : `error (${msg.what})`); }
  }
  function afterFirst() {
    window.__ready = true;
    perf.firstLaid = Math.round(performance.now());
    clearTimeout(readyTimer);
    // the light, once the browser is idle again: the wall's stones come as a small binary file
    idle(async () => {
      if (disposed || stillMode || params.get('glint') === 'off') return;
      try {
        const res = await fetch(`/images/home/glint-${cls}.bin`, { priority: 'low' });
        const buffer = await res.arrayBuffer();
        if (disposed || stillMode) return;
        send({ type: 'wall', buffer }, [buffer]);
        send({ type: 'glint', on: true });
        perf.glintAt = Math.round(performance.now());
      } catch (e) { /* the apse is whole without its light */ }
    }, 2500);
    sharpen();
  }
  function startLive() {
    perf.mode = 'starting'; html.dataset.mosaic = 'live'; onMode?.('live');
    geo = geometry(); measure();
    const conch = document.createElement('canvas');
    conch.className = 'apse-conch-live'; conch.setAttribute('aria-hidden', 'true');
    conchEl.appendChild(conch);
    glintCanvas = document.createElement('canvas');
    glintCanvas.className = 'apse-glint'; glintCanvas.setAttribute('aria-hidden', 'true');
    conchEl.after(glintCanvas); sizeGlint();
    const pos = scrollPos(); lastPos = pos; report(pos);
    const init = { type: 'init', family, geometry: geo, still, moment, pos, hooks, perf: true };
    const canWork = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && 'transferControlToOffscreen' in conch;
    if (canWork) {
      try {
        worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = e => onMessage(e.data);
        worker.onerror = e => { e.preventDefault?.(); perf.workerError = true; fallback('worker-error'); };
        worker.onmessageerror = () => fallback('worker-error');
        const oc = conch.transferControlToOffscreen(), og = glintCanvas.transferControlToOffscreen();
        send = (m, transfer) => worker?.postMessage(m, transfer || []);
        worker.postMessage({ ...init, conch: oc, glint: og }, [oc, og]);
        perf.mode = 'worker';
      } catch (e) { worker?.terminate(); worker = null; }
    }
    if (!worker) {
      perf.mode = 'main';
      // the same stage on this thread, laying only while the browser is idle
      import('./stage.js').then(({ createStage }) => {
        if (disposed || stillMode) return;
        const pause = () => new Promise(r => idle(() => r(), 200));
        stage = createStage({ conchCanvas: conch, glintCanvas, post: onMessage, pause, budget: 8, raf: cb => requestAnimationFrame(cb) });
        send = m => stage?.handle(m);
        stage.handle(init);
      }).catch(() => fallback('load-error'));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    io = new IntersectionObserver(([e]) => send({ type: 'visible', on: e.isIntersecting }));
    io.observe(root);
    startClock();
    startWatchdog();
    // tilt on phones: at once where allowed, behind a button where the browser asks first (iOS)
    if (window.matchMedia('(pointer: coarse)').matches && 'DeviceOrientationEvent' in window) {
      const enable = () => window.addEventListener('deviceorientation', onTiltEvent);
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') onTilt?.(async () => { try { if (await window.DeviceOrientationEvent.requestPermission() === 'granted') { enable(); return true; } } catch (e) { /* declined */ } return false; });
      else enable();
    }
  }

  ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { if (geo) { measure(); onScroll(); } });
  ro?.observe(root.querySelector('.apse-lane') || root);
  if (stillMode) startStill(); else startLive();
  window.__mosaicAsk = () => send({ type: 'perf' });   // review: the worker's frame times into __mosaicPerf.worker

  return {
    clock: () => clockLabel(),
    momentLabel: () => MOMENTS[moment]?.label,
    destroy() {
      if (!stillMode) stopLive();
      disposed = true;
      clearInterval(tick); clearTimeout(resizeTimer); cancelAnimationFrame(scrollRaf);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
      ro?.disconnect();
      delete root.dataset.still;
      delete html.dataset.mosaic;
    },
  };
}
