import React, { useState, useRef, useEffect } from 'react';
import { Role, User } from '../../types';
import { store } from '../../services/store';
import { ROLE_DEFINITIONS, getRoleMetadata } from '../../auth/roles';
import {
  Sparkles,
  ChevronDown,
  Lock,
  Check,
  X,
  ArrowRight,
  LogOut,
  UserCheck,
  BadgeCheck,
  Building2,
  Phone,
  Mail,
  ShieldAlert
} from 'lucide-react';

interface DemoRoleSwitcherProps {
  currentUser: User;
  onSwitchRole: (role: Role) => void;
  isSwitching?: boolean;
}

export const DemoRoleSwitcher: React.FC<DemoRoleSwitcherProps> = ({
  currentUser,
  onSwitchRole,
  isSwitching = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  const isDemoMode = store.isDemoMode();
  const currentRoleMeta = getRoleMetadata(currentUser.role);

  // Ordered list of the 7 core operational roles
  const rolesList: { role: Role; def: typeof ROLE_DEFINITIONS[string] }[] = [
    { role: 'FARMER', def: ROLE_DEFINITIONS.FARMER },
    { role: 'FIELD_WORKER', def: ROLE_DEFINITIONS.FIELD_WORKER },
    { role: 'VETERINARIAN', def: ROLE_DEFINITIONS.VETERINARIAN },
    { role: 'LABORATORY_STAFF', def: ROLE_DEFINITIONS.LABORATORY_STAFF },
    { role: 'DISTRICT_OFFICIAL', def: ROLE_DEFINITIONS.DISTRICT_OFFICIAL },
    { role: 'STATE_ADMIN', def: ROLE_DEFINITIONS.STATE_ADMIN },
    { role: 'SYSTEM_ADMIN', def: ROLE_DEFINITIONS.SYSTEM_ADMIN }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setIsAuthMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (role: Role) => {
    if (!isDemoMode) return;
    if (role === currentUser.role) {
      setIsOpen(false);
      setIsMobileSheetOpen(false);
      return;
    }
    setIsOpen(false);
    setIsMobileSheetOpen(false);
    onSwitchRole(role);
  };

  const handleLogout = () => {
    store.logout();
  };

  // -------------------------------------------------------------
  // REAL AUTHENTICATED MODE (Profile Badge with Logout Dropdown)
  // -------------------------------------------------------------
  if (!isDemoMode) {
    return (
      <div className="relative flex items-center gap-2" ref={authDropdownRef}>
        <button
          onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer ${
            isAuthMenuOpen ? 'ring-2 ring-emerald-500/30 border-emerald-500' : ''
          }`}
          aria-haspopup="true"
          aria-expanded={isAuthMenuOpen}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 hidden sm:inline">
              Authenticated
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-sm">{currentRoleMeta.iconEmoji}</span>
            <span className="truncate max-w-[120px] sm:max-w-[150px] font-extrabold text-slate-900 dark:text-white">
              {currentUser.name.split(' ')[0]} ({currentRoleMeta.shortLabel})
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isAuthMenuOpen ? 'rotate-180 text-emerald-600' : ''}`} />
        </button>

        {/* Authenticated Profile Dropdown Menu */}
        {isAuthMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
            {/* User Profile Card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-100 dark:border-slate-750">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl p-1.5 bg-white dark:bg-slate-700 rounded-xl shadow-2xs">
                    {currentRoleMeta.iconEmoji}
                  </span>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {currentRoleMeta.displayName}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 shrink-0">
                  ACTIVE
                </span>
              </div>

              <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> Email:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{currentUser.email}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{currentUser.phone}</span>
                </div>
                {currentUser.licenseNumber && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">License:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{currentUser.licenseNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Switch to Sandbox Testing */}
            <button
              onClick={() => {
                store.setDemoMode(true);
                setIsAuthMenuOpen(false);
              }}
              className="w-full text-left p-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Switch to Demo Sandbox</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 text-rose-700 dark:text-rose-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer border border-rose-200 dark:border-rose-800 hover:border-rose-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out / Exit Session</span>
            </button>
          </div>
        )}

        {/* Quick Dev Switcher for Toggle to Demo Mode */}
        <button
          onClick={() => store.setDemoMode(true)}
          className="hidden xl:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Enable Demo Role Switcher to simulate other veterinary roles"
        >
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Demo Sandbox</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEMO MODE (Explicit Demo Switcher with Full 7-Role Dropdown)
  // -------------------------------------------------------------
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Desktop & Tablet Trigger */}
      <div className="hidden sm:flex items-center gap-1.5 bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-slate-800 dark:to-slate-850 p-1 rounded-2xl border border-emerald-300/70 dark:border-emerald-600/30 shadow-xs">
        {/* Demo Mode Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/15 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 rounded-xl text-[11px] font-extrabold tracking-tight">
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span>Demo Mode</span>
        </div>

        {/* Active Role Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 pl-2.5 pr-2 py-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer ${
            isOpen ? 'ring-2 ring-emerald-500/30 border-emerald-500' : ''
          }`}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">
            Active Role:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-sm">{currentRoleMeta.iconEmoji}</span>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentRoleMeta.displayName}
            </span>
          </div>

          <div
            className={`w-2 h-2 rounded-full ${
              currentRoleMeta.primaryColor === 'emerald'
                ? 'bg-emerald-500'
                : currentRoleMeta.primaryColor === 'teal'
                ? 'bg-teal-500'
                : currentRoleMeta.primaryColor === 'blue'
                ? 'bg-blue-500'
                : currentRoleMeta.primaryColor === 'purple'
                ? 'bg-purple-500'
                : currentRoleMeta.primaryColor === 'amber'
                ? 'bg-amber-500'
                : currentRoleMeta.primaryColor === 'indigo'
                ? 'bg-indigo-500'
                : 'bg-slate-500'
            }`}
          />

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Compact Trigger */}
      <button
        onClick={() => setIsMobileSheetOpen(true)}
        className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-linear-to-r from-amber-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        <span className="text-xs">{currentRoleMeta.iconEmoji}</span>
        <span className="truncate max-w-[90px]">{currentRoleMeta.shortLabel}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Desktop Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>SWITCH DEMO ROLE</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Select any operational role to test its dedicated dashboard.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
              7 ROLES
            </span>
          </div>

          {/* Role List */}
          <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
            {rolesList.map(({ role, def }) => {
              const isActive = currentUser.role === role;
              return (
                <button
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-all cursor-pointer group ${
                    isActive
                      ? `${def.colorClasses.bg} ${def.colorClasses.border} border shadow-2xs font-semibold`
                      : `hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent`
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                      isActive
                        ? `${def.colorClasses.badge}`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {def.iconEmoji}
                  </div>

                  <div className="grow min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold tracking-tight ${
                          isActive
                            ? `${def.colorClasses.text}`
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {def.displayName}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {def.subtitle}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {def.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 py-1 flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                store.setDemoMode(false);
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Lock to Real Auth</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Modal */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
            onClick={() => setIsMobileSheetOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>SWITCH DEMO ROLE</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a role to inspect its unique stakeholder dashboard.
                </p>
              </div>
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {rolesList.map(({ role, def }) => {
                const isActive = currentUser.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full min-h-[48px] text-left p-3 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer ${
                      isActive
                        ? `${def.colorClasses.bg} ${def.colorClasses.border} border-2 font-bold`
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{def.iconEmoji}</span>
                    <div className="grow min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {def.displayName}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {def.subtitle}
                      </div>
                    </div>
                    {isActive ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  store.setDemoMode(false);
                  setIsMobileSheetOpen(false);
                }}
                className="w-full py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Switch to Real Authenticated Mode</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

