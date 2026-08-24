import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Printer, Filter, Calendar, BarChart3, Building } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReportsAnalyticsView: React.FC = () => {
  const [reportType, setReportType] = useState('MONTHLY_DIRECTORATE');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = () => {
    setDownloadSuccess(true);
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            <Building className="w-4 h-4 text-emerald-600" />
            Directorate of Animal Husbandry Official Reporting
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Government Compliance & Monthly Epizootic Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standardized NADRS / DAHD format monthly disease incidence, ring vaccination coverage and mortality statistics.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Official PDF / CSV
        </button>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Report compiled & downloaded: Official_DAHD_Surveillance_Report_2026.pdf
        </div>
      )}

      {/* District Surveillance Compliance Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
          <span>District Surveillance Status (State Performance Matrix)</span>
          <span className="text-slate-400 font-normal">Updated Live from Central Surveillance Core</span>
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
    </div>
  );
};
