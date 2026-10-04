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
/* type sizes by stele width: the intro's body, its heading */
const TYPE = { 296: [18, 36], 336: [18.5, 38], 351: [19, 40], 366: [19, 40], 388: [19.5, 42], 406: [20, 44], 480: [20.5, 46], 520: [21.5, 52], 580: [23, 60] };
const typeVars = width => `--lede:${TYPE[width][0]}px;--h1:${TYPE[width][1]}px;`;

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
