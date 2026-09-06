GPT-7 Will Have Arms
The Coming Convergence of Foundation Models and Robotics
& Why the Scaling Believers Should Apply Their Own Logic to Robotics
Introduction
On the eve of the technological singularity, the discussion around superintelligence—and the vision we have in our collective psyche—is of a world transformed by superintelligent AI that is fundamentally about software and virtual agents. The AIs are disembodied: a “country of geniuses in a datacenter” doing research and writing superhuman code, but never picking up a test tube or building a bridge.
:::sidebar{title=“The Disembodied AI Assumption”} The current AGI discourse largely assumes intelligence stays in datacenters:
Dario Amodei’s “Machines of Loving Grace” — focuses on AI accelerating science and policy, with physical applications as an afterthought
Leopold Aschenbrenner’s “Situational Awareness” — charts a path to superintelligence through software, not embodiment
The AI-2027 scenario (Kokotajlo et al.) — models AGI impact primarily through digital channels
Most AGI timelines discussions — software-only singularity
This essay argues the assumption is wrong. :::
I think this framing is incorrect. The robot that folds your laundry will be powered by a version of GPT-7. :::hover{content=“By ‘GPT-7’ I mean GPT-7 class models from any frontier lab—Google, Anthropic, OpenAI, or others. The name is shorthand for ‘frontier foundation model circa 2027-2028’”} Not a robotics model. Not a purpose-built manipulation system. A finetune of the same trillion-parameter model that automates software engineering and scientific research—that model will also fold your shirts.
:::sidebar{title=“Labs Have Started Realizing This”} The AI labs are now training robot brains:
Google DeepMind: Gemini Robotics (March 2025)
OpenAI: Restarted robotics team (2024), invested in Figure, 1X, Physical Intelligence
Physical Intelligence: $400M funding to build foundation models for robots
Logan Kilpatrick (Google Gemini API): “2026 is going to be a huge year for embodied AI.” :::
This essay makes three claims:
:::callout{type=“claims” title=“The Three Claims”} First, frontier multimodal models—the GPTs, Geminis, Claudes—will become the robot brains. Not purpose-built robotics models. The same model that powers your chatbot will power your robot.
The scaling insight: the next generation of frontier models :::hover{content=“Or perhaps the generation after—the timing is uncertain, but the direction is not”} will be natively multimodal—video generation integrated with language and reasoning. To generate video, you must model how the world works. Current video models already show physics understanding at moderate scale. When frontier labs apply trillion-parameter scale to unified multimodal training, dexterous humanoid manipulation—we postulate—will emerge almost for free.
:::sidebar{title=“Early Signs”} Physical Intelligence has shown that as models scale, they treat human demonstration data as “just another modality”—leveraging it for robotic skills.
But the claim here is stronger: see Section 1. :::
Second, this implies cloud architecture. You can’t run a trillion-parameter model on embedded hardware. The intelligence lives in the cloud. One brain, millions of bodies—I call this the VIKI architecture. :::hover{content=“Named after the AI in I, Robot that controlled all NS-5 robots centrally”} The slider between edge and cloud is moving cloud-ward faster than roboticists expect.
Third, this creates Wintel-like value capture. AI labs capture value through inference APIs. Hardware commoditizes—China is already producing humanoids under $6,000. The hardware race is a race to the bottom. The intelligence race is the one that matters. :::
This matters beyond technology. If AI takeoff happens in the late 20s, it won’t just be intelligence in datacenters as we imagine it to be. It will be intelligence with physical presence—in factories, warehouses, homes, and battlefields. The competition :::hover{content=“Between countries and labs both”} won’t just be about who builds AGI first. It will be about who controls physical AGI during the takeoff window.
:::callout{type=“guide” title=“Reading Guide”} This essay proceeds in four parts: The Convergence (why foundation models become robot brains), The Architecture (why cloud beats edge), The Hardware Flood (why costs collapse), and The Economics (who captures value). :::
PART I: THE CONVERGENCE
1. On the Altar of Scale
The robotics data problem was supposed to be insurmountable. You can train GPT-4/GPT-5 class models on trillions of tokens from the internet; you cannot download robot demonstrations. This implied that robotics would lag language AI by decades.
This is turning out to be wrong, for reasons that become clear once you accept the scaling hypothesis.
The Data Is Already There
The internet already contains most of what a robot needs to know.
Video is implicit physics. YouTube contains trillions of frames of the physical world in motion. Objects falling, liquids pouring, hands manipulating, bodies moving through space. A model trained to predict the next frame of video must learn how the world works—gravity, friction, rigidity, occlusion, cause and effect.
Human video is manipulation data. Billions of hours of humans folding laundry, cooking, assembling furniture, using tools. First-person GoPro footage. Cooking tutorials. Assembly instructions. This teaches the model what it looks like when a humanoid-shaped agent interacts with objects.
Consider what a video generation model must know to accurately render a human hand holding a wine glass. To model each frame correctly—from every angle, in any lighting, through any motion—the model must understand dexterous manipulation at a granular level. It needs to know exactly where fingers should be positioned, how grip pressure affects the glass, how the liquid moves, how wrist rotation translates through the arm. A model that can generate this video has already learned the physics of manipulation. The robot-specific training just needs to steer this immense pre-trained knowledge.
:::figure{id=“sora-wine-glass” caption=“To render this accurately, the model must already understand manipulation physics”} [DESIGNER: Embed Sora-generated clip of hand holding wine glass, or high-quality still frame from such a video] :::
:::quote{attribution=“Ilya Sutskever” source=“Dwarkesh Patel Interview”} “Predicting the next token well means that you understand the underlying reality that led to the creation of that token.” :::
Modality-seep. Understanding can bleed between modalities. Early text-only models “knew” things about vision—they could describe colors, spatial relationships, visual aesthetics—despite never seeing an image. A picture is worth a thousand words, but a thousand words also encode the picture.
The same applies to touch, temperature, and force. Video of a hand gripping a hot mug implicitly contains thermal information (steam rising, careful handling). Video of fingers testing fruit ripeness encodes tactile feedback (the slight give, the pressure applied). Video of lifting objects reveals weight and balance. A model trained on enough video may develop surprisingly rich representations of sensory modalities it has never directly experienced. Sensor data in post-training can then align these representations to actual tactile and proprioceptive feedback.
The data for robot intelligence was always there. It just wasn’t labeled “robot data.”
The Data Pyramid
:::figure{id=“data-pyramid” caption=“Each layer requires orders of magnitude less data than the one below.”} [DESIGNER: Create pyramid visualization]
PYRAMID STRUCTURE: ┌─────────────────┐ │ CALIBRATION │ ← Robot demonstrations (millions of tokens) │ Top tier │ Maps understanding to specific embodiment ├─────────────────┤ │ ALIGNMENT │ ← Egocentric human video (billions of tokens) │ Middle tier │ Teaches humanoid-perspective manipulation ├─────────────────┤ │ FOUNDATION │ ← YouTube-scale general video (trillions of tokens) │ Base tier │ Physics, objects, spatial reasoning, causality └─────────────────┘
Color scheme suggestion: Foundation (deep blue), Alignment (teal), Calibration (gold) :::
The evidence for this hierarchy is already visible in the progression of robotics models:
RT-1 (Google, 2022): Trained on 130,000 demonstrations collected over 17 months. Used vision-language pretraining (ImageNet-pretrained image encoder), but robot-specific manipulation data was collected from scratch.
RT-2 (Google, 2023): Same robot data, combined with large-scale vision-language pretraining. Result: performance on novel semantic concepts jumped from 32% to 62%—nearly doubling. The model exhibited emergent reasoning: asking it to “pick up the extinct animal” led it to correctly identify and grasp a plastic dinosaur, despite no such instruction appearing in the robot training data.
32% → 62% performance on novel concepts with same robot data, just better pretraining
π0 (Physical Intelligence, 2024): Demonstrates that foundation model pretraining dramatically reduces the robot-specific data needed. The paper describes using diverse demonstration data, with task-specific finetuning requiring far less data than training from scratch.
Physical Intelligence (December 2024): “Adding more robot data in pre-training improves ability to absorb human data in fine-tuning.” Human video transfers to robot learning.
The pattern is clear: each generation requires less robot-specific data because more capability comes from general pretraining. The stronger you think this data efficiency effect is, the faster you think the transition will occur.
What Scaled Multimodal Models Will Look Like
The next generation of frontier models won’t just understand video. They will think in video.
Today’s multimodal models—GPT-4.5, Gemini 2.5, Claude 4—can look at images and video. They accept visual inputs. But they don’t generate visual outputs, and they don’t reason in visual tokens. When you ask them to imagine rotating an object, they simulate it in language. They’re text models with eyes.
The next generation will be different. These models will be trained with video generation objectives alongside text—predicting future frames, generating scenes from descriptions, completing partial videos. Think Sora merged with GPT, or Veo merged with Gemini, in a single unified model. A frontier-scale model with video generation capabilities won’t just recognize videos—it will have to produce physically consistent outputs, frame after frame.
:::quote{attribution=“Demis Hassabis” source=“Twitter, May 2025”} “It’s kind of mindblowing how good Veo 3 is at modeling intuitive physics. Our world models are getting pretty good, and in my view this has important implications regarding the computational complexity of the world.” :::
In a recent interview with Lex Fridman, Hassabis elaborated: even five or ten years ago, he would have assumed you need embodied experience to understand intuitive physics. Veo 3 is directly challenging that assumption—learning physics just from watching video.
:::sidebar{title=“Why This Matters for Reasoning”} When a model can generate and reason in visual tokens, it can “imagine” physical manipulations before executing them. Benchmarks requiring spatial reasoning—like ARC-AGI puzzles—could fall to models that can visualize and mentally rotate objects, rather than reason purely in text. :::
And just as RL on text models gave us chain-of-thought reasoning, RL on video-generating models could give us reasoning in visual tokens. Models that “imagine” actions before taking them—mentally simulating the physics of a grasp, visualizing the trajectory of a throw, previewing the result of an assembly step.
Current video models are small by frontier standards. Open-source Sora equivalents are estimated at 3-10B parameters. Frontier LLMs are 100B+ parameters—one to two orders of magnitude larger.
:::table{id=“model-scale-comparison” caption=“Video models today are where language models were in 2019”} | Model | Parameters | Rough Era Equivalent | |——-|————|———————| | Sora-class (2024) | ~3-10B (estimated) | GPT-2 | | Current VLAs | 7-12B | GPT-2/3 | | Frontier LLMs | 100B+ | GPT-4/5 | | Unified multimodal (2026-27?) | 1T+ | ← The frontier moves here | :::
To make the analogy concrete: current video models are to frontier LLMs what GPT-2 was to GPT-4. To our knowledge, nobody has trained unified multimodal models—video generation + language + reasoning—at frontier scale on YouTube-scale data. This will likely only happen when the next wave of datacenters come online in 2026.
Perhaps this is why intuition about what large multimodal models can do is systematically wrong. We’re extrapolating from GPT-2-scale video models and concluding “video models can’t do X.” We made the same mistake about language models in 2020.
The Implication
A frontier-scale model that’s seen YouTube-scale video of everything in existence—humans manipulating objects, navigating spaces, using tools, in every context and configuration—has already learned most of what it needs to know about the physical world. The robot-specific data just aligns this understanding to a specific embodiment. The foundation does the heavy lifting. The fine-tuning is the easy part.
This is why frontier labs—not robotics labs—will likely build the robot brain. They’re training trillion-parameter multimodal models on internet-scale video. The robotics teams are finetuning 7B models while the real capability is being built elsewhere.
2. Many a Bitter Lesson to Go
Chess. Go. Protein folding. Machine translation. Image recognition. Speech synthesis. Self-driving. In every domain, the pattern repeated: hand-engineered systems with decades of expert knowledge were swept away by scaled-up learning.
:::sidebar{title=“The NLP Reckoning”} Quanta Magazine (April 2025) published an oral history of the NLP community’s reaction to ChatGPT:
Christopher Callison-Burch (UPenn): “I’m trying out all the things that my recent Ph.D. students had done as their dissertations, and just realizing—oh my God, the thing that had taken a student five years? Seems like I could reproduce that in a month.”
Iz Beltagy (Allen Institute): “In a day, a lot of the problems that a large percentage of researchers were working on—they just disappeared.” :::
The NLP researchers didn’t see it coming. They were world experts in parsing, syntax, semantics, discourse. They had spent decades building linguistic knowledge into systems. And then a team at OpenAI trained a large transformer on internet text and made most of that expertise irrelevant.
This is about to happen to robotics.
The roboticists don’t see it coming. They’re debating actuator designs and sim-to-real transfer and reward shaping, while foundation model labs are building the fundamental scale required for embodiment.
PART II: THE ARCHITECTURE
:::figure{id=“viki-image” caption=“The VIKI architecture: cloud intelligence, distributed bodies.”} [DESIGNER: Image of VIKI from I, Robot—one central AI controlling thousands of robot bodies simultaneously] :::
3. The Cloud Thesis
A natural question is where computation should live. The robotics community has historically assumed edge-first architecture: robots should be autonomous, self-contained, independent. This assumption deserves scrutiny.
The Slider
There’s a spectrum between “cloud robotics” and “edge robotics”—not a binary choice, but a slider.
Pure edge: All computation on the robot. No network required. Tesla FSD works this way—the car runs entirely on its onboard computer.
Pure cloud: The robot is a dumb terminal. All decisions happen in a datacenter. The robot streams sensors up, receives motor commands back. Think VIKI from I, Robot—one central intelligence controlling every NS-5 body simultaneously. This is the architecture I’m predicting.
Most systems today are somewhere between. The question is: where is the slider going?
Today’s leading humanoids are mixed. Figure describes a two-level control stack: a larger vision-language model for high-level perception and planning, and a smaller policy network for real-time trajectory tracking, both running on-device embedded GPUs. Tesla Optimus similarly runs on-board. 1X, meanwhile, is heavily investing in teleoperation infrastructure—their architecture explicitly includes remote human operators providing demonstrations and corrections.
This works for current capabilities. A mid-size model can pick up a box.
But what happens when you need general embodied intelligence? :::hover{content=“We imagine such a system could be a top-notch sous-chef and a breakdancer—learning new physical skills in context, reasoning about novel situations with multimodal tokens in its reasoning rollouts, conversing naturally about what to do and then doing it. See Section 11 for more on GEI capabilities.”} I expect those capabilities will require 1T+ parameters. And those only run in the cloud.
My prediction: as capability requirements increase, the slider moves cloud-ward. The robots of 2027 will run small models on-device for reflexes, but their “brain”—the part that reasons and plans—will live in a datacenter.
:::callout{type=“important” title=“Important Clarification”} This is not the System 1/System 2 cognitive split. I’m not arguing that “fast intuitive thinking” stays on-device while “slow deliberate reasoning” moves to cloud. The thesis is stronger. The entire intelligent agent—perception, planning, reasoning, language, control—lives in the cloud. The on-device component handles translating action vectors to real action, reflexes, and safety-critical functions: emergency stops, collision limits, balance recovery, network-drop handling. The cloud will do everything intelligent. :::
Whoever runs the cloud controls the robots.
The robotics industry thinks it’s building robots. It might actually be building terminals.
Why Cloud Wins
It is clear why today’s chatbots run in datacenters rather than on laptops and devices:
:::sidebar{title=“Why AI Ended Up in the Cloud”} Every major chatbot runs in datacenters, not on your phone. Why?
Scale & Performance - Models got huge. State-of-the-art needs tens-hundreds of GB of weights. Phones can’t fit that. - Inference is compute-bound. Quality generation needs GPU FLOPs that devices lack. - Memory bandwidth. Even if weights “fit,” reading them fast enough is the bottleneck. - Specialized hardware. Datacenters deploy newest GPUs immediately. Device cycles are years.
Economics - Economies of scale. One cluster serving millions beats everyone maintaining local hardware. - Multi-tenancy. Many users share same model and caches. Cost amortizes. - Business model. Usage-based pricing maps to centralized serving.
Operations - Fast iteration. Model updates deploy instantly. On-device updates are slow and fragmented. - Centralized safety. Content filters and abuse detection are easier server-side. - Security of IP. Weights stay server-side. Harder to clone product. - Training → serving pipeline. Same infra trains and serves. Less friction.
Infrastructure - Power + thermals. Sustained generation is a space heater. Phones throttle, batteries die. - Data gravity. Useful data is already in the cloud. Inference near data avoids moving it.
These forces don’t disappear for robotics. They intensify. :::
For robotics specifically, many of the same arguments hold—and perhaps are even stronger:
Economies of scale. An on-device GPU sits idle when the robot waits. Real-world utilization will probably be tiny. A datacenter GPU serves 100+ robots by interleaving requests and amortizing costs with huge batch sizes.
GPUs are scarce. A cloud robot doesn’t need a $1,000+ reasoning GPU in its body. The expensive compute stays in the datacenter—and can leverage the massive datacenter buildout already underway. Result: cheaper, lighter, simpler hardware and a realistic path to scaling robot production.
Model scale. A trillion-parameter model takes ~2TB of weights in FP16 (less with quantization, but still impractical for embedded hardware). NVIDIA’s Jetson Orin runs mid-size models (up to ~20B parameters) comfortably on-device; frontier-scale reasoning requires datacenter hardware. If frontier reasoning requires trillion-parameter models, cloud isn’t optional.
Training & IP. Every robot interaction generates data. In cloud architecture, all data flows back to the corporation—just as AI companies value coding interaction data today, robotics data will be similarly or even more valuable (see Part IV: Economics). And no company will distribute their newly trained robotics model weights to sit on-device where they can be extracted.
Inference costs are falling. GPT-4 launched at $30/million input tokens (March 2023). The cost to achieve a fixed level of LLM capability has fallen dramatically—roughly an order of magnitude over the past two years in some analyses. The trend compounds: whatever latency/cost tradeoff you’re making today gets better next year.
If cloud is borderline viable now, it’s clearly superior in 12 months. The trend compounds.
4. The Latency Objection
“But latency!” This is the first objection everyone raises. Motor control needs 200Hz—every 5 milliseconds. You can’t wait for datacenter round-trip. Cloud robotics is physically impossible.
This objection is why the thesis hasn’t been widely internalized. Everyone assumes latency kills it.
This objection deserves serious examination. But it doesn’t survive scrutiny.
Teleoperation Already Works
Sanctuary AI operates robots remotely over standard internet connections. Humans teleoperating robots fold laundry, manipulate objects, perform dexterous tasks—at latencies in the 100-200ms range.
If a human teleoperator can control a robot at that latency, so can an AI.
The Human Precedent
Consider how you pick up a coffee cup. Your conscious reaction time—from “I want to grab that” to “my hand starts moving”—is approximately 200-250 milliseconds. That’s 4-5Hz, not 200Hz.
Your brain doesn’t update your motor plan 200 times per second. It updates 4-5 times per second. You decide “move hand toward cup,” your arm moves, you get visual feedback, you adjust.
What happens at 200Hz? Spinal reflexes. Balance corrections. Trajectory tracking. Your spinal system doesn’t understand coffee cups. It tracks trajectories your brain commanded.
:::figure{id=“brain-spinal-split” caption=“The brain/spinal cord split mirrors cloud/edge architecture”} [DESIGNER: Simple diagram showing: - Brain (4-5 Hz): “Decide to grab cup” → “Adjust for position” → “Close grip” - Spinal cord (200 Hz): Continuous trajectory tracking, balance, reflexes - Arrow showing: This maps to Cloud (planning) vs On-device (control) ] :::
Robots can work the same way. The cloud runs the “brain” at 5-10Hz—deciding what to do. The on-device controller runs at 200Hz—tracking the commanded trajectory. This is precisely how Figure’s system works today, just with both components on-device.
Latency Is Solved Engineering
Roboticists miss something: latency optimization is what big tech is good at.
Google invested heavily in Stadia (shut down January 2023). Amazon optimized AWS for real-time applications. Microsoft built Xbox Cloud Gaming. Video calling (Zoom, Google Meet, FaceTime) handles real-time bidirectional audio/video globally with latencies humans find acceptable. Financial firms built high-frequency trading infrastructure with microsecond precision. These companies have spent years—and billions—solving exactly this problem: running complex real-time compute in datacenters and streaming results back with minimal lag.
They’re now applying the same expertise to AI voice agents, achieving sub-100ms response times for natural conversation.  The infrastructure for cloud robotics is being built for other applications.
Cloud Gaming Precedent
Cloud-rendered gaming (GeForce Now, Xbox Cloud Gaming): Entire game runs in datacenter. Controller inputs up, video frames down. Latency: 50-100ms round trip. Millions play this way today.
Competitive online gaming (League, Valorant, CS): Players compete over 20-100ms network latency. Human reaction time: 200-250ms. Esports works despite delay.
Cloud robotics is less demanding than either:
:::table{id=“latency-comparison” caption=“Cloud robotics has more forgiving latency requirements than gaming”} | Dimension | Cloud Gaming | Cloud Robotics | |———–|————–|—————-| | Update rate | 60Hz frame rate | 5-10Hz control rate | | Latency sensitivity | Critical: competitive PvP | Tolerant: pick up box | | Failure mode | Lose match | Robot pauses | :::
A cloud gaming lag spike means you die in PvP. A cloud robot lag spike means the robot pauses for a second before picking up the next box. For warehouse tasks, that’s fine.
Edge Cases Remain Edge
To be fair: some applications may remain edge-first longer. Surgical robotics where milliseconds matter. Military applications where network denial is a tactic. Remote locations without reliable connectivity. These domains may require on-device intelligence even at capability cost.
But for the vast majority of commercial applications—warehouses, factories, retail, eldercare, hospitality—cloud architecture works.
The Real Objection
Roboticists have spent decades building on-device systems. Self-contained intelligence. A robot depending on a network feels fragile, unreliable, wrong.
This intuition made sense when “network-dependent” meant “broken when offline.” But we’ve built a world where network dependence is the norm. Your car’s navigation, your phone’s assistant, your home’s thermostat, your company’s software—all depend on cloud connectivity. The infrastructure has matured. The question isn’t “can networks support this?” but “do the benefits justify the architecture?” For trillion-parameter emergent reasoning and cross-task generalization, they do.
5. The Revenue Connection
Claude Code became the revenue story for AI in 2025. Coding—where AI creates measurable value, where enterprises pay—is now central to every lab’s business model.
Robotics is next. Here’s what financial analysts miss:
It’s the same model.
When analysts project the “robotics AI market,” they model it separately from “language AI.” Separate TAMs. Separate products. Separate revenue streams.
However, if GPT-7 powers the robots, it’s one model serving both digital and physical applications. Training and research costs amortize across all use cases. Inference infrastructure is shared. The same datacenter that answers your ChatGPT query controls the warehouse robot.
This changes the economics fundamentally:
For AI labs: Robotics is a new distribution channel for the existing product, not a new product. The marginal cost to serve a robot is just inference. The model is already trained. The infrastructure already exists.
Token economics. If robot control is served via an API, compute cost is primarily inference. API prices have fallen dramatically over time—the marginal cost per robot-hour will keep dropping, and cloud serving amortizes compute across fleets. Unlike frontier coding agents that may require tens of thousands of reasoning tokens per task, physical manipulation involves more continuous, lower-complexity inference streams.
For hardware companies: The “brain” is an API call. You’re not building intelligence. You’re building a body and paying rent.
For investors: The robotics boom and AI boom are the same boom.
:::sidebar{title=“Every Major AI Lab Is Suddenly Interested”} - OpenAI: Shut down robotics in 2020 (“lack of data”). Restarted 2024. Invested in 1X, Figure, Physical Intelligence. Aditya Ramesh (VP Research) now leads “Worldsim”—bringing video generation to physical robotics.
Google DeepMind: Gemini Robotics (March 2025). Published RT-1, RT-2, RT-X. Hassabis: robots are “the ultimate application.”
Observable pattern: investments in robotics companies, API-based business models, hiring for embodied AI teams. These are distribution plays, not science projects. :::
The financial consensus hasn’t internalized this. They see OpenAI investing in Figure and think “OpenAI is entering robotics.” The correct frame: OpenAI is extending its distribution into physical applications—robotics companies become customers of their API, just like coding tools and enterprise software.
PART III: THE HARDWARE FLOOD
6. The Unitree Trajectory
The hardware story is simple: costs are collapsing faster than anyone expected.
Unitree’s headline humanoid pricing has moved dramatically:
~$90,000 (H1, mid-2023) → $16,000 (G1, 2024) → ~$5,900 (R1, July 2025)
93% price reduction in under two years
:::figure{id=“unitree-price-trajectory” caption=“Unitree humanoid pricing trajectory 2023-2025”} [DESIGNER: Create line chart with the following data]
CHART DATA - Unitree Price Trajectory: Date | Model | Price (USD) | Notes ————|——-|————-|————————— Mid-2023 | H1 | $90,000 | Research/enterprise tier Mid-2024 | G1 | $16,000 | First “affordable” humanoid July 2025 | R1 | $5,900 | Consumer price point
Y-axis: Price (USD), logarithmic scale recommended X-axis: Time (2023-2025) Annotation: “93% reduction” with arrow spanning full range
:::
Note: these are different capability tiers, not the same robot getting cheaper. But the trend is clear—a 93% reduction in entry-point pricing in under two years.
Goldman Sachs, in their February 2024 humanoid robot report, projected 40% annual cost declines continuing through 2030. They expect humanoids to reach “factory viability” by 2027 and “consumer viability” by 2028-2031.
Goldman might be conservative. Their model doesn’t account for what happens when China decides an industry is strategic.
7. The EV Precedent
2014: China produced ~78,000 new energy vehicles (NEVs).
2024: China produced ~12.4 million electric cars (BEV+PHEV).
~160x growth in 10 years. Peak compound annual growth rate ~66%. By 2024, China was producing more EVs than the rest of the world combined (12.4M vs global 17.3M).
This wasn’t market forces alone. The Chinese government identified EVs as strategic. Subsidies. Mandates. Infrastructure. Coordinated supply chain. Dozens of companies emerged. The ones that couldn’t compete died. The survivors—BYD, NIO, XPeng—became globally competitive in a decade.
Humanoids are getting the same treatment.
China is layering national “patient capital” and regional funds behind embodied AI and humanoids—Shanghai announced a major fund in July 2024, consistent with prior strategic-industry playbooks. Over 100 Chinese companies are building humanoids. Government goal: humanoids as “new engine” for economic development. The USCC notes potential military-civil fusion implications—and as capabilities increase, so will strategic priority.
Here’s what analyses miss: humanoids are easier than EVs.
:::table{id=“ev-vs-humanoid” caption=“Humanoids leverage existing supply chains that EVs had to build”} | Factor | EVs (2014) | Humanoids (2025) | |——–|———–|——————| | Battery supply | Build gigafactories from scratch | Already exists (EV supply chain) | | Battery cost per unit | $15,000+ (60-100 kWh) | $150-400 (1-3 kWh at ~$115/kWh) | | Motor supply | Build from scratch | Already exists (drones, EVs) | | Parts count | 10,000+ | ~3,000 | | Crash safety | Heavy regulation | Minimal requirements | | Assembly time | 20-30 hours | 5-10 hours | :::
EVs required building supply chains from scratch. Gigafactories for batteries. New production lines for motors. It took years before the manufacturing base existed.
Humanoids leverage the existing EV supply chain. Batteries: same cells, fewer of them. Motors: already mass-produced for EVs and drones. Sensors: smartphone components.
An EV costs $30,000+ to manufacture. A humanoid costs $6,000 and falling. Same factory investment produces 5x more units. Same working capital supports 5x more inventory.
If you extrapolate the EV curve onto humanoids, adjust for supply chain advantages, you get numbers that seem unrealistic—until you remember nobody in 2014 thought China would produce 12 million EVs by 2024.
8. The Components Collapse
Zoom in on the components, and the price collapse makes more sense.
:::figure{id=“component-costs” caption=“Every major component is on a steep cost curve driven by other industries”} [DESIGNER: Create multi-panel visualization or infographic with the following data]
COMPONENT COST DATA:
LIDAR
2012: $75,000 (Velodyne HDL-64E)
2024: ~$500-1,000 (automotive grade)
2025+: <$200 projected (Hesai next-gen)
Decline: ~99% over 12 years Source: Ars Technica, Reuters
BATTERIES ($/kWh pack price)
2010: ~$1,100/kWh
2017: ~$300/kWh
2022: ~$153/kWh
2024: ~$115/kWh
Humanoid need: 1-3 kWh = $115-345
Decline: ~90% over 14 years Source: BloombergNEF
IMUs (Inertial Measurement Units)
2010: Thousands of dollars
2024: $1-10 (smartphone components)
Every iPhone has one Source: Industry data
CAMERAS
Was: Specialized industrial equipment ($1,000+)
Now: Commodity from phone supply chain ($10-200)
Robot vision costs less than a GoPro
COMPUTE (Edge AI modules)
NVIDIA Jetson Orin Nano: ~$300 (4GB)
Jetson Orin NX: ~$600-900
Jetson AGX Orin: ~$1,000-2,000
Runs models up to ~20B parameters Source: NVIDIA
SERVO MOTORS / ACTUATORS
High-torque precision: $500-5,000 each
This is the remaining expensive component
BUT: Drone/EV scale is driving costs down
Annual maintenance: ~10-20% of initial cost
Suggested visualization: Six mini-charts showing cost over time, or a summary table with trend arrows :::
:::table{id=“component-summary” caption=“Component cost summary and trajectories”} | Component | Current Cost (2024-25) | Future Floor | Trend | |———–|———————-|————–|——-| | Battery pack | ~$115/kWh | ~$80-100/kWh | ↓ Continuing decline | | LiDAR sensor | ~$500-1,000 each | ~$100-200 each | ↓ Rapid decline | | Compute module | $300-2,000 | ~$100-300 | ↓ Modest decline | | Actuator motor | $500-5,000 each | High (limited reduction) | → Slowest to fall | | Camera/IMU | $10-200 per camera, $1-10 per IMU | ~$5-50 per sensor | ↓ Already commodity | :::
Every component is on a steep cost curve driven by other industries. The humanoid isn’t pioneering manufacturing—it’s assembling existing commodities in a new configuration.
This is why $5,000 humanoids are plausible by 2027-2028.
:::callout{type=“key-insight” title=“The Bottleneck Shifts”} The bottleneck is then intelligence.
A $5,000 body with no brain is useless. A $5,000 body with frontier AI is worth $50,000 in labor per year. The value comes entirely from intelligence. :::
:::sidebar{title=“Dexterity Isn’t Hardware-Gated”} Chris Paxton (Meta robotics researcher): “Human level dexterity is absolutely not gated by hardware.”
The proof: excavator operators flipping water bottles with 30-ton machines. The hardware is crude—hydraulic cylinders with massive backlash. The dexterity comes entirely from the human operator’s learned control policy. Give that same control intelligence to a purpose-built hand, and the hardware becomes trivial. :::
This is why the robotics industry’s obsession with hardware is misplaced. Hardware challenges remain—actuators, reliability, safety certification, battery energy density—but the trajectory is clear and the supply chains exist. Intelligence is the differentiator. And intelligence is being built by AI labs, not robotics companies.
9. The Forecasts
How many humanoids will actually ship? The analyst projections:
Goldman Sachs (Feb 2024): 250,000 annual shipments by 2030, with 40% annual cost declines
Bank of America (Apr 2025): 18,000 units in 2025, scaling to ~1 million annually by 2030-35, with BOM costs falling from $35,000 to $13-17,000
Morgan Stanley: 1 billion installed base by 2050, $5T market
These aren’t contradictory—Goldman forecasts near-term annual shipments, Morgan Stanley forecasts long-term installed base, BofA provides the most detailed near-term breakdown.
For context: Goldman’s 250K by 2030 implies ~69% CAGR from BofA’s 18K baseline. That’s almost exactly the growth rate China achieved during EVs’ fastest scaling period (2014-2019). BofA’s 1M target requires ~123% CAGR—roughly double the fastest EV growth ever observed. Goldman is aggressive by historical standards; BofA is very aggressive.
I don’t have a better model than these analysts. The uncertainty isn’t about point estimates—it’s about which regime we’re in:
If humanoids remain industrial equipment with slow enterprise sales cycles, even Goldman’s 250K may be optimistic.
If GEI capabilities emerge and China treats humanoids like EVs, Goldman is probably 2-4x low.
If state mobilization compounds with GEI, BofA’s 1M becomes plausible.
The key variable is capability. Price declines alone don’t create demand—a $5,000 robot that can’t do useful work is worthless. A $20,000 robot that can reliably perform $50,000/year of labor sells itself.
:::sidebar{title=“The Recognition Moment”} Adoption curves don’t start smooth. The AI discourse hasn’t fully internalized that the robot story is the same as the LLM story. When that recognition hits—probably late 2026—you’ll see a rapid shift in investment, deployment, and attention.
The graph won’t be a steady exponential. It’ll look normal in 2025-2026, then steepen sharply as capital and focus rush in. :::
10. The China Factor
China has repeatedly demonstrated what happens when they identify an industry as strategic.
Historical Multipliers
When China designates an industry as strategic, the scaling multipliers are dramatic:
:::table{id=“china-multipliers” caption=“Historical scaling when China designates strategic industries”} | Industry | Starting Point | Ending Point | Multiplier | Timeframe | Peak CAGR | |———-|—————|————–|————|———–|———–| | EVs | ~78K units (2014) | ~12.4M units (2024) | ~160x | 10 years | ~66% | | Solar PV | ~3 GW installed (2011) | ~880 GW (2024) | ~290x | 13 years | ~25% sustained | | Batteries | Minimal presence (2015) | 80%+ global share (2024) | — | <10 years | — | :::
If humanoids receive similar treatment—and early signals suggest they will—Goldman’s 250K by 2030 projection may prove conservative by an order of magnitude.
Why Humanoids May Scale Faster
The EV analogy actually understates the potential for several reasons:
Lower unit cost enables faster adoption. A $6,000 humanoid is 5x cheaper than a $30,000 EV. Same capital buys more units. Same working capital supports more inventory.
Supply chains already exist. EVs required building gigafactories from scratch. Humanoids assemble existing components—batteries, motors, sensors—from mature supply chains.
Capability inflection creates demand shock. EVs offered incremental improvement over ICE vehicles. GEI could offer step-function capability that creates entirely new demand categories.
Strategic priority may be higher. The USCC report explicitly flags military-civil fusion implications. Humanoids aren’t just economic—they’re strategic.
Reading the Signals
Goldman’s projections assume market-driven adoption. They don’t model:
State-directed procurement (SOEs mandated to deploy humanoids)
Provincial governments mandating pilot programs
What happens when “strategic industry” status unlocks coordinated policy support
Military demand for logistics, maintenance, and potentially combat applications
The EV parallel is instructive. In 2012, skeptics said China would never compete with Western automakers. Chinese EVs are now threatening to dominate global markets. The skeptics weren’t wrong about the technology. They were wrong about the will.
The same dynamic likely applies to humanoids.
PART IV: THE ECONOMICS
Predicting technology adoption is hard. I've seen "robotics is about to take off" predictions before—they were wrong for decades. But the current moment feels different, and worth examining with whatever specificity we can muster..
11. General Embodied Intelligence
What exactly are we building toward?
::: callout General Embodied Intelligence (GEI)
A system that treats physical action as just another modality. The same world model that generates video, reasons about physics, and holds conversation can inhabit a body—learning manipulation from the same trillion-token pretraining that teaches it everything else.
Core properties:
Body-agnostic: One model, many embodiments. Skills transfer across robot morphologies because they're grounded in world understanding, not hardware-specific policies
Demonstration-efficient: Learns new physical skills from few-shot human demonstration, the way current LLMs learn new tasks from few-shot prompting
Reasoning-integrated: Plans actions by simulating outcomes in the same latent space it uses for language and vision
Unlike the R2-D2s and C-3POs of science fiction—specialized units with narrow competencies—a GEI system could be a sous-chef, teach jujitsu, and do facility maintenance, all from the same underlying world model.
:::
By 2027, I expect GEI systems will reliably handle:
Warehousing & Logistics: Picking, packing, inventory management, loading/unloading—the current focus of most humanoid deployments.
Retail & Hospitality: Store assistance, restocking, basic food preparation, cleaning, customer-facing tasks in hotels and restaurants.
Light Manufacturing: Assembly line “last mile” tasks too variable for fixed automation, quality inspection, machine tending.
Facility Operations: Security patrols, building maintenance, groundskeeping—roaming through semi-structured spaces doing dozens of small tasks that humans currently stitch together with common sense.
Food Service: Order preparation, table service, kitchen assistance, inventory management.
Basic Care Support: Mobility assistance, meal preparation, medication reminders for elderly or disabled individuals (non-medical).
Agriculture: Harvesting, planting, equipment operation in structured farm environments.
Service & Wellness: Fitness instruction, physical therapy assistance, personal training, sports coaching. A GEI that understands biomechanics from video pretraining could spot form issues, demonstrate exercises, and provide real-time physical feedback—tasks currently requiring expensive human expertise.
Companionship & Daily Living: Assistance with activities of daily living for elderly or disabled individuals, social interaction, hobby engagement. Japan and South Korea, facing acute eldercare shortages, may be early adopters.
The first killer apps of GEI probably won’t look like sci-fi. They’ll look like a night shift: roaming through semi-structured spaces doing dozens of tiny tasks that internet video accidentally contains at scale.
I am least certain about adoption timelines. Technology capability and economic viability don’t guarantee deployment—regulatory friction, labor politics, and social acceptance all create drag. The wide range in analyst forecasts—from Goldman’s 250K to BofA’s 1M by 2030—reflects this uncertainty.
12. The Demand Side
The TAM Question
Most economic analyses assume humanoid robots will do one thing well—warehouse picking or assembly line work. They model the TAM as “tasks currently done by human warehouse workers.”
This dramatically underestimates the opportunity.
$4.6 trillion per year — US employee compensation for “hands-on/service/manual” work (2024)
A GEI system competes not with warehouse workers, but with human physical capability broadly. The TAM is physical labor in its entirety—and beyond. A sous-chef. An exercise trainer. A tennis partner. A night janitor who also handles security. The boundaries blur when general capability arrives.
The Robot Economics
:::table{id=“robot-economics” caption=“Unit economics at current and projected price points”} | Cost Component | Current (~$16K robot) | Projected (~$6K robot) | |—————|———————-|————————| | Hardware (3-year depreciation) | $5,333/year | $2,000/year | | Maintenance (~15%/year) | $2,400/year | $900/year | | Electricity (~500W, 20hr/day) | ~$700/year | ~$700/year | | Cloud inference (estimated) | ~$500-2,000/year | ~$300-1,000/year | | Total annual cost | ~$9,000-10,500 | ~$4,000-4,600 | | Hourly cost (7,000 hrs/year) | $1.30-1.50/hr | $0.55-0.65/hr | :::
Compare to human wages: - Manufacturing wages in Vietnam: $2-3/hour - Manufacturing wages in China: $6-8/hour - Manufacturing wages in US: $20-30/hour
:::side bar
There's a counterintuitive implication for AI labs here. The obvious play is white-collar automation—coding, analysis, document work. Pure software, no hardware risk, customers already paying for API access.
But consider the inference economics. A coding agent might burn through millions of tokens per task: reading codebases, reasoning through architectures, generating and revising. A robot doing physical work might need far fewer tokens—mostly ingesting video tokens and generating real-time control signals and the occasional high-level reasoning. The token cost per hour of productive labor could actually be lower for physical work than knowledge work.
If you're an AI lab selling inference, a million robots doing night shifts might be better unit economics than a million developers ::::
Political Pushback Will Be Real
Automation of physical labor will face resistance that coding automation doesn’t. Jobs are more visible. Workers are more organized. Politicians are more responsive. Expect regulatory friction.
But demographic reality may override political friction. When the workers simply don’t exist—when eldercare facilities can’t hire at any wage, when construction projects stall for lack of bodies—the calculus changes. Countries with acute labor shortages (Japan, South Korea, parts of Europe) may adopt fastest.
The Labor Shortage Is Already Real
85.2 million — projected global worker shortage by 2030 (Korn Ferry)
4.6 million — projected US eldercare worker shortfall by 2032
China’s working-age population has peaked and is projected to fall toward 40% of total population by 2050. Japan’s elderly population already exceeds its working-age population in some regions.
Demographics, not wages. The workers don’t exist.
The Jevons Paradox
:::hover{content=“The Jevons Paradox: When a resource becomes more efficient to use, total consumption often increases rather than decreases. Named after William Jevons, who observed that coal consumption rose as steam engines became more efficient.”} There’s an economic pattern worth noting: when a resource becomes cheaper, demand often increases faster than efficiency gains. Coal consumption rose as steam engines became more efficient. Computing usage exploded as transistors shrank.
Cheaper physical labor may not just substitute for existing workers—it may create entirely new demand. Tasks currently “not worth paying someone to do” become viable. 24/7 operations become standard. New categories of physical service emerge.
If GEI arrives, the addressable market will likely expand.
13. Value Capture: The Wintel Precedent
If cloud wins and hardware commoditizes, who captures the value? History offers a precedent.
In the 1990s, the PC industry looked competitive. Dell, HP, Compaq, IBM, Gateway sold computers to businesses and consumers. Competitive market, right?
Not really.
Intel + Microsoft (2004 net profit): $15 billion Top three PC OEMs combined: $2.5 billion
The platform layer captured 6x the profits of the hardware makers.
Competition among hardware makers drove margins toward zero. Intel and Microsoft collected rent. This was “Wintel.”
The robotics industry could follow the same pattern.
If foundation models are the intelligence layer that makes robots useful, then whoever provides that layer captures the value. Hardware manufacturers compete on cost. Model provider collects API fees on every hour of robot operation.
One key difference: PCs had standardized OS and CPU interfaces. Robotics may fracture across safety regimes, embodiments, and regulatory environments. This could limit platform dominance—or create regional platform monopolies.
Chinese manufacturers already produce humanoids at $6,000. By 2027: probably $5,000. By 2030: perhaps $3,000. Hardware commoditization helps the AI labs—cheaper bodies mean more deployments, more deployments mean more API revenue.
The Apple Counter-Model
There’s a counterexample: Apple. They kept hardware and software integrated, controlled the full stack, built one of the most valuable companies in history.
The Apple model in robotics: a company that builds both the robot body AND the AI brain, capturing value through integration rather than platform control. Tesla is betting on this. Figure AI too—they ended their OpenAI collaboration in February 2025 to develop proprietary AI.
:::figure{id=“value-capture” caption=“Two winning positions in the robotics value chain”} [DESIGNER: Create simple 2x2 or diagram showing:]
TWO WINNING POSITIONS:
PLATFORM MODEL ┌─────────────────────────────┐ │ Cloud AI Provider │ ← Captures value via API fees │ (Google, OpenAI, Anthropic)│ └─────────────────────────────┘ │ │ API calls ▼ ┌─────────────────────────────┐ │ Hardware OEMs │ ← Compete on cost, thin margins │ (Unitree, Boston Dynamics) │ └─────────────────────────────┘
INTEGRATION MODEL ┌─────────────────────────────┐ │ Full-Stack Company │ ← Captures value through integration │ Hardware + AI Brain │ │ (Tesla, Figure AI) │ └─────────────────────────────┘
LOSING POSITION: Hardware without controlling intelligence = Dell in 1998 Competing on cost with no moat while platform owners take the profit
:::
What doesn’t work: hardware without controlling intelligence. That’s Dell in 1998—competing on cost with no moat, while platform owners take the profit.
14. What Would Prove Me Wrong
This essay makes falsifiable predictions. Here’s what would prove the thesis wrong:
:::callout{type=“falsifiable” title=“Conditions That Would Falsify This Thesis”}
1. VLA models plateau at scale. If going from 7B to 70B to 700B parameters doesn’t improve manipulation capability, the core thesis fails. The scaling laws have to apply to embodied tasks as they have to language and reasoning.
2. The 5Hz assumption fails. If valuable tasks require the foundation model to run at 50Hz+ — if you can’t cleanly separate “brain” from “spinal cord” — then edge computing wins and the cloud thesis collapses.
3. Domain-specific beats general. If small, specialized robotics models consistently outperform foundation models on real-world tasks, the bitter lesson doesn’t apply to robotics. The generalists might not win this time.
4. Investment doesn’t materialize. If total investment in humanoid robotics stays below $10B annually through 2028, the opportunity isn’t being recognized by capital markets. Either I’m wrong about the opportunity, or everyone else is.
:::
CODA: The Bet
This essay makes a specific bet:
The team training GPT-7 will also train the dominant robot brain.
Not a separate robotics team. Not a purpose-built manipulation system. The same researchers, infrastructure, and scaling laws that produce frontier language models will produce the model controlling millions of robot bodies.
Why is this time different?
The intelligence actually works. Previous hype cycles assumed intelligence would come from robotics research. This time it’s coming from foundation models. RT-2’s emergent reasoning, π0’s cross-embodiment transfer—real capabilities, not vaporware.
The hardware is actually cheap. Previous cycles featured $500,000 research platforms. This time: $6,000 production humanoids and falling.
The demand is actually urgent. Previous cycles offered “wouldn’t it be cool” applications. This time: 85 million worker shortage globally, AI companies seeking new revenue streams beyond chatbots, and geopolitical competition accelerating state investment. Multiple forces converging simultaneously.
When capability, cost, and demand align simultaneously, technology transitions happen.
The Stakes
The robot that folds your laundry will run GPT-7. But GPT-7 will also fold the laundry of millions of other people. It will work in factories and warehouses and construction sites and hospitals.
One model. Many bodies. Whoever controls the model controls the future of physical labor.
The question isn’t whether this happens. The question is who builds it, who runs it, and whether you’ve noticed the race has already begun.
Written December 2025.
The author has no financial position in any company mentioned. This essay reflects personal analysis, not insider information.
Check back in 2027, 2028, 2030.
References
Core Framing
Technological singularity — https://en.wikipedia.org/wiki/Technological_singularity
Dario Amodei, “Machines of Loving Grace” — https://www.darioamodei.com/essay/machines-of-loving-grace
Leopold Aschenbrenner, “Situational Awareness” — https://situational-awareness.ai/
AI-2027 (Kokotajlo et al.) — https://ai-2027.com/
AI Futures Model — https://www.aifuturesmodel.com/
Robotics Scaling Research
RT-1 — https://robotics-transformer1.github.io/
RT-2 — https://robotics-transformer2.github.io/
π0 (Physical Intelligence) — https://www.physicalintelligence.company/blog/pi0
Physical Intelligence human-to-robot transfer — https://www.pi.website/research/human_to_robot
Ilya Sutskever interview (Dwarkesh Patel) — https://www.dwarkesh.com/p/ilya-sutskever
Lab Activity
Google DeepMind Gemini Robotics — https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/
Google DeepMind Gemini Robotics On-Device — https://deepmind.google/blog/gemini-robotics-on-device-brings-ai-to-local-robotic-devices/
OpenAI robotics team restart — https://www.forbes.com/sites/kenrickcai/2024/05/30/openai-robotics-team/
Figure + OpenAI collaboration — https://www.prnewswire.com/news-releases/figure-raises-675m-at-2-6b-valuation-and-signs-collaboration-agreement-with-openai-302074897.html
1X + OpenAI funding — https://www.1x.tech/discover/1x-rasies-23-5m-in-series-a2-funding-led-by-open-ai
Physical Intelligence funding — https://www.reuters.com/technology/artificial-intelligence/robot-ai-startup-physical-intelligence-raises-400-mln-bezos-openai-2024-11-04/
Logan Kilpatrick tweet — https://x.com/OfficialLoganK/status/1868753943444263104
Figure-OpenAI split — https://www.businessinsider.com/figure-ai-ends-openai-partnership-building-own-models-2025-2
Hardware & Architecture
Figure Helix — https://www.figure.ai/news/helix
1X Neo Gamma — https://www.1x.tech/discover/introducing-neo-gamma
NVIDIA Jetson Orin — https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/
Sanctuary AI teleoperation — https://sanctuary.ai/blog/ai-robotics-and-the-case-for-teleoperation/
Chris Paxton on dexterity not being hardware-gated — https://x.com/chris_j_paxton/status/2007844962780717094
Latency & Infrastructure
Google Stadia shutdown — https://blog.google/products/stadia/stadia-update/
OpenAI Realtime API — https://platform.openai.com/docs/guides/realtime
Google Gemini Live API — https://ai.google.dev/gemini-api/docs/live
Pricing & Economics
GPT-4 research/pricing — https://openai.com/index/gpt-4-research/
a16z inference cost trends — https://a16z.com/llmflation-llm-inference-cost/
Wintel profit study (HBS) — https://www.hbs.edu/ris/Publication%20Files/05-083.pdf
Wintel Wikipedia — https://en.wikipedia.org/wiki/Wintel#Dominance
Unitree & Hardware Costs
Unitree H1 — https://shop.unitree.com/products/unitree-h1
Unitree G1 — https://shop.unitree.com/products/unitree-g1
Unitree R1 (Reuters) — https://www.reuters.com/business/chinas-unitree-launches-5900-humanoid-robot-r1-2025-07-25/
Unitree R1 (Robot Report) — https://www.therobotreport.com/unitree-designs-r1-humanoid-robot-to-be-agile-and-affordable/
Unitree R1 product page — https://www.unitree.com/R1
Component Costs
LiDAR historical costs (Waymo) — https://arstechnica.com/cars/2017/01/googles-waymo-invests-in-lidar-technology-cuts-costs-by-90-percent/
Hesai LiDAR pricing — https://www.reuters.com/technology/chinas-hesai-halve-lidar-prices-next-year-sees-wide-adoption-electric-cars-2024-11-27/
BNEF battery costs — https://about.bnef.com/insights/commodities/lithium-ion-battery-pack-prices-see-largest-drop-since-2017-falling-to-115-per-kilowatt-hour-bloombergnef/
Market Forecasts
Goldman Sachs humanoid report (Feb 2024) — https://www.goldmansachs.com/insights/articles/humanoid-robots
Morgan Stanley humanoid projections — https://www.morganstanley.com/insights/articles/humanoid-robots-ai-market
China & EV Precedent
China EV 2014 production — https://www.chinadaily.com.cn/business/motoring/2015-01/16/content_19330066.htm
IEA Global EV Outlook 2025 — https://www.iea.org/reports/global-ev-outlook-2025
USCC Humanoid Robots report — https://www.uscc.gov/sites/default/files/2024-10/Humanoid_Robots.pdf
Labor & Demographics
FRED employee compensation — https://fred.stlouisfed.org/series/A033RC1A027NBEA
Korn Ferry talent shortage — https://www.kornferry.com/insights/this-week-in-leadership/talent-crunch-future-of-work
Other
Epoch AI datacenter overview — https://epoch.ai/blog/what-you-need-to-know-about-ai-data-centers
OpenAI “Video generation models as world simulators” — https://openai.com/index/video-generation-models-as-world-simulators/
Quanta Magazine NLP oral history — https://www.quantamagazine.org/when-chatgpt-broke-an-entire-field-an-oral-history-20250430/
Designer Notes
Custom Components Used
This document uses the following custom component syntax for the blog platform:
Sidebars
Content here
Callouts
Content here
Hover Annotations
:::hover{content=“Tooltip text”}
Figures with Designer Instructions
:::figure{id=“unique-id” caption=“Caption text”} [DESIGNER: Instructions] :::
Tables
:::table{id=“unique-id” caption=“Caption text”} | Header | Header | |——–|——–| | Data | Data | :::
Quotes
:::quote{attribution=“Name” source=“Source”} Quote text :::
Visual Assets Needed
Data Pyramid (Section 1) — Three-tier pyramid showing data hierarchy
Model Scale Comparison Table (Section 1) — With “You Are Here” marker
Sora Wine Glass (Section 1) — Video embed or still frame
VIKI Image (Part II intro) — I, Robot reference image
Brain/Spinal Split Diagram (Section 4) — Simple Hz comparison
Unitree Price Trajectory (Section 6) — Log-scale line chart
EV vs Humanoid Comparison (Section 7) — Side-by-side table, could be visual
Component Costs Infographic (Section 8) — Multi-panel cost trajectories
China Multipliers Table (Section 10) — Could be visual bars
Value Capture Diagram (Section 13) — Platform vs Integration models
Key Numbers for Social/Summary Card
93% — Price reduction in 2 years (Unitree trajectory)
$5,900 — Current entry-level humanoid price
$4.6 trillion — US physical labor wage bill (addressable market)
$0.55-0.65/hr — Projected robot operating cost
85.2 million — Global worker shortage by 2030
160x — China EV production growth over 10 years
6x — Intel+Microsoft profits vs PC OEMs (Wintel precedent)
Reading Time Estimate
Full read: ~28 minutes
Skim (callouts + sidebars): ~8 minutes