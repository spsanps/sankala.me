import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { timelineConvergence } from '../../../data/essays/gpt7-arms-data';

export default function TimelineConvergenceChart() {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-[#2A3C24] rounded-lg p-4 shadow-lg max-w-xs">
          <p className="font-bold text-[#1A1A1A] mb-3">{label}</p>
          {payload.reverse().map((entry, index) => {
            // Convert metric name to readable label
            const labels = {
              modelCapability: 'Model Capability ↑',
              hardwareCost: 'Hardware Cost ↓',
              inferenceCost: 'Inference Cost ↓',
              dataEfficiency: 'Data Efficiency ↑',
              laborPressure: 'Labor Pressure ↑'
            };
            return (
              <div key={index} className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs">{labels[entry.dataKey]}</span>
                </div>
                <span className="text-xs font-bold">{(entry.value * 100).toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto my-16">
      <div className="bg-[#F5F2EB] border-2 border-[#2A3C24]/20 rounded-xl p-8 shadow-sm">
        <div className="mb-8">
          <h3 className="text-3xl font-bold serif text-[#1A1A1A] mb-3">
            The Convergence
          </h3>
          <p className="text-lg text-gray-600 reading-font mb-4">
            Five trend lines converging in 2025-2027: the window for humanoid robotics
          </p>
          <div className="bg-[#FBD45B]/10 border-l-4 border-[#FBD45B] p-4 rounded">
            <p className="text-sm text-[#1A1A1A] font-medium">
              This is the window. When capability, cost, demand, and support all align simultaneously.
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={450}>
          <AreaChart
            data={timelineConvergence}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorModel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2A3C24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2A3C24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHW" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8A9A85" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8A9A85" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBD45B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FBD45B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F0BE25" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F0BE25" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLabor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4716C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4716C" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#8A9A85" opacity={0.2} />

            <XAxis
              dataKey="year"
              stroke="#1A1A1A"
              style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 }}
            />

            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              stroke="#1A1A1A"
              style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '20px', fontFamily: 'Inter', fontSize: '12px' }}
              formatter={(value) => {
                const labels = {
                  modelCapability: 'Model Capability ↑',
                  hardwareCost: 'Hardware Cost ↓',
                  inferenceCost: 'Inference Cost ↓',
                  dataEfficiency: 'Data Efficiency ↑',
                  laborPressure: 'Labor Pressure ↑'
                };
                return labels[value] || value;
              }}
            />

            {/* Highlight the convergence window */}
            <ReferenceLine
              x={2025}
              stroke="#FBD45B"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'Window Opens', position: 'top', fill: '#666', fontSize: 11 }}
            />
            <ReferenceLine
              x={2027}
              stroke="#FBD45B"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'Peak Convergence', position: 'top', fill: '#666', fontSize: 11 }}
            />

            <Area
              type="monotone"
              dataKey="modelCapability"
              stroke="#2A3C24"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorModel)"
            />
            <Area
              type="monotone"
              dataKey="hardwareCost"
              stroke="#8A9A85"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHW)"
            />
            <Area
              type="monotone"
              dataKey="inferenceCost"
              stroke="#FBD45B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInf)"
            />
            <Area
              type="monotone"
              dataKey="dataEfficiency"
              stroke="#F0BE25"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorData)"
            />
            <Area
              type="monotone"
              dataKey="laborPressure"
              stroke="#D4716C"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLabor)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-8 pt-6 border-t border-[#2A3C24]/10">
          <p className="text-sm text-gray-600 reading-font leading-relaxed">
            <span className="font-bold text-[#1A1A1A]">Key insight:</span> All five trends reach critical thresholds simultaneously in 2025-2027. Model capability and data efficiency rising while hardware and inference costs falling, combined with urgent labor pressure, creates unprecedented conditions for deployment.
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-4 italic reading-font text-center">
          Normalized scales (0-1) for comparison. Data directional, based on industry trends and projections.
        </p>
      </div>
    </div>
  );
}
