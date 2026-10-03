// Print the still of the poem's figure (the sgraffito cup on its wheel), with the same code
// the page runs once the figure is on screen:
//
//   public/images/notes/nobody-owes-anything-now/wheel-1040.webp   1040×832 (2× of the desktop size)
//   public/images/notes/nobody-owes-anything-now/wheel-520.webp    520×416
//
// Vercel's build has no browser, so run `node scripts/publishing/render-poem-art.mjs` after
// changing src/pages/notes/nobody-owes-anything-now/art/ and keep the generated images.
// The cover is printed with the other covers: npm run render:covers -- nobody-owes-anything-now
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const outDir = resolve(root, 'public/images/notes/nobody-owes-anything-now');
const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
try {
  await mkdir(outDir, { recursive: true });
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('page error:', error.message));
  await page.goto(new URL('scripts/publishing/render-poem-art.html?w=100', server.resolvedUrls.local[0]).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  for (const width of [1040, 520]) {
    const dataUrl = await page.evaluate(w => window.renderStill(w), width);
    await writeFile(resolve(outDir, `wheel-${width}.webp`), Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log(`wrote public/images/notes/nobody-owes-anything-now/wheel-${width}.webp`);
  }
} finally {
  await browser.close();
  await server.close();
}
