# Four places

A code-drawn screenprint of San's path, newest at the top like the site's history:
San Jose (eBay, 2024–), San Diego (UC San Diego, 2022–2024), Bengaluru (Texas
Instruments, 2019–2022) and Surathkal (NIT Karnataka, 2015–2019). A red route runs
from a small telescope on the Surathkal beach to the Lick Observatory domes above
San Jose: the NITK astronomy club at one end, the observatory hill at the other.

Reference: Lee Robinson's homepage. The illustration carries place and the type
carries rank. Each scene has a sky, a landmark and a foreground band that overlaps
the next sky.

Intended home: the sankala.me History/About page or the homepage's "story so far"
section. The margin labels link to the existing `/history#history-…` anchors.

## How it is made

- One HTML file with no images or libraries. Canvas 2D draws four separations,
  one coverage plate per riso ink: Medium Blue, Teal, Bright Red and Yellow on
  natural paper. Every colour is one of those inks or an overprint of them.
- A shape's recipe, such as `{B:1, T:.6}`, knocks out the inks beneath it, so its
  colour is exactly its recipe. Tints become halftone dots when printed.
- A WebGL2 pass does the printing: AM halftone per drum (15°/75°/45°/0°),
  misregistration, ink spread, uneven drum density, starved specks and paper
  fibre. The static noise is baked into textures once per size.
- The static art is drawn once per resize as back and front layers with a mask.
  Each frame redraws only what moves:
  - the lighthouse beam (one turn every 5 s)
  - waves and surf
  - freeway traffic
  - twinkling stars
  - clock pulses through the die's H-tree
  - sunset glitter
  - the traveller on the route
- Animation runs at about 25 fps on a seamless 30 s loop. `?t=12` renders one frame
  and stops. Reduced motion shows a still. Rendering pauses when the tab is hidden.
- On phones each place becomes a captioned crop framed on its landmark.

Facts come only from `src/data/history.json` and `src/data/profile.js`. The
lighthouse colours, the house styles and the orchard blossoms are illustration,
not documentation.
