import { DatasetRecord, DataQualityReport } from './types';
import { DISEASES_DATABASE } from '../data/knowledgeBase';
import { PredictionTimeFeaturePolicy } from './leakagePolicy';
import { normalizeDatasetRecord } from './schemaNormalizer';

/**
 * Enterprise Data Quality Validator for Real-World Livestock Health Data
 * Distinguishes strictly REQUIRED features from OPTIONAL features.
 */
export class DataQualityValidator {
  public static validateDataset(
    records: DatasetRecord[],
    allowedLabelQualities: string[] = ['GOLD_STANDARD', 'VALIDATED', 'PROVISIONAL', 'UNVERIFIED']
  ): {
    cleanRecords: DatasetRecord[];
    report: DataQualityReport;
  } {
    const cleanRecords: DatasetRecord[] = [];
    const classDistribution: Record<string, number> = {};
    const labelQualityDistribution: Record<string, number> = {};
    const seenRecordIds = new Set<string>();

    let duplicateCount = 0;
    let speciesContradictionCount = 0;
    let missingTargetCount = 0;
    let outOfRangeCount = 0;
    let dataLeakageViolations = 0;
    let missingSpeciesCount = 0;
    let missingDiseaseLabelCount = 0;
    let invalidSymptomFormatCount = 0;
    let missingRequiredFieldsCount = 0;
    let invalidAgeCount = 0;
    let invalidVaccinationCount = 0;
    let schemaMismatchCount = 0;

    const rejectionReasons: Record<string, number> = {
      'Missing species': 0,
      'Missing disease label': 0,
      'Invalid symptom format': 0,
      'Missing required fields': 0,
      'Invalid age': 0,
      'Invalid vaccination value': 0,
      'Schema mismatch': 0,
      'Species-disease biological contradiction': 0,
      'Data leakage violation': 0,
      'Duplicate record': 0,
      'Disallowed label quality': 0
    };

    const notes: string[] = [];
    const anomalies: { record_id: string; reason: string; severity: 'WARNING' | 'ERROR' }[] = [];

    if (!records || !Array.isArray(records) || records.length === 0) {
      return {
        cleanRecords: [],
        report: {
          totalRecordsChecked: 0,
          validRecords: 0,
          rejectedRecords: 0,
          duplicateCount: 0,
          speciesContradictionCount: 0,
          missingTargetCount: 0,
          outOfRangeCount: 0,
          dataLeakageViolations: 0,
          missingSpeciesCount: 0,
          missingDiseaseLabelCount: 0,
          invalidSymptomFormatCount: 0,
          missingRequiredFieldsCount: 0,
          invalidAgeCount: 0,
          invalidVaccinationCount: 0,
          schemaMismatchCount: 0,
          rejectionReasons,
          classDistribution: {},
          labelQualityDistribution: {},
          isDatasetClean: false,
          notes: ['Dataset validation received 0 records.'],
          anomalies: []
        }
      };
    }

    // Map of species constraints from disease knowledge base
    const diseaseSpeciesMap: Record<string, string[]> = {};
    for (const d of DISEASES_DATABASE) {
      diseaseSpeciesMap[d.id] = d.affectedSpecies;
    }
    // Allow dis_other_healthy for all species
    diseaseSpeciesMap['dis_other_healthy'] = [
      'Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Horse', 'Camel', 'Other'
    ];

    records.forEach((rawItem, idx) => {
      // Step 0: Apply schema normalization layer
      let record: DatasetRecord;
      try {
        record = normalizeDatasetRecord(rawItem, idx);
      } catch (err: any) {
        schemaMismatchCount++;
        rejectionReasons['Schema mismatch']++;
        anomalies.push({
          record_id: `row_${idx}`,
          reason: `Schema normalization failure: ${err?.message || 'Invalid row object'}`,
          severity: 'ERROR'
        });
        return;
      }

      // 1. REQUIRED FIELD CHECK: Species
      if (!record.species || record.species.trim() === '') {
        missingSpeciesCount++;
        missingRequiredFieldsCount++;
        rejectionReasons['Missing species']++;
        rejectionReasons['Missing required fields']++;
        anomalies.push({
          record_id: record.record_id || `row_${idx}`,
          reason: 'Missing required field: species',
          severity: 'ERROR'
        });
        return;
      }

      // 2. REQUIRED FIELD CHECK: Symptoms (at least one valid symptom)
      if (!record.symptoms || !Array.isArray(record.symptoms) || record.symptoms.length === 0) {
        invalidSymptomFormatCount++;
        missingRequiredFieldsCount++;
        rejectionReasons['Invalid symptom format']++;
        rejectionReasons['Missing required fields']++;
        anomalies.push({
          record_id: record.record_id || `row_${idx}`,
          reason: 'Invalid or empty symptoms list: at least one symptom is strictly required for ML screening',
          severity: 'ERROR'
        });
        return;
      }

      // 3. REQUIRED FIELD CHECK: Disease Target Label
      if (!record.disease_label || record.disease_label.trim() === '') {
        missingDiseaseLabelCount++;
        missingTargetCount++;
        missingRequiredFieldsCount++;
        rejectionReasons['Missing disease label']++;
        rejectionReasons['Missing required fields']++;
        anomalies.push({
          record_id: record.record_id || `row_${idx}`,
          reason: 'Missing required field: confirmedDisease / disease_label',
          severity: 'ERROR'
        });
        return;
      }

      // 4. Duplicate Record ID Check
      if (record.record_id && seenRecordIds.has(record.record_id)) {
        duplicateCount++;
        rejectionReasons['Duplicate record']++;
        anomalies.push({
          record_id: record.record_id,
          reason: 'Duplicate primary record_id',
          severity: 'WARNING'
        });
        // Deduplicate
        return;
      }
      if (record.record_id) seenRecordIds.add(record.record_id);

      // 5. Label Quality & Source Tracking
      const labelQuality = record.label_quality || 'VALIDATED';
      labelQualityDistribution[labelQuality] = (labelQualityDistribution[labelQuality] || 0) + 1;

      // Filter by allowed label quality if restricted
      if (allowedLabelQualities.length > 0 && !allowedLabelQualities.includes(labelQuality)) {
        rejectionReasons['Disallowed label quality']++;
        anomalies.push({
          record_id: record.record_id,
          reason: `Label quality '${labelQuality}' not permitted in active training filter`,
          severity: 'WARNING'
        });
        return;
      }

      // 6. OPTIONAL FIELDS: Handle missing or out-of-range values with safe defaults (DO NOT REJECT)
      if (record.age_years !== undefined && (record.age_years < 0 || record.age_years > 35)) {
        invalidAgeCount++;
        record.age_years = 3; // Safe default for ruminants/livestock
        anomalies.push({
          record_id: record.record_id,
          reason: 'Age out of biological range; auto-imputed safe default (3 years)',
          severity: 'WARNING'
        });
      }

      if (record.vaccination_status && !['UP_TO_DATE', 'OVERDUE', 'UNVACCINATED', 'UNKNOWN'].includes(record.vaccination_status)) {
        invalidVaccinationCount++;
        record.vaccination_status = 'UNKNOWN';
      }

      if (record.temperature !== undefined && (record.temperature < -20 || record.temperature > 55)) {
        record.temperature = 28;
      }
      if (record.humidity !== undefined && (record.humidity < 0 || record.humidity > 100)) {
        record.humidity = 65;
      }
      if (record.rainfall !== undefined && record.rainfall < 0) {
        record.rainfall = 0;
      }

      // 7. Species-Disease Biological Compatibility Check (Soft validation with fallback)
      const allowedSpecies = diseaseSpeciesMap[record.disease_label];
      if (allowedSpecies && !allowedSpecies.includes(record.species) && !allowedSpecies.includes('Other')) {
        speciesContradictionCount++;
        rejectionReasons['Species-disease biological contradiction']++;
        anomalies.push({
          record_id: record.record_id,
          reason: `Species ${record.species} is not a known biological host for ${record.disease_label}`,
          severity: 'ERROR'
        });
        return;
      }

      // 8. Data Leakage Inspection
      const leakageIssues = PredictionTimeFeaturePolicy.inspectRecordForLeakage(record);
      if (leakageIssues.length > 0) {
        dataLeakageViolations++;
        rejectionReasons['Data leakage violation']++;
        anomalies.push({
          record_id: record.record_id,
          reason: `Data leakage detected: ${leakageIssues.join('; ')}`,
          severity: 'ERROR'
        });
        return;
      }

      // Record is clean and validated
      cleanRecords.push(record);
      classDistribution[record.disease_label] = (classDistribution[record.disease_label] || 0) + 1;
    });

    const rejectedRecords = records.length - cleanRecords.length;

    if (duplicateCount > 0) notes.push(`Filtered ${duplicateCount} duplicate record IDs.`);
    if (speciesContradictionCount > 0) notes.push(`Rejected ${speciesContradictionCount} records violating biological species-disease constraints.`);
    if (missingTargetCount > 0) notes.push(`Rejected ${missingTargetCount} records with missing disease target label.`);
    if (missingSpeciesCount > 0) notes.push(`Rejected ${missingSpeciesCount} records with missing species.`);
    if (invalidSymptomFormatCount > 0) notes.push(`Rejected ${invalidSymptomFormatCount} records with missing or empty symptoms.`);
    if (dataLeakageViolations > 0) notes.push(`Rejected ${dataLeakageViolations} records due to data leakage violations.`);

    const report: DataQualityReport = {
      totalRecordsChecked: records.length,
      validRecords: cleanRecords.length,
      rejectedRecords,
      duplicateCount,
      speciesContradictionCount,
      missingTargetCount,
      outOfRangeCount,
      dataLeakageViolations,
      missingSpeciesCount,
      missingDiseaseLabelCount,
      invalidSymptomFormatCount,
      missingRequiredFieldsCount,
      invalidAgeCount,
      invalidVaccinationCount,
      schemaMismatchCount,
      rejectionReasons,
      classDistribution,
      labelQualityDistribution,
      isDatasetClean: cleanRecords.length > 0 && speciesContradictionCount === 0 && missingTargetCount === 0 && dataLeakageViolations === 0,
      notes,
      anomalies: anomalies.slice(0, 50)
    };

    return { cleanRecords, report };
  }
}
