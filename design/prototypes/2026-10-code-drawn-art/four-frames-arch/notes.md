# The window, in mosaic: four places

October 3, 2026. The first version (San Jose only, the robot as the hero) is kept in
`archive/v1/`. San's feedback on it: "Is it just San Jose? And also just the robot, that's kind
of weird. Maybe a little bit more interesting art would have been nice, and a little bit more
fade out from the arch, not too much, I like the white spaces in this one, and also different
scenes as I scroll."

The second version (four places) is kept in `archive/v2/`. San's feedback on it: "The tile I feel
like is not centered the window and I feel like it should be a little bigger and the fade has to be
a little bit more wider ... it should take like half of the page. And also like San Jose I'm not
sure if I can understand that San Jose. Maybe San Diego is fine, the library is unique but also it
looks weird. Maybe Bangalore seems fine with the kites and Surathkal also seems kind of fine. Just
that maybe the dark versions are a little bit too dark to understand what's happening."

## What changed in v3 (this version)

- **Layout.** On wide screens the window and its fade now take the right half of the page (from
  42% of the width, or 48 px past the words if they reach further), and the window sits centred in
  that half, as large as the height allows. It is a little bigger: 0.69 of its design size at
  1440×900 (was 0.65), 0.85 at 1920×1080 (was 0.80), 0.54 at 1280×720 (was 0.50). The words keep
  their column on the plain wall; the white space between them and the fade stays. Phones are
  unchanged: the window stays on top, the words scroll under it.
- **Wider fade.** The edge now dissolves over a broad band instead of a rim: the outer third of the
  marble thins out gradually (never as far as the gold row), loose stones lie on a pale bed washed
  on in three soft layers, and they scatter more sparsely, smaller and paler, up to ~120 units onto
  the plaster (about 80 px at 1440×900; 0.62 of that on phones so it is not cut off). It eases a
  little at the crown, so it stays clear of the nav. The wall stays plain.
- **San Jose, redrawn so it reads.** v2 failed for three reasons: the three equal domes on a teal
  ridge read as bubbles, not an observatory; the sill was a crowd (telescope, robot, succulent) and
  the houses, cypresses and hedge added more small things; nothing said California. Now: Mt
  Hamilton with the Lick Observatory drawn large (the small dome's tower, the hall with its
  pedimented entrance, the great dome on its tower with its shutter open, the Shane dome on the next
  shoulder), golden October foothills with valley oaks (woodland down a fold, a few alone, one big
  oak, treetops below the window), the city as a hazy band in the valley, and one thing on the
  sill: the brass telescope, aimed at the great dome. At night the city lights come on, the
  observatory windows glow and the great dome's slit is lit (someone is observing). By day two
  hawks circle.
- **San Diego, the Geisel Library's real silhouette.** A small two-storey podium; big tapered
  concrete piers that splay out from it (the outer pair carries the second floor, so the middle
  floors bulge past them); six floors that step out to the widest at the third and fourth and narrow
  again to the roof, each a white concrete ledge over dark glass, the corners cut into facets; the
  recessed floor in shadow under the overhang. About 1.15 : 1 wide to tall, like the building.
  The rest of the scene (eucalyptus, the Pacific, zines, cup, gull) is unchanged.
- **Night lifted.** Surathkal and San Jose at night use moonlit blues about two steps lighter, with
  clear steps between sky, sea or mountain, land and trees (Surathkal's window is ~25% brighter
  overall; the headland went from near black to a readable moonlit slope with scrub). Night is told
  by the moon, stars, lighthouse beam and lit windows.
- Bengaluru and Surathkal compositions, the stone-turning transition, the still and reduced-motion
  versions, the hooks and the nav ("Writing & projects") are unchanged.

## What it is now

One round-headed window set into a plain plaster wall. The marble frame and the sill stay; the
view inside is re-laid for each place as the words scroll past, newest first. Each view has its
own light and a small still life on the sill, composed with the view like a painter's window.

| Place | View | On the sill | Light |
| --- | --- | --- | --- |
| San Jose, 2024–now | Mt Hamilton with the Lick Observatory (small dome, hall, great dome, Shane dome), golden foothills with valley oaks, the city in the valley | a brass telescope on a walnut pillar, aimed at the great dome | San Jose's real time: sun or moon on an arc, day, gold, dusk, a light moonlit night with stars, city lights and a lit dome slit |
| San Diego, 2022–24 | the Geisel Library (podium, splayed piers, six faceted floors widest in the middle), eucalyptus, the Pacific, a lawn | a stack of zines with one standing up (ZINify), a coffee cup on its saucer, a gull | a clear morning |
| Bengaluru, 2019–22 | towering monsoon clouds, flat roofs with ribbed water tanks, a gulmohar in flower, two kites | a glass of chai, a packaged chip on a walnut stand (chip design at TI) | a monsoon afternoon, lit from the west |
| Surathkal, 2015–19 | the Arabian Sea under a full moon with its path on the water, the red-and-white lighthouse on its headland, coconut palms, the beach | a star chart showing the Plough (the astronomy club), a pocket oscilloscope with a square wave (the NITK lab), a conch | a light, moonlit night |

Facts come from `src/data/history.json` and `profile.js`; the objects are illustrative. The
lighthouse colours and the exact views are illustration, not documentation.

## The frame and the fade

- The frame is lit by the room, so it never changes with the place or the hour.
- One row of gold glass tesserae runs round the arch, a little way in from the window, and glints slowly.
- The outer edge is not a hard line but a broad band: the outer third of the marble thins out
  gradually, loose stones lie on a pale setting bed (three soft washes, with faint trowel marks) and
  scatter ever more sparsely onto the plaster, up to ~120 units out (`eatDepth`, `reachOut` in
  `frame.js`; `setReach(.62)` on phones). The gold row is never eaten, and the band narrows where
  the frame meets the sill and eases a little at the crown.
- Dark outline rows only on the window's inner edge, the sill's top, each place's still life, and one
  main landmark per place (the observatory, the library, the city's skyline and the gulmohar, the lighthouse).

## The transition

The frame and sill stay put. The window is re-laid in a wave that runs from its upper right to its lower
left as you scroll: each stone of the old place turns over (narrowing to its edge, a little darker), and
a stone of the next place turns up behind it. It is driven by the scroll position, so it reverses when
you scroll back, and at every moment one side is one place and the other side is the next. With reduced
motion or `?plain=1` the window snaps between the four stills.

## What moves (stones never move; a few are re-coloured)

- San Jose: two hawks circling by day, glints running round the sun's rings, a slow band of light;
  at night twinkling stars, the city's lights flickering in the valley, the observatory's windows
  and the great dome's open slit glowing.
- San Diego: swells rolling toward the shore through the sea's rows, glitter under the sun, three gulls.
- Bengaluru: two kites tugging on their strings, the sunlit cloud edges glinting.
- Surathkal: the lighthouse beam sweeping (it flares when it faces you), the moon's path glittering,
  stars twinkling, foam running along the shore, the square wave running across the little scope.
- Everywhere: the gold row in the frame glints.

## Files

- `js/geom.js`: shared geometry and shape helpers.
- `js/frame.js`: the frame, the gold row, the dissolving edge, loose stones, bed and grout paths.
- `js/places/sanjose.js`, `sandiego.js`, `bengaluru.js`, `surathkal.js`: each place's light, regions,
  outline rules and living details. `js/places/life.js`: gulls and kites.
- `js/lay.js`: the layout (a `skip` region lets the frame be laid against the window without the view).
- `js/stage.js`: placing the panel (the right half on wide screens, `FADE_SIDE`/`FADE_TOP`), laying the frame once and each place lazily, scroll position, the
  re-laying wave, the living details. `js/main.js`, `js/eras.js`, `js/history-data.js`, `index.html`.
- `build.sh` makes `js/bundle.js` so the page opens from `file://`.

## Hooks

`?hour=0–24` (San Jose), `?era=now|sd|blr|nitk`, `?pos=0–3` (a moment between places), `?t=<s>`
freezes and sets `window.__ready`, `?all=1` lays every place before the first frame (review),
`?plain=1` still version.

## Measured (headless Chromium, software rendering, not a real device)

v3, at 1280×800, 1x: laying all four places takes about 4 s; a frame takes about 6 ms (median,
scrolling continuously through the waves) and 13 ms (95th percentile). Checked live (scrolling top to
bottom without freezing) at 1440×900, 1280×720, 1920×1080, 390×844 and 320×640, and `?plain=1`: no
console errors, no horizontal scroll, captions follow the scroll. San Jose checked at 6:36 am,
10:30 am, 5:36 pm, 7:18 pm, 9:30 pm, 10 pm and 4 am (moon up).

## Honest weaknesses

- San Jose: the observatory is enlarged and simplified (no Crossley or other small domes; the hall
  is shorter than the real one); from the valley the domes are tiny in reality. The oak line down
  the fold reads a little like a hedge, and the band of treetops under the sill like bushes. The
  lower left of the hills is plain. By day the city band is only a hazy texture; at night it is the
  clearest sign of a city.
- San Diego: the library is right in silhouette but schematic (one front face and two corner
  facets per floor; the real piers are more numerous). The eucalyptus are still stylised clumps.
- The fade's sparse outer stones can look like confetti if you look closely; on phones it is
  shortened and still reaches the canvas edge at 320 px.
- At 1440×900 the window is centred in the right 58% of the page rather than exactly the right half,
  so its fade has room on the right; at 1920×1080 it is height-limited and sits at 71% of the width.
- Bengaluru's city is a row of pastel blocks with window grids; it reads, but it is the plainest view.
- Small details (the gull's eye, the chip's pin-one dot, the Plough's lines, the hall windows) are one
  stone wide and can break up at phone size.
- Rows meet in visible seams where the sky's rows from different edges collide.
- The kites, gulls and hawks are only re-coloured stones, so they step rather than glide.
- Laying four places costs several seconds of background work on first load; not yet tested on a real
  phone or in Safari. The page still loads its two fonts from Google Fonts.
