/* Which apse a reader gets, decided before any of the live layer's code is downloaded.

     live    the living mosaic (live.js): a worker lays and paints the conch, WebGL lights the gold
     simple  the printed stills only, the same pictures, the conch switched per place as the words
             scroll past each one; no canvas, no worker, no WebGL

   Phones get the simple apse. Measured on a phone profile (design/reviews/2026-10-04-mobile-home/),
   the live layer added about 180 MB to the page's process and 50 MB to the GPU process, a worker that
   lays four places for 1.3 s of CPU on a fast desktop core (several times that on a phone), and
   another 300 KB or so of downloads; and the gold's light is computed at half precision on phone
   GPUs. So do low-memory and few-core devices, slow or metered connections, readers who prefer
   reduced motion, and browsers without OffscreenCanvas in a worker. `?simple=1` (or the older
   `?plain=1`) and `?live=1` force either one, for testing. */

/** { mode: 'live' | 'simple', why } for this browser */
export function chooseMode(search = typeof location === 'undefined' ? '' : location.search) {
  const params = new URLSearchParams(search);
  if (params.get('live') === '1') return { mode: 'live', why: 'asked' };
  if (params.get('simple') === '1' || params.get('plain') === '1') return { mode: 'simple', why: 'asked' };
  if (typeof window === 'undefined') return { mode: 'simple', why: 'server' };
  const nav = window.navigator || {}, conn = nav.connection || {};
  const media = query => !!window.matchMedia?.(query).matches;
  const simple = why => ({ mode: 'simple', why });
  if (media('(prefers-reduced-motion: reduce)')) return simple('reduced-motion');
  if (conn.saveData) return simple('save-data');
  if (/(^|-)[23]g$/.test(conn.effectiveType || '')) return simple('slow-network');   // slow-2g, 2g, 3g
  if (nav.deviceMemory && nav.deviceMemory <= 4) return simple('low-memory');
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) return simple('few-cores');
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined' || typeof HTMLCanvasElement === 'undefined' || !('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return simple('no-offscreen-canvas');
  // a phone: touch first, and a small screen or the phones' tall layout
  const short = Math.min(window.screen?.width || 1e4, window.screen?.height || 1e4);
  if (media('(pointer: coarse)') && (short < 600 || media('(max-aspect-ratio: 31/50)'))) return simple('phone');
  return { mode: 'live', why: 'capable' };
}
