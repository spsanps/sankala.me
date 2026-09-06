import { Navigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notesData } from '../../data/site-content';
import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import LLMActions from '../../components/writing/LLMActions';
import NotFound from '../not-found/NotFound';

export default function NoteEntry() {
  const { slug } = useParams();
  const entry = notesData.find(n => n.slug === slug || String(n.id) === slug);
  if(!entry) return <NotFound />;
  if(entry.essayRoute) return <Navigate to={entry.essayRoute} replace />;
  if(entry.externalUrl) return <main id="main" className="shell"><Metadata title={entry.title + ' — San Kala'} description={entry.excerpt} path={'/notes/' + entry.slug} /><header className="page-heading"><span className="eyebrow">An interactive experiment</span><h1>{entry.title}</h1><p>{entry.excerpt}</p><div className="actions"><Action href={entry.externalUrl}>Open the experiment</Action></div></header></main>;
  if(slug !== entry.slug) return <Navigate to={'/notes/' + entry.slug} replace />;
  const content = (entry.content || '').replace(/^\s*# [^\n]+\n/, '');
  return <main id="main" className="shell">
    <Metadata title={entry.title + ' — San Kala'} description={entry.excerpt} path={'/notes/' + entry.slug} type="article" />
    <header className="page-heading note-heading"><span className="eyebrow">Personal note / {entry.date} · {entry.readTime}</span><h1>{entry.title}</h1><p>{entry.excerpt}</p><LLMActions getMarkdown={() => entry.content} className="mt-8" /></header>
    <article className="prose note-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown><div className="actions"><Action href="/notes">Back to the notebook</Action></div></article>
  </main>;
}
