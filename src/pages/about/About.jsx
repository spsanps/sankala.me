import Metadata from '../../components/site/Metadata';
import { paperRobotsUrl } from '../../data/links';
import { Action, CareerPath } from '../../components/site/Elements';

export default function About() {
  return <main id="main" className="shell"><Metadata title="About — San Kala" description="San Kala is an AI researcher at eBay, writer, and maker of Paper Robots and Dyson Swarm. A background in computer science, chip design, and electrical engineering." path="/about" />
    <header className="page-heading history-heading"><div><span className="eyebrow">San Kala</span><h1>About me</h1><p>I’m San. I work on AI at eBay, write about the things I’m trying to understand, and make small worlds you can explore.</p></div><figure><img src="/images/identity/san-kala.webp" alt="San Kala" className="about-portrait" width="480" height="640" /><figcaption>San Kala</figcaption></figure></header>
    <CareerPath />
    <div className="about-copy prose"><h2>Work and interests</h2><p>My day-to-day work is in language models and information extraction. Before that I studied computer science at UC San Diego, designed chips at Texas Instruments, and studied electrical engineering at NIT Karnataka.</p><p>I’m interested in what AI can do in the physical world, how we make powerful systems go well, and the places we might choose to build. Some of that becomes research. Some becomes an essay, a film, or an experiment.</p><h2>Films and space projects</h2><p><a href={paperRobotsUrl}>Paper Robots</a> is where I turn selected ideas into illustrated essays and animated films. <a href="https://dysonswarm.com/">Dyson Swarm</a> is my space collection, including a walk inside an O’Neill cylinder and a simulation of a civilization building around a star.</p><p>This site keeps the wider picture: the research, the projects that worked, the startup that didn’t, and the path between them. The writing and experiments here are my own explorations.</p><div className="actions"><Action href="mailto:san@sankala.me">Email me</Action><Action href="/history" quiet>Career & history</Action></div></div>
  </main>;
}
