import Metadata from '../../components/site/Metadata';
import { Action, Arrow, SiteLink } from '../../components/site/Elements';
import milestones from '../../data/history.json';

export default function History() {
  return <main id="main" className="shell"><Metadata title="History — San Kala" description="From NIT Karnataka and Texas Instruments to UC San Diego and AI research at eBay. The projects, research, competitions, and detours along the way." path="/history" />
    <header className="page-heading history-heading"><div><span className="eyebrow">San Kala / History</span><h1>The path<br /><em>so far.</em></h1><p>From electrical engineering and chip design to AI research—with a startup, some competitions, and a few detours along the way.</p></div><figure><img src="/images/history/research-group.webp" alt="San with the UC San Diego research group." width="640" height="426" /><figcaption>UC San Diego / the research years</figcaption></figure></header>
    <div className="timeline">{milestones.map((m,i) => <article className="milestone" data-milestone key={m.title}><span className="timeline-year">{m.year}</span><div><span className="milestone-number">{String(i+1).padStart(2,'0')}</span><h2>{m.title}</h2><p>{m.description}</p>{m.url && <SiteLink href={m.url}>{m.linkLabel} <Arrow /></SiteLink>}{[3,9].includes(i) && <figure className="timeline-photo"><img src={`/images/history/${i === 3 ? 'uist-award' : 'nitk-lab'}.webp`} alt={i === 3 ? 'UIST 2023 award ceremony.' : 'At the NIT Karnataka laboratory.'} loading="lazy" /><figcaption>{i === 3 ? 'ZINify / UIST 2023' : 'Electrical engineering / NIT Karnataka'}</figcaption></figure>}</div></article>)}</div>
    <section className="history-end"><span className="eyebrow">And still figuring things out</span><h2>The work continues.</h2><div className="actions"><Action href="/notes">Explore the work</Action><Action href="/resume" quiet>Full CV</Action></div></section>
  </main>;
}
