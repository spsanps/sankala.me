import { useEffect, useRef } from 'react';
import Metadata from '../../../components/site/Metadata';
import { SiteLink } from '../../../components/site/Elements';
import LLMActions from '../../../components/writing/LLMActions';
import Cover from '../../../components/art/covers/Cover';
import { loadEssayFonts } from '../../../components/art/essay-fonts';
import { PAGE_TEXT } from './components/zine-text';
import '../../../styles/site-pages.css';
import './zinify.css';

const CUT_FACES = ['special-elite-400', 'permanent-marker-400', 'alfa-slab-one-400', 'bowlby-one-sc-400', 'unifrakturcook-700', 'rubik-mono-one-400', 'playfair-display-sc-900', 'stardos-stencil-700'];

// ZINify at the copy center: the figure is a photocopied flyer drawn in code. Its script and
// the cut-up typefaces load only in the browser; it cleans up on unmount.
function CopyCenterFigure() {
  const ref = useRef(null);
  useEffect(() => {
    let cleanup = null, cancelled = false;
    Promise.all([import('./components/figure.js'), loadEssayFonts(CUT_FACES)])
      .then(([module]) => { if (!cancelled && ref.current) cleanup = module.mount(ref.current); });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, []);
  return <figure className="zf-figure essay-figure" id="zfig" ref={ref}>
    <div className="sheet" id="zsheet" tabIndex={0} aria-label="The ZINify copy center. Put the paper through to make a zine, then turn its pages with the arrow keys.">
      <canvas id="zcv" aria-hidden="true" />
      <div className="hits">
        <button className="hit" id="hit-paper" type="button" aria-label="The ZINify paper. Drag it onto the copier, or press Enter to make the zine." />
        <button className="hit" id="hit-prev" type="button" aria-label="Previous page" hidden />
        <button className="hit" id="hit-next" type="button" aria-label="Next page" hidden />
      </div>
    </div>
    <div className="zf-controls">
      <button type="button" className="primary" id="b-make">Make the zine</button>
      <button type="button" id="b-skip" hidden>Skip to the zine</button>
      <span className="zf-group"><button type="button" id="b-prev" hidden>Back</button><button type="button" id="b-next" hidden>Next page</button></span>
      <button type="button" id="b-copy" hidden>Copy the copy</button>
      <button type="button" id="b-unfold" hidden>Unfold the sheets</button>
      <button type="button" id="b-reset" hidden>Start over</button>
      <p className="zf-status" id="zstatus" aria-live="polite" />
    </div>
    <figcaption><b>Paper in, zine out.</b> The ZINify paper goes through the copy center and comes out as a zine about itself. The four steps follow the paper; the copier, the fold and the staples are ours, because ZINify’s output is a multi-page PDF. Then copy the copy, the way zines have always spread.</figcaption>
    <div className="visually-hidden">
      <p>The zine, page by page:</p>
      <ol>{PAGE_TEXT.map(text => <li key={text}>{text}</li>)}</ol>
    </div>
  </figure>;
}

export default function ZinifyEssay() {
  return <main id="main" className="shell">
    <Metadata title="ZINify — San Kala" description="ZINify turns research papers into zines with a large language model and a text-to-image model. Put its own paper through the copy center and flip the zine that comes out." path="/notes/zinify" type="article" image="/images/covers/zinify-social.jpg" />
    <header className="page-heading note-heading has-frontispiece">
      <div>
        <span className="eyebrow">UIST 2023 · Student Innovation Contest · Honorable Mention (People’s Choice)</span>
        <h1>ZINify</h1>
        <p>What if a research paper came out as a zine?</p>
        <p className="zf-byline"><a href="https://jaidevshriram.com/">Jaidev Shriram</a> &amp; San Kala · equal contribution · UIST ’23 Adjunct · <a href="https://dl.acm.org/doi/abs/10.1145/3586182.3625118">Paper</a> · <a href="https://jaidevshriram.com/zinify-uist/">Project page</a></p>
      </div>
      <div className="frontispiece"><Cover slug="zinify" title="ZINify: research to zines" priority sizes="(max-width: 760px) 120px, 200px" /></div>
    </header>

    <article className="essay-body">
      <div className="prose">
        <p>Research papers are written for people who already read research papers. In 2023, Jaidev and I asked what would happen if a paper came out as a zine instead: a few folded pages of short text and pictures, the format punk scenes and independent artists have always used to say things their own way.</p>
      </div>

      <CopyCenterFigure />

      <div className="prose">
        <h2>How it works</h2>
        <p>ZINify starts from the PDF. A large language model (we used Claude) condenses the paper into short sections and picks the figures worth keeping. Then it plans the zine: what goes on each page, and which ideas to tell differently. A dense equation might come back as a short poem. The plan also writes prompts for a text-to-image model, and the pipeline puts the words and pictures together. Authors can steer the plan along the way.</p>
        <h2>Why zines</h2>
        <p>Zines are self-published, printed in small runs and passed from hand to hand, which isn’t so different from posting a preprint. We thought the format could help a paper reach people who would never open the PDF, and give its authors a more personal way to talk about their work.</p>
        <p className="zf-foot">ZINify received an Honorable Mention (People’s Choice) in the UIST 2023 Student Innovation Contest. Read the <a href="https://dl.acm.org/doi/abs/10.1145/3586182.3625118">paper</a>, and see <a href="https://jaidevshriram.com/zinify-uist/">Jaidev Shriram’s project page</a>.</p>
        <div className="actions"><SiteLink className="text-link" href="/work?type=research">All research</SiteLink><SiteLink className="text-link" href="/work?type=writing">More writing</SiteLink></div>
        <LLMActions markdownUrl="/notes/zinify.md" className="mt-8" />
      </div>
    </article>
  </main>;
}
