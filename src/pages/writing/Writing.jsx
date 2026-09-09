import { Link } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import { SiteLink } from '../../components/site/Elements';
import { notesData } from '../../data/site-content';
import { works } from '../../data/work';

export default function Writing() {
  const writing = works.filter(work => work.formats.includes('writing'));
  return <main id="main" className="shell"><Metadata title="Writing — San Kala" description="Essays on AI and robotics, research write-ups, and notes on building a startup. Writing by San Kala." path="/writing" />
    <header className="page-heading"><h1>Writing</h1><p>AI, robotics, and what I’ve learned from building things.</p></header>
    <div className="writing-list">{writing.map(work => {
      const note = notesData.find(note => note.slug === work.slug);
      return <article className="writing-entry" key={work.slug} data-writing>
        <div className="writing-date">{work.date}<span>{note.readTime}</span></div>
        <div><h2><SiteLink href={work.url}>{work.title}</SiteLink></h2><p>{work.description}</p><div className="inline-links"><SiteLink className="text-link" href={work.url}>Read {work.slug === 'eai-challenge' ? 'the write-up' : 'the essay'} <span aria-hidden="true">→</span></SiteLink>{work.formats.includes('film') && <a className="text-link" href="https://www.youtube.com/watch?v=kzvqj4jurW0">Watch the animated film <span aria-hidden="true">↗</span></a>}</div></div>
      </article>;
    })}</div>
    <aside className="index-footer"><p>Looking for papers or something to try?</p><div className="inline-links"><Link to="/research">Research papers →</Link><Link to="/projects">Interactive projects →</Link><Link to="/notes">All work & search →</Link><a href="/feed.xml">Subscribe via RSS</a></div></aside>
  </main>;
}
