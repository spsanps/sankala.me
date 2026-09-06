import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { works } from '../../src/data/work.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const dist = resolve(root, 'dist');
const shell = await readFile(resolve(dist, 'index.html'), 'utf8');
await writeFile(resolve(dist, 'app.html'), shell);
const template = shell.replace(/<title\b[^>]*>[\s\S]*?<\/title>/g, '').replace(/<meta[^>]+(?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g, '');
const paths = ['/', '/notes', '/history', '/research', '/about', '/resume', '/lab', '/notes/startr-postmortem', '/404'];
const server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', ssr: { noExternal: ['react-helmet-async'], resolve: { externalConditions: ['module-sync'] } } });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
  for (const path of paths) {
    const { html, head } = await render('https://www.sankala.me' + path);
    const output = path === '/404' ? resolve(dist, '404.html') : resolve(dist, '.' + path, 'index.html');
    await mkdir(resolve(output, '..'), { recursive: true });
    await writeFile(output, template.replace('</head>', head + '\n</head>').replace('<div id="root"></div>', () => `<div id="root">${html}</div>`));
  }
} finally { await server.close(); }
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const url = w => w.url.startsWith('/') ? 'https://www.sankala.me' + w.url : w.url;
const feed = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>San Kala — work &amp; ideas</title><link>https://www.sankala.me/</link><description>Research, writing, films, and experiments.</description><language>en</language><atom:link href="https://www.sankala.me/feed.xml" rel="self" type="application/rss+xml"/>${works.map(w => `<item><title>${esc(w.title)}</title><link>${esc(url(w))}</link><guid isPermaLink="true">${esc(url(w))}</guid><description>${esc(w.description)}</description></item>`).join('')}</channel></rss>`;
await writeFile(resolve(dist,'feed.xml'),feed);
const sitemapPaths = [...paths.filter(p => p !== '/404'), '/essays/gpt7-will-have-arms', '/notes/eai-challenge', '/toys/bee-sim/index.html'];
await writeFile(resolve(dist,'sitemap.xml'),`<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPaths.map(path => `<url><loc>https://www.sankala.me${path}</loc></url>`).join('')}</urlset>`);
console.log(`Prerendered ${paths.length} pages, RSS, and sitemap.`);
