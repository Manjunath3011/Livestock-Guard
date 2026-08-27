import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Species,
  SymptomObservation,
  Animal,
  Farm,
  Case,
  TemporaryAnimal,
  HistoricalCaseLink
} from '../../types';
import { SYMPTOMS_LIST, LOCATION_DATA } from '../../data/knowledgeBase';
import { store } from '../../services/store';
import { assessLivestockRisk } from '../../services/riskEngine';
import { extractSymptomsFromNaturalLanguage } from '../../services/aiTriage';
import { RiskBadge } from '../common/RiskBadge';
import { IndiaLocationPicker } from '../common/IndiaLocationPicker';
import { NormalizedLocationSelection } from '../../types/location';
import { indiaLocationService } from '../../services/IndiaLocationService';
import {
  Stethoscope,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  Zap,
  Info,
  Activity,
  Mic,
  MicOff,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  FileSpreadsheet,
  CloudSun,
  ShieldAlert,
  Thermometer,
  Droplets,
  AlertCircle,
  Footprints,
  Wind,
  Plus,
  HeartHandshake,
  Tag,
  History,
  Link2,
  FileText,
  User as UserIcon,
  Check,
  X,
  Search,
  ExternalLink,
  QrCode,
  Clock,
  ArrowRight,
  Building,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportCaseViewProps {
  currentUser: User;
  animals: Animal[];
  farms: Farm[];
  onCaseCreated: (caseId: string) => void;
  onNavigateToVet?: () => void;
}

export const ReportCaseView: React.FC<ReportCaseViewProps> = ({
  currentUser,
  animals,
  farms,
  onCaseCreated,
  onNavigateToVet
}) => {
  // Current Wizard Step (1 to 8)
  const [step, setStep] = useState<number>(1);

  // ==========================================
  // STEP 1: ANIMAL IDENTIFICATION & STATUS
  // ==========================================
  const [animalStatusMode, setAnimalStatusMode] = useState<'UNTAGGED' | 'REGISTERED' | 'HERD'>('UNTAGGED');
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Cattle');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [animalSearchQuery, setAnimalSearchQuery] = useState<string>('');
  
  // Untagged Animal Specific Form State
  const [untaggedBreed, setUntaggedBreed] = useState<string>('Gir Cow');
  const [untaggedAgeStage, setUntaggedAgeStage] = useState<'CALF_KID_LAMB' | 'GROWER_HEIFER' | 'ADULT' | 'SENIOR'>('ADULT');
  const [untaggedAgeYears, setUntaggedAgeYears] = useState<number>(3.5);
  const [untaggedSex, setUntaggedSex] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [untaggedPregnancy, setUntaggedPregnancy] = useState<'NOT_PREGNANT' | 'PREGNANT' | 'LACTATING' | 'DRY' | 'NOT_APPLICABLE'>('NOT_PREGNANT');
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || 'farm_01');
  const [customFarmName, setCustomFarmName] = useState<string>('');
  const [herdIdentifier, setHerdIdentifier] = useState<string>('Dairy Shed A');
  const [groupSize, setGroupSize] = useState<'INDIVIDUAL' | 'SMALL_GROUP' | 'HERD_FLOCK'>('INDIVIDUAL');
  const [customTempTag, setCustomTempTag] = useState<string>('');
  const [permanentTagInput, setPermanentTagInput] = useState<string>('');
  const [shouldAssignPermanentNow, setShouldAssignPermanentNow] = useState<boolean>(false);

  // ==========================================
  // STEP 2: PREVIOUS HEALTH REPORT HISTORY
  // ==========================================
  const [selectedHistoricalCaseId, setSelectedHistoricalCaseId] = useState<string | null>(null);
  const [historyRelationshipType, setHistoryRelationshipType] = useState<'SAME_HERD_ONGOING_CLUSTER' | 'RECURRENCE' | 'SUSPECTED_SPREAD' | 'UNLINKED_NEW_ISSUE'>('UNLINKED_NEW_ISSUE');
  const [historyNotes, setHistoryNotes] = useState<string>('');

  // ==========================================
  // STEP 3: STRUCTURED SYMPTOMS & NLP
  // ==========================================
  const [symptomCategoryFilter, setSymptomCategoryFilter] = useState<string>('ALL');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [nlpMessage, setNlpMessage] = useState<string | null>(null);
  const [customObservationNotes, setCustomObservationNotes] = useState<string>('');

  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, SymptomObservation & { onsetTimeframe?: string; bodyLocation?: string }>>({
    sym_fever: {
      symptomId: 'sym_fever',
      symptomName: 'High Fever / Hyperthermia',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0],
      onsetTimeframe: '1_2_DAYS'
    },
    sym_salivation: {
      symptomId: 'sym_salivation',
      symptomName: 'Excessive Drooling / Frothy Salivation',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0],
      onsetTimeframe: 'TODAY'
    },
    sym_mouth_lesions: {
      symptomId: 'sym_mouth_lesions',
      symptomName: 'Mouth Blisters, Ulcers & Vesicles',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0],
      onsetTimeframe: '1_2_DAYS'
    },
    sym_lameness: {
      symptomId: 'sym_lameness',
      symptomName: 'Severe Lameness & Shifting Weight',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0],
      onsetTimeframe: 'TODAY'
    }
  });

  // ==========================================
  // STEP 4: HERD / HOLDING COUNTS
  // ==========================================
  const [totalAnimals, setTotalAnimals] = useState<number>(35);
  const [affectedCount, setAffectedCount] = useState<number>(4);
  const [healthyCount, setHealthyCount] = useState<number>(31);
  const [recoveredCount, setRecoveredCount] = useState<number>(0);
  const [deadCount, setDeadCount] = useState<number>(0);

  // ==========================================
  // STEP 5: VACCINATION & SENSOR LOCATION
  // ==========================================
  const [vaccinationStatus, setVaccinationStatus] = useState<'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED'>('OVERDUE');
  const [vaccinationCoveragePct, setVaccinationCoveragePct] = useState<number>(65);
  const [locationSourceMode, setLocationSourceMode] = useState<'FARM_INHERITED' | 'GPS_CUSTOM'>('FARM_INHERITED');
  const [customLocationSelection, setCustomLocationSelection] = useState<NormalizedLocationSelection | null>(null);
  const [ownerName, setOwnerName] = useState<string>(currentUser.name);
  const [ownerPhone, setOwnerPhone] = useState<string>(currentUser.phone || '+91 98220 11223');

  // ==========================================
  // SUBMISSION & ESCALATION STATE
  // ==========================================
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [createdTempTag, setCreatedTempTag] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resolved Location Node
  const activeLocation = useMemo(() => {
    if (locationSourceMode === 'GPS_CUSTOM' && customLocationSelection) {
      return {
        stateId: customLocationSelection.stateId,
        stateName: customLocationSelection.stateName,
        districtId: customLocationSelection.districtId,
        districtName: customLocationSelection.districtName,
        blockId: customLocationSelection.subDistrictId || 'sd_in_mh_pune_baramati',
        blockName: customLocationSelection.subDistrictName || 'Baramati',
        villageId: customLocationSelection.villageId || 'vl_in_mh_pune_baramati_malegaon_bk',
        villageName: customLocationSelection.villageName || 'Malegaon Budruk',
        latitude: customLocationSelection.coordinates?.latitude || 18.1524,
        longitude: customLocationSelection.coordinates?.longitude || 74.5768,
        pincode: customLocationSelection.pincode || '413115'
      };
    }

    const farmObj = farms.find(f => f.id === selectedFarmId);
    if (farmObj) {
      const stateObj = indiaLocationService.getStateById(farmObj.stateId);
      const districtObj = indiaLocationService.getDistrictById(farmObj.districtId);
      const subDistrictObj = farmObj.blockId ? indiaLocationService.getSubDistrictById(farmObj.blockId) : undefined;
      const villageObj = farmObj.villageId ? indiaLocationService.getVillageById(farmObj.villageId) : undefined;

      return {
        stateId: farmObj.stateId || 'st_in_mh',
        stateName: farmObj.stateName || stateObj?.name || 'Maharashtra',
        districtId: farmObj.districtId || 'dt_in_mh_pune',
        districtName: farmObj.districtName || districtObj?.name || 'Pune',
        blockId: farmObj.blockId || subDistrictObj?.id || 'sd_in_mh_pune_baramati',
        blockName: farmObj.blockName || subDistrictObj?.name || 'Baramati',
        villageId: farmObj.villageId || villageObj?.id || 'vl_in_mh_pune_baramati_malegaon_bk',
        villageName: farmObj.villageName || villageObj?.name || 'Malegaon Budruk',
        latitude: farmObj.latitude || 18.1524,
        longitude: farmObj.longitude || 74.5768,
        pincode: farmObj.pincode || villageObj?.pincode || '413115'
      };
    }

    return {
      stateId: 'st_in_mh',
      stateName: 'Maharashtra',
      districtId: 'dt_in_mh_pune',
      districtName: 'Pune',
      blockId: 'sd_in_mh_pune_baramati',
      blockName: 'Baramati',
      villageId: 'vl_in_mh_pune_baramati_malegaon_bk',
      villageName: 'Malegaon Budruk',
      latitude: 18.1524,
      longitude: 74.5768,
      pincode: '413115'
    };
  }, [locationSourceMode, customLocationSelection, selectedFarmId, farms]);

  // Derived Nearby Cases & Outbreaks Count
  const existingCases = store.getCases();
  const activeOutbreaks = store.getOutbreaks();
  const weather = store.getWeather();

  const nearbyCasesCount = useMemo(() => {
    return existingCases.filter(c => c.status !== 'RESOLVED').length;
  }, [existingCases]);

  // Auto-generate Temporary Tag preview
  const previewTempTag = useMemo(() => {
    if (customTempTag.trim()) return customTempTag.trim().toUpperCase();
    const pfx = selectedSpecies.slice(0, 3).toUpperCase();
    const rnd = Math.abs(selectedFarmId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100)) % 9000 + 1000;
    return `TEMP-${pfx}-${rnd}`;
  }, [selectedSpecies, selectedFarmId, customTempTag]);

  // Search previous health reports for this farm/herd/owner/village
  const relevantHistoricalReports = useMemo(() => {
    return store.findRelevantFarmHerdHistory({
      farmId: selectedFarmId,
      ownerPhone,
      ownerName,
      villageId: activeLocation.villageId,
      species: selectedSpecies
    });
  }, [selectedFarmId, ownerPhone, ownerName, activeLocation.villageId, selectedSpecies, existingCases]);

  // Automated Morbidity & Affected Calculations
  const calculatedAffectedPct = totalAnimals > 0 ? Math.round((affectedCount / totalAnimals) * 100) : 0;
  const calculatedMortalityPct = totalAnimals > 0 ? Math.round((deadCount / totalAnimals) * 100) : 0;

  // Convert map to array
  const symptomsArray = useMemo(() => Object.values(selectedSymptoms), [selectedSymptoms]);

  // Real-Time Risk Assessment
  const riskAssessment = useMemo(() => {
    return assessLivestockRisk({
      species: selectedSpecies,
      symptoms: symptomsArray,
      affectedCount,
      deadCount,
      latitude: activeLocation.latitude,
      longitude: activeLocation.longitude,
      vaccinationStatus,
      existingCases,
      activeOutbreaks,
      config: store.getSystemConfig()
    });
  }, [selectedSpecies, symptomsArray, affectedCount, deadCount, activeLocation, vaccinationStatus, existingCases, activeOutbreaks]);

  // Voice / NLP AI Triage Handler
  const handleNlpExtract = () => {
    if (!naturalLanguageInput.trim()) return;
    const result = extractSymptomsFromNaturalLanguage(naturalLanguageInput);
    if (result.symptoms.length > 0) {
      const newMap: Record<string, SymptomObservation & { onsetTimeframe?: string; bodyLocation?: string }> = { ...selectedSymptoms };
      result.symptoms.forEach(s => {
        newMap[s.symptomId] = {
          ...s,
          onsetTimeframe: 'TODAY'
        };
      });
      setSelectedSymptoms(newMap);
      setNlpMessage(`Successfully identified and selected ${result.symptoms.length} symptom(s) from description.`);
      setTimeout(() => setNlpMessage(null), 4500);
    }
  };

  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setNaturalLanguageInput('Young heifer showing high fever, blister sores inside mouth, ropy saliva hanging and severe limping since yesterday');
      setTimeout(() => {
        setIsListening(false);
        handleNlpExtract();
      }, 1200);
    } else {
      setIsListening(false);
    }
  };

  // Symptom Selection Helpers
  const toggleSymptom = (sym: (typeof SYMPTOMS_LIST)[0]) => {
    setSelectedSymptoms(prev => {
      const next = { ...prev };
      if (next[sym.id]) {
        delete next[sym.id];
      } else {
        next[sym.id] = {
          symptomId: sym.id,
          symptomName: sym.name,
          severity: 'moderate',
          onsetDate: new Date().toISOString().split('T')[0],
          onsetTimeframe: '1_2_DAYS'
        };
      }
      return next;
    });
  };

  const updateSeverity = (symId: string, severity: 'mild' | 'moderate' | 'severe') => {
    setSelectedSymptoms(prev => {
      if (!prev[symId]) return prev;
      return {
        ...prev,
        [symId]: {
          ...prev[symId],
          severity
        }
      };
    });
  };

  const updateOnsetTimeframe = (symId: string, timeframe: string) => {
    setSelectedSymptoms(prev => {
      if (!prev[symId]) return prev;
      return {
        ...prev,
        [symId]: {
          ...prev[symId],
          onsetTimeframe: timeframe
        }
      };
    });
  };

  // Breed suggestions per species
  const breedSuggestions: Record<Species, string[]> = {
    Cattle: ['Gir Cow', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Kankrej', 'Holstein Friesian Cross', 'Jersey Cross', 'Indigenous Desi'],
    Buffalo: ['Murrah', 'Nili-Ravi', 'Jaffarabadi', 'Surti', 'Mehsana', 'Bhadawari', 'Nagpuri', 'Local Breed'],
    Goat: ['Osmanabadi', 'Black Bengal', 'Jamnapari', 'Beetal', 'Sirohi', 'Barbari', 'Boer Cross', 'Local Desi Goat'],
    Sheep: ['Deccani', 'Marwari Sheep', 'Nellore', 'Mandya', 'Garole', 'Rambouillet Cross', 'Local Sheep'],
    Pig: ['Large White Yorkshire', 'Landrace', 'Duroc', 'Ghungroo', 'Niang Megha', 'Crossbred Pig', 'Desi Swine'],
    Poultry: ['Broiler (Cobb/Ross)', 'Layer (BV300)', 'Aseel Native', 'Kadaknath (Black)', 'Gramapriya', 'Vanaraja', 'Country Desi Bird'],
    Horse: ['Marwari Horse', 'Kathiawari', 'Zanskari', 'Spiti Pony', 'Thoroughbred Cross'],
    Camel: ['Bikaneri', 'Jaisalmeri', 'Kachchhi', 'Mewari', 'Double Humped Bactrian'],
    Other: ['Mixed / Other Livestock']
  };

  // Final Case Submission
  const handleCreateCase = () => {
    setIsSubmitting(true);

    const farmObj = farms.find(f => f.id === selectedFarmId);
    const farmDisplayName = customFarmName.trim() || farmObj?.name || 'Local Farm Holding';

    let registeredTempAnimal: TemporaryAnimal | undefined = undefined;
    let finalAnimalId: string | undefined = undefined;
    let finalAnimalTag: string | undefined = undefined;

    // Handle Untagged Animal Registration
    if (animalStatusMode === 'UNTAGGED') {
      registeredTempAnimal = store.registerTemporaryAnimal({
        customTag: customTempTag.trim() || undefined,
        species: selectedSpecies,
        breed: untaggedBreed,
        ageYears: untaggedAgeYears,
        ageStage: untaggedAgeStage,
        sex: untaggedSex,
        pregnancyStatus: untaggedSex === 'FEMALE' ? untaggedPregnancy : 'NOT_APPLICABLE',
        ownerId: currentUser.id,
        ownerName,
        ownerPhone,
        farmId: selectedFarmId,
        farmName: farmDisplayName,
        herdId: herdIdentifier ? `hrd_${herdIdentifier.toLowerCase().replace(/\s+/g, '_')}` : undefined,
        herdName: herdIdentifier,
        groupSize,
        stateId: activeLocation.stateId,
        districtId: activeLocation.districtId,
        blockId: activeLocation.blockId,
        villageId: activeLocation.villageId,
        villageName: activeLocation.villageName,
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude
      });

      setCreatedTempTag(registeredTempAnimal.temporaryTag);

      // If user provided permanent tag right away, convert it
      if (shouldAssignPermanentNow && permanentTagInput.trim()) {
        const permanentAnimal = store.convertTemporaryToPermanent(
          registeredTempAnimal.id,
          permanentTagInput.trim(),
          `${untaggedBreed} (${registeredTempAnimal.temporaryTag})`
        );
        if (permanentAnimal) {
          finalAnimalId = permanentAnimal.id;
          finalAnimalTag = permanentAnimal.tagNumber;
        }
      }
    } else if (animalStatusMode === 'REGISTERED' && selectedAnimalId) {
      const existingAnm = animals.find(a => a.id === selectedAnimalId);
      finalAnimalId = existingAnm?.id;
      finalAnimalTag = existingAnm?.tagNumber;
    }

    // Prepare Historical Link if selected
    let historicalLink: HistoricalCaseLink | undefined = undefined;
    if (selectedHistoricalCaseId) {
      const histCase = existingCases.find(c => c.id === selectedHistoricalCaseId);
      if (histCase) {
        historicalLink = {
          historicalCaseId: histCase.id,
          historicalCaseNumber: histCase.caseNumber,
          caseDate: histCase.createdAt,
          species: histCase.species,
          reportedSymptoms: histCase.symptoms.map(s => s.symptomName),
          suspectedCondition: histCase.suspectedDiseases[0]?.diseaseName,
          status: histCase.status,
          relationshipType: historyRelationshipType,
          notes: historyNotes.trim() || undefined
        };
      }
    }

    // Create the case
    const newCase = store.createCase({
      animalStatus: animalStatusMode === 'UNTAGGED' ? 'UNTAGGED' : 'REGISTERED',
      species: selectedSpecies,
      animalId: finalAnimalId,
      animalTag: finalAnimalTag,
      temporaryAnimalId: registeredTempAnimal?.id,
      temporaryTag: registeredTempAnimal?.temporaryTag,
      untaggedAnimalProfile: registeredTempAnimal ? {
        breed: registeredTempAnimal.breed,
        ageYears: registeredTempAnimal.ageYears,
        ageStage: registeredTempAnimal.ageStage,
        sex: registeredTempAnimal.sex,
        pregnancyStatus: registeredTempAnimal.pregnancyStatus,
        groupSize: registeredTempAnimal.groupSize
      } : undefined,
      historicalCaseId: selectedHistoricalCaseId || undefined,
      historicalCaseLink: historicalLink,
      herdId: herdIdentifier ? `hrd_${herdIdentifier.toLowerCase().replace(/\s+/g, '_')}` : undefined,
      herdName: herdIdentifier || undefined,
      farmId: selectedFarmId,
      farmName: farmDisplayName,
      ownerName,
      ownerPhone,
      stateId: activeLocation.stateId,
      stateName: activeLocation.stateName,
      districtId: activeLocation.districtId,
      districtName: activeLocation.districtName,
      blockId: activeLocation.blockId,
      villageId: activeLocation.villageId,
      villageName: activeLocation.villageName,
      latitude: activeLocation.latitude,
      longitude: activeLocation.longitude,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterRole: currentUser.role,
      symptoms: symptomsArray,
      naturalLanguageDescription: naturalLanguageInput || customObservationNotes || undefined,
      symptomsStartDate: new Date().toISOString().split('T')[0],
      affectedCount,
      deadCount,
      status: 'NEW',
      priority: riskAssessment.level === 'CRITICAL' ? 'EMERGENCY' : riskAssessment.level === 'HIGH' ? 'URGENT' : 'ROUTINE'
    });

    try {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    setCreatedCaseId(newCase.id);
    setIsSubmitting(false);
    onCaseCreated(newCase.id);
  };

  const speciesOptions: { species: Species; label: string; icon: string }[] = [
    { species: 'Cattle', label: 'Cattle (Cow/Bull)', icon: '🐄' },
    { species: 'Buffalo', label: 'Buffalo', icon: '🐃' },
    { species: 'Goat', label: 'Goat', icon: '🐐' },
    { species: 'Sheep', label: 'Sheep', icon: '🐑' },
    { species: 'Pig', label: 'Pig (Swine)', icon: '🐖' },
    { species: 'Poultry', label: 'Poultry (Birds)', icon: '🐔' },
    { species: 'Horse', label: 'Horse / Equine', icon: '🐎' },
    { species: 'Camel', label: 'Camel', icon: '🐪' }
  ];

  const wizardSteps = [
    { num: 1, name: 'Animal Profile', short: 'Animal' },
    { num: 2, name: 'Previous History', short: 'History' },
    { num: 3, name: 'Disease Symptoms', short: 'Symptoms' },
    { num: 4, name: 'Morbidity Counts', short: 'Counts' },
    { num: 5, name: 'Vaccine & Location', short: 'Location' },
    { num: 6, name: 'Possible Diseases', short: 'Conditions' },
    { num: 7, name: 'Risk & Guidance', short: 'Guidance' },
    { num: 8, name: 'Review & Escalate', short: 'Escalate' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header with Step Wizard Breadcrumb */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
              <Stethoscope className="w-4 h-4" />
              Comprehensive Clinical Ingestion Wizard
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Report Livestock Health Issue
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Step {step} of 8: <strong className="text-slate-900">{wizardSteps[step - 1]?.name}</strong>
            </span>
          </div>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-2">
          {wizardSteps.map(s => {
            const isCompleted = s.num < step;
            const isCurrent = s.num === step;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => isCompleted && setStep(s.num)}
                disabled={!isCompleted && !isCurrent && !createdCaseId}
                className={`text-left p-2 sm:p-2.5 rounded-xl border transition-all text-xs font-bold ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-80 mb-0.5">
                  <span>Step {s.num}</span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-700" />}
                </div>
                <div className="truncate text-[11px] font-extrabold">{s.short}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: ANIMAL IDENTIFICATION & STATUS                                   */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Step 1: Animal Identification & Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select whether this is an untagged/new animal, a registered ear-tagged animal, or a herd group.
            </p>
          </div>

          {/* Status Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Animal Status *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => setAnimalStatusMode('UNTAGGED')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  animalStatusMode === 'UNTAGGED'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="animalStatusMode"
                  checked={animalStatusMode === 'UNTAGGED'}
                  onChange={() => setAnimalStatusMode('UNTAGGED')}
                  className="mt-1 text-emerald-600"
                />
                <div>
                  <span className="font-black text-xs block flex items-center gap-1.5 text-emerald-950">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    New / Untagged Animal
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                    Unregistered livestock; system will assign provisional temporary ID
                  </span>
                </div>
              </label>

              <label
                onClick={() => setAnimalStatusMode('REGISTERED')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  animalStatusMode === 'REGISTERED'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="animalStatusMode"
                  checked={animalStatusMode === 'REGISTERED'}
                  onChange={() => setAnimalStatusMode('REGISTERED')}
                  className="mt-1 text-emerald-600"
                />
                <div>
                  <span className="font-black text-xs block flex items-center gap-1.5 text-emerald-950">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    Existing Registered Animal
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                    Link report to existing 12-digit ear tag / passport
                  </span>
                </div>
              </label>

              <label
                onClick={() => setAnimalStatusMode('HERD')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  animalStatusMode === 'HERD'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="animalStatusMode"
                  checked={animalStatusMode === 'HERD'}
                  onChange={() => setAnimalStatusMode('HERD')}
                  className="mt-1 text-emerald-600"
                />
                <div>
                  <span className="font-black text-xs block flex items-center gap-1.5 text-emerald-950">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    Herd / Holding Group
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                    Report health issue across entire herd or flock holding
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Species Selection Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Livestock Species *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {speciesOptions.map(opt => (
                <button
                  key={opt.species}
                  type="button"
                  onClick={() => {
                    setSelectedSpecies(opt.species);
                    const defaultBreed = breedSuggestions[opt.species]?.[0] || 'Indigenous Desi';
                    setUntaggedBreed(defaultBreed);
                  }}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSpecies === opt.species
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-black'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* UNTAGGED ANIMAL FULL PROFILE FORM */}
          {animalStatusMode === 'UNTAGGED' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Untagged Animal Profile Details
                  </h3>
                </div>
                <div className="bg-emerald-100 text-emerald-900 font-mono text-[11px] font-black px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
                  <span>Provisional ID:</span>
                  <span>{previewTempTag}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Breed / Type */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Breed / Type *</label>
                  <div className="space-y-1.5">
                    <select
                      value={untaggedBreed}
                      onChange={e => setUntaggedBreed(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      {(breedSuggestions[selectedSpecies] || ['Indigenous Desi']).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="Other / Mixed Breed">Other / Mixed Breed</option>
                    </select>
                  </div>
                </div>

                {/* Age Stage & Years */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age / Life Stage *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={untaggedAgeStage}
                      onChange={e => setUntaggedAgeStage(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900"
                    >
                      <option value="CALF_KID_LAMB">Young / Calf / Kid</option>
                      <option value="GROWER_HEIFER">Grower / Heifer</option>
                      <option value="ADULT">Adult Mature</option>
                      <option value="SENIOR">Senior / Old</option>
                    </select>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="25"
                      value={untaggedAgeYears}
                      onChange={e => setUntaggedAgeYears(parseFloat(e.target.value) || 1)}
                      placeholder="Age (Yrs)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Sex */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sex *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUntaggedSex('FEMALE')}
                      className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                        untaggedSex === 'FEMALE'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Female ♀
                    </button>
                    <button
                      type="button"
                      onClick={() => setUntaggedSex('MALE')}
                      className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                        untaggedSex === 'MALE'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Male ♂
                    </button>
                  </div>
                </div>

                {/* Pregnancy / Lactation (if Female) */}
                {untaggedSex === 'FEMALE' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pregnancy & Lactation Status</label>
                    <select
                      value={untaggedPregnancy}
                      onChange={e => setUntaggedPregnancy(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      <option value="NOT_PREGNANT">Not Pregnant</option>
                      <option value="PREGNANT">Pregnant (Late / Mid Gestation)</option>
                      <option value="LACTATING">Lactating / In Milk</option>
                      <option value="DRY">Dry / Non-Lactating</option>
                      <option value="NOT_APPLICABLE">Not Applicable</option>
                    </select>
                  </div>
                )}

                {/* Farm / Household Holding */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farm / Household *</label>
                  <select
                    value={selectedFarmId}
                    onChange={e => setSelectedFarmId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.ownerName})</option>
                    ))}
                    <option value="farm_custom">Other / Custom Holding</option>
                  </select>
                </div>

                {/* Group / Holding Scope */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Animal Group Size</label>
                  <select
                    value={groupSize}
                    onChange={e => setGroupSize(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="INDIVIDUAL">Individual Animal (1 animal)</option>
                    <option value="SMALL_GROUP">Small Group (2-5 animals)</option>
                    <option value="HERD_FLOCK">Herd / Flock Group (&gt;5 animals)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* REGISTERED ANIMAL SELECTION */}
          {animalStatusMode === 'REGISTERED' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Select Registered {selectedSpecies} Ear Tag:
                </label>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search tag number or name..."
                    value={animalSearchQuery}
                    onChange={e => setAnimalSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                {animals
                  .filter(a => a.species === selectedSpecies && (!animalSearchQuery || a.tagNumber.toLowerCase().includes(animalSearchQuery.toLowerCase()) || a.breed.toLowerCase().includes(animalSearchQuery.toLowerCase())))
                  .map(a => {
                    const isSelected = selectedAnimalId === a.id;
                    return (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAnimalId(a.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-100/70 border-emerald-500 font-bold text-emerald-950 ring-1 ring-emerald-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-xs font-black text-slate-900">{a.tagNumber}</div>
                          <div className="text-[11px] text-slate-500">{a.breed} • {a.sex === 'FEMALE' ? 'Female' : 'Male'} ({a.ageYears} yrs)</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              Continue to Previous History Check →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: PREVIOUS FARM / HERD HEALTH HISTORY CHECK                        */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
              <History className="w-4 h-4" />
              Epidemiological Herd Context
            </div>
            <h2 className="text-lg font-black text-slate-900">Step 2: Check Previous Farm / Herd Health Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              We searched previous health records for <strong>{farms.find(f => f.id === selectedFarmId)?.name || 'this holding'}</strong> and nearby livestock in {activeLocation.villageName}.
            </p>
          </div>

          {/* Informational Guidance Box */}
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-950">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-blue-900 font-bold">
                Why check previous health history?
              </strong>
              <p className="text-[11px] opacity-90 leading-relaxed">
                If other animals in this herd recently suffered from high fever, mouth lesions, or diarrhea, linking this report helps veterinary officers track whether this is an ongoing outbreak cluster. <em>Linking history will NOT copy old symptoms or diagnosis—you will record fresh symptoms on the next step.</em>
              </p>
            </div>
          </div>

          {/* Historical Case Reports List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Relevant Previous Health Reports ({relevantHistoricalReports.length} found)
              </label>
              {selectedHistoricalCaseId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHistoricalCaseId(null);
                    setHistoryRelationshipType('UNLINKED_NEW_ISSUE');
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {relevantHistoricalReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relevantHistoricalReports.slice(0, 4).map(histCase => {
                  const isSelected = selectedHistoricalCaseId === histCase.id;
                  const daysAgo = Math.max(1, Math.round((Date.now() - new Date(histCase.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
                  const suspectedCond = histCase.suspectedDiseases[0]?.diseaseName || 'Unspecified Condition';

                  return (
                    <div
                      key={histCase.id}
                      onClick={() => {
                        setSelectedHistoricalCaseId(histCase.id);
                        setHistoryRelationshipType('SAME_HERD_ONGOING_CLUSTER');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-slate-900">{histCase.caseNumber}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                            {daysAgo} days ago ({histCase.createdAt.split('T')[0]})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-800">{histCase.species}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{histCase.affectedCount} affected</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px]">
                            {suspectedCond}
                          </span>
                        </div>

                        {/* Symptoms chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {histCase.symptoms.slice(0, 3).map((sym, i) => (
                            <span key={i} className="text-[9px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                              {sym.symptomName}
                            </span>
                          ))}
                          {histCase.symptoms.length > 3 && (
                            <span className="text-[9px] text-slate-400">+{histCase.symptoms.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 mt-3 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-500">Status: {histCase.status}</span>
                        <div className="flex items-center gap-1 font-bold text-emerald-700">
                          {isSelected ? (
                            <span className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px]">
                              <Check className="w-3 h-3" /> Linked as Context
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 hover:text-emerald-700">Click to link</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900">No Prior Health Incidents Found</h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  No active or historical disease reports found for this holding within the last 90 days. This will be recorded as a fresh, independent health report.
                </p>
              </div>
            )}
          </div>

          {/* Option for Unlinked Independent Issue */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="unlinkedOption"
                name="historyOption"
                checked={!selectedHistoricalCaseId}
                onChange={() => {
                  setSelectedHistoricalCaseId(null);
                  setHistoryRelationshipType('UNLINKED_NEW_ISSUE');
                }}
                className="text-emerald-600"
              />
              <label htmlFor="unlinkedOption" className="text-xs font-bold text-slate-800 cursor-pointer">
                None / New Separate Issue (This animal has an independent, unlinked health condition)
              </label>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Animal Profile
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              Continue to Symptom Collection →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: STRUCTURED SYMPTOMS & AI VOICE/NLP                               */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                  <Activity className="w-4 h-4" />
                  Structured Clinical Observations
                </div>
                <h2 className="text-lg font-black text-slate-900">Step 3: Select Observed Symptoms</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on symptom cards to select. Adjust severity (Mild/Moderate/Severe) and onset timeframe for each.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {symptomsArray.length} Symptoms Selected
              </span>
            </div>
          </div>

          {/* AI Voice & Natural Language Ingestion Box */}
          <div className="bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Describe symptoms in natural language (Voice / Text)</span>
              </div>
              <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-mono">
                AI Clinical Parser
              </span>
            </div>

            <div className="relative">
              <textarea
                value={naturalLanguageInput}
                onChange={e => setNaturalLanguageInput(e.target.value)}
                placeholder="e.g. Cow has high fever, blister sores inside mouth, ropy saliva hanging, and severe limping since yesterday..."
                rows={2}
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 border border-slate-700 rounded-xl p-3 text-xs focus:outline-hidden focus:border-emerald-400"
              />

              <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                  title="Speak symptoms"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-[11px]">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNlpExtract}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Auto-Detect Symptoms
                </button>
              </div>
            </div>

            {nlpMessage && (
              <div className="text-xs text-emerald-300 bg-emerald-950 p-2 rounded-xl border border-emerald-700 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {nlpMessage}
              </div>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'All Symptoms' },
              { id: 'GENERAL', label: 'Fever & General' },
              { id: 'ORAL_FOOT', label: 'Mouth & Hoof' },
              { id: 'RESPIRATORY', label: 'Respiratory & Cough' },
              { id: 'DIGESTIVE', label: 'Gastrointestinal' },
              { id: 'SKIN', label: 'Skin & Scabs' },
              { id: 'NEUROLOGICAL', label: 'Neurological' },
              { id: 'MORTALITY', label: 'Critical / Red Flag' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSymptomCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  symptomCategoryFilter === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Comprehensive Symptom Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {SYMPTOMS_LIST
              .filter(sym => symptomCategoryFilter === 'ALL' || sym.category === symptomCategoryFilter)
              .map(sym => {
                const isSelected = !!selectedSymptoms[sym.id];
                const obs = selectedSymptoms[sym.id];

                return (
                  <div
                    key={sym.id}
                    onClick={() => toggleSymptom(sym)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-400/50'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                          {sym.name}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {sym.description}
                        </p>
                      </div>
                    </div>

                    {/* Severity and Onset Controls */}
                    {isSelected && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="mt-3 pt-2.5 border-t border-emerald-200/60 space-y-2 text-[10px]"
                      >
                        {/* Severity Selector */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">Severity:</span>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                            {(['mild', 'moderate', 'severe'] as const).map(sev => (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => updateSeverity(sym.id, sev)}
                                className={`px-2 py-0.5 rounded font-bold capitalize transition-colors ${
                                  obs?.severity === sev
                                    ? sev === 'severe'
                                      ? 'bg-rose-600 text-white'
                                      : sev === 'moderate'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-emerald-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {sev}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Onset Timeframe */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">Onset:</span>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                            {[
                              { id: 'TODAY', label: 'Today' },
                              { id: '1_2_DAYS', label: '1-2d' },
                              { id: '3_5_DAYS', label: '3-5d' },
                              { id: 'OVER_WEEK', label: '&gt;1w' }
                            ].map(time => (
                              <button
                                key={time.id}
                                type="button"
                                onClick={() => updateOnsetTimeframe(sym.id, time.id)}
                                className={`px-1.5 py-0.5 rounded font-bold text-[9px] transition-colors ${
                                  (obs?.onsetTimeframe || 'TODAY') === time.id
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {time.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to History
            </button>

            <button
              type="button"
              disabled={symptomsArray.length === 0}
              onClick={() => setStep(4)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              Continue to Herd Counts →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: HERD / HOLDING STATUS & COUNTS                                    */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Step 4: Herd Morbidity & Mortality Counts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter total animals on the farm/holding, number currently affected, and any mortalities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Herd Animals *</label>
              <input
                type="number"
                min={1}
                value={totalAnimals}
                onChange={e => setTotalAnimals(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-700 mb-1">Affected (Sick) *</label>
              <input
                type="number"
                min={1}
                value={affectedCount}
                onChange={e => setAffectedCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-amber-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Healthy Remaining</label>
              <input
                type="number"
                min={0}
                value={healthyCount}
                onChange={e => setHealthyCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-700 mb-1">Recovered</label>
              <input
                type="number"
                min={0}
                value={recoveredCount}
                onChange={e => setRecoveredCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-blue-50 border border-blue-300 rounded-xl px-3 py-2 text-xs font-black text-blue-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">Deaths (Mortality)</label>
              <input
                type="number"
                min={0}
                value={deadCount}
                onChange={e => setDeadCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-rose-50 border border-rose-300 rounded-xl px-3 py-2 text-xs font-black text-rose-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Automatic Epidemiological Rate Calculations */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Calculated Herd Morbidity</span>
              <div className="text-2xl font-black text-amber-700 mt-1">{calculatedAffectedPct}%</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{affectedCount} of {totalAnimals} livestock currently presenting symptoms</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Calculated Mortality Rate</span>
              <div className="text-2xl font-black text-rose-700 mt-1">{calculatedMortalityPct}%</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{deadCount} animal deaths recorded in current holding event</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Symptoms
            </button>

            <button
              type="button"
              onClick={() => setStep(5)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              Continue to Location & Vaccination →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: VACCINATION & AUTOMATIC SENSOR LOCATION                          */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Step 5: Vaccination History & Automatic Geographic Sensors</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Check immunization compliance and auto-resolve spatial GPS coordinates and regional cluster proximity.
            </p>
          </div>

          {/* Vaccination Status Section */}
          <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-4">
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Herd Vaccination Status & Coverage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vaccination Compliance</label>
                <select
                  value={vaccinationStatus}
                  onChange={e => setVaccinationStatus(e.target.value as any)}
                  className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="UP_TO_DATE">Up to date (All boosters received)</option>
                  <option value="OVERDUE">Overdue (Past 6-12 months booster interval)</option>
                  <option value="UNVACCINATED">Unvaccinated (Never immunized)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Herd Coverage: <span className="text-blue-700 font-black">{vaccinationCoveragePct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={vaccinationCoveragePct}
                  onChange={e => setVaccinationCoveragePct(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Automatic Location & Spatial Sensor Details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Incident Geographic Location (Pan-India)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Inherit permanent farm coordinates or record a live GPS field location.
                </p>
              </div>

              {/* Source Mode Switcher */}
              <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLocationSourceMode('FARM_INHERITED')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    locationSourceMode === 'FARM_INHERITED'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Farm Holding
                </button>
                <button
                  type="button"
                  onClick={() => setLocationSourceMode('GPS_CUSTOM')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    locationSourceMode === 'GPS_CUSTOM'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Current GPS / Pan-India
                </button>
              </div>
            </div>

            {locationSourceMode === 'FARM_INHERITED' ? (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Inherited Farm Address</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Permanent Holding Location
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-900">
                    {activeLocation.villageName}, {activeLocation.blockName}, {activeLocation.districtName} District, {activeLocation.stateName} - {activeLocation.pincode}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono pt-1 border-t border-slate-100">
                    <span>Lat: <strong>{activeLocation.latitude.toFixed(4)}</strong></span>
                    <span>Long: <strong>{activeLocation.longitude.toFixed(4)}</strong></span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                      GPS Validated
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <IndiaLocationPicker
                  value={customLocationSelection}
                  onChange={setCustomLocationSelection}
                  mode="FULL"
                  title="Pan-India Location Selector (Live GPS / Search / Cascading)"
                />
              </div>
            )}

            {/* Live Auto Detected Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-medium">Nearby active cases in radius:</span>
                <span className="font-black text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded">
                  {nearbyCasesCount} Active Cases
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium">Regional Weather Factor:</span>
                <span className="font-black text-emerald-950 bg-emerald-200/80 px-2 py-0.5 rounded">
                  {weather.temperatureC}°C • {weather.humidityPct}% RH ({weather.rainfallMm}mm)
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Counts
            </button>

            <button
              type="button"
              onClick={() => setStep(6)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              SHOW POSSIBLE CONDITIONS →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: POSSIBLE HEALTH CONDITIONS (DIFFERENTIAL SCREENING)               */}
      {/* ========================================================================= */}
      {step === 6 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
              <Activity className="w-4 h-4" />
              Differential Compatibility Match
            </div>
            <h2 className="text-lg font-black text-slate-900">Step 6: Possible Health Conditions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Conditions ranked by statistical symptom compatibility with the disease matrix.
            </p>
          </div>

          {/* Explicit Screening Disclaimer */}
          <div className="bg-amber-50/80 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-900 font-bold">
                Differential Screening Assessment — NOT a Medical Diagnosis
              </strong>
              <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">
                The disease options shown below represent statistical compatibility scores calculated from your reported symptoms. A final diagnosis requires on-farm clinical examination and laboratory test confirmation by a qualified veterinary doctor.
              </p>
            </div>
          </div>

          {/* Suspected Diseases Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskAssessment.suspectedDiseases.slice(0, 3).map((dis, idx) => (
              <div
                key={dis.diseaseId}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400">RANK #{idx + 1}</span>
                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {dis.screeningScore}% Compatibility
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">{dis.diseaseName}</h4>
                  <p className="text-[11px] text-slate-500 italic">{dis.scientificName}</p>

                  {dis.farmerFriendlyExplanation && (
                    <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                      {dis.farmerFriendlyExplanation}
                    </p>
                  )}

                  {dis.keyDifferentiators.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-600 block mb-1">Key Indicator Signs:</span>
                      <div className="flex flex-wrap gap-1">
                        {dis.keyDifferentiators.map((diff, i) => (
                          <span key={i} className="text-[9px] bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                            {diff}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] flex items-center justify-between font-bold">
                  <span className="text-slate-500">Care Guidance:</span>
                  <span className={`px-2 py-0.5 rounded ${
                    dis.homeCareLevel === 'EMERGENCY_ONLY'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {dis.homeCareLevel === 'EMERGENCY_ONLY' ? 'Vet Only Emergency' : 'Supportive Care Permitted'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Location
            </button>

            <button
              type="button"
              onClick={() => setStep(7)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              CALCULATE RISK & GUIDANCE →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: RISK ASSESSMENT & HEALTH GUIDANCE                                 */}
      {/* ========================================================================= */}
      {step === 7 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                SURVEILLANCE CLINICAL ASSESSMENT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Risk Assessment & Health Guidance
              </h2>
            </div>

            <div className="text-right">
              <RiskBadge level={riskAssessment.level} score={riskAssessment.score} size="lg" />
              <span className="text-xs font-bold text-slate-500 block mt-1">
                Score: {riskAssessment.score} / 100
              </span>
            </div>
          </div>

          {/* Primary Assessment Callout */}
          <div className={`p-5 rounded-2xl border ${
            riskAssessment.level === 'CRITICAL'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : riskAssessment.level === 'HIGH'
              ? 'bg-orange-50 border-orange-300 text-orange-950'
              : riskAssessment.level === 'MODERATE'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {riskAssessment.level === 'HIGH' || riskAssessment.level === 'CRITICAL'
                ? 'High Risk Detected — Urgent Veterinary Escalation Recommended.'
                : riskAssessment.level === 'MODERATE'
                ? 'Moderate Risk Detected — Veterinary Consultation Advised.'
                : 'Low Risk Detected — Routine Biosecurity & Care Monitoring.'}
            </h3>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              Based on the {symptomsArray.length} reported symptoms ({symptomsArray.map(s => s.symptomName).join(', ')}), herd morbidity of {calculatedAffectedPct}%, and {nearbyCasesCount} nearby active surveillance cases.
            </p>
          </div>

          {/* Contributing Evidence Factors */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              WHY THIS RISK? (Contributing Evidence)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {symptomsArray.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>{s.symptomName}</strong> ({s.severity} severity)</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{nearbyCasesCount} similar active reports in 10 km zone</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Herd morbidity is {calculatedAffectedPct}% ({affectedCount} of {totalAnimals} affected)</span>
              </div>
              {selectedHistoricalCaseId && (
                <div className="flex items-center gap-2 sm:col-span-2 text-blue-900 font-semibold">
                  <Link2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Linked to ongoing herd historical report ({historyRelationshipType.replace(/_/g, ' ')})</span>
                </div>
              )}
            </div>
          </div>

          {/* Supportive Care & Immediate First Aid */}
          {riskAssessment.supportiveCare && riskAssessment.supportiveCare.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                SUPPORTIVE CARE & IMMEDIATE FIRST AID
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {riskAssessment.supportiveCare.map((stepItem, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {stepItem.title}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-6">{stepItem.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contraindications & Emergency Red Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl space-y-2.5">
              <h3 className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                CRITICAL THINGS TO AVOID (CONTRAINDICATIONS)
              </h3>
              <ul className="space-y-1.5 text-[11px] text-rose-950">
                {(riskAssessment.thingsToAvoid || [
                  'Do NOT perform home surgery or lance unconfirmed swellings',
                  'Do NOT feed coarse or dry fibrous roughage if mouth blisters are present',
                  'Do NOT move sick animals to communal ponds or grazing lands'
                ]).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl space-y-2.5">
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                EMERGENCY RED FLAGS — CALL VET IMMEDIATELY
              </h3>
              <ul className="space-y-1.5 text-[11px] text-amber-950">
                {(riskAssessment.emergencySigns || [
                  'Uncontrollable bloody discharge or dark tarry blood from rectum',
                  'Extreme hypothermia or rapid continuous decline in body condition',
                  'Severe respiratory gasping with open-mouth breathing',
                  'Prolonged sternal or lateral recumbency (inability to stand)'
                ]).map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-700 font-bold">⚠</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(6)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Conditions
            </button>

            <button
              type="button"
              onClick={() => setStep(8)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              REVIEW & SUBMIT CASE →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 8: FINAL REVIEW, TEMPORARY TAG & ESCALATION                          */}
      {/* ========================================================================= */}
      {step === 8 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              Final Submission & Veterinary Dispatch
            </div>
            <h2 className="text-xl font-black text-slate-900">Step 8: Review & Escalate Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm report details, assign temporary identification tag, and dispatch to surveillance queue.
            </p>
          </div>

          {/* Report Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Animal Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Livestock Identification
              </div>
              <div className="font-black text-sm text-slate-900">{selectedSpecies}</div>
              <div className="text-xs text-slate-600">
                {animalStatusMode === 'UNTAGGED' ? (
                  <>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono text-[11px] block mt-1">
                      {previewTempTag} (Untagged)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {untaggedBreed} • {untaggedSex} • {untaggedAgeYears} yrs
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-slate-900 font-mono block">
                      {animals.find(a => a.id === selectedAnimalId)?.tagNumber || 'Herd Group'}
                    </span>
                    <span className="text-[11px] text-slate-500">Registered livestock holding</span>
                  </>
                )}
              </div>
            </div>

            {/* Holding & Location Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Holding & Location
              </div>
              <div className="font-black text-sm text-slate-900">{activeLocation.villageName}</div>
              <div className="text-xs text-slate-600">
                <span>{activeLocation.blockName}, {activeLocation.districtName}</span>
                <span className="block text-[11px] text-slate-500 mt-1">
                  Owner: {ownerName} ({ownerPhone})
                </span>
              </div>
            </div>

            {/* Triage Priority Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Clinical Risk Triage
              </div>
              <div>
                <RiskBadge level={riskAssessment.level} score={riskAssessment.score} />
              </div>
              <div className="text-[11px] text-slate-600">
                Priority: <strong>{riskAssessment.level === 'CRITICAL' ? 'EMERGENCY' : riskAssessment.level === 'HIGH' ? 'URGENT' : 'ROUTINE'}</strong>
                <span className="block text-slate-500 mt-0.5">
                  Suspected: {riskAssessment.suspectedDiseases[0]?.diseaseName || 'Differential Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Untagged Animal Registration Option */}
          {animalStatusMode === 'UNTAGGED' && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-emerald-600" />
                Provisional Tagging & Registration Options
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                This animal will be saved in the database under provisional temporary tag <strong className="font-mono">{previewTempTag}</strong>. You can print or reference this ID during veterinary visits.
              </p>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldAssignPermanentNow}
                    onChange={e => setShouldAssignPermanentNow(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>I have an official 12-digit ear tag available now to link immediately</span>
                </label>

                {shouldAssignPermanentNow && (
                  <div className="mt-3 max-w-sm">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter 12-Digit Ear Tag Number:</label>
                    <input
                      type="text"
                      placeholder="e.g. IN-MH-2026-9088"
                      value={permanentTagInput}
                      onChange={e => setPermanentTagInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submission Success Box */}
          {createdCaseId && (
            <div className="p-6 bg-emerald-100/80 border border-emerald-300 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-950">
                    Surveillance Health Case Successfully Created!
                  </h3>
                  <div className="font-mono text-xs font-bold text-emerald-800 mt-0.5">
                    Case Number: {createdCaseId} {createdTempTag && `• Temporary Tag: ${createdTempTag}`}
                  </div>
                </div>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed pl-13">
                The local veterinary dispensary officer and field staff in {activeLocation.districtName} have been alerted. You can monitor case follow-ups from your Farmer Dashboard.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(7)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Guidance
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToVet) onNavigateToVet();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                CONTACT LOCAL VETERINARIAN
              </button>

              {!createdCaseId ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateCase}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-7 py-3.5 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-700/25 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Creating Surveillance Case...' : 'CREATE & REPORT CASE'}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  Case Submitted ({createdCaseId})
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
