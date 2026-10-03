# Winning by Overfitting: hand-drawn figures in the live page

October 2, 2026. The three interactive riso figures from the essay-by-hand prototype
(`design/prototypes/2026-10-code-drawn-art/essay-by-hand/`) are now part of the live
`/notes/eai-challenge` page. This follows San's request that every essay get this kind
of treatment. The write-up text and structure are unchanged.

## What replaced what

| Before | After |
| --- | --- |
| Boxes-and-arrows loop diagram with an animated score | Figure 1, the loop: step through three tries, scrub, and open each error log |
| (nothing after "Why this is a good idea") | Figure 2, hard tasks teach the most: run tasks, then distill the dataset into the 0.6B model |
| Plain paired bar chart of the BEHAVIOR scores | Figure 3, the official BEHAVIOR scores drawn by hand, with the gap drawn for a chosen module |

The apple-and-fridge task, the three household tasks and their try counts are labelled
as made up or illustrative in the captions. Figure 3 uses only the write-up's own numbers.
The three captions are drafts for San's voice.

## Files

- `before-*`: the page as it was (desktop 1440 and phone 390), plus its loop diagram and bars.
- `after-*-full`: the whole page with the figures.
- `after-desktop-loop-*`: try 1's hint, both error logs opened, and the pass.
- `after-desktop-pile-*`: a task running, distillation, and the specialist.
- `after-desktop-scores-hover`, `after-phone-*`: hover and touch states.
- `after-reduced-motion-loop`: the reduced-motion version, with no autoplay and Next jumping between stops.

## Checks

Driven with Playwright against the dev server:
- Clicks, the Escape key, scrubbing, Space and Enter on the controls, hover and focus on
  score rows, and touch taps on a phone viewport.
- Leaving for Writing and coming back with the browser's back button, to exercise cleanup.

Results:
- No console errors and no horizontal scroll at 1440 and 390.
- Frozen frames are visually identical to the prototype at the same sheet width.
- The figure code ships only in the lazy `EAIWriteup` chunk.
