import {
  User,
  Role,
  Farm,
  Animal,
  TemporaryAnimal,
  HistoricalCaseLink,
  Herd,
  Case,
  Outbreak,
  LabSample,
  VaccinationRecord,
  TreatmentRecord,
  MortalityReport,
  Alert,
  WeatherData,
  SystemConfig,
  OfflineSyncItem,
  LanguageCode,
  CaseStatus,
  TestResult,
  FollowUpRecord,
  FieldVisit,
  Advisory,
  Species,
  AnimalPhoto,
  AnimalPhotoType
} from '../types';
import {
  SEED_USERS,
  SEED_FARMS,
  SEED_HERDS,
  SEED_ANIMALS,
  SEED_CASES,
  SEED_OUTBREAKS,
  SEED_LAB_SAMPLES,
  SEED_VACCINATIONS,
  SEED_TREATMENTS,
  SEED_MORTALITY_REPORTS,
  SEED_ALERTS,
  SEED_WEATHER,
  SEED_FIELD_VISITS,
  SEED_ADVISORIES
} from '../data/seedData';
import { assessLivestockRisk, DEFAULT_CONFIG } from './riskEngine';
import { HybridRiskEngine } from './HybridRiskEngine';
import { trainingCandidateQueueService } from './TrainingCandidateQueue';
import { ReportCredibilityEngine } from './ReportCredibilityEngine';
import {
  CredibilityTier,
  CredibilityStatus,
  VerificationState,
  VerificationEvidenceItem,
  CredibilityAuditRecord,
  CredibilityOverviewMetrics
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'lg_current_user',
  CURRENT_ROLE: 'lg_current_role',
  USERS: 'lg_users',
  FARMS: 'lg_farms',
  HERDS: 'lg_herds',
  ANIMALS: 'lg_animals',
  CASES: 'lg_cases',
  OUTBREAKS: 'lg_outbreaks',
  LAB_SAMPLES: 'lg_lab_samples',
  VACCINATIONS: 'lg_vaccinations',
  TREATMENTS: 'lg_treatments',
  MORTALITY: 'lg_mortality',
  ALERTS: 'lg_alerts',
  WEATHER: 'lg_weather',
  SYSTEM_CONFIG: 'lg_config',
  OFFLINE_QUEUE: 'lg_offline_queue',
  LANGUAGE: 'lg_language',
  IS_OFFLINE: 'lg_is_offline_simulated',
  FIELD_VISITS: 'lg_field_visits',
  ADVISORIES: 'lg_advisories',
  TEMPORARY_ANIMALS: 'lg_temporary_animals',
  DEMO_MODE: 'lg_demo_mode',
  AUTH_USER: 'lg_auth_user',
  IS_LOGGED_IN: 'lg_is_logged_in',
  LAB_AUDIT_LOGS: 'lg_lab_audit_logs'
};

export interface LabAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: 'SAMPLE_RESULT_UPDATED' | 'CONFIRMATION_STATUS_CHANGED' | 'LAB_REPORT_GENERATED' | 'LAB_REPORT_VIEWED' | 'SAMPLE_ACCESSIONED';
  sampleId?: string;
  sampleCode?: string;
  caseId?: string;
  caseNumber?: string;
  previousValue?: string;
  newValue?: string;
  details: string;
}

const SEED_LAB_AUDIT_LOGS: LabAuditEntry[] = [
  {
    id: 'laud_001',
    timestamp: '2026-08-23T14:30:00Z',
    userId: 'usr_lab_01',
    userName: 'Dr. Priya Kulkarni, MVSc',
    userRole: 'LABORATORY_STAFF',
    action: 'SAMPLE_ACCESSIONED',
    sampleId: 'smp_2026_001',
    sampleCode: 'LAB-PUN-2026-0881',
    caseId: 'cas_2026_001',
    caseNumber: 'CAS-MH-PUN-2026-0089',
    details: 'Sample received under cold chain (4°C) with intact seal. Accessioned for RT-PCR testing.'
  },
  {
    id: 'laud_002',
    timestamp: '2026-08-22T16:15:00Z',
    userId: 'usr_lab_01',
    userName: 'Dr. Priya Kulkarni, MVSc',
    userRole: 'LABORATORY_STAFF',
    action: 'SAMPLE_RESULT_UPDATED',
    sampleId: 'smp_2026_003',
    sampleCode: 'LAB-SAT-2026-0194',
    caseId: 'cas_2026_002',
    caseNumber: 'CAS-MH-SAT-2026-0045',
    previousValue: 'PENDING',
    newValue: 'POSITIVE',
    details: 'Capripoxvirus viral DNA detected via real-time PCR assay (Ct value 21.4).'
  },
  {
    id: 'laud_003',
    timestamp: '2026-08-22T16:16:00Z',
    userId: 'usr_lab_01',
    userName: 'Dr. Priya Kulkarni, MVSc',
    userRole: 'LABORATORY_STAFF',
    action: 'CONFIRMATION_STATUS_CHANGED',
    sampleId: 'smp_2026_003',
    sampleCode: 'LAB-SAT-2026-0194',
    caseId: 'cas_2026_002',
    caseNumber: 'CAS-MH-SAT-2026-0045',
    previousValue: 'SUSPECTED',
    newValue: 'CONFIRMED',
    details: 'Diagnostic laboratory confirmation recorded for Lumpy Skin Disease. Escalated to state surveillance.'
  }
];

const SEED_TEMPORARY_ANIMALS: TemporaryAnimal[] = [
  {
    id: 'tanm_001',
    temporaryTag: 'TEMP-COW-0012',
    species: 'Cattle',
    breed: 'Gir Cow',
    ageYears: 2.5,
    ageStage: 'GROWER_HEIFER',
    sex: 'FEMALE',
    pregnancyStatus: 'NOT_PREGNANT',
    ownerId: 'usr_farmer_01',
    ownerName: 'Ramesh Patil',
    ownerPhone: '+91 98220 11223',
    farmId: 'farm_01',
    farmName: 'Patil Dairy & Livestock Farm',
    groupSize: 'INDIVIDUAL',
    stateId: 'st_mh',
    districtId: 'dt_pune',
    blockId: 'bk_baramati',
    villageId: 'vl_malegaon_bk',
    villageName: 'Malegaon Budruk',
    latitude: 18.1512,
    longitude: 74.5789,
    createdAt: '2026-08-20T10:00:00Z',
    isFormallyRegistered: false
  }
];

// Safe localStorage helper
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') {
      return fallback;
    }
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) {
      return fallback;
    }
    // If fallback is an array, ensure parsed is also an array
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    return parsed;
  } catch (e) {
    console.warn(`Error loading key ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving key ${key} to storage:`, e);
  }
}

export interface HerdStatistics {
  total: number;
  healthy: number;
  affected: number;
  other: number;
  deceased: number;
  recovered: number;
  linkedAnimalCount: number;
  displayBreakdown: string;
}

/**
 * Universal calculation of herd statistics from actual animal records and cases.
 * Total Animals = Healthy + Affected + Other/Unknown
 */
export function calculateHerdStatistics(
  herd: Herd,
  allAnimals: Animal[],
  allCases: Case[]
): HerdStatistics {
  if (!herd) {
    return {
      total: 0,
      healthy: 0,
      affected: 0,
      other: 0,
      deceased: 0,
      recovered: 0,
      linkedAnimalCount: 0,
      displayBreakdown: '0 / 0 / 0'
    };
  }

  // 1. Identify active animals belonging to this herd
  const herdAnimals = (allAnimals || []).filter(a => {
    if ((a as any).isDeleted || (a as any).isArchived) return false;
    return a.herdId === herd.id || a.herdId === herd.herdCode || (a as any).herdCode === herd.herdCode;
  });

  // If no individual animals are linked in database, fallback to recorded herd fields
  if (herdAnimals.length === 0) {
    const total = herd.totalAnimals || 0;
    const affected = herd.affectedCount || 0;
    const healthy = herd.healthyCount || 0;
    const other = herd.underObservationCount || Math.max(0, total - healthy - affected);
    const deceased = herd.deathCount || 0;
    const recovered = herd.recoveredCount || 0;
    const display = other > 0
      ? `${total} / ${healthy} / ${affected} / ${other}`
      : `${total} / ${healthy} / ${affected}`;

    return {
      total,
      healthy,
      affected,
      other,
      deceased,
      recovered,
      linkedAnimalCount: 0,
      displayBreakdown: display
    };
  }

  // 2. Active, valid disease cases
  // Exclude duplicate/closed/resolved/ruled out cases
  const activeCases = (allCases || []).filter(c =>
    c.status !== 'RESOLVED' &&
    c.status !== 'RULED_OUT' &&
    c.status !== 'CLOSED' &&
    (c as any).status !== 'DISMISSED'
  );

  const animalIdsWithActiveCase = new Set<string>();
  activeCases.forEach(c => {
    if (c.animalId) animalIdsWithActiveCase.add(c.animalId);
  });

  let healthyCount = 0;
  let affectedCount = 0;
  let otherCount = 0;
  let deceasedCount = 0;
  let recoveredCount = 0;

  herdAnimals.forEach(a => {
    if (a.currentHealthStatus === 'DECEASED') {
      deceasedCount++;
      return;
    }

    // A. Affected Check:
    // Animals with a currently active, valid disease case OR explicitly assigned affected health status.
    // Count each animal only once.
    const hasActiveCase = animalIdsWithActiveCase.has(a.id) || (a.activeCaseId && activeCases.some(c => c.id === a.activeCaseId));
    const isExplicitlyAffected =
      a.currentHealthStatus === 'AFFECTED' ||
      (a.currentHealthStatus as string) === 'SICK' ||
      (a.currentHealthStatus as string) === 'INFECTED' ||
      (a.currentHealthStatus as string) === 'CRITICAL' ||
      (a.currentHealthStatus as string) === 'QUARANTINED';

    if (hasActiveCase || isExplicitlyAffected) {
      affectedCount++;
      return;
    }

    // B. Other / Unknown / Pending Check:
    // Animals with unknown, pending or unverified health status
    const isUnknownOrPending =
      (a.currentHealthStatus as string) === 'UNKNOWN' ||
      (a.currentHealthStatus as string) === 'PENDING' ||
      (a.currentHealthStatus as string) === 'UNVERIFIED' ||
      (a as any).isUnverified === true;

    if (isUnknownOrPending) {
      otherCount++;
      return;
    }

    if (a.currentHealthStatus === 'RECOVERED') {
      recoveredCount++;
    }

    // C. Healthy Check:
    // Animals explicitly marked healthy or with no active disease case
    healthyCount++;
  });

  const totalHead = herdAnimals.filter(a => a.currentHealthStatus !== 'DECEASED').length;
  const display = otherCount > 0
    ? `${totalHead} / ${healthyCount} / ${affectedCount} / ${otherCount}`
    : `${totalHead} / ${healthyCount} / ${affectedCount}`;

  return {
    total: totalHead,
    healthy: healthyCount,
    affected: affectedCount,
    other: otherCount,
    deceased: deceasedCount,
    recovered: recoveredCount,
    linkedAnimalCount: herdAnimals.length,
    displayBreakdown: display
  };
}

class LivestockGuardStore {
  private users: User[] = [];
  private currentUser: User = SEED_USERS[0];
  private farms: Farm[] = [];
  private herds: Herd[] = [];
  private animals: Animal[] = [];
  private cases: Case[] = [];
  private outbreaks: Outbreak[] = [];
  private labSamples: LabSample[] = [];
  private vaccinations: VaccinationRecord[] = [];
  private treatments: TreatmentRecord[] = [];
  private mortalityReports: MortalityReport[] = [];
  private alerts: Alert[] = [];
  private weather: Record<string, WeatherData> = {};
  private systemConfig: SystemConfig = DEFAULT_CONFIG;
  private offlineQueue: OfflineSyncItem[] = [];
  private fieldVisits: FieldVisit[] = [];
  private advisories: Advisory[] = [];
  private temporaryAnimals: TemporaryAnimal[] = [];
  private labAuditLogs: LabAuditEntry[] = [];
  private currentLanguage: LanguageCode = 'en';
  private isSimulatedOffline: boolean = false;
  private isDemoModeActive: boolean = false;
  private isUserAuthenticated: boolean = true;
  private authenticatedUser: User = SEED_USERS[0];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    const rawUsers = loadFromStorage<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const validUsers = Array.isArray(rawUsers) && rawUsers.length > 0 ? rawUsers : SEED_USERS;
    this.users = validUsers.map(u => ({
      ...u,
      accountStatus: u.accountStatus || 'VERIFIED'
    }));

    // Ensure all seed users (especially all demo farmers) exist in this.users
    SEED_USERS.forEach(su => {
      const idx = this.users.findIndex(u => u.id === su.id || u.email === su.email);
      if (idx === -1) {
        this.users.push({ ...su, accountStatus: 'VERIFIED' });
      } else {
        this.users[idx] = {
          ...this.users[idx],
          farmId: this.users[idx].farmId || su.farmId,
          farmName: this.users[idx].farmName || su.farmName,
          village: this.users[idx].village || su.village
        };
      }
    });

    this.farms = loadFromStorage(STORAGE_KEYS.FARMS, SEED_FARMS) || SEED_FARMS;
    // Migrate farms to ensure correct ownerId linkage
    SEED_FARMS.forEach(sf => {
      const fIdx = this.farms.findIndex(f => f.id === sf.id);
      if (fIdx === -1) {
        this.farms.push({ ...sf });
      } else {
        this.farms[fIdx].ownerId = sf.ownerId;
        this.farms[fIdx].ownerName = sf.ownerName;
      }
    });

    this.herds = loadFromStorage(STORAGE_KEYS.HERDS, SEED_HERDS) || SEED_HERDS;
    // Migrate herds to ensure strict ownership and farm linkage
    SEED_HERDS.forEach(sh => {
      const hIdx = this.herds.findIndex(h => h.id === sh.id || h.herdCode === sh.herdCode);
      if (hIdx === -1) {
        this.herds.push({ ...sh });
      } else {
        this.herds[hIdx].ownerId = sh.ownerId;
        this.herds[hIdx].ownerName = sh.ownerName;
        this.herds[hIdx].farmId = sh.farmId;
      }
    });

    this.animals = loadFromStorage(STORAGE_KEYS.ANIMALS, SEED_ANIMALS) || SEED_ANIMALS;
    // Migrate animals to ensure strict ownership, farm, and herd linkage
    SEED_ANIMALS.forEach(sa => {
      const aIdx = this.animals.findIndex(a => a.id === sa.id);
      if (aIdx === -1) {
        this.animals.push({ ...sa });
      } else {
        this.animals[aIdx].ownerId = sa.ownerId;
        this.animals[aIdx].farmId = sa.farmId;
        this.animals[aIdx].herdId = sa.herdId;
      }
    });

    this.temporaryAnimals = loadFromStorage(STORAGE_KEYS.TEMPORARY_ANIMALS, SEED_TEMPORARY_ANIMALS) || SEED_TEMPORARY_ANIMALS;
    const loadedCases = loadFromStorage<Case[]>(STORAGE_KEYS.CASES, SEED_CASES) || SEED_CASES;
    this.cases = loadedCases.map(c => {
      // Ensure backward compatibility: if a case lacks credibility fields, supply sensible defaults
      if (c.credibilityScore === undefined) {
        const isConfirmed = c.status === 'CONFIRMED';
        const isRuledOut = c.status === 'RULED_OUT';
        c.credibilityScore = isConfirmed ? 95 : isRuledOut ? 30 : 75;
        c.credibilityTier = isConfirmed ? 'TRUSTED' : isRuledOut ? 'LOW_CREDIBILITY' : 'REVIEW';
        c.credibilityStatus = isConfirmed ? 'VERIFIED' : isRuledOut ? 'REJECTED' : 'PENDING';
        c.verificationState = isConfirmed ? 'LAB_CONFIRMED' : 'NOT_REVIEWED';
      }
      return c;
    });
    this.outbreaks = loadFromStorage(STORAGE_KEYS.OUTBREAKS, SEED_OUTBREAKS) || SEED_OUTBREAKS;
    this.labSamples = loadFromStorage(STORAGE_KEYS.LAB_SAMPLES, SEED_LAB_SAMPLES) || SEED_LAB_SAMPLES;
    this.vaccinations = loadFromStorage(STORAGE_KEYS.VACCINATIONS, SEED_VACCINATIONS) || SEED_VACCINATIONS;
    // Ensure all seed vaccinations exist
    SEED_VACCINATIONS.forEach(sv => {
      if (!this.vaccinations.some(v => v.id === sv.id)) {
        this.vaccinations.push({ ...sv });
      }
    });
    this.treatments = loadFromStorage(STORAGE_KEYS.TREATMENTS, SEED_TREATMENTS) || SEED_TREATMENTS;
    // Ensure all seed treatments exist
    SEED_TREATMENTS.forEach(st => {
      if (!this.treatments.some(t => t.id === st.id)) {
        this.treatments.push({ ...st });
      }
    });
    this.mortalityReports = loadFromStorage(STORAGE_KEYS.MORTALITY, SEED_MORTALITY_REPORTS) || SEED_MORTALITY_REPORTS;
    this.alerts = loadFromStorage(STORAGE_KEYS.ALERTS, SEED_ALERTS) || SEED_ALERTS;
    this.weather = loadFromStorage(STORAGE_KEYS.WEATHER, SEED_WEATHER) || SEED_WEATHER;
    this.systemConfig = loadFromStorage(STORAGE_KEYS.SYSTEM_CONFIG, DEFAULT_CONFIG) || DEFAULT_CONFIG;
    this.offlineQueue = loadFromStorage(STORAGE_KEYS.OFFLINE_QUEUE, []) || [];
    this.fieldVisits = loadFromStorage(STORAGE_KEYS.FIELD_VISITS, SEED_FIELD_VISITS) || SEED_FIELD_VISITS;
    this.advisories = loadFromStorage(STORAGE_KEYS.ADVISORIES, SEED_ADVISORIES) || SEED_ADVISORIES;
    this.labAuditLogs = loadFromStorage(STORAGE_KEYS.LAB_AUDIT_LOGS, SEED_LAB_AUDIT_LOGS) || SEED_LAB_AUDIT_LOGS;
    this.currentLanguage = loadFromStorage(STORAGE_KEYS.LANGUAGE, 'en') || 'en';
    this.isSimulatedOffline = loadFromStorage(STORAGE_KEYS.IS_OFFLINE, false) || false;
    this.isDemoModeActive = loadFromStorage(STORAGE_KEYS.DEMO_MODE, false) || false;
    this.isUserAuthenticated = loadFromStorage(STORAGE_KEYS.IS_LOGGED_IN, true) ?? true;
    
    const savedAuthUser = loadFromStorage<User | null>(STORAGE_KEYS.AUTH_USER, null);
    if (savedAuthUser) {
      // Find full and updated profile from users list
      const matched = this.users.find(u => u.id === savedAuthUser.id || u.email === savedAuthUser.email);
      this.authenticatedUser = matched || savedAuthUser;
    } else {
      this.authenticatedUser = this.users[0] || SEED_USERS[0];
    }

    if (!this.isDemoModeActive) {
      this.currentUser = this.authenticatedUser;
    } else {
      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUserId) {
        const u = this.users.find(x => x.id === savedUserId);
        if (u) this.currentUser = u;
        else this.currentUser = this.authenticatedUser;
      } else {
        this.currentUser = this.authenticatedUser;
      }
    }

    this.syncHerdStatistics();
  }

  public getHerdStatistics(herdOrId: Herd | string): HerdStatistics {
    const herd = typeof herdOrId === 'string'
      ? (this.herds || []).find(h => h.id === herdOrId || h.herdCode === herdOrId)
      : herdOrId;
    return calculateHerdStatistics(herd!, this.animals, this.cases);
  }

  public syncHerdStatistics(): void {
    if (!this.herds) return;
    this.herds.forEach(herd => {
      const stats = this.getHerdStatistics(herd);
      if (stats.linkedAnimalCount > 0) {
        herd.totalAnimals = stats.total;
        herd.healthyCount = stats.healthy;
        herd.affectedCount = stats.affected;
        herd.underObservationCount = stats.other;
        herd.recoveredCount = stats.recovered;
        herd.deathCount = stats.deceased;
      }
    });
    saveToStorage(STORAGE_KEYS.HERDS, this.herds);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // ==========================================
  // AUTHENTICATION & LOGIN LIFECYCLE
  // ==========================================

  public isAuthenticated(): boolean {
    return this.isUserAuthenticated && !!this.currentUser;
  }

  /**
   * Real user login via Mobile Number or Email
   * Finds the user in the database, sets authenticated profile with database-enforced role.
   */
  public login(identifier: string, _password?: string): { success: boolean; user?: User; error?: string } {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter your Mobile Number or Email address.' };
    }

    const cleanInput = identifier.trim().toLowerCase();
    const numericOnly = cleanInput.replace(/\D/g, '');

    // Match by user ID, email, phone, or specific demo account name
    const matchedUser = this.users.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhoneClean = (u.phone || '').replace(/\D/g, '');
      const uRoleClean = (u.role || '').toLowerCase();
      const uId = (u.id || '').toLowerCase();
      const uName = (u.name || '').toLowerCase();

      // 1. Direct ID match
      if (uId === cleanInput) return true;

      // 2. Exact email match
      if (uEmail === cleanInput) return true;

      // 3. Exact phone match
      if (numericOnly && numericOnly.length >= 8 && uPhoneClean.includes(numericOnly)) return true;

      // 4. Specific farmer names
      if (cleanInput.includes('mahadev') && (u.id === 'usr_farmer_3' || uName.includes('mahadev'))) return true;
      if (cleanInput.includes('basavaraj') && (u.id === 'usr_farmer_5' || uName.includes('basavaraj'))) return true;
      if (cleanInput.includes('ramesh') && (u.id === 'usr_farmer_1' || uName.includes('ramesh'))) return true;

      // 5. Direct role keyword matches
      if (cleanInput === uRoleClean) return true;
      if (cleanInput.includes('vet') && u.role === 'VETERINARIAN') return true;
      if (cleanInput.includes('doctor') && u.role === 'VETERINARIAN') return true;
      if (cleanInput.includes('farmer') && u.role === 'FARMER' && u.id === 'usr_farmer_1') return true;
      if (cleanInput.includes('field') && u.role === 'FIELD_WORKER') return true;
      if (cleanInput.includes('lab') && (u.role === 'LABORATORY_STAFF' || u.role === 'DIAGNOSTIC_LAB')) return true;
      if (cleanInput.includes('district') && u.role === 'DISTRICT_OFFICIAL') return true;
      if (cleanInput.includes('state') && u.role === 'STATE_ADMIN') return true;
      if (cleanInput.includes('admin') && u.role === 'SYSTEM_ADMIN') return true;

      return false;
    });

    if (!matchedUser) {
      return {
        success: false,
        error: 'No account found matching this identifier. Please verify your phone or email, or select a test account below.'
      };
    }

    // Set real authenticated session
    this.authenticatedUser = matchedUser;
    this.currentUser = matchedUser;
    this.isUserAuthenticated = true;
    this.isDemoModeActive = false;

    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    saveToStorage(STORAGE_KEYS.AUTH_USER, matchedUser);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, matchedUser.id);
    saveToStorage(STORAGE_KEYS.DEMO_MODE, false);

    this.notify();
    return { success: true, user: matchedUser };
  }

  /**
   * Fast login for testing/evaluating any of the 7 roles with real authentication
   */
  public loginAsRole(role: Role): { success: boolean; user?: User; error?: string } {
    const canonicalRole = role === 'DIAGNOSTIC_LAB' ? 'LABORATORY_STAFF' : role;
    const user = this.users.find(u => u.role === canonicalRole) || SEED_USERS.find(u => u.role === canonicalRole);
    if (!user) {
      return { success: false, error: `No test user registered for role: ${role}` };
    }

    this.authenticatedUser = user;
    this.currentUser = user;
    this.isUserAuthenticated = true;
    this.isDemoModeActive = false;

    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    saveToStorage(STORAGE_KEYS.AUTH_USER, user);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user.id);
    saveToStorage(STORAGE_KEYS.DEMO_MODE, false);

    this.notify();
    return { success: true, user };
  }

  /**
   * Fast direct login as a specific user account (e.g., specific farmer)
   */
  public loginAsUser(userId: string): { success: boolean; user?: User; error?: string } {
    const user = this.users.find(u => u.id === userId) || SEED_USERS.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: `User with ID ${userId} not found` };
    }

    this.authenticatedUser = user;
    this.currentUser = user;
    this.isUserAuthenticated = true;
    this.isDemoModeActive = false;

    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    saveToStorage(STORAGE_KEYS.AUTH_USER, user);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user.id);
    saveToStorage(STORAGE_KEYS.DEMO_MODE, false);

    this.notify();
    return { success: true, user };
  }

  /**
   * Clears session, clears protected state, and returns to Login
   */
  public logout(): void {
    this.isUserAuthenticated = false;
    this.isDemoModeActive = false;
    this.currentUser = this.users[0] || SEED_USERS[0];
    this.authenticatedUser = this.users[0] || SEED_USERS[0];
    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, false);
    saveToStorage(STORAGE_KEYS.DEMO_MODE, false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {}

    this.notify();
  }

  /**
   * Enter Demo Mode for presentations and evaluation without credentials
   */
  public enterDemoMode(initialRole: Role = 'FARMER'): void {
    const canonical = initialRole === 'DIAGNOSTIC_LAB' ? 'LABORATORY_STAFF' : initialRole;
    const user = this.users.find(u => u.role === canonical) || this.users[0] || SEED_USERS[0];

    this.currentUser = user;
    this.isUserAuthenticated = true;
    this.isDemoModeActive = true;

    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    saveToStorage(STORAGE_KEYS.DEMO_MODE, true);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user.id);

    this.notify();
  }

  // Demo Mode vs Real Authenticated Mode
  public isDemoMode(): boolean {
    return this.isDemoModeActive;
  }

  public setDemoMode(isDemo: boolean): void {
    this.isDemoModeActive = isDemo;
    saveToStorage(STORAGE_KEYS.DEMO_MODE, isDemo);
    if (!isDemo) {
      // Revert to database authenticated user
      this.currentUser = this.authenticatedUser;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser.id);
    }
    this.notify();
  }

  public toggleDemoMode(): void {
    this.setDemoMode(!this.isDemoModeActive);
  }

  public getAuthenticatedUser(): User {
    return this.authenticatedUser;
  }

  public setAuthenticatedUser(user: User): void {
    this.authenticatedUser = user;
    saveToStorage(STORAGE_KEYS.AUTH_USER, user);
    if (!this.isDemoModeActive) {
      this.currentUser = user;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, user.id);
    }
    this.notify();
  }

  // Language & Offline State
  public getLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  public setLanguage(lang: LanguageCode) {
    this.currentLanguage = lang;
    saveToStorage(STORAGE_KEYS.LANGUAGE, lang);
    this.notify();
  }

  public isOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public toggleOfflineMode() {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    saveToStorage(STORAGE_KEYS.IS_OFFLINE, this.isSimulatedOffline);
    this.notify();
  }

  // Users & Roles
  public getCurrentUser(): User {
    return this.currentUser || this.authenticatedUser || (this.users && this.users[0]) || SEED_USERS[0];
  }

  public getAllUsers(): User[] {
    return this.users || SEED_USERS;
  }

  public addUser(user: User): void {
    if (!this.users.some(u => u.id === user.id)) {
      this.users.push(user);
      saveToStorage(STORAGE_KEYS.USERS, this.users);
      this.notify();
    }
  }

  public updateUser(user: User): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
      if (this.currentUser.id === user.id) {
        this.currentUser = user;
      }
      if (this.authenticatedUser?.id === user.id) {
        this.authenticatedUser = user;
      }
      saveToStorage(STORAGE_KEYS.USERS, this.users);
      saveToStorage(STORAGE_KEYS.AUTH_USER, this.authenticatedUser);
      this.notify();
    }
  }

  public switchRole(role: Role) {
    if (!this.isDemoModeActive) {
      console.warn('Role switching is disabled in Authenticated mode. Switch to Demo Mode to test other roles.');
      return;
    }
    const canonicalRole = role === 'DIAGNOSTIC_LAB' ? 'LABORATORY_STAFF' : role;
    const user = this.users.find(u => u.role === canonicalRole);
    if (user) {
      this.currentUser = user;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, user.id);
      this.notify();
    }
  }

  public setUser(user: User) {
    this.currentUser = user;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user.id);
    this.notify();
  }

  // ==========================================
  // OWNERSHIP & RELATIONSHIP RESOLUTION HELPERS
  // ==========================================

  private resolveUser(userOrId?: User | string): User | null {
    if (!userOrId) return this.currentUser || null;
    if (typeof userOrId === 'string') {
      return this.users.find(u => u.id === userOrId) || this.currentUser || null;
    }
    return userOrId;
  }

  /**
   * Helper: Resolves all Farm IDs owned by or assigned to a specific user (or the current user).
   */
  public getUserFarmIds(userOrId?: User | string): Set<string> {
    const user = this.resolveUser(userOrId);
    const farmIds = new Set<string>();
    if (!user) return farmIds;

    if (user.farmId) {
      farmIds.add(user.farmId);
    }
    (this.farms || []).forEach(f => {
      if (f.ownerId === user.id) {
        farmIds.add(f.id);
      }
    });
    return farmIds;
  }

  /**
   * Helper: Resolves all Herd IDs owned by a specific farmer or linked to their farms.
   */
  public getFarmerHerdIds(userOrId?: User | string): Set<string> {
    const user = this.resolveUser(userOrId);
    const herdIds = new Set<string>();
    if (!user) return herdIds;

    const userFarmIds = this.getUserFarmIds(user);
    (this.herds || []).forEach(h => {
      if ((h.ownerId && h.ownerId === user.id) || (h.farmId && userFarmIds.has(h.farmId))) {
        herdIds.add(h.id);
      }
    });
    return herdIds;
  }

  /**
   * Helper: Resolves all Animal IDs owned by a specific farmer or in their herds/farms.
   */
  public getFarmerAnimalIds(userOrId?: User | string): Set<string> {
    const user = this.resolveUser(userOrId);
    const animalIds = new Set<string>();
    if (!user) return animalIds;

    const userFarmIds = this.getUserFarmIds(user);
    const userHerdIds = this.getFarmerHerdIds(user);
    (this.animals || []).forEach(a => {
      if ((a as any).isDeleted || (a as any).isArchived) return;
      if (
        (a.ownerId && a.ownerId === user.id) ||
        (a.farmId && userFarmIds.has(a.farmId)) ||
        (a.herdId && userHerdIds.has(a.herdId))
      ) {
        animalIds.add(a.id);
      }
    });
    return animalIds;
  }

  // Data Getters
  public getFarms(): Farm[] {
    return this.farms || [];
  }

  public getHerds(): Herd[] {
    return this.herds || [];
  }

  public getAnimals(): Animal[] {
    return this.animals || [];
  }

  public getAnimalById(id: string): Animal | undefined {
    const a = (this.animals || []).find(animal => animal.id === id || animal.tagNumber === id);
    if (!a) return undefined;
    // Security Guard: Farmer can only access their own registered animals
    if (this.currentUser?.role === 'FARMER') {
      const userAnimalIds = this.getFarmerAnimalIds(this.currentUser);
      if (!userAnimalIds.has(a.id)) {
        return undefined;
      }
    }
    return a;
  }

  public getHerdById(id: string): Herd | undefined {
    const h = (this.herds || []).find(herd => herd.id === id || herd.herdCode === id);
    if (!h) return undefined;
    // Security Guard: Farmer can only access their own herds
    if (this.currentUser?.role === 'FARMER') {
      const userHerdIds = this.getFarmerHerdIds(this.currentUser);
      if (!userHerdIds.has(h.id)) {
        return undefined;
      }
    }
    const stats = this.getHerdStatistics(h);
    if (stats.linkedAnimalCount > 0) {
      h.totalAnimals = stats.total;
      h.healthyCount = stats.healthy;
      h.affectedCount = stats.affected;
      h.underObservationCount = stats.other;
      h.recoveredCount = stats.recovered;
      h.deathCount = stats.deceased;
    }
    return h;
  }

  public getTemporaryAnimals(): TemporaryAnimal[] {
    return this.temporaryAnimals || [];
  }

  public getTemporaryAnimalById(id: string): TemporaryAnimal | undefined {
    return (this.temporaryAnimals || []).find(a => a.id === id || a.temporaryTag === id);
  }

  public getCases(): Case[] {
    return this.cases || [];
  }

  public getCaseById(id: string): Case | undefined {
    const c = (this.cases || []).find(caseItem => caseItem.id === id || caseItem.caseNumber === id);
    if (!c) return undefined;
    // Security Guard: Farmer can only access their own cases
    if (this.currentUser?.role === 'FARMER') {
      const userFarmIds = this.getUserFarmIds(this.currentUser);
      const userAnimalIds = this.getFarmerAnimalIds(this.currentUser);
      const userHerdIds = this.getFarmerHerdIds(this.currentUser);

      const isAuthorized =
        c.reporterId === this.currentUser.id ||
        c.ownerId === this.currentUser.id ||
        (c.farmId && userFarmIds.has(c.farmId)) ||
        (c.herdId && userHerdIds.has(c.herdId)) ||
        (c.animalId && userAnimalIds.has(c.animalId));

      if (!isAuthorized) {
        return undefined;
      }
    }
    return c;
  }

  public getOutbreaks(): Outbreak[] {
    return this.outbreaks || [];
  }

  public getOutbreakById(id: string): Outbreak | undefined {
    return (this.outbreaks || []).find(o => o.id === id || o.outbreakCode === id);
  }

  public getLabSamples(): LabSample[] {
    return this.labSamples || [];
  }

  public getVaccinations(): VaccinationRecord[] {
    return this.vaccinations || [];
  }

  public getTreatments(): TreatmentRecord[] {
    return this.treatments || [];
  }

  public getMortalityReports(): MortalityReport[] {
    return this.mortalityReports || [];
  }

  public getFieldVisits(): FieldVisit[] {
    return this.fieldVisits || [];
  }

  public getAdvisories(): Advisory[] {
    return this.advisories || [];
  }

  public getAlerts(): Alert[] {
    return this.alerts || [];
  }

  public getWeather(districtId: string = 'dt_pune'): WeatherData {
    const defaultWeather: WeatherData = {
      districtId: 'dt_pune',
      districtName: 'Pune',
      stateName: 'Maharashtra',
      temperatureC: 28.4,
      humidityPct: 78,
      rainfallMm: 14.2,
      windSpeedKph: 12,
      condition: 'Humid & Overcast',
      season: 'MONSOON',
      vectorRiskIndex: 'HIGH',
      thermalStressIndex: 'ALERT',
      historicalCorrelationInsight: 'High humidity (>75%) coupled with monsoon waterlogging increases vector breeding and FMD viral survivability.'
    };
    if (!this.weather) return defaultWeather;
    const key = districtId || 'dt_pune';
    return this.weather[key] || this.weather['dt_pune'] || defaultWeather;
  }

  public getSystemConfig(): SystemConfig {
    return this.systemConfig || DEFAULT_CONFIG;
  }

  public getOfflineQueue(): OfflineSyncItem[] {
    return this.offlineQueue || [];
  }

  // ==========================================
  // ROLE-BASED SCOPED DATA GETTERS
  // ==========================================

  public getScopedCases(): Case[] {
    const user = this.currentUser;
    const role = user?.role;
    const allCases = this.cases || [];

    if (role === 'FARMER') {
      const userFarmIds = this.getUserFarmIds(user);
      const userHerdIds = this.getFarmerHerdIds(user);
      const userAnimalIds = this.getFarmerAnimalIds(user);

      return allCases.filter(
        c => c.reporterId === user.id ||
             c.ownerId === user.id ||
             (c.farmId && userFarmIds.has(c.farmId)) ||
             (c.herdId && userHerdIds.has(c.herdId)) ||
             (c.animalId && userAnimalIds.has(c.animalId))
      );
    }
    if (role === 'FIELD_WORKER') {
      return allCases.filter(
        c => c.villageName?.toLowerCase().includes('malegaon') ||
             c.villageName?.toLowerCase().includes('shirsuphal') ||
             c.villageName?.toLowerCase().includes('vithalwadi') ||
             c.districtName?.toLowerCase().includes('pune')
      );
    }
    if (role === 'VETERINARIAN') {
      return allCases.filter(
        c => c.districtName?.toLowerCase().includes('pune') ||
             c.districtName?.toLowerCase().includes('satara')
      );
    }
    if (role === 'LABORATORY_STAFF' || role === 'DIAGNOSTIC_LAB') {
      return allCases.filter(c => c.status === 'LAB_TESTING' || (c.sampleIds && c.sampleIds.length > 0) || c.status === 'SAMPLE_REQUESTED' || c.status === 'CONFIRMED' || c.status === 'RULED_OUT');
    }
    if (role === 'DISTRICT_OFFICIAL') {
      return allCases.filter(c => c.districtName?.toLowerCase().includes('pune') || c.stateId === 'st_mah');
    }
    // STATE_ADMIN & SYSTEM_ADMIN
    return allCases;
  }

  public getScopedAnimals(): Animal[] {
    const user = this.currentUser;
    const role = user?.role;
    const allAnimals = (this.animals || []).filter(
      a => !(a as any).isDeleted && !(a as any).isArchived
    );
    if (role === 'FARMER') {
      return this.getFarmerAnimals(user);
    }
    if (role === 'FIELD_WORKER') {
      return allAnimals.filter(
        a => a.farmId === 'farm_01' || a.farmId === 'farm_02' || a.farmId === 'farm_03'
      );
    }
    return allAnimals;
  }

  /**
   * Single Source of Truth for Farmer-scoped animals.
   * Resolves animals strictly belonging to the specified farmer account or currently authenticated farmer.
   */
  public getFarmerAnimals(farmerUserOrId?: User | string): Animal[] {
    const allAnimals = (this.animals || []).filter(
      a => !(a as any).isDeleted && !(a as any).isArchived
    );
    const user = this.resolveUser(farmerUserOrId);
    if (!user) return [];

    const userFarmIds = this.getUserFarmIds(user);
    const userHerdIds = this.getFarmerHerdIds(user);

    return allAnimals.filter(a => {
      // 1. Direct ownerId match
      if (a.ownerId && a.ownerId === user.id) return true;
      // 2. Belongs to farm owned by user
      if (a.farmId && userFarmIds.has(a.farmId)) return true;
      // 3. Belongs to herd owned by user
      if (a.herdId && userHerdIds.has(a.herdId)) return true;
      return false;
    });
  }

  public getFarmerHerds(farmerUserOrId?: User | string): Herd[] {
    const user = this.resolveUser(farmerUserOrId);
    if (!user) return [];

    const userFarmIds = this.getUserFarmIds(user);

    return (this.herds || []).filter(h => {
      // 1. Direct ownerId match
      if (h.ownerId && h.ownerId === user.id) return true;
      // 2. Belongs to a farm owned by the user
      if (h.farmId && userFarmIds.has(h.farmId)) return true;
      return false;
    });
  }

  public getScopedHerds(): Herd[] {
    const user = this.currentUser;
    const role = user?.role;
    const allHerds = this.herds || [];

    // Ensure all herds have accurate dynamic statistics
    allHerds.forEach(h => {
      const stats = this.getHerdStatistics(h);
      if (stats.linkedAnimalCount > 0) {
        h.totalAnimals = stats.total;
        h.healthyCount = stats.healthy;
        h.affectedCount = stats.affected;
        h.underObservationCount = stats.other;
        h.recoveredCount = stats.recovered;
        h.deathCount = stats.deceased;
      }
    });

    if (role === 'FARMER') {
      return this.getFarmerHerds(user);
    }
    if (role === 'FIELD_WORKER') {
      return allHerds.filter(h => h.farmId === 'farm_01' || h.farmId === 'farm_02' || h.districtId === user?.districtId);
    }
    if (role === 'VETERINARIAN') {
      return allHerds.filter(h => h.districtId === user?.districtId || h.stateId === user?.stateId);
    }
    if (role === 'DISTRICT_OFFICIAL') {
      return allHerds.filter(h => h.districtId === user?.districtId || h.stateId === user?.stateId);
    }
    return allHerds;
  }

  public getScopedFarms(): Farm[] {
    const user = this.currentUser;
    const role = user?.role;
    const allFarms = this.farms || [];

    if (role === 'FARMER') {
      const userFarmIds = this.getUserFarmIds(user);
      return allFarms.filter(f => f.ownerId === user.id || userFarmIds.has(f.id));
    }
    if (role === 'FIELD_WORKER') {
      return allFarms.filter(f => f.districtId === 'dt_pune' || f.id === 'farm_01' || f.id === 'farm_02' || f.id === 'farm_03');
    }
    return allFarms;
  }

  public getScopedLabSamples(): LabSample[] {
    const user = this.currentUser;
    const role = user?.role;
    const allSamples = this.labSamples || [];

    if (role === 'FARMER') {
      const myCaseIds = new Set(this.getScopedCases().map(c => c.id));
      const myAnimalIds = this.getFarmerAnimalIds(user);
      return allSamples.filter(s => myCaseIds.has(s.caseId) || (s.animalId && myAnimalIds.has(s.animalId)));
    }
    if (role === 'FIELD_WORKER') {
      return allSamples.filter(s => (user?.name && s.collectedBy === user?.name) || s.collectedBy?.includes('Sunita') || s.laboratoryId === 'lab_pune_dis');
    }
    return allSamples;
  }

  public getScopedVaccinations(): VaccinationRecord[] {
    const user = this.currentUser;
    const role = user?.role;
    const allVax = this.vaccinations || [];

    if (role === 'FARMER') {
      const userFarmIds = this.getUserFarmIds(user);
      const userHerdIds = this.getFarmerHerdIds(user);
      const userAnimalIds = this.getFarmerAnimalIds(user);

      return allVax.filter(
        v => (v.animalId && userAnimalIds.has(v.animalId)) ||
             (v.herdId && userHerdIds.has(v.herdId)) ||
             (v.farmId && userFarmIds.has(v.farmId))
      );
    }
    if (role === 'FIELD_WORKER') {
      return allVax.filter(v => (user?.name && v.administeredBy === user?.name) || v.administeredBy?.includes('Sunita') || v.villageName?.includes('Malegaon') || v.villageName?.includes('Shirsuphal'));
    }
    return allVax;
  }

  public getScopedTreatments(): TreatmentRecord[] {
    const user = this.currentUser;
    const role = user?.role;
    const allTreatments = this.treatments || [];

    if (role === 'FARMER') {
      const userAnimalIds = this.getFarmerAnimalIds(user);
      const userFarmIds = this.getUserFarmIds(user);
      const userCaseIds = new Set(this.getScopedCases().map(c => c.id));

      return allTreatments.filter(
        t => (t.animalId && userAnimalIds.has(t.animalId)) ||
             (t.caseId && userCaseIds.has(t.caseId)) ||
             (t.farmId && userFarmIds.has(t.farmId))
      );
    }
    if (role === 'FIELD_WORKER') {
      return allTreatments.filter(t => t.farmName?.includes('Patil') || t.farmName?.includes('Gaikwad') || t.farmName?.includes('Krishna'));
    }
    return allTreatments;
  }

  public getScopedMortalityReports(): MortalityReport[] {
    const user = this.currentUser;
    const role = user?.role;
    const allMort = this.mortalityReports || [];

    if (role === 'FARMER') {
      const userFarmIds = this.getUserFarmIds(user);
      const userHerdIds = this.getFarmerHerdIds(user);
      const userAnimalIds = this.getFarmerAnimalIds(user);

      return allMort.filter(
        m => (m.farmId && userFarmIds.has(m.farmId)) ||
             (m.herdId && userHerdIds.has(m.herdId)) ||
             (m.animalId && userAnimalIds.has(m.animalId)) ||
             (m.ownerPhone && user.phone && m.ownerPhone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) ||
             (m.reportedBy && m.reportedBy === user.name)
      );
    }
    if (role === 'FIELD_WORKER') {
      return allMort.filter(m => m.districtName?.toLowerCase().includes('pune') || m.villageName?.toLowerCase().includes('malegaon') || m.villageName?.toLowerCase().includes('vithalwadi'));
    }
    return allMort;
  }

  public getScopedAlerts(): Alert[] {
    const user = this.currentUser;
    const role = user?.role;
    const allAlerts = this.alerts || [];

    if (role === 'FARMER') {
      const userCaseIds = new Set(this.getScopedCases().map(c => c.id));
      const userDistrict = (user?.districtId || '').toLowerCase();

      return allAlerts.filter(a => {
        // Target role check
        if (a.targetRoles && a.targetRoles.length > 0 && !a.targetRoles.includes('FARMER')) {
          return false;
        }
        // If alert is tied to a specific case, only show if it belongs to this farmer
        if (a.caseId && !userCaseIds.has(a.caseId)) {
          return false;
        }
        // If alert title is tied to a specific farm name, match with user's farm
        if (a.title.includes('Patil Farm') && user.id !== 'usr_farmer_1') {
          return false;
        }
        // District filter for non-critical alerts
        if (a.districtName && a.priority !== 'CRITICAL') {
          const alertDist = a.districtName.toLowerCase();
          const matchesDist = userDistrict.includes(alertDist);
          if (!matchesDist) return false;
        }
        return true;
      });
    }

    return allAlerts.filter(a => !a.targetRoles || a.targetRoles.length === 0 || (role && a.targetRoles.includes(role)));
  }

  public getScopedFieldVisits(): FieldVisit[] {
    const user = this.currentUser;
    const role = user?.role;
    const allVisits = this.fieldVisits || [];

    if (role === 'FARMER') {
      const userFarmIds = this.getUserFarmIds(user);
      return allVisits.filter(
        v => (v.farmId && userFarmIds.has(v.farmId)) ||
             (user.farmId && v.farmId === user.farmId) ||
             (user.name && v.farmerName === user.name)
      );
    }
    if (role === 'FIELD_WORKER') {
      return allVisits.filter(v => (user?.id && v.assignedWorkerId === user?.id) || (user?.name && v.assignedWorkerName === user?.name) || v.villageName?.includes('Malegaon') || v.villageName?.includes('Shirsuphal'));
    }
    return allVisits;
  }

  public getScopedAdvisories(): Advisory[] {
    const allAdv = this.advisories || [];
    return allAdv.filter(a => a.isActive);
  }

  // Mutations
  public registerAnimal(animalData: Omit<Animal, 'id' | 'registeredAt' | 'lastCheckedAt' | 'vaccinationCount'>): Animal {
    const user = this.currentUser;
    let resolvedOwnerId = animalData.ownerId;
    let resolvedOwnerName = animalData.ownerName;
    let resolvedFarmId = animalData.farmId;
    let resolvedFarmName = animalData.farmName;

    if (user?.role === 'FARMER') {
      resolvedOwnerId = user.id;
      resolvedOwnerName = user.name;
      const userFarms = this.getScopedFarms();
      const matchedFarm = userFarms.find(f => f.id === animalData.farmId);
      resolvedFarmId = matchedFarm ? matchedFarm.id : (user.farmId || userFarms[0]?.id || 'farm_01');
      resolvedFarmName = matchedFarm ? matchedFarm.name : (user.farmName || userFarms[0]?.name || 'Local Farm Unit');
    } else {
      resolvedOwnerId = resolvedOwnerId || user?.id || 'usr_farmer_1';
      resolvedOwnerName = resolvedOwnerName || user?.name || 'Ramesh Patil';
      resolvedFarmId = resolvedFarmId || user?.farmId || 'farm_01';
      resolvedFarmName = resolvedFarmName || user?.farmName || 'Patil Progressive Dairy Farm';
    }

    const newAnimal: Animal = {
      ...animalData,
      ownerId: resolvedOwnerId,
      ownerName: resolvedOwnerName,
      farmId: resolvedFarmId,
      farmName: resolvedFarmName,
      id: `anm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      registeredAt: new Date().toISOString().split('T')[0],
      lastCheckedAt: new Date().toISOString().split('T')[0],
      vaccinationCount: 0
    };

    if (this.isSimulatedOffline) {
      this.offlineQueue.push({
        id: `sync_${Date.now()}`,
        type: 'ANIMAL_REGISTRATION',
        data: newAnimal,
        createdAt: new Date().toISOString(),
        status: 'PENDING'
      });
      saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
    }

    this.animals.unshift(newAnimal);
    saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);

    // Update farm total
    const farm = this.farms.find(f => f.id === newAnimal.farmId);
    if (farm) {
      farm.totalAnimals += 1;
      saveToStorage(STORAGE_KEYS.FARMS, this.farms);
    }

    // Update herd dynamic statistics
    this.syncHerdStatistics();

    this.notify();
    return newAnimal;
  }

  public updateAnimal(id: string, updates: Partial<Animal>): Animal | undefined {
    const animal = this.animals.find(a => a.id === id || a.tagNumber === id);
    if (!animal) return undefined;

    if (this.currentUser?.role === 'FARMER') {
      const userAnimalIds = this.getFarmerAnimalIds(this.currentUser);
      if (!userAnimalIds.has(animal.id)) {
        console.warn('Unauthorized attempt to update animal belonging to another farmer');
        return undefined;
      }
      // Farmers cannot reassign ownership or farm
      delete (updates as any).ownerId;
      delete (updates as any).ownerName;
      delete (updates as any).farmId;
    }

    // Apply updates without changing id or registration date
    Object.assign(animal, updates, {
      lastCheckedAt: new Date().toISOString().split('T')[0]
    });

    saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);
    this.syncHerdStatistics();
    this.notify();
    return animal;
  }

  public deleteAnimal(id: string): boolean {
    const index = this.animals.findIndex(a => a.id === id || a.tagNumber === id);
    if (index === -1) return false;

    const removedAnimal = this.animals[index];
    if (this.currentUser?.role === 'FARMER') {
      const userAnimalIds = this.getFarmerAnimalIds(this.currentUser);
      if (!userAnimalIds.has(removedAnimal.id)) {
        console.warn('Unauthorized attempt to delete animal belonging to another farmer');
        return false;
      }
    }

    this.animals.splice(index, 1);
    saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);

    // Update farm total
    const farm = this.farms.find(f => f.id === removedAnimal.farmId);
    if (farm && farm.totalAnimals > 0) {
      farm.totalAnimals -= 1;
      saveToStorage(STORAGE_KEYS.FARMS, this.farms);
    }

    // Synchronize dynamic herd statistics
    this.syncHerdStatistics();

    this.notify();
    return true;
  }

  public removeAnimal(id: string): boolean {
    return this.deleteAnimal(id);
  }

  public registerTemporaryAnimal(animalData: Omit<TemporaryAnimal, 'id' | 'createdAt' | 'temporaryTag'> & { customTag?: string }): TemporaryAnimal {
    const speciesPrefix = animalData.species.slice(0, 3).toUpperCase();
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const generatedTag = animalData.customTag?.trim() || `TEMP-${speciesPrefix}-${randomSuffix}`;
    const timestamp = new Date().toISOString();

    const newTempAnimal: TemporaryAnimal = {
      ...animalData,
      id: `tanm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      temporaryTag: generatedTag,
      createdAt: timestamp,
      isFormallyRegistered: false
    };

    if (this.isSimulatedOffline) {
      this.offlineQueue.push({
        id: `sync_${Date.now()}`,
        type: 'ANIMAL_REGISTRATION',
        data: newTempAnimal,
        createdAt: timestamp,
        status: 'PENDING'
      });
      saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
    }

    this.temporaryAnimals.unshift(newTempAnimal);
    saveToStorage(STORAGE_KEYS.TEMPORARY_ANIMALS, this.temporaryAnimals);
    this.notify();
    return newTempAnimal;
  }

  public convertTemporaryToPermanent(tempAnimalId: string, permanentTag: string, permanentName?: string): Animal | undefined {
    const tempAnimal = this.temporaryAnimals.find(t => t.id === tempAnimalId || t.temporaryTag === tempAnimalId);
    if (!tempAnimal) return undefined;

    const newAnimal = this.registerAnimal({
      tagNumber: permanentTag.trim().toUpperCase(),
      name: permanentName || tempAnimal.breed,
      species: tempAnimal.species,
      breed: tempAnimal.breed,
      sex: tempAnimal.sex,
      ageYears: tempAnimal.ageYears,
      weightKg: tempAnimal.species === 'Poultry' ? 2 : tempAnimal.species === 'Goat' || tempAnimal.species === 'Sheep' ? 35 : 350,
      pregnancyStatus: tempAnimal.pregnancyStatus === 'DRY' ? 'NOT_PREGNANT' : tempAnimal.pregnancyStatus,
      currentHealthStatus: 'AFFECTED',
      ownerId: tempAnimal.ownerId,
      ownerName: tempAnimal.ownerName,
      farmId: tempAnimal.farmId,
      farmName: tempAnimal.farmName,
      herdId: tempAnimal.herdId,
      herdName: tempAnimal.herdName,
      stateId: tempAnimal.stateId,
      districtId: tempAnimal.districtId,
      blockId: tempAnimal.blockId,
      villageId: tempAnimal.villageId,
      latitude: tempAnimal.latitude,
      longitude: tempAnimal.longitude,
      photos: tempAnimal.photos || []
    });

    // Mark temp animal as registered and link
    tempAnimal.isFormallyRegistered = true;
    tempAnimal.permanentTagNumber = newAnimal.tagNumber;
    tempAnimal.permanentAnimalId = newAnimal.id;
    saveToStorage(STORAGE_KEYS.TEMPORARY_ANIMALS, this.temporaryAnimals);

    // Update any existing cases pointing to this temp animal
    this.cases.forEach(c => {
      if (c.temporaryAnimalId === tempAnimal.id || c.temporaryTag === tempAnimal.temporaryTag) {
        c.animalId = newAnimal.id;
        c.animalTag = newAnimal.tagNumber;
        c.auditTrail.push({
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: this.currentUser.id,
          actorName: this.currentUser.name,
          actorRole: this.currentUser.role,
          action: 'TAG_ASSIGNED',
          details: `Temporary ID ${tempAnimal.temporaryTag} transitioned to formal ear tag ${newAnimal.tagNumber}.`
        });
      }
    });
    saveToStorage(STORAGE_KEYS.CASES, this.cases);

    this.notify();
    return newAnimal;
  }

  public findRelevantFarmHerdHistory(params: {
    farmId?: string;
    herdId?: string;
    ownerPhone?: string;
    ownerName?: string;
    villageId?: string;
    species?: Species;
  }): Case[] {
    const { farmId, herdId, ownerPhone, ownerName, villageId, species } = params;
    return this.cases.filter(c => {
      // Must match species if specified
      if (species && c.species !== species) return false;

      // Match on farmId or herdId or ownerPhone or ownerName
      const matchesFarm = farmId && c.farmId === farmId;
      const matchesHerd = herdId && c.herdId === herdId;
      const matchesOwner = (ownerPhone && c.ownerPhone === ownerPhone) ||
                           (ownerName && c.ownerName.toLowerCase() === ownerName.toLowerCase());
      const matchesVillage = villageId && c.villageId === villageId;

      return matchesFarm || matchesHerd || matchesOwner || matchesVillage;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public registerHerd(herdData: Omit<Herd, 'id' | 'herdCode' | 'riskScore' | 'riskLevel'>): Herd {
    const user = this.currentUser;
    let resolvedOwnerId = herdData.ownerId;
    let resolvedOwnerName = herdData.ownerName;
    let resolvedFarmId = herdData.farmId;

    if (user?.role === 'FARMER') {
      resolvedOwnerId = user.id;
      resolvedOwnerName = user.name;
      const userFarms = this.getScopedFarms();
      const matchedFarm = userFarms.find(f => f.id === herdData.farmId);
      resolvedFarmId = matchedFarm ? matchedFarm.id : (user.farmId || userFarms[0]?.id || 'farm_01');
    }

    const newHerd: Herd = {
      ...herdData,
      ownerId: resolvedOwnerId,
      ownerName: resolvedOwnerName,
      farmId: resolvedFarmId,
      id: `hrd_${Date.now()}`,
      herdCode: `HRD-${(herdData.districtId || 'DIS').toUpperCase().slice(-3)}-${Math.floor(10 + Math.random() * 90)}`,
      riskScore: 20,
      riskLevel: 'LOW'
    };

    this.herds.unshift(newHerd);
    saveToStorage(STORAGE_KEYS.HERDS, this.herds);
    this.notify();
    return newHerd;
  }

  public updateHerd(id: string, updates: Partial<Herd>): Herd | undefined {
    const herd = this.herds.find(h => h.id === id || h.herdCode === id);
    if (!herd) return undefined;

    if (this.currentUser?.role === 'FARMER') {
      const userHerdIds = this.getFarmerHerdIds(this.currentUser);
      if (!userHerdIds.has(herd.id)) {
        console.warn('Unauthorized attempt to update herd belonging to another farmer');
        return undefined;
      }
      // Farmers cannot reassign herd ownership
      delete (updates as any).ownerId;
      delete (updates as any).ownerName;
      if (updates.farmId && !this.getUserFarmIds(this.currentUser).has(updates.farmId)) {
        delete updates.farmId;
      }
    }

    Object.assign(herd, updates);
    saveToStorage(STORAGE_KEYS.HERDS, this.herds);
    this.notify();
    return herd;
  }

  public deleteHerd(id: string): boolean {
    const index = this.herds.findIndex(h => h.id === id || h.herdCode === id);
    if (index === -1) return false;

    const herd = this.herds[index];
    if (this.currentUser?.role === 'FARMER') {
      const userHerdIds = this.getFarmerHerdIds(this.currentUser);
      if (!userHerdIds.has(herd.id)) {
        console.warn('Unauthorized attempt to delete herd belonging to another farmer');
        return false;
      }
    }

    this.herds.splice(index, 1);
    saveToStorage(STORAGE_KEYS.HERDS, this.herds);
    this.notify();
    return true;
  }

  public createCase(caseData: Omit<Case, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'riskScore' | 'riskLevel' | 'suspectedDiseases'> & { customRisk?: { score: number; level: any; suspected: any[] } }): Case {
    const timestamp = new Date().toISOString();
    const caseNum = `CAS-${(caseData.stateId || 'IN').toUpperCase().slice(-2)}-${(caseData.districtName || 'DIS').toUpperCase().slice(0, 3)}-2026-${String((this.cases || []).length + 1).padStart(4, '0')}`;

    // Enforce farmer identity for case submission
    if (this.currentUser?.role === 'FARMER') {
      caseData.reporterId = this.currentUser.id;
      caseData.reporterName = this.currentUser.name;
      caseData.ownerName = this.currentUser.name;
      caseData.ownerPhone = this.currentUser.phone || caseData.ownerPhone;
      const userFarms = this.getUserFarmIds(this.currentUser);
      if (!caseData.farmId || !userFarms.has(caseData.farmId)) {
        caseData.farmId = this.currentUser.farmId || Array.from(userFarms)[0] || caseData.farmId;
      }
    }

    // Compute explainable report credibility and validation
    const credAssessment = ReportCredibilityEngine.assessReportCredibility({
      caseData: {
        ...caseData,
        submittedAt: timestamp
      },
      existingCases: this.cases,
      animals: this.animals,
      herds: this.herds,
      currentUser: this.currentUser,
      isOfflineSubmission: this.isSimulatedOffline
    });

    // Compute automatic risk assessment (Rule-Based Engine) - Credibility Aware
    const riskResult = assessLivestockRisk({
      species: caseData.species,
      symptoms: caseData.symptoms,
      affectedCount: caseData.affectedCount,
      deadCount: caseData.deadCount,
      latitude: caseData.latitude,
      longitude: caseData.longitude,
      vaccinationStatus: caseData.vaccinationStatusAtReport,
      existingCases: this.cases,
      activeOutbreaks: this.outbreaks,
      config: this.systemConfig,
      credibilityScore: credAssessment.credibilityScore,
      credibilityTier: credAssessment.credibilityTier,
      credibilityStatus: credAssessment.credibilityStatus
    });

    // Compute Hybrid Decision Support Assessment (Rule + ML + Knowledge Base)
    const hybridResult = HybridRiskEngine.evaluate({
      species: caseData.species,
      symptoms: caseData.symptoms,
      symptomDurationDays: caseData.symptomDurationDays || 3,
      previousDiseaseHistory: caseData.previousHealthHistory,
      affectedCount: caseData.affectedCount,
      deadCount: caseData.deadCount,
      latitude: caseData.latitude,
      longitude: caseData.longitude,
      stateId: caseData.stateId,
      districtId: caseData.districtId,
      villageId: caseData.villageId,
      vaccinationStatus: caseData.vaccinationStatusAtReport,
      existingCases: this.cases,
      activeOutbreaks: this.outbreaks,
      weatherCondition: caseData.weatherAtReport ? {
        humidityPct: caseData.weatherAtReport.humidityPct,
        temperatureC: caseData.weatherAtReport.temperatureC,
        rainfallMm: caseData.weatherAtReport.rainfallMm
      } : undefined
    });

    const isUntagged = caseData.animalStatus === 'UNTAGGED' || !!caseData.temporaryAnimalId;
    const historyDetail = caseData.historicalCaseLink
      ? ` Linked to previous case ${caseData.historicalCaseLink.historicalCaseNumber} (${caseData.historicalCaseLink.relationshipType.replace(/_/g, ' ')}).`
      : '';

    // If critical urgent safety override triggered (e.g. mortality, zoonotic, sudden surge)
    let finalPriority = caseData.priority;
    if (credAssessment.isCriticalUrgentVerification && finalPriority === 'ROUTINE') {
      finalPriority = 'URGENT';
    }

    const caseId = `cas_${Date.now()}`;
    const linkedAnimalId = caseData.animalId || caseData.temporaryAnimalId;
    const linkedPhotos = (caseData.photos || []).map(p => ({
      ...p,
      caseId: caseId,
      animalId: linkedAnimalId || p.animalId
    }));

    const newCase: Case = {
      ...caseData,
      id: caseId,
      caseNumber: caseNum,
      riskScore: hybridResult.finalRiskScore,
      riskLevel: hybridResult.finalRiskLevel,
      priority: finalPriority,
      suspectedDiseases: riskResult.suspectedDiseases,
      hybridAssessment: hybridResult,
      mlPrediction: hybridResult.mlScreening,
      createdAt: timestamp,
      updatedAt: timestamp,
      // Credibility Layer Fields
      credibilityScore: credAssessment.credibilityScore,
      credibilityTier: credAssessment.credibilityTier,
      credibilityStatus: credAssessment.credibilityStatus,
      verificationState: credAssessment.verificationState,
      credibilityReasons: credAssessment.credibilityReasons,
      anomalyFlags: credAssessment.anomalyFlags,
      locationMatchScore: credAssessment.locationMatchScore,
      reporterTrustScore: credAssessment.reporterTrustScore,
      animalHistoryConsistencyScore: credAssessment.animalHistoryConsistencyScore,
      credibilityFeatureBreakdown: credAssessment.credibilityFeatureBreakdown,
      mlFeatureVector: credAssessment.mlFeatureVector,
      isCriticalUrgentVerification: credAssessment.isCriticalUrgentVerification,
      duplicateOfCaseId: credAssessment.duplicateOfCaseId,
      relatedCaseIds: credAssessment.relatedCaseIds,
      eventCorrelationId: credAssessment.eventCorrelationId,
      sourceType: (this.currentUser?.role as any) || 'FARMER',
      submittedAt: timestamp,
      deviceTimestamp: timestamp,
      provisionalOfflineScore: this.isSimulatedOffline,
      photos: linkedPhotos,
      photoEvidenceAvailable: linkedPhotos.length > 0,
      credibilityAuditTrail: [
        {
          id: `aud_cred_${Date.now()}`,
          action: 'INITIAL_ASSESSMENT',
          previousStatus: 'NONE',
          newStatus: credAssessment.credibilityStatus,
          actorId: this.currentUser?.id || 'usr_unknown',
          actorName: this.currentUser?.name || 'User',
          actorRole: this.currentUser?.role || 'FARMER',
          timestamp,
          reason: `Automated baseline assessment: ${credAssessment.credibilityScore}/100 (${credAssessment.credibilityTier}). ${credAssessment.anomalyFlags.length > 0 ? `Anomalies: ${credAssessment.anomalyFlags.join(', ')}.` : 'No data anomalies detected.'}`
        }
      ],
      auditTrail: [
        {
          id: `aud_${Date.now()}`,
          timestamp,
          actorId: this.currentUser?.id || 'usr_unknown',
          actorName: this.currentUser?.name || 'User',
          actorRole: this.currentUser?.role || 'FARMER',
          action: 'CASE_CREATED',
          details: `Reported ${(caseData.symptoms || []).length} symptom(s) with ${hybridResult.finalRiskLevel} screening risk (ML Likelihood: ${Math.round(((hybridResult.mlScreening?.topPrediction?.probability) || 0.5) * 100)}%). Credibility Score: ${credAssessment.credibilityScore}/100 [${credAssessment.credibilityTier}].${isUntagged ? ` Registered for untagged animal (${caseData.temporaryTag || 'Temporary ID generated'}).` : ''}${historyDetail}`
        }
      ]
    };

    if (this.isSimulatedOffline) {
      this.offlineQueue.push({
        id: `sync_${Date.now()}`,
        type: 'CASE_REPORT',
        data: newCase,
        createdAt: timestamp,
        status: 'PENDING'
      });
      saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
    }

    this.cases.unshift(newCase);
    saveToStorage(STORAGE_KEYS.CASES, this.cases);

    // If animal attached, mark status affected and link photos
    if (newCase.animalId) {
      const anm = this.animals.find(a => a.id === newCase.animalId);
      if (anm) {
        anm.currentHealthStatus = 'AFFECTED';
        anm.activeCaseId = newCase.id;
        anm.lastCheckedAt = timestamp.split('T')[0];
        if (linkedPhotos.length > 0) {
          if (!anm.photos) anm.photos = [];
          anm.photos.push(...linkedPhotos);
        }
        saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);
      }
    } else if (newCase.temporaryAnimalId) {
      const tempAnm = this.temporaryAnimals.find(a => a.id === newCase.temporaryAnimalId);
      if (tempAnm) {
        if (linkedPhotos.length > 0) {
          if (!tempAnm.photos) tempAnm.photos = [];
          tempAnm.photos.push(...linkedPhotos);
          saveToStorage(STORAGE_KEYS.TEMPORARY_ANIMALS, this.temporaryAnimals);
        }
      }
    }

    // Critical Alert for urgent verification override
    if (newCase.isCriticalUrgentVerification) {
      this.createAlert({
        title: `URGENT VERIFICATION: ${newCase.caseNumber} (${newCase.suspectedDiseases[0]?.diseaseName || 'Disease'})`,
        message: `${newCase.villageName}, ${newCase.districtName}: ${credAssessment.urgentReason || 'High consequence livestock report flagged for urgent in-person verification.'}`,
        priority: 'CRITICAL',
        category: 'CASE_ESCALATION',
        targetRoles: ['VETERINARIAN', 'FIELD_WORKER', 'DISTRICT_OFFICIAL'],
        districtName: newCase.districtName,
        villageName: newCase.villageName,
        caseId: newCase.id
      });
    }

    // Auto-generate Alert if High or Critical
    if (newCase.riskLevel === 'HIGH' || newCase.riskLevel === 'CRITICAL') {
      this.createAlert({
        title: `${newCase.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH RISK'}: Suspected ${newCase.suspectedDiseases[0]?.diseaseName || 'Disease'} in ${newCase.villageName}`,
        message: `Case ${newCase.caseNumber} reported with ${newCase.affectedCount} affected animal(s). Triage priority: ${newCase.priority}.`,
        priority: newCase.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        category: 'HIGH_RISK',
        targetRoles: ['VETERINARIAN', 'FIELD_WORKER', 'DISTRICT_OFFICIAL', 'STATE_ADMIN'],
        districtName: newCase.districtName,
        villageName: newCase.villageName,
        caseId: newCase.id
      });
    }

    this.syncHerdStatistics();
    this.notify();
    return newCase;
  }

  public updateCaseStatus(caseId: string, status: CaseStatus, notes?: string): Case | undefined {
    const c = this.cases.find(x => x.id === caseId);
    if (!c) return undefined;

    const timestamp = new Date().toISOString();
    c.status = status;
    c.updatedAt = timestamp;
    if (notes) c.statusNotes = notes;

    c.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp,
      actorId: this.currentUser.id,
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      action: 'STATUS_UPDATED',
      details: `Status escalated to ${status}. ${notes ? `Notes: ${notes}` : ''}`
    });

    // If resolved or ruled out, update animal health
    if (status === 'RESOLVED' || status === 'RULED_OUT') {
      if (c.animalId) {
        const a = this.animals.find(x => x.id === c.animalId);
        if (a) {
          a.currentHealthStatus = status === 'RESOLVED' ? 'RECOVERED' : 'HEALTHY';
          a.activeCaseId = undefined;
          saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);
        }
      }
    }

    // Lab/Veterinary Feedback Loop: Queue confirmed case as potential training candidate
    if (status === 'CONFIRMED' && this.currentUser.role === 'VETERINARIAN') {
      try {
        trainingCandidateQueueService.enqueueVeterinaryValidatedCase(
          c,
          this.currentUser.name,
          c.confirmedDiseaseId || c.suspectedDiseaseId || 'dis_other_healthy'
        );
      } catch (err) {
        console.warn('Could not enqueue training candidate', err);
      }
    }

    saveToStorage(STORAGE_KEYS.CASES, this.cases);
    this.syncHerdStatistics();
    this.notify();
    return c;
  }

  public addFollowUpRecord(caseId: string, followUp: {
    timeframe: '24_HOURS' | '48_HOURS' | '7_DAYS' | 'CUSTOM';
    statusUpdate: 'IMPROVING' | 'SAME' | 'GETTING_WORSE' | 'CRITICAL' | 'DECEASED';
    notes?: string;
    recordedBy?: string;
  }): FollowUpRecord | undefined {
    const c = this.cases.find(x => x.id === caseId);
    if (!c) return undefined;

    const timestamp = new Date().toISOString();
    const isWorsening = followUp.statusUpdate === 'GETTING_WORSE' || followUp.statusUpdate === 'CRITICAL' || followUp.statusUpdate === 'DECEASED';

    const newRecord: FollowUpRecord = {
      id: `flw_${Date.now()}`,
      caseId,
      animalId: c.animalId,
      animalTag: c.animalTag,
      recordedAt: timestamp,
      timeframe: followUp.timeframe,
      statusUpdate: followUp.statusUpdate,
      notes: followUp.notes,
      escalationTriggered: isWorsening,
      recordedBy: followUp.recordedBy || this.currentUser.name
    };

    if (!c.followUpRecords) c.followUpRecords = [];
    c.followUpRecords.unshift(newRecord);
    c.updatedAt = timestamp;

    c.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp,
      actorId: this.currentUser.id,
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      action: 'FOLLOW_UP_LOGGED',
      details: `Follow-up logged at ${followUp.timeframe.replace('_', ' ')}: Status is ${followUp.statusUpdate}. ${followUp.notes || ''}`
    });

    if (isWorsening) {
      c.priority = 'EMERGENCY';
      this.createAlert({
        title: `CRITICAL ALERT: Worsening Case ${c.caseNumber} in ${c.villageName}`,
        message: `Follow-up status recorded as ${followUp.statusUpdate}. Immediate veterinary intervention required. ${followUp.notes || ''}`,
        priority: 'CRITICAL',
        category: 'HIGH_RISK',
        targetRoles: ['VETERINARIAN', 'FIELD_WORKER', 'DISTRICT_OFFICIAL'],
        districtName: c.districtName,
        villageName: c.villageName,
        caseId: c.id
      });
    } else if (followUp.statusUpdate === 'IMPROVING') {
      if (c.status === 'UNDER_REVIEW' || c.status === 'NEW') {
        c.status = 'UNDER_REVIEW';
      }
    }

    saveToStorage(STORAGE_KEYS.CASES, this.cases);
    this.notify();
    return newRecord;
  }

  public escalateCaseToVet(caseId: string, reason: string): Case | undefined {
    const c = this.cases.find(x => x.id === caseId);
    if (!c) return undefined;

    const timestamp = new Date().toISOString();
    c.priority = 'EMERGENCY';
    c.updatedAt = timestamp;

    c.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp,
      actorId: this.currentUser.id,
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      action: 'VETERINARY_ESCALATION',
      details: `Escalated directly to Veterinary Rapid Response. Reason: ${reason}`
    });

    this.createAlert({
      title: `URGENT VET DISPATCH: Case ${c.caseNumber}`,
      message: `Direct veterinary review requested for ${c.species} in ${c.villageName}. Reason: ${reason}`,
      priority: 'CRITICAL',
      category: 'HIGH_RISK',
      targetRoles: ['VETERINARIAN', 'DISTRICT_OFFICIAL'],
      districtName: c.districtName,
      villageName: c.villageName,
      caseId: c.id
    });

    saveToStorage(STORAGE_KEYS.CASES, this.cases);
    this.notify();
    return c;
  }

  public createLabSample(sampleData: Omit<LabSample, 'id' | 'sampleCode' | 'status' | 'result'>): LabSample {
    const newSample: LabSample = {
      ...sampleData,
      id: `smp_${Date.now()}`,
      sampleCode: `LAB-${sampleData.species.slice(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'RECEIVED_AT_LAB',
      result: 'PENDING'
    };

    this.labSamples.unshift(newSample);
    saveToStorage(STORAGE_KEYS.LAB_SAMPLES, this.labSamples);

    // Update case status to LAB_TESTING
    const c = this.cases.find(x => x.id === sampleData.caseId);
    if (c) {
      if (!c.sampleIds) c.sampleIds = [];
      c.sampleIds.push(newSample.id);
      this.updateCaseStatus(c.id, 'LAB_TESTING', `Diagnostic sample ${newSample.sampleCode} received at ${newSample.laboratoryName}.`);
    }

    this.notify();
    return newSample;
  }

  public submitLabResult(sampleId: string, result: TestResult, resultDetails: string, remarks?: string): LabSample | undefined {
    const sample = this.labSamples.find(s => s.id === sampleId);
    if (!sample) return undefined;

    const timestamp = new Date().toISOString();
    sample.result = result;
    sample.status = 'RESULT_AVAILABLE';
    sample.resultDetails = resultDetails;
    sample.testedBy = this.currentUser.name;
    sample.resultDate = timestamp.split('T')[0];
    sample.remarks = remarks;

    saveToStorage(STORAGE_KEYS.LAB_SAMPLES, this.labSamples);

    // Update associated case
    const c = this.cases.find(x => x.id === sample.caseId);
    if (c) {
      if (result === 'POSITIVE') {
        this.updateCaseStatus(c.id, 'CONFIRMED', `Laboratory test (${sample.testRequested}) returned POSITIVE for ${sample.suspectedDiseaseName}.`);
        
        // Lab feedback loop: Enqueue gold-standard training record
        try {
          trainingCandidateQueueService.enqueueLabConfirmedCase(c, sample, this.currentUser.name);
        } catch (err) {
          console.warn('Could not enqueue lab-confirmed training candidate', err);
        }

        // Connect with Credibility & Verification engine
        try {
          this.verifyCase({
            caseId: c.id,
            action: 'LAB_CONFIRM',
            notes: `Gold-standard diagnostic confirmation: ${sample.testRequested} returned positive for ${sample.suspectedDiseaseName}. Lab: ${sample.laboratoryName}. Details: ${resultDetails}`,
            evidence: {
              type: 'LAB_SAMPLE',
              reference: sample.sampleCode,
              description: `Laboratory Test Certificate (${sample.testRequested}): Positive`,
              addedAt: timestamp,
              addedBy: this.currentUser.name
            }
          });
        } catch (err) {
          console.warn('Could not trigger verification update for lab confirmation', err);
        }

        this.createAlert({
          title: `LAB CONFIRMED: ${sample.suspectedDiseaseName} in ${c.villageName}`,
          message: `Sample ${sample.sampleCode} positive. Immediate biosecurity and ring containment required.`,
          priority: 'CRITICAL',
          category: 'LAB_CONFIRMATION',
          targetRoles: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'FIELD_WORKER'],
          districtName: c.districtName,
          villageName: c.villageName,
          caseId: c.id
        });
      } else if (result === 'NEGATIVE') {
        this.updateCaseStatus(c.id, 'RULED_OUT', `Laboratory test (${sample.testRequested}) ruled out ${sample.suspectedDiseaseName}.`);
        try {
          this.verifyCase({
            caseId: c.id,
            action: 'DISMISS',
            notes: `Diagnostic test (${sample.testRequested}) ruled out ${sample.suspectedDiseaseName}. Remarks: ${remarks || 'Negative findings'}`,
            rejectionReason: `Negative laboratory findings (${sample.testRequested})`
          });
        } catch (err) {
          console.warn('Could not trigger verification update for negative lab result', err);
        }
      }
    }

    // Laboratory RBAC Audit Logging
    this.logLabAction({
      action: 'SAMPLE_RESULT_UPDATED',
      sampleId: sample.id,
      sampleCode: sample.sampleCode,
      caseId: sample.caseId,
      caseNumber: sample.caseNumber,
      previousValue: 'PENDING',
      newValue: result,
      details: `Diagnostic result certified: ${result} using ${sample.testRequested}. ${remarks ? `Remarks: ${remarks}` : ''}`
    });

    if (result === 'POSITIVE') {
      this.logLabAction({
        action: 'CONFIRMATION_STATUS_CHANGED',
        sampleId: sample.id,
        sampleCode: sample.sampleCode,
        caseId: sample.caseId,
        caseNumber: sample.caseNumber,
        previousValue: 'SUSPECTED',
        newValue: 'CONFIRMED',
        details: `Official laboratory confirmation for ${sample.suspectedDiseaseName} in ${sample.species}. Escalated to District & State surveillance.`
      });
    }

    this.notify();
    return sample;
  }

  /**
   * Get all immutable audit log entries for laboratory operations
   */
  public getLabAuditLogs(): LabAuditEntry[] {
    return [...this.labAuditLogs];
  }

  /**
   * Record a sensitive laboratory action in the RBAC audit trail
   */
  public logLabAction(entry: Omit<LabAuditEntry, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>): void {
    const user = this.currentUser || { id: 'usr_lab_staff', name: 'Laboratory Staff', role: 'LABORATORY_STAFF' as Role };
    const newLog: LabAuditEntry = {
      id: `laud_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ...entry
    };

    this.labAuditLogs.unshift(newLog);
    if (this.labAuditLogs.length > 200) {
      this.labAuditLogs = this.labAuditLogs.slice(0, 200);
    }
    saveToStorage(STORAGE_KEYS.LAB_AUDIT_LOGS, this.labAuditLogs);
    this.notify();
  }

  /**
   * Retrieve disease surveillance cases with least-privilege privacy filtering:
   * Redacts farmer personal contact numbers and private identity for diagnostic laboratory operations.
   */
  public getLabSurveillanceCases(): Case[] {
    return this.cases.map(c => {
      return {
        ...c,
        ownerPhone: 'REDACTED (Data Privacy)',
        ownerName: c.ownerName ? `${c.ownerName.split(' ')[0]} (Farm ${c.farmId || 'ID'})` : 'Confidential'
      };
    });
  }

  public getUsers(): User[] {
    return this.getAllUsers();
  }

  public createMortalityReport(mortData: Omit<MortalityReport, 'id' | 'reportCode' | 'createdAt' | 'outbreakTriggered'>): MortalityReport {
    const timestamp = new Date().toISOString();
    const newReport: MortalityReport = {
      ...mortData,
      id: `mor_${Date.now()}`,
      reportCode: `MOR-${mortData.species.slice(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
      outbreakTriggered: mortData.deadCount >= 2 || mortData.suspectedCause.toLowerCase().includes('anthrax'),
      createdAt: timestamp
    };

    if (this.isSimulatedOffline) {
      this.offlineQueue.push({
        id: `sync_${Date.now()}`,
        type: 'MORTALITY_REPORT',
        data: newReport,
        createdAt: timestamp,
        status: 'PENDING'
      });
      saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
    }

    this.mortalityReports.unshift(newReport);
    saveToStorage(STORAGE_KEYS.MORTALITY, this.mortalityReports);

    // If animal tagged, mark status DECEASED
    if (newReport.animalId) {
      const a = this.animals.find(x => x.id === newReport.animalId);
      if (a) {
        a.currentHealthStatus = 'DECEASED';
        saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);
      }
    }

    // Trigger Mortality Spike Alert
    this.createAlert({
      title: `URGENT MORTALITY EVENT: ${newReport.deadCount} ${newReport.species} Dead in ${newReport.villageName}`,
      message: `Suspected Cause: ${newReport.suspectedCause}. Disposal: ${newReport.carcassDisposalMethod}.`,
      priority: 'CRITICAL',
      category: 'MORTALITY_CLUSTER',
      targetRoles: ['VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'FIELD_WORKER'],
      districtName: newReport.districtName,
      villageName: newReport.villageName
    });

    this.notify();
    return newReport;
  }

  public addPhotoToCase(caseId: string, photo: AnimalPhoto): Case | undefined {
    const caseObj = this.cases.find(c => c.id === caseId);
    if (!caseObj) return undefined;

    if (!caseObj.photos) caseObj.photos = [];
    caseObj.photos.push(photo);
    caseObj.photoEvidenceAvailable = true;

    // Recalculate credibility with the new photo evidence
    const reassessment = ReportCredibilityEngine.assessReportCredibility({
      caseData: caseObj,
      existingCases: this.cases,
      animals: this.animals,
      herds: this.herds,
      currentUser: this.currentUser,
      isOfflineSubmission: this.isSimulatedOffline
    });
    caseObj.credibilityScore = reassessment.credibilityScore;
    caseObj.credibilityTier = reassessment.credibilityTier;
    caseObj.credibilityReasons = reassessment.credibilityReasons;
    caseObj.credibilityFeatureBreakdown = reassessment.credibilityFeatureBreakdown;

    caseObj.auditTrail.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: this.currentUser.id,
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      action: 'PHOTO_EVIDENCE_ATTACHED',
      details: `${photo.source || this.currentUser.role} attached photo (${photo.photoType}). Credibility score updated to ${reassessment.credibilityScore}/100.`
    });

    saveToStorage(STORAGE_KEYS.CASES, this.cases);

    // Also link to animal if case has animalId
    if (caseObj.animalId) {
      this.addPhotoToAnimal(caseObj.animalId, photo);
    }

    this.notify();
    return caseObj;
  }

  public addPhotoToAnimal(animalId: string, photo: AnimalPhoto): Animal | undefined {
    const animal = this.animals.find(a => a.id === animalId);
    if (!animal) return undefined;

    if (!animal.photos) animal.photos = [];
    if (!animal.photos.some(p => p.id === photo.id)) {
      animal.photos.push(photo);
      saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);
      this.notify();
    }
    return animal;
  }

  public updatePhotoReviewStatus(
    arg1: string,
    arg2: string,
    arg3?: any,
    arg4?: string
  ): Case | undefined {
    let caseId: string | undefined;
    let photoId: string;
    let status: 'RELEVANT' | 'NOT_RELEVANT' | 'NEED_BETTER_PHOTO';
    let notes: string | undefined;

    if (['RELEVANT', 'NOT_RELEVANT', 'NEED_BETTER_PHOTO'].includes(arg2)) {
      // Called as: updatePhotoReviewStatus(photoId, status, notes)
      photoId = arg1;
      status = arg2 as any;
      notes = typeof arg3 === 'string' ? arg3 : undefined;
      const foundCase = this.cases.find(c => (c.photos || []).some(p => p.id === photoId));
      caseId = foundCase?.id;
    } else {
      // Called as: updatePhotoReviewStatus(caseId, photoId, status, notes)
      caseId = arg1;
      photoId = arg2;
      status = arg3;
      notes = arg4;
    }

    if (!caseId) return undefined;
    const caseObj = this.cases.find(c => c.id === caseId);
    if (!caseObj || !caseObj.photos) return undefined;

    const photo = caseObj.photos.find(p => p.id === photoId);
    if (photo) {
      photo.vetReviewStatus = status;
      if (notes) photo.vetNotes = notes;

      caseObj.auditTrail.push({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: this.currentUser.id,
        actorName: this.currentUser.name,
        actorRole: this.currentUser.role,
        action: 'PHOTO_REVIEWED',
        details: `${this.currentUser.role === 'FIELD_WORKER' ? 'Field Worker' : 'Veterinarian'} marked photo (${photo.photoType}) as ${status}. ${notes ? `Note: "${notes}"` : ''}`
      });

      saveToStorage(STORAGE_KEYS.CASES, this.cases);
      this.notify();
    }
    return caseObj;
  }

  public createVaccinationRecord(vacData: Omit<VaccinationRecord, 'id' | 'status'>): VaccinationRecord {
    const newRecord: VaccinationRecord = {
      ...vacData,
      id: `vac_rec_${Date.now()}`,
      status: new Date(vacData.nextDueDate) < new Date() ? 'OVERDUE' : 'COMPLETED'
    };

    this.vaccinations.unshift(newRecord);
    saveToStorage(STORAGE_KEYS.VACCINATIONS, this.vaccinations);

    // Update animal's vaccine count
    if (newRecord.animalId) {
      const a = this.animals.find(x => x.id === newRecord.animalId);
      if (a) {
        a.vaccinationCount += 1;
        saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);
      }
    }

    this.notify();
    return newRecord;
  }

  public createTreatmentRecord(treatmentData: Omit<TreatmentRecord, 'id' | 'createdAt'>): TreatmentRecord {
    const newTreatment: TreatmentRecord = {
      ...treatmentData,
      id: `trt_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.treatments.unshift(newTreatment);
    saveToStorage(STORAGE_KEYS.TREATMENTS, this.treatments);

    // Link treatment to case
    if (newTreatment.caseId) {
      const c = this.cases.find(x => x.id === newTreatment.caseId);
      if (c) {
        if (!c.treatmentIds) c.treatmentIds = [];
        c.treatmentIds.push(newTreatment.id);
        saveToStorage(STORAGE_KEYS.CASES, this.cases);
      }
    }

    this.notify();
    return newTreatment;
  }

  public createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'isRead'>): Alert {
    const newAlert: Alert = {
      ...alertData,
      id: `alt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    this.alerts.unshift(newAlert);
    saveToStorage(STORAGE_KEYS.ALERTS, this.alerts);
    this.notify();
    return newAlert;
  }

  public addAlert(alert: Alert): Alert {
    const existingIndex = this.alerts.findIndex(a => a.id === alert.id);
    if (existingIndex >= 0) {
      this.alerts[existingIndex] = alert;
    } else {
      this.alerts.unshift(alert);
    }
    saveToStorage(STORAGE_KEYS.ALERTS, this.alerts);
    this.notify();
    return alert;
  }

  public markAlertAsRead(alertId: string) {
    const a = this.alerts.find(x => x.id === alertId);
    if (a) {
      a.isRead = true;
      saveToStorage(STORAGE_KEYS.ALERTS, this.alerts);
      this.notify();
    }
  }

  public markAllAlertsRead() {
    this.alerts.forEach(a => (a.isRead = true));
    saveToStorage(STORAGE_KEYS.ALERTS, this.alerts);
    this.notify();
  }

  public updateSystemConfig(newConfig: SystemConfig) {
    this.systemConfig = newConfig;
    saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, newConfig);
    this.notify();
  }

  public createFieldVisit(visitData: Omit<FieldVisit, 'id' | 'visitCode'>): FieldVisit {
    const newVisit: FieldVisit = {
      ...visitData,
      id: `vst_${Date.now()}`,
      visitCode: `VST-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    this.fieldVisits.unshift(newVisit);
    saveToStorage(STORAGE_KEYS.FIELD_VISITS, this.fieldVisits);

    this.createAlert({
      title: `Field Visit Scheduled: ${newVisit.villageName}`,
      message: `${newVisit.purpose.replace('_', ' ')} assigned to ${newVisit.assignedWorkerName} for farm ${newVisit.farmName}. Priority: ${newVisit.priority}.`,
      priority: newVisit.priority === 'EMERGENCY' || newVisit.priority === 'HIGH' ? 'HIGH' : 'INFO',
      category: 'CASE_ESCALATION',
      targetRoles: ['FIELD_WORKER', 'VETERINARIAN', 'FARMER'],
      districtName: 'Pune'
    });

    this.notify();
    return newVisit;
  }

  public updateFieldVisitStatus(visitId: string, status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', notes?: string): FieldVisit | undefined {
    const v = this.fieldVisits.find(x => x.id === visitId);
    if (!v) return undefined;

    v.status = status;
    if (notes) v.notes = notes;
    if (status === 'COMPLETED') {
      v.completedAt = new Date().toISOString();
    }

    saveToStorage(STORAGE_KEYS.FIELD_VISITS, this.fieldVisits);
    this.notify();
    return v;
  }

  public issueAdvisory(advisoryData: Omit<Advisory, 'id' | 'code' | 'issuedAt' | 'isActive'>): Advisory {
    const newAdvisory: Advisory = {
      ...advisoryData,
      id: `adv_${Date.now()}`,
      code: `ADV-${advisoryData.level.slice(0, 3)}-2026-${Math.floor(100 + Math.random() * 900)}`,
      issuedAt: new Date().toISOString(),
      isActive: true
    };

    this.advisories.unshift(newAdvisory);
    saveToStorage(STORAGE_KEYS.ADVISORIES, this.advisories);

    this.createAlert({
      title: `OFFICIAL ADVISORY: ${newAdvisory.title}`,
      message: `${newAdvisory.jurisdiction}: ${newAdvisory.content.slice(0, 120)}...`,
      priority: newAdvisory.priority === 'EMERGENCY' ? 'CRITICAL' : 'HIGH',
      category: 'OUTBREAK',
      targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN']
    });

    this.notify();
    return newAdvisory;
  }

  public declareOutbreak(outbreakData: Omit<Outbreak, 'id' | 'outbreakCode' | 'lastUpdated'>): Outbreak {
    const timestamp = new Date().toISOString();
    const newOutbreak: Outbreak = {
      ...outbreakData,
      id: `obk_${Date.now()}`,
      outbreakCode: `OBK-${outbreakData.districtName.toUpperCase().slice(0, 3)}-2026-${Math.floor(10 + Math.random() * 90)}`,
      lastUpdated: timestamp
    };

    this.outbreaks.unshift(newOutbreak);
    saveToStorage(STORAGE_KEYS.OUTBREAKS, this.outbreaks);

    this.createAlert({
      title: `OUTBREAK DECLARED: ${newOutbreak.diseaseName} in ${newOutbreak.primaryVillage}, ${newOutbreak.districtName}`,
      message: `Containment zone: ${newOutbreak.radiusKm} km radius. Status: ${newOutbreak.status}. Target species: ${newOutbreak.species.join(', ')}.`,
      priority: 'CRITICAL',
      category: 'OUTBREAK',
      targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN'],
      districtName: newOutbreak.districtName,
      villageName: newOutbreak.primaryVillage
    });

    this.notify();
    return newOutbreak;
  }

  public updateOutbreakStatus(outbreakId: string, status: any, measures?: string[]): Outbreak | undefined {
    const obk = this.outbreaks.find(o => o.id === outbreakId);
    if (!obk) return undefined;

    obk.status = status;
    obk.lastUpdated = new Date().toISOString();
    if (measures) obk.containmentMeasures = measures;

    saveToStorage(STORAGE_KEYS.OUTBREAKS, this.outbreaks);
    this.notify();
    return obk;
  }

  // Offline Sync Engine
  public syncPendingOfflineRecords(): { success: boolean; count: number } {
    const count = (this.offlineQueue || []).length;
    this.offlineQueue = [];
    saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
    this.isSimulatedOffline = false;
    saveToStorage(STORAGE_KEYS.IS_OFFLINE, false);

    // Authoritative Server Re-Evaluation for any offline provisional reports
    let reAssessedCount = 0;
    this.cases.forEach(c => {
      if (c.provisionalOfflineScore) {
        const authoritativeResult = ReportCredibilityEngine.assessReportCredibility({
          caseData: c,
          existingCases: this.cases,
          animals: this.animals,
          herds: this.herds,
          currentUser: this.currentUser,
          isOfflineSubmission: false
        });

        c.credibilityScore = authoritativeResult.credibilityScore;
        c.credibilityTier = authoritativeResult.credibilityTier;
        c.credibilityStatus = authoritativeResult.credibilityStatus;
        c.credibilityReasons = authoritativeResult.credibilityReasons;
        c.anomalyFlags = authoritativeResult.anomalyFlags;
        c.credibilityFeatureBreakdown = authoritativeResult.credibilityFeatureBreakdown;
        c.mlFeatureVector = authoritativeResult.mlFeatureVector;
        c.provisionalOfflineScore = false;

        if (!c.credibilityAuditTrail) c.credibilityAuditTrail = [];
        c.credibilityAuditTrail.unshift({
          id: `aud_sync_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          action: 'OFFLINE_SYNC_REASSESSED',
          previousStatus: 'PROVISIONAL_OFFLINE',
          newStatus: c.credibilityStatus || 'PENDING',
          actorId: 'sys_central_server',
          actorName: 'Central Surveillance Sync Engine',
          actorRole: 'SYSTEM_ADMIN',
          timestamp: new Date().toISOString(),
          reason: 'Authoritative server credibility re-evaluated from provisional score upon network restoration.'
        });

        reAssessedCount++;
      }

      // Mark any offline queued photos on cases as synced to central storage
      if (c.photos && c.photos.length > 0) {
        let photosUpdated = false;
        c.photos.forEach(p => {
          if (p.offlineQueued) {
            p.offlineQueued = false;
            photosUpdated = true;
          }
        });
        if (photosUpdated) {
          c.auditTrail.push({
            id: `aud_photosync_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            action: 'PHOTO_EVIDENCE_SYNCED',
            details: 'Local offline photographic evidence successfully uploaded to central surveillance database.',
            timestamp: new Date().toISOString(),
            actorId: 'sys_central_server',
            actorName: 'Central Surveillance Sync Engine',
            actorRole: 'SYSTEM_ADMIN'
          });
          reAssessedCount++;
        }
      }
    });

    // Also mark offline queued photos on animals as synced
    this.animals.forEach(a => {
      if (a.photos && a.photos.length > 0) {
        a.photos.forEach(p => {
          if (p.offlineQueued) {
            p.offlineQueued = false;
          }
        });
      }
    });
    saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);

    if (reAssessedCount > 0) {
      saveToStorage(STORAGE_KEYS.CASES, this.cases);
    }

    this.createAlert({
      title: 'Synchronization Complete',
      message: `Successfully synced ${count} pending offline record(s) with Central Surveillance Database.${reAssessedCount > 0 ? ` ${reAssessedCount} provisional report(s) authoritatively re-evaluated.` : ''}`,
      priority: 'INFO',
      category: 'CASE_ESCALATION',
      targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    });

    this.notify();
    return { success: true, count };
  }

  // ==========================================
  // Credibility & Verification Workflow Engine
  // ==========================================
  public verifyCase(params: {
    caseId: string;
    action: 'FIELD_VERIFY' | 'VET_VERIFY' | 'LAB_CONFIRM' | 'REQUEST_INFO' | 'REJECT' | 'DISMISS';
    notes: string;
    evidence?: VerificationEvidenceItem;
    rejectionReason?: string;
  }): Case | undefined {
    const c = this.cases.find(x => x.id === params.caseId);
    if (!c) return undefined;

    const result = ReportCredibilityEngine.verifyCase({
      caseRecord: c,
      action: params.action,
      actor: this.currentUser,
      notes: params.notes,
      evidence: params.evidence,
      rejectionReason: params.rejectionReason
    });

    saveToStorage(STORAGE_KEYS.CASES, this.cases);

    // Create notification alert for verification update
    const actionLabel = params.action.replace('_', ' ').toLowerCase();
    this.createAlert({
      title: `Case ${c.caseNumber} ${actionLabel}`,
      message: `${this.currentUser.name} (${this.currentUser.role}): ${params.notes || params.rejectionReason || 'Case verification updated.'}`,
      priority: params.action === 'REJECT' ? 'HIGH' : params.action === 'LAB_CONFIRM' ? 'CRITICAL' : 'INFO',
      category: 'CASE_ESCALATION',
      targetRoles: ['VETERINARIAN', 'FIELD_WORKER', 'DISTRICT_OFFICIAL', 'FARMER'],
      districtName: c.districtName,
      villageName: c.villageName,
      caseId: c.id
    });

    this.notify();
    return result.updatedCase;
  }

  public rejectCase(caseId: string, rejectionReason: string, notes?: string): Case | undefined {
    return this.verifyCase({
      caseId,
      action: 'REJECT',
      notes: notes || rejectionReason,
      rejectionReason
    });
  }

  public requestMoreInfoForCase(caseId: string, notes: string): Case | undefined {
    return this.verifyCase({
      caseId,
      action: 'REQUEST_INFO',
      notes
    });
  }

  public escalateCaseForVerification(caseId: string, targetRole: Role, priority: 'HIGH' | 'EMERGENCY', reason: string): Case | undefined {
    const c = this.cases.find(x => x.id === caseId);
    if (!c) return undefined;

    c.priority = priority === 'EMERGENCY' ? 'EMERGENCY' : 'URGENT';
    c.isCriticalUrgentVerification = true;
    c.updatedAt = new Date().toISOString();

    if (!c.credibilityAuditTrail) c.credibilityAuditTrail = [];
    c.credibilityAuditTrail.unshift({
      id: `aud_esc_${Date.now()}`,
      action: 'STATUS_CHANGED',
      previousStatus: c.credibilityStatus || 'PENDING',
      newStatus: 'NEEDS_VERIFICATION',
      actorId: this.currentUser.id,
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      timestamp: new Date().toISOString(),
      reason: `Escalated for immediate verification to ${targetRole}: ${reason}`
    });

    saveToStorage(STORAGE_KEYS.CASES, this.cases);

    this.createAlert({
      title: `ESCALATED FOR VERIFICATION: Case ${c.caseNumber}`,
      message: `Assigned to ${targetRole} for verification priority ${priority}: ${reason}`,
      priority: priority === 'EMERGENCY' ? 'CRITICAL' : 'HIGH',
      category: 'CASE_ESCALATION',
      targetRoles: [targetRole, 'DISTRICT_OFFICIAL', 'STATE_ADMIN'],
      districtName: c.districtName,
      villageName: c.villageName,
      caseId: c.id
    });

    this.notify();
    return c;
  }

  public getCredibilityOverviewMetrics(): CredibilityOverviewMetrics {
    return ReportCredibilityEngine.computeOverviewMetrics(this.cases);
  }

  // Reset database to initial seed data
  public resetToSeedData() {
    localStorage.clear();
    this.init();
    this.notify();
  }
}

export const store = new LivestockGuardStore();
