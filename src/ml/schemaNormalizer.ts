import { DatasetRecord, DiagnosisSource, LabelQuality, SymptomSeverity } from './types';
import { Species } from '../types';
import { SYMPTOMS_LIST, DISEASES_DATABASE } from '../data/knowledgeBase';

/**
 * Mapping table of diverse disease names and codes to canonical disease IDs
 */
const DISEASE_ALIAS_MAP: Record<string, string> = {
  // FMD
  'dis_fmd': 'dis_fmd',
  'fmd': 'dis_fmd',
  'foot and mouth disease': 'dis_fmd',
  'foot-and-mouth disease': 'dis_fmd',
  'foot & mouth': 'dis_fmd',
  'khurha': 'dis_fmd',
  'munhkhur': 'dis_fmd',
  'khura rog': 'dis_fmd',
  'aphthous fever': 'dis_fmd',

  // LSD
  'dis_lsd': 'dis_lsd',
  'lsd': 'dis_lsd',
  'lumpy skin disease': 'dis_lsd',
  'lumpy skin': 'dis_lsd',
  'lumpy': 'dis_lsd',
  'nodular dermatitis': 'dis_lsd',

  // PPR
  'dis_ppr': 'dis_ppr',
  'ppr': 'dis_ppr',
  'peste des petits ruminants': 'dis_ppr',
  'goat plague': 'dis_ppr',
  'ovine rinderpest': 'dis_ppr',
  'kata': 'dis_ppr',

  // HS
  'dis_hs': 'dis_hs',
  'hs': 'dis_hs',
  'haemorrhagic septicaemia': 'dis_hs',
  'hemorrhagic septicemia': 'dis_hs',
  'galghotu': 'dis_hs',
  'shipping fever': 'dis_hs',

  // Anthrax
  'dis_anthrax': 'dis_anthrax',
  'anthrax': 'dis_anthrax',
  'splenic fever': 'dis_anthrax',
  'charbon': 'dis_anthrax',
  'gat rog': 'dis_anthrax',

  // BQ
  'dis_bq': 'dis_bq',
  'bq': 'dis_bq',
  'black quarter': 'dis_bq',
  'blackleg': 'dis_bq',
  'jaharbad': 'dis_bq',
  'quarter evil': 'dis_bq',

  // Brucellosis
  'dis_brucellosis': 'dis_brucellosis',
  'brucellosis': 'dis_brucellosis',
  'contagious abortion': 'dis_brucellosis',
  'bangers disease': 'dis_brucellosis',
  'malta fever': 'dis_brucellosis',

  // Mastitis
  'dis_mastitis': 'dis_mastitis',
  'mastitis': 'dis_mastitis',
  'clinical mastitis': 'dis_mastitis',
  'subclinical mastitis': 'dis_mastitis',
  'thanela': 'dis_mastitis',
  'mammitis': 'dis_mastitis',

  // ASF
  'dis_asf': 'dis_asf',
  'asf': 'dis_asf',
  'african swine fever': 'dis_asf',
  'swine fever': 'dis_asf',

  // Avian Flu
  'dis_avian_flu': 'dis_avian_flu',
  'avian flu': 'dis_avian_flu',
  'avian influenza': 'dis_avian_flu',
  'bird flu': 'dis_avian_flu',
  'h5n1': 'dis_avian_flu',
  'fowl plague': 'dis_avian_flu',

  // Healthy / Other
  'dis_other_healthy': 'dis_other_healthy',
  'other': 'dis_other_healthy',
  'healthy': 'dis_other_healthy',
  'none': 'dis_other_healthy',
  'non_infectious': 'dis_other_healthy',
  'non-infectious': 'dis_other_healthy',
  'unaffected': 'dis_other_healthy',
  'negative': 'dis_other_healthy'
};

/**
 * Mapping table of symptom aliases and free-text names to canonical symptom IDs
 */
const SYMPTOM_ALIAS_MAP: Record<string, string> = {
  // Fever
  'sym_fever': 'sym_fever',
  'fever': 'sym_fever',
  'high fever': 'sym_fever',
  'hyperthermia': 'sym_fever',
  'pyrexia': 'sym_fever',
  'high temperature': 'sym_fever',
  'high_fever': 'sym_fever',

  // Appetite loss / Lethargy
  'sym_appetite_loss': 'sym_appetite_loss',
  'appetite loss': 'sym_appetite_loss',
  'loss of appetite': 'sym_appetite_loss',
  'anorexia': 'sym_appetite_loss',
  'not eating': 'sym_appetite_loss',
  'reduced appetite': 'sym_appetite_loss',
  'sym_reduced_appetite': 'sym_appetite_loss',

  // Weakness
  'sym_weakness': 'sym_weakness',
  'weakness': 'sym_weakness',
  'lethargy': 'sym_weakness',
  'depression': 'sym_weakness',
  'dullness': 'sym_weakness',
  'sym_lethargy': 'sym_weakness',

  // Weight loss
  'sym_weight_loss': 'sym_weight_loss',
  'weight loss': 'sym_weight_loss',
  'emaciation': 'sym_weight_loss',

  // Reduced milk
  'sym_reduced_milk': 'sym_reduced_milk',
  'drop in milk': 'sym_reduced_milk',
  'reduced milk': 'sym_reduced_milk',
  'agalactia': 'sym_reduced_milk',
  'milk drop': 'sym_reduced_milk',
  'sym_drop_in_milk': 'sym_reduced_milk',
  'sym_drop_egg_production': 'sym_reduced_milk',

  // Salivation
  'sym_salivation': 'sym_salivation',
  'excessive salivation': 'sym_salivation',
  'drooling': 'sym_salivation',
  'frothing at mouth': 'sym_salivation',
  'frothy salivation': 'sym_salivation',
  'sym_excessive_salivation': 'sym_salivation',

  // Mouth lesions
  'sym_mouth_lesions': 'sym_mouth_lesions',
  'mouth blisters': 'sym_mouth_lesions',
  'oral ulcers': 'sym_mouth_lesions',
  'vesicles': 'sym_mouth_lesions',
  'mouth sores': 'sym_mouth_lesions',
  'oral blisters': 'sym_mouth_lesions',
  'sym_oral_blisters': 'sym_mouth_lesions',
  'sym_oral_ulcers': 'sym_mouth_lesions',

  // Foot lesions
  'sym_foot_lesions': 'sym_foot_lesions',
  'foot lesions': 'sym_foot_lesions',
  'hoof lesions': 'sym_foot_lesions',
  'interdigital ulcers': 'sym_foot_lesions',
  'hoof blisters': 'sym_foot_lesions',
  'foot sores': 'sym_foot_lesions',
  'sym_hoof_lesions': 'sym_foot_lesions',

  // Lameness
  'sym_lameness': 'sym_lameness',
  'lameness': 'sym_lameness',
  'limping': 'sym_lameness',
  'inability to walk': 'sym_lameness',

  // Skin nodules
  'sym_skin_nodules': 'sym_skin_nodules',
  'skin nodules': 'sym_skin_nodules',
  'lumps on skin': 'sym_skin_nodules',
  'nodules': 'sym_skin_nodules',
  'skin lumps': 'sym_skin_nodules',

  // Skin lesions
  'sym_skin_lesions': 'sym_skin_lesions',
  'skin lesions': 'sym_skin_lesions',
  'scabs': 'sym_skin_lesions',
  'crusting': 'sym_skin_lesions',
  'papules': 'sym_skin_lesions',

  // Edema / Swelling
  'sym_edema': 'sym_edema',
  'edema': 'sym_edema',
  'swelling': 'sym_edema',
  'throat swelling': 'sym_edema',
  'brisket edema': 'sym_edema',
  'dewlap edema': 'sym_edema',
  'facial swelling': 'sym_edema',
  'edema legs': 'sym_edema',
  'sym_throat_swelling': 'sym_edema',
  'sym_edema_legs': 'sym_edema',
  'sym_facial_swelling': 'sym_edema',
  'sym_rapid_bloat': 'sym_edema',

  // Cough & Respiratory
  'sym_cough': 'sym_cough',
  'cough': 'sym_cough',
  'coughing': 'sym_cough',
  'grunting': 'sym_cough',
  'pneumonia': 'sym_cough',
  'sym_pneumonia_cough': 'sym_cough',

  // Breathing difficulty
  'sym_breathing_diff': 'sym_breathing_diff',
  'breathing difficulty': 'sym_breathing_diff',
  'dyspnea': 'sym_breathing_diff',
  'labored breathing': 'sym_breathing_diff',
  'rapid breathing': 'sym_breathing_diff',
  'respiratory distress': 'sym_breathing_diff',
  'sym_respiratory_distress': 'sym_breathing_diff',

  // Nasal discharge
  'sym_nasal_discharge': 'sym_nasal_discharge',
  'nasal discharge': 'sym_nasal_discharge',
  'runny nose': 'sym_nasal_discharge',
  'mucus from nose': 'sym_nasal_discharge',

  // Eye discharge
  'sym_eye_discharge': 'sym_eye_discharge',
  'eye discharge': 'sym_eye_discharge',
  'lacrimation': 'sym_eye_discharge',
  'corneal opacity': 'sym_eye_discharge',
  'conjunctivitis': 'sym_eye_discharge',
  'sym_ocular_discharge': 'sym_eye_discharge',

  // Diarrhea
  'sym_diarrhea': 'sym_diarrhea',
  'diarrhea': 'sym_diarrhea',
  'scours': 'sym_diarrhea',
  'loose stool': 'sym_diarrhea',
  'severe diarrhea': 'sym_diarrhea',
  'sym_severe_diarrhea': 'sym_diarrhea',

  // Bloody diarrhea
  'sym_bloody_diarrhea': 'sym_bloody_diarrhea',
  'bloody diarrhea': 'sym_bloody_diarrhea',
  'hemorrhagic diarrhea': 'sym_bloody_diarrhea',
  'dysentery': 'sym_bloody_diarrhea',

  // Swollen lymph
  'sym_swollen_lymph': 'sym_swollen_lymph',
  'swollen lymph nodes': 'sym_swollen_lymph',
  'enlarged lymph nodes': 'sym_swollen_lymph',
  'lymphadenopathy': 'sym_swollen_lymph',
  'sym_enlarged_lymph_nodes': 'sym_swollen_lymph',

  // Abortion
  'sym_abortion': 'sym_abortion',
  'abortion': 'sym_abortion',
  'stillbirth': 'sym_abortion',
  'retained placenta': 'sym_abortion',
  'sym_abortion_third_trimester': 'sym_abortion',
  'sym_retained_placenta': 'sym_abortion',

  // Mastitis
  'sym_mastitis_signs': 'sym_mastitis_signs',
  'swollen udder': 'sym_mastitis_signs',
  'clotted milk': 'sym_mastitis_signs',
  'hard udder': 'sym_mastitis_signs',
  'udder heat': 'sym_mastitis_signs',
  'sym_udder_swelling': 'sym_mastitis_signs',
  'sym_abnormal_milk_clots': 'sym_mastitis_signs',
  'sym_udder_heat_pain': 'sym_mastitis_signs',

  // Sudden death
  'sym_sudden_death': 'sym_sudden_death',
  'sudden death': 'sym_sudden_death',
  'acute mortality': 'sym_sudden_death',
  'found dead': 'sym_sudden_death',

  // Bloody orifices
  'sym_bloody_orifices': 'sym_bloody_orifices',
  'dark blood orifices': 'sym_bloody_orifices',
  'bleeding from nose and anus': 'sym_bloody_orifices',
  'unclotted blood': 'sym_bloody_orifices',
  'sym_dark_blood_orifices': 'sym_bloody_orifices',

  // Muscle crepitus
  'sym_muscle_crepitus': 'sym_muscle_crepitus',
  'crepitant swelling': 'sym_muscle_crepitus',
  'crackling muscle': 'sym_muscle_crepitus',
  'gas swelling': 'sym_muscle_crepitus',
  'sym_crepitant_swelling': 'sym_muscle_crepitus',

  // Neurological
  'sym_neurological': 'sym_neurological',
  'neurological tremors': 'sym_neurological',
  'tremors': 'sym_neurological',
  'circling': 'sym_neurological',
  'seizures': 'sym_neurological',
  'paralysis': 'sym_neurological',
  'muscular tremors': 'sym_neurological',
  'sym_muscular_tremors': 'sym_neurological',

  // Comb cyanosis
  'sym_comb_cyanosis': 'sym_comb_cyanosis',
  'cyanotic comb': 'sym_comb_cyanosis',
  'blue comb': 'sym_comb_cyanosis',
  'wattle swelling': 'sym_comb_cyanosis',
  'sym_cyanosis_comb_wattle': 'sym_comb_cyanosis',
  'sym_skin_cyanosis_ears_belly': 'sym_cyanosis_tongue'
};

/**
 * Normalizes any species string or alias to valid Species enum
 */
export function normalizeSpecies(rawSpecies: any): Species {
  if (!rawSpecies || typeof rawSpecies !== 'string') return 'Other';
  const clean = rawSpecies.trim().toLowerCase();

  if (clean.includes('cattle') || clean.includes('cow') || clean.includes('bull') || clean.includes('calf') || clean.includes('bovine') || clean.includes('ox')) {
    return 'Cattle';
  }
  if (clean.includes('buffalo') || clean.includes('bison')) {
    return 'Buffalo';
  }
  if (clean.includes('goat') || clean.includes('caprine') || clean.includes('buck') || clean.includes('doe') || clean.includes('kid')) {
    return 'Goat';
  }
  if (clean.includes('sheep') || clean.includes('ovine') || clean.includes('ram') || clean.includes('ewe') || clean.includes('lamb')) {
    return 'Sheep';
  }
  if (clean.includes('pig') || clean.includes('swine') || clean.includes('hog') || clean.includes('porcine') || clean.includes('boar') || clean.includes('piglet')) {
    return 'Pig';
  }
  if (clean.includes('poultry') || clean.includes('chicken') || clean.includes('hen') || clean.includes('rooster') || clean.includes('duck') || clean.includes('turkey') || clean.includes('bird') || clean.includes('avian') || clean.includes('broiler') || clean.includes('layer')) {
    return 'Poultry';
  }
  if (clean.includes('horse') || clean.includes('equine') || clean.includes('mare') || clean.includes('stallion') || clean.includes('pony') || clean.includes('donkey') || clean.includes('mule')) {
    return 'Horse';
  }
  if (clean.includes('camel') || clean.includes('dromedary')) {
    return 'Camel';
  }

  return 'Other';
}

/**
 * Normalizes disease name or code to standardized disease ID
 */
export function normalizeDiseaseLabel(rawDisease: any): string {
  if (!rawDisease || typeof rawDisease !== 'string') return '';
  const clean = rawDisease.trim().toLowerCase();

  if (DISEASE_ALIAS_MAP[clean]) {
    return DISEASE_ALIAS_MAP[clean];
  }

  // Substring match in alias map
  for (const [alias, id] of Object.entries(DISEASE_ALIAS_MAP)) {
    if (clean.includes(alias) || alias.includes(clean)) {
      return id;
    }
  }

  // Match by known disease database names
  for (const d of DISEASES_DATABASE) {
    if (d.id.toLowerCase() === clean || d.name.toLowerCase() === clean || d.name.toLowerCase().includes(clean)) {
      return d.id;
    }
  }

  return rawDisease.trim();
}

/**
 * Normalizes symptom entries into { symptom_id, severity }[]
 */
export function normalizeSymptoms(rawSymptoms: any): { symptom_id: string; severity?: SymptomSeverity }[] {
  const result: { symptom_id: string; severity?: SymptomSeverity }[] = [];
  const seen = new Set<string>();

  const addSymptom = (rawSym: string, rawSev?: string) => {
    if (!rawSym || typeof rawSym !== 'string') return;
    const cleanSym = rawSym.trim().toLowerCase();
    const mappedId = SYMPTOM_ALIAS_MAP[cleanSym] || (cleanSym.startsWith('sym_') ? cleanSym : undefined);

    if (mappedId && !seen.has(mappedId)) {
      seen.add(mappedId);
      const sev: SymptomSeverity = rawSev === 'severe' || rawSev === 'high' ? 'severe' : rawSev === 'mild' || rawSev === 'low' ? 'mild' : 'moderate';
      result.push({ symptom_id: mappedId, severity: sev });
    }
  };

  if (Array.isArray(rawSymptoms)) {
    for (const item of rawSymptoms) {
      if (typeof item === 'string') {
        const parts = item.split(':');
        addSymptom(parts[0], parts[1]);
      } else if (item && typeof item === 'object') {
        const id = item.symptom_id || item.symptomId || item.id || item.name || item.symptom || '';
        const sev = item.severity || item.sev || 'moderate';
        addSymptom(id, sev);
      }
    }
  } else if (typeof rawSymptoms === 'string' && rawSymptoms.trim() !== '') {
    // Delimited string: comma, semicolon, newline, pipe
    const tokens = rawSymptoms.split(/[,;\r\n|]+/);
    for (const token of tokens) {
      const parts = token.trim().split(':');
      addSymptom(parts[0], parts[1]);
    }
  }

  return result;
}

/**
 * Maps diagnosis source to formal label quality tier
 */
export function deriveLabelQuality(source?: string): LabelQuality {
  if (!source) return 'VALIDATED';
  const clean = source.trim().toUpperCase();

  switch (clean) {
    case 'LAB_CONFIRMED':
    case 'RT_PCR':
    case 'ELISA':
    case 'GOLD_STANDARD':
      return 'GOLD_STANDARD';
    case 'VETERINARIAN_CONFIRMED':
    case 'PROTOTYPE_BENCHMARK':
    case 'BENCHMARK':
    case 'FIELD_SURVEILLANCE':
    case 'VALIDATED':
      return 'VALIDATED';
    case 'CLINICALLY_SUSPECTED':
    case 'PROVISIONAL':
    case 'FARMER_REPORT':
      return 'PROVISIONAL';
    case 'UNVERIFIED':
    default:
      return 'VALIDATED';
  }
}

/**
 * Universal Dataset Record Normalization Layer
 * Converts any arbitrary object/dataset row into a strictly valid DatasetRecord with safe defaults.
 */
export function normalizeDatasetRecord(raw: any, index: number = 0): DatasetRecord {
  if (!raw || typeof raw !== 'object') {
    return {
      record_id: `rec_invalid_${index}`,
      species: 'Other',
      symptoms: [],
      disease_label: '',
      diagnosis_source: 'PROTOTYPE_BENCHMARK',
      label_quality: 'VALIDATED'
    };
  }

  // 1. Resolve Target Disease Label (Search all aliases)
  const rawDisease =
    raw.disease_label ||
    raw.confirmed_disease ||
    raw.confirmedDisease ||
    raw.diseaseLabel ||
    raw['Disease Label'] ||
    raw.disease ||
    raw.Disease ||
    raw.target ||
    raw.Target ||
    raw.diagnosis ||
    raw.condition ||
    raw.disease_id ||
    raw.diseaseId ||
    '';
  const disease_label = normalizeDiseaseLabel(rawDisease);

  // 2. Resolve Symptoms
  const rawSymptoms =
    raw.symptoms ||
    raw.Symptoms ||
    raw.clinical_symptoms ||
    raw.clinicalSymptoms ||
    raw['Clinical Symptoms'] ||
    raw.symptom_list ||
    raw.signs ||
    raw.Signs ||
    raw.symptom ||
    [];
  const symptoms = normalizeSymptoms(rawSymptoms);

  // 3. Resolve Species
  const rawSpecies =
    raw.species ||
    raw.Species ||
    raw.animal_species ||
    raw.animalSpecies ||
    raw['Animal Species'] ||
    raw.host ||
    raw.Host ||
    raw.animal_type ||
    raw.type ||
    'Cattle';
  const species = normalizeSpecies(rawSpecies);

  // 4. Resolve Diagnosis Source & Label Quality
  const rawSource =
    raw.diagnosis_source ||
    raw.diagnosisSource ||
    raw.source_type ||
    raw.sourceType ||
    raw.source ||
    raw.Source ||
    'PROTOTYPE_BENCHMARK';
  const diagnosis_source: DiagnosisSource =
    typeof rawSource === 'string' ? (rawSource.toUpperCase() as any) : 'PROTOTYPE_BENCHMARK';
  const label_quality: LabelQuality = raw.label_quality || deriveLabelQuality(diagnosis_source);

  // 5. Numerical and Optional Fields with Safe Preprocessing & Defaults
  const age_years =
    raw.age_years !== undefined
      ? Number(raw.age_years)
      : raw.age !== undefined
      ? Number(raw.age)
      : raw.ageYears !== undefined
      ? Number(raw.ageYears)
      : undefined;

  let vaccination_status: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'UNKNOWN' = 'UNKNOWN';
  const rawVac = (raw.vaccination_status || raw.vaccinationStatus || raw.vaccination || raw.vaccinated || raw.vaccine_status || '').toString().toUpperCase();
  if (rawVac.includes('UP') || rawVac.includes('YES') || rawVac.includes('TRUE') || rawVac.includes('VACCINATED')) {
    vaccination_status = 'UP_TO_DATE';
  } else if (rawVac.includes('OVERDUE') || rawVac.includes('EXPIRED') || rawVac.includes('PARTIAL')) {
    vaccination_status = 'OVERDUE';
  } else if (rawVac.includes('UN') || rawVac.includes('NO') || rawVac.includes('FALSE') || rawVac.includes('NONE')) {
    vaccination_status = 'UNVACCINATED';
  }

  let season: 'MONSOON' | 'POST_MONSOON' | 'WINTER' | 'SUMMER' = 'MONSOON';
  const rawSea = (raw.season || '').toString().toUpperCase();
  if (rawSea.includes('WINTER')) season = 'WINTER';
  else if (rawSea.includes('SUMMER')) season = 'SUMMER';
  else if (rawSea.includes('POST')) season = 'POST_MONSOON';
  else if (rawSea.includes('MONSOON')) season = 'MONSOON';

  const affected_animals = Number(raw.affected_animals ?? raw.affected ?? raw.affectedCount ?? 1);
  const herd_size = Number(raw.total_animals ?? raw.total_herd ?? raw.herd_size ?? raw.herdSize ?? 10);
  const dead_count = Number(raw.mortality ?? raw.dead_count ?? raw.deadCount ?? raw.deaths ?? 0);
  const nearby_cases = Number(raw.nearby_cases ?? raw.nearby_cases_10km ?? raw.nearbyCases ?? 0);
  const distance_to_nearest_case_km = Number(raw.distance_to_nearest_case_km ?? raw.nearestCaseDistanceKm ?? 15);
  const temperature = Number(raw.temperature ?? raw.temperature_c ?? raw.temp ?? 28);
  const humidity = Number(raw.humidity ?? raw.humidity_pct ?? 65);
  const rainfall = Number(raw.rainfall ?? raw.rainfall_mm ?? 0);
  const symptom_duration_days = Number(raw.symptom_duration_days ?? raw.symptomDurationDays ?? raw.duration ?? 2);

  return {
    record_id: raw.record_id || raw.id || `rec_norm_${Date.now()}_${index}`,
    animal_id: raw.animal_id || raw.animalId || `anm_${index}`,
    farm_id: raw.farm_id || raw.farmId || `farm_${Math.floor(index / 4)}`,
    outbreak_id: raw.outbreak_id || raw.outbreakId,
    species,
    breed: raw.breed || raw.Breed,
    age_years: isNaN(age_years as any) ? undefined : age_years,
    sex: raw.sex ? (raw.sex.toString().toUpperCase() as any) : 'UNKNOWN',
    state: raw.state || raw.state_id || 'Maharashtra',
    district: raw.district || raw.district_id || 'Pune',
    subdistrict: raw.subdistrict || raw.block,
    village: raw.village,
    symptoms,
    symptom_duration_days: isNaN(symptom_duration_days) ? 2 : Math.max(1, symptom_duration_days),
    vaccination_status,
    last_vaccination_date: raw.last_vaccination_date || raw.vaccination_date,
    affected_animals: isNaN(affected_animals) ? 1 : Math.max(1, affected_animals),
    total_animals: isNaN(herd_size) ? 10 : Math.max(1, herd_size),
    herd_size: isNaN(herd_size) ? 10 : Math.max(1, herd_size),
    mortality: isNaN(dead_count) ? 0 : Math.max(0, dead_count),
    dead_count: isNaN(dead_count) ? 0 : Math.max(0, dead_count),
    nearby_cases: isNaN(nearby_cases) ? 0 : Math.max(0, nearby_cases),
    nearby_cases_10km: isNaN(nearby_cases) ? 0 : Math.max(0, nearby_cases),
    distance_to_nearest_case_km: isNaN(distance_to_nearest_case_km) ? 15 : Math.max(0.1, distance_to_nearest_case_km),
    temperature: isNaN(temperature) ? 28 : temperature,
    temperature_c: isNaN(temperature) ? 28 : temperature,
    humidity: isNaN(humidity) ? 65 : humidity,
    humidity_pct: isNaN(humidity) ? 65 : humidity,
    rainfall: isNaN(rainfall) ? 0 : rainfall,
    rainfall_mm: isNaN(rainfall) ? 0 : rainfall,
    season,
    disease_label,
    diagnosis_source,
    diagnosis_date: raw.diagnosis_date || raw.date || new Date().toISOString().split('T')[0],
    lab_test: raw.lab_test,
    lab_result: raw.lab_result ? (raw.lab_result.toString().toUpperCase() as any) : undefined,
    label_quality,
    data_source: raw.data_source || raw.source_organization || 'Normalized Clinical Stream',
    created_at: raw.created_at || raw.timestamp || new Date().toISOString()
  };
}
