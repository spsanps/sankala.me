# The mosaic apse as the homepage

October 3, 2026. San chose the mosaic apse (v2, `design/prototypes/2026-10-code-drawn-art/four-frames-apse/`)
for sankala.me: "Yeah I like this version. Only thing is there's a performance issue: the rendering is not
super fast, there's a glitch, and then you're left wondering what exactly is happening on the left side: is
it a text box, is it a regular text box." And: "Also shouldn't the page have a tile footer?"

This is the production build on branch `home-mosaic` (not deployed). The design is v2's: the gold apse with
the desk, its things and the empty chair, the four places re-laid on scroll, the light that follows the
pointer or a tilted phone, and the words on a tall stele at the left in large type (body 20.5 to 23 px on
wide screens, 18 to 20 px on phones), with the apse whole on the first screen.

## What was wrong, and what changed

The v2 study laid about 42,000 stones on the main thread before showing anything. Until then the page was a
blue screen with the words in a bare cream box, which jumped from a centred band to the left column, then got
its frame, and only then did the mosaic fade in. See `filmstrip-1440-before-after.jpg` and
`filmstrip-390-before-after.jpg`: under a 4x CPU slowdown the bare box sat there for about 14 s on a desktop.

Now:

- **The first paint is the finished picture.** `npm run render:home` prints stills with the same laying
  code: the wall, archivolt and cornice for each layout class (wide screens, tablets and phones), each
  conch (San Jose in ten moments of its day, and the other three places), and the pieces the tablets are
  built from. CSS places them from the viewport alone, so no script is needed to compose the first screen.
  A small inline script picks San Jose's moment before the apse is parsed. A second one holds the apse
  back until its stills and the two fonts are decoded (at most 1.5 s), so its first visible frame already
  has the wall, the gold apse and the words on their framed stele. The first frames show only the lapis
  background (the dark-blue screen at 0.16 and 0.25 s in the filmstrip), never a bare box.
- **The stele and the tablets are never a bare box.** They are CSS: the marble slab, a frame of four
  courses of tesserae as a repeating `border-image`, and the stele's round head printed for its width. They
  fit any text and need no script.
- **Live work is off the main thread, and nothing visibly swaps.** Once the browser is idle, a worker lays
  the places in slices and paints them on the CPU. The first place's still stays under a transparent canvas
  that only draws the stones that move (gulls, the robot's blink, the cursor, the lamp, the stars). Other
  places come in with v2's wave, each stone turning over, from layers painted ahead of time. The gold light
  (WebGL, in the worker) starts after idle, at a pixel ratio capped at 1.5. It is paused when the apse is off
  screen or the tab is hidden. The wall's light data ships as a small file instead of being re-laid. On
  screens with the pixels for it, sharper 2x stills replace the 1x ones after load, decoded first so the
  change is only sharper. Reduced motion and `?plain=1` get the stills only, switched as the words reach
  each place.
- **The lamp no longer overlaps the landmarks.** Each layout class has one apse shape now: broad on wide
  screens and tablets, taller on phones. The observatory, the library and the gulmohar were moved so the
  lamp's head stands clear in every place. The kites moved to the left sky.
- **A tile footer.** The page ends as it begins: loose stones on the plaster, the border (dark, gold,
  porphyry, gold, dark), a lapis wall in level courses with scattered gold stars, and the footer's words and
  links on a round-headed marble stele like the intro's. The covers shelf and colophon between them keep
  the plaster and inscription language (Marcellus capitals, gilt frames, porphyry).

## Performance

Headless Chromium on this WSL machine, the built site (`vite preview`), 4x CPU slowdown through the DevTools
protocol, a fresh profile per run, `?hour=15`. These are not real devices, and the machine is shared: these
runs were made at a load of about 8 to 13 on 32 cores. "Shown" is when the held apse is shown with its
stills and fonts decoded. Long tasks are main-thread tasks over 50 ms. Scroll frames are the intervals
between animation frames while scrolling three screens with the pointer moving. All runs: 0 console
errors from the page and no horizontal scroll. The only failed requests are Vercel's analytics scripts,
which exist only on Vercel.

| 4x CPU | v2 study (before) | production build (after) |
| --- | --- | --- |
| 1440×900: first contentful paint | 76 ms (the bare text box) | 376–420 ms (the finished first screen) |
| 1440×900: mosaic visible | 9.8 s (first frame), 13.7 s (page ready) | same as the first paint: the stills |
| 1440×900: first live place laid / all four | — / not within 20 s | 0.84–0.93 s / 3.7–4.8 s (in a worker) |
| 1440×900: longest main-thread task after first paint | 1,292 ms (67 tasks, 16.7 s in total) | none over 50 ms |
| 1440×900: time to interactive (estimate) | 19.8 s | 0.38–0.42 s |
| 1440×900: scroll frames, median / p95 / max | 16.7 / 883 / 2,600 ms | 16.7 / 16.7–16.8 / 16.8 ms |
| 390×844: first contentful paint | 100 ms (the bare text box) | 200–244 ms (the finished first screen) |
| 390×844: mosaic visible | 5.2 s (first frame), 9.4 s (page ready) | same as the first paint |
| 390×844: first live place laid / all four | — / 15.4 s | 0.31–0.34 s / 1.35 s |
| 390×844: longest main-thread task after first paint | 1,935 ms (59 tasks, 12.0 s in total) | 65 ms (one run of three; none in the others) |
| 390×844: time to interactive (estimate) | 15.2 s | 0.29–0.30 s |
| 390×844: scroll frames, median / p95 / max | 16.7 / 300 / 1,633 ms | 16.7 / 16.7 / 16.8 ms |

At a pixel ratio of 2 (with the sharper stills fetched after load): 1440×900 showed at 216 ms with one 53 ms
task, and 390×844 at 172 ms with tasks of 52 and 64 ms. Scrolling was 16.7 / 16.8 ms p95 / max in both. The
worker's own frames take 1 to 2 ms at p95, up to about 230 ms while a place's layer is first painted. That
work is off the main thread and never delays scrolling. For comparison, the live clear-line homepage
measured in the same way: 1440×900 first paint at 244 ms, five long tasks up to 64 ms, smooth scrolling.

Before the switch to drawing the conch on the CPU, desktop scrolling stalled (frame p95 200 ms, stalls up to
3 s) with no long tasks. The stalls came from the GPU filling 60,000 small paths at once when a place was
first shown. Painting each place's layer in slices on the CPU in the worker removed them.

Bytes on the first paint: about 387 KB of stills on a wide screen (wall 133, conch 154, coursed wall 56,
stele head, frame and marble 43), 206 KB on a phone, plus the two fonts (59 KB). After load, on screens with
the pixels for them: the 2x wall and conch (719 KB wide, 278 KB phone) and the wall's light data (103 KB
wide, 22 KB phone). Every printed file and its size is in `stills-report.json`.

How the numbers were made: `profile.cjs` here (paint timing, long tasks, scroll frames and a trace filmstrip),
e.g. `node design/reviews/2026-10-03-mosaic-home/profile.cjs "http://127.0.0.1:4173/?hour=15" /tmp/out after --cpu 4`.

## Review images

- `desktop-1-first-paint.jpg`, `phone-1-first-paint.jpg`: captured the moment the apse is shown, before the
  live layer has started. These are the stills alone.
- `desktop-2-settled.jpg`, `phone-2-settled.jpg`: a few seconds later, live, with the light on.
- `desktop-3-place-1-sd.jpg`, `-2-blr`, `-3-nitk` and the phone versions: each place. `desktop-3-wave-sj-to-sd.jpg`:
  half way between San Jose and San Diego.
- `phone-4-stele.jpg`: the intro stele on a phone.
- `desktop-4-shelf.jpg`: where the mosaic ends and the plaster shelf begins.
- `desktop-5-footer.jpg`, `phone-5-footer.jpg`: the tile footer.
- `tablet-1-first-screen.jpg`: 768×1024.
- `filmstrip-1440-before-after.jpg`, `filmstrip-390-before-after.jpg`: the first seconds, v2 study above, this build below.

Checked with no console errors and no horizontal scroll at 1920×1080, 1440×900, 1280×720, 768×1024,
390×844, 360×780 and 320×568. Also checked: reduced motion (the stills switch per place), and the light
following the pointer, aligned with the stones. `npm run lint`, `npm run build` and `npm run check:site`
pass. The homepage checks keep every guarantee: four places, ten milestones with `#history-<id>` anchors,
eight photographs that enlarge, every cover, the legacy anchors, the four nav links. They now also check
that the stills load, the apse is shown, the footer has its links, and the prerendered HTML carries the
first-paint scripts and every milestone.

## For San to decide

- **San Jose's light is now one of ten moments.** It runs from the early morning to night, with the moon
  waxing, full or waning when it is up. The conch no longer follows the exact minute or the moon's exact
  phase. That is what lets the first paint already show the right conch. The clock on the cornice still
  shows the real time, and if the moment changes while the page is open, the conch turns over to the new one.
- **The share card is new**: the apse at the golden hour and his name on a marble tablet
  (`public/images/home/social.jpg`).
- **The first ~0.2–0.5 s is a plain lapis screen** while the stills decode, then the finished first screen
  appears all at once. If he'd rather see the words immediately, the hold can go, at the cost of the mosaic
  sometimes arriving a moment after the words.
- **The wall below the cornice and in the footer is laid in level courses** with scattered stars. Above the
  cornice the courses follow the arch, as in v2.
- Still untested on real devices: phone tilt (iOS asks permission through the "Tilt your phone" button),
  Safari, and the glint's strength on a real GPU.
