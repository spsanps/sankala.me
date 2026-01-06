import { next } from '@vercel/edge';

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Check if crawler
  const isCrawler = /facebookexternalhit|Facebot|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot|Googlebot|bingbot/i.test(userAgent);

  // Only intercept essay page for crawlers
  if (url.pathname === '/essays/gpt7-will-have-arms' && isCrawler) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GPT-7 Will Have Arms — San Kala</title>
  <meta name="description" content="Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.">
  <meta property="og:type" content="article">
  <meta property="og:title" content="GPT-7 Will Have Arms">
  <meta property="og:description" content="Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.">
  <meta property="og:image" content="https://sankala.me/essays/gpt7/og-image.jpg">
  <meta property="og:url" content="https://sankala.me/essays/gpt7-will-have-arms">
  <meta property="og:site_name" content="San Kala">
  <meta property="article:author" content="San Kala">
  <meta property="article:published_time" content="2026-01-06">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="GPT-7 Will Have Arms">
  <meta name="twitter:description" content="Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after.">
  <meta name="twitter:image" content="https://sankala.me/essays/gpt7/og-image.jpg">
</head>
<body></body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return next();
}

export const config = {
  matcher: ['/essays/:path*'],
};
