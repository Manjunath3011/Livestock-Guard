import React, { useState } from 'react';
import { MortalityReport, Animal, Farm, User, Species } from '../../types';
import { store } from '../../services/store';
import { Modal } from '../common/Modal';
import { Skull, PlusCircle, AlertTriangle, ShieldAlert, MapPin, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MortalityViewProps {
  mortalities: MortalityReport[];
  animals: Animal[];
  farms: Farm[];
  currentUser: User;
}

export const MortalityView: React.FC<MortalityViewProps> = ({
  mortalities,
  animals,
  farms,
  currentUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [species, setSpecies] = useState<Species>('Buffalo');
  const [deadCount, setDeadCount] = useState<number>(1);
  const [affectedCount, setAffectedCount] = useState<number>(1);
  const [suspectedCause, setSuspectedCause] = useState('Anthrax (Sudden Peracute Hemorrhagic Death)');
  const [symptomNotes, setSymptomNotes] = useState('Dark unclotted blood from nostrils, sudden collapse.');
  const [disposalMethod, setDisposalMethod] = useState<'BURIAL_WITH_LIME' | 'INCINERATION' | 'RENDERING'>('BURIAL_WITH_LIME');
  const [necropsyForbidden, setNecropsyForbidden] = useState(true);

  const handleReportMortality = (e: React.FormEvent) => {
    e.preventDefault();

    store.createMortalityReport({
      species,
      farmId: farms?.[0]?.id || 'farm_01',
      farmName: farms?.[0]?.name || 'Local Village Unit',
      ownerName: currentUser?.name || 'Farmer',
      ownerPhone: currentUser?.phone || '+91 98220 11223',
      stateName: 'Maharashtra',
      districtName: 'Pune',
      villageName: 'Malegaon Budruk',
      latitude: 18.1524,
      longitude: 74.5768,
      dateOfDeath: new Date().toISOString().split('T')[0],
      deadCount,
      affectedCount,
      suspectedCause,
      symptomsBeforeDeath: [symptomNotes],
      reportedBy: currentUser?.name || 'Reporter',
      reportedByRole: currentUser?.role || 'FARMER',
      necropsyConducted: !necropsyForbidden,
      necropsyFindings: necropsyForbidden
        ? 'STRICT NO-NECROPSY: Suspicion of spore-forming Anthrax. Opened carcass forbidden.'
        : 'Post-mortem conducted by field vet under standard PPE.',
      carcassDisposalMethod: disposalMethod
    });

    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {}

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
            <Skull className="w-4 h-4" />
            Mortality Signal Surveillance & Carcass Bio-Safety
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Mortality Reports ({(mortalities || []).length} Incident Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immediate notification of sudden deaths, Anthrax hemorrhagic signals and deep burial biosafety compliance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-rose-700/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Report Animal Mortality Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(mortalities || []).map(m => (
          <div
            key={m.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-rose-300 transition-all"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {m.reportCode}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {m.deadCount} {m.species} Deceased
                </h3>
                <p className="text-xs text-slate-500">
                  {m.villageName}, {m.districtName} • Date: {m.dateOfDeath}
                </p>
              </div>

              {m.outbreakTriggered && (
                <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-pulse">
                  Outbreak Signal
                </span>
              )}
            </div>

            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200 text-xs space-y-1">
              <span className="font-bold text-rose-950">Suspected Cause:</span>
              <p className="text-rose-900">{m.suspectedCause}</p>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Disposal Method:</span>
                <span className="font-semibold text-slate-800">{m.carcassDisposalMethod.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reporter:</span>
                <span className="font-semibold text-slate-800">{m.reportedBy} ({m.reportedByRole})</span>
              </div>
            </div>

            {m.necropsyFindings && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Biosecurity & Post-Mortem Note:</span>
                <p>{m.necropsyFindings}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Log Mortality Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Livestock Mortality Event"
        subtitle="Mandatory reporting of peracute animal deaths and carcass biosafety protocols."
        maxWidth="lg"
      >
        <form onSubmit={handleReportMortality} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Species *</label>
              <select
                value={species}
                onChange={e => setSpecies(e.target.value as Species)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
              >
                <option value="Buffalo">Buffalo</option>
                <option value="Cattle">Cattle</option>
                <option value="Goat">Goat</option>
                <option value="Sheep">Sheep</option>
                <option value="Pig">Pig</option>
                <option value="Poultry">Poultry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Deaths *</label>
              <input
                type="number"
                min={1}
                value={deadCount}
                onChange={e => setDeadCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Suspected Cause / Syndrome *</label>
              <input
                type="text"
                required
                value={suspectedCause}
                onChange={e => setSuspectedCause(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Pre-Mortem Signs & Clinical Observations</label>
              <textarea
                rows={2}
                value={symptomNotes}
                onChange={e => setSymptomNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Carcass Disposal Protocol *</label>
              <select
                value={disposalMethod}
                onChange={e => setDisposalMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
              >
                <option value="BURIAL_WITH_LIME">Deep Burial with Quicklime (6+ Feet)</option>
                <option value="INCINERATION">Complete High-Heat Incineration</option>
                <option value="RENDERING_PLANT">Authorized Bio-Secure Rendering Plant</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Submit Mortality Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
