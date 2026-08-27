import React from 'react';
import { User, Role, Case } from '../../types';
import { normalizeRole, getRoleMetadata } from '../../auth/roles';
import { FarmerDashboardView } from '../views/FarmerDashboardView';
import { FieldWorkerDashboardView } from '../views/FieldWorkerDashboardView';
import { VeterinaryDashboardView } from '../views/VeterinaryDashboardView';
import { LaboratoryDashboardView } from '../views/LaboratoryDashboardView';
import { DistrictOfficialDashboardView } from '../views/DistrictOfficialDashboardView';
import { StateAdminDashboardView } from '../views/StateAdminDashboardView';
import { SystemAdminDashboardView } from '../views/SystemAdminDashboardView';
import { ShieldAlert, RefreshCw, PhoneCall, CheckCircle2, Sparkles, Terminal } from 'lucide-react';
import { store } from '../../services/store';

export interface RoleRouterProps {
  currentUser: User | null;
  cases: Case[];
  onNavigate: (module: string) => void;
  onSelectCase?: (caseId: string) => void;
  showDevBadge?: boolean;
}

export const RoleRouter: React.FC<RoleRouterProps> = ({
  currentUser,
  cases,
  onNavigate,
  onSelectCase,
  showDevBadge = true
}) => {
  const role = currentUser?.role ? normalizeRole(currentUser.role) : null;

  // Unknown or invalid role error boundary
  if (!currentUser || !role) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Unable to determine your user role.
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              The role assigned to your profile could not be validated against the 7 protected operational roles in the LivestockGuard registry.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                store.switchRole('FARMER');
                window.location.reload();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Session</span>
            </button>

            <button
              onClick={() => store.switchRole('FARMER')}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
            >
              Select Default Demo Role (Farmer)
            </button>

            <a
              href="mailto:support@livestockguard.gov.in"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors pt-1"
            >
              Contact Administrator
            </a>
          </div>
        </div>
      </div>
    );
  }

  const roleMeta = getRoleMetadata(role);

  // Deterministic rendering for all 7 protected stakeholder dashboards
  const renderDashboardComponent = () => {
    switch (role) {
      case 'FARMER':
        return <FarmerDashboardView onNavigate={onNavigate} />;

      case 'FIELD_WORKER':
        return <FieldWorkerDashboardView onNavigate={onNavigate} />;

      case 'VETERINARIAN':
        return (
          <VeterinaryDashboardView
            cases={cases}
            currentUser={currentUser}
            onSelectCase={onSelectCase}
          />
        );

      case 'DIAGNOSTIC_LAB':
      case 'LABORATORY_STAFF':
        return <LaboratoryDashboardView onNavigate={onNavigate} />;

      case 'DISTRICT_OFFICIAL':
        return <DistrictOfficialDashboardView onNavigate={onNavigate} />;

      case 'STATE_ADMIN':
        return <StateAdminDashboardView onNavigate={onNavigate} />;

      case 'SYSTEM_ADMIN':
        return <SystemAdminDashboardView onNavigate={onNavigate} />;

      default:
        return (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl">
            <h3 className="text-base font-bold text-rose-800">
              Unmapped Role: {role}
            </h3>
            <p className="text-xs text-rose-600 mt-1">
              Please contact the system administrator to register this role.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Protected Architecture Dev Identifier Badge */}
      {showDevBadge && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 text-slate-300 rounded-xl text-[11px] font-mono border border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 font-sans font-bold">Role Architecture:</span>
            <span className="text-emerald-400 font-bold">{roleMeta.displayName}</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">
              Dashboard Component: <strong className="text-white font-bold">{roleMeta.dashboardComponent}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold uppercase">
              Protected Architecture Locked
            </span>
          </div>
        </div>
      )}

      {/* Actual Rendered Role Dashboard */}
      {renderDashboardComponent()}
    </div>
  );
};
