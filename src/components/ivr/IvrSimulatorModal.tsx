import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { store } from '../../services/store';
import { Phone, Mic, PhoneCall, PhoneOff, Volume2, CheckCircle2, Bot, Globe } from 'lucide-react';
import { Species } from '../../types';

interface IvrSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IvrSimulatorModal: React.FC<IvrSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [callState, setCallState] = useState<'IDLE' | 'RINGING' | 'CONNECTED' | 'COMPLETED'>('IDLE');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'kn' | 'te'>('en');
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Cattle');
  const [reportedSymptoms, setReportedSymptoms] = useState<string[]>([]);
  const [affectedCount, setAffectedCount] = useState<number>(1);
  const [submittedCaseNum, setSubmittedCaseNum] = useState<string>('');

  const ivrPrompts: Record<string, { prompt: string; options: { key: string; label: string; action: () => void }[] }[]> = {
    en: [
      {
        prompt: 'Welcome to Livestock Guard National Toll-Free Disease Reporting Hotline (1800-419-VET). Please select your language. Press 1 for English, 2 for Hindi, 3 for Kannada, 4 for Telugu.',
        options: [
          { key: '1', label: 'English', action: () => { setSelectedLang('en'); setCurrentStep(1); } },
          { key: '2', label: 'हिंदी (Hindi)', action: () => { setSelectedLang('hi'); setCurrentStep(1); } },
          { key: '3', label: 'ಕನ್ನಡ (Kannada)', action: () => { setSelectedLang('kn'); setCurrentStep(1); } },
          { key: '4', label: 'తెలుగు (Telugu)', action: () => { setSelectedLang('te'); setCurrentStep(1); } }
        ]
      },
      {
        prompt: 'Please select the affected livestock animal species. Press 1 for Cattle (Cow), 2 for Buffalo, 3 for Goat or Sheep, 4 for Poultry.',
        options: [
          { key: '1', label: 'Cattle (Cow)', action: () => { setSelectedSpecies('Cattle'); setCurrentStep(2); } },
          { key: '2', label: 'Buffalo', action: () => { setSelectedSpecies('Buffalo'); setCurrentStep(2); } },
          { key: '3', label: 'Goat / Sheep', action: () => { setSelectedSpecies('Goat'); setCurrentStep(2); } },
          { key: '4', label: 'Poultry', action: () => { setSelectedSpecies('Poultry'); setCurrentStep(2); } }
        ]
      },
      {
        prompt: 'What primary symptoms are observed? Press 1 for High Fever and Mouth/Foot sores, 2 for Skin Nodules/Lumps, 3 for Severe Diarrhea or Sudden Death.',
        options: [
          { key: '1', label: 'Fever + Mouth/Foot sores (FMD signs)', action: () => { setReportedSymptoms(['sym_fever', 'sym_mouth_lesions', 'sym_salivation', 'sym_lameness']); setCurrentStep(3); } },
          { key: '2', label: 'Hard Skin Lumps & Glands (LSD signs)', action: () => { setReportedSymptoms(['sym_skin_nodules', 'sym_swollen_lymph', 'sym_fever']); setCurrentStep(3); } },
          { key: '3', label: 'Throat Swelling / Acute Death (HS/Anthrax)', action: () => { setReportedSymptoms(['sym_edema', 'sym_sudden_death', 'sym_breathing_diff']); setCurrentStep(3); } }
        ]
      },
      {
        prompt: 'How many animals are currently symptomatic or sick? Press 1 for Single animal, 2 for 2 to 5 animals, 3 for More than 5 animals.',
        options: [
          { key: '1', label: '1 animal affected', action: () => { setAffectedCount(1); finalizeIvrReport(1); } },
          { key: '2', label: '2 to 5 animals affected', action: () => { setAffectedCount(3); finalizeIvrReport(3); } },
          { key: '3', label: 'More than 5 animals (Outbreak warning)', action: () => { setAffectedCount(7); finalizeIvrReport(7); } }
        ]
      }
    ],
    hi: [
      {
        prompt: 'लाइवस्टॉक गार्ड राष्ट्रीय पशु रोग टोल-फ्री हेल्पलाइन (1800-419-VET) में आपका स्वागत है। भाषा चुनने के लिए 1 दबाएं अंग्रेजी, 2 हिंदी, 3 कन्नड़, 4 तेलुगु।',
        options: [
          { key: '1', label: 'English', action: () => { setSelectedLang('en'); setCurrentStep(1); } },
          { key: '2', label: 'हिंदी (Hindi)', action: () => { setSelectedLang('hi'); setCurrentStep(1); } },
          { key: '3', label: 'ಕನ್ನಡ (Kannada)', action: () => { setSelectedLang('kn'); setCurrentStep(1); } },
          { key: '4', label: 'తెలుగు (Telugu)', action: () => { setSelectedLang('te'); setCurrentStep(1); } }
        ]
      },
      {
        prompt: 'कृपया बीमार पशु की प्रजाति चुनें। गाय के लिए 1 दबाएं, भैंस के लिए 2, बकरी/भेड़ के लिए 3, मुर्गी के लिए 4।',
        options: [
          { key: '1', label: 'गाय (Cattle)', action: () => { setSelectedSpecies('Cattle'); setCurrentStep(2); } },
          { key: '2', label: 'भैंस (Buffalo)', action: () => { setSelectedSpecies('Buffalo'); setCurrentStep(2); } },
          { key: '3', label: 'बकरी / भेड़ (Goat/Sheep)', action: () => { setSelectedSpecies('Goat'); setCurrentStep(2); } },
          { key: '4', label: 'कुक्कुट (Poultry)', action: () => { setSelectedSpecies('Poultry'); setCurrentStep(2); } }
        ]
      },
      {
        prompt: 'मुख्य लक्षण क्या दिखाई दे रहे हैं? मुंह-खुर के छाले और लार के लिए 1, त्वचा की गांठों के लिए 2, गले में सूजन या अचानक मृत्यु के लिए 3 दबाएं।',
        options: [
          { key: '1', label: 'मुंह-खुर छाले + लार (खुरपका-मुंहपका)', action: () => { setReportedSymptoms(['sym_fever', 'sym_mouth_lesions', 'sym_salivation', 'sym_lameness']); setCurrentStep(3); } },
          { key: '2', label: 'त्वचा में गांठे (लम्पी रोग)', action: () => { setReportedSymptoms(['sym_skin_nodules', 'sym_swollen_lymph', 'sym_fever']); setCurrentStep(3); } },
          { key: '3', label: 'गलगोटू सूजन / अचानक मौत (गलघोंटू)', action: () => { setReportedSymptoms(['sym_edema', 'sym_sudden_death', 'sym_breathing_diff']); setCurrentStep(3); } }
        ]
      },
      {
        prompt: 'कितने पशु बीमार हैं? 1 पशु के लिए 1, 2 से 5 पशुओं के लिए 2, 5 से अधिक के लिए 3 दबाएं।',
        options: [
          { key: '1', label: '1 पशु प्रभावित', action: () => { setAffectedCount(1); finalizeIvrReport(1); } },
          { key: '2', label: '2 से 5 पशु प्रभावित', action: () => { setAffectedCount(3); finalizeIvrReport(3); } },
          { key: '3', label: '5 से अधिक पशु (गंभीर प्रकोप)', action: () => { setAffectedCount(6); finalizeIvrReport(6); } }
        ]
      }
    ]
  };

  const finalizeIvrReport = (count: number) => {
    const newCase = store.createCase({
      species: selectedSpecies,
      ownerName: 'IVR Voice Caller (Rural Farmer)',
      ownerPhone: '+91 98000 12345',
      farmId: 'farm_01',
      farmName: 'Rural IVR Ingestion',
      stateId: 'st_mah',
      stateName: 'Maharashtra',
      districtId: 'dt_pune',
      districtName: 'Pune',
      blockId: 'bk_baramati',
      villageId: 'vl_malegaon_bk',
      villageName: 'Malegaon Budruk',
      latitude: 18.1524,
      longitude: 74.5768,
      reporterId: 'usr_farmer_1',
      reporterName: 'Automated IVR Ingestion Gateway',
      reporterRole: 'FARMER',
      symptoms: (reportedSymptoms.length > 0 ? reportedSymptoms : ['sym_fever', 'sym_salivation', 'sym_mouth_lesions']).map(s => ({
        symptomId: s,
        symptomName: s === 'sym_fever' ? 'High Fever' : s === 'sym_mouth_lesions' ? 'Mouth Blisters' : 'Clinical Symptom',
        severity: 'severe',
        onsetDate: new Date().toISOString().split('T')[0]
      })),
      naturalLanguageDescription: `Automated Report generated via Toll-Free IVR Voice Gateway (Language: ${selectedLang.toUpperCase()}).`,
      symptomsStartDate: new Date().toISOString().split('T')[0],
      affectedCount: count,
      deadCount: 0,
      status: 'NEW',
      priority: 'URGENT'
    });

    setSubmittedCaseNum(newCase.caseNumber);
    setCallState('COMPLETED');
  };

  const startCall = () => {
    setCallState('RINGING');
    setTimeout(() => {
      setCallState('CONNECTED');
      setCurrentStep(0);
    }, 1200);
  };

  const endCall = () => {
    setCallState('IDLE');
    setCurrentStep(0);
  };

  const activeLangPrompts = ivrPrompts[selectedLang] || ivrPrompts.en;
  const currentPromptObj = activeLangPrompts[currentStep] || activeLangPrompts[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Toll-Free Voice IVR Assistant (1800-419-VET)"
      subtitle="Interactive Voice Response architecture allowing feature-phone & offline rural farmers to report livestock diseases."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Architecture Info Header */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              Telecom Integration-Ready (Asterisk / Twilio / Exotel Compatible)
            </p>
            <p>
              Provides automated multilingual voice tree triage for non-smartphone farmers with DTMF tone & speech-to-text ingestion directly connected to the central surveillance risk engine.
            </p>
          </div>
        </div>

        {/* Interactive Phone Simulator Interface */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          {callState === 'IDLE' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Phone className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">National Veterinary Hotline Simulator</h4>
                <p className="text-xs text-slate-400 mt-1">Dial 1800-419-VET (Toll-Free 24/7)</p>
              </div>
              <button
                onClick={startCall}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-emerald-600/30 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" /> Start Simulated Voice Call
              </button>
            </div>
          )}

          {callState === 'RINGING' && (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-ping">
                <PhoneCall className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-amber-300">Connecting to IVR Voice Server Gateway...</p>
            </div>
          )}

          {callState === 'CONNECTED' && (
            <div className="space-y-5">
              {/* Call Status Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">CALL CONNECTED (00:32)</span>
                </div>
                <button
                  onClick={endCall}
                  className="flex items-center gap-1.5 bg-rose-600/80 hover:bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                >
                  <PhoneOff className="w-3.5 h-3.5" /> End Call
                </button>
              </div>

              {/* IVR Voice Prompt Output */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-2">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>Automated Voice Prompt (Step {currentStep + 1} of {activeLangPrompts.length})</span>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed font-sans italic bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  "{currentPromptObj.prompt}"
                </p>
              </div>

              {/* Simulated DTMF Keypad Options */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Press Key on Keypad to Respond:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentPromptObj.options.map(opt => (
                    <button
                      key={opt.key}
                      onClick={opt.action}
                      className="flex items-center gap-3 bg-slate-800 hover:bg-emerald-900/60 text-left p-3 rounded-xl border border-slate-700 hover:border-emerald-500 transition-all text-xs cursor-pointer group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-slate-700 group-hover:bg-emerald-600 text-slate-100 font-bold flex items-center justify-center text-sm font-mono shrink-0 transition-colors">
                        {opt.key}
                      </span>
                      <span className="font-medium text-slate-200 group-hover:text-emerald-100">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {callState === 'COMPLETED' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-200">IVR Case Ingestion Complete!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  The audio submission has been converted into a structured clinical case.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl text-left max-w-md mx-auto text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Generated Case #:</span>
                  <span className="font-mono font-bold text-emerald-400">{submittedCaseNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Species:</span>
                  <span className="font-semibold text-slate-200">{selectedSpecies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Affected Count:</span>
                  <span className="font-semibold text-slate-200">{affectedCount} animals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Triage Status:</span>
                  <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                    NEW / VET NOTIFIED
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={startCall}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Make Another IVR Call
                </button>
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Close & View in Triage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
