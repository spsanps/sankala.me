# Four frames in tile

A comparison study for San (3 October 2026). It is the live homepage's scroll experience, with the
desk re-painted in cobalt on tin glaze and fired onto a wall of hand-made tiles. San asked to compare
the clear-line homepage with a "high taste tile art" version and a pixel version. Nothing here is
placed on the site.

## What it is

- **Same experience and words as the homepage.** The painting fills the screen and stays put, and
  the text scrolls in a lane on the plain wall tiles (beneath the painting on phones). It covers the
  same four places, newest first, with San's intro, all ten milestones from `history.json` (Chin
  linked, never "my brother"), a lightbox for the photographs, and plain navigation.
- **Same desk, re-painted.** The clear-line modules (room, views, objects) draw exactly as on the
  homepage, but through `GlazeCtx` (`js/glaze.js`), a stand-in canvas context. It turns every fill
  into a wash of cobalt at one of four dilutions and every stroke into the dark outline. Anything
  white is reserved (the glaze left bare), and light marks are scratched out. Ochre and copper green
  appear only on warm or living things: the lamp, book bands, the pot and plant, the robot's ear,
  the scope's phosphor. Screens, charts and papers stay blue.
- **How the pigment behaves.**
  - Washes settle into a few flat strengths, as a painter mixes them.
  - Pigment pools at the edges, brush passes show, and the wash wanders slightly off the drawing.
  - Outlines swell and thin like a pointed brush, and run dry in places.
- **Skies.** A daylight sky is left white and laid in with horizontal brush strokes, closer together
  toward the top, the way tile painters do it. A night sky is one deep wash, so palms, the
  lighthouse and the island can still be painted against it.
- **The tiles.**
  - Each tile is set a little off true, and its glaze is a shade warmer or cooler than its neighbours.
  - Lime grout runs between them; the edges are pillowed.
  - Some tiles have crazing and pinholes, and a few have chipped corners showing the biscuit (none
    behind the words).
  - Each glossy tile reflects a small pane of the window in its own place. The reflections slide as
    the page scrolls and lean toward the pointer. They fade after dark.
- **A border band.** A *barra* skirting runs under the desk: two cobalt rules, a running vine and an
  ochre rosette, one repeat per tile.
- **Changing places.** Only the tiles whose picture changes turn over, in a wave from the right edge
  toward the words. Each tile spins on its vertical axis, shows its biscuit edge when edge-on, and
  leaves its combed mortar bed visible behind it. The photographs come off first and go back up last.
- **Light.** San Jose follows the real hour (`?hour=` overrides it). At night the room is cool and
  dim. The lamp warms the white glaze (multiply) and lifts the cobalt (screen), and the photographs
  share the room's light.
- **The real photographs stay real.** They are hung over the tiles as framed prints in true colour.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page, layout and CSS (from `home.css`). Loads ES modules when served, and `js/bundle.js` from `file://` |
| `js/glaze.js` | Glaze context, pigment finishing, tiles, firing, sheen, flips (DESIGN comment at top) |
| `js/stage.js` | Layout, light per place, painting a place, the wave of turning tiles, scroll, hooks |
| `js/frieze.js` | The *barra* skirting band |
| `js/main.js`, `js/eras.js`, `js/history-data.js` | Page markup, places and milestones (copied wording) |
| `js/core.js`, `ink.js`, `room.js`, `views.js`, `objects.js`, `constants.js` | Copied unchanged from `src/pages/home/four-frames/`. The only change is a `photo: true` flag on photograph prints in `objects.js` |
| `build.sh` | Rebuilds `js/bundle.js` with esbuild after editing a module |
| `photos/` | The eight real photographs |

Hooks: `?t=` freezes the frame (`window.__ready = true`), `?hour=` sets San Jose time, `?era=now|sd|blr|nitk`
jumps to a place, `?pos=0–3` shows mid-transition, and `?plain=1` gives the still version. Reduced
motion also gets the still version: one fired panel per place, inline with the words.
`window.__tileTimings` reports how long each place took to paint.

## Measured (headless Chromium, no GPU)

- **Desktop 1x:** live at about 0.8 s, all four places painted in about 1.6 s.
- **Desktop 2x:** live at about 1.6 s, all four in about 4–5 s. The longest main-thread task is
  about 200 ms; the pixel passes yield every 30 ms.
- **Phone 2x:** live at about 0.8 s.
- **Scroll frames:** p50 about 25 ms, p95 about 34 ms.
- No console errors and no horizontal scroll at 1440 or 390.

## Weaknesses

- **It is still a clear-line drawing translated into glaze, not a composition made for tiles.**
  - The proportions, object choices and flat perspective come from the homepage.
  - A real azulejo panel would use hatching for shade, more calligraphic outlines and fewer, larger
    shapes.
- **Each tile carries its slice of one continuous painting.** The painting never responds to the
  tile edges the way hand-painted panels sometimes do.
- **Some views lose depth.** Washes are only four strengths, so in San Jose at golden hour the hills
  and the massif share one tone. Mid-transition resting states, with a few tiles half turned, can
  look unfinished if the reader stops scrolling there.
- **The window reflections are subtle on white tiles.** They show mostly on painted ones.
- **Painting a place takes about 0.75–1 s per place at 2x.** It is done once per place and per
  resize, during idle time. Real-device performance is unmeasured.
