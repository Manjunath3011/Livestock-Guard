import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  MapPin,
  AlertTriangle,
  Syringe,
  Activity,
  Users,
  Send,
  Radio,
  Download,
  PlusCircle,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { store } from '../../services/store';
import { Case, Outbreak, Alert, Advisory, WeatherData, FieldVisit } from '../../types';

interface DistrictOfficialDashboardViewProps {
  onNavigate: (module: string) => void;
}

export const DistrictOfficialDashboardView: React.FC<DistrictOfficialDashboardViewProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [cases, setCases] = useState<Case[]>([]);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>([]);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [isOutbreakModalOpen, setIsOutbreakModalOpen] = useState(false);

  // New advisory state
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryContent, setAdvisoryContent] = useState('');
  const [advisoryDisease, setAdvisoryDisease] = useState('Foot-and-Mouth Disease (FMD)');
  const [advisoryPriority, setAdvisoryPriority] = useState<'INFO' | 'WARNING' | 'EMERGENCY'>('WARNING');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New outbreak state
  const [outbreakDisease, setOutbreakDisease] = useState('Foot-and-Mouth Disease (FMD)');
  const [outbreakVillage, setOutbreakVillage] = useState('Malegaon Budruk');
  const [outbreakRadius, setOutbreakRadius] = useState(5);

  const refreshData = () => {
    setCurrentUser(store.getCurrentUser());
    setCases(store.getScopedCases());
    setOutbreaks(store.getOutbreaks());
    setAlerts(store.getScopedAlerts());
    setAdvisories(store.getScopedAdvisories());
    setFieldVisits(store.getFieldVisits());
  };

  useEffect(() => {
    refreshData();
    return store.subscribe(refreshData);
  }, []);

  const handleCreateAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    store.issueAdvisory({
      title: advisoryTitle,
      level: 'DISTRICT',
      jurisdiction: 'Pune District (Baramati, Daund, Indapur Blocks)',
      diseaseTarget: advisoryDisease,
      issuedBy: currentUser.name,
      issuedRole: 'DISTRICT_OFFICIAL',
      priority: advisoryPriority,
      content: advisoryContent,
      biosecurityDirectives: [
        'Mandatory ring vaccination in 5 km perimeter',
        'Suspension of weekly livestock markets (Shandi)',
        'Daily footbath disinfection at all farm entrances with 4% sodium carbonate'
      ],
      containmentRadiusKm: 5,
      activeUntil: '2026-09-15'
    });

    setSuccessToast('District Biosecurity Advisory issued and dispatched to all talukas!');
    setTimeout(() => setSuccessToast(null), 4000);
    setIsAdvisoryModalOpen(false);
    setAdvisoryTitle('');
    setAdvisoryContent('');
    refreshData();
  };

  const handleDeclareOutbreak = (e: React.FormEvent) => {
    e.preventDefault();
    store.declareOutbreak({
      diseaseId: 'dis_fmd_01',
      diseaseName: outbreakDisease,
      species: ['Cattle', 'Buffalo'],
      stateName: 'Maharashtra',
      districtName: 'Pune',
      primaryVillage: outbreakVillage,
      latitude: 18.1524,
      longitude: 74.5768,
      radiusKm: outbreakRadius,
      startDate: new Date().toISOString().split('T')[0],
      status: 'CONTAINMENT_ZONE',
      riskLevel: 'CRITICAL',
      totalCases: 14,
      totalDeaths: 1,
      affectedAnimalCount: 22,
      containmentMeasures: [
        'Ring vaccination in progress',
        'Movement checkpoint established on SH-10',
        'Carcass disposal supervised with deep burial & lime'
      ],
      caseIds: ['cas_01'],
      declaredBy: currentUser.name
    });

    setSuccessToast(`Outbreak containment zone established around ${outbreakVillage}!`);
    setTimeout(() => setSuccessToast(null), 4000);
    setIsOutbreakModalOpen(false);
    refreshData();
  };

  const activeOutbreaks = outbreaks.filter(o => o.status === 'CONTAINMENT_ZONE' || o.status === 'CONFIRMED');
  const criticalCases = cases.filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Office of the Joint Director • Department of Animal Husbandry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              District Surveillance Command: {currentUser.name}
            </h1>
            <p className="text-amber-100 text-sm mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-300" />
              Jurisdiction: Pune District (14 Talukas, 1,862 Villages) • Maharashtra
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAdvisoryModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-sm"
            >
              <Radio className="w-4 h-4" />
              Issue District Advisory
            </button>
            <button
              onClick={() => setIsOutbreakModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              Declare Containment Zone
            </button>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successToast}
        </div>
      )}

      {/* District KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Cases</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cases.length}</div>
            <div className="text-xs text-rose-600 font-medium mt-1">{criticalCases.length} High/Critical Triage</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Outbreak Clusters</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{activeOutbreaks.length}</div>
            <div className="text-xs text-rose-600 font-medium mt-1">Ring containment active</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">District Vaccine Saturation</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">84.2%</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">42,000 Doses buffer stock</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Syringe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Field Response Units</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">18 Teams</div>
            <div className="text-xs text-blue-600 font-medium mt-1">100% Mobile Coverage</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Block Surveillance & Containment Zones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Outbreak Containment Zones */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  District Outbreak Clusters & Quarantine Perimeters
                </h2>
                <p className="text-xs text-slate-500">
                  Enforced ring vaccination and movement restrictions
                </p>
              </div>
              <button
                onClick={() => onNavigate('outbreaks')}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                View Map <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {outbreaks.map(o => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-rose-900 dark:text-rose-100">
                          {o.outbreakCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          {o.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {o.radiusKm} KM CONTAINMENT
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {o.diseaseName} • Epicenter: {o.primaryVillage}, {o.districtName}
                      </h4>

                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Species: <span className="font-semibold">{o.species.join(', ')}</span> • Affected: <span className="font-semibold text-rose-600">{o.affectedAnimalCount}</span> • Deaths: <span className="font-semibold">{o.totalDeaths}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                        {o.containmentMeasures.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('outbreaks')}
                      className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg shrink-0 self-end sm:self-center shadow-xs"
                    >
                      Enforce Actions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taluka / Block Risk Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Taluka Surveillance & Risk Classification Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Taluka / Block</th>
                    <th className="py-2.5 px-3">Total Livestock</th>
                    <th className="py-2.5 px-3">Active Cases</th>
                    <th className="py-2.5 px-3">Vaccination %</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3 text-right">Field Teams</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { block: 'Baramati', pop: '142,000', cases: 8, vac: '88%', risk: 'CRITICAL', teams: 4 },
                    { block: 'Daund', pop: '118,000', cases: 4, vac: '82%', risk: 'HIGH', teams: 3 },
                    { block: 'Indapur', pop: '135,000', cases: 2, vac: '85%', risk: 'MODERATE', teams: 2 },
                    { block: 'Haveli', pop: '98,000', cases: 1, vac: '92%', risk: 'LOW', teams: 2 },
                    { block: 'Shirur', pop: '112,000', cases: 0, vac: '90%', risk: 'LOW', teams: 2 },
                    { block: 'Khed (Rajgurunagar)', pop: '105,000', cases: 1, vac: '86%', risk: 'LOW', teams: 2 }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{row.block}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{row.pop}</td>
                      <td className="py-3 px-3 font-bold text-rose-600">{row.cases}</td>
                      <td className="py-3 px-3 text-emerald-600 font-semibold">{row.vac}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          row.risk === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          row.risk === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          row.risk === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {row.teams} deployed
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Active Advisories & Quick Controls */}
        <div className="space-y-6">
          {/* Active Advisories Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-600" />
                Active District Advisories
              </h3>
              <button
                onClick={() => setIsAdvisoryModalOpen(true)}
                className="text-xs text-amber-600 font-semibold hover:underline"
              >
                + New
              </button>
            </div>

            <div className="space-y-3">
              {advisories.map(adv => (
                <div key={adv.id} className="p-3 rounded-xl bg-amber-50/50 dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span className="line-clamp-1">{adv.title}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                      {adv.level}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 line-clamp-2">
                    {adv.content}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>Target: {adv.diseaseTarget || 'General'}</span>
                    <span>Active until {adv.activeUntil}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Operations Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              District Surveillance Controls
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('outbreaks')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  GIS Outbreak & Buffer Mapping
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('vaccinations')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-emerald-600" />
                  Vaccine Buffer Stock Allocator
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('reports-analytics')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700 transition flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Generate Weekly Surveillance Dossier
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Advisory Modal */}
      {isAdvisoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Issue District Biosecurity Advisory
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatched instantly to all Block Veterinary Officers, Para-Vets, and registered farmers in Pune District.
            </p>

            <form onSubmit={handleCreateAdvisory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Advisory Title / Subject
                </label>
                <input
                  type="text"
                  value={advisoryTitle}
                  onChange={e => setAdvisoryTitle(e.target.value)}
                  placeholder="E.g., Foot-and-Mouth Disease (FMD) Containment Measures in Baramati"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Pathogen
                  </label>
                  <select
                    value={advisoryDisease}
                    onChange={e => setAdvisoryDisease(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Foot-and-Mouth Disease (FMD)">Foot-and-Mouth Disease (FMD)</option>
                    <option value="Lumpy Skin Disease (LSD)">Lumpy Skin Disease (LSD)</option>
                    <option value="Haemorrhagic Septicaemia (HS)">Haemorrhagic Septicaemia (HS)</option>
                    <option value="Anthrax">Anthrax</option>
                    <option value="Peste des Petits Ruminants (PPR)">PPR (Goat Plague)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alert Priority
                  </label>
                  <select
                    value={advisoryPriority}
                    onChange={e => setAdvisoryPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="WARNING">WARNING (High Risk)</option>
                    <option value="EMERGENCY">EMERGENCY (Outbreak)</option>
                    <option value="INFO">INFO (General Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Directives & Restrictions
                </label>
                <textarea
                  rows={3}
                  value={advisoryContent}
                  onChange={e => setAdvisoryContent(e.target.value)}
                  placeholder="Outline movement bans, disinfection protocols, and mandatory vaccination steps..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdvisoryModalOpen(false)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl shadow"
                >
                  Broadcast Advisory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Declare Outbreak Modal */}
      {isOutbreakModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Declare Disease Containment Zone
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Establishes a formal quarantine ring and triggers emergency Rapid Response Units.
            </p>

            <form onSubmit={handleDeclareOutbreak} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmed Pathogen
                </label>
                <select
                  value={outbreakDisease}
                  onChange={e => setOutbreakDisease(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Foot-and-Mouth Disease (FMD)">Foot-and-Mouth Disease (FMD)</option>
                  <option value="Lumpy Skin Disease (LSD)">Lumpy Skin Disease (LSD)</option>
                  <option value="Haemorrhagic Septicaemia (HS)">Haemorrhagic Septicaemia (HS)</option>
                  <option value="Anthrax">Anthrax</option>
                  <option value="Peste des Petits Ruminants (PPR)">PPR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Epicenter Village
                </label>
                <input
                  type="text"
                  value={outbreakVillage}
                  onChange={e => setOutbreakVillage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Containment Radius (Kilometers)
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={outbreakRadius}
                  onChange={e => setOutbreakRadius(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOutbreakModalOpen(false)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl shadow"
                >
                  Establish Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
