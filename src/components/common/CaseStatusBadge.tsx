import React from 'react';
import { CaseStatus } from '../../types';

interface CaseStatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export const CaseStatusBadge: React.FC<CaseStatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<CaseStatus, { bg: string; text: string; label: string }> = {
    NEW: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', label: 'New Report' },
    UNDER_REVIEW: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', label: 'Under Review' },
    VET_VISIT_REQUIRED: { bg: 'bg-amber-50 text-amber-800 border-amber-300', text: 'text-amber-800', label: 'Vet Visit Required' },
    SAMPLE_REQUESTED: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', label: 'Sample Requested' },
    SAMPLE_COLLECTED: { bg: 'bg-purple-100 text-purple-800 border-purple-300', text: 'text-purple-800', label: 'Sample Collected' },
    LAB_TESTING: { bg: 'bg-cyan-50 text-cyan-800 border-cyan-300 animate-pulse', text: 'text-cyan-800', label: 'In Lab Testing' },
    CONFIRMED: { bg: 'bg-rose-50 text-rose-800 border-rose-300 font-bold', text: 'text-rose-800', label: 'Confirmed Positive' },
    RULED_OUT: { bg: 'bg-slate-100 text-slate-700 border-slate-300', text: 'text-slate-700', label: 'Ruled Out (Negative)' },
    CONTAINMENT: { bg: 'bg-red-100 text-red-900 border-red-400 font-bold', text: 'text-red-900', label: 'Containment Zone' },
    RESOLVED: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-800', label: 'Resolved / Treated' }
  };

  const cfg = configs[status] || configs.NEW;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border shadow-2xs ${cfg.bg} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {cfg.label}
    </span>
  );
};
