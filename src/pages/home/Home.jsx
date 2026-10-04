import { Helmet } from 'react-helmet-async';
import Metadata from '../../components/site/Metadata';
import { SiteLink } from '../../components/site/Elements';
import Cover from '../../components/art/covers/Cover';
import { hasCover } from '../../components/art/covers/registry';
import { works, formatName } from '../../data/work';
import { paperRobotsUrl } from '../../data/links';
import MosaicApse from './MosaicApse';
import MosaicFooter from './MosaicFooter';
import { mosaicCss, stillPreloads } from './mosaic/style';
import { beforeApseScript, afterApseScript } from './mosaic/first-paint';
import '../../styles/home.css';

// Newest first, every work that has a code-drawn cover.
const shelf = [...works].filter(work => hasCover(work.slug)).sort((a, b) => String(b.sortDate).localeCompare(String(a.sortDate)));
const year = work => String(work.sortDate).slice(0, 4);
const CSS = mosaicCss(), BEFORE = beforeApseScript(), AFTER = afterApseScript(), PRELOADS = stillPreloads();

/* The homepage is one building: the mosaic apse with San's words on a stele and his path on marble
   tablets (MosaicApse), then the covers shelf and the colophon on plaster, then a mosaic footer. */
export default function Home() {
  return <main id="main" className="home">
    <Metadata title="San Kala — AI researcher and builder" description="San Kala works on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Writing, projects and research."
      image="/images/home/social.jpg"
      schema={{ '@context': 'https://schema.org', '@type': 'Person', name: 'San Kala', url: 'https://www.sankala.me/', image: 'https://www.sankala.me/images/identity/san-kala.webp', jobTitle: 'Applied Researcher', worksFor: { '@type': 'Organization', name: 'eBay' }, sameAs: ['https://github.com/spsanps', 'https://linkedin.com/in/sanjayanps', 'https://kaggle.com/spsanps'] }} />
    <Helmet>
      {/* the page is drawn light on purpose: browsers that darken pages on their own would leave the
          words pale on the marble */}
      <meta name="color-scheme" content="only light" />
      <link rel="preload" href="/fonts/home/eb-garamond.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/home/marcellus-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      {/* the first screen's stills, ahead of the scripts (as CSS backgrounds they would come last) */}
      {PRELOADS.map(({ href, media }) => <link key={href} rel="preload" as="image" href={href} {...(media ? { media } : {})} fetchPriority="high" />)}
    </Helmet>
    {/* The numbers the stills were printed with, and the first-paint scripts (mosaic/first-paint.js). */}
    <style dangerouslySetInnerHTML={{ __html: CSS }} />
    <script dangerouslySetInnerHTML={{ __html: BEFORE }} />
    <MosaicApse />
    <script dangerouslySetInnerHTML={{ __html: AFTER }} />
    <div className="home-plaster">
    <div className="apse-end" aria-hidden="true" />

    <section className="home-shelf" id="writing" aria-labelledby="shelf-title">
      <span id="projects" className="home-anchor" aria-hidden="true" />
      <div className="home-shelf-text">
        <h2 id="shelf-title">Writing &amp; work</h2>
        <p>Essays, research, films and things to open in your browser. Each one has its own cover, drawn in code.</p>
        <p className="home-shelf-links"><SiteLink href="/work">All Writing & Projects</SiteLink><SiteLink href="/work?type=writing">Writing</SiteLink><SiteLink href="/work?type=projects">Projects</SiteLink><SiteLink href="/work?type=research">Research</SiteLink></p>
      </div>
      <ol className="home-covers">{shelf.map(work => <li key={work.slug}>
        <SiteLink href={work.url} className="home-cover">
          <Cover slug={work.slug} title={work.title} variant="still" alt="" sizes="(max-width: 700px) 45vw, 220px" />
          <span className="home-cover-title">{work.title}</span>
        </SiteLink>
        <span className="home-cover-meta">{formatName(work)} · {year(work)}</span>
      </li>)}</ol>
    </section>

    <aside className="home-recent" id="latest" aria-label="Recently">
      <p><span>Recently</span> <a href={`${paperRobotsUrl}films/capricious-god/`}>How to Please a Capricious God</a>, a painted film for Paper Robots (September 2026), and <a href="https://dysonswarm.com/another-sky/">Another Sky</a>, a walk inside an O’Neill cylinder (September 2026).</p>
      <p className="home-colophon">The apse is laid in code, stone by stone, and so are the covers. The photographs are real.</p>
    </aside>
    </div>
    <MosaicFooter />
  </main>;
}
