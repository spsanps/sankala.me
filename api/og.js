import { essayArticleHtml } from './_essay-static.js';

export const config = {
  runtime: 'edge',
};

const SITE = 'https://www.sankala.me';
const ESSAY_URL = `${SITE}/essays/gpt7-will-have-arms`;
const TITLE = 'GPT-7 Will Have Arms';
const DESCRIPTION = "A mini Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.";
const OG_IMAGE = `${SITE}/essays/gpt7/og-image.jpg`;

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  alternativeHeadline: 'The Coming Convergence of Foundation Models and Robotics',
  description: DESCRIPTION,
  image: OG_IMAGE,
  author: { '@type': 'Person', name: 'San Kala', url: SITE },
  datePublished: '2025-12',
  mainEntityOfPage: ESSAY_URL,
  isAccessibleForFree: true,
});

export default async function handler(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Check if crawler or bot (including link preview services and LLM fetchers)
  const isCrawler = /facebookexternalhit|Facebot|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot|Googlebot|bingbot|Applebot|Pinterest|Embedly|quora|outbrain|vkShare|redditbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|ia_archiver|bot|crawler|spider|preview|fetch|curl|wget|python|axios|node-fetch|got|request|http|scraper|OpenGraph/i.test(userAgent);

  if (isCrawler) {
    // Crawlers can't run the React app, so they get the same essay content as
    // static HTML (generated from the rendered page by scripts/generate-essay-static.mjs).
    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE} — San Kala</title>
  <meta name="description" content="${DESCRIPTION}">
  <link rel="canonical" href="${ESSAY_URL}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESCRIPTION}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${ESSAY_URL}">
  <meta property="og:site_name" content="San Kala">
  <meta property="article:author" content="San Kala">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESCRIPTION}">
  <meta name="twitter:image" content="${OG_IMAGE}">
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
    <h1>${TITLE}</h1>
    <p><strong>The Coming Convergence of Foundation Models and Robotics</strong><br>
    <em>&amp; Why the Scaling Believers Should Apply Their Own Logic to Robotics</em></p>
    <p>By <a href="${SITE}">San Kala</a> · December 2025 · 28 min read ·
    <a href="${ESSAY_URL}">Interactive version</a> ·
    <a href="${ESSAY_URL}.md">Markdown version</a></p>
    <hr>
  </header>
  <article>
${essayArticleHtml}
  </article>
  <footer>
    <hr>
    <p>Read the <a href="${ESSAY_URL}">interactive version</a> with charts and sidebars,
    or the <a href="${ESSAY_URL}.md">plain markdown</a>.
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
