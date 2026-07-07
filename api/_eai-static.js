// Static article HTML for /notes/eai-challenge, served to crawlers by api/og.js.
// Kept in sync by hand with src/pages/EAIWriteup.jsx (the piece is short); the
// markdown mirror lives at public/notes/eai-challenge.md.
export const eaiArticleHtml = `
<p>Loop. Loop. Loop. If 2024 asked how big your model is and 2025 asked how long it can think, 2026 asks what your loop is closed around. "An LLM in a while loop" started as a dismissal and ended up a job title; there are loop-engineering manifestos now. Underneath the branding, a loop is a search process, and a search process is only as good as the signal it climbs. At NeurIPS 2025, months before the loop had a fan club, my brother Chin and I won the <a href="https://neurips25-eai.github.io/">Embodied Agent Interface challenge</a> by closing ours around the strongest signal available: <strong>the benchmark's own evaluator</strong>.</p>
<p>The challenge measures how well language models plan household-robot tasks in two simulators, BEHAVIOR and VirtualHome. During the development phase, the official evaluator does more than score a submission — it explains precisely why a plan failed. We built our pipeline around that feedback: prompt a frontier model, evaluate its answer, feed the errors into the next attempt, and repeat. Every plan that survives the process becomes verified training data.</p>
<figure><figcaption>The loop: prompt → model → candidate → evaluator. Failures send their error logs back into the next prompt; passing answers accumulate as gold data. Each pass either produces verified training data or a better error message.</figcaption></figure>
<p>The loop earns its keep because of <em>where</em> capable models fail. They produce plans a human would readily accept, and the simulator rejects them for omitting details no person would think to mention — the new identifier an object receives after being sliced, or an <code>OPEN</code> action that seems implied. Conventions like these are nearly impossible to anticipate in a prompt, but they are easy to learn from error logs, and the loop collects them automatically.</p>
<h2>Why this is a good idea</h2>
<p><strong>The data makes itself.</strong> There are no human labels anywhere in the pipeline. The loop converts inference calls into verified training examples, so the cost of data scales with compute rather than with annotator time.</p>
<p><strong>Hard tasks teach the most.</strong> A task that takes ten attempts to pass contributes ten error logs. The dataset naturally over-samples whatever the model finds hardest, which is exactly the curriculum you would want to design by hand.</p>
<p><strong>Even the judge can be distilled.</strong> The official evaluator is withheld during the test phase, so we trained a model to imitate its feedback and used that imitation to review our answers before submission. The loop keeps working after the oracle is gone.</p>
<h2>What it bought us</h2>
<p>We distilled the loop's output into small Qwen3 models. On BEHAVIOR, every module we submitted was a 0.6-billion-parameter specialist, and every one of them outscored the frontier baseline:</p>
<table>
<thead><tr><th>Module (BEHAVIOR)</th><th>gpt-5-mini baseline</th><th>Qwen3-0.6B fine-tuned (ours)</th></tr></thead>
<tbody>
<tr><td>Goal interpretation</td><td>78.6</td><td>99.6</td></tr>
<tr><td>Subgoal decomposition</td><td>50.0</td><td>97.0</td></tr>
<tr><td>Action sequencing</td><td>68.0</td><td>98.0</td></tr>
<tr><td>Transition modeling</td><td>80.0</td><td>99.5</td></tr>
</tbody>
</table>
<p>Official BEHAVIOR scores. VirtualHome shows the same pattern with larger models; full tables in the report. Overall: 90.09, against 84.32 for the second-place team.</p>
<h2>Why robotics should care</h2>
<p>Robotics is unusually rich in the one ingredient this recipe needs. The field runs on simulators, and every simulator is a free evaluator: the goal state is reached or it is not, at zero labeling cost. Closing a loop between a frontier model and that signal turns any simulated environment into a training-data factory. "Overfitting to the simulator" is usually said with a wince, but here it is the point — the loop exhaustively learns whatever the environment actually rewards, without a single human label.</p>
<p>The sharper lesson is where competence has to live. The model in our loop knew nothing special about robotics — it stumbled into BEHAVIOR's conventions attempt by attempt, because the evaluator could always say what was wrong. Machine learning has a name for the asymmetry that makes this work: <strong>the generator–verifier gap</strong>. Checking a plan is far easier than producing one, so a model too weak to write expert answers on demand can still search its way to them, as long as the verdict is real. This is the same <em>verifiable reward</em> the reasoning-model boom runs on — and robotics is the field where it comes free. If frontier models are going to become the robot brains, as I argue in <a href="https://www.sankala.me/essays/gpt7-will-have-arms">GPT-7 Will Have Arms</a>, they won't need to arrive knowing robotics. They need loops closed around real evaluators, and robotics has more of those than any other field in AI.</p>
<hr>
<p>Team AxisTilted2: <a href="https://chin.bio">Chin Pradeep</a> (NYU Neuroinformatics Lab) and San Kala (independent); equal contribution. Full methods are in the <a href="https://openreview.net/pdf?id=gABfrJI5ni">technical report</a> and <a href="https://foundation-models-meet-embodied-agents.github.io/eai_challenge/slides/AxisTilted2.pdf">winners' presentation</a>. The benchmark: <a href="https://neurips25-eai.github.io/">Embodied Agent Interface</a>.</p>
`;
