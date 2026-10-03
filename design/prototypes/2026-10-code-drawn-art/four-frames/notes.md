# Four frames — notes

The second version of Four desks, rebuilt from San's feedback on October 2, 2026:
use one style instead of a different printing process per era, draw it better, make the
page one big experience instead of a picture on the side, keep the restraint, and make
the place drawings legible (the riso version was too noisy).

## What it is

The page is the painting. A full-viewport, sticky painting of one desk, one window,
one pinboard and one shelf fills the screen, and San's words scroll in a narrow lane
over the plain wall on the left. On phones the painting sits at the top as a tall
crop, under a small header, and the words scroll beneath it on a panel the colour of
the wall.

As you scroll, the same desk moves back through San's four places, newest first:
San Jose, San Diego, Bengaluru, Surathkal. The camera and the style never change.
What changes is what a hand would change:

- Prints come off the board and new ones are pinned.
- The shelf is cleared and restocked.
- Things on the desk slide off and new ones slide on. The laptop closes before it leaves.
- The view outside pans past like a train window.
- The light changes.

Leaving and arriving overlap, so the desk is never empty for long. Scrolling back
reverses everything.

San Jose follows the real hour in San Jose: the sun, the moon and its phase, stars,
valley lights, and the lamp coming on after dark. Each past place keeps the light it
is remembered by:

- San Diego: a clear morning, sun on the desk.
- Bengaluru: late afternoon before the rain, with kites.
- Surathkal: after dark by the sea, with the lighthouse beam sweeping and the
  oscilloscope's square wave running.

Below the experience come the full shelf of San's nine code-drawn covers and a footer
with the Paper Robots colophon.

## Style

Ligne claire with gouache:

- One warm ink, uniform contour weights, and flat fills.
- Shading is drawn as flat washes inside the contour.
- A faint brushed-gouache texture and paper tooth are baked once into each sprite.
- No halftone, no misregistration, no grain over detail.

The palette is declared at the top of `index.html`: sage plaster wall, oak desk, red
lamp, cobalt robot. Light is applied as a multiply tint, a softened sun patch through
the window panes, the lamp's pool, and screen glows. Screens are redrawn above the
light, so they give off their own.

## Files

- `index.html`: the page, its copy (in San's wording from `src/data/history.json`,
  with San's October 2 copy updates) and its CSS.
- `js/core.js`: noise, colour, San Jose time, sun and moon. Adapted from `../four-desks/js/core.js`.
- `js/ink.js`: the clear-line kit (pen, path builders, textures, sprite baking).
- `js/room.js`: wall, window, shelf, pinboard, desk, the lamp and its cord.
- `js/views.js`: the four window views and their live details.
- `js/objects.js`: each place's objects, prints and floor things.
- `js/stage.js`: layouts, light, baking, scroll mapping, compositing, plain version.
- `js/covers-kit.js`: the cover renderers, copied from `../four-desks/`. Only
  `SHELF_FONTS` gained the faces used by the other four covers.
- `photos/`: San's seven real photographs, copied from `../four-desks/photos/`.

## Hooks

- `?t=<s>` freezes time.
- `?hour=0–24` sets San Jose time.
- `?era=now|sd|blr|nitk` jumps to a place.
- `?pos=0–3` sets the continuous position, including mid-transition, for review.
- `?plain=1` shows each place as a still above its words. This is also what
  reduced motion gets, and the page links to it as "Plain version".

`window.__ready` is set once the first frame is drawn.

## Documented and illustrative

**From the repo:**

- The four places and their years.
- Every entry's wording, from `history.json`, with San's copy updates.
- The seven photographs.
- Work at eBay on language models (the laptop).
- Chip design at Texas Instruments (the layout on the monitor, the packaged chip, the
  layout printout).
- UC San Diego (the Geisel Library).
- ZINify (the zine) and Glyp/StartR (the intro and San Diego text).
- Electrical engineering at NIT Karnataka (the oscilloscope's square wave, which is
  taken from the real NITK lab photograph, and the breadboard).
- The Amateur Astronomy Club (the telescope, the star wheel, the star map, the binoculars).
- The Paper Robots robot.
- The spine colours of San's real covers.

**Geography, not personal fact:** Mt Hamilton and the Lick domes seen from San Jose,
the Pacific near UC San Diego, Bengaluru's rooftop water tanks and gulmohar trees, and
the lighthouse at Surathkal.

**Illustrative:**

- The room, desk, lamp and window themselves.
- Mug, paper cup, steel tumbler, potted plants and the money plant.
- Binders, backpack, book pile, cardboard box, toolbox and multimeter.
- Notes, the houses and trees in the views, the kites.
- The times of day for the past places.

## Questions for San

1. What is actually on your desk now, and what does your window look out on?
2. Did one object travel with you through all four places? It could be the thing that
   stays put while everything else changes.
3. Where did you actually work in San Diego and Bengaluru? Desk or lab, window or no window?
4. Should the San Jose frame keep following the real time, or hold one hour?
5. Does the Paper Robots figurine belong on your personal desk?

## Weaknesses

**Performance**

- All numbers come from headless SwiftShader (software rendering). Real-GPU
  performance is untested.
- The first frame is ready in about 0.9–1.2 s, and all four places are baked by about
  2.5 s at 1440×900.
- After a warm-up second, the steady frame rate measured about 57 fps at 2×, but the
  measurements are noisy.

**Drawing**

- The eucalyptus are puffy and generic.
- The Geisel Library is simplified.
- The Bengaluru far city and its coconut palm are thin.
- The closing laptop is a squash plus a lid sprite, not a true rotation.
- The sun patch through the panes is an approximation.

**Layout and text**

- On phones the floor is out of frame, so the floor objects don't show.
- On desktop, the band under the desk is quiet wall.
- The lane text switches from ink to cream at a fixed wall-brightness threshold.
  Around that point in a transition, contrast is lower for a moment.
- The covers shelf loads many Google Fonts.
