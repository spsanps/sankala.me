// Print the small pieces of code-drawn art used outside the homepage, with the same drawing code
// as the prototypes they come from:
//
//   public/images/history/places/<place>.webp, <place>-2x.webp   window views that open each
//                                                                 place on /history (Four frames kit)
//   public/images/not-found/telescope.webp, telescope-2x.webp     the 404 scene (Four frames kit)
//   public/images/projects/capricious-god-title.webp, -2x.webp    the Paper Robots slot on /projects
//                                                                 (the film's code-drawn title card)
//
// Vercel's build has no browser, so run `node scripts/publishing/render-site-art.mjs` after changing any of these and
// keep the generated images. The drawing code lives in design/prototypes/2026-10-code-drawn-art/.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const PLACES = [['san-jose', 'now'], ['san-diego', 'sd'], ['bengaluru', 'blr'], ['surathkal', 'nitk']];
const write = async (path, dataUrl) => {
  const file = resolve(root, 'public/images', path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', 'public/images/' + path);
};
// Chromium encodes canvas images as WebP; re-encode the harness PNGs through a canvas.
const toWebp = (page, png, quality = .9) => page.evaluate(async ([src, q]) => {
  const im = new Image(); im.src = src; await im.decode();
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', q);
}, [png, quality]);

const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('page error:', error.message));

  // History: each place at the light it is remembered by; San Jose on a clear afternoon.
  await page.goto(new URL('scripts/publishing/render-site-art.html?hour=15.5', base).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  for (const [name, era] of PLACES) {
    for (const [suffix, width] of [['', 320], ['-2x', 640]]) {
      const png = await page.evaluate(([e, w]) => window.renderPlace(e, w), [era, width]);
      await write(`history/places/${name}${suffix}.webp`, await toWebp(page, png));
    }
  }

  // 404: San Jose late at night.
  await page.goto(new URL('scripts/publishing/render-site-art.html?hour=22.5', base).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  for (const [suffix, width] of [['', 420], ['-2x', 840]]) {
    const png = await page.evaluate(w => window.renderNotFound(w), width);
    await write(`not-found/telescope${suffix}.webp`, await toWebp(page, png));
  }

  // Projects: the Capricious God title card, gold laid and the eye open (its still moment).
  const film = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  film.on('pageerror', error => console.error('page error:', error.message));
  await film.goto(new URL('design/prototypes/2026-10-code-drawn-art/paper-robots-made/index.html?t=5.6', base).href);
  await film.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const card = await film.evaluate(() => {
    // build the title card at its real size with the kit's own renderer (as its Save PNG does)
    const W = 1280, H = 720, src = document.createElement('canvas'); src.width = W; src.height = H;
    const g = FILM2.build('title', W, H); let r; do { r = g.next(); } while (!r.done);
    FILM2.draw(r.value, src.getContext('2d'), FILM2.still);
    const out = (w) => { const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * H / W);
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height); return c.toDataURL('image/webp', .9); };
    return { size: [W, H], big: out(W), small: out(640) };
  });
  console.log('title card canvas', card.size.join('×'));
  await write('projects/capricious-god-title-2x.webp', card.big);
  await write('projects/capricious-god-title.webp', card.small);
} finally {
  await browser.close();
  await server.close();
}
