# Paper Robots, made not generated

Proposal 3 from the code-drawn art study (2 October 2026): a version of
paperrobots.studio where every image comes from code. The robot is defined once,
each film picks one hand process, and that process produces the film's four
formats: poster, YouTube thumbnail, Shorts loop and title card.

Open `index.html` directly. `?t=<seconds>` freezes every canvas at that moment.
Reduced motion shows stills. Save PNG renders a format at its real pixel size;
it works from a local file and is hidden when the page is framed.

## The two hands

| Film | Process | Why |
| --- | --- | --- |
| 01 The Coming Robotics Revolution | Reduction linocut, three blocks (ochre, vermilion, cobalt) | The film's image is a burst of six arms out of one screen. Gouges make radiating cuts, and relief ink gives Paper Robots cobalt without a gradient. |
| 02 How to Please a Capricious God | Egg tempera and water-gilded gold leaf | Agents trying to please a watching god. Gold-ground painting was made for that subject: the eye opens *in* the gold, and the agents are painted small at its foot. |

What each process simulates:
- **Linocut:** a brayer ink sheet (roll streaks, blotches, paper tooth), per-block misregistration and white-line halos. Lettering is cut out of the block. Moving arms and eyes are recut every frame by the same seeded hand.
- **Tempera:** gold leaf squares laid in rows (uneven burnish, scratches, wrinkles, seams, rare tears showing red bole). Also incised rays, punched rosettes, flat paint modelled with fine hatching, and Voronoi craquelure. A light band moves across the burnished leaf.

## Files

- `js/kit.js`: noise, paper, ink sheets, press, gouges, lettering. Utilities are copied from `../paper-robot-materials`.
- `js/robot.js`: the skeleton, copied unchanged from `../paper-robot-materials`, plus the film 01 screen and arms and the film 02 agent.
- `js/linocut.js`: film 01 renderer and per-format layouts.
- `js/tempera.js`: film 02 renderer and per-format layouts.
- `js/strip.js`: the pencil skeleton, the robot in each film's hand, and the wordmark head.
- `js/main.js`: one scheduler. It handles lazy sliced builds, animates only visible canvases, and provides `?t`, reduced motion, resize and Save PNG.

## Facts used

All facts come from `/home/san/Projects/paper-robots/site/src/data/films.mjs` and the live site copy:
- Titles, runtimes (7:29 and 6:27), dates (September 6 and 8, 2026) and the YouTube links.
- "One model. A world full of hands." and "Please its god", both from the homepage.
- The Short's lines, which are the opening of the film 02 script.
- "GPT-7 WILL HAVE ARMS", the existing film 01 thumbnail text.

Nothing is monetized.

## Known weaknesses

- **Film 01, inside the screen:** the screen stays simplified. The robot's torso is only a sliver, and its hatching is coarse at small sizes.
- **Film 02, the eye:** it is the most "illustrated" element. The outline and clean sclera still read as more graphic than painted.
- **Film 02, the rocks:** they read as stepped terraces and could be more jagged.
- **Performance:** every frame was measured in headless software rendering (film 01 ≈ 20–60 ms per large canvas, film 02 ≈ 5 ms). Film 01 composites several full-canvas layers per frame, so posters and thumbnails animate at 12 fps. Real-GPU performance is untested.
- **Fonts:** lettering uses Fraunces via Google Fonts as the base glyphs, then cuts or gilds them. Offline, it falls back to Georgia.
