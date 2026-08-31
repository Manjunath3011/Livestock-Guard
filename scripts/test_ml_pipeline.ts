import { MLTrainingPipeline } from '../src/ml/trainPipeline';
import { FeaturePreprocessor } from '../src/ml/preprocessor';
import { RandomForestClassifier } from '../src/ml/classifier';
import { mlPredictionService } from '../src/services/MLPredictionService';
import { HybridRiskEngine } from '../src/services/HybridRiskEngine';
import { Species, SymptomObservation } from '../src/types';

/**
 * AUTOMATED ML PIPELINE & SAFETY OVERRIDE VERIFICATION SUITE
 */
async function runVerification() {
  console.log('====================================================');
  console.log('🤖 RUNNING LIVESTOCKGUARD ML TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  // TEST 1: Training pipeline execution & packaging
  console.log('--- TEST GROUP 1: ML Training Pipeline & Artifact Packaging ---');
  const pkg = MLTrainingPipeline.runTrainingPipeline();
  assert(pkg.metadata.modelVersion === 'livestock-disease-v1', 'Model version is livestock-disease-v1');
  assert(pkg.metadata.featureSchemaVersion === 'livestock-features-v1', 'Feature schema version is livestock-features-v1');
  assert(pkg.metadata.status === 'PROTOTYPE', 'Model is clearly labeled PROTOTYPE');
  assert(pkg.dataQualityReport.isDatasetClean === true, 'Data quality gates passed with zero corrupted records');
  assert(pkg.evaluationMetrics.accuracy >= 0.80, `Model accuracy (${(pkg.evaluationMetrics.accuracy * 100).toFixed(1)}%) is valid on benchmark split`);
  assert(pkg.evaluationMetrics.macroF1 >= 0.75, `Model macro F1 (${(pkg.evaluationMetrics.macroF1 * 100).toFixed(1)}%) is balanced across classes`);

  // TEST 2: Preprocessing and Vectorizer
  console.log('\n--- TEST GROUP 2: Preprocessor & Vectorizer ---');
  const preprocessor = new FeaturePreprocessor(pkg.preprocessor);
  const sampleInput = {
    species: 'Cattle' as Species,
    symptoms: [
      { symptomId: 'sym_fever', severity: 'severe' },
      { symptomId: 'sym_oral_blisters', severity: 'severe' },
      { symptomId: 'sym_excessive_salivation', severity: 'moderate' },
      { symptomId: 'sym_hoof_lesions', severity: 'severe' }
    ] as SymptomObservation[],
    totalAnimalsInHerd: 25,
    affectedCount: 5,
    deadCount: 0,
    nearbyCasesCount: 3,
    nearestCaseDistanceKm: 4.2,
    season: 'MONSOON' as const,
    temperatureC: 30,
    humidityPct: 82,
    rainfallMm: 25,
    stateId: 'st_in_mh',
    districtId: 'dt_in_mh_pune',
    activeClusterPresent: true
  };

  const { vector, activeFeatures } = preprocessor.transformInput(sampleInput);
  assert(vector.length === pkg.preprocessor.featureNames.length, `Vector length (${vector.length}) matches feature schema (${pkg.preprocessor.featureNames.length})`);
  assert(activeFeatures.length > 0, `Active features identified (${activeFeatures.length})`);

  // TEST 3: Model Inference & Probability Distribution
  console.log('\n--- TEST GROUP 3: Model Inference & Probability Axioms ---');
  const pred = mlPredictionService.predictDisease(sampleInput);
  assert(pred.modelVersion === 'livestock-disease-v1', 'Prediction returns valid modelVersion');
  assert(pred.featureVersion === 'livestock-features-v1', 'Prediction returns valid featureVersion');
  assert(pred.predictions.length > 0, 'Returns differential disease predictions');
  
  // Probability Sum & Bounds Verification
  const totalProb = pred.predictions.reduce((acc, p) => acc + p.probability, 0);
  assert(Math.abs(totalProb - 1.0) <= 0.05, `Probability sum (${totalProb.toFixed(3)}) is approximately 1.0`);
  const allInRange = pred.predictions.every(p => p.probability >= 0 && p.probability <= 1.0);
  assert(allInRange, 'All individual disease probabilities are strictly in [0.0, 1.0]');

  // FMD Hallmark Screening Match
  assert(pred.topPrediction.diseaseId === 'dis_fmd', `Top prediction for blister/salivation/hoof lesion is FMD (predicted: ${pred.topPrediction.diseaseName} with ${(pred.topPrediction.probability * 100).toFixed(1)}%)`);

  // TEST 4: Low-Confidence & Empty Input Handling
  console.log('\n--- TEST GROUP 4: Low-Confidence & Missing Input Safeguards ---');
  const emptyInput = {
    species: 'Cattle' as Species,
    symptoms: [] as SymptomObservation[],
    totalAnimalsInHerd: 10,
    affectedCount: 0,
    deadCount: 0,
    nearbyCasesCount: 0,
    nearestCaseDistanceKm: 100,
    season: 'SUMMER' as const,
    temperatureC: 35,
    humidityPct: 40,
    rainfallMm: 0,
    stateId: 'st_in_mh',
    districtId: 'dt_in_mh_pune',
    activeClusterPresent: false
  };
  const emptyPred = mlPredictionService.predictDisease(emptyInput);
  assert(emptyPred.topPrediction.confidenceBand === 'LOW', 'Empty symptoms returns LOW confidence without hallucinating specific disease');

  // TEST 5: Hybrid Engine & Safety Overrides
  console.log('\n--- TEST GROUP 5: Hybrid Risk Engine & Critical Safety Overrides ---');
  const anthraxEmergencyInput = {
    species: 'Cattle' as Species,
    symptoms: [
      { symptomId: 'sym_sudden_death', severity: 'severe' },
      { symptomId: 'sym_dark_blood_orifices', severity: 'severe' }
    ] as SymptomObservation[],
    symptomDurationDays: 1,
    affectedCount: 3,
    deadCount: 3,
    totalAnimalsInHerd: 20,
    latitude: 18.5204,
    longitude: 73.8567,
    vaccinationStatus: 'UNVACCINATED' as const
  };

  const hybridAssessment = HybridRiskEngine.evaluate(anthraxEmergencyInput);
  assert(hybridAssessment.finalRiskLevel === 'CRITICAL', `Sudden mortality with dark blood triggers CRITICAL risk level (Score: ${hybridAssessment.finalRiskScore}/100)`);
  assert(hybridAssessment.decisionSupport.veterinaryReferral.urgency === 'EMERGENCY', 'Urgency escalated to EMERGENCY referral');
  assert(hybridAssessment.decisionSupport.laboratoryPathway.confirmationRequired === true, 'Mandatory laboratory confirmation triggered');
  assert(hybridAssessment.decisionSupport.vaccinationGuidance.contraindicationWarning.includes('Do NOT vaccinate'), 'Contraindication warning present against vaccinating sick stock');

  console.log('\n====================================================');
  console.log(`🏁 TEST EXECUTION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
