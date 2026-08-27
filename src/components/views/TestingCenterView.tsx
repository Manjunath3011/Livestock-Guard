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

      {/* End-to-End Multi-Role Workflow Journey */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              End-to-End Multi-Role Disease Escalation Chain
            </h3>
            <p className="text-xs text-slate-500">
              Execute each step of the real-world livestock surveillance protocol across all 6 stakeholder personas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Step 1: Farmer */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Step 1 • Farmer
                </span>
                <span className="text-base">🌾</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">Farmer Clinical Intake</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Ramesh Patil notices vesicular foot lesions and excessive drooling in his Jersey cow (IND-MH-PUN-001).
              </p>
            </div>
            <button
              onClick={() => {
                store.switchRole('FARMER');
                handleTrigger('Switched to Farmer & Viewed Active Farm Health Hub');
              }}
              className="mt-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-3 rounded-lg shadow-xs transition-all text-center"
            >
              Simulate Step 1 as Farmer
            </button>
          </div>

          {/* Step 2: Field Worker */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-cyan-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  Step 2 • Para-Vet
                </span>
                <span className="text-base">🛵</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">Beat Duty & Swab Collection</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Para-Vet Suresh Shinde arrives on motorbike, inspects herd, completes field visit, and packages cold chain swab.
              </p>
            </div>
            <button
              onClick={() => {
                store.switchRole('FIELD_WORKER');
                handleTrigger('Switched to Field Worker & Loaded Assigned Beat Duty');
              }}
              className="mt-3 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white py-1.5 px-3 rounded-lg shadow-xs transition-all text-center"
            >
              Simulate Step 2 as Para-Vet
            </button>
          </div>

          {/* Step 3: Veterinarian */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Step 3 • Veterinarian
                </span>
                <span className="text-base">🩺</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">Clinical Triage & Lab Order</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Dr. Ananya reviews symptoms, sets Presumptive FMD diagnosis, orders urgent RT-PCR test, and prescribes isolation.
              </p>
            </div>
            <button
              onClick={() => {
                store.switchRole('VETERINARIAN');
                handleTrigger('Switched to Veterinarian & Evaluated Diagnostic Triage');
              }}
              className="mt-3 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white py-1.5 px-3 rounded-lg shadow-xs transition-all text-center"
            >
              Simulate Step 3 as Doctor
            </button>
          </div>

          {/* Step 4: Laboratory */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-purple-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Step 4 • Diagnostic Lab
                </span>
                <span className="text-base">🧪</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">RT-PCR Positive Verification</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                DIAL Pune extracts viral RNA, amplifies target gene (Ct: 19.8), and officially certifies POSITIVE outcome.
              </p>
            </div>
            <button
              onClick={() => {
                store.switchRole('LABORATORY_STAFF');
                handleTrigger('Switched to Diagnostic Lab & Accessed Molecular Bench');
              }}
              className="mt-3 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white py-1.5 px-3 rounded-lg shadow-xs transition-all text-center"
            >
              Simulate Step 4 as Lab Pathologist
            </button>
          </div>

          {/* Step 5: District Official */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Step 5 • District AH
                </span>
                <span className="text-base">🏛️</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">5km Containment Zone & RRU</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Joint Director establishes Baramati quarantine ring, bans livestock transport, and issues taluka advisory.
              </p>
            </div>
            <button
              onClick={() => {
                store.switchRole('DISTRICT_OFFICIAL');
                handleTrigger('Switched to District AH Officer & Monitored Containment');
              }}
              className="mt-3 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white py-1.5 px-3 rounded-lg shadow-xs transition-all text-center"
            >
              Simulate Step 5 as District Officer
            </button>
          </div>

          {/* Step 6: State Admin */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Step 6 • State Directorate
                </span>
                <span className="text-base">📊</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">Statewide Vaccine Reserve</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Directorate tracks 36-district epidemic curve and dispatches 50,000 homologous vaccine buffer doses to Pune.
              </p>
            </div>
            <button
              onClick={() => {
                store.switchRole('STATE_ADMIN');
                handleTrigger('Switched to State Directorate & Reviewed 36 Districts');
              }}
              className="mt-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-3 rounded-lg shadow-xs transition-all text-center"
            >
              Simulate Step 6 as State Director
            </button>
          </div>
        </div>
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
