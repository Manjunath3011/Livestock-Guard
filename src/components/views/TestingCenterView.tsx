import React, { useState } from 'react';
import { store } from '../../services/store';
import { QuickScenarioLauncher } from '../common/QuickScenarioLauncher';
import {
  FlaskConical,
  Bug,
  Activity,
  Radio,
  Skull,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Wifi,
  WifiOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TestingCenterView: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isOffline = store.isOffline();
  const offlineQueue = store.getOfflineQueue();

  const handleTrigger = (scenarioName: string) => {
    setSuccessMessage(`Executed test simulation: ${scenarioName}`);
    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch (e) {}
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleResetData = () => {
    store.resetToSeedData();
    setSuccessMessage('Reset all store data to default national surveillance dataset.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            Admin & Developer Simulation Sandbox
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
            Testing & Outbreak Simulation Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate regional epidemiological emergencies, clustered FMD outbreaks, peracute Anthrax mortality spikes, lab PCR confirmations, and offline queue synchronization.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          Reset All Data
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Preset Test Scenarios */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Bug className="w-4 h-4 text-emerald-600" />
          One-Click Epidemiological Test Cases
        </h3>
        <QuickScenarioLauncher onScenarioTriggered={handleTrigger} />
      </div>

      {/* Offline and Sync Diagnostic Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Offline Mutation Queue
            </h4>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isOffline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isOffline ? 'Offline Mode Active' : 'Online'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Current offline mutation queue holds <strong>{offlineQueue.length}</strong> items waiting for network restoration.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => store.toggleOfflineMode()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {isOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOffline ? 'Go Online & Sync' : 'Simulate Offline'}
            </button>
            <button
              onClick={() => {
                store.syncPendingOfflineRecords();
                handleTrigger('Manual Sync Queue Replay');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Flush / Replay Queue
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Verification Acceptance Criteria
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>50 Cattle Herd with 8 affected, salivation & mouth lesions → FMD High Risk</li>
            <li>Sudden Death in 3 sheep → Anthrax / Blackleg Critical Risk + Carcass Warning</li>
            <li>5 cases in 10km radius → Automated Outbreak Zone Cluster Alert</li>
            <li>Positive RT-PCR lab report → Immediate Outbreak Escalation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
