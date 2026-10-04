// The essay's title, deck and dates. The text itself is essay.md, kept as San wrote it so it is easy to update;
// [video] and [model] on lines of their own mark where the video and the 3D model sit.
export const SLUG = 'iros-2026-origami';
export const PATH = '/notes/iros-2026-origami';
export const TITLE = 'Two hands, one sheet of paper';
export const DECK = 'Second place at the IROS 2026 Robotic Origami Challenge: dexterous, bimanual robot folding, with a 62-million-parameter policy trained the night before the last test run.';
export const DATE = 'October 2026';
export const PUBLISHED = '2026-10-03';
export const READ_TIME = '8 min read';
export const MODEL_URL = '/notes/iros-2026-origami/model/index.html';
export const VIDEO = { src: '/media/iros-2026/second-place-16x9.mp4', poster: '/media/iros-2026/second-place-poster.jpg', width: 1280, height: 720 };
export const VIDEO_CAPTION = 'Two robot hands, one sheet of paper, at IROS 2026 in Pittsburgh. 26 seconds. Music: “After Party” by Loyalty Freak Music (CC0).';
export const MODEL_CAPTION = 'The policy in 3D, with a guided tour. Drag to turn it, and follow the tour stop by stop, from the cameras to the plan. The attention weights and the plan surface are illustrations, not recorded data.';

// The essay in pieces: Markdown, with the video and the model between them.
export function essayParts(markdown) {
  return markdown.split(/^\[(video|model)\]\s*$/m).map((text, i) => i % 2 ? { kind: text } : { kind: 'text', text }).filter(part => part.kind !== 'text' || part.text.trim());
}

// The plain-text mirror (public/notes/iros-2026-origami.md): the same words, with the video and the model described.
export function markdownMirror(markdown) {
  const site = 'https://www.sankala.me';
  const body = markdown
    .replace(/^\[video\][ \t]*$/m, `**Video (26 s):** [${VIDEO_CAPTION.replace(' 26 seconds.', '')}](${site}${VIDEO.src})`)
    .replace(/^\[model\][ \t]*$/m, `**Interactive:** [the policy in 3D, with a guided tour](${site}/notes/iros-2026-origami/model/). ${MODEL_CAPTION.split('. ').slice(-1)[0]}`)
    .replace(/\]\(\//g, `](${site}/`);
  return `---
title: "${TITLE}"
author: San Kala
date: 2026-10
canonical: ${site}${PATH}
---

# ${TITLE}

*${DECK}*

San Kala · ${DATE}

---

${body.trim()}
`;
}
