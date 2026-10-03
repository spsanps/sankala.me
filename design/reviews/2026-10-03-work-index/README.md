# One Work page — October 3, 2026

San asked for Writing, Projects and Research to stop being separate pages: "it should all be
one... maybe with filters or something. Could be writing and work."

**Now:** `/work` lists every work (nine) as one grid of code-drawn covers, newest first, with
plain filter toggles (All, Writing, Projects, Research, Films) and a quiet search box. Research
works keep their paper title, authors, venue, award note and links. The menu is
Work · History · About · CV (the History label lives in `src/data/navigation.js` while San
decides between History, News and Timeline).

**Old links:** `/writing`, `/projects`, `/research`, `/lab` and `/notes` show the same page
pre-filtered, with a canonical link to `/work`. `/research#zinify` and `/research#embodied-agents`
still land on those papers. `?format=…` links from the old archive and `#writing`-style hashes
select filters. The old `/work → /notes` redirect is gone from `vercel.json`; a cached copy of it
lands on `/notes`, which shows the same page.

| File | Shows |
| --- | --- |
| `before-{writing,projects,research,notes}-{1440,390}.jpg` | The four separate pages, from the live site |
| `after-work-{1440,768,390,360}.jpg` | The Work page at four widths |
| `after-writing-{1440,768,390,360}.jpg` | `/writing`, now the Work page filtered to Writing |
| `after-work-research-filter-1440.jpg` | The Research filter, with paper details |
| `after-work-reduced-motion-1440.jpg` | Reduced motion: still covers only |
