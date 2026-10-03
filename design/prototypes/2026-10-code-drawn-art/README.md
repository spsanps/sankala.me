# Code-drawn art — first samples

October 2, 2026. San shared `Visual Taste.html` (a page of references he collected,
built by another AI; its styling is not the brief, its content is) and the
"Still Point" animation posted by @cherry_mx_reds. He asked whether hand-coded
animation and drawing, iterated for a long time, could become part of his sites,
and for samples. These are proposals, not decisions.

The reading of *why* San likes these references (the hypotheses, predictions and
what follows from them) is in
[`docs/design/2026-10-02-visual-taste-analysis.md`](../../../docs/design/2026-10-02-visual-taste-analysis.md).
These samples test that reading.

## What the references have in common

Almost every reference does the same thing. It keeps the **container** strict
and lets the **material** vary:

- Allysen: a living field of light behind, one small quiet block of type in front.
- The 2025 reading list and the book covers: nineteen incompatible covers on one
  cream field read as one collection. "Let the covers make the palette."
- Made in SF: one repeated row; every maker in it is different.
- Lee Robinson: the illustration carries place (his two homes), the type carries rank.
- Kate Sparkle's X-Men montage: one drawing, one colour field, one hand-lettered line
  per beat. Every frame still works as a poster.
- muhlktea's Space Bunnies: six colours, never black, halftone for shade, white
  dashes for light. A camcorder overlay turns a drift into a story.
- The Still Point: one figure, one pose, one coffee, redrawn in about fifteen
  materials. The figure is the fixed part, and the material is what changes.

The Visual Taste page says it directly: "Repetition provides safety; deviation gives
life." The Still Point shows how that principle could work in motion.

## How code-drawn art fits

Code-drawn art is a way to make the varying material **by hand, at length**. That
means no diffusion model and no stock filter. Each piece simulates a physical
process: light through leaves, ink misregistration, carved woodblock edges,
halftone dots, thread and chalk. That simulation is where the effort (and the
thousands of lines) goes, and it is also what keeps the result from looking
generated.

So the proposal is to keep San's sites as quiet as the references and let
hand-coded artwork be the one living, varied material inside them. The constraints
for each piece are declared at the top of its file and kept.

## The samples

| Sample | Answers | Possible home |
| --- | --- | --- |
| `komorebi/` | Allysen: atmosphere behind, restraint in front | sankala.me intro, About or a /now page |
| `places/` | Lee Robinson: illustration carries place; San's longer history | sankala.me History/About |
| `covers/` | Reading list: the covers make the palette | sankala.me Writing and Notes |
| `paper-robot-materials/` | The Still Point and "the colour is the cut" | paperrobots.studio hero, film intro sting |
| `evidence-loop/` | Space Bunnies: "the overlay is the plot" | Paper Robots Reels/Shorts loop |
| `explainer/` | The translation habit: ZINify, the GPT-7 figures, Lee Robinson | A figure in the Winning by Overfitting write-up |

Each sample is one self-contained HTML file with no images or libraries.
`?t=<seconds>` renders one exact frame for review. Each one respects
reduced-motion. Gallery thumbnails are in `previews/thumbs/`. Full-size review frames and
videos (about 108 MB) stay local in `previews/full/`, which git ignores; the `notes.md` files
refer to them by name.

## The synthesis: three proposals (built the same day)

After San rejected Komorebi as a literal copy and asked for everything put together,
three proposals were built. The reasoning is at the top of the gallery page and in the
analysis doc.

| Proposal | Folder | What it shows |
| --- | --- | --- |
| Four desks | `four-desks/` | sankala.me homepage: one desk in four places and four processes, live San Jose time, real photographs |
| Plates | `plates/` | sankala.me /now: one code-drawn plate a month, each in a new process, with a "Play the year" montage |
| Paper Robots, made not generated | `paper-robots-made/` | Each real film's poster, thumbnail, Shorts loop and title card from one code-drawn look |

Two more were added before San's decision, to test unproven parts of the plan:

| Test | Folder | What it shows |
| --- | --- | --- |
| A scene, drawn in code | `film-scene/` | The opening of How to Please a Capricious God, re-staged as a 37-second, six-shot code-drawn film with the script's real lines |
| An essay, explained by hand | `essay-by-hand/` | The Winning by Overfitting write-up, verbatim, with three interactive hand-drawn figures |

Four desks and Plates embed or copy San's real photographs and covers code; everything
else is drawn in code. Each folder has a `notes.md` with sources, weaknesses and
questions for San.

## Four frames v2 (after San's review)

`four-frames/` is the landing page redrawn in one style (clear ink line with gouache), as a
full-page sticky painting with the text in a lane on the plain wall. The desk changes by hand
across the four places; San Jose follows real time. It includes San's updated intro and names
Chin. Awaiting San's review; questions are in its `notes.md`.

## Status

Built on 2026-10-02 as samples for San's reaction; all six are on the private gallery
https://claude.ai/artifact/1YKiNyoiy3MaTwJ7bw7nJi (source: `index.html` here, which follows the
Artifact page format without its own doctype). None is approved or placed on a live site. The newest work must not become the identity of sankala.me (September 9
correction), so the sankala.me samples are about place, light and the existing
writing archive. The robot pieces belong to Paper Robots.
