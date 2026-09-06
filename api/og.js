import { essayArticleHtml } from '../server/essay-previews/generated/gpt7-will-have-arms.js';
import { eaiArticleHtml } from '../server/essay-previews/generated/eai-challenge.js';

export const config = {
  runtime: 'edge',
};

const SITE = 'https://www.sankala.me';

// Pages served as full static HTML to crawlers. vercel.json rewrites each
// page's URL to /api/og?page=<key>; browsers fall through to the SPA shell.
const PAGES = {
  gpt7: {
    url: `${SITE}/essays/gpt7-will-have-arms`,
    title: 'GPT-7 Will Have Arms',
    description: "A mini Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.",
    ogImage: `${SITE}/essays/gpt7/og-image.jpg`,
    alternativeHeadline: 'The Coming Convergence of Foundation Models and Robotics',
    datePublished: '2025-12',
    markdownUrl: `${SITE}/essays/gpt7-will-have-arms.md`,
    byline: 'By <a href="' + SITE + '">San Kala</a> · December 2025 · 28 min read',
    subtitleHtml: '<strong>The Coming Convergence of Foundation Models and Robotics</strong><br><em>&amp; Why the Scaling Believers Should Apply Their Own Logic to Robotics</em>',
    article: essayArticleHtml,
  },
  eai: {
    url: `${SITE}/notes/eai-challenge`,
    title: 'Winning by Overfitting',
    description: "How an LLM in a loop with a benchmark's own evaluator won the NeurIPS 2025 Embodied Agent Interface challenge — and why the recipe matters for robotics.",
    ogImage: `${SITE}/notes/eai/og-image.png`,
    alternativeHeadline: 'An LLM in a loop won the NeurIPS 2025 EAI Challenge',
    datePublished: '2026-07',
    markdownUrl: `${SITE}/notes/eai-challenge.md`,
    byline: 'By <a href="' + SITE + '">San Kala</a> &amp; Chin Pradeep · Team AxisTilted2 · July 2026 · 4 min read',
    subtitleHtml: '<strong>First place, NeurIPS 2025 Embodied Agent Interface Challenge</strong>',
    article: eaiArticleHtml,
  },
};

export default async function handler(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Check if crawler or bot (including link preview services and LLM fetchers)
  const isCrawler = /facebookexternalhit|Facebot|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot|Googlebot|bingbot|Applebot|Pinterest|Embedly|quora|outbrain|vkShare|redditbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|ia_archiver|bot|crawler|spider|preview|fetch|curl|wget|python|axios|node-fetch|got|request|http|scraper|OpenGraph/i.test(userAgent);

  if (isCrawler) {
    const page = PAGES[url.searchParams.get('page')] || PAGES.gpt7;

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title,
      alternativeHeadline: page.alternativeHeadline,
      description: page.description,
      image: page.ogImage,
      author: { '@type': 'Person', name: 'San Kala', url: SITE },
      datePublished: page.datePublished,
      mainEntityOfPage: page.url,
      isAccessibleForFree: true,
    });

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} — San Kala</title>
  <meta name="description" content="${page.description}">
  <link rel="canonical" href="${page.url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:image" content="${page.ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${page.url}">
  <meta property="og:site_name" content="San Kala">
  <meta property="article:author" content="San Kala">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="${page.ogImage}">
  <script type="application/ld+json">${jsonLd}</script>
  <style>
    body { max-width: 44rem; margin: 0 auto; padding: 2rem 1.25rem; font-family: Georgia, 'Times New Roman', serif; line-height: 1.65; color: #2A2A26; background: #F5F2EB; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
    th, td { border: 1px solid #C9C4B4; padding: 0.4rem 0.6rem; text-align: left; }
    a { color: #4A5D43; }
    hr { border: none; border-top: 1px solid #C9C4B4; margin: 2.5rem 0; }
    header p, footer p { color: #6B6B60; }
  </style>
</head>
<body>
  <header>
    <h1>${page.title}</h1>
    <p>${page.subtitleHtml}</p>
    <p>${page.byline} ·
    <a href="${page.url}">Interactive version</a> ·
    <a href="${page.markdownUrl}">Markdown version</a></p>
    <hr>
  </header>
  <article>
${page.article}
  </article>
  <footer>
    <hr>
    <p>Read the <a href="${page.url}">interactive version</a>,
    or the <a href="${page.markdownUrl}">plain markdown</a>.
    More at <a href="${SITE}">sankala.me</a>.</p>
  </footer>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // For regular users, fetch and return index.html (SPA shell)
  // Use the origin to fetch the static index.html
  const indexUrl = new URL('/index.html', url.origin);
  const indexResponse = await fetch(indexUrl.toString(), {
    headers: { 'x-skip-og': 'true' }
  });

  return new Response(indexResponse.body, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
