import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Data Pyramid Visualization - Clean stacked design
export function DataPyramid() {
  const layers = [
    {
      name: 'CALIBRATION',
      data: 'Robot demonstrations',
      scale: 'Millions of tokens',
      learns: 'Specific embodiment',
      color: '#FBD45B',
      textColor: '#2A3C24',
      width: '40%'
    },
    {
      name: 'ALIGNMENT',
      data: 'Egocentric human video',
      scale: 'Billions of tokens',
      learns: 'Humanoid manipulation',
      color: '#3D5235',
      textColor: '#F5F2EB',
      width: '70%'
    },
    {
      name: 'FOUNDATION',
      data: 'YouTube-scale video',
      scale: 'Trillions of tokens',
      learns: 'Physics, objects, causality',
      color: '#2A3C24',
      textColor: '#F5F2EB',
      width: '100%'
    }
  ];

  return (
    <div className="w-full py-6">
      <div className="flex flex-col items-center gap-1 max-w-md mx-auto">
        {layers.map((layer, i) => (
          <div
            key={i}
            className="relative py-3 px-4 text-center transition-all duration-200 hover:scale-[1.02]"
            style={{
              width: layer.width,
              backgroundColor: layer.color,
              borderRadius: i === 0 ? '0.5rem 0.5rem 0 0' : i === layers.length - 1 ? '0 0 0.5rem 0.5rem' : '0',
              clipPath: i === 0 ? 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' :
                       i === layers.length - 1 ? 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)' :
                       'polygon(0% 0%, 100% 0%, 105% 100%, -5% 100%)'
            }}
          >
            <div className="font-semibold text-xs tracking-wider mb-1" style={{ color: layer.textColor, fontFamily: 'Inter, sans-serif' }}>
              {layer.name}
            </div>
            <div className="text-xs opacity-90" style={{ color: layer.textColor, fontFamily: 'Crimson Pro, Georgia, serif' }}>
              {layer.data}
            </div>
            <div className="text-[10px] opacity-70 mt-0.5" style={{ color: layer.textColor, fontFamily: 'Crimson Pro, Georgia, serif' }}>
              {layer.scale} → {layer.learns}
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
              <td className="py-3 px-4 text-sm font-mono text-[#8A9A85]">{row.params}</td>
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
            className="p-4 rounded-lg border-2 bg-[#F5F2EB]/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:bg-[#F5F2EB] cursor-default group"
            style={{ borderColor: c.color }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[#2A3C24] group-hover:text-[#1A1A1A] transition-colors" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {c.name}
              </h4>
              <span
                className="text-xs font-bold px-2 py-1 rounded transition-transform group-hover:scale-110"
                style={{ background: c.color, color: c.color === '#FBD45B' ? '#2A3C24' : '#F5F2EB' }}
              >
                {c.decline}
              </span>
            </div>
            <div className="space-y-1 text-sm" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
              <div className="flex justify-between">
                <span className="text-[#8A9A85]">Then:</span>
                <span className="text-[#8A9A85] font-mono text-xs group-hover:line-through group-hover:opacity-60 transition-all">{c.then}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9A85] group-hover:text-[#2A3C24] group-hover:font-semibold transition-all">Now:</span>
                <span className="text-[#2A3C24] font-mono text-xs font-semibold group-hover:text-[#1A1A1A] group-hover:bg-[#FBD45B]/30 group-hover:px-1 group-hover:rounded transition-all">{c.now}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9A85]">Future:</span>
                <span className="text-[#8A9A85] font-mono text-xs group-hover:text-[#3D5235] transition-colors">{c.future}</span>
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
      tooltip: 'EV battery sales. Sources: CBS policy brief (2014), Gasgoo/CAPBIIA (2024)'
    },
    {
      industry: 'EVs',
      start: '78K units',
      end: '12.9M units',
      period: '2014→2024',
      multiplier: 164,
      tooltip: 'NEV annual production. Source: CAAM'
    },
    {
      industry: 'Solar PV',
      start: '28 GW',
      end: '887 GW',
      period: '2014→2024',
      multiplier: 32,
      tooltip: 'Cumulative installed capacity. Sources: Reuters (2015), pv magazine (2025)'
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
                className="font-bold text-[#2A3C24] w-32 text-sm cursor-help border-b border-dashed border-[#8A9A85]"
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
              <span className="ml-auto text-[#8A9A85]">{d.period}</span>
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
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Platform Model */}
        <div className="space-y-4">
          <h4 className="text-center font-bold text-[#2A3C24] pb-2 border-b-2 border-[#2A3C24]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            PLATFORM MODEL
          </h4>
          <div className="bg-[#2A3C24] text-[#F5F2EB] p-4 rounded-lg text-center">
            <p className="font-semibold mb-1">Cloud AI Provider</p>
            <p className="text-xs text-[#8A9A85]">Google, OpenAI, Anthropic</p>
            <p className="text-[#FBD45B] text-sm mt-2 font-semibold">Captures value via API fees</p>
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
            <p className="text-[#2A3C24] text-sm mt-3 font-semibold">Captures via integration</p>
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
            <td className="py-3 px-4 text-sm text-[#2A3C24]">
              <span className="cursor-help border-b border-dashed border-[#8A9A85]" title="Estimated: 20 tokens/sec × 31.5M sec/year ≈ 630M tokens/year. At GPT-5-class rates (~$5.63/1M tokens avg), ≈ $3,500/year">
                Cloud inference
              </span>
            </td>
            <td className="py-3 px-4 text-sm text-[#8A9A85] font-mono">—</td>
            <td className="py-3 px-4 text-sm font-mono text-[#2A3C24] bg-[#E8E5DE]">~$3,500/year</td>
          </tr>
          <tr className="border-b-2 border-[#2A3C24] bg-[#E8E5DE]">
            <td className="py-3 px-4 text-sm font-bold text-[#2A3C24]">Total annual cost</td>
            <td className="py-3 px-4 text-sm font-bold font-mono text-[#2A3C24]">~$9,000-10,500</td>
            <td className="py-3 px-4 text-sm font-bold font-mono text-[#2A3C24] bg-[#FBD45B]/30">~$7,100-8,100</td>
          </tr>
          <tr className="bg-[#2A3C24] text-[#F5F2EB]">
            <td className="py-3 px-4 text-sm font-bold">Hourly cost (7,000 hrs/year)</td>
            <td className="py-3 px-4 text-sm font-bold font-mono">$1.30-1.50/hr</td>
            <td className="py-3 px-4 text-sm font-bold font-mono text-[#FBD45B]">$1.00-1.15/hr</td>
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
