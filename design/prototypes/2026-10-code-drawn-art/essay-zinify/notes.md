# ZINify at the copy center (essay idea, version 2)

October 3, 2026. A rebuild of the ZINify essay idea with its own art style, after San
rejected the first draft for reusing the riso look of the Winning by Overfitting figures
("the art style cannot be just repeated"). The first draft is kept in `archive/v1/`.
This is a prototype for a route like `/notes/zinify`; nothing is placed on the site.

## The idea, and why it is unique on the site

Zines were made at the photocopier: cut, paste, copy, fold, staple, pass it on. So the
figure is a photocopied flyer for a copy center, printed in black toner on blue copy paper.
The ZINify paper is cut down, pasted up, given pictures, copied, folded and stapled into a
zine about itself. Then the reader can copy the copy, and watch each generation degrade.

Nothing on the site looks like this. Every image comes from `toner.js`, a photocopy simulation
written for this piece:
- black toner only, on two copy-paper colours;
- solids with white drop-outs;
- a coarse, broken dot screen for greys;
- dot gain, loose toner specks and drum streaks;
- generation loss: each copy of a copy is skewed on the glass and re-thresholded, so lines
  thicken, dots clump together and fine type fills in.

The lettering is cut-and-paste: ransom-note headlines from seven different typefaces,
typewriter strips held down with matte tape, and black marker.

There is no riso engine, no clear line, no letterpress, and no ink beyond black.

## What the reader can do

- **Put the paper through.** Drag the ZINify paper onto the copier glass, tap it, press
  Enter on it, or press “Make the zine”.
- **Watch the four steps.** Tags across the top (CUT · PLAN · PICTURE · COPY) are ringed in
  marker as each one runs, and a status line explains each step in words:
  1. **Cut.** Scissors cut the paper into bands and cut Figure 1 out (it skips ahead, as in
     the paper's Fig. 2). The bands are trimmed down.
  2. **Plan.** A paste-up sheet slides in. Scraps of text land in eight page boxes, and the
     equation scrap flips over into the poem.
  3. **Picture.** A prompt slip lands in each box, then flips over into a halftone picture.
     The cut-out figure drops straight into the "how it works" box.
  4. **Copy.** The paste-up goes face down on the glass and the lid closes. The copy light
     leaks out of the seams (ka-CHUNK, WHIRR…), and two sheets slide out onto the tray. They
     fold, and the stapler bites the spine.
- **Skip to the zine** at any time (about 14.5 s otherwise).
- **Read it.** On desktop the zine opens as spreads, with a page that curls over in
  perspective. On phones you see single pages that slide. Turn pages with Next/Back, the
  arrow keys, a tap on either half, or a swipe.
- **Copy the copy** (up to generation 5). A copy light sweeps the open zine, and each new
  generation is a real copy of the last one.
- **Unfold the sheets** to see the two printed sheets, both sides, as they would be imposed
  for printing at home.
- **Start over.**
- **Reduced motion:** “Make the zine” opens the zine straight away, turns are instant and
  the idle scene doesn't move. Drawing stops off screen and in hidden tabs, and the run's
  clock pauses.

## Sources and what is true

Re-read on 2026-10-03:
- the project page https://jaidevshriram.com/zinify-uist/
- the paper PDF linked there (`media/zinify.pdf`)
- `src/data/profile.js`

- **The four steps** follow the paper's Methodology and Fig. 2:
  - Claude summarizes the text and selects figures, guided by their descriptions;
  - Claude plans the zine, and user input can steer it;
  - the plan produces prompts for a text-to-image model (the paper names DeepFloyd IF);
  - the elements are combined into a multi-page PDF using a pre-determined layout.
  The figure bypass in Fig. 2 is the cut-out figure skipping the plan.
- **The zine pages** paraphrase the paper: the walled garden and paywalls; the reader and
  their steep learning curve; the author in an exponential pile of AI papers on arXiv, and
  figure placement mattering; zines' punk and queercore roots, self-publishing and small runs
  “not unlike” preprints; the pipeline; equations into poems.
- **The poem** on page 7 is quoted from Fig. 3 (first four lines). The equation is the one
  shown there.
- **Names:** the paper lists the authors as Jaidev Shriram and Sanjayan Sreekala, equal
  contribution. The byline uses San Kala, as the rest of the site does; the back cover uses
  the paper's names.
- **Honour:** “Honorable Mention (People’s Choice)” comes from the project page.
- **Made up for the page:**
  - the copy center, the copier, the 10¢ sign, glue stick and tape;
  - the scissors, paste-up sheet, fold and staples (the caption says ZINify outputs a PDF);
  - “ISSUE #1”;
  - the order and wording of the zine's pages.

## Draft copy for San's voice

Everything in the page prose is a draft to be rewritten in San's words: the deck, the
opening paragraph, “How it works”, “Why zines”, the caption and the footer note. So are the
status-line sentences and the marker jokes on the flyer (“copy me!”, “cut. paste. copy.”,
“copy me & pass it on”).

## Files

- `index.html` (171 lines): the essay page, the figure controls and a text version of the
  zine for screen readers.
- `js/toner.js`: the photocopier: the toner screen, text mode, specks, streaks, generation
  loss and copy paper.
- `js/paste.js`: ransom lettering, typewriter strips, tape, marker lines, rings, arrows and
  starbursts.
- `js/masters.js`: every drawing as a greyscale master, including the copier, paper,
  scissors, stapler, paste-up, the eight zine pages and their pictures.
- `js/figure.js`: layout, sprite cache, timeline, reading, copying the copy, unfolding and
  input.

Review hooks:
- `?t=<seconds>` freezes one moment of the run and sets `window.__ready = true`;
- `?t=-1` shows the idle scene;
- `?t=15&page=N&gen=G&unfold=1` shows the zine.

## Iteration log

1. First render: the copier read well as a photocopy. The paper's title overflowed its
   sheet, and the middle of the flyer was empty.
2. The plan and copy phases: the scan light looked like a reflection on the lid, the output
   tray read as a stick, and the stapler step happened after reading started.
3. Reading: ransom headlines ran off the pages, and generation 3 was illegible mush (copies
   were made from the master with heavy blur).
4. Headlines now refit smaller when they don't fit. Generations became real
   copies-of-copies in text mode. The copy light leaks from the seams, the timeline was
   re-timed, the step tags are hidden while reading, a copy flash was added, and the counter
   props (price sign, glue, tape) and a dashed "drag me onto the glass" arrow were added.
5. Sheets now slide out of the slot and lie on the tray's tilted plane. The stapler bites
   the spine and leaves two staples. Blackletter Z and S read as 3 and 6, so they are now
   cut from another face. The pipeline labels were moved off the page edge.
6. Phone layout: moved the copier down so the lid isn't cropped, and put the props under the
   cutting area.
7. Moved the counter props so the paste-up doesn't cover them. Interaction run with
   Playwright: drag, Enter, skip, Next, arrow keys, tapping the halves, copy ×2, unfold,
   reset, phone tap and swipe, reduced motion. Fixed a stale page number on phones.
8. Tuned generation loss so generation 2 is still readable and generation 5 is nearly gone.
   Frame timing across a full run: p50 16.7 ms, p99 16.8 ms, worst 50 ms (sprites build in
   slices), at 1440×900 and at 2× and 3× phone density, in headless Chromium.

## Weaknesses

- Timings come from headless Chromium, not real devices.
- Small type on the paste-up and in the poem strip is hard to read at phone size,
  especially on generation 2 and later; that's partly the point, but the poem is the best
  line in the zine.
- The fold is a simple 2D half-fold, not paper physics.
- The phone layout has some empty blue at the bottom during the copy step.
- Eight Google Fonts families load for the cut-up lettering; production would self-host
  subsets.
- Copying the copy builds each page's next generation the first time it is shown, about
  50–100 ms per page at 2×.
