import React from 'react';
import { Users, Award, Shield, CalendarDays, TrendingUp, Sparkles } from 'lucide-react';
import { StatItem } from '@/types/dashboard';

interface StatCardProps {
  item: StatItem;
}

export function StatCard({ item }: StatCardProps) {
  const getIcon = (name: StatItem['iconName']) => {
    switch (name) {
      case 'users':
        return <Users className="h-6 w-6 text-blue-600" />;
      case 'coaches':
        return <Award className="h-6 w-6 text-sky-500" />;
      case 'classes':
        return <Shield className="h-6 w-6 text-purple-500" />;
      case 'schedule':
        return <CalendarDays className="h-6 w-6 text-teal-500" />;
      default:
        return <Sparkles className="h-6 w-6 text-blue-600" />;
    }
  };

  const getIconBg = (name: StatItem['iconName']) => {
    switch (name) {
      case 'users':
        return 'bg-gray-50 ring-gray-200';
      case 'coaches':
        return 'bg-sky-50 ring-sky-100';
      case 'classes':
        return 'bg-purple-50 ring-purple-100';
      case 'schedule':
        return 'bg-teal-50 ring-teal-100';
      default:
        return 'bg-gray-50 ring-gray-200';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/95 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
      {/* Pastel accent bar on top hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white    opacity-90 transition-all duration-300 group-hover:h-1.5" />

      {/* Background subtle watermark icon */}
      <div className="pointer-events-none absolute -right-3 -bottom-3 opacity-5 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-10 text-gray-400">
        {getIcon(item.iconName)}
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {item.title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-800 font-sans">
              {item.value}
            </span>
            {item.unit && (
              <span className="text-xs font-medium text-slate-500">
                {item.unit}
              </span>
            )}
          </div>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105 ${getIconBg(item.iconName)}`}>
          {getIcon(item.iconName)}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              item.isPositive
                ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            {item.change}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate max-w-[170px]" title={item.description}>
          {item.description}
        </p>
      </div>
    </div>
  );
}
