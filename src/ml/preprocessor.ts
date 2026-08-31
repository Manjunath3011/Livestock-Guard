import { RawHealthRecord, PreprocessorConfig, FEATURE_SCHEMA_VERSION } from './types';
import { SYMPTOMS_LIST } from '../data/knowledgeBase';
import { MLPredictionFeatureInput } from '../types';

export const SPECIES_VOCAB = ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Horse', 'Camel', 'Other'];
export const SEASONS_VOCAB = ['MONSOON', 'POST_MONSOON', 'WINTER', 'SUMMER'];
export const VACCINATION_VOCAB = ['UP_TO_DATE', 'OVERDUE', 'UNVACCINATED', 'UNKNOWN'];

export class FeaturePreprocessor {
  private config: PreprocessorConfig;

  constructor(config?: PreprocessorConfig) {
    if (config) {
      this.config = config;
    } else {
      const symptomVocab = SYMPTOMS_LIST.map(s => s.id);
      const featureNames: string[] = [];

      // 1. Species one-hot
      for (const sp of SPECIES_VOCAB) {
        featureNames.push(`species_${sp}`);
      }

      // 2. Symptom severity features
      for (const sym of symptomVocab) {
        featureNames.push(`symptom_${sym}`);
      }

      // 3. Vaccination status one-hot
      for (const vac of VACCINATION_VOCAB) {
        featureNames.push(`vaccination_${vac}`);
      }

      // 4. Season one-hot
      for (const sea of SEASONS_VOCAB) {
        featureNames.push(`season_${sea}`);
      }

      // 5. Numerical features
      featureNames.push('symptom_duration_days');
      featureNames.push('herd_attack_rate');
      featureNames.push('mortality_rate');
      featureNames.push('nearby_case_proximity');
      featureNames.push('temperature_c');
      featureNames.push('humidity_pct');
      featureNames.push('rainfall_mm');

      this.config = {
        schemaVersion: FEATURE_SCHEMA_VERSION,
        featureNames,
        symptomVocab,
        speciesVocab: SPECIES_VOCAB,
        seasonVocab: SEASONS_VOCAB,
        vaccinationVocab: VACCINATION_VOCAB,
        numericalMeans: {},
        numericalStds: {}
      };
    }
  }

  public getConfig(): PreprocessorConfig {
    return this.config;
  }

  /**
   * Fits numerical statistics (mean, standard deviation) on training records.
   */
  public fit(records: RawHealthRecord[]): void {
    const numericalKeys = [
      'symptom_duration_days',
      'herd_attack_rate',
      'mortality_rate',
      'nearby_case_proximity',
      'temperature_c',
      'humidity_pct',
      'rainfall_mm'
    ];

    if (!records || !Array.isArray(records) || records.length === 0) {
      for (const k of numericalKeys) {
        this.config.numericalMeans[k] = 0;
        this.config.numericalStds[k] = 1;
      }
      return;
    }

    const sums: Record<string, number> = {};
    const sumSquares: Record<string, number> = {};
    const counts: Record<string, number> = {};

    for (const k of numericalKeys) {
      sums[k] = 0;
      sumSquares[k] = 0;
      counts[k] = 0;
    }

    for (const r of records) {
      const duration = r.symptom_duration_days ?? 2;
      const herdSize = Math.max(r.herd_size ?? 10, 1);
      const affected = r.affected_animals ?? 1;
      const dead = r.dead_count ?? 0;
      const attackRate = Math.min((affected + dead) / herdSize, 1.0);
      const mortalityRate = Math.min(dead / herdSize, 1.0);

      const distance = Math.max(r.distance_to_nearest_case_km ?? 15, 0.1);
      const nearbyCount = r.nearby_cases_10km ?? 0;
      const proximity = nearbyCount > 0 ? (1 / (1 + distance * 0.15)) * Math.min(nearbyCount, 5) : 0;

      const temp = r.temperature_c ?? 28;
      const humidity = r.humidity_pct ?? 65;
      const rainfall = r.rainfall_mm ?? 0;

      const values: Record<string, number> = {
        symptom_duration_days: duration,
        herd_attack_rate: attackRate,
        mortality_rate: mortalityRate,
        nearby_case_proximity: proximity,
        temperature_c: temp,
        humidity_pct: humidity,
        rainfall_mm: rainfall
      };

      for (const k of numericalKeys) {
        sums[k] += values[k];
        sumSquares[k] += values[k] * values[k];
        counts[k] += 1;
      }
    }

    for (const k of numericalKeys) {
      const n = Math.max(counts[k], 1);
      const mean = sums[k] / n;
      const variance = Math.max(sumSquares[k] / n - mean * mean, 0.0001);
      this.config.numericalMeans[k] = mean;
      this.config.numericalStds[k] = Math.sqrt(variance);
    }
  }

  /**
   * Transforms a single raw health record into a standardized numerical feature vector.
   */
  public transformRecord(r: RawHealthRecord): number[] {
    const vector = new Array(this.config.featureNames.length).fill(0);
    const getIdx = (name: string) => this.config.featureNames.indexOf(name);

    // 1. Species one-hot
    const spIdx = getIdx(`species_${r.species}`);
    if (spIdx !== -1) vector[spIdx] = 1.0;
    else {
      const otherIdx = getIdx('species_Other');
      if (otherIdx !== -1) vector[otherIdx] = 1.0;
    }

    // 2. Symptoms
    for (const sym of r.symptoms || []) {
      const sIdx = getIdx(`symptom_${sym.symptom_id}`);
      if (sIdx !== -1) {
        const severityVal = sym.severity === 'severe' ? 1.4 : sym.severity === 'moderate' ? 1.0 : 0.65;
        vector[sIdx] = severityVal;
      }
    }

    // 3. Vaccination
    const vacStatus = r.vaccination_status || 'UNKNOWN';
    const vacIdx = getIdx(`vaccination_${vacStatus}`);
    if (vacIdx !== -1) vector[vacIdx] = 1.0;

    // 4. Season
    const season = r.season || 'POST_MONSOON';
    const seaIdx = getIdx(`season_${season}`);
    if (seaIdx !== -1) vector[seaIdx] = 1.0;

    // 5. Numerical features (standardized)
    const normalize = (key: string, rawVal: number) => {
      const mean = this.config.numericalMeans[key] ?? 0;
      const std = this.config.numericalStds[key] || 1;
      return (rawVal - mean) / std;
    };

    const duration = r.symptom_duration_days ?? 2;
    const herdSize = Math.max(r.herd_size ?? 10, 1);
    const affected = r.affected_animals ?? 1;
    const dead = r.dead_count ?? 0;
    const attackRate = Math.min((affected + dead) / herdSize, 1.0);
    const mortalityRate = Math.min(dead / herdSize, 1.0);

    const distance = Math.max(r.distance_to_nearest_case_km ?? 15, 0.1);
    const nearbyCount = r.nearby_cases_10km ?? 0;
    const proximity = nearbyCount > 0 ? (1 / (1 + distance * 0.15)) * Math.min(nearbyCount, 5) : 0;

    const temp = r.temperature_c ?? 28;
    const humidity = r.humidity_pct ?? 65;
    const rainfall = r.rainfall_mm ?? 0;

    vector[getIdx('symptom_duration_days')] = normalize('symptom_duration_days', duration);
    vector[getIdx('herd_attack_rate')] = normalize('herd_attack_rate', attackRate);
    vector[getIdx('mortality_rate')] = normalize('mortality_rate', mortalityRate);
    vector[getIdx('nearby_case_proximity')] = normalize('nearby_case_proximity', proximity);
    vector[getIdx('temperature_c')] = normalize('temperature_c', temp);
    vector[getIdx('humidity_pct')] = normalize('humidity_pct', humidity);
    vector[getIdx('rainfall_mm')] = normalize('rainfall_mm', rainfall);

    return vector;
  }

  /**
   * Transforms prediction input from the user/case into the standardized feature vector.
   */
  public transformInput(input: MLPredictionFeatureInput): {
    vector: number[];
    activeFeatures: { featureName: string; rawValue: number }[];
  } {
    const rawRecord: RawHealthRecord = {
      record_id: 'live_inference',
      species: input.species,
      age_years: input.ageYears,
      sex: input.sex,
      herd_size: input.totalAnimalsInHerd,
      symptoms: input.symptoms.map(s => ({
        symptom_id: s.symptomId,
        severity: s.severity as any
      })),
      symptom_duration_days: input.symptomDurationDays ?? 2,
      vaccination_status: input.vaccinationStatus === 'UNKNOWN' ? 'UNKNOWN' : input.vaccinationStatus,
      affected_animals: input.affectedCount,
      dead_count: input.deadCount,
      nearby_cases_10km: input.nearbyCasesCount,
      distance_to_nearest_case_km: input.nearestCaseDistanceKm,
      temperature_c: input.temperatureC,
      humidity_pct: input.humidityPct,
      rainfall_mm: input.rainfallMm,
      season: input.season,
      disease_label: '',
      diagnosis_source: 'clinical_suspected'
    };

    const vector = this.transformRecord(rawRecord);
    const activeFeatures: { featureName: string; rawValue: number }[] = [];

    for (let i = 0; i < this.config.featureNames.length; i++) {
      if (Math.abs(vector[i]) > 0.001) {
        activeFeatures.push({
          featureName: this.config.featureNames[i],
          rawValue: vector[i]
        });
      }
    }

    return { vector, activeFeatures };
  }
}
