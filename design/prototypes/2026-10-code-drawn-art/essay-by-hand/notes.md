# An essay, explained by hand — notes

A sankala.me essay page for **Winning by Overfitting** whose three figures are
drawn in code in the riso zine hand of `../explainer/` and driven by the reader.
It tests the "translation" hypothesis: technical ideas made warm, visual and
handmade, in the essay's real home.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page: San's write-up text verbatim, figure containers, controls, captions |
| `js/riso.js` | Shared press: pen, single-stroke lettering, halftone, paper, misregistration, figure clock |
| `js/fig-loop.js` | Figure 1, the loop (scene adapted from `../explainer/`) |
| `js/fig-pile.js` | Figure 2, hard tasks teach the most, plus distillation |
| `js/fig-scores.js` | Figure 3, the official BEHAVIOR scores |

## The figures

1. **The loop.** Back / Play / Next step / a timeline scrubber. Error logs open from
   the drawing (tap the ticket on the spike) or the "Error log" buttons, and show what
   the evaluator said and what changed in the plan. First view auto-plays try 1 and
   stops on the failure with a "tap the error log" hint.
2. **Hard tasks teach the most.** Tap a task to run it; every try leaves a card in the
   dataset, so the ten-try task leaves the tallest stack. "Distill" sends copies of all
   fifteen cards into the 0.6B model, which becomes a specialist; the dataset keeps them.
3. **Official BEHAVIOR scores.** Bars on one 0–100 scale, starting at zero. Hover, tap
   or focus a module to draw the gap.

## Sources and what is illustrative

- Text: `src/pages/notes/eai-challenge/EAIWriteup.jsx`, verbatim (the deck is set in
  roman instead of the original italic). Date "July 2026" from `site-content.js`.
- Numbers: the write-up's Table 1 values (78.6/99.6, 50.0/97.0, 68.0/98.0, 80.0/99.5)
  and overall 90.09 vs 84.32. Gaps are differences of those numbers.
- Illustrative, and labelled as such in captions: the apple-and-fridge task, the three
  household tasks in figure 2 and their try counts (the ten-try task follows the
  write-up's own example).
- Drafts for San to rewrite in his voice: the three figure captions and the footer line
  "The figures on this page are drawn in code."

## Hooks

`?t=<s>` freezes every figure (figure 1 at timeline `t`). `&tk=1|2` opens an error log,
`&f1=<s>` sets figure 1's time, `&f2=run|distill` shows figure 2 mid-run or mid-distill
at `t`, `&sel=0–3` selects a score row. `window.__ready` is set after the first frame.

## Behaviour

Only visible figures animate (IntersectionObserver); the page pauses when hidden. Reduced
motion: no line boil, no autoplay; Next jumps between stops, runs and distillation jump to
their end states. Every interaction has a real button (transparent hit buttons laid over
the drawing in layout units, plus visible controls) with a visible focus ring.

## Weaknesses

- Real-GPU timing is unmeasured; headless software rendering drew each figure in ~1–4 ms
  at 2× density.
- Figure 2's top-right is quiet on desktop; the tags are large for what they say.
- Figure 1's error log covers the PLAN arc while open, and its ticket on the spike is small
  (the hint and the visible "Error log" buttons compensate).
- Body text relies on Georgia, as the live site does; Linux without Georgia falls back to a
  wider serif.
