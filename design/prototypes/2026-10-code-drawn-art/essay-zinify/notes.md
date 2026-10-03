# ZINify: paper in, zine out — essay idea

October 3, 2026. A prototype of what the ZINify page on sankala.me could be (a route like
`/notes/zinify`), made for San's feedback on per-essay treatments. Not placed on the site.

## What the reader can do

- **Feed the paper.** Drag the ZINify paper into the machine's slot, tap it, press Enter on
  it, or use “Feed the paper”. If you drop it short of the slot, it slides back.
- **Watch the four steps**, each in its own porthole, with a status line in words:
  1. **Condense.** The page is cut into sections, and a figure card lifts away into the
     FIGURES pipe. That pipe is the paper's Fig. 2 bypass, which sends figures straight to
     image synthesis.
  2. **Plan.** Eight page boxes appear, and an equation card turns into a little poem.
  3. **Pictures.** A prompt (“A walled garden”) is drawn as a picture.
  4. **Assemble.** A drum prints the sheet.

  Section strips, tags and pictures ride the belt between stations, with CHUG, SNIP SNIP,
  WHIRR and DING sounds lettered on.
- **The sheet comes out** printed with all eight pages (imposed: the top row is upside down,
  like a real mini-zine). It folds in half and accordions into a booklet, and the booklet
  flies to the reading spot.
- **Read the zine.** Desktop shows spreads and phones show single pages. The page turns are
  drawn in perspective strips. Turn with Next/Back, the arrow keys, a tap on either half,
  or a swipe.
- **Unfold the sheet** to see the whole zine as one page, with fold lines and the pink cut
  line, so readers can make their own. “Run it again” resets.
- **Reduced motion:** feeding jumps straight to the cover and page turns are instant. On
  phones the unfolded sheet is rotated to fit the screen.

## Sources and what is true

Read on 2026-10-03:
- the project page https://jaidevshriram.com/zinify-uist/
- the paper PDF linked there (`media/zinify.pdf`)
- `src/data/profile.js`

The ACM page timed out.

- **Steps:** from the paper's Methodology and Fig. 2.
  - Claude summarizes the text and selects figures, guided by their descriptions.
  - Claude plans the layout, and user input can steer it.
  - The plan produces prompts for a text-to-image model (the paper names DeepFloyd IF as an
    example).
  - The elements are combined into a multi-page PDF using a pre-determined layout.
- **Zine pages:** these paraphrase the paper (introduction, background, objective). The
  verse on page 7 is quoted from the paper's Fig. 3, cut after four lines.
- **Honour:** “Honorable Mention (People’s Choice)” is from the project page; profile.js
  says “Honorable Mention, Student Innovation Contest”.
- **Names:** the paper lists the authors as Jaidev Shriram and Sanjayan Sreekala, equal
  contribution. The byline uses San Kala, as the rest of the site does, and page 8 uses the
  paper's names.
- **Illustrative, not claims:**
  - the eight-page one-sheet fold (the caption says the real output is a PDF);
  - “ISSUE #1”;
  - the machine itself;
  - the order of the zine's pages.

## Draft copy for San's voice

Everything in the page's prose is a **draft**: the deck, the opening paragraph, “How it
works”, “Why zines”, the caption and the footer note. It was written plainly from the paper
and should be rewritten in San's words. The status-line sentences are drafts too.

## Files

- `index.html`: the essay page and figure controls, plus an accessible text version of the
  zine's eight pages.
- `js/riso.js`: the three-ink riso press, copied unchanged from `../essay-by-hand/`.
- `js/zine-pages.js`: the eight pages, the input paper and a few extra letterforms.
- `js/fig-zinify.js`: the machine, the timeline, the fold, the reader and the input.

Review hooks:
- `?t=<seconds>` freezes one moment and sets `window.__ready = true`;
- `&page=N` (spread, or page on phones);
- `&turn=N&p=0.5`;
- `&unfold=1`;
- `&hint=0`;
- `&drag=x,y`.

## Iteration log

1. First full render: the machine read, but the porthole content was tiny, the machine had
   no name, and the θ and ω glyphs were missing (say() upper-cases its text).
2. Bigger portholes, the ZINIFY nameplate, larger belt items, CHUG and SNIP lettering, and
   lighter shading on the turning page.
3. Moved the crank, which collided with the ZINE OUT slot.
4. Phone layout first pass: the vertical machine worked, but the labels were small and the
   unfolded sheet was tiny.
5. Slowed each station from 2.2 s to 2.6 s so every porthole finishes its gag, added a
   pressure gauge whose needle climbs while the machine runs, and rotated the unfolded sheet
   on phones.
6. Drove every interaction with Playwright on desktop, a touch phone and reduced motion:
   drag, tap, Enter, Next/Back, arrows, tap halves, unfold, run again.
7. Queued page turns pressed during a turn, and measured frame cost.
8. Phone layout second pass: tried sticky controls, but they covered the figure.
9. Shortened the phone figure to fit one screen (772 px tall at 390 px wide) and dropped the
   sticky bar.
10. Fixed a stale status line and final frame after a turn ended.
11. Fixed see-through page turns and partial dimming. Clearing used the last halftone
    pattern as its fill, so it only cleared in dots. Smoothed the paper's bend into the
    slot.

## Weaknesses

- **Frame cost** (headless Chromium, software raster):
  - 1×: about 23–32 ms per frame;
  - 2×: about 115–165 ms per frame;
  - rebuild on resize: 44 ms at 1× and 126 ms at 2×.

  Most of the cost is compositing the three ink layers with speckle each frame. A real GPU
  should do better, but this hasn't been measured on hardware. A production version should
  cap the canvas size, or skip re-compositing static frames.
- **Phone portholes:** the content is small and the gags read as gestures.
- **The fold** is a 2.5D cheat: foreshortened panels and a stacked booklet, not true paper
  physics or a crease.
- **The run is about 15 s** before the zine is readable. The status line explains each step,
  but impatient readers can't skip ahead yet. A skip control would help.
- **Fonts:** DM Sans and Fraunces come from Google Fonts, as in the other prototypes.
