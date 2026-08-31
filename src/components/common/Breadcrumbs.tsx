import React from 'react';
import { User } from '../../types';
import { getRoleMetadata } from '../../auth/roles';
import { ChevronRight, Shield, Home } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';

interface BreadcrumbsProps {
  currentUser: User;
  activeModule: string;
  onNavigateHome?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentUser,
  activeModule,
  onNavigateHome
}) => {
  const { t } = useTranslation();
  const roleMeta = getRoleMetadata(currentUser.role);

  const getModuleTitle = (mod: string) => {
    switch (mod) {
      case 'dashboard':
        return t('dashboard', roleMeta.subtitle);
      case 'overview_dashboard':
        return t('dashboard', 'Overview Dashboard');
      case 'report_case':
        return t('reportCase', 'Report Disease Case');
      case 'vet_dashboard':
        return t('veterinaryDashboard', 'Veterinary Triage & Consultations');
      case 'animals':
        return currentUser.role === 'FARMER' ? t('myHerd', 'My Animals') : t('animals', 'Herd & Animal Registry');
      case 'herds':
        return t('herds', 'Herd Management');
      case 'laboratory':
        return t('laboratory', 'Diagnostic Lab Samples');
      case 'outbreaks':
        return t('outbreaks', 'Outbreak Surveillance & Radar');
      case 'vaccinations':
        return t('vaccinations', 'Vaccination Registry');
      case 'treatments':
        return t('treatments', 'Treatments & Prescriptions');
      case 'mortality':
        return t('mortality', 'Mortality Audit & Disposal');
      case 'knowledge_base':
        return t('diseaseKnowledgeBase', 'Veterinary Knowledge Base');
      case 'weather':
        return t('weatherEnvironment', 'Biometeorology & Climate Risk');
      case 'historical_trends':
        return t('historicalTrends', 'Epidemiological Trends');
      case 'reports_analytics':
        return t('reportsAnalytics', 'Analytics & Policy Reports');
      case 'testing_center':
        return t('quickScenarios', 'Diagnostic Testing Bench');
      case 'settings':
        return t('settings', 'Settings & Configuration');
      case 'system_admin':
        return t('settings', 'System Administration');
      default:
        return mod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1 py-0.5 overflow-x-auto no-scrollbar"
    >
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-colors shrink-0 cursor-pointer"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>LIVESTOCKGUARD</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

      <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 shrink-0">
        <span>{roleMeta.iconEmoji}</span>
        <span>{roleMeta.displayName}</span>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

      <span className="font-bold text-slate-900 dark:text-white truncate">
        {getModuleTitle(activeModule)}
      </span>
    </nav>
  );
};
