# Explainer — "Loop. Loop. Loop."

A hand-drawn, three-ink riso figure for *Winning by Overfitting*, shown inside a
column of the write-up's own text. It tests whether San's habit of translating
technical work into handmade, visual things (ZINify, the GPT-7 figures, Paper
Robots) holds up as code-drawn animation.

## What happens in the 16-second loop

1. A frontier model writes a plan: GRASP APPLE · SLICE APPLE · PUT APPLE IN FRIDGE.
2. A copy flies to the evaluator. Its little simulated kitchen runs the plan, and the
   robot walks into the closed fridge. FAIL, and a pink ticket prints: FRIDGE IS CLOSED.
3. The ticket goes onto the model's spike. The model adds OPEN FRIDGE.
4. Second run: the fridge opens, but the robot can't find "APPLE" because it's in slices
   now. FAIL, ticket: 'APPLE' NO LONGER EXISTS.
5. The model crosses out APPLE and writes SLICES. Third run passes: PASS stamp.
6. The passed plan and both error tickets go into the GOLD DATA tray. A small
   0.6B model eats a card from the tray, and the loop resets.

The headline counts the tries, highlighting one LOOP. per attempt.

## Sources

- The mechanism, the two failure kinds (an implied OPEN, and the new identifier a
  sliced object gets), "verified training data", error logs as data and the
  0.6-billion-parameter specialists all come from
  `src/pages/notes/eai-challenge/EAIWriteup.jsx`.
- The apple/fridge task is illustrative and is labelled that way in the caption.
  The exact evaluator messages are paraphrases, not quotes.

## Craft

- Every mark is drawn into one of three ink masks: blue (key/plan), pink (errors),
  yellow (fills/gold). The masks are multiplied onto the paper with misregistration,
  speckle, uneven inking and fixed halftone screens. Anything white is a knockout.
- The single-stroke uppercase lettering is defined in the file (A–Z, 0–9,
  punctuation) and drawn with pressure, overshoot and a three-drawing boil.
- The animation steps at 12 fps. `?t=<seconds>` freezes a frame. Reduced motion
  shows the PASS moment (t = 14.35).
- Under 560 px the figure switches to a tall phone layout rather than shrinking.
