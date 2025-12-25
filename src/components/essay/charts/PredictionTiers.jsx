import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Cpu, DollarSign, Globe } from 'lucide-react';
import { yearByYearPredictions, volumeComparison } from '../../../data/essays/gpt7-arms-data';

export default function PredictionTiers() {
  const [expandedYears, setExpandedYears] = useState([2026, 2027]); // First two years expanded by default

  const toggleYear = (year) => {
    if (expandedYears.includes(year)) {
      setExpandedYears(expandedYears.filter(y => y !== year));
    } else {
      setExpandedYears([...expandedYears, year]);
    }
  };

  // Icon mapping for different categories
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'capabilities': return <Cpu size={16} className="text-[#2A3C24]" />;
      case 'deployment': return <TrendingUp size={16} className="text-[#2A3C24]" />;
      case 'hardware': return <DollarSign size={16} className="text-[#8A9A85]" />;
      case 'policy': case 'geopolitical': return <Globe size={16} className="text-[#8A9A85]" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-16">
      <div className="mb-12">
        <h3 className="text-4xl md:text-5xl font-bold serif text-[#1A1A1A] mb-4">
          Year-by-Year Predictions
        </h3>
        <p className="text-lg text-gray-600 reading-font mb-6">
          Concrete forecasts from 2026-2030 with specific volume numbers and capability milestones.
        </p>
        <div className="bg-[#FBD45B]/10 border-l-4 border-[#FBD45B] p-4 rounded">
          <p className="text-sm text-[#1A1A1A] font-medium">
            Written December 2025. Predictions for "end of 2026" are approximately 12 months out. Click each year to expand details.
          </p>
        </div>
      </div>

      {/* Year-by-year accordion */}
      <div className="space-y-4 mb-12">
        {yearByYearPredictions.map((yearData) => {
          const isExpanded = expandedYears.includes(yearData.year);
          const isPast = yearData.year < 2026;
          const isSoon = yearData.year <= 2027;

          return (
            <div
              key={yearData.year}
              className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                isSoon ? 'border-[#2A3C24]' : 'border-[#8A9A85]'
              } ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
            >
              {/* Year Header */}
              <button
                onClick={() => toggleYear(yearData.year)}
                className={`w-full p-6 flex items-center justify-between transition-colors ${
                  isSoon
                    ? 'bg-[#2A3C24] text-[#F5F2EB]'
                    : 'bg-[#8A9A85] text-[#F5F2EB]'
                } hover:opacity-90`}
              >
                <div className="flex items-center gap-6">
                  <span className="text-5xl font-bold font-mono">{yearData.year}</span>
                  <div className="h-12 w-px bg-current opacity-30"></div>
                  <div className="text-left">
                    <h4 className="text-2xl font-bold serif mb-1">{yearData.title}</h4>
                    <p className="text-sm opacity-90">
                      {yearData.volume.range} units globally
                      {yearData.volume.vsGoldman && (
                        <span className="ml-2 text-xs opacity-75">(vs. Goldman: {yearData.volume.vsGoldman})</span>
                      )}
                    </p>
                  </div>
                </div>

                {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
              </button>

              {/* Year Details */}
              <div
                className={`transition-all duration-300 ${
                  isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
                style={{ overflow: 'hidden' }}
              >
                <div className="bg-white p-8 space-y-6">
                  {/* Volume info */}
                  <div className="pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={18} className="text-[#2A3C24]" />
                      <h5 className="font-bold text-lg">Volume</h5>
                    </div>
                    <p className="text-3xl font-bold text-[#2A3C24] mb-2">{yearData.volume.range}</p>
                    <p className="text-sm text-gray-600 italic">{yearData.volume.description}</p>
                  </div>

                  {/* Capabilities */}
                  {yearData.capabilities && yearData.capabilities.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {getCategoryIcon('capabilities')}
                        <h5 className="font-bold text-lg">Capability Milestones</h5>
                      </div>
                      <div className="space-y-3">
                        {yearData.capabilities.map((cap, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-[#F5F2EB] rounded-lg">
                            <div className="flex-shrink-0 w-16 px-2 py-1 bg-[#2A3C24] text-white rounded text-xs font-mono text-center">
                              {cap.confidence}
                            </div>
                            <p className="flex-1 text-sm reading-font pt-0.5">{cap.prediction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hardware */}
                  {yearData.hardware && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryIcon('hardware')}
                        <h5 className="font-bold text-lg">Hardware Economics</h5>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {yearData.hardware.avgCost && (
                          <div className="p-4 bg-[#F5F2EB] rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Average Cost</p>
                            <p className="text-2xl font-bold text-[#2A3C24]">{yearData.hardware.avgCost}</p>
                          </div>
                        )}
                        {yearData.hardware.chineseShare && (
                          <div className="p-4 bg-[#F5F2EB] rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Chinese Production</p>
                            <p className="text-xl font-bold text-[#2A3C24]">{yearData.hardware.chineseShare}</p>
                          </div>
                        )}
                        {yearData.hardware.margins && (
                          <div className="p-4 bg-[#F5F2EB] rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Hardware Margins</p>
                            <p className="text-xl font-bold text-[#2A3C24]">{yearData.hardware.margins}</p>
                          </div>
                        )}
                        {yearData.hardware.milestone && (
                          <div className="p-4 bg-[#F5F2EB] rounded-lg md:col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Milestone</p>
                            <p className="text-sm font-medium">{yearData.hardware.milestone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deployment */}
                  {yearData.deployment && Array.isArray(yearData.deployment) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {getCategoryIcon('deployment')}
                        <h5 className="font-bold text-lg">Deployment Targets</h5>
                      </div>
                      <div className="space-y-2">
                        {yearData.deployment.map((dep, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-[#F5F2EB] rounded-lg">
                            <div className="flex-shrink-0 w-16 px-2 py-1 bg-[#8A9A85] text-white rounded text-xs font-mono text-center">
                              {dep.confidence}
                            </div>
                            <p className="flex-1 text-sm reading-font pt-0.5">{dep.prediction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Policy & Geopolitical */}
                  {(yearData.policy || yearData.geopolitical) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {getCategoryIcon('policy')}
                        <h5 className="font-bold text-lg">
                          {yearData.policy ? 'Policy' : 'Geopolitical'}
                        </h5>
                      </div>
                      <div className="space-y-2">
                        {(yearData.policy || yearData.geopolitical || []).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-[#F5F2EB] rounded-lg">
                            <div className="flex-shrink-0 w-16 px-2 py-1 bg-[#8A9A85] text-white rounded text-xs font-mono text-center">
                              {item.confidence}
                            </div>
                            <p className="flex-1 text-sm reading-font pt-0.5">{item.prediction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Market Structure (2030 only) */}
                  {yearData.marketStructure && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Globe size={18} className="text-[#2A3C24]" />
                        <h5 className="font-bold text-lg">Market Structure</h5>
                      </div>
                      <div className="space-y-2">
                        {yearData.marketStructure.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-[#F5F2EB] rounded-lg">
                            <div className="flex-shrink-0 w-16 px-2 py-1 bg-[#2A3C24] text-white rounded text-xs font-mono text-center">
                              {item.confidence}
                            </div>
                            <p className="flex-1 text-sm reading-font pt-0.5">{item.prediction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Volume Comparison Table */}
      <div className="bg-white border-2 border-[#2A3C24]/20 rounded-xl p-8 shadow-sm">
        <h4 className="text-2xl font-bold serif text-[#1A1A1A] mb-6">
          Volume Test: My Forecasts vs. Goldman Sachs
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#2A3C24]">
                <th className="text-left py-3 px-4 font-bold">Year</th>
                <th className="text-right py-3 px-4 font-bold">Goldman Sachs</th>
                <th className="text-right py-3 px-4 font-bold">My Base Case</th>
                <th className="text-right py-3 px-4 font-bold">My Bull Case</th>
              </tr>
            </thead>
            <tbody>
              {volumeComparison.map((row) => (
                <tr key={row.year} className="border-b border-gray-200 hover:bg-[#F5F2EB] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold">{row.year}</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-600">
                    {row.goldman.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#2A3C24]">
                    {row.baseCase.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#FBD45B]">
                    {row.bullCase.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-[#F5F2EB] rounded-lg">
          <p className="text-sm text-gray-600 reading-font">
            <span className="font-bold text-[#1A1A1A]">Falsification thresholds:</span> If 2027 &lt; 50,000 units, I'm wrong and Goldman was right. If 2027 &gt; 150,000 units, exponential thesis validated. If 2030 &gt; 1,000,000 units, "China Speed" confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
