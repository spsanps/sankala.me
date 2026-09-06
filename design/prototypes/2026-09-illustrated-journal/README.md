# The illustrated journal — second design study

September 6, 2026. Develops San’s preferred direction one after his request for
more distinctive design, fuller content coverage, and complete Substack editions.
This is a reviewable prototype; it does not replace the live site.

## Open it

Double-click `index.html` to try the new homepage.
`review.html` explains the creative choices, shows the earlier direction beside
this one, and maps the entire current body of work into the new structure.

Windows:

```text
C:\Users\sanps\Desktop\Projects\sankala.me\design\prototypes\2026-09-illustrated-journal\index.html
```

WSL:

```text
/home/san/Projects/sankala.me/design/prototypes/2026-09-illustrated-journal/index.html
```

The pages work from `file://`. Art and fonts are local; links to published work
require a connection. Existing identity assets, film frames, and font files are
reused from the sibling `2026-09-audience-site/shared/` folder. Keep that folder
beside this study if moving the prototypes. It is included in the same Git repo.

## Pages and files

| Path | Purpose |
| --- | --- |
| `index.html` | Illustrated cover, interactive ideas, selected work, author context |
| `writing/index.html` | Complete notebook, search, format filters, empty state/reset |
| `films/index.html` | Actual published Paper Robots film, essay link, film artwork |
| `worlds/index.html` | Another Sky, A Clauiet Life, and Dyson Swarm |
| `research/index.html` | Three publications and professional work |
| `about/index.html` | Author, ten original milestones, career photos, education/honors |
| `notes/startr-postmortem/index.html` | Complete source article in the new reading design |
| `letter.html` | Proposed free publication and complete-edition relationship |
| `review.html` | Design rationale, before/after preview, preservation/publishing map |
| `content-map.json` | Eight catalogue entries, original source paths, ten milestones |
| `assets/cover/` | New source art, refined display version, exact built-in imagegen prompts |
| `assets/worlds/` | 33 real Another Sky frames and existing simulation previews |
| `assets/research/` | Small copies of existing work, research, and education photos |
| `assets/provenance.json` | Exact source paths, hashes, and conversion notes |
| `styles/journal.css` | Visual system and responsive layouts |
| `scripts/build-pages.mjs` | Page templates; imports the actual six notes/projects from the repo |
| `scripts/journal.js` | Native controls, search/filtering, small perspective response |
| `scripts/check-and-capture.mjs` | Browser/content checks and saved screenshots |
| `previews/{desktop,mobile}/` | Viewport and selected full-page captures |
| `previews/verification.json` | Conditions and results of the browser checks |

## Things to try

1. On the homepage, change the number of bodies attached to the model. The figure
   illustrates the essay’s proposed architecture; it is not a benchmark.
2. Drag “Look up” in the Another Sky view, or focus the slider and use arrow keys.
   These are actual rendered frames, not generated stand-ins for the explorer.
3. Use Writing to find all eight pieces, switch formats, search for “accelerator,”
   and clear the search. The EAI entry belongs to both Essays and Research.
4. Open About’s timeline entries. All ten milestones from the original homepage
   are present, including the startup and earlier hardware/education history.
5. Read the full StartR article. Its text is generated from the existing source;
   the original live page is also linked.

No Substack publication exists or address has been reserved. The letter page
states that plainly and contains no form collecting addresses. The plan now calls
for complete free reading editions on Substack, superseding the shorter-letter
default in the earlier study.

## Rebuild and verify

From the website repository root:

```bash
node design/prototypes/2026-09-illustrated-journal/scripts/build-pages.mjs
node design/prototypes/2026-09-illustrated-journal/scripts/check-and-capture.mjs
npx eslint design/prototypes/2026-09-illustrated-journal/scripts/journal.js --max-warnings 0
```

Edit page content/layout in `build-pages.mjs`, then rebuild; generated HTML is
committed so San can open it directly. The script does not change the React site.

The checker launches and closes its own loopback server. It covers all nine pages
at 1440 × 1050 and 390 × 844, plus 320 px overflow checks; local references and
images; the conceptual figure; keyboard world controls; all source notes, filters,
search/reset; all ten milestones; full source article coverage; mobile navigation;
direct `file://` opening; and useful content without JavaScript. Reduced motion is
used for reproducible screenshots. The pointer perspective is a visual enhancement,
not required for reading or interaction.

This is not a measured conversion experiment, a complete accessibility audit,
or an actual award entry. The production route and metadata checks belong to a
later React implementation. The production site and account settings are unchanged.

See [the content and cross-publishing plan](../../../docs/online-presence/2026-09-journal-content-and-cross-publishing.md).
