import React, { useState } from 'react';
import { LabSample, TestResult, User } from '../../types';
import { store } from '../../services/store';
import { Modal } from '../common/Modal';
import { FlaskConical, CheckCircle2, XCircle, Clock, Search, Filter, ShieldAlert, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LaboratoryViewProps {
  samples: LabSample[];
  currentUser: User;
}

export const LaboratoryView: React.FC<LaboratoryViewProps> = ({ samples, currentUser }) => {
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>('POSITIVE');
  const [resultDetails, setResultDetails] = useState('Viral genome detected via RT-PCR (Ct = 21.4). Serotype O confirmed.');
  const [remarks, setRemarks] = useState('High viral load. Immediate ring containment recommended.');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredSamples = samples.filter(s => {
    if (statusFilter !== 'ALL' && s.result !== statusFilter) return false;
    return true;
  });

  const handleLogResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample) return;

    store.submitLabResult(selectedSample.id, testResult, resultDetails, remarks);

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}

    setIsResultModalOpen(false);
    setSelectedSample(null);
  };

  const getResultBadge = (res: TestResult) => {
    switch (res) {
      case 'POSITIVE':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2.5 py-0.5 rounded-full text-xs">POSITIVE</span>;
      case 'NEGATIVE':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-xs">NEGATIVE</span>;
      case 'INCONCLUSIVE':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs">INCONCLUSIVE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2.5 py-0.5 rounded-full text-xs animate-pulse">PENDING</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            Veterinary Disease Investigation Laboratory (DIAL)
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Sample Testing Queue ({(samples || []).length} Samples)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accession molecular swabs, perform RT-PCR & ELISA assays, and submit confirmed diagnostic results.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
        >
          <option value="ALL">All Diagnostic Outcomes</option>
          <option value="PENDING">Pending In-Lab Testing</option>
          <option value="POSITIVE">Positive Results (Confirmed)</option>
          <option value="NEGATIVE">Negative (Ruled Out)</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Sample Barcode</th>
                <th className="px-4 py-3.5">Species / Specimen</th>
                <th className="px-4 py-3.5">Assay Requested</th>
                <th className="px-4 py-3.5">Suspected Pathogen</th>
                <th className="px-4 py-3.5">Lab Facility</th>
                <th className="px-4 py-3.5">Outcome</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSamples.map(sample => (
                <tr key={sample.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-purple-950">
                    {sample.sampleCode}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900">{sample.species}</span>
                    <span className="text-slate-500 block text-[11px]">{sample.sampleType.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {sample.testRequested}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {sample.suspectedDiseaseName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {sample.laboratoryName}
                  </td>
                  <td className="px-4 py-3">
                    {getResultBadge(sample.result)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sample.result === 'PENDING' ? (
                      <button
                        onClick={() => {
                          setSelectedSample(sample);
                          setIsResultModalOpen(true);
                        }}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Enter Test Result
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Verified by {sample.testedBy}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enter Result Modal */}
      {selectedSample && (
        <Modal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          title={`Diagnostic Result Submission`}
          subtitle={`Sample ${selectedSample.sampleCode} • ${selectedSample.suspectedDiseaseName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleLogResult} className="space-y-4">
            <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-xs space-y-1">
              <p className="font-bold text-purple-950">Assay: {selectedSample.testRequested}</p>
              <p className="text-purple-800">Target Pathogen: {selectedSample.suspectedDiseaseName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Determination *</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'] as const).map(res => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setTestResult(res)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      testResult === res
                        ? res === 'POSITIVE'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                          : res === 'NEGATIVE'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                          : 'bg-amber-500 text-white border-amber-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantitative / Analytical Details *</label>
              <input
                type="text"
                required
                value={resultDetails}
                onChange={e => setResultDetails(e.target.value)}
                placeholder="e.g. Ct value 18.2, Optical density 1.45..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lab Director Remarks & Biosecurity Advice</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Publish & Notify Surveillance
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
