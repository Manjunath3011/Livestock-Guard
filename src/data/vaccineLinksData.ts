import { Vaccine, DiseaseVaccineLink } from '../types';

export const ADDITIONAL_VACCINES: Vaccine[] = [
  {
    id: 'vac_csf_swine',
    name: 'Raksha-CSF Live Tissue Culture Swine Fever Vaccine',
    diseasePrevented: 'Classical Swine Fever',
    targetSpecies: ['Pig'],
    doseVolume: '1.0 ml',
    administrationRoute: 'Deep Intramuscular in neck behind ear',
    schedule: 'Piglets at 2-3 months of age, booster annually for breeding stock',
    boosterFrequencyMonths: 12,
    storageRequirement: '-20°C lyophilized, 2°C to 8°C reconstituted',
    manufacturer: 'Indian Immunologicals'
  },
  {
    id: 'vac_enterotoxemia_bacterin',
    name: 'Clostridial Polyvalent Bacterin-Toxoid (Enterotoxemia/Pulpy Kidney)',
    diseasePrevented: 'Enterotoxemia (Pulpy Kidney Disease)',
    targetSpecies: ['Sheep', 'Goat', 'Cattle'],
    doseVolume: '2.0 ml for sheep/goats, 5.0 ml for cattle',
    administrationRoute: 'Subcutaneous',
    schedule: 'Initial dose at 2 months, booster after 4 weeks, then annually before lush pasture growth',
    boosterFrequencyMonths: 12,
    storageRequirement: '2°C to 8°C',
    manufacturer: 'State Veterinary Biologicals / IVRI'
  },
  {
    id: 'vac_brdc_multivalent',
    name: 'Bovi-Shield Gold / BRDC Multivalent Respiratory Vaccine',
    diseasePrevented: 'Bovine Respiratory Disease (BRDC / Shipping Fever)',
    targetSpecies: ['Cattle', 'Buffalo'],
    doseVolume: '2.0 ml',
    administrationRoute: 'Subcutaneous or Intramuscular',
    schedule: 'Calves at weaning or 2-3 weeks prior to transit/feedlot entry',
    boosterFrequencyMonths: 12,
    storageRequirement: '2°C to 8°C',
    manufacturer: 'Zoetis / Intervet'
  },
  {
    id: 'vac_tetanus_toxoid',
    name: 'Purified Tetanus Toxoid (Veterinary)',
    diseasePrevented: 'Tetanus',
    targetSpecies: ['Horse', 'Cattle', 'Buffalo', 'Sheep', 'Goat', 'Pig', 'Other'],
    doseVolume: '1.0 ml for large animals, 0.5 ml for small ruminants',
    administrationRoute: 'Deep Intramuscular',
    schedule: 'Primary 2 doses 4 weeks apart, annual booster, post-deep puncture/wound prophylaxis',
    boosterFrequencyMonths: 12,
    storageRequirement: '2°C to 8°C',
    manufacturer: 'Serum Institute of India / IVRI'
  },
  {
    id: 'vac_goatpox_live',
    name: 'Goat Pox Live Attenuated Vaccine (Uttarkashi Strain)',
    diseasePrevented: 'Sheep & Goat Pox',
    targetSpecies: ['Goat', 'Sheep'],
    doseVolume: '0.5 ml',
    administrationRoute: 'Subcutaneous in caudal fold / inner thigh',
    schedule: 'Annual vaccination in young stock >3 months',
    boosterFrequencyMonths: 12,
    storageRequirement: '2°C to 8°C',
    manufacturer: 'IVRI / Hester Biosciences'
  }
];

export const DISEASE_VACCINE_LINKS: DiseaseVaccineLink[] = [
  {
    diseaseId: 'dis_fmd',
    vaccineId: 'vac_fmd_poly',
    vaccineName: 'Raksha-Ovac Polyvalent FMD Vaccine',
    species: ['Cattle', 'Buffalo', 'Sheep', 'Goat', 'Pig'],
    recommendedFor: 'Bi-annual routine national herd prophylaxis & ring vaccination',
    preventionRole: 'Stimulates circulating neutralizing antibodies against FMD viral serotypes O, A and Asia-1.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 4,
    doseInformationReference: '2.0 ml for large ruminants (deep IM/SC); 1.0 ml for sheep, goats and pigs.',
    scheduleReference: 'Primary dose at 4 months, second booster 3-4 weeks later, then repeat every 6 months.',
    boosterInformationReference: 'Every 6 months (prior to peak seasonal winter/spring transmission periods).',
    contraindicationsReference: [
      'Do not vaccinate clinically ill, severely febrile, or immunocompromised animals.',
      'Vaccine does NOT treat or cure already infected livestock.'
    ],
    pregnancyNotes: 'Safe for pregnant cows in 2nd and early 3rd trimester under gentle physical restraint.',
    outbreakNotes: 'During confirmed outbreaks, veterinary authorities implement ring vaccination (3-10 km radius) strictly in healthy perimeter herds. Clinically affected animals must NOT be vaccinated.',
    geographicNotes: 'Mandatory under National Animal Disease Control Programme (NADCP) in India & endemic Asian/African zones.',
    authorityReference: 'WOAH Terrestrial Manual & National NADCP Guidelines',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_lsd',
    vaccineId: 'vac_lsd_goatpox',
    vaccineName: 'Lumpi-ProVacInd / Heterologous Live Goat Pox (Uttarkashi Strain)',
    species: ['Cattle', 'Buffalo'],
    recommendedFor: 'Annual pre-monsoon vaccination in high vector-density and endemic zones',
    preventionRole: 'Provides robust cell-mediated and humoral cross-protection against Capripoxviruses.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 3,
    doseInformationReference: '3.0 ml Subcutaneous for cattle (heterologous goat pox) or 1.0 ml homologous.',
    scheduleReference: 'Single annual dose administered 4-6 weeks prior to monsoon vector breeding surges.',
    boosterInformationReference: 'Annual booster dose recommended.',
    contraindicationsReference: [
      'Do not vaccinate calves under 3 months unless high maternal antibody decay confirmed.',
      'Do not vaccinate animals currently exhibiting active skin nodules or high fever.'
    ],
    pregnancyNotes: 'Safe in advanced pregnancy, but minimize handling stress to prevent accidental abortion.',
    outbreakNotes: 'Emergency ring vaccination in healthy herds within 5 km perimeter of confirmed index cases.',
    geographicNotes: 'Widely deployed across South Asia, Middle East, and Southeast Europe.',
    authorityReference: 'ICAR-National Research Centre on Equines & Indian Veterinary Research Institute',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_hs',
    vaccineId: 'vac_hs_alum',
    vaccineName: 'Hemorrhagic Septicemia Alum Precipitated Vaccine',
    species: ['Buffalo', 'Cattle'],
    recommendedFor: 'Mandatory pre-monsoon annual vaccination in low-lying and flood-prone districts',
    preventionRole: 'Stimulates bactericidal antibodies against Pasteurella multocida serotype B:2 / E:2.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 6,
    doseInformationReference: '5.0 ml Subcutaneous in the lower lateral neck.',
    scheduleReference: 'Annual pre-monsoon vaccination in May-June.',
    boosterInformationReference: 'Annual booster required 3-4 weeks prior to onset of seasonal monsoon rains.',
    contraindicationsReference: [
      'Never administer to animals with active respiratory distress or fever.',
      'Does not provide immediate therapeutic protection to infected animals in acute phase.'
    ],
    pregnancyNotes: 'Safe in all gestation stages; take care with heavy pregnant buffaloes during restraining.',
    outbreakNotes: 'Ring vaccination of healthy herds in affected villages combined with antibiotic prophylaxis for exposed contacts.',
    geographicNotes: 'Endemic river basins and high humidity regions in South & Southeast Asia.',
    authorityReference: 'Department of Animal Husbandry and Dairying (DAHD) & FAO Animal Production Health',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_anthrax',
    vaccineId: 'vac_anthrax_sterne',
    vaccineName: 'Anthrax Spore Live Vaccine (Sterne Strain 34F2)',
    species: ['Cattle', 'Buffalo', 'Sheep', 'Goat', 'Horse'],
    recommendedFor: 'Strict prophylaxis in designated anthrax-endemic zones and historical burial sites',
    preventionRole: 'Induces protective immunity against protective antigen (PA) produced by Bacillus anthracis.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 6,
    doseInformationReference: '1.0 ml Subcutaneous for cattle/horses; 0.5 ml for sheep and goats.',
    scheduleReference: 'Annual administration in endemic villages 1 month prior to anticipated seasonal grazing risk.',
    boosterInformationReference: 'Annual booster strictly in enzootic regions.',
    contraindicationsReference: [
      'Do not administer antibiotics within 7 days before or after live spore vaccination.',
      'Never vaccinate animals showing clinical signs of acute illness.'
    ],
    pregnancyNotes: 'Avoid vaccination in the last month of gestation unless immediate outbreak exposure threat exists.',
    outbreakNotes: 'Administered to all non-affected livestock within 5-10 km radius of confirmed anthrax mortality under veterinary supervision.',
    geographicNotes: 'Enzootic alkaline soils, river floodplains, and pastoral grazing corridors globally.',
    authorityReference: 'WOAH Terrestrial Manual & WHO/FAO/OIE Anthrax in Humans and Animals Guidance',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_ppr',
    vaccineId: 'vac_ppr_sungri',
    vaccineName: 'PPR Sungri 96 Live Cell Culture Vaccine',
    species: ['Goat', 'Sheep'],
    recommendedFor: 'National small ruminant eradication programs and herd immunity maintenance',
    preventionRole: 'Confers lifelong or multi-year solid protective immunity against Morbillivirus.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 3,
    doseInformationReference: '1.0 ml Subcutaneous in inner thigh or lateral neck.',
    scheduleReference: 'Single dose in kids/lambs >3 months; booster once every 3 years.',
    boosterInformationReference: 'Once every 3 years for breeding stock.',
    contraindicationsReference: [
      'Do not vaccinate clinically sick animals with diarrhea or erosive stomatitis.',
      'Reconstituted vaccine must be used within 2 hours kept on ice.'
    ],
    pregnancyNotes: 'Safe in early and mid pregnancy; avoid stressful rough handling in late gestation.',
    outbreakNotes: 'Ring vaccination of healthy flocks in surrounding villages.',
    geographicNotes: 'PPR Global Eradication Programme (WOAH/FAO) priority in Africa, Middle East, and Asia.',
    authorityReference: 'FAO-WOAH Global Control and Eradication Strategy for PPR',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_bq',
    vaccineId: 'vac_bq',
    vaccineName: 'Blackleg (BQ) Inactivated Bacterin',
    species: ['Cattle', 'Buffalo', 'Sheep'],
    recommendedFor: 'Prophylaxis for young growing ruminants grazing on spore-contaminated pastures',
    preventionRole: 'Generates high neutralizing antitoxin titers against Clostridium chauvoei toxins.',
    routineOrOutbreak: 'ROUTINE',
    minimumAgeMonths: 6,
    doseInformationReference: '5.0 ml Subcutaneous for cattle; 2.0 ml for sheep.',
    scheduleReference: 'Primary at 6 months of age, booster 3-4 weeks later, then annual pre-monsoon booster up to 2-3 years old.',
    boosterInformationReference: 'Annual booster in high-risk pastures until 3 years of age.',
    contraindicationsReference: [
      'Do not vaccinate animals with existing gas gangrene or muscular crepitus.'
    ],
    pregnancyNotes: 'Safe for use in pregnant animals.',
    outbreakNotes: 'Immediate vaccination of all healthy young stock in the affected herd alongside antibiotic therapy for contacts.',
    geographicNotes: 'Endemic pastures disturbed by heavy rainfall or excavation.',
    authorityReference: 'Indian Veterinary Research Institute (IVRI)',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_brucella',
    vaccineId: 'vac_brucella_s19',
    vaccineName: 'Brucella abortus Strain 19 Live Vaccine',
    species: ['Cattle', 'Buffalo'],
    recommendedFor: 'Strictly female calfhood vaccination for lifetime herd brucellosis prevention',
    preventionRole: 'Stimulates long-term cell-mediated protection preventing abortion storms in adult cows.',
    routineOrOutbreak: 'ROUTINE',
    minimumAgeMonths: 4,
    doseInformationReference: '2.0 ml Subcutaneous in 4-8 month old female calves only.',
    scheduleReference: 'Strict single lifetime calfhood vaccination between 4 and 8 months of age.',
    boosterInformationReference: 'NEVER repeat in adult cattle (causes false-positive diagnostic titers and abortion).',
    contraindicationsReference: [
      'STRICTLY CONTRAINDICATED in adult cattle, pregnant cows, and male bulls.',
      'Zoonotic risk during administration: accidental human needle-stick requires immediate medical attention.'
    ],
    pregnancyNotes: 'CONTRAINDICATED in pregnant animals (causes abortion).',
    outbreakNotes: 'Not used as emergency outbreak vaccine in adult herds. Test and segregation applied instead.',
    geographicNotes: 'National dairy herd eradication programs.',
    authorityReference: 'WOAH Terrestrial Manual & National Brucella Control Programme',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_theileriosis',
    vaccineId: 'vac_theileria',
    vaccineName: 'Rakshavac-T Theileria Schizont Cell Culture Vaccine',
    species: ['Cattle'],
    recommendedFor: 'Crossbred dairy calves and exotic heifers introduced into tick-endemic tropical dairy herds',
    preventionRole: 'Induces cell-mediated cytotoxic immunity against Theileria annulata macroschizonts.',
    routineOrOutbreak: 'ROUTINE',
    minimumAgeMonths: 2,
    doseInformationReference: '3.0 ml Subcutaneous in the lateral neck.',
    scheduleReference: 'Single dose in calves >2 months old with prophylactic long-acting tetracycline cover.',
    boosterInformationReference: 'Single lifetime immunization; annual booster generally not required.',
    contraindicationsReference: [
      'Do not vaccinate calves under 2 months of age or severely debilitated stock.',
      'Must maintain liquid nitrogen cold chain (-196°C) until immediately prior to injection.'
    ],
    pregnancyNotes: 'Safe in early and mid pregnancy; avoid vaccinating heavily pregnant advanced cows.',
    outbreakNotes: 'Not suitable for hyperacute clinical cases; sick cows must receive Buparvaquone therapy.',
    geographicNotes: 'Hyalomma tick-infested regions across North/Central India and Mediterranean basin.',
    authorityReference: 'Indian Immunologicals Limited & ICAR-IVRI',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_rabies',
    vaccineId: 'vac_rabies_vet',
    vaccineName: 'Raksharab Inactivated Cell Culture Rabies Vaccine',
    species: ['Cattle', 'Buffalo', 'Horse', 'Sheep', 'Goat', 'Pig', 'Other'],
    recommendedFor: 'Post-exposure prophylaxis following rabid carnivore bite and pre-exposure in high wildlife zones',
    preventionRole: 'Stimulates high virus-neutralizing antibodies before neuro-invasive viral progression.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 3,
    doseInformationReference: '1.0 ml Intramuscular or Subcutaneous in large and small animals.',
    scheduleReference: 'Post-exposure protocol: Day 0, Day 3, Day 7, Day 14, and Day 28 post-bite.',
    boosterInformationReference: 'Annual booster for pre-exposure protection.',
    contraindicationsReference: [
      'None for post-exposure prophylaxis (rabies is 100% fatal without prompt vaccination).'
    ],
    pregnancyNotes: 'Safe and mandatory during pregnancy in bite wound cases.',
    outbreakNotes: 'Administer post-exposure vaccination immediately to all animals bitten or exposed to saliva.',
    geographicNotes: 'Global zoonotic priority.',
    authorityReference: 'WHO Expert Consultation on Rabies & WOAH Terrestrial Manual',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_csf',
    vaccineId: 'vac_csf_swine',
    vaccineName: 'Raksha-CSF Live Tissue Culture Swine Fever Vaccine',
    species: ['Pig'],
    recommendedFor: 'Routine piggery vaccination and containment in endemic swine districts',
    preventionRole: 'Protects pigs against high fever, splenic infarction and hemorrhagic mortality caused by Pestivirus.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 2,
    doseInformationReference: '1.0 ml Deep Intramuscular behind the ear.',
    scheduleReference: 'Primary at 2-3 months; annual booster for breeding sows and boars.',
    boosterInformationReference: 'Annual booster for breeding herd.',
    contraindicationsReference: [
      'Do not vaccinate clinically febrile or scouring pigs.'
    ],
    pregnancyNotes: 'Avoid vaccinating in the first 30 days of gestation.',
    outbreakNotes: 'Emergency ring vaccination of surrounding piggeries under strict movement quarantine.',
    geographicNotes: 'High-density pig rearing belts in Northeast India, East Asia, and Eastern Europe.',
    authorityReference: 'ICAR-National Research Centre on Pig & WOAH',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_enterotoxemia',
    vaccineId: 'vac_enterotoxemia_bacterin',
    vaccineName: 'Clostridial Polyvalent Bacterin-Toxoid',
    species: ['Sheep', 'Goat', 'Cattle'],
    recommendedFor: 'Small ruminants and feedlot livestock prior to lush forage or high concentrate feeding',
    preventionRole: 'Elicits neutralizing antitoxins against Clostridium perfringens epsilon toxin.',
    routineOrOutbreak: 'ROUTINE',
    minimumAgeMonths: 2,
    doseInformationReference: '2.0 ml SC for sheep/goats; 5.0 ml SC for cattle.',
    scheduleReference: 'Initial dose at 2 months, booster after 4 weeks, then annual pre-monsoon booster.',
    boosterInformationReference: 'Annual booster before monsoon or lush spring pasture turn-out.',
    contraindicationsReference: [
      'Do not vaccinate moribund or severely bloated animals.'
    ],
    pregnancyNotes: 'Vaccinate pregnant ewes/does 2-4 weeks before lambing to provide colostral immunity.',
    outbreakNotes: 'Vaccinate non-affected flock members; change diet gradually away from pure rich concentrates.',
    geographicNotes: 'Intensive pastoral sheep and goat grazing regions.',
    authorityReference: 'Central Sheep and Wool Research Institute (CSWRI) & IVRI',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_brdc',
    vaccineId: 'vac_brdc_multivalent',
    vaccineName: 'Bovi-Shield Gold / BRDC Multivalent Respiratory Vaccine',
    species: ['Cattle', 'Buffalo'],
    recommendedFor: 'Preconditioning of calves and feedlot cattle prior to transport or stress',
    preventionRole: 'Protects against bovine respiratory syncytial virus, IBR, PI3, BVDV and Mannheimia.',
    routineOrOutbreak: 'ROUTINE',
    minimumAgeMonths: 3,
    doseInformationReference: '2.0 ml Subcutaneous in lateral neck.',
    scheduleReference: 'Administered 2-3 weeks prior to weaning, transport, or seasonal cold weather.',
    boosterInformationReference: 'Annual booster in dairy replacement stock.',
    contraindicationsReference: [
      'Do not vaccinate animals already in acute respiratory crisis.'
    ],
    pregnancyNotes: 'Ensure vaccine formulation is certified safe for pregnant cows.',
    outbreakNotes: 'Isolate symptomatic cattle and vaccinate unaffected cohorts with supportive care.',
    geographicNotes: 'Dairy and beef cattle raising sectors worldwide.',
    authorityReference: 'American Association of Bovine Practitioners (AABP) & European Medicines Agency',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_tetanus',
    vaccineId: 'vac_tetanus_toxoid',
    vaccineName: 'Purified Tetanus Toxoid (Veterinary)',
    species: ['Horse', 'Cattle', 'Buffalo', 'Sheep', 'Goat', 'Pig', 'Other'],
    recommendedFor: 'Equines, castrated livestock, dehorned animals, and post-deep penetrating wounds',
    preventionRole: 'Neutralizes circulating tetanospasmin neurotoxin produced by Clostridium tetani.',
    routineOrOutbreak: 'ROUTINE',
    minimumAgeMonths: 2,
    doseInformationReference: '1.0 ml IM for large animals; 0.5 ml IM for sheep/goats.',
    scheduleReference: '2 doses 4 weeks apart, followed by annual booster or dose given at wound injury.',
    boosterInformationReference: 'Annual booster; give booster at time of deep surgical wound or puncture.',
    contraindicationsReference: [
      'Toxoid does not replace Tetanus Antitoxin (TAT) in an animal already exhibiting lockjaw.'
    ],
    pregnancyNotes: 'Safe and recommended in late pregnancy to impart maternal colostral antibodies.',
    outbreakNotes: 'Provide wound debridement and tetanus antitoxin (passive immunization) for acute injuries.',
    geographicNotes: 'Ubiquitous soil-borne anaerobic pathogen globally.',
    authorityReference: 'British Equine Veterinary Association & IVRI',
    lastUpdated: '2026-08-01'
  },
  {
    diseaseId: 'dis_goat_pox',
    vaccineId: 'vac_goatpox_live',
    vaccineName: 'Goat Pox Live Attenuated Vaccine (Uttarkashi Strain)',
    species: ['Goat', 'Sheep'],
    recommendedFor: 'Flock protection in endemic sheep and goat rearing regions',
    preventionRole: 'Confer robust cell-mediated immunity against Capri-poxvirus papular skin lesions.',
    routineOrOutbreak: 'BOTH',
    minimumAgeMonths: 3,
    doseInformationReference: '0.5 ml Subcutaneous in inner thigh.',
    scheduleReference: 'Annual vaccination in healthy sheep and goats >3 months of age.',
    boosterInformationReference: 'Annual booster before winter season.',
    contraindicationsReference: [
      'Do not vaccinate animals with generalized pock lesions.'
    ],
    pregnancyNotes: 'Avoid in late pregnancy.',
    outbreakNotes: 'Ring vaccination of healthy flocks in 5 km buffer perimeter.',
    geographicNotes: 'Endemic across Asia, North and Central Africa.',
    authorityReference: 'WOAH Terrestrial Manual & IVRI',
    lastUpdated: '2026-08-01'
  }
];
