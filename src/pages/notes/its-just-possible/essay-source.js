// "It's just possible": the essay text lives in essay.md beside this file, with a small front
// matter (title, subtitle, author, date). Edit the words there; the page, its Markdown mirror
// (public/notes/its-just-possible.md) and the crawler edition
// (server/essay-previews/generated/its-just-possible.js) are all made from it.
// After editing, run: npm run generate:essay-static -- its-just-possible
export const SLUG = 'its-just-possible';
export const PATH = `/notes/${SLUG}`;
export const READ_TIME = '8 min read';
export const SOCIAL_IMAGE = `/images/covers/${SLUG}-social.jpg`;
export const PUBLISHED = '2026-10';

// Front matter is plain `key: value` lines between two `---` lines; the rest is the essay body.
export function parseEssay(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text.replace(/\r\n/g, '\n'));
  if (!match) throw new Error('essay.md needs its front matter (title, subtitle, author, date)');
  const meta = Object.fromEntries(match[1].split('\n').map(line => /^(\w+):\s*(.*)$/.exec(line)).filter(Boolean).map(m => [m[1], m[2].trim()]));
  return { meta, body: text.replace(/\r\n/g, '\n').slice(match[0].length).trim() };
}

// The page sets the essay as a run of pieces: Markdown, quoted messages and prompts (from the
// blockquotes) and the flight figure, which closes the section "The weekend".
export const FIGURE_AFTER = 'The weekend';
const MESSAGE = /^\*\*(Agent|Me):\*\*\s*/, NOTE = /^\*\*([^*]+?)\.\*\*\s*/;
export function essayPieces(body) {
  const lines = body.split('\n'), pieces = [];
  let md = [], quote = null, inFigureSection = false, figureDone = false;
  const flushMd = () => { const text = md.join('\n').trim(); if (text) pieces.push({ type: 'md', text }); md = []; };
  const flushQuote = () => { if (quote) pieces.push(classify(quote.join('\n').trim(), pieces)); quote = null; };
  for (const line of lines) {
    if (line.startsWith('>')) { if (!quote) { flushMd(); quote = []; } quote.push(line.replace(/^> ?/, '')); continue; }
    flushQuote();
    if (/^## /.test(line)) {
      if (inFigureSection && !figureDone) { flushMd(); pieces.push({ type: 'figure' }); figureDone = true; }
      inFigureSection = line.slice(3).trim() === FIGURE_AFTER;
    }
    md.push(line);
  }
  flushQuote(); flushMd();
  if (inFigureSection && !figureDone) pieces.push({ type: 'figure' });
  // number the messages through the essay, like a chat log
  let n = 0; for (const p of pieces) if (p.type === 'chat') for (const m of p.messages) m.n = ++n;
  return pieces;
}
function classify(text, before) {
  const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paras.every(p => MESSAGE.test(p))) return { type: 'chat', messages: paras.map(p => ({ sender: MESSAGE.exec(p)[1], text: p.replace(MESSAGE, '') })) };
  if (paras.every(p => NOTE.test(p))) return { type: 'notes', notes: paras.map(p => ({ title: NOTE.exec(p)[1], text: p.replace(NOTE, '') })) };
  // a prompt is named by the bold words of the paragraph that introduces it
  const lead = ([...before].reverse().find(p => p.type === 'md')?.text.split('\n\n').pop() || '').match(/^\*\*([^*]+)\*\*/)?.[1] || '';
  const [label, to] = /CLAUDE\.md|instructions/i.test(lead) ? ['CLAUDE.md', 'at the top of the file'] : /skill/i.test(lead) ? ['Skill', 'written by Claude'] : /goal/i.test(lead) ? ['Standing goal', 'to Claude Code'] : ['Prompt', 'to Claude Code'];
  return { type: 'prompt', label, to, text: paras.join('\n\n') };
}

// For the section markers: how far through the essay each section starts, and the reading
// time left from there (at 230 words a minute).
export function sectionLegs(body) {
  const words = s => (s.match(/[\w’'#.$,-]+/g) || []).length;
  const total = words(body), heads = [...body.matchAll(/^## (.+)$/gm)];
  return Object.fromEntries(heads.map(h => { const before = words(body.slice(0, h.index)); return [h[1].trim(), { at: before / total, minutes: Math.max(1, Math.ceil((total - before) / 230)) }]; }));
}
