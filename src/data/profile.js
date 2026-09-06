export const publications = [
  { id: 'embodied-agents', year: '2025', title: 'Evaluator-Guided LLM Distillation for Embodied Agent Decision-Making', authors: 'C. Pradeep and S. P. Kumar Sreekala', venue: 'NeurIPS 2025 Workshop on Foundation Models Meet Embodied Agents (FMEA)', note: 'First place in the Embodied Agent Interface Challenge, as team AxisTilted2.', links: [['https://openreview.net/pdf?id=gABfrJI5ni', 'Research paper'], ['/notes/eai-challenge', 'The account']] },
  { id: 'zinify', year: '2023', title: 'ZINify: Transforming Research Papers into Engaging Zines with Large Language Models', authors: 'J. Shriram and S. P. Kumar Sreekala', venue: 'UIST ’23 Adjunct', note: 'Honorable Mention, Student Innovation Contest.', links: [['https://dl.acm.org/doi/abs/10.1145/3586182.3625118', 'Research paper'], ['https://jaidevshriram.com/zinify-uist/', 'See the project']] },
  { id: 'power-quality', year: '2019', title: 'Power Quality Event Classification Using Long Short-Term Memory Networks', authors: 'S. K. G. Manikonda, J. Santhosh, S. P. Kumar Sreekala, S. Gangwani, and D. N. Gaonkar', venue: 'IEEE DISCOVER 2019', note: 'Best Paper Award.', links: [['/documents/certificates/24_DISCOVER_BestPaper%20(2).pdf', 'Award certificate']] },
];
export const experience = [
  { organization: 'eBay', date: 'April 2024 — present', role: 'Applied Researcher 1 (SE3) · Knowledge Extraction for Search', details: [
    'Drove adoption of small multimodal model (SLM)-based generative information extraction at scale (100M+ listings/month), designing and building pipelines that improve on legacy NER and dictionary-based methods.',
    'Built multimodal agents and workflow pipelines that generate synthetic training and evaluation data using open-source large language and multimodal models (LLMs, LMMs) to accelerate data and model iteration.',
    'Developed deep learning models for classification, confidence scoring, and bounding-box detection to augment the LLM/SLM information extraction pipeline, improving extraction accuracy and field coverage.',
  ] },
  { organization: 'Texas Instruments', date: 'July 2019 — July 2022', role: 'ASIC Digital Design Engineer', details: [
    'Physical design for four taped-out power management ICs: timing closure (STA), power, and EM/IR reliability signoff.',
    'RTL design of custom floating-point multipliers and a system ALU achieving 40% area reduction versus comparable Cadence IP; plus RTL for PMBus protocol and GPIO control IP.',
    'Automated physical design flows in Python/TCL, cutting tape-out time by 2×.',
  ] },
];
export const education = [
  { institution: 'University of California San Diego', degree: 'MS, Computer Science & Engineering', date: '2022–2024', detail: 'AI/ML specialization. Probabilistic reasoning, reinforcement learning, deep generative models, and recommender systems. Research with Julian McAuley’s group; teaching assistant for recommender systems and data mining.' },
  { institution: 'National Institute of Technology Karnataka', degree: 'B.Tech, Electrical & Electronics Engineering', date: '2015–2019', detail: 'Power-quality classification with deep learning, Kaggle competitions, and the Amateur Astronomy Club.' },
];
export const honors = [
  ['2025', 'First place · EAI Challenge', 'Embodied Agent Interface Challenge at the NeurIPS FMEA Workshop. Team AxisTilted2.'],
  ['2023', 'Honorable Mention · UIST', 'ZINify, Student Innovation Contest.'],
  ['2023', 'First of 591 teams · eBay University ML Challenge', '2022 competition; results announced January 2023.'],
  ['2019', 'Best Paper · IEEE DISCOVER', 'Power quality event classification using LSTM.'],
  ['2018', 'Kaggle Competitions Expert', 'Silver: 98th of 2,380 teams (top 5%). Bronze: 312th of 4,539 teams (top 7%).'],
];
