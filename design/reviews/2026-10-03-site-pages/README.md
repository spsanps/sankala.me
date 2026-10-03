# Site pages review: October 3, 2026

These pages were brought up to the site-wide art direction
(`docs/design/2026-10-02-site-wide-art-direction.md`): everything except the homepage, on the
`code-drawn-art` branch. Before and after full-page screenshots are at 1440 and 390 px wide,
taken from the Vite dev server. `after-resume-print.jpg` is the CV in print media.

| Page | Change |
| --- | --- |
| `/projects`, `/lab` | The three interactive projects are now live code-drawn posters in a strict grid. The Paper Robots slot shows the film's code-drawn title card instead of an image-model still |
| `/research` | A small cover beside each paper; otherwise typographic. Breadcrumb eyebrow removed |
| `/history` | The ten milestones are grouped by place (San Jose, San Diego, Bengaluru, Surathkal), each opened by its window view in the Four frames style, with a place index under the heading. Every `#history-<id>` anchor and the lightbox still work |
| 404 | A telescope on a windowsill at night, aimed at an empty patch of sky over San Jose. Decorative italic removed |
| `/notes/startr-postmortem` and the experiment pages | The work's cover as a small frontispiece beside the title |
| `/notes/eai-challenge` | A small frontispiece beside the title, header only |
| `/about` | Breadcrumb eyebrow and redundant portrait caption removed. The background strip now reads 2015–19 for NIT Karnataka |
| `/resume` | No art. Section numbers and trailing periods removed, the type scale tightened, and a print stylesheet added (one clean column, contact line, no navigation) |

The art is regenerated with `node scripts/publishing/render-site-art.mjs`, which draws with the
prototype code in `design/prototypes/2026-10-code-drawn-art/four-frames/` and
`paper-robots-made/`. Output goes to `public/images/history/places/`,
`public/images/not-found/` and `public/images/projects/`.

Checks passed:
- No console errors and no horizontal scroll at 1440, 768, 390 and 360.
- Reduced motion leaves zero live canvases.
- Keyboard focus is visible (3px outline).
- Server rendering includes every page's text.
