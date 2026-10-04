# The homepage on phones

October 4, 2026. San, on his Android phone (Chrome): the homepage is "pretty bad", it "doesn't render". He saw
the words but not the mosaic. He asked for three things: find and fix why, let slow devices fall back to a
simple mode on their own, and on phones make the art smaller so the words can be larger.

Branch `home-mobile`. Not deployed.

## What was wrong

I could not reproduce a page that stays blank forever. These were tried: Chromium's phone emulation (390×844
at DPR 3, 412×915 at DPR 2.625, 360×800 at DPR 3), with SwiftShader and with the real GPU through ANGLE. Also
the CPU slowed 1x to 6x, no throttling, slow 4G and slow 3G, tilt events, forced dark mode, low-end device
mode, and WebKit on a Safari-sized viewport. The live site and the local build behaved the same. The stills
always arrived in the end. But San's symptom does show on a slow connection, and the phone path had other
faults that only a real phone would show.

1. **On a slow connection the words came first and the apse showed broken.** The first-paint hold gives up
   1.5 s after the stylesheet arrives. The stills were only requested once the stylesheet had loaded, at
   low priority. They shared the connection with the 172 KB app script and five fonts. So the words
   appeared over a broken apse: a sliver of the arch, an empty blue box where the wall and conch belong,
   then half a conch with a grey band (`slow-4g-filmstrip-412-before-after.jpg`, top row). On a mid Android
   profile this lasted 1.0 s on slow 4G and 6.8 s on slow 3G. On a weak mobile connection that looks like
   "the mosaic never appeared".
2. **Then 2 MB more arrived at once.** The app renders on the client (`createRoot`, not hydration), and React
   sets an image's `src` before its `loading="lazy"`. So every career photo and every cover downloaded as
   soon as the script ran. The live layer then added its 2x stills, worker and light data. The phone page
   came to 3.7 MB, and the sharp stills arrived at 19 s on slow 4G.
3. **The live layer was a risk on phones and of little use there.** It puts two canvases over the stills: a
   worker-driven 2D conch and a WebGL light layer over the whole art band on phones. If a phone's compositor
   or GPU mishandles either one, it covers the stills. The light shader ran at half precision on phone GPUs
   (`mediump`). There the squared distance to the light overflows, every direction comes out zero, the gold
   goes flat and darker, and the light never moves. A simulation with that overflow confirmed it. The layer
   added about 180 MB to the page's process and 50 MB to the GPU process. Its worker spends 1.3 s of CPU
   laying the four places on a fast desktop core, several times that on a phone. All of it was untested on
   real devices.
4. Smaller faults found on the way:
   - In Safari the sharper stills never loaded, because Safari writes `url(\/images\/…)` back with escapes.
   - The skip link made the homepage download DM Sans.
   - Under a browser's forced dark mode, the stele's words go pale on the marble.

## What changed

- **Phones get the simple apse** (`src/pages/home/mosaic/mode.js`). It is the same printed stills, switched
  per place as the words scroll, with no canvas, no worker and no WebGL. The choice is made before any live
  code is fetched. The simple apse never downloads the worker or the stage.
- **Rules, in order:**
  - `?live=1` forces the live layer.
  - `?simple=1` (or the old `?plain=1`) forces the simple apse.
  - Otherwise, simple for: reduced motion, Save-Data, a 3G or slower connection, `deviceMemory` ≤ 4,
    `hardwareConcurrency` ≤ 4, no Worker or OffscreenCanvas or `transferControlToOffscreen`, and a phone.
    A phone means a coarse pointer and either a short screen side under 600 px or the phones' tall layout.
  - Everything else gets the live layer. Tablets do too, if they pass the rules above.
- **A watchdog on the live layer** (`live.js`). It stops the layer, removes its canvases and stays on the
  stills if any of these happens:
  - the first place isn't laid within 3 s;
  - the median frame time is over 50 ms for 2 s, watched for the first 10 s, while laying and for 3 s
    after each scroll;
  - a main-thread task runs over 200 ms in those windows;
  - the worker errors or fails to load;
  - a 2D or WebGL context is lost;
  - anything in the stage throws.

  The reason is kept in `window.__mosaicPerf.fallback`. All cases were tested: a blocked worker gives
  `worker-error`, a worker 5 s late gives `not-ready`, a 300 ms task gives `long-task`, and 70 ms frames
  give `slow-frames`.
- **First paint on slow connections:**
  - A small script in `<head>`, before the stylesheet, requests this moment's conch at high priority.
  - The other first-paint stills are preloaded at high priority, each with the media query that selects it.
  - The app's script is fetched only after the page's load event (stills and fonts), or 4.5 s at the
    latest. On any other route it loads at once.
  - If the hold gives up before a still is decoded, that still stays hidden and fades in whole. A
    half-loaded picture never shows.
  - Photos and covers set `loading` before `src`, so they stay lazy.
- **The light shader** asks for `highp` where the GPU has it, and works in units of 1,024 device pixels,
  which half precision can hold. On desktop a frame with the light fixed is pixel-identical to before:
  8 of 518,000 pixels differ, a moving stone.
- **Phone layout:**
  - The apse ends at about 47% of the screen's height instead of 61–63%. It never goes below 0.2 px a
    unit, or below what the wall sheet covers.
  - The phone wall sheet is wider and taller (±1,000 by 1,050 units, re-printed), so its edges never show.
  - The stele and tablets are the screen width less two 16 px gutters. Their round heads were re-printed
    at 288, 328, 343, 358, 380 and 398 px.
  - The words are larger: the intro's body is 19.5–21 px (was 18–20), its heading 40–46 px (was 36–44),
    the tablets' body 19.5–20.5 px (was 18.5), their place names 40 px, the entries' titles 23 px.
  - The wall note, the path heading, the covers shelf, Recently and the footer were checked at 360 and
    390 px. There is no horizontal scroll at any profile.
- `<meta name="color-scheme" content="only light">` on the homepage. This is the standard opt-out from a
  browser's automatic darkening. Headless Chromium's forced-dark switch ignores it, even on a bare test
  page, so it is unverified here.
- `npm run check:site` now also checks that a phone (390 and 360 px) gets the simple apse with no canvas
  and its stills showing, a desktop gets the live layer with its two canvases, `?simple=1` works, and the
  prerendered homepage carries the head script, the preloads and the deferred app script.

## Numbers

Headless Chromium on this WSL machine, the built site served locally. These are not real devices.

The profiles:
- **iPhone-class:** 390×844 at DPR 3, CPU 2x, no network throttling.
- **Mid Android:** 412×915 at DPR 2.625, CPU 4x, slow 4G (150 ms, 1.6 Mbps), 8 GB, 8 cores.
- **Low Android:** 360×800 at DPR 3, CPU 6x, slow 4G, 4 GB.

"Words" is when the apse (and so the stele) became visible. "Stills" is when the first-paint wall and
conch had arrived. Long tasks are main-thread tasks over 50 ms after first paint. Memory is the PSS of the
renderer and GPU processes 9 s after load. The raw data is in `before-phones.json`, `before-desktop.json`
and `after.json`, made with `measure.cjs` here.

**iPhone-class**

| | before | after |
| --- | --- | --- |
| mode | live (worker) | simple (phone) |
| words / stills | 87 / 24 ms | 67 / 17 ms |
| sharp 2x conch | 496 ms | 173 ms |
| long tasks | none | none |
| downloaded in 9 s | 3,688 KB | 1,354 KB |
| renderer / GPU process | 293–301 / 77 MB | 128 / 28 MB |
| worker heap | 35 MB | no worker |
| stele starts at | 530 px of 844 (63%) | 413 px (49%) |
| intro body / heading / tablets' body | 19 / 40 / 18.5 px | 20.5 / 44 / 20 px |

**Mid Android**

| | before | after |
| --- | --- | --- |
| mode | live (worker) | simple (phone) |
| words / stills | 2,169 / 2,789 ms | 2,277 / 2,270 ms (the same frame) |
| sharp 2x conch | 19,326 ms | 7,063 ms |
| long tasks | 1 (61 ms) | 1 (50 ms) |
| downloaded in 9 s | 3,689 KB | 1,180 KB |
| renderer / GPU process | 283–308 / 80 MB | 132 / 30 MB |
| worker heap | 27 MB | no worker |
| stele starts at | 555 px of 915 (61%) | 446 px (49%) |
| intro body / heading / tablets' body | 19.5 / 42 / 18.5 px | 21 / 46 / 20.5 px |

**Low Android**

| | before | after |
| --- | --- | --- |
| mode | live (worker) | simple (low memory) |
| words / stills | 2,181 / 2,782 ms | 2,315 / 2,376 ms |
| sharp 2x conch | 19,365 ms | 7,161 ms |
| long tasks | 2 (max 89 ms) | 3 (max 73 ms) |
| downloaded in 9 s | 3,687 KB | 1,179 KB |
| renderer / GPU process | 195 / 76 MB | 131 / 30 MB |
| worker heap | 21 MB | no worker |
| stele starts at | 496 px of 800 (62%) | 392 px (49%) |
| intro body / heading / tablets' body | 18.5 / 38 / 18.5 px | 20 / 42 / 19.5 px |

How long the words showed without the whole first-screen art, on the mid Android profile (CPU 4x). Before
is the live site, which is the same build as `main`; after is this branch.

| connection | before: words / art in | after: words / art in |
| --- | --- | --- |
| slow 4G (150 ms, 1.6 Mbps) | 2,228 / 3,238 ms: **1,010 ms** of a broken apse | 2,278 / 2,270 ms: **none** |
| slow 3G (400 ms, 400 kbps) | 3,800 / 10,588 ms: **6,788 ms** of a broken apse | 4,279 / 9,059 ms: 4,780 ms with the art hidden, then faded in whole |

**Desktop.** It still runs the live layer as before.

- 1440×900, no throttling:
  - mode live (worker), words at 66 ms (before 74–390 ms), no long tasks;
  - 1,366 KB downloaded (before 2,320 KB, the difference being the lazy covers);
  - renderer 340 MB (349–356), GPU 106 MB (107);
  - type sizes unchanged.
- 2560×1440: live (worker), 1,828 KB (3,046), renderer 466 MB (449–464), GPU 169 MB (169).
- With the October 3 profiler at a 4x CPU slowdown (`../2026-10-03-mosaic-home/profile.cjs`):
  - 1440×900: places laid at 745 / 1,610 / 2,446 / 3,322 ms (before 738 / 1,568 / 2,453 / 3,297), the light
    on, scroll frames 16.7 / 16.7 / 16.8 ms median / p95 / max (before 16.7 / 16.8 / 16.8);
  - 2560×1440: frames p95 49.9 ms, max 117 ms (before 50 / 133);
  - no fallback in any desktop run.

**Forced live on a phone** (`?live=1`) still works, with the worker and the light, even at a 6x CPU slowdown.
It costs what it did: about 280–300 MB in the renderer and 75–80 MB in the GPU process.

## WebKit

Tested for real: Playwright's WebKit build, with its missing system libraries unpacked from Ubuntu packages
into `~/work/webkit-libs`, no sudo. This is Linux WebKit, not iOS Safari, so it says nothing about iOS's
canvas memory limits or the real GPU. At 390×664 (an iPhone with Safari's toolbars) it gets the simple
apse, the apse ends at half the screen, and the sharp stills now load. They didn't before (point 4 above).
See `webkit-390x664-before-after.jpg`.

## Images

- `phone-390x844-before-after.jpg`, `phone-412x915-before-after.jpg`, `phone-360x800-before-after.jpg`:
  the first screen, the stele and a tablet, before (top) and after (bottom).
- `slow-4g-filmstrip-412-before-after.jpg`: the first seconds on slow 4G. Before, the words over a broken
  apse. After, the art fades in whole.
- `desktop-1440-before-after.jpg`, `desktop-2560-before-after.jpg`: unchanged.
- `webkit-390x664-before-after.jpg`.
- `phone-360-sections-after.jpg`: the wall note, the covers shelf, Recently and the mosaic footer at 360 px.
- `other-pages-360.jpg`: /work, /history, /about and the two newest notes at 360 px.

## Other pages on phones

/work, /history, /about, /notes/iros-2026-origami and /notes/its-just-possible were checked at 360×800
(CPU 4x) and 390×844. None was blank. There was no horizontal overflow and no console errors, and the
essays' and About's body text is 18 px. Not changed, for San to decide:
- The Work page's card descriptions are 12.5–13.5 px in the two-column grid at 360–390 px.
- The inner pages' header links are 14 px.
- The Timeline's body is 15–16 px.

## For San to decide

- Phones no longer get the moving mosaic by default: no light on the gold, no birds or blinking robot, no
  wave between places. The conch switches still to still as the words reach each place. The stele has a
  "Living version" link (`/?live=1`) for anyone who wants it.
- The apse on phones is smaller: it ends at about 47% of the screen. On short screens, such as Safari with
  its toolbars, it ends at about half.
- On a slow connection the first screen shows the words on the wall before the pictures, which then fade in.
  It no longer shows a half-drawn apse.
- Still untested on a real phone. If the art is still missing on his phone after this, the next step is
  remote debugging (`chrome://inspect` over USB) to read the console and network on the device.
- The stills are served with `cache-control: max-age=0, must-revalidate`, so a phone revalidates each one on
  every visit, a round trip each. Versioned file names with a long cache would remove that. Not done.
