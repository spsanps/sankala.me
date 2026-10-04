// Check the built site, local media and both crawler responses after a move.
// Run npm run build first, then npm run check:site.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';
import handler from '../../api/og.js';
import { works } from '../../src/data/work.js';
import milestones from '../../src/data/history.json' with { type: 'json' };
import { coverLoaders } from '../../src/components/art/covers/registry.js';
import { LINES as POEM_LINES, STANZAS as POEM_STANZAS } from '../../src/pages/notes/nobody-owes-anything-now/poem.js';
import { parseEssay, essayPieces } from '../../src/pages/notes/its-just-possible/essay-source.js';
import { OPENING as FLIGHT_OPENING } from '../../src/pages/notes/its-just-possible/flight/timeline.js';
import { PATH as IROS, TITLE as IROS_TITLE, MODEL_URL, VIDEO, markdownMirror } from '../../src/pages/notes/iros-2026-origami/essay-meta.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
// Counts follow the data, so a new milestone or photograph needs no edit here.
const careerPhotos = milestones.reduce((n, m) => n + m.images.length, 0);
const irosEssay = await readFile(new URL('../../src/pages/notes/iros-2026-origami/essay.md', import.meta.url), 'utf8');
const server = await preview({
  root,
  configFile: false,
  logLevel: 'error',
  preview: { host: '127.0.0.1', port: 0, open: false },
});
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const routes = ['/', '/work', '/writing', '/projects', '/resume', '/notes', '/lab', '/history', '/research', '/about', '/notes/startr-postmortem', '/notes/zinify', '/notes/power-quality', '/notes/nobody-owes-anything-now', '/notes/its-just-possible', '/essays/gpt7-will-have-arms', '/notes/eai-challenge', '/notes/iros-2026-origami'];
const POEM = '/notes/nobody-owes-anything-now';
// "It's just possible": its paragraphs, read from the one Markdown source, must reach every edition.
const ESSAY = '/notes/its-just-possible';
const essay = parseEssay(await readFile(new URL('../../src/pages/notes/its-just-possible/essay.md', import.meta.url), 'utf8'));
const essayParagraphs = essay.body.split('\n\n').filter(block => /^[A-Z]/.test(block) && !/[*[`]/.test(block));
const essayParts = essayPieces(essay.body), partCount = type => essayParts.filter(piece => piece.type === type).length;
// Essays whose hand-made figure must mount: the route and the figure's canvas.
const figures = [['/notes/startr-postmortem', '#game-figure canvas'], ['/notes/zinify', '#zfig canvas'], ['/notes/power-quality', '#scope canvas'], ['/notes/eai-challenge', '#fig-loop canvas'], [POEM, '.poem-figure canvas'], [ESSAY, '#flight canvas'], [IROS, '.iros-folds canvas'], [IROS, '.iros-lift canvas']];
const writingCount = works.filter(work => work.formats.includes('writing')).length;
const assets = new Set(['/documents/resume.pdf', '/essays/gpt7-will-have-arms.md', '/notes/eai-challenge.md', '/notes/zinify.md', '/notes/power-quality.md', '/notes/nobody-owes-anything-now.md', '/notes/its-just-possible.md', '/fonts/essays/provenance.json', '/toys/bee-sim/index.html', '/notes/iros-2026-origami.md', MODEL_URL, VIDEO.poster]);
const report = [];
let browser;

try {
  browser = await chromium.launch();
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      return url.origin === origin ? route.continue() : route.abort();
    });
    let errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of routes) {
      errors = [];
      const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      const heading = (await page.locator('h1').allTextContents()).map(text => text.trim());
      assert.ok(heading.some(Boolean), `Missing page heading: ${route}`);
      if (route !== '/essays/gpt7-will-have-arms') assert.equal(heading.length, 1, `Duplicate page headings: ${route}`);
      assert.deepEqual(errors, [], `Browser errors: ${route}`);
      if (!route.includes('gpt7-will-have-arms')) assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow: ${route} at ${width}`);
      const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => image.complete && !image.naturalWidth).map(image => image.src));
      assert.deepEqual(brokenImages, [], `Broken images: ${route}`);
      const localAssets = await page.locator('img[src], source[src], video[src], iframe[src]').evaluateAll(elements =>
        elements.map(element => element.getAttribute('src')).filter(src => src?.startsWith('/')));
      localAssets.forEach(asset => assets.add(asset));
      report.push({ route, width, title: await page.title(), heading, text: await page.locator('body').innerText() });
    }
    // Each essay's figure mounts: its canvas gets drawn at a real size, without errors.
    for (const [route, selector] of figures) {
      errors = [];
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      const canvas = page.locator(selector).first();
      await canvas.scrollIntoViewIfNeeded();
      // drawn at its displayed size, not left at the browser's default 300×150 canvas
      await page.waitForFunction(sel => { const c = document.querySelector(sel); return c && c.clientWidth > 100 && c.width >= c.clientWidth * 0.9 && c.height >= c.clientHeight * 0.9; }, selector, { timeout: 15000 });
      assert.deepEqual(errors, [], `Figure errors: ${route} at ${width}`);
    }
    // The poem: every line of it, in San's stanzas, with its cover below it.
    await page.goto(origin + POEM, { waitUntil: 'networkidle' });
    const poemLines = (await page.locator('.poem').innerText()).split('\n').map(line => line.trim()).filter(Boolean);
    assert.deepEqual(poemLines, POEM_LINES.map(line => line.trim()), `The whole poem, line by line, at ${width}`);
    assert.equal(await page.locator('.poem .stanza').count(), POEM_STANZAS.length, `Every stanza at ${width}`);
    assert.equal(await page.locator('.poem .line.turn').count(), POEM_LINES.filter(line => line.startsWith(' ')).length, `Continuation lines stand in at ${width}`);
    const poemCover = page.locator('.poem-cover img');
    await poemCover.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => { const img = document.querySelector('.poem-cover img'); return img && img.complete && img.naturalWidth > 0; }, null, { timeout: 10000 });
    assert.ok((await poemCover.getAttribute('src')).includes('/images/covers/nobody-owes-anything-now'), `The poem's cover at ${width}`);
    assert.ok(await page.locator('.poem-figure img').evaluate(image => image.complete && image.naturalWidth > 0), `The poem's still figure loads at ${width}`);

    // The essay: every paragraph on the page, its cover beside the title.
    await page.goto(origin + ESSAY, { waitUntil: 'networkidle' });
    const essayText = (await page.locator('article').innerText()).replace(/\s+/g, ' ');
    for (const paragraph of essayParagraphs) assert.ok(essayText.includes(paragraph.replace(/\s+/g, ' ')), `Essay paragraph on the page at ${width}: ${paragraph.slice(0, 50)}`);
    assert.equal((await page.locator('h1').innerText()).trim(), essay.meta.title, `Essay title at ${width}`);
    assert.ok(await page.locator('.frontispiece img').evaluate(image => image.complete && image.naturalWidth > 0), `The essay's cover loads at ${width}`);
    assert.equal(await page.locator('article a[href="/notes/iros-2026-origami"]').count(), 1, `The origami story link at ${width}`);
    // the quoted messages and prompts are set as screens, every message named by its sender
    assert.equal(await page.locator('blockquote.ijp-chat').count(), partCount('chat'), `Message cards at ${width}`);
    assert.equal(await page.locator('blockquote.ijp-prompt').count(), partCount('prompt') + partCount('notes'), `Prompt and note cards at ${width}`);
    const senders = essayParts.filter(piece => piece.type === 'chat').flatMap(piece => piece.messages.map(m => m.sender));
    assert.deepEqual(await page.locator('.ijp-chat .ijp-sender').allInnerTexts(), senders.map(name => name.toUpperCase()), `Every sender named at ${width}`);
    // the flight figure: its still first, then the live map; the panel follows the keyboard
    const flight = page.locator('#flight');
    await flight.scrollIntoViewIfNeeded();
    assert.ok(await flight.locator('img').evaluate(image => image.complete && image.naturalWidth > 0), `The flight map's still loads at ${width}`);
    assert.equal(await flight.locator('input[type=range]').inputValue(), String(FLIGHT_OPENING), `The figure opens on Sunday 18:10 at ${width}`);
    assert.ok((await flight.locator('.ijp-readouts').innerText()).includes('#1'), `The panel reads first place at ${width}`);
    await flight.locator('input[type=range]').focus();
    await page.keyboard.press('Home');
    assert.ok((await flight.locator('.ijp-readouts').innerText()).includes('Fri 25 Sep · 00:00'), `Home flies back to Friday at ${width}`);
    await flight.locator('button[aria-label="Next waypoint"]').click();
    assert.ok((await flight.locator('.ijp-message-body').innerText()).includes('82.3 is not reachable'), `The first waypoint's message at ${width}`);
    assert.ok((await flight.locator('figcaption').innerText()).includes('The plane’s position is time, not GPS.'), `The figure's caption at ${width}`);

    // One Work page: every work, plain filters, search; the old index routes show it filtered.
    await page.goto(origin + '/work');
    assert.equal(await page.locator('[data-work]').count(), works.length, 'Every work on the Work page');
    await page.getByRole('button', { name: /^Research/ }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-work]').length === 3, null, { timeout: 5000 });
    assert.equal(await page.getByRole('button', { name: /^Research/ }).getAttribute('aria-pressed'), 'true', 'Selected filter is announced');
    await page.getByRole('searchbox').fill('ZINify');
    assert.equal(await page.locator('[data-work]').count(), 1, 'Filter and search combine');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-work]').count(), 1, 'Filters survive a reload');
    await page.getByRole('searchbox').fill('no-such-project');
    assert.equal(await page.locator('[data-work]').count(), 0, 'Empty state');
    await page.getByRole('button', { name: 'Show all work' }).click();
    await page.waitForFunction(count => document.querySelectorAll('[data-work]').length === count, works.length, { timeout: 5000 });
    assert.equal(await page.locator('[data-work]').count(), works.length, 'Reset clears all filters');
    for (const [route, label, count] of [['/writing', 'Writing', writingCount], ['/projects', 'Projects', 3], ['/lab', 'Projects', 3], ['/research', 'Research', 3], ['/notes', 'All', works.length], ['/work#films', 'Films', 2]]) {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.waitForFunction(n => document.querySelectorAll('[data-work]').length === n, count, { timeout: 5000 });
      assert.equal((await page.locator('h1').innerText()).trim(), 'Writing & Projects', `Old route shows the Writing & Projects page: ${route}`);
      assert.equal(await page.getByRole('button', { name: new RegExp('^' + label) }).getAttribute('aria-pressed'), 'true', `Old route is pre-filtered: ${route}`);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.sankala.me/work', `Old route points search engines at /work: ${route}`);
    }
    await page.goto(origin + '/notes/2', { waitUntil: 'networkidle' });
    assert.ok(page.url().endsWith('/notes/startr-postmortem'), 'Preserve numeric StartR URL');
    await page.goto(origin + '/history', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-milestone]').count(), milestones.length, 'Complete history');
    await page.goto(origin + '/this-route-does-not-exist', { waitUntil: 'networkidle' });
    assert.ok((await page.locator('h1').innerText()).includes('isn’t here'), 'Meaningful missing-page state');
    // A new visitor can reach actual work and return without decoding a menu.
    // The homepage: the mosaic apse with the desk in four places, every milestone with its
    // photographs, the covers, and the mosaic footer.
    await page.goto(origin + '/');
    await page.locator('[data-milestone]').first().waitFor();
    assert.equal(await page.locator('[data-frame]').count(),4,'Four places on the homepage');
    assert.equal(await page.locator('[data-milestone]').count(),milestones.length,'All history on homepage');
    for (const id of ['iros-2026','eai-challenge','ebay-research','ucsd-graduation','zinify','startr','ebay-internship','ebay-ml-challenge','ucsd-start','texas-instruments','nitk']) assert.equal(await page.locator(`#history-${id}`).count(),1,`History anchor kept: ${id}`);
    // the first paint's stills (wall, conch, the stele's marble, head and frame) all load, and the apse is shown
    const stills = await page.evaluate(async () => {
      const url = (sel, pseudo, prop) => { const el = document.querySelector(sel); const m = el && /url\(["']?([^"')]+)/.exec(getComputedStyle(el, pseudo)[prop]); return m ? m[1] : null; };
      const urls = [url('.apse-back .apse-wall', null, 'backgroundImage'), url('.apse-conch', null, 'backgroundImage'), url('.stele', null, 'backgroundImage'), url('.stele', '::before', 'backgroundImage'), url('.stele', '::after', 'borderImageSource'), url('.apse-back', null, 'backgroundImage')];
      const ok = await Promise.all(urls.map(u => { if (!u) return false; const img = new Image(); img.src = u; return img.decode().then(() => img.naturalWidth > 0, () => false); }));
      return { urls, ok };
    });
    assert.ok(stills.ok.every(Boolean), `Static pictures of the apse load: ${JSON.stringify(stills)}`);
    await page.waitForFunction(() => !document.documentElement.classList.contains('apse-wait'), null, { timeout: 5000 });
    assert.ok(await page.locator('.apse').isVisible(), 'The apse is shown');
    assert.equal(await page.locator('.tab-print').count(),careerPhotos,'Career photos on the homepage');
    assert.equal(await page.locator('nav[aria-label="Footer"] a').count(), 6, `The mosaic footer's links at ${width}`);
    await page.locator('.tab-print').first().evaluate(link => link.click());
    assert.ok(await page.getByRole('dialog',{name:'Photograph'}).isVisible(),'Photo enlarges');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(),0,'Photo closes with Escape');
    assert.equal(await page.locator('.home-covers li').count(),works.filter(work => work.slug in coverLoaders).length,'Every cover on the homepage shelf');
    for (const hash of ['history','writing','projects','latest']) assert.equal(await page.locator(`#${hash}`).count(),1,`Legacy home anchor: #${hash}`);
    const nav = page.getByRole('navigation', { name: 'Main', exact: true });
    assert.equal(await nav.getByRole('link').count(), 4, `Four destinations in the menu at ${width}`);
    for (const label of ['Writing & Projects', 'Timeline', 'About', 'CV']) {
      assert.ok(await nav.getByRole('link', { name: label, exact: true }).isVisible(), `Visible destination: ${label} at ${width}`);
    }
    await nav.getByRole('link', { name: 'Writing & Projects', exact: true }).click();
    await page.locator('[data-work]').first().waitFor();
    await page.getByRole('button', { name: /^Writing/ }).click();
    await page.waitForFunction(n => document.querySelectorAll('[data-work]').length === n, writingCount, { timeout: 5000 });
    await page.getByRole('link', { name: 'How we won an AI-agent competition', exact: true }).click();
    await page.waitForURL('**/notes/eai-challenge');
    assert.ok(page.url().endsWith('/notes/eai-challenge'), 'Work opens the original rich article');
    await page.getByRole('link', { name: 'Back to Writing' }).click();
    await page.waitForFunction(n => document.querySelectorAll('[data-work]').length === n, writingCount, { timeout: 5000 });
    assert.equal(await page.locator('[data-work]').count(), writingCount, 'Article returns to the writing filter');
    await page.getByRole('button', { name: /^Projects/ }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-work]').length === 3, null, { timeout: 5000 });
    assert.equal(await page.getByRole('link', { name: 'Explore the space habitat', exact: false }).getAttribute('href'), 'https://dysonswarm.com/another-sky/', 'Project opens the actual interactive');
    await nav.getByRole('link', { name: 'About', exact: true }).click();
    await page.getByRole('link', { name: 'Timeline', exact: true }).first().click();
    await page.locator('[data-milestone]').first().waitFor();
    assert.equal(await page.locator('[data-milestone]').count(), milestones.length, 'History remains easy to reach from About');
    await page.close();
  }

  // The preview server only reaches <route>/index.html with a trailing slash (Vercel uses rewrites),
  // so ask for that file directly; without the slash it answers every route with the homepage.
  for (const route of routes.filter(path => !['/essays/gpt7-will-have-arms','/notes/eai-challenge'].includes(path))) {
    const html = await (await fetch(origin + (route === '/' ? '/' : route + '/'))).text();
    assert.ok(html.includes('<h1>') || html.includes('<h1 '), `Prerendered page content: ${route}`);
    assert.equal((html.match(/<title\b/g) || []).length, 1, `One server-rendered title: ${route}`);
    assert.ok(html.includes('rel="canonical"'), `Canonical in initial HTML: ${route}`);
  }
  // Crawlers and readers without JavaScript get the whole poem, its share card and its Markdown mirror.
  const poemHtml = await (await fetch(origin + POEM + '/')).text();
  for (const line of POEM_LINES) assert.ok(poemHtml.includes('>' + line.trim() + '<'), `Prerendered poem line: ${line.trim()}`);
  assert.ok(poemHtml.includes('/images/covers/nobody-owes-anything-now-social.jpg'), 'Poem share card');
  assert.ok(poemHtml.includes('/images/covers/nobody-owes-anything-now-360.webp'), 'Poem cover in the prerendered page');
  const poemMarkdown = await (await fetch(origin + POEM + '.md')).text();
  for (const line of POEM_LINES) assert.ok(poemMarkdown.includes(line.trim()), `Markdown mirror line: ${line.trim()}`);
  const feed = await (await fetch(origin + '/feed.xml')).text(), sitemap = await (await fetch(origin + '/sitemap.xml')).text();
  assert.ok(feed.includes('https://www.sankala.me' + POEM + '<'), 'Poem in the RSS feed');
  assert.ok(sitemap.includes('https://www.sankala.me' + POEM + '<'), 'Poem in the sitemap');
  assert.ok(feed.includes('https://www.sankala.me' + IROS + '<') && sitemap.includes('https://www.sankala.me' + IROS + '<'), 'IROS essay in the RSS feed and sitemap');

  // The essay reaches crawlers whole: the prerendered page, its Markdown mirror, RSS, the sitemap and the crawler edition.
  const essayHtml = (await (await fetch(origin + ESSAY + '/')).text()).replaceAll('&#x27;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');
  const essayMarkdown = await (await fetch(origin + ESSAY + '.md')).text();
  for (const paragraph of essayParagraphs) {
    assert.ok(essayHtml.includes(paragraph), `Prerendered essay paragraph: ${paragraph.slice(0, 50)}`);
    assert.ok(essayMarkdown.includes(paragraph), `Markdown mirror paragraph: ${paragraph.slice(0, 50)}`);
  }
  assert.ok(essayHtml.includes('/images/covers/its-just-possible-social.jpg'), 'Essay share card');
  assert.ok(essayHtml.includes('/images/notes/its-just-possible/flight-map-1400.webp') && essayHtml.includes('class="ijp-chat"'), 'The flight map still and the message cards in the prerendered page');
  assert.ok(essayMarkdown.includes('Figure: The last 72 hours, as a flight') && essayMarkdown.includes('Track 2: first, 82.491.'), 'The flight figure as text in the Markdown mirror');
  assert.ok(essayHtml.includes('/images/covers/its-just-possible-360.webp'), 'Essay cover in the prerendered page');
  assert.ok(feed.includes('https://www.sankala.me' + ESSAY + '<'), 'Essay in the RSS feed');
  assert.ok(sitemap.includes('https://www.sankala.me' + ESSAY + '<'), 'Essay in the sitemap');
  const essayReader = await (await handler(new Request(`${origin}/api/og?page=its-just-possible`, { headers: { 'user-agent': 'Mozilla/5.0' } }))).text();
  assert.ok(essayReader.includes('type="module"') && essayReader.includes(essayParagraphs[0].slice(0, 40)), 'Readers of the essay get its prerendered page');

  // The homepage's first paint: its stills and the scripts that choose San Jose's moment and hold
  // the apse until its pictures are in are in the prerendered HTML, with every milestone.
  const homeHtml = await (await fetch(origin + '/')).text();
  assert.ok(homeHtml.includes('data-sj') && homeHtml.includes('apse-wait'), 'First-paint scripts in the prerendered homepage');
  assert.ok(homeHtml.includes('/images/home/wall-side-1x.webp') && homeHtml.includes('/images/home/conch-fine-now-'), 'Homepage stills in the prerendered CSS');
  assert.equal((homeHtml.match(/data-milestone/g) || []).length, milestones.length, 'Every milestone in the prerendered homepage');

  // The IROS essay: every paragraph in the prerendered page, its video and 3D model, an up-to-date Markdown mirror,
  // the share card, the feed and the sitemap.
  const irosHtml = await (await fetch(origin + IROS + '/')).text();
  assert.ok(irosHtml.includes(`<h1>${IROS_TITLE}</h1>`), 'Prerendered IROS essay');
  for (const paragraph of irosEssay.split(/\n\n+/).filter(p => /^[A-Z]/.test(p) && !/[*[_`|]/.test(p))) {
    assert.ok(irosHtml.includes(paragraph.trim().replaceAll('&', '&amp;').replaceAll('"', '&quot;').slice(0, 80)), `Prerendered IROS paragraph: ${paragraph.slice(0, 60)}`);
  }
  assert.ok(irosHtml.includes(`src="${VIDEO.src}"`) && irosHtml.includes(`poster="${VIDEO.poster}"`), 'IROS video with its poster');
  assert.ok(irosHtml.includes(`src="${MODEL_URL}?embed"`), 'IROS 3D model embedded');
  // its two diagrams are in the first paint as stills, with the five folds' words and steps
  for (const still of ['folds-wide-1280.webp', 'folds-narrow-548.webp', 'lift-920.webp']) assert.ok(irosHtml.includes('/images/notes/iros-2026-origami/' + still), `IROS diagram still: ${still}`);
  assert.equal((irosHtml.match(/data-step/g) || []).length, 5, 'The five folds, step by step');
  assert.ok(irosHtml.includes('Only the winning team got here') && irosHtml.includes('My policy, with one assist'), 'Who got how far, in the five folds');
  assert.ok(irosHtml.includes('/images/covers/iros-2026-origami-social.jpg'), 'IROS share card');
  const irosMarkdown = await (await fetch(origin + IROS + '.md')).text();
  assert.equal(irosMarkdown, markdownMirror(irosEssay), 'IROS Markdown mirror is current (node scripts/essays/generate-iros-mirror.mjs)');
  const modelHtml = await (await fetch(origin + MODEL_URL)).text();
  assert.ok(modelHtml.includes('cdn.jsdelivr.net/npm/three@0.160.0/') && modelHtml.includes('illustration'), 'The 3D model page, with three.js pinned and its note on illustrations');

  const workHtml = await (await fetch(origin + '/work/')).text();
  assert.ok(workHtml.includes('<h1>Writing &amp; Projects</h1>'), 'Prerendered Work page');
  for (const work of works) assert.ok(workHtml.includes(work.displayTitle.replaceAll('&', '&amp;')), `Prerendered Work page lists: ${work.title}`);

  for (const asset of assets) {
    const response = await fetch(origin + asset);
    assert.equal(response.status, 200, `Missing public file: ${asset}`);
    const type = response.headers.get('content-type') || '';
    if (!asset.split(/[?#]/)[0].endsWith('.html')) assert.ok(!type.includes('text/html'), `SPA fallback instead of a file: ${asset}`);
    assert.ok((await response.arrayBuffer()).byteLength > 0, `Empty public file: ${asset}`);
  }

  for (const [key, title] of [['gpt7', 'GPT-7 Will Have Arms'], ['eai', 'Winning by Overfitting'], ['its-just-possible', "It's just possible"]]) {
    const response = await handler(new Request(`${origin}/api/og?page=${key}`, { headers: { 'user-agent': 'Twitterbot' } }));
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.ok(html.includes(`<h1>${title}</h1>`) && html.includes('<article>'), `Crawler article missing: ${key}`);
  }
  const browserResponse = await handler(new Request(`${origin}/api/og?page=gpt7`, { headers: { 'user-agent': 'Mozilla/5.0' } }));
  assert.ok((await browserResponse.text()).includes('type="module"'), 'Regular visitors must receive the app shell');

  const reportArg = process.argv.indexOf('--report');
  if (reportArg >= 0) await writeFile(process.argv[reportArg + 1], JSON.stringify(report, null, 2) + '\n');
  console.log(`Passed: ${report.length} page checks, fallback routing, ${assets.size} public files, every crawler article and the browser shell.`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
