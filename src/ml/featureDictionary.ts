import { FeatureDictionaryEntry, FeatureCoverageReport, DatasetRecord } from './types';
import { SPECIES_VOCAB, SEASONS_VOCAB, VACCINATION_VOCAB } from './preprocessor';
import { SYMPTOMS_LIST } from '../data/knowledgeBase';

/**
 * 54-FEATURE MASTER CATALOG & COMPREHENSIVE FEATURE DICTIONARY
 *
 * This provides full auditability, documentation, and mathematical transformation
 * rules for all 54 features utilized by the LivestockGuard Random Forest classifier.
 */
export const MASTER_FEATURE_DICTIONARY: FeatureDictionaryEntry[] = [
  // 1. Species One-Hot (9 features)
  ...SPECIES_VOCAB.map(sp => ({
    feature_name: `species_${sp}`,
    data_type: 'binary' as const,
    description: `Binary flag indicating host animal species is ${sp}`,
    source_field: 'species',
    transformation: `1.0 if normalized species equals '${sp}', else 0.0`,
    allowed_values: ['0.0', '1.0'],
    missing_policy: "Default mapped to 'species_Other' if species field is unrecognized or missing",
    used_for_training: true
  })),

  // 2. Symptom Severity Features (30 features)
  ...SYMPTOMS_LIST.map(sym => ({
    feature_name: `symptom_${sym.id}`,
    data_type: 'continuous' as const,
    description: `Severity weight for clinical symptom: ${sym.name}`,
    source_field: 'symptoms',
    transformation: "0.0 if absent, 0.65 if mild, 1.0 if moderate, 1.4 if severe",
    allowed_values: ['0.0', '0.65', '1.0', '1.4'],
    missing_policy: 'Implicit 0.0 (symptom absent in clinical observation)',
    used_for_training: true
  })),

  // 3. Vaccination Status One-Hot (4 features)
  ...VACCINATION_VOCAB.map(vac => ({
    feature_name: `vaccination_${vac}`,
    data_type: 'binary' as const,
    description: `Binary flag indicating vaccination history status is ${vac}`,
    source_field: 'vaccination_status',
    transformation: `1.0 if normalized vaccination status equals '${vac}', else 0.0`,
    allowed_values: ['0.0', '1.0'],
    missing_policy: "Default mapped to 'vaccination_UNKNOWN'",
    used_for_training: true
  })),

  // 4. Season One-Hot (4 features)
  ...SEASONS_VOCAB.map(sea => ({
    feature_name: `season_${sea}`,
    data_type: 'binary' as const,
    description: `Binary flag indicating epidemiological season is ${sea}`,
    source_field: 'season',
    transformation: `1.0 if normalized season equals '${sea}', else 0.0`,
    allowed_values: ['0.0', '1.0'],
    missing_policy: "Default mapped to 'season_POST_MONSOON'",
    used_for_training: true
  })),

  // 5. Numerical Features (7 features)
  {
    feature_name: 'symptom_duration_days',
    data_type: 'continuous',
    description: 'Duration of clinical symptoms in days prior to observation',
    source_field: 'symptom_duration_days',
    transformation: 'Z-score standardization: (duration - mean) / std',
    allowed_values: 'Continuous real number (unstandardized >= 1 day)',
    missing_policy: 'Median imputation (2.0 days) prior to standardization',
    used_for_training: true
  },
  {
    feature_name: 'herd_attack_rate',
    data_type: 'continuous',
    description: 'Proportion of herd showing clinical morbidity or mortality',
    source_field: 'affected_animals, herd_size, dead_count',
    transformation: 'min((affected + dead) / max(herd_size, 1), 1.0) then Z-score standardized',
    allowed_values: 'Continuous real number [0.0, 1.0]',
    missing_policy: 'Derived from affected_animals and herd_size with safe fallback of 0.1',
    used_for_training: true
  },
  {
    feature_name: 'mortality_rate',
    data_type: 'continuous',
    description: 'Proportion of herd that has died from the acute episode',
    source_field: 'dead_count, herd_size',
    transformation: 'min(dead_count / max(herd_size, 1), 1.0) then Z-score standardized',
    allowed_values: 'Continuous real number [0.0, 1.0]',
    missing_policy: 'Defaults to 0.0 if dead_count is unrecorded',
    used_for_training: true
  },
  {
    feature_name: 'nearby_case_proximity',
    data_type: 'continuous',
    description: 'Distance-weighted active outbreak proximity score within 10km radius',
    source_field: 'nearby_cases_10km, distance_to_nearest_case_km',
    transformation: '(1 / (1 + distance * 0.15)) * min(nearby_cases, 5) then Z-score standardized',
    allowed_values: 'Continuous real number >= 0.0',
    missing_policy: 'Calculated as 0.0 if no nearby cases reported',
    used_for_training: true
  },
  {
    feature_name: 'temperature_c',
    data_type: 'continuous',
    description: 'Ambient environmental temperature in degrees Celsius',
    source_field: 'temperature or temperature_c',
    transformation: 'Z-score standardization: (temp - mean) / std',
    allowed_values: 'Continuous real number [-20.0, 55.0] Celsius',
    missing_policy: 'Regional seasonal median (28.0°C) imputed if missing',
    used_for_training: true
  },
  {
    feature_name: 'humidity_pct',
    data_type: 'continuous',
    description: 'Ambient relative humidity percentage',
    source_field: 'humidity or humidity_pct',
    transformation: 'Z-score standardization: (humidity - mean) / std',
    allowed_values: 'Continuous real number [0.0, 100.0] percent',
    missing_policy: 'Regional median (65.0%) imputed if missing',
    used_for_training: true
  },
  {
    feature_name: 'rainfall_mm',
    data_type: 'continuous',
    description: 'Estimated or measured daily precipitation in millimeters',
    source_field: 'rainfall or rainfall_mm',
    transformation: 'Z-score standardization: (rainfall - mean) / std',
    allowed_values: 'Continuous real number >= 0.0 mm',
    missing_policy: 'Defaults to 0.0 mm if precipitation unrecorded',
    used_for_training: true
  }
];

/**
 * Validates dataset feature coverage against the 54 expected features
 * before initiating machine learning training.
 */
export function generateFeatureCoverageReport(records: DatasetRecord[]): FeatureCoverageReport {
  const totalExpectedFeatures = MASTER_FEATURE_DICTIONARY.length;
  const availableFeatures: string[] = [];
  const derivedFeatures: string[] = [];
  const missingFeatures: string[] = [];
  const excludedFeatures: string[] = [];

  if (!records || records.length === 0) {
    return {
      totalExpectedFeatures,
      availableFeatures: [],
      missingFeatures: MASTER_FEATURE_DICTIONARY.map(f => f.feature_name),
      derivedFeatures: [],
      excludedFeatures: [],
      featureDictionary: MASTER_FEATURE_DICTIONARY
    };
  }

  // Sample inspection across dataset
  const sample = records.slice(0, Math.min(records.length, 50));

  for (const entry of MASTER_FEATURE_DICTIONARY) {
    if (entry.feature_name.startsWith('species_')) {
      const sp = entry.feature_name.replace('species_', '');
      const hasSpecies = sample.some(r => r.species === sp || (sp === 'Other' && !SPECIES_VOCAB.includes(r.species)));
      if (hasSpecies) {
        availableFeatures.push(entry.feature_name);
      } else {
        derivedFeatures.push(entry.feature_name);
      }
    } else if (entry.feature_name.startsWith('symptom_')) {
      const symId = entry.feature_name.replace('symptom_', '');
      const hasSym = sample.some(r => (r.symptoms || []).some(s => s.symptom_id === symId));
      if (hasSym) {
        availableFeatures.push(entry.feature_name);
      } else {
        derivedFeatures.push(entry.feature_name); // Validly derived as 0.0 severity if absent
      }
    } else if (entry.feature_name.startsWith('vaccination_')) {
      availableFeatures.push(entry.feature_name);
    } else if (entry.feature_name.startsWith('season_')) {
      availableFeatures.push(entry.feature_name);
    } else {
      // Numerical
      if (entry.feature_name === 'herd_attack_rate' || entry.feature_name === 'mortality_rate' || entry.feature_name === 'nearby_case_proximity') {
        derivedFeatures.push(entry.feature_name);
      } else {
        availableFeatures.push(entry.feature_name);
      }
    }
  }

  return {
    totalExpectedFeatures,
    availableFeatures,
    missingFeatures,
    derivedFeatures,
    excludedFeatures,
    featureDictionary: MASTER_FEATURE_DICTIONARY
  };
}
