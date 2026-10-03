# Three essays get their figures (2026-10-03)

San asked why the ZINify essay wasn't on the site and wanted the essay ideas put in. Built from the
approved prototypes in `design/prototypes/2026-10-code-drawn-art/` (each in its own style, per the
style register):

| Page | Figure | Before |
| --- | --- | --- |
| `/notes/zinify` (new) | ZINify at the copy center: a photocopied flyer, the paper is cut, pasted, copied and stapled into an eight-page zine you can flip, unfold and copy again | The Work page linked to `/research#zinify` only |
| `/notes/power-quality` (new) | A bench oscilloscope you drive; a stand-in network reads the trace one cycle at a time (labelled illustrative) | The Work page linked to `/research#power-quality` only |
| `/notes/startr-postmortem` | The Startup Game, 2023 edition: a board game placed just before the Glyp Podcasts paragraph; the essay text is unchanged | Text only |

Files: `before-*` are the live site before the change, `after-*` the new build (full pages at 1440
and 390 px), `figure-*` each figure mid-interaction (desktop, phone, reduced motion).

Checks: lint, build and `check:site` pass, including a new check that every essay figure mounts
at its displayed size at 1440, 390 and 320 px. Each figure was driven with Playwright at 1440 and 390
px and with reduced motion: no console errors beyond the two Vercel analytics scripts that only exist
on Vercel, and no horizontal scroll.

The prose on the ZINify and power-quality pages, and the three figure captions, are drafts for San
to rewrite in his own voice.
