import React from 'react';
import { Role } from '../../types';
import { getRoleMetadata } from '../../auth/roles';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';

interface AccessDeniedViewProps {
  userRole: Role;
  attemptedModule: string;
  onRedirectHome: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  userRole,
  attemptedModule,
  onRedirectHome
}) => {
  const roleMeta = getRoleMetadata(userRole);

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-800 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 rounded-full text-xs font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>403 Access Denied</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Insufficient Role Permissions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your authenticated role as <strong className="text-slate-900 dark:text-white">{roleMeta.displayName}</strong> ({userRole}) does not have administrative clearance to access the <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-rose-600 dark:text-rose-400 font-bold">{attemptedModule}</code> module.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Role-Based Clearance Enforced</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Access to veterinary command centers, diagnostic test pipelines, and state epidemiological data is restricted according to statutory biosecurity protocols.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onRedirectHome}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {roleMeta.shortLabel} Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
