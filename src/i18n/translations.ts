import { LanguageCode } from '../types';
import { store } from '../services/store';
import { useState, useEffect, useCallback } from 'react';

export interface TranslationDictionary {
  // Navigation & Core App
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
  register: string;
  profile: string;
  selectLanguage: string;
  demoModeNotice: string;
  quickScenarios: string;
  ivrGateway: string;
  home: string;

  // Farmer & Dashboard Metrics
  reportSymptoms: string;
  reportSickAnimal: string;
  reportMortality: string;
  viewVaccinations: string;
  contactVeterinarian: string;
  emergencyHelpline: string;
  fieldVisits: string;
  myHerd: string;
  totalAnimals: string;
  healthy: string;
  underObservation: string;
  affected: string;
  recovered: string;
  deaths: string;
  vaccinationCoverage: string;
  openCases: string;
  activeCases: string;
  riskLevel: string;
  lowRisk: string;
  moderateRisk: string;
  highRisk: string;
  criticalRisk: string;
  suspectedDiseases: string;
  possibleDisease: string;
  recommendedActions: string;
  disclaimerText: string;
  quickActions: string;
  recentActivity: string;
  viewAll: string;
  whatToDoNow: string;
  safeCare: string;
  importantNotice: string;

  // Sync & Network States
  offlineMode: string;
  online: string;
  syncPending: string;
  syncNow: string;
  syncComplete: string;
  allSynced: string;

  // Table, Forms & Common Actions
  searchPlaceholder: string;
  filterBySpecies: string;
  filterByStatus: string;
  filterByDistrict: string;
  allSpecies: string;
  allStatuses: string;
  save: string;
  cancel: string;
  submit: string;
  next: string;
  previous: string;
  back: string;
  edit: string;
  delete: string;
  view: string;
  details: string;
  close: string;
  confirm: string;
  export: string;
  exportCsv: string;
  exportPdf: string;
  print: string;
  refresh: string;
  apply: string;
  reset: string;

  // Field Names
  species: string;
  breed: string;
  tagNumber: string;
  age: string;
  weight: string;
  location: string;
  state: string;
  district: string;
  subDistrict: string;
  village: string;
  pincode: string;
  date: string;
  time: string;
  status: string;
  actions: string;
  notes: string;
  observations: string;
  loading: string;
  noDataFound: string;
  noNotifications: string;
  error: string;
  success: string;

  // Clinical & Triage
  aiCheck: string;
  modelConfidence: string;
  differentialScreening: string;
  laboratoryTest: string;
  quarantineRequired: string;
  vaccineDose: string;
  sampleCollection: string;
  veterinaryReferral: string;
  callDoctor: string;
  biosecurityNotice: string;

  // Farmer Medical Terminology with Explanations
  symptomsTerm: string;
  quarantineTerm: string;
  vaccinationTerm: string;
  outbreakTerm: string;
  riskLevelTerm: string;
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
    register: 'Register New Account',
    profile: 'User Profile',
    selectLanguage: 'Language',
    demoModeNotice: 'Demo Environment: Live simulation active with pre-seeded district surveillance data.',
    quickScenarios: 'Quick Scenarios',
    ivrGateway: 'IVR Voice Toll-Free Gateway',
    home: 'Home',

    reportSymptoms: 'Report Sick Animal',
    reportSickAnimal: 'Report Sick Animal',
    reportMortality: 'Report Animal Death',
    viewVaccinations: 'Check Vaccine Schedule',
    contactVeterinarian: 'Call Field Veterinarian',
    emergencyHelpline: 'Emergency Doctor Helpline',
    fieldVisits: 'Doctor & Para-Vet Visits',
    myHerd: 'My Animals',
    totalAnimals: 'Total Livestock',
    healthy: 'Healthy',
    underObservation: 'Under Observation',
    affected: 'Symptomatic / Sick',
    recovered: 'Recovered',
    deaths: 'Mortalities',
    vaccinationCoverage: 'Vaccination Rate',
    openCases: 'Active Triage Cases',
    activeCases: 'Active Cases',
    riskLevel: 'Biosecurity Risk Level',
    lowRisk: 'LOW RISK',
    moderateRisk: 'MODERATE RISK',
    highRisk: 'HIGH RISK',
    criticalRisk: 'CRITICAL RISK',
    suspectedDiseases: 'Differential Screening Matches',
    possibleDisease: 'Possible Disease (AI Check)',
    recommendedActions: 'Preventive Advisory & Bio-containment',
    disclaimerText: 'Decision Support Notice: This screening risk assessment does not replace examination or laboratory confirmation by a qualified veterinary professional.',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Clinical Activity',
    viewAll: 'View All',
    whatToDoNow: 'WHAT TO DO NOW?',
    safeCare: 'Safe Home & Shed Care',
    importantNotice: 'Important Health Notice',

    offlineMode: 'Offline Mode Active (Records will auto-sync)',
    online: 'Connected & Synchronized',
    syncPending: 'records queued offline',
    syncNow: 'Sync to Cloud Now',
    syncComplete: 'All records synchronized successfully',
    allSynced: 'All data synchronized',

    searchPlaceholder: 'Search by Tag ID, Case #, Village, Disease...',
    filterBySpecies: 'All Species',
    filterByStatus: 'All Statuses',
    filterByDistrict: 'All Districts',
    allSpecies: 'All Species',
    allStatuses: 'All Statuses',
    save: 'Save Record',
    cancel: 'Cancel',
    submit: 'Submit Report',
    next: 'Next Step',
    previous: 'Previous',
    back: 'Back',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    details: 'View Full Details',
    close: 'Close',
    confirm: 'Confirm Action',
    export: 'Export Data',
    exportCsv: 'Export CSV',
    exportPdf: 'Print / PDF Report',
    print: 'Print',
    refresh: 'Refresh Data',
    apply: 'Apply Filters',
    reset: 'Reset',

    species: 'Species',
    breed: 'Breed',
    tagNumber: 'Ear Tag / ID',
    age: 'Age (Years)',
    weight: 'Weight (Kg)',
    location: 'Village / Farm Location',
    state: 'State',
    district: 'District',
    subDistrict: 'Sub-District / Taluka',
    village: 'Village',
    pincode: 'PIN Code',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    actions: 'Actions',
    notes: 'Observations & Clinical Notes',
    observations: 'Symptoms & Observations',
    loading: 'Loading surveillance data...',
    noDataFound: 'No records matching current criteria.',
    noNotifications: 'No active notifications or alerts.',
    error: 'An error occurred. Please try again.',
    success: 'Operation completed successfully.',

    aiCheck: 'AI Disease Screening',
    modelConfidence: 'Model Confidence',
    differentialScreening: 'Differential Screening Ranking',
    laboratoryTest: 'Laboratory Confirmation Test',
    quarantineRequired: 'Immediate Isolation Required',
    vaccineDose: 'Vaccine Dose',
    sampleCollection: 'Sample Collection for Testing',
    veterinaryReferral: 'Veterinary Officer Review',
    callDoctor: 'Call Doctor / Para-Vet',
    biosecurityNotice: 'Biosecurity and containment protocol must be enforced.',

    symptomsTerm: 'Symptoms (Signs of illness)',
    quarantineTerm: 'Quarantine (Keep the sick animal separate)',
    vaccinationTerm: 'Vaccination (Disease prevention injection)',
    outbreakTerm: 'Outbreak (Disease spreading in an area)',
    riskLevelTerm: 'Risk Level (Danger level)'
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
    register: 'नया खाता बनाएं',
    profile: 'उपयोगकर्ता प्रोफ़ाइल',
    selectLanguage: 'भाषा चुनें',
    demoModeNotice: 'डेमो वातावरण: पूर्व-लोड डेटा के साथ सक्रिय सिमुलेशन।',
    quickScenarios: 'त्वरित परिदृश्य',
    ivrGateway: 'आईवीआर वॉयस टोल-फ्री गेटवे',
    home: 'होम',

    reportSymptoms: 'बीमार पशु की सूचना दें',
    reportSickAnimal: 'बीमार पशु की रिपोर्ट करें',
    reportMortality: 'पशु मृत्यु की रिपोर्ट करें',
    viewVaccinations: 'टीकाकरण स्थिति देखें',
    contactVeterinarian: 'पशु चिकित्सक से संपर्क करें',
    emergencyHelpline: 'आपातकालीन डॉक्टर हेल्पलाइन',
    fieldVisits: 'डॉक्टर एवं पैरा-वेट विज़िट',
    myHerd: 'मेरे पशु',
    totalAnimals: 'कुल पशुधन',
    healthy: 'स्वस्थ',
    underObservation: 'निगरानी में',
    affected: 'प्रभावित / बीमार',
    recovered: 'रोगमुक्त',
    deaths: 'कुल मृत्यु',
    vaccinationCoverage: 'टीकाकरण कवरेज',
    openCases: 'सक्रिय मामले',
    activeCases: 'सक्रिय मामले',
    riskLevel: 'जोखिम स्तर (खतरे का स्तर)',
    lowRisk: 'कम जोखिम',
    moderateRisk: 'मध्यम जोखिम',
    highRisk: 'उच्च जोखिम',
    criticalRisk: 'गंभीर जोखिम (आपातकालीन)',
    suspectedDiseases: 'संभावित रोग संकेत',
    possibleDisease: 'संभावित बीमारी (एआई जांच)',
    recommendedActions: 'सलाह एवं रोकथाम निर्देश',
    disclaimerText: 'महत्वपूर्ण सूचना: यह केवल प्रारंभिक जोखिम मूल्यांकन है। यह पशु चिकित्सक की जांच अथवा प्रयोगशाला पुष्टि का विकल्प नहीं है।',
    quickActions: 'त्वरित कार्य',
    recentActivity: 'हालिया गतिविधियां',
    viewAll: 'सभी देखें',
    whatToDoNow: 'अब क्या करें?',
    safeCare: 'सुरक्षित घरेलू एवं शेड देखभाल',
    importantNotice: 'महत्वपूर्ण स्वास्थ्य सूचना',

    offlineMode: 'ऑफ़लाइन मोड सक्रिय (ऑनलाइन होने पर स्वतः सिंक होगा)',
    online: 'क्लाउड से जुड़ा हुआ',
    syncPending: 'रिकॉर्ड ऑफ़लाइन कतार में',
    syncNow: 'अभी सिंक करें',
    syncComplete: 'सभी रिकॉर्ड सफलतापूर्वक सिंक हो गए',
    allSynced: 'सभी डेटा सिंक हो चुका है',

    searchPlaceholder: 'टैग आईडी, केस संख्या, गांव या रोग से खोजें...',
    filterBySpecies: 'सभी प्रजातियां',
    filterByStatus: 'सभी स्थितियां',
    filterByDistrict: 'सभी जिले',
    allSpecies: 'सभी प्रजातियां',
    allStatuses: 'सभी स्थितियां',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    submit: 'रिपोर्ट दर्ज करें',
    next: 'आगे बढ़ें',
    previous: 'पिछला',
    back: 'पीछे जाएं',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    view: 'देखें',
    details: 'विस्तृत जानकारी',
    close: 'बंद करें',
    confirm: 'पुष्टि करें',
    export: 'डेटा निर्यात करें',
    exportCsv: 'सीएसवी निर्यात',
    exportPdf: 'प्रिंट / पीडीएफ रिपोर्ट',
    print: 'प्रिंट करें',
    refresh: 'ताज़ा करें',
    apply: 'लागू करें',
    reset: 'रीसेट',

    species: 'प्रजाति',
    breed: 'नस्ल',
    tagNumber: 'ईयर टैग / पहचान संख्या',
    age: 'उम्र (वर्ष)',
    weight: 'वजन (किग्रा)',
    location: 'गांव / फार्म का स्थान',
    state: 'राज्य',
    district: 'जिला',
    subDistrict: 'तहसील / तालुका',
    village: 'गांव',
    pincode: 'पिन कोड',
    date: 'दिनांक',
    time: 'समय',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    notes: 'अवलोकन एवं टिप्पणियां',
    observations: 'लक्षण एवं अवलोकन',
    loading: 'डेटा लोड हो रहा है...',
    noDataFound: 'कोई रिकॉर्ड नहीं मिला।',
    noNotifications: 'कोई नई सूचना या अलर्ट नहीं है।',
    error: 'त्रुटि हुई। कृपया पुनः प्रयास करें।',
    success: 'कार्य सफलतापूर्वक पूरा हुआ।',

    aiCheck: 'एआई रोग जांच',
    modelConfidence: 'मॉडल सटीकता',
    differentialScreening: 'संभावित बीमारियों की सूची',
    laboratoryTest: 'प्रयोगशाला जांच',
    quarantineRequired: 'तुरंत अलग रखना आवश्यक',
    vaccineDose: 'टीका खुराक',
    sampleCollection: 'जांच हेतु नमूना संग्रह',
    veterinaryReferral: 'पशु चिकित्सक को रेफर करें',
    callDoctor: 'डॉक्टर / पैरा-वेट को बुलाएं',
    biosecurityNotice: 'जैव सुरक्षा और रोकथाम नियमों का पालन करें।',

    symptomsTerm: 'Symptoms (बीमारी के लक्षण)',
    quarantineTerm: 'Quarantine (बीमार पशु को अलग रखें)',
    vaccinationTerm: 'Vaccination (रोग रोकथाम टीका / इंजेक्शन)',
    outbreakTerm: 'Outbreak (इलाके में बीमारी का फैलाव)',
    riskLevelTerm: 'Risk Level (खतरे का स्तर)'
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
    register: 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ',
    profile: 'ಪ್ರೊಫೈಲ್',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    demoModeNotice: 'ಡೆಮೊ ಆವೃತ್ತಿ: ಪರೀಕ್ಷಾ ದತ್ತಾಂಶದೊಂದಿಗೆ ಸಕ್ರಿಯವಾಗಿದೆ.',
    quickScenarios: 'ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು',
    ivrGateway: 'ಧ್ವನಿ ಐವಿಆರ್ ಗೇಟ್‌ವೇ',
    home: 'ಮುಖಪುಟ',

    reportSymptoms: 'ಅನಾರೋಗ್ಯ ವರದಿ ಮಾಡಿ',
    reportSickAnimal: 'ಅನಾರೋಗ್ಯದ ಪ್ರಾಣಿ ವರದಿ ಮಾಡಿ',
    reportMortality: 'ಪ್ರಾಣಿ ಸಾವು ವರದಿ ಮಾಡಿ',
    viewVaccinations: 'ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ ಪರಿಶೀಲಿಸಿ',
    contactVeterinarian: 'ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
    emergencyHelpline: 'ತುರ್ತು ವೈದ್ಯಕೀಯ ಸಹಾಯವಾಣಿ',
    fieldVisits: 'ವೈದ್ಯರ ಭೇಟಿಗಳು',
    myHerd: 'ನನ್ನ ಪ್ರಾಣಿಗಳು',
    totalAnimals: 'ಒಟ್ಟು ಪ್ರಾಣಿಗಳು',
    healthy: 'ಆರೋಗ್ಯಕರ',
    underObservation: 'ನಿಗಾದಲ್ಲಿ',
    affected: 'ಬಾಧಿತ / ಅನಾರೋಗ್ಯ',
    recovered: 'ಗುಣಮುಖ',
    deaths: 'ಸಾವಿನ ಸಂಖ್ಯೆ',
    vaccinationCoverage: 'ಲಸಿಕೆ ವ್ಯಾಪ್ತಿ',
    openCases: 'ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು',
    activeCases: 'ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು',
    riskLevel: 'ಅಪಾಯದ ಮಟ್ಟ',
    lowRisk: 'ಕಡಿಮೆ ಅಪಾಯ',
    moderateRisk: 'ಮಧ್ಯಮ ಅಪಾಯ',
    highRisk: 'ಹೆಚ್ಚಿನ ಅಪಾಯ',
    criticalRisk: 'ತೀವ್ರ ಅಪಾಯ (ತುರ್ತು)',
    suspectedDiseases: 'ಸಂಭಾವ್ಯ ರೋಗಗಳು',
    possibleDisease: 'ಸಂಭಾವ್ಯ ರೋಗ (ಎಐ ತಪಾಸಣೆ)',
    recommendedActions: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು',
    disclaimerText: 'ಗಮನಿಸಿ: ಇದು ಕೇವಲ ಮುನ್ನೆಚ್ಚರಿಕೆ ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನವಾಗಿದೆ. ಇದು ಪಶುವೈದ್ಯರ ನೇರ ಪರೀಕ್ಷೆಯನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ.',
    quickActions: 'ತ್ವರಿತ ಕ್ರಮಗಳು',
    recentActivity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
    whatToDoNow: 'ಈಗ ಏನು ಮಾಡಬೇಕು?',
    safeCare: 'ಸುರಕ್ಷಿತ ಮನೆ ಮತ್ತು ಕೊಟ್ಟಿಗೆ ಆರೈಕೆ',
    importantNotice: 'ಮುಖ್ಯ ಆರೋಗ್ಯ ಸೂಚನೆ',

    offlineMode: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    online: 'ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ',
    syncPending: 'ದಾಖಲೆಗಳು ಕಾಯುತ್ತಿವೆ',
    syncNow: 'ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ',
    syncComplete: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಸಿಂಕ್ ಆಗಿವೆ',
    allSynced: 'ಎಲ್ಲಾ ಮಾಹಿತಿ ಸಿಂಕ್ ಆಗಿದೆ',

    searchPlaceholder: 'ಟ್ಯಾಗ್ ಐಡಿ, ಗ್ರಾಮ, ರೋಗದ ಹೆಸರು ಹುಡುಕಿ...',
    filterBySpecies: 'ಎಲ್ಲಾ ಪ್ರಭೇದಗಳು',
    filterByStatus: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    filterByDistrict: 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು',
    allSpecies: 'ಎಲ್ಲಾ ಪ್ರಭೇದಗಳು',
    allStatuses: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    save: 'ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    submit: 'ವರದಿ ಸಲ್ಲಿಸಿ',
    next: 'ಮುಂದೆ',
    previous: 'ಹಿಂದಿನ',
    back: 'ಹಿಂದೆ',
    edit: 'ತಿದ್ದುಪಡಿ',
    delete: 'ಅಳಿಸಿ',
    view: 'ವೀಕ್ಷಿಸಿ',
    details: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    close: 'ಮುಚ್ಚಿ',
    confirm: 'ಖಚಿತಪಡಿಸಿ',
    export: 'ಮಾಹಿತಿ ಡೌನ್‌ಲೋಡ್',
    exportCsv: 'ಸಿಎಸ್‌ವಿ ಡೌನ್‌ಲೋಡ್',
    exportPdf: 'ಪಿಡಿಎಫ್ ವರದಿ',
    print: 'ಪ್ರಿಂಟ್ ಮಾಡಿ',
    refresh: 'ನವೀಕರಿಸಿ',
    apply: 'ಅನ್ವಯಿಸಿ',
    reset: 'ಮರುಹೊಂದಿಸಿ',

    species: 'ಪ್ರಭೇದ',
    breed: 'ತಳಿ',
    tagNumber: 'ಟ್ಯಾಗ್ ಸಂಖ್ಯೆ',
    age: 'ವಯಸ್ಸು (ವರ್ಷಗಳು)',
    weight: 'ತೂಕ (ಕೆಜಿ)',
    location: 'ಸ್ಥಳ / ಗ್ರಾಮ',
    state: 'ರಾಜ್ಯ',
    district: 'ಜಿಲ್ಲೆ',
    subDistrict: 'ತಾಲೂಕು',
    village: 'ಗ್ರಾಮ',
    pincode: 'ಪಿನ್ ಕೋಡ್',
    date: 'ದಿನಾಂಕ',
    time: 'ಸಮಯ',
    status: 'ಸ್ಥಿತಿ',
    actions: 'ಕ್ರಮಗಳು',
    notes: 'ಟಿಪ್ಪಣಿಗಳು',
    observations: 'ರೋಗಲಕ್ಷಣಗಳು ಮತ್ತು ವಿವರಣೆ',
    loading: 'ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    noDataFound: 'ಯಾವುದೇ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.',
    noNotifications: 'ಯಾವುದೇ ಹೊಸ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.',
    error: 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.',
    success: 'ಕಾರ್ಯ ಯಶಸ್ವಿಯಾಗಿದೆ.',

    aiCheck: 'ಎಐ ರೋಗ ತಪಾಸಣೆ',
    modelConfidence: 'ಮಾದರಿ ನಿಖರತೆ',
    differentialScreening: 'ಸಂಭಾವ್ಯ ರೋಗಗಳ ಪಟ್ಟಿ',
    laboratoryTest: 'ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆ',
    quarantineRequired: 'ಪ್ರತ್ಯೇಕವಾಗಿರಿಸುವುದು ಕಡ್ಡಾಯ',
    vaccineDose: 'ಲಸಿಕೆ ಡೋಸ್',
    sampleCollection: 'ಮಾದರಿ ಸಂಗ್ರಹ',
    veterinaryReferral: 'ಪಶುವೈದ್ಯರ ಪರಿಶೀಲನೆ',
    callDoctor: 'ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ',
    biosecurityNotice: 'ರೋಗ ನಿಯಂತ್ರಣ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸಿ.',

    symptomsTerm: 'Symptoms (ರೋಗದ ಲಕ್ಷಣಗಳು)',
    quarantineTerm: 'Quarantine (ಅನಾರೋಗ್ಯದ ಪ್ರಾಣಿಯನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ)',
    vaccinationTerm: 'Vaccination (ರೋಗ ತಡೆಗಟ್ಟುವ ಲಸಿಕೆ)',
    outbreakTerm: 'Outbreak (ಪ್ರದೇಶದಲ್ಲಿ ರೋಗ ಹರಡುವಿಕೆ)',
    riskLevelTerm: 'Risk Level (ಅಪಾಯದ ಮಟ್ಟ)'
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
    register: 'కొత్త ఖాతా సృష్టించండి',
    profile: 'ప్రొఫైల్',
    selectLanguage: 'భాషను ఎంచుకోండి',
    demoModeNotice: 'డెమో మోడ్: ప్రత్యక్ష అనుకరణ క్రియాశీలంగా ఉంది.',
    quickScenarios: 'డెమో దృశ్యాలు',
    ivrGateway: 'ఐవిఆర్ వాయిస్ గేట్‌వే',
    home: 'హోమ్',

    reportSymptoms: 'అనారోగ్య పశువు సమాచారం',
    reportSickAnimal: 'అనారోగ్య పశువును నివేదించండి',
    reportMortality: 'మరణ సమాచారం నివేదించండి',
    viewVaccinations: 'టీకా షెడ్యూల్ చూడండి',
    contactVeterinarian: 'పశువైద్యుడిని సంప్రదించండి',
    emergencyHelpline: 'అత్యవసర వైద్య హెల్ప్‌లైన్',
    fieldVisits: 'వైద్యుల సందర్శనలు',
    myHerd: 'నా పశువులు',
    totalAnimals: 'మొత్తం పశువులు',
    healthy: 'ఆరోగ్యంగా ఉన్నవి',
    underObservation: 'పరిశీలనలో ఉన్నవి',
    affected: 'వ్యాధి సోకినవి',
    recovered: 'కోలుకున్నవి',
    deaths: 'మరణాలు',
    vaccinationCoverage: 'టీకా శాతం',
    openCases: 'క్రియాశీల కేసులు',
    activeCases: 'క్రియాశీల కేసులు',
    riskLevel: 'రిస్క్ స్థాయి (ప్రమాద తీవ్రత)',
    lowRisk: 'తక్కువ ప్రమాదం',
    moderateRisk: 'మధ్యస్థ ప్రమాదం',
    highRisk: 'అధిక ప్రమాదం',
    criticalRisk: 'తీవ్రమైన ప్రమాదం (అత్యవసరం)',
    suspectedDiseases: 'అనుమానిత వ్యాధులు',
    possibleDisease: 'అనుమానిత వ్యాధి (AI తనిఖీ)',
    recommendedActions: 'నివారణ చర్యలు & సూచనలు',
    disclaimerText: 'గమనిక: ఇది స్క్రీనింగ్ అసెస్‌మెంట్ మాత్రమే. ఇది అర్హత కలిగిన పశువైద్యుడి పరీక్షకు ప్రత్యామ్నాయం కాదు.',
    quickActions: 'త్వరిత చర్యలు',
    recentActivity: 'ఇటీవలి కార్యకలాపాలు',
    viewAll: 'అన్నీ చూడండి',
    whatToDoNow: 'ఇప్పుడు ఏమి చేయాలి?',
    safeCare: 'సురక్షిత సంరక్షణ సూచనలు',
    importantNotice: 'ముఖ్యమైన ఆరోగ్య ప్రకటన',

    offlineMode: 'ఆఫ్‌లైన్ మోడ్ సక్రియం చేయబడింది',
    online: 'కనెక్ట్ అయింది',
    syncPending: 'రికార్డులు వేచి ఉన్నాయి',
    syncNow: 'ఇప్పుడే సింక్ చేయండి',
    syncComplete: 'అన్ని రికార్డులు సింక్ చేయబడ్డాయి',
    allSynced: 'డేటా పూర్తిగా సింక్ అయింది',

    searchPlaceholder: 'ట్యాగ్ సంఖ్య, గ్రామం, వ్యాధి ద్వారా శోధించండి...',
    filterBySpecies: 'అన్ని రకాలు',
    filterByStatus: 'అన్ని స్థితులు',
    filterByDistrict: 'అన్ని జిల్లాలు',
    allSpecies: 'అన్ని రకాలు',
    allStatuses: 'అన్ని స్థితులు',
    save: 'సేవ్ చేయండి',
    cancel: 'రద్దు చేయండి',
    submit: 'సమర్పించండి',
    next: 'తరువాత',
    previous: 'మునుపటి',
    back: 'వెనుకకు',
    edit: 'సవరించు',
    delete: 'తొలగించు',
    view: 'చూడండి',
    details: 'పూర్తి వివరాలు',
    close: 'మూసివేయి',
    confirm: 'నిర్ధారించండి',
    export: 'డేటాను డౌన్‌లోడ్ చేయండి',
    exportCsv: 'CSV డౌన్‌లోడ్',
    exportPdf: 'PDF నివేదిక',
    print: 'ప్రింట్ చేయండి',
    refresh: 'తాజాకరించు',
    apply: 'వర్తింపజేయి',
    reset: 'రీసెట్',

    species: 'రకం',
    breed: 'జాతి',
    tagNumber: 'ట్యాగ్ నంబర్',
    age: 'వయస్సు (సంవత్సరాలు)',
    weight: 'బరువు (కేజీలు)',
    location: 'గ్రామం / ప్రాంతం',
    state: 'రాష్ట్రం',
    district: 'జిల్లా',
    subDistrict: 'మండలం / తాలూకా',
    village: 'గ్రామం',
    pincode: 'పిన్ కోడ్',
    date: 'తేదీ',
    time: 'సమయం',
    status: 'స్థితి',
    actions: 'చర్యలు',
    notes: 'గమనికలు & వివరాలు',
    observations: 'లక్షణాలు & పరిశీలనలు',
    loading: 'సమాచారం లోడ్ అవుతోంది...',
    noDataFound: 'సమాచారం అందుబాటులో లేదు.',
    noNotifications: 'ఎటువంటి కొత్త నోటిఫికేషన్‌లు లేవు.',
    error: 'లోపం సంభవించింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    success: 'విజయవంతంగా పూర్తయింది.',

    aiCheck: 'AI వ్యాధి స్క్రీనింగ్',
    modelConfidence: 'ఖచ్చితత్వ అంచనా',
    differentialScreening: 'అనుమానిత వ్యాధుల జాబితా',
    laboratoryTest: 'ల్యాబ్ నిర్ధారణ పరీక్ష',
    quarantineRequired: 'పశువును వేరుగా ఉంచడం తప్పనిసరి',
    vaccineDose: 'టీకా మోతాదు',
    sampleCollection: 'పరీక్ష కోసం నమూనా సేకరణ',
    veterinaryReferral: 'పశువైద్య అధికారికి పంపండి',
    callDoctor: 'డాక్టర్‌ను పిలవండి',
    biosecurityNotice: 'జీవ రక్షణ నియమాలను ఖచ్చితంగా పాటించండి.',

    symptomsTerm: 'Symptoms (వ్యాధి లక్షణాలు)',
    quarantineTerm: 'Quarantine (అనారోగ్య పశువును వేరుగా ఉంచండి)',
    vaccinationTerm: 'Vaccination (వ్యాధి నివారణ టీకా)',
    outbreakTerm: 'Outbreak (ప్రాంతంలో వ్యాధి వ్యాప్తి)',
    riskLevelTerm: 'Risk Level (ప్రమాద స్థాయి)'
  },

  mr: {
    appName: 'लाइव्हस्टॉक गार्ड',
    appTagline: 'जनावरांच्या आजारांची पूर्वतपासणी, प्रतिबंध व व्यवस्थापन प्रणाली',
    dashboard: 'डॅशबोर्ड',
    animals: 'जनावरे आणि कळप',
    herds: 'कळप व्यवस्थापन',
    reportCase: 'आजाराची माहिती द्या',
    symptoms: 'लक्षण तपासणी',
    diseaseKnowledgeBase: 'रोग माहितीकोश',
    vaccinations: 'लसीकरण नोंदी',
    treatments: 'उपचार इतिहास',
    mortality: 'मृत्यू अहवाल',
    outbreaks: 'साथरोग नियंत्रण व देखरेख',
    riskMap: 'जीआयएस नकाशा',
    weatherEnvironment: 'हवामान आणि पर्यावरण',
    laboratory: 'रोगनिदान प्रयोगशाळा',
    alertsAdvisories: 'सतर्कता आणि सूचना',
    historicalTrends: 'ऐतिहासिक ट्रेंड्स',
    reportsAnalytics: 'सरकारी अहवाल',
    veterinaryDashboard: 'पशुवैद्यकीय केंद्र',
    settings: 'सेटिंग्ज व संरचना',
    role: 'सध्याची भूमिका',
    switchRole: 'भूमिका बदला',
    logout: 'बाहेर पडा',
    login: 'लॉग इन करा',
    register: 'नवीन खाते तयार करा',
    profile: 'प्रोफाइल',
    selectLanguage: 'भाषा निवडा',
    demoModeNotice: 'डेमो वातावरण: पूर्व-नोंदणीकृत माहितीसह थेट सिम्युलेशन सुरु आहे.',
    quickScenarios: 'प्रात्यक्षिक प्रसंग (Scenarios)',
    ivrGateway: 'टोल-फ्री आयव्हीआर व्हॉइस गेटवे',
    home: 'मुख्यपृष्ठ',

    reportSymptoms: 'आजारी जनावराची तक्रार नोंदवा',
    reportSickAnimal: 'आजारी जनावराची माहिती द्या',
    reportMortality: 'जनावर मृत्यूची नोंद करा',
    viewVaccinations: 'लसीकरण वेळापत्रक तपासा',
    contactVeterinarian: 'पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा',
    emergencyHelpline: 'आपत्कालीन डॉक्टर हेल्पलाइन',
    fieldVisits: 'डॉक्टर व पशुसंवर्धन अधिकारी भेटी',
    myHerd: 'माझी जनावरे',
    totalAnimals: 'एकूण पशुधन',
    healthy: 'निरोगी',
    underObservation: 'निरीक्षणाखाली',
    affected: 'बाधित / आजारी',
    recovered: 'बरे झालेले',
    deaths: 'एकूण मृत्यू',
    vaccinationCoverage: 'लसीकरण प्रमाण',
    openCases: 'सक्रिय केसेस',
    activeCases: 'सक्रिय केसेस',
    riskLevel: 'धोक्याची पातळी',
    lowRisk: 'कमी धोका',
    moderateRisk: 'मध्यम धोका',
    highRisk: 'जास्त धोका',
    criticalRisk: 'अति-धोकादायक (तातडीची गरज)',
    suspectedDiseases: 'संभाव्य आजार',
    possibleDisease: 'संभाव्य आजार (AI तपासणी)',
    recommendedActions: 'प्रतिबंधात्मक उपाय व सूचना',
    disclaimerText: 'महत्त्वाची सूचना: हे केवळ प्राथमिक एआय स्क्रिनिंग मूल्यांकन आहे. अंतिम निदानासाठी पशुवैद्यकाची प्रत्यक्ष तपासणी आवश्यक आहे.',
    quickActions: 'त्वरित कृती',
    recentActivity: 'नुकतीच झालेली नोंद व हालचाली',
    viewAll: 'सर्व पहा',
    whatToDoNow: 'आता काय करावे?',
    safeCare: 'घरी व गोठ्यात घ्यायची काळजी',
    importantNotice: 'महत्त्वाची आरोग्य सूचना',

    offlineMode: 'ऑफलाइन मोड सक्रिय (इंटरनेट आल्यावर माहिती सिंक होईल)',
    online: 'क्लाउडशी जोडलेले',
    syncPending: 'नोंदी ऑफलाइन रांगेत आहेत',
    syncNow: 'आत्ताच सिंक करा',
    syncComplete: 'सर्व नोंदी यशस्वीरित्या सिंक झाल्या',
    allSynced: 'सर्व डेटा अद्ययावत आहे',

    searchPlaceholder: 'टॅग आयडी, केस क्रमांक, गाव किंवा आजाराने शोधा...',
    filterBySpecies: 'सर्व प्रजाती',
    filterByStatus: 'सर्व स्थिती',
    filterByDistrict: 'सर्व जिल्हे',
    allSpecies: 'सर्व प्रजाती',
    allStatuses: 'सर्व स्थिती',
    save: 'माहिती जतन करा',
    cancel: 'रद्द करा',
    submit: 'अहवाल सादर करा',
    next: 'पुढे जा',
    previous: 'मागे',
    back: 'मागे फिरा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    view: 'पहा',
    details: 'सविस्तर माहिती पहा',
    close: 'बंद करा',
    confirm: 'पुष्टी करा',
    export: 'डेटा डाउनलोड करा',
    exportCsv: 'सीएसव्ही डाउनलोड',
    exportPdf: 'प्रिंट / पीडीएफ अहवाल',
    print: 'प्रिंट करा',
    refresh: 'ताजे करा',
    apply: 'लागू करा',
    reset: 'रीसेट करा',

    species: 'प्रजाती',
    breed: 'नस्ल / जात',
    tagNumber: 'इयर टॅग / ओळख क्रमांक',
    age: 'वय (वर्षे)',
    weight: 'वजन (किलो)',
    location: 'गाव / शेताचे ठिकाण',
    state: 'राज्य',
    district: 'जिल्हा',
    subDistrict: 'तालुका',
    village: 'गाव',
    pincode: 'पिन कोड',
    date: 'तारीख',
    time: 'वेळ',
    status: 'स्थिती',
    actions: 'कृती',
    notes: 'नोंदी व निरीक्षणे',
    observations: 'लक्षणे व निरीक्षणे',
    loading: 'माहिती लोड होत आहे...',
    noDataFound: 'कोणतीही नोंद सापडली नाही.',
    noNotifications: 'कोणतीही नवीन सूचना किंवा अलर्ट नाही.',
    error: 'त्रुटी आढळली. कृपया पुन्हा प्रयत्न करा.',
    success: 'कृती यशस्वीरित्या पूर्ण झाली.',

    aiCheck: 'एआय आजार तपासणी',
    modelConfidence: 'मॉडेल अचूकता',
    differentialScreening: 'संभाव्य आजारांची यादी',
    laboratoryTest: 'प्रयोगशाळा तपासणी',
    quarantineRequired: 'आजारी जनावराला तात्काळ वेगळे ठेवा',
    vaccineDose: 'लस डोस',
    sampleCollection: 'तपासणीसाठी नमुना संकलन',
    veterinaryReferral: 'पशुवैद्यकीय अधिकाऱ्यांकडे पाठवा',
    callDoctor: 'डॉक्टर / पशुवैद्यकीय मदत बोलवा',
    biosecurityNotice: 'गोठ्यात जैव-सुरक्षा व निर्जंतुकीकरण नियमांचे पालन करा.',

    symptomsTerm: 'Symptoms (आजाराची लक्षणे)',
    quarantineTerm: 'Quarantine (आजारी जनावराला वेगळे ठेवा)',
    vaccinationTerm: 'Vaccination (रोग प्रतिबंधक लस / इंजेक्शन)',
    outbreakTerm: 'Outbreak (परिसरात आजाराचा फैलाव)',
    riskLevelTerm: 'Risk Level (धोक्याची पातळी)'
  }
};

/**
 * Direct string translation lookup helper with fallback
 */
export function t(
  key: keyof TranslationDictionary | string,
  fallback?: string,
  lang?: LanguageCode
): string {
  const activeLang = lang || store.getLanguage() || 'en';
  const dict = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
  
  if (key in dict) {
    return (dict as unknown as Record<string, string>)[key];
  }
  
  // If not found in current language dict, check English dict
  const enDict = TRANSLATIONS.en;
  if (key in enDict) {
    return (enDict as unknown as Record<string, string>)[key];
  }

  return fallback || key;
}

/**
 * Universal React hook for language and translation reactivity
 */
export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(store.getLanguage() || 'en');

  useEffect(() => {
    const handleStoreChange = () => {
      const updatedLang = store.getLanguage() || 'en';
      setCurrentLang(updatedLang);
    };
    
    // Check initially
    handleStoreChange();
    const unsubscribe = store.subscribe(handleStoreChange);
    return unsubscribe;
  }, []);

  const translate = useCallback(
    (key: keyof TranslationDictionary | string, fallback?: string): string => {
      return t(key, fallback, currentLang);
    },
    [currentLang]
  );

  return {
    t: translate,
    dictionary: TRANSLATIONS[currentLang] || TRANSLATIONS.en,
    currentLang,
    setLanguage: (lang: LanguageCode) => store.setLanguage(lang)
  };
}
