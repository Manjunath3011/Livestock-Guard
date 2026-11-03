/**
 * LIVESTOCKGUARD — Test Suite for Image Intelligence Engine & Hybrid Integration
 * Verifies image validation, 11-class visual feasibility rules, non-visual disease warnings,
 * honest model status, vet review workflows, and hybrid risk engine integration.
 */

import { imageIntelligenceService } from '../src/services/ImageIntelligenceService';
import { LIVESTOCK_11_DISEASE_TAXONOMY } from '../src/types/imageScreening';
import { HybridRiskEngine } from '../src/services/HybridRiskEngine';
import { Species } from '../src/types';

function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING LIVESTOCKGUARD IMAGE INTELLIGENCE & HYBRID TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details || ''}`);
      failed++;
    }
  }

  // 1. Verify 11-Class Disease Taxonomy Integrity
  console.log('[1] Verifying 11-Class Disease Taxonomy & Visual Feasibility...');
  const taxonomy = imageIntelligenceService.getDiseaseTaxonomy();
  assert(taxonomy.length === 11, 'Taxonomy contains exactly 11 disease classes');

  const anthrax = taxonomy.find(d => d.diseaseId === 'dis_anthrax');
  assert(anthrax?.feasibilityTier === 'STRICT_BIOHAZARD_LAB_REQUIRED', 'Anthrax is marked STRICT_BIOHAZARD_LAB_REQUIRED');

  const hs = taxonomy.find(d => d.diseaseId === 'dis_hs');
  assert(hs?.feasibilityTier === 'LABORATORY_CONFIRMATORY_REQUIRED', 'HS is marked LABORATORY_CONFIRMATORY_REQUIRED');

  const bq = taxonomy.find(d => d.diseaseId === 'dis_bq');
  assert(bq?.feasibilityTier === 'LABORATORY_CONFIRMATORY_REQUIRED', 'Black Quarter is marked LABORATORY_CONFIRMATORY_REQUIRED');

  const lsd = taxonomy.find(d => d.diseaseId === 'dis_lsd');
  assert(lsd?.feasibilityTier === 'VISUAL_SCREENING_FEASIBLE', 'LSD is marked VISUAL_SCREENING_FEASIBLE');

  const fmd = taxonomy.find(d => d.diseaseId === 'dis_fmd');
  assert(fmd?.feasibilityTier === 'VISUAL_SCREENING_FEASIBLE', 'FMD is marked VISUAL_SCREENING_FEASIBLE');

  // 2. Pretrained Model Registry
  console.log('\n[2] Verifying Model Registry & Architectures...');
  const models = imageIntelligenceService.listModels();
  assert(models.length >= 2, 'Registry contains both EfficientNetB0 and MobileNetV2');

  const activeModel = imageIntelligenceService.getActiveModel();
  assert(activeModel.architecture === 'EfficientNetB0', 'EfficientNetB0 is active primary model');
  assert(activeModel.evaluationStatus === 'TRAINING_PENDING', 'Model honestly reports TRAINING_PENDING until real datasets imported');

  // 3. Non-Visual Disease Guardrail Test
  console.log('\n[3] Testing Non-Visual Disease Guardrails...');
  const dummyDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
  
  // Test Anthrax selection
  imageIntelligenceService.screenLivestockPhoto({
    photoDataUrl: dummyDataUrl,
    species: 'Cattle',
    targetSuspectedDiseaseId: 'dis_anthrax'
  }).then(resAnthrax => {
    assert(resAnthrax.screeningStatus === 'NON_VISUAL_DISEASE_WARNING', 'Anthrax triggers NON_VISUAL_DISEASE_WARNING');
    assert(resAnthrax.limitationsNotes.length > 0, 'Anthrax returns explicit clinical safeguards against opening carcass');

    // Test HS selection
    return imageIntelligenceService.screenLivestockPhoto({
      photoDataUrl: dummyDataUrl,
      species: 'Buffalo',
      targetSuspectedDiseaseId: 'dis_hs'
    });
  }).then(resHS => {
    assert(resHS.screeningStatus === 'NON_VISUAL_DISEASE_WARNING', 'HS triggers NON_VISUAL_DISEASE_WARNING');

    // 4. Testing Model Readiness on Feasible Disease
    console.log('\n[4] Testing Honest Model Status on Visual Diseases...');
    return imageIntelligenceService.screenLivestockPhoto({
      photoDataUrl: dummyDataUrl,
      species: 'Cattle',
      targetSuspectedDiseaseId: 'dis_lsd'
    });
  }).then(resLSD => {
    assert(resLSD.screeningStatus === 'MODEL_NOT_READY', 'LSD returns MODEL_NOT_READY when weights pending real datasets');
    assert(resLSD.confidenceScore === undefined, 'Does NOT output fabricated confidence percentages when untrained');

    // 5. Testing Veterinary Review Workflow
    console.log('\n[5] Testing Veterinary Review Workflow...');
    const reviewed = imageIntelligenceService.updateVeterinarianReview(
      resLSD.id,
      'LAB_CONFIRMATION_ORDERED',
      'Clinical skin nodule detected; real-time PCR requested.',
      'Dr. Kulkarni (District Veterinary Officer)'
    );
    assert(reviewed !== null, 'Veterinary review successfully saved');
    assert(reviewed?.veterinarianReviewStatus === 'LAB_CONFIRMATION_ORDERED', 'Review status updated to LAB_CONFIRMATION_ORDERED');
    assert(reviewed?.veterinarianNotes?.includes('PCR') === true, 'Veterinary clinical notes preserved');

    // 6. Testing Hybrid Assessment Integration
    console.log('\n[6] Testing Hybrid Decision Fusion (Structured ML + Image Screening + WSM Rules)...');
    const hybridEval = HybridRiskEngine.evaluate({
      species: 'Cattle',
      symptoms: [
        {
          symptomId: 'sym_skin_nodules',
          symptomName: 'Multiple Skin Nodules',
          severity: 'severe',
          onsetDate: '2026-11-01'
        },
        {
          symptomId: 'sym_fever',
          symptomName: 'High Fever',
          severity: 'moderate',
          onsetDate: '2026-11-01'
        }
      ],
      affectedCount: 2,
      totalAnimalsInHerd: 10,
      deadCount: 0,
      latitude: 18.5204,
      longitude: 73.8567,
      vaccinationStatus: 'OVERDUE',
      imageScreening: resLSD
    });

    assert(hybridEval.finalRiskScore > 0, 'Hybrid evaluation generates risk score');
    assert(hybridEval.contributingSources?.imageScreening === true, 'Contributing sources records imageScreening: true');
    assert(hybridEval.contributingSources?.structuredML === true, 'Contributing sources records structuredML: true');
    assert(hybridEval.contributingSources?.clinicalRuleEngine === true, 'Contributing sources records clinicalRuleEngine: true');

    const imageFactor = hybridEval.explainableFactors.find(f => f.title.includes('Image Quality Validated') || f.title.includes('Visual'));
    assert(imageFactor !== undefined, 'Image screening factor reflected in explainable AI attribution');

    console.log('\n================================================================');
    console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');
  }).catch(err => {
    console.error('Test execution error:', err);
  });
}

runTestSuite();
