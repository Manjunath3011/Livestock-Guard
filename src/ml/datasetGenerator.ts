import { RawHealthRecord } from './types';
import { Species } from '../types';

/**
 * Benchmark Prototype Dataset Generator
 * Generates a realistic, multi-class labeled prototype dataset for ML model training,
 * cross-validation, and pipeline testing according to training_data_schema.md.
 * 
 * Each record is tagged with:
 * diagnosis_source: 'prototype_benchmark'
 */
export class BenchmarkDatasetGenerator {
  public static generatePrototypeDataset(): RawHealthRecord[] {
    const records: RawHealthRecord[] = [];
    let recordCounter = 1000;

    const createRecord = (
      disease: string,
      species: Species,
      symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[],
      opts: {
        vac?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED' | 'UNKNOWN';
        attack?: number;
        mort?: number;
        nearby?: number;
        dist?: number;
        season?: 'MONSOON' | 'POST_MONSOON' | 'WINTER' | 'SUMMER';
        temp?: number;
        humidity?: number;
        duration?: number;
      } = {}
    ): RawHealthRecord => {
      recordCounter++;
      return {
        record_id: `rec_proto_${recordCounter}`,
        animal_id: `anim_${recordCounter}`,
        herd_id: `herd_${Math.floor(recordCounter / 5)}`,
        species,
        age_years: Math.round((1 + Math.random() * 8) * 10) / 10,
        sex: Math.random() > 0.3 ? 'FEMALE' : 'MALE',
        herd_size: 10 + Math.floor(Math.random() * 30),
        symptoms: symptoms.map(s => ({
          symptom_id: s.id,
          severity: s.sev || (Math.random() > 0.6 ? 'severe' : Math.random() > 0.3 ? 'moderate' : 'mild')
        })),
        symptom_duration_days: opts.duration || (1 + Math.floor(Math.random() * 6)),
        vaccination_status: opts.vac || (Math.random() > 0.4 ? 'UNVACCINATED' : 'OVERDUE'),
        affected_animals: opts.attack || (1 + Math.floor(Math.random() * 6)),
        dead_count: opts.mort || 0,
        nearby_cases_10km: opts.nearby !== undefined ? opts.nearby : Math.floor(Math.random() * 4),
        distance_to_nearest_case_km: opts.dist || (1 + Math.floor(Math.random() * 20)),
        temperature_c: opts.temp || (22 + Math.floor(Math.random() * 14)),
        humidity_pct: opts.humidity || (40 + Math.floor(Math.random() * 50)),
        rainfall_mm: opts.season === 'MONSOON' ? 45 + Math.floor(Math.random() * 80) : Math.floor(Math.random() * 15),
        season: opts.season || (Math.random() > 0.5 ? 'MONSOON' : 'WINTER'),
        disease_label: disease,
        diagnosis_source: 'PROTOTYPE_BENCHMARK',
        label_quality: 'VALIDATED',
        timestamp: '2026-08-15T10:00:00.000Z'
      };
    };

    // 1. FOOT AND MOUTH DISEASE (FMD) — ~160 samples (Cattle, Buffalo, Swine, Sheep, Goat)
    const fmdSpecies: Species[] = ['Cattle', 'Buffalo', 'Pig', 'Sheep', 'Goat'];
    for (let i = 0; i < 160; i++) {
      const sp = fmdSpecies[i % fmdSpecies.length];
      const symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[] = [
        { id: 'sym_fever', sev: i % 3 === 0 ? 'severe' : 'moderate' },
        { id: 'sym_oral_blisters', sev: i % 2 === 0 ? 'severe' : 'moderate' }
      ];
      if (i % 2 === 0) symptoms.push({ id: 'sym_excessive_salivation', sev: 'moderate' });
      if (i % 3 === 1) symptoms.push({ id: 'sym_hoof_lesions', sev: 'severe' });
      if (i % 4 === 0) symptoms.push({ id: 'sym_lameness', sev: 'moderate' });
      if (i % 5 === 0) symptoms.push({ id: 'sym_drop_in_milk', sev: 'moderate' });
      if (i % 6 === 0) symptoms.push({ id: 'sym_lethargy', sev: 'mild' });

      records.push(createRecord('dis_fmd', sp, symptoms, {
        vac: i % 3 === 0 ? 'OVERDUE' : i % 3 === 1 ? 'UNVACCINATED' : 'UNKNOWN',
        attack: 2 + (i % 7),
        nearby: 1 + (i % 5),
        dist: 1.5 + (i % 10),
        season: i % 2 === 0 ? 'MONSOON' : 'POST_MONSOON',
        duration: 1 + (i % 5)
      }));
    }

    // 2. LUMPY SKIN DISEASE (LSD) — ~150 samples (Cattle, Buffalo)
    const lsdSpecies: Species[] = ['Cattle', 'Buffalo'];
    for (let i = 0; i < 150; i++) {
      const sp = lsdSpecies[i % lsdSpecies.length];
      const symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[] = [
        { id: 'sym_skin_nodules', sev: i % 2 === 0 ? 'severe' : 'moderate' }
      ];
      if (i % 2 === 0) symptoms.push({ id: 'sym_fever', sev: 'moderate' });
      if (i % 3 !== 0) symptoms.push({ id: 'sym_enlarged_lymph_nodes', sev: 'severe' });
      if (i % 4 === 0) symptoms.push({ id: 'sym_edema_legs', sev: 'moderate' });
      if (i % 5 === 0) symptoms.push({ id: 'sym_nasal_discharge', sev: 'mild' });
      if (i % 6 === 0) symptoms.push({ id: 'sym_ocular_discharge', sev: 'mild' });

      records.push(createRecord('dis_lsd', sp, symptoms, {
        season: i % 3 === 0 ? 'MONSOON' : 'SUMMER',
        humidity: 60 + (i % 35),
        temp: 28 + (i % 10),
        vac: i % 2 === 0 ? 'UNVACCINATED' : 'OVERDUE',
        nearby: 1 + (i % 6),
        duration: 3 + (i % 8)
      }));
    }

    // 3. PESTE DES PETITS RUMINANTS (PPR) — ~150 samples (Goat, Sheep)
    const pprSpecies: Species[] = ['Goat', 'Sheep'];
    for (let i = 0; i < 150; i++) {
      const sp = pprSpecies[i % pprSpecies.length];
      const symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[] = [
        { id: 'sym_fever', sev: 'severe' },
        { id: 'sym_severe_diarrhea', sev: i % 2 === 0 ? 'severe' : 'moderate' }
      ];
      if (i % 2 === 0) symptoms.push({ id: 'sym_oral_ulcers', sev: 'severe' });
      if (i % 3 === 0) symptoms.push({ id: 'sym_nasal_discharge', sev: 'moderate' });
      if (i % 4 === 0) symptoms.push({ id: 'sym_pneumonia_cough', sev: 'moderate' });
      if (i % 5 === 0) symptoms.push({ id: 'sym_dehydration', sev: 'severe' });

      records.push(createRecord('dis_ppr', sp, symptoms, {
        vac: i % 2 === 0 ? 'UNVACCINATED' : 'OVERDUE',
        attack: 4 + (i % 10),
        mort: i % 4 === 0 ? 1 : 0,
        duration: 2 + (i % 6)
      }));
    }

    // 4. HAEMORRHAGIC SEPTICAEMIA (HS) — ~140 samples (Buffalo, Cattle)
    const hsSpecies: Species[] = ['Buffalo', 'Cattle'];
    for (let i = 0; i < 140; i++) {
      const sp = hsSpecies[i % hsSpecies.length];
      const symptoms = [
        { id: 'sym_fever', sev: 'severe' as const },
        { id: 'sym_throat_swelling', sev: 'severe' as const },
        { id: 'sym_respiratory_distress', sev: 'severe' as const },
        { id: 'sym_salivation', sev: 'moderate' as const }
      ];
      if (Math.random() > 0.4) symptoms.push({ id: 'sym_sudden_death', sev: 'severe' as const });

      records.push(createRecord('dis_hs', sp, symptoms, {
        season: 'MONSOON',
        mort: 1 + Math.floor(Math.random() * 4),
        duration: 1 + Math.floor(Math.random() * 2),
        vac: 'UNVACCINATED'
      }));
    }

    // 5. ANTHRAX — ~120 samples (Cattle, Buffalo, Sheep, Goat)
    const anthraxSpecies: Species[] = ['Cattle', 'Buffalo', 'Sheep', 'Goat'];
    for (let i = 0; i < 120; i++) {
      const sp = anthraxSpecies[i % anthraxSpecies.length];
      const symptoms = [
        { id: 'sym_sudden_death', sev: 'severe' as const },
        { id: 'sym_dark_blood_orifices', sev: 'severe' as const },
        { id: 'sym_rapid_bloat', sev: 'severe' as const },
        { id: 'sym_high_fever', sev: 'severe' as const }
      ];

      records.push(createRecord('dis_anthrax', sp, symptoms, {
        mort: 2 + Math.floor(Math.random() * 5),
        duration: 1,
        attack: 2 + Math.floor(Math.random() * 3)
      }));
    }

    // 6. BLACK QUARTER (BQ) — ~130 samples (Cattle, Buffalo)
    const bqSpecies: Species[] = ['Cattle', 'Buffalo'];
    for (let i = 0; i < 130; i++) {
      const sp = bqSpecies[i % bqSpecies.length];
      const symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[] = [
        { id: 'sym_fever', sev: 'severe' },
        { id: 'sym_crepitant_swelling', sev: 'severe' },
        { id: 'sym_lameness', sev: 'severe' }
      ];
      if (Math.random() > 0.4) symptoms.push({ id: 'sym_muscular_tremors', sev: 'moderate' });

      records.push(createRecord('dis_bq', sp, symptoms, {
        vac: 'UNVACCINATED',
        mort: Math.random() > 0.4 ? 1 : 0
      }));
    }

    // 7. BRUCELLOSIS — ~120 samples (Cattle, Buffalo, Sheep, Goat)
    const brucSpecies: Species[] = ['Cattle', 'Buffalo', 'Sheep', 'Goat'];
    for (let i = 0; i < 120; i++) {
      const sp = brucSpecies[i % brucSpecies.length];
      const symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[] = [
        { id: 'sym_abortion_third_trimester', sev: 'severe' },
        { id: 'sym_retained_placenta', sev: 'moderate' }
      ];
      if (Math.random() > 0.5) symptoms.push({ id: 'sym_hygroma_joints', sev: 'moderate' });
      if (Math.random() > 0.6) symptoms.push({ id: 'sym_infertility', sev: 'mild' });

      records.push(createRecord('dis_brucellosis', sp, symptoms, {
        duration: 5 + Math.floor(Math.random() * 15)
      }));
    }

    // 8. MASTITIS — ~140 samples (Cattle, Buffalo, Goat)
    const mastSpecies: Species[] = ['Cattle', 'Buffalo', 'Goat'];
    for (let i = 0; i < 140; i++) {
      const sp = mastSpecies[i % mastSpecies.length];
      const symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[] = [
        { id: 'sym_udder_swelling', sev: 'severe' },
        { id: 'sym_abnormal_milk_clots', sev: 'severe' },
        { id: 'sym_udder_heat_pain', sev: 'severe' },
        { id: 'sym_drop_in_milk', sev: 'severe' }
      ];
      if (Math.random() > 0.5) symptoms.push({ id: 'sym_fever', sev: 'mild' });

      records.push(createRecord('dis_mastitis', sp, symptoms, {
        attack: 1 + Math.floor(Math.random() * 2),
        mort: 0
      }));
    }

    // 9. AFRICAN SWINE FEVER (ASF) — ~110 samples (Pig)
    for (let i = 0; i < 110; i++) {
      const symptoms = [
        { id: 'sym_high_fever', sev: 'severe' as const },
        { id: 'sym_skin_cyanosis_ears_belly', sev: 'severe' as const },
        { id: 'sym_bloody_diarrhea', sev: 'severe' as const },
        { id: 'sym_sudden_death', sev: 'severe' as const }
      ];

      records.push(createRecord('dis_asf', 'Pig', symptoms, {
        attack: 5 + Math.floor(Math.random() * 10),
        mort: 3 + Math.floor(Math.random() * 6),
        duration: 2 + Math.floor(Math.random() * 3)
      }));
    }

    // 10. AVIAN INFLUENZA — ~110 samples (Poultry)
    for (let i = 0; i < 110; i++) {
      const symptoms = [
        { id: 'sym_sudden_death', sev: 'severe' as const },
        { id: 'sym_cyanosis_comb_wattle', sev: 'severe' as const },
        { id: 'sym_facial_swelling', sev: 'severe' as const },
        { id: 'sym_drop_egg_production', sev: 'severe' as const }
      ];

      records.push(createRecord('dis_avian_flu', 'Poultry', symptoms, {
        attack: 15 + Math.floor(Math.random() * 30),
        mort: 10 + Math.floor(Math.random() * 20),
        duration: 1 + Math.floor(Math.random() * 2)
      }));
    }

    // 11. OTHER / MILD NON-INFECTIOUS / HEALTHY — ~150 samples (All Species)
    const allSpecies: Species[] = ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Horse'];
    for (let i = 0; i < 150; i++) {
      const sp = allSpecies[i % allSpecies.length];
      const symptoms: { id: string; sev?: 'mild' | 'moderate' | 'severe' }[] = [
        { id: i % 2 === 0 ? 'sym_weakness' : 'sym_appetite_loss', sev: 'mild' as const }
      ];
      if (i % 3 === 0) symptoms.push({ id: 'sym_reduced_milk', sev: 'mild' as const });

      records.push(createRecord('dis_other_healthy', sp, symptoms, {
        attack: 1,
        mort: 0,
        vac: 'UP_TO_DATE',
        nearby: 0,
        dist: 50
      }));
    }

    return records;
  }
}
