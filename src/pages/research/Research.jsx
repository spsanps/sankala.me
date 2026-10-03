import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import { Publications } from '../../components/site/ProfileSections';
import '../../styles/site-pages.css';

// Each paper's small cover: the same code-drawn print as on Writing and All work.
const covers = { 'embodied-agents': 'eai-challenge', zinify: 'zinify', 'power-quality': 'power-quality' };

export default function Research() {
  return <main id="main" className="shell"><Metadata title="Research — San Kala" description="Research in language models, embodied agents, visual storytelling, and signal classification. Papers, project links, and competition results by San Kala." path="/research" />
    <header className="page-heading"><h1>Research</h1><p>I work on language models and information extraction at eBay. My research has also taken me through embodied agents, visual storytelling, and electrical signals.</p></header>
    <section className="profile-section research-papers"><div className="section-heading"><h2>Papers & results</h2></div><Publications covers={covers} /></section>
    <section className="history-end"><span className="eyebrow">Beyond the papers</span><h2>Interactive projects</h2><div className="actions"><Action href="/projects">Browse projects</Action><Action href="/resume" quiet>View my CV</Action></div></section>
  </main>;
}
