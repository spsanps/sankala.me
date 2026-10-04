// Writes the plain-text mirror of "Two hands, one sheet of paper" (public/notes/iros-2026-origami.md), linked from
// llms.txt and the page's "Copy article text" button, from the same essay.md the page renders.
// Run after editing src/pages/notes/iros-2026-origami/essay.md: node scripts/essays/generate-iros-mirror.mjs
// npm run check:site fails if the mirror is out of date.
import { readFile, writeFile } from 'node:fs/promises';
import { markdownMirror } from '../../src/pages/notes/iros-2026-origami/essay-meta.js';

const essay = await readFile(new URL('../../src/pages/notes/iros-2026-origami/essay.md', import.meta.url), 'utf8');
await writeFile(new URL('../../public/notes/iros-2026-origami.md', import.meta.url), markdownMirror(essay));
console.log('Wrote public/notes/iros-2026-origami.md');
