import {
  Species,
  SymptomObservation,
  RiskCalculationResult,
  RiskLevel,
  SuspectedDiseaseMatch,
  RecommendedAdvisory,
  SystemConfig,
  Case,
  Outbreak,
  SupportiveCareStep
} from '../types';
import { DISEASES_DATABASE, DISEASE_SYMPTOM_MATRIX, DISEASE_VACCINE_LINKS } from '../data/knowledgeBase';

export const DEFAULT_CONFIG: SystemConfig = {
  riskWeights: {
    symptomMatch: 0.30,
    nearbyCases: 0.20,
    affectedRate: 0.15,
    mortality: 0.10,
    vaccination: 0.10,
    historicalTrends: 0.10,
    weather: 0.05
  },
  clusterThresholds: {
    minCases: 3,
    radiusKm: 10,
    timeWindowDays: 14
  },
  riskLevelCutoffs: {
    moderate: 31,
    high: 61,
    critical: 81
  }
};

// Calculate Haversine distance in Kilometers between two coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function assessLivestockRisk(params: {
  species: Species;
  symptoms: SymptomObservation[];
  affectedCount: number;
  totalAnimalsInHerd?: number;
  deadCount: number;
  latitude: number;
  longitude: number;
  vaccinationStatus?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED';
  existingCases?: Case[];
  activeOutbreaks?: Outbreak[];
  weatherCondition?: {
    humidityPct: number;
    temperatureC: number;
    rainfallMm: number;
  };
  config?: SystemConfig;
}): RiskCalculationResult {
  const cfg = params.config || DEFAULT_CONFIG;
  const totalHerd = Math.max(params.totalAnimalsInHerd || params.affectedCount + params.deadCount || 1, 1);
  const affected = params.affectedCount || 0;
  const dead = params.deadCount || 0;

  // 1. Symptom-to-Disease Matching
  const observedSymptomIds = new Set(params.symptoms.map(s => s.symptomId));
  const severityMultiplier: Record<string, number> = {
    mild: 0.7,
    moderate: 1.0,
    severe: 1.35
  };

  const diseaseMatches: SuspectedDiseaseMatch[] = [];

  for (const disease of DISEASES_DATABASE) {
    // Species compatibility check
    if (!disease.affectedSpecies.includes(params.species) && !disease.affectedSpecies.includes('Other')) {
      continue;
    }

    const diseaseWeights = DISEASE_SYMPTOM_MATRIX.filter(m => m.diseaseId === disease.id);
    if (diseaseWeights.length === 0) continue;

    let matchedWeightSum = 0;
    let totalPossibleWeightSum = 0;
    const matchingSymptomNames: string[] = [];

    for (const link of diseaseWeights) {
      totalPossibleWeightSum += link.importanceWeight * 1.2;
      if (observedSymptomIds.has(link.symptomId)) {
        const obs = params.symptoms.find(s => s.symptomId === link.symptomId);
        const mult = obs ? severityMultiplier[obs.severity] || 1.0 : 1.0;
        matchedWeightSum += link.importanceWeight * mult;
        matchingSymptomNames.push(obs?.symptomName || link.symptomId);
      }
    }

    if (matchingSymptomNames.length > 0 && totalPossibleWeightSum > 0) {
      let rawScore = Math.min(100, Math.round((matchedWeightSum / totalPossibleWeightSum) * 100));

      // Extra bonus for classic hallmark triad/multi-symptom matches
      if (matchingSymptomNames.length >= 3) rawScore = Math.min(100, rawScore + 15);
      if (matchingSymptomNames.length >= 4) rawScore = Math.min(100, rawScore + 10);

      // Determine confidence level
      let confidence: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
      if (rawScore >= 75 && matchingSymptomNames.length >= 3) confidence = 'HIGH';
      else if (rawScore >= 45 && matchingSymptomNames.length >= 2) confidence = 'MODERATE';

      const keyDiffs: string[] = [];
      if (disease.notifiable) keyDiffs.push('State-notifiable surveillance disease');
      if (disease.zoonotic) keyDiffs.push('Zoonotic transmission risk to humans');
      if (disease.emergencyPriority === 'HIGH_EMERGENCY') keyDiffs.push('High-emergency veterinary priority');

      const matchingVaccineLink = DISEASE_VACCINE_LINKS.find(v => v.diseaseId === disease.id);

      // Determine vaccination guidance note for this specific disease
      let vacGuidanceNote: string;
      if (!disease.vaccineAvailable) {
        vacGuidanceNote = 'No routinely applicable commercial vaccine is currently available for this condition. Prevention focuses strictly on biosecurity, vector control, and movement isolation.';
      } else if (params.vaccinationStatus === 'OVERDUE') {
        vacGuidanceNote = 'Vaccination for this condition is overdue. Note: vaccines prevent future infections in healthy stock and do NOT treat an actively sick animal. Schedule immunization under veterinary guidance once the animal recovers.';
      } else if (params.vaccinationStatus === 'UNVACCINATED') {
        vacGuidanceNote = 'No prior vaccination recorded. Ensure healthy herd members receive ring or routine vaccination under veterinary supervision.';
      } else {
        vacGuidanceNote = 'Vaccination history is recorded. Continue regular booster schedules as recommended by your veterinarian.';
      }

      const urgency: 'ROUTINE' | 'MODERATE' | 'HIGH' | 'EMERGENCY' =
        disease.emergencyPriority === 'HIGH_EMERGENCY' || disease.homeCareLevel === 'EMERGENCY_ONLY'
          ? 'EMERGENCY'
          : disease.severity === 'CRITICAL'
          ? 'HIGH'
          : disease.severity === 'HIGH'
          ? 'MODERATE'
          : 'ROUTINE';

      diseaseMatches.push({
        diseaseId: disease.id,
        diseaseName: disease.name,
        scientificName: disease.scientificName,
        screeningScore: rawScore,
        confidenceLevel: confidence,
        matchingSymptoms: matchingSymptomNames,
        keyDifferentiators: keyDiffs,
        notifiable: disease.notifiable,
        zoonotic: disease.zoonotic,
        supportiveCareAvailable: disease.homeCareAllowed,
        homeCareLevel: disease.homeCareLevel,
        supportiveCareSummary: disease.supportiveCare,
        supportiveCareSteps: disease.supportiveCareSteps || [],
        careWarnings: disease.careWarnings || [],
        thingsToAvoid: disease.thingsToAvoid || [],
        emergencySigns: disease.emergencySigns || [],
        vaccineAvailable: disease.vaccineAvailable,
        vaccineId: disease.primaryVaccineId,
        vaccineName: matchingVaccineLink?.vaccineName || (disease.vaccineAvailable ? 'Authorized Veterinary Vaccine' : undefined),
        vaccineSchedule: disease.vaccineScheduleReference,
        vaccinationStatusForAnimal:
          params.vaccinationStatus === 'UP_TO_DATE'
            ? 'UP_TO_DATE'
            : params.vaccinationStatus === 'OVERDUE'
            ? 'OVERDUE'
            : 'NO_RECORD',
        vaccineGuidanceNote: vacGuidanceNote,
        veterinaryUrgency: urgency,
        laboratoryConfirmation: disease.notifiable || disease.zoonotic,
        farmerFriendlyExplanation: disease.farmerFriendlyExplanation,
        references: disease.references
      });
    }
  }

  // Sort descending by score
  diseaseMatches.sort((a, b) => b.screeningScore - a.screeningScore);
  const topSuspected = diseaseMatches.slice(0, 4);
  const topMatchScore = topSuspected.length > 0 ? topSuspected[0].screeningScore : 10;
  const primaryMatch = topSuspected[0];

  // 2. Nearby Cases & Cluster Detection
  let nearbyCasesCount = 0;
  let nearbyHighRiskCount = 0;
  let inActiveOutbreakZone = false;

  if (params.existingCases) {
    for (const c of params.existingCases) {
      const dist = calculateDistanceKm(params.latitude, params.longitude, c.latitude, c.longitude);
      if (dist <= cfg.clusterThresholds.radiusKm) {
        nearbyCasesCount++;
        if (c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL') {
          nearbyHighRiskCount++;
        }
      }
    }
  }

  if (params.activeOutbreaks) {
    for (const outb of params.activeOutbreaks) {
      const dist = calculateDistanceKm(params.latitude, params.longitude, outb.latitude, outb.longitude);
      if (dist <= outb.radiusKm + 5) {
        inActiveOutbreakZone = true;
      }
    }
  }

  let nearbyClusterScore = Math.min(100, nearbyCasesCount * 18 + nearbyHighRiskCount * 22 + (inActiveOutbreakZone ? 40 : 0));

  // 3. Affected Percentage Score
  const affectedPct = (affected / totalHerd) * 100;
  let affectedRateScore = Math.min(100, Math.round(affectedPct * 1.5));
  if (affected >= 5) affectedRateScore = Math.min(100, affectedRateScore + 20);

  // 4. Mortality Score
  let mortalityScore = 0;
  if (dead > 0) {
    mortalityScore = Math.min(100, 40 + dead * 25 + (dead / totalHerd) * 35);
  }
  const hasSuddenDeath = observedSymptomIds.has('sym_sudden_death') || observedSymptomIds.has('sym_bloody_orifices');
  if (hasSuddenDeath) {
    mortalityScore = Math.max(mortalityScore, 85);
  }

  // 5. Vaccination Score
  let vaccinationScore = 20; // default baseline
  if (params.vaccinationStatus === 'OVERDUE') vaccinationScore = 75;
  else if (params.vaccinationStatus === 'UNVACCINATED') vaccinationScore = 95;
  else if (params.vaccinationStatus === 'UP_TO_DATE') vaccinationScore = 10;

  // 6. Historical Trend Score (Seasonal boost)
  let historicalTrendScore = 45;
  const currentMonth = new Date().getMonth(); // 0 to 11
  // Monsoon (June-Sept) / Winter (Nov-Jan) peak diseases
  if (currentMonth >= 5 && currentMonth <= 8) {
    historicalTrendScore = 70; // Monsoon peak
  } else if (currentMonth === 10 || currentMonth === 11 || currentMonth === 0) {
    historicalTrendScore = 65; // Winter peak
  }

  // 7. Environmental & Weather Factor
  let weatherFactorScore = 30;
  if (params.weatherCondition) {
    if (params.weatherCondition.humidityPct > 75) weatherFactorScore += 35;
    if (params.weatherCondition.rainfallMm > 10) weatherFactorScore += 25;
    if (params.weatherCondition.temperatureC > 30) weatherFactorScore += 15;
  }
  weatherFactorScore = Math.min(100, weatherFactorScore);

  // Compute Total Weighted Score
  const totalScore = Math.round(
    topMatchScore * cfg.riskWeights.symptomMatch +
    nearbyClusterScore * cfg.riskWeights.nearbyCases +
    affectedRateScore * cfg.riskWeights.affectedRate +
    mortalityScore * cfg.riskWeights.mortality +
    vaccinationScore * cfg.riskWeights.vaccination +
    historicalTrendScore * cfg.riskWeights.historicalTrends +
    weatherFactorScore * cfg.riskWeights.weather
  );

  const clampedScore = Math.min(100, Math.max(5, totalScore));

  // Determine Risk Level
  let level: RiskLevel = 'LOW';
  if (clampedScore >= cfg.riskLevelCutoffs.critical) level = 'CRITICAL';
  else if (clampedScore >= cfg.riskLevelCutoffs.high) level = 'HIGH';
  else if (clampedScore >= cfg.riskLevelCutoffs.moderate) level = 'MODERATE';

  // Contributing Factors
  const contributingFactors: string[] = [];
  if (topSuspected.length > 0) {
    contributingFactors.push(`High clinical compatibility with ${topSuspected[0].diseaseName} (${topSuspected[0].screeningScore}% match).`);
  }
  if (nearbyCasesCount > 0) {
    contributingFactors.push(`${nearbyCasesCount} similar/suspected case(s) active within ${cfg.clusterThresholds.radiusKm} km radius.`);
  }
  if (inActiveOutbreakZone) {
    contributingFactors.push('Farm is located inside an active declared containment/outbreak zone.');
  }
  if (dead > 0 || hasSuddenDeath) {
    contributingFactors.push(`Mortality signal detected (${dead} death(s) recorded / sudden peracute collapse).`);
  }
  if (affectedPct >= 20) {
    contributingFactors.push(`High morbidity rate: ${affectedPct.toFixed(1)}% of herd is currently symptomatic.`);
  }
  if (params.vaccinationStatus === 'OVERDUE' || params.vaccinationStatus === 'UNVACCINATED') {
    contributingFactors.push('Vaccination schedule is overdue or missing for key endemic pathogens.');
  }
  if (weatherFactorScore >= 60) {
    contributingFactors.push('Prevailing wet/humid weather elevates vector proliferation and airborne viral spread.');
  }

  // Recommended Actions / Advisories
  const recommendedActions: RecommendedAdvisory[] = [];

  recommendedActions.push({
    category: 'ISOLATION / MOVEMENT CONTROL',
    title: 'Immediate Physical Quarantine',
    action: 'Isolate affected animals in a separate ventilated shed away from healthy stock and common grazing routes.',
    rationale: 'Prevents aerosol, saliva and direct mucosal transmission across the herd.',
    priority: level === 'CRITICAL' || level === 'HIGH' ? 'CRITICAL' : 'HIGH',
    targetActor: 'FARMER',
    timeframe: 'Immediate (< 1 hour)'
  });

  recommendedActions.push({
    category: 'BIOSECURITY',
    title: 'Disinfection & Vector Suppression',
    action: 'Apply 4% Sodium Carbonate or phenolic disinfectant to shed floors, feed troughs and footwear dips. Prohibit shared waterers.',
    rationale: 'Inactivates surface viral particles and pathogenic bacteria.',
    priority: 'HIGH',
    targetActor: 'FARMER',
    timeframe: 'Within 4 hours'
  });

  if (level === 'CRITICAL' || level === 'HIGH' || hasSuddenDeath) {
    recommendedActions.push({
      category: 'VETERINARY REVIEW',
      title: 'Urgent Clinical Veterinary Triage',
      action: 'Dispatch field veterinary officer for comprehensive physical examination and diagnostic sampling.',
      rationale: 'Confirms clinical suspicion and initiates regulated supportive care and official containment protocols.',
      priority: 'CRITICAL',
      targetActor: 'VETERINARIAN',
      timeframe: 'Within 6-12 hours'
    });

    recommendedActions.push({
      category: 'SAMPLE COLLECTION',
      title: 'Diagnostic Laboratory Sampling',
      action: 'Collect sterile vesicular fluid, nasal swab or blood sample in transport media for molecular RT-PCR testing.',
      rationale: 'Enables definitive laboratory confirmation and serotyping to guide ring vaccination.',
      priority: 'HIGH',
      targetActor: 'VETERINARIAN',
      timeframe: 'Within 24 hours'
    });
  }

  if (nearbyCasesCount >= cfg.clusterThresholds.minCases || inActiveOutbreakZone) {
    recommendedActions.push({
      category: 'OUTBREAK REPORTING',
      title: 'District Surveillance Escalation',
      action: 'Alert District Veterinary Epidemiologist and activate village-level ring vaccination task force.',
      rationale: 'Prevents inter-village propagation along trade and transport corridors.',
      priority: 'CRITICAL',
      targetActor: 'DISTRICT_OFFICIAL',
      timeframe: 'Same day'
    });
  }

  const outbreakSignal = (nearbyCasesCount >= cfg.clusterThresholds.minCases && topMatchScore >= 70) || inActiveOutbreakZone || dead >= 2;

  // Build aggregated supportive care steps from top suspected condition or fallback
  const supportiveCareSteps: SupportiveCareStep[] = primaryMatch?.supportiveCareSteps?.length
    ? primaryMatch.supportiveCareSteps
    : [
        {
          title: 'Clean Water & Nutrition Support',
          desc: 'Ensure constant access to clean, cool water and easily chewable palatable soft feed.',
          icon: 'Droplets',
          category: 'WATER'
        },
        {
          title: 'Shelter & Separate Housing',
          desc: 'House the animal in a dedicated, draft-free, shaded stall with clean, dry straw bedding.',
          icon: 'Shield',
          category: 'ENVIRONMENT'
        },
        {
          title: 'Close Observation',
          desc: 'Check temperature and observe breathing twice daily. Note changes in demeanor or appetite.',
          icon: 'Activity',
          category: 'MONITORING'
        }
      ];

  const thingsToAvoid: string[] = primaryMatch?.thingsToAvoid?.length
    ? primaryMatch.thingsToAvoid
    : [
        'Do NOT give human medicines (paracetamol, ibuprofen) without veterinary prescription.',
        'Do NOT force-feed or drench animals that are having difficulty swallowing.',
        'Do NOT allow sick animals to mix in communal pastures or shared watering ponds.',
        'Do NOT delay contacting a qualified veterinary practitioner.'
      ];

  const vaccinationGuidance: string[] = [
    primaryMatch?.vaccineGuidanceNote ||
      (primaryMatch?.vaccineAvailable
        ? `Vaccination against ${primaryMatch.diseaseName} is recommended for prevention in healthy livestock. Vaccines are not a treatment for already infected animals.`
        : 'No routine vaccine is available for this condition; prevention relies on strict biosecurity and movement restriction.')
  ];

  if (primaryMatch?.vaccineSchedule) {
    vaccinationGuidance.push(`Standard Schedule: ${primaryMatch.vaccineSchedule}`);
  }

  const preventiveActions: string[] = [
    'Quarantine all newly purchased or returned livestock for at least 14 days before herd integration.',
    'Spray animal sheds regularly with veterinary-approved fly and tick repellents.',
    'Disinfect footwear and vehicle wheels before entering animal enclosures.',
    'Provide clean, elevated water troughs and avoid stagnant monsoon puddle drinking.'
  ];

  const emergencySigns: string[] = primaryMatch?.emergencySigns?.length
    ? primaryMatch.emergencySigns
    : [
        'Sudden acute collapse or severe inability to stand (downer animal)',
        'Severe breathing distress, open-mouth gasping, or tongue protrusion',
        'High persistent fever above 105°F with muscle shivering',
        'Uncontrolled bloody diarrhea or dark blood from orifices'
      ];

  const requiresVet =
    level === 'HIGH' ||
    level === 'CRITICAL' ||
    hasSuddenDeath ||
    primaryMatch?.veterinaryUrgency === 'EMERGENCY' ||
    primaryMatch?.veterinaryUrgency === 'HIGH';

  const requiresLab =
    level === 'CRITICAL' ||
    (primaryMatch ? primaryMatch.notifiable || primaryMatch.zoonotic : false);

  return {
    score: clampedScore,
    level,
    symptomMatchScore: topMatchScore,
    nearbyClusterScore,
    affectedRateScore,
    mortalityScore,
    vaccinationScore,
    historicalTrendScore,
    weatherFactorScore,
    suspectedDiseases: topSuspected,
    contributingFactors,
    recommendedActions,
    supportiveCare: supportiveCareSteps,
    thingsToAvoid,
    vaccinationGuidance,
    preventiveActions,
    emergencySigns,
    requiresVeterinaryReview: requiresVet,
    requiresLabConfirmation: requiresLab,
    outbreakSignal,
    nearbyCasesCount,
    disclaimer:
      'Decision-Support Disclaimer: This calculation is an automated screening risk assessment and does not constitute a definitive medical diagnosis. A licensed veterinary officer must perform physical evaluation and laboratory verification.'
  };
}
