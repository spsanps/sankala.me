import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Arrow } from '../components/site/Elements';
import '../styles/personal.css';
import '../styles/personal-pages.css';

const links = [['/notes', 'Work & ideas'], ['/research', 'Research'], ['/history', 'History'], ['/about', 'About'], ['/resume', 'CV']];
export default function PersonalLayout() {
  const menu = useRef(null);
  const location = useLocation();
  useEffect(() => { if (menu.current) menu.current.open = false; }, [location.pathname, location.search, location.hash]);
  return <div className="personal-site">
    <a className="skip" href="#main">Skip to content</a>
    <header className="site-header shell"><Link className="wordmark" to="/">San Kala<span className="wordmark-dot">.</span></Link>
      <nav className="desktop-nav" aria-label="Main">{links.map(([to,label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      <details className="mobile-menu" ref={menu} onKeyDown={event => { if(event.key === 'Escape') { menu.current.open = false; menu.current.querySelector('summary').focus(); } }}><summary>Menu +</summary><nav aria-label="Mobile">{links.map(([to,label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav></details>
    </header><Outlet />
    <footer className="site-footer shell"><div><strong>San Kala.</strong><p>Research, writing, experiments.<br />A personal site, with room to change.</p></div>
      <nav aria-label="Footer"><a href="mailto:san@sankala.me">Email <Arrow /></a><a href="https://github.com/spsanps">GitHub <Arrow /></a><a href="https://linkedin.com/in/sanjayanps">LinkedIn <Arrow /></a><a href="https://kaggle.com/spsanps">Kaggle <Arrow /></a><a href="/documents/resume.pdf">CV PDF <Arrow /></a><a href="/feed.xml">RSS <Arrow /></a></nav>
      <small>Also by me: <a href="https://paperrobots.studio/">Paper Robots</a> · <a href="https://dysonswarm.com/">Dyson Swarm</a></small>
    </footer><ScrollRestoration />
  </div>;
}
