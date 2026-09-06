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
profile picture are set according to San. Current priority: finish publishing the
first film and help with launch sharing. On 2026-09-06 San said playback looks
good, requested the Public publishing steps, then asked about native X uploads.
Publication and a public URL remain unconfirmed. Broader positioning, cadence, and
site architecture remain provisional.

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
Afterward, publish his Downloads `another-sky-explorer.html`, inspect the existing
`/home/san/Projects/dysonswarm` project and consider Dyson Swarm as the home for
space interactives, connected to his website and Paper Robots. Publication is
authorized; choose the concrete integration after inspecting that project.

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
