import {
  ModelRegistryRecord,
  CompleteModelPackage,
  ModelLifecycleStatus,
  VeterinaryReview,
  MODEL_VERSION_V1,
  MODEL_VERSION_V2,
  FEATURE_SCHEMA_VERSION_V1,
  FEATURE_SCHEMA_VERSION_V2
} from '../ml/types';
import { TRAINED_MODEL_PACKAGE as V1_PACKAGE } from '../models/livestock_disease_model';
import { RandomForestClassifier } from '../ml/classifier';

const MODEL_REGISTRY_STORAGE_KEY = 'lg_model_registry_records';
const ACTIVE_MODEL_ID_KEY = 'lg_active_production_model_id';

function createDefaultBaselineModel(): ModelRegistryRecord {
  return {
    model_id: 'model_v1_baseline',
    model_version: MODEL_VERSION_V1,
    model_type: 'RANDOM_FOREST_CLASSIFIER',
    dataset_id: 'ds_benchmark_prototype_v1',
    dataset_name: 'Synthetic Development Benchmark Dataset',
    feature_schema_version: FEATURE_SCHEMA_VERSION_V1,
    training_date: V1_PACKAGE.metadata.trainingTimestamp,
    training_records: V1_PACKAGE.metadata.totalTrainingSamples,
    disease_classes: V1_PACKAGE.targetClasses || ['dis_fmd', 'dis_ppr', 'dis_lsd', 'dis_anthrax', 'dis_bq', 'dis_hs', 'dis_mastitis', 'dis_avian_flu', 'dis_other_healthy'],
    metrics: V1_PACKAGE.evaluationMetrics,
    artifact_reference: 'src/models/livestock_disease_model/index.ts',
    package: V1_PACKAGE,
    status: 'PRODUCTION', // Active initial baseline
    created_by: 'System Initializer',
    audit_trail: [
      {
        action: 'INITIALIZED_AS_BASELINE',
        user: 'System',
        timestamp: new Date().toISOString(),
        notes: 'Baseline prototype model loaded from compiled artifacts.'
      }
    ]
  };
}

export interface ValidationGateResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
}

/**
 * Enterprise Model Registry & Lifecycle Governance Service
 */
export class ModelRegistryService {
  private registry: ModelRegistryRecord[] = [];
  private activeModelId: string = 'model_v1_baseline';

  constructor() {
    this.initializeRegistry();
  }

  private initializeRegistry(): void {
    try {
      const stored = localStorage.getItem(MODEL_REGISTRY_STORAGE_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_MODEL_ID_KEY);

      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify that records have packages attached
          this.registry = parsed.map((m: ModelRegistryRecord) => {
            if (!m.package || !m.disease_classes || !m.metrics) {
              return createDefaultBaselineModel();
            }
            return m;
          });
        } else {
          this.registry = [createDefaultBaselineModel()];
          this.saveRegistry();
        }
      } else {
        this.registry = [createDefaultBaselineModel()];
        this.saveRegistry();
      }

      if (storedActiveId && this.registry.some(m => m.model_id === storedActiveId)) {
        this.activeModelId = storedActiveId;
      } else {
        const prodModel = this.registry.find(m => m.status === 'PRODUCTION');
        this.activeModelId = prodModel ? prodModel.model_id : (this.registry[0]?.model_id || 'model_v1_baseline');
      }
    } catch (e) {
      console.warn('Failed to load model registry from localStorage', e);
      this.registry = [createDefaultBaselineModel()];
    }
  }

  private saveRegistry(): void {
    try {
      localStorage.setItem(MODEL_REGISTRY_STORAGE_KEY, JSON.stringify(this.registry));
      localStorage.setItem(ACTIVE_MODEL_ID_KEY, this.activeModelId);
    } catch (e) {
      console.warn('Failed to save model registry to localStorage', e);
    }
  }

  /**
   * Get all registered models
   */
  public listModels(): ModelRegistryRecord[] {
    if (!this.registry || !Array.isArray(this.registry) || this.registry.length === 0) {
      this.registry = [createDefaultBaselineModel()];
    }
    return Array.isArray(this.registry) ? [...this.registry] : [createDefaultBaselineModel()];
  }

  /**
   * Get currently active production model record
   */
  public getActiveModel(): ModelRegistryRecord {
    if (!this.registry || !Array.isArray(this.registry) || this.registry.length === 0) {
      this.registry = [createDefaultBaselineModel()];
    }
    const active = this.registry.find(m => m.model_id === this.activeModelId);
    if (active && active.package) return active;
    const prod = this.registry.find(m => m.status === 'PRODUCTION');
    if (prod && prod.package) return prod;
    return this.registry[0] || createDefaultBaselineModel();
  }

  /**
   * Get Model by ID
   */
  public getModelById(modelId: string): ModelRegistryRecord | undefined {
    return this.registry.find(m => m.model_id === modelId);
  }

  /**
   * Model Validation Gate: Enforces strict criteria before a model can become PRODUCTION_CANDIDATE
   */
  public evaluateValidationGate(pkg: CompleteModelPackage): ValidationGateResult {
    const checks = [
      {
        name: 'Label Quality Criteria',
        passed: pkg.dataQualityReport.rejectedRecords < pkg.dataQualityReport.totalRecordsChecked * 0.95,
        details: `Clean records: ${pkg.dataQualityReport.validRecords}, Rejected: ${pkg.dataQualityReport.rejectedRecords}`
      },
      {
        name: 'Data Leakage Protection',
        passed: pkg.dataQualityReport.dataLeakageViolations === 0,
        details: `${pkg.dataQualityReport.dataLeakageViolations} leakage violations detected.`
      },
      {
        name: 'Biological Species Consistency',
        passed: pkg.dataQualityReport.speciesContradictionCount === 0,
        details: `${pkg.dataQualityReport.speciesContradictionCount} biological host violations found.`
      },
      {
        name: 'Evaluation Metrics Calculated',
        passed: pkg.evaluationMetrics.accuracy > 0.4 && pkg.evaluationMetrics.macroF1 > 0.3,
        details: `Accuracy: ${(pkg.evaluationMetrics.accuracy * 100).toFixed(1)}%, Macro F1: ${(pkg.evaluationMetrics.macroF1 * 100).toFixed(1)}%`
      },
      {
        name: 'Confusion Matrix Generated',
        passed: Boolean(pkg.evaluationMetrics?.confusionMatrix && (pkg.evaluationMetrics.confusionMatrix.matrix || []).length > 0),
        details: `Matrix dimension: ${(pkg.evaluationMetrics?.confusionMatrix?.classes || []).length}x${(pkg.evaluationMetrics?.confusionMatrix?.classes || []).length}`
      },
      {
        name: 'Inference Deserialization Test',
        passed: this.testInferenceExecution(pkg),
        details: 'Model artifact successfully instantiated and verified on dummy test vector.'
      }
    ];

    const passed = checks.every(c => c.passed);
    return { passed, checks };
  }

  private testInferenceExecution(pkg: CompleteModelPackage): boolean {
    try {
      const clf = RandomForestClassifier.deserialize(pkg.model as any);
      const featureCount = (pkg.preprocessor?.featureNames || []).length;
      const dummyVector = new Array(featureCount).fill(0);
      const probs = clf.predictProbabilities(dummyVector);
      const sum = probs.reduce((a, b) => a + b, 0);
      return Math.abs(sum - 1.0) < 0.05;
    } catch {
      return false;
    }
  }

  /**
   * Register a newly trained model package into the registry
   */
  public registerModel(
    pkg: CompleteModelPackage,
    datasetId: string,
    datasetName: string,
    createdBy: string
  ): { success: boolean; modelId?: string; gateResult: ValidationGateResult; message?: string } {
    const gateResult = this.evaluateValidationGate(pkg);

    const modelId = `model_${pkg.metadata.modelVersion.replace(/-/g, '_')}_${Date.now().toString(36)}`;
    const status: ModelLifecycleStatus = gateResult.passed ? 'PENDING_REVIEW' : 'VALIDATION';

    const record: ModelRegistryRecord = {
      model_id: modelId,
      model_version: pkg.metadata.modelVersion,
      model_type: pkg.metadata.modelType,
      dataset_id: datasetId,
      dataset_name: datasetName,
      feature_schema_version: pkg.metadata.featureSchemaVersion,
      training_date: pkg.metadata.trainingTimestamp,
      training_records: pkg.metadata.totalTrainingSamples,
      disease_classes: pkg.targetClasses,
      metrics: pkg.evaluationMetrics,
      artifact_reference: `in-memory://model_registry/${modelId}`,
      package: pkg,
      status,
      created_by: createdBy,
      audit_trail: [
        {
          action: 'MODEL_REGISTERED',
          user: createdBy,
          timestamp: new Date().toISOString(),
          notes: `Validation Gate ${gateResult.passed ? 'PASSED' : 'FLAGGED'}. Status set to ${status}.`
        }
      ]
    };

    this.registry.unshift(record);
    this.saveRegistry();

    return {
      success: true,
      modelId,
      gateResult,
      message: gateResult.passed
        ? 'Model passed validation gates and is submitted for Veterinary Review.'
        : 'Model registered with warnings; requires validation review.'
    };
  }

  /**
   * Submit Veterinary Review Sign-Off
   */
  public submitVeterinaryReview(
    modelId: string,
    review: Omit<VeterinaryReview, 'reviewId' | 'modelId' | 'modelVersion' | 'reviewDate'>
  ): boolean {
    const model = this.registry.find(m => m.model_id === modelId);
    if (!model) return false;

    const fullReview: VeterinaryReview = {
      reviewId: `vrev_${Date.now()}`,
      modelId,
      modelVersion: model.model_version,
      reviewDate: new Date().toISOString(),
      ...review
    };

    model.veterinary_review = fullReview;
    if (review.decision === 'APPROVED') {
      model.status = 'PRODUCTION_CANDIDATE';
    } else if (review.decision === 'REJECTED') {
      model.status = 'RETIRED';
    }

    model.audit_trail.push({
      action: `VETERINARY_REVIEW_${review.decision}`,
      user: review.reviewedBy,
      timestamp: new Date().toISOString(),
      notes: review.comments
    });

    this.saveRegistry();
    return true;
  }

  /**
   * Promote a PRODUCTION_CANDIDATE to Active PRODUCTION Model
   */
  public promoteToProduction(modelId: string, adminUser: string): boolean {
    const targetModel = this.registry.find(m => m.model_id === modelId);
    if (!targetModel) return false;

    // Archive / Demote previous production model
    for (const m of this.registry) {
      if (m.status === 'PRODUCTION') {
        m.status = m.model_id === 'model_v1_baseline' ? 'DEVELOPMENT' : 'VALIDATION';
        m.audit_trail.push({
          action: 'DEMOTED_FROM_PRODUCTION',
          user: adminUser,
          timestamp: new Date().toISOString(),
          notes: `Replaced by ${targetModel.model_version} (${targetModel.model_id})`
        });
      }
    }

    targetModel.status = 'PRODUCTION';
    targetModel.approved_by = adminUser;
    targetModel.approval_date = new Date().toISOString();
    targetModel.audit_trail.push({
      action: 'PROMOTED_TO_PRODUCTION',
      user: adminUser,
      timestamp: new Date().toISOString(),
      notes: 'Active production screening model updated.'
    });

    this.activeModelId = modelId;
    this.saveRegistry();
    return true;
  }

  /**
   * Roll Back Active Production Model (e.g. Back to V1 Baseline)
   */
  public rollbackToModel(modelId: string, adminUser: string, reason: string): boolean {
    const targetModel = this.registry.find(m => m.model_id === modelId);
    if (!targetModel) return false;

    // Demote current
    const current = this.registry.find(m => m.model_id === this.activeModelId);
    if (current && current.model_id !== modelId) {
      current.status = 'RETIRED';
      current.audit_trail.push({
        action: 'ROLLED_BACK',
        user: adminUser,
        timestamp: new Date().toISOString(),
        notes: `Rolled back to ${targetModel.model_version}. Reason: ${reason}`
      });
    }

    targetModel.status = 'PRODUCTION';
    targetModel.audit_trail.push({
      action: 'RESTORED_TO_PRODUCTION',
      user: adminUser,
      timestamp: new Date().toISOString(),
      notes: `Restored as active production model. Reason: ${reason}`
    });

    this.activeModelId = modelId;
    this.saveRegistry();
    return true;
  }
}

export const modelRegistryService = new ModelRegistryService();
