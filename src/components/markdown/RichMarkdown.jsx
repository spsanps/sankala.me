import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CostTrajectoryChart from '../essay/charts/CostTrajectoryChart';
import VolumeScenarioChart from '../essay/charts/VolumeScenarioChart';
import TimelineConvergenceChart from '../essay/charts/TimelineConvergenceChart';
import PredictionTiers from '../essay/charts/PredictionTiers';

// Chart component mapping
const chartComponents = {
  CostTrajectory: CostTrajectoryChart,
  VolumeScenario: VolumeScenarioChart,
  TimelineConvergence: TimelineConvergenceChart,
  Predictions: PredictionTiers
};

export default function RichMarkdown({ content }) {
  // Split content by chart markers and inject components
  const processContent = () => {
    const parts = [];
    const markerRegex = /<!--\s*CHART:(\w+)\s*-->/g;
    let lastIndex = 0;
    let match;

    while ((match = markerRegex.exec(content)) !== null) {
      // Add markdown content before the marker
      if (match.index > lastIndex) {
        parts.push({
          type: 'markdown',
          content: content.slice(lastIndex, match.index),
          key: `md-${lastIndex}`
        });
      }

      // Add chart component
      const chartName = match[1];
      if (chartComponents[chartName]) {
        parts.push({
          type: 'chart',
          component: chartName,
          key: `chart-${match.index}`
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining markdown content
    if (lastIndex < content.length) {
      parts.push({
        type: 'markdown',
        content: content.slice(lastIndex),
        key: `md-${lastIndex}`
      });
    }

    return parts;
  };

  const parts = processContent();

  return (
    <div>
      {parts.map((part) => {
        if (part.type === 'markdown') {
          return (
            <div key={part.key} className="markdown-light">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {part.content}
              </ReactMarkdown>
            </div>
          );
        } else if (part.type === 'chart') {
          const ChartComponent = chartComponents[part.component];
          return <ChartComponent key={part.key} />;
        }
        return null;
      })}
    </div>
  );
}
