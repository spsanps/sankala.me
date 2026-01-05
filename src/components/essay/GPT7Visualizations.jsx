import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Data Pyramid Visualization
export function DataPyramid() {
  return (
    <div className="w-full py-8">
      <svg viewBox="0 0 500 320" className="w-full max-w-lg mx-auto">
        {/* Pyramid layers */}
        {/* Base - Foundation */}
        <polygon
          points="250,30 450,280 50,280"
          fill="none"
          stroke="#8A9A85"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Foundation layer (bottom) */}
        <polygon
          points="120,200 380,200 450,280 50,280"
          fill="#2A3C24"
        />
        <text x="250" y="248" textAnchor="middle" fill="#F5F2EB" fontSize="14" fontWeight="600">
          FOUNDATION
        </text>
        <text x="250" y="268" textAnchor="middle" fill="#8A9A85" fontSize="10">
          YouTube-scale video • Trillions of tokens
        </text>

        {/* Alignment layer (middle) */}
        <polygon
          points="160,130 340,130 380,200 120,200"
          fill="#3D5235"
        />
        <text x="250" y="165" textAnchor="middle" fill="#F5F2EB" fontSize="13" fontWeight="600">
          ALIGNMENT
        </text>
        <text x="250" y="183" textAnchor="middle" fill="#B5C4B0" fontSize="9">
          Egocentric human video • Billions of tokens
        </text>

        {/* Calibration layer (top) */}
        <polygon
          points="210,60 290,60 340,130 160,130"
          fill="#FBD45B"
        />
        <text x="250" y="90" textAnchor="middle" fill="#2A3C24" fontSize="11" fontWeight="600">
          CALIBRATION
        </text>
        <text x="250" y="106" textAnchor="middle" fill="#4A5D42" fontSize="8">
          Robot demos • Millions
        </text>

        {/* Labels on right */}
        <text x="460" y="248" textAnchor="start" fill="#8A9A85" fontSize="10">
          Physics, objects, causality
        </text>
        <text x="395" y="165" textAnchor="start" fill="#8A9A85" fontSize="10">
          Humanoid manipulation
        </text>
        <text x="340" y="95" textAnchor="start" fill="#8A9A85" fontSize="10">
          Specific embodiment
        </text>

        {/* Connecting lines */}
        <line x1="450" y1="248" x2="455" y2="248" stroke="#8A9A85" strokeWidth="1" />
        <line x1="380" y1="165" x2="390" y2="165" stroke="#8A9A85" strokeWidth="1" />
        <line x1="325" y1="95" x2="335" y2="95" stroke="#8A9A85" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Model Scale Comparison Table
export function ModelScaleTable() {
  const data = [
    { model: 'Sora-class (2024)', params: '~3-10B (estimated)', era: 'GPT-2', current: false },
    { model: 'Current VLAs', params: '7-12B', era: 'GPT-2/3', current: false },
    { model: 'Frontier LLMs', params: '100B+', era: 'GPT-4/5', current: false },
    { model: 'Unified multimodal (2026-27?)', params: '1T+', era: 'The frontier moves here', current: true },
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
              <td className="py-3 px-4 text-sm font-mono text-[#8A9A85]">{row.params}</td>
              <td className={`py-3 px-4 text-sm ${row.current ? 'font-semibold text-[#2A3C24]' : 'text-[#8A9A85]'}`}>
                {row.current && <span className="mr-2">←</span>}
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
        <text x="150" y="60" textAnchor="middle" fill="#2A3C24" fontSize="14" fontWeight="700">BRAIN (4-5 Hz)</text>
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
        <text x="450" y="60" textAnchor="middle" fill="#2A3C24" fontSize="14" fontWeight="700">SPINAL CORD (200 Hz)</text>
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
    <div className="w-full h-72 my-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8A9A85" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#8A9A85' }}
            axisLine={{ stroke: '#8A9A85', opacity: 0.5 }}
          />
          <YAxis
            scale="log"
            domain={[5000, 100000]}
            tick={{ fontSize: 12, fill: '#8A9A85' }}
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
      <div className="text-center mt-2">
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
      now: '$500-1,000 (2024)',
      future: '<$200',
      decline: '99%',
      color: '#2A3C24'
    },
    {
      name: 'Batteries',
      then: '$1,100/kWh (2010)',
      now: '$115/kWh (2024)',
      future: '$80-100/kWh',
      decline: '90%',
      color: '#3D5235'
    },
    {
      name: 'IMUs',
      then: 'Thousands (2010)',
      now: '$1-10 (2024)',
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
  const data = [
    { industry: 'EVs', start: '78K (2014)', end: '12.4M (2024)', multiplier: 160, years: 10, cagr: '66%' },
    { industry: 'Solar PV', start: '3 GW (2011)', end: '880 GW (2024)', multiplier: 290, years: 13, cagr: '25%' },
    { industry: 'Batteries', start: 'Minimal (2015)', end: '80%+ share', multiplier: null, years: '<10', cagr: '—' },
  ];

  return (
    <div className="w-full my-8">
      <div className="space-y-4">
        {data.map((d, i) => (
          <div key={i} className="relative">
            <div className="flex items-center gap-4 mb-2">
              <span className="font-bold text-[#2A3C24] w-24" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {d.industry}
              </span>
              <div className="flex-1 h-10 bg-[#E8E5DE] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#2A3C24] rounded-full flex items-center justify-end pr-4"
                  style={{ width: d.multiplier ? `${Math.min(100, d.multiplier / 3)}%` : '60%' }}
                >
                  {d.multiplier && (
                    <span className="text-[#F5F2EB] font-bold text-lg">{d.multiplier}x</span>
                  )}
                  {!d.multiplier && (
                    <span className="text-[#F5F2EB] font-bold text-sm">80%+ share</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#8A9A85] ml-28" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
              <span>{d.start}</span>
              <span>→</span>
              <span>{d.end}</span>
              <span className="ml-auto font-mono">CAGR: {d.cagr}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-[#8A9A85] mt-6 italic" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        When China designates an industry as strategic, the scaling is dramatic
      </p>
    </div>
  );
}

// Value Capture Diagram
export function ValueCaptureDiagram() {
  return (
    <div className="w-full py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Platform Model */}
        <div className="space-y-4">
          <h4 className="text-center font-bold text-[#2A3C24] pb-2 border-b-2 border-[#2A3C24]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            PLATFORM MODEL
          </h4>
          <div className="bg-[#2A3C24] text-[#F5F2EB] p-4 rounded-lg text-center">
            <p className="font-semibold mb-1">Cloud AI Provider</p>
            <p className="text-xs text-[#8A9A85]">Google, OpenAI, Anthropic</p>
            <p className="text-[#FBD45B] text-sm mt-2 font-semibold">← Captures value via API fees</p>
          </div>
          <div className="text-center text-2xl text-[#8A9A85]">↓</div>
          <div className="bg-[#E8E5DE] text-[#8A9A85] p-4 rounded-lg text-center border-2 border-dashed border-[#8A9A85]/50">
            <p className="font-semibold mb-1 text-[#2A3C24]">Hardware OEMs</p>
            <p className="text-xs">Unitree, Boston Dynamics, etc.</p>
            <p className="text-[#8A6A4A] text-sm mt-2">Compete on cost, thin margins</p>
          </div>
        </div>

        {/* Integration Model */}
        <div className="space-y-4">
          <h4 className="text-center font-bold text-[#2A3C24] pb-2 border-b-2 border-[#FBD45B]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            INTEGRATION MODEL
          </h4>
          <div className="bg-[#FBD45B] text-[#2A3C24] p-6 rounded-lg text-center">
            <p className="font-bold mb-1 text-lg">Full-Stack Company</p>
            <p className="text-sm mb-2">Hardware + AI Brain</p>
            <p className="text-xs text-[#4A5D42]">Tesla, Figure AI</p>
            <p className="text-[#2A3C24] text-sm mt-3 font-semibold">← Captures via integration</p>
          </div>
        </div>
      </div>

      {/* Losing position */}
      <div className="max-w-xl mx-auto mt-8 p-4 bg-[#E8E5DE] border border-[#8A6A4A]/30 rounded-lg text-center">
        <p className="text-[#8A6A4A] font-semibold" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>LOSING POSITION</p>
        <p className="text-[#8A6A4A]/80 text-sm mt-1" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
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
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8A9A85]">Cloud Gaming</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#FBD45B] bg-[#2A3C24]">Cloud Robotics</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Update rate</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">60Hz frame rate</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold bg-[#E8E5DE]">5-10Hz control rate</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Latency sensitivity</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Critical: competitive PvP</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold bg-[#E8E5DE]">Tolerant: pick up box</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Failure mode</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Lose match</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] font-semibold bg-[#E8E5DE]">Robot pauses</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Robot Economics Table
export function RobotEconomicsTable() {
  return (
    <div className="w-full overflow-x-auto my-6">
      <table className="w-full border-collapse" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
        <thead>
          <tr className="border-b-2 border-[#2A3C24]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#2A3C24]">Cost Component</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8A9A85]">Current (~$16K robot)</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#FBD45B] bg-[#2A3C24]">Projected (~$6K robot)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Hardware (3yr depreciation)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] font-mono">$5,333/year</td>
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24] bg-[#E8E5DE]">$2,000/year</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Maintenance (~15%/year)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] font-mono">$2,400/year</td>
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24] bg-[#E8E5DE]">$900/year</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Electricity (~500W, 20hr/day)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] font-mono">~$700/year</td>
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24] bg-[#E8E5DE]">~$700/year</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm text-[#2A3C24]">Cloud inference (estimated)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] font-mono">~$500-2,000/year</td>
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24] bg-[#E8E5DE]">~$300-1,000/year</td>
          </tr>
          <tr className="border-b-2 border-[#2A3C24] bg-[#E8E5DE]">
            <td className="py-3 px-4 text-sm font-bold text-[#2A3C24]">Total annual cost</td>
            <td className="py-3 px-4 text-sm font-bold font-mono text-[#2A3C24]">~$9,000-10,500</td>
            <td className="py-3 px-4 text-sm font-bold font-mono text-[#2A3C24] bg-[#FBD45B]/30">~$4,000-4,600</td>
          </tr>
          <tr className="bg-[#2A3C24] text-[#F5F2EB]">
            <td className="py-3 px-4 text-sm font-bold">Hourly cost (7,000 hrs/year)</td>
            <td className="py-3 px-4 text-sm font-bold font-mono">$1.30-1.50/hr</td>
            <td className="py-3 px-4 text-sm font-bold font-mono text-[#FBD45B]">$0.55-0.65/hr</td>
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
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8A9A85]">EVs (2014)</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#FBD45B] bg-[#2A3C24]">Humanoids (2025)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Battery supply</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Build gigafactories from scratch</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] bg-[#E8E5DE] font-semibold">Already exists (EV supply chain)</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Battery cost/unit</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">$15,000+ (60-100 kWh)</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] bg-[#E8E5DE] font-semibold">$150-400 (1-3 kWh)</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Motor supply</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Build from scratch</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] bg-[#E8E5DE] font-semibold">Already exists (drones, EVs)</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Parts count</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">10,000+</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] bg-[#E8E5DE] font-semibold">~3,000</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Crash safety</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">Heavy regulation</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] bg-[#E8E5DE] font-semibold">Minimal requirements</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Assembly time</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">20-30 hours</td>
            <td className="py-3 px-4 text-sm text-[#2A3C24] bg-[#E8E5DE] font-semibold">5-10 hours</td>
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
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24]">250,000/year by 2030</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">40% annual cost declines</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Bank of America (Apr 2025)</td>
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24]">18K (2025) → ~1M (2030-35)</td>
            <td className="py-3 px-4 text-sm text-[#8A9A85]">BOM: $35K → $13-17K</td>
          </tr>
          <tr className="border-b border-[#8A9A85]/30">
            <td className="py-3 px-4 text-sm font-medium text-[#2A3C24]">Morgan Stanley</td>
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24]">1B installed by 2050</td>
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
