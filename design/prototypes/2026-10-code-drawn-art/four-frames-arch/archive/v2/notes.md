# The window, in mosaic: four places

October 3, 2026. The first version (San Jose only, the robot as the hero) is kept in
`archive/v1/`. San's feedback on it: "Is it just San Jose? And also just the robot, that's kind
of weird. Maybe a little bit more interesting art would have been nice, and a little bit more
fade out from the arch, not too much, I like the white spaces in this one, and also different
scenes as I scroll."

## What it is now

One round-headed window set into a plain plaster wall. The marble frame and the sill stay; the
view inside is re-laid for each place as the words scroll past, newest first. Each view has its
own light and a small still life on the sill, composed with the view like a painter's window.

| Place | View | On the sill | Light |
| --- | --- | --- | --- |
| San Jose, 2024–now | Mt Hamilton with the three Lick domes, foothills, two houses, cypresses, a hedge | a brass telescope on a walnut pillar aimed at the domes, the paper robot as a small figurine, a potted succulent | San Jose's real time: sun or moon on an arc, day, gold, dusk, night with stars and lit windows |
| San Diego, 2022–24 | the Geisel Library (glass floors stepping out over splayed concrete piers), eucalyptus, the Pacific, a lawn | a stack of zines with one standing up (ZINify), a coffee cup on its saucer, a gull | a clear morning |
| Bengaluru, 2019–22 | towering monsoon clouds, flat roofs with ribbed water tanks, a gulmohar in flower, two kites | a glass of chai, a packaged chip on a walnut stand (chip design at TI) | a monsoon afternoon, lit from the west |
| Surathkal, 2015–19 | the Arabian Sea under a full moon with its path on the water, the red-and-white lighthouse on its headland, coconut palms, the beach | a star chart showing the Plough (the astronomy club), a pocket oscilloscope with a square wave (the NITK lab), a conch | night |

Facts come from `src/data/history.json` and `profile.js`; the objects are illustrative. The
lighthouse colours and the exact views are illustration, not documentation.

## The frame and the fade

- The frame is lit by the room, so it never changes with the place or the hour.
- One row of gold glass tesserae runs round the arch, a little way in from the window, and glints slowly.
- The outer edge is no longer a hard dark line. Its outermost stones thin out unevenly, a few lie loose
  on a pale, soft-edged setting bed with faint trowel marks, and a handful are scattered on the plaster,
  like a panel still being laid. It reaches about 20–55 px at desktop size; the wall stays open and the
  fade never comes near the words.
- Dark outline rows only on the window's inner edge, the sill's top, each place's still life, and one
  main landmark per place (the domes, the library, the city's skyline and the gulmohar, the lighthouse).

## The transition

The frame and sill stay put. The window is re-laid in a wave that runs from its upper right to its lower
left as you scroll: each stone of the old place turns over (narrowing to its edge, a little darker), and
a stone of the next place turns up behind it. It is driven by the scroll position, so it reverses when
you scroll back, and at every moment one side is one place and the other side is the next. With reduced
motion or `?plain=1` the window snaps between the four stills.

## What moves (stones never move; a few are re-coloured)

- San Jose: two gulls by day, glints running round the sun's rings, a slow band of light, twinkling
  stars and lit windows at night.
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
- `js/stage.js`: placing the panel, laying the frame once and each place lazily, scroll position, the
  re-laying wave, the living details. `js/main.js`, `js/eras.js`, `js/history-data.js`, `index.html`.
- `build.sh` makes `js/bundle.js` so the page opens from `file://`.

## Hooks

`?hour=0–24` (San Jose), `?era=now|sd|blr|nitk`, `?pos=0–3` (a moment between places), `?t=<s>`
freezes and sets `window.__ready`, `?all=1` lays every place before the first frame (review),
`?plain=1` still version.

## Measured (headless Chromium, software rendering, not a real device)

At 1280×800, 1x: a frame takes about 2 ms (median) and 12 ms (95th percentile, mid-wave). Laying the
frame and the first place takes a few seconds in software rendering; the other places lay in the
background. Checked at 1440×900 and 390×844 (phone: the window stays at the top while the words scroll
under it): no console errors, no horizontal scroll, captions follow the scroll in live, still and
reduced-motion modes.

## Honest weaknesses

- The eucalyptus are stylised clumps more than true eucalyptus; the Geisel Library is simplified.
- Bengaluru's city is a row of pastel blocks with window grids; it reads, but it is the plainest view.
- Small details (the gull's eye, the chip's pin-one dot, the Plough's lines) are one stone wide and
  can break up at phone size.
- Rows meet in visible seams where the sky's rows from different edges collide.
- The kites and gulls are only re-coloured stones, so they step rather than glide.
- Laying four places costs several seconds of background work on first load; not yet tested on a real
  phone or in Safari.
- The page still loads its two fonts from Google Fonts.
