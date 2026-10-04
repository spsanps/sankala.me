/* The homepage's generated CSS: the numbers the stills were printed with (layout.js, stills.json),
   written into custom properties per layout class, per moment of San Jose's day and per stele
   width. home.css does the rest with them. Rendered into the page as a <style> element, so it is in
   the prerendered HTML and the first paint already has every picture in place. */
import { SHEETS, FAMILIES, FRAMES, C, steleRise, steleClip, SIDE_QUERY, BAND_QUERY } from './layout.js';
import { MOMENT_KEYS, DEFAULT_MOMENT } from './moments.js';
import stills from './stills.json';

const img = name => `url(/images/home/${name})`;
const SIDE = SIDE_QUERY;
const BAND = BAND_QUERY;
const NOT_BAND = '(min-aspect-ratio: 31/50)';

function sheetVars(cls) {
  const S = SHEETS[cls], fam = FAMILIES[S.family], y1 = fam.F + C;
  return `--F:${fam.F};--fstone:${fam.stone};--sx0:${S.x0};--sy0:${S.y0};--sw:${S.x1 - S.x0};--sh:${y1 - S.y0};--y1:${y1};`
    + `--wall:${img(`wall-${cls}-1x.webp`)};--wall2:${img(`wall-${cls}-2x.webp`)};`;
}
function conchRules(family, prefix = '') {
  const out = [], url = (state, x) => img(`conch-${family}-${state}-${x}x.webp`);
  out.push(`${prefix}.apse{--conch:${url(`now-${DEFAULT_MOMENT}`, 1)};--conch2:${url(`now-${DEFAULT_MOMENT}`, 2)}}`);
  for (const m of MOMENT_KEYS) out.push(`${prefix}html[data-sj="${m}"] .apse{--conch:${url(`now-${m}`, 1)};--conch2:${url(`now-${m}`, 2)}}`);
  for (const p of ['sd', 'blr', 'nitk']) out.push(`${prefix}html .apse[data-still="${p}"]{--conch:${url(p, 1)};--conch2:${url(p, 1)}}`);
  return out.join('');
}
function steleVars(kind, width) {
  const head = (stills.heads || {})[`${kind}-${width}`], frame = (stills.frames || {})[kind];
  const f = FRAMES[kind], fw = f.stone * 4, rise = steleRise(width, kind), headH = head?.headH ?? Math.ceil(rise + fw * 1.6);
  return `--stele-w:${width}px;--rise:${rise}px;--head-h:${headH}px;--fw:${fw}px;--slice:${frame?.slice ?? fw * 2};--fstone-px:${f.stone}px;`
    + `--stele-head:${img(`stele-${kind}-${width}.webp`)};--frame:${img(`frame-${kind}.webp`)};--frieze:${img(`frieze-${kind}.webp`)};--frieze-top:${img(`frieze-${kind}-top.webp`)};`
    + `--loose:${img(`loose-${kind}.webp`)};--loose-top:${img(`loose-${kind}-top.webp`)};--stele-clip:${steleClip(width, kind)};`;
}
/* type sizes by stele width: the intro's body, its heading and (on phones) the tablets' body.
   Phones get larger words than before (19.5–21 px, headings 40–46 px) beside a smaller apse. */
const TYPE = { 288: [19.5, 40, 19.5], 328: [20, 42, 19.5], 343: [20.5, 44, 20], 358: [20.5, 44, 20], 380: [21, 46, 20.5], 398: [21, 46, 20.5], 480: [20.5, 46], 520: [21.5, 52], 580: [23, 60] };
const typeVars = width => `--lede:${TYPE[width][0]}px;--h1:${TYPE[width][1]}px;${TYPE[width][2] ? `--body:${TYPE[width][2]}px;` : ''}`;

/** The first paint's stills that don't depend on San Jose's moment or the stele's width, each with
    the media query that selects it in mosaicCss: Home.jsx preloads them at a high priority, so a phone
    on a slow network gets the pictures before the scripts (the conch is preloaded by the first-paint
    script; the stele's small head comes with the CSS). */
export function stillPreloads() {
  const MID = `${NOT_BAND} and (max-width: 1099.98px), ${NOT_BAND} and (max-aspect-ratio: 6/5)`;
  return [
    { href: '/images/home/courses.webp' }, { href: '/images/home/marble.webp' },
    { href: '/images/home/wall-band-1x.webp', media: BAND }, { href: '/images/home/wall-mid-1x.webp', media: MID }, { href: '/images/home/wall-side-1x.webp', media: SIDE },
    { href: '/images/home/frame-phone.webp', media: `${BAND}, (max-width: 639.98px)` }, { href: '/images/home/frame-wide.webp', media: `${NOT_BAND} and (min-width: 640px)` },
  ];
}

export function mosaicCss() {
  const rules = [];
  // mid (the default): tablets, square and narrow windows
  rules.push(`.home{${sheetVars('mid')}--class:mid}`);
  rules.push(conchRules('fine'));
  rules.push(`html.apse-hires .apse{--wall:var(--wall2);--conch:var(--conch2)}`);
  // phones
  rules.push(`@media ${BAND}{.home{${sheetVars('band')}--class:band}${conchRules('coarse')}html.apse-hires .apse{--wall:var(--wall2);--conch:var(--conch2)}}`);
  // wide screens
  rules.push(`@media ${SIDE}{.home{${sheetVars('side')}--class:side}}`);
  // the stele and the tablets: one width per range of screens
  const phone = FRAMES.phone.widths, mins = [0, 360, 375, 390, 412, 430];
  phone.forEach((w, i) => rules.push(`@media ${BAND} and (min-width:${mins[i]}px){.home{${steleVars('phone', w)}${typeVars(w)}}}`));
  phone.forEach((w, i) => rules.push(`@media ${NOT_BAND} and (min-width:${mins[i]}px){.home{${steleVars('phone', w)}${typeVars(w)}}}`));
  for (const [w, min] of [[480, 640], [520, 760], [580, 900]]) rules.push(`@media ${NOT_BAND} and (min-width:${min}px){.home{${steleVars('wide', w)}${typeVars(w)}}}`);
  for (const [w, min] of [[480, 1100], [520, 1360], [580, 1680]]) rules.push(`@media ${SIDE} and (min-width:${min}px){.home{${steleVars('wide', w)}${typeVars(w)}}}`);
  return rules.join('\n');
}
