import React from 'react';
import { Role } from '../../types';
import { store } from '../../services/store';
import { TRANSLATIONS } from '../../i18n/translations';
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
  X
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

  // Module items configuration
  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'report_case', label: t.reportCase, icon: PlusCircle, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'SYSTEM_ADMIN'], badge: 'Quick' },
    { id: 'vet_dashboard', label: t.veterinaryDashboard, icon: Stethoscope, roles: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'], badge: 'Triage' },
    { id: 'animals', label: t.animals, icon: PawPrint, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'SYSTEM_ADMIN'] },
    { id: 'herds', label: t.herds, icon: Layers, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'SYSTEM_ADMIN'] },
    { id: 'risk_map', label: t.riskMap, icon: MapPin, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'outbreaks', label: t.outbreaks, icon: Radio, roles: ['FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'], badge: 'Live' },
    { id: 'laboratory', label: t.laboratory, icon: FlaskConical, roles: ['LABORATORY_STAFF', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'vaccinations', label: t.vaccinations, icon: Syringe, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'treatments', label: t.treatments, icon: Pill, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'SYSTEM_ADMIN'] },
    { id: 'mortality', label: t.mortality, icon: Skull, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'knowledge_base', label: t.diseaseKnowledgeBase, icon: BookOpen, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'weather', label: t.weatherEnvironment, icon: CloudSun, roles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'historical_trends', label: t.historicalTrends, icon: TrendingUp, roles: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'reports_analytics', label: t.reportsAnalytics, icon: FileText, roles: ['DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'testing_center', label: 'Testing & Simulations', icon: FlaskConical, roles: ['SYSTEM_ADMIN', 'STATE_ADMIN', 'DISTRICT_OFFICIAL', 'VETERINARIAN', 'FIELD_WORKER', 'FARMER'], badge: 'Admin' },
    { id: 'settings', label: t.settings, icon: Settings, roles: ['SYSTEM_ADMIN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN'] }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentRole));

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
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {currentRole.replace('_', ' ')} WORKSPACE
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

        {/* Bottom System Status Badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Surveillance Core</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              v2.6 • PostgreSQL Ingest
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
