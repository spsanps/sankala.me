# A scene, drawn in code: notes

The opening of *How to Please a Capricious God* (Paper Robots, film 02), re-staged
as a 37-second sequence drawn entirely in code, in the film's proposed hand:
egg tempera and water-gilded gold leaf (continuous with `../paper-robots-made/`).
It tests whether code-drawn art can carry a film, not just a poster or a loop.

## Sources (read only)

- Words: `/home/san/Projects/yt-blog/paper-robots/films/capricious-god/script.md`,
  the first six sentences, verbatim.
- Timing: `vo_lines.json` in the same folder (the recorded read's word times). The
  cuts and actions land on those words. Holds follow the score's openings: 1.6 s
  after "opens its own", 2.2 s after "left in you", 3.2 s after "capricious god".
- San's standing notes from `direction.md` / `shots.py`, kept here:
  - The film starts on "You open your eye".
  - The creature's closed eye is a lidded disc with a white crescent, never a
    curved line (fb-0011).
  - The thousand lifetimes are shadows radiating from its feet like the spokes of
    a wheel, seen from straight above, with nothing dancing (fb-0013, fb-0095).
  - Never the same view twice in a row (fb-0009, fb-0014).
  - One eye on every creature, stick arms and flat three-fingered mittens.
  - The god's eye is red-orange with a dark pupil, never darkened, and holds no
    green reflection.

## Shot list (times in seconds; narration offset +1.2 s)

| # | time | shot | the line | what moves |
|---|---|---|---|---|
| 1 | 0.00–4.10 | CLOSE, front. The creature's face, the plain dim behind it | "You open your eye." / "Above you," | Held, closed (a lid disc and a white crescent), breathing. "open": the lid squeezes (anticipation), then slides up with overshoot. The pupil wobbles and fixes, and on "eye" it contracts. "Above": the pupil rolls up and the head tilts back. Warm light grows from above. Slow push-in. Cut on "something". |
| 2 | 4.10–8.62 | LOW, from behind. Its back at the bottom of the frame, blank gold above | "something enormous opens its own." | "enormous": a seam parts in the gold, opens a crack, hesitates, then opens. Light blooms from the seam and runs out along the incised rays. "own": the pupil contracts and finds the figure. In the 1.6 s hold, nothing but light moves across the gold. Slow tilt up and push, with the figure moving faster than the gold (parallax). |
| 3 | 8.62–14.64 | FROM STRAIGHT ABOVE. The camera is where the eye is | "Something stirs, a thousand lifetimes you have stood beneath this same eye." | "stirs": a second long shadow from its feet at another angle, then a third. "thousand": more, one after another, until the ground is a star of shadows. It looks down at them. "same eye": they fade, leaving one, and it looks back up at us. The crane rises and turns. Gold motes drift between the camera and the ground. |
| 4 | 14.64–22.27 | CLOSE, three-quarter, low. Its eye against the god's light | "No clear memories survive." / "Only the longing they have left in you." | "memories": pale smeared shapes slide across the pupil. "survive": gone. "longing": a small red reflection of the enormous eye appears in the pupil. "left in you": the pupil drifts up toward it. One slow blink, and the reflection is still there. Push-in on the pupil. |
| 5 | 22.27–29.60 | WIDE, from behind. The thesis image | "You need, terribly, to please this capricious god." | "need": anticipation (weight back), one step toward the eye, settle. "terribly": shoulders, then elbows, then mittens rise (overlap, follow-through), and the arms stay up. "please": up onto its toes. "capricious": the god's pupil narrows on it. "god": light falls on it and runs down the rays. Hold with arms up. Slow push with three parallax planes of rock. |
| 6 | 29.60–37.40 | TITLE | (no words) | Bole red. The leaf is laid square by square out from a small eye, then the title is painted, then light sweeps across. It fades to the dark of the page. |

Every cut is hard, and every cut lands on a word.

## Where sound would land

| time | sound |
|---|---|
| 0.0 | room tone of a dry plain; one low string held |
| 1.52 | a soft wet click as the creature's lid opens |
| 4.34 | a deep low swell (the score's "hit") as the seam in the gold parts; leaf crackle |
| 5.94 | the pupil contracts: a held breath |
| 9.06 | each shadow arrives with a muffled bell partial; from "thousand" on, many, overlapping |
| 12.88 | the bells collapse to one; silence |
| 17.72 | the music box's first notes (the longing motif) |
| 20.3 | the blink: nothing, deliberately |
| 22.48 | one footstep on dry earth |
| 25.86 | the waltz's downbeat as the light falls |
| 29.6 | the title: leaf being laid, a soft paper hiss, the waltz resolves |

## Hooks

- `?t=<seconds>`: frame mode. The film fills the viewport, renders that moment,
  freezes, and sets `window.__ready = true`.
- `?at=<seconds>`: page mode, paused at that moment.
- `window.__renderAt(t)` is used by the frame-sequence script to render many
  frames from one page load.
- Reduced motion shows the storyboard (one still per shot) instead of autoplay.

## Files

- `index.html` is the screening page.
- `js/kit.js` and `js/paint.js` are copied and trimmed from `../paper-robots-made/`.
  The tempera painting, gold leaf and craquelure live there, with film
  adaptations: calmer leaf-to-leaf variance, softened glint, fewer tears, and an
  overall stroke opacity.
- `js/film.js` holds the rebuilt eye and rocks, the creature rig, the six shots and
  the renderer.
- `js/player.js` holds playback, scrubbing, reduced motion and the hooks.

## How the previews were rendered

The mp4 is all 898 frames at 24 fps, 1280×720. Every frame comes from the same
deterministic `renderFrame` that `?t=` uses, but from one page load (via
`window.__renderAt`). Calling `render.cjs --seq` would rebuild the panels for every
frame, about 14 s each, which is roughly 3.5 hours. I checked one frame (t =
27.2083) both ways: the mean difference is ~0 and the maximum is 18/255 on a few
pixels.

## What changed across the passes (11 render passes, 3 judged as motion)

1. **First build.** The structure read, but the gold looked like a checkerboard
   floor and the creature's hatching looked like fur. The 3/4 eye sat outside the
   body. The crags looked like broken concrete slabs. The god's highlight was a
   striped block, and the spokes were a flat graphic sunburst.
2. **Gold and rocks.**
   - Gold: per-leaf variance and seam darkness halved, broader burnish, the glint
     blurred so moving light reads as burnish, smaller leaves in the wides.
   - Crags rebuilt as narrow leaning teeth with sloped lit tops and clefts.
   - The god's highlight is now soft dabs; the sclera is warm ivory with gold bounce
     from below.
3. **Strokes and spokes.** Tempera strokes are shorter, denser and at lower
   opacity, so tone builds instead of fur. The craquelure on the gold is fainter.
   The upper lid fold hugs the eye. The spokes are multiplied, lighter, and start
   at the feet's edge.
4. **First motion pass.**
   - The lid squeeze → overshoot → settle and the pupil contraction read.
   - Fixed: the god's closed seam was visible before "enormous"; it now fades in
     from blank gold at 4.24 s.
   - Fixed: the arms passed through a stiff T-pose and hung to the ground. They are
     now shorter and bent at rest, the shoulders lead and the elbows trail by
     0.18 s, and the final pose opens into a supplication Y.
5. **Framing.**
   - Shot 2's figure was lowered so no arm stubs poke into the frame.
   - Shot 5's figure was enlarged (118 → 138) with a faint warm pool, so it
     separates from the ground.
   - The page was fitted to the viewport height, and the storyboard captions now
     carry every line in each shot.

## Honest weaknesses

- **Shot 5's crags** read better than terraces but still as vertical slabs. Duccio's
  rocks have more rounded plasticity.
- **The god's eye** is painted rather than a sticker now, with raised gold folds,
  a modelled sclera, crypts, collarette and a soft highlight. But it is still the
  cleanest, most "illustrated" form in the frame. The iris is very saturated.
- **The creature** is a lovely silhouette but simple. Its acting is all in the eye,
  the lid and two arm gestures; there is no full-body performance or walk cycle.
- **Shot 3** keeps the creature very small (it is an extreme wide). On a phone it
  is a dot with an eye.
- **Long holds.** Shot 2's hold (6.6–8.6 s) and the end of shot 4 rely on the
  moving light and the slow push. Without music they feel long; with the score
  they would be the "openings".
- **Performance.** Building the panels takes about 12–18 s in headless software
  rendering; a real browser should be faster. Frames draw in 27–64 ms in software
  (shot 1 is the heaviest), which is fine for the 24 fps the piece needs on a GPU.
  This hasn't been measured on real hardware.
- **No sound.**

## Verdict: could this make a full Paper Robots film?

Yes, for this kind of film, with one big caveat.

**What works:** the craft is consistent shot to shot. The light can be directed
(blooms, sweeps, rays). Cuts land exactly on words because the timeline is code.
Every frame is editable and re-renderable, so a note like "the eye should never
blink" is a one-line change.

**What it would take:** the opening's 6 shots took about 900 lines of scene code on
top of the shared hand. The full 6:27 film has about 55 shots. That suggests:

- A real rig system: posable creature, crowd variations, the box, the cell, the
  library, the palace. Each new place is a plate builder like `buildS5`.
- A shot description format, so shots are data, not functions.
- An offline renderer for 4K and a sound-synced timeline driven by
  `vo_lines.json`.

Roughly, one place and its shots is a day of work, so the whole film is weeks, not
months.

**The caveat:** complex character animation (crowds, hands manipulating objects,
the fight in the palace) is where hand-coded animation gets expensive. Those beats
would need a simpler staging grammar: silhouettes, held frames, the
Tartakovsky-style cuts San already chose. That grammar fits code very well.
