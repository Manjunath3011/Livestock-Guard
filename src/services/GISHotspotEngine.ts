import {
  Case,
  Outbreak,
  MortalityReport,
  LabSample,
  Species,
  RiskLevel,
  User,
  Role,
  Alert
} from '../types';
import {
  HotspotCluster,
  HotspotRiskTier,
  DiseaseActivityClassification,
  DiseaseActivityTrend,
  SurveillanceTimeWindow,
  HotspotRiskBreakdown,
  HotspotFactorItem
} from '../types/gis';
import { notificationService } from './NotificationService';
import { store } from './store';

// Known severe diseases with higher epidemiological threat weights
const SEVERE_DISEASES: Record<string, { weight: number; label: string }> = {
  dis_fmd: { weight: 19, label: 'Foot-and-Mouth Disease (FMD)' },
  dis_anthrax: { weight: 20, label: 'Anthrax' },
  dis_ppr: { weight: 18, label: 'Peste des Petits Ruminants (PPR)' },
  dis_lsd: { weight: 16, label: 'Lumpy Skin Disease (LSD)' },
  dis_rabies: { weight: 20, label: 'Rabies' },
  dis_brucellosis: { weight: 15, label: 'Brucellosis' },
  dis_hs: { weight: 18, label: 'Haemorrhagic Septicaemia (HS)' },
  dis_bq: { weight: 17, label: 'Blackquarter (BQ)' },
  dis_avian_flu: { weight: 20, label: 'Avian Influenza' },
  dis_african_swine: { weight: 20, label: 'African Swine Fever' }
};

// Default fallback coordinates for major Indian districts
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  dt_pune: { lat: 18.5204, lng: 73.8567 },
  dt_satara: { lat: 17.6805, lng: 74.0183 },
  dt_belagavi: { lat: 15.8497, lng: 74.4977 },
  dt_anand: { lat: 22.5645, lng: 72.9289 },
  dt_meerut: { lat: 28.9845, lng: 77.7064 },
  dt_kolhapur: { lat: 16.7050, lng: 74.2433 },
  dt_ahmednagar: { lat: 19.0948, lng: 74.7480 },
  dt_solapur: { lat: 17.6599, lng: 75.9064 },
  dt_sangli: { lat: 16.8524, lng: 74.5815 },
  dt_dharwad: { lat: 15.4589, lng: 75.0078 },
  dt_vadodara: { lat: 22.3072, lng: 73.1812 },
  dt_kheda: { lat: 22.7533, lng: 72.6833 }
};

export class GISHotspotEngine {
  /**
   * Calculate Haversine distance in kilometers between two lat/lng points
   */
  public static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 99999;
    const R = 6371; // Earth radius in km
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

  /**
   * Filter cases and entities based on selected Surveillance Time Window
   */
  public static filterByTimeWindow<T extends { createdAt?: string; reportedAt?: string; startDate?: string }>(
    items: T[],
    timeWindow: SurveillanceTimeWindow,
    referenceDate: Date = new Date('2026-08-24T12:00:00Z') // App baseline date
  ): { current: T[]; previous: T[] } {
    if (!items || !Array.isArray(items)) return { current: [], previous: [] };
    if (timeWindow === 'ALL') {
      return { current: items, previous: [] };
    }

    let windowHours = 24 * 30; // default 30 days
    if (timeWindow === '24h') windowHours = 24;
    else if (timeWindow === '7d') windowHours = 24 * 7;
    else if (timeWindow === '30d') windowHours = 24 * 30;
    else if (timeWindow === '90d') windowHours = 24 * 90;

    const windowMs = windowHours * 60 * 60 * 1000;
    const refMs = referenceDate.getTime();
    const currentStartMs = refMs - windowMs;
    const previousStartMs = refMs - windowMs * 2;

    const current: T[] = [];
    const previous: T[] = [];

    items.forEach(item => {
      const dateStr = item.createdAt || item.reportedAt || item.startDate;
      if (!dateStr) {
        current.push(item);
        return;
      }
      const itemMs = new Date(dateStr).getTime();
      if (isNaN(itemMs)) {
        current.push(item);
        return;
      }

      if (itemMs >= currentStartMs && itemMs <= refMs) {
        current.push(item);
      } else if (itemMs >= previousStartMs && itemMs < currentStartMs) {
        previous.push(item);
      }
    });

    return { current, previous };
  }

  /**
   * Main cluster and hotspot analysis pipeline
   */
  public static detectHotspots(params: {
    cases: Case[];
    outbreaks: Outbreak[];
    mortalities?: MortalityReport[];
    labSamples?: LabSample[];
    timeWindow?: SurveillanceTimeWindow;
    speciesFilter?: string;
    riskFilter?: string;
    currentUser?: User | null;
  }): HotspotCluster[] {
    const {
      cases = [],
      outbreaks = [],
      mortalities = [],
      labSamples = [],
      timeWindow = 'ALL',
      speciesFilter = 'ALL',
      riskFilter = 'ALL'
    } = params;

    // 1. Time filtering
    const { current: timeFilteredCases, previous: previousCases } = this.filterByTimeWindow(
      cases,
      timeWindow
    );

    // 2. Species and Risk level filtering
    const activeCases = timeFilteredCases.filter(c => {
      if (!c) return false;
      if (speciesFilter !== 'ALL' && c.species !== speciesFilter) return false;
      if (riskFilter !== 'ALL' && c.riskLevel !== riskFilter) return false;
      return true;
    });

    // 3. Cluster grouping algorithm (Spatial agglomeration by ~30km radius & district anchor)
    const clusterMap = new Map<string, {
      cases: Case[];
      prevCases: Case[];
      outbreaks: Outbreak[];
      mortalities: MortalityReport[];
      labSamples: LabSample[];
      centerLat: number;
      centerLng: number;
      districtName: string;
      districtId: string;
      stateName: string;
      stateId: string;
      villages: Set<string>;
      speciesSet: Set<Species>;
      diseases: Map<string, number>;
    }>();

    // Helper to safely get lat/lng
    const getCoordinates = (item: any): { lat: number; lng: number } => {
      let lat = Number(item.latitude);
      let lng = Number(item.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
      if (item.districtId && DISTRICT_COORDS[item.districtId]) {
        return DISTRICT_COORDS[item.districtId];
      }
      return { lat: 18.5204, lng: 73.8567 }; // Pune default fallback
    };

    // Cluster seed creation from cases
    activeCases.forEach(c => {
      const coords = getCoordinates(c);
      const districtId = c.districtId || 'dt_pune';
      const districtName = c.districtName || 'Pune';
      const stateId = c.stateId || 'st_mah';
      const stateName = c.stateName || 'Maharashtra';
      const diseaseName = c.suspectedDiseases?.[0]?.diseaseName || 'Suspected Illness';

      // Look for existing nearby cluster within 35 km
      let matchedClusterKey: string | null = null;
      for (const [key, cl] of clusterMap.entries()) {
        const dist = this.calculateDistanceKm(coords.lat, coords.lng, cl.centerLat, cl.centerLng);
        if (dist <= 35 || cl.districtId === districtId) {
          matchedClusterKey = key;
          break;
        }
      }

      if (!matchedClusterKey) {
        matchedClusterKey = `cluster_${districtId}_${c.villageId || c.villageName || Math.random().toString(36).substring(2, 7)}`;
        clusterMap.set(matchedClusterKey, {
          cases: [],
          prevCases: [],
          outbreaks: [],
          mortalities: [],
          labSamples: [],
          centerLat: coords.lat,
          centerLng: coords.lng,
          districtName,
          districtId,
          stateName,
          stateId,
          villages: new Set<string>(),
          speciesSet: new Set<Species>(),
          diseases: new Map<string, number>()
        });
      }

      const cluster = clusterMap.get(matchedClusterKey)!;
      cluster.cases.push(c);
      if (c.villageName) cluster.villages.add(c.villageName);
      if (c.species) cluster.speciesSet.add(c.species);
      cluster.diseases.set(diseaseName, (cluster.diseases.get(diseaseName) || 0) + 1);

      // Dynamically refine cluster centroid
      const totalInCluster = cluster.cases.length;
      cluster.centerLat = (cluster.centerLat * (totalInCluster - 1) + coords.lat) / totalInCluster;
      cluster.centerLng = (cluster.centerLng * (totalInCluster - 1) + coords.lng) / totalInCluster;
    });

    // Also associate previous period cases to clusters for accurate trend computation
    previousCases.forEach(prevC => {
      const coords = getCoordinates(prevC);
      for (const cl of clusterMap.values()) {
        const dist = this.calculateDistanceKm(coords.lat, coords.lng, cl.centerLat, cl.centerLng);
        if (dist <= 40 || cl.districtId === prevC.districtId) {
          cl.prevCases.push(prevC);
          break;
        }
      }
    });

    // Associate active outbreaks with clusters
    (outbreaks || []).forEach(outb => {
      const coords = getCoordinates(outb);
      let matched = false;
      for (const cl of clusterMap.values()) {
        const dist = this.calculateDistanceKm(coords.lat, coords.lng, cl.centerLat, cl.centerLng);
        if (dist <= (outb.radiusKm || 15) + 20 || cl.districtName.toLowerCase() === (outb.districtName || '').toLowerCase()) {
          cl.outbreaks.push(outb);
          if (outb.diseaseName) {
            cl.diseases.set(outb.diseaseName, (cl.diseases.get(outb.diseaseName) || 0) + 3);
          }
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Create an outbreak-centered cluster if none matched
        const key = `cluster_outb_${outb.id}`;
        const diseases = new Map<string, number>();
        if (outb.diseaseName) diseases.set(outb.diseaseName, 5);
        clusterMap.set(key, {
          cases: [],
          prevCases: [],
          outbreaks: [outb],
          mortalities: [],
          labSamples: [],
          centerLat: coords.lat,
          centerLng: coords.lng,
          districtName: outb.districtName || 'Surveillance District',
          districtId: 'dt_outb',
          stateName: outb.stateName || 'State',
          stateId: 'st_outb',
          villages: new Set<string>([outb.primaryVillage || 'Primary Outbreak Area']),
          speciesSet: new Set<Species>(outb.species || ['Cattle']),
          diseases
        });
      }
    });

    // Associate mortalities with clusters
    (mortalities || []).forEach(m => {
      const coords = getCoordinates(m);
      for (const cl of clusterMap.values()) {
        const dist = this.calculateDistanceKm(coords.lat, coords.lng, cl.centerLat, cl.centerLng);
        if (dist <= 30) {
          cl.mortalities.push(m);
          break;
        }
      }
    });

    // Associate lab samples
    (labSamples || []).forEach(s => {
      for (const cl of clusterMap.values()) {
        if (cl.cases.some(c => c.sampleIds?.includes(s.id)) || (s.laboratoryName && s.laboratoryName.toLowerCase().includes(cl.districtName.toLowerCase()))) {
          cl.labSamples.push(s);
        }
      }
    });

    // 4. Calculate Risk Scoring, Trend, Classification and Recommendations for each cluster
    const results: HotspotCluster[] = [];

    clusterMap.forEach((cl, key) => {
      const totalCases = cl.cases.length;
      const totalPrevCases = cl.prevCases.length;
      const totalAffectedAnimals = cl.cases.reduce((sum, c) => sum + (c.affectedCount || 1), 0) +
        cl.outbreaks.reduce((sum, o) => sum + (o.affectedAnimalCount || 0), 0);
      const totalDeaths = cl.cases.reduce((sum, c) => sum + (c.deadCount || 0), 0) +
        cl.mortalities.reduce((sum, m) => sum + (m.deadCount || 0), 0) +
        cl.outbreaks.reduce((sum, o) => sum + (o.totalDeaths || 0), 0);

      // Determine Primary Disease
      let primaryDisease = 'Undetermined Bovine/Ruminant Illness';
      let highestDiseaseCount = 0;
      cl.diseases.forEach((count, dName) => {
        if (count > highestDiseaseCount) {
          highestDiseaseCount = count;
          primaryDisease = dName;
        }
      });

      // Lab and Outbreak Confirmation Status
      const hasOfficialOutbreak = cl.outbreaks.length > 0;
      const officialOutbreak = cl.outbreaks[0];
      const hasPositiveLab = cl.labSamples.some(s => s.result === 'POSITIVE') ||
        cl.cases.some(c => c.status === 'CONFIRMED');

      let confirmationStatus: HotspotCluster['confirmationStatus'] = 'SUSPECTED';
      if (hasPositiveLab) {
        confirmationStatus = 'LAB_CONFIRMED';
      } else if (hasOfficialOutbreak) {
        confirmationStatus = 'OFFICIALLY_DECLARED';
      } else if (cl.cases.some(c => c.suspectedDiseases?.some(d => d.screeningScore >= 80))) {
        confirmationStatus = 'ML_SCREENED_ONLY';
      }

      // Compute transparent risk breakdown
      const riskBreakdown = this.computeRiskScore({
        caseCount: totalCases,
        prevCaseCount: totalPrevCases,
        affectedCount: totalAffectedAnimals,
        deathCount: totalDeaths,
        primaryDisease,
        hasPositiveLab,
        hasOfficialOutbreak,
        cases: cl.cases,
        timeWindow
      });

      const riskScore = riskBreakdown.totalScore;

      // Determine Risk Tier
      let riskTier: HotspotRiskTier = 'LOW';
      if (riskScore >= 81) riskTier = 'CRITICAL';
      else if (riskScore >= 56) riskTier = 'HIGH';
      else if (riskScore >= 26) riskTier = 'MODERATE';
      else riskTier = 'LOW';

      // Compute Trend
      const { trend, trendChangePct } = this.calculateTrend(totalCases, totalPrevCases, timeWindow);

      // Determine Classification
      let classification: DiseaseActivityClassification = 'NORMAL_ACTIVITY';
      if (hasOfficialOutbreak || (hasPositiveLab && totalCases >= 2)) {
        classification = 'CONFIRMED_OUTBREAK';
      } else if (riskTier === 'CRITICAL' || (riskTier === 'HIGH' && totalCases >= 2)) {
        classification = 'HIGH_RISK_CLUSTER';
      } else if (totalCases >= 2 || riskTier === 'MODERATE') {
        classification = 'SUSPECTED_CLUSTER';
      } else if (totalCases === 1 || totalAffectedAnimals >= 2) {
        classification = 'INCREASED_ACTIVITY';
      } else {
        classification = 'NORMAL_ACTIVITY';
      }

      // Dates
      const caseDates = cl.cases
        .map(c => c.createdAt || c.symptomsStartDate)
        .filter(Boolean)
        .sort();
      const latestReportDate = caseDates[caseDates.length - 1] || new Date().toISOString();
      const firstReportDate = caseDates[0] || latestReportDate;

      // Radius in km based on cluster density
      const radiusKm = Math.min(25, Math.max(8, totalCases * 3 + (hasOfficialOutbreak ? 8 : 4)));

      // Name
      const villageList = Array.from(cl.villages);
      const villageStr = villageList.length > 0 ? villageList.slice(0, 2).join(' & ') : 'Rural Perimeter';
      const clusterName = `${cl.districtName} (${villageStr}) - ${primaryDisease.split('(')[0].trim()}`;

      // Role-specific recommendations
      const recommendedActions = this.generateRecommendations(
        primaryDisease,
        riskTier,
        classification,
        hasPositiveLab,
        Array.from(cl.speciesSet)
      );

      results.push({
        id: key,
        name: clusterName,
        centerLat: cl.centerLat,
        centerLng: cl.centerLng,
        radiusKm,
        districtName: cl.districtName,
        districtId: cl.districtId,
        stateName: cl.stateName,
        stateId: cl.stateId,
        villages: villageList,
        primaryDisease,
        species: Array.from(cl.speciesSet),
        classification,
        riskTier,
        riskScore,
        riskBreakdown,
        trend,
        trendChangePct,
        currentPeriodCaseCount: totalCases,
        previousPeriodCaseCount: totalPrevCases,
        totalAffectedAnimals,
        totalDeaths,
        confirmationStatus,
        hasOfficialOutbreak,
        officialOutbreakCode: officialOutbreak?.outbreakCode,
        hasPositiveLab,
        caseIds: cl.cases.map(c => c.id),
        latestReportDate,
        firstReportDate,
        recommendedActions
      });
    });

    // Sort by risk score descending
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Transparent Hotspot Risk Scoring (0 to 100)
   */
  private static computeRiskScore(params: {
    caseCount: number;
    prevCaseCount: number;
    affectedCount: number;
    deathCount: number;
    primaryDisease: string;
    hasPositiveLab: boolean;
    hasOfficialOutbreak: boolean;
    cases: Case[];
    timeWindow: SurveillanceTimeWindow;
  }): HotspotRiskBreakdown {
    const {
      caseCount,
      prevCaseCount,
      affectedCount,
      deathCount,
      primaryDisease,
      hasPositiveLab,
      hasOfficialOutbreak,
      cases,
      timeWindow
    } = params;

    const factors: HotspotFactorItem[] = [];

    // Factor A: Case Density (max 20 pts)
    let caseDensityScore = Math.min(20, caseCount * 5);
    factors.push({
      id: 'f_case_density',
      label: 'Reported Case Density',
      score: caseDensityScore,
      maxScore: 20,
      description: `${caseCount} clinical reports within geographic cluster zone.`
    });

    // Factor B: Affected Animals & Mortality Impact (max 15 pts)
    let affectedScore = Math.min(10, Math.floor(affectedCount * 1.5)) + Math.min(5, deathCount * 2.5);
    affectedScore = Math.min(15, affectedScore);
    factors.push({
      id: 'f_affected',
      label: 'Morbidity & Mortality Impact',
      score: affectedScore,
      maxScore: 15,
      description: `${affectedCount} sick animals, ${deathCount} confirmed mortalities.`
    });

    // Factor C: Disease Pathogenicity / Severity (max 20 pts)
    let diseaseSeverityScore = 8; // default baseline
    const diseaseLower = primaryDisease.toLowerCase();
    for (const [key, conf] of Object.entries(SEVERE_DISEASES)) {
      if (diseaseLower.includes(conf.label.toLowerCase()) || diseaseLower.includes(key.replace('dis_', ''))) {
        diseaseSeverityScore = conf.weight;
        break;
      }
    }
    factors.push({
      id: 'f_severity',
      label: 'Disease Pathogenicity & Transmission Risk',
      score: diseaseSeverityScore,
      maxScore: 20,
      description: `${primaryDisease} classified under national high-priority surveillance.`
    });

    // Factor D: Laboratory Confirmation (max 15 pts)
    const labConfirmationScore = hasPositiveLab ? 15 : (cases.some(c => c.status === 'SAMPLE_COLLECTED' || c.status === 'LAB_TESTING') ? 7 : 0);
    factors.push({
      id: 'f_lab',
      label: 'Diagnostic Lab Confirmation',
      score: labConfirmationScore,
      maxScore: 15,
      description: hasPositiveLab
        ? 'Confirmed positive RT-PCR/ELISA laboratory result on file.'
        : labConfirmationScore > 0
        ? 'Diagnostic samples collected; results pending.'
        : 'Field symptomatic report; lab verification pending.'
    });

    // Factor E: Case Growth Velocity / Rate of Increase (max 10 pts)
    let caseGrowthScore = 3;
    if (prevCaseCount > 0 && caseCount > prevCaseCount) {
      const growthRate = (caseCount - prevCaseCount) / prevCaseCount;
      if (growthRate >= 1.0) caseGrowthScore = 10;
      else if (growthRate >= 0.5) caseGrowthScore = 8;
      else caseGrowthScore = 6;
    } else if (caseCount >= 3 && prevCaseCount === 0) {
      caseGrowthScore = 9;
    } else if (caseCount > 0 && prevCaseCount === 0) {
      caseGrowthScore = 5;
    }
    factors.push({
      id: 'f_velocity',
      label: 'Cluster Growth Velocity',
      score: caseGrowthScore,
      maxScore: 10,
      description: `${caseCount} current cases vs ${prevCaseCount} in preceding surveillance window.`
    });

    // Factor F: Outbreak & Quarantine Zone Proximity (max 10 pts)
    const outbreakProximityScore = hasOfficialOutbreak ? 10 : (cases.some(c => c.priority === 'EMERGENCY') ? 6 : 2);
    factors.push({
      id: 'f_outbreak',
      label: 'Containment Zone Proximity',
      score: outbreakProximityScore,
      maxScore: 10,
      description: hasOfficialOutbreak
        ? 'Located within active declared quarantine & ring-vaccination perimeter.'
        : 'Outside formal declared containment zone.'
    });

    // Factor G: ML Screening Signal (max 10 pts) - Clearly labeled as Early screening signal
    const maxMLScore = cases.reduce((max, c) => {
      const topML = c.suspectedDiseases?.[0]?.screeningScore || 0;
      return Math.max(max, topML);
    }, 0);
    const mlScreeningScore = Math.min(10, Math.round((maxMLScore / 100) * 10));
    factors.push({
      id: 'f_ml_screening',
      label: 'Early Screening Signal (ML Model)',
      score: mlScreeningScore,
      maxScore: 10,
      isMLSignal: true,
      description: `AI automated symptom pattern score: ${maxMLScore}% (Early screening signal only, not a clinical diagnosis).`
    });

    // Factor H: Recency (max 10 pts)
    let recencyScore = 8;
    if (timeWindow === '24h') recencyScore = 10;
    else if (timeWindow === '7d') recencyScore = 8;
    else if (timeWindow === '30d') recencyScore = 6;
    else recencyScore = 5;

    const totalScore = Math.min(
      100,
      Math.max(
        0,
        caseDensityScore +
          affectedScore +
          diseaseSeverityScore +
          labConfirmationScore +
          caseGrowthScore +
          outbreakProximityScore +
          mlScreeningScore
      )
    );

    return {
      totalScore,
      caseDensityScore,
      affectedAnimalsScore: affectedScore,
      diseaseSeverityScore,
      labConfirmationScore,
      caseGrowthScore,
      outbreakProximityScore,
      mlScreeningScore,
      recencyScore,
      factors
    };
  }

  /**
   * Calculate disease activity trend comparing current vs previous time period
   */
  private static calculateTrend(
    currentCount: number,
    prevCount: number,
    timeWindow: SurveillanceTimeWindow
  ): { trend: DiseaseActivityTrend; trendChangePct?: number } {
    if (timeWindow === 'ALL' || (currentCount === 0 && prevCount === 0)) {
      return { trend: 'STABLE' };
    }

    if (prevCount === 0 && currentCount === 0) {
      return { trend: 'INSUFFICIENT_DATA' };
    }

    if (prevCount === 0 && currentCount >= 2) {
      return { trend: 'INCREASING', trendChangePct: 100 };
    }

    if (prevCount === 0 && currentCount === 1) {
      return { trend: 'INSUFFICIENT_DATA' };
    }

    const delta = currentCount - prevCount;
    const changePct = Math.round((delta / prevCount) * 100);

    if (changePct >= 20) {
      return { trend: 'INCREASING', trendChangePct: changePct };
    } else if (changePct <= -20) {
      return { trend: 'DECREASING', trendChangePct: changePct };
    } else {
      return { trend: 'STABLE', trendChangePct: changePct };
    }
  }

  /**
   * Generate multi-role tailored epidemiological & biosecurity recommendations
   */
  private static generateRecommendations(
    disease: string,
    riskTier: HotspotRiskTier,
    classification: DiseaseActivityClassification,
    isLabConfirmed: boolean,
    speciesList: Species[]
  ): HotspotCluster['recommendedActions'] {
    const speciesStr = speciesList.join('/') || 'Livestock';

    // Farmer-friendly guidance
    const farmerGuidance: string[] = [
      `Separate any sick ${speciesStr} from healthy herd immediately into isolated quarantine stalls.`,
      `Sanitize feeding and water troughs daily with 4% washing soda (sodium carbonate) or bleaching solution.`,
      `Restrict visitors, traders, and avoid grazing herds near shared riverbeds or village pastures.`,
      `Report any sudden fever, drooling, lameness, or skin nodules immediately to your local veterinary dispensary.`
    ];

    if (riskTier === 'CRITICAL') {
      farmerGuidance.unshift('EMERGENCY: Do NOT move or transport animals out of this village perimeter.');
    }

    // Veterinarian clinical guidance
    const veterinarianGuidance: string[] = [
      `Initiate targeted clinical triage and collect sterile diagnostic samples (epithelial flaps, oral/nasal swabs, EDTA blood).`,
      `Prescribe supportive antipyretics, antiseptic mouth/hoof washes, and prophylactic antibiotics for secondary infections.`,
      `Audit ring-vaccination coverage in surrounding 5 km buffer zone.`,
      `Submit mandatory notifiable disease escalation form to District Animal Husbandry Officer.`
    ];

    // District official containment guidance
    const officialGuidance: string[] = [
      `Enforce strict 10 km containment perimeter and temporarily halt weekly animal markets/shanties.`,
      `Mobilize emergency vaccine buffer stocks (Raksha-Ovac / Goat Pox / PPR) for ring immunization.`,
      `Deploy disinfection wheel dips at district arterial entry and exit checkpoints.`,
      `Issue public bio-security awareness notices via village Panchayat loudspeakers and SMS.`
    ];

    // Field worker / Para-vet guidance
    const fieldWorkerGuidance: string[] = [
      `Conduct active door-to-door herd surveillance across high-risk village hamlets.`,
      `Maintain cold chain integrity (2°C - 8°C) for all collected biological diagnostic vials.`,
      `Distribute laminated biosecurity do's and don'ts pamphlets to all dairy farmers.`,
      `Log daily temperature and health status of all in-contact animals in LivestockGuard app.`
    ];

    // Biosecurity Directives
    const biosecurityDirectives: string[] = [
      'Strict vehicle tire and footwear disinfection using 2% Virkon-S or 4% Sodium Carbonate.',
      'Prohibition of raw milk transit from unquarantined sheds to communal chilling centers without heat pasteurization.',
      'Safe deep burial of all mortality carcasses with quicklime (minimum 6 feet depth).'
    ];

    return {
      farmerGuidance,
      veterinarianGuidance,
      officialGuidance,
      fieldWorkerGuidance,
      biosecurityDirectives
    };
  }

  /**
   * Pre-configured safe demo scenarios for demonstration
   */
  public static getDemoScenarios(): Record<string, { name: string; description: string; cases: Case[]; outbreaks: Outbreak[] }> {
    return {
      fmd_surge: {
        name: 'Simulated FMD Surge (Critical Hotspot)',
        description: 'Multi-village Foot-and-Mouth Disease cluster across Pune-Satara dairy belt with rapid transmission.',
        cases: [
          {
            id: 'demo_cas_fmd_1',
            caseNumber: 'DEMO-CAS-PUN-01',
            species: 'Cattle',
            ownerName: 'Patil Dairy Cooperative',
            villageName: 'Malegaon Budruk',
            districtName: 'Pune',
            stateName: 'Maharashtra',
            latitude: 18.1524,
            longitude: 74.5768,
            riskLevel: 'CRITICAL',
            riskScore: 94,
            status: 'SAMPLE_COLLECTED',
            priority: 'EMERGENCY',
            affectedCount: 6,
            deadCount: 0,
            suspectedDiseases: [{ diseaseId: 'dis_fmd', diseaseName: 'Foot-and-Mouth Disease', screeningScore: 96 }],
            createdAt: '2026-08-23T08:00:00Z',
            symptoms: [{ symptomName: 'Excessive Frothy Salivation' }, { symptomName: 'Interdigital Foot Blisters' }]
          } as any,
          {
            id: 'demo_cas_fmd_2',
            caseNumber: 'DEMO-CAS-PUN-02',
            species: 'Buffalo',
            ownerName: 'Shirsuphal Farmers Group',
            villageName: 'Shirsuphal',
            districtName: 'Pune',
            stateName: 'Maharashtra',
            latitude: 18.1921,
            longitude: 74.6123,
            riskLevel: 'CRITICAL',
            riskScore: 90,
            status: 'UNDER_REVIEW',
            priority: 'EMERGENCY',
            affectedCount: 4,
            deadCount: 0,
            suspectedDiseases: [{ diseaseId: 'dis_fmd', diseaseName: 'Foot-and-Mouth Disease', screeningScore: 92 }],
            createdAt: '2026-08-23T14:30:00Z',
            symptoms: [{ symptomName: 'Oral Erosions' }, { symptomName: 'Severe Lameness' }]
          } as any,
          {
            id: 'demo_cas_fmd_3',
            caseNumber: 'DEMO-CAS-SAT-01',
            species: 'Cattle',
            ownerName: 'Krishna Valley Dairy',
            villageName: 'Vithalwadi',
            districtName: 'Satara',
            stateName: 'Maharashtra',
            latitude: 17.2891,
            longitude: 74.1812,
            riskLevel: 'HIGH',
            riskScore: 86,
            status: 'UNDER_REVIEW',
            priority: 'URGENT',
            affectedCount: 3,
            deadCount: 0,
            suspectedDiseases: [{ diseaseId: 'dis_fmd', diseaseName: 'Foot-and-Mouth Disease', screeningScore: 88 }],
            createdAt: '2026-08-22T10:00:00Z',
            symptoms: [{ symptomName: 'Fever' }, { symptomName: 'Drop in Milk' }]
          } as any
        ],
        outbreaks: [
          {
            id: 'demo_outb_fmd_1',
            outbreakCode: 'DEMO-OUTB-MH-FMD-01',
            diseaseName: 'Foot-and-Mouth Disease',
            districtName: 'Pune',
            stateName: 'Maharashtra',
            primaryVillage: 'Baramati Perimeter',
            latitude: 18.1524,
            longitude: 74.5768,
            radiusKm: 10,
            status: 'CONFIRMED',
            riskLevel: 'CRITICAL',
            totalCases: 13,
            affectedAnimalCount: 22,
            startDate: '2026-08-21'
          } as any
        ]
      },
      ppr_cluster: {
        name: 'Simulated PPR Caprine Cluster (High Risk)',
        description: 'Small ruminant cluster showing Peste des Petits Ruminants in Belagavi district with mortality.',
        cases: [
          {
            id: 'demo_cas_ppr_1',
            caseNumber: 'DEMO-CAS-BEL-01',
            species: 'Goat',
            ownerName: 'Nippani Smallholders',
            villageName: 'Nippani Rural',
            districtName: 'Belagavi',
            stateName: 'Karnataka',
            latitude: 16.3982,
            longitude: 74.3821,
            riskLevel: 'CRITICAL',
            riskScore: 92,
            status: 'LAB_TESTING',
            priority: 'EMERGENCY',
            affectedCount: 8,
            deadCount: 2,
            suspectedDiseases: [{ diseaseId: 'dis_ppr', diseaseName: 'Peste des Petits Ruminants', screeningScore: 95 }],
            createdAt: '2026-08-23T11:00:00Z',
            symptoms: [{ symptomName: 'Mucopurulent Nasal Discharge' }, { symptomName: 'Diarrhea' }]
          } as any,
          {
            id: 'demo_cas_ppr_2',
            caseNumber: 'DEMO-CAS-BEL-02',
            species: 'Sheep',
            ownerName: 'Chikodi Pastoralist Guild',
            villageName: 'Chikodi North',
            districtName: 'Belagavi',
            stateName: 'Karnataka',
            latitude: 16.4321,
            longitude: 74.4123,
            riskLevel: 'HIGH',
            riskScore: 82,
            status: 'UNDER_REVIEW',
            priority: 'URGENT',
            affectedCount: 5,
            deadCount: 1,
            suspectedDiseases: [{ diseaseId: 'dis_ppr', diseaseName: 'Peste des Petits Ruminants', screeningScore: 89 }],
            createdAt: '2026-08-22T16:00:00Z',
            symptoms: [{ symptomName: 'Oral Ulcers' }, { symptomName: 'High Fever' }]
          } as any
        ],
        outbreaks: []
      },
      lsd_vector: {
        name: 'Simulated LSD Vector Transmission (Moderate/High)',
        description: 'Cutaneous nodular disease cluster spreading along canal vector corridors in Anand, Gujarat.',
        cases: [
          {
            id: 'demo_cas_lsd_1',
            caseNumber: 'DEMO-CAS-AND-01',
            species: 'Cattle',
            ownerName: 'Anand Bio-Secure Union',
            villageName: 'Mogar',
            districtName: 'Anand',
            stateName: 'Gujarat',
            latitude: 22.5123,
            longitude: 72.9812,
            riskLevel: 'HIGH',
            riskScore: 78,
            status: 'CONFIRMED',
            priority: 'URGENT',
            affectedCount: 4,
            deadCount: 0,
            suspectedDiseases: [{ diseaseId: 'dis_lsd', diseaseName: 'Lumpy Skin Disease', screeningScore: 94 }],
            createdAt: '2026-08-23T09:00:00Z',
            symptoms: [{ symptomName: 'Skin Nodules' }, { symptomName: 'Enlarged Prescapular Lymph Nodes' }]
          } as any
        ],
        outbreaks: []
      }
    };
  }

  /**
   * Check and generate role-aware notification when a critical/high hotspot is detected
   */
  public static checkAndTriggerHotspotNotification(
    cluster: HotspotCluster,
    currentUser: User | null
  ): void {
    if (!cluster || !currentUser) return;
    if (cluster.riskTier !== 'CRITICAL' && cluster.riskTier !== 'HIGH') return;

    const alertId = `alt_hotspot_${cluster.id}_${Date.now()}`;
    const priority = cluster.riskTier === 'CRITICAL' ? 'CRITICAL' : 'HIGH';

    // Label accurately: "Suspected Cluster" or "High Disease Activity", unless lab confirmed or officially declared
    const classificationTitle = cluster.confirmationStatus === 'LAB_CONFIRMED' || cluster.confirmationStatus === 'OFFICIALLY_DECLARED'
      ? `Confirmed Outbreak Alert: ${cluster.primaryDisease}`
      : `${cluster.classification === 'HIGH_RISK_CLUSTER' ? 'High-Risk Disease Cluster' : 'Increased Disease Activity'}: ${cluster.primaryDisease}`;

    const newAlert: Alert = {
      id: alertId,
      title: `${classificationTitle} - ${cluster.districtName}`,
      message: `Spatial surveillance detected ${cluster.currentPeriodCaseCount} case(s) with ${cluster.totalAffectedAnimals} animal(s) affected in ${cluster.name}. Risk Score: ${cluster.riskScore}/100. (Epidemiological surveillance early-warning).`,
      priority,
      category: 'HIGH_RISK',
      type: cluster.riskTier === 'CRITICAL' ? 'CRITICAL_OUTBREAK' : 'HIGH_RISK',
      stateId: cluster.stateId || currentUser.stateId,
      districtId: cluster.districtId || currentUser.districtId,
      districtName: cluster.districtName,
      villageName: cluster.villages[0] || 'Surveillance Zone',
      isRead: false,
      createdAt: new Date().toISOString(),
      recommendedActions: [
        currentUser.role === 'FARMER'
          ? 'Isolate sick animals, disinfect stalls, and contact local veterinary hospital.'
          : 'Initiate field triage, collect diagnostic samples, and review ring-vaccination readiness.'
      ],
      targetRoles: ['FARMER', 'VETERINARIAN', 'FIELD_WORKER', 'DISTRICT_OFFICIAL', 'STATE_ADMIN']
    };

    store.addAlert(newAlert);
  }
}
