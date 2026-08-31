# LivestockGuard ML Disease Screening — Training Data Schema

**Schema Version:** `livestock-features-v1`  
**Model Version:** `livestock-disease-v1`  
**Target Application:** LivestockGuard Multi-Class Disease Screening & Early Warning Pipeline  
**Classification Type:** Multi-Class Supervised Tabular Classification  
**Status:** PROTOTYPE SPECIFICATION (Awaiting Validated Clinical & Laboratory Records)

---

## 1. Overview & Purpose
This schema specifies the standardized data fields, types, allowed categorical vocabularies, numerical boundaries, and quality constraints required for training and evaluating machine learning disease screening models in LivestockGuard.

> **CRITICAL CLINICAL & REGULATORY NOTICE**  
> ML models trained on this schema perform **statistical disease screening and risk likelihood estimation only**.  
> They do NOT constitute clinical diagnosis, laboratory confirmation, or statutory certification.

---

## 2. Target Label (`disease_label`)

| Field Name | Type | Description | Allowed Values |
| :--- | :--- | :--- | :--- |
| `disease_label` | `string` | Primary ground-truth disease class. Only classes with validated laboratory/veterinary records may be used in production. | `dis_fmd` (Foot & Mouth Disease)<br>`dis_lsd` (Lumpy Skin Disease)<br>`dis_ppr` (Peste des Petits Ruminants)<br>`dis_hs` (Haemorrhagic Septicaemia)<br>`dis_anthrax` (Anthrax)<br>`dis_bq` (Black Quarter)<br>`dis_brucellosis` (Brucellosis)<br>`dis_mastitis` (Clinical Mastitis)<br>`dis_asf` (African Swine Fever)<br>`dis_avian_flu` (Avian Influenza)<br>`dis_other_healthy` (Other / Non-Infectious / Healthy) |

### Diagnosis Source Hierarchy (`diagnosis_source`)
To prevent label noise and model degradation, training records must specify the provenance of the label:
1. `laboratory_confirmed` (Gold standard — RT-PCR, ELISA, Bacterial Culture, Blood Smear)
2. `veterinarian_confirmed` (Clinical diagnosis by a registered veterinary officer after physical examination)
3. `clinical_suspected` (Field worker/farmer triage observation — restricted to validation/benchmark datasets)
4. `other` (Not eligible for production model retraining)

---

## 3. Feature Fields Specification

### A. Animal Demographic Features
| Field Name | Type | Units / Format | Allowed Values / Range | Missing Handling |
| :--- | :--- | :--- | :--- | :--- |
| `species` | Categorical | String | `Cattle`, `Buffalo`, `Goat`, `Sheep`, `Pig`, `Poultry`, `Horse`, `Camel`, `Other` | Mandatory (Cannot be null) |
| `breed` | Categorical | String | Valid indigenous/exotic breed or `INDIGENOUS_DESI`, `CROSSBRED`, `EXOTIC`, `UNKNOWN` | Impute `UNKNOWN` |
| `age_years` | Numerical | Years | `0.1` to `25.0` | Impute median by species |
| `sex` | Categorical | String | `FEMALE`, `MALE`, `UNKNOWN` | Impute `UNKNOWN` |
| `herd_size` | Numerical | Count | `1` to `5000` | Impute `1` |

### B. Clinical Symptoms & Severity Features
| Field Name | Type | Encoding | Allowed Values / Scale | Missing Handling |
| :--- | :--- | :--- | :--- | :--- |
| `symptoms` | List of Objects | Multi-hot + Severity | Array of `{ symptom_id: string, severity: 'mild' \| 'moderate' \| 'severe' }` | Empty list (`[]`) = no signs |
| `symptom_duration_days` | Numerical | Days | `1` to `90` | Impute `2` days |
| `primary_symptom_system` | Categorical | String | `GENERAL`, `ORAL_DIGESTIVE`, `RESPIRATORY`, `DERMATOLOGICAL`, `REPRODUCTIVE`, `LOCOMOTOR`, `NERVOUS` | Derived from symptoms |

#### Standard Symptom Vocabulary
- `sym_fever`: High Fever / Hyperthermia (> 103°F / 39.5°C)
- `sym_oral_blisters`: Oral Vesicles / Blisters on Tongue and Gums
- `sym_excessive_salivation`: Excessive Stringy Drooling / Frothing
- `sym_hoof_lesions`: Interdigital Vesicles / Hoof Cleft Lesions
- `sym_lameness`: Reluctance to Walk / Severe Lameness
- `sym_drop_in_milk`: Sudden Severe Milk Drop
- `sym_skin_nodules`: Circumscribed Cutaneous Nodules (2-5cm)
- `sym_edema_legs`: Ventral & Limb Subcutaneous Edema
- `sym_enlarged_lymph_nodes`: Prescapular / Precrural Lymphadenopathy
- `sym_oral_ulcers`: Erosive Stomatitis / Mouth Necrosis
- `sym_severe_diarrhea`: Profuse Watery / Mucoid Diarrhea
- `sym_nasal_discharge`: Mucopurulent Nasal Discharge
- `sym_pneumonia_cough`: Moist / Painful Productive Cough
- `sym_throat_swelling`: Submandibular / Brisket Hot Swelling
- `sym_respiratory_distress`: Rapid Stridor / Open-Mouth Dyspnea
- `sym_sudden_death`: Peracute Death within Hours
- `sym_dark_blood_orifices`: Non-clotting Dark Blood from Rectum/Nose
- `sym_rapid_bloat`: Severe Post-Mortem Tympany / Bloat
- `sym_crepitant_swelling`: Crepitating Gaseous Swelling on Thigh/Shoulder
- `sym_abortion_third_trimester`: Late-Term Abortion Storm
- `sym_udder_swelling`: Inflamed, Hard, Hot Quarter / Swollen Udder
- `sym_abnormal_milk_clots`: Curdy / Serosanguinous / Clotted Milk

### C. Health History & Vaccination Features
| Field Name | Type | Units / Format | Allowed Values / Range | Missing Handling |
| :--- | :--- | :--- | :--- | :--- |
| `vaccination_status` | Categorical | String | `UP_TO_DATE`, `OVERDUE`, `UNVACCINATED`, `UNKNOWN` | Impute `UNKNOWN` |
| `days_since_last_vaccination` | Numerical | Days | `0` to `1500` | Impute `-1` (Flag as missing) |
| `previous_disease_history` | List of Strings | Categorical Multi-hot | Array of disease IDs or `[]` | Empty list (`[]`) |
| `prior_treatment_antibiotics` | Boolean | Binary | `0` (No/Unknown), `1` (Yes) | Impute `0` |

### D. Epidemiological & Spatial Features
| Field Name | Type | Units / Format | Allowed Values / Range | Missing Handling |
| :--- | :--- | :--- | :--- | :--- |
| `affected_animals` | Numerical | Count | `1` to `herd_size` | Impute `1` |
| `dead_count` | Numerical | Count | `0` to `affected_animals` | Impute `0` |
| `herd_attack_rate` | Numerical | Ratio (0.0 to 1.0) | `(affected_animals + dead_count) / herd_size` | Calculated |
| `mortality_rate` | Numerical | Ratio (0.0 to 1.0) | `dead_count / herd_size` | Calculated |
| `nearby_cases_10km` | Numerical | Count | `0` to `500` | Impute `0` |
| `distance_to_nearest_case_km`| Numerical | Kilometers | `0.1` to `200.0` | Impute `999.0` (No nearby case) |
| `active_outbreak_zone` | Boolean | Binary | `0` (No), `1` (Yes) | Impute `0` |

### E. Environmental & Weather Features
| Field Name | Type | Units / Format | Allowed Values / Range | Missing Handling |
| :--- | :--- | :--- | :--- | :--- |
| `temperature_c` | Numerical | Celsius | `-10.0` to `52.0` | Impute regional seasonal mean |
| `humidity_pct` | Numerical | Percentage | `5.0` to `100.0` | Impute `65.0` |
| `rainfall_mm` | Numerical | Millimeters | `0.0` to `500.0` | Impute `0.0` |
| `season` | Categorical | String | `MONSOON`, `POST_MONSOON`, `WINTER`, `SUMMER` | Derived from date/location |

---

## 4. Preprocessing & Encoding Rules

1. **Categorical Features (`species`, `season`, `vaccination_status`):**
   - One-hot encoded with explicit fallback for unseen categories during inference.
2. **Symptom Vectorization:**
   - Multi-hot vector with severity weighting: `none: 0.0`, `mild: 0.65`, `moderate: 1.0`, `severe: 1.4`.
3. **Continuous Numerical Features (`temperature_c`, `humidity_pct`, `herd_attack_rate`, `nearby_cases_10km`):**
   - Robust standardized using z-score normalization: $z = \frac{x - \mu}{\sigma}$ computed strictly on the training partition.
4. **Spatial Proximity:**
   - Exponential distance attenuation factor: $f_{\text{proximity}} = \frac{1}{1 + 0.15 \cdot d} \cdot \min(N_{\text{nearby}}, 5)$.

---

## 5. Train/Test Strategy & Data Quality Constraints

- **Split Ratio:** 80% Training, 20% Holdout Test with Stratified Sampling on `disease_label`.
- **Outbreak Leakage Prevention:** Records belonging to the same herd ID or local outbreak cluster must remain exclusively within the same fold.
- **Data Quality Gates:**
  - Reject records where `species` is incompatible with `disease_label` (e.g., LSD in Goat, PPR in Cattle, ASF in Bovine).
  - Reject records where `dead_count > affected_animals` or `affected_animals > herd_size`.
  - Flag and isolate duplicate or near-duplicate records across feature vectors.
