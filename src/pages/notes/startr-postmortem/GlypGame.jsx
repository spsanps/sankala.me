import { useEffect, useRef } from 'react';
import { loadEssayFonts } from '../../../components/art/essay-fonts';
import './glyp-game.css';

// The figure for "Glyp: A Post-Mortem": The Startup Game, 2023 edition, a 1960s lithographed
// board game drawn in code. Every label is the essay's own words; the spinner is a sketch, not data.
// It goes in the essay just before the paragraph that starts with this text:
export const GAME_BEFORE = 'Later, [Rohan]';

export default function GlypGame() {
  const ref = useRef(null);
  useEffect(() => {
    let cleanup = null, cancelled = false;
    Promise.all([import('./game.js'), loadEssayFonts(['shrikhand-400', 'barlow-condensed-500', 'barlow-condensed-700', 'rokkitt-500-700'])])
      .then(([module]) => { if (!cancelled && ref.current) cleanup = module.mountGame(ref.current); });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, []);
  return <figure className="glyp-game essay-figure" id="game-figure" ref={ref}>
    <div className="glyp-board"><canvas id="game-canvas" role="img" aria-label="The Startup Game, 2023 edition: a board game. Glyp's car circles a loop of feature squares while Sudowrite and Jenni AI drive straight down the Niche Lane to the readers." /></div>
    <div className="glyp-controls" role="group" aria-label="Game controls">
      <button type="button" id="btn-spin">Spin</button>
      <button type="button" id="btn-flip" aria-disabled="true">Flip the spinner</button>
      <span className="glyp-spacer" />
      <button type="button" id="btn-reset">Play again</button>
    </div>
    <p className="glyp-status" id="game-status" aria-live="polite" />
    <figcaption><strong>The Startup Game, 2023 edition.</strong> Glyp’s spinner was almost all features. Each spin moves Glyp round the Feature Loop and adds a peg to the car, while Sudowrite and Jenni AI drive one square closer to the readers. A sketch of the essay’s argument, not data.</figcaption>
    <div className="visually-hidden">
      <p>The cards in the game:</p>
      <ol>
        <li>Chance: Wrong medium, wrong form factor. For B2C, the momentum was in mobile apps like Cal AI, while I was still building for the web. Back to the loop.</li>
        <li>Chance: No real conviction, no committed path forward. I also wasn’t really in founder mode. Go back 2 spaces.</li>
        <li>Chance: Competitors had already established themselves. Sudowrite and Jenni AI picked specific niches and stuck with them.</li>
        <li>Pivot: Glyp Podcasts. Same fundamental problems though—too late, poorly executed, no real conviction behind the pivot.</li>
        <li>Lesson: Distribution matters way more than features. This sounds obvious when you say it, but you don’t really internalize it until you’ve built something nobody finds.</li>
      </ol>
    </div>
  </figure>;
}
