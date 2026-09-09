import { Link, useLocation } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import { SiteLink } from '../../components/site/Elements';
import { paperRobotsUrl } from '../../data/links';
import { works } from '../../data/work';

const previews = {
  'another-sky': { image: '/images/identity/another-sky.webp', description: 'Walk or fly inside an O’Neill cylinder: a space habitat with cities, water and land on its inner surface.', action: 'Explore Another Sky', collection: 'Dyson Swarm · Space simulation' },
  'a-clauiet-life': { image: '/images/worlds/bee-life.webp', description: 'A garden seen through the life of a bee, with Claude making the decisions.', action: 'Open the bee simulation', collection: 'AI experiment' },
  'dyson-swarm': { image: '/images/worlds/dyson-swarm.webp', description: 'A simulation of dismantling Mercury to build a swarm of solar collectors around the Sun.', action: 'Run the swarm simulation', collection: 'Dyson Swarm · Space simulation' },
};
export default function Projects() {
  const { pathname } = useLocation();
  return <main id="main" className="shell"><Metadata title="Projects — San Kala" description="Explore a space habitat, follow an AI-controlled bee, simulate a Dyson swarm, or watch Paper Robots’ animated essays. Projects by San Kala." path={pathname === '/lab' ? '/lab' : '/projects'} />
    <header className="page-heading"><h1>Projects</h1><p>Interactive worlds you can open in your browser, and essays I’ve turned into films.</p></header>
    <section aria-labelledby="interactive-title"><div className="section-heading"><h2 id="interactive-title">Interactive projects</h2></div><div className="project-list">{works.filter(work => work.formats.includes('experiment')).map(work => {
      const preview = previews[work.slug];
      return <article className="project-entry" key={work.slug} data-project><SiteLink href={work.url} tabIndex={-1} aria-hidden="true"><img src={preview.image} alt="" width="1400" height="788" loading="lazy" /></SiteLink><div><span className="work-kind">{preview.collection} · {work.date}</span><h3><SiteLink href={work.url}>{work.title}</SiteLink></h3><p>{preview.description}</p><SiteLink className="text-link" href={work.url}>{preview.action} <span aria-hidden="true">↗</span></SiteLink></div></article>;
    })}</div></section>
    <section className="project-films" aria-labelledby="project-films-title"><div><span className="work-kind">My animation channel</span><h2 id="project-films-title">Paper Robots</h2><p>Animated films adapted from my essays about AI, robots and possible futures.</p><div className="inline-links"><a className="text-link" href="https://www.youtube.com/@paperrobotsfilms">Watch on YouTube ↗</a><a className="text-link" href={paperRobotsUrl}>Visit the publication ↗</a></div></div><a href="https://www.youtube.com/watch?v=kzvqj4jurW0"><img src="/images/identity/many-arms-film.webp" alt="Watch The Coming Robotics Revolution, the film adaptation of GPT-7 Will Have Arms." width="1400" height="788" loading="lazy" /></a></section>
    <aside className="index-footer"><p>Research projects, including ZINify, are on the <Link to="/research">research page</Link>. You can also <Link to="/notes">search all work</Link>.</p></aside>
  </main>;
}
