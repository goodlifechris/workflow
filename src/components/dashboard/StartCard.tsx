// components/dashboard/StatCard.tsx
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, icon, trend = 'neutral' }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {value.toLocaleString()}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}