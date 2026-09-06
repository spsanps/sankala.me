# Website design studies

## Current: audience-first website, September 2026

[Open the comparison board](prototypes/2026-09-audience-site/index.html) or
[read its folder guide](prototypes/2026-09-audience-site/README.md).
Three responsive directions use the actual current Paper Robots artwork:
an illustrated journal, a film-led publication, and a spare notebook. There are
also essay and newsletter previews, saved desktop/phone screenshots, and a
reproducible browser check. These work directly from `file://` with local fonts.
The recommendation is the illustrated journal; San has not selected a direction.

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
