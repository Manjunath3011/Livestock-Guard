import React, { useState } from 'react';
import { store } from '../../services/store';
import { SystemConfig } from '../../types';
import { Settings, Sliders, WifiOff, RefreshCw, CheckCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsView: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(store.getSystemConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const offlineQueue = store.getOfflineQueue();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSystemConfig(config);
    setSavedSuccess(true);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {}
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    store.resetToSeedData();
    setConfig(store.getSystemConfig());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4 text-emerald-600" />
            System Parameters & Configuration
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Surveillance Engine Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tune algorithmic risk weights, cluster detection thresholds, and manage offline data queues.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Data to Factory Default
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Configuration updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Weights Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Risk Calculation Component Weights
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Symptom Match Weight:</span>
                <span className="font-bold text-emerald-700">{Math.round(config.riskWeights.symptomMatch * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={config.riskWeights.symptomMatch}
                onChange={e => setConfig({
                  ...config,
                  riskWeights: { ...config.riskWeights, symptomMatch: parseFloat(e.target.value) }
                })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Nearby Cases / Cluster Weight:</span>
                <span className="font-bold text-emerald-700">{Math.round(config.riskWeights.nearbyCases * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={config.riskWeights.nearbyCases}
                onChange={e => setConfig({
                  ...config,
                  riskWeights: { ...config.riskWeights, nearbyCases: parseFloat(e.target.value) }
                })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Mortality Weight:</span>
                <span className="font-bold text-emerald-700">{Math.round(config.riskWeights.mortality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={config.riskWeights.mortality}
                onChange={e => setConfig({
                  ...config,
                  riskWeights: { ...config.riskWeights, mortality: parseFloat(e.target.value) }
                })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Cluster Detection Parameters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Cluster & Epidemic Detection Radius
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Cases for Cluster Alert</label>
              <input
                type="number"
                min={2}
                value={config.clusterThresholds.minCases}
                onChange={e => setConfig({
                  ...config,
                  clusterThresholds: { ...config.clusterThresholds, minCases: parseInt(e.target.value) || 3 }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Geographic Cluster Radius (Kilometers)</label>
              <input
                type="number"
                min={1}
                value={config.clusterThresholds.radiusKm}
                onChange={e => setConfig({
                  ...config,
                  clusterThresholds: { ...config.clusterThresholds, radiusKm: parseInt(e.target.value) || 10 }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Window (Days)</label>
              <input
                type="number"
                min={1}
                value={config.clusterThresholds.timeWindowDays}
                onChange={e => setConfig({
                  ...config,
                  clusterThresholds: { ...config.clusterThresholds, timeWindowDays: parseInt(e.target.value) || 14 }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
