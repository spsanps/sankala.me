# Site-wide art direction for sankala.me

October 2, 2026. San approved this direction the same day, with one exception: the GPT-7
essay stays as it is. Implementation is on the local branch `code-drawn-art`. This applies San's decisions from the code-drawn art review (see
`2026-10-02-visual-taste-analysis.md` and `design/prototypes/2026-10-code-drawn-art/`)
to the whole site. It is based on a walk through every live page that day. These are
proposals for San; only the items marked as his decisions are decided.

## Principles

1. **Quiet container, one living thing.** Site chrome stays plain: type, space,
   underlined links and the existing navigation. Each page gets at most one drawn,
   moving element, and only where it serves the page's job.
2. **One house hand.** The site's own illustration uses one style: clear ink line
   with warm gouache, legible at phone size, no halftone noise. This was chosen for
   Four frames. Variety belongs only to things that are separate objects: covers, and
   the figures inside each essay (San's decision).
3. **Real things stay real.** Photographs remain photographs (history, about). Drawings
   can hold them, as with prints pinned in Four frames, but never replace them.
4. **Every essay gets one hand-made idea** in a style chosen for it (San's decision).
   Reading and scanning pages (CV, research list, archive) get none. Their craft is
   typography.
5. **Covers are the identity of each work** (San's decision). They appear on the shelf,
   at the top of the essay and as the share image.
6. **Retire generated imagery over time, except in the GPT-7 essay.** San decided to
   keep GPT-7 Will Have Arms as it is, including its images, video and share card. The
   generated film still on Projects can be replaced when posters arrive.
7. **Drop decorative italics** ("so far.", "& ideas.", "play with.", "isn't here.").
   The Visual Taste brief refuses them.

## Page by page

| Page | Today | Proposed |
| --- | --- | --- |
| Home `/` | Three-photo cover, dark-green photo timeline, writing list, projects, recent additions | Four frames full-page experience, then the covers shelf, then a short footer. The photos move to the pinboard and History; "recent additions" shrinks or goes |
| Writing `/writing` | Text list with dates | The covers shelf: a strict grid of 2:3 covers with title, date and one line |
| Each essay | Mixed: GPT-7 has charts, AI images and a film; EAI has a boxes diagram; StartR is plain text | The cover as a frontispiece, the reading column, and one hand-made interactive or media treatment per essay (see the essay list) |
| Projects `/projects` (and `/lab`) | Screenshot cards | Animated posters, one per interactive project (Another Sky, A Clauiet Life, Dyson Swarm), in a strict grid. Posters for things to open, book covers for things to read |
| Research `/research` | Typographic list of three papers | Stays typographic, with a small journal-style cover beside each paper. Interactive treatments live on each paper's own write-up |
| About `/about` | Real portrait, background strip, text | Unchanged in spirit: the real portrait and his words. Optionally one small house-style vignette of the desk from Four frames. No new art otherwise |
| CV `/resume` | Detailed typographic CV, PDF download | No art. Better typography, a printable layout, and the PDF kept in sync |
| History `/history` | Long photo timeline | Group the ten milestones by place (San Jose, San Diego, Bengaluru, Surathkal), each opened by a small house-style window view of that place, with the real photographs kept |
| All work `/notes` | Filterable archive list | Same filters and search, each row with a small cover thumbnail |
| 404 | Text with decorative italic | A small house-style vignette, for example the telescope pointed at an empty patch of sky, plus the plain links |
| Share images | Mixed og images | Each work's cover as its share card; the San Jose frame for the site |

## Essays: one idea each

- **Winning by Overfitting:** port `essay-by-hand/` into the live page.
- **GPT-7 Will Have Arms:** stays as it is (San's decision). Its cover appears on the
  Writing shelf and in the archive only.
- **StartR post-mortem:** reread first, then one drawn idea taken from its own story.
- **Power quality paper (2019):** an oscilloscope the reader drives. Pick a disturbance,
  then see the waveform and how the model classifies it. It echoes the NITK square wave.
- **ZINify:** a paper goes in and a zine comes out that the reader can flip.
- **A Clauiet Life, Another Sky, Dyson Swarm:** already interactive. Give each a poster.

## Building it into the site

- Shared art code in `src/components/art/` with one React wrapper that handles device
  pixel ratio, visibility, reduced motion and pausing. Essay-specific figures stay with
  their essay (`src/pages/essays/<slug>/components/`), following the repo structure rules.
- **Static first, alive second.** The build renders each cover and scene to an image
  (Playwright is already a dev dependency, and prerendering already runs). Pages show the
  image instantly and for crawlers, then swap in the live canvas when visible and idle.
  This keeps first paint fast and stable and makes share cards free.
- Performance needs measuring on real devices before launch. All prototype timings
  came from headless software rendering.

## Order

1. Four frames v2 (in progress).
2. Covers on Writing, as essay frontispieces and as share images.
3. Essay treatments, one at a time, starting with porting Winning by Overfitting.
4. Projects as animated posters; History grouped by place; 404 vignette; remove italics.
5. Paper Robots pass (evidence loop opening, film kits), then Dyson Swarm posters.

## Rule: every piece has its own art (San, October 3, 2026)

Every essay, figure and project gets a unique art style and creative idea. Never reuse another
piece's visible style, palette, lettering or mechanism, even when the code could be shared.
Shared infrastructure (canvas helpers, the LivingCanvas wrapper) is fine. Within one
experience, such as the homepage scroll, keep one style. Before designing, check this register
and add the new style to it.

### Style register (what is already taken)

| Where | Style |
| --- | --- |
| Homepage (Four frames, live) | Clear ink line with warm gouache |
| Winning by Overfitting figures | Three-ink risograph zine, hand-lettered, characters |
| Power quality idea | A realistic bench oscilloscope (instrument UI) |
| Covers | Polish gouache film poster; art-deco railway lithograph; Swiss typographic poster; woodblock on washi; linocut paperback; letterpress broadside with blue pencil; screenprint; riso zine; technical journal |
| Paper Robots kits | Three-block reduction linocut; egg tempera and gold leaf |
| History vignettes, 404 | Clear line with gouache (homepage family) |
| ZINify idea (v2) | Photocopier zine: black toner on coloured copy paper, ransom-note lettering, copies of copies |
| Glyp idea (v2) | 1960s lithographed board game with spinner, tokens and cards |
| Landing comparisons | Living stone mosaic (andamento); muted halftone-dot print in five inks |
| Earlier studies | Cyanotype, line engraving, mezzotint, sumi ink, suminagashi marbling, pochoir, paper-cut collage, origami, cross-stitch, chalkboard, banknote engraving, camcorder halftone loop, azulejo tile, native pixel art, komorebi light |
