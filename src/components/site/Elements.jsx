import { Link } from 'react-router-dom';
import { topics, formatNames } from '../../data/work';

export function Arrow() { return <span aria-hidden="true">↗</span>; }
export function SiteLink({ href, children, ...props }) {
  return href.startsWith('/') && !/\.[a-z0-9]+(?:$|\?)/i.test(href)
    ? <Link to={href} {...props}>{children}</Link>
    : <a href={href} {...props}>{children}</a>;
}
export function Action({ href, children, quiet = false }) {
  return <SiteLink className={`action${quiet ? ' quiet' : ''}`} href={href}>{children} <span aria-hidden="true">{href.startsWith('/') && !href.endsWith('.pdf') ? '→' : '↗'}</span></SiteLink>;
}
export function WorkRow({ work }) {
  return <article className="work-row" data-work data-slug={work.slug}>
    <div className="work-date">{work.date}</div><div><div className="work-meta">{work.topics.map(id => topics.find(t => t.id === id).name).join(' · ')}</div>
    <h3><SiteLink href={work.url}>{work.displayTitle} <Arrow /></SiteLink></h3><span className="original-work-title">{work.title}</span><p>{work.description}</p>
    <div className="formats">{work.formats.map(f => <span key={f}>{formatNames[f]}</span>)}</div>
    {work.formats.includes('film') && <a className="text-link" href={work.filmUrl || "https://www.youtube.com/watch?v=kzvqj4jurW0"}>Watch the Paper Robots film <Arrow /></a>}
    </div></article>;
}
export function CareerPath() {
  return <section className="journey" id="timeline" aria-labelledby="journey-title"><div className="journey-label"><h2 id="journey-title">Background</h2><Link to="/history">Career & history →</Link></div><ol>
    <li><span>2019</span><strong>NIT Karnataka</strong><small>Electrical engineering</small></li>
    <li><span>2019–22</span><strong>Texas Instruments</strong><small>Chip design</small></li>
    <li><span>2022–24</span><strong>UC San Diego</strong><small>MS, computer science</small></li>
    <li><span>2024–now</span><strong>eBay</strong><small>Applied AI research</small></li>
  </ol></section>;
}
