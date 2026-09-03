import React, { useMemo } from 'react';
import { User, Case, Outbreak, Animal, MortalityReport, Alert, WeatherData } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { CaseStatusBadge } from '../common/CaseStatusBadge';
import { CredibilityBadge } from '../common/CredibilityBadge';
import {
  PawPrint,
  AlertTriangle,
  Radio,
  Syringe,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  PlusCircle,
  Stethoscope,
  Skull,
  MapPin,
  TrendingUp,
  Clock,
  Sparkles,
  Search,
  PhoneCall,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  cases: Case[];
  outbreaks: Outbreak[];
  animals: Animal[];
  mortalities: MortalityReport[];
  alerts: Alert[];
  weather: WeatherData;
  onNavigate: (module: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  cases = [],
  outbreaks = [],
  animals = [],
  mortalities = [],
  alerts = [],
  weather,
  onNavigate,
  onSelectCase
}) => {
  // Key Aggregated Metrics
  const activeCases = (cases || []).filter(c => c.status !== 'RESOLVED' && c.status !== 'RULED_OUT');
  const criticalCases = (cases || []).filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH');
  const totalDeaths = (mortalities || []).reduce((acc, m) => acc + (m.deadCount || 0), 0);
  const activeOutbreaks = (outbreaks || []).filter(o => o.status === 'ACTIVE');
  const healthyAnimals = (animals || []).filter(a => a.currentHealthStatus === 'HEALTHY' || a.currentHealthStatus === 'RECOVERED').length;
  const sickAnimals = (animals || []).filter(a => a.currentHealthStatus === 'AFFECTED' || a.currentHealthStatus === 'UNDER_OBSERVATION').length;
  const overallCoverage = Math.round(((animals || []).filter(a => a.vaccinationCount > 0).length / Math.max((animals || []).length, 1)) * 100);

  // Dynamic Regional / Farmer Risk Evaluation
  const regionalRisk = useMemo(() => {
    if (criticalCases.length > 0 || activeOutbreaks.length > 0) {
      return {
        level: 'HIGH' as const,
        score: 82,
        title: 'Your area currently has a HIGH livestock health risk.',
        reasons: [
          `${criticalCases.length} high/critical cases reported within 10 km`,
          `${activeOutbreaks.length} active regional containment zone(s) in effect`,
          `Elevated vector & humidity conditions (${weather?.humidityPct ?? 78}% RH)`
        ]
      };
    }
    if (sickAnimals > 0 || activeCases.length > 0) {
      return {
        level: 'MODERATE' as const,
        score: 54,
        title: 'Your area currently has a MODERATE livestock health risk.',
        reasons: [
          `${activeCases.length} active clinical reports under observation`,
          `Herd vaccination coverage at ${overallCoverage}% (Target: 85%)`,
          `Seasonal weather shifts favor respiratory & oral pathogens`
        ]
      };
    }
    return {
      level: 'LOW' as const,
      score: 18,
      title: 'Your area currently has a LOW livestock health risk.',
      reasons: [
        'No critical clusters or active outbreaks in your taluka',
        'Herd health parameters are stable with routine monitoring',
        'Vaccination boosters up to date for majority stock'
      ]
    };
  }, [criticalCases, activeOutbreaks, sickAnimals, activeCases, overallCoverage, weather]);

  // Recent 4 Cases
  const recentCases = [...(cases || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  // Vaccinations Due (Next 30 Days)
  const upcomingVaccinations = (animals || []).filter(a => a.vaccinationCount === 0 || a.currentHealthStatus === 'UNDER_OBSERVATION').slice(0, 3);

  // Priority Alerts
  const priorityAlerts = (alerts || []).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* 1. Main Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 border border-emerald-800/40 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>LIVESTOCK GUARD • Early Detection & Prevention</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Protect Your Livestock.<br />
            <span className="text-emerald-400">Detect Health Risks Early.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Report symptoms, monitor animal health, identify disease risks and connect with veterinary services in real time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('report_case')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              REPORT HEALTH ISSUE
            </button>

            <button
              onClick={() => onNavigate('report_case')}
              className="bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold px-5 py-3.5 rounded-xl text-sm transition-all border border-slate-700 backdrop-blur-xs flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              CHECK DISEASE RISK
            </button>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-emerald-300" />
        </div>
      </div>

      {/* 2. Quick Action Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Actions & Core Services
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { id: 'animals', title: 'My Animals', icon: PawPrint, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { id: 'report_case', title: 'Report Issue', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { id: 'vaccinations', title: 'Vaccinations', icon: Syringe, color: 'text-purple-600 bg-purple-50 border-purple-200' },
            { id: 'treatments', title: 'Health Records', icon: FileSpreadsheet, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { id: 'alerts', title: 'Alerts', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200', count: (alerts || []).filter(a => !a.isRead).length },
            { id: 'risk_map', title: 'Risk Map', icon: MapPin, color: 'text-teal-600 bg-teal-50 border-teal-200' },
            { id: 'vet_dashboard', title: 'Vet Support', icon: Activity, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer group relative"
              >
                {action.count !== undefined && action.count > 0 && (
                  <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {action.count}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-emerald-700">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Livestock Health Overview
          </h2>
          <span className="text-xs text-slate-400">
            {weather?.districtName || 'Pune'}, {weather?.stateName || 'Maharashtra'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Total Animals */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Animals</span>
            <div className="text-2xl font-black text-slate-900">{(animals || []).length}</div>
            <p className="text-[11px] text-slate-400 font-medium">In your herd holdings</p>
          </div>

          {/* Healthy */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Healthy</span>
            <div className="text-2xl font-black text-emerald-700">{healthyAnimals}</div>
            <p className="text-[11px] text-emerald-600 font-medium">{Math.round((healthyAnimals / Math.max((animals || []).length, 1)) * 100)}% of stock</p>
          </div>

          {/* Affected */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Affected</span>
            <div className="text-2xl font-black text-amber-700">{sickAnimals}</div>
            <p className="text-[11px] text-amber-600 font-medium">Under observation / sick</p>
          </div>

          {/* Deaths */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Deaths</span>
            <div className="text-2xl font-black text-rose-700">{totalDeaths}</div>
            <p className="text-[11px] text-rose-600 font-medium">Recorded mortalities</p>
          </div>

          {/* Vaccination Coverage */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase">Vaccination Coverage</span>
            <div className="text-2xl font-black text-blue-700">{overallCoverage}%</div>
            <p className="text-[11px] text-blue-600 font-medium">FMD, HS & Blackleg</p>
          </div>
        </div>
      </div>

      {/* 4. "YOUR CURRENT HEALTH RISK" Panel */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-md transition-all ${
        (regionalRisk.level as string) === 'HIGH' || (regionalRisk.level as string) === 'CRITICAL'
          ? 'bg-rose-50/90 border-rose-200 text-rose-950'
          : (regionalRisk.level as string) === 'MODERATE'
          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
          : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider opacity-75">
              YOUR CURRENT HEALTH RISK
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              {regionalRisk.title}
            </h3>
          </div>

          <RiskBadge level={regionalRisk.level} score={regionalRisk.score} size="lg" />
        </div>

        <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-white/60 space-y-2 mb-4">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Surveillance Reasons & Contributing Factors:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {regionalRisk.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Updated in real time based on active case reports, weather vector models, and lab results.</span>
          </div>

          <button
            onClick={() => onNavigate('report_case')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Run Detailed Triage Check →
          </button>
        </div>
      </div>

      {/* 5. Split Section: Recent Reports + Vaccination Due & Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Recent Health Reports */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Recent Health Reports
              </h3>
              <p className="text-xs text-slate-500">Live surveillance cases in your region</p>
            </div>
            <button
              onClick={() => onNavigate('vet_dashboard')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              View All ({(cases || []).length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentCases.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 transition-all cursor-pointer flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{c.caseNumber}</span>
                    <span className="text-xs font-bold text-slate-800">{c.species}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Suspected: <span className="font-semibold text-emerald-800">{c.suspectedDiseases?.[0]?.diseaseName || 'Under Review'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {c.villageName}, {c.districtName} • {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <CredibilityBadge
                    score={c.credibilityScore}
                    tier={c.credibilityTier}
                    verificationState={c.verificationState}
                    isUrgent={c.isCriticalUrgentVerification}
                    size="sm"
                  />
                  <RiskBadge level={c.riskLevel} score={c.riskScore} size="sm" />
                  <CaseStatusBadge status={c.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Vaccinations Due & Recommended Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vaccinations Due Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Vaccinations Due / Overdue
                </h3>
              </div>
              <button
                onClick={() => onNavigate('vaccinations')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingVaccinations.map(animal => (
                <div
                  key={animal.id}
                  className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-blue-950">Tag: {animal.tagNumber}</span>
                    <span className="text-slate-600 block text-[11px]">{animal.species} • {animal.breed}</span>
                  </div>
                  <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px]">
                    FMD Booster Due
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Biosecurity Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Recommended Preventive Actions
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">1. Isolate New or Sick Animals</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Keep any animals exhibiting drooling or lameness in a separate quarantine pen.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">2. Disinfect Footbaths & Troughs</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Use 4% sodium carbonate or 2% Virkon at all livestock sheds and water points.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">3. Promptly Report Any Sudden Deaths</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Never open carcasses of animals that die suddenly to prevent spore dissemination.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
