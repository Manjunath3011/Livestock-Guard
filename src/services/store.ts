import {
  User,
  Role,
  Farm,
  Animal,
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
  TestResult
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
  SEED_WEATHER
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
  IS_OFFLINE: 'lg_is_offline_simulated'
};

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
  private currentLanguage: LanguageCode = 'en';
  private isSimulatedOffline: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    this.users = loadFromStorage(STORAGE_KEYS.USERS, SEED_USERS);
    this.farms = loadFromStorage(STORAGE_KEYS.FARMS, SEED_FARMS);
    this.herds = loadFromStorage(STORAGE_KEYS.HERDS, SEED_HERDS);
    this.animals = loadFromStorage(STORAGE_KEYS.ANIMALS, SEED_ANIMALS);
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
    this.currentLanguage = loadFromStorage(STORAGE_KEYS.LANGUAGE, 'en');
    this.isSimulatedOffline = loadFromStorage(STORAGE_KEYS.IS_OFFLINE, false);

    const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUserId) {
      const u = this.users.find(x => x.id === savedUserId);
      if (u) this.currentUser = u;
    } else {
      this.currentUser = this.users[0] || SEED_USERS[0];
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
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

  public switchRole(role: Role) {
    const user = this.users.find(u => u.role === role);
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
          details: `Reported ${caseData.symptoms.length} symptom(s) with ${riskResult.level} screening risk.`
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
