import { Link, useLocation } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import ProjectList from '../../components/projects/ProjectList';
import { paperRobotsUrl } from '../../data/links';

export default function Projects() {
  const { pathname } = useLocation();
  return <main id="main" className="shell"><Metadata title="Projects — San Kala" description="Explore a space habitat, follow an AI-controlled bee, simulate a Dyson swarm, or watch Paper Robots’ animated essays. Projects by San Kala." path={pathname === '/lab' ? '/lab' : '/projects'} />
    <header className="page-heading"><h1>Projects</h1><p>Interactive worlds you can open in your browser, and essays I’ve turned into films.</p></header>
    <section aria-labelledby="interactive-title"><div className="section-heading"><h2 id="interactive-title">Interactive projects</h2></div><ProjectList /></section>
    <section className="project-films" aria-labelledby="project-films-title"><div><span className="work-kind">My animation channel</span><h2 id="project-films-title">Paper Robots</h2><p>Animated films adapted from my essays about AI, robots and possible futures.</p><div className="inline-links"><a className="text-link" href="https://www.youtube.com/@paperrobotsfilms">Watch on YouTube ↗</a><a className="text-link" href={paperRobotsUrl}>Visit the publication ↗</a></div></div><a href="https://www.youtube.com/watch?v=wswbqJNMFBw"><img src="/images/films/capricious-god/the-eye.webp" alt="Watch the animated film about the OpenAI–Hugging Face incident." width="1400" height="788" loading="lazy" /></a></section>
    <aside className="index-footer"><p>Research projects, including ZINify, are on the <Link to="/research">research page</Link>. You can also <Link to="/notes">search all work</Link>.</p></aside>
  </main>;
}
