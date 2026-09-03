import { Species, RiskLevel } from './index';

export type SurveillanceTimeWindow = '24h' | '7d' | '30d' | '90d' | 'ALL';

export type DiseaseActivityClassification =
  | 'NORMAL_ACTIVITY'
  | 'INCREASED_ACTIVITY'
  | 'SUSPECTED_CLUSTER'
  | 'HIGH_RISK_CLUSTER'
  | 'CONFIRMED_OUTBREAK';

export type HotspotRiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type DiseaseActivityTrend =
  | 'INCREASING'
  | 'STABLE'
  | 'DECREASING'
  | 'INSUFFICIENT_DATA';

export interface HotspotFactorItem {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  description: string;
  isMLSignal?: boolean;
}

export interface HotspotRiskBreakdown {
  totalScore: number; // 0 - 100
  caseDensityScore: number; // max 20
  affectedAnimalsScore: number; // max 15
  diseaseSeverityScore: number; // max 20
  labConfirmationScore: number; // max 15
  caseGrowthScore: number; // max 10
  outbreakProximityScore: number; // max 10
  mlScreeningScore: number; // max 10 (early screening signal)
  recencyScore: number; // max 10
  factors: HotspotFactorItem[];
}

export interface HotspotCluster {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  districtName: string;
  districtId?: string;
  stateName: string;
  stateId?: string;
  villages: string[];
  primaryDisease: string;
  species: Species[];
  classification: DiseaseActivityClassification;
  riskTier: HotspotRiskTier;
  riskScore: number; // 0 - 100
  riskBreakdown: HotspotRiskBreakdown;
  trend: DiseaseActivityTrend;
  trendChangePct?: number; // e.g. +50%, -25%
  currentPeriodCaseCount: number;
  previousPeriodCaseCount: number;
  totalAffectedAnimals: number;
  totalDeaths: number;
  confirmationStatus: 'LAB_CONFIRMED' | 'OFFICIALLY_DECLARED' | 'SUSPECTED' | 'ML_SCREENED_ONLY';
  hasOfficialOutbreak: boolean;
  officialOutbreakCode?: string;
  hasPositiveLab: boolean;
  caseIds: string[];
  latestReportDate: string;
  firstReportDate: string;
  recommendedActions: {
    farmerGuidance: string[];
    veterinarianGuidance: string[];
    officialGuidance: string[];
    fieldWorkerGuidance: string[];
    biosecurityDirectives: string[];
  };
  reportCredibilityCounts?: {
    totalReports: number;
    verifiedReports: number;
    needsVerificationReports: number;
    lowCredibilityReports: number;
    rejectedReports: number;
    credibilityAdjustedRiskScore: number;
  };
  isSimulatedDemo?: boolean;
  simulatedScenarioName?: string;
}

export interface GISHotspotFilterOptions {
  timeWindow: SurveillanceTimeWindow;
  species?: string;
  riskTier?: string;
  disease?: string;
  district?: string;
}
