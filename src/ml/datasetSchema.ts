import {
  DatasetRecord,
  DiagnosisSource,
  LabelQuality,
  FeatureAvailability
} from './types';
import { Species } from '../types';

export interface FieldDefinition {
  fieldName: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'enum' | 'date';
  required: boolean;
  availability: FeatureAvailability;
  description: string;
  allowedValues?: string[];
  piiSensitive?: boolean;
}

/**
 * Standard Dataset Schema for Real-World Livestock Health Datasets
 */
export const DATASET_SCHEMA_FIELDS: Record<string, FieldDefinition> = {
  record_id: {
    fieldName: 'record_id',
    type: 'string',
    required: true,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Unique identifier for the clinical/health observation record'
  },
  animal_id: {
    fieldName: 'animal_id',
    type: 'string',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Anonymized identifier of the animal (used for grouped splitting)'
  },
  farm_id: {
    fieldName: 'farm_id',
    type: 'string',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Anonymized identifier of the farm/holding (used for grouped splitting)'
  },
  outbreak_id: {
    fieldName: 'outbreak_id',
    type: 'string',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Identifier of the epidemiological cluster or outbreak event'
  },
  species: {
    fieldName: 'species',
    type: 'enum',
    required: true,
    availability: 'AVAILABLE_AT_PREDICTION',
    allowedValues: ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Horse', 'Camel', 'Other'],
    description: 'Host animal species'
  },
  breed: {
    fieldName: 'breed',
    type: 'string',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Breed of the animal'
  },
  age_years: {
    fieldName: 'age_years',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Age in years'
  },
  sex: {
    fieldName: 'sex',
    type: 'enum',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    allowedValues: ['MALE', 'FEMALE', 'UNKNOWN'],
    description: 'Sex of the animal'
  },
  state: {
    fieldName: 'state',
    type: 'string',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'State / Province'
  },
  district: {
    fieldName: 'district',
    type: 'string',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'District for geographic stratification'
  },
  symptoms: {
    fieldName: 'symptoms',
    type: 'array',
    required: true,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Array of standardized symptom observations'
  },
  symptom_duration_days: {
    fieldName: 'symptom_duration_days',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Number of days symptoms have been present'
  },
  vaccination_status: {
    fieldName: 'vaccination_status',
    type: 'enum',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    allowedValues: ['UP_TO_DATE', 'OVERDUE', 'UNVACCINATED', 'UNKNOWN'],
    description: 'Immunization status at time of symptom onset'
  },
  affected_animals: {
    fieldName: 'affected_animals',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Number of clinically affected animals in herd'
  },
  total_animals: {
    fieldName: 'total_animals',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Total herd size'
  },
  mortality: {
    fieldName: 'mortality',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Number of fatalities at time of report'
  },
  nearby_cases: {
    fieldName: 'nearby_cases',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Number of reported cases in 10 km radius'
  },
  distance_to_nearest_case_km: {
    fieldName: 'distance_to_nearest_case_km',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Spatial distance to closest reported case'
  },
  temperature: {
    fieldName: 'temperature',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Ambient temperature in Celsius'
  },
  humidity: {
    fieldName: 'humidity',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Relative humidity percentage'
  },
  rainfall: {
    fieldName: 'rainfall',
    type: 'number',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    description: 'Daily rainfall in millimeters'
  },
  season: {
    fieldName: 'season',
    type: 'enum',
    required: false,
    availability: 'AVAILABLE_AT_PREDICTION',
    allowedValues: ['MONSOON', 'POST_MONSOON', 'WINTER', 'SUMMER'],
    description: 'Epidemiological season'
  },
  disease_label: {
    fieldName: 'disease_label',
    type: 'string',
    required: true,
    availability: 'POST_DIAGNOSIS', // Target label
    description: 'Ground-truth disease diagnosis identifier'
  },
  diagnosis_source: {
    fieldName: 'diagnosis_source',
    type: 'enum',
    required: true,
    availability: 'POST_DIAGNOSIS',
    allowedValues: ['LAB_CONFIRMED', 'VETERINARIAN_CONFIRMED', 'CLINICALLY_SUSPECTED', 'UNVERIFIED', 'PROTOTYPE_BENCHMARK'],
    description: 'Method by which the disease diagnosis was established'
  },
  diagnosis_date: {
    fieldName: 'diagnosis_date',
    type: 'date',
    required: false,
    availability: 'POST_DIAGNOSIS',
    description: 'Date diagnosis was established'
  },
  lab_test: {
    fieldName: 'lab_test',
    type: 'string',
    required: false,
    availability: 'POST_DIAGNOSIS', // STRICT LEAKAGE PREVENTION: Lab test is post-diagnosis
    description: 'Laboratory diagnostic assay used for confirmation'
  },
  lab_result: {
    fieldName: 'lab_result',
    type: 'string',
    required: false,
    availability: 'POST_DIAGNOSIS', // STRICT LEAKAGE PREVENTION: Lab result must NEVER enter model input features
    description: 'Diagnostic laboratory confirmation result'
  },
  label_quality: {
    fieldName: 'label_quality',
    type: 'enum',
    required: false,
    availability: 'POST_DIAGNOSIS',
    allowedValues: ['GOLD_STANDARD', 'VALIDATED', 'PROVISIONAL', 'UNVERIFIED'],
    description: 'Reliability tier of the label'
  }
};

/**
 * Maps diagnosis source to formal label quality tier
 */
export function deriveLabelQuality(source: DiagnosisSource): LabelQuality {
  switch (source) {
    case 'LAB_CONFIRMED':
      return 'GOLD_STANDARD';
    case 'VETERINARIAN_CONFIRMED':
      return 'VALIDATED';
    case 'CLINICALLY_SUSPECTED':
      return 'PROVISIONAL';
    case 'PROTOTYPE_BENCHMARK':
      return 'VALIDATED';
    case 'UNVERIFIED':
    default:
      return 'UNVERIFIED';
  }
}

/**
 * Forbidden features for machine learning prediction inputs
 */
export const LEAKAGE_FORBIDDEN_FIELDS = [
  'disease_label',
  'diagnosis_source',
  'diagnosis_date',
  'lab_test',
  'lab_result',
  'label_quality',
  'previous_treatment_outcome',
  'post_diagnosis_mortality',
  'subsequent_case_history',
  'veterinarian_notes'
];
