# Website design studies

## Current: separate San Kala and Paper Robots sites, September 2026

San identified the combined homepage as confusing: it felt like a GPT-7 campaign
and obscured his history. He explicitly wants separate personal and publication
sites. [Open the new comparison and content map](prototypes/2026-09-separate-sites/index.html),
[the personal homepage](prototypes/2026-09-separate-sites/san-kala/index.html), or
[Paper Robots](prototypes/2026-09-separate-sites/paper-robots/index.html).

The five-page study includes a complete subject/format index and the full history.
San’s name, current work, photographs, and career path lead his homepage. Paper
Robots leads with its editorial purpose and presents GPT-7 as its first issue.
See [the guide](prototypes/2026-09-separate-sites/README.md) and
[the current architecture/domain discussion](../docs/online-presence/2026-09-separate-sites-and-domain.md).
San subsequently bought **paperrobots.studio** and authorized implementation.
Production pages are in `src/`; the Paper Robots site is in its own repository.
See [the production handoff](../docs/online-presence/2026-09-production-sites.md)
and current captures in `reviews/2026-09-launch/`. The studies remain as history.

## Second study: developed illustrated journal, September 2026

San preferred the illustrated journal’s style and asked for a substantially more
distinctive result with the rest of his content included. [Open the developed
journal](prototypes/2026-09-illustrated-journal/index.html), [see its design and
content map](prototypes/2026-09-illustrated-journal/review.html), or [read the folder
guide](prototypes/2026-09-illustrated-journal/README.md).

The second study has nine pages, custom generated cover artwork, a conceptual
robot-body control, an actual Another Sky view control, the complete source
notebook, research, a full reading page, and all ten original milestones. No
production redesign or newsletter account has been created. The current publishing
recommendation is complete free reading editions on Substack with rich editions
kept on the site.

## First pass: three audience-first directions, September 2026

[Open the comparison board](prototypes/2026-09-audience-site/index.html) or
[read its folder guide](prototypes/2026-09-audience-site/README.md).
Three responsive directions use the actual current Paper Robots artwork:
an illustrated journal, a film-led publication, and a spare notebook. There are
also essay and newsletter previews, saved desktop/phone screenshots, and a
reproducible browser check. These work directly from `file://` with local fonts.
San subsequently preferred the illustrated journal’s style, then requested
distinct personal and publication sites. These first studies are retained for context.

The proposed platform relationship and free Substack launch copy are under
[`docs/online-presence/`](../docs/online-presence/2026-09-audience-and-publishing.md).
No production redesign or newsletter setup is included in this prototype pass.

## Earlier: August 2026 studies

The August 2026 prototypes now live in
[`prototypes/2026-08-website/`](prototypes/2026-08-website/README.md), recovered
from `tmp/proto/` on September 6. They are exploratory designs, not the deployed
website or an approved redesign. The pages, artwork and preview scripts are now
included in Git; original command/session history stays locally ignored.

From the website repo root, preview them with:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory design/prototypes/2026-08-website
```

| Study | Local preview |
| --- | --- |
| Original illustrated homepage | http://127.0.0.1:4173/ |
| Version 3 homepage | http://127.0.0.1:4173/v3/ |
| About page | http://127.0.0.1:4173/about/ |
| Retro treatment | http://127.0.0.1:4173/retro/ |
| Risograph treatment | http://127.0.0.1:4173/riso/ |

Serve the prototype folder as the server root: some navigation uses `/` and
`/v3/`. Images remain beside the HTML that uses them. The About page's `/resume`
link targets a real-site route that was never part of this static prototype.

Saved screenshots are in `previews/`, utility scripts in `scripts/`, and original
generation commands/logs in `history/`. The command history contains old machine
paths and is retained as provenance, not as a runnable setup guide.

For current branding and decisions, use [branding](../branding/README.md) and
[the online presence plan](../docs/online-presence-plan.md).
