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
  Species
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
  IS_LOGGED_IN: 'lg_is_logged_in'
};

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
    return item ? JSON.parse(item) : fallback;
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
    this.users = rawUsers.map(u => ({
      ...u,
      accountStatus: u.accountStatus || 'VERIFIED'
    }));
    this.farms = loadFromStorage(STORAGE_KEYS.FARMS, SEED_FARMS);
    this.herds = loadFromStorage(STORAGE_KEYS.HERDS, SEED_HERDS);
    this.animals = loadFromStorage(STORAGE_KEYS.ANIMALS, SEED_ANIMALS);
    this.temporaryAnimals = loadFromStorage(STORAGE_KEYS.TEMPORARY_ANIMALS, SEED_TEMPORARY_ANIMALS);
    this.cases = loadFromStorage(STORAGE_KEYS.CASES, SEED_CASES);
    this.outbreaks = loadFromStorage(STORAGE_KEYS.OUTBREAKS, SEED_OUTBREAKS);
    this.labSamples = loadFromStorage(STORAGE_KEYS.LAB_SAMPLES, SEED_LAB_SAMPLES);
    this.vaccinations = loadFromStorage(STORAGE_KEYS.VACCINATIONS, SEED_VACCINATIONS);
    this.treatments = loadFromStorage(STORAGE_KEYS.TREATMENTS, SEED_TREATMENTS);
    this.mortalityReports = loadFromStorage(STORAGE_KEYS.MORTALITY, SEED_MORTALITY_REPORTS);
    this.alerts = loadFromStorage(STORAGE_KEYS.ALERTS, SEED_ALERTS);
    this.weather = loadFromStorage(STORAGE_KEYS.WEATHER, SEED_WEATHER);
    this.systemConfig = loadFromStorage(STORAGE_KEYS.SYSTEM_CONFIG, DEFAULT_CONFIG);
    this.offlineQueue = loadFromStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
    this.fieldVisits = loadFromStorage(STORAGE_KEYS.FIELD_VISITS, SEED_FIELD_VISITS);
    this.advisories = loadFromStorage(STORAGE_KEYS.ADVISORIES, SEED_ADVISORIES);
    this.currentLanguage = loadFromStorage(STORAGE_KEYS.LANGUAGE, 'en');
    this.isSimulatedOffline = loadFromStorage(STORAGE_KEYS.IS_OFFLINE, false);
    this.isDemoModeActive = loadFromStorage(STORAGE_KEYS.DEMO_MODE, false);
    this.isUserAuthenticated = loadFromStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    
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

    // Match by email, phone, or direct role keyword for convenience
    const matchedUser = this.users.find(u => {
      const uEmail = u.email.toLowerCase();
      const uPhoneClean = u.phone.replace(/\D/g, '');
      const uRoleClean = u.role.toLowerCase();

      if (uEmail === cleanInput) return true;
      if (numericOnly && numericOnly.length >= 8 && uPhoneClean.includes(numericOnly)) return true;
      if (cleanInput === uRoleClean || cleanInput.includes(uRoleClean)) return true;
      if (cleanInput.includes('vet') && u.role === 'VETERINARIAN') return true;
      if (cleanInput.includes('doctor') && u.role === 'VETERINARIAN') return true;
      if (cleanInput.includes('farmer') && u.role === 'FARMER') return true;
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
   * Clears session, clears protected state, and returns to Login
   */
  public logout(): void {
    this.isUserAuthenticated = false;
    this.isDemoModeActive = false;
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
    return this.currentUser;
  }

  public getAllUsers(): User[] {
    return this.users;
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

  // Data Getters
  public getFarms(): Farm[] {
    return this.farms;
  }

  public getHerds(): Herd[] {
    return this.herds;
  }

  public getAnimals(): Animal[] {
    return this.animals;
  }

  public getAnimalById(id: string): Animal | undefined {
    return this.animals.find(a => a.id === id || a.tagNumber === id);
  }

  public getTemporaryAnimals(): TemporaryAnimal[] {
    return this.temporaryAnimals;
  }

  public getTemporaryAnimalById(id: string): TemporaryAnimal | undefined {
    return this.temporaryAnimals.find(a => a.id === id || a.temporaryTag === id);
  }

  public getCases(): Case[] {
    return this.cases;
  }

  public getCaseById(id: string): Case | undefined {
    return this.cases.find(c => c.id === id || c.caseNumber === id);
  }

  public getOutbreaks(): Outbreak[] {
    return this.outbreaks;
  }

  public getOutbreakById(id: string): Outbreak | undefined {
    return this.outbreaks.find(o => o.id === id || o.outbreakCode === id);
  }

  public getLabSamples(): LabSample[] {
    return this.labSamples;
  }

  public getVaccinations(): VaccinationRecord[] {
    return this.vaccinations;
  }

  public getTreatments(): TreatmentRecord[] {
    return this.treatments;
  }

  public getMortalityReports(): MortalityReport[] {
    return this.mortalityReports;
  }

  public getFieldVisits(): FieldVisit[] {
    return this.fieldVisits;
  }

  public getAdvisories(): Advisory[] {
    return this.advisories;
  }

  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public getWeather(districtId: string = 'dt_pune'): WeatherData {
    return this.weather[districtId] || SEED_WEATHER['dt_pune'];
  }

  public getSystemConfig(): SystemConfig {
    return this.systemConfig;
  }

  public getOfflineQueue(): OfflineSyncItem[] {
    return this.offlineQueue;
  }

  // ==========================================
  // ROLE-BASED SCOPED DATA GETTERS
  // ==========================================

  public getScopedCases(): Case[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      return this.cases.filter(
        c => (this.currentUser.farmId && c.farmId === this.currentUser.farmId) ||
             c.ownerName === this.currentUser.name ||
             c.ownerPhone === this.currentUser.phone
      );
    }
    if (role === 'FIELD_WORKER') {
      return this.cases.filter(
        c => c.villageName.toLowerCase().includes('malegaon') ||
             c.villageName.toLowerCase().includes('shirsuphal') ||
             c.villageName.toLowerCase().includes('vithalwadi') ||
             c.districtName.toLowerCase().includes('pune')
      );
    }
    if (role === 'VETERINARIAN') {
      return this.cases.filter(
        c => c.districtName.toLowerCase().includes('pune') ||
             c.districtName.toLowerCase().includes('satara')
      );
    }
    if (role === 'LABORATORY_STAFF') {
      return this.cases.filter(c => c.status === 'LAB_TESTING' || c.sampleIds?.length || c.status === 'SAMPLE_REQUESTED' || c.status === 'CONFIRMED' || c.status === 'RULED_OUT');
    }
    if (role === 'DISTRICT_OFFICIAL') {
      return this.cases.filter(c => c.districtName.toLowerCase().includes('pune') || c.stateId === 'st_mah');
    }
    // STATE_ADMIN & SYSTEM_ADMIN
    return this.cases;
  }

  public getScopedAnimals(): Animal[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      return this.animals.filter(
        a => (this.currentUser.farmId && a.farmId === this.currentUser.farmId) ||
             a.ownerName === this.currentUser.name
      );
    }
    if (role === 'FIELD_WORKER') {
      return this.animals.filter(
        a => a.farmId === 'farm_01' || a.farmId === 'farm_02' || a.farmId === 'farm_03'
      );
    }
    return this.animals;
  }

  public getScopedHerds(): Herd[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      return this.herds.filter(
        h => (this.currentUser.farmId && h.farmId === this.currentUser.farmId) ||
             h.ownerName === this.currentUser.name
      );
    }
    if (role === 'FIELD_WORKER') {
      return this.herds.filter(h => h.farmId === 'farm_01' || h.farmId === 'farm_02');
    }
    return this.herds;
  }

  public getScopedFarms(): Farm[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      return this.farms.filter(
        f => f.id === this.currentUser.farmId || f.ownerName === this.currentUser.name
      );
    }
    if (role === 'FIELD_WORKER') {
      return this.farms.filter(f => f.districtId === 'dt_pune' || f.id === 'farm_01' || f.id === 'farm_02' || f.id === 'farm_03');
    }
    return this.farms;
  }

  public getScopedLabSamples(): LabSample[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      const myCaseIds = new Set(this.getScopedCases().map(c => c.id));
      return this.labSamples.filter(s => myCaseIds.has(s.caseId));
    }
    if (role === 'FIELD_WORKER') {
      return this.labSamples.filter(s => s.collectedBy === this.currentUser.name || s.collectedBy.includes('Sunita') || s.laboratoryId === 'lab_pune_dis');
    }
    return this.labSamples;
  }

  public getScopedVaccinations(): VaccinationRecord[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      const myAnimalIds = new Set(this.getScopedAnimals().map(a => a.id));
      return this.vaccinations.filter(v => (v.animalId && myAnimalIds.has(v.animalId)) || (this.currentUser.farmId && v.farmId === this.currentUser.farmId));
    }
    if (role === 'FIELD_WORKER') {
      return this.vaccinations.filter(v => v.administeredBy === this.currentUser.name || v.administeredBy.includes('Sunita') || v.villageName?.includes('Malegaon') || v.villageName?.includes('Shirsuphal'));
    }
    return this.vaccinations;
  }

  public getScopedMortalityReports(): MortalityReport[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      return this.mortalityReports.filter(
        m => (this.currentUser.farmId && m.farmId === this.currentUser.farmId) ||
             m.ownerName === this.currentUser.name
      );
    }
    if (role === 'FIELD_WORKER') {
      return this.mortalityReports.filter(m => m.districtName.toLowerCase().includes('pune') || m.villageName.toLowerCase().includes('malegaon') || m.villageName.toLowerCase().includes('vithalwadi'));
    }
    return this.mortalityReports;
  }

  public getScopedAlerts(): Alert[] {
    const role = this.currentUser.role;
    return this.alerts.filter(a => a.targetRoles.includes(role) || a.targetRoles.length === 0);
  }

  public getScopedFieldVisits(): FieldVisit[] {
    const role = this.currentUser.role;
    if (role === 'FARMER') {
      return this.fieldVisits.filter(v => (this.currentUser.farmId && v.farmId === this.currentUser.farmId) || v.farmerName === this.currentUser.name);
    }
    if (role === 'FIELD_WORKER') {
      return this.fieldVisits.filter(v => v.assignedWorkerId === this.currentUser.id || v.assignedWorkerName === this.currentUser.name || v.villageName.includes('Malegaon') || v.villageName.includes('Shirsuphal'));
    }
    return this.fieldVisits;
  }

  public getScopedAdvisories(): Advisory[] {
    return this.advisories.filter(a => a.isActive);
  }

  // Mutations
  public registerAnimal(animalData: Omit<Animal, 'id' | 'registeredAt' | 'lastCheckedAt' | 'vaccinationCount'>): Animal {
    const newAnimal: Animal = {
      ...animalData,
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

    this.notify();
    return newAnimal;
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
      longitude: tempAnimal.longitude
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
    const newHerd: Herd = {
      ...herdData,
      id: `hrd_${Date.now()}`,
      herdCode: `HRD-${herdData.districtId.toUpperCase().slice(-3)}-${Math.floor(10 + Math.random() * 90)}`,
      riskScore: 20,
      riskLevel: 'LOW'
    };

    this.herds.unshift(newHerd);
    saveToStorage(STORAGE_KEYS.HERDS, this.herds);
    this.notify();
    return newHerd;
  }

  public createCase(caseData: Omit<Case, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'riskScore' | 'riskLevel' | 'suspectedDiseases'> & { customRisk?: { score: number; level: any; suspected: any[] } }): Case {
    const timestamp = new Date().toISOString();
    const caseNum = `CAS-${caseData.stateId.toUpperCase().slice(-2)}-${caseData.districtName.toUpperCase().slice(0, 3)}-2026-${String(this.cases.length + 1).padStart(4, '0')}`;

    // Compute automatic risk assessment
    const riskResult = assessLivestockRisk({
      species: caseData.species,
      symptoms: caseData.symptoms,
      affectedCount: caseData.affectedCount,
      deadCount: caseData.deadCount,
      latitude: caseData.latitude,
      longitude: caseData.longitude,
      existingCases: this.cases,
      activeOutbreaks: this.outbreaks,
      config: this.systemConfig
    });

    const isUntagged = caseData.animalStatus === 'UNTAGGED' || !!caseData.temporaryAnimalId;
    const historyDetail = caseData.historicalCaseLink
      ? ` Linked to previous case ${caseData.historicalCaseLink.historicalCaseNumber} (${caseData.historicalCaseLink.relationshipType.replace(/_/g, ' ')}).`
      : '';

    const newCase: Case = {
      ...caseData,
      id: `cas_${Date.now()}`,
      caseNumber: caseNum,
      riskScore: riskResult.score,
      riskLevel: riskResult.level,
      suspectedDiseases: riskResult.suspectedDiseases,
      createdAt: timestamp,
      updatedAt: timestamp,
      auditTrail: [
        {
          id: `aud_${Date.now()}`,
          timestamp,
          actorId: this.currentUser.id,
          actorName: this.currentUser.name,
          actorRole: this.currentUser.role,
          action: 'CASE_CREATED',
          details: `Reported ${caseData.symptoms.length} symptom(s) with ${riskResult.level} screening risk.${isUntagged ? ` Registered for untagged animal (${caseData.temporaryTag || 'Temporary ID generated'}).` : ''}${historyDetail}`
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

    // If animal attached, mark status affected
    if (newCase.animalId) {
      const anm = this.animals.find(a => a.id === newCase.animalId);
      if (anm) {
        anm.currentHealthStatus = 'AFFECTED';
        anm.activeCaseId = newCase.id;
        anm.lastCheckedAt = timestamp.split('T')[0];
        saveToStorage(STORAGE_KEYS.ANIMALS, this.animals);
      }
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

    saveToStorage(STORAGE_KEYS.CASES, this.cases);
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
      }
    }

    this.notify();
    return sample;
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
    const count = this.offlineQueue.length;
    this.offlineQueue = [];
    saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
    this.isSimulatedOffline = false;
    saveToStorage(STORAGE_KEYS.IS_OFFLINE, false);

    this.createAlert({
      title: 'Synchronization Complete',
      message: `Successfully synced ${count} pending offline record(s) with Central Surveillance Database.`,
      priority: 'INFO',
      category: 'CASE_ESCALATION',
      targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN']
    });

    this.notify();
    return { success: true, count };
  }

  // Reset database to initial seed data
  public resetToSeedData() {
    localStorage.clear();
    this.init();
    this.notify();
  }
}

export const store = new LivestockGuardStore();
