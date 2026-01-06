import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Data Pyramid Visualization - Stacked layers with pyramid-like widths
export function DataPyramid() {
  const layers = [
    {
      name: 'CALIBRATION',
      data: 'Robot demonstrations',
      scale: 'Millions',
      learns: 'Specific embodiment',
      color: '#FBD45B',
      textColor: '#2A3C24',
      width: '50%'
    },
    {
      name: 'ALIGNMENT',
      data: 'Egocentric human video',
      scale: 'Billions',
      learns: 'Humanoid manipulation',
      color: '#3D5235',
      textColor: '#F5F2EB',
      width: '75%'
    },
    {
      name: 'FOUNDATION',
      data: 'YouTube-scale video',
      scale: 'Trillions',
      learns: 'Physics, objects, causality',
      color: '#2A3C24',
      textColor: '#F5F2EB',
      width: '100%'
    }
  ];

  return (
    <div className="w-full py-6">
      <div className="flex flex-col items-center gap-2">
        {layers.map((layer, i) => (
          <div
            key={i}
            className="flex items-stretch rounded overflow-hidden"
            style={{ width: layer.width, minHeight: '72px' }}
          >
            {/* Full bar with content */}
            <div
              className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2"
              style={{ backgroundColor: layer.color }}
            >
              <div className="min-w-0 flex-shrink">
                <span className="font-semibold text-xs tracking-wide block" style={{ color: layer.textColor, fontFamily: 'Inter, sans-serif' }}>
                  {layer.name}
                </span>
                <div className="text-sm" style={{ color: layer.textColor, opacity: 0.9, fontFamily: 'Crimson Pro, Georgia, serif' }}>
                  {layer.data}
                </div>
              </div>
              <div className="sm:text-right text-xs flex-shrink-0 mt-1 sm:mt-0 sm:ml-2" style={{ color: layer.textColor, opacity: 0.8, fontFamily: 'Crimson Pro, Georgia, serif' }}>
                <span className="whitespace-nowrap">{layer.scale}</span>
                <span className="sm:block inline ml-1 sm:ml-0 whitespace-nowrap">→ {layer.learns}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-[#8A9A85] mt-4 italic" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        Each layer requires orders of magnitude less data than the one below
      </p>
    </div>
  );
}

// Model Scale Comparison Table
export function ModelScaleTable() {
  const data = [
    { model: 'Sora-class (2024)', params: '~3-10B (estimated)', era: 'GPT-2', current: false },
    { model: 'Current VLAs', params: '7-12B', era: 'GPT-2/3', current: false },
    { model: 'Frontier LLMs', params: '100B+', era: 'GPT-4/5', current: false },
    { model: 'Unified multimodal (2026-27?)', params: '1T+', era: 'GPT-7 class', current: true },
  ];

  return (
    <div className="w-full overflow-x-auto my-6">
      <table className="w-full border-collapse" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Model</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Parameters</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Rough Era Equivalent</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-[#8A9A85]/30 ${row.current ? 'bg-[#FBD45B]/20' : ''}`}
            >
              <td className={`py-3 px-4 text-sm ${row.current ? 'font-semibold text-[#2A3C24]' : 'text-[#1A1A1A]'}`}>
                {row.model}
              </td>
              <td className="py-3 px-4 text-sm text-[#8A9A85]">{row.params}</td>
              <td className={`py-3 px-4 text-sm ${row.current ? 'font-semibold text-[#2A3C24]' : 'text-[#8A9A85]'}`}>
                {row.era}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Brain/Spinal Diagram
export function BrainSpinalDiagram() {
  return (
    <div className="w-full py-8">
      <svg viewBox="0 0 600 250" className="w-full max-w-2xl mx-auto">
        {/* Brain section */}
        <rect x="20" y="30" width="260" height="180" rx="8" fill="#E8E5DE" stroke="#8A9A85" strokeWidth="2" />
        <text x="150" y="60" textAnchor="middle" fill="#2A3C24" fontSize="14" fontWeight="700">BRAIN (Low Hz)</text>
        <text x="150" y="82" textAnchor="middle" fill="#8A9A85" fontSize="11">Cloud / High-level planning</text>

        {/* Brain steps */}
        <rect x="40" y="100" width="220" height="28" rx="4" fill="#2A3C24" />
        <text x="150" y="119" textAnchor="middle" fill="#F5F2EB" fontSize="11">"Decide to grab cup"</text>

        <text x="150" y="148" textAnchor="middle" fill="#8A9A85" fontSize="18">↓</text>

        <rect x="40" y="158" width="220" height="28" rx="4" fill="#3D5235" />
        <text x="150" y="177" textAnchor="middle" fill="#F5F2EB" fontSize="11">"Adjust for position" → "Close grip"</text>

        {/* Arrow between */}
        <path d="M 290 120 L 320 120" stroke="#2A3C24" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#2A3C24" />
          </marker>
        </defs>

        {/* Spinal section */}
        <rect x="320" y="30" width="260" height="180" rx="8" fill="#FBD45B" stroke="#E5B82A" strokeWidth="2" />
        <text x="450" y="60" textAnchor="middle" fill="#2A3C24" fontSize="14" fontWeight="700">SPINAL CORD (High Hz)</text>
        <text x="450" y="82" textAnchor="middle" fill="#4A5D42" fontSize="11">On-device / Trajectory tracking</text>

        {/* Spinal items */}
        <rect x="340" y="100" width="220" height="24" rx="4" fill="#2A3C24" />
        <text x="450" y="117" textAnchor="middle" fill="#F5F2EB" fontSize="10">Continuous trajectory tracking</text>

        <rect x="340" y="132" width="220" height="24" rx="4" fill="#2A3C24" />
        <text x="450" y="149" textAnchor="middle" fill="#F5F2EB" fontSize="10">Balance corrections</text>

        <rect x="340" y="164" width="220" height="24" rx="4" fill="#2A3C24" />
        <text x="450" y="181" textAnchor="middle" fill="#F5F2EB" fontSize="10">Reflexes & safety stops</text>

        {/* Bottom label */}
        <text x="300" y="235" textAnchor="middle" fill="#8A9A85" fontSize="11" fontStyle="italic">
          This maps to Cloud (planning) vs On-device (control)
        </text>
      </svg>
    </div>
  );
}

// Unitree Price Chart
export function UniTreePriceChart() {
  const data = [
    { date: 'Mid-2023', model: 'H1', price: 90000 },
    { date: 'Mid-2024', model: 'G1', price: 16000 },
    { date: 'Jul 2025', model: 'R1', price: 5900 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#2A3C24] text-[#F5F2EB] px-3 py-2 rounded text-sm">
          <p className="font-semibold">{d.model}</p>
          <p className="text-[#FBD45B]">${d.price.toLocaleString()}</p>
          <p className="text-[#8A9A85] text-xs">{d.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full my-6">
      <h4 className="text-center text-sm font-semibold text-[#2A3C24] mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
        Unitree Humanoid Pricing (Log Scale)
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#8A9A85" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#8A9A85' }}
              axisLine={{ stroke: '#8A9A85', opacity: 0.5 }}
            />
            <YAxis
              scale="log"
              domain={[5000, 100000]}
              tick={{ fontSize: 11, fill: '#8A9A85' }}
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
              axisLine={{ stroke: '#8A9A85', opacity: 0.5 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2A3C24"
              strokeWidth={3}
              dot={{ fill: '#FBD45B', stroke: '#2A3C24', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-4">
        <span className="inline-block px-3 py-1 bg-[#2A3C24] text-[#F5F2EB] text-xs rounded-full">
          93% reduction in 2 years
        </span>
      </div>
    </div>
  );
}

// Component Costs Infographic
export function ComponentCostsInfographic() {
  const components = [
    {
      name: 'LiDAR',
      then: '$75,000 (2012)',
      now: '$500-1,000 (2025)',
      future: '<$200',
      decline: '99%',
      color: '#2A3C24'
    },
    {
      name: 'Batteries',
      then: '$1,100/kWh (2010)',
      now: '$115/kWh (2025)',
      future: '$80-100/kWh',
      decline: '90%',
      color: '#3D5235'
    },
    {
      name: 'IMUs',
      then: 'Thousands (2010)',
      now: '$1-10 (2025)',
      future: 'Commodity',
      decline: '99%+',
      color: '#4A5D42'
    },
    {
      name: 'Cameras',
      then: '$1,000+ industrial',
      now: '$10-200',
      future: 'Smartphone prices',
      decline: '95%+',
      color: '#5E7356'
    },
    {
      name: 'Compute',
      then: 'Specialized',
      now: '$300-2,000 (Jetson)',
      future: '$100-300',
      decline: 'Continuing',
      color: '#8A9A85'
    },
    {
      name: 'Actuators',
      then: '$5,000+ each',
      now: '$500-5,000',
      future: 'Slowest to fall',
      decline: 'Modest',
      color: '#FBD45B'
    },
  ];

  return (
    <div className="w-full my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((c, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border-2 bg-[#F5F2EB]/50"
            style={{ borderColor: c.color }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[#2A3C24]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {c.name}
              </h4>
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{ background: c.color, color: c.color === '#FBD45B' ? '#2A3C24' : '#F5F2EB' }}
              >
                {c.decline}
              </span>
            </div>
            <div className="space-y-1 text-sm" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
              <div className="flex justify-between">
                <span className="text-[#8A9A85]">Then:</span>
                <span className="text-[#8A9A85] font-mono text-xs">{c.then}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9A85]">Now:</span>
                <span className="text-[#2A3C24] font-mono text-xs font-semibold">{c.now}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9A85]">Future:</span>
                <span className="text-[#8A9A85] font-mono text-xs">{c.future}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// China Multipliers Chart
export function ChinaMultipliersChart() {
  // All metrics normalized to 10-year growth multiples with sourced data
  const data = [
    {
      industry: 'Li-ion Batteries',
      start: '4.4 GWh',
      end: '791 GWh',
      period: '2014→2024',
      multiplier: 180,
      tooltip: 'EV battery sales',
      sourceUrl: 'https://autonews.gasgoo.com/70035698.html',
      sourceName: 'Gasgoo'
    },
    {
      industry: 'EVs',
      start: '78K units',
      end: '12.9M units',
      period: '2014→2024',
      multiplier: 164,
      tooltip: 'NEV annual production',
      sourceUrl: 'https://en.caam.org.cn/Index/show/catid/44/id/1026.html',
      sourceName: 'CAAM'
    },
    {
      industry: 'Solar PV',
      start: '28 GW',
      end: '887 GW',
      period: '2014→2024',
      multiplier: 32,
      tooltip: 'Cumulative installed capacity',
      sourceUrl: 'https://www.pv-magazine.com/2025/01/21/china-hits-277-17-gw-of-new-pv-installations-in-2024/',
      sourceName: 'pv magazine'
    },
  ];

  const maxMultiplier = Math.max(...data.map(d => d.multiplier));

  return (
    <div className="w-full my-8">
      <div className="space-y-5">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="font-bold text-[#2A3C24] w-32 text-sm"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                title={d.tooltip}
              >
                {d.industry}
              </span>
              <div className="flex-1 h-8 bg-[#E8E5DE] rounded overflow-hidden relative">
                <div
                  className="h-full bg-[#2A3C24] rounded flex items-center justify-end pr-3"
                  style={{ width: `${Math.max(20, (d.multiplier / maxMultiplier) * 100)}%` }}
                >
                  <span className="text-[#FBD45B] font-bold text-sm">{d.multiplier}×</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8A9A85] ml-[8.5rem]" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
              <span className="text-[#2A3C24] font-medium">{d.start}</span>
              <span>→</span>
              <span className="text-[#2A3C24] font-medium">{d.end}</span>
              <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[#8A9A85] hover:text-[#2A3C24] hover:underline">
                [{d.sourceName}]
              </a>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-[#8A9A85] mt-6 italic" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        When China designates an industry strategic, scaling follows
      </p>
    </div>
  );
}

// Value Capture Diagram
export function ValueCaptureDiagram() {
  return (
    <div className="w-full py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
        {/* Platform Model */}
        <div className="flex flex-col">
          <h4 className="text-center font-bold text-[#2A3C24] pb-2 border-b-2 border-[#2A3C24]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            PLATFORM MODEL
          </h4>
          <div className="flex-1 flex flex-col mt-4">
            <div className="bg-[#2A3C24] text-[#F5F2EB] p-4 rounded-lg text-center">
              <p className="font-semibold mb-1">Cloud AI Provider</p>
              <p className="text-xs text-[#8A9A85]">Google, OpenAI, Anthropic</p>
              <p className="text-[#FBD45B] text-sm mt-2 font-semibold">Captures value via API fees</p>
            </div>
            <div className="text-center text-2xl text-[#8A9A85] py-2">↓</div>
            <div className="bg-[#E8E5DE] text-[#8A9A85] p-4 rounded-lg text-center border-2 border-dashed border-[#8A9A85]/50">
              <p className="font-semibold mb-1 text-[#2A3C24]">Hardware OEMs</p>
              <p className="text-xs">Unitree, Boston Dynamics, etc.</p>
              <p className="text-[#8A9A85] text-sm mt-2">Compete on cost, thin margins</p>
            </div>
          </div>
        </div>

        {/* Integration Model - Flexbox to match height */}
        <div className="flex flex-col">
          <h4 className="text-center font-bold text-[#2A3C24] pb-2 border-b-2 border-[#3D5235]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            INTEGRATION MODEL
          </h4>
          <div className="flex-1 bg-[#3D5235] text-[#F5F2EB] rounded-lg text-center flex flex-col justify-center p-6 mt-4">
            <p className="font-semibold text-lg mb-2">Full-Stack Company</p>
            <p className="text-sm text-[#8A9A85] mb-3">Tesla, Figure AI</p>
            <p className="text-[#FBD45B] text-sm font-semibold">Captures value via integration</p>
          </div>
        </div>
      </div>

      {/* Losing position */}
      <div className="max-w-xl mx-auto mt-8 p-4 bg-[#E8E5DE] border border-[#8A9A85]/30 rounded-lg text-center">
        <p className="text-[#2A3C24] font-semibold" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>LOSING POSITION</p>
        <p className="text-[#2A3C24]/80 text-sm mt-1" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
          Hardware without controlling intelligence = Dell in 1998
        </p>
        <p className="text-[#8A9A85] text-xs mt-1" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
          Competing on cost with no moat while platform owners take the profit
        </p>
      </div>
    </div>
  );
}

// Latency Comparison Table
export function LatencyComparisonTable() {
  return (
    <div className="w-full overflow-x-auto my-6">
      <table className="w-full border-collapse" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Dimension</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Cloud Gaming</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Cloud Robotics</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Update rate</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">60Hz frame rate</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">5-10Hz control rate</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Latency sensitivity</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Critical: competitive PvP</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">Tolerant: pick up box</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Failure mode</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Lose match</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">Robot pauses</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Robot Economics Table - Current vs Projected costs
export function RobotEconomicsTable() {
  return (
    <div className="w-full overflow-x-auto my-6">
      <table className="w-full border-collapse" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Cost Component</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-[#2A3C24]">Current (2025)</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-[#2A3C24]">Projected (2028)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Hardware (3yr depreciation)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] text-right">~$13,000/year</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] text-right">~$2,000/year</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Maintenance (~15%/year)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] text-right">~$6,000/year</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] text-right">~$900/year</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Electricity (~500W, 20hr/day)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] text-right">~$700/year</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] text-right">~$700/year</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Cloud inference (estimated)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] text-right">—</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] text-right">
              <span
                className="border-b border-dotted border-[#8A9A85] cursor-help"
                title="Based on GPT-5 class pricing (~$1.25/1M input, ~$10/1M output). 10 tokens in + 10 tokens out per second × 20 hrs/day × 365 days ≈ 631M tokens/year. At ~$5.60/1M tokens (50/50 mix) ≈ $3,500/year. Could be lower with caching or cheaper model variants."
              >
                ~$3,500/year
              </span>
            </td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30 bg-[#E8E5DE]">
            <td className="py-3 px-4 text-sm font-semibold text-[#2A3C24]">Total annual cost</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] text-right">—</td>
            <td className="py-3 px-4 text-sm font-semibold text-[#2A3C24] text-right">~$7,100-8,100/year</td>
          </tr>
          <tr className="bg-[#2A3C24]">
            <td className="py-3 px-4 text-sm font-semibold text-[#F5F2EB]">Hourly cost</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] text-right">—</td>
            <td className="py-3 px-4 text-sm font-semibold text-[#FBD45B] text-right">$1.00-1.15/hr</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// EV vs Humanoid Table
export function EVvsHumanoidTable() {
  return (
    <div className="w-full overflow-x-auto my-6">
      <table className="w-full border-collapse" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Factor</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">EVs (2014)</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Humanoids (2025)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Battery supply</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Build gigafactories from scratch</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">Already exists (EV supply chain)</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Battery cost/unit</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">$15,000+ (60-100 kWh)</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">$150-400 (1-3 kWh)</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Motor supply</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Build from scratch</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">Already exists (drones, EVs)</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Parts count</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">10,000+</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">~3,000</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Crash safety</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Heavy regulation</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold">Minimal requirements</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Forecasts Table
export function ForecastsTable() {
  return (
    <div className="w-full overflow-x-auto my-6">
      <table className="w-full border-collapse" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Source</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Forecast</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Goldman Sachs (Feb 2024)</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24]">250,000/year by 2030</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">40% annual cost declines</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Bank of America (Apr 2025)</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24]">18K (2025) → ~1M (2030-35)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">BOM: $35K → $13-17K</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Morgan Stanley</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24]">1B installed by 2050</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">$5T market</td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-[#8A9A85] mt-2 text-center italic" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        Goldman's 250K implies ~69% CAGR — almost exactly China's EV growth rate (2014-2019)
      </p>
    </div>
  );
}
