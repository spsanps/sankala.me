# Evidence 001: the overlay is the plot

An 8-second vertical (9:16) camcorder loop, drawn entirely in code: one HTML file,
Canvas 2D, no images, no libraries. It's a study of the technique in muhlktea's
Space Bunnies reel, made with Paper Robots' own robot and riders.

## What happens

| Time | Shot |
| --- | --- |
| 0.0–2.6 s | Close-up. The robot gasps (stretch, small pupils), its pupils grow and fill with star glints, it blinks and looks up. Whip pan. |
| 2.6–4.35 s | Wide, over the robot's shoulder. The reticle hunts, false-locks a bright star, then snaps `LOCK` onto a speck with a ribbon trail. |
| 4.35–5.6 s | Zoom to ×7.4. Stars streak, the lens falls behind and the AF hunts (`AF` blinks). |
| 5.6–8.0 s | A giant folded-paper asteroid with five green riders: one waves, two hold a rope, one peeks up from behind, one clings to the edge. The operator pushes in. The clinging rider slips and flies toward the lens, the others turn to watch, and a second reticle follows it. Cut back to the robot's gasp. |

The tape timecode resets at the cut, as it does in the reference.

## Rules kept

- Six colours only: INK `#1b1747`, COBALT `#2f52d9`, PERI `#8c97ff`, VERM `#f2603f`, CREAM `#fbedd2`, GREEN `#a6c64f`.
- No black, no gradient fills. Halftone dots on a fixed screen grid make the shade (one angle per ink). Short cream dashes make the light. Every outline is PERI.
- The asteroid is a papercraft model: dashed score lines on interior folds, two cream paper-back facets, and unglued tabs that grow out of the silhouette edges.
- Film grain covers the footage. The viewfinder (REC, timecode with frames, battery, zoom bar, reticle, `LOCK`, `AF`, date stamp) stays crisp on top, drawn in a hand-built 5×7 dot-matrix font.
- Everything periodic divides 8 s, so the loop is exact.

## Controls

- `?t=<seconds>` renders that frame, freezes, and sets `window.__ready`.
- With reduced motion, the page shows the reveal still at 6.78 s with no grain flicker.
- Wide screens get a letterboxed 9:16 frame on cream with a one-line caption. Portrait phones fill edge to edge, and the extra height becomes sky.

## Known limits

- Headless software rendering measured 17–60 ms per frame at 2× density. Most of that is rasterizing anti-aliased dots. JS path building is about 5 ms. GPU-backed canvas should be much faster, but it hasn't been measured on a real phone.
- The far nebula texture is cached at 1.45× so the zoom stays crisp. On a 2× phone that is a large bitmap (about 7 MP).
