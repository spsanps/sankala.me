import { Link } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import { SiteLink } from '../../components/site/Elements';
import Cover from '../../components/art/covers/Cover';
import { notesData } from '../../data/site-content';
import { works } from '../../data/work';
import '../../styles/covers.css';

// The writing index as a shelf: every essay and note has its own code-drawn cover;
// the container around them stays quiet and never changes.
const pieces = works.filter(work => work.formats.includes('writing')).map(work => ({ ...work, readTime: notesData.find(note => note.slug === work.slug)?.readTime }));

export default function Writing() {
  return <main id="main" className="shell"><Metadata title="Writing — San Kala" description="Essays on AI and robotics, research write-ups, and notes on building a startup. Writing by San Kala." path="/writing" />
    <header className="page-heading"><h1>Writing</h1><p>AI, robotics, and what I’ve learned from building things.</p></header>
    <ol className="cover-shelf">{pieces.map((work, index) => <li className="shelf-piece" key={work.slug} data-writing>
      <SiteLink className="shelf-cover" href={work.url}><Cover slug={work.slug} title={work.title} priority={index < 3} sizes="(max-width: 600px) 44vw, (max-width: 900px) 40vw, 300px" /></SiteLink>
      <div className="shelf-text">
        <p className="shelf-meta">{work.date}{work.readTime && <> · {work.readTime}</>}</p>
        <h2><SiteLink href={work.url}>{work.displayTitle}</SiteLink></h2>
        <span className="original-work-title">{work.title}</span>
        <p>{work.description}</p>
        <div className="inline-links"><SiteLink className="text-link" href={work.url}>Read {work.slug === 'eai-challenge' ? 'the write-up' : 'the essay'} <span aria-hidden="true">→</span></SiteLink>{work.formats.includes('film') && <a className="text-link" href="https://www.youtube.com/watch?v=kzvqj4jurW0">Watch the animated film <span aria-hidden="true">↗</span></a>}</div>
      </div>
    </li>)}</ol>
    <aside className="index-footer"><p>Looking for papers or something to try?</p><div className="inline-links"><Link to="/research">Research papers →</Link><Link to="/projects">Interactive projects →</Link><Link to="/notes">All work & search →</Link><a href="/feed.xml">Subscribe via RSS</a></div></aside>
  </main>;
}
