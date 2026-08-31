import {
  DatasetRecord,
  TrainingCandidateRecord,
  LabelQuality
} from '../ml/types';
import { Case, LabSample } from '../types';

const CANDIDATE_QUEUE_STORAGE_KEY = 'lg_training_candidate_queue';

/**
 * Service managing Lab-Confirmed and Veterinary-Validated Cases for Future Dataset Ingestion
 */
export class TrainingCandidateQueueService {
  private queue: TrainingCandidateRecord[] = [];

  constructor() {
    this.loadQueue();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(CANDIDATE_QUEUE_STORAGE_KEY);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        this.queue = Array.isArray(parsed) ? parsed : [];
      } else {
        this.queue = [];
      }
    } catch (e) {
      console.warn('Failed to load training candidate queue from localStorage', e);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(CANDIDATE_QUEUE_STORAGE_KEY, JSON.stringify(this.queue || []));
    } catch (e) {
      console.warn('Failed to save training candidate queue to localStorage', e);
    }
  }

  public listCandidates(): TrainingCandidateRecord[] {
    return Array.isArray(this.queue) ? [...this.queue] : [];
  }

  /**
   * Queue a Lab-Confirmed Case as a Gold-Standard Candidate Training Record
   */
  public enqueueLabConfirmedCase(
    caseItem: Case,
    labSample: LabSample,
    verifiedBy: string
  ): TrainingCandidateRecord {
    const existing = this.queue.find(q => q.caseId === caseItem.id);
    if (existing) return existing;

    const record: DatasetRecord = {
      record_id: `rec_lab_${caseItem.id}_${Date.now()}`,
      animal_id: caseItem.animalId || `anm_${caseItem.id}`,
      farm_id: caseItem.farmId || `farm_${caseItem.id}`,
      species: caseItem.species,
      breed: caseItem.breed,
      age_years: caseItem.ageYears,
      sex: caseItem.sex,
      state: caseItem.stateId,
      district: caseItem.districtId,
      village: caseItem.villageId,
      latitude: caseItem.latitude,
      longitude: caseItem.longitude,
      symptoms: caseItem.symptoms.map(s => ({
        symptom_id: s.symptomId,
        severity: s.severity
      })),
      symptom_duration_days: caseItem.symptomDurationDays || 3,
      previous_disease: caseItem.previousDiseaseHistory || [],
      vaccination_status: caseItem.vaccinationStatus,
      affected_animals: caseItem.affectedCount || 1,
      total_animals: caseItem.totalAnimalsInHerd || 10,
      mortality: caseItem.deadCount || 0,
      disease_label: caseItem.confirmedDiseaseId || caseItem.suspectedDiseaseId || 'dis_other_healthy',
      diagnosis_source: 'LAB_CONFIRMED',
      diagnosis_date: labSample.resultDate || new Date().toISOString(),
      lab_test: labSample.testRequested,
      lab_result: labSample.result === 'POSITIVE' ? 'POSITIVE' : 'NEGATIVE',
      laboratory_id: labSample.laboratoryId,
      label_quality: 'GOLD_STANDARD',
      data_source: `Diagnostic Lab: ${labSample.laboratoryName}`,
      created_at: new Date().toISOString()
    };

    const candidate: TrainingCandidateRecord = {
      id: `tc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      caseId: caseItem.id,
      caseNumber: caseItem.caseNumber,
      record,
      origin: 'LABORATORY_CONFIRMATION',
      labelQuality: 'GOLD_STANDARD',
      status: 'QUEUED',
      submittedAt: new Date().toISOString(),
      verifiedBy
    };

    this.queue.unshift(candidate);
    this.saveQueue();
    return candidate;
  }

  /**
   * Queue a Validated Veterinary Case
   */
  public enqueueVeterinaryValidatedCase(
    caseItem: Case,
    veterinarianName: string,
    diseaseId: string
  ): TrainingCandidateRecord {
    const existing = this.queue.find(q => q.caseId === caseItem.id);
    if (existing) return existing;

    const record: DatasetRecord = {
      record_id: `rec_vet_${caseItem.id}_${Date.now()}`,
      animal_id: caseItem.animalId || `anm_${caseItem.id}`,
      farm_id: caseItem.farmId || `farm_${caseItem.id}`,
      species: caseItem.species,
      breed: caseItem.breed,
      age_years: caseItem.ageYears,
      sex: caseItem.sex,
      state: caseItem.stateId,
      district: caseItem.districtId,
      village: caseItem.villageId,
      latitude: caseItem.latitude,
      longitude: caseItem.longitude,
      symptoms: caseItem.symptoms.map(s => ({
        symptom_id: s.symptomId,
        severity: s.severity
      })),
      symptom_duration_days: caseItem.symptomDurationDays || 3,
      previous_disease: caseItem.previousDiseaseHistory || [],
      vaccination_status: caseItem.vaccinationStatus,
      affected_animals: caseItem.affectedCount || 1,
      total_animals: caseItem.totalAnimalsInHerd || 10,
      mortality: caseItem.deadCount || 0,
      disease_label: diseaseId,
      diagnosis_source: 'VETERINARIAN_CONFIRMED',
      diagnosis_date: new Date().toISOString(),
      veterinarian_id: caseItem.assignedVeterinarianId,
      label_quality: 'VALIDATED',
      data_source: `Veterinary Clinical Confirmation by ${veterinarianName}`,
      created_at: new Date().toISOString()
    };

    const candidate: TrainingCandidateRecord = {
      id: `tc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      caseId: caseItem.id,
      caseNumber: caseItem.caseNumber,
      record,
      origin: 'VETERINARY_VALIDATION',
      labelQuality: 'VALIDATED',
      status: 'QUEUED',
      submittedAt: new Date().toISOString(),
      verifiedBy: veterinarianName
    };

    this.queue.unshift(candidate);
    this.saveQueue();
    return candidate;
  }
}

export const trainingCandidateQueueService = new TrainingCandidateQueueService();
