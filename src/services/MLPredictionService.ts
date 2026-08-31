import {
  MLPredictionFeatureInput,
  MLPredictionResult,
  MLDiseasePrediction,
  MLModelMetadata
} from '../types';
import { DISEASES_DATABASE, SYMPTOMS_DATABASE } from '../data/knowledgeBase';
import { FeaturePreprocessor } from '../ml/preprocessor';
import { RandomForestClassifier } from '../ml/classifier';
import { modelRegistryService } from './ModelRegistry';
import { TARGET_CLASSES } from '../ml/trainPipeline';

/**
 * LIVESTOCKGUARD DYNAMIC MACHINE LEARNING PREDICTION SERVICE
 * 
 * Dynamically executes screening inference using the active production model registered in ModelRegistry.
 * Features:
 * 1. Dynamic Model Loading from ModelRegistry
 * 2. Preprocessor Synchronization with Model Feature Schema Version
 * 3. Graceful Fallback if Active Model is in maintenance or unavailable
 * 4. Calibrated Probability Distributions and Feature Importance Attribution
 * 5. Out-of-Distribution and Low-Confidence Input Safeguards
 */
export class MLPredictionService {
  private readonly confidenceThreshold = 0.28;

  /**
   * Resolve the active model and preprocessor dynamically
   */
  private getActivePipeline(): {
    preprocessor: FeaturePreprocessor;
    classifier: RandomForestClassifier;
    metadata: MLModelMetadata;
    targetClasses: string[];
    featureNames: string[];
    featureImportances: number[];
  } {
    const activeRecord = modelRegistryService.getActiveModel();
    const pkg = activeRecord.package;

    const preprocessor = new FeaturePreprocessor(pkg.preprocessor);
    const classifier = RandomForestClassifier.deserialize(pkg.model as any);

    const metadata: MLModelMetadata = {
      modelVersion: pkg.metadata.modelVersion,
      featureVersion: pkg.metadata.featureSchemaVersion,
      modelArchitecture: `${pkg.metadata.modelType} (Ensemble Trees)`,
      trainingDatasetStatus: pkg.metadata.dataProvenanceType === 'REAL_WORLD_VALIDATED'
        ? 'FIELD_BENCHMARK_DATASET'
        : 'VALIDATED_PROTOTYPE_DATASET',
      totalTrainingSamples: pkg.metadata.totalTrainingSamples,
      evaluationMetrics: {
        macroPrecision: pkg.evaluationMetrics.macroPrecision,
        macroRecall: pkg.evaluationMetrics.macroRecall,
        macroF1: pkg.evaluationMetrics.macroF1,
        sampleAccuracy: pkg.evaluationMetrics.accuracy,
        validationMethod: pkg.evaluationMetrics.validationMethod
      },
      lastTrainedDate: pkg.metadata.trainingTimestamp.split('T')[0]
    };

    return {
      preprocessor,
      classifier,
      metadata,
      targetClasses: pkg.targetClasses || TARGET_CLASSES,
      featureNames: pkg.preprocessor.featureNames,
      featureImportances: (pkg.model as any).featureImportances || []
    };
  }

  /**
   * Run disease screening prediction
   */
  public predictDisease(input: MLPredictionFeatureInput): MLPredictionResult {
    let pipeline;
    try {
      pipeline = this.getActivePipeline();
    } catch (err) {
      console.error('Failed to load active model from registry; executing safe fallback', err);
      return this.generateFallbackResult();
    }

    const { preprocessor, classifier, metadata, targetClasses, featureNames, featureImportances } = pipeline;

    // 1. Out-of-Distribution / Empty Input Check
    if (!input.symptoms || input.symptoms.length === 0) {
      const defaultPred: MLDiseasePrediction = {
        diseaseId: 'dis_other_healthy',
        diseaseName: 'No Specific Infectious Signs (Healthy / Under Observation)',
        probability: 0.85,
        confidenceBand: 'LOW',
        keyAssociatedFeatures: ['No active clinical symptoms reported']
      };

      return {
        id: `ml_pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        modelVersion: metadata.modelVersion,
        featureVersion: metadata.featureVersion,
        predictionTimestamp: new Date().toISOString(),
        predictionStatus: 'SCREENING_ONLY',
        topPrediction: defaultPred,
        predictions: [defaultPred],
        top3ProbabilitiesSum: 0.85,
        confidenceScore: 20,
        featureImportanceVector: [],
        modelMetadata: metadata,
        screeningDisclaimer: 'Model-estimated screening likelihood only. Decision support prototype — requires clinical evaluation and laboratory testing for confirmation.'
      };
    }

    // 2. Preprocess & Vectorize using active pipeline
    const { vector, activeFeatures } = preprocessor.transformInput(input);

    // 3. Inference
    const rawProbabilities = classifier.predictProbabilities(vector);

    // 4. Format Predictions for All Available Target Classes
    const predictions: MLDiseasePrediction[] = [];
    const activeSymptomIds = new Set(input.symptoms.map(s => s.symptomId));

    for (let i = 0; i < targetClasses.length; i++) {
      const diseaseId = targetClasses[i];
      const prob = rawProbabilities[i] || 0;
      const diseaseDef = DISEASES_DATABASE.find(d => d.id === diseaseId);
      const diseaseName = diseaseDef ? diseaseDef.name : (diseaseId === 'dis_other_healthy' ? 'Other / Non-Infectious' : diseaseId);

      // Associated hallmarks matching this disease definition
      const associatedFeatures: string[] = [];
      if (diseaseDef) {
        for (const hallmark of diseaseDef.majorSymptoms || []) {
          if (activeSymptomIds.has(hallmark)) {
            const symDef = SYMPTOMS_DATABASE.find(s => s.id === hallmark);
            if (symDef) associatedFeatures.push(symDef.name);
          }
        }
      }

      predictions.push({
        diseaseId,
        diseaseName,
        probability: Math.round(prob * 1000) / 1000,
        confidenceBand: prob >= 0.65 ? 'HIGH' : prob >= 0.35 ? 'MEDIUM' : 'LOW',
        keyAssociatedFeatures: associatedFeatures
      });
    }

    // Sort descending by probability
    predictions.sort((a, b) => b.probability - a.probability);

    let topPrediction = predictions[0];

    // 5. Low-Confidence Threshold Handling
    let predictionStatus: 'SCREENING_ONLY' | 'ANOMALOUS_INPUT' = 'SCREENING_ONLY';
    if (topPrediction.probability < this.confidenceThreshold) {
      topPrediction = {
        diseaseId: 'dis_other_healthy',
        diseaseName: 'Inconclusive / Low ML Confidence (Multiple Conditions Possible)',
        probability: topPrediction.probability,
        confidenceBand: 'LOW',
        keyAssociatedFeatures: ['Model confidence is insufficient for a specific disease screening result.']
      };
      predictionStatus = 'ANOMALOUS_INPUT';
    }

    // 6. Compute Feature Importance Attributions
    const featureImportanceVector: {
      featureName: string;
      importanceWeight: number;
      contributionDirection: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    }[] = [];

    for (const af of activeFeatures) {
      const featIdx = featureNames.indexOf(af.featureName);
      const importanceCoeff = featIdx !== -1 ? (featureImportances[featIdx] || 0.05) : 0.05;
      const weight = Math.round(Math.abs(af.rawValue) * importanceCoeff * 100);

      let cleanName = af.featureName;
      if (af.featureName.startsWith('symptom_')) {
        const symId = af.featureName.replace('symptom_', '');
        const symDef = SYMPTOMS_DATABASE.find(s => s.id === symId);
        cleanName = symDef ? `Symptom: ${symDef.name}` : `Symptom: ${symId}`;
      } else if (af.featureName.startsWith('species_')) {
        cleanName = `Species: ${af.featureName.replace('species_', '')}`;
      } else if (af.featureName.startsWith('vaccination_')) {
        cleanName = `Vaccination: ${af.featureName.replace('vaccination_', '')}`;
      } else if (af.featureName === 'nearby_case_proximity') {
        cleanName = 'Spatial Proximity to Reported Cases';
      } else if (af.featureName === 'herd_attack_rate') {
        cleanName = 'Herd Attack Rate';
      } else if (af.featureName === 'mortality_rate') {
        cleanName = 'Mortality Velocity';
      }

      if (weight > 0) {
        featureImportanceVector.push({
          featureName: cleanName,
          importanceWeight: weight,
          contributionDirection: af.rawValue > 0 ? 'POSITIVE' : 'NEGATIVE'
        });
      }
    }

    featureImportanceVector.sort((a, b) => b.importanceWeight - a.importanceWeight);

    const top3Sum = predictions.slice(0, 3).reduce((acc, p) => acc + p.probability, 0);
    const keyFeaturesCount = (topPrediction?.keyAssociatedFeatures || []).length;
    const confidenceScore = Math.min(Math.round((topPrediction?.probability || 0.5) * 100 * (1 + (keyFeaturesCount * 0.05))), 99);

    return {
      id: `ml_pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      modelVersion: metadata.modelVersion,
      featureVersion: metadata.featureVersion,
      predictionTimestamp: new Date().toISOString(),
      predictionStatus,
      topPrediction,
      predictions,
      top3ProbabilitiesSum: Math.round(top3Sum * 100) / 100,
      confidenceScore,
      featureImportanceVector: featureImportanceVector.slice(0, 6),
      modelMetadata: metadata,
      screeningDisclaimer: 'Model-estimated screening likelihood only. Decision support tool — not a clinical diagnosis or laboratory confirmation.'
    };
  }

  private generateFallbackResult(): MLPredictionResult {
    const fallbackPred: MLDiseasePrediction = {
      diseaseId: 'dis_other_healthy',
      diseaseName: 'ML screening unavailable — rule-based assessment active.',
      probability: 0.5,
      confidenceBand: 'LOW',
      keyAssociatedFeatures: ['Rule-Based Fallback Engaged']
    };

    return {
      id: `ml_pred_fallback_${Date.now()}`,
      modelVersion: 'fallback-rules',
      featureVersion: 'fallback',
      predictionTimestamp: new Date().toISOString(),
      predictionStatus: 'ANOMALOUS_INPUT',
      topPrediction: fallbackPred,
      predictions: [fallbackPred],
      top3ProbabilitiesSum: 0.5,
      confidenceScore: 0,
      featureImportanceVector: [],
      modelMetadata: {
        modelVersion: 'fallback-rules',
        featureVersion: 'fallback',
        modelArchitecture: 'Deterministic Rule Engine Fallback',
        trainingDatasetStatus: 'VALIDATED_PROTOTYPE_DATASET',
        totalTrainingSamples: 0,
        evaluationMetrics: {
          macroPrecision: 0,
          macroRecall: 0,
          macroF1: 0,
          sampleAccuracy: 0,
          validationMethod: 'Deterministic Rules'
        },
        lastTrainedDate: new Date().toISOString().split('T')[0]
      },
      screeningDisclaimer: 'ML screening unavailable — rule-based assessment active.'
    };
  }

  public getModelMetadata(): MLModelMetadata {
    try {
      return this.getActivePipeline().metadata;
    } catch {
      return this.generateFallbackResult().modelMetadata;
    }
  }

  public getActiveModelPackage() {
    return modelRegistryService.getActiveModel().package;
  }

  public getEvaluationPackage() {
    return this.getActiveModelPackage();
  }
}

export const mlPredictionService = new MLPredictionService();
export { TARGET_CLASSES };
