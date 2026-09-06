import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import { Education, Experience, Honors, Publications } from '../../components/site/ProfileSections';
export default function Resume() {
  return <main id="main" className="shell">
    <Metadata title="CV — San Kala" description="Applied AI researcher at eBay. Language models, multimodal information extraction, embodied agents, and ASIC design. Experience, publications, education, and honors." path="/resume" />
    <header className="page-heading"><span className="eyebrow">San Kala / Curriculum vitae</span><h1>Research meets<br /><em>making things work.</em></h1><p>Information extraction · Language models · Multimodal AI · ASIC design</p><div className="actions"><Action href="/documents/resume.pdf">Download CV</Action><Action href="mailto:san@sankala.me" quiet>Get in touch</Action></div></header>
    <section className="profile-section"><div className="section-heading"><h2>Experience.</h2><span className="eyebrow">01</span></div><Experience /></section>
    <section className="profile-section"><div className="section-heading"><h2>Publications.</h2><span className="eyebrow">02</span></div><Publications /></section>
    <section className="profile-section"><div className="section-heading"><h2>Education.</h2><span className="eyebrow">03</span></div><Education /></section>
    <section className="profile-section"><div className="section-heading"><h2>Honors.</h2><span className="eyebrow">04</span></div><Honors /></section>
  </main>;
}
