# August 2026 website prototypes

Five static design studies: the original homepage (`index.html`), version 3
(`v3/`), `about/`, `retro/` and `riso/`. These were moved from `tmp/proto/` without
changing their HTML or image contents. See the [preview guide](../../README.md).

- `img/` and each study's `img/`: artwork used by the pages; retain relative paths.
- `previews/`: the existing full-page screenshots, crops and comparisons.
- `scripts/capture-preview.mjs`: Playwright screenshot helper. From the repo root:
  `node design/prototypes/2026-08-website/scripts/capture-preview.mjs http://127.0.0.1:4173/v3/ /tmp/sankala-v3-preview.png full`.
  It uses the repo's installed Playwright and browser.
- `scripts/risograph-preview.py`: the original image-treatment experiment, kept
  for reference; it requires NumPy and Pillow. It is not needed to view the pages.
- `history/`: original generation command history, log and Python cache.
  Historical commands refer to earlier machines/folders; do not replay them as
  current instructions.

The pages, artwork, previews and utility scripts are included in Git. `history/`
stays locally ignored. No redesign has been selected or deployed.
