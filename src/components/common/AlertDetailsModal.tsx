import React from 'react';
import { Alert, User, Role } from '../../types';
import { useTranslation } from '../../i18n/translations';
import {
  ShieldAlert,
  AlertTriangle,
  Syringe,
  FlaskConical,
  Bell,
  Clock,
  MapPin,
  CheckCircle,
  PhoneCall,
  FileText,
  Stethoscope,
  Info,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  ExternalLink,
  X,
  Compass
} from 'lucide-react';

interface AlertDetailsModalProps {
  alert: Alert | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onNavigateAction?: (actionType: string, payload?: any) => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  alert,
  currentUser,
  isOpen,
  onClose,
  onNavigateAction
}) => {
  const { t, currentLang } = useTranslation();

  if (!isOpen || !alert) return null;

  const getPriorityStyle = (priority: Alert['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60',
          border: 'border-rose-300 dark:border-rose-800',
          text: 'text-rose-800 dark:text-rose-300',
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          label: 'CRITICAL SEVERITY',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/60',
          border: 'border-orange-300 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-300',
          badgeBg: 'bg-orange-500',
          badgeText: 'text-white',
          label: 'HIGH PRIORITY',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60',
          border: 'border-amber-300 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-300',
          badgeBg: 'bg-amber-500',
          badgeText: 'text-white',
          label: 'WARNING / MEDIUM',
          icon: <AlertOctagon className="w-5 h-5 text-amber-600" />
        };
      case 'LOW':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/60',
          border: 'border-blue-300 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-300',
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white',
          label: 'ROUTINE NOTICE',
          icon: <Info className="w-5 h-5 text-blue-600" />
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-800/60',
          border: 'border-slate-300 dark:border-slate-700',
          text: 'text-slate-800 dark:text-slate-200',
          badgeBg: 'bg-slate-600',
          badgeText: 'text-white',
          label: 'INFORMATIONAL',
          icon: <Bell className="w-5 h-5 text-slate-600" />
        };
    }
  };

  const style = getPriorityStyle(alert.priority);

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  const handleAction = () => {
    onClose();
    if (onNavigateAction) {
      if (alert.caseId) {
        onNavigateAction('VIEW_CASE', alert.caseId);
      } else if (alert.category === 'OUTBREAK') {
        onNavigateAction('VIEW_OUTBREAKS');
      } else if (alert.actionType === 'REPORT_ANIMAL') {
        onNavigateAction('REPORT_CASE');
      } else if (alert.actionType === 'VIEW_ANIMAL' && alert.animalId) {
        onNavigateAction('VIEW_ANIMALS', alert.animalId);
      } else if (alert.actionType === 'VIEW_LAB' && alert.sampleId) {
        onNavigateAction('VIEW_LAB', alert.sampleId);
      } else {
        onNavigateAction('VIEW_DASHBOARD');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header with Severity Banner */}
        <div className={`px-6 py-4 border-b ${style.bg} ${style.border} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs shrink-0">
              {style.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${style.badgeBg} ${style.badgeText} tracking-wider`}>
                  {style.label}
                </span>
                {alert.isDemo && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    Demo Alert — Simulated for Demonstration
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                {alert.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Advisory Message */}
          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Alert Briefing & Situation Summary
            </h3>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {alert.message}
            </p>
          </div>

          {/* Key Intelligence Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Location Scope */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-750 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] block">
                  Location & Spatial Relevance
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {[alert.villageName, alert.districtName, alert.stateName].filter(Boolean).join(', ') || 'District Surveillance Zone'}
                </p>
                {alert.locationRelevance && (
                  <span className="inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    📍 {alert.locationRelevance} {alert.distanceKm ? `(~${alert.distanceKm} km away)` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Time of Alert */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-750 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] block">
                  Timestamp of Issuance
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {formatTimestamp(alert.createdAt)}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time Early Warning Network
                </span>
              </div>
            </div>

            {/* Disease Identity */}
            {alert.diseaseName && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-750 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] block">
                    Suspected / Target Disease
                  </span>
                  <p className="font-extrabold text-purple-900 dark:text-purple-300">
                    {alert.diseaseName}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Preserved Official Disease Designation
                  </span>
                </div>
              </div>
            )}

            {/* Related Entity Identifier */}
            {(alert.animalTag || alert.caseNumber || alert.sampleCode) && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-750 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] block">
                    Associated Record ID
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    {alert.animalTag || alert.caseNumber || alert.sampleCode}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Linked to Official Registry
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Immediate Actions (Farmer-Friendly Language) */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-850">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Recommended Immediate Actions for Farm & Herd
            </h3>
            <ul className="space-y-2">
              {(alert.recommendedActions && alert.recommendedActions.length > 0
                ? alert.recommendedActions
                : [
                    'Keep the sick animal separate in a well-ventilated dry shelter away from other livestock.',
                    'Provide clean drinking water, soft green fodder, and observe daily for changes in temperature or appetite.',
                    'Contact your local veterinarian or veterinary dispensary immediately if symptoms persist.'
                  ]
              ).map((action, idx) => (
                <li key={idx} className="text-xs font-medium text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Guidance & Mandatory Veterinary Disclaimer */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-850 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
              <Stethoscope className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Veterinary Safety & Clinical Decision Support Notice</span>
            </div>
            <p className="text-amber-800 dark:text-amber-400 leading-relaxed text-[11px]">
              {alert.safetyGuidance && alert.safetyGuidance.length > 0
                ? alert.safetyGuidance.join(' ')
                : 'Early screening result — confirmation by a qualified veterinarian or laboratory may be required.'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
              LivestockGuard does not generate unverified medication prescriptions. Always consult a certified veterinary officer prior to pharmaceutical administration.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Toll-Free Help Gateway */}
          <a
            href="tel:1800419838"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Call Toll-Free Vet: 1800-419-VET</span>
          </a>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Dismiss
            </button>

            <button
              onClick={handleAction}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <span>{alert.actionLabel || 'Proceed to Case / View Details'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
