import React from 'react';
import { Outbreak } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { Radio, ShieldAlert, CheckCircle2, MapPin, Syringe, Truck, AlertTriangle } from 'lucide-react';

interface OutbreaksViewProps {
  outbreaks: Outbreak[];
  onNavigateToMap?: () => void;
}

export const OutbreaksView: React.FC<OutbreaksViewProps> = ({ outbreaks, onNavigateToMap }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            Epidemiological Containment & Buffer Zones
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Active Outbreak Surveillance ({outbreaks.length} Declared Zones)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official government containment circles, emergency ring-vaccination campaigns and animal transit blockades.
          </p>
        </div>

        {onNavigateToMap && (
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            View on GIS Map
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {outbreaks.map(outb => {
          const ringCoverage = Math.min(100, Math.round((outb.ringVaccinationDoses / (outb.totalAffected * 30 + 100)) * 100));

          return (
            <div
              key={outb.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 hover:border-rose-300 transition-all"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {outb.outbreakCode}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {outb.diseaseName} Epidemic Zone
                  </h3>
                  <p className="text-xs text-slate-500">
                    {outb.villageName}, {outb.districtName}, {outb.stateName}
                  </p>
                </div>

                <span className="bg-rose-600 text-white font-extrabold px-3 py-1 rounded-full text-xs animate-pulse">
                  {outb.status}
                </span>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Zone Radius</span>
                  <p className="font-bold text-slate-900 text-sm">{outb.radiusKm} km Circle</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Morbidity</span>
                  <p className="font-bold text-rose-700 text-sm">{outb.totalAffected} Animals</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Mortalities</span>
                  <p className="font-bold text-slate-900 text-sm">{outb.totalDeaths} Deaths</p>
                </div>
              </div>

              {/* Ring Vaccination Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                    Emergency Ring Vaccination Progress:
                  </span>
                  <span className="text-emerald-700 font-bold">
                    {outb.ringVaccinationDoses} Doses ({ringCoverage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${ringCoverage}%` }} />
                </div>
              </div>

              {/* Containment Measures */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  Active Containment Enforcements:
                </h4>
                <div className="space-y-1.5">
                  {(outb.containmentMeasures || []).map((measure, idx) => (
                    <div key={idx} className="p-2 bg-rose-50/50 rounded-lg border border-rose-200 text-xs text-rose-950 flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{measure}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
