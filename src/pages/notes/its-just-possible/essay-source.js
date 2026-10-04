// "It's just possible": the essay text lives in essay.md beside this file, with a small front
// matter (title, subtitle, author, date). Edit the words there; the page, its Markdown mirror
// (public/notes/its-just-possible.md) and the crawler edition
// (server/essay-previews/generated/its-just-possible.js) are all made from it.
// After editing, run: npm run generate:essay-static -- its-just-possible
export const SLUG = 'its-just-possible';
export const PATH = `/notes/${SLUG}`;
export const READ_TIME = '12 min read';
export const SOCIAL_IMAGE = `/images/covers/${SLUG}-social.jpg`;
export const PUBLISHED = '2026-10';

// Front matter is plain `key: value` lines between two `---` lines; the rest is the essay body.
export function parseEssay(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text.replace(/\r\n/g, '\n'));
  if (!match) throw new Error('essay.md needs its front matter (title, subtitle, author, date)');
  const meta = Object.fromEntries(match[1].split('\n').map(line => /^(\w+):\s*(.*)$/.exec(line)).filter(Boolean).map(m => [m[1], m[2].trim()]));
  return { meta, body: text.replace(/\r\n/g, '\n').slice(match[0].length).trim() };
}
