import React, { useState } from 'react';
import {
  HotspotCluster,
  HotspotRiskTier,
  DiseaseActivityClassification,
  DiseaseActivityTrend,
  SurveillanceTimeWindow
} from '../../types/gis';
import { User, Role } from '../../types';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  FlaskConical,
  Radio,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  Info,
  ShieldAlert,
  Users,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { GISHotspotEngine } from '../../services/GISHotspotEngine';

interface HotspotDetailsPanelProps {
  cluster: HotspotCluster;
  timeWindow: SurveillanceTimeWindow;
  currentUser?: User | null;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
}

export const HotspotDetailsPanel: React.FC<HotspotDetailsPanelProps> = ({
  cluster,
  timeWindow,
  currentUser,
  onClose,
  onSelectCase
}) => {
  const [showFactorBreakdown, setShowFactorBreakdown] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const userRole: Role = currentUser?.role || 'FARMER';

  const riskTierStyles: Record<
    HotspotRiskTier,
    { badge: string; border: string; glow: string; text: string; bg: string }
  > = {
    CRITICAL: {
      badge: 'bg-rose-600 text-white border-rose-400',
      border: 'border-rose-500/50',
      glow: 'shadow-rose-500/20',
      text: 'text-rose-400',
      bg: 'bg-rose-950/40'
    },
    HIGH: {
      badge: 'bg-orange-500 text-white border-orange-400',
      border: 'border-orange-500/50',
      glow: 'shadow-orange-500/20',
      text: 'text-orange-400',
      bg: 'bg-orange-950/40'
    },
    MODERATE: {
      badge: 'bg-amber-400 text-slate-900 border-amber-300 font-bold',
      border: 'border-amber-500/50',
      glow: 'shadow-amber-500/20',
      text: 'text-amber-400',
      bg: 'bg-amber-950/40'
    },
    LOW: {
      badge: 'bg-emerald-600 text-white border-emerald-400',
      border: 'border-emerald-500/50',
      glow: 'shadow-emerald-500/20',
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/40'
    }
  };

  const currentStyle = riskTierStyles[cluster.riskTier] || riskTierStyles.LOW;

  const classificationLabels: Record<DiseaseActivityClassification, { label: string; color: string }> = {
    CONFIRMED_OUTBREAK: { label: 'Official Confirmed Outbreak', color: 'bg-rose-900/90 text-rose-200 border-rose-700' },
    HIGH_RISK_CLUSTER: { label: 'High-Risk Disease Cluster', color: 'bg-orange-900/90 text-orange-200 border-orange-700' },
    SUSPECTED_CLUSTER: { label: 'Suspected Disease Cluster', color: 'bg-amber-900/90 text-amber-200 border-amber-700' },
    INCREASED_ACTIVITY: { label: 'Increased Disease Activity', color: 'bg-blue-900/90 text-blue-200 border-blue-700' },
    NORMAL_ACTIVITY: { label: 'Normal Baseline Surveillance', color: 'bg-emerald-900/90 text-emerald-200 border-emerald-700' }
  };

  const handleSendHotspotAlert = () => {
    GISHotspotEngine.checkAndTriggerHotspotNotification(cluster, currentUser || null);
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 4000);
  };

  return (
    <div className={`w-full max-w-md bg-slate-900/95 backdrop-blur-xl text-slate-100 rounded-2xl border ${currentStyle.border} shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150`}>
      {/* Header Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${currentStyle.bg} border ${currentStyle.border} flex items-center justify-center shrink-0`}>
            {cluster.riskTier === 'CRITICAL' ? (
              <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
            ) : cluster.riskTier === 'HIGH' ? (
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            ) : (
              <Activity className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${currentStyle.badge}`}>
                {cluster.riskTier} RISK • {cluster.riskScore}/100
              </span>
              {cluster.isSimulatedDemo && (
                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-700/60">
                  DEMO SIMULATION
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">
              {cluster.name}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{cluster.districtName}, {cluster.stateName} • ~{cluster.radiusKm} km radius</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Scrollable Area */}
      <div className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
        {/* Classification & Trend Banner */}
        <div className="grid grid-cols-2 gap-2">
          {/* Classification Pill */}
          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${classificationLabels[cluster.classification]?.color || 'bg-slate-800 text-slate-200'}`}>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Classification</span>
            <span className="font-bold text-xs mt-1">
              {classificationLabels[cluster.classification]?.label || cluster.classification}
            </span>
          </div>

          {/* Trend Pill */}
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Activity Trend</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-xs">
              {cluster.trend === 'INCREASING' ? (
                <>
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400">Increasing {cluster.trendChangePct ? `(+${cluster.trendChangePct}%)` : ''}</span>
                </>
              ) : cluster.trend === 'DECREASING' ? (
                <>
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Decreasing {cluster.trendChangePct ? `(${cluster.trendChangePct}%)` : ''}</span>
                </>
              ) : cluster.trend === 'STABLE' ? (
                <>
                  <Minus className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Stable Activity</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 text-[11px]">Insufficient Baseline Data</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-center border-r border-slate-800 pr-1">
            <span className="text-[10px] text-slate-400">Current Cases</span>
            <p className="text-base font-extrabold text-white mt-0.5">{cluster.currentPeriodCaseCount}</p>
            <span className="text-[9px] text-slate-500">
              {timeWindow === 'ALL' ? 'All records' : `In ${timeWindow}`}
            </span>
          </div>

          <div className="text-center border-r border-slate-800 pr-1">
            <span className="text-[10px] text-slate-400">Affected Animals</span>
            <p className="text-base font-extrabold text-amber-300 mt-0.5">{cluster.totalAffectedAnimals}</p>
            <span className="text-[9px] text-slate-500">{cluster.species.join(', ') || 'Livestock'}</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400">Mortalities</span>
            <p className={`text-base font-extrabold mt-0.5 ${cluster.totalDeaths > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {cluster.totalDeaths}
            </p>
            <span className="text-[9px] text-slate-500">Confirmed deaths</span>
          </div>
        </div>

        {/* Confirmation & Disease Attributes */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Primary Suspected Disease:</span>
            <span className="font-bold text-emerald-300 text-right">{cluster.primaryDisease}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Laboratory Verification:</span>
            <span className="font-medium text-slate-200 flex items-center gap-1">
              {cluster.hasPositiveLab ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Positive Confirmed
                </span>
              ) : cluster.confirmationStatus === 'OFFICIALLY_DECLARED' ? (
                <span className="text-rose-400 flex items-center gap-1 font-bold">
                  <Radio className="w-3.5 h-3.5" /> Official Outbreak Declared
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5" /> Lab Sample Pending
                </span>
              )}
            </span>
          </div>

          {cluster.hasOfficialOutbreak && cluster.officialOutbreakCode && (
            <div className="flex justify-between items-center pt-1 border-t border-slate-700/50">
              <span className="text-slate-400">Outbreak Quarantine Code:</span>
              <span className="font-mono text-rose-300 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
                {cluster.officialOutbreakCode}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-700/50">
            <span className="text-slate-400">Surveillance Villages:</span>
            <span className="text-slate-300 font-medium text-right line-clamp-1 max-w-[200px]">
              {cluster.villages.join(', ') || 'Local Block Perimeter'}
            </span>
          </div>
        </div>

        {/* Transparent Hotspot Risk Scoring Factor Breakdown (Expandable) */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
          <button
            onClick={() => setShowFactorBreakdown(!showFactorBreakdown)}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-slate-200 text-xs">
                Hotspot Risk Score Breakdown ({cluster.riskScore}/100)
              </span>
            </div>
            {showFactorBreakdown ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showFactorBreakdown && (
            <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2 text-[11px]">
              <p className="text-[10px] text-slate-400 italic mb-2">
                Transparent multi-criteria epidemiological score based on spatial density, mortality, lab confirmation, growth rate, and ML early screening.
              </p>

              {cluster.riskBreakdown.factors.map(f => (
                <div key={f.id} className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      {f.label}
                      {f.isMLSignal && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-700">
                          Early screening signal
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-emerald-400">{f.score} / {f.maxScore} pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (f.score / f.maxScore) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{f.description}</p>
                </div>
              ))}

              <div className="p-2 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-[10px] text-indigo-200">
                <span className="font-bold">ML Model Notice:</span> Machine learning output is utilized strictly as an early screening indicator and does not replace official laboratory confirmation or clinical diagnosis.
              </div>
            </div>
          )}
        </div>

        {/* Role-Specific Recommended Actions */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-slate-200 text-xs">
              {userRole === 'FARMER'
                ? 'Farmer Protective Action Plan (Simple Biosecurity)'
                : userRole === 'VETERINARIAN'
                ? 'Veterinary Clinical & Diagnostic Protocols'
                : userRole === 'FIELD_WORKER'
                ? 'Field Worker Surveillance & Sampling Directives'
                : 'Administrative Containment & Quarantine Orders'}
            </h4>
          </div>

          <ul className="space-y-1.5 text-[11px] text-slate-300">
            {userRole === 'FARMER' ? (
              cluster.recommendedActions.farmerGuidance.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))
            ) : userRole === 'VETERINARIAN' ? (
              cluster.recommendedActions.veterinarianGuidance.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))
            ) : userRole === 'FIELD_WORKER' ? (
              cluster.recommendedActions.fieldWorkerGuidance.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))
            ) : (
              cluster.recommendedActions.officialGuidance.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))
            )}
          </ul>

          {/* Biosecurity Directives Snippet */}
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            <span className="font-semibold text-slate-300">Sanitation Directive: </span>
            {cluster.recommendedActions.biosecurityDirectives[0]}
          </div>
        </div>

        {/* Farmer Privacy Safe Notice for Farmers */}
        {userRole === 'FARMER' && (
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Privacy Safe: Area activity is anonymized for community herd protection.</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-400">
          Last Report: {new Date(cluster.latestReportDate).toLocaleDateString()}
        </div>

        <div className="flex items-center gap-2">
          {(userRole === 'VETERINARIAN' || userRole === 'DISTRICT_OFFICIAL' || userRole === 'STATE_ADMIN' || userRole === 'FIELD_WORKER') && (
            <button
              onClick={handleSendHotspotAlert}
              disabled={notificationSent}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                notificationSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {notificationSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Alert Sent</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Broadcast Alert</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
