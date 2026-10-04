/* The apse's live layer in a worker: the page transfers its two canvases (OffscreenCanvas) and
   then only sends the scroll position, the pointer and visibility; laying, painting and the light all
   happen here, off the main thread. See stage.js. */
import { createStage } from './stage.js';

let stage = null;
// yield to the worker's event loop between slices of laying, without timer clamping
const channel = new MessageChannel(), waiting = [];
channel.port1.onmessage = () => { const r = waiting.shift(); if (r) r(); };
const pause = () => new Promise(resolve => { waiting.push(resolve); channel.port2.postMessage(0); });
const raf = typeof self.requestAnimationFrame === 'function' ? cb => self.requestAnimationFrame(cb) : null;

self.onmessage = event => {
  const msg = event.data;
  if (msg.type === 'init' && !stage) {
    stage = createStage({ conchCanvas: msg.conch, glintCanvas: msg.glint, post: m => self.postMessage(m), pause, budget: 14, raf });
  }
  if (stage) stage.handle(msg);
  if (msg.type === 'destroy') { stage = null; self.close(); }
};
