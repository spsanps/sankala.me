import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Arrow } from '../components/site/Elements';
import { paperRobotsUrl } from '../data/links';
import { mainNav, isWorkPath } from '../data/navigation';
import '../styles/personal.css';
import '../styles/personal-pages.css';

export default function PersonalLayout() {
  const { pathname } = useLocation();
  const home = pathname === '/';
  return <div className={`personal-site${home ? ' home-page' : ''}`}>
    <a className="skip" href="#main">Skip to content</a>
    {/* The homepage sets its nav into the mosaic wall and ends in a mosaic footer (pages/home). */}
    {!home && <header className="site-header shell"><Link className="wordmark" to="/">San Kala<span className="wordmark-dot">.</span></Link>
      <nav className="desktop-nav" aria-label="Main">{mainNav.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => (isActive || (to === '/work' && isWorkPath(pathname)) ? 'active' : undefined)}>{label}</NavLink>)}</nav>
    </header>}<Outlet />
    {!home && <footer className="site-footer shell"><div><strong>San Kala</strong><p>AI researcher and builder.</p><div className="inline-links"><Link to="/work">Writing & projects</Link><Link to="/history">Timeline</Link></div></div>
      <nav aria-label="Footer"><a href="mailto:san@sankala.me">Email <Arrow /></a><a href="https://github.com/spsanps">GitHub <Arrow /></a><a href="https://linkedin.com/in/sanjayanps">LinkedIn <Arrow /></a><a href="https://kaggle.com/spsanps">Kaggle <Arrow /></a><a href="/documents/resume.pdf">CV PDF <Arrow /></a><a href="/feed.xml">RSS <Arrow /></a></nav>
      <small><a href={paperRobotsUrl}>Films & essays: Paper Robots</a> · <a href="https://dysonswarm.com/">Space projects: Dyson Swarm</a></small>
    </footer>}<ScrollRestoration />
  </div>;
}
