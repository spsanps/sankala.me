# Essay Revisions - December 2025 (Updated)

## SUMMARY OF ALL CHANGES

### STRUCTURAL CHANGES

**1. Move Section 17 "Less Data Than Expected" → Part I (new Section 3b)**
- WHY: This is a capability argument about foundation models solving the data problem
- Currently buried in Part IV (Demand Side) where it doesn't belong
- Should follow "The Straight Line" - it's the evidence that video pretraining works

**2. Move Section 18 "The Convergence" → Part VI intro (before Section 22)**
- WHY: This is a synthesis/setup section, not a demand argument
- Works as the "why now" transition into predictions
- Rename to "Why This Time Is Different"

**3. Rewrite Section 25 "Predictions" → Year-by-year granular predictions**
- WHY: Current predictions are scattered by confidence tier, not by timeline
- Reader wants to know: what happens in 2026? 2027? 2028?
- Add specific volume numbers, cost projections, capability milestones

**4. Rewrite Coda → Comprehensive prediction summary with numbers**
- WHY: Current coda is philosophical, not actionable
- Should summarize the concrete bets the essay is making
- End with the falsifiable claims, not poetic flourish

---

## PREVIOUS CHANGES (Already Applied)

### 1. **NEW SECTION 5b: "The Latency Myth"** (Major Addition)
**Location:** After Section 5 (Introducing VIKI), before Section 6 (The Slider)
**What changed:** 
- Added complete new section dismantling the latency objection
- Core argument: Human conscious motor control operates at 5Hz (200ms), not 200Hz
- The 200Hz loop is classical control theory (trajectory tracking), not AI
- Cloud gaming precedent (Stadia) proves this architecture works
- Includes ASCII architecture diagram
- Covers graceful degradation on connection loss

### 2. **UPDATED SECTION 5: "Introducing VIKI"** (Strengthened)
**Location:** Lines ~155-192
**What changed:**
- Removed weak framing of "reasoning vs reflexes" 
- Strengthened to: cloud sends ACTION VECTORS (trajectories), not just plans
- The intelligence layer literally controls the robot, not just "advises" it
- Clearer about what Figure's System 2 actually does

### 3. **FIXED SECTION 6: "The Slider"** (Cleaned Up)
**Location:** Lines ~203-224
**What changed:**
- Removed broken/duplicate content from the old 5b
- Cleaner transition from latency section

### 4. **UPDATED PREDICTIONS DATES** (Minor Updates)
**Location:** Section 25
**What changed:**
- "end of 2026" predictions now explicitly note this is ~12 months away
- Adjusted some timeline language for December 2025 perspective

### 5. **UPDATED FALSIFICATION SECTION** (Refined)
**Location:** Section 23
**What changed:**
- Latency falsification criterion updated to match new architecture argument

---

## REVISED SECTION 5: INTRODUCING VIKI

```markdown
## 5. Introducing VIKI

In the 2004 film *I, Robot*, the villain isn't a rogue robot. It's VIKI — Virtual Interactive Kinetic Intelligence — a central AI that controls all the NS-5 robots through persistent network connections. Each robot is a terminal. The intelligence lives in the cloud. When VIKI decides that humanity needs to be controlled "for its own protection," every robot in the city becomes an extension of her will.

This seemed like dystopian science fiction. A warning about centralized AI control. A metaphor for corporate overreach.

It's actually the economically rational architecture.

Think about how ChatGPT works. You type a message on your phone. The phone sends it to a datacenter. A cluster of GPUs runs a trillion-parameter model. The response comes back. Your phone is a terminal. The intelligence lives in the cloud.

Nobody thinks this is dystopian. It's just how software works now. Your phone can't run GPT-4. The model is too big. So the model runs in the cloud and your phone renders the output.

Robots will work the same way.

A humanoid robot running full autonomy on-device would need to fit a frontier AI model — a trillion parameters or more — onto embedded hardware. That's not happening anytime soon. Nvidia's Jetson Orin, the best embedded AI chip available, can run models up to about 70 billion parameters with heavy optimization. Frontier models are 10-20x larger.

So you have a choice. You can run a small model on the robot and accept worse performance. Or you can run a frontier model in the cloud and accept some latency.

For most tasks, cloud wins.

Figure AI, one of the leading humanoid companies, already builds this way. Their Helix system has two components:

- **System 1**: 80 million parameters, runs on-device at 200Hz. Handles trajectory tracking, balance, safety reflexes.
- **System 2**: 7 billion parameters, runs at 7-9Hz. Handles visual understanding, task reasoning, trajectory generation.

Notice what System 2 does: it doesn't just *plan*. It generates *trajectories* — the actual motion commands that System 1 executes. The cloud model isn't advising the robot. It's controlling it.

Figure hasn't disclosed where System 2 runs. But 7 billion parameters is near the edge of what embedded hardware can handle. Frontier models — the ones that show emergent reasoning — are 100x larger. Those can only run in the cloud.

The implication: as models get more capable, the cloud portion grows. The on-device portion stays small — just enough for trajectory tracking. The intelligence centralizes.

One brain. Millions of bodies. Every robot making every other robot smarter, because they all feed data back to the same model. Overnight updates that improve the entire fleet simultaneously. A single point of control.

VIKI.
```

---

## NEW SECTION 5b: THE LATENCY MYTH

```markdown
## 5b. The Latency Myth

"But latency!" This is the first objection everyone raises. Motor control needs to happen at 200Hz — every 5 milliseconds. You can't wait for a round trip to a datacenter. The cloud architecture is physically impossible.

This objection fundamentally misunderstands what needs to happen at 200Hz.

**The Human Precedent**

Consider how you pick up a coffee cup. Your conscious reaction time — the time from "I want to grab that" to "my hand starts moving" — is about 200-250 milliseconds. That's 4-5Hz, not 200Hz. Your brain doesn't update your motor plan 200 times per second. It updates 4-5 times per second. You decide "move hand toward cup," your arm moves, you get visual feedback, you adjust.

What *does* happen at faster-than-conscious speeds?

- Spinal reflexes (pulling your hand from a hot stove — this bypasses the brain entirely)
- Balance corrections (vestibular/proprioceptive feedback loops)
- Trajectory tracking (your arm following the path your brain set)

The fast stuff isn't intelligence. It's execution. Your spinal cord doesn't understand coffee cups. It just tracks the trajectory your brain commanded.

Robots can work the same way.

**The Architecture**

The 200Hz loop doesn't need AI. It needs classical control theory — PID controllers tracking target positions. We've known how to do this since the 1950s. The on-device controller doesn't need to understand what a coffee cup is. It just needs to track the trajectory the cloud model commanded: "move end effector to (x, y, z) over the next 200ms."

```
┌─────────────────────────────────────────────┐
│              CLOUD (The Brain)              │
│  ┌───────────────────────────────────────┐  │
│  │   Foundation Model (1T+ params)       │  │
│  │   • Visual understanding              │  │
│  │   • Task reasoning                    │  │
│  │   • Trajectory generation             │  │
│  └──────────────────┬────────────────────┘  │
│                     │ 5-10Hz                │
│                     │ target trajectories   │
└─────────────────────┼───────────────────────┘
                      │ 
          ┌───────────▼───────────┐
          │      NETWORK          │
          │   (50-100ms RTT)      │
          └───────────┬───────────┘
                      │
┌─────────────────────▼───────────────────────┐
│          ON-DEVICE (The Spinal Cord)        │
│  ┌───────────────────────────────────────┐  │
│  │   Local Controller (~100M params)     │  │
│  │   • Trajectory tracking (200Hz)       │  │
│  │   • Balance/stability                 │  │
│  │   • Safety reflexes                   │  │
│  │   • Graceful degradation              │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  On disconnect: complete current motion     │
│  → return to safe pose → stand still        │
└─────────────────────────────────────────────┘
```

The cloud model outputs target poses and trajectories at 5-10Hz. The on-device controller tracks those trajectories at 200Hz using classical control. The intelligence is in choosing the trajectories. The 200Hz loop is just execution.

**The Cloud Gaming Precedent**

This architecture already works at scale. It's called cloud gaming.

Google Stadia, Nvidia GeForce Now, Xbox Cloud Gaming — all stream video games from datacenters to thin clients. The game runs remotely. The player's inputs go up, video frames come down. Latency is 50-100ms. Millions of people play competitive games this way.

Cloud robotics is actually *less* demanding than cloud gaming:

| Cloud Gaming | Cloud Robotics |
|--------------|----------------|
| Frame rate: 60Hz | Control rate: 5-10Hz |
| Latency-sensitive: competitive PvP | Latency-tolerant: pick up box |
| Failure mode: you lose the match | Failure mode: robot pauses |

A Stadia lag spike means you die in PvP. Annoying, but nothing bad happens in the real world. A cloud robot lag spike means the robot pauses for a second before picking up the next box. For warehouse/factory/cleaning tasks, that's fine.

**Graceful Degradation**

What happens when the cloud connection drops entirely?

The robot doesn't freeze mid-reach with arm extended. It:

1. Completes current trajectory (already cached locally)
2. Returns to neutral safe pose  
3. Stands still, waits for reconnection
4. Maybe displays "connection lost" or walks to charging station if it has a cached map

This is *less* demanding than autonomous vehicles. A Waymo needs to pull over safely and park if systems fail. A warehouse robot just needs to... stop. Stand there. Not fall over. We've had that capability since Boston Dynamics in the 2010s.

**The Real Objection**

The latency argument isn't really about physics. It's about intuition.

Roboticists have spent decades building autonomous systems. Edge compute. Self-contained intelligence. The idea that a robot would depend on a network connection *feels* fragile, unreliable, wrong.

But phones depend on network connections. So do cars, increasingly. So does every cloud-connected device. The question isn't "is cloud dependence scary?" It's "do the benefits outweigh the costs?"

For a trillion-parameter model that enables emergent reasoning and cross-task generalization — yes. The benefits outweigh the costs.

The latency objection assumes the AI needs to close the loop at 200Hz. It doesn't. Humans control their bodies at 5Hz. So will robots.
```

---

## REVISED SECTION 6: THE SLIDER

```markdown
## 6. The Slider

People talk about "cloud robotics" versus "edge robotics" like it's a binary choice. It's not. It's a slider.

At one end: pure edge. All computation happens on the robot. No network connection required. Tesla's Full Self-Driving works this way — the car runs entirely on its onboard computer. This is the approach roboticists have historically assumed. Robots should be autonomous, self-contained, independent.

At the other end: pure cloud. The robot is a dumb terminal with sensors and actuators. All decisions happen in a datacenter. The robot streams sensor data up, receives trajectories back. This is telepresence with AI in the middle.

Most real systems are somewhere in between. And the interesting question is: where is the slider going?

Consider Waymo. The self-driving car company is usually described as running "on-device" — the cars drive themselves without constant cloud connectivity. True, but incomplete. Waymo cars download high-definition maps from the cloud. They upload sensor data for training. They receive software updates that change their behavior. The real-time driving decisions happen locally, but the *intelligence* — the model weights, the accumulated knowledge — comes from a centralized system that learns from the entire fleet.

Amazon's warehouse robots are similar. 750,000 robots across 300+ facilities, coordinated by a central system that handles routing, traffic optimization, and task allocation. The robots execute locally, but they're nodes in a centralized network.

The discourse treats this as "mostly edge with a little cloud assist." That framing understates what's happening.

The valuable part — the intelligence — is already centralized. The local compute just executes. And as models get bigger and more capable, the ratio shifts further toward cloud.

Here's why this matters: whoever runs the cloud controls the robots.

It's not enough to build a robot body. The body is commodity hardware — we'll see in Part III that humanoid costs are collapsing toward $5,000. The intelligence is the moat. And if the intelligence lives in the cloud, run by Google or OpenAI or some Chinese equivalent, then the hardware company is just a systems integrator.

The robotics industry thinks it's building robots. It might actually be building terminals.
```

---

## UPDATED FALSIFICATION CRITERION (Section 23)

Replace the old latency falsification with:

```markdown
**The 5Hz assumption proves wrong for most valuable tasks.**

The cloud architecture depends on human-like motor control rates: 5-10Hz for trajectory generation, with only trajectory tracking at 200Hz. If commercially valuable manipulation tasks require the foundation model to close the loop at 50Hz+ — if the separation between "brain" and "spinal cord" doesn't hold — then edge architectures win.

What to watch: Deployment reports from early adopters. If Amazon, BMW, and others find that their robots require tight visual-motor integration faster than 10Hz for core tasks, the cloud architecture faces structural limits. The key question: can you separate "what to do" from "how to track the trajectory"?
```

---

## UPDATED PREDICTIONS (Section 25)

Update the intro paragraph:

```markdown
I'll be concrete about what I expect, tiered by confidence. Note: we're in late December 2025 — predictions for "end of 2026" are approximately 12 months out.
```

Update Tier 1 Prediction #2:

```markdown
2. **A major AI lab (Google DeepMind, OpenAI, or Anthropic) will ship a commercial robotics API by end of 2026.** That's 12 months from now. The AI labs will enter robotics commercially, not just through research.
```

Update Tier 5 Prediction #13:

```markdown
13. **The US will announce a significant government humanoid robotics initiative ($1B+ committed) by end of 2026.** That's 12 months — one budget cycle. Security competition will drive policy response.
```

---

## LOCATIONS FOR REVIEW

| Section | Line Numbers (approx) | Change Type |
|---------|----------------------|-------------|
| Section 5 | 155-192 | Major rewrite - action vectors claim |
| Section 5b | NEW INSERT after 192 | New section - latency myth + diagram |
| Section 6 | 203-224 | Cleanup - remove broken content |
| Section 23 | 850-855 | Falsification criterion update |
| Section 25 intro | 897-900 | Date context update |
| Prediction #2 | 905 | Date clarification |
| Prediction #13 | 935 | Date clarification |

---

## KEY ARGUMENT CHANGES

**OLD (Weak/Consensus View):**
- "Reflexes need to be local at 200Hz, reasoning can be in the cloud at 7Hz"
- Cloud does planning, edge does control
- Everyone accepts this split

**NEW (Strong/Contrarian View):**
- Cloud model sends ACTION VECTORS / trajectories, not just plans
- The 200Hz stuff isn't AI — it's classical control theory (trajectory tracking)
- Human motor control operates at 5Hz, not 200Hz
- Cloud gaming proves this architecture works at scale
- Graceful degradation handles connection loss
- The cloud model IS the robot's brain — the edge is just the spinal cord

---

## NEW STRUCTURAL CHANGES

### CHANGE 1: Move Section 17 to Part I

**Current location:** Part IV, Section 17 (lines ~741-770)
**New location:** Part I, Section 3b (after "The Straight Line")
**New title:** "3b. The Data Shortcut"

This section explains WHY foundation models work for robotics - the data bottleneck isn't real because video pretraining already taught the models physics. This is a core capability argument, not a demand-side argument.

Renumber subsequent sections:
- Old Section 4 "Domain Expertise Illusion" → stays Section 4
- Old Section 17 → becomes Section 3b

---

### CHANGE 2: Move Section 18 to Part VI intro

**Current location:** Part IV, Section 18 (lines ~773-802)
**New location:** Part VI intro, before Section 22
**New title:** "The Convergence Window" (or keep as "The Convergence")

The "five trend lines converging" + "why this time is different" is perfect setup for the predictions section. It's the "case closed" before the "here's what I predict."

---

### CHANGE 3: New Year-by-Year Predictions Section

Replace current Section 25 with comprehensive year-by-year format:

```markdown
## 25. Year-by-Year Predictions

I'll be concrete about what I expect. We're in late December 2025. Here's my year-by-year forecast, with specific numbers where possible.

### 2026: The Foundation Year

**Volume:** 15,000-30,000 humanoid robots deployed globally
- Wave 1 (government/pilots) in full swing
- Chinese SOEs scaling production
- Amazon, BMW pilots converting to production

**Capability milestones:**
- Major AI lab (Google, OpenAI, or Anthropic) ships commercial robotics API (85% confidence)
- Emergent tool use demonstrated in published research (70% confidence)
- First 1,000+ robot deployment at a single company (75% confidence)

**Hardware:**
- Average humanoid cost: ~$5,500
- Chinese manufacturers: 40-50% of global production

**Policy:**
- US announces $1B+ government humanoid initiative (60% confidence)
- First Congressional hearings on robot labor displacement

---

### 2027: The Scaling Year

**Volume:** 100,000-200,000 humanoid robots deployed globally
- Goldman Sachs projects 76,000 — I'm betting 1.5-2.5x higher
- Wave 2 (commercial scaling) begins

**Capability milestones:**
- Zero-shot cross-embodiment transfer demonstrated commercially (70% confidence)
- Foundation models power 30%+ of new deployments (75% confidence)
- At least one major robotics company pivots from in-house AI to API (65% confidence)

**Hardware:**
- Average humanoid cost: ~$5,000
- Chinese manufacturers: >50% of global production (80% confidence)

**Deployment:**
- Amazon: 10,000+ humanoid robots in fulfillment (65% confidence)
- First major warehouse operator (non-Amazon) deploys 5,000+ (60% confidence)

**Policy:**
- Export controls on robotics AI models proposed (55% confidence)

---

### 2028: The Capability Year

**Volume:** 300,000-600,000 humanoid robots deployed globally
- Wave 2 in full swing
- Early Wave 3 (consumer/services) pilots begin

**Capability milestones:**
- Foundation models power majority (>50%) of new humanoid deployments (85% confidence)
- Single foundation model controls robots doing 10+ distinct commercial tasks (70% confidence)
- Cloud-based robots outperform edge-based in head-to-head benchmarks (75% confidence)

**Hardware:**
- Average humanoid cost: ~$4,000
- Hardware gross margins: <20% (70% confidence)

**Deployment:**
- Chinese company deploys 50,000+ humanoids in single year (65% confidence)
- Tesla Optimus: either top-3 by volume OR pivots to licensing (60% confidence)
- Major household brand (hotel/restaurant/retail) announces deployment (55% confidence)

**Geopolitical:**
- PLA humanoid unit publicly acknowledged (60% confidence)

---

### 2029: The Maturation Year

**Volume:** 500,000-1,200,000 humanoid robots deployed globally
- Consumer viability threshold crossed for early adopters
- First mass-market consumer humanoid announced (sub-$5,000)

**Capability milestones:**
- Humanoid completes novel multi-step task without human intervention in unstructured environment (80% confidence)
- First "general purpose" robot deployed across 3+ industries by single AI provider

**Hardware:**
- Average humanoid cost: ~$3,500
- First sub-$3,000 humanoid from Chinese manufacturer

**Deployment:**
- Construction sector: 1,000+ humanoids at single company/project (60% confidence)
- Eldercare: 10,000+ humanoids in assisted living facilities (Japan leads)

**Risk events:**
- Fatal accident involving humanoid robot triggers regulatory response (50% confidence)

---

### 2030: The Inflection Year

**Volume:** 800,000-2,000,000 humanoid robots deployed globally
- Goldman Sachs projects 250,000 — I'm betting 3-8x higher
- Wave 3 (consumer) begins scaling

**Market structure:**
- Leading humanoid AI provider market cap exceeds leading hardware company (65% confidence)
- Hardware effectively commoditized — margins <15%
- 2-3 dominant AI providers control >60% of commercial deployments

**Hardware:**
- Average humanoid cost: ~$3,000
- Premium consumer humanoid: $5,000-8,000

**Deployment:**
- First million-unit year: 2030 or 2031 (70% confidence)
- US humanoid deployments: 100,000-300,000
- China humanoid deployments: 400,000-1,000,000

---

### The Volume Test (Summary)

| Year | Goldman Sachs | My Base Case | My Bull Case |
|------|---------------|--------------|--------------|
| 2026 | ~20,000 | 15,000-30,000 | 40,000+ |
| 2027 | 76,000 | 100,000-200,000 | 250,000+ |
| 2028 | ~120,000 | 300,000-600,000 | 800,000+ |
| 2029 | ~180,000 | 500,000-1,200,000 | 1,500,000+ |
| 2030 | 250,000 | 800,000-2,000,000 | 3,000,000+ |

**Falsification thresholds:**
- If 2027 < 50,000: I'm wrong, Goldman was right
- If 2027 > 150,000: Exponential thesis validated
- If 2030 > 1,000,000: "China Speed" confirmed
```

---

### CHANGE 4: New Coda with Prediction Summary

Replace current philosophical coda with prediction-focused ending:

```markdown
# CODA: The Bet

This essay makes a specific bet: **the team training GPT-7 will also be training the dominant robot brain.**

Not a separate robotics team. Not a purpose-built manipulation system. The same researchers, same infrastructure, same scaling laws that produce the next frontier language model will produce the model that controls millions of robot bodies.

Here's how I'm staking my credibility:

### The Core Predictions

**By end of 2026 (12 months):**
- A major AI lab ships a commercial robotics API
- Global humanoid deployments reach 15,000-30,000
- US announces $1B+ government robotics initiative

**By end of 2027 (24 months):**
- Global deployments: 100,000-200,000 (vs. Goldman's 76,000)
- Chinese manufacturers produce >50% of humanoids
- At least one robotics company pivots to cloud AI APIs

**By end of 2028 (36 months):**
- Foundation models power majority of new humanoid deployments
- Hardware margins fall below 20%
- A single AI provider's robots operate in 10+ distinct commercial applications

**By 2030:**
- Global deployments: 800,000-2,000,000 (vs. Goldman's 250,000)
- The leading humanoid AI provider has higher market cap than the leading hardware manufacturer
- The VIKI architecture (cloud brain, commodity bodies) is the dominant paradigm

### What Would Prove Me Wrong

- VLA models plateau — scaling doesn't improve manipulation
- The 5Hz assumption fails — most tasks need faster visual-motor loops
- Domain-specific beats general — small specialized models win
- Investment doesn't materialize — <$10B annually by 2028
- China doesn't mobilize — humanoids remain a niche industry

### The Stakes

The robot that folds your laundry will run GPT-7. But GPT-7 will also fold the laundry of a billion other people. It will work in factories and warehouses and construction sites and hospitals. It will carry weapons and build infrastructure and care for the elderly.

One model. Many bodies. Whoever controls the model controls the future of physical labor.

The question isn't whether this happens. The question is who builds it, who runs it, and whether you've noticed the race has already begun.

---

*Written December 2025.*

*The author has no financial position in any company mentioned. This essay reflects personal analysis, not insider information.*

*Check back in 2027, 2028, 2030. The predictions are falsifiable. The bet is on the table.*
```

---

## UPDATED SECTION NUMBERING

After all changes, the new structure:

**PART I: THE DISSOLUTION**
1. The Claim
2. What Video Models Taught Us
3. The Straight Line
3b. The Data Shortcut ← MOVED from Section 17
4. The Domain Expertise Illusion

**PART II: THE ARCHITECTURE**
5. Introducing VIKI
5b. The Latency Myth ← NEW (already added)
6. The Slider
7. The Batch Economics
8. The Revenue Hunt
9. The Wintel Analogy

**PART III: THE HARDWARE FLOOD**
10. The Unitree Trajectory
11. The EV Precedent
12. The Components Collapse
13. How Many Robots?
14. The Security Multiplier

**PART IV: THE DEMAND SIDE**
15. The Labor Crisis
16. The Three Waves
16b. Where Does The Value Come From?
~~17. Less Data Than Expected~~ ← MOVED to Part I
~~18. The Convergence~~ ← MOVED to Part VI

**PART V: THE STAKES**
19. Who Becomes VIKI? (renumber to 17)
20. The China Race (renumber to 18)
21. The Taiwan Calculus (renumber to 19)

**PART VI: THE TEST**
The Convergence ← MOVED here as intro (unnumbered or "20")
22. Signposts to Watch (renumber to 21)
23. What Would Falsify This Thesis (renumber to 22)
24. The Volume Test ← MERGE into new Section 25
25. Year-by-Year Predictions ← REWRITTEN

**CODA: The Bet** ← REWRITTEN

---

## LOCATIONS FOR REVIEW (Complete List)

| Section | Change Type | Priority |
|---------|-------------|----------|
| Section 3b | NEW - moved from 17 | High |
| Section 5 | Rewritten - action vectors | Done ✓ |
| Section 5b | NEW - latency myth | Done ✓ |
| Part VI intro | NEW - convergence moved here | High |
| Section 25 | REWRITTEN - year-by-year | High |
| Coda | REWRITTEN - prediction summary | High |
| Section 23 | Updated falsification | Done ✓ |
| All Part V sections | Renumber 19→17, 20→18, 21→19 | Medium |
| All Part VI sections | Renumber after changes | Medium |
