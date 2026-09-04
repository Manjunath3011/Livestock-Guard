import React, { useState, useMemo } from 'react';
import { Case, User, CaseStatus, LabSample, FollowUpRecord } from '../../types';
import { store } from '../../services/store';
import { RiskBadge } from '../common/RiskBadge';
import { CaseStatusBadge } from '../common/CaseStatusBadge';
import { CredibilityBadge } from '../common/CredibilityBadge';
import { CredibilityBreakdownModal } from '../common/CredibilityBreakdownModal';
import { Modal } from '../common/Modal';
import { HybridDecisionSupportCard } from '../common/HybridDecisionSupportCard';
import { HybridRiskEngine } from '../../services/HybridRiskEngine';
import { useTranslation } from '../../i18n/translations';
import { PhotoEvidenceSection } from '../common/PhotoEvidenceSection';
import {
  Stethoscope,
  Activity,
  Filter,
  CheckCircle,
  FlaskConical,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  FileText,
  AlertOctagon,
  UserCheck,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Send,
  History,
  BrainCircuit,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VeterinaryDashboardViewProps {
  cases: Case[];
  currentUser: User;
  onSelectCase?: (caseId: string) => void;
}

export const VeterinaryDashboardView: React.FC<VeterinaryDashboardViewProps> = ({
  cases,
  currentUser
}) => {
  const { t, currentLang } = useTranslation();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modals
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isCredibilityModalOpen, setIsCredibilityModalOpen] = useState(false);
  const [credibilityFilter, setCredibilityFilter] = useState<string>('ALL');

  // Status Change State
  const [newStatus, setNewStatus] = useState<CaseStatus>('VET_VISIT_REQUIRED');
  const [statusNotes, setStatusNotes] = useState('');

  // Follow-Up State
  const [followUpTimeframe, setFollowUpTimeframe] = useState<FollowUpRecord['timeframe']>('24_HOURS');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpRecord['statusUpdate']>('IMPROVING');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Escalation State
  const [escalateReason, setEscalateReason] = useState('Severe respiratory distress and recumbency observed in herd.');

  // Sample Order State
  const [sampleType, setSampleType] = useState<LabSample['sampleType']>('VESICULAR_FLUID');
  const [testRequested, setTestRequested] = useState<LabSample['testRequested']>('RT_PCR');
  const [labName, setLabName] = useState('Pune District Disease Investigation Lab (DIAL)');

  // Treatment State
  const [medicineName, setMedicineName] = useState('Enrofloxacin 10% + Meloxicam');
  const [dosage, setDosage] = useState('15 ml IM OD for 3 days');
  const [treatmentNotes, setTreatmentNotes] = useState('Provide soft mash feed and 2% sodium carbonate mouth wash.');

  const [caseDetailTab, setCaseDetailTab] = useState<'DECISION_SUPPORT' | 'CREDIBILITY' | 'PHOTOS' | 'OVERVIEW' | 'FOLLOWUPS' | 'AUDIT'>('DECISION_SUPPORT');

  const selectedCaseHybridAssessment = useMemo(() => {
    if (!selectedCase) return null;
    if (selectedCase.hybridAssessment) return selectedCase.hybridAssessment;

    return HybridRiskEngine.evaluate({
      species: selectedCase.species,
      symptoms: selectedCase.symptoms || [],
      symptomDurationDays: selectedCase.symptomDurationDays || 2,
      previousDiseaseHistory: selectedCase.previousHealthHistory || [],
      affectedCount: selectedCase.affectedCount || 1,
      totalAnimalsInHerd: selectedCase.totalAnimalsInHerd || (selectedCase.affectedCount ? selectedCase.affectedCount * 3 : 10),
      deadCount: selectedCase.deadCount || 0,
      latitude: selectedCase.latitude,
      longitude: selectedCase.longitude,
      stateId: selectedCase.stateId,
      districtId: selectedCase.districtId,
      villageId: selectedCase.villageId,
      vaccinationStatus: selectedCase.vaccinationStatusAtReport || 'UNKNOWN',
      existingCases: cases || []
    });
  }, [selectedCase, cases]);

  const filteredCases = (cases || []).filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (riskFilter !== 'ALL' && c.riskLevel !== riskFilter) return false;
    if (credibilityFilter === 'TRUSTED' && (c.credibilityScore ?? 75) < 80) return false;
    if (credibilityFilter === 'REVIEW' && ((c.credibilityScore ?? 75) >= 80 || (c.credibilityScore ?? 75) < 60)) return false;
    if (credibilityFilter === 'LOW' && (c.credibilityScore ?? 75) >= 60) return false;
    if (credibilityFilter === 'URGENT' && !c.isCriticalUrgentVerification) return false;
    if (credibilityFilter === 'UNVERIFIED' && c.verificationState && c.verificationState !== 'NOT_REVIEWED') return false;
    return true;
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.updateCaseStatus(selectedCase.id, newStatus, statusNotes);
    setIsStatusModalOpen(false);
    setStatusNotes('');

    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleLogFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.addFollowUpRecord(selectedCase.id, {
      timeframe: followUpTimeframe,
      statusUpdate: followUpStatus,
      notes: followUpNotes,
      recordedBy: currentUser.name
    });

    try {
      confetti({ particleCount: 30, spread: 45 });
    } catch (e) {}

    setIsFollowUpModalOpen(false);
    setFollowUpNotes('');

    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleEscalateToVet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.escalateCaseToVet(selectedCase.id, escalateReason);
    setIsEscalateModalOpen(false);

    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleOrderSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.createLabSample({
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      animalId: selectedCase.animalId,
      animalTag: selectedCase.animalTag,
      species: selectedCase.species,
      sampleType,
      collectionDate: new Date().toISOString().split('T')[0],
      collectedBy: currentUser.name,
      laboratoryId: 'lab_pune_dial',
      laboratoryName: labName,
      testRequested,
      suspectedDiseaseName: selectedCase.suspectedDiseases?.[0]?.diseaseName || 'Foot-and-Mouth Disease',
      remarks: 'Urgent sample collected during field clinical triage.'
    });

    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {}

    setIsSampleModalOpen(false);
    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handlePrescribeTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    store.createTreatmentRecord({
      caseId: selectedCase.id,
      animalId: selectedCase.animalId,
      animalTag: selectedCase.animalTag,
      species: selectedCase.species,
      farmName: selectedCase.farmName,
      suspectedDisease: selectedCase.suspectedDiseases?.[0]?.diseaseName || 'Clinical Syndrome',
      treatmentDate: new Date().toISOString().split('T')[0],
      medicines: [
        {
          medicineName,
          dosage,
          durationDays: 3,
          route: 'INTRAMUSCULAR'
        }
      ],
      veterinarianId: currentUser.id,
      veterinarianName: currentUser.name,
      treatmentResponse: 'IMPROVING',
      remarks: treatmentNotes
    });

    setIsTreatmentModalOpen(false);
    const updated = store.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            {t('clinicalTriage', 'Veterinary Clinical Triage & Differential Hub')}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t('cases', 'Clinical Surveillance Board')} ({filteredCases.length} {t('cases', 'Cases')})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('routinePrevention', 'Review live field reports, order lab testing, prescribe supportive care, and issue quarantine containment orders.')}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">{t('allStatus', 'All Statuses')}</option>
            <option value="NEW">{t('pending', 'New Reports')}</option>
            <option value="UNDER_REVIEW">{t('underObservation', 'Under Review')}</option>
            <option value="VET_VISIT_REQUIRED">{t('consultVet', 'Vet Visit Required')}</option>
            <option value="LAB_TESTING">{t('lab', 'In Lab Testing')}</option>
            <option value="CONFIRMED">{t('affected', 'Confirmed Positive')}</option>
            <option value="RESOLVED">{t('recovered', 'Resolved')}</option>
          </select>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">{t('riskLevel', 'All Risk Levels')}</option>
            <option value="CRITICAL">{t('critical', 'Critical Risk')}</option>
            <option value="HIGH">{t('highRisk', 'High Risk')}</option>
            <option value="MODERATE">{t('moderateRisk', 'Moderate Risk')}</option>
            <option value="LOW">{t('lowRisk', 'Low Risk')}</option>
          </select>

          <select
            value={credibilityFilter}
            onChange={e => setCredibilityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Credibility</option>
            <option value="TRUSTED">Trusted (Score ≥ 80)</option>
            <option value="REVIEW">Review (60 - 79)</option>
            <option value="LOW">Low Credibility (&lt; 60)</option>
            <option value="URGENT">⚡ Urgent Triage Override</option>
            <option value="UNVERIFIED">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Main Split View: Cases Table + Interactive Detailed Inspection Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases List Table (6 or 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
            <span>Surveillance Triage Queue</span>
            <span>{filteredCases.length} Active Records</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredCases.map(c => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/60 border-l-4 border-l-emerald-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {c.caseNumber}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          {c.species} • {c.villageName}
                        </span>
                        {(c.photos || []).length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1" title={`${c.photos!.length} photo(s) attached`}>
                            <Camera className="w-2.5 h-2.5" />
                            {c.photos!.length}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 mt-1">
                        Suspected: {c.suspectedDiseases?.[0]?.diseaseName || 'Under Evaluation'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <RiskBadge level={c.riskLevel} score={c.riskScore} size="sm" />
                      <CaseStatusBadge status={c.status} size="sm" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 bg-slate-50/80 p-1.5 rounded">
                    Symptoms: {(c.symptoms || []).map(s => typeof s === 'string' ? s : s?.symptomName || s?.symptomId || 'Symptom').join(', ')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>Reported by: {c.reporterName} ({c.reporterRole})</span>
                    <CredibilityBadge
                      score={c.credibilityScore}
                      tier={c.credibilityTier}
                      verificationState={c.verificationState}
                      isUrgent={c.isCriticalUrgentVerification}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Inspection & Clinical Action Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedCase ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-5 sticky top-20">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Case Details
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedCase.caseNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCase.villageName}, {selectedCase.districtName}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <CredibilityBadge
                      score={selectedCase.credibilityScore}
                      tier={selectedCase.credibilityTier}
                      verificationState={selectedCase.verificationState}
                      isUrgent={selectedCase.isCriticalUrgentVerification}
                      size="sm"
                      onClick={() => setIsCredibilityModalOpen(true)}
                    />
                    <button
                      onClick={() => setIsCredibilityModalOpen(true)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      Audit / Verify
                    </button>
                  </div>
                </div>
                <RiskBadge level={selectedCase.riskLevel} score={selectedCase.riskScore} />
              </div>

              {/* Triage & Clinical Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={() => {
                    setNewStatus(selectedCase.status);
                    setIsStatusModalOpen(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer"
                >
                  Update Status
                </button>

                <button
                  onClick={() => {
                    if (selectedCaseHybridAssessment) {
                      const labRec = selectedCaseHybridAssessment.decisionSupport.laboratoryPathway;
                      setTestRequested(labRec.recommendedTest as any);
                    }
                    setIsSampleModalOpen(true);
                  }}
                  className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Order Lab
                </button>

                <button
                  onClick={() => setIsTreatmentModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Pill className="w-3.5 h-3.5" />
                  Prescribe
                </button>

                <button
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  Log Follow-Up
                </button>

                <button
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="bg-rose-700 hover:bg-rose-800 text-white p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Escalate
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs overflow-x-auto">
                {[
                  { id: 'DECISION_SUPPORT', label: 'AI & Hybrid Support', icon: BrainCircuit },
                  { id: 'CREDIBILITY', label: 'Credibility & Audit', icon: ShieldAlert },
                  { id: 'PHOTOS', label: `Photo Evidence (${(selectedCase.photos || []).length})`, icon: Camera },
                  { id: 'OVERVIEW', label: 'Case Overview', icon: FileText },
                  { id: 'FOLLOWUPS', label: `Follow-Ups (${(selectedCase.followUpRecords || []).length})`, icon: HeartPulse },
                  { id: 'AUDIT', label: 'Audit Log', icon: Clock }
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = caseDetailTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setCaseDetailTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: AI & DECISION SUPPORT */}
              {caseDetailTab === 'DECISION_SUPPORT' && selectedCaseHybridAssessment && (
                <div className="space-y-4 animate-in fade-in">
                  <HybridDecisionSupportCard
                    assessment={selectedCaseHybridAssessment}
                    showActions={true}
                    onReferToVet={() => {
                      setNewStatus('VET_VISIT_REQUIRED');
                      setIsStatusModalOpen(true);
                    }}
                    onRequestLabTest={() => {
                      const labRec = selectedCaseHybridAssessment.decisionSupport.laboratoryPathway;
                      setTestRequested(labRec.recommendedTest as any);
                      setIsSampleModalOpen(true);
                    }}
                  />
                </div>
              )}

              {/* TAB 2: CREDIBILITY & VERIFICATION */}
              {caseDetailTab === 'CREDIBILITY' && (
                <div className="space-y-4 animate-in fade-in">
                  {selectedCase.isCriticalUrgentVerification && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Urgent In-Person Verification Active:</strong>
                        <p className="mt-0.5 text-[11px] text-amber-800">
                          {selectedCase.urgentReason || 'Severe acute symptoms or mortality detected. Report is guaranteed high triage priority regardless of initial reporter credibility.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Credibility Score:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {selectedCase.credibilityScore ?? 75} / 100
                        </span>
                        <CredibilityBadge
                          score={selectedCase.credibilityScore}
                          tier={selectedCase.credibilityTier}
                          verificationState={selectedCase.verificationState}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-500 font-semibold">Verification State:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {(selectedCase.verificationState || 'NOT_REVIEWED').replace(/_/g, ' ')}
                      </span>
                    </div>

                    {selectedCase.credibilityFeatureBreakdown && (
                      <div className="border-t border-slate-200 pt-2 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Feature Scores
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>Data Quality: <strong>{selectedCase.credibilityFeatureBreakdown.dataQuality}%</strong></div>
                          <div>Deduplication: <strong>{selectedCase.credibilityFeatureBreakdown.duplicateSimilarity}%</strong></div>
                          <div>Geofence: <strong>{selectedCase.credibilityFeatureBreakdown.locationConsistency}%</strong></div>
                          <div>Reporter Trust: <strong>{selectedCase.credibilityFeatureBreakdown.reporterHistory}%</strong></div>
                        </div>
                      </div>
                    )}

                    {selectedCase.anomalyFlags && selectedCase.anomalyFlags.length > 0 && (
                      <div className="border-t border-slate-200 pt-2">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                          Flags & Outliers ({selectedCase.anomalyFlags.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedCase.anomalyFlags.map((flag, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-mono font-medium">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => setIsCredibilityModalOpen(true)}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Open Comprehensive Credibility & Audit Console
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PHOTO EVIDENCE & VETERINARY VERIFICATION */}
              {caseDetailTab === 'PHOTOS' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <PhotoEvidenceSection
                      photos={selectedCase.photos || []}
                      onChange={(newPhotos) => {
                        if (selectedCase) {
                          if (newPhotos.length > (selectedCase.photos || []).length) {
                            const latest = newPhotos[newPhotos.length - 1];
                            store.addPhotoToCase(selectedCase.id, latest);
                            const updated = store.getCaseById(selectedCase.id);
                            if (updated) setSelectedCase({ ...updated });
                          }
                        }
                      }}
                      allowVetReview={true}
                      onReviewPhoto={(photoId, status, notes) => {
                        store.updatePhotoReviewStatus(photoId, status, currentUser.name, notes);
                        const updated = store.getCaseById(selectedCase.id);
                        if (updated) setSelectedCase({ ...updated });
                      }}
                      currentUserRole={currentUser.role}
                      caseId={selectedCase.id}
                      animalId={selectedCase.animalId}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CASE OVERVIEW & SYMPTOMS */}
              {caseDetailTab === 'OVERVIEW' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Clinical Summary */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Status:</span>
                      <CaseStatusBadge status={selectedCase.status} size="sm" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Morbidity / Dead:</span>
                      <span className="font-bold text-slate-800">
                        {selectedCase.affectedCount} Sick / {selectedCase.deadCount} Dead
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Owner Contact:</span>
                      <span className="font-semibold text-slate-800">{selectedCase.ownerName} ({selectedCase.ownerPhone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reporter:</span>
                      <span className="font-semibold text-slate-800">{selectedCase.reporterName} ({selectedCase.reporterRole})</span>
                    </div>
                    {selectedCase.symptomDurationDays && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration of Sickness:</span>
                        <span className="font-bold text-slate-800">{selectedCase.symptomDurationDays} days</span>
                      </div>
                    )}
                  </div>

                  {/* Symptoms Recorded */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Reported Symptoms ({(selectedCase.symptoms || []).length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedCase.symptoms || []).map((s, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                          <span className="font-bold text-slate-800">{s.symptomName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.severity === 'severe' ? 'bg-rose-100 text-rose-800' : s.severity === 'moderate' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {s.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Differential Ranking */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Differential Disease Ranking
                    </h4>
                    {(selectedCase.suspectedDiseases || []).map((d, i) => (
                      <div key={d.diseaseId} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                        <span className="font-bold text-slate-900">{i + 1}. {d.diseaseName}</span>
                        <span className="font-mono text-emerald-700 font-bold">{d.screeningScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: FOLLOW-UPS */}
              {caseDetailTab === 'FOLLOWUPS' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
                      Follow-Up Evolution ({(selectedCase.followUpRecords || []).length})
                    </h4>
                    <button
                      onClick={() => setIsFollowUpModalOpen(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      + Add Check-in
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {(selectedCase.followUpRecords || []).length === 0 ? (
                      <div className="text-[11px] bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-slate-400 text-center">
                        No follow-up check-ins recorded yet. Click "Log Follow-Up" to track recovery progress.
                      </div>
                    ) : (
                      (selectedCase.followUpRecords || []).map(fu => (
                        <div
                          key={fu.id}
                          className={`text-[11px] p-3 rounded-xl border space-y-1 ${
                            fu.statusUpdate === 'CRITICAL' || fu.statusUpdate === 'DECEASED' || fu.statusUpdate === 'GETTING_WORSE'
                              ? 'bg-rose-50 border-rose-200'
                              : fu.statusUpdate === 'IMPROVING'
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              {fu.statusUpdate === 'IMPROVING' ? (
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                              ) : fu.statusUpdate === 'GETTING_WORSE' || fu.statusUpdate === 'CRITICAL' ? (
                                <TrendingDown className="w-3 h-3 text-rose-600" />
                              ) : null}
                              <span className="uppercase text-[10px] tracking-wide font-black">
                                {fu.timeframe.replace('_', ' ')} • {fu.statusUpdate}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(fu.recordedAt).toLocaleDateString()}
                            </span>
                          </div>

                          {fu.notes && <p className="text-slate-700 leading-snug">{fu.notes}</p>}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>Recorded by: {fu.recordedBy}</span>
                            {fu.escalationTriggered && (
                              <span className="text-rose-600 font-bold bg-rose-100 px-1 rounded">
                                Auto-Escalated
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT TRAIL */}
              {caseDetailTab === 'AUDIT' && (
                <div className="space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Audit Trail ({(selectedCase.auditTrail || []).length} Logs)
                  </h4>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {(selectedCase.auditTrail || []).map(log => (
                      <div key={log.id} className="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{log.actorName} ({log.actorRole})</span>
                          <span className="text-slate-400 font-normal">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-600">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-xs">
              <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
              Select a case from the queue on the left to inspect differential diagnoses, order lab tests, or update status.
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedCase && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Clinical Status: ${selectedCase.caseNumber}`}
          subtitle="Transition case workflow status and record official veterinary clinical notes."
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Status *</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as CaseStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="UNDER_REVIEW">UNDER_REVIEW - Clinical Evaluation</option>
                <option value="VET_VISIT_REQUIRED">VET_VISIT_REQUIRED - Field Triage Needed</option>
                <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED - Diagnostic Sample Taken</option>
                <option value="LAB_TESTING">LAB_TESTING - Forwarded to DIAL Lab</option>
                <option value="CONFIRMED">CONFIRMED - Positive Laboratory/Clinical Diagnosis</option>
                <option value="RULED_OUT">RULED_OUT - Negative / Non-Infectious</option>
                <option value="CONTAINMENT">CONTAINMENT - Outbreak Ring Quarantine Active</option>
                <option value="RESOLVED">RESOLVED - Animal Fully Recovered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Findings & Actions *</label>
              <textarea
                required
                rows={3}
                placeholder="Enter physical exam findings, temperature, lesions observed..."
                value={statusNotes}
                onChange={e => setStatusNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Save Status Transition
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Lab Sample Order Modal */}
      {selectedCase && (
        <Modal
          isOpen={isSampleModalOpen}
          onClose={() => setIsSampleModalOpen(false)}
          title={`Order Diagnostic Lab Sample`}
          subtitle={`Case ${selectedCase.caseNumber} • ${selectedCase.species}`}
          maxWidth="lg"
        >
          <form onSubmit={handleOrderSample} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sample Specimen Type *</label>
                <select
                  value={sampleType}
                  onChange={e => setSampleType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="VESICULAR_FLUID">Vesicular Fluid / Epithelium</option>
                  <option value="NASAL_SWAB">Nasal / Pharyngeal Swab</option>
                  <option value="BLOOD_SERUM">Blood Serum Tube</option>
                  <option value="MILK_SAMPLE">Aseptic Milk Sample</option>
                  <option value="SKIN_SCRAPING">Skin Scab / Biopsy</option>
                  <option value="FECAL_SAMPLE">Fecal Sample</option>
                  <option value="TISSUE_BIOPSY">Tissue Biopsy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Test Requested *</label>
                <select
                  value={testRequested}
                  onChange={e => setTestRequested(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="RT_PCR">Molecular Real-Time RT-PCR</option>
                  <option value="ELISA">ELISA Antibody / Antigen Assay</option>
                  <option value="BACTERIAL_CULTURE">Bacterial Culture & AST</option>
                  <option value="BLOOD_SMEAR_MICROSCOPY">Blood Smear Microscopy (Giemsa)</option>
                  <option value="ANTIGEN_RAPID">Rapid Antigen Lateral Flow Strip</option>
                  <option value="SEROLOGY">Serological Agglutination</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designated Laboratory Destination *</label>
              <select
                value={labName}
                onChange={e => setLabName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Pune District Disease Investigation Lab (DIAL)">Pune District Disease Investigation Lab (DIAL)</option>
                <option value="Anand Veterinary College Diagnostic Core Lab">Anand Veterinary College Diagnostic Core Lab</option>
                <option value="National Institute of Veterinary Epidemiology (NIVEDI)">National Institute of Veterinary Epidemiology (NIVEDI)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSampleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Dispatch Sample to Lab
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription Modal */}
      {selectedCase && (
        <Modal
          isOpen={isTreatmentModalOpen}
          onClose={() => setIsTreatmentModalOpen(false)}
          title="Prescribe Veterinary Treatment & Supportive Care"
          subtitle={`Case ${selectedCase.caseNumber} • ${selectedCase.species}`}
          maxWidth="lg"
        >
          <form onSubmit={handlePrescribeTreatment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={e => setMedicineName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dosage & Frequency *</label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supportive Care & Husbandry Instructions</label>
              <textarea
                rows={2}
                value={treatmentNotes}
                onChange={e => setTreatmentNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTreatmentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Issue Prescription
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Follow-Up Logging Modal */}
      {selectedCase && (
        <Modal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          title="Log Clinical Follow-Up & Condition Tracker"
          subtitle={`Case ${selectedCase.caseNumber} • ${selectedCase.species} (${selectedCase.villageName})`}
          maxWidth="md"
        >
          <form onSubmit={handleLogFollowUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observation Timeframe *</label>
                <select
                  value={followUpTimeframe}
                  onChange={e => setFollowUpTimeframe(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="24_HOURS">24 Hours (Day 1 Check-in)</option>
                  <option value="48_HOURS">48 Hours (Day 2 Check-in)</option>
                  <option value="7_DAYS">7 Days (Weekly Review)</option>
                  <option value="CUSTOM">Ad-hoc / Custom Recheck</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Health Status *</label>
                <select
                  value={followUpStatus}
                  onChange={e => setFollowUpStatus(e.target.value as any)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden ${
                    followUpStatus === 'IMPROVING'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : followUpStatus === 'GETTING_WORSE' || followUpStatus === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="IMPROVING">IMPROVING - Lesions healing / fever subsided</option>
                  <option value="SAME">SAME - Condition stable / no change</option>
                  <option value="GETTING_WORSE">GETTING_WORSE - Symptoms intensifying (Auto-Alert)</option>
                  <option value="CRITICAL">CRITICAL - Recumbent / respiratory distress (Emergency)</option>
                  <option value="DECEASED">DECEASED - Animal expired (Mortality Alert)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Notes & Clinical Findings</label>
              <textarea
                rows={3}
                placeholder="Observed appetite, body temperature (°F), lesion healing, mobility..."
                value={followUpNotes}
                onChange={e => setFollowUpNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {(followUpStatus === 'GETTING_WORSE' || followUpStatus === 'CRITICAL') && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Automatic Escalation:</strong> Logging this deterioration will automatically flag the case priority as EMERGENCY and trigger high-priority district veterinary alerts.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Save Follow-Up Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Direct Escalation Modal */}
      {selectedCase && (
        <Modal
          isOpen={isEscalateModalOpen}
          onClose={() => setIsEscalateModalOpen(false)}
          title="Escalate Case to Emergency Veterinary Rapid Response"
          subtitle={`Case ${selectedCase.caseNumber} • ${selectedCase.species} in ${selectedCase.villageName}`}
          maxWidth="md"
        >
          <form onSubmit={handleEscalateToVet} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Escalating will instantly mark this case as <strong>EMERGENCY PRIORITY</strong> and broadcast emergency dispatch notifications to on-duty district veterinarians and state biosecurity teams.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Emergency Escalation *</label>
              <textarea
                required
                rows={3}
                value={escalateReason}
                onChange={e => setEscalateReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-rose-700 hover:bg-rose-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                Confirm Emergency Dispatch
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Credibility & Verification Modal */}
      {selectedCase && (
        <CredibilityBreakdownModal
          caseItem={selectedCase}
          currentUser={currentUser}
          isOpen={isCredibilityModalOpen}
          onClose={() => setIsCredibilityModalOpen(false)}
          onCaseUpdated={updated => {
            setSelectedCase(updated);
          }}
        />
      )}
    </div>
  );
};
