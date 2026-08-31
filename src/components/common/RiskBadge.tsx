import React from 'react';
import { RiskLevel, Role } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { formatRiskLabel } from '../../utils/terminology';
import { store } from '../../services/store';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  role?: Role | string;
  showExplanation?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showIcon = true,
  role,
  showExplanation = true
}) => {
  const activeRole = role || store.getCurrentUser()?.role || 'FARMER';
  const label = formatRiskLabel(level, activeRole, showExplanation);

  const configs = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      icon: ShieldCheck
    },
    MODERATE: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      icon: AlertCircle
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
      icon: AlertTriangle
    },
    CRITICAL: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 animate-pulse',
      icon: ShieldAlert
    }
  };

  const cfg = configs[level] || configs.LOW;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs transition-all ${cfg.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
      {score !== undefined && (
        <span className="ml-1 opacity-80 border-l border-current pl-1.5">
          {score}/100
        </span>
      )}
    </span>
  );
};
