/* The homepage's first paint. Two small inline scripts in the prerendered HTML, around the apse:
   - before it: pick San Jose's moment (it chooses the conch's still in CSS) and hold the apse back
     (html.apse-wait hides it);
   - after it: wait until the apse's stills, the stele's marble and frame and its two fonts are
     decoded, then show it, so its first visible frame is already finished: the wall, the gold apse
     and the words on their marble stele, all at once. It never waits more than 1.5 s, and without
     JavaScript nothing is held at all.
   Both functions are self-contained, because their source is inlined. The same code runs again in a
   layout effect when the homepage is reached by a link inside the site. */
import { sanJoseMoment } from './moments.js';

export function holdApse(timeout) {
  var h = document.documentElement, done = false;
  function show() { if (!done) { done = true; h.classList.remove('apse-wait'); window.__apseShown = Math.round(performance.now()); } }
  setTimeout(show, timeout || 1500);
  try {
    var urls = [], seen = {};
    var add = function (v) { var m = /url\(["']?([^"')]+)["']?\)/.exec(v || ''); if (m && !seen[m[1]]) { seen[m[1]] = 1; urls.push(m[1]); } };
    [['.apse-back', null, 'backgroundImage'], ['.apse-back .apse-wall', null, 'backgroundImage'], ['.apse-conch', null, 'backgroundImage'], ['.stele', null, 'backgroundImage'], ['.stele', '::before', 'backgroundImage'], ['.stele', '::after', 'borderImageSource']].forEach(function (q) {
      var el = document.querySelector(q[0]); if (el) add(getComputedStyle(el, q[1])[q[2]]);
    });
    var waits = urls.map(function (u) {
      var img = new Image(); img.src = u;
      return img.decode ? img.decode().catch(function () {}) : new Promise(function (r) { img.onload = img.onerror = r; });
    });
    if (document.fonts && document.fonts.load) waits.push(document.fonts.load('400 22px "EB Garamond"'), document.fonts.load('400 52px Marcellus'));
    Promise.all(waits).then(show, show);
  } catch (e) { show(); }
}

/** before the apse: the moment, and hold the apse until it is ready */
export const beforeApseScript = () => `try{var h=document.documentElement;h.classList.add('apse-wait');var q=new URLSearchParams(location.search).get('hour');h.setAttribute('data-sj',(${String(sanJoseMoment)})(q))}catch(e){document.documentElement.classList.remove('apse-wait')}`;
/** after the apse: show it once its pictures and fonts are ready */
export const afterApseScript = () => `(${String(holdApse)})(1500)`;
