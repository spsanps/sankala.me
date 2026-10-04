/* The apse's live layer, from the page's side. Started once the first paint is up and the browser
   is idle (MosaicApse.jsx). It reads the apse's box back from the page (CSS placed the stills), then
   either hands two canvases to a worker (worker.js) or, where that isn't possible, runs the same
   stage on the main thread in idle slices. From then on the page only reports the scroll position,
   the pointer, a tilted phone and visibility; the worker lays and paints.

   In the still version (?plain=1) and for readers who prefer reduced motion, nothing is laid: the
   conch's still is switched as the words reach each place. */
import { sanJoseMoment, clockLabel, MOMENTS } from './moments.js';
import { FAMILIES, SHEETS, conchBox, PLACE_KEYS } from './layout.js';

const idle = (fn, timeout = 1200) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout }) : setTimeout(fn, 60));
const num = (params, key) => params.has(key) && !Number.isNaN(parseFloat(params.get(key))) ? parseFloat(params.get(key)) : undefined;

/** Start the live layer on the apse `root`. `onPlace({ index, caption })` reports the place in view. */
export function startMosaic(root, { onPlace, onTilt, onRestart } = {}) {
  const home = root.closest('.home') || root;
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
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stillOnly = reduce || params.get('plain') === '1';
  const perf = window.__mosaicPerf = { start: Math.round(performance.now()), cls, mode: null, laid: [] };
  let disposed = false, geo = null, tops = [], lastPos = -1, lastPlace = -1, worker = null, stage = null, send = () => {}, io = null, ro = null, timers = [];
  let moment = sanJoseMoment(hourParam);
  const still = document.documentElement.getAttribute('data-sj');

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
    if (place !== lastPlace) { lastPlace = place; onPlace?.({ index: place, key: PLACE_KEYS[place], moment }); if (stillOnly) root.dataset.still = place ? PLACE_KEYS[place] : ''; }
  }

  /* ───────── events ───────── */
  let scrollRaf = 0, pointerRaf = 0, pointerAt = null;
  const onScroll = () => {
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

  /* ───────── the still version ───────── */
  function startStill() {
    perf.mode = 'still';
    geo = geometry(); measure(); report(scrollPos());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // the other places' stills, so switching never shows an empty conch
    idle(() => { if (!disposed) for (const p of ['sd', 'blr', 'nitk']) new Image().src = `/images/home/conch-${family}-${p}-1x.webp`; });
    window.__ready = true;
  }

  /* ───────── the live layer ───────── */
  let glintCanvas = null;
  function sizeGlint() { if (glintCanvas) glintCanvas.style.height = geo.glintH + 'px'; }
  function onMessage(msg) {
    if (disposed) return;
    if (msg.type === 'laid') {
      perf.laid.push({ index: msg.index, ms: msg.ms, at: msg.at });
      if (hooks.t != null) {   // review: draw the frozen moment once both places of a wave are laid
        const p = hooks.pos ?? 0, need = [Math.floor(p), Math.min(3, Math.ceil(p))];
        if (!perf.frozen && need.every(i => perf.laid.some(l => l.index === i))) { perf.frozen = true; send({ type: 'render', t: hooks.t, pos: p, light: hooks.light }); }
      } else if (perf.laid.length === 1) afterFirst();
    } else if (msg.type === 'rendered') window.__ready = true;
    else if (msg.type === 'glint') perf.glint = msg.ok;
    else if (msg.type === 'perf') perf.worker = msg;
  }
  function afterFirst() {
    window.__ready = true;
    perf.firstLaid = Math.round(performance.now());
    // the light, once the browser is idle again: the wall's stones come as a small binary file
    idle(async () => {
      if (disposed || params.get('glint') === 'off') return;
      try {
        const res = await fetch(`/images/home/glint-${cls}.bin`, { priority: 'low' });
        const buffer = await res.arrayBuffer();
        if (disposed) return;
        send({ type: 'wall', buffer }, [buffer]);
        send({ type: 'glint', on: true });
        perf.glintAt = Math.round(performance.now());
      } catch (e) { /* the apse is whole without its light */ }
    }, 2500);
    // sharper stills where the screen has the pixels for them
    idle(() => {
      if (disposed || document.documentElement.classList.contains('apse-hires')) return;
      const conn = navigator.connection;
      const fam = FAMILIES[family], need = geo.u * geo.dpr;
      if ((conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) || need < fam.still[0] * 1.15) return;
      const cs = getComputedStyle(root), urls = ['--wall2', '--conch2'].map(v => /url\(["']?([^"')]+)/.exec(cs.getPropertyValue(v))?.[1]).filter(Boolean);
      Promise.all(urls.map(u => { const img = new Image(); img.src = u; return img.decode(); })).then(() => {
        if (!disposed) document.documentElement.classList.add('apse-hires');
      }).catch(() => {});
    }, 4000);
  }
  function startLive() {
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
        worker.onerror = () => { perf.workerError = true; };
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
        if (disposed) return;
        const pause = () => new Promise(r => idle(() => r(), 200));
        stage = createStage({ conchCanvas: conch, glintCanvas, post: onMessage, pause, budget: 8, raf: cb => requestAnimationFrame(cb) });
        send = m => stage?.handle(m);
        stage.handle(init);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    io = new IntersectionObserver(([e]) => send({ type: 'visible', on: e.isIntersecting }));
    io.observe(root);
    // San Jose's moment and the clock on the cornice move on with the real time
    timers.push(setInterval(() => {
      const m = sanJoseMoment(hourParam);
      if (m !== moment) { moment = m; send({ type: 'moment', moment }); }
      onPlace?.({ index: lastPlace, key: PLACE_KEYS[lastPlace], moment, tick: true });
    }, 30000));
    // tilt on phones: at once where allowed, behind a button where the browser asks first (iOS)
    if (window.matchMedia('(pointer: coarse)').matches && 'DeviceOrientationEvent' in window) {
      const enable = () => window.addEventListener('deviceorientation', onTiltEvent);
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') onTilt?.(async () => { try { if (await window.DeviceOrientationEvent.requestPermission() === 'granted') { enable(); return true; } } catch (e) { /* declined */ } return false; });
      else enable();
    }
  }

  ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { if (geo) { measure(); onScroll(); } });
  ro?.observe(root.querySelector('.apse-lane') || root);
  if (stillOnly) startStill(); else startLive();
  window.__mosaicAsk = () => send({ type: 'perf' });   // review: the worker's frame times into __mosaicPerf.worker

  return {
    clock: () => clockLabel(),
    momentLabel: () => MOMENTS[moment]?.label,
    destroy() {
      disposed = true;
      timers.forEach(clearInterval); clearTimeout(resizeTimer);
      cancelAnimationFrame(scrollRaf); cancelAnimationFrame(pointerRaf);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('pointermove', onPointer); window.removeEventListener('resize', onResize);
      window.removeEventListener('deviceorientation', onTiltEvent); document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect(); ro?.disconnect();
      if (worker) { worker.postMessage({ type: 'destroy' }); worker.terminate(); worker = null; }
      stage?.handle({ type: 'destroy' }); stage = null;
      root.querySelectorAll('.apse-conch-live, .apse-glint').forEach(el => el.remove());
      delete root.dataset.still;
    },
  };
}
