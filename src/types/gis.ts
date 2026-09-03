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

// ==========================================
// REAL GIS / GEOJSON MAP SPECIFICATIONS
// ==========================================

export type GeoJSONPosition = [number, number]; // [longitude, latitude] - CRITICAL: standard GeoJSON ordering

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: GeoJSONPosition;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: GeoJSONPosition[][];
}

export interface GeoJSONFeature<G = GeoJSONPoint | GeoJSONPolygon, P = Record<string, any>> {
  type: 'Feature';
  id?: string | number;
  geometry: G;
  properties: P;
}

export interface GeoJSONFeatureCollection<G = GeoJSONPoint | GeoJSONPolygon, P = Record<string, any>> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<G, P>[];
}

export type GISMapStyleId = 'osm_standard' | 'osm_hot' | 'cyclosm' | 'surveillance_dark' | 'carto_light' | 'custom';

export interface GISMapStylePreset {
  id: GISMapStyleId;
  label: string;
  description: string;
  iconName?: string;
  isCustom?: boolean;
}

export interface GISLayerVisibility {
  cases: boolean;
  verifiedCases: boolean;
  needsVerificationCases: boolean;
  lowCredibilityCases: boolean;
  rejectedCases: boolean;
  hotspots: boolean;
  outbreaks: boolean;
  containmentRings: boolean;
  vetCenters: boolean;
  diagnosticLabs: boolean;
  heatmap: boolean;
  adminBoundaries: boolean;
}

export interface CaseGeoProperties {
  caseId: string;
  caseNumber: string;
  species: Species;
  disease: string;
  riskLevel: RiskLevel;
  riskScore: number;
  status: string;
  statusGroup: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'LOW_CREDIBILITY' | 'REJECTED' | 'SUSPECTED';
  credibilityScore: number;
  credibilityTier: string;
  credibilityStatus: string;
  verificationState: string;
  isUrgentVerification: boolean;
  affectedCount: number;
  deadCount: number;
  villageName: string;
  districtName: string;
  stateName: string;
  ownerName: string;
  ownerPhone?: string; // Hidden for FARMER role
  reportDate: string;
  priority: string;
  weight: number; // For heatmap
}

export interface HotspotGeoProperties {
  hotspotId: string;
  name: string;
  riskTier: HotspotRiskTier;
  riskScore: number;
  primaryDisease: string;
  classification: DiseaseActivityClassification;
  totalCases: number;
  verifiedReports: number;
  needsVerificationReports: number;
  lowCredibilityReports: number;
  affectedCount: number;
  deathCount: number;
  trend: DiseaseActivityTrend;
  radiusKm: number;
  hasOfficialOutbreak: boolean;
  hasPositiveLab: boolean;
  isSimulatedDemo?: boolean;
}

export interface OutbreakGeoProperties {
  outbreakId: string;
  outbreakCode: string;
  diseaseName: string;
  status: string;
  riskLevel: RiskLevel;
  radiusKm: number;
  totalCases: number;
  totalDeaths: number;
  affectedAnimalCount: number;
  startDate: string;
  districtName: string;
  primaryVillage: string;
  containmentMeasures: string[];
}

export interface ContainmentZoneGeoProperties {
  zoneId: string;
  outbreakId: string;
  outbreakCode: string;
  diseaseName: string;
  zoneType: 'CORE_CONTAINMENT' | 'SURVEILLANCE_BUFFER';
  radiusKm: number;
  color: string;
  opacity: number;
}

export interface FacilityGeoProperties {
  id: string;
  name: string;
  type: 'VET_CENTER' | 'DIAGNOSTIC_LAB';
  district: string;
  state?: string;
  isVerifiedInfrastructure: boolean;
  dataSource: 'OFFICIAL_INFRASTRUCTURE' | 'DEMO_SEEDED';
}

export interface GPSValidationResult {
  status: 'VERIFIED' | 'LOCATION_MISMATCH' | 'LOW_GPS_ACCURACY' | 'UNAVAILABLE';
  distanceFromExpectedKm?: number;
  expectedVillage?: string;
  expectedDistrict?: string;
  nearestAdminName?: string;
  accuracyMeters?: number;
  message: string;
}

