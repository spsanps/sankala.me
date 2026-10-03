# The window, in mosaic: style frame (San Jose)

October 3, 2026. San said the room mosaic (`../four-frames-mosaic/`) felt off: "too many lines,
hard to make out". The diagnosis was that the objects were too small for stones, there were dark
lines everywhere (outline rows plus dark grout), the wall read as bricks, and the colour was
scattered beige. His goldfish reference works because of a few big subjects, pale grout, dark rows
only on the main contours, smooth gradient skies and rows that swirl around one subject. This is
the composition redesigned for mosaic, San Jose only, for his decision.

## What it is

One round-headed window set into a plain plaster wall: a teal sky warming to gold, the sun on an
arc that follows the arch (morning left, evening right, by San Jose's real time), Mt Hamilton with
the three Lick Observatory domes (the big one with its slit), one band of foothills, three valley
houses and cypresses, and the paper robot standing on the sill. Words and menu sit on plain
plaster beside the window (wide) or below it (phones).

## What changed from the room mosaic

| Room mosaic | Window |
| --- | --- |
| A whole desk of small objects, 4–6 stones each | A few big shapes; the robot is ~45 stones tall, the domes 11–14 stones wide |
| Dark grout everywhere | Pale grout, tinted a little by each stone, so joints never become a net (matters at night) |
| Outline rows on every shape | Outlines only on the panel edge, the inner arch, the sill line, the robot and the domes |
| Brick-like courses on the wall | No stones on the wall at all; the sky hugs the arch, the sun and the robot |
| Built by translating the clear-line drawing | Shapes designed for mosaic in `js/scene.js` |

## Files

- `js/scene.js`: the composition, palettes by sun height (day, gold, twilight, night), outlines, gulls.
- `js/lay.js`: the layout: label raster, outline rows, rows along each region's chosen edges, gap
  fill, then every stone fitted to its cell and cut, less the grout.
- `js/stage.js`: placing the panel, colouring and setting stones, the living details.
- `js/field.js`: distance transform, contours, walking a line (copied from the room mosaic).
- `js/main.js`, `js/eras.js`, `js/history-data.js` (fresh copy of `src/data/history.json`), `index.html`.
- `build.sh` makes `js/bundle.js` so the page opens from `file://`.

## Living details

Stones never move; a few are re-coloured: a slow band of light across the sky, two gulls about a
dozen stones wide gliding and flapping through the sky stones (hidden at night), glints running
round the sun's rings, glass glints, twinkling stars at night, lit windows after dark. About 14
frames a second. Reduced motion and `?plain=1` show the still panel.

## Hooks

`?hour=0–24` (San Jose time), `?t=<seconds>` freezes one moment and sets `window.__ready`.

## Measured (headless Chromium, software rendering, not a real device)

Live frame: p50 2.1 ms, p95 4.7 ms at 1x. Laying the panel takes a few seconds in software
rendering; the page shows plain plaster until the panel fades in.

## Honest weaknesses

- The sun stays on its arc and never sets behind the hills; geographically Mt Hamilton is east, so
  a sunset over it would be wrong, and the arc keeps the sun in open sky.
- Stones at three-way junctions (sky, ridge, frame) can poke slightly into the outline row.
- The ridge's rows are a little restless next to the calmer sky.
- Only San Jose exists; the other three places would need their own window views and sill objects.
- No gold tesserae yet, only glass glints.
- Not tested on a real phone or Safari.
