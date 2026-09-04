import React, { useState } from 'react';
import { Case, User, Role, VerificationState, VerificationEvidenceItem } from '../../types';
import { store } from '../../services/store';
import { CredibilityBadge } from './CredibilityBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Clock,
  MapPin,
  Calendar,
  UserCheck,
  FileText,
  Send,
  AlertCircle,
  Info,
  Layers,
  Activity,
  History,
  Check,
  ExternalLink,
  HelpCircle,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoEvidenceSection } from './PhotoEvidenceSection';

interface CredibilityBreakdownModalProps {
  caseItem: Case;
  currentUser: User;
  isOpen: boolean;
  initialAction?: 'FIELD_VERIFY' | 'VET_VERIFY' | 'LAB_CONFIRM' | 'REQUEST_INFO' | 'REJECT' | 'DISMISS';
  initialTab?: 'BREAKDOWN' | 'ACTIONS' | 'PHOTOS' | 'AUDIT';
  onClose: () => void;
  onCaseUpdated?: (updatedCase: Case) => void;
}

export const CredibilityBreakdownModal: React.FC<CredibilityBreakdownModalProps> = ({
  caseItem,
  currentUser,
  isOpen,
  initialAction,
  initialTab,
  onClose,
  onCaseUpdated
}) => {
  const defaultAction = initialAction || (currentUser.role === 'FIELD_WORKER' ? 'FIELD_VERIFY' : currentUser.role === 'LABORATORY_STAFF' ? 'LAB_CONFIRM' : 'VET_VERIFY');
  const [activeTab, setActiveTab] = useState<'BREAKDOWN' | 'ACTIONS' | 'PHOTOS' | 'AUDIT'>(initialTab || (initialAction ? 'ACTIONS' : 'BREAKDOWN'));
  const [actionType, setActionType] = useState<
    'FIELD_VERIFY' | 'VET_VERIFY' | 'LAB_CONFIRM' | 'REQUEST_INFO' | 'REJECT' | 'DISMISS'
  >(defaultAction);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Data inconsistencies observed upon ground inspection.');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const score = caseItem.credibilityScore ?? 75;
  const tier = caseItem.credibilityTier || (score >= 80 ? 'TRUSTED' : score >= 60 ? 'REVIEW' : 'LOW_CREDIBILITY');
  const vState = caseItem.verificationState || 'NOT_REVIEWED';
  const breakdown = caseItem.credibilityFeatureBreakdown || {
    dataQuality: 80,
    duplicateSimilarity: 85,
    locationConsistency: 90,
    temporalConsistency: 85,
    reporterHistory: 70,
    animalHistory: 80,
    evidenceStrength: 75
  };

  // RBAC Action Clearance Check
  const canFieldVerify = ['FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'].includes(
    currentUser.role
  );
  const canVetVerify = ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'].includes(
    currentUser.role
  );
  const canLabConfirm = ['LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'].includes(
    currentUser.role
  );
  const canReject = ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'].includes(
    currentUser.role
  );
  const isFarmer = currentUser.role === 'FARMER';

  const handleExecuteVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let evidence: VerificationEvidenceItem | undefined;
    if (evidenceRef.trim() || evidenceNotes.trim()) {
      evidence = {
        type: actionType === 'LAB_CONFIRM' ? 'LAB_SAMPLE' : 'VET_VISIT',
        reference: evidenceRef.trim() || `EV-${Date.now().toString().slice(-5)}`,
        description: `${actionType.replace(/_/g, ' ')} evidence provided by ${currentUser.name}`,
        addedBy: currentUser.name,
        addedAt: new Date().toISOString(),
        notes: evidenceNotes.trim()
      };
    }

    const updated = store.verifyCase({
      caseId: caseItem.id,
      action: actionType,
      notes: actionNotes.trim() || `Case updated with ${actionType} by ${currentUser.name} (${currentUser.role}).`,
      evidence,
      rejectionReason: actionType === 'REJECT' ? rejectionReason : undefined
    });

    setIsSubmitting(false);

    if (updated) {
      if (actionType === 'VET_VERIFY' || actionType === 'LAB_CONFIRM' || actionType === 'FIELD_VERIFY') {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
      }

      setActionFeedback(`Action "${actionType.replace(/_/g, ' ')}" recorded successfully.`);
      setTimeout(() => {
        setActionFeedback(null);
        if (onCaseUpdated) onCaseUpdated(updated);
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {caseItem.caseNumber}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {caseItem.species}
              </span>
              {caseItem.animalTag && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tag: {caseItem.animalTag}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Report Credibility & Case Verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transparent multi-factor credibility scoring, anomaly validation, and field audit trail.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('BREAKDOWN')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'BREAKDOWN'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Credibility Breakdown
          </button>
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'ACTIONS'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Verification Actions
          </button>
          <button
            onClick={() => setActiveTab('PHOTOS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'PHOTOS'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Photo Evidence ({(caseItem.photos || []).length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'AUDIT'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Verification Audit Trail ({caseItem.credibilityAuditTrail?.length || 0})
          </button>
        </div>

        {/* Tab 1: Breakdown & Explainability */}
        {activeTab === 'BREAKDOWN' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Urgent Safety Override Notice if applicable */}
            {caseItem.isCriticalUrgentVerification && (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    Urgent In-Person Verification Override
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full font-bold">
                      Zero Report Suppression Active
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                    {caseItem.urgentReason ||
                      'Report indicates acute livestock mortality or suspected zoonotic disease. The surveillance engine guarantees this case is prioritized for immediate field verification and will never be suppressed despite initial report credibility score.'}
                  </p>
                </div>
              </div>
            )}

            {/* Score Hero Summary */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-2xl shadow-sm ${
                    tier === 'TRUSTED'
                      ? 'bg-emerald-600 text-white'
                      : tier === 'REVIEW'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  <span>{score}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Overall Credibility
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        tier === 'TRUSTED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : tier === 'REVIEW'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {tier === 'TRUSTED' ? 'Trusted Report' : tier === 'REVIEW' ? 'Review Recommended' : 'Low Credibility Report'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Verification State: <span className="text-emerald-700 dark:text-emerald-400">{vState.replace(/_/g, ' ')}</span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Reporter: {caseItem.reporterName || 'Anonymous'} ({caseItem.reporterRole || 'FARMER'})</span>
                    {caseItem.locationMatchScore !== undefined && (
                      <span>• Geofence Match: {caseItem.locationMatchScore}%</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <CredibilityBadge
                  score={score}
                  tier={tier}
                  verificationState={vState}
                  isUrgent={caseItem.isCriticalUrgentVerification}
                  size="lg"
                />
                {caseItem.verifiedBy && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Verified by {caseItem.verifiedBy} ({new Date(caseItem.verifiedAt || '').toLocaleDateString()})
                  </span>
                )}
              </div>
            </div>

            {/* Multi-Factor Feature Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                <span>Multi-Factor Assessment Breakdown</span>
                <span className="text-[10px] font-normal text-slate-400">Deterministic Feature Scoring</span>
              </h4>

              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {[
                  {
                    name: 'Data Completeness & Quality',
                    weight: '20%',
                    score: breakdown.dataQuality,
                    desc: 'Biological symptom plausibility, durations, and counts'
                  },
                  {
                    name: 'Duplicate & Outlier Detection',
                    weight: '15%',
                    score: breakdown.duplicateSimilarity,
                    desc: 'Cross-device deduplication within spatio-temporal radius'
                  },
                  {
                    name: 'Location & Geofence Consistency',
                    weight: '15%',
                    score: breakdown.locationConsistency,
                    desc: 'Report coordinates matched against registered village perimeter'
                  },
                  {
                    name: 'Temporal Consistency',
                    weight: '15%',
                    score: breakdown.temporalConsistency,
                    desc: 'Plausibility of reported symptom progression timeline'
                  },
                  {
                    name: 'Reporter History & Trust Score',
                    weight: '15%',
                    score: breakdown.reporterHistory,
                    desc: 'Historical verification accuracy (neutral baseline for new accounts)'
                  },
                  {
                    name: 'Animal & Herd Registry Consistency',
                    weight: '10%',
                    score: breakdown.animalHistory,
                    desc: 'Alignment with registered breed, age, and historical vaccinations'
                  },
                  {
                    name: 'Clinical Evidence Strength',
                    weight: '10%',
                    score: breakdown.evidenceStrength,
                    desc: 'Ground verification visits, lab diagnostic orders, or photographs'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.name}
                        <span className="text-[10px] text-slate-400 font-normal ml-1.5">({item.weight})</span>
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.score} / 100
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.score >= 80
                            ? 'bg-emerald-500'
                            : item.score >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable Reasons & Anomalies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Assessment Rationales
                </h4>
                {caseItem.credibilityReasons && caseItem.credibilityReasons.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {caseItem.credibilityReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">Standard assessment parameters applied.</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Detected Anomalies & Outliers
                </h4>
                {caseItem.anomalyFlags && caseItem.anomalyFlags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {caseItem.anomalyFlags.map((flag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                      >
                        ⚠ {flag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No data anomalies detected. All fields passed validation checks.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Evidence List */}
            {caseItem.verificationEvidence && caseItem.verificationEvidence.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Attached Verification Evidence
                </h4>
                <div className="space-y-2">
                  {caseItem.verificationEvidence.map((ev, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ev.type.replace(/_/g, ' ')}
                          </span>
                          {ev.reference && (
                            <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                              Ref: {ev.reference}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{ev.notes || ev.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        Added by {ev.addedBy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Verification Actions Form */}
        {activeTab === 'ACTIONS' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {isFarmer ? (
              <div className="p-6 text-center space-y-3">
                <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto opacity-80" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Verification Managed by Veterinary Officials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  As a registered Farmer, you can track the verification progress in real-time. Only certified Field
                  Workers, Veterinary Officers, and Laboratory Staff have credentials to physically verify cases and
                  update official disease surveillance registries.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Current Status: <strong className="text-emerald-700">{vState.replace(/_/g, ' ')}</strong>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteVerification} className="space-y-5">
                {actionFeedback && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {actionFeedback}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Select Verification Action
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {canVetVerify && (
                      <button
                        type="button"
                        onClick={() => setActionType('VET_VERIFY')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          actionType === 'VET_VERIFY'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">🩺 Vet Verify</div>
                        <div className="text-[10px] text-slate-500 mt-1">Physical clinical triage & sign confirmation</div>
                      </button>
                    )}

                    {canFieldVerify && (
                      <button
                        type="button"
                        onClick={() => setActionType('FIELD_VERIFY')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          actionType === 'FIELD_VERIFY'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">📍 Field Verify</div>
                        <div className="text-[10px] text-slate-500 mt-1">Ground visit inspection by field worker</div>
                      </button>
                    )}

                    {canLabConfirm && (
                      <button
                        type="button"
                        onClick={() => setActionType('LAB_CONFIRM')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          actionType === 'LAB_CONFIRM'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">🧪 Lab Confirm</div>
                        <div className="text-[10px] text-slate-500 mt-1">Definitive RT-PCR / ELISA confirmation</div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActionType('REQUEST_INFO')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        actionType === 'REQUEST_INFO'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">💬 Request Info</div>
                      <div className="text-[10px] text-slate-500 mt-1">Query farmer or field officer for details</div>
                    </button>

                    {canReject && (
                      <button
                        type="button"
                        onClick={() => setActionType('REJECT')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          actionType === 'REJECT'
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">❌ Reject Report</div>
                        <div className="text-[10px] text-slate-500 mt-1">Flag invalid, duplicate, or false alarm</div>
                      </button>
                    )}
                  </div>
                </div>

                {actionType === 'REJECT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Reason for Rejection *
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className="w-full text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white"
                      required
                    >
                      <option value="Duplicate submission of another active case">Duplicate submission of another active case</option>
                      <option value="Animal inspected on-site: Healthy, no clinical pathology confirmed">Animal inspected on-site: Healthy, no clinical pathology confirmed</option>
                      <option value="Severe numerical contradiction in reported affected/dead counts">Severe numerical contradiction in reported affected/dead counts</option>
                      <option value="Spam / test submission">Spam / test submission</option>
                      <option value="Farmer withdrawn report">Farmer withdrawn report</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Clinical / Field Notes & Observations
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={e => setActionNotes(e.target.value)}
                    rows={3}
                    placeholder="Document clinical inspection details, animal rectal temperature, lesions seen, or instructions given to owner..."
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Evidence Reference / Report ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={evidenceRef}
                      onChange={e => setEvidenceRef(e.target.value)}
                      placeholder="e.g. CLIN-2026-089 or PCR-VET-401"
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Evidence Details
                    </label>
                    <input
                      type="text"
                      value={evidenceNotes}
                      onChange={e => setEvidenceNotes(e.target.value)}
                      placeholder="e.g. Physical exam performed at barn"
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                      actionType === 'REJECT'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : actionType === 'LAB_CONFIRM'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isSubmitting ? (
                      'Processing...'
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Apply {actionType.replace(/_/g, ' ')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab: Photo Evidence & Verification */}
        {activeTab === 'PHOTOS' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <PhotoEvidenceSection
                photos={caseItem.photos || []}
                onChange={(newPhotos) => {
                  if (newPhotos.length > (caseItem.photos || []).length) {
                    const latest = newPhotos[newPhotos.length - 1];
                    store.addPhotoToCase(caseItem.id, latest);
                    const updated = store.getCaseById(caseItem.id);
                    if (updated && onCaseUpdated) {
                      onCaseUpdated(updated);
                    }
                  }
                }}
                allowVetReview={canVetVerify || canFieldVerify}
                onReviewPhoto={(photoId, status, notes) => {
                  store.updatePhotoReviewStatus(photoId, status, currentUser.name, notes);
                  const updated = store.getCaseById(caseItem.id);
                  if (updated && onCaseUpdated) {
                    onCaseUpdated(updated);
                  }
                }}
                currentUserRole={currentUser.role}
                caseId={caseItem.id}
                animalId={caseItem.animalId}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Immutable Audit Trail */}
        {activeTab === 'AUDIT' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verification History & Audit Log
              </h4>
              <span className="text-[11px] text-slate-400">Chronological surveillance ledger</span>
            </div>

            {caseItem.credibilityAuditTrail && caseItem.credibilityAuditTrail.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {caseItem.credibilityAuditTrail.map((entry, idx) => (
                  <div key={entry.id || idx} className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </span>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 text-xs">
                        {entry.reason}
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-400">
                        <span>Actor: <strong className="text-slate-600 dark:text-slate-300">{entry.actorName}</strong> ({entry.actorRole})</span>
                        {entry.evidenceReference && (
                          <span>• Evidence Ref: <strong className="font-mono text-indigo-600">{entry.evidenceReference}</strong></span>
                        )}
                        <span>• Status: {entry.previousStatus} → <strong>{entry.newStatus}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No credibility audit records logged yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
