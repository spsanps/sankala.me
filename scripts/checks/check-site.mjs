// Check the built site, local media and both crawler responses after a move.
// Run npm run build first, then npm run check:site.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';
import handler from '../../api/og.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const server = await preview({
  root,
  configFile: false,
  logLevel: 'error',
  preview: { host: '127.0.0.1', port: 0, open: false },
});
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const routes = ['/', '/resume', '/notes', '/lab', '/history', '/research', '/about', '/notes/startr-postmortem', '/essays/gpt7-will-have-arms', '/notes/eai-challenge'];
const assets = new Set(['/documents/resume.pdf', '/essays/gpt7-will-have-arms.md', '/notes/eai-challenge.md', '/toys/bee-sim/index.html']);
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
    await page.goto(origin + '/notes');
    assert.equal(await page.locator('[data-work]').count(), 8, 'Complete archive');
    await page.getByLabel('Subject').selectOption('ai');
    await page.getByRole('combobox', { name: /^Format/ }).selectOption('research');
    assert.equal(await page.locator('[data-work]').count(), 3, 'Combined research and AI filters');
    await page.getByRole('searchbox').fill('ZINify');
    assert.equal(await page.locator('[data-work]').count(), 1, 'Combined search');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-work]').count(), 1, 'Filters survive a reload');
    await page.getByRole('searchbox').fill('no-such-project');
    assert.equal(await page.locator('[data-work]').count(), 0, 'Empty state');
    await page.getByRole('button', { name: 'Show all work' }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-work]').length === 8, null, { timeout: 5000 });
    assert.equal(await page.locator('[data-work]').count(), 8, 'Reset clears all filters');
    await page.goto(origin + '/notes/2', { waitUntil: 'networkidle' });
    assert.ok(page.url().endsWith('/notes/startr-postmortem'), 'Preserve numeric StartR URL');
    await page.goto(origin + '/history', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-milestone]').count(), 10, 'Complete history');
    await page.goto(origin + '/this-route-does-not-exist', { waitUntil: 'networkidle' });
    assert.ok((await page.locator('h1').innerText()).includes('isn’t here'), 'Meaningful missing-page state');
    if(width < 700) {
      await page.getByText('Menu +', { exact: true }).click();
      await page.getByText('Menu +', { exact: true }).press('Escape');
      assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null, 'Escape closes mobile navigation');
    }
    await page.close();
  }

  for (const route of routes.filter(path => !['/essays/gpt7-will-have-arms','/notes/eai-challenge'].includes(path))) {
    const html = await (await fetch(origin + route)).text();
    assert.ok(html.includes('<h1>') || html.includes('<h1 '), `Prerendered page content: ${route}`);
    assert.equal((html.match(/<title\b/g) || []).length, 1, `One server-rendered title: ${route}`);
    assert.ok(html.includes('rel="canonical"'), `Canonical in initial HTML: ${route}`);
  }

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
