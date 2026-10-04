import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Metadata from '../../../components/site/Metadata';
import { SiteLink } from '../../../components/site/Elements';
import LLMActions from '../../../components/writing/LLMActions';
import Cover from '../../../components/art/covers/Cover';
import essayText from './essay.md?raw';
import { parseEssay, PATH, READ_TIME, SOCIAL_IMAGE, PUBLISHED } from './essay-source';
import '../../../styles/site-pages.css';

const { meta, body } = parseEssay(essayText);
const SITE = 'https://www.sankala.me';

// Links inside the essay: site pages open in the app, everything else is a plain link.
const components = { a: ({ href = '', children }) => <SiteLink href={href}>{children}</SiteLink> };

export default function ItsJustPossibleEssay() {
  return <main id="main" className="shell">
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
    <article className="prose note-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{body}</ReactMarkdown>
      <div className="actions"><SiteLink className="text-link" href="/work?type=writing">More writing</SiteLink><SiteLink className="text-link" href="/work">All writing &amp; projects</SiteLink></div>
      <LLMActions markdownUrl={`${PATH}.md`} className="mt-8" />
    </article>
  </main>;
}
