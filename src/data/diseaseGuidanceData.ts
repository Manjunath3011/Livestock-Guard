import { SupportiveCareStep, HomeCareLevel, DiseaseReference } from '../types';

export interface DiseaseGuidanceExtension {
  homeCareAllowed: boolean;
  homeCareLevel: HomeCareLevel;
  supportiveCare: string;
  supportiveCareSteps: SupportiveCareStep[];
  careWarnings: string[];
  thingsToAvoid: string[];
  emergencySigns: string[];
  veterinaryRequired: boolean;
  emergencyGuidance: string;
  vaccineAvailable: boolean;
  primaryVaccineId?: string;
  vaccineScheduleReference?: string;
  farmerFriendlyExplanation: string;
  references: DiseaseReference;
}

export const DISEASE_GUIDANCE_MAP: Record<string, DiseaseGuidanceExtension> = {
  dis_fmd: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Provide soft digestible warm gruel (cooked porridge, rice bran, green fodder paste) to ease mouth pain. Ensure continuous access to clean, cool drinking water. Keep the animal in a shaded, well-ventilated stall with clean, dry, soft straw or sand bedding. Gently flush mouth lesions with 0.01% potassium permanganate or 2% sodium bicarbonate solution. Apply veterinary-approved antiseptic sprays or zinc oxide ointment to foot lesions and keep feet clean and dry.',
    supportiveCareSteps: [
      {
        title: 'Fresh Clean Water & Soft Diet',
        desc: 'Provide continuous cool, fresh water and soft boiled porridge or green fodder paste. Mouth blisters make dry grass or straw painful to chew.',
        icon: 'Droplets',
        category: 'WATER'
      },
      {
        title: 'Gentle Antiseptic Mouth Wash',
        desc: 'Gently rinse mouth 2-3 times daily with mild 0.01% potassium permanganate or 2% sodium bicarbonate solution to prevent secondary bacterial infection.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      },
      {
        title: 'Clean, Soft & Dry Bedding',
        desc: 'Keep the animal in a dedicated stall with thick dry sand or straw. Damp or dirty floors severely worsen foot ulcers and risk maggot wounds.',
        icon: 'Shield',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Isolate & Restrict Movement',
        desc: 'Keep the affected animal isolated from healthy livestock. Disinfect footwear and tools with 4% sodium carbonate or citric acid before visiting other pens.',
        icon: 'Layers',
        category: 'SEPARATION'
      },
      {
        title: 'Monitor Calves and Lactation Daily',
        desc: 'Watch young calves closely (high mortality from heart inflammation). Discard milk from infected quarters and never feed unpasteurized milk to calves.',
        icon: 'Activity',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'Highly contagious viral disease. Aerosols and vehicle tires spread the virus kilometers away.',
      'Calves under 6 months face severe risk of sudden heart failure (myocarditis).',
      'Loss of hooves or secondary fly strike (maggots) can cause permanent crippling if feet are unmanaged.'
    ],
    thingsToAvoid: [
      'Do NOT apply corrosive chemicals, crude kerosene, used motor oil, or caustic unverified concoctions on mouth or foot wounds.',
      'Do NOT give human medicines (such as paracetamol, aspirin, or ibuprofen) to livestock without veterinary prescription.',
      'Do NOT force-feed coarse, thorny or dry roughage which shreds fragile oral blisters.',
      'Do NOT move, transport, or sell sick animals or herd contacts at animal fairs or village markets.',
      'Do NOT attempt to vaccinate clinically sick animals expecting it to cure them — vaccines are for prevention in healthy animals only.',
      'Do NOT delay contacting your local veterinary dispensary or livestock officer.'
    ],
    emergencySigns: [
      'Complete inability to stand (downer cow)',
      'Young calves collapsing suddenly without prior symptoms',
      'Severe foul-smelling maggots in foot clefts or teat necrosis',
      'High persistent fever >105°F with deep respiratory grunting',
      'Late-term abortion in pregnant cows'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Contact the nearest veterinary dispensary immediately. FMD is a state and nationally notifiable disease. Strict biosecurity ring containment is required.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_fmd_poly',
    vaccineScheduleReference: 'Biannual routine immunization (every 6 months) under the National Animal Disease Control Programme (NADCP).',
    farmerFriendlyExplanation:
      'Foot-and-Mouth Disease (Munhkhur / Khurha) causes painful sores on the tongue, gums, and hooves, making it hard for the animal to eat or walk. While the virus runs its course, good supportive care—giving soft wet food, clean water, gentle mouth rinses, and keeping hooves clean and dry—prevents fatal complications and helps the animal recover.',
    references: {
      sourceName: 'WOAH Terrestrial Manual & National Animal Disease Control Programme (NADCP)',
      authority: 'Department of Animal Husbandry and Dairying (DAHD), Govt. of India / WOAH',
      lastReviewed: '2026-08-01'
    }
  },

  dis_lsd: {
    homeCareAllowed: true,
    homeCareLevel: 'SAFE_SUPPORTIVE',
    supportiveCare:
      'House the animal in a dedicated, fly-proof isolated stall with fine mosquito netting. Apply veterinary antiseptic spray or neem oil/gentian violet to ruptured skin nodules to keep biting flies away and stop maggot formation. Offer fresh, palatable green fodder, tender leaves, and clean cool water with mineral electrolytes. Apply topical fly repellents (such as deltamethrin or cypermethrin) around shed perimeters to halt insect transmission.',
    supportiveCareSteps: [
      {
        title: 'Fly Protection & Netting',
        desc: 'Place fine mesh netting or insect screens around the sick stall. Biting stable flies (Stomoxys) and mosquitoes are the primary spreaders of Lumpy Skin Disease.',
        icon: 'Shield',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Wound Care on Ruptured Lumps',
        desc: 'When skin nodules break or ulcerate, gently apply gentian violet or veterinary wound spray with fly repellent to block secondary bacterial infection and maggots.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      },
      {
        title: 'Nutritious Green Fodder & Electrolytes',
        desc: 'Provide fresh soft grass, maize fodder, and cool water mixed with mineral electrolyte powder to maintain strength and hydration through the fever phase.',
        icon: 'Droplets',
        category: 'FEED'
      },
      {
        title: 'Shed Perimeter Vector Spraying',
        desc: 'Spray walls and surrounding dung heaps with eco-safe fly repellents (e.g. deltamethrin) during evening hours to suppress insect vectors.',
        icon: 'Wind',
        category: 'HYGIENE'
      },
      {
        title: 'Daily Temperature & Respiration Check',
        desc: 'Measure rectal temperature and observe breathing twice daily. Swelling of the lower legs, dewlap, or rapid breathing requires prompt veterinary intervention.',
        icon: 'Activity',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'Biting flies and mosquitoes rapidly transmit LSD to other cows within hours.',
      'Severely swollen legs and brisket can lead to secondary deep skin sloughing.',
      'Nodules in the upper airway can trigger breathing distress and pneumonia.'
    ],
    thingsToAvoid: [
      'Do NOT squeeze, puncture, or lance unbroken skin nodules.',
      'Do NOT wash or bathe a feverish animal with ice-cold well water.',
      'Do NOT allow blood-sucking flies to feed on open skin ulcers.',
      'Do NOT administer human fever medicines (like paracetamol) without veterinary dosage.',
      'Do NOT let sick cows graze in communal pastures or drink from shared village ponds.',
      'Do NOT sell or transport milk/cattle from affected farms until cleared.'
    ],
    emergencySigns: [
      'Severe respiratory distress, stridor, or gasping with extended neck',
      'Massive swelling of the throat, dewlap, and all four limbs (edema)',
      'Large areas of necrotic skin sloughing off with deep foul-smelling ulceration',
      'Total refusal to drink water for more than 24 hours',
      'Acute abortion in pregnant cows'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'LSD requires supportive veterinary therapy with veterinary NSAIDs, antihistamines, and secondary antibiotic cover to prevent septicemia. Report to the local livestock development officer.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_lsd_goatpox',
    vaccineScheduleReference: 'Annual pre-monsoon vaccination with Lumpi-ProVacInd or heterologous Live Goat Pox vaccine.',
    farmerFriendlyExplanation:
      'Lumpy Skin Disease is a viral illness spread by biting flies and mosquitoes that causes firm round bumps across the cow’s body. While the immune system fights the virus, farmers can protect their cattle by keeping flies away with netting and neem oil, providing soft food and water, treating broken skin sores, and isolating the animal.',
    references: {
      sourceName: 'ICAR-National Research Centre on Equines & Indian Veterinary Research Institute (IVRI)',
      authority: 'Indian Council of Agricultural Research (ICAR) / WOAH',
      lastReviewed: '2026-08-01'
    }
  },

  dis_hs: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'EMERGENCY CONDITION: Keep the animal in a calm, shaded, well-ventilated dry pen with head elevated. Do NOT force feed or drench any liquids into the throat, as throat swelling creates an extreme danger of choking and fatal lung flooding. Provide calm surroundings and request emergency on-site veterinary dispatch immediately.',
    supportiveCareSteps: [
      {
        title: 'Emergency Vet Dispatch (Act in Minutes)',
        desc: 'Call the emergency veterinarian or livestock dispensary immediately. Antibiotic treatment must be injected within hours to save the animal’s life.',
        icon: 'AlertTriangle',
        category: 'MONITORING'
      },
      {
        title: 'Calm Shaded Shelter with Head Elevated',
        desc: 'Keep the animal in a quiet, cool, draft-free stall. Prop head up naturally if recumbent to ease throat pressure and maintain an open airway.',
        icon: 'Shield',
        category: 'ENVIRONMENT'
      },
      {
        title: 'No Force Drenching',
        desc: 'Never pour liquids or medicines down the throat with a bottle. Throat edema blocks swallowing and liquid goes directly into lungs, causing instant death.',
        icon: 'Flame',
        category: 'WATER'
      },
      {
        title: 'Immediate Herd Isolation',
        desc: 'Separate all healthy cattle and buffaloes to dry upland paddocks away from stagnant water and mud.',
        icon: 'Layers',
        category: 'SEPARATION'
      }
    ],
    careWarnings: [
      'Hyperacute bacterial disease. Untreated animals often die within 12 to 24 hours of showing throat swelling and fever.',
      'Buffaloes are particularly vulnerable to rapid suffocation and endotoxic shock.',
      'Contaminated saliva on shared feed or water troughs quickly infects the rest of the herd.'
    ],
    thingsToAvoid: [
      'Do NOT attempt home herbal drenching with mustard oil or concoctions via bottle — fatal aspiration risk.',
      'Do NOT wait overnight to see if the fever subsides — delays are almost always fatal.',
      'Do NOT allow healthy herd members to drink from stagnant monsoon pools or floodwater.',
      'Do NOT work or force sick bullocks to pull carts or plow fields.',
      'Do NOT vaccinate the animal while it is in the acute phase of this illness.'
    ],
    emergencySigns: [
      'Hot, painful, swelling of the throat, submandibular area, and brisket (Galgothu)',
      'Loud snoring, open-mouth gasping for air with tongue protruding',
      'High fever above 106°F with shivering and rapid pulse',
      'Sudden collapse and recumbency'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'CRITICAL MEDICAL EMERGENCY: Hemorrhagic Septicemia has up to 80-90% mortality if antibiotic therapy (such as Ceftiofur, Oxytetracycline, or Florfenicol) is not administered immediately by IV/IM injection.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_hs_alum',
    vaccineScheduleReference: 'Annual pre-monsoon vaccination in May-June for cattle and buffaloes over 6 months old.',
    farmerFriendlyExplanation:
      'Hemorrhagic Septicemia (Galgothu) is a severe, fast-moving bacterial infection that causes sudden high fever and painful swelling in the throat, making it difficult for the animal to breathe. Because it can be fatal within hours, emergency veterinary injection is urgently required.',
    references: {
      sourceName: 'FAO Animal Production and Health Manual on Hemorrhagic Septicemia',
      authority: 'Food and Agriculture Organization (FAO) / ICAR-IVRI',
      lastReviewed: '2026-08-01'
    }
  },

  dis_anthrax: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'ZOONOTIC EMERGENCY: Do NOT touch, skin, open, or move the carcass or sick animal with bare hands. Isolate the stall and quarantine the entire farm perimeter immediately. Do not milk the animal or consume any dairy or meat products. Notify the government veterinary officer immediately for formal biosecurity disposal and ring antibiotic cover.',
    supportiveCareSteps: [
      {
        title: 'Zero Contact & Complete Quarantine',
        desc: 'Do not touch blood or discharge. Keep all people and other animals away from the area. Bacillus anthracis spores survive in soil for decades.',
        icon: 'AlertTriangle',
        category: 'SEPARATION'
      },
      {
        title: 'Immediate Government Notification',
        desc: 'Call the District Veterinary Officer and Public Health Officer immediately. Anthrax is a mandatory high-level notifiable disease.',
        icon: 'Shield',
        category: 'MONITORING'
      },
      {
        title: 'Deep Burial with Quicklime',
        desc: 'Deceased animals must be buried at least 6-8 feet deep covered with quicklime under official supervision. Never open the carcass (oxygen triggers spore formation).',
        icon: 'Sparkles',
        category: 'ENVIRONMENT'
      }
    ],
    careWarnings: [
      'SEVERE HUMAN HEALTH HAZARD (Zoonotic). Contact with infected blood or hides causes cutaneous or pulmonary Anthrax in humans.',
      'Carcasses must NEVER be opened or butchered for meat.',
      'Spores remain infectious in the ground for over 40 years.'
    ],
    thingsToAvoid: [
      'Do NOT open, cut, or perform home post-mortem on the dead animal.',
      'Do NOT consume, sell, or process milk, meat, or hides from suspected animals.',
      'Do NOT drag dead carcasses across pastures or public roads.',
      'Do NOT leave dead bodies exposed to scavengers, dogs, or vultures.',
      'Do NOT touch bloody discharges with bare hands.'
    ],
    emergencySigns: [
      'Sudden death in cattle, sheep, or goats with dark, non-clotting blood oozing from mouth, nostrils, and rectum',
      'Absence of normal rigor mortis (body remains limp after death)',
      'Severe sudden fever with swelling around the neck and throat prior to collapse'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'CRITICAL ZOONOTIC ALERT: Notify official district epidemiology officers immediately. Veterinary personnel will handle carcass disposal, ring antibiotic prophylaxis for contacts, and spore decontamination.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_anthrax_sterne',
    vaccineScheduleReference: 'Annual pre-grazing vaccination with live Sterne spore vaccine in endemic areas.',
    farmerFriendlyExplanation:
      'Anthrax is a dangerous bacterial disease that can spread from animals to humans. It often causes sudden death with dark blood from the nose and mouth. Because it is highly hazardous to human health, never touch the animal without protection, do not consume its milk or meat, and notify veterinary authorities immediately.',
    references: {
      sourceName: 'WHO/FAO/OIE Anthrax in Humans and Animals Guidance',
      authority: 'World Health Organization (WHO) & World Organisation for Animal Health (WOAH)',
      lastReviewed: '2026-08-01'
    }
  },

  dis_ppr: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Isolate sick goats and sheep in a warm, dry, draft-free pen. Provide oral rehydration solution (water with electrolytes and glucose) to counteract severe watery diarrhea. Clean crusty eyes and nostrils with warm saline cotton pads to maintain breathing and vision. Offer soft green leaves and boiled gruel. Avoid cold floor contact by providing dry straw bedding.',
    supportiveCareSteps: [
      {
        title: 'Oral Electrolyte Rehydration',
        desc: 'Offer warm water mixed with oral rehydration salts (ORS) and glucose multiple times daily to prevent fatal dehydration from diarrhea.',
        icon: 'Droplets',
        category: 'WATER'
      },
      {
        title: 'Clean Eye and Nose Discharges',
        desc: 'Gently wipe crusted eyes and blocked nostrils with cotton soaked in warm saline solution to help the animal breathe and see.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      },
      {
        title: 'Tender Leaves & Warm Gruel',
        desc: 'Provide fresh soft tree leaves (like subabul, neem, or tender banyan) and warm millet/rice gruel to soothe painful mouth ulcers.',
        icon: 'Droplets',
        category: 'FEED'
      },
      {
        title: 'Warm & Dry Flock Isolation',
        desc: 'Separate affected sheep and goats from the flock. Protect from cold night winds which accelerate secondary pneumonia.',
        icon: 'Shield',
        category: 'SEPARATION'
      }
    ],
    careWarnings: [
      'PPR (Goat Plague) spreads with extreme rapidity through flock aerosols and communal water troughs.',
      'High mortality rate in young lambs and kids (often reaching 70-90% without supportive care).',
      'Severe mouth sores prevent eating, causing rapid weight loss and weakness.'
    ],
    thingsToAvoid: [
      'Do NOT allow sick goats to mix with the rest of the flock or communal grazing grounds.',
      'Do NOT feed harsh, dry, spiky thorny shrubs that aggravate mouth erosions.',
      'Do NOT wash animals with cold water during fever.',
      'Do NOT sell symptomatic goats at weekly animal markets (bazaars).',
      'Do NOT vaccinate goats that are already sick with PPR.'
    ],
    emergencySigns: [
      'Profuse foul-smelling diarrhea with severe soiling of hindquarters',
      'Severe respiratory grunting, open-mouth panting, and pneumonia',
      'Extensive ulceration and bad odor from mouth, lips, and tongue',
      'High fever above 105°F with recumbency'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Contact a veterinarian for supportive antibiotics (to stop secondary bacterial pneumonia), anti-inflammatory medication, and fluid therapy. Report flock clusters to district authorities for ring vaccination.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_ppr_sungri',
    vaccineScheduleReference: 'Vaccinate once every 3 years with PPR Sungri live vaccine in kids and lambs over 3 months old.',
    farmerFriendlyExplanation:
      'PPR (Goat Plague) is a viral disease of sheep and goats that causes fever, mouth ulcers, eye/nasal discharge, and severe diarrhea. Supportive care with clean oral fluids, soft green leaves, eye cleaning, and dry warm bedding helps sick animals survive while a vet provides supportive medicine.',
    references: {
      sourceName: 'FAO-WOAH Global Control and Eradication Strategy for PPR',
      authority: 'Food and Agriculture Organization (FAO) / ICAR-IVRI',
      lastReviewed: '2026-08-01'
    }
  },

  dis_bq: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'EMERGENCY: Place the animal on thick dry bedding and prevent rough physical handling of the swollen leg. Avoid incision of the gas-swollen muscle. Urgent parenteral high-dose penicillin or oxytetracycline injection by a veterinary practitioner is critical in early stages.',
    supportiveCareSteps: [
      {
        title: 'Immediate Veterinary Emergency Call',
        desc: 'Call the veterinarian immediately. Clostridium chauvoei toxin causes rapid gangrenous muscle destruction.',
        icon: 'AlertTriangle',
        category: 'MONITORING'
      },
      {
        title: 'Rest & Soft Bedding',
        desc: 'Keep the animal quiet on soft sand or straw to minimize muscle pressure and severe pain.',
        icon: 'Shield',
        category: 'ENVIRONMENT'
      }
    ],
    careWarnings: [
      'Spongy crackling (crepitant) swelling on the shoulder, rump, or neck is an acute clostridial hallmark.',
      'Young vigorous cattle (6 to 24 months old) are most frequently struck.',
      'Mortality approaches 100% if treatment is not started in the first few hours of lameness.'
    ],
    thingsToAvoid: [
      'Do NOT cut into or massage the crackling gas swelling.',
      'Do NOT force the lame animal to walk or stand.',
      'Do NOT delay veterinary antibiotic injection.'
    ],
    emergencySigns: [
      'Hot, painful swelling on the thigh, shoulder, or neck that turns cold and crackles like bubble wrap under the hand',
      'Severe acute lameness and reluctance to bear any weight',
      'High fever (105-107°F) rapidly dropping to subnormal before collapse'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Blackleg is a peracute clostridial disease. Emergency high-dose penicillin therapy must be started within hours of symptom onset by a veterinary professional.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_bq',
    vaccineScheduleReference: 'Annual pre-monsoon vaccination in cattle and buffaloes aged 6 to 24 months.',
    farmerFriendlyExplanation:
      'Black Quarter (Langda / Blackleg) is a severe bacterial muscle infection in young cattle that causes severe lameness and spongy, crackling swelling on the leg or shoulder. It requires immediate emergency veterinary antibiotic treatment.',
    references: {
      sourceName: 'ICAR-IVRI Veterinary Disease Compendium',
      authority: 'Indian Council of Agricultural Research (ICAR)',
      lastReviewed: '2026-08-01'
    }
  },

  dis_brucella: {
    homeCareAllowed: false,
    homeCareLevel: 'VETERINARY_ONLY',
    supportiveCare:
      'ZOONOTIC PRECAUTION: Always wear heavy rubber gloves and boots when assisting deliveries or handling aborted fetuses, placenta, or uterine fluids. Immediately isolate the cow from other pregnant stock. Deeply bury or incinerate all aborted materials covered with quicklime. Disinfect the calving stall thoroughly with bleach or 2% formalin.',
    supportiveCareSteps: [
      {
        title: 'Wear Protective Gloves & Boots',
        desc: 'Never touch aborted calves, placenta, or birth fluids with bare hands. Brucella easily penetrates human skin causing chronic undulant fever in humans.',
        icon: 'Shield',
        category: 'HYGIENE'
      },
      {
        title: 'Disposal of Aborted Tissues with Lime',
        desc: 'Deeply bury the aborted fetus and placental membranes at least 5 feet underground covered with fresh quicklime away from water sources.',
        icon: 'Sparkles',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Isolate the Aborting Cow',
        desc: 'Keep the cow in strict isolation for at least 30 days until vaginal discharge ceases. Disinfect the pen with 2% sodium hydroxide or bleaching powder.',
        icon: 'Layers',
        category: 'SEPARATION'
      }
    ],
    careWarnings: [
      'SEVERE ZOONOTIC INFECTION: Causes chronic recurrent fever, joint pain, and sweating in humans (Malta / Undulant Fever).',
      'Raw, unboiled milk from infected cows carries live Brucella bacteria.',
      'Easily spreads between pregnant cows during calving season through uterine discharges.'
    ],
    thingsToAvoid: [
      'Do NOT drink raw, unboiled, or unpasteurized milk from infected herds.',
      'Do NOT touch aborted fetuses or placenta with bare hands.',
      'Do NOT allow dogs or scavengers to eat discarded aborted tissues.',
      'Do NOT sell known Brucella-positive cattle to unsuspecting farmers.',
      'Do NOT administer Brucella S19 vaccine to adult cows or pregnant animals (causes abortion).'
    ],
    emergencySigns: [
      'Sudden abortion storm in late pregnancy (7th to 9th month of gestation)',
      'Severe retention of placenta with foul uterine discharge (metritis)',
      'Orchitis and swollen testicles in breeding bulls'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Veterinary officer must perform serological screening (Rose Bengal Plate Test / ELISA) and milk ring testing. Treatment of cattle is generally not recommended due to carrier status; strict biosecurity and calfhood vaccination are required.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_brucella_s19',
    vaccineScheduleReference: 'Single lifetime calfhood dose with Brucella abortus S19 or RB51 vaccine in female calves aged 4 to 8 months only.',
    farmerFriendlyExplanation:
      'Brucellosis is a bacterial disease that causes late-term abortions in cows and can spread to humans through unboiled milk or contact with birth fluids. Protect yourself with rubber gloves, boil all milk, bury aborted tissues with lime, and vaccinate young female calves before 8 months of age.',
    references: {
      sourceName: 'WOAH Terrestrial Manual & National Brucellosis Control Programme',
      authority: 'WOAH / DAHD India',
      lastReviewed: '2026-08-01'
    }
  },

  dis_theileriosis: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Provide shaded, cool shelter away from direct sunlight. Offer high-quality green fodder, liver tonics, and iron-vitamin supplements under veterinary advice to support red blood cell regeneration. Apply acaricide sprays to the animal and shed walls to eliminate Hyalomma vector ticks. Sponge high fever with cool water.',
    supportiveCareSteps: [
      {
        title: 'Shaded Rest & Cool Environment',
        desc: 'Keep the animal in a well-ventilated, shaded stall. Sponge head and neck with cool water if rectal temperature exceeds 104°F.',
        icon: 'Thermometer',
        category: 'ENVIRONMENT'
      },
      {
        title: 'High Protein Fodder & Iron Tonics',
        desc: 'Provide easily digestible green fodder and liver/iron tonics to counteract severe anemia and red blood cell breakdown.',
        icon: 'Droplets',
        category: 'FEED'
      },
      {
        title: 'Strategic Tick Vector Dipping',
        desc: 'Apply veterinary-approved pour-on or spray acaricides (e.g., flumethrin or amitraz) to eliminate Hyalomma hard ticks.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      }
    ],
    careWarnings: [
      'Exotic crossbred cattle (HF and Jersey cross) are highly susceptible to severe fatal anemia and pulmonary edema.',
      'Enlarged prescapular lymph nodes in the shoulder region are a classic indicator.',
      'Tick infestation in cracks of stone sheds maintains chronic herd transmission.'
    ],
    thingsToAvoid: [
      'Do NOT delay antiprotozoal veterinary therapy — early Buparvaquone injection is essential before severe anemia sets in.',
      'Do NOT work or stress anemic cows with labored breathing.',
      'Do NOT use contaminated needles across multiple cows during herd treatment.'
    ],
    emergencySigns: [
      'Severely pale, chalk-white, or jaundiced (yellow) eye membranes and gums',
      'Massively swollen lymph nodes in the front of the shoulder or knee',
      'Rapid breathing with froth at nostrils (pulmonary edema)',
      'High persistent fever (105-106°F) and complete loss of appetite'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Specific antiprotozoal chemotherapy with Buparvaquone (2.5 mg/kg IM) combined with long-acting oxytetracycline and blood transfusions in severe anemia.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_theileria',
    vaccineScheduleReference: 'Single dose with Rakshavac-T tissue culture vaccine in calves >2 months old with antibiotic cover.',
    farmerFriendlyExplanation:
      'Theileriosis (Tick Fever) is a protozoal blood disease spread by ticks that destroys red blood cells and causes high fever, swollen lymph glands, and pale white gums in crossbred cows. Early veterinary treatment with antiprotozoal medicine and regular tick control saves the animal.',
    references: {
      sourceName: 'ICAR-IVRI Protozoan Diseases Protocol',
      authority: 'Indian Council of Agricultural Research',
      lastReviewed: '2026-08-01'
    }
  },

  dis_rabies: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'FATAL ZOONOTIC EMERGENCY: Immediately isolate the suspected animal in a sturdy, locked, escape-proof stall. Do NOT place hands inside the animal’s mouth or attempt to remove imagined choking objects or bones. Anyone bitten or exposed to saliva must immediately wash wounds with soap and running water for 15 minutes and seek human post-exposure rabies vaccination.',
    supportiveCareSteps: [
      {
        title: 'Zero Oral Contact & Lock Stall',
        desc: 'Never reach into the mouth of a salivating or choking animal. Rabies in cattle often mimics throat choking (bone stuck in throat).',
        icon: 'AlertTriangle',
        category: 'SEPARATION'
      },
      {
        title: 'Human Wound Washing (15 Minutes)',
        desc: 'Anyone exposed to saliva or bite wounds must immediately wash the area with soap and flowing water for at least 15 minutes and go to a hospital for post-exposure prophylaxis.',
        icon: 'Droplets',
        category: 'HYGIENE'
      },
      {
        title: 'Notify Veterinary & Medical Officers',
        desc: 'Immediately report the case to veterinary and public health authorities for quarantine and human contact tracing.',
        icon: 'Shield',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      '100% FATAL ZOONOTIC VIRUS: Transmissible to humans and all warm-blooded animals through saliva and bites.',
      'Cattle frequently present with the "dumb/paralytic" form: continuous bellowing, salivation, straining, and throat paralysis often mistaken for choking.',
      'Once neurological signs appear, the disease is invariably fatal.'
    ],
    thingsToAvoid: [
      'Do NOT put fingers or hands in the mouth of a drooling or bellowing cow.',
      'Do NOT consume raw milk from a rabid animal.',
      'Do NOT slaughter or skin a rabid animal for meat or leather.',
      'Do NOT allow other farm animals or pets near the isolated animal.'
    ],
    emergencySigns: [
      'Abnormal persistent hoarse bellowing, vocalization, and yawning',
      'Excessive stringy drooling, unable to swallow water or feed',
      'Hyper-excitability, aggressive head butting, tremors, or hind-leg paralysis',
      'History of dog, jackal, or wild predator bite within the last 1 to 6 months'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Mandatory containment. If exposed to a bite, administer immediate Post-Exposure Prophylaxis (PEP) rabies vaccination on Day 0, 3, 7, 14, 28 to all exposed animals and human handlers.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_rabies_vet',
    vaccineScheduleReference: 'Post-exposure protocol (Day 0, 3, 7, 14, 28) post-bite; annual pre-exposure booster in high risk areas.',
    farmerFriendlyExplanation:
      'Rabies is a deadly viral disease transmitted by the bite of an infected dog or wild animal. In cattle, it often looks like choking, drooling, and unusual bellowing. Because it is fatal and can pass to humans through saliva, never put your hands in the mouth of a salivating cow, wash any bite wounds with soap for 15 minutes, and seek hospital care immediately.',
    references: {
      sourceName: 'WHO Expert Consultation on Rabies & WOAH Terrestrial Manual',
      authority: 'World Health Organization (WHO) / WOAH',
      lastReviewed: '2026-08-01'
    }
  },

  dis_asf: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'CRITICAL SWINE NOTIFIABLE EMERGENCY: Isolate the entire piggery immediately. Do NOT move, sell, or transport live pigs, pork, or swill feed. African Swine Fever is a catastrophic viral disease with up to 100% mortality in pigs. There is currently no routinely approved commercial vaccine or treatment available globally. Contact state veterinary officers immediately.',
    supportiveCareSteps: [
      {
        title: 'Total Farm Quarantine & Biosecurity',
        desc: 'Halt all entry and exit of people, vehicles, and pigs. Disinfect vehicle tires with 2% Virkon S or citric acid.',
        icon: 'AlertTriangle',
        category: 'SEPARATION'
      },
      {
        title: 'Zero Swill Feeding',
        desc: 'Never feed hotel food scraps, kitchen waste, or uncooked pork products to pigs. Swill feeding is the #1 driver of ASF spread.',
        icon: 'Flame',
        category: 'FEED'
      },
      {
        title: 'Report to State Animal Husbandry',
        desc: 'Notify the government veterinary control room immediately for diagnostic sampling and biosecurity stamping out.',
        icon: 'Shield',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'Extremely high mortality in pigs (nearly 100% in acute cases).',
      'The ASF virus is highly resistant in pork products, curing, and frozen meat for months.',
      'No routinely applicable commercial vaccine is currently deployed for general field use.'
    ],
    thingsToAvoid: [
      'Do NOT feed untreated hotel swill or food waste to pigs.',
      'Do NOT sell, hide, or throw dead pigs into rivers, ditches, or roadsides.',
      'Do NOT visit other pig farms if your herd shows high fever or red skin patches.',
      'Do NOT slaughter sick pigs for home consumption or local sales.'
    ],
    emergencySigns: [
      'Sudden high fever (105-107°F) with multiple pigs dying rapidly within 2-5 days',
      'Dark red, purple, or cyanotic skin blotches on ears, snout, belly, and tail',
      'Bloody diarrhea, vomiting, and coughing',
      'Pigs huddled together in shivering clumps, reluctant to stand'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'National notifiable emergency. Official veterinary authorities will enforce stamping out, perimeter sanitization, and compensation protocols under National Action Plan for ASF.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'No standard commercial vaccine available globally for routine field use.',
    farmerFriendlyExplanation:
      'African Swine Fever is an extremely deadly viral disease of pigs that causes high fever, purple skin patches, bleeding, and sudden deaths across the piggery. There is no vaccine or medicine for it, so strict biosecurity—never feeding kitchen food waste (swill) and stopping all pig movements—is the only way to protect herds.',
    references: {
      sourceName: 'WOAH Terrestrial Manual & National Action Plan for ASF (DAHD)',
      authority: 'World Organisation for Animal Health (WOAH) / DAHD India',
      lastReviewed: '2026-08-01'
    }
  },

  dis_csf: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Isolate febrile pigs in a clean, dry, well-ventilated pen. Provide fresh drinking water with electrolytes and digestible warm grain gruel. Disinfect pens with 2% sodium hydroxide solution. Keep uninfected pigs isolated and coordinate emergency vaccination for healthy stock.',
    supportiveCareSteps: [
      {
        title: 'Clean Water & Electrolytes',
        desc: 'Supply fresh drinking water with electrolyte salts to combat dehydration and high fever.',
        icon: 'Droplets',
        category: 'WATER'
      },
      {
        title: 'Disinfection & Isolation',
        desc: 'Isolate sick pigs and disinfect footwear with 2% sodium hydroxide before entering other pig sheds.',
        icon: 'Shield',
        category: 'SEPARATION'
      }
    ],
    careWarnings: [
      'Highly contagious viral disease of pigs causing high mortality in young piglets.',
      'Can cause reproductive failures, stillbirths, and tremors in newborn litters.'
    ],
    thingsToAvoid: [
      'Do NOT allow unvetted swill feeding.',
      'Do NOT mix sick pigs with newly purchased breeding stock.'
    ],
    emergencySigns: [
      'High fever with huddled shivering pigs',
      'Button ulcers in intestine / purpura on skin of abdomen and ears',
      'Conjunctivitis with eyelids glued shut with sticky pus'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Veterinary confirmation via RT-PCR or ELISA. Routine vaccination of breeding stock with live attenuated CSF vaccine.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_csf_swine',
    vaccineScheduleReference: 'Annual vaccination of breeding stock and piglets at 2-3 months with live tissue culture CSF vaccine.',
    farmerFriendlyExplanation:
      'Classical Swine Fever (Hog Cholera) causes high fever, sticky eyes, and purple spots on pigs. Regular vaccination of all piglets at 2-3 months and good farm cleanliness keeps the herd safe.',
    references: {
      sourceName: 'ICAR-National Research Centre on Pig & WOAH',
      authority: 'ICAR / WOAH',
      lastReviewed: '2026-08-01'
    }
  },

  dis_hpai: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'HIGH PRIORITY ZOONOTIC EMERGENCY: Immediately seal the poultry shed. Do NOT touch dead birds with bare hands. Wear N95 masks and rubber gloves. Do not sell birds, eggs, or poultry manure. Immediately notify the District Animal Husbandry department for testing and official biosecurity containment.',
    supportiveCareSteps: [
      {
        title: 'Zero Movement & Mask Protection',
        desc: 'Wear N95 respirators and gloves. Strictly forbid entry or exit of birds, eggs, and personnel.',
        icon: 'AlertTriangle',
        category: 'SEPARATION'
      },
      {
        title: 'Emergency State Hotline Alert',
        desc: 'Call the district avian influenza control hotline immediately.',
        icon: 'Shield',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'ZOONOTIC THREAT: Certain H5N1 / H5N8 strains can cause severe, potentially fatal respiratory disease in humans.',
      'Flocks experience sudden massive mortality reaching 90-100% within 48 hours.'
    ],
    thingsToAvoid: [
      'Do NOT handle dead poultry without masks and gloves.',
      'Do NOT sell dead or sick chickens to live bird markets or for human food.',
      'Do NOT dump dead poultry into rivers or open fields.'
    ],
    emergencySigns: [
      'Sudden mass death of poultry without prior warning',
      'Cyanotic (dark purple) swollen combs and wattles',
      'Swollen heads and severe watery diarrhea in birds'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Official stamping out policy within 1-10 km surveillance zones under National Action Plan for Avian Influenza.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'Routine vaccination prohibited in many stamping-out jurisdictions; check local veterinary policy.',
    farmerFriendlyExplanation:
      'Bird Flu (Avian Influenza) is a severe viral disease of poultry that can also infect humans. It causes sudden mass bird deaths and swollen purple combs. Always wear a mask and gloves, do not touch dead birds, and alert animal health officers immediately.',
    references: {
      sourceName: 'WHO/WOAH Avian Influenza Global Surveillance Guidelines',
      authority: 'World Health Organization (WHO) / WOAH',
      lastReviewed: '2026-08-01'
    }
  },

  dis_goat_pox: {
    homeCareAllowed: true,
    homeCareLevel: 'SAFE_SUPPORTIVE',
    supportiveCare:
      'Provide soft digestible green fodder and clean water with electrolytes. Apply antiseptic ointment or gentian violet to pock lesions on hairless body areas. Isolate sick goats in clean, dry shelter to prevent flock spread.',
    supportiveCareSteps: [
      {
        title: 'Wound Care on Pock Scabs',
        desc: 'Apply gentian violet or veterinary antiseptic cream to broken skin papules to prevent maggots.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      },
      {
        title: 'Flock Isolation',
        desc: 'Keep infected goats separated from healthy stock until all scabs have healed and dropped off.',
        icon: 'Shield',
        category: 'SEPARATION'
      }
    ],
    careWarnings: [
      'High mortality in young kids and lambs.',
      'Can cause severe papular lesions in lungs and digestive tract in virulent outbreaks.'
    ],
    thingsToAvoid: [
      'Do NOT squeeze or scrape off unbroken skin scabs.',
      'Do NOT mix sick kids with breeding does.'
    ],
    emergencySigns: [
      'High fever with widespread hard circular skin eruptions over inner thighs, ears, and under tail',
      'Severe respiratory grunting and pneumonic breathing'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Supportive antibiotic therapy to prevent secondary bacterial pneumonia; annual vaccination of healthy flock members.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_goatpox_live',
    vaccineScheduleReference: 'Annual pre-winter vaccination with live attenuated Goat Pox vaccine in stock >3 months.',
    farmerFriendlyExplanation:
      'Goat Pox causes fever and small red bumps and scabs on hairless skin areas of goats and sheep. Isolating the animal, cleaning skin scabs, providing soft fodder, and annual vaccination protects your flock.',
    references: {
      sourceName: 'WOAH Terrestrial Manual & IVRI Compendium',
      authority: 'WOAH / ICAR-IVRI',
      lastReviewed: '2026-08-01'
    }
  },

  dis_tb: {
    homeCareAllowed: false,
    homeCareLevel: 'VETERINARY_ONLY',
    supportiveCare:
      'ZOONOTIC CHRONIC ILLNESS: Isolate the animal in a well-ventilated shed. All milk must be boiled or pasteurized before any human or animal consumption. Coordinate with the veterinary officer for single intradermal tuberculin testing and herd screening.',
    supportiveCareSteps: [
      {
        title: 'Boil or Pasteurize All Milk',
        desc: 'Mycobacterium bovis passes in milk and causes extrapulmonary tuberculosis in humans (especially children). Always boil farm milk.',
        icon: 'Flame',
        category: 'HYGIENE'
      },
      {
        title: 'Herd Skin Testing by Vet',
        desc: 'Arrange single intradermal comparative cervical tuberculin testing (SICTT) for the entire herd.',
        icon: 'Activity',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'ZOONOTIC HAZARD: Major source of human non-pulmonary tuberculosis.',
      'Chronic wasting disease that slowly spreads through herd air droplets over months and years.'
    ],
    thingsToAvoid: [
      'Do NOT drink raw, unboiled milk from infected or untested cows.',
      'Do NOT house cattle in dark, unventilated, overcrowded sheds.'
    ],
    emergencySigns: [
      'Progressive chronic emaciation and weight loss despite normal feeding',
      'Persistent dry hacking cough and enlarged painless lymph nodes'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Test-and-segregate or cull policy as per national veterinary guidelines. Human household contacts should undergo tuberculosis screening.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'BCG vaccine not routinely used in livestock due to interference with diagnostic skin testing.',
    farmerFriendlyExplanation:
      'Bovine Tuberculosis is a chronic, slow-developing disease that causes persistent coughing and weight loss in cattle. Because it can spread to people through raw milk, always boil milk thoroughly and have your herd tested by a vet.',
    references: {
      sourceName: 'WOAH Terrestrial Manual & Stop TB Partnership',
      authority: 'WOAH / WHO',
      lastReviewed: '2026-08-01'
    }
  },

  dis_babesiosis: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Keep the animal in a cool, quiet shaded stall away from heat and stress. Supply clean water, green fodder, and liver tonics with iron supplements under veterinary instruction. Implement strict tick control on all animals using pour-on or spray acaricides.',
    supportiveCareSteps: [
      {
        title: 'Rest in Shaded Pen',
        desc: 'Severe red blood cell destruction causes oxygen starvation. Minimize all physical movement and keep cool.',
        icon: 'Shield',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Tick Eradication on Herd',
        desc: 'Apply tick sprays (e.g. amitraz or deltamethrin) to remove Rhipicephalus hard ticks that transmit the parasite.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      }
    ],
    careWarnings: [
      'Causes rapid destruction of red blood cells leading to red/brown urine (coffee colored) and severe anemia.',
      'Can trigger acute abortion in pregnant dairy cows.'
    ],
    thingsToAvoid: [
      'Do NOT make the animal walk long distances to pasture.',
      'Do NOT delay antiprotozoal veterinary therapy — early Diminazene injection is life-saving.'
    ],
    emergencySigns: [
      'Dark red, coffee, or wine-colored urine (hemoglobinuria)',
      'High persistent fever (105-106°F) and extreme pale yellow mucous membranes'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Immediate antiprotozoal injection: Diminazene Aceturate (3.5 mg/kg IM) or Imidocarb Dipropionate (1.2 mg/kg SC) plus supportive fluids.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'Live blood vaccines used in select endemic countries; not globally standardized for routine use.',
    farmerFriendlyExplanation:
      'Babesiosis (Redwater Fever) is a tick-borne blood parasite that breaks down red blood cells, causing high fever, weakness, and dark red or coffee-colored urine. Early veterinary injection of antiprotozoal medicine cures the infection.',
    references: {
      sourceName: 'ICAR-IVRI Veterinary Protozoology Manual',
      authority: 'ICAR',
      lastReviewed: '2026-08-01'
    }
  },

  dis_anaplasmosis: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Provide soft green fodder, fresh water, and supportive hematinic iron supplements. Ensure quiet, calm handling to prevent cardiovascular collapse from severe anemia. Practice strict fly and tick control and use separate sterile needles for every injection.',
    supportiveCareSteps: [
      {
        title: 'Gentle Handling & Rest',
        desc: 'Avoid exciting or driving the animal. Severe anemia causes rapid heart strain.',
        icon: 'Shield',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Single-Use Sterile Needles',
        desc: 'Always change needles between animals. Reusing needles is a primary way farmers accidentally spread Anaplasma across the herd.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      }
    ],
    careWarnings: [
      'Unlike Babesiosis, urine remains normal yellow (no hemoglobinuria), but eyes and gums become deeply jaundiced/yellow.',
      'Biting horseflies and reused hypodermic needles spread the bacteria rapidly.'
    ],
    thingsToAvoid: [
      'Do NOT reuse hypodermic needles across multiple cows during routine injections.',
      'Do NOT stress or force the animal to exert itself.'
    ],
    emergencySigns: [
      'Deep yellow/jaundiced mucous membranes in eyes and vulva with pale gums',
      'Sudden severe milk drop, rapid weight loss, and muscle weakness'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Long-acting Oxytetracycline (20 mg/kg IM or IV) combined with supportive liver extract and iron multivitamins.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'Anaplasma centrale live vaccine used in select countries; vector control and clean needle hygiene are primary defense.',
    farmerFriendlyExplanation:
      'Anaplasmosis (Gall Sickness) is an infection spread by ticks and dirty injection needles that makes cows severely anemic and yellow (jaundice). It is treated with specific antibiotics from a vet and prevented by using new clean needles for every cow.',
    references: {
      sourceName: 'WOAH Terrestrial Manual on Bovine Anaplasmosis',
      authority: 'WOAH',
      lastReviewed: '2026-08-01'
    }
  },

  dis_trypanosomiasis: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Provide shaded resting quarters, fresh green forage, and plenty of clean water. Spray cattle backs and shed walls with fly repellents to eliminate biting horseflies (Tabanids) and stable flies. Provide supportive iron-rich feed.',
    supportiveCareSteps: [
      {
        title: 'Horsefly (Tabanid) Control',
        desc: 'Apply fly repellents and light smoke coils in the evening to keep biting flies away from animals.',
        icon: 'Wind',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Nutritious Diet & Water',
        desc: 'Provide high-quality soft grass and clean water to counter muscle wasting and weakness.',
        icon: 'Droplets',
        category: 'FEED'
      }
    ],
    careWarnings: [
      'Particularly severe and often fatal in camels and horses; causes chronic wasting and fever spikes in cattle.',
      'Transmitted mechanically by large biting horseflies during monsoon season.'
    ],
    thingsToAvoid: [
      'Do NOT graze animals near marshy fly-infested woodlands during peak afternoon fly biting hours.',
      'Do NOT work sick bullocks or camels while they are febrile.'
    ],
    emergencySigns: [
      'Intermittent recurring fever spikes with edematous swelling of lower legs and throat',
      'Severe progressive emaciation despite feeding, corneal cloudiness/opacity, and circling'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Specific trypanocidal chemotherapy with Quinapyramine sulfate/chloride, Melarsomine, or Isometamidium under strict veterinary dose control.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'No commercial vaccine available due to variant surface glycoprotein switching. Fly control is key.',
    farmerFriendlyExplanation:
      'Surra (Trypanosomiasis) is a blood parasite spread by large biting horseflies that causes recurring fevers, swelling around the legs/throat, and severe weight loss. Because there is no vaccine, protecting animals from horseflies and getting prompt veterinary medicine is vital.',
    references: {
      sourceName: 'WOAH Terrestrial Manual & ICAR Surra Guidelines',
      authority: 'WOAH / ICAR',
      lastReviewed: '2026-08-01'
    }
  },

  dis_brdc: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'House calves in clean, dry, well-ventilated stalls free from cold drafts and ammonia odor. Provide warm clean water and palatable soft hay or green grass. Ensure low stocking density and reduce transport/handling stress.',
    supportiveCareSteps: [
      {
        title: 'Clean Draft-Free Ventilation',
        desc: 'Ensure continuous fresh airflow without cold drafts. Remove wet manure promptly to keep ammonia fumes low.',
        icon: 'Wind',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Hydration & Palatable Feed',
        desc: 'Provide easy access to fresh water and high quality palatable calf starter or green fodder.',
        icon: 'Droplets',
        category: 'FEED'
      }
    ],
    careWarnings: [
      'Stress from weaning, transport, sudden cold weather, or overcrowding triggers acute outbreaks.',
      'Early treatment prevents permanent fibrous lung scarring.'
    ],
    thingsToAvoid: [
      'Do NOT house calves in stuffy, closed, damp sheds with strong ammonia fumes.',
      'Do NOT mix newly arrived market cattle directly with resident calves without quarantine.'
    ],
    emergencySigns: [
      'Rapid abdominal shallow breathing with extended head and flared nostrils',
      'Persistent moist cough with thick yellowish nasal mucus and high fever >104°F'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Early veterinary antibiotic therapy (e.g. Florfenicol, Tulathromycin, or Ceftiofur) coupled with veterinary anti-inflammatory medicine.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_brdc_multivalent',
    vaccineScheduleReference: 'Vaccinate calves 2-3 weeks prior to weaning, transport, or seasonal cold weather with multivalent respiratory vaccine.',
    farmerFriendlyExplanation:
      'Bovine Respiratory Disease (Shipping Fever / Pneumonia) causes fever, coughing, and breathing difficulty, often triggered by cold weather or travel stress. Providing warm, dry, well-ventilated shelter and prompt veterinary medicine helps young stock recover.',
    references: {
      sourceName: 'American Association of Bovine Practitioners (AABP) & IVRI',
      authority: 'AABP / ICAR-IVRI',
      lastReviewed: '2026-08-01'
    }
  },

  dis_enterotoxemia: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'EMERGENCY: Immediately withhold all grain concentrates and lush green pasture. Offer only dry coarse roughage or straw. Keep the animal in a quiet, padded pen. Contact veterinarian for anti-toxin, bloat relief, and anticlostridial therapy.',
    supportiveCareSteps: [
      {
        title: 'Stop Concentrates & Grains Immediately',
        desc: 'Immediately stop feeding high-grain rations or lush irrigated clover/alfalfa. Clostridium toxins thrive on rich feed.',
        icon: 'Flame',
        category: 'FEED'
      },
      {
        title: 'Urgent Veterinary Dispatch',
        desc: 'Call a veterinarian immediately for Clostridial antitoxin and supportive medication.',
        icon: 'AlertTriangle',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'Often strikes the fastest-growing, healthiest lambs, kids, and calves.',
      'Epsilon toxin causes rapid neurological convulsions and sudden death within hours.'
    ],
    thingsToAvoid: [
      'Do NOT make sudden abrupt switches from dry feed to lush green irrigated pasture or heavy grain feeding.',
      'Do NOT drench bloated, seizing animals.'
    ],
    emergencySigns: [
      'Sudden death of thriving lambs or kids with no prior signs',
      'Head retracted backwards (opisthotonos), paddling legs, teeth grinding, and convulsions'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Emergency administration of Clostridium perfringens Type D antitoxin, hypertonic dextrose, and oral antacids; transition flock diet to high-fiber forage.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_enterotoxemia_bacterin',
    vaccineScheduleReference: 'Vaccinate flock annually before monsoon or spring flush of green grass with Enterotoxemia vaccine.',
    farmerFriendlyExplanation:
      'Enterotoxemia (Pulpy Kidney / Overeating Disease) is a sudden bacterial poisoning that happens when sheep, goats, or calves eat too much rich grain or lush green pasture. It can cause sudden death, so gradual diet changes and annual vaccination are essential.',
    references: {
      sourceName: 'Central Sheep and Wool Research Institute (CSWRI) & IVRI',
      authority: 'CSWRI / ICAR',
      lastReviewed: '2026-08-01'
    }
  },

  dis_cbpp: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'HIGH PRIORITY NOTIFIABLE DISEASE: Strictly isolate the animal in a well-ventilated quarantine stall. Halt all cattle movement and contact regional livestock authorities immediately for formal contagious pleuropneumonia diagnostic screening.',
    supportiveCareSteps: [
      {
        title: 'Strict Herd Quarantine',
        desc: 'Prevent all contact between affected and healthy cattle. Aerosols spread through coughing up to tens of meters.',
        icon: 'Shield',
        category: 'SEPARATION'
      },
      {
        title: 'Notify District Veterinary Authority',
        desc: 'Report suspected cases immediately to animal disease control teams.',
        icon: 'AlertTriangle',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'Highly infectious mycoplasmal disease causing severe lung necrosis and chest fluid buildup.',
      'Recovered cattle can become chronic "lunger" carriers that shed bacteria for years.'
    ],
    thingsToAvoid: [
      'Do NOT transport or sell coughing cattle in open markets.',
      'Do NOT house cattle in overcrowded, dusty enclosures.'
    ],
    emergencySigns: [
      'Painful shallow breathing with elbows turned outward, extended neck, and loud grunting on expiration',
      'Severe productive cough, frothy saliva, and high fever'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Strict official movement control and herd testing. Antibiotic therapy is often restricted by veterinary authorities to avoid creating chronic carrier states.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'T1/44 live vaccine used in select eradication zones under official veterinary control.',
    farmerFriendlyExplanation:
      'Contagious Bovine Pleuropneumonia (CBPP) is a severe lung infection in cattle that causes painful coughing and fluid around the lungs. Strict quarantine and reporting to veterinary officers stops it from spreading to other herds.',
    references: {
      sourceName: 'FAO Animal Health Manual on CBPP & WOAH',
      authority: 'FAO / WOAH',
      lastReviewed: '2026-08-01'
    }
  },

  dis_mastitis: {
    homeCareAllowed: true,
    homeCareLevel: 'LIMITED_SUPPORTIVE',
    supportiveCare:
      'Gently strip affected quarters frequently (every 2-3 hours) into a discard bucket to remove bacteria and toxic flakes. Apply cold water compresses or ice packs to the hot, swollen udder to reduce inflammation and pain. Always milk healthy cows first and the mastitic cow last. Ensure milking stalls and bedding are clean, dry, and sanitized with lime powder.',
    supportiveCareSteps: [
      {
        title: 'Frequent Milking Out & Stripping',
        desc: 'Strip the infected quarter completely every 2-3 hours into a separate bucket and discard safely. Do not let toxic milk stay in the teat.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      },
      {
        title: 'Cold Water Udder Compresses',
        desc: 'Apply cool water sponges or ice packs to hot, inflamed quarters for 10-15 minutes to ease swelling and pain.',
        icon: 'Droplets',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Dry, Sanitized Bedding & Teat Dipping',
        desc: 'Keep stall floors clean and dusted with dry slaked lime. Dip all teats in 0.5% povidone-iodine teat dip before and after milking.',
        icon: 'Shield',
        category: 'HYGIENE'
      },
      {
        title: 'Milk Order: Sick Cow Last',
        desc: 'Always milk young, healthy cows first and infected cows last to prevent cross-contamination by hand or milking machines.',
        icon: 'Layers',
        category: 'SEPARATION'
      }
    ],
    careWarnings: [
      'Delay in treating clinical mastitis can cause permanent quarter blindness (loss of teat function) or fatal endotoxic shock.',
      'Never mix mastitic milk with bulk dairy tank milk or feed unpasteurized infected milk to young calves.'
    ],
    thingsToAvoid: [
      'Do NOT leave milk clots and mastitic milk unstripped inside the udder.',
      'Do NOT allow wet, dirty manure-laden bedding where cows lie down after milking (teat canals remain open for 30 minutes).',
      'Do NOT use harsh caustic udder salves or non-sterile teat tubes.',
      'Do NOT drink or sell milk from cows undergoing antibiotic treatment during the withdrawal period.'
    ],
    emergencySigns: [
      'Udder quarter is stone-hard, swollen, hot, and purple/cold (gangrenous mastitis)',
      'Milk is watery, yellow-brown, bloody, or contains thick clotted curd flakes',
      'Cow is shivering with high fever (>104°F) and cannot stand'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Intramammary antibiotic infusion following strict aseptic teat cleaning, coupled with systemic veterinary antibiotics and anti-inflammatory NSAIDs. Milk sample should undergo culture and sensitivity testing.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'No single universal routine vaccine. Herd prevention relies on strict milking hygiene, dry cow therapy, and post-milking teat dips.',
    farmerFriendlyExplanation:
      'Mastitis (Thanela) is an inflammation of the udder caused by bacteria entering the teat canal. Emptying the infected quarter frequently, applying cold compresses, keeping the barn floor dry with lime, dipping teats in antiseptic, and getting intramammary medicine from a vet protects milk yield and saves the cow’s udder.',
    references: {
      sourceName: 'National Dairy Development Board (NDDB) & ICAR-IVRI Mastitis Advisory',
      authority: 'NDDB / ICAR-IVRI',
      lastReviewed: '2026-08-01'
    }
  },

  dis_tetanus: {
    homeCareAllowed: false,
    homeCareLevel: 'EMERGENCY_ONLY',
    supportiveCare:
      'EMERGENCY: Place the animal in a completely dark, quiet, padded stall with minimal noise, light, and movement, as sudden sounds trigger violent muscle spasms. Do NOT force feed. Locate and clean any deep puncture wounds or foot cracks with hydrogen peroxide. Emergency veterinary administration of Tetanus Antitoxin (TAT), muscle relaxants, and penicillin is urgently needed.',
    supportiveCareSteps: [
      {
        title: 'Dark, Silent Padded Pen',
        desc: 'Place the animal in a dark, quiet room with soft straw bedding. Light and noise trigger painful tetanic convulsions.',
        icon: 'Shield',
        category: 'ENVIRONMENT'
      },
      {
        title: 'Wound Debridement & Oxygenation',
        desc: 'Thoroughly wash and expose deep nail punctures or wound cracks with 3% hydrogen peroxide. Tetanus bacteria are anaerobic and die with oxygen.',
        icon: 'Sparkles',
        category: 'HYGIENE'
      },
      {
        title: 'Emergency Vet Dispatch for Antitoxin',
        desc: 'Call the veterinarian immediately for Tetanus Antitoxin (TAT) to neutralize circulating toxins before they bind irreversibly to nerves.',
        icon: 'AlertTriangle',
        category: 'MONITORING'
      }
    ],
    careWarnings: [
      'Tetanus toxin binds permanently to motor nerve endings, causing lockjaw and rigid paralysis.',
      'High mortality if Tetanus Antitoxin and muscle relaxants are not given promptly.',
      'Follows deep nail punctures, castration, dehorning, or umbilical infections.'
    ],
    thingsToAvoid: [
      'Do NOT shout, bang gates, or shine bright torches near the animal (spasm triggers).',
      'Do NOT force drench fluids into the rigid locked jaw (choking risk).',
      'Do NOT perform castrations or wound treatments with dirty unsterilized blades.'
    ],
    emergencySigns: [
      'Rigid sawhorse stance with all four legs stiff and tail elevated',
      'Lockjaw (trismus) — inability to open the mouth or chew',
      'Third eyelid (nictitating membrane) flickering or covering the eye when startled'
    ],
    veterinaryRequired: true,
    emergencyGuidance:
      'Immediate IV/IM Tetanus Antitoxin (10,000 to 50,000 IU), high dose procaine penicillin, sedatives (diazepam/xylazine), and IV fluid support.',
    vaccineAvailable: true,
    primaryVaccineId: 'vac_tetanus_toxoid',
    vaccineScheduleReference: 'Routine Tetanus Toxoid vaccination in equines and valuable livestock; booster after surgical procedures or deep puncture wounds.',
    farmerFriendlyExplanation:
      'Tetanus (Dhanusthambha / Lockjaw) is a severe bacterial infection from deep dirty wounds that makes the animal’s whole body stiff like a wooden sawhorse and locks the jaw shut. Keeping the animal in a dark, quiet pen and getting emergency veterinary antitoxin and penicillin is crucial to save its life.',
    references: {
      sourceName: 'British Equine Veterinary Association & IVRI Compendium',
      authority: 'BEVA / ICAR-IVRI',
      lastReviewed: '2026-08-01'
    }
  },

  dis_orf: {
    homeCareAllowed: true,
    homeCareLevel: 'SAFE_SUPPORTIVE',
    supportiveCare:
      'ZOONOTIC PRECAUTION: Always wear gloves when touching or treating lesions. Apply mild antiseptic ointment, zinc oxide, or gentian violet to crusty scabs on the lips and muzzle. Provide soft green fodder and warm milk gruel to ease nursing pain for young lambs and kids. Separate affected sheep/goats from nursing mothers with uninfected teats.',
    supportiveCareSteps: [
      {
        title: 'Wear Gloves During Care',
        desc: 'Always wear disposable gloves. The Orf parapoxvirus can infect human fingers causing painful skin nodules (Milker’s nodule).',
        icon: 'Shield',
        category: 'HYGIENE'
      },
      {
        title: 'Gentle Antiseptic Scab Dressing',
        desc: 'Apply gentian violet 1% or zinc oxide ointment to crusty lip lesions to soften scabs and prevent fly strike (maggots).',
        icon: 'Sparkles',
        category: 'HYGIENE'
      },
      {
        title: 'Soft Palatable Gruel & Milk Support',
        desc: 'Offer soft green fodder, warm milk, or gruel. Painful scabs on lips prevent young lambs from nursing.',
        icon: 'Droplets',
        category: 'FEED'
      }
    ],
    careWarnings: [
      'ZOONOTIC POTENTIAL: Can cause painful localized skin granulomas on human hands (Orf / Contagious Pustular Dermatitis).',
      'Lambs and kids with sore mouths cannot suckle and may starve without nutritional support.'
    ],
    thingsToAvoid: [
      'Do NOT pick or tear off dry crusty lip scabs forcibly (causes bleeding and spreading).',
      'Do NOT allow infected kids to nurse on healthy foster mothers (transmits scabs to udder teats).',
      'Do NOT touch lesions with bare hands.'
    ],
    emergencySigns: [
      'Severe proliferative cauliflower-like bloody scabs spreading inside the mouth, gums, and tongue',
      'Young lambs severely emaciated and too weak to stand due to starvation',
      'Ewes developing severe gangrenous mastitis from infected nursing lambs'
    ],
    veterinaryRequired: false,
    emergencyGuidance:
      'Self-limiting viral disease that usually resolves in 3-4 weeks with good supportive care. Veterinary intervention is needed if secondary bacterial infection or maggot infestation occurs.',
    vaccineAvailable: false,
    vaccineScheduleReference: 'Live scarification vaccines used in high-challenge commercial flocks under veterinary supervision; autogenous flock management.',
    farmerFriendlyExplanation:
      'Orf (Contagious Ecthyma / Sore Mouth) is a viral condition that causes crusty scabs around the lips and nostrils of young sheep and goats. It can pass to human hands, so always wear gloves, apply gentian violet to the scabs, and feed soft gruel to help young lambs eat while they heal.',
    references: {
      sourceName: 'WOAH Terrestrial Manual on Contagious Ecthyma',
      authority: 'WOAH',
      lastReviewed: '2026-08-01'
    }
  }
};
