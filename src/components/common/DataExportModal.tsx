import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Filter,
  BarChart3,
  Building2,
  Sparkles
} from 'lucide-react';
import { store } from '../../services/store';
import { Case, Outbreak, MortalityReport } from '../../types';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'CSV' | 'PDF';
type ExportScope = 'CASES' | 'OUTBREAKS' | 'MORTALITY' | 'FULL_SUMMARY';
type DateRangeOption = '7_DAYS' | '30_DAYS' | '90_DAYS' | 'ALL';

export const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<ExportFormat>('CSV');
  const [scope, setScope] = useState<ExportScope>('CASES');
  const [dateRange, setDateRange] = useState<DateRangeOption>('30_DAYS');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current store data
  const cases: Case[] = store.getCases() || [];
  const outbreaks: Outbreak[] = store.getOutbreaks() || [];
  const mortalities: MortalityReport[] = store.getMortalityReports() || [];

  // Filter data based on dateRange
  const filteredData = useMemo(() => {
    const now = new Date().getTime();
    const daysLimit =
      dateRange === '7_DAYS' ? 7 : dateRange === '30_DAYS' ? 30 : dateRange === '90_DAYS' ? 90 : Infinity;

    const isWithinRange = (dateStr: string) => {
      if (daysLimit === Infinity) return true;
      const itemTime = new Date(dateStr).getTime();
      if (isNaN(itemTime)) return true;
      const diffDays = (now - itemTime) / (1000 * 60 * 60 * 24);
      return diffDays <= daysLimit;
    };

    const fCases = cases.filter(c => isWithinRange(c.createdAt || c.symptomsStartDate || ''));
    const fOutbreaks = outbreaks.filter(o => isWithinRange(o.startDate || ''));
    const fMortalities = mortalities.filter(m => isWithinRange(m.dateOfDeath || m.createdAt || ''));

    return {
      cases: fCases,
      outbreaks: fOutbreaks,
      mortalities: fMortalities
    };
  }, [cases, outbreaks, mortalities, dateRange]);

  if (!isOpen) return null;

  const generateCSV = () => {
    let csvContent = '';
    let filename = `LivestockGuard_Export_${scope}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (scope === 'CASES') {
      const headers = [
        'Case Number',
        'Species',
        'Breed',
        'Primary Diagnosis',
        'Risk Level',
        'Risk Score',
        'Status',
        'Affected Count',
        'State',
        'District',
        'Village',
        'Reported Date'
      ];
      const rows = filteredData.cases.map(c => [
        `"${c.caseNumber || c.id}"`,
        `"${c.species}"`,
        `"${c.breed || 'N/A'}"`,
        `"${c.suspectedDiseases?.[0]?.diseaseName || 'Differential Pending'}"`,
        `"${c.riskLevel}"`,
        c.riskScore || 0,
        `"${c.status}"`,
        c.affectedCount || 1,
        `"${c.stateName || 'Maharashtra'}"`,
        `"${c.districtName || 'Pune'}"`,
        `"${c.villageName || ''}"`,
        `"${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (scope === 'OUTBREAKS') {
      const headers = [
        'Outbreak Code',
        'Disease Name',
        'Status',
        'Radius (KM)',
        'Total Affected',
        'Total Deaths',
        'Ring Vaccine Doses',
        'District',
        'Village',
        'Start Date'
      ];
      const rows = filteredData.outbreaks.map(o => [
        `"${o.outbreakCode || o.id}"`,
        `"${o.diseaseName}"`,
        `"${o.status}"`,
        o.radiusKm || 5,
        o.totalAffected || 0,
        o.totalDeaths || 0,
        o.ringVaccinationDoses || 0,
        `"${o.districtName}"`,
        `"${o.villageName}"`,
        `"${o.startDate || ''}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (scope === 'MORTALITY') {
      const headers = [
        'Mortality Code',
        'Species',
        'Suspected Cause',
        'Dead Count',
        'Affected Count',
        'Reported By',
        'District',
        'Village',
        'Date of Death'
      ];
      const rows = filteredData.mortalities.map(m => [
        `"${m.reportCode || m.id}"`,
        `"${m.species}"`,
        `"${m.suspectedCause || 'Undetermined'}"`,
        m.deadCount || 1,
        m.affectedCount || 1,
        `"${m.reportedBy}"`,
        `"${m.districtName}"`,
        `"${m.villageName}"`,
        `"${m.dateOfDeath || ''}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      // FULL SUMMARY CSV
      csvContent = [
        '# LIVESTOCKGUARD NATIONAL EPIZOOTIC SUMMARY REPORT',
        `# Generated on: ${new Date().toLocaleString()}`,
        `# Date Range: ${dateRange.replace('_', ' ')}`,
        '',
        'METRIC,VALUE',
        `Total Cases Screened,${filteredData.cases.length}`,
        `Active Outbreak Zones,${filteredData.outbreaks.length}`,
        `Reported Mortalities,${filteredData.mortalities.reduce((acc, m) => acc + (m.deadCount || 1), 0)}`,
        `High / Critical Priority Cases,${filteredData.cases.filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length}`,
        '',
        '--- TOP DISEASE OCCURRENCES ---',
        'Disease,Cases'
      ].join('\n');
    }

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExecuteExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (format === 'CSV') {
        generateCSV();
        setSuccessMessage(`CSV Export successfully downloaded with ${
          scope === 'CASES'
            ? filteredData.cases.length
            : scope === 'OUTBREAKS'
            ? filteredData.outbreaks.length
            : scope === 'MORTALITY'
            ? filteredData.mortalities.length
            : 'all'
        } records.`);
      } else {
        handlePrintPDF();
        setSuccessMessage('Print / PDF Export dialog opened.');
      }
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Export Health Trends & Analytics</h2>
              <p className="text-xs text-slate-400">Download formatted epidemiological records in CSV or PDF format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Step 1: Select Format */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              1. Choose Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('CSV')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  format === 'CSV'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 shrink-0 ${format === 'CSV' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <div>
                  <div className="font-extrabold text-sm text-slate-900">CSV Spreadsheet</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Compatible with Excel, Python, R, and GIS tools</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('PDF')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  format === 'PDF'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <FileText className={`w-5 h-5 shrink-0 ${format === 'PDF' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Printable PDF Report</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Formatted official government compliance summary</div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Select Scope */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              2. Select Data Scope & Metrics
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CASES', label: 'Clinical Cases', count: filteredData.cases.length, icon: BarChart3 },
                { id: 'OUTBREAKS', label: 'Outbreak Zones', count: filteredData.outbreaks.length, icon: Building2 },
                { id: 'MORTALITY', label: 'Mortality Reports', count: filteredData.mortalities.length, icon: Layers },
                { id: 'FULL_SUMMARY', label: 'Full Epizootic Brief', count: 'All', icon: Sparkles }
              ].map(s => {
                const Icon = s.icon;
                const isSelected = scope === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScope(s.id as ExportScope)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-emerald-200' : 'text-emerald-600'}`} />
                    <div className="font-extrabold text-xs">{s.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {s.count} records
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Date Filter */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              3. Filter By Date Window
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: '7_DAYS', label: 'Last 7 Days' },
                { id: '30_DAYS', label: 'Last 30 Days (MTD)' },
                { id: '90_DAYS', label: 'Last Quarter (90 Days)' },
                { id: 'ALL', label: 'All Historic Records' }
              ].map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDateRange(d.id as DateRangeOption)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dateRange === d.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export Preview Summary Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>Ready to Export:</span>
              <span className="font-mono text-emerald-800 font-extrabold">
                {scope === 'CASES'
                  ? `${filteredData.cases.length} Case Records`
                  : scope === 'OUTBREAKS'
                  ? `${filteredData.outbreaks.length} Outbreak Zones`
                  : scope === 'MORTALITY'
                  ? `${filteredData.mortalities.length} Mortality Records`
                  : 'Complete Multi-Domain Epizootic Matrix'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              The generated {format} will include location metadata, clinical scores, validation timestamps, and containment statistics formatted for the Department of Animal Husbandry.
            </p>
          </div>

          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            {format === 'CSV' ? <Download className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
            {isExporting ? 'Generating Report...' : `Download ${format} Report`}
          </button>
        </div>
      </div>
    </div>
  );
};
