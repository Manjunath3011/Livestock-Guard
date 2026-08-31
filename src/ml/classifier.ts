import {
  DecisionTreeNode,
  RandomForestModelArtifact,
  CalibratedLinearModelArtifact,
  MODEL_VERSION,
  FEATURE_SCHEMA_VERSION
} from './types';

/**
 * Multi-Class Decision Tree Classifier
 */
export class DecisionTreeClassifier {
  private root: DecisionTreeNode | null = null;
  private maxDepth: number;
  private minSamplesSplit: number;
  private numClasses: number;

  constructor(maxDepth = 8, minSamplesSplit = 4, numClasses = 11) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.numClasses = Math.max(numClasses, 1);
  }

  public fit(X: number[][], y: number[], featureIndices?: number[]): void {
    if (
      !X ||
      !Array.isArray(X) ||
      X.length === 0 ||
      !X[0] ||
      !Array.isArray(X[0]) ||
      X[0].length === 0 ||
      !y ||
      !Array.isArray(y) ||
      y.length === 0
    ) {
      this.root = {
        isLeaf: true,
        probabilities: new Array(this.numClasses).fill(1 / this.numClasses)
      };
      return;
    }

    const indices = Array.from({ length: X.length }, (_, i) => i);
    const availableFeatures =
      featureIndices && featureIndices.length > 0
        ? featureIndices
        : Array.from({ length: X[0].length }, (_, i) => i);

    this.root = this.buildTree(X, y, indices, 0, availableFeatures);
  }

  private calculateGini(y: number[], sampleIndices: number[]): number {
    if (!sampleIndices || sampleIndices.length === 0) return 0;
    const counts = new Array(this.numClasses).fill(0);
    for (const idx of sampleIndices) {
      if (y[idx] !== undefined && y[idx] >= 0 && y[idx] < this.numClasses) {
        counts[y[idx]]++;
      }
    }
    let impurity = 1.0;
    const total = sampleIndices.length;
    for (let c = 0; c < this.numClasses; c++) {
      const p = counts[c] / total;
      impurity -= p * p;
    }
    return impurity;
  }

  private buildTree(
    X: number[][],
    y: number[],
    sampleIndices: number[],
    depth: number,
    featureSubset: number[]
  ): DecisionTreeNode {
    const classCounts = new Array(this.numClasses).fill(0);
    for (const idx of sampleIndices) {
      if (y[idx] !== undefined && y[idx] >= 0 && y[idx] < this.numClasses) {
        classCounts[y[idx]]++;
      }
    }

    const probabilities = classCounts.map(c =>
      sampleIndices.length > 0 ? c / sampleIndices.length : 1 / this.numClasses
    );

    // Base cases: max depth reached, too few samples, or pure node
    const isPure = classCounts.filter(c => c > 0).length <= 1;
    if (depth >= this.maxDepth || sampleIndices.length < this.minSamplesSplit || isPure) {
      return {
        isLeaf: true,
        probabilities
      };
    }

    let bestGiniGain = -1;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    const currentGini = this.calculateGini(y, sampleIndices);

    for (const fIdx of featureSubset) {
      // Find candidate split thresholds
      const values = sampleIndices.map(i => X[i]?.[fIdx] ?? 0);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
      if (uniqueValues.length <= 1) continue;

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const left: number[] = [];
        const right: number[] = [];

        for (const idx of sampleIndices) {
          if ((X[idx]?.[fIdx] ?? 0) <= threshold) left.push(idx);
          else right.push(idx);
        }

        if (left.length === 0 || right.length === 0) continue;

        const leftGini = this.calculateGini(y, left);
        const rightGini = this.calculateGini(y, right);
        const weightedGini =
          (left.length / sampleIndices.length) * leftGini +
          (right.length / sampleIndices.length) * rightGini;
        const gain = currentGini - weightedGini;

        if (gain > bestGiniGain) {
          bestGiniGain = gain;
          bestFeature = fIdx;
          bestThreshold = threshold;
          bestLeftIndices = left;
          bestRightIndices = right;
        }
      }
    }

    if (bestGiniGain <= 0.0001 || bestLeftIndices.length === 0 || bestRightIndices.length === 0) {
      return {
        isLeaf: true,
        probabilities
      };
    }

    const leftNode = this.buildTree(X, y, bestLeftIndices, depth + 1, featureSubset);
    const rightNode = this.buildTree(X, y, bestRightIndices, depth + 1, featureSubset);

    return {
      isLeaf: false,
      featureIndex: bestFeature,
      threshold: bestThreshold,
      left: leftNode,
      right: rightNode,
      probabilities
    };
  }

  public predictProbabilities(x: number[]): number[] {
    if (!x || !Array.isArray(x) || !this.root) {
      return new Array(this.numClasses).fill(1 / this.numClasses);
    }

    let curr: DecisionTreeNode | null = this.root;
    while (curr && !curr.isLeaf) {
      if (curr.featureIndex !== undefined && curr.threshold !== undefined) {
        const val = x[curr.featureIndex] ?? 0;
        if (val <= curr.threshold) {
          curr = curr.left || null;
        } else {
          curr = curr.right || null;
        }
      } else {
        break;
      }
    }
    return curr?.probabilities || new Array(this.numClasses).fill(1 / this.numClasses);
  }

  public getRoot(): DecisionTreeNode | null {
    return this.root;
  }

  public setRoot(node: DecisionTreeNode): void {
    this.root = node;
  }
}

/**
 * Multi-Class Random Forest Classifier
 */
export class RandomForestClassifier {
  private trees: DecisionTreeClassifier[] = [];
  private numTrees: number;
  private maxDepth: number;
  private minSamplesSplit: number;
  private targetClasses: string[];
  private featureImportances: number[] = [];
  private classPriors: number[] = [];

  constructor(targetClasses: string[], numTrees = 25, maxDepth = 7, minSamplesSplit = 3) {
    this.targetClasses = Array.isArray(targetClasses) && targetClasses.length > 0 ? targetClasses : ['dis_other_healthy'];
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  public fit(X: number[][], y: number[]): void {
    if (
      !X ||
      !Array.isArray(X) ||
      X.length === 0 ||
      !X[0] ||
      !Array.isArray(X[0]) ||
      X[0].length === 0 ||
      !y ||
      !Array.isArray(y) ||
      y.length === 0
    ) {
      console.warn('[RandomForestClassifier] Aborted fit: empty or invalid feature matrix or labels');
      this.trees = [];
      this.featureImportances = [];
      this.classPriors = new Array(this.targetClasses.length).fill(1 / this.targetClasses.length);
      return;
    }

    const numSamples = X.length;
    const numFeatures = X[0].length;
    const numClasses = Math.max(this.targetClasses.length, 1);

    // Calculate class priors
    const counts = new Array(numClasses).fill(0);
    for (const label of y) {
      if (label !== undefined && label >= 0 && label < numClasses) {
        counts[label]++;
      }
    }
    this.classPriors = counts.map(c => (numSamples > 0 ? c / numSamples : 1 / numClasses));

    this.trees = [];
    const importanceAcc = new Array(numFeatures).fill(0);

    // Number of random features per split: sqrt(p)
    const maxFeaturesPerTree = Math.max(Math.floor(Math.sqrt(numFeatures)) + 1, Math.min(4, numFeatures));

    for (let t = 0; t < this.numTrees; t++) {
      // Bootstrap sampling with replacement
      const bootstrapIndices: number[] = [];
      for (let i = 0; i < numSamples; i++) {
        const randIdx = Math.floor(Math.random() * numSamples);
        bootstrapIndices.push(randIdx);
      }

      // Feature subsampling
      const shuffledFeatures = Array.from({ length: numFeatures }, (_, i) => i).sort(() => Math.random() - 0.5);
      const selectedFeatures = shuffledFeatures.slice(0, maxFeaturesPerTree);

      const treeX = bootstrapIndices.map(i => X[i]);
      const treeY = bootstrapIndices.map(i => y[i]);

      const tree = new DecisionTreeClassifier(this.maxDepth, this.minSamplesSplit, numClasses);
      tree.fit(treeX, treeY, selectedFeatures);
      this.trees.push(tree);

      // Accumulate feature split frequency
      this.accumulateImportance(tree.getRoot(), importanceAcc);
    }

    const totalImp = importanceAcc.reduce((a, b) => a + b, 0);
    this.featureImportances =
      totalImp > 0 ? importanceAcc.map(v => v / totalImp) : new Array(numFeatures).fill(1 / numFeatures);
  }

  private accumulateImportance(node: DecisionTreeNode | null | undefined, acc: number[]): void {
    if (!node || node.isLeaf) return;
    if (node.featureIndex !== undefined && node.featureIndex < acc.length) {
      acc[node.featureIndex] += 1;
    }
    this.accumulateImportance(node.left, acc);
    this.accumulateImportance(node.right, acc);
  }

  public predictProbabilities(x: number[]): number[] {
    const numClasses = Math.max(this.targetClasses?.length || 1, 1);
    if (!this.trees || this.trees.length === 0 || !x || !Array.isArray(x)) {
      return new Array(numClasses).fill(1 / numClasses);
    }

    const avgProbabilities = new Array(numClasses).fill(0);

    for (const tree of this.trees) {
      const p = tree.predictProbabilities(x);
      for (let c = 0; c < numClasses; c++) {
        avgProbabilities[c] += p[c] ?? 0;
      }
    }

    const treeCount = Math.max(this.trees.length, 1);
    for (let c = 0; c < numClasses; c++) {
      avgProbabilities[c] /= treeCount;
    }

    // Normalize to guarantee sum to exactly 1.0
    const sum = avgProbabilities.reduce((a, b) => a + b, 0);
    return sum > 0 ? avgProbabilities.map(v => v / sum) : new Array(numClasses).fill(1 / numClasses);
  }

  public predict(x: number[]): { classIndex: number; className: string; probability: number } {
    const probs = this.predictProbabilities(x);
    let maxIdx = 0;
    let maxProb = probs[0] ?? 0;
    for (let i = 1; i < probs.length; i++) {
      if ((probs[i] ?? 0) > maxProb) {
        maxProb = probs[i];
        maxIdx = i;
      }
    }
    return {
      classIndex: maxIdx,
      className: this.targetClasses[maxIdx] || 'dis_other_healthy',
      probability: maxProb
    };
  }

  public serialize(): RandomForestModelArtifact {
    return {
      modelType: 'RANDOM_FOREST_CLASSIFIER',
      modelVersion: MODEL_VERSION,
      featureSchemaVersion: FEATURE_SCHEMA_VERSION,
      targetClasses: this.targetClasses,
      trees: this.trees.map(t => t.getRoot()!).filter(Boolean),
      featureImportances: this.featureImportances,
      classPriors: this.classPriors,
      hyperparameters: {
        numTrees: this.numTrees,
        maxDepth: this.maxDepth,
        minSamplesSplit: this.minSamplesSplit
      }
    };
  }

  public static deserialize(artifact: RandomForestModelArtifact): RandomForestClassifier {
    const targetClasses = artifact?.targetClasses || ['dis_other_healthy'];
    const rf = new RandomForestClassifier(
      targetClasses,
      artifact?.hyperparameters?.numTrees || 25,
      artifact?.hyperparameters?.maxDepth || 7,
      artifact?.hyperparameters?.minSamplesSplit || 3
    );

    if (Array.isArray(artifact?.trees)) {
      rf.trees = artifact.trees.map(node => {
        const t = new DecisionTreeClassifier(
          artifact.hyperparameters?.maxDepth || 7,
          artifact.hyperparameters?.minSamplesSplit || 3,
          targetClasses.length
        );
        if (node) t.setRoot(node);
        return t;
      });
    }
    rf.featureImportances = artifact?.featureImportances || [];
    rf.classPriors = artifact?.classPriors || [];
    return rf;
  }
}
