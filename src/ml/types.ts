import { Species } from '../types';

export const FEATURE_SCHEMA_VERSION_V1 = 'livestock-features-v1';
export const FEATURE_SCHEMA_VERSION_V2 = 'livestock-features-v2';
export const MODEL_VERSION_V1 = 'livestock-disease-v1';
export const MODEL_VERSION_V2 = 'livestock-disease-v2';

export const FEATURE_SCHEMA_VERSION = FEATURE_SCHEMA_VERSION_V1;
export const MODEL_VERSION = MODEL_VERSION_V1;

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export type DiagnosisSource =
  | 'LAB_CONFIRMED'
  | 'VETERINARIAN_CONFIRMED'
  | 'CLINICALLY_SUSPECTED'
  | 'UNVERIFIED'
  | 'PROTOTYPE_BENCHMARK'
  | 'clinical_suspected'
  | 'prototype_benchmark';

export type LabelQuality =
  | 'GOLD_STANDARD'
  | 'VALIDATED'
  | 'PROVISIONAL'
  | 'UNVERIFIED';

export type DatasetStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'REJECTED'
  | 'APPROVED_FOR_TRAINING'
  | 'ARCHIVED';

export type ModelLifecycleStatus =
  | 'DEVELOPMENT'
  | 'VALIDATION'
  | 'PENDING_REVIEW'
  | 'PRODUCTION_CANDIDATE'
  | 'PRODUCTION'
  | 'RETIRED'
  | 'PROTOTYPE'
  | 'UNAVAILABLE';

export type FeatureAvailability =
  | 'AVAILABLE_AT_PREDICTION'
  | 'POST_DIAGNOSIS';

/**
 * Standardized Health Record for Dataset Ingestion and Model Training
 */
export interface DatasetRecord {
  record_id: string;
  animal_id?: string;
  farm_id?: string;
  herd_id?: string;
  outbreak_id?: string;
  species: Species;
  breed?: string;
  age_years?: number;
  sex?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  location_id?: string;
  state?: string;
  district?: string;
  subdistrict?: string;
  village?: string;
  latitude?: number;
  longitude?: number;

  symptoms: { symptom_id: string; severity?: SymptomSeverity }[];
  symptom_severity?: SymptomSeverity;
  symptom_duration_days?: number;

  previous_disease?: string[];
  previous_treatment?: string[];

  vaccination_status?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'UNKNOWN';
  last_vaccination_date?: string;

  affected_animals?: number;
  total_animals?: number;
  herd_size?: number;
  mortality?: number;
  dead_count?: number;

  nearby_cases?: number;
  nearby_cases_10km?: number;
  distance_to_nearest_case_km?: number;

  temperature?: number;
  temperature_c?: number;
  humidity?: number;
  humidity_pct?: number;
  rainfall?: number;
  rainfall_mm?: number;
  season?: 'MONSOON' | 'POST_MONSOON' | 'WINTER' | 'SUMMER';

  disease_label: string;
  diagnosis_source: DiagnosisSource;
  diagnosis_date?: string;

  lab_test?: 'RT_PCR' | 'ELISA' | 'BACTERIAL_CULTURE' | 'BLOOD_SMEAR_MICROSCOPY' | 'SEROLOGY' | 'ANTIGEN_RAPID' | 'NONE';
  lab_result?: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'PENDING';

  veterinarian_id?: string;
  laboratory_id?: string;

  data_source?: string;
  data_source_id?: string;
  label_quality?: LabelQuality;
  created_at?: string;
  timestamp?: string;
}

// Backward compatibility alias
export type RawHealthRecord = DatasetRecord;

/**
 * Dataset Provenance & Metadata
 */
export interface DatasetProvenance {
  dataset_id: string;
  dataset_name: string;
  source_organization: string;
  source_type: 'GOVERNMENT_SURVEILLANCE' | 'VETERINARY_HOSPITAL' | 'DIAGNOSTIC_LAB' | 'RESEARCH_INSTITUTION' | 'UNIVERSITY' | 'BENCHMARK_PROTOTYPE';
  collection_period: {
    start_date: string;
    end_date: string;
  };
  geographic_coverage: {
    states: string[];
    districts: string[];
  };
  number_of_records: number;
  number_of_animals: number;
  number_of_farms: number;
  number_of_disease_classes: number;
  label_quality_breakdown: {
    gold_standard: number;
    validated: number;
    provisional: number;
    unverified: number;
  };
  created_at: string;
  uploaded_by: string;
  approved_by?: string;
  approval_date?: string;
  approval_status: DatasetStatus;
  notes?: string[];
  rawData?: DatasetRecord[];
}

/**
 * Preprocessor Configuration for Feature Vectorization
 */
export interface PreprocessorConfig {
  schemaVersion: string;
  featureNames: string[];
  symptomVocab: string[];
  speciesVocab: string[];
  seasonVocab: string[];
  vaccinationVocab: string[];
  numericalMeans: Record<string, number>;
  numericalStds: Record<string, number>;
}

/**
 * Data Quality and Validation Report
 */
export interface DataQualityReport {
  totalRecordsChecked: number;
  validRecords: number;
  rejectedRecords: number;
  duplicateCount: number;
  speciesContradictionCount: number;
  missingTargetCount: number;
  outOfRangeCount: number;
  dataLeakageViolations: number;
  missingSpeciesCount?: number;
  missingDiseaseLabelCount?: number;
  invalidSymptomFormatCount?: number;
  missingRequiredFieldsCount?: number;
  invalidAgeCount?: number;
  invalidVaccinationCount?: number;
  schemaMismatchCount?: number;
  rejectionReasons?: Record<string, number>;
  classDistribution: Record<string, number>;
  labelQualityDistribution: Record<string, number>;
  isDatasetClean: boolean;
  notes: string[];
  anomalies?: {
    record_id: string;
    reason: string;
    severity: 'WARNING' | 'ERROR';
  }[];
}

/**
 * Confusion Matrix Representation
 */
export interface ConfusionMatrix {
  classes: string[];
  matrix: number[][]; // rows: true class, cols: predicted class
}

/**
 * Machine Learning Evaluation Metrics
 */
export interface EvaluationMetrics {
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  weightedF1: number;
  logLoss: number;
  classMetrics: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
  confusionMatrix: ConfusionMatrix;
  validationMethod: string;
  temporalValidation?: {
    trainPeriod: string;
    testPeriod: string;
    temporalAccuracy: number;
    temporalMacroF1: number;
  };
  geographicValidation?: {
    trainDistricts: string[];
    testDistricts: string[];
    outOfDistrictAccuracy: number;
    outOfDistrictMacroF1: number;
    status: 'EVALUATED' | 'INSUFFICIENT_GEOGRAPHIC_COVERAGE';
    notes?: string;
  };
  evaluationTimestamp: string;
}

/**
 * Decision Tree Nodes
 */
export interface DecisionTreeNode {
  featureIndex?: number;
  threshold?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
  probabilities?: number[];
  isLeaf: boolean;
}

/**
 * Random Forest Model Artifact
 */
export interface RandomForestModelArtifact {
  modelType: 'RANDOM_FOREST_CLASSIFIER';
  modelVersion: string;
  featureSchemaVersion: string;
  targetClasses: string[];
  trees: DecisionTreeNode[];
  featureImportances: number[];
  classPriors: number[];
  hyperparameters: {
    numTrees: number;
    maxDepth: number;
    minSamplesSplit: number;
  };
}

export interface CalibratedLinearModelArtifact {
  modelType: 'CALIBRATED_MULTINOMIAL_CLASSIFIER';
  modelVersion: string;
  featureSchemaVersion: string;
  targetClasses: string[];
  weights: number[][];
  biases: number[];
  featureNames: string[];
  temperature: number;
}

export type ModelArtifact = RandomForestModelArtifact | CalibratedLinearModelArtifact;

/**
 * Complete Registered Model Package
 */
export interface CompleteModelPackage {
  metadata: {
    modelVersion: string;
    featureSchemaVersion: string;
    modelType: string;
    status: ModelLifecycleStatus;
    trainingTimestamp: string;
    trainingDatasetVersion: string;
    totalTrainingSamples: number;
    numClasses: number;
    datasetDisclaimer: string;
    dataProvenanceType: 'BENCHMARK_PROTOTYPE' | 'REAL_WORLD_VALIDATED';
    trained?: boolean;
    reason?: string;
  };
  evaluationMetrics: EvaluationMetrics;
  dataQualityReport: DataQualityReport;
  preprocessor: PreprocessorConfig;
  targetClasses: string[];
  model: ModelArtifact;
}

/**
 * Veterinary Review Sign-Off Record
 */
export interface VeterinaryReview {
  reviewId: string;
  modelId: string;
  modelVersion: string;
  reviewedBy: string;
  reviewerRole: string;
  reviewerCredentials: string;
  reviewDate: string;
  decision: 'APPROVED' | 'REJECTED' | 'PENDING';
  clinicalSafeguardsChecked: boolean;
  epidemiologicalPlausibilityScore: number; // 1 to 5
  comments: string;
  limitationsNoted: string[];
}

/**
 * Model Registry Record
 */
export interface ModelRegistryRecord {
  model_id: string;
  model_version: string;
  model_type: string;
  dataset_id: string;
  dataset_name: string;
  feature_schema_version: string;
  training_date: string;
  training_records: number;
  disease_classes: string[];
  metrics: EvaluationMetrics;
  artifact_reference: string;
  package: CompleteModelPackage;
  status: ModelLifecycleStatus;
  created_by: string;
  approved_by?: string;
  approval_date?: string;
  veterinary_review?: VeterinaryReview;
  audit_trail: {
    action: string;
    user: string;
    timestamp: string;
    notes?: string;
  }[];
}

/**
 * Training Data Candidate Record from Laboratory / Clinical Feedback
 */
export interface TrainingCandidateRecord {
  id: string;
  caseId: string;
  caseNumber: string;
  record: DatasetRecord;
  origin: 'LABORATORY_CONFIRMATION' | 'VETERINARY_VALIDATION';
  labelQuality: LabelQuality;
  status: 'QUEUED' | 'VALIDATED' | 'INCLUDED_IN_DATASET' | 'REJECTED';
  submittedAt: string;
  verifiedBy?: string;
  rejectionReason?: string;
}
