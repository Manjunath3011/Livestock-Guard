import {
  DatasetRecord,
  DatasetProvenance,
  DataQualityReport,
  DatasetStatus,
  DiagnosisSource,
  LabelQuality,
  DatasetCategory,
  DataModality
} from '../ml/types';
import { DataQualityValidator } from '../ml/dataQuality';
import { normalizeDatasetRecord } from '../ml/schemaNormalizer';
import { LEGITIMATE_DEFAULT_DATASETS } from '../data/legitimateDatasets';

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
    this.ensureDefaultDatasets();
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

  /**
   * Automatically seed default legitimate real-world & Kaggle datasets if not present
   */
  public ensureDefaultDatasets(): void {
    let modified = false;
    for (const def of LEGITIMATE_DEFAULT_DATASETS) {
      const exists = this.datasets.some(d => d.dataset_id === def.provenance.dataset_id);
      if (!exists) {
        const prov: DatasetProvenance = {
          ...def.provenance,
          rawData: def.records || []
        };
        this.datasets.push(prov);
        modified = true;
      }
    }
    if (modified) {
      this.saveDatasets();
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
        return parsed.map((item, idx) => normalizeDatasetRecord(item, idx));
      } else if (parsed.records && Array.isArray(parsed.records)) {
        return parsed.records.map((item: any, idx: number) => normalizeDatasetRecord(item, idx));
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

        records.push(normalizeDatasetRecord(obj, i));
      }
      return records;
    }
  }

  /**
   * Upload, Validate, and Register Dataset Candidate
   */
  public importDataset(params: {
    datasetName: string;
    sourceOrganization: string;
    sourceURL?: string;
    sourceType: DatasetProvenance['source_type'];
    license?: string;
    version?: string;
    description?: string;
    originalFileName?: string;
    isSynthetic?: boolean;
    datasetCategory?: DatasetCategory;
    dataModality?: DataModality;
    rawContent: string;
    format: 'json' | 'csv';
    uploadedBy: string;
    collectionStartDate?: string;
    collectionEndDate?: string;
  }): DatasetImportResult {
    try {
      const isImage = params.dataModality === 'IMAGE_DATASET' || params.datasetCategory === 'IMAGE';

      if (isImage) {
        // Image Dataset registration
        const datasetId = `ds_img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const provenance: DatasetProvenance = {
          dataset_id: datasetId,
          dataset_name: params.datasetName,
          source_organization: params.sourceOrganization,
          source_type: params.sourceType,
          source_url: params.sourceURL,
          license: params.license || 'CC-BY-4.0',
          download_date: new Date().toISOString().split('T')[0],
          version: params.version || '1.0.0',
          description: params.description || 'Photographic image dataset reserved for future Computer Vision models.',
          original_file_name: params.originalFileName || 'image_archive.zip',
          original_record_count: 0,
          processed_record_count: 0,
          mapping_version: 'vision-v1.0',
          quality_status: 'VALIDATED',
          approved_for_training: false, // NOT for Random Forest
          is_synthetic: params.isSynthetic || false,
          dataset_category: 'IMAGE',
          data_modality: 'IMAGE_DATASET',
          image_dataset_reserve_note: 'reserved_for_future_computer_vision_model',
          collection_period: {
            start_date: params.collectionStartDate || new Date().toISOString().split('T')[0],
            end_date: params.collectionEndDate || new Date().toISOString().split('T')[0]
          },
          geographic_coverage: {
            states: ['Surveillance Field Locations'],
            districts: ['Image Collection Units']
          },
          number_of_records: 0,
          number_of_animals: 0,
          number_of_farms: 0,
          number_of_disease_classes: 0,
          label_quality_breakdown: {
            gold_standard: 0,
            validated: 0,
            provisional: 0,
            unverified: 0
          },
          created_at: new Date().toISOString(),
          uploaded_by: params.uploadedBy,
          approval_status: 'UPLOADED',
          notes: [
            'IMAGE_DATASET: Photographic dataset reserved for future Computer Vision model.',
            'Cannot be used in Random Forest structured tabular training pipeline.'
          ],
          rawData: []
        };

        this.datasets.unshift(provenance);
        this.saveDatasets();

        return {
          success: true,
          datasetId,
          provenance,
          previewRows: []
        };
      }

      // Structured Dataset parsing & validation
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

      const isSynthetic = params.isSynthetic || params.sourceType === 'SYNTHETIC' || params.datasetCategory === 'SYNTHETIC';
      const category: DatasetCategory = isSynthetic ? 'SYNTHETIC' : (params.datasetCategory || 'REAL');
      const datasetId = `ds_${category.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const provenance: DatasetProvenance = {
        dataset_id: datasetId,
        dataset_name: params.datasetName,
        source_organization: params.sourceOrganization,
        source_type: params.sourceType,
        source_url: params.sourceURL,
        license: params.license || (isSynthetic ? 'Development Testing Use' : 'CC0 / Public Open Veterinary Data'),
        download_date: new Date().toISOString().split('T')[0],
        version: params.version || '1.0.0',
        description: params.description || `Ingested dataset containing ${records.length} livestock epidemiological records.`,
        original_file_name: params.originalFileName || (params.format === 'csv' ? 'dataset.csv' : 'dataset.json'),
        original_record_count: records.length,
        processed_record_count: cleanRecords.length,
        mapping_version: 'schema-v2.0',
        quality_status: report.isDatasetClean ? 'VALIDATED' : 'REQUIRES_REVIEW',
        approved_for_training: report.isDatasetClean && !isSynthetic,
        is_synthetic: isSynthetic,
        dataset_category: category,
        data_modality: 'STRUCTURED',
        unmapped_disease_count: report.unmappedDiseaseCount,
        unmapped_disease_labels: report.unmappedDiseaseLabels,
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
        approval_status: report.isDatasetClean ? (isSynthetic ? 'UPLOADED' : 'APPROVED_FOR_TRAINING') : 'UPLOADED',
        notes: [
          ...report.notes,
          isSynthetic ? 'MARKED AS SYNTHETIC: Not for real-world accuracy claims.' : 'REAL-WORLD STRUCTURED SURVEILLANCE'
        ],
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
      ds.approved_for_training = true;
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

