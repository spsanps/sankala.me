# San Kala and Paper Robots — separate sites

September 6, 2026. San identified the main problem in the previous journal: the
homepage felt like a GPT-7 campaign, and his personal history and wider identity
were unclear. He wants San Kala and Paper Robots to have distinct sites.

## Open the study

- [Personal homepage](san-kala/index.html): identity, photographs, career path,
  subject groups, selected work, and links to projects with their own homes.
- [Paper Robots homepage](paper-robots/index.html): the publication’s purpose,
  editorial threads, its actual first essay/film, and ways to follow.
- [Work & ideas](san-kala/work/index.html): all eight works, with subject and
  format filters that can be combined, search, and a clear empty state.
- [History](san-kala/history/index.html): all ten original milestones.
- [Relationship and content map](index.html): compare the two sites and see
  where each current piece belongs.

Windows entry point:

```text
C:\Users\sanps\Desktop\Projects\sankala.me\design\prototypes\2026-09-separate-sites\index.html
```

Double-click the HTML files. Fonts and artwork load locally from the existing
sibling `2026-09-audience-site/` and `2026-09-illustrated-journal/` studies. Keep
those folders beside this one if moving the preview. They are all in the repo.

## What is decided, and what is proposed

San explicitly requested distinct personal and publication sites. These layouts,
subject names, and the domain shortlist are proposals. No new domain or account
has been purchased or connected, and no production site has been replaced.

The personal site is the complete author index. Paper Robots is a curated
publication, currently containing one film and its essay. The Minds & identity
thread is labelled as intended future work. Another Sky is a related external
experiment at Dyson Swarm, not an invented Paper Robots issue.

The archive topics are AI & robotics, Space & simulated worlds, and Building &
reflection. Formats are research, essay/note, film, and experiment. One work can
have several formats and subjects. History is a separate chronological view.

The proposed free Substack carries Paper Robots reading editions. Existing essay
URLs stay intact; the manuscript can supply both reading and interactive editions.
San’s complete CV and publication details remain linked from his site.

## Files and sources

| Folder/file | Purpose |
| --- | --- |
| `san-kala/` | Personal homepage, complete work index, and history |
| `paper-robots/` | Distinct publication homepage |
| `styles/sites.css` | Shared typography and separate personal/publication palettes |
| `scripts/build-pages.mjs` | Templates and source-based content mapping |
| `scripts/library.js` | Progressive subject/format/search controls and mobile Escape |
| `scripts/check-and-capture.mjs` | Browser checks and desktop/mobile captures |
| `content-map.json` | Full inventory, subjects, formats, and ten milestones |
| `previews/` | Screenshots and the latest verification report |

The build imports the actual `notesData`, and reuses the previous verified
inventory and milestone titles. Professional facts were checked against the local
homepage and CV. The original graduation-month discrepancy remains unresolved;
this study uses the year. No image generation was needed for this revision. The
cover, photos, fonts, and their provenance remain in the previous studies.

## Rebuild and verify

From the repo root:

```bash
node design/prototypes/2026-09-separate-sites/scripts/build-pages.mjs
node design/prototypes/2026-09-separate-sites/scripts/check-and-capture.mjs
npx eslint design/prototypes/2026-09-separate-sites/scripts/library.js --max-warnings 0
```

Edit templates in `build-pages.mjs`; generated HTML is committed for direct opening.
The checker starts and closes its own local server. It verifies all five pages at
desktop, phone, and 320px widths; images and local links/anchors; reciprocal site
navigation; archive coverage and combined filters; all milestones; direct file
opening; and readable content without JavaScript. The publication contains no
connected form or fictional signup link. These checks are not a full accessibility
audit or a production route migration.

See [the architecture decision and domain shortlist](../../../docs/online-presence/2026-09-separate-sites-and-domain.md).
