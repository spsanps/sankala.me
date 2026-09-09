# Personal history and the Paper Robots studio

September 8, 2026. San asked for ambitious, Awwwards-level design for **both**
sites, without losing personal history, photographs, content, or clear navigation.
This is the design target, not an award or an independently validated quality claim.

## Personal site

- A large personal masthead, short biography and an interactive four-photo album.
  The album connects the people and photographs to their chapters below.
- Six visible destinations: Writing, Projects, Research, History, About and CV.
- Latest work: the newly published animated film and the space-habitat explorer.
- All ten original career milestones and eight photographs on the homepage itself,
  with dates, captions, research links and certificates. Photos open in a native
  dialog, with keyboard dismissal. The /history route shares this complete view.
- Sticky links jump directly to latest work, career/photos, writing and projects.
- Descriptive work headings explain what opens. Original names, manuscripts,
  dates, public assets and legacy routes remain intact.
- The complete archive now has nine works, including the second film. Subject,
  format and text search support the original and descriptive titles.

Runtime folders follow the existing hierarchy: `src/components/history/`,
`src/components/writing/`, `src/components/projects/`, and page-specific styles
in `src/styles/`. New film media is in `public/images/films/capricious-god/`.
Review captures and browser results: `design/reviews/2026-09-personal-history/`.

## Paper Robots

The separate repository is `/home/san/Projects/paper-robots/site`.
Its homepage uses a large publication masthead, actual painted film frames,
a screening area, both films, the complete first essay, and the author.
Each film now has its own route. The second has chapters that seek the player,
a complete script, captions, production credit and primary incident sources.
A film player loads only after a visitor chooses to watch.

San supplied https://youtu.be/wswbqJNMFBw. YouTube oEmbed confirmed Paper Robots
and “Animated Film: OpenAI’s Agents Hacked Hugging Face” on September 8.
Keep the artistic name “How to Please a Capricious God.” This is an animated
allegory; imagined agent experiences must remain distinguished from the incident.
No YouTube account setting or A/B-test state was inspected or changed.

Film data is `src/data/films.mjs`; shared rendering is in `src/templates/films.mjs`.
The original script is preserved in `content/films/capricious-god/script.md`.
Actual film frames are compressed WebP assets, roughly 70 KB each. No new generated
art was needed: the film's existing images provide the relevant visual identity.

## Domain and hosting

Both sites now use Vercel. Paper Robots was imported and deployed by San.
Primary origin: https://www.paperrobots.studio/.
The apex https://paperrobots.studio/ redirects there with HTTP 308.
GoDaddy authoritative DNS and Cloudflare's public resolver return:

- A @ → 216.198.79.1
- CNAME www → d2a0066b926ad6c7.vercel-dns-017.com.

Both resolved www backend addresses served the site with valid TLS at 20:23 PDT.
The local resolver still had GoDaddy's prior parking records cached. No further
registrar edits are indicated. The fallback is https://paper-robots-site.vercel.app/.
GitHub Pages is retained as a project-address fallback, without a custom domain.

Cloudflare proxy/caching has been discussed but not configured. San's Vercel plan
and usage remain unverified. Substack setup stays paused. No revenue features.

## Verification and limits

Run lint, build and the personal browser check. It covers 36 route/viewport cases,
the complete archive, filter combinations, original article routes, nine works,
ten homepage milestones, eight career photos, photo dialog, album and jump links.
Paper Robots has build/content checks for eight routes and browser checks at
1440, 390 and 320 pixels, both players, chapter seeking and JavaScript-free reading.
Visual captures are reviewed separately; passing structural checks alone is not a
design-quality claim. No visitor study, analytics result or award submission yet.
