---
title: "Winning by Overfitting"
author: San Kala & Chin Pradeep (Team AxisTilted2)
date: 2026-07
canonical: https://www.sankala.me/notes/eai-challenge
---

# Winning by Overfitting

**First place, NeurIPS 2025 Embodied Agent Interface Challenge**

*We closed a loop between a frontier model and a benchmark's own evaluator, and let it manufacture the training data that won the NeurIPS 2025 EAI Challenge. The same recipe points somewhere useful for robotics.*

By [San Kala](https://www.sankala.me) & Chin Pradeep, Team AxisTilted2 - [Technical report](https://openreview.net/pdf?id=gABfrJI5ni) - [Slides](https://foundation-models-meet-embodied-agents.github.io/eai_challenge/slides/AxisTilted2.pdf) - [Challenge](https://foundation-models-meet-embodied-agents.github.io/eai_challenge/)

---

Loop. Loop. Loop. If 2024 asked how big your model is and 2025 asked how long it can think, 2026 asks what your loop is closed around. "An LLM in a while loop" started as a dismissal and ended up a job title; there are loop-engineering manifestos now. Underneath the branding, a loop is a search process, and a search process is only as good as the signal it climbs. At NeurIPS 2025, months before the loop had a fan club, [Chin](https://chin.bio) and I won the [Embodied Agent Interface Challenge](https://neurips25-eai.github.io/) by closing ours around the strongest signal available: **the benchmark's own evaluator**.

The challenge measures how well language models plan household-robot tasks in two simulators, BEHAVIOR and VirtualHome. During the development phase, the official evaluator does more than score a submission — it explains precisely why a plan failed. We built our pipeline around that feedback: prompt a frontier model, evaluate its answer, feed the errors into the next attempt, and repeat. Every plan that survives the process becomes verified training data.

> **Figure 1. The loop, by hand.** An interactive hand-drawn figure in three tries. A frontier model writes a plan for a task made up for the figure (put a sliced apple in the fridge), and the evaluator runs it in a small simulated kitchen. Try 1 fails: the error log says the fridge is closed, so the next plan adds step 3, OPEN FRIDGE. Try 2 fails: the error log says 'apple' no longer exists, because a sliced object gets a new name, so the plan changes APPLE to SLICES. Try 3 passes, and the plan and both error logs go into the gold data that later trains the small 0.6B model. The two failures are the two kinds described above.

The loop earns its keep because of *where* capable models fail. They produce plans a human would readily accept, and the simulator rejects them for omitting details no person would think to mention — the new identifier an object receives after being sliced, or an `OPEN` action that seems implied. Conventions like these are nearly impossible to anticipate in a prompt, but they are easy to learn from error logs, and the loop collects them automatically.

## Why this is a good idea

**The data makes itself.** There are no human labels anywhere in the pipeline. The loop converts inference calls into verified training examples, so the cost of data scales with compute rather than with annotator time.

**Hard tasks teach the most.** A task that takes ten attempts to pass contributes ten error logs. The dataset naturally over-samples whatever the model finds hardest, which is exactly the curriculum you would want to design by hand.

**Even the judge can be distilled.** The official evaluator is withheld during the test phase, so we trained a model to imitate its feedback and used that imitation to review our answers before submission. The loop keeps working after the oracle is gone.

> **Figure 2. Hard tasks teach the most.** An interactive hand-drawn figure with three illustrative tasks: turn on the lamp passes on the first try, make coffee takes four tries, and clean up after dinner takes ten. Every try leaves a card in the dataset, either an error log or the plan that finally passed, so the stacks hold one, four and ten cards. Distilling copies all fifteen cards into the 0.6B model, which becomes a specialist; no human labels are involved. Tasks and try counts are illustrative.

## What it bought us

We distilled the loop's output into small Qwen3 models. On BEHAVIOR, every module we submitted was a 0.6-billion-parameter specialist, and every one of them outscored the frontier baseline:

**Figure 3. Official BEHAVIOR scores.** The page draws these scores by hand; the reader picks a module to see the gap.

| Module (BEHAVIOR) | gpt-5-mini baseline | Qwen3-0.6B fine-tuned (ours) | Gain |
| --- | --- | --- | --- |
| Goal interpretation | 78.6 | 99.6 | +21.0 |
| Subgoal decomposition | 50.0 | 97.0 | +47.0 |
| Action sequencing | 68.0 | 98.0 | +30.0 |
| Transition modeling | 80.0 | 99.5 | +19.5 |

Official BEHAVIOR scores. VirtualHome shows the same pattern with larger models; full tables in the report. Overall: 90.09, against 84.32 for the second-place team.

## Why robotics should care

Robotics is unusually rich in the one ingredient this recipe needs. The field runs on simulators, and every simulator is a free evaluator: the goal state is reached or it is not, at zero labeling cost. Closing a loop between a frontier model and that signal turns any simulated environment into a training-data factory. "Overfitting to the simulator" is usually said with a wince, but here it is the point — the loop exhaustively learns whatever the environment actually rewards, without a single human label.

The sharper lesson is about where the competence has to live: in the evaluator, not the model. The model in our loop knew nothing special about robotics — it stumbled into BEHAVIOR's conventions attempt by attempt, because the evaluator could always say what was wrong. Machine learning has a name for the asymmetry that makes this work: **the generator–verifier gap**. Checking a plan is far easier than producing one, so a model too weak to write expert answers on demand can still search its way to them, as long as the verdict is real. This is the same *verifiable reward* the reasoning-model boom runs on — and robotics is the field where it comes free. If frontier models are going to become the robot brains, as I argue in [GPT-7 Will Have Arms](https://www.sankala.me/essays/gpt7-will-have-arms), they won't need to arrive knowing robotics. They need loops closed around real evaluators, and robotics has more of those than any other field in AI.

---

Team AxisTilted2: [Chin Pradeep](https://chin.bio) (NYU Neuroinformatics Lab) and San Kala (independent); equal contribution. Full methods are in the [technical report](https://openreview.net/pdf?id=gABfrJI5ni) and [winners' presentation](https://foundation-models-meet-embodied-agents.github.io/eai_challenge/slides/AxisTilted2.pdf). The benchmark: [Embodied Agent Interface](https://neurips25-eai.github.io/).
