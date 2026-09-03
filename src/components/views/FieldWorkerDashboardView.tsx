import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  Syringe,
  TestTube,
  Skull,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Shield,
  ShieldCheck,
  Send,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { store } from '../../services/store';
import { FieldVisit, Case, Animal, Alert, LabSample, OfflineSyncItem } from '../../types';
import { CredibilityBadge } from '../common/CredibilityBadge';
import { CredibilityBreakdownModal } from '../common/CredibilityBreakdownModal';

interface FieldWorkerDashboardViewProps {
  onNavigate: (module: string) => void;
}

export const FieldWorkerDashboardView: React.FC<FieldWorkerDashboardViewProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [labSamples, setLabSamples] = useState<LabSample[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>([]);
  const [isOffline, setIsOffline] = useState(store.isOffline());
  const [selectedVisit, setSelectedVisit] = useState<FieldVisit | null>(null);
  const [visitNotes, setVisitNotes] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [selectedCaseForVerification, setSelectedCaseForVerification] = useState<Case | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const refreshData = () => {
    setCurrentUser(store.getCurrentUser());
    setFieldVisits(store.getScopedFieldVisits());
    setCases(store.getScopedCases());
    setAlerts(store.getScopedAlerts());
    setLabSamples(store.getScopedLabSamples());
    setOfflineQueue(store.getOfflineQueue());
    setIsOffline(store.isOffline());
  };

  useEffect(() => {
    refreshData();
    return store.subscribe(refreshData);
  }, []);

  const handleStatusChange = (visitId: string, status: 'IN_PROGRESS' | 'COMPLETED') => {
    store.updateFieldVisitStatus(visitId, status, visitNotes);
    setSelectedVisit(null);
    setVisitNotes('');
    refreshData();
  };

  const handleSync = () => {
    const result = store.syncPendingOfflineRecords();
    setSyncStatusMsg(`Synchronized ${result.count} record(s) with Central Server.`);
    setTimeout(() => setSyncStatusMsg(null), 4000);
    refreshData();
  };

  const scheduledVisits = (fieldVisits || []).filter(v => v.status === 'SCHEDULED' || v.status === 'IN_PROGRESS');
  const completedVisits = (fieldVisits || []).filter(v => v.status === 'COMPLETED');
  const pendingSamples = (labSamples || []).filter(s => s.status === 'RECEIVED_AT_LAB' || s.status === 'IN_TRANSIT');

  const casesToVerify = (cases || []).filter(
    c => c.verificationState !== 'VET_VERIFIED' && c.verificationState !== 'LAB_CONFIRMED' && c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  );
  const urgentVerificationCases = casesToVerify.filter(c => c.isCriticalUrgentVerification);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900 to-blue-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Para-Veterinary & Field Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Beat Duty: {currentUser?.name || 'Field Worker'}
            </h1>
            <p className="text-cyan-100 text-sm mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-300" />
              Jurisdiction: Baramati Beat (Malegaon, Shirsuphal, Vithalwadi) • Zone 2
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('report-case')}
              className="bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              New Field Case Report
            </button>
            <button
              onClick={() => onNavigate('laboratory')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-sm flex items-center gap-2"
            >
              <TestTube className="w-4 h-4 text-cyan-300" />
              Collect Sample
            </button>
          </div>
        </div>
      </div>

      {/* Offline Status & Sync Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOffline ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
            {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>{isOffline ? 'Offline Mode Active (Field Simulated)' : 'Connected to Central Disease Registry'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${(offlineQueue || []).length > 0 ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
                {(offlineQueue || []).length} Pending Sync
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {(offlineQueue || []).length > 0
                ? `${(offlineQueue || []).length} case records or samples captured offline awaiting upload.`
                : 'All local field data is synchronized with the district central registry.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => store.toggleOfflineMode()}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isOffline ? 'Go Online' : 'Simulate Offline'}
          </button>
          {(offlineQueue || []).length > 0 && (
            <button
              onClick={handleSync}
              className="text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Now
            </button>
          )}
        </div>
      </div>

      {syncStatusMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {syncStatusMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Scheduled Visits Today</span>
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{(scheduledVisits || []).length}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">{(completedVisits || []).length} completed</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Beat Active Cases</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{(cases || []).length}</div>
            <div className="text-xs text-rose-600 font-medium mt-1">
              {(cases || []).filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length} High/Critical
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Samples Collected</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{(labSamples || []).length}</div>
            <div className="text-xs text-blue-600 font-medium mt-1">{(pendingSamples || []).length} in transit/testing</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <TestTube className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cold Chain / Buffer Kit</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">4.2°C (Optimal)</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">150 FMD Vials Ready</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Field Task Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Today's Field Duty & Investigation Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Priority visits assigned by District Polyclinic
                </p>
              </div>
              <button
                onClick={() => onNavigate('testing-center')}
                className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
              >
                + Add Scheduled Visit
              </button>
            </div>

            <div className="space-y-3">
              {fieldVisits.map(v => (
                <div
                  key={v.id}
                  className={`p-4 rounded-xl border transition-all ${
                    v.status === 'COMPLETED'
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80'
                      : v.priority === 'EMERGENCY' || v.priority === 'HIGH'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {v.visitCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                          v.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {v.priority}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                          {v.purpose.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          v.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {v.status}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 flex items-center gap-2">
                        <span>{v.farmName}</span> • <span className="text-slate-500 font-normal">{v.villageName}</span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Farmer: <span className="font-semibold">{v.farmerName}</span> ({v.farmerPhone}) • Slot: <span className="font-semibold text-cyan-600">{v.scheduledTime}</span>
                      </div>

                      {v.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                          "{v.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {v.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleStatusChange(v.id, 'IN_PROGRESS')}
                          className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          Start Visit
                        </button>
                      )}
                      {v.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => setSelectedVisit(v)}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </button>
                      )}
                      {v.status === 'COMPLETED' && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disease Case Ground Verification Queue */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Clinical Case Ground Truth Verification
                </h2>
                <p className="text-xs text-slate-500">
                  Ground inspection, photographic symptom confirmation, and location verification
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
                {casesToVerify.length} Awaiting Ground Review
              </span>
            </div>

            {urgentVerificationCases.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Urgent Verification Mandatory:</strong>
                  <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                    {urgentVerificationCases.length} case(s) flagged for acute symptom urgency or herd mortality. Verification bypasses routine credibility suppression to ensure zero outbreak containment delays.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {casesToVerify.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  All active cases in your beat have completed ground verification.
                </div>
              ) : (
                casesToVerify.map(c => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border transition-all ${
                      c.isCriticalUrgentVerification
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {c.caseNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {c.species} • {c.villageName}
                          </span>
                          <CredibilityBadge
                            score={c.credibilityScore}
                            tier={c.credibilityTier}
                            verificationState={c.verificationState}
                            isUrgent={c.isCriticalUrgentVerification}
                            size="sm"
                          />
                        </div>

                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mt-1.5">
                          Suspected: {c.suspectedDiseases?.[0]?.diseaseName || 'Clinical Examination Needed'}
                        </p>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Reported by: <span className="font-medium text-slate-700 dark:text-slate-300">{c.reporterName}</span> ({c.reporterRole}) • Farmer: <span className="font-medium">{c.ownerName}</span> ({c.ownerPhone})
                        </div>

                        {c.urgentReason && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
                            ⚡ {c.urgentReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => {
                            setSelectedCaseForVerification(c);
                            setIsVerificationModalOpen(true);
                          }}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verify on Ground
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Field Forms & Actions */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Field Operations Toolkit
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('report-case')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-cyan-600" />
                  Intake New Clinical Case
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('laboratory')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-blue-600" />
                  Sample Packaging & Referral
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('vaccinations')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-emerald-600" />
                  Log Field Vaccination Dose
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('mortality')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-rose-600" />
                  Carcass / Mortality Verification
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Village Beat Hotspots */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              Village Surveillance Beat
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-900 dark:text-rose-200">Malegaon Budruk</div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400">3 FMD Suspects • Ring radius 5km</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800">
                  HOTSPOT
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Shirsuphal</div>
                  <div className="text-[11px] text-slate-500">1 PPR Suspect • 45 small ruminants</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">
                  MONITORED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Complete Field Visit: {selectedVisit.visitCode}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording completion for {selectedVisit.farmName} ({selectedVisit.villageName}).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Field Findings & Action Summary
                </label>
                <textarea
                  rows={3}
                  value={visitNotes}
                  onChange={e => setVisitNotes(e.target.value)}
                  placeholder="E.g., Inspected 3 cows, collected vesicular swab, administered antibiotic & oral antiseptic wash."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange(selectedVisit.id, 'COMPLETED')}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl shadow"
                >
                  Confirm Completion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ground Verification & Credibility Audit Modal */}
      {selectedCaseForVerification && (
        <CredibilityBreakdownModal
          caseItem={selectedCaseForVerification}
          currentUser={currentUser}
          isOpen={isVerificationModalOpen}
          initialAction="FIELD_VERIFY"
          onClose={() => {
            setIsVerificationModalOpen(false);
            setSelectedCaseForVerification(null);
          }}
          onCaseUpdated={updated => {
            setSelectedCaseForVerification(updated);
            refreshData();
          }}
        />
      )}
    </div>
  );
};
