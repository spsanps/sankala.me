import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import LLMActions from '../../../components/writing/LLMActions';
import Cover from '../../../components/art/covers/Cover';
import { LoopFigure, PileFigure, ScoresFigure } from './components/HandDrawnFigures';

const WHY = [
  {
    label: 'The data makes itself',
    text: 'There are no human labels anywhere in the pipeline. The loop converts inference calls into verified training examples, so the cost of data scales with compute rather than with annotator time.',
  },
  {
    label: 'Hard tasks teach the most',
    text: 'A task that takes ten attempts to pass contributes ten error logs. The dataset naturally over-samples whatever the model finds hardest, which is exactly the curriculum you would want to design by hand.',
  },
  {
    label: 'Even the judge can be distilled',
    text: 'The official evaluator is withheld during the test phase, so we trained a model to imitate its feedback and used that imitation to review our answers before submission. The loop keeps working after the oracle is gone.',
  },
];

export default function EAIWriteup() {
  return (
    <div className="eai-page">
      <Helmet>
        <title>Winning by Overfitting — San Kala</title>
        <link rel="canonical" href="https://www.sankala.me/notes/eai-challenge" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Winning by Overfitting — San Kala" />
        <meta property="og:description" content="How an LLM in a loop with a benchmark’s own evaluator won the NeurIPS 2025 EAI Challenge." />
        <meta property="og:url" content="https://www.sankala.me/notes/eai-challenge" />
        <meta property="og:image" content="https://www.sankala.me/images/covers/eai-challenge-social.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Winning by Overfitting — San Kala" />
        <meta name="twitter:description" content="How an LLM in a loop with a benchmark’s own evaluator won the NeurIPS 2025 EAI Challenge." />
        <meta name="twitter:image" content="https://www.sankala.me/images/covers/eai-challenge-social.jpg" />
        <meta name="description" content="We won the NeurIPS 2025 Embodied Agent Interface Challenge by putting an LLM in a loop with the benchmark's own evaluator. The loop manufactures its own training data — and the recipe matters for robotics." />
      </Helmet>

      <style>{`
        .eai-page {
          background: #F5F2EB;
          color: #1A1A1A;
          min-height: 100vh;
          padding: 96px 20px 120px;
        }
        .eai-column { max-width: 640px; margin: 0 auto; }

        .eai-back {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          color: #1A1A1A; opacity: 0.55; text-decoration: none; margin-bottom: 56px;
        }
        .eai-back:hover { opacity: 1; text-decoration: underline; }

        .eai-eyebrow {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #1A1A1A; opacity: 0.6; margin-bottom: 28px;
        }
        .eai-chip {
          background: #FBD45B; color: #1A1A1A; padding: 3px 8px; border-radius: 3px;
          margin-left: 6px; white-space: nowrap;
        }
        .eai-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
        .eai-title-row .eai-title { margin: 0; }
        .eai-frontispiece { flex: 0 0 112px; width: 112px; }
        @media (max-width: 520px) { .eai-frontispiece { flex-basis: 76px; width: 76px; } }
        .eai-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(40px, 7vw, 58px); line-height: 1.05; font-weight: 700;
          letter-spacing: -0.01em; margin: 0 0 20px;
        }
        .eai-deck {
          font-family: Georgia, serif; font-size: 21px; line-height: 1.5;
          color: #1A1A1A; opacity: 0.85; font-style: italic; margin: 0 0 28px;
        }
        .eai-byline {
          font-family: 'Monaco', 'Menlo', monospace; font-size: 11px;
          letter-spacing: 0.08em; text-transform: uppercase; color: #1A1A1A; opacity: 0.6;
          padding-bottom: 40px; border-bottom: 1px solid rgba(26,26,26,0.15);
          margin-bottom: 56px;
        }
        .eai-byline a { color: inherit; text-decoration: underline; text-decoration-color: #FBD45B; text-decoration-thickness: 2px; text-underline-offset: 3px; }
        .eai-byline a:hover { background: #FBD45B; }

        .eai-page p {
          font-family: Georgia, serif; font-size: 19px; line-height: 1.65;
          margin: 0 0 24px;
        }
        .eai-page h2 {
          font-family: 'Fraunces', serif; font-size: 27px; font-weight: 600;
          margin: 60px 0 20px;
        }
        .eai-page mark {
          background: #FBD45B; color: #1A1A1A; padding: 1px 3px;
        }
        .eai-page .eai-body-link {
          color: #1A1A1A; text-decoration: underline;
          text-decoration-color: #FBD45B; text-decoration-thickness: 2px;
          text-underline-offset: 3px;
        }
        .eai-page .eai-body-link:hover { background: #FBD45B; }
        .eai-mono { font-family: 'Monaco', 'Menlo', monospace; font-size: 0.85em; }

        /* why-it-works list */
        .eai-why { margin: 32px 0 8px; padding: 0; list-style: none; }
        .eai-why li { margin-bottom: 26px; }
        .eai-why-label {
          font-family: 'Monaco', 'Menlo', monospace; font-size: 12px;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: #FBD45B; color: #1A1A1A; padding: 2px 6px; border-radius: 2px;
          display: inline-block; margin-bottom: 8px;
        }
        .eai-why p { margin: 0; }

        .eai-foot {
          font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6;
          color: rgba(26,26,26,0.6); border-top: 1px solid rgba(26,26,26,0.15);
          padding-top: 24px; margin-top: 64px;
        }
        .eai-foot a {
          color: #1A1A1A; text-decoration: underline;
          text-decoration-color: #FBD45B; text-decoration-thickness: 2px;
          text-underline-offset: 3px;
        }
        .eai-foot a:hover { background: #FBD45B; }
      `}</style>

      <div className="eai-column">
        <Link to="/writing" className="eai-back">
          <ArrowLeft size={16} /> Back to Writing
        </Link>

        <header>
          <div className="eai-eyebrow">
            NeurIPS 2025 · Embodied Agent Interface Challenge
            <span className="eai-chip">First place</span>
          </div>
          <div className="eai-title-row"><h1 className="eai-title">Winning by Overfitting</h1><span className="eai-frontispiece"><Cover slug="eai-challenge" title="Winning by Overfitting" priority sizes="112px" /></span></div>
          <p className="eai-deck">
            We closed a loop between a frontier model and a benchmark's own evaluator,
            and let it manufacture the training data that won the NeurIPS 2025 EAI
            Challenge. The same recipe points somewhere useful for robotics.
          </p>
          <div className="eai-byline">
            San Kala &amp; Chin Pradeep · Team AxisTilted2 ·{' '}
            <a href="https://openreview.net/pdf?id=gABfrJI5ni" target="_blank" rel="noopener noreferrer">Report</a>{' · '}
            <a href="https://foundation-models-meet-embodied-agents.github.io/eai_challenge/slides/AxisTilted2.pdf" target="_blank" rel="noopener noreferrer">Slides</a>{' · '}
            <a href="https://foundation-models-meet-embodied-agents.github.io/eai_challenge/" target="_blank" rel="noopener noreferrer">Challenge</a>
          </div>
        </header>

        <p>
          Loop. Loop. Loop. If 2024 asked how big your model is and 2025 asked how
          long it can think, 2026 asks what your loop is closed around. "An LLM in a
          while loop" started as a dismissal and ended up a job title; there are
          loop-engineering manifestos now. Underneath the branding, a loop is a search
          process, and a search process is only as good as the signal it climbs. At
          NeurIPS 2025, months before the loop had a fan club,{' '}
          <a className="eai-body-link" href="https://chin.bio" target="_blank" rel="noopener noreferrer">Chin</a> and I
          won the{' '}
          <a className="eai-body-link" href="https://neurips25-eai.github.io/" target="_blank" rel="noopener noreferrer">Embodied Agent Interface Challenge</a>{' '}
          by closing ours around the strongest signal available:{' '}
          <strong>the benchmark's own evaluator</strong>.
        </p>
        <p>
          The challenge measures how well language models plan household-robot tasks in
          two simulators, BEHAVIOR and VirtualHome. During the development phase, the
          official evaluator does more than score a submission — it explains precisely
          why a plan failed. We built our pipeline around that feedback: prompt a
          frontier model, evaluate its answer, feed the errors into the next attempt,
          and repeat. Every plan that survives the process becomes verified training
          data.
        </p>

        <LoopFigure />

        <p>
          The loop earns its keep because of <em>where</em> capable models fail. They
          produce plans a human would readily accept, and the simulator rejects them for
          omitting details no person would think to mention — the new identifier an
          object receives after being sliced, or an <span className="eai-mono">OPEN</span>{' '}
          action that seems implied. Conventions like these are nearly impossible to
          anticipate in a prompt, but they are easy to learn from error logs, and the
          loop collects them automatically.
        </p>

        <h2>Why this is a good idea</h2>
        <ul className="eai-why">
          {WHY.map(w => (
            <li key={w.label}>
              <span className="eai-why-label">{w.label}</span>
              <p>{w.text}</p>
            </li>
          ))}
        </ul>

        <PileFigure />

        <h2>What it bought us</h2>
        <p>
          We distilled the loop's output into small Qwen3 models. On BEHAVIOR, every
          module we submitted was a 0.6-billion-parameter specialist, and every one of
          them outscored the frontier baseline:
        </p>
        <ScoresFigure />

        <h2>Why robotics should care</h2>
        <p>
          Robotics is unusually rich in the one ingredient this recipe needs. The field
          runs on simulators, and every simulator is a free evaluator: the goal state is
          reached or it is not, at zero labeling cost.{' '}
          <mark>Closing a loop between a frontier model and that signal turns any
          simulated environment into a training-data factory.</mark>{' '}
          "Overfitting to the simulator" is usually said with a wince, but here it is
          the point — the loop exhaustively learns whatever the environment actually
          rewards, without a single human label.
        </p>
        <p>
          The sharper lesson is about where the competence has to live: in the evaluator, not the model. The model in our loop
          knew nothing special about robotics — it stumbled into BEHAVIOR's
          conventions attempt by attempt, because the evaluator could always say what
          was wrong. Machine learning has a name for the asymmetry that makes this
          work: <strong>the generator–verifier gap</strong>. Checking a plan is far
          easier than producing one, so a model too weak to write expert answers on
          demand can still search its way to them, as long as the verdict is real.
          This is the same <em>verifiable reward</em> the reasoning-model boom runs
          on — and robotics is the field where it comes free. If frontier models are
          going to become the robot brains, as I argue in{' '}
          <Link className="eai-body-link" to="/essays/gpt7-will-have-arms">GPT-7 Will Have Arms</Link>,
          they won't need to arrive knowing robotics. They need loops closed around
          real evaluators, and robotics has more of those than any other field in AI.
        </p>

        <div className="eai-foot">
          Team AxisTilted2:{' '}
          <a href="https://chin.bio" target="_blank" rel="noopener noreferrer">Chin Pradeep</a>{' '}
          (NYU Neuroinformatics Lab) and San Kala
          (independent); equal contribution. Full methods are in the{' '}
          <a href="https://openreview.net/pdf?id=gABfrJI5ni" target="_blank" rel="noopener noreferrer">technical report</a>{' '}
          and{' '}
          <a href="https://foundation-models-meet-embodied-agents.github.io/eai_challenge/slides/AxisTilted2.pdf" target="_blank" rel="noopener noreferrer">winners' presentation</a>.
          The benchmark: <a href="https://neurips25-eai.github.io/" target="_blank" rel="noopener noreferrer">Embodied Agent Interface</a>.
        </div>
        <div className="mt-8"><Link to="/writing" className="eai-body-link">More writing by San Kala →</Link></div>
        <LLMActions markdownUrl="/notes/eai-challenge.md" className="mt-6" />
      </div>
    </div>
  );
}
