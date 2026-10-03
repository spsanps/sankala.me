# Four frames — pixel edition (comparison variant)

A comparison variant of the live sankala.me homepage. It's the same experience and the same
content (the intro, all ten milestones in `history.json` wording with Chin linked, the four
places newest first, and San Jose on the real clock), drawn as native pixel art instead of clear
line. The tile version is a separate variant. Nothing here is live.

Open it through a local server, because the scripts are ES modules: from this folder's parent,
`python3 -m http.server`, then `/four-frames-pixel/`. Hooks: `?t=` freezes time,
`?hour=0–24` sets the San Jose hour, `?era=now|sd|blr|nitk`, `?pos=0–3`, `?plain=1`.

## How it is drawn
- **Native low-resolution grid:**
  - **Desktop:** a 270 × 270 design square.
  - **Phones:** a re-composed 196 × 210 square, with the shelf and pinboard on the left and the window on the right.
  - **Scaling:** whole-number nearest-neighbour; the scale is chosen from the device height so
    the art clears the words. At 2× device pixels, every 6 × 6 block outside the photographs
    is a single colour, so there are no mixels and no anti-aliasing.
- **Colour:**
  - **Indexed sprites:** each pixel stores a material and a ramp step, not a colour.
  - **Ramps:** 18 hand-picked five-step ramps (90 colours) with hue-shifted shadows (cool and
    violet) and lights (warm).
  - **Light:** each kind of light (day, sun on a surface, golden hour, twilight, night,
    lamplight, overcast, screen and phosphor spill) is one OKLab transform of the whole
    palette. Lit patches use the same pixels in a different palette, so light never invents
    blended colours.
- **Outlines:** selective. Each object's outline is the darkest step of its own material, never black.
- **Dither:** ordered (Bayer) dither appears only where it earns its place: the window's sun on
  the desk, the lamp's pool and its speckled halo, sky band seams, the lighthouse beam and a
  hill's edge.
- **The change between places:**
  - **The view:** parallax. Four layers (sky, far, middle, near) slide a whole glass-width, a
    beat apart.
  - **Prints:** unpinned and carried off.
  - **Desk things:** hop off to the right in 2-pixel steps; the next place's things drop in
    and land with a three-frame bounce.
  - **Laptop:** folds shut in three frames (open, half, closed).
  - **Room light:** changes in four flat palette steps, not a dissolve.
- **Live details:** stepped at 10–12 fps.
  - **San Jose:** clouds, plus at night winking stars, valley lights and a plane's beacon.
  - **San Diego:** a gull and stirring leaves.
  - **Bengaluru:** a kite and two black kites.
  - **Surathkal:** the lighthouse beam, moon glitter, foam and stars.
  - **On the desk:** the laptop typing, the robot blinking and the oscilloscope trace.
- **Photographs:** the eight real ones are drawn at full resolution into hard pixel print
  frames on the board, under the room's light (multiply at night).

## Facts and illustration
- **From the repo:** every milestone, its photo and its link; the places and their years; the
  intro wording.
- **Illustrative, not documented:** the objects on the desks, the shelves, the chairs and floor
  things, the window views, and the time of day given to each past place. These are the same
  choices as the live clear-line version.

## Weaknesses
- **The Geisel Library** reads as an inverted ziggurat with glass bands. It's recognisable but
  simplified; its piers are thick.
- **San Diego's window** is mostly building; the eucalyptus crowns sit at the edges.
- **Bengaluru's coconut palm** is still the weakest tree.
- **The lighthouse beam** is a sparse dither and reads only in motion.
- **Very wide screens:** the art scale steps down to keep clear of the words, so at some sizes
  (1280 × 800) the art is smaller than in the clear-line version.
- **Tablets and phones:** they use the tall composition at a scale limited by height, so wide
  tablets show wall either side.
- **Performance:** all four places are baked within about a second in headless Chromium. It
  hasn't been measured on a real phone.
