# Project continuity

For work on San's online presence, branding, website positioning, newsletter, or
YouTube channel, read `docs/online-presence-plan.md` for context and open items.

San asked on 2026-09-05 to retain the broader plan and bring up overlooked topics
occasionally. During relevant project conversations, mention at most one useful
neglected item at a natural checkpoint, without interrupting the current priority.
Use about two weeks since the item's last substantive discussion as a default
conversation cue, not a user-requested deadline. Update the record when decisions
or progress occur. Do not imply that a background reminder has been scheduled.

Distinguish suggestions from decisions. Paper Robots, @paperrobotsfilms, and the
profile picture are set according to San. Current priority (2026-09-06): an
audience-first redesign of sankala.me and a clear relationship with a possible
free Substack and the YouTube channel. San explicitly puts audience before
professional opportunities and has no existing Substack. No existing newsletter
or email list has been identified.
Latest correction: San explicitly wants **San Kala and Paper Robots to have
separate sites**. The combined homepage felt like a GPT-7 campaign and obscured
his identity and history. The latest five-page study is
`design/prototypes/2026-09-separate-sites/`: a personal homepage with career path,
complete subject/format work index, all ten milestones, a distinct publication
homepage, and a comparison/content map. Subject names are proposed. Paper Robots
curates a subset of San’s work; not every personal note becomes an issue.
The publication domain remains undecided. San found `thepaperrobots.com` awkward;
latest suggestion is `paperrobots.studio`, with `.world`, `.ink`, and `.art` as
alternatives. No domain is purchased. See
`docs/online-presence/2026-09-separate-sites-and-domain.md` for checked prices and
their limitations. Do not reuse the earlier combined homepage as the accepted
architecture. Complete free native Substack reading editions remain recommended.

Earlier, San preferred direction one’s style and explicitly asked for a much more
distinctive design, full coverage of the rest of his existing content, and
substantial native Substack posts. The developed nine-page journal is in
`design/prototypes/2026-09-illustrated-journal/`, with a bespoke generated cover,
interactive figures, a complete notebook, research pages, and all ten original
milestones. The earlier three prototypes remain in
`design/prototypes/2026-09-audience-site/` for comparison. Current recommendation:
complete free reading editions on Substack, rich interactive editions on the
existing site, and one master manuscript. This supersedes the earlier shorter
adapted-letter default. No production redesign or publication account has been
created. See `docs/online-presence/2026-09-journal-content-and-cross-publishing.md`.
Dyson Swarm’s launch is live. The film repo records the first film as published
September 6: https://www.youtube.com/watch?v=kzvqj4jurW0. YouTube oEmbed confirms
the title "The Coming Robotics Revolution" and Paper Robots as author. Studio
settings, analytics, and A/B-test activation remain unverified.

San's latest release instruction (2026-09-05): ship the current film cut and keep
the editorial/opening feedback for future films. Do not reopen a recut or make an
extra viewer-feedback round a launch prerequisite. All three current thumbnails
and complementary titles are prepared; his many-arms concept stays first.

For social copy, San prefers light edits close to his own conversational wording.
He rejected polished launch copy as sounding AI-written. Preserve his voice;
separately flag factual uncertainty rather than rewriting it into generic copy.

San clarified on 2026-09-06 that organization must be visible in the actual
folder hierarchy, including source code and artwork versions, not only README
indexes. Pages are grouped by section; essay-specific components/data stay with
the essay. Writing uses `content/essays/<slug>/{reviews,assets,archive}`. Channel
art uses asset-type folders with `current/` and `archive/vN/`. Preserve existing
public routes and asset URLs, updating imports when moving source files.
See `docs/organization/2026-09-06-repo-structure.md` for the completed pass.

San authorized committing and pushing this organization work on 2026-09-06.
The organization is committed and pushed as `6990eb9`. He also authorized
publishing his Downloads `another-sky-explorer.html` and explicitly asked for
creative ownership of Dyson Swarm’s landing page, visual design and efficiency.
Dyson Swarm is the space collection; Paper Robots is the film identity; sankala.me
is the author/professional index. The Git checkout is
`/home/san/Projects/dysonswarm/site`. Its root of `main` deploys through GitHub Pages.
The collection is at `/`, the cylinder at `/another-sky/`, the original swarm at
`/swarm/`. Publication, committing and pushing this work are authorized.

San explicitly requires his creator presence to remain nonmonetized as of
2026-09-05. Do not set up YouTube Partner Program enrollment, AdSense, paid
memberships/subscriptions, sponsorships, affiliate commissions, tips or donation
links unless he explicitly changes this instruction. Keep this practical
preference in setup decisions and future suggestions. No channel settings have
been changed by the assistant; account state remains unverified.

# File organization

San explicitly requested human-recognizable folders and filenames on 2026-09-05.
Organize deliverables by purpose and project, not the tool that created them.
Do not use generic `output/`, `outputs/`, or `imagegen/` folders for final assets.

- Identity assets belong in `branding/<brand>/<platform>/`; see `branding/README.md`.
- Use descriptive role-based names, such as `profile-picture-v1.png`, and keep
  related prompts/source notes alongside the asset. Preserve earlier versions.
- Planning and project notes belong in `docs/` with meaningful filenames.
- Files consumed by the website belong in its existing `public/` structure.
- Film production files belong in the existing film repo/studio layout recorded
  in `docs/online-presence-plan.md`.

Reuse suitable existing folders, and create subfolders when their contents justify
them. When moving files, update references and remove only empty obsolete folders.
