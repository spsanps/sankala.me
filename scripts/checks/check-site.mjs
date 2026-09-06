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
const routes = ['/', '/resume', '/notes', '/lab', '/essays/gpt7-will-have-arms', '/notes/eai-challenge'];
const assets = new Set(['/documents/resume.pdf', '/essays/gpt7-will-have-arms.md', '/notes/eai-challenge.md', '/toys/bee-sim/index.html']);
const report = [];
let browser;

try {
  browser = await chromium.launch();
  for (const width of [1440, 390]) {
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
      assert.deepEqual(errors, [], `Browser errors: ${route}`);
      const localAssets = await page.locator('img[src], source[src], video[src], iframe[src]').evaluateAll(elements =>
        elements.map(element => element.getAttribute('src')).filter(src => src?.startsWith('/')));
      localAssets.forEach(asset => assets.add(asset));
      report.push({ route, width, title: await page.title(), heading, text: await page.locator('body').innerText() });
    }
    await page.goto(origin + '/this-route-does-not-exist');
    await page.waitForURL(origin + '/');
    await page.close();
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
