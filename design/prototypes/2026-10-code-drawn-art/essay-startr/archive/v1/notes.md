# StartR post-mortem — essay idea: "Features or distribution"

October 3, 2026. An essay-treatment prototype for San's feedback (every essay gets one
hand-made idea in a style chosen for it). The page is a draft of `/notes/startr-postmortem`
with the essay text verbatim (including the October 2 copy fixes) and one figure.

## The idea

The essay's turning sentence is "I kept thinking about features when I should have been
thinking about distribution." The figure makes that felt rather than stated:

- **Glyp is pencil.** Each "Add a feature" press makes the blue pencil (the cover's pencil,
  now with eyes) write a kraft tag and spike it onto a wobbling tower on the GLYP block.
  Tentative, erasable, piling up. The tower sways more as it grows.
- **The competitors are ink.** In the same moment, Sudowrite and Jenni AI print one more
  stretch of letterpress road towards the readers, stamped with the essay's own milestones:
  getting users, growing users, keeping users, making money.
- **Glyp's road stays dotted** ("distribution ?") no matter how many features you add.
- "Second-guess the core" makes the pencil scribble over the GLYP block and add a "?".
- **Pivot to Glyp Podcasts** draws a microphone on top of the tower; the stamp lands:
  SAME FUNDAMENTAL PROBLEMS. Then the pencil writes the lesson, "distribution matters way
  more than features", and finally inks Glyp's path to the readers.

Conviction is ink; second-guessing is pencil. The style matches the code-drawn cover
(kraft, letterpress black and red, blue pencil).

## What the reader can do

- Watch: it autoplays a 30-second sketch when scrolled into view.
- Take over at any point: **Add a feature** (up to nine), **Pivot to Glyp Podcasts**
  (after three features), **Start over**. Buttons are 44 px tall, keyboard focusable, and
  a live status line narrates the state ("Glyp: 4 features; their road: growing users").
- Reduced motion: no autoplay; it opens on the finished sketch, and each button jumps
  straight to its end state.

## Facts and labels

Every word in the figure is from the essay: share, edit, collaborate, readers as
participants (The Pitch); tweaking features, new angles, second-guessing the core (founder
mode paragraph); the four milestones and "picked specific niches" (competitors); Glyp
Podcasts and "same fundamental problems" (pivot); the lesson sentence. The two extra tags
("another tweak", "one more angle") only appear if the reader keeps pressing. The figure is
labelled "a sketch, not data"; it has no numbers, users or dates beyond "fall 2023".

**Draft for San's voice:** the caption ("Features or distribution. Each feature you add to
Glyp is pencilled onto a tag. In the same time, the competitors print another stretch of
road to readers. A sketch of the essay's argument, not data.") and the status lines.

## Files

- `index.html`: the page (nav, cover frontispiece, verbatim essay, figure after "What Went
  Wrong", before the Glyp Podcasts paragraph). `cover.webp` is a copy of the site's cover still.
- `js/figure.js`: the figure (Canvas 2D, no libraries). Hooks: `?t=<seconds>` freezes the
  autoplay at that moment and sets `window.__ready`.

## Checks (headless Chromium)

- Interactions driven with Playwright on desktop (mouse and keyboard), phone (touch,
  390×844) and reduced motion: all states reachable, no console errors, no horizontal scroll.
- Frame time: 60 fps at 1440@2x, 1440@1x and 390@3x after baking the paper, header,
  readers and tag sprites once per size (an earlier version ran at ~15 fps at 2x).

## Weaknesses

- The tag tower on phones reads small; the labels are 17 px in a 380-unit drawing.
- The pencil's motion between tasks is a simple eased glide, not hand-like.
- The readers are simple pencil heads; they only react by looking at the road when it arrives.
- Fonts (Caveat, Old Standard TT, Anton, Abril Fatface) come from Google Fonts here; the
  production port should self-host them like the cover fonts.
