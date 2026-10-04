# Website source

```text
src/
  main.jsx                         browser entry point
  entry-server.jsx                 shared React pages rendered during production build
  app/                             router and shared page layout
  pages/
    home/                          homepage: the mosaic apse, the path on marble tablets, the shelf, the mosaic footer
      mosaic/                      the apse: laying engine, places, stills layout, live layer (worker), light
    about/                         personal background and project homes
    history/                       complete ten-milestone history
    research/                      full publication details
    resume/                        resume page
    projects/                      interactive projects and film channel
    writing/                       essay and personal-note index
    lab/                           legacy experiment entry route
    notes/                         note listing and generic note page
      eai-challenge/               Winning by Overfitting write-up
      iros-2026-origami/           Two hands, one sheet of paper: essay.md (the text), its page, the diagram kit (art/)
    essays/
      gpt7-will-have-arms/          essay page, chart components and data
  components/site/                 author navigation, metadata, archive and CV components
  components/writing/              controls shared across essays and notes
  components/art/                  code-drawn art: LivingCanvas and the build queue
    covers/                        one module per work's cover, the shared print kit, Cover component
  data/                            source notes, topic/format mapping, history, CV data
  styles/                          global, scoped personal-site and reading styles
```

Put a page's own components and data beside that page. Use `components/` for
things shared by multiple sections. Published routes are defined explicitly in
`app/routes.jsx`; moving a source folder does not rename a public URL.

## Code-drawn art

`components/art/LivingCanvas.jsx` shows a drawing as a static print first and makes it
live later. The `<img>` is in the HTML for first paint, crawlers and readers without
JavaScript. Once the element is on screen and the browser is idle, its renderer prints
the live version into a canvas laid exactly over the image, with no layout shift. It
animates only while visible and the tab is shown, caps the pixel ratio at 2, rebuilds on
a real resize, and leaves reduced-motion readers with the static print. Builds run one at
a time through `build-queue.js`.

Covers (`components/art/covers/`) are keyed by the work slugs in `data/work.js`. Each
module draws one cover in 400×600 design units with the print kit in `kit.js`; its
lettering faces are self-hosted in `public/fonts/covers/` and loaded on demand. The kit
and cover modules are separate chunks, downloaded only when a cover comes alive. After
changing a cover, run `npm run render:covers` and keep the regenerated images in
`public/images/covers/`: the shelf prints, archive thumbnails, and 1200×630 share cards
(GPT-7 keeps its existing share image).

The homepage (`pages/home/`) is one building in mosaic: a lapis wall with gold stars and a great
gold apse holding San's desk (`MosaicApse.jsx`), his words on a marble stele, his path on marble
tablets (`eras.js` maps every milestone in `data/history.json` to its place), the covers shelf on
plaster, and a mosaic footer (`MosaicFooter.jsx`). How it stays fast:

- **First paint is a set of stills.** `npm run render:home` lays the apse with the same code the live
  layer runs (`mosaic/build.js`) and prints the wall, archivolt and cornice for each layout class
  (side, mid, band), every conch (San Jose in each of ten moments, the other three places), the
  tablets' frame tiles and round heads, the coursed wall below the cornice, the frieze, the marble
  and the share card into `public/images/home/`. The numbers they were printed with
  (`mosaic/layout.js`, `mosaic/stills.json`) become CSS custom properties (`mosaic/style.js`), and
  `styles/home.css` places everything from the viewport, so the stills are already composed on the
  first paint with no script. Two inline scripts (`mosaic/first-paint.js`) pick San Jose's moment
  before the apse is parsed and hold the apse back (at most 1.5 s) until its stills and fonts are
  decoded, so its first visible frame is finished. The stele and tablets are pure CSS (marble, a
  `border-image` frame, a printed round head), so they fit any text.
- **Live work happens off the main thread.** When the browser is idle, `mosaic/live.js` reads the
  apse's box back from the page and hands two canvases to a worker (`mosaic/worker.js`, running
  `mosaic/stage.js`): it lays each place in slices, paints their layers on the CPU, draws the moving
  stones over the still, re-lays the conch in a wave as the words reach each place, and lights the
  gold and glass in WebGL (`mosaic/glint.js`, the wall's stones from `glint-<class>.bin`). Browsers
  without OffscreenCanvas run the same stage on the main thread in idle slices. Reduced motion and
  `?plain=1` get the stills only, switched per place.
- After changing the drawing, the places or the layout numbers, run `npm run render:home` (about
  two minutes) and keep the images. Review hooks: `?hour=0–24` (San Jose's moment and the clock),
  `?t=<s>&pos=0–3` (freeze one moment, also between places), `?light=x,y`, `?glint=off`, `?plain=1`.

Website images and downloads live in `public/`. Draft manuscripts and reviews
live in `content/`, outside the website source.
