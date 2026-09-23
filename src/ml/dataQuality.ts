import { DatasetRecord, DataQualityReport, RejectionAuditRecord } from './types';
import { DISEASES_DATABASE } from '../data/knowledgeBase';
import { PredictionTimeFeaturePolicy } from './leakagePolicy';
import { normalizeDatasetRecord } from './schemaNormalizer';
import { TARGET_11_DISEASE_CLASSES } from './controlledVocabularies';

/**
 * Enterprise Data Quality Validator for Real-World Livestock Health Data
 * Implements strict multi-field validation, impossible value detection,
 * leakage prevention, and granular rejection audit logging.
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
    const seenContentSignatures = new Set<string>();
    const rejectionAuditLog: RejectionAuditRecord[] = [];
    const unmappedDiseaseLabelsSet = new Set<string>();

    let duplicateCount = 0;
    let speciesContradictionCount = 0;
    let missingTargetCount = 0;
    let outOfRangeCount = 0;
    let dataLeakageViolations = 0;
    let missingSpeciesCount = 0;
    let missingDiseaseLabelCount = 0;
    let unmappedDiseaseCount = 0;
    let invalidSymptomFormatCount = 0;
    let missingRequiredFieldsCount = 0;
    let invalidAgeCount = 0;
    let invalidVaccinationCount = 0;
    let schemaMismatchCount = 0;

    const rejectionReasons: Record<string, number> = {
      'Missing species': 0,
      'Missing disease label': 0,
      'Unmapped disease label (excluded from 11-class model)': 0,
      'Invalid symptom format': 0,
      'Missing required fields': 0,
      'Impossible or negative animal counts': 0,
      'Impossible temperature value': 0,
      'Malformed geographic coordinates': 0,
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
          unmappedDiseaseCount: 0,
          unmappedDiseaseLabels: [],
          invalidSymptomFormatCount: 0,
          missingRequiredFieldsCount: 0,
          invalidAgeCount: 0,
          invalidVaccinationCount: 0,
          schemaMismatchCount: 0,
          rejectionReasons,
          rejectionAuditLog: [],
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
        rejectionAuditLog.push({
          recordId: `row_${idx}`,
          rejectionReason: `Schema normalization failure: ${err?.message || 'Invalid row object'}`,
          validationRule: 'RULE_SCHEMA_NORMALIZATION',
          originalValue: rawItem
        });
        anomalies.push({
          record_id: `row_${idx}`,
          reason: `Schema normalization failure: ${err?.message || 'Invalid row object'}`,
          severity: 'ERROR'
        });
        return;
      }

      const recId = record.record_id || `row_${idx}`;

      // 1. REQUIRED FIELD CHECK: Species
      if (!record.species || record.species.trim() === '') {
        missingSpeciesCount++;
        missingRequiredFieldsCount++;
        rejectionReasons['Missing species']++;
        rejectionReasons['Missing required fields']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: 'Missing required field: species',
          validationRule: 'RULE_REQUIRED_SPECIES',
          originalValue: record.species
        });
        anomalies.push({
          record_id: recId,
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
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: 'Invalid or empty symptoms list: at least one symptom is strictly required for ML screening',
          validationRule: 'RULE_REQUIRED_SYMPTOMS',
          originalValue: record.symptoms
        });
        anomalies.push({
          record_id: recId,
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
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: 'Missing required field: disease_label',
          validationRule: 'RULE_REQUIRED_TARGET_LABEL',
          originalValue: record.disease_label
        });
        anomalies.push({
          record_id: recId,
          reason: 'Missing required field: confirmedDisease / disease_label',
          severity: 'ERROR'
        });
        return;
      }

      // 4. UNMAPPED DISEASE CHECK: Exclude unmapped diseases from 11-class model
      if (record.is_unmapped_disease || !TARGET_11_DISEASE_CLASSES.includes(record.disease_label as any)) {
        unmappedDiseaseCount++;
        rejectionReasons['Unmapped disease label (excluded from 11-class model)']++;
        const unmappedName = record.original_disease_label || record.disease_label;
        unmappedDiseaseLabelsSet.add(unmappedName);
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: record.unmapped_reason || `Disease label '${unmappedName}' does not map to canonical 11-class schema`,
          validationRule: 'RULE_CANONICAL_11_DISEASE_CLASSES',
          originalValue: unmappedName
        });
        anomalies.push({
          record_id: recId,
          reason: `Unmapped disease label '${unmappedName}': preserved original label but excluded from 11-class training set`,
          severity: 'WARNING'
        });
        return;
      }

      // 5. DUPLICATE CHECK: Exact ID and Near-Duplicate Content
      if (record.record_id && seenRecordIds.has(record.record_id)) {
        duplicateCount++;
        rejectionReasons['Duplicate record']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: 'Duplicate primary record_id',
          validationRule: 'RULE_UNIQUE_RECORD_ID',
          originalValue: record.record_id
        });
        anomalies.push({
          record_id: recId,
          reason: 'Duplicate primary record_id',
          severity: 'WARNING'
        });
        return;
      }
      if (record.record_id) seenRecordIds.add(record.record_id);

      // Near-duplicate check: Same farm/animal + date + species + symptoms + disease
      const sortedSymptoms = (record.symptoms || []).map(s => s.symptom_id).sort().join('_');
      const sigKey = `${record.farm_id || record.animal_id || 'unf'}_${record.species}_${record.disease_label}_${sortedSymptoms}_${record.diagnosis_date || record.observation_date || ''}`;
      if (seenContentSignatures.has(sigKey)) {
        duplicateCount++;
        rejectionReasons['Duplicate record']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: 'Near-duplicate epidemiological record detected with identical host, symptoms, location, and date',
          validationRule: 'RULE_NEAR_DUPLICATE_DETECTION',
          originalValue: sigKey
        });
        anomalies.push({
          record_id: recId,
          reason: 'Near-duplicate epidemiological record detected with identical clinical profile',
          severity: 'WARNING'
        });
        return;
      }
      seenContentSignatures.add(sigKey);

      // 6. IMPOSSIBLE / CONTRADICTORY VALUES CHECK
      const herdSize = record.total_animals ?? record.herd_size ?? 1;
      const affected = record.affected_animals ?? 0;
      const dead = record.mortality ?? record.dead_count ?? 0;

      if (affected < 0 || dead < 0 || herdSize < 0) {
        outOfRangeCount++;
        rejectionReasons['Impossible or negative animal counts']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: 'Negative animal count values detected',
          validationRule: 'RULE_NON_NEGATIVE_COUNTS',
          originalValue: { affected, dead, herdSize }
        });
        anomalies.push({
          record_id: recId,
          reason: 'Negative animal counts detected',
          severity: 'ERROR'
        });
        return;
      }

      if (affected > herdSize && herdSize > 0) {
        // Auto-correct herd size to match affected animals
        record.total_animals = affected;
        record.herd_size = affected;
        anomalies.push({
          record_id: recId,
          reason: `Affected animals (${affected}) exceeded herd size (${herdSize}); auto-adjusted herd size`,
          severity: 'WARNING'
        });
      }

      if (dead > (record.total_animals ?? 1)) {
        outOfRangeCount++;
        rejectionReasons['Impossible or negative animal counts']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: `Mortality count (${dead}) cannot exceed total herd size (${record.total_animals})`,
          validationRule: 'RULE_MORTALITY_WITHIN_HERD',
          originalValue: { dead, total: record.total_animals }
        });
        anomalies.push({
          record_id: recId,
          reason: 'Mortality count exceeds total herd size',
          severity: 'ERROR'
        });
        return;
      }

      // Temperature sanity check
      if (record.temperature !== undefined && (record.temperature < -30 || record.temperature > 60)) {
        outOfRangeCount++;
        rejectionReasons['Impossible temperature value']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: `Impossible ambient temperature (${record.temperature}°C)`,
          validationRule: 'RULE_TEMPERATURE_RANGE',
          originalValue: record.temperature
        });
        anomalies.push({
          record_id: recId,
          reason: 'Impossible ambient temperature value outside [-30, 60]°C',
          severity: 'ERROR'
        });
        return;
      }

      // Geographic coordinate validation
      if (record.latitude !== undefined && (record.latitude < -90 || record.latitude > 90)) {
        rejectionReasons['Malformed geographic coordinates']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: `Malformed latitude: ${record.latitude}`,
          validationRule: 'RULE_GEOGRAPHIC_BOUNDS',
          originalValue: record.latitude
        });
        return;
      }
      if (record.longitude !== undefined && (record.longitude < -180 || record.longitude > 180)) {
        rejectionReasons['Malformed geographic coordinates']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: `Malformed longitude: ${record.longitude}`,
          validationRule: 'RULE_GEOGRAPHIC_BOUNDS',
          originalValue: record.longitude
        });
        return;
      }

      // 7. Label Quality & Source Tracking
      const labelQuality = record.label_quality || 'VALIDATED';
      labelQualityDistribution[labelQuality] = (labelQualityDistribution[labelQuality] || 0) + 1;

      // Filter by allowed label quality if restricted
      if (allowedLabelQualities.length > 0 && !allowedLabelQualities.includes(labelQuality)) {
        rejectionReasons['Disallowed label quality']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: `Label quality '${labelQuality}' not permitted in active training filter`,
          validationRule: 'RULE_ALLOWED_LABEL_QUALITY',
          originalValue: labelQuality
        });
        anomalies.push({
          record_id: recId,
          reason: `Label quality '${labelQuality}' not permitted in active training filter`,
          severity: 'WARNING'
        });
        return;
      }

      // 8. OPTIONAL FIELDS: Handle missing or out-of-range values with safe defaults (DO NOT REJECT)
      if (record.age_years !== undefined && (record.age_years < 0 || record.age_years > 35)) {
        invalidAgeCount++;
        record.age_years = 3; // Safe default for ruminants/livestock
        anomalies.push({
          record_id: recId,
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

      // 9. Species-Disease Biological Compatibility Check
      const allowedSpecies = diseaseSpeciesMap[record.disease_label];
      if (allowedSpecies && !allowedSpecies.includes(record.species) && !allowedSpecies.includes('Other')) {
        speciesContradictionCount++;
        rejectionReasons['Species-disease biological contradiction']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: `Species '${record.species}' is not a known biological host for '${record.disease_label}'`,
          validationRule: 'RULE_SPECIES_DISEASE_BIOLOGICAL_COMPATIBILITY',
          originalValue: { species: record.species, disease: record.disease_label }
        });
        anomalies.push({
          record_id: recId,
          reason: `Species ${record.species} is not a known biological host for ${record.disease_label}`,
          severity: 'ERROR'
        });
        return;
      }

      // 10. Data Leakage Inspection
      const leakageIssues = PredictionTimeFeaturePolicy.inspectRecordForLeakage(record);
      if (leakageIssues.length > 0) {
        dataLeakageViolations++;
        rejectionReasons['Data leakage violation']++;
        rejectionAuditLog.push({
          recordId: recId,
          rejectionReason: `Data leakage detected: ${leakageIssues.join('; ')}`,
          validationRule: 'RULE_ZERO_DATA_LEAKAGE',
          originalValue: leakageIssues
        });
        anomalies.push({
          record_id: recId,
          reason: `Data leakage detected: ${leakageIssues.join('; ')}`,
          severity: 'ERROR'
        });
        return;
      }

      // Record is clean, validated, and approved for training
      cleanRecords.push(record);
      classDistribution[record.disease_label] = (classDistribution[record.disease_label] || 0) + 1;
    });

    const rejectedRecords = records.length - cleanRecords.length;

    if (duplicateCount > 0) notes.push(`Filtered ${duplicateCount} duplicate or near-duplicate records.`);
    if (speciesContradictionCount > 0) notes.push(`Rejected ${speciesContradictionCount} records violating biological species-disease constraints.`);
    if (missingTargetCount > 0) notes.push(`Rejected ${missingTargetCount} records with missing disease target label.`);
    if (unmappedDiseaseCount > 0) notes.push(`Excluded ${unmappedDiseaseCount} unmapped disease records from 11-class model.`);
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
      unmappedDiseaseCount,
      unmappedDiseaseLabels: Array.from(unmappedDiseaseLabelsSet),
      invalidSymptomFormatCount,
      missingRequiredFieldsCount,
      invalidAgeCount,
      invalidVaccinationCount,
      schemaMismatchCount,
      rejectionReasons,
      rejectionAuditLog,
      classDistribution,
      labelQualityDistribution,
      isDatasetClean: cleanRecords.length > 0 && speciesContradictionCount === 0 && missingTargetCount === 0 && dataLeakageViolations === 0,
      notes,
      anomalies: anomalies.slice(0, 50)
    };

    return { cleanRecords, report };
  }
}

