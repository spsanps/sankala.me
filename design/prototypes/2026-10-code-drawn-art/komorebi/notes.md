# Komorebi — light through palms

Late sun through coconut palms onto a lime-plaster wall, behind a quiet
lowercase intro. Everything is computed in one HTML file (WebGL2); there are no
image or video files.

**Reference:** Allysen's homepage — atmosphere behind, restraint in front — and
her looping phone clip of leaf shadows. Palms tie Surathkal's coast (NIT
Karnataka) to San Diego. **Home:** sankala.me, behind a short intro, a /now page
or the About opening.

## How it is made

1. **Fronds → occlusion layers.** About 1,900 leaflets on 32 fronds are rebuilt
   as triangle strips every frame (≈0.8 ms of JavaScript). Four depths go into
   the four channels of one texture: a potted palm, a mid palm, and two layers
   of far crowns.
2. **Solar-disc integration.** For each wall point, 32 limb-darkened samples
   across the sun's disc look back through all four layers, each offset by its
   distance from the wall. Gaps become pinhole images of the sun; penumbra grows
   with distance; the low sun stretches them into ellipses. The window frame is
   an analytic parallelogram with its own penumbra.
3. **Plaster and grade.** A plaster height map (trowel undulation, skim strokes,
   sand tooth, pits) is computed once per size, so its texture shows only where
   the sun rakes across it. Then a cool olive sky through the window, room bounce,
   a soft filmic curve, grain and dither.

Motion is layered looping spline noise: trunks leaning, frond sway, flutter
rippling out along each frond, tip tremble and leaflet twist. Gusts travel
right to left with a delay. The 40 s loop is seamless, with no visible periodicity
(checked with frame-difference energy and autocorrelation).

## Hooks

- `?t=12.5` renders that moment and freezes; `window.__renderAt(t)` re-renders.
- `?sun=17.5` sets the San Jose hour; `?sun=now` follows the real clock (solar
  position from declination and equation of time). Default is the designed late
  afternoon.
- `?debug=layers` / `?debug=light` show the intermediate maps; `?grain=0` drops grain.
- Reduced motion shows one composed still; the page pauses when hidden; a frame
  governor lowers the light-pass resolution on slow GPUs.

## Known limits

- The light pass is the cost: ~400k pixels × 32 samples × 4 layers. Fine on recent
  laptops and phones; the governor degrades softness rather than frame rate.
- Coins are soft and blotchy rather than crisp round discs; that matches a canopy
  far from the wall but has less sparkle than a close tree.
- Mornings show the midday light, because the wall faces west; after sunset
  the direct light fades out.
