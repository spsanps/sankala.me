// Print the homepage desk to static images, using the same code the homepage runs.
//
//   public/images/home/desk-wide-{1x,2x}.webp    the wide layout: art square at the right, wall to
//                                                 the left and above (2500 × 1500 art units)
//   public/images/home/desk-tall-{1x,2x}.webp    the phone layout (1400 × 1042 art units)
//   public/images/home/plain-<place>-{700,1400}.webp   each place, for the plain version
//   public/images/home/social.jpg                1200×630 share card
//
// The homepage shows these first (and to crawlers, readers without JavaScript, and readers who
// prefer reduced motion), then swaps in the live painting. They are positioned by the same
// numbers as the live layout (src/pages/home/four-frames/stage.js and src/styles/home.css), so
// keep the bounds here in step with those. Vercel's build has no browser: run
// `npm run render:home` after changing the drawing, and keep the generated images.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const outDir = resolve(root, 'public/images/home');
const WIDE = { xMin: -1500, xMax: 1000, yMin: -500, yMax: 1000 };
const TALL = { xMin: -350, xMax: 1050, yMin: -300, yMax: 742 };
const PLAIN = { xMin: -20, xMax: 1000, yMin: 60, yMax: 1000 };
const jobs = [
  ['desk-wide-1x.webp', { mode: 'wide', u: .9, bounds: WIDE }],
  ['desk-wide-2x.webp', { mode: 'wide', u: 1.8, bounds: WIDE, q: .8 }],
  ['desk-tall-1x.webp', { mode: 'tall', u: .6, bounds: TALL }],
  ['desk-tall-2x.webp', { mode: 'tall', u: 1.2, bounds: TALL, q: .8 }],
  ...['now', 'sd', 'blr', 'nitk'].flatMap(era => [
    [`plain-${era}-700.webp`, { mode: 'wide', era, u: 700 / 1020, bounds: PLAIN }],
    [`plain-${era}-1400.webp`, { mode: 'wide', era, u: 1400 / 1020, bounds: PLAIN, q: .8 }],
  ]),
];

const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
try {
  await mkdir(outDir, { recursive: true });
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('page error:', error.message));
  await page.goto(new URL('scripts/publishing/render-home.html', server.resolvedUrls.local[0]).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const write = (name, dataUrl) => writeFile(resolve(outDir, name), Buffer.from(dataUrl.split(',')[1], 'base64'));
  for (const [name, opts] of jobs) {
    const out = await page.evaluate(o => window.renderStill(o), opts);
    await write(name, out.data);
    console.log(`${name}: ${out.width}×${out.height}, painted in ${out.ms} ms`);
  }
  await write('social.jpg', (await page.evaluate(() => window.renderSocial())).data);
  console.log('social.jpg: 1200×630');
} finally {
  await browser.close();
  await server.close();
}
