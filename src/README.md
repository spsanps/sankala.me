# Website source

```text
src/
  main.jsx                         browser entry point
  entry-server.jsx                 shared React pages rendered during production build
  app/                             router and shared page layout
  pages/
    home/                          homepage: the four-places desk, the covers shelf
      four-frames/                 the desk's drawing: room, window views, objects, stage
    about/                         personal background and project homes
    history/                       complete ten-milestone history
    research/                      full publication details
    resume/                        resume page
    projects/                      interactive projects and film channel
    writing/                       essay and personal-note index
    lab/                           legacy experiment entry route
    notes/                         note listing and generic note page
      eai-challenge/               Winning by Overfitting write-up
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

The homepage desk (`pages/home/four-frames/`) is one clear-line drawing of San's desk that
changes by hand through his four places as the page scrolls; `FourFrames.jsx` holds the words
and `eras.js` maps every milestone in `data/history.json` to its place. The page shows a static
print of the desk first (`public/images/home/`, also the share card and the plain/reduced-motion
stills), then loads the drawing as a lazy chunk and swaps it in. The print and the live drawing
are laid out by the same numbers (`four-frames/constants.js`, `stage.js`, `styles/home.css`), so
after changing the drawing or the layout, run `npm run render:home` and keep the images. Review
hooks: `?t=` freezes time, `?hour=` sets San Jose time, `?pos=0–3` and `?era=` pick a place,
`?plain=1` shows the plain version.

Website images and downloads live in `public/`. Draft manuscripts and reviews
live in `content/`, outside the website source.
