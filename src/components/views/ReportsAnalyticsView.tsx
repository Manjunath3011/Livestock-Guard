import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { DataExportModal } from '../common/DataExportModal';
import { store } from '../../services/store';

export const ReportsAnalyticsView: React.FC = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const cases = store.getCases() || [];
  const outbreaks = store.getOutbreaks() || [];
  const mortalities = store.getMortalityReports() || [];

  const totalCases = cases.length;
  const criticalCases = cases.filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length;
  const activeOutbreaks = outbreaks.filter(o => o.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            <Building className="w-4 h-4 text-emerald-600" />
            Directorate of Animal Husbandry Official Reporting
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Government Compliance & Epizootic Data Export
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Download standardized NADRS / DAHD format monthly disease incidence, ring vaccination coverage and mortality statistics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV / PDF Reports
          </button>
        </div>
      </div>

      {/* Analytics Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Cases Screened</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCases}</div>
          <div className="text-[11px] text-slate-400">Recorded across active state clusters</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>High Risk / Critical Alerts</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{criticalCases}</div>
          <div className="text-[11px] text-slate-400">Requiring immediate emergency triage</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Active Outbreak Circles</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{activeOutbreaks}</div>
          <div className="text-[11px] text-slate-400">Ring vaccination containment enforced</div>
        </div>
      </div>

      {/* District Surveillance Compliance Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>District Surveillance Status (State Performance Matrix)</span>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Matrix
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Active Outbreaks</th>
                <th className="px-4 py-3">Reported Cases (MTD)</th>
                <th className="px-4 py-3">Lab Confirmation %</th>
                <th className="px-4 py-3">Vaccine Ring Coverage</th>
                <th className="px-4 py-3 text-right">Surveillance Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { district: 'Pune (Maharashtra)', outbreaks: 2, cases: 48, labPct: '94%', vaccinePct: '88%', score: 'GRADE A (95/100)' },
                { district: 'Satara (Maharashtra)', outbreaks: 1, cases: 29, labPct: '89%', vaccinePct: '82%', score: 'GRADE A (91/100)' },
                { district: 'Anand (Gujarat)', outbreaks: 1, cases: 38, labPct: '96%', vaccinePct: '95%', score: 'GRADE A+ (98/100)' },
                { district: 'Belagavi (Karnataka)', outbreaks: 1, cases: 22, labPct: '84%', vaccinePct: '76%', score: 'GRADE B (84/100)' },
                { district: 'Meerut (Uttar Pradesh)', outbreaks: 1, cases: 14, labPct: '91%', vaccinePct: '80%', score: 'GRADE A (89/100)' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{row.district}</td>
                  <td className="px-4 py-3 font-semibold text-rose-700">{row.outbreaks} Active</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.cases}</td>
                  <td className="px-4 py-3 text-slate-600">{row.labPct}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{row.vaccinePct}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-800">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal Dialog */}
      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

