# sankala.me

San Kala's personal website, essays and interactive projects. Built with React
and Vite, with Vercel functions for social previews and crawler-facing essay pages.

## Pick up here

- [Online presence plan](docs/online-presence-plan.md): current decisions,
  Paper Robots launch status, preferences and open items. Read this when resuming
  the website, YouTube or newsletter work.
- [Paper Robots branding](branding/README.md): the current banner and profile
  picture, earlier versions and source prompts.
- [Repository structure record](docs/organization/2026-09-06-repo-structure.md):
  the folder reorganization, preserved URLs and verification.

Latest confirmed film status, September 6: San reviewed the YouTube playback and
said it looks good. Publication and the public video URL remain unconfirmed.
The next launch step is to record that URL and use it in the sharing copy.

## Where things belong

| Folder | Contents |
| --- | --- |
| [src/](src/README.md) | `app/`, `pages/` by section, shared `components/`, `data/` and `styles/` |
| `public/` | Files served by the live website: essay artwork, documents and crawler mirrors |
| `api/` | Public Vercel request handlers |
| [server/](server/README.md) | Supporting code and generated crawler articles |
| `scripts/` | `essays/` for publishing tools; `checks/` for site verification |
| [content/](content/README.md) | Each essay's draft, `reviews/`, `assets/` and `archive/` |
| [branding/](branding/README.md) | Reusable identity assets, grouped by brand and platform |
| [design/](design/README.md) | Website design prototypes and their previews |
| `social-assets/bee-simulation/` | MP4 and WebM exports for sharing the bee simulation |
| `docs/` | Current plans, dated historical strategy and organization records |
| [archive/](archive/README.md) | Older resumes, original photos/certificates and website reviews |

The same pattern is used within each project. For example:

```text
content/essays/gpt7-will-have-arms/
  draft.md
  reviews/                    comments, tracker, numbered review rounds
  assets/                     manuscript source artwork and video
  archive/
    manuscripts/
    references/
    planning/
    reviews/

branding/paper-robots/youtube/
  channel-description.md
  banner/                     current/, archive/v1/ … v6/, prompts.md
  profile-picture/            current/, archive/v1/ … v2/, prompts.md
```

The prototype pages and artwork are included in Git. The historical August
strategy, prototype command/session history and `social-assets/` remain local
and ignored. Keep scratch work in ignored `tmp/` only until it has a project
home. `node_modules/` and `dist/` are generated directories.

`public/` follows existing published URL paths. Keep those paths stable when
organizing source files so old links, embeds and shared images continue to work.

## Related film projects on this machine

The website and film production have separate homes:

- **Film code and scripts:** `/home/san/Projects/yt-blog/paper-robots/`.
  Start with its `README.md`; media locations are defined in `pipeline/paths.py`.
- **Studio and media:** `D:\projects\paper-robots\`
  (`/mnt/d/projects/paper-robots/` from WSL).
- **First release:**
  `D:\projects\paper-robots\films\01-gpt-7-will-have-arms\08-release\2026-09-05-v8-1080p\`.
  `UPLOAD.md` has the walkthrough, `youtube/ab-test-pairs.txt` has the current
  title/thumbnail pairs, `social/x/launch-quote-post-draft.md` has the X draft,
  and `RELEASE.md` records publication status.

Film exports stay in the studio. Channel banner/profile artwork stays in this
repo's `branding/`; the studio's `channel/README.md` points back to it.

## Work on the website

```bash
npm ci
npm run dev
```

Use `npm run build` to build `dist/` and `npm run preview` to inspect that build.
`npm run lint` runs ESLint. After building, `npm run check:site` checks the main
pages at desktop/mobile widths, local media and the crawler responses.

The live GPT-7 essay is `src/pages/essays/gpt7-will-have-arms/GPT7Essay.jsx`. Its Markdown and crawler HTML
are generated mirrors. After an essay change, use the existing
`scripts/essays/generate-static.mjs` workflow to refresh those mirrors; that
command writes files, so run it deliberately against the intended page.

For the older design studies, use the separate preview instructions in
[design/README.md](design/README.md).
