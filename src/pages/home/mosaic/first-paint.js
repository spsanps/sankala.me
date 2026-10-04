/* The homepage's first paint. Two small inline scripts in the prerendered HTML, around the apse:
   - in <head>, before the stylesheet: ask for this moment's conch still at a high priority;
   - before the apse: pick San Jose's moment (it chooses the conch's still in CSS) and hold the apse
     back (html.apse-wait hides it);
   - after it: wait until the apse's stills, the stele's marble and frame and its two fonts are
     decoded, then show it, so its first visible frame is already finished: the wall, the gold apse
     and the words on their marble stele, all at once. It never waits more than 1.5 s, and without
     JavaScript nothing is held at all. On a slow network the words are shown at 1.5 s; any still not
     decoded by then stays unseen (html.apse-wait-art, html.apse-wait-stele) and fades in whole when
     it is, so a half-loaded picture never shows.
   The functions are self-contained, because their source is inlined. The same code runs again in a
   layout effect when the homepage is reached by a link inside the site. */
import { sanJoseMoment } from './moments.js';
import { SIDE_QUERY, BAND_QUERY } from './layout.js';

export function holdApse(timeout) {
  var h = document.documentElement, done = false, left = {};
  function show() {
    if (done) return;
    done = true;
    for (var g in left) if (left[g] > 0) h.classList.add('apse-wait-' + g);
    h.classList.remove('apse-wait');
    window.__apseShown = Math.round(performance.now());
  }
  setTimeout(show, timeout || 1500);
  try {
    var waits = [], seen = {};
    var add = function (v, group) {
      var m = /url\(["']?([^"')]+)["']?\)/.exec(v || '');
      if (!m || seen[m[1]]) return;
      seen[m[1]] = 1; left[group] = (left[group] || 0) + 1;
      var img = new Image(); img.src = m[1];
      var settle = function () { if (--left[group] === 0) h.classList.remove('apse-wait-' + group); };
      waits.push((img.decode ? img.decode() : new Promise(function (r, j) { img.onload = r; img.onerror = j; })).then(settle, settle));
    };
    [['.apse-back', null, 'backgroundImage', 'art'], ['.apse-back .apse-wall', null, 'backgroundImage', 'art'], ['.apse-conch', null, 'backgroundImage', 'art'], ['.stele', null, 'backgroundImage', 'stele'], ['.stele', '::before', 'backgroundImage', 'stele'], ['.stele', '::after', 'borderImageSource', 'stele']].forEach(function (q) {
      var el = document.querySelector(q[0]); if (el) add(getComputedStyle(el, q[1])[q[2]], q[3]);
    });
    if (document.fonts && document.fonts.load) waits.push(document.fonts.load('400 22px "EB Garamond"'), document.fonts.load('400 52px Marcellus'));
    Promise.all(waits).then(show, show);
  } catch (e) { show(); }
}

/** the conch still for this moment and screen, requested at a high priority while the stylesheet is
    still loading (as a background image it would be asked for only after it, at a low priority) */
export function preloadConch(moment, side, band) {
  try {
    var family = matchMedia(side).matches || !matchMedia(band).matches ? 'fine' : 'coarse';
    var l = document.createElement('link');
    l.rel = 'preload'; l.as = 'image'; l.href = '/images/home/conch-' + family + '-now-' + moment + '-1x.webp';
    l.setAttribute('fetchpriority', 'high');
    document.head.appendChild(l);
  } catch (e) { /* the CSS asks for it anyway */ }
}

/** The homepage reads and looks finished before the app's script runs (its words and stills are in
    the prerendered HTML), so on a slow network that script waits for the first screen's pictures
    instead of sharing the connection with them: it is fetched once the page has loaded (stills and
    fonts) or 4.5 s after the HTML, whichever comes first. prerender.mjs moves its URL to html[data-app]. */
export function loadAppLater() {
  var done = false;
  function go() {
    if (done) return;
    done = true;
    var src = document.documentElement.getAttribute('data-app');
    if (!src) return;
    var s = document.createElement('script');
    s.type = 'module'; s.crossOrigin = 'anonymous'; s.src = src;
    document.head.appendChild(s);
  }
  // served for another route (a server's single-page fallback), the app is the page: load it now
  if (location.pathname !== '/' || document.readyState === 'complete') go(); else window.addEventListener('load', go);
  setTimeout(go, 4500);
}

/** in <head>, before the stylesheet (scripts/publishing/prerender.mjs puts it there): the conch's still */
export const headScript = () => `try{(${String(preloadConch)})((${String(sanJoseMoment)})(new URLSearchParams(location.search).get('hour')),${JSON.stringify(SIDE_QUERY)},${JSON.stringify(BAND_QUERY)})}catch(e){}`;
/** before the apse: the moment, and hold the apse until it is ready */
export const beforeApseScript = () => `try{var h=document.documentElement;h.classList.add('apse-wait');var q=new URLSearchParams(location.search).get('hour');h.setAttribute('data-sj',(${String(sanJoseMoment)})(q))}catch(e){document.documentElement.classList.remove('apse-wait')}`;
/** after the apse: show it once its pictures and fonts are ready */
export const afterApseScript = () => `(${String(holdApse)})(1500);(${String(loadAppLater)})()`;
