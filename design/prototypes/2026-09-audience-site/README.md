# Audience-first website and newsletter studies

September 6, 2026. Requested by San; proposals for review. The production React
site and its existing URLs are unchanged. No newsletter account is connected.

## Open the review board

Double-click `index.html`. The prototypes use relative links, local fonts and
images, and ordinary JavaScript, so they work offline from `file://`.
External links to essays, YouTube, and Dyson Swarm require a connection.

Windows:

```text
C:\Users\sanps\Desktop\Projects\sankala.me\design\prototypes\2026-09-audience-site\index.html
```

WSL:

```text
/home/san/Projects/sankala.me/design/prototypes/2026-09-audience-site/index.html
```

The board has three complete homepage directions, desktop/phone width controls,
an essay treatment, a draft newsletter edition, and the publishing recommendation.
Use “Open selected page in a new tab” to try a page outside the embedded preview.

## Folder guide

| Folder/file | Contents |
| --- | --- |
| `index.html` | Comparison board and concise platform strategy |
| `illustrated-journal/` | Direction A (recommended) and excerpt reading preview |
| `paper-robots-studio/` | Direction B, led by the film identity |
| `field-notes/` | Direction C, with functioning essay/film/world filters |
| `letters/` | First-letter draft and explicitly inactive signup demonstration |
| `shared/assets/` | Small WebP copies of actual film/brand/project artwork; source manifest |
| `shared/fonts/` | Locally served Fraunces and DM Sans, OFL licenses and provenance |
| `shared/styles.css` | Shared typography, layout styles, and responsive rules |
| `shared/interactions.js` | Comparison controls, filters, and form demonstration |
| `previews/desktop/` | Desktop screenshots for each page |
| `previews/mobile/` | Phone screenshots for each page |
| `previews/verification.json` | Browser check results and capture conditions |
| `scripts/capture-and-check.mjs` | Reproducible screenshots and behavior checks |

No new AI artwork was generated for this pass. The source artwork is from the current
Paper Robots studio boards, channel identity, supplied painted-universe
references, and a frame from the clean Another Sky reveal clip. The originals were not edited.
See `shared/assets/provenance.json` for exact paths, hashes, and export details.

The channel banner is retained as a small identity reference; it is not used as
a hero because it contains baked-in text. The profile robot identifies the
publication; San’s actual photograph identifies the author.

The local film guide’s current gouache direction informed the artwork selection:
`/home/san/Projects/yt-blog/paper-robots/.claude/skills/sankala-visual-direction/SKILL.md`
and its `references/style-gouache.md`. The older dark poster direction was not
treated as the current brand. Typography and layouts are new prototype code.

## Reading the prototypes

Recommended: **A**, with C’s archive filtering when useful. B emphasizes the
channel name over the author. These are alternatives to discuss, not measured
conversion winners or a live A/B test.

The essay preview is a selected excerpt, not a replacement for the complete live
essay. The existing rich essay includes its charts, citations, and interactions.
No factual rewrite of the production essay is included here.

Newsletter text is draft first-person copy for San’s review. The preview does not
promise an exact Substack theme; the real provider’s templates differ. Its form
handles only a local submit event, displays a preview message, resets, and never
transmits or stores the address. There is no hidden mailing list or fake success
state.

The YouTube link is the actual first film: **The Coming Robotics Revolution**,
Paper Robots, `kzvqj4jurW0`. Verified through YouTube oEmbed on September 6.
No title/thumbnail test performance or channel analytics are available here.

## Recheck

From the website repository root:

```bash
node design/prototypes/2026-09-audience-site/scripts/capture-and-check.mjs
```

The script uses the repo’s installed Playwright and launches a temporary local
server itself. It checks local resources and links, overflow, browser errors,
filters, review controls, and non-submitting form behavior. It also verifies
`file://` navigation. Screenshots use 1440 × 1000 desktop and 390 × 844 phone
viewports; a 320 px check covers narrower devices.

For a manually browsable HTTP preview, serve the **website repo root** so the
relative links to the written strategy remain valid:

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Open `http://127.0.0.1:4174/design/prototypes/2026-09-audience-site/`.
The prototype folder is not part of Vite’s production build.

Planning: [audience and publishing strategy](../../../docs/online-presence/2026-09-audience-and-publishing.md)
and [prepared Substack launch copy](../../../docs/online-presence/substack-launch-proposal.md).
