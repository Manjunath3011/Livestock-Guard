import { Role } from '../types';

/**
 * ============================================================================
 * PROTECTED ARCHITECTURE: CENTRAL USER ROLES & ROLE ROUTING MATRIX
 * ============================================================================
 * The 7 operational roles of LivestockGuard are strictly segregated and protected.
 * No generic dashboard fallback should replace these distinct stakeholder interfaces.
 */

export const USER_ROLES = {
  FARMER: 'FARMER',
  FIELD_WORKER: 'FIELD_WORKER',
  VETERINARIAN: 'VETERINARIAN',
  DIAGNOSTIC_LAB: 'DIAGNOSTIC_LAB',
  LABORATORY_STAFF: 'LABORATORY_STAFF', // Canonical alias for DIAGNOSTIC_LAB
  DISTRICT_OFFICIAL: 'DISTRICT_OFFICIAL',
  STATE_ADMIN: 'STATE_ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
} as const;

export type CanonicalRole =
  | 'FARMER'
  | 'FIELD_WORKER'
  | 'VETERINARIAN'
  | 'DIAGNOSTIC_LAB'
  | 'LABORATORY_STAFF'
  | 'DISTRICT_OFFICIAL'
  | 'STATE_ADMIN'
  | 'SYSTEM_ADMIN';

export interface RoleMetadata {
  id: Role;
  canonicalName: string;
  displayName: string;
  shortLabel: string;
  subtitle: string;
  description: string;
  iconEmoji: string;
  dashboardComponent: string;
  defaultModule: string;
  badgeClass: string;
  primaryColor: 'emerald' | 'teal' | 'blue' | 'purple' | 'amber' | 'indigo' | 'slate';
  colorClasses: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    accent: string;
    hover: string;
  };
}

export const ROLE_DEFINITIONS: Record<string, RoleMetadata> = {
  FARMER: {
    id: 'FARMER',
    canonicalName: 'farmer',
    displayName: 'Farmer',
    shortLabel: 'Farmer',
    subtitle: 'My Livestock',
    description: 'Protect and manage your animals',
    iconEmoji: '👨🌾',
    dashboardComponent: 'FarmerDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    primaryColor: 'emerald',
    colorClasses: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
      accent: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
    }
  },
  FIELD_WORKER: {
    id: 'FIELD_WORKER',
    canonicalName: 'field_worker',
    displayName: 'Field Worker / Para-Vet',
    shortLabel: 'Field Worker',
    subtitle: 'Field Operations',
    description: 'Manage visits, cases and field activities',
    iconEmoji: '📱',
    dashboardComponent: 'FieldWorkerDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    primaryColor: 'teal',
    colorClasses: {
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      text: 'text-teal-700 dark:text-teal-400',
      border: 'border-teal-200 dark:border-teal-800',
      badge: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700',
      accent: 'bg-teal-600 hover:bg-teal-700 text-white',
      hover: 'hover:bg-teal-50 dark:hover:bg-teal-950/40'
    }
  },
  VETERINARIAN: {
    id: 'VETERINARIAN',
    canonicalName: 'veterinarian',
    displayName: 'Veterinarian',
    shortLabel: 'Veterinarian',
    subtitle: 'Veterinary Command Center',
    description: 'Assess and manage animal health cases',
    iconEmoji: '👨⚕️',
    dashboardComponent: 'VeterinaryDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    primaryColor: 'blue',
    colorClasses: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
      accent: 'bg-blue-600 hover:bg-blue-700 text-white',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/40'
    }
  },
  DIAGNOSTIC_LAB: {
    id: 'LABORATORY_STAFF',
    canonicalName: 'diagnostic_lab',
    displayName: 'Diagnostic Laboratory',
    shortLabel: 'Diagnostic Lab',
    subtitle: 'Laboratory Operations',
    description: 'Manage samples and diagnostic testing',
    iconEmoji: '🧪',
    dashboardComponent: 'LaboratoryDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    primaryColor: 'purple',
    colorClasses: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
      accent: 'bg-purple-600 hover:bg-purple-700 text-white',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-950/40'
    }
  },
  LABORATORY_STAFF: {
    id: 'LABORATORY_STAFF',
    canonicalName: 'diagnostic_lab',
    displayName: 'Diagnostic Laboratory',
    shortLabel: 'Diagnostic Lab',
    subtitle: 'Laboratory Operations',
    description: 'Manage samples and diagnostic testing',
    iconEmoji: '🧪',
    dashboardComponent: 'LaboratoryDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    primaryColor: 'purple',
    colorClasses: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
      accent: 'bg-purple-600 hover:bg-purple-700 text-white',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-950/40'
    }
  },
  DISTRICT_OFFICIAL: {
    id: 'DISTRICT_OFFICIAL',
    canonicalName: 'district_official',
    displayName: 'District AH Official',
    shortLabel: 'District Official',
    subtitle: 'District Animal Health Command Center',
    description: 'Monitor disease risks across the district',
    iconEmoji: '🏛️',
    dashboardComponent: 'DistrictOfficialDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    primaryColor: 'amber',
    colorClasses: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700',
      accent: 'bg-amber-600 hover:bg-amber-700 text-white',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-950/40'
    }
  },
  STATE_ADMIN: {
    id: 'STATE_ADMIN',
    canonicalName: 'state_admin',
    displayName: 'State Admin / Directorate',
    shortLabel: 'State Admin',
    subtitle: 'State Animal Health Command Center',
    description: 'Monitor statewide livestock health',
    iconEmoji: '🏢',
    dashboardComponent: 'StateAdminDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    primaryColor: 'indigo',
    colorClasses: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700',
      accent: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
    }
  },
  SYSTEM_ADMIN: {
    id: 'SYSTEM_ADMIN',
    canonicalName: 'system_admin',
    displayName: 'System Admin',
    shortLabel: 'System Admin',
    subtitle: 'System Administration',
    description: 'Manage LivestockGuard configuration',
    iconEmoji: '⚙️',
    dashboardComponent: 'SystemAdminDashboardView',
    defaultModule: 'dashboard',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primaryColor: 'slate',
    colorClasses: {
      bg: 'bg-slate-100 dark:bg-slate-800/50',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700',
      badge: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      accent: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white',
      hover: 'hover:bg-slate-100 dark:hover:bg-slate-800'
    }
  }
};

/**
 * Normalize any role string representation to a valid canonical Role
 */
export function normalizeRole(roleInput: string | null | undefined): Role | null {
  if (!roleInput) return null;
  const cleaned = roleInput.trim().toUpperCase().replace(/[-\s]/g, '_');
  
  if (cleaned === 'FARMER') return 'FARMER';
  if (cleaned === 'FIELD_WORKER' || cleaned === 'FIELD' || cleaned === 'PARA_VET') return 'FIELD_WORKER';
  if (cleaned === 'VETERINARIAN' || cleaned === 'VET' || cleaned === 'DOCTOR') return 'VETERINARIAN';
  if (cleaned === 'DIAGNOSTIC_LAB' || cleaned === 'LAB' || cleaned === 'LABORATORY' || cleaned === 'LABORATORY_STAFF') return 'LABORATORY_STAFF';
  if (cleaned === 'DISTRICT_OFFICIAL' || cleaned === 'DISTRICT' || cleaned === 'OFFICIAL') return 'DISTRICT_OFFICIAL';
  if (cleaned === 'STATE_ADMIN' || cleaned === 'STATE' || cleaned === 'DIRECTORATE') return 'STATE_ADMIN';
  if (cleaned === 'SYSTEM_ADMIN' || cleaned === 'SYSADMIN' || cleaned === 'ADMIN') return 'SYSTEM_ADMIN';
  
  return null;
}

/**
 * Get role metadata safely with fallback
 */
export function getRoleMetadata(role: Role): RoleMetadata {
  return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.FARMER;
}

/**
 * Access Control Matrix for direct URL/Module protection
 */
export const MODULE_PERMISSIONS: Record<string, Role[]> = {
  dashboard: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  overview_dashboard: ['DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  report_case: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'SYSTEM_ADMIN'],
  vet_dashboard: ['VETERINARIAN', 'SYSTEM_ADMIN', 'DISTRICT_OFFICIAL'],
  animals: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'SYSTEM_ADMIN'],
  herds: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'SYSTEM_ADMIN'],
  risk_map: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  outbreaks: ['FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  laboratory: ['LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  testing_center: ['SYSTEM_ADMIN', 'STATE_ADMIN', 'DISTRICT_OFFICIAL', 'VETERINARIAN', 'FIELD_WORKER', 'FARMER'],
  vaccinations: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  treatments: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'SYSTEM_ADMIN'],
  mortality: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  knowledge_base: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  weather: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  historical_trends: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  reports_analytics: ['DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
  settings: ['SYSTEM_ADMIN', 'STATE_ADMIN', 'DISTRICT_OFFICIAL'],
  system_admin: ['SYSTEM_ADMIN']
};

/**
 * Check whether a user with a given role has authorization to access a specific module
 */
export function canUserAccessModule(role: Role | null | undefined, module: string): boolean {
  if (!role) return false;
  const canonical = normalizeRole(role);
  if (!canonical) return false;
  
  const normalizedModule = (module || 'dashboard').replace(/-/g, '_');
  const allowedRoles = MODULE_PERMISSIONS[normalizedModule];
  
  if (!allowedRoles) {
    // Unknown or default module routes to role dashboard which is always accessible
    return true;
  }
  
  return allowedRoles.includes(canonical) || 
    (canonical === 'LABORATORY_STAFF' && allowedRoles.includes('DIAGNOSTIC_LAB')) ||
    (canonical === 'DIAGNOSTIC_LAB' && allowedRoles.includes('LABORATORY_STAFF'));
}
