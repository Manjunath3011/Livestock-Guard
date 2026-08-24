import React, { useState } from 'react';
import { store } from '../../services/store';
import { Play, CheckCircle, Sparkles, AlertOctagon, WifiOff, RefreshCw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickScenarioLauncherProps {
  onScenarioTriggered?: (scenarioId: string) => void;
}

export const QuickScenarioLauncher: React.FC<QuickScenarioLauncherProps> = ({ onScenarioTriggered }) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const runScenario = (id: string, action: () => void) => {
    setActiveScenario(id);
    action();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      // ignore
    }
    setTimeout(() => {
      setActiveScenario(null);
      if (onScenarioTriggered) onScenarioTriggered(id);
    }, 1200);
  };

  const handleFmdScenario = () => {
    store.createCase({
      species: 'Cattle',
      ownerName: 'Ramdas Shinde',
      ownerPhone: '+91 98229 99881',
      farmId: 'farm_01',
      farmName: 'Patil Dairy Sector 2',
      stateId: 'st_mah',
      stateName: 'Maharashtra',
      districtId: 'dt_pune',
      districtName: 'Pune',
      blockId: 'bk_baramati',
      villageId: 'vl_malegaon_bk',
      villageName: 'Malegaon Budruk',
      latitude: 18.156,
      longitude: 74.579,
      reporterId: 'usr_farmer_1',
      reporterName: 'Ramdas Shinde',
      reporterRole: 'FARMER',
      symptoms: [
        { symptomId: 'sym_salivation', symptomName: 'Excessive Drooling / Frothy Salivation', severity: 'severe', onsetDate: new Date().toISOString().split('T')[0] },
        { symptomId: 'sym_mouth_lesions', symptomName: 'Mouth Blisters, Ulcers & Vesicles', severity: 'severe', onsetDate: new Date().toISOString().split('T')[0] },
        { symptomId: 'sym_foot_lesions', symptomName: 'Foot / Hoof Lesions & Interdigital Ulcers', severity: 'moderate', onsetDate: new Date().toISOString().split('T')[0] },
        { symptomId: 'sym_lameness', symptomName: 'Severe Lameness & Shifting Weight', severity: 'severe', onsetDate: new Date().toISOString().split('T')[0] },
        { symptomId: 'sym_fever', symptomName: 'High Fever / Hyperthermia', severity: 'severe', onsetDate: new Date().toISOString().split('T')[0] },
        { symptomId: 'sym_reduced_milk', symptomName: 'Sudden Drop in Milk Yield', severity: 'severe', onsetDate: new Date().toISOString().split('T')[0] }
      ],
      naturalLanguageDescription: 'Demo Scenario 1: Cow showing classic FMD triad (mouth blisters, ropy drool, foot sores, 80% milk reduction).',
      symptomsStartDate: new Date().toISOString().split('T')[0],
      affectedCount: 3,
      deadCount: 0,
      status: 'NEW',
      priority: 'EMERGENCY'
    });
  };

  const handleVillageClusterScenario = () => {
    // Insert 2 new cases in close vicinity
    store.createCase({
      species: 'Buffalo',
      ownerName: 'Vikas Jadhav',
      ownerPhone: '+91 98224 44332',
      farmId: 'farm_01',
      farmName: 'Jadhav Agro',
      stateId: 'st_mah',
      stateName: 'Maharashtra',
      districtId: 'dt_pune',
      districtName: 'Pune',
      blockId: 'bk_baramati',
      villageId: 'vl_shirsuphal',
      villageName: 'Shirsuphal',
      latitude: 18.235,
      longitude: 74.522,
      reporterId: 'usr_field_worker_1',
      reporterName: 'Sunita Gaikwad',
      reporterRole: 'FIELD_WORKER',
      symptoms: [
        { symptomId: 'sym_mouth_lesions', symptomName: 'Mouth Blisters, Ulcers & Vesicles', severity: 'severe', onsetDate: new Date().toISOString().split('T')[0] },
        { symptomId: 'sym_salivation', symptomName: 'Excessive Drooling / Frothy Salivation', severity: 'severe', onsetDate: new Date().toISOString().split('T')[0] }
      ],
      symptomsStartDate: new Date().toISOString().split('T')[0],
      affectedCount: 4,
      deadCount: 0,
      status: 'UNDER_REVIEW',
      priority: 'URGENT'
    });

    store.createAlert({
      title: 'EPIDEMIOLOGICAL CLUSTER DETECTED',
      message: 'Multiple vesicular cases reported within 8 km in Baramati block within 48 hours. Potential cluster triggered.',
      priority: 'CRITICAL',
      category: 'OUTBREAK',
      targetRoles: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN'],
      districtName: 'Pune',
      villageName: 'Shirsuphal'
    });
  };

  const handleAnthraxSuddenDeathScenario = () => {
    store.createMortalityReport({
      species: 'Buffalo',
      farmId: 'farm_06',
      farmName: 'Daurala Grazing Lands',
      ownerName: 'Satpal Singh',
      ownerPhone: '+91 98377 12345',
      stateName: 'Uttar Pradesh',
      districtName: 'Meerut',
      villageName: 'Daurala Khurd',
      latitude: 29.115,
      longitude: 77.715,
      dateOfDeath: new Date().toISOString().split('T')[0],
      deadCount: 3,
      affectedCount: 3,
      suspectedCause: 'Anthrax (Sudden Peracute Hemorrhagic Death)',
      symptomsBeforeDeath: [
        'Sudden acute death of 3 high-producing buffaloes in morning',
        'Dark unclotted tar-like blood oozing from nostrils and anus',
        'Incomplete rigor mortis'
      ],
      reportedBy: 'Satpal Singh',
      reportedByRole: 'FARMER',
      necropsyConducted: false,
      necropsyFindings: 'CRITICAL: Post-mortem examination strictly prohibited. Spore containment protocol active.',
      carcassDisposalMethod: 'BURIAL_WITH_LIME'
    });
  };

  const handleLabConfirmationScenario = () => {
    const samples = store.getLabSamples();
    const pendingSample = samples.find(s => s.result === 'PENDING') || samples[0];
    if (pendingSample) {
      store.submitLabResult(
        pendingSample.id,
        'POSITIVE',
        'RT-PCR confirmation: VP1 viral RNA detected (Ct value 18.2). Serotype O confirmed.',
        'High viral titer. Ring vaccination and containment protocol triggered.'
      );
    }
  };

  const handleOfflineSyncScenario = () => {
    // If online, simulate queuing a record offline, then syncing
    if (!store.isOffline()) {
      store.toggleOfflineMode();
      store.createCase({
        species: 'Goat',
        ownerName: 'Anil Thorat',
        ownerPhone: '+91 98455 66778',
        farmId: 'farm_02',
        farmName: 'Thorat Goat Unit',
        stateId: 'st_mah',
        stateName: 'Maharashtra',
        districtId: 'dt_pune',
        districtName: 'Pune',
        blockId: 'bk_baramati',
        villageId: 'vl_malegaon_bk',
        villageName: 'Malegaon Budruk',
        latitude: 18.152,
        longitude: 74.576,
        reporterId: 'usr_field_worker_1',
        reporterName: 'Sunita Gaikwad (Field Worker)',
        reporterRole: 'FIELD_WORKER',
        symptoms: [
          { symptomId: 'sym_cough', symptomName: 'Persistent Coughing & Grunting', severity: 'moderate', onsetDate: new Date().toISOString().split('T')[0] },
          { symptomId: 'sym_nasal_discharge', symptomName: 'Mucopurulent Nasal Discharge', severity: 'moderate', onsetDate: new Date().toISOString().split('T')[0] }
        ],
        symptomsStartDate: new Date().toISOString().split('T')[0],
        affectedCount: 2,
        deadCount: 0,
        status: 'NEW',
        priority: 'ROUTINE'
      });
    } else {
      store.syncPendingOfflineRecords();
    }
  };

  return (
    <div className="bg-linear-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-xl border border-emerald-800/40 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-100 flex items-center gap-2">
              Interactive Test Scenarios
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase font-semibold tracking-wider">
                1-Click Demo
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Trigger pre-configured epidemiological events to test full-stack workflows.
            </p>
          </div>
        </div>

        <button
          onClick={() => store.resetToSeedData()}
          className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Scenario 1 */}
        <button
          onClick={() => runScenario('sc_fmd', handleFmdScenario)}
          disabled={activeScenario === 'sc_fmd'}
          className="group relative text-left bg-slate-800/70 hover:bg-emerald-900/40 border border-slate-700/80 hover:border-emerald-500/50 p-3 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 mb-1">
              <span>Scenario 1</span>
              {activeScenario === 'sc_fmd' ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
            <div className="font-medium text-xs text-slate-100 mb-1">FMD Cow Symptoms</div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              Fever + drooling saliva + mouth blisters + milk drop → Critical Risk Engine output.
            </p>
          </div>
          <span className="mt-2 text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-1">
            <Zap className="w-3 h-3" /> Test Triage
          </span>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={() => runScenario('sc_cluster', handleVillageClusterScenario)}
          disabled={activeScenario === 'sc_cluster'}
          className="group relative text-left bg-slate-800/70 hover:bg-amber-900/40 border border-slate-700/80 hover:border-amber-500/50 p-3 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-1">
              <span>Scenario 2</span>
              {activeScenario === 'sc_cluster' ? (
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
            <div className="font-medium text-xs text-slate-100 mb-1">Village Cluster Spike</div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              Spikes 4+ cases within 8 km in Baramati → triggers cluster alert & GIS ring.
            </p>
          </div>
          <span className="mt-2 text-[10px] text-amber-400 font-semibold inline-flex items-center gap-1">
            <Zap className="w-3 h-3" /> Trigger Cluster
          </span>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={() => runScenario('sc_anthrax', handleAnthraxSuddenDeathScenario)}
          disabled={activeScenario === 'sc_anthrax'}
          className="group relative text-left bg-slate-800/70 hover:bg-rose-900/40 border border-slate-700/80 hover:border-rose-500/50 p-3 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-rose-300 mb-1">
              <span>Scenario 3</span>
              {activeScenario === 'sc_anthrax' ? (
                <CheckCircle className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              ) : (
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
            <div className="font-medium text-xs text-slate-100 mb-1">Anthrax Sudden Death</div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              Unclotted dark blood mortality → Strict no-necropsy & biosecurity advisory.
            </p>
          </div>
          <span className="mt-2 text-[10px] text-rose-400 font-semibold inline-flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> Mortality Spike
          </span>
        </button>

        {/* Scenario 4 */}
        <button
          onClick={() => runScenario('sc_lab', handleLabConfirmationScenario)}
          disabled={activeScenario === 'sc_lab'}
          className="group relative text-left bg-slate-800/70 hover:bg-purple-900/40 border border-slate-700/80 hover:border-purple-500/50 p-3 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300 mb-1">
              <span>Scenario 4</span>
              {activeScenario === 'sc_lab' ? (
                <CheckCircle className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              ) : (
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
            <div className="font-medium text-xs text-slate-100 mb-1">Lab PCR Confirmation</div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              Updates sample result to POSITIVE → Escalates case to CONFIRMED + ring alert.
            </p>
          </div>
          <span className="mt-2 text-[10px] text-purple-400 font-semibold inline-flex items-center gap-1">
            <Zap className="w-3 h-3" /> Confirm Test
          </span>
        </button>

        {/* Scenario 5 */}
        <button
          onClick={() => runScenario('sc_offline', handleOfflineSyncScenario)}
          disabled={activeScenario === 'sc_offline'}
          className="group relative text-left bg-slate-800/70 hover:bg-cyan-900/40 border border-slate-700/80 hover:border-cyan-500/50 p-3 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 mb-1">
              <span>Scenario 5</span>
              {activeScenario === 'sc_offline' ? (
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              ) : (
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
            <div className="font-medium text-xs text-slate-100 mb-1">
              {store.isOffline() ? 'Sync Offline Queue' : 'Offline Field Triage'}
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {store.isOffline()
                ? `Sync ${store.getOfflineQueue().length} pending records to Central DB.`
                : 'Simulate low connectivity field queue & auto-reconnect.'}
            </p>
          </div>
          <span className="mt-2 text-[10px] text-cyan-400 font-semibold inline-flex items-center gap-1">
            {store.isOffline() ? <RefreshCw className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {store.isOffline() ? 'Run Sync' : 'Simulate Offline'}
          </span>
        </button>
      </div>
    </div>
  );
};
