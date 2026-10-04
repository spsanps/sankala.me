import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Metadata from '../../../components/site/Metadata';
import { SiteLink } from '../../../components/site/Elements';
import LLMActions from '../../../components/writing/LLMActions';
import Cover from '../../../components/art/covers/Cover';
import essay from './essay.md?raw';
import { TITLE, DECK, DATE, PUBLISHED, PATH, READ_TIME, MODEL_URL, VIDEO, VIDEO_CAPTION, MODEL_CAPTION, essayParts } from './essay-meta';
import '../../../styles/site-pages.css';
import './iros.css';

const SOCIAL = '/images/covers/iros-2026-origami-social.jpg';
const STILL = '/images/notes/iros-2026-origami';

// Wide tables scroll sideways on phones instead of widening the page.
const markdownComponents = { table: ({ children }) => <div className="iros-table"><table>{children}</table></div> };
const Text = ({ children }) => <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{children}</ReactMarkdown></div>;

// The 26-second cut: muted until the reader turns the sound on, and nothing downloaded but its poster until it plays.
function Video() {
  return <figure className="essay-figure iros-video">
    <video controls muted playsInline preload="none" poster={VIDEO.poster} width={VIDEO.width} height={VIDEO.height} aria-label="A 26-second video: two robot hands fold a sheet of paper at IROS 2026 in Pittsburgh, and the result, second place.">
      <source src={VIDEO.src} type="video/mp4" />
    </video>
    <figcaption>{VIDEO_CAPTION}</figcaption>
  </figure>;
}

// The policy in 3D (public/notes/iros-2026-origami/model/), wider than the reading column. Its still is in the
// HTML for the first paint and readers without JavaScript; the live page loads over it when it nears the screen.
function Model() {
  return <figure className="iros-model" aria-labelledby="iros-model-caption">
    <div className="iros-model-frame">
      <img src={`${STILL}/model-still-1200.webp`} srcSet={`${STILL}/model-still-600.webp 600w, ${STILL}/model-still-1200.webp 1200w`} sizes="(max-width: 760px) 100vw, 1200px" width="1200" height="720" alt="The policy as a 3D diagram: three cameras, ten fingertips and the joint positions become tokens, two transformer layers mix them, and six blocks refine a noisy plan into a plan of 60 steps for 65 joints." loading="lazy" decoding="async" />
      <iframe src={`${MODEL_URL}?embed`} title="The origami policy in 3D, with a guided tour" loading="lazy" />
    </div>
    <figcaption id="iros-model-caption"><span>{MODEL_CAPTION}</span> <a className="iros-open" href={MODEL_URL}>Open full screen <span aria-hidden="true">↗</span></a></figcaption>
  </figure>;
}

export default function IrosEssay() {
  return <main id="main" className="shell iros-page">
    <Metadata title={TITLE + ' — San Kala'} description={DECK} path={PATH} type="article" image={SOCIAL}
      schema={{ '@context': 'https://schema.org', '@type': 'Article', headline: TITLE, description: DECK, author: { '@type': 'Person', name: 'San Kala', url: 'https://www.sankala.me/' }, datePublished: PUBLISHED, url: 'https://www.sankala.me' + PATH, image: 'https://www.sankala.me' + SOCIAL, isAccessibleForFree: true }} />
    <header className="page-heading note-heading has-frontispiece">
      <div>
        <span className="eyebrow">Essay · {DATE} · {READ_TIME}</span>
        <h1>{TITLE}</h1>
        <p>{DECK}</p>
      </div>
      <div className="frontispiece"><Cover slug="iros-2026-origami" title={TITLE} priority sizes="(max-width: 760px) 120px, 200px" /></div>
    </header>

    <article className="essay-body iros-body">
      {essayParts(essay).map((part, i) => part.kind === 'video' ? <Video key={i} /> : part.kind === 'model' ? <Model key={i} /> : <Text key={i}>{part.text}</Text>)}
      <div className="prose">
        <div className="actions"><SiteLink className="text-link" href="/work?type=writing">More writing</SiteLink><SiteLink className="text-link" href="/work">All writing &amp; projects</SiteLink></div>
        <LLMActions markdownUrl={`${PATH}.md`} className="mt-8" />
      </div>
    </article>
  </main>;
}
