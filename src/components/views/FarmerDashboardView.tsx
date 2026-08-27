import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  PhoneCall,
  PlusCircle,
  Clock,
  CheckCircle2,
  Thermometer,
  CloudRain,
  MapPin,
  ChevronRight,
  Info,
  Syringe,
  Activity,
  FileText
} from 'lucide-react';
import { store } from '../../services/store';
import { Animal, Case, Alert, FieldVisit, WeatherData, VaccinationRecord } from '../../types';

interface FarmerDashboardViewProps {
  onNavigate: (module: string) => void;
}

export const FarmerDashboardView: React.FC<FarmerDashboardViewProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [weather, setWeather] = useState<WeatherData>(store.getWeather(currentUser.districtId));

  const refreshData = () => {
    const user = store.getCurrentUser();
    setCurrentUser(user);
    setAnimals(store.getScopedAnimals());
    setCases(store.getScopedCases());
    setAlerts(store.getScopedAlerts());
    setFieldVisits(store.getScopedFieldVisits());
    setVaccinations(store.getScopedVaccinations());
    setWeather(store.getWeather(user.districtId));
  };

  useEffect(() => {
    refreshData();
    return store.subscribe(refreshData);
  }, []);

  const healthyAnimals = animals.filter(a => a.currentHealthStatus === 'HEALTHY' || a.currentHealthStatus === 'RECOVERED');
  const affectedAnimals = animals.filter(a => a.currentHealthStatus === 'AFFECTED' || a.currentHealthStatus === 'UNDER_OBSERVATION');
  const activeCases = cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'RULED_OUT');
  const pendingVisits = fieldVisits.filter(v => v.status === 'SCHEDULED' || v.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Farmer Livestock Guard Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Namaste, {currentUser.name}
            </h1>
            <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-300" />
              {currentUser.farmName || 'Patil Dairy Farm'} • {currentUser.village || 'Malegaon Budruk'}, Baramati, Pune
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('report-case')}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Report Sick Animal
            </button>
            <button
              onClick={() => onNavigate('animals')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-sm flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              My Herd ({animals.length})
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar (if any nearby warning) */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100 uppercase">
                {alerts[0].priority} Local Advisory
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(alerts[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
              {alerts[0].title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {alerts[0].message}
            </p>
          </div>
          <button
            onClick={() => onNavigate('outbreaks')}
            className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline shrink-0 flex items-center gap-1"
          >
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Key Health Metrics (3-column grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registered Animals</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{animals.length}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {healthyAnimals.length} in good health
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Observation / Sick</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{affectedAnimals.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeCases.length} active clinical cases
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming Field Visits</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{pendingVisits.length}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {pendingVisits[0]?.scheduledTime || 'No pending visits'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Weather & Vector Alert</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              {weather.temperatureC}°C
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5" />
              Vector Risk: {weather.vectorRiskIndex}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CloudRain className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Animals Status & Actionable Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Animals & Active Cases */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Cases / Sick Animals Tracking */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Active Health Reports & Doctor Reviews
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Status of animals reported with symptoms from your farm
                </p>
              </div>
              <button
                onClick={() => onNavigate('report-case')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                + New Report
              </button>
            </div>

            {activeCases.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  All Animals in Stable Health
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  No active sickness reports logged. If you notice symptoms like excessive salivation, fever, or skin nodules, report immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCases.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                            {c.caseNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                            c.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                          }`}>
                            {c.riskLevel} RISK
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
                          {c.species} {c.animalTag ? `(Tag: ${c.animalTag})` : ''} • {c.affectedCount} affected animal(s)
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-1">
                          {(c.symptoms || []).slice(0, 3).map((s, idx) => {
                            const label = typeof s === 'string' ? s : s?.symptomName || s?.symptomId || 'Symptom';
                            return (
                              <span key={idx} className="bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                                {label}
                              </span>
                            );
                          })}
                          {(c.symptoms || []).length > 3 && (
                            <span className="text-[11px] text-slate-400 self-center">+{(c.symptoms || []).length - 3} more</span>
                          )}
                        </div>

                        {c.suspectedDiseases && c.suspectedDiseases.length > 0 && (
                          <div className="text-xs text-amber-800 dark:text-amber-300 font-medium mt-2 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                            🩺 Suspected: {c.suspectedDiseases[0].diseaseName} ({Math.round(c.suspectedDiseases[0].screeningScore || 85)}% match)
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onNavigate('testing-center')}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
                      >
                        Track Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supportive Care Guidance Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-emerald-200/70 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 font-bold mb-3">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base">First-Response Biosecurity for Your Farm</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Simple immediate actions to protect your healthy animals before the Para-Vet arrives:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-2xs">
                <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  1. Strict Isolation
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Move sick animals to a separate shaded shed at least 10 meters away. Do not let them share water troughs.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-2xs">
                <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  2. Shed Disinfection
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Sprinkle slaked lime powder (Chuna) on the floor and spray 4% sodium carbonate / potassium permanganate.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-2xs">
                <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  3. Soft Diet & Hydration
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Provide soft cooked gruel (rice/ragi congee with jaggery) and clean cool water with electrolytes.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-100 dark:border-slate-700 shadow-2xs">
                <div className="font-bold text-rose-600 dark:text-rose-400 mb-1">
                  4. What NOT to Do
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Do not feed hard dry straw. Do not allow outside cattle into your shed. Never open blisters or cut skin nodules.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Field Visits, Vaccinations & Doctor Helpline */}
        <div className="space-y-6">
          {/* Scheduled Field Visits */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
              <span>Para-Vet & Doctor Visits</span>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Scheduled
              </span>
            </h3>

            {fieldVisits.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No scheduled visits today.</p>
            ) : (
              <div className="space-y-3">
                {fieldVisits.slice(0, 3).map(v => (
                  <div key={v.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                      <span>{v.purpose.replace('_', ' ')}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{v.scheduledTime}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <span>Worker:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{v.assignedWorkerName}</span>
                    </div>
                    {v.notes && (
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1.5 italic bg-white dark:bg-slate-800 p-1.5 rounded">
                        "{v.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vaccination Due Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Syringe className="w-4 h-4 text-emerald-600" />
                Vaccination Status
              </h3>
              <button
                onClick={() => onNavigate('vaccinations')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                View Log
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">FMD Booster (Trivalent)</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Next due: Sept 15, 2026</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                  UPCOMING
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Haemorrhagic Septicaemia (HS)</div>
                  <div className="text-[11px] text-slate-500">Completed June 2026</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  PROTECTED
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Veterinary Assistance Contact */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-300">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Emergency Doctor Helpline</h4>
                <p className="text-[11px] text-blue-200">Baramati Taluka Veterinary Polyclinic</p>
              </div>
            </div>
            <p className="text-xs text-blue-100 mt-2 mb-3">
              Available 24/7 for acute recumbency, bloat, high fever, or sudden cluster deaths.
            </p>
            <a
              href="tel:1962"
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Toll-Free: 1962 / +91 98224 88990
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
