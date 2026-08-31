import { DataQualityValidator } from './dataQuality';
import { FeaturePreprocessor } from './preprocessor';
import { RandomForestClassifier } from './classifier';
import { ModelEvaluator } from './evaluate';
import { BenchmarkDatasetGenerator } from './datasetGenerator';
import {
  RawHealthRecord,
  CompleteModelPackage,
  DataQualityReport,
  MODEL_VERSION,
  FEATURE_SCHEMA_VERSION
} from './types';

export const TARGET_CLASSES = [
  'dis_fmd',
  'dis_lsd',
  'dis_ppr',
  'dis_hs',
  'dis_anthrax',
  'dis_bq',
  'dis_brucellosis',
  'dis_mastitis',
  'dis_asf',
  'dis_avian_flu',
  'dis_other_healthy'
];

/**
 * Creates a safe fallback CompleteModelPackage when training cannot proceed.
 */
export function getSafeFallbackPackage(
  report?: DataQualityReport,
  reason: string = 'ML training unavailable: insufficient valid training data.'
): CompleteModelPackage {
  const dummyPreprocessor = new FeaturePreprocessor();
  const safeReport: DataQualityReport = report || {
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
    rejectionReasons: {
      'Missing species': 0,
      'Missing disease label': 0,
      'Invalid symptom format': 0,
      'Missing required fields': 0,
      'Invalid age': 0,
      'Invalid vaccination value': 0,
      'Schema mismatch': 0
    },
    classDistribution: {},
    labelQualityDistribution: {},
    isDatasetClean: false,
    notes: [reason]
  };

  const emptyEvaluator = ModelEvaluator.getEmptyMetrics(TARGET_CLASSES);

  // Return a safe un-trained model package that will not crash
  return {
    metadata: {
      modelVersion: MODEL_VERSION,
      featureSchemaVersion: FEATURE_SCHEMA_VERSION,
      modelType: 'RANDOM_FOREST_CLASSIFIER',
      status: 'UNAVAILABLE',
      trainingTimestamp: new Date().toISOString(),
      trainingDatasetVersion: 'fallback-unavailable',
      totalTrainingSamples: 0,
      numClasses: TARGET_CLASSES.length,
      datasetDisclaimer: reason,
      dataProvenanceType: 'BENCHMARK_PROTOTYPE',
      trained: false,
      reason
    },
    evaluationMetrics: emptyEvaluator,
    dataQualityReport: safeReport,
    preprocessor: dummyPreprocessor.getConfig(),
    targetClasses: TARGET_CLASSES,
    model: {
      modelType: 'RANDOM_FOREST_CLASSIFIER',
      modelVersion: MODEL_VERSION,
      featureSchemaVersion: FEATURE_SCHEMA_VERSION,
      targetClasses: TARGET_CLASSES,
      trees: [],
      featureImportances: new Array(dummyPreprocessor.getConfig().featureNames.length).fill(0),
      classPriors: new Array(TARGET_CLASSES.length).fill(1 / TARGET_CLASSES.length),
      hyperparameters: {
        numTrees: 0,
        maxDepth: 0,
        minSamplesSplit: 0
      }
    }
  };
}

/**
 * End-to-End Machine Learning Training & Serialization Pipeline
 */
export class MLTrainingPipeline {
  public static runTrainingPipeline(rawRecords?: RawHealthRecord[]): CompleteModelPackage {
    try {
      console.log('[ML Pipeline] Starting Livestock Disease ML Training Pipeline...');

      // 1. Load / Acquire Dataset
      const dataset = rawRecords || BenchmarkDatasetGenerator.generatePrototypeDataset();
      console.log(`[ML Pipeline] Loaded ${dataset ? dataset.length : 0} raw records.`);

      if (!dataset || !Array.isArray(dataset) || dataset.length === 0) {
        console.warn('[ML Pipeline] ML training unavailable: input dataset is empty or undefined.');
        return getSafeFallbackPackage(undefined, 'ML training unavailable: input dataset is empty or undefined.');
      }

      // 2. Data Quality Validation
      const { cleanRecords, report } = DataQualityValidator.validateDataset(dataset);
      console.log(`[ML Pipeline] Data Quality: ${cleanRecords ? cleanRecords.length : 0} clean records (${report ? report.rejectedRecords : 0} rejected).`);

      // 3. Strict Dataset Guards
      if (!cleanRecords || !Array.isArray(cleanRecords) || cleanRecords.length === 0) {
        console.warn(`[ML Pipeline] ML training unavailable: dataset validation produced 0 valid records.`);
        console.warn(`Total records: ${dataset.length}`);
        console.warn(`Valid records: 0`);
        console.warn(`Rejected records: ${report.rejectedRecords}`);
        console.warn(`Rejection reasons:`);
        console.warn(`  - Missing species: ${report.missingSpeciesCount || 0}`);
        console.warn(`  - Missing disease label: ${report.missingDiseaseLabelCount || 0}`);
        console.warn(`  - Invalid symptom format: ${report.invalidSymptomFormatCount || 0}`);
        console.warn(`  - Missing required fields: ${report.missingRequiredFieldsCount || 0}`);
        console.warn(`  - Invalid age: ${report.invalidAgeCount || 0}`);
        console.warn(`  - Invalid vaccination value: ${report.invalidVaccinationCount || 0}`);
        console.warn(`  - Schema mismatch: ${report.schemaMismatchCount || 0}`);
        
        return getSafeFallbackPackage(report, 'ML training unavailable: dataset validation produced 0 valid records.');
      }

      // Check disease class diversity: at least 2 distinct classes required
      const distinctClasses = Array.from(new Set(cleanRecords.map(r => r.disease_label).filter(Boolean)));
      if (distinctClasses.length < 2) {
        console.warn(`[ML Pipeline] ML training unavailable: at least 2 disease classes required, found ${distinctClasses.length}.`);
        return getSafeFallbackPackage(report, `ML training unavailable: at least 2 distinct disease classes are required for classification training (found ${distinctClasses.length}).`);
      }

      // 4. Stratified 80/20 Train/Test Split
      const trainRecords: RawHealthRecord[] = [];
      const testRecords: RawHealthRecord[] = [];

      // Group by class to stratify
      const classGroups: Record<string, RawHealthRecord[]> = {};
      for (const r of cleanRecords) {
        if (!classGroups[r.disease_label]) classGroups[r.disease_label] = [];
        classGroups[r.disease_label].push(r);
      }

      for (const [_, group] of Object.entries(classGroups)) {
        const shuffled = [...group].sort(() => Math.random() - 0.5);
        if (shuffled.length === 1) {
          trainRecords.push(shuffled[0]);
          testRecords.push(shuffled[0]); // evaluate on same sample if single-instance class
        } else {
          const splitIdx = Math.max(1, Math.floor(shuffled.length * 0.8));
          trainRecords.push(...shuffled.slice(0, splitIdx));
          testRecords.push(...shuffled.slice(splitIdx));
        }
      }

      console.log(`[ML Pipeline] Train split: ${trainRecords.length} | Test split: ${testRecords.length}`);

      // Strict split guard
      if (trainRecords.length === 0 || testRecords.length === 0) {
        console.warn('[ML Pipeline] ML training unavailable: train or test split is empty.');
        return getSafeFallbackPackage(report, 'ML training unavailable: train or test partition is empty.');
      }

      // 5. Feature Preprocessing & Standardization (Fitted strictly on trainRecords)
      const preprocessor = new FeaturePreprocessor();
      preprocessor.fit(trainRecords);

      const X_train = trainRecords.map(r => preprocessor.transformRecord(r));
      const y_train = trainRecords.map(r => {
        const idx = TARGET_CLASSES.indexOf(r.disease_label);
        return idx !== -1 ? idx : TARGET_CLASSES.indexOf('dis_other_healthy');
      });

      const X_test = testRecords.map(r => preprocessor.transformRecord(r));
      const y_test = testRecords.map(r => {
        const idx = TARGET_CLASSES.indexOf(r.disease_label);
        return idx !== -1 ? idx : TARGET_CLASSES.indexOf('dis_other_healthy');
      });

      // Strict feature matrix and label guards
      if (!X_train || X_train.length === 0 || !X_train[0] || X_train[0].length === 0 || !y_train || y_train.length === 0) {
        console.warn('[ML Pipeline] ML training unavailable: feature matrix or labels are empty.');
        return getSafeFallbackPackage(report, 'ML training unavailable: invalid feature matrix representation.');
      }

      // 6. Train Multi-Class Random Forest Model
      console.log('[ML Pipeline] Training Multi-Class Random Forest (25 trees, depth 7)...');
      const rf = new RandomForestClassifier(TARGET_CLASSES, 25, 7, 3);
      rf.fit(X_train, y_train);

      // 7. Evaluate Model on Holdout Test Partition
      console.log('[ML Pipeline] Evaluating predictions on test partition...');
      const testPredictions = X_test.map(x => rf.predictProbabilities(x));
      const evaluationMetrics = ModelEvaluator.evaluate(
        y_test,
        testPredictions,
        TARGET_CLASSES,
        'Stratified 80/20 Holdout Test'
      );

      console.log(`[ML Pipeline] Evaluation Metrics:
        Sample Accuracy: ${(evaluationMetrics.accuracy * 100).toFixed(1)}%
        Macro Precision: ${(evaluationMetrics.macroPrecision * 100).toFixed(1)}%
        Macro Recall:    ${(evaluationMetrics.macroRecall * 100).toFixed(1)}%
        Macro F1 Score:  ${(evaluationMetrics.macroF1 * 100).toFixed(1)}%
        Weighted F1:     ${(evaluationMetrics.weightedF1 * 100).toFixed(1)}%
        Log Loss:        ${evaluationMetrics.logLoss.toFixed(3)}
      `);

      // 8. Serialize Artifacts
      const modelArtifact = rf.serialize();
      const completePackage: CompleteModelPackage = {
        metadata: {
          modelVersion: MODEL_VERSION,
          featureSchemaVersion: FEATURE_SCHEMA_VERSION,
          modelType: 'RANDOM_FOREST_CLASSIFIER',
          status: 'PROTOTYPE',
          trainingTimestamp: new Date().toISOString(),
          trainingDatasetVersion: 'prototype-benchmark-v1.4',
          totalTrainingSamples: trainRecords.length,
          numClasses: TARGET_CLASSES.length,
          datasetDisclaimer: 'Prototype model trained on standardized benchmark records. Requires validation with real livestock clinical/laboratory data before production deployment.',
          dataProvenanceType: 'BENCHMARK_PROTOTYPE',
          trained: true
        },
        evaluationMetrics,
        dataQualityReport: report,
        preprocessor: preprocessor.getConfig(),
        targetClasses: TARGET_CLASSES,
        model: modelArtifact
      };

      return completePackage;
    } catch (err: any) {
      console.error('[ML Pipeline] Uncaught training error intercepted safely:', err);
      return getSafeFallbackPackage(
        undefined,
        `ML training unavailable: ${err?.message || 'Unexpected training pipeline failure'}`
      );
    }
  }
}
