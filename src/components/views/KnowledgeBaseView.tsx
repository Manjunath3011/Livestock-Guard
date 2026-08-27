import React, { useState, useMemo } from 'react';
import { DISEASES_DATABASE, SYMPTOMS_LIST, DISEASE_VACCINE_LINKS } from '../../data/knowledgeBase';
import { Disease, Species } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Search,
  ShieldAlert,
  AlertTriangle,
  Syringe,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  HeartHandshake,
  Activity,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Droplets,
  Shield,
  Utensils
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUPPORTIVE_CARE' | 'VACCINES' | 'BIOSECURITY'>('OVERVIEW');

  const filteredDiseases = useMemo(() => {
    return DISEASES_DATABASE.filter(d => {
      if (categoryFilter !== 'ALL' && d.category !== categoryFilter) return false;
      if (speciesFilter !== 'ALL' && !d.affectedSpecies.includes(speciesFilter as Species) && !d.affectedSpecies.includes('Other')) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.scientificName.toLowerCase().includes(q) ||
          (d.commonNames && d.commonNames.some(c => c.toLowerCase().includes(q))) ||
          d.causativeAgent.toLowerCase().includes(q) ||
          (d.majorSymptoms && d.majorSymptoms.some(s => s.toLowerCase().includes(q)))
        );
      }
      return true;
    });
  }, [categoryFilter, speciesFilter, searchQuery]);

  const matchingVaccineLink = useMemo(() => {
    if (!selectedDisease) return undefined;
    return DISEASE_VACCINE_LINKS.find(v => v.diseaseId === selectedDisease.id);
  }, [selectedDisease]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            National Veterinary Epidemiological Database
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Clinical Guidance & Pathogen Protocols ({DISEASES_DATABASE.length} Diseases)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            WOAH / FAO / ICAR validated clinical reference featuring verified home supportive care boundaries, critical avoidance rules, and immunization links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Decision-Support Grounded
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search disease, local name, agent, symptom..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="VIRAL">Viral (FMD, LSD, PPR, Rabies...)</option>
            <option value="BACTERIAL">Bacterial (HS, Anthrax, BQ, Brucellosis...)</option>
            <option value="PARASITIC">Parasitic & Protozoal (Theileriosis, Babesiosis...)</option>
            <option value="FUNGAL">Fungal</option>
          </select>

          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Species</option>
            <option value="Cattle">Cattle</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
            <option value="Pig">Pig</option>
            <option value="Poultry">Poultry</option>
            <option value="Horse">Horse</option>
          </select>
        </div>
      </div>

      {/* Disease Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDiseases.map(disease => (
          <div
            key={disease.id}
            onClick={() => {
              setSelectedDisease(disease);
              setActiveTab('OVERVIEW');
            }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    disease.category === 'VIRAL'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : disease.category === 'BACTERIAL'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}
                >
                  {disease.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {disease.zoonotic && (
                    <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200" title="Zoonotic (Human risk)">
                      Zoonotic
                    </span>
                  )}
                  {disease.notifiable && (
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200" title="State Notifiable">
                      Notifiable
                    </span>
                  )}
                  {disease.emergencyPriority === 'HIGH_EMERGENCY' && (
                    <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                      Emergency
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Scientific */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                  {disease.name}
                </h3>
                <p className="text-xs text-slate-500 italic font-serif mt-0.5">{disease.scientificName}</p>
                {disease.commonNames && disease.commonNames.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    Local: {disease.commonNames.join(', ')}
                  </p>
                )}
              </div>

              {/* Major Symptoms Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hallmark Signs</span>
                <div className="flex flex-wrap gap-1">
                  {(disease.majorSymptoms || []).slice(0, 3).map((sym, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[200px]"
                    >
                      {sym}
                    </span>
                  ))}
                  {(disease.majorSymptoms || []).length > 3 && (
                    <span className="text-[10px] text-slate-400 font-medium px-1">
                      +{(disease.majorSymptoms || []).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Meta & Action */}
            <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Species:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                  {disease.affectedSpecies.join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Vaccine:</span>
                <span className="font-semibold flex items-center gap-1">
                  {disease.vaccineAvailable ? (
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                      <Syringe className="w-3 h-3 text-emerald-600" /> Available
                    </span>
                  ) : (
                    <span className="text-slate-400">Biosecurity Focus</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    disease.homeCareLevel === 'EMERGENCY_ONLY'
                      ? 'bg-red-50 text-red-700'
                      : disease.homeCareLevel === 'SUPPORTIVE_AND_VET'
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {disease.homeCareLevel === 'EMERGENCY_ONLY'
                    ? 'Emergency Vet Only'
                    : disease.homeCareLevel === 'SUPPORTIVE_AND_VET'
                    ? 'Supportive + Vet'
                    : 'Limited Home Care'}
                </span>
                <span className="text-xs font-bold text-emerald-700 group-hover:underline inline-flex items-center gap-1">
                  View Protocols →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <Modal
          isOpen={!!selectedDisease}
          onClose={() => setSelectedDisease(null)}
          title={selectedDisease.name}
          subtitle={`${selectedDisease.scientificName} • ${selectedDisease.category} Pathogen`}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-2 pb-1">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Clinical Overview
              </button>
              <button
                onClick={() => setActiveTab('SUPPORTIVE_CARE')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'SUPPORTIVE_CARE'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Supportive Care & Avoidance
              </button>
              <button
                onClick={() => setActiveTab('VACCINES')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'VACCINES'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Syringe className="w-3.5 h-3.5" />
                Vaccine Protocol
              </button>
              <button
                onClick={() => setActiveTab('BIOSECURITY')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'BIOSECURITY'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Biosecurity & Lab Tests
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                {/* Farmer Friendly Box */}
                {selectedDisease.farmerFriendlyExplanation && (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl text-emerald-950">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      Farmer-Friendly Summary
                    </div>
                    <p className="text-xs leading-relaxed">{selectedDisease.farmerFriendlyExplanation}</p>
                  </div>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Causative Agent</span>
                    <span className="font-semibold text-slate-900">{selectedDisease.causativeAgent}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Incubation Period</span>
                    <span className="font-semibold text-slate-900">{selectedDisease.incubationDays || '2-14 days'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Mortality Profile</span>
                    <span className="font-semibold text-rose-700">{selectedDisease.mortalityRateTypical}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Susceptible Species</span>
                    <span className="font-semibold text-slate-900">{selectedDisease.affectedSpecies.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Zoonotic to Humans</span>
                    <span className={`font-bold ${selectedDisease.zoonotic ? 'text-rose-700' : 'text-slate-600'}`}>
                      {selectedDisease.zoonotic ? 'YES (Strict PPE Required)' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">State Notifiable</span>
                    <span className={`font-bold ${selectedDisease.notifiable ? 'text-amber-700' : 'text-slate-600'}`}>
                      {selectedDisease.notifiable ? 'YES (Mandatory Report)' : 'Routine'}
                    </span>
                  </div>
                </div>

                {/* Symptoms Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    Major Hallmark Clinical Signs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(selectedDisease.majorSymptoms || []).map((sym, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/70">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transmission & Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Transmission Routes:</span>
                    <p className="text-slate-700 leading-relaxed">{selectedDisease.transmission}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Productivity Impact:</span>
                    <p className="text-slate-700 leading-relaxed">{selectedDisease.productivityImpact}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SUPPORTIVE CARE & AVOIDANCE */}
            {activeTab === 'SUPPORTIVE_CARE' && (
              <div className="space-y-4">
                {/* Home Care Safety Level Banner */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    selectedDisease.homeCareLevel === 'EMERGENCY_ONLY'
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : selectedDisease.homeCareLevel === 'SUPPORTIVE_AND_VET'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <AlertOctagon className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">
                      Care Guidance Category:{' '}
                      {selectedDisease.homeCareLevel === 'EMERGENCY_ONLY'
                        ? 'EMERGENCY ONLY - Do Not Attempt Home Treatment'
                        : selectedDisease.homeCareLevel === 'SUPPORTIVE_AND_VET'
                        ? 'SUPPORTIVE CARE PERMITTED UNDER VETERINARY OVERSIGHT'
                        : 'LIMITED SUPPORTIVE CARE'}
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5">{selectedDisease.supportiveCare}</p>
                  </div>
                </div>

                {/* Step-by-Step Supportive Care Cards */}
                {selectedDisease.supportiveCareSteps && selectedDisease.supportiveCareSteps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-700" />
                      Approved Supportive Care Steps
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {selectedDisease.supportiveCareSteps.map((step, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 block">{step.title}</span>
                            <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Things to Avoid */}
                {selectedDisease.thingsToAvoid && selectedDisease.thingsToAvoid.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Critical Things to AVOID (Contraindications)
                    </h4>
                    <div className="bg-rose-50/70 border border-rose-200 p-3 rounded-xl space-y-1.5">
                      {selectedDisease.thingsToAvoid.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-rose-950">
                          <span className="text-rose-600 font-bold">•</span>
                          <span className="text-xs leading-relaxed font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flag Emergency Signs */}
                {selectedDisease.emergencySigns && selectedDisease.emergencySigns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Red Flag Signs - Require Immediate Emergency Vet Dispatch
                    </h4>
                    <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl space-y-1.5">
                      {selectedDisease.emergencySigns.map((sign, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-amber-950">
                          <AlertOctagon className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span className="text-xs leading-relaxed">{sign}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: VACCINE PROTOCOL */}
            {activeTab === 'VACCINES' && (
              <div className="space-y-4">
                {selectedDisease.vaccineAvailable ? (
                  <>
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                          <Syringe className="w-4 h-4 text-emerald-700" />
                          {matchingVaccineLink?.vaccineName || selectedDisease.vaccinationInfo || 'Approved Commercial Vaccine'}
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {matchingVaccineLink?.routineOrOutbreak || 'ROUTINE'}
                        </span>
                      </div>
                      <p className="text-emerald-950 text-xs">
                        <strong>Recommended Schedule:</strong> {selectedDisease.vaccineScheduleReference || selectedDisease.vaccinationInfo}
                      </p>
                    </div>

                    {matchingVaccineLink && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Dose & Route</span>
                          <span className="font-semibold text-slate-900">{matchingVaccineLink.doseInformationReference}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Minimum Age</span>
                          <span className="font-semibold text-slate-900">{matchingVaccineLink.minimumAgeMonths} Months</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Booster Protocol</span>
                          <span className="font-semibold text-slate-900">{matchingVaccineLink.boosterInformationReference}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Pregnancy Safety</span>
                          <span className="font-semibold text-slate-900">{matchingVaccineLink.pregnancyNotes}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Contraindications</span>
                          <ul className="text-slate-700 list-disc list-inside mt-0.5 space-y-0.5">
                            {matchingVaccineLink.contraindicationsReference.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-950 text-xs">
                      <strong>Important Principle:</strong> Vaccines provide long-term active immunity in healthy animals. Vaccines are NOT treatments for already infected stock. Never inject live-attenuated vaccines into severely febrile or immunocompromised animals without veterinary guidance.
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center space-y-2">
                    <Shield className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">No Routine Commercial Vaccine Currently Available</h4>
                    <p className="text-slate-500 text-xs max-w-md mx-auto">
                      Prevention for {selectedDisease.name} is achieved primarily through rigorous biosecurity, vector management (fly/tick control), and prompt movement quarantine.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BIOSECURITY & LAB TESTS */}
            {activeTab === 'BIOSECURITY' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    Bio-Containment & Disinfection Actions
                  </h4>
                  <ul className="space-y-1.5">
                    {(selectedDisease.biosecurityRecommendations || []).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedDisease.isolationPeriodDays && (
                    <div className="pt-2 text-xs font-semibold text-slate-800">
                      Recommended Isolation Period: <span className="text-emerald-700 font-bold">{selectedDisease.isolationPeriodDays} Days</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-700" />
                    Laboratory Diagnostic Verification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(selectedDisease.diagnosticMethods || []).map((method, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium">
                        • {method}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDisease.references && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                    <span>
                      Standard Reference: <strong>{selectedDisease.references.sourceName}</strong> ({selectedDisease.references.authority})
                    </span>
                    <span>Reviewed: {selectedDisease.references.lastReviewed}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedDisease(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Close Protocol Reference
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
