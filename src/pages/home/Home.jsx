import Metadata from '../../components/site/Metadata';
import { SiteLink } from '../../components/site/Elements';
import Cover from '../../components/art/covers/Cover';
import { hasCover } from '../../components/art/covers/registry';
import { works, formatNames } from '../../data/work';
import { paperRobotsUrl } from '../../data/links';
import FourFrames from './FourFrames';
import '../../styles/home.css';

// Newest first, every work that has a code-drawn cover.
const shelf = [...works].filter(work => hasCover(work.slug)).sort((a, b) => String(b.sortDate).localeCompare(String(a.sortDate)));
const year = work => String(work.sortDate).slice(0, 4);

export default function Home() {
  return <main id="main" className="home">
    <Metadata title="San Kala — AI researcher, writer & builder" description="San Kala works on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Writing, projects and research."
      image="/images/home/social.jpg"
      schema={{ '@context': 'https://schema.org', '@type': 'Person', name: 'San Kala', url: 'https://www.sankala.me/', image: 'https://www.sankala.me/images/identity/san-kala.webp', jobTitle: 'Applied Researcher', worksFor: { '@type': 'Organization', name: 'eBay' }, sameAs: ['https://github.com/spsanps', 'https://linkedin.com/in/sanjayanps', 'https://kaggle.com/spsanps'] }} />
    <FourFrames />

    <section className="home-shelf" id="writing" aria-labelledby="shelf-title">
      <span id="projects" className="home-anchor" aria-hidden="true" />
      <div className="home-shelf-text">
        <h2 id="shelf-title">Writing &amp; work</h2>
        <p>Essays, research, films and things to open in your browser. Each one has its own cover, drawn in code.</p>
        <p className="home-shelf-links"><SiteLink href="/work">All work</SiteLink><SiteLink href="/work?type=writing">Writing</SiteLink><SiteLink href="/work?type=projects">Projects</SiteLink><SiteLink href="/work?type=research">Research</SiteLink></p>
      </div>
      <ol className="home-covers">{shelf.map(work => <li key={work.slug}>
        <SiteLink href={work.url} className="home-cover">
          <Cover slug={work.slug} title={work.title} variant="still" alt="" sizes="(max-width: 700px) 30vw, 180px" />
          <span className="home-cover-title">{work.title}</span>
        </SiteLink>
        <span className="home-cover-meta">{formatNames[work.formats[0]]} · {year(work)}</span>
      </li>)}</ol>
    </section>

    <aside className="home-recent" id="latest" aria-label="Recently">
      <p><span>Recently</span> <a href={`${paperRobotsUrl}films/capricious-god/`}>How to Please a Capricious God</a>, a painted film for Paper Robots (September 2026), and <a href="https://dysonswarm.com/another-sky/">Another Sky</a>, a walk inside an O’Neill cylinder (September 2026).</p>
      <p className="home-colophon">The desk and the covers are drawn in code. The photographs are real.</p>
    </aside>
  </main>;
}
