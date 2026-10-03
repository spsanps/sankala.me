import Metadata from '../../components/site/Metadata';
import { Action } from '../../components/site/Elements';
import { Education, Experience, Honors, Publications } from '../../components/site/ProfileSections';
import '../../styles/resume.css';

export default function Resume() {
  return <main id="main" className="shell resume-page">
    <Metadata title="CV — San Kala" description="Applied AI researcher at eBay. Language models, multimodal information extraction, embodied agents, and ASIC design. Experience, publications, education, and honors." path="/resume" />
    <header className="page-heading"><h1>CV</h1><p>Information extraction · Language models · Multimodal AI · ASIC design</p><p className="print-contact">San Kala · san@sankala.me · sankala.me</p><div className="actions"><Action href="/documents/resume.pdf">Download CV</Action><Action href="mailto:san@sankala.me" quiet>Email me</Action></div></header>
    <section className="profile-section" aria-labelledby="cv-experience"><div className="section-heading"><h2 id="cv-experience">Experience</h2></div><Experience /></section>
    <section className="profile-section" aria-labelledby="cv-publications"><div className="section-heading"><h2 id="cv-publications">Publications</h2></div><Publications /></section>
    <section className="profile-section" aria-labelledby="cv-education"><div className="section-heading"><h2 id="cv-education">Education</h2></div><Education /></section>
    <section className="profile-section" aria-labelledby="cv-honors"><div className="section-heading"><h2 id="cv-honors">Honors</h2></div><Honors /></section>
  </main>;
}
