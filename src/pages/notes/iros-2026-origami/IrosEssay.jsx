import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Metadata from '../../../components/site/Metadata';
import { SiteLink } from '../../../components/site/Elements';
import LLMActions from '../../../components/writing/LLMActions';
import Cover from '../../../components/art/covers/Cover';
import LivingCanvas from '../../../components/art/LivingCanvas';
import { STAGES, statusFor } from './art/folds-text';
import essay from './essay.md?raw';
import { TITLE, DECK, DATE, PUBLISHED, PATH, READ_TIME, MODEL_URL, VIDEO, VIDEO_CAPTION, MODEL_CAPTION, LIFT_CAPTION, FOLDS_CAPTION, essayParts } from './essay-meta';
import '../../../styles/site-pages.css';
import './iros.css';

const SOCIAL = '/images/covers/iros-2026-origami-social.jpg';
const STILL = '/images/notes/iros-2026-origami';

// Wide tables scroll sideways on phones instead of widening the page. Section headings open like steps of a
// diagram sheet (iros.css); the references are the back of the sheet.
const headingText = children => [].concat(children).map(c => typeof c === 'string' ? c : '').join('');
const markdownComponents = {
  table: ({ children }) => <div className="iros-table"><table>{children}</table></div>,
  h2: ({ children }) => <h2 className={/^References/.test(headingText(children)) ? 'iros-turn' : 'iros-step'}>{children}</h2>,
};
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

// Lifting a corner: a small instruction vignette, its still in the HTML, alive (on a slow loop) once on screen.
const createLift = async options => (await import('./art/lift.js')).createRenderer(options);
const liftImage = {
  src: `${STILL}/lift-920.webp`, srcSet: `${STILL}/lift-460.webp 460w, ${STILL}/lift-920.webp 920w`,
  sizes: '(max-width: 760px) 100vw, 560px', width: 920, height: 600,
  alt: 'An instruction diagram: one robot hand presses a sheet of paper near its corner and pushes toward it, so the corner rises; the other robot hand slides a fingertip under the corner.',
};
function Lift() {
  const [title, ...rest] = LIFT_CAPTION.split('. ');
  return <figure className="essay-figure iros-lift">
    <LivingCanvas image={liftImage} createRenderer={createLift} className="iros-lift-art" />
    <figcaption><b>{title}.</b> {rest.join('. ')}</figcaption>
  </figure>;
}

// The five folds: the still is stage 1 as a diagram; the drawing and its controls come alive near the screen.
function Folds() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current; let cleanup = null, cancelled = false;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      Promise.all([import('./art/folds.js'), import('../../../components/art/covers/fonts.js').then(m => m.loadCoverFonts(['zen-maru-gothic-700']))])
        .then(([module]) => { if (!cancelled) cleanup = module.mountFolds(root); });
    }, { rootMargin: '300px' });
    io.observe(root);
    return () => { cancelled = true; io.disconnect(); if (cleanup) cleanup(); };
  }, []);
  const [title, ...rest] = FOLDS_CAPTION.split('. ');
  return <figure className="essay-figure iros-folds" ref={ref}>
    <div className="folds-stage">
      <picture>
        <source media="(max-width: 600px)" srcSet={`${STILL}/folds-narrow-548.webp 548w, ${STILL}/folds-narrow-1096.webp 1096w`} sizes="100vw" />
        <img src={`${STILL}/folds-wide-1280.webp`} srcSet={`${STILL}/folds-wide-640.webp 640w, ${STILL}/folds-wide-1280.webp 1280w`} sizes="(max-width: 900px) 100vw, 840px" width="1280" height="860" loading="lazy" decoding="async"
          alt="Step 1 of an origami diagram: a square sheet with a dashed valley-fold line across its top-left corner and a curved arrow taking the corner to the centre. A robot hand reaches for the corner; the other pins the sheet." />
      </picture>
      <canvas aria-hidden="true" />
    </div>
    <div className="folds-steps" role="group" aria-label="The five folds">
      {STAGES.map((stage, i) => <button key={i} type="button" data-step disabled aria-current={i === 0 ? 'step' : 'false'} className={stage.done ? 'is-done' : 'is-not'}>
        <span className="folds-num" aria-hidden="true">{i + 1}</span><span className="folds-name">{stage.name}<span className="visually-hidden">, step {i + 1}: {stage.mark}</span></span>
      </button>)}
    </div>
    <div className="folds-foot">
      <p data-status aria-live="polite">{statusFor(0)}</p>
      <button type="button" data-play disabled>Play all five</button>
    </div>
    <figcaption><b>{title}.</b> {rest.join('. ')}</figcaption>
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
      {essayParts(essay).map((part, i) => {
        const Part = { video: Video, model: Model, lift: Lift, folds: Folds }[part.kind];
        return Part ? <Part key={i} /> : <Text key={i}>{part.text}</Text>;
      })}
      <div className="prose">
        <div className="actions"><SiteLink className="text-link" href="/work?type=writing">More writing</SiteLink><SiteLink className="text-link" href="/work">All writing &amp; projects</SiteLink></div>
        <LLMActions markdownUrl={`${PATH}.md`} className="mt-8" />
      </div>
    </article>
  </main>;
}
