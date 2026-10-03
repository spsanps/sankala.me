/* The apse in mosaic: the page. The same words and structure as the homepage (FourFrames.jsx and
   Home.jsx), built without React for this standalone study: the intro on a tabula ansata under the
   apse, the path through the four places on marble tablets (the conch is re-laid for each place as
   its tablet comes up), then the covers shelf in plaster. */
import { ERA_LIST, localImage, monthYear } from './eras.js';

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

/* the covers shelf, newest first (src/data/work.js) */
const WORKS = [
  ['nobody-owes-anything-now', 'Nobody Owes Anything Now', 'Poem', 2026, '/notes/nobody-owes-anything-now'],
  ['capricious-god', 'How to Please a Capricious God', 'Film', 2026, 'https://www.paperrobots.studio/films/capricious-god/'],
  ['another-sky', 'Another Sky', 'Experiment', 2026, 'https://dysonswarm.com/another-sky/'],
  ['eai-challenge', 'Winning by Overfitting', 'Essay / note', 2026, '/notes/eai-challenge'],
  ['a-clauiet-life', 'A Clauiet Life', 'Experiment', 2026, '/toys/bee-sim/index.html'],
  ['gpt7-will-have-arms', 'GPT-7 Will Have Arms', 'Essay / note', 2025, '/essays/gpt7-will-have-arms'],
  ['startr-postmortem', 'Glyp: A Post-Mortem', 'Essay / note', 2025, '/notes/startr-postmortem'],
  ['dyson-swarm', 'Dyson Swarm', 'Experiment', 2024, 'https://dysonswarm.com/swarm/'],
  ['zinify', 'ZINify: research to zines', 'Research', 2023, '/notes/zinify'],
  ['power-quality', 'Power quality event classification with LSTMs', 'Research', 2019, '/notes/power-quality'],
];

function lane(still) {
  const intro = `<section class="tab tab-intro" aria-labelledby="hello"><canvas class="tab-art" aria-hidden="true"></canvas><div class="tab-text">
      <h1 id="hello">Hi, I’m San.</h1>
      <p class="lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <a href="${SITE}/notes/startr-postmortem">a startup that didn’t make&nbsp;it</a>. I also write, make things, and sometimes turn an idea into a film.</p>
      <p class="more"><a href="${SITE}/about">More about me</a><span class="mail">san@sankala.me</span>${still ? '<a href="?">Living version</a>' : '<a href="?plain=1">Still version</a>'}</p>
    </div></section>
    <p class="wall-note">The apse is laid in stones, in code. In San Jose it keeps the real time; scroll, and it is re-laid for each place I’ve lived and worked.<span class="clock"></span><button type="button" class="tilt" hidden>Tilt your phone to catch the light</button></p>
    <h2 class="path" id="history">My path so far</h2>`;
  return intro + ERA_LIST.map((era, index) => `<section class="tab place" data-frame="${era.key}" aria-labelledby="place-${era.key}"><canvas class="tab-art" aria-hidden="true"></canvas><div class="tab-text">
    <header class="place-head"><span class="years">${esc(era.years)}</span><h2 id="place-${era.key}">${esc(era.place)}</h2><span class="role">${esc(era.role)}</span></header>
    <ol class="entries">${era.milestones.map(m => `<li id="history-${m.id}" class="${m.images.length ? 'has-print' : ''}">
      <div><time datetime="${m.date}">${esc(monthYear(m))}</time><h3>${esc(m.title)}</h3><p>${withLinks(m.description)}</p>
      ${m.links.length ? `<p class="links">${m.links.map(([h, l]) => `<a href="${esc(href(h))}">${esc(l)}</a>`).join('')}</p>` : ''}</div>
      ${m.images.map(im => `<a class="print" href="${esc(localImage(im.src))}" data-caption="${esc(im.caption)}" aria-label="Enlarge photograph: ${esc(im.caption)}"><img src="${esc(localImage(im.src))}" alt="${esc(im.alt)}" loading="lazy" decoding="async"></a>`).join('')}
    </li>`).join('')}</ol>
  </div></section>`).join('');
}

async function start() {
  const params = new URLSearchParams(location.search);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const still = params.get('plain') === '1' || reduce;
  const root = document.querySelector('.apse');
  const laneEl = root.querySelector('.apse-lane');
  laneEl.innerHTML = lane(still);
  document.querySelector('.covers').innerHTML = WORKS.map(([slug, title, kind, year, url]) => `<li><a class="cover" href="${esc(href(url))}"><span class="cover-art"><img src="covers/${slug}-360.webp" alt="" width="360" height="540" loading="lazy" decoding="async"></span><span class="cover-title">${esc(title)}</span></a><span class="cover-meta">${esc(kind)} · ${year}</span></li>`).join('');

  const dlg = root.querySelector('.lightbox');
  laneEl.addEventListener('click', e => {
    const a = e.target.closest('.print'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    dlg.querySelector('figure').innerHTML = `<img src="${a.getAttribute('href')}" alt="${esc(a.querySelector('img').alt)}"><figcaption>${esc(a.dataset.caption)}</figcaption>`;
    dlg.showModal();
  });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.lightbox-close')) dlg.close(); });

  const [{ createStage }, { paintTablet }, { paintFrieze }] = await Promise.all([import('./stage.js'), import('./tablet.js'), import('./frieze.js')]);
  const ERA_KEYS = ['now', 'sd', 'blr', 'nitk'];
  const hooks = { t: num(params, 't'), hour: num(params, 'hour'), pos: num(params, 'pos'), era: ERA_KEYS.includes(params.get('era')) ? ERA_KEYS.indexOf(params.get('era')) : undefined };
  if (hooks.era != null && hooks.pos == null) hooks.pos = hooks.era;
  hooks.all = params.get('all') === '1';
  if (hooks.t != null) document.documentElement.classList.add('is-frozen');
  if (params.has('light')) hooks.light = params.get('light').split(',').map(Number);   // review: the light at (x, y), fractions of the band
  hooks.noGlint = params.get('glint') === '0';
  const clock = laneEl.querySelector('.clock');
  const tablets = [...laneEl.querySelectorAll('.tab')];
  let stonePx = 6.6, wide = true, tabletsDone = Promise.resolve();
  const dpr = Math.min(2, devicePixelRatio || 1);
  const paintOne = (el, i) => {
    const intro = el.classList.contains('tab-intro'), r = el.getBoundingClientRect();
    return paintTablet(el.querySelector('.tab-art'), r.width, r.height, { ansae: intro && wide, ear: intro ? Math.min(46, stonePx * 7) : 0, stonePx, rows: 4, seed: 3 + i * 7, dpr })
      .then(() => el.classList.add('is-painted'));
  };
  // the intro tablet before the first screen is shown; the rest (below the fold) just after
  const paintAll = async (firstOnly) => {
    await paintOne(tablets[0], 0);
    const rest = () => Promise.all(tablets.slice(1).map((el, k) => paintOne(el, k + 1))).then(() => paintFrieze(document.querySelector('.frieze'), stonePx, dpr));
    if (firstOnly) { tabletsDone = new Promise(res => setTimeout(() => rest().then(res), 30)); return; }
    tabletsDone = rest(); return tabletsDone;
  };
  let lastWidths = '';
  const ro = new ResizeObserver(() => {
    const key = tablets.map(t => `${Math.round(t.getBoundingClientRect().width)}x${Math.round(t.getBoundingClientRect().height)}`).join(',');
    if (key !== lastWidths) { lastWidths = key; clearTimeout(ro.t); ro.t = setTimeout(() => paintAll(false), 160); }
  });

  const stage = await createStage({
    root, wallCanvas: root.querySelector('.apse-wall'), archCanvas: root.querySelector('.apse-arch'), conchCanvas: root.querySelector('.apse-conch'), glintCanvas: root.querySelector('.apse-glint'),
    frontEl: root.querySelector('.apse-front'), backEl: root.querySelector('.apse-back'), laneEl, sections: [...laneEl.querySelectorAll('.place')],
    header: document.querySelector('.site-header'), captionEl: root.querySelector('.apse-caption'), hooks, still,
    onLayout: G => {
      const s = document.documentElement.style, u = G.u;
      s.setProperty('--band', G.bandH + 'px');
      s.setProperty('--conch-w', Math.round(2 * 500 * u) + 'px');
      s.setProperty('--tab-w', Math.round(2 * 530 * u) + 'px');
      s.setProperty('--cornice-y', (G.cy + G.F * u) + 'px');
      s.setProperty('--cornice-h', (46 * u) + 'px');
      stonePx = Math.max(4.6, Math.min(7.4, u * 1000 / 132)); wide = G.corners;
      s.setProperty('--stone', stonePx + 'px');
    },
    onChange: info => { root.querySelector('.apse-conch').setAttribute('aria-label', info.alt); },
    onReady: async light => {
      clock.textContent = `It’s ${light.label} in San Jose now.`;
      await document.fonts.ready;
      await paintAll(hooks.t == null);
      if (hooks.t != null) await tabletsDone;
      lastWidths = tablets.map(t => `${Math.round(t.getBoundingClientRect().width)}x${Math.round(t.getBoundingClientRect().height)}`).join(',');
      tablets.forEach(t => ro.observe(t));
      root.classList.add('is-live');
      setTimeout(() => { window.__ready = true; }, hooks.t != null ? 80 : 0);
    },
  });
  // tilt on phones: straight away where allowed, behind a button where the browser asks first (iOS)
  const tiltBtn = laneEl.querySelector('.tilt');
  if (!still && matchMedia('(pointer: coarse)').matches && 'DeviceOrientationEvent' in window) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      tiltBtn.hidden = false;
      tiltBtn.addEventListener('click', async () => { try { if (await DeviceOrientationEvent.requestPermission() === 'granted') { stage.enableTilt(); tiltBtn.hidden = true; } } catch (e) { tiltBtn.hidden = true; } });
    } else stage.enableTilt();
  }
}
start();
