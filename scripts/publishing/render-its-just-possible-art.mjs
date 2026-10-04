// Print the stills of the flight-map figure in "It's just possible", with the same code the page
// runs once the figure is on screen (the opening moment, Sunday 18:10 UTC):
//
//   public/images/notes/its-just-possible/flight-map-1400.webp   desktop, 2x
//   public/images/notes/its-just-possible/flight-map-700.webp    desktop, 1x
//   public/images/notes/its-just-possible/flight-map-phone-760.webp   phones (larger labels), 2x
//
// Vercel's build has no browser, so run `node scripts/publishing/render-its-just-possible-art.mjs`
// after changing src/pages/notes/its-just-possible/flight/ and keep the generated images.
// The cover is printed with the other covers: npm run render:covers -- its-just-possible
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const outDir = resolve(root, 'public/images/notes/its-just-possible');
const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
try {
  await mkdir(outDir, { recursive: true });
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('page error:', error.message));
  await page.goto(new URL('scripts/publishing/render-its-just-possible-art.html?w=100', server.resolvedUrls.local[0]).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  for (const [name, width, small] of [['flight-map-1400', 1400, false], ['flight-map-700', 700, false], ['flight-map-phone-760', 760, true]]) {
    const dataUrl = await page.evaluate(([w, s]) => window.renderStill(w, s), [width, small]);
    await writeFile(resolve(outDir, `${name}.webp`), Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log(`wrote public/images/notes/its-just-possible/${name}.webp`);
  }
} finally {
  await browser.close();
  await server.close();
}
