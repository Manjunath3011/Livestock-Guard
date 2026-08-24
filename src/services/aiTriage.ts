import { SymptomObservation } from '../types';
import { SYMPTOMS_LIST } from '../data/knowledgeBase';

interface ExtractedTriage {
  symptoms: SymptomObservation[];
  extractedKeywords: string[];
  suggestedSeverity: 'mild' | 'moderate' | 'severe';
  confidenceScore: number;
}

const SYMPTOM_KEYWORDS_MAP: Record<string, string[]> = {
  sym_fever: ['fever', 'hot', 'temperature', 'tap', 'jwar', 'bukhar', 'jvara', 'high temp'],
  sym_appetite_loss: ['not eating', 'refusing feed', 'anorexia', 'appetite', 'bhookh', 'chara nahi', 'food refusal'],
  sym_weakness: ['weak', 'lethargic', 'drooping', 'tired', 'down', 'kamzori', 'dull', 'depressed', 'lying down'],
  sym_weight_loss: ['weight loss', 'skinny', 'thin', 'bones', 'emaciated', 'wasting'],
  sym_reduced_milk: ['milk dropped', 'less milk', 'milk reduction', 'doodh kam', 'drop in milk', 'lactation stopped', 'low yield'],
  sym_salivation: ['saliva', 'drooling', 'drool', 'froth', 'slaver', 'mouth water', 'lar', 'lip smacking', 'foam'],
  sym_mouth_lesions: ['mouth blisters', 'tongue sores', 'blisters on mouth', 'mouth ulcers', 'chhale', 'raw tongue', 'vesicles on gums', 'sores'],
  sym_foot_lesions: ['foot sores', 'hoof blisters', 'claw lesions', 'interdigital sores', 'khur', 'hoof ulcer', 'sores between toes'],
  sym_lameness: ['lame', 'limping', 'cannot walk', 'shifting weight', 'leg pain', 'langda', 'unable to stand', 'kicking leg'],
  sym_skin_nodules: ['nodules', 'lumps', 'skin balls', 'knots on skin', 'ganth', 'hard bumps', 'skin swellings'],
  sym_skin_lesions: ['scabs', 'crusting', 'papules', 'skin sores', 'rash', 'peeling skin'],
  sym_edema: ['swollen neck', 'throat swelling', 'dewlap swelling', 'brisket swelling', 'galgodu', 'jaw fluid', 'puffy neck'],
  sym_cough: ['cough', 'coughing', 'grunting', 'khansi', 'hacking'],
  sym_breathing_diff: ['breathing hard', 'open mouth breathing', 'rapid breath', 'gasping', 'dyspnea', 'saans', 'flared nostrils', 'panting'],
  sym_nasal_discharge: ['running nose', 'nasal mucus', 'snot', 'bloody nose', 'yellow discharge', 'chheenk'],
  sym_eye_discharge: ['eye discharge', 'tearing', 'cloudy eye', 'red eye', 'lacrimation', 'conjunctivitis', 'aankh'],
  sym_diarrhea: ['diarrhea', 'loose motion', 'watery stool', 'scours', 'patla gobar', 'dast'],
  sym_bloody_diarrhea: ['blood in stool', 'bloody dung', 'red diarrhea', 'bloody scours', 'khooni dast'],
  sym_swollen_lymph: ['swollen glands', 'large lymph nodes', 'glands near neck', 'prefemoral swelling'],
  sym_abortion: ['aborted', 'lost pregnancy', 'premature calf', 'stillborn', 'garbhpat', 'retained placenta'],
  sym_mastitis_signs: ['swollen udder', 'hard udder', 'blood in milk', 'clotted milk', 'flakes in milk', 'thanaili', 'hot teat'],
  sym_sudden_death: ['sudden death', 'died suddenly', 'found dead', 'peracute death', 'achanak maut'],
  sym_bloody_orifices: ['dark blood from nose', 'rectal bleeding', 'unclotted blood', 'orifice bleeding', 'black blood'],
  sym_muscle_crepitus: ['crackling leg', 'gas swelling', 'spongy muscle', 'thigh swelling', 'crepitus', 'blackleg sound'],
  sym_neurological: ['circling', 'shivering', 'seizures', 'tremors', 'mad', 'paralysis', 'head pressing', 'aggressive', 'rabid'],
  sym_anemia_pale: ['pale eyes', 'yellow gums', 'jaundice', 'red urine', 'bloody urine', 'raktmutra', 'white eyes'],
  sym_cyanosis_tongue: ['blue tongue', 'swollen lips', 'purple mouth', 'cyanosis'],
  sym_trismus_lockjaw: ['lockjaw', 'stiff neck', 'sawhorse stance', 'rigid body', 'cannot open mouth', 'tetanus']
};

export function extractSymptomsFromNaturalLanguage(text: string): ExtractedTriage {
  const lower = text.toLowerCase();
  const matchedSymptoms: SymptomObservation[] = [];
  const extractedKeywords: string[] = [];

  let isSevere = false;
  if (
    lower.includes('severe') ||
    lower.includes('critical') ||
    lower.includes('massive') ||
    lower.includes('emergency') ||
    lower.includes('died') ||
    lower.includes('sudden') ||
    lower.includes('heavy') ||
    lower.includes('bahut tez')
  ) {
    isSevere = true;
  }

  const today = new Date().toISOString().split('T')[0];

  for (const [symptomId, keywords] of Object.entries(SYMPTOM_KEYWORDS_MAP)) {
    const foundKw = keywords.find(kw => lower.includes(kw));
    if (foundKw) {
      extractedKeywords.push(foundKw);
      const symObj = SYMPTOMS_LIST.find(s => s.id === symptomId);
      if (symObj) {
        let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
        if (isSevere || symptomId === 'sym_sudden_death' || symptomId === 'sym_bloody_orifices') {
          severity = 'severe';
        }
        matchedSymptoms.push({
          symptomId: symObj.id,
          symptomName: symObj.name,
          severity,
          onsetDate: today
        });
      }
    }
  }

  return {
    symptoms: matchedSymptoms,
    extractedKeywords,
    suggestedSeverity: isSevere ? 'severe' : 'moderate',
    confidenceScore: matchedSymptoms.length > 0 ? Math.min(95, 40 + matchedSymptoms.length * 15) : 0
  };
}
