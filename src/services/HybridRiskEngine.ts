import {
  Species,
  SymptomObservation,
  Case,
  Outbreak,
  RiskLevel,
  HybridRiskAssessment,
  ExplainableFactor,
  SupportiveCareStep,
  HomeCareLevel,
  MLPredictionFeatureInput
} from '../types';
import { assessLivestockRisk, calculateDistanceKm } from './riskEngine';
import { mlPredictionService } from './MLPredictionService';
import { DISEASES_DATABASE, DISEASE_VACCINE_LINKS } from '../data/knowledgeBase';

export interface HybridRiskAssessmentParams {
  species: Species;
  symptoms: SymptomObservation[];
  symptomDurationDays?: number;
  previousDiseaseHistory?: string[];
  affectedCount: number;
  totalAnimalsInHerd?: number;
  deadCount: number;
  latitude: number;
  longitude: number;
  stateId?: string;
  districtId?: string;
  villageId?: string;
  vaccinationStatus?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'UNKNOWN';
  vaccineId?: string;
  existingCases?: Case[];
  activeOutbreaks?: Outbreak[];
  weatherCondition?: {
    humidityPct: number;
    temperatureC: number;
    rainfallMm: number;
    season?: 'MONSOON' | 'WINTER' | 'SUMMER' | 'POST_MONSOON';
  };
}

export class HybridRiskEngine {
  /**
   * Execute Hybrid Disease Screening & Risk Assessment
   * Combines deterministic rule engine + statistical machine learning + disease knowledge base
   */
  public static evaluate(params: HybridRiskAssessmentParams): HybridRiskAssessment {
    const totalHerd = Math.max(params.totalAnimalsInHerd || params.affectedCount + params.deadCount || 1, 1);
    const affected = params.affectedCount || 0;
    const dead = params.deadCount || 0;

    // 1. Run Deterministic Rule Engine
    const ruleResult = assessLivestockRisk({
      species: params.species,
      symptoms: params.symptoms,
      affectedCount: affected,
      totalAnimalsInHerd: totalHerd,
      deadCount: dead,
      latitude: params.latitude,
      longitude: params.longitude,
      vaccinationStatus: params.vaccinationStatus === 'UNKNOWN' ? undefined : params.vaccinationStatus,
      existingCases: params.existingCases,
      activeOutbreaks: params.activeOutbreaks,
      weatherCondition: params.weatherCondition ? {
        humidityPct: params.weatherCondition.humidityPct,
        temperatureC: params.weatherCondition.temperatureC,
        rainfallMm: params.weatherCondition.rainfallMm
      } : undefined
    });

    // 2. Determine Spatial Proximity to Nearest Case
    let nearestDistance = 999;
    let nearbyCountIn10Km = 0;
    if (params.existingCases) {
      for (const c of params.existingCases) {
        const d = calculateDistanceKm(params.latitude, params.longitude, c.latitude, c.longitude);
        if (d < nearestDistance) nearestDistance = d;
        if (d <= 10) nearbyCountIn10Km++;
      }
    }
    if (nearestDistance === 999) nearestDistance = 50;

    // 3. Prepare Feature Input for ML Model
    const mlInput: MLPredictionFeatureInput = {
      species: params.species,
      symptoms: params.symptoms,
      symptomDurationDays: params.symptomDurationDays || 3,
      previousDiseaseHistory: params.previousDiseaseHistory || [],
      vaccinationStatus: params.vaccinationStatus,
      totalAnimalsInHerd: totalHerd,
      affectedCount: affected,
      deadCount: dead,
      nearbyCasesCount: nearbyCountIn10Km,
      nearestCaseDistanceKm: nearestDistance,
      season: params.weatherCondition?.season || 'MONSOON',
      temperatureC: params.weatherCondition?.temperatureC || 28,
      humidityPct: params.weatherCondition?.humidityPct || 70,
      rainfallMm: params.weatherCondition?.rainfallMm || 10,
      stateId: params.stateId || 'st_in_mh',
      districtId: params.districtId || 'dt_in_mh_pune',
      activeClusterPresent: nearbyCountIn10Km >= 2
    };

    // 4. Run Machine Learning Disease Screening
    const mlResult = mlPredictionService.predictDisease(mlInput);

    // 5. Harmonize Suspected Diseases (Combining ML & Rule Engine)
    const rulePrimary = (ruleResult.suspectedDiseases || [])[0];
    const mlPrimary = mlResult?.topPrediction || {
      diseaseId: 'dis_fmd',
      diseaseName: 'Foot-and-Mouth Disease',
      probability: 0.5,
      keyAssociatedFeatures: []
    };

    let primaryDiseaseId = mlPrimary.diseaseId;
    let primaryDiseaseName = mlPrimary.diseaseName;
    let combinedConfidencePct = Math.round((mlPrimary.probability || 0.5) * 100);

    // If Rule primary matches ML primary, significantly boost confidence
    const ruleMatchForMLPrimary = (ruleResult.suspectedDiseases || []).find(r => r.diseaseId === mlPrimary.diseaseId);
    if (ruleMatchForMLPrimary) {
      combinedConfidencePct = Math.min(
        98,
        Math.round(((mlPrimary.probability || 0.5) * 100 * 0.55) + (ruleMatchForMLPrimary.screeningScore * 0.45))
      );
    } else if (rulePrimary && rulePrimary.screeningScore > 80 && (mlPrimary.probability || 0) < 0.4) {
      // Strong rule hallmark match takes priority if ML probability is dispersed
      primaryDiseaseId = rulePrimary.diseaseId;
      primaryDiseaseName = rulePrimary.diseaseName;
      combinedConfidencePct = Math.round(rulePrimary.screeningScore * 0.85);
    }

    const diseaseRecord = DISEASES_DATABASE.find(d => d.id === primaryDiseaseId);

    // 6. Calculate Final Hybrid Risk Score (0-100) & Risk Level
    const mlScoreContribution = (mlPrimary.probability || 0.5) * 100;
    const ruleScoreContribution = ruleResult.score;
    const proximityContribution = Math.min(100, nearbyCountIn10Km * 20);
    const mortalityContribution = dead > 0 ? Math.min(100, 50 + dead * 25) : 0;

    let hybridScore = Math.round(
      (ruleScoreContribution * 0.40) +
      (mlScoreContribution * 0.30) +
      (proximityContribution * 0.15) +
      (mortalityContribution * 0.15)
    );

    // Critical escalation triggers (e.g. Notifiable + Outbreak proximity + High mortality)
    if (dead >= 3 || (diseaseRecord?.notifiable && nearbyCountIn10Km >= 3)) {
      hybridScore = Math.max(hybridScore, 85);
    }

    let finalRiskLevel: RiskLevel = 'LOW';
    if (hybridScore >= 80) finalRiskLevel = 'CRITICAL';
    else if (hybridScore >= 60) finalRiskLevel = 'HIGH';
    else if (hybridScore >= 30) finalRiskLevel = 'MODERATE';

    // 7. Construct Explainable Factors & Attributions
    const explainableFactors: ExplainableFactor[] = [];

    // Symptom Match Factor
    const matchingSymCount = (params.symptoms || []).length;
    explainableFactors.push({
      category: 'SYMPTOMS',
      title: 'Clinical Symptom Profile',
      description: `${matchingSymCount} observed symptom(s) match clinical hallmarks for ${primaryDiseaseName}.`,
      weight: 35,
      severity: matchingSymCount >= 3 ? 'ALERT' : 'WARNING',
      isFlagged: matchingSymCount > 0
    });

    // Proximity Factor
    if (nearbyCountIn10Km > 0) {
      explainableFactors.push({
        category: 'PROXIMITY',
        title: 'Geographic Cluster & Nearby Cases',
        description: `${nearbyCountIn10Km} active case(s) reported within 10 km (nearest ~${nearestDistance.toFixed(1)} km).`,
        weight: 25,
        severity: nearbyCountIn10Km >= 3 ? 'CRITICAL' : 'WARNING',
        isFlagged: true
      });
    }

    // Vaccination Gap Factor
    if (params.vaccinationStatus === 'OVERDUE' || params.vaccinationStatus === 'UNVACCINATED') {
      explainableFactors.push({
        category: 'VACCINATION_GAP',
        title: 'Immunization Protection Gap',
        description: `Vaccination status is ${params.vaccinationStatus}. Animal is biologically susceptible to field viral/bacterial strains.`,
        weight: 20,
        severity: 'ALERT',
        isFlagged: true
      });
    }

    // Herd Attack & Mortality Velocity
    const attackPct = Math.round((affected / totalHerd) * 100);
    if (attackPct > 15 || dead > 0) {
      explainableFactors.push({
        category: 'HERD_ATTACK_RATE',
        title: 'Herd Attack & Mortality Velocity',
        description: `${affected} affected (${attackPct}% of herd), with ${dead} recorded fatalitie(s).`,
        weight: 20,
        severity: dead > 0 ? 'CRITICAL' : 'WARNING',
        isFlagged: true
      });
    }

    // Summary Explanation
    const flaggedReasons = explainableFactors.map(f => `• ${f.title}: ${f.description}`);
    const summaryExplanation = `Case flagged as ${finalRiskLevel} risk (Score: ${hybridScore}/100) due to:\n${flaggedReasons.join('\n')}`;

    // 8. Ranked Suspected Diseases (Combining ML + Rule scores)
    const rankedSuspectedDiseases = (mlResult?.predictions || []).slice(0, 4).map(mlPred => {
      const matchingRule = (ruleResult.suspectedDiseases || []).find(r => r.diseaseId === mlPred.diseaseId);
      const rulePct = matchingRule ? matchingRule.screeningScore : 0;
      const hybridRank = Math.round(((mlPred.probability || 0) * 100 * 0.55) + (rulePct * 0.45));
      return {
        diseaseId: mlPred.diseaseId,
        diseaseName: mlPred.diseaseName,
        mlProbability: mlPred.probability || 0,
        ruleMatchPct: rulePct,
        hybridRankScore: hybridRank
      };
    });

    rankedSuspectedDiseases.sort((a, b) => b.hybridRankScore - a.hybridRankScore);

    // 9. Comprehensive Decision Support System (DSS)
    const matchingVaccineLink = DISEASE_VACCINE_LINKS.find(v => v.diseaseId === primaryDiseaseId);
    
    // Supportive Care Steps
    const immediateSteps: SupportiveCareStep[] = diseaseRecord?.supportiveCareSteps || [
      {
        order: 1,
        title: 'Immediate Physical Isolation',
        instruction: 'Isolate the sick animal in a clean, shaded, well-ventilated enclosure at least 15 meters away from healthy stock.',
        safetyLevel: 'CRITICAL',
        targetSign: 'Disease Transmission'
      },
      {
        order: 2,
        title: 'Hydration & Nutrition Maintenance',
        instruction: 'Provide cool, clean drinking water continuously with oral electrolytes or soft digestible gruel (cooked rice/ragi kanji).',
        safetyLevel: 'SAFE',
        targetSign: 'Dehydration & Anorexia'
      },
      {
        order: 3,
        title: 'Strict Sanitary Footbaths & Hygiene',
        instruction: 'Place a 4% sodium carbonate or 2% potassium permanganate disinfectant footbath at the entrance of the shed.',
        safetyLevel: 'SAFE',
        targetSign: 'Biosecurity Containment'
      }
    ];

    const warnings = diseaseRecord?.careWarnings || [
      'DO NOT administer human prescription medicines, unprescribed antibiotics, or aggressive drenching.',
      'DO NOT move sick animals to common grazing pastures, rivers, or weekly livestock markets.',
      'DO NOT puncture blisters, skin nodules, or swellings.'
    ];

    const emergencySigns = diseaseRecord?.emergencySigns || [
      'Rapid breathing, groaning, or severe respiratory distress',
      'Bleeding from natural body orifices (nose, mouth, anus)',
      'Sudden drop in body temperature (subnormal hypothermia)',
      'Inability to stand up or sudden recumbency'
    ];

    return {
      id: `hyb_eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      calculatedAt: new Date().toISOString(),
      finalRiskLevel,
      finalRiskScore: hybridScore,
      riskLevelLabel: `${finalRiskLevel} RISK (Score ${hybridScore}/100)`,
      
      mlScreening: mlResult,
      
      ruleEvidence: {
        ruleMatchScore: ruleResult.score,
        ruleRiskLevel: ruleResult.level,
        topRuleSuspectedDiseases: ruleResult.suspectedDiseases,
        activeOutbreakTriggered: ruleResult.outbreakSignal || nearbyCountIn10Km >= 3,
        clusterDistanceKm: nearestDistance,
        nearbyCasesInRadius: nearbyCountIn10Km
      },

      primarySuspectedDisease: {
        diseaseId: primaryDiseaseId,
        diseaseName: primaryDiseaseName,
        combinedConfidencePct,
        mlProbability: mlPrimary.probability,
        ruleScore: rulePrimary?.screeningScore || 0,
        notifiable: diseaseRecord?.notifiable || false,
        zoonotic: diseaseRecord?.zoonotic || false
      },

      rankedSuspectedDiseases,
      explainableFactors,
      summaryExplanation,

      decisionSupport: {
        vaccinationGuidance: {
          status: params.vaccinationStatus || 'OVERDUE',
          targetVaccine: matchingVaccineLink?.vaccineName || (diseaseRecord?.vaccineAvailable ? 'Authorized Government Vaccine' : undefined),
          routineRecommendation: diseaseRecord?.vaccineAvailable 
            ? `Administer scheduled vaccination (${matchingVaccineLink?.vaccineName || 'preventive vaccine'}) to all healthy animals in herd.`
            : 'No routine commercial vaccine available. Focus strictly on biosecurity and vector management.',
          outbreakResponseRecommendation: nearbyCountIn10Km >= 2
            ? 'Active cluster detected in jurisdiction. Emergency ring vaccination recommended within 5 km perimeter under District Veterinary Officer guidance.'
            : undefined,
          contraindicationWarning: 'CRITICAL NOTICE: Do NOT vaccinate an actively sick animal. Vaccination produces active immunity only in healthy stock and can exacerbate clinical illness in compromised animals.'
        },

        supportiveCare: {
          isSafeForHomeCare: diseaseRecord?.homeCareAllowed ?? true,
          homeCareLevel: (diseaseRecord?.homeCareLevel as HomeCareLevel) || 'BASIC_SUPPORTIVE',
          immediateSteps,
          warningsAndAvoidance: warnings,
          emergencySigns,
          medicalNotice: 'Supportive care stabilizes the animal while awaiting qualified veterinary clinical assessment. It does NOT replace professional veterinary medical intervention.'
        },

        veterinaryReferral: {
          urgency: (diseaseRecord?.emergencyPriority === 'HIGH_EMERGENCY' || finalRiskLevel === 'CRITICAL') 
            ? 'EMERGENCY' 
            : finalRiskLevel === 'HIGH' 
            ? 'HIGH' 
            : 'MODERATE',
          actionSummary: `Mandatory field examination required by a registered Veterinary Assistant Surgeon (VAS) / Veterinary Officer within ${finalRiskLevel === 'CRITICAL' ? '2 to 4 hours' : '12 to 24 hours'}.`,
          recommendedClinicalFocus: [
            `Verify differential diagnosis for ${primaryDiseaseName}`,
            'Conduct physical temperature, mucosal, and lymph node assessment',
            'Determine whether statutory notifiable disease alert must be dispatched to District HQ'
          ],
          teleConsultAvailable: true
        },

        laboratoryPathway: {
          confirmationRequired: diseaseRecord?.notifiable || diseaseRecord?.zoonotic || finalRiskLevel === 'CRITICAL',
          recommendedTest: (diseaseRecord?.notifiable ? 'RT_PCR' : 'ELISA') as any,
          sampleTypeRequired: primaryDiseaseId === 'dis_fmd' 
            ? 'Vesicular fluid / Epithelial flap / Blood serum' 
            : primaryDiseaseId === 'dis_lsd' 
            ? 'Skin nodule biopsy / Scabs / Whole blood (EDTA)' 
            : 'Blood serum / Nasal swab',
          biosafetyCategory: diseaseRecord?.zoonotic ? 'BSL-3 (Zoonotic Precaution)' : 'BSL-2 Standard Veterinary Biosafety',
          designatedLabTier: 'State Animal Disease Diagnostic Laboratory / Regional IVRI Diagnostic Centre'
        },

        biosecurityDirectives: [
          'Halt all animal movement into and out of the farm premises for 14 days.',
          'Restrict visitors, outside cattle traders, and artificial insemination technicians.',
          'Disinfect all feeding troughs, milking equipment, and sheds using 4% sodium carbonate.',
          'Mandatory carcass disposal protocol: Deep burial (2 meters) layered with quicklime if mortality occurs.'
        ]
      },

      legalDisclaimer: 'LivestockGuard Decision Support System provides automated screening and risk assessments. Final clinical diagnosis and prescription authority rest exclusively with licensed veterinary professionals.'
    };
  }
}
