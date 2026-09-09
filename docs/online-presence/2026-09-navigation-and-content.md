# Personal-site navigation and content revision

September 8, 2026. Current scope: sankala.me. San reported outside feedback that
visitors could not tell what the site was, where to find things, or what to open;
it looked AI-made and nothing caught their attention. The assistant asked which
site the feedback concerned and proceeded with the stated personal-site scope
while awaiting clarification. Paper Robots was inspected but not edited.

## What the audit found

- “Work & ideas,” “Research,” and “History” did not give clear first choices.
- The large greeting, photo collage, career strip and abstract topic folders
  pushed actual pieces of work far down the page, especially on a phone.
- Headings such as “all the threads” and “a few ways in” described a mood rather
  than a destination. Identical arrows and vague “Explore” links obscured format.
- The personal and publication sites used similar layers of generic framing.
- Essays prominently offered “Copy for LLMs” before the reader reached the text.

These are design observations supported by the captures, not measured causes of
visitor behavior. There is no new usability study or engagement result.

## Implemented structure

| Destination | What visitors find | Route |
| --- | --- | --- |
| Home | San’s identity, three specific works, background and film identity | `/` |
| Writing | All three essays / personal notes; original dates and reading times | `/writing` |
| Projects | Three browser interactives and the Paper Robots film channel | `/projects` |
| Research | All three publications, authors, venues and supporting links | `/research` |
| About | San’s background, interests, contact and link to full history | `/about` |
| CV | Experience, publications, education, honors and downloadable PDF | `/resume` |
| All work & search | Complete eight-work archive and combined filters | `/notes` |
| Career & history | All ten original milestones | `/history` |

The five primary links remain visible on narrow screens. The home introduction
is compact, with a real portrait. Its selected work presents an actual research
result, the Another Sky interactive and the GPT-7 essay/film together. Their links
explicitly distinguish reading, exploring and watching. The original film artwork
and project screenshot supply the imagery. The result panel is ordinary HTML/CSS;
no new generated decorative art was needed.

The quieter personal palette and typography retain some continuity with the wider
identity. The faux photo collage, topic-folder interface, unused prototype CSS and
generic introductory slogans were removed. Paper Robots remains its own site.

`/lab` still opens the interactive-project listing; `/work`, `/worlds`, numeric
note aliases, rich essay routes, home hash anchors, image/document URLs and the
original manuscripts remain supported. `/writing` and `/projects` have prerendered
HTML, metadata, sitemap entries and explicit Vercel rewrites. The essays now return
to Writing; their optional copy/Markdown controls sit after the article.

## Verification

- Production build and repository lint passed.
- Built-site checks passed at 1440, 390 and 320 pixels: 36 route/viewport checks,
  archive filters and reload/reset behavior, all eight works, all ten milestones,
  17 local reading/media files, both crawler editions and the human app shell.
- Added real navigation journeys: home → Writing → original article → Writing;
  Projects → actual interactive destination; About → complete history.
- Desktop and phone captures of Home, Writing, Projects, Research and About were
  inspected. First featured title appears at approximately y=646 on desktop and
  y=737 on a 390-pixel-wide phone. This is a layout measurement, not audience data.
- The pre-existing GPT-7 article has multiple section-level h1 elements and a
  legacy wide figure layout; the existing broad check explicitly exempts that
  article from single-h1 / overflow assertions. This revision does not claim a
  complete rich-article accessibility audit.

Captures, comparison page and the check report are in
`design/reviews/2026-09-navigation/`. The initial Vite dev server did not detect
some WSL filesystem edits; final captures use the production build served by Vite
preview, avoiding stale development transforms.

## Publication and next feedback

Implementation commit `d866ef9` was pushed to `main`; Vercel deployment
`7QW1yDjHQAB5eUpwi3saRtgGRY35` completed successfully. Live verification confirmed
that nine personal routes serve the expected current JavaScript asset and
prerendered HTML, including /writing and /projects. Phone navigation, all content
counts, the rich essay’s return link and the numeric StartR redirect passed.
See `production-checks.json` and `after/live-home-390.png` in the review folder.

The next useful review is whether a newcomer can find an essay, open a simulation, and
locate San’s background without explanation. Visual preference remains for San
and his visitors to assess. This is not a prerequisite for publishing the change.

Substack remains paused. Film 02’s upload and public link remain unverified. No
account setup, email, social posting, DNS change or monetization was performed.
