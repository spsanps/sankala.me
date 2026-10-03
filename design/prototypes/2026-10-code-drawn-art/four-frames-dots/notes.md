# Four frames in print (muted halftone dots)

A comparison study for the sankala.me landing scroll. San asked for "the original page sample
where you gave me the locations in some kind of bright colour, pixel-ish, dot… but I don't want
the bright colours… and this could all have some motion". That is the dotted print look of the
first Four places sample (`../places/`), which he had also found "too noisy to make out stuff".
So this version keeps the dots and must stay as legible as the clear-line homepage.

## How it is made

1. **Separation.** The clear-line scene from `src/pages/home/four-frames/` (room, views, objects,
   copied here) is drawn through a `SplitPen` (`js/split.js`). Dark, near-neutral line work goes
   onto a **key** layer; every fill goes onto a **colour** layer and knocks the key out beneath it,
   so hidden lines stay hidden. Key lines are never thinner than about 1.6 artwork pixels, so far
   hairlines print as lines, not dashes.
2. **Inks.** Five muted inks on warm paper `#f2ecdf`, printed lightest first:
   sage `#93aa8b` (15°), ochre `#d9ae5c` (0°), terracotta `#c4704f` (75°),
   slate `#4e6c88` (45°), key `#36332f` (45°, plus solid line work).
3. **Separation table** (`js/plates.js`). A 26³ lookup chooses, for each colour, at most two
   colour inks plus key, from five screen strengths (18, 32, 48, 64 % or solid). Its cost favours
   fewer plates and less ink; the key is cheap only in the shadows; slate over terracotta (mud) is
   penalised. Flat areas therefore print as one clean dot field or one solid.
4. **The press** (`js/printer.js`, one WebGL2 fragment shader). Each plate goes through a clean
   round-dot screen at its own angle, about 7 CSS px pitch on desktop (finer when the desk is
   small), solid above 86 % coverage, with a slight per-plate misregistration (≤0.75 px) and a
   little uneven ink density. No speckle noise over the image.
5. **Light.** The wall is bare paper. San Jose follows the real hour (`?hour=` overrides): a sun
   patch by day, a gentle warm tint at golden hour, a cool slate night with the lamp's pool left as
   bare paper. The view gets a little "air" (colours lifted toward the paper) by day, so it sits
   behind the room. The column of words always keeps bare paper behind it.
6. **Photographs** are real, drawn crisply on a separate canvas over the print, in printed
   frames, dimmed and warmed slightly with the room after dark.

## What moves

- Clouds drift across San Jose and San Diego; a hawk circles; gulls cross toward the Pacific and
  the sea glints; kites tug at their strings over Bengaluru and crows circle; the Surathkal
  lighthouse beam sweeps, the moon's path glitters and stars catch.
- After dark in San Jose: valley lights twinkle and a plane's beacon crosses.
- On the desk: the laptop types new lines, the robot blinks, the scope's trace runs.
- All of it is drawn as separated artwork every frame, so it prints through the same screens.

## The change between places

A fresh sheet slides in from the right over the last print, its edge casting a small shadow, and
the old photographs go under it. The next place is then printed onto the sheet **ink by ink**,
lightest first: each plate is rolled across from right to left, with a heavier band of fresh ink
behind the roller and the plate settling into register. The new photographs are pinned once the
key has printed. Scrolling back reverses it.

## Performance

- Resting on a place, only the window and the live desk objects are recomposed and uploaded
  (dirty rectangles with `texSubImage2D`); the live loop runs at about 15 fps. A test confirms an
  incremental frame equals a full one.
- Headless SwiftShader (software GPU), 1280×800 at 1×: about 57 ms per frame; 1440×900 at 2×:
  about 220 ms. Almost all of that is the software-emulated fragment shader, which a real GPU
  runs in a few milliseconds; **not yet measured on real hardware**.
- First frame ready in about 0.6 s; the other places bake in idle time.

## Hooks

`?t=<s>` freezes time, `?hour=<0–24>` sets San Jose time, `?era=now|sd|blr|nitk` jumps to a
place, `?pos=0–3` freezes the scroll position (mid-change frames), `?plain=1` shows the plain
version (also used for reduced motion). `window.__ready` is set when drawn. Opens from `file://`
through the bundle (`js/bundle.js`, rebuild with `./build.sh`); served over http it loads the
ES modules.

## Weaknesses

- The blank-sheet moment: halfway into a change the stage is briefly bare paper before the first
  ink arrives. It reads as printing, but a reader who stops scrolling there sees an empty sheet.
- The golden-hour window is still the busiest area (several inks over the hills).
- Large flat colours at mid strength show the dot screen strongly at 1×; it is cleaner at 2×.
- The Bengaluru monitor (chip layout) is detailed enough to look busy in dots.
- The live loop redraws the window and desk objects even when nothing visible changes in them.
- Not tested on Safari or a real phone.

## Sources

Copied from production: `core.js`, `constants.js`, `ink.js` (wall colour changed), `room.js`
(flat wall, no glass glints), `views.js` (pale skies, live clouds), `objects.js` (print modes for
photographs). Text and milestones from `src/data/history.json` (copied to `js/history-data.js`)
via `js/eras.js`; page structure from the tile study's `js/main.js`.
