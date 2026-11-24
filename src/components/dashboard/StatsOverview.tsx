import React from 'react';
import { StatItem } from '@/types/dashboard';
import { StatCard } from './StatCard';

interface StatsOverviewProps {
  stats: StatItem[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <StatCard key={item.id} item={item} />
      ))}
    </div>
  );
}
