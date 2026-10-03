import { Link } from 'react-router-dom';

export function Arrow() { return <span aria-hidden="true">↗</span>; }
export function SiteLink({ href, children, ...props }) {
  return href.startsWith('/') && !/\.[a-z0-9]+(?:$|\?)/i.test(href)
    ? <Link to={href} {...props}>{children}</Link>
    : <a href={href} {...props}>{children}</a>;
}
export function Action({ href, children, quiet = false }) {
  return <SiteLink className={`action${quiet ? ' quiet' : ''}`} href={href}>{children} <span aria-hidden="true">{href.startsWith('/') && !href.endsWith('.pdf') ? '→' : '↗'}</span></SiteLink>;
}
export function CareerPath() {
  return <section className="journey" id="timeline" aria-labelledby="journey-title"><div className="journey-label"><h2 id="journey-title">Background</h2><Link to="/history">Career & history →</Link></div><ol>
    <li><span>2015–19</span><strong>NIT Karnataka</strong><small>Electrical engineering</small></li>
    <li><span>2019–22</span><strong>Texas Instruments</strong><small>Chip design</small></li>
    <li><span>2022–24</span><strong>UC San Diego</strong><small>MS, computer science</small></li>
    <li><span>2024–now</span><strong>eBay</strong><small>Applied AI research</small></li>
  </ol></section>;
}
