import Metadata from '../../components/site/Metadata';
import { Action, SiteLink } from '../../components/site/Elements';
import { works } from '../../data/work';
const images = { 'another-sky': '/images/identity/another-sky.webp', 'a-clauiet-life': '/images/worlds/bee-life.webp', 'dyson-swarm': '/images/worlds/dyson-swarm.webp' };
export default function LabIndex() {
  return <main id="main" className="shell"><Metadata title="Experiments — San Kala" description="Small worlds you can explore: Another Sky, A Clauiet Life, and the Dyson Swarm simulation. Interactive experiments by San Kala." path="/lab" />
    <header className="page-heading"><span className="eyebrow">San Kala / Experiments</span><h1>What if<br /><em>you could walk in?</em></h1><p>Small worlds and ideas you can play with. Open an experiment and see what happens.</p></header>
    <div className="experiment-grid">{works.filter(w => w.formats.includes('experiment')).map(w => <article key={w.slug}><SiteLink href={w.url}><img src={images[w.slug]} alt={w.title} width="640" height="480" loading="lazy" /></SiteLink><span className="eyebrow">{w.date} / Interactive</span><h2>{w.title}</h2><p>{w.description}</p><Action href={w.url}>Explore</Action></article>)}</div>
  </main>;
}
