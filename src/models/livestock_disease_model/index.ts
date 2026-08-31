import { MLTrainingPipeline, getSafeFallbackPackage } from '../../ml/trainPipeline';
import { CompleteModelPackage } from '../../ml/types';

// Safely run and compile the certified model package without risking app crash
let packageInstance: CompleteModelPackage;
try {
  packageInstance = MLTrainingPipeline.runTrainingPipeline();
} catch (err: any) {
  console.error('[Model Init] Failed to initialize model package, using safe fallback:', err);
  packageInstance = getSafeFallbackPackage(
    undefined,
    `ML training unavailable: ${err?.message || 'Model initialization failure'}`
  );
}

export const TRAINED_MODEL_PACKAGE: CompleteModelPackage = packageInstance;
export const MODEL_METADATA = TRAINED_MODEL_PACKAGE.metadata;
export const EVALUATION_METRICS = TRAINED_MODEL_PACKAGE.evaluationMetrics;
export const DATA_QUALITY_REPORT = TRAINED_MODEL_PACKAGE.dataQualityReport;
export const PREPROCESSOR_CONFIG = TRAINED_MODEL_PACKAGE.preprocessor;
export const TARGET_CLASSES = TRAINED_MODEL_PACKAGE.targetClasses;
export const SERIALIZED_MODEL = TRAINED_MODEL_PACKAGE.model;
