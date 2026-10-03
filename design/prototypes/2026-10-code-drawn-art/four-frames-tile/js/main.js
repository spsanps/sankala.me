/* Four frames in tile: the page. The same words and structure as the homepage (FourFrames.jsx),
   built without React for this standalone comparison. */
import { ERA_LIST, PHOTOS, localImage, monthYear } from './eras.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SITE = 'https://www.sankala.me';
const href = h => h.startsWith('/') ? SITE + h : h;
function withLinks(text) {
  return text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/).map(part => {
    const m = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    return m ? `<a href="${esc(m[2])}">${esc(m[1])}</a>` : esc(part);
  }).join('');
}
const num = (p, k) => p.has(k) && !Number.isNaN(parseFloat(p.get(k))) ? parseFloat(p.get(k)) : undefined;

function lane(plain) {
  return ERA_LIST.map((era, index) => `<section class="ff-frame" data-frame="${era.key}" aria-labelledby="place-${era.key}">
    ${index === 0 ? `<div class="ff-intro">
      <h1>Hi, I’m San.</h1>
      <p class="ff-lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <a href="${SITE}/notes/startr-postmortem">a startup that didn’t make it</a>. I also write, make things, and sometimes turn an idea into a film.</p>
      <p class="ff-more"><a href="${SITE}/about">More about me</a><span class="ff-mail">san@sankala.me</span>${plain ? '<a href="?">Living version</a>' : '<a href="?plain=1">Plain version</a>'}</p>
      <p class="ff-cue">The desk is painted in code on glazed tiles and keeps San Jose time. Scroll, and the tiles turn over to the places I’ve lived and worked.<span class="ff-clock"></span></p>
      <h2 class="ff-path" id="history">My path so far</h2>
    </div>` : ''}
    <div class="ff-plain-still" data-still="${era.key}" role="img" aria-label="${esc(era.alt)}"></div>
    <header class="ff-place"><span class="ff-years">${esc(era.years)}</span><h2 id="place-${era.key}">${esc(era.place)}</h2><span class="ff-role">${esc(era.role)}</span></header>
    <ol class="ff-entries">${era.milestones.map(m => `<li id="history-${m.id}" class="${m.images.length ? 'has-print' : ''}">
      <div class="ff-entry-text"><time datetime="${m.date}">${esc(monthYear(m))}</time><h3>${esc(m.title)}</h3><p>${withLinks(m.description)}</p>
      ${m.links.length ? `<p class="ff-links">${m.links.map(([h, l]) => `<a href="${esc(href(h))}">${esc(l)}</a>`).join('')}</p>` : ''}</div>
      ${m.images.map(im => `<a class="ff-print" href="${esc(localImage(im.src))}" data-caption="${esc(im.caption)}" aria-label="Enlarge photograph: ${esc(im.caption)}"><img src="${esc(localImage(im.src))}" alt="${esc(im.alt)}" loading="lazy" decoding="async"></a>`).join('')}
    </li>`).join('')}</ol>
  </section>`).join('');
}

async function start() {
  const params = new URLSearchParams(location.search);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plain = params.get('plain') === '1' || reduce;
  const root = document.querySelector('.four-frames');
  root.classList.toggle('is-plain', plain);
  const laneEl = root.querySelector('.ff-lane');
  laneEl.innerHTML = lane(plain);
  const sections = [...laneEl.querySelectorAll('.ff-frame')];

  // the lightbox for the photographs in the lane
  const dlg = root.querySelector('.ff-lightbox');
  laneEl.addEventListener('click', e => {
    const a = e.target.closest('.ff-print'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    dlg.querySelector('figure').innerHTML = `<img src="${a.getAttribute('href')}" alt="${esc(a.querySelector('img').alt)}"><figcaption>${esc(a.dataset.caption)}</figcaption>`;
    dlg.showModal();
  });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.ff-lightbox-close')) dlg.close(); });

  const { createStage, paintStill } = await import('./stage.js');
  if (plain) {
    // one fired panel per place, standing in the column with its words
    for (const el of root.querySelectorAll('.ff-plain-still')) {
      const cv = document.createElement('canvas'); el.appendChild(cv);
      const w = Math.min(760, el.getBoundingClientRect().width || 700), h = Math.round(w * 790 / 700);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      await paintStill({ canvas: cv, width: w, height: h, dpr: Math.min(2, devicePixelRatio || 1), era: el.dataset.still, hour: num(params, 'hour'), photos: PHOTOS });
    }
    window.__ready = true;
    return;
  }
  const hooks = { t: num(params, 't'), hour: num(params, 'hour'), pos: num(params, 'pos'), era: params.get('era') || undefined };
  const cap = root.querySelector('.ff-caption'), clock = root.querySelector('.ff-clock');
  await createStage({
    canvas: root.querySelector('.ff-canvas'), stageEl: root.querySelector('.ff-stage'), sections, photos: PHOTOS, hooks,
    onChange: n => { cap.textContent = n.text; if (n.place === 'San Jose') clock.textContent = `It’s ${n.label} in San Jose now.`; },
    onReady: () => {
      root.classList.add('is-live');
      if (hooks.era) {
        const i = ERA_LIST.findIndex(e => e.key === hooks.era);
        if (i > 0) scrollTo(0, sections[i].getBoundingClientRect().top + scrollY - innerHeight * .2);
      }
      setTimeout(() => { window.__ready = true; }, hooks.t != null ? 60 : 0);
    },
  });
}
start();
