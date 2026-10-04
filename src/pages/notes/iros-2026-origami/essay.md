If you walked the halls of IROS 2026 in Pittsburgh this year, you’d think robotics had become one sentence: dexterous bimanual manipulation. Half the conference seemed to be robot arms, and the arms had hands: humanoids pouring drinks at the booths, teleoperation rigs with VR headsets, two-handed systems everywhere. Two hands that can do fine work are what everyone is chasing now.

I spent the conference with one of the hardest tests of that idea. The Robotic Origami Challenge asks a robot with two arms and two five-fingered hands to fold a flat sheet of paper into a paper plane, live, in front of judges from the Nippon Origami Association.

On September 30 my policy folded the first two stages, and I took second place. I entered on my own, as team AxisTilted2.

[video]

## The challenge

The task is a traditional Japanese paper plane, *kami hikōki*, from a 15 cm square of printed paper. The fold lines are printed on the sheet, and the robot has to make them: the two corner folds, the centre fold, then the wings. Each run gets 10 minutes. Each of the five stages scores 20 points if the robot does it cleanly, 10 if a person has to step in once, and 0 if it fails.

The robot is a pair of arms with [Sharpa](https://www.sharpa.com) hands, each fingertip carrying a six-axis touch sensor. It watches through three cameras: one on its head, one on each wrist. Teams learn from human demonstrations: a public dataset of people teleoperating the same robot, with video, joint positions and fingertip forces ([SharpaIT/Robotic_Origami_Challenge](https://huggingface.co/datasets/SharpaIT/Robotic_Origami_Challenge), CC BY 4.0). During the season you run your policy on the organizers’ robot remotely. For the finals, five teams brought theirs to Pittsburgh in person.

Paper is a nasty material for a robot. It’s thin, it slides, it springs back, and a fold only counts when the crease is pressed exactly where it should be. Most of the time both hands are touching it, so the touch sensors are always “on” and say little. And unlike a rigid object, every fold changes what the paper is.

## The result

Fifteen teams were on the scoring sheet. Five scored at all, and nobody finished the plane.

| Team | Stage 1 | Stage 2 | Stage 3 | Points |
|---|---|---|---|---|
| DUM-E | assisted | clean | clean | 50 |
| **AxisTilted2 (me)** | **clean** | **assisted** | – | **30** |
| TriDex (UC San Diego) | clean | assisted | – | 30 |
| ATeam | clean | – | – | 20 |
| PixelPaper | assisted | – | – | 10 |

The organizers announced AxisTilted2 as second. Two different versions of my model each folded two stages on the real robot: one in a test run on September 28, and the one I trained overnight, in the final.

## How I got there

**August: the big model.** My first instinct was scale. I fine-tuned a very large pretrained robot model on the demonstrations, on a rented 8×A100 machine. In the first remote test on the real robot, every run ended in a stop within seconds. The model wasn’t the problem. It was too slow for the robot, and the robot executed a few frames of each plan and then paused. Execution matters as much as the model.

**Early September: circles.** I spent ten days having agents build a high-fidelity paper simulator, so I could train with reinforcement learning. It produced no usable fold. On September 15 I told a fresh session, “I feel like I might be going a bit in circles. What I really want is some way to achieve this really quickly but also actually solve the task.” It told me the simulator wasn’t on the critical path. It was right.

**September 18: kami.** I brought in a small browser page I’d written myself, a fast paper simulation, and told the agent to be guided by it instead of the old checkpoints. Within a day it was a GPU simulator running a thousand sheets at once. In the end it never trained the competition model. Its real use was as a test bench: it caught the policy freezing and copying before I spent robot time on them. I’ve open-sourced it as [kami](https://github.com/spsanps/kami), a paper physics simulator.

**September 20: the policy.** I pushed for a different kind of model: small, fast, and generative instead of averaging. “Averaging is a mistake, I don’t think this is how modern robotic models do it.” The first version predicted the average of the demonstrations, and when the demonstrations disagreed, the average was to do nothing. It would hover over the sheet, frozen. The new design draws one plausible plan instead.

**September 24–26: the data.** Training the same small model on every robot and every frame in the dataset cut its error by 39%, and by 62% on the most recent recordings. A 3.6-billion-parameter touch-aware model, fine-tuned for the same task, was 37% worse on the same held-out moments and slower. (It saw far fewer samples than mine in the time I had, so this says what each could do with my budget, not that small always beats big.) Then I packed everything into a private repo and a handoff page so agents could keep working while I travelled.

**September 28: the night before the last test run.** Earlier that day, the model had folded two stages in a test run. I had a plan for a better one: the same model, fine-tuned on sharper 476-pixel camera images with the whole vision encoder unfrozen. But it was evening in Pittsburgh, the last test slot was the next morning, and I had honestly given up on it. Was I really going to start a training run now?

Then: no, I just need to do it. It’s 30 minutes, maybe an hour of my time. Otherwise it would keep tugging at the back of my head.

The plan was written with an agent at 8:20 pm. A rented H100 started at 8:57 and trained through the night, unattended. At 4:20 am the new model passed its check against the old one: 11.9 against 12.4 milliradians of error on held-out moments, a small but clear gain. On September 30 that model ran in the final.

## The model

[model]

Every plan answers one question: given what the robot sees and feels right now, what should each of its 65 joints do for the next two seconds?

- **See:** each of the three camera images goes through a shared DINOv2 vision encoder and becomes 32 tokens.
- **Feel:** each of the ten fingertips becomes one token, from its last 15 readings of force and torque. The model also predicts the touch to come, which forces it to pay attention to touch.
- **Know where it is:** one token for the current joint positions, and one for a clock, so it has a sense of how far into the fold it is.
- **Decide:** a small transformer mixes the 108 tokens. Then a flow-matching head starts from random noise and refines it in ten quick steps into a plan: 60 steps × 65 joints, two seconds at 30 Hz. It’s the same idea image generators use, applied to motion.
- **Stitch:** each new plan is built as a continuation of the part of the old plan already being executed, so the hands don’t jump between plans.

It has 62.3 million parameters, plans in about 85 ms on one GPU, and was trained only on the public dataset.

## What made the difference

None of the parts is new. The architecture is assembled from known ideas: ACT, Diffusion Policy, flow-matching action heads, real-time chunking. What worked was the boring discipline around it:

1. **More data beat a bigger model.** All the robots, all the frames.
2. **Sample a plan, don’t average one.** An average of different ways to fold is a way to not fold.
3. **Take away the crutches.** Given its own recent joint positions, my first policy leaned on them instead of watching the paper. Blanking that input changed its output by 17%. I removed it, along with motor torque, which leaked the answer.
4. **Touch is hard to use.** Removing touch changed the first policy’s output by about 1%. Fingertips press the paper in 61% of frames, so raw force says little. Giving each fingertip its own token, and predicting future touch, helped a little. Honestly, touch is still the most underused signal in the system.
5. **Stitch plans together.** Each new plan used to jump the hands by 148 milliradians. Building it as a continuation cut that to 6.
6. **Be fast.** About 85 ms per plan let the robot run the plan it was given.
7. **Watch the real thing.** Twice, agents told me the demonstrations fold the paper in the air. “No it doesn’t, you should probably look at some more videos.” The paper stays on the table: one hand pins, the other lifts a flap and presses the crease. You can delegate the work, but not the looking.

## Credits

- **Data:** the Robotic Origami Challenge fold-plane demonstrations ([SharpaIT on Hugging Face](https://huggingface.co/datasets/SharpaIT/Robotic_Origami_Challenge), 2026, CC BY 4.0). I resized frames and computed my own statistics; no endorsement implied.
- **Vision encoder:** [DINOv2](https://github.com/facebookresearch/dinov2) ViT-S/14 (Meta AI, Apache 2.0). **Tools:** [LeRobot](https://github.com/huggingface/lerobot) and PyTorch.
- **Ideas I built on:** ACT, Diffusion Policy, flow-matching action heads (π0) and real-time chunking (Physical Intelligence).
- **The challenge:** organized by BitRobot and FrodoBots with Sharpa, Lightwheel and the Nippon Origami Association, at IROS 2026. Thanks to Santiago Pravisani of BitRobot and the whole team for the robot time and a great event.
- **The agents:** I built this with Claude Code (Opus and Fable models, ending on Opus 5.5) as the main collaborator and Codex as a second reviewer: about 28 subagents across the project, on a local RTX 4090 and rented A100 and H100 machines. How I work with them is its own essay: *It’s just possible*
