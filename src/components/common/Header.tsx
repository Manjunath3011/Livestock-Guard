import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, Role, LanguageCode, Alert } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';
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
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  alerts: Alert[];
  onOpenNotifications: () => void;
  onOpenIvr: () => void;
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
  onSwitchRole?: (role: Role) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  alerts = [],
  onOpenNotifications,
  onOpenIvr,
  onToggleSidebar,
  onSearch,
  onSwitchRole
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = store.getLanguage();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isOffline = store.isOffline();
  const offlineQueue = store.getOfflineQueue() || [];
  const unreadAlerts = (alerts || []).filter(a => !a.isRead).length;

  const handleRoleSelect = (r: Role) => {
    store.switchRole(r);
    if (onSwitchRole) {
      onSwitchRole(r);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-2.5 transition-all shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                  LIVESTOCK<span className="text-emerald-600 dark:text-emerald-400">GUARD</span>
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded uppercase border border-emerald-300 dark:border-emerald-800">
                  Gov AH
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs">
                Animal Health Early-Warning & Biosecurity Network
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder={t.searchPlaceholder || 'Search cases, animals, tags...'}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>

        {/* Right: Demo Role Switcher, IVR, Language, Offline Sync & Alerts */}
        <div className="flex items-center gap-2">
          {/* IVR Toll Free Gateway */}
          <button
            onClick={onOpenIvr}
            className="hidden xl:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Open Toll-Free IVR Voice Reporting Gateway"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>1800-419-VET</span>
          </button>

          {/* Offline / Online Mode Toggle */}
          <button
            onClick={() => store.toggleOfflineMode()}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isOffline
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-750'
            }`}
            title={isOffline ? 'Click to switch Online & Sync' : 'Click to simulate Offline Field Mode'}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isOffline ? `Offline (${(offlineQueue || []).length})` : 'Online'}
            </span>
          </button>

          {/* Sync Now Button if pending items */}
          {(offlineQueue || []).length > 0 && (
            <button
              onClick={() => store.syncPendingOfflineRecords()}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sync {(offlineQueue || []).length}</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 p-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Select application language"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="uppercase text-xs font-bold">{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी (Hindi)' },
                  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
                  { code: 'te', label: 'తెలుగు (Telugu)' },
                  { code: 'mr', label: 'मराठी (Marathi)' }
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      store.setLanguage(l.code as LanguageCode);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors ${
                      currentLang === l.code ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-300'
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
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Open Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Dedicated Demo Role Switcher / Authenticated Mode Badge */}
          <DemoRoleSwitcher
            currentUser={currentUser}
            onSwitchRole={handleRoleSelect}
          />
        </div>
      </div>
    </header>
  );
};

