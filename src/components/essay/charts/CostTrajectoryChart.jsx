import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { unitreeTrajectory } from '../../../data/essays/gpt7-arms-data';

export default function CostTrajectoryChart() {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-[#2A3C24] rounded-lg p-4 shadow-lg">
          <p className="font-bold text-[#1A1A1A] mb-2">{data.model} ({data.month} {data.year})</p>
          <p className="text-2xl font-bold text-[#2A3C24]">${data.price.toLocaleString()}</p>
          {data.reduction && (
            <p className="text-sm text-[#8A9A85] mt-1">↓ {data.reduction} from previous</p>
          )}
          <p className="text-xs text-gray-600 mt-2 italic">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis with $ and K
  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="max-w-4xl mx-auto my-16">
      <div className="bg-[#F5F2EB] border-2 border-[#2A3C24]/20 rounded-xl p-8 shadow-sm">
        <div className="mb-8">
          <h3 className="text-3xl font-bold serif text-[#1A1A1A] mb-3">
            The Unitree Trajectory
          </h3>
          <p className="text-lg text-gray-600 reading-font">
            93% price reduction in under two years — faster than Moore's Law
          </p>
        </div>

        <ResponsiveContainer width="100%" height={450}>
          <LineChart
            data={unitreeTrajectory}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#8A9A85"
              opacity={0.2}
            />
            <XAxis
              dataKey="year"
              stroke="#1A1A1A"
              style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 }}
              label={{
                value: 'Year',
                position: 'insideBottom',
                offset: -10,
                style: { fontFamily: 'Inter', fontSize: '12px', fill: '#666' }
              }}
            />
            <YAxis
              scale="log"
              domain={[5000, 100000]}
              ticks={[5000, 10000, 20000, 40000, 80000]}
              tickFormatter={formatYAxis}
              stroke="#1A1A1A"
              style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 }}
              label={{
                value: 'Price (USD, log scale)',
                angle: -90,
                position: 'insideLeft',
                style: { fontFamily: 'Inter', fontSize: '12px', fill: '#666' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2A3C24"
              strokeWidth={3}
              dot={false}
              animationDuration={1500}
            />

            {/* Highlight points */}
            {unitreeTrajectory.map((point, idx) => (
              <ReferenceDot
                key={idx}
                x={point.year}
                y={point.price}
                r={8}
                fill="#FBD45B"
                stroke="#2A3C24"
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Model labels below chart */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#2A3C24]/10">
          {unitreeTrajectory.map((model, idx) => (
            <div key={idx} className="text-center">
              <div className="w-4 h-4 rounded-full bg-[#FBD45B] border-2 border-[#2A3C24] mx-auto mb-2"></div>
              <p className="font-bold text-[#2A3C24] font-mono text-sm">{model.model}</p>
              <p className="text-xs text-gray-600 mt-1">{model.month} {model.year}</p>
              <p className="text-lg font-bold text-[#1A1A1A] mt-1">${model.price.toLocaleString()}</p>
              {model.reduction && (
                <p className="text-xs text-[#8A9A85] font-medium mt-1">
                  {model.reduction} drop
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-6 italic reading-font text-center">
          Source: Unitree Robotics product releases (2023-2025). Logarithmic scale shows exponential cost decline.
        </p>
      </div>
    </div>
  );
}
