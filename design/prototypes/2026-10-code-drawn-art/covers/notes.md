# Covers — "Let the covers make the palette"

A candidate for sankala.me `/writing` and `/notes`: San's nine real works as a shelf of
code-drawn covers on one quiet field. The container never changes (equal 2:3 covers, steady
gutters, title + date in small serif). Each cover is drawn entirely in code in the voice of a
printing process that suits its subject, with one slow living detail.

| Work | Voice | Living detail |
| --- | --- | --- |
| How to Please a Capricious God | Polish poster, gouache on dark ground | the eye's gaze wanders (18 s) |
| Another Sky | Art-deco railway lithograph, view down the cylinder | clouds drift toward the far cap (48 s) |
| Winning by Overfitting | Swiss International Style | the score staircase is plotted to the evaluator line (15 s) |
| A Clauiet Life | Shin-hanga woodblock botanical on washi | a bee loops through the cosmos (22 s) |
| GPT-7 Will Have Arms | Mid-century paperback, linocut | six arms gesture (16 s) |
| StartR Accelerator: A Post-Mortem | Letterpress broadside | blue pencil writes "POST-MORTEM · DEC 2025" (16 s) |
| Dyson Swarm | Space-age screenprint | collectors orbit and transit the Sun (24 s) |
| ZINify | Two-drum risograph zine | doodles boil (three hand-drawn takes) |
| Power quality event classification | Technical journal, duotone halftone oscilloscope | phosphor trace sweeps a voltage sag (3.2 s) |

Text on the covers comes only from `src/data/work.js`, `site-content.js` and `profile.js`.

## Use

- Open `index.html` directly. `?cover=<key>` shows one cover large; `?t=<seconds>` freezes a moment.
- `prefers-reduced-motion` shows still covers. Drawing pauses when hidden or offscreen; each detail
  has its own frame rate, and beat-driven details redraw only on their beat.
- One shared toolkit drives every cover: a noise-field set, an ink model (blur + noisy threshold,
  mottle, voids, wood/brush grain), AM halftone, letterpress deboss, a single-stroke alphabet
  rendered as brush, marker, pencil or broad nib, paper fibre and edge wear.

## Known limits

- Ten Google Font families load for cover typography; a production version would subset them.
- First paint builds all nine covers on the main thread (~2 s headless, progressive).
- Clipping on CPU-backed canvases avoids `ctx.clip()` + `drawImage` with paths that leave the
  canvas: Chromium cleared pixels outside such a clip. `L.put` masks with `destination-in` instead.
