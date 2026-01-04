import React, { useState } from 'react';
import { TrendingDown, ChevronRight, ExternalLink } from 'lucide-react';

// Minimal, elegant Data Pyramid
export function DataPyramid() {
  return (
    <figure className="my-10">
      <div className="flex flex-col items-center gap-1 max-w-md mx-auto">
        {/* Top tier */}
        <div className="w-[40%] py-3 px-4 bg-[#2A3C24] text-center rounded-t-lg">
          <p className="text-[10px] font-semibold tracking-widest text-[#FBD45B] mb-0.5">CALIBRATION</p>
          <p className="text-xs text-[#F5F2EB]">Robot demonstrations</p>
          <p className="text-[10px] text-[#F5F2EB]/60">millions of tokens</p>
        </div>
        {/* Middle tier */}
        <div className="w-[70%] py-3 px-4 bg-[#8A9A85] text-center">
          <p className="text-[10px] font-semibold tracking-widest text-[#1A1A1A] mb-0.5">ALIGNMENT</p>
          <p className="text-xs text-[#1A1A1A]">Egocentric human video</p>
          <p className="text-[10px] text-[#1A1A1A]/60">billions of tokens</p>
        </div>
        {/* Bottom tier */}
        <div className="w-full py-4 px-4 bg-[#2A3C24] text-center rounded-b-lg">
          <p className="text-[10px] font-semibold tracking-widest text-[#FBD45B] mb-0.5">FOUNDATION</p>
          <p className="text-sm text-[#F5F2EB]">YouTube-scale general video</p>
          <p className="text-[10px] text-[#F5F2EB]/60">trillions of tokens</p>
        </div>
      </div>
      <figcaption className="text-center text-sm text-[#8A9A85] mt-4 italic font-serif">
        Each layer requires orders of magnitude less data than the one below
      </figcaption>
    </figure>
  );
}

// Clean model scale table
export function ModelScaleComparison() {
  return (
    <figure className="my-10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-2 font-semibold text-[#1A1A1A]">Model</th>
            <th className="text-left py-2 font-semibold text-[#1A1A1A]">Parameters</th>
            <th className="text-left py-2 font-semibold text-[#1A1A1A]">Equivalent Era</th>
          </tr>
        </thead>
        <tbody className="font-serif">
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2.5 text-[#1A1A1A]/70">Sora-class (2024)</td>
            <td className="py-2.5 text-[#8A9A85]">~3-10B</td>
            <td className="py-2.5 text-[#8A9A85]">GPT-2</td>
          </tr>
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2.5 text-[#1A1A1A]/70">Current VLAs</td>
            <td className="py-2.5 text-[#8A9A85]">7-12B</td>
            <td className="py-2.5 text-[#8A9A85]">GPT-2/3</td>
          </tr>
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2.5 text-[#1A1A1A]/70">Frontier LLMs</td>
            <td className="py-2.5 text-[#8A9A85]">100B+</td>
            <td className="py-2.5 text-[#8A9A85]">GPT-4/5</td>
          </tr>
          <tr className="bg-[#2A3C24]/5">
            <td className="py-2.5 font-medium text-[#2A3C24]">Unified multimodal (2026-27?)</td>
            <td className="py-2.5 font-medium text-[#2A3C24]">1T+</td>
            <td className="py-2.5 font-medium text-[#2A3C24]">← Next frontier</td>
          </tr>
        </tbody>
      </table>
      <figcaption className="text-center text-sm text-[#8A9A85] mt-3 italic font-serif">
        Video models today are where language models were in 2019
      </figcaption>
    </figure>
  );
}

// Minimal Unitree price trajectory
export function UnitreePriceChart() {
  const points = [
    { date: 'Mid-2023', model: 'H1', price: '$90,000' },
    { date: '2024', model: 'G1', price: '$16,000' },
    { date: 'July 2025', model: 'R1', price: '$5,900' },
  ];

  return (
    <figure className="my-10">
      <div className="flex items-end justify-between gap-4 h-48 px-4">
        {points.map((p, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-[#2A3C24] rounded-t flex items-end justify-center transition-all"
              style={{ height: i === 0 ? '100%' : i === 1 ? '45%' : '20%' }}
            >
              <span className="text-[#F5F2EB] text-sm font-semibold pb-2">{p.price}</span>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-[#1A1A1A]">{p.model}</p>
              <p className="text-xs text-[#8A9A85]">{p.date}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2A3C24] text-[#F5F2EB] rounded-full text-sm">
          <TrendingDown size={14} />
          <span className="font-semibold">93% reduction</span>
          <span className="text-[#F5F2EB]/70">in under two years</span>
        </span>
      </div>
      <figcaption className="text-center text-sm text-[#8A9A85] mt-3 italic font-serif">
        Different capability tiers, but the trend is clear
      </figcaption>
    </figure>
  );
}

// Clean component costs
export function ComponentCostsChart() {
  const components = [
    { name: 'LiDAR', from: '$75,000', to: '~$750', decline: '99%', period: '2012→2024' },
    { name: 'Batteries', from: '$1,100/kWh', to: '$115/kWh', decline: '90%', period: '2010→2024' },
    { name: 'Compute', from: '$3,000', to: '$600', decline: '80%', period: '2018→2024' },
    { name: 'Actuators', from: '$3,000', to: '$2,000', decline: '33%', period: '2018→2024', slow: true },
  ];

  return (
    <figure className="my-10">
      <div className="space-y-3">
        {components.map((c) => (
          <div key={c.name} className="flex items-center gap-4 py-2 border-b border-[#2A3C24]/10 last:border-0">
            <span className="w-20 font-medium text-[#1A1A1A]">{c.name}</span>
            <span className="text-sm text-[#8A9A85] line-through">{c.from}</span>
            <span className="text-[#8A9A85]">→</span>
            <span className="text-sm font-medium text-[#2A3C24]">{c.to}</span>
            <span className="ml-auto text-xs text-[#8A9A85]">{c.period}</span>
            <span className={`text-sm font-semibold ${c.slow ? 'text-[#8A9A85]' : 'text-[#2A3C24]'}`}>
              {c.decline}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-sm text-[#8A9A85] mt-4 italic font-serif">
        Every component on steep cost curves driven by other industries
      </figcaption>
    </figure>
  );
}

// Clean China multipliers
export function ChinaMultipliers() {
  const data = [
    { industry: 'EVs', start: '78K units', end: '12.4M units', multiplier: '160×', years: '10 years' },
    { industry: 'Solar PV', start: '3 GW', end: '880 GW', multiplier: '290×', years: '13 years' },
    { industry: 'Batteries', start: 'Minimal', end: '80%+ share', multiplier: '—', years: '<10 years' },
  ];

  return (
    <figure className="my-10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-2 font-semibold">Industry</th>
            <th className="text-left py-2 font-semibold">Starting Point</th>
            <th className="text-left py-2 font-semibold">Ending Point</th>
            <th className="text-right py-2 font-semibold">Multiplier</th>
          </tr>
        </thead>
        <tbody className="font-serif">
          {data.map((d) => (
            <tr key={d.industry} className="border-b border-[#2A3C24]/10">
              <td className="py-2.5 font-medium text-[#2A3C24]">{d.industry}</td>
              <td className="py-2.5 text-[#8A9A85]">{d.start}</td>
              <td className="py-2.5 text-[#8A9A85]">{d.end}</td>
              <td className="py-2.5 text-right font-semibold text-[#2A3C24]">{d.multiplier}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="text-center text-sm text-[#8A9A85] mt-3 italic font-serif">
        When China designates an industry as strategic
      </figcaption>
    </figure>
  );
}

// Clean value capture diagram
export function ValueCaptureDiagram() {
  return (
    <figure className="my-10">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform Model */}
        <div className="border border-[#2A3C24]/20 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-[#2A3C24] uppercase tracking-wide mb-4">Platform Model</h4>
          <div className="space-y-3">
            <div className="bg-[#2A3C24] text-[#F5F2EB] rounded p-3 text-center">
              <p className="font-medium">Cloud AI Provider</p>
              <p className="text-xs text-[#F5F2EB]/70 mt-1">Captures value via API fees</p>
            </div>
            <div className="text-center text-[#8A9A85] text-xs">↓ API calls</div>
            <div className="border border-dashed border-[#8A9A85] rounded p-3 text-center">
              <p className="font-medium text-[#1A1A1A]/60">Hardware OEMs</p>
              <p className="text-xs text-[#8A9A85] mt-1">Compete on cost, thin margins</p>
            </div>
          </div>
          <p className="text-xs text-[#8A9A85] mt-4 text-center">Wintel: 6× more profit than OEMs</p>
        </div>

        {/* Integration Model */}
        <div className="border border-[#2A3C24]/20 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-[#2A3C24] uppercase tracking-wide mb-4">Integration Model</h4>
          <div className="bg-[#2A3C24] text-[#F5F2EB] rounded p-4 text-center">
            <p className="font-medium">Full-Stack Company</p>
            <p className="text-sm text-[#F5F2EB]/80 mt-1">Hardware + AI Brain</p>
            <div className="flex justify-center gap-2 mt-3 text-xs">
              <span className="px-2 py-0.5 bg-[#F5F2EB]/10 rounded">Tesla</span>
              <span className="px-2 py-0.5 bg-[#F5F2EB]/10 rounded">Figure AI</span>
            </div>
            <p className="text-xs text-[#FBD45B] mt-3">Captures value through integration</p>
          </div>
          <p className="text-xs text-[#8A9A85] mt-4 text-center">Apple precedent: full stack control</p>
        </div>
      </div>
      <p className="text-center text-sm text-[#1A1A1A] mt-4 py-2 bg-[#FBD45B]/10 rounded">
        <strong>What doesn't work:</strong> Hardware without controlling intelligence
      </p>
    </figure>
  );
}

// Clean robot economics table
export function RobotEconomicsTable() {
  return (
    <figure className="my-10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-2 font-semibold">Cost Component</th>
            <th className="text-right py-2 font-semibold">Current ($16K)</th>
            <th className="text-right py-2 font-semibold">Projected ($6K)</th>
          </tr>
        </thead>
        <tbody className="font-serif">
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2">Hardware (3yr depreciation)</td>
            <td className="py-2 text-right text-[#8A9A85]">$5,333/yr</td>
            <td className="py-2 text-right text-[#2A3C24]">$2,000/yr</td>
          </tr>
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2">Maintenance (~15%/yr)</td>
            <td className="py-2 text-right text-[#8A9A85]">$2,400/yr</td>
            <td className="py-2 text-right text-[#2A3C24]">$900/yr</td>
          </tr>
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2">Electricity + Cloud</td>
            <td className="py-2 text-right text-[#8A9A85]">~$1,500/yr</td>
            <td className="py-2 text-right text-[#2A3C24]">~$1,200/yr</td>
          </tr>
          <tr className="bg-[#2A3C24]/5 font-medium">
            <td className="py-2">Hourly cost (7,000 hrs/yr)</td>
            <td className="py-2 text-right">$1.30-1.50/hr</td>
            <td className="py-2 text-right text-[#2A3C24]">$0.55-0.65/hr</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
        <span className="px-2 py-1 bg-[#F5F2EB] rounded">Vietnam: $2-3/hr</span>
        <span className="px-2 py-1 bg-[#F5F2EB] rounded">China: $6-8/hr</span>
        <span className="px-2 py-1 bg-[#F5F2EB] rounded">US: $20-30/hr</span>
      </div>
    </figure>
  );
}

// Latency comparison
export function LatencyComparisonTable() {
  return (
    <figure className="my-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-2 font-semibold"></th>
            <th className="text-center py-2 font-semibold">Cloud Gaming</th>
            <th className="text-center py-2 font-semibold">Cloud Robotics</th>
          </tr>
        </thead>
        <tbody className="font-serif">
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2 font-medium">Update rate</td>
            <td className="py-2 text-center text-[#8A9A85]">60Hz</td>
            <td className="py-2 text-center text-[#2A3C24]">5-10Hz</td>
          </tr>
          <tr className="border-b border-[#2A3C24]/10">
            <td className="py-2 font-medium">Latency sensitivity</td>
            <td className="py-2 text-center text-[#8A9A85]">Critical</td>
            <td className="py-2 text-center text-[#2A3C24]">Tolerant</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">Failure mode</td>
            <td className="py-2 text-center text-[#8A9A85]">Lose match</td>
            <td className="py-2 text-center text-[#2A3C24]">Robot pauses</td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}

// EV vs Humanoid comparison
export function EVvsHumanoidTable() {
  const rows = [
    { factor: 'Battery supply', ev: 'Build from scratch', humanoid: 'Already exists' },
    { factor: 'Battery cost/unit', ev: '$15,000+', humanoid: '$150-400' },
    { factor: 'Parts count', ev: '10,000+', humanoid: '~3,000' },
    { factor: 'Assembly time', ev: '20-30 hours', humanoid: '5-10 hours' },
  ];

  return (
    <figure className="my-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-2 font-semibold">Factor</th>
            <th className="text-left py-2 font-semibold">EVs (2014)</th>
            <th className="text-left py-2 font-semibold">Humanoids (2025)</th>
          </tr>
        </thead>
        <tbody className="font-serif">
          {rows.map((r) => (
            <tr key={r.factor} className="border-b border-[#2A3C24]/10">
              <td className="py-2 font-medium">{r.factor}</td>
              <td className="py-2 text-[#8A9A85]">{r.ev}</td>
              <td className="py-2 text-[#2A3C24]">{r.humanoid}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="text-center text-sm text-[#8A9A85] mt-3 italic font-serif">
        Humanoids leverage supply chains EVs had to build
      </figcaption>
    </figure>
  );
}

// Beautiful references section
export function ReferencesSection() {
  const categories = [
    {
      title: 'Core Framing',
      refs: [
        { name: 'Machines of Loving Grace — Amodei', url: 'https://www.darioamodei.com/essay/machines-of-loving-grace' },
        { name: 'Situational Awareness — Aschenbrenner', url: 'https://situational-awareness.ai/' },
        { name: 'AI-2027 Scenario', url: 'https://ai-2027.com/' },
      ]
    },
    {
      title: 'Robotics Research',
      refs: [
        { name: 'RT-1 Paper', url: 'https://robotics-transformer1.github.io/' },
        { name: 'RT-2 Paper', url: 'https://robotics-transformer2.github.io/' },
        { name: 'π0 — Physical Intelligence', url: 'https://www.physicalintelligence.company/blog/pi0' },
      ]
    },
    {
      title: 'Lab Activity',
      refs: [
        { name: 'Gemini Robotics — DeepMind', url: 'https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/' },
        { name: 'OpenAI Robotics Team', url: 'https://www.forbes.com/sites/kenrickcai/2024/05/30/openai-robotics-team/' },
        { name: 'Physical Intelligence Funding', url: 'https://www.reuters.com/technology/artificial-intelligence/robot-ai-startup-physical-intelligence-raises-400-mln-bezos-openai-2024-11-04/' },
      ]
    },
    {
      title: 'Hardware & Economics',
      refs: [
        { name: 'Unitree R1 ($5,900)', url: 'https://www.reuters.com/business/chinas-unitree-launches-5900-humanoid-robot-r1-2025-07-25/' },
        { name: 'Goldman Sachs Humanoid Report', url: 'https://www.goldmansachs.com/insights/articles/humanoid-robots' },
        { name: 'Wintel Study (HBS)', url: 'https://www.hbs.edu/ris/Publication%20Files/05-083.pdf' },
        { name: 'USCC Humanoid Robots', url: 'https://www.uscc.gov/sites/default/files/2024-10/Humanoid_Robots.pdf' },
      ]
    },
  ];

  return (
    <section className="mt-16 pt-10 border-t border-[#2A3C24]/20">
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6 font-serif">References</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.title}>
            <h3 className="text-xs font-semibold text-[#2A3C24] uppercase tracking-wider mb-3">{cat.title}</h3>
            <ul className="space-y-1.5">
              {cat.refs.map((ref) => (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 hover:text-[#2A3C24] transition-colors"
                  >
                    <ChevronRight size={12} className="text-[#8A9A85]" />
                    <span className="group-hover:underline">{ref.name}</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// Remove KeyStatsBanner - it was misplaced
export function KeyStatsBanner() {
  return null;
}
