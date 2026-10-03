# The apse: a homepage designed for mosaic from the start

October 3, 2026. The last mosaic test, built so San can choose between it and the live clear-line
homepage. Not committed.

## Why this study exists

San on the arched window (`../four-frames-arch/`, v3): "I'm not sure why it doesn't work. Is it
because the rest of the page is not designed with this in mind? There is some kind of distance. I
feel like the plain lines work because maybe it was designed with that in mind from the beginning.
Maybe it has to be more central… not sure why it doesn't have that oomph."

The diagnosis (not disputed): the live drawing *is* the room (the page is the painted wall and his
words sit on it, the clear line speaks the same language as the clean type, and it shows his desk
and his life). The window was a framed picture placed beside a page: a heavy-texture medium next to
clean type, a view with no person in it, and a medium whose power (monumental scale, standing inside
it, light glinting on glass and gold) a mid-size panel cannot deliver.

So here the mosaic is the architecture of the page: monumental and central, his things in it, the
type part of the same world, and the material light that only mosaic has.

## What it is

- **The first screen is one mosaic wall.** Lapis glass strewn with gold stars (the vault of Galla
  Placidia), and in the middle a great apse: a gold conch inside a jewelled archivolt (a dark row,
  gold, gems alternately oval and square in ruby, emerald and sapphire with a pearl between each
  pair, gold, a cream marble edge). A cornice band crosses the whole wall at the conch's floor. On a
  wide screen the apse is broad (a half-disc on short upright sides); on a phone it is a tall,
  round-headed apse. The same drawings serve both: the conch's floor height `F` decides the shape
  and everything in the scene is placed from it (`geom.js`, `sceneAnchors`).
- **His things, not a view.** In the conch stands San's desk with its attributes, the way an apse
  shows one figure with the things that identify it: the red lamp, a stack of books with gilt
  spines, the laptop (its screen dark glass with lines of code in gold, teal and rose), the blue
  paper robot, and a telescope on its tripod aimed at the sky, with his chair pulled out in front,
  empty, as if he has just stepped away (a Byzantine apse would call it the *hetoimasia*, the
  prepared seat). The desk top tips up toward you a little, as Byzantine tables do. The place's
  landscape stands behind.
- **The words belong to the mosaic.** The intro is real HTML on a *tabula ansata* (the Roman
  inscription tablet with a dovetail handle on each side) set into the wall below the cornice: a
  book-matched slab of pale veined marble in a frame laid in tesserae (dark, gold, porphyry red,
  gold). The heading is in Marcellus, a typeface drawn from flared Roman inscriptional capitals; the
  body is EB Garamond. Both are self-hosted (`fonts/`, OFL). The place and the hour are written in
  gold capitals on the cornice band ("San Jose · 3:00 pm"), like the inscription bands at the foot
  of a conch. The nav stays plain, in the top corners of the wall beside the crown (in a band
  across the top on phones and narrow screens).
- **Material light.** A WebGL layer (`glint.js`) lights every gold, silver and glass stone by its
  own tilt. Each stone gets a random angle plus a slow, patchy drift across the wall (as setters'
  hands leave it), and the conch's stones also lean toward its middle, because a conch is concave.
  Each frame the layer lights them from one point: the pointer (eased), a tilted phone, or else a
  slow drift. A soft warm pool travels across the gold where it reflects the light, stones inside it
  flare one by one, and the gold further off settles a little deeper. Glass (the lapis, the gems,
  the lens) only takes rare, small white glints, and matte stone none. The stones never move; only
  their light does.
- **Four places on scroll**, newest first. The architecture stays; the conch is re-laid in a wave
  from its upper right, each stone turning over to show the next place (the arch study's
  transition). The desk and its things stay in every place; the landscape and the light change.

| Place | Behind the desk | Conch | Small things that move |
| --- | --- | --- | --- |
| San Jose, 2024–now | Mt Hamilton with the Lick Observatory's domes, golden foothills with valley oaks, the city in the valley, poppies | San Jose's real time: gold by day, warm gold at the golden hour, rows of lapis, violet, rose and coral at dusk, lapis with eight-pointed gold stars at night (with a faint glow over the valley), the sun or the moon in its real phase on an arc from left to right | hawks by day; at night the city lights flicker, the great dome's slit glows, the lamp is lit and its light falls in gold rays onto the desk |
| San Diego, 2022–24 | the Geisel Library (podium, splayed piers, six stepped floors), the Pacific, the Torrey Pines bluffs with a Torrey pine, a lawn with drifts of flowers | morning gold, the sun low on the left | gulls; swells and glitter on the sea |
| Bengaluru, 2019–22 | flat pastel roofs with black water tanks, a gulmohar in flower, a red-oxide terrace with a pot of tulsi | gold with monsoon clouds laid the Byzantine way, as long streaks of cream, blue-grey, slate and rose (like San Vitale) | two kites tugging on their strings; cloud edges catching the light |
| Surathkal, 2015–19 | the Arabian Sea with the moon's path on it, the red-and-white lighthouse on its headland, a coconut palm, a fishing boat drawn up on the beach | lapis with gold stars and a silver full moon (the astronomy club years) | the lighthouse beam sweeping in gold, stars twinkling, the moon glittering on the water, the lamp's rays |

- **Below the fold** the same building goes on. The words of the path ("My path so far", then one
  marble tablet per place with all the milestones and the real photographs in gilt frames) slide up
  under the cornice like an inscription passing beneath the apse. The mosaic then ends in a border
  (dark, gold, porphyry, gold, dark), a few loose stones lie on the plaster beneath it, and the
  covers shelf and the colophon follow on plaster with the same capitals, gold, lapis and porphyry.

Facts come from `src/data/history.json`, `profile.js` and `work.js`. The objects are illustrative, and
the landmarks are geography rather than documentation (the observatory is enlarged; the library is
schematic).

## How the page is built

Back to front, inside `.apse` (sticky elements, so nothing is fixed): the wall canvas (the whole
screen, laid once and drawn once), the lane of words (scrolling), then the band above the cornice
(architecture, the conch's own canvas, the glint canvas, the nav and the caption). Both sticky
layers are 100svh tall so they leave together at the end of the section; the front one ignores the
pointer except over the band, so hidden text under the conch is not clickable. `scroll-margin-top`
keeps keyboard focus out from under the band.

## Files

- `index.html`: the page, its CSS and the self-hosted font faces.
- `js/main.js`: the words (the homepage's copy, every milestone once), the shelf, the tablets, hooks.
- `js/geom.js`: the apse's geometry for any screen, the scene anchors and the shape helpers.
- `js/arch.js`: the architecture's regions, stars and pearls, colours and materials.
- `js/desk.js`: the desk and its things, the chair, the lamp's rays, the desk's shadow, outlines.
- `js/places/sky.js`: the conch's ground (gold, dusk rows, lapis) and the star field.
- `js/places/sanjose.js`, `sandiego.js`, `bengaluru.js`, `surathkal.js`, `life.js` (birds, kites).
- `js/stage.js`: laying, painting, the modelling (a light row inside each thing's lit edge, a dark
  row inside its shaded edge), the wave, the living details, the light and the glint.
- `js/glint.js`: the WebGL light. `js/tablet.js`: the marble tablets. `js/frieze.js`: the border.
- `js/lay.js`, `js/field.js`, `js/core.js`: the laying engine from the arch study, generalised (the
  panel and the clip are options; each region's field is computed only in its own box; all of a
  region's rows come from one sweep of its field; halo rows let a gold ground hug each figure with
  two rows and then follow the arch; stones can be set before the rows, like the stars).
- `build.sh` makes `js/bundle.js` so the page opens from `file://`. `photos/`, `covers/`, `fonts/`.

## Hooks

`?hour=0–24` (San Jose), `?era=now|sd|blr|nitk`, `?pos=0–3` (a moment between places), `?t=<s>`
freezes and sets `window.__ready`, `?all=1` lays every place first, `?plain=1` the still version
(also what reduced motion gets: stills, the wall's light fixed, no glint motion, no wave). Review only:
`?light=x,y` puts the light at a fraction of the band, `?glint=0` turns the glint off, and with `?t=`
the page exposes `__renderAt(t, pos)` and `__light(x, y)`. Animation stops when the tab is hidden or
the apse is off screen; the device pixel ratio is capped at 2.

## Measured (headless Chromium, software rendering on a shared, loaded machine; not a real device)

| Screen | First frame | Page ready (intro tablet painted) | All four places laid | Frame (median / 95th pct, scrolling through every wave while the pointer moves) |
| --- | --- | --- | --- | --- |
| 1440×900 | 2.0 s | 2.7 s | 7.0 s (in the background) | 0.2 ms / 31 ms |
| 1280×720 | 2.0 s | 2.6 s | 7.4 s | 0.1 ms / 18 ms |
| 390×844, 1x and 2x | 1.25 s | 1.6 s | 3.7–3.8 s | 0.1 ms / 5–7 ms |

The architecture is about 42,000 stones at 1440×900. The 2D conch is redrawn only when the scroll
moves or at 15 fps for the living details; the glint is one WebGL draw per frame and is skipped when
the light hasn't moved. No console errors and no horizontal scroll at 1440×900, 1920×1080, 1280×720
and 390×844; reduced motion checked with an emulated preference. The engine was sped up for this
page: each region's rows now come from one sweep of its field, and the fit has typed-array inner
loops and one relaxation pass fewer. That cut the 1440×900 first frame from 6.8 s to 2.0 s.

## Honest assessment

- **Oomph.** It has much more than the arched window. The first screen is one designed wall: a
  monumental gold apse in a starry lapis wall, his desk in it, his words on a tablet set into the same
  wall, the place and hour written on the cornice. As the pointer moves, a warm pool of light
  travels over the gold with stones flaring in it, the thing a screenshot cannot show and the closest
  the screen gets to standing in Ravenna. The phone version is a tall apse and holds up well.
- **One world?** Yes: the type (inscriptional capitals, Garamond on marble), the frames, the cornice
  and the plaster shelf below share one palette and one logic. Nothing on the page is outside the
  building.
- **Readable at a glance?** The desk, lamp, laptop, robot, telescope and chair read immediately; the
  four places read by one or two landmarks each.

## Weaknesses

- It is a big change of character from the live site: a dark, ornamented, church-like wall instead
  of a light, quiet room. The warmth is in the gold; the overall key is dark. Night places (San Jose
  after dark, Surathkal) turn the conch to lapis and it then blends with the wall; only the jewelled
  archivolt separates them. That is like Galla Placidia, but less striking than the gold.
- The things are simple shapes with dark outlines, so at a glance they are closer to an icon set than
  to the subtle modelling of real Byzantine figures; a lit row and a shaded row inside each edge
  help, but only a little. Small details (the robot's eyes, the code lines, the observatory's slit)
  are one or two stones wide.
- The ground under the desk is the weakest area in every place (golden grass, lawn, terrace, sand);
  the chair and the desk's shadow hold it together but it is still mostly a field.
- The words scroll through the strip under the cornice (about a third of the screen on a desktop),
  so reading the whole path is like reading an inscription through a letterbox; at 1280×720 the strip
  is about 250 px.
- The desk is re-laid along with the landscape in each wave (its stones turn over too), because every
  place is laid as one layer.
- Landmarks are schematic and enlarged (the observatory, the library); the oaks and the San Diego
  flowers can look like scattered dots; the Bengaluru roofs are pastel blocks.
- The glint is tuned by eye on a software renderer; on a real GPU and a bright screen it may need to
  be a touch stronger or weaker. Device tilt is untested on a real phone; iOS needs a tap on the
  "Tilt your phone" button.
- First load lays about 42,000 stones for the wall before anything shows (about 2 s here). The page
  would want a pre-rendered still for first paint, as the live homepage has.
