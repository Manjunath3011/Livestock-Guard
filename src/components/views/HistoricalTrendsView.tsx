import React from 'react';
import { AnalyticsCharts } from '../charts/AnalyticsCharts';
import { TrendingUp, FileText, Download, BarChart2 } from 'lucide-react';

export const HistoricalTrendsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            Epidemiological Analytics & Historical Curves
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Historical Disease Patterns & Seasonality
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze 12-month epidemic curves, vector correlations, and district ring-vaccination coverage metrics.
          </p>
        </div>
      </div>

      <AnalyticsCharts />
    </div>
  );
};
