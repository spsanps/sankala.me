import { Fragment } from 'react';
import Metadata from '../../../components/site/Metadata';
import { SiteLink } from '../../../components/site/Elements';
import LLMActions from '../../../components/writing/LLMActions';
import LivingCanvas from '../../../components/art/LivingCanvas';
import Cover from '../../../components/art/covers/Cover';
import { TITLE, STANZAS } from './poem';
import '../../../styles/site-pages.css';
import './poem.css';

const PATH = '/notes/nobody-owes-anything-now';
const ART = '/images/notes/nobody-owes-anything-now';
const DESCRIPTION = 'A poem by San Kala. A potter lives in an O’Neill cylinder after AI made money stop mattering, and makes cups by hand.';

// The figure prints its still into the HTML; the turning wheel is drawn in code once it is on
// screen (src/pages/notes/nobody-owes-anything-now/art/). Its script loads only then.
const createWheel = async options => (await import('./art/wheel.js')).createRenderer(options);
const wheelImage = {
  src: `${ART}/wheel-1040.webp`, srcSet: `${ART}/wheel-520.webp 520w, ${ART}/wheel-1040.webp 1040w`,
  sizes: '(max-width: 760px) 320px, 480px', width: 1040, height: 832,
  alt: 'A cup on a potter’s banding wheel, white slip scratched through to red clay. Around its side runs a little landscape: a lamp, a house with POTTERY on the roof, fields climbing, a lake, woods, an orchard and a train.',
};

export default function PoemPage() {
  return <main id="main" className="shell poem-page">
    <Metadata title={TITLE + ' — San Kala'} description={DESCRIPTION} path={PATH} type="article" image="/images/covers/nobody-owes-anything-now-social.jpg"
      schema={{ '@context': 'https://schema.org', '@type': 'CreativeWork', genre: 'Poetry', name: TITLE, author: { '@type': 'Person', name: 'San Kala', url: 'https://www.sankala.me/' }, datePublished: '2026-10-03', url: 'https://www.sankala.me' + PATH, image: 'https://www.sankala.me/images/covers/nobody-owes-anything-now-social.jpg', isAccessibleForFree: true }} />
    <div className="poem-layout">
      <figure className="poem-figure">
        <LivingCanvas image={wheelImage} createRenderer={createWheel} priority className="poem-wheel" />
        <figcaption>The wheel turns once a minute. Drawn in code, as sgraffito: white slip scratched through to the red clay.</figcaption>
      </figure>

      <header className="page-heading poem-heading">
        <span className="eyebrow">Poem · October 2026</span>
        <h1>{TITLE}</h1>
      </header>

      <article className="poem" aria-label={TITLE}>
        {/* the <br>s keep the lines apart where the page's styles don't reach (reader views, crawlers) */}
        {STANZAS.map((stanza, i) => <p className="stanza" key={i}>
          {stanza.map((line, j) => <Fragment key={j}>{j > 0 && <br />}<span className={j ? 'line turn' : 'line'}>{line}</span></Fragment>)}
        </p>)}
      </article>

      <footer className="poem-colophon">
        <div className="poem-cover"><Cover slug="nobody-owes-anything-now" title={TITLE} variant="still" sizes="120px" /></div>
        <div>
          <p>San Kala, 2026.</p>
          <div className="actions"><SiteLink className="text-link" href="/work?type=writing">More writing</SiteLink><SiteLink className="text-link" href="/work">All writing &amp; projects</SiteLink></div>
          <LLMActions markdownUrl={`${PATH}.md`} label="Copy the poem" className="mt-6" />
        </div>
      </footer>
    </div>
  </main>;
}
