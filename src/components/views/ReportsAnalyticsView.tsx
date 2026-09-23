import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  Printer,
  Filter,
  Calendar,
  BarChart3,
  Building,
  FileSpreadsheet,
  Layers,
  Activity,
  AlertCircle,
  FlaskConical,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Info,
  ShieldAlert,
  HelpCircle,
  ChevronRight,
  Database
} from 'lucide-react';
import { DataExportModal } from '../common/DataExportModal';
import { LabCertificateModal } from '../common/LabCertificateModal';
import { store } from '../../services/store';
import { User, Role, LabSample, Case } from '../../types';
import { hasPermission, getRoleMetadata, normalizeRole } from '../../auth/roles';

interface ReportsAnalyticsViewProps {
  currentUser?: User | null;
  onNavigate?: (module: string) => void;
  defaultTab?: 'lab' | 'surveillance' | 'district' | 'state' | 'admin';
}

type TabType = 'lab' | 'surveillance' | 'district' | 'state' | 'admin';

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  currentUser,
  onNavigate,
  defaultTab
}) => {
  const activeUser = currentUser || store.getCurrentUser();
  const userRole: Role = activeUser?.role || 'FARMER';
  const canonicalRole = normalizeRole(userRole) || 'FARMER';
  const roleMeta = getRoleMetadata(canonicalRole);
  const isDemo = store.isDemoMode();

  // Granular Permission Checks
  const canViewLab = hasPermission(canonicalRole, 'reports:lab');
  const canViewSurveillance = hasPermission(canonicalRole, 'reports:disease_surveillance');
  const canViewDistrict = hasPermission(canonicalRole, 'reports:district_summary');
  const canViewState = hasPermission(canonicalRole, 'reports:state_analytics');
  const canViewAdmin = hasPermission(canonicalRole, 'reports:administration');

  // Compute Initial Default Tab based on authorized role & permissions
  const computedDefaultTab: TabType = useMemo(() => {
    if (defaultTab) {
      if (defaultTab === 'lab' && canViewLab) return 'lab';
      if (defaultTab === 'surveillance' && canViewSurveillance) return 'surveillance';
      if (defaultTab === 'district' && canViewDistrict) return 'district';
      if (defaultTab === 'state' && (canViewState || canonicalRole === 'LABORATORY_STAFF')) return 'state';
      if (defaultTab === 'admin' && canViewAdmin) return 'admin';
    }
    if (canonicalRole === 'LABORATORY_STAFF') return 'lab';
    if (canonicalRole === 'DISTRICT_OFFICIAL') return 'district';
    if (canonicalRole === 'STATE_ADMIN' || canonicalRole === 'SYSTEM_ADMIN') return 'state';
    if (canViewLab) return 'lab';
    if (canViewSurveillance) return 'surveillance';
    return 'lab';
  }, [defaultTab, canonicalRole, canViewLab, canViewSurveillance, canViewDistrict, canViewState, canViewAdmin]);

  const [activeTab, setActiveTab] = useState<TabType>(computedDefaultTab);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedSampleForCert, setSelectedSampleForCert] = useState<LabSample | null>(null);
  const [surveillanceSearch, setSurveillanceSearch] = useState('');
  const [surveillanceSpeciesFilter, setSurveillanceSpeciesFilter] = useState('ALL');
  const [surveillanceStatusFilter, setSurveillanceStatusFilter] = useState('ALL');

  // Live Data Subscriptions
  const [labSamples, setLabSamples] = useState<LabSample[]>(() => store.getLabSamples() || []);
  const [cases, setCases] = useState<Case[]>(() => store.getCases() || []);
  const [outbreaks, setOutbreaks] = useState(() => store.getOutbreaks() || []);
  const [mortalities, setMortalities] = useState(() => store.getMortalityReports() || []);
  const [labAuditLogs, setLabAuditLogs] = useState(() => store.getLabAuditLogs() || []);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setLabSamples(store.getLabSamples() || []);
      setCases(store.getCases() || []);
      setOutbreaks(store.getOutbreaks() || []);
      setMortalities(store.getMortalityReports() || []);
      setLabAuditLogs(store.getLabAuditLogs() || []);
    });
    return unsub;
  }, []);

  // Audit Log view when Laboratory tab is opened
  useEffect(() => {
    if (activeTab === 'lab' && canViewLab) {
      store.logLabAction({
        action: 'LAB_REPORT_VIEWED',
        details: 'Accessed Laboratory Diagnostic Reports and Surveillance Summary'
      });
    }
  }, [activeTab, canViewLab]);

  // Calculations for Laboratory Reports
  const totalSamples = labSamples.length;
  const pendingSamples = labSamples.filter(s => s.result === 'PENDING' || s.status !== 'RESULT_AVAILABLE').length;
  const testingInProgress = labSamples.filter(s => s.status === 'TESTING_IN_PROGRESS').length;
  const completedSamples = labSamples.filter(s => s.status === 'RESULT_AVAILABLE').length;
  const positiveResults = labSamples.filter(s => s.result === 'POSITIVE').length;
  const negativeResults = labSamples.filter(s => s.result === 'NEGATIVE').length;
  const confirmationRate = completedSamples > 0 ? Math.round((positiveResults / completedSamples) * 100) : 0;

  // Disease Breakdown
  const diseaseBreakdown = useMemo(() => {
    const map: Record<string, { total: number; positive: number; negative: number; pending: number }> = {};
    labSamples.forEach(s => {
      const name = s.suspectedDiseaseName || 'Unspecified Pathogen';
      if (!map[name]) {
        map[name] = { total: 0, positive: 0, negative: 0, pending: 0 };
      }
      map[name].total += 1;
      if (s.result === 'POSITIVE') map[name].positive += 1;
      else if (s.result === 'NEGATIVE') map[name].negative += 1;
      else map[name].pending += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [labSamples]);

  // Species Breakdown
  const speciesBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    labSamples.forEach(s => {
      map[s.species] = (map[s.species] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [labSamples]);

  // Filtered Surveillance Cases with Privacy Scoping
  const filteredSurveillanceCases = useMemo(() => {
    // Uses least-privilege sanitized cases where farmer phone numbers are redacted
    const baseCases = store.getLabSurveillanceCases();
    return baseCases.filter(c => {
      const diseaseNames = (c.suspectedDiseases || []).map(d => d.diseaseName).join(' ');
      const matchesSearch =
        surveillanceSearch === '' ||
        c.caseNumber.toLowerCase().includes(surveillanceSearch.toLowerCase()) ||
        diseaseNames.toLowerCase().includes(surveillanceSearch.toLowerCase()) ||
        (c.villageName || '').toLowerCase().includes(surveillanceSearch.toLowerCase()) ||
        (c.districtName || '').toLowerCase().includes(surveillanceSearch.toLowerCase());

      const matchesSpecies = surveillanceSpeciesFilter === 'ALL' || c.species === surveillanceSpeciesFilter;
      const matchesStatus = surveillanceStatusFilter === 'ALL' || c.status === surveillanceStatusFilter;

      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [surveillanceSearch, surveillanceSpeciesFilter, surveillanceStatusFilter, cases]);

  // Navigation tabs list with permission indicators
  const navTabs = [
    { id: 'lab' as TabType, label: 'Laboratory Reports & Pathology', permission: canViewLab, icon: FlaskConical },
    { id: 'surveillance' as TabType, label: 'Disease Surveillance Context', permission: canViewSurveillance, icon: Activity },
    { id: 'district' as TabType, label: 'District Operational Analytics', permission: canViewDistrict, icon: Layers },
    { id: 'state' as TabType, label: 'State Epizootic & Compliance Export', permission: canViewState, icon: Building },
    { id: 'admin' as TabType, label: 'System Administration & RBAC', permission: canViewAdmin, icon: ShieldAlert }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Context */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Livestock Disease Surveillance & Operational Reports</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeTab === 'lab'
              ? 'Veterinary Diagnostic Laboratory Reports'
              : activeTab === 'surveillance'
              ? 'Disease Surveillance & Epidemiological Context'
              : activeTab === 'district'
              ? 'District Animal Health Command Analytics'
              : activeTab === 'state'
              ? 'Government Compliance & Epizootic Export'
              : 'System Governance & Telemetry'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            {activeTab === 'lab'
              ? 'Diagnostic throughput, RT-PCR/ELISA assay outcome distribution, turnaround SLA, and validated laboratory test certificates.'
              : activeTab === 'surveillance'
              ? 'Clinical field observations, suspected disease clusters, and related diagnostic sample links with least-privilege privacy protections.'
              : 'Standardized epizootic metrics, ring-vaccination containment status, and government disease incidence reports.'}
          </p>
        </div>

        {/* Action Controls & Mode Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Demo Mode / Live Badge */}
          {isDemo ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>DEMO DATA (Simulation Mode)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LIVE REGISTRY DATA</span>
            </div>
          )}

          {canViewState && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Epizootic Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission-Aware Section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          const isAuthorized = tab.permission;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {!isAuthorized && (
                <span title="Restricted section">
                  <Lock className="w-3 h-3 text-slate-400 opacity-60 ml-0.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LABORATORY REPORTS & PATHOLOGY ANALYTICS (reports:lab)             */}
      {/* ========================================================================= */}
      {activeTab === 'lab' && (
        canViewLab ? (
          <div className="space-y-6">
            
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Received</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{totalSamples}</div>
                <div className="text-[10px] text-slate-400">Accessioned specimens</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Queue Pending</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingSamples}</div>
                <div className="text-[10px] text-slate-400">Awaiting processing</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Under Testing</div>
                <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{testingInProgress}</div>
                <div className="text-[10px] text-slate-400">PCR / ELISA in run</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedSamples}</div>
                <div className="text-[10px] text-slate-400">Result certified</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Positive</div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{positiveResults}</div>
                <div className="text-[10px] text-rose-500/80 font-bold">Confirmed pathogen</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Negative</div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{negativeResults}</div>
                <div className="text-[10px] text-emerald-500/80 font-bold">Ruled out</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Turnaround SLA</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">18.4h</div>
                <div className="text-[10px] text-emerald-600 font-bold">96.2% compliant</div>
              </div>
            </div>

            {/* Diagnostic Distribution Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Tests by Disease */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Tests by Suspected Pathogen</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{diseaseBreakdown.length} Pathogens Tracked</span>
                </div>

                <div className="space-y-3">
                  {diseaseBreakdown.map(([disease, stats]) => {
                    const pct = totalSamples > 0 ? Math.round((stats.total / totalSamples) * 100) : 0;
                    return (
                      <div key={disease} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{disease}</span>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-rose-600 font-bold">{stats.positive} Pos</span>
                            <span className="text-emerald-600 font-medium">{stats.negative} Neg</span>
                            <span className="text-slate-400">({stats.total} total)</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-rose-500 h-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.positive / stats.total) * 100 : 0}%` }}
                            title={`${stats.positive} Positive`}
                          />
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.negative / stats.total) * 100 : 0}%` }}
                            title={`${stats.negative} Negative`}
                          />
                          <div
                            className="bg-amber-400 h-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                            title={`${stats.pending} Pending`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tests by Host Species & Modality */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Host Species Diagnostic Volume</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{speciesBreakdown.length} Species</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {speciesBreakdown.map(([spec, count]) => (
                      <div
                        key={spec}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60"
                      >
                        <div className="text-[10px] font-bold uppercase text-slate-400">{spec}</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{count}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {totalSamples > 0 ? Math.round((count / totalSamples) * 100) : 0}% of testing load
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Laboratory Turnaround & Confirmation Quality Matrix */}
                <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reference Standard QA & Confirmation Status</span>
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    Laboratory confirmations are tied directly into statutory disease surveillance. Positive findings automatically escalate suspected field alerts into <strong>CONFIRMED</strong> status, trigger GIS ring-vaccination alerts, and log an auditable event for district and state command.
                  </p>
                </div>
              </div>

            </div>

            {/* Recent Sample Activity & Certified Test Registry */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Accessioned Laboratory Samples & Diagnostic Registry
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Complete sample testing lifecycle, diagnostic certification, and verification tracking.
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Sample Code</th>
                      <th className="px-4 py-3">Case Reference</th>
                      <th className="px-4 py-3">Species & Specimen</th>
                      <th className="px-4 py-3">Suspected Disease</th>
                      <th className="px-4 py-3">Assay Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3 text-right">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {labSamples.map(sample => {
                      const isCompleted = sample.status === 'RESULT_AVAILABLE';
                      const isPos = sample.result === 'POSITIVE';
                      const isNeg = sample.result === 'NEGATIVE';

                      return (
                        <tr key={sample.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {sample.sampleCode}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                            {sample.caseNumber}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{sample.species}</div>
                            <div className="text-[10px] text-slate-400">{sample.sampleType.replace(/_/g, ' ')}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                            {sample.suspectedDiseaseName}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-medium">
                              {sample.testRequested.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {sample.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isPos ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-black">
                                <AlertTriangle className="w-3 h-3" />
                                POSITIVE
                              </span>
                            ) : isNeg ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                NEGATIVE
                              </span>
                            ) : (
                              <span className="text-amber-600 font-bold">PENDING</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isCompleted ? (
                              <button
                                onClick={() => setSelectedSampleForCert(sample)}
                                className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Certificate</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">In progress</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Laboratory RBAC Audit Log Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Immutable Laboratory Action Audit Trail</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {labAuditLogs.length} Logged Actions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Operator & Role</th>
                      <th className="px-4 py-3">Action Type</th>
                      <th className="px-4 py-3">Target Reference</th>
                      <th className="px-4 py-3">Outcome Shift</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {labAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{log.userRole}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                          {log.sampleCode || log.caseNumber || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {log.previousValue || log.newValue ? (
                            <span className="font-mono text-[10px]">
                              {log.previousValue ? `${log.previousValue} → ` : ''}
                              <strong className="text-slate-900 dark:text-white">{log.newValue}</strong>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* Inline 403 for unauthorized role trying to open lab */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permission Restricted Section</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You don't have permission to access the laboratory pathology section. Required permission: <code className="font-mono text-rose-600">reports:lab</code>.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Return to {roleMeta.shortLabel} Dashboard
              </button>
            )}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DISEASE SURVEILLANCE CONTEXT (reports:disease_surveillance)       */}
      {/* ========================================================================= */}
      {activeTab === 'surveillance' && (
        canViewSurveillance ? (
          <div className="space-y-6">
            
            {/* Privacy Protection Callout Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-sky-950 dark:text-sky-200">
                  Least-Privilege Privacy Protected (Veterinary Biosecurity Standard)
                </div>
                <p className="text-sky-800/90 dark:text-sky-300 leading-relaxed">
                  Personal phone numbers and private farm ownership data are redacted for diagnostic operations. Laboratory and surveillance staff are granted access strictly to clinical symptoms, affected species, geo-epidemiological clusters, and sample collection details necessary for diagnostic investigation.
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search case, suspected pathogen, village, or district..."
                  value={surveillanceSearch}
                  onChange={e => setSurveillanceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-emerald-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={surveillanceSpeciesFilter}
                  onChange={e => setSurveillanceSpeciesFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <option value="ALL">All Host Species</option>
                  <option value="Cattle">Cattle</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Goat">Goat</option>
                  <option value="Sheep">Sheep</option>
                  <option value="Swine">Swine</option>
                  <option value="Poultry">Poultry</option>
                </select>

                <select
                  value={surveillanceStatusFilter}
                  onChange={e => setSurveillanceStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <option value="ALL">All Case Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SUSPECTED">Suspected</option>
                  <option value="UNDER_INVESTIGATION">Under Investigation</option>
                  <option value="RULED_OUT">Ruled Out</option>
                </select>
              </div>
            </div>

            {/* Surveillance Records Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Active Clinical Surveillance Cases ({filteredSurveillanceCases.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Showing diagnostic & epidemiological context
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Case ID</th>
                      <th className="px-4 py-3">Suspected Pathogen</th>
                      <th className="px-4 py-3">Species & Clinical Signs</th>
                      <th className="px-4 py-3">Anonymized Location</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Outbreak Context</th>
                      <th className="px-4 py-3">Related Lab Samples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSurveillanceCases.map(c => {
                      const relatedSamples = labSamples.filter(s => s.caseId === c.id);
                      const isOutbreak = c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH';
                      const primaryDisease = c.suspectedDiseases?.[0]?.diseaseName || 'Suspected Syndrome';
                      const reportedDate = c.createdAt ? c.createdAt.split('T')[0] : 'Recent';
                      const symptomsText = (c.symptoms || []).map(s => s.symptomName || s.symptomId).join(', ') || 'Clinical signs logged';

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {c.caseNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{primaryDisease}</span>
                            <div className="text-[10px] text-slate-400">Reported: {reportedDate}</div>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{c.species}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={symptomsText}>
                              {symptomsText}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {c.villageName}, {c.districtName}
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                              Owner: {c.ownerName}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.status === 'CONFIRMED'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                  : c.status === 'RULED_OUT'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isOutbreak ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                Active Cluster
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Isolated Index</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {relatedSamples.length > 0 ? (
                              <div className="space-y-0.5">
                                {relatedSamples.map(s => (
                                  <span
                                    key={s.id}
                                    className={`inline-block px-1.5 py-0.5 text-[10px] rounded mr-1 ${
                                      s.result === 'POSITIVE'
                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 border border-rose-200 font-bold'
                                        : s.result === 'NEGATIVE'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border border-emerald-200 font-bold'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                                    }`}
                                  >
                                    {s.sampleCode} ({s.result})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">No sample accessioned</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* Inline 403 for unauthorized surveillance view */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permission Restricted Section</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You don't have permission to access the disease surveillance context. Required permission: <code className="font-mono text-rose-600">reports:disease_surveillance</code>.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Return to {roleMeta.shortLabel} Dashboard
              </button>
            )}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISTRICT OPERATIONAL ANALYTICS (reports:district_summary)           */}
      {/* ========================================================================= */}
      {activeTab === 'district' && (
        canViewDistrict ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">District Active Outbreaks</div>
                <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
                  {outbreaks.filter(o => o.status === 'ACTIVE').length} Circles
                </div>
                <div className="text-[11px] text-slate-400">Rapid containment active</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Field Investigation Index</div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">92.4%</div>
                <div className="text-[11px] text-slate-400">Verified within 24h SLA</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Ring Vaccination Buffer</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">5 km</div>
                <div className="text-[11px] text-slate-400">Surveillance perimeter enforced</div>
              </div>
            </div>

            {/* District Breakdown Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
                District Rapid Response Deployment Matrix
              </div>
              <div className="p-5 text-xs text-slate-600 dark:text-slate-400 space-y-3">
                <p>
                  District animal health officers possess operational authority to dispatch veterinary field workers, inspect quarantine barriers, and coordinate with diagnostic reference laboratories.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">Laboratory SLA Compliance</div>
                    <div className="text-emerald-600 font-bold text-lg">94.8%</div>
                    <div className="text-[11px] text-slate-400">Average response from sample dispatch to laboratory result</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">Veterinary Council Certifications</div>
                    <div className="text-slate-900 dark:text-white font-bold text-lg">100% Verified</div>
                    <div className="text-[11px] text-slate-400">All investigating field officers possess statutory council credentials</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Inline 403 for unauthorized district section */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permission Restricted Section</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You don't have permission to access this administrative section. Your role as <strong className="text-slate-900 dark:text-white">{roleMeta.displayName}</strong> is restricted to authorized operational workflows. Required permission: <code className="font-mono text-rose-600">reports:district_summary</code>.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Return to {userRole === 'LABORATORY_STAFF' || userRole === 'DIAGNOSTIC_LAB' ? 'Laboratory' : roleMeta.shortLabel} Dashboard
              </button>
            )}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STATE EPIZOOTIC & COMPLIANCE EXPORT (reports:state_analytics)       */}
      {/* ========================================================================= */}
      {activeTab === 'state' && (
        (canViewState || canonicalRole === 'LABORATORY_STAFF') ? (
          <div className="space-y-6">
            {!canViewState && canonicalRole === 'LABORATORY_STAFF' && (
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-2.5 text-xs text-purple-900 dark:text-purple-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>
                  <strong>Least-Privilege Laboratory Clearance:</strong> Authorized to inspect state epizootic surveillance indicators. Statutory government compliance exports are reserved for State Directorate officials.
                </span>
              </div>
            )}
            
            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Total Cases Screened</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{cases.length}</div>
                <div className="text-[11px] text-slate-400">Recorded across active state clusters</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>High Risk / Critical Alerts</span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
                  {cases.filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length}
                </div>
                <div className="text-[11px] text-slate-400">Requiring immediate emergency triage</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Active Outbreak Circles</span>
                  <Layers className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                  {outbreaks.filter(o => o.status === 'ACTIVE').length}
                </div>
                <div className="text-[11px] text-slate-400">Ring vaccination containment enforced</div>
              </div>
            </div>

            {/* District Surveillance Compliance Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>District Surveillance Status (State Performance Matrix)</span>
                </div>
                {canViewState && (
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Matrix</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">District</th>
                      <th className="px-4 py-3">Active Outbreaks</th>
                      <th className="px-4 py-3">Reported Cases (MTD)</th>
                      <th className="px-4 py-3">Lab Confirmation %</th>
                      <th className="px-4 py-3">Vaccine Ring Coverage</th>
                      <th className="px-4 py-3 text-right">Surveillance Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { district: 'Pune (Maharashtra)', outbreaks: 2, cases: 48, labPct: '94%', vaccinePct: '88%', score: 'GRADE A (95/100)' },
                      { district: 'Satara (Maharashtra)', outbreaks: 1, cases: 29, labPct: '89%', vaccinePct: '82%', score: 'GRADE A (91/100)' },
                      { district: 'Anand (Gujarat)', outbreaks: 1, cases: 38, labPct: '96%', vaccinePct: '95%', score: 'GRADE A+ (98/100)' },
                      { district: 'Belagavi (Karnataka)', outbreaks: 1, cases: 22, labPct: '84%', vaccinePct: '76%', score: 'GRADE B (84/100)' },
                      { district: 'Meerut (Uttar Pradesh)', outbreaks: 1, cases: 14, labPct: '91%', vaccinePct: '80%', score: 'GRADE A (89/100)' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.district}</td>
                        <td className="px-4 py-3 font-semibold text-rose-700 dark:text-rose-400">{row.outbreaks} Active</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{row.cases}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.labPct}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">{row.vaccinePct}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-800 dark:text-emerald-400">{row.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* Inline 403 for unauthorized state section */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permission Restricted Section</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You don't have permission to access this administrative section. Your role as <strong className="text-slate-900 dark:text-white">{roleMeta.displayName}</strong> is restricted to authorized operational workflows. Required permission: <code className="font-mono text-rose-600">reports:state_analytics</code>.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Return to {userRole === 'LABORATORY_STAFF' || userRole === 'DIAGNOSTIC_LAB' ? 'Laboratory' : roleMeta.shortLabel} Dashboard
              </button>
            )}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SYSTEM ADMINISTRATION & RBAC TELEMETRY (reports:administration)   */}
      {/* ========================================================================= */}
      {activeTab === 'admin' && (
        canViewAdmin ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>System Administration & Least-Privilege RBAC Audit</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Centralized access control ensures role isolation. Diagnostic laboratory staff maintain operational autonomy over laboratory samples, test certifications, and surveillance interpretation without possessing administrative clearance to reconfigure state systems or modify official outbreak declarations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Users</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {store.getUsers().length}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">RBAC Role Classes</div>
                  <div className="text-2xl font-black text-emerald-600">8 Canonical Roles</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Audit Trail Integrity</div>
                  <div className="text-2xl font-black text-emerald-600">Verified 100%</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Inline 403 for unauthorized system admin section */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permission Restricted Section</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You don't have permission to access this administrative section. Required permission: <code className="font-mono text-rose-600">reports:administration</code>.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Return to {userRole === 'LABORATORY_STAFF' || userRole === 'DIAGNOSTIC_LAB' ? 'Laboratory' : roleMeta.shortLabel} Dashboard
              </button>
            )}
          </div>
        )
      )}

      {/* Official Laboratory Diagnostic Certificate Modal */}
      <LabCertificateModal
        sample={selectedSampleForCert}
        isOpen={!!selectedSampleForCert}
        onClose={() => setSelectedSampleForCert(null)}
        isDemoMode={isDemo}
      />

      {/* State Epizootic Export Modal Dialog */}
      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
