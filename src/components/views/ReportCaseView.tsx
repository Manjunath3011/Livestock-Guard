import React, { useState, useMemo } from 'react';
import { User, Species, SymptomObservation, Animal, Farm } from '../../types';
import { SYMPTOMS_LIST, LOCATION_DATA } from '../../data/knowledgeBase';
import { store } from '../../services/store';
import { assessLivestockRisk } from '../../services/riskEngine';
import { extractSymptomsFromNaturalLanguage } from '../../services/aiTriage';
import { RiskBadge } from '../common/RiskBadge';
import {
  PawPrint,
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
  Plus
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
  // Current Wizard Step (1 to 5)
  const [step, setStep] = useState<number>(1);

  // STEP 1: Animal & Species Selection
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Cattle');
  const [animalSelectionMode, setAnimalSelectionMode] = useState<'EXISTING' | 'HERD' | 'NEW'>('HERD');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || 'farm_01');
  const [newTagNumber, setNewTagNumber] = useState<string>('');
  const [newBreed, setNewBreed] = useState<string>('Gir Cow');

  // STEP 2: Symptoms & AI NLP
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [nlpMessage, setNlpMessage] = useState<string | null>(null);

  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, SymptomObservation>>({
    sym_fever: {
      symptomId: 'sym_fever',
      symptomName: 'High Fever / Hyperthermia',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0]
    },
    sym_salivation: {
      symptomId: 'sym_salivation',
      symptomName: 'Excessive Drooling / Frothy Salivation',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0]
    },
    sym_mouth_lesions: {
      symptomId: 'sym_mouth_lesions',
      symptomName: 'Mouth Blisters, Ulcers & Vesicles',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0]
    },
    sym_lameness: {
      symptomId: 'sym_lameness',
      symptomName: 'Severe Lameness & Shifting Weight',
      severity: 'moderate',
      onsetDate: new Date().toISOString().split('T')[0]
    }
  });

  // STEP 3: Animal / Herd Counts
  const [totalAnimals, setTotalAnimals] = useState<number>(50);
  const [affectedCount, setAffectedCount] = useState<number>(8);
  const [healthyCount, setHealthyCount] = useState<number>(42);
  const [recoveredCount, setRecoveredCount] = useState<number>(0);
  const [deadCount, setDeadCount] = useState<number>(0);

  // STEP 4: Vaccination + Location
  const [vaccinationStatus, setVaccinationStatus] = useState<'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED'>('OVERDUE');
  const [vaccinationCoveragePct, setVaccinationCoveragePct] = useState<number>(70);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('vl_malegaon_bk');
  const [ownerName, setOwnerName] = useState<string>(currentUser.name);
  const [ownerPhone, setOwnerPhone] = useState<string>(currentUser.phone || '+91 98220 11223');

  // Case Submission Success State
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resolved Location Node
  const activeLocation = useMemo(() => {
    return LOCATION_DATA.find(l => l.villageId === selectedVillageId) || LOCATION_DATA[0];
  }, [selectedVillageId]);

  // Derived Nearby Cases & Outbreaks Count
  const existingCases = store.getCases();
  const activeOutbreaks = store.getOutbreaks();
  const weather = store.getWeather();

  const nearbyCasesCount = useMemo(() => {
    return existingCases.filter(c => c.status !== 'RESOLVED').length;
  }, [existingCases]);

  // Automated Mortality & Affected Calculations
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
      const newMap: Record<string, SymptomObservation> = { ...selectedSymptoms };
      result.symptoms.forEach(s => {
        newMap[s.symptomId] = s;
      });
      setSelectedSymptoms(newMap);
      setNlpMessage(`Successfully extracted ${result.symptoms.length} symptom(s) from your description.`);
      setTimeout(() => setNlpMessage(null), 4000);
    }
  };

  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setNaturalLanguageInput('Cow has high fever, blister ulcers on tongue, ropy saliva and stopped eating');
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
          onsetDate: new Date().toISOString().split('T')[0]
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

  // Final Case Submission
  const handleCreateCase = () => {
    setIsSubmitting(true);

    const farmObj = farms.find(f => f.id === selectedFarmId);

    const newCase = store.createCase({
      species: selectedSpecies,
      animalId: selectedAnimalId || undefined,
      farmId: selectedFarmId,
      farmName: farmObj?.name || 'Local Farm Holding',
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
      naturalLanguageDescription: naturalLanguageInput || undefined,
      symptomsStartDate: new Date().toISOString().split('T')[0],
      affectedCount,
      deadCount,
      status: 'NEW',
      priority: riskAssessment.level === 'CRITICAL' ? 'EMERGENCY' : riskAssessment.level === 'HIGH' ? 'URGENT' : 'ROUTINE'
    });

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    setCreatedCaseId(newCase.id);
    setIsSubmitting(false);
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Step Wizard Breadcrumb */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Stethoscope className="w-4 h-4" />
              Clinical Health Ingestion
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Report Livestock Health Issue
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <span>Step {step} of 5</span>
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {[
            { num: 1, name: 'Animal' },
            { num: 2, name: 'Symptoms' },
            { num: 3, name: 'Counts' },
            { num: 4, name: 'Location' },
            { num: 5, name: 'Risk Assessment' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              disabled={s.num > step && !createdCaseId}
              className={`text-left p-2 rounded-xl border transition-all text-xs font-bold ${
                step === s.num
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : s.num < step
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-pointer'
                  : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-80">Step {s.num}</div>
              <div className="truncate">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT ANIMAL */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Step 1: Select Livestock Species & Identifier</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the affected species and link to an existing ear tag or register as a herd holding.
            </p>
          </div>

          {/* Species Selection Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Animal Species *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {speciesOptions.map(opt => (
                <button
                  key={opt.species}
                  type="button"
                  onClick={() => setSelectedSpecies(opt.species)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSpecies === opt.species
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-black'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Individual vs Herd vs New Tag */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reporting Unit Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                onClick={() => setAnimalSelectionMode('HERD')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  animalSelectionMode === 'HERD'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="unitType"
                  checked={animalSelectionMode === 'HERD'}
                  onChange={() => setAnimalSelectionMode('HERD')}
                  className="mt-0.5 text-emerald-600"
                />
                <div>
                  <span className="font-bold block">Herd / Flock Group</span>
                  <span className="text-[11px] text-slate-500">Report for a group or whole holding</span>
                </div>
              </label>

              <label
                onClick={() => setAnimalSelectionMode('EXISTING')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  animalSelectionMode === 'EXISTING'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="unitType"
                  checked={animalSelectionMode === 'EXISTING'}
                  onChange={() => setAnimalSelectionMode('EXISTING')}
                  className="mt-0.5 text-emerald-600"
                />
                <div>
                  <span className="font-bold block">Registered Animal</span>
                  <span className="text-[11px] text-slate-500">Link to existing ear tag passport</span>
                </div>
              </label>

              <label
                onClick={() => setAnimalSelectionMode('NEW')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  animalSelectionMode === 'NEW'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="unitType"
                  checked={animalSelectionMode === 'NEW'}
                  onChange={() => setAnimalSelectionMode('NEW')}
                  className="mt-0.5 text-emerald-600"
                />
                <div>
                  <span className="font-bold block">New Untagged Animal</span>
                  <span className="text-[11px] text-slate-500">Record new temporary ear tag ID</span>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Dropdown for Existing Animal */}
          {animalSelectionMode === 'EXISTING' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Registered {selectedSpecies} Ear Tag:
              </label>
              <select
                value={selectedAnimalId}
                onChange={e => setSelectedAnimalId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="">-- Choose registered animal --</option>
                {animals
                  .filter(a => a.species === selectedSpecies)
                  .map(a => (
                    <option key={a.id} value={a.id}>
                      Tag: {a.tagNumber} ({a.breed} - Owner: {a.ownerName})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {animalSelectionMode === 'NEW' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Tag Number</label>
                <input
                  type="text"
                  placeholder="e.g. IN-MH-2026-9044"
                  value={newTagNumber}
                  onChange={e => setNewTagNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Breed / Variety</label>
                <input
                  type="text"
                  value={newBreed}
                  onChange={e => setNewBreed(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              Continue to Symptoms →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SYMPTOMS & NLP */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Step 2: Select Observed Symptoms</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on symptom cards to select. Adjust severity level for each observed sign.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {symptomsArray.length} Selected
              </span>
            </div>
          </div>

          {/* AI Voice & Natural Language Ingestion Box */}
          <div className="bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Describe symptoms in your own words (Voice / Text)</span>
              </div>
              <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-mono">
                AI Triage NLP
              </span>
            </div>

            <div className="relative">
              <textarea
                value={naturalLanguageInput}
                onChange={e => setNaturalLanguageInput(e.target.value)}
                placeholder="e.g. Cow has high fever, blister sores inside mouth, ropy saliva hanging and limping badly..."
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
                  Extract
                </button>
              </div>
            </div>

            {nlpMessage && (
              <div className="text-xs text-emerald-300 bg-emerald-950 p-2 rounded-xl border border-emerald-700 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {nlpMessage}
              </div>
            )}
          </div>

          {/* Comprehensive Symptom Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {SYMPTOMS_LIST.map(sym => {
              const isSelected = !!selectedSymptoms[sym.id];
              const obs = selectedSymptoms[sym.id];

              return (
                <div
                  key={sym.id}
                  onClick={() => toggleSymptom(sym)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-400/50'
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
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
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

                  {/* Severity Adjuster */}
                  {isSelected && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-[10px]"
                    >
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
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Animal
            </button>

            <button
              type="button"
              disabled={symptomsArray.length === 0}
              onClick={() => setStep(3)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              Continue to Herd Status →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ANIMAL / HERD STATUS */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Step 3: Animal / Herd Morbidity & Mortality Counts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the counts across your holding. Morbidity and mortality rates will be automatically computed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Animals in Herd *</label>
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
              <span className="text-[11px] font-bold text-slate-500 uppercase">Calculated Morbidity (Affected %)</span>
              <div className="text-2xl font-black text-amber-700 mt-1">{calculatedAffectedPct}%</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{affectedCount} out of {totalAnimals} animals showing symptoms</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Calculated Mortality Rate (%)</span>
              <div className="text-2xl font-black text-rose-700 mt-1">{calculatedMortalityPct}%</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{deadCount} animal deaths recorded</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Symptoms
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              Continue to Location & Vaccination →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: VACCINATION + LOCATION */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Step 4: Vaccination History & Automatic Geographic Location</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Check immunization compliance, auto-resolve spatial GPS coordinates and regional cluster proximity.
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

          {/* Automatic Location & Weather Sensor Details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Location & Spatial Sensor Detection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Village *</label>
                <select
                  value={selectedVillageId}
                  onChange={e => setSelectedVillageId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  {LOCATION_DATA.map(loc => (
                    <option key={loc.villageId} value={loc.villageId}>
                      {loc.villageName} ({loc.districtName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Block / Taluka</label>
                <input
                  type="text"
                  readOnly
                  value={activeLocation.blockName}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  readOnly
                  value={activeLocation.districtName}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GPS Coordinates</label>
                <input
                  type="text"
                  readOnly
                  value={`${activeLocation.latitude.toFixed(4)}, ${activeLocation.longitude.toFixed(4)}`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-700"
                />
              </div>
            </div>

            {/* Live Auto Detected Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-medium">Nearby cases within 5-10 km:</span>
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
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Status
            </button>

            <button
              type="button"
              onClick={() => setStep(5)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-7 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              RUN RISK ASSESSMENT ENGINE →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: RISK ASSESSMENT RESULTS SCREEN */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8 animate-in fade-in">
          {/* Result Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                SURVEILLANCE CLINICAL ASSESSMENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Livestock Health Risk Assessment
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Computed by Automated Biosecurity Epidemiological Risk Engine
              </p>
            </div>

            <div className="text-right">
              <RiskBadge level={riskAssessment.level} score={riskAssessment.score} size="lg" />
              <span className="text-xs font-bold text-slate-500 block mt-1">
                Score: {riskAssessment.score} / 100
              </span>
            </div>
          </div>

          {/* Primary Assessment Callout */}
          <div className={`p-5 sm:p-6 rounded-2xl border ${
            riskAssessment.level === 'CRITICAL'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : riskAssessment.level === 'HIGH'
              ? 'bg-orange-50 border-orange-300 text-orange-950'
              : riskAssessment.level === 'MODERATE'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <h3 className="text-lg font-black flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {riskAssessment.level === 'HIGH' || riskAssessment.level === 'CRITICAL'
                ? 'High Risk Detected — Urgent Veterinary Assessment Recommended.'
                : riskAssessment.level === 'MODERATE'
                ? 'Moderate Risk Detected — Veterinary Consultation Advised.'
                : 'Low Risk Detected — Routine Biosecurity Monitoring.'}
            </h3>
            <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
              Based on the reported symptoms ({symptomsArray.map(s => s.symptomName).join(', ')}), herd morbidity of {calculatedAffectedPct}%, and {nearbyCasesCount} nearby active cases.
            </p>
          </div>

          {/* 1. POSSIBLE HEALTH CONDITIONS */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              POSSIBLE HEALTH CONDITIONS (Differential Screening)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskAssessment.suspectedDiseases.slice(0, 3).map((dis, idx) => (
                <div
                  key={dis.diseaseId}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400">RANK #{idx + 1}</span>
                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {dis.screeningScore}% Risk
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">{dis.diseaseName}</h4>
                  <p className="text-[11px] text-slate-500 italic">{dis.scientificName}</p>

                  {dis.keyDifferentiators.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 block mb-1">Key Indicators:</span>
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
              ))}
            </div>
          </div>

          {/* 2. WHY THIS RISK? (Contributing Factors) */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
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
                <span>Vaccination coverage is {vaccinationCoveragePct}% ({vaccinationStatus})</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Morbidity rate is {calculatedAffectedPct}% ({affectedCount} of {totalAnimals} affected)</span>
              </div>
            </div>
          </div>

          {/* 3. RECOMMENDED NEXT STEPS */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              RECOMMENDED NEXT STEPS
            </h3>

            <div className="space-y-2.5">
              {[
                { step: '1', title: 'Contact a veterinary professional immediately', desc: 'Notify local field veterinarian for on-farm clinical examination and diagnosis.' },
                { step: '2', title: 'Isolate affected animals', desc: 'Separate sick livestock from the rest of the herd in an isolated shed.' },
                { step: '3', title: 'Follow appropriate biosecurity measures', desc: 'Disinfect entry gates, footwear, and feeding troughs with recommended Virkon or sodium carbonate.' },
                { step: '4', title: 'Avoid unnecessary animal movement', desc: 'Do not transport animals or sell livestock at weekly markets until cleared.' },
                { step: '5', title: 'Arrange veterinary / sample assessment if advised', desc: 'Facilitate diagnostic fluid/swab collection for lab confirmation.' }
              ].map(rec => (
                <div key={rec.step} className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex items-start gap-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {rec.step}
                  </span>
                  <div>
                    <strong className="text-slate-900 block">{rec.title}</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Clinical Disclaimer */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 text-[11px] text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Official Disclaimer:</strong> This is a screening/risk assessment and does not replace examination or laboratory confirmation by a qualified veterinary professional.
            </span>
          </div>

          {/* Case Submission & Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ← Back to Details
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToVet) onNavigateToVet();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                CONTACT VETERINARIAN
              </button>

              {!createdCaseId ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateCase}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-700/25 transition-all transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Creating Surveillance Case...' : 'CREATE & REPORT CASE'}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Case Created: {createdCaseId}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
