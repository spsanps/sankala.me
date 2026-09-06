# GPT-7 Will Have Arms

**The Coming Satisfactory of Foundation Models and Robotics**

---

# PART I: THE DISSOLUTION

## 1. The Claim

The robot that folds your laundry will run GPT-7.

Not a robotics model. Not a purpose-built manipulation system. The same model that writes your emails and summarizes your documents will control a pair of mechanical hands folding your shirts.

This sounds wrong. For forty years, robotics and AI have been separate fields with separate conferences, separate funding, separate experts. Roboticists built manipulation systems. AI researchers built language models. The two barely talked.

That's over.

In December 2024, Physical Intelligence published a result that should have made headlines: adding robot data to a vision-language model made the model better at learning from *human* video. Not just robot video — human video. The foundation model had already learned physics from watching YouTube. The robot data just taught it what having a body felt like.

Google DeepMind is building Gemini Robotics. OpenAI restarted its robotics team in 2024 and hired Meta's AR hardware lead. Nvidia announced GR00T. Physical Intelligence raised $400 million at a $2 billion valuation. The teams that trained GPT-4 and Gemini are now training robot brains — using the same architecture, the same scaling laws, the same infrastructure.

This essay makes three claims:

**First**, the same scaling approach that transformed language AI will transform physical AI within 2-3 years. The hard part — learning physics, understanding objects, reasoning about manipulation — is already mostly solved. It happened during video pretraining. The robot-specific training is just the last mile.

**Second**, the winning architecture is more centralized than most people expect. The discourse treats robotics as an "edge computing" problem where intelligence runs on-device. That's wrong. The economically rational architecture is one cloud brain running millions of robot bodies — what I'll call the VIKI model, after the central AI in *I, Robot*. The slider between edge and cloud is moving much further toward cloud than robotics experts realize.

**Third**, this is happening now, and the stakes are higher than the tech press suggests. China demonstrated PLA combat robots to thirteen foreign militaries in November 2025. The $140 billion Chinese robotics fund isn't about factory efficiency. It's about what PLA documents call "completing the great cause of reunification." The question "who controls the robot brain?" is already a national security question.

Logan Kilpatrick, the product lead for Google's Gemini API, tweeted three hours ago: "2026 is going to be a huge year for embodied AI." He followed up: "We are going to see a lot more robots in the real world soon."

He's not speculating. He's at Google DeepMind. He knows what's coming.

---

## 2. What Video Models Taught Us

Here's something that should surprise you: video generation models understand physics.

Not metaphorically. Literally. Sora, OpenAI's video model, can simulate fluid dynamics. Not because anyone programmed Navier-Stokes equations into it — because it watched enough videos of water pouring that it reverse-engineered the underlying physics.

Demis Hassabis, CEO of Google DeepMind, said this in July 2025:

> "Fluid dynamics, Navier-Stokes equations, these are traditionally thought of as very, very difficult intractable problems... But if you look at something like Veo, our video generation model, it can model liquids quite well, surprisingly well."

He continued:

> "It seems like you can understand physics through passive observation, which is pretty surprising to me."

This is the CEO of DeepMind saying he's surprised. The models learned something nobody explicitly taught them.

OpenAI's technical report on Sora described it as a "world simulator." That framing was easy to dismiss as marketing. It wasn't. The model that generates video has to predict what happens next — which means it has to understand how the world works. Gravity. Momentum. Occlusion. Object permanence. The training objective forces the model to learn physics.

Five years ago, if you'd asked AI researchers how robots would learn manipulation, they would have said: embodied learning. Robots learning by doing, in simulation or the real world, building up intuitions through millions of trials. That was the conventional wisdom. You need a body to learn about bodies.

Hassabis, in the same interview:

> "Even if you were to ask me five, 10 years ago, I would've said... you probably need to understand intuitive physics... And there was a lot of theories about you'd need embodied intelligence or robotics... But it seems like you can understand it through passive observation."

The models learned physics from YouTube. Not from robot teleoperation. Not from simulation. From watching humans pour water and stack blocks and fold laundry.

This is why the robotics timeline is compressing. The hard part — building a model that understands the physical world — was supposed to take decades of robotics research. It happened as a side effect of training video models. The foundation is already laid. What's left is connecting it to robot bodies.

---

## 3. The Straight Line

Text to images to video to actions. It's one continuous path.

GPT-3 (2020) learned language from 300 billion tokens of internet text. CLIP (2021) learned to connect language and images from 400 million image-text pairs. GPT-4V (2023) could see and reason about images. Sora (2024) could generate coherent video. And now — RT-2, π0, Gemini Robotics — the models are learning to act.

Same architecture. Same training approach. Same scaling laws. The transformer that learned grammar from Reddit is learning physics from YouTube and manipulation from teleoperation data.

This is not a metaphor. Google's RT-2 paper (July 2023) demonstrated it directly. They took a vision-language model pretrained on internet data and fine-tuned it on robot demonstrations. The result: a robot that could follow instructions it had never seen, manipulate objects it had never touched, reason about goals in ways the training data never specified.

The key finding: RT-2 showed *emergent reasoning* about physical tasks. When asked to "pick up the extinct animal," the robot picked up the plastic dinosaur. When asked to "move the object to the correct country" with a plate showing country flags and fruits, it moved the banana to the Ecuadorian flag. The model wasn't trained on these specific tasks. It *reasoned* its way to them, combining knowledge from language pretraining with physical capabilities from robot fine-tuning.

This is the same pattern we saw in language models. GPT-3 wasn't trained to do arithmetic, but it could do simple math. GPT-4 wasn't trained on the bar exam, but it passed. Capabilities emerge at scale in ways that aren't explicitly programmed.

RT-2 was the proof of concept. π0 (Physical Intelligence, October 2024) and Gemini Robotics (Google DeepMind, announced March 2025) are the productization.

Physical Intelligence's approach is telling. They raised $70 million in seed funding, then $400 million in Series A, to build a "foundation model for robotics." Not a manipulation system. Not a task-specific controller. A foundation model — the same category as GPT-4 and Gemini. Their bet is that scaling works for robotics the same way it works for language.

Their December 2024 paper suggests they're right. The finding I keep coming back to:

> "Adding robot data in pre-training improves absorption of human data in fine-tuning."

This is subtle but crucial. It's not just that robot data helps with robot tasks. Robot data makes the model *better at learning from human data*. The transfer is bidirectional. The modalities reinforce each other.

The strong interpretation: the model had already learned physics from video. The robot data didn't teach it physics. The robot data taught it what having a body feels like — how to map that physical understanding to specific actuators and sensors. The hard conceptual work was already done.

If this interpretation is correct, the implications are staggering. The teams training GPT-5 and Gemini 3 are, without quite realizing it, training the robots of 2027. The same infrastructure, the same researchers, the same scaling curves. When GPT-7 ships, it won't just answer questions.

It will have arms.

---

## 4. The Domain Expertise Illusion

In 2019, Rich Sutton — one of the founders of reinforcement learning — wrote an essay called "The Bitter Lesson." It's become famous in AI circles. The core claim:

> "The biggest lesson that can be read from 70 years of AI research is that general methods that leverage computation are ultimately the most effective, and by a large margin."

The "bitter" part is that this keeps surprising researchers. Every field thinks it's special. Every domain expert believes their hard-won knowledge is irreplaceable. And then scale wins.

> "Researchers always try to build knowledge into their agents. This always helps in the short term, and is personally satisfying to the researcher, but in the long run it plateaus and even inhibits further progress. Breakthrough progress eventually arrives by an opposing approach based on scaling computation."

Chess. Go. Protein folding. Machine translation. Image recognition. Speech synthesis. In every domain, the pattern repeated: hand-engineered systems with decades of expert knowledge were swept away by scaled-up learning systems that discovered their own representations.

Natural language processing is the most recent example. And the most violent.

In April 2025, Quanta Magazine published an oral history of the NLP community's reaction to ChatGPT. The interviews are stunning.

Christopher Callison-Burch, professor at UPenn:

> "I'm trying out all the things that my recent Ph.D. students had done as their dissertations, and just realizing—oh my God, the thing that had taken a student five years? Seems like I could reproduce that in a month."

Iz Beltagy, researcher at the Allen Institute:

> "In a day, a lot of the problems that a large percentage of researchers were working on—they just disappeared."

R. Thomas McCoy, professor at Yale:

> "ChatGPT did that to entire types of research, not just specific projects. A lot of higher categories of NLP just became no longer interesting—or no longer practical—for academics to do."

Christopher Potts, chair of Stanford's Linguistics department:

> "The hallmark of a paradigm shift is that questions we used to think were important now no longer get asked. It feels like that has happened over the past five years."

Nazneen Rajani, former researcher at Hugging Face:

> "They fired people from the research team and the rest would either be doing pre-training or post-training—which means that you are either building a foundation model or you're taking a foundation model and making it an instruction-following model."

The NLP researchers didn't see it coming. They were world experts in parsing, syntax, semantics, discourse. They had spent decades building linguistic knowledge into systems. And then a team at OpenAI trained a large transformer on internet text and made most of that expertise irrelevant.

This is about to happen to robotics.

The roboticists don't see it coming either. They're debating actuator designs and sim-to-real transfer and contact dynamics while foundation model labs are shipping products. They're presenting at ICRA while Google is building Gemini Robotics. They are, right now, in 2018.

Rethink Robotics is the cautionary tale. Founded by Rodney Brooks — MIT professor, iRobot co-founder, one of the most respected roboticists alive. They raised $150 million to build collaborative robots. Their key innovation: Series Elastic Actuators, a sophisticated approach to making robot arms safe and compliant. Years of engineering research. Careful mechanical design. Deep domain expertise.

They shut down in October 2018.

The problem wasn't that the technology didn't work. The problem was that they'd built *knowledge* in — exactly what the Bitter Lesson warns against. Their robots were expensive because they required expensive engineered components. Competitors like Universal Robots shipped simpler designs at lower prices. By the time Rethink shut down, Universal had sold 25,000 robots to Rethink's ~1,500.

The next generation won't be decided by actuator design. It will be decided by model scale.

The roboticists who survive will be the ones who recognize this early — who stop trying to engineer intelligence and start leveraging foundation models. The ones who don't will be the NLP researchers of 2023, watching their life's work get replicated in a month by a team that never read their papers.

---
# PART II: THE ARCHITECTURE

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

Not for everything. Motor control needs to happen at 200Hz — every 5 milliseconds. You can't wait for a round trip to a datacenter. Reflexes have to be local.

But reasoning doesn't need to be that fast. Deciding *what* to do — pick up the red cup, fold the towel, walk to the kitchen — can happen at 7Hz or even slower. That's 140 milliseconds. Plenty of time for a cloud round-trip.

Figure AI, one of the leading humanoid companies, already builds this way. Their Helix system has two components:

- **System 1**: 80 million parameters, runs on-device at 200Hz. Handles motor control, reflexes, real-time responses to sensor input.
- **System 2**: 7 billion parameters, runs at 7-9Hz. Handles reasoning, planning, language understanding. 

The robot's body runs locally. The robot's mind runs... somewhere else.

Figure hasn't disclosed where System 2 runs. But 7 billion parameters is near the edge of what embedded hardware can handle. Frontier models — the ones that show emergent reasoning — are 100x larger. Those can only run in the cloud.

The implication: as models get more capable, the cloud portion grows. The on-device portion stays small — just enough for reflexes. The intelligence centralizes.

One brain. Millions of bodies. Every robot making every other robot smarter, because they all feed data back to the same model. Overnight updates that improve the entire fleet simultaneously. A single point of control.

VIKI.

---

## 6. The Slider

People talk about "cloud robotics" versus "edge robotics" like it's a binary choice. It's not. It's a slider.

At one end: pure edge. All computation happens on the robot. No network connection required. Tesla's Full Self-Driving works this way — the car runs entirely on its onboard computer. This is the approach roboticists have historically assumed. Robots should be autonomous, self-contained, independent.

At the other end: pure cloud. The robot is a dumb terminal with sensors and actuators. All decisions happen in a datacenter. The robot streams video up, receives motor commands back. This is basically telepresence with AI in the middle.

Most real systems are somewhere in between. And the interesting question is: where is the slider going?

Consider Waymo. The self-driving car company is usually described as running "on-device" — the cars drive themselves without constant cloud connectivity. True, but incomplete. Waymo cars download high-definition maps from the cloud. They upload sensor data for training. They receive software updates that change their behavior. The real-time driving decisions happen locally, but the *intelligence* — the model weights, the accumulated knowledge — comes from a centralized system that learns from the entire fleet.

Amazon's warehouse robots are similar. 750,000 robots across 300+ facilities, coordinated by a central system that handles routing, traffic optimization, and task allocation. The robots execute locally, but they're nodes in a centralized network.

The discourse treats this as "mostly edge with a little cloud assist." That framing understates what's happening.

The valuable part — the intelligence — is already centralized. The local compute just executes. And as models get bigger and more capable, the ratio shifts further toward cloud.

Here's why this matters: whoever runs the cloud controls the robots.

It's not enough to build a robot body. The body is commodity hardware — we'll see in Part III that humanoid costs are collapsing toward $5,000. The intelligence is the moat. And if the intelligence lives in the cloud, run by Google or OpenAI or some Chinese equivalent, then the hardware company is just a systems integrator.

The robotics industry thinks it's building robots. It might actually be building terminals.

---

## 7. The Batch Economics

There's a simple economic reason cloud wins: utilization.

A robot running a model on-device has a GPU that's active only when the robot is thinking. If the robot is walking across a room, the reasoning GPU is idle. If the robot is waiting for instructions, the reasoning GPU is idle. Real-world utilization might be 10-30%.

A datacenter GPU serves many robots simultaneously. When Robot A is walking, the GPU is thinking for Robot B. When Robot B is waiting, it's thinking for Robot C. The same hardware serves 100+ robots by interleaving their requests. Utilization approaches 60-80%.

That's a 3-6x efficiency advantage before you even consider scale effects.

There's more. Model weights are large — a trillion-parameter model takes about 2 terabytes in full precision. Every on-device robot needs its own copy. A cloud datacenter needs one copy shared across all robots it serves. That's not just cost savings. It's what makes trillion-parameter models *possible* for robotics. No embedded system can store 2TB of model weights and run them efficiently.

Now add the training loop.

Every robot interaction generates data. A robot folds a towel successfully — that's a positive example. A robot drops a cup — that's a negative example. In a cloud architecture, all this data flows back to a central model. The model improves. The improvement gets pushed to every robot.

In an edge architecture, each robot learns mostly in isolation. Maybe you periodically aggregate and redistribute. But you don't get the real-time flywheel effect. The cloud architecture learns faster because it has more data. And it learns more efficiently because it can identify patterns across the whole fleet.

The inference cost trends make this more stark over time, not less.

AI inference costs are dropping approximately 79% per year. That's measured in cost per token for language models, but the dynamic applies to any model. The reasons: better chips, better software, better quantization, more competition. OpenAI's GPT-4 API cost about $30 per million input tokens at launch in March 2023. By late 2024, equivalent capability cost under $1. By 2025, under $0.30.

This means: whatever latency/cost tradeoff you're making today gets better next year. If cloud is borderline viable now, it's clearly superior in 18 months. If cloud is clearly superior now, it's dominant in 18 months.

The edge advocates are fighting a losing battle. Not because edge is bad — it's essential for reflexes. But for reasoning, planning, language understanding, anything that benefits from model scale — cloud wins and wins more over time.

---

## 8. The Revenue Hunt

Here's something the tech press doesn't emphasize enough: AI labs are desperate for revenue.

OpenAI reportedly generated about $2 billion in annual recurring revenue in 2024. That sounds like a lot. But they're spending $5 billion or more on compute. The gap is covered by venture capital and Microsoft's backing. This isn't a sustainable business yet.

The problem is distribution. ChatGPT has 200 million weekly users, but most of them are on the free tier. Enterprise deals are growing but slow — selling to big companies takes time and faces established competitors like Microsoft and Google. Consumer subscriptions have a ceiling; most people won't pay $20/month for a chatbot.

Coding assistants looked promising, but they're commoditizing. GitHub Copilot, Cursor, Claude, Gemini Code Assist — everyone has one. The margins are thin.

AI labs need new revenue streams. They need use cases where AI creates enough value that customers will pay a lot, at scale, recurring.

Robotics fits perfectly.

A robot that replaces a $50,000/year warehouse worker creates real, measurable value. If you charge $10,000/year for the AI — an inference API that runs the robot's brain — you're still giving the customer a 4:1 ROI. And you get paid every hour the robot operates.

The math works even at smaller scale. A $1/hour API fee × 20 hours/day × 365 days/year = $7,300/year per robot. A million robots = $7.3 billion in annual recurring revenue. That's meaningful even by OpenAI's standards.

This is why every major AI lab is suddenly interested in robotics:

- **OpenAI** shut down its robotics team in 2020, citing lack of data. They restarted it in early 2024. They've invested in 1X Technologies, Figure AI, and Physical Intelligence. They hired Meta's AR hardware lead in December 2024.

- **Google DeepMind** announced Gemini Robotics in March 2025. They've published RT-1, RT-2, and RT-X. Demis Hassabis has described robots as the ultimate application of their technology.

- **Nvidia** launched GR00T (Generalist Robot 00 Technology) in 2024. They're building both the chips and the models. Jensen Huang calls humanoid robots "the next wave of AI."

- **Physical Intelligence** exists solely to build foundation models for robotics. $400M Series A, $2B valuation, team recruited from Google, OpenAI, and Berkeley.

These aren't science projects. They're revenue plays.

OpenAI has been experimenting with consumer devices — the rumored collaboration with Jony Ive, interest in voice-first hardware. But here's the thing: a phone can tell you how to fold laundry. A robot can fold it. The value proposition of AI changes fundamentally when AI can take physical action, not just provide information.

The fundamental device for AGI might not be a phone. It might be a humanoid.

If you're an AI lab trying to monetize your foundation model, the highest-value application isn't chat. It's not coding. It's not search. It's controlling physical systems that do real work in the real world.

The race to build robot brains isn't about robotics. It's about the business model of AI.

---

## 9. The Wintel Analogy

In the 1990s, the personal computer industry looked like a competitive market. Dozens of manufacturers — Dell, HP, Compaq, IBM, Gateway, Acer — sold computers to businesses and consumers. They competed on price, features, service, distribution. It seemed like a hardware business.

It wasn't.

A Harvard Business School study found that "the combined profit of Intel and Microsoft during most years in the 1990s exceeded the total profit of the entire world PC industry." Read that again. Intel and Microsoft — who didn't manufacture a single PC — made more profit than every PC company combined.

In 2004, Intel and Microsoft combined earned over $15 billion in net profit. The top three PC OEMs — Dell, HP, and IBM — earned about $2.5 billion combined from their PC businesses. The companies that controlled the "platform layer" — the operating system and the processor — captured 6x the profits of the companies that built the actual hardware.

This was called "Wintel." Microsoft's Windows operating system was bundled with Intel processors. The interface between them was standardized, allowing any hardware manufacturer to build compatible PCs. Competition among hardware makers drove margins toward zero. Intel and Microsoft sat above the fray, collecting rent.

An IHS analyst described it: "Wintel extracted the majority of the profits, controlled every move and compelled all other players to either comply or risk being forced out of the game."

The robotics industry could go the same way.

If foundation models are the operating system — the intelligence layer that makes robots useful — then whoever provides that layer captures the value. The hardware manufacturers compete on cost, driving margins down. The model provider collects API fees on every hour of robot operation.

Chinese manufacturers are already producing humanoids at $6,000. By 2027, probably $5,000. By 2030, maybe $3,000. The hardware is commoditizing. The intelligence isn't.

There's a counterexample, though: Apple.

Apple never played the Wintel game. They kept hardware and software integrated. They controlled the full stack. And they built one of the most valuable companies in history by doing so.

The Apple model in robotics would be: a company that builds both the robot body AND the AI brain, capturing value through integration, design, and ecosystem rather than through platform control.

Tesla is betting on this. They're building Optimus with proprietary hardware AND proprietary AI, trained on data from their vehicle fleet. Figure AI is betting on it too — they ended their collaboration with OpenAI in February 2025 to develop their own AI. 1X Technologies, backed by OpenAI, is nonetheless building their own models.

So there are two winning positions:

1. **The VIKI position**: Be the cloud AI provider. License your foundation model to hardware manufacturers. Capture value through API fees. This is Google/Microsoft territory.

2. **The Apple position**: Build the full stack. Own the hardware, own the software, own the customer relationship. Capture value through integration and premium pricing.

What doesn't work: being the hardware manufacturer without controlling the intelligence. That's being Dell in 1998 — competing on cost with no moat, while the platform owners take all the profit.

The question isn't "hardware vs. software." It's "who controls the intelligence layer." The answer determines everything else.

---
# PART III: THE HARDWARE FLOOD

## 10. The Unitree Trajectory

In August 2023, Unitree — a Chinese robotics company based in Hangzhou — released the H1. A humanoid robot, 1.8 meters tall, capable of walking and running. Price: $90,000.

In May 2024, they released the G1. Smaller (1.27 meters), lighter (35kg), more joints (up to 43 degrees of freedom). Price: $16,000.

In July 2025, they released the R1. Similar form factor, simplified design, remote-controlled with optional autonomy upgrade. Price: $5,900.

That's a 93% price reduction in under two years.

To put this in perspective: Moore's Law describes transistor density doubling every 18-24 months, which works out to roughly 40% cost reduction per year for equivalent compute. Unitree's humanoid cost reduction is *faster* than Moore's Law.

Goldman Sachs, in their February 2025 humanoid robot report, projected 40% annual cost declines continuing through 2030. They expect humanoids to reach "factory viability" by 2027 and "consumer viability" by 2028-2031.

But Goldman might be conservative. Their model is based on gradual scaling and incremental improvements. It doesn't account for what happens when China decides an industry is strategic.

---

## 11. The EV Precedent

The electric vehicle industry shows what "China Speed" looks like.

In 2014, China produced about 75,000 electric vehicles. In 2024, they produced over 10 million. That's 63% compound annual growth sustained for a decade. By 2024, China was producing more EVs than the rest of the world combined.

This didn't happen through market forces alone. The Chinese government identified EVs as a strategic industry. They provided subsidies, mandated adoption quotas, built charging infrastructure, and coordinated the entire supply chain. Dozens of companies emerged. The ones that couldn't compete died. The survivors — BYD, NIO, XPeng — became globally competitive in under a decade.

Humanoid robots are getting the same treatment.

In 2024, China announced a $140 billion government fund for robotics development. Over 100 Chinese companies are now building humanoid robots. The Chinese government's stated goal is to make humanoids a "new engine" for economic development.

But here's what most analyses miss: humanoids are *easier* than EVs.

| Factor | EVs (2014) | Humanoids (2025) |
|--------|-----------|------------------|
| Battery supply | Had to build gigafactories | Already exists (EV supply chain) |
| Battery per unit | $15,000+ (60-100 kWh) | $500-1,500 (1-3 kWh) |
| Motor supply | Had to scale | Already exists (drones, EVs) |
| Parts count | 10,000+ | ~3,000 |
| Crash safety | Heavy regulation | Minimal requirements |
| Assembly time | 20-30 hours | 5-10 hours (estimated) |

The EV ramp required building new supply chains from scratch. Gigafactories for batteries. New production lines for motors. New assembly processes. It took years before the manufacturing base existed.

Humanoids can parasitize the EV supply chain. The batteries are the same cells, just fewer of them. The motors are similar to what's already mass-produced for EVs and drones. The sensors come from smartphones. The compute comes from Nvidia's existing AI chip line.

The hard manufacturing problems are already solved. The supply chain already exists. This means humanoid production can ramp faster than EVs did.

There's another factor: capital efficiency.

An EV costs $30,000+ to manufacture. A humanoid costs $6,000 and falling. The same factory investment produces 5x more units. The same working capital supports 5x more inventory. The same shipping container carries more robots than cars.

EVs required massive capital investment because each unit was expensive. Humanoids can scale with less capital because each unit is cheap.

If you extrapolate the EV growth curve (63% CAGR) onto humanoids, you get astronomical numbers. If you then adjust upward for the supply chain advantages, you get numbers that seem unrealistic — until you remember that nobody in 2014 thought China would be producing 10 million EVs by 2024.

---

## 12. The Components Collapse

Zoom in on the components, and the price collapse makes more sense.

**LIDAR**: In 2012, a LIDAR sensor for autonomous vehicles cost $75,000. By 2025, you can buy one for $100. That's a 99.9% reduction — 750x cheaper — driven by mass adoption in vehicles and drones.

**IMUs (Inertial Measurement Units)**: A decade ago, high-quality IMUs for robotics cost thousands of dollars. Now they're smartphone components. Every iPhone has one. Price: a few dollars.

**Cameras**: Machine vision cameras used to be specialized industrial equipment. Now they're commodity hardware derived from phone cameras. A robot vision system costs less than a GoPro.

**Batteries**: EV production drove lithium-ion cell costs down 90% between 2010 and 2023. A humanoid robot needs 1-3 kWh of batteries — the same cells as an EV, just fewer of them. Cost: $500-1,500, falling.

**Servo motors**: Drones, EVs, and industrial automation have driven servo motor production to massive scale. What was specialized is now commodity.

**Compute**: Nvidia's Jetson Orin — capable of running a 70B parameter model with optimization — costs about $999. The compute needed for on-device reflexes is cheap and getting cheaper.

Every component that goes into a humanoid robot is on a steep cost curve driven by other industries. The humanoid isn't pioneering new manufacturing — it's assembling existing commodity parts in a new configuration.

This is why $5,000 humanoids are plausible by 2027-2028. Not because of manufacturing breakthroughs, but because every input is already cheap and getting cheaper.

The question then becomes: what's the bottleneck?

It's not the hardware. The hardware is becoming commoditized. The motors and batteries and sensors are all on curves that end in "cheap."

The bottleneck is intelligence.

A $5,000 humanoid body with a $0 brain is useless. A $5,000 humanoid body with a frontier AI model is worth $50,000 in labor per year. The value comes entirely from the intelligence.

This is why the robotics industry's obsession with hardware is misplaced. The hardware is a solved problem — or will be within 2-3 years. The intelligence is the differentiator. And the intelligence is being built by AI labs, not robotics companies.

---

## 13. How Many Robots?

Volume projections vary wildly.

Goldman Sachs, in their February 2025 report, projected 76,000 humanoid robots deployed by 2027 and 250,000 by 2030. They see the first million-unit year arriving in 2034-2035 in their base case.

Morgan Stanley projects 1 billion humanoids by 2050, with China accounting for about 300 million.

Market research firms are all over the map, with some predicting 500,000 units by 2027 and 1.4 million by 2035.

Why the disagreement? It comes down to mental models.

If you think of humanoids as industrial equipment — forklifts, CNC machines, welding robots — you model linear adoption curves. Factories adopt new equipment slowly, replacing existing capital stock on depreciation schedules. Payback periods need to be proven. Reference customers need to be established. These dynamics suggest gradual growth.

If you think of humanoids as the next EV — a state-prioritized industry with aggressive government support and rapidly falling costs — you model exponential adoption. China pushes hard, supply chains scale, costs fall, adoption accelerates. This suggests much faster growth.

I'll present four scenarios:

| Scenario | 2025 | 2027 | 2030 | Key Assumption |
|----------|------|------|------|----------------|
| A: Linear (Goldman) | 8k | 45k | 250k | Commercial demand only, gradual adoption |
| B: EV Analogy | 15k | 100k | 800k | China state push equals EV mobilization |
| C: Faster Than EV | 25k | 200k | 2.2M | Pre-built supply chain, simpler product |
| D: Security Mobilization | 30k | 350k | 4M | Strategic asset status, US/China race |

What pushes us toward C or D?

1. **The supply chain already exists.** Unlike EVs, humanoids don't require new gigafactories. The components are already being mass-produced for other applications.

2. **Lower capital requirements.** A $6,000 robot ties up less capital than a $30,000 EV. Production can scale faster with the same investment.

3. **Simpler product.** Fewer parts, no crash safety regulations, shorter assembly time. Manufacturing complexity is lower.

4. **Security motivation.** The EV push was primarily economic. The humanoid push has national security dimensions that create additional urgency.

My base case: **100,000-200,000 units by 2027, 800,000-2,000,000 by 2030.** This is 2-8x Goldman's estimate, driven by factors their model doesn't capture.

The Unitree trajectory is real evidence. $90k to $6k in two years isn't a one-time adjustment. It's a signal that the cost curves are steep and the Chinese manufacturing engine is engaged.

---

## 14. The Security Multiplier

The EV push was economic. The humanoid push is security.

In November 2025, the People's Liberation Army demonstrated combat robots to military delegations from 13 foreign countries. Robot dogs. Armed drones. Humanoid prototypes. This wasn't a trade show. It was a strategic signal.

In October 2025, armed robot dogs participated in amphibious military exercises simulating operations near Taiwan. Chinese state media covered it extensively.

PLA-affiliated publications have discussed humanoid robots in explicitly military terms:

> "Humanoid robots can serve as decoys to draw enemy fire, even willingly 'sacrificing' themselves to protect humans."

And more ominously:

> "The biggest obstacle for China to complete the great cause of reunification..."

The "great cause of reunification" is the annexation of Taiwan.

When China identifies an industry as strategically important — semiconductors, EVs, batteries, solar panels — they mobilize resources at a scale that market economies struggle to match. The $140 billion robotics fund is just the visible part. Provincial governments add more. State-owned enterprises are directed to adopt. Military applications get classified budgets.

This isn't speculation. This is the pattern we've seen repeatedly.

The question isn't whether China will push hard on humanoid robots. The question is how fast supply can scale when the state is pushing.

Goldman's linear projections assume market-driven adoption. They don't model what happens when the PLA places orders for 100,000 units. They don't model provincial governments mandating humanoid pilots in state-owned factories. They don't model the cascade effects when "strategic industry" status unlocks unlimited capital and coordinated policy support.

The EV parallel is instructive. In 2012, skeptics said China would never compete with Western automakers. By 2024, Chinese EVs were threatening to dominate global markets, prompting tariff barriers in the US and Europe. The skeptics weren't wrong about the technology. They were wrong about the will.

The same dynamic applies to humanoids, with an additional accelerant: security motivation.

EVs were about industrial policy and climate goals. Humanoids are about industrial policy *and* military capability *and* demographic crisis *and* Taiwan. The motivations compound.

If Scenario D — "Security Mobilization" — seems implausible, consider what you would have said in 2014 about Chinese EVs. Consider what you would have said in 2019 about Chinese semiconductor manufacturing. Consider what you would have said in 2010 about Chinese solar panels.

China has demonstrated, repeatedly, that when they decide an industry matters, they can move faster than Western analysts expect.

---
# PART IV: THE DEMAND SIDE

## 15. The Labor Crisis

The labor shortage is not a forecast. It's a measurement.

Korn Ferry, the workforce consulting firm, projects an 85.2 million worker shortage globally by 2030. Not a hypothetical — a gap between jobs and workers based on demographic trends already locked in.

The US eldercare sector alone faces a 4.6 million worker shortfall by 2032. There literally aren't enough humans willing to do the work at any wage employers can afford to pay.

China's working-age population has peaked. It was 61.3% of the total population in 2020. Projections show it falling toward 40% by 2050. China is getting old before it gets rich.

Japan is further along the same curve. Population projected to fall from 127 million to 88 million by 2065. Already, convenience stores and nursing homes can't find staff.

South Korea's fertility rate has fallen to 0.72 — the lowest ever recorded in any country. They're on track to have their population cut in half in a single generation.

This isn't about wages being too low. It's about demographics. The workers don't exist. No amount of money can hire people who were never born.

The economic argument for humanoid robots isn't "they're cheaper than humans." It's "there aren't enough humans." In some sectors, the alternative to robots isn't human workers. The alternative to robots is the work not getting done.

Now do the math on robot economics.

A humanoid robot at current Unitree pricing: $6,000 (Unitree R1 base price, July 2025).

Assume it operates 20 hours per day, 350 days per year. That's 7,000 hours annually.

Assume a 3-year useful life, no residual value. Depreciation: $2,000/year.

Add maintenance at 15% of purchase price annually: $900/year.

Add electricity (assume 500W average draw, $0.10/kWh): ~$350/year.

Total annual cost: ~$3,250.

Divided by 7,000 hours: **$0.46 per hour.**

Even if you double everything for conservative assumptions — higher maintenance, more electricity, faster depreciation, support costs — you're at $1.00-1.50 per hour all-in.

Manufacturing wages in Vietnam: $2-3/hour. Manufacturing wages in inland China: $3-5/hour. Manufacturing wages in the US: $20-30/hour.

At $1.50/hour fully loaded, humanoid economics work almost everywhere. The only question is: can the robots actually do the tasks?

---

## 16. The Three Waves

Not all demand arrives at once. I see three waves:

**Wave 1 (2025-2027): Government and Pilots**

The first buyers are entities with high risk tolerance and strategic motivation:

- Chinese state-owned enterprises, directed to adopt by government policy
- Military applications (PLA, DARPA)
- Large enterprises with innovation budgets (Amazon, BMW, BYD)
- Factory pilots converting to production deployments

This wave doesn't need proven ROI. It's driven by strategic mandate (China) or R&D budgets (Western companies). Volume: 50,000-200,000 units per year.

The robots in this wave don't need to be perfect. They need to be good enough to generate data and learning. Expect deployment in controlled environments with human oversight.

**Wave 2 (2027-2030): Commercial Scaling**

As Wave 1 proves ROI, mainstream enterprises start buying:

- Warehouse operators (beyond Amazon)
- Manufacturing (especially low-volume, high-mix production)
- Logistics and material handling
- Commercial cleaning and facilities management

This wave requires demonstrated 2-year payback. The robots need to work reliably enough that CFOs can justify the capital expenditure. Volume: 200,000-2,000,000 units per year.

The capabilities required expand significantly. Not just one task in one environment, but flexible deployment across varied settings. The foundation model advantage becomes decisive — small task-specific models can't generalize; large foundation models can.

**Wave 3 (2030+): Consumer and Services**

If hardware costs hit $5,000 and AI capabilities continue improving:

- Eldercare (Japan leads, others follow)
- Hospitality (hotels, restaurants, retail)
- Home applications
- Personal assistance

This wave depends on robots being cheap enough and capable enough for individual consumers or small businesses. Volume: millions of units per year.

Most projections focus on Wave 3 — home robots, personal assistants. That's the sci-fi vision. But Wave 3 is years away. The near-term story is Wave 1 and Wave 2: factories, warehouses, state procurement.

Goldman's projections assume Wave 1 is slow and Wave 2 starts around 2028. My thesis: Wave 1 is *faster* than Goldman expects because of security motivation (Section 14), and Wave 2 starts in 2026-2027 because VLA progress is faster than expected (Section 17).

---

## 16b. Where Does The Value Come From?

New use cases take time to emerge. The internet existed for years before e-commerce scaled. Smartphones existed for years before Instagram.

The initial value from humanoid robots must come from **worker replacement in existing workflows** — not new use cases we haven't imagined yet. That means the robots need to do tasks humans currently do, in environments designed for humans.

But not all tasks. Traditional industrial robotics already dominates:

- Fixed assembly lines
- Welding and painting
- High-volume pick-and-place
- Structured, repetitive manufacturing

These applications don't need humanoid robots. They're already automated with purpose-built machines that are faster and cheaper than any humanoid will be.

Humanoids compete where traditional robotics can't:

| Traditional Robotics | Humanoid Advantage |
|---------------------|-------------------|
| Fixed position | Mobile |
| Single task | Multi-task |
| Structured environment | Unstructured |
| High volume, low mix | Low volume, high mix |
| Purpose-built space | Human-designed space |

The key insight: humanoids don't replace all factory workers. They fill gaps where flexibility matters more than speed, where environments vary, where tasks change frequently.

The likeliest early verticals:

**Warehousing.** Already happening. Amazon and Agility have deployed Digit robots in fulfillment centers. The environment is controlled but variable — boxes come in different sizes, inventory changes, layouts shift. Perfect for humanoids. Clear ROI metrics. Companies like Amazon have both the capital and the motivation to pioneer adoption.

**Manufacturing "last mile."** The tasks that *can't* be automated by traditional robots. Material handling between stations. Flexible assembly for low-volume runs. Quality inspection that requires moving around. BMW's Figure pilot targets exactly this — work that's too variable for fixed automation but too tedious for humans.

**Construction.** The sleeper. This gets less attention but might be the biggest market.

US construction is a $1.4 trillion industry with a 500,000 worker shortage. The work is physical, dangerous, and — here's the surprise — actually quite repetitive. Hanging drywall is the same motion done thousands of times. Painting is the same motion. Moving materials is the same motion.

Construction sites are chaotic, but they're not random. The environment is semi-structured. And the safety motivation is strong — construction is one of the most dangerous industries. A robot falling off scaffolding is better than a worker falling off scaffolding.

China is building constantly. New housing, new infrastructure, new manufacturing facilities. Natural deployment ground for construction humanoids.

The counterarguments: outdoor variability, coordination with human workers, each site being different, unions (in the US). Real obstacles. But the labor shortage is also real. Someone will figure out the go-to-market.

**The traditional software analogy.** Excel didn't replace accountants. It made them 10x more productive. AutoCAD didn't replace architects. The work changed, but the workers remained, doing different things.

Humanoid robots might follow the same pattern. Not full replacement, but task displacement. Robots handle the repetitive physical work. Humans handle supervision, edge cases, decisions. The total labor hours decline, but humans remain in the loop.

Alternatively: ATMs *did* replace bank tellers. Some jobs just go away.

Both patterns will probably coexist. Some tasks get augmented. Some tasks get eliminated. Which is which depends on the specific task and the pace of capability improvement.

What I'm *not* predicting: exact market sizes by vertical, which company wins which market, when consumer deployment happens. Just that the structural forces are aligned, the capability is arriving, and someone will figure out the business model.

---

## 17. Less Data Than Expected

The robotics data problem was supposed to be hard.

Robots need to learn manipulation. Manipulation requires robot-specific data — you can't learn to pick up a cup without actually picking up cups. But collecting robot data is slow. RT-1, Google's 2022 robotics model, was trained on 130,000 demonstrations collected over 17 months. That's painfully slow compared to scraping the internet.

The data scarcity argument suggested robotics would lag language AI by years or decades. You can train GPT-4 on 13 trillion tokens downloaded from the internet. You can't download robot demonstrations from the internet. The bottleneck seemed fundamental.

It's not.

**RT-2 (July 2023)**: Google took the same robot data as RT-1 and combined it with a vision-language model pretrained on internet data. Result: 2x performance on novel tasks the robot had never seen. The VLM brought knowledge that transferred to manipulation.

**π0 (October 2024)**: Physical Intelligence's foundation model showed that new tasks could be learned with just 1-20 hours of demonstration data. Not 17 months. Hours. The pretraining handles the general understanding; the task-specific data is just calibration.

**Physical Intelligence human-to-robot transfer (December 2024)**: The finding I keep returning to: "Adding robot data in pre-training improves absorption of human data in fine-tuning."

The stronger interpretation: the hard part already happened. When the model was trained on millions of hours of video — humans folding laundry, pouring water, stacking blocks — it learned the physics of manipulation. The robot demonstrations don't teach physics. They teach embodiment: how to map that general understanding to this specific robot's sensors and actuators.

If this is right, the data problem largely disappears.

The 10,000 hours of robot data that Physical Intelligence collected isn't the foundation. It's the fine-tuning. The foundation is the hundreds of billions of video frames the base model saw during pretraining. The robot data is a rounding error by comparison.

This explains why progress is accelerating faster than the "data scarcity" view would predict. The robotics teams aren't building capability from scratch. They're adapting capability that already exists.

**GR00T (Nvidia, 2024)**: Generated 780,000 synthetic robot trajectories in 11 hours of simulation time — equivalent to 6,500 hours (9 months) of human teleoperation. Synthetic data combined with real data showed 40% performance improvement.

Simulation is another path around the data bottleneck. Not a complete solution — sim-to-real transfer remains challenging — but another reason to doubt the "robots will be data-starved for decades" narrative.

The upshot: expect faster capability improvement than consensus projections assume. The data constraint is loosening. The teams training frontier models have implicit physics understanding they haven't fully exploited yet. When they turn that capability toward robotics, progress will be faster than the robotics community expects.

---

## 18. The Convergence

Five trend lines are converging in 2025-2027:

**Model capability**: Rising. RT-2 (2023) → π0 (2024) → Gemini Robotics (2025). Each generation shows emergent capabilities the previous generation lacked. The slope is steep and there's no sign of plateau.

**Hardware cost**: Falling. $90,000 (H1, 2023) → $16,000 (G1, 2024) → $6,000 (R1, 2025). Goldman projects 40% annual declines continuing. Sub-$5,000 humanoids by 2027-2028.

**Inference cost**: Falling. ~79% per year decline in cost per token. Cloud AI becomes more economical every quarter. The latency/cost tradeoff for cloud robotics improves continuously.

**Data efficiency**: Rising. VLM pretraining reduces robot-specific data requirements by orders of magnitude. What took 17 months in 2022 takes hours in 2024.

**Labor pressure**: Rising. Demographics don't reverse. The worker shortage gets worse every year as populations age and birth rates stay low.

This is the window.

I've seen "robotics is about to take off" predictions before. They were wrong for decades. Why is this time different?

**1. The intelligence actually works.** Previous robotics hype cycles assumed intelligence would come from robotics research. It didn't. This time, the intelligence is coming from foundation models, and foundation models actually work. RT-2's emergent reasoning, π0's cross-embodiment transfer — these are real capabilities demonstrated in published research, not vaporware.

**2. The hardware is actually cheap.** Previous hype cycles featured $500,000 research platforms. This time, production humanoids are $6,000 and falling. The economics work at scale, not just in demos.

**3. The demand is actually urgent.** Previous hype cycles offered "wouldn't it be cool if" applications. This time, there's an 85 million worker shortage. Companies are desperate for labor. The pull is real.

**4. The state is actually pushing.** Previous hype cycles were market-driven. This time, China has identified humanoid robots as a strategic industry with $140 billion in funding and national security motivation. The push is real.

When a technology transition happens, it's because capability, cost, demand, and support all align simultaneously. For humanoid robots, they're aligning now.

This doesn't mean success is guaranteed. Technical obstacles remain. Deployment challenges remain. Business model questions remain. But the structural forces are more favorable than they've ever been, and the timeline is compressing.

---
# PART V: THE STAKES

## 19. Who Becomes VIKI?

If cloud robotics wins — one brain, millions of bodies — then the central question becomes: who runs the brain?

There are four scenarios:

**Scenario 1: American VIKI**

Google DeepMind or OpenAI builds the dominant robotics foundation model. Chinese hardware manufacturers produce the bodies, but they're dumb terminals connecting to American cloud infrastructure. The US captures the value and the control.

In this scenario, America maintains technological supremacy in AI while China handles manufacturing. Similar to how iPhones are assembled in China but the value accrues to Apple. The "intelligence tax" flows to Mountain View and San Francisco.

Geopolitical implications: US maintains leverage. Chinese manufacturing is dependent on American AI. Export controls could disable Chinese robots like they've disrupted Chinese chip production. American AI values — whatever those turn out to be — propagate globally through robot behavior.

**Scenario 2: Chinese VIKI**

Baidu, Alibaba, or a state-backed AI lab builds the dominant model. Chinese hardware manufacturers integrate with Chinese AI. Non-Western countries adopt the cheaper Chinese full-stack solution.

In this scenario, China captures both the manufacturing and the intelligence. Similar to how Huawei tried to dominate telecom infrastructure. The "intelligence tax" flows to Beijing (or Hangzhou, or Shenzhen).

Geopolitical implications: China gains leverage over any country using Chinese robot infrastructure. Surveillance concerns — do Chinese cloud robots report back to Beijing? Soft power through deployment in Belt and Road countries. American AI companies become regional players, locked out of most of the world.

**Scenario 3: Bifurcation** (Most Likely)

The US and China each develop their own robot AI stacks. Western allies use American VIKI. China and aligned countries use Chinese VIKI. The world splits into two robot ecosystems that don't interoperate.

This is what happened with 5G, where Huawei dominates in some countries and is banned in others. It's what's happening with semiconductors, where export controls are creating separate US and Chinese supply chains.

Geopolitical implications: Competing standards. Interoperability challenges. Countries forced to choose sides. Neutral countries play both ecosystems. Cold War dynamics extend to robot infrastructure.

**Scenario 4: Fragmentation**

Multiple regional players — European, Japanese, Korean, Indian — develop independent robot AI capabilities. No single VIKI dominates. Standards fragment. Local champions serve local markets.

Geopolitical implications: Reduced systemic risk — no single point of failure or control. But also reduced efficiency — less data sharing, slower capability improvement, more expensive robots for everyone.

---

My probability distribution:

| Scenario | Probability | Key Driver |
|----------|-------------|------------|
| American VIKI | 15% | Requires US maintaining overwhelming AI lead |
| Chinese VIKI | 10% | Requires China overcoming chip constraints |
| Bifurcation | 55% | Most consistent with current trajectory |
| Fragmentation | 20% | Requires multiple players reaching capability parity |

Bifurcation is most likely because it's what's already happening in adjacent domains. The chip war. The 5G split. The divergence of internet platforms. The robot split would follow the same fault lines.

But even in a bifurcated world, the question "who controls VIKI in your bloc?" matters enormously. Within the Western bloc, is it Google? OpenAI? Microsoft? Amazon? A consortium? The internal politics of AI control will shape the trajectory even if the US-China split is predetermined.

---

## 20. The China Race

This is not speculative.

In November 2025, the People's Liberation Army invited military delegations from 13 countries to observe demonstrations of combat robotics. Robot dogs. Armed drones. Humanoid prototypes. The Chinese defense ministry called it a showcase of "intelligent warfare capabilities."

In October 2025, Chinese state media broadcast footage of armed robot dogs participating in amphibious assault exercises. The exercises simulated operations targeting Taiwan. The robots were explicitly framed as first-wave assault units.

PLA-affiliated research institutions have published extensively on military applications of humanoid robots. One paper discussed humanoids serving as "decoys to draw enemy fire, even willingly 'sacrificing' themselves to protect humans." Another discussed "cluster" deployment — using "large-scale" humanoid robots to "achieve a leap in attack capabilities."

The China Association for Science and Technology, a government body, published analysis arguing that "quantity is an important aspect that affects combat effectiveness" and that "humanoid robots can be used as a kind of 'cannon fodder' in the form of human-machine coordination."

The phrase "great cause of reunification" appears in PLA documents discussing robotics capabilities. This is the official euphemism for the annexation of Taiwan.

DeepSeek, the Chinese AI company that shocked Western observers by matching GPT-4 performance at a fraction of the cost, is integrated into Chinese military procurement systems. The same models powering chatbots are being evaluated for robotic combat applications.

This isn't a future scenario. This is documented present activity.

The Western response has been muted. DARPA funds robotics research. Boston Dynamics does military contracts. But there's no equivalent to China's $140 billion fund. There's no strategic mobilization. The US is treating this as a commercial market; China is treating it as a strategic asset.

When the gap in strategic commitment is this large, the outcomes are predictable. China will move faster. They'll deploy first at scale. They'll iterate on real-world data while Western companies are still running pilots.

The question isn't whether China will have robot capabilities. They already do. The question is whether the US recognizes this as a strategic competition — and whether that recognition comes early enough to matter.

---

## 21. The Taiwan Calculus

Taiwan's current strategic position rests on a simple logic: Taiwan manufactures the world's most advanced semiconductors. Any conflict that damages TSMC's fabs harms everyone, including China. This creates a "silicon shield" — mutual assured economic destruction that deters invasion.

Robot labor could erode that shield.

Here's the logic:

Taiwan's chip dominance matters because chips are essential inputs to everything — phones, cars, servers, robots. If China invades Taiwan and chip production stops, the global economy crashes. China's economy crashes too. Therefore China won't invade.

But if robots can perform manufacturing labor, the value of human workers in global supply chains decreases. If China can produce goods without needing workers from other countries, their economic interdependence decreases. If economic interdependence decreases, the cost of conflict decreases.

More specifically: if China can build robot-operated factories that produce many of the goods currently produced in Taiwan, Korea, Japan, and Vietnam, then disrupting those countries' production matters less. The "we're all in this together" logic weakens.

This is not an argument that robots enable a Taiwan invasion. It's an argument that robots change the calculation. Every factor that makes conflict less costly makes conflict more likely at the margin.

There's a second-order effect: robot-operated factories don't create political pressure against war.

When American companies depend on Taiwanese chips, American CEOs lobby against policies that risk conflict. When American consumers depend on goods from Asian manufacturing, American voters have a stake in stability. Economic interdependence creates political constituencies for peace.

Robot factories operated by AI don't vote. They don't lobby. They don't organize protests. A robot-heavy economy has fewer humans with economic stakes in international stability.

I don't want to overstate this. There are many reasons Taiwan remains defensible. Chip manufacturing is extraordinarily hard to relocate. Economic interdependence extends far beyond manufacturing labor. Military factors matter more than economic ones in invasion scenarios.

But at the margin, robots change the calculation. And in a world where China is explicitly describing humanoid robots as tools for "completing the great cause of reunification," the margin matters.

---
# PART VI: THE TEST

## 22. Signposts to Watch

Rather than predict specific dates, I'll describe observable indicators. When you see these, the thesis is playing out:

**Foundation model lab ships robotics API.** Google, OpenAI, or Anthropic releases a commercial API specifically for robot control. Not a research demo. A product with pricing and SLAs. This confirms that AI labs see robotics as a revenue opportunity and are investing in productization.

**Cloud robot beats on-device robot in benchmark.** A robot running a cloud-based foundation model outperforms a robot running a comparably-priced on-device model in a standardized manipulation benchmark. This confirms the capability advantage of cloud approaches.

**Chinese manufacturers capture majority hardware market share.** Unitree, UBTECH, Fourier, or another Chinese company sells more humanoid units globally than all Western competitors combined. Note: market share, not profit share. The Wintel analogy predicts hardware commoditization with thin margins. Chinese dominance of hardware would be consistent with value migrating to the intelligence layer.

**Major deployment at single company.** A single enterprise deploys 1,000+ humanoid robots in production (not pilots). Amazon, BYD, or a Chinese SOE are the likeliest candidates. This confirms that the unit economics work at scale and reliability is sufficient for commercial operation.

**Emergence documented in robotics model.** A published paper demonstrates emergent capabilities in a robot foundation model — capabilities that weren't explicitly trained but appeared at scale. RT-2's reasoning about "extinct animals" was an early example. More dramatic emergence — novel tool use, creative problem-solving, transfer across very different embodiments — would confirm that scaling laws apply to robotics as they do to language.

**Integrated companies succeed OR pivot to API.** Tesla Optimus, Figure, and 1X are betting on vertical integration — building both hardware and AI. Either they succeed with their own models, *or* they abandon in-house AI and become API consumers. Both outcomes validate the thesis that controlling the intelligence layer matters. What would falsify it: successful robotics companies using small, cheap, task-specific models without foundation model scale.

---

## 23. What Would Falsify This Thesis

I've made strong claims. Here's what would prove me wrong:

**VLA models show diminishing returns at frontier scale.**

If scaled vision-language-action models plateau — if going from 7B to 70B to 700B parameters doesn't improve manipulation performance — then the core thesis fails. The argument depends on scaling laws applying to robotics as they apply to language. If they don't, the path from GPT-7 to robot control doesn't exist.

What to watch: Papers from Physical Intelligence, Google DeepMind, and others showing (or failing to show) capability improvements from larger models. If the next generation of VLA models (2025-2026) shows only marginal improvement over current models, the scaling thesis is in trouble.

**Latency proves insurmountable for most valuable tasks.**

If cloud round-trip latency turns out to be unacceptable for more than 50% of commercially valuable manipulation tasks, the cloud architecture doesn't work. The thesis depends on reasoning being separable from reflexes, with only reflexes requiring on-device processing. If most tasks require tight integration of reasoning and reaction, edge wins.

What to watch: Deployment reports from early adopters. If Amazon, BMW, and others find that their robots require more on-device reasoning than expected, the cloud architecture faces structural limits.

**Domain-specific architectures consistently beat scaled general models.**

If purpose-built, task-specific manipulation systems continue to outperform foundation model approaches — if the bitter lesson doesn't apply to robotics — then robotics remains its own field rather than a subfield of AI.

What to watch: Competition results. Industrial deployments. If companies using small, specialized models consistently outperform companies using foundation models, the scaling thesis fails.

**Companies succeed without foundation model scale.**

If robotics companies build successful products with 100M or 1B parameter models — never adopting frontier-scale approaches — then the "same team training GPT-7" thesis is wrong. The counterexample would be a robotics company achieving commercial success with small models and narrow capabilities.

What to watch: Tesla Optimus. If Tesla succeeds with models trained primarily on their proprietary data, without approaching frontier scale, it's evidence that robotics has different dynamics than language AI.

**Investment doesn't materialize.**

If total investment in humanoid robotics stays below $10 billion annually through 2028, the industry isn't growing as fast as I expect. The thesis depends on robotics being recognized as a major opportunity worthy of major capital deployment.

What to watch: Funding announcements. Acquisition activity. Corporate R&D disclosures. If the money doesn't show up, the thesis is wrong about the opportunity being recognized.

---

## 24. The Volume Test

My projections versus Goldman's provide a concrete test:

| Year | Goldman (Linear) | My Base Case | My Bull Case |
|------|------------------|--------------|--------------|
| 2027 | 76,000 | 100,000-200,000 | 200,000+ |
| 2030 | 250,000 | 800,000-2,000,000 | 2,000,000+ |

**If 2027 comes in below 50,000:** Goldman was right. Linear thinking wins. The structural advantages I described (pre-built supply chain, security motivation, VLA progress) didn't materialize. I was wrong.

**If 2027 comes in at 50,000-100,000:** Mixed evidence. Some acceleration but not dramatic. The thesis is partially correct but timing was optimistic.

**If 2027 comes in above 150,000:** Exponential thesis validated. The "faster than EV" dynamics are real. Security mobilization is happening.

**If 2030 comes in above 1,000,000:** Full "China Speed" confirmed. The analogy to EVs was correct. Humanoids are scaling on the same trajectory as a state-mobilized industry.

These numbers will be measurable. Industry analysts track robot shipments. The test is not ambiguous.

---

## 25. Predictions

I'll be concrete about what I expect, tiered by confidence:

### Tier 1: Core Thesis (85% confidence)

1. **Foundation models will power the majority of humanoid robots by 2028.** Not task-specific models. Models descended from VLMs, trained at scale, showing cross-task generalization.

2. **Google DeepMind, OpenAI, or Anthropic will ship a commercial robotics API by end of 2026.** The AI labs will enter robotics commercially, not just through research.

3. **Chinese manufacturers will produce more than 50% of humanoid units by 2027.** Hardware commoditization will proceed as expected.

### Tier 2: Economic Structure (65-75% confidence)

4. **At least one major robotics company will pivot from in-house AI to API consumption by 2027.** The "build vs. buy" calculation will tip toward buy for the intelligence layer.

5. **Humanoid hardware gross margins will fall below 20% by 2028.** Competition from Chinese manufacturers will commoditize hardware.

6. **The leading humanoid AI provider will have higher market cap than the leading humanoid hardware company by 2030.** Value will concentrate in the intelligence layer.

### Tier 3: Capabilities (60-75% confidence)

7. **A humanoid robot will demonstrate emergent tool use — using a novel tool to solve a novel problem — in a published paper by end of 2026.** Emergence in manipulation will parallel emergence in language.

8. **Zero-shot cross-embodiment transfer — training on one robot body, deploying on a different body with no additional data — will be demonstrated commercially by 2027.** Foundation models will generalize across hardware.

9. **A single foundation model will control robots doing 10+ distinct commercial tasks (not research demos) by 2028.** Generalization will reach commercial viability.

### Tier 4: Deployment (55-70% confidence)

10. **Amazon will deploy 10,000+ humanoid robots in fulfillment operations by end of 2027.** The largest Western deployment will come from Amazon.

11. **A Chinese company will deploy 50,000+ humanoids in a single year by 2028.** China will lead in deployment scale.

12. **Construction will see significant humanoid deployment (1,000+ units at a single company or project) by 2029.** The "sleeper vertical" will wake up.

### Tier 5: Geopolitical (50-70% confidence)

13. **The US will announce a significant government humanoid robotics initiative ($1B+ committed) by end of 2026.** Security competition will drive policy response.

14. **Export controls on robotics AI models will be proposed (though not necessarily implemented) by 2027.** The chip playbook will be considered for robots.

15. **A PLA humanoid unit will be publicly acknowledged (not just demonstrated) by 2028.** Military deployment will become overt.

### Tier 6: Wild Cards (40-55% confidence)

16. **Tesla Optimus will either (a) be a top-3 humanoid by volume by 2028, or (b) pivot to licensing AI to other manufacturers.** Tesla's path will fork.

17. **A major household brand (not tech or manufacturing) will announce humanoid deployment for customer-facing applications by 2028.** Hotels, restaurants, or retail.

18. **A humanoid robot will be implicated in a serious accident causing human death, triggering regulatory response, by 2029.** Scaling brings risk.

---

# CODA: The Title Explained

"GPT-7 Will Have Arms."

Not metaphorically. Literally.

The team training GPT-7 — or Gemini 3, or Claude 5 — will be the same team, using the same infrastructure, the same architecture, the same scaling laws, that trains the model controlling humanoid robots.

This is already true in miniature. Google's robotics research uses the same transformers as their language models. Physical Intelligence's robot foundation model is built on the same VLM architecture as Claude and Gemini. The code that trains one trains the other.

The path from text to images to video to action is a straight line.

GPT-3 learned language from the internet. GPT-4 learned to see images. Video models learn to simulate physics. The robot model will learn to act.

When OpenAI trains their next flagship model — whatever they call it, whenever it ships — they won't train a separate "robot brain." The flagship model will *be* the robot brain. The same training run that produces superhuman reasoning will produce superhuman manipulation. The same context window that holds a conversation will hold a manipulation plan. The same weights that predict the next token will predict the next motor command.

This is not a prediction about the future. It's a description of the present trajectory.

The question isn't whether AGI will control robots. Of course it will. Intelligence is general. A system that can think can learn to act.

The question is who builds that system. Who runs it. Who owns it. Who decides what it does.

That's the actual stakes. Not "will robots work?" — they will. Not "when will robots arrive?" — soon. But: *who controls the brain that controls the robots that do the work?*

The answer to that question will shape the 21st century more than any technology decision since nuclear weapons. It will determine which countries have access to tireless labor. Which companies capture the value of automation. Which militaries can project force without human casualties. Which governments can surveil their populations with physical presence, not just cameras.

The robot that folds your laundry will run GPT-7.

But GPT-7 will also fold the laundry of a billion other people. It will work in factories and warehouses and construction sites and hospitals. It will carry weapons and build infrastructure and care for the elderly.

One model. Many bodies. Whoever controls the model controls the future of physical labor — and a lot more besides.

The race is already underway. The question is whether you've noticed.

---

*Written December 2025. Last updated [date].*

*The author has no financial position in any company mentioned. This essay reflects personal analysis, not insider information.*

*Corrections, disagreements, and falsification evidence welcome at [contact].*

---
