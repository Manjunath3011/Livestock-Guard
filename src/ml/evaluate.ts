import { EvaluationMetrics, ConfusionMatrix } from './types';

export class ModelEvaluator {
  /**
   * Safe empty evaluation metrics fallback
   */
  public static getEmptyMetrics(targetClasses: string[], validationMethod = 'Holdout Test'): EvaluationMetrics {
    const classes = Array.isArray(targetClasses) && targetClasses.length > 0 ? targetClasses : ['dis_other_healthy'];
    const classMetrics: Record<string, { precision: number; recall: number; f1: number; support: number }> = {};
    for (const c of classes) {
      classMetrics[c] = { precision: 0, recall: 0, f1: 0, support: 0 };
    }

    return {
      accuracy: 0,
      macroPrecision: 0,
      macroRecall: 0,
      macroF1: 0,
      weightedF1: 0,
      logLoss: 0,
      classMetrics,
      confusionMatrix: {
        classes,
        matrix: Array.from({ length: classes.length }, () => new Array(classes.length).fill(0))
      },
      validationMethod,
      evaluationTimestamp: new Date().toISOString()
    };
  }

  /**
   * Computes comprehensive multi-class evaluation metrics.
   */
  public static evaluate(
    yTrue: number[],
    yPredProbs: number[][],
    targetClasses: string[],
    validationMethod = '80/20 Holdout Test'
  ): EvaluationMetrics {
    if (
      !yTrue ||
      !Array.isArray(yTrue) ||
      yTrue.length === 0 ||
      !yPredProbs ||
      !Array.isArray(yPredProbs) ||
      yPredProbs.length === 0 ||
      !targetClasses ||
      !Array.isArray(targetClasses) ||
      targetClasses.length === 0
    ) {
      return this.getEmptyMetrics(targetClasses || [], validationMethod);
    }

    const numSamples = yTrue.length;
    const numClasses = targetClasses.length;

    // Build confusion matrix
    const matrix: number[][] = Array.from({ length: numClasses }, () => new Array(numClasses).fill(0));
    let correctCount = 0;
    let totalLogLoss = 0;

    for (let i = 0; i < numSamples; i++) {
      const trueClass = yTrue[i];
      const probs = yPredProbs[i] || new Array(numClasses).fill(1 / numClasses);

      if (trueClass === undefined || trueClass < 0 || trueClass >= numClasses) {
        continue;
      }

      // Find argmax prediction
      let predClass = 0;
      let maxProb = probs[0] ?? 0;
      for (let c = 1; c < numClasses; c++) {
        if ((probs[c] ?? 0) > maxProb) {
          maxProb = probs[c] ?? 0;
          predClass = c;
        }
      }

      matrix[trueClass][predClass]++;
      if (trueClass === predClass) {
        correctCount++;
      }

      // Log loss computation with clipping
      const eps = 1e-15;
      const trueProb = Math.max(Math.min((probs[trueClass] ?? eps), 1 - eps), eps);
      totalLogLoss += -Math.log(trueProb);
    }

    const accuracy = numSamples > 0 ? correctCount / numSamples : 0;
    const logLoss = numSamples > 0 ? totalLogLoss / numSamples : 0;

    // Per-class metrics
    const classMetrics: Record<string, { precision: number; recall: number; f1: number; support: number }> = {};
    let sumPrecision = 0;
    let sumRecall = 0;
    let sumF1 = 0;
    let weightedSumF1 = 0;

    for (let c = 0; c < numClasses; c++) {
      const className = targetClasses[c];
      const tp = matrix[c]?.[c] ?? 0;

      // False positives: sum of col c minus TP
      let fp = 0;
      for (let r = 0; r < numClasses; r++) {
        if (r !== c) fp += matrix[r]?.[c] ?? 0;
      }

      // False negatives: sum of row c minus TP (actual positive support)
      let fn = 0;
      for (let col = 0; col < numClasses; col++) {
        if (col !== c) fn += matrix[c]?.[col] ?? 0;
      }

      const support = tp + fn;
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      classMetrics[className] = {
        precision: Math.round(precision * 1000) / 1000,
        recall: Math.round(recall * 1000) / 1000,
        f1: Math.round(f1 * 1000) / 1000,
        support
      };

      sumPrecision += precision;
      sumRecall += recall;
      sumF1 += f1;
      weightedSumF1 += f1 * support;
    }

    const macroPrecision = numClasses > 0 ? Math.round((sumPrecision / numClasses) * 1000) / 1000 : 0;
    const macroRecall = numClasses > 0 ? Math.round((sumRecall / numClasses) * 1000) / 1000 : 0;
    const macroF1 = numClasses > 0 ? Math.round((sumF1 / numClasses) * 1000) / 1000 : 0;
    const weightedF1 = numSamples > 0 ? Math.round((weightedSumF1 / numSamples) * 1000) / 1000 : 0;

    const confusionMatrix: ConfusionMatrix = {
      classes: targetClasses,
      matrix
    };

    return {
      accuracy: Math.round(accuracy * 1000) / 1000,
      macroPrecision,
      macroRecall,
      macroF1,
      weightedF1,
      logLoss: Math.round(logLoss * 1000) / 1000,
      classMetrics,
      confusionMatrix,
      validationMethod,
      evaluationTimestamp: new Date().toISOString()
    };
  }
}
