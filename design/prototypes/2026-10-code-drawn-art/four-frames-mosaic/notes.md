# Four frames in mosaic

October 3, 2026. A comparison study for San, who clarified that by "tile" he meant mosaic
(his reference: a goldfish bowl under an arch, laid in small stones whose rows follow the
shapes) and asked for background motion. It replaces the rejected azulejo study
(`../four-frames-tile/`) and shares none of its look.

It is the same experience as the live homepage: the full-page sticky picture, the words in a
lane on the plain wall, the four places newest first, San Jose on real time, the same intro and
all ten milestones (Chin and Jaidev linked), and plain navigation. The photographs stay real,
hung as crisp prints on the mosaic pinboard.

## How the stones are laid (andamento)

1. **Cartoon.** The homepage's own drawing code (`room.js`, `views.js`, `objects.js`, copied
   unchanged apart from cloud capture) is replayed through `mosaicpen.js`, which writes three
   sheets: solid colour fields, the colours stones are matched to, and the ink outlines. The
   outlines are also recorded as polylines. Hairlines, grain and glints are dropped.
2. **Outline row.** Dark stones are walked along every recorded ink line, one after another,
   each turned to the line (`paths.js: walk`).
3. **Rows that follow the shapes.** A row field φ is built from distance transforms: distance
   to the ink lines in stone widths, or distance to a colour edge plus half a stone. Its contours
   at 1, 2, 3 … are traced with marching squares and stones are walked along them. In small
   shapes the rows keep going inward, so round things (crowns, the sun, the moon) get concentric
   rows (opus vermiculatum).
4. **Courses.** Big open fields (wall, floor, the sky) take straight courses in running bond past
   the third row (opus tessellatum). Small shapes use finer stones than the open fields.
5. **Cut fill.** Gaps left between systems get smaller cut stones.
6. **Fitting.** Each stone takes the patch of sheet nearest to it (within its own field), moves
   to the patch's centre and is cut to fill it, less the grout, so stones sit tight in their rows.
7. **Colour.** Each stone is matched in CIE Lab to a box of 57 stones (creams, greys, teal,
   lapis, green, ochre, orange, red, wood, dusk violet). A faint wash keeps the field's stone.
   Some saturated stones are glass and catch light.

Stone size is 19 art units in open fields, about 11 in detail; at 1440 × 900 that is 13–14 px.

## What moves

The stones never move; the scene behind the window does. Each frame the view is painted again
on a small live sheet and every window stone takes the stone matching the colour under it.
- **Clouds** drift and come round again.
- **Birds:** a hawk circles San Jose; three birds glide across.
- **Gulls** cross San Diego.
- **Kites** tug in Bengaluru.
- **Surathkal:** the lighthouse beam sweeps, and highlights travel shoreward on the sea.
- **Night:** stars twinkle and the valley lights flicker in San Jose.

On the desk:
- The laptop's stones light up in reading order as it types, with a blinking cursor stone.
- The robot's eye stones close for a blink.
- The scope's phosphor stone runs along the square wave.
- A slow band of window light crosses the glass stones.

About 20 frames a second is enough. Measured in headless software rendering: 2–5 ms per frame.

## Light

- **San Jose** follows the real hour (`?hour=` overrides it): a cool sky at noon, warm at
  golden hour, and lapis at night with the valley lights on.
- **Lamplight and sun:** at night the lamp's glow is laid into the stones of the desk and wall,
  and morning sun falls across the desk.
- **The other three places** keep the light each is remembered by.
- **Behind the words** the wall is laid calm: courses of one stone over pale grout, outline
  stones softened to grey, and a floor on how far the light can darken it. Measured contrast of
  the text at 11 pm is at least 7.9:1.

## Changing places: re-laying

As the next place's heading comes up, a wave crosses the picture from right to left. Ahead of
it the old stones are lifted, leaving fresh mortar. Behind it the new place is laid outline
first, then row by row inward, then the courses and cut fill, each stone dropping in. The
photographs come off with the wave and go back up after it. The wall behind the words is not
re-laid; it cross-fades to the new light. Scrolling back reverses it.

## Hooks and files

- **Hooks:** `?t=` freezes a moment and sets `window.__ready = true`; `window.__renderAt(t, pos)`
  then draws any moment without reloading. Also `?hour=`, `?era=now|sd|blr|nitk`, `?pos=0–3`
  for mid-transition frames, and `?plain=1`. Reduced motion shows the plain version (one still
  per place).
- **Rebuild:** run `build.sh` after editing `js/`. The page uses ES modules over http and
  `js/bundle.js` from `file://`.
- **New code:**
  - `palette.js`: the stone box and Lab matching.
  - `mosaicpen.js`: the cartoon pen.
  - `paths.js`: flattening, contours, walking.
  - `tessera.js`: the layout.
  - `mosaic.js`: cartoon, laying, colour, painting stones.
  - `living.js`: what moves.
  - `stage.js`: building, frames, the wave.
  - `layout.js`: the homepage's room layout.
- **Copied from production:** `core.js`, `ink.js`, `room.js`, `objects.js`, `views.js` (the
  only edit records clouds instead of drawing them) and `constants.js`.

## Measured

Headless Chromium with software rendering:
- **Time to live:** about 1.0 s at 1440 × 900 (1× and 2×), 0.7 s on a 390 px phone.
- **Long tasks:** the longest is 214 ms at 1×, from reading back the cartoon sheets; at 2×
  it is 157 ms.
- **Checks:** no console errors and no horizontal scroll at 1920, 1440, 1280, 768, 390 and 360
  wide, in the plain version and with reduced motion. All ten milestones are present and "my
  brother" never appears.

## Weaknesses

- **Small objects** are close to the stone size: the telescope, mug and chip read as clusters
  rather than drawings. The ink outline stones carry them.
- **The desk top's rows** swirl where several colour edges meet; a mosaicist would simplify
  the field first.
- **The San Jose view** loses Mt Hamilton's domes, and the far hills merge into one ochre band.
- **No gold tesserae** are placed deliberately yet, only glass glints.
- **Birds** are two or three stones and easy to miss; kites are small.
- **During the wave,** the strip of fresh mortar is wide and plain for a moment.
- **Real devices:** not measured on a real phone or GPU.

## Questions for San

- Should the mosaic stones be larger and bolder, like the goldfish, or stay at this finer size
  so the room's objects read?
- Should the wall behind the words also show andamento, or stay calm courses as now?
