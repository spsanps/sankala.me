// Check the built site, local media and both crawler responses after a move.
// Run npm run build first, then npm run check:site.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';
import handler from '../../api/og.js';
import { works } from '../../src/data/work.js';
import { coverLoaders } from '../../src/components/art/covers/registry.js';
import { LINES as POEM_LINES, STANZAS as POEM_STANZAS } from '../../src/pages/notes/nobody-owes-anything-now/poem.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const server = await preview({
  root,
  configFile: false,
  logLevel: 'error',
  preview: { host: '127.0.0.1', port: 0, open: false },
});
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const routes = ['/', '/work', '/writing', '/projects', '/resume', '/notes', '/lab', '/history', '/research', '/about', '/notes/startr-postmortem', '/notes/zinify', '/notes/power-quality', '/notes/nobody-owes-anything-now', '/essays/gpt7-will-have-arms', '/notes/eai-challenge'];
const POEM = '/notes/nobody-owes-anything-now';
// Essays whose hand-made figure must mount: the route and the figure's canvas.
const figures = [['/notes/startr-postmortem', '#game-figure canvas'], ['/notes/zinify', '#zfig canvas'], ['/notes/power-quality', '#scope canvas'], ['/notes/eai-challenge', '#fig-loop canvas'], [POEM, '.poem-figure canvas']];
const writingCount = works.filter(work => work.formats.includes('writing')).length;
const assets = new Set(['/documents/resume.pdf', '/essays/gpt7-will-have-arms.md', '/notes/eai-challenge.md', '/notes/zinify.md', '/notes/power-quality.md', '/notes/nobody-owes-anything-now.md', '/fonts/essays/provenance.json', '/toys/bee-sim/index.html']);
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
      assert.equal((await page.locator('h1').innerText()).trim(), 'Writing & projects', `Old route shows the Writing & projects page: ${route}`);
      assert.equal(await page.getByRole('button', { name: new RegExp('^' + label) }).getAttribute('aria-pressed'), 'true', `Old route is pre-filtered: ${route}`);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.sankala.me/work', `Old route points search engines at /work: ${route}`);
    }
    await page.goto(origin + '/notes/2', { waitUntil: 'networkidle' });
    assert.ok(page.url().endsWith('/notes/startr-postmortem'), 'Preserve numeric StartR URL');
    await page.goto(origin + '/history', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-milestone]').count(), 10, 'Complete history');
    await page.goto(origin + '/this-route-does-not-exist', { waitUntil: 'networkidle' });
    assert.ok((await page.locator('h1').innerText()).includes('isn’t here'), 'Meaningful missing-page state');
    // A new visitor can reach actual work and return without decoding a menu.
    // The homepage: the desk in four places, all ten milestones with their photographs, the covers.
    await page.goto(origin + '/');
    await page.locator('[data-milestone]').first().waitFor();
    assert.equal(await page.locator('[data-frame]').count(),4,'Four places on the homepage');
    assert.equal(await page.locator('[data-milestone]').count(),10,'All history on homepage');
    for (const id of ['eai-challenge','ebay-research','ucsd-graduation','zinify','startr','ebay-internship','ebay-ml-challenge','ucsd-start','texas-instruments','nitk']) assert.equal(await page.locator(`#history-${id}`).count(),1,`History anchor kept: ${id}`);
    assert.ok(await page.locator('.ff-still').evaluate(image => image.complete && image.naturalWidth > 0),'Static picture of the desk loads');
    assert.equal(await page.locator('.ff-print').count(),8,'Career photos on the homepage');
    await page.locator('.ff-print').first().evaluate(link => link.click());
    assert.ok(await page.getByRole('dialog',{name:'Photograph'}).isVisible(),'Photo enlarges');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(),0,'Photo closes with Escape');
    assert.equal(await page.locator('.home-covers li').count(),works.filter(work => work.slug in coverLoaders).length,'Every cover on the homepage shelf');
    for (const hash of ['history','writing','projects','latest']) assert.equal(await page.locator(`#${hash}`).count(),1,`Legacy home anchor: #${hash}`);
    const nav = page.getByRole('navigation', { name: 'Main', exact: true });
    assert.equal(await nav.getByRole('link').count(), 4, `Four destinations in the menu at ${width}`);
    for (const label of ['Writing & projects', 'Timeline', 'About', 'CV']) {
      assert.ok(await nav.getByRole('link', { name: label, exact: true }).isVisible(), `Visible destination: ${label} at ${width}`);
    }
    await nav.getByRole('link', { name: 'Writing & projects', exact: true }).click();
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
    assert.equal(await page.locator('[data-milestone]').count(), 10, 'History remains easy to reach from About');
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

  const workHtml = await (await fetch(origin + '/work/')).text();
  assert.ok(workHtml.includes('<h1>Writing &amp; projects</h1>'), 'Prerendered Work page');
  for (const work of works) assert.ok(workHtml.includes(work.displayTitle.replaceAll('&', '&amp;')), `Prerendered Work page lists: ${work.title}`);

  for (const asset of assets) {
    const response = await fetch(origin + asset);
    assert.equal(response.status, 200, `Missing public file: ${asset}`);
    const type = response.headers.get('content-type') || '';
    if (!asset.endsWith('.html')) assert.ok(!type.includes('text/html'), `SPA fallback instead of a file: ${asset}`);
    assert.ok((await response.arrayBuffer()).byteLength > 0, `Empty public file: ${asset}`);
  }

  for (const [key, title] of [['gpt7', 'GPT-7 Will Have Arms'], ['eai', 'Winning by Overfitting']]) {
    const response = await handler(new Request(`${origin}/api/og?page=${key}`, { headers: { 'user-agent': 'Twitterbot' } }));
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.ok(html.includes(`<h1>${title}</h1>`) && html.includes('<article>'), `Crawler article missing: ${key}`);
  }
  const browserResponse = await handler(new Request(`${origin}/api/og?page=gpt7`, { headers: { 'user-agent': 'Mozilla/5.0' } }));
  assert.ok((await browserResponse.text()).includes('type="module"'), 'Regular visitors must receive the app shell');

  const reportArg = process.argv.indexOf('--report');
  if (reportArg >= 0) await writeFile(process.argv[reportArg + 1], JSON.stringify(report, null, 2) + '\n');
  console.log(`Passed: ${report.length} page checks, fallback routing, ${assets.size} public files, both crawler articles and the browser shell.`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
