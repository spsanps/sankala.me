# Glyp: A Post-Mortem — essay idea, v2: The Startup Game

October 3, 2026. This is a rebuild after San's rule that every piece gets its own art
("the art style cannot be just repeated… and even glyp to some extent"). The first draft,
a letterpress-and-blue-pencil notebook that borrowed the cover's look, is kept in
`archive/v1/`.

## The idea

The essay turns on one sentence: "I kept thinking about features when I should have been
thinking about distribution." The figure shows this as a 1960s lithographed board game,
*The Startup Game, 2023 edition*:

- **Glyp** is a little open-top car on a circular track, the **Feature Loop**. Its squares
  are Share, Edit, Collaborate, Readers as participants, Building for the web, Tweak
  features, A new angle and Second-guess the core. Each feature it lands on adds a plastic
  peg to the car, so the car fills up with features and goes nowhere.
- **Sudowrite and Jenni AI** each carry one peg and drive straight down the **Niche Lane**:
  Pick a niche, Getting users, Growing users, Keeping users, Making money, Readers. They
  move one square every spin, whatever Glyp does.
- **Glyp's spinner** is honestly rigged. Nearly all of it is features, with a thin sliver of
  distribution. The distribution road from the loop to the readers is only a dashed die-line.
- **Cards** quote the essay:
  - Chance: "Wrong medium, wrong form factor." (back to the loop)
  - Chance: "No real conviction, no committed path forward." (back 2 spaces)
  - Chance: "Competitors had already established themselves."
  - Pivot: "Glyp Podcasts", with "Same fundamental problems though—too late, poorly
    executed, no real conviction behind the pivot." A microphone goes on the car and it
    circles the loop once more.
  - Lesson: "Distribution matters way more than features." Its back says "Flip the spinner."
- **The ending:** flipping the spinner reverses the weighting, so distribution becomes most
  of the wheel, and the distribution road is printed in green all the way to the readers.

## Why it is unique on the site

None of the registered styles in `docs/design/2026-10-02-site-wide-art-direction.md` is a
game board. It has its own palette (navy bookcloth edge, candy red, tangerine, mustard, teal,
seafoam on cream board stock) and its own type: Shrikhand for the game's name and card kinds,
Barlow Condensed for squares, and Rokkitt, a Clarendon slab, for cards. Its material is also
its own: a linen emboss, a centre fold, printed offset shadows under squares, plastic pegs,
a red pointer on a brass rivet, and cards that flip in flight. There's no letterpress, pencil,
riso, halftone or gouache.

Should this go live, its cover (letterpress with blue pencil) stays as the essay's object on
the shelf; the figure inside is a different world.

## What the reader can do

- **Watch:** the game plays fall 2023 through by itself once the figure is on screen, in about
  45 seconds.
- **Take over:** press **Spin** or tap the spinner at any time. Each spin moves Glyp, moves the
  competitors one square, and sometimes draws a card. After six spins, the button becomes
  **Pivot to Glyp Podcasts**.
- **Flip the spinner** after the lesson card, then flip it back.
- **Play again** resets.
- **Text:** a live status line narrates each turn. A visually hidden list repeats all five
  cards' text, and the canvas has a full description.
- **Keyboard and touch:** both work. Buttons are 44 px tall and use `aria-disabled`, so
  keyboard focus is never lost mid-turn.
- **Reduced motion:** there is no autoplay. The board opens on the finished game with the
  lesson card on the table, and every spin and flip resolves instantly.

## Facts and framing

- Every label is the essay's own words. "Building for the web" and "Wrong medium" come from
  the Cal AI paragraph.
- Game furniture is framing, not claims: "Start · Fall 2023", "Back to the loop", "Go back
  2 spaces", "Flip the spinner", "One player".
- The spinner's proportions are a sketch, not data, and the board says so. There are no
  numbers, users or dates beyond "fall 2023".
- The caption under the figure is a draft for San's own voice.

## Files

- `index.html`: the essay page draft. It has the site header (Work · Timeline · About · CV),
  the cover as a frontispiece (`cover.webp`, copied from `public/images/covers/`), the essay
  text verbatim, and the figure after "What Went Wrong", just before the Glyp Podcasts
  paragraph.
- `js/game.js`: the whole figure (Canvas 2D, no libraries). The static board is drawn once per
  size; pieces, spinner and cards are drawn each frame.
- Hooks:
  - `?t=<seconds>` freezes a frame of the autoplayed game and sets `window.__ready`.
  - `?t=70&flip=62` shows the flipped ending.

## Checks (headless Chromium, Playwright)

- **Interactions driven:** autoplay, takeover mid-demo, all six spins and the pivot, the
  lesson card docking, flip and flip back, reset, Enter on the focused Spin button (focus
  stays), a touch tap on the spinner at 390 px, and reduced motion.
- **Layout:** no console errors, and no horizontal scroll at 1440, 1024, 768, 390 or 360.
- **Speed:** 60 fps with a worst frame of about 17 ms at 1440 px (2×) and 390 px (3×). Real
  devices haven't been tested.

## Weaknesses

- On phones the board is dense: Feature Loop squares are 68 units wide, so their labels are
  about 8–10 css px.
- The cars and pegs are small; the pegs piling up reads best at desktop size.
- The dashed distribution road and its "Distribution?" squares sit in an otherwise empty
  right-middle area until the flip.
- The demo pacing (about 45 s) is long for readers who just scroll past; the status line and
  the board's labels carry the point without it.
- Fonts load from Google Fonts. A production version would self-host Shrikhand, Barlow
  Condensed and Rokkitt.
