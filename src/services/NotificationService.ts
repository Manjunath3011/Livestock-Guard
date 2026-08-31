import {
  Alert,
  AlertPriority,
  AlertCategory,
  NotificationType,
  User,
  Role,
  Case,
  Outbreak,
  VaccinationRecord,
  LabSample,
  MortalityReport,
  Animal
} from '../types';
import { store } from './store';

// Priority numerical weighting for rigorous sorting: CRITICAL (1) > HIGH (2) > MEDIUM (3) > LOW (4) > INFO (5)
const PRIORITY_WEIGHTS: Record<AlertPriority, number> = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  INFO: 5
};

export interface NotificationFilterOptions {
  priority?: AlertPriority | 'ALL';
  category?: AlertCategory | 'ALL';
  unreadOnly?: boolean;
  searchQuery?: string;
  includeDemo?: boolean;
}

class NotificationService {
  private demoAlerts: Alert[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadDemoAlerts();
  }

  private loadDemoAlerts() {
    try {
      const stored = localStorage.getItem('lg_demo_alerts');
      if (stored) {
        this.demoAlerts = JSON.parse(stored) || [];
      }
    } catch {
      this.demoAlerts = [];
    }
  }

  private saveDemoAlerts() {
    try {
      localStorage.setItem('lg_demo_alerts', JSON.stringify(this.demoAlerts));
    } catch (e) {
      console.warn('Failed to save demo alerts', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.error('Error in NotificationService listener', err);
      }
    });
  }

  // ==========================================
  // LOCATION RELEVANCE COMPUTATION
  // ==========================================
  public evaluateLocationMatch(
    user: User | null | undefined,
    alertLocation: { stateId?: string; stateName?: string; districtId?: string; districtName?: string; blockId?: string; villageName?: string }
  ): { isMatch: boolean; relevanceLevel: 'SAME_VILLAGE' | 'SAME_DISTRICT' | 'SAME_STATE' | 'UNMATCHED'; label: string } {
    if (!user) {
      return { isMatch: true, relevanceLevel: 'SAME_DISTRICT', label: 'General Region' };
    }

    const userVillages = [user.village, (user as any).villageName].filter(Boolean).map(v => v!.toLowerCase().trim());
    const userDistricts = [user.districtId, (user as any).districtName].filter(Boolean).map(d => d!.toLowerCase().trim());
    const userStates = [user.stateId, (user as any).stateName].filter(Boolean).map(s => s!.toLowerCase().trim());

    const alertVillage = alertLocation.villageName?.toLowerCase().trim();
    const alertDistrict = (alertLocation.districtName || alertLocation.districtId)?.toLowerCase().trim();
    const alertState = (alertLocation.stateName || alertLocation.stateId)?.toLowerCase().trim();

    // 1. Same village match
    if (alertVillage && userVillages.some(uv => alertVillage.includes(uv) || uv.includes(alertVillage))) {
      return {
        isMatch: true,
        relevanceLevel: 'SAME_VILLAGE',
        label: `Immediate Vicinity (${alertLocation.villageName})`
      };
    }

    // 2. Same district match
    if (alertDistrict && userDistricts.some(ud => alertDistrict.includes(ud) || ud.includes(alertDistrict))) {
      return {
        isMatch: true,
        relevanceLevel: 'SAME_DISTRICT',
        label: `Within District Buffer (${alertLocation.districtName || 'Local District'})`
      };
    }

    // 3. Same state match
    if (alertState && userStates.some(us => alertState.includes(us) || us.includes(alertState))) {
      return {
        isMatch: true,
        relevanceLevel: 'SAME_STATE',
        label: `Statewide Jurisdiction (${alertLocation.stateName || 'State'})`
      };
    }

    // If alert has no location requirements, it's generally broadcast
    if (!alertVillage && !alertDistrict && !alertState) {
      return {
        isMatch: true,
        relevanceLevel: 'SAME_DISTRICT',
        label: 'National / General Advisory'
      };
    }

    return {
      isMatch: false,
      relevanceLevel: 'UNMATCHED',
      label: 'Distant Location'
    };
  }

  // ==========================================
  // ROLE & LOCATION AWARE FILTERING ENGINE
  // ==========================================
  public getScopedNotifications(
    user: User | null | undefined,
    options?: NotificationFilterOptions
  ): Alert[] {
    if (!user) return [];

    const storeAlerts = store.getAlerts() || [];
    const allAlerts = [...this.demoAlerts, ...storeAlerts];

    // Remove duplicates by ID
    const uniqueMap = new Map<string, Alert>();
    allAlerts.forEach(a => {
      if (a && a.id && !uniqueMap.has(a.id)) {
        uniqueMap.set(a.id, a);
      }
    });

    const dedupedAlerts = Array.from(uniqueMap.values());
    const role = user.role;

    // Filter strictly by Role and Location Scope
    const filtered = dedupedAlerts.filter(alert => {
      if (!alert) return false;

      // 1. Role clearance check
      if (alert.targetRoles && alert.targetRoles.length > 0) {
        if (!alert.targetRoles.includes(role)) {
          return false;
        }
      }

      // 2. Private User ownership check (Farmer privacy isolation)
      if (alert.userId && alert.userId !== user.id) {
        return false;
      }

      // 3. Role-specific boundary rules
      if (role === 'FARMER') {
        // Farmers must NEVER receive internal administrative notices or ML pipeline errors
        if (alert.category === 'SYSTEM_NOTICE' || alert.type === 'SYSTEM_NOTICE') {
          return false;
        }

        // If alert is tied to a specific farm or animal, verify ownership
        if (alert.farmId && user.farmId && alert.farmId !== user.farmId) {
          // Allow if it is an outbreak in the same location
          if (alert.category !== 'OUTBREAK' && alert.category !== 'NEARBY_ACTIVITY') {
            return false;
          }
        }

        // Location boundary for Farmers: must match same village, district, or be a global broadcast
        const locationCheck = this.evaluateLocationMatch(user, {
          districtName: alert.districtName,
          districtId: alert.districtId,
          villageName: alert.villageName,
          stateId: alert.stateId,
          stateName: alert.stateName
        });

        // If location is specified and does not match farmer's area, skip it
        if ((alert.districtName || alert.villageName) && !locationCheck.isMatch) {
          return false;
        }
      }

      if (role === 'FIELD_WORKER') {
        // Field workers focus on local operational zones
        if (alert.category === 'SYSTEM_NOTICE') return false;
      }

      if (role === 'LABORATORY_STAFF' || role === 'DIAGNOSTIC_LAB') {
        // Lab staff receives sample, testing, and lab confirmation alerts
        const allowedCategories: AlertCategory[] = [
          'LAB_CONFIRMATION',
          'HIGH_RISK',
          'OUTBREAK',
          'MORTALITY_CLUSTER',
          'DEMO_SIMULATION'
        ];
        if (alert.category && !allowedCategories.includes(alert.category) && !alert.targetRoles?.includes(role)) {
          return false;
        }
      }

      if (role === 'DISTRICT_OFFICIAL') {
        // District officials monitor their district
        if (alert.districtName && user.districtId) {
          const locationCheck = this.evaluateLocationMatch(user, {
            districtName: alert.districtName,
            districtId: alert.districtId
          });
          if (!locationCheck.isMatch && alert.priority !== 'CRITICAL') {
            return false;
          }
        }
      }

      // 4. Optional UI Filters
      if (options?.priority && options.priority !== 'ALL') {
        if (alert.priority !== options.priority) return false;
      }

      if (options?.category && options.category !== 'ALL') {
        if (alert.category !== options.category) return false;
      }

      if (options?.unreadOnly && alert.isRead) {
        return false;
      }

      if (options?.searchQuery && options.searchQuery.trim() !== '') {
        const q = options.searchQuery.toLowerCase();
        const matchesTitle = alert.title?.toLowerCase().includes(q);
        const matchesMsg = alert.message?.toLowerCase().includes(q);
        const matchesDisease = alert.diseaseName?.toLowerCase().includes(q);
        const matchesVillage = alert.villageName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesDisease && !matchesVillage) {
          return false;
        }
      }

      return true;
    });

    // Sort: 1. Priority (CRITICAL > HIGH > MEDIUM > LOW > INFO), 2. Timestamp (Newest first)
    return filtered.sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a.priority] || 4;
      const weightB = PRIORITY_WEIGHTS[b.priority] || 4;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // Unread badge count helper
  public getUnreadCount(user: User | null | undefined): number {
    if (!user) return 0;
    const scoped = this.getScopedNotifications(user);
    return (scoped || []).filter(a => !a.isRead).length;
  }

  // Critical unread count helper (for pulsing attention)
  public getCriticalCount(user: User | null | undefined): number {
    if (!user) return 0;
    const scoped = this.getScopedNotifications(user);
    return (scoped || []).filter(a => !a.isRead && a.priority === 'CRITICAL').length;
  }

  // ==========================================
  // ACTIONS & MUTATIONS
  // ==========================================
  public markAsRead(alertId: string) {
    // Check in demo alerts first
    const demo = this.demoAlerts.find(a => a.id === alertId);
    if (demo) {
      demo.isRead = true;
      this.saveDemoAlerts();
      return;
    }
    // Check in store alerts
    store.markAlertAsRead(alertId);
    this.notify();
  }

  public markAllAsRead(user?: User) {
    this.demoAlerts.forEach(a => (a.isRead = true));
    this.saveDemoAlerts();
    store.markAllAlertsRead();
    this.notify();
  }

  public dismissAlert(alertId: string) {
    this.demoAlerts = this.demoAlerts.filter(a => a.id !== alertId);
    this.saveDemoAlerts();
    this.notify();
  }

  // ==========================================
  // SAFE DEMO ALERT SIMULATION GENERATOR
  // ==========================================
  public triggerDemoAlertScenario(scenarioType: 'OUTBREAK' | 'HIGH_RISK' | 'ANIMAL_HEALTH' | 'VACCINATION' | 'CASE_UPDATE' | 'NEARBY_ACTIVITY' | 'LAB_CONFIRM' | 'ML_SYSTEM', user: User): Alert {
    const timestamp = new Date().toISOString();
    const id = `demo_alt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let newDemoAlert: Alert;

    switch (scenarioType) {
      case 'OUTBREAK':
        newDemoAlert = {
          id,
          title: '🚨 DEMO ALERT: FMD Outbreak Declared in Immediate Vicinity',
          message: 'Active Foot-and-Mouth Disease (FMD) cluster detected in nearby village. 5 km emergency containment perimeter enforced.',
          type: 'CRITICAL_OUTBREAK',
          priority: 'CRITICAL',
          category: 'OUTBREAK',
          targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL', 'STATE_ADMIN', 'SYSTEM_ADMIN'],
          diseaseName: 'Foot-and-Mouth Disease (FMD)',
          diseaseId: 'dis_fmd',
          districtName: user.districtId ? 'Pune' : 'Local District',
          villageName: user.village || 'Malegaon Budruk',
          locationRelevance: 'Immediate Vicinity — Same Block',
          distanceKm: 3.2,
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'REPORT_ANIMAL',
          actionLabel: 'Report Sick Animal',
          actionUrl: 'report_case',
          recommendedActions: [
            'Quarantine all newly arrived animals in a separate enclosure immediately.',
            'Disinfect farm entrance with 4% sodium carbonate solution or lime powder.',
            'Report any blister/vesicle formation on hooves or mouth to toll-free 1800-419-VET.'
          ],
          safetyGuidance: [
            'Keep sick animals isolated in a dry, ventilated shed.',
            'Provide soft green fodder and lukewarm water with electolytes.',
            'Do not allow outside traders or shared grazing during the quarantine period.'
          ],
          veterinaryUrgency: 'EMERGENCY'
        };
        break;

      case 'HIGH_RISK':
        newDemoAlert = {
          id,
          title: '⚠️ DEMO ALERT: High Risk Anthrax / Hemorrhagic Septicemia Warning',
          message: 'Elevated mortality signals and sudden deaths reported in adjacent district. High vigilance advisory issued.',
          type: 'HIGH_RISK',
          priority: 'HIGH',
          category: 'HIGH_RISK',
          targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL'],
          diseaseName: 'Anthrax / Hemorrhagic Septicemia',
          districtName: user.districtId ? 'Pune' : 'Local District',
          villageName: user.village || 'Shirsuphal',
          locationRelevance: 'Adjacent Taluka — 8 km Buffer',
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'CONTACT_VET',
          actionLabel: 'Contact Local Veterinarian',
          recommendedActions: [
            'Inspect herd twice daily for acute high fever or sudden dullness.',
            'Ensure ring immunization status is up to date for all adult bovines.',
            'NEVER cut open or skin carcasses of animals that die suddenly with bleeding.'
          ],
          safetyGuidance: [
            'Early screening advisory — confirmation by a qualified veterinarian or diagnostic laboratory is required.'
          ],
          veterinaryUrgency: 'HIGH'
        };
        break;

      case 'ANIMAL_HEALTH':
        newDemoAlert = {
          id,
          title: '🐄 DEMO ALERT: Animal Health Report Requires Attention',
          message: 'Your animal health screening for Cow Gauri (Tag IN-MH-10029381) has been updated by Field Vet Dr. Anand Deshmukh.',
          type: 'ANIMAL_HEALTH',
          priority: 'HIGH',
          category: 'ANIMAL_HEALTH',
          targetRoles: ['FARMER', 'VETERINARIAN', 'FIELD_WORKER'],
          animalTag: 'IN-MH-10029381 (Gauri)',
          animalId: 'anm_cow_101',
          caseId: 'cas_2026_001',
          caseNumber: 'CAS-MH-PUN-2026-0089',
          farmId: user.farmId || 'farm_01',
          diseaseName: 'Foot-and-Mouth Disease (FMD)',
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'VIEW_CASE',
          actionLabel: 'View Case Details',
          recommendedActions: [
            'Apply boro-glycerin paste to oral lesions 3 times daily as prescribed.',
            'Keep animal hooves clean and dry using potassium permanganate wash.',
            'Provide fresh green chopped grass and monitor milk yield.'
          ],
          safetyGuidance: [
            'Early screening result — confirmation by a qualified veterinarian or laboratory may be required.'
          ],
          veterinaryUrgency: 'ELEVATED'
        };
        break;

      case 'VACCINATION':
        newDemoAlert = {
          id,
          title: '💉 DEMO ALERT: Vaccination Booster Due Reminder',
          message: 'FMD annual ring booster for Cow Kapila (Tag IN-MH-30045101) is due in 3 days. Free government camp available.',
          type: 'VACCINATION_REMINDER',
          priority: 'MEDIUM',
          category: 'VACCINATION_OVERDUE',
          targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN'],
          animalTag: 'IN-MH-30045101 (Kapila)',
          diseaseName: 'Foot-and-Mouth Disease (FMD)',
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'VIEW_ANIMAL',
          actionLabel: 'View Animal Profile',
          recommendedActions: [
            'Bring animal to village Primary Veterinary Center on Wednesday morning.',
            'Ensure animal has no fever prior to vaccine administration.',
            'Collect updated digital vaccination certificate from field para-vet.'
          ]
        };
        break;

      case 'CASE_UPDATE':
        newDemoAlert = {
          id,
          title: '📋 DEMO ALERT: Case Status Updated to Under Review',
          message: 'Case CAS-MH-PUN-2026-0089 has been assigned to Veterinary Mobile Unit. Field inspection in progress.',
          type: 'CASE_STATUS_UPDATE',
          priority: 'MEDIUM',
          category: 'CASE_STATUS',
          targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN'],
          caseId: 'cas_2026_001',
          caseNumber: 'CAS-MH-PUN-2026-0089',
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'VIEW_CASE',
          actionLabel: 'Track Case Status'
        };
        break;

      case 'NEARBY_ACTIVITY':
        newDemoAlert = {
          id,
          title: '📍 DEMO ALERT: Unusual Disease Activity Detected Nearby',
          message: 'Multiple reports of salivation and lameness detected within 6 km of your area. Increased surveillance active.',
          type: 'NEARBY_ACTIVITY',
          priority: 'MEDIUM',
          category: 'NEARBY_ACTIVITY',
          targetRoles: ['FARMER', 'FIELD_WORKER', 'VETERINARIAN', 'DISTRICT_OFFICIAL'],
          districtName: 'Pune',
          villageName: 'Baramati Rural',
          locationRelevance: 'Surrounding Villages (6 km Radius)',
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'REPORT_ANIMAL',
          actionLabel: 'Report Unusual Symptoms',
          recommendedActions: [
            'Check animals daily during milking and feeding.',
            'Report any sudden decrease in milk or oral blisters immediately.'
          ],
          safetyGuidance: [
            'Note: This is early surveillance clustering, not a confirmed outbreak declaration.'
          ]
        };
        break;

      case 'LAB_CONFIRM':
        newDemoAlert = {
          id,
          title: '🔬 DEMO ALERT: RT-PCR Diagnostic Test Confirmation',
          message: 'Diagnostic sample LAB-CAT-2026-1049 returned POSITIVE for Lumpy Skin Disease (Capripoxvirus).',
          type: 'LAB_UPDATE',
          priority: 'HIGH',
          category: 'LAB_CONFIRMATION',
          targetRoles: ['VETERINARIAN', 'LABORATORY_STAFF', 'DIAGNOSTIC_LAB', 'DISTRICT_OFFICIAL', 'STATE_ADMIN'],
          diseaseName: 'Lumpy Skin Disease (LSD)',
          sampleCode: 'LAB-CAT-2026-1049',
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'VIEW_LAB',
          actionLabel: 'View Lab Dossier',
          recommendedActions: [
            'Notify District Animal Husbandry Officer for mandatory containment order.',
            'Initiate 5 km vector suppression and ring vaccination.'
          ]
        };
        break;

      case 'ML_SYSTEM':
      default:
        newDemoAlert = {
          id,
          title: '🤖 DEMO ALERT: Hybrid Decision Engine Surveillance Health Check',
          message: 'Multi-signal Bayesian risk pipeline processed 148 field events. Precision metrics: 96.4% confidence calibration.',
          type: 'SYSTEM_NOTICE',
          priority: 'INFO',
          category: 'SYSTEM_NOTICE',
          targetRoles: ['SYSTEM_ADMIN', 'STATE_ADMIN'],
          isDemo: true,
          isRead: false,
          createdAt: timestamp,
          actionType: 'VIEW_DETAILS',
          actionLabel: 'View System Telemetry'
        };
        break;
    }

    this.demoAlerts.unshift(newDemoAlert);
    this.saveDemoAlerts();
    return newDemoAlert;
  }

  public populateFullDemoSuite(user: User) {
    const scenarios: Array<'OUTBREAK' | 'HIGH_RISK' | 'ANIMAL_HEALTH' | 'VACCINATION' | 'CASE_UPDATE' | 'NEARBY_ACTIVITY' | 'LAB_CONFIRM'> = [
      'OUTBREAK',
      'HIGH_RISK',
      'ANIMAL_HEALTH',
      'VACCINATION',
      'CASE_UPDATE',
      'NEARBY_ACTIVITY'
    ];

    if (user.role === 'VETERINARIAN' || user.role === 'LABORATORY_STAFF' || user.role === 'STATE_ADMIN' || user.role === 'SYSTEM_ADMIN') {
      scenarios.push('LAB_CONFIRM');
    }

    scenarios.forEach(sc => {
      this.triggerDemoAlertScenario(sc, user);
    });
  }

  public clearAllDemoAlerts() {
    this.demoAlerts = [];
    this.saveDemoAlerts();
  }
}

export const notificationService = new NotificationService();
