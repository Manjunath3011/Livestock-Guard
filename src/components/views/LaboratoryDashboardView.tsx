import React, { useState, useEffect } from 'react';
import {
  TestTube,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  PlusCircle,
  FileText,
  Activity,
  Send,
  Download,
  Building2,
  Microscope,
  Dna,
  ShieldAlert
} from 'lucide-react';
import { store } from '../../services/store';
import { LabSample, TestResult, Case, Alert } from '../../types';

interface LaboratoryDashboardViewProps {
  onNavigate: (module: string) => void;
}

export const LaboratoryDashboardView: React.FC<LaboratoryDashboardViewProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [samples, setSamples] = useState<LabSample[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [testResult, setTestResult] = useState<TestResult>('POSITIVE');
  const [resultDetails, setResultDetails] = useState('');
  const [remarks, setRemarks] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const refreshData = () => {
    setCurrentUser(store.getCurrentUser());
    setSamples(store.getLabSamples());
    setCases(store.getCases());
  };

  useEffect(() => {
    refreshData();
    return store.subscribe(refreshData);
  }, []);

  const handleResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample) return;

    store.submitLabResult(
      selectedSample.id,
      testResult,
      resultDetails || `${selectedSample.testRequested} confirmation for ${selectedSample.suspectedDiseaseName}: result ${testResult}.`,
      remarks
    );

    setSuccessToast(`Result for Sample ${selectedSample.sampleCode} successfully submitted and case updated!`);
    setTimeout(() => setSuccessToast(null), 4000);
    setSelectedSample(null);
    setResultDetails('');
    setRemarks('');
    refreshData();
  };

  const pendingSamples = samples.filter(s => s.status !== 'RESULT_AVAILABLE');
  const completedSamples = samples.filter(s => s.status === 'RESULT_AVAILABLE');
  const positiveSamples = samples.filter(s => s.result === 'POSITIVE');

  const filteredSamples = samples.filter(s => {
    const matchesSearch = s.sampleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.suspectedDiseaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.species.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'PENDING') return matchesSearch && s.status !== 'RESULT_AVAILABLE';
    if (filterStatus === 'COMPLETED') return matchesSearch && s.status === 'RESULT_AVAILABLE';
    if (filterStatus === 'POSITIVE') return matchesSearch && s.result === 'POSITIVE';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Microscope className="w-4 h-4 text-purple-300" />
              <span>District Animal Disease Investigation Laboratory (DIAL)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Diagnostic Lab Workbench: {currentUser.name}
            </h1>
            <p className="text-purple-100 text-sm mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-300" />
              Regional Animal Health Center, Pune • ISO/IEC 17025 Certified Bio-Safety Level 2
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('laboratory')}
              className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Accession New Sample
            </button>
            <button
              onClick={() => onNavigate('reports-analytics')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-purple-300" />
              Lab Reports & Certificates
            </button>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successToast}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Specimens</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{samples.length}</div>
            <div className="text-xs text-purple-600 font-medium mt-1">Across 4 species</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <TestTube className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending RT-PCR / ELISA</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingSamples.length}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">Under processing</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Positive Confirmations</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{positiveSamples.length}</div>
            <div className="text-xs text-rose-600 font-medium mt-1">Escalated to DHO</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Turnaround Time</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">14.5 Hours</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">Within target SLA (24h)</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Dna className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Specimen Table & Verification Workbench */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Specimen Registry & Diagnostic Result Entry
            </h2>
            <p className="text-xs text-slate-500">
              Record molecular, serological, and microbiological test results
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search sample code, disease..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                All ({samples.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'PENDING' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Pending ({pendingSamples.length})
              </button>
              <button
                onClick={() => setFilterStatus('POSITIVE')}
                className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'POSITIVE' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Positive ({positiveSamples.length})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Sample Code</th>
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Species & Type</th>
                <th className="py-3 px-4">Test Requested</th>
                <th className="py-3 px-4">Suspected Disease</th>
                <th className="py-3 px-4">Status / Result</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSamples.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {s.sampleCode}
                  </td>
                  <td className="py-3.5 px-4 text-purple-600 font-medium">
                    {s.caseNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{s.species}</span>
                    <div className="text-[11px] text-slate-400">{s.sampleType.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-mono text-[11px]">
                      {s.testRequested}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {s.suspectedDiseaseName}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.result === 'POSITIVE' ? (
                      <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        POSITIVE CONFIRMED
                      </span>
                    ) : s.result === 'NEGATIVE' ? (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        NEGATIVE / RULED OUT
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        TESTING IN PROGRESS
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {s.status !== 'RESULT_AVAILABLE' ? (
                      <button
                        onClick={() => {
                          setSelectedSample(s);
                          setTestResult('POSITIVE');
                          setResultDetails(`Positive for ${s.suspectedDiseaseName} viral/bacterial RNA via ${s.testRequested}. Cycle threshold (Ct): 21.4.`);
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs"
                      >
                        Enter Result
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Certified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Entry Modal */}
      {selectedSample && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Enter Diagnostic Result
                </h3>
              </div>
              <span className="text-xs font-mono bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded font-bold">
                {selectedSample.sampleCode}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Specimen: {selectedSample.species} ({selectedSample.sampleType.replace('_', ' ')}) • Case: {selectedSample.caseNumber}
            </p>

            <form onSubmit={handleResultSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Test Outcome
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'] as TestResult[]).map(res => (
                    <button
                      type="button"
                      key={res}
                      onClick={() => setTestResult(res)}
                      className={`p-2.5 text-xs font-bold rounded-xl border text-center transition ${
                        testResult === res
                          ? res === 'POSITIVE'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : res === 'NEGATIVE'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantification / Ct Value / Diagnostic Details
                </label>
                <input
                  type="text"
                  value={resultDetails}
                  onChange={e => setResultDetails(e.target.value)}
                  placeholder="E.g., Target gene amplified, Ct=19.8, confirmed Serotype O."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Remarks & Reagent Lot #
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Reagent Batch #LT-2026-FMD-4, Positive control valid, tested by Senior Pathologist."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {testResult === 'POSITIVE' && (
                <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>
                    <strong>Automatic Escalation Notice:</strong> Submitting a POSITIVE confirmation will immediately update the clinical case to CONFIRMED and broadcast a priority alert to the District Veterinary Officer and State Directorate.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSample(null)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl shadow"
                >
                  Submit & Certify Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
