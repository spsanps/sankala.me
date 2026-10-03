// Print every code-drawn cover to static images, using the same code the site runs.
//
//   public/images/covers/<slug>.webp          720×1080, the shelf print (2×)
//   public/images/covers/<slug>-360.webp      360×540, the shelf print (1×)
//   public/images/covers/<slug>-thumb.webp    160×240, archive thumbnails
//   public/images/covers/<slug>-social.jpg    1200×630 share card (every cover except GPT-7)
//
// Vercel's build has no browser, so run `npm run render:covers` after changing a cover and
// keep the generated images. Pass slugs to print only some: npm run render:covers -- zinify
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { coverLoaders } from '../../src/components/art/covers/registry.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const outDir = resolve(root, 'public/images/covers');
const only = process.argv.slice(2);
const slugs = Object.keys(coverLoaders).filter(slug => !only.length || only.includes(slug));

const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
try {
  await mkdir(outDir, { recursive: true });
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('page error:', error.message));
  await page.goto(new URL('scripts/publishing/render-covers.html', server.resolvedUrls.local[0]).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  const write = (name, dataUrl) => writeFile(resolve(outDir, name), Buffer.from(dataUrl.split(',')[1], 'base64'));
  for (const slug of slugs) {
    const out = await page.evaluate(s => window.renderCover(s), slug);
    await write(`${slug}.webp`, out.cover);
    await write(`${slug}-360.webp`, out.c360);
    await write(`${slug}-thumb.webp`, out.thumb);
    if (out.social) await write(`${slug}-social.jpg`, out.social);
    console.log(`${slug}: printed in ${out.buildMs} ms${out.social ? ', with share card' : ''}`);
  }
} finally {
  await browser.close();
  await server.close();
}
