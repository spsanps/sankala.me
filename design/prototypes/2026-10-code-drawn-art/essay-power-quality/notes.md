# Essay idea: the power quality paper, with an oscilloscope you drive

Prototype for San's feedback, 2026-10-03. Not on the site. Route it would take:
`/notes/power-quality` (today the work links to `/research#power-quality`).

## What the reader can do

- **Press one of eight keys** beside the screen (NORMAL, SAG, SWELL, INTERRUPT, HARMONICS,
  TRANSIENT, NOTCH, FLICKER) to inject that disturbance. The trigger re-arms (WAIT), the
  trace sweeps in, then a row of LSTM cells reads it one 50 Hz cycle at a time. A cursor walks
  the trace, each cell lights with its own hidden-state pattern, and the confidence bars in
  the soft-key menu move as the reader changes its mind. It settles on a class and shades
  the cycles where it found the evidence.
- **Turn TIME/DIV** (drag, click or arrow keys) to see 5, 10 or 20 cycles. Flicker only
  becomes clear across many cycles, and the demo turns this knob itself when it shows flicker.
- **Turn VOLTS/DIV** to rescale, and **LEVEL** to move the trigger marker.
- **SINGLE** draws a fresh example of the same event. **RUN/STOP** freezes the screen.
- Before anyone touches it, the scope demos every event in turn. The tape note on the case
  says "try FLICKER at 40 ms".

Things worth watching, also said in the draft prose: on a notch the reader first guesses a
transient, then changes its mind as the bites keep coming. On a sag it says normal until
the dip arrives.

## What is real and what is illustrative

- **Real (from the repo):** the title, authors, venue, Best Paper Award and certificate link
  (`src/data/profile.js`, `work.js`); San studied electrical engineering at NIT Karnataka. The
  instrument echoes the digital scope in `public/images/history/nitk-lab.webp`: blue LCD,
  yellow CH1 trace, grey soft keys beside the screen, and its asset tag "NITK/EED/8900/8/19".
- **Illustrative:** every waveform is synthetic (230 V, 50 Hz, textbook disturbances), and the
  "network" is a small hand-built stand-in in `js/signal.js`. It extracts per-cycle features
  (fundamental amplitude, residual after removing it, spikiness), keeps a memory across
  cycles and turns that into confidences. It is not the paper's model, data, classes or
  accuracy. Nothing in the repo describes those, so the page claims none of them. The figure
  and caption say "illustrative".
- The stand-in classifies all 600 test acquisitions it was tuned on correctly (8 kinds × 3
  time scales × 25 seeds), with 82–93% final confidence. That only shows the demo behaves;
  it is not a result.

## Draft copy for San's voice

The four short paragraphs above the figure, the caption, and the paragraph after the
figure are drafts. In particular, check:
- "In 2019, at NIT Karnataka, we classified these events with long short-term memory
  networks." Is "we" right, and is NITK the right place to name?
- Whether the paper used a 50 Hz framing (India's grid frequency) and cycle-by-cycle input,
  or something else. The figure reads one cycle at a time because it explains the idea
  simply, not because the paper did.

## Files

- `index.html`: the essay page (site header, citation, prose, figure, footer).
- `js/signal.js`: synthetic waveforms and the illustrative reader.
- `js/scope.js`: the oscilloscope drawn in Canvas 2D, with real buttons laid over it.
- Thumbnail: `../previews/thumbs/essay-power-quality.jpg`.

Hooks: `?t=<s>` freezes a frame; `?kind=<id>&seed=<n>` picks an event; `?td=0|1|2`,
`?vd=0|1|2`, `?lv=<volts>` set the knobs; `?motion=reduce` forces the still mode.

## Behaviour checked

Driven with Playwright at 1440×900 and 390×844 (touch), plus 768×1024: every key, both knobs
by keyboard and drag, RUN/STOP, SINGLE and the live-region announcement. No console errors,
no horizontal scroll. Reduced motion shows a settled reading and changes only on input.
The figure stops drawing off screen and when the tab is hidden. Device pixel ratio is
capped at 2. Wide layout (≥700 px) puts the controls on a side panel; below that it becomes
a tall instrument with labelled keys.

## Weaknesses

- The draw loop repaints the whole screen every frame (about 30 fps). That's fine in
  headless Chromium at 60 fps rAF, but it has not been measured on a real phone.
- The LEVEL knob only moves the trigger marker; it doesn't change what triggers.
- On phones the LEVEL knob and EXT TRIG connector are left out, and the screen text is small
  (about 10 px) though legible.
- The hidden-state dots are decorative: they come from a fixed projection of real features,
  so they differ per event but mean nothing on their own.
- Uses Google Fonts (IBM Plex Mono, Caveat, DM Sans, Fraunces). Production would self-host.
