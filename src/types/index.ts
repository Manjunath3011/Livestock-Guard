import {
  CredibilityTier,
  CredibilityStatus,
  VerificationState,
  VerificationEvidenceItem,
  CredibilityAuditRecord,
  SourceType,
  ReportCredibilityFeatureBreakdown,
  ReportMLFeatureVector
} from './credibility';

export * from './credibility';

export type Role =
  | 'FARMER'
  | 'FIELD_WORKER'
  | 'VETERINARIAN'
  | 'LABORATORY_STAFF'
  | 'DIAGNOSTIC_LAB'
  | 'DISTRICT_OFFICIAL'
  | 'STATE_ADMIN'
  | 'SYSTEM_ADMIN';

export type Species =
  | 'Cattle'
  | 'Buffalo'
  | 'Goat'
  | 'Sheep'
  | 'Pig'
  | 'Poultry'
  | 'Horse'
  | 'Camel'
  | 'Other';

export type HealthStatus =
  | 'HEALTHY'
  | 'UNDER_OBSERVATION'
  | 'AFFECTED'
  | 'RECOVERED'
  | 'DECEASED';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type CaseStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'VET_VISIT_REQUIRED'
  | 'SAMPLE_REQUESTED'
  | 'SAMPLE_COLLECTED'
  | 'LAB_TESTING'
  | 'CONFIRMED'
  | 'RULED_OUT'
  | 'CONTAINMENT'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED'
  | 'MONITORING';

export * from './credibility';

export type SampleStatus =
  | 'REQUESTED'
  | 'COLLECTED'
  | 'IN_TRANSIT'
  | 'RECEIVED_AT_LAB'
  | 'TESTING_IN_PROGRESS'
  | 'RESULT_AVAILABLE'
  | 'REJECTED';

export type TestResult = 'PENDING' | 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';

export type OutbreakStatus =
  | 'ACTIVE'
  | 'SUSPECTED'
  | 'INVESTIGATING'
  | 'CONFIRMED'
  | 'CONTAINMENT_ZONE'
  | 'RESOLVED';

export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type NotificationType =
  | 'CRITICAL_OUTBREAK'
  | 'HIGH_RISK'
  | 'ANIMAL_HEALTH'
  | 'VACCINATION_REMINDER'
  | 'CASE_STATUS_UPDATE'
  | 'NEARBY_ACTIVITY'
  | 'LAB_UPDATE'
  | 'FIELD_TASK'
  | 'SYSTEM_NOTICE'
  | 'DEMO_ALERT';

export type AlertCategory =
  | 'OUTBREAK'
  | 'HIGH_RISK'
  | 'ANIMAL_HEALTH'
  | 'MORTALITY_CLUSTER'
  | 'VACCINATION_OVERDUE'
  | 'LAB_CONFIRMATION'
  | 'CASE_ESCALATION'
  | 'CASE_STATUS'
  | 'NEARBY_ACTIVITY'
  | 'WEATHER_WARNING'
  | 'SYSTEM_NOTICE'
  | 'DEMO_SIMULATION';

export type LanguageCode = 'en' | 'hi' | 'kn' | 'te' | 'mr';

export type AccountStatus =
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role; // Active role
  requestedRole?: Role;
  accountStatus?: AccountStatus;
  statusReason?: string;
  registrationRequestId?: string;
  avatarUrl?: string;
  stateId: string;
  districtId: string;
  blockId?: string;
  villageId?: string;
  village?: string;
  farmId?: string;
  farmName?: string;
  assignedLaboratoryId?: string;
  licenseNumber?: string;
  designation?: string;
  department?: string;
  employeeId?: string;
  organizationName?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  preferredLanguage: LanguageCode;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerificationDocument {
  id: string;
  userId?: string;
  requestId?: string;
  documentType: 'GOV_ID' | 'VET_LICENSE' | 'LAB_ACCREDITATION' | 'OFFICE_ID' | 'APPOINTMENT_LETTER' | 'CERTIFICATE';
  documentName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  secureStorageReference: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: string;
  reviewedAt?: string;
  retentionExpiry: string;
  previewUrl?: string;
}

export interface RegistrationRequest {
  id: string; // e.g. LG-REG-849201
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  requestedRole: Role;
  accountTypeLabel: string;
  status: AccountStatus;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  blockName?: string;
  villageName?: string;
  preferredLanguage: LanguageCode;
  
  // Specific role schemas
  farmDetails?: {
    farmName?: string;
    species: Species[];
    animalCount: number;
    locationAddress?: string;
  };
  fieldWorkerDetails?: {
    organization: string;
    employeeId?: string;
    yearsOfExperience?: number;
    areaOfOperation?: string;
  };
  vetDetails?: {
    organization: string;
    qualification: string;
    regNumber: string;
    councilAuthority: string;
    regValidityDate?: string;
  };
  labDetails?: {
    laboratoryName: string;
    laboratoryType: string;
    accreditationNumber?: string;
    organization: string;
    address: string;
  };
  officialDetails?: {
    department: string;
    designation: string;
    employeeId: string;
    officeAddress?: string;
    directorate?: string;
  };

  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  documents: VerificationDocument[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewNotes?: string;
}

export interface IdentityVerification {
  id: string;
  userId: string;
  verificationType: 'MOBILE_OTP' | 'GOV_ID' | 'OFFICIAL_EMAIL';
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  verifiedAt?: string;
  verifiedBy?: string;
  verificationReference: string;
  createdAt: string;
}

export interface ProfessionalCredential {
  id: string;
  userId: string;
  credentialType: 'VET_REGISTRATION' | 'LAB_ACCREDITATION' | 'PARA_VET_CERT' | 'OFFICIAL_ID';
  registrationNumber: string;
  issuingAuthority: string;
  expiryDate?: string;
  verificationStatus: AccountStatus;
  documentReference?: string;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  organizationName: string;
  designation: string;
  employeeId: string;
  verificationStatus: AccountStatus;
}

export interface RegistrationAuditLog {
  id: string;
  userId: string;
  action: 'REGISTRATION_SUBMITTED' | 'PHONE_OTP_VERIFIED' | 'DOCUMENT_UPLOADED' | 'STATUS_CHANGED' | 'ROLE_APPROVED' | 'ROLE_REJECTED' | 'INFO_REQUESTED';
  targetType: string;
  targetId: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  metadata?: Record<string, any>;
}

export interface LocationHierarchy {
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  blockId: string;
  blockName: string;
  villageId: string;
  villageName: string;
  latitude: number;
  longitude: number;
}

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  phone: string;
  stateId: string;
  stateName?: string;
  districtId: string;
  districtName?: string;
  blockId: string;
  blockName?: string;
  villageId: string;
  villageName?: string;
  pincode?: string;
  address: string;
  latitude: number;
  longitude: number;
  totalAnimals: number;
  speciesPresent: Species[];
  biosecurityLevel: 'BASIC' | 'STANDARD' | 'ADVANCED';
}

export type AnimalPhotoType =
  | 'ANIMAL_OVERVIEW'
  | 'ANIMAL_ID'
  | 'SYMPTOM'
  | 'LESION'
  | 'OTHER';

export interface AnimalPhoto {
  id: string;
  animalId: string;
  caseId?: string;
  photoType: AnimalPhotoType;
  storageReference: string; // URL, data URL or storage key
  thumbnailReference?: string;
  capturedAt: string;
  uploadedAt?: string;
  capturedOffline?: boolean;
  offlineQueued?: boolean;
  uploadedBy: string;
  uploaderName?: string;
  uploaderRole?: Role;
  source?: 'FARMER' | 'FIELD_WORKER' | 'VET';
  label?: string;
  notes?: string;
  qualityStatus?: 'GOOD' | 'BLURRY_OR_DARK' | 'POOR';
  vetReviewStatus?: 'PENDING' | 'RELEVANT' | 'NOT_RELEVANT' | 'NEED_BETTER_PHOTO';
  vetNotes?: string;
  metadata?: {
    width?: number;
    height?: number;
    fileSize?: number;
    mimeType?: string;
    originalFileName?: string;
    gpsAvailable?: boolean;
    gpsAccuracy?: number;
  };
}

export interface Animal {
  id: string;
  tagNumber: string;
  name?: string;
  species: Species;
  breed: string;
  sex: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  ageYears: number;
  ownerId: string;
  ownerName: string;
  farmId: string;
  farmName: string;
  herdId?: string;
  herdName?: string;
  weightKg: number;
  pregnancyStatus: 'NOT_PREGNANT' | 'PREGNANT' | 'LACTATING' | 'NOT_APPLICABLE';
  currentHealthStatus: HealthStatus;
  stateId: string;
  districtId: string;
  blockId: string;
  villageId: string;
  latitude: number;
  longitude: number;
  registeredAt: string;
  lastCheckedAt: string;
  vaccinationCount: number;
  activeCaseId?: string;
  lactationCount?: number;
  photos?: AnimalPhoto[];
}

export interface Herd {
  id: string;
  herdCode: string;
  name: string;
  ownerId: string;
  ownerName: string;
  farmId: string;
  species: Species;
  breed: string;
  stateId: string;
  districtId: string;
  villageId: string;
  totalAnimals: number;
  healthyCount: number;
  affectedCount: number;
  underObservationCount: number;
  recoveredCount: number;
  deathCount: number;
  vaccinationCoveragePct: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface Symptom {
  id: string;
  name: string;
  category: 'GENERAL' | 'RESPIRATORY' | 'DIGESTIVE' | 'ORAL_FOOT' | 'SKIN' | 'REPRODUCTIVE' | 'NEUROLOGICAL' | 'MORTALITY';
  description: string;
  severityScale: ('mild' | 'moderate' | 'severe')[];
  iconName: string;
}

export type HomeCareLevel =
  | 'SAFE_SUPPORTIVE'
  | 'LIMITED_SUPPORTIVE'
  | 'VETERINARY_ONLY'
  | 'EMERGENCY_ONLY'
  | 'SUPPORTIVE_AND_VET'
  | 'BASIC_SUPPORTIVE';

export interface SupportiveCareStep {
  order?: number;
  title: string;
  desc?: string;
  instruction?: string;
  icon?: string;
  safetyLevel?: string;
  targetSign?: string;
  category?: 'WATER' | 'FEED' | 'ENVIRONMENT' | 'SEPARATION' | 'HYGIENE' | 'MONITORING';
}

export interface DiseaseReference {
  sourceName: string;
  sourceUrl?: string;
  authority: string;
  lastReviewed: string;
}

export interface DiseaseVaccineLink {
  diseaseId: string;
  vaccineId: string;
  vaccineName: string;
  species: Species[];
  recommendedFor: string;
  preventionRole: string;
  routineOrOutbreak: 'ROUTINE' | 'OUTBREAK_RING' | 'BOTH';
  minimumAgeMonths: number;
  doseInformationReference: string;
  scheduleReference: string;
  boosterInformationReference: string;
  contraindicationsReference: string[];
  pregnancyNotes: string;
  outbreakNotes: string;
  geographicNotes: string;
  authorityReference: string;
  lastUpdated: string;
}

export interface FollowUpRecord {
  id: string;
  caseId: string;
  animalId?: string;
  animalTag?: string;
  recordedAt: string;
  timeframe: '24_HOURS' | '48_HOURS' | '7_DAYS' | 'CUSTOM';
  statusUpdate: 'IMPROVING' | 'SAME' | 'GETTING_WORSE' | 'CRITICAL' | 'DECEASED';
  notes?: string;
  escalationTriggered?: boolean;
  recordedBy: string;
}

export interface Disease {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  category: 'VIRAL' | 'BACTERIAL' | 'PARASITIC' | 'FUNGAL' | 'OTHER';
  causativeAgent: string;
  affectedSpecies: Species[];
  transmission: string;
  incubationDays: string;
  majorSymptoms: string[];
  additionalSymptoms: string[];
  riskFactors: string[];
  geographicRelevance: string;
  seasonalRelevance: string;
  severity: 'MODERATE' | 'HIGH' | 'CRITICAL';
  mortalityRateTypical: string;
  productivityImpact: string;
  zoonotic: boolean;
  notifiable: boolean;
  diagnosticMethods: string[];
  labTests: string[];
  prevention: string;
  vaccinationInfo: string;
  biosecurityRecommendations: string[];
  veterinaryGuidance: string;
  isolationPeriodDays: number;
  emergencyPriority: 'ROUTINE' | 'ELEVATED' | 'HIGH_EMERGENCY';

  // Practical decision support additions
  homeCareAllowed: boolean;
  homeCareLevel: HomeCareLevel;
  supportiveCare: string;
  supportiveCareSteps: SupportiveCareStep[];
  careWarnings: string[];
  thingsToAvoid: string[];
  emergencySigns: string[];
  veterinaryRequired: boolean;
  emergencyGuidance: string;
  vaccineAvailable: boolean;
  primaryVaccineId?: string;
  vaccineScheduleReference?: string;
  farmerFriendlyExplanation: string;
  references: DiseaseReference;
}

export interface DiseaseSymptomWeight {
  diseaseId: string;
  symptomId: string;
  importanceWeight: number; // 1 to 5
  typicality: 'CLASSIC' | 'COMMON' | 'OCCASIONAL' | 'RARE';
  species?: Species[];
}

export interface SymptomObservation {
  symptomId: string;
  symptomName: string;
  severity: 'mild' | 'moderate' | 'severe';
  onsetDate: string;
  notes?: string;
}

export interface SuspectedDiseaseMatch {
  diseaseId: string;
  diseaseName: string;
  scientificName: string;
  screeningScore: number; // 0 - 100
  confidenceLevel: 'LOW' | 'MODERATE' | 'HIGH';
  matchingSymptoms: string[];
  keyDifferentiators: string[];
  notifiable: boolean;
  zoonotic: boolean;

  // Rich Clinical Guidance Fields
  supportiveCareAvailable?: boolean;
  homeCareLevel?: HomeCareLevel;
  supportiveCareSummary?: string;
  supportiveCareSteps?: SupportiveCareStep[];
  careWarnings?: string[];
  thingsToAvoid?: string[];
  emergencySigns?: string[];
  vaccineAvailable?: boolean;
  vaccineId?: string;
  vaccineName?: string;
  vaccineSchedule?: string;
  vaccinationStatusForAnimal?: 'UP_TO_DATE' | 'DUE_SOON' | 'OVERDUE' | 'NO_RECORD';
  vaccineGuidanceNote?: string;
  veterinaryUrgency?: 'ROUTINE' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  laboratoryConfirmation?: boolean;
  farmerFriendlyExplanation?: string;
  references?: DiseaseReference;
}

export interface RecommendedAdvisory {
  category: 'MONITOR' | 'BIOSECURITY' | 'ISOLATION / MOVEMENT CONTROL' | 'VETERINARY REVIEW' | 'VACCINATION REVIEW' | 'SAMPLE COLLECTION' | 'LABORATORY REFERRAL' | 'OUTBREAK REPORTING';
  title: string;
  action: string;
  rationale: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetActor: 'FARMER' | 'VETERINARIAN' | 'FIELD_WORKER' | 'DISTRICT_OFFICIAL';
  timeframe: string;
}

export interface TemporaryAnimal {
  id: string;
  temporaryTag: string; // e.g. TEMP-COW-0024
  species: Species;
  breed: string;
  ageYears: number;
  ageStage?: 'CALF_KID_LAMB' | 'GROWER_HEIFER' | 'ADULT' | 'SENIOR';
  sex: 'MALE' | 'FEMALE';
  pregnancyStatus: 'NOT_PREGNANT' | 'PREGNANT' | 'LACTATING' | 'DRY' | 'NOT_APPLICABLE';
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  farmId: string;
  farmName: string;
  herdId?: string;
  herdName?: string;
  groupSize: 'INDIVIDUAL' | 'SMALL_GROUP' | 'HERD_FLOCK';
  stateId: string;
  districtId: string;
  blockId: string;
  villageId: string;
  villageName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  isFormallyRegistered?: boolean;
  permanentTagNumber?: string;
  permanentAnimalId?: string;
  photos?: AnimalPhoto[];
}

export interface HistoricalCaseLink {
  historicalCaseId: string;
  historicalCaseNumber: string;
  caseDate: string;
  species: Species;
  reportedSymptoms: string[];
  suspectedCondition?: string;
  status: CaseStatus;
  relationshipType: 'SAME_HERD_ONGOING_CLUSTER' | 'RECURRENCE' | 'SUSPECTED_SPREAD' | 'UNLINKED_NEW_ISSUE';
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  details: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  animalStatus?: 'REGISTERED' | 'UNTAGGED';
  animalId?: string;
  animalTag?: string;
  temporaryAnimalId?: string;
  temporaryTag?: string;
  untaggedAnimalProfile?: Partial<TemporaryAnimal>;
  historicalCaseId?: string;
  historicalCaseLink?: HistoricalCaseLink;
  herdId?: string;
  herdName?: string;
  species: Species;
  ownerName: string;
  ownerPhone: string;
  farmId: string;
  farmName: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  blockId: string;
  villageId: string;
  villageName: string;
  latitude: number;
  longitude: number;
  reporterId: string;
  reporterName: string;
  reporterRole: Role;
  symptoms: SymptomObservation[];
  naturalLanguageDescription?: string;
  symptomsStartDate: string;
  affectedCount: number;
  deadCount: number;
  suspectedDiseases: SuspectedDiseaseMatch[];
  riskScore: number;
  riskLevel: RiskLevel;
  status: CaseStatus;
  statusNotes?: string;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  sampleIds?: string[];
  treatmentIds?: string[];
  followUpRecords?: FollowUpRecord[];
  createdAt: string;
  updatedAt: string;
  auditTrail: AuditLogEntry[];
  hybridAssessment?: HybridRiskAssessment;
  mlPrediction?: MLPredictionResult;
  vaccinationStatusAtReport?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED';
  symptomDurationDays?: number;
  totalAnimalsInHerd?: number;
  previousHealthHistory?: string[];
  breed?: string;
  ageYears?: number;
  sex?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  previousDiseaseHistory?: string[];
  vaccinationStatus?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'UNKNOWN';
  confirmedDiseaseId?: string;
  suspectedDiseaseId?: string;
  assignedVeterinarianId?: string;
  weatherAtReport?: {
    temperatureC: number;
    humidityPct: number;
    rainfallMm: number;
    condition: string;
  };

  // Report Credibility & Verification Layer
  credibilityScore?: number; // 0 - 100
  credibilityTier?: CredibilityTier;
  credibilityStatus?: CredibilityStatus;
  credibilityReasons?: string[];
  anomalyFlags?: string[];
  verificationState?: VerificationState;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  verificationEvidence?: VerificationEvidenceItem[];
  credibilityAuditTrail?: CredibilityAuditRecord[];
  duplicateOfCaseId?: string;
  relatedCaseIds?: string[];
  eventCorrelationId?: string;
  sourceType?: SourceType;
  submittedAt?: string;
  deviceTimestamp?: string;
  gpsAccuracy?: number;
  locationMatchScore?: number;
  reporterTrustScore?: number;
  animalHistoryConsistencyScore?: number;
  credibilityFeatureBreakdown?: ReportCredibilityFeatureBreakdown;
  mlFeatureVector?: ReportMLFeatureVector;
  isCriticalUrgentVerification?: boolean;
  urgentReason?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  provisionalOfflineScore?: boolean;
  photos?: AnimalPhoto[];
  photoEvidenceAvailable?: boolean;
}

export interface Vaccine {
  id: string;
  name: string;
  diseasePrevented: string;
  targetSpecies: Species[];
  doseVolume: string;
  administrationRoute: string;
  schedule: string;
  boosterFrequencyMonths: number;
  storageRequirement: string;
  manufacturer: string;
}

export interface VaccinationRecord {
  id: string;
  animalId?: string;
  animalTag?: string;
  herdId?: string;
  species: Species;
  farmId: string;
  villageName: string;
  districtName: string;
  vaccineId: string;
  vaccineName: string;
  diseasePrevented: string;
  dateAdministered: string;
  nextDueDate: string;
  doseNumber: number;
  batchNumber: string;
  administeredBy: string;
  administeredByRole: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'OVERDUE';
}

export interface TreatmentRecord {
  id: string;
  caseId?: string;
  animalId?: string;
  animalTag?: string;
  species: Species;
  farmName: string;
  suspectedDisease: string;
  treatmentDate: string;
  medicines: {
    medicineName: string;
    dosage: string;
    durationDays: number;
    route: 'INTRAMUSCULAR' | 'ORAL' | 'SUBCUTANEOUS' | 'TOPICAL' | 'INTRAVENOUS';
  }[];
  veterinarianId: string;
  veterinarianName: string;
  treatmentResponse: 'IMPROVING' | 'UNCHANGED' | 'DETERIORATING' | 'RECOVERED';
  remarks: string;
  createdAt: string;
}

export interface MortalityReport {
  id: string;
  reportCode: string;
  animalId?: string;
  animalTag?: string;
  herdId?: string;
  species: Species;
  farmId: string;
  farmName: string;
  ownerName: string;
  ownerPhone: string;
  stateName: string;
  districtName: string;
  villageName: string;
  latitude: number;
  longitude: number;
  dateOfDeath: string;
  deadCount: number;
  affectedCount: number;
  suspectedCause: string;
  symptomsBeforeDeath: string[];
  reportedBy: string;
  reportedByRole: Role;
  necropsyConducted: boolean;
  necropsyFindings?: string;
  carcassDisposalMethod: 'BURIAL_WITH_LIME' | 'INCINERATION' | 'RENDERING' | 'PENDING';
  outbreakTriggered: boolean;
  createdAt: string;
}

export interface Outbreak {
  id: string;
  outbreakCode: string;
  diseaseId: string;
  diseaseName: string;
  species: Species[];
  stateName: string;
  districtName: string;
  primaryVillage: string;
  villageName?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  startDate: string;
  status: OutbreakStatus;
  riskLevel: RiskLevel;
  totalCases: number;
  totalDeaths: number;
  affectedAnimalCount: number;
  totalAffected?: number;
  ringVaccinationDoses?: number;
  containmentMeasures: string[];
  caseIds: string[];
  declaredBy: string;
  lastUpdated: string;
}

export interface LabSample {
  id: string;
  sampleCode: string;
  caseId: string;
  caseNumber: string;
  animalId?: string;
  animalTag?: string;
  species: Species;
  sampleType: 'BLOOD_SERUM' | 'NASAL_SWAB' | 'TISSUE_BIOPSY' | 'MILK_SAMPLE' | 'VESICULAR_FLUID' | 'FECAL_SAMPLE' | 'SKIN_SCRAPING' | 'LYMPH_NODE_ASPIRATE';
  collectionDate: string;
  collectedBy: string;
  laboratoryId: string;
  laboratoryName: string;
  testRequested: 'RT_PCR' | 'ELISA' | 'BACTERIAL_CULTURE' | 'BLOOD_SMEAR_MICROSCOPY' | 'SEROLOGY' | 'ANTIGEN_RAPID';
  suspectedDiseaseName: string;
  status: SampleStatus;
  result: TestResult;
  resultDetails?: string;
  testedBy?: string;
  resultDate?: string;
  remarks?: string;
}

export interface Alert {
  id: string;
  userId?: string; // If notification is private/specific to a user
  title: string;
  message: string;
  type?: NotificationType;
  priority: AlertPriority;
  category: AlertCategory;
  targetRoles: Role[];
  
  // Location Hierarchy & Relevance
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  blockId?: string;
  blockName?: string;
  villageId?: string;
  villageName?: string;
  distanceKm?: number;
  locationRelevance?: string; // e.g. "Same Village - Immediate Critical Notice", "Adjacent Village - 5km Buffer", "District Level"

  // Related Entities
  animalId?: string;
  animalTag?: string;
  farmId?: string;
  farmName?: string;
  caseId?: string;
  caseNumber?: string;
  outbreakId?: string;
  outbreakCode?: string;
  sampleId?: string;
  sampleCode?: string;
  diseaseId?: string;
  diseaseName?: string;
  species?: Species[];

  // Action Triggers
  actionUrl?: string;
  actionType?: 'VIEW_CASE' | 'VIEW_ANIMAL' | 'REPORT_ANIMAL' | 'CONTACT_VET' | 'VIEW_LAB' | 'VIEW_MAP' | 'VIEW_DETAILS' | 'COMPLETE_VAX';
  actionLabel?: string;

  // Guidance, precautions & Veterinary Safety
  recommendedActions?: string[];
  safetyGuidance?: string[];
  veterinaryUrgency?: 'ROUTINE' | 'ELEVATED' | 'HIGH' | 'EMERGENCY';
  isMLScreening?: boolean;

  // Demo Simulation Tag
  isDemo?: boolean;

  createdAt: string;
  isRead: boolean;
  status?: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
}

export interface WeatherData {
  districtId: string;
  districtName: string;
  stateName: string;
  temperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  windSpeedKph: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Heavy Rain' | 'Humid & Overcast' | 'Dry & Warm';
  season: 'MONSOON' | 'WINTER' | 'SUMMER' | 'POST_MONSOON';
  vectorRiskIndex: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  thermalStressIndex: 'NORMAL' | 'ALERT' | 'DANGER' | 'EMERGENCY';
  historicalCorrelationInsight: string;
  forecastAlert?: string;
}

export interface RiskCalculationResult {
  score: number; // 0 to 100
  level: RiskLevel;
  symptomMatchScore: number;
  nearbyClusterScore: number;
  affectedRateScore: number;
  mortalityScore: number;
  vaccinationScore: number;
  historicalTrendScore: number;
  weatherFactorScore: number;
  suspectedDiseases: SuspectedDiseaseMatch[];
  contributingFactors: string[];
  recommendedActions: RecommendedAdvisory[];
  supportiveCare: SupportiveCareStep[];
  thingsToAvoid: string[];
  vaccinationGuidance: string[];
  preventiveActions: string[];
  emergencySigns: string[];
  requiresVeterinaryReview: boolean;
  requiresLabConfirmation: boolean;
  outbreakSignal: boolean;
  nearbyCasesCount: number;
  disclaimer: string;
}

export interface FieldVisit {
  id: string;
  visitCode: string;
  caseId?: string;
  farmId: string;
  farmName: string;
  villageName: string;
  farmerName: string;
  farmerPhone: string;
  scheduledTime: string;
  priority: 'ROUTINE' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedWorkerId: string;
  assignedWorkerName: string;
  purpose: 'SYMPTOM_INVESTIGATION' | 'VACCINATION_DRIVE' | 'SAMPLE_COLLECTION' | 'MORTALITY_VERIFICATION' | 'ROUTINE_CHECK';
  notes?: string;
  completedAt?: string;
  latitude?: number;
  longitude?: number;
}

export interface Advisory {
  id: string;
  code: string;
  title: string;
  level: 'DISTRICT' | 'STATE' | 'NATIONAL';
  jurisdiction: string;
  diseaseTarget?: string;
  speciesTarget?: Species[];
  issuedBy: string;
  issuedRole: Role;
  issuedAt: string;
  priority: 'INFO' | 'WARNING' | 'EMERGENCY';
  content: string;
  biosecurityDirectives: string[];
  containmentRadiusKm?: number;
  activeUntil?: string;
  isActive: boolean;
}

export interface OfflineSyncItem {
  id: string;
  type: 'CASE_REPORT' | 'MORTALITY_REPORT' | 'ANIMAL_REGISTRATION' | 'VACCINATION_RECORD';
  data: any;
  createdAt: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}

export interface SystemConfig {
  riskWeights: {
    symptomMatch: number; // default 0.30
    nearbyCases: number; // default 0.20
    affectedRate: number; // default 0.15
    mortality: number; // default 0.10
    vaccination: number; // default 0.10
    historicalTrends: number; // default 0.10
    weather: number; // default 0.05
  };
  clusterThresholds: {
    minCases: number; // default 3
    radiusKm: number; // default 10
    timeWindowDays: number; // default 14
  };
  riskLevelCutoffs: {
    moderate: number; // 31
    high: number; // 61
    critical: number; // 81
  };
}

// ==========================================
// ML & HYBRID RISK ENGINE INTERFACES
// ==========================================

export interface MLDiseasePrediction {
  diseaseId: string;
  diseaseName: string;
  probability: number; // 0.0 to 1.0 (calibrated model likelihood)
  confidenceBand: 'LOW' | 'MEDIUM' | 'HIGH';
  keyAssociatedFeatures: string[];
}

export interface MLPredictionFeatureInput {
  species: Species;
  ageYears?: number;
  sex?: 'MALE' | 'FEMALE';
  breed?: string;
  symptoms: SymptomObservation[];
  symptomDurationDays?: number;
  previousDiseaseHistory?: string[];
  vaccinationStatus?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'UNKNOWN';
  vaccinationRecencyMonths?: number;
  totalAnimalsInHerd: number;
  affectedCount: number;
  deadCount: number;
  recoveredCount?: number;
  nearbyCasesCount: number;
  nearestCaseDistanceKm: number;
  historicalOccurrenceRate?: number;
  season: 'MONSOON' | 'WINTER' | 'SUMMER' | 'POST_MONSOON';
  temperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  stateId: string;
  districtId: string;
  activeClusterPresent: boolean;
}

export interface MLModelMetadata {
  modelVersion: string;
  featureVersion: string;
  modelArchitecture: string; // e.g. 'Multinomial Softmax + Gradient Feature Vectorizer'
  trainingDatasetStatus: 'VALIDATED_PROTOTYPE_DATASET' | 'FIELD_BENCHMARK_DATASET';
  totalTrainingSamples: number;
  evaluationMetrics: {
    macroPrecision: number;
    macroRecall: number;
    macroF1: number;
    sampleAccuracy: number;
    validationMethod: string;
  };
  lastTrainedDate: string;
}

export interface MLPredictionResult {
  id: string;
  modelVersion: string;
  featureVersion: string;
  predictionTimestamp: string;
  predictionStatus: 'SCREENING_ONLY' | 'ANOMALOUS_INPUT';
  topPrediction: MLDiseasePrediction;
  predictions: MLDiseasePrediction[];
  top3ProbabilitiesSum: number;
  confidenceScore: number; // 0 to 100
  featureImportanceVector: {
    featureName: string;
    importanceWeight: number;
    contributionDirection: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }[];
  modelMetadata: MLModelMetadata;
  screeningDisclaimer: string;
}

export interface ExplainableFactor {
  category: 'SYMPTOMS' | 'PROXIMITY' | 'VACCINATION_GAP' | 'MORTALITY_VELOCITY' | 'ENVIRONMENT' | 'HERD_ATTACK_RATE';
  title: string;
  description: string;
  weight: number;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  isFlagged: boolean;
}

export interface HybridRiskAssessment {
  id: string;
  caseId?: string;
  calculatedAt: string;
  
  // Composite Outputs
  finalRiskLevel: RiskLevel;
  finalRiskScore: number; // 0 to 100
  riskLevelLabel: string;
  
  // Model & Engine Components
  mlScreening: MLPredictionResult;
  ruleEvidence: {
    ruleMatchScore: number; // 0 to 100
    ruleRiskLevel: RiskLevel;
    topRuleSuspectedDiseases: SuspectedDiseaseMatch[];
    activeOutbreakTriggered: boolean;
    clusterDistanceKm: number;
    nearbyCasesInRadius: number;
  };

  // Harmonized Suspected Condition
  primarySuspectedDisease: {
    diseaseId: string;
    diseaseName: string;
    combinedConfidencePct: number;
    mlProbability: number;
    ruleScore: number;
    notifiable: boolean;
    zoonotic: boolean;
  };
  rankedSuspectedDiseases: {
    diseaseId: string;
    diseaseName: string;
    mlProbability: number;
    ruleMatchPct: number;
    hybridRankScore: number;
  }[];

  // Explainable AI & Factor Attribution
  explainableFactors: ExplainableFactor[];
  summaryExplanation: string;

  // Integrated Decision Support System (DSS)
  decisionSupport: {
    // 1. Vaccination Action
    vaccinationGuidance: {
      status: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'OUTBREAK_RING_REQUIRED' | 'UNKNOWN';
      targetVaccine?: string;
      routineRecommendation: string;
      outbreakResponseRecommendation?: string;
      contraindicationWarning: string;
    };

    // 2. Safe Supportive & Home Care
    supportiveCare: {
      isSafeForHomeCare: boolean;
      homeCareLevel: HomeCareLevel;
      immediateSteps: SupportiveCareStep[];
      warningsAndAvoidance: string[];
      emergencySigns: string[];
      medicalNotice: string;
    };

    // 3. Veterinary Referral & Urgency
    veterinaryReferral: {
      urgency: 'ROUTINE' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
      actionSummary: string;
      recommendedClinicalFocus: string[];
      teleConsultAvailable: boolean;
    };

    // 4. Laboratory Confirmation Pathway
    laboratoryPathway: {
      confirmationRequired: boolean;
      recommendedTest: 'RT_PCR' | 'ELISA' | 'BACTERIAL_CULTURE' | 'BLOOD_SMEAR_MICROSCOPY' | 'SEROLOGY' | 'ANTIGEN_RAPID';
      sampleTypeRequired: string;
      biosafetyCategory: string;
      designatedLabTier: string;
    };

    // 5. Farm & District Biosecurity Directives
    biosecurityDirectives: string[];
  };

  legalDisclaimer: string;
}

export * from './location';
export * from './gis';
