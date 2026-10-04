# "It's just possible": milestone 1 (October 3, 2026)

San approved the text for publishing as is ("put it up, I will read it live"). Milestone 1 ships
the essay fully wired, with a first version of its cover; the flight-map figure and the cover
polish come in the art pass.

- Page: `/notes/its-just-possible`, text in `src/pages/notes/its-just-possible/essay.md` (front
  matter plus the draft's words, without the notes block). Prerendered; crawlers get the
  generated edition through `api/og.js`, readers get the prerendered page.
- Listed under Writing & Projects, on the homepage shelf, in RSS, the sitemap and `llms.txt`,
  with a Markdown mirror and a share card made from the cover.
- Timeline: "First on both tracks of the NeurIPS 2026 RealPDE competition" and "Fifth in the
  Tartan IMU Challenge at IROS 2026", without photographs (image-less entries already render).
- Cover v1: a seatback moving map in 2:3 (Natural Earth coastlines, route San Jose to
  Pittsburgh, the plane partway, the title as the destination label, Track 1 #1 and Track 2 #1
  in the data panel). Static for now.

Screenshots: `m1-header-*`, `m1-body-*`, `m1-timeline-*` at 1440 and 390 wide. The reading
column measures the same as the other essays (Georgia 20/37 px on desktop, 18/33 px on phones).
