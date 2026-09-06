import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import { Publications } from '../../components/site/ProfileSections';

export default function Research() {
  return <main id="main" className="shell"><Metadata title="Research — San Kala" description="Research in language models, embodied agents, visual storytelling, and signal classification. Papers, project links, and competition results by San Kala." path="/research" />
    <header className="page-heading"><span className="eyebrow">San Kala / Research</span><h1>Ideas, with<br /><em>experiments attached.</em></h1><p>I work on language models and information extraction at eBay. My research has also taken me through embodied agents, visual storytelling, and electrical signals.</p></header>
    <section className="profile-section"><div className="section-heading"><div><span className="eyebrow">Papers & projects</span><h2>Selected research.</h2></div></div><Publications /></section>
    <section className="history-end"><span className="eyebrow">Beyond the papers</span><h2>Some ideas are easier to explore.</h2><div className="actions"><Action href="/lab">Open the experiments</Action><Action href="/resume" quiet>Full professional background</Action></div></section>
  </main>;
}
