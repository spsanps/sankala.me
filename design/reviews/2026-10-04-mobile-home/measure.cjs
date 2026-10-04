// Phone and desktop profiles for the homepage: which mode it chose, when the words and the stills were
// first visible, main-thread long tasks, memory, horizontal overflow, and screenshots.
// Usage (site served by `npm run preview` or `npx vite preview`):
//   node design/reviews/2026-10-04-mobile-home/measure.cjs <url> <outdir> <label> [--profiles iphone,android-mid,android-low,desktop,desktop-2k] [--runs 1] [--shots 1]
// Headless Chromium with CDP CPU and network throttling; not real devices. Memory is the PSS of the
// browser's renderer and GPU processes (read from /proc, so Linux only), and the JS heap of the page
// and of any worker (raw CDP over --remote-debugging-port).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [url, out, label, ...rest] = process.argv.slice(2);
const opt = { profiles: 'iphone,android-mid,android-low,desktop,desktop-2k', runs: '1', shots: '1', port: '9341' };
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
const SLOW_4G = { latency: 150, down: 1.6e6 / 8, up: 750e3 / 8 };
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
const PROFILES = {
  // iPhone-class: fast CPU, good network
  iphone: { w: 390, h: 844, dpr: 3, cpu: 2, net: null, mobile: true, nav: { hardwareConcurrency: 6 } },
  // mid Android: 4x slower CPU, slow 4G, 8 GB / 8 cores
  'android-mid': { w: 412, h: 915, dpr: 2.625, cpu: 4, net: SLOW_4G, mobile: true, ua: ANDROID, nav: { deviceMemory: 8, hardwareConcurrency: 8 } },
  // low Android: 6x slower CPU, slow 4G, 4 GB / 8 cores
  'android-low': { w: 360, h: 800, dpr: 3, cpu: 6, net: SLOW_4G, mobile: true, ua: ANDROID, nav: { deviceMemory: 4, hardwareConcurrency: 8 } },
  desktop: { w: 1440, h: 900, dpr: 1, cpu: 1, net: null, mobile: false },
  'desktop-2k': { w: 2560, h: 1440, dpr: 1, cpu: 1, net: null, mobile: false },
};
fs.mkdirSync(out, { recursive: true });
const kill = setTimeout(() => { console.error('measure.cjs: overall timeout'); process.exit(2); }, 15 * 60 * 1000);

function procMem() {
  const all = {};
  for (const d of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(d)) continue;
    try { const st = fs.readFileSync(`/proc/${d}/stat`, 'utf8'); all[d] = { ppid: +st.slice(st.lastIndexOf(')') + 2).split(' ')[1], cmd: fs.readFileSync(`/proc/${d}/cmdline`, 'utf8').replace(/\0/g, ' ') }; } catch (e) { /* gone */ }
  }
  const mine = new Set([String(process.pid)]);
  for (let grew = true; grew;) { grew = false; for (const [p, v] of Object.entries(all)) if (!mine.has(p) && mine.has(String(v.ppid))) { mine.add(p); grew = true; } }
  const mem = {};
  for (const p of mine) {
    const c = all[p]?.cmd || ''; if (!/chrom/i.test(c)) continue;
    const type = (/--type=([\w-]+)/.exec(c) || [, 'browser'])[1];
    try { mem[type] = (mem[type] || 0) + Math.round(+/Pss:\s+(\d+)/.exec(fs.readFileSync(`/proc/${p}/smaps_rollup`, 'utf8'))[1] / 1024); } catch (e) { /* gone */ }
  }
  return mem;
}
async function heaps(port) {
  const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const wait = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } };
  const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { result } = await send('Target.getTargets');
  const res = { page: 0, worker: 0 };
  for (const t of result.targetInfos) {
    if (!(t.type === 'worker' || (t.type === 'page' && t.url.startsWith('http')))) continue;
    const a = await send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
    const sid = a.result?.sessionId; if (!sid) continue;
    const h = await send('Runtime.getHeapUsage', {}, sid);
    if (h.result) res[t.type] += Math.round(h.result.usedSize / 1e5) / 10;
    await send('Target.detachFromTarget', { sessionId: sid });
  }
  ws.close();
  return res;
}

(async () => {
  const results = [];
  for (const name of opt.profiles.split(',')) {
    const P = PROFILES[name];
    for (let run = 0; run < +opt.runs; run++) {
      const browser = await chromium.launch({ args: [`--remote-debugging-port=${opt.port}`] });
      try {
        const ctx = await browser.newContext({ viewport: { width: P.w, height: P.h }, deviceScaleFactor: P.dpr, isMobile: P.mobile, hasTouch: P.mobile, ...(P.ua ? { userAgent: P.ua } : {}) });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error' && !/_vercel|404/.test(m.text())) errors.push(m.text()); });
        page.on('crash', () => errors.push('renderer crashed'));
        const cdp = await ctx.newCDPSession(page);
        if (P.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: P.cpu });
        if (P.net) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: P.net.latency, downloadThroughput: P.net.down, uploadThroughput: P.net.up }); }
        await page.addInitScript(nav => {
          for (const [k, v] of Object.entries(nav || {})) try { Object.defineProperty(Navigator.prototype, k, { get: () => v, configurable: true }); } catch (e) { /* read-only */ }
          window.__m = { long: [], paints: {} };
          try {
            new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true });
            new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.paints[e.name] = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true });
          } catch (e) { /* older engine */ }
        }, P.nav);
        const t0 = Date.now();
        await page.goto(url, { waitUntil: 'load', timeout: 90000 });
        await page.waitForTimeout(Math.max(0, 9000 - (Date.now() - t0)));
        const m = await page.evaluate(() => {
          const q = s => document.querySelector(s);
          const bg = (s, p = 'backgroundImage', pseudo = null) => { const el = q(s); const r = el && /url\(["']?([^"')]+)/.exec(getComputedStyle(el, pseudo)[p]); return r ? r[1] : null; };
          const ends = performance.getEntriesByType('resource').reduce((o, e) => { o[e.name] = Math.round(e.responseEnd); return o; }, {});
          const end = u => (u ? ends[new URL(u, location.href).href] ?? null : null);
          const conch = bg('.apse-conch'), wall = bg('.apse-back .apse-wall');
          const x1 = u => u && u.replace('-2x.', '-1x.');   // the first paint's still (a sharper 2x may replace it later)
          const fcp = window.__m.paints['first-contentful-paint'] || null;
          const long = window.__m.long.filter(([s]) => s >= (fcp || 0));
          const shown = window.__apseShown ?? fcp;
          const mp = window.__mosaicPerf || {};
          const r = q('.stele-lede') && getComputedStyle(q('.stele-lede'));
          const band = q('.stele')?.getBoundingClientRect().top;
          return {
            mode: (document.documentElement.dataset.mosaic || '-') + '/' + (mp.mode || '-'), why: mp.why || null, fallback: mp.fallback || null,
            fcp, shown, conchEnd: end(x1(conch)), wallEnd: end(x1(wall)), conch2xEnd: /-2x\./.test(conch || '') ? end(conch) : null, conch: conch && conch.split('/').pop(), hires: document.documentElement.classList.contains('apse-hires'),
            longCount: long.length, longMax: long.reduce((a, [, d]) => Math.max(a, d), 0), longTotal: long.reduce((a, [, d]) => a + d, 0),
            heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e5) / 10 : null,
            bytesKB: Math.round(performance.getEntriesByType('resource').reduce((a, e) => a + (e.transferSize || 0), 0) / 1024),
            hscroll: document.documentElement.scrollWidth > innerWidth + 1, ledePx: r ? parseFloat(r.fontSize) : null, h1Px: q('.stele h1') ? parseFloat(getComputedStyle(q('.stele h1')).fontSize) : null,
            entryPx: q('.entries p') ? parseFloat(getComputedStyle(q('.entries p')).fontSize) : null,
            steleTop: band != null ? Math.round(band) : null, vh: innerHeight, canvases: document.querySelectorAll('.apse canvas').length,
          };
        });
        m.stillVisible = Math.max(m.shown || 0, m.conchEnd || 0, m.wallEnd || 0);
        m.mem = procMem();
        try { m.jsHeap = await heaps(opt.port); } catch (e) { m.jsHeap = String(e.message); }
        if (opt.shots === '1' && run === 0) {
          await page.screenshot({ path: path.join(out, `${label}-${name}-1-first-screen.jpg`), quality: 72, type: 'jpeg' });
          if (P.mobile) {
            await page.evaluate(() => window.scrollTo(0, document.querySelector('.stele').getBoundingClientRect().top + scrollY - innerHeight * .35));
            await page.waitForTimeout(800);
            await page.screenshot({ path: path.join(out, `${label}-${name}-2-stele.jpg`), quality: 72, type: 'jpeg' });
            await page.evaluate(() => window.scrollTo(0, document.querySelector('[data-frame="sd"]').getBoundingClientRect().top + scrollY - innerHeight * .4));
            await page.waitForTimeout(1500);
            await page.screenshot({ path: path.join(out, `${label}-${name}-3-tablet.jpg`), quality: 72, type: 'jpeg' });
          }
        }
        const r = { label, profile: name, run, ...m, errors: errors.slice(0, 5) };
        results.push(r);
        console.log(JSON.stringify(r));
      } finally { await browser.close(); }
    }
  }
  fs.writeFileSync(path.join(out, `${label}.json`), JSON.stringify(results, null, 1));
  clearTimeout(kill);
})().catch(e => { console.error(e); process.exit(1); });
