import { LanguageCode } from '../types';

export interface TranslationDictionary {
  appName: string;
  appTagline: string;
  dashboard: string;
  animals: string;
  herds: string;
  reportCase: string;
  symptoms: string;
  diseaseKnowledgeBase: string;
  vaccinations: string;
  treatments: string;
  mortality: string;
  outbreaks: string;
  riskMap: string;
  weatherEnvironment: string;
  laboratory: string;
  alertsAdvisories: string;
  historicalTrends: string;
  reportsAnalytics: string;
  veterinaryDashboard: string;
  settings: string;
  role: string;
  switchRole: string;
  logout: string;
  login: string;
  reportSymptoms: string;
  reportMortality: string;
  viewVaccinations: string;
  contactVeterinarian: string;
  totalAnimals: string;
  healthy: string;
  underObservation: string;
  affected: string;
  recovered: string;
  deaths: string;
  vaccinationCoverage: string;
  openCases: string;
  riskLevel: string;
  lowRisk: string;
  moderateRisk: string;
  highRisk: string;
  criticalRisk: string;
  suspectedDiseases: string;
  recommendedActions: string;
  disclaimerText: string;
  offlineMode: string;
  online: string;
  syncPending: string;
  syncNow: string;
  syncComplete: string;
  searchPlaceholder: string;
  filterBySpecies: string;
  filterByStatus: string;
  save: string;
  cancel: string;
  submit: string;
  details: string;
  species: string;
  tagNumber: string;
  age: string;
  weight: string;
  location: string;
  status: string;
  actions: string;
  loading: string;
  noDataFound: string;
  selectLanguage: string;
  demoModeNotice: string;
  quickScenarios: string;
  ivrGateway: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'LIVESTOCK GUARD',
    appTagline: 'Early Detection, Prevention & Management of Livestock Diseases',
    dashboard: 'Dashboard',
    animals: 'Animals & Herds',
    herds: 'Herd Management',
    reportCase: 'Report Suspected Case',
    symptoms: 'Symptom Checker',
    diseaseKnowledgeBase: 'Disease Knowledge Base',
    vaccinations: 'Vaccinations',
    treatments: 'Treatments',
    mortality: 'Mortality Reports',
    outbreaks: 'Outbreak Surveillance',
    riskMap: 'GIS Risk Map',
    weatherEnvironment: 'Weather & Environment',
    laboratory: 'Diagnostic Laboratory',
    alertsAdvisories: 'Alerts & Advisories',
    historicalTrends: 'Historical Trends',
    reportsAnalytics: 'Government Reports',
    veterinaryDashboard: 'Veterinary Clinical Hub',
    settings: 'Settings & Config',
    role: 'Current Role',
    switchRole: 'Switch Role / Persona',
    logout: 'Sign Out',
    login: 'Sign In',
    reportSymptoms: 'Report Sick Animal',
    reportMortality: 'Report Animal Death',
    viewVaccinations: 'Check Vaccine Schedule',
    contactVeterinarian: 'Call Field Veterinarian',
    totalAnimals: 'Total Livestock',
    healthy: 'Healthy',
    underObservation: 'Under Observation',
    affected: 'Symptomatic / Sick',
    recovered: 'Recovered',
    deaths: 'Mortalities',
    vaccinationCoverage: 'Vaccination Rate',
    openCases: 'Active Triage Cases',
    riskLevel: 'Biosecurity Risk Level',
    lowRisk: 'LOW RISK',
    moderateRisk: 'MODERATE RISK',
    highRisk: 'HIGH RISK',
    criticalRisk: 'CRITICAL RISK',
    suspectedDiseases: 'Differential Screening Matches',
    recommendedActions: 'Preventive Advisory & Bio-containment',
    disclaimerText: 'Decision Support Notice: This screening risk assessment does not replace examination or laboratory confirmation by a qualified veterinary professional.',
    offlineMode: 'Offline Mode Active (Records will auto-sync)',
    online: 'Connected & Synchronized',
    syncPending: 'records queued offline',
    syncNow: 'Sync to Cloud Now',
    syncComplete: 'All records synchronized successfully',
    searchPlaceholder: 'Search by Tag ID, Case #, Village, Disease...',
    filterBySpecies: 'All Species',
    filterByStatus: 'All Statuses',
    save: 'Save Record',
    cancel: 'Cancel',
    submit: 'Submit Report',
    details: 'View Full Details',
    species: 'Species',
    tagNumber: 'Ear Tag / ID',
    age: 'Age (Years)',
    weight: 'Weight (Kg)',
    location: 'Village / Farm Location',
    status: 'Status',
    actions: 'Actions',
    loading: 'Loading surveillance data...',
    noDataFound: 'No records matching current criteria.',
    selectLanguage: 'Language',
    demoModeNotice: 'Demo Environment: Live simulation active with pre-seeded district surveillance data.',
    quickScenarios: 'Quick Scenarios',
    ivrGateway: 'IVR Voice Toll-Free Gateway'
  },
  hi: {
    appName: 'लाइवस्टॉक गार्ड',
    appTagline: 'पशु रोगों की प्रारंभिक पहचान, रोकथाम और प्रबंधन प्रणाली',
    dashboard: 'डैशबोर्ड',
    animals: 'पशु एवं झुंड',
    herds: 'झुंड प्रबंधन',
    reportCase: 'बीमारी की सूचना दें',
    symptoms: 'लक्षण जांच',
    diseaseKnowledgeBase: 'रोग ज्ञानकोश',
    vaccinations: 'टीकाकरण रिकॉर्ड',
    treatments: 'उपचार इतिहास',
    mortality: 'पशु मृत्यु रिपोर्ट',
    outbreaks: 'प्रकोप निगरानी',
    riskMap: 'जीआईएस जोखिम मानचित्र',
    weatherEnvironment: 'मौसम एवं पर्यावरण',
    laboratory: 'रोग निदान प्रयोगशाला',
    alertsAdvisories: 'अलर्ट एवं परामर्श',
    historicalTrends: 'ऐतिहासिक रुझान',
    reportsAnalytics: 'सरकारी रिपोर्टिंग',
    veterinaryDashboard: 'पशु चिकित्सक केंद्र',
    settings: 'सेटिंग्स एवं विन्यास',
    role: 'वर्तमान भूमिका',
    switchRole: 'भूमिका बदलें',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    reportSymptoms: 'बीमार पशु की रिपोर्ट करें',
    reportMortality: 'पशु मृत्यु की रिपोर्ट करें',
    viewVaccinations: 'टीकाकरण स्थिति देखें',
    contactVeterinarian: 'पशु चिकित्सक से संपर्क करें',
    totalAnimals: 'कुल पशुधन',
    healthy: 'स्वस्थ',
    underObservation: 'निगरानी में',
    affected: 'प्रभावित / बीमार',
    recovered: 'रोगमुक्त',
    deaths: 'कुल मृत्यु',
    vaccinationCoverage: 'टीकाकरण कवरेज',
    openCases: 'सक्रिय मामले',
    riskLevel: 'जोखिम स्तर',
    lowRisk: 'कम जोखिम',
    moderateRisk: 'मध्यम जोखिम',
    highRisk: 'उच्च जोखिम',
    criticalRisk: 'गंभीर जोखिम',
    suspectedDiseases: 'संभावित रोग संकेत',
    recommendedActions: 'सलाह एवं रोकथाम निर्देश',
    disclaimerText: 'महत्वपूर्ण सूचना: यह केवल प्रारंभिक जोखिम मूल्यांकन है। यह पशु चिकित्सक की जांच अथवा प्रयोगशाला पुष्टि का विकल्प नहीं है।',
    offlineMode: 'ऑफ़लाइन मोड सक्रिय (ऑनलाइन होने पर स्वतः सिंक होगा)',
    online: 'क्लाउड से जुड़ा हुआ',
    syncPending: 'रिकॉर्ड ऑफ़लाइन कतार में',
    syncNow: 'अभी सिंक करें',
    syncComplete: 'सभी रिकॉर्ड सफलतापूर्वक सिंक हो गए',
    searchPlaceholder: 'टैग आईडी, केस संख्या, गांव या रोग से खोजें...',
    filterBySpecies: 'सभी प्रजातियां',
    filterByStatus: 'सभी स्थितियां',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    submit: 'रिपोर्ट दर्ज करें',
    details: 'विस्तृत जानकारी',
    species: 'प्रजाति',
    tagNumber: 'ईयर टैग / पहचान संख्या',
    age: 'उम्र (वर्ष)',
    weight: 'वजन (किग्रा)',
    location: 'गांव / फार्म का स्थान',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    loading: 'डेटा लोड हो रहा है...',
    noDataFound: 'कोई रिकॉर्ड नहीं मिला।',
    selectLanguage: 'भाषा चुनें',
    demoModeNotice: 'डेमो वातावरण: पूर्व-लोड डेटा के साथ सक्रिय सिमुलेशन।',
    quickScenarios: 'त्वरित परिदृश्य',
    ivrGateway: 'आईवीआर वॉयस टोल-फ्री गेटवे'
  },
  kn: {
    appName: 'ಲೈವ್‌ಸ್ಟಾಕ್ ಗಾರ್ಡ್',
    appTagline: 'ಜಾನುವಾರು ರೋಗಗಳ ಮುನ್ನೆಚ್ಚರಿಕೆ, ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ನಿರ್ವಹಣೆ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    animals: 'ಪ್ರಾಣಿಗಳು ಮತ್ತು ಹಿಂಡುಗಳು',
    herds: 'ಹಿಂಡು ನಿರ್ವಹಣೆ',
    reportCase: 'ರೋಗದ ವರದಿ ಸಲ್ಲಿಸಿ',
    symptoms: 'ರೋಗಲಕ್ಷಣ ತಪಾಸಣೆ',
    diseaseKnowledgeBase: 'ರೋಗ ಮಾಹಿತಿ ಕೋಶ',
    vaccinations: 'ಲಸಿಕೆ ದಾಖಲೆಗಳು',
    treatments: 'ಚಿಕಿತ್ಸಾ ವಿವರಗಳು',
    mortality: 'ಸಾವಿನ ವರದಿಗಳು',
    outbreaks: 'ಸಾಂಕ್ರಾಮಿಕ ರೋಗ ನಿಗಾ',
    riskMap: 'ಜಿಐಎಸ್ ಅಪಾಯದ ನಕ್ಷೆ',
    weatherEnvironment: 'ಹವಾಮಾನ ಮತ್ತು ಪರಿಸರ',
    laboratory: 'ಪ್ರಯೋಗಾಲಯ',
    alertsAdvisories: 'ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಸಲಹೆಗಳು',
    historicalTrends: 'ಐತಿಹಾಸಿಕ ಪ್ರವೃತ್ತಿಗಳು',
    reportsAnalytics: 'ಸರ್ಕಾರಿ ವರದಿಗಳು',
    veterinaryDashboard: 'ಪಶುವೈದ್ಯಕೀಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    role: 'ಪ್ರಸ್ತುತ ಪಾತ್ರ',
    switchRole: 'ಪಾತ್ರ ಬದಲಾಯಿಸಿ',
    logout: 'ನಿರ್ಗಮಿಸಿ',
    login: 'ಲಾಗಿನ್',
    reportSymptoms: 'ಅನಾರೋಗ್ಯ ವರದಿ ಮಾಡಿ',
    reportMortality: 'ಪ್ರಾಣಿ ಸಾವು ವರದಿ ಮಾಡಿ',
    viewVaccinations: 'ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ ಪರಿಶೀಲಿಸಿ',
    contactVeterinarian: 'ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
    totalAnimals: 'ಒಟ್ಟು ಪ್ರಾಣಿಗಳು',
    healthy: 'ಆರೋಗ್ಯಕರ',
    underObservation: 'ನಿಗಾದಲ್ಲಿ',
    affected: 'ಬಾಧಿತ',
    recovered: 'ಗುಣಮುಖ',
    deaths: 'ಸಾವಿನ ಸಂಖ್ಯೆ',
    vaccinationCoverage: 'ಲಸಿಕೆ ವ್ಯಾಪ್ತಿ',
    openCases: 'ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು',
    riskLevel: 'ಅಪಾಯದ ಮಟ್ಟ',
    lowRisk: 'ಕಡಿಮೆ ಅಪಾಯ',
    moderateRisk: 'ಮಧ್ಯಮ ಅಪಾಯ',
    highRisk: 'ಹೆಚ್ಚಿನ ಅಪಾಯ',
    criticalRisk: 'ತೀವ್ರ ಅಪಾಯ',
    suspectedDiseases: 'ಸಂಭಾವ್ಯ ರೋಗಗಳು',
    recommendedActions: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು',
    disclaimerText: 'ಗಮನಿಸಿ: ಇದು ಕೇವಲ ಮುನ್ನೆಚ್ಚರಿಕೆ ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನವಾಗಿದೆ. ಇದು ಪಶುವೈದ್ಯರ ನೇರ ಪರೀಕ್ಷೆಯನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ.',
    offlineMode: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    online: 'ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ',
    syncPending: 'ದಾಖಲೆಗಳು ಕಾಯುತ್ತಿವೆ',
    syncNow: 'ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ',
    syncComplete: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಸಿಂಕ್ ಆಗಿವೆ',
    searchPlaceholder: 'ಟ್ಯಾಗ್ ಐಡಿ, ಗ್ರಾಮ, ರೋಗದ ಹೆಸರು ಹುಡುಕಿ...',
    filterBySpecies: 'ಎಲ್ಲಾ ಪ್ರಭೇದಗಳು',
    filterByStatus: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    save: 'ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    submit: 'ಸಲ್ಲಿಸಿ',
    details: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    species: 'ಪ್ರಭೇದ',
    tagNumber: 'ಟ್ಯಾಗ್ ಸಂಖ್ಯೆ',
    age: 'ವಯಸ್ಸು',
    weight: 'ತೂಕ',
    location: 'ಸ್ಥಳ',
    status: 'ಸ್ಥಿತಿ',
    actions: 'ಕ್ರಮಗಳು',
    loading: 'ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    noDataFound: 'ಯಾವುದೇ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.',
    selectLanguage: 'ಭಾಷೆ',
    demoModeNotice: 'ಡೆಮೊ ಆವೃತ್ತಿ',
    quickScenarios: 'ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು',
    ivrGateway: 'ಧ್ವನಿ ಐವಿಆರ್ ಗೇಟ್‌ವೇ'
  },
  te: {
    appName: 'లైవ్‌స్టాక్ గార్డ్',
    appTagline: 'పశువుల వ్యాధుల ముందస్తు గుర్తింపు, నివారణ మరియు నిర్వహణ',
    dashboard: 'డాష్‌బోర్డ్',
    animals: 'పశువులు & మందలు',
    herds: 'మంద నిర్వహణ',
    reportCase: 'వ్యాధి సమాచారం అందించండి',
    symptoms: 'లక్షణాల తనిఖీ',
    diseaseKnowledgeBase: 'వ్యాధి విజ్ఞాన సమాచారం',
    vaccinations: 'టీకా రికార్డులు',
    treatments: 'చికిత్స రికార్డులు',
    mortality: 'మరణాల నివేదికలు',
    outbreaks: 'వ్యాధి వ్యాప్తి పర్యవేక్షణ',
    riskMap: 'జీఐఎస్ రిస్క్ మ్యాప్',
    weatherEnvironment: 'వాతావరణం & పర్యావరణం',
    laboratory: 'రోగ నిర్ధారణ ప్రయోగశాల',
    alertsAdvisories: 'హెచ్చరికలు & సూచనలు',
    historicalTrends: 'చారిత్రక ధోరణులు',
    reportsAnalytics: 'ప్రభుత్వ నివేదికలు',
    veterinaryDashboard: 'పశువైద్య కేంద్రం',
    settings: 'సెట్టింగ్‌లు',
    role: 'ప్రస్తుత పాత్ర',
    switchRole: 'పాత్రను మార్చండి',
    logout: 'లాగ్ అవుట్',
    login: 'లాగిన్',
    reportSymptoms: 'అనారోగ్య పశువు సమాచారం',
    reportMortality: 'మరణ సమాచారం నివేదించండి',
    viewVaccinations: 'టీకా షెడ్యూల్ చూడండి',
    contactVeterinarian: 'పశువైద్యుడిని సంప్రదించండి',
    totalAnimals: 'మొత్తం పశువులు',
    healthy: 'ఆరోగ్యంగా ఉన్నవి',
    underObservation: 'పరిశీలనలో ఉన్నవి',
    affected: 'వ్యాధి సోకినవి',
    recovered: 'కోలుకున్నవి',
    deaths: 'మరణాలు',
    vaccinationCoverage: 'టీకా శాతం',
    openCases: 'క్రియాశీల కేసులు',
    riskLevel: 'రిస్క్ స్థాయి',
    lowRisk: 'తక్కువ రిస్క్',
    moderateRisk: 'మధ్యస్థ రిస్క్',
    highRisk: 'అధిక రిస్క్',
    criticalRisk: 'తీవ్రమైన రిస్క్',
    suspectedDiseases: 'అనుమానిత వ్యాధులు',
    recommendedActions: 'నివారణ చర్యలు & సూచనలు',
    disclaimerText: 'గమనిక: ఇది స్క్రీనింగ్ అసెస్‌మెంట్ మాత్రమే. ఇది అర్హత కలిగిన పశువైద్యుడి పరీక్షకు ప్రత్యామ్నాయం కాదు.',
    offlineMode: 'ఆఫ్‌లైన్ మోడ్ సక్రియం చేయబడింది',
    online: 'కనెక్ట్ అయింది',
    syncPending: 'రికార్డులు వేచి ఉన్నాయి',
    syncNow: 'ఇప్పుడే సింక్ చేయండి',
    syncComplete: 'అన్ని రికార్డులు సింక్ చేయబడ్డాయి',
    searchPlaceholder: 'ట్యాగ్ సంఖ్య, గ్రామం, వ్యాధి ద్వారా శోధించండి...',
    filterBySpecies: 'అన్ని రకాలు',
    filterByStatus: 'అన్ని స్థితులు',
    save: 'సేవ్ చేయండి',
    cancel: 'రద్దు చేయండి',
    submit: 'సమర్పించండి',
    details: 'పూర్తి వివరాలు',
    species: 'రకం',
    tagNumber: 'ట్యాగ్ నంబర్',
    age: 'వయస్సు',
    weight: 'బరువు',
    location: 'గ్రామం / ప్రాంతం',
    status: 'స్థితి',
    actions: 'చర్యలు',
    loading: 'సమాచారం లోడ్ అవుతోంది...',
    noDataFound: 'సమాచారం అందుబాటులో లేదు.',
    selectLanguage: 'భాష',
    demoModeNotice: 'డెమో మోడ్',
    quickScenarios: 'డెమో దృశ్యాలు',
    ivrGateway: 'ఐవిఆర్ వాయిస్ గేట్‌వే'
  }
};
