import { Link } from 'react-router-dom';
import { paperRobotsUrl } from '../../data/links';
import Metadata from '../../components/site/Metadata';
import { Action, Arrow, CareerPath, TopicFolders } from '../../components/site/Elements';

export default function Home() {
  return <main id="main">
    <Metadata title="San Kala — research, writing, experiments" description="AI researcher at eBay. Research, essays, films, and small worlds by San Kala. Previously UC San Diego, Texas Instruments, and NIT Karnataka."
      schema={{ '@context': 'https://schema.org', '@type': 'Person', name: 'San Kala', url: 'https://www.sankala.me/', image: 'https://www.sankala.me/images/identity/san-kala.webp', jobTitle: 'Applied Researcher', worksFor: { '@type': 'Organization', name: 'eBay' }, sameAs: ['https://github.com/spsanps', 'https://linkedin.com/in/sanjayanps', 'https://kaggle.com/spsanps'] }} />
    <div id="home" />
    <section className="personal-intro shell" id="about"><div className="intro-copy">
      <span className="eyebrow">Researcher · writer · curious about things</span>
      <h1>Hi, I’m<br /><em>San Kala.</em></h1>
      <p className="intro-lead">I’m an AI researcher at eBay. I write about AI and robotics, build small experiments, and keep notes on what I learn.</p>
      <p className="intro-detail">Before this: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka.</p>
      <div className="actions"><Action href="/notes">Explore my work</Action><Action href="mailto:san@sankala.me" quiet>Say hello</Action></div>
    </div><div className="portrait-composition">
      <figure className="portrait"><img src="/images/identity/san-kala.webp" alt="San Kala" width="480" height="640" /><figcaption>San Kala / a face to the name</figcaption></figure>
      <figure className="research-snapshot"><img src="/images/history/uist-award.webp" alt="San and his collaborator at the UIST 2023 award ceremony." width="640" height="480" /><figcaption>UIST ’23 · ZINify</figcaption></figure>
      <span className="portrait-note">Making, thinking,<br />occasionally getting it right.</span>
    </div></section>
    <div className="shell"><CareerPath /></div>
    <section className="section shell" id="ideas"><div className="section-heading"><div><span className="eyebrow">A map of the work</span><h2>Things I keep coming back to.</h2></div><Link to="/notes">Everything <Arrow /></Link></div><TopicFolders /></section>
    <section className="section shell selected" id="notes"><div className="section-heading"><div><span className="eyebrow">From the notebook</span><h2>A few starting points.</h2></div><span className="section-aside">Research, a place to explore,<br />and a lesson from trying.</span></div>
      <div className="selected-grid"><article><span className="eyebrow">Research / 2025 challenge · 2026 account</span><h3><Link to="/notes/eai-challenge">Winning by Overfitting <Arrow /></Link></h3><p>How we won the EAI Challenge, and what the result says about embodied AI.</p><a className="text-link" href="https://openreview.net/pdf?id=gABfrJI5ni">Read the research paper <Arrow /></a></article>
      <article><a href="https://dysonswarm.com/another-sky/"><img src="/images/identity/another-sky.webp" alt="A landscape curving overhead inside Another Sky." loading="lazy" width="640" height="360" /><h3>Another Sky <Arrow /></h3></a><p>A walk inside an O’Neill cylinder. Part of my space collection, Dyson Swarm.</p></article>
      <article><span className="eyebrow">Personal note / December 2025</span><h3><Link to="/notes/startr-postmortem">A startup that didn’t make it. <Arrow /></Link></h3><p>The StartR post-mortem: building a writing assistant, losing focus, and learning about distribution.</p><Link className="text-link" to="/history">Where it fits in my history <Arrow /></Link></article></div>
    </section>
    <section className="section shell elsewhere" id="lab"><div className="section-heading"><div><span className="eyebrow">Projects with their own homes</span><h2>Also made by me.</h2></div><Link to="/lab">All the experiments <Arrow /></Link></div>
      <div className="project-homes"><a className="publication-link" href={paperRobotsUrl}><img src="/images/identity/paper-robot.webp" alt="" loading="lazy" width="160" height="160" /><div><span className="eyebrow">The publication</span><h3>Paper Robots <Arrow /></h3><p>Animated essays about AI, robots, and possible futures.</p><small>Latest: GPT-7 Will Have Arms</small></div></a>
      <a className="space-link" href="https://dysonswarm.com/"><span className="orbit-mark" aria-hidden="true">☉</span><div><span className="eyebrow">The space collection</span><h3>Dyson Swarm <Arrow /></h3><p>Interactive experiments in space, scale, and places we might build.</p><small>Another Sky · Dyson Swarm simulation</small></div></a></div>
    </section>
  </main>;
}
