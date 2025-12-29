
import React from 'react';
import { Metric } from '../types';

interface KPICardProps {
  metric: Metric;
  onAction?: (metric: Metric) => void;
}

export const KPICard: React.FC<KPICardProps> = ({ metric, onAction }) => {
  const statusColor = metric.status === 'good' ? 'text-green-600' : metric.status === 'warning' ? 'text-amber-600' : 'text-red-600';
  const delta = `${metric.trend > 0 ? '+' : ''}${metric.trend}%`;

  return (
    <div 
      className="bg-white shadow-md rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onAction?.(metric)}
    >
      <div className="text-sm text-gray-500">{metric.label}</div>
      <div className="mt-2 text-2xl font-semibold flex items-baseline gap-1">
        {metric.value} 
        <span className="text-sm font-normal text-gray-400">{metric.unit}</span>
      </div>
      <div className={`mt-1 text-sm ${statusColor}`}>{delta}</div>
    </div>
  );
};
