import {
  DatasetRecord,
  DatasetProvenance,
  DataQualityReport,
  DatasetStatus,
  DiagnosisSource,
  LabelQuality
} from '../ml/types';
import { DataQualityValidator } from '../ml/dataQuality';
import { deriveLabelQuality } from '../ml/datasetSchema';
import { Species } from '../types';

const DATASETS_STORAGE_KEY = 'lg_imported_datasets';

export interface DatasetImportResult {
  success: boolean;
  datasetId?: string;
  provenance?: DatasetProvenance;
  qualityReport?: DataQualityReport;
  error?: string;
  previewRows?: DatasetRecord[];
}

/**
 * Service managing Real-World Livestock Dataset Ingestion, Parsing, Validation, and Provenance
 */
export class DatasetImportService {
  private datasets: DatasetProvenance[] = [];

  constructor() {
    this.loadDatasets();
  }

  private loadDatasets(): void {
    try {
      const stored = localStorage.getItem(DATASETS_STORAGE_KEY);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        this.datasets = Array.isArray(parsed) ? parsed : [];
      } else {
        this.datasets = [];
      }
    } catch (e) {
      console.warn('Could not load imported datasets from localStorage', e);
      this.datasets = [];
    }
  }

  private saveDatasets(): void {
    try {
      localStorage.setItem(DATASETS_STORAGE_KEY, JSON.stringify(this.datasets || []));
    } catch (e) {
      console.warn('Could not save datasets to localStorage', e);
    }
  }

  /**
   * List all imported datasets with status and metadata
   */
  public listDatasets(): DatasetProvenance[] {
    return Array.isArray(this.datasets) ? [...this.datasets] : [];
  }

  /**
   * Get specific dataset by ID
   */
  public getDatasetById(datasetId: string): DatasetProvenance | undefined {
    return this.datasets.find(d => d.dataset_id === datasetId);
  }

  /**
   * Parse Raw Input File (JSON or CSV format)
   */
  public parseRawInput(content: string, format: 'json' | 'csv'): DatasetRecord[] {
    if (format === 'json') {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => this.normalizeRecord(item, idx));
      } else if (parsed.records && Array.isArray(parsed.records)) {
        return parsed.records.map((item: any, idx: number) => this.normalizeRecord(item, idx));
      }
      throw new Error('Invalid JSON structure: Expected an array of records or an object with a "records" array.');
    } else {
      // CSV Parsing
      const lines = content.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data record.');
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const records: DatasetRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const obj: Record<string, any> = {};
        
        headers.forEach((h, colIdx) => {
          obj[h] = values[colIdx] !== undefined ? values[colIdx] : '';
        });

        records.push(this.normalizeRecord(obj, i));
      }
      return records;
    }
  }

  /**
   * Standardize and normalize diverse field inputs
   */
  private normalizeRecord(raw: any, index: number): DatasetRecord {
    // Standardize Symptoms
    let symptoms: { symptom_id: string; severity?: 'mild' | 'moderate' | 'severe' }[] = [];
    if (Array.isArray(raw.symptoms)) {
      symptoms = raw.symptoms.map((s: any) => {
        if (typeof s === 'string') return { symptom_id: s.trim(), severity: 'moderate' };
        return { symptom_id: s.symptom_id || s.id || '', severity: s.severity || 'moderate' };
      }).filter((s: any) => s.symptom_id);
    } else if (typeof raw.symptoms === 'string' && raw.symptoms.trim() !== '') {
      symptoms = raw.symptoms.split(/;|\|/).map((s: string) => {
        const parts = s.trim().split(':');
        return {
          symptom_id: parts[0].trim(),
          severity: (parts[1] as any) || 'moderate'
        };
      }).filter((s: any) => s.symptom_id);
    }

    const diagnosisSource: DiagnosisSource = (raw.diagnosis_source || raw.source_type || 'UNVERIFIED').toUpperCase();
    const labelQuality: LabelQuality = raw.label_quality || deriveLabelQuality(diagnosisSource);

    return {
      record_id: raw.record_id || `rec_${Date.now()}_${index}`,
      animal_id: raw.animal_id || raw.animal_tag || `anm_${index}`,
      farm_id: raw.farm_id || `farm_${Math.floor(index / 3)}`,
      outbreak_id: raw.outbreak_id,
      species: (raw.species || 'Cattle') as Species,
      breed: raw.breed,
      age_years: raw.age_years !== undefined ? Number(raw.age_years) : (raw.age ? Number(raw.age) : undefined),
      sex: raw.sex ? raw.sex.toUpperCase() : 'UNKNOWN',
      state: raw.state || raw.state_id,
      district: raw.district || raw.district_id,
      subdistrict: raw.subdistrict || raw.block,
      village: raw.village,
      symptoms,
      symptom_duration_days: raw.symptom_duration_days !== undefined ? Number(raw.symptom_duration_days) : (raw.duration ? Number(raw.duration) : undefined),
      vaccination_status: raw.vaccination_status ? raw.vaccination_status.toUpperCase() : 'UNKNOWN',
      last_vaccination_date: raw.last_vaccination_date,
      affected_animals: raw.affected_animals !== undefined ? Number(raw.affected_animals) : (raw.affected ? Number(raw.affected) : 1),
      total_animals: raw.total_animals !== undefined ? Number(raw.total_animals) : (raw.total_herd ? Number(raw.total_herd) : 10),
      mortality: raw.mortality !== undefined ? Number(raw.mortality) : (raw.dead_count ? Number(raw.dead_count) : 0),
      nearby_cases: raw.nearby_cases !== undefined ? Number(raw.nearby_cases) : (raw.nearby_cases_10km ? Number(raw.nearby_cases_10km) : 0),
      distance_to_nearest_case_km: raw.distance_to_nearest_case_km !== undefined ? Number(raw.distance_to_nearest_case_km) : undefined,
      temperature: raw.temperature !== undefined ? Number(raw.temperature) : (raw.temp ? Number(raw.temp) : undefined),
      humidity: raw.humidity !== undefined ? Number(raw.humidity) : (raw.humidity_pct ? Number(raw.humidity_pct) : undefined),
      rainfall: raw.rainfall !== undefined ? Number(raw.rainfall) : (raw.rainfall_mm ? Number(raw.rainfall_mm) : undefined),
      season: raw.season ? raw.season.toUpperCase() : 'MONSOON',
      disease_label: raw.disease_label || raw.diagnosis || raw.disease_id || '',
      diagnosis_source: diagnosisSource,
      diagnosis_date: raw.diagnosis_date || raw.date,
      lab_test: raw.lab_test,
      lab_result: raw.lab_result ? raw.lab_result.toUpperCase() : undefined,
      label_quality: labelQuality,
      data_source: raw.data_source || raw.source_organization || 'Uploaded Clinical Feed',
      created_at: raw.created_at || new Date().toISOString()
    };
  }

  /**
   * Upload, Validate, and Register Dataset Candidate
   */
  public importDataset(params: {
    datasetName: string;
    sourceOrganization: string;
    sourceType: DatasetProvenance['source_type'];
    rawContent: string;
    format: 'json' | 'csv';
    uploadedBy: string;
    collectionStartDate?: string;
    collectionEndDate?: string;
  }): DatasetImportResult {
    try {
      const records = this.parseRawInput(params.rawContent, params.format);
      if (records.length === 0) {
        return { success: false, error: 'Dataset is empty or could not be parsed.' };
      }

      // Execute Quality Validation
      const { cleanRecords, report } = DataQualityValidator.validateDataset(records);

      // Compute Provenance Breakdown
      const diseaseClasses = Object.keys(report.classDistribution);
      const states = Array.from(new Set(records.map(r => r.state).filter(Boolean))) as string[];
      const districts = Array.from(new Set(records.map(r => r.district).filter(Boolean))) as string[];
      const uniqueAnimals = new Set(records.map(r => r.animal_id).filter(Boolean)).size;
      const uniqueFarms = new Set(records.map(r => r.farm_id).filter(Boolean)).size;

      const datasetId = `ds_real_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const provenance: DatasetProvenance = {
        dataset_id: datasetId,
        dataset_name: params.datasetName,
        source_organization: params.sourceOrganization,
        source_type: params.sourceType,
        collection_period: {
          start_date: params.collectionStartDate || new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
          end_date: params.collectionEndDate || new Date().toISOString().split('T')[0]
        },
        geographic_coverage: {
          states: states.length > 0 ? states : ['National Multi-State Coverage'],
          districts: districts.length > 0 ? districts : ['State Surveillance Network']
        },
        number_of_records: cleanRecords.length,
        number_of_animals: uniqueAnimals || cleanRecords.length,
        number_of_farms: uniqueFarms || Math.max(1, Math.floor(cleanRecords.length / 3)),
        number_of_disease_classes: diseaseClasses.length,
        label_quality_breakdown: {
          gold_standard: report.labelQualityDistribution['GOLD_STANDARD'] || 0,
          validated: report.labelQualityDistribution['VALIDATED'] || 0,
          provisional: report.labelQualityDistribution['PROVISIONAL'] || 0,
          unverified: report.labelQualityDistribution['UNVERIFIED'] || 0
        },
        created_at: new Date().toISOString(),
        uploaded_by: params.uploadedBy,
        approval_status: report.isDatasetClean ? 'VALIDATED' : 'UPLOADED',
        notes: report.notes,
        rawData: cleanRecords
      };

      this.datasets.unshift(provenance);
      this.saveDatasets();

      return {
        success: true,
        datasetId,
        provenance,
        qualityReport: report,
        previewRows: cleanRecords.slice(0, 10)
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Import failed: ${err.message || 'Unknown parsing error'}`
      };
    }
  }

  /**
   * Update Dataset Approval Status (Admin action)
   */
  public updateDatasetStatus(
    datasetId: string,
    status: DatasetStatus,
    adminUser: string,
    notes?: string
  ): boolean {
    const ds = this.datasets.find(d => d.dataset_id === datasetId);
    if (!ds) return false;

    ds.approval_status = status;
    if (status === 'APPROVED_FOR_TRAINING') {
      ds.approved_by = adminUser;
      ds.approval_date = new Date().toISOString();
    }
    if (notes) {
      ds.notes = ds.notes || [];
      ds.notes.push(`[${new Date().toISOString().split('T')[0]} - ${adminUser}]: ${notes}`);
    }
    this.saveDatasets();
    return true;
  }
}

export const datasetImportService = new DatasetImportService();
