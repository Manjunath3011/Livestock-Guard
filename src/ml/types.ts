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
  | 'AUTHORIZED_SURVEILLANCE'
  | 'CLINICALLY_SUSPECTED'
  | 'FARMER_REPORT'
  | 'UNVERIFIED'
  | 'PROTOTYPE_BENCHMARK'
  | 'clinical_suspected'
  | 'prototype_benchmark';

export type LabelQuality =
  | 'GOLD_STANDARD'
  | 'VALIDATED'
  | 'PROVISIONAL'
  | 'UNVERIFIED';

export type DatasetCategory =
  | 'REAL'
  | 'SYNTHETIC'
  | 'IMAGE'
  | 'UNVERIFIED'
  | 'BENCHMARK';

export type DataModality =
  | 'STRUCTURED'
  | 'IMAGE_DATASET';

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
  | 'APPROVED'
  | 'PRODUCTION_CANDIDATE'
  | 'PRODUCTION'
  | 'REJECTED'
  | 'RETIRED'
  | 'PROTOTYPE'
  | 'UNAVAILABLE';

export type FeatureAvailability =
  | 'AVAILABLE_AT_PREDICTION'
  | 'POST_DIAGNOSIS';

/**
 * Standardized Health Record for Dataset Ingestion and Model Training (Master Schema)
 */
export interface DatasetRecord {
  // Identity
  record_id: string;
  animal_id?: string;
  farm_id?: string;
  herd_id?: string;
  case_id?: string;
  outbreak_id?: string;

  // Animal
  species: Species;
  breed?: string;
  age_years?: number;
  sex?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  herd_size?: number;

  // Location
  country?: string;
  location_id?: string;
  state?: string;
  district?: string;
  subdistrict?: string;
  block?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number;

  // Clinical
  symptoms: { symptom_id: string; severity?: SymptomSeverity }[];
  symptom_severity?: SymptomSeverity;
  symptom_duration_days?: number;
  clinical_history?: string;

  previous_disease?: string[];
  previous_treatment?: string[];

  // Vaccination
  vaccination_status?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'UNKNOWN';
  vaccination_history?: string;
  last_vaccination_date?: string;

  // Epidemiology
  affected_animals?: number;
  unaffected_animals?: number;
  total_animals?: number;
  mortality?: number;
  dead_count?: number;

  nearby_cases?: number;
  nearby_cases_10km?: number;
  nearby_outbreaks?: number;
  distance_to_nearest_case_km?: number;

  // Environment
  temperature?: number;
  temperature_c?: number;
  temperature_environment?: number;
  humidity?: number;
  humidity_pct?: number;
  rainfall?: number;
  rainfall_mm?: number;
  season?: 'MONSOON' | 'POST_MONSOON' | 'WINTER' | 'SUMMER';

  // Time
  observation_date?: string;
  diagnosis_date?: string;
  reporting_date?: string;

  // Diagnostic
  suspected_disease?: string;
  disease_label: string;
  original_disease_label?: string;
  is_unmapped_disease?: boolean;
  unmapped_reason?: string;
  diagnosis_source: DiagnosisSource;

  lab_test?: 'RT_PCR' | 'ELISA' | 'BACTERIAL_CULTURE' | 'BLOOD_SMEAR_MICROSCOPY' | 'SEROLOGY' | 'ANTIGEN_RAPID' | 'NONE';
  test_performed?: string;
  lab_result?: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'PENDING';
  test_result?: string;
  confirmation_status?: 'CONFIRMED' | 'SUSPECTED' | 'DISPROVED';

  veterinarian_id?: string;
  laboratory_id?: string;

  // Provenance
  dataset_id?: string;
  data_source?: string;
  data_source_id?: string;
  source_type?: string;
  source_url?: string;
  source_record_id?: string;
  license?: string;
  label_quality?: LabelQuality;
  created_at?: string;
  timestamp?: string;
}

// Backward compatibility alias
export type RawHealthRecord = DatasetRecord;

export interface RejectionAuditRecord {
  recordId: string;
  rejectionReason: string;
  validationRule: string;
  originalValue?: any;
  correctedValue?: any;
}

/**
 * Dataset Provenance & Metadata
 */
export interface DatasetProvenance {
  dataset_id: string;
  dataset_name: string;
  source_organization: string;
  source_type: 'KAGGLE' | 'WOAH_WAHIS' | 'FAO' | 'ICAR_GOVERNMENT' | 'VETERINARY_RECORDS' | 'DIAGNOSTIC_LAB' | 'FIELD_SURVEILLANCE' | 'SYNTHETIC' | 'BENCHMARK_PROTOTYPE' | 'GOVERNMENT_SURVEILLANCE' | 'VETERINARY_HOSPITAL' | 'RESEARCH_INSTITUTION' | 'UNIVERSITY';
  source_url?: string;
  license?: string;
  download_date?: string;
  version?: string;
  description?: string;
  original_file_name?: string;
  original_record_count?: number;
  processed_record_count?: number;
  mapping_version?: string;
  quality_status?: 'VALIDATED' | 'REQUIRES_REVIEW' | 'REJECTED';
  approved_for_training?: boolean;
  is_synthetic?: boolean;
  dataset_category?: DatasetCategory;
  data_modality?: DataModality;
  image_dataset_reserve_note?: string; // e.g. "reserved_for_future_computer_vision_model"
  unmapped_disease_count?: number;
  unmapped_disease_labels?: string[];

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
  unmappedDiseaseCount?: number;
  unmappedDiseaseLabels?: string[];
  invalidSymptomFormatCount?: number;
  missingRequiredFieldsCount?: number;
  invalidAgeCount?: number;
  invalidVaccinationCount?: number;
  schemaMismatchCount?: number;
  rejectionReasons?: Record<string, number>;
  rejectionAuditLog?: RejectionAuditRecord[];
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
 * Feature Dictionary Definition for 54-Feature System
 */
export interface FeatureDictionaryEntry {
  feature_name: string;
  data_type: 'binary' | 'continuous' | 'ordinal' | 'categorical';
  description: string;
  source_field: string;
  transformation: string;
  allowed_values: string[] | string;
  missing_policy: string;
  used_for_training: boolean;
}

/**
 * Feature Coverage Pre-Training Report
 */
export interface FeatureCoverageReport {
  totalExpectedFeatures: number;
  availableFeatures: string[];
  missingFeatures: string[];
  derivedFeatures: string[];
  excludedFeatures: string[];
  featureDictionary: FeatureDictionaryEntry[];
}

/**
 * Comprehensive Reproducible Training Report (Requirement #30)
 */
export interface ComprehensiveTrainingReport {
  reportId: string;
  trainingTimestamp: string;
  datasetMetadata: {
    datasetId: string;
    datasetName: string;
    sourceOrganization: string;
    sourceURL?: string;
    sourceType: string;
    license: string;
    version: string;
    isSynthetic: boolean;
    datasetCategory: DatasetCategory;
    totalRecordsImported: number;
    validRecordsUsed: number;
    rejectedRecordsCount: number;
    unmappedDiseaseCount: number;
  };
  featureEngineeringSummary: {
    totalFeatures: number;
    availableCount: number;
    derivedCount: number;
    missingCount: number;
    excludedCount: number;
    featureNames: string[];
  };
  splitConfiguration: {
    strategy: string;
    trainCount: number;
    testCount: number;
    trainRatio: number;
    groupKey?: string;
  };
  classDistribution: {
    trainDistribution: Record<string, number>;
    testDistribution: Record<string, number>;
    imbalanceRatio: number;
  };
  hyperparameters: {
    modelType: string;
    numTrees: number;
    maxDepth: number;
    minSamplesSplit: number;
    randomSeed?: number;
  };
  evaluationMetrics: EvaluationMetrics;
  perClassEvaluation: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
    truePositives: number;
    falsePositives: number;
    falseNegatives: number;
  }>;
  engineeringAcceptanceStatus: 'PASSED' | 'FLAGGED_FOR_REVIEW';
  engineeringAcceptanceNote: string;
  veterinaryValidationRequired: boolean;
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
  trainingReport?: ComprehensiveTrainingReport;
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
