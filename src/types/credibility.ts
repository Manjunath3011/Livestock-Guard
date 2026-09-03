import { Role, Species, RiskLevel, CaseStatus } from './index';

export type CredibilityTier = 'TRUSTED' | 'REVIEW' | 'LOW_CREDIBILITY';

export type CredibilityStatus =
  | 'PENDING'
  | 'NEEDS_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'DISMISSED';

export type VerificationState =
  | 'NOT_REVIEWED'
  | 'FIELD_VERIFICATION_PENDING'
  | 'FIELD_VERIFIED'
  | 'VET_REVIEW_PENDING'
  | 'VET_VERIFIED'
  | 'LAB_CONFIRMATION_PENDING'
  | 'LAB_CONFIRMED'
  | 'REJECTED'
  | 'DISMISSED';

export type SourceType =
  | 'FARMER'
  | 'FIELD_WORKER'
  | 'VETERINARIAN'
  | 'LAB'
  | 'OFFICIAL'
  | 'IMPORTED';

export interface CredibilityWeightsConfig {
  dataQuality: number;          // Default 0.20 (20%)
  duplicateSimilarity: number;  // Default 0.20 (20%)
  locationConsistency: number;  // Default 0.15 (15%)
  temporalConsistency: number;  // Default 0.10 (10%)
  reporterHistory: number;      // Default 0.10 (10%)
  animalHistory: number;        // Default 0.10 (10%)
  evidenceStrength: number;     // Default 0.15 (15%)
}

export interface CredibilityThresholdsConfig {
  trustedCutoff: number; // e.g. 80
  reviewCutoff: number;  // e.g. 50
}

export interface ReportCredibilityFeatureBreakdown {
  dataQuality: number;          // 0 - 100
  duplicateSimilarity: number;  // 0 - 100
  locationConsistency: number;  // 0 - 100
  temporalConsistency: number;  // 0 - 100
  reporterHistory: number;      // 0 - 100
  animalHistory: number;        // 0 - 100
  evidenceStrength: number;     // 0 - 100
}

export interface VerificationEvidenceItem {
  type: 'PHOTO' | 'VET_VISIT' | 'FIELD_REPORT' | 'LAB_SAMPLE' | 'TREATMENT_SLIP' | 'GOV_TAG_SCAN' | 'COMMUNITY_CORROBORATION' | 'OTHER';
  reference?: string;
  description?: string;
  addedBy?: string;
  addedAt?: string;
  notes?: string;
}

export interface CredibilityAuditRecord {
  id: string;
  action: 'INITIAL_ASSESSMENT' | 'FIELD_VERIFIED' | 'VET_VERIFIED' | 'LAB_CONFIRMED' | 'MORE_INFO_REQUESTED' | 'REJECTED' | 'DISMISSED' | 'STATUS_CHANGED' | 'OFFLINE_SYNC_REASSESSED';
  previousStatus: string;
  newStatus: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  timestamp: string;
  reason: string;
  evidenceReference?: string;
}

/**
 * Structured feature vector representation for future machine learning anomaly detection.
 * (Note: The active production engine uses explainable deterministic rules; this structure prepares
 * labeled datasets for future ML training once sufficient real ground-truth verification labels accumulate).
 */
export interface ReportMLFeatureVector {
  dataQualityScore: number;
  duplicateSimilarityScore: number;
  locationConsistencyScore: number;
  temporalConsistencyScore: number;
  reporterTrustScore: number;
  animalHistoryConsistencyScore: number;
  evidenceStrengthScore: number;
  hasMortality: number;
  isZoonoticSuspected: number;
  affectedCountNormalized: number;
  hasGps: number;
  gpsDistanceKm: number;
  reporterRoleWeight: number;
  hasLabSample: number;
  verifiedByFieldOrVet: number;
}

export interface CredibilityAssessmentResult {
  credibilityScore: number; // 0 - 100
  credibilityTier: CredibilityTier;
  credibilityStatus: CredibilityStatus;
  verificationState: VerificationState;
  credibilityReasons: string[];
  anomalyFlags: string[];
  locationMatchScore: number;
  reporterTrustScore: number;
  animalHistoryConsistencyScore: number;
  credibilityFeatureBreakdown: ReportCredibilityFeatureBreakdown;
  mlFeatureVector: ReportMLFeatureVector;
  isCriticalUrgentVerification: boolean;
  urgentReason?: string;
  duplicateOfCaseId?: string;
  relatedCaseIds?: string[];
  eventCorrelationId?: string;
}

export interface CredibilityOverviewMetrics {
  totalReports: number;
  verifiedCount: number;
  needsVerificationCount: number;
  lowCredibilityCount: number;
  rejectedCount: number;
  duplicateReportsCount: number;
  locationAnomaliesCount: number;
  burstAnomaliesCount: number;
  verificationBacklogCount: number;
  averageCredibilityScore: number;
}
