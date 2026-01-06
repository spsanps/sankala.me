export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Check if crawler
  const isCrawler = /facebookexternalhit|Facebot|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot|Googlebot|bingbot|Applebot|Pinterest|Embedly|quora|outbrain|vkShare|redditbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|ia_archiver/i.test(userAgent);

  if (isCrawler) {
    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title>GPT-7 Will Have Arms — San Kala</title>
  <meta name="description" content="Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.">
  <meta property="og:type" content="article">
  <meta property="og:title" content="GPT-7 Will Have Arms">
  <meta property="og:description" content="Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.">
  <meta property="og:image" content="https://sankala.me/essays/gpt7/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://sankala.me/essays/gpt7-will-have-arms">
  <meta property="og:site_name" content="San Kala">
  <meta property="article:author" content="San Kala">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="GPT-7 Will Have Arms">
  <meta name="twitter:description" content="Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.">
  <meta name="twitter:image" content="https://sankala.me/essays/gpt7/og-image.jpg">
</head>
<body>
  <h1>GPT-7 Will Have Arms</h1>
  <p>Situational Awareness for robotics.</p>
  <a href="https://sankala.me/essays/gpt7-will-have-arms">Read the full essay</a>
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
