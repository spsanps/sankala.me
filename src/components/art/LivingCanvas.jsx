import { useEffect, useRef, useState } from 'react';
import { queueBuild } from './build-queue';
import '../../styles/art.css';

// A drawing that shows its static print first and comes alive later.
// The image is in the HTML for first paint, crawlers and readers without JavaScript. Once the
// element is visible and the browser is idle, `createRenderer` prints the live version into a
// canvas laid exactly over the image; it then animates only while on screen and the tab is
// visible. Reduced-motion readers keep the static print.
//
// createRenderer({ canvas, width, height }) → Promise<{ still, key(t), draw(t, full) }>
export default function LivingCanvas({ image, createRenderer, className = '', priority = false }) {
  const wrap = useRef(null);
  const canvasRef = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = wrap.current, canvas = canvasRef.current;
    if (!createRenderer || !el || !canvas || typeof IntersectionObserver === 'undefined') return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return undefined;

    let renderer = null, raf = 0, visible = false, disposed = false, building = false, builtWidth = 0, t0 = 0, elapsed = 0, lastKey, resizeTimer = 0;
    const size = () => {
      const rect = el.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      return [Math.round(rect.width * dpr), Math.round(rect.height * dpr)];
    };
    const frame = now => {
      raf = 0;
      if (disposed || !renderer || !visible || document.hidden) return;
      const t = renderer.still + (now - t0) / 1000, key = renderer.key(t);
      if (key !== lastKey) { lastKey = key; renderer.draw(t, false); }
      raf = requestAnimationFrame(frame);
    };
    // Time pauses while the drawing is off screen, so it resumes where it left off.
    const play = () => { if (!raf && renderer && visible && !document.hidden) { t0 = performance.now() - elapsed; raf = requestAnimationFrame(frame); } };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; elapsed = performance.now() - t0; } };
    const build = () => {
      if (building || disposed) return;
      const [width, height] = size();
      if (!width || !height || (builtWidth && Math.abs(width - builtWidth) / builtWidth < .1)) return;
      building = true;
      queueBuild(async () => {
        if (disposed) return;
        stop(); renderer = null;
        const next = await createRenderer({ canvas, width, height });
        if (disposed) return;
        renderer = next; builtWidth = width; lastKey = undefined;
        renderer.draw(renderer.still, true);
        setLive(true);
        elapsed = 0; play();
      }).catch(() => {}).finally(() => { building = false; });
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) stop();
      else if (renderer) play();
      else build();
    }, { rootMargin: '160px' });
    io.observe(el);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (renderer && visible) build(); }, 300);
    });
    ro?.observe(el);
    const onVisibility = () => { if (document.hidden) stop(); else play(); };
    document.addEventListener('visibilitychange', onVisibility);
    const onMotion = () => { if (reduce.matches) { disposed = true; stop(); setLive(false); } };
    reduce.addEventListener?.('change', onMotion);

    return () => {
      disposed = true; stop(); clearTimeout(resizeTimer);
      io.disconnect(); ro?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduce.removeEventListener?.('change', onMotion);
    };
  }, [createRenderer]);

  return <span ref={wrap} className={`living-canvas${live ? ' is-live' : ''}${className ? ' ' + className : ''}`}>
    <img src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt={image.alt} width={image.width} height={image.height}
      loading={priority ? 'eager' : 'lazy'} decoding="async" />
    {createRenderer && <canvas ref={canvasRef} aria-hidden="true" />}
  </span>;
}
