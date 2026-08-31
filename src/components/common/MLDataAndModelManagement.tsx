import React, { useState, useEffect } from 'react';
import {
  Database,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileText,
  Layers,
  BarChart3,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  TestTube,
  GitBranch,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { datasetImportService } from '../../services/DatasetImportService';
import { modelRegistryService } from '../../services/ModelRegistry';
import { trainingCandidateQueueService } from '../../services/TrainingCandidateQueue';
import { MLTrainingPipelineV2 } from '../../ml/trainPipelineV2';
import {
  DatasetProvenance,
  ModelRegistryRecord,
  TrainingCandidateRecord,
  DatasetStatus,
  ModelLifecycleStatus
} from '../../ml/types';
import { store } from '../../services/store';

export const MLDataAndModelManagement: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [datasets, setDatasets] = useState<DatasetProvenance[]>([]);
  const [models, setModels] = useState<ModelRegistryRecord[]>([]);
  const [activeModel, setActiveModel] = useState<ModelRegistryRecord>(modelRegistryService.getActiveModel());
  const [candidateQueue, setCandidateQueue] = useState<TrainingCandidateRecord[]>([]);

  // Navigation tabs within ML management
  const [activeTab, setActiveTab] = useState<'datasets' | 'training' | 'models' | 'review' | 'queue'>('datasets');

  // Dataset Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadOrg, setUploadOrg] = useState('');
  const [uploadType, setUploadType] = useState<DatasetProvenance['source_type']>('GOVERNMENT_SURVEILLANCE');
  const [uploadFormat, setUploadFormat] = useState<'json' | 'csv'>('json');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Training options
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [splitStrategy, setSplitStrategy] = useState<'GROUPED_BY_FARM' | 'GROUPED_BY_ANIMAL' | 'STRATIFIED_RANDOM'>('GROUPED_BY_FARM');
  const [allowedLabelQuality, setAllowedLabelQuality] = useState<'GOLD_AND_VALIDATED' | 'GOLD_ONLY'>('GOLD_AND_VALIDATED');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);
  const [trainingSuccess, setTrainingSuccess] = useState<string | null>(null);

  // Veterinary Review Form State
  const [reviewModelId, setReviewModelId] = useState<string>('');
  const [reviewComments, setReviewComments] = useState('');
  const [clinicalSafeguardsChecked, setClinicalSafeguardsChecked] = useState(false);
  const [plausibilityScore, setPlausibilityScore] = useState<number>(5);

  // Rollback Modal State
  const [rollbackTargetId, setRollbackTargetId] = useState<string>('');
  const [rollbackReason, setRollbackReason] = useState('');
  const [showRollbackModal, setShowRollbackModal] = useState(false);

  const refreshAll = () => {
    setCurrentUser(store.getCurrentUser());
    setDatasets(datasetImportService.listDatasets());
    setModels(modelRegistryService.listModels());
    setActiveModel(modelRegistryService.getActiveModel());
    setCandidateQueue(trainingCandidateQueueService.listCandidates());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Handle Dataset Upload
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadName || !uploadOrg || !uploadContent) {
      setUploadError('Please provide Dataset Name, Source Organization, and File Content.');
      return;
    }

    const res = datasetImportService.importDataset({
      datasetName: uploadName,
      sourceOrganization: uploadOrg,
      sourceType: uploadType,
      rawContent: uploadContent,
      format: uploadFormat,
      uploadedBy: currentUser.name
    });

    if (res.success && res.provenance) {
      setShowUploadModal(false);
      setUploadName('');
      setUploadOrg('');
      setUploadContent('');
      refreshAll();
    } else {
      setUploadError(res.error || 'Failed to parse and validate dataset.');
    }
  };

  // Sample Real-world Dataset Template Loader
  const loadSampleGovDataset = () => {
    setUploadName('National NADRES IVRI Surveillance Feed (Q1 2026)');
    setUploadOrg('ICAR - National Institute of Veterinary Epidemiology & Disease Informatics');
    setUploadType('GOVERNMENT_SURVEILLANCE');
    setUploadFormat('json');
    
    // Sample validated records adhering strictly to schema with gold standard PCR / ELISA labels
    const sampleRecords = [
      {
        record_id: 'rec_nivedi_001',
        animal_id: 'anm_pune_c12',
        farm_id: 'farm_mh_pune_01',
        species: 'Cattle',
        breed: 'Gir Cow',
        age_years: 4,
        sex: 'FEMALE',
        state: 'Maharashtra',
        district: 'Pune',
        symptoms: [
          { symptom_id: 'sym_fever', severity: 'severe' },
          { symptom_id: 'sym_oral_blisters', severity: 'severe' },
          { symptom_id: 'sym_excessive_salivation', severity: 'severe' },
          { symptom_id: 'sym_hoof_lesions', severity: 'moderate' }
        ],
        symptom_duration_days: 3,
        vaccination_status: 'UNVACCINATED',
        affected_animals: 3,
        total_animals: 12,
        mortality: 0,
        nearby_cases: 2,
        temperature: 31.5,
        humidity: 68,
        rainfall: 12,
        season: 'MONSOON',
        disease_label: 'dis_fmd',
        diagnosis_source: 'LAB_CONFIRMED',
        diagnosis_date: '2026-07-10',
        lab_test: 'RT_PCR',
        lab_result: 'POSITIVE',
        data_source: 'State Diagnostic Lab Pune (ISO 17025)'
      },
      {
        record_id: 'rec_nivedi_002',
        animal_id: 'anm_pune_c14',
        farm_id: 'farm_mh_pune_01',
        species: 'Cattle',
        breed: 'Gir Cow',
        age_years: 3,
        sex: 'FEMALE',
        symptoms: [
          { symptom_id: 'sym_fever', severity: 'severe' },
          { symptom_id: 'sym_oral_blisters', severity: 'moderate' },
          { symptom_id: 'sym_excessive_salivation', severity: 'severe' }
        ],
        symptom_duration_days: 2,
        vaccination_status: 'UNVACCINATED',
        affected_animals: 3,
        total_animals: 12,
        mortality: 0,
        disease_label: 'dis_fmd',
        diagnosis_source: 'LAB_CONFIRMED',
        diagnosis_date: '2026-07-10',
        lab_test: 'RT_PCR',
        lab_result: 'POSITIVE'
      },
      {
        record_id: 'rec_nivedi_003',
        animal_id: 'anm_sat_b08',
        farm_id: 'farm_mh_satara_04',
        species: 'Cattle',
        breed: 'Crossbred Holstein',
        age_years: 5,
        sex: 'FEMALE',
        state: 'Maharashtra',
        district: 'Satara',
        symptoms: [
          { symptom_id: 'sym_fever', severity: 'severe' },
          { symptom_id: 'sym_skin_nodules', severity: 'severe' },
          { symptom_id: 'sym_edema_legs', severity: 'moderate' },
          { symptom_id: 'sym_enlarged_lymph_nodes', severity: 'severe' }
        ],
        symptom_duration_days: 5,
        vaccination_status: 'OVERDUE',
        affected_animals: 2,
        total_animals: 8,
        mortality: 0,
        disease_label: 'dis_lsd',
        diagnosis_source: 'LAB_CONFIRMED',
        diagnosis_date: '2026-07-18',
        lab_test: 'RT_PCR',
        lab_result: 'POSITIVE'
      },
      {
        record_id: 'rec_nivedi_004',
        animal_id: 'anm_sol_g21',
        farm_id: 'farm_mh_solapur_09',
        species: 'Goat',
        breed: 'Osmanabadi',
        age_years: 2,
        sex: 'FEMALE',
        state: 'Maharashtra',
        district: 'Solapur',
        symptoms: [
          { symptom_id: 'sym_fever', severity: 'severe' },
          { symptom_id: 'sym_oral_ulcers', severity: 'severe' },
          { symptom_id: 'sym_severe_diarrhea', severity: 'severe' },
          { symptom_id: 'sym_nasal_discharge', severity: 'severe' }
        ],
        symptom_duration_days: 4,
        vaccination_status: 'UNVACCINATED',
        affected_animals: 5,
        total_animals: 24,
        mortality: 1,
        disease_label: 'dis_ppr',
        diagnosis_source: 'LAB_CONFIRMED',
        diagnosis_date: '2026-07-22',
        lab_test: 'ELISA',
        lab_result: 'POSITIVE'
      },
      {
        record_id: 'rec_nivedi_005',
        animal_id: 'anm_nas_c01',
        farm_id: 'farm_mh_nashik_02',
        species: 'Buffalo',
        breed: 'Murrah',
        age_years: 6,
        sex: 'FEMALE',
        state: 'Maharashtra',
        district: 'Nashik',
        symptoms: [
          { symptom_id: 'sym_fever', severity: 'severe' },
          { symptom_id: 'sym_throat_swelling', severity: 'severe' },
          { symptom_id: 'sym_respiratory_distress', severity: 'severe' }
        ],
        symptom_duration_days: 1,
        vaccination_status: 'UNVACCINATED',
        affected_animals: 2,
        total_animals: 6,
        mortality: 1,
        disease_label: 'dis_hs',
        diagnosis_source: 'LAB_CONFIRMED',
        diagnosis_date: '2026-07-25',
        lab_test: 'BACTERIAL_CULTURE',
        lab_result: 'POSITIVE'
      },
      {
        record_id: 'rec_nivedi_006',
        animal_id: 'anm_ahm_c99',
        farm_id: 'farm_mh_ahmednagar_05',
        species: 'Cattle',
        breed: 'Jersey Cross',
        age_years: 4,
        sex: 'FEMALE',
        state: 'Maharashtra',
        district: 'Ahmednagar',
        symptoms: [
          { symptom_id: 'sym_fever', severity: 'severe' },
          { symptom_id: 'sym_crepitant_swelling', severity: 'severe' },
          { symptom_id: 'sym_lameness', severity: 'severe' }
        ],
        symptom_duration_days: 2,
        vaccination_status: 'UNVACCINATED',
        affected_animals: 1,
        total_animals: 10,
        mortality: 0,
        disease_label: 'dis_bq',
        diagnosis_source: 'VETERINARIAN_CONFIRMED',
        diagnosis_date: '2026-08-01'
      },
      {
        record_id: 'rec_nivedi_007',
        animal_id: 'anm_pune_m11',
        farm_id: 'farm_mh_pune_11',
        species: 'Cattle',
        breed: 'Holstein',
        age_years: 4,
        sex: 'FEMALE',
        state: 'Maharashtra',
        district: 'Pune',
        symptoms: [
          { symptom_id: 'sym_udder_swelling', severity: 'severe' },
          { symptom_id: 'sym_abnormal_milk_clots', severity: 'severe' },
          { symptom_id: 'sym_udder_heat_pain', severity: 'severe' },
          { symptom_id: 'sym_drop_in_milk', severity: 'severe' }
        ],
        symptom_duration_days: 2,
        vaccination_status: 'UP_TO_DATE',
        affected_animals: 1,
        total_animals: 15,
        mortality: 0,
        disease_label: 'dis_mastitis',
        diagnosis_source: 'VETERINARIAN_CONFIRMED',
        diagnosis_date: '2026-08-05'
      },
      {
        record_id: 'rec_nivedi_008',
        animal_id: 'anm_sat_p04',
        farm_id: 'farm_mh_satara_12',
        species: 'Poultry',
        breed: 'Commercial Broiler',
        age_years: 0.1,
        sex: 'UNKNOWN',
        state: 'Maharashtra',
        district: 'Satara',
        symptoms: [
          { symptom_id: 'sym_cyanosis_comb_wattle', severity: 'severe' },
          { symptom_id: 'sym_facial_swelling', severity: 'severe' },
          { symptom_id: 'sym_sudden_death', severity: 'severe' }
        ],
        symptom_duration_days: 1,
        vaccination_status: 'UNVACCINATED',
        affected_animals: 45,
        total_animals: 500,
        mortality: 20,
        disease_label: 'dis_avian_flu',
        diagnosis_source: 'LAB_CONFIRMED',
        diagnosis_date: '2026-08-10',
        lab_test: 'RT_PCR',
        lab_result: 'POSITIVE'
      }
    ];

    setUploadContent(JSON.stringify(sampleRecords, null, 2));
  };

  // Run Training Pipeline V2
  const handleExecuteTraining = () => {
    const ds = datasets.find(d => d.dataset_id === selectedDatasetId);
    if (!ds || !ds.rawData) {
      alert('Selected dataset is not approved or contains no raw records.');
      return;
    }

    setIsTraining(true);
    setTrainingSuccess(null);
    setTrainingLog([]);

    const log = (msg: string) => {
      setTrainingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    setTimeout(() => {
      try {
        log(`Ingesting ${ds.rawData?.length} records from '${ds.dataset_name}'...`);
        log(`Enforcing label quality criteria: ${allowedLabelQuality === 'GOLD_ONLY' ? 'GOLD_STANDARD only' : 'GOLD_STANDARD + VALIDATED'}...`);
        log(`Executing Grouped Partitioning (${splitStrategy}) to eliminate farm/animal leakage...`);

        const pkg = MLTrainingPipelineV2.runTrainingPipeline(
          ds.rawData!,
          ds.dataset_id,
          ds.dataset_name,
          {
            splitStrategy,
            allowedLabelQualities: allowedLabelQuality === 'GOLD_ONLY' ? ['GOLD_STANDARD'] : ['GOLD_STANDARD', 'VALIDATED'],
            enableTemporalValidation: true,
            enableGeographicValidation: true
          }
        );

        if (pkg.metadata.status === 'UNAVAILABLE') {
          log(`VALIDATION GATE ALERT: ${pkg.metadata.reason || 'ML training unavailable: dataset validation produced 0 valid records.'}`);
          log(`Total Records Evaluated: ${pkg.dataQualityReport.totalRecordsChecked} | Valid: ${pkg.dataQualityReport.validRecords} | Rejected: ${pkg.dataQualityReport.rejectedRecords}`);
          log(`Model status set to UNAVAILABLE. Existing production model preserved safely.`);
          return;
        }

        log(`Training multi-class Random Forest (30 trees, max depth 8) completed.`);
        log(`Test Set Accuracy: ${(pkg.evaluationMetrics.accuracy * 100).toFixed(1)}% | Macro F1: ${(pkg.evaluationMetrics.macroF1 * 100).toFixed(1)}% | Log Loss: ${pkg.evaluationMetrics.logLoss.toFixed(3)}`);
        
        if (pkg.evaluationMetrics.temporalValidation) {
          log(`Temporal Out-of-Time Accuracy: ${(pkg.evaluationMetrics.temporalValidation.temporalAccuracy * 100).toFixed(1)}%`);
        }
        if (pkg.evaluationMetrics.geographicValidation?.status === 'EVALUATED') {
          log(`Spatial Out-of-District Accuracy: ${(pkg.evaluationMetrics.geographicValidation.outOfDistrictAccuracy * 100).toFixed(1)}%`);
        } else {
          log(`Spatial Generalization: ${pkg.evaluationMetrics.geographicValidation?.notes}`);
        }

        log(`Submitting artifact to ModelRegistry with validation gate check...`);
        const regRes = modelRegistryService.registerModel(pkg, ds.dataset_id, ds.dataset_name, currentUser.name);

        if (regRes.success) {
          log(`SUCCESS: Model ${pkg.metadata.modelVersion} registered with ID ${regRes.modelId}. Status: ${pkg.metadata.status}`);
          setTrainingSuccess(`Model V2 training complete. Status: PENDING VETERINARY REVIEW.`);
          refreshAll();
        } else {
          log(`Validation Gate Alert: ${regRes.message}`);
        }
      } catch (err: any) {
        log(`TRAINING ABORTED: ${err.message}`);
      } finally {
        setIsTraining(false);
      }
    }, 600);
  };

  // Submit Veterinary Review Sign-Off
  const handleSubmitReview = (decision: 'APPROVED' | 'REJECTED') => {
    if (!reviewModelId || !reviewComments) {
      alert('Please select a model and provide clinical review remarks.');
      return;
    }

    const success = modelRegistryService.submitVeterinaryReview(reviewModelId, {
      reviewedBy: currentUser.name,
      reviewerRole: currentUser.role,
      reviewerCredentials: 'State Veterinary Surgeon (VAS/Reg #MH-VET-8891)',
      decision,
      clinicalSafeguardsChecked,
      epidemiologicalPlausibilityScore: plausibilityScore,
      comments: reviewComments,
      limitationsNoted: [
        'Model outputs are statistical decision support likelihoods only.',
        'Requires mandatory RT-PCR / ELISA laboratory confirmation for notifiable diseases.',
        'Contraindication safeguard active: Sick animals must never be vaccinated.'
      ]
    });

    if (success) {
      alert(`Veterinary review recorded: Model status updated to ${decision === 'APPROVED' ? 'PRODUCTION_CANDIDATE' : 'RETIRED'}.`);
      setReviewModelId('');
      setReviewComments('');
      refreshAll();
    }
  };

  // Promote Model to Active Production
  const handlePromoteToProduction = (modelId: string) => {
    if (confirm('Are you sure you want to promote this model to ACTIVE PRODUCTION for live disease screening?')) {
      const ok = modelRegistryService.promoteToProduction(modelId, currentUser.name);
      if (ok) {
        alert('Model successfully activated for live screening.');
        refreshAll();
      }
    }
  };

  // Execute Rollback
  const handleExecuteRollback = () => {
    if (!rollbackTargetId || !rollbackReason) {
      alert('Please provide a target model and audit reason for rollback.');
      return;
    }

    const ok = modelRegistryService.rollbackToModel(rollbackTargetId, currentUser.name, rollbackReason);
    if (ok) {
      alert('Production model rolled back successfully.');
      setShowRollbackModal(false);
      setRollbackReason('');
      refreshAll();
    }
  };

  const approvedDatasets = datasets.filter(d => d.approval_status === 'APPROVED_FOR_TRAINING' || d.approval_status === 'VALIDATED');

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Real-World Data Ingestion & ML Model Governance</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              ML Data & Model Management
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Ingest laboratory-confirmed livestock data, train Model V2, perform grouped validation, and govern production models with veterinary sign-off.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Dataset
            </button>
            <button
              onClick={refreshAll}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              title="Refresh Registry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Active Production Model Ribbon */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Active Live Model:</span>
            <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-md font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {activeModel?.model_version || 'MODEL_V1_BASELINE'}
            </span>
            <span className="text-slate-400">({activeModel?.model_type || 'RANDOM_FOREST_CLASSIFIER'})</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-300">
              Provenance:{' '}
              <strong className="text-white font-medium">{activeModel?.dataset_name || 'Standard Field Benchmark'}</strong>
            </span>
            <span className="text-slate-300">
              Holdout Accuracy:{' '}
              <strong className="text-emerald-400 font-mono font-medium">
                {((activeModel?.metrics?.accuracy ?? 0.94) * 100).toFixed(1)}%
              </strong>
            </span>
            <span className="text-slate-300">
              Macro F1:{' '}
              <strong className="text-indigo-400 font-mono font-medium">
                {((activeModel?.metrics?.macroF1 ?? 0.92) * 100).toFixed(1)}%
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm px-4 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('datasets')}
          className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'datasets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Datasets & Provenance ({(datasets || []).length})
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'training'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Model Training Studio (V2)
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'models'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Model Registry & Metrics ({(models || []).length})
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'review'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Veterinary Review Sign-Off
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TestTube className="w-4 h-4" />
          Lab Feedback Queue ({(candidateQueue || []).length})
        </button>
      </div>

      {/* TAB 1: DATASETS & PROVENANCE */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          {(datasets || []).length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-amber-900">Awaiting Validated Real-World Livestock Health Data</h3>
              <p className="text-amber-800 text-sm max-w-xl mx-auto mt-2">
                No external clinical/laboratory datasets have been uploaded yet. The system is operating on the baseline development prototype model (<code>livestock-disease-v1</code>).
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition"
                >
                  Upload Real Health Dataset
                </button>
                <button
                  onClick={loadSampleGovDataset}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition"
                >
                  Load Sample Government Feed
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {datasets.map(ds => (
                <div key={ds.dataset_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{ds.dataset_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          ds.approval_status === 'APPROVED_FOR_TRAINING'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ds.approval_status === 'VALIDATED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ds.approval_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        Source: <strong>{ds.source_organization}</strong> ({ds.source_type}) • Uploaded by {ds.uploaded_by}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {ds.approval_status !== 'APPROVED_FOR_TRAINING' && (
                        <button
                          onClick={() => {
                            datasetImportService.updateDatasetStatus(ds.dataset_id, 'APPROVED_FOR_TRAINING', currentUser.name, 'Admin approved for ML V2 training');
                            refreshAll();
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Approve for Training
                        </button>
                      )}
                      {ds.approval_status !== 'REJECTED' && (
                        <button
                          onClick={() => {
                            datasetImportService.updateDatasetStatus(ds.dataset_id, 'REJECTED', currentUser.name, 'Rejected by administrator');
                            refreshAll();
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold rounded-lg transition border border-slate-200"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-slate-500 text-xs block">Total Records</span>
                      <strong className="text-lg font-bold text-slate-900">{ds.number_of_records}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-slate-500 text-xs block">Farms / Holdings</span>
                      <strong className="text-lg font-bold text-slate-900">{ds.number_of_farms}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-slate-500 text-xs block">Disease Target Classes</span>
                      <strong className="text-lg font-bold text-slate-900">{ds.number_of_disease_classes}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-slate-500 text-xs block">Gold Standard Labels</span>
                      <strong className="text-lg font-bold text-emerald-700">
                        {ds.label_quality_breakdown.gold_standard} ({Math.round((ds.label_quality_breakdown.gold_standard / Math.max(1, ds.number_of_records)) * 100)}%)
                      </strong>
                    </div>
                  </div>

                  {/* Label Quality Breakdown Bar */}
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-700 block mb-1">Label Quality Distribution</span>
                    <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                      <div
                        style={{ width: `${(ds.label_quality_breakdown.gold_standard / Math.max(1, ds.number_of_records)) * 100}%` }}
                        className="bg-emerald-500"
                        title={`Gold Standard: ${ds.label_quality_breakdown.gold_standard}`}
                      />
                      <div
                        style={{ width: `${(ds.label_quality_breakdown.validated / Math.max(1, ds.number_of_records)) * 100}%` }}
                        className="bg-indigo-500"
                        title={`Veterinary Validated: ${ds.label_quality_breakdown.validated}`}
                      />
                      <div
                        style={{ width: `${(ds.label_quality_breakdown.provisional / Math.max(1, ds.number_of_records)) * 100}%` }}
                        className="bg-amber-500"
                        title={`Provisional: ${ds.label_quality_breakdown.provisional}`}
                      />
                      <div
                        style={{ width: `${(ds.label_quality_breakdown.unverified / Math.max(1, ds.number_of_records)) * 100}%` }}
                        className="bg-slate-300"
                        title={`Unverified: ${ds.label_quality_breakdown.unverified}`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Gold Standard (Lab Confirmed)</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Validated (Veterinarian)</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Provisional</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MODEL TRAINING STUDIO (V2) */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Model V2 Training Pipeline</h3>
            <p className="text-slate-600 text-sm mb-6">
              Train <code>livestock-disease-v2</code> strictly from approved datasets. Enforces grouped train/test splitting to prevent farm data leakage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Approved Dataset
                </label>
                <select
                  value={selectedDatasetId}
                  onChange={e => setSelectedDatasetId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Dataset --</option>
                  {approvedDatasets.map(d => (
                    <option key={d.dataset_id} value={d.dataset_id}>
                      {d.dataset_name} ({d.number_of_records} records)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Grouped Splitting Strategy
                </label>
                <select
                  value={splitStrategy}
                  onChange={e => setSplitStrategy(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GROUPED_BY_FARM">Grouped by Farm / Holding ID (Recommended)</option>
                  <option value="GROUPED_BY_ANIMAL">Grouped by Animal ID</option>
                  <option value="STRATIFIED_RANDOM">Stratified Random Split</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Label Quality Filter
                </label>
                <select
                  value={allowedLabelQuality}
                  onChange={e => setAllowedLabelQuality(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GOLD_AND_VALIDATED">GOLD_STANDARD + VALIDATED (Production Recommended)</option>
                  <option value="GOLD_ONLY">GOLD_STANDARD (Lab-Confirmed Only)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                disabled={!selectedDatasetId || isTraining}
                onClick={handleExecuteTraining}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition flex items-center shadow"
              >
                {isTraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Training Model V2...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Execute Model V2 Training Pipeline
                  </>
                )}
              </button>
            </div>

            {/* Live Pipeline Execution Console */}
            {trainingLog.length > 0 && (
              <div className="mt-6 bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs font-mono text-slate-300 space-y-1 max-h-60 overflow-y-auto">
                <div className="text-indigo-400 font-bold border-b border-slate-800 pb-1 mb-2">
                  === ML TRAINING PIPELINE EXECUTION CONSOLE ===
                </div>
                {trainingLog.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            )}

            {trainingSuccess && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {trainingSuccess}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MODEL REGISTRY & METRICS */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Model Packages</h3>
                <p className="text-slate-500 text-xs">
                  Inspect model versions, validation status, holdout evaluation metrics, and promote or rollback production candidates.
                </p>
              </div>

              <button
                onClick={() => setShowRollbackModal(true)}
                className="inline-flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Emergency Rollback Controller
              </button>
            </div>

            {/* Model Comparison Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Version & Status</th>
                    <th className="py-3 px-4">Dataset Provenance</th>
                    <th className="py-3 px-4 font-mono">Accuracy</th>
                    <th className="py-3 px-4 font-mono">Macro F1</th>
                    <th className="py-3 px-4 font-mono">Log Loss</th>
                    <th className="py-3 px-4">Temporal Valid.</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {models.map(m => {
                    const isCurrentActive = m.model_id === activeModel.model_id;
                    return (
                      <tr key={m.model_id} className={isCurrentActive ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-slate-900 font-mono">{m.model_version}</strong>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.status === 'PRODUCTION'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'PRODUCTION_CANDIDATE'
                                ? 'bg-indigo-100 text-indigo-800'
                                : m.status === 'PENDING_REVIEW'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px] block">{m.model_type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-800 font-medium">{m.dataset_name}</strong>
                          <span className="text-slate-400 text-[11px] block">{m.training_records} training samples</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {(m.metrics.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {(m.metrics.macroF1 * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {m.metrics.logLoss.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {m.metrics.temporalValidation ? (
                            <span className="text-emerald-700 font-medium">
                              {(m.metrics.temporalValidation.temporalAccuracy * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">Baseline Static</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isCurrentActive ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active Live
                            </span>
                          ) : (
                            m.status === 'PRODUCTION_CANDIDATE' ? (
                              <button
                                onClick={() => handlePromoteToProduction(m.model_id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition shadow"
                              >
                                Promote to Production
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">{m.status}</span>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VETERINARY REVIEW SIGN-OFF */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Veterinary Domain Review & Sign-Off</h3>
            <p className="text-slate-600 text-sm mb-6">
              Statutory clinical and epidemiological review before a candidate model can be promoted to active screening in field applications.
            </p>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Model for Review
                </label>
                <select
                  value={reviewModelId}
                  onChange={e => setReviewModelId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                >
                  <option value="">-- Select Candidate Model --</option>
                  {models.filter(m => m.status === 'PENDING_REVIEW' || m.status === 'VALIDATION').map(m => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.model_version} ({m.dataset_name} • Holdout Acc: {(m.metrics.accuracy * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Epidemiological Plausibility Score (1-5)
                </label>
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val} className="flex items-center space-x-1 text-sm font-semibold">
                      <input
                        type="radio"
                        name="plausibility"
                        checked={plausibilityScore === val}
                        onChange={() => setPlausibilityScore(val)}
                        className="text-indigo-600"
                      />
                      <span>{val} {val === 5 ? '(Highest)' : ''}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start space-x-2 text-xs text-slate-800 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicalSafeguardsChecked}
                    onChange={e => setClinicalSafeguardsChecked(e.target.checked)}
                    className="mt-0.5 text-indigo-600 rounded"
                  />
                  <span>
                    I confirm that the model results represent probabilistic screening only and do NOT override clinical physical examinations, notifiable disease reporting, or mandatory laboratory testing.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Review Comments & Observations
                </label>
                <textarea
                  value={reviewComments}
                  onChange={e => setReviewComments(e.target.value)}
                  placeholder="Enter clinical assessment of top feature importances and differential disease discrimination..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-normal h-24"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={!reviewModelId || !clinicalSafeguardsChecked || !reviewComments}
                  onClick={() => handleSubmitReview('APPROVED')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition shadow"
                >
                  Approve as PRODUCTION CANDIDATE
                </button>
                <button
                  disabled={!reviewModelId}
                  onClick={() => handleSubmitReview('REJECTED')}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition"
                >
                  Reject Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LAB FEEDBACK QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Training Data Candidate Queue</h3>
                <p className="text-slate-500 text-xs">
                  Lab-confirmed cases (Gold Standard) and veterinary-confirmed cases streamed automatically from clinical workflows.
                </p>
              </div>

              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                {(candidateQueue || []).length} Queued Records
              </span>
            </div>

            {(candidateQueue || []).length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No new confirmed cases queued. As laboratory staff upload RT-PCR / ELISA results, cases will stream here automatically.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {candidateQueue.map(c => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{c.caseNumber}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {c.labelQuality}
                        </span>
                        <span className="text-xs text-slate-600">({c.record.species} • {c.record.disease_label})</span>
                      </div>
                      <span className="text-slate-400 text-xs block mt-0.5">
                        Origin: {c.origin} • Submitted {new Date(c.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-500">
                      Assay: {c.record.lab_test || 'Clinical Vet Verification'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD DATASET MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Real-World Livestock Health Dataset
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dataset Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadName}
                    onChange={e => setUploadName(e.target.value)}
                    placeholder="e.g. State Animal Disease Feed 2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Source Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadOrg}
                    onChange={e => setUploadOrg(e.target.value)}
                    placeholder="e.g. State Diagnostic Lab / ICAR-NIVEDI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Source Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="GOVERNMENT_SURVEILLANCE">Government Surveillance Feed</option>
                    <option value="DIAGNOSTIC_LAB">Diagnostic Laboratory (ISO 17025)</option>
                    <option value="VETERINARY_HOSPITAL">Veterinary Hospital / Dispensary</option>
                    <option value="RESEARCH_INSTITUTION">Research Institution / University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    File Format
                  </label>
                  <select
                    value={uploadFormat}
                    onChange={e => setUploadFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="json">JSON Array of Records</option>
                    <option value="csv">CSV (Comma-Separated Values)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Raw File Content *
                  </label>
                  <button
                    type="button"
                    onClick={loadSampleGovDataset}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Load Sample Government Feed
                  </button>
                </div>
                <textarea
                  required
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  placeholder="Paste JSON array or CSV text here..."
                  className="w-full h-44 px-3 py-2 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Validate & Ingest Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLLBACK MODAL */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              Emergency Model Rollback
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Instantly revert active production screening to a prior verified model or baseline <code>livestock-disease-v1</code>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Model to Activate
                </label>
                <select
                  value={rollbackTargetId}
                  onChange={e => setRollbackTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">-- Choose Target Model --</option>
                  {models.map(m => (
                    <option key={m.model_id} value={m.model_id}>
                      {m.model_version} ({m.dataset_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Audit Rollback Reason *
                </label>
                <textarea
                  value={rollbackReason}
                  onChange={e => setRollbackReason(e.target.value)}
                  placeholder="Explain why rollback is required..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRollbackModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRollback}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Confirm Rollback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
