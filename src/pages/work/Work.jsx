import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import { SiteLink } from '../../components/site/Elements';
import Cover from '../../components/art/covers/Cover';
import { works, topics } from '../../data/work';
import { notesData } from '../../data/site-content';
import { publications } from '../../data/profile';
import '../../styles/covers.css';
import '../../styles/work.css';

// One index for everything: essays, research, projects and films, each with its code-drawn
// cover. The old Writing, Projects, Research and All work pages render this same page, filtered.
const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'writing', label: 'Writing', test: work => work.formats.includes('writing') },
  { id: 'projects', label: 'Projects', test: work => work.formats.includes('experiment') },
  { id: 'research', label: 'Research', test: work => work.formats.includes('research') },
  { id: 'films', label: 'Films', test: work => work.formats.includes('film') },
];
const filterIds = FILTERS.map(filter => filter.id);
// Links from the old archive used ?format=…
const legacyFormats = { writing: 'writing', experiment: 'projects', research: 'research', film: 'films' };
const kindNames = { writing: 'Writing', experiment: 'Project', research: 'Research', film: 'Film' };

// The papers behind three of the works; their venue, authors and links stay on the page.
const paperFor = { 'eai-challenge': 'embodied-agents', zinify: 'zinify', 'power-quality': 'power-quality' };
const projectActions = {
  'another-sky': 'Explore the space habitat',
  'a-clauiet-life': 'Open the bee simulation',
  'dyson-swarm': 'Run the solar-collector simulation',
};

const items = works.map(work => {
  const paper = publications.find(p => p.id === paperFor[work.slug]);
  const note = notesData.find(n => n.slug === work.slug);
  // Research-only works have no page of their own (their URL is an anchor on this page); their details are here.
  const href = /^\/(work|research)#/.test(work.url) ? null : work.url;
  const actions = [];
  if (work.formats.includes('writing')) actions.push([work.url, work.slug === 'eai-challenge' ? 'Read the write-up' : work.formatLabel === 'Poem' ? 'Read the poem' : 'Read the essay']);
  if (work.formats.includes('experiment')) actions.push([work.url, projectActions[work.slug] || 'Open the project']);
  if (work.formats.includes('film')) {
    if (work.filmUrl) actions.push([work.filmUrl, 'Watch the film'], [work.url, 'On Paper Robots']);
    else actions.push(['https://www.youtube.com/watch?v=kzvqj4jurW0', 'Watch the animated film']);
  }
  for (const [linkHref, label] of paper?.links || []) if (!actions.some(([h]) => h === linkHref)) actions.push([linkHref, label]);
  const search = [work.title, work.displayTitle, work.description, ...work.topics.map(id => topics.find(t => t.id === id)?.name), paper?.title, paper?.authors, paper?.venue, paper?.note].filter(Boolean).join(' ').toLowerCase();
  return { ...work, paper, href, actions, search, readTime: /min read/.test(note?.readTime || '') ? note.readTime : null, kinds: work.formatLabel || work.formats.map(f => kindNames[f]).join(' · ') };
});

export default function Work({ preset = 'all' }) {
  const [params, setParams] = useSearchParams();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const legacy = legacyFormats[params.get('format')];
  const type = filterIds.includes(params.get('type')) ? params.get('type') : legacy || preset;
  const query = params.get('q') || '';
  const filter = FILTERS.find(f => f.id === type);
  const visible = useMemo(() => items.filter(item => filter.test(item) && item.search.includes(query.trim().toLowerCase())), [filter, query]);

  // A bare #writing, #projects, #research or #films in a link selects that filter.
  useEffect(() => {
    const token = hash.slice(1);
    if (token !== 'all' && filterIds.includes(token)) navigate({ pathname, search: `?type=${token}` }, { replace: true, preventScrollReset: true });
  }, [hash, pathname, navigate]);

  function update(changes) {
    const next = new URLSearchParams(params);
    next.delete('format'); next.delete('topic');
    for (const [key, value] of Object.entries(changes)) {
      if (key === 'type' && value === preset) next.delete('type');
      else if (value) next.set(key, value); else next.delete(key);
    }
    setParams(next, { replace: true, preventScrollReset: true });
  }

  const title = type === 'all' ? 'Writing & projects — San Kala' : `${filter.label} — San Kala`;
  return <main id="main" className="shell work-page">
    <Metadata title={title} description="Essays, research, projects and films by San Kala, newest first: AI and robotics, simulated worlds, and notes on building things." path="/work" />
    <header className="page-heading"><h1>Writing & projects</h1><p>Essays, research, projects and films, newest first. Each one has its own cover, drawn in code.</p><p className="work-why">AI has opened a new medium, and this is me exploring it. Each piece here, from the covers drawn in code to the worlds you can walk around in, tries something new with it.</p></header>

    <div className="work-tools">
      <div className="work-chips" role="group" aria-label="Show">
        {FILTERS.map(f => <button key={f.id} type="button" className="work-chip" aria-pressed={type === f.id} onClick={() => update({ type: f.id })}>
          {f.label}<small>{items.filter(f.test).length}</small>
        </button>)}
      </div>
      <form className="work-search" role="search" onSubmit={event => event.preventDefault()}>
        <label htmlFor="work-search-input" className="visually-hidden">Search the work</label>
        <input id="work-search-input" type="search" value={query} onChange={event => update({ q: event.target.value })} placeholder="Search" />
      </form>
    </div>
    <p className="work-count" role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'piece' : 'pieces'}{query && <> matching “{query}”</>}</p>

    {visible.length > 0 && <ol className="cover-shelf work-shelf">{visible.map((item, index) => <li className="shelf-piece work-piece" key={item.slug} id={item.slug} data-work data-slug={item.slug}>
      {item.paper && item.paper.id !== item.slug && <span id={item.paper.id} className="work-anchor" aria-hidden="true" />}
      {item.href
        ? <SiteLink className="shelf-cover" href={item.href} tabIndex={-1} aria-hidden="true"><Cover slug={item.slug} title={item.title} priority={index < 5} sizes="(max-width: 600px) 45vw, 200px" /></SiteLink>
        : <div className="shelf-cover"><Cover slug={item.slug} title={item.title} priority={index < 5} sizes="(max-width: 600px) 45vw, 200px" /></div>}
      <div className="shelf-text">
        <p className="shelf-meta">{item.kinds} · {item.date}{item.readTime && <> · {item.readTime}</>}</p>
        <h2>{item.href ? <SiteLink href={item.href}>{item.displayTitle}</SiteLink> : item.displayTitle}</h2>
        <span className="original-work-title">{item.title}</span>
        <p>{item.description}</p>
        {item.paper && <details className="work-paper">
          <summary>Paper details</summary>
          <p className="work-paper-title">{item.paper.title}</p>
          <p>{item.paper.authors}</p>
          <p>{item.paper.venue}{item.paper.note && <> · {item.paper.note}</>}</p>
        </details>}
        <div className="inline-links">{item.actions.map(([href, label]) => <SiteLink key={href} className="text-link" href={href}>{label} <span aria-hidden="true">{href.startsWith('/') && !href.endsWith('.pdf') ? '→' : '↗'}</span></SiteLink>)}</div>
      </div>
    </li>)}</ol>}

    {!visible.length && <div className="work-empty"><h2>Nothing matches “{query}”.</h2><p>Try another word, or show everything.</p><button type="button" onClick={() => update({ q: '', type: 'all' })}>Show all work</button></div>}

    <aside className="index-footer"><p>Some of this also lives elsewhere: films at <a href="https://www.paperrobots.studio/">Paper Robots</a>, space experiments at <a href="https://dysonswarm.com/">Dyson Swarm</a>. Full publication details are in the <SiteLink href="/resume">CV</SiteLink>. You can also <a href="/feed.xml">follow by RSS</a>.</p></aside>
  </main>;
}
