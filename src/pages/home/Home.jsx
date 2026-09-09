import { Link } from 'react-router-dom';
import { paperRobotsUrl } from '../../data/links';
import Metadata from '../../components/site/Metadata';
import { CareerPath } from '../../components/site/Elements';

export default function Home() {
  return <main id="main">
    <Metadata title="San Kala — AI researcher, writer & builder" description="AI research at eBay, essays about robotics, and interactive worlds. Writing, projects, research and background by San Kala."
      schema={{ '@context': 'https://schema.org', '@type': 'Person', name: 'San Kala', url: 'https://www.sankala.me/', image: 'https://www.sankala.me/images/identity/san-kala.webp', jobTitle: 'Applied Researcher', worksFor: { '@type': 'Organization', name: 'eBay' }, sameAs: ['https://github.com/spsanps', 'https://linkedin.com/in/sanjayanps', 'https://kaggle.com/spsanps'] }} />
    <div id="home" />
    <section className="home-intro shell" id="about">
      <div className="home-name"><h1>Hi, I’m San.</h1><p>AI researcher at eBay.</p></div>
      <div className="home-bio"><p>I work on language models. Outside work, I write about robotics, make animated films, and build worlds you can explore.</p><div className="inline-links"><Link to="/about">More about me <span aria-hidden="true">→</span></Link><a href="mailto:san@sankala.me">Email me</a></div></div>
      <img className="home-portrait" src="/images/identity/san-kala.webp" alt="San Kala" width="480" height="640" />
    </section>
    <section className="home-selected shell" id="notes" aria-labelledby="selected-title">
      <div className="section-heading"><h2 id="selected-title">Selected work</h2><Link to="/notes">View everything <span aria-hidden="true">→</span></Link></div>
      <div className="featured-work">
        <article className="feature feature-research">
          <Link className="result-visual" to="/notes/eai-challenge" tabIndex={-1} aria-hidden="true"><span>NeurIPS 2025 · EAI Challenge</span><strong>1st<span>place</span></strong><span>Team AxisTilted2</span></Link>
          <div className="feature-copy"><span className="work-kind">Research · 4 min read</span><h3><Link to="/notes/eai-challenge">Winning by Overfitting</Link></h3><p>How my brother and I won an embodied AI challenge by closing the loop around its evaluator.</p><Link className="text-link" to="/notes/eai-challenge">Read the write-up <span aria-hidden="true">→</span></Link></div>
        </article>
        <article className="feature">
          <a className="feature-image" href="https://dysonswarm.com/another-sky/" tabIndex={-1} aria-hidden="true"><img src="/images/identity/another-sky.webp" alt="" width="1400" height="788" /></a>
          <div className="feature-copy"><span className="work-kind">Interactive project · September 2026</span><h3><a href="https://dysonswarm.com/another-sky/">Another Sky</a></h3><p>Stand inside a space habitat where the landscape curves up and over your head.</p><a className="text-link" href="https://dysonswarm.com/another-sky/">Explore the cylinder <span aria-hidden="true">↗</span></a></div>
        </article>
        <article className="feature">
          <Link className="feature-image" to="/essays/gpt7-will-have-arms" tabIndex={-1} aria-hidden="true"><img src="/images/identity/many-arms-film.webp" alt="" width="1400" height="788" /></Link>
          <div className="feature-copy"><span className="work-kind">Essay · December 2025 · Also a film</span><h3><Link to="/essays/gpt7-will-have-arms">GPT-7 Will Have Arms</Link></h3><p>Why I think the next step for foundation models is out of the chat window and into the physical world.</p><div className="inline-links"><Link className="text-link" to="/essays/gpt7-will-have-arms">Read the essay <span aria-hidden="true">→</span></Link><a className="text-link" href="https://www.youtube.com/watch?v=kzvqj4jurW0">Watch the film <span aria-hidden="true">↗</span></a></div></div>
        </article>
      </div>
    </section>
    <section className="browse-section shell" id="ideas" aria-label="Browse the site">
      <Link to="/writing"><strong>Writing <span aria-hidden="true">→</span></strong><span>Essays, research write-ups and personal notes</span></Link>
      <Link to="/projects"><strong>Projects <span aria-hidden="true">→</span></strong><span>Space simulations, AI experiments and films</span></Link>
      <Link to="/research"><strong>Research <span aria-hidden="true">→</span></strong><span>Papers, results and collaborators</span></Link>
    </section>
    <div className="home-background shell"><CareerPath /></div>
    <section className="home-publication shell" id="lab" aria-labelledby="films-title"><img src="/images/identity/paper-robot.webp" alt="Paper Robots’ blue robot" width="160" height="160" loading="lazy" /><div><h2 id="films-title">I also make films as Paper Robots.</h2><p>Animated versions of my essays about AI and possible futures.</p></div><a className="text-link" href={paperRobotsUrl}>Visit Paper Robots <span aria-hidden="true">↗</span></a></section>
  </main>;
}
