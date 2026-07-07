---
title: "Winning by Overfitting"
author: San Kala & Chin Pradeep (Team AxisTilted2)
date: 2026-07
canonical: https://www.sankala.me/notes/eai-challenge
---

# Winning by Overfitting

**First place, NeurIPS 2025 Embodied Agent Interface Challenge**

*We closed a loop between a frontier model and a benchmark's own evaluator, and let it manufacture the training data that won the NeurIPS 2025 EAI challenge. The same recipe points somewhere useful for robotics.*

By [San Kala](https://www.sankala.me) & Chin Pradeep, Team AxisTilted2 - [Technical report](https://openreview.net/pdf?id=gABfrJI5ni) - [Slides](https://foundation-models-meet-embodied-agents.github.io/eai_challenge/slides/AxisTilted2.pdf) - [Challenge](https://foundation-models-meet-embodied-agents.github.io/eai_challenge/)

---

This year's favorite dismissal of AI agents is that they are "just an LLM in a while loop." It's meant as a deflation, but it points at something real: a loop is a search process, and a search process is only as good as the signal it climbs. At NeurIPS 2025, my brother Chin and I won the [Embodied Agent Interface challenge](https://neurips25-eai.github.io/) by giving that loop the strongest signal available: **the benchmark's own evaluator**.

The challenge measures how well language models plan household-robot tasks in two simulators, BEHAVIOR and VirtualHome. During the development phase, the official evaluator does more than score a submission — it explains precisely why a plan failed. We built our pipeline around that feedback: prompt a frontier model, evaluate its answer, feed the errors into the next attempt, and repeat. Every plan that survives the process becomes verified training data.

> **The loop:** prompt → model → candidate → evaluator. Failures send their error logs back into the next prompt; passing answers accumulate as gold data. Each pass either produces verified training data or a better error message.

The loop earns its keep because of *where* capable models fail. They produce plans a human would readily accept, and the simulator rejects them for omitting details no person would think to mention — the new identifier an object receives after being sliced, or an `OPEN` action that seems implied. Conventions like these are nearly impossible to anticipate in a prompt, but they are easy to learn from error logs, and the loop collects them automatically.

## Why this is a good idea

**The data makes itself.** There are no human labels anywhere in the pipeline. The loop converts inference calls into verified training examples, so the cost of data scales with compute rather than with annotator time.

**Hard tasks teach the most.** A task that takes ten attempts to pass contributes ten error logs. The dataset naturally over-samples whatever the model finds hardest, which is exactly the curriculum you would want to design by hand.

**Even the judge can be distilled.** The official evaluator is withheld during the test phase, so we trained a model to imitate its feedback and used that imitation to review our answers before submission. The loop keeps working after the oracle is gone.

## What it bought us

We distilled the loop's output into small Qwen3 models. On BEHAVIOR, every module we submitted was a 0.6-billion-parameter specialist, and every one of them outscored the frontier baseline:

| Module (BEHAVIOR) | gpt-5-mini baseline | Qwen3-0.6B fine-tuned (ours) |
| --- | --- | --- |
| Goal interpretation | 78.6 | 99.6 |
| Subgoal decomposition | 50.0 | 97.0 |
| Action sequencing | 68.0 | 98.0 |
| Transition modeling | 80.0 | 99.5 |

Official BEHAVIOR scores. VirtualHome shows the same pattern with larger models; full tables in the report. Overall: 90.09, against 84.32 for the second-place team.

## Why robotics should care

Robotics is unusually rich in the one ingredient this recipe needs. The field runs on simulators, and every simulator is a free evaluator: the goal state is reached or it is not, at zero labeling cost. Closing a loop between a frontier model and that signal turns any simulated environment into a training-data factory. "Overfitting to the simulator" is usually said with a wince, but here it is the point — the loop exhaustively learns whatever the environment actually rewards, without a single human label.

Our result also hints at where the bottleneck in embodied AI lives. Once the data existed, 0.6-billion-parameter models were enough to saturate the benchmark; the missing ingredient was data, not capacity. If frontier models are going to become the robot brains, as I argue in [GPT-7 Will Have Arms](https://www.sankala.me/essays/gpt7-will-have-arms), loops like this one are among the cheapest ways to manufacture the embodied training data they will need. Whether what the loop learns survives the jump from simulation to hardware is the natural next experiment.

---

Team AxisTilted2: [Chin Pradeep](https://chin.bio) (NYU Neuroinformatics Lab) and San Kala (independent); equal contribution. Full methods are in the [technical report](https://openreview.net/pdf?id=gABfrJI5ni) and [winners' presentation](https://foundation-models-meet-embodied-agents.github.io/eai_challenge/slides/AxisTilted2.pdf). The benchmark: [Embodied Agent Interface](https://neurips25-eai.github.io/).
