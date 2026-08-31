import React from 'react';
import { Role } from '../../types';
import { store } from '../../services/store';
import { TRANSLATIONS } from '../../i18n/translations';
import { USER_ROLES, normalizeRole, getRoleMetadata } from '../../auth/roles';
import {
  LayoutDashboard,
  PawPrint,
  Layers,
  PlusCircle,
  Stethoscope,
  BookOpen,
  Syringe,
  Pill,
  Skull,
  Radio,
  MapPin,
  CloudSun,
  FlaskConical,
  Bell,
  TrendingUp,
  FileText,
  Settings,
  X,
  Zap,
  Users,
  ShieldCheck,
  Activity,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentRole: Role;
  activeModule: string;
  onSelectModule: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeModule,
  onSelectModule,
  isOpen,
  onClose
}) => {
  const currentLang = store.getLanguage();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const canonicalRole = normalizeRole(currentRole) || 'FARMER';
  const roleMeta = getRoleMetadata(canonicalRole);

  // Define navigational menu structure with strict role-filtering
  const navItems = [
    {
      id: 'dashboard',
      label: t.dashboard || 'Role Dashboard',
      icon: LayoutDashboard,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
      badge: 'Main'
    },
    {
      id: 'report_case',
      label: t.reportCase || 'Report Health Issue',
      icon: PlusCircle,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'SYSTEM_ADMIN'],
      badge: 'Quick'
    },
    {
      id: 'vet_dashboard',
      label: t.veterinaryDashboard || 'Clinical Triage & Cases',
      icon: Stethoscope,
      roles: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'SYSTEM_ADMIN'],
      badge: 'Priority'
    },
    {
      id: 'animals',
      label: canonicalRole === 'FARMER' ? t.myHerd : t.animals || 'Registered Animals',
      icon: PawPrint,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'SYSTEM_ADMIN']
    },
    {
      id: 'herds',
      label: t.herds || 'Herds & Flocks',
      icon: Layers,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'SYSTEM_ADMIN']
    },
    {
      id: 'risk_map',
      label: t.riskMap || 'Regional Risk Map',
      icon: MapPin,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'outbreaks',
      label: t.outbreaks || 'Outbreak Radar',
      icon: Radio,
      roles: ['FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
      badge: 'Live'
    },
    {
      id: 'laboratory',
      label: canonicalRole === 'LABORATORY_STAFF' ? 'Sample Queue & Tests' : t.laboratory || 'Diagnostic Lab',
      icon: FlaskConical,
      roles: ['LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'vaccinations',
      label: t.vaccinations || 'Vaccination Drives',
      icon: Syringe,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'treatments',
      label: t.treatments || 'Treatments & Rx',
      icon: Pill,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'SYSTEM_ADMIN']
    },
    {
      id: 'mortality',
      label: t.mortality || 'Mortality Reports',
      icon: Skull,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'historical_trends',
      label: t.historicalTrends || 'Epidemiological Trends',
      icon: TrendingUp,
      roles: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'reports_analytics',
      label: t.reportsAnalytics || 'Reports & Analytics',
      icon: FileText,
      roles: ['DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'knowledge_base',
      label: t.diseaseKnowledgeBase || 'Disease Knowledge Base',
      icon: BookOpen,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'weather',
      label: t.weatherEnvironment || 'Weather & Vector Risk',
      icon: CloudSun,
      roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    },
    {
      id: 'testing_center',
      label: 'Testing & Simulations',
      icon: Zap,
      roles: ['SYSTEM_ADMIN', 'STATE_ADMIN', 'DISTRICT_OFFICIAL', 'VETERINARIAN', 'FIELD_WORKER', 'FARMER'],
      badge: 'Sandbox'
    },
    {
      id: 'ml_management',
      label: 'ML Data & Models',
      icon: Cpu,
      roles: ['SYSTEM_ADMIN', 'STATE_ADMIN', 'VETERINARIAN', 'DISTRICT_OFFICIAL'],
      badge: 'V2'
    },
    {
      id: 'settings',
      label: t.settings || 'Settings & Config',
      icon: Settings,
      roles: ['SYSTEM_ADMIN', 'STATE_ADMIN']
    }
  ];

  const filteredNav = navItems.filter(item => 
    item.roles.includes(canonicalRole) || 
    (canonicalRole === 'LABORATORY_STAFF' && item.roles.includes('DIAGNOSTIC_LAB')) ||
    (canonicalRole === 'DIAGNOSTIC_LAB' && item.roles.includes('LABORATORY_STAFF'))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 h-screen lg:h-[calc(100vh-57px)] w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header on Mobile */}
        <div className="p-4 flex items-center justify-between lg:hidden border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <span>Navigation Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links Scroll Area */}
        <div className="p-3 space-y-1 overflow-y-auto grow">
          {/* Active Role Identifier Header */}
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 mb-2 pb-2">
            <span className="truncate">{roleMeta.shortLabel} WORKSPACE</span>
            <span className="text-xs">{roleMeta.iconEmoji}</span>
          </div>

          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Role Info Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="text-base">{roleMeta.iconEmoji}</span>
            <div className="min-w-0 grow">
              <div className="text-[11px] font-bold text-white truncate">
                {roleMeta.displayName}
              </div>
              <div className="text-[9px] text-emerald-400 font-mono truncate">
                Role: {canonicalRole}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
