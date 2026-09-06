# Repository structure — September 6, 2026

San clarified that a newcomer should understand the project by opening folders.
This second pass reorganizes the website source, manuscripts, artwork versions
and archived photos. It follows the [earlier loose-file cleanup](2026-09-06-cleanup.md).

## Physical changes

- `src/app/`: routing and the shared layout; `src/styles/`: global stylesheet.
- `src/pages/`: separate `home/`, `resume/`, `lab/`, `notes/` and `essays/` folders.
  The GPT-7 essay, its visualizations and data share one essay folder.
- `src/components/writing/`: controls shared by notes and essays.
- `content/essays/gpt7-will-have-arms/`: manuscript, reviews, source media and
  archives split into manuscripts, references, planning and older reviews.
- `branding/paper-robots/youtube/`: banner and profile-picture folders, each
  separating `current/` artwork from `archive/vN/` and keeping its prompt history.
- `server/essay-previews/generated/`: crawler article modules, imported by the
  existing `api/og.js` request handler.
- `scripts/essays/` and `scripts/checks/`: publishing tools and site verification.
- `archive/source-assets/photos/`: imported photo originals;
  `archive/website-content-reviews/`: historical general website reviews.

The [92-file move manifest](2026-09-06-repo-moves.json) records old/new locations
and original checksums. Relative imports, generator destinations and document
links were updated after moving. Public page routes, all 36 public files, and
the Vercel rewrite rules retain their existing paths.

The earlier manifest records where loose files moved in the first pass. For
branding and content locations after this pass, use this record and the current
README. Prototype source and artwork are now included in Git under San's
commit/push instruction. Local command history, archived private planning,
credentials, runtime caches and the existing ignored social exports stay local.

## Verification and publication

- `npm run lint` and `npm run build` pass. The production JS/CSS asset hashes
  match the preceding build; the application bundle is unchanged by these moves.
- Twelve rendered page snapshots (six routes, desktop and mobile) match exactly
  before and after the reorganization. The repeatable `npm run check:site` also
  checks fallback routing, 20 local files, both crawler articles and the app shell.
- All 36 files under `public/` and both crawler HTML responses match their
  pre-move SHA-256 hashes. Page, media, Markdown and preview URLs remain stable.
- All 71 checked local documentation links resolve; no original files were lost.
- New project files were reviewed for credentials, and local history/caches stay
  ignored. San authorized committing and pushing this change to `origin/main`.

Publishing the Another Sky explorer is the next, separate change authorized by
San. This organization commit does not change the visible website.
