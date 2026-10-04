// Print the stills of the IROS essay's diagrams, with the same code the page runs once they are on screen:
//
//   public/images/notes/iros-2026-origami/folds-wide-{640,1280}.webp     the five folds, step 1 (desktop)
//   public/images/notes/iros-2026-origami/folds-narrow-{548,1096}.webp    the same, cropped for phones
//   public/images/notes/iros-2026-origami/lift-{460,920}.webp             lifting a corner
//
// Vercel's build has no browser, so run `node scripts/publishing/render-iros-art.mjs` after changing
// src/pages/notes/iros-2026-origami/art/ and keep the images. The cover is printed with the other covers:
// npm run render:covers -- iros-2026-origami. Opened in the dev server, render-iros-art.html shows any frame.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const outDir = resolve(root, 'public/images/notes/iros-2026-origami');
const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
try {
  await mkdir(outDir, { recursive: true });
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('page error:', error.message));
  await page.goto(new URL('scripts/publishing/render-iros-art.html?show=none', server.resolvedUrls.local[0]).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  for (const [kind, name, widths] of [['wide', 'folds-wide', [640, 1280]], ['narrow', 'folds-narrow', [548, 1096]], ['lift', 'lift', [460, 920]]]) {
    for (const width of widths) {
      const dataUrl = await page.evaluate(([k, w]) => window.renderStill(k, w), [kind, width]);
      await writeFile(resolve(outDir, `${name}-${width}.webp`), Buffer.from(dataUrl.split(',')[1], 'base64'));
      console.log(`wrote public/images/notes/iros-2026-origami/${name}-${width}.webp`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
