# One robot, many hands

The Paper Robots robot keeps one pose and one composition. Every two seconds,
the world around it is re-made by a different hand process. There are eight
beats in a seamless 16-second loop, and the last beat cuts back to the house
gouache look. Everything is drawn in canvas 2D, in one HTML file, with no image
files and no libraries.

- **Answers:** the Fable "Still Point" video (one subject, many materials) and
  Kate Sparkle's montage (the colour is the cut; each beat works as a poster).
- **Would live:** as the paperrobots.studio homepage hero, as a 2–4 s film intro
  sting, or as a single beat used alone as a poster or card.
- **Thesis:** every way to put a robot on paper, plus one on cloth. Because the
  processes are printmaking and paper crafts, the set stays coherent with the
  brand. It is not a tour of digital styles.

## The beats

| # | Process | Field | What is simulated |
|---|---|---|---|
| 1 | Gouache | cream | bristle strokes, blotches, edge pooling, dry-brush, granulation |
| 2 | Cyanotype | Prussian blue | a photogram: the paper cut-out's thicknesses, eye holes, a cellophane ear, ferns, brushed emulsion, per-pixel exposure |
| 3 | Linocut | saffron | one carved block, white-line separations, gouge hatching per plane, brayer streaks, paper tooth |
| 4 | Risograph | fluorescent pink | two drums, grain dither, an AM halftone, misregistration, multiply overprint, starved floods |
| 5 | Engraving | banknote green | burin lines that swell with tone, cross-hatching, a lathe-work oval, guilloche, rosettes, microprint |
| 6 | Origami | vermilion | a photographed paper model, edge light, pre-creases, glued eyes, a folded sun, depth of field |
| 7 | Woodblock | washi and indigo | key block plus colour blocks, wood grain, baren swirl, bokashi, a figure carved out of the blocks behind it, unprinted mist |
| 8 | Cross-stitch | black aida | modelled X stitches, backstitch outlines and lettering, French knots; the head is re-stitched every frame |

Shared idle motion: head tilt, blinks (the lid is made of each material),
a saccade to a new glance at every cut, a small pop as the world changes, and
the ear catching light.

## Viewing

- `index.html` plays the loop in real time.
- `?t=6.5` renders that exact moment and freezes (`window.__ready` is then true).
- `?m=riso` holds one material (`painted`, `cyanotype`, `linocut`, `riso`,
  `engraving`, `origami`, `woodblock`, `stitch`).
- Reduced motion shows the gouache still. The page pauses when hidden and
  recomposes on resize. Portrait screens get a 9:16 composition.

## Cost (headless Chromium, software canvas)

- Steady state is 60 fps (p95 16.8 ms at 1440×900).
- The first frame takes about 0.4 s at 1× and about 1 s at 2×.
- Each later material builds in background slices while the earlier beats
  play. The longest single slice is about 50 ms at 1× and about 100 ms at 2×,
  so the first pass through the loop can hitch slightly. GPU canvas will be faster.

## Weak spots

- The cross-stitch at phone width uses the minimum cell size, so it reads
  closer to pixel art than thread.
- The origami is convincing but clean. It could take more paper irregularity
  (soft corners, a visible fibre layer on the robot itself).
- The gouache is the house look, but it is less painterly than the channel
  banner's generated art.
- The cuts are hard. A one-frame flash of the incoming field might hit harder;
  that is untested.

Previews: `../previews/paper-robot-materials-*`.
