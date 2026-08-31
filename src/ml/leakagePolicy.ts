import { DatasetRecord, FeatureAvailability } from './types';
import { DATASET_SCHEMA_FIELDS, LEAKAGE_FORBIDDEN_FIELDS } from './datasetSchema';

export interface LeakageCheckResult {
  hasLeakage: boolean;
  violations: string[];
  safeFeatures: string[];
}

/**
 * Prediction-Time Feature Policy & Leakage Prevention Guard
 */
export class PredictionTimeFeaturePolicy {
  /**
   * Verifies that candidate feature keys adhere strictly to AVAILABLE_AT_PREDICTION
   */
  public static validateFeatureSet(featureKeys: string[]): LeakageCheckResult {
    const violations: string[] = [];
    const safeFeatures: string[] = [];

    for (const key of featureKeys) {
      if (LEAKAGE_FORBIDDEN_FIELDS.includes(key)) {
        violations.push(`Forbidden target/post-diagnosis field: '${key}'`);
        continue;
      }

      // Check schema field definition if exists
      const fieldDef = DATASET_SCHEMA_FIELDS[key];
      if (fieldDef && fieldDef.availability === 'POST_DIAGNOSIS') {
        violations.push(`Field '${key}' has policy status POST_DIAGNOSIS and cannot be an ML feature.`);
        continue;
      }

      // Prefix check for symptoms/species/numerical
      if (
        key.startsWith('symptom_') ||
        key.startsWith('species_') ||
        key.startsWith('vaccination_') ||
        key.startsWith('season_') ||
        key.startsWith('temp_') ||
        key === 'temperature' ||
        key === 'humidity' ||
        key === 'rainfall' ||
        key === 'herd_attack_rate' ||
        key === 'mortality_rate' ||
        key === 'nearby_case_proximity' ||
        key === 'symptom_duration_days'
      ) {
        safeFeatures.push(key);
      } else {
        safeFeatures.push(key);
      }
    }

    return {
      hasLeakage: violations.length > 0,
      violations,
      safeFeatures
    };
  }

  /**
   * Checks a raw record for post-diagnosis values being improperly injected into symptom features
   */
  public static inspectRecordForLeakage(record: DatasetRecord): string[] {
    const issues: string[] = [];

    // Check if lab results are present in symptom list
    if (record.symptoms) {
      for (const s of record.symptoms) {
        if (s.symptom_id.includes('pcr_positive') || s.symptom_id.includes('elisa_positive')) {
          issues.push(`Record ${record.record_id}: Lab outcome symptom '${s.symptom_id}' leaked into symptom observations.`);
        }
      }
    }

    return issues;
  }
}
