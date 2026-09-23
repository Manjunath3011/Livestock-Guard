/**
 * CONTROLLED VOCABULARIES & SAFE MAPPING ENGINE
 *
 * Implements strict mapping tables for:
 * 1. Target 11 Disease Classes
 * 2. Unmapped Disease Tracking & Preservation
 * 3. Controlled Symptom Vocabulary with Confidence Scores & Sources
 * 4. Label Quality Hierarchy
 */

export interface DiseaseMappingEntry {
  canonical_id: string;
  canonical_name: string;
  scientific_name: string;
  synonyms: string[];
  mapping_source: string;
}

export interface SymptomMappingEntry {
  canonical_id: string;
  canonical_name: string;
  category: string;
  synonyms: string[];
  mapping_source: string;
  snomed_vet_ref?: string;
}

export interface DiseaseMappingResult {
  isMapped: boolean;
  canonicalId: string;
  canonicalName: string;
  originalLabel: string;
  mappingConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  mappingSource: string;
  unmappedReason?: string;
}

export interface SymptomMappingResult {
  isMapped: boolean;
  canonicalId: string;
  canonicalName: string;
  originalSymptom: string;
  mappingConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  mappingSource: string;
  unmappedReason?: string;
}

/**
 * 11 CANONICAL TARGET DISEASE CLASSES
 */
export const TARGET_11_DISEASE_CLASSES = [
  'dis_fmd',
  'dis_lsd',
  'dis_ppr',
  'dis_hs',
  'dis_anthrax',
  'dis_bq',
  'dis_brucellosis',
  'dis_mastitis',
  'dis_asf',
  'dis_avian_flu',
  'dis_other_healthy'
] as const;

export type TargetDiseaseClass = typeof TARGET_11_DISEASE_CLASSES[number];

/**
 * Authoritative Disease Vocabulary Table
 */
export const CONTROLLED_DISEASE_CATALOG: Record<TargetDiseaseClass, DiseaseMappingEntry> = {
  dis_fmd: {
    canonical_id: 'dis_fmd',
    canonical_name: 'Foot-and-Mouth Disease',
    scientific_name: 'Aphthovirus / Picornaviridae',
    synonyms: [
      'fmd', 'foot and mouth', 'foot-and-mouth', 'foot and mouth disease',
      'foot-and-mouth disease', 'khurha', 'munhkhur', 'khura rog',
      'aphthous fever', 'aphtous fever', 'fmdv', 'epizootic aphtha'
    ],
    mapping_source: 'WOAH Terrestrial Manual / ICAR-IVRI Standard'
  },
  dis_lsd: {
    canonical_id: 'dis_lsd',
    canonical_name: 'Lumpy Skin Disease',
    scientific_name: 'Capripoxvirus / Poxviridae',
    synonyms: [
      'lsd', 'lumpy skin', 'lumpy-skin', 'lumpy skin disease',
      'lumpy skin disease virus', 'lsdv', 'nodular dermatitis',
      'pseudo-urticaria of cattle', 'knopvelsiekte'
    ],
    mapping_source: 'WOAH Terrestrial Manual / FAO EMPRES-AH'
  },
  dis_ppr: {
    canonical_id: 'dis_ppr',
    canonical_name: 'Peste des Petits Ruminants',
    scientific_name: 'Morbillivirus caprinae / Paramyxoviridae',
    synonyms: [
      'ppr', 'peste des petits ruminants', 'pest des petits ruminants',
      'goat plague', 'ovine rinderpest', 'kata', 'stomatitis pneumoenteritis',
      'pseudo-rinderpest of small ruminants'
    ],
    mapping_source: 'WOAH/FAO Global PPR Eradication Strategy'
  },
  dis_hs: {
    canonical_id: 'dis_hs',
    canonical_name: 'Haemorrhagic Septicaemia',
    scientific_name: 'Pasteurella multocida (Serotypes B:2 / E:2)',
    synonyms: [
      'hs', 'haemorrhagic septicaemia', 'hemorrhagic septicemia',
      'pasteurellosis', 'shipping fever', 'galghotu', 'barbone',
      'gillar rog', 'acute pasteurellosis'
    ],
    mapping_source: 'ICAR-NIVEDI Epidemiology Standards'
  },
  dis_anthrax: {
    canonical_id: 'dis_anthrax',
    canonical_name: 'Anthrax',
    scientific_name: 'Bacillus anthracis',
    synonyms: [
      'anthrax', 'splenic fever', 'charbon', 'gat rog', 'milzbrand',
      'malignant pustule', 'woolsorter disease', 'b. anthracis'
    ],
    mapping_source: 'WOAH Terrestrial Manual / WHO Zoonoses Guidelines'
  },
  dis_bq: {
    canonical_id: 'dis_bq',
    canonical_name: 'Black Quarter',
    scientific_name: 'Clostridium chauvoei',
    synonyms: [
      'bq', 'black quarter', 'blackleg', 'black leg', 'quarter evil',
      'quarter ill', 'jaharbad', 'clostridial myositis', 'c. chauvoei'
    ],
    mapping_source: 'ICAR-IVRI Veterinary Microbiology Standards'
  },
  dis_brucellosis: {
    canonical_id: 'dis_brucellosis',
    canonical_name: 'Brucellosis',
    scientific_name: 'Brucella abortus / melitensis / suis',
    synonyms: [
      'brucellosis', 'contagious abortion', 'bangers disease', 'banger disease',
      'malta fever', 'undulant fever', 'epizootic abortion', 'brucella'
    ],
    mapping_source: 'WOAH Terrestrial Manual / National Brucellosis Control Program'
  },
  dis_mastitis: {
    canonical_id: 'dis_mastitis',
    canonical_name: 'Clinical Mastitis',
    scientific_name: 'Staphylococcus aureus / Streptococcus uberis / E. coli',
    synonyms: [
      'mastitis', 'clinical mastitis', 'subclinical mastitis', 'thanela',
      'mammitis', 'garget', 'udder inflammation', 'bovine mastitis'
    ],
    mapping_source: 'International Dairy Federation (IDF) Guidelines'
  },
  dis_asf: {
    canonical_id: 'dis_asf',
    canonical_name: 'African Swine Fever',
    scientific_name: 'Asfarviridae / Asfivirus',
    synonyms: [
      'asf', 'african swine fever', 'swine fever', 'asfv',
      'pestis africana suum', 'african pig disease'
    ],
    mapping_source: 'WOAH Terrestrial Manual / FAO ASF Manual'
  },
  dis_avian_flu: {
    canonical_id: 'dis_avian_flu',
    canonical_name: 'Avian Influenza',
    scientific_name: 'Influenza A virus (H5N1 / H5N8 / H7N9)',
    synonyms: [
      'avian flu', 'avian influenza', 'bird flu', 'h5n1', 'h5n8',
      'h7n9', 'highly pathogenic avian influenza', 'hpai', 'fowl plague'
    ],
    mapping_source: 'WOAH Terrestrial Manual / WHO Global Influenza Surveillance'
  },
  dis_other_healthy: {
    canonical_id: 'dis_other_healthy',
    canonical_name: 'Other / Non-Infectious / Healthy',
    scientific_name: 'Non-specific etiology / Physiological normal',
    synonyms: [
      'healthy', 'other', 'none', 'normal', 'control', 'unaffected',
      'negative', 'non-infectious', 'non_infectious', 'non infectious',
      'benign', 'under observation', 'general malaise', 'uninfected'
    ],
    mapping_source: 'Clinical Surveillance Baseline Control'
  }
};

/**
 * Authoritative Symptom Vocabulary Catalog with Synonyms & Sources
 */
export const CONTROLLED_SYMPTOMS_CATALOG: SymptomMappingEntry[] = [
  {
    canonical_id: 'sym_fever',
    canonical_name: 'High Fever / Hyperthermia',
    category: 'GENERAL',
    synonyms: ['fever', 'high fever', 'hyperthermia', 'pyrexia', 'elevated temperature', 'high temperature', 'febrile', 'hot body'],
    mapping_source: 'ICAR-IVRI / WOAH',
    snomed_vet_ref: '386661006'
  },
  {
    canonical_id: 'sym_appetite_loss',
    canonical_name: 'Loss of Appetite (Anorexia)',
    category: 'GENERAL',
    synonyms: ['loss of appetite', 'anorexia', 'inappetence', 'refusal to eat', 'off feed', 'not eating', 'reduced feed intake'],
    mapping_source: 'ICAR-IVRI / WOAH',
    snomed_vet_ref: '249477003'
  },
  {
    canonical_id: 'sym_weakness',
    canonical_name: 'Weakness & Lethargy',
    category: 'GENERAL',
    synonyms: ['weakness', 'lethargy', 'depression', 'dullness', 'listless', 'recumbent', 'reluctance to stand', 'drooping ears'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '13791008'
  },
  {
    canonical_id: 'sym_weight_loss',
    canonical_name: 'Rapid Weight Loss / Emaciation',
    category: 'GENERAL',
    synonyms: ['weight loss', 'emaciation', 'cachexia', 'wasting', 'thinning', 'loss of body condition'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '89362005'
  },
  {
    canonical_id: 'sym_reduced_milk',
    canonical_name: 'Sudden Drop in Milk Yield',
    category: 'GENERAL',
    synonyms: ['drop in milk', 'reduced milk yield', 'milk drop', 'agalactia', 'hypogalactia', 'sudden milk decrease', 'drop egg production'],
    mapping_source: 'IDF / ICAR',
    snomed_vet_ref: '289146002'
  },
  {
    canonical_id: 'sym_salivation',
    canonical_name: 'Excessive Drooling / Frothy Salivation',
    category: 'ORAL_FOOT',
    synonyms: ['excessive salivation', 'drooling', 'ptyalism', 'frothing', 'frothy salivation', 'lip smacking', 'ropy saliva', 'saliva hanging'],
    mapping_source: 'WOAH FMD Guidelines',
    snomed_vet_ref: '386560003'
  },
  {
    canonical_id: 'sym_mouth_lesions',
    canonical_name: 'Mouth Blisters, Ulcers & Vesicles',
    category: 'ORAL_FOOT',
    synonyms: ['mouth blisters', 'oral ulcers', 'vesicles', 'mouth sores', 'stomatitis', 'tongue erosions', 'oral vesicles', 'dental pad sores'],
    mapping_source: 'WOAH FMD Guidelines',
    snomed_vet_ref: '247441003'
  },
  {
    canonical_id: 'sym_foot_lesions',
    canonical_name: 'Foot / Hoof Lesions & Interdigital Ulcers',
    category: 'ORAL_FOOT',
    synonyms: ['foot lesions', 'hoof lesions', 'interdigital ulcers', 'coronary band blisters', 'pododermatitis', 'foot blisters', 'hoof sores'],
    mapping_source: 'WOAH FMD Guidelines',
    snomed_vet_ref: '298716008'
  },
  {
    canonical_id: 'sym_lameness',
    canonical_name: 'Severe Lameness & Shifting Weight',
    category: 'ORAL_FOOT',
    synonyms: ['lameness', 'limping', 'weight shifting', 'inability to walk', 'claudication', 'kicking legs', 'unwillingness to rise'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '22253000'
  },
  {
    canonical_id: 'sym_skin_nodules',
    canonical_name: 'Firm Circular Skin Nodules / Lumps',
    category: 'SKIN',
    synonyms: ['skin nodules', 'lumps on skin', 'nodules', 'circular lumps', 'circumscribed skin nodules', 'hard nodules', 'nodular lesions'],
    mapping_source: 'WOAH LSD Guidelines',
    snomed_vet_ref: '271759003'
  },
  {
    canonical_id: 'sym_skin_lesions',
    canonical_name: 'Skin Crusting, Scabs & Papules',
    category: 'SKIN',
    synonyms: ['skin crusting', 'scabs', 'papules', 'pustules', 'dermatitis', 'crusty lesions', 'epidermal sores'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '271767006'
  },
  {
    canonical_id: 'sym_edema',
    canonical_name: 'Edematous Swelling (Throat/Brisket/Dewlap)',
    category: 'GENERAL',
    synonyms: ['edema', 'swelling', 'throat swelling', 'brisket edema', 'dewlap edema', 'submandibular edema', 'bottle jaw', 'doughy swelling'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '267038008'
  },
  {
    canonical_id: 'sym_cough',
    canonical_name: 'Persistent Coughing & Grunting',
    category: 'RESPIRATORY',
    synonyms: ['cough', 'coughing', 'grunting', 'hacking cough', 'moist cough', 'pneumonic cough', 'bronchitis'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '49727002'
  },
  {
    canonical_id: 'sym_breathing_diff',
    canonical_name: 'Labored / Rapid Breathing (Dyspnea)',
    category: 'RESPIRATORY',
    synonyms: ['dyspnea', 'labored breathing', 'rapid breathing', 'tachypnea', 'open mouth breathing', 'respiratory distress', 'flared nostrils'],
    mapping_source: 'WOAH Terrestrial Manual',
    snomed_vet_ref: '267036007'
  },
  {
    canonical_id: 'sym_nasal_discharge',
    canonical_name: 'Mucopurulent / Bloody Nasal Discharge',
    category: 'RESPIRATORY',
    synonyms: ['nasal discharge', 'runny nose', 'mucopurulent discharge', 'bloody nasal discharge', 'rhinitis', 'snout discharge'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '64531003'
  },
  {
    canonical_id: 'sym_eye_discharge',
    canonical_name: 'Eye Discharge & Corneal Opacity / Conjunctivitis',
    category: 'RESPIRATORY',
    synonyms: ['eye discharge', 'lacrimation', 'conjunctivitis', 'corneal opacity', 'cloudy eye', 'ocular discharge', 'crusty eyelids'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '271777002'
  },
  {
    canonical_id: 'sym_diarrhea',
    canonical_name: 'Severe Watery Diarrhea / Scours',
    category: 'DIGESTIVE',
    synonyms: ['diarrhea', 'watery diarrhea', 'scours', 'loose feces', 'enteritis', 'profuse diarrhea', 'watery stool'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '62315008'
  },
  {
    canonical_id: 'sym_bloody_diarrhea',
    canonical_name: 'Hemorrhagic / Dark Bloody Diarrhea',
    category: 'DIGESTIVE',
    synonyms: ['bloody diarrhea', 'hemorrhagic enteritis', 'dysentery', 'melena', 'tarry stool', 'blood in feces'],
    mapping_source: 'WOAH / ICAR',
    snomed_vet_ref: '95545007'
  },
  {
    canonical_id: 'sym_vomiting',
    canonical_name: 'Regurgitation / Vomiting',
    category: 'DIGESTIVE',
    synonyms: ['vomiting', 'emesis', 'regurgitation', 'ruminal reflux'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '422400008'
  },
  {
    canonical_id: 'sym_swollen_lymph',
    canonical_name: 'Enlarged Swollen Lymph Nodes',
    category: 'GENERAL',
    synonyms: ['swollen lymph nodes', 'enlarged lymph nodes', 'lymphadenopathy', 'prescapular swelling', 'precrural swelling'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '30746008'
  },
  {
    canonical_id: 'sym_abortion',
    canonical_name: 'Abortion in Late Pregnancy / Stillbirth',
    category: 'REPRODUCTIVE',
    synonyms: ['abortion', 'stillbirth', 'late pregnancy abortion', 'retained placenta', 'premature calf expulsion', 'fetal loss'],
    mapping_source: 'WOAH Brucellosis Guidelines',
    snomed_vet_ref: '10743008'
  },
  {
    canonical_id: 'sym_mastitis_signs',
    canonical_name: 'Swollen, Hot, Hard Udder & Clotted Milk',
    category: 'GENERAL',
    synonyms: ['swollen udder', 'hard udder', 'clotted milk', 'flakes in milk', 'udder heat', 'inflamed quarters', 'mastitis signs'],
    mapping_source: 'IDF Guidelines',
    snomed_vet_ref: '81706006'
  },
  {
    canonical_id: 'sym_sudden_death',
    canonical_name: 'Sudden Acute Death (Peracute)',
    category: 'MORTALITY',
    synonyms: ['sudden death', 'peracute death', 'acute mortality', 'found dead', 'rapid death without prior signs'],
    mapping_source: 'WOAH Anthrax Guidelines',
    snomed_vet_ref: '399344008'
  },
  {
    canonical_id: 'sym_bloody_orifices',
    canonical_name: 'Dark Tar-like Blood from Natural Orifices',
    category: 'MORTALITY',
    synonyms: ['bloody orifices', 'dark non-clotting blood', 'blood from anus and nostrils', 'tarry blood discharge'],
    mapping_source: 'WOAH Anthrax Guidelines',
    snomed_vet_ref: '271810008'
  },
  {
    canonical_id: 'sym_muscle_crepitus',
    canonical_name: 'Crackling / Gas Swelling in Large Muscles',
    category: 'ORAL_FOOT',
    synonyms: ['muscle crepitus', 'crackling muscle', 'crepitant swelling', 'gas gangrene', 'emphysematous swelling', 'spongy swelling'],
    mapping_source: 'ICAR-IVRI BQ Guidelines',
    snomed_vet_ref: '298715007'
  },
  {
    canonical_id: 'sym_neurological',
    canonical_name: 'Neurological Tremors, Circling, Aggression, Paralysis',
    category: 'NEUROLOGICAL',
    synonyms: ['neurological signs', 'tremors', 'circling', 'ataxia', 'seizures', 'head pressing', 'paralysis', 'star gazing'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '271795006'
  },
  {
    canonical_id: 'sym_anemia_pale',
    canonical_name: 'Severe Pale / Jaundiced Mucous Membranes',
    category: 'GENERAL',
    synonyms: ['pale mucous membranes', 'anemia', 'jaundice', 'icterus', 'red water', 'pale gums', 'pale conjunctiva'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '271782001'
  },
  {
    canonical_id: 'sym_cyanosis_tongue',
    canonical_name: 'Cyanotic (Blue) Swollen Tongue & Lips',
    category: 'ORAL_FOOT',
    synonyms: ['blue tongue', 'cyanotic tongue', 'swollen blue lips', 'cyanosis of head', 'purple mucous membranes'],
    mapping_source: 'WOAH Guidelines',
    snomed_vet_ref: '119419001'
  },
  {
    canonical_id: 'sym_trismus_lockjaw',
    canonical_name: 'Stiffness, Lockjaw & Sawhorse Stance',
    category: 'NEUROLOGICAL',
    synonyms: ['lockjaw', 'trismus', 'sawhorse stance', 'rigid muscular spasms', 'stiff gait'],
    mapping_source: 'ICAR-IVRI',
    snomed_vet_ref: '81141003'
  },
  {
    canonical_id: 'sym_comb_cyanosis',
    canonical_name: 'Cyanotic Comb & Wattle / Swollen Head (Poultry)',
    category: 'RESPIRATORY',
    synonyms: ['cyanotic comb', 'purple comb', 'swollen wattle', 'swollen head poultry', 'blue comb'],
    mapping_source: 'WOAH Avian Guidelines',
    snomed_vet_ref: '298714006'
  }
];

/**
 * Safely maps a raw disease label to one of the 11 target classes.
 * PRESERVES original label and marks unmapped if cannot be mapped safely!
 */
export function mapDiseaseLabelSafely(rawLabel: any): DiseaseMappingResult {
  if (!rawLabel || typeof rawLabel !== 'string' || rawLabel.trim() === '') {
    return {
      isMapped: false,
      canonicalId: '',
      canonicalName: '',
      originalLabel: String(rawLabel || ''),
      mappingConfidence: 'UNKNOWN',
      mappingSource: 'Unspecified',
      unmappedReason: 'Missing or empty disease label'
    };
  }

  const clean = rawLabel.trim().toLowerCase();

  // 1. Direct ID match
  if (CONTROLLED_DISEASE_CATALOG[clean as TargetDiseaseClass]) {
    const entry = CONTROLLED_DISEASE_CATALOG[clean as TargetDiseaseClass];
    return {
      isMapped: true,
      canonicalId: entry.canonical_id,
      canonicalName: entry.canonical_name,
      originalLabel: rawLabel.trim(),
      mappingConfidence: 'HIGH',
      mappingSource: entry.mapping_source
    };
  }

  // 2. Exact Synonym match
  for (const [canonicalId, entry] of Object.entries(CONTROLLED_DISEASE_CATALOG)) {
    if (entry.synonyms.includes(clean)) {
      return {
        isMapped: true,
        canonicalId: entry.canonical_id,
        canonicalName: entry.canonical_name,
        originalLabel: rawLabel.trim(),
        mappingConfidence: 'HIGH',
        mappingSource: entry.mapping_source
      };
    }
  }

  // 3. Substring / Token matching
  for (const [canonicalId, entry] of Object.entries(CONTROLLED_DISEASE_CATALOG)) {
    for (const syn of entry.synonyms) {
      if (clean.includes(syn) || syn.includes(clean)) {
        return {
          isMapped: true,
          canonicalId: entry.canonical_id,
          canonicalName: entry.canonical_name,
          originalLabel: rawLabel.trim(),
          mappingConfidence: 'MEDIUM',
          mappingSource: `${entry.mapping_source} (Substring match)`
        };
      }
    }
  }

  // UNMAPPED: Preserve original label, do NOT invent or force a wrong label!
  return {
    isMapped: false,
    canonicalId: '',
    canonicalName: '',
    originalLabel: rawLabel.trim(),
    mappingConfidence: 'UNKNOWN',
    mappingSource: 'Unmapped',
    unmappedReason: `Disease label '${rawLabel.trim()}' does not map to any of the 11 target classes. Preserved as unmapped.`
  };
}

/**
 * Safely maps a raw symptom token to one of the canonical symptoms.
 */
export function mapSymptomSafely(rawSymptom: string): SymptomMappingResult {
  if (!rawSymptom || typeof rawSymptom !== 'string' || rawSymptom.trim() === '') {
    return {
      isMapped: false,
      canonicalId: '',
      canonicalName: '',
      originalSymptom: String(rawSymptom || ''),
      mappingConfidence: 'UNKNOWN',
      mappingSource: 'Unspecified',
      unmappedReason: 'Empty symptom token'
    };
  }

  const clean = rawSymptom.trim().toLowerCase();

  // 1. Direct ID match
  const directMatch = CONTROLLED_SYMPTOMS_CATALOG.find(s => s.canonical_id === clean);
  if (directMatch) {
    return {
      isMapped: true,
      canonicalId: directMatch.canonical_id,
      canonicalName: directMatch.canonical_name,
      originalSymptom: rawSymptom.trim(),
      mappingConfidence: 'HIGH',
      mappingSource: directMatch.mapping_source
    };
  }

  // 2. Exact synonym match
  const synMatch = CONTROLLED_SYMPTOMS_CATALOG.find(s => s.synonyms.includes(clean));
  if (synMatch) {
    return {
      isMapped: true,
      canonicalId: synMatch.canonical_id,
      canonicalName: synMatch.canonical_name,
      originalSymptom: rawSymptom.trim(),
      mappingConfidence: 'HIGH',
      mappingSource: synMatch.mapping_source
    };
  }

  // 3. Substring match
  for (const s of CONTROLLED_SYMPTOMS_CATALOG) {
    for (const syn of s.synonyms) {
      if (clean.includes(syn) || syn.includes(clean)) {
        return {
          isMapped: true,
          canonicalId: s.canonical_id,
          canonicalName: s.canonical_name,
          originalSymptom: rawSymptom.trim(),
          mappingConfidence: 'MEDIUM',
          mappingSource: `${s.mapping_source} (Substring match)`
        };
      }
    }
  }

  // Unknown symptom
  return {
    isMapped: false,
    canonicalId: '',
    canonicalName: '',
    originalSymptom: rawSymptom.trim(),
    mappingConfidence: 'UNKNOWN',
    mappingSource: 'Unknown',
    unmappedReason: `Symptom '${rawSymptom.trim()}' is unmapped in controlled symptom catalog.`
  };
}
