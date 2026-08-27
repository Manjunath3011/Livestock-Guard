import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Building2,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Syringe,
  Activity,
  Layers,
  FileSpreadsheet,
  Download,
  PlusCircle,
  Radio,
  CheckCircle2,
  BarChart3,
  TestTube,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { store } from '../../services/store';
import { Case, Outbreak, Alert, Advisory, WeatherData } from '../../types';

interface StateAdminDashboardViewProps {
  onNavigate: (module: string) => void;
}

export const StateAdminDashboardView: React.FC<StateAdminDashboardViewProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [cases, setCases] = useState<Case[]>([]);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryContent, setAdvisoryContent] = useState('');
  const [advisoryDisease, setAdvisoryDisease] = useState('Foot-and-Mouth Disease (FMD) & LSD');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const refreshData = () => {
    setCurrentUser(store.getCurrentUser());
    setCases(store.getCases());
    setOutbreaks(store.getOutbreaks());
    setAlerts(store.getScopedAlerts());
    setAdvisories(store.getScopedAdvisories());
  };

  useEffect(() => {
    refreshData();
    return store.subscribe(refreshData);
  }, []);

  const handleCreateStateAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    store.issueAdvisory({
      title: advisoryTitle,
      level: 'STATE',
      jurisdiction: 'State of Maharashtra (All 36 Districts)',
      diseaseTarget: advisoryDisease,
      issuedBy: currentUser.name,
      issuedRole: 'STATE_ADMIN',
      priority: 'INFO',
      content: advisoryContent,
      biosecurityDirectives: [
        'Maintain 100% homologous vaccine buffer in all district polyclinics',
        'Mandate 24-hour electronic mortality reporting for all talukas',
        'Accelerate molecular RT-PCR sequencing at DIAL Pune for emerging variants'
      ],
      containmentRadiusKm: 0,
      activeUntil: '2026-09-30'
    });

    setSuccessToast('Statewide Directorate Circular successfully dispatched and gazetted!');
    setTimeout(() => setSuccessToast(null), 4000);
    setIsAdvisoryModalOpen(false);
    setAdvisoryTitle('');
    setAdvisoryContent('');
    refreshData();
  };

  const districtData = [
    { district: 'Pune', population: '2.45M', cases: 8, deaths: 1, vac: '88.4%', outbreaks: 2, status: 'HIGH_ALERT', labTat: '14.5h' },
    { district: 'Satara', population: '1.82M', cases: 5, deaths: 0, vac: '85.1%', outbreaks: 1, status: 'MODERATE', labTat: '16.0h' },
    { district: 'Belagavi (Border)', population: '2.10M', cases: 4, deaths: 0, vac: '81.3%', outbreaks: 1, status: 'MODERATE', labTat: '18.2h' },
    { district: 'Anand (Interstate)', population: '1.95M', cases: 3, deaths: 0, vac: '89.2%', outbreaks: 0, status: 'LOW_RISK', labTat: '12.4h' },
    { district: 'Meerut (North)', population: '2.80M', cases: 2, deaths: 0, vac: '79.6%', outbreaks: 0, status: 'LOW_RISK', labTat: '22.0h' },
    { district: 'Ahmednagar', population: '2.90M', cases: 3, deaths: 0, vac: '87.0%', outbreaks: 0, status: 'LOW_RISK', labTat: '15.1h' },
    { district: 'Solapur', population: '2.30M', cases: 2, deaths: 0, vac: '84.5%', outbreaks: 0, status: 'LOW_RISK', labTat: '17.3h' },
    { district: 'Kolhapur', population: '1.75M', cases: 1, deaths: 0, vac: '91.0%', outbreaks: 0, status: 'LOW_RISK', labTat: '13.8h' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Globe2 className="w-4 h-4 text-blue-300" />
              <span>Directorate of Animal Husbandry • State Government of Maharashtra</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Statewide Epidemiological Directorate: {currentUser.name}
            </h1>
            <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-300" />
              Central Command • 36 Districts • 33.7 Million Bovine & Small Ruminant Population
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAdvisoryModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-sm"
            >
              <Radio className="w-4 h-4" />
              Issue Statewide Directive
            </button>
            <button
              onClick={() => onNavigate('reports-analytics')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-300" />
              Export Directorate Dossier
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

      {/* Statewide KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">State Livestock Population</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">33.7 Million</div>
            <div className="text-xs text-blue-600 font-medium mt-1">36 Revenue Districts</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Globe2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Statewide Active Outbreaks</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{outbreaks.length}</div>
            <div className="text-xs text-rose-600 font-medium mt-1">Pune, Satara, Belagavi</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">State Vaccination Coverage</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">86.7%</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">540,000 Buffer doses reserve</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Syringe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Lab Diagnostic TAT</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">15.2 Hours</div>
            <div className="text-xs text-purple-600 font-medium mt-1">100% RT-PCR verification</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <TestTube className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Comparative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: District Comparison Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  District Comparative Surveillance & Risk Index
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time status across Maharashtra state veterinary jurisdictions
                </p>
              </div>
              <button
                onClick={() => onNavigate('reports-analytics')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                Full Analytics <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Livestock Pop.</th>
                    <th className="py-2.5 px-3">Active Cases</th>
                    <th className="py-2.5 px-3">Vaccine %</th>
                    <th className="py-2.5 px-3">Outbreaks</th>
                    <th className="py-2.5 px-3">Lab TAT</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {districtData.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{d.district}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{d.population}</td>
                      <td className="py-3 px-3 font-bold text-rose-600">{d.cases}</td>
                      <td className="py-3 px-3 text-emerald-600 font-semibold">{d.vac}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{d.outbreaks}</td>
                      <td className="py-3 px-3 text-purple-600 font-mono text-[11px]">{d.labTat}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'HIGH_ALERT' ? 'bg-red-100 text-red-800' :
                          d.status === 'MODERATE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statewide Disease Trend Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Statewide Major Disease Burden Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-medium">Foot-and-Mouth Disease</span>
                <div className="text-lg font-black text-rose-600 mt-1">42% (Primary Burden)</div>
                <div className="text-[11px] text-slate-400">Ring vaccination ongoing</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-medium">Lumpy Skin Disease (LSD)</span>
                <div className="text-lg font-black text-amber-600 mt-1">28% (Vector surge)</div>
                <div className="text-[11px] text-slate-400">Goat pox buffer deployed</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-medium">Haemorrhagic Septicaemia</span>
                <div className="text-lg font-black text-blue-600 mt-1">15% (Monsoon related)</div>
                <div className="text-[11px] text-slate-400">Shed hygiene mandated</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-medium">PPR (Small Ruminants)</span>
                <div className="text-lg font-black text-purple-600 mt-1">10% (Goat/Sheep)</div>
                <div className="text-[11px] text-slate-400">Sub-clinical monitoring</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-medium">Black Quarter</span>
                <div className="text-lg font-black text-indigo-600 mt-1">4% (Localized)</div>
                <div className="text-[11px] text-slate-400">Low mortality impact</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-medium">Anthrax (Zoonotic)</span>
                <div className="text-lg font-black text-emerald-600 mt-1">1% (Zero fatal clusters)</div>
                <div className="text-[11px] text-slate-400">Carcass disposal secured</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Statewide Advisories & Strategic Reserves */}
        <div className="space-y-6">
          {/* Active Directorate Circulars */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" />
                Directorate Directives
              </h3>
              <button
                onClick={() => setIsAdvisoryModalOpen(true)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Issue Circular
              </button>
            </div>

            <div className="space-y-3">
              {advisories.map(adv => (
                <div key={adv.id} className="p-3 rounded-xl bg-blue-50/50 dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span className="line-clamp-1">{adv.title}</span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                      {adv.level}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 line-clamp-2">
                    {adv.content}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>{adv.issuedBy}</span>
                    <span>Valid: {adv.activeUntil}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Reserves Allocation */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Strategic Vaccine & Reagent Reserves
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">FMD Trivalent Buffer</div>
                  <div className="text-[11px] text-slate-500">Central Pune Depot: 250,000 Doses</div>
                </div>
                <span className="text-emerald-600 font-bold text-[11px]">ADEQUATE</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Goat Pox (LSD Heterologous)</div>
                  <div className="text-[11px] text-slate-500">Aurangabad Depot: 180,000 Doses</div>
                </div>
                <span className="text-emerald-600 font-bold text-[11px]">ADEQUATE</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">RT-PCR Reagent Kits</div>
                  <div className="text-[11px] text-slate-500">DIAL Network: 12,000 Tests</div>
                </div>
                <span className="text-emerald-600 font-bold text-[11px]">CALIBRATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statewide Directive Modal */}
      {isAdvisoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Issue Statewide Animal Husbandry Directive
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Transmitted officially to all 36 District Animal Husbandry Offices, Polyclinics, and Diagnostic Labs.
            </p>

            <form onSubmit={handleCreateStateAdvisory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Directive Subject / Gazette Title
                </label>
                <input
                  type="text"
                  value={advisoryTitle}
                  onChange={e => setAdvisoryTitle(e.target.value)}
                  placeholder="E.g., Statewide Vector-Borne Pathogen Surveillance & Ring Containment Protocol"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Disease Surveillance
                </label>
                <input
                  type="text"
                  value={advisoryDisease}
                  onChange={e => setAdvisoryDisease(e.target.value)}
                  placeholder="E.g., Foot-and-Mouth Disease & Lumpy Skin Disease"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Content & Directives
                </label>
                <textarea
                  rows={4}
                  value={advisoryContent}
                  onChange={e => setAdvisoryContent(e.target.value)}
                  placeholder="Enter detailed directives for all 36 District Veterinary Officers..."
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
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl shadow"
                >
                  Publish & Gazetted
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
