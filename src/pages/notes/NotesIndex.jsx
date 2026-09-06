import { Link, useSearchParams } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import { Arrow, WorkRow } from '../../components/site/Elements';
import { works, topics, formatNames } from '../../data/work';

export default function NotesIndex() {
  const [params, setParams] = useSearchParams();
  const topic = topics.some(t => t.id === params.get('topic')) ? params.get('topic') : 'all';
  const format = formatNames[params.get('format')] ? params.get('format') : 'all';
  const query = params.get('q') || '';
  const matching = works.filter(w => (topic === 'all' || w.topics.includes(topic)) && (format === 'all' || w.formats.includes(format)) && [w.title, w.description, ...w.topics.map(id => topics.find(t => t.id === id).name)].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  function change(key, value) {
    const next = new URLSearchParams(params);
    if(value === 'all' || !value) next.delete(key); else next.set(key, value);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  function reset() { setParams({}, { replace: true, preventScrollReset: true }); }
  return <main id="main" className="shell">
    <Metadata title="Work & ideas — San Kala" description="The complete index of San Kala’s research, essays, films, and interactive experiments. Browse AI and robotics, simulated worlds, and reflections on building." path="/notes" />
    <header className="page-heading"><span className="eyebrow">San Kala / Work & ideas</span><h1>A place for<br /><em>all the threads.</em></h1><p>Research, essays, films, and small worlds. Browse by what they’re about, or choose the kind of work you want to see.</p></header>
    <div className="library-tools"><form id="library-filters" role="search" onSubmit={e => e.preventDefault()} onReset={reset}>
      <label>Subject<select name="topic" value={topic} onChange={e => change('topic', e.target.value)}><option value="all">All subjects</option>{topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label>Format<select name="format" value={format} onChange={e => change('format', e.target.value)}><option value="all">All formats</option>{Object.entries(formatNames).map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label className="search-field">Search<input type="search" name="q" value={query} onChange={e => change('q', e.target.value)} placeholder="A title, a question, a project…" /></label><button type="reset">Reset</button>
    </form></div>
    <div className="library-count"><p role="status" aria-live="polite">{matching.length} {matching.length === 1 ? 'piece' : 'pieces'}</p><span>Some work belongs to more than one subject.</span></div>
    <div className="work-list">{matching.map(work => <WorkRow key={work.slug} work={work} />)}</div>
    {!matching.length && <div className="empty-state"><h2>No matches here.</h2><p>Try another subject, format, or search term.</p><button type="button" onClick={reset}>Show all work</button></div>}
    <aside className="archive-note"><h2>One body of work, a few different homes.</h2><p>This is my complete index. Some pieces also belong to <a href="https://paperrobots.studio/">Paper Robots</a>; the space experiments live at <a href="https://dysonswarm.com/">Dyson Swarm</a>. Each entry takes you to the work itself.</p><Link to="/resume">Full publication details and CV <Arrow /></Link></aside>
  </main>;
}
