# Website source

```text
src/
  main.jsx                         browser entry point
  entry-server.jsx                 shared React pages rendered during production build
  app/                             router and shared page layout
  pages/
    home/                          homepage
    about/                         personal background and project homes
    history/                       complete ten-milestone history
    research/                      full publication details
    resume/                        resume page
    lab/                           experiment listing and entry page
    notes/                         note listing and generic note page
      eai-challenge/               Winning by Overfitting write-up
    essays/
      gpt7-will-have-arms/          essay page, chart components and data
  components/site/                 author navigation, metadata, archive and CV components
  components/writing/              controls shared across essays and notes
  data/                            source notes, topic/format mapping, history, CV data
  styles/                          global, scoped personal-site and reading styles
```

Put a page's own components and data beside that page. Use `components/` for
things shared by multiple sections. Published routes are defined explicitly in
`app/routes.jsx`; moving a source folder does not rename a public URL.

Website images and downloads live in `public/`. Draft manuscripts and reviews
live in `content/`, outside the website source.
