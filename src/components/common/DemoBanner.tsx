import React, { useState } from 'react';
import { store } from '../../services/store';
import { Sparkles, X, Lock, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { getRoleMetadata } from '../../auth/roles';
import { User } from '../../types';

interface DemoBannerProps {
  currentUser: User;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ currentUser }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const isDemoMode = store.isDemoMode();

  if (isDismissed || !isDemoMode) {
    return null;
  }

  const roleMeta = getRoleMetadata(currentUser.role);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-b border-amber-300/40 dark:border-slate-800 px-4 py-1.5 transition-all text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>DEMO MODE</span>
          </span>
          <span className="text-slate-600 dark:text-slate-400 text-xs hidden sm:inline">
            Role switching enabled for demonstration. Currently viewing as:
          </span>
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
            <span>{roleMeta.iconEmoji}</span>
            <span>{roleMeta.displayName}</span>
            <span className="text-slate-400 font-normal hidden md:inline">({roleMeta.subtitle})</span>
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => store.setDemoMode(false)}
            className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
            title="Lock into single-user authenticated view"
          >
            <Lock className="w-3 h-3 text-slate-500" />
            <span className="hidden sm:inline">Test Real Auth Mode</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800"
            title="Dismiss banner for this session"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
