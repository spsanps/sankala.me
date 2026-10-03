import { useEffect, useRef } from 'react';
import { mountLoopFigure } from './figure-loop';
import { mountPileFigure } from './figure-pile';
import { mountScoresFigure } from './figure-scores';
import './hand-drawn-figures.css';

// Three-ink riso figures drawn in code (blue = the plan, pink = errors only,
// yellow = what passed). Each figure's canvas script owns its controls and
// returns a cleanup function, so React only provides the markup.
function useFigure(mount) {
  const ref = useRef(null);
  useEffect(() => mount(ref.current), [mount]);
  return ref;
}

export function LoopFigure() {
  const ref = useFigure(mountLoopFigure);
  return (
    <figure className="eai-fig" id="fig-loop" ref={ref}>
      <div className="eai-fig-sheet">
        <canvas id="loop" role="img" aria-label="The loop, drawn in code." />
        <div className="eai-fig-hits">
          <button className="eai-fig-hit" id="loop-hit1" type="button" aria-label="Open error log from try 1" hidden />
          <button className="eai-fig-hit" id="loop-hit2" type="button" aria-label="Open error log from try 2" hidden />
          <button className="eai-fig-hit eai-fig-cover" id="loop-close" type="button" aria-label="Close the error log" hidden />
        </div>
      </div>
      <div className="eai-fig-controls" role="group" aria-label="Step through the loop">
        <button id="loop-back" type="button">Back</button>
        <button id="loop-play" type="button" aria-pressed="false">Play</button>
        <button id="loop-next" type="button">Next step</button>
        <span className="eai-fig-spacer" />
        <span className="eai-fig-group">
          <button id="loop-tix1" type="button" aria-expanded="false" disabled>Error log 1</button>
          <button id="loop-tix2" type="button" aria-expanded="false" disabled>Error log 2</button>
        </span>
        <div className="eai-fig-scrub">
          <input id="loop-scrub" type="range" min="0" max="16" step="0.01" defaultValue="0" aria-label="Timeline of the three tries" />
          <div className="eai-fig-marks" aria-hidden="true">
            <span style={{ left: '1.9%' }}>Try 1</span>
            <span style={{ left: '39.4%' }}>Try 2</span>
            <span style={{ left: '70.6%' }}>Try 3</span>
          </div>
        </div>
        <p className="eai-fig-status" id="loop-status" />
        <p className="eai-fig-sr" id="loop-live" aria-live="polite" />
      </div>
      <figcaption>
        <b>The loop.</b> Step through the three tries or drag the timeline, and open each
        error log to read what the evaluator said and what changed in the plan. The task is made up
        for the figure; the two failures are the two kinds this write-up describes.
      </figcaption>
    </figure>
  );
}

export function PileFigure() {
  const ref = useFigure(mountPileFigure);
  return (
    <figure className="eai-fig" id="fig-pile" ref={ref}>
      <div className="eai-fig-sheet">
        <canvas id="pile" role="img" aria-label="Three tasks of different difficulty go through the loop. Every try leaves a card in the dataset: an error log, or the plan that finally passed. The hardest task leaves the tallest stack." />
        <div className="eai-fig-hits">
          <button className="eai-fig-hit" id="pile-hit1" type="button" aria-label="Run the task: turn on the lamp. It passes on the first try." />
          <button className="eai-fig-hit" id="pile-hit2" type="button" aria-label="Run the task: make coffee. It takes four tries." />
          <button className="eai-fig-hit" id="pile-hit3" type="button" aria-label="Run the task: clean up after dinner. It takes ten tries." />
        </div>
      </div>
      <div className="eai-fig-controls" role="group" aria-label="Run the tasks">
        <button id="pile-all" type="button">Run all three</button>
        <button id="pile-distill" type="button">Distill into the 0.6B model</button>
        <button id="pile-reset" type="button">Reset</button>
        <p className="eai-fig-sr" id="pile-live" aria-live="polite" />
      </div>
      <figcaption>
        <b>Hard tasks teach the most.</b> Every try leaves a card in the dataset, so a task that takes
        ten tries contributes ten times as much as one that passes first time. Tap a task to run it
        again, then distill the dataset into the small model. Tasks and try counts are illustrative.
      </figcaption>
    </figure>
  );
}

export function ScoresFigure() {
  const ref = useFigure(mountScoresFigure);
  return (
    <figure className="eai-fig" id="fig-scores" ref={ref}>
      <div className="eai-fig-sheet">
        <canvas id="scores" role="img" aria-label="Official BEHAVIOR scores, gpt-5-mini baseline against fine-tuned Qwen3-0.6B. Goal interpretation 78.6 and 99.6. Subgoal decomposition 50.0 and 97.0. Action sequencing 68.0 and 98.0. Transition modeling 80.0 and 99.5. Overall 90.09, against 84.32 for the second-place team." />
        <div className="eai-fig-hits">
          <button className="eai-fig-hit" id="scores-hit1" type="button" aria-label="Goal interpretation: baseline 78.6, ours 99.6" />
          <button className="eai-fig-hit" id="scores-hit2" type="button" aria-label="Subgoal decomposition: baseline 50.0, ours 97.0" />
          <button className="eai-fig-hit" id="scores-hit3" type="button" aria-label="Action sequencing: baseline 68.0, ours 98.0" />
          <button className="eai-fig-hit" id="scores-hit4" type="button" aria-label="Transition modeling: baseline 80.0, ours 99.5" />
        </div>
        <p className="eai-fig-sr" id="scores-live" aria-live="polite" />
      </div>
      <figcaption>
        Official BEHAVIOR scores. VirtualHome shows the same pattern with larger models; full tables
        in the report. Overall: 90.09, against 84.32 for the second-place team. Tap or hover a module
        to draw the gap.
      </figcaption>
    </figure>
  );
}
