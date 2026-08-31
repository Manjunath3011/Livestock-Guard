import { Role, RiskLevel, Alert, LanguageCode } from '../types';
import { normalizeRole } from '../auth/roles';
import { store } from '../services/store';

export interface RoleTerminology {
  // Core Clinical & Veterinary Concepts
  symptoms: string;
  symptomsExplanation?: string;
  quarantine: string;
  quarantineExplanation?: string;
  outbreak: string;
  outbreakExplanation?: string;
  riskLevel: string;
  riskLevelExplanation?: string;
  criticalRisk: string;
  highRisk: string;
  moderateRisk: string;
  lowRisk: string;
  criticalRiskSpread: string;
  vaccinationHistory: string;
  vaccinationStatus: string;
  preventiveAction: string;
  preventiveMeasures: string;
  diseaseSurveillance: string;
  clinicalExamination: string;
  suspectedDisease: string;
  possibleDisease: string;
  nearbyCases: string;
  mortality: string;
  laboratoryTest: string;
  sampleCollection: string;
  referral: string;
  advisory: string;
  epidemiologicalRisk: string;
  containmentZone: string;
  mlClassification: string;
  biosecurityProtocol: string;

  // Screening UI & Decision Support Terms
  aiCheck: string;
  aiCheckLabel: string;
  whyFlagged: string;
  whatToDoNow: string;
  decisionSupport: string;
  registeredAnimals: string;
  underObservation: string;
  emergencyHelpline: string;
  fieldVisits: string;
  reportSickAnimal: string;
  myHerd: string;
  caseStatus: string;
  safetyDisclaimer: string;
  vetConfirmationNotice: string;
  whatToDoSteps: string[];
}

/**
 * Multilingual Terminology Sets for Farmer Role
 */
const FARMER_TERMINOLOGY_BY_LANG: Record<LanguageCode, RoleTerminology> = {
  en: {
    symptoms: 'Symptoms (Signs of illness)',
    symptomsExplanation: 'Signs that your animal is sick',
    quarantine: 'Quarantine (Keep the animal separate)',
    quarantineExplanation: 'Isolate sick animals to protect healthy ones',
    outbreak: 'Outbreak (Disease spreading in an area)',
    outbreakExplanation: 'Disease spreading among nearby animals',
    riskLevel: 'Risk Level (Danger level)',
    riskLevelExplanation: 'How urgent the health problem is',
    criticalRisk: 'Critical Risk (Emergency care needed)',
    highRisk: 'High Risk (Immediate attention needed)',
    moderateRisk: 'Moderate Risk (Watch closely)',
    lowRisk: 'Low Risk (Normal care)',
    criticalRiskSpread: 'High Risk – Disease may spread',
    vaccinationHistory: 'Previous Vaccines',
    vaccinationStatus: 'Vaccine Status (Protected or Due)',
    preventiveAction: 'How to prevent it',
    preventiveMeasures: 'How to keep your animals safe',
    diseaseSurveillance: 'Animal Health Monitoring',
    clinicalExamination: 'Animal Check-up',
    suspectedDisease: 'Possible Disease',
    possibleDisease: 'Possible Disease',
    nearbyCases: 'Similar sick animals nearby',
    mortality: 'Animal deaths',
    laboratoryTest: 'Lab Test',
    sampleCollection: 'Sample for testing',
    referral: 'Send to a veterinarian/specialist',
    advisory: 'Important advice',
    epidemiologicalRisk: 'Disease spread risk',
    containmentZone: 'Restricted area to control disease spread',
    mlClassification: 'AI Check: Possible Disease',
    biosecurityProtocol: 'Protect your animals from infection',
    aiCheck: 'AI Check',
    aiCheckLabel: 'AI Possibility Check',
    whyFlagged: 'WHY?',
    whatToDoNow: 'WHAT TO DO NOW?',
    decisionSupport: 'Doctor Advice & Safe Care',
    registeredAnimals: 'My Registered Animals',
    underObservation: 'Sick Animals (Under Observation)',
    emergencyHelpline: 'Emergency Doctor Helpline',
    fieldVisits: 'Doctor & Para-Vet Visits',
    reportSickAnimal: 'Report Sick Animal',
    myHerd: 'My Animals',
    caseStatus: 'Report Status',
    safetyDisclaimer: '⚠️ Important Safety Notice: This is an AI screening check and NOT a confirmed medical diagnosis. A veterinarian must examine your animal for final confirmation.',
    vetConfirmationNotice: 'Needs veterinarian confirmation',
    whatToDoSteps: [
      'Keep the sick animal separate from other animals.',
      'Do not move the animal to another location or market.',
      'Contact a veterinarian or local para-vet immediately.',
      'Follow local veterinary instructions and provide clean water.'
    ]
  },

  hi: {
    symptoms: 'Symptoms (बीमारी के लक्षण)',
    symptomsExplanation: 'पशु के बीमार होने के शारीरिक लक्षण',
    quarantine: 'Quarantine (बीमार पशु को अलग रखें)',
    quarantineExplanation: 'स्वस्थ पशुओं को बचाने के लिए बीमार पशु को अलग रखें',
    outbreak: 'Outbreak (इलाके में बीमारी का फैलाव)',
    outbreakExplanation: 'आस-पास के पशुओं में बीमारी तेजी से फैलना',
    riskLevel: 'Risk Level (खतरे का स्तर)',
    riskLevelExplanation: 'स्वास्थ्य समस्या की गंभीरता का स्तर',
    criticalRisk: 'गंभीर जोखिम (आपातकालीन उपचार आवश्यक)',
    highRisk: 'उच्च जोखिम (तत्काल डॉक्टर ध्यान आवश्यक)',
    moderateRisk: 'मध्यम जोखिम (बारीकी से निगरानी रखें)',
    lowRisk: 'कम जोखिम (सामान्य देखभाल)',
    criticalRiskSpread: 'उच्च जोखिम – बीमारी फैलने की संभावना',
    vaccinationHistory: 'टीकाकरण इतिहास (Previous Vaccines)',
    vaccinationStatus: 'टीकाकरण स्थिति (सुरक्षित या देय)',
    preventiveAction: 'बीमारी से बचाव के तरीके',
    preventiveMeasures: 'पशुओं को सुरक्षित रखने के उपाय',
    diseaseSurveillance: 'पशु स्वास्थ्य निगरानी',
    clinicalExamination: 'पशु स्वास्थ्य जांच',
    suspectedDisease: 'संभावित बीमारी',
    possibleDisease: 'संभावित बीमारी',
    nearbyCases: 'आस-पास के बीमार पशु',
    mortality: 'पशु मृत्यु',
    laboratoryTest: 'प्रयोगशाला जांच (Lab Test)',
    sampleCollection: 'जांच हेतु नमूना',
    referral: 'पशु चिकित्सक के पास भेजें',
    advisory: 'महत्वपूर्ण सलाह',
    epidemiologicalRisk: 'बीमारी फैलने का खतरा',
    containmentZone: 'संक्रमण नियंत्रण क्षेत्र',
    mlClassification: 'एआई जांच: संभावित बीमारी',
    biosecurityProtocol: 'संक्रमण से बचाव के नियम',
    aiCheck: 'एआई जांच (AI Check)',
    aiCheckLabel: 'एआई संभावना जांच',
    whyFlagged: 'यह लक्षण क्यों दिखे?',
    whatToDoNow: 'अब क्या करें?',
    decisionSupport: 'डॉक्टर सलाह एवं सुरक्षित देखभाल',
    registeredAnimals: 'मेरे पंजीकृत पशु',
    underObservation: 'निगरानी में बीमार पशु',
    emergencyHelpline: 'आपातकालीन डॉक्टर हेल्पलाइन',
    fieldVisits: 'डॉक्टर एवं पैरा-वेट विज़िट',
    reportSickAnimal: 'बीमार पशु की सूचना दें',
    myHerd: 'मेरे पशुधन',
    caseStatus: 'रिपोर्ट स्थिति',
    safetyDisclaimer: '⚠️ महत्वपूर्ण सुरक्षा सूचना: यह केवल एक एआई स्क्रिनिंग जांच है, पुष्ट चिकित्सा निदान नहीं। अंतिम पुष्टि के लिए पशु चिकित्सक द्वारा जांच आवश्यक है।',
    vetConfirmationNotice: 'पशु चिकित्सक की पुष्टि आवश्यक',
    whatToDoSteps: [
      'बीमार पशु को तुरंत अन्य स्वस्थ पशुओं से अलग रखें।',
      'पशु को किसी अन्य स्थान या हाट-बाजार में न ले जाएं।',
      'तुरंत स्थानीय पशु चिकित्सक या पैरा-वेट से संपर्क करें।',
      'डॉक्टर के निर्देशों का पालन करें और स्वच्छ पानी व चारा दें।'
    ]
  },

  kn: {
    symptoms: 'Symptoms (ರೋಗದ ಲಕ್ಷಣಗಳು)',
    symptomsExplanation: 'ಪ್ರಾಣಿಯು ಅನಾರೋಗ್ಯದಿಂದ ಕೂಡಿರುವ ಲಕ್ಷಣಗಳು',
    quarantine: 'Quarantine (ಅನಾರೋಗ್ಯದ ಪ್ರಾಣಿಯನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ)',
    quarantineExplanation: 'ಆರೋಗ್ಯಕರ ಪ್ರಾಣಿಗಳನ್ನು ರಕ್ಷಿಸಲು ಅನಾರೋಗ್ಯದ ಪ್ರಾಣಿಯನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ',
    outbreak: 'Outbreak (ಪ್ರದೇಶದಲ್ಲಿ ರೋಗ ಹರಡುವಿಕೆ)',
    outbreakExplanation: 'ಹತ್ತಿರದ ಪ್ರದೇಶದಲ್ಲಿ ರೋಗ ವೇಗವಾಗಿ ಹರಡುತ್ತಿದೆ',
    riskLevel: 'Risk Level (ಅಪಾಯದ ಮಟ್ಟ)',
    riskLevelExplanation: 'ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯ ಗಂಭೀರತೆ',
    criticalRisk: 'ತೀವ್ರ ಅಪಾಯ (ತುರ್ತು ಚಿಕಿತ್ಸೆ ಅಗತ್ಯ)',
    highRisk: 'ಹೆಚ್ಚಿನ ಅಪಾಯ (ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯ)',
    moderateRisk: 'ಮಧ್ಯಮ ಅಪಾಯ (ಎಚ್ಚರಿಕೆಯಿಂದ ಗಮನಿಸಿ)',
    lowRisk: 'ಕಡಿಮೆ ಅಪಾಯ (ಸಾಮಾನ್ಯ ಆರೈಕೆ)',
    criticalRiskSpread: 'ಹೆಚ್ಚಿನ ಅಪಾಯ – ರೋಗ ಹರಡುವ ಸಾಧ್ಯತೆ',
    vaccinationHistory: 'ಹಿಂದಿನ ಲಸಿಕೆಗಳು (Previous Vaccines)',
    vaccinationStatus: 'ಲಸಿಕೆ ಸ್ಥಿತಿ',
    preventiveAction: 'ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳು',
    preventiveMeasures: 'ಜಾನುವಾರು ಸುರಕ್ಷತಾ ಕ್ರಮಗಳು',
    diseaseSurveillance: 'ಪ್ರಾಣಿ ಆರೋಗ್ಯ ನಿಗಾ',
    clinicalExamination: 'ಪ್ರಾಣಿ ತಪಾಸಣೆ',
    suspectedDisease: 'ಸಂಭಾವ್ಯ ರೋಗ',
    possibleDisease: 'ಸಂಭಾವ್ಯ ರೋಗ',
    nearbyCases: 'ಹತ್ತಿರದ ಅನಾರೋಗ್ಯ ಪ್ರಾಣಿಗಳು',
    mortality: 'ಪ್ರಾಣಿ ಸಾವುಗಳು',
    laboratoryTest: 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆ',
    sampleCollection: 'ಪರೀಕ್ಷೆಗೆ ಮಾದರಿ',
    referral: 'ಪಶುವೈದ್ಯರಿಗೆ ವಹಿಸಿ',
    advisory: 'ಮುಖ್ಯ ಸಲಹೆ',
    epidemiologicalRisk: 'ರೋಗ ಹರಡುವ ಅಪಾಯ',
    containmentZone: 'ರೋಗ ನಿಯಂತ್ರಣ ವಲಯ',
    mlClassification: 'ಎಐ ತಪಾಸಣೆ: ಸಂಭಾವ್ಯ ರೋಗ',
    biosecurityProtocol: 'ಸೋಂಕು ತಡೆಗಟ್ಟುವ ನಿಯಮಗಳು',
    aiCheck: 'ಎಐ ತಪಾಸಣೆ (AI Check)',
    aiCheckLabel: 'ಎಐ ಸಂಭವನೀಯತೆ',
    whyFlagged: 'ಕಾರಣಗಳೇನು?',
    whatToDoNow: 'ಈಗ ಏನು ಮಾಡಬೇಕು?',
    decisionSupport: 'ವೈದ್ಯರ ಸಲಹೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಆರೈಕೆ',
    registeredAnimals: 'ನನ್ನ ನೋಂದಾಯಿತ ಪ್ರಾಣಿಗಳು',
    underObservation: 'ನಿಗಾದಲ್ಲಿರುವ ಪ್ರಾಣಿಗಳು',
    emergencyHelpline: 'ತುರ್ತು ವೈದ್ಯಕೀಯ ಸಹಾಯವಾಣಿ',
    fieldVisits: 'ವೈದ್ಯರ ಭೇಟಿಗಳು',
    reportSickAnimal: 'ಅನಾರೋಗ್ಯದ ಪ್ರಾಣಿ ವರದಿ ಮಾಡಿ',
    myHerd: 'ನನ್ನ ಪ್ರಾಣಿಗಳು',
    caseStatus: 'ವರದಿ ಸ್ಥಿತಿ',
    safetyDisclaimer: '⚠️ ಎಚ್ಚರಿಕೆ: ಇದು ಕೇವಲ ಎಐ ಪ್ರಾಥಮಿಕ ತಪಾಸಣೆಯಾಗಿದ್ದು, ಅಂತಿಮ ರೋಗನಿರ್ಣಯವಲ್ಲ. ಪಶುವೈದ್ಯರ ನೇರ ಪರೀಕ್ಷೆ ಕಡ್ಡಾಯವಾಗಿದೆ.',
    vetConfirmationNotice: 'ಪಶುವೈದ್ಯರ ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ',
    whatToDoSteps: [
      'ಅನಾರೋಗ್ಯದ ಪ್ರಾಣಿಯನ್ನು ಇತರ ಪ್ರಾಣಿಗಳಿಂದ ತಕ್ಷಣ ಪ್ರತ್ಯೇಕಿಸಿ.',
      'ಪ್ರಾಣಿಯನ್ನು ಬೇರೆ ಸ್ಥಳಕ್ಕೆ ಅಥವಾ ಮಾರುಕಟ್ಟೆಗೆ ಸಾಗಿಸಬೇಡಿ.',
      'ತಕ್ಷಣವೇ ಸ್ಥಳೀಯ ಪಶುವೈದ್ಯರನ್ನು ಅಥವಾ ಪ್ಯಾರಾ-ವೆಟ್ ಸಂಪರ್ಕಿಸಿ.',
      'ಪಶುವೈದ್ಯರ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ ಮತ್ತು ಶುದ್ಧ ನೀರು ನೀಡಿ.'
    ]
  },

  te: {
    symptoms: 'Symptoms (వ్యాధి లక్షణాలు)',
    symptomsExplanation: 'పశువు అనారోగ్యానికి గురైనట్లు కనిపించే సంకేతాలు',
    quarantine: 'Quarantine (అనారోగ్య పశువును వేరుగా ఉంచండి)',
    quarantineExplanation: 'ఆరోగ్యకరమైన పశువులను రక్షించడానికి అనారోగ్య పశువును వేరు చేయండి',
    outbreak: 'Outbreak (ప్రాంతంలో వ్యాధి వ్యాప్తి)',
    outbreakExplanation: 'సమీపంలోని పశువులలో వ్యాధి వేగంగా వ్యాపిస్తోంది',
    riskLevel: 'Risk Level (ప్రమాద స్థాయి)',
    riskLevelExplanation: 'ఆరోగ్య సమస్య యొక్క తీవ్రత',
    criticalRisk: 'తీవ్రమైన ప్రమాదం (అత్యవసర చికిత్స అవసరం)',
    highRisk: 'అధిక ప్రమాదం (వెంటనే వైద్యం అవసరం)',
    moderateRisk: 'మధ్యస్థ ప్రమాదం (జాగ్రత్తగా గమనించండి)',
    lowRisk: 'తక్కువ ప్రమాదం (సాధారణ సంరక్షణ)',
    criticalRiskSpread: 'అధిక ప్రమాదం – వ్యాధి వ్యాప్తి చెందే ప్రమాదం',
    vaccinationHistory: 'మునుపటి టీకాలు (Previous Vaccines)',
    vaccinationStatus: 'టీకా స్థితి',
    preventiveAction: 'నివారణ చర్యలు',
    preventiveMeasures: 'పశువుల రక్షణ చర్యలు',
    diseaseSurveillance: 'పశు ఆరోగ్య పర్యవేక్షణ',
    clinicalExamination: 'పశువుల ఆరోగ్య పరీక్ష',
    suspectedDisease: 'అనుమానిత వ్యాధి',
    possibleDisease: 'అనుమానిత వ్యాధి',
    nearbyCases: 'సమీపంలోని అనారోగ్య పశువులు',
    mortality: 'పశు మరణాలు',
    laboratoryTest: 'ల్యాబ్ పరీక్ష',
    sampleCollection: 'పరీక్ష కోసం నమూనా',
    referral: 'పశువైద్యుడి వద్దకు పంపండి',
    advisory: 'ముఖ్యమైన సలహా',
    epidemiologicalRisk: 'వ్యాధి వ్యాప్తి తీవ్రత',
    containmentZone: 'వ్యాధి నియంత్రణ ప్రాంతం',
    mlClassification: 'AI స్క్రీనింగ్: అనుమానిత వ్యాధి',
    biosecurityProtocol: 'వ్యాధి నిరోధక నిబంధనలు',
    aiCheck: 'AI స్క్రీనింగ్ (AI Check)',
    aiCheckLabel: 'AI సంభావ్యత తనిఖీ',
    whyFlagged: 'కారణాలు ఏమిటి?',
    whatToDoNow: 'ఇప్పుడు ఏమి చేయాలి?',
    decisionSupport: 'వైద్యుల సలహా మరియు సంరక్షణ',
    registeredAnimals: 'నమోదైన నా పశువులు',
    underObservation: 'పరిశీలనలో ఉన్న అనారోగ్య పశువులు',
    emergencyHelpline: 'అత్యవసర వైద్య హెల్ప్‌లైన్',
    fieldVisits: 'వైద్యుల సందర్శనలు',
    reportSickAnimal: 'అనారోగ్య పశువు సమాచారం ఇవ్వండి',
    myHerd: 'నా పశువులు',
    caseStatus: 'నివేదిక స్థితి',
    safetyDisclaimer: '⚠️ హెచ్చరిక: ఇది AI స్క్రీనింగ్ మాత్రమే, తుది వైద్య నిర్ధారణ కాదు. అర్హత కలిగిన పశువైద్యుడి ప్రత్యక్ష పరీక్ష అవసరం.',
    vetConfirmationNotice: 'పశువైద్యుడి నిర్ధారణ అవసరం',
    whatToDoSteps: [
      'అనారోగ్య పశువును ఆరోగ్యకరమైన పశువుల నుండి వెంటనే వేరు చేయండి.',
      'పశువును వేరే ప్రాంతానికి లేదా సంతకు తరలించవద్దు.',
      'వెంటనే స్థానిక పశువైద్యుడిని లేదా పారా-వెట్‌ను సంప్రదించండి.',
      'వైద్యుల సూచనలను పాటించండి మరియు స్వచ్ఛమైన నీరు అందించండి.'
    ]
  },

  mr: {
    symptoms: 'Symptoms (आजाराची लक्षणे)',
    symptomsExplanation: 'जनावर आजारी असल्याची शारीरिक लक्षणे',
    quarantine: 'Quarantine (आजारी जनावराला वेगळे ठेवा)',
    quarantineExplanation: 'इतर निरोगी जनावरांचे रक्षण करण्यासाठी आजारी जनावराला तात्काळ वेगळे ठेवा',
    outbreak: 'Outbreak (परिसरात आजाराचा फैलाव)',
    outbreakExplanation: 'जवळपासच्या परिसरातील जनावरांमध्ये आजार वेगाने पसरत आहे',
    riskLevel: 'Risk Level (धोक्याची पातळी)',
    riskLevelExplanation: 'आरोग्य समस्येचे गांभीर्य आणि तातडीची गरज',
    criticalRisk: 'अति-धोकादायक (तातडीच्या वैद्यकीय उपचारांची गरज)',
    highRisk: 'जास्त धोका (तातडीने डॉक्टर तपासणी आवश्यक)',
    moderateRisk: 'मध्यम धोका (बारकाईने लक्ष ठेवा)',
    lowRisk: 'कमी धोका (सामान्य काळजी)',
    criticalRiskSpread: 'जास्त धोका – आजार पसरण्याची शक्यता',
    vaccinationHistory: 'पूर्वी दिलेली लस (Previous Vaccines)',
    vaccinationStatus: 'लसीकरण स्थिती (सुरक्षित किंवा शिल्लक)',
    preventiveAction: 'आजार प्रतिबंधाचे उपाय',
    preventiveMeasures: 'जनावरांना सुरक्षित ठेवण्याचे नियम',
    diseaseSurveillance: 'पशु आरोग्य देखरेख',
    clinicalExamination: 'जनावराची शारीरिक तपासणी',
    suspectedDisease: 'संभाव्य आजार',
    possibleDisease: 'संभाव्य आजार',
    nearbyCases: 'परिसरातील आजारी जनावरे',
    mortality: 'जनावर मृत्यू',
    laboratoryTest: 'प्रयोगशाळा तपासणी (Lab Test)',
    sampleCollection: 'तपासणीसाठी नमुना',
    referral: 'पशुवैद्यकीय अधिकाऱ्यांकडे पाठवा',
    advisory: 'महत्त्वाचा सल्ला',
    epidemiologicalRisk: 'आजार फैलावाचा धोका',
    containmentZone: 'प्रतिबंधित संसर्ग नियंत्रण क्षेत्र',
    mlClassification: 'एआय तपासणी: संभाव्य आजार',
    biosecurityProtocol: 'संसर्ग रोखण्याचे जैव-सुरक्षा नियम',
    aiCheck: 'एआय तपासणी (AI Check)',
    aiCheckLabel: 'एआय संभाव्यता तपासणी',
    whyFlagged: 'हे लक्षण का आढळले?',
    whatToDoNow: 'आता काय करावे?',
    decisionSupport: 'डॉक्टरांचा सल्ला आणि सुरक्षित काळजी',
    registeredAnimals: 'माझी नोंदणीकृत जनावरे',
    underObservation: 'निरीक्षणाखालील आजारी जनावरे',
    emergencyHelpline: 'आपत्कालीन डॉक्टर हेल्पलाइन',
    fieldVisits: 'डॉक्टर व पशुसंवर्धन अधिकारी भेटी',
    reportSickAnimal: 'आजारी जनावराची तक्रार नोंदवा',
    myHerd: 'माझी जनावरे',
    caseStatus: 'तक्रार / केस स्थिती',
    safetyDisclaimer: '⚠️ महत्त्वाची सुरक्षा सूचना: हे केवळ प्राथमिक एआय स्क्रिनिंग मूल्यांकन आहे, अंतिम वैद्यकीय निदान नाही. निश्चित निदानासाठी पशुवैद्यकीय डॉक्टरांची प्रत्यक्ष तपासणी आवश्यक आहे.',
    vetConfirmationNotice: 'पशुवैद्यकीय डॉक्टरांची पुष्टी आवश्यक',
    whatToDoSteps: [
      'आजारी जनावराला इतर निरोगी जनावरांपासून ताबडतोब वेगळे बांधा.',
      'जनावराला इतर गावात, बाजारात किंवा चरायला नेऊ नका.',
      'तातडीने जवळच्या पशुवैद्यकीय दवाखान्याशी किंवा डॉक्टरांशी संपर्क साधा.',
      'डॉक्टरांच्या सल्ल्याचे पालन करा आणि जनावराला स्वच्छ पाणी व चारा द्या.'
    ]
  }
};

/**
 * 2. VETERINARIAN ROLE TERMINOLOGY
 */
export const VETERINARIAN_TERMINOLOGY: RoleTerminology = {
  symptoms: 'Clinical Symptoms',
  symptomsExplanation: 'Observed clinical signs and pathognomonic markers',
  quarantine: 'Strict Quarantine & Biosecurity Isolation',
  quarantineExplanation: 'Mandatory bio-exclusion and containment perimeter',
  outbreak: 'Epidemiological Outbreak',
  outbreakExplanation: 'Active spatio-temporal disease transmission cluster',
  riskLevel: 'Epidemiological Risk Level',
  riskLevelExplanation: 'Composite clinical risk and transmission index',
  criticalRisk: 'Critical Epidemiological Risk',
  highRisk: 'High Clinical & Transmission Risk',
  moderateRisk: 'Moderate Risk / Active Surveillance',
  lowRisk: 'Low Risk / Endemic Baseline',
  criticalRiskSpread: 'Critical Transmission & Spillage Risk',
  vaccinationHistory: 'Immunization Profile & History',
  vaccinationStatus: 'Vaccination Coverage & Herd Immunity',
  preventiveAction: 'Biosecurity Protocols & Prophylaxis',
  preventiveMeasures: 'Comprehensive Biosecurity Directives',
  diseaseSurveillance: 'Syndromic Disease Surveillance',
  clinicalExamination: 'Clinical Examination & Differential Triage',
  suspectedDisease: 'Differential Diagnosis',
  possibleDisease: 'Differential Diagnosis',
  nearbyCases: 'Spatio-Temporal Cluster Cases',
  mortality: 'Case Fatality & Mortality',
  laboratoryTest: 'Diagnostic Laboratory Test',
  sampleCollection: 'Diagnostic Specimen Collection',
  referral: 'Clinical Referral & Escalation',
  advisory: 'Veterinary Health Advisory',
  epidemiologicalRisk: 'Epidemiological Transmission Risk',
  containmentZone: 'Epidemiological Containment Perimeter',
  mlClassification: 'ML Tabular Disease Screening',
  biosecurityProtocol: 'Initiate Biosecurity Protocol',
  aiCheck: 'ML Tabular Classifier',
  aiCheckLabel: 'Model Screening Probability',
  whyFlagged: 'Explainable Biomarkers & Factors',
  whatToDoNow: 'Clinical Protocol & Therapeutic Pathway',
  decisionSupport: 'Clinical Decision Support',
  registeredAnimals: 'Registered Livestock Population',
  underObservation: 'Active Clinical Observation Cases',
  emergencyHelpline: 'Emergency Tele-Triage Helpline',
  fieldVisits: 'Clinical Field Encounters',
  reportSickAnimal: 'Log Clinical Case',
  myHerd: 'Jurisdiction Herds',
  caseStatus: 'Clinical Case Status',
  safetyDisclaimer: 'Tabular Random Forest screening assessment based on standardized disease matrix indicators. Laboratory confirmation required.',
  vetConfirmationNotice: 'Pending veterinary & laboratory confirmation',
  whatToDoSteps: [
    'Enforce strict bio-exclusion and physical quarantine.',
    'Collect diagnostic specimens (vesicular fluid/blood/swabs).',
    'Administer supportive fluid therapy and symptomatic care.',
    'Notify District AH Officer if state notifiable disease suspected.'
  ]
};

/**
 * 3. FIELD WORKER / PARA-VET TERMINOLOGY
 */
export const FIELD_WORKER_TERMINOLOGY: RoleTerminology = {
  symptoms: 'Symptoms Reported',
  symptomsExplanation: 'Signs of sickness recorded in the field',
  quarantine: 'Quarantine (Isolate animal)',
  quarantineExplanation: 'Keep sick animals apart from healthy ones',
  outbreak: 'Outbreak Alert',
  outbreakExplanation: 'Active disease cluster in your beat',
  riskLevel: 'Risk Level',
  riskLevelExplanation: 'Severity of reported case',
  criticalRisk: 'Critical Risk (Immediate visit)',
  highRisk: 'High Risk (Urgent visit)',
  moderateRisk: 'Moderate Risk (Schedule visit)',
  lowRisk: 'Low Risk (Routine follow-up)',
  criticalRiskSpread: 'High Risk (Spread Danger)',
  vaccinationHistory: 'Vaccination Record',
  vaccinationStatus: 'Vaccine Status',
  preventiveAction: 'Containment & Prevention Steps',
  preventiveMeasures: 'Field Biosecurity Steps',
  diseaseSurveillance: 'Field Surveillance & Monitoring',
  clinicalExamination: 'Animal Health Check',
  suspectedDisease: 'Possible Disease',
  possibleDisease: 'Possible Disease',
  nearbyCases: 'Nearby Sick Animals',
  mortality: 'Animal Deaths Reported',
  laboratoryTest: 'Lab Test',
  sampleCollection: 'Send Sample for Lab Test',
  referral: 'Escalate to Veterinary Officer',
  advisory: 'Field Advisory',
  epidemiologicalRisk: 'Disease Spread Risk',
  containmentZone: 'Containment Zone',
  mlClassification: 'AI Screening: Possible Disease',
  biosecurityProtocol: 'Sanitization & Isolation Steps',
  aiCheck: 'AI Screening',
  aiCheckLabel: 'AI Screening Match',
  whyFlagged: 'Key Symptoms Observed',
  whatToDoNow: 'Field Action Checklist',
  decisionSupport: 'Field Protocol & Guidance',
  registeredAnimals: 'Assigned Animals in Beat',
  underObservation: 'Sick / Follow-Up Animals',
  emergencyHelpline: 'Doctor Helpline',
  fieldVisits: 'Scheduled Field Visits',
  reportSickAnimal: 'Log New Field Report',
  myHerd: 'Beat Animals',
  caseStatus: 'Case Status',
  safetyDisclaimer: 'Field screening assessment for early warning. Requires review and confirmation by Veterinary Officer.',
  vetConfirmationNotice: 'Requires veterinary officer verification',
  whatToDoSteps: [
    'Advise farmer on strict physical isolation of sick stock.',
    'Collect and package diagnostic sample maintaining cold chain.',
    'Record vital signs (temperature, pulse) and detailed symptoms.',
    'Submit case to Veterinary Officer queue for urgent review.'
  ]
};

/**
 * 4. GOVERNMENT & SURVEILLANCE ROLES
 */
export const GOVERNMENT_TERMINOLOGY: RoleTerminology = {
  symptoms: 'Syndromic Indicators',
  symptomsExplanation: 'Aggregate clinical phenotypes and syndrome reports',
  quarantine: 'Quarantine & Containment Protocol',
  quarantineExplanation: 'Statutory movement restrictions and ring isolation',
  outbreak: 'Epidemiological Outbreak Zone',
  outbreakExplanation: 'Active spatio-temporal disease transmission cluster',
  riskLevel: 'Surveillance Risk Tier',
  riskLevelExplanation: 'Composite regional risk index',
  criticalRisk: 'Critical Epidemiological Outbreak',
  highRisk: 'High Transmission Alert',
  moderateRisk: 'Moderate Risk Surveillance',
  lowRisk: 'Low Risk Baseline',
  criticalRiskSpread: 'Critical Spatio-Temporal Spread Risk',
  vaccinationHistory: 'Immunization Coverage Records',
  vaccinationStatus: 'Vaccine Coverage Index',
  preventiveAction: 'Epidemiological Containment Measures',
  preventiveMeasures: 'Disease Containment & Biosecurity Directives',
  diseaseSurveillance: 'Statewide Syndromic Surveillance',
  clinicalExamination: 'Veterinary Triage Assessment',
  suspectedDisease: 'Differential Diagnosis',
  possibleDisease: 'Differential Diagnosis',
  nearbyCases: 'Spatio-Temporal Cluster Cases',
  mortality: 'Livestock Mortality & Case Fatality',
  laboratoryTest: 'Confirmatory Laboratory Testing',
  sampleCollection: 'Biological Specimen Triage',
  referral: 'Veterinary Escalation Pathway',
  advisory: 'Government Health Advisory',
  epidemiologicalRisk: 'Epidemiological Transmission Risk',
  containmentZone: 'Containment Zone Management',
  mlClassification: 'ML Tabular Disease Screening',
  biosecurityProtocol: 'Statutory Biosecurity Mandates',
  aiCheck: 'ML Tabular Screening Model',
  aiCheckLabel: 'Model Screening Probability',
  whyFlagged: 'Syndromic Biomarkers & Features',
  whatToDoNow: 'Administrative & Containment Directives',
  decisionSupport: 'Decision Support & Containment',
  registeredAnimals: 'District Livestock Census',
  underObservation: 'Active Surveillance Queue',
  emergencyHelpline: 'State Rapid Response Cell',
  fieldVisits: 'Surveillance Inspections',
  reportSickAnimal: 'File Syndromic Case',
  myHerd: 'Jurisdiction Holdings',
  caseStatus: 'Surveillance Case Status',
  safetyDisclaimer: 'ML Decision Support prototype screening output. All containment decisions require certified laboratory and veterinary confirmation.',
  vetConfirmationNotice: 'Requires laboratory confirmation',
  whatToDoSteps: [
    'Enforce containment zone perimeter and animal movement bans.',
    'Mobilize rapid response veterinary teams for ring vaccination.',
    'Track diagnostic specimen transit to Regional Disease Diagnostic Lab.',
    'Issue public health and biosecurity advisories across district.'
  ]
};

export const FARMER_TERMINOLOGY = FARMER_TERMINOLOGY_BY_LANG.en;

/**
 * Get Central Terminology Dictionary for a specific Role and Language
 */
export function getTerminology(role?: Role | string, lang?: LanguageCode): RoleTerminology {
  const canonical = role ? normalizeRole(role as Role) : 'FARMER';
  const activeLang = lang || store.getLanguage() || 'en';

  if (canonical === 'FARMER') {
    return FARMER_TERMINOLOGY_BY_LANG[activeLang] || FARMER_TERMINOLOGY_BY_LANG.en;
  }

  switch (canonical) {
    case 'FIELD_WORKER':
      return FIELD_WORKER_TERMINOLOGY;
    case 'VETERINARIAN':
    case 'LABORATORY_STAFF':
    case 'DIAGNOSTIC_LAB':
      return VETERINARIAN_TERMINOLOGY;
    case 'DISTRICT_OFFICIAL':
    case 'STATE_ADMIN':
    case 'SYSTEM_ADMIN':
    default:
      return GOVERNMENT_TERMINOLOGY;
  }
}

/**
 * Format a Risk Level label according to user role and language
 */
export function formatRiskLabel(
  level: RiskLevel,
  role?: Role | string,
  includeExplanation: boolean = true,
  lang?: LanguageCode
): string {
  const terms = getTerminology(role, lang);
  const canonical = role ? normalizeRole(role as Role) : 'FARMER';

  if (canonical === 'FARMER') {
    switch (level) {
      case 'CRITICAL':
        return includeExplanation ? terms.criticalRisk : 'High Risk – Disease may spread';
      case 'HIGH':
        return includeExplanation ? terms.highRisk : 'High Risk';
      case 'MODERATE':
        return includeExplanation ? terms.moderateRisk : 'Moderate Risk';
      case 'LOW':
        return includeExplanation ? terms.lowRisk : 'Low Risk';
    }
  }

  if (canonical === 'FIELD_WORKER') {
    switch (level) {
      case 'CRITICAL':
        return includeExplanation ? 'Critical Risk (Immediate visit)' : 'Critical Risk';
      case 'HIGH':
        return includeExplanation ? 'High Risk (Urgent visit)' : 'High Risk';
      case 'MODERATE':
        return includeExplanation ? 'Moderate Risk (Schedule visit)' : 'Moderate Risk';
      case 'LOW':
        return includeExplanation ? 'Low Risk (Routine follow-up)' : 'Low Risk';
    }
  }

  // Veterinarian & Government
  return `${level} RISK`;
}

/**
 * Format an Alert object for role-appropriate consumption with translation
 */
export function formatAlertForRole(
  alert: { title: string; message: string; priority?: string; category?: string },
  role?: Role | string,
  lang?: LanguageCode
): { title: string; message: string; priorityLabel: string } {
  const canonical = role ? normalizeRole(role as Role) : 'FARMER';
  const activeLang = lang || store.getLanguage() || 'en';

  if (canonical === 'FARMER') {
    const tLower = (alert.title || '').toLowerCase();
    const mLower = (alert.message || '').toLowerCase();

    // FMD Alert
    if (tLower.includes('fmd') || tLower.includes('foot-and-mouth') || tLower.includes('outbreak')) {
      const messages: Record<LanguageCode, { title: string; message: string; label: string }> = {
        en: {
          title: '⚠️ URGENT: FMD Disease Alert Near You',
          message: 'Some animals nearby may have Foot-and-Mouth Disease (FMD). Keep sick animals separate and contact a veterinarian.',
          label: 'URGENT LOCAL ALERT'
        },
        hi: {
          title: '⚠️ अति आवश्यक: आपके पास FMD रोग का अलर्ट',
          message: 'आस-पास के कुछ पशुओं में Foot-and-Mouth Disease (FMD) के लक्षण हैं। बीमार पशु को अलग रखें और तुरंत पशु चिकित्सक से संपर्क करें।',
          label: 'अति आवश्यक स्थानीय अलर्ट'
        },
        kn: {
          title: '⚠️ ತುರ್ತು: ನಿಮ್ಮ ಹತ್ತಿರ FMD ರೋಗದ ಎಚ್ಚರಿಕೆ',
          message: 'ಹತ್ತಿರದ ಪ್ರಾಣಿಗಳಲ್ಲಿ Foot-and-Mouth Disease (FMD) ಕಂಡುಬಂದಿದೆ. ಅನಾರೋಗ್ಯದ ಪ್ರಾಣಿಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
          label: 'ತುರ್ತು ಸ್ಥಳೀಯ ಎಚ್ಚರಿಕೆ'
        },
        te: {
          title: '⚠️ అత్యవసరం: మీ సమీపంలో FMD వ్యాధి హెచ్చరిక',
          message: 'సమీపంలోని పశువులలో Foot-and-Mouth Disease (FMD) వ్యాపించింది. అనారోగ్య పశువును వేరుగా ఉంచి పశువైద్యుడిని సంప్రదించండి.',
          label: 'అత్యవసర స్థానిక హెచ్చరిక'
        },
        mr: {
          title: '⚠️ तातडीचा इशारा: तुमच्या परिसरात FMD आजाराचा धोका',
          message: 'परिसरातील काही जनावरांमध्ये Foot-and-Mouth Disease (FMD) ची लक्षणे आढळली आहेत. आजारी जनावराला तात्काळ वेगळे ठेवा व पशुवैद्यकाशी संपर्क साधा.',
          label: 'तातडीचा स्थानिक इशारा'
        }
      };
      const res = messages[activeLang] || messages.en;
      return { title: res.title, message: res.message, priorityLabel: res.label };
    }

    // Anthrax / Mortality Alert
    if (tLower.includes('anthrax') || tLower.includes('necropsy') || tLower.includes('mortality') || mLower.includes('carcass')) {
      const messages: Record<LanguageCode, { title: string; message: string; label: string }> = {
        en: {
          title: '⚠️ URGENT: Sudden Animal Death Warning (Anthrax Precaution)',
          message: 'Sudden animal deaths reported nearby. Do not touch or cut open dead animals. Contact a veterinarian immediately.',
          label: 'URGENT WARNING'
        },
        hi: {
          title: '⚠️ अति आवश्यक: अचानक पशु मृत्यु चेतावनी (Anthrax सावधानी)',
          message: 'आस-पास अचानक पशु मृत्यु की सूचना मिली है। मृत पशु को न छुएं और न ही चीरा लगाएं। तुरंत पशु चिकित्सक से संपर्क करें।',
          label: 'अति आवश्यक चेतावनी'
        },
        kn: {
          title: '⚠️ ತುರ್ತು: ಹಠಾತ್ ಪ್ರಾಣಿ ಸಾವು ಎಚ್ಚರಿಕೆ (Anthrax ಮುನ್ನೆಚ್ಚರಿಕೆ)',
          message: 'ಹತ್ತಿರದಲ್ಲಿ ಹಠಾತ್ ಸಾವುಗಳು ವರದಿಯಾಗಿವೆ. ಸತ್ತ ಪ್ರಾಣಿಗಳನ್ನು ಮುಟ್ಟಬೇಡಿ ಅಥವಾ ಕತ್ತರಿಸಬೇಡಿ. ತಕ್ಷಣ ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
          label: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ'
        },
        te: {
          title: '⚠️ అత్యవసరం: ఆకస్మిక పశు మరణాల హెచ్చరిక (Anthrax జాగ్రత్త)',
          message: 'సమీపంలో ఆకస్మిక పశు మరణాలు నమోదయ్యాయి. చనిపోయిన పశువులను ముట్టుకోవద్దు. వెంటనే పశువైద్యుడిని సంప్రదించండి.',
          label: 'అత్యవసర హెచ్చరిక'
        },
        mr: {
          title: '⚠️ तातडीचा इशारा: अचानक जनावर मृत्यूची सूचना (Anthrax खबरदारी)',
          message: 'परिसरात जनावरांचा अचानक मृत्यू झाल्याची नोंद आहे. मृत जनावराला कापू नका किंवा उघडू नका. तात्काळ पशुवैद्यकीय डॉक्टरांशी संपर्क साधा.',
          label: 'तातडीचा इशारा'
        }
      };
      const res = messages[activeLang] || messages.en;
      return { title: res.title, message: res.message, priorityLabel: res.label };
    }

    // LSD Alert
    if (tLower.includes('lsd') || tLower.includes('lumpy') || tLower.includes('capripox')) {
      const messages: Record<LanguageCode, { title: string; message: string; label: string }> = {
        en: {
          title: '⚠️ URGENT: Lumpy Skin Disease (LSD) Alert Near You',
          message: 'Lumpy Skin Disease (LSD) reported in your area. Protect animals from biting flies and check for skin nodules.',
          label: 'URGENT LOCAL ALERT'
        },
        hi: {
          title: '⚠️ अति आवश्यक: Lumpy Skin Disease (LSD) अलर्ट',
          message: 'आपके क्षेत्र में Lumpy Skin Disease (LSD) की सूचना है। पशुओं को मक्खियों-मच्छरों से बचाएं और त्वचा पर गांठों की जांच करें।',
          label: 'अति आवश्यक स्थानीय अलर्ट'
        },
        kn: {
          title: '⚠️ ತುರ್ತು: Lumpy Skin Disease (LSD) ಎಚ್ಚರಿಕೆ',
          message: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ Lumpy Skin Disease (LSD) ವರದಿಯಾಗಿದೆ. ನೊಣಗಳಿಂದ ಪ್ರಾಣಿಗಳನ್ನು ರಕ್ಷಿಸಿ ಮತ್ತು ಚರ್ಮದ ಗಂಟುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
          label: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ'
        },
        te: {
          title: '⚠️ అత్యవసరం: Lumpy Skin Disease (LSD) హెచ్చరిక',
          message: 'మీ ప్రాంతంలో Lumpy Skin Disease (LSD) నివేదించబడింది. పశువులను ఈగలు, దోమల నుండి రక్షించండి మరియు చర్మంపై గడ్డలను గమనించండి.',
          label: 'అత్యవసర హెచ్చరిక'
        },
        mr: {
          title: '⚠️ तातडीचा इशारा: Lumpy Skin Disease (LSD) चा धोका',
          message: 'तुमच्या भागात Lumpy Skin Disease (LSD) चे रुग्ण आढळले आहेत. जनावरांना गोचीड व डासांपासून वाचवा आणि कातडीवरील गाठी तपासा.',
          label: 'तातडीचा स्थानिक इशारा'
        }
      };
      const res = messages[activeLang] || messages.en;
      return { title: res.title, message: res.message, priorityLabel: res.label };
    }

    // Vaccination Alert
    if (tLower.includes('vaccination') || tLower.includes('overdue') || tLower.includes('booster')) {
      const messages: Record<LanguageCode, { title: string; message: string; label: string }> = {
        en: {
          title: 'Vaccine Due: Previous Vaccines Need Booster',
          message: alert.message || 'Your animal is due for a booster vaccine. Contact your local veterinarian or para-vet.',
          label: 'VACCINE DUE'
        },
        hi: {
          title: 'टीकाकरण देय: बूस्टर टीका लगवाने का समय',
          message: alert.message || 'आपके पशु का बूस्टर टीका लगवाने का समय हो गया है। स्थानीय पशु चिकित्सक या पैरा-वेट से संपर्क करें।',
          label: 'टीकाकरण देय'
        },
        kn: {
          title: 'ಲಸಿಕೆ ಬಾಕಿ: ಬೂಸ್ಟರ್ ಲಸಿಕೆ ಹಾಕಿಸುವ ಸಮಯ',
          message: alert.message || 'ನಿಮ್ಮ ಪ್ರಾಣಿಗೆ ಬೂಸ್ಟರ್ ಲಸಿಕೆ ನೀಡುವ ಸಮಯವಾಗಿದೆ. ಸ್ಥಳೀಯ ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
          label: 'ಲಸಿಕೆ ಬಾಕಿ'
        },
        te: {
          title: 'టీకా సమయం: బూస్టర్ టీకా వేయించాల్సిన సమయం',
          message: alert.message || 'మీ పశువుకు బూస్టర్ టీకా వేయించాల్సిన సమయం వచ్చింది. పశువైద్యుడిని సంప్రదించండి.',
          label: 'టీకా సమయం'
        },
        mr: {
          title: 'लसीकरण बाकी: बुस्टर लस देण्याची वेळ',
          message: alert.message || 'तुमच्या जनावराची पुढील बुस्टर लस बाकी आहे. कृपया नजीकच्या पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा.',
          label: 'लसीकरण बाकी'
        }
      };
      const res = messages[activeLang] || messages.en;
      return { title: res.title, message: res.message, priorityLabel: res.label };
    }

    // Generic farmer alert fallback
    return {
      title: `⚠️ ${alert.title.replace(/^CRITICAL:\s*/i, 'URGENT: ').replace(/^HIGH:\s*/i, 'IMPORTANT: ')}`,
      message: alert.message,
      priorityLabel: alert.priority === 'CRITICAL' ? 'URGENT ALERT' : 'IMPORTANT ADVICE'
    };
  }

  // Non-farmer roles
  return {
    title: alert.title,
    message: alert.message,
    priorityLabel: `${alert.priority || 'INFO'} ADVISORY`
  };
}

/**
 * Format AI Disease Screening Result for clear, safe farmer communication
 */
export function formatDiseaseScreeningResult(
  diseaseName: string,
  probability: number,
  symptoms: string[],
  role?: Role | string,
  lang?: LanguageCode
) {
  const terms = getTerminology(role, lang);
  const canonical = role ? normalizeRole(role as Role) : 'FARMER';
  const probPct = Math.round(probability * 100);

  const possibilityLevel =
    probPct >= 70 ? 'High possibility' : probPct >= 40 ? 'Moderate possibility' : 'Low possibility';

  return {
    possibleDiseaseTitle: canonical === 'FARMER' ? terms.possibleDisease : 'DIFFERENTIAL DIAGNOSIS',
    diseaseName,
    aiCheckHeader: terms.aiCheck,
    possibilityDescription: canonical === 'FARMER' ? possibilityLevel : `${probPct}% Model Probability`,
    probabilityPercent: probPct,
    whyHeader: terms.whyFlagged,
    symptomsObserved: symptoms,
    whatToDoHeader: terms.whatToDoNow,
    whatToDoSteps: terms.whatToDoSteps,
    safetyDisclaimer: terms.safetyDisclaimer,
    confirmationBadge: terms.vetConfirmationNotice
  };
}
