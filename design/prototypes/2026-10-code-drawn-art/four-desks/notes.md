# Four desks

A sankala.me homepage prototype that tries to combine San's references into one idea,
rather than one sample per reference. Built October 2, 2026. It's a proposal, not a decision.

## The idea

One desk, one window and one pinboard, always seen from the same seat. As you scroll back
through San's history, the same view re-prints in an older hand process:

| Years | Place | Process | Through the window |
| --- | --- | --- | --- |
| 2024 – now | San Jose | gouache, painted live | Mt Hamilton and the Lick domes, the valley, tiled roofs, a fan palm |
| 2022 – 2024 | San Diego | three-drum risograph | the Geisel Library, eucalyptus, the Pacific |
| 2019 – 2022 | Bengaluru | line engraving with a red plate | rooftops with water tanks, a coconut palm, a flame tree in flower, black kites |
| 2015 – 2019 | Surathkal | cyanotype with palm-frond photograms | palms, the lighthouse, the Arabian Sea |

Each era's material encodes time: the older the memory, the older the printing process. Only the
present is in colour, and only the present is live. Its window follows San Jose's real sky:
- the sun's elevation and colour
- the moon's position and phase
- stars after dark
- valley lights and freeway traffic at night

The lamp comes on after sunset. In the morning, sunlight lays the window's panes across the desk,
and the laptop, books and robot cast shadows into that patch. The patch moves with the real hour.
Between eras, an ink roller sweeps across and re-inks the scene into the next process. The
composition stays registered, so you see exactly what changed.

## How it answers the references without copying them

- **Allysen (a live loop behind a few words).** Instead of a phone clip behind text, the scene
  shares San's actual time of day. The words sit beside the scene, not over it.
- **The Still Point (one subject, many materials).** One desk across many years. The materials are
  dated to the eras, so they carry meaning instead of being a style tour.
- **Lee Robinson (the illustration carries place, the type carries rank).** The window carries each
  place, and the column carries the history in San's own wording from `history.json`.
- **The reading list ("let the covers make the palette").** The shelf of real covers comes from
  `../covers/` and is unchanged. The books on the desk carry their colours.
- **Space Bunnies, Kate Sparkle, riso.** These live in the processes themselves: halftone,
  misregistration, a few inks, never black in the riso.
- **"Real parts of a life should stay real."** The photographs are the one thing not drawn in code.
  They're pinned to the board, printed in each era's process, and shown in true colour beside the text.

## Documented vs. illustrative

Documented in the repo, so these are real:
- The places and years, and every line of text (from `history.json` / `profile.js`).
- Every photograph.
- ZINify and zines, the StartR post-mortem, the eBay ML Challenge (first of 591).
- The NITK lab oscilloscope with a square wave (from `nitk-lab.jpg`).
- The Amateur Astronomy Club, which is why there's a telescope and a star chart.
- The IEEE DISCOVER best paper, ASIC design at TI, and the Paper Robots robot.
- The book titles on the desk, which are San's own works.

Illustrative, invented for the picture:
- The desk, lamp, window, pinboard and their arrangement.
- That the window faces Mt Hamilton (east-north-east). This is a plausible San Jose view, not San's.
- The laptop "writing" token by token.
- The coffee cup and sticky notes in San Diego.
- The monitor, keyboard, datasheets, pens, evaluation board and loupe in Bengaluru.
- The breadboard and planisphere in Surathkal.
- The flame tree and kites.
- The Lick domes are simplified.

## Questions for San that would make it truer

1. What is actually on your desk now, and which way does your window face? What do you see from it?
2. Is there one object that has travelled with you through all four places? It could become the
   one thing that stays in colour in every era.
3. In San Diego and Bengaluru, where did you actually work: a lab, an office, a room at home?
4. Would you rather the present follow your real time of day, or a fixed late afternoon?
5. Should the robot be on your personal desk at all, or stay on Paper Robots?

## Review hooks

- `?t=<seconds>` freezes one frame.
- `?hour=<0–24>` sets San Jose time.
- `?era=now|sd|blr|nitk` jumps to an era; add `&roll=<0–1>` to see the roller mid-pass.

Phones get each era as its own 4:5 print above its text. The roller prints it once it scrolls into view.

## Files

- `index.html`: the page and its type system (the live site's Fraunces + DM Sans, paper, ink, links).
- `js/core.js`: noise, colour, San Jose time, sun and moon positions, the two layouts.
- `js/scene.js`: the room as geometry, plus each era's window view and objects.
- `js/materials.js`: the four processes:
  - gouache, lit by the hour
  - riso separations with halftone and misregistration
  - engraving, with line direction following form
  - cyanotype exposure with a brushed emulsion edge
- `js/stage.js`: building and lighting each era, the live details, the roller, scrolling and phones.
- `js/covers-kit.js`: the cover renderers copied unchanged from `../covers/index.html`.
- `js/photos-data.js`: the photographs embedded so the canvas can read them from `file://`.
  It's generated from `photos/`.

## Known weaknesses

- Building each era takes a few seconds on first load, about 10 s for everything in headless
  software rendering. The present appears first and the prints follow. It hasn't been measured on
  real hardware.
- The gouache is believable but clean; it isn't yet as painterly as the best references.
- The riso Geisel Library reads as a stepped shape more than as the building.
- The engraving's wall and sky line screens are mechanically even.
- The cyanotype's sky is slightly flat.
- The sun only enters the window frame in the early morning. For most of the day the sky changes
  colour but the sun stays out of view.
- `?hour` changes only the hour, not the date. The moon phase and sun path follow today's date.
