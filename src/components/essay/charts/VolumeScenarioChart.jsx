import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { volumeScenarios } from '../../../data/essays/gpt7-arms-data';

export default function VolumeScenarioChart() {
  // Transform data for recharts
  const chartData = [
    {
      year: '2025',
      'Linear (Goldman)': volumeScenarios[0]['2025'],
      'EV Analogy': volumeScenarios[1]['2025'],
      'Faster Than EV': volumeScenarios[2]['2025'],
      'Security Mobilization': volumeScenarios[3]['2025']
    },
    {
      year: '2027',
      'Linear (Goldman)': volumeScenarios[0]['2027'],
      'EV Analogy': volumeScenarios[1]['2027'],
      'Faster Than EV': volumeScenarios[2]['2027'],
      'Security Mobilization': volumeScenarios[3]['2027']
    },
    {
      year: '2030',
      'Linear (Goldman)': volumeScenarios[0]['2030'],
      'EV Analogy': volumeScenarios[1]['2030'],
      'Faster Than EV': volumeScenarios[2]['2030'],
      'Security Mobilization': volumeScenarios[3]['2030']
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-[#2A3C24] rounded-lg p-4 shadow-lg">
          <p className="font-bold text-[#1A1A1A] mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}:</span>
              <span className="text-sm font-bold">
                {entry.value.toLocaleString()} units
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  return (
    <div className="max-w-4xl mx-auto my-16">
      <div className="bg-[#F5F2EB] border-2 border-[#2A3C24]/20 rounded-xl p-8 shadow-sm">
        <div className="mb-8">
          <h3 className="text-3xl font-bold serif text-[#1A1A1A] mb-3">
            Four Volume Scenarios
          </h3>
          <p className="text-lg text-gray-600 reading-font">
            Projected humanoid robot deployments 2025-2030 under different assumptions
          </p>
        </div>

        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#8A9A85" opacity={0.2} />
            <XAxis
              dataKey="year"
              stroke="#1A1A1A"
              style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#1A1A1A"
              style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px', fontFamily: 'Inter', fontSize: '13px' }}
            />

            <Line
              type="monotone"
              dataKey="Linear (Goldman)"
              stroke="#8A9A85"
              strokeWidth={3}
              dot={{ r: 5 }}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="EV Analogy"
              stroke="#2A3C24"
              strokeWidth={3}
              dot={{ r: 5 }}
              animationDuration={1500}
              animationBegin={200}
            />
            <Line
              type="monotone"
              dataKey="Faster Than EV"
              stroke="#F0BE25"
              strokeWidth={3}
              dot={{ r: 5 }}
              animationDuration={1500}
              animationBegin={400}
            />
            <Line
              type="monotone"
              dataKey="Security Mobilization"
              stroke="#FBD45B"
              strokeWidth={3}
              dot={{ r: 5 }}
              animationDuration={1500}
              animationBegin={600}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Scenario assumptions */}
        <div className="grid md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#2A3C24]/10">
          {volumeScenarios.map((scenario, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-[#2A3C24]/10 hover:border-[#2A3C24]/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: scenario.color }}
                />
                <h4 className="font-bold text-[#1A1A1A] font-mono text-sm">
                  {scenario.scenario}
                </h4>
              </div>
              <p className="text-xs text-gray-600 italic">{scenario.assumption}</p>
              <div className="mt-2 flex gap-3 text-xs font-mono">
                <span className="text-gray-500">2030:</span>
                <span className="font-bold text-[#2A3C24]">
                  {scenario['2030'].toLocaleString()} units
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-6 italic reading-font text-center">
          Base case: 800K-2.2M units by 2030. Security mobilization scenario assumes strategic prioritization.
        </p>
      </div>
    </div>
  );
}
