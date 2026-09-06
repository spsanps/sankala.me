import { Link } from 'react-router-dom';
import { topics, works, formatNames } from '../../data/work';

export function Arrow() { return <span aria-hidden="true">↗</span>; }
export function SiteLink({ href, children, ...props }) {
  return href.startsWith('/') && !/\.[a-z0-9]+(?:$|\?)/i.test(href)
    ? <Link to={href} {...props}>{children}</Link>
    : <a href={href} {...props}>{children}</a>;
}
export function Action({ href, children, quiet = false }) {
  return <SiteLink className={`action${quiet ? ' quiet' : ''}`} href={href}>{children} <Arrow /></SiteLink>;
}
export function TopicFolders() {
  return <div className="topic-folders">{topics.map(t => <Link key={t.id} className={`topic-folder topic-${t.id}`} to={`/notes?topic=${t.id}`}>
    <span className="tab">{t.number} / {works.filter(w => w.topics.includes(t.id)).length} pieces</span>
    <h3>{t.name}</h3><p>{t.description}</p><span className="examples">{t.examples}</span><span className="folder-arrow" aria-hidden="true">↗</span>
  </Link>)}</div>;
}
export function WorkRow({ work }) {
  return <article className="work-row" data-work data-slug={work.slug}>
    <div className="work-date">{work.date}</div><div><div className="work-meta">{work.topics.map(id => topics.find(t => t.id === id).name).join(' · ')}</div>
    <h3><SiteLink href={work.url}>{work.title} <Arrow /></SiteLink></h3><p>{work.description}</p>
    <div className="formats">{work.formats.map(f => <span key={f}>{formatNames[f]}</span>)}</div>
    {work.formats.includes('film') && <a className="text-link" href="https://www.youtube.com/watch?v=kzvqj4jurW0">Watch the Paper Robots film <Arrow /></a>}
    </div></article>;
}
export function CareerPath() {
  return <section className="journey" id="timeline" aria-labelledby="journey-title"><div className="journey-label"><span className="eyebrow">The short version</span><h2 id="journey-title">How I got here</h2><Link to="/history">The full history <Arrow /></Link></div><ol>
    <li><span>2019</span><strong>NIT Karnataka</strong><small>Electrical engineering</small></li>
    <li><span>2019–22</span><strong>Texas Instruments</strong><small>Chip design</small></li>
    <li><span>2022–24</span><strong>UC San Diego</strong><small>MS, computer science</small></li>
    <li><span>2024–now</span><strong>eBay</strong><small>Applied AI research</small></li>
  </ol></section>;
}
