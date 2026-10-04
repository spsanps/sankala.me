// The essay's title, deck and dates. The text itself is essay.md, kept as San wrote it so it is easy to update;
// [video], [lift], [folds] and [model] on lines of their own mark where the video, the two diagrams and the 3D model sit.
export const SLUG = 'iros-2026-origami';
export const PATH = '/notes/iros-2026-origami';
export const TITLE = 'Two hands, one sheet of paper';
export const DECK = 'Second place at the IROS 2026 Robotic Origami Challenge: dexterous, bimanual robot folding, with a 62-million-parameter policy trained the night before the last test run.';
export const DATE = 'October 2026';
export const PUBLISHED = '2026-10-03';
export const READ_TIME = '8 min read';
export const MODEL_URL = '/notes/iros-2026-origami/model/index.html';
export const VIDEO = { src: '/media/iros-2026/second-place-16x9.mp4', poster: '/media/iros-2026/second-place-poster.jpg', width: 1920, height: 1080 };
export const VIDEO_CAPTION = 'Two robot hands, one sheet of paper, at IROS 2026 in Pittsburgh. 26 seconds. Music: “After Party” by Loyalty Freak Music (CC0).';
export const LIFT_CAPTION = 'Lifting a corner. One hand presses the sheet and pushes toward the corner, so it rises a little; the other slides a fingertip under it. Drawn in code.';
export const FOLDS_CAPTION = 'The five folds. The plane’s five stages as instruction diagrams, drawn in code. The robot hands fold the two stages my policy folded in the final; the rest are greyed out. Pick a step, or play all five.';
export const MODEL_CAPTION = 'The policy in 3D, with a guided tour. Drag to turn it, and follow the tour stop by stop, from the cameras to the plan. The attention weights and the plan surface are illustrations, not recorded data.';

// The essay in pieces: Markdown, with the video and the model between them.
export function essayParts(markdown) {
  return markdown.split(/^\[(video|model|lift|folds)\]\s*$/m).map((text, i) => i % 2 ? { kind: text } : { kind: 'text', text }).filter(part => part.kind !== 'text' || part.text.trim());
}

// The plain-text mirror (public/notes/iros-2026-origami.md): the same words, with the video and the model described.
export function markdownMirror(markdown) {
  const site = 'https://www.sankala.me';
  const body = markdown
    .replace(/^\[video\][ \t]*$/m, `**Video (26 s):** [${VIDEO_CAPTION.replace(' 26 seconds.', '')}](${site}${VIDEO.src})`)
    .replace(/^\[lift\][ \t]*$/m, '**Figure: lifting a corner.** A diagram on the page: one robot hand presses the sheet near a corner and pushes toward it, so the corner rises a little; the other slides a fingertip under it.')
    .replace(/^\[folds\][ \t]*$/m, '**Figure: the five folds.** On the page, the plane’s five stages are origami instruction diagrams that fold: the two corners, the centre and the two wings. Stage 1: my policy, clean. Stage 2: my policy, with one assist. Stage 3: only the winning team got here. Stages 4 and 5: nobody got here.')
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
