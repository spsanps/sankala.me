import { Navigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notesData } from '../../data/site-content';
import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import LLMActions from '../../components/writing/LLMActions';
import NotFound from '../not-found/NotFound';
import { coverSocialImage, hasCover } from '../../components/art/covers/registry';
import Cover from '../../components/art/covers/Cover';
import GlypGame, { GAME_BEFORE } from './startr-postmortem/GlypGame';
import '../../styles/site-pages.css';

// Essays whose hand-made figure sits inside the Markdown text, just before a given paragraph.
const FIGURES = { 'startr-postmortem': { before: GAME_BEFORE, Figure: GlypGame } };

// The work's cover, small beside the title: the text stays the hero.
const Frontispiece = ({ entry }) => hasCover(entry.slug) ? <div className="frontispiece"><Cover slug={entry.slug} title={entry.title} priority sizes="(max-width: 760px) 120px, 200px" /></div> : null;

export default function NoteEntry() {
  const { slug } = useParams();
  const entry = notesData.find(n => n.slug === slug || String(n.id) === slug);
  if(!entry) return <NotFound />;
  if(entry.essayRoute) return <Navigate to={entry.essayRoute} replace />;
  const image = coverSocialImage(entry.slug) || undefined;
  if(entry.externalUrl) return <main id="main" className="shell"><Metadata title={entry.title + ' — San Kala'} description={entry.excerpt} path={'/notes/' + entry.slug} image={image} /><header className="page-heading has-frontispiece"><div><span className="eyebrow">An interactive experiment</span><h1>{entry.title}</h1><p>{entry.excerpt}</p><div className="actions"><Action href={entry.externalUrl}>Open the experiment</Action></div></div><Frontispiece entry={entry} /></header></main>;
  if(slug !== entry.slug) return <Navigate to={'/notes/' + entry.slug} replace />;
  const content = (entry.content || '').replace(/^\s*# [^\n]+\n/, '');
  const inset = FIGURES[entry.slug], cut = inset ? content.indexOf('\n' + inset.before) : -1;
  const after = <><div className="actions"><Action href="/work?type=writing">More writing</Action></div><LLMActions getMarkdown={() => entry.content} className="mt-8" /></>;
  return <main id="main" className="shell">
    <Metadata title={entry.title + ' — San Kala'} description={entry.excerpt} path={'/notes/' + entry.slug} type="article" image={image} />
    <header className="page-heading note-heading has-frontispiece"><div><span className="eyebrow">Personal note · {entry.date} · {entry.readTime}</span><h1>{entry.title}</h1><p>{entry.excerpt}</p></div><Frontispiece entry={entry} /></header>
    {inset && cut > 0
      ? <article className="essay-body">
        <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content.slice(0, cut)}</ReactMarkdown></div>
        <inset.Figure />
        <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content.slice(cut)}</ReactMarkdown>{after}</div>
      </article>
      : <article className="prose note-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>{after}</article>}
  </main>;
}
