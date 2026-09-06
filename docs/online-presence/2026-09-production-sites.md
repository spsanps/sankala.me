# Separate sites — production implementation

September 6, 2026. San bought **paperrobots.studio** and authorized implementation,
publication, and managing the available setup. This supersedes the prototype-only
boundaries in the preceding studies.

## The three homes

| Site | Purpose | Repository / deployment |
| --- | --- | --- |
| sankala.me | San’s identity, full work archive, history, research and CV | This repo; existing Vercel integration |
| paperrobots.studio | Curated illustrated essays and animated films | `spsanps/paper-robots-site`; GitHub Pages |
| dysonswarm.com | Space experiments | Existing `spsanps/dysonswarm`; unchanged in this implementation |

The live personal domain currently redirects to **www.sankala.me**. Canonicals,
RSS and sitemap therefore use www, while the short address remains valid for
display and sharing.

Personal pages: `/`, `/notes`, `/history`, `/research`, `/about`, `/resume`, `/lab`,
and the full `/notes/startr-postmortem` note. The archive includes all eight works
with subject, format, and search filters. History has all ten milestones; the
homepage has the four-stage career path and the real author photograph.

Preserved: rich GPT-7 and EAI essays, numeric note aliases, legacy home hashes,
CV/document URLs, toys, and existing images. The personal build prerenders the new
pages, so the content and metadata are available before JavaScript. The rich
essays retain their crawler handler and use a separate clean app shell for human
visitors. Their fonts now use the locally hosted site families.

Paper Robots has its own homepage, reading room, full essay, film page, About page,
and Follow page. The original article text, tables, three figures, and sources
are retained. The complete Substack export is generated from the same source.
An original December 2025 essay is distinguished from its September 2026 film.
The reading edition points its canonical to San’s original rich edition.

## Where the Paper Robots work lives

Windows: `C:\Users\sanps\Desktop\Projects\paper-robots\site`
WSL: `/home/san/Projects/paper-robots/site`

- `src/`: editable publication pages, styles, templates, browser interactions.
- `content/essays/gpt7-will-have-arms/`: complete manuscript, HTML, source hashes.
- `publishing/substack/`: complete pasteable reading edition, figures, author photo,
  publication logo, and walkthrough.
- `design/`: source illustration/prompt, social-card source, desktop/mobile reviews.
- `docs/launch/`: DNS records and current account handoff.

The private film-production repository and media studio were not moved or exposed.

## Account handoff

GitHub authentication is available. Vercel deploys through its existing repository
integration. No new hosting API key is needed for either. Public DNS now shows
GoDaddy nameservers for paperrobots.studio; no authenticated DNS access is available
and no DNS changes have been made. Paper Robots is configured for GitHub
Pages Actions and deployed successfully at the temporary address
https://spsanps.github.io/paper-robots-site/.

Substack setup is in progress on San’s side. His screenshot shows Edit Profile:
use **San Kala** as the author and `sankala` as the handle if available. The separate
publication should be **Paper Robots**, with the robot logo. Public publication
address remains unverified; do not connect a guessed URL.

Profile bio prepared:
> AI researcher at eBay. I write about AI, robots, and possible futures, and turn
> some of those essays into films at Paper Robots.

Current next navigation: save profile → Done → profile menu → Publisher dashboard.
Home → + → Post can initialize publishing, without publishing or emailing an
empty draft. Use a Custom website theme for publication branding. Official guide:
https://support.substack.com/hc/en-us/articles/29152946791188-How-can-I-publish-on-Substack.

No paid subscriptions, pledges, Stripe, donations, or other revenue setup. No
Substack post or subscriber email has been sent. Subscribe links remain conditional
on a verified publication URL; YouTube and RSS work in the meantime.

## Verification and release state

Verification artifacts are in `design/reviews/2026-09-launch/` in each repository.
Check production deployment status after pushing; do not infer a successful
deployment solely from a successful Git push. Domain/certificate connection and
the Substack URL remain user-dependent follow-ups.

Paper Robots release `049dab9` passed GitHub Actions build/deploy in run
34065548843 and all 18 deployed browser/viewport checks. The production essay and
Substack export are checked against the complete source article. The personal
site passed its 30 page/viewport checks, archive filter/reset/deep-link checks,
16 public files, both crawler responses, and the clean human app shell.

The dependency audit identified old React Router advisories. The production
dependency was updated within v7 to 7.18.3 and verified again before release.
Vite and other development tooling still have separate maintenance advisories;
this change does not claim a full dependency-security cleanup. Local development
servers are bound to 127.0.0.1. Router advisory source:
https://github.com/advisories/GHSA-337j-9hxr-rhxg.

Personal release `d008e20` deployed successfully through Vercel. Live checks
confirmed prerendered content and canonicals for the new pages, the original
essay routes, and the public reading assets. Production-only npm audit reports
zero vulnerabilities with React Router 7.18.3.

Until the new domain is connected, personal-site links to Paper Robots use its
working GitHub Pages address through `src/data/links.js`. After DNS and HTTPS are
verified, switch that constant and the link in `public/llms.txt` to
`https://paperrobots.studio/`. This keeps the new personal-site links usable
during the account setup.
