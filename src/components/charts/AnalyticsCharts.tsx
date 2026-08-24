import React, { useState } from 'react';
import { HISTORICAL_MONTHLY_TRENDS } from '../../data/seedData';
import { TrendingUp, Activity, ShieldCheck, CloudRain, BarChart3 } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EPICURVE' | 'DISEASE_SHARE' | 'WEATHER_CORRELATION' | 'VACCINE_COVERAGE'>('EPICURVE');

  const maxCases = Math.max(...HISTORICAL_MONTHLY_TRENDS.map(t => t.cases));
  const maxRain = Math.max(...HISTORICAL_MONTHLY_TRENDS.map(t => t.rainfallMm));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Chart Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Epidemiological Surveillance Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal disease trends, rainfall correlations and state vaccination tracking.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('EPICURVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'EPICURVE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Epidemic Curve (12 Mo)
          </button>
          <button
            onClick={() => setActiveTab('DISEASE_SHARE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'DISEASE_SHARE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disease Breakdown
          </button>
          <button
            onClick={() => setActiveTab('WEATHER_CORRELATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'WEATHER_CORRELATION'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weather & Vector Correlation
          </button>
          <button
            onClick={() => setActiveTab('VACCINE_COVERAGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'VACCINE_COVERAGE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            District Vaccine Coverage
          </button>
        </div>
      </div>

      {/* Tab 1: Epidemic Curve */}
      {activeTab === 'EPICURVE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm" /> Total Cases Reported
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 bg-rose-500 rounded-sm" /> Mortalities
              </span>
            </div>
            <span className="italic font-medium">Peak in Monsoon (June - Aug) & Winter (Nov - Jan)</span>
          </div>

          <div className="h-64 flex items-end gap-2 pt-6 pb-2 border-b border-slate-200">
            {HISTORICAL_MONTHLY_TRENDS.map((item, idx) => {
              const caseHeight = (item.cases / maxCases) * 100;
              const deathHeight = (item.deaths / maxCases) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] p-1.5 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                    <p className="font-bold">{item.month}</p>
                    <p className="text-emerald-400">Cases: {item.cases}</p>
                    <p className="text-rose-400">Deaths: {item.deaths}</p>
                  </div>

                  <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-full">
                    {/* Cases Bar */}
                    <div
                      style={{ height: `${caseHeight}%` }}
                      className="w-1/2 bg-emerald-500 rounded-t-sm group-hover:bg-emerald-600 transition-all"
                    />
                    {/* Deaths Bar */}
                    <div
                      style={{ height: `${deathHeight}%` }}
                      className="w-1/2 bg-rose-500 rounded-t-sm group-hover:bg-rose-600 transition-all"
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 truncate w-full text-center mt-1">
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Disease Breakdown */}
      {activeTab === 'DISEASE_SHARE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Top Priority Diseases by Total Annual Incidence
              </h4>

              <div className="space-y-2.5">
                {[
                  { name: 'Foot-and-Mouth Disease (FMD)', count: 181, pct: 31, color: 'bg-emerald-500' },
                  { name: 'Lumpy Skin Disease (LSD)', count: 147, pct: 25, color: 'bg-amber-500' },
                  { name: 'Peste des Petits Ruminants (PPR)', count: 140, pct: 24, color: 'bg-indigo-500' },
                  { name: 'Hemorrhagic Septicemia (HS)', count: 87, pct: 15, color: 'bg-rose-500' },
                  { name: 'Blackleg & Anthrax', count: 32, pct: 5, color: 'bg-purple-500' }
                ].map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{d.name}</span>
                      <span className="text-slate-900 font-bold">{d.count} cases ({d.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2 flex flex-col justify-center">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Key Surveillance Takeaways
              </div>
              <p>
                • <strong>FMD & LSD</strong> constitute over 56% of reported dairy emergencies in Maharashtra & Gujarat.
              </p>
              <p>
                • <strong>PPR</strong> remains the primary mortality threat in goat and sheep herds, particularly during winter trade movements.
              </p>
              <p>
                • <strong>HS mortality</strong> concentrates sharply during the initial 4 weeks of heavy monsoon rains in low-lying waterlogged villages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Weather & Vector Correlation */}
      {activeTab === 'WEATHER_CORRELATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 bg-sky-500 rounded-sm" /> Monthly Rainfall (mm)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 bg-amber-500 rounded-sm" /> Vector-Borne Cases (LSD/Theileria)
              </span>
            </div>
            <span className="text-amber-700 font-semibold">
              High Positive Correlation: R = 0.84 during Monsoon
            </span>
          </div>

          <div className="h-64 flex items-end gap-2 pt-6 pb-2 border-b border-slate-200">
            {HISTORICAL_MONTHLY_TRENDS.map((item, idx) => {
              const rainHeight = (item.rainfallMm / maxRain) * 100;
              const lsdHeight = (item.lsd / 25) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] p-1.5 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                    <p className="font-bold">{item.month}</p>
                    <p className="text-sky-400">Rainfall: {item.rainfallMm} mm</p>
                    <p className="text-amber-400">Vector Cases: {item.lsd}</p>
                  </div>

                  <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-full">
                    <div
                      style={{ height: `${rainHeight}%` }}
                      className="w-1/2 bg-sky-400 rounded-t-sm group-hover:bg-sky-500 transition-all"
                    />
                    <div
                      style={{ height: `${lsdHeight}%` }}
                      className="w-1/2 bg-amber-500 rounded-t-sm group-hover:bg-amber-600 transition-all"
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 truncate w-full text-center mt-1">
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: District Vaccine Coverage */}
      {activeTab === 'VACCINE_COVERAGE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { district: 'Pune District', state: 'Maharashtra', fmd: 88, hs: 92, lsd: 78, ppr: 65 },
              { district: 'Satara District', state: 'Maharashtra', fmd: 82, hs: 85, lsd: 70, ppr: 62 },
              { district: 'Anand District', state: 'Gujarat', fmd: 95, hs: 89, lsd: 91, ppr: 74 },
              { district: 'Belagavi District', state: 'Karnataka', fmd: 76, hs: 80, lsd: 68, ppr: 58 }
            ].map((dist, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dist.district}</h4>
                  <p className="text-[11px] text-slate-500">{dist.state}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>FMD Coverage:</span>
                      <span className="font-bold text-slate-800">{dist.fmd}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dist.fmd}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>HS Coverage:</span>
                      <span className="font-bold text-slate-800">{dist.hs}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dist.hs}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>PPR (Small Ruminants):</span>
                      <span className="font-bold text-slate-800">{dist.ppr}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dist.ppr < 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${dist.ppr}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
