# September 9: two different homepage experiences

San rejected the September 8 websites as ordinary blogs. The previous work did
not meet his request for distinctive, ambitious craft. No award is claimed, and
the new designs await his assessment.

## Current cover: three photographs

San found the replacement TI and eBay images visually poor. The cover is now a
three-photo composition: portrait, NeurIPS award and UCSD research group. The group
keeps its full landscape shape, and the unused lower row of the spread is removed.
There is still a grid arrangement and direct links to About and the relevant
history milestones. Original TI/eBay photographs remain in the ten-entry timeline;
no history image, route or public asset was removed. The film and cylinder remain
in the compact Recent additions section. This is an implementation choice in
response to feedback, awaiting San's assessment.

Current review: `design/reviews/2026-09-09-three-photo-cover/`.

## Follow-up: the author's identity is broader than the latest work

San rejected the eye and cylinder as dominant personal-cover images: they represent
a day or two of recent work, not his whole life. The current cover replaces those
two objects with photographs from Texas Instruments and eBay. Together with the
portrait, UCSD group and NeurIPS award, it presents a longer personal history.
Every photograph links to About or its own milestone. The grid and depth interaction
remain; the habitat preview was removed from the personal cover.

Full history, writing and projects now precede a compact, dated Recent additions
section for the film and cylinder. They remain discoverable without receiving the
visual weight of the author identity. The public preview asset is preserved, but
is not downloaded by this cover. The studio keeps its film-led design.
Review of that intermediate version: `design/reviews/2026-09-09-personal-balance/`.

## First personal revision (superseded by the feedback above)

A large, dark-green personal masthead and a collection of five real photographs
and projects replace the editorial cover. Each object is a normal link: About,
two specific career milestones, the Hugging Face film, and the space habitat.
Pointer movement gives the spread slight depth; hover and keyboard focus raise
an object. “Arrange as a grid” offers a straightforward alternative. The space
preview plays only when requested, silently, and pauses outside the viewport.

The ten career milestones and eight photographs remain directly on the homepage,
in a dark-green section with cream photo frames. Each photo still enlarges in a
native dialog. Clear section navigation, descriptive work titles, the nine-work
archive and original articles/routes remain. The author site and studio stay
separate. Source: `src/components/home/PersonalAtlas.jsx`, `src/pages/home/Home.jsx`,
`src/styles/personal-atlas.css`; visual checks: `design/reviews/2026-09-09-personal-collection/`.

## Paper Robots

The homepage opens on actual moving film artwork. A two-film selector changes
the background and featured story; Watch opens the selected full film in a native
dialog, with Escape and a visible close control. YouTube is not loaded before the
viewer asks. The film collection uses large painted stills; the complete essay
has a separate illustrated invitation. Film details, sources, chapters, script,
caption download and full reading edition remain available.

Silent, eight-second previews are about 624 KB and 632 KB, rather than embedding
full release files. Only the selected preview loads. Motion has a pause button,
pauses offscreen/in background tabs/during the screening, and starts disabled for
reduced-motion and Save-Data preferences. Normal links and stills work without JS.

Paper source: `src/templates/cinema.mjs`, `src/scripts/cinema.js`,
`src/styles/cinema.css`, `src/pages/home.html`. Both canonical URLs remain unchanged.

## Media provenance

The personal habitat preview is a nine-second excerpt, starting at 2 seconds, of
Dyson Swarm's existing `another-sky-ground-to-overhead-v1-1080p.mp4`. It is encoded
at 800×450 / 24 fps, H.264 CRF 27, silent, faststart; about 316 KB. No photographs
were generated or retouched. Film excerpt provenance is recorded in the Paper
Robots repository at `design/film-previews/README.md`.

## Validation and release

Passed: personal lint/build and 36 route/viewport checks with archive, history,
photographs, grid arrangement, photograph-to-milestone links and the original
article/crawler checks. The habitat video was separately played, paused and
checked for no initial download with reduced motion. Paper passed build/content
checks and 24 route/viewport checks, plus scene switching, preview pause, the
correct screening target, Escape teardown, no-JS reading/links and reduced motion.
The GitHub Pages base path was built and both preview paths checked.

The review folders contain screenshots and machine-readable checks.

Published September 9:
- Personal runtime: `96a2504`, Vercel successful.
- Paper Robots runtime: `ee64c05`, Vercel and GitHub Pages successful.

Public-domain checks at 1440 and 390 px confirmed the new personal collection,
grid, habitat playback/pause, photograph-to-milestone links, ten milestones, eight
career photos and photo-dialog Escape behavior, with no browser exceptions. On
Paper Robots both local film previews played, scene selection targeted the correct
full film, Escape removed the external player, and the apex redirected to www.
Both domains resolved through normal DNS; the prior parking-page cache issue was
not present in these checks. Vercel checks passed for the runtime commits above.

San has not yet assessed this revision. Awards, visitor approval, audience growth
and external account/settings changes are not claimed.
