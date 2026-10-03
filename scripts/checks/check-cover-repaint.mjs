// Checks that every cover's living detail stays inside its repaint box: each frame drawn
// incrementally (only the box repainted) must match the same frame drawn in full.
// A box that is too small leaves stale pixels, like the GPT-7 hands of October 2026.
//
// Usage: start a dev server (CHOKIDAR_USEPOLLING=true npx vite --port 5190 --force), then
//        node scripts/checks/check-cover-repaint.mjs [http://localhost:5190]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:5190';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/writing`, { waitUntil: 'networkidle' });
const results = await page.evaluate(async () => {
  const { printCover } = await import('/src/components/art/covers/renderer.js');
  const { coverLoaders } = await import('/src/components/art/covers/registry.js');
  const out = {};
  for (const slug of Object.keys(coverLoaders)) {
    const W = 360, H = 540, a = document.createElement('canvas'), b = document.createElement('canvas');
    const A = await printCover(slug, a, W, H), B = await printCover(slug, b, W, H);
    const xa = a.getContext('2d'), xb = b.getContext('2d');
    A.draw(0, true);
    let worst = 0;
    for (let i = 1; i <= 48; i++) {
      const t = i * 0.37; A.draw(t, false); B.draw(t, true);
      const da = xa.getImageData(0, 0, W, H).data, db = xb.getImageData(0, 0, W, H).data;
      let n = 0;
      for (let k = 0; k < da.length; k += 4) if (Math.abs(da[k] - db[k]) + Math.abs(da[k + 1] - db[k + 1]) + Math.abs(da[k + 2] - db[k + 2]) > 24) n++;
      worst = Math.max(worst, n);
    }
    out[slug] = worst;
  }
  return out;
});
await browser.close();
const bad = Object.entries(results).filter(([, n]) => n > 0);
for (const [slug, n] of Object.entries(results)) console.log(`${n ? 'STALE' : 'ok   '} ${slug}${n ? ` (${n} stale pixels)` : ''}`);
if (bad.length) { console.error(`${bad.length} cover(s) repaint outside their box.`); process.exit(1); }
console.log('Every cover repaints cleanly.');
