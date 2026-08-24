import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showIcon = true
}) => {
  const configs = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      pill: 'bg-emerald-500',
      label: 'LOW RISK',
      icon: ShieldCheck
    },
    MODERATE: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      pill: 'bg-amber-500',
      label: 'MODERATE RISK',
      icon: AlertCircle
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-800 border-orange-200',
      pill: 'bg-orange-500',
      label: 'HIGH RISK',
      icon: AlertTriangle
    },
    CRITICAL: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse',
      pill: 'bg-rose-600',
      label: 'CRITICAL RISK',
      icon: ShieldAlert
    }
  };

  const cfg = configs[level] || configs.LOW;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs transition-all ${cfg.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{cfg.label}</span>
      {score !== undefined && (
        <span className="ml-1 opacity-80 border-l border-current pl-1.5">
          {score}/100
        </span>
      )}
    </span>
  );
};
