---
title: It's just possible
subtitle: How I steered a fleet of AI agents to #1 on both tracks of a NeurIPS competition while flying to IROS, and what I think has changed about competitive ML.
author: San Kala
date: October 2026
---

On Sunday, September 27, at 14:00 UTC, my agents reported where we stood: 9th on Track 1 and 5th on Track 2 of the NeurIPS 2026 RealPDE competition, both about 0.26 points behind first. The development phase closed at midnight.

By 18:10 we were #1 on both.

My part that weekend wasn't code. I was on my way to IROS in Pittsburgh, steering one long Claude Code session remotely, partly over airplane wifi. That session ran a fleet of Opus 5.5 agents across 17 rented GPUs.

The same month I took second place at the IROS Robotic Origami Challenge with a model I nearly didn't train, and fifth of 131 teams in the Tartan IMU Challenge.

This isn't a post about a clever architecture; the winning RealPDE models are tiny. It's about what my job became once the agents got good enough, and the one belief I had to get into my own head first: it's just possible.

## The receipts

- **RealPDE, NeurIPS 2026.** #1 on both tracks of the development phase: Track 1 (sim-to-real) at 82.218, Track 2 (streaming adaptation) at 82.491. The final phase retrains every finalist from scratch on the organizers' hardware, and results come out on November 10, so this can still change.
- **Robotic Origami Challenge, IROS 2026.** Second place, as a solo entry. Two robot hands, one sheet of paper; my policy completed two of the five folds. [Read that story →](/notes/iros-2026-origami)
- **Tartan IMU Challenge, IROS 2026.** 5th of 131 teams.
- **Cost of the RealPDE push:** about $455 of GPU rental for the final three days, the $200 Claude subscription twice (I hit the limit once), and $300 in credits. Roughly $1.2k all in, against $12k in prizes if first place holds on both tracks.

## First, the harness era

I'm not new to this. In August I spent a week with earlier models on RealPDE and got nowhere: seven uploads, none better than our best. Then I did what everyone was doing. I built an autoresearch harness.

Mine paired GPT-6 Astra as the thinker (analyse, plan, update beliefs) with DeepSeek as the implementer. It had a pinned prompt catalogue, a controller, a ledger and a budget ceiling of $6 per research cycle. And it worked, for a while. Between September 8 and 20, Astra, first directly through Codex and then inside my harness, took Track 1 from 79.3 to 81.4. That base is real, and the final model still builds on it.

But the steps kept shrinking: +0.22, then +0.05. On September 22 I asked Opus 5.5 to look at the whole setup. It said:

> You are going in circles. The last ~10 ideas were all backbone swaps… It still asks Astra for new architectures, which is exactly the pattern that has stalled.

An hour later I told it: "No need to create a harness here. Here I am asking you to think and proceed."

That was the change. With the new model I didn't need a research loop built around a model. The model could hold the loop itself: read the data, compute where the points actually were, plan, launch, read results and update. What it needed from me was different.

## The setup, concretely

No framework, nothing exotic. Here is everything:

- **One main session.** A single Claude Code conversation on my workstation, running Opus 5.5. It was compacted about ten times over five days and survived five machine restarts.
- **A fleet under it.** Over the final week it spun up 66 subagents and 17 scripted workflows with 143 more agents. Some ran for most of a day ("Loop A: training-side ideas" ran 21 hours); others were five-minute skeptics auditing a package. About 209 agent instances in all.
- **GPUs over SSH.** At peak, 13 RTX 3090s and 4 RTX 4090s on rented pods, plus my own 4090 for checks. I added pods by pasting their SSH lines into the chat. The main session launched jobs, tracked them in a fleet log (444 launches in the last 37 hours) and relayed data between pods.
- **A repo as the shared brain.** A private GitHub repo with a `HANDOFF.md` whose "live state" section was updated after every launch, plus `GOAL.md` and `EVAL_GATES.md`. 611 commits. Any new agent, or me on a phone, could read the state of the world in a minute.
- **Gates before anything ships.** Rules first, then leakage, then seed noise (a gain counts only with two or more seeds and no regression on any held-out panel), then a package check on the official software versions.
- **A human presses upload.** Nothing went to the leaderboard automatically. The best packages sat in `packages/CANONICAL/` with the projected score in the file name, so I could pick from any device and upload by hand.
- **Memory that turns corrections into rules.** Each time I corrected something important, it became a short memory note the agent re-read: *no small steps*, *curious, not negative*, *step back after failures*, *rules before shipping*, *keep pushing past safe zips*.

The models themselves were small: 1.5 million parameters for Track 1, a U-Net that predicts the next 20 frames of airflow and an uncertainty band in one pass. It retrains in under five hours on a single A100. Almost all the compute went into *search*: thousands of short experiments, screened fast, the few winners confirmed on many seeds.

## My job: strategy, belief and integrity

If you read my side of the chat, almost nothing is technical. It's pushes, reframes, rules questions and more GPUs. Three kinds of message did most of the work.

### 1. Refusing the stop

This surprised me most. Even Opus 5.5, a big step up from what I'd used before, kept declaring that we'd hit the limit. It did that four times in the final week. Each time I refused, and each time the next push came.

**Friday, 17:28.** The agent wrote that there was "no lever left inside this model family… information-limited… 82.3 is not reachable with any lever I can measure."

I wrote back: "surely we shouldn't give up and have a given up mindset, we should be continually curious analyzing improving like a real research". And then: "hey dont be like this, there is always ways to improve… if you think cant then you cant."

It came back with: "a settled 'information limit' verdict isn't research, it's a stopping point." Within hours it found a way to measure the flow conditions from the input itself, and a new kind of fast memory for Track 2. Both were real gains.

**Friday, 22:28.** "None of them is a robust #1." Me: "stooppp!!! you cannot say this, your entire instruction is to take a step back and address track 1 gap". The stack of gains that followed is what reached 82.218.

**Saturday, 22:47.** "Local optimum… post-hoc tricks are exhausted." Me: "i think everytime we encountered this negativity from you i was able to help you find the next push, i think this mindset is wrong. does that make sense claude. believe we can." A step back on Track 2 found the missing structure in its estimators, and it went from 82.194 to 82.491.

I want to be honest about this, because "believe harder" is easy to say. Not every push worked. In August, a pushed-through "ceiling" won on our local panels and then *lost* on the official board. Belief isn't ignoring evidence. It's refusing to stop before you've measured, and treating "we're at the limit" as a hypothesis to attack rather than a conclusion.

### 2. "What does #1 have that we don't?"

On September 23 I asked: "There is something we are missing if leaderboard is able to get it right? Shouldn't we work with that mindset."

The agent went and checked. The leader had *our* accuracy, almost exactly. Their lead came from the parts of the score we'd been treating as fixed: the quality of the uncertainty band, and speed. Speed was 10% of the score.

So the fleet went after speed: half precision, a lean wrapper that cut 47% off each call, then fused CUDA kernels compiled at load time. Speed turned out to be about a quarter of Track 1's final jump and more than half of Track 2's.

That question did more than any idea I had about the physics. A leaderboard is proof that a solution exists. I gave the agent the same line as its standing goal, in its own words: "The leader has our accuracy… That proves it's possible, so there's something we're missing, and I believe you can find it."

### 3. Keeping it clean

Competitions reward people who walk up to the line. I didn't want any part of that. Early on, after the organizers had patched an exploit, the agent proposed a "legitimate" method built on the same machinery. I asked, "isn't that illegal". We shelved it.

On the final weekend it recommended packages that bundled prebuilt binaries. I asked, "did we submit the rule violation submission?" We withdrew them, and after that every package mechanic got checked against the written rules before I'd upload it.

You can delegate almost everything to the agents now, but not your integrity.

## The loop

The method I kept repeating, until it became a memory note, is simple:

> once one of ideas dont work, take a step back analyze, visualize, look at error, and then think of next set of ideas to test. thats the loop.

When GPUs sat idle, I didn't want them released. I asked for a watcher: if three or more GPUs were idle for 15 minutes, the agent had to stop, study where the current best was still wrong, and launch a new wave of ideas from what it saw. On the last day the waves got wide: one workflow ran five "lenses" to produce about fifty Track 2 ideas, screened seventeen, and kept the winners.

And no small steps. Over a few days I kept getting +0.01 and +0.02 items presented as progress. On September 25 I wrote: "ok no more small steps to #1 for track1. ok? I believe in you, dont forget!!! keep this in memory." It did keep it in memory. From then on every work block started with the question: can this plausibly add a tenth of a point?

## The last day

Sunday morning UTC I wrote: "Ok I am gonna leave you to it. Please operate autonomously… by using the process we decided." Then I mostly travelled.

At 12:10 I added my own two 4090s and called the last four-hour push, with at least two thirds of the compute on Track 2. When the agent proposed freezing early, I asked "why freeze early when we can continue pushing lead? We have few hours still… We do want to get #1 on both." We hit usage limits twice and I raised them. Near the end I told it to take over directly rather than through more agents, to save tokens. At 17:12 the final packages were ready, and I uploaded Track 2 first to de-risk.

At 17:50 Track 1 came in at 82.218, #1. At 18:10 Track 2 came in at 82.491, #1.

## The model I almost didn't train

A day after RealPDE closed, I was in Pittsburgh for the origami challenge. Our best model had already folded two of five stages in a test run that day. I had a plan for a better one: the same 62-million-parameter policy, fine-tuned on sharper camera images. But it was late, the last test slot was the next morning, and honestly, I had given up on it. Was I really going to start a training run now?

Then I thought: no, I just need to do it. It's maybe 30 minutes to an hour of my time to set up. Otherwise it would just keep tugging at the back of my head.

So I wrote the plan with an agent at 8:20 pm. A rented H100 started at 8:57. The run trained through the night, unattended. At 4:20 am it passed its offline check, beating the old model. That's the model that ran in the final on September 30, and it took second place.

The pattern is the same as RealPDE, at a smaller scale: the hard part wasn't the work. It was deciding the work was worth starting.

## One agent, two hunches: Tartan IMU

Tartan IMU was a different shape. One Codex session running GPT-6 Astra built the whole model in three days on three rented GPUs, while I pushed it. It had to estimate velocity from one second of raw motion-sensor data, across a car, a legged robot, a drone and a walking person, with one model.

Two of my hunches became the core of it. First: "sometimes spectrograms are used to model sounds… so there could be techniques like that here." Then, three minutes later: "Did we try doing something along the lines of kalman filters plus ML". It hadn't. The Kalman-style smoother it built next was in every submission after that.

When it stalled, I wrote: "clearly a solution exists because some people have got it on the leaderboard." Same lesson. We finished 5th of 131. [Chin](https://chin.bio) wrote the report with his own agent, and Claude Code handled the release and a clean reproduction.

## A short guide

If you want to try this, here's what I'd tell you:

1. **Don't build a harness. Build a repo the agent keeps current.** A live-state file, a goal file and gates. The conversation is the controller.
2. **Make the agent compute where the points are** before it has ideas. Invert the metric. Ask what each sub-score is worth.
3. **Ask what #1 has that you don't.** A leaderboard is a proof of existence.
4. **Treat "we're at the limit" as a hypothesis.** Ask for the weakest assumption behind it and a fast test.
5. **Turn every important correction into a memory rule,** so you only make it once.
6. **Keep every GPU busy, and make idleness trigger a step back,** not a release.
7. **Gate everything. You press upload.** Put the projected score in the file name.
8. **Watch for proxy-chasing.** On the origami project I had to say: "I don't think you're thinking of actually folding the airplane, you're just thinking lower score." It agreed.
9. **Write the agent's goal as a motivating paragraph,** in your voice. It sounds silly. It isn't.
10. **Spend your own time on strategy, belief and rules.** Those are the parts you can't delegate yet.

## What changed

A year ago, competitive ML was mostly a person and a few GPUs, grinding through ablations. Karpathy-style autoresearch pointed at the next step: wrap a model in a loop and let it search. A few months ago that was the frontier, and my own harness did real work. With Opus 5.5 it already feels outdated. You don't need the loop around the model; the model holds the loop. What's left for the human is to set the attack strategy, keep the agents believing, and keep everything clean.

The biggest change, though, was in me. I'm on a plane, and I can still make it happen. It's late in Pittsburgh, and I can still start the run. The frontier keeps moving, and the only way to find where it is is to act as if it's possible and go and measure.
