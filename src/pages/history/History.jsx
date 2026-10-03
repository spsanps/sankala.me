import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import PhotoTimeline from '../../components/history/PhotoTimeline';
import { places } from '../../components/history/places';
import '../../styles/site-pages.css';

export default function History() {
  return <main id="main" className="shell"><Metadata title="Timeline — San Kala" description="From NIT Karnataka and Texas Instruments to UC San Diego and AI research at eBay. The projects, photographs, competitions, and detours along the way." path="/history" />
    <header className="page-heading"><h1>Timeline</h1><p>From electrical engineering and chip design to AI research—with a startup, some competitions, and a few detours along the way.</p>
      <nav className="place-index inline-links" aria-label="Places">{places.map(place => <a key={place.id} href={`#place-${place.id}`}>{place.name} <span>{place.years}</span></a>)}</nav></header>
    <PhotoTimeline headingLevel={2} grouped />
    <section className="history-end"><h2>There’s more to explore.</h2><div className="actions"><Action href="/work">Browse all work</Action><Action href="/resume" quiet>Full CV</Action></div></section>
  </main>;
}
