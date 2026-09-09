import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { Arrow } from '../components/site/Elements';
import { paperRobotsUrl } from '../data/links';
import '../styles/personal.css';
import '../styles/personal-pages.css';

const links = [['/writing', 'Writing'], ['/projects', 'Projects'], ['/research', 'Research'], ['/history', 'History'], ['/about', 'About'], ['/resume', 'CV']];
export default function PersonalLayout() {
  return <div className="personal-site">
    <a className="skip" href="#main">Skip to content</a>
    <header className="site-header shell"><Link className="wordmark" to="/">San Kala<span className="wordmark-dot">.</span></Link>
      <nav className="desktop-nav" aria-label="Main">{links.map(([to,label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
    </header><Outlet />
    <footer className="site-footer shell"><div><strong>San Kala</strong><p>AI researcher, writer & builder.</p><div className="inline-links"><Link to="/notes">All work & search</Link><Link to="/history">Career & history</Link></div></div>
      <nav aria-label="Footer"><a href="mailto:san@sankala.me">Email <Arrow /></a><a href="https://github.com/spsanps">GitHub <Arrow /></a><a href="https://linkedin.com/in/sanjayanps">LinkedIn <Arrow /></a><a href="https://kaggle.com/spsanps">Kaggle <Arrow /></a><a href="/documents/resume.pdf">CV PDF <Arrow /></a><a href="/feed.xml">RSS <Arrow /></a></nav>
      <small><a href={paperRobotsUrl}>Films & essays: Paper Robots</a> · <a href="https://dysonswarm.com/">Space projects: Dyson Swarm</a></small>
    </footer><ScrollRestoration />
  </div>;
}
