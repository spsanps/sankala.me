# Plates — notes

Proposal 2 from the code-drawn art study: a /now page on sankala.me where each month
gets one plate drawn in code, in a process San has not used before. The current month
sits large and alive at the top. The year sits below in a strict grid, and "Play the
year" plays the filled plates full-bleed, one beat each, cutting hard from one plate's
colour field to the next.

It takes the idea of Sivers' /now (what you'd tell a friend you hadn't seen in a year),
Allysen's reading list (a year as a collection of equal objects), Kate Sparkle's years
of drawings cut to a beat, and the Still Point (one practice, many materials). It copies
none of their surfaces.

## The plates

| Month | Process | Why this process |
| --- | --- | --- |
| Oct 2026 (current) | paper-cut collage | This month is about gathering references and arranging them, which is what collage is. Cut and torn paper, white torn cores, shadows that turn with the light. |
| Dec 2025 | mezzotint | An image burnished up out of black suits two robot arms lifting a laurel together (GPT-7 Will Have Arms; first place at the NeurIPS EAI Challenge with his brother). |
| Jan 2026 | sumi ink wash | A Clauiet Life is a quiet bee in a garden. Mostly empty paper, a few strokes and one vermilion date seal. |
| Jul 2026 | suminagashi | Ink dropped again and again at one point is a loop. The rings form a target, and the last drop, the only red one, lands dead centre (Winning by Overfitting). |
| Sep 2026 | pochoir | Paper Robots began, so a deco picture palace. The robot watches its two films from a seat, beside two small one-eyed friends from the channel's world. |

All five processes are new relative to the first samples, which used riso, cyanotype,
engraving, linocut, woodblock, gouache, origami, cross-stitch, letterpress, screenprint,
camcorder halftone and the Swiss poster.

## Facts and honesty

- **Sources:** the months come from `src/data/site-content.js`, `src/data/work.js`,
  `src/data/history.json`, `AGENTS.md` and `docs/online-presence-plan.md`. Nothing else is
  claimed.
- **Plates drawn after the fact:** the plates before October were drawn later, as a
  demonstration. The page says so above the grid and in each caption ("drawn later").
- **Empty months stay empty:** Feb–Jun and Aug 2026 have nothing documented, so their plates
  are blank paper with pencil registration marks. Nov 2026 is marked "Not yet".
- **Illustration, not record:** the robot's two films on the pochoir screen are a many-armed
  robot and a large eye, standing for The Coming Robotics Revolution and How to Please a
  Capricious God. The collage references are generic: a book, bowls, a
  watercolour tin, film, a torn sun. No specific titles are shown.

## Draft copy for San to rewrite in his own voice

- **Intro:** "What I’m doing this month, drawn by hand in code. One plate a month, each made
  in a process I haven’t tried before."
- **October caption:** "Working out what my taste actually is, and whether art drawn by hand
  in code belongs on my sites."
- **Grid lines:**
  - "GPT-7 Will Have Arms; first place at the NeurIPS EAI Challenge, with my brother"
  - "A Clauiet Life: a bee in a quiet garden"
  - "Winning by Overfitting: a loop that kept hitting the evaluator’s mark"
  - "Paper Robots began: two films, a separate site"
- **Footer:** "A /now page: what I’d tell a friend I hadn’t seen in a year."

## Files and hooks

- **Page:** `index.html`, the page and its CSS. `js/kit.js` holds the PRNG, noise, float blur,
  paper and one shared WebGL2 context. There is one file per plate, plus `js/plate-blank.js`
  and `js/app.js`.
- **Review hooks:**
  - `?t=<s>` freezes every plate at that moment.
  - `?play=1` opens "Play the year".
  - `?solo=<yyyy-mm>` shows one plate full-bleed.
  - `window.__pageAt(t)` and `window.__reelAt(t)` draw frames for recording.
- **Runtime behaviour:**
  - Only visible plates animate, each at its own frame rate.
  - Reduced motion shows stills, and the montage then steps through them on click.
  - The page pauses when hidden, and DPR is capped at 2.

## Known weaknesses

- **Slow in headless review:** the suminagashi shader runs up to about 100 history steps per
  sample. Under headless SwiftShader its work queues behind later builds. That should be
  fine on a real GPU, but it has not been measured on real hardware.
- **Sumi build time:** about 0.8 s for a 1120×1400 plate. "Play the year" prebuilds every
  plate at screen size behind a short "Preparing the year…" message.
- **Mezzotint at grid size:** the robot grippers stay murky, and the image reads mostly as a
  glowing wreath.
- **Marbling on wide screens:** the plate fills only its 4:5 sheet, so the sides are plain
  paper.
- **Collage:** the lower half of the blank sheet is deliberately unfinished, which may read as
  empty.
- **Montage:** at five plates it plays for nine seconds. It becomes a true year only once
  twelve months are filled.
