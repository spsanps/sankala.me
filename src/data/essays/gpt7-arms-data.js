// Chart and visualization data for GPT-7 Will Have Arms essay

// Section 10: The Unitree Trajectory - Cost collapse
export const unitreeTrajectory = [
  {
    year: 2023,
    month: 'Aug',
    model: 'H1',
    price: 90000,
    description: '1.8m tall, capable of walking and running'
  },
  {
    year: 2024,
    month: 'May',
    model: 'G1',
    price: 16000,
    reduction: '82%',
    description: '1.27m, 35kg, 43 DOF'
  },
  {
    year: 2025,
    month: 'Jul',
    model: 'R1',
    price: 5900,
    reduction: '93%',
    description: 'Simplified design, remote-controlled with autonomy upgrade'
  }
];

// Section 11: EV vs Humanoid comparison
export const evVsHumanoid = [
  {
    factor: 'Battery supply',
    evStatus: 'Had to build gigafactories',
    humanoidStatus: 'Already exists (EV supply chain)',
    advantage: 'humanoid'
  },
  {
    factor: 'Battery per unit',
    evCost: '$15,000+ (60-100 kWh)',
    humanoidCost: '$500-1,500 (1-3 kWh)',
    advantage: 'humanoid'
  },
  {
    factor: 'Motor supply',
    evStatus: 'Had to scale',
    humanoidStatus: 'Already exists (drones, EVs)',
    advantage: 'humanoid'
  },
  {
    factor: 'Parts count',
    evCount: '10,000+',
    humanoidCount: '~3,000',
    advantage: 'humanoid'
  },
  {
    factor: 'Crash safety',
    evRequirement: 'Heavy regulation',
    humanoidRequirement: 'Minimal requirements',
    advantage: 'humanoid'
  },
  {
    factor: 'Assembly time',
    evTime: '20-30 hours',
    humanoidTime: '5-10 hours (estimated)',
    advantage: 'humanoid'
  }
];

// Section 13: Volume scenarios (How Many Robots?)
export const volumeScenarios = [
  {
    scenario: 'A: Linear (Goldman)',
    '2025': 8000,
    '2027': 45000,
    '2030': 250000,
    assumption: 'Commercial demand only, gradual adoption',
    color: '#8A9A85'
  },
  {
    scenario: 'B: EV Analogy',
    '2025': 15000,
    '2027': 100000,
    '2030': 800000,
    assumption: 'China state push equals EV mobilization',
    color: '#2A3C24'
  },
  {
    scenario: 'C: Faster Than EV',
    '2025': 25000,
    '2027': 200000,
    '2030': 2200000,
    assumption: 'Pre-built supply chain, simpler product',
    color: '#F0BE25'
  },
  {
    scenario: 'D: Security Mobilization',
    '2025': 30000,
    '2027': 350000,
    '2030': 4000000,
    assumption: 'Strategic asset status, US/China race',
    color: '#FBD45B'
  }
];

// Section 18: The Convergence - 5 trends
export const timelineConvergence = [
  {
    year: 2023,
    modelCapability: 0.4,
    hardwareCost: 0.7,
    inferenceCost: 0.6,
    dataEfficiency: 0.3,
    laborPressure: 0.5
  },
  {
    year: 2024,
    modelCapability: 0.55,
    hardwareCost: 0.55,
    inferenceCost: 0.45,
    dataEfficiency: 0.5,
    laborPressure: 0.6
  },
  {
    year: 2025,
    modelCapability: 0.7,
    hardwareCost: 0.4,
    inferenceCost: 0.3,
    dataEfficiency: 0.7,
    laborPressure: 0.7
  },
  {
    year: 2026,
    modelCapability: 0.82,
    hardwareCost: 0.28,
    inferenceCost: 0.18,
    dataEfficiency: 0.85,
    laborPressure: 0.8
  },
  {
    year: 2027,
    modelCapability: 0.9,
    hardwareCost: 0.18,
    inferenceCost: 0.1,
    dataEfficiency: 0.95,
    laborPressure: 0.9
  }
];

// Section 19: VIKI Scenarios
export const vikiScenarios = [
  {
    scenario: 'American VIKI',
    probability: 0.15,
    keyDriver: 'Requires US maintaining overwhelming AI lead',
    description: 'Google/OpenAI dominates, Chinese hardware uses US cloud AI'
  },
  {
    scenario: 'Chinese VIKI',
    probability: 0.10,
    keyDriver: 'Requires China overcoming chip constraints',
    description: 'Baidu/Alibaba dominates, Chinese full-stack solution'
  },
  {
    scenario: 'Bifurcation',
    probability: 0.55,
    keyDriver: 'Most consistent with current trajectory',
    description: 'US and China each develop separate robot AI stacks'
  },
  {
    scenario: 'Fragmentation',
    probability: 0.20,
    keyDriver: 'Requires multiple players reaching capability parity',
    description: 'Regional players (EU, Japan, Korea, India) develop independent capabilities'
  }
];

// Section 25: Year-by-Year Predictions (Updated structure)
export const yearByYearPredictions = [
  {
    year: 2026,
    title: 'The Foundation Year',
    volume: {
      range: '15,000-30,000',
      description: 'Wave 1 (government/pilots) in full swing'
    },
    capabilities: [
      { prediction: 'Major AI lab (Google, OpenAI, or Anthropic) ships commercial robotics API', confidence: '85%' },
      { prediction: 'Emergent tool use demonstrated in published research', confidence: '70%' },
      { prediction: 'First 1,000+ robot deployment at a single company', confidence: '75%' }
    ],
    hardware: {
      avgCost: '$5,500',
      chineseShare: '40-50% of global production'
    },
    policy: [
      { prediction: 'US announces $1B+ government humanoid initiative', confidence: '60%' }
    ]
  },
  {
    year: 2027,
    title: 'The Scaling Year',
    volume: {
      range: '100,000-200,000',
      vsGoldman: '76,000',
      description: 'Wave 2 (commercial scaling) begins'
    },
    capabilities: [
      { prediction: 'Zero-shot cross-embodiment transfer demonstrated commercially', confidence: '70%' },
      { prediction: 'Foundation models power 30%+ of new deployments', confidence: '75%' },
      { prediction: 'At least one major robotics company pivots to API', confidence: '65%' }
    ],
    hardware: {
      avgCost: '$5,000',
      chineseShare: '>50%'
    },
    deployment: [
      { prediction: 'Amazon: 10,000+ humanoid robots in fulfillment', confidence: '65%' },
      { prediction: 'First major warehouse operator deploys 5,000+', confidence: '60%' }
    ],
    policy: [
      { prediction: 'Export controls on robotics AI models proposed', confidence: '55%' }
    ]
  },
  {
    year: 2028,
    title: 'The Capability Year',
    volume: {
      range: '300,000-600,000',
      description: 'Wave 2 in full swing, early Wave 3 pilots begin'
    },
    capabilities: [
      { prediction: 'Foundation models power majority (>50%) of new deployments', confidence: '85%' },
      { prediction: 'Single foundation model controls 10+ distinct commercial tasks', confidence: '70%' },
      { prediction: 'Cloud-based robots outperform edge-based in benchmarks', confidence: '75%' }
    ],
    hardware: {
      avgCost: '$4,000',
      margins: '<20%'
    },
    deployment: [
      { prediction: 'Chinese company deploys 50,000+ in single year', confidence: '65%' },
      { prediction: 'Tesla Optimus: top-3 by volume OR pivots to licensing', confidence: '60%' },
      { prediction: 'Major household brand announces deployment', confidence: '55%' }
    ],
    geopolitical: [
      { prediction: 'PLA humanoid unit publicly acknowledged', confidence: '60%' }
    ]
  },
  {
    year: 2029,
    title: 'The Maturation Year',
    volume: {
      range: '500,000-1,200,000',
      description: 'Consumer viability threshold crossed'
    },
    capabilities: [
      { prediction: 'Humanoid completes novel multi-step task in unstructured environment', confidence: '80%' },
      { prediction: 'First "general purpose" robot across 3+ industries', confidence: '70%' }
    ],
    hardware: {
      avgCost: '$3,500',
      milestone: 'First sub-$3,000 from Chinese manufacturer'
    },
    deployment: [
      { prediction: 'Construction: 1,000+ at single company/project', confidence: '60%' },
      { prediction: 'Eldercare: 10,000+ in assisted living (Japan leads)', confidence: '65%' }
    ],
    risk: [
      { prediction: 'Fatal accident triggers regulatory response', confidence: '50%' }
    ]
  },
  {
    year: 2030,
    title: 'The Inflection Year',
    volume: {
      range: '800,000-2,000,000',
      vsGoldman: '250,000',
      description: 'Wave 3 (consumer) begins scaling'
    },
    marketStructure: [
      { prediction: 'Leading AI provider market cap exceeds hardware company', confidence: '65%' },
      { prediction: 'Hardware commoditized - margins <15%', confidence: '70%' },
      { prediction: '2-3 dominant AI providers control >60% of deployments', confidence: '60%' }
    ],
    hardware: {
      avgCost: '$3,000',
      consumerPrice: '$5,000-8,000'
    },
    deployment: {
      milestone: 'First million-unit year',
      usDeployments: '100,000-300,000',
      chinaDeployments: '400,000-1,000,000'
    }
  }
];

// Volume comparison table data
export const volumeComparison = [
  { year: 2026, goldman: 20000, baseCase: 22500, bullCase: 40000 },
  { year: 2027, goldman: 76000, baseCase: 150000, bullCase: 250000 },
  { year: 2028, goldman: 120000, baseCase: 450000, bullCase: 800000 },
  { year: 2029, goldman: 180000, baseCase: 850000, bullCase: 1500000 },
  { year: 2030, goldman: 250000, baseCase: 1400000, bullCase: 3000000 }
];

// Volume test projections (Section 24)
export const volumeTest = [
  {
    year: 2027,
    goldman: 76000,
    baseCase: 150000,
    bullCase: 200000
  },
  {
    year: 2030,
    goldman: 250000,
    baseCase: 1400000,
    bullCase: 2000000
  }
];

// Components cost collapse data (Section 12)
export const componentsCollapse = [
  {
    component: 'LIDAR',
    year2012: 75000,
    year2025: 100,
    reduction: '99.9%',
    driver: 'Mass adoption in vehicles and drones'
  },
  {
    component: 'IMUs',
    pastCost: 'Thousands',
    currentCost: 'Few dollars',
    driver: 'Smartphone components'
  },
  {
    component: 'Cameras',
    pastType: 'Specialized industrial',
    currentType: 'Commodity (phone-derived)',
    currentCost: 'Less than GoPro'
  },
  {
    component: 'Batteries (1-3 kWh)',
    costRange: '$500-1,500',
    trend: 'Falling (90% reduction 2010-2023)',
    driver: 'EV production scale'
  },
  {
    component: 'Compute (Jetson Orin)',
    capability: '70B parameter model',
    cost: '$999',
    trend: 'Cheap and getting cheaper'
  }
];
