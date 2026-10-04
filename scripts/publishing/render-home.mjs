// Print the homepage's mosaic to static images, with the same code its live layer runs
// (src/pages/home/mosaic/). The homepage shows these on its first paint, before any script, and to
// crawlers, readers without JavaScript and readers who prefer reduced motion; the live layer then
// lays the same stones, so nothing moves when it takes over. Vercel's build has no browser: run
// `npm run render:home` after changing the drawing, and commit the images.
//
//   public/images/home/wall-<class>-{1x,2x}.webp      the wall, archivolt and cornice of each layout class
//   public/images/home/conch-<family>-<state>-{1x,2x}.webp   each conch: San Jose in each moment, and the
//                                                    other places (transparent outside the conch)
//   public/images/home/glint-<class>.bin             the wall's gold, gems and some glass, for the light
//   public/images/home/frame-<kind>.webp, stele-<kind>-<width>.webp, courses.webp, frieze-*.webp,
//     loose-*.webp, marble.webp                      the pieces the CSS builds the tablets and walls from
//   public/images/home/social.jpg                    the 1200 × 630 share card
//   src/pages/home/mosaic/stills.json                what the page needs: head sizes, the frame's slice, alt texts
//   design/reviews/2026-10-03-mosaic-home/stills-report.json   every file's size (and laying time)
//
// Options: --only <substring> prints just the matching jobs (the manifest is merged, not replaced).
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHEETS, FAMILIES, FRAMES, conchStates } from '../../src/pages/home/mosaic/layout.js';
import { MOMENT_KEYS } from '../../src/pages/home/mosaic/moments.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const outDir = resolve(root, 'public/images/home');
const manifestPath = resolve(root, 'src/pages/home/mosaic/stills.json');
const reportPath = resolve(root, 'design/reviews/2026-10-03-mosaic-home/stills-report.json');
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg >= 0 ? process.argv[onlyArg + 1] : null;

const PLACE_INDEX = { now: 0, sd: 1, blr: 2, nitk: 3 };
const jobs = [];
for (const cls of Object.keys(SHEETS)) {
  const fam = FAMILIES[SHEETS[cls].family];
  fam.still.forEach((scale, i) => jobs.push({ name: `wall-${cls}-${i + 1}x.webp`, fn: 'renderWall', args: { cls, scale, q: i ? .66 : .78 }, key: ['walls', cls] }));
  jobs.push({ name: `glint-${cls}.bin`, fn: 'wallGlint', args: { cls }, key: ['glint', cls], bin: true });
}
for (const family of Object.keys(FAMILIES)) for (const state of conchStates(MOMENT_KEYS)) {
  const [place, ...rest] = state.split('-'), moment = rest.join('-') || undefined;
  // the 2x stills are only for San Jose (the sharper first screen); the other places' stills serve the
  // still version, which keeps to 1x
  FAMILIES[family].still.forEach((scale, i) => { if (i === 0 || place === 'now') jobs.push({ name: `conch-${family}-${state}-${i + 1}x.webp`, fn: 'renderConch', args: { family, index: PLACE_INDEX[place], moment, scale, q: i ? .66 : .8 }, key: ['conches', family, state] }); });
}
for (const kind of Object.keys(FRAMES)) {
  jobs.push({ name: `frame-${kind}.webp`, fn: 'renderTile', args: { name: 'frameTile', args: { kind }, q: .86 }, key: ['frames', kind] });
  for (const width of FRAMES[kind].widths) jobs.push({ name: `stele-${kind}-${width}.webp`, fn: 'renderTile', args: { name: 'steleHead', args: { kind, width }, q: .86 }, key: ['heads', `${kind}-${width}`] });
  jobs.push({ name: `frieze-${kind}.webp`, fn: 'renderTile', args: { name: 'frieze', args: { kind }, q: .84 }, key: ['friezes', kind] });
  jobs.push({ name: `frieze-${kind}-top.webp`, fn: 'renderTile', args: { name: 'frieze', args: { kind, flip: true }, q: .84 }, key: ['friezes', `${kind}-top`] });
  jobs.push({ name: `loose-${kind}.webp`, fn: 'renderTile', args: { name: 'loose', args: { kind }, q: .84 }, key: ['loose', kind] });
  jobs.push({ name: `loose-${kind}-top.webp`, fn: 'renderTile', args: { name: 'loose', args: { kind, flip: true }, q: .84 }, key: ['loose', `${kind}-top`] });
}
jobs.push({ name: 'courses.webp', fn: 'renderTile', args: { name: 'courses', args: {}, q: .72 }, key: ['courses'] });
jobs.push({ name: 'marble.webp', fn: 'renderTile', args: { name: 'marble', args: {}, q: .86 }, key: ['marble'] });
jobs.push({ name: 'social.jpg', fn: 'renderSocial', args: {}, key: ['social'] });

const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const browser = await chromium.launch();
const setIn = (obj, path, value) => { let o = obj; path.slice(0, -1).forEach(k => { o = o[k] = o[k] || {}; }); o[path[path.length - 1]] = value; };
try {
  await mkdir(outDir, { recursive: true });
  // the page's manifest (small: it ships in the main bundle) and a full report of every file
  let manifest = {}, report = {};
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { manifest = {}; }
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { report = {}; }
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('page error:', error.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(new URL('scripts/publishing/render-home.html', server.resolvedUrls.local[0]).href);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  // the fonts for the share card
  await page.evaluate(async () => {
    const faces = [['Marcellus', '/fonts/home/marcellus-400.woff2'], ['Marcellus SC', '/fonts/home/marcellus-sc-400.woff2'], ['EB Garamond', '/fonts/home/eb-garamond.woff2']];
    await Promise.all(faces.map(([family, url]) => new FontFace(family, `url(${url})`).load().then(face => document.fonts.add(face))));
  });
  for (const job of jobs) {
    if (only && !job.name.includes(only)) continue;
    const t0 = Date.now();
    const out = await page.evaluate(([fn, args]) => window[fn](args), [job.fn, job.args]);
    const bytes = job.bin ? Buffer.from(out.data, 'base64') : Buffer.from(out.data.split(',')[1], 'base64');
    await writeFile(resolve(outDir, job.name), bytes);
    report[job.name] = { bytes: bytes.length, ...(out.width ? { width: out.width, height: out.height } : {}), ...(out.layMs != null ? { layMs: out.layMs, stones: out.stones } : {}) };
    if (job.key[0] === 'heads') setIn(manifest, job.key, { rise: out.meta.rise, headH: out.meta.headH });
    if (job.key[0] === 'frames') setIn(manifest, job.key, { slice: out.meta.slice });
    if (job.key[0] === 'conches' && job.key[1] === 'fine' && out.alt) setIn(manifest, ['alts', job.key[2]], out.alt);
    console.log(`${job.name}: ${out.width ? `${out.width}×${out.height}, ` : ''}${(bytes.length / 1024).toFixed(0)} KB${out.layMs != null ? `, laid in ${out.layMs} ms (${out.stones} stones)` : ''} [${Date.now() - t0} ms]`);
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
  await mkdir(resolve(reportPath, '..'), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 1) + '\n');
} finally {
  await browser.close();
  await server.close();
}
