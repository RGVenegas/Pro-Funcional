import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
}

export function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-[#09C82C]' : 'text-red-400';

  return (
    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#09C82C]/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#09C82C]" />
        </div>
        {change && trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold mb-1 text-[#F7F7F7]">{value}</h3>
      <p className="text-white/60 text-sm">{title}</p>
    </div>
  );
}