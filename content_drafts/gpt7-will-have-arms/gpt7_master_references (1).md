# GPT-7 WILL HAVE ARMS: MASTER REFERENCE DOCUMENT

## PURPOSE
This document tracks ALL verified references, quotes, and data points for the essay. Do not lose these between edits.

---

## PART I: THE DISSOLUTION (Moravec's Paradox Ending)

### Rich Sutton - The Bitter Lesson (2019)
**Source:** http://www.incompleteideas.net/IncIdeas/BitterLesson.html
**Key Quotes:**
> "The biggest lesson that can be read from 70 years of AI research is that general methods that leverage computation are ultimately the most effective, and by a large margin."

> "The bitter lesson is based on the historical observations that 1) AI researchers have often tried to build knowledge into their agents, 2) this always helps in the short term, and is personally satisfying to the researcher, but 3) in the long run it plateaus and even inhibits further progress, and 4) breakthrough progress eventually arrives by an opposing approach based on scaling computation by search and learning."

### Demis Hassabis - Video Models Learning Physics
**Source:** Lex Fridman Podcast #475 (July 23, 2025)
**Transcript:** https://lexfridman.com/demis-hassabis-2-transcript/
**Key Quotes:**
> "Fluid dynamics, Navier-Stokes equations, these are traditionally thought of as very, very difficult intractable problems... But if you look at something like Veo, our video generation model, it can model liquids quite well, surprisingly well."

> "I think to the extent that it can predict the next frames in a coherent way, that is a form of understanding... they certainly have modeled enough of the dynamics... that they can pretty accurately generate whatever it is, eight seconds of consistent video."

> "It seems like you can understand physics through passive observation, which is pretty surprising to me."

### Demis Hassabis - On Embodiment Not Required
**Source:** Same Lex Fridman interview
> "Even if you were to ask me five, 10 years ago, I would've said... you probably need to understand intuitive physics... And there was a lot of theories about you'd need embodied intelligence or robotics... But it seems like you can understand it through passive observation, which is pretty surprising to me."

### Demis Hassabis - Inference-Time Compute
**Source:** Google I/O 2025
> "We've always been big believers in what we're now calling the thinking paradigm... we had versions of AlphaGo and AlphaZero with the thinking turned off... maybe like master level. But then, if you turn the thinking on, it's way beyond World Champion level. It's like a 600+ ELO difference."

### NLP Disruption - Quanta Magazine Oral History
**Source:** Quanta Magazine, "When ChatGPT Broke an Entire Field" (April 2025)

**Christopher Callison-Burch (UPenn):**
> "The thing that had taken a student five years? Seems like I could reproduce that in a month... I sometimes describe it as having this career-existential crisis."

**Iz Beltagy (Allen Institute):**
> "In a day, a lot of the problems that a large percentage of researchers were working on—they just disappeared."
> "Everybody was still shocked: 'Is this going to be the last NLP conference?' This is actually a literal phrase that someone said."

**R. Thomas McCoy (Yale):**
> "ChatGPT did that to entire types of research, not just specific projects. A lot of higher categories of NLP just became no longer interesting—or no longer practical—for academics to do."

**Christopher Potts (Stanford Linguistics Chair):**
> "The hallmark of a paradigm shift is that questions we used to think were important now no longer get asked. It feels like that has happened over the past five years."

**Nazneen Rajani (former Hugging Face):**
> "They fired people from the research team and the rest would either be doing pre-training or post-training—which means that you are either building a foundation model or you're taking a foundation model and making it an instruction-following model."

### OpenAI - Video as World Simulator
**Source:** https://openai.com/index/video-generation-models-as-world-simulators/
**Key Framing:** Sora described as "world simulator" not just video generator

---

## PART II: THE ARCHITECTURE (Cloud vs Edge, VIKI Model)

### Figure Helix Architecture
**Source:** https://www.figure.ai/news/helix (Feb 20, 2025)
**Specifications:**
- System 1: 80M parameters, 200Hz control frequency, cross-attention encoder-decoder transformer
- System 2: 7B parameters, 7-9Hz frequency, internet-pretrained VLM
- Training data: ~500 hours total (claimed <5% of previous VLA datasets)
- Action space: 35 DoF at 200Hz
- Hardware: Two embedded GPUs per robot (one per system)
- Architecture: S2 distills semantic information into continuous latent vector; S1 reads at 200Hz while S2 runs asynchronously
**Note:** Published as technical report on company blog, not peer-reviewed

### Wintel Profit Concentration
**Source:** Harvard Business School Working Paper #05-083 (Casadesus-Masanell & Yoffie, 2005)
**Key Finding:**
> "The combined profit of Intel and Microsoft during most years in the 1990s exceeded the total profit of the entire world PC industry."

**2004 Specific Data:**
- Intel + Microsoft combined: >$15 billion net profit
- Top 3 OEMs (Dell, HP, IBM) combined PC profits: ~$2.5 billion
- Microsoft + Intel earned 6x more profit than three largest PC OEMs combined

**Market Control:**
- Microsoft + Intel: 85-95% of PC platform market
- Intel: >85% of 32-bit x86 microprocessor market at peak
- >80% of PCs worldwide shipped with Intel processors running Windows

**IHS Analyst Quote:**
> "In the PC segment, Wintel extracted the majority of the profits, controlled every move and compelled all other players to either comply or risk being forced out of the game."

### Cloud Robotics Architecture - Hybrid Model
**Amazon Robotics:**
- 750,000+ robots across 300+ facilities (1 millionth mobile robot June 2025)
- Cloud: Fleet coordination, route planning, traffic optimization
- Edge: Real-time control; Kiva uses QR floor markers with centralized virtual grid
- Sparrow: On-robot AI for real-time manipulation
- Click-to-ship: 60-75 min → 15 min

**Covariant (acquired by Amazon Aug 2024):**
- Amazon licensed RFM-1 (8B parameter robotics foundation model)
- Trained on "largest real-world robot production dataset"

**Dexterity.ai:**
- Explicitly edge-based (not cloud)
- CEO quote: "Edge intelligence critical... without any dependence on external systems"
- Uses "hundreds of AI models" managed by "Arbiter" orchestrator

**Latency Constraints:**
- Motor control: <1ms hard real-time
- Robot actuation: 100 Hz = 10ms control cycles
- Cloud round-trip: 48ms to hundreds of ms
- Quote: "Getting a stop command three seconds late really matters"

### Noam Brown (OpenAI) - Inference-Time Compute
**Source:** Various interviews about o1
> "It turned out that having a bot think for just 20 seconds in a hand of poker got the same boosting performance as scaling up the model by 100,000x and training it for 100,000 times longer."

---

## PART III: HARDWARE COST DATA

### Unitree Pricing History
| Model | Date | Price | Specs |
|-------|------|-------|-------|
| H1 | Aug 2023 | $90,000 | 1.8m tall, 47kg, 3.3m/s world record |
| G1 | May 2024 | $16,000 | 1.27m tall, 35kg, 23-43 DoF |
| R1 | July 2025 | $5,900 | 1.21m tall, 25kg, 26 joints, remote-controlled |

**Key stat:** 93% price reduction in under 2 years (H1 to R1)
**R1 Note:** Base $5,900 (39,999 yuan), Pro ~$16,000, requires $3,000 deposit, delivery early 2026, no hands in base version

### Boston Dynamics Atlas
**Status:** NOT FOR SALE
- No public price tag exists
- Industry estimates: ~$140,000 for electric version
- Currently pilot testing with Hyundai + small customer group
**Spot:** $74,500 base (Explorer Kit), can exceed $100K with add-ons
**Timeline:**
- July 2013: First hydraulic Atlas (DARPA-funded)
- April 16, 2024: Hydraulic Atlas retired
- April 17, 2024: Electric Atlas announced

### Component Cost Collapse
- LIDAR: $75,000 (2012) → $100 (2025)
- Servo motors: commodity (drone/EV supply chain)
- IMUs: smartphone commodity
- Batteries: EV-driven cost curves

### Goldman Sachs Cost Projections
**Source:** Goldman Sachs Research Reports (Feb 2025)
- 40% cost decline year-over-year (faster than expected 15-20%)
- Factory viability: 2024-2027 (revised from 2025-2028)
- Consumer viability: 2028-2031 (revised 2-4 years earlier)

---

## PART IV: VOLUME PROJECTIONS

### Goldman Sachs (Feb 2025)
| Year | Units |
|------|-------|
| 2027 | 76,000 |
| 2030 | 250,000 |
| 2032 | 502,000 |
| 1M milestone | 2034-2035 (base), 2030-2031 (optimistic), 2028-2029 (most optimistic) |

**Key quote:** Market "extremely optimistic" - Goldman warns growth potential overdrawn

### Morgan Stanley
- 2050: ~1 billion humanoids, 90% industrial/commercial
- China: 302.3 million by 2050
- US: 77.7 million by 2050
- Price projections: $150,000 (2028) → $50,000 (2050) → $15,000 (2050, China supply chain)

### China EV Ramp (Precedent)
- 2014: ~75,000 EVs
- 2024: ~10 million EVs
- CAGR: 63%

### Our Projections
| Scenario | 2027 | 2030 | Key Assumption |
|----------|------|------|----------------|
| A: Goldman Linear | 45k | 250k | Commercial only |
| B: EV Analogy | 100k | 800k | China push = EV push |
| C: Faster Than EV | 200k | 2.2M | Pre-built supply chain |
| D: Security Mobilization | 350k | 4M | Strategic asset |

**Base case:** 100k-200k by 2027, 800k-2M by 2030

---

## PART V: DEMAND DATA

### Labor Shortage
**Source:** Korn Ferry
- 85.2 million worker shortage by 2030 globally

**US Eldercare:**
- 4.6M unfulfilled jobs by 2032

**China Demographics:**
- Working-age population: 61.3% → ~40% by 2050

**Japan:**
- Population: 127M → 88M by 2065

### Cost Per Hour Calculation
- $6k robot, 20 hrs/day, 3-year amortization
- Capex: ~$0.27/hour
- Plus maintenance (15% annually), electricity
- **Total: ~$1.00-1.50/hour all-in**
- Pearl River Delta labor: higher than this
- At this price, demand infinite for tasks robot can do

### Vertical Market Data

**Construction:**
- US market: $1.4 trillion
- US unfilled positions: 500,000+
- Task repetitiveness: High (drywall, painting, material hauling)
- Environment: Semi-structured (chaotic but not random)
- Safety motivation: High (dangerous industry)

**Warehousing:**
- Already deploying (Amazon/Agility, 10+ pilots)
- Clear ROI metrics
- Controlled environment
- Amazon: 750,000+ robots across 300+ facilities (traditional + humanoid pilots)

**Manufacturing:**
- BMW pilot with Figure
- BYD pilot with UBTECH
- "Last mile" tasks: material handling between stations, flexible assembly, low-volume lines

**Eldercare:**
- Japan will lead (demographic crisis)
- Regulatory barriers, trust issues
- Toyota HSR, other pilots

### Traditional Robotics Comparison
Humanoids compete where traditional robotics CAN'T:
| Traditional | Humanoid Advantage |
|------------|-------------------|
| Fixed position | Mobile |
| Single task | Multi-task |
| Structured | Unstructured |
| High volume, low mix | Low volume, high mix |
| Purpose-built space | Human-designed space |

---

## PART VI: FOUNDATION MODEL ROBOTICS

### RT-2 (Google, July 2023)
**Source:** https://deepmind.google/discover/blog/rt-2-new-model-translates-vision-and-language-into-action/
- VLM pre-training enables 2x performance on unseen tasks vs RT-1
- Emergent reasoning demonstrated

### π0 (Physical Intelligence, 2024)
- 2.6B parameters
- Fine-tuning requires only 1-20 hours of data for new tasks
- Cross-embodiment transfer demonstrated

### Physical Intelligence Human-to-Robot Transfer (Dec 16, 2025)
**Key Finding:**
> "Adding robot data in pre-training improves absorption of human data in fine-tuning"

**Stronger interpretation:** Transfer already happened during VLM pretraining

### Training Data Comparison
| Model | Data | Parameters |
|-------|------|------------|
| GPT-3 (2020) | 300B tokens | 175B |
| GPT-4 (2023) | ~13T tokens | 1.76T (MoE) |
| CLIP (2021) | 400M image-text pairs | ~400M |
| RT-1 (2022) | 130k+ episodes | 35M |
| RT-2 (2023) | Same robot data + VLM | 55B |
| π0 (2024) | 10k+ hours + VLM | 2.6B |

### Simulation-to-Real Transfer
**GR00T (NVIDIA):**
- 780,000 synthetic trajectories generated in 11 hours
- Equivalent to 6,500 hours (9 months) of human demonstration
- 40% performance improvement with synthetic + real data

---

## PART VII: GEOPOLITICAL / CHINA

### China Robotics Fund
- $140B government robotics fund announced

### China Robot Density
- 470 robots per 10k workers (vs. 162 global average)
- 100+ humanoid robotics companies

### PLA Military Robotics
**Source:** Defense One (April 2025), Army Recognition (Oct 2025)

**November 2025:** PLA demonstrated combat robot to 13 foreign militaries

**October 2025:** Armed robot dogs in amphibious drill near Taiwan

**PLA Documents:**
> "Humanoid robots can serve as decoys to draw enemy fire, even willingly 'sacrificing' themselves to protect humans."

> "The biggest obstacle for China to complete the great cause of reunification..."

**China Association for Science and Technology:**
> "Quantity is an important aspect that affects combat effectiveness. The effect and power of a humanoid robot in attacking actions are very limited, but the large-scale use of humanoid robots to form clusters can achieve a leap in attack capabilities."

---

## PART VIII: OPENAI ROBOTICS HISTORY

### Disbanding (2020-2021)
**Source:** Weights & Biases podcast with Wojciech Zaremba

**Wojciech Zaremba Quotes:**
> "It turns out that we can make a gigantic progress whenever we have access to data... There are actually plenty of domains that are very, very rich with data. And ultimately that was holding us back in terms of robotics."

> "When we created robotics [systems], we thought that we could go very far with self-generated data and reinforcement learning. At the moment, I believe that pretraining [gives] model[s] 100 times cheaper 'IQ points.'"

### Restarting (2024)
- ~March-April 2024: New robotics team formed
- May 2024: Forbes confirmed reboot
- Focus: Multimodal LLMs for robotics; collaboration with external partners
- December 2024: Hired Caitlin Kalinowski (former Meta AR/robotics lead)

### Investments
| Company | Round | Amount | Date |
|---------|-------|--------|------|
| 1X Technologies | Series A2 | $23.5M (led) | March 2023 |
| Figure AI | Series B | Part of $675M | Feb 2024 |
| Physical Intelligence | Seed | Part of $70M | March 2024 |
| Physical Intelligence | Series A | Part of $400M | Nov 2024 |

**Note:** Figure AI ended OpenAI collaboration Feb 2025 to develop proprietary AI

---

## PART IX: RETHINK ROBOTICS FAILURE

**Total Funding:** ~$150 million (7 rounds)
**Shutdown:** October 3, 2018

### Robot Pricing
- Baxter (2012): $22,000-$25,000 — 2 arms, 5 lb payload each
- Sawyer (2015): $29,000 — Single arm, 4 kg payload

### Primary Failure Cause: Series Elastic Actuators (SEAs)

**Ilian Bonev (Professor, École de technologie supérieure):**
> "The SEAs introduce substantial flexibility in the joints of the robot. That is good for safety, but bad for precision and motion performance. It is extremely difficult to control a flexible manipulator, especially when trying to minimize cycle times."

**Paul Maeder (Highland Capital Partners investor):**
> "In the end, the series elastic actuators were probably not the best idea in the world. What customers really want is a low-cost, simple, fast, repeatable robot... In the end, that was a lot more complicated for us to achieve than for some of our competitors."

### Sales Performance
- Rethink by end 2015: ~1,000 total
- Universal Robots by end 2015: 8,000+
- Rethink by Oct 2018: ~1,000-2,000 estimated
- Universal Robots by Oct 2018: 25,000+

---

## PART X: INSIDER SIGNALS

### Logan Kilpatrick (Google DeepMind, Group PM for AI Studio/Gemini API)
**Background:** Former OpenAI DevRel lead, now leads Gemini API product at Google DeepMind
**Twitter:** @OfficialLoganK (222K followers)

**Tweet (Dec 21, 2025, 3 hours ago):**
> "2026 is going to be a huge year for embodied AI"
> "or put differently, we are going to see a lot more robots in the real world soon"

**Other notable tweets:**
> "If you are not planning for the price of intelligence to go to zero, the next 3-5 years are going to incredibly disruptive to your business / life."

**On Gemini 3 demand:**
> "There's not enough TPUs in the world to serve all the demand that there is for Gemini 3."

**On emergence:**
> "It's hard for even us to know which product experiences will just start working because of improvements in AI."

**Relevance:** Insider signal from Google about Gemini robotics timeline. He has visibility into what Google is building.

### Demis Hassabis on Robotics (WIRED, Nov 2025)
> "You can sort of think of it as a bit like an Android play. We want to build an AI system, a Gemini base, that can work almost out-of-the-box across any body configuration. Obviously humanoids, but non-humanoids too."

---

## PART XI: INFERENCE COST DATA

### Cost Decline Rate
- ~79% per year decline (various sources)
- GPT-4 equivalent inference ~100x cheaper than 2023 launch

### Embodied Chain-of-Thought (ECoT)
**Source:** arXiv:2407.08693
> "We train VLAs to perform multiple steps of reasoning about plans, sub-tasks, motions, and visually grounded features like object bounding boxes and end effector positions, before predicting the robot action."
- 28% improvement in absolute success rate on OpenVLA

---

## QUICK REFERENCE: KEY NUMBERS

| Metric | Value | Source |
|--------|-------|--------|
| Unitree price collapse | 93% in 2 years | H1→R1 |
| Goldman 2030 projection | 250,000 units | GS Feb 2025 |
| Our base case 2030 | 800k-2M units | Analysis |
| China robot density | 470 per 10k workers | IFR |
| Global labor shortage 2030 | 85.2 million | Korn Ferry |
| China robotics fund | $140 billion | Government |
| Figure Helix S1 | 80M params, 200Hz | Figure.ai |
| Figure Helix S2 | 7B params, 7-9Hz | Figure.ai |
| RT-1 training data | 130k episodes | Google |
| π0 fine-tuning data | 1-20 hours | Physical Intelligence |
| ELO gain from thinking | 600+ | Hassabis/AlphaGo |
| Inference cost decline | ~79%/year | Various |
| Wintel profit concentration | >100% of PC industry | HBS |

---

## PART XII: VERTICAL SEQUENCING PREDICTIONS

### Where Humanoids Compete (vs Traditional Robotics)

| Traditional Robotics | Humanoid Advantage |
|---------------------|-------------------|
| Fixed position | Mobile |
| Single task | Multi-task |
| Structured environment | Unstructured |
| High volume, low mix | Low volume, high mix |
| Purpose-built space | Human-designed space |

### Tier 1: Already Happening (2025-2027)
**Warehousing**
- Amazon/Agility pilots
- Picking varied items, stowing
- Controlled environment, clear ROI metrics
- Already deploying at scale

**Manufacturing "Last Mile"**
- Tasks that CAN'T be automated by fixed robots
- Material handling between stations
- Flexible assembly, low-volume lines
- BMW/Figure pilot

### Tier 2: Breaking Out (2027-2029)
**Construction (The Sleeper)**
- $1.4T US market
- 500k+ unfilled positions
- Tasks like drywall, painting, material hauling are actually repetitive
- Massive labor shortage = willing to try new tech
- China building infrastructure = natural deployment ground

**Logistics**
- Last-mile delivery
- Loading/unloading

### Tier 3: Slower (2029+)
**Agriculture**
- Harvesting delicate crops (strawberries)
- Already some specialized robots

**Eldercare**
- Japan will lead (demographics)
- Regulatory barriers, trust issues

**Retail/Hospitality**
- Shelf stocking, cleaning
- Lower wages = harder ROI

### By 2027 Predictions
- 10,000+ humanoids deployed at single company (Amazon or BYD)
- Manufacturing pilots convert to production runs
- First construction pilots (controlled residential sites)

### By 2030 Predictions
- Warehousing: 100k+ humanoids deployed globally
- Manufacturing: Humanoids handling 5-10% of "last mile" tasks at major OEMs
- Construction: First scaled deployment (1000+ units at single project/company)
- Eldercare: Japan pilots beginning

### Economic Value Estimate by 2030
- Direct labor replacement: $5-15B annually
- Calculation: 500k humanoids × $10-30k labor savings each
- Still tiny vs $85T global labor market
- But growing 50%+ annually

### The Traditional Software Analogy
- Excel didn't replace accountants — made them 10x productive
- CAD didn't replace architects
- Humanoids won't replace ALL factory workers
- They'll replace SPECIFIC task categories
- And create new roles (robot supervisors, teleoperation, fleet management)
- But also: ATMs DID replace many bank tellers. Some jobs just go away.

---

## DOCUMENT VERSION
Last updated: December 21, 2025
