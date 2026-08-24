import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, Role, LanguageCode, Alert } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import {
  Shield,
  Bell,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  PhoneCall,
  Menu,
  ChevronDown,
  UserCheck,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  alerts: Alert[];
  onOpenNotifications: () => void;
  onOpenIvr: () => void;
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  alerts,
  onOpenNotifications,
  onOpenIvr,
  onToggleSidebar,
  onSearch
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = store.getLanguage();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isOffline = store.isOffline();
  const offlineQueue = store.getOfflineQueue();
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const rolesList: { role: Role; label: string; desc: string; icon: string }[] = [
    { role: 'FARMER', label: 'Farmer', desc: 'Livestock Owner / Smallholder', icon: '🌾' },
    { role: 'FIELD_WORKER', label: 'Field Worker / Para-Vet', desc: 'Doorstep surveillance & tagging', icon: '🛵' },
    { role: 'VETERINARIAN', label: 'Veterinarian (Doctor)', desc: 'Clinical diagnosis & prescriptions', icon: '🩺' },
    { role: 'LABORATORY_STAFF', label: 'Diagnostic Laboratory', desc: 'Sample testing & PCR verification', icon: '🧪' },
    { role: 'DISTRICT_OFFICIAL', label: 'District AH Official', desc: 'Outbreak radar & block response', icon: '🏛️' },
    { role: 'STATE_ADMIN', label: 'State Admin (Directorate)', desc: 'State analytics & vaccine policy', icon: '📊' },
    { role: 'SYSTEM_ADMIN', label: 'System Administrator', desc: 'Rules configuration & audit trails', icon: '⚙️' }
  ];

  const handleRoleSelect = (r: Role) => {
    store.switchRole(r);
    setRoleDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-2.5 transition-all shadow-2xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Shield className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">
                  LIVESTOCK<span className="text-emerald-600">GUARD</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded uppercase">
                  Gov AH
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-xs">
                Animal Health Early-Warning & Biosecurity Network
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-slate-900 border border-slate-200 focus:border-emerald-500 rounded-xl transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>

        {/* Right: Role Switcher, IVR, Language, Offline Sync & Alerts */}
        <div className="flex items-center gap-2">
          {/* IVR Toll Free Button */}
          <button
            onClick={onOpenIvr}
            className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Open Toll-Free IVR Voice Reporting Gateway"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>1800-419-VET (IVR)</span>
          </button>

          {/* Offline / Online Toggle */}
          <button
            onClick={() => store.toggleOfflineMode()}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={isOffline ? 'Click to switch Online & Sync' : 'Click to simulate Offline Field Mode'}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isOffline ? `Offline (${offlineQueue.length})` : 'Online'}
            </span>
          </button>

          {/* Sync Now Button if pending */}
          {offlineQueue.length > 0 && (
            <button
              onClick={() => store.syncPendingOfflineRecords()}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sync {offlineQueue.length}</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="uppercase text-xs">{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी (Hindi)' },
                  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
                  { code: 'te', label: 'తెలుగు (Telugu)' }
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      store.setLanguage(l.code as LanguageCode);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      currentLang === l.code ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.label}</span>
                    {currentLang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Center Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* 1-Click Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-medium text-emerald-700 uppercase tracking-tight">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch 1-Click Role & Persona
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Experience the application as any veterinary stakeholder.
                  </p>
                </div>

                <div className="space-y-1">
                  {rolesList.map(r => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r.role)}
                      className={`w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                        currentUser.role === r.role
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-base shrink-0">{r.icon}</span>
                      <div className="grow min-w-0">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{r.label}</span>
                          {currentUser.role === r.role && (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal truncate">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
