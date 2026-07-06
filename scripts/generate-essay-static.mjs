// Generates the crawler-facing static versions of the GPT-7 essay from the
// rendered page itself, so they can never drift from what humans see.
//
// Outputs:
//   api/_essay-static.js               - HTML body served to crawlers by api/og.js
//   public/essays/gpt7-will-have-arms.md - markdown mirror for LLMs (linked from llms.txt)
//
// Usage: node scripts/generate-essay-static.mjs [url]
//        (defaults to the production URL; pass http://localhost:5173/... to run against dev)

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import TurndownService from 'turndown';
import turndownPluginGfm from 'turndown-plugin-gfm';
import { unitreeTrajectory } from '../src/data/essays/gpt7-arms-data.js';

const URL_ARG = process.argv[2] || 'https://www.sankala.me/essays/gpt7-will-have-arms';
const SITE = 'https://www.sankala.me';

// The one Recharts chart on the page (Unitree price trajectory) is SVG, so the
// static versions replace it with the same data as an HTML table.
const chartTable = `<table>
<caption>Unitree humanoid price trajectory</caption>
<thead><tr><th>Date</th><th>Model</th><th>Price (USD)</th><th>Notes</th></tr></thead>
<tbody>
${unitreeTrajectory.map(r =>
  `<tr><td>${r.month} ${r.year}</td><td>${r.model}</td><td>$${r.price.toLocaleString('en-US')}</td><td>${r.description}${r.reduction ? ` (${r.reduction} cheaper)` : ''}</td></tr>`
).join('\n')}
</tbody>
</table>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(URL_ARG, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('article', { timeout: 30000 });
await page.waitForTimeout(3000); // let charts/images settle

const articleHtml = await page.evaluate((site) => {
  const article = document.querySelector('article').cloneNode(true);

  // Replace the Recharts chart block with a placeholder the script fills in.
  article.querySelectorAll('.recharts-wrapper').forEach(el => {
    const placeholder = document.createElement('div');
    placeholder.setAttribute('data-chart-placeholder', 'true');
    // The chart sits inside a 0x0 responsive container; replace that whole wrapper.
    const container = el.closest('.recharts-responsive-container') || el.parentElement;
    container.replaceWith(placeholder);
  });

  // Strip interactive/decorative chrome that carries no content.
  article.querySelectorAll('svg, button, [aria-hidden="true"], .recharts-tooltip-wrapper')
    .forEach(el => el.remove());

  // Absolute URLs for images and internal links.
  article.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('/')) img.setAttribute('src', site + src);
    img.removeAttribute('srcset');
  });
  article.querySelectorAll('a[href^="/"]').forEach(a => {
    a.setAttribute('href', site + a.getAttribute('href'));
  });

  // Section ornament letters (decorative drop-cap style markers before headings).
  article.querySelectorAll('h1, h2').forEach(h => {
    let prev = h.previousElementSibling;
    if (prev && prev.textContent.trim().length <= 2) prev.remove();
    // Ornament rendered inside the heading as its own span
    [...h.querySelectorAll('span')].forEach(s => {
      if (s.textContent.trim().length <= 2 && h.textContent.trim().length > 4) s.remove();
    });
  });

  // Demote headings one level so the page <h1> is the essay title.
  for (const [from, to] of [['h4', 'h5'], ['h3', 'h4'], ['h2', 'h3'], ['h1', 'h2']]) {
    article.querySelectorAll(from).forEach(el => {
      const repl = document.createElement(to);
      repl.innerHTML = el.innerHTML;
      if (el.id) repl.id = el.id;
      el.replaceWith(repl);
    });
  }

  // Sidebars/callouts: drop the type badge header and turn the title into a
  // real heading so structure survives without the site CSS. Done after the
  // demotion pass so these stay h4.
  article.querySelectorAll('.sidebar-note-header').forEach(el => el.remove());
  article.querySelectorAll('.sidebar-note-title, .callout-title').forEach(el => {
    const h = document.createElement('h4');
    h.textContent = el.textContent.trim();
    el.replaceWith(h);
  });

  // Strip class/style attributes - the static page has its own minimal styling.
  article.querySelectorAll('*').forEach(el => {
    el.removeAttribute('class');
    el.removeAttribute('style');
    el.removeAttribute('tabindex');
    el.removeAttribute('data-section');
  });

  // Drop now-empty wrappers left behind by removed decorations.
  let removed = true;
  while (removed) {
    removed = false;
    article.querySelectorAll('div, span, p').forEach(el => {
      if (el.matches('[data-chart-placeholder]')) return;
      if (!el.textContent.trim() && !el.querySelector('img, table, [data-chart-placeholder]')) {
        el.remove();
        removed = true;
      }
    });
  }

  return article.innerHTML;
}, SITE);

await browser.close();

const html = articleHtml
  .replace(/<div data-chart-placeholder="true"><\/div>/g, chartTable)
  .replace(/\n{3,}/g, '\n\n');

// --- api/_essay-static.js ---
const moduleSource = `// GENERATED FILE - do not edit by hand.
// Regenerate with: node scripts/generate-essay-static.mjs
export const essayArticleHtml = ${JSON.stringify(html)};
`;
writeFileSync(new URL('../api/_essay-static.js', import.meta.url), moduleSource);

// --- public/essays/gpt7-will-have-arms.md ---
const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', hr: '---' });
td.use(turndownPluginGfm.gfm);
let md = td.turndown(html);
md = md.replace(/\n{3,}/g, '\n\n');

const frontMatter = `---
title: "GPT-7 Will Have Arms"
subtitle: "The Coming Convergence of Foundation Models and Robotics"
author: San Kala
date: 2025-12
canonical: ${SITE}/essays/gpt7-will-have-arms
---

# GPT-7 Will Have Arms

**The Coming Convergence of Foundation Models and Robotics**

*& Why the Scaling Believers Should Apply Their Own Logic to Robotics*

*By [San Kala](${SITE}) - December 2025. This is the plain-text mirror; the [interactive version](${SITE}/essays/gpt7-will-have-arms) has charts and sidebars.*

---

`;
writeFileSync(new URL('../public/essays/gpt7-will-have-arms.md', import.meta.url), frontMatter + md + '\n');

console.log(`OK - article HTML: ${html.length} chars, markdown: ${md.length} chars`);
