# Website design studies

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
