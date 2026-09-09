import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import PhotoTimeline from '../../components/history/PhotoTimeline';

export default function History() {
  return <main id="main" className="shell"><Metadata title="History — San Kala" description="From NIT Karnataka and Texas Instruments to UC San Diego and AI research at eBay. The projects, photographs, competitions, and detours along the way." path="/history" />
    <header className="page-heading"><span className="eyebrow">San Kala / In photographs</span><h1>Career & history</h1><p>From electrical engineering and chip design to AI research—with a startup, some competitions, and a few detours along the way.</p></header><PhotoTimeline headingLevel={2} />
    <section className="history-end"><h2>There’s more to explore.</h2><div className="actions"><Action href="/notes">Browse all work</Action><Action href="/resume" quiet>Full CV</Action></div></section>
  </main>;
}
