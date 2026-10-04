// Makes the crawler and Markdown editions of "It's just possible" from its one source,
// src/pages/notes/its-just-possible/essay.md, so they can never drift from the page:
//
//   server/essay-previews/generated/its-just-possible.js   HTML body served to crawlers by api/og.js
//   public/notes/its-just-possible.md                       Markdown mirror (llms.txt, Copy article text)
//
// Usage: npm run generate:essay-static -- its-just-possible
import { readFile, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseEssay, PATH, READ_TIME } from '../../src/pages/notes/its-just-possible/essay-source.js';

const SITE = 'https://www.sankala.me';
const source = await readFile(new URL('../../src/pages/notes/its-just-possible/essay.md', import.meta.url), 'utf8');
const { meta, body } = parseEssay(source);
// Site links become absolute, so both editions work wherever they are read.
const absolute = body.replace(/\]\((\/[^)\s]*)\)/g, (_, href) => `](${SITE}${href})`);

const html = renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, absolute)).replace(/\n{3,}/g, '\n\n');
await writeFile(new URL('../../server/essay-previews/generated/its-just-possible.js', import.meta.url), `// GENERATED FILE - do not edit by hand.
// Regenerate with: npm run generate:essay-static -- its-just-possible
export const justPossibleArticleHtml = ${JSON.stringify(html)};
`);

const markdown = `---
title: "${meta.title}"
author: ${meta.author}
date: 2026-10
canonical: ${SITE}${PATH}
---

# ${meta.title}

*${meta.subtitle}*

*By [San Kala](${SITE}) · ${meta.date} · ${READ_TIME}. This is the plain-text mirror of the [web edition](${SITE}${PATH}).*

---

${absolute}
`;
await writeFile(new URL('../../public/notes/its-just-possible.md', import.meta.url), markdown);
console.log(`OK - article HTML: ${html.length} chars, markdown: ${markdown.length} chars`);
