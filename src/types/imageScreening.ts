import { Species, Role } from './index';

/**
 * Feasibility classification for visual diagnosis across the 11 target disease classes.
 * Some diseases present with distinct gross anatomical lesions (vesicles, cutaneous nodules),
 * whereas others are systemic/peracute bacterial or viral infections where surface photos
 * are clinically non-diagnostic and laboratory confirmation is legally/clinically required.
 */
export type VisualFeasibilityTier =
  | 'VISUAL_SCREENING_FEASIBLE'             // External lesions/signs can be evaluated visually
  | 'SYNDROMIC_SUSPICION_LAB_MANDATORY'     // Visible signs exist but strongly overlap with other pathogens; PCR/ELISA required
  | 'LABORATORY_CONFIRMATORY_REQUIRED'      // Internal, subclinical, or systemic; photographs are non-diagnostic
  | 'STRICT_BIOHAZARD_LAB_REQUIRED';        // Biohazard pathogen (e.g. Anthrax) where handling/carcass opening is hazardous

export interface DiseaseVisualTaxonomyItem {
  diseaseId: string;
  code: string;
  commonName: string;
  scientificName: string;
  targetSpecies: Species[];
  feasibilityTier: VisualFeasibilityTier;
  visualLesionDescription: string;
  recommendedPhotoTypes: ('LESION' | 'SYMPTOM' | 'ANIMAL_OVERVIEW' | 'OTHER')[];
  labTestRequirement: string;
  clinicalSafetyWarning?: string;
  trainingDataAvailability: 'ADEQUATE' | 'SPARSE' | 'PENDING_INSTITUTIONAL_COLLECTION';
}

export interface ImageValidationReport {
  isValid: boolean;
  format: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  qualityStatus: 'GOOD' | 'BLURRY' | 'UNDEREXPOSED' | 'OVEREXPOSED' | 'LOW_RESOLUTION' | 'POOR';
  sharpnessScore: number;                 // Normalized Laplacian variance (0-100)
  exposureScore: number;                  // Mean luminance (0-255)
  aspectRatio: number;
  issues: string[];
  recommendations: string[];
}

export const LIVESTOCK_11_DISEASE_TAXONOMY: DiseaseVisualTaxonomyItem[] = [
  {
    diseaseId: 'dis_fmd',
    code: 'FMD',
    commonName: 'Foot-and-Mouth Disease',
    scientificName: 'Aphthovirus',
    targetSpecies: ['Cattle', 'Buffalo', 'Sheep', 'Goat', 'Pig'],
    feasibilityTier: 'VISUAL_SCREENING_FEASIBLE',
    visualLesionDescription: 'Erosive mucosal vesicles on dental pad, tongue, buccal mucosa, interdigital cleft, coronary band, and teats; profuse stringy salivation.',
    recommendedPhotoTypes: ['LESION', 'SYMPTOM'],
    labTestRequirement: 'Antigen ELISA / RT-PCR on vesicular fluid or epithelial tissue.',
    trainingDataAvailability: 'SPARSE'
  },
  {
    diseaseId: 'dis_lsd',
    code: 'LSD',
    commonName: 'Lumpy Skin Disease',
    scientificName: 'Capripoxvirus',
    targetSpecies: ['Cattle', 'Buffalo'],
    feasibilityTier: 'VISUAL_SCREENING_FEASIBLE',
    visualLesionDescription: 'Multiple well-circumscribed, firm, raised cutaneous nodules (2-5 cm) on head, neck, limbs, udder, and perineum; sitfast necrotic cores.',
    recommendedPhotoTypes: ['LESION', 'ANIMAL_OVERVIEW'],
    labTestRequirement: 'Real-time PCR on skin scab biopsies or blood.',
    trainingDataAvailability: 'SPARSE'
  },
  {
    diseaseId: 'dis_ppr',
    code: 'PPR',
    commonName: 'Peste des Petits Ruminants (Goat Plague)',
    scientificName: 'Small Ruminant Morbillivirus',
    targetSpecies: ['Goat', 'Sheep'],
    feasibilityTier: 'VISUAL_SCREENING_FEASIBLE',
    visualLesionDescription: 'Erosive necrotic stomatitis, encrusted and scabby lips, purulent oculonasal discharge, conjunctivitis, and severe watery-bloody diarrhea.',
    recommendedPhotoTypes: ['SYMPTOM', 'LESION'],
    labTestRequirement: 'Competitive ELISA (c-ELISA) or RT-PCR.',
    trainingDataAvailability: 'SPARSE'
  },
  {
    diseaseId: 'dis_hs',
    code: 'HS',
    commonName: 'Haemorrhagic Septicaemia',
    scientificName: 'Pasteurella multocida (B:2, E:2)',
    targetSpecies: ['Buffalo', 'Cattle'],
    feasibilityTier: 'LABORATORY_CONFIRMATORY_REQUIRED',
    visualLesionDescription: 'Acute submandibular and brisket edema with severe dyspnea; clinical signs mimic snakebite, acute anthrax, or cardiac failure.',
    recommendedPhotoTypes: ['ANIMAL_OVERVIEW'],
    labTestRequirement: 'Blood smear Leishman/Giemsa stain for bipolar organisms and culture/PCR.',
    clinicalSafetyWarning: 'Peracute fatal septicemia (death in 12-24h). Surface photographs cannot confirm bacterial identity; emergency veterinary antibiotic therapy and blood smear required.',
    trainingDataAvailability: 'PENDING_INSTITUTIONAL_COLLECTION'
  },
  {
    diseaseId: 'dis_anthrax',
    code: 'ANTHRAX',
    commonName: 'Anthrax',
    scientificName: 'Bacillus anthracis',
    targetSpecies: ['Cattle', 'Buffalo', 'Sheep', 'Goat', 'Horse'],
    feasibilityTier: 'STRICT_BIOHAZARD_LAB_REQUIRED',
    visualLesionDescription: 'Sudden death, incomplete rigor mortis, dark unclotted blood oozing from mouth, nostrils, and anus; bloated carcass.',
    recommendedPhotoTypes: ['ANIMAL_OVERVIEW'],
    labTestRequirement: 'Polychrome methylene blue stain (M\'Fadyean reaction) on peripheral blood smear or PCR.',
    clinicalSafetyWarning: 'STRICT BIOHAZARD: Do NOT open or manipulate carcass. Spores contaminate pasture for decades and infect humans (cutaneous/pulmonary anthrax). Photography alone cannot confirm diagnosis.',
    trainingDataAvailability: 'PENDING_INSTITUTIONAL_COLLECTION'
  },
  {
    diseaseId: 'dis_bq',
    code: 'BQ',
    commonName: 'Black Quarter',
    scientificName: 'Clostridium chauvoei',
    targetSpecies: ['Cattle', 'Sheep'],
    feasibilityTier: 'LABORATORY_CONFIRMATORY_REQUIRED',
    visualLesionDescription: 'Hot painful crepitating swelling over heavy muscle masses (hindquarters, shoulder) which becomes cold and painless; dark necrotic emphysematous muscle.',
    recommendedPhotoTypes: ['ANIMAL_OVERVIEW'],
    labTestRequirement: 'Direct fluorescent antibody test (FAT) or PCR on muscular aspirates.',
    clinicalSafetyWarning: 'Crepitation requires physical palpation; visual skin photos cannot confirm anaerobic clostridial myonecrosis.',
    trainingDataAvailability: 'PENDING_INSTITUTIONAL_COLLECTION'
  },
  {
    diseaseId: 'dis_brucellosis',
    code: 'BRUCELLOSIS',
    commonName: 'Brucellosis',
    scientificName: 'Brucella abortus / Brucella melitensis',
    targetSpecies: ['Cattle', 'Buffalo', 'Sheep', 'Goat', 'Pig'],
    feasibilityTier: 'LABORATORY_CONFIRMATORY_REQUIRED',
    visualLesionDescription: 'Third-trimester abortion, retained placenta, hygroma in knees, orchitis/epididymitis in males. External lesions are non-specific.',
    recommendedPhotoTypes: ['OTHER'],
    labTestRequirement: 'Rose Bengal Plate Test (RBPT), Indirect ELISA, or Milk Ring Test (MRT).',
    clinicalSafetyWarning: 'Zoonotic pathogen causing undulant fever in humans. Aborted fetuses and fluids are highly infectious; photographs cannot differentiate from other abortion pathogens (e.g. IBR, Leptospirosis).',
    trainingDataAvailability: 'PENDING_INSTITUTIONAL_COLLECTION'
  },
  {
    diseaseId: 'dis_mastitis',
    code: 'MASTITIS',
    commonName: 'Clinical Mastitis',
    scientificName: 'Staphylococcus aureus / Streptococcus uberis / E. coli',
    targetSpecies: ['Cattle', 'Buffalo', 'Goat', 'Sheep'],
    feasibilityTier: 'VISUAL_SCREENING_FEASIBLE',
    visualLesionDescription: 'Grossly swollen, erythematous, asymmetric udder quarters; flakes, clots, watery, bloody, or purulent secretion in strip-cup milk.',
    recommendedPhotoTypes: ['LESION', 'SYMPTOM'],
    labTestRequirement: 'California Mastitis Test (CMT) and milk microbial culture / antibiotic sensitivity test.',
    trainingDataAvailability: 'SPARSE'
  },
  {
    diseaseId: 'dis_asf',
    code: 'ASF',
    commonName: 'African Swine Fever',
    scientificName: 'Asfarviridae (African swine fever virus)',
    targetSpecies: ['Pig'],
    feasibilityTier: 'SYNDROMIC_SUSPICION_LAB_MANDATORY',
    visualLesionDescription: 'Cyanosis and cutaneous erythema on ears, abdomen, and distal extremities; bloody diarrhea, recumbency, ocular discharge.',
    recommendedPhotoTypes: ['LESION', 'ANIMAL_OVERVIEW'],
    labTestRequirement: 'Real-time PCR / antigen detection ELISA is legally mandatory.',
    clinicalSafetyWarning: 'High-consequence viral hemorrhagic fever indistinguishable visually from Classical Swine Fever (CSF) and PRRS. Immediate notifiable quarantine required.',
    trainingDataAvailability: 'PENDING_INSTITUTIONAL_COLLECTION'
  },
  {
    diseaseId: 'dis_avian_flu',
    code: 'AVIAN_FLU',
    commonName: 'Avian Influenza (Bird Flu)',
    scientificName: 'Influenza A virus (H5N1 / H5N8 / H7N9)',
    targetSpecies: ['Poultry'],
    feasibilityTier: 'SYNDROMIC_SUSPICION_LAB_MANDATORY',
    visualLesionDescription: 'Cyanosis and edema of comb and wattles, subcutaneous edema of head and neck, ecchymotic hemorrhages on shanks/feet, green diarrhea.',
    recommendedPhotoTypes: ['LESION', 'ANIMAL_OVERVIEW'],
    labTestRequirement: 'Real-time RT-PCR / Hemagglutination Inhibition (HI) test.',
    clinicalSafetyWarning: 'Zoonotic pandemic threat. Gross lesions clinically resemble Velogenic Viscerotropic Newcastle Disease (Ranikhet); PCR confirmation is legally mandatory.',
    trainingDataAvailability: 'PENDING_INSTITUTIONAL_COLLECTION'
  },
  {
    diseaseId: 'dis_other_healthy',
    code: 'HEALTHY',
    commonName: 'Other / Non-infectious / Healthy',
    scientificName: 'Non-specific / Baseline',
    targetSpecies: ['Cattle', 'Buffalo', 'Sheep', 'Goat', 'Pig', 'Poultry', 'Horse'],
    feasibilityTier: 'VISUAL_SCREENING_FEASIBLE',
    visualLesionDescription: 'Alert posture, smooth skin coat without focal pustules/nodules, clean muzzle and conjunctiva, absence of inflammatory edema.',
    recommendedPhotoTypes: ['ANIMAL_OVERVIEW'],
    labTestRequirement: 'Routine health screening.',
    trainingDataAvailability: 'ADEQUATE'
  }
];

export type ImageScreeningStatus =
  | 'MODEL_NOT_READY'                     // Model weights are not loaded or training is pending real dataset
  | 'TRAINING_PENDING'                    // Model training pipeline configured but awaiting verified institutional data
  | 'READY'                               // Engine loaded and operational
  | 'SCREENING_COMPLETED'                 // Inference performed successfully
  | 'LOW_CONFIDENCE_REJECTED'             // Uncertainty/rejection triggered (confidence below reliable threshold)
  | 'NON_VISUAL_DISEASE_WARNING'          // Selected condition is systemic/internal and cannot be confirmed from photos
  | 'INSUFFICIENT_VISUAL_EVIDENCE'        // Image lacks sufficient diagnostic features
  | 'UNSUPPORTED_SPECIES'                 // Species not in model training domain
  | 'IMAGE_QUALITY_DEFECT';               // Image too blurry, dark, overexposed, or corrupt

export type ImageModelArchitecture = 'EfficientNetB0' | 'MobileNetV2';

export interface ImageScreeningRecord {
  id: string;
  caseId?: string;
  animalId?: string;
  imageStoragePath: string;
  thumbnailStoragePath?: string;
  species: Species;
  predictedClass?: string;
  predictedClassName?: string;
  visualFeasibilityTier?: VisualFeasibilityTier;
  confidenceScore?: number;               // 0 to 100 (calibrated)
  rawSoftmaxScore?: number;               // 0 to 1
  uncertaintyScore?: number;              // Shannon entropy or variation ratio
  isRejectedDueToUncertainty?: boolean;
  screeningStatus: ImageScreeningStatus;
  modelVersion: string;
  modelArchitecture: ImageModelArchitecture;
  imageQualityStatus: 'GOOD' | 'BLURRY' | 'UNDEREXPOSED' | 'OVEREXPOSED' | 'LOW_RESOLUTION' | 'POOR';
  veterinarianReviewStatus: 'PENDING' | 'AGREED' | 'DISAGREED' | 'INCONCLUSIVE' | 'LAB_CONFIRMATION_ORDERED';
  veterinarianNotes?: string;
  veterinarianReviewedBy?: string;
  veterinarianReviewedAt?: string;
  limitationsNotes: string[];
  recommendation: string;
  topCandidatePredictions?: {
    diseaseId: string;
    diseaseName: string;
    calibratedScorePct: number;
    visualFeasibility: VisualFeasibilityTier;
  }[];
  createdAt: string;
}

export interface ImageModelRegistryEntry {
  id: string;
  modelName: string;
  modelVersion: string;
  architecture: ImageModelArchitecture;
  datasetVersion: string;
  evaluationStatus: 'UNVALIDATED' | 'TRAINING_PENDING' | 'VALIDATED_ON_HELD_OUT_TEST';
  modelArtifactLocation: string;
  totalParameters: number;
  modelSizeBytes: number;
  inferenceTimeMs: number;
  inputResolution: [number, number];
  supportedVisualClasses: string[];
  nonVisualClasses: string[];
  metrics?: {
    accuracy: number;
    macroPrecision: number;
    macroRecall: number;
    macroF1: number;
    perClassF1: Record<string, number>;
    confusionMatrix?: number[][];
    testSetSupport: number;
    testedDate: string;
  };
  provenance: {
    datasetSources: string[];
    licenses: string[];
    trainingDate?: string;
    author: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface ImageScreeningAPIResponse {
  success: boolean;
  status: ImageScreeningStatus;
  screening?: ImageScreeningRecord;
  validationReport?: ImageValidationReport;
  error?: string;
  message: string;
  modelVersion: string;
  architecture: ImageModelArchitecture;
}
