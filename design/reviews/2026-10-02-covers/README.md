# Code-drawn covers on the live site — October 2, 2026

The first production step of the site-wide art direction
(`docs/design/2026-10-02-site-wide-art-direction.md`). San approved covers for all works;
the GPT-7 essay itself and its share image stay as they are.

- **/writing** is now a shelf: a strict grid of equal 2:3 covers (three columns on
  desktop, two on phones) with the date and read time, the title, the original title,
  the one-line description and the same links as before. The covers show their static
  print immediately and come alive (one slow detail each) once on screen.
- **/notes** keeps its filters, search and copy; each row has a small static cover.
- **Share cards**: StartR, Another Sky, A Clauiet Life and Dyson Swarm note pages and
  the Winning by Overfitting crawler page now use their 1200×630 cover cards.

| Before | After |
| --- | --- |
| `before-writing-1440.png` | `after-writing-1440.png` |
| `before-writing-390.png` | `after-writing-390.png` |
| `before-notes-1440.png` | `after-notes-1440.png` |
| `before-notes-390.png` | `after-notes-390.png` |

"Before" is the live site on the same day; "after" is the `code-drawn-art` branch on the
dev server, captured once the covers were live (so the living details are mid-loop).

Checks: `npm run build`, `npm run lint` and `npm run check:site` pass. In headless
Chromium at 2× on desktop, each cover's live build stalled the main thread for
117–150 ms during idle time (about 50 ms on a phone-sized page); animation then held
60 fps. Real-device timing has not been measured.
