import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Metadata from '../../../components/site/Metadata';
import { SiteLink } from '../../../components/site/Elements';
import LLMActions from '../../../components/writing/LLMActions';
import Cover from '../../../components/art/covers/Cover';
import essayText from './essay.md?raw';
import { parseEssay, essayPieces, sectionLegs, PATH, READ_TIME, SOCIAL_IMAGE, PUBLISHED } from './essay-source';
import { ChatCard, PromptCard, NotesCard } from './components/Cards';
import FlightFigure from './components/FlightFigure';
import Leg from './components/Leg';
import '../../../styles/site-pages.css';
import './its-just-possible.css';

// The essay is set from essay.md as it stands: the reading column is the site's own, and the
// seatback-map world frames it (the cover, a flight-progress strip at each section, the
// messages and prompts as screens, and the flight figure at the end of "The weekend").
const { meta, body } = parseEssay(essayText);
const pieces = essayPieces(body), legs = sectionLegs(body);
const SITE = 'https://www.sankala.me';
const minutes = parseInt(READ_TIME, 10);
const left = n => `${n} min to destination`;

const heading = ({ children, node }) => {
  const text = node.children.map(c => c.value || '').join('').trim(), leg = legs[text];
  return <>{leg && <Leg at={leg.at} note={left(leg.minutes)} />}<h2>{children}</h2></>;
};
const components = { a: ({ href = '', children }) => <SiteLink href={href}>{children}</SiteLink>, h2: heading };

function Piece({ piece }) {
  if (piece.type === 'chat') return <ChatCard messages={piece.messages} />;
  if (piece.type === 'prompt') return <PromptCard label={piece.label} to={piece.to} text={piece.text} />;
  if (piece.type === 'notes') return <NotesCard notes={piece.notes} />;
  if (piece.type === 'figure') return <FlightFigure />;
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{piece.text}</ReactMarkdown>;
}

export default function ItsJustPossibleEssay() {
  return <main id="main" className="shell ijp-page">
    <Metadata title={`${meta.title} — San Kala`} description={meta.subtitle} path={PATH} type="article" image={SOCIAL_IMAGE}
      schema={{ '@context': 'https://schema.org', '@type': 'Article', headline: meta.title, description: meta.subtitle, author: { '@type': 'Person', name: 'San Kala', url: SITE + '/' }, datePublished: PUBLISHED, url: SITE + PATH, image: SITE + SOCIAL_IMAGE, isAccessibleForFree: true }} />
    <header className="page-heading note-heading has-frontispiece">
      <div>
        <span className="eyebrow">Essay · {meta.date} · {READ_TIME}</span>
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>
      <div className="frontispiece"><Cover slug="its-just-possible" title={meta.title} priority sizes="(max-width: 760px) 120px, 200px" /></div>
    </header>
    <article className="prose note-body ijp-body">
      <Leg at={0} note={`Now boarding · ${left(minutes)}`} className="is-first" />
      {pieces.map((piece, i) => <Piece key={i} piece={piece} />)}
      <Leg at={1} note="Arrived" className="is-last" />
      <div className="actions"><SiteLink className="text-link" href="/work?type=writing">More writing</SiteLink><SiteLink className="text-link" href="/work">All writing &amp; projects</SiteLink></div>
      <LLMActions markdownUrl={`${PATH}.md`} className="mt-8" />
    </article>
  </main>;
}
