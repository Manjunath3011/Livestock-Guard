import {
  Case,
  Animal,
  Herd,
  User,
  Role,
  Species,
  CredibilityTier,
  CredibilityStatus,
  VerificationState,
  CredibilityWeightsConfig,
  CredibilityThresholdsConfig,
  ReportCredibilityFeatureBreakdown,
  ReportMLFeatureVector,
  CredibilityAssessmentResult,
  CredibilityOverviewMetrics,
  VerificationEvidenceItem,
  CredibilityAuditRecord
} from '../types';
import { DISEASES_DATABASE } from '../data/knowledgeBase';

export const DEFAULT_CREDIBILITY_WEIGHTS: CredibilityWeightsConfig = {
  dataQuality: 0.20,          // 20%
  duplicateSimilarity: 0.20,  // 20%
  locationConsistency: 0.15,  // 15%
  temporalConsistency: 0.10,  // 10%
  reporterHistory: 0.10,      // 10%
  animalHistory: 0.10,        // 10%
  evidenceStrength: 0.15      // 15%
};

export const DEFAULT_CREDIBILITY_THRESHOLDS: CredibilityThresholdsConfig = {
  trustedCutoff: 80,
  reviewCutoff: 50
};

// District Coordinates Reference (Centroids)
const DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  dt_pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  dt_satara: { lat: 17.6805, lng: 74.0183, name: 'Satara' },
  dt_belagavi: { lat: 15.8497, lng: 74.4977, name: 'Belagavi' },
  dt_anand: { lat: 22.5645, lng: 72.9289, name: 'Anand' },
  dt_meerut: { lat: 28.9845, lng: 77.7064, name: 'Meerut' },
  dt_ahmednagar: { lat: 19.0948, lng: 74.7480, name: 'Ahmednagar' },
  dt_solapur: { lat: 17.6599, lng: 75.9064, name: 'Solapur' },
  dt_kolhapur: { lat: 16.7050, lng: 74.2433, name: 'Kolhapur' }
};

// Known Zoonotic and High-Consequence Diseases requiring immediate safety override
const HIGH_CONSEQUENCE_DISEASE_KEYS = [
  'fmd', 'foot_and_mouth', 'anthrax', 'brucellosis', 'rabies', 'avian_influenza',
  'african_swine_fever', 'ppr', 'lumpy_skin', 'glanders', 'bovine_tb'
];

/**
 * Haversine formula for spatial distance between two points in km
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

export class ReportCredibilityEngine {
  private static weights: CredibilityWeightsConfig = { ...DEFAULT_CREDIBILITY_WEIGHTS };
  private static thresholds: CredibilityThresholdsConfig = { ...DEFAULT_CREDIBILITY_THRESHOLDS };

  public static getWeights(): CredibilityWeightsConfig {
    return { ...this.weights };
  }

  public static setWeights(newWeights: Partial<CredibilityWeightsConfig>) {
    this.weights = { ...this.weights, ...newWeights };
  }

  public static getThresholds(): CredibilityThresholdsConfig {
    return { ...this.thresholds };
  }

  public static setThresholds(newThresholds: Partial<CredibilityThresholdsConfig>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Evaluates report credibility using explainable multi-factor scoring
   */
  public static assessReportCredibility(params: {
    caseData: Partial<Case>;
    existingCases?: Case[];
    animals?: Animal[];
    herds?: Herd[];
    currentUser?: User | null;
    isOfflineSubmission?: boolean;
  }): CredibilityAssessmentResult {
    const {
      caseData,
      existingCases = [],
      animals = [],
      herds = [],
      currentUser,
      isOfflineSubmission = false
    } = params;

    const credibilityReasons: string[] = [];
    const anomalyFlags: string[] = [];
    const submittedTime = caseData.submittedAt ? new Date(caseData.submittedAt) : new Date();
    const now = new Date();

    // =========================================================================
    // 1. DATA QUALITY & BIOLOGICAL CONSISTENCY (Weight: 20%)
    // =========================================================================
    let dataQualityScore = 100;

    const affected = caseData.affectedCount ?? 1;
    const dead = caseData.deadCount ?? 0;

    // Check 1.1: Morbidity & Mortality numbers
    if (affected < 0) {
      dataQualityScore -= 40;
      anomalyFlags.push('NEGATIVE_AFFECTED_COUNT');
      credibilityReasons.push('⚠ Negative affected animal count reported');
    }

    if (dead < 0) {
      dataQualityScore -= 40;
      anomalyFlags.push('NEGATIVE_MORTALITY_COUNT');
      credibilityReasons.push('⚠ Negative mortality count reported');
    }

    if (dead > affected) {
      dataQualityScore -= 50;
      anomalyFlags.push('MORTALITY_EXCEEDS_AFFECTED');
      credibilityReasons.push('⚠ Contradiction: Reported deaths exceed total affected animals');
    }

    // Check 1.2: Biological age bounds
    if (caseData.ageYears !== undefined) {
      const age = caseData.ageYears;
      const species = caseData.species;
      let maxRealisticAge = 25;
      if (species === 'Poultry') maxRealisticAge = 6;
      else if (species === 'Sheep' || species === 'Goat') maxRealisticAge = 18;
      else if (species === 'Pig') maxRealisticAge = 15;

      if (age < 0 || age > maxRealisticAge) {
        dataQualityScore -= 30;
        anomalyFlags.push('IMPLAUSIBLE_ANIMAL_AGE');
        credibilityReasons.push(`⚠ Age (${age} yrs) outside expected biological range for ${species}`);
      }
    }

    // Check 1.3: Future timestamps beyond 2h clock skew tolerance
    const timeDiffMinutes = (submittedTime.getTime() - now.getTime()) / (1000 * 60);
    if (timeDiffMinutes > 120) {
      dataQualityScore -= 35;
      anomalyFlags.push('FUTURE_TIMESTAMP');
      credibilityReasons.push('⚠ Timestamp is in the future beyond allowed clock skew tolerance');
    }

    // Check 1.4: Required clinical details
    if (!caseData.symptoms || caseData.symptoms.length === 0) {
      dataQualityScore -= 30;
      anomalyFlags.push('MISSING_SYMPTOMS');
      credibilityReasons.push('⚠ No specific clinical symptoms recorded');
    } else {
      credibilityReasons.push(`✓ Recorded ${caseData.symptoms.length} clinical symptom observation(s)`);
    }

    // Check 1.5: Species / Disease compatibility
    if (caseData.suspectedDiseases && caseData.suspectedDiseases.length > 0 && caseData.species) {
      const topDiseaseId = caseData.suspectedDiseases[0].diseaseId;
      const dbEntry = DISEASES_DATABASE.find(d => d.id === topDiseaseId);
      if (dbEntry && dbEntry.affectedSpecies && !dbEntry.affectedSpecies.includes(caseData.species) && !dbEntry.affectedSpecies.includes('Other')) {
        dataQualityScore -= 25;
        anomalyFlags.push('SPECIES_DISEASE_INCOMPATIBILITY');
        credibilityReasons.push(`⚠ Disease ${dbEntry.name} rarely or never affects ${caseData.species}`);
      }
    }

    dataQualityScore = Math.max(0, Math.min(100, dataQualityScore));
    if (dataQualityScore >= 80) {
      credibilityReasons.push('✓ Clinical and numerical data fields biologically consistent');
    }

    // =========================================================================
    // 2. DUPLICATE REPORT & EVENT CORRELATION CHECK (Weight: 20%)
    // =========================================================================
    let duplicateSimilarityScore = 100;
    let duplicateOfCaseId: string | undefined = undefined;
    const relatedCaseIds: string[] = [];
    let eventCorrelationId: string | undefined = undefined;

    // Check for exact duplicate vs independent corroboration
    for (const c of existingCases) {
      if (c.id === caseData.id) continue;

      const isSameAnimal = caseData.animalId && c.animalId && caseData.animalId === c.animalId;
      const isSameTag = caseData.animalTag && c.animalTag && caseData.animalTag.trim().toUpperCase() === c.animalTag.trim().toUpperCase();
      const isSameReporter = caseData.reporterId && c.reporterId && caseData.reporterId === c.reporterId;
      const isSameSpecies = caseData.species && c.species && caseData.species === c.species;

      // Time proximity
      const cDate = new Date(c.createdAt || c.symptomsStartDate || now);
      const diffHours = Math.abs(submittedTime.getTime() - cDate.getTime()) / (1000 * 60 * 60);

      // Distance proximity
      const dist = (caseData.latitude && caseData.longitude && c.latitude && c.longitude)
        ? calculateDistanceKm(caseData.latitude, caseData.longitude, c.latitude, c.longitude)
        : (caseData.villageId && c.villageId && caseData.villageId === c.villageId ? 0 : 50);

      // Condition 2A: Exact duplicate report from same reporter within 48h
      if ((isSameAnimal || isSameTag || (isSameReporter && isSameSpecies && dist <= 2)) && diffHours <= 48) {
        duplicateSimilarityScore = 30;
        duplicateOfCaseId = c.id;
        anomalyFlags.push('POSSIBLE_DUPLICATE_REPORT');
        credibilityReasons.push(`⚠ Potential duplicate submission of Case #${c.caseNumber || c.id}`);
        break;
      }

      // Condition 2B: Event Correlation - Different independent users reporting in same vicinity
      if (!isSameReporter && isSameSpecies && dist <= 12 && diffHours <= 168) {
        // Within 12 km and within 7 days
        relatedCaseIds.push(c.id);
        eventCorrelationId = c.eventCorrelationId || `evt_${c.districtId || 'cluster'}_${Date.now()}`;
      }
    }

    if (relatedCaseIds.length > 0) {
      // Multiple independent reports of same outbreak strengthen signal!
      credibilityReasons.push(`✓ Independent epidemiological corroboration: aligns with ${relatedCaseIds.length} nearby report(s) in sector`);
      duplicateSimilarityScore = Math.min(100, duplicateSimilarityScore + 10);
    } else if (!duplicateOfCaseId) {
      credibilityReasons.push('✓ No duplicate reports detected in surveillance registry');
    }

    duplicateSimilarityScore = Math.max(0, Math.min(100, duplicateSimilarityScore));

    // =========================================================================
    // 3. LOCATION CONSISTENCY & ACCURACY (Weight: 15%)
    // =========================================================================
    let locationConsistencyScore = 85;
    let locationMatchScore = 85;

    const lat = Number(caseData.latitude);
    const lng = Number(caseData.longitude);
    const hasGps = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    if (!hasGps) {
      // Missing GPS: Do NOT mark fake! Deduct slight points and note administrative fallback
      locationConsistencyScore = 70;
      locationMatchScore = 70;
      credibilityReasons.push('ⓘ GPS coordinates not provided; location mapped to administrative village centroid');
    } else {
      // 3.1: Check if coordinates are within India's geographic bounding box
      const isInsideIndia = lat >= 6.0 && lat <= 37.5 && lng >= 68.0 && lng <= 98.0;
      if (!isInsideIndia) {
        locationConsistencyScore = 20;
        locationMatchScore = 20;
        anomalyFlags.push('COORDINATES_OUTSIDE_INDIA');
        credibilityReasons.push('⚠ GPS coordinates lie outside India surveillance boundary');
      } else {
        // 3.2: Compare with selected District Centroid if available
        const districtId = caseData.districtId || '';
        const centroid = DISTRICT_CENTROIDS[districtId];
        if (centroid) {
          const distToCentroid = calculateDistanceKm(lat, lng, centroid.lat, centroid.lng);
          if (distToCentroid > 85) {
            locationConsistencyScore = 40;
            locationMatchScore = 40;
            anomalyFlags.push('LOCATION_MISMATCH');
            credibilityReasons.push(`⚠ GPS coordinates are ${Math.round(distToCentroid)} km away from ${centroid.name} district centroid`);
          } else {
            locationConsistencyScore = 95;
            locationMatchScore = 95;
            credibilityReasons.push(`✓ GPS location verified within ${centroid.name} district perimeter (${Math.round(distToCentroid)} km from center)`);
          }
        } else {
          locationConsistencyScore = 85;
          locationMatchScore = 85;
          credibilityReasons.push('✓ GPS coordinates verified within regional surveillance zone');
        }

        // 3.3: GPS accuracy check if provided
        if (caseData.gpsAccuracy && caseData.gpsAccuracy > 500) {
          locationConsistencyScore -= 15;
          anomalyFlags.push('LOW_GPS_ACCURACY');
          credibilityReasons.push(`⚠ Low GPS accuracy reported (±${Math.round(caseData.gpsAccuracy)}m)`);
        }
      }
    }

    locationConsistencyScore = Math.max(0, Math.min(100, locationConsistencyScore));

    // =========================================================================
    // 4. TEMPORAL & SUBMISSION BURST ANOMALY (Weight: 10%)
    // =========================================================================
    let temporalConsistencyScore = 90;

    // Check submission frequency from this reporter in last 10 minutes
    if (caseData.reporterId) {
      const recentSameReporterCases = existingCases.filter(c => {
        if (c.reporterId !== caseData.reporterId || c.id === caseData.id) return false;
        const cTime = new Date(c.createdAt || 0).getTime();
        return Math.abs(submittedTime.getTime() - cTime) < 10 * 60 * 1000;
      });

      if (recentSameReporterCases.length >= 4) {
        temporalConsistencyScore = 35;
        anomalyFlags.push('SUBMISSION_BURST_ANOMALY');
        credibilityReasons.push(`⚠ Rapid submission burst: ${recentSameReporterCases.length + 1} reports from this user within 10 minutes`);
      } else {
        credibilityReasons.push('✓ Normal submission rate pattern observed');
      }
    }

    // Check device timestamp drift
    if (caseData.deviceTimestamp) {
      const deviceTime = new Date(caseData.deviceTimestamp).getTime();
      const diffHours = Math.abs(submittedTime.getTime() - deviceTime) / (1000 * 60 * 60);
      if (diffHours > 24) {
        temporalConsistencyScore -= 20;
        anomalyFlags.push('DEVICE_CLOCK_DRIFT');
        credibilityReasons.push('⚠ Discrepancy between device clock and server submission time');
      }
    }

    temporalConsistencyScore = Math.max(0, Math.min(100, temporalConsistencyScore));

    // =========================================================================
    // 5. REPORTER HISTORY & TRUST SCORE (Weight: 10%)
    // =========================================================================
    // Neutral baseline for new users: 50–60 (never automatically suspicious)
    let reporterTrustScore = 60;
    const role = currentUser?.role || caseData.reporterRole || 'FARMER';

    if (role === 'VETERINARIAN' || role === 'DIAGNOSTIC_LAB' || role === 'DISTRICT_OFFICIAL' || role === 'STATE_ADMIN') {
      reporterTrustScore = 85;
    } else if (role === 'FIELD_WORKER') {
      reporterTrustScore = 75;
    }

    // Evolve trust score based on user's past verified vs rejected records
    if (caseData.reporterId) {
      const pastCases = existingCases.filter(c => c.reporterId === caseData.reporterId && c.id !== caseData.id);
      if (pastCases.length > 0) {
        const verifiedCount = pastCases.filter(c => c.credibilityStatus === 'VERIFIED' || c.status === 'CONFIRMED').length;
        const rejectedCount = pastCases.filter(c => c.credibilityStatus === 'REJECTED' || c.status === 'RULED_OUT').length;

        reporterTrustScore += Math.min(25, verifiedCount * 5);
        reporterTrustScore -= Math.min(35, rejectedCount * 15);

        if (verifiedCount >= 2) {
          credibilityReasons.push(`✓ Reporter has ${verifiedCount} previously verified report(s)`);
        }
      } else {
        credibilityReasons.push('ⓘ New reporter account (evaluated with neutral baseline)');
      }
    }

    reporterTrustScore = Math.max(10, Math.min(100, reporterTrustScore));
    const reporterHistoryScore = reporterTrustScore;

    // =========================================================================
    // 6. ANIMAL & HERD HISTORY CONSISTENCY (Weight: 10%)
    // =========================================================================
    let animalHistoryConsistencyScore = 70;

    if (caseData.animalId) {
      const existingAnimal = animals.find(a => a.id === caseData.animalId);
      if (existingAnimal) {
        animalHistoryConsistencyScore = 90;
        if (existingAnimal.species === caseData.species) {
          animalHistoryConsistencyScore += 10;
          credibilityReasons.push(`✓ Animal record verified on central registry (${existingAnimal.tagNumber || existingAnimal.name})`);
        } else {
          animalHistoryConsistencyScore -= 30;
          anomalyFlags.push('ANIMAL_SPECIES_MISMATCH');
          credibilityReasons.push(`⚠ Registered animal species (${existingAnimal.species}) differs from report (${caseData.species})`);
        }
      } else {
        animalHistoryConsistencyScore = 60;
        credibilityReasons.push('ⓘ Tag not in primary registry; untagged or temporary identifier');
      }
    } else {
      animalHistoryConsistencyScore = 65;
      credibilityReasons.push('ⓘ Untagged/temporary livestock profile');
    }

    // Check herd consistency
    if (caseData.herdId) {
      const existingHerd = herds.find(h => h.id === caseData.herdId);
      if (existingHerd) {
        if (caseData.affectedCount && caseData.affectedCount > existingHerd.totalAnimals) {
          animalHistoryConsistencyScore -= 20;
          anomalyFlags.push('HERD_COUNT_MISMATCH');
          credibilityReasons.push(`⚠ Affected count (${caseData.affectedCount}) exceeds registered herd size (${existingHerd.totalAnimals})`);
        } else {
          credibilityReasons.push(`✓ Herd profile validated (${existingHerd.name})`);
        }
      }
    }

    animalHistoryConsistencyScore = Math.max(0, Math.min(100, animalHistoryConsistencyScore));

    // =========================================================================
    // 7. EVIDENCE & VERIFICATION STRENGTH (Weight: 15%)
    // =========================================================================
    let evidenceStrengthScore = 40; // Base unverified report

    if (caseData.verificationState === 'LAB_CONFIRMED' || caseData.status === 'CONFIRMED') {
      evidenceStrengthScore = 100;
      credibilityReasons.push('✓ Laboratory diagnostic confirmation on file');
    } else if (caseData.verificationState === 'VET_VERIFIED') {
      evidenceStrengthScore = 90;
      credibilityReasons.push('✓ Clinical signs verified in person by Veterinary Officer');
    } else if (caseData.verificationState === 'FIELD_VERIFIED') {
      evidenceStrengthScore = 80;
      credibilityReasons.push('✓ Ground inspection completed by Field Worker / Para-Vet');
    } else if (caseData.sampleIds && caseData.sampleIds.length > 0) {
      evidenceStrengthScore = 75;
      credibilityReasons.push('✓ Biological diagnostic sample collected for testing');
    } else if (caseData.verificationEvidence && caseData.verificationEvidence.length > 0) {
      evidenceStrengthScore = 65;
      credibilityReasons.push(`✓ Supporting diagnostic evidence attached (${caseData.verificationEvidence.length} item(s))`);
    } else {
      credibilityReasons.push('ⓘ Initial report awaiting ground clinical verification');
    }

    evidenceStrengthScore = Math.max(0, Math.min(100, evidenceStrengthScore));

    // =========================================================================
    // COMPUTE OVERALL WEIGHTED CREDIBILITY SCORE
    // =========================================================================
    const w = this.weights;
    const finalScore = Math.round(
      dataQualityScore * w.dataQuality +
      duplicateSimilarityScore * w.duplicateSimilarity +
      locationConsistencyScore * w.locationConsistency +
      temporalConsistencyScore * w.temporalConsistency +
      reporterHistoryScore * w.reporterHistory +
      animalHistoryConsistencyScore * w.animalHistory +
      evidenceStrengthScore * w.evidenceStrength
    );

    const boundedScore = Math.max(5, Math.min(100, finalScore));

    // Determine Credibility Tier
    let credibilityTier: CredibilityTier = 'REVIEW';
    if (boundedScore >= this.thresholds.trustedCutoff) {
      credibilityTier = 'TRUSTED';
    } else if (boundedScore < this.thresholds.reviewCutoff) {
      credibilityTier = 'LOW_CREDIBILITY';
    }

    // Determine Verification Status
    let credibilityStatus: CredibilityStatus = 'PENDING';
    if (caseData.verificationState === 'VET_VERIFIED' || caseData.verificationState === 'LAB_CONFIRMED' || caseData.status === 'CONFIRMED') {
      credibilityStatus = 'VERIFIED';
    } else if (credibilityTier === 'LOW_CREDIBILITY' || anomalyFlags.length >= 2) {
      credibilityStatus = 'NEEDS_VERIFICATION';
    } else if (credibilityTier === 'TRUSTED') {
      credibilityStatus = 'PENDING';
    }

    // Determine Verification State if not already set
    let verificationState: VerificationState = caseData.verificationState || 'NOT_REVIEWED';
    if (caseData.status === 'CONFIRMED') {
      verificationState = 'LAB_CONFIRMED';
    }

    // =========================================================================
    // SAFETY PRINCIPLE: CRITICAL ALERT OVERRIDE
    // =========================================================================
    // NEVER automatically reject or suppress a report because its credibility is low.
    // If report indicates sudden mortality, suspected zoonotic disease, or high-consequence outbreak,
    // escalate immediately for human verification!
    let isCriticalUrgentVerification = false;
    let urgentReason: string | undefined = undefined;

    const hasMortality = dead > 0;
    const topDiseaseName = (caseData.suspectedDiseases?.[0]?.diseaseName || '').toLowerCase();
    const isHighConsequence = HIGH_CONSEQUENCE_DISEASE_KEYS.some(k => topDiseaseName.includes(k));
    const isZoonotic = caseData.suspectedDiseases?.[0]?.zoonotic === true || topDiseaseName.includes('anthrax') || topDiseaseName.includes('rabies');
    const isSurge = affected >= 5;

    if (hasMortality || isHighConsequence || isZoonotic || isSurge) {
      isCriticalUrgentVerification = true;
      urgentReason = `URGENT EPIDEMIOLOGICAL ESCALATION: ${
        hasMortality ? `${dead} livestock mortality reported.` : ''
      } ${isZoonotic ? 'Suspected zoonotic pathogen risk.' : ''} ${
        isHighConsequence ? 'High-consequence notifiable condition.' : ''
      } Immediate in-person field verification prioritized.`;

      credibilityReasons.unshift(`⚡ High Consequence Trigger: Prioritized for urgent verification (${urgentReason.split('.')[0]})`);
    }

    // =========================================================================
    // STRUCTURED ML FEATURE VECTOR
    // =========================================================================
    const mlFeatureVector: ReportMLFeatureVector = {
      dataQualityScore: dataQualityScore / 100,
      duplicateSimilarityScore: duplicateSimilarityScore / 100,
      locationConsistencyScore: locationConsistencyScore / 100,
      temporalConsistencyScore: temporalConsistencyScore / 100,
      reporterTrustScore: reporterTrustScore / 100,
      animalHistoryConsistencyScore: animalHistoryConsistencyScore / 100,
      evidenceStrengthScore: evidenceStrengthScore / 100,
      hasMortality: hasMortality ? 1 : 0,
      isZoonoticSuspected: isZoonotic ? 1 : 0,
      affectedCountNormalized: Math.min(1, affected / 20),
      hasGps: hasGps ? 1 : 0,
      gpsDistanceKm: (hasGps && caseData.districtId && DISTRICT_CENTROIDS[caseData.districtId])
        ? calculateDistanceKm(lat, lng, DISTRICT_CENTROIDS[caseData.districtId].lat, DISTRICT_CENTROIDS[caseData.districtId].lng)
        : 0,
      reporterRoleWeight: role === 'VETERINARIAN' ? 1.0 : role === 'FIELD_WORKER' ? 0.8 : 0.5,
      hasLabSample: (caseData.sampleIds && caseData.sampleIds.length > 0) ? 1 : 0,
      verifiedByFieldOrVet: (verificationState === 'FIELD_VERIFIED' || verificationState === 'VET_VERIFIED' || verificationState === 'LAB_CONFIRMED') ? 1 : 0
    };

    return {
      credibilityScore: boundedScore,
      credibilityTier,
      credibilityStatus,
      verificationState,
      credibilityReasons,
      anomalyFlags,
      locationMatchScore,
      reporterTrustScore,
      animalHistoryConsistencyScore,
      credibilityFeatureBreakdown: {
        dataQuality: Math.round(dataQualityScore),
        duplicateSimilarity: Math.round(duplicateSimilarityScore),
        locationConsistency: Math.round(locationConsistencyScore),
        temporalConsistency: Math.round(temporalConsistencyScore),
        reporterHistory: Math.round(reporterHistoryScore),
        animalHistory: Math.round(animalHistoryConsistencyScore),
        evidenceStrength: Math.round(evidenceStrengthScore)
      },
      mlFeatureVector,
      isCriticalUrgentVerification,
      urgentReason,
      duplicateOfCaseId,
      relatedCaseIds: relatedCaseIds.length > 0 ? relatedCaseIds : undefined,
      eventCorrelationId
    };
  }

  /**
   * Applies verification transition with RBAC enforcement and audit logging
   */
  public static verifyCase(params: {
    caseRecord: Case;
    action: 'FIELD_VERIFY' | 'VET_VERIFY' | 'LAB_CONFIRM' | 'REQUEST_INFO' | 'REJECT' | 'DISMISS';
    actor: User;
    notes: string;
    evidence?: VerificationEvidenceItem;
    rejectionReason?: string;
  }): { updatedCase: Case; auditEntry: CredibilityAuditRecord } {
    const { caseRecord, action, actor, notes, evidence, rejectionReason } = params;

    // RBAC Security Check
    if (actor.role === 'FARMER') {
      throw new Error('Unauthorized: Farmers are not permitted to alter verification status or audit records.');
    }

    const previousStatus = caseRecord.credibilityStatus || 'PENDING';
    const timestamp = new Date().toISOString();
    let newStatus: CredibilityStatus = previousStatus;
    let newVerificationState: VerificationState = caseRecord.verificationState || 'NOT_REVIEWED';
    let newScore = caseRecord.credibilityScore || 65;

    if (action === 'FIELD_VERIFY') {
      newStatus = 'VERIFIED';
      newVerificationState = 'FIELD_VERIFIED';
      newScore = Math.min(100, Math.max(newScore, 85));
      caseRecord.verifiedBy = actor.name;
      caseRecord.verifiedAt = timestamp;
      caseRecord.verificationNotes = notes;
    } else if (action === 'VET_VERIFY') {
      newStatus = 'VERIFIED';
      newVerificationState = 'VET_VERIFIED';
      newScore = Math.min(100, Math.max(newScore, 92));
      caseRecord.verifiedBy = actor.name;
      caseRecord.verifiedAt = timestamp;
      caseRecord.verificationNotes = notes;
    } else if (action === 'LAB_CONFIRM') {
      newStatus = 'VERIFIED';
      newVerificationState = 'LAB_CONFIRMED';
      newScore = 100;
      caseRecord.status = 'CONFIRMED';
      caseRecord.verifiedBy = actor.name;
      caseRecord.verifiedAt = timestamp;
      caseRecord.verificationNotes = notes;
    } else if (action === 'REQUEST_INFO') {
      newStatus = 'NEEDS_VERIFICATION';
      caseRecord.verificationNotes = notes;
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      newVerificationState = 'REJECTED';
      caseRecord.status = 'REJECTED';
      caseRecord.rejectionReason = rejectionReason || notes;
      caseRecord.rejectedBy = actor.name;
      caseRecord.rejectedAt = timestamp;
      newScore = Math.min(newScore, 25);
    } else if (action === 'DISMISS') {
      newStatus = 'DISMISSED';
      caseRecord.status = 'CLOSED';
    }

    // Attach evidence if supplied
    if (evidence) {
      if (!caseRecord.verificationEvidence) caseRecord.verificationEvidence = [];
      caseRecord.verificationEvidence.push({
        ...evidence,
        addedBy: actor.name,
        addedAt: timestamp
      });
    }

    // Create Audit Log Record
    const auditEntry: CredibilityAuditRecord = {
      id: `aud_cred_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: action === 'FIELD_VERIFY' ? 'FIELD_VERIFIED' :
              action === 'VET_VERIFY' ? 'VET_VERIFIED' :
              action === 'LAB_CONFIRM' ? 'LAB_CONFIRMED' :
              action === 'REQUEST_INFO' ? 'MORE_INFO_REQUESTED' :
              action === 'REJECT' ? 'REJECTED' : 'STATUS_CHANGED',
      previousStatus,
      newStatus,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp,
      reason: notes || rejectionReason || 'Verification review updated',
      evidenceReference: evidence?.reference
    };

    if (!caseRecord.credibilityAuditTrail) caseRecord.credibilityAuditTrail = [];
    caseRecord.credibilityAuditTrail.unshift(auditEntry);

    // Update case record
    caseRecord.credibilityStatus = newStatus;
    caseRecord.verificationState = newVerificationState;
    caseRecord.credibilityScore = newScore;
    caseRecord.credibilityTier = newScore >= 80 ? 'TRUSTED' : newScore < 50 ? 'LOW_CREDIBILITY' : 'REVIEW';
    caseRecord.updatedAt = timestamp;

    return { updatedCase: caseRecord, auditEntry };
  }

  /**
   * Calculates overall credibility and surveillance quality metrics for Admin & Officials
   */
  public static computeOverviewMetrics(cases: Case[]): CredibilityOverviewMetrics {
    const total = (cases || []).length;
    if (total === 0) {
      return {
        totalReports: 0,
        verifiedCount: 0,
        needsVerificationCount: 0,
        lowCredibilityCount: 0,
        rejectedCount: 0,
        duplicateReportsCount: 0,
        locationAnomaliesCount: 0,
        burstAnomaliesCount: 0,
        verificationBacklogCount: 0,
        averageCredibilityScore: 0
      };
    }

    let verified = 0;
    let needsVerification = 0;
    let lowCredibility = 0;
    let rejected = 0;
    let duplicates = 0;
    let locationAnomalies = 0;
    let burstAnomalies = 0;
    let totalScore = 0;

    cases.forEach(c => {
      const score = c.credibilityScore ?? 75;
      totalScore += score;

      if (c.credibilityStatus === 'VERIFIED' || c.verificationState === 'FIELD_VERIFIED' || c.verificationState === 'VET_VERIFIED' || c.verificationState === 'LAB_CONFIRMED') {
        verified++;
      } else if (c.credibilityStatus === 'REJECTED' || c.status === 'REJECTED') {
        rejected++;
      } else if (c.credibilityStatus === 'NEEDS_VERIFICATION' || (c.anomalyFlags && c.anomalyFlags.length > 0)) {
        needsVerification++;
      }

      if (c.credibilityTier === 'LOW_CREDIBILITY' || score < 50) {
        lowCredibility++;
      }

      if (c.duplicateOfCaseId || c.anomalyFlags?.includes('POSSIBLE_DUPLICATE_REPORT')) {
        duplicates++;
      }

      if (c.anomalyFlags?.includes('LOCATION_MISMATCH') || c.anomalyFlags?.includes('COORDINATES_OUTSIDE_INDIA')) {
        locationAnomalies++;
      }

      if (c.anomalyFlags?.includes('SUBMISSION_BURST_ANOMALY')) {
        burstAnomalies++;
      }
    });

    const backlog = needsVerification + (cases.filter(c => c.isCriticalUrgentVerification && c.credibilityStatus !== 'VERIFIED').length);

    return {
      totalReports: total,
      verifiedCount: verified,
      needsVerificationCount: needsVerification,
      lowCredibilityCount: lowCredibility,
      rejectedCount: rejected,
      duplicateReportsCount: duplicates,
      locationAnomaliesCount: locationAnomalies,
      burstAnomaliesCount: burstAnomalies,
      verificationBacklogCount: backlog,
      averageCredibilityScore: Math.round(totalScore / total)
    };
  }
}
