# Website source

```text
src/
  main.jsx                         browser entry point
  app/                             router and shared page layout
  pages/
    home/                          homepage
    resume/                        resume page
    lab/                           experiment listing and entry page
    notes/                         note listing and generic note page
      eai-challenge/               Winning by Overfitting write-up
    essays/
      gpt7-will-have-arms/          essay page, chart components and data
  components/writing/              controls shared across essays and notes
  data/site-content.js             site listings and links
  styles/site.css                  global styles and Tailwind directives
```

Put a page's own components and data beside that page. Use `components/` for
things shared by multiple sections. Published routes are defined explicitly in
`app/App.jsx`; moving a source folder does not rename a public URL.

Website images and downloads live in `public/`. Draft manuscripts and reviews
live in `content/`, outside the website source.
