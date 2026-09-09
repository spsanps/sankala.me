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
Latest feedback, September 9: San rejected the TI/eBay replacement cover photos
as visually poor. The implementation now uses three cover photos: the portrait,
NeurIPS award with his brother, and the complete UCSD group photograph. The TI/eBay
photos remain in the full timeline. Do not fill the cover with weak images just
to maintain five objects. This revision is not yet approved by San.
See design/reviews/2026-09-09-three-photo-cover/.

Earlier correction, September 9: San said the eye and cylinder on the new personal
cover made two days of work look like his entire identity. The cover should reflect
his longer life/history; those recent pieces belong in a smaller, dated section.
The revised cover uses real photographs from UCSD, TI, eBay, NeurIPS and his portrait.
The full history, writing and projects precede the compact recent additions.
Do not make the newest films or space experiments the identity of sankala.me.
Paper Robots is where film artwork should be prominent.

Earlier feedback, September 9: San rejected both September 8 designs as ordinary,
boring blogs. The new homepages use an actual moving film setting for Paper Robots
and a spatial collection of real photographs/projects for San, with a grid option.
Preserve the complete history and plain navigation. These revisions are not yet
validated by San. See docs/design/2026-09-09-cinema-and-personal-collection.md.

Earlier design instruction, September 8: both sites should have ambitious,
Awwwards-level craft. Restore all ten personal milestones and eight photographs
directly on the homepage; preserve clear navigation and descriptive work titles.
The second film is https://youtu.be/wswbqJNMFBw, confirmed by San and oEmbed.
See docs/design/2026-09-personal-history-and-studio.md. No award is claimed.

Earlier feedback, September 8: visitors find the personal site confusing, too
AI-made, and unclear about what to read or open. The implementation now uses
plain Writing / Projects / Research / About / CV navigation, visible on phones,
and actual work near the top. Keep full coverage and the separate-site decision;
do not restore the abstract topic-folder homepage or generic branding slogans.
The new design has not yet received visitor validation. See
`docs/online-presence/2026-09-navigation-and-content.md`. Substack stays paused.

Latest correction: San explicitly wants **San Kala and Paper Robots to have
separate sites**. The combined homepage felt like a GPT-7 campaign and obscured
his identity and history. The latest five-page study is
`design/prototypes/2026-09-separate-sites/`: a personal homepage with career path,
complete subject/format work index, all ten milestones, a distinct publication
homepage, and a comparison/content map. Subject names are proposed. Paper Robots
curates a subset of San’s work; not every personal note becomes an issue.
San has now bought **paperrobots.studio** and explicitly authorized making the
separate sites real, including publication and managing setup where access allows.
The implementation is in this repo and the separate public website repo
`/home/san/Projects/paper-robots/site` (GitHub: spsanps/paper-robots-site).
Both sites now use Vercel. San completed Paper Robots import and GoDaddy DNS;
www.paperrobots.studio is primary, with an apex redirect. GitHub Pages remains a
fallback without a custom domain. Substack remains paused and has no confirmed URL. San is editing
his Substack author profile: use San Kala there and Paper Robots for the publication.
Do not reuse the earlier combined homepage as the accepted architecture.
Complete free native Substack reading editions remain recommended; the first
complete edition, figures, and author/publication images are prepared in the
Paper Robots site’s `publishing/substack/` folder. See
`docs/online-presence/2026-09-production-sites.md` for implementation and launch state.

Earlier, San preferred direction one’s style and explicitly asked for a much more
distinctive design, full coverage of the rest of his existing content, and
substantial native Substack posts. The developed nine-page journal is in
`design/prototypes/2026-09-illustrated-journal/`, with a bespoke generated cover,
interactive figures, a complete notebook, research pages, and all ten original
milestones. The earlier three prototypes remain in
`design/prototypes/2026-09-audience-site/` for comparison. Current recommendation:
complete free reading editions on Substack, rich interactive editions on the
existing site, and one master manuscript. This supersedes the earlier shorter
adapted-letter default. The production implementation now follows the separate-site correction above;
Substack publication creation is underway on San’s side. See `docs/online-presence/2026-09-journal-content-and-cross-publishing.md`.
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
