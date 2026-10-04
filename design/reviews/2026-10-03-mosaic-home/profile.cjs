// Usage (from the repo, with the site served by `npm run preview`): node design/reviews/2026-10-03-mosaic-home/profile.cjs <url> <outdir> <name> [--sizes 1440x900,390x844] [--cpu 4] [--runs 1] [--ready "js expr"] [--film 1]
// Measures, with CDP CPU throttling: first paint / first contentful paint / LCP, when the page looks
// finished (a JS expression polled; default window.__ready), every main-thread long task (>50 ms) with
// its start, an estimate of time to interactive (end of the last long task before a 2 s quiet window),
// and frame times while scrolling the first 3 screens with the pointer moving. Optionally records a
// filmstrip (trace screenshots) so the first frames can be inspected.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [url, out, name, ...rest] = process.argv.slice(2);
const opt = { sizes: '1440x900,390x844', cpu: '4', runs: '1', ready: 'window.__ready === true', film: '0', dpr: '1', scroll: '1' };
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
fs.mkdirSync(out, { recursive: true });
const kill = setTimeout(() => { console.error('perf.cjs: overall timeout'); process.exit(2); }, 12 * 60 * 1000);

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const results = [];
  try {
    for (const size of opt.sizes.split(',')) {
      const [w, h] = size.split('x').map(Number);
      for (let run = 0; run < Number(opt.runs); run++) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: Number(opt.dpr), isMobile: w < 600, hasTouch: w < 600 });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        const cdp = await ctx.newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(opt.cpu) });
        await page.addInitScript(() => {
          window.__perf = { long: [], lcp: 0, paints: {} };
          try {
            new PerformanceObserver(l => { for (const e of l.getEntries()) window.__perf.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true });
            new PerformanceObserver(l => { for (const e of l.getEntries()) window.__perf.lcp = Math.round(e.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true });
            new PerformanceObserver(l => { for (const e of l.getEntries()) window.__perf.paints[e.name] = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true });
          } catch (e) { /* older engine */ }
        });
        const film = opt.film === '1' && run === 0;
        if (film) await cdp.send('Tracing.start', { categories: 'disabled-by-default-devtools.screenshot,devtools.timeline', transferMode: 'ReturnAsStream' });
        const t0 = Date.now();
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        let readyAt = null;
        try {
          await page.waitForFunction(opt.ready, null, { timeout: 60000, polling: 50 });
          readyAt = await page.evaluate(() => Math.round(performance.now()));
        } catch (e) { errors.push('timeout waiting for ready'); }
        // let background work finish (or not) for a while, then read long tasks
        await page.waitForTimeout(6000);
        let filmFrames = [];
        if (film) {
          const done = new Promise(res => cdp.once('Tracing.tracingComplete', res));
          await cdp.send('Tracing.end');
          const { stream } = await done;
          let data = '';
          for (;;) { const r = await cdp.send('IO.read', { handle: stream }); data += r.base64Encoded ? Buffer.from(r.data, 'base64').toString() : r.data; if (r.eof) break; }
          await cdp.send('IO.close', { handle: stream });
          const ev = JSON.parse(data); const events = Array.isArray(ev) ? ev : ev.traceEvents;
          const nav = events.find(e => e.name === 'navigationStart' || e.name === 'TracingStartedInBrowser');
          const base = nav ? nav.ts : Math.min(...events.filter(e => e.ts).map(e => e.ts));
          const shots = events.filter(e => e.name === 'Screenshot' && e.args && e.args.snapshot);
          const dir = path.join(out, `${name}-${w}x${h}-film`); fs.mkdirSync(dir, { recursive: true });
          let last = -1e9;
          for (const s of shots) { const ms = Math.round((s.ts - base) / 1000); if (ms - last < 90) continue; last = ms; const f = path.join(dir, `f-${String(ms).padStart(6, '0')}ms.jpg`); fs.writeFileSync(f, Buffer.from(s.args.snapshot, 'base64')); filmFrames.push(ms); }
        }
        const perf = await page.evaluate(() => ({ ...window.__perf, shown: window.__apseShown ?? null, apse: window.__apsePerf ? { firstFrame: Math.round(window.__apsePerf.firstFrame), allPlaces: Math.round(window.__apsePerf.allPlaces || 0) } : null, mosaic: window.__mosaicPerf || null }));
        const fcp = perf.paints['first-contentful-paint'] || null;
        const after = perf.long.filter(([s]) => s >= (fcp || 0));
        // TTI estimate: end of the last long task that is followed by a 2 s quiet window (after FCP)
        let tti = fcp || 0;
        const sorted = perf.long.slice().sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < sorted.length; i++) {
          const end = sorted[i][0] + sorted[i][1], next = sorted[i + 1];
          if (end > tti) tti = end;
          if (!next || next[0] - end >= 2000) { if (end >= (fcp || 0)) break; }
        }
        // scroll the first screens with the pointer moving; record frame intervals
        let frames = null;
        if (opt.scroll === '1') {
          await page.evaluate(() => { window.__frames = []; let last = performance.now(); const f = now => { window.__frames.push(now - last); last = now; if (window.__frames.length < 2000) requestAnimationFrame(f); }; requestAnimationFrame(f); });
          const steps = 90, dist = h * 3;
          for (let i = 0; i < steps; i++) {
            await page.mouse.move(w * (.3 + .5 * Math.sin(i / 9)), h * (.3 + .2 * Math.cos(i / 7)));
            await page.mouse.wheel(0, dist / steps);
            await page.waitForTimeout(16);
          }
          await page.waitForTimeout(500);
          await page.evaluate(() => window.__mosaicAsk && window.__mosaicAsk()); await page.waitForTimeout(300);
          frames = await page.evaluate(() => { const f = window.__frames.slice(2).sort((a, b) => a - b); const q = p => Math.round(f[Math.min(f.length - 1, Math.floor(f.length * p))] * 10) / 10; return { n: f.length, median: q(.5), p95: q(.95), max: q(1), over50: f.filter(v => v > 50).length, worker: (() => { const w = window.__mosaicPerf && window.__mosaicPerf.worker && window.__mosaicPerf.worker.frames; if (!w || !w.length) return null; const g = w.slice().sort((a, b) => a - b); return { n: g.length, median: Math.round(g[g.length >> 1] * 10) / 10, p95: Math.round(g[Math.floor(g.length * .95)] * 10) / 10, max: Math.round(g[g.length - 1]) }; })() }; });
        }
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        const r = { size, run, shown: perf.shown, fp: perf.paints['first-paint'] || null, fcp, lcp: perf.lcp, readyAt, long: perf.long, longAfterFcp: after, maxLongAfterFcp: after.reduce((m, [, d]) => Math.max(m, d), 0), tti: Math.round(tti), apse: perf.apse, mosaic: perf.mosaic, frames, hscroll: scrollW > 1, errors: errors.slice(0, 6), film: filmFrames.length ? `${filmFrames.length} frames` : null, wallMs: Date.now() - t0 };
        results.push(r);
        console.log(JSON.stringify(r));
        await ctx.close();
      }
    }
  } finally { await browser.close(); clearTimeout(kill); }
  fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exitCode = 1; });
