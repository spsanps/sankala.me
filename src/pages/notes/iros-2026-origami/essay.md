If you walked the halls of IROS 2026 in Pittsburgh this year, you’d think robotics had become one sentence: dexterous bimanual manipulation. Half the conference was about robot hands: humanoids pouring drinks at the booths, teleoperation rigs with VR headsets, two-handed systems everywhere. Two hands that can do fine work are what everyone is chasing now.

I spent the conference with one of the hardest tests of that idea. The Robotic Origami Challenge asks a robot with two arms and two five-fingered hands to fold a flat sheet of paper into a paper plane, live.

On September 30 my policy folded the first two stages, and I took second place. I entered on my own, as team AxisTilted2.

[video]

## The challenge

The task is a traditional Japanese paper plane, *kami hikōki*, from a 15 cm square of printed paper. The fold lines are printed on the sheet, and the robot has to make them: the two corner folds, the centre fold, then the wings. Each run gets 10 minutes. Each of the five stages scores 20 points if the robot does it cleanly, 10 if a person has to step in once, and 0 if it fails.

The robot is a pair of arms with [Sharpa](https://www.sharpa.com) hands, and their touch is the best part: each fingertip senses force finely, in six directions, not just whether it’s touching or not. It watches through three cameras: one on its head, one on each wrist. Teams learn from human demonstrations: a public dataset of people teleoperating the same robot, with video, joint positions and fingertip forces ([SharpaIT/Robotic_Origami_Challenge](https://huggingface.co/datasets/SharpaIT/Robotic_Origami_Challenge), CC BY 4.0). During the season you run your policy on the organizers’ robot remotely. For the finals, five teams brought theirs to Pittsburgh in person.

Paper is a nasty material for a robot. Even lifting a corner, something we do without thinking, is hard: the people in the demonstrations press or pinch the other side so the corner rises a little, then slide a fingertip under it. Paper is thin, it slides, it springs back, and a fold only counts when the crease is pressed exactly where it should be. And unlike a rigid object, every fold changes what the paper is.

[lift]

## The result

Fifteen teams were on the scoring sheet. Five scored at all, and nobody finished the plane.

| Team | Stage 1 | Stage 2 | Stage 3 | Points |
|---|---|---|---|---|
| DUM-E | assisted | clean | clean | 50 |
| **AxisTilted2 (me)** | **clean** | **assisted** | – | **30** |
| TriDex (UC San Diego) | clean | assisted | – | 30 |
| ATeam | clean | – | – | 20 |
| PixelPaper | assisted | – | – | 10 |

[folds]

The organizers announced AxisTilted2 as second.

## How I got there

**The big model.** My first instinct was scale. I fine-tuned a very large pretrained robot model on the demonstrations, on a rented 8×A100 machine. The first remote test on the real robot didn’t go well, and the problem wasn’t the model: it was the timing between the model and the robot. Execution matters as much as the model.

**Circles.** I spent about ten days having agents build a high-fidelity paper simulator, so I could train with reinforcement learning. It produced no usable fold. Eventually I told a fresh session, “I feel like I might be going a bit in circles. What I really want is some way to achieve this really quickly but also actually solve the task.” It told me the simulator wasn’t on the critical path. It was right.

**kami.** I brought in a small browser page I’d written myself, a fast paper simulation, and told the agent to be guided by it instead of the old checkpoints. Within a day it was a GPU simulator running a thousand sheets at once. In the end it never trained the competition model. Its real use was as a test bench: it caught the policy freezing and copying before I spent robot time on them. I’ve open-sourced it as [kami](https://github.com/spsanps/kami), a paper physics simulator.

**The policy.** My first policy was an ACT-style transformer, trained by behavior cloning with an L1 loss on action chunks. A regression loss averages across modes: where demonstrators folded in different ways, the mean action was close to standing still, and in closed-loop tests the hands hovered over the sheet. I replaced the regression head with a small, fast flow-matching action head, which samples one mode instead of averaging them.

**The data.** Training the same small model on every robot and every frame in the dataset cut its error by 39%, and by 62% on the most recent recordings. A 3.6-billion-parameter touch-aware model, fine-tuned for the same task, was 37% worse on the same held-out moments and slower. (It saw far fewer samples than mine in the time I had, so this says what each could do with my budget, not that small always beats big.)

**The night before the last test run.** The data suggested the policy would do better with sharper camera images: 476 pixels instead of 224, with the whole vision encoder free to learn. But it was evening in Pittsburgh, the last test slot was the next morning, and I had honestly given up on it. Was I really going to start a training run now?

Then: no, I just need to do it. It’s 30 minutes, maybe an hour of my time. Otherwise it would keep tugging at the back of my head.

The plan was written with an agent at 8:20 pm. A rented H100 started at 8:57 and trained through the night, unattended. At 4:20 am it passed its checks. On September 30 that model ran in the final. That night is a big part of why I wrote [It’s just possible](/notes/its-just-possible), about how I work with AI agents and why I don’t stop.

## The model

[model]

Every action chunk answers one question: given what the robot sees and feels right now, what should each of its 65 joints do for the next two seconds?

- **See:** the three camera views (head and both wrists) go through a shared DINOv2 ViT-S/14 encoder, pooled to 32 tokens per view.
- **Feel:** each of the ten fingertips becomes one token, from its last 15 six-axis force–torque readings. Touch is never dropped during training, and an auxiliary head predicts future contact, which gives the touch pathway its own training signal. It works: the policy really relies on touch (more on that below).
- **Proprioception and progress:** one token for the current joint positions, and one for an episode clock, so the policy knows how far into the fold it is.
- **Act:** a two-layer context transformer mixes the 108 tokens. A six-block DiT action head then generates an action chunk of 60 steps × 65 joints (two seconds at 30 Hz) by rectified flow: ten Euler steps from noise shaped like real action chunks. It’s the same idea image generators use, applied to motion.
- **Real-time chunking:** each new chunk is conditioned on the prefix of the previous chunk that is still being executed (trained by inpainting that prefix), so consecutive chunks join without a jump.

It has 62.3 million parameters, generates a chunk in about 85 ms on one GPU, and was trained only on the public dataset.

## What made the difference

None of the parts is new. The architecture is assembled from known ideas: ACT, Diffusion Policy, flow-matching action heads, real-time chunking. What worked was the boring discipline around it:

1. **More data beat a bigger model.** All the robots, all the frames.
2. **A generative head, not regression.** With multimodal demonstrations, an L1 head averages the modes, and an average of different ways to fold is a way to not fold. A flow-matching head samples one.
3. **Watch for the copycat problem.** Given its own proprioceptive history, my first policy leaned on it instead of watching the paper, a form of causal confusion: blanking that input changed its output by 17%. I removed joint history, along with motor torque, which leaked the action label.
4. **It actually uses touch.** A common finding with touch-aware policies is that they learn to ignore touch: the 3.6-billion-parameter tactile model I compared against barely reacted when its touch input was zeroed, and my own first policy, trained with touch dropout, changed its output by only about 1% without it. The flow policy is different. It never drops touch, it predicts future contact, and it relies on what it feels: in closed-loop runs in my paper simulator, removing touch dropped its crease score from 0.51 to 0.31, and at the moment of contact it raised its error by about 5%. These are simulator and offline tests, not robot ablations, but the signal is clear. Sharpa’s fine fingertip sensing is exactly what folding needs, and pushing that further is where I’d go next.
5. **Real-time chunking.** Without it, each new chunk jumped the hands by 148 milliradians at the seam. Conditioning on the executing prefix cut that to 6.
6. **Latency is part of the policy.** About 85 ms per chunk let the robot execute the actions it was given.
7. **Watch the real thing.** Twice, agents told me the demonstrations fold the paper in the air. “No it doesn’t, you should probably look at some more videos.” The paper stays on the table: one hand pins, the other lifts a flap and presses the crease. You can delegate the work, but not the looking.

## References and credits

**Data and hardware**

- Sharpa. *Robotic Origami Challenge: fold-plane demonstrations* (LeRobot format). [Hugging Face](https://huggingface.co/datasets/SharpaIT/Robotic_Origami_Challenge), 2026. CC BY 4.0. Licensed CC BY 4.0. Changes: I resized the frames and computed my own normalisation statistics. This work isn’t endorsed by Sharpa.
- The robot: bimanual arms with [Sharpa](https://www.sharpa.com) hands and fingertip touch sensing.

**Methods I built on**

- Zhao, Kumar, Levine and Finn. *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (ACT). RSS 2023. [arXiv:2304.13705](https://arxiv.org/abs/2304.13705)
- Chi et al. *Diffusion Policy: Visuomotor Policy Learning via Action Diffusion.* RSS 2023. [arXiv:2303.04137](https://arxiv.org/abs/2303.04137)
- Black et al. *π0: A Vision-Language-Action Flow Model for General Robot Control.* 2024. [arXiv:2410.24164](https://arxiv.org/abs/2410.24164)
- Black, Galliker and Levine. *Real-Time Execution of Action Chunking Flow Policies* (real-time chunking). 2025. [arXiv:2506.07339](https://arxiv.org/abs/2506.07339)
- Liu, Gong and Liu. *Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow.* ICLR 2023. [arXiv:2209.03003](https://arxiv.org/abs/2209.03003)
- Peebles and Xie. *Scalable Diffusion Models with Transformers* (DiT). ICCV 2023. [arXiv:2212.09748](https://arxiv.org/abs/2212.09748)
- Oquab et al. *DINOv2: Learning Robust Visual Features without Supervision.* 2023. [arXiv:2304.07193](https://arxiv.org/abs/2304.07193). I used the ViT-S/14 model ([code](https://github.com/facebookresearch/dinov2), Apache 2.0).
- TRI LBM Team. *A Careful Examination of Large Behavior Models for Multitask Dexterous Manipulation.* 2025. [arXiv:2507.05331](https://arxiv.org/abs/2507.05331). The source of the lower learning rate for the vision encoder.

**Problems I ran into, and where they’re described**

- The copycat problem, a policy leaning on its own past actions: Wen et al., *Fighting Copycat Agents in Behavioral Cloning from Observation Histories*, NeurIPS 2020, [arXiv:2010.14876](https://arxiv.org/abs/2010.14876); de Haan, Jayaraman and Levine, *Causal Confusion in Imitation Learning*, NeurIPS 2019, [arXiv:1905.11979](https://arxiv.org/abs/1905.11979).
- The large touch-aware model I compared against: FTP-1 ([arXiv:2606.13102](https://arxiv.org/abs/2606.13102)), built on π0.5 ([arXiv:2504.16054](https://arxiv.org/abs/2504.16054)).

**Software**

- [LeRobot](https://github.com/huggingface/lerobot) (Apache 2.0), [PyTorch](https://pytorch.org), and for kami, [NVIDIA Warp](https://github.com/NVIDIA/warp).
- [kami](https://github.com/spsanps/kami), my paper simulator (MIT).

**The challenge and the people**

- The [Robotic Origami Challenge](https://robotic-origami-challenge.github.io/) at IROS 2026, organized by BitRobot and FrodoBots with Sharpa, Lightwheel and the Nippon Origami Association. Thanks to Santiago Pravisani of BitRobot and the whole team for the robot time and a great event.
- **The agents:** I built this with Claude Code (Opus and Fable models, ending on Opus 5.5) as the main collaborator and Codex as a second reviewer: about 28 subagents across the project, on a local RTX 4090 and rented A100 and H100 machines. How I work with them is its own essay: [It’s just possible →](/notes/its-just-possible)
