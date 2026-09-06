# Developing the illustrated journal and publishing full Substack editions

September 6, 2026. Latest response to San’s review of the first prototypes.

**Subsequent correction:** San found this combined homepage confusing and explicitly
requested separate San Kala and Paper Robots sites. See
[the current architecture and domain discussion](2026-09-separate-sites-and-domain.md).
This journal remains a visual/content study. Its complete native Substack reading
recommendation still applies to selected Paper Robots work.

## What San changed

San likes direction one’s visual language and wants it developed substantially.
He described the first pass as a useful proof of concept that still felt like a
generic purchased template. He wants more creative ownership, distinctive art,
and potentially generated imagery or 3D where it helps. He also asked how the rest
of his existing content fits, and whether essays should exist in full on Substack
for its discovery system.

This accepts **direction one as the basis for further work**. It does not approve
a production replacement. Audience first and no monetization remain explicit.

## The developed prototype

[Open the new journal](../../design/prototypes/2026-09-illustrated-journal/index.html)
or [read the visual review and content map](../../design/prototypes/2026-09-illustrated-journal/review.html).

The site now has nine designed pages: home, notebook, films, worlds, research,
about, a complete StartR reading page, the proposed letter, and a review page.
The new notebook comes from the actual `src/data/site-content.js` entries.

The creative premise is an illustrated field journal with a physical world
emerging from its pages. A bespoke cover uses the existing Paper Robots character
to set down a cup outside a folded sheet of paper. A small conceptual figure lets
the reader change how many robot bodies share one model; it makes no performance
claim. A native range control tilts the view inside Another Sky through frames
of the actual explorer. Both interactions explain existing work.

Typography, margins, captions, paper details, and the pacing between sections are
part of the identity. The portrait and UIST photograph bring the author back into
the same world as the illustrations. The reading and professional pages are
quieter than the cover. Native scroll, keyboard controls, reduced motion, and
readable content without JavaScript are retained. This is a design direction,
not a claim that the site has won or will win an award.

## Where the rest of the current site goes

| Current material | New home | Preservation detail |
| --- | --- | --- |
| GPT-7 Will Have Arms | Homepage cover, notebook, films | Live rich essay and existing film URL remain linked |
| Winning by Overfitting / EAI Challenge | Notebook and Research | Write-up, paper, and challenge URL remain available |
| StartR post-mortem / Glyp | Notebook, full article, About timeline | Every source paragraph and heading included; original route retained |
| Another Sky | Homepage interaction, Worlds, notebook | Actual explorer URL and scene retained |
| A Clauiet Life / bee simulation | Worlds and notebook | Existing toy URL retained |
| Dyson Swarm simulation | Worlds and notebook | Existing `/swarm/` destination retained |
| ZINify | Notebook, Research, About | Publication, demo, award record and correct UIST photo |
| Power-quality/LSTM research | Notebook, Research, About honors | Full paper title, authors and IEEE award retained |
| Ten news and career milestones | Expandable About timeline | All ten represented, with existing career/research photos |
| Current eBay and prior TI work | Research, About and existing CV | Full work details remain in `/resume` and PDF |
| UCSD and NITK education | About, timeline and CV | Institutions, degrees and years retained |
| EAI, UIST, eBay, IEEE, Kaggle honors | About and professional profile | No awards or rankings invented |
| Contact, GitHub, LinkedIn, Kaggle, YouTube | Footer, About, Films | Actual existing destinations |
| Lab index | Keep route; published interactives surfaced as Worlds | Current `experimentsData` is empty; do not invent Lab entries |

The notebook has eight pieces: six existing notes/projects, plus ZINify and the
power-quality research. The GPT-7 film is a format of the GPT-7 essay, rather than
a fabricated second essay. EAI is both a research entry and an accessible note.
Filters reflect those overlaps.

The source content and route mapping is recorded in the new prototype’s
`content-map.json`. That includes the current source files and the ten milestones.

Two small source inconsistencies were found:

- The original homepage used a UIST photograph with an EAI presentation label.
  The new design uses the UIST image only in its actual UIST context. No production
  source was changed in this prototype pass.
- The homepage and CV disagree about the UCSD graduation month. The prototype
  uses 2024 without inventing a resolution. Confirm the month when revising the
  professional profile; this does not block the design work.

When implemented in React, preserve `/notes`, `/notes/startr-postmortem`,
`/notes/eai-challenge`, `/essays/gpt7-will-have-arms`, `/lab`, `/lab/:id`, `/resume`,
the toy path, PDF, public images, canonical metadata, and crawler article
generation. New `/about`, `/research`, `/films`, and `/worlds` would be additive.
Keep `/notes` as the real archive route even though the prototype’s physical
folder is called `writing/` for readability.

Existing homepage hash links also need a migration mapping: `#home` stays at the
cover, `#about` reaches the author context, `#notes` reaches the notebook section,
`#lab` reaches the worlds section, and `#timeline` reaches the full About history.
The prototype does not change the deployed homepage or those existing anchors.

## Revised Substack recommendation

**Publish complete free reading editions of the essays on Substack.** This replaces
the first study’s default of a shorter adapted letter. San is right to want a
body of work that readers can finish, discuss, and share within Substack itself.

Substack describes a feed informed by interests, subscriptions, follows, and
activity within its network. It does not publish a simple full-text ranking bonus.
[Official feed explanation](https://on.substack.com/p/demystifying-the-feed).

Our recommendation is about providing a worthwhile native reading experience and
participating in that network. We have not measured how full posts perform versus
excerpts for this publication; the publication does not yet exist.

Proposed editions of the same work:

| Site edition | Substack edition |
| --- | --- |
| Full essay at the existing permanent URL | Complete readable argument in a native post |
| Interactive charts and experiments | Static explanatory figures and links to the interactive versions |
| Film beside the essay | Film included in the post |
| Full references and update record | References and relevant corrections included |
| Related research, biography, and project archive | Conversation with readers, Notes, and publication discovery |

Maintain one manuscript in the repo, then publish two presentations of it. Avoid
rewriting the same argument independently for each place. Correct both editions
from the master when the argument changes. Cross-link clearly and keep original
dates visible. Existing site URLs and self-canonical metadata stay intact; do not
claim Substack exposes an arbitrary cross-domain canonical control or that
duplicate publication automatically produces an SEO penalty. The prior strategy
links Google’s canonical guidance if that tradeoff needs a deeper review.

For the first release, put the complete GPT-7 reading edition on Substack with
the existing film, key illustrations, and sources. State that the original essay
was written in December 2025 and that the film is a later adaptation. Keep the
forecast distinct from any claim about an announced product. Inspect graphics
and formatting in the actual editor before calling the post ready to send.

Then consider the EAI write-up and the StartR reflection as distinct posts, at a
pace San wants to sustain. The objective is a recognizable body of thought and
returning readers. Opening the publication does not create a requirement for a
second weekly calendar. No full-archive import, post, email, or recommendation to
another author has been sent.

## Recommended implementation priorities after review

1. Carry this coherent visual direction into the existing React pages while
   preserving content, route behavior, and the rich GPT-7 essay.
2. Finish the author/work/archive navigation before adding more visual effects.
3. Use a few recurring motifs: painted paper, cobalt machinery, the small human,
   red annotations, and scenes from the actual experiments.
4. Create the free publication when San is ready and connect one stable
   subscription route. Keep the channel, site, and Dyson Swarm pointing to it.
5. Publish the first complete reading edition and learn from real readers.

The latest assets and prompts are in
`design/prototypes/2026-09-illustrated-journal/assets/cover/`. Built-in imagegen
created the original cover and the selected background refinement. A failed
transparency output was caught through alpha-channel inspection and rejected.
The selected display image is an ordinary WebP with a paper-colored background.
Source PNGs and exact prompts are retained; original film and brand images are
unchanged.
