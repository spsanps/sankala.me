import { useEffect, useRef } from 'react';
import Metadata from '../../../components/site/Metadata';
import { Action, SiteLink } from '../../../components/site/Elements';
import LLMActions from '../../../components/writing/LLMActions';
import Cover from '../../../components/art/covers/Cover';
import { loadEssayFonts } from '../../../components/art/essay-fonts';
import '../../../styles/site-pages.css';
import './power-quality.css';

// The 2019 power-quality paper, explained with a bench oscilloscope drawn in code.
// The scope's script is loaded only in the browser, after its typefaces, and cleans up on unmount.
function ScopeFigure() {
  const ref = useRef(null);
  useEffect(() => {
    let cleanup = null, cancelled = false;
    Promise.all([import('./components/scope.js'), loadEssayFonts(['ibm-plex-mono-500', 'ibm-plex-mono-600', 'ibm-plex-mono-700', 'caveat-600'])])
      .then(([module]) => { if (!cancelled && ref.current) cleanup = module.mountScope(ref.current); });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, []);
  return <figure className="pq-figure essay-figure" id="scope" ref={ref}>
    <div className="scope-stage">
      <canvas role="img" aria-label="An oscilloscope showing a 230 volt, 50 hertz waveform. Beneath the trace, a row of network cells reads it one cycle at a time, and a menu beside the screen shows how confident the network is about each kind of event." />
      <div className="scope-controls" />
    </div>
    <p id="scope-live" className="visually-hidden" aria-live="polite" />
    <figcaption><strong>An oscilloscope you can drive.</strong> The waveforms are synthetic 230 V, 50 Hz signals with textbook disturbances. The reader is a small stand-in that works one cycle at a time, and its memory and confidence bars are illustrative, not the paper’s model or results. Turn TIME/DIV to see more cycles; flicker only becomes clear across several. SINGLE draws a fresh example, and RUN/STOP freezes the screen.</figcaption>
  </figure>;
}

export default function PowerQualityEssay() {
  return <main id="main" className="shell">
    <Metadata title="Recognizing electrical disturbances with neural networks — San Kala" description="A 2019 paper on classifying power-quality events with LSTMs, explained with an oscilloscope you can drive." path="/notes/power-quality" type="article" image="/images/covers/power-quality-social.jpg" />
    <header className="page-heading note-heading has-frontispiece">
      <div>
        <span className="eyebrow">Research · 2019 · IEEE DISCOVER Best Paper Award</span>
        <h1>Recognizing electrical disturbances with neural networks</h1>
        <p className="pq-cite"><cite>Power Quality Event Classification Using Long Short-Term Memory Networks.</cite> S. K. G. Manikonda, J. Santhosh, S. P. Kumar Sreekala, S. Gangwani and D. N. Gaonkar. IEEE DISCOVER 2019. <strong>Best Paper Award</strong> · <a href="/documents/certificates/24_DISCOVER_BestPaper%20(2).pdf">Award certificate</a></p>
      </div>
      <div className="frontispiece"><Cover slug="power-quality" title="Power quality event classification with LSTMs" priority sizes="(max-width: 760px) 120px, 200px" /></div>
    </header>

    <article className="essay-body">
      <div className="prose">
        <p>The electricity in a wall socket is meant to be a clean wave. In India it rises and falls 50 times a second, the same way every time. Real grids are messier. A big motor starting nearby pulls the voltage down for a few cycles. Switching a capacitor bank leaves a spike that rings out. Rectifiers and chargers bend the wave out of shape. Engineers call these power-quality events.</p>
        <p>Each kind has different causes and different fixes, so the first job is naming what happened. Monitors record far more of the wave than anyone can read by eye, which is why it helps to classify events automatically.</p>
        <p>In 2019, at NIT Karnataka, we classified these events with long short-term memory networks (LSTMs). An LSTM reads a signal one step at a time and carries a memory forward. That lets it tell a dip lasting three cycles from a single spike, or from a slow flicker that only shows up across many cycles.</p>
        <p className="pq-lead-in">Try it below. Press a button beside the screen to inject an event, then watch a small network read the trace one cycle at a time.</p>
      </div>

      <ScopeFigure />

      <div className="prose">
        <p>Watch the notch. After the first bite the reader guesses a transient, then changes its mind as the bites keep coming. Watch the sag, too: it calls the wave normal until the dip arrives. That running memory is what a recurrent network brings to signals like these.</p>
        <div className="actions"><Action href="/work?type=research">All research</Action><SiteLink className="text-link" href="/work?type=writing">More writing</SiteLink></div>
        <LLMActions markdownUrl="/notes/power-quality.md" className="mt-8" />
      </div>
    </article>
  </main>;
}
