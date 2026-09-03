import React from 'react';
import { CredibilityTier, VerificationState } from '../../types';
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, CheckCircle2, FlaskConical, Clock, XCircle } from 'lucide-react';

interface CredibilityBadgeProps {
  score?: number;
  tier?: CredibilityTier;
  verificationState?: VerificationState;
  isUrgent?: boolean;
  showVerificationState?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const CredibilityBadge: React.FC<CredibilityBadgeProps> = ({
  score = 75,
  tier,
  verificationState = 'NOT_REVIEWED',
  isUrgent = false,
  showVerificationState = true,
  size = 'md',
  onClick,
  className = ''
}) => {
  // Determine effective tier from score if not explicitly provided
  const effectiveTier: CredibilityTier =
    tier || (score >= 80 ? 'TRUSTED' : score >= 60 ? 'REVIEW' : 'LOW_CREDIBILITY');

  const tierStyles = {
    TRUSTED: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-300',
      barBg: 'bg-emerald-500',
      label: 'Trusted',
      icon: ShieldCheck
    },
    REVIEW: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-300',
      barBg: 'bg-amber-500',
      label: 'Needs Review',
      icon: Shield
    },
    LOW_CREDIBILITY: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-800 dark:text-rose-300',
      barBg: 'bg-rose-500',
      label: 'Low Credibility',
      icon: ShieldAlert
    }
  }[effectiveTier];

  const verificationConfig: Record<VerificationState, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
    NOT_REVIEWED: {
      label: 'Unverified',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      icon: Clock
    },
    FIELD_VERIFICATION_PENDING: {
      label: 'Field Visit Pending',
      bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700',
      text: 'text-amber-800 dark:text-amber-300',
      icon: Clock
    },
    FIELD_VERIFIED: {
      label: 'Field Verified',
      bg: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-300',
      icon: CheckCircle2
    },
    VET_REVIEW_PENDING: {
      label: 'Vet Review Pending',
      bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700',
      text: 'text-amber-800 dark:text-amber-300',
      icon: Clock
    },
    VET_VERIFIED: {
      label: 'Vet Verified',
      bg: 'bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700',
      text: 'text-teal-800 dark:text-teal-300',
      icon: CheckCircle2
    },
    LAB_CONFIRMATION_PENDING: {
      label: 'Lab Assay Pending',
      bg: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700',
      text: 'text-purple-800 dark:text-purple-300',
      icon: FlaskConical
    },
    LAB_CONFIRMED: {
      label: 'Lab Confirmed',
      bg: 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 font-bold',
      text: 'text-indigo-900 dark:text-indigo-200',
      icon: FlaskConical
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-100 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700',
      text: 'text-rose-900 dark:text-rose-200',
      icon: XCircle
    },
    DISMISSED: {
      label: 'Dismissed',
      bg: 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-700',
      text: 'text-slate-800 dark:text-slate-300',
      icon: XCircle
    }
  };

  const vConfig = verificationConfig[verificationState] || verificationConfig.NOT_REVIEWED;
  const VIcon = vConfig.icon;
  const TierIcon = tierStyles.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2.5'
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-wrap items-center gap-1.5 ${onClick ? 'cursor-pointer hover:opacity-90 active:scale-98 transition-transform' : ''} ${className}`}
      title={`Credibility Score: ${score}/100 (${tierStyles.label}) | State: ${vConfig.label}${isUrgent ? ' | URGENT VERIFICATION OVERRIDE ACTIVE' : ''}`}
    >
      {/* Score and Tier Pill */}
      <span
        className={`inline-flex items-center rounded-md border shadow-2xs font-medium ${tierStyles.bg} ${tierStyles.border} ${tierStyles.text} ${sizeStyles}`}
      >
        <TierIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="font-bold">{score}</span>
        <span className="opacity-60 text-[10px] uppercase tracking-wider font-semibold">
          {effectiveTier === 'LOW_CREDIBILITY' ? 'Low Cred' : tierStyles.label}
        </span>
      </span>

      {/* Verification State Badge */}
      {showVerificationState && (
        <span
          className={`inline-flex items-center rounded-md border text-[11px] font-medium px-2 py-0.5 gap-1 ${vConfig.bg} ${vConfig.text}`}
        >
          <VIcon className="w-3 h-3 shrink-0" />
          <span>{vConfig.label}</span>
        </span>
      )}

      {/* Critical Urgent Override Chip */}
      {isUrgent && (
        <span
          className="inline-flex items-center rounded-md border border-amber-300 bg-amber-100 text-amber-900 text-[11px] font-bold px-1.5 py-0.5 gap-1 animate-pulse"
          title="Safety override active: Case requires priority in-person verification despite initial report metrics."
        >
          <AlertTriangle className="w-3 h-3 text-amber-700" />
          <span>Urgent Triage</span>
        </span>
      )}
    </div>
  );
};
