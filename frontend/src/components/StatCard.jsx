import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const colorMap = {
  blue: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    value: 'text-blue-600',
    topBorder: 'border-t-blue-500',
  },
  emerald: {
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    value: 'text-emerald-600',
    topBorder: 'border-t-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    value: 'text-amber-600',
    topBorder: 'border-t-amber-500',
  },
  red: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    value: 'text-red-600',
    topBorder: 'border-t-red-500',
  },
  indigo: {
    iconBg: 'bg-brand-100',
    iconText: 'text-brand-600',
    value: 'text-brand-600',
    topBorder: 'border-t-brand-500',
  },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  onClick,
  clickable = false,
  trend,
  loading = false,
  id,
}) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`stat-card border-t-4 ${colors.topBorder} hover:shadow-card-md transition-all duration-300 animate-slide-up
        ${clickable ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          {loading ? (
            <div className="h-8 bg-surface-200 rounded animate-pulse w-20" />
          ) : (
            <p className={`text-3xl font-bold ${colors.value} leading-none`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
          {clickable && (
            <p className="text-xs text-brand-600 mt-2 font-medium">Click for breakdown →</p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.iconBg} shrink-0 ml-3`}>
            <Icon className={`w-5 h-5 ${colors.iconText}`} />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-surface-100">
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3 h-3 text-red-500" />
          ) : (
            <Minus className="w-3 h-3 text-slate-400" />
          )}
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-slate-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
