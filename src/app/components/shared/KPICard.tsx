import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
}

export function KPICard({ title, value, change, trend, icon: Icon, onClick, active = false }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-[#00E676]' : 'text-red-400';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'interactive-element interactive-glow w-full text-left rounded-xl p-6 backdrop-blur-sm border transition-all',
        active ? 'border-[#00E676]/80 bg-[#071a1a] ring-1 ring-[#00E676]/30 shadow-[0_0_24px_rgba(0,230,118,0.12)]' : 'border-white/10 bg-white/5 hover:border-[#00E676]/40 hover:bg-white/[0.07]',
        onClick ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#00E676]/20 rounded-lg flex items-center justify-center shadow-inner shadow-[#00E676]/10">
          <Icon className="w-6 h-6 text-[#00E676]" />
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
    </button>
  );
}