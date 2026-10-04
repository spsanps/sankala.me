---
title: It's just possible
subtitle: How I steered a fleet of AI agents to first place in a NeurIPS competition, and the one attitude that mattered most.
author: San Kala
date: October 2026
---

I like competitions because they prove agency: you have to make it happen. You can't talk your way out of a leaderboard. Do it however you want, cleverly or by brute force, but only the result counts. Machine learning competitions are like competitive programming that way, or any competition really: there's a problem, a clock and a scoreboard.

This September I entered three:

- **RealPDE, a NeurIPS 2026 competition.** Teams predict how air flows around a wing in a wind tunnel, a few moments into the future, from real measurements. It has two tracks, each with its own leaderboard: in one, models learn mostly from simulations and must work on real data; in the other, they adapt as new data streams in. I finished **first on both** leaderboards of the development phase. The organizers are now retraining the finalists' models, and final results come out on November 10.
- **The Robotic Origami Challenge at IROS 2026.** Two robot hands have to fold a sheet of paper into a paper plane. I took **second place**. [That story is here.](/notes/iros-2026-origami)
- **A robot motion-sensing challenge at IROS 2026** (Tartan IMU). One model has to work out how fast a robot is moving from its motion sensors alone. I placed **fifth of 131 teams**.

I wasn't the one writing the code. I directed AI agents that wrote and tested it. And the most important thing I brought wasn't technical. It was refusing to stop.

## The weekend

The RealPDE development phase closed at midnight UTC on Sunday, September 27. That weekend I was flying to Pittsburgh for IROS.

Scores in RealPDE sit around 82 out of 100, a mix of accuracy, speed and how well a model knows its own uncertainty. At 2 pm UTC on Sunday, my agents reported where we stood: 9th on one track and 5th on the other, about a quarter of a point behind first on each. By 6:10 pm we were first on both.

All weekend I worked through one long Claude Code session running Opus 5.5, remotely, some of it over airplane wifi. From that session I directed roughly 200 helper agents over the final week, using as many as 17 rented GPUs at once. The push cost about $1,200 all in, for GPUs, my Claude subscription and some credits. If first place holds on both tracks, the prize is $12,000.

## The main thing: don't stop

The agents were very good. They built the models, ran thousands of experiments, wrote fast GPU code and checked their own work. But one thing kept happening, even with Opus 5.5: they would decide we'd hit the ceiling.

In the final week it happened four times. Each time, I said no. And each time, the next improvement came within hours.

Two days before the deadline, the agent decided this approach was done:

> **Agent:** No lever left inside this model family… 82.3 is not reachable with any lever I can measure.
>
> **Me:** surely we shouldn't give up and have a given up mindset, we should be continually curious, analyzing, improving like real research
>
> **Me:** hey don't be like this, there is always ways to improve… if you think can't then you can't

It answered, "a settled 'information limit' verdict isn't research, it's a stopping point," and went back to work. That night it found a way to read the wind speed and the wing's angle straight from the input data, and a way for the second track's model to make better use of the data it had just seen. Both were real gains.

A few hours later:

> **Agent:** None of them is a robust #1.
>
> **Me:** stooppp!!! you cannot say this, your entire instruction is to take a step back and address the track 1 gap

It went back to closing that gap, and the changes it found took Track 1 to first. The next night it said we were at a "local optimum":

> **Me:** every time we encountered this negativity from you I was able to help you find the next push. I think this mindset is wrong. Does that make sense, Claude? Believe we can.

A fresh look at the second track found what its predictions were missing, and it went to first as well.

Pushing doesn't always work. In August, one change I pushed for improved our private tests and then scored worse when we submitted it. Refusing to stop doesn't mean ignoring the numbers. It means not quitting before you've measured. "We're at the limit" is a guess to test, not a conclusion.

### A leaderboard is proof

The most useful question I asked all month was this one, early in the final week:

> **Me:** There is something we are missing if the leaderboard is able to get it right? Shouldn't we work with that mindset?

The agent checked. The team in first place had almost exactly our accuracy; their lead came from speed and from how well their model judged its own uncertainty, two parts of the score we'd been treating as fixed. So we went after speed, and it ended up being a big share of our final jump on both tracks.

The same thing happened in Tartan IMU. When we stalled there, I wrote, "clearly a solution exists because some people have got it on the leaderboard." Seeing someone ahead of us was proof there was more to find.

### The model I almost didn't train

The night before my last test on the origami robot, I was in Pittsburgh with an idea I hadn't tried: from the data, it looked like sharper camera images would help. But it was late, my last chance to test on the robot was the next morning, and I had honestly given up on it. Was I really going to start a training run now?

Then I thought: no, I just need to do it. It's 30 minutes, maybe an hour of my time. Otherwise it'll keep tugging at the back of my head.

I wrote the plan with an agent at 8:20 pm. A rented GPU trained the model through the night, and at 4:20 am it passed its checks. We used that model in the final, and it took second place.

The hard part wasn't the work. It was deciding the work was worth starting.

## Why I stopped using a research harness

Before Opus 5.5, I did what a lot of people are doing: I built an "autoresearch" harness, a program that wraps AI models in a fixed research loop. Mine used GPT-6 Astra to think and plan, and DeepSeek to write the code, with a fixed set of prompts, a log of every result and a budget of $6 per research cycle.

It worked, up to a point. Over about two weeks, Astra, first on its own and then inside the harness, took the first track from 79.3 to 81.4. The final model still builds on that work. But each step was smaller than the last. When I switched to Opus 5.5, I asked it to look at the whole setup:

> **Agent:** You are going in circles. The last ~10 ideas were all backbone swaps… It still asks Astra for new architectures, which is exactly the pattern that has stalled.

So I told it: "No need to create a harness here. Here I am asking you to think and proceed."

With the newer model, the conversation itself was the loop. I gave it access to rented GPUs and a shared code repository, where it kept a status file up to date. That, one Claude Code session and a set of standing notes was the whole setup.

## What I actually typed

People ask what prompts I use. Mostly, these.

**At the start of the final week,** I gave it this:

> Your task is to iterate at a very high sensible pace and come up with multiple winning solutions… Please respect the competition rules. Aggressively proceed.

**A note from me, at the top of its instructions.** Claude Code reads a file called CLAUDE.md at the start of every session. I asked Claude to write "a natural, clean, happy, excited paragraph… mostly motivating you, from me", put it at the top of that file, and set it as the goal:

> Hey Claude, we're going for it! We have the next 24 hours, and I want you to go all in on closing the gap to #1 and pushing past it. The leader has our accuracy, but they're faster… That proves it's possible, so there's something we're missing, and I believe you can find it. Think big and out of the box. Small tweaks won't get us there anymore… Move fast: a 10-minute experiment, a quick intuition, then the next idea. Keep every GPU busy the whole time, and drop losers without regret… Stay within the rules, keep the safe upload ready, and have fun with it. I'm excited to see what you come up with. Let's go!

It feels silly to write a pep talk for an AI. I'd do it again.

**Standing notes.** Claude Code keeps notes between sessions. Whenever I corrected something important, I had it save the lesson, so I only had to say it once. A few of them:

> **No small steps.** Only work on changes big enough to move the leaderboard, not tiny gains in our own tests.
>
> **Curious, not negative.** Never present "we're at the limit" as the answer. Name the assumption behind it and test it.
>
> **The loop.** When ideas fail, step back, look at the errors, visualize them, and only then pick the next ideas.
>
> **Idle GPUs mean step back.** If GPUs sit idle, study where the best model is still wrong and start a new wave of ideas.

**A skill, after the win.** Once we'd won, I asked it to "capture the skill of keeping pushing, taking a step back and finding, instead of saying this is it all the time." It wrote a short guide that future sessions load whenever they're about to give up. It opens:

> A plateau is a hypothesis, not a conclusion. When I'm stuck, my "this is it" answers have been wrong far more often than right.

**And a lot of short pushes:** "you got this!!!", "why freeze early when we can continue pushing?", "we do want to get #1 on both."

## Making sure the agents played by the rules

The other part of my job was making sure the agents didn't break any rules. Competitions reward people who walk right up to the line, and an agent will happily walk past it if nobody's watching.

Early on, the organizers closed a loophole that some teams had used. The agent then proposed a "legitimate" method that reused the same trick. I asked, "isn't that illegal?" We dropped it. On the last weekend it put together a submission that bundled software the rules didn't allow. I caught it, we withdrew it, and after that every submission was checked against the written rules first.

## If you want to try this

1. **Treat "we're at the limit" as a guess.** Ask for the assumption behind it, and a quick test.
2. **Ask what first place has that you don't,** and have the agent work out where the points actually come from.
3. **Save every important correction as a standing note,** so you only make it once.
4. **Check the rules yourself.** That part is still yours.

## It's just possible

A year ago, competitive machine learning meant one person and a few GPUs grinding through experiments. A few months ago, the frontier was wrapping a model in a research loop. Now one conversation with a good model can run the whole thing, and what's left for the person is the direction, the belief and the rules.

The biggest change for me was in my head. I was on a plane, and I could still make it happen. It was late in Pittsburgh, and I could still start the run. The frontier keeps moving, and the only way to find out where it is now is to act as if it's possible and go and measure.

*Thanks to [Chin](https://chin.bio), who wrote our Tartan IMU report.*
