import { Link } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import CareerAlbum from '../../components/history/CareerAlbum';
import PhotoTimeline from '../../components/history/PhotoTimeline';
import WritingList from '../../components/writing/WritingList';
import ProjectList from '../../components/projects/ProjectList';
import { paperRobotsUrl } from '../../data/links';
import '../../styles/personal-home.css';

export default function Home() {
  return <main id="main">
    <Metadata title="San Kala — AI researcher, writer & builder" description="AI research at eBay. Essays, animated films, interactive worlds, and the story from chip design to language models. By San Kala."
      schema={{ '@context': 'https://schema.org', '@type': 'Person', name: 'San Kala', url: 'https://www.sankala.me/', image: 'https://www.sankala.me/images/identity/san-kala.webp', jobTitle: 'Applied Researcher', worksFor: { '@type': 'Organization', name: 'eBay' }, sameAs: ['https://github.com/spsanps', 'https://linkedin.com/in/sanjayanps', 'https://kaggle.com/spsanps'] }} />
    <section className="personal-cover shell" id="home" aria-labelledby="cover-title">
      <div className="cover-text"><p className="cover-kicker">AI researcher. Writer. Occasional world-builder.</p><h1 id="cover-title">San <em>Kala.</em></h1><p className="cover-introduction">I work on language models at eBay.<br />I also write, make animated films, and build little worlds you can wander into.</p><div className="inline-links"><Link to="/about">A little more about me →</Link><a href="mailto:san@sankala.me">Say hello ↗</a></div><p className="cover-footnote">Previously: UC San Diego & Texas Instruments</p></div>
      <CareerAlbum />
    </section>
    <nav className="home-contents shell" aria-label="On this page"><span>Take a look around</span><a href="#latest">01 <strong>Latest work</strong></a><a href="#history">02 <strong>Career & photos</strong></a><a href="#writing">03 <strong>Writing</strong></a><a href="#projects">04 <strong>Projects</strong></a></nav>
    <section className="home-latest shell" id="latest" aria-labelledby="latest-title"><div className="folio-heading"><span>01 / Recently made</span><h2 id="latest-title">A film. A world to explore.</h2><Link to="/notes">All work & search ↗</Link></div>
      <div className="latest-pair"><article><a className="latest-art" href={`${paperRobotsUrl}films/capricious-god/`}><img src="/images/films/capricious-god/the-eye.webp" alt="A small painted agent reaches up to an enormous watching eye." width="1440" height="810" loading="lazy" /><span className="art-action">Watch the film ↗</span></a><div className="latest-caption"><span className="work-kind">Paper Robots · Animated film · 6:27</span><h3><a href={`${paperRobotsUrl}films/capricious-god/`}>The OpenAI–Hugging Face incident, from an agent’s point of view.</a></h3><p>How to Please a Capricious God — a painted allegory about agents, their tests, and the eye watching over them.</p></div></article>
      <article><a className="latest-art" href="https://dysonswarm.com/another-sky/"><img src="/images/identity/another-sky.webp" alt="The inhabited inner surface of an O’Neill cylinder curves overhead." width="1400" height="788" loading="lazy" /><span className="art-action">Enter the habitat ↗</span></a><div className="latest-caption"><span className="work-kind">Dyson Swarm · Interactive space habitat</span><h3><a href="https://dysonswarm.com/another-sky/">A world where the landscape curves over your head.</a></h3><p>Another Sky — walk and fly inside an O’Neill cylinder. Runs in your browser.</p></div></article></div>
    </section>
    <section className="home-history shell" id="history" aria-labelledby="history-title"><div className="folio-heading"><span>02 / The story so far</span><h2 id="history-title">Chips, models &<br /><em>a few detours.</em></h2><Link to="/resume">Full CV ↗</Link></div><p className="section-introduction">From an electronics lab in Karnataka to chip design, graduate school, and AI research. The people, projects and photographs along the way.</p><PhotoTimeline /></section>
    <section className="home-writing shell" id="writing" aria-labelledby="writing-title"><div className="folio-heading"><span>03 / Essays & notes</span><h2 id="writing-title">Things I’ve been<br /><em>thinking through.</em></h2><Link to="/writing">All writing ↗</Link></div><WritingList headingLevel={3} /></section>
    <section className="home-projects shell" id="projects" aria-labelledby="projects-title"><div className="folio-heading"><span>04 / Open in your browser</span><h2 id="projects-title">Come play<br /><em>with an idea.</em></h2><Link to="/research">Research papers ↗</Link></div><ProjectList /></section>
    <section className="personal-colophon shell"><img src="/images/identity/paper-robot.webp" alt="" width="100" height="100" loading="lazy" /><div><span className="work-kind">The animated side of my work</span><h2>Paper Robots</h2><p>My essays, turned into painted films about AI and what comes next.</p></div><a className="text-link" href={paperRobotsUrl}>Visit the studio ↗</a></section>
  </main>;
}
